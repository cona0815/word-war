(() => {
  const chosen=new URLSearchParams(location.search).get('cover');
  if(!['a','b','c'].includes(chosen))return;
  loginScreen.dataset.cover=chosen;
  const names={a:'史詩校園',b:'星辰魔法',c:'決戰雙主角'};
  const nav=document.createElement('nav');nav.className='cover-switch';nav.setAttribute('aria-label','封面版本');
  for(const version of ['a','b','c']){
    const link=document.createElement('a'),url=new URL(location.href);url.searchParams.set('cover',version);
    link.href=url.href;link.textContent=`${version.toUpperCase()} ${names[version]}`;
    if(version===chosen)link.setAttribute('aria-current','page');nav.appendChild(link);
  }
  loginScreen.appendChild(nav);
})();
