# Word War

這是一個給國小資訊課使用的單頁 RPG 打字練習遊戲。主角固定站在戰場中央，怪物依照題目對應的鍵盤位置從外圍慢慢靠近；學生輸入怪物頭上的文字即可直接攻擊。每關包含 4 波練習與 1 隻 Boss，完成後可保存練習記錄、取得寶石並解鎖下一個校園景點。管理者可以把自訂題庫寫入 Google Apps Script 連動的試算表。

## 檔案

- `docs/project-spec.md`：Word War 的產品、關卡、輸入、資料、資產與 QA 正式規格。
- `docs/sol-luna-implementation-handbook.md`：Sol 規劃、Luna 分批實作、Sol 複核的下一階段工程手冊，涵蓋題庫、Boss 平衡、GAS 存檔、成長商店、角色方向與大橋堂天梯。
- `index.html`：學生遊戲、選單、排行榜、管理題庫與 GAS 設定介面。
- `gas_code.gs`：Google Apps Script 後端，負責保存練習記錄、讀取排行榜、管理題庫。
- `assets/warrior.png`：AI 生成並去背的中央勇士角色。
- `assets/login-castle.png`：由學校校舍改造成的魔法城堡登入背景。
- `assets/login-hero-male.png`、`assets/login-hero-female.png`：AI 生成並去背的男女主角立繪。
- `assets/word-war-logo-wide.png`：AI 生成並去背的 Word War 遊戲 Logo。
- `assets/game-hero-caster.png`：AI 生成並去背的 3D 可愛風格施法主角。
- `assets/level1-courtyard.png`：AI 生成的第一關魔法校門戰場背景。
- `assets/enemy-up.png`、`assets/enemy-down.png`、`assets/enemy-left.png`、`assets/enemy-right.png`：AI 生成並去背的第一關方向敵人。
- `assets/pixel-hero-caster.png`、`assets/pixel-level1-courtyard.png`、`assets/pixel-enemy-*.png`：AI 生成的第一關像素風戰鬥素材。
- `assets/pixel-hero-frame-1.png` 到 `assets/pixel-hero-frame-4.png`：AI 生成並去背的主角逐格施法動畫。
- `assets/generated/hero-weapons-normalized-v2/`：正式使用的整合角色＋武器 PNG；男、女主角各 Lv.1-Lv.10，所有武器變體共 100 張，統一 `768x648` 透明畫布與腳底基線，並由前端朝向 manifest 校正原始左右方向，避免舊武器疊圖與人物朝向跳變。
- `assets/generated/hero-motion/`：男、女主角星光法杖的 idle、charge、attack、recover 連續動作素材；其他武器使用整合 PNG 搭配 runtime 動作與攻擊特效。
- `assets/magic-academy-intro.wav`：首頁魔法學院開場音效。

## 角色系統

- 首次登入可選男主角或女主角，角色資料會依帳號儲存在本機。
- 男、女主角各有 Lv.1 到 Lv.10，10 等滿級；每級都有不同服飾名稱，戰鬥外觀會依目前服飾做色調變化。
- 道具屋可購買並裝備武器；武器會替換完整的角色＋武器圖，不會把新武器疊在舊武器上，並改變攻擊特效與戰鬥文字。
- 技能樹會依角色等級開放技能點，可解鎖專注、連擊、護盾、金幣加成等能力。
- 選單提供獨立試衣間，可預覽男、女主角 Lv.1-Lv.10 服飾與任一道具組合；低等是校園便服與練習服，高等會逐步加上護肩、披風、胸甲、項鍊、頭盔或冠冕。試衣間與正式戰鬥共用整合角色素材，所有升級卡片統一朝右；正式戰鬥再依敵人左右轉身。星光法杖另有四段施法動作，其他武器不再假裝有不匹配的動作圖。

## 立即試玩

使用本機伺服器開啟 `http://127.0.0.1:8767/index.html`；直接開啟 HTML 也可進行基本試玩。

進入遊戲時會先看到魔法風格登入頁。帳號為班級加座號，例如 `50101`，正式 GAS 模式的初始密碼同樣是這組五碼；本機展示模式仍保留 `50101 / 1234` 相容登入。開始後會進入全螢幕戰場，其它班級設定、校園關卡、排行榜、題庫與 GAS 設定都收在右上角「選單」。主線關卡依序解鎖：第 1 關預設開放，完成前一關並取得寶石後才可進入下一關；八顆寶石集滿後才開放大橋堂。單一字母、單一注音與單一符號可直接按鍵攻擊；單字、詞語與句子則在輸入完成後按 Enter。學生可以任選畫面上任何一隻可見小怪，不會被左下角的固定順序限制。

