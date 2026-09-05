/* Use accepted level-specific clips, never a different level's body. */
(() => {
  const clips=HeroCastClips;
  let request=0,animation=null;
  const previousStop=stopHeroMotion;
  stopHeroMotion=()=>{
    request++;animation?.cancel();animation=null;previousStop();
    ['background-image','background-size','background-position','animation','aspect-ratio','width'].forEach(k=>big.style.removeProperty(k));
    delete big.dataset.castClip;
  };
  const showClip=async(play)=>{
    stopHeroMotion();
    const current=request,clip=clips[`${hero}:${level}:${weapon}`];
    if(!clip){if(play)big.classList.add('cast');return}
    try{
      const image=new Image();image.src=clip.url;await image.decode();
      if(current!==request)return;
      big.style.width=`${Math.min(250,big.parentElement.clientWidth*.9*768/clip.width)*clip.width/768}px`;
      big.style.aspectRatio=`${clip.width}/648`;
      big.style.backgroundImage=`url("${clip.url}")`;big.style.backgroundSize='600% 100%';big.style.backgroundPosition='0% 0%';big.style.animation='none';big.style.setProperty('--face',face);
      big.dataset.castClip=clip.url;
      if(play)animation=big.animate([0,1,2,3,4,5,0].map((n,i)=>({backgroundPosition:`${n*20}% 0`,offset:[0,.1,.25,.42,.65,.82,1][i],easing:'steps(1,end)'})),{duration:clip.duration,iterations:Infinity});
    }catch{if(current===request&&play)big.classList.add('cast')}
  };
  startHeroMotion=()=>showClip(true);
  const previousSet=setHero;
  setHero=()=>{
    previousSet();
    if(mode==='idle')showClip(false);
    gearNote.textContent=`${weapons[weapon].name} | ${(gearOptions[gear]||gearOptions.focus).name}`;
  };
  const previousGrid=renderGrid;
  renderGrid=()=>{
    previousGrid();
    grid.querySelectorAll('[data-lv]').forEach(card=>{
      const clip=clips[`${hero}:${card.dataset.lv}:${weapon}`];
      if(!clip)return;
      const sprite=card.querySelector('.sprite'),url=clip.url.replace(/cast-strip\.png$/,'idle.png');
      const image=new Image();image.src=url;
      image.decode().then(()=>{
        if(!sprite.isConnected)return;
        sprite.style.setProperty('--hero',`url("${url}")`);
        sprite.style.setProperty('--face','1');
        sprite.style.backgroundSize='auto 100%';
        sprite.dataset.clipIdle=url;
      }).catch(()=>{});
    });
  };
  window.addEventListener('resize',()=>setHero());
  renderGrid();
  setHero();
})();
