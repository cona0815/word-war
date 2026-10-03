import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
const {chromium}=createRequire(import.meta.url)('C:/Users/cona0/AppData/Local/npm-cache/_npx/e41f203b7505f1fb/node_modules/playwright');
const browser=await chromium.launch({channel:'chrome',headless:true});
try{
 const page=await browser.newPage({viewport:{width:1280,height:950}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.route('https://**/*',r=>r.abort());await page.goto('http://127.0.0.1:8767/divine-beasts.html');await page.waitForFunction(()=>!DivinePreview.inspect().busy);
 const count=await page.evaluate(async()=>{const paths=DivineBeasts.flatMap(b=>[...b.body.small.urls,...b.body.ultimate.urls,...b.fx.small.urls,...b.fx.ultimate.urls]);for(const src of paths){const image=new Image();image.src=src;await image.decode();if(image.naturalWidth!==512)throw new Error(src)}return paths.length});assert.equal(count,100);
 for(let i=0;i<4;i++)for(const kind of ['small','ultimate']){
   await page.selectOption('#beastSelect',String(i));await page.locator('#reset').click();await page.waitForFunction(()=>!DivinePreview.inspect().busy);
   await page.evaluate(kind=>{window.pendingAttack=DivinePreview.attack(kind)},kind);
   await page.waitForFunction(()=>document.querySelector('.spell-projectile'));
   assert.equal(await page.evaluate(()=>DivinePreview.inspect().players[0].hp),100,'No damage before impact');
   const hits=await page.evaluate(()=>pendingAttack);assert.equal(hits.length,1);
   assert.equal(await page.evaluate(()=>DivinePreview.inspect().players[0].hp),kind==='small'?90:75);
   const error=await page.evaluate(hit=>{const r=document.querySelector('[data-target-id="p1"]').getBoundingClientRect(),l=document.getElementById('effects').getBoundingClientRect();return Math.hypot(hit.x-(r.left+r.width*.5-l.left),hit.y-(r.top+r.height*.4-l.top))},hits[0]);assert.ok(error<1,'Impact matches target anchor');
 }
 await page.selectOption('#partySize','8');await page.waitForFunction(()=>!DivinePreview.inspect().busy);
 for(let i=1;i<=8;i++){
   await page.evaluate(i=>{window.pendingAttack=DivinePreview.attack('small',[`p${i}`])},i);const hits=await page.evaluate(()=>pendingAttack);assert.equal(hits[0].targetId,`p${i}`);
 }
 assert.deepEqual(await page.evaluate(()=>DivinePreview.inspect().players.map(p=>p.hp)),Array(8).fill(90));
 await page.locator('#reset').click();await page.waitForFunction(()=>!DivinePreview.inspect().busy);
 await page.evaluate(()=>{window.pendingAttack=DivinePreview.attack('ultimate',['p1','p3','p5'])});await page.waitForFunction(()=>document.querySelector('.spell-projectile'));
 await page.locator('#pause').click();await page.waitForTimeout(850);assert.deepEqual(await page.evaluate(()=>DivinePreview.inspect().players.map(p=>p.hp)),Array(8).fill(100));
 await page.locator('#pause').click();const areaHits=await page.evaluate(()=>pendingAttack);assert.deepEqual(areaHits.map(h=>h.targetId).sort(),['p1','p3','p5']);
 assert.deepEqual(await page.evaluate(()=>DivinePreview.inspect().players.map(p=>p.hp)),[75,100,75,100,75,100,100,100]);
 await page.evaluate(()=>{window.pendingAttack=DivinePreview.attack('small',['p2'])});await page.waitForFunction(()=>document.querySelector('.spell-projectile'));await page.locator('#reset').click();await page.waitForTimeout(1200);
 assert.deepEqual(await page.evaluate(()=>DivinePreview.inspect().players.map(p=>p.hp)),Array(8).fill(100),'Cancelled attack cannot hit next scene');
 await page.evaluate(()=>{window.pendingAttack=DivinePreview.attack('small',['p8'])});await page.waitForFunction(()=>document.querySelector('.spell-projectile'));
 await page.evaluate(()=>{const target=document.querySelector('[data-target-id="p8"]');target.style.left='35%';target.style.top='9%'});
 const moving=await page.evaluate(()=>pendingAttack);const movingError=await page.evaluate(hit=>{const r=document.querySelector('[data-target-id="p8"]').getBoundingClientRect(),l=document.getElementById('effects').getBoundingClientRect();return Math.hypot(hit.x-(r.left+r.width*.5-l.left),hit.y-(r.top+r.height*.4-l.top))},moving[0]);assert.ok(movingError<1,'Projectile tracks target movement');
 const limit=await page.evaluate(async()=>{try{await DivinePreview.engine.attack({caster:document.getElementById('beast'),beast:DivineBeasts[0],targets:Array.from({length:9},(_,i)=>({id:'extra'+i,element:document.querySelector('.target')}))});return false}catch(e){return e instanceof RangeError}});assert.equal(limit,true);
 await page.locator('#reset').click();await page.waitForFunction(()=>!DivinePreview.inspect().busy);
 await page.screenshot({path:'docs/super-bosses/eight-target-preview.png'});assert.deepEqual(errors,[]);
 console.log('PASS 100 frame decodes, all eight casts hit after flight, exact impact anchors, eight independent targets, multi-target impacts, pause and reset cancellation');
}finally{await browser.close()}
