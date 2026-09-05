const SPREADSHEET_ID = "";
const ADMIN_TOKEN = "change-this-admin-password";

const SHEETS = {
  records: "Records",
  questions: "Questions",
  accounts: "Accounts",
  profiles: "Profiles",
  sessions: "Sessions",
  ladderRuns: "LadderRuns",
  leaderboard: "Leaderboard",
  nameBlocklist: "NameBlocklist",
  settlements: "StageSettlements"
};

const ACCOUNT_HEADERS = [
  "accountId",
  "classCode",
  "seatNo",
  "passwordVerifier",
  "displayName",
  "status",
  "createdAt",
  "updatedAt"
];

const PROFILE_HEADERS = [
  "accountId",
  "version",
  "hero",
  "level",
  "xp",
  "coins",
  "gemsJson",
  "weapon",
  "gear",
  "inventoryJson",
  "updatedAt"
];

const SESSION_HEADERS = [
  "tokenHash",
  "accountId",
  "createdAt",
  "expiresAt",
  "revokedAt"
];

const SESSION_TTL_MS = 4 * 60 * 60 * 1000;
const PASSWORD_ROUNDS = 12000;

const SHOP_CATALOG = {
  starlight: { kind: "weapon", price: 0, unlockLevel: 1 },
  ice: { kind: "weapon", price: 350, unlockLevel: 4 },
  fire: { kind: "weapon", price: 650, unlockLevel: 5 },
  thunder: { kind: "weapon", price: 1000, unlockLevel: 7 },
  shadow: { kind: "weapon", price: 1500, unlockLevel: 8 },
  focus: { kind: "gear", price: 0, unlockLevel: 1 },
  guardian: { kind: "gear", price: 260, unlockLevel: 4 },
  combo: { kind: "gear", price: 520, unlockLevel: 7 },
  crown: { kind: "gear", price: 900, unlockLevel: 10 },
  potion: { kind: "item", price: 120, unlockLevel: 1 },
  shield: { kind: "item", price: 250, unlockLevel: 1 },
  hourglass: { kind: "item", price: 300, unlockLevel: 1 },
  hint: { kind: "item", price: 180, unlockLevel: 1 },
  comboStar: { kind: "item", price: 400, unlockLevel: 1 }
};

const FIRST_CLEAR_COINS = [0, 120, 140, 160, 180, 210, 240, 280, 320];
const REPEAT_CLEAR_COINS = [0, 35, 40, 45, 50, 60, 70, 80, 90];
// A stage can only settle after all four practice waves and the Boss phases
// have produced their minimum correct answers. The frontend uses the same
// practice counts and Boss minimums; GAS enforces the lower bound as well.
const STAGE_MIN_CORRECT = Object.freeze({
  1: 76,
  2: 51,
  3: 68,
  4: 64,
  5: 50,
  6: 43,
  7: 25,
  8: 25
});
const LADDER_SEASON_ID = "2026-S2";
const LADDER_RUN_TTL_MS = 15 * 60 * 1000;
const LADDER_MIN_ACCURACY = 85;
const LADDER_RUN_HEADERS = [
  "runId", "seasonId", "accountId", "seed", "startAt", "expiresAt", "finishAt",
  "floor", "score", "accuracy", "durationMs", "status", "nickname", "createdAt"
];
const LEADERBOARD_HEADERS = [
  "seasonId", "accountId", "displayName", "floor", "score", "accuracy",
  "durationMs", "achievedAt", "moderationStatus"
];
const NAME_BLOCKLIST_HEADERS = ["pattern", "type", "enabled", "note"];
const SETTLEMENT_HEADERS = ["eventId", "accountId", "stage", "reward", "xpGain", "createdAt"];
const DEFAULT_NAME_BLOCKLIST = ["幹", "屌", "操", "他媽", "媽的", "白癡", "智障", "fuck", "shit", "bitch", "asshole"];

const RECORD_HEADERS = [
  "createdAt",
  "className",
  "studentName",
  "seatNo",
  "mode",
  "zone",
  "result",
  "score",
  "correct",
  "attempts",
  "accuracy",
  "cpm",
  "wpm",
  "durationSec",
  "stage",
  "appVersion",
  "userAgent"
];

const QUESTION_HEADERS = [
  "id",
  "createdAt",
  "updatedAt",
  "mode",
  "prompt",
  "answer",
  "zone",
  "difficulty",
  "enabled",
  "createdBy",
  "stage",
  "wave",
  "display",
  "laneKey",
  "tags",
  "source",
  "license",
  "version"
];

function setup() {
  ensureSheets_();
}

function doGet(e) {
  try {
    ensureSheets_();
    const action = String((e.parameter.action || "ping")).trim();

    if (action === "ping") {
      return json_({ ok: true, message: "Typing Hunter GAS is ready." });
    }

    if (action === "leaderboard") {
      return json_({
        ok: true,
        records: getLeaderboard_(e.parameter.mode || "ladder", Number(e.parameter.limit || 50))
      });
    }

    if (action === "questions") {
      return json_({ ok: true, questions: getQuestions_() });
    }

    if (action === "students") {
      verifyAdmin_(e.parameter.token);
      return json_({
        ok: true,
        students: getStudents_(Number(e.parameter.limit || 100))
      });
    }

    return json_({ ok: false, error: "Unknown action." });
  } catch (error) {
    return json_({ ok: false, error: error.message });
  }
}

