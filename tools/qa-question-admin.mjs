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
  page.on("dialog", dialog => dialog.accept());
  await page.addInitScript(() => {
    localStorage.clear();
    localStorage.setItem("word-war-core-config", JSON.stringify({ gasUrl: "https://qa.invalid/questions", adminToken: "qa-admin" }));
    window.fetch = async (input, options = {}) => {
      const url = String(input?.url || input || "");
      let body = {};
      try { body = JSON.parse(options.body || "{}"); } catch {}
      const active = { id: "q-active", stage: 7, mode: "en", prompt: "I can type.", answer: "I can type.", display: "I can type.", wave: 1, difficulty: 1, enabled: true, version: 1 };
      const disabled = { id: "q-disabled", stage: 8, mode: "zh", prompt: "停用題。", answer: "停用題。", display: "停用題。", wave: 4, difficulty: 4, enabled: false, version: 2 };
      if (body.action === "login") return { ok: true, json: async () => ({ ok: true, sessionToken: "qa-session", expiresAt: "", profile: { account: "99099", version: 1, hero: "male", level: 1, xp: 0, coins: 0, gems: [], weapon: "starlight", gear: "focus", inventory: { weapons: ["starlight"], gear: ["focus"], items: {} } } }) };
     if (body.action === "listQuestions") {
       window.__lastAdminAction = body.action;
       return { ok: true, json: async () => ({ ok: true, questions: [active, disabled] }) };
     }
      if (body.action === "updateQuestion") {
        window.__lastAdminAction = body.action;
       window.__lastAdminMutation = body.action;
        return { ok: true, json: async () => ({ ok: true, question: { ...active, ...body.question, id: body.id, version: 2 } }) };
      }
      if (body.action === "addQuestion") {
        window.__lastAdminAction = body.action;
        window.__lastAdminMutation = body.action;
        return { ok: true, json: async () => ({ ok: true, question: { ...body.question, id: "q-added", enabled: true, version: 1 } }) };
      }
     if (body.action === "setQuestionEnabled" || body.action === "deleteQuestion") {
       window.__lastAdminAction = body.action;
        window.__lastAdminMutation = body.action;
       return { ok: true, json: async () => ({ ok: true, question: { ...disabled, id: body.id, enabled: body.action === "setQuestionEnabled" ? Boolean(body.enabled) : false } }) };
      }
      if (url.includes("action=questions")) return { ok: true, json: async () => ({ ok: true, questions: [active] }) };
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
  await page.locator("#loadQuestionAdminBtn").click();
  await page.waitForFunction(() => document.querySelectorAll("#questionAdminList [data-question-edit]").length === 2);
  assert.equal(await page.locator("#questionAdminList .summary-card").count(), 2);
  await page.locator("#questionAdminSearch").fill("停用");
  await page.waitForFunction(() => document.querySelectorAll("#questionAdminList [data-question-edit]").length === 1);
  assert.equal(await page.locator('[data-question-edit="q-disabled"]').count(), 1);
  await page.locator("#questionAdminSearch").fill("");
  await page.locator("#questionAdminStatus").selectOption("active");
  await page.waitForFunction(() => document.querySelectorAll("#questionAdminList [data-question-edit]").length === 1);
  assert.equal(await page.locator('[data-question-edit="q-active"]').count(), 1);
  await page.locator("#questionAdminStatus").selectOption("");
  await page.locator('[data-question-edit="q-active"]').click();
  assert.equal(await page.locator("#addQuestionBtn").textContent(), "儲存編輯");
  await page.locator("#questionPrompt").fill("I can type fast.");
  await page.locator("#questionAnswer").fill("I can type fast.");
  await page.locator("#questionWave").fill("3");
  await page.locator("#questionDifficulty").fill("2");
  await page.locator("#addQuestionBtn").click();
  try {
    await page.waitForFunction(() => window.__lastAdminMutation === "updateQuestion" && document.querySelector("#addQuestionBtn").textContent === "新增題目");
  } catch (error) {
    console.error("ADMIN DEBUG", await page.evaluate(() => ({ action: window.__lastAdminAction || "", mutation: window.__lastAdminMutation || "", status: document.querySelector("#questionStatus")?.textContent || "", button: document.querySelector("#addQuestionBtn")?.textContent || "", editing: window.state?.questionEditingId || "", prompt: document.querySelector("#questionPrompt")?.value || "" })));
    throw error;
  }
  assert.match(await page.locator("#questionStatus").textContent(), /已更新/);
 await page.locator("#cancelQuestionEditBtn").click();
 assert.equal(await page.locator("#questionPrompt").inputValue(), "");
 assert.equal(await page.locator("#questionWave").inputValue(), "0");
  await page.locator('[data-question-toggle="q-active"]').click();
  await page.waitForFunction(() => window.__lastAdminMutation === "setQuestionEnabled");
  await page.locator('[data-question-toggle="q-disabled"]').click();
  await page.waitForFunction(() => window.__lastAdminMutation === "setQuestionEnabled");
  await page.locator('[data-question-delete="q-active"]').click();
  await page.waitForFunction(() => window.__lastAdminMutation === "deleteQuestion");
  console.log("PASS teacher question list, edit, enable/disable, soft-delete, and reset UI flow");
} finally {
  await browser.close();
}
