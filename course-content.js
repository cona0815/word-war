/* Eight campus stages stay foundational. Legacy question bank IDs 7/8
 * remain English/Chinese storage categories, now consumed by the ladder. */
(function(root){
  const split=s=>s.split(' ');
  const stages={
    2:{waveSets:[split('an is it up at in on to am my'),split('cat dog sun pen cup bus egg red hat bed'),split('book desk fish bird milk tree star ball blue hand'),split('an cat sun book desk pen dog fish tree milk')]},
    3:{waveSets:[split('ㄅ ㄆ ㄇ ㄈ ㄉ ㄊ ㄋ ㄌ'),split('ㄍ ㄎ ㄏ ㄐ ㄑ ㄒ ㄓ ㄔ ㄕ ㄖ ㄗ ㄘ ㄙ'),split('ㄚ ㄛ ㄜ ㄝ ㄞ ㄟ ㄠ ㄡ ㄢ ㄣ ㄤ ㄥ ㄦ'),split('ㄧ ㄨ ㄩ ㄅ ㄇ ㄚ ㄓ ㄕ ㄞ ㄣ')]},
    4:{title:'單聲調與標點',type:'聲調符號',mode:'phonics',mission:'Cona 智者：一次練一個聲調或標點。切換英數模式：6 是二聲、3 是三聲、4 是四聲、7 是輕聲。一聲不標，不另外出題。',waveSets:[split('ˊ ˇ'),split('ˋ ˙'),split('ˊ ˇ ˋ ˙'),split('， 。 ？ ！ ： 、 「 」')]},
    5:{waveSets:[split('人 口 手 山 水 心 目 耳'),split('火 木 日 月 田 雨 花 草'),split('學 校 書 課 師 字 筆 本'),split('大 橋 班 電 腦 門 園 友')]},
    6:{waveSets:[split('學校 老師 同學 教室 書本 上課 下課 作業'),split('電腦 鍵盤 滑鼠 螢幕 打字 網路 資料 檔案'),split('圖書館 電腦課 小朋友 打字王 遊樂場 運動會'),['複製 Ctrl+C','貼上 Ctrl+V','復原 Ctrl+Z','全選 Ctrl+A']]},
    7:{title:'英文單字挑戰',type:'英文單字',mode:'words',boss:'Lv.7 Boss | 單字守護龍',mission:'Cona 智者：用動物、食物、校園與生活單字挑戰自己。最多六個字母；敵人更快，也會多隻同時靠近。',waveSets:[split('cat dog bird fish duck frog bear lion tiger rabbit'),split('egg milk cake rice apple bread grape lemon melon banana'),split('pen book desk bag ruler chair class school paper pencil'),split('red blue green hand foot head nose happy smile friend')]},
    8:{title:'中文詞語挑戰',type:'中文詞語',mode:'phrases',boss:'Lv.8 Boss | 詞語守護獸',mission:'Cona 智者：最後一顆寶石！練習多樣的二到四字詞語，留意同時出現的敵人；完整句子留到大橋堂。',waveSets:[split('學校 老師 同學 教室 操場 校園 書本 鉛筆'),split('白雲 太陽 月亮 星星 花朵 小草 河流 雨水'),split('圖書館 電腦課 小朋友 遊樂場 運動會 紅綠燈'),split('大橋國小 資訊教室 校園生活 交通安全 愛護公物 互相幫助')]}
  };
  const sentences={en:['I am happy.','This is my pen.','I like cats.','I see a dog.','It is red.','I can type.','We are friends.','Are you OK?'],zh:['我會打字。','我愛學校。','今天很開心。','我們是朋友。','請愛惜書本。','我會用滑鼠。','你準備好了嗎？','一起加油！']};
  const initials={心:'ㄒ',目:'ㄇ',耳:'ㄦ',雨:'ㄩ',花:'ㄏ',草:'ㄘ',字:'ㄗ',筆:'ㄅ',本:'ㄅ',門:'ㄇ',園:'ㄩ',友:'ㄧ',上:'ㄕ',下:'ㄒ',作:'ㄗ',打:'ㄉ',網:'ㄨ',檔:'ㄉ',遊:'ㄧ',運:'ㄩ',操:'ㄘ',鉛:'ㄑ',白:'ㄅ',太:'ㄊ',星:'ㄒ',河:'ㄏ',紅:'ㄏ',交:'ㄐ',愛:'ㄞ',互:'ㄏ'};
  const pacing=[null,{gap:2200,laneGap:3600,max:2,speed:.028},{gap:3300,laneGap:5200,max:2,speed:.030},{gap:2000,laneGap:3300,max:3,speed:.032},{gap:1900,laneGap:3100,max:3,speed:.034},{gap:3100,laneGap:4800,max:3,speed:.036},{gap:2800,laneGap:4400,max:3,speed:.038},{gap:2500,laneGap:4000,max:4,speed:.040},{gap:2300,laneGap:3800,max:4,speed:.042},{gap:5200,laneGap:7600,max:3,speed:.030}];
  function simpleSentence(text,mode){const s=String(text||'').trim();return mode==='en'?s.length<=40&&s.split(/\s+/).length<=7&&/^[A-Za-z][A-Za-z ,'.!?-]*[.!?]$/.test(s):s.length<=16&&/^[\u4e00-\u9fff，、？！。]+[。？！]$/.test(s)}
  function sentencePool(rows,mode){const custom=(rows||[]).filter(q=>q.stage===(mode==='en'?7:8)&&q.mode===mode&&q.enabled!==false&&Number(q.difficulty||1)<=2).map(q=>q.answer||q.prompt).filter(s=>simpleSentence(s,mode));return custom.length?[...new Set(custom)]:sentences[mode].slice()}
  function apply(levels){for(const lv of levels){const update=stages[lv.id];if(update)Object.assign(lv,update);if(lv.id<=8){lv.words=[...new Set(lv.waveSets.flat())];lv.bossWords=lv.words.slice();lv.count=lv.words.length;lv.speed=pacing[lv.id].speed}}}
  root.CourseContent={apply,initials,pacing,sentences,sentencePool,simpleSentence};
})(globalThis);
