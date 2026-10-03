/* Facing changes only artwork: questions and keyboard lanes are never mirrored. */
(() => {
  const directory='assets/generated/minion-directions-v1/';
  const directions={down:directory+'idle-1.png',up:directory+'idle-2.png',left:directory+'idle-3.png',right:directory+'idle-4.png'};
  // Reviewed side profiles in docs/minion-source-review.png. Other originals are frontal.
  const profiles=new Map(['letter-monster-Q.png','letter-monster-X.png','letter-monster-Y.png','letter-monster-Z.png','zhuyin-initial-j.png','zhuyin-initial-sh.png','zhuyin-medial-yu.png'].map(name=>[name,'left']));
  const directionalSources=new Map([['assets/pixel-enemy-left.png','left'],['assets/pixel-enemy-right.png','right']]);
  function resolve(enemy,source){
    const target=heroPoint(),dx=target.x-enemy.x,dy=target.y-enemy.y;
    // A narrow central column uses true front/back poses. Diagonal lanes keep their family.
    if(Math.abs(dx)<8&&Math.abs(dy)>2){const facing=dy>0?'down':'up';return {facing,source:directions[facing],mirror:1,originalFacing:'directional'};}
    const facing=dx>=0?'right':'left';
    const originalFacing=profiles.get(source.split('/').pop())||directionalSources.get(source)||'front';
    // Front-facing slime family can use matching profile art without mirroring a face.
    if(/letter-monster-A\.png$/.test(source))return {facing,source:directions[facing],mirror:1,originalFacing:'directional'};
    return {facing,source,mirror:originalFacing==='front'||originalFacing===facing?1:-1,originalFacing};
  }
  const originalRender=render;
  render=(...args)=>{
    const result=originalRender(...args);if(state.bossMode)return result;
    enemyLayer.querySelectorAll('.enemy').forEach(node=>{
      const enemy=state.enemies.find(e=>String(e.order)===node.dataset.order),image=node.querySelector('img');
      if(!enemy||!image)return;
      const facing=resolve(enemy,MinionSprites.source(levels[state.levelIndex],enemy.word));
      node.dataset.facing=facing.facing;node.dataset.sourceFacing=facing.originalFacing;
      image.src=MinionSprites.decoded(facing.source);
      image.style.transform=`scaleX(${facing.mirror})`;
    });
    return result;
  };
  window.MinionFacing=Object.freeze({resolve,directions,profiles:Object.freeze(Object.fromEntries(profiles))});
})();
