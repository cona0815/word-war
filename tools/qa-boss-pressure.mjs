import fs from 'node:fs';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);
const {chromium}=require('C:/Users/cona0/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const reactionMs=Math.max(0,Number(process.argv[3])||0);
const browser=await chromium.launch({channel:'chrome',headless:true}),reports=[];
try{
 for(const stage of [0,8]){
  const page=await browser.newPage();
  await page.goto((process.argv[2]||'http://127.0.0.1:8767')+'/index.html?gm=1');
  await page.locator('#gmPassword').fill('0088');await page.locator('#gmLogin button').click();
  await page.locator('#gmStage').selectOption(String(stage));await page.locator('#gmBoss').click();
  await page.waitForFunction(()=>state.running&&!document.querySelector('#gmPanel').open);
  const result=await page.evaluate(reactionMs=>new Promise(resolve=>{
   const start=performance.now(),phases=new Map();let last=start,pendingMs=0,totalMs=0,readyAt=null;
   const timer=setInterval(()=>{
    const now=performance.now(),dt=now-last;last=now;totalMs+=dt;
    if(state.current?.pending)pendingMs+=dt;
    const phase=state.bossPhase;
    if(!phases.has(phase))phases.set(phase,{phase,firstAtMs:Math.round(now-start),startHp:state.hp,attackStart:state.bossAttackCount});
    const row=phases.get(phase);row.endHp=state.hp;row.attacks=state.bossAttackCount-row.attackStart;
    if(!state.running||now-start>120000){clearInterval(timer);clearInterval(state.tick);resolve({stage:levels[state.levelIndex].id,done:!state.running,hp:state.hp,correct:state.correct,attempts:state.attempts,attacks:state.bossAttackCount,durationMs:Math.round(totalMs),pendingMs:Math.round(pendingMs),pendingPercent:Math.round(pendingMs/totalMs*100),phases:[...phases.values()]});return}
    if(state.current&&!state.current.pending){readyAt??=now;if(now-readyAt>=reactionMs){submit(state.current.word);readyAt=null}}else readyAt=null;
   },30);
  }),reactionMs);
  assert.equal(result.done,true);assert.equal(result.correct,result.attempts);
  reports.push(result);console.log(JSON.stringify(result));await page.close();
 }
 fs.mkdirSync('docs/qa-boss-pressure',{recursive:true});fs.writeFileSync(`docs/qa-boss-pressure/reaction-${reactionMs}.json`,JSON.stringify({method:'GM direct Boss, Lv1 starlight, correct submit after configured reaction delay; measures timing, not human input or full stage difficulty',reactionMs,reports},null,2));
}finally{await browser.close()}
