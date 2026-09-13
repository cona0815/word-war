import fs from 'node:fs';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);
const {chromium}=require('C:/Users/cona0/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const out='docs/promo-six';fs.mkdirSync(`${out}/raw`,{recursive:true});
const browser=await chromium.launch({channel:'chrome',headless:true});
const context=await browser.newContext({viewport:{width:1600,height:900}});
const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
await page.route('**/*',r=>new URL(r.request().url()).hostname==='127.0.0.1'?r.continue():r.abort());
await page.addInitScript(()=>{localStorage.clear();localStorage.setItem('word-war-core-profile:99099',JSON.stringify({account:'99099',version:1,hero:'female',level:1,xp:0,coins:0,gems:[true,true,true,true,true,true,true,true],weapon:'starlight',gear:'focus',inventory:{weapons:['starlight'],gear:['focus'],items:{}}}));});
const shots=[];
async function snap(id,title,sub,notes){await page.waitForTimeout(800);await page.screenshot({path:`${out}/raw/${id}.png`});shots.push({id,title,sub,notes});}
try{
await page.goto('http://127.0.0.1:8767/index.html');await page.waitForTimeout(1000);
await snap('01-login','把打字練習，變成校園冒險','Word War｜DCPS 校園鍵盤勇者',[['雙主角選擇','以自己的角色開始學習旅程'],['帳號登入','保存每次練習與成長紀錄']]);
await page.locator('#accountInput').fill('99099');await page.locator('#passwordInput').fill('99099');await page.locator('#startBtn').click();await page.waitForFunction(()=>!gameScreen.classList.contains('hidden'));
await page.locator('#menuBtn').click();
await snap('02-campus','熟悉的校園，成為闖關地圖','以 DCPS 校園景點為靈感，轉化為魔法場景',[['八景主線','八德亭、五倫園、如沐園等既有景點'],['寶石進度','每過一關收集一顆寶石，逐步解鎖']]);
await page.locator('#levelGrid [data-level="0"]').click();await page.locator('#missionStartBtn').click();await page.waitForFunction(()=>state.running);
await page.waitForTimeout(7500);await page.evaluate(()=>clearInterval(state.tick));
await snap('03-keyboard','怪物的位置，就是鍵位提示','把抽象的鍵盤位置，變成看得見的方向線索',[['左手鍵區 → 左側出怪','畫面對應鍵盤區域，協助建立鍵位記憶'],['主角置中','輸入怪物題目即可攻擊']]);
await page.evaluate(()=>begin(4));await page.locator('#missionStartBtn').click();await page.waitForFunction(()=>state.running);await page.waitForTimeout(6500);await page.evaluate(()=>clearInterval(state.tick));
await snap('04-chinese','从認識鍵位，到輸入國字'.replace('从','從'),'英文、注音、國字、詞語與句子，循序練習',[['中文單字關','一題一個國字，練習注音輸入與選字'],['輸入後 Enter','組字完成再提交，逐步建立輸入習慣']]);
await page.evaluate(()=>begin(8));await page.locator('#missionStartBtn').click();
await snap('05-gems','八顆寶石，開啟最後試練','大橋堂入口｜先收集，再放置，最後啟動挑戰',[['八寶石門檻','集滿八景寶石才可進入大橋堂'],['放置儀式','完成安置後，才能開始最後試練']]);
await page.locator('#missionStartBtn').click();await page.waitForFunction(()=>state.running);await page.waitForTimeout(2500);await page.evaluate(()=>{clearInterval(state.tick);boss();});await page.waitForTimeout(1200);
await snap('06-ladder','大橋堂天梯，挑戰自己的下一層','綜合所學，逐層挑戰；讓練習有持續前進的目標',[['綜合挑戰','英打、注音、中打與熱鍵依階段登場'],['五階段 Boss','挑戰完成層數，留下自己的成長紀錄']]);
fs.writeFileSync(`${out}/capture.json`,JSON.stringify({source:'http://127.0.0.1:8767/index.html',mode:'isolated local demo; seeded eight gems; ladder boss entered through runtime boss() for capture; no student data or network writes',errors,shots},null,2));
const cards=shots.map((s,i)=>`<section class="card" id="card-${i}"><header><span>WORD WAR / ${String(i+1).padStart(2,'0')}</span><h1>${s.title}</h1><p>${s.sub}</p></header><div class="capture"><img src="raw/${s.id}.png"><b class="pin p1">1</b><b class="pin p2">2</b></div><footer>${s.notes.map((n,j)=>`<div><b>${j+1}</b><article><strong>${n[0]}</strong><p>${n[1]}</p></article></div>`).join('')}</footer><small>實際遊戲畫面・本機示範帳號・展示進度非學生實績</small></section>`).join('');
fs.writeFileSync(`${out}/gallery.html`,`<!doctype html><meta charset="utf-8"><title>Word War 宣傳圖</title><style>*{box-sizing:border-box}body{margin:0;background:#061624;font-family:'Microsoft JhengHei',sans-serif;color:#fff}.card{width:1600px;height:1200px;background:linear-gradient(130deg,#071a2c,#12334c);position:relative;overflow:hidden;margin:0 0 30px}header{height:170px;padding:24px 48px}header span{color:#f3ca69;font-size:19px;letter-spacing:3px}h1{font-size:46px;margin:8px 0}header p{font-size:23px;margin:0;color:#c2d9e6}.capture{position:relative;width:1504px;height:846px;margin:0 48px;border:2px solid #d7b45b;border-radius:12px;overflow:hidden}.capture img{width:100%;height:100%;object-fit:contain}.pin{position:absolute;display:grid;place-items:center;width:44px;height:44px;background:#ffe087;color:#092035;border:3px solid white;border-radius:50%;font-size:25px;box-shadow:0 2px 12px #000}.p1{left:15%;top:36%}.p2{right:8%;bottom:13%}footer{display:flex;gap:35px;padding:18px 48px}footer>div{display:flex;gap:14px;width:50%}footer b{background:#ffe087;color:#092035;border-radius:50%;width:35px;height:35px;text-align:center;line-height:35px;font-size:22px}footer strong{font-size:24px;color:#ffe087}footer p{font-size:19px;margin:4px 0;color:#d1e3ec}small{position:absolute;bottom:8px;right:48px;color:#93acbd;font-size:14px}</style>${cards}`);
const gallery=await context.newPage();await gallery.setViewportSize({width:1600,height:1250});await gallery.goto('http://127.0.0.1:8767/docs/promo-six/gallery.html');await gallery.waitForTimeout(700);
for(let i=0;i<shots.length;i++)await gallery.locator(`#card-${i}`).screenshot({path:`${out}/${shots[i].id}-annotated.png`});
console.log(JSON.stringify({count:shots.length,errors}));
}finally{await browser.close();}
