import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);
const {chromium}=require('C:/Users/cona0/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const browser=await chromium.launch({channel:'chrome',headless:true});
try{
 const page=await browser.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto((process.argv[2]||'http://127.0.0.1:8767')+'/index.html?gm=1');
 const before=await page.evaluate(()=>JSON.stringify(localStorage));
 await page.locator('#gmPassword').fill('wrong');await page.locator('#gmLogin button').click();assert.equal(await page.evaluate(()=>GMMode.active),false);
 await page.locator('#gmPassword').fill('0088');await page.locator('#gmLogin button').click();assert.equal(await page.evaluate(()=>GMMode.active),true);
 assert.deepEqual(await page.locator('#gmLevel option').evaluateAll(options=>options.map(o=>o.value)),Array.from({length:10},(_,i)=>String(i+1)));
 assert.match(await page.locator('#gmLevel option').last().textContent(),/最高等級/);
 await page.locator('#gmHero').selectOption('female');await page.locator('#gmLevel').selectOption('4');await page.locator('#gmWeapon').selectOption('fire');
 for(let i=0;i<9;i++){
  if(i)await page.locator('#gmToggle').click();
  await page.locator('#gmStage').selectOption(String(i));await page.locator('#gmPhase').selectOption('3');await page.locator('#gmBoss').click();
  await page.waitForFunction(()=>!document.querySelector('#gmPanel').open);
  assert.deepEqual(await page.evaluate(()=>[state.levelIndex,state.bossMode,state.bossPhase,state.profile.level,state.profile.weapon]),[i,true,3,4,'fire']);
 }
 await page.locator('#gmToggle').click();await page.locator('#gmFill').click();assert.equal(await page.evaluate(()=>UltimateBattle.snapshot().energy),100);
 await page.locator('#gmStart').click();await page.waitForFunction(()=>!document.querySelector('#gmPanel').open);assert.equal(await page.evaluate(()=>state.bossMode),false);
 for(const level of ['1','10']){
  await page.locator('#gmToggle').click();await page.locator('#gmLevel').selectOption(level);
  await page.locator('#gmStage').selectOption('0');await page.locator('#gmStart').click();
  await page.waitForFunction(()=>!document.querySelector('#gmPanel').open);
  assert.equal(await page.evaluate(()=>state.profile.level),Number(level));
 }
 assert.equal(await page.evaluate(()=>JSON.stringify(localStorage)),before);assert.deepEqual(errors,[]);
 console.log('PASS GM password, nine bosses, level/weapon, energy, regular stage, no storage writes');
}finally{await browser.close()}