function doPost(e) {
  try {
    ensureSheets_();
    const payload = parsePost_(e);
    const action = String(payload.action || "").trim();

    if (action === "login") {
      return json_({ ok: true, ...login_(payload.account, payload.password) });
    }

    if (action === "logout") {
      revokeSession_(payload.sessionToken);
      return json_({ ok: true });
    }

    if (action === "loadProfile") {
      const accountId = requireSession_(payload.sessionToken);
      return json_({ ok: true, profile: getProfile_(accountId) });
    }

    if (action === "saveProgress") {
      const accountId = requireSession_(payload.sessionToken);
      return json_({ ok: true, profile: saveProgress_(accountId, payload.profile || {}, payload.expectedVersion) });
    }

    if (action === "purchase") {
      const accountId = requireSession_(payload.sessionToken);
      return json_({ ok: true, profile: purchase_(accountId, payload.itemId, payload.expectedVersion) });
    }

    if (action === "startItemRun") {
      const accountId = requireSession_(payload.sessionToken);
      return json_({ ok: true, profile: startItemRun_(accountId, payload) });
    }
    if (action === "consumeItem") {
      const accountId = requireSession_(payload.sessionToken);
      return json_({ ok: true, profile: consumeItem_(accountId, payload) });
    }
    if (action === "closeItemRun") {
      const accountId = requireSession_(payload.sessionToken);
      return json_({ ok: true, profile: closeItemRun_(accountId, payload) });
    }

    if (action === "finishStage") {
      const accountId = requireSession_(payload.sessionToken);
      return json_({ ok: true, profile: finishStage_(accountId, payload) });
    }

    if (action === "startLadder") {
      const accountId = requireSession_(payload.sessionToken);
      return json_({ ok: true, run: startLadder_(accountId) });
    }

    if (action === "nameCheck") {
      requireSession_(payload.sessionToken);
      return json_(validateNickname_(payload.nickname));
    }

    if (action === "finishLadder") {
      const accountId = requireSession_(payload.sessionToken);
      return json_({ ok: true, entry: finishLadder_(accountId, payload) });
    }

    if (action === "adminUpsertAccount") {
      verifyAdmin_(payload.token);
      return json_({ ok: true, account: upsertAccount_(payload.account || {}) });
    }

    if (action === "saveRecord") {
      const accountId = requireSession_(payload.sessionToken);
      saveRecord_(payload.record || {}, accountId);
      return json_({ ok: true });
    }

    if (action === "addQuestion") {
      verifyAdmin_(payload.token);
      const question = addQuestion_(payload.question || {}, payload.createdBy || "admin");
      return json_({ ok: true, question });
    }

    if (action === "deleteQuestion") {
      verifyAdmin_(payload.token);
      deleteQuestion_(payload.id);
      return json_({ ok: true });
    }

    return json_({ ok: false, error: "Unknown action." });
  } catch (error) {
    return json_({ ok: false, error: error.message });
  }
}

function parsePost_(e) {
  if (!e || !e.postData || !e.postData.contents) return {};
  return JSON.parse(e.postData.contents);
}

function parseAccount_(value) {
  const accountId = clean_(value, 5);
  if (!/^\d{5}$/.test(accountId)) {
    throw new Error("Account must be a five-digit class and seat number.");
  }
  return {
    accountId: accountId,
    classCode: accountId.slice(0, 3),
    seatNo: accountId.slice(3)
  };
}

function login_(account, password) {
  const identity = parseAccount_(account);
  const secret = clean_(password, 5);
  if (!/^\d{5}$/.test(secret)) {
    throw new Error("Password must be a five-digit number.");
  }

  const row = findRow_(SHEETS.accounts, "accountId", identity.accountId);
  if (!row || String(row.record.status || "active").toLowerCase() !== "active") {
    throw new Error("Account is not available. Please ask the teacher to create it.");
  }
  if (!verifyPassword_(secret, row.record.passwordVerifier)) {
    throw new Error("Account or password is incorrect.");
  }

  const session = createSession_(identity.accountId);
  return {
    accountId: identity.accountId,
    sessionToken: session.token,
    expiresAt: session.expiresAt,
    profile: getProfile_(identity.accountId)
  };
}

function upsertAccount_(input) {
  const identity = parseAccount_(input.accountId);
  const suppliedPassword = Object.prototype.hasOwnProperty.call(input, "password");
  const password = suppliedPassword ? clean_(input.password, 5) : identity.accountId;
  if (!/^\d{5}$/.test(password)) {
    throw new Error("Initial password must be a five-digit number.");
  }

  const lock = LockService.getScriptLock();
  lock.waitLock(5000);
  try {
    const now = new Date().toISOString();
    const existing = findRow_(SHEETS.accounts, "accountId", identity.accountId);
    const record = existing ? existing.record : {};
    const safe = {
      accountId: identity.accountId,
      classCode: identity.classCode,
      seatNo: identity.seatNo,
      passwordVerifier: suppliedPassword || !record.passwordVerifier
        ? makePasswordVerifier_(password)
        : String(record.passwordVerifier),
      displayName: clean_(input.displayName || record.displayName || identity.accountId, 40),
      status: String(input.status || record.status || "active").toLowerCase() === "disabled" ? "disabled" : "active",
      createdAt: record.createdAt || now,
      updatedAt: now
    };

    if (existing) {
      existing.sheet.getRange(existing.rowNumber, 1, 1, ACCOUNT_HEADERS.length)
        .setValues([ACCOUNT_HEADERS.map(function(header) { return safe[header]; })]);
    } else {
      getSheet_(SHEETS.accounts).appendRow(ACCOUNT_HEADERS.map(function(header) { return safe[header]; }));
    }
    return {
      accountId: safe.accountId,
      classCode: safe.classCode,
      seatNo: safe.seatNo,
      displayName: safe.displayName,
      status: safe.status
    };
  } finally {
    lock.releaseLock();
  }
}

function createSession_(accountId) {
  const token = Utilities.getUuid() + Utilities.getUuid();
  const expiresAt = new Date(Date.now() + SESSION_TTL_MS).toISOString();
  getSheet_(SHEETS.sessions).appendRow([
    digestHex_(token),
    accountId,
    new Date().toISOString(),
    expiresAt,
    ""
  ]);
  return { token: token, expiresAt: expiresAt };
}

function requireSession_(token) {
  const value = String(token || "").trim();
  if (!value) throw new Error("Session is required.");
  const row = findRow_(SHEETS.sessions, "tokenHash", digestHex_(value));
  if (!row || row.record.revokedAt || new Date(String(row.record.expiresAt || 0)).getTime() <= Date.now()) {
    throw new Error("Session expired. Please log in again.");
  }
  return parseAccount_(row.record.accountId).accountId;
}

