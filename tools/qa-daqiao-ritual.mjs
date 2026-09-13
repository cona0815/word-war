import assert from "node:assert/strict";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { chromium } = require("C:/Users/cona0/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright");
const baseUrl = (process.argv[2] || "http://127.0.0.1:8767").replace(/\/$/, "");
const browser = await chromium.launch({ channel: "chrome", headless: true });

try {
  const page = await browser.newPage();
  const profile = { account: "99099", version: 1, hero: "male", level: 10, xp: 0, coins: 0, gems: [true, true, true, true, true, true, true, true], weapon: "starlight", gear: "focus", inventory: { weapons: ["starlight"], gear: ["focus"], items: {} } };
  await page.addInitScript(value => {
    localStorage.clear();
    localStorage.setItem("word-war-core-profile:99099", JSON.stringify(value));
  }, profile);
  await page.goto(`${baseUrl}/index.html`);
  await page.locator("#accountInput").fill(profile.account);
  await page.locator("#passwordInput").fill(profile.account);
  await page.locator("#startBtn").click();
  await page.waitForFunction(() => document.querySelector("#gameScreen")?.classList.contains("hidden") === false);
  await page.locator("#menuBtn").click();
  await page.locator('#levelGrid [data-level="8"]').click();
  await page.waitForFunction(() => state.levelIndex === 8 && !mission.classList.contains("hidden"));
  assert.equal(await page.locator("#missionStartBtn").textContent(), "前往大橋堂放置寶石");
  assert.equal(await page.locator("#missionStartBtn").isDisabled(), false);

  await page.locator("#missionStartBtn").click();
  const offering = await page.evaluate(() => ({
    ritualReady: state.ladderRitualReady,
    running: state.running,
    title: missionTitle.textContent,
    text: missionText.textContent,
    button: missionStartBtn.textContent
  }));
  assert.equal(offering.ritualReady, true, "first Daqiao click records the gem offering");
  assert.equal(offering.running, false, "gem offering does not start combat yet");
  assert.match(offering.title, /八寶石/);
  assert.match(offering.text, /字母、單字、注音、符號、國字、操作、英句、中句/);
  assert.equal(offering.button, "開始最後試練");

  await page.locator("#missionStartBtn").click();
  await page.waitForFunction(() => state.running === true, null, { timeout: 20000 });
  const started = await page.evaluate(() => ({ level: state.levelIndex, ladder: isLadder(levels[state.levelIndex]), ritualReady: state.ladderRitualReady }));
  assert.deepEqual(started, { level: 8, ladder: true, ritualReady: true });
  await page.evaluate(() => clearInterval(state.tick));
  await page.close();
  console.log("PASS Daqiao Hall requires the eight-gem offering before ladder combat");
} finally {
  await browser.close();
}
