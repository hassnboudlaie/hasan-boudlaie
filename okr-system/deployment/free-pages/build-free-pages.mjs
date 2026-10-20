import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const here=path.dirname(fileURLToPath(import.meta.url));
const source=process.argv[2];
const output=process.argv[3]?path.resolve(process.argv[3]):here;
if(!source)throw new Error('Pass the canonical public/okr.html path.');
let html=fs.readFileSync(source,'utf8');
function replace(a,b){if(!html.includes(a))throw new Error('Source contract changed: '+a.slice(0,100));html=html.replace(a,b);}
function replaceEvery(a,b){if(!html.includes(a))throw new Error('Source contract changed: '+a.slice(0,100));html=html.split(a).join(b);}
replace("const AUTH='hb_okr_public_auth_v2';","const AUTH='hb_okr_public_auth_v2';\nconst PRACTICE_MODE=true;\nconst PRACTICE_KEY='kish_okr_free_practice_v1';\nlet practiceSnapshot=null;");
replace("async function api(action,method='GET',body){","async function api(action,method='GET',body){\n if(PRACTICE_MODE)return practiceApi(action,method,body);");
replace('function load(){return clone(emptyState);}','function load(){return PRACTICE_MODE?loadPractice():clone(emptyState);}');
replace("function save(silent,action='Workspace updated'){","function save(silent,action='Workspace updated'){\n if(PRACTICE_MODE){savePractice(silent,action);return;}");
replace("async function flushSave(action='Workspace updated'){","async function flushSave(action='Workspace updated'){\n if(PRACTICE_MODE)return !dirty||savePractice(true,action);");
replace(" if(location.hostname==='hassnboudlaie.github.io'){document.getElementById('entryExecBtn').onclick=()=>location.assign(CLOUD_ORIGIN+'/okr.html'+(location.hash||'#start'));return;}"," if(PRACTICE_MODE){await Promise.resolve();initializePractice();return;}");
replace("if(location.hostname==='hassnboudlaie.github.io')location.assign(CLOUD_ORIGIN+'/okr.html'+(location.hash||'#start'));else if(cloudReady)","if(cloudReady)");
replace("else if(location.hostname==='hassnboudlaie.github.io')location.assign(CLOUD_ORIGIN+'/okr.html'+hash);else showLogin(hash);","else if(PRACTICE_MODE)toast(txt('اپ در حال آماده‌شدن است.','The app is preparing.'));else showLogin(hash);");
replace('async function refreshFromCloud(){','async function refreshFromCloud(){\n if(PRACTICE_MODE)return;');
replace("if(typeof setInterval==='function')setInterval(refreshFromCloud,15000);","if(!PRACTICE_MODE&&typeof setInterval==='function')setInterval(refreshFromCloud,15000);");
replace(" const roleOptions=selected=>", " if(PRACTICE_MODE){renderPracticeAccess(box);return;}\n const roleOptions=selected=>");
replace("function showLogin(hash='#start'){","function showLogin(hash='#start'){\n if(PRACTICE_MODE){document.getElementById('loginPanel').classList.add('hidden');return;}");
replace(" const role=document.getElementById('userRoleDisplay');if(role)role.textContent=roleText(auth.accessRole||auth.role);", " const role=document.getElementById('userRoleDisplay');if(role)role.textContent=PRACTICE_MODE?txt('نسخه تمرینی','Practice edition'):roleText(auth.accessRole||auth.role);");
replace("'داده مرکزی با این فایل جایگزین شود؟','Replace the central workspace with this file?'","'تمرین همین مرورگر با این فایل جایگزین شود؟','Replace this browser’s practice with this file?'");
replace("if(!Array.isArray(data.companyOkrs)||!Array.isArray(data.teams)||!data.strategy)throw new Error('Invalid workspace file');","if(!validPracticeState(data))throw new Error('Invalid workspace file');");
replace("allObjectives().forEach(x=>{x.objective.status='draft';x.objective.parentId ||= '';});","allObjectives().forEach(x=>{if(!PRACTICE_MODE)x.objective.status='draft';x.objective.parentId ||= '';});");
replace("syncLabel('Cloud saved · v'+cloudRevision)","syncLabel(txt('ذخیره در همین مرورگر · نسخه ','Saved in this browser · v')+cloudRevision)");
replace("'ابتدا از ورودی خود خروجی بگیرید. نسخه مرکزی بارگذاری شود؟','Export your work first. Load the central version?'","'ابتدا از ورودی خود خروجی بگیرید. آخرین نسخه همین مرورگر بارگذاری شود؟','Export your work first. Load this browser’s latest saved version?'");
// One roster supplies every unit selector and all organization views.
replaceEvery('state.teams.map(t=>[t.id,t.name])','orgFieldOptions().map(o=>[o.value,o.label])');
replaceEvery('state.teams.map(t=>({value:t.id,label:t.name}))','orgFieldOptions()');
replaceEvery("esc(t.name||'Group')",'esc(unitName(t))');
replaceEvery("esc(t.name||'Unit')",'esc(unitName(t))');
replaceEvery('esc(t.name)','esc(unitName(t))');
replace("team:t.name||'Group'","team:unitName(t)");
replace("f.options.map(o=>'<option value=\"'+esc(o.value)+'\" '+(o.value===f.value?'selected':'')+'>'+esc(o.label)+'</option>').join('')",'orgOptionMarkup(f.options,f.value)');
replace("optionList([['all',txt('همه','All')],['company',txt('شرکت','Company')],...orgFieldOptions().map(o=>[o.value,o.label])],exploreFilters.team)","orgSelectOptions(exploreFilters.team,[{value:'all',label:txt('همه','All')},{value:'company',label:txt('شرکت','Company')}])");
replace("optionList([['all',txt('کل سازمان','Entire organization')],['company',txt('شرکت','Company')],...orgFieldOptions().map(o=>[o.value,o.label])],reportTeam)","orgSelectOptions(reportTeam,[{value:'all',label:txt('کل سازمان','Entire organization')},{value:'company',label:txt('شرکت','Company')}])");
replace("state.teams.map(t=>'<option value=\"'+esc(t.id)+'\" '+(selected===t.id?'selected':'')+'>'+esc(unitName(t))+'</option>').join('')",'orgSelectOptions(selected)');
replace("filters.team===teamId","orgDescendantIds(filters.team).has(teamId)");
replace("state.teams.find(t=>t.id===team)?.okrs||[]","state.teams.filter(t=>orgDescendantIds(team).has(t.id)).flatMap(t=>t.okrs||[])");
replace("state.teams.find(t=>t.id===team)?.kpis||[]","state.teams.filter(t=>orgDescendantIds(team).has(t.id)).flatMap(t=>t.kpis||[])");
replace("  box.className='unit-list';\n  box.innerHTML=state.teams.map((t,ti)=>{","  box.className='';box.innerHTML=orgUnitToolbar();renderOrgUnitRows();bindOrgUnitToolbar();\n}\nfunction renderOrgUnitRows(){\n  const box=document.getElementById('orgUnitRows');if(!box)return;const units=orgFilteredTeams();\n  document.getElementById('orgUnitCount').textContent=units.length+' / '+state.teams.length+' '+txt('واحد','units');\n  box.innerHTML=units.map(t=>{const ti=state.teams.indexOf(t);");
replace("return '<div class=\"team-box '+(open?'open':'')+'\">'","return '<div data-org-team=\"'+esc(t.id)+'\" class=\"team-box '+(open?'open':'')+'\">'");
replace("esc(t.unitType||'')+' · '+esc(t.parent||'—')","esc(t.orgLevel?txt(...ORG_LEVELS[t.orgLevel]):t.unitType||'')+' · '+esc(t.orgChartId?orgName(orgNode(t.orgParentId)):t.parent||'—')");
replace("data-f=\"name\" value=\"'+esc(unitName(t))+'\" placeholder=\"نام واحد\"","data-f=\"name\" '+(t.orgChartId?'readonly':'')+' value=\"'+esc(unitName(t))+'\" placeholder=\"نام واحد\"");
replace("data-del-team=\"'+ti+'\">×","data-del-team=\"'+ti+'\" '+(t.orgChartId?'disabled title=\"'+txt('واحد رسمی چارت؛ برای انتخاب پایلوت از بخش آماده‌سازی استفاده کنید.','Official chart unit; select pilot participation in Prepare.')+'\"':'')+'>×");
replace("data-f=\"unitType\" value=\"'+esc(t.unitType||'')+'\"","data-f=\"unitType\" '+(t.orgChartId?'readonly':'')+' value=\"'+esc(t.orgLevel?txt(...ORG_LEVELS[t.orgLevel]):t.unitType||'')+'\"");
replace("data-f=\"parent\" value=\"'+esc(t.parent||'')+'\"","data-f=\"parent\" list=\"orgUnitNames\" '+(t.orgChartId?'readonly':'')+' value=\"'+esc(t.orgChartId?orgName(orgNode(t.orgParentId)):t.parent||'')+'\"");
replace("data-f=\"interdependencies\" value=\"","data-f=\"interdependencies\" list=\"orgUnitNames\" value=\"");
replace("if(e.target.matches('[data-del-team]')){state.teams.splice", "if(e.target.matches('[data-del-team]')){if(state.teams[+e.target.dataset.delTeam]?.orgChartId){toast(txt('واحد رسمی چارت حذف نمی‌شود؛ مشارکت آن را در آماده‌سازی انتخاب کنید.','Official chart units are retained; choose participation in Prepare.'));return;}state.teams.splice");
replace("  if(e.target.dataset.team){state.teams[+e.target.dataset.team][e.target.dataset.f]=e.target.value;save(true)}","  if(e.target.dataset.team){const t=state.teams[+e.target.dataset.team];if(t.orgChartId&&['name','unitType','parent'].includes(e.target.dataset.f))return;t[e.target.dataset.f]=e.target.value;save(true)}");
const demoTeams=html.match(/^ s\.teams=\[\{id:'demo-operations'.*$/m)?.[0];if(!demoTeams)throw new Error('Missing demo teams source contract');replace(demoTeams,' s.teams=makeOrganizationDemoTeams(objective);');
replace('state=mergeDefaults(clone(emptyState),data);','state=ensureOrganizationUnits(mergeDefaults(clone(emptyState),data));');
replace('const emptyState={',fs.readFileSync(path.join(here,'organization-chart.js'),'utf8')+'\nconst emptyState={');
replace('\ninitializeCloud();', '\n'+fs.readFileSync(path.join(here,'practice-adapter.js'),'utf8')+'\ninitializeCloud();');
replace('<div class="launch-actions">','<p class="note" id="practiceNotice" data-fa="نسخه رایگان نمایش و تمرین · تمرین‌ها در همین مرورگر ذخیره می‌شوند؛ همگام‌سازی خودکار بین دستگاه‌ها فعال نیست." data-en="Free demonstration & practice · Work is saved in this browser; automatic cross-device synchronization is not enabled.">نسخه رایگان نمایش و تمرین · تمرین‌ها در همین مرورگر ذخیره می‌شوند؛ همگام‌سازی خودکار بین دستگاه‌ها فعال نیست.</p><div class="launch-actions">');
replace('<div class="entry-foot"><span','<div class="entry-foot"><a href="offline.html" download="Kish-OKR-Offline.html" data-fa="دانلود همین اپ برای استفاده آفلاین" data-en="Download this app for offline use">دانلود همین اپ برای استفاده آفلاین</a> · <span');
replace(`<div class="unit-body"><div class="team-title">`, `<div class="unit-body"><button class="btn" data-source-unit="'+esc(t.id)+'">'+txt('ابتکارهای سند برای این واحد','Source actions for this department')+'</button><div class="team-title">`);
// The company source is embedded so the public and offline editions need no API.
replace('const emptyState=',fs.readFileSync(path.join(here,'strategy-records.js'),'utf8')+'\nconst emptyState=');
replace('\ninitializeCloud();','\n'+fs.readFileSync(path.join(here,'strategy-integration.js'),'utf8')+'\ninitializeCloud();');
replace('</style>',fs.readFileSync(path.join(here,'strategy.css'),'utf8')+'\n</style>');
replace('<section class="view" id="view-strategy">','<section class="view" id="view-document"><div class="page-head"><div><div class="eyebrow">COMPANY STRATEGY · 1404</div><h1 data-fa="سند راهبردی شرکت" data-en="Company strategy document">سند راهبردی شرکت</h1><p data-fa="سند راهبردی تحول و پیشرفت · چاپ اول ۱۴۰۴ · مرجع اهداف و برنامه‌های اجرایی" data-en="Strategic Transformation & Progress · First edition 1404 · Objectives and execution reference">سند راهبردی تحول و پیشرفت · چاپ اول ۱۴۰۴ · مرجع اهداف و برنامه‌های اجرایی</p></div></div><div id="companyDocumentBody"></div></section><section class="view" id="view-strategy">');
replace('<a href="#strategy" data-go="strategy">','<a href="#document" data-go="document"><span class="ico">▤</span><span data-fa="سند راهبردی شرکت" data-en="Company strategy">سند راهبردی شرکت</span></a><a href="#strategy" data-go="strategy">');
replace('<select class="mobile-stage" id="mobileStage">','<select class="mobile-stage" id="mobileStage"><option value="document" data-fa="سند راهبردی شرکت" data-en="Company strategy">سند راهبردی شرکت</option>');
replace('<div class="launch-actions">','<div class="document-entry"><div><h2 data-fa="سند راهبردی شرکت" data-en="Company strategy document">سند راهبردی شرکت</h2><p data-fa="مأموریت، چشم‌انداز، ارزش‌ها، ۱۳ هدف و برنامه‌های اجرایی شرکت" data-en="Mission, vision, values, 13 objectives and execution plans">مأموریت، چشم‌انداز، ارزش‌ها، ۱۳ هدف و برنامه‌های اجرایی شرکت</p></div><button class="btn primary" id="documentEntryBtn" data-fa="مشاهده سند و اهداف ←" data-en="Open document & objectives →">مشاهده سند و اهداف ←</button></div><div class="launch-actions">');
replaceEvery("start:renderStart,roadmap:","document:renderCompanyDocument,start:renderStart,roadmap:");
replace("state=ensureOrganizationUnits(mergeDefaults(clone(emptyState),data));","state=ensureCompanyDocument(ensureOrganizationUnits(mergeDefaults(clone(emptyState),data)));");
replace('STRATEGY TEMPLATE · قابل بازبینی','DOCUMENT SOURCE · قابل بازبینی');
replace('شش ارزش بنیادین مصوب در سند','شش ارزش بنیادین مندرج در سند');
replace('هنوز Strategic Pillar ثبت نشده است.','هنوز Strategic Pillar ثبت نشده است.');
replace('معماری واقعی سطح شرکت از سند راهبردی تحول و پیشرفت بارگذاری شده است؛ همه فیلدها برای refinement قابل ویرایش‌اند.','مبانی و ارکان سند شرکت بارگذاری شده‌اند؛ ویرایش‌ها در تمرین این مرورگر ذخیره می‌شوند. مرجع کامل در «سند راهبردی شرکت» در دسترس است.');
replace('<div id="pillars"></div>','<p class="note"><a href="#document/pillars" data-fa="مرجع ارکان و KPIهای پیشنهادی سند" data-en="Source pillars & proposed health KPIs">مرجع ارکان و KPIهای پیشنهادی سند</a></p><div id="pillars"></div>');
replace('<div id="companyOkrs"','<p class="note"><a href="#document/objectives" data-fa="مشاهده تعریف، فرمول، بنچمارک و صفحه منبع هر KR" data-en="View definitions, formulas, benchmarks and KR sources">مشاهده تعریف، فرمول، بنچمارک و صفحه منبع هر KR</a></p><div id="companyOkrs"');
replace("box.innerHTML=(state.initiatives||[]).map", "box.innerHTML='<article class=\"card\"><h2>'+txt('بانک ابتکارهای سند','Source initiative bank')+'</h2><p>'+txt('ابتکارهای سند بر اساس هدف و واحد سازمانی قابل جست‌وجو و انتخاب‌اند. پس از افزودن، مسئول، موعد و وضعیت آن‌ها را در برنامه خود کامل کنید.','Search source actions by objective and department, then add them to your plan and assign owners, deadlines and status.')+'</p><a class=\"btn\" href=\"#document/initiatives\">'+txt('باز کردن بانک ابتکارها','Open initiative bank')+'</a></article>'+(state.initiatives||[]).map");
// A compact landing page and shared, explicit navigation for every app section.
const loginMarkup=html.match(/<div class="login-panel hidden" id="loginPanel">[\s\S]*?(?=<section class="landing-map">)/)?.[0];
const roadmapMarkup=html.match(/<section class="landing-map">[\s\S]*?<\/section>/)?.[0];
if(!loginMarkup||!roadmapMarkup)throw new Error('Missing landing page contracts.');
const homeCard=(className,icon,titleFa,titleEn,copyFa,copyEn,id,actionFa,actionEn)=>`<article class="home-card ${className}"><span class="home-icon" aria-hidden="true">${icon}</span><h2 data-fa="${titleFa}" data-en="${titleEn}">${titleFa}</h2><p data-fa="${copyFa}" data-en="${copyEn}">${copyFa}</p><button type="button" class="btn ${id==='entryExecBtn'?'primary':''}" id="${id}" data-fa="${actionFa}" data-en="${actionEn}">${actionFa}</button></article>`;
const home=`<div class="launchpad home-launchpad"><div class="home-intro"><small>KISH PORTS &amp; AIRPORTS</small><h1 data-fa="سامانه راهبرد و OKR" data-en="Strategy & OKR workspace">سامانه راهبرد و OKR</h1><p data-fa="راهبرد شرکت را ببینید، برنامه اجرایی را پیش ببرید یا روش OKR را یاد بگیرید." data-en="Explore the company strategy, work on your execution plan or learn the OKR method.">راهبرد شرکت را ببینید، برنامه اجرایی را پیش ببرید یا روش OKR را یاد بگیرید.</p></div><div class="launch-actions">`+
homeCard('document-entry','▤','سند راهبردی شرکت','Company strategy','مبانی، اهداف و ابتکارهای شرکت.','Foundations, objectives and company initiatives.','documentEntryBtn','مشاهده سند','Explore strategy')+
homeCard('execution-choice','◎','میز کار OKR','OKR workspace','هدف‌ها، واحدها و پیگیری پیشرفت.','Goals, departments and progress tracking.','entryExecBtn','ورود به میز کار','Open workspace')+
homeCard('learning-choice','◇','آموزش و تمرین','Learning & practice','هندبوک، مثال‌ها و تمرین‌های استقرار.','Handbook, examples and implementation exercises.','entryTrainBtn','شروع یادگیری','Start learning')+
`</div><button id="startExecution" type="button" class="hidden">Open workspace</button><p class="note" id="practiceNotice" data-fa="نسخه رایگان · اطلاعات شما در همین مرورگر ذخیره می‌شوند." data-en="Free edition · Your work is saved in this browser.">نسخه رایگان · اطلاعات شما در همین مرورگر ذخیره می‌شوند.</p>${loginMarkup}<details class="home-guide"><summary data-fa="مسیر استقرار و راهنمای شروع" data-en="Implementation path & getting started">مسیر استقرار و راهنمای شروع</summary><button class="btn" id="quickStartGuide" data-fa="راهنمای شروع" data-en="Getting-started guide">راهنمای شروع</button>${roadmapMarkup}</details></div>`;
const landing=html.match(/<div class="launchpad">[\s\S]*?(?=\s*<div class="entry-foot">)/)?.[0];
if(!landing)throw new Error('Missing launchpad.');replace(landing,home);
replace('<body>','<body><nav class="section-navigation no-print" aria-label="Section navigation"><button type="button" class="btn" id="sectionBackBtn"><span class="nav-arrow" aria-hidden="true">←</span><span data-fa="برگشت" data-en="Back">برگشت</span></button><a class="btn" id="sectionHomeLink" href="#home"><span aria-hidden="true">⌂</span><span data-fa="خانه" data-en="Home">خانه</span></a><span class="navigation-location" id="navigationLocation" aria-live="polite"></span></nav>');
replace('</style>',fs.readFileSync(path.join(here,'navigation.css'),'utf8')+'\n</style>');
replace('<select class="mobile-stage" id="mobileStage">','<select class="mobile-stage" id="mobileStage"><option value="home" data-fa="خانه" data-en="Home">خانه</option>');
replace("addEventListener('click',openTraining)","addEventListener('click',()=>openTraining())");
replace("addEventListener('click',closeTraining)","addEventListener('click',()=>closeTraining())");
replace("closeTraining();goWorkspace('#'+map[b.dataset.trainingWorkspace]);","goWorkspace('#'+map[b.dataset.trainingWorkspace]);");
replace('<button class="btn primary" id="trainingCloseBtn" data-fa="بستن" data-en="Close">بستن</button>','<button class="btn primary" id="trainingCloseBtn" data-fa="خانه" data-en="Home">خانه</button>');
replace('bindStatic();renderAll();applyLanguage();\n})();','bindStatic();renderAll();applyLanguage();\n'+fs.readFileSync(path.join(here,'navigation.js'),'utf8')+'\n})();');
// Add the hierarchy and execution modules without replacing source content or stored records.
replace('</style>',fs.readFileSync(path.join(here,'platform.css'),'utf8')+'\n</style>');
replace('<nav class="nav">','<nav class="p-sidebar-nav" id="platformNav" aria-label="Strategy execution modules"></nav><details class="p-sidebar-legacy"><summary data-fa="استقرار، آموزش و ابزارهای تکمیلی" data-en="Implementation, learning & more tools">استقرار، آموزش و ابزارهای تکمیلی</summary><nav class="nav">');
replace('</nav>\n    <div class="side-foot">','</nav></details>\n    <div class="side-foot">');
replace('<section class="view" id="view-start">','<section class="view" id="view-platform"><div id="platformBody"></div></section><section class="view" id="view-start">');
replace('<div class="launch-actions">','<div id="platformHomeQuick" class="p-home-top"></div><div class="launch-actions">');
replace('<div class="top-actions">','<form class="p-top-search" data-p-global-search><input name="query" type="search" aria-label="Search workspace" placeholder="Search / جست‌وجو"><button type="submit" aria-label="Search">⌕</button></form><div class="top-actions">');
replace('<select class="mobile-stage" id="mobileStage">','<select class="p-mobile" id="platformMobile" aria-label="Strategy execution module"></select><select class="mobile-stage" id="mobileStage">');
replace('<body>','<body><dialog class="p-dialog" id="platformDialog" aria-label="Edit workspace record"></dialog>');
replace('initializeNavigation();','initializeNavigation();\n'+fs.readFileSync(path.join(here,'logistics-sources.js'),'utf8')+'\n'+fs.readFileSync(path.join(here,'platform.js'),'utf8'));
fs.mkdirSync(output,{recursive:true});
fs.writeFileSync(path.join(output,'index.html'),html);
let offline=html;
const assetDir=process.argv[4]?path.resolve(process.argv[4]):path.dirname(source);
for(const asset of ['assets/kishports_main.svg','assets/airport_opration.svg','favicon.svg']){
 const uri='data:image/svg+xml;base64,'+fs.readFileSync(path.join(assetDir,asset)).toString('base64');
 offline=offline.replaceAll(asset,uri);
}
fs.writeFileSync(path.join(output,'offline.html'),offline);
console.log('Built the complete Pages practice edition and self-contained offline HTML; canonical Cloud source untouched.');
