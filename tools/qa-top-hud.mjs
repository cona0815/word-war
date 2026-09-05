import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);
const {chromium}=require('C:/Users/cona0/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const browser=await chromium.launch({channel:'chrome',headless:true});
const out='docs/qa-top-hud';fs.mkdirSync(out,{recursive:true});
const results=[],errors=[];
try{
  const page=await browser.newPage();page.on('pageerror',e=>errors.push(e.message));
  await page.goto((process.argv[2]||'http://127.0.0.1:8767')+'/index.html?qa=visual');
  await page.locator('#accountInput').fill('50101');
  await page.locator('#passwordInput').fill('50101');
  await page.locator('#startBtn').click();
  await page.waitForFunction(()=>!gameScreen.classList.contains('hidden'));
  for(const width of [320,390,600,800,1366,1920]){
    await page.setViewportSize({width,height:844});
    for(let stage=0;stage<9;stage++){
      const result=await page.evaluate(index=>{
        state.profile.gems=Array(8).fill(true);begin(index);clearInterval(state.tick);mission.classList.add('hidden');
        state.score=1234567;state.combo=100;hud();
        const rect=e=>e.getBoundingClientRect(),cards=[...document.querySelectorAll('.hud-card')],menu=rect(menuBtn);
        const overlap=(a,b)=>a.left<b.right&&a.right>b.left&&a.top<b.bottom&&a.bottom>b.top;
        return {stage:index+1,inBounds:cards.every(e=>{const r=rect(e);return r.left>=0&&r.right<=innerWidth}),
          menuClear:cards.every(e=>!overlap(rect(e),menu)),
          contentFits:cards.every(e=>e.scrollWidth<=e.clientWidth+1),
          statsAligned:innerWidth>600||cards.slice(2).every(e=>Math.abs(rect(e).top-rect(cards[1]).top)<1)};
      },stage);
      for(const key of ['inBounds','menuClear','contentFits','statsAligned'])assert.equal(result[key],true,JSON.stringify({width,...result}));
      results.push({width,...result});
      if(stage===7)await page.screenshot({path:`${out}/${width}.png`});
    }
  }
  assert.deepEqual(errors,[]);fs.writeFileSync(`${out}/results.json`,JSON.stringify({results,errors},null,2));
  console.log(`${results.length} stage/viewport HUD checks passed`);
}finally{await browser.close();}
