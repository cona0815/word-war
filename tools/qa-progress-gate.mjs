import assert from "node:assert/strict";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { chromium } = require("C:/Users/cona0/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright");
const baseUrl = (process.argv[2] || "http://127.0.0.1:8767").replace(/\/$/, "");
const browser = await chromium.launch({ channel: "chrome", headless: true });

try {
  const page = await browser.newPage();
  const profile = { account: "99099", version: 1, hero: "male", level: 1, xp: 0, coins: 0, gems: [], weapon: "starlight", gear: "focus", inventory: { weapons: ["starlight"], gear: ["focus"], items: {} } };
  await page.addInitScript(value => {
    localStorage.clear();
    localStorage.setItem("word-war-core-profile:99099", JSON.stringify(value));
  }, profile);
  await page.goto(`${baseUrl}/index.html`);
  await page.locator("#accountInput").fill("99099");
  await page.locator("#passwordInput").fill("99099");
  await page.locator("#startBtn").click();
  await page.waitForFunction(() => !gameScreen.classList.contains("hidden"));
  await page.locator("#missionStartBtn").click();
  await page.waitForFunction(() => state.running);
  await page.evaluate(() => { clearInterval(state.tick); });

  const cards = () => page.locator("#levelGrid [data-level]").evaluateAll(nodes => nodes.map(node => ({ disabled: node.disabled, ariaDisabled: node.getAttribute("aria-disabled") })));
  await page.locator("#menuBtn").click();
  let initial = await cards();
  assert.equal(initial[0].disabled, false, "first stage is available");
  assert.equal(initial.slice(1).every(card => card.disabled), true, "later stages are locked before gems");

  await page.evaluate(() => { state.profile.gems = [true]; menu(); });
  const afterFirst = await cards();
  assert.equal(afterFirst[1].disabled, false, "second stage unlocks after first gem");
  assert.equal(afterFirst.slice(2).every(card => card.disabled), true, "third stage remains locked after one gem");

  await page.evaluate(() => { pendingStageSettlement = { record: { stage: 1 }, error: "測試待同步" }; menu(); });
  const pendingCards = await cards();
  assert.equal(pendingCards[0].disabled, false, "completed stage remains replayable while sync is pending");
  assert.equal(pendingCards.slice(1).every(card => card.disabled), true, "next stages remain locked while sync is pending");

  await page.evaluate(() => {
    pendingStageSettlement = null;
    stageSettlementBusy = false;
    state.config.gasUrl = "https://qa.invalid/stage";
    state.auth = { accountId: state.profile.account, sessionToken: "qa-session" };
    state.levelIndex = 0;
    state.profile = { ...state.profile, level: 1, xp: 0, coins: 0, gems: [] };
    state.records = [];
    state.running = true;
    state.bossMode = true;
    state.bossHp = 0;
    state.maxBossHp = 100;
    state.correct = 76;
    state.attempts = 76;
    state.startedAt = Date.now() - 1000;
    mission.classList.remove("hidden");
    window.fetch = async () => ({ ok: true, json: async () => ({ ok: false, error: "測試雲端拒絕" }) });
  });
  const failed = await page.evaluate(async () => {
    finish(true);
    await new Promise(resolve => setTimeout(resolve, 20));
    return { pending: pendingStageSettlement?.record.eventId, gems: state.profile.gems, title: missionTitle.textContent, text: missionText.textContent, button: missionStartBtn.textContent, disabled: missionStartBtn.disabled };
  });
  assert.ok(failed.pending, "failed settlement is retained for retry");
  assert.deepEqual(failed.gems, [], "local reward stays locked until cloud confirmation");
  assert.match(failed.title, /同步/);
  assert.match(failed.text, /測試雲端拒絕/);
  assert.equal(failed.button, "重試雲端同步");
  assert.equal(failed.disabled, false);

  await page.evaluate(() => {
    window.fetch = async () => ({ ok: true, json: async () => ({ ok: true, profile: { ...state.profile, gems: [true], version: Number(state.profile.version || 1) + 1 } }) });
  });
  const recovered = await page.evaluate(async () => {
    await retryStageSettlement();
    return { pending: pendingStageSettlement, synced: state.records.at(-1)?.synced, gems: state.profile.gems, title: missionTitle.textContent, text: missionText.textContent, disabled: missionStartBtn.disabled };
  });
  assert.equal(recovered.pending, null, "successful retry clears pending settlement");
  assert.deepEqual(recovered.gems, [true]);
  assert.equal(recovered.synced, true);
  assert.match(recovered.title, /完成/);
  assert.match(recovered.text, /雲端存檔已完成/);
  assert.equal(recovered.disabled, false);

  await page.evaluate(() => { menu(); });
  const unlockedAfterRetry = await cards();
  assert.equal(unlockedAfterRetry[1].disabled, false, "next stage unlocks after cloud confirmation");
  const switched = await page.evaluate(() => {
    pendingStageSettlement = { record: { stage: 1 }, error: "old account" };
    switchAccount("88088");
    return { pending: pendingStageSettlement, account: state.profile.account };
  });
  assert.equal(switched.pending, null, "switching accounts clears the old pending settlement");
  assert.equal(switched.account, "88088");
  console.log("PASS sequential stage gate and visible settlement retry flow");
} finally {
  await browser.close();
}
