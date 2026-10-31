/* Visual-only experience layer for Alborz Session 2.
   Uses current 10 techniques / 8 stages; does not replace course data or routing. */
(function(){
'use strict';
const root=document.getElementById('root');
if(!root||typeof window.render!=='function')return;
const images=[
 'session2-welcome-hq.webp',
 'session2-professional-dress-hq.webp',
 'session2-welcome-hq.webp',
 'session2-hero-hq.webp',
 'session2-voice-tone-hq.webp',
 'session2-body-language-hq.webp',
 'session2-professional-dress-hq.webp',
 'session2-body-language-hq.webp',
 'session2-facial-expression-hq.webp',
 'session2-welcome-hq.webp'
];
const positions=['51% 46%','50% 38%','58% 38%','48% 50%','49% 47%','48% 40%','54% 36%','51% 36%','49% 43%','48% 40%'];
const stageEmojis=['🎯','🧩','❓','🎭','🗣️','🔎','🔁','💡'];
const cardPhotoStages=new Set([0,3,4,5]);
const storedGuideKey='alborz-session2-visual-guide-v1';
let activeTechIndex=0, guideStep=0, tourOpenedThisVisit=false;
let rememberedFocus=null;
const priorRender=window.render;
function photo(i){return 'assets/'+(images[i]||images[0]);}
function getActiveTechFromDOM(){
 const hero=root.querySelector('.lab-tech-hero .eyebrow');
 if(hero){
  const match=hero.textContent.match(/تکنیک\s+([0-9۰-۹]+)/);
  if(match){const normalized=match[1].replace(/[۰-۹]/g,c=>String(c.charCodeAt(0)-1776));activeTechIndex=Math.max(0,Number(normalized)-1);}
 }else if(root.querySelector('.stage-grid .stage-card')&&!root.querySelector('.lab-tech-hero')&&!root.querySelector('.lab-page')){
  activeTechIndex=0;
 }
}
function decorateCatalog(){
 root.querySelectorAll('.tech-card.lab-tech').forEach((card,i)=>{
  if(card.classList.contains('alborz-editorial'))return;
  card.classList.add('alborz-editorial');
  const cover=document.createElement('span');
  cover.className='alborz-tech-cover';
  cover.style.setProperty('--visual-position',positions[i]);
  const img=document.createElement('img');
  img.src=photo(i);
  img.alt='';
  img.loading=i<3?'eager':'lazy';
  img.decoding='async';
  const number=document.createElement('span');
  number.className='alborz-cover-number';
  number.textContent=String(i+1).padStart(2,'0');
  cover.append(img,number);
  card.insertBefore(cover,card.firstChild);
 });
}
function decorateStages(){
 const stageGrid=root.querySelector('.stage-grid');
 if(!stageGrid)return;
 stageGrid.querySelectorAll('.stage-card').forEach((card,i)=>{
  if(card.classList.contains('alborz-stage-editorial'))return;
  card.classList.add('alborz-stage-editorial');
  const badge=card.querySelector('.stage-no');
  if(!badge)return;
  badge.classList.add('alborz-stage-art');
  if(cardPhotoStages.has(i)){
   const img=document.createElement('img');
   img.src=photo(activeTechIndex);
   img.alt='';
   img.loading='lazy';
   img.decoding='async';
   badge.insertBefore(img,badge.firstChild);
  }
 });
 if(!stageGrid.parentElement.querySelector('.alborz-practice-shortcut')){
  const shortcut=document.createElement('button');
  shortcut.type='button';
  shortcut.className='alborz-practice-shortcut alborz-index-launch';
  shortcut.innerHTML='<span>🎭 شروع تمرین و انتخاب نقش</span><span class="shortcut-arrow">←</span>';
  shortcut.addEventListener('click',()=>openPracticeSheet());
  stageGrid.parentElement.insertBefore(shortcut,stageGrid);
 }
}
function injectPracticeControls(){
 const rolecards=root.querySelector('.rolecards');
 const bar=root.querySelector('.scriptbar');
 if(rolecards&&!root.querySelector('.alborz-practice-shortcut')){
  const button=createShortcut('🎭 انتخاب نقش و اجرای تمرین');
  rolecards.parentElement.insertBefore(button,rolecards);
 }
 if(bar&&!root.querySelector('.alborz-script-tools')){
  const details=document.createElement('details');
  details.className='alborz-script-tools';
  const summary=document.createElement('summary');
  summary.textContent='⚙️ تنظیمات نمایش اسکریپت و نقش‌ها';
  details.append(summary,bar);
  const button=createShortcut('🗣️ انتخاب نقش و ابزارهای گفت‌وگو');
  details.parentElement.insertBefore(button,details);
 }
}
function createShortcut(label){
 const b=document.createElement('button');
 b.type='button'; b.className='alborz-practice-shortcut';
 b.innerHTML='<span>'+label+'</span><span class="shortcut-arrow">←</span>';
 b.addEventListener('click',()=>openPracticeSheet());
 return b;
}
function lock(){document.body.style.overflow='hidden';}
function unlock(){if(!document.querySelector('.alborz-sheet-portal,.alborz-guide-portal'))document.body.style.overflow='';}
function closePracticeSheet(restoreFocus=true){
 const portal=document.getElementById('alborz-practice-sheet');
 if(portal)portal.remove();
 unlock();
 if(restoreFocus&&rememberedFocus&&document.contains(rememberedFocus))rememberedFocus.focus();
}
function closeGuide(markSeen=true){
 const portal=document.getElementById('alborz-visual-guide');
 if(!portal)return;
 portal.remove();
 root.querySelectorAll('.alborz-guide-focus').forEach(x=>x.classList.remove('alborz-guide-focus'));
 if(markSeen)try{localStorage.setItem(storedGuideKey,'1')}catch(e){}
 tourOpenedThisVisit=true;
 unlock();
}
function route(target,filter){
 closePracticeSheet(false);
 if(typeof go!=='function')return;
 go('stage',target);
 if(target===4&&filter){
  const isAdvanced=activeTechIndex>0;
  if(isAdvanced&&typeof window.showAdvancedRole==='function'){
    window.showAdvancedRole(filter==='A'?'A':filter==='B'?'B':'both');
  }else if(typeof filterScript==='function'){
    filterScript(filter==='A'?'رئیس شعبه':filter==='B'?'مشتری':'all');
  }
 }
}
function openPracticeSheet(){
 closeGuide(false);
 closePracticeSheet(false);
 rememberedFocus=document.activeElement;
 const portal=document.createElement('div');
 portal.id='alborz-practice-sheet';
 portal.className='alborz-sheet-portal';
 const backdrop=document.createElement('button');
 backdrop.type='button';backdrop.className='alborz-sheet-backdrop';
 backdrop.setAttribute('aria-label','بستن پنجره تمرین');
 backdrop.addEventListener('click',()=>closePracticeSheet());
 const panel=document.createElement('section');
 panel.className='alborz-action-sheet';
 panel.setAttribute('role','dialog');panel.setAttribute('aria-modal','true');
 panel.setAttribute('aria-labelledby','alborz-sheet-heading');
 panel.innerHTML='<div class="alborz-sheet-grip" aria-hidden="true"></div><div class="alborz-sheet-head"><div><h2 id="alborz-sheet-heading">🎭 ابزارهای تمرین</h2><p>یک فعالیت را انتخاب کنید؛ ساختار هشت‌مرحله‌ای حفظ می‌شود.</p></div><button class="alborz-sheet-close" type="button" aria-label="بستن">×</button></div><div class="alborz-sheet-options"></div><button class="alborz-sheet-help" type="button">💡 راهنمای کوتاه استفاده</button>';
 const choices=[
  ['🎭','اجرای دونفره بدون متن','شروع Role Play و جابه‌جایی نقش‌ها',()=>route(3)],
  ['🗣️','اسکریپت کامل گفت‌وگو','مشاهده هر دو نقش و راهنمای لحن',()=>route(4,'both')],
  ['🧑‍💼','فقط متن رئیس شعبه','تمرکز بر نقش مدیر در اسکریپت',()=>route(4,'A')],
  ['👤','فقط متن مخاطب','تمرکز بر نقش مقابل در اسکریپت',()=>route(4,'B')],
  ['🔎','نقد و بازخورد رفتاری','ارزیابی مشاهده‌پذیر پس از اجرا',()=>route(5)],
  ['🔁','اجرای اصلاح‌شده','تکرار همان مهارت در موقعیت جدید',()=>route(6)]
 ];
 const list=panel.querySelector('.alborz-sheet-options');
 choices.forEach(([icon,label,desc,run],i)=>{
  const button=document.createElement('button');
  button.type='button';button.className='alborz-sheet-action'+(i===0?' alborz-sheet-action-primary':'');
  button.innerHTML='<span class="alborz-sheet-icon" aria-hidden="true">'+icon+'</span><span class="alborz-sheet-text"><span class="alborz-sheet-label">'+label+'</span><span class="alborz-sheet-desc">'+desc+'</span></span><span aria-hidden="true">←</span>';
  button.addEventListener('click',run);list.append(button);
 });
 panel.querySelector('.alborz-sheet-close').addEventListener('click',()=>closePracticeSheet());
 panel.querySelector('.alborz-sheet-help').addEventListener('click',()=>{closePracticeSheet(false);openGuide(true);});
 portal.append(backdrop,panel);
 document.body.append(portal);lock();
 panel.querySelector('.alborz-sheet-close').focus();
}
const slides=[
 {symbol:'👥',title:'نقش‌ها را بخوانید',text:'هر نفر یک نقش را انتخاب کند. پیش از شروع، فقط موقعیت و هدف خودش را مرور کند؛ اجرای اول بدون حفظ‌کردن متن است.',focus:'.rolecards'},
 {symbol:'🎭',title:'وب‌کم روشن، تمرین زنده',text:'از «ابزارهای تمرین»، اجرای دونفره یا اسکریپت را انتخاب کنید. لحن، زبان بدن و حالت چهره بخشی از عملکرد قابل مشاهده هستند.',focus:'.alborz-practice-shortcut'},
 {symbol:'🔎',title:'بازخورد بگیرید و دوباره اجرا کنید',text:'پس از گفت‌وگو، دو رفتار مؤثر و یک رفتار قابل اصلاح ثبت کنید؛ سپس در مرحله «اجرای اصلاح‌شده» دوباره تمرین کنید.',focus:'.floatingnav'}
];
function openGuide(force=false){
 if(!force){
  if(tourOpenedThisVisit)return;
  try{if(localStorage.getItem(storedGuideKey))return;}catch(e){}
 }
 closePracticeSheet(false);
 guideStep=0;
 const portal=document.createElement('div');
 portal.id='alborz-visual-guide';portal.className='alborz-guide-portal';
 const backdrop=document.createElement('div');backdrop.className='alborz-guide-backdrop';
 const card=document.createElement('div');card.className='alborz-guide-card';
 card.setAttribute('role','dialog');card.setAttribute('aria-modal','true');
 card.setAttribute('aria-label','راهنمای کوتاه تمرین دونفره');
 portal.append(backdrop,card);document.body.append(portal);
 lock();
 function present(){
  root.querySelectorAll('.alborz-guide-focus').forEach(x=>x.classList.remove('alborz-guide-focus'));
  const step=slides[guideStep];
  const focus=root.querySelector(step.focus);
  if(focus)focus.classList.add('alborz-guide-focus');
  card.replaceChildren();
  card.innerHTML='<div class="alborz-guide-step">راهنمای تمرین · '+(guideStep+1)+' از '+slides.length+'</div><span class="alborz-guide-symbol" aria-hidden="true">'+step.symbol+'</span><h2>'+step.title+'</h2><p>'+step.text+'</p><div class="alborz-guide-actions"><button class="alborz-guide-skip" type="button">رد کردن</button><button class="alborz-guide-next" type="button">'+(guideStep===slides.length-1?'شروع تمرین ✓':'بعدی ←')+'</button></div><div class="alborz-guide-dots">'+slides.map((_,i)=>'<span class="'+(i===guideStep?'active':'')+'"></span>').join('')+'</div>';
  card.querySelector('.alborz-guide-skip').addEventListener('click',()=>closeGuide(true));
  card.querySelector('.alborz-guide-next').addEventListener('click',()=>{
   if(guideStep<slides.length-1){guideStep++;present();}else closeGuide(true);
  });
  card.querySelector('.alborz-guide-next').focus();
 }
 present();
}
let enhancing=false;
let queued=false;
function enhance(){
 if(enhancing)return;
 enhancing=true;
 try{
  getActiveTechFromDOM();
  decorateCatalog();
  decorateStages();
  injectPracticeControls();
  if(root.querySelector('.rolecards')&&!tourOpenedThisVisit&&!document.getElementById('alborz-practice-sheet')){
   openGuide(false);
  }
 }finally{enhancing=false;}
}
function scheduleEnhancement(){
 if(queued)return;
 queued=true;
 queueMicrotask(()=>{
  queued=false;
  if(document.contains(root))enhance();
 });
}
// The original SPA and its advanced technique engine both call their own
// lexical render() functions. Overriding window.render alone cannot intercept
// those calls. Observe the live lesson root instead, so each navigation,
// answer update and script filter receives the visual layer exactly once.
const lessonObserver=new MutationObserver(changes=>{
 if(changes.some(change=>change.type==='childList'))scheduleEnhancement();
});
lessonObserver.observe(root,{childList:true,subtree:true});
window.render=function(){
 priorRender.apply(this,arguments);
 enhance();
};
window.openAlborzPracticeSheet=openPracticeSheet;
window.openAlborzTrainingGuide=()=>openGuide(true);
document.addEventListener('keydown',event=>{
 if(event.key!=='Escape')return;
 if(document.getElementById('alborz-visual-guide')){
  event.preventDefault();event.stopImmediatePropagation();closeGuide(true);
 }else if(document.getElementById('alborz-practice-sheet')){
  event.preventDefault();event.stopImmediatePropagation();closePracticeSheet();
 }
},true);
// Render once to decorate the initial page; subsequent go()/back() calls use the wrapper.
window.render();
window.__alborzVisualQA={images:images.length,stageEmojis:stageEmojis.length,openPracticeSheet,openGuide,enhance,scheduleEnhancement,observerConnected:true,getCurrentIndex:()=>activeTechIndex};
})();