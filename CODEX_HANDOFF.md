# Word War Handoff

## 2026-09-13 逐關最佳成績與學生報表匯出

- `students` 摘要新增每位學生的 `bestStages`（第 1～8 關最佳分數／正確率）與前五名常錯題型；`Records` 的 `errorsJson` 維持向後相容，舊紀錄沒有錯誤欄位時仍可讀取。
- 設定頁學生進度加入班級／最高關卡至少篩選與「匯出目前學生報表」，TSV 包含逐關最佳、總正確率、完成題數、場次與常錯摘要；匯出只讀取目前已載入資料。
- 更新 README／進度規格與 GAS／題庫契約 QA；`qa-progress-report` 驗證篩選與 TSV 下載。常錯摘要、逐關最佳、帳號管理、題庫管理、IME 與九關回歸均通過。
- 尚未完成：更完整跨班級圖表與鍵位／波次熱區分析、真實 Windows IME 實機驗收、最新線上 GAS 部署驗收與 37 套施法素材。
- 下一個最安全任務：補跨班級報表的欄位檢視與匯出驗收，保持唯讀並沿用目前的班級／關卡篩選。

## 2026-09-13 學習紀錄常錯題型與教師報表篩選

- `RECORD_HEADERS`／`saveRecord_` 新增向後相容的 `errorsJson`；前端每局按關卡 mode 與目標題目累計錯誤，`students` API 彙整每位學生前五名常錯題型。
- 設定頁學生進度加入班級與最高關卡至少篩選，卡片顯示常錯摘要；未改動學生帳號身份來源，仍由登入 session 決定。
- 擴充 `tools/qa-gas-contract.mjs` 與 `tools/qa-question-contract.mjs`。驗證：GAS 0 failures（含常錯摘要）、題庫契約 59/59、帳號管理 PASS、題庫管理 PASS、IME PASS、遊戲 123/123。
- 尚未完成：跨班級匯出完整報表、逐鍵位／波次熱區分析、真實 Windows IME 實機驗收、最新線上 GAS 部署驗收與 37 套施法素材；各關最高成績專用儀表板仍待補齊。
- 下一個最安全任務：補只讀的跨班級報表匯出與逐關最佳成績彙整，先保持篩選與匯出不改動學生存檔。

## 2026-09-13 教師帳號管理、題庫篩選與版本衝突保護

- `gas_code.gs` 新增受管理密碼保護的 `accounts` 清單 API；設定頁新增學生帳號讀取、建立／更新、五碼密碼重設、啟用／停用與清除編輯流程，清單不回傳密碼雜湊。
- 題庫管理清單新增搜尋、關卡與啟用狀態篩選；`updateQuestion_` 會檢查編輯時帶回的題目版本，過期版本回傳 `Question changed. Reload before editing.`，避免教師互相覆蓋。
- 新增 `tools/qa-account-admin.mjs`，並擴充 GAS／題庫契約 QA。驗證：`qa-account-admin` PASS、`qa-gas-contract` 0 failures、`qa-question-contract` 57/57、`qa-question-admin` PASS、`qa-game` 123/123；inline `node --check` PASS。
- 尚未完成：真實 Windows IME 實機驗收、跨班級完整報表與常錯內容分析、最新線上 GAS 部署驗收與 37 套施法素材；學生各關最高成績儀表板仍待補齊。
- 下一個最安全任務：補教師跨班級報表／常錯題型統計，先以唯讀彙整與匯出驗收，維持學生資料只由登入帳號決定。

## 2026-09-13 IME 組字與 legacy keyCode 229 防護

- `typing-input.js`、`index.html` 的所有鍵盤提交入口現在同時檢查 `event.isComposing`、組字狀態與 `keyCode=229`；組字候選選字期間不會被注音／全域快捷鍵攔截，組字完成後仍由 Enter 提交中文題。
- 新增 `tools/qa-ime-input.mjs`：Chrome 合成 compositionstart／input／compositionend 與 legacy keyCode 229，驗證中文句子只在組字完成後結算一次，以及候選數字鍵不誤攻擊。
- 驗證：`qa-ime-input` PASS；`qa-game` 123/123；inline `node --check` PASS。這是瀏覽器合成事件驗收，尚未取代真實 Windows 注音輸入法與教室設備測試；尚未 push。
- 尚未完成：教師帳號建立／重設頁、批次題庫篩選與版本衝突提示、真實 Windows IME 實機驗收、最新線上 GAS 部署驗收與 37 套施法素材。
- 下一個最安全任務：補教師帳號建立／重設與題庫批次篩選流程，維持管理密碼只在受保護 API 驗證。

## 2026-09-13 教師題庫管理 CRUD 與啟停

- `index.html` 新增管理題庫清單與編輯器：可載入第 7／8 關問題目，編輯 prompt、answer、display、wave、difficulty、laneKey，儲存後重新載入；可停用、重新啟用與軟刪除，清除編輯會恢復新增狀態。
- `gas_code.gs` 新增受管理密碼保護的 `listQuestions`、`updateQuestion`、`setQuestionEnabled`；`getQuestions_(true)` 回傳含停用題目，更新保留建立欄位並遞增版本，刪除仍是停用而非物理刪除。
- `tools/qa-question-admin.mjs` 以隔離 Chrome 驗證登入、管理清單、編輯儲存與清除；`tools/qa-gas-contract.mjs` 驗證新增／列出／更新／停用／重新啟用／軟刪除；`qa-question-contract` 已更新管理契約。
- 驗證：`qa-question-admin` PASS；`qa-question-contract` 54/54；`qa-gas-contract` 0 failures（含兩種跨表中斷重試）；`qa-game` 122/122；`qa-boss-phase-pools` PASS；`qa-progress-gate` PASS；前端 inline `node --check` 通過。尚未 push。
- 尚未完成：教師帳號建立／重設頁、批次題庫篩選與版本衝突提示、原生中文 IME、最新線上 GAS 部署驗收與 37 套施法素材。
- 下一個最安全任務：驗收原生中文 IME 與 Ctrl 熱鍵的實機輸入，維持每題一次結算與第 4 關無音標規則。


## 2026-09-13 教師題庫驅動第 7、8 關四波

- `teacherWaveSets()` 現在讓第 7、8 關一般小怪使用教師題庫的 `wave`；若未提供完整 1～4 波，則依 easy／normal／hard（含簡單／普通／挑戰）建立四波 fallback。Boss 與一般小怪共用正規化後題目資料。
- `difficultyValue()` 已將文字難度轉為 1～5，避免匯入的 `normal`、`hard` 或中文難度被錯當成 easy。既有內建題與無題庫時的四波不變。
- `tools/qa-boss-phase-pools.mjs` 增加明確 wave 與難度 fallback 測試；`qa-question-contract` 增加題庫波次契約。
- 驗證：`qa-boss-phase-pools` PASS；`qa-game` 110/110；`qa-question-contract` 51/51；`node --check` 與 `git diff --check` 通過。尚未 push。
- 尚未完成：跨表同步中斷恢復、原生中文 IME、最新線上 GAS 部署驗收與 37 套施法素材；教師帳號與批次題庫管理仍待補。
- 下一個最安全任務：補跨表同步中斷恢復的資料一致性測試，維持教師題庫 wave／difficulty 分流與權限邊界。

## 2026-09-13 主線 Boss 三階段題池

- 新增 `BOSS_PHASE_WAVES` 與 `bossPool()` 分流：第 1 關依左右手字母、第 2 關依 2／3／4 字母、第 3 關依聲母／韻母／混合、第 4 關依拼音／聲調／標點、第 5 關依生活／校園／大橋主題、第 6 關依詞語／熱鍵、第 7、8 關依句子難度。
- 第 7、8 關遠端題庫若提供 `wave`，按波次分流；沒有指定波次時，使用文字難度 easy／normal／hard 或簡單／普通／挑戰。新增 `difficultyValue()`，避免文字難度被當成 1。
- 新增 `tools/qa-boss-phase-pools.mjs`，Chrome 逐關驗證八個主線 Boss 三階段及遠端題庫分流。
- 驗證：`qa-boss-phase-pools` PASS；`qa-game` 109/109；`qa-question-contract` 50/50；`node --check tools/qa-boss-phase-pools.mjs` 通過。尚未 push。
- 當時尚未完成的一般小怪題庫 wave／difficulty 分波已在上方里程碑補上；教師完整編輯／啟停介面、跨表同步中斷恢復、原生中文 IME、最新線上 GAS 部署驗收與 37 套施法素材仍待處理。
- 下一個最安全任務：補教師題庫編輯／啟停流程，維持第 7、8 關題型與權限邊界。

## 2026-09-13 重新登入恢復未同步通關

- 新增 `pendingStageRecords()` 與 `recoverPendingStageSettlements()`：登入後掃描目前帳號本機 `Records` 中尚未同步的前八關勝利紀錄，依關卡順序呼叫既有 `settleStage()`，沿用原 `eventId`，成功後才套用 GAS Profile、標記 `synced` 並恢復後續解鎖。
- 新增登入流程包裝與 `qa-progress-gate` reload case；若恢復失敗，畫面保留「重試雲端同步」狀態，不讓學生跳過待確認關卡。既有手動重試與換帳號清除 pending 行為維持不變。
- 驗證：`qa-progress-gate` PASS（含重新登入恢復）；`qa-game` 108/108；`qa-question-contract` 49/49；`qa-gas-contract` 0 failures；`node --check tools/qa-progress-gate.mjs` 與 `git diff --check` 通過。
- 當時尚未完成的主線 Boss 分階段題池已在上方里程碑補上；跨表寫入中斷恢復、原生中文 IME、線上 GAS 最新部署驗收與美術缺口仍待處理。未 push。
- 下一個最安全任務：讓第 7、8 關一般小怪也依教師題庫的 `wave`／difficulty 出題，補四波與題庫契約 QA。

## 2026-09-13 依序解鎖與雲端通關重試

- 完成前端／GAS 進度閘門一致化：第 1 關預設開放；第 2～8 關需前一關寶石；大橋堂需八顆寶石。鎖定卡片會 disabled 並標示 `aria-disabled`；`qa=full` 保留逐關測試旁路。
- 雲端主線通關改為先保留本機 Profile 的等級、XP、金幣與寶石，等待 `finishStage` 回覆後才套用 GAS Profile；同一 eventId 可在畫面按「重試雲端同步」。失敗會顯示錯誤，下一關維持鎖定；成功後標記場次 synced 並更新解鎖。
- 新增 `tools/qa-progress-gate.mjs`，瀏覽器驗證空 Profile、取得第一顆寶石、待同步鎖定、雲端拒絕提示、同 eventId 重試與成功後解鎖。
- 驗證：`qa-progress-gate` PASS；`qa-game` 106/106；`qa-question-contract` 49/49；`qa-gas-contract` 0 failures；`qa-physical-input` 90 組 PASS；`qa-battle-interface` PASS；`qa-spawn-clearance` 880/880；`qa-ladder-floors` 兩層五階段 PASS；`git diff --check` 通過。
- 當時尚未完成的重新載入恢復已在上方里程碑補上；多數主線 Boss 題池分流、原生中文 IME、線上 GAS 最新部署驗收仍待處理。未 push。
- 下一個最安全任務：補主線 Boss 分階段題池，維持各關卡的教育內容邊界。

## 2026-09-12 進度盤點與詳細規格表

- 新增 docs/progress-spec-2026-09-12.md：對照目前 AGENTS.md 與實際載入模組，整理主線、Boss、題庫、輸入、商店、天梯、帳號、資產及驗收缺口；本輪沒有改遊戲。
- 重新計數：100 張靜態整合圖、63 套註冊施法（星光20／冰20／暗影20／火3／雷0）；缺37套。
- 重要現況：前端 unlocked() 允許所有主線，但 GAS finishStage 檢查前一關寶石；Boss 戰主角 x=32%；多數主線 Boss 題池尚未分流；遠端出題轉字串遺失 wave／difficulty／laneKey 的完整用途；技能樹目前為占位。
- 修正過期文件判定：逐層五階段天梯、實體注音／Ctrl 與消耗品使用已接入；有歷史 GAS 道具／天梯報告，最新版本仍待整合回歸。本輪沒有重跑玩法或線上端點測試。
- 下一個最安全任務：統一前端依序解鎖及 GAS 拒絕結算時的回饋，再補主線 Boss 分階段題池。

## 2026-09-12 第 4 關拼音進程與規格統一

- 先讀 README、git status、最近五筆提交、未提交 diff 與交接紀錄；保留現有施法素材、單鍵出怪節奏與 UI 修改。八景依序為八德亭、三達德亭、五倫園、如沐園、成長學園、羔羊跪乳、童心園、四維堂。
- 依本次使用者提供的 AGENTS.md，統一第 4 關為注音組合、注音加聲調、標點四波；Boss 三階段分別使用拼音、聲調、標點題池。舊 project-spec 的單一注音例外已被本次規格取代。
- 保留 32 題練習量、既有速度及 GAS 結算門檻；沿用現有實體注音按鍵映射與首注音出怪方向。第二波沿用使用者列出的 ㄓㄨ／ㄒㄧ／ㄅㄠ／ㄇㄟ 範例，不將其誤稱為三符號組合。
- 本次修改：index.html、tools/qa-game.mjs、tools/qa-physical-input.mjs、README.md、docs/project-spec.md、CODEX_HANDOFF.md。
- 驗證：遊戲 102/102、題庫 49/49、GAS 本機合約 0 failures；Chrome 90 組鍵盤輸入與 GM 視窗隔離通過，另驗證四波共 32 題、Boss 分階段題池與首注音方向；git diff --check 通過。
- 尚未驗證真實中文 IME、隔離 GAS 端點與完整課堂流程；未部署或推送。舊交接提到的動畫缺口與 Pages 授權問題未在本輪解決。
- 下一個最安全任務：檢查其餘主線 Boss 是否依 AGENTS.md 分階段選題（目前 bossPool 多數仍共用 bossWords），再補對應行為測試；實機中文輸入另行驗收。


## 2026-09-06 Faster single-key monster scheduling

- Latest user request overrides ongoing asset task. index.html spawnDelay now uses2200ms global/3600ms same-lane delay for letters and zhuyin only, previously3400/5400. Word/phonics/Chinese/sentence/ladder pacing unchanged; movement, collision safeguards and QA acceleration unchanged.
- Extended qa-spawn-clearance.mjs verifies all mode delays, 2199/2200ms activation boundary and same-lane blocker for stages1/3. Browser run passed880 placements across8 stages4 viewports with no unsafe entries, plus queue checks. Local only; public unchanged pending workflow authorization.
- Female fireLv2 image generation was user-interrupted before this task. No output path/terminal result received; do not claim completion or integrate it. Inspect generated outputs before retrying. Current count63 local/62 public.

## 2026-09-06 Male fire Lv2 integrated locally:63 clips

- Built-in generation from original maleLv2 fire reference: exec-eab99e60-d142-4b9d-991d-0bb58d484875.png. Six distinct right-facing poses, diamond crystal wheel retained.
- Processed largest30/95 v1, uniform460/447 body normalization, hero-male-fire-cast-lv2-v1-body-v2. Six-frame matte reviewed; registered male:2:fire and added provenance. Local targeted battle/preview/mobile/fallback QA passed;63 body/baseline checks passed (body461 within tolerance, baseline610).
- Public remains62 atb3d0425. No push attempted while workflow authorization pending; local workflow commit1a055ab still ahead. Next female fireLv2, then same-scale pair review. Remaining37 true clips. Goal remains active; full acceptance not proved.

## 2026-09-06 Custom Pages workflow ready; push needs workflow scope

- Added .github/workflows/pages.yml (main/manual trigger, package safety test, verified build, upload .pages-dist, dependent deploy with Pages/OIDC permissions). Local commit1a055ab includes workflow, ignore, packager and package tests only. Package tests pass.
- Attempted Pages switch to workflow succeeded, but git push REJECTED: OAuth credential lacks workflow scope. Immediately restored legacy main/root; gh api confirms build_type legacy/status built. Public remains b3d0425 and62 clips, not lean package.
- Requested user run gh auth refresh -h github.com -s workflow and confirm authorization. Do not bypass permission rejection. Local branch is one commit ahead; subsequent pushes will still include workflow and need that scope. No live auth process started.
- Once authorized: push HEAD:main, switch Pages to workflow, inspect exact new run and wait terminal, then verify artifact size and public runtime. Until then continue local art/QA; do not mark overall goal blocked because useful local work remains.

## 2026-09-06 Lean Pages package validated locally; NOT activated

- Added tools/build-pages.mjs: copies tracked public root HTML/CSS/JS and assets to empty .pages-dist; explicitly excludes7 unreferenced legacy/source-review directories while preserving them in Git. Rejects archive references, missing cast/idle registry assets, unsafe paths, nonempty output and payload >900MB. SHA256 verifies every copied file; no image recompression. Added .pages-dist/ ignore.
- Actual package1128 files,792768093 bytes,62 clips; original tracked payload1101584818 bytes. Existing dynamic Pages deployment still legacy main/root (gh api verified), so public site is NOT yet using this package.
- tools/qa-pages-package.mjs passed byte preservation/private exclusions/output safety/reference/missing-clip failure tests. Chrome targeted female fire1 and seven-viewport battle-interface tests passed against http://127.0.0.1:8767/.pages-dist. git diff --check passed.
- Next wire a custom Pages workflow to this tested packager, change test repo Pages build_type to workflow under existing deployment authorization, verify actual artifact size and public runtime. No source archives should be deleted. Tool and ignore changes remain uncommitted. Full62/100 casting goal and comprehensive gameplay acceptance remain open.

## 2026-09-06 Fire Lv1 pair published: 62 clips; deployment size risk

- Same-scale first/last pair and all six poses visually reviewed. Local male/female fire1 targeted QA and62 body/baseline checks passed.
- Scoped commit b3d04250fcbbeea00f01a7f87c1d5381eb490413 contains only registry and two accepted normalized fireLv1 folders. Pages run34014007666 succeeded. Both public targeted battle/preview/mobile/fallback runs exited0.
- Public now62 true clips. Remaining38: fire2..10 both genders and thunder1..10 both. Full objective still open.
- NEW deployment warning: uploaded artifact1094942816 bytes exceeds1GB; deployment nevertheless succeeded. Repository uses dynamic pages-build-deployment, no local .github/workflows directory. Next investigate a non-destructive lean deployment or lossless asset optimization before adding more art. Preserve referenced assets; do not delete sources blindly. Largest tracked files include review breakdown PNGs and original plus stage-safe backgrounds.
- Previous turn's qa-battle-interface.mjs regression changes remain unstaged; local handoff/build helpers remain outside this scoped publication.

## 2026-09-06 Compact battle UI request revalidated

- Latest requested scope: smaller HUD/panels, mob hero centered, opposing Boss positions with aligned ground markers, no passive aura. Existing battle-interface and battle-ground implementation verified locally; no unrelated asset publication this pass.
- Extended tools/qa-battle-interface.mjs with desktop panel width ceilings, return-to-mob center, idle aura hidden, and marker lifecycle assertions. Seven viewport checks passed; screenshots reviewed at1366x768 and390x844 plus mob-center.png.
- tools/qa-status-aura.mjs passed five state colors, pause/expiry, shield consumption, charge/cancel and cast cleanup. tools/qa-battle-ground.mjs passed45 ground checks. git diff --check passed (line-ending warnings only).
- This is targeted UI verification, not full project acceptance.62 clips local/60 public unchanged; fire Lv1 pair still unpublished. Next safest ongoing asset task remains pair review and scoped publication. Full native IME/complete gameplay acceptance remains open.

## 2026-09-06 Female Lv1 fire locally integrated: 62 clips

- Reprocessed accepted raw exec-713b12c3-0b9f-4e1b-b7da-9856b1d28132.png. Stronger100/150 v2 still left shaded wheel gaps. Added opt-in magenta-interiors mode to local build-shadow-cast.py; default unchanged.
- v3 cleanup removes shaded magenta pockets without altering gold wheel/orange core/navy costume. Six-frame matte visually reviewed. Registered female:1:fire hero-female-fire-cast-lv1-v3-body-v2, uniform460/465, body461 tolerance, baseline610; provenance added.
- Local female fire1 battle/preview/mobile/fallback QA passed;62 body/baseline checks passed. Public remains60 at99183f8, fireLv1 pair unpublished.
- Next same-scale fireLv1 pair review then scoped publication/public QA. Remaining38 true clips (fire2..10 both, thunderall). Full stage/ladder/test GAS final acceptance open; goal active.

## 2026-09-06 Female Lv1 fire candidate NOT integrated

- Original reference inspected. Raw exec-4878838b-2487-499d-9173-74beb2f74d04.png rejected mixed facing/white wheel gaps; edit exec-303f5061-0e6a-4708-b318-40518a3c8ac6.png fixed facing but removed frame2 wheel.
- Further built-in edit exec-713b12c3-0b9f-4e1b-b7da-9856b1d28132.png restores wheel. Processed female fire1 largest30/95 v1, normalized460/465 to hero-female-fire-cast-lv1-v1-body-v2.
- Cleaned matte STILL shows pink trapped wheel-spoke gaps and small hair-edge pink remnants. NOT accepted or registered. Next reprocess with stronger chroma (e.g.100/150) and inspect; use built-in correction if needed. No candidate publication.
- Authoritative count remains61 local (male fire1 only),60 public at99183f8. Remaining39 true sets. Goal active; full acceptance open.

## 2026-09-06 Male Lv1 fire locally integrated: 61 clips

- Original fire wheel staff reference inspected. Built-in raw exec-cb0b11fd-8914-451b-a809-e13d8aeaad19.png preserves wheel/flame, right-facing body; cleaned six-frame matte reviewed.
- Registered male:1:fire hero-male-fire-cast-lv1-v1-body-v2, uniform0.92, body460 baseline610, provenance added.
- Local targeted battle/preview/mobile/fallback test passed;61 body/baseline checks passed. Public remains60 at99183f8; clip unpublished.
- Next female Lv1 fire, pair review and publication/public tests. Remaining39 true sets. Full stage/ladder/test GAS acceptance open; goal active.

