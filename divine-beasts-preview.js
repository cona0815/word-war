(() => {
 const $=id=>document.getElementById(id),caster=$('beast'),status=$('status'),select=$('beastSelect');
 const engine=SpellFlight.create({layer:$('effects')});let generation=0,selected='p1',players=[],busy=false,paused=false;
 DivineBeasts.forEach((beast,i)=>select.add(new Option(beast.name,String(i))));
 function controls(){for(const id of ['small','ultimate'])$(id).disabled=busy||paused}
 function drawPlayers(){
   $('targets').replaceChildren();players=[];const count=Number($('partySize').value);
   for(let i=0;i<count;i++){
     const node=document.createElement('div');node.className='target';node.dataset.targetId=`p${i+1}`;
     node.style.left=`${count===1?22:9+(i%2)*19}%`;node.style.top=`${count===1?53:8+Math.floor(i/2)*22}%`;
     const sprite=new Image();sprite.src=`assets/generated/hero-weapons-normalized-v2/hero-${i%2?'female':'male'}-lv1-starlight.png`;sprite.alt=`角色 ${i+1}`;
     const label=document.createElement('span');node.append(sprite,label);$('targets').append(node);
     const player={id:`p${i+1}`,element:node,anchor:{x:.5,y:.4},hp:100,label,alive:()=>player.hp>0,
       onHit(hit){player.hp=Math.max(0,player.hp-hit.damage);label.textContent=`${player.id}｜HP ${player.hp}`;node.animate([{filter:'brightness(1)'},{filter:'brightness(2)',offset:.3},{filter:'brightness(1)'}],{duration:350});status.textContent=`${DivineBeasts[select.value].name} 命中 ${player.id}，扣 ${hit.damage} HP`;}
     };players.push(player);label.textContent=`${player.id}｜HP 100`;node.onclick=()=>{selected=player.id;highlight()};
   }
   selected='p1';highlight();
 }
 function highlight(){players.forEach(p=>p.element.classList.toggle('selected',p.id===selected))}
 async function load(){generation++;engine.cancel();busy=true;controls();drawPlayers();const beast=DivineBeasts[select.value];caster.src=beast.body.small.urls[0];
   status.textContent='載入 '+beast.name+'…';const current=generation;
   try{await SpellFlight.preload([...beast.body.small.urls,...beast.body.ultimate.urls,...beast.fx.small.urls,...beast.fx.ultimate.urls]);if(current!==generation)return;status.textContent=`${beast.name}｜小招：${beast.small}｜大招：${beast.ultimate}`;}
   catch{if(current!==generation)return;status.textContent='素材載入失敗，請重新整理';return}
   busy=false;controls();
 }
 async function attack(kind,targetIds=[selected]){
   if(busy||paused)return[];const targets=players.filter(p=>targetIds.includes(p.id)&&p.hp>0);if(!targets.length){status.textContent='請重置生命或選擇其他角色';return[]}
   busy=true;controls();const current=generation,beast=DivineBeasts[select.value];status.textContent=beast.name+' 蓄力：'+beast[kind];
   try{return await engine.attack({caster,beast,kind,targets,damage:kind==='small'?10:25,valid:()=>generation===current})}
   finally{if(current===generation){busy=false;controls()}}
 }
 $('small').onclick=()=>attack('small');$('ultimate').onclick=()=>attack('ultimate');
 $('pause').onclick=()=>{paused=!paused;paused?engine.pause():engine.resume();$('pause').textContent=paused?'繼續':'暫停';controls()};
 $('reset').onclick=()=>{if(paused){paused=false;engine.resume();$('pause').textContent='暫停'}load()};select.onchange=load;$('partySize').onchange=load;
 window.DivinePreview={attack,engine,inspect:()=>({busy,generation,players:players.map(p=>({id:p.id,hp:p.hp}))})};load();
})();
