import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);
const {chromium}=require('C:/Users/cona0/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const browser=await chromium.launch({channel:'chrome',headless:true});
// Independent standard Taiwan keyboard order; do not derive expected answers from runtime mappings.
const symbols='ㄅㄆㄇㄈㄉㄊㄋㄌㄍㄎㄏㄐㄑㄒㄓㄔㄕㄖㄗㄘㄙㄧㄨㄩㄚㄛㄜㄝㄞㄟㄠㄡㄢㄣㄤㄥㄦ';
const keys='1qaz2wsxedcrfv5tgbyhnujm8ik,9ol.0p;/-';
assert.equal(symbols.length,keys.length);
try{
 const page=await browser.newPage();
 await page.goto((process.argv[2]||'http://127.0.0.1:8767')+'/index.html?gm=1');
 await page.locator('#gmPassword').fill('0088');await page.locator('#gmLogin button').click();await page.locator('#gmStart').click();
 await page.waitForFunction(()=>state.running&&!document.querySelector('#gmPanel').open);
 // Isolate input routing from animation timers; all inputs below use browser keyboard events.
 await page.evaluate(()=>{clearInterval(state.tick);cast=()=>{};state.bossMode=true});
 const cases=[...Array.from('ABCDEFGHIJKLMNOPQRSTUVWXYZ',word=>({stage:0,word,presses:[word.toLowerCase()]})),...Array.from(symbols,(word,i)=>({stage:2,word,presses:[keys[i]]})),
   ...[['ㄅㄚˊ',['1','8','6']],['ㄇㄚˇ',['a','8','3']],['ㄉㄚˋ',['2','8','4']],['ㄌㄧ˙',['x','u','7']],['，',[',']],['。',['.']],['？',['Shift+?']],['！',['Shift+!']],['：',['Shift+:']],['、',['\\']],['「」',['[',']']]].map(([word,presses])=>({stage:3,word,presses})),
   ...['C','V','Z','A'].map(key=>({stage:5,word:`CTRL+${key}`,presses:[`Control+${key.toLowerCase()}`],hotkey:key}))];
 for(const c of cases){
   const before=await page.evaluate(c=>{
     state.levelIndex=c.stage;state.current={word:c.word,boss:true};answerInput.value='';
     UltimateBattle.cancel();if(c.hotkey==='V'||c.hotkey==='Z')UltimateBattle.charge();
     UltimateBattle.gmFill();
     return {correct:state.correct,attempts:state.attempts,armed:UltimateBattle.snapshot().armed};
   },c);
   await page.locator('#answerInput').focus();
   for(const key of c.presses)await page.keyboard.press(key);
   const after=await page.evaluate(()=>({correct:state.correct,attempts:state.attempts,armed:UltimateBattle.snapshot().armed,busy:UltimateBattle.snapshot().busy}));
   assert.equal(after.correct,before.correct+1,c.word);
   assert.equal(after.attempts,before.attempts+1,c.word+' must submit once');
   if(c.hotkey){assert.equal(after.armed,before.armed,c.word+' must not control ultimate');assert.equal(after.busy,false)}
 }
 const beforeDialog=await page.evaluate(()=>{
   state.levelIndex=2;state.current={word:'ㄅ',boss:true};UltimateBattle.cancel();
   document.querySelector('#gmPanel').showModal();document.querySelector('#gmStart').focus();
   return state.attempts;
 });
 await page.keyboard.press('1');
 await page.evaluate(()=>{state.levelIndex=0;state.current={word:'A',boss:true}});
 await page.keyboard.press('a');await page.keyboard.press('Control+c');
 assert.equal(await page.evaluate(()=>state.attempts),beforeDialog,'GM dialog must block background attacks');
 assert.equal(await page.evaluate(()=>UltimateBattle.snapshot().armed),false,'GM dialog must block ultimate hotkeys');
 console.log(`PASS ${cases.length} physical input cases and GM dialog isolation`);
}finally{await browser.close()}
