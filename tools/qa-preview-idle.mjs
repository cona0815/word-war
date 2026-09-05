import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);
const {chromium}=require('C:/Users/cona0/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const browser=await chromium.launch({channel:'chrome',headless:true});
let count=0;
try{
 const page=await browser.newPage();
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto((process.argv[2]||'http://127.0.0.1:8767')+'/hero-preview.html');
 const keys=await page.evaluate(()=>Object.keys(HeroCastClips));
 for(const width of [1366,390]){
  await page.setViewportSize({width,height:844});
  for(const key of keys){
   const [gender,level,weapon]=key.split(':');
   await page.locator('#'+gender+'Btn').click();
   await page.locator(`[data-lv="${level}"]`).click();
   await page.locator(`[data-w="${weapon}"]`).click();
   await page.locator('#modeIdle').click();
   await page.waitForFunction(k=>big.dataset.castClip===HeroCastClips[k].url,key);
   const idle=await page.evaluate(()=>({width:big.getBoundingClientRect().width,height:big.getBoundingClientRect().height,image:getComputedStyle(big).backgroundImage,face:big.style.getPropertyValue('--face'),animations:big.getAnimations().length}));
   assert.equal(idle.animations,0);
   await page.locator('#modeCast').click();
   await page.waitForFunction(()=>big.getAnimations().length>0);
   const cast=await page.evaluate(()=>({width:big.getBoundingClientRect().width,height:big.getBoundingClientRect().height,image:getComputedStyle(big).backgroundImage,face:big.style.getPropertyValue('--face')}));
   for(const field of ['width','height','image','face'])assert.equal(cast[field],idle[field],`${key} ${width} ${field}`);
   await page.locator('#modeIdle').click();
   await page.waitForFunction(()=>!!big.dataset.castClip);
   assert.equal(await page.evaluate(()=>big.getAnimations().length),0);
   count++;
  }
 }
 assert.deepEqual(errors,[]);
 fs.mkdirSync('docs/qa-preview-idle',{recursive:true});
 await page.screenshot({path:'docs/qa-preview-idle/mobile-idle.png'});
 fs.writeFileSync('docs/qa-preview-idle/results.json',JSON.stringify({base:process.argv[2]||'local',count,errors},null,2));
 console.log(`PASS ${count} idle/cast transitions with identical image, dimensions and facing`);
}finally{await browser.close()}
