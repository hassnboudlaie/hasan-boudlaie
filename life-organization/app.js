/* The Life Organization · v0.1 Preview
   Independent, offline-friendly client-side app shell. No user authentication, sync or scoring.
   Local storage is not encrypted. Do not enter confidential information in this preview. */
(() => {
  "use strict";
  const KEY = "tlo-v01-personal-workspace";
  const I = {
    fa: {
      workspace:"فضای کاری من",asideTitle:"زندگی متناسب با من",asideDesc:"یک فضای آرام برای فکر کردن، انتخاب کردن و پیش رفتن.",localOnly:"ذخیره روی این دستگاه",mobileBrand:"سازمان عالی زندگی من",
      home:"خانه",modules:"ماژول‌ها",workbook:"دفتر کار من",fun:"سرگرمی",coach:"لایف کوچ من",progress:"مسیر من",profile:"پروفایل",
      homeCrumb:"نمای کلی",homeEyebrow:"DESIGN A LIFE THAT FITS",homeTitle:"زندگی من، سازمان من.",homeDesc:"یک فضای شخصی برای شناخت، طراحی و مدیریت زندگی؛ قدم‌به‌قدم، بر اساس آنچه واقعاً برای شما مناسب است.",startJourney:"شروع مسیر من",exploreModules:"کاوش ماژول‌ها",
      moduleKicker:"YOUR LIFE SYSTEM",modulesHeading:"شش بُعد سازمان زندگی",modulesDesc:"هر ماژول یک فضای مستقل است؛ همه در کنار هم یک سیستم یکپارچه می‌سازند.",viewAll:"مشاهده همه",ready:"آماده شروع",started:"در حال کاوش",
      workbookTeaser:"دفتر کار و مسیر یادگیری من",workbookTeaserDesc:"یادداشت‌ها و Reflectionهای هر ماژول، در یک فضای منظم.",openWorkbook:"ورود به دفتر کار",
      moduleDescription:"این فضا فعلاً یک نمای اولیه از ماژول است. ابزارها و محتوای نهایی مطابق کتاب‌های مجموعه توسعه پیدا می‌کنند.",moduleTag:"MODULE",yourWorkspace:"فضای اختصاصی این ماژول",moduleOverview:"نمای کلی",moduleAreas:"حوزه‌های اصلی",moduleReflections:"یادداشت و بازاندیشی",moduleReflectionDesc:"نخستین فکر، سؤال یا مشاهده خود را در این حوزه بنویسید. این یک یادداشت شخصی است، نه آزمون یا ارزیابی.",reflectionPlaceholder:"چه چیزی در این بخش از زندگی برای من مهم‌تر است؟",localSave:"یادداشت در همین مرورگر و دستگاه ذخیره می‌شود.",startModule:"شروع کاوش این ماژول",continueModule:"ادامه کاوش",moduleStarted:"ماژول به مسیر شما اضافه شد.",saved:"ذخیره شد",coming:"ابزارها و Assessmentهای تخصصی در نسخه‌های بعد اضافه می‌شوند.",
      allModulesTitle:"ماژول‌های سازمان زندگی",allModulesDesc:"شش فضای مستقل، با تجربه کاربری هماهنگ و امکان حرکت آزاد میان آن‌ها.",moduleBrowse:"انتخاب و ورود به یک ماژول",
      workbookTitle:"دفتر کار من",workbookDesc:"یادداشت‌های شش ماژول و دفتر کار کامل یازده فصل تألیف‌شده جلد اول، در یک فضای واحد. ابزارهای جلدهای بعد به‌تدریج اضافه می‌شوند.",notesCount:"ماژول دارای یادداشت",yourNotes:"یادداشت‌های من",noNote:"هنوز یادداشتی ثبت نشده است",openAndWrite:"باز کردن ماژول",exportNotes:"دریافت نسخه پشتیبان",exportDone:"فایل یادداشت‌ها دریافت شد.",localNotice:"این نسخه پیش‌نمایش است. داده‌ها فقط در مرورگر فعلی ذخیره می‌شوند؛ برای استفاده از چند دستگاه یا اطلاعات حساس طراحی نشده است.",
      progressTitle:"مسیر یادگیری من",progressDesc:"پیشرفت مطالعه، سکه‌ها و نشان‌های یادگیری؛ بدون نمره‌دهی یا رتبه‌بندی زندگی.",modulesExplored:"ماژول‌های شروع‌شده",modulesRemaining:"ماژول‌های باقی‌مانده",notesWritten:"یادداشت‌های ثبت‌شده",moduleStatuses:"وضعیت ماژول‌ها",pathNotice:"این شاخص‌ها صرفاً وضعیت استفاده از اپلیکیشن را نشان می‌دهند، نه کیفیت یا موفقیت زندگی شما.",
      profileTitle:"فضای شخصی من",profileDesc:"تنظیمات ساده نسخه اولیه — روی همین دستگاه.",displayName:"نام نمایشی",namePlaceholder:"نام دلخواه",saveName:"ذخیره نام",nameSaved:"نام ذخیره شد.",appearance:"ظاهر اپلیکیشن",theme:"حالت نمایش",language:"زبان",light:"روشن",dark:"تیره",system:"مطابق دستگاه",privacy:"حریم خصوصی نسخه اولیه",privacyDesc:"این نسخه حساب کاربری، سرور ذخیره‌سازی یا همگام‌سازی ندارد. نوشته‌های شما فقط در Local Storage مرورگر نگهداری می‌شوند؛ برای داده محرمانه مناسب نیست.",install:"نصب روی دستگاه",reset:"پاک کردن داده‌های این نسخه",resetAsk:"همه یادداشت‌ها و تنظیمات محلی این اپلیکیشن پاک شود؟ این کار برگشت‌پذیر نیست.",resetDone:"داده‌های محلی پاک شد.",installation:"نصب اپلیکیشن",installHelp:"در Chrome از منوی سه‌نقطه گزینه Install app یا Add to Home screen را انتخاب کنید. در iPhone از Share و سپس Add to Home Screen استفاده کنید.",gotIt:"متوجه شدم",
      greeting:"سلام",anonymous:"من",backHome:"بازگشت به خانه",noNavigation:"صفحه یافت نشد",openModule:"ورود به ماژول",
      teaserTag:"THE INTERACTIVE WORKBOOK",profileSaved:"تنظیمات اعمال شد.",profileHint:"شخصی‌سازی در همین مرورگر باقی می‌ماند.",editNote:"ویرایش یادداشت",installNow:"نصب اپلیکیشن"
    },
    en: {
      workspace:"My workspace",asideTitle:"A life that fits",asideDesc:"A calm space to reflect, choose and move forward.",localOnly:"Saved on this device",mobileBrand:"My Life Organization",
      home:"Home",modules:"Modules",workbook:"My Workbook",fun:"Fun",coach:"My Life Coach",progress:"My Journey",profile:"Profile",
      homeCrumb:"Overview",homeEyebrow:"DESIGN A LIFE THAT FITS",homeTitle:"My life. My organization.",homeDesc:"A personal space to understand, design and manage your life, step by step, on your own terms.",startJourney:"Begin my journey",exploreModules:"Explore modules",
      moduleKicker:"YOUR LIFE SYSTEM",modulesHeading:"Six dimensions of life",modulesDesc:"Each module is independent. Together, they form an integrated system.",viewAll:"View all",ready:"Ready to begin",started:"Exploring",
      workbookTeaser:"My workbook & learning journey",workbookTeaserDesc:"Notes and reflections from every module, organized in one place.",openWorkbook:"Open workbook",
      moduleDescription:"This is an early module preview. Full content and tools will follow the book series.",moduleTag:"MODULE",yourWorkspace:"Your module workspace",moduleOverview:"Overview",moduleAreas:"Focus areas",moduleReflections:"Notes & reflection",moduleReflectionDesc:"Capture an early thought, question or observation. This is a personal note, not an assessment.",reflectionPlaceholder:"What matters most to me in this part of life?",localSave:"Saved only in this browser on this device.",startModule:"Start exploring",continueModule:"Continue exploring",moduleStarted:"Module added to your journey.",saved:"Saved",coming:"Dedicated tools and assessments will arrive in later versions.",
      allModulesTitle:"Life Organization modules",allModulesDesc:"Six independent spaces with a consistent experience and flexible navigation.",moduleBrowse:"Choose a module",
      workbookTitle:"My Workbook",workbookDesc:"Your notes across six modules plus the complete linked workbook for the first six chapters of Book One. Later volumes will be added progressively.",notesCount:"modules with notes",yourNotes:"My notes",noNote:"No notes yet",openAndWrite:"Open module",exportNotes:"Export my notes",exportDone:"Notes exported.",localNotice:"This is a preview. Data is only stored in this browser; it is not suitable for sensitive data or multi-device use.",
      progressTitle:"My Learning Journey",progressDesc:"Reading progress, learning coins and badges — never life scores or rankings.",modulesExplored:"Modules explored",modulesRemaining:"Modules remaining",notesWritten:"Notes created",moduleStatuses:"Module status",pathNotice:"These indicators track app usage, not the quality or success of your life.",
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
      fun:'<path d="m12 3 2.4 6.6L21 12l-6.6 2.4L12 21l-2.4-6.6L3 12l6.6-2.4z"/><path d="M19 3v3m-1.5-1.5h3M4 18v3m-1.5-1.5h3"/>',
      spark:'<path d="m12 2 2.4 7.6L22 12l-7.6 2.4L12 22l-2.4-7.6L2 12l7.6-2.4Z"/>',
      download:'<path d="M12 3v12m-4-4 4 4 4-4M4 17v4h16v-4"/>',
      arrow:'<path d="M5 12h14m-6-6 6 6-6 6"/>',
      check:'<path d="m5 12 4 4L19 6"/>',
      notebook:'<rect x="5" y="3" width="15" height="18" rx="2"/><path d="M9 3v18m4-12h4m-4 4h4"/>'
    };
    return '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+(map[name]||map.spark)+'</svg>';
  }
  const moduleName=m=>tr(m.fa,m.en), moduleShort=m=>tr(m.shortFa,m.shortEn),moduleIntro=m=>tr(m.introFa,m.introEn);
  const navItems=[["module/1","modules"],["fun","fun"]];
  function route(){
    const h=location.hash.slice(1)||"module/1";
    const parts=h.split("/");
    if(parts[0]==="fun"&&(parts.length===1||(parts.length===2&&/^(values|direction|growth|work|money|relations|wellbeing|character)$/.test(parts[1]))))return {page:"fun",id:parts[1]||null};
    if(parts[0]==="book1"&&parts[1]==="front"&&["about","intro","guide","toc"].includes(parts[2]||"")&&parts.length===3)return {page:"book1",id:0,mode:"front",section:parts[2]};
    if(parts[0]==="book1"&&parts[1]==="profile"&&parts.length===2)return {page:"book1",id:0,mode:"profile"};
    if(parts[0]==="book1"&&parts[1]==="workbook"&&parts.length===2)return {page:"book1",id:0,mode:"workbook"};
    if(parts[0]==="book1"&&/^(?:[1-9]|1[0-2])$/.test(parts[1]||"")&&(parts.length===2||(parts.length===3&&parts[2]==="workbook")))return {page:"book1",id:Number(parts[1]),mode:parts[2]==="workbook"?"workbook":"read"};
    if(h==="profile")return {page:"profile"};
    if(h==="workbook")return {page:"book1",id:0,mode:"workbook"};
    return {page:"module",id:1};
  }
  function navigate(next){location.hash=next;if(location.hash.slice(1)===next)render()}
  function navHtml(active,mobile=false){
    const list=navItems;
    return list.map(([key,ic])=>'<button class="'+(mobile?"bottom-link":"nav-link")+(active===key?" active":"")+'" type="button" data-route="'+key+'" '+(active===key?'aria-current="page"':"")+'>'+icons(ic)+'<span>'+esc(key==="module/1"?tr("جلد اول","Book One"):t(key))+'</span></button>').join("");
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

  function applyTheme(){
    const dark=state.theme==="dark"||(state.theme==="system"&&window.matchMedia&&matchMedia("(prefers-color-scheme: dark)").matches);
    document.documentElement.dataset.theme=dark?"dark":"light";
    const themeBtn=$("#theme-btn"); if(themeBtn)themeBtn.innerHTML=icons(dark?"sun":"moon");
  }
  function render(){
    const r=route(), active=(r.page==="module"||r.page==="book1")?"module/1":r.page;
    document.documentElement.lang=state.lang;
    document.documentElement.dir=state.lang==="fa"?"rtl":"ltr";
    document.querySelectorAll("[data-i18n]").forEach(el=>{el.textContent=t(el.dataset.i18n)});
    $("#side-nav").innerHTML=navHtml(active);
    $("#bottom-nav").innerHTML=navHtml(active,true);
    const crumb=r.page==="fun"?tr("سرگرمی","Fun"):r.page==="profile"?t("profile"):r.id&&r.page==="book1"?window.LifeBookContent.chapters[r.id-1].title:tr("جلد اول","Book One");
    $("#breadcrumbs").innerHTML='<span>'+esc(tr("سازمان عالی زندگی من","The Life Organization"))+'</span><span class="crumb-sep">/</span><strong>'+esc(crumb)+'</strong>';
    $("#page").innerHTML=r.page==="module"?window.LifeBook.landing(state.lang):r.page==="book1"&&window.LifeBook?(r.id===0?(r.mode==="front"?window.LifeBook.frontmatter(state.lang,r.section):r.mode==="profile"?window.LifeBook.profile(state.lang):window.LifeBook.workbook(state.lang)):r.mode==="workbook"?window.LifeBook.worksheet(r.id,state.lang):window.LifeBook.chapter(r.id,state.lang)):r.page==="fun"?window.LifeFun.page(state.lang,r.id):profilePage();
    const view=$("#page");
    view.previousElementSibling?.matches(".current-book-nav") && view.previousElementSibling.remove();
    if(r.page==="module"||r.page==="book1"){
      const routes=[["module/1",tr("مسیر جلد اول","Book One"),r.page==="module"],["book1/front/toc",tr("فهرست فصل‌ها","Contents"),r.mode==="front"],["book1/workbook",tr("دفتر کار","Workbook"),r.mode==="workbook"],["book1/profile",tr("نمایه من","My profile"),r.mode==="profile"]];
      const sub=document.createElement("nav");
      sub.className="current-book-nav";
      sub.setAttribute("aria-label",tr("ناوبری جلد اول","Book One navigation"));
      sub.innerHTML=routes.map(([url,label,active])=>'<button type="button" data-route="'+url+'"'+(active?' aria-current="page"':'')+'>'+label+'</button>').join("");
      view.before(sub);
    }
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
    const payload={app:"The Life Organization",exportedAt:new Date().toISOString(),formatVersion:2,notes:state.notes,startedModules:state.started,book1:window.LifeBook?(window.LifeBook.exportAll?window.LifeBook.exportAll():window.LifeBook.exportData()):null,fun:window.LifeFun?window.LifeFun.exportData():null};
    const url=URL.createObjectURL(new Blob([JSON.stringify(payload,null,2)],{type:"application/json;charset=utf-8"}));
    const a=document.createElement("a");a.href=url;a.download="life-organization-notes.json";
    document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);toast(t("exportDone"));
  }
  document.addEventListener("click",e=>{
    const routeBtn=e.target.closest("[data-route]");if(routeBtn){e.preventDefault();navigate(routeBtn.dataset.route);return}
    const act=e.target.closest("[data-action]");if(!act)return;
    switch(act.dataset.action){
      case "save-name":state.name=($("#name-input")?.value||"").trim().slice(0,80);persist();render();toast(t("nameSaved"));break;
      case "export":downloadNotes();break;
      case "reset":if(confirm(t("resetAsk"))){const lang=state.lang,theme=state.theme;state=blank();state.lang=lang;state.theme=theme;if(window.LifeBook)window.LifeBook.resetAll();if(window.LifeFun)window.LifeFun.reset();persist();render();toast(t("resetDone"))}break;
      case "install":if(installPrompt){installPrompt.prompt();installPrompt.userChoice.finally(()=>{installPrompt=null})}else $("#install-dialog").showModal();break;
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
  const splash=document.getElementById("brand-splash");
  if(splash){
    const reducedMotion=window.matchMedia&&window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.setTimeout(()=>{
      splash.classList.add("is-hidden");
      window.setTimeout(()=>splash.remove(),reducedMotion?0:500);
    },reducedMotion?30:950);
  }
})();