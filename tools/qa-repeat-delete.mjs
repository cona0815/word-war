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
 await page.evaluate(()=>{clearInterval(state.tick);state.levelIndex=6;state.bossMode=false;state.enemies=[]});
 const before=await page.evaluate(()=>state.attempts);
 for(const key of ['Backspace','Delete']){
   await page.locator('#answerInput').fill('abcd');
   await page.locator('#answerInput').evaluate((node,key)=>node.setSelectionRange(key==='Delete'?0:4,key==='Delete'?0:4),key);
   await page.keyboard.down(key);await page.keyboard.down(key);await page.keyboard.up(key);
   assert.equal(await page.locator('#answerInput').inputValue(),key==='Delete'?'cd':'ab',key+' repeat');
 }
 assert.equal(await page.evaluate(()=>state.attempts),before,'Deleting must not submit answers');
 const repeat=await page.evaluate(()=>{
   state.levelIndex=0;
   const attempts=state.attempts;
   const allowed=answerInput.dispatchEvent(new KeyboardEvent('keydown',{key:'a',code:'KeyA',repeat:true,bubbles:true,cancelable:true}));
   return {allowed,unchanged:state.attempts===attempts};
 });
 assert.equal(repeat.allowed,false);assert.equal(repeat.unchanged,true);
 console.log('PASS held Backspace/Delete edit normally without submitting attacks');
}finally{await browser.close()}
