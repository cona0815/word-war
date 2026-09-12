import assert from "node:assert/strict";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { chromium } = require("C:/Users/cona0/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright");
const baseUrl = (process.argv[2] || "http://127.0.0.1:8767").replace(/\/$/, "");
const browser = await chromium.launch({ channel: "chrome", headless: true });

try {
  const page = await browser.newPage();
  page.on("pageerror", error => console.error("PAGEERROR", error.message));
  page.on("console", message => { if (message.type() === "error") console.error("CONSOLE", message.text()); });
  await page.addInitScript(() => {
    localStorage.clear();
    localStorage.setItem("word-war-core-config", JSON.stringify({ gasUrl: "https://qa.invalid/accounts", adminToken: "qa-admin" }));
    window.fetch = async (input, options = {}) => {
      const url = String(input?.url || input || "");
      let body = {};
      try { body = JSON.parse(options.body || "{}"); } catch {}
      if (body.action === "login") return { ok: true, json: async () => ({ ok: true, sessionToken: "qa-session", expiresAt: "", profile: { account: "99099", version: 1, hero: "male", level: 1, xp: 0, coins: 0, gems: [], weapon: "starlight", gear: "focus", inventory: { weapons: ["starlight"], gear: ["focus"], items: {} } } }) };
      if (url.includes("action=accounts")) return { ok: true, json: async () => ({ ok: true, accounts: [{ accountId: "50101", classCode: "501", seatNo: "01", displayName: "測試學生", status: "active" }, { accountId: "50102", classCode: "501", seatNo: "02", displayName: "停用學生", status: "disabled" }] }) };
      if (body.action === "adminUpsertAccount") {
        window.__lastAccountMutation = body.account;
        return { ok: true, json: async () => ({ ok: true, account: { ...body.account } }) };
      }
      if (url.includes("action=questions")) return { ok: true, json: async () => ({ ok: true, questions: [] }) };
      return { ok: true, json: async () => ({ ok: true }) };
    };
  });
  await page.goto(`${baseUrl}/index.html`);
  await page.locator("#accountInput").fill("99099");
  await page.locator("#passwordInput").fill("99099");
  await page.locator("#startBtn").click();
  await page.waitForFunction(() => !document.querySelector("#gameScreen").classList.contains("hidden"));
  await page.locator("#menuBtn").click();
  await page.locator('[data-menu-tab="settings"]').click();
  await page.locator("#loadAccountsBtn").click();
  await page.waitForFunction(() => document.querySelectorAll("#accountAdminList [data-account-edit]").length === 2);
  assert.equal(await page.locator("#accountAdminList .summary-card").count(), 2);
  await page.locator('[data-account-edit="50102"]').click();
  assert.equal(await page.locator("#accountAdminId").inputValue(), "50102");
  await page.locator("#accountAdminName").fill("二年級學生");
  await page.locator("#accountAdminPassword").fill("50202");
  await page.locator("#accountAdminStatus").selectOption("active");
  await page.locator("#saveAccountBtn").click();
  await page.waitForFunction(() => window.__lastAccountMutation?.accountId === "50102");
  const saved = await page.evaluate(() => window.__lastAccountMutation);
  assert.equal(saved.displayName, "二年級學生");
  assert.equal(saved.password, "50202");
  assert.equal(saved.status, "active");
  await page.locator("#clearAccountBtn").click();
  assert.equal(await page.locator("#accountAdminId").inputValue(), "");
  assert.equal(await page.locator("#accountAdminPassword").inputValue(), "");
  console.log("PASS teacher account list, reset, status update, and clear UI flow");
} finally {
  await browser.close();
}