function revokeSession_(token) {
  const value = String(token || "").trim();
  if (!value) return;
  const row = findRow_(SHEETS.sessions, "tokenHash", digestHex_(value));
  if (row) row.sheet.getRange(row.rowNumber, SESSION_HEADERS.indexOf("revokedAt") + 1).setValue(new Date().toISOString());
}

function getProfile_(accountId) {
  const identity = parseAccount_(accountId);
  const row = findRow_(SHEETS.profiles, "accountId", identity.accountId);
  if (!row) {
    const profile = defaultProfile_(identity.accountId);
    getSheet_(SHEETS.profiles).appendRow(PROFILE_HEADERS.map(function(header) { return profile[header]; }));
    return profile;
  }
  return profileFromRow_(row.record, identity.accountId);
}

function saveProgress_(accountId, input, expectedVersion) {
  const identity = parseAccount_(accountId);
  const lock = LockService.getScriptLock();
  lock.waitLock(5000);
  try {
    const currentRow = findRow_(SHEETS.profiles, "accountId", identity.accountId);
    const current = currentRow ? profileFromRow_(currentRow.record, identity.accountId) : defaultProfile_(identity.accountId);
    if (expectedVersion !== undefined && expectedVersion !== null && Number(expectedVersion) !== current.version) {
      throw new Error("Profile changed on another device. Please reload before saving.");
    }

    const inventory = parseInventory_(current.inventory);
    const requestedWeapon = String(input.weapon || "");
    const requestedGear = String(input.gear || "");

    const safe = {
      accountId: identity.accountId,
      version: current.version + 1,
      hero: input.hero === "female" ? "female" : "male",
      // Progression is server-owned; saveProgress_ only syncs presentation state.
      level: current.level,
      xp: current.xp,
      coins: current.coins,
      gemsJson: JSON.stringify(normalizeGems_(current.gems)),
      weapon: inventory.weapons.indexOf(requestedWeapon) >= 0 ? requestedWeapon : current.weapon,
      gear: inventory.gear.indexOf(requestedGear) >= 0 ? requestedGear : current.gear,
      inventoryJson: JSON.stringify(inventory),
      updatedAt: new Date().toISOString()
    };

    if (currentRow) {
      currentRow.sheet.getRange(currentRow.rowNumber, 1, 1, PROFILE_HEADERS.length)
        .setValues([PROFILE_HEADERS.map(function(header) { return safe[header]; })]);
    } else {
      getSheet_(SHEETS.profiles).appendRow(PROFILE_HEADERS.map(function(header) { return safe[header]; }));
    }
    return profileFromRow_(safe, identity.accountId);
  } finally {
    lock.releaseLock();
  }
}

function defaultProfile_(accountId) {
  return {
    accountId: accountId,
    version: 1,
    hero: "male",
    level: 1,
    xp: 0,
    coins: 0,
    gemsJson: "[]",
    weapon: "starlight",
    gear: "focus",
    inventoryJson: JSON.stringify(defaultInventory_()),
    updatedAt: new Date().toISOString()
  };
}

function profileFromRow_(record, accountId) {
  return {
    accountId: accountId,
    version: Math.max(1, number_(record.version) || 1),
    hero: record.hero === "female" ? "female" : "male",
    level: Math.max(1, Math.min(10, number_(record.level) || 1)),
    xp: Math.max(0, number_(record.xp)),
    coins: Math.max(0, number_(record.coins)),
    gems: normalizeGems_(record.gemsJson),
    weapon: ["starlight", "ice", "fire", "thunder", "shadow"].indexOf(record.weapon) >= 0 ? record.weapon : "starlight",
    gear: ["focus", "guardian", "combo", "crown"].indexOf(record.gear) >= 0 ? record.gear : "focus",
    inventory: parseInventory_(record.inventoryJson),
    updatedAt: clean_(record.updatedAt)
  };
}

function defaultInventory_() {
  return { weapons: ["starlight"], gear: ["focus"], items: {} };
}

function parseInventory_(value) {
  let raw = value;
  if (typeof value === "string") {
    try { raw = JSON.parse(value); } catch (error) { raw = null; }
  }
  const base = defaultInventory_();
  const source = raw && typeof raw === "object" ? raw : {};
  const weapons = Array.isArray(source.weapons) ? source.weapons : [];
  const gear = Array.isArray(source.gear) ? source.gear : [];
  const items = source.items && typeof source.items === "object" ? source.items : {};
  const safeItems = {};
  Object.keys(SHOP_CATALOG).forEach(function(id) {
    if (SHOP_CATALOG[id].kind === "item") safeItems[id] = Math.max(0, Math.min(99, number_(items[id])));
  });
  const safeWeapons = base.weapons.concat(weapons.filter(function(id) {
    return SHOP_CATALOG[id] && SHOP_CATALOG[id].kind === "weapon";
  })).filter(function(id, index, list) { return list.indexOf(id) === index; });
  const safeGear = base.gear.concat(gear.filter(function(id) {
    return SHOP_CATALOG[id] && SHOP_CATALOG[id].kind === "gear";
  })).filter(function(id, index, list) { return list.indexOf(id) === index; });
  const result = { weapons: safeWeapons, gear: safeGear, items: safeItems };
  // This metadata is only accepted from the stored profile, never saveProgress input.
  const run = source.itemRun;
  if (run && typeof run === "object" && typeof run.id === "string") {
    const used = {};
    Object.keys(safeItems).forEach(function(id) {
      if (typeof run.used?.[id] === "string") used[id] = run.used[id].slice(0,100);
    });
    result.itemRun = { id: run.id.slice(0,100), stage: Number(run.stage), expiresAt: Number(run.expiresAt), closed:!!run.closed, used: used };
  }
  return result;
}

