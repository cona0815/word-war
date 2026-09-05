/* Only claim physical keys for an active matching exercise; native IME stays native. */
(() => {
  const keys = {'1':'ㄅ',q:'ㄆ',a:'ㄇ',z:'ㄈ','2':'ㄉ',w:'ㄊ',s:'ㄋ',x:'ㄌ',e:'ㄍ',d:'ㄎ',c:'ㄏ',r:'ㄐ',f:'ㄑ',v:'ㄒ','5':'ㄓ',t:'ㄔ',g:'ㄕ',b:'ㄖ',y:'ㄗ',h:'ㄘ',n:'ㄙ',u:'ㄧ',j:'ㄨ',m:'ㄩ','8':'ㄚ',i:'ㄛ',k:'ㄜ',',':'ㄝ','9':'ㄞ',o:'ㄟ',l:'ㄠ','.':'ㄡ','0':'ㄢ',p:'ㄣ',';':'ㄤ','/':'ㄥ','-':'ㄦ','6':'ˊ','3':'ˇ','4':'ˋ','7':'˙'};
  const punctuation = {',':'，','.':'。','?':'？','!':'！',':':'：','\\':'、','[':'「',']':'」'};
  window.TypingHints={firstKey(word){
    const raw=String(word||'').trim(),hot=raw.toUpperCase().match(/CTRL\s*\+\s*[A-Z]/);
    if(hot)return hot[0].replace(/\s/g,'');
    const first=raw[0],symbol=hanInitial.get(first)||first;
    const physical=Object.keys(keys).find(key=>keys[key]===symbol)||Object.keys(punctuation).find(key=>punctuation[key]===symbol);
    return physical?physical.toUpperCase():/^[A-Za-z0-9]$/.test(first)?first.toUpperCase():null;
  }};
  document.addEventListener('keydown', event => {
    if(!state.running||!mission.classList.contains('hidden')||drawer.classList.contains('open')||event.isComposing||composing)return;
    if(isEditingTarget(event.target)&&event.target!==answerInput)return;
    const targets=state.bossMode?[state.current].filter(Boolean):state.enemies.filter(isActive);
    const words=targets.map(e=>String(e.word).trim());
    const claim=()=>{event.preventDefault();event.stopImmediatePropagation()};
    if(event.repeat){
      if(event.key==='Backspace'||event.key==='Delete')return;
      claim();return;
    }
    if(event.ctrlKey&&!event.altKey&&!event.metaKey){
      const key=`CTRL+${event.key.toUpperCase()}`;
      const word=words.find(w=>w.toUpperCase().replace(/\s/g,'').includes(key));
      if(word&&['CTRL+C','CTRL+V','CTRL+Z','CTRL+A'].includes(key)){claim();submit(word)}
      return;
    }
    if(event.ctrlKey||event.altKey||event.metaKey)return;
    const phonetic=words.filter(w=>/^[\u3105-\u3129]+[ˊˇˋ˙]?$/.test(w));
    const symbolOnly=words.filter(w=>/^[，。？！：、「」]+$/.test(w));
    const mapped=phonetic.length?keys[event.key.toLowerCase()]:symbolOnly.length?punctuation[event.key]:null;
    if(!mapped)return;
    claim();
    const pool=phonetic.length?phonetic:symbolOnly;
    const prefix=answerInput.value;
    let value=prefix+mapped;
    if(!pool.some(w=>w.startsWith(value))&&pool.some(w=>w.startsWith(mapped)))value=mapped;
    answerInput.value=value;
    if(pool.includes(value)&&!pool.some(w=>w!==value&&w.startsWith(value))){submit(value);return}
    if(!pool.some(w=>w.startsWith(value))){submit(value)}
  },true);
})();
