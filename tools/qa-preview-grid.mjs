import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);
const {chromium}=require('C:/Users/cona0/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const browser=await chromium.launch({channel:'chrome',headless:true});
let checked=0;
try{
 const page=await browser.newPage();const errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 await page.goto((process.argv[2]||'http://127.0.0.1:8767')+'/hero-preview.html');
 for(const width of [1366,390]){
  await page.setViewportSize({width,height:844});
  for(const gender of ['male','female'])for(const weapon of ['starlight','ice','fire','thunder','shadow']){
   await page.locator('#'+gender+'Btn').click();await page.locator(`[data-w="${weapon}"]`).click();
   await page.waitForFunction(({gender,weapon})=>[...grid.querySelectorAll('[data-lv]')].every(c=>{
    const clip=HeroCastClips[`${gender}:${c.dataset.lv}:${weapon}`];
    return !clip||c.querySelector('.sprite').dataset.clipIdle===clip.url.replace(/cast-strip\.png$/,'idle.png');
   }),{gender,weapon});
   const results=await page.evaluate(async({gender,weapon})=>Promise.all([...grid.querySelectorAll('[data-lv]')].map(async c=>{
    const el=c.querySelector('.sprite'),clip=HeroCastClips[`${gender}:${c.dataset.lv}:${weapon}`];
    const r={level:c.dataset.lv,reviewed:!!clip,hasIdle:!!el.dataset.clipIdle};
    if(!clip)return r;
    const im=new Image();im.src=el.dataset.clipIdle;await im.decode();
    const canvas=document.createElement('canvas');canvas.width=im.width;canvas.height=im.height;
    const ctx=canvas.getContext('2d');ctx.drawImage(im,0,0);const data=ctx.getImageData(0,0,im.width,im.height).data;
    let min=im.width,max=0;for(let i=3;i<data.length;i+=4)if(data[i]>128){const x=((i-3)/4)%im.width;min=Math.min(min,x);max=Math.max(max,x)}
    const scale=parseFloat(getComputedStyle(el).backgroundSize.split(' ')[1])/im.height,offset=(el.clientWidth-im.width*scale)/2;
    const box=el.getBoundingClientRect(),card=c.getBoundingClientRect();
    return {...r,face:el.style.getPropertyValue('--face'),left:offset+min*scale,right:offset+(max+1)*scale,width:el.clientWidth,cardLeft:box.left+offset+min*scale-card.left,cardRight:box.left+offset+(max+1)*scale-card.left,cardWidth:card.width};
   })),{gender,weapon});
   for(const r of results){assert.equal(r.hasIdle,r.reviewed);if(r.reviewed){assert.equal(r.face,'1');assert.ok(r.left>=0&&r.right<=r.width&&r.cardLeft>=0&&r.cardRight<=r.cardWidth,JSON.stringify(r))}checked++}
  }
 }
 assert.deepEqual(errors,[]);fs.mkdirSync('docs/qa-preview-grid',{recursive:true});
 await page.locator('[data-w="starlight"]').click();
 await page.waitForFunction(()=>grid.querySelectorAll('[data-clip-idle]').length===6);
 await page.locator('[data-lv="4"]').scrollIntoViewIfNeeded();
 await page.screenshot({path:'docs/qa-preview-grid/mobile.png'});
 console.log(`PASS ${checked} level cards: matching assets, canonical facing and no opaque clipping`);
}finally{await browser.close()}
