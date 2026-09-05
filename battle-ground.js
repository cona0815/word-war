/* Align opaque sprite feet, not differently sized image centers. */
(() => {
  const feet = new Map();
  let generation = 0;
  async function foot(node, columns) {
    const src = getComputedStyle(node).backgroundImage.match(/url\(["']?(.*?)["']?\)/)?.[1];
    if (!src) throw new Error('Missing battle sprite');
    const key = `${src}:${columns}`;
    if (!feet.has(key)) {
      const task = (async () => {
        const img = new Image(); img.src = src; await img.decode();
        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth / columns; canvas.height = img.naturalHeight;
        const ctx = canvas.getContext('2d', {willReadFrequently:true});
        ctx.drawImage(img, 0, 0);
        const pixels = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
        for (let y = canvas.height - 1; y >= 0; y--) {
          let solid = 0;
          for (let x = 0; x < canvas.width; x++) {
            if (pixels[(y * canvas.width + x) * 4 + 3] > 128) solid++;
          }
          if (solid >= 3) return (y + 1) / canvas.height;
        }
        throw new Error('Empty battle sprite');
      })();
      feet.set(key, task);
      task.catch(() => feet.delete(key));
    }
    return feet.get(key);
  }
  async function align() {
    const request = ++generation;
    const bossNode = document.getElementById('bossEntity');
    const sprite = bossNode?.querySelector('[data-boss-clip]');
    if (!sprite || !state.bossMode) return;
    try {
      const [heroFoot, bossFoot] = await Promise.all([
        foot(hero, hero.classList.contains('pose-sheet') ? 6 : 1), foot(sprite, 6)
      ]);
      if (request !== generation || !bossNode.isConnected) return;
      const heroHeight = parseFloat(getComputedStyle(hero).height);
      const bossHeight = parseFloat(getComputedStyle(sprite).height);
      const ground = hero.offsetTop + heroHeight * (heroFoot - .5);
      const center = ground - bossHeight * (bossFoot - .5);
      const value = `${center.toFixed(3)}px`;
      if (bossNode.style.top !== value) bossNode.style.top = value;
      bossPos.y = center / gameScreen.clientHeight * 100;
      bossNode.dataset.groundY = ground.toFixed(3);
    } catch (error) { console.warn('Battle ground alignment:', error.message); }
  }
  new ResizeObserver(align).observe(gameScreen);
  new ResizeObserver(align).observe(hero);
  new MutationObserver(align).observe(enemyLayer, {childList:true,subtree:true,attributes:true,attributeFilter:['data-boss-clip']});
  new MutationObserver(align).observe(hero, {attributes:true,attributeFilter:['class','style']});
  window.BattleGround = Object.freeze({align});
})();
