/* Kish operational-only surface — 2026-10-25.
   Retains legacy element hooks and existing data model, while removing learning entry points from the user experience. */
(() => {
 'use strict';
 const COPY = {
  'Vision، Mission، Values و Strategy Architecture':'چشم‌انداز، مأموریت، ارزش‌ها و معماری راهبرد',
  'Vision 1410':'چشم‌انداز ۱۴۱۰',
  'Mission':'مأموریت','Core Values':'ارزش‌های بنیادین',
  'Ultimate Goal / North Star':'مقصد نهایی راهبرد',
  'Strategic Pillars':'ارکان راهبردی',
  'Strategy Map':'نقشه راهبرد','Strategy Execution':'اجرای راهبرد',
  'KPI Health':'وضعیت شاخص‌های عملکرد','Health KPIs':'شاخص‌های سلامت',
  'KPIs':'شاخص‌های کلیدی عملکرد',
  'Check-in، 1:1 و Management Rhythm':'ثبت پیشرفت، گفت‌وگوی فردی و روال پایش',
  '1:1 Review':'مرور گفت‌وگوی فردی','Leadership Review':'بازبینی مدیریتی',
  'Direct Reports & 1:1 Tracker':'پیگیری گفت‌وگوها و اقدامات کارکنان',
  'Weekly Progress Report':'گزارش پیشرفت هفتگی',
  'Rollout Design & Process Document':'طرح استقرار و فرایند اجرا',
  'Core Narrative':'پیام محوری معرفی برنامه',
  'Next Steps & Deadlines':'اقدامات بعدی و موعدها',
  'Launch Communication':'اطلاع‌رسانی آغاز اجرا',
  'Launch Readiness':'آمادگی آغاز اجرا',
  'Resources & Active Links':'منابع و پیوندهای مرتبط',
  'Training Status':'وضعیت آماده‌سازی کارکنان',
  'Strategy Architecture':'معماری راهبرد',
  'Review، Lessons Learned و Cycle بعد':'ارزیابی نتایج و آماده‌سازی چرخه بعد',
  'Quarterly All Hands Notes':'یادداشت‌های نشست فصلی کارکنان',
  'Lessons Learned':'درس‌آموخته‌ها',
  'Next Cycle Focus':'اولویت‌های چرخه بعد',
  'Company OKRs Summary':'خلاصه اهداف و نتایج کلیدی شرکت',
  'Group OKRs Summary':'خلاصه اهداف و نتایج کلیدی واحدها',
  'Data & Backup':'داده‌ها و پشتیبان‌گیری',
  'Cadences · تناوب هدف‌گذاری':'تناوب هدف‌گذاری',
  'Timeframes · بازه‌های زمانی':'بازه‌های زمانی',
  'Cadences فعال':'تناوب‌های فعال',
  'Cadences':'تناوب‌های هدف‌گذاری',
  'Timeframes':'بازه‌های زمانی',
  'Cadence · تناوب هدف‌گذاری':'تناوب هدف‌گذاری',
  'Cadence':'تناوب هدف‌گذاری',
  'Current':'مقدار جاری',
  'Confidence':'اطمینان به تحقق',
  'Progress note / Blocker':'توضیح پیشرفت یا مانع',
  'Executive Sponsor':'حامی اجرایی',
  'OKR Ambassador / Program Owner':'مسئول برنامه استقرار اهداف',
  'Upload logo':'بارگذاری نشان سازمان',
  'Company cadence':'تناوب هدف‌گذاری شرکت',
  'Team cadence':'تناوب هدف‌گذاری واحدها',
  'Check-in frequency':'فاصله ثبت پیشرفت',
  'Leadership progress review':'بازبینی پیشرفت مدیران',
  'Rollout approach':'رویکرد استقرار',
  'Group design':'طراحی گروه‌های کاری',
  'OKR approval deadline':'موعد تصویب اهداف',
  'OKR close deadline':'موعد اختتام اهداف',
  'Documented process':'فرایند مستند',
  'Why OKR? چرا الان؟':'چرا نظام اهداف و نتایج کلیدی را اجرا می‌کنیم؟',
  'Benefits for the organization':'منافع اجرای برنامه برای سازمان',
  'Benefits for individuals':'منافع برای کارکنان',
  'Training date':'زمان آماده‌سازی',
  'Team OKR deadline':'موعد ثبت اهداف واحدها',
  'CEO approval':'تأیید مدیرعامل',
  'All Hands status':'وضعیت نشست عمومی',
  'Next steps':'اقدامات بعدی',
  'Announcement date':'تاریخ اعلام برنامه',
  'All Hands date':'تاریخ نشست عمومی',
  'CEO / Leadership message':'پیام مدیریت ارشد',
  'Channels':'کانال‌های اطلاع‌رسانی',
  'Strategy shared?':'آیا راهبرد ابلاغ شده است؟',
  'Deadlines shared?':'آیا موعدها ابلاغ شده‌اند؟',
  'Q&A / FAQ ready?':'آیا پرسش‌های متداول آماده‌اند؟',
  'CEO email sent?':'آیا پیام مدیرعامل ارسال شده است؟',
  'Communication notes':'یادداشت‌های اطلاع‌رسانی',
  'Executives':'مدیران ارشد','Managers':'مدیران','Team members':'اعضای واحدها',
  'Curriculum / workshop notes':'یادداشت‌های آماده‌سازی سازمانی',
  'Leadership resource':'منبع مدیریت ارشد','Team training resource':'منابع واحدها',
  'Internal guide / policy':'دستورالعمل داخلی',
  'Next 1:1 date':'تاریخ گفت‌وگوی بعدی',
  '1:1 cadence':'تناوب گفت‌وگوهای فردی',
  '1:1 notes / support / next best step':'یادداشت‌ها، حمایت موردنیاز و اقدام بعد',
  'Next leadership review':'تاریخ بازبینی مدیریتی بعدی',
  'Overall health':'وضعیت کلی اجرا',
  'Decisions / resource allocation / issues':'تصمیم‌ها، تخصیص منابع و مسائل',
  'Why is this important?':'چرا این موضوع اهمیت دارد؟',
  'Why is this urgent?':'چرا اقدام فوری ضروری است؟',
  'Status':'وضعیت','Unit type':'نوع واحد','Parent unit':'واحد بالادست',
  'Core responsibilities':'مسئولیت‌های اصلی','Interdependencies':'وابستگی‌های میان‌واحدی',
  'Owner':'مسئول','Objective':'هدف','Objectives':'اهداف',
  'Unit KPIs':'شاخص‌های عملکرد واحد','Unit OKRs':'اهداف و نتایج کلیدی واحد',
  'Kish Strategy Execution Workspace':'سامانه اجرای راهبرد کیش',
  'Company + Unit OKRs':'اهداف شرکت و واحدها',
  'Company + Group':'شرکت و واحدها',
  'Active Progress':'پیشرفت اهداف فعال',
  'Active OKRs':'اهداف فعال',
  'Key Results':'نتایج کلیدی',
  'Check-ins Logged':'موارد ثبت پیشرفت',
  'Closed Objectives':'اهداف مختومه',
  'Overall Result':'نتیجه کلی',
  'OBJECTIVE OVERVIEW':'نمای کلی هدف',
  'PERDOO · CONFIGURE':'پیکربندی سامانه',
  'PERDOO · PERFORM':'اجرای اهداف',
  'CONFIGURE › CADENCES':'پیکربندی › تناوب هدف‌گذاری',
  'PERFORM › MEETINGS':'اجرا › جلسات',
  'Organizational account sign-in':'ورود با حساب سازمانی',
  'ورود با حساب سازمانی · Organization account sign-in':'ورود با حساب سازمانی',
  'GROUP OKRs · قابل ویرایش':'اهداف و نتایج کلیدی واحدها',
  'KPI':'KPI','OKR':'OKR','KR':'KR'
 };
 const exact=s=>(s||'').replace(/\s+/g,' ').trim();
 let busy=false;
 function replaceLabels(){
  if(document.documentElement.lang!=='fa')return;
  const root=document.querySelector('#executionApp');
  const nodes=document.querySelectorAll('#executionApp h1,#executionApp h2,#executionApp h3,#executionApp label,#executionApp summary,#executionApp button,#executionApp .p-nav-icon,#executionApp .p-nav-group a span,#executionApp .p-kicker,#executionApp .p-subtle,#executionApp .pd-config-breadcrumb,#executionApp .p-table th,#authScreen h1,#authScreen h2,#authScreen p');
  nodes.forEach(el=>{
   for(const child of el.childNodes){
    if(child.nodeType!==3)continue;
    const src=exact(child.nodeValue);
    if(Object.prototype.hasOwnProperty.call(COPY,src)&&COPY[src]!==src){
      child.nodeValue=child.nodeValue.replace(src,COPY[src]);
    }
   }
  });
 }
 function operationalNav(){
  const nav=document.getElementById('platformNav');
  if(!nav||!nav.querySelector('.pd-nav-group'))return;
  const entries=[
   ['#history','◷','تاریخچه تغییرات','Change history'],
   ['#admin','⚙','مدیریت دسترسی','Access management']
  ];
  let group=nav.querySelector('#kish-system-nav');
  for(const [href,icon,fa,en] of entries){
   const nativeExists=[...nav.querySelectorAll('a[href="'+href+'"]')].some(a=>!a.closest('#kish-system-nav'));
   const own=group?.querySelector('a[href="'+href+'"]');
   if(nativeExists&&own){own.remove();continue;}
   if(!nativeExists&&!own){
    if(!group){
     group=document.createElement('div');
     group.className='pd-nav-group';
     group.id='kish-system-nav';
     group.innerHTML='<div class="nav-label" data-fa="کنترل و مدیریت" data-en="CONTROL & ADMIN">کنترل و مدیریت</div>';
     nav.appendChild(group);
    }
    const link=document.createElement('a');
    link.href=href;
    link.innerHTML='<span class="p-nav-icon" aria-hidden="true">'+icon+'</span><span></span>';
    link.lastElementChild.dataset.fa=fa;
    link.lastElementChild.dataset.en=en;
    group.appendChild(link);
   }
  }
  if(group&&!group.querySelector('a')){group.remove();group=null;}
  if(!group)return;
  const cur=location.hash.slice(1).split('/')[0];
  group.querySelectorAll('a').forEach(a=>{
   a.classList.toggle('active',a.getAttribute('href')==='#'+cur);
   if(a.classList.contains('active'))a.setAttribute('aria-current','page');
   else a.removeAttribute('aria-current');
   const txt=a.querySelector('span:last-child');
   if(txt)txt.textContent=document.documentElement.lang==='fa'?txt.dataset.fa:txt.dataset.en;
  });
 }
 function removeObsoleteNavigation(){
  const nav=document.getElementById('platformNav');
  if(!nav)return;
  // Retire legacy training/rollout links without deleting stored records or operational features.
  const retired=new Set(['roadmap','introduce','announce','educate','learn','training']);
  nav.querySelectorAll('a[href^="#"]').forEach(a=>{
   const route=a.getAttribute('href').slice(1).split('/')[0];
   if(retired.has(route)){
    a.hidden=true;
    a.setAttribute('aria-hidden','true');
    a.tabIndex=-1;
   }
  });
 }
 function removeLearningUI(){
  document.querySelectorAll('.learning-choice,.home-guide,.p-sidebar-legacy,#topTrainingBtn,#trainingScreen').forEach(el=>{el.hidden=true;el.setAttribute('aria-hidden','true');});
  const hero=document.querySelector('#authScreen .home-intro p');
  if(hero){
   hero.dataset.fa='راهبرد، اهداف، نتایج کلیدی، شاخص‌های عملکرد و برنامه‌های اجرایی شرکت را در یک محیط یکپارچه مدیریت کنید.';
   hero.dataset.en='Manage company strategy, objectives, key results, KPIs, and execution in one integrated workspace.';
   hero.textContent=document.documentElement.lang==='fa'?hero.dataset.fa:hero.dataset.en;
  }
  const footer=document.querySelector('#authScreen .entry-foot');
  if(footer){
   const original=footer.querySelector('span[data-fa]');
   if(original){
     original.dataset.fa='سامانه اختصاصی اجرای راهبرد بنادر و فرودگاه‌های کیش';
     original.dataset.en='Kish Ports & Airports strategy execution system';
     original.textContent=document.documentElement.lang==='fa'?original.dataset.fa:original.dataset.en;
   }
   footer.querySelectorAll('a[href*="perdoo.com/resources/online-guides/"]').forEach(a=>a.hidden=true);
  }
  const notice=document.getElementById('practiceNotice');
  if(notice){
   notice.dataset.fa='محیط جاری برای ارزیابی پیش از استقرار است؛ در نسخه عمومی، داده‌ها در مرورگر شما نگهداری می‌شوند.';
   notice.dataset.en='Pre-deployment evaluation workspace. The public edition stores data in your browser.';
   notice.textContent=document.documentElement.lang==='fa'?notice.dataset.fa:notice.dataset.en;
  }
 }
 function run(){
  if(busy)return;
  busy=true;
  try{removeLearningUI();operationalNav();removeObsoleteNavigation();replaceLabels();}
  finally{busy=false;}
 }
 function preventTrainingRoute(){
  if(/^#(?:learn|educate|training|roadmap|introduce|announce)(?:\/|$)/.test(location.hash)){
   location.replace(location.pathname+location.search+'#start');
  }
 }
 const start=()=>{
  preventTrainingRoute();
  run();
  const nav=document.getElementById('platformNav');
  if(nav)new MutationObserver(()=>{if(!busy)queueMicrotask(run);}).observe(nav,{childList:true});
  // The application re-renders its panels dynamically: translate only changed interface labels.
  const target=document.getElementById('platformBody');
  if(target)new MutationObserver(()=>{if(!busy)queueMicrotask(run);}).observe(target,{childList:true});
  window.addEventListener('hashchange',()=>{preventTrainingRoute();queueMicrotask(run);});
  window.addEventListener('pageshow',run);
  document.querySelectorAll('[data-set-lang]').forEach(b=>b.addEventListener('click',()=>queueMicrotask(run)));
 };
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});
 else start();
})();
