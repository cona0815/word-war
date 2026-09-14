import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'C:/Users/cona0/AppData/Local/npm-cache/_npx/e41f203b7505f1fb/node_modules/playwright');
const browser=await chromium.launch({channel:'chrome',headless:true});
const base=process.argv[2]||'http://127.0.0.1:8767/';
const results=[];function check(name,value){assert.ok(value,name);results.push(name);console.log('PASS '+name)}
try{
 const page=await browser.newPage({viewport:{width:1440,height:1000}}),errors=[],external=[];
 page.on('pageerror',e=>errors.push(e.message));await page.route('https://**/*',r=>{external.push(r.request().url());r.abort()});
 await page.addInitScript(()=>{sessionStorage.setItem('word-war-opening-v1','seen');localStorage.setItem('word-war-core-config',JSON.stringify({gasUrl:'https://example.invalid/student-endpoint',adminToken:'test-not-a-secret'}));localStorage.setItem('word-war-core-profile:50101',JSON.stringify({account:'50101',hero:'female',level:4,coins:321,gems:[true,true]}))});
 await page.goto(base);await page.waitForFunction(()=>window.BattleMusic);
 const before=await page.evaluate(()=>({...localStorage}));
 check('登入帳號下方有免帳號體驗入口',await page.locator('#loginAccount #guestStartBtn').isVisible());
 await page.screenshot({path:'docs/qa-music-guest-login.png'});
 external.length=0; // Login may read public questions; measure requests after entering guest mode.
 await page.locator('#guestStartBtn').click();
 await page.waitForFunction(()=>state.running&&state.guestMode,null,{timeout:20000});
 check('不用輸入帳密直接開始第一關',await page.evaluate(()=>state.profile.account==='guest'&&state.profile.level===1&&state.levelIndex===0&&mission.classList.contains('hidden')));
 await page.waitForFunction(()=>BattleMusic.inspect().playing,null,{timeout:10000});
 check('一般戰鬥播放初戰音樂',await page.evaluate(()=>BattleMusic.inspect().group==='battle-early'));
 const tracks=await page.evaluate(()=>{const t=[BattleMusic.inspect().track];for(let i=0;i<6;i++){BattleMusic.next();t.push(BattleMusic.inspect().track)}return t});
 check('三段輪替不連續重複',new Set(tracks.slice(0,3)).size===3&&tracks.every((t,i)=>!i||t!==tracks[i-1]));
 await page.evaluate(()=>boss());await page.waitForFunction(()=>BattleMusic.inspect().group==='boss-early'&&BattleMusic.inspect().playing);
 check('Boss 登場自動切換小魔王音樂',true);
 await page.locator('#battleMusicToggle').click();check('靜音會暫停音樂',await page.evaluate(()=>!BattleMusic.inspect().playing&&!BattleMusic.inspect().enabled));
 await page.locator('#battleMusicToggle').click();await page.waitForFunction(()=>BattleMusic.inspect().playing);
 await page.locator('#menuBtn').click();await page.waitForFunction(()=>!BattleMusic.inspect().playing);
 check('開啟選單暫停配樂',true);
 await page.evaluate(()=>tabMenu('settings'));
 check('體驗設定只顯示音樂，不露出管理者表單',await page.locator('#battleMusicVolume').isVisible()&&!await page.locator('#gasUrlInput').isVisible());
 await page.locator('#battleMusicVolume').fill('15');
 check('音量可調整並保存偏好',await page.evaluate(()=>BattleMusic.inspect().volume===.15));
 await page.locator('#closeMenuBtn').click();await page.waitForFunction(()=>BattleMusic.inspect().playing);
 await page.evaluate(()=>{finish(true);saveProfile();saveRecords();save(CONFIG,{gasUrl:'bad'});save(LADDER_STORE,[{nickname:'guest'}])});
 check('通關畫面停止音樂',await page.evaluate(()=>!BattleMusic.inspect().playing));
 const after=await page.evaluate(()=>({...localStorage}));
 check('體驗未改正式帳號／設定／紀錄',Object.keys({...before,...after}).filter(k=>k!=='word-war-music-settings').every(k=>before[k]===after[k]));
 check('體驗不呼叫外部 GAS',external.filter(url=>url.includes('example.invalid')).length===0);
 const clips=JSON.parse(fs.readFileSync('assets/music/manifest.json','utf8'));
 check('六首各三段，共十八段',Object.values(clips.groups).every(a=>a.length===3)&&Object.values(clips.groups).flat().length===18);
 const decoded=await page.evaluate(async groups=>{
   const results=[];
   for(const clip of Object.values(groups).flat()){
     const a=new Audio(clip.src);a.preload='auto';
     await new Promise((ok,fail)=>{a.onloadedmetadata=ok;a.onerror=()=>fail(Error(clip.src));setTimeout(()=>fail(Error('timeout '+clip.src)),5000)});
     results.push({src:clip.src,duration:a.duration});a.removeAttribute('src');a.load();
   }
   return results;
 },clips.groups);
 check('十八段 MP3 都可被瀏覽器解碼',decoded.every(c=>c.duration>=18&&c.duration<25));
 check('無 JavaScript 錯誤',errors.length===0);
 fs.writeFileSync('docs/qa-music-guest.json',JSON.stringify({passed:results.length,results,decoded},null,2));
}finally{await browser.close()}
