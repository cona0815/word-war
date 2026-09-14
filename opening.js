/* The intro never blocks login when media or autoplay is unavailable. */
(() => {
  const dialog=document.createElement('dialog');dialog.id='openingDialog';
  dialog.setAttribute('aria-label','Word War 開場動畫');
  dialog.innerHTML='<video id="openingVideo" playsinline preload="none" muted poster="assets/word-war-game-cover-logo-v2.png"></video><div class="opening-controls"><span id="openingStatus" role="status">Word War｜校園鍵盤勇者</span><button id="openingSound" class="btn">開啟聲音</button><button id="openingSkip" class="btn">略過，進入登入</button></div>';
  document.body.appendChild(dialog);
  const video=dialog.querySelector('video'),sound=dialog.querySelector('#openingSound'),status=dialog.querySelector('#openingStatus');
  const replay=document.createElement('button');replay.id='openingReplay';replay.className='btn';replay.textContent='重播開場動畫';
  document.querySelector('#loginScreen').appendChild(replay);
  const key='word-war-opening-v1';let timer;
  function close(){clearTimeout(timer);video.pause();dialog.close();try{sessionStorage.setItem(key,'seen')}catch{}document.querySelector('#accountInput')?.focus()}
  async function play(withSound=false){
    academyAudio.pause();if(!video.getAttribute('src'))video.src='assets/word-war-opening.mp4';
    video.currentTime=0;video.muted=!withSound;video.volume=.65;sound.textContent=video.muted?'開啟聲音':'靜音';
    status.textContent='Word War｜校園鍵盤勇者';dialog.showModal();
    clearTimeout(timer);timer=setTimeout(()=>{if(video.readyState<2)status.textContent='影片載入較慢，可直接略過進入遊戲。'},8000);
    try{await video.play()}catch{status.textContent='點「播放動畫」開始，或直接略過。';sound.textContent='播放動畫'}
  }
  sound.onclick=()=>{video.muted=!video.muted;if(video.paused)video.play().catch(()=>{status.textContent='無法播放，請略過進入遊戲。'});sound.textContent=video.muted?'開啟聲音':'靜音'};
  dialog.querySelector('#openingSkip').onclick=close;
  dialog.addEventListener('cancel',e=>{e.preventDefault();close()});
  video.onended=close;video.onerror=()=>{status.textContent='影片暫時無法載入，請略過進入遊戲。'};
  replay.onclick=()=>play(true);
  let seen=false;try{seen=sessionStorage.getItem(key)==='seen'}catch{}
  const params=new URLSearchParams(location.search);
  if(!seen&&!params.has('qa')&&!params.has('gm'))play();
})();
