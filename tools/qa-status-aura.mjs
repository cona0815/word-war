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
 const result=await page.evaluate(async()=>{
   clearInterval(state.tick);const realNow=Date.now;let now=realNow();Date.now=()=>now;
   const sample=()=>{hud();return {aura:gameScreen.dataset.aura,display:getComputedStyle(heroGear).display,color:getComputedStyle(heroGear).getPropertyValue('--gear-color').trim()}};
   const records={idle:sample(),items:{}};
   try{
     for(const id of ['potion','shield','hourglass','hint','comboStar']){
       Consumables.reset();state.hp=50;state.profile.inventory.items={[id]:2};await Consumables.prepare();
       await Consumables.use(id);records.items[id]=sample();
       if(id==='potion'){
         Consumables.pause();now+=5000;records.healPaused=sample();Consumables.resume();
         now+=1201;records.healExpired=sample();
       }
       if(id==='shield'){Consumables.mistake();records.shieldSpent=sample()}
       if(id==='hourglass'||id==='hint'){now+=10001;records.items[id].expired=sample()}
     }
     Consumables.reset();UltimateBattle.charge();records.charge=sample();UltimateBattle.cancel();records.cancel=sample();
     hero.classList.add('casting');records.cast=sample();hero.classList.remove('casting');
     records.afterCast=sample();
     state.running=false;records.finished=sample();
     return records;
   }finally{Date.now=realNow}
 });
 assert.equal(result.idle.display,'none');
 const expected={potion:['heal','#66e896'],shield:['shield','#ffce64'],hourglass:['slow','#7d9fff'],hint:['hint','#63eadc'],comboStar:['reward','#df90d7']};
 for(const [id,[aura,color]] of Object.entries(expected)){
   assert.equal(result.items[id].aura,aura,id);assert.equal(result.items[id].display,'block',id);assert.equal(result.items[id].color,color,id);
 }
 assert.equal(result.healPaused.aura,'heal');
 for(const r of [result.healExpired,result.shieldSpent,result.items.hourglass.expired,result.items.hint.expired,result.cancel,result.afterCast,result.finished])assert.equal(r.display,'none');
 assert.equal(result.charge.aura,'charge');assert.equal(result.cast.display,'block');
 console.log('PASS five item aura colors, heal pause/expiry, shield consumption, timed expiry, charge/cancel, cast and idle cleanup');
}finally{await browser.close()}
