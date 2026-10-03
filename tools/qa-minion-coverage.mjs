import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {execFileSync} from 'node:child_process';
const {chromium}=createRequire(import.meta.url)('C:/Users/cona0/AppData/Local/npm-cache/_npx/e41f203b7505f1fb/node_modules/playwright');
const browser=await chromium.launch({channel:'chrome',headless:true});
try{
 const page=await browser.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.route('https://**/*',r=>r.abort());
 await page.addInitScript(()=>sessionStorage.setItem('word-war-opening-v1','seen'));
 await page.goto('http://127.0.0.1:8767/');
 const result=await page.evaluate(async()=>{
  const sources=[...new Set(levels.flatMap(l=>l.words.map(w=>MinionSprites.source(l,w))))];
  const paths=new Set();
  for(const source of sources){
   const views=[[15,50],[85,50],[50,20],[50,85]].map(([x,y])=>MinionFacing.resolve({x,y},source));
   if(views.some(v=>v.originalFacing!=='directional'||v.mirror!==1))throw new Error('Incomplete directions: '+source);
   if(new Set(views.map(v=>v.source)).size!==4)throw new Error('Repeated view: '+source);
   for(const v of views)paths.add(v.source);
  }
  for(const src of paths){const image=new Image();image.src=src;await image.decode();if(image.naturalWidth!==256||image.naturalHeight!==256)throw new Error('Wrong dimensions '+src);}
  return {sources:sources.length,frames:paths.size,paths:[...paths]};
 });
 assert.equal(result.sources,42);assert.equal(result.frames,156);assert.deepEqual(errors,[]);
 const tracked=new Set(execFileSync('git',['ls-files','-z'],{encoding:'utf8'}).split('\0'));
 assert.deepEqual(result.paths.filter(path=>!tracked.has(path)),[],'Every direction must be included in Git release');
 const missing=await browser.newPage();
 await missing.route('https://**/*',r=>r.abort());
 await missing.route('**/minion-views-v1/letter-monster-Q/idle-4.png',r=>r.fulfill({status:404,body:''}));
 await missing.addInitScript(()=>sessionStorage.setItem('word-war-opening-v1','seen'));
 await missing.goto('http://127.0.0.1:8767/');await missing.locator('#guestStartBtn').click();
 await missing.waitForFunction(()=>state.running);
 await missing.evaluate(()=>{clearInterval(state.tick);state.enemies=[{word:'Q',x:15,y:50,alive:true,hp:100,order:0,activeAt:Date.now(),spawnLane:'qa'}];render()});
 await missing.waitForTimeout(150);
 const fallback=await missing.evaluate(async()=>{render();const image=enemyLayer.querySelector('img');await image.decode();return image.src.startsWith('data:image/svg+xml,')&&enemyLayer.querySelector('.tag').textContent.includes('Q')});
 assert.equal(fallback,true);await missing.close();
 console.log('PASS all 42 runtime sources have four decodable 256px views; 156 unique frames');
}finally{await browser.close()}
