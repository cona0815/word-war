import fs from 'node:fs';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
const require = createRequire(import.meta.url);
const {chromium} = require('C:/Users/cona0/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const out = 'docs/qa-battle-ground'; fs.mkdirSync(out,{recursive:true});
const browser = await chromium.launch({channel:'chrome',headless:true});
const results = [], errors = [];
try {
  const page = await browser.newPage();
  page.on('pageerror',e=>errors.push(e.message));
  await page.goto((process.argv[2]||'http://127.0.0.1:8767')+'/index.html?qa=visual&cover=a');
  await page.locator('#accountInput').fill('99099');
  await page.locator('#passwordInput').fill('99099');
  await page.locator('#startBtn').click();
  await page.waitForFunction(()=>!gameScreen.classList.contains('hidden'));
  for (const viewport of [{width:1920,height:1080},{width:1366,height:768},{width:800,height:900},{width:390,height:844},{width:320,height:780}]) {
    await page.setViewportSize(viewport);
    for (let stage=0;stage<9;stage++) {
      const result = await page.evaluate(async index=>{
        state.profile.gems=[1,2,3,4,5,6,7,8];
        begin(index); clearInterval(state.tick); mission.classList.add('hidden');
        await prepareBattleVisuals(); boss();
        const sprite=document.querySelector('#bossEntity .boss-sprite');
        await BossMotion.mount(sprite,index+1);
        await BattleGround.align();
        // Independently measure the first frame's opaque foot in rendered pixels.
        async function bottom(node,columns){
          const image=new Image();image.src=getComputedStyle(node).backgroundImage.match(/url\(["']?(.*?)["']?\)/)[1];await image.decode();
          const canvas=document.createElement('canvas');canvas.width=image.width/columns;canvas.height=image.height;
          const ctx=canvas.getContext('2d');ctx.drawImage(image,0,0);
          const data=ctx.getImageData(0,0,canvas.width,canvas.height).data;
          for(let y=canvas.height-1;y>=0;y--){
            let count=0;for(let x=0;x<canvas.width;x++)if(data[(y*canvas.width+x)*4+3]>128)count++;
            if(count>=3){const r=node.getBoundingClientRect();return r.top+r.height*(y+1)/canvas.height;}
          }
        }
        const h=await bottom(hero,hero.classList.contains('pose-sheet')?6:1),b=await bottom(sprite,6);
        const tag=document.querySelector('#bossEntity .boss-tag').getBoundingClientRect();
        const bounds=gameScreen.getBoundingClientRect(),heroBounds=hero.getBoundingClientRect(),bossBounds=document.querySelector('#bossEntity').getBoundingClientRect();
        const command=document.querySelector('.boss-command').getBoundingClientRect(),hp=document.querySelector('.boss-hp').getBoundingClientRect();
        return {stage:index+1,heroFoot:h,bossFoot:b,difference:Math.abs(h-b),labelInBounds:tag.left>=0&&tag.right<=innerWidth,heroCentered:Math.abs(heroBounds.left+heroBounds.width/2-(bounds.left+bounds.width/2))<1,bossInBounds:bossBounds.left>=bounds.left&&bossBounds.right<=bounds.right,bossCoordinateMatches:Math.abs(bossBounds.left+bossBounds.width/2-(bounds.left+bounds.width*bossPos.x/100))<1,controlsInBounds:[command,hp].every(r=>r.left>=bounds.left&&r.right<=bounds.right),mobileControlsSeparate:innerWidth>900||(tag.bottom<=hp.top&&hp.bottom<=command.top&&command.bottom<=bossBounds.top)};
      },stage);
      assert.ok(result.difference<1,JSON.stringify(result));
      assert.equal(result.labelInBounds,true,JSON.stringify(result));
      assert.equal(result.heroCentered,false,JSON.stringify(result));
      assert.equal(await page.evaluate(()=>Math.abs(parseFloat(getComputedStyle(gameScreen).getPropertyValue('--hero-x'))-32)<.01&&bossPos.x===68),true,'Boss positions must be 32% and 68%');
      assert.equal(result.bossInBounds,true,JSON.stringify(result));
      assert.equal(result.bossCoordinateMatches,true,JSON.stringify(result));
      assert.equal(result.controlsInBounds,true,JSON.stringify(result));
      assert.equal(result.mobileControlsSeparate,true,JSON.stringify(result));
      results.push({viewport,...result});
      if(stage===0)await page.screenshot({path:`${out}/${viewport.width}.png`});
    }
  }
  assert.deepEqual(errors,[]);
  fs.writeFileSync(`${out}/results.json`,JSON.stringify({results,errors},null,2));
  console.log(`${results.length} ground alignment checks passed`);
} finally {await browser.close();}
