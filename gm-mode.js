/* Local sandbox only. This password is not server-side authentication. */
(() => {
  const gmPage = new URLSearchParams(location.search).get('gm') === '1';
  if (!gmPage) {
    const link = document.createElement('a');
    link.textContent = 'GM 測試'; link.href = 'index.html?gm=1'; link.target = '_blank'; link.rel = 'noopener';
    link.style.cssText = 'position:fixed;bottom:8px;right:12px;z-index:100;color:white;background:#132c30;padding:6px 10px;border:1px solid #69b5ac';
    loginScreen.append(link); return;
  }
  // Disable persistence and remote calls before any test controls are enabled.
  save = () => {};
  state.config = {}; state.auth = null;
  gasPost = gasGet = async () => {throw new Error('GM 模式禁止雲端存取')};
  let active = false;
  window.GMMode = Object.freeze({get active(){return active}});
  const panel = document.createElement('dialog');
  panel.id = 'gmPanel';
  panel.innerHTML = `<form id="gmLogin"><h2>GM 測試模式</h2><label>密碼<input id="gmPassword" type="password" autocomplete="off"></label><button>進入</button><p id="gmError" role="status"></p></form>
    <section id="gmControls" hidden><h2>GM 測試</h2><p>測試資料不存檔、不上傳排行榜。</p>
    <label>關卡<select id="gmStage">${levels.map((lv,i)=>`<option value="${i}">${lv.id} ${lv.zone}</option>`).join('')}</select></label>
    <label>人物<select id="gmHero"><option value="male">男主角</option><option value="female">女主角</option></select></label>
    <label>等級<input id="gmLevel" type="number" min="1" max="10" value="1"></label>
    <label>武器<select id="gmWeapon">${Object.entries(playerWeapons).map(([k,v])=>`<option value="${k}">${v.name}</option>`).join('')}</select></label>
    <label>裝備道具<select id="gmGear">${Object.entries(playerGear).map(([k,v])=>`<option value="${k}">${v.name}</option>`).join('')}</select></label>
    <label>Boss 階段<select id="gmPhase"><option>1</option><option>2</option><option>3</option></select></label>
    <div class="gmActions"><button id="gmStart">開始關卡</button><button id="gmBoss">直接打 Boss</button><button id="gmFill">大招能量補滿</button><button id="gmHeal">生命補滿</button><button id="gmResume">返回測試</button><button id="gmExit">離開 GM</button></div><p id="gmStatus" role="status"></p></section>`;
  const style = document.createElement('style');
  style.textContent = '#gmPanel{width:min(420px,90vw);max-height:88dvh;overflow:auto;background:#142b2b;color:#fff;border:1px solid #72d8b6;border-radius:8px;padding:20px}#gmPanel::backdrop{background:#000b}#gmPanel h2{font-size:22px;margin:0 0 10px}#gmPanel label{display:grid;grid-template-columns:100px 1fr;align-items:center;margin:8px 0}#gmPanel input,#gmPanel select{width:100%;min-width:0;padding:6px;background:#fff;color:#152c29}#gmPanel button{padding:9px;border:1px solid #82cfb2;background:#205648;color:white;cursor:pointer}.gmActions{display:grid;grid-template-columns:1fr 1fr;gap:8px}#gmPanel p{font-size:13px}#gmToggle{position:fixed;right:8px;top:80px;z-index:30;padding:8px;background:#205648;color:white;border:1px solid #82cfb2}';
  document.head.append(style); document.body.append(panel);
  const q = id => panel.querySelector('#'+id);
  const refillItems=document.createElement('button');refillItems.id='gmItems';refillItems.textContent='消耗品各補 5 個';
  panel.querySelector('.gmActions').appendChild(refillItems);
  refillItems.onclick=()=>{
    if(!active)return;
    state.profile.inventory.items=Object.fromEntries(Object.keys(playerItemCatalog).map(id=>[id,5]));
    hud();q('gmStatus').textContent='消耗品已補充；每關每種仍限用一次。';
  };
  const toggle = document.createElement('button'); toggle.id='gmToggle';toggle.textContent='GM 測試';toggle.hidden=true;document.body.append(toggle);
  let resume = false;
  function open(){resume=state.running;clearInterval(state.tick);panel.showModal()}
  function close(){panel.close();if(resume&&state.running){clearInterval(state.tick);state.tick=setInterval(loop,120)}answerInput.focus()}
  toggle.onclick=open;panel.addEventListener('cancel',e=>{e.preventDefault();if(active)close()});
  q('gmLogin').onsubmit=e=>{
    e.preventDefault();if(q('gmPassword').value!=='0088'){q('gmError').textContent='密碼錯誤';return}
    active=true;state.profile.account='GM';state.records=[];state.ladderRecords=[];
    state.profile.gems=Array(8).fill(true);state.profile.coins=99999;
    state.profile.inventory={weapons:Object.keys(playerWeapons),gear:Object.keys(playerGear),items:{}};
    q('gmLogin').hidden=true;q('gmControls').hidden=false;toggle.hidden=false;
    loginScreen.classList.add('hidden');gameScreen.classList.remove('hidden');
  };
  async function start(bossOnly){
    const buttons=[...panel.querySelectorAll('button')];buttons.forEach(b=>b.disabled=true);
    try{
      state.profile.hero=q('gmHero').value;state.profile.level=Math.max(1,Math.min(10,Number(q('gmLevel').value)||1));
      state.profile.weapon=q('gmWeapon').value;state.profile.gear=q('gmGear').value;
      begin(Number(q('gmStage').value));
      if(!await prepareBattleVisuals())throw new Error('素材載入失敗，請重試');
      mission.classList.add('hidden');spawn();
      if(bossOnly){boss();state.bossPhase=Number(q('gmPhase').value);state.bossPhaseHits=0;state.bossPhaseStartedAt=Date.now();state.bossAttackAt=Date.now()+9000;hud()}
      resume=true;close();
    }catch(e){q('gmStatus').textContent=e.message}finally{buttons.forEach(b=>b.disabled=false)}
  }
  q('gmStart').onclick=()=>start(false);q('gmBoss').onclick=()=>start(true);
  q('gmFill').onclick=()=>{UltimateBattle.gmFill();q('gmStatus').textContent='能量已補滿，返回測試後可集氣施放。'};
  q('gmHeal').onclick=()=>{state.hp=100;hud();q('gmStatus').textContent='生命已補滿。'};
  q('gmResume').onclick=close;q('gmExit').onclick=()=>location.replace('index.html');
  panel.showModal();
})();
