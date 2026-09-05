import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const source = fs.readFileSync(path.join(root, "gas_code.gs"), "utf8");

class RangeMock {
  constructor(sheet, row, column, rows = 1, columns = 1) {
    this.sheet = sheet;
    this.row = row;
    this.column = column;
    this.rows = rows;
    this.columns = columns;
  }

  getValues() {
    return Array.from({ length: this.rows }, (_, rowOffset) =>
      Array.from({ length: this.columns }, (_, columnOffset) =>
        this.sheet.values[this.row - 1 + rowOffset]?.[this.column - 1 + columnOffset] ?? ""
      )
    );
  }

  setValues(values) {
    values.forEach((rowValues, rowOffset) => {
      const rowIndex = this.row - 1 + rowOffset;
      while (this.sheet.values.length <= rowIndex) this.sheet.values.push([]);
      rowValues.forEach((value, columnOffset) => {
        this.sheet.values[rowIndex][this.column - 1 + columnOffset] = value;
      });
    });
    return this;
  }

  setValue(value) {
    return this.setValues([[value]]);
  }
}

class SheetMock {
  constructor(name) {
    this.name = name;
    this.values = [[]];
  }

  getDataRange() {
    const columns = Math.max(1, ...this.values.map(row => row.length));
    return new RangeMock(this, 1, 1, Math.max(1, this.values.length), columns);
  }

  getRange(row, column, rows = 1, columns = 1) {
    return new RangeMock(this, row, column, rows, columns);
  }

  appendRow(values) {
    this.values.push([...values]);
  }

  setFrozenRows() {}
}

class SpreadsheetMock {
  constructor() {
    this.sheets = new Map();
  }

  getSheetByName(name) {
    return this.sheets.get(name) || null;
  }

  insertSheet(name) {
    const sheet = new SheetMock(name);
    this.sheets.set(name, sheet);
    return sheet;
  }
}

const spreadsheet = new SpreadsheetMock();
const properties = new Map([
  ["AUTH_PEPPER", "contract-test-pepper-20260901"],
  ["ADMIN_TOKEN", "contract-test-admin"]
]);
let uuidCounter = 0;
const utilities = {
  DigestAlgorithm: { SHA_256: "SHA_256" },
  Charset: { UTF_8: "UTF_8" },
  getUuid() {
    uuidCounter += 1;
    return `00000000-0000-4000-8000-${String(uuidCounter).padStart(12, "0")}`;
  },
  computeDigest(_algorithm, value) {
    return [...crypto.createHash("sha256").update(String(value), "utf8").digest()];
  }
};

const context = {
  console,
  Date,
  JSON,
  Math,
  Number,
  Object,
  RegExp,
  String,
  Array,
  SpreadsheetApp: {
    getActiveSpreadsheet: () => spreadsheet,
    openById: () => spreadsheet
  },
  PropertiesService: {
    getScriptProperties: () => ({ getProperty: key => properties.get(key) || "" })
  },
  Utilities: utilities,
  LockService: {
    getScriptLock: () => ({ waitLock() {}, releaseLock() {} })
  },
  ContentService: {
    MimeType: { JSON: "application/json" },
    createTextOutput(value) {
      return {
        getContent: () => value,
        setMimeType() { return this; }
      };
    }
  }
};
vm.createContext(context);
vm.runInContext(source, context, { filename: "gas_code.gs" });

const failures = [];
function check(name, condition, detail = "") {
  if (condition) {
    console.log(`PASS ${name}`);
  } else {
    failures.push(`${name}${detail ? ` (${detail})` : ""}`);
    console.log(`FAIL ${name}${detail ? ` (${detail})` : ""}`);
  }
}

function post(payload) {
  const output = context.doPost({ postData: { contents: JSON.stringify(payload) } });
  return JSON.parse(output.getContent());
}

function get(action, params = {}) {
  const output = context.doGet({ parameter: { action, ...params } });
  return JSON.parse(output.getContent());
}

function expectError(name, payload, pattern) {
  const result = post(payload);
  check(name, !result.ok && pattern.test(String(result.error || "")), result.error);
}

context.setup();
check("GAS 建立九張資料表", ["Records", "Questions", "Accounts", "Profiles", "Sessions", "LadderRuns", "Leaderboard", "NameBlocklist", "StageSettlements"].every(name => spreadsheet.getSheetByName(name)));

const admin = post({ action: "adminUpsertAccount", token: "contract-test-admin", account: { accountId: "50101", displayName: "測試學生" } });
check("管理者建立五碼帳號", admin.ok && admin.account.accountId === "50101");
const login = post({ action: "login", account: "50101", password: "50101" });
check("登入回傳 session", login.ok && login.sessionToken && login.profile.accountId === "50101");
expectError("錯誤密碼被拒絕", { action: "login", account: "50101", password: "50102" }, /incorrect|incorrect/i);
expectError("未登入不能載入存檔", { action: "loadProfile" }, /Session is required/);

