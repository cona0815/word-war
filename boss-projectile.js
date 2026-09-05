/* A visible flight must finish before the caller applies damage. */
(() => {
  const style=document.createElement('style');
  style.textContent='.boss-bolt{position:absolute;z-index:6;width:110px;height:32px;pointer-events:none;border-radius:50%;background:radial-gradient(ellipse at 25% 50%,white 0 12%,#fff08a 22%,#ff853d 48%,transparent 72%);filter:drop-shadow(0 0 10px #ffb647)}.boss-hit{position:absolute;z-index:6;width:90px;height:90px;pointer-events:none;border-radius:50%;border:6px solid #ffe491;box-shadow:0 0 22px #ff9b36,inset 0 0 18px #fff0b6;transform:translate(-50%,-50%)}';
  document.head.append(style);
  async function fire(){
    const boss=document.querySelector('#bossEntity .boss-sprite');if(!boss)return false;
    const generation=battleVisualGeneration,screen=gameScreen.getBoundingClientRect(),b=boss.getBoundingClientRect(),h=hero.getBoundingClientRect();
    const from={x:b.left+b.width*.25-screen.left,y:b.top+b.height*.55-screen.top};
    const to={x:h.left+h.width*.5-screen.left,y:h.top+h.height*.5-screen.top};
    const bolt=document.createElement('div');bolt.className='boss-bolt';bolt.style.left=`${from.x-55}px`;bolt.style.top=`${from.y-16}px`;effectLayer.append(bolt);
    const animation=bolt.animate([{translate:'0px 0px'},{translate:`${to.x-from.x}px ${to.y-from.y}px`}],{duration:650,easing:'linear',fill:'forwards'});
    try{await animation.finished}finally{bolt.remove()}
    if(generation!==battleVisualGeneration||!state.running||!state.bossMode)return false;
    const hit=document.createElement('div');hit.className='boss-hit';hit.style.left=`${to.x}px`;hit.style.top=`${to.y}px`;effectLayer.append(hit);
    hit.animate([{opacity:1,scale:.4},{opacity:0,scale:1.4}],{duration:400}).finished.then(()=>hit.remove());
    hero.animate([{filter:'brightness(1)'},{filter:'brightness(1.8)',offset:.3},{filter:'brightness(1)'}],{duration:350});
    return true;
  }
  window.BossProjectile=Object.freeze({fire});
})();
