import assert from "node:assert/strict";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { chromium } = require("C:/Users/cona0/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright");
const baseUrl = (process.argv[2] || "http://127.0.0.1:8767").replace(/\/$/, "");
const browser = await chromium.launch({ channel: "chrome", headless: true });

function legacyKey(init) {
  const event = new KeyboardEvent("keydown", { bubbles: true, cancelable: true, key: init.key, code: init.code || "" });
  Object.defineProperties(event, {
    keyCode: { value: init.keyCode, configurable: true },
    which: { value: init.keyCode, configurable: true },
    isComposing: { value: !!init.isComposing, configurable: true }
  });
  return event;
}

try {
  const page = await browser.newPage();
  await page.goto(`${baseUrl}/index.html?gm=1`);
  await page.locator("#gmPassword").fill("0088");
  await page.locator("#gmLogin button").click();
  await page.locator("#gmStart").click();
  await page.waitForFunction(() => state.running && !document.querySelector("#gmPanel").open);
  await page.evaluate(() => {
    clearInterval(state.tick);
    cast = () => {};
    state.bossMode = true;
    state.levelIndex = 7;
    state.current = { word: "我會打字。", boss: true };
    state.correct = 0;
    state.attempts = 0;
    answerInput.value = "";
  });
 await page.locator("#answerInput").focus();
  await page.evaluate(() => {
    window.__qaLegacyKey = init => {
      const event = new KeyboardEvent("keydown", { bubbles: true, cancelable: true, key: init.key, code: init.code || "" });
      Object.defineProperties(event, {
        keyCode: { value: init.keyCode, configurable: true },
        which: { value: init.keyCode, configurable: true },
        isComposing: { value: !!init.isComposing, configurable: true }
      });
      return event;
    };
  });

  const composing = await page.evaluate(() => {
    const input = document.querySelector("#answerInput");
    input.dispatchEvent(new CompositionEvent("compositionstart", { bubbles: true, data: "" }));
    input.value = "我";
    input.dispatchEvent(new InputEvent("input", { bubbles: true, data: "我", inputType: "insertCompositionText", isComposing: true }));
    input.dispatchEvent(window.__qaLegacyKey({ key: "1", code: "Digit1", keyCode: 229 }));
    input.dispatchEvent(window.__qaLegacyKey({ key: "Enter", code: "Enter", keyCode: 13, isComposing: true }));
    return { attempts: state.attempts, correct: state.correct, composing };
  });
  assert.equal(composing.attempts, 0, "IME composition must not submit a partial candidate");
  assert.equal(composing.correct, 0, "IME composition must not count partial input as correct");

  const committed = await page.evaluate(() => {
    const input = document.querySelector("#answerInput");
    input.dispatchEvent(new CompositionEvent("compositionend", { bubbles: true, data: "我會打字。" }));
    input.value = "我會打字。";
    input.dispatchEvent(new InputEvent("input", { bubbles: true, data: "我會打字。", inputType: "insertText", isComposing: false }));
    input.dispatchEvent(window.__qaLegacyKey({ key: "Enter", code: "Enter", keyCode: 13 }));
    return { attempts: state.attempts, correct: state.correct, value: input.value };
  });
  assert.equal(committed.attempts, 1, "committed Chinese sentence submits once with Enter");
  assert.equal(committed.correct, 1, "committed Chinese sentence counts one correct answer");
  assert.equal(committed.value, "", "submitted candidate clears the input");

  const key229Guard = await page.evaluate(() => {
    state.levelIndex = 3;
    state.current = { word: "ㄅ", boss: true };
    state.current.pending = false;
    answerInput.value = "";
    answerInput.dispatchEvent(window.__qaLegacyKey({ key: "1", code: "Digit1", keyCode: 229 }));
    return { attempts: state.attempts, correct: state.correct };
  });
  assert.equal(key229Guard.attempts, 1, "legacy IME keyCode 229 must not trigger phonetic attack");
  assert.equal(key229Guard.correct, 1, "legacy IME keyCode 229 must not count a hit");

  console.log("PASS IME composition and keyCode 229 input guards");
} finally {
  await browser.close();
}
