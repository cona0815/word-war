import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);
const {chromium}=require('C:/Users/cona0/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const browser=await chromium.launch({channel:'chrome',headless:true});
try{
 const page=await browser.newPage();await page.goto((process.argv[2]||'http://127.0.0.1:8767')+'/index.html?gm=1');
 await page.locator('#gmPassword').fill('0088');await page.locator('#gmLogin button').click();await page.locator('#gmBoss').click();
 await page.waitForFunction(()=>state.running&&!document.querySelector('#gmPanel').open);
 const result=await page.evaluate(async()=>{
  clearInterval(state.tick);const originalNow=Date.now;let now=originalNow(),impact;
  Date.now=()=>now;startHeroMotion=()=>0;shot=(_a,_b,_c,_d,_e,done)=>{impact=done};
  const results=[];
  try{
   state.bossAttackAt=now+4000;submit(state.current.word);now+=8000;bossThreat();
   results.push({name:'animation cannot start warning',ok:!state.bossAttackPending&&state.bossAttackCount===0});
   impact();results.push({name:'remaining response time restored',ok:state.bossAttackAt===now+4000});
   now+=4000;bossThreat();results.push({name:'idle response time still starts warning',ok:state.bossAttackPending});
   const remaining=state.bossAttackAt-now;submit(state.current.word);now+=5000;bossThreat();
   results.push({name:'animation cannot launch pending warning',ok:state.bossAttackPending&&state.bossAttackCount===0});
   await new Promise(resolve=>setTimeout(resolve,1100));
   const warning=document.querySelector('.boss-telegraph');
   results.push({name:'warning remains visible during cast',ok:!!warning&&Number(getComputedStyle(warning).opacity)===1});
   impact();results.push({name:'warning countdown preserved',ok:state.bossAttackAt===now+remaining});
   now+=remaining;bossThreat();results.push({name:'expired warning launches attack',ok:state.bossAttackCount===1});
   results.push({name:'launch removes warning',ok:!document.querySelector('.boss-telegraph')});
   results.push({name:'correct answers still count',ok:state.correct===2&&state.bossPhaseHits===2});
  }finally{Date.now=originalNow}
  return results;
 });
 for(const r of result)assert.equal(r.ok,true,r.name);
 await page.evaluate(()=>{state.current.pending=false;state.bossAttackPending=false;state.bossAttackAt=Date.now();bossThreat()});
 fs.mkdirSync('docs/qa-boss-pressure',{recursive:true});await page.screenshot({path:'docs/qa-boss-pressure/warning.png'});
 console.log('PASS 9 Boss response-clock checks: cast waits excluded, warnings retained, idle deadlines and phase hits preserved');
}finally{await browser.close()}
