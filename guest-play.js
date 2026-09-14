/* Guest state stays in memory and can never synchronize a student's profile. */
(() => {
  const button=document.querySelector('#guestStartBtn');
  const originalSave=save;
  save=(key,value)=>{if(state.guestMode&&[PROFILE,STORE,AUTH,CONFIG,LADDER_STORE].some(prefix=>key===prefix||key.startsWith(prefix+':')))return;return originalSave(key,value)};
  const originalGasPost=gasPost;
  gasPost=(...args)=>state.guestMode?Promise.resolve({ok:false,error:'體驗模式不連線帳號服務。'}):originalGasPost(...args);
  const originalUnlocked=unlocked;unlocked=index=>state.guestMode||originalUnlocked(index);
  const originalBegin=begin;
  begin=index=>{
    if(state.guestMode)state.profile.level=index===8?8:Math.min(7,index+1);
    originalBegin(index);
    if(state.guestMode&&isLadder(levels[index])){state.ladderRitualReady=true;missionText.textContent='體驗版可直接挑戰大橋堂，無須先收集寶石。';missionStartBtn.textContent='開始體驗天梯'}
  };
  const exit=document.createElement('button');exit.className='btn guest-exit';exit.type='button';exit.textContent='結束體驗，回到帳號登入';exit.hidden=true;
  drawer.prepend(exit);exit.onclick=()=>location.reload();
  const notice=document.createElement('p');notice.className='note';notice.hidden=true;notice.textContent='體驗模式：可任選八景與大橋堂，離開後不保存，不上傳成績。';exit.after(notice);
  button.onclick=async()=>{
    if(button.disabled)return;button.disabled=true;
    const heroChoice=document.querySelector('[data-hero].active')?.dataset.hero||'male';
    state.guestMode=true;state.config={gasUrl:'',adminToken:''};state.auth=null;
    state.profile={...defaultProfile('guest'),hero:heroChoice};state.records=[];state.ladderRecords=[];state.questions=[];
    pendingStageSettlement=null;stageSettlementBusy=false;
    document.body.classList.add('guest-mode');exit.hidden=false;notice.hidden=false;
    loginScreen.classList.add('hidden');gameScreen.classList.remove('hidden');
    begin(0);menu();
    try{await startBattle()}finally{button.disabled=false}
  };
})();
