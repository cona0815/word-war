import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
const {chromium}=createRequire(import.meta.url)('C:/Users/cona0/AppData/Local/npm-cache/_npx/e41f203b7505f1fb/node_modules/playwright');
const browser=await chromium.launch({channel:'chrome',headless:true});
try{
 const page=await browser.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.route('https://**/*',r=>r.abort());await page.addInitScript(()=>sessionStorage.setItem('word-war-opening-v1','seen'));
 await page.goto('http://127.0.0.1:8767/');await page.locator('#guestStartBtn').click();await page.waitForFunction(()=>state.running);
 const result=await page.evaluate(async()=>{
   clearInterval(state.tick);boss();const beforeCast=cast;cast=()=>{};
   const correct=()=>{state.current.word='A';state.current.pending=false;submit('A')};
   for(let i=0;i<5;i++)correct();submit('wrong');for(let i=0;i<2;i++)correct();
   cast=beforeCast;
   const current=state.combo,best=state.maxCombo,record=makeRecord(levels[0],true,78,90);
   const snapshot=JSON.stringify(record);state.records.push(record);menu();const visibleBest=recordList.textContent.includes('最高連擊 5');
   state.config.gasUrl='https://isolated.invalid';state.auth={sessionToken:'qa'};
   const oldGas=gasPost,sent=[];let fail=true;
   gasPost=async payload=>{sent.push(payload);return fail?{ok:false,error:'offline'}:{ok:true,profile:{...state.profile,accountId:state.profile.account}}};
   try{await settleStage(record)}catch{}
   state.combo=1;state.maxCombo=1;fail=false;await settleStage(record);
   gasPost=oldGas;state.config.gasUrl='';state.auth={};
   begin(0);return{current,best,visibleBest,recordBest:JSON.parse(snapshot).maxCombo,sent:sent.map(p=>p.maxCombo),reset:state.maxCombo};
 });
 assert.equal(result.current,2);assert.equal(result.best,5);assert.equal(result.recordBest,5);
 assert.equal(result.visibleBest,true);
 assert.deepEqual(result.sent,[5,5]);assert.equal(result.reset,0);assert.deepEqual(errors,[]);
 console.log('PASS best combo survives mistake, record snapshot persists, cloud retry uses same historical combo, new run resets');
}finally{await browser.close()}
