/* Exercise input owns number keys whenever it can conflict with a shortcut. */
(() => {
  const panel=document.getElementById('battleItems'),meter=document.getElementById('ultimateMeter');
  const narrow=matchMedia('(max-width:600px)');
  function place(){
    if(narrow.matches){gameScreen.querySelector('.play-panel').append(panel);panel.before(meter)}
    else gameScreen.append(panel,meter);
  }
  narrow.addEventListener('change',place);place();
  const items=['potion','shield','hourglass','hint',null,'comboStar'];
  const release=document.querySelector('.ultimate-actions button:nth-child(2)');
  items.forEach((id,i)=>{
    const button=id?document.querySelector(`#battleItems [data-item="${id}"]`):release;
    button.dataset.shortcut=String(i+1);
    button.title+=`（快捷鍵 ${i+1}）`;
  });
  function available(event){
    if(!state.running||!mission.classList.contains('hidden')||drawer.classList.contains('open')||document.querySelector('#gmPanel')?.open)return false;
    if(event.isComposing||composing||event.keyCode===229||event.ctrlKey||event.altKey||event.metaKey||event.shiftKey)return false;
    if(isEditingTarget(event.target)&&event.target!==answerInput)return false;
    // Chinese lessons and the mixed ladder must retain native IME number selection.
    if([3,4,5,6,8,9].includes(levels[state.levelIndex].id))return false;
    const targets=state.bossMode?[state.current].filter(Boolean):state.enemies.filter(isActive);
    return targets.length>0&&!targets.some(target=>/[0-9\u3105-\u3129\u3400-\u9fffˊˇˋ˙]/.test(target.word));
  }
  document.addEventListener('keydown',event=>{
    if(event.defaultPrevented||! /^[1-6]$/.test(event.key)||!available(event))return;
    event.preventDefault();event.stopImmediatePropagation();
    if(event.repeat)return;
    const id=items[Number(event.key)-1];
    const button=id?document.querySelector(`#battleItems [data-item="${id}"]`):release;
    if(!button.disabled)button.click();
  },true);
})();
