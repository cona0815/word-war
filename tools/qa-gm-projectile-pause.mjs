import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);
const {chromium}=require('C:/Users/cona0/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const browser=await chromium.launch({channel:'chrome',headless:true});
try{
 const page=await browser.newPage();
 await page.goto((process.argv[2]||'http://127.0.0.1:8767')+'/index.html?gm=1');
 await page.locator('#gmPassword').fill('0088');await page.locator('#gmLogin button').click();await page.locator('#gmBoss').click();
 await page.waitForFunction(()=>state.running&&!document.querySelector('#gmPanel').open);
 const before=await page.evaluate(()=>{
   clearInterval(state.tick);state.hp=100;state.bossAttackPending=true;state.bossAttackAt=0;bossThreat();
   document.querySelector('#gmToggle').click();
   return {hp:state.hp,deadline:state.bossAttackAt};
 });
 await page.waitForTimeout(900);
 assert.equal(await page.evaluate(()=>state.hp),before.hp,'Open GM must pause damage');
 assert.equal(await page.locator('.boss-bolt').count(),1,'Flight remains visible while paused');
 await page.locator('#gmResume').click();
 assert.ok(await page.evaluate(deadline=>state.bossAttackAt-deadline,before.deadline)>=850,'Countdown excludes pause');
 await page.waitForFunction(()=>state.hp<100);
 assert.equal(await page.evaluate(()=>state.hp),90,'Resumed flight hits once');
 await page.waitForTimeout(800);assert.equal(await page.evaluate(()=>state.hp),90);
 await page.evaluate(()=>{clearInterval(state.tick);state.bossAttackPending=true;state.bossAttackAt=0;bossThreat();document.querySelector('#gmToggle').click()});
 await page.locator('#gmBoss').click();
 await page.waitForFunction(()=>!document.querySelector('#gmPanel').open);
 await page.waitForTimeout(1000);
 assert.equal(await page.evaluate(()=>state.hp),100,'Old paused flight must not damage a new battle');
 console.log('PASS GM pauses in-flight damage and attack countdown; resume hits exactly once');
}finally{await browser.close()}
