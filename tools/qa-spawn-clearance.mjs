import fs from 'node:fs';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);
const {chromium}=require('C:/Users/cona0/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const browser=await chromium.launch({channel:'chrome',headless:true});
try{
 const page=await browser.newPage({viewport:{width:1366,height:768}});
 await page.goto((process.argv[2]||'http://127.0.0.1:8767')+'/index.html?test=spawn-clearance');
 await page.locator('#accountInput').fill('99099');await page.locator('#passwordInput').fill('99099');await page.locator('#startBtn').click();
 await page.waitForFunction(()=>!gameScreen.classList.contains('hidden'));
 const repeat=await page.evaluate(()=>{
   const seen={},lv=levels[4];return Array.from({length:16},(_,i)=>pos(lv,'\u6821',i,seen));
 });
 for(const p of repeat)assert.deepEqual(p,repeat[0],'Queued same-key spawns must retain the same outer entry');
 const queue=await page.evaluate(()=>{
   state.levelIndex=4;state.bossMode=false;const word='\u6821',lane=spawnLaneKey(word);
   state.enemies=Array.from({length:16},(_,order)=>({...pos(levels[4],word,order),word,order,alive:true,spawnAt:0,laneKey:lane,spawnLane:lane}));
   const counts=[];
   for(const enemy of state.enemies){render();counts.push(enemyLayer.querySelectorAll('.enemy').length);enemy.alive=false;}
   return counts;
 });
 assert.ok(queue.every(n=>n===1),'Same-lane queue must show exactly one enemy at a time');
 const rows=[];
 for(const viewport of [{width:1366,height:768},{width:800,height:900},{width:390,height:844},{width:320,height:740}]){
 await page.setViewportSize(viewport);
 const measured=await page.evaluate(async()=>{
   state.profile.gems=Array(8).fill(true);const rows=[];
   for(let i=0;i<8;i++){
     begin(i);mission.classList.add('hidden');await prepareBattleVisuals();await BattleGround.align();
     const lv=levels[i];
     for(const words of buildWaves(lv)){
      const seen={};let order=0;
      for(const word of words){
       const p=pos(lv,word,order,seen);state.enemies=[{...p,word,order:order++,alive:true,spawnAt:0}];
       const before=dist(state.enemies[0]);render();
       await Promise.all([...enemyLayer.querySelectorAll('img')].map(img=>img.decode()));
       EnemySafeArea.layout();
       const e=state.enemies[0];rows.push({stage:i+1,word,before,after:dist(e),x:e.x,y:e.y,hero:heroPoint()});
      }
     }
   }return rows;
 });
 rows.push(...measured.map(r=>({...r,viewport})));
 await page.evaluate(async()=>{
   begin(1);mission.classList.add('hidden');await prepareBattleVisuals();await BattleGround.align();
   state.enemies=[{...pos(levels[1],'book',0),word:'book',order:0,alive:true,spawnAt:0}];render();
   await Promise.all([...enemyLayer.querySelectorAll('img')].map(img=>img.decode()));EnemySafeArea.layout();
 });
 fs.mkdirSync('docs/qa-spawn-clearance',{recursive:true});
 await page.screenshot({path:`docs/qa-spawn-clearance/${viewport.width}.png`});
 }
 fs.mkdirSync('docs/qa-spawn-clearance',{recursive:true});fs.writeFileSync('docs/qa-spawn-clearance/results.json',JSON.stringify(rows,null,2));
 const unsafe=rows.filter(r=>r.after<8);console.log(JSON.stringify({checked:rows.length,unsafe},null,2));
 if(unsafe.length)process.exitCode=1;
}finally{await browser.close();}