function startItemRun_(accountId, payload) {
  const id = clean_(payload.runId,100), stage = Number(payload.stage);
  if (!/^[A-Za-z0-9-]{8,100}$/.test(id) || !Number.isInteger(stage) || stage < 1 || stage > 9) throw new Error("Invalid item run.");
  const lock = LockService.getScriptLock();
  lock.waitLock(5000);
  try {
    const current = getProfile_(accountId), inventory = parseInventory_(current.inventory);
    if (inventory.itemRun?.id === id) {
      if (inventory.itemRun.stage !== stage) throw new Error("Run stage mismatch.");
      return current;
    }
    if (Number(payload.expectedVersion) !== current.version) throw new Error("Profile changed. Reload before starting.");
    const gems = normalizeGems_(current.gems);
    if (stage > 1 && !gems[stage-2]) throw new Error("Complete the previous stage first.");
    if (stage === 9 && (gems.length < 8 || gems.some(function(gem) { return !gem; }))) throw new Error("Collect all eight gems first.");
    inventory.itemRun = {id:id,stage:stage,expiresAt:Date.now()+30*60*1000,used:{}};
    current.inventory = inventory;current.version += 1;
    current.updatedAt = new Date().toISOString();
    return persistProfile_(accountId,current);
  } finally { lock.releaseLock(); }
}

function closeItemRun_(accountId, payload) {
  const id = String(payload.runId || "");
  if (!/^[A-Za-z0-9-]{8,100}$/.test(id)) throw new Error("Invalid item run.");
  const lock = LockService.getScriptLock();
  lock.waitLock(5000);
  try {
    const current = getProfile_(accountId), inventory = parseInventory_(current.inventory);
    const run = inventory.itemRun;
    // A delayed close may arrive after another battle has replaced this run.
    if (!run || run.id !== id || run.closed) return current;
    run.closed = true;
    current.inventory = inventory;current.version += 1;
    current.updatedAt = new Date().toISOString();
    return persistProfile_(accountId,current);
  } finally { lock.releaseLock(); }
}

function consumeItem_(accountId, payload) {
  const id = String(payload.itemId || ""), eventId = clean_(payload.eventId,100);
  if (!Object.prototype.hasOwnProperty.call(SHOP_CATALOG,id) || SHOP_CATALOG[id].kind !== "item" || !/^[A-Za-z0-9-]{8,100}$/.test(eventId)) throw new Error("Invalid consumable event.");
  const lock = LockService.getScriptLock();
  lock.waitLock(5000);
  try {
    const current = getProfile_(accountId), inventory = parseInventory_(current.inventory), run = inventory.itemRun;
    if (!run || run.id !== payload.runId) throw new Error("Item run is no longer active.");
    if (run.used[id] === eventId) return current;
    if (run.closed) throw new Error("Item run is closed.");
    if (run.expiresAt < Date.now()) throw new Error("Item run expired.");
    if (Object.values(run.used).indexOf(eventId) >= 0) throw new Error("Event already belongs to another item.");
    if (run.used[id]) throw new Error("This item was already used in this run.");
    if (Number(payload.expectedVersion) !== current.version) throw new Error("Profile changed. Reload before using.");
    if (!(inventory.items[id] > 0)) throw new Error("No item in inventory.");
    inventory.items[id] -= 1;run.used[id] = eventId;
    current.inventory = inventory;current.version += 1;
    current.updatedAt = new Date().toISOString();
    // The inventory and receipt occupy one row write, so retries see both or neither.
    return persistProfile_(accountId,current);
  } finally { lock.releaseLock(); }
}

function persistProfile_(accountId, profile) {
  const identity = parseAccount_(accountId);
  const inventory = parseInventory_(profile.inventory);
  const safe = {
    accountId: identity.accountId,
    version: Math.max(1, number_(profile.version) || 1),
    hero: profile.hero === "female" ? "female" : "male",
    level: Math.max(1, Math.min(10, number_(profile.level) || 1)),
    xp: Math.max(0, number_(profile.xp)),
    coins: Math.max(0, number_(profile.coins)),
    gemsJson: JSON.stringify(normalizeGems_(profile.gems)),
    weapon: inventory.weapons.indexOf(profile.weapon) >= 0 ? profile.weapon : "starlight",
    gear: inventory.gear.indexOf(profile.gear) >= 0 ? profile.gear : "focus",
    inventoryJson: JSON.stringify(inventory),
    updatedAt: profile.updatedAt || new Date().toISOString()
  };
  const row = findRow_(SHEETS.profiles, "accountId", identity.accountId);
  if (row) {
    row.sheet.getRange(row.rowNumber, 1, 1, PROFILE_HEADERS.length)
      .setValues([PROFILE_HEADERS.map(function(header) { return safe[header]; })]);
  } else {
    getSheet_(SHEETS.profiles).appendRow(PROFILE_HEADERS.map(function(header) { return safe[header]; }));
  }
  return profileFromRow_(safe, identity.accountId);
}

function purchase_(accountId, itemId, expectedVersion) {
  const id = clean_(itemId, 40);
  const item = SHOP_CATALOG[id];
  if (!item) throw new Error("Unknown shop item.");
  const lock = LockService.getScriptLock();
  lock.waitLock(5000);
  try {
    const current = getProfile_(accountId);
    if (expectedVersion !== undefined && expectedVersion !== null && Number(expectedVersion) !== current.version) {
      throw new Error("Profile changed on another device. Please reload before buying.");
    }
    const inventory = parseInventory_(current.inventory);
    if (current.level < item.unlockLevel) throw new Error("Level is too low for this item.");
    if (item.kind === "weapon" && inventory.weapons.indexOf(id) >= 0) throw new Error("This weapon is already owned.");
    if (item.kind === "gear" && inventory.gear.indexOf(id) >= 0) throw new Error("This gear is already owned.");
    if (item.kind === "item" && inventory.items[id] >= 99) throw new Error("道具已達持有上限 99 個。");
    if (current.coins < item.price) throw new Error("Not enough coins.");
    current.coins -= item.price;
    if (item.kind === "weapon") {
      inventory.weapons.push(id);
      current.weapon = id;
    } else if (item.kind === "gear") {
      inventory.gear.push(id);
      current.gear = id;
    } else {
      inventory.items[id] = Math.min(99, (inventory.items[id] || 0) + 1);
    }
    current.inventory = inventory;
    current.version += 1;
    current.updatedAt = new Date().toISOString();
    return persistProfile_(accountId, current);
  } finally {
    lock.releaseLock();
  }
}