## 2026-09-06 Ice Lv10 pair published: 60 clips

- Scoped commit99183f806beaab07595f9be951867d306a06ca64 pushed main; Pages run34012630346 succeeded. Only accepted Lv10 pair and registry published.
- Public male ice10 and female ice10 targeted battle/preview/mobile/fallback QA passed terminal0. Latest local60 body/baseline checks and120 idle/cast transitions passed.
- Starlight, shadow and ice now each have all20 true six-frame sets. Remaining40: fire and thunder all genders/levels. Next inspect male Lv1 fire reference.
- Full stage/ladder/test GAS final acceptance still open; goal active. Asset coverage alone is not whole-project completion.

## 2026-09-06 Female Lv10 ice locally integrated: 60 clips

- Initial raw exec-e22f0a09-17e5-4ce9-9dc7-f66418f2304b.png rejected missing frame2 crystal head/high frame3 staff. Built-in edit exec-913c82f7-9b81-4e69-b42a-2fd08dfcf70f.png fixes both.
- Registered female:10:ice hero-female-ice-cast-lv10-v1-body-v2; ROI .05..06 excludes crown/ponytail, uniform460/407, verified459 within tolerance, baseline610. Six-frame matte and Lv10 pair reviewed.
- Local female ice10 targeted battle/preview/mobile/fallback passed;60 body/baseline checks passed. Ice1..10 both genders now local complete; Lv10 pair unpublished. Public58 atd7aa55b.
- Next scoped publish Lv10 pair/public QA, then fire/thunder40 true sets. Full stage/ladder/test GAS final acceptance open; goal active.

## 2026-09-06 Male Lv10 ice locally integrated: 59 clips

- Initial raw exec-838ee95f-4e99-48ca-9f28-bce27c31dc83.png rejected for glow. Magenta edit exec-337b2fa3-6f02-421d-9f55-77ecb11e0038.png failed frame3 normalized bounds (top-45).
- Built-in corrective compact frame3 edit exec-61f031fc-7067-40de-ab21-de0113b43215.png accepted. Crown-excluding ROI .065..075, body419 normalized460/419, all frames fit; six-frame matte reviewed.
- Registered male:10:ice hero-male-ice-cast-lv10-v2-body-v2; local targeted battle/preview/mobile/fallback passed,59 body/baseline checks passed. Public remains58 atd7aa55b; clip unpublished.
- Next female Lv10 ice, pair review then scoped publication/public QA. Remaining41 true sets. Full stage/ladder/test GAS final acceptance open; goal active.

## 2026-09-06 Ice Lv9 pair published: 58 clips

- Refreshed same-scale male/female idle/recovery pair with corrected female v2 and visually reviewed.
- Scoped commitd7aa55be028652f3cc4ed722dfeae748dbeac6f6 pushed main; Pages run34011649139 succeeded. Public male ice9 and female ice9 targeted battle/preview/mobile/fallback QA passed terminal0.
- Latest local58 body/baseline checks and116 idle/cast transitions passed. Remaining42 true clips: iceLv10 both, all fire/thunder. Next male Lv10 ice original reference; remove baked halo per user.
- Full stage/ladder/test GAS final acceptance remains open; goal active.

## 2026-09-06 Female Lv9 ice locally integrated: 58 clips

- Initial raw exec-a63aabab-4fbf-4e33-9945-3a9a4ba1c980.png rejected for white fleck at third-frame ponytail. Built-in corrective edit exec-c0f792a2-a14e-4ca6-8797-d5d12f02e149.png removes it; corrected six-frame matte reviewed.
- Registered female:9:ice hero-female-ice-cast-lv9-v2-body-v2. Front hair ROI .065..085 excludes clasp/ponytail; uniform460/477, verified459 within tolerance, feet610. Halo absent.
- Local female ice9 targeted battle/preview/mobile/fallback passed;58 body/baseline checks passed. Lv9 pair still unpublished, public56 atb1db2d5.
- Next refresh Lv9 pair review with v2 female then scoped publish/public tests. Remaining42 true clips; full stage/ladder/test GAS final acceptance open; goal active.

## 2026-09-06 Male Lv9 ice locally integrated: 57 clips

- Original Lv9 reference inspected; generated raw exec-c1b723a8-3b50-4403-81d3-fe3c8ad70f68.png removes baked back halo per user, preserves crown/white-gold armor.
- Six-frame cleaned matte reviewed. Registered male:9:ice, hero-male-ice-cast-lv9-v1-body-v2; uniform0.92, body460 baseline610, provenance added.
- Local targeted battle/preview/mobile/fallback test passed;57 body/baseline checks passed. Public remains56 atb1db2d5; new clip unpublished.
- Next female Lv9 ice, pair review and publication/public QA. Remaining43 true sets. Full stage/ladder/test GAS final acceptance open; goal active.

## 2026-09-06 Ice Lv8 pair published: 56 clips

- Scoped commit b1db2d5f9907089b7780df133ca94487869eb1b5 pushed main; Pages run34010880526 succeeded. Only reviewed normalized Lv8 pair and registry staged.
- Public male ice8 and female ice8 targeted battle/preview/mobile/fallback QA both passed terminal0. Latest local112 idle/cast transitions and56 body/baseline checks passed.
- Remaining44 true clips: ice Lv9..10 both genders, all fire/thunder. Next male Lv9 ice from original reference. Full stage/ladder/test GAS final acceptance still open; goal active.

## 2026-09-06 Female Lv8 ice locally integrated: 56 clips

- Built-in raw exec-8819b577-1c45-44ee-acdb-2800ec961134.png from original female Lv8 fitted coat/tall boots reference. Cleaned six-frame matte and male/female idle/recovery pair reviewed.
- Initial ROI0..025 caught clasp, corrected .04..06 to actual front hair; source464 uniformly normalized460/464, baseline610. Registered female:8:ice with provenance.
- Local female ice8 targeted battle/preview/mobile/fallback QA passed;56 body/baseline checks passed. Male ice8 already locally tested. Pair not published; public54 at1bcdefd.
- Next run fresh idle transition check if needed, then scoped publish Lv8 pair/public tests. Remaining44 true sets (ice9..10 both and fire/thunder all). Full stage/ladder/test GAS acceptance remains open; goal active.

## 2026-09-06 Male Lv8 ice locally integrated: 55 clips

- Built-in raw exec-f4833efa-f308-4300-be7b-25d3eef9873b.png from original Lv8 reference, layered gold/crystal shoulders distinguish upgrade. Cleaned six-frame matte reviewed.
- Registered male:8:ice folder hero-male-ice-cast-lv8-v1-body-v2, uniform0.92, body460 baseline610; provenance added.
- Local targeted battle/preview/mobile/fallback QA passed;55 body/baseline checks passed. Public remains54 at1bcdefd; this clip unpublished.
- Next female Lv8 ice, pair review then scoped publish/public QA. Remaining45 true clips. Full stage/ladder/test GAS final acceptance open; goal active.

## 2026-09-06 Ice Lv7 pair published: 54 clips

- Female built-in raw exec-648e1196-5df5-4b84-8b8a-93745e739cea.png from original Lv7 reference; crystal pauldrons distinguish upgrade. Six-frame matte and same-scale male/female idle/recovery reviewed.
- Female front-hair ROI .035..045, source body451, uniform460/451 normalization. Local54 body/baseline checks and108 idle/cast transitions passed.
- Scoped commit1bcdefdecfa854bf6b89e15d26ae45b920ff9069 pushed main; Pages run34010249171 succeeded. Public male ice7 and female ice7 battle/preview/mobile/fallback tests both passed terminal0.
- Remaining46 true sets: ice Lv8..10 both genders and all fire/thunder. Next male Lv8 ice reference. Full stage/ladder/test GAS final acceptance remains open; goal active.

## 2026-09-06 Male Lv7 ice locally integrated: 53 clips

- Original Lv7 blue-crystal shoulder armor reference inspected. Built-in raw exec-2e02d344-2bf0-45dd-9296-c8eef7eda164.png; six-frame cleaned matte visually reviewed.
- Registered male:7:ice, hero-male-ice-cast-lv7-v1-body-v2, uniform0.92 scale, body460, baseline610. Provenance added.
- Local targeted battle/preview/mobile/fallback test passed; body audit53 passed. Not yet published; public remains52 at6e3b853.
- Next female Lv7 ice, pair visual review, publication and public tests. Remaining47 sets, full stage/ladder/GAS final acceptance still open; goal active.

## 2026-09-06 Ice Lv6 pair published: 52 clips

- Female raw exec-d9d75aec-b133-49b5-8e55-2044cc45c124.png generated from original Lv6 star-tiara reference. Six-frame matte and male/female same-scale idle/recovery pair reviewed.
- Female ROI .035..045 excludes crown/ponytail, body444 normalized uniformly460/444; all52 body/baseline checks passed. Local104 idle/cast transitions passed.
- Scoped commit6e3b85311567b63d0e00b5bae7e909bb5a3be5f9 pushed main, Pages run34009729654 succeeded. Public male ice6 and female ice6 targeted battle/preview/mobile/fallback QA both passed, terminal exit0.
- Remaining48 true clips: ice Lv7..10 both genders, all fire/thunder. Next male Lv7 ice original reference. Full stage/ladder/GAS final acceptance remains incomplete; goal active.

## 2026-09-06 Male Lv6 ice locally integrated: 51 clips

- Built-in raw exec-9ee25b66-0d68-4226-ac0c-f5232a271d30.png matches gold-armored Lv6 reference. Six-frame cleaned contact sheet visually reviewed.
- Registered male:6:ice, hero-male-ice-cast-lv6-v1-body-v2. Uniform factor0.92, body460, baseline610; provenance included.
- Local targeted battle/preview/mobile/fallback QA passed. Body audit51 passed. Public still50 at76d1aef; this clip not yet published.
- Fresh compact UI seven viewport, aura lifecycle, and45 ground alignment checks passed preceding this asset task.
- Next: female Lv6 ice, paired review, then scoped publication and public checks. Remaining49 sets; full stage/ladder/GAS acceptance still open.

## 2026-09-06 Ice Lv5 pair published: 50 public clips

- Same-scale idle/recovery pair docs/qa-cast-review/lv5-pair.png reviewed; fresh local qa-preview-idle passed100 transitions.
- Scoped commit76d1aef60ab420648b85067ae86b8d4cd2bd37d3 (10 files) pushed main. Pages run34008885917 succeeded. No raw/rejected/private files included.
- Public qa-shadow-cast male ice5 and female ice5 both passed battle/preview/mobile/fallback guard, terminal exit0.
- Remaining50 true sets: iceLv6..10 both genders and all fire/thunder. Next iceLv6 pair from original references. Full stage/ladder/GAS final acceptance remains open; goal not complete.

## 2026-09-06 Female Lv5 ice locally integrated: 50 clips

- Original reference inspected. First raw exec-540de36a-33d9-46e6-a198-222168da1274.png rejected for glow; corrected exec-88dd2d19-2110-4cf3-ab02-f816cb49c806.png accepted.
- Chroma v1 largest30/95 left pink hair streaks; reprocessed v2 largest100/150 reduces spill while retaining armor/crystal details. Both six-frame mattes viewed; use v2 only.
- Front-hair ROI.02..04 measures477, shared460/477 normalized -body-v2; feet610. Registered female:5:ice with provenance.
- Fresh qa-shadow-cast female ice5 passed local battle/preview/mobile/fallback; bodyaudit50 passed. Public remains48 at6470f76, iceLv5 pair local only.
- Remaining50 true sets: iceLv6..10 pair(10), fire/thunder all(40). Next pair comparison/regression/publication, then iceLv6. Full stage/ladder/GAS acceptance still open.

## 2026-09-06 Male Lv5 ice locally integrated: 49 clips

- Original reference inspected; built-in raw exec-36c47494-acd8-4218-a9ef-f6afa6c26435.png accepted after six-pose review. Brown hair/silver armor/long staff preserved.
- Processed male ice5 v1 largest30/95; shared460/499 normalization into -body-v2. Matte reviewed for weapon/cloak bounds and stable feet.
- Registered male:5:ice and provenance. Fresh local qa-shadow-cast male ice5 passed battle/preview/mobile/fallback; bodyaudit49 passed (new460/610).
- Public remains48 at6470f76. New maleLv5ice local only; remaining51 true sets. Next femaleLv5ice then pair regression/publication; full gameplay/GAS final acceptance remains pending.

## 2026-09-06 Ice Lv4 pair published: 48 public clips

- Reviewed same-scale idle/recovery pair docs/qa-cast-review/lv4-pair.png; local qa-preview-idle passed96 transitions.
- Scoped commit6470f76af4f3425a5ceb677a4dee2114ffd5cde6 (10 files) pushed main. Pages run34008037511 succeeded. No raw/rejected/private files included.
- Public qa-shadow-cast male ice4 and female ice4 both passed six-frame battle/preview/mobile/fallback, terminal exit0.
- Remaining52 true animation sets. Next iceLv5 pair from original references. Final full stage/ladder/GAS acceptance still pending; goal remains incomplete.

## 2026-09-06 Female Lv4 ice locally integrated: 48 clips

- Reference inspected; built-in raw exec-48ef4524-8387-44fa-b189-a92c4b66c9dd.png preserves navy ponytail, ornament and celestial lining. Six right-facing poses reviewed.
- Processed female ice4 v1 largest30/95; front-hair ROI0..03 measures471 excluding ponytail/ornament. Shared460/471 normalization into -body-v2. Six-frame matte inspected for clear gaps/bounds.
- Registered female:4:ice and provenance. Fresh qa-shadow-cast female ice4 passed local battle/preview/mobile/fallback; bodyaudit48 passed (new459/610 within tolerance).
- Public remains46 at7383224. IceLv4 pair local only, remaining52 true sets. Next pair comparison/regression/publication. Full stage/ladder/GAS final acceptance remains open.

## 2026-09-06 Male Lv4 ice locally integrated: 47 clips

- Original Lv4 reference viewed: navy hair, diadem, silver armor rather than novice brown hair. Built-in raw exec-d543c394-8bd0-48e0-9677-aa9a47e968cc.png accepted after six-pose review.
- Processed male ice4 v1 largest30/95; shared0.92 normalization into -body-v2. Matte visually reviewed for complete weapon/cloak and stable feet.
- Registered male:4:ice and provenance. Fresh local qa-shadow-cast male ice4 passed battle/preview/mobile/fallback; bodyaudit47 passed (new460/610).
- Public remains46 at7383224. New maleLv4ice local only; remaining53 true clips. Next femaleLv4ice then pair regression/publication. Full gameplay/GAS final acceptance remains open.

## 2026-09-06 Ice Lv3 pair published: 46 public clips

- Same-scale idle/recovery pair docs/qa-cast-review/lv3-pair.png visually reviewed; fresh local qa-preview-idle passed92 transitions.
- Scoped commit73832240a7ac97d06744e9156c17122d6152a391 (10 files) pushed main. Pages run34007350228 succeeded. No rejected/raw/private artifacts uploaded.
- Public qa-shadow-cast male ice3 and female ice3 both passed battle/preview/mobile/fallback guard, exit0.
- Remaining54 true sets; next iceLv4 pair from original integrated references. Full stage/ladder/GAS final acceptance still pending; goal remains incomplete.

## 2026-09-06 Female Lv3 ice locally integrated: 46 clips

- Original reference viewed. Initial raw exec-139ea80e-aab2-4981-8fb1-83f6af1ea3f5.png rejected for glow backdrop; corrected exec-d4990b7c-38b5-44b4-8474-1baff7fee79f.png accepted after six-pose review.
- Processed female ice3 v1 largest30/95. Initial ROI0..02 caught raised strand(height497); narrowed0..008 measures actual front hair(height472), excluding ornaments. Shared460/472 normalization into -body-v2, six-frame matte viewed.
- Registered female:3:ice and provenance. Fresh qa-shadow-cast female ice3 passed local battle/preview/mobile/fallback; body audit46 passed (new460/610).
- Public remains44 atb31cb8e. IceLv3 pair local only. Remaining54 true sets; next pair comparison/regression/publication. Full gameplay/GAS final acceptance still open.

## 2026-09-06 Male Lv3 ice locally integrated: 45 clips

- Reference inspected; built-in raw exec-d2f61c10-3dd4-4520-99c8-96cb49a62a1a.png provides six right-facing poses preserving mantle emblem, gloves, boots and crystal staff.
- Processed male ice3 v1 largest30/95, normalized0.92 into -body-v2; all six matte frames visually reviewed for complete cloak/weapon and feet consistency.
- Registered male:3:ice with provenance. Fresh local qa-shadow-cast male ice3 passed battle/preview/mobile/fallback; bodyaudit45 passed (new460/610).
- Public remains44 atb31cb8e. New maleLv3ice local only; remaining55 true clips. Next femaleLv3ice then pair review/publication; full gameplay/GAS final acceptance still pending.

## 2026-09-06 Ice Lv2 pair published: 44 public clips

- Reviewed same-scale idle/recovery comparison docs/qa-cast-review/lv2-pair.png; front-hair and boot alignment consistent despite ponytail height. Fresh local qa-preview-idle passed88 transitions.
- Scoped commitb31cb8eeb112b433483ed296f35a16804450052c (10 files) pushed main. Pages run34006604395 succeeded, no raw/rejected/private files included.
- Public qa-shadow-cast male ice2 and female ice2 each passed six-frame battle, preview, mobile bounds and wrong-level fallback guard; both terminal exit0.
- Remaining56 true clip sets; next iceLv3 pair from original references. Full eight-stage/ladder/GAS acceptance remains open. Goal is not complete.

## 2026-09-06 Female Lv2 ice locally integrated: 44 clips

- Original reference inspected. Initial raw exec-aa16448b-a1f3-4d96-b268-263b9afbbf0e.png had white ponytail islands, rejected. Built-in correction exec-af80f4ad-c335-459c-b8d6-c1f871a8b972.png removes islands; all six poses visually checked.
- Processed female ice2 v1 largest30/95. Front-hair region0..04 excludes ponytail; sourceheight462, uniform460/462 normalization into -body-v2. Matte reviewed for clean openings, rightward facing and bounds.
- Registered female:2:ice and provenance. Fresh local qa-shadow-cast female ice2 passed battle/preview/mobile/fallback guard; bodyaudit44 passed (460/610 new set).
- Public remains42 at35eb6f9; iceLv2 pair local only. Remaining56 true sets. Next pair comparison, regression and scoped publication. Full objective acceptance still pending.

## 2026-09-06 Male Lv2 ice locally integrated: 43 clips

- Inspected original maleLv2ice reference; generated six poses. First exec-d1e6114a-cc46-403e-833b-631dda4ef083.png rejected for glow background and wide cloak. Corrected exec-b000d105-7889-429b-8d62-840a8faa9c48.png accepted after six-frame visual review.
- Processed male-ice-cast-lv2-v1 with largest30/95, normalized0.92 into -body-v2. Registered male:2:ice and provenance. Fresh qa-shadow-cast male ice2 passed local battle/preview/mobile/fallback; body audit43 passed (460/610).
- Public remains42 at35eb6f9. New maleLv2ice local only; remaining57 true sets. Next femaleLv2ice then pair review/publication. Final full objective acceptance remains open.

## 2026-09-06 Ice Lv1 pair published: 42 public clips

- Generated and visually inspected same-scale idle/recovery comparison docs/qa-cast-review/lv1-pair.png. Male/female body heights and feet match; distinct globe/crystal ice weapons remain integrated with each character.
- Scoped commit35eb6f9c4651ad84f1c6f8d8e61d0aeba6499633 (9 files) pushed main; Pages run34005878421 succeeded. No raw/rejected/private files uploaded.
- Fresh public qa-shadow-cast male ice1 and female ice1 both passed six-frame battle, preview, mobile bounds and wrong-level fallback guard. Both processes completed exit0.
- Remaining58 true animation sets. Next iceLv2 pair from existing integrated references. Full eight-stage/ladder/GAS final acceptance still open; goal not complete.

## 2026-09-06 Female Lv1 ice locally integrated: 42 clips

- First built-in raw exec-5b4c7077-c9ae-4941-9df4-b5f0ebdecb23.png rejected: glow background and staff near frame edge. Corrected raw exec-3cfb831b-19d3-4d52-b4ca-85c20bbc7825.png inspected; solid chroma and compact poses.
- Processed female ice1 v1 with largest30/95; normalized0.92 to -body-v2. Six-frame matte visually reviewed, direction consistently right; crystal weapon preserved instead of male globe.
- Registered female:1:ice, wrote provenance. Fresh local qa-shadow-cast female ice1 passed battle/preview/mobile/fallback; body audit passed42 sets.
- Public remains40 at173b25b. Both iceLv1 local only. Remaining58 true sets; next pair comparison/publication and public tests. Full stage/ladder/GAS acceptance still open.

## 2026-09-06 Male Lv1 ice integrated locally: 41 clips

- Generated from original integrated male Lv1 ice reference. First raw exec-60a340af-b4f8-4e96-bd60-a6f20b50056b.png rejected for left-facing idle/windup/recovery despite right-facing cast.
- Built-in correction exec-8633f2a7-05aa-49bf-ae1b-6702e361d82e.png fixes those poses. Processed hero-male-ice-cast-lv1-v1 with largest/30/95; shared0.92 normalization into -body-v2. Six-frame matte reviewed for right-facing continuity and bounds.
- Registered male:1:ice and wrote provenance. Local qa-shadow-cast male ice1 passed battle/preview/mobile/fallback guard; body audit passed41 sets (new height460, feet610).
- Public remains40 at173b25b; ice1 male local only. Remaining59 true clips. Next female Lv1 ice from original reference, then pair review and publish. Full objective remains incomplete.

## 2026-09-06 Lv10 shadow pair published: 40 public clips

