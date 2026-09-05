import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);
const {chromium}=require('C:/Users/cona0/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const browser=await chromium.launch({channel:'chrome',headless:true});
try{
 for(const mode of ['failure','restart','late-start','late-use','account','retry','ladder-floor','settlement']){
  const page=await browser.newPage();
  await page.goto((process.argv[2]||'http://127.0.0.1:8767')+'/index.html'+(mode==='settlement'?'':'?gm=1'));
  if(mode==='settlement')await page.evaluate(async()=>{state.config={};state.auth=null;begin(0);await startBattle()});
  else{
   await page.locator('#gmPassword').fill('0088');await page.locator('#gmLogin button').click();await page.locator('#gmStart').click();
   await page.waitForFunction(()=>state.running&&!document.querySelector('#gmPanel').open);
  }
  const result=await page.evaluate(async mode=>{
   clearInterval(state.tick);state.config={};state.auth=null;Consumables.reset();
   state.profile.account='99099';state.profile.version=10;state.profile.inventory.items.potion=2;
   state.config={gasUrl:'https://isolated.invalid'};state.auth={sessionToken:'original-token'};
   const remote=structuredClone(state.profile),calls=[],bridge=gasPost;
   let gate=null,failClose=mode==='retry';
   gasPost=async(payload,url)=>{
    calls.push({action:payload.action,id:payload.runId,token:payload.sessionToken,url});
    if((mode==='late-start'&&payload.action==='startItemRun')||(mode==='late-use'&&payload.action==='consumeItem'))await new Promise(resolve=>gate=resolve);
    if(payload.action==='startItemRun')remote.inventory.itemRun={id:payload.runId,used:{}};
    if(payload.action==='consumeItem')remote.inventory.items.potion--;
    if(payload.action==='closeItemRun'){
     if(failClose){failClose=false;throw new Error('isolated close failure')}
     if(remote.inventory.itemRun?.id===payload.runId)remote.inventory.itemRun.closed=true;
    }
    remote.version++;return {ok:true,profile:structuredClone(remote)};
   };
   const settle=async()=>{for(let i=0;i<12;i++)await new Promise(r=>setTimeout(r,0))};
   const prepared=Consumables.prepare();
   if(mode==='late-start'){
    await settle();Consumables.reset();gate();await prepared;await settle();
   }else{
    await prepared;
    if(mode==='late-use'){
     state.hp=50;mission.classList.add('hidden');const used=Consumables.use('potion');
     await settle();Consumables.reset();gate();await used;await settle();
    }else if(mode==='account'){
     switchAccount('99098');state.auth={sessionToken:'other-token'};state.config={gasUrl:'https://other.invalid'};
     await settle();
    }else if(mode==='failure'){finish(false);await settle()}
    else if(mode==='restart'){begin(0);await settle()}
    else if(mode==='retry'){
     Consumables.reset();await settle();await Consumables.prepare();await settle();
    }else if(mode==='ladder-floor'){
     state.levelIndex=8;finish(true);await settle();
    }else if(mode==='settlement'){
     gasPost=bridge;
     window.fetch=async(url,options)=>{
      const payload=JSON.parse(options.body);calls.push({action:payload.action,id:payload.runId,token:payload.sessionToken,url});
      if(payload.action==='finishStage')await new Promise(resolve=>gate=resolve);
      if(payload.action==='closeItemRun')remote.inventory.itemRun.closed=true;
      remote.version++;return {ok:true,json:async()=>({ok:true,profile:structuredClone(remote)})};
     };
     const reward=gasPost({action:'finishStage',stage:1});Consumables.reset();await settle();
     if(calls.some(c=>c.action==='closeItemRun'))throw Error('Closed before reward response');
     gate();await reward;await settle();
    }
   }
   return {calls,run:remote.inventory.itemRun,inventory:remote.inventory.items.potion,account:state.profile.account,hp:state.hp,inspect:Consumables.inspect()};
  },mode);
  {
   const closes=result.calls.filter(c=>c.action==='closeItemRun');
   if(mode==='ladder-floor'){assert.equal(closes.length,0);assert.ok(result.inspect.run)}
   else{
    assert.ok(closes.length>0,mode);
    assert.ok(closes.every(c=>c.token==='original-token'&&c.url==='https://isolated.invalid'),mode);
    if(mode==='retry'){assert.equal(closes.length,2);assert.ok(!result.run.closed);assert.ok(result.inspect.run)}
    else assert.equal(result.run.closed,true,mode);
    assert.equal(result.inspect.closing,0,mode);
    if(mode==='account')assert.equal(result.account,'99098');
    if(mode==='late-use'){assert.equal(result.hp,50);assert.equal(result.inventory,1)}
   }
   console.log('PASS item closure '+mode);
  }
  await page.close();
 }
}finally{await browser.close()}
