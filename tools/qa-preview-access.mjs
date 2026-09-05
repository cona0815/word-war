import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);
const {chromium}=require('C:/Users/cona0/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const browser=await chromium.launch({channel:'chrome',headless:true});
const luminance=rgb=>rgb.map(v=>{v/=255;return v<=.04045?v/12.92:((v+.055)/1.055)**2.4}).reduce((a,v,i)=>a+v*[.2126,.7152,.0722][i],0);
const contrast=(a,b)=>{a=luminance(a);b=luminance(b);return (Math.max(a,b)+.05)/(Math.min(a,b)+.05)};
try{
 const page=await browser.newPage();
 await page.goto((process.argv[2]||'http://127.0.0.1:8767')+'/hero-preview.html');
 for(const width of [1366,390]){
  await page.setViewportSize({width,height:844});
  await page.locator('[data-lv="2"]').focus();await page.keyboard.press('Enter');
  assert.equal(await page.evaluate(()=>document.activeElement.dataset.lv),'2');
  assert.equal(await page.locator('[data-lv="2"]').getAttribute('aria-pressed'),'true');
  assert.equal(await page.locator('[data-lv="1"]').getAttribute('aria-pressed'),'false');
  await page.keyboard.press('Tab');assert.equal(await page.evaluate(()=>document.activeElement.dataset.lv),'3');
  await page.keyboard.press('Space');assert.equal(await page.evaluate(()=>document.activeElement.dataset.lv),'3');
  assert.equal(await page.locator('[data-lv="3"]').getAttribute('aria-pressed'),'true');
  const colors=await page.evaluate(()=>{
   const c=grid.querySelector('.card.active'),meta=c.querySelector('.meta');
   const rgb=el=>getComputedStyle(el).color.match(/[\d.]+/g).slice(0,3).map(Number);
   const bg=getComputedStyle(c).backgroundColor.match(/[\d.]+/g).slice(0,3).map(Number);
   return {title:rgb(meta.querySelector('strong')),body:rgb(meta.querySelector('span')),bg,outline:getComputedStyle(c).outlineWidth};
  });
  assert.ok(contrast(colors.title,colors.bg)>=4.5);assert.ok(contrast(colors.body,colors.bg)>=4.5);
  assert.equal(colors.outline,'3px');
 }
 fs.mkdirSync('docs/qa-preview-access',{recursive:true});
 await page.locator('[data-lv="3"]').scrollIntoViewIfNeeded();await page.screenshot({path:'docs/qa-preview-access/mobile.png'});
 console.log('PASS keyboard Enter/Space/Tab selection, retained focus, pressed state and text contrast');
}finally{await browser.close()}