- Compared idle and recovery frame pairs at identical scale in docs/qa-cast-review/lv10-pair.png: feet and body sizes consistent, separate crown/hair/clothing identities preserved.
- Extended tools/review-lv9-pair.py with optional level/folder arguments; original default remains unchanged.
- Scoped commit173b25b4b595761c8d06d7d5577ce1a9ec4383f5 pushed main. Pages run34005139755 completed successfully. Only normalized Lv10 pair, registry and relevant measurement/review tools included (13 files); no raw/rejected images or private files.
- Fresh public qa-shadow-cast runs for male shadow10 and female shadow10 passed battle, preview, mobile bounds and fallback wrong-level guard. Viewed public female battle screenshot.
- Remaining60 true animation sets unchanged (ice/fire/thunder, both genders, Lv1..10); no full-project completion claim. Next safest task: ice Lv1 pair from original integrated references. Full public stage/ladder/GAS acceptance still pending.

## 2026-09-06 Female Lv10 shadow integrated locally: 40 clips

- Recovered completed image-generation output exec-0eaf8b83-6f01-4d5e-93ec-6ea61e794123.png; did not regenerate due to prior truncated output.
- Processed hero-female-shadow-cast-lv10-v1, selected front-hair ROI .045..055 to exclude crown/ponytail, uniformly normalized 460/415 to -body-v2. Viewed six-frame matte; distinct held-weapon poses, right-facing, no clipped limbs/staff.
- Added female:10:shadow to hero-cast-clips.js and normalized asset provenance. Actual measured normalized height459, feet610 within tolerance.
- Fresh local qa-shadow-cast female shadow10 passed battle/preview/wrong-level guard; audit-hero-body --verify passed40; qa-preview-idle passed80 transitions.
- Public remains38 clips at c2390b0; male/femaleLv10shadow local only. Remaining60 true clip sets: ice/fire/thunder across both genders and ten levels. Next compare Lv10 pair, review scoped changes and publish/test; then next weapon. Full gameplay/GAS acceptance still open.

## 2026-09-06 Compact battle UI request reverified

- Rechecked the latest user request, without changing educational gameplay or unrelated sprite work. Existing battle-interface.css/js provides compact panels, normal centered hero, opposing Boss positions and active-status-only aura.
- Fresh local runs: qa-battle-interface.mjs passed seven viewport layouts and controls; qa-status-aura.mjs passed five item colors, pause/expiry, shield consumption, charge/cancel and idle cleanup; qa-battle-ground.mjs passed 45 checks.
- Visually reviewed docs/qa-battle-interface/1366-768.png: compact corner panels, clear arena, opposing characters with matching feet, no passive aura. This is focused UI verification, not a new full-project acceptance run.
- No runtime files modified in this verification. Remaining sprite work and public release status below remain unchanged.

## 2026-09-06 Male Lv10 shadow locally integrated,39 clips

- Built-in raw exec-441ff848-a993-4228-8421-8b4fb55432f8.png; rejected after correct body normalization made pose4 exceed1152px. Revised with built-in edit exec-0141c705-a1f7-409d-a6b4-4950e198fe48.png, compact angled staff/no grid lines. New-v2 source retained locally.
- Reviewed six-frame matte, true right-facing crowned royal mage poses; all bounds pass after460/408 scale. Registered hero-male-shadow-cast-lv10-v2-body-v2 local only. qa-shadow-cast male shadow10 passed battle/preview/mobile/wrong-level guard.39 body/baseline checks pass.
- Found measurement ROI must scale with image: normalize-hero-body.py now multiplies body-region left/right by factor when copying to normalized output. Previously narrow ROI shifted to different hair pixel yielding466; corrected transformed ROI yields460 without changing pixel scale. Existing normalized assets not rewritten.
- Public remains38(c2390b0). Next femaleLv10shadow then pair review/publication.61 other true clips missing; fullgoal remains open.

## 2026-09-06 Lv9 shadow pair published c2390b0

- Commit c2390b07f69c1576de6e125c8f9dd0983e295c4d pushed main; Pages run34003971724 succeeded. Only reviewed normalized male/femaleLv9shadow and QA/measurement tools included; rejected candidates/raw excluded.
- Before release76 idle/cast transitions and456 opaque-frame HUD checks passed. After deployment PUBLIC qa-shadow-cast male shadow9 and female shadow9 both passed battle/preview/mobile and wrong-level guard.
- Public now38/100 true casting clips. Next Lv10 shadow pair;62 remaining animations and latest publicfull8/GAS/nativeIME validation still open. Do not claim complete project.

## 2026-09-06 Lv9 pair proportions corrected before release

- tools/review-lv9-pair.py composites idle/return at identical scale. Visual comparison proved female body smaller despite previous passing silhouette audit: high ponytail ornament inflated measured height490.
- Added source body-region.json left0/right.06 relative to foot anchor to measure front hair/body instead of rear ornament; actual source top177 bottom608 height431. Applied shared factor460/431 to all six frames, replacing local unpublished normalized output. Pair image now front-head/feet aligned; ponytail legitimately extends higher.
- Audit reads optional per-asset body-region.json, normalizer copies it to output.38 checks pass (female body461 baseline610). Prior76 idle/cast transitions passed before size correction; latest female targeted regression rerun. Do not interpret old central-height-only checks as anatomical proof for other ornamented sprites.
- New Lv9 pair still local/unpublished. Next release regression and narrow publication;62 other true clips remain.

## 2026-09-06 Female Lv9 shadow locally integrated,38 clips

- Built-in imagegen exec-956eee1e-3515-40fd-bcc6-4a3eb8d7c362.png from existing femaleLv9shadow. Six generated articulated poses, right-facing high ponytail and dark leaf-head staff. Local original/processed folder hero-female-shadow-cast-lv9-v1; normalized sibling-body-v2.
- Neutral matte six-frame review and battle screenshot inspected. Local qa-shadow-cast female shadow9 passes battle/preview/mobile and wrong-level guard. Audit38 central silhouettes/baselines pass. Note silhouette includes ponytail ornament, so does not prove anatomical male/female size parity; retain for broader review.
- Registry now38/100 locally (male/femaleLv9shadow added since public36). Neither new clip published yet. Next review pair in preview grid then regression and narrowly publish;62 other true clips still missing.

## 2026-09-06 Male Lv9 shadow accepted locally,37 clips

- New v5 cleanup uses source border-connected magenta normalization and alpha-adjacent magenta propagation. Removed arm-gap residue while preserving enclosed crystal facets. v3/v4 retained; accepted output assets/generated/hero-male-shadow-cast-lv9-v5-body-v2.
- Six-frame neutral matte reviewed: genuine crouch/aim/extend/recoil/return, all right-facing, held staff. No permanent rear halo. Normalized460/482 using candidate-only filter; all registered37 body-height/baseline checks pass.
- Registered male:9:shadow width1152 duration650. Local qa-shadow-cast male shadow9 passes battle/preview/mobile and wrong-level guard. Public still fa6ff25 with36 clips; this asset change not published yet.
- tools/audit-hero-body.py accepts --candidate folder without runtime registration; normalize-hero-body.py optional folder filter avoids rewriting unrelated accepted outputs. tools/review-cast-grid.py generates neutral matte from finished frames only, no art synthesis.
- Next femaleLv9 shadow counterpart, then regression/publish the accepted pair.63 missing true clips remain. Native OS IME and public full8/GAS latest regression still open.

## 2026-09-06 Lv9 male no-halo candidate v3

- Resumed missing animation work; built-in imagegen produced exec-b5da41db-8c96-4b1b-b124-684aea5c5707.png. Viewed original/v3. Removes rear permanent halo as latest user requested; six true poses face right, full staff tips.
- Local assets/generated/hero-male-shadow-cast-lv9-v3 raw and processed6frames, baseline610, no cell edges touched. NOT registered/published; purple fringe still visible at high resolution. Need all-six visual playback and actualbody460 normalization.
- tools/build-shadow-cast.py local untracked helper adds optional argv8 version (v1 default), and exact-key interior pocket maskR/B>240 G<30. Earlier180/180/80 damaged crystal facets and was replaced; current preserves facets. Old v1 untouched this turn. Runtime remains36/100 accepted clips.

## 2026-09-06 Published compact battle interface fa6ff25

- Narrow14-file commit fa6ff2547c1a94219b9b617ca862501e2574b1f8 pushed HEAD:main. GitHub Pages run34002649609 succeeded. No raw/candidate hero assets, account data or private GAS files staged.
- PUBLIC https://cona0815.github.io/word-war: qa-status-aura, qa-battle-shortcuts and qa-battle-interface all passed. GM isolation only, no persistence. Initial interface resize assertion read before media-query reparenting completed; local test now waits two animation frames after setViewportSize and includes dimensions in error. Runtime unchanged; this QA-only wait is not committed yet.
- Public full8/GAS integration not rerun this turn. Local full8 evidence above applies to current runtime apart from aura-specificity CSS fix (separately public-tested). Remaining animation36/100 and native OS IME/human playtest still incomplete.

## 2026-09-06 Aura color regression caught and fixed

- Added tools/qa-status-aura.mjs with computed-style assertions, not dataset-only. Initially failed: potion state heal rendered blue because the visibility selector's two attribute selectors overrode color rules. Moved default color to low-specificity .hero-gear rule; five real computed colors now pass.
- Tests cover heal pause/expiry, shield spent, slow/hint expiry, charge/cancel, casting visibility and idle/finished cleanup. Local GM only. This is a CSS-only follow-up to the completed eight-stage run.

## 2026-09-06 Latest compact-layout full stage regression

- Fresh browser run AFTER compact UI, aura and32/68 Boss positions: all eight stages passed four waves and three Boss phases, HP100 and empty damageTrace. Correct counts by stage76/51/68/64/50/43/25/25; durations about203/124/154/140/114/103/64/79seconds. Evidence docs/qa-live-stages/results.json and phase screenshots. Local99099, GAS URL forbidden by assertion, no cloud writes.
- Also reran880 spawn checks, seven viewport control/title checks,45 Boss ground checks and GM projectile pause test (resume damages exactly once). These pass on current runtime.
- Automated answers250ms and fill/Enter are integration coverage, not human difficulty/native OS IME validation. No Boss attack in perfect-answer full runs; separate projectile pause test exercises damage. No publication this turn; complete goal still unproven, animations36/100.

## 2026-09-06 User compact HUD / opposing Boss / conditional aura

- Latest user explicitly requests smaller HUD and lower panels, normal battle centered, Boss facing at opposite ground positions, no passive aura. Implemented desktop320px input panel,180px right controls and tighter upper HUD. Boss hero32%, boss68%; normal remains50%. This supersedes previous all-battles-centered presentation request for Boss mode only.
- battle-ground adds subtle opaque-foot-aligned markers; normal hero marker and opposing Boss markers. Existing alpha foot alignment retained. consumables exposes actual active aura state including1200ms healing pulse with pause-safe timer. battle-interface projects heal green/shield gold/slow blue/hint teal/reward pink/charge gold/ultimate pale; idle equipment and floor halo hidden, casting retains blue visual.
- 45 Boss foot/layout checks passed after symmetric position change. Updated QA account to99099 and added exact32/68 assertion. Added no-idle-aura, normal50%, heal/shield checks to shortcut test.
- Previous full eight stage run completed all four waves/three phases, all HP100, no damageTrace. IMPORTANT: browser loaded BEFORE these compact HUD/position/aura edits, so not evidence for latest layout. Runtime remained normal clock, automated fast answers, not native OS IME or human balance proof.
- Local changes not published yet. Remaining hero animation coverage36/100 unchanged.

## 2026-09-06 Short viewport visual inspection

- Seven-width controls-only test missed Boss title clipping at640x480. Inspected screenshot, compressed vertical panel padding and capped Boss visual size only at desktop-width/height<=600. Moved GM toggle to left in this narrow-height mode to avoid Boss title. Gameplay data unchanged.
- Added Boss title viewport assertion; next run full stage regression after current interface changes. Still local-only.

## 2026-09-06 GM level selector and short viewport

- User reported level input is not selectable. Replaced numeric input with ten explicit options Lv1..10; highest option labels cap. Existing runtime clamp1..10 preserved. Updated three Playwright callers to selectOption.
- qa-gm adds exact1..10 option validation and actual level1/10 starts, retaining storage isolation assertions.
- Expanded UI checks to seven viewports including640x480 with pairwise control-overlap assertions. Reproduced attack/charge overlap; constrained desktop left panel to viewport minus250px. Seven viewport run passes. Local only, no publication in this turn.

## 2026-09-06 Local JRPG presentation and number shortcuts

- User explicitly wants reference-style UI ONLY, preserving centered hero, keyboard-direction enemies, typing, four waves/three Boss phases. index.html only adds battle-interface.css/js and battle-shortcuts.js imports; no spawn formula changes.
- battle-interface.css/js add translucent rectangular battle panels, identity, progression diamonds (seven main/nine ladder). Timeline hides below1300 to avoid Boss title. Local, NOT published yet.
- battle-shortcuts.js relocates existing consumable controls to right on desktop, restores bottom placement on mobile. Keys1 potion,2 shield,3 hourglass,4 hint,5 existing armed ultimate release,6 comboStar. Calls original buttons, no duplicate inventory implementation or changed item rules.
- Number shortcuts disabled throughout Chinese/phonetic/mixed stages3/4/5/6/8/9, any visible numeric/Chinese prompt, composition, modifiers, other editable fields, menus and GM dialog. Repeat does not consume. Mouse still available. Native OS IME remains manually unverified; automated composition guard is not a real IME test.
- enemy-safe-area.js includes timeline and relocated item panel as visual obstacles. Found fixed positioning was trapped by backdrop-filter parent; corrected by moving actual panel into gameScreen. Desktop screenshot inspected after fix.
- PASS local qa-battle-interface (four widths320/390/800/1366, item bounds/right placement, original charge/cancel/release/menu), qa-battle-shortcuts (actual local potion/shield/ultimate and conflict guards), qa-physical-input (78+GM), qa-spawn-clearance (880). No real student/GAS writes.
- Next: review right panel at shorter desktop heights and public deployment after local regression; keep36 approved hero clips status unchanged. Lv9 candidate remains unapproved. Full eight-stage run and remaining64 true clips not completed.

## 2026-09-06 Lv9 cleanup investigation continuing

- Initial largest-component explanation was incomplete: rerunning all components did not remove the suspicious appearance. Generated revised raw exec-a07efeeb-75cd-4d3f-bd2b-c600efa7b6d1.png, currently copied to maleLv9v1 raw.png. Original raw remains in generated_images.
- tools/build-shadow-cast.py (untracked local helper) now accepts optional component mode argv5 and key/edge thresholds argv6/7. Defaults largest/100/150 preserve existing behavior. All30/95 retains purple crystal highlights that100/150 removed; idle now has intact crystal but magenta fringe around ornament/hair persists. All30/55 was also tried, more residue. Do not register yet.
- Current candidate processed six frames/baseline610/no cell-edge clipping; visual acceptance still pending. Next inspect exact fringe pixels and tune deterministic color cleanup without eroding purple crystal, then actual body normalization excluding ornament. Runtime remains36 clips, no deployment change. FemaleLv9 still not generated.

## 2026-09-06 Lv9 male candidate NOT approved

- Generated raw exec-6134c42c-a162-4aa4-b368-f76252b46bdf.png (built-in imagegen) from male Lv9 shadow reference. Six right-facing poses preserve star circlet, rear gold ornament, white/gold wing pauldrons.
- Processed into hero-male-shadow-cast-lv9-v1. Automatic edge checks passed BUT view_image idle.png shows staff-head vertical cutoff near x817. Do not register/deploy. Next inspect grid/cast-1 vs raw: likely grid/component processing issue; repair deterministic splitting if source intact, otherwise regenerate with larger gutters. Also actual body-height normalization must not count head ornament.
- No runtime files modified this turn. True approved clips remain36/100. Raw candidate and provenance saved locally. Continue this issue, then female Lv9.

## 2026-09-06 Lv8 shadow complete poses

- Generated and integrated male/female Lv8 shadow six-pose clips. Male source exec-31f6bd0f-9f6b-4948-9b94-880af373f4bc.png; female exec-06c9b7c5-259a-40ed-9234-e6618e79edfa.png, built-in imagegen, original Lv8 weapon references. All right-facing with integrated held staff, actual elbow/knee poses. Female retains ponytail/star tiara and gold trim; male retains white diamond chest and ornate coat.
- build-shadow-cast.py cleanup/shared scale; normalized male460/477, female460/498, feet576/610. 36 body audit entries pass. Actual six-frame battle/preview/mobile tests pass for both, 72 idle/cast transitions and432 opaque HUD checks pass. Male preview/female battle screenshots visually checked. Existing normalized files unchanged.
- Commit d342994 pushed with only new strips/idle/provenance and registry. Pages34000201348 succeeded; public male/femaleLv8shadow battle/preview/mobile tests passed.
- True clips36/100: starlight both1..10, shadow both1..8. Missing64 still single-image transform fallback, not true pose animation. Next art: male/female Lv9 shadow. Keep goal active; full eight-stage rerun after spawn fixes, broader mobile gameplay and real OS IME remain.

## 2026-09-06 Mobile lower lane

- Expanded qa-spawn-clearance to1366x768/800x900/390x844/320x740 (880 entries), decoded images and screenshot each viewport. At320x740 book/bird/日 etc clamped to distance7.70 before movement, hit radius8.
- battle-ground.js now reserves lower lane when play panel spans hero center and not Boss mode: hero remains horizontally centered, vertical clearance includes half112px minion +21% screen height.14% passed distance but screenshot overlapped hero/question;21% visually clear at320. Boss placement unchanged.
- Local880clearance +16queue,12occlusion/collisionretry,45Bossground checks passed. qa-live-stages now accepts width/height arguments and separate result filename. Full stage2 at320x740 passed51/51, HP100, no damageTrace,4waves/3phases in122307ms. Not human/OSIME proof.
- Commit aed66ba pushed; Pages33999676787 succeeded; public880clearance and16queue checks passed. Next substantive work: resume Lv8 shadow true clips (still34/100). Later full eight-stage rerun after spawn fixes and broader mobile gameplay remain.

## 2026-09-06 Spawn pressure root causes

- Added optional stage argument and per-loop damage trace/failure snapshot to qa-live-stages.mjs. Isolated stage 2 first run failed; second randomized run passed 51/51 HP100 in123s, so arrangement-sensitive, not merely parallel load.
- Deterministic inspection found same-lane inward spread placing stage5 校 at distance6.78 before movement (hit radius8). Removed inward spread for key-derived nonfixed spawns; existing isActive queue already serializes same lane. Fixed digit/arrow offsets unchanged.
- First corrected stage5 full run still HP76: trace showed 日 x53.69/y63.67/distance6.77 immediately damaged twice in wave2. enemy-safe-area.js incorrectly treated lower-left panel as full-width blocked band. Now checks actual horizontal body/prompt overlap before imposing each panel's top/bottom limit, preserving clear center-bottom lane. No HP/damage/content tuning.
- qa-spawn-clearance.mjs decodes images before measuring (previous immediate measurement missed image-height clamp), verifies16 repeated 校 entries identical and queue1visible, then220 generated entries outside hit radius. Passed. 12 existing occlusion/collision retry checks and45 ground checks passed; desktop screenshot checked.
- Second full stage5 run with both fixes passed50/50, HP100, damageTrace empty, four waves/three phases in112965ms. Commit a8eb42e pushed; Pages33999226807 succeeded and public220 clearance/16queue checks passed. Need rerun all stages/mobile clearance after these fixes. Animation work remains34/100.

## 2026-09-06 Full stage rerun after Boss clock fix

- tools/qa-live-stages.mjs completed local-only 99099, normal clocks/animations, all eight stages: four waves + three Boss phases, all correct and no page errors. Automated fill/Enter at 250ms, not human speed or OS IME proof. Results docs/qa-live-stages/results.json.
- Stages 1..8: seconds 203/125/153/139/114/103/64/78; correct 76/51/68/64/50/43/25/25; HP 88/28/100/100/40/100/100/100; Boss attacks zero. Stage 2/5 mob damage with perfect autoanswers remains a significant balance investigation, do not call balance passed. Parallel browser load may affect timings; reproduce isolated and trace mob damage before tuning.
- 78 physical input cases + GM isolation passed separately (animation stub, not full IME).
- Screenshot revealed Boss HP labelled remaining monsters. Fixed hud() to use Boss life label and revert on normal waves. 54 local HUD tests now verify transitions; commit 78fa6a5 pushed. Pages 33998550751 succeeded; public 54 HUD/label transition checks passed.
- Next priorities: investigate isolated stage 2/5 mob pressure, then resume missing Lv8 shadow clips. Full animation completion still 34/100.

## 2026-09-06 Narrow battle HUD

- Fixed fixed-minimum level card overflowing into menu at 320px. Below 600px, title wraps above three fixed-grid stats; score uses 12px to fit 1,234,567 on one line. HUD reserves 104px for menu/GM rail.
- tools/qa-top-hud.mjs: 54 combinations (9 stages x 6 widths), menu overlap, viewport, content overflow and stat alignment checks. Local passed; 320px screenshot visually checked. Existing 45 ground alignment checks passed.
- Commit 84786c9 pushed to main; Pages run 33998241647 succeeded, public 54 HUD checks passed. Full animation work remains (34 genuine clips; 66 absent, transform fallback only); next art is Lv8 shadow. Do not claim project complete. Full stage timing tests after Boss-clock fix and real OS IME still remain.

## 2026-09-06 Boss作答倒數排除施法等待

- 受控GM直接Boss/Lv1星光/題目可答即submit量測：第一關32題全對仍HP50、天梯26題全對HP68，兩者約97%時間是target.pending等待施法/光波。報告docs/qa-boss-pressure/before.json。
- submit答對Boss時記responseRemaining；bossThreat在pending不推進，命中恢復剩餘倒數，再依原規則切階段。不改HP、最低正確題數、傷害與原始作答倒數。預警保留到發射或換階段，不再900ms自動消失。
- 修正後最快全對第一關/天梯皆HP100、32/26題、約32/26秒，仍需全部題數。每題等待1000ms對照：第一關HP40/4次攻擊/63669ms，天梯HP68/4次攻擊/51933ms；壓力仍在，這不是人類打字或完整关卡難度評估。
- 9倒數/預警測試、GM光波暫停、100cast取消、102靜態回歸通過。CSS原預警1.1秒淡出另外修正為持續可見短標示，320px邊界/透明度與桌面截圖目視通過。commitsb1ff8d1/3e316d6推送，Pages33997806515成功。
- 公開站9倒數/可見預警驗收通過，手機截圖目視。後續需以完整波次加不同反應速度評估難度，不能宣稱已完成平衡。34套動畫、66套待補。

## 2026-09-06 公開天梯道具完整驗收

- qa-gas-ladder加入99099護盾準備與使用、跨層run不變/不可重用、送榜後等待閉局並讀回庫存，登出前確認閉局完成。qa-item-closure新增第二層失敗保留一層成績與成功送榜閉局，現在10情境通過。
- 公開Pages+GAS@3真實跑完4波、2層各5階段，沒有qaMode或直接設勝利：首層173361ms含4波，第二層26300ms；正確率100%，HP32/28。護盾1→0，跨層不可再用，同run最後closed；重複送榜拒絕，pageerror空。報告docs/qa-gas-ladder/results.json。
- 此輪沒有改runtime，測試commita2f36e5已推送GitHub。真實測試只用99099，未使用正式學生資料。100%輸入仍低HP需後續平衡評估，不能據此宣稱適合所有學生；測試fill/Enter不等於OS中文IME驗收。
- 34套動畫完成、66套待補；下一項Lv8暗影或以受控速度/正確率做難度比較。

## 2026-09-06 男女Lv7陰影施法

- 男主藍寶石肩膝甲/紫內襯，女主星冠+新增藍寶石肩甲腰飾與護腕，完整持杖六姿勢。舊女Lv6/7暗影PNG雜湊相同，故新Lv7增加實際裝備差異。女初稿第二格握杖不清退回重畫雙手握柄。
- 34套基準、男女實戰/手機、408畫格HUD、200卡片、68待機切換通過；原圖與男女實戰截圖目視。commit7c360b0推送，Pages33996630893成功，公開男女Lv7實戰/手機/預覽皆通過。另45定位及預覽鍵盤焦點回歸通過。
- 34套動畫完成，66套待補。舊參考素材未覆寫，正式登錄表待機與施法均用新clip。其他武器的同級外型仍須各自驗收；下一項Lv8或天梯完整道具流程。

## 2026-09-06 男女Lv6陰影施法

- 內建生圖新增男女Lv6完整持杖六姿勢，男金甲/星胸飾、女星冠/寬袖法袍各自保留，非前一級換色。原圖與實戰截圖目視，女手機截圖目視。
- 32套身高基準、男女Lv6實戰/手機、384畫格HUD、200卡片、64待機切換通過；45定位與8閉局回歸通過。commit0bddab8已推送，Pages33995969037成功，公開男女Lv6實戰/手機/預覽皆通過。
- 32套真實動畫，68套待補。下一項Lv7陰影或天梯道具完整生命週期驗收，實體IME與平衡缺口維持。

## 2026-09-06 道具閉局前端與GAS部署

- Consumables reset會關閉run/pendingRun，等待正在建立/消耗與finishStage請求後再close。新局先等同帳號同session同URL清理，close失敗保留重試；其他帳號不被舊帳號失敗阻擋。
- 失敗/重開/換帳號與天梯最終失敗/成功送榜清理；天梯通過單層保留道具使用上限。finishStage維持先结算星星獎勵；settleStage與道具回應加帳號/session/URL及版本保護，不覆寫新帳號。
- 本機8種閉局情境、8焦點、8 transport、GM效果暫停、道具效果與60後端契約通過。舊qa-consumables mock需新增close回應和prepare微任務等待，測試已更新。
- 私有部署檔與公開gas_code.gs逐行比對（除首行sheetID）一致，clasp推送並更新既有測試GAS至@3。99099真實測試通過失敗關閉/庫存不變/冪等重送/關閉後拒絕消耗；未接觸正式學生資料。
- commits35c82ec/ec19ba7已推送，Pages33995359299成功，公開頁面+真實GAS99099失敗閉局及公開8種閉局情境通過；102靜態檢查通過。頁面直接關閉或請求永久斷線仍依30分鐘TTL兜底，未宣稱瀏覽器關閉一定同步。30套動畫、70套待補與實體IME/平衡缺口維持。下一項Lv6陰影動畫或完整天梯道具生命週期驗收。

## 2026-09-06 道具閉局伺服器契約

- gas_code.gs新增需登入的closeItemRun與closeItemRun_，依帳號與完整runId上鎖關閉。缺失/不同/已關閉run不寫入，不依賴expectedVersion，保留庫存/收據/獎勵。舊局請求不關閉新局。
- tools/qa-gas-contract.mjs新增13項，全部60個check通過：權限/非法ID、版本過期、重送、關閉後拒絕消耗、延遲舊局、寫入後遺失回覆、天梯收據重送與建立重送不重開。這是本機GAS mock契約，非真實部署驗證。
- 尚未接前端、未部署GAS。下一步Consumables生命週期：重開/換帳號/失敗關閉；一般成功先等待finishStage結算再清理，避免星星獎勵被提前關閉；天梯成功每層不是離場，不可每層reset道具上限，最終失敗/送榜/重開才關閉。
- 延遲prepare/consume需以捕捉的帳號session及service URL關閉正確局，等待待處理請求完成再close，新prepare要避免與close版本更新競態；不可把舊profile覆寫新帳號。瀏覽器關閉斷線只能best effort，30分鐘TTL仍要保留。
- 30套真實動畫、70套待補，整體目標仍進行中。

## 2026-09-06 女主Lv5陰影施法

- 新增女主完整持杖六格，保留棕色馬尾、冠飾、銀甲與星紋披風，收招杖尖維持右上。原圖與實戰/手機截圖目視通過。
- 30套身高腳底基準、女Lv5實戰/手機、360畫格HUD、200卡片與60次待機切換通過。commit094f1ff已推送，Pages33994505004成功，公開女Lv5實戰/手機/預覽通過。
- 30套真實施法完成，70套待補。下一項可先處理道具閉局，再接Lv6陰影；實體IME與平衡缺口維持。
- 道具閉局重新讀碼確認：gas_code.gs只在finishStage關閉itemRun，consumables.js沒有離場/失敗關閉API。新增需依runId冪等，舊run關閉不能誤關新run，並處理遲到prepare/consume回應；ladder-battle.js為天梯實作入口。現有GAS contract測試50行输出全部通過，未覆蓋此缺口。

## 2026-09-06 男主Lv5陰影施法

- 新增完整持杖六格，保留棕髮、銀甲、星紋長衣。初稿第五格杖尖反轉，目視退回重畫朝右上收招；沒有只依自動測試接受。
- 29套身高基準、男Lv5實戰/手機、348畫格HUD、200卡片、58待機切換與45場景位置檢查通過。
- commitc4cf457已推送，Pages33994174155成功，公開男Lv5實戰/手機/預覽驗收通過。29套真實動畫、71套仍待補；下一項女Lv5。道具閉局、實體IME及平衡缺口維持。

## 2026-09-06 女主Lv4陰影施法

- 女主Lv4完整持杖六姿勢已生成、去背並接入共用動畫表。暗底初稿退回重畫，保留高馬尾與裙裝；不是外掛武器疊圖。
- 28套身高基準、女Lv4實戰/手機、336畫格HUD、200卡片、56待機切換通過；實戰截圖已目視。身高460、腳底610。
- commit54b0904已推送，Pages33993741901成功。部署中首次公開測試讀到舊版失敗，發布完成後重新通過女Lv4實戰/手機/預覽。另本機102靜態檢查及預覽鍵盤焦點通過。
- 28套真實動畫完成，72套仍待補；道具閉局、實體IME及平衡評估仍未完成。下一個安全任務為Lv5陰影持杖連續動作，沿用六格/統一身高/實戰截圖驗收。

## 2026-09-06 男主Lv4陰影施法

- 內建生成保留藍髮額飾銀肩甲，原素材朝左改六姿勢朝右。初稿雙腳高度差讓footx漂移及bodyHeight471失敗；重畫雙腳同基線，重新去背正規化，身高460/footx576.5/bottom610通過，未放寬驗收標準。
- 27套基準、男Lv4實戰手機、324HUD、200卡片、54待機切換通過，實戰截圖目視。女Lv4陰影尚未製作。
- commite347a6e已推送，Pages33993149544成功，公開男Lv4實戰/預覽/手機通過，另本機預覽焦點通過。27套完成、73套動畫仍待補，道具閉局/IME/平衡等缺口維持。

## 2026-09-06 GM效果計時保留

- Consumables與UltimateBattle各新增局部效果時鐘pause/resume，GM開關共同調用。沙漏、提示、ultimate freezeUntil在GM內不流失，恢復延後deadline；begin/reset清除pausedAt避免跨場延長。
- 新qa-gm-effect-pause模擬Date.now前進20秒，沙漏仍0.5、提示仍有首鍵、大招剩餘時間精確保留；再前進10001ms效果到期；GM中重開場清零。這是計時邏輯驗收，不是長時真人測試。
- qa-consumables與qa-gm-projectile-pause、8焦點回歸通過。commit854a3a1已推送，Pages33992552108成功，公開效果計時驗收通過。
- 74套真實動畫、道具閉局、實體IME及平衡等仍待完成。此修正未處理所有視覺動畫暫停。

## 2026-09-06 GM光波暫停

- GM原只clearInterval，已飛行光波仍會完成扣血。BossProjectile新增活動動畫集合與pause/resume；GM開啟暫停，關閉恢复，已取消flight回傳false。
- GM記錄pausedAt和battleVisualGeneration；同一Boss戰關閉後順延bossAttackAt，重開不同戰鬥不套用舊倒數。
- qa-gm-projectile-pause驗證GM開900ms不扣血、光波仍保留、返回只扣一次、新戰鬥不受舊光波傷害；100cast/stale cancellation回歸通過。
- commitdd7b3f3已推送，Pages33992221519成功，公開GM光波暫停驗收通過，另78輸入本機回歸通過。此項只覆蓋Boss光波/攻擊倒數，不代表全部道具或視覺計時器都有暫停。74套動畫、道具閉局、實體IME及平衡等仍未完成。

## 2026-09-06 Lv.3 陰影施法

- 男女Lv3完整身體持杖六姿勢由內建生圖生成，保留男主金色肩徽/腰扣，女主蝴蝶結/紫眼/裙裝；去背v1與統一身高body-v2皆保留。
- 26套身高落腳基準通過；男女Lv3實戰/手機、312HUD畫格、200卡片、52待機切換通過，男實戰及女手機截圖已目視。
- commit9835bc1已推送，Pages33991908067成功，公開312畫格HUD通過，另本機45次ground回歸通過。26套真實施法完成，74套仍待補；道具閉局、實體IME和平衡評估尚未完成。

## 2026-09-06 物理鍵盤路由與GM隔離

- 新增qa-physical-input，獨立台灣注音鍵表期望值，Playwright鍵盤事件涵蓋26字母/37注音/4聲調組合/7標點題/4Ctrl熱鍵，共78種；教學Ctrl熱鍵不變更大招集氣或釋放狀態。以cast stub隔離輸入路由，不聲稱動畫或OS IME測試。
- 問號初次失敗是測試Shift+/傳送key值不符，改Playwright Shift+?（同理!與:）後通過，未改遊戲標點映射。
- 真正重現GM視窗開啟仍攻擊背景（attempts78變80）。typing-input、一般global key與ultimate三處增加GM open隔離。78題及GM隔離、qa-repeat-delete通過。
- commit7ae3099已推送，Pages33991435679成功，公開78種输入與GM隔離驗收通過；8道具焦點回歸通過。76套動畫、道具閉局、實體IME與平衡評估仍待完成。

## 2026-09-06 八關正常時鐘回歸與長按刪字

- 公開4f6fe23版qa-live-stages八關全部通過，每關四波/三Boss階段，正確題數76/51/68/64/50/43/25/25，耗時約65-203秒，無pageerror且達GAS最低題數。使用新瀏覽器99099本機資料，不連GAS；fill+Enter驗證流程，不代表實體IME選字或全部物理熱鍵操作。
- HP依關卡28/68/40/40/56/68/68/68，100%正確仍承受傷害，第1關節奏需再評估（八context並行也有測試負載因素），不要逕稱教學平衡已完成。
- 找到typing-input event.repeat連Backspace/Delete長按都阻止。先重現abcd按兩次Backspace只剩abc，修正讓刪字鍵維持原生行為，其他重複鍵仍攔截。qa-repeat-delete兩鍵連續刪字及不提交攻擊、防連發通過。
- commit46e61ab已推送，Pages33991067351成功，公開qa-repeat-delete通過。完整回歸結果docs/qa-live-stages/results.json。76套動畫、道具閉局與實體IME等缺口維持。

## 2026-09-06 主角固定置中與手機Boss標示

- 發現Boss戰heroBoss.x=31違反主角置中，改為heroNormal副本，切Boss不再跳位。手機Boss固定left73%也與bossPos78%不符，移除覆蓋；手機Boss尺寸改min(32vw,270px)。
- 手機縮小Boss後題目原top28px會壓頭、260px血條出界，battle-ground改窄版名稱/血條/題目堆疊在Boss上方並依實際題目高度排版、水平邊界修正。
- qa-battle-ground擴為9關5尺寸（含320、800寬）45次：腳底差<1px、主角水平置中、Boss顯示/邏輯x一致、標示不出界且窄版互不重疊。截图390/1366已目視；288HUD與100cast/stale projectile測試通過。
- commit4f6fe23已推送，Pages33990704679成功，公開45次定位驗收通過；qa-game102通過。76套動畫、道具閉局、實體IME與全流程人工驗收仍待完成。

## 2026-09-06 道具延遲回應焦點

- 實際重現consumables.use finally無條件answerInput.focus，打開選單後道具回應到達仍搶走焦點。改為僅戰鬥中且任務/選單/GM皆關閉才返回輸入。
- 新增qa-item-focus，模擬成功/失敗延遲回應各四種狀態（戰鬥、選單、結果、GM）共8種通過。GM測試使用已登入可见gmStart，不使用隱藏登入按鈕。
- qa-consumables效果/一次性/慢速/提示/獎勵/帳號競態回歸通過。遠端main確認2fc01b9；Pages33990267396成功（run metadata headSha顯示前次65d3aa7），直接公開頁8情境qa-item-focus通過，故以公開行為驗收為準。
- 76套其他武器動畫、道具閉局、實體IME與整體人工驗收仍未完成。

## 2026-09-06 Lv.2 陰影施法

- 男女Lv2陰影六姿勢完整持杖完成；男原圖直接通過，女第五格向後甩杖改為向前收招。均保留既有服裝髮型與紫晶武器，外部煙霧不納入身體圖。
- 24套身高基準通過；男女Lv2實戰與手機、288HUD、200卡片、48待機切換全部通過，實戰與手機截圖已目視。
- commit65d3aa7已推送，Pages33989975743成功，公開288畫格HUD通過。真實連續動作24套，其他76套仍未完成；道具閉局與實體IME驗收亦未完成。

## 2026-09-06 五種道具真實 GAS 與連線錯誤

- 擴充 qa-gas-items，隔離99099驗證五種道具：各1扣到0、補血50到75、護盾失誤扣血0、沙漏倍率0.5、提示首鍵A、獎勵星旗標true；loadProfile庫存一致、相同事件重試不再扣除。這不是五種道具的所有情境驗收，獎勵實際結算仍由合約測試覆蓋。
- 初次公開頁真實GAS測試失敗：上游傳回HTML，原gasPost直接r.json顯示SyntaxError。重新登入讀最新庫存後，本機頁連真實GAS五種全部通過，未盲重送未知購買。
- gasPost加入45秒AbortController、HTTP/非JSON/結構錯誤/網路失敗繁體中文提示，不自動重試交易，提醒重新載入確認未知結果。8種transport模擬含body讀取逾時全通過，qa-game102與GAS合約通過。
- commit8022b9a已推送，Pages33989444041成功；公開網站8種transport異常驗收通過。真實GAS結果docs/qa-gas-items/results.json。
- 仍缺失敗/退出/天梯結束明確關閉itemRun，目前下一場取代或30分鐘到期；後續可補閉局機制與版本競態測試，再更新隔離GAS部署。78套其他武器動畫也仍待完成。

## 2026-09-06 Lv.10 星光施法與縮放焦點

- 男女 Lv10 六姿勢完成，保留王冠、滿級服裝與完整持杖。男生第五格杖尖過低導致腳底定位錯誤，已用內建生圖修正；女生背景光暈與第五格低杖尖也重畫修正，再去背正規化。
- 星光男女 Lv1-10 共20套，加陰影 Lv1 男女2套，目前22套真實動畫；其他78套仍待完成，不可聲稱全武器完成。
- 本機22套身高基準、264畫格HUD、200等級卡片、44待機施法切換、男女Lv10實戰與手機通過。
- qa-shadow-cast 回退測試改由DOM武器選項搜尋缺少的等級武器組合，不再假設星光一定有缺級。
- 補驗發現resize重建卡片有節點脫離時序問題，改只更新已載入縮圖尺寸。新增保留同一焦點節點的resize測試，鍵盤與200卡片重測通過。
- 8f7a20b動畫已推送且Pages33988853219成功；391926c縮放修正已推送，Pages33988997478成功。公開264畫格HUD與預覽鍵盤焦點測試通過。
- 後續可補其他武器真實持杖動作，並持續實體中文IME與完整教學流程驗收；不碰正式學生資料。

## 2026-09-06 Lv.9 星光施法

- 男女Lv9內建生圖六格完整持杖向右，原圖/去背/body-v2俱全，保留金藍肩飾與原身分；身外光環不納入身體縮放。
- 20套身體基準通過，男女Lv9實戰手機、240HUD、200縮圖、40待機切換通過；女實戰截图目視完成。
- commit541ccbf推送，Pages33987955534成功，公開240畫格HUD通過。20套真實施法，80套仍未完成，不能稱所有武器已完成。下輪可補Lv10；qa-shadow-cast fallback測試需改選未完成武器組合，不可再假設有缺的星光等級。

## 2026-09-06 預覽對比與鍵盤焦點

- 發現card.active繼承button.active亮黃底而文字淺色，改深綠底/金色內框。加入focus-visible3px青框。
- renderGrid重建前保存focusedLevel，新節點恢復focus preventScroll；所有等級卡片設定aria-pressed。Enter/Space選取不再丟焦點，Tab可往下級。
- qa-preview-access桌機/手機測Enter/Space/Tab/pressed/焦點與標題正文對比>=4.5通過，手機截圖目視。200縮圖/36待機回歸通過。
- commitbb7091c已推送，Pages33987393055成功，公開qa-preview-access通過。動畫仍18套/82套未完成，本輪為UI修正。

## 2026-09-06 Lv.8 星光動作

- 男女Lv8六格與body-v2完成。男初稿frame5缺杖頭，第一次修復frame5/6黏連被processor拒絕，再以內建imagegen加寬留白才通過。新增額飾/銀金肩甲區別Lv7。女依原Lv8參考保留服裝與大型環形法杖。
- audit-hero-body審查圖高度改依套數成長，不再4x4截斷。18套身體基準通過，男女實戰/手機、216HUD畫格、200縮圖、36待機切換通過；女實戰截圖已檢視。
- commita6bbf52已推送，Pages33987059497成功，公開216畫格HUD測試通過。18套真實施法，82套未完成。未完成組合仍fallback，不可宣稱全部人物已完成。

## 2026-09-06 Lv.7 星光連續動作

- 男女Lv7六格內建生圖完成，使用-body-v2校正身體高度(460/459)、腳底610。女原Lv6/7外型相同，Lv7新增加晶石肩甲/胸飾作升級辨識，保留身分與法杖。其餘未完成武器組合仍舊原圖，不能稱所有Lv7外型已同步。
- 男女qa-shadow-cast、192HUD畫格、200縮圖卡片、32待機切換通過，女實戰截圖已檢視。qa-preview-grid不再硬編六個星光clip，改讀registry數量。
- commit1570af7已推送，Pages33986388622部署成功，公開192畫格HUD檢查通過。真實施法16套，84套未完成。audit-hero-body聯絡表目前4x4剛好16套；下次增加前需讓高度依套數成長，避免審查圖截掉新素材。

## 2026-09-06 等級縮圖同步

- hero-preview-clips renderGrid接已完成clip同資料夾idle.png，decode成功才替換，舊節點脫離則忽略回應，朝向固定1。未完成86組仍保留各自原圖。
- 新qa-preview-grid測200卡片兩性別/5武器/10級/2視窗；首版只驗sprite邊界，手機截圖發現父card更窄仍裁武器，追加card實際邊界檢查，縮圖寬100%max170並依可用寬度共同比例縮小，resize重render。
- 手機修正後截圖已檢視無武器裁切，200卡片與28待機切換通過。最終c588a7c，Pages33985757075成功，公開200卡片測試通過。watch一度網路逾時，重新查同部署確認成功，未重新部署。

## 2026-09-06 預覽待機與施法一致

- hero-preview-clips.js 待機改用已完成clip第一格，不再從舊整合PNG換到不同尺寸/身分的施法圖。共用showClip(play)載入與尺寸/方向；待機不播放，stop清除width以免fallback殘留。未完成組合保持原整合圖。
- tools/qa-preview-idle.mjs 對14套×桌機/手機28組測試相同image/width/height/face、待機零動畫通過。女Lv6施法/未完成組合回退測試通過。
- commit082ce24推送，Pages33985364687部署成功，公開28組切換測試通過，手機待機截圖已檢視。仍14套/86套缺連續動作。等級縮圖網格仍舊整合圖，之後應同步已完成clip的待機圖並驗證，不能把大預覽修正當全部顯示完成。