const token = login.sessionToken;
let profile = post({ action: "loadProfile", sessionToken: token }).profile;
check("登入後可載入初始存檔", profile.version === 1 && profile.level === 1 && profile.weapon === "starlight");
const synced = post({ action: "saveProgress", sessionToken: token, expectedVersion: profile.version, profile: { hero: "female", level: 10, coins: 99999, weapon: "shadow", gear: "crown" } });
check("saveProgress 只同步外觀不接收作弊進度", synced.ok && synced.profile.hero === "female" && synced.profile.level === 1 && synced.profile.coins === 0 && synced.profile.weapon === "starlight");
profile = synced.profile;
expectError("版本衝突被拒絕", { action: "saveProgress", sessionToken: token, expectedVersion: 1, profile: { hero: "male" } }, /changed/);

const minimumCorrect = [0, 76, 51, 68, 64, 50, 43, 25, 25];
const settledVersions = [];
for (let stage = 1; stage <= 8; stage += 1) {
  const result = post({ action: "finishStage", sessionToken: token, eventId: `stage-event-${stage}`, stage, result: "win", correct: minimumCorrect[stage], attempts: minimumCorrect[stage] + 2, durationSec: 180, maxCombo: 10 });
  check(`第 ${stage} 關可完成結算`, result.ok && result.profile.gems[stage - 1] === true);
  profile = result.profile;
  settledVersions.push(profile.version);
}
const duplicate = post({ action: "finishStage", sessionToken: token, eventId: "stage-event-8", stage: 8, result: "win", correct: minimumCorrect[8], attempts: minimumCorrect[8] + 2, durationSec: 180, maxCombo: 10 });
check("同一關卡結算事件不可重複領獎", duplicate.ok && duplicate.profile.version === settledVersions[7]);
expectError("不足最低題數不能結算", { action: "finishStage", sessionToken: token, eventId: "under-minimum", stage: 1, result: "win", correct: 0, attempts: 0, durationSec: 180 }, /enough correct/);

