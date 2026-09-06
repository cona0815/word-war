/* Project the current battle state without changing inputs, timers or rewards. */
(() => {
  const identity=document.createElement('div');identity.className='battle-identity';
  const name=document.createElement('strong'),weapon=document.createElement('span');
  identity.append(name,weapon);gameScreen.querySelector('.play-panel').prepend(identity);
  const progress=document.createElement('nav');progress.className='battle-progress';
  progress.setAttribute('aria-label','關卡進度');
  const label=document.createElement('p'),steps=document.createElement('ol');progress.append(label,steps);gameScreen.append(progress);
  let count=0;
  const original=hud;
  function paint(){
    const ultimate=window.UltimateBattle?.snapshot();
    gameScreen.dataset.aura=state.running?(ultimate?.busy?'ultimate':ultimate?.armed?'charge':window.Consumables?.aura()||''):'';
    name.textContent=`${state.profile.hero==='female'?'女主角':'男主角'} Lv.${Number(state.profile.level)||1}`;
    weapon.textContent=currentWeapon().name;
    const phases=bossPhaseCount(levels[state.levelIndex].id),total=4+phases;
    if(count!==total){
      count=total;steps.replaceChildren(...Array.from({length:total},(_,i)=>{
        const item=document.createElement('li');item.classList.toggle('boss-step',i>=4);
        item.setAttribute('aria-label',i<4?`第 ${i+1} 波`:`Boss 階段 ${i-3}`);return item;
      }));
    }
    const current=state.bossMode?3+state.bossPhase:Math.max(0,state.waveIndex-1);
    label.textContent=state.bossMode?`Boss 階段 ${state.bossPhase} / ${phases}`:`第 ${Math.max(1,state.waveIndex)} / 4 波`;
    [...steps.children].forEach((item,i)=>{
      item.classList.toggle('done',i<current||state.outcome==='done');item.classList.toggle('current',i===current&&state.outcome!=='done');
      if(i===current)item.setAttribute('aria-current','step');else item.removeAttribute('aria-current');
    });
  }
  hud=function(){original();paint();};paint();
  new MutationObserver(paint).observe(document.getElementById('ultimateStatus'),{childList:true});
})();