## 2026-09-06 已完成動畫身體比例校正

- 發現build-shadow-cast原以含武器總高度500縮放，身體中央輪廓高度441~500不一致。新增audit-hero-body.py量測/審查圖；normalize-hero-body.py單套六格共同縮放，站立身體目標460，腳底(576,610)，全部統一1152x648，拒絕裁切。原圖保留，14套新增-body-v2並更新registry。
- 492目標曾造成女Lv3抬杖越上緣，已降至所有畫格能完整容納的460；校正後14套量测458~461，腳底610。審查聯絡表已目視。這是中央輪廓基準，不代表所有關節逐格比例完美。
- 本機168HUD畫格、27腳底/標籤、12開場載入/第一次攻擊、100施法回歸、女Lv3實戰預覽通過。qa-opening-cast改對registry路徑，不硬編舊檔名（工具仍未追蹤）。
- commitba10c8c已推送，Pages33985008661部署成功，公開168畫格HUD檢查通過。仍14套完成/86套未完成，未新增動作套數。新素材後處理應使用身體基準，不能再把長武器高度當身體大小。

## 2026-09-06 Lv.6 星光施法

- 男女Lv.6六格完成；女版首稿背景深色光暈不合格，以內建imagegen換純洋紅背景後去背。保留男金甲/女星冠寬袖與紫藍法杖，朝右完整持武器。
- qa-shadow-cast 男女實戰/預覽/手機通過，qa-hero-hud168画格通過；女實戰/手機截圖目視無背景殘留。整套人物實際身體視覺尺寸仍需比較校正，不能只靠1152x648畫布尺寸判定一致。
- commita55a2d5推送，Pages33984491596部署成功，公開168畫格HUD檢查通過。共14套真實施法，86套未完成。100組施法與舊光波取消回歸通過。

## 2026-09-06 Lv.5 星光施法

- 男女Lv.5星光六格施法完成；男首稿缺第二格杖頭且第三/五格縮小，內建imagegen修復後才處理接入。保留銀肩甲/腿甲等原始等級服裝，無額外疊武器。
- qa-shadow-cast 男女實戰/預覽/390手機通過，qa-hero-hud144畫格通過，女版實戰/手機截圖目視通過。
- commit558ad1e已推送，Pages部署33983818362成功，公開144畫格HUD檢查通過，100組施法流程回歸通過。共12套真正連續施法，88套仍未完成。
- 公開Pages連測試GAS的 qa-gas-ladder.mjs 完整通過：隔離99099、四波、兩層各五階段、Ctrl熱鍵、結算、拒絕重複提交、登出。報告docs/qa-gas-ladder/results.json。本輪開始於部署期間，無關前一版本到本版僅動畫新增；不可稱伺服器權威逐題防作弊已完成。

## 2026-09-06 Lv.4 動畫與公開八關完整回歸

- 公開 Pages 在7d774c0版本跑 tools/qa-live-stages.mjs 八關正常計時四波及3個Boss階段全部通過；各關答對76/51/68/64/50/43/25/25，約66至204秒。隔離99099本機存檔，未接正式學生資料；是自動fill+Enter，不是實體IME驗收。這次涵蓋最後heroPoint碰撞座標修正。
- 男女Lv.4星光六格施法內建生圖、去背、腳底對齊完成，保留額飾/肩甲/披風等級造型。qa-shadow-cast 男女實戰/預覽/手機通過，qa-hero-hud120個不透明畫格避UI通過，截圖已目視檢查。
- tools/qa-shadow-cast.mjs 移除Lv.4必無動畫假設，動態選尚無星光clip的等級驗證fallback；測試工具仍為本機未追蹤檔。
- commit9a55196已推送，Pages部署33983324096成功，公開網站120項HUD畫格檢查通過。真正六格施法10套完成，仍餘90套；不得以fallback宣稱完成。100組施法/舊光波取消回歸通過。

## 2026-09-06 Lv.3 動畫與真實 GAS 天梯

- commit 7d774c0 已推送，新增男女 Lv.3 星光六格連續施法。男版首稿第二格武器不完整，內建生圖修補後才去背。兩套實戰/預覽/手機測試通過，八套已完成動畫共96個不透明畫格HUD避讓檢查通過。
- ladder-battle.js 改用未四捨五入正確率判斷85%門檻，50/59拒絕測試通過，已隨此提交發布。
- tools/qa-gas-ladder.mjs 本機前端連真實隔離GAS、帳號99099：正常四波、兩層各五個Boss階段、Ctrl熱鍵、成績結算與拒絕重複提交全部通過；報告 docs/qa-gas-ladder/results.json。不等於正式學生資料或公開Pages端本輪重跑。
- 尚餘92套角色等級/武器組合沒有真正六格施法，不可稱所有動畫完成。Pages部署33982894602成功，100組施法流程與舊光波取消回歸通過。

## 2026-09-06 真正五階段天梯與續層

- index.html 新增 bossPhaseCount，僅stage9改5階段。bossPool按1英字/單字、2注音/拼音標點、3國字/詞語、4Ctrl熱鍵、5英中句子分流；主線仍3階段。
- ladder-battle.js 每層完成可送出或續下一層，最多99層、每5層增加答題下限、血量隨樓層增加；下一層恢復20能量。初層Boss傷害8起緩升，不沿用phase5=26的過高傷害。
- pendingLadderRecord.floor使用實際cleared，不再correct/10；挑戰失敗有已完成層時可留下最高層，送出後不可續同一局。local也檢查85%正確率。換層遞增battleVisualGeneration擋舊光波。
- GM關卡選9時可選5階段。兩層實戰含真正Ctrl組合键、2次連續結算fixture、手機390/桌機layout均通過，GAS契約與102項主線靜態回歸通過。
- commit b05ca3c 已推送。此輪尚未做真實GAS天梯續層結算，後端仍有合理性上限但沒有每題伺服器權威驗證；不可稱防作弊完成。94套人物施法仍待製作。
- Pages部署33981909834成功。部署後另發現本機85%判斷用了四捨五入值，已在工作區改用correct/attempts原值，qa-ladder-layout 50/59邊界拒絕測試通過；此一行修正尚未提交/發布，下一輪一起帶上。
- qa-ladder-floors 從公開網址重跑兩層五階段/實體Ctrl事件/失敗保留已完成層/送出停止續戰通過（GM隔離模式，非GAS排行榜）。

## 2026-09-06 八關正常計時回歸與遮擋修正

- qa-live-stages.mjs 改隔離99099本機帳號、只跑主線8關、正常計時不使用qaMode；新驗收與gas_code.gs STAGE_MIN_CORRECT對照。最初公開網站發現第1關75題、第5關49題能本機通關卻低於GAS76/50。
- 修正碰撞小怪：扣血後同題重生，不再alive=false/cleared++跳題。正常計時重跑8關通過，correct依序76/51/68/64/50/43/25/25，四波與3階段俱全，Boss實際攻擊2或4次。耗時约64至202秒，自動fill+Enter，不等於真人打字/實體IME驗收。
- battle-ground.js 以底部play-panel上緣限制hero y，hero x不變，Boss腳底沿同線；Boss名稱可換行且左右clamp。新qa-hero-hud 72個不透明畫格避UI檢查、qa-battle-ground27項腳底+label範圍、qa-enemy-safe-area12項+碰撞重試均通過。
- 小怪移動/距離改heroPoint實際位置，避免y避讓後碰撞位置失配。這是8關重跑後追加的座標修正，最後版仍需再次完整跑線上8關。
- commit430713b已推送。大橋堂仍未完成設計要求的真正天梯/5階段；94套人物動作仍未完成。
- Pages部署33981324593成功，公開網址重跑72個不透明畫格HUD檢查通過。

## 2026-09-06 Lv.2 星光連續動作

- 新增男女Lv.2星光六格；male原圖exec-96721c1d-ab32-42ee-a5de-b0411ed99a5c.png，female原圖exec-40e9d5d1-b83d-4773-833b-1f60327a6592.png，prompt在各PROVENANCE.md。
- tools/build-shadow-cast.py 支援 gender weapon level 參數；不規則網格無空白水平線時用六個最大連通人物切分，未合成新姿勢。仍需逐張視覺檢查。
- 新共用 hero-cast-clips.js 註冊6套經驗收動作，index和hero-preview共讀，不再複製對照表。100組剩94組未重畫。
- 本機 qa-shadow-cast ... male starlight 2 / female starlight 2 桌機手機通過；qa-opening-cast 12项、qa-combat-motion100組通過。已視覺查看女Lv2戰鬥前刺，腳底與Boss同線。
- commit70a5c86已推送。下一步仍需完整關卡與天梯、更多等級/武器動作及道具閉局。戰鬥底部面板在Boss戰大幅伸展的披風左側可能接近，後續做動作全幀遮擋幾何QA。
- Pages部署33980612325成功，男女Lv.2星光在真實GitHub Pages重跑戰鬥/預覽測試均通過。

## 2026-09-06 道具發布驗收

- 測試 GAS 已更新既有 deployment 至 @2（同一 exec URL），保留 .deploy-gas 私有試算表設定。commit 575bdfc 已推 main，包含 gas_code.gs、consumables.js/css、index.html、typing-input.js、gm-mode.js。
- tools/qa-gas-items.mjs 用99099登入、購買（僅缺貨時）、正式 startBattle 建局、補25能量、loadProfile 驗證收據，再重送同eventId不再扣庫存，全通過。只使用既有隔離測試試算表。
- GitHub Pages 部署33979964682成功，qa-gas-items 以 https://cona0815.github.io/word-war/ 重跑也通過。
- tools/qa-consumables.mjs 加真實10秒到期、390px道具與大招不重疊、切關延遲prepare與换帳號延遲consume保護測試，通過。桌機/手機PNG已檢視，手機大招改置於play-panel內正常流。
- GM 新增「消耗品各補5個」不持久化，仍每局每種一次。
- 尚需補強：finish失敗/天梯的伺服器閉局（目前靠新局取代與30分鐘過期）、所有雲端道具逐一實際驗證（live目前藥水）、線上初始設定仍預設本機、96組真實施法與天梯規格仍未完成。目標保持active。

## 2026-09-06 道具前端接入（本機驗收中，未發布）

- 新增 consumables.js/css 接到 index.html，五種效果與每局一次限制；正式 startBattle 先 prepare 建立雲端局，GM/local spawn 自動本機局。reset 掛 begin/switchAccount；generation 防舊回覆；pendingRun/eventId 保留供超時重試。
- 小怪 loop 套 slowFactor，submit 失誤走 shield；提示由 typing-input.js 的 TypingHints.firstKey 使用既有 hanInitial 和實體注音鍵表，沒有映射時不扣道具。
- grantLocalStageReward 加星星10%；gasPost finishStage 帶 itemRunId；GAS 檢查收據加10%並關閉已結算局。買99個前端與後端都拒絕。
- qa-consumables.mjs 通過本機補血、滿血、單次護盾、慢速、提示、星星標記與重開重設；已查看 docs/qa-consumables/desktop.png。qa-opening-cast 12項通過；qa-gas-contract 含星星46金幣/結算關閉等全通過。
- 下一步必要：雲端回覆延遲/換帳號與窄螢幕QA、沙漏10秒到期測試、GM道具庫存工具、確認failed run/天梯的閉局策略。再同步私有 .deploy-gas/程式碼.js（保留私有試算表ID）到既有GAS deployment，測99099，再發布 Pages。尚未部署或 commit 本輪更改。

## 2026-09-06 消耗品後端第一段（尚未部署）

- gas_code.gs 新增 startItemRun / consumeItem，沿用 sessionToken。itemRun 收據與 inventory 在同一筆人物列 setValues 寫入，避免另開收據表導致跨表不一致。
- 每局每種道具一次；同 eventId 重送回傳目前資料不再扣庫存；跨局、跨帳號、錯誤版本、零庫存被拒絕。saveProgress 只保留資料庫收據，不接受前端 inventory 偽造。
- purchase_ 修正庫存99仍扣款。這次只改本機 gas_code.gs，尚未複製到 .deploy-gas、未 push GAS、未發布 GitHub。
- qa-gas-contract.mjs 新增道具閉環單元測試，含 persistProfile 寫入成功後模擬回覆中斷再重送，全數通過。不是線上 GAS 驗證。
- 下一步：前端 consumables 模組、每關建立run、五種道具效果與窄版工具列、同步時保留run資料、切關/換帳號舊回覆防護、星星後端結算加成。參考 docs/consumables-acceptance.md。完成瀏覽器測試後再部署測試 GAS 與 Pages。
- 注意：目前後端run只驗證30分鐘期限與上一局ID替換；尚未關閉結算完成的run，前端接入時要補齊關閉語意。不要把這個中間狀態標成道具功能完成。

## 2026-09-06 持續品質目標啟動

- 已建立 active goal，不需要逐項向使用者詢問是否繼續。
- 新增女 Lv.1 暗影六格持杖施法，原圖 exec-e3bac0f5-d0e5-44dd-8e7c-cf41679f07ae.png。去背流程追加縮放後邊緣去溢色；完整 prompt 保存在新素材 PROVENANCE.md。
- index.html 和 hero-preview-clips.js 精確使用女版暗影圖，qa-shadow-cast 支援第三參數 female；本機 female 桌機與手機測試通過，100組施法回歸通過。
- 真實六格現在4套，剩96套整圖變形。不要用數量代替逐張視覺品質驗收。
- 下一個流程缺口：playerItemCatalog 五種消耗品可購買但無 useItem。GAS 僅 purchase，沒有 consume handler。必須前後端共同設計庫存權威、重複請求與每關上限；不可先做本機扣庫存後讓雲端復原。尚未改動 GAS。
- 已發布女版素材提交 65d7b04，Pages 部署成功。消耗品待實作驗收規格在 docs/consumables-acceptance.md，包含 GAS 非交易寫入的恢復要求。另發現 purchase_ 在庫存99仍會扣錢，應一起修復並加測。

## 2026-09-06 暗影武器真實施法

- 男主 Lv.1 暗影武器新增內建生圖六格持武器施法，去背、共同縮放、腳底錨點 (576,610)，1152x648 每格。戰鬥播放一次，預覽循環播放。
- 預覽依性別、等級、武器精確選圖，阻止其他等級誤用 Lv.1 星光人物；窄螢幕預留伸手空間，選取武器對比與成長欄位換行已修正。
- 驗證：qa-shadow-cast 桌機與390px、qa-opening-cast 12項、qa-combat-motion 100組與舊光波取消、qa-game 102項通過。這些不是每關全程真人輸入驗收。
- 真實六格目前只有男/女 Lv.1 星光、男 Lv.1 暗影三套；其餘97組仍為整圖變形，不能宣稱美術全完成。後續依一致身份、武器、方向、腳底錨點逐套製作。
- 本輪不變更 GAS 或教學流程。公開頁面仍預設本機存檔。
- 已發布 4439a44，GitHub Pages 部署成功，qa-shadow-cast 使用真實網站重跑通過。人物素材測試原本仍預期女 Lv.4 翻轉，核對原圖朝右後更新預期為 +1。

## 真實 GAS 與 GitHub Pages 連線驗收通過

- 已讀取使用者執行的 `docs/qa-gas-live/result.txt`：17/17 通過，涵蓋專用 99099 建立與登入、存檔、八關結算、消耗品購買、天梯前50與登出。管理密鑰未進聊天或報告。
- 新增並執行 `tools/qa-pages-gas.mjs`：真實 https://cona0815.github.io/word-war/ UI 登入 99099、跨來源 loadProfile、logout 後拒絕讀取全通過，無 pageerror。證據 `docs/qa-gas-live/browser.json`。
- 測試瀏覽器僅透過隔離 localStorage 指定 GAS；公開首頁尚未改為全體預設雲端模式。需明確區分「連線已驗證」與「預設雲端上線」。GAS 是測試專案，不能逕自作正式學生資料庫。

## GAS setup 完成後實際端點驗證

- 使用者已在 GAS 執行 setup。現有 /exec?action=ping 實測 HTTP 200、ok:true；公開 leaderboard ok:true 空榜。
- 未登入 POST loadProfile、purchase、saveProgress 均回 Session is required；students 未帶密鑰被拒絕。沒有建立或更動學生帳號。
- ADMIN_TOKEN 尚未設定，端點明確回 Please set ADMIN_TOKEN in gas_code.gs or Script Properties；完整帳號／購買／存檔 QA 尚不可執行。請使用者透過 GAS 私有 Script Properties 設定強隨機管理密鑰，不貼聊天、不寫公開儲存庫。
- Pages 尚保持本機存檔預設，不能將 ping 成功稱為前後端登入同步驗收完成。

## GAS 測試部署已建立，執行授權待確認

- 使用者已明確同意僅測試專案公開 API 並讀寫指定試算表，也已啟用 Apps Script API。
- clasp push --force 成功上傳 2 檔；部署版本 1，deployment ID `AKfycbyfx04pox5fLuneoCZScY67Pe-5OM-Tj0pQtAe0eTDJ9g_H_moDY0p6nSshjVmvkey6`。
- /exec?action=ping 回傳 Google「存取遭拒／需要存取權」HTML，尚未得到 JSON。不應宣稱 GAS 已可用，也尚未將端點設為前端預設。
- 下一步使用者在 GAS 執行 setup，親自確認 Spreadsheet 授權；若仍失敗，檢查既有部署執行者與存取設定。保留既有 deployment，不重複建立。

## 2026-09-05 GitHub Pages 已發布，GAS 等待公開 API 確認

- GitHub `cona0815/word-war` 已推送 main，Pages 已 built，入口 https://cona0815.github.io/word-war/ 。本機分支 master，推送使用 HEAD:main。最新提交 71127c9。
- 僅上傳遊戲與素材、公開 GAS 範本；未上傳日誌、ZIP、QA 紀錄。首提交已在上傳前重建以移除私人試算表 ID；公开历史没有用户提供的 GAS/试算表 ID。
- 在真實 Pages 上執行 `tools/qa-shop-appearance.mjs https://cona0815.github.io/word-war` 全部通過，包含購買、reload 裝備、100 素材與方向契約。這是隔離瀏覽器本機存檔，不是 GAS 同步測試。
- Google clasp 已登入；`.clasp.json` 與 `.deploy-gas/` 已忽略。指定 GAS 專案已 clone，原始僅空白 myFunction。私人部署目錄準備好後端與 SPREADSHEET_ID；公開範本使用 Script Properties SPREADSHEET_ID 或 bound sheet。
- GAS push 被安全檢查拒絕，因 manifest 含 ANYONE_ANONYMOUS 與 spreadsheets scope。已向使用者明確詢問是否同意本測試 API 公開、以其帳號讀寫測試試算表；在收到肯定答覆前不得重試公開部署或繞過限制。目前 GAS 尚未 push/deploy。
- 後續：取得明確同意後 push/deploy，可能需使用者於 GAS 執行 setup 完成 Spreadsheet 授權；管理密鑰仍需私有設定，不在聊天或 GitHub 暴露。驗證真實 GAS 前不可宣稱雲端存檔完成。

## 2026-09-05 Boss 可見光波與人物出招回饋

- `boss-projectile.js` 新增 650ms 可見光波與主角命中光圈；`bossThreat` 將扣血延後至動畫實際抵達，使用 battleVisualGeneration 及 running/bossMode 阻止舊關卡傷害。各階段傷害仍為 10/14/18。
- 非六格素材的出招由原本 2-3px 小晃動改為 650ms 蓄力、前揮、收招，290ms 釋放攻擊。必須明確：98 種搭配仍是整張圖 transform 動畫，只有男女 Lv.1 星光為六格圖，不可稱全部人物逐格動作完成。
- 重跑九關正常速度，全部四波與三階段通關，結果在 `docs/qa-live-stages/`。Boss 九關三階段測試改為驗證發射前不扣血，等待實際光波 finished 後驗證扣血，27 項通過。
- 新增 `tools/qa-combat-motion.mjs`：100 出招序列與切關舊光波不扣血通過；截圖 `docs/qa-combat-motion/cast-and-bolt.png` 已檢視。開場 12 項、GM 測試、靜態 QA 102 項通過。
- 下一步仍需製作與驗收其餘角色武器的真正姿勢圖集，不用目前整圖變換測試替代美術驗收。

## 2026-09-05 GM 本機測試模式

- 封面新增 GM 測試入口，新分頁 `index.html?gm=1`，密碼 0088。`gm-mode.js` 提供九關、直接 Boss、階段 1-3、男女角色、Lv.1-10、全部武器與裝備道具、生命與大招補滿。
- GM 頁停用 save，清空 config/auth 並封鎖 gasGet/gasPost；不寫學生資料或排行榜。固定前端密碼只是測試入口，不是安全驗證。退出重新載入正常頁。
- `tools/qa-gm.mjs` 通過錯密碼阻擋、九 Boss、第三階段、女主 Lv.4 火武器、能量、一般關卡、localStorage 未變與無 pageerror。尚未增加獨立消耗品效果；本模式的道具選擇是既有裝備道具。

## 2026-09-05 完整關卡回歸與天梯重試

- 正常速度九關重跑全部通過：每關四波、Boss 三階段，無 pageerror，耗時約 64 至 202 秒。結果更新於 `docs/qa-live-stages/results.json`；包含最近的怪物介面避讓、腳底對齊與女主方向修正。第一關本次 76/76 題，HP 40，未跳過 Boss 反擊。
- 修正 `begin()` 未重設天梯送出按鈕：原本送出一次後下一局無法再送出。新增 `tools/qa-ladder-retry.mjs`，以兩次本機結算 fixture 驗證連續送出成功；非真實 GAS 驗收。
- 回歸：腳底 27/27、題庫 49/49、靜態遊戲 102/102、GAS 合約 27/27。本輪完整關卡於天梯按鈕修改前載入頁面，按鈕修改另由新測試驗證。
- 未完成範圍仍保留：全等級連續動作與視覺比例、消耗品實際使用、天梯五階段規格差異、真實 GAS 同步。不要以正常通關結果宣稱所有功能或美術完美。

