/* Shared, decoded six-pose clips for battle and both preview surfaces. */
(() => {
  const names = {1:'bade',2:'sanda',3:'wulun',4:'rumu',5:'growth',6:'lamb',7:'childheart',8:'daqiao',9:'daqiao'};
  const decoded = new Map(), animations = new WeakMap();
  const url = stage => `assets/generated/boss-cast-v1/${names[stage]}/cast-strip.png`;
  async function preload(stage) {
    const src = url(stage);
    if (!decoded.has(src)) {
      const task = (async () => {
        const img = new Image(); img.src = src;
        await img.decode();
        if (img.naturalWidth !== 3072 || img.naturalHeight !== 512) throw new Error('Boss animation dimensions invalid');
        return src;
      })();
      decoded.set(src, task);
      task.catch(() => decoded.delete(src));
    }
    return decoded.get(src);
  }
  function frame(node, index) {
    animations.get(node)?.cancel();
    node.style.backgroundPosition = `${Math.max(0,Math.min(5,index))*20}% 0%`;
  }
  function play(node, {duration=1600, releaseAt=950, loop=false}={}) {
    if (!node?.dataset.bossClip) return null;
    animations.get(node)?.cancel();
    const release = releaseAt / duration;
    const positions = [0,1,2,3,4,5,0];
    const offsets = [0,release*.38,release*.76,release,release+(1-release)*.42,release+(1-release)*.78,1];
    const animation = node.animate(positions.map((n,i) => ({backgroundPosition:`${n*20}% 0%`,offset:offsets[i],easing:'steps(1,end)'})),
      {duration,iterations:loop?Infinity:1,fill:'none'});
    animations.set(node, animation);
    animation.finished.then(() => node.closest('.boss')?.classList.remove('boss-strike')).catch(() => {});
    return animation;
  }
  async function mount(node, stage, {loop=false}={}) {
    if (!node) return;
    const request=String(stage);node.dataset.bossRequest=request;
    const src=await preload(stage);
    if (!node.isConnected || node.dataset.bossRequest!==request) return;
    animations.get(node)?.cancel();
    node.dataset.bossClip=String(stage);
    node.style.backgroundImage=`url("${src}")`;
    node.style.backgroundSize='600% 100%';
    node.style.backgroundRepeat='no-repeat';
    node.style.animation='none';
    node.style.backgroundPosition='0% 0%';
    if(loop)play(node,{duration:2400,releaseAt:1400,loop:true});
  }
  window.BossMotion=Object.freeze({preload,mount,play,frame,url});
})();
