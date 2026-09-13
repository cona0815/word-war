#!/usr/bin/env node

// Opt-in smoke test for a deployed GAS Web App. It mutates only the explicitly
// supplied dedicated QA account, and refuses to run without a mutation gate.

const required = [
  "GAS_URL",
  "GAS_ADMIN_TOKEN",
  "GAS_TEST_ACCOUNT",
  "GAS_TEST_PASSWORD",
  "GAS_TEST_NICKNAME",
  "GAS_ALLOW_MUTATION"
];

const missing = required.filter(name => !String(process.env[name] || "").trim());
if (missing.length) {
  console.error(`Refusing live GAS QA: missing ${missing.join(", ")}.`);
  console.error("Use a dedicated test account and set GAS_ALLOW_MUTATION=YES explicitly.");
  process.exit(2);
}

if (process.env.GAS_ALLOW_MUTATION !== "YES") {
  console.error("Refusing live GAS QA: GAS_ALLOW_MUTATION must be exactly YES.");
  process.exit(2);
}

const gasUrl = new URL(process.env.GAS_URL);
if (gasUrl.protocol !== "https:" || !/^script\.google(?:usercontent)?\.com$/i.test(gasUrl.hostname)) {
  console.error("Refusing live GAS QA: GAS_URL must be an HTTPS Google Apps Script Web App URL.");
  process.exit(2);
}

const account = String(process.env.GAS_TEST_ACCOUNT).trim();
const password = String(process.env.GAS_TEST_PASSWORD).trim();
const nickname = String(process.env.GAS_TEST_NICKNAME).trim();
if (!/^\d{5}$/.test(account) || !/^\d{5}$/.test(password)) {
  console.error("Refusing live GAS QA: test account and password must each be five digits.");
  process.exit(2);
}
if (account === "50101") {
  console.error("Refusing live GAS QA: 50101 is reserved as the documentation example, not a QA account.");
  process.exit(2);
}

const stageMinimums = [0, 76, 51, 68, 64, 50, 43, 25, 25];
const checks = [];
let sessionToken = "";
let profile = null;

function pass(label) {
  checks.push({ label, ok: true });
  console.log(`PASS ${label}`);
}

function fail(label, error) {
  checks.push({ label, ok: false });
  console.error(`FAIL ${label}: ${error instanceof Error ? error.message : String(error)}`);
}

async function requestJson(method, body, query = {}) {
  const url = new URL(gasUrl);
  Object.entries(query).forEach(([key, value]) => url.searchParams.set(key, String(value)));
  const response = await fetch(url, {
    method,
    headers: method === "POST" ? { "content-type": "text/plain;charset=utf-8" } : undefined,
    body: method === "POST" ? JSON.stringify(body) : undefined,
    redirect: "follow"
  });
  const text = await response.text();
  let payload;
  try {
    payload = JSON.parse(text);
  } catch {
    throw new Error(`HTTP ${response.status} returned non-JSON response.`);
  }
  if (!response.ok || !payload.ok) {
    throw new Error(payload.error || `HTTP ${response.status}`);
  }
  return payload;
}

function expect(condition, message) {
  if (!condition) throw new Error(message);
}

async function run() {
  try {
    const ping = await requestJson("GET", null, { action: "ping" });
    expect(ping.ok === true, "ping did not return ok");
    pass("GAS ping");

    const accountResult = await requestJson("POST", {
      action: "adminUpsertAccount",
      token: process.env.GAS_ADMIN_TOKEN,
      account: { accountId: account, password, displayName: `QA-${account}` }
    });
    expect(accountResult.account?.accountId === account, "test account was not created or updated");
    pass("admin creates isolated QA account");

    const login = await requestJson("POST", { action: "login", account, password });
    sessionToken = login.sessionToken;
    profile = login.profile;
    expect(typeof sessionToken === "string" && sessionToken.length > 20, "login did not return a session token");
    expect(profile?.accountId === account, "login profile belongs to another account");
    pass("login and account isolation");

    const loaded = await requestJson("POST", { action: "loadProfile", sessionToken });
    expect(loaded.profile?.accountId === account, "loadProfile returned another account");
    profile = loaded.profile;
    pass("loadProfile");

    const saved = await requestJson("POST", {
      action: "saveProgress",
      sessionToken,
      expectedVersion: profile.version,
      profile: { hero: profile.hero, weapon: profile.weapon, gear: profile.gear, level: 10, coins: 999999 }
    });
    expect(saved.profile.level === profile.level && saved.profile.coins === profile.coins, "saveProgress accepted client-owned progression");
    profile = saved.profile;
    pass("saveProgress server-owned progression");

    for (let stage = 1; stage <= 8; stage += 1) {
      if (profile.gems?.[stage - 1]) continue;
      const settled = await requestJson("POST", {
        action: "finishStage",
        sessionToken,
        eventId: `qa-${Date.now()}-${stage}-${Math.random().toString(36).slice(2, 8)}`,
        stage,
        result: "win",
        correct: stageMinimums[stage],
        attempts: stageMinimums[stage] + 2,
        maxCombo: 10,
        durationSec: 180
      });
      expect(settled.profile?.gems?.[stage - 1] === true, `stage ${stage} did not award its gem`);
      profile = settled.profile;
      pass(`finishStage ${stage}/8`);
    }
    expect(profile.gems?.length >= 8 && profile.gems.slice(0, 8).every(Boolean), "QA account did not collect all eight gems");

    const purchase = await requestJson("POST", {
      action: "purchase",
      sessionToken,
      itemId: "potion",
      expectedVersion: profile.version
    });
    expect(Number(purchase.profile?.inventory?.items?.potion) > Number(profile.inventory?.items?.potion || 0), "purchase did not increase potion quantity");
    profile = purchase.profile;
    pass("purchase consumable");

    const ladder = await requestJson("POST", { action: "startLadder", sessionToken });
    expect(typeof ladder.run?.runId === "string" && ladder.run.runId.length > 10, "startLadder did not return a run");
    const finished = await requestJson("POST", {
      action: "finishLadder",
      sessionToken,
      runId: ladder.run.runId,
      nickname,
      floor: 1,
      score: 100,
      correct: 9,
      attempts: 10,
      durationMs: 60000
    });
    expect(finished.entry?.nickname && finished.entry?.moderationStatus === "approved" && Number(finished.entry?.floor) >= 1, "finishLadder did not return an approved ladder entry");
    pass("startLadder and finishLadder");

    const leaderboard = await requestJson("GET", null, { action: "leaderboard", mode: "ladder", limit: 50 });
    expect(Array.isArray(leaderboard.records) && leaderboard.records.length <= 50, "leaderboard did not cap at 50 records");
    pass("leaderboard top 50");

    await requestJson("POST", { action: "logout", sessionToken });
    let rejected = false;
    try {
      await requestJson("POST", { action: "loadProfile", sessionToken });
    } catch {
      rejected = true;
    }
    expect(rejected, "revoked session was still accepted");
    pass("logout revokes session");
  } catch (error) {
    fail("live GAS endpoint smoke", error);
  }

  const failed = checks.filter(check => !check.ok).length;
  console.log(`GAS endpoint QA summary: ${failed ? "FAIL" : "PASS"} (${checks.length - failed}/${checks.length})`);
  process.exitCode = failed ? 1 : 0;
}

run().catch(error => {
  console.error(`GAS endpoint QA aborted: ${error.message}`);
  process.exitCode = 1;
});
