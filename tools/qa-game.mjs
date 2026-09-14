import fs from "node:fs";
import vm from "node:vm";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const htmlPath = path.join(root, "index.html");
const html = fs.readFileSync(htmlPath, "utf8");
const typingInput = fs.readFileSync(path.join(root, "typing-input.js"), "utf8");
const failures = [];
const checks = [];

function check(name, condition, detail = "") {
  checks.push({ name, condition, detail });
  if (!condition) failures.push(`${name}${detail ? `: ${detail}` : ""}`);
}

const courseContext={C:(...h)=>String.fromCodePoint(...h.map(v=>parseInt(v,16))),zi:[],zm:[],zf:[],UP:'上',DOWN:'下',LEFT:'左',RIGHT:'右'};
vm.runInNewContext(fs.readFileSync(path.join(root,'course-content.js'),'utf8'),courseContext);
const levels=vm.runInNewContext('('+html.match(/const levels=(\[[\s\S]*?\n    \]);/)[1]+')',courseContext);
courseContext.CourseContent.apply(levels);
const stageLines=levels.map(l=>JSON.stringify(l).replace(/"(\w+)":/g,'$1:')+' '+l.waveSets.map(w=>w.join('')).join(' ')+' '+l.waveSets.map(w=>w.join(' ')).join(' '));
const stageIds=levels.map(l=>l.id);
const stageById=new Map(stageLines.map((line,i)=>[levels[i].id,line]));
const expectedIds = [1, 2, 3, 4, 5, 6, 7, 8, 9];

check("關卡數量為 9", stageLines.length === expectedIds.length, String(stageLines.length));
check("關卡編號連續", JSON.stringify(stageIds) === JSON.stringify(expectedIds), JSON.stringify(stageIds));