## 2026-09-05 人物方向聚焦修復與操作回歸

- 人工檢視女主 Lv.4 星光原圖確認朝右；正式遊戲與人物預覽的 female Lv.4 source mirror 由 -1 改為 1。男主設定不變。商店測試新增女主 Lv.4 五武器朝右不得再翻轉的斷言。
- 本輪購買七項裝備、不重複扣款、reload 保留裝備及 100 組人物素材載入測試通過。大招與輸入七項測試、怪物安全區十二項測試通過。
- 尚不可宣称整個專案完成：全等級武器連續動作、美術大小、消耗品使用、天梯規格差異與真實 GAS 仍需後續驗收。本輪未生成新人物素材。

## 2026-09-05 怪物題目避免被介面遮住

- `enemy-safe-area.js` 於小怪 render 後量測資訊列、選單、操作面板及大招面板，將怪物與頭頂題目限制於中間安全帶；保留左右出怪位置，同步更新 enemy.y，讓命中位置一致。長題目換行並校正左右邊界；圖片載入及尺寸變更會重新量測。不影響 Boss 對齊。
- `tools/qa-enemy-safe-area.mjs` 第八關長句四角出怪乘三尺寸共 12 次通過，檢查怪物與題目不交疊介面、題目不出界；1366 截圖人工檢視通過，結果在 `docs/qa-enemy-safe-area/`。靜態 QA 102/102 通過。
- 本次為指定遮擋問題的聚焦回歸，未重跑九關完整流程；多怪題目互相重疊仍屬另一項驗收。

## 2026-09-05 Boss 與主角腳底對齊

- 新增 `battle-ground.js`：讀取待機格 alpha 計算腳底比例，以主角固定位置建立地面線，修正 Boss 中心座標與法術命中座標；ResizeObserver 處理視窗與角色尺寸變更。保留施法動作，不逐格追蹤跳躍。
- Boss 戰停用整合人物的待機上下漂浮，避免站姿基準線偏移；未改一般小怪戰與預覽頁。
- `tools/qa-battle-ground.mjs` 九關乘三尺寸共 27 項通過，待機腳底差小於 1px，無 pageerror；截圖與結果在 `docs/qa-battle-ground/`。`tools/qa-game.mjs` 102/102 通過。
- 入口 `index.html?cover=a&ground=20260905`。下一步仍是既有角色美術方向及動畫品質回歸，不代表全部美術缺陷已解決。

## 2026-09-05 三款封面與戰鬥更新交接

- 最新需求已完成三款可操作封面，入口 `index.html?cover=a`、`?cover=b`、`?cover=c`，背景在 `assets/covers/`，整合由 `cover-variants.js` 與 `cover-variants.css` 負責。未改無參數的預設封面，等待使用者選擇。
- `tools/qa-covers.mjs`：三版本各測 1920x1080、1366x768、390x844，九次版面與登入測試通過；截圖與結果在 `docs/qa-covers/`。
- 八套 Boss 已重新生成六格施法圖並透過 `boss-motion.js` 整合；取代下方舊交接所述「素材尚未重畫」狀態。資產在 `assets/generated/boss-cast-v1/`，建置工具為 `tools/build-boss-cast.py`。九關三階段共 27 次攻擊測試通過。
- `ultimate.js`、`ultimate.css` 加入累積能量、Ctrl+C 集氣、Ctrl+V 施放、Ctrl+Z 取消保留能量，三級生成特效在 `assets/generated/ultimate-v1/`。熱鍵題優先，大招不能跳過 Boss 必答階段；七項控制測試通過，見 `docs/qa-release-controls/`。
- `typing-input.js` 處理英文鍵盤注音與熱鍵題；修正重複送出已在攻擊中的目標與句尾標點干擾出怪方向。最後另補上 pending 怪物暫停碰撞與 QA 存檔隔離，這兩個最後修改尚需專門回歸。
- 正常時間九關自動測試均完成四波與三階段 Boss，實際耗時約 64 至 202 秒，不是每關固定三分鐘。紀錄在 `docs/qa-live-stages/`。此結果在最後 pending 碰撞修正之前。
- 商店購買、重載持有外觀及 100 組人物素材載入測試通過，見 `docs/qa-shop-appearance/`；但載入測試不等於美術驗收。矩陣人工檢視發現女主 Lv.4 疑似方向反轉，部分火系人物視覺比例較小，應先檢視原圖再修正，不能宣稱全部角色視覺通過。
- 仍待完成或確認：真實隔離 GAS 端點驗收、消耗品使用流程、天梯五階段與目前實作的差異、全等級武器連續動作品質。不得將本輪測試當成整個專案零缺陷證明。
- 下一步：使用者選定封面後套為預設；先針對女主 Lv.4 原圖方向及最後兩項保護修正做聚焦回歸。

## 2026-09-05 Boss 動畫實際檢查

- 直接檢視八套圖集，發現如沐／大橋攻擊格向右、如沐／童心攻擊裁切，以及多套大小跳動與殘線。完整清單見 `docs/boss-animation-review-20260905.md`，不可宣稱動畫全通過。
- 正式 bossThreat 九關實測發現 CSS 優先順序蓋掉攻擊動畫。`index.html` 新增 bossAttackCue 及結束清除 boss-strike；素材本身尚未重畫。
- 新增 `tools/qa-boss-animation.mjs`：九關三階段正式攻擊函式，檢查傷害、動畫與恢復；縮短等待而非三分鐘實時測試。結果在 `docs/qa-boss-animation/`。
- 驗證完成：實際登入後九關共 27 次攻擊、收招通過，無 pageerror；靜態檢查 102/102。素材視覺品質仍未通過。
- 下一個最安全任務：先重製如沐同方向、完整不裁切的連續姿勢，固定身體尺度與腳底，驗收後再逐套擴充。

## 2026-09-05 透明封面、人物等高與女主 Lv.1 六格施法

- 登入中央面板改為透明且不模糊背景，輸入框保留深色底、文字加陰影。封面人物有 4px 輕微浮動、Logo 有緩慢明暗光暈；遵守 reduced-motion。未更動登入認證。
- 封面原圖長寬比不同，contain 會讓男主在窄桌面變小。`tools/align-login-heroes.py` 保留原圖，輸出兩張 `assets/login-hero-*-aligned-v1.png`：1100x1600 透明畫布、人物高度 1480、腳底 y=1540，保持各自比例而非拉伸。
- 使用內建 image_gen 依既有女主 Lv.1 服裝與水晶法杖生成六格施法，資產、原圖、提示詞、去背與對齊資訊在 `assets/generated/hero-female-cast-lv1-v1/`。`prepare-female-cast-grid.py` 沿留白分割避免切腳；`build-lv1-cast.py --character female` 共用固定畫布、腳底與縮放，清除洋紅邊緣，待機與復位格鏡射成相同方向。
- `index.html` 女主 Lv.1／星光法杖接入 600ms 六格施法與 252ms 前推發射；預載、快速輸入不重啟、左右攻擊、結束取消延用男主已驗證流程。沒有用第二張武器圖疊在人物身上。
- 驗證：`qa-login-layout.mjs` 九種尺寸通過，新增實際 alpha 顯示高度差 <1px、腳底差在浮動 5px 內、透明背景、動畫與低動態停用檢查；女主 `qa-lv1-cast.mjs ... female` 5/5、`qa-opening-cast.mjs` 12/12、靜態 `qa-game.mjs` 102/102。已看過 1920、1366、390 寬封面及女主遊戲前推格。截圖在 `docs/qa-login-layout/` 與 `docs/qa-female-lv1-cast/`。
- 限制：真正六格動作僅涵蓋男女 Lv.1 星光法杖；其他等級／武器與預覽頁動作未在本次完成，也未重跑全關或線上 GAS。
- 下一個最安全任務：先驗收男女 Lv.1 星光法杖的實際手感，再按等級／武器逐套補齊匹配服裝的動作，不批量套用 Lv.1 素材。

## 2026-09-05 男主 Lv.1 星光法杖六格施法

- 使用內建 image_gen，以現有男主 Lv.1 星光法杖為角色／服裝／武器參考，生成 2 欄 3 列連續施法。原圖、提示詞、去背結果與版本化成品在 `assets/generated/hero-cast-lv1-v1/`，未覆蓋既有角色資產。
- 以 generate2dsprite 技能處理去背與切格；`tools/build-lv1-cast.py` 依腳底中心對齊，固定縮放 1.24、896x648 畫布、腳底 y=610，整理六格為單張 strip，避免播放中換檔載入。未重新繪製其他性別、等級或武器。
- `index.html` 僅男主 Lv.1 星光法杖啟用新 strip：準備／後拉／抬杖／前推／收招／復位，600ms 播放、252ms 前推格才發射光彈。待機使用同套第一格，避免瞬間換服裝與大小；左右以真正人物座標判定並鏡射整套動畫。
- 其他組合保留上一版短動作回饋；未宣稱所有角色都已有逐格施法。素材載入失敗仍有完整人物保底；新版未動登入布局。
- 驗證：去背處理六格無碰邊；`qa-lv1-cast.mjs` 5 組檢查通過，涵蓋正常按鍵結算、左右共 12 張不同姿勢截圖、固定畫布、手機與 Lv.2 不誤套；`qa-opening-cast.mjs` 12/12、靜態 `qa-game.mjs` 102/102。新版截圖在 `docs/qa-lv1-cast/`，已看過遊戲前推格與向左攻擊格。
- 下一個最安全任務：使用相同品質門檻，製作女主 Lv.1 星光法杖連續動作，再按等級／武器逐套擴充；切勿套用同一套服裝到全部角色。

## 2026-09-05 登入頁人物遮擋修正

- `index.html` 僅調整登入區 CSS：改為左右人物與中央 520px 表單的獨立三欄，完整 contain 圖片、不再負值定位裁腳；縮小 Logo、隱藏重複標題與重複的底部說明／排行按鈕，原頁籤仍可使用。
- 760px 以下人物改放表單上方，登入區可捲動；低高度桌面縮小 Logo 與上下留白。登入區專用規則不改戰鬥布局與邏輯。
- 新增 `tools/qa-login-layout.mjs`，9 種尺寸 1920x1080 至 320x568 全數通過：人物載入、邊界不裁切、不重疊、控制項不溢出、三頁籤、性別切換及登入；桌面包含 1280x480 的開始按鈕無需捲動。截圖與結果在 `docs/qa-login-layout/`。
- 已人工檢視桌面及手機截圖；遊戲靜態檢查 102/102。未改認證功能，未驗證實際 GAS 服務；極小手機允許捲動，不保證所有內容一屏塞滿。
- 下一個最安全任務：回到 Lv.1 對應服裝／武器的連續施法素材製作與驗收。

## 2026-09-05 開場施法穩定性修正

- 僅處理開場人物破圖與播放流程，不實作必殺能量。確認舊 `hero-motion` 男主攻擊 PNG 武器被截斷，且待機／蓄力為皇冠服裝，原本會套用於所有星光法杖等級。
- `index.html` 停用未驗收的通用四張圖，保留當前整合人物 PNG，以 360ms 短動作提供回饋；重複觸發不重啟進行中的動畫，移除強制 layout 與重複施法包裝。
- 開戰前預載並 decode 當前人物與 FX；人物失敗阻止開戰並可重試，FX 失敗使用 CSS 光彈；換關／結束以世代識別取消舊攻擊效果與結算。
- 驗證：`node tools/qa-game.mjs` 102/102；`node tools/qa-opening-cast.mjs` 正常速度無頭 Chrome 12/12，包括男女首次實際按鍵、快速動作觸發、切關、延遲／失敗載入與低動態模式。新腳本可用 `PLAYWRIGHT_MODULE` 指定 Playwright，預設使用此機器套件與已安裝 Chrome。
- 截圖與測試清單：`docs/qa-opening-cast/`。已看過男女首次攻擊截圖，人物與武器無舊動作裁切；未宣稱逐格動作完成，亦未重跑全關或正式 GAS。
- 下一個最安全任務：以 Lv.1 星光法杖製作並驗收一致人物的真正連續姿勢，再擴充其他等級／武器；不能恢復套用舊皇冠動作圖。

## 2026-09-05 必殺能量提案（設計階段）

- 新增 `docs/ultimate-skill-plan.md`：答對蓄能至 100、手動預約下一擊或滿格自動施放、武器與等級演出、Boss 保護及驗收。
- 只完成規劃，未改程式或生成素材；能量值與效果時間均為待試玩的起始數值。
- 舊 Combo 改為小型連擊強化的構想尚未實作；大招不得代答未完成題目或跳過 Boss 必答數。
- 下一個最安全任務：先建立題次唯一結算及蓄能狀態測試，再接入實戰，不先批量生成全套圖片。

## 2026-09-05 規格書 v2.0（文件核對）

- 更新 `docs/project-spec.md`，區分產品要求、目前實作、待完成與驗收證據；涵蓋八景四波、Boss、輸入、角色裝備、經濟、GAS、教師題庫及天梯。
- 本次僅修改文件，未改遊戲程式，也未重新執行遊戲或線上 GAS 測試；歷史測試數字不能視為全部需求驗收完成。
- 已記錄主要缺口：真實注音鍵位／Ctrl 輸入、Boss 階段題池、消耗品使用、斷線結算、全等級武器連續動作，以及真正逐層天梯與五階段最終 Boss。
- 先前方向與比例修正仍須逐圖逐幀確認；同尺寸透明畫布不等於身體大小一致。歷史紀錄中的完成敘述以新版規格第 14 節的限定範圍為準。
- 文件檢查：核對既有前端與 GAS 常數、確認十五節與 QA-01 至 QA-12，檢查 Markdown 結構。
- 下一個最安全任務：依 QA-03 建立真實輸入回歸案例，再補齊注音鍵位與 Ctrl 任務，不改八景教學順序。

## 2026-08-24 Hero direction and scale consistency pass

- 建立 `assets/generated/hero-weapons-normalized-v2/` 作為人物預覽與正式遊戲共用的整合人物素材來源：男／女各 Lv.1-Lv.10、5 種武器，共 100 張 PNG。
- 所有新版素材統一為 `768x648` 透明畫布，人物腳底基準線固定在 `y=610`，透明邊界與顯示比例已用報告檢查；人物不再用第二個武器圖層疊加。
- `index.html` 與 `hero-preview.html` 已切換到 `normalized-v2`，人物卡片、主遊戲人物、Boss 強化預覽都使用相同比例與 `center bottom` 基準。
- 修正人物面向判定：依目標所在位置決定 `--hero-face`，不再把攻擊方向左右判反；預覽頁維持同一面向規則。
- 修正 Boss 強化預覽的人物畫布變形：整合人物圖原本被固定窄框拉成錯誤比例，現在依 `768:648` 顯示。
- 舊素材中男主 Lv.7 與女主 Lv.6 的來源圖性別曾經串錯，現以同性別相鄰等級素材作保守替代，避免正式介面出現性別錯誤；要做出完全獨立的 Lv.7／Lv.6 外觀，仍需補上正確的新圖。
- 已完成：PNG 尺寸與 alpha 基準檢查、HTML 以新版素材路徑回應檢查。瀏覽器互動截圖仍需在可用的本機瀏覽器執行環境再做一次人工確認。

## 2026-08-08 World Inspiration Set

- 建立完整 30 張 ImageGen 世界觀靈感圖，集中放在 `assets/inspiration/`。
- 已新增可直接瀏覽的圖庫：`inspiration-gallery.html`。
- 已新增美術規範：`docs/inspiration-art-bible.md`。
- 30 張涵蓋：世界觀錨點、魔法學院入口、中央競技場、DCPS 八景、大橋堂內外、男女主角 Lv.1-Lv.10、武器、小怪三族群、八關 Boss、角色施法命中四段，以及單人大橋堂天梯。
- 目前生成圖是視覺方向參考，不直接取代正式透明 sprite。下一步要依規範製作正式角色、武器、Boss、特效與動畫 manifest，並逐張做透明度、畫布、基準線、面向與碰撞盒驗證。
- 持續目標：讓遊戲的地圖、角色成長、裝備、怪物、Boss 與特效都遵守同一套藍金青綠水晶魔法學院世界觀，並在每次替換素材後重新做瀏覽器流程驗證。

## Goal

Build a classroom-ready single-player RPG typing game for DCPS elementary IT class. The core loop is fixed: eight campus landmark stages teach keyboard skills, students collect eight gems, then unlock Da-Qiao Hall as a combined ladder challenge.

## Current Phase

Development and QA hardening. The playable educational flow is in place; the remaining work is classroom-device validation, GAS deployment validation, and deliberate art replacement where a unique redraw is still required.

## Latest QA Audit

- 2026-08-26 完成第 1～9 關全流程自動驗收，結果為 106/106 passed。
- 詳細產品、內容、輸入、資料、資產與驗收規格：`docs/project-spec.md`。
- 歷史流程 QA 與風險清單仍保留於 `docs/qa-flow-audit-20260712.md`，其中 2026-07-12 的待辦不可視為目前狀態。

## Completed Most Recently

### 2026-07-13 Hero progression, gear, and weapon loadouts

- Added four player gear items with level unlocks: Focus Crystal Lv.1, Guardian Cape Lv.4, Combo Necklace Lv.7, and Hero Crown Lv.10.
- Formal game menu now shows locked/unlocked weapon and gear buttons. Locked equipment cannot be selected before its level.
- Equipped weapon is rendered as a separate transparent PNG layer over the hero and follows the hero facing direction.
- Weapon choice changes the attack FX family; gear changes score bonus, collision damage reduction, Combo threshold, or Boss counter damage.
- Hero preview keeps all weapons available for teacher inspection, while clearly labeling the formal-game unlock level.
- Verified both inline JavaScript bundles with `node --check`; browser screenshot QA remains pending because the local Playwright Chromium executable is unavailable.

- Added a hero/weapon asset development pass using the installed Game Studio and 2D Sprite skills:
  - Added `assets/generated/equipment/weapon-manifest.json` as the source-of-truth for weapon unlock levels, filenames, Combo FX paths, and intended visual roles.
  - Added `docs/hero-weapon-asset-spec.md` with Image 2.0 prompt guidance for leveled hero atlases, isolated weapon PNGs, and separate Combo FX sheets.
  - Updated `hero-preview.html` so teachers can preview Lv.1-Lv.10 hero clothing tiers, weapon unlock levels, current equipment PNG paths, and the formal asset prompt document.
  - Rejected another built-in image generation attempt because it drifted into an infographic-style diagram rather than usable game sprites; no bad generated art was inserted.
- Re-aligned `index.html` level data to the final `AGENTS.md` education plan instead of the earlier prototype order:
  - Lv.1 八德亭: English single-letter keyboard positions.
  - Lv.2 三達德亭: 2-4 letter English words.
  - Lv.3 五倫園: single Zhuyin symbols.
  - Lv.4 如沐園: Zhuyin combinations, tones, and punctuation.
  - Lv.5 成長學園: single Chinese characters.
  - Lv.6 羔羊跪乳: Chinese words and basic hotkeys.
  - Lv.7 童心園: English sentences from teacher bank when available.
  - Lv.8 四維堂: Chinese sentences from teacher bank when available.
  - Lv.9 大橋堂: locked mixed ladder dungeon after eight gems.
- Added explicit four-wave `waveSets` and Boss `bossWords` pools for each stage so the game can present a stable instructional sequence instead of one random mixed pool.
- Updated practice generation to build waves from each stage's `waveSets`, while still using GAS question banks for Lv.7 and Lv.8 when available.
- Added keyboard-position routing for multi-character Zhuyin prompts, punctuation, tones, hotkeys, and more common Chinese prompt initials.
- Fixed a spawn-position offset bug where non-fixed keyboard lanes could receive an array instead of a numeric offset, improving minion placement and reducing lane jitter.
- Updated minion asset selection so English words use their first letter monster, and Zhuyin/Chinese prompts use a Zhuyin-family monster based on the first typed symbol or first Chinese character's initial.
- Applied the new Game Studio workflow manually and aligned work to `AGENTS.md`.
- Kept levels 1-8 as single-player main story stages and Da-Qiao Hall as the locked ladder dungeon.
- Added keyboard-relative monster placement for letters, digits, directions, and Zhuyin.
- Added local gem progress tracking for levels 1-8.
- Added Da-Qiao Hall lock until all eight gems are collected.
- Added GAS settings UI in the hidden menu.
- Added GAS ping, local record sync, and teacher question add hooks matching `gas_code.gs`.
- Added richer record payloads compatible with the GAS `Records` sheet.
- Added remote question loading: level 7 uses GAS English questions, level 8 uses GAS Chinese questions, and Da-Qiao Hall mixes them when available.
- Added teacher-facing bulk question import/export controls in the Settings menu.
- Bulk format is one question per line, optionally `prompt|difficulty|topic`; selected mode controls English or Chinese bank.
- Added teacher-facing student progress summary in the Settings menu.
- Added local record export as TSV for quick classroom review.
- Added GAS `students` endpoint guarded by admin token to summarize best stage, gems, best score, accuracy, completed items, and plays.
- Changed normal stage flow from one short wave to four practice waves before the Boss.
- Normal stages now generate a larger practice set intended to last about three minutes, with shorter counts for sentence stages.
- Improved minion spawn positioning so letters, digits, directions, Zhuyin, and common Chinese prompt initials map to keyboard-relative screen zones.
- Changed normal minions to spawn from the outer field and move inward more slowly, while keeping their keyboard-relative direction.
- Removed forced nearest-target ordering from normal minions. Students can now type any visible minion's label, and the matching minion is attacked.
- Removed the lower-left normal-stage target word/order display; only Boss stages show a fixed target prompt there.
- Added direct auto-attack for single English letters and single Zhuyin symbols. Letter keys are handled on `keydown`; single Zhuyin symbols are handled from the input box after IME/input composition appears. Longer words, sentences, and hotkey prompts still use Enter or the Attack button.
- Added player weapon-driven attack effects. The Avatar menu now lets the teacher/player choose 星光法杖、冰晶法核、烈焰戰輪、雷鳴星槍、或暗影魔晶. Normal attacks change color, trail, impact size, and timing by weapon and player level.
- Added Combo ultimate attacks. When the current combo reaches the equipped weapon's threshold, the game shows a combo callout, hero magic ring, larger projectile trails, a larger impact burst, bonus score, and extra Boss damage. The ultimate remains single-target so students still practice each prompt instead of skipping learning.
- Attempted built-in image generation for spell FX sheets, but the outputs drifted into infographic/text layouts and were not inserted into the game. The current effect system is code-ready for replacing CSS effects with true Image 2.0 sprite sheets later.
- Added real transparent PNG sprite-sheet effect assets for player Combo ultimate attacks. Each file is a 2x2 sheet played by `spriteShot()` in `index.html`:
  - `assets/generated/effects/player-fx-starlight.png`
  - `assets/generated/effects/player-fx-ice.png`
  - `assets/generated/effects/player-fx-fire.png`
  - `assets/generated/effects/player-fx-thunder.png`
  - `assets/generated/effects/player-fx-shadow.png`
