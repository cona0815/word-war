import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const html = fs.readFileSync(path.join(root, "index.html"), "utf8");
const gas = fs.readFileSync(path.join(root, "gas_code.gs"), "utf8");
const failures = [];
const checks = [];

function check(name, condition) {
  checks.push({ name, condition });
  if (!condition) failures.push(name);
}

check("前端宣告題庫 schema 版本", /QUESTION_SCHEMA_VERSION=1/.test(html));
check("前端有題目正規化器", /function normalizeQuestion\(raw\)/.test(html));
check("前端使用 NFC 正規化並移除控制字元", /normalize\("NFC"\)/.test(html) && html.includes('replace(/[\\u0000-\\u001f\\u007f]/g,"")'));
check("前端限制遠端題目只能進第 7 或第 8 關", /QUESTION_STAGE_RULES=Object\.freeze\(\{7:\{mode:"en".*8:\{mode:"zh"/.test(html));
check("前端依 stage 與 mode 分流英文題", /q\.stage===7&&q\.mode==="en"/.test(html));
check("前端依 stage 與 mode 分流中文題", /q\.stage===8&&q\.mode==="zh"/.test(html));
check("前端載入遠端題目會先正規化", /state\.questions=normalizeQuestionList\(res\.questions\|\|\[\]\)/.test(html));
check("前端將文字難度正規化為可分流數值", /function difficultyValue\(raw\)/.test(html) && /easy:1/.test(html) && /normal:2/.test(html) && /hard:4/.test(html));
check("第 7、8 關一般波次使用教師 wave／難度", /function teacherWaveSets\(lv\)/.test(html) && /teacherSets=teacherWaveSets\(lv\)/.test(html) && /explicitWave/.test(html));
check("匯出欄位包含 laneKey 與授權資訊", /"laneKey".*"source".*"license".*"version"/.test(html));

for (const header of ["stage", "wave", "display", "laneKey", "tags", "source", "license", "version"]) {
  check(`GAS 題庫欄位 ${header}`, new RegExp(`"${header}"`).test(gas));
}
check("GAS 舊題目可依 mode 推定關卡", /mode === "en" \? 7 : mode === "zh" \? 8 : 0/.test(gas));
check("GAS 只接受第 7 或第 8 關題目", /stage !== 7 && stage !== 8/.test(gas));
check("GAS 回傳題目含 laneKey", /laneKey: clean_\(question\.laneKey/.test(gas));
check("GAS 回傳題目含授權欄位", /license: clean_\(question\.license/.test(gas));
check("GAS 清理題目文字的 Unicode 與控制字元", /function cleanQuestionText_\(value, maxLength\)/.test(gas) && /normalize\(\"NFC\"\)/.test(gas) && /replace\(\/\[\\u0000-\\u001f\\u007f\]\/g/.test(gas));

check("GAS 題庫管理支援列出、編輯與啟停", /action === \"listQuestions\"/.test(gas) && /function updateQuestion_\(id, question, updatedBy\)/.test(gas) && /function setQuestionEnabled_\(id, enabled\)/.test(gas) && /getQuestions_\(true\)/.test(gas));
check("前端題庫管理支援列表、編輯、啟停與重置", /function loadQuestionAdmin\(\)/.test(html) && /function saveQuestionAdmin\(\)/.test(html) && /setQuestionEnabled/.test(html) && /questionAdminList/.test(html) && /function resetQuestionEditor\(\)/.test(html));
check("教師可管理學生帳號並查看清單", /action === \"accounts\"/.test(gas) && /function getAccounts_\(limit\)/.test(gas) && /action: \"adminUpsertAccount\"/.test(html) && /function loadAccountsAdmin\(\)/.test(html) && /function saveAccountAdmin\(\)/.test(html));
check("題庫編輯使用版本衝突保護", /const expectedVersion = question\.expectedVersion === undefined \? question\.version : question\.expectedVersion/.test(gas) && /Question changed\. Reload before editing\./.test(gas) && /version:Number\(existing\?\.version\)\|\|1/.test(html));
check("題庫管理清單支援搜尋、關卡與狀態篩選", /questionAdminSearch/.test(html) && /questionAdminStage/.test(html) && /questionAdminStatus/.test(html) && /matchesStatus/.test(html));
check("GAS 跨表結算具 pending 與 event marker 恢復", gas.includes('"settlementEventsJson"') && gas.includes('status: "pending"') && /function updateSettlementStatus_\(eventId, status\)/.test(gas) && /normalizeSettlementEvents_/.test(gas));
check("GAS 建立 Accounts、Profiles、Sessions 三張表", /ensureSheet_\(SHEETS\.accounts, ACCOUNT_HEADERS\)/.test(gas) && /ensureSheet_\(SHEETS\.profiles, PROFILE_HEADERS\)/.test(gas) && /ensureSheet_\(SHEETS\.sessions, SESSION_HEADERS\)/.test(gas));
check("GAS 帳號格式固定五碼", /function parseAccount_\(value\)/.test(gas) && /\/\^\\d\{5\}\$\//.test(gas));
check("GAS 登入會建立工作階段", /action === "login"/.test(gas) && /createSession_\(identity\.accountId\)/.test(gas));
check("GAS 受保護 API 需要工作階段", /action === "loadProfile"/.test(gas) && /action === "saveProgress"/.test(gas) && /action === "saveRecord"/.test(gas) && /requireSession_\(payload\.sessionToken\)/.test(gas));
check("GAS Profile 使用版本衝突保護", /expectedVersion/.test(gas) && /Profile changed on another device/.test(gas) && /LockService\.getScriptLock\(\)/.test(gas));
check("GAS 密碼驗證使用 AUTH_PEPPER", /getProperty\("AUTH_PEPPER"\)/.test(gas) && /PASSWORD_ROUNDS/.test(gas));
check("GAS 紀錄身份取自登入帳號", /saveRecord_\(payload\.record \|\| \{\}, accountId\)/.test(gas) && /studentName: identity\.accountId/.test(gas));
check("前端 Profile 具有版本欄位", /function defaultProfile\(account\).*version:1/.test(html));
check("前端登入 GAS 後保存 session", /action:"login"/.test(html) && /sessionToken:res\.sessionToken/.test(html) && /saveAuth\(\)/.test(html));
check("前端 GAS 請求自動帶 session", /state\.auth\?\.sessionToken/.test(html) && /body\.sessionToken=state\.auth\.sessionToken/.test(html));
check("前端角色與裝備變更會同步 Profile", /function syncProfile\(\)/.test(html) && /function queueProfileSync\(\)/.test(html) && /queueProfileSync\(\)/.test(html));
check("前端有角色商店目錄", /const playerItemCatalog=/.test(html) && /const playerWeaponPrices=/.test(html) && /const playerGearPrices=/.test(html));
check("前端商店會依擁有權與等級禁用購買", /function renderShop\(\)/.test(html) && /data-shop-id/.test(html) && /需要 Lv\./.test(html));
check("前端關卡完成會顯示金幣與 XP 獎勵", /function grantLocalStageReward\(lv,accuracy\)/.test(html) && /獲得 \$\{reward\.coins\} 金幣/.test(html));
check("前端完成關卡會呼叫伺服器結算", /action:"finishStage"/.test(html) && /function settleStage\(record\)/.test(html));
check("GAS Profile 有 inventoryJson 欄位", /"inventoryJson"/.test(gas) && /function parseInventory_\(value\)/.test(gas));
check("GAS 商店目錄與購買交易存在", /const SHOP_CATALOG =/.test(gas) && /function purchase_\(accountId, itemId, expectedVersion\)/.test(gas) && /current\.coins < item\.price/.test(gas));
check("GAS 購買交易有版本與鎖定保護", /action === "purchase"/.test(gas) && /Profile changed on another device\. Please reload before buying\./.test(gas) && /lock\.waitLock\(5000\)/.test(gas));
check("GAS 關卡結算只接受第 1～8 關並獎勵寶石", /function finishStage_\(accountId, payload\)/.test(gas) && /stage < 1 \|\| stage > 8/.test(gas) && /gems\[stage - 1\] = true/.test(gas));
check("GAS saveProgress 不接受客戶端竄改進度", /level: current\.level/.test(gas) && /xp: current\.xp/.test(gas) && /gemsJson: JSON\.stringify\(normalizeGems_\(current\.gems\)\)/.test(gas));
check("前端天梯有暱稱格式與不雅字檢查", /function ladderName\(raw\)/.test(html) && /normalize\("NFKC"\)/.test(html) && /名稱不適合公開/.test(html));
check("前端天梯完成後才送出公開成績", /function submitLadder\(\)/.test(html) && /action:"finishLadder"/.test(html) && /ladderNameBox\.classList\.remove\("hidden"\)/.test(html));
check("前端天梯有本機榜且最多顯示前 50 名", /LADDER_STORE/.test(html) && /rows\.slice\(0,50\)/.test(html) && /公開顯示前 50 名/.test(html));
check("GAS 建立 LadderRuns、Leaderboard、NameBlocklist", /ensureSheet_\(SHEETS\.ladderRuns, LADDER_RUN_HEADERS\)/.test(gas) && /ensureSheet_\(SHEETS\.leaderboard, LEADERBOARD_HEADERS\)/.test(gas) && /ensureSheet_\(SHEETS\.nameBlocklist, NAME_BLOCKLIST_HEADERS\)/.test(gas));
check("GAS 天梯必須八顆寶石且使用一次性 runId", /function startLadder_\(accountId\)/.test(gas) && /gems\.length < 8/.test(gas) && /function finishLadder_\(accountId, payload\)/.test(gas) && /Invalid ladder run\./.test(gas));
check("GAS 天梯有到期、最低正確率與重送保護", /LADDER_RUN_TTL_MS/.test(gas) && /This ladder run has expired\./.test(gas) && /LADDER_MIN_ACCURACY/.test(gas) && /already been submitted/.test(gas));
check("GAS 公開排行榜每帳號最佳一筆且最多前 50 名", /function upsertLeaderboard_\(candidate\)/.test(gas) && /leaderboardBetter_\(candidate, found\.record\)/.test(gas) && /Math\.min\(Math\.max\(limit \|\| 50, 1\), 50\)/.test(gas) && /nickname: clean_\(entry\.displayName, 10\)/.test(gas));
check("GAS 關卡結算使用一次性事件帳本", /eventId = clean_\(payload\.eventId, 100\)/.test(gas) && /function finishStage_/.test(gas) && /SHEETS\.settlements/.test(gas) && /Settlement event belongs to another account/.test(gas));

if (failures.length) {
  console.error(`Question contract QA failed: ${failures.length}/${checks.length}`);
  failures.forEach(name => console.error(`FAIL ${name}`));
  process.exitCode = 1;
} else {
  console.log(`Question contract QA passed: ${checks.length}/${checks.length}`);
}