for (const id of expectedIds) {
  const line = stageById.get(id) || "";
  check(`第 ${id} 關有四波資料`, (line.match(/waveSets:/g) || []).length === 1 && /waveSets:\[/.test(line) && /bossWords:/.test(line));
  check(`第 ${id} 關有 Boss`, /\bboss:"/.test(line));
  check(`第 ${id} 關有素材`, /\batlas:"boss-atlas-/.test(line));
}

const requiredContent = {
  1: ["mode:\"letters\"", "ASDF", "JKL", "QWERZXCV", "UIOPNM"],
  2: ["mode:\"words\"", "an is it up", "cat dog sun pen", "book desk fish bird"],
  3: ["mode:\"zhuyin\"", "ㄅ", "ㄧ", "ㄚ"],
  4: ["mode:\"phonics\"", "ˊ", "ˇ", "，", "！", "「"],
  5: ["mode:\"chineseChar\"", "人", "學", "大", "橋"],
  6: ["mode:\"phrases\"", "學校", "圖書館", "Ctrl+C", "Ctrl+V", "Ctrl+Z", "Ctrl+A"],
  7: ["mode:\"words\"", "rabbit", "pencil"],
  8: ["mode:\"phrases\"", "大橋國小", "圖書館"],
  9: ["mode:\"final\"", "I am happy.", "我會打字。", "複製 Ctrl+C"]
};

for (const [idText, tokens] of Object.entries(requiredContent)) {
  const id = Number(idText);
  for (const token of tokens) check(`第 ${id} 關包含 ${token}`, (stageById.get(id) || "").includes(token));
}

const stage4 = stageById.get(4) || "";
check("第 4 關只練單聲調與標點", levels[3].words.every(w=>w.length===1)&&["ˊ","ˇ","ˋ","˙"].every(w=>levels[3].words.includes(w)));

const atlasDir = path.join(root, "assets", "generated", "boss-safe-atlas-20260612-v3");
const expectedAtlases = {
  1: "boss-atlas-01-bade-safe-v3-20260612.png",
  2: "boss-atlas-02-sanda-safe-v3-20260612.png",
  3: "boss-atlas-03-wulun-safe-v3-20260612.png",
  4: "boss-atlas-04-rumu-safe-v3-20260612.png",
  5: "boss-atlas-05-growth-safe-v3-20260612.png",
  6: "boss-atlas-06-lamb-safe-v3-20260612.png",
  7: "boss-atlas-07-childheart-safe-v3-20260612.png",
  8: "boss-atlas-08-daqiao-safe-v3-20260612.png",
  9: "boss-atlas-08-daqiao-safe-v3-20260612.png"
};
for (const [idText, file] of Object.entries(expectedAtlases)) {
  const id = Number(idText);
  check(`第 ${id} 關使用安全 Boss 素材`, (stageById.get(id) || "").includes(`atlas:"${file}"`));
  check(`第 ${id} 關素材檔存在`, fs.existsSync(path.join(atlasDir, file)), file);
}

check("Boss 方向由正式 manifest 控制", /BOSS_FACE_BY_STAGE=Object\.freeze/.test(html) && /--boss-face:\$\{bossFace\(state\.levelIndex\)\}/.test(html) && /\.boss-sprite,\.boss-lab-sprite\{transform:scaleX\(var\(--boss-face,1\)\)!important/.test(html));
check("獨立 Boss 預覽也使用方向 manifest", fs.readFileSync(path.join(root, "boss-preview.html"), "utf8").includes("BOSS_FACE_BY_LEVEL") && fs.readFileSync(path.join(root, "boss-preview.html"), "utf8").includes('stage.style.setProperty("--face"'));
check("Boss 具有三階段最低正確題數", /BOSS_MIN_CORRECT_BY_STAGE=Object\.freeze/.test(html) && /bossMinCorrect\(lv\.id,phase\)/.test(html));
check("Boss 每階段傷害保留最低題數", /minHits=bossMinCorrect/.test(html) && /Math\.floor\(phaseBudget\/hitsLeft\)/.test(html));
check("Boss 會先預告再攻擊", /Boss 準備攻擊！/.test(html) && /state\.bossAttackAt=now\+950/.test(html));
check("主角依目標左右使用正確面向", /function faceHeroTo\(tx\)\{const targetFace=tx>=heroPoint\(\)\.x\?1:-1/.test(html) && /heroSourceMirror\(state\.profile\.hero/.test(html));
check("施法完成後沒有多餘轉向重設", !/setTimeout\(\(\)=>\{state\.bossMode\?faceHeroTo\(bossPos\.x\)/.test(html));
check("通關只在前八關發放寶石", /lv\.id<=8/.test(html));
check("前端關卡結算帶一次性事件", /eventId:record\.eventId/.test(html) && /function makeRecord/.test(html));
check("第九關存在八寶石解鎖檢查", /gemCount\(\)>=8|gemCount\(\)\s*>=\s*8/.test(html));
check("前端主線依前一顆寶石解鎖", /function unlocked\(i\)\{if\(qaMode\)return true;if\(i===0\)return true;if\(i<8\)return hasGem\(i-1\)&&!pendingStageSettlement;return gemCount\(\)>=8&&!pendingStageSettlement\}/.test(html));
check("鎖定關卡按鈕不可操作", /aria-disabled/.test(html) && /card\.disabled = !available/.test(html));
check("雲端通關先等待確認再套用存檔", /const cloudSettlement =/.test(html) && /Object\.assign\(state\.profile, before\)/.test(html) && /雲端存檔已完成/.test(html));
check("雲端通關失敗保留同一事件重試", /pendingStageSettlement=\{record,error:error\.message\}/.test(html) && /重試雲端同步/.test(html));
check("重新登入會掃描未同步通關", /function pendingStageRecords\(\)/.test(html) && /function recoverPendingStageSettlements\(\)/.test(html) && /record\.synced!==true/.test(html));
check("未同步通關恢復沿用原 eventId", /settleStage\(record\)/.test(html) && /startBtn\.onclick=start/.test(html) && /originalStart/.test(html));
check("主線 Boss 依三階段教學題池出題", /BOSS_PHASE_WAVES=Object\.freeze/.test(html) && /const groups=BOSS_PHASE_WAVES\[lv\.id\]\?\.\[phase-1\]/.test(html));
check("教師句子題庫只驅動大橋堂", html.includes('CourseContent.sentencePool(state.questions,"en")') && html.includes('CourseContent.sentencePool(state.questions,"zh")') && html.includes('function teacherWaveSets(){return null}'));

check("任務開始按鈕有明確事件入口", /id="missionStartBtn"[^>]+type="button"/.test(html) && /onclick="handleMissionStart\(\)"/.test(html) && /function handleMissionStart/.test(html) && /missionStartBtn\.onclick=handleMissionStart/.test(html) && !/__WORD_WAR_START_MISSION__/.test(html));
check("角色裝備有獨立視覺層", /id="heroGear"/.test(html) && /heroGear\.dataset\.gear=key/.test(html) && /\.hero-gear\[data-gear="guardian"\]/.test(html));
check("整合武器不會疊加舊武器圖層", /\.hero-weapon\{display:none\}/.test(html) && /heroWeapon\.style\.display="none"/.test(html));
check("IME 組字與 keyCode 229 不會誤觸發攻擊", typingInput.includes("event.keyCode===229") && html.includes("e.keyCode===229") && html.includes("e.isComposing||e.keyCode===229||composing"));

const baseUrl = process.argv[2]?.replace(/\/$/, "");
if (baseUrl) {
  const urls = [
    `${baseUrl}/index.html`,
    `${baseUrl}/hero-preview.html`,
    `${baseUrl}/boss-preview.html`,
    ...Object.values(expectedAtlases).map(file => `${baseUrl}/assets/generated/boss-safe-atlas-20260612-v3/${file}`)
  ];
  for (const url of urls) {
    try {
      const response = await fetch(url);
      check(`HTTP ${response.status} ${url.replace(baseUrl, "")}`, response.ok);
    } catch (error) {
      check(`HTTP ${url.replace(baseUrl, "")}`, false, error.message);
    }
  }
}

for (const result of checks) console.log(`${result.condition ? "PASS" : "FAIL"} ${result.name}${result.detail && !result.condition ? ` (${result.detail})` : ""}`);
console.log(`\nQA summary: ${checks.length - failures.length}/${checks.length} passed`);
if (failures.length) {
  console.error("\nFailures:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exitCode = 1;
}
