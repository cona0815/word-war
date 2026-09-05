import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);
const {chromium}=require('C:/Users/cona0/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const browser=await chromium.launch({channel:'chrome',headless:true});
try{
 const page=await browser.newPage();
 await page.goto((process.argv[2]||'http://127.0.0.1:8767')+'/index.html');
 const results=await page.evaluate(async()=>{
   const originalFetch=window.fetch,originalTimer=window.setTimeout,config=state.config,auth=state.auth;
   const results=[];
   state.config={gasUrl:'https://test.invalid'};state.auth={sessionToken:'test-only'};
   window.setTimeout=(fn,ms,...args)=>originalTimer(fn,ms===45000?20:ms,...args);
   try{
     for(const mode of ['success','rejected','html','http','schema','network','timeout','body-timeout']){
       let calls=0,posted;
       window.fetch=async(url,options)=>{
         calls++;posted=JSON.parse(options.body);
         const aborted=()=>new Promise((resolve,reject)=>options.signal.addEventListener('abort',()=>reject(new DOMException('Aborted','AbortError')),{once:true}));
         if(mode==='timeout')return aborted();
         if(mode==='network')throw new TypeError('Failed to fetch');
         if(mode==='body-timeout')return {ok:true,json:aborted};
         if(mode==='http')return new Response('private upstream error',{status:503});
         if(mode==='html')return new Response('<!DOCTYPE html><title>private upstream error</title>');
         return new Response(JSON.stringify(mode==='schema'?[]:{ok:mode==='success',error:mode==='rejected'?'業務規則拒絕':undefined}));
       };
       try{results.push({mode,result:await gasPost({action:'purchase',itemId:'potion'}),calls,token:posted.sessionToken})}
       catch(error){results.push({mode,message:error.message,calls})}
     }
   }finally{window.fetch=originalFetch;window.setTimeout=originalTimer;state.config=config;state.auth=auth}
   return results;
 });
 for(const r of results){
   assert.equal(r.calls,1,r.mode+' must not retry transactions');
   if(r.mode==='success'){assert.equal(r.result.ok,true);assert.equal(r.token,'test-only')}
   else if(r.mode==='rejected'){assert.equal(r.result.ok,false);assert.equal(r.result.error,'業務規則拒絕')}
   else{assert.match(r.message,/雲端/);assert.doesNotMatch(r.message,/private upstream|Unexpected token|DOCTYPE/)}
   if(r.mode.includes('timeout'))assert.match(r.message,/逾時/);
 }
 console.log('PASS 8 GAS transport cases: bounded requests, Traditional Chinese errors and no automatic transaction retries');
}finally{await browser.close()}