function finishStage_(accountId, payload) {
  const stage = Math.floor(number_(payload.stage));
  const eventId = clean_(payload.eventId, 100);
  if (!eventId) throw new Error("A settlement event id is required.");
  if (stage < 1 || stage > 8) throw new Error("Only the eight main stages award completion rewards.");
  if (String(payload.result || "win") !== "win") throw new Error("Only a completed stage can be settled.");
  const attempts = Math.max(0, Math.min(10000, Math.floor(number_(payload.attempts))));
  const correct = Math.max(0, Math.min(attempts, Math.floor(number_(payload.correct))));
  const accuracy = attempts ? correct / attempts * 100 : 100;
  const lock = LockService.getScriptLock();
  lock.waitLock(5000);
  try {
    const current = getProfile_(accountId);
    const previous = findRow_(SHEETS.settlements, "eventId", eventId);
    if (previous) {
      if (String(previous.record.accountId) !== String(accountId)) throw new Error("Settlement event belongs to another account.");
      return current;
    }
    if (correct < STAGE_MIN_CORRECT[stage]) {
      throw new Error("Stage completion did not include enough correct answers.");
    }
    const gems = normalizeGems_(current.gems);
    if (stage > 1 && !gems[stage - 2]) throw new Error("Complete the previous stage first.");
    const firstClear = !gems[stage - 1];
    const base = firstClear ? FIRST_CLEAR_COINS[stage] : REPEAT_CLEAR_COINS[stage];
    const accuracyBonus = accuracy >= 95 ? 1.2 : accuracy >= 90 ? 1.1 : 1;
    const comboBonus = Math.min(10, Math.max(0, number_(payload.maxCombo)));
    const inventory = parseInventory_(current.inventory), itemRun = inventory.itemRun;
    const validRun = itemRun && itemRun.id === payload.itemRunId && itemRun.stage === stage && !itemRun.closed && itemRun.expiresAt >= Date.now();
    const ordinaryReward = Math.round(base * accuracyBonus * (1 + comboBonus / 100));
    const reward = ordinaryReward + (validRun && itemRun.used.comboStar ? Math.round(ordinaryReward*.1) : 0);
    if (validRun) itemRun.closed = true;
    current.inventory = inventory;
    const xpGain = 70 + stage * 25 + Math.min(correct, 250);
    let level = Math.max(1, current.level);
    let xp = Math.max(0, current.xp) + xpGain;
    while (level < 10 && xp >= level * 300) {
      xp -= level * 300;
      level += 1;
    }
    gems[stage - 1] = true;
    current.gems = gems;
    current.level = level;
    current.xp = xp;
    current.coins += reward;
    current.version += 1;
    current.updatedAt = new Date().toISOString();
    const saved = persistProfile_(accountId, current);
    getSheet_(SHEETS.settlements).appendRow(SETTLEMENT_HEADERS.map(function(header) {
      return { eventId: eventId, accountId: accountId, stage: stage, reward: reward, xpGain: xpGain, createdAt: current.updatedAt }[header];
    }));
    return saved;
  } finally {
    lock.releaseLock();
  }
}

function normalizeNickname_(value) {
  return String(value || "")
    .normalize("NFKC")
    .replace(/[\u0000-\u001f\u007f\u200b-\u200d\ufeff]/g, "")
    .replace(/\s+/g, "")
    .trim()
    .slice(0, 10);
}

function validateNickname_(value) {
  const nickname = normalizeNickname_(value);
  if (nickname.length < 2 || nickname.length > 10) {
    return { ok: false, error: "暱稱需為 2～10 個字元。" };
  }
  if (!/^[\u4e00-\u9fffA-Za-z0-9_-]+$/.test(nickname)) {
    return { ok: false, error: "暱稱只能使用繁體中文、英文字母、數字、底線或連字號。" };
  }
  if (/^\d{5}$/.test(nickname) || /^\d{7,10}$/.test(nickname) || /@|https?:\/\//i.test(nickname)) {
    return { ok: false, error: "暱稱不能使用帳號、電話、網址或電子郵件格式。" };
  }
  const blocked = DEFAULT_NAME_BLOCKLIST.slice();
  const sheet = getSheet_(SHEETS.nameBlocklist);
  const values = sheet.getDataRange().getValues();
  if (values.length > 1) {
    const headers = values[0];
    values.slice(1).forEach(function(row) {
      const item = {};
      headers.forEach(function(header, index) { item[header] = row[index]; });
      if (item.enabled === true || String(item.enabled).toUpperCase() === "TRUE") {
        const pattern = clean_(item.pattern, 40);
        if (pattern) blocked.push(pattern);
      }
    });
  }
  const lower = nickname.toLowerCase();
  if (blocked.some(function(word) { return lower.indexOf(String(word).toLowerCase()) >= 0; })) {
    return { ok: false, error: "名稱不適合公開，請換一個。" };
  }
  return { ok: true, nickname: nickname };
}

function startLadder_(accountId) {
  const identity = parseAccount_(accountId);
  const lock = LockService.getScriptLock();
  lock.waitLock(5000);
  try {
    const profile = getProfile_(identity.accountId);
    const gems = normalizeGems_(profile.gems);
    if (gems.length < 8 || gems.some(function(gem) { return !gem; })) {
      throw new Error("Collect all eight gems before entering the ladder.");
    }
    const now = Date.now();
    const run = {
      runId: Utilities.getUuid(),
      seasonId: LADDER_SEASON_ID,
      accountId: identity.accountId,
      seed: Utilities.getUuid(),
      startAt: new Date(now).toISOString(),
      expiresAt: new Date(now + LADDER_RUN_TTL_MS).toISOString(),
      finishAt: "",
      floor: 0,
      score: 0,
      accuracy: 0,
      durationMs: 0,
      status: "active",
      nickname: "",
      createdAt: new Date().toISOString()
    };
    getSheet_(SHEETS.ladderRuns).appendRow(LADDER_RUN_HEADERS.map(function(header) { return run[header]; }));
    return {
      runId: run.runId,
      seasonId: run.seasonId,
      seed: run.seed,
      startedAt: run.startAt,
      expiresAt: run.expiresAt
    };
  } finally {
    lock.releaseLock();
  }
}

