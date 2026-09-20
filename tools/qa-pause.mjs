import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
const {chromium}=createRequire(import.meta.url)('C:/Users/cona0/AppData/Local/npm-cache/_npx/e41f203b7505f1fb/node_modules/playwright');
const browser=await chromium.launch({channel:'chrome',headless:true});
try {
 const page=await browser.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.addInitScript(()=>sessionStorage.setItem('word-war-opening-v1','seen'));
 await page.goto('http://127.0.0.1:8767');await page.locator('#guestStartBtn').click();await page.waitForFunction(()=>state.running);
 const desktopPosition=await page.locator('#pauseGameBtn').evaluate(button=>({parent:button.parentElement.id,position:getComputedStyle(button).position,top:button.getBoundingClientRect().top,right:innerWidth-button.getBoundingClientRect().right}));
 assert.deepEqual(desktopPosition,{parent:'gameScreen',position:'fixed',top:70,right:14});
 await page.locator('#pauseGameBtn').click();
 const before=await page.evaluate(()=>JSON.stringify({enemies:state.enemies,hp:state.hp,correct:state.correct}));
 await page.waitForTimeout(1200);assert.equal(await page.evaluate(()=>JSON.stringify({enemies:state.enemies,hp:state.hp,correct:state.correct})),before);
 await page.evaluate(()=>submit(state.current?.word||'A'));assert.equal(await page.evaluate(()=>JSON.stringify({enemies:state.enemies,hp:state.hp,correct:state.correct})),before);
 await page.locator('#pauseGameDialog button').click();assert.equal(await page.evaluate(()=>state.paused),false);
 await page.evaluate(async()=>{clearInterval(state.tick);boss();await prepareBattleVisuals();submit(state.current.word);BattlePause.pause()});
 const hp=await page.evaluate(()=>state.bossHp);await page.waitForTimeout(1200);assert.equal(await page.evaluate(()=>state.bossHp),hp);
 await page.locator('#pauseGameDialog button').click();await page.waitForFunction(hp=>state.bossHp<hp,hp);
 await page.evaluate(()=>BattlePause.pause());await page.keyboard.press('Escape');assert.equal(await page.evaluate(()=>state.paused),false);
 await page.setViewportSize({width:390,height:844});
 const mobilePosition=await page.locator('#pauseGameBtn').evaluate(button=>({visible:button.getBoundingClientRect().width>0,top:button.getBoundingClientRect().top,right:innerWidth-button.getBoundingClientRect().right}));
 assert.deepEqual(mobilePosition,{visible:true,top:70,right:14});
 assert.deepEqual(errors,[]);console.log('PASS minion freeze, blocked answers, resume, in-flight Boss damage freeze/resume, Escape, no JS errors');
}finally{await browser.close()}
