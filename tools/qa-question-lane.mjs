import assert from "node:assert/strict";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { chromium } = require("C:/Users/cona0/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright");
const baseUrl = (process.argv[2] || "http://127.0.0.1:8767").replace(/\/$/, "");
const browser = await chromium.launch({ channel: "chrome", headless: true });

try {
  const page = await browser.newPage();
  await page.goto(`${baseUrl}/index.html`);
  const result = await page.evaluate(() => {
    state.levelIndex = 6;
    state.questions = [normalizeQuestion({ stage: 7, mode: "en", prompt: "Teacher lane.", answer: "Teacher lane.", laneKey: "right-upper", wave: 1 })];
    const english = { lane: spawnLaneKey("Teacher lane."), point: keyPos("Teacher lane."), enemy: pos(levels[6], "Teacher lane.", 0, {}) };
    state.levelIndex = 7;
    state.questions = [normalizeQuestion({ stage: 8, mode: "zh", prompt: "罕見句首。", answer: "罕見句首。", laneKey: "bottom", wave: 1 })];
    const chinese = { lane: spawnLaneKey("罕見句首。"), point: keyPos("罕見句首。"), enemy: pos(levels[7], "罕見句首。", 0, {}) };
    return { english, chinese };
  });
  assert.deepEqual(result.english.point, [82, 28], "English teacher lane maps to the right-upper coordinate");
  assert.equal(result.english.lane, "teacher-right-upper");
  assert.deepEqual(result.english.enemy, { x: 82, y: 28 }, "English imported question uses its lane for spawn position");
  assert.deepEqual(result.chinese.point, [50, 88], "Chinese teacher lane maps to the bottom coordinate");
  assert.equal(result.chinese.lane, "teacher-bottom");
  assert.deepEqual(result.chinese.enemy, { x: 50, y: 86 }, "Chinese imported question uses its lane for spawn position");
  await page.close();
  console.log("PASS teacher question laneKey controls spawn direction and queue lane");
} finally {
  await browser.close();
}
