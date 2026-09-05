import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);
const {chromium}=require('C:/Users/cona0/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const endpoint='https://script.google.com/macros/s/AKfycbyfx04pox5fLuneoCZScY67Pe-5OM-Tj0pQtAe0eTDJ9g_H_moDY0p6nSshjVmvkey6/exec';
const browser=await chromium.launch({channel:'chrome',headless:true});
try{
 const page=await browser.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.exposeFunction('reportItemQa',message=>console.log(message));
 await page.addInitScript(url=>localStorage.setItem('word-war-core-config',JSON.stringify({gasUrl:url})),endpoint);
 await page.goto(process.argv[2]||'http://127.0.0.1:8767/');
 await page.locator('#accountInput').fill('99099');await page.locator('#passwordInput').fill('99099');await page.locator('#startBtn').click();
 await page.waitForFunction(()=>state.auth?.sessionToken,null,{timeout:60000});
 const result=await page.evaluate(async()=>{
   if(state.profile.account!=='99099')throw Error('QA account required');
   const ids=['potion','shield','hourglass','hint','comboStar'];
   for(const id of ids){
     if(!(state.profile.inventory.items[id]>0)){
       const purchased=await gasPost({action:'purchase',itemId:id,expectedVersion:state.profile.version});
       if(!purchased.ok)throw Error(purchased.error);
       state.profile=profileForRemote(purchased.profile,'99099');
     }
     await window.reportItemQa(`Inventory ready: ${id}`);
   }
   begin(0);await startBattle();clearInterval(state.tick);
   if(!state.running)throw Error(missionText.textContent);
   const receipts=[];state.hp=50;
   for(const id of ids){
     const before=state.profile.inventory.items[id];
     await Consumables.use(id);
     const effect=id==='potion'?state.hp:id==='shield'?Consumables.mistake():id==='hourglass'?Consumables.slowFactor():id==='hint'?document.querySelector('#battleItems output').textContent:Consumables.inspect().star;
     const loaded=await gasPost({action:'loadProfile'}),run=loaded.profile?.inventory.itemRun;
     if(!run?.used[id])throw Error(`Missing ${id} use receipt`);
     const retry=await gasPost({action:'consumeItem',runId:run.id,itemId:id,eventId:run.used[id],expectedVersion:1});
     receipts.push({id,before,after:retry.profile?.inventory.items[id],effect,retryOk:retry.ok});
     await window.reportItemQa(`Receipt checked: ${id}`);
   }
   const saved=await gasPost({action:'loadProfile'});
   if(!saved.ok)throw Error(saved.error);
   const inventory=saved.profile.inventory.items;
   await gasPost({action:'logout'});
   return {receipts,inventory};
 });
 for(const receipt of result.receipts){
   assert.equal(receipt.after,receipt.before-1,receipt.id);
   assert.equal(result.inventory[receipt.id],receipt.after,receipt.id+' persisted');
   assert.equal(receipt.retryOk,true,receipt.id+' retry');
 }
 const effects=Object.fromEntries(result.receipts.map(r=>[r.id,r.effect]));
 assert.equal(effects.potion,75);assert.equal(effects.shield,0);assert.equal(effects.hourglass,.5);assert.match(effects.hint,/首鍵/);assert.equal(effects.comboStar,true);assert.deepEqual(errors,[]);
 fs.mkdirSync('docs/qa-gas-items',{recursive:true});fs.writeFileSync('docs/qa-gas-items/results.json',JSON.stringify({result,errors},null,2));
 console.log('PASS real GAS QA99099: all five item effects, persisted inventory and duplicate retries');
}finally{await browser.close()}
