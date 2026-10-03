/* Local visual timeline; damage belongs to the caller and is emitted only at impact.
   Future networking must validate attack IDs and damage on an authoritative server. */
(() => {
  const decode=new Map();
  function preload(urls){return Promise.all(urls.map(src=>{if(!decode.has(src)){const image=new Image();image.src=src;const pending=image.decode();decode.set(src,pending);pending.catch(()=>decode.delete(src))}return decode.get(src)}))}
  function create({layer,isValid=()=>true}){
    let paused=false,last=performance.now(),time=0,raf=0,serial=0;
    const actions=new Set(),history=[];
    const point=(node,anchor={x:.5,y:.48})=>{const r=node.getBoundingClientRect(),l=layer.getBoundingClientRect();return{x:r.left+r.width*anchor.x-l.left,y:r.top+r.height*anchor.y-l.top}};
    function loop(now){const dt=now-last;last=now;if(!paused)time+=dt;
      if(!paused)for(const action of [...actions])action.step(time-action.start);
      if(actions.size)raf=requestAnimationFrame(loop);else raf=0;
    }
    function task(step,cancel){const action={start:time,step,cancel};actions.add(action);if(!raf){last=performance.now();raf=requestAnimationFrame(loop)}return action}
    function image(size,className){const node=document.createElement('img');node.className=className;Object.assign(node.style,{position:'absolute',width:`${size}px`,height:`${size}px`,objectFit:'contain',imageRendering:'pixelated',pointerEvents:'none',transform:'translate(-50%,-50%)',zIndex:'20'});layer.append(node);return node}
    function setFrame(node,urls,index){const src=urls[Math.min(urls.length-1,Math.max(0,index))];if(node.getAttribute('src')!==src)node.src=src}
    async function attack({caster,beast,kind='small',targets,damage=10,flightMs=650,valid=()=>true}){
      const recipients=[...new Map(targets.map(target=>[target.id,target])).values()];
      if(recipients.length>8)throw new RangeError('A party supports at most eight targets');
      const body=beast.body[kind],fx=beast.fx[kind];
      const live=()=>isValid()&&valid()&&caster.isConnected;
      await preload([...body.urls,...fx.urls]);if(!live())return[];
      const id=++serial,stepMs=kind==='small'?130:160,releaseAt=body.releaseFrame*stepMs;
      const original=caster.getAttribute('src');let launched=false;
      let resolve;const completion=new Promise(r=>resolve=r),pending=new Set(recipients.map(t=>t.id)),hits=[];
      const done=()=>{if(!pending.size)resolve(hits)};
      const bodyAction=task(elapsed=>{
        if(!live()){caster.setAttribute('src',original);actions.delete(bodyAction);resolve([]);return}
        setFrame(caster,body.urls,Math.floor(elapsed/stepMs));
        if(elapsed>=releaseAt&&!launched){launched=true;for(const target of recipients)launch(target);done()}
        if(elapsed>=body.urls.length*stepMs){caster.setAttribute('src',original);actions.delete(bodyAction)}
      },()=>{caster.setAttribute('src',original);resolve([])});
      function launch(target){
        if(!target.element.isConnected||target.alive?.()===false){pending.delete(target.id);done();return}
        const from=point(caster,beast.muzzles?.[kind]||beast.muzzle),node=image(kind==='small'?100:180,'spell-projectile');
        node.dataset.attackId=String(id);node.dataset.targetId=target.id;
        const action=task(elapsed=>{
          if(!live()||!target.element.isConnected||target.alive?.()===false){node.remove();actions.delete(action);pending.delete(target.id);done();return}
          const to=point(target.element,target.anchor),progress=Math.min(1,elapsed/flightMs);
          node.style.left=`${from.x+(to.x-from.x)*progress}px`;node.style.top=`${from.y+(to.y-from.y)*progress}px`;
          const angle=Math.atan2(to.y-from.y,to.x-from.x)*180/Math.PI-180;
          node.style.transform=`translate(-50%,-50%) rotate(${angle}deg)`;
          setFrame(node,fx.urls,1+Math.floor(progress*Math.max(1,fx.peakFrame)));
          if(progress<1)return;
          node.remove();actions.delete(action);
          const hit={attackId:id,targetId:target.id,x:to.x,y:to.y,damage};history.push(hit);if(history.length>64)history.shift();hits.push(hit);
          impact(to,fx);target.onHit?.(hit);pending.delete(target.id);done();
        },()=>{node.remove();pending.delete(target.id);done()});
      }
      function impact(at,fx){const node=image(kind==='small'?130:230,'spell-impact');node.style.left=`${at.x}px`;node.style.top=`${at.y}px`;
        const frames=fx.urls.slice(fx.peakFrame),action=task(elapsed=>{if(!live()||elapsed>=frames.length*110){node.remove();actions.delete(action);return}setFrame(node,frames,Math.floor(elapsed/110))},()=>node.remove());
      }
      return completion;
    }
    return Object.freeze({attack,preload,pause(){paused=true},resume(){paused=false;last=performance.now()},cancel(){for(const a of actions)a.cancel?.();actions.clear();cancelAnimationFrame(raf);raf=0},inspect:()=>({paused,active:actions.size,hits:history.map(h=>({...h}))})});
  }
  window.SpellFlight=Object.freeze({create,preload});
})();
