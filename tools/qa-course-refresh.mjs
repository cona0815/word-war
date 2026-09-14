import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);
const {chromium}=require('C:/Users/cona0/AppData/Local/npm-cache/_npx/e41f203b7505f1fb/node_modules/playwright');
const base=process.argv[2]||'http://127.0.0.1:8767/';
const browser=await chromium.launch({channel:'chrome',headless:true});
const results=[];function check(label,value){assert.ok(value,label);results.push(label);console.log('PASS '+label)}
try{
 const page=await browser.newPage({viewport:{width:1440,height:1000}}),errors=[];
 page.on('pageerror',e=>{errors.push(e.message);console.error(e.message)});
 await page.route('https://**/*',route=>route.abort());
 await page.addInitScript(()=>localStorage.setItem('word-war-core-config',JSON.stringify({gasUrl:'',adminToken:''})));
 await page.goto(base);
 await page.waitForFunction(()=>typeof CourseContent!=='undefined'&&document.querySelector('#openingDialog'));
 await page.locator('#openingSkip').click();
 check('開場可略過，影片暫停',await page.evaluate(()=>!openingDialog.open&&openingVideo.paused));
 await page.locator('#openingReplay').click();
 await page.waitForFunction(()=>openingVideo.currentTime>.1,null,{timeout:15000});
 check('開場可實際解碼播放、有聲重播',await page.evaluate(()=>openingVideo.videoWidth===1280&&!openingVideo.muted));
 await page.screenshot({path:'docs/qa-course-opening.png'});
 await page.locator('#openingSkip').click();
 await page.reload();check('同分頁重整不重播',await page.evaluate(()=>!openingDialog.open));
 await page.locator('#accountInput').fill('99099');await page.locator('#passwordInput').fill('99099');await page.locator('#startBtn').click();
 await page.waitForFunction(()=>!gameScreen.classList.contains('hidden'));
 const course=await page.evaluate(()=>{
  state.questions=[{stage:7,mode:'en',answer:'I like cats.',difficulty:1,enabled:true},{stage:8,mode:'zh',answer:'我會打字。',difficulty:1,enabled:true},{stage:7,mode:'en',answer:'This intentionally long sentence must never be used inside a foundational campus stage.',difficulty:5,enabled:true}];
  return levels.slice(0,8).map(lv=>({id:lv.id,mode:lv.mode,waves:buildWaves(lv),pool:levelWords(lv),boss:[1,2,3].map(phase=>{state.bossPhase=phase;return bossPool(lv)}),missing:lv.words.filter(w=>!keyPos(w)),speed:lv.speed}));
 });
 check('八關小兵與三階段 Boss 都沒有句子',course.every(l=>l.pool.concat(l.boss.flat()).every(w=>!/[A-Za-z]{2,} [A-Za-z]+|[\u4e00-\u9fff]{2,}[。？！]/.test(w))));
 check('第七關只有 2–6 字母英文單字',course[6].pool.every(w=>/^[a-z]{2,6}$/.test(w)));
 check('第八關只有 2–4 字中文詞語',course[7].pool.every(w=>/^[\u4e00-\u9fff]{2,4}$/.test(w)));
 check('八關四波配額固定，題庫多樣化不拉長波次',course.every(l=>l.waves.length===4&&l.waves.every(w=>w.length<=11)));
 check('所有新題目有鍵盤方向',course.every(l=>l.missing.length===0));
 check('後續關卡移動速度逐關增加',course.every((l,i)=>!i||l.speed>course[i-1].speed));
 check('老師簡單句子只供大橋堂第五階段',await page.evaluate(()=>{state.bossPhase=5;const p=bossPool(levels[8]);return p.includes('I like cats.')&&p.includes('我會打字。')&&!p.some(w=>w.includes('intentionally'))}));
 const progression=await page.evaluate(()=>{
  state.config.gasUrl='';state.profile.level=1;state.profile.xp=0;state.profile.gems=[];state.correct=40;const levelsAfter=[];
  for(const lv of levels.slice(0,8)){grantLocalStageReward(lv,100);state.profile.gems[lv.id-1]=true;levelsAfter.push(state.profile.level)}
  for(let i=0;i<30;i++)grantLocalStageReward(levels[0],100);
  return {levelsAfter,repeat:state.profile.level};
 });
 check('首次通關等級 2/3/4/5/6/7/7/7',JSON.stringify(progression.levelsAfter)==='[2,3,4,5,6,7,7,7]');
 check('重打刷 XP 不能超過主線 Lv.7',progression.repeat===7);
 await page.evaluate(()=>{begin(6);mission.classList.add('hidden');spawn();clearInterval(state.tick);const now=Date.now();state.enemies=[{id:'a',word:'cat',x:9,y:30,alive:true,hp:100,order:0,spawnLane:'left',spawnAt:now},{id:'b',word:'bird',x:90,y:25,alive:true,hp:100,order:1,spawnLane:'right',spawnAt:now},{id:'c',word:'dog',x:9,y:65,alive:true,hp:100,order:2,spawnLane:'left-bottom',spawnAt:now},{id:'d',word:'egg',x:85,y:72,alive:true,hp:100,order:3,spawnLane:'right-bottom',spawnAt:now},{id:'e',word:'fish',x:50,y:12,alive:true,hp:100,order:4,spawnLane:'top',spawnAt:now}];render()});
 check('後段可同時四隻且不超額',await page.evaluate(()=>activeEnemies().length===4));
 // Gain energy through real submission hook; no GM fill in normal mode.
 await page.evaluate(()=>{for(let i=0;i<10;i++){state.enemies.push({word:'QA',x:50,y:20,alive:true,hp:100,order:100+i,activeAt:Date.now(),spawnLane:'qa'});submit('QA')}});
 await page.waitForTimeout(2500);
 await page.evaluate(()=>{state.enemies=state.enemies.filter(e=>e.word!=='QA');render();UltimateBattle.charge()});
 check('答對十題可累積大招能量',await page.evaluate(()=>UltimateBattle.snapshot().energy===100));
 const damage=await page.evaluate(async()=>{const correct=state.correct,before=activeEnemies().map(e=>e.hp);await UltimateBattle.release();return{before,after:state.enemies.filter(e=>e.activeAt).map(e=>e.hp),correctUnchanged:correct===state.correct}});
 check('大招扣小兵血量，不虛增正確題數',damage.after.length>=4&&damage.after.every(h=>h<100)&&damage.correctUnchanged);
 await page.screenshot({path:'docs/qa-course-battle.png'});
 // Use a fresh QA-only browser to test phase boundary and kill deterministically.
 await page.goto(base+'?qa=visual');
 await page.evaluate(()=>{loginScreen.classList.add('hidden');gameScreen.classList.remove('hidden')});
 await page.evaluate(()=>{state.profile.gems=Array(8).fill(true);state.profile.level=7;state.config.gasUrl='';begin(0);mission.classList.add('hidden');state.running=true;boss();state.bossHp=Math.floor(state.maxBossHp*.67);for(let i=0;i<10;i++){const prior=cast;cast=()=>{};state.current.pending=false;submit(state.current.word);cast=prior}state.current.pending=false;UltimateBattle.charge()});
 const bossResult=await page.evaluate(async()=>{const before=state.bossHp;await UltimateBattle.release();return{before,hp:state.bossHp,phase:state.bossPhase}});
 check('Boss 階段下限仍扣血並切換階段',bossResult.hp<bossResult.before&&bossResult.phase===2);
 // Standalone tone key and real Chinese composition must remain distinct.
 await page.evaluate(()=>{begin(3);mission.classList.add('hidden');state.running=true;state.enemies=[{word:'ˇ',alive:true,hp:100,x:50,y:12,order:0,spawnLane:'tone',activeAt:Date.now()}];render();answerInput.focus()});
 await page.keyboard.press('3');
 check('單聲調可用注音實體鍵位事件作答',await page.evaluate(()=>state.correct===1));
 await page.evaluate(()=>{begin(7);mission.classList.add('hidden');state.running=true;state.enemies=[{word:'學校',alive:true,hp:100,x:15,y:70,order:0,spawnLane:'left',activeAt:Date.now()}];render();answerInput.focus();answerInput.dispatchEvent(new CompositionEvent('compositionstart',{bubbles:true}));answerInput.dispatchEvent(new KeyboardEvent('keydown',{key:'Enter',isComposing:true,bubbles:true}))});
 check('中文組字 Enter 不提早攻擊',await page.evaluate(()=>state.attempts===0));
 await page.evaluate(()=>{answerInput.value='學校';answerInput.dispatchEvent(new CompositionEvent('compositionend',{bubbles:true}))});await page.keyboard.press('Enter');
 check('中文詞語完成組字後 Enter 正常作答',await page.evaluate(()=>state.correct===1));
 await page.evaluate(()=>{begin(5);mission.classList.add('hidden');state.running=true;state.enemies=[{word:'複製 Ctrl+C',alive:true,hp:100,x:50,y:85,order:0,spawnLane:'bottom',activeAt:Date.now()}];render();answerInput.focus()});
 await page.keyboard.press('Control+c');
 check('熱鍵題優先於大招集氣',await page.evaluate(()=>state.correct===1&&!UltimateBattle.snapshot().armed));
 // Fast gameplay exercises all waves, ultimates and final boss deaths through production paths.
 await page.addInitScript(()=>window.__WORD_WAR_QA_RUNNING__=true);
 await page.emulateMedia({reducedMotion:'reduce'});
 await page.goto(base+'?qa=full');
 const clears=await page.evaluate(async()=>{
   state.config.gasUrl='';state.profile.gems=[];state.profile.level=1;const results=[];
   for(let i=0;i<8;i++){
     begin(i);mission.classList.add('hidden');spawn();clearInterval(state.tick);let uses=0;const until=Date.now()+20000;
     while(state.running&&Date.now()<until){
       if(UltimateBattle.snapshot().energy===100&&!state.current?.pending){UltimateBattle.charge();await UltimateBattle.release();uses++}
       if(!state.running)break;
       const target=state.bossMode?state.current:activeEnemies().find(e=>!e.pending);
       if(target&&!target.pending)submit(target.word);
       await new Promise(r=>setTimeout(r,5));
     }
     results.push({stage:i+1,done:state.outcome==='done',correct:state.correct,level:state.profile.level,uses});
   }
   return results;
 });
 const minimum=[44,32,36,32,28,24,32,24];
 check('八關使用大招完整通關，符合雲端最低題数',clears.every((r,i)=>r.done&&r.correct>=minimum[i]&&r.uses>0));
 const ladder=await page.evaluate(async()=>{
   begin(8);mission.classList.add('hidden');spawn();clearInterval(state.tick);const results=[];
   for(let floor=1;floor<=5;floor++){
     const until=Date.now()+15000;
     while(state.running&&Date.now()<until){const target=state.bossMode?state.current:activeEnemies().find(e=>!e.pending);if(target&&!target.pending)submit(target.word);await new Promise(r=>setTimeout(r,5))}
     results.push({floor,done:state.outcome==='done',level:state.profile.level});
     if(floor<5){document.querySelector('#ladderNextFloor').click();clearInterval(state.tick)}
   }
   return results;
 });
 check('大橋堂完整五層通關，Lv.8/8/9/9/10',ladder.every(r=>r.done)&&JSON.stringify(ladder.map(r=>r.level))==='[8,8,9,9,10]');
 check('瀏覽器沒有 JS 錯誤',errors.length===0);
 fs.writeFileSync('docs/qa-course-refresh.json',JSON.stringify({passed:results.length,results,course,bossResult,clears,ladder},null,2));
}finally{await browser.close()}
