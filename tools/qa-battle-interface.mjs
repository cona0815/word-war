import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);
const {chromium}=require('C:/Users/cona0/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const browser=await chromium.launch({channel:'chrome',headless:true});
const out='docs/qa-battle-interface';fs.mkdirSync(out,{recursive:true});
try{
 const page=await browser.newPage({viewport:{width:1366,height:768}}),errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 await page.goto((process.argv[2]||'http://127.0.0.1:8767')+'/index.html?gm=1');
 await page.locator('#gmPassword').fill('0088');await page.locator('#gmLogin button').click();
 await page.locator('#gmLevel').selectOption('8');await page.locator('#gmWeapon').selectOption('shadow');await page.locator('#gmBoss').click();
 await page.waitForFunction(()=>state.running&&!document.querySelector('#gmPanel').open);
 await page.evaluate(()=>{clearInterval(state.tick);hud()});
 assert.match(await page.locator('.battle-identity strong').textContent(),/Lv.8/);
 assert.equal(await page.locator('.battle-progress li').count(),7);
 assert.equal(await page.locator('.battle-progress [aria-current]').getAttribute('aria-label'),'Boss 階段 1');
 await page.locator('.ultimate-actions button').nth(0).click();
 assert.equal(await page.evaluate(()=>UltimateBattle.snapshot().armed),true);
 await page.locator('.ultimate-actions button').nth(2).click();
 assert.equal(await page.evaluate(()=>UltimateBattle.snapshot().armed),false);
 await page.evaluate(()=>UltimateBattle.gmFill());await page.locator('.ultimate-actions button').nth(0).click();
 assert.equal(await page.locator('.ultimate-actions button').nth(1).isEnabled(),true);
 await page.locator('.ultimate-actions button').nth(1).click();
 await page.waitForFunction(()=>!UltimateBattle.snapshot().busy&&UltimateBattle.snapshot().energy===0);
 for(const [width,height] of [[1366,768],[800,844],[390,844],[320,844],[1024,600],[800,600],[640,480]]){
   await page.setViewportSize({width,height});
   await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
   await page.evaluate(async()=>{await BattleGround.align();hud()});
   const safe=await page.evaluate(()=>{
     const rect=e=>e.getBoundingClientRect();
     return [...document.querySelectorAll('.ultimate-actions button,#battleItems button,#answerInput,#attackBtn')].every(e=>{const r=rect(e);return r.left>=0&&r.right<=innerWidth&&r.top>=0&&r.bottom<=innerHeight});
   });assert.equal(safe,true,`controls ${width}`);
   if(width>600)assert.equal(await page.locator('#battleItems').evaluate(e=>e.getBoundingClientRect().left>innerWidth/2),true,`items belong on right at ${width}x${height}`);
   await page.screenshot({path:`${out}/${width}-${height}.png`});
   assert.equal(await page.locator('.boss-tag').evaluate(e=>{const r=e.getBoundingClientRect();return r.top>=0&&r.bottom<=innerHeight}),true,'Boss title visible');
   assert.deepEqual(await page.evaluate(()=>{
     const buttons=[...document.querySelectorAll('.ultimate-actions button,#battleItems button,#answerInput,#attackBtn')];
     return buttons.flatMap((a,i)=>buttons.slice(i+1).filter(b=>{const r=a.getBoundingClientRect(),s=b.getBoundingClientRect();return Math.min(r.right,s.right)>Math.max(r.left,s.left)&&Math.min(r.bottom,s.bottom)>Math.max(r.top,s.top)}).map(b=>[a.textContent||a.id,b.textContent||b.id]));
   }),[],`overlapping controls ${width}x${height}`);
 }
 await page.locator('#menuBtn').click();assert.equal(await page.locator('#drawer').evaluate(e=>e.classList.contains('open')),true);
 await page.evaluate(()=>{state.levelIndex=8;state.bossPhase=5;hud()});
 assert.equal(await page.locator('.battle-progress li').count(),9);
 assert.equal(await page.locator('.battle-progress [aria-current]').getAttribute('aria-label'),'Boss 階段 5');
 assert.deepEqual(errors,[]);console.log('PASS RPG identity, phase timeline, charge/cancel/release, menu and seven viewport controls');
}finally{await browser.close()}
