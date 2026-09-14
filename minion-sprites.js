/* Decode once before rendering: slow or missing files never show broken <img>. */
(() => {
  const original=monster,cache=new Map();
  const fallback='data:image/svg+xml,'+encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="112" height="112" viewBox="0 0 112 112"><path d="M16 84Q5 55 32 39Q46 9 66 36Q100 39 98 82Q95 103 57 100Q23 103 16 84" fill="#79ced1" stroke="#235d72" stroke-width="4"/><ellipse cx="40" cy="65" rx="5" ry="8" fill="#163747"/><ellipse cx="73" cy="65" rx="5" ry="8" fill="#163747"/><path d="M45 82Q57 93 70 81" fill="none" stroke="#163747" stroke-width="4"/></svg>');
  monster=(lv,word)=>{
    const src=original(lv,word);let entry=cache.get(src);
    if(!entry){entry={ready:false,failed:false};cache.set(src,entry);const image=new Image();image.src=src;image.decode().then(()=>{entry.ready=true;if(state.running&&!state.bossMode)render()}).catch(()=>{entry.failed=true})}
    return entry.ready?src:fallback;
  };
  // A later HTTP/cache failure must also fall back, without affecting the question.
  enemyLayer.addEventListener('error',event=>{if(event.target.matches?.('.enemy img'))event.target.src=fallback},true);
  window.MinionSprites=Object.freeze({source:original,inspect:()=>[...cache].map(([src,e])=>({src,...e}))});
})();