function finishLadder_(accountId, payload) {
  const identity = parseAccount_(accountId);
  const runId = clean_(payload.runId, 80);
  const checked = validateNickname_(payload.nickname);
  if (!checked.ok) throw new Error(checked.error);
  const lock = LockService.getScriptLock();
  lock.waitLock(5000);
  try {
    const runRow = findRow_(SHEETS.ladderRuns, "runId", runId);
    if (!runRow || String(runRow.record.accountId) !== identity.accountId) throw new Error("Invalid ladder run.");
    if (String(runRow.record.status) !== "active") throw new Error("This ladder run has already been submitted.");
    const now = Date.now();
    if (new Date(runRow.record.expiresAt).getTime() < now) throw new Error("This ladder run has expired.");
    const correct = Math.max(0, Math.min(1000, Math.floor(number_(payload.correct))));
    const attempts = Math.max(correct, Math.min(2000, Math.floor(number_(payload.attempts))));
    const accuracy = attempts ? Math.max(0, Math.min(100, correct / attempts * 100)) : 0;
    if (accuracy < LADDER_MIN_ACCURACY) throw new Error("天梯成績需要至少 85% 正確率。");
    const requestedFloor = Math.max(1, Math.min(99, Math.floor(number_(payload.floor) || 1)));
    const floor = Math.min(requestedFloor, Math.max(1, Math.floor(correct / 10)));
    const scoreCap = floor * 2500 + correct * 200;
    const score = Math.max(0, Math.min(scoreCap, Math.floor(number_(payload.score))));
    const durationMs = Math.max(1000, Math.min(LADDER_RUN_TTL_MS, Math.floor(number_(payload.durationMs) || 1000)));
    const finishAt = new Date(now).toISOString();
    const run = {};
    LADDER_RUN_HEADERS.forEach(function(header) { run[header] = runRow.record[header]; });
    Object.assign(run, { finishAt: finishAt, floor: floor, score: score, accuracy: accuracy, durationMs: durationMs, status: "submitted", nickname: checked.nickname });
    runRow.sheet.getRange(runRow.rowNumber, 1, 1, LADDER_RUN_HEADERS.length)
      .setValues([LADDER_RUN_HEADERS.map(function(header) { return run[header]; })]);

    const candidate = {
      seasonId: LADDER_SEASON_ID,
      accountId: identity.accountId,
      displayName: checked.nickname,
      floor: floor,
      score: score,
      accuracy: Math.round(accuracy * 100) / 100,
      durationMs: durationMs,
      achievedAt: finishAt,
      moderationStatus: "approved"
    };
    const best = upsertLeaderboard_(candidate);
    return {
      nickname: best.displayName,
      floor: number_(best.floor),
      score: number_(best.score),
      accuracy: number_(best.accuracy),
      durationMs: number_(best.durationMs),
      achievedAt: best.achievedAt,
      moderationStatus: best.moderationStatus
    };
  } finally {
    lock.releaseLock();
  }
}

function leaderboardBetter_(candidate, current) {
  return Number(candidate.floor || 0) > Number(current.floor || 0) ||
    (Number(candidate.floor || 0) === Number(current.floor || 0) && Number(candidate.score || 0) > Number(current.score || 0)) ||
    (Number(candidate.floor || 0) === Number(current.floor || 0) && Number(candidate.score || 0) === Number(current.score || 0) && Number(candidate.accuracy || 0) > Number(current.accuracy || 0)) ||
    (Number(candidate.floor || 0) === Number(current.floor || 0) && Number(candidate.score || 0) === Number(current.score || 0) && Number(candidate.accuracy || 0) === Number(current.accuracy || 0) && Number(candidate.durationMs || 0) < Number(current.durationMs || 0));
}

function upsertLeaderboard_(candidate) {
  const sheet = getSheet_(SHEETS.leaderboard);
  const values = sheet.getDataRange().getValues();
  const headers = values[0] || LEADERBOARD_HEADERS;
  let found = null;
  for (let row = 1; row < values.length; row += 1) {
    if (String(values[row][headers.indexOf("seasonId")] || "") === candidate.seasonId && String(values[row][headers.indexOf("accountId")] || "") === candidate.accountId) {
      const record = {};
      headers.forEach(function(header, index) { record[header] = values[row][index]; });
      found = { rowNumber: row + 1, record: record };
      break;
    }
  }
  if (found && !leaderboardBetter_(candidate, found.record)) return found.record;
  if (found) {
    sheet.getRange(found.rowNumber, 1, 1, LEADERBOARD_HEADERS.length)
      .setValues([LEADERBOARD_HEADERS.map(function(header) { return candidate[header]; })]);
  } else {
    sheet.appendRow(LEADERBOARD_HEADERS.map(function(header) { return candidate[header]; }));
  }
  return candidate;
}

function normalizeGems_(value) {
  let gems = value;
  if (typeof value === "string") {
    try { gems = JSON.parse(value); } catch (error) { gems = []; }
  }
  return Array.isArray(gems) ? gems.slice(0, 8).map(function(item) { return item === true; }) : [];
}

function findRow_(sheetName, key, value) {
  const sheet = getSheet_(sheetName);
  const values = sheet.getDataRange().getValues();
  if (values.length <= 1) return null;
  const headers = values[0];
  for (let row = 1; row < values.length; row += 1) {
    const record = {};
    headers.forEach(function(header, index) { record[header] = values[row][index]; });
    if (String(record[key] || "") === String(value || "")) {
      return { sheet: sheet, rowNumber: row + 1, record: record };
    }
  }
  return null;
}

function makePasswordVerifier_(password) {
  const salt = Utilities.getUuid().replace(/-/g, "");
  return "v1$" + salt + "$" + passwordDigest_(password, salt);
}

