/* The Life Organization · v0.1 Preview
   Independent, offline-friendly client-side app shell. No user authentication, sync or scoring.
   Local storage is not encrypted. Do not enter confidential information in this preview. */
(() => {
  "use strict";
  const KEY = "tlo-v01-personal-workspace";
  const MODULES = [
    {id:1,icon:"identity",fa:"شناخت سازمان زندگی",en:"Life Foundation",shortFa:"شناخت خود، نقش‌ها، ارزش‌ها و منابع زندگی",shortEn:"Understand identity, roles, values and resources",introFa:"از شناخت دقیق وضعیت موجود و الگوهای زندگی خود شروع می‌کنیم؛ نه از قضاوت یا امتیاز دادن.",introEn:"Start by understanding your current life patterns, without judgment or artificial scores.",aspectsFa:["شناخت وضعیت موجود","هویت و نقش‌ها","منابع و ارزش‌ها"],aspectsEn:["Current-state discovery","Identity and roles","Resources and values"]},
    {id:2,icon:"strategy",fa:"راهبرد زندگی",en:"Life Strategy",shortFa:"تعیین جهت، اولویت‌ها و انتخاب‌های راهبردی",shortEn:"Make choices about direction and priorities",introFa:"مشخص می‌کنیم چه چیزی واقعاً برای شما مهم است و قرار است انرژی و توجهتان کجا صرف شود.",introEn:"Clarify what matters and where your time, energy and attention should go.",aspectsFa:["چشم‌انداز زندگی","انتخاب‌های راهبردی","اولویت‌های معنادار"],aspectsEn:["Life vision","Strategic choices","Meaningful priorities"]},
    {id:3,icon:"design",fa:"طراحی سازمان زندگی",en:"Life Organization Design",shortFa:"ساختاردهی نقش‌ها، منابع و فعالیت‌های زندگی",shortEn:"Design roles, resources and ways of working",introFa:"ساختاری متناسب با شرایط واقعی زندگی شما طراحی می‌کنیم؛ نه یک نسخه یکسان برای همه.",introEn:"Design a life structure that fits your reality, not someone else's template.",aspectsFa:["ساختار زندگی","تناسب نقش‌ها و ظرفیت","فرایندهای شخصی"],aspectsEn:["Life structure","Role–capacity fit","Personal processes"]},
    {id:4,icon:"coordination",fa:"هماهنگی زندگی",en:"Life Coordination",shortFa:"هماهنگی نقش‌ها، روابط و تعهدهای زندگی",shortEn:"Coordinate roles, relationships and commitments",introFa:"بخش‌های مختلف زندگی را طوری کنار هم قرار می‌دهیم که یکدیگر را تقویت کنند.",introEn:"Bring different parts of life together so they can support one another.",aspectsFa:["هماهنگی نقش‌ها","ارتباطات و تعاملات","مدیریت تعارض‌ها"],aspectsEn:["Role coordination","Relationships","Managing tensions"]},
    {id:5,icon:"performance",fa:"مدیریت عملکرد زندگی",en:"Life Performance",shortFa:"حرکت از تصمیم به اقدام و یادگیری مستمر",shortEn:"Turn intentions into action and learning",introFa:"پیشرفت را با شاخص‌های معنادار و مرورهای سازنده پیگیری می‌کنیم؛ نه با فشار دائمی.",introEn:"Review meaningful progress and learn continuously, rather than chasing numbers.",aspectsFa:["پیگیری اقدام‌ها","بازنگری عملکرد","یادگیری از تجربه"],aspectsEn:["Action follow-through","Performance reviews","Learning from experience"]},
    {id:6,icon:"audit",fa:"ممیزی و بازطراحی زندگی",en:"Life Audit & Redesign",shortFa:"شناسایی شکاف‌ها، تناسب‌ها و مسیرهای بهبود",shortEn:"Identify gaps, fit and opportunities for redesign",introFa:"وقتی شرایط عوض می‌شود، سازمان زندگی هم می‌تواند هوشمندانه بازطراحی شود.",introEn:"As circumstances change, your life organization can be thoughtfully redesigned.",aspectsFa:["ممیزی تناسب","آمادگی برای تغییر","بازطراحی هدفمند"],aspectsEn:["Fit and misfit audit","Change readiness","Purposeful redesign"]}
  ];
  const I = {
    fa: {
      workspace:"فضای کاری من",asideTitle:"زندگی متناسب با من",asideDesc:"یک فضای آرام برای فکر کردن، انتخاب کردن و پیش رفتن.",localOnly:"ذخیره روی این دستگاه",mobileBrand:"سازمان زندگی من",
      home:"خانه",modules:"ماژول‌ها",workbook:"دفتر کار من",coach:"لایف کوچ من",progress:"مسیر من",profile:"پروفایل",
      homeCrumb:"نمای کلی",homeEyebrow:"DESIGN A LIFE THAT FITS",homeTitle:"زندگی من، سازمان من.",homeDesc:"یک فضای شخصی برای شناخت، طراحی و مدیریت زندگی؛ قدم‌به‌قدم، بر اساس آنچه واقعاً برای شما مناسب است.",startJourney:"شروع مسیر من",exploreModules:"کاوش ماژول‌ها",
      moduleKicker:"YOUR LIFE SYSTEM",modulesHeading:"شش بُعد سازمان زندگی",modulesDesc:"هر ماژول یک فضای مستقل است؛ همه در کنار هم یک سیستم یکپارچه می‌سازند.",viewAll:"مشاهده همه",ready:"آماده شروع",started:"در حال کاوش",
      workbookTeaser:"دفتر کار شخصی شما",workbookTeaserDesc:"یادداشت‌ها و Reflectionهای هر ماژول، در یک فضای منظم.",openWorkbook:"ورود به دفتر کار",
      moduleDescription:"این فضا فعلاً یک نمای اولیه از ماژول است. ابزارها و محتوای نهایی مطابق کتاب‌های مجموعه توسعه پیدا می‌کنند.",moduleTag:"MODULE",yourWorkspace:"فضای اختصاصی این ماژول",moduleOverview:"نمای کلی",moduleAreas:"حوزه‌های اصلی",moduleReflections:"یادداشت و بازاندیشی",moduleReflectionDesc:"نخستین فکر، سؤال یا مشاهده خود را در این حوزه بنویسید. این یک یادداشت شخصی است، نه آزمون یا ارزیابی.",reflectionPlaceholder:"چه چیزی در این بخش از زندگی برای من مهم‌تر است؟",localSave:"یادداشت در همین مرورگر و دستگاه ذخیره می‌شود.",startModule:"شروع کاوش این ماژول",continueModule:"ادامه کاوش",moduleStarted:"ماژول به مسیر شما اضافه شد.",saved:"ذخیره شد",coming:"ابزارها و Assessmentهای تخصصی در نسخه‌های بعد اضافه می‌شوند.",
      allModulesTitle:"ماژول‌های سازمان زندگی",allModulesDesc:"شش فضای مستقل، با تجربه کاربری هماهنگ و امکان حرکت آزاد میان آن‌ها.",moduleBrowse:"انتخاب و ورود به یک ماژول",
      workbookTitle:"دفتر کار من",workbookDesc:"یک نمای یکپارچه از یادداشت‌های شخصی شش ماژول. محتوای Workbook علمی در مراحل بعد افزوده می‌شود.",notesCount:"ماژول دارای یادداشت",yourNotes:"یادداشت‌های من",noNote:"هنوز یادداشتی ثبت نشده است",openAndWrite:"باز کردن ماژول",exportNotes:"دریافت نسخه پشتیبان",exportDone:"فایل یادداشت‌ها دریافت شد.",localNotice:"این نسخه پیش‌نمایش است. داده‌ها فقط در مرورگر فعلی ذخیره می‌شوند؛ برای استفاده از چند دستگاه یا اطلاعات حساس طراحی نشده است.",
      progressTitle:"مسیر من",progressDesc:"یک نمای ساده از ماژول‌هایی که باز کرده‌اید؛ بدون نمره‌دهی یا رتبه‌بندی زندگی.",modulesExplored:"ماژول‌های شروع‌شده",modulesRemaining:"ماژول‌های باقی‌مانده",notesWritten:"یادداشت‌های ثبت‌شده",moduleStatuses:"وضعیت ماژول‌ها",pathNotice:"این شاخص‌ها صرفاً وضعیت استفاده از اپلیکیشن را نشان می‌دهند، نه کیفیت یا موفقیت زندگی شما.",
      profileTitle:"فضای شخصی من",profileDesc:"تنظیمات ساده نسخه اولیه — روی همین دستگاه.",displayName:"نام نمایشی",namePlaceholder:"نام دلخواه",saveName:"ذخیره نام",nameSaved:"نام ذخیره شد.",appearance:"ظاهر اپلیکیشن",theme:"حالت نمایش",language:"زبان",light:"روشن",dark:"تیره",system:"مطابق دستگاه",privacy:"حریم خصوصی نسخه اولیه",privacyDesc:"این نسخه حساب کاربری، سرور ذخیره‌سازی یا همگام‌سازی ندارد. نوشته‌های شما فقط در Local Storage مرورگر نگهداری می‌شوند؛ برای داده محرمانه مناسب نیست.",install:"نصب روی دستگاه",reset:"پاک کردن داده‌های این نسخه",resetAsk:"همه یادداشت‌ها و تنظیمات محلی این اپلیکیشن پاک شود؟ این کار برگشت‌پذیر نیست.",resetDone:"داده‌های محلی پاک شد.",installation:"نصب اپلیکیشن",installHelp:"در Chrome از منوی سه‌نقطه گزینه Install app یا Add to Home screen را انتخاب کنید. در iPhone از Share و سپس Add to Home Screen استفاده کنید.",gotIt:"متوجه شدم",
      greeting:"سلام",anonymous:"من",backHome:"بازگشت به خانه",noNavigation:"صفحه یافت نشد",openModule:"ورود به ماژول",
      teaserTag:"THE INTERACTIVE WORKBOOK",profileSaved:"تنظیمات اعمال شد.",profileHint:"شخصی‌سازی در همین مرورگر باقی می‌ماند.",editNote:"ویرایش یادداشت",installNow:"نصب اپلیکیشن"
    },
    en: {
      workspace:"My workspace",asideTitle:"A life that fits",asideDesc:"A calm space to reflect, choose and move forward.",localOnly:"Saved on this device",mobileBrand:"My Life Organization",
      home:"Home",modules:"Modules",workbook:"My Workbook",coach:"My Life Coach",progress:"My Journey",profile:"Profile",
      homeCrumb:"Overview",homeEyebrow:"DESIGN A LIFE THAT FITS",homeTitle:"My life. My organization.",homeDesc:"A personal space to understand, design and manage your life, step by step, on your own terms.",startJourney:"Begin my journey",exploreModules:"Explore modules",
      moduleKicker:"YOUR LIFE SYSTEM",modulesHeading:"Six dimensions of life",modulesDesc:"Each module is independent. Together, they form an integrated system.",viewAll:"View all",ready:"Ready to begin",started:"Exploring",
      workbookTeaser:"Your personal workbook",workbookTeaserDesc:"Notes and reflections from every module, organized in one place.",openWorkbook:"Open workbook",
      moduleDescription:"This is an early module preview. Full content and tools will follow the book series.",moduleTag:"MODULE",yourWorkspace:"Your module workspace",moduleOverview:"Overview",moduleAreas:"Focus areas",moduleReflections:"Notes & reflection",moduleReflectionDesc:"Capture an early thought, question or observation. This is a personal note, not an assessment.",reflectionPlaceholder:"What matters most to me in this part of life?",localSave:"Saved only in this browser on this device.",startModule:"Start exploring",continueModule:"Continue exploring",moduleStarted:"Module added to your journey.",saved:"Saved",coming:"Dedicated tools and assessments will arrive in later versions.",
      allModulesTitle:"Life Organization modules",allModulesDesc:"Six independent spaces with a consistent experience and flexible navigation.",moduleBrowse:"Choose a module",
      workbookTitle:"My Workbook",workbookDesc:"One place for personal notes across all six modules. The research-based Workbook will be added in later releases.",notesCount:"modules with notes",yourNotes:"My notes",noNote:"No notes yet",openAndWrite:"Open module",exportNotes:"Export my notes",exportDone:"Notes exported.",localNotice:"This is a preview. Data is only stored in this browser; it is not suitable for sensitive data or multi-device use.",
      progressTitle:"My Journey",progressDesc:"A simple view of the modules you have begun, without life scores or rankings.",modulesExplored:"Modules explored",modulesRemaining:"Modules remaining",notesWritten:"Notes created",moduleStatuses:"Module status",pathNotice:"These indicators track app usage, not the quality or success of your life.",
      profileTitle:"My space",profileDesc:"Basic settings for the early preview, on this device.",displayName:"Display name",namePlaceholder:"Your preferred name",saveName:"Save name",nameSaved:"Name saved.",appearance:"Appearance",theme:"Theme",language:"Language",light:"Light",dark:"Dark",system:"Follow device",privacy:"Privacy in this preview",privacyDesc:"No account, cloud storage or syncing is available. Notes stay in browser local storage and are not suitable for confidential information.",install:"Install the app",reset:"Clear preview data",resetAsk:"Permanently erase notes and preferences saved in this browser?",resetDone:"Local data cleared.",installation:"Install the app",installHelp:"In Chrome, choose Install app or Add to Home screen from the browser menu. On iPhone, use Share > Add to Home Screen.",gotIt:"Got it",
      greeting:"Hello",anonymous:"Me",backHome:"Back home",noNavigation:"Page not found",openModule:"Open module",
      teaserTag:"THE INTERACTIVE WORKBOOK",profileSaved:"Preferences updated.",profileHint:"Preferences are saved in this browser.",editNote:"Edit note",installNow:"Install app"
    }
  };
  const blank = () => ({lang:"fa",theme:"light",name:"",started:[],notes:{}});
  function loadState(){
    try {
      const raw = JSON.parse(localStorage.getItem(KEY)||"null");
      if (!raw || typeof raw!=="object") return blank();
      return {
        lang: raw.lang==="en"?"en":"fa",
        theme:["dark","light","system"].includes(raw.theme)?raw.theme:"light",
        name:typeof raw.name==="string"?raw.name.slice(0,80):"",
        started:Array.isArray(raw.started)?raw.started.filter(v=>Number.isInteger(v)&&v>=1&&v<=6):[],
        notes:raw.notes&&typeof raw.notes==="object"?raw.notes:{}
      };
    }catch(e){return blank()}
  }
  let state=loadState();
  let installPrompt=null, toastTimeout=null;
  const $=s=>document.querySelector(s);
  const t=k=>I[state.lang][k]||k;
  const tr=(fa,en)=>state.lang==="fa"?fa:en;
  const esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  function persist(){try{localStorage.setItem(KEY,JSON.stringify(state));return true}catch(e){return false}}
  function icons(name){
    const map={
      home:'<path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1z"/>',
      modules:'<rect x="3" y="3" width="7" height="7" rx="2"/><rect x="14" y="3" width="7" height="7" rx="2"/><rect x="3" y="14" width="7" height="7" rx="2"/><rect x="14" y="14" width="7" height="7" rx="2"/>',
      workbook:'<path d="M4 19V5a2 2 0 0 1 2-2h14v17H6a2 2 0 0 1 0-4h14"/><path d="M8 7h8M8 11h6"/>',
      progress:'<path d="M4 19V5M4 19h17M8 15l4-4 3 2 5-7"/><path d="M17 6h3v3"/>',
      profile:'<circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 3.5-7 8-7s8 3 8 7"/>',
      coach:'<path d="M12 2.5 14.4 9.6 21.5 12l-7.1 2.4L12 21.5l-2.4-7.1L2.5 12l7.1-2.4z"/>',
      moon:'<path d="M20.5 14A8.5 8.5 0 0 1 10 3.5 8.5 8.5 0 1 0 20.5 14Z"/>',
      sun:'<circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M4.9 4.9l1.4 1.4m11.4 11.4 1.4 1.4M2 12h2m16 0h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
      identity:'<circle cx="12" cy="9" r="4"/><path d="M5 20c.2-4 2.7-6 7-6s6.8 2 7 6"/><path d="M18 5l3 3"/>',
      strategy:'<circle cx="12" cy="12" r="9"/><path d="m15.5 8.5-2.2 4.8-4.8 2.2 2.2-4.8z"/>',
      design:'<rect x="3" y="3" width="8" height="8" rx="2"/><rect x="13" y="3" width="8" height="8" rx="2"/><rect x="3" y="13" width="8" height="8" rx="2"/><path d="M17 13v8M13 17h8"/>',
      coordination:'<circle cx="6" cy="6" r="2"/><circle cx="18" cy="6" r="2"/><circle cx="12" cy="18" r="2"/><path d="M7.6 7.3 11 16m6-8.7L13 16M8 6h8"/>',
      performance:'<path d="M3 20h18M5 15l4-5 4 3 6-8"/><path d="M16 5h3v3"/>',
      audit:'<circle cx="10" cy="10" r="7"/><path d="m15 15 6 6M7 10l2 2 4-4"/>',
      spark:'<path d="m12 2 2.4 7.6L22 12l-7.6 2.4L12 22l-2.4-7.6L2 12l7.6-2.4Z"/>',
      download:'<path d="M12 3v12m-4-4 4 4 4-4M4 17v4h16v-4"/>',
      arrow:'<path d="M5 12h14m-6-6 6 6-6 6"/>',
      check:'<path d="m5 12 4 4L19 6"/>',
      notebook:'<rect x="5" y="3" width="15" height="18" rx="2"/><path d="M9 3v18m4-12h4m-4 4h4"/>'
    };
    return '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+(map[name]||map.spark)+'</svg>';
  }
  const moduleName=m=>tr(m.fa,m.en), moduleShort=m=>tr(m.shortFa,m.shortEn),moduleIntro=m=>tr(m.introFa,m.introEn);
  const started=id=>state.started.includes(id);
  const hasNote=id=>Boolean(typeof state.notes[id]==="string"&&state.notes[id].trim());
  const moduleIcon=m=>'<span class="module-icon">'+icons(m.icon)+'</span>';
  const status=id=>'<span class="status '+(started(id)?"active":"")+'">'+(started(id)?t("started"):t("ready"))+'</span>';
  const navItems=[["home","home"],["modules","modules"],["workbook","workbook"],["coach","coach"],["progress","progress"],["profile","profile"]];
  function route(){
    const h=decodeURIComponent(location.hash.replace(/^#/,""))||"home";
    const parts=h.split("/");
    if(parts[0]==="module"&&/^[1-6]$/.test(parts[1]||""))return {page:"module",id:Number(parts[1])};
    if(["home","modules","workbook","coach","progress","profile"].includes(h))return {page:h};
    return {page:"home"};
  }
  function navigate(next){location.hash=next;if(location.hash.slice(1)===next)render()}
  function navHtml(active,mobile=false){
    const list=mobile?navItems.filter(x=>["home","modules","workbook","coach","profile"].includes(x[0])):navItems;
    return list.map(([key,ic])=>'<button class="'+(mobile?"bottom-link":"nav-link")+(active===key?" active":"")+'" type="button" data-route="'+key+'" '+(active===key?'aria-current="page"':"")+'>'+icons(ic)+'<span>'+esc(t(key))+'</span></button>').join("");
  }
  function moduleCard(m){
    return '<button type="button" class="module-card module-'+m.id+'" data-route="module/'+m.id+'" aria-label="'+esc(moduleName(m))+'">'+
      '<div class="card-top">'+moduleIcon(m)+'<span class="module-number">0'+m.id+' / 06</span></div>'+
      '<div class="card-title">'+esc(moduleName(m))+'</div><p class="card-en" dir="ltr">'+esc(m.en)+'</p>'+
      '<p class="card-desc">'+esc(moduleShort(m))+'</p><div class="card-bottom">'+status(m.id)+'<span class="card-arrow">↗</span></div></button>';
  }
  function orbit(){
    return '<div class="orbit" aria-hidden="true"><div class="orbit-ring"></div><div class="orbit-ring two"></div><div class="orbit-center">L</div>'+
    MODULES.map((m,i)=>'<span class="orbit-node n'+(i+1)+'">'+icons(m.icon)+'</span>').join("")+'</div>';
  }
  function homePage(){
    const next=MODULES.find(m=>!started(m.id))||MODULES[0];
    return '<section class="hero"><div class="hero-copy"><div class="eyebrow">'+t("homeEyebrow")+'</div>'+
      '<h1>'+t("homeTitle")+'</h1><p class="hero-sub">'+t("homeDesc")+'</p><div class="hero-buttons">'+
      '<button class="btn btn-hero" data-route="module/'+next.id+'">'+t("startJourney")+' <span aria-hidden="true">↗</span></button>'+
      '<button class="btn btn-ghost" data-route="modules">'+t("exploreModules")+'</button></div></div>'+orbit()+'</section>'+
      '<section><div class="section-heading"><div><div class="section-kicker">'+t("moduleKicker")+'</div><h2>'+t("modulesHeading")+'</h2><p>'+t("modulesDesc")+'</p></div><button class="inline-link" data-route="modules">'+t("viewAll")+' ↗</button></div>'+
      '<div class="module-grid">'+MODULES.map(moduleCard).join("")+'</div></section>'+
+
      '<section class="life-coach-teaser"><div><span class="section-kicker">MY AI LIFE COACH</span><h2>'+(state.lang==="fa"?"مربی هوش مصنوعی زندگی من":"My AI Life Coach")+'</h2><p>'+(state.lang==="fa"?"فضایی برای Reflection، انتخاب آگاهانه و طراحی زندگی؛ به‌زودی.":"A place to reflect, clarify choices and move forward — coming soon.")+'</p></div><button type="button" class="btn btn-primary" data-route="coach">'+(state.lang==="fa"?"مشاهده · به‌زودی":"Explore · Coming soon")+' ↗</button></section>'
      '<div class="bottom-note"><span class="note-icon">'+icons("workbook")+'</span><div><h3>'+t("workbookTeaser")+'</h3><p>'+t("workbookTeaserDesc")+'</p></div><button class="inline-link" data-route="workbook">'+t("openWorkbook")+' ↗</button></div>';
  }
  function modulesPage(){
    return '<div class="page-lead"><p class="section-kicker">'+t("moduleKicker")+'</p><h1>'+t("allModulesTitle")+'</h1><p>'+t("allModulesDesc")+'</p></div>'+
    '<div class="section-heading"><div><h2>'+t("moduleBrowse")+'</h2></div></div><div class="module-grid">'+MODULES.map(moduleCard).join("")+'</div>';
  }
  function modulePage(id){
    const m=MODULES[id-1];
    return '<section class="module-hero module-'+id+'"><div class="module-hero-main">'+moduleIcon(m)+'<div class="module-overline">'+t("moduleTag")+' 0'+id+' / 06</div>'+
      '<h1>'+esc(moduleName(m))+'</h1><div class="en-title">'+esc(m.en)+'</div><p>'+esc(moduleIntro(m))+'</p></div>'+
      '<div class="module-hero-side">'+status(id)+'<button class="btn '+(started(id)?"btn-outline":"btn-primary")+'" type="button" data-action="start" data-module="'+id+'">'+(started(id)?t("continueModule"):t("startModule"))+' ↗</button></div></section>'+
      '<div class="panel-grid"><section class="panel"><div class="panel-kicker">REFLECT & EXPLORE</div><h2>'+t("moduleReflections")+'</h2><p>'+t("moduleReflectionDesc")+'</p>'+
      '<label class="field-label" for="reflection">'+t("yourWorkspace")+'</label>'+
      '<textarea id="reflection" class="field" maxlength="3000" placeholder="'+esc(t("reflectionPlaceholder"))+'" data-module="'+id+'">'+esc(state.notes[id]||"")+'</textarea>'+
      '<div class="field-help">'+t("localSave")+'</div></section>'+
      '<section class="panel"><div class="panel-kicker">MODULE OVERVIEW</div><h2>'+t("moduleAreas")+'</h2><ul>'+tr(m.aspectsFa,m.aspectsEn).map(x=>'<li>'+esc(x)+'</li>').join("")+'</ul>'+
      '<p>'+t("moduleDescription")+'</p><div class="feature-callout"><strong>'+t("coming")+'</strong></div></section></div>';
  }
  function workbookPage(){
    const count=MODULES.filter(m=>hasNote(m.id)).length;
    return '<div class="page-lead"><p class="section-kicker">'+t("teaserTag")+'</p><h1>'+t("workbookTitle")+'</h1><p>'+t("workbookDesc")+'</p></div>'+
      '<div class="stat-strip"><div class="stat-block"><b>'+count+' / 6</b><span>'+t("notesCount")+'</span></div></div>'+
      '<div class="section-heading"><h2>'+t("yourNotes")+'</h2><button class="btn btn-outline" data-action="export">'+icons("download")+t("exportNotes")+'</button></div>'+
      '<div class="workbook-list">'+MODULES.map(m=>'<button class="workbook-item module-'+m.id+'" data-route="module/'+m.id+'">'+moduleIcon(m)+
      '<span><strong>'+esc(moduleName(m))+'</strong><small>'+esc(hasNote(m.id)?state.notes[m.id].trim().slice(0,67):t("noNote"))+'</small></span><span class="card-arrow">↗</span></button>').join("")+'</div>'+
      '<div class="feature-callout"><p>'+t("localNotice")+'</p></div>';
  }
  function progressPage(){
    const count=state.started.length,n=MODULES.filter(m=>hasNote(m.id)).length;
    return '<div class="page-lead"><p class="section-kicker">MY JOURNEY</p><h1>'+t("progressTitle")+'</h1><p>'+t("progressDesc")+'</p></div>'+
      '<div class="stat-strip"><div class="stat-block"><b>'+count+' / 6</b><span>'+t("modulesExplored")+'</span></div>'+
      '<div class="stat-block"><b>'+(6-count)+'</b><span>'+t("modulesRemaining")+'</span></div><div class="stat-block"><b>'+n+'</b><span>'+t("notesWritten")+'</span></div></div>'+
      '<section class="panel"><h2>'+t("moduleStatuses")+'</h2><div class="progress-rows">'+MODULES.map(m=>'<div class="progress-row module-'+m.id+'">'+moduleIcon(m)+'<strong>'+esc(moduleName(m))+'</strong>'+status(m.id)+
      '<button type="button" data-route="module/'+m.id+'">'+t("openModule")+' ↗</button></div>').join("")+'</div></section>'+
      '<div class="feature-callout"><p>'+t("pathNotice")+'</p></div>';
  }
  function profilePage(){
    return '<div class="page-lead"><p class="section-kicker">MY SPACE</p><h1>'+t("profileTitle")+'</h1><p>'+t("profileDesc")+'</p></div>'+
      '<div class="profile-grid"><section class="panel"><h2>'+t("displayName")+'</h2><label class="field-label" for="name-input">'+t("displayName")+'</label>'+
      '<input class="input" id="name-input" type="text" autocomplete="nickname" maxlength="80" value="'+esc(state.name)+'" placeholder="'+t("namePlaceholder")+'">'+
      '<p class="field-help">'+t("profileHint")+'</p><button class="btn btn-primary" data-action="save-name">'+t("saveName")+'</button></section>'+
      '<section class="panel"><h2>'+t("appearance")+'</h2><div class="setting-row"><label for="theme-select">'+t("theme")+'</label><select class="input" id="theme-select">'+
      ['light','dark','system'].map(x=>'<option value="'+x+'" '+(state.theme===x?"selected":"")+'>'+t(x)+'</option>').join("")+'</select></div>'+
      '<div class="setting-row"><label for="language-select">'+t("language")+'</label><select class="input" id="language-select"><option value="fa" '+(state.lang==="fa"?"selected":"")+'>فارسی</option><option value="en" '+(state.lang==="en"?"selected":"")+'>English</option></select></div>'+
      '<div class="setting-row"><label>'+t("install")+'</label><button class="btn btn-outline" data-action="install">'+t("installNow")+'</button></div></section></div>'+
      '<div class="panel" style="margin-top:17px"><h2>'+t("privacy")+'</h2><p>'+t("privacyDesc")+'</p><button class="btn btn-danger" data-action="reset">'+t("reset")+'</button></div>';
  }

  function coachPage(){
    const fa=state.lang==="fa";
    const title=fa?"مربی هوش مصنوعی زندگی من":"My AI Life Coach";
    const subtitle=fa?"یک فضای شخصی برای بازاندیشی، روشن‌سازی اولویت‌ها و طراحی زندگی متناسب با من؛ در نسخه‌های آینده.":"A personal space for reflection, clarifying priorities and designing a life that fits — in a future update.";
    const items=fa?[["شناخت و بازاندیشی","فهم نقش‌ها، ارزش‌ها و آنچه واقعاً مهم است."],["تصمیم‌ها و اولویت‌ها","Explore alternatives و انتخاب آگاهانه، بدون نسخه واحد."],["اقدام و پیگیری","تبدیل بینش به Next Best Step و مرور پیشرفت."]]:[["Reflection & insight","Explore roles, values and what matters most."],["Choices & priorities","Broaden perspective without prescribed answers."],["Action & follow-through","Turn insights into next steps and review progress."]];
    return '<section class="life-coach-page"><div class="page-lead"><p class="section-kicker">MY AI LIFE COACH · COMING SOON</p><h1>'+title+'</h1><p>'+subtitle+'</p></div>'+
      '<div class="life-coach-banner"><div><span class="life-coach-mark">'+icons("coach")+'</span><h2>'+(fa?"زندگی متناسب با من، با تأمل و انتخاب":"A life that fits, through reflection and choice")+'</h2><p>'+(fa?"این بخش فعلاً فقط پیش‌نمایش است؛ هیچ مکالمه هوش مصنوعی یا اتصال به داده‌های شخصی فعال نیست.":"This is a preview only. No AI chat or personal-data connection is active.")+'</p><span class="life-coach-status">'+(fa?"به‌زودی":"Coming soon")+'</span></div><div class="life-coach-orbit">✦</div></div>'+
      '<div class="life-coach-features">'+items.map(x=>'<article><span class="life-coach-dot">✧</span><h3>'+x[0]+'</h3><p>'+x[1]+'</p><small>'+(fa?"به‌زودی":"Coming soon")+'</small></article>').join("")+'</div></section>';
  }
  const pageFn={home:homePage,modules:modulesPage,workbook:workbookPage,coach:coachPage,progress:progressPage,profile:profilePage};
  function applyTheme(){
    const dark=state.theme==="dark"||(state.theme==="system"&&window.matchMedia&&matchMedia("(prefers-color-scheme: dark)").matches);
    document.documentElement.dataset.theme=dark?"dark":"light";
    const themeBtn=$("#theme-btn"); if(themeBtn)themeBtn.innerHTML=icons(dark?"sun":"moon");
  }
  function render(){
    const r=route(), active=r.page==="module"?"modules":r.page;
    document.documentElement.lang=state.lang;
    document.documentElement.dir=state.lang==="fa"?"rtl":"ltr";
    document.querySelectorAll("[data-i18n]").forEach(el=>{el.textContent=t(el.dataset.i18n)});
    $("#side-nav").innerHTML=navHtml(active);
    $("#bottom-nav").innerHTML=navHtml(active,true);
    const crumb=r.page==="module"?moduleName(MODULES[r.id-1]):t(r.page==="home"?"homeCrumb":r.page);
    $("#breadcrumbs").innerHTML='<span>'+t("home")+'</span><span class="crumb-sep">/</span><strong>'+esc(crumb)+'</strong>';
    $("#page").innerHTML=r.page==="module"?modulePage(r.id):pageFn[r.page]();
    $("#language-btn").textContent=state.lang==="fa"?"EN":"فا";
    $("#avatar-letter").textContent=(state.name.trim()||t("anonymous")).charAt(0).toUpperCase();
    $("#install-title").textContent=t("installation");$("#install-body").textContent=t("installHelp");
    $("#profile-btn").setAttribute("aria-label",t("profile"));
    applyTheme(); document.title=crumb+" | The Life Organization";
  }
  function toast(message){
    const el=$("#toast");el.textContent=message;el.classList.add("visible");
    if(toastTimeout)clearTimeout(toastTimeout);
    toastTimeout=setTimeout(()=>el.classList.remove("visible"),2400);
  }
  function downloadNotes(){
    const payload={app:"The Life Organization",exportedAt:new Date().toISOString(),formatVersion:1,notes:state.notes,startedModules:state.started};
    const url=URL.createObjectURL(new Blob([JSON.stringify(payload,null,2)],{type:"application/json;charset=utf-8"}));
    const a=document.createElement("a");a.href=url;a.download="life-organization-notes.json";
    document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);toast(t("exportDone"));
  }
  document.addEventListener("click",e=>{
    const routeBtn=e.target.closest("[data-route]");if(routeBtn){e.preventDefault();navigate(routeBtn.dataset.route);return}
    const act=e.target.closest("[data-action]");if(!act)return;
    switch(act.dataset.action){
      case "start":{
        const id=Number(act.dataset.module);
        if(!started(id)){state.started.push(id);state.started.sort((a,b)=>a-b);persist();render();toast(t("moduleStarted"));}
        else {const note=$("#reflection");if(note)note.focus()}
        break;
      }
      case "save-name":state.name=($("#name-input")?.value||"").trim().slice(0,80);persist();render();toast(t("nameSaved"));break;
      case "export":downloadNotes();break;
      case "reset":if(confirm(t("resetAsk"))){const lang=state.lang,theme=state.theme;state=blank();state.lang=lang;state.theme=theme;persist();render();toast(t("resetDone"))}break;
      case "install":if(installPrompt){installPrompt.prompt();installPrompt.userChoice.finally(()=>{installPrompt=null})}else $("#install-dialog").showModal();break;
    }
  });
  document.addEventListener("input",e=>{
    if(e.target.id==="reflection"){
      const id=Number(e.target.dataset.module);
      if(id>=1&&id<=6){state.notes[id]=e.target.value.slice(0,3000);persist()}
    }
  });
  document.addEventListener("change",e=>{
    if(e.target.id==="language-select"){state.lang=e.target.value==="en"?"en":"fa";persist();render();return}
    if(e.target.id==="theme-select"){state.theme=["light","dark","system"].includes(e.target.value)?e.target.value:"light";persist();applyTheme();return}
  });
  $("#language-btn").addEventListener("click",()=>{state.lang=state.lang==="fa"?"en":"fa";persist();render()});
  $("#theme-btn").addEventListener("click",()=>{state.theme=document.documentElement.dataset.theme==="dark"?"light":"dark";persist();applyTheme()});
  $("#profile-btn").addEventListener("click",()=>navigate("profile"));
  window.addEventListener("hashchange",()=>{render();window.scrollTo({top:0,behavior:"instant"})});
  window.addEventListener("beforeinstallprompt",e=>{e.preventDefault();installPrompt=e});
  if(window.matchMedia)matchMedia("(prefers-color-scheme: dark)").addEventListener?.("change",()=>{if(state.theme==="system")applyTheme()});
  if("serviceWorker"in navigator){window.addEventListener("load",()=>navigator.serviceWorker.register("./sw.js").catch(()=>{}))}
  render();
})();