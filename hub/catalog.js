/* HB Hub — keyboard-accessible, Persian-aware app directory. No user data stored. */
(function(){'use strict';
 const input=document.getElementById('superSearch');
 const buttons=[...document.querySelectorAll('[data-super-filter]')];
 const groups=[...document.querySelectorAll('.super-group')];
 const empty=document.getElementById('superEmpty');
 const reset=document.getElementById('superReset');
 const status=document.getElementById('superResultCount');
 const menu=document.querySelector('.menu-toggle');
 const nav=document.getElementById('topnav');
 if(!input||!groups.length||!empty)return;
 let active='all';
 const allApps=[...document.querySelectorAll('.super-app-link')];
 const language=()=>document.documentElement.lang==='fa'?'fa':'en';
 function normalize(value){
  return String(value||'').normalize('NFKC').toLocaleLowerCase()
   .replace(/[يى]/g,'ی').replace(/ك/g,'ک')
   .replace(/[\u064b-\u065f\u0670]/g,'')
   .replace(/[\u200c\u200d]/g,' ')
   .replace(/\s+/g,' ').trim();
 }
 const squash=s=>s.replace(/\s/g,'');
 const texts=new Map(allApps.map(a=>[a,normalize([
  a.dataset.search,
  ...[...a.querySelectorAll('[data-en][data-fa]')].flatMap(el=>[el.dataset.en,el.dataset.fa])
 ].join(' '))]));
 function update(){
  const query=normalize(input.value),compact=squash(query);
  let visible=0;
  for(const g of groups){
   let found=0;
   for(const a of g.querySelectorAll('.super-app-link')){
    const hay=texts.get(a)||'',match=(active==='all'||g.dataset.group===active)&&
     (!query||hay.includes(query)||squash(hay).includes(compact));
    a.hidden=!match;
    if(match){found++;visible++;}
   }
   g.hidden=found===0;
   const badge=g.querySelector('.group-count');
   if(badge)badge.textContent=String(found);
  }
  empty.hidden=visible>0;
  const fa=language()==='fa';
  if(status)status.textContent=fa?
    ('نمایش '+visible.toLocaleString('fa-IR')+' اپلیکیشن'):
    ('Showing '+visible+' application'+(visible===1?'':'s'));
  input.setAttribute('aria-label',fa?'جست‌وجوی اپلیکیشن‌ها':'Search applications');
  const filterGroup=document.querySelector('.super-filters');
  if(filterGroup)filterGroup.setAttribute('aria-label',fa?'فیلتر گروه اپلیکیشن‌ها':'Filter application categories');
 }
 function filter(kind){
  active=kind;
  for(const btn of buttons)btn.setAttribute('aria-pressed',String(btn.dataset.superFilter===kind));
  update();
 }
 function clear(){input.value='';filter('all');input.focus();}
 buttons.forEach(b=>b.addEventListener('click',()=>filter(b.dataset.superFilter)));
 input.addEventListener('input',update);
 reset?.addEventListener('click',clear);
 function closeMenu(returnFocus){
  if(!menu||!nav)return;
  nav.classList.remove('open');menu.setAttribute('aria-expanded','false');
  syncMenuLabel();
  if(returnFocus)menu.focus();
 }
 function syncMenuLabel(){
  if(!menu)return;
  const opened=menu.getAttribute('aria-expanded')==='true',fa=language()==='fa';
  menu.setAttribute('aria-label',fa?(opened?'بستن منو':'بازکردن منو'):(opened?'Close navigation':'Open navigation'));
  if(nav)nav.setAttribute('aria-label',fa?'ناوبری اصلی':'Main navigation');
 }
 menu?.addEventListener('click',syncMenuLabel);
 nav?.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>closeMenu(false)));
 document.addEventListener('click',e=>{
  if(menu&&nav?.classList.contains('open')&&!menu.contains(e.target)&&!nav.contains(e.target))closeMenu(false);
 });
 document.addEventListener('keydown',e=>{
  const typing=e.target.closest?.('input,textarea,select,[contenteditable="true"]');
  if(e.key==='/'&&!typing&&!e.ctrlKey&&!e.metaKey&&!e.altKey){
   e.preventDefault();input.focus();return;
  }
  if(e.key!=='Escape')return;
  if(nav?.classList.contains('open')){e.preventDefault();closeMenu(true);return;}
  if(document.activeElement===input&&input.value){e.preventDefault();input.value='';update();}
 });
 document.querySelectorAll('[data-lang]').forEach(b=>b.addEventListener('click',()=>{update();syncMenuLabel();}));
 const all=buttons.find(b=>b.dataset.superFilter==='all');
 if(all){
  const label=all.querySelector('[data-en][data-fa]');
  if(label){
   const n=allApps.length;
   label.dataset.en='All ('+n+')';
   label.dataset.fa='همه ('+n.toLocaleString('fa-IR')+')';
   label.textContent=language()==='fa'?label.dataset.fa:label.dataset.en;
  }
 }
 syncMenuLabel();update();
})();