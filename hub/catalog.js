/* HB Hub · purpose-led discovery, quick access and accessible app directory.
   Only app destination identifiers are stored on this device. Never app data or credentials. */
(function(){'use strict';
 const input=document.getElementById('superSearch');
 const groups=[...document.querySelectorAll('.super-group')];
 const buttons=[...document.querySelectorAll('[data-super-filter]')];
 const empty=document.getElementById('superEmpty');
 const reset=document.getElementById('superReset');
 const status=document.getElementById('superResultCount');
 const menu=document.querySelector('.menu-toggle');
 const nav=document.getElementById('topnav');
 if(!input||!groups.length||!empty)return;
 const appLinks=[...document.querySelectorAll('.super-app-link')];
 const appMap=new Map(appLinks.map(a=>[a.getAttribute('href'),a]));
 const favKey='hb-hub-saved-apps-v1',recentKey='hb-hub-recent-apps-v1';
 const valid=values=>[...new Set(Array.isArray(values)?values:[])].filter(v=>typeof v==='string'&&appMap.has(v));
 const read=key=>{try{return valid(JSON.parse(localStorage.getItem(key)||'[]'))}catch(e){return []}};
 let saved=read(favKey),recent=read(recentKey),active='all';
 const write=(key,values)=>{try{localStorage.setItem(key,JSON.stringify(values))}catch(e){}};
 const lang=()=>document.documentElement.lang==='fa'?'fa':'en';
 const translate=(en,fa)=>lang()==='fa'?fa:en;
 const normalize=value=>String(value||'').normalize('NFKC').toLocaleLowerCase()
  .replace(/[يى]/g,'ی').replace(/ك/g,'ک').replace(/[\u064b-\u065f\u0670]/g,'')
  .replace(/[\u200c\u200d]/g,' ').replace(/\s+/g,' ').trim();
 const squash=s=>s.replace(/\s/g,'');
 const descriptions=new Map(appLinks.map(a=>[a,normalize([
  a.dataset.search,...[...a.querySelectorAll('[data-en][data-fa]')].flatMap(e=>[e.dataset.en,e.dataset.fa])
 ].join(' '))]));
 const titleOf=(a)=>a.querySelector('.super-app-meta strong')?.getAttribute('data-'+lang())||
  a.querySelector('.super-app-meta strong')?.textContent||'';
 const descOf=(a)=>a.querySelector('.super-app-meta small')?.getAttribute('data-'+lang())||'';
 function announce(text){const node=document.getElementById('hubFavoriteStatus');if(node)node.textContent=text;}
 function iconStar(){
  const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');
  svg.setAttribute('viewBox','0 0 24 24');svg.setAttribute('width','22');svg.setAttribute('height','22');
  svg.setAttribute('fill','none');svg.setAttribute('stroke','currentColor');
  svg.setAttribute('stroke-width','1.9');svg.setAttribute('stroke-linejoin','round');
  svg.setAttribute('aria-hidden','true');
  const path=document.createElementNS('http://www.w3.org/2000/svg','path');
  path.setAttribute('d','m12 2.9 2.82 5.72 6.32.92-4.57 4.45 1.08 6.29L12 17.31l-5.65 2.97 1.08-6.29-4.57-4.45 6.32-.92L12 2.9Z');
  svg.append(path);return svg;
 }
 const controls=new Map();
 function syncFavoriteControls(){
  for(const [href,button] of controls){
   const isSaved=saved.includes(href),a=appMap.get(href);
   button.setAttribute('aria-pressed',String(isSaved));
   const label=translate(isSaved?'Remove saved app: ':'Save app: ',isSaved?'حذف از نشان‌شده‌ها: ':'نشان‌کردن اپ: ')+titleOf(a);
   button.setAttribute('aria-label',label);button.title=label;
  }
  const chip=buttons.find(b=>b.dataset.superFilter==='pinned')?.querySelector('[data-en][data-fa]');
  if(chip){chip.dataset.en='Saved ('+saved.length+')';chip.dataset.fa='نشان‌شده ('+saved.length.toLocaleString('fa-IR')+')';chip.textContent=lang()==='fa'?chip.dataset.fa:chip.dataset.en;}
 }
 function quickLink(href){
  const source=appMap.get(href),a=document.createElement('a');
  a.className='hub-quick-link';a.setAttribute('href',href);
  const img=source.querySelector('.super-app-media img');
  const frame=document.createElement('span');frame.className='hub-quick-media';
  if(img){const copy=img.cloneNode(false);copy.removeAttribute('onerror');copy.loading='lazy';copy.alt='';frame.append(copy);}
  else {frame.textContent='HB';frame.setAttribute('aria-hidden','true');}
  const names=document.createElement('span');names.className='hub-quick-meta';
  const title=document.createElement('strong');title.textContent=titleOf(source);
  const sub=document.createElement('small');sub.textContent=descOf(source);
  names.append(title,sub);a.append(frame,names);
  return a;
 }
 function fillQuick(id,values,emptyText){
  const host=document.getElementById(id);if(!host)return;
  host.replaceChildren();
  if(!values.length){
   const p=document.createElement('p');p.className='hub-quick-empty';p.textContent=emptyText;
   host.append(p);return;
  }
  values.forEach(href=>host.append(quickLink(href)));
 }
 function renderQuick(){
  const section=document.getElementById('hubQuickAccess');
  if(section)section.hidden=!saved.length&&!recent.length;
  fillQuick('hubPinnedList',saved,translate('Tap the star on an app below to save it here.','برای دسترسی سریع، ستاره کنار اپ‌های پایین را انتخاب کنید.'));
  fillQuick('hubRecentList',recent,translate('Open an app to see it here.','پس از بازکردن یک اپ، مسیر آن اینجا نمایش داده می‌شود.'));
  const clear=document.getElementById('hubClearRecents');
  if(clear)clear.hidden=!recent.length;
  syncFavoriteControls();
 }
 function update(){
  const query=normalize(input.value),compact=squash(query);
  let count=0;
  for(const group of groups){
   let found=0;
   for(const a of group.querySelectorAll('.super-app-link')){
    const href=a.getAttribute('href'),hay=descriptions.get(a)||'';
    const category=active==='all'||(active==='pinned'?saved.includes(href):group.dataset.group===active);
    const match=category&&(!query||hay.includes(query)||squash(hay).includes(compact));
    const card=a.closest('.super-app-entry')||a;
    card.hidden=!match;a.hidden=!match;
    if(match){found++;count++;}
   }
   group.hidden=!found;
   const badge=group.querySelector('.group-count');if(badge)badge.textContent=String(found);
  }
  empty.hidden=count>0;
  const fa=lang()==='fa';
  if(status)status.textContent=fa?'نمایش '+count.toLocaleString('fa-IR')+' اپلیکیشن':
   'Showing '+count+' application'+(count===1?'':'s');
  input.setAttribute('aria-label',translate('Search applications','جست‌وجوی اپلیکیشن‌ها'));
  const filterGroup=document.querySelector('.super-filters');
  if(filterGroup)filterGroup.setAttribute('aria-label',translate('Filter application categories','فیلتر گروه اپلیکیشن‌ها'));
 }
 function setFilter(kind){active=kind;buttons.forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.superFilter===kind)));update();}
 function clearFilters(){input.value='';setFilter('all');input.focus();}
 function toggle(href){
  const a=appMap.get(href);if(!a)return;
  const removing=saved.includes(href);
  saved=removing?saved.filter(x=>x!==href):[href,...saved];
  write(favKey,saved);renderQuick();update();
  announce(translate(
   removing?'Removed from saved apps: ':'Added to saved apps: ',
   removing?'از نشان‌شده‌ها حذف شد: ':'به نشان‌شده‌ها اضافه شد: '
  )+titleOf(a));
 }
 function open(href){
  if(!appMap.has(href))return;
  recent=[href,...recent.filter(x=>x!==href)].slice(0,5);
  write(recentKey,recent);renderQuick();
 }
 for(const a of appLinks){
  const href=a.getAttribute('href');
  const wrap=document.createElement('div');wrap.className='super-app-entry';
  a.parentNode.insertBefore(wrap,a);wrap.append(a);
  const b=document.createElement('button');b.type='button';b.className='super-favorite';
  b.append(iconStar());b.addEventListener('click',()=>toggle(href));
  wrap.append(b);controls.set(href,b);
  a.addEventListener('click',()=>open(href));
 }
 document.getElementById('hubQuickAccess')?.addEventListener('click',e=>{
  const link=e.target.closest?.('a.hub-quick-link');
  if(link)open(link.getAttribute('href'));
 });
 document.getElementById('hubClearRecents')?.addEventListener('click',()=>{
  recent=[];write(recentKey,[]);renderQuick();
  announce(translate('Recently opened apps cleared.','سابقه اپ‌های بازشده پاک شد.'));
 });
 buttons.forEach(b=>b.addEventListener('click',()=>setFilter(b.dataset.superFilter)));
 input.addEventListener('input',update);
 reset?.addEventListener('click',clearFilters);
 function syncMenu(){
  if(!menu)return;
  const expanded=menu.getAttribute('aria-expanded')==='true';
  menu.setAttribute('aria-label',translate(expanded?'Close navigation':'Open navigation',expanded?'بستن منو':'بازکردن منو'));
  if(nav)nav.setAttribute('aria-label',translate('Main navigation','ناوبری اصلی'));
 }
 function closeMenu(refocus){
  nav?.classList.remove('open');menu?.setAttribute('aria-expanded','false');
  syncMenu();if(refocus)menu?.focus();
 }
 menu?.addEventListener('click',syncMenu);
 nav?.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>closeMenu(false)));
 document.addEventListener('click',e=>{
  if(menu&&nav?.classList.contains('open')&&!menu.contains(e.target)&&!nav.contains(e.target))closeMenu(false);
 });
 document.addEventListener('keydown',e=>{
  const typing=e.target.closest?.('input,textarea,select,[contenteditable="true"]');
  if((e.key==='/'||((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='k'))&&!typing&&!e.altKey){
   e.preventDefault();input.focus();return;
  }
  if(e.key!=='Escape')return;
  if(nav?.classList.contains('open')){e.preventDefault();closeMenu(true);return;}
  if(document.activeElement===input&&input.value){e.preventDefault();input.value='';update();}
 });
 document.querySelectorAll('[data-lang]').forEach(b=>b.addEventListener('click',()=>{
  renderQuick();update();syncMenu();
 }));
 const all=buttons.find(b=>b.dataset.superFilter==='all')?.querySelector('[data-en][data-fa]');
 if(all){
  all.dataset.en='All ('+appLinks.length+')';
  all.dataset.fa='همه ('+appLinks.length.toLocaleString('fa-IR')+')';
  all.textContent=lang()==='fa'?all.dataset.fa:all.dataset.en;
 }
 function applyCategoryLink(){
  const requested=location.hash.slice(1);
  const category=buttons.find(button=>button.dataset.superFilter===requested);
  if(category)setFilter(category.dataset.superFilter);
 }
 window.addEventListener('hashchange',applyCategoryLink);
 renderQuick();syncMenu();update();applyCategoryLink();
})();