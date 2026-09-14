/* Ladder floors reuse the five-phase boss without altering the eight main stages. */
(() => {
  let floor=1,cleared=0,ended=false;
  const next=document.createElement('button');next.id='ladderNextFloor';next.className='btn';next.hidden=true;
  ladderNameBox.appendChild(next);
  const originalBegin=begin;
  begin=(...args)=>{floor=1;cleared=0;ended=false;state.ladderFloor=1;next.hidden=true;return originalBegin(...args)};
  const originalMinimum=bossMinCorrect;
  bossMinCorrect=(stage,phase)=>originalMinimum(stage,phase)+(Number(stage)===9?Math.min(4,Math.floor((floor-1)/5)):0);
  const originalFinish=finish;
  finish=win=>{
    if(!isLadder(levels[state.levelIndex]))return originalFinish(win);
    if(win){
      cleared=floor;
      if(!state.config.gasUrl){
        state.profile.level=Math.max(state.profile.level,floor>=5?10:floor>=3?9:8);
        saveProfile();
      }
    }
    if(!win&&!cleared){next.hidden=true;return originalFinish(false)}
    originalFinish(true);
    if(!win)window.Consumables?.reset();
    if(pendingLadderRecord)pendingLadderRecord.floor=cleared;
    missionTitle.textContent=win?`第 ${cleared} 層完成`:'天梯挑戰結束';
    missionStartBtn.textContent='重新挑戰第 1 層';
    missionText.textContent=`最高完成第 ${cleared} 層｜分數 ${state.score}｜正確率 ${Math.round(state.correct/Math.max(1,state.attempts)*100)}%`;
    missionText.textContent+=state.config.gasUrl?'\n送出有效天梯成績後，雲端確認 Lv.8／9／10 里程碑。':`\n角色 Lv.${state.profile.level}｜第 1、3、5 層解鎖 Lv.8、9、10。`;
    next.textContent=`挑戰第 ${floor+1} 層`;
    next.hidden=!win||floor>=99;next.disabled=false;
  };
  next.onclick=()=>{
    if(ended||state.running||floor>=99)return;
    const expires=state.ladderRun?.expiresAt;
    if(expires&&(typeof expires==='number'?expires:Date.parse(expires))<=Date.now()){
      next.disabled=true;ladderNameStatus.textContent='挑戰已逾時，請重新開始。';return;
    }
    floor++;state.ladderFloor=floor;pendingLadderRecord=null;next.hidden=true;
    battleVisualGeneration++;stopHeroMotion();
    ladderNameBox.classList.add('hidden');mission.classList.add('hidden');
    state.hp=Math.min(100,state.hp+20);state.running=true;state.outcome=null;
    state.maxBossHp=Math.round(bossMaxHp(levels[8])*(1+Math.min(2,(floor-1)*.08)));
    activeHeroCastClip=null;hero.classList.remove('pose-sheet','wide-pose');
    hero.style.setProperty('--hero-atlas',`url("${versionedHeroAsset(integratedHeroAssets[state.profile.hero][state.profile.level][state.profile.weapon])}")`);
    hero.style.setProperty('--hero-bg-size','100% 100%');hero.style.setProperty('--hero-bg-position','center bottom');
    prepareBattleVisuals();boss();clearInterval(state.tick);state.tick=setInterval(loop,120);hud();answerInput.focus();
  };
  const originalSubmit=submitLadder;
  submitLadder=async()=>{
    if(pendingLadderRecord&&pendingLadderRecord.correct/Math.max(1,pendingLadderRecord.attempts)*100<85){ladderNameStatus.textContent='天梯成績需要至少 85% 正確率。';return}
    await originalSubmit();if(!pendingLadderRecord){ended=true;next.disabled=true;window.Consumables?.reset()}
  };
  // The original click handler was assigned before this module loaded.
  submitLadderBtn.onclick=submitLadder;
  const originalHud=hud;
  hud=()=>{originalHud();if(isLadder(levels[state.levelIndex]))roundText.textContent=`天梯第 ${floor} 層｜最高 ${cleared} 層`};
  window.LadderBattle={inspect:()=>({floor,cleared,ended})};
})();
