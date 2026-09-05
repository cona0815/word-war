/* Use accepted level-specific clips, never a different level's body. */
(() => {
  const clips={
    'male:1:starlight':{url:'assets/generated/hero-cast-lv1-v1/cast-strip.png',width:896},
    'female:1:starlight':{url:'assets/generated/hero-female-cast-lv1-v1/cast-strip.png',width:896},
    'male:1:shadow':{url:'assets/generated/hero-male-shadow-cast-lv1-v1/cast-strip.png',width:1152},
    'female:1:shadow':{url:'assets/generated/hero-female-shadow-cast-lv1-v1/cast-strip.png',width:1152}
  };
  let request=0,animation=null;
  const previousStop=stopHeroMotion;
  stopHeroMotion=()=>{
    request++;animation?.cancel();animation=null;previousStop();
    ['background-image','background-size','background-position','animation','aspect-ratio'].forEach(k=>big.style.removeProperty(k));
    delete big.dataset.castClip;
  };
  startHeroMotion=async()=>{
    stopHeroMotion();
    const current=request,clip=clips[`${hero}:${level}:${weapon}`];
    if(!clip){big.classList.add('cast');return}
    try{
      const image=new Image();image.src=clip.url;await image.decode();
      if(current!==request)return;
      big.style.width=`${Math.min(250,big.parentElement.clientWidth*.9*768/clip.width)*clip.width/768}px`;
      big.style.aspectRatio=`${clip.width}/648`;
      big.style.backgroundImage=`url("${clip.url}")`;big.style.backgroundSize='600% 100%';big.style.backgroundPosition='0% 0%';big.style.animation='none';big.style.setProperty('--face',face);
      big.dataset.castClip=clip.url;
      animation=big.animate([0,1,2,3,4,5,0].map((n,i)=>({backgroundPosition:`${n*20}% 0`,offset:[0,.1,.25,.42,.65,.82,1][i],easing:'steps(1,end)'})),{duration:650,iterations:Infinity});
    }catch{if(current===request)big.classList.add('cast')}
  };
  const previousSet=setHero;
  setHero=()=>{
    const clip=clips[`${hero}:${level}:${weapon}`];
    big.style.width=clip?`${Math.min(250,big.parentElement.clientWidth*.9*768/clip.width)}px`:'';
    previousSet();
    gearNote.textContent=`${weapons[weapon].name} | ${(gearOptions[gear]||gearOptions.focus).name}`;
  };
  window.addEventListener('resize',()=>setHero());
  setHero();
})();