const prepared = context.persistProfile_("50101", { ...profile, level: 10, coins: 10000, version: profile.version + 1 });
const purchaseIce = post({ action: "purchase", sessionToken: token, itemId: "ice", expectedVersion: prepared.version });
check("購買武器會扣款並自動裝備", purchaseIce.ok && purchaseIce.profile.weapon === "ice" && purchaseIce.profile.inventory.weapons.includes("ice") && purchaseIce.profile.coins < 10000);
expectError("武器不可重複購買", { action: "purchase", sessionToken: token, itemId: "ice", expectedVersion: purchaseIce.profile.version }, /already owned/);
const purchasePotion = post({ action: "purchase", sessionToken: token, itemId: "potion", expectedVersion: purchaseIce.profile.version });
check("消耗品購買會增加持有數", purchasePotion.ok && purchasePotion.profile.inventory.items.potion === 1);
const cappedInventory = {...purchasePotion.profile.inventory, items:{...purchasePotion.profile.inventory.items,potion:99}};
const capped = context.persistProfile_("50101", {...purchasePotion.profile, inventory:cappedInventory});
expectError("滿99個道具拒絕購買", {action:"purchase",sessionToken:token,itemId:"potion",expectedVersion:capped.version}, /99/);
const afterCap=post({action:"loadProfile",sessionToken:token}).profile;
check("滿庫存拒絕不扣錢或增加版本",afterCap.coins===capped.coins&&afterCap.version===capped.version&&afterCap.inventory.items.potion===99);
expectError("未登入不可建立道具局",{action:"startItemRun",runId:"qa-item-run-001",stage:1,expectedVersion:afterCap.version},/Session/);
const itemRun=post({action:"startItemRun",sessionToken:token,runId:"qa-item-run-001",stage:1,expectedVersion:afterCap.version});
check("建立道具局保留庫存",itemRun.ok&&itemRun.profile.inventory.items.potion===99);
const itemPayload={action:"consumeItem",sessionToken:token,runId:"qa-item-run-001",itemId:"potion",eventId:"qa-item-event-001",expectedVersion:itemRun.profile.version};
const consumed=post(itemPayload);
check("使用道具與收據一起保存",consumed.ok&&consumed.profile.inventory.items.potion===98&&consumed.profile.inventory.itemRun.used.potion===itemPayload.eventId);
const retried=post(itemPayload);
check("超時重試同一事件不重複扣除",retried.ok&&retried.profile.version===consumed.profile.version&&retried.profile.inventory.items.potion===98);
expectError("同一局同種道具不可再用",{...itemPayload,eventId:"qa-item-event-002",expectedVersion:consumed.profile.version},/already used/);
expectError("事件不能改成其他道具",{...itemPayload,itemId:"shield",expectedVersion:consumed.profile.version},/another item/);
expectError("空庫存不可使用",{...itemPayload,itemId:"shield",eventId:"qa-item-event-003",expectedVersion:consumed.profile.version},/No item/);
expectError("武器不能當消耗品",{...itemPayload,itemId:"ice"},/Invalid consumable/);
const forged=post({action:"saveProgress",sessionToken:token,expectedVersion:consumed.profile.version,profile:{hero:"female",inventory:{items:{potion:99},itemRun:{id:"forged-run",used:{}}}}});
check("同步外觀不能還原庫存或清除收據",forged.ok&&forged.profile.inventory.items.potion===98&&forged.profile.inventory.itemRun.used.potion===itemPayload.eventId);
const nextRun=post({action:"startItemRun",sessionToken:token,runId:"qa-item-run-002",stage:1,expectedVersion:forged.profile.version});
check("新局可以重設使用上限",nextRun.ok&&Object.keys(nextRun.profile.inventory.itemRun.used).length===0);
expectError("舊局請求不能扣新局庫存",{...itemPayload,expectedVersion:nextRun.profile.version},/no longer active/);
expectError("版本過期不可使用道具",{...itemPayload,runId:"qa-item-run-002",expectedVersion:1},/changed/);
const persistNormally=context.persistProfile_;
context.persistProfile_=(...args)=>{persistNormally(...args);throw new Error("simulated lost response after commit")};
const lostPayload={...itemPayload,runId:"qa-item-run-002",eventId:"qa-lost-response-001",expectedVersion:nextRun.profile.version};
expectError("模擬已扣庫存但回覆中斷",lostPayload,/lost response/);
context.persistProfile_=persistNormally;
const recovered=post(lostPayload);
check("中斷後相同事件恢復成功且只扣一次",recovered.ok&&recovered.profile.inventory.items.potion===97);
expectError("已建立局不能重用ID換關",{action:"startItemRun",sessionToken:token,runId:"qa-item-run-002",stage:2,expectedVersion:recovered.profile.version},/mismatch/);
const withStar=context.persistProfile_("50101",{...recovered.profile,inventory:{...recovered.profile.inventory,items:{...recovered.profile.inventory.items,comboStar:1}}});
const spentStar=post({action:"consumeItem",sessionToken:token,runId:"qa-item-run-002",itemId:"comboStar",eventId:"qa-star-event-001",expectedVersion:withStar.version});
const bonusFinish=post({action:"finishStage",sessionToken:token,eventId:"qa-star-finish-001",itemRunId:"qa-item-run-002",stage:1,result:"win",correct:76,attempts:76,maxCombo:0});
check("星星由伺服器收據增加10%通關金幣",bonusFinish.ok&&bonusFinish.profile.coins-spentStar.profile.coins===46);
check("結算關閉道具局",bonusFinish.profile.inventory.itemRun.closed===true);
expectError("結算後不能再消耗其他道具",{action:"consumeItem",sessionToken:token,runId:"qa-item-run-002",itemId:"hint",eventId:"qa-after-finish-001",expectedVersion:bonusFinish.profile.version},/closed/);
post({action:"adminUpsertAccount",token:"contract-test-admin",account:{accountId:"50102",displayName:"隔離帳號"}});
const otherLogin=post({action:"login",account:"50102",password:"50102"});
expectError("其他帳號不能使用本帳號道具局",{...lostPayload,sessionToken:otherLogin.sessionToken},/no longer active/);

