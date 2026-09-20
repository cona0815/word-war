/* Only battle callbacks use this queue; network and interface timers stay live. */
const battleTimers = new Set();
function battleTimeout(callback, delay) {
  const timer = {callback, remaining: delay, due: Date.now() + delay, id: null};
  timer.arm = () => {
    timer.due = Date.now() + timer.remaining;
    timer.id = setTimeout(() => { battleTimers.delete(timer); callback(); }, timer.remaining);
  };
  battleTimers.add(timer);
  if (!state.paused) timer.arm();
  return timer;
}
(() => {
  const button = document.createElement('button');
  button.id = 'pauseGameBtn'; button.className = 'btn'; button.textContent = '⏸ 暫停遊戲';
  button.style.cssText = 'width:100%;margin-bottom:12px';
  drawerTitle.after(button);
  const dialog = document.createElement('dialog');
  dialog.id = 'pauseGameDialog';
  dialog.innerHTML = '<h2>遊戲已暫停</h2><p>準備好後，按下繼續遊戲。</p><button class="btn primary" autofocus>▶ 繼續遊戲</button>';
  document.body.append(dialog);
  const style = document.createElement('style');
  style.textContent = '#pauseGameDialog{color:#fff;background:#102c40;border:2px solid #e4c363;border-radius:16px;padding:32px;text-align:center;max-width:85vw}#pauseGameDialog::backdrop{background:#001321b8}';
  document.head.append(style);
  let pausedAt = 0, animations = [];
  function resume() {
    if (!state.paused) return;
    const elapsed = Date.now() - pausedAt;
    const shift = (object, keys) => keys.forEach(key => { if (object?.[key] && Number.isFinite(object[key]) && object[key] !== Number.MAX_SAFE_INTEGER) object[key] += elapsed; });
    shift(state, ['startedAt', 'bossAttackAt', 'bossPhaseStartedAt']);
    state.enemies.forEach(e => shift(e, ['spawnAt', 'activeAt']));
    shift(state.current, ['promptAt']);
    state.paused = false;
    window.Consumables?.resume(); window.UltimateBattle?.resume(); window.BossProjectile?.resume();
    animations.forEach(a => { if (a.playState === 'paused') a.play(); }); animations = [];
    battleTimers.forEach(t => t.arm());
    dialog.close();
    if (state.running) state.tick = setInterval(loop, 120);
    hud(); answerInput.focus();
  }
  function pause() {
    if (!state.running || state.paused) return;
    pausedAt = Date.now(); state.paused = true; clearInterval(state.tick);
    battleTimers.forEach(t => { clearTimeout(t.id); t.remaining = Math.max(0, t.due - pausedAt); });
    animations = gameScreen.getAnimations({subtree:true}).filter(a => a.playState === 'running');
    animations.forEach(a => a.pause());
    window.Consumables?.pause(); window.UltimateBattle?.pause(); window.BossProjectile?.pause();
    drawer.classList.remove('open'); dialog.showModal(); hud();
  }
  button.onclick = pause;
  dialog.querySelector('button').onclick = resume;
  dialog.addEventListener('cancel', e => { e.preventDefault(); resume(); });
  const originalSubmit = submit; submit = (...args) => { if (!state.paused) return originalSubmit(...args); };
  const originalLoop = loop; loop = (...args) => { if (!state.paused) return originalLoop(...args); };
  const originalHud = hud; hud = () => { originalHud(); button.disabled = !state.running; };
  const originalBegin = begin; begin = (...args) => { if (state.paused) resume(); return originalBegin(...args); };
  window.BattlePause = Object.freeze({pause, resume});
  hud();
})();
