import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { createRequire } from 'node:module';
const require=createRequire(import.meta.url);
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'C:/Users/cona0/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const base=process.argv[2]||'http://127.0.0.1:8767';
const out=path.resolve('docs/qa-live-stages');fs.mkdirSync(out,{recursive:true});
const browser=await chromium.launch({channel:'chrome',headless:true});
const reports=[];
const minimum=vm.runInNewContext('('+fs.readFileSync('gas_code.gs','utf8').match(/STAGE_MIN_CORRECT = Object.freeze\((\{[\s\S]*?\})\)/)[1]+')');
async function run(stage){
  const context=await browser.newContext({viewport:{width:1366,height:768}}),page=await context.newPage(),errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  const start=Date.now(),waves=new Set(),phases=new Set();
  try{
    await page.goto(base+'/index.html?test=real-time');
    await page.locator('#accountInput').fill('99099');await page.locator('#passwordInput').fill('99099');await page.locator('#startBtn').click();
    assert.equal(await page.evaluate(()=>!!state.config.gasUrl),false,'Full stage QA must remain local-only');
    await page.evaluate(i=>{state.profile.gems=Array(8).fill(true);begin(i)},stage-1);
    await page.locator('#missionStartBtn').click();await page.waitForFunction(()=>state.running);
    while(Date.now()-start<600000){
      const s=await page.evaluate(()=>({running:state.running,outcome:state.outcome,wave:state.waveIndex,phase:state.bossMode?state.bossPhase:0,hp:state.hp,
        word:state.bossMode?(state.current?.pending?null:state.current?.word):state.enemies.find(e=>!e.pending&&isActive(e))?.word}));
      if(s.wave)waves.add(s.wave);
      if(s.phase&&!phases.has(s.phase)){phases.add(s.phase);await page.screenshot({path:path.join(out,`stage-${stage}-phase-${s.phase}.png`)});console.log(`Stage ${stage}: Boss ${s.phase}`)}
      if(!s.running){assert.equal(s.outcome,'done',`stage ${stage} failed`);break}
      if(s.word){await page.locator('#answerInput').fill(s.word);await page.locator('#answerInput').press('Enter')}
      await page.waitForTimeout(250);
    }
    const result=await page.evaluate(()=>({outcome:state.outcome,correct:state.correct,attempts:state.attempts,hp:state.hp,attacks:state.bossAttackCount}));
    assert.equal(result.outcome,'done');assert.equal(waves.size,4);assert.equal(phases.size,3);assert.deepEqual(errors,[]);
    assert.ok(result.correct>=minimum[stage],`Stage ${stage} cannot settle in GAS: ${result.correct} < ${minimum[stage]}`);
    const report={stage,status:'passed',durationMs:Date.now()-start,waves:[...waves],phases:[...phases],...result};reports.push(report);console.log(JSON.stringify(report));
  }catch(error){reports.push({stage,status:'failed',error:String(error),errors,durationMs:Date.now()-start});console.error(stage,String(error))}
  finally{await context.close();fs.writeFileSync(path.join(out,'results.json'),JSON.stringify(reports,null,2))}
}
try{await Promise.all(Array.from({length:8},(_,i)=>run(i+1)))}finally{await browser.close()}
if(reports.some(r=>r.status!=='passed'))process.exitCode=1;