const ladder = post({ action: "startLadder", sessionToken: token });
expectError("未登入不能關閉道具局",{action:"closeItemRun",runId:"qa-close-run-001"},/Session/);
expectError("關閉道具局拒絕非法ID",{action:"closeItemRun",sessionToken:token,runId:"x"},/Invalid item run/);
const beforeCloseRun=post({action:"loadProfile",sessionToken:token}).profile;
const closeRun=post({action:"startItemRun",sessionToken:token,runId:"qa-close-run-001",stage:1,expectedVersion:beforeCloseRun.version});
const foreignClose=post({action:"closeItemRun",sessionToken:otherLogin.sessionToken,runId:"qa-close-run-001"});
check("其他帳號關閉不影響原帳號",foreignClose.ok&&!post({action:"loadProfile",sessionToken:token}).profile.inventory.itemRun.closed);
const closedRun=post({action:"closeItemRun",sessionToken:token,runId:"qa-close-run-001",expectedVersion:0});
check("離場關閉不依賴過期版本且不扣庫存",closedRun.ok&&closedRun.profile.inventory.itemRun.closed&&closedRun.profile.version===closeRun.profile.version+1&&closedRun.profile.inventory.items.potion===closeRun.profile.inventory.items.potion);
const closeRetry=post({action:"closeItemRun",sessionToken:token,runId:"qa-close-run-001"});
check("重複關閉不增加版本",closeRetry.ok&&closeRetry.profile.version===closedRun.profile.version);
expectError("離場後不能再消耗道具",{...itemPayload,runId:"qa-close-run-001",eventId:"qa-close-consume-001",expectedVersion:closedRun.profile.version},/closed/);
const newerRun=post({action:"startItemRun",sessionToken:token,runId:"qa-close-run-002",stage:1,expectedVersion:closedRun.profile.version});
const staleClose=post({action:"closeItemRun",sessionToken:token,runId:"qa-close-run-001"});
check("延遲關閉舊局不關新局也不改版本",staleClose.ok&&staleClose.profile.inventory.itemRun.id==="qa-close-run-002"&&!staleClose.profile.inventory.itemRun.closed&&staleClose.profile.version===newerRun.profile.version);
context.persistProfile_=(...args)=>{persistNormally(...args);throw new Error("simulated close response lost")};
expectError("模擬關閉已寫入但回覆中斷",{action:"closeItemRun",sessionToken:token,runId:"qa-close-run-002"},/response lost/);
context.persistProfile_=persistNormally;
const closeRecovered=post({action:"closeItemRun",sessionToken:token,runId:"qa-close-run-002"});
check("關閉回覆中斷後可冪等重送",closeRecovered.ok&&closeRecovered.profile.inventory.itemRun.closed&&closeRecovered.profile.version===newerRun.profile.version+1);
const receiptRun=post({action:"startItemRun",sessionToken:token,runId:"qa-close-receipt-001",stage:9,expectedVersion:closeRecovered.profile.version});
const receiptPayload={...itemPayload,runId:"qa-close-receipt-001",eventId:"qa-close-receipt-event",expectedVersion:receiptRun.profile.version};
const receiptUsed=post(receiptPayload);
const receiptClosed=post({action:"closeItemRun",sessionToken:token,runId:"qa-close-receipt-001"});
const receiptRetry=post(receiptPayload);
check("天梯關閉後已完成使用收據仍可安全重送",receiptRetry.ok&&receiptRetry.profile.inventory.items.potion===receiptUsed.profile.inventory.items.potion&&receiptRetry.profile.version===receiptClosed.profile.version&&receiptRetry.profile.inventory.itemRun.closed);
check("關閉保留經驗金幣寶石與道具收據",receiptClosed.profile.coins===receiptUsed.profile.coins&&receiptClosed.profile.xp===receiptUsed.profile.xp&&JSON.stringify(receiptClosed.profile.gems)===JSON.stringify(receiptUsed.profile.gems)&&receiptClosed.profile.inventory.itemRun.used.potion===receiptPayload.eventId);
const closedStartRetry=post({action:"startItemRun",sessionToken:token,runId:"qa-close-receipt-001",stage:9,expectedVersion:receiptRun.profile.version});
check("重送建立請求不重新開啟已關閉局",closedStartRetry.ok&&closedStartRetry.profile.inventory.itemRun.closed&&closedStartRetry.profile.version===receiptClosed.profile.version);
check("集滿八顆寶石才能建立天梯", ladder.ok && ladder.run.runId && ladder.run.expiresAt);
const badName = post({ action: "nameCheck", sessionToken: token, nickname: "fuck" });
check("天梯暱稱會過濾不雅字", badName.ok === false);
const finishLadder = post({ action: "finishLadder", sessionToken: token, runId: ladder.run.runId, nickname: "星光勇者", floor: 99, score: 999999, accuracy: 90, correct: 90, attempts: 100, durationMs: 120000 });
check("天梯完成會限制樓層與分數上限", finishLadder.ok && finishLadder.entry.floor === 9 && finishLadder.entry.score === 40500);
expectError("天梯 run 不可重複送出", { action: "finishLadder", sessionToken: token, runId: ladder.run.runId, nickname: "星光勇者", floor: 9, score: 100, correct: 90, attempts: 100, durationMs: 120000 }, /already been submitted/);
const leaderboard = get("leaderboard", { limit: "50" });
check("公開排行榜只回傳可公開前 50 名", leaderboard.ok && leaderboard.records.length === 1 && leaderboard.records[0].nickname === "星光勇者");

post({ action: "logout", sessionToken: token });
expectError("登出後 session 失效", { action: "loadProfile", sessionToken: token }, /expired|Session/);

console.log(`\nGAS contract QA summary: ${failures.length ? "FAIL" : "PASS"} (${failures.length} failures)`);
if (failures.length) {
  for (const failure of failures) console.error(`- ${failure}`);
  process.exitCode = 1;
}