主線共有 8 個校園景點關卡，每關約 3 分鐘、4 波小怪後進入 Boss 戰。第 1 關練英文字母鍵位，第 2 關練英文短單字，第 3 關練單一注音，第 4 關依序練注音組合、注音加聲調與標點，第 5～8 關依序練中文單字、詞語與熱鍵、英文句子、中文句子。集滿八顆寶石後，才會解鎖「大橋堂」綜合天梯挑戰。

## 部署 GAS

1. 建立一份 Google 試算表，例如「校園打字獵人資料」。
2. 在試算表中點選「擴充功能」→「Apps Script」。
3. 將 `gas_code.gs` 的內容貼到 Apps Script 編輯器。
4. 把 `ADMIN_TOKEN` 改成自己的管理密碼。
5. 在 Apps Script 的「專案設定」→「指令碼屬性」新增 `AUTH_PEPPER`，值請使用隨機長字串；不要把它寫回前端或公開文件。
6. 在 Apps Script 執行 `setup`，第一次會要求授權；它會建立 `Records`、`Questions`、`Accounts`、`Profiles`、`Sessions`、`LadderRuns`、`Leaderboard`、`NameBlocklist`、`StageSettlements` 九張表。
7. 使用管理者 API 建立學生帳號，帳號格式必須是班級加座號五碼，例如 `50101`；未指定初始密碼時，初始密碼就是同一組五碼。
8. 部署為「網頁應用程式」，複製 Web App URL。
9. 回到遊戲右上角「選單」→「設定」，貼上 GAS Web App URL。

## 上課使用

- 學生輸入帳號與密碼後開始；正式 GAS 模式要求帳號與密碼皆為五碼，管理者建立帳號後可另行設定五碼初始密碼。
- 輸入任一怪物身上的文字並攻擊；單一字母、注音或符號可直接按鍵，複合題目完成後按 Enter。
- 怪物靠近中央會扣能量。
- 共用電腦不建議儲存管理密碼；教師可在右上角「選單」→「設定」讀取管理題庫，編輯題目、指定第 7／8 關波次與難度、停用／重新啟用或軟刪除；新增題庫時臨時輸入即可。
- 投影天梯時，打開右上角「選單」→「天梯」並按「更新排行」。
- 集滿八顆寶石後開始大橋堂天梯；完成後輸入 2～10 個字元的暱稱，系統會過濾不雅字、帳號、電話、網址與電子郵件格式，公開榜只顯示前 50 名與暱稱。

## 開發驗收

- `node tools/qa-game.mjs`：執行關卡、內容、Boss 素材與核心方向靜態 QA。
- `node tools/qa-game.mjs http://127.0.0.1:8767`：加上本機伺服器頁面與素材 HTTP 檢查。
- `node tools/qa-question-contract.mjs`：檢查題庫 schema v1、英文／中文關卡分流與 GAS 題庫欄位契約。
- `node tools/qa-question-admin.mjs http://127.0.0.1:8767`：以隔離 Chrome 驗證教師題庫列表、編輯、儲存、啟用／停用、軟刪除與清除編輯流程。
- `node tools/qa-ime-input.mjs http://127.0.0.1:8767`：以隔離 Chrome 驗證 IME 組字中不誤攻擊、組字完成後 Enter 才結算，以及 legacy `keyCode=229` 防護。
- `node tools/qa-progress-gate.mjs http://127.0.0.1:8767`：檢查前端依序解鎖、雲端通關延遲時的進度鎖定、失敗提示、同事件重試後解鎖，以及重新登入後恢復未同步通關紀錄。
- `node tools/qa-boss-phase-pools.mjs http://127.0.0.1:8767`：逐關檢查八個主線 Boss 的三階段題型，以及第 7、8 關教師題庫的 wave／難度分流。
- `node tools/qa-gas-contract.mjs`：在本機模擬 Apps Script 試算表，驗證登入、存檔版本、關卡結算、跨表中斷重試、最低題數、購買、天梯與暱稱過濾。
- `node tools/qa-hero-assets.mjs`：驗證男／女各 Lv.1-Lv.10、五武器共 100 張整合 PNG 的存在、`768x648` 畫布、RGBA 透明通道、前端引用與四種道具效果預覽契約。
- `node tools/qa-gas-endpoint.mjs`：對已部署的 GAS Web App 做線上冒煙測試；必須明確提供隔離 QA 帳號與 `GAS_ALLOW_MUTATION=YES`，不會使用預設學生帳號。

人物升級、五種武器與四種道具外觀可使用 `http://127.0.0.1:8767/hero-preview.html?gear=1&hero-motion=1` 預覽；預覽中的道具層只呈現光環、護罩、旋轉環或冠形光印，人物與武器仍由單張整合 PNG 提供，卡片與放大預覽共用朝向校正。人物與商店外觀的瀏覽器驗收可使用 `http://127.0.0.1:8767/index.html?qa=visual`。這是僅供 QA 的隔離模式，會提供 Lv.10 與測試金幣、購買武器／裝備／消耗品，且不寫回學生存檔；正式上課不要帶 `qa=visual`。
