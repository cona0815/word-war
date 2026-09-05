(() => {
  const meter=document.createElement('aside');
  meter.id='ultimateMeter';meter.setAttribute('aria-label','大招能量');
  meter.innerHTML='<strong id="ultimateStatus" aria-live="polite">大招能量</strong><progress max="100" value="0"></progress><div class="ultimate-actions"><button title="集氣（Ctrl+C）" aria-label="集氣">集氣</button><button title="施放（Ctrl+V）" aria-label="施放大招">施放</button><button title="取消集氣（Ctrl+Z）" aria-label="取消集氣">取消</button></div>';
  gameScreen.appendChild(meter);
  const progress=meter.querySelector('progress'),status=meter.querySelector('strong');
  const data={energy:0,armed:false,busy:false,freezeUntil:0,account:state.profile.account};
  const ready=new Map();let epoch=0;
  const tier=()=>state.profile.level>=8?3:state.profile.level>=4?2:1;
  const source=()=>`assets/generated/ultimate-v1/tier-${tier()}/cast-strip.png`;
  function preload(){const src=source();if(!ready.has(src)){const img=new Image();img.src=src;const job=img.decode().then(()=>src);ready.set(src,job);job.catch(()=>ready.delete(src))}return ready.get(src)}
  function paint(){
    progress.value=data.energy;
    status.textContent=data.busy?'大招施放中':data.armed?(data.energy>=100?'大招就緒！':`集氣中 ${data.energy}%`):`大招能量 ${data.energy}%`;
    meter.classList.toggle('ready',data.armed&&data.energy>=100);
    meter.querySelectorAll('button')[1].disabled=!data.armed||data.energy<100||data.busy;
  }
  function charge(){if(!state.running||data.busy)return;data.armed=true;preload().catch(()=>{});paint()}
  function cancel(){if(data.busy)return;data.armed=false;paint()}
  async function release(){
    if(!state.running||!data.armed||data.energy<100||data.busy)return;
    data.busy=true;paint();const generation=epoch;
    try{
      const src=await preload();
      if(generation!==epoch||!state.running)return;
      data.energy=0;data.armed=false;
      const strength=tier();data.freezeUntil=Date.now()+2500+strength*500;
      if(state.bossMode){
        const floor=Math.max(1,Math.floor(state.maxBossHp*bossPhaseFloor(levels[state.levelIndex].id,state.bossPhase)));
        state.bossHp=Math.max(floor,state.bossHp-Math.round(state.maxBossHp*(.06+strength*.02)));
        document.querySelector('#bossEntity')?.style.setProperty('--boss-hp',state.bossHp/state.maxBossHp);
      }else state.enemies.filter(isActive).forEach(e=>{e.x=Math.max(7,Math.min(93,50+(e.x-50)*1.16));e.y=Math.max(9,Math.min(89,58+(e.y-58)*1.16))});
      const burst=document.createElement('div');burst.className=`ultimate-burst ultimate-tier-${strength}`;
      burst.style.backgroundImage=`url("${src}")`;burst.setAttribute('aria-hidden','true');gameScreen.appendChild(burst);
      const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
      const frames=[0,1,2,3,4,5].map((n,i)=>({backgroundPosition:`${n*20}% 0%`,opacity:reduced?.3:1,offset:i/5,easing:'steps(1,end)'}));
      await burst.animate(frames,{duration:reduced?500:1200+strength*200,fill:'forwards'}).finished;
      burst.remove();
    }catch(error){if(generation===epoch){status.textContent='特效準備失敗，能量保留';console.warn('[Ultimate]',error)}}
    finally{if(generation===epoch){data.busy=false;paint();hud()}}
  }
  meter.querySelectorAll('button').forEach((button,i)=>button.onclick=[charge,release,cancel][i]);
  document.addEventListener('keydown',event=>{
    if(event.defaultPrevented||event.repeat||!event.ctrlKey||event.altKey||event.metaKey||event.isComposing||composing||!state.running||!mission.classList.contains('hidden')||drawer.classList.contains('open')||document.querySelector('#gmPanel')?.open)return;
    if(isEditingTarget(event.target)&&event.target!==answerInput)return;
    const fn={c:charge,v:release,z:cancel}[event.key.toLowerCase()];
    if(fn){event.preventDefault();event.stopImmediatePropagation();fn()}
  },true);
  const submitBefore=submit,beginBefore=begin,finishBefore=finish,loopBefore=loop;
  submit=raw=>{const correct=state.correct;submitBefore(raw);if(state.correct>correct){data.energy=Math.min(100,data.energy+10);paint()}};
  begin=index=>{epoch++;data.busy=false;data.armed=false;data.freezeUntil=0;gameScreen.querySelectorAll('.ultimate-burst').forEach(n=>n.remove());if(data.account!==state.profile.account){data.energy=0;data.account=state.profile.account}beginBefore(index);paint()};
  finish=win=>{epoch++;data.busy=false;data.armed=false;gameScreen.querySelectorAll('.ultimate-burst').forEach(n=>n.remove());finishBefore(win);paint()};
  loop=()=>{if(Date.now()<data.freezeUntil){hud();return}loopBefore()};
  window.UltimateBattle=Object.freeze({charge,cancel,release,preload,gmFill:()=>{if(window.GMMode?.active){data.energy=100;paint()}},snapshot:()=>({...data,tier:tier()})});
  paint();
})();