function verifyPassword_(password, verifier) {
  const parts = String(verifier || "").split("$");
  return parts.length === 3 && parts[0] === "v1" && passwordDigest_(password, parts[1]) === parts[2];
}

function passwordDigest_(password, salt) {
  const pepper = PropertiesService.getScriptProperties().getProperty("AUTH_PEPPER");
  if (!pepper) throw new Error("Please set AUTH_PEPPER in Script Properties.");
  let value = salt + "|" + password + "|" + pepper;
  for (let round = 0; round < PASSWORD_ROUNDS; round += 1) {
    value = digestHex_(value);
  }
  return value;
}

function digestHex_(value) {
  const bytes = Utilities.computeDigest(
    Utilities.DigestAlgorithm.SHA_256,
    String(value),
    Utilities.Charset.UTF_8
  );
  return bytes.map(function(byte) {
    const unsigned = byte < 0 ? byte + 256 : byte;
    return ("0" + unsigned.toString(16)).slice(-2);
  }).join("");
}

function saveRecord_(record, accountId) {
  const identity = parseAccount_(accountId);
  const sheet = getSheet_(SHEETS.records);
  const safe = {
    createdAt: record.createdAt || new Date().toISOString(),
    className: identity.classCode,
    studentName: identity.accountId,
    seatNo: identity.seatNo,
    mode: clean_(record.mode),
    zone: clean_(record.zone),
    result: clean_(record.result),
    score: number_(record.score),
    correct: number_(record.correct),
    attempts: number_(record.attempts),
    accuracy: number_(record.accuracy),
    cpm: number_(record.cpm),
    wpm: number_(record.wpm),
    durationSec: number_(record.durationSec),
    stage: number_(record.stage),
    appVersion: clean_(record.appVersion),
    userAgent: clean_(record.userAgent, 300)
  };
  sheet.appendRow(RECORD_HEADERS.map(function(header) {
    return safe[header];
  }));
}

function getLeaderboard_(mode, limit) {
  const sheet = getSheet_(SHEETS.leaderboard);
  const values = sheet.getDataRange().getValues();
  if (values.length <= 1) return [];
  const headers = values[0];
  const entries = values.slice(1).map(function(row) {
    const entry = {};
    headers.forEach(function(header, index) { entry[header] = row[index]; });
    return entry;
  }).filter(function(entry) {
    return String(entry.seasonId || "") === LADDER_SEASON_ID && String(entry.moderationStatus || "approved") === "approved" && Number(entry.accuracy || 0) >= LADDER_MIN_ACCURACY;
  });
  entries.sort(function(a, b) {
    return Number(b.floor || 0) - Number(a.floor || 0) ||
      Number(b.score || 0) - Number(a.score || 0) ||
      Number(b.accuracy || 0) - Number(a.accuracy || 0) ||
      Number(a.durationMs || 0) - Number(b.durationMs || 0) ||
      String(a.achievedAt || "").localeCompare(String(b.achievedAt || ""));
  });
  return entries.slice(0, Math.min(Math.max(limit || 50, 1), 50)).map(function(entry, index) {
    return {
      rank: index + 1,
      nickname: clean_(entry.displayName, 10),
      floor: number_(entry.floor),
      score: number_(entry.score),
      accuracy: number_(entry.accuracy),
      durationMs: number_(entry.durationMs),
      achievedAt: clean_(entry.achievedAt)
    };
  });
}

function getQuestions_() {
  const sheet = getSheet_(SHEETS.questions);
  const values = sheet.getDataRange().getValues();
  if (values.length <= 1) return [];

  const headers = values[0];
  return values.slice(1).map(function(row) {
    const question = {};
    headers.forEach(function(header, index) {
      question[header] = row[index];
    });
    return question;
  }).filter(function(question) {
    return question.enabled === true || String(question.enabled).toUpperCase() === "TRUE";
  }).map(function(question) {
    const mode = question.mode === "en" || question.mode === "zh" ? question.mode : "";
    const stage = number_(question.stage) || (mode === "en" ? 7 : mode === "zh" ? 8 : 0);
    if (!mode || (stage !== 7 && stage !== 8)) return null;
    return {
      id: clean_(question.id),
      stage: stage,
      wave: Math.min(Math.max(number_(question.wave), 0), 4),
      mode: mode,
      prompt: cleanQuestionText_(question.prompt, 800),
      answer: cleanQuestionText_(question.answer || question.prompt, 800),
      display: cleanQuestionText_(question.display || question.prompt, 800),
      laneKey: clean_(question.laneKey || ""),
      zone: clean_(question.zone),
      difficulty: Number(question.difficulty || 1),
      tags: clean_(question.tags || ""),
      enabled: true,
      source: clean_(question.source || "gas"),
      license: clean_(question.license || "teacher-authored"),
      version: Number(question.version || 1)
    };
  }).filter(function(question) {
    return question && question.prompt && question.answer;
  });
}

function getStudents_(limit) {
  const sheet = getSheet_(SHEETS.records);
  const values = sheet.getDataRange().getValues();
  if (values.length <= 1) return [];

  const headers = values[0];
  const students = {};
  values.slice(1).forEach(function(row) {
    const record = {};
    headers.forEach(function(header, index) {
      record[header] = row[index];
    });

    const studentName = clean_(record.studentName || [record.className, record.seatNo].join("") || "unknown");
    if (!studentName) return;

    const current = students[studentName] || {
      studentName: studentName,
      className: clean_(record.className),
      seatNo: clean_(record.seatNo),
      bestStage: 0,
      gems: 0,
      bestScore: 0,
      correct: 0,
      attempts: 0,
      plays: 0,
      lastAt: ""
    };

    const stage = number_(record.stage);
    current.bestStage = Math.max(current.bestStage, stage);
    if (record.result === "win" && stage <= 8) {
      current.gems = Math.max(current.gems, stage);
    }
    current.bestScore = Math.max(current.bestScore, number_(record.score));
    current.correct += number_(record.correct);
    current.attempts += number_(record.attempts);
    current.plays += 1;
    current.lastAt = record.createdAt || current.lastAt;
    students[studentName] = current;
  });

  const rows = Object.keys(students).map(function(key) {
    const student = students[key];
    student.accuracy = student.attempts ? Math.round(student.correct / student.attempts * 100) : 100;
    return student;
  });

  rows.sort(function(a, b) {
    return Number(b.bestStage || 0) - Number(a.bestStage || 0) ||
      Number(b.bestScore || 0) - Number(a.bestScore || 0) ||
      Number(b.accuracy || 0) - Number(a.accuracy || 0);
  });

  return rows.slice(0, Math.min(Math.max(limit || 100, 1), 300));
}

