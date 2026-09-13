# Word War｜15 秒開頭影片製作包

概念：敲下第一鍵，喚醒你的魔法。沿用遊戲的藍金色魔法學園、原有男主角與大橋堂，營造帥氣、明亮、適合國小學生的冒險開場。

## 分鏡表

成片採 16:9，共約 15 秒。三張圖片各自作為一段影片的首幀，分別生成後剪接，每段保留約 5 秒。

| 鏡頭 | 時間 | 首幀圖片 | 動作與運鏡 | 聲音／剪接 |
|---|---|---|---|---|
| 1 校園甦醒 | 0–5 秒 | shot-01-academy.png | 鏡頭沿中軸推向學園入口，旗幟與樹葉輕動，地面浮現淡藍光流 | 風聲、鐘聲、音樂漸強；末尾接施法鏡頭 |
| 2 鍵盤勇者 | 5–10 秒 | shot-02-hero.png | 主角置中，鏡頭微微推近，A S D F 鍵帽依序亮起，掌心凝聚魔法並向前釋放一道光波 | 四聲清脆鍵音，接魔法呼嘯；以光波銜接下一鏡 |
| 3 大橋堂啟動 | 10–15 秒 | shot-03-hall.png | 中央法陣由外向內亮起，光流匯聚中央大門，鏡頭緩慢停止 | 低沉鼓點接明亮英雄和弦；13.5 秒起疊上 Logo |

## Kling 逐鏡描述詞

### 第 1 鏡：校園甦醒

以參考圖作為首幀，保持原有魔法學園建築、庭院布局與精緻日系動畫風格。單一連續鏡頭，攝影機沿庭院中軸緩慢向校門推進，陽光穿過樹梢，旗幟與葉片隨微風輕動，細小金色光粒漂浮。淡藍色魔法光流沿地面朝入口延伸，最後一秒光芒稍微增強，帶出冒險即將開始的期待。藍金配色，明亮、莊嚴、帥氣，建築輪廓保持穩定，不新增人物，不切換場景，不產生文字。

### 第 2 鏡：鍵盤勇者施法

以參考圖作為首幀，保持同一位棕髮藍眼少年法師的臉孔、身形、白色服裝、深藍金邊披風與魔法書。主角固定置中，低角度鏡頭小幅推近，披風自然飄動。右掌旁原有 A S D F 鍵帽依序發出柔和藍光，掌心魔法陣逐漸凝聚；少年沉穩地將右掌向前推出一小段距離，釋放一道明亮的藍金魔法光波。左手始終穩定持書。動作俐落有力量，保持五官與手指穩定，單一連續鏡頭，不旋轉環繞，不新增角色，不新增字幕。

### 第 3 鏡：大橋堂覺醒

以參考圖作為首幀，保持原有大橋堂的藍金建築、兩側守護雕像、中央大門與地面法陣。攝影機沿中軸緩慢向前推進，地面法陣紋路由外向內依序亮起，藍金色光流匯聚中央大門，門縫透出溫暖而強大的魔法光芒，少量金色粒子升起。兩側雕像保持靜止，畫面莊嚴、明亮、有最終試練即將啟動的氣勢。最後一點五秒攝影機平穩停止，保留清楚的中央構圖供後製疊上片名。單一連續鏡頭，不新增人物，不生成 Logo 或文字。

### 三鏡共用限制

可附在各鏡描述詞末尾：避免臉孔改變、多餘手指或肢體、建築扭曲、物體融化、劇烈晃動、快速閃爍、恐怖氣氛、額外字幕與浮水印。保持參考圖的角色和美術風格。

## 剪接方式

1. 依序使用三張首幀圖片與對應描述詞生成影片，每鏡取約 5 秒，組成 15 秒。
2. 統一使用 16:9 構圖；第三張原圖較寬，可置中裁切兩側，保留中央大門與法陣，不要拉伸。
3. 第 2 鏡末端以短暫光暈銜接第 3 鏡；避免強烈白閃。轉場重疊後，微調片段長度讓總長接近 15 秒。
4. 13.5–15 秒在剪輯軟體疊上透明圖 logo-overlay.png，置於中央，以短淡入呈現。不要讓影片模型重新生成品牌字樣。
5. Logo 下方可加「敲下第一鍵，啟動你的冒險」。文字由剪輯軟體加入，保持大字、清楚、少量。
6. 配樂使用有使用權的奇幻冒險音樂。第 5 秒配四聲鍵音，第 10 秒配鼓點，片尾保留明亮和弦與魔法餘音。

影片生成後檢查：主角臉孔與手指、鍵帽變形、建築穩定、光效是否遮住主角、片名是否清晰。此製作包已完成靜態圖片目視檢查；尚未生成或驗收 Kling 影片。

## 素材來源

- shot-01-academy.png：沿用 assets/login-castle.png。
- shot-02-hero.png：使用內建 imagegen，以 assets/login-hero-male.png 與 assets/login-castle.png 為參考生成的新橫式完整場景。
- shot-03-hall.png：沿用 assets/generated/daqiao-hall-interior-legendary-beasts.png。
- logo-overlay.png：沿用 assets/word-war-logo-wide.png，供片尾後製疊圖。

### 第 2 鏡圖片生成原始提示詞

Create one polished 16:9 landscape cinematic opening keyframe for Word War elementary school typing RPG. Image 1 is exact hero identity/costume reference, image 2 exact academy architecture reference. Preserve youthful brown-haired blue-eyed male mage, navy gold-trim cloak, white outfit and blue gem, same high quality anime illustration style, school courtyard background recognizable. Single hero centered, medium full shot low camera angle, feet planted, left hand holding closed navy spellbook, right open palm gathering a compact cyan magic circle, calm confident expression. A few luminous ivory keyboard keycaps marked A S D F hover in an orderly arc near his palm, not obscuring face. Blue gold cinematic sunlight, dramatic flowing cloak, coherent proportions and five fingers, anticipation pose BEFORE releasing magic, generous space around hero for image-to-video motion. No other heroes, no UI, no logo, no subtitles, no watermark, no split panels, no photorealism, no horror. Render complete opaque background.
