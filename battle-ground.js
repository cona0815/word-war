/* Align opaque sprite feet, not differently sized image centers. */
(() => {
  const feet = new Map();
  let generation = 0;
  const markers=['hero','boss'].map(kind=>{const node=document.createElement('div');node.className='battle-foot-marker';node.dataset.kind=kind;node.setAttribute('aria-hidden','true');gameScreen.append(node);return node});
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
    const screen=gameScreen.getBoundingClientRect(),panel=gameScreen.querySelector('.play-panel');
    if(screen.height&&panel){
      const height=parseFloat(getComputedStyle(hero).height)||0;
      const base=(state.bossMode?heroBoss.y:heroNormal.y)*screen.height/100;
      const panelBounds=panel.getBoundingClientRect();
      const bottom=panelBounds.top-screen.top-12;
      const heroX=screen.left+screen.width*(state.bossMode?heroBoss.x:heroNormal.x)/100;
      const coversCenter=panelBounds.left<=heroX&&panelBounds.right>=heroX;
      // A full-width control panel must leave a lower spawn lane, not just room for the hero.
      const clearance=!state.bossMode&&coversCenter?Math.max(height/2,56+screen.height*.21):height/2;
      const center=Math.max(height/2,Math.min(base,bottom-clearance));
      const position=(center/screen.height*100).toFixed(4)+'%';
      if(gameScreen.style.getPropertyValue('--hero-y')!==position)gameScreen.style.setProperty('--hero-y',position);
    }
    const bossNode = document.getElementById('bossEntity');
    const sprite = bossNode?.querySelector('[data-boss-clip]');
    markers[1].hidden=!state.bossMode;
    if (!sprite || !state.bossMode) {
      try{const f=await foot(hero,hero.classList.contains('pose-sheet')?6:1);if(request!==generation)return;markers[0].style.left=heroNormal.x+'%';markers[0].style.top=(hero.offsetTop+parseFloat(getComputedStyle(hero).height)*(f-.5))+'px'}catch{}
      return;
    }
    try {
      const [heroFoot, bossFoot] = await Promise.all([
        foot(hero, hero.classList.contains('pose-sheet') ? 6 : 1), foot(sprite, 6)
      ]);
      if (request !== generation || !bossNode.isConnected) return;
      const heroHeight = parseFloat(getComputedStyle(hero).height);
      const bossHeight = parseFloat(getComputedStyle(sprite).height);
      const ground = hero.offsetTop + heroHeight * (heroFoot - .5);
      markers.forEach((marker,i)=>{marker.style.left=(i?bossPos.x:heroBoss.x)+'%';marker.style.top=ground+'px'});
      const center = ground - bossHeight * (bossFoot - .5);
      const value = `${center.toFixed(3)}px`;
      if (bossNode.style.top !== value) bossNode.style.top = value;
      bossPos.y = center / gameScreen.clientHeight * 100;
      bossNode.dataset.groundY = ground.toFixed(3);
      const command=bossNode.querySelector('.boss-command'),hp=bossNode.querySelector('.boss-hp');
      let tagGap=22;
      if(command&&hp){
        [command,hp].forEach(node=>{['top','bottom','width','min-width','max-width','white-space','overflow-wrap','margin-left'].forEach(key=>node.style.removeProperty(key))});
        if(screen.width<=900){
          Object.assign(command.style,{top:'auto',bottom:'calc(100% + 8px)',minWidth:'0',width:'max-content',maxWidth:`${screen.width-24}px`,whiteSpace:'normal',overflowWrap:'anywhere'});
          const height=command.getBoundingClientRect().height;
          Object.assign(hp.style,{top:'auto',bottom:`calc(100% + ${height+16}px)`,width:`${Math.min(260,screen.width-24)}px`});
          tagGap=height+36;
        }
        [command,hp].forEach(node=>{
          const r=node.getBoundingClientRect();
          const dx=r.left<screen.left+12?screen.left+12-r.left:r.right>screen.right-12?screen.right-12-r.right:0;
          node.style.marginLeft=dx+'px';
        });
      }
      const tag=bossNode.querySelector('.boss-tag');
      if(tag){
        Object.assign(tag.style,{maxWidth:`${Math.min(400,screen.width-24)}px`,minWidth:'0',width:'max-content',whiteSpace:'normal',overflowWrap:'anywhere',top:'auto',bottom:`calc(100% + ${tagGap}px)`,marginLeft:'0px'});
        const bounds=tag.getBoundingClientRect();
        const dx=bounds.left<screen.left+12?screen.left+12-bounds.left:bounds.right>screen.right-12?screen.right-12-bounds.right:0;
        tag.style.marginLeft=dx+'px';
      }
    } catch (error) { console.warn('Battle ground alignment:', error.message); }
  }
  new ResizeObserver(align).observe(gameScreen);
  new ResizeObserver(align).observe(hero);
  const panel=gameScreen.querySelector('.play-panel');
  if(panel)new ResizeObserver(align).observe(panel);
  new MutationObserver(align).observe(enemyLayer, {childList:true,subtree:true,attributes:true,attributeFilter:['data-boss-clip']});
  new MutationObserver(align).observe(hero, {attributes:true,attributeFilter:['class','style']});
  window.BattleGround = Object.freeze({align});
})();