function addQuestion_(question, createdBy) {
  const sheet = getSheet_(SHEETS.questions);
  const now = new Date().toISOString();
  const mode = question.mode === "en" || question.mode === "zh" ? question.mode : "";
  const stage = number_(question.stage) || (mode === "en" ? 7 : mode === "zh" ? 8 : 0);
  if (!mode || (stage !== 7 && stage !== 8)) {
    throw new Error("Question mode must be en or zh and stage must be 7 or 8.");
  }
  const safe = {
    id: Utilities.getUuid(),
    createdAt: now,
    updatedAt: now,
    mode: mode,
    prompt: cleanQuestionText_(question.prompt, 800),
    answer: cleanQuestionText_(question.answer || question.prompt, 800),
    display: cleanQuestionText_(question.display || question.prompt, 800),
    laneKey: clean_(question.laneKey || ""),
    zone: clean_(question.zone || "classroom"),
    difficulty: Math.min(Math.max(number_(question.difficulty) || 1, 1), 5),
    enabled: true,
    createdBy: clean_(createdBy || "admin"),
    stage: stage,
    wave: Math.min(Math.max(number_(question.wave), 0), 4),
    tags: clean_(Array.isArray(question.tags) ? question.tags.join(",") : question.tags || "teacher-bank", 300),
    source: clean_(question.source || "teacher-authored"),
    license: clean_(question.license || "teacher-confirmed"),
    version: Math.max(1, number_(question.version) || 1)
  };

  if (!safe.prompt || !safe.answer || safe.prompt.length > 800 || safe.answer.length > 800) {
    throw new Error("Question prompt is required.");
  }

  sheet.appendRow(QUESTION_HEADERS.map(function(header) {
    return safe[header];
  }));

  return safe;
}

function deleteQuestion_(id) {
  if (!id) throw new Error("Question id is required.");
  const sheet = getSheet_(SHEETS.questions);
  const values = sheet.getDataRange().getValues();
  if (values.length <= 1) return;

  const idIndex = QUESTION_HEADERS.indexOf("id");
  const enabledIndex = QUESTION_HEADERS.indexOf("enabled");
  const updatedIndex = QUESTION_HEADERS.indexOf("updatedAt");
  for (var row = 1; row < values.length; row += 1) {
    if (values[row][idIndex] === id) {
      sheet.getRange(row + 1, enabledIndex + 1).setValue(false);
      sheet.getRange(row + 1, updatedIndex + 1).setValue(new Date().toISOString());
      return;
    }
  }
}

function verifyAdmin_(token) {
  const propertyToken = PropertiesService.getScriptProperties().getProperty("ADMIN_TOKEN");
  const expected = propertyToken || ADMIN_TOKEN;
  if (!expected || expected === "change-this-admin-password") {
    throw new Error("Please set ADMIN_TOKEN in gas_code.gs or Script Properties.");
  }
  if (String(token || "") !== String(expected)) {
    throw new Error("Invalid admin token.");
  }
}

function ensureSheets_() {
  ensureSheet_(SHEETS.records, RECORD_HEADERS);
  ensureSheet_(SHEETS.questions, QUESTION_HEADERS);
  ensureSheet_(SHEETS.accounts, ACCOUNT_HEADERS);
  ensureSheet_(SHEETS.profiles, PROFILE_HEADERS);
  ensureSheet_(SHEETS.sessions, SESSION_HEADERS);
  ensureSheet_(SHEETS.ladderRuns, LADDER_RUN_HEADERS);
  ensureSheet_(SHEETS.leaderboard, LEADERBOARD_HEADERS);
  ensureSheet_(SHEETS.nameBlocklist, NAME_BLOCKLIST_HEADERS);
  ensureSheet_(SHEETS.settlements, SETTLEMENT_HEADERS);
}

function ensureSheet_(name, headers) {
  const spreadsheet = getSpreadsheet_();
  let sheet = spreadsheet.getSheetByName(name);
  if (!sheet) {
    sheet = spreadsheet.insertSheet(name);
  }

  const firstRow = sheet.getRange(1, 1, 1, headers.length).getValues()[0];
  const missingHeaders = headers.some(function(header, index) {
    return firstRow[index] !== header;
  });

  if (missingHeaders) {
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    sheet.setFrozenRows(1);
  }
}

function getSheet_(name) {
  const sheet = getSpreadsheet_().getSheetByName(name);
  if (!sheet) throw new Error("Missing sheet: " + name);
  return sheet;
}

function getSpreadsheet_() {
  const spreadsheetId = PropertiesService.getScriptProperties().getProperty("SPREADSHEET_ID") || SPREADSHEET_ID;
  if (spreadsheetId) {
    return SpreadsheetApp.openById(spreadsheetId);
  }
  const active = SpreadsheetApp.getActiveSpreadsheet();
  if (!active) {
    throw new Error("Bind this script to a Google Spreadsheet or set SPREADSHEET_ID.");
  }
  return active;
}

function clean_(value, maxLength) {
  const limit = maxLength || 120;
  return String(value || "").trim().slice(0, limit);
}

function cleanQuestionText_(value, maxLength) {
  const limit = maxLength || 800;
  return String(value || "")
    .normalize("NFC")
    .replace(/[\u0000-\u001f\u007f]/g, "")
    .trim()
    .slice(0, limit);
}

function number_(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
}

function json_(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
