import assert from "node:assert/strict";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { chromium } = require("C:/Users/cona0/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright");
const baseUrl = (process.argv[2] || "http://127.0.0.1:8767").replace(/\/$/, "");
const browser = await chromium.launch({ channel: "chrome", headless: true });

const asSet = values => new Set(values);
const expectExact = (pool, expected, label) => {
  assert.ok(pool.length > 0, `${label} must not be empty`);
  assert.deepEqual(asSet(pool), asSet(expected), `${label} has an unexpected topic pool`);
};

try {
  const page = await browser.newPage();
  await page.goto(`${baseUrl}/index.html?gm=1`);
  await page.locator("#gmPassword").fill("0088");
  await page.locator("#gmLogin button").click();
  await page.locator("#gmStart").click();
  await page.waitForFunction(() => state.running && !document.querySelector("#gmPanel").open);
  const pools = await page.evaluate(() => levels.slice(0, 8).map((lv, index) => [1, 2, 3].map(phase => {
    state.levelIndex = index;
    state.bossPhase = phase;
    return bossPool(lv);
  })));

  expectExact(pools[0][0], ["A", "S", "D", "F"], "Lv1 phase 1 left home row");
  expectExact(pools[0][1], ["J", "K", "L"], "Lv1 phase 2 right home row");
  expectExact(pools[0][2], ["Q", "W", "E", "R", "Z", "X", "C", "V", "U", "I", "O", "P", "N", "M"], "Lv1 phase 3 upper/lower letters");

  expectExact(pools[1][0], ["an", "is", "it", "up"], "Lv2 phase 1 two-letter words");
  expectExact(pools[1][1], ["cat", "dog", "sun", "pen"], "Lv2 phase 2 three-letter words");
  expectExact(pools[1][2], ["book", "desk", "fish", "bird"], "Lv2 phase 3 four-letter words");

  expectExact(pools[2][0], ["ㄅ", "ㄆ", "ㄇ", "ㄈ", "ㄉ", "ㄊ", "ㄋ", "ㄌ"], "Lv3 phase 1 consonants");
  expectExact(pools[2][1], ["ㄚ", "ㄛ", "ㄜ", "ㄝ", "ㄧ", "ㄨ", "ㄩ"], "Lv3 phase 2 vowels");
  expectExact(pools[2][2], ["ㄅ", "ㄇ", "ㄚ", "ㄧ", "ㄨ", "ㄓ", "ㄕ"], "Lv3 phase 3 mixed Zhuyin");

  expectExact(pools[3][0], ["ㄅㄚ", "ㄇㄚ", "ㄉㄚ", "ㄌㄧ", "ㄓㄨ", "ㄒㄧ", "ㄅㄠ", "ㄇㄟ"], "Lv4 phase 1 phonics");
  expectExact(pools[3][1], ["ㄅㄚˋ", "ㄇㄚˊ", "ㄉㄚˇ", "ㄒㄧˇ"], "Lv4 phase 2 tones");
  expectExact(pools[3][2], ["，", "。", "？", "！", "：", "、", "「", "」"], "Lv4 phase 3 punctuation");

  expectExact(pools[4][0], ["人", "口", "手", "山", "水"], "Lv5 phase 1 daily characters");
  expectExact(pools[4][1], ["學", "校", "書", "課", "師"], "Lv5 phase 2 campus characters");
  expectExact(pools[4][2], ["大", "橋", "班", "電", "腦"], "Lv5 phase 3 Daqiao characters");

  expectExact(pools[5][0], ["學校", "老師", "同學", "教室", "電腦", "鍵盤", "滑鼠", "螢幕"], "Lv6 phase 1 two-character phrases");
  expectExact(pools[5][1], ["圖書館", "電腦課", "小朋友", "打字王"], "Lv6 phase 2 three-character phrases");
  expectExact(pools[5][2], ["複製 Ctrl+C", "貼上 Ctrl+V", "復原 Ctrl+Z", "全選 Ctrl+A"], "Lv6 phase 3 hotkeys");

  expectExact(pools[6][0], ["I am happy.", "This is my pen.", "I like apples.", "Are you OK?"], "Lv7 phase 1 easy sentences");
  expectExact(pools[6][1], ["Use the mouse gently.", "Read the sentence before typing."], "Lv7 phase 2 normal sentences");
  expectExact(pools[6][2], ["Keep your hands on the home row.", "Accuracy is more important than speed."], "Lv7 phase 3 longer sentences");

  expectExact(pools[7][0], ["我會打字。", "我愛大橋國小。", "今天很開心。", "大橋國小真美。"], "Lv8 phase 1 simple sentences");
  expectExact(pools[7][1], ["使用電腦要愛惜設備。"], "Lv8 phase 2 normal sentences");
  expectExact(pools[7][2], ["不可以隨意點擊不明連結。"], "Lv8 phase 3 challenge sentences");
  const remotePools = await page.evaluate(() => {
    state.questions = [
      { stage: 7, mode: "en", answer: "Remote easy.", prompt: "Remote easy.", wave: 1, difficulty: "easy" },
      { stage: 7, mode: "en", answer: "Remote normal.", prompt: "Remote normal.", wave: 3, difficulty: "normal" },
      { stage: 7, mode: "en", answer: "Remote hard!", prompt: "Remote hard!", wave: 4, difficulty: "hard" },
      { stage: 8, mode: "zh", answer: "遠端簡單。", prompt: "遠端簡單。", wave: 1, difficulty: "簡單" },
      { stage: 8, mode: "zh", answer: "遠端普通。", prompt: "遠端普通。", wave: 3, difficulty: "普通" },
      { stage: 8, mode: "zh", answer: "遠端挑戰！", prompt: "遠端挑戰！", wave: 4, difficulty: "挑戰" }
    ].map(normalizeQuestion);
    return [7, 8].map(id => [1, 2, 3].map(phase => { state.bossPhase = phase; return bossPool(levels[id - 1]); }));
  });
  expectExact(remotePools[0][0], ["Remote easy."], "Lv7 remote easy pool");
  expectExact(remotePools[0][1], ["Remote normal."], "Lv7 remote normal pool");
  expectExact(remotePools[0][2], ["Remote hard!"], "Lv7 remote challenge pool");
  expectExact(remotePools[1][0], ["遠端簡單。"], "Lv8 remote easy pool");
  expectExact(remotePools[1][1], ["遠端普通。"], "Lv8 remote normal pool");
  expectExact(remotePools[1][2], ["遠端挑戰！"], "Lv8 remote challenge pool");
  const remoteWaves = await page.evaluate(() => ({
    en: (() => { state.levelIndex = 6; return teacherWaveSets(levels[6]); })(),
    zh: (() => { state.levelIndex = 7; return teacherWaveSets(levels[7]); })()
  }));
  expectExact(remoteWaves.en[0], ["Remote easy."], "Lv7 wave 1 uses teacher wave");
  expectExact(remoteWaves.en[1], ["Remote easy.", "Remote normal."], "Lv7 fallback wave 2 mixes easy and normal");
  expectExact(remoteWaves.en[2], ["Remote normal."], "Lv7 fallback wave 3 uses normal");
  expectExact(remoteWaves.en[3], ["Remote hard!"], "Lv7 fallback wave 4 uses challenge");
  expectExact(remoteWaves.zh[0], ["遠端簡單。"], "Lv8 wave 1 uses teacher wave");
  expectExact(remoteWaves.zh[1], ["遠端簡單。", "遠端普通。"], "Lv8 fallback wave 2 mixes easy and normal");
  expectExact(remoteWaves.zh[2], ["遠端普通。"], "Lv8 fallback wave 3 uses normal");
 expectExact(remoteWaves.zh[3], ["遠端挑戰！"], "Lv8 fallback wave 4 uses challenge");
  const explicitWaves = await page.evaluate(() => {
    state.questions = [
      { stage: 7, mode: "en", answer: "Wave one.", prompt: "Wave one.", wave: 1, difficulty: 1 },
      { stage: 7, mode: "en", answer: "Wave two.", prompt: "Wave two.", wave: 2, difficulty: 1 },
      { stage: 7, mode: "en", answer: "Wave three.", prompt: "Wave three.", wave: 3, difficulty: 2 },
      { stage: 7, mode: "en", answer: "Wave four.", prompt: "Wave four.", wave: 4, difficulty: 4 }
    ].map(normalizeQuestion);
    state.bossPhase = 1;
    return { waves: teacherWaveSets(levels[6]), bossPhaseOne: bossPool(levels[6]) };
  });
  expectExact(explicitWaves.waves[0], ["Wave one."], "Lv7 explicit wave 1");
  expectExact(explicitWaves.waves[1], ["Wave two."], "Lv7 explicit wave 2");
  expectExact(explicitWaves.waves[2], ["Wave three."], "Lv7 explicit wave 3");
  expectExact(explicitWaves.waves[3], ["Wave four."], "Lv7 explicit wave 4");
  expectExact(explicitWaves.bossPhaseOne, ["Wave one.", "Wave two."], "Lv7 Boss uses explicit waves 1 and 2");

 await page.close();
  console.log("PASS eight main-stage Boss phase pools stay within the teaching progression");
} finally {
  await browser.close();
}
