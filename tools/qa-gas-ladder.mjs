import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);
const {chromium}=require('C:/Users/cona0/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const endpoint='https://script.google.com/macros/s/AKfycbyfx04pox5fLuneoCZScY67Pe-5OM-Tj0pQtAe0eTDJ9g_H_moDY0p6nSshjVmvkey6/exec';
const browser=await chromium.launch({channel:'chrome',headless:true});
const reports=[];
try{
 const page=await browser.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.addInitScript(url=>localStorage.setItem('word-war-core-config',JSON.stringify({gasUrl:url})),endpoint);
 await page.goto(process.argv[2]||'http://127.0.0.1:8767/');
 await page.locator('#accountInput').fill('99099');await page.locator('#passwordInput').fill('99099');await page.locator('#startBtn').click();
 await page.waitForFunction(()=>state.auth?.sessionToken,null,{timeout:60000});
 await page.evaluate(async()=>{
   if(state.profile.account!=='99099')throw Error('QA account required');
   if(!(state.profile.inventory.items.shield>0)){
     const purchase=await gasPost({action:'purchase',itemId:'shield',expectedVersion:state.profile.version});
     if(!purchase.ok)throw Error(purchase.error);state.profile=profileForRemote(purchase.profile,'99099');
   }
 });
 await page.evaluate(()=>{if(state.profile.account!=='99099')throw Error('QA account required');begin(8)});
 await page.locator('#missionStartBtn').click();await page.waitForFunction(()=>state.running,null,{timeout:60000});
 const itemStart=await page.evaluate(async()=>{
   const before=state.profile.inventory.items.shield,run=Consumables.inspect().run;
   await Consumables.use('shield');
   return {before,after:state.profile.inventory.items.shield,run,used:Consumables.inspect().used.shield};
 });
 assert.equal(itemStart.after,itemStart.before-1);assert.equal(itemStart.used,true);assert.ok(itemStart.run);
 const waves=new Set();
 for(let floor=1;floor<=2;floor++){
  const phases=new Set(),start=Date.now();
  while(Date.now()-start<420000){
   const s=await page.evaluate(()=>({running:state.running,boss:state.bossMode,phase:state.bossPhase,wave:state.waveIndex,
     word:state.bossMode?(state.current?.pending?null:state.current?.word):state.enemies.find(e=>!e.pending&&isActive(e))?.word}));
   if(s.wave)waves.add(s.wave);
   if(s.boss&&!phases.has(s.phase)){phases.add(s.phase);console.log(`Floor ${floor}: phase ${s.phase}`)}
   if(!s.running)break;
   if(s.word){if(/^Ctrl\+/i.test(s.word))await page.keyboard.press(s.word.replace(/Ctrl/i,'Control'));else{await page.locator('#answerInput').fill(s.word);await page.locator('#answerInput').press('Enter')}}
   await page.waitForTimeout(140);
  }
  assert.deepEqual([...phases],[1,2,3,4,5]);
  const r=await page.evaluate(()=>({cleared:LadderBattle.inspect().cleared,floor:pendingLadderRecord?.floor,hp:state.hp,accuracy:state.correct/state.attempts*100}));
  assert.equal(r.cleared,floor);assert.equal(r.floor,floor);assert.ok(r.hp>0);reports.push({...r,durationMs:Date.now()-start});
  if(floor===1){
   await page.locator('#ladderNextFloor').click();
   const crossFloor=await page.evaluate(async()=>{
     const before=state.profile.inventory.items.shield;await Consumables.use('shield');
     return {run:Consumables.inspect().run,used:Consumables.inspect().used.shield,before,after:state.profile.inventory.items.shield};
   });
   assert.equal(crossFloor.run,itemStart.run);assert.equal(crossFloor.used,true);assert.equal(crossFloor.before,crossFloor.after);
   console.log('PASS same item run and once-per-run limit across floors');
  }
 }
 assert.equal(waves.size,4);
 await page.locator('#ladderNickname').fill('測試勇者');await page.locator('#submitLadderBtn').click();
 await page.waitForFunction(()=>!pendingLadderRecord,null,{timeout:60000});
 const duplicate=await page.evaluate(()=>gasPost({action:'finishLadder',runId:state.ladderRun.runId,nickname:'測試勇者',floor:2,score:state.score,correct:state.correct,attempts:state.attempts,durationMs:Date.now()-state.startedAt}));
 assert.equal(duplicate.ok,false);assert.match(duplicate.error,/already been submitted/);
 assert.equal(await page.locator('#ladderNextFloor').isDisabled(),true);assert.deepEqual(errors,[]);
 await page.waitForFunction(()=>Consumables.inspect().closing===0,null,{timeout:60000});
 const itemEnd=await page.evaluate(()=>gasPost({action:'loadProfile'}));
 assert.equal(itemEnd.ok,true);assert.equal(itemEnd.profile.inventory.itemRun.id,itemStart.run);assert.equal(itemEnd.profile.inventory.itemRun.closed,true);
 assert.equal(itemEnd.profile.inventory.items.shield,itemStart.after);
 await page.evaluate(()=>gasPost({action:'logout'}));
 fs.mkdirSync('docs/qa-gas-ladder',{recursive:true});fs.writeFileSync('docs/qa-gas-ladder/results.json',JSON.stringify({reports,waves:[...waves],duplicateRejected:true,itemStart,itemRunClosed:true,errors},null,2));
 console.log('PASS real GAS QA99099 four waves, two five-phase floors, one-time score submission and item lifecycle');
}finally{await browser.close()}
