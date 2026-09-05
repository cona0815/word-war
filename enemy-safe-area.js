/* Keep prompts and sprites inside the unobstructed battle band. */
(() => {
  function layout() {
    if (state.bossMode || gameScreen.classList.contains('hidden')) return;
    const screen = gameScreen.getBoundingClientRect(), gap = 12;
    const rect = selector => gameScreen.querySelector(selector)?.getBoundingClientRect();
    const upper = [rect('.hud'), rect('#menuBtn')].filter(Boolean);
    const lower = [rect('.play-panel'), rect('#ultimateMeter')].filter(Boolean);
    enemyLayer.querySelectorAll('.enemy').forEach(node => {
      const tag = node.querySelector('.tag');
      if (!tag) return;
      // Long questions wrap above their monster, including on narrow screens.
      tag.style.maxWidth = `${Math.min(520, screen.width - gap * 2)}px`;
      tag.style.whiteSpace = 'normal';
      tag.style.overflowWrap = 'anywhere';
      tag.style.wordBreak = 'normal';
      tag.style.top = 'auto';
      tag.style.bottom = 'calc(100% + 6px)';
      tag.style.marginLeft = '0px';
      const body = node.getBoundingClientRect(), label = tag.getBoundingClientRect();
      const labelLeft=Math.max(screen.left+gap,Math.min(screen.right-gap-label.width,label.left));
      const overlapsX=p=>Math.min(body.left,labelLeft)<p.right+gap&&Math.max(body.right,labelLeft+label.width)>p.left-gap;
      // Reserve only the columns actually occupied by controls, preserving the lower keyboard lane.
      const top=Math.max(screen.top,...upper.filter(overlapsX).map(p=>p.bottom))+gap;
      const bottom=Math.min(screen.bottom,...lower.filter(overlapsX).map(p=>p.top))-gap;
      const minCenter = top + label.height + 6 + body.height / 2;
      const maxCenter = bottom - body.height / 2;
      const center = body.top + body.height / 2;
      const safeCenter = Math.max(minCenter, Math.min(maxCenter, center));
      const enemy = state.enemies.find(e => String(e.order) === node.dataset.order);
      if (enemy && minCenter <= maxCenter) {
        enemy.y = (safeCenter - screen.top) / screen.height * 100;
        node.style.setProperty('--y', `${enemy.y}%`);
      }
      const dx = label.left < screen.left + gap ? screen.left + gap - label.left
        : label.right > screen.right - gap ? screen.right - gap - label.right : 0;
      tag.style.marginLeft = `${dx}px`;
    });
  }
  const originalRender = render;
  render = () => { originalRender(); layout(); };
  const observer = new ResizeObserver(layout);
  [gameScreen, gameScreen.querySelector('.hud'), gameScreen.querySelector('.play-panel')].forEach(node => node && observer.observe(node));
  enemyLayer.addEventListener('load', layout, true);
  window.EnemySafeArea = Object.freeze({layout});
})();
