import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);
const {chromium}=require('C:/Users/cona0/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const browser=await chromium.launch({channel:'chrome',headless:true});
try{
 const page=await browser.newPage();
 await page.goto((process.argv[2]||'http://127.0.0.1:8767')+'/index.html?gm=1');
 await page.locator('#gmPassword').fill('0088');await page.locator('#gmLogin button').click();await page.locator('#gmStart').click();
 await page.waitForFunction(()=>state.running&&!document.querySelector('#gmPanel').open);
 assert.equal(await page.locator('#heroGear').evaluate(e=>getComputedStyle(e).display),'none','no passive aura');
 assert.equal(await page.evaluate(()=>parseFloat(getComputedStyle(gameScreen).getPropertyValue('--hero-x'))),50,'normal battle centered');
 await page.evaluate(async()=>{
   clearInterval(state.tick);state.config.gasUrl='';state.auth=null;
   Consumables.reset();state.profile.inventory.items={potion:2,shield:2,hourglass:2,hint:2,comboStar:2};await Consumables.prepare();
   state.hp=50;state.levelIndex=0;state.bossMode=true;state.current={word:'A',boss:true};hud();
 });
 await page.locator('#answerInput').focus();await page.keyboard.press('1');
 assert.equal(await page.locator('#gameScreen').getAttribute('data-aura'),'heal');
 assert.equal(await page.evaluate(()=>state.hp),75);
 assert.equal(await page.evaluate(()=>state.profile.inventory.items.potion),1);
 await page.keyboard.press('1');assert.equal(await page.evaluate(()=>state.profile.inventory.items.potion),1);
 await page.evaluate(()=>answerInput.dispatchEvent(new KeyboardEvent('keydown',{key:'2',repeat:true,bubbles:true,cancelable:true})));
 assert.equal(await page.evaluate(()=>state.profile.inventory.items.shield),2);
 for(const stage of [2,3,4,5,7,8]){
   await page.evaluate(stage=>{state.levelIndex=stage;state.current={word:'測試',boss:true};answerInput.value=''},stage);
   await page.keyboard.press('2');assert.equal(await page.evaluate(()=>state.profile.inventory.items.shield),2);
 }
 await page.evaluate(()=>{state.levelIndex=6;state.current={word:'I have 2 pens.',boss:true};answerInput.value=''});
 await page.keyboard.press('2');assert.equal(await page.locator('#answerInput').inputValue(),'2');
 await page.evaluate(()=>{state.levelIndex=0;state.current={word:'A',boss:true};answerInput.value='';composing=true});
 await page.keyboard.press('2');assert.equal(await page.evaluate(()=>state.profile.inventory.items.shield),2);
 await page.evaluate(()=>{composing=false;drawer.classList.add('open')});
 await page.keyboard.press('2');assert.equal(await page.evaluate(()=>state.profile.inventory.items.shield),2);
 await page.evaluate(()=>{drawer.classList.remove('open');answerInput.value=''});
 await page.locator('#answerInput').focus();await page.keyboard.press('2');
 assert.equal(await page.evaluate(()=>state.profile.inventory.items.shield),1);
 assert.equal(await page.evaluate(()=>Consumables.inspect().shield),true);
 await page.waitForTimeout(1300);await page.evaluate(()=>hud());
 assert.equal(await page.locator('#gameScreen').getAttribute('data-aura'),'shield');
 await page.evaluate(()=>{UltimateBattle.gmFill();UltimateBattle.charge()});await page.keyboard.press('5');
 await page.waitForFunction(()=>!UltimateBattle.snapshot().busy&&UltimateBattle.snapshot().energy===0);
 assert.equal(await page.locator('#answerInput').inputValue(),'');
 console.log('PASS real local potion/shield consumption, repeated key, six Chinese stages, numeric sentence, IME, menu and ultimate shortcut');
}finally{await browser.close()}