- Added `assets/generated/effects/player-fx-contact-sheet.png` for quick visual review. If the teacher later generates higher-quality external Image 2.0 sheets, replacing the same filenames will update the game without code changes.
- Fixed digit minion placement to follow the numeric keypad layout: `7/8/9` upper row, `4/5/6` middle row, `1/2/3` lower row, and `0` lower-center/left. This matches the classroom keypad diagram instead of the top keyboard number row.
- Fixed hero attack facing. The current hero atlases are natively left-facing during cast frames, so attacks keep `scaleX(1)` for left-side targets and flip to `scaleX(-1)` for right-side targets.
- Added stronger per-key spawn staggering for normal minions. If several minions share the same keyboard position, later ones wait about 2.4 seconds and also stay hidden until the previous same-lane minion has moved far enough or is defeated, preventing visual stacking while preserving keyboard-location teaching.
- Updated Boss battle staging. Normal stages still keep the hero centered, but Boss mode moves the hero left and the Boss right on the same battle line, faces the hero toward the Boss immediately, shows the active attack command above the Boss, and fires projectiles from the hero's current position instead of a hard-coded center point.
- Added a Settings/admin Boss enhancement preview panel. Teachers can choose any Boss, switch enhancement level 1-3, and preview weapon-style effects (ice, fire, thunder, shadow) with visible charge/attack timing and projectile impact. Boss HP was also raised from the earlier very-short values to make Boss fights feel more like stage finales.
- Rechecked Boss facing at the source-atlas level, not only CSS. Lv.4, Lv.7, and Lv.8/Lv.9 had inconsistent facing across action frames, so simply flipping or unflipping CSS could not solve it.
- Added facing-locked replacement atlases for those inconsistent Bosses:
  - `assets/generated/boss-safe-atlas-20260612-v3/boss-atlas-04-rumu-facing-locked-20260620.png`
  - `assets/generated/boss-safe-atlas-20260612-v3/boss-atlas-07-childheart-facing-locked-20260620.png`
  - `assets/generated/boss-safe-atlas-20260612-v3/boss-atlas-08-daqiao-facing-locked-20260620.png`
- Updated levels 4, 7, 8, and 9 in `index.html` to use those facing-locked atlases in both formal Boss battles and the admin Boss enhancement preview. Lv.9 shares the Da-Qiao atlas with Lv.8.
- Added `assets/generated/boss-facing-audit-after-20260620.png` as a visual audit sheet showing all Boss frames after the facing fix.

## Key Files

- `index.html`: main playable web game.
- `gas_code.gs`: Google Apps Script backend for records, leaderboard, and question bank.
- `gas_code.gs`: also exposes admin-only student progress summaries via `action=students`.
- `AGENTS.md`: project design contract and educational constraints.
- `assets/generated/`: battle backgrounds, monsters, bosses, and generated game art.

## Verification

Run after changes:

```powershell
$html = Get-Content -Raw -Path index.html
$m = [regex]::Match($html, '<script>([\s\S]*)</script>')
$tmp = Join-Path $env:TEMP 'word-war-script-check.js'
Set-Content -LiteralPath $tmp -Value $m.Groups[1].Value -Encoding UTF8
node --check $tmp
Invoke-WebRequest -UseBasicParsing 'http://127.0.0.1:8767/index.html' -TimeoutSec 5
```

For GAS syntax, copy `gas_code.gs` to a temporary `.js` file and run `node --check` on that temp file because Node does not recognize `.gs` directly.

## Known Risks

- Final art is still replaceable and inconsistent in some assets.
- GAS requires the teacher to deploy `gas_code.gs` as a Web App and paste the URL into the Settings tab.
- The admin question bank can add single questions, bulk-add pasted lines, load GAS questions, and export loaded questions as TSV.
- Student progress summary depends on uploaded records; local summary only sees this browser's local records.
- The UI is functional but not final-polished for all screen sizes.
- Chinese prompt keyboard placement uses a built-in common-character initial map; larger Chinese question banks may need more character mappings later.
- Boss battle layout now has explicit `heroBoss` and `bossPos` constants in `index.html`; use those instead of one-off CSS or hard-coded projectile coordinates when tuning distance.
- Boss preview is currently a CSS/effect prototype using existing Boss atlases. Lv.4, Lv.7, and Lv.8/Lv.9 are using facing-locked atlases because their source action frames had mixed directions. If new AI sprite sheets are generated later, verify all action frames face the hero before replacing these files.

## 2026-06-28 Polish Pass

- Re-confirmed the project contract from `AGENTS.md`: stages 1-8 are the single-player main story, and Da-Qiao Hall is a separate final ladder/challenge unlocked after eight gems.
- Updated the stage display helpers in `index.html` so main stages show `第 N / 8 關`, while Da-Qiao Hall shows `大橋堂天梯` instead of looking like a normal ninth stage.
- Updated the level menu label for Da-Qiao Hall to `天梯 大橋堂`, keeping it visually separate from the eight DCPS scenic stages.
- Localized the login guide text back to Traditional Chinese and clarified the classroom input rule: single letters and single Zhuyin auto-attack; longer words, phrases, and sentences use Enter.
- Boss atlases are source-authored facing left. Formal battles and the admin preview use the shared `bossFace()` rule returning `1`; legacy per-level direction overrides are intentionally ignored so the sprites are not flipped a second time.
- Updated completion text: stages 1-8 report gem progress, while Da-Qiao Hall reports ladder completion and saved ladder record.
- After clearing stage 8, the mission button now says `前往大橋堂` instead of the generic `下一關`.
- Verified `index.html` script syntax with `node --check`.
- Verified the local preview server responded at `http://127.0.0.1:8767/index.html`.

## 2026-06-28 Spawn Spacing Pass

- Fixed normal minion spawn scheduling so enemies now queue by keyboard region, not only by exact same prompt. For example, A/S/D/F are treated as the same left-middle keyboard lane and appear with a delay instead of stacking.
- Enlarged initial spawn offsets for repeated or nearby lane enemies while preserving keyboard-relative teaching positions.
- Increased same-lane spawn delay to about 3 seconds for basic practice enemies and about 3.4 seconds for sentence/final enemies.
- Added an active-enemy spacing guard so a later minion stays hidden briefly if an earlier same-lane or very close minion is still occupying nearly the same screen space.
- Verified `index.html` script syntax with `node --check`.
- Verified the local preview server responded at `http://127.0.0.1:8767/index.html?spawn-spacing-check=1`.

## 2026-06-28 Zhuyin Tone Pass

- Updated stage 4 from combined Zhuyin prompts to single Zhuyin prompts with optional tone marks. Prompts like `ㄉ一`, `ㄅㄚ`, and `ㄓㄨ` should no longer appear in stage 4 minion waves.
- Stage 4 now teaches tone marks on single symbols: first tone has no mark, second tone uses `ˊ`, third tone uses `ˇ`, fourth tone uses `ˋ`, and neutral tone uses `˙`.
- Added `promptHTML()` rendering so a single Zhuyin plus tone mark displays with the tone visually raised at the upper-right of the symbol.
- Updated quick auto-submit to accept either a single letter or a single Zhuyin with an optional tone mark. Longer words, phrases, and sentences still require the normal submit flow.
- Replaced the Da-Qiao mixed challenge's old combined Zhuyin example `ㄅㄚ` with the single-Zhuyin tone item `ㄅˊ`.
- Verified `index.html` script syntax with `node --check`.
- Verified the local preview server responded at `http://127.0.0.1:8767/index.html?zhuyin-tone=1`.

## 2026-06-28 Minion Variety Pass

- Added `minionPools` in `index.html` so non-symbol-specific stages can use several distinct minion species instead of looking like simple color swaps.
- Kept stage 1 letter monsters and stage 3/4 Zhuyin monsters symbol-specific for teaching clarity, but changed English words, Chinese characters, phrases, sentences, and Da-Qiao mixed prompts to choose from varied creature pools by prompt hash.
- Hotkey monsters still use the downward enemy so Ctrl/operation tasks remain visually tied to the lower keyboard area.
- Verified every file referenced by the new minion pools exists under `assets/generated`.
- Verified `index.html` script syntax with `node --check`.
- Verified the local preview server responded at `http://127.0.0.1:8767/index.html?minion-variety=1`.

## 2026-06-28 Background Landmark Framing Pass

- Changed `.stage-bg` in `index.html` to use per-level CSS variables for background size, position, and scale instead of forcing every map through `cover` plus a 1% zoom.
- Removed the global `scale(1.01)` crop so safe-stage backgrounds do not lose extra pixels around important landmarks.
- Added `bgSize:"auto 100%"` and `bgPos:"center center"` to stage 4 `如沐園`, preserving the crane fountain landmark vertically on wide screens.
- Verified `index.html` script syntax with `node --check`.
- Verified the local preview server responded at `http://127.0.0.1:8767/index.html?bg-landmark-safe=1`.

## 2026-06-28 Prompt Label Horizontal Pass

- Changed enemy prompt labels in `index.html` to use `width:max-content`, `white-space:nowrap`, and explicit horizontal writing mode so short prompts no longer collapse into vertical-looking stacks inside the small enemy container.
- Added `.tag.long` and `tagClass()` so long words/sentences use a smaller horizontal label instead of being squeezed into unreadable columns.
- Verified `index.html` script syntax with `node --check`.
- Verified the local preview server responded at `http://127.0.0.1:8767/index.html?prompt-horizontal=1`.

## 2026-06-29 Zhuyin Minion Variety Pass

- Added separate `zhuyin` and `phonics` minion pools in `index.html` so stages 3 and 4 no longer look like the same minion repeated with only color changes.
- Kept keyboard-relative spawn positions unchanged; only the visual monster species selection changed.
- Verified every newly referenced pooled minion image exists under `assets/generated`.
- Verified `index.html` script syntax with `node --check`.
- Verified the local preview server responded at `http://127.0.0.1:8767/index.html?minion-variety-zhuyin=1`.

## 2026-06-30 Small Bugfix Pass

- Hardened keyboard handling in `index.html` so global game shortcuts no longer fire while the hidden menu/admin panel is open or while the teacher is typing in form fields.
- Added IME composition guards for the answer input. Chinese input and Zhuyin composition should no longer be submitted before the input method finishes composing the character or symbol.
- Updated normal minion images with empty alt text and disabled dragging to avoid accidental browser drag ghosts during classroom play.
- Updated the Boss enhancement preview command label to use the same `promptHTML()` rendering as battle prompts, so single Zhuyin plus tone marks display consistently.
- Verified `index.html` script syntax with `node --check`.
- Restarted the local preview server and verified `http://127.0.0.1:8767/index.html?bugfix=1` returned HTTP 200.
- Verified current Boss atlas and Combo sprite effect references all resolve to existing files.

## 2026-07-01 Hero Upgrade Preview Pass

- Added `hero-preview.html` as a standalone teacher-facing preview page for the current male and female hero upgrade atlases.
- The page previews Lv.1-Lv.10, idle/casting motion, facing direction, weapon glow color, and the current Combo effect contact sheet.
- Verified all referenced `hero-male-lv1` through `hero-male-lv10` and `hero-female-lv1` through `hero-female-lv10` atlas files exist under `assets/generated`.
- Verified the preview page script with `node --check`.
- Restarted the local preview server and verified `http://127.0.0.1:8767/hero-preview.html` returned HTTP 200.

## 2026-07-01 Hero Gear Preview Pass

- Extended `hero-preview.html` so the weapon selector now changes both attack color and visible equipment layers on the character preview.
- Added preview equipment styles for starlight staff, ice core, fire wheel, thunder spear, and shadow crystal, plus short teacher-facing descriptions for each.
- Kept the equipment layer CSS-based for now so it can later be swapped with Image 2.0 PNG assets without changing the preview flow.
- Verified the preview page script with `node --check`.
- Verified `http://127.0.0.1:8767/hero-preview.html?gear=1` returned HTTP 200.

## 2026-07-01 Weapon PNG Asset Pass

- Tried the built-in Image 2.0 generation path for formal weapon PNG sprites, but the outputs drifted into unusable infographic-style images, so they were not committed into the game.
- Added a local PNG asset generation script at `tools/generate_weapon_pngs.ps1` and generated five transparent 512x512 equipment PNGs under `assets/generated/equipment`.
- Added `weapon-starlight-staff.png`, `weapon-ice-core.png`, `weapon-fire-wheel.png`, `weapon-thunder-spear.png`, and `weapon-shadow-crystal.png`.
- Updated `hero-preview.html` so weapon previews now read the generated PNG files instead of relying only on CSS-drawn placeholders.
- Added `assets/generated/equipment/weapon-preview-sheet.png` for quick visual review.
- Verified all weapon PNGs are 512x512 `Format32bppArgb`.
- Verified the preview page script with `node --check`.
- Verified `http://127.0.0.1:8767/hero-preview.html?gear=png` returned HTTP 200.

## Next Safest Task

Polish HUD spacing and continue replacing temporary minion/boss assets in batches. Then add a teacher view for student progress summaries.

## 2026-07-13 Keyboard-Position Spawn Pass

- Updated normal wave spawning in `index.html` so each enemy records its keyboard lane and spawn slot.
- Increased the lateral spread for repeated enemies in the same keyboard lane, while keeping the prompt's original keyboard-relative direction.
- Kept the lane visibility guard so a later enemy remains hidden until the earlier same-lane enemy has moved away or is defeated; this prevents sprites and labels from stacking.
- Increased same-lane spacing delay to 2.8 seconds for basic stages and 3.6 seconds for sentence/final stages.
- Reduced the inward movement step so minions approach gradually from the outer field and leave time for elementary students to identify and type the prompt.
- Preserved free target selection: typing any visible minion label attacks the matching visible enemy; no forced lower-left target order is restored.
- Verified `index.html` with `node --check` and confirmed `http://127.0.0.1:8767/index.html` returns HTTP 200.

## Current Verification Notes

- Browser smoke test reached the first-stage mission prompt and started wave 1 successfully.
- The first visible letter monster spawned on the left side, matching the A/S/D/F keyboard region, while the hero remained centered.
- The preview server was restarted on port 8767.
- Remaining QA risk: full three-minute timing and all eight stage layouts still need a longer classroom-style run; the next useful test is to sample digit, Zhuyin, Chinese-initial, and hotkey lanes in stages 2-6.

## 2026-07-13 Boss Difficulty Pass

- Boss 基礎血量目前由 `bossMaxHp()` 統一計算為 `52 + 關卡編號 * 8 + (角色等級 - 1) * 3`，管理者 Boss 預覽同步顯示強化後血量，避免 Boss 比小怪脆弱。
- Boss 新增三階段判定：血量低於 67% 進入第 2 階段，低於 34% 進入第 3 階段。
- Boss 會在開戰 9 秒後開始反擊；第 2 階段間隔縮短至 7.5 秒，第 3 階段縮短至 6 秒，反擊傷害依階段為 7、10、13 點。
- Boss 反擊時顯示「Boss 攻擊！」警示、清除連擊，並產生短暫攻擊閃光，讓學生理解危險節奏。
- Boss 仍維持待機 -> 集氣 -> 攻擊的動畫順序；學生輸入正確題目後才會扣 Boss 血量。
- `node --check` 通過，預覽服務回應 HTTP 200；Boss 管理者預覽頁可正常載入。
## 2026-07-13 Boss Direction Fix

- Formal Boss battles and the admin Boss preview both use the single `bossFace()` rule.
- The current Boss atlases are authored facing left, so `bossFace()` returns `1` and preserves the source direction toward the hero.
- Legacy per-level `bossFace` values in `levels` are intentionally ignored. Do not apply another CSS flip to these atlases.
- The final direction guard is explicit: `.boss-sprite` and `.boss-lab-sprite` use `transform:scaleX(var(--boss-face,1))!important`, while `BOSS_FACE_BY_STAGE` is `1` for all stages because the safe atlases are already authored facing left toward the hero. A runtime cache-buster reloads the atlas URL so an old mirrored image cannot remain in the browser cache.
- Verified with JavaScript syntax check, HTTP 200 loading, and a first-stage browser smoke test.

## 2026-08-24 Final Integration Pass

- Cleaned the authoritative `levels` data so stages 4, 7, 8, and 9 directly reference the safe-v3 Boss atlases instead of legacy `facing-locked` files. Each entry now explicitly uses `bossFace:1`; the defensive `SAFE_BOSS_ATLAS` mapping remains as a second guard.
- Stage 4 remains single Zhuyin plus tone/punctuation practice. No two-symbol Zhuyin combinations were added.
- Re-checked the main game flow: login -> stage mission -> wave 1, direct single-key attack, gradual outer spawn, and same-lane spacing all work on port 8767.
- Re-checked the fitting-room source of truth: integrated normalized character-and-weapon PNGs are used for all male/female levels and selected weapons; the legacy weapon overlay is hidden to prevent double rendering.
- Current art limitation is documented: true four-frame hero casting is available for the starlight set; other weapons use complete integrated character PNGs with runtime motion/FX fallback until weapon-specific motion sheets are generated.
- Boss preview now uses only the final three-phase loop: `F1 idle -> F2 charge x3 -> F3 attack`; the old F4/recover preview control was removed so a non-attacking frame cannot be mistaken for another attack.
- Verified the current asset contract: 100 integrated hero-and-weapon PNGs use the shared `768x648` canvas, and the eight starlight motion PNGs remain separate for true frame playback.
- Verified: `node --check` for both HTML script payloads, HTTP 200 for `index.html`, `hero-preview.html`, and `boss-preview.html`, and browser smoke tests for the first stage and direct single-key attack.

## 2026-07-13 Image 2.0 Attack FX Integration

- Activated the existing Image 2.0 weapon effect sheets for normal attacks, not only Combo attacks.
- The 2x2 effect sequence is now used as: compact charge/orb -> energized orb -> travel beam -> hit explosion.
- Normal attacks use a slower 0.62 second travel time and Combo attacks use a stronger 1.08 second travel time.
- Removed the extra delayed CSS projectile copies that caused Combo attacks to look like duplicated shots.
- If a weapon has no sprite asset, the original CSS projectile and impact remain as a fallback.
- Verified all five `player-fx-*.png` files exist and are 1024x1024.
- Verified every inline script with `node --check`.

## 2026-07-14 Hero Continuous Motion and Transparent Asset Cleanup

- Added a cleaned replacement set for all 100 integrated hero-and-weapon PNGs under `assets/generated/hero-weapons-clean/`. The original files remain untouched.
- Cleanup removes only boundary-connected checkerboard pixels, preserving interior white costume pixels and the weapon artwork.
- Updated `index.html` and `hero-preview.html` to load the cleaned integrated assets, preventing checkerboard backgrounds from appearing in the game or fitting room.
- Kept the integrated weapon images as the source of truth, so changing a weapon changes the complete character image instead of stacking an old weapon layer over a new one.
- Improved continuous hero motion: idle now has a gentle breathing/weight-shift loop; casting now has a clear wind-up, lift, release, and settle sequence. The game plays one cast sequence per attack, while the preview loops it for inspection.
- Verified 100 cleaned hero assets exist, visually checked male/female and high-level samples, and confirmed the preview server returns HTTP 200 on port 8768.
- Fixed the hero preview `setHero()` metadata template so changing level, gender, or weapon does not break the preview script; both page scripts now pass `node --check`.
- Fixed the preview stacking/cropping bug: integrated hero-and-weapon PNGs now hide the legacy gear layer, while the 10 level cards use `contain` for single PNGs and retain atlas cropping only for fallback atlases.
- Added a dedicated integrated idle loop in the fitting room so the selected full-character weapon variant still has continuous motion.

### Remaining Art Note

- The integrated weapon variants are single full-character PNGs with CSS motion. The project also contains 4x4 action atlases for the base hero, but those atlases use the original staff/sword/book poses and cannot be substituted during a different weapon selection without reintroducing a weapon mismatch. A future art pass can generate matching 2x2 or 2x3 action sheets per weapon family and level.

## 2026-07-15 Hero Cast Frame Playback

- Added transparent 512x512 hero motion frames under `assets/generated/hero-motion/` for male/female starlight casting: `idle`, `charge`, `attack`, and `recover`.
- Formal battle now starts one real frame sequence per attack: `idle -> charge -> attack -> recover`; the attack frame is the only frame intended to show the generated projectile effect.
- The fitting-room cast preview uses the same four independent PNG frames and loops them for inspection.
- During playback the integrated static hero layer is hidden, preventing the old single-image CSS motion from stacking underneath the frame animation.
- Non-starlight weapons keep their integrated full-character artwork and existing FX fallback until matching weapon-specific motion sheets are generated.
- Verified all eight motion frames are 512x512 with transparency and verified inline scripts with `node --check` using UTF-8 extraction.

## 2026-08-03 Hero Scale and Gender Normalization

