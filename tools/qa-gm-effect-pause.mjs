import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);
const {chromium}=require('C:/Users/cona0/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const browser=await chromium.launch({channel:'chrome',headless:true});
try{
 const page=await browser.newPage();
 await page.goto((process.argv[2]||'http://127.0.0.1:8767')+'/index.html?gm=1');
 await page.locator('#gmPassword').fill('0088');await page.locator('#gmLogin button').click();await page.locator('#gmStart').click();
 await page.waitForFunction(()=>state.running&&!document.querySelector('#gmPanel').open);
 const result=await page.evaluate(async()=>{
   clearInterval(state.tick);const originalNow=Date.now;let now=originalNow();Date.now=()=>now;
   try{
     await Consumables.prepare();state.profile.inventory.items={hourglass:1,hint:1};
     await Consumables.use('hourglass');await Consumables.use('hint');
     UltimateBattle.gmFill();UltimateBattle.charge();await UltimateBattle.release();
     const remaining=UltimateBattle.snapshot().freezeUntil-now;
     document.querySelector('#gmToggle').click();
     now+=20000;hud();
     const paused={slow:Consumables.slowFactor(),hint:document.querySelector('#battleItems output').textContent};
     document.querySelector('#gmResume').click();clearInterval(state.tick);
     const resumed={slow:Consumables.slowFactor(),remaining:UltimateBattle.snapshot().freezeUntil-now};
     now+=10001;hud();
     const expired={slow:Consumables.slowFactor(),hint:document.querySelector('#battleItems output').textContent};
     document.querySelector('#gmToggle').click();begin(0);document.querySelector('#gmResume').click();clearInterval(state.tick);
     return {remaining,paused,resumed,expired,reset:{slow:Consumables.slowFactor(),freeze:UltimateBattle.snapshot().freezeUntil}};
   }finally{Date.now=originalNow}
 });
 assert.equal(result.paused.slow,.5);assert.match(result.paused.hint,/首鍵/);
 assert.equal(result.resumed.slow,.5);assert.equal(result.resumed.remaining,result.remaining);
 assert.equal(result.expired.slow,1);assert.equal(result.expired.hint,'提示結束');
 assert.equal(result.reset.slow,1);assert.equal(result.reset.freeze,0);
 console.log('PASS GM preserves sandglass/hint/ultimate durations; expiry and new-battle reset remain correct');
}finally{await browser.close()}
