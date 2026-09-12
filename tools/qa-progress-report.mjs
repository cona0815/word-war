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
    localStorage.setItem("word-war-core-config", JSON.stringify({ gasUrl: "https://qa.invalid/report", adminToken: "qa-admin" }));
    window.fetch = async (input, options = {}) => {
      const url = String(input?.url || input || "");
      let body = {};
      try { body = JSON.parse(options.body || "{}"); } catch {}
      if (body.action === "login") return { ok: true, json: async () => ({ ok: true, sessionToken: "qa-session", expiresAt: "", profile: { account: "99099", version: 1, hero: "male", level: 1, xp: 0, coins: 0, gems: [], weapon: "starlight", gear: "focus", inventory: { weapons: ["starlight"], gear: ["focus"], items: {} } } }) };
      if (url.includes("action=students")) return { ok: true, json: async () => ({ ok: true, students: [
        { studentName: "50101", className: "501", seatNo: "01", bestStage: 6, gems: 6, bestScore: 920, accuracy: 96, correct: 60, attempts: 62, plays: 8, topErrors: [{ key: "phrases:學校", count: 4 }], bestStages: { "5": { score: 700, accuracy: 95 }, "6": { score: 920, accuracy: 96 } } },
        { studentName: "50202", className: "502", seatNo: "02", bestStage: 3, gems: 3, bestScore: 410, accuracy: 88, correct: 30, attempts: 34, plays: 4, topErrors: [{ key: "zhuyin:ㄅ", count: 3 }], bestStages: { "3": { score: 410, accuracy: 88 } } }
      ] }) };
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
  await page.locator("#loadProgressBtn").click();
  await page.waitForFunction(() => document.querySelectorAll("#studentProgressList .summary-card").length === 2);
  assert.match(await page.locator("#studentProgressList").textContent(), /逐關最佳/);
  assert.match(await page.locator("#studentProgressList").textContent(), /常錯 phrases:學校/);
  await page.locator("#progressClassFilter").fill("501");
  await page.waitForFunction(() => document.querySelectorAll("#studentProgressList .summary-card").length === 1);
  await page.locator("#progressStageFilter").selectOption("6");
  assert.match(await page.locator("#studentProgressList").textContent(), /50101/);
  const downloadPromise = page.waitForEvent("download");
  await page.locator("#exportStudentProgressBtn").click();
  const download = await downloadPromise;
  assert.equal(download.suggestedFilename(), "word-war-student-progress.tsv");
  console.log("PASS teacher progress filters, per-stage best summary, error summary, and TSV export");
} finally {
  await browser.close();
}
