/* Facing changes only artwork: questions and keyboard lanes are never mirrored. */
(() => {
  const directory='assets/generated/minion-directions-v1/';
  const directions={down:directory+'idle-1.png',up:directory+'idle-2.png',left:directory+'idle-3.png',right:directory+'idle-4.png'};
  const families=Object.fromEntries(["digit-monster-1","digit-monster-3","digit-monster-4","digit-monster-8","letter-monster-C","letter-monster-D","letter-monster-F","letter-monster-I","letter-monster-J","letter-monster-K","letter-monster-L","letter-monster-M","letter-monster-N","letter-monster-O","letter-monster-P","letter-monster-Q","letter-monster-R","letter-monster-S","letter-monster-U","letter-monster-V","letter-monster-W","letter-monster-X","letter-monster-Z","zhuyin-final-a","zhuyin-final-an","zhuyin-final-ang","zhuyin-final-eng","zhuyin-initial-b","zhuyin-initial-c","zhuyin-initial-j","zhuyin-initial-k","zhuyin-initial-l","zhuyin-initial-m","zhuyin-initial-sh","zhuyin-initial-zh","zhuyin-medial-wu","zhuyin-medial-yi","zhuyin-medial-yu"].map(name=>[name,name]));
  Object.assign(families,{'letter-monster-E':'digit-monster-3','letter-monster-G':'digit-monster-4'});
  const frames={down:1,up:2,left:3,right:4};
  // Reviewed side profiles in docs/minion-source-review.png. Other originals are frontal.
  const profiles=new Map(['letter-monster-Q.png','letter-monster-X.png','letter-monster-Y.png','letter-monster-Z.png','zhuyin-initial-j.png','zhuyin-initial-sh.png','zhuyin-medial-yu.png'].map(name=>[name,'left']));
  const directionalSources=new Map([['assets/pixel-enemy-left.png','left'],['assets/pixel-enemy-right.png','right']]);
  function resolve(enemy,source){
    const target=heroPoint(),dx=target.x-enemy.x,dy=target.y-enemy.y;
    const family=families[source.split('/').pop().replace(/\.png$/,'')];
    if(family){const facing=Math.abs(dx)<8&&Math.abs(dy)>2?(dy>0?'down':'up'):(dx>=0?'right':'left');return {facing,source:`assets/generated/minion-views-v1/${family}/idle-${frames[facing]}.png`,mirror:1,originalFacing:'directional'};}
    const facing=Math.abs(dx)<8&&Math.abs(dy)>2?(dy>0?'down':'up'):(dx>=0?'right':'left');
    const originalFacing=profiles.get(source.split('/').pop())||directionalSources.get(source)||'front';
    // Front-facing slime family can use matching profile art without mirroring a face.
    if(/letter-monster-A\.png$/.test(source)||/^assets\/pixel-enemy-(down|up|left|right)\.png$/.test(source))return {facing,source:directions[facing],mirror:1,originalFacing:'directional'};
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
  window.MinionFacing=Object.freeze({resolve,directions,families:Object.freeze(families),profiles:Object.freeze(Object.fromEntries(profiles))});
})();
