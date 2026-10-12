// Shared navigation for the free public and offline editions. No workspace data is changed.
const NAV_SESSION_KEY='kish_okr_navigation_v1';
const navigationBase={route,showView,renderTraining,applyLanguage};
let navigationTrail={entries:[],index:-1},navigationRendering=false;
const navigationPages={home:['خانه','Home'],start:['میز کار','Workspace'],document:['سند راهبردی شرکت','Company strategy'],roadmap:['مسیر استقرار','Implementation'],dashboard:['نمای مدیریتی','Overview'],alignment:['نقشه راهبرد','Strategy roadmap'],strategy:['راهبرد و KPI','Strategy & KPIs'],company:['OKRهای شرکت','Company OKRs'],teams:['واحدها و OKRها','Departments & OKRs'],setup:['آماده‌سازی','Prepare'],introduce:['معرفی','Introduce'],announce:['اعلام','Announce'],educate:['آموزش سازمان','Educate'],checkins:['ثبت پیشرفت','Check-ins'],initiatives:['ابتکارهای اجرایی','Execution initiatives'],explore:['کاوش هدف‌ها','Explore goals'],engagement:['سلامت پیگیری','Engagement'],reports:['گزارش هفتگی','Weekly report'],meetings:['گفت‌وگوی ۱:۱','1:1 conversations'],review:['مرور و یادگیری','Review & learning'],cycles:['چرخه‌ها','Cycles'],history:['تاریخچه تغییرات','Audit trail'],admin:['تنظیمات تمرین','Practice settings']};
function navigationHash(hash){
 let parts;try{parts=decodeURIComponent(String(hash||'#home').replace(/^#/,'' )).split('/');}catch{return '#home';}
 const key=parts[0];
 if(key==='learn')return '#learn/'+(TRAINING_MODULES.some(m=>m.id===parts[1])?parts[1]:'prepare');
 if(['objective','team','guide'].includes(key)||navigationPages[key])return '#'+parts.join('/');
 return '#home';
}
function navigationLabel(hash){
 const [key,sub]=navigationHash(hash).slice(1).split('/');
 if(key==='learn'){const m=TRAINING_MODULES.find(m=>m.id===sub);return txt('آموزش · ','Learning · ')+(m?txt(m.faTitle,m.enTitle):'');}
 if(key==='document'&&documentTabs[sub])return txt(...navigationPages.document)+' / '+txt(...documentTabs[sub]);
 if(key==='roadmap'&&sub){const s=ROLLOUT_STAGES.find(s=>s.id===sub);return txt(...navigationPages.roadmap)+(s?' / '+stageText(s):'');}
 if(key==='objective')return txt('جزئیات هدف','Objective details');
 if(key==='team')return txt('جزئیات واحد','Department details');
 if(key==='guide')return txt('راهنمای گام','Step guide');
 return txt(...(navigationPages[key]||navigationPages.home));
}
function navigationSaveTrail(){try{sessionStorage.setItem(NAV_SESSION_KEY,JSON.stringify(navigationTrail));}catch{}}
function navigationRecord(hash){
 const entries=navigationTrail.entries,token=history.state?.okrNavigationId;
 const known=token?entries.findIndex(e=>e.id===token&&e.hash===hash):-1;
 if(known>=0)navigationTrail.index=known;
 else if(entries[navigationTrail.index]?.hash!==hash){
  navigationTrail.entries=entries.slice(0,navigationTrail.index+1);
  navigationTrail.entries.push({id:id(),hash});
  if(navigationTrail.entries.length>80)navigationTrail.entries.shift();
  navigationTrail.index=navigationTrail.entries.length-1;
 }
 const current=navigationTrail.entries[navigationTrail.index];
 if(current)history.replaceState({...history.state,okrNavigationId:current.id},'',hash);
 navigationSaveTrail();navigationChrome();
}
function navigationParent(hash){
 const [key,sub,detail]=navigationHash(hash).slice(1).split('/');
 if(key==='document')return detail?'#document/'+sub:sub&&sub!=='foundation'?'#document/foundation':'#home';
 if(key==='roadmap'&&sub)return '#roadmap';
 if(key==='objective'){const x=objectiveById(sub);return x&&state.companyOkrs.includes(x.objective)?'#company':'#teams';}
 if(key==='team')return '#teams';
 if(key==='checkins'&&sub)return '#checkins';
 if(key==='guide')return '#roadmap';
 return '#home';
}
function navigationChrome(){
 const current=navigationHash(location.hash),home=current==='#home',back=document.getElementById('sectionBackBtn');
 if(back){back.disabled=home&&navigationTrail.index<=0;back.setAttribute('aria-label',txt('برگشت به بخش قبلی','Back to the previous section'));}
 const label=document.getElementById('navigationLocation');if(label)label.textContent=navigationLabel(current);
 const homeLink=document.getElementById('sectionHomeLink');if(homeLink)homeLink.setAttribute('aria-current',home?'page':'false');
 const mobile=document.getElementById('mobileStage');
 if(mobile)[...mobile.options].forEach(o=>{if(navigationPages[o.value])o.textContent=txt(...navigationPages[o.value]);});
}
function navigateSection(hash,replace=false){
 const next=navigationHash(hash);
 if(next!==location.hash){const method=replace?'replaceState':'pushState';history[method](null,'',next);}
 route();
}
function navigateBack(){
 if(navigationTrail.index>0){
  const previous=navigationTrail.entries[--navigationTrail.index];
  history.replaceState({okrNavigationId:previous.id},'',previous.hash);route();
 }else{navigationTrail={entries:[],index:-1};navigateSection(navigationParent(location.hash),true);}
}
route=function(){
 if(!cloudReady)return;
 const hash=navigationHash(location.hash),[key,sub]=hash.slice(1).split('/');
 if(hash!==location.hash)history.replaceState(null,'',hash);
 const home=document.getElementById('authScreen'),work=document.getElementById('executionApp'),learn=document.getElementById('trainingScreen');
 document.getElementById('sidebar').classList.remove('open');document.getElementById('actionMenu').classList.remove('open');
 learn.classList.remove('show');home.inert=false;
 if(key==='home'){
  home.classList.remove('hidden');work.inert=true;document.body.style.overflow='hidden';document.getElementById('loginPanel').classList.add('hidden');
  applyLanguage();home.scrollTop=0;
 }else if(key==='learn'){
  home.classList.add('hidden');home.inert=true;work.inert=true;learn.classList.add('show');document.body.style.overflow='hidden';window.__trainingModule=sub;
  navigationRendering=true;try{navigationBase.renderTraining(sub);applyLanguage();}finally{navigationRendering=false;}
  learn.scrollTop=0;
 }else{
  home.classList.add('hidden');work.inert=false;document.body.style.overflow='';
  if(key==='guide'){navigationBase.showView('roadmap',false);stageHelp(sub);}else navigationBase.route();
 }
 navigationRecord(hash);
 const root=key==='home'?home:key==='learn'?learn:document.querySelector('.view.active');
 const heading=root?.querySelector('h1,h2');if(heading){heading.setAttribute('tabindex','-1');heading.focus?.({preventScroll:true});}
};
showView=function(name,push=true){if(push)return navigateSection('#'+name);navigationBase.showView(name,false);navigationChrome();};
goWorkspace=function(hash){if(cloudReady)navigateSection(hash);};
openTraining=function(){navigateSection('#learn/'+(window.__trainingModule||'prepare'));};
closeTraining=function(){if(document.getElementById('trainingScreen').classList.contains('show'))navigateBack();};
renderTraining=function(module){
 const target='#learn/'+(module||window.__trainingModule||'prepare');
 if(!navigationRendering&&document.getElementById('trainingScreen').classList.contains('show')&&location.hash!==target)return navigateSection(target);
 navigationBase.renderTraining(module);
};
applyLanguage=function(){navigationBase.applyLanguage();navigationChrome();};
function initializeNavigation(){
 try{const saved=JSON.parse(sessionStorage.getItem(NAV_SESSION_KEY)||'null');if(saved&&Array.isArray(saved.entries)&&Number.isInteger(saved.index)&&saved.index>=0&&saved.index<saved.entries.length&&saved.entries.every(e=>typeof e.id==='string'&&typeof e.hash==='string'&&navigationHash(e.hash)===e.hash))navigationTrail={entries:saved.entries.slice(-80),index:Math.min(saved.index,79)};}catch{}
 document.getElementById('sectionBackBtn').onclick=navigateBack;
 document.getElementById('sectionHomeLink').onclick=e=>{e.preventDefault();navigateSection('#home');};
 document.getElementById('homePortalBtn').onclick=()=>navigateSection('#home');
 document.getElementById('demoBtn').onclick=()=>openTraining();
 document.getElementById('entryTrainBtn').onclick=()=>openTraining();
 document.getElementById('trainingExecBtn').onclick=()=>goWorkspace('#start');
 document.getElementById('trainingCloseBtn').onclick=()=>navigateSection('#home');
}
initializeNavigation();
