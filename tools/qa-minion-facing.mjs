import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
const {chromium}=createRequire(import.meta.url)('C:/Users/cona0/AppData/Local/npm-cache/_npx/e41f203b7505f1fb/node_modules/playwright');
const browser=await chromium.launch({channel:'chrome',headless:true});
try{
  const page=await browser.newPage({viewport:{width:1440,height:1000}}),errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  await page.route('https://**/*',r=>r.abort());
  await page.addInitScript(()=>sessionStorage.setItem('word-war-opening-v1','seen'));
  await page.goto('http://127.0.0.1:8767/');await page.locator('#guestStartBtn').click();
  await page.waitForFunction(()=>state.running);await page.evaluate(()=>clearInterval(state.tick));
  const result=await page.evaluate(async()=>{
    const points=[[15,20],[15,50],[15,80],[50,20],[85,20],[85,50],[85,80],[50,85]],source='assets/generated/letter-monster-Q.png';
    const facing=points.map(([x,y])=>MinionFacing.resolve({x,y},source));
    await Promise.all(Object.values(MinionFacing.directions).map(async src=>{const image=new Image();image.src=src;await image.decode()}));
    for(const name of Object.keys(MinionFacing.families))for(const [x,y] of points){const view=MinionFacing.resolve({x,y},`assets/generated/${name}.png`);if(view.mirror!==1)throw new Error('Directional art mirrored');const image=new Image();image.src=view.source;await image.decode();}
    return facing;
  });
  assert.deepEqual(result.map(r=>r.facing),['right','right','right','down','left','left','left','up']);
  assert.equal(result[0].mirror,-1);assert.equal(result[4].mirror,1);
  assert.ok(result[3].source.endsWith('idle-1.png'));assert.ok(result[7].source.endsWith('idle-2.png'));
  // Render eight separate snapshots, bypassing crowd limit only for QA presentation.
  const positions=[[15,20],[15,50],[15,80],[50,20],[85,20],[85,50],[85,80],[50,85]];
  for(let i=0;i<positions.length;i++){
    await page.evaluate(([x,y])=>{state.enemies=[{word:'Q',x,y,alive:true,hp:100,order:0,spawnLane:'qa',activeAt:Date.now(),spawnAt:0}];render()},positions[i]);
    await page.waitForTimeout(80);await page.evaluate(()=>render());
    const node=page.locator('.enemy');
    assert.equal(await node.getAttribute('data-facing'),result[i].facing);
    assert.equal(await node.locator('.tag').evaluate(n=>getComputedStyle(n).transform.includes('-1,')),false);
    await node.locator('img').evaluate(image=>image.decode());
  }
  await page.screenshot({path:'docs/minion-facing-up.png'});
  await page.evaluate(()=>{state.enemies=[{word:'Q',x:15,y:50,alive:true,hp:100,order:0,spawnLane:'qa',activeAt:Date.now(),spawnAt:0}];render()});
  await page.screenshot({path:'docs/minion-facing-left.png'});
  assert.deepEqual(errors,[]);
  console.log('PASS eight direction resolutions, four PNG decodes, eight live renders, labels unmirrored, no JS errors');
}finally{await browser.close()}
