import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);
const {chromium}=require('C:/Users/cona0/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const browser=await chromium.launch({channel:'chrome',headless:true});
try{
 const page=await browser.newPage({viewport:{width:1366,height:768}}),errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://127.0.0.1:8767/index.html?gm=1');
 await page.locator('#gmPassword').fill('0088');await page.locator('#gmLogin button').click();await page.locator('#gmStart').click();
 await page.waitForFunction(()=>state.running&&!document.querySelector('#gmPanel').open);
 const result=await page.evaluate(async()=>{
  clearInterval(state.tick);await Consumables.prepare();
  state.profile.inventory.items={potion:2,shield:2,hourglass:2,hint:2,comboStar:2};
  await Consumables.use('potion');const full=state.profile.inventory.items.potion;
  state.hp=60;await Consumables.use('potion');const healed=state.hp;
  await Consumables.use('potion');const remaining=state.profile.inventory.items.potion;
  await Consumables.use('shield');submit('incorrect-answer');const blocked=state.hp;submit('incorrect-answer');const second=state.hp;
  await Consumables.use('hourglass');const slow=Consumables.slowFactor();
  await Consumables.use('hint');const hint=document.querySelector('#battleItems output').textContent;
  await Consumables.use('comboStar');const star=Consumables.inspect().star;
  hud();
  return {full,healed,remaining,blocked,second,slow,hint,star};
 });
 assert.equal(result.full,2);assert.equal(result.healed,85);assert.equal(result.remaining,1);assert.equal(result.blocked,85);assert.equal(result.second,79);assert.equal(result.slow,.5);assert.ok(result.hint.includes('首鍵'));assert.equal(result.star,true);
 fs.mkdirSync('docs/qa-consumables',{recursive:true});await page.screenshot({path:'docs/qa-consumables/desktop.png'});
 await page.waitForTimeout(10100);assert.equal(await page.evaluate(()=>Consumables.slowFactor()),1);
 await page.setViewportSize({width:390,height:844});await page.screenshot({path:'docs/qa-consumables/mobile.png'});
 const mobile=await page.locator('#battleItems').evaluate(node=>{const r=node.getBoundingClientRect();return {left:r.left,right:r.right,bottom:r.bottom,width:innerWidth,height:innerHeight}});
 assert.ok(mobile.left>=0&&mobile.right<=mobile.width&&mobile.bottom<=mobile.height,JSON.stringify(mobile));
 const overlaps=await page.evaluate(()=>{const a=document.querySelector('#battleItems').getBoundingClientRect(),b=document.querySelector('#ultimateMeter').getBoundingClientRect();return a.left<b.right&&a.right>b.left&&a.top<b.bottom&&a.bottom>b.top});assert.equal(overlaps,false);
 const delayed=await page.evaluate(async()=>{
   const original=gasPost;let release;
   state.config.gasUrl='https://test.invalid';state.auth={sessionToken:'mock'};
   gasPost=payload=>payload.action==='closeItemRun'?Promise.resolve({ok:true}):new Promise(resolve=>release=resolve);
   Consumables.reset();const pending=Consumables.prepare();
   await new Promise(resolve=>setTimeout(resolve,0));
   begin(0);const before=state.profile.version;
   release({ok:true,profile:{...state.profile,accountId:state.profile.account,version:999}});await pending;
   await new Promise(resolve=>setTimeout(resolve,0));gasPost=original;state.config={};state.auth=null;
   return {before,after:state.profile.version,run:Consumables.inspect().run};
 });assert.equal(delayed.before,delayed.after);assert.equal(delayed.run,undefined);
 const accountRace=await page.evaluate(async()=>{
   await Consumables.prepare();state.running=true;mission.classList.add('hidden');state.hp=40;
   state.profile.inventory.items.potion=1;
   const old={...state.profile},original=gasPost;let release;
   state.config.gasUrl='https://test.invalid';state.auth={sessionToken:'mock'};
   gasPost=payload=>payload.action==='closeItemRun'?Promise.resolve({ok:true}):new Promise(resolve=>release=resolve);
   const pending=Consumables.use('potion');switchAccount('50102');
   const before=state.profile.version;
   release({ok:true,profile:{...old,accountId:old.account,version:999}});await pending;
   await new Promise(resolve=>setTimeout(resolve,0));gasPost=original;state.config={};state.auth=null;
   return {account:state.profile.account,hp:state.hp,before,after:state.profile.version};
 });assert.equal(accountRace.account,'50102');assert.equal(accountRace.hp,40);assert.equal(accountRace.before,accountRace.after);
 await page.evaluate(()=>begin(0));assert.equal(await page.evaluate(()=>Consumables.slowFactor()),1);assert.equal(await page.evaluate(()=>Consumables.inspect().star),false);
 assert.deepEqual(errors,[]);fs.writeFileSync('docs/qa-consumables/results.json',JSON.stringify(result,null,2));
 console.log('PASS full-health guard, healing, once-per-run, one-error shield, slow, hint, bonus and reset');
}finally{await browser.close()}
