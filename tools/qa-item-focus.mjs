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
 const results=await page.evaluate(async()=>{
   clearInterval(state.tick);
   const original=gasPost,config=state.config,auth=state.auth,results=[];
   try{
     for(const mode of ['battle','drawer','mission','gm'])for(const failed of [false,true]){
       state.config={};state.auth=null;Consumables.reset();await Consumables.prepare();
       state.running=true;state.hp=50;state.profile.inventory.items.potion=1;
       mission.classList.add('hidden');drawer.classList.remove('open');
       const gm=document.querySelector('#gmPanel');if(gm.open)gm.close();
       state.config={gasUrl:'https://test.invalid'};state.auth={sessionToken:'mock'};
       let release;gasPost=()=>new Promise(resolve=>release=resolve);
       const pending=Consumables.use('potion');
       let expected=answerInput;
       if(mode==='drawer'){drawer.classList.add('open');expected=closeMenuBtn}
       if(mode==='mission'){state.running=false;mission.classList.remove('hidden');expected=missionStartBtn}
       if(mode==='gm'){gm.showModal();expected=document.querySelector('#gmStart')}
       expected.focus();
       release(failed?{ok:false,error:'測試失敗'}:{ok:true,profile:{...state.profile,accountId:state.profile.account}});
       await pending;
       results.push({mode,failed,retained:document.activeElement===expected,busy:Consumables.inspect().busy});
     }
   }finally{gasPost=original;state.config=config;state.auth=auth}
   return results;
 });
 for(const r of results){assert.equal(r.retained,true,JSON.stringify(r));assert.equal(r.busy,false)}
 console.log('PASS 8 delayed item responses preserve battle/menu/result/GM focus on success and failure');
}finally{await browser.close()}
