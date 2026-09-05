import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);
const {chromium}=require('C:/Users/cona0/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const endpoint='https://script.google.com/macros/s/AKfycbyfx04pox5fLuneoCZScY67Pe-5OM-Tj0pQtAe0eTDJ9g_H_moDY0p6nSshjVmvkey6/exec';
const browser=await chromium.launch({channel:'chrome',headless:true});
try{
 const page=await browser.newPage();
 await page.addInitScript(url=>localStorage.setItem('word-war-core-config',JSON.stringify({gasUrl:url})),endpoint);
 await page.goto(process.argv[2]||'http://127.0.0.1:8767/');
 await page.locator('#accountInput').fill('99099');await page.locator('#passwordInput').fill('99099');await page.locator('#startBtn').click();
 await page.waitForFunction(()=>state.auth?.sessionToken,null,{timeout:60000});
 await page.evaluate(async()=>{if(state.profile.account!=='99099')throw Error('Isolated QA account required');await startBattle();clearInterval(state.tick);if(!state.running)throw Error(missionText.textContent);window.closedQaRun=Consumables.inspect().run;window.closedQaItems=JSON.stringify(state.profile.inventory.items);finish(false)});
 await page.waitForFunction(()=>Consumables.inspect().closing===0,null,{timeout:60000});
 const result=await page.evaluate(async()=>{
  const loaded=await gasPost({action:'loadProfile'});if(!loaded.ok)throw Error(loaded.error);
  const retry=await gasPost({action:'closeItemRun',runId:closedQaRun});
  const denied=await gasPost({action:'consumeItem',runId:closedQaRun,itemId:'potion',eventId:crypto.randomUUID(),expectedVersion:loaded.profile.version});
  return {closed:loaded.profile.inventory.itemRun.closed,id:loaded.profile.inventory.itemRun.id,expected:closedQaRun,unchanged:JSON.stringify(loaded.profile.inventory.items)===closedQaItems,retry:retry.ok&&retry.profile.version===loaded.profile.version,denied:!denied.ok&&/closed/.test(denied.error)};
 });
 assert.equal(result.closed,true);assert.equal(result.id,result.expected);assert.equal(result.unchanged,true);assert.equal(result.retry,true);assert.equal(result.denied,true);
 console.log('PASS real GAS 99099 failure closes run, preserves inventory, retry is idempotent, later consume rejected');
}finally{await browser.close()}
