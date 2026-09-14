/* One music player owns battle playback. Pauses never create overlapping tracks. */
(() => {
  const storage='word-war-music-settings';
  let settings={enabled:true,volume:.3};
  try{settings={...settings,...JSON.parse(localStorage.getItem(storage)||'{}')}}catch{}
  settings.volume=Math.max(0,Math.min(1,Number(settings.volume)||0));
  const audio=new Audio();audio.preload='none';audio.volume=settings.volume;
  let manifest=null,context='',lastTrack='',generation=0,blocked=false,failed=false;
  const queues=new Map();
  const toggle=document.createElement('button');toggle.id='battleMusicToggle';toggle.className='btn';toggle.type='button';
  gameScreen.appendChild(toggle);
  const panel=document.createElement('section');panel.className='music-settings';
  panel.innerHTML='<strong>中古世紀魔法配樂</strong><label>音量 <input id="battleMusicVolume" aria-label="背景音樂音量" type="range" min="0" max="100" step="5"></label><button id="battleMusicNext" class="btn" type="button">下一段配樂</button><p id="battleMusicStatus" class="note" role="status"></p>';
  document.querySelector('#menuSettings').prepend(panel);
  const volume=panel.querySelector('input'),status=panel.querySelector('p');volume.value=Math.round(settings.volume*100);
  function save(){try{localStorage.setItem(storage,JSON.stringify(settings))}catch{}}
  function paint(){toggle.textContent=settings.enabled?'♫ 音樂':'♫ 靜音';toggle.setAttribute('aria-label',settings.enabled?'關閉背景音樂':'開啟背景音樂');toggle.setAttribute('aria-pressed',String(settings.enabled));status.textContent=failed?'音樂載入失敗，可按下一段重試。':blocked?'瀏覽器暫停了音樂，請按音樂按鈕開啟。':!settings.enabled?'背景音樂已靜音。':audio.dataset.label||'戰鬥開始後播放；每首輪替三段亮點。'}
  function group(){const stage=levels[state.levelIndex]?.id||1;return `${state.bossMode?'boss':'battle'}-${stage<=3?'early':stage<=6?'mid':'late'}`}
  function allowed(){return settings.enabled&&state.running&&!document.hidden&&!gameScreen.classList.contains('hidden')&&mission.classList.contains('hidden')&&!drawer.classList.contains('open')&&!document.querySelector('#openingDialog')?.open}
  function choose(key){
    let queue=queues.get(key)||[];
    if(!queue.length){queue=(manifest?.groups[key]||[]).slice();for(let i=queue.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[queue[i],queue[j]]=[queue[j],queue[i]]}if(queue.length>1&&queue[0].src===lastTrack)[queue[0],queue[1]]=[queue[1],queue[0]]}
    const clip=queue.shift();queues.set(key,queue);return clip;
  }
  function play(){if(!allowed()||!audio.getAttribute('src')||blocked||failed)return;const token=generation;audio.play().catch(()=>{if(token===generation&&allowed()){blocked=true;paint()}})}
  function next(){
    generation++;audio.pause();blocked=false;failed=false;
    if(!manifest)return;
    const key=group(),clip=choose(key);if(!clip)return;
    context=key;lastTrack=clip.src;audio.src=clip.src;audio.dataset.label=clip.label;audio.volume=settings.volume;paint();play();
  }
  function sync(){
    if(!allowed()){if(!audio.paused){generation++;audio.pause()}return}
    if(!manifest)return;
    if(context!==group()||!audio.getAttribute('src')){next();return}
    if(audio.paused)play();
  }
  toggle.onclick=()=>{settings.enabled=blocked?true:!settings.enabled;blocked=false;failed=false;save();paint();sync()};
  volume.oninput=()=>{settings.volume=Number(volume.value)/100;audio.volume=settings.volume;save();paint()};
  panel.querySelector('button').onclick=next;
  audio.onended=()=>{if(allowed())next();else audio.removeAttribute('src')};
  audio.onerror=()=>{failed=true;audio.pause();paint()};
  document.addEventListener('visibilitychange',sync);
  const observer=new MutationObserver(sync);
  for(const node of [gameScreen,mission,drawer,document.querySelector('#openingDialog')].filter(Boolean))observer.observe(node,{attributes:true,attributeFilter:['class','open']});
  const originalHud=hud;hud=()=>{originalHud();sync()};
  fetch('assets/music/manifest.json').then(r=>{if(!r.ok)throw Error('manifest');return r.json()}).then(data=>{manifest=data;sync()}).catch(()=>{failed=true;paint()});
  window.BattleMusic=Object.freeze({inspect:()=>({group:context,track:lastTrack,playing:!audio.paused,enabled:settings.enabled,volume:audio.volume,blocked,failed}),next});
  paint();
})();
