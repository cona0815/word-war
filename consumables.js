/* Inventory effects are scoped to one battle, with server receipts for cloud play. */
(() => {
  const panel=document.createElement('div');panel.id='battleItems';
  panel.innerHTML='<div class="item-buttons"></div><output aria-live="polite"></output>';
  gameScreen.querySelector('.play-panel').appendChild(panel);
  const narrow=matchMedia('(max-width:600px)'),meter=document.getElementById('ultimateMeter');
  function placeMeter(){if(!meter)return;if(narrow.matches)panel.before(meter);else gameScreen.appendChild(meter)}
  narrow.addEventListener('change',placeMeter);placeMeter();
  const buttons=panel.firstElementChild,status=panel.lastElementChild;
  const labels={potion:'補血',shield:'護盾',hourglass:'慢速',hint:'提示',comboStar:'獎勵'};
  let run=null,pendingRun=null,busy=false,shield=false,slowUntil=0,hintUntil=0,healUntil=0,star=false,epoch=0;
  const cloud=()=>!!(state.config.gasUrl&&state.auth?.sessionToken);
  const uid=()=>crypto.randomUUID();
  const closing=new Set();
  const context=()=>({account:state.profile.account,token:state.auth?.sessionToken,url:state.config.gasUrl});
  const sameContext=c=>c.account===state.profile.account&&c.token===state.auth?.sessionToken&&c.url===state.config.gasUrl;
  function accept(profile,c){if(profile&&sameContext(c)&&Number(profile.version)>=Number(state.profile.version||0)){state.profile=profileForRemote(profile,c.account);saveProfile()}}
  function closeCandidate(candidate){
    if(!candidate?.context?.token)return Promise.resolve();
    if(candidate.closeTask)return candidate.closeTask;
    closing.add(candidate);
    candidate.closeTask=(async()=>{
      // Finish in-flight writes before closing; a completed stage owns its reward receipt.
      await candidate.task?.catch(()=>{});
      await candidate.settlement?.catch(()=>{});
      const c=candidate.context;
      const result=await gasPost({action:'closeItemRun',runId:candidate.id,sessionToken:c.token},c.url);
      if(!result.ok)throw new Error(result.error||'道具戰鬥紀錄關閉失敗');
      accept(result.profile,c);closing.delete(candidate);
    })().finally(()=>{candidate.closeTask=null});
    return candidate.closeTask;
  }
  function retire(){const candidate=run||pendingRun;if(candidate)closeCandidate(candidate).catch(error=>{if(candidate.context&&sameContext(candidate.context))status.textContent='道具紀錄尚未同步，開始下一場時會重試。';console.warn('[Word War] item closure',error.message)})}
  let pausedAt=null;
  const effectNow=()=>pausedAt??Date.now();
  function reset(){retire();epoch++;pausedAt=null;run=null;pendingRun=null;busy=false;shield=false;slowUntil=0;hintUntil=0;healUntil=0;star=false;status.textContent='';paint()}
  function paint(){
    panel.hidden=!state.running;
    if(!buttons.children.length){
      Object.keys(labels).forEach(id=>{const b=document.createElement('button');b.dataset.item=id;b.title=playerItemCatalog[id].desc;b.onclick=()=>use(id);buttons.appendChild(b)});
    }
    buttons.querySelectorAll('button').forEach(b=>{
      const id=b.dataset.item;
      const count=state.profile.inventory?.items?.[id]||0,used=!!run?.used[id];
      b.disabled=busy||!run||used||!count;b.textContent=`${labels[id]} ${used?'已用':`×${count}`}`;
    });
  }
  async function prepare(){
    if(run)return;
    const generation=epoch,account=state.profile.account;
    const candidate=pendingRun||(pendingRun={id:uid(),used:{},events:{},context:cloud()?context():null});
    if(cloud()){
      await Promise.all([...closing].filter(c=>sameContext(c.context)).map(closeCandidate));
      if(generation!==epoch||account!==state.profile.account)return;
      const c=candidate.context;
      const result=await (candidate.task=gasPost({action:'startItemRun',runId:candidate.id,stage:levels[state.levelIndex].id,expectedVersion:state.profile.version,sessionToken:c.token},c.url));
      if(generation!==epoch||!sameContext(c))return;
      if(!result.ok)throw new Error(result.error||'道具準備失敗');
      if(result.profile?.inventory?.itemRun?.closed)throw new Error('道具戰鬥紀錄已關閉，請重新開始。');
      accept(result.profile,c);
    }
    run=candidate;pendingRun=null;paint();
  }
  async function use(id){
    if(!state.running||busy||!run||run.used[id]||!labels[id]||!mission.classList.contains('hidden')||drawer.classList.contains('open')||document.querySelector('#gmPanel')?.open)return;
    if(!(state.profile.inventory?.items?.[id]>0))return;
    if(id==='potion'&&state.hp>=100){status.textContent='能量已滿';return}
    if(id==='hourglass'&&state.bossMode){status.textContent='慢速沙漏只對小怪生效';return}
    if(id==='comboStar'&&levels[state.levelIndex].id===9){status.textContent='天梯不使用金幣加成';return}
    const target=state.bossMode?state.current:state.enemies.filter(isActive).sort((a,b)=>dist(a)-dist(b))[0];
    const hintKey=target&&window.TypingHints?.firstKey(target.word);
    if(id==='hint'&&!hintKey){status.textContent='目前題目沒有可用鍵位提示';return}
    const generation=epoch,account=state.profile.account,currentRun=run;
    busy=true;paint();status.textContent='正在使用…';
    try{
      if(cloud()){
        currentRun.events[id] ||= uid();
        const c=currentRun.context ||= context();
        const result=await (currentRun.task=gasPost({action:'consumeItem',runId:currentRun.id,itemId:id,eventId:currentRun.events[id],expectedVersion:state.profile.version,sessionToken:c.token},c.url));
        if(generation!==epoch||!sameContext(c))return;
        if(!result.ok)throw new Error(result.error||'使用失敗');
        accept(result.profile,c);
      }else state.profile.inventory.items[id]--;
      saveProfile();currentRun.used[id]=true;
      if(!state.running)return;
      if(id==='potion'){state.hp=Math.min(100,state.hp+25);healUntil=effectNow()+1200}
      if(id==='shield')shield=true;
      if(id==='hourglass')slowUntil=effectNow()+10000;
      if(id==='hint')hintUntil=effectNow()+10000;
      if(id==='comboStar')star=true;
      status.textContent=id==='hint'?`首鍵：${hintKey}`:`${playerItemCatalog[id].name}已使用`;
      hud();
    }catch(error){if(generation===epoch)status.textContent=error.message+'；可再次點擊重試'}
    finally{
      if(generation===epoch){
        busy=false;paint();
        if(state.running&&mission.classList.contains('hidden')&&!drawer.classList.contains('open')&&!document.querySelector('#gmPanel')?.open)answerInput.focus();
      }
    }
  }
  const originalBegin=begin;
  begin=(...args)=>{reset();return originalBegin(...args)};
  const originalSpawn=spawn;
  spawn=(...args)=>{if(!cloud()&&!run)prepare();return originalSpawn(...args)};
  const originalSwitch=switchAccount;
  switchAccount=(...args)=>{reset();return originalSwitch(...args)};
  const originalFinish=finish;
  finish=win=>{const result=originalFinish(win);if(!win)reset();return result};
  const originalHud=hud;
  hud=()=>{originalHud();paint();if(hintUntil&&effectNow()>hintUntil){hintUntil=0;status.textContent='提示結束'}};
  const originalGasPost=gasPost;
  gasPost=(payload,url)=>{
    if(payload.action!=='finishStage')return originalGasPost(payload,url);
    const candidate=run,c=candidate?.context;
    const task=originalGasPost({...payload,itemRunId:candidate?.id,...(c?{sessionToken:c.token}:{})},c?.url||url);
    if(candidate)candidate.settlement=task;
    return task;
  };
  const originalReward=grantLocalStageReward;
  grantLocalStageReward=(lv,accuracy)=>{
    const reward=originalReward(lv,accuracy);
    if(star&&lv.id<=8){const extra=Math.round(reward.coins*.1);reward.coins+=extra;state.profile.coins+=extra}
    return reward;
  };
  const originalBuy=buyItem;
  buyItem=id=>{
    if(playerItemCatalog[id]&&(state.profile.inventory?.items?.[id]||0)>=99){shopStatus.textContent='道具已達持有上限 99 個。';return}
    return originalBuy(id);
  };
  window.Consumables={prepare,use,reset,slowFactor:()=>effectNow()<slowUntil?.5:1,
    aura:()=>effectNow()<healUntil?'heal':shield?'shield':effectNow()<slowUntil?'slow':effectNow()<hintUntil?'hint':star?'reward':'',
    pause:()=>{pausedAt??=Date.now()},
    resume:()=>{if(pausedAt===null)return;const elapsed=Date.now()-pausedAt;if(slowUntil)slowUntil+=elapsed;if(hintUntil)hintUntil+=elapsed;if(healUntil)healUntil+=elapsed;pausedAt=null},
    mistake:()=>{if(shield){shield=false;status.textContent='護盾抵銷失誤';return 0}return 6},
    inspect:()=>({run:run?.id,used:{...run?.used},busy,shield,star,slowUntil,closing:closing.size})};
  paint();
})();