- Added `tools/normalize_hero_assets.py` and generated 100 production-ready integrated character-and-weapon PNGs under `assets/generated/hero-weapons-normalized/`.
- Every output uses a 512x512 transparent canvas, a shared visible-content limit, and the same foot baseline. This removes the large size differences between level cards and keeps characters grounded consistently.
- Updated both `index.html` and `hero-preview.html` to use the normalized assets, so the fitting room and formal game now share one source of truth.
- Corrected gender mismatches in the published set. The unsuitable male Lv.7 source temporarily uses the normalized male Lv.8 art; the unsuitable female Lv.6 source temporarily uses normalized female Lv.7 art. These are deliberate safe fallbacks until unique same-gender redraws are available.
- Generated `assets/generated/hero-weapons-normalized-contact.png` for visual QA of all 20 level/gender rows across the five weapons.
- Repaired three malformed preview strings and confirmed both HTML files pass JavaScript syntax checks.
- Restarted the local preview server on port 8768 and verified `hero-preview.html` returns HTTP 200 and references `hero-weapons-normalized`.

### Remaining Hero Art Work

- Unique replacement art is still needed for male Lv.7 and female Lv.6; the current same-gender fallbacks intentionally duplicate adjacent levels.
- True continuous casting for every level and every weapon requires matching integrated action frames. The current real four-frame cast set covers starlight only; other weapons still use their integrated static character PNG plus runtime motion/FX fallback.

## 2026-08-08 Hero Wide-Canvas Normalization

- Rebuilt all 100 normalized hero-and-weapon assets with one shared transparent `768x648` canvas.
- The visible artwork is normalized to `531px` high with a shared foot baseline at `y=596`; wide weapon effects no longer force the character to become shorter.
- Updated the main game and fitting room to render the integrated assets at `768:648`, bottom-aligned, using the same source-of-truth files.
- Disabled the legacy hero motion overlay in the main game because it could render a second character over the integrated hero during casting. The integrated asset remains the only character layer.
- Verified all 100 PNGs are `768x648`, alpha-bounded to `531px` height, and share the same baseline.

## 2026-08-08 Hero Integration QA

- Added cache version `20260809` to the main game and fitting room asset URLs so the browser does not keep displaying the pre-normalization `512x512` files.
- Verified weapon switching in the fitting room replaces the complete integrated hero artwork: selecting `烈焰戰輪` loads `hero-male-lv1-fire.png`, with no separate weapon overlay.
- Verified selecting `Lv.7` keeps the male character source and loads `hero-male-lv7-fire.png`; level cards use the same `768:648` sprite geometry.
- Verified the main game loads `hero-male-lv1-starlight.png?v=20260809`, has exactly one `#hero`, spawns an enemy, and has zero visible legacy motion/weapon overlays.
- Verified both inline HTML scripts and the normalization tool compile successfully.

### Current Limitation

- The integrated PNG set is now the authoritative complete character-and-weapon presentation and prevents duplicate rendering. A future art pass can replace any individual PNG with a newly generated transparent asset using the same filename and `768x648`/baseline contract.

## 2026-08-26 全關卡逐關驗收與方向修正

- 完成第 1～8 關瀏覽器逐關 smoke test：每關都能開啟任務提示、開始戰鬥、顯示第 1 / 4 波，並生成第一隻小怪。
- 每關第一隻小怪都確認有題目標籤、鍵盤區位 lane，以及 `--x` / `--y` 位置資料，符合「題目對應鍵盤區位」的執行架構。
- 第 1～8 關內容檢查通過：字母、英文短單字、單一注音、聲調與標點、中文單字、詞語與熱鍵、英文句子、中文句子均對應正確關卡。
- 第 4 關已檢查沒有兩個注音符號合併題；保留單一符號、聲調與標點練習。
- 第 9 關以未集滿八顆寶石的狀態測試，正確顯示未解鎖，不會繞過主線進入大橋堂。
- Boss 素材統一使用 `assets/generated/boss-safe-atlas-20260612-v3/` 的安全 atlas；目前 CSS 已明確禁止再對 Boss 圖片套用 `scaleX`，避免原始素材朝向被二次翻轉。
- 主角對目標的朝向判斷已修正：目標在左側時主角使用左向，目標在右側時使用右向；施法完成後不再額外排程多餘轉向。
- 驗證結果：`node tools/qa-game.mjs` 為 94/94；`node tools/qa-game.mjs http://127.0.0.1:8767` 為 106/106；`index.html`、`hero-preview.html`、`boss-preview.html` 的 inline script 語法檢查通過。

### 本輪仍需保留的測試限制

- 2026-08-26 當時的逐關 smoke test 尚未完整打完每關約三分鐘、四波、Boss 三階段；此歷史限制已由下方同日的全流程自動驗收補足。
- Boss 素材本身仍以「原圖已定向、執行時不再翻面」為契約；若日後替換原始 PNG，必須先確認角色臉部朝向與透明邊界，再使用相同檔名替換。
- 當時下一個最安全的任務是增加僅供 QA 使用的快速通關模式；該任務已由下方 2026-08-26 全流程自動驗收完成。

## 2026-08-26 全關卡自動流程驗收

- 已加入僅供 QA 使用的 `?qa=full` 自動驗收流程；學生正常進入遊戲時不會啟用這個模式。
- QA 仍走正式的 `begin()`、波次生成、輸入、施法、Boss 階段切換與 `finish()` 流程，不直接改寫通關結果。
- 已逐關自動跑完第 1～8 關的四波小怪與 Boss 三階段，並完成第 9 關大橋堂的綜合流程驗收。
- 驗收畫面確認九關全部通過，且八顆寶石解鎖大橋堂；每關結果均顯示「四波 + Boss 三階段」。
- QA 期間的碰撞容錯、測試生命值與投射物等待只在 `qaMode` 生效；正式學生模式的速度、生命、碰撞與輸入規則維持不變。
- QA 結束會還原原本的學生 profile 與紀錄，避免自動測試污染學生資料。

### 本次驗收結果

- `node tools/qa-game.mjs http://127.0.0.1:8767`：106/106 passed。
- 瀏覽器 `http://127.0.0.1:8767/index.html?qa=full`：第 1～9 關全部通過；第 1～9 關皆完成四波與 Boss 三階段；八顆寶石解鎖通過。
- `git diff --check`：通過。
- 伺服器 `http://127.0.0.1:8767/index.html`：HTTP 200。

## 2026-08-31 專案正式規格整理

- 新增 `docs/project-spec.md`，整理目前正式產品定位、八景與大橋堂流程、輸入規則、Boss 三階段、角色／武器／資產契約、GAS 資料格式、管理者預覽界線與靜態／動態／實機驗收標準。
- `README.md` 已加入規格文件入口。
- 本文件中的 2026-08-26 自動 QA 結果仍為目前最後一次完整自動流程結果；規格另外明確列出中文輸入法、實體鍵盤、投影與 GAS 部署等尚需課堂設備驗證的風險。

### 後續注意

- `?qa=full` 是驗收工具，不是給學生使用的遊戲選項。
- 本次已驗證流程完整性；仍建議下一輪在實際學生裝置上檢查鍵盤輸入、中文輸入法、GAS 紀錄與不同視窗尺寸。

## 2026-09-01 Sol → Luna → Sol 開發計畫

- 新增 `docs/sol-luna-implementation-handbook.md`，作為下一輪唯一實作計畫入口。
- 手冊依目前程式與正式規格盤點缺口，明確定義九關題庫資料契約、各波內容、Boss 最低正確題數與不可跳階段規則、主角與 Boss 的方向 manifest、GAS 五碼帳密與帳號隔離、金錢商店、完整人物武器素材、大橋堂前 50 名與暱稱過濾。
- 研究參考包含 GNU Typist、KTouch、Monkeytype、Z-Type、Termtype、Typing Bee、Rime、libchewing、教育部國語小字典，以及 Google Apps Script、OWASP 與 Unicode 官方文件；手冊只採用機制參考，不直接複製受授權限制的題庫或課文。
- Luna 應依 WP0 至 WP7 分包實作，不一次重寫單頁程式；每包完成後更新本交接檔並附測試證據。
- Sol 最終依手冊的資料安全、九關流程、方向動作、Boss 平衡、商店、資產與天梯測試矩陣複核。P0、P1 必須歸零，P2 必須有處置紀錄。
- 文件完成後已重跑基準：`node tools/qa-game.mjs` 為 94/94，`node tools/qa-game.mjs http://127.0.0.1:8767` 為 106/106，`git diff --check` 通過；後續 WP1 已開始修改前端與 GAS 題庫資料層。
- 2026-09-01 已開始執行 WP1：前端新增題庫 schema v1 正規化與 NFC 控制字元清理，遠端題目依 `stage + mode` 僅分流到第 7 或第 8 關，匯出格式升級為版本化 TSV；GAS 題庫新增 `stage/wave/display/laneKey/tags/source/license/version` 欄位，並相容舊有題目資料。
- 新增 `tools/qa-question-contract.mjs`，檢查前端與 GAS 的題庫契約、關卡分流、來源與授權欄位。
- 本次 WP1 驗證：`node tools/qa-question-contract.mjs` 為 21/21；既有 `node tools/qa-game.mjs` 為 94/94；`node tools/qa-game.mjs http://127.0.0.1:8767` 為 106/106；index 兩段 inline script 與 GAS script 均編譯通過；`git diff --check` 通過。
- WP2 尚未開始：GAS 五碼登入、session、Profiles、Inventory、金幣與伺服器權威結算仍不可宣稱已完成。

### 下一個最安全任務

- 由 Luna 執行手冊 WP2，先在測試試算表加入 Accounts、Profiles、Sessions 三張表，完成五碼帳號登入與帳號隔離；不要在 WP2 尚未通過前接商店或排行榜。

## 2026-09-01 Sol 最終複核與收尾

- 已完成手冊 WP1～WP7 的主要程式實作：題庫契約與關卡分流、GAS 五碼帳號/session、Boss 方向與三階段平衡、角色等級與整合武器外觀、金幣商店、八顆寶石流程、大橋堂天梯與暱稱過濾。
- Boss 每階段以 `floor(phaseBudget / hitsLeft)` 分配傷害，並要求各階段最低正確題數，避免少量輸入直接打穿 Boss；Boss 會先顯示攻擊預告再反擊。
- 小怪依鍵盤區位分群，加入同 lane 延遲、距離門檻與分散座標，避免同一位置疊怪；人物與武器使用單張整合 PNG，`heroWeapon`、舊 motion layer 均隱藏，避免重複疊圖。
- 100 張人物整合 PNG 已驗證全部為 `768x648`；正式 Boss atlas 使用 `2048x512` 安全素材，contact sheet 不列入正式關卡素材。
- 任務開始按鈕已補上 `type="button"`、明確全域事件入口、pointerdown/click 去重與原生 fallback，避免嵌入頁初始化順序或隱式表單行為造成卡在任務提示。
- 天梯只在八顆寶石後啟動；GAS run 有 15 分鐘期限、一次性完成、防低正確率與帳號綁定；前端與 GAS 都過濾暱稱，公開榜只保留前 50 名。

### 最終驗證證據

- `node tools/qa-game.mjs`：100/100 passed。
- `node tools/qa-game.mjs http://127.0.0.1:8767`：112/112 passed，含主要頁面與正式 Boss 素材 HTTP 200。
- `node tools/qa-question-contract.mjs`：49/49 passed。
- `index.html`、`hero-preview.html`、`boss-preview.html` inline scripts 與 `gas_code.gs`：Node VM compile passed。
- `git diff --check`：passed。
- 瀏覽器 `?qa=full&v=20260901-final-sol2`：第 1～9 關全部通過；每關顯示「四波 + Boss 三階段 ✓」，八顆寶石解鎖通過。
- 正常頁面 smoke：登入、任務提示、選單開關、繁體介面、人物單層與武器整合路徑均可載入；目前嵌入式瀏覽器對任務覆蓋層的 locator/CUA 點擊仍未把事件送入頁面，沒有產生新的頁面錯誤，已保留明確事件 fallback 並列為需實機確認項。

### 交給下一個模型前最安全任務

- 部署一份測試 GAS，實測 `login`、`loadProfile`、`finishStage`、`purchase`、`startLadder`、`finishLadder`；接著用實體鍵盤、中文輸入法與投影尺寸做人工驗收。不要先更換已通過尺寸與方向契約的 PNG 檔名。

## 2026-09-01 GAS 合約測試與結算防偽

- 新增 `tools/qa-gas-contract.mjs`，以本機 mock 的 SpreadsheetApp、PropertiesService、Utilities、LockService 與 ContentService 執行 `gas_code.gs`，不會連線或修改真實試算表。
- 測試覆蓋：九張資料表建立、管理者建立五碼帳號、登入/session、錯誤密碼、未登入拒絕、存檔版本衝突、外觀同步不可改等級與金幣、八關結算、重複 eventId 防重複領獎、武器與消耗品購買、八寶石解鎖天梯、暱稱過濾、天梯樓層／分數上限、run 一次性送出、前 50 名排行榜與登出失效。
- 修正 `gas_code.gs`：`finishStage_` 新增各關最低正確題數門檻，避免只帶 session 就能用 0 題偽造通關與領取獎勵。門檻與前端四波題數及 Boss 三階段最低題數一致：`76, 51, 68, 64, 50, 43, 25, 25`。
- 驗證結果：`node tools/qa-gas-contract.mjs` 顯示 27 項檢查全部 PASS；先前遊戲 QA、題庫 QA、九關瀏覽器 QA 維持通過。
- GAS 修正後重新執行瀏覽器 `?qa=full&v=20260901-gas-contract`，第 1～9 關仍全部通過四波與 Boss 三階段。
- README 已加入 GAS 合約測試指令，後續部署正式 GAS 前應先跑此測試；正式部署後仍需使用測試試算表再實測 Web App endpoint。

### 下一個最安全任務

- 在 Google Apps Script 建立隔離的測試試算表並部署測試 Web App，使用測試帳號完成 login、loadProfile、saveProgress、finishStage、purchase、startLadder、finishLadder、leaderboard；確認成功後才切換正式試算表。部署測試不應把學生真實資料帶入 QA。

## 2026-09-05 人物朝向一致修正與驗收

- 確認 `hero-weapons-normalized-v2` 的整合人物圖並非每個等級都以同一邊為原始面向；男、女 Lv.1 與 Lv.4 為反向來源，其餘等級為共同基準方向。
- `index.html` 與 `hero-preview.html` 共用相同的 `HERO_SOURCE_MIRROR` 規則：先把素材校正成朝右，再依目標位置決定正式戰鬥的左右轉身；因此等級切換不會造成方向跳變。
- 升級預覽的十張卡片與放大人物都使用同一個校正倍率；「轉向」只改變放大預覽的測試方向。星光法杖四段施法動作是獨立的正向素材，只套用目標方向，不會誤套用等級校正。
- 管理者 Boss 強化預覽也套用人物朝向校正，人物在 Boss 左側時會面向右側 Boss。

### 本次驗收結果

- `node tools/qa-hero-assets.mjs`：412/412 passed。
- `node tools/qa-game.mjs`：102/102 passed；`node tools/qa-question-contract.mjs`：49/49 passed；`node tools/qa-gas-contract.mjs`：27/27 passed；`git diff --check` passed。
- 瀏覽器角色預覽：男、女各 Lv.1-Lv.10 卡片朝向校正皆為 `[-1,1,1,-1,1,1,1,1,1,1]`，五種武器切換都載入對應整合 PNG，無 error/warn；轉向測試在 Lv.1、Lv.2 均得到正確相反最終方向。
- 瀏覽器 `index.html?qa=full`：頁面顯示第 1～9 關「四波 + Boss 三階段 ✓」與八顆寶石解鎖；Boss 強化預覽人物方向校正可讀取。

### 下一個最安全任務

- 使用隔離 GAS Web App 與實體鍵盤／中文輸入法做一次真實裝備購買、重新載入、人物方向與四段施法 smoke test；不要在正式學生帳號執行變更型 QA，也不要直接更換已通過朝向校正的整合 PNG 檔名。

## 2026-09-03 角色外觀與商店購買驗收

- 修正主遊戲缺少非武器裝備外觀回饋的問題：新增 `#heroGear` 效果層，專注水晶、守護披風、連擊項鍊、勇者冠冕各自有不同的青色環、盾形護罩、紫色旋轉環與金色冠形光印。
- `#heroGear` 只負責裝備效果，武器仍完全由 `assets/generated/hero-weapons-normalized-v2/` 的整合人物 PNG 提供；`#heroWeapon` 維持 `display:none`，因此購買或切換武器不會再疊出舊武器。
- 裝備狀態會在登入換帳號、開始關卡、開啟角色頁、購買與切換裝備時同步到 `data-gear`；測試模式的儲存被隔離，避免污染學生存檔。
- 新增 `tools/qa-hero-assets.mjs`，檢查男／女各 Lv.1-Lv.10、五種武器共 100 張 PNG 均存在，且為 `768x648` RGBA；前端正式遊戲與升級預覽都引用 normalized-v2。

### 本次驗收結果

- `node tools/qa-game.mjs`：102/102 passed。
- `node tools/qa-question-contract.mjs`：49/49 passed。
- `node tools/qa-gas-contract.mjs`：27/27 passed。
- `node tools/qa-hero-assets.mjs`：403/403 passed。
- `index.html`、`hero-preview.html`、`boss-preview.html` inline scripts 與 `gas_code.gs`：Node VM compile passed；`node --check tools/qa-gas-endpoint.mjs` passed；`git diff --check` passed。
- 瀏覽器角色預覽：男／女 × Lv.1-Lv.10 × 五武器共 100 組，全部載入正確整合 PNG、固定 `768:648` 顯示比例、舊武器層隱藏。
- 瀏覽器商店：隔離 QA 帳號實際購買烈焰戰輪、守護披風、小補血藥水；分別確認整合人物 PNG 切換、裝備光環切換、金幣扣除與持有數增加；瀏覽器 error/warn 為空。
- 資產透明內容抽查：100 張整合 PNG 的 alpha bounding box 腳底皆落在 `y=610`，內容高度為 500 px；不同武器的左右展幅可不同，但人物基準線與畫布比例一致。預覽施法動畫取樣時元素外框會依動畫縮放短暫變化，不能用單一動畫瞬間的 DOM 外框判定素材變形。

### QA 入口與限制

- `?qa=visual` 只用於本機購買與外觀驗收；它固定測試帳號為隔離用五碼，不得在正式課堂或正式 GAS URL 使用。
- 本輪尚未連線真實 GAS Web App；線上端點仍需使用隔離試算表與一次性 QA 帳號執行 `node tools/qa-gas-endpoint.mjs`。

### 下一個最安全任務

- 在實際隔離 GAS Web App 與實體學生裝置上驗收：登入、購買同步、中文輸入法、投影尺寸與不同瀏覽器；不要更換已通過尺寸與引用契約的整合人物 PNG 檔名。

## 2026-09-05 人物裝備預覽與外觀回歸

- `hero-preview.html` 新增四種道具外觀切換：專注水晶、守護披風、連擊項鍊、勇者冠冕；每個選項有明確選取狀態與目前道具說明。
- 預覽道具層固定使用 `effect-only`，只呈現光環、護罩、旋轉環或冠形光印；人物與武器仍由 `hero-weapons-normalized-v2` 單張整合 PNG 提供，避免道具預覽重新造成武器疊圖。
- 新增 responsive 道具選擇列與 `aria-pressed` 狀態，方便課堂投影與鍵盤／輔助工具驗收。
- `tools/qa-hero-assets.mjs` 新增四種道具預覽契約檢查。

### 本次驗收結果

- `node tools/qa-hero-assets.mjs`：407/407 passed。
- `node tools/qa-game.mjs`：102/102 passed；題庫 49/49、GAS 合約 27/27 仍通過。
- 瀏覽器人物預覽：男、女各 Lv.1-Lv.10 × 五武器，共 100 組，整合人物素材、等級與武器皆正確；四種道具效果均可切換，無 error/warn。

### 下一個最安全任務

- 以隔離 GAS Web App 做一次真實登入、購買與 reload 後外觀同步測試，再用實體鍵盤／中文輸入法與投影尺寸做課堂 smoke test；不要在正式帳號上執行變更型 QA。

## 2026-09-01 GAS 線上端點測試準備

- 新增 `tools/qa-gas-endpoint.mjs`，只允許 HTTPS Google Apps Script Web App 網址，並要求 `GAS_ALLOW_MUTATION=YES`、專用五碼 QA 帳號、測試密碼與暱稱；缺少任一條件時直接拒絕執行。
- 線上冒煙測試涵蓋：`ping`、管理者建立隔離帳號、`login`、`loadProfile`、`saveProgress` 的伺服器權威欄位、八關 `finishStage`、消耗品 `purchase`、`startLadder`、`finishLadder`、前 50 名 `leaderboard` 與 `logout`。
- 測試帳號會完成八關、購買物品並提交天梯紀錄，因此本工具只能指向隔離測試試算表；不會使用 `50101`，也不會在程式碼保存任何密鑰。
- 已在 `README.md` 與 `docs/sol-luna-implementation-handbook.md` 補上部署順序、PowerShell 環境變數範例與資料安全提醒。
- 本次驗證：`node --check tools/qa-gas-endpoint.mjs` 通過；未提供環境變數時工具以安全拒絕碼結束；`node tools/qa-gas-contract.mjs` 27/27、`node tools/qa-question-contract.mjs` 49/49、`node tools/qa-game.mjs` 100/100、HTTP QA 112/112、`git diff --check` 均通過。
- 尚未執行真實 Web App 冒煙測試，原因是工作區沒有可安全使用的 GAS 部署網址、隔離試算表與測試密鑰；不可把本機 mock 結果宣稱為線上部署證據。

### 下一個最安全任務

- 由下一個模型使用老師提供的隔離 GAS 專案與測試試算表，設定臨時環境變數後執行 `node tools/qa-gas-endpoint.mjs`；通過後才考慮正式部署與學生裝置實測，並清除或封存測試帳號資料。
