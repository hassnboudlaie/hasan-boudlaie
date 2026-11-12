(function(){
"use strict";
var D=window.SABA_REFLECTIVE,parts=D&&D.sessions,base=new URL("../",location.href);
var E=function(id){return document.getElementById(id)},courseFrame=E("courseFrame"),studioFrame=E("studioFrame"),contextFrame=E("contextFrame");
if(!parts||parts.length!==9){document.querySelector("main").textContent="محتوای اصلی دوره بارگذاری نشد. اتصال اینترنت را بررسی و صفحه را به‌روزرسانی کنید.";return}
var pics=["sabanaft-niayesh.webp","sabanaft-meeting.jpg","sabanaft-site.webp","sabanaft-farmanieh.webp"];
var storeKey="sabanaft_reflective_app_shell_v1",progressKey="sabanaft_reflective_v2",memory={last:{s:1,p:parts[0].sections[0].id},bookmarks:[]};
try{var old=JSON.parse(localStorage.getItem(storeKey)||"null");if(old&&typeof old==="object"){if(old.last&&Number.isInteger(old.last.s)&&old.last.s>=1&&old.last.s<=9&&typeof old.last.p==="string")memory.last=old.last;if(Array.isArray(old.bookmarks))memory.bookmarks=old.bookmarks.filter(function(x){return typeof x==="string"}).slice(0,100)}}catch(e){}
function save(){try{localStorage.setItem(storeKey,JSON.stringify(memory))}catch(e){notice("ذخیره مرورگر در دسترس نیست.")}}
function fa(s){return String(s).replace(/[0-9]/g,function(n){return "۰۱۲۳۴۵۶۷۸۹"[Number(n)]})}
function escapeText(v){return String(v==null?"":v).replace(/[&<>"']/g,function(x){return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[x]})}
function notice(s){var e=E("toast");e.textContent=s;e.classList.add("visible");clearTimeout(notice.t);notice.t=setTimeout(function(){e.classList.remove("visible")},2400)}
function session(n){return parts.find(function(s){return s.id===Number(n)})}
function section(n,p){var s=session(n);return s&&s.sections.find(function(x){return x.id===p})}
function route(){var a=decodeURIComponent(location.hash.replace(/^#\/?/,"")).split("/"),s=Number(a[1]);if(a[0]==="session"&&session(s))return{page:"session",s:s};if(a[0]==="lesson"&&section(s,a[2]))return{page:"reader",s:s,p:a[2]};if(a[0]==="stage"&&["idea","relationship","tools","reflection"].includes(a[1]))return{page:"stage",stage:a[1]};if(a[0]==="studio")return{page:"studio",tab:/^(home|cases|daily|roleplay|coach|insights|profile|context|roles|action|development|mix|insights|review|portfolio)$/.test(a[1]||"")?a[1]:"daily"};return{page:["home","course","passport","coach","context"].includes(a[0])?a[0]:"home"}}
var lastStage=null;
function go(x){if(location.hash==="#/"+x){render();return}location.hash="/"+x}
function openLesson(n,p){go("lesson/"+n+"/"+p)}
function latest(){var r=memory.last;return section(r.s,r.p)?r:{s:1,p:parts[0].sections[0].id}}
function courseState(){try{var o=JSON.parse(localStorage.getItem(progressKey)||"null");if(o&&o.schema===2&&Array.isArray(o.contexts)){var context=o.contexts.find(function(x){return x.id===o.activeContext})||o.contexts[0];if(context)return {name:String(context.name||"حوزه کاری"),done:new Set(Array.isArray(context.completed)?context.completed:[])}}}catch(e){}return {name:"هنوز حوزه‌ای انتخاب نشده",done:new Set()}}
function doneKey(s,p){return "s"+s+"-"+p}
function count(s,state){return s.sections.filter(function(x){return state.done.has(doneKey(s.id,x.id))}).length}
function renderHome(){var el=E("homeScoreMini"),d=globalThis.SabaGamification?.collect();if(el&&d)el.textContent="⭐ "+fa(d.annualScore)+" امتیاز · سطح "+d.level;}
const stageInfo={
 idea:{number:'۲',title:'ایده رهبری من',intro:'نقش‌های خود را متناسب با شرایط تیم تعریف کنید.',actions:[
 ['lesson/5/context-situation','بافت و موقعیت من','تفاوت شرایط معمول تیم و وضعیت خاص را روشن کنید.','۱'],
 ['lesson/5/mix','ترکیب نقش‌های من','برای چهار نقش رهبری، ترکیبی آگاهانه بسازید.','۲'],
 ['lesson/5/output','بیانیه رهبری من','ایده رهبری خود را به زبان ساده بنویسید.','۳']]},
 relationship:{number:'۳',title:'رابطه با کارکنان',intro:'برداشت شما از رابطه و تجربه واقعی کارکنان را کنار هم بگذارید.',actions:[
 ['lesson/7/perspectives','دیدگاه‌های متفاوت','برداشت مدیر و کارکنان را مقایسه کنید.','۱'],
 ['lesson/7/upward','رابطه با مدیر بالادست','انتظارات و حد اختیار را روشن کنید.','۲'],
 ['lesson/7/peer','گفت‌وگو و بازخورد','با یک همکار، برداشت‌های خود را بررسی کنید.','۳']]},
 tools:{number:'۴',title:'ابزارهای رهبری',intro:'برای شرایط واقعی تیم، روش و ابزار مناسب انتخاب کنید.',actions:[
 ['lesson/8/benefit','ابتدا مسئله و فایده','روشن کنید ابزار برای حل چه مسئله‌ای است.','۱'],
 ['lesson/8/design','طراحی ابزار خودم','یک روش ساده و قابل‌اجرا طراحی کنید.','۲'],
 ['lesson/8/output','آزمایش و یادگیری','ابزار را اجرا کنید و نتیجه را مرور کنید.','۳']]},
 reflection:{number:'↻',title:'بازاندیشی مستمر',intro:'از تجربه واقعی یاد بگیرید و رفتار بعدی را بهتر کنید.',actions:[
 ['studio/daily','بازاندیشی روزانه','یک اتفاق، رفتار خود و آموخته‌تان را ثبت کنید.','۱'],
 ['studio/cases','مرور کیس‌های من','تصمیم‌های قبلی و نتیجه آن‌ها را بررسی کنید.','۲'],
 ['lesson/7/peer','بازاندیشی با همکار','از دیدگاه یک همکار برای اصلاح برداشت خود استفاده کنید.','۳']]}
};
function renderStage(key){
 var d=stageInfo[key];if(!d)return;
 E("stageKicker").textContent="مسیر رهبری";
 E("stageSymbol").textContent=d.number;
 E("stageTitle").textContent=d.title;
 E("stageLead").textContent=d.intro;
 var gam=globalThis.SabaGamification?.collect(),point=gam?.steps?.find(x=>x.id===key);
 E("stageProgress").textContent=point?fa(point.points)+" امتیاز از فعالیت‌های این بخش ثبت کرده‌اید.":"با ثبت فعالیت‌ها و پیگیری نتیجه، امتیاز و نشان بگیرید.";
 E("stageActionList").innerHTML=d.actions.map(function(a){return '<button type="button" class="stage-action" data-go-stage="'+escapeText(a[0])+'"><span class="stage-action-num">'+escapeText(a[3])+'</span><span class="stage-action-copy"><strong>'+escapeText(a[1])+'</strong><small>'+escapeText(a[2])+'</small></span><span class="stage-action-arrow" aria-hidden="true">←</span></button>'}).join("");
}
function renderCourse(){var state=courseState(),out=parts.map(function(s){var c=count(s,state),pic=pics[(s.id-1)%pics.length];return '<button class="course-card" type="button" data-session="'+s.id+'"><img src="../assets/'+pic+'" alt="" loading="lazy"><span class="course-card-body"><span class="eyebrow">جلسه '+fa(s.id)+'</span><strong>جلسه '+fa(s.id)+' · '+escapeText(s.title)+'</strong><p>'+escapeText(s.subtitle)+'</p><span class="course-card-bottom"><span>'+fa(s.sections.length)+' بخش</span><span>'+fa(c)+' مرورشده</span></span><span class="track"><span style="width:'+(100*c/s.sections.length)+'%"></span></span></span></button>'}).join("");E("courseGrid").innerHTML=out}
function renderSession(n){var s=session(n),state=courseState();E("sessionKicker").textContent="جلسه "+fa(n)+" · "+fa(s.sections.length)+" بخش";E("sessionTitle").textContent="جلسه "+fa(n)+" · "+s.title;E("sessionSubtitle").textContent=s.subtitle;E("sessionOutput").textContent=s.output;E("lessonList").innerHTML=s.sections.map(function(x,i){var d=state.done.has(doneKey(n,x.id));return '<button type="button" class="lesson-card" data-lesson="'+escapeText(x.id)+'"><span class="lesson-number">'+fa(i+1)+'</span><span class="lesson-text"><strong>'+escapeText(x.title)+'</strong><small>'+(d?'✓ مرورشده':'ورود به درس و تمرین')+'</small></span><span class="lesson-arrow" aria-hidden="true">←</span></button>'}).join("")}
function contentUrl(s,p){var u=new URL("index.html",base);u.hash="s/"+s+"/"+p;return u}
function studioUrl(tab){var u=new URL("leadership-studio.html",base);u.hash=tab;return u}

/* Keep a single page scroll, never a small scrolling document nested inside another. */
function sizeEmbedded(frame,kind){
 var doc;try{doc=frame.contentDocument;if(!doc||!doc.body)return}catch(e){return}
 var style=doc.getElementById("saba-embed-premium");
 if(!style){style=doc.createElement("style");style.id="saba-embed-premium";
 style.textContent='html,body{min-height:0!important;height:auto!important;overflow:visible!important;scroll-behavior:auto!important}body{font-size:18px!important;line-height:1.75!important;color:#19364f!important;background:linear-gradient(130deg,#dceaf0,#e8f2ee)!important}.app,.layout,#main,.main,.pane{min-height:0!important;height:auto!important;max-width:none!important}h1{font-size:clamp(27px,5vw,35px)!important;line-height:1.5!important}h2{font-size:clamp(22px,4vw,27px)!important;line-height:1.55!important}h3{font-size:20px!important}p,.dimension>p,.lesson-block p,.role-card p{font-size:17px!important;line-height:1.9!important}label,summary{font-size:17px!important;font-weight:700!important}input,textarea,select,button,.btn{font-size:17px!important;min-height:48px!important;border-radius:13px!important}small,.muted,.method-note,.field-hint{font-size:15px!important;line-height:1.75!important}.dimension,.card,.practice-tool,.lesson-block,.note-panel{border-radius:16px!important;border-color:#bcd3df!important;background:linear-gradient(118deg,#dcecf0,#ecf5f2)!important}.studio-workbar{position:relative!important;top:auto!important}.site-header,.site-footer,.sidebar,.mobile-menu,.scrim,.skip-link{display:none!important}@media(max-width:700px){#main,.main,.pane{padding:12px 12px 38px!important}h1{font-size:28px!important}.context-group{margin:0!important}.point-inputs{gap:12px!important}input,textarea,select{font-size:17px!important}}';
 doc.head.appendChild(style)}
 if(kind==="studio"){doc.body.classList.add("saba-embedded-studio");if(!doc.getElementById("saba-embed-studio-style")){var st=doc.createElement("style");st.id="saba-embed-studio-style";st.textContent='body.saba-embedded-studio .top{display:none!important}body.saba-embedded-studio .main{padding-top:8px!important}body.saba-embedded-studio .studio-workbar{display:none!important}';doc.head.appendChild(st)}}
 var update=function(){try{var h=Math.ceil(doc.body.scrollHeight||0)+28;if(h>200&&h<28000)frame.style.height=Math.max(460,h)+"px"}catch(e){}};
 update();
 if(frame.__sabaObserver)try{frame.__sabaObserver.disconnect()}catch(e){}
 if(window.ResizeObserver){frame.__sabaObserver=new ResizeObserver(update);frame.__sabaObserver.observe(doc.body)}
 doc.addEventListener("input",update);
 doc.addEventListener("click",function(){window.requestAnimationFrame(update)});
 window.requestAnimationFrame(update);
}
var contextLast="";
function setContext(){var u=new URL("index.html",base);u.hash="context";if(contextLast!==u.href){contextLast=u.href;E("contextLoader").hidden=false;contextFrame.src=u.href}}
contextFrame.addEventListener("load",function(){
 E("contextLoader").hidden=true;
 sizeEmbedded(contextFrame,"context");
 try{var doc=contextFrame.contentDocument;if(!doc)return;
 var style=doc.getElementById("saba-context-embedded");if(!style){style=doc.createElement("style");style.id="saba-context-embedded";
 style.textContent='html,body{background:linear-gradient(120deg,#dfeef2,#e8f2ed)!important}body{font-size:18px!important;line-height:1.75!important}.site-header,.site-footer,.sidebar,.mobile-menu,.scrim,.skip-link{display:none!important}.layout,.layout.with-sidebar{display:block!important;grid-template-columns:minmax(0,1fr)!important;width:100%!important;max-width:none!important}#main{width:100%!important;max-width:none!important;margin:0!important;padding:12px 16px 40px!important;min-width:0!important}.page-header h1{font-size:27px!important}.practice-tool{padding:16px!important}@media(max-width:650px){#main{padding:8px!important}.practice-tool{padding:12px!important}}';
 doc.head.appendChild(style)}
 }catch(e){}
});
var courseLast="",studioLast="",courseReady=false,studioReady=false;
function injectCourseStyles(){
 try{
 var w=courseFrame.contentWindow,doc=courseFrame.contentDocument;if(!doc)return;
 var style=doc.getElementById("saba-app-integration");if(!style){style=doc.createElement("style");style.id="saba-app-integration";
 style.textContent='html,body{background:linear-gradient(130deg,#dcebf1,#e8f2ed)!important;scroll-padding-top:12px!important}body{font-size:18px!important;line-height:1.75!important}.site-header,.site-footer,.sidebar,.mobile-menu,.scrim,.skip-link{display:none!important}.layout,.layout.with-sidebar{display:block!important;grid-template-columns:minmax(0,1fr)!important;width:100%!important;max-width:none!important}#main{width:100%!important;max-width:none!important;margin:0!important;padding:10px 14px 35px!important;min-width:0!important}.page-header{padding:18px 20px!important;margin:0 0 12px!important;background:linear-gradient(110deg,#153b58,#1c6b76)!important;color:#fff!important;border-radius:17px!important}.page-header h1{font-size:27px!important}.lesson-block,.note-panel,.knowledge,.practice-tool{padding:17px!important;background:#dfeef1!important;border-color:#bad3df!important}.lesson-block p,.role-card p{font-size:17px!important}.section-header h2{font-size:24px!important}@media(max-width:650px){#main{padding:7px 9px 29px!important}.page-header h1{font-size:27px!important}.practice-tool{padding:12px!important}.lesson-block p{font-size:17px!important}}';
 doc.head.appendChild(style)}
 // Original site uses history.pushState for internal navigation; mirror its location to this app.
 if(!w.__sabaAppNavigationPatch){w.__sabaAppNavigationPatch=true;var push=w.history.pushState;w.history.pushState=function(){var r=push.apply(this,arguments);setTimeout(syncCourseNavigation,0);return r};w.addEventListener("hashchange",syncCourseNavigation);w.addEventListener("popstate",syncCourseNavigation)}
 syncCourseNavigation();
 }catch(e){}
}
function syncCourseNavigation(){try{var h=courseFrame.contentWindow.location.hash.substring(1),match=/^s\/([1-9])\/([a-z0-9-]+)$/.exec(h);if(!match||!section(Number(match[1]),match[2]))return;var r=route(),s=Number(match[1]),p=match[2];if(r.page==="reader"&&(r.s!==s||r.p!==p)){history.replaceState(null,"","#/lesson/"+s+"/"+p);memory.last={s:s,p:p};save();readerControls(s,p)}}catch(e){}}
function setCourse(s,p){var u=contentUrl(s,p);E("externalLesson").href=u.href;try{if(courseReady){var here=new URL(courseFrame.contentWindow.location.href);if(here.href===u.href)return;if(here.pathname===u.pathname){courseFrame.contentWindow.location.replace(u.href);return}}}catch(e){}
if(courseLast!==u.href){courseLast=u.href;courseReady=false;E("courseLoader").hidden=false;courseFrame.src=u.href}}
function readerControls(s,p){var ses=session(s),idx=ses.sections.findIndex(function(x){return x.id===p}),st=courseState();E("readerTitle").textContent=section(s,p).title;E("readerSession").textContent="جلسه "+fa(s)+" از ۹ · "+ses.title;E("lessonChips").innerHTML=ses.sections.map(function(x,i){var active=x.id===p,completed=st.done.has(doneKey(s,x.id));return '<button type="button" data-part="'+escapeText(x.id)+'" class="chip'+(active?' active':'')+(completed?' completed':'')+'" aria-current="'+(active?'page':'false')+'">'+fa(i+1)+' · '+escapeText(x.title)+(completed?' ✓':'')+'</button>'}).join("");E("previousLesson").disabled=idx===0;E("nextLesson").disabled=idx>=ses.sections.length-1;var key=doneKey(s,p),starred=memory.bookmarks.includes(key);E("bookmark").textContent=starred?"★":"☆";E("bookmark").setAttribute("aria-label",starred?"حذف نشان":"نشان کردن درس");E("externalLesson").href=contentUrl(s,p).href}
function renderReader(s,p){memory.last={s:s,p:p};save();readerControls(s,p);setCourse(s,p)}
function setStudio(tab){var u=studioUrl(tab);E("externalStudio").href=u.href;try{if(studioReady){var here=new URL(studioFrame.contentWindow.location.href);if(here.href===u.href)return;if(here.pathname===u.pathname){studioFrame.contentWindow.location.replace(u.href);return}}}catch(e){}if(studioLast!==u.href){studioLast=u.href;studioReady=false;E("studioLoader").hidden=false;studioFrame.src=u.href}}
function renderPassport(){var st=courseState(),all=parts.reduce(function(n,s){return n+count(s,st)},0),pct=Math.round(all/47*100);E("contextName").textContent=st.name;E("passportSummary").textContent=fa(all)+" بخش تکمیل‌شده از ۴۷ بخش";E("progressPct").textContent=fa(pct)+"٪";E("progressRing").style.setProperty("--pct",pct+"%");var game=globalThis.SabaGamification?.collect();if(game&&E("gamificationDashboard"))E("gamificationDashboard").innerHTML=globalThis.SabaGamification.dashboard(game);var items=memory.bookmarks.map(function(k){var m=/^s([1-9])-(.+)$/.exec(k);if(!m||!section(Number(m[1]),m[2]))return "";return '<button type="button" class="saved-item" data-s="'+m[1]+'" data-p="'+escapeText(m[2])+'"><span><strong>☆ '+escapeText(section(Number(m[1]),m[2]).title)+'</strong><small>جلسه '+fa(m[1])+'</small></span><span>←</span></button>'}).filter(Boolean);E("bookmarkList").innerHTML=items.length?items.join(""):'<div class="blank">هنوز درسی نشان نشده است. در صفحه درس، علامت ☆ را بزنید.</div>'}
function syncCoachTeams(){var sel=E('cj-context');if(!sel)return;var raw=null;try{raw=JSON.parse(localStorage.getItem('sabanaft_reflective_v2')||'null')}catch(e){}var teams=raw&&Array.isArray(raw.contexts)&&raw.contexts.length?raw.contexts:[{id:'hq',name:'تیم ستاد'},{id:'project',name:'تیم پروژه'},{id:'contractors',name:'هماهنگی با پیمانکاران'}];
var current=sel.dataset.boundToBase==='yes'?sel.value:'',preferred='';try{var d=JSON.parse(localStorage.getItem('sabanaft_coaching_draft_v1')||'null');preferred=d&&d.context||'';}catch(e){}
sel.innerHTML=teams.filter(function(c){return /^[-a-z0-9_]{1,40}$/.test(c.id||'')}).map(function(c){return '<option value="'+escapeText(c.id)+'">'+escapeText(c.name||'تیم')+'</option>'}).join('');
sel.dataset.boundToBase='yes';var valid=function(id){return Array.from(sel.options).some(function(o){return o.value===id})};sel.value=valid(current)?current:valid(preferred)?preferred:valid(raw&&raw.activeContext)?raw.activeContext:(sel.options[0]&&sel.options[0].value||'');
}
function setModelNavOpen(open,restoreFocus){
 var button=E("modelNavToggle"),scrim=E("modelNavScrim");
 document.body.classList.toggle("model-nav-open",!!open);
 if(button)button.setAttribute("aria-expanded",open?"true":"false");
 if(scrim)scrim.hidden=!open;
 if(open){E("modelNavClose").focus();}
 else if(restoreFocus&&button)button.focus();
}
function highlightModelNav(r){
 var active=r.page==="context"?"context":r.page==="stage"?r.stage:
 (r.page==="reader"&&r.s===5&&r.p==="mix")?"idea":
 (r.page==="reader"&&r.s===7&&r.p==="perspectives")?"relationship":
 (r.page==="reader"&&r.s===8&&r.p==="design")?"tools":
 (r.page==="studio"&&r.tab==="daily")?"reflection":"";
 document.querySelectorAll("[data-model-nav]").forEach(function(button){
  if(button.dataset.modelNav===active)button.setAttribute("aria-current","page");
  else button.removeAttribute("aria-current");
 });
}
E("modelNavToggle").addEventListener("click",function(){setModelNavOpen(!document.body.classList.contains("model-nav-open"));});
E("modelNavClose").addEventListener("click",function(){setModelNavOpen(false,true);});
E("modelNavScrim").addEventListener("click",function(){setModelNavOpen(false,true);});
document.addEventListener("keydown",function(e){if(e.key==="Escape"&&document.body.classList.contains("model-nav-open"))setModelNavOpen(false,true);});
function render(){var r=route();var gam=globalThis.SabaGamification?.collect();if(E("globalScore")&&gam)E("globalScore").innerHTML="⭐ <span>"+fa(gam.annualScore)+" امتیاز · "+escapeText(gam.level)+"</span>";if(document.body.classList.contains("model-nav-open"))setModelNavOpen(false);highlightModelNav(r);document.body.classList.toggle('saba-home',r.page==='home');document.querySelectorAll(".view").forEach(function(v){v.classList.toggle("active",v.id===(r.page==="reader"?"reader":r.page)+"View")});document.body.classList.toggle("studio-mode",r.page==="studio");if(r.page==="home")renderHome();if(r.page==="stage")renderStage(r.stage);if(r.page==="coach")syncCoachTeams();if(r.page==="course")renderCourse();if(r.page==="session")renderSession(r.s);if(r.page==="reader")renderReader(r.s,r.p);if(r.page==="studio")setStudio(r.tab);if(r.page==="context")setContext();if(r.page==="passport")renderPassport();window.scrollTo(0,0)}
courseFrame.addEventListener("load",function(){courseReady=true;try{courseLast=courseFrame.contentWindow.location.href}catch(e){}injectCourseStyles();E("courseLoader").hidden=true;sizeEmbedded(courseFrame,"course")});
studioFrame.addEventListener("load",function(){studioReady=true;try{studioLast=studioFrame.contentWindow.location.href}catch(e){}E("studioLoader").hidden=true;sizeEmbedded(studioFrame,"studio")});
document.querySelectorAll("[data-nav]").forEach(function(b){b.addEventListener("click",function(){go(b.dataset.nav)})});
document.querySelectorAll("[data-go]").forEach(function(b){b.addEventListener("click",function(){if(document.body.classList.contains("model-nav-open"))setModelNavOpen(false);go(b.dataset.go)})});
E("futureCoachEntry").addEventListener("click",function(){go("coach")});
E("futureCoachBack").addEventListener("click",function(){go("home")});


E("courseGrid").addEventListener("click",function(e){var a=e.target.closest("[data-session]");if(a)go("session/"+a.dataset.session)});
E("sessionBack").addEventListener("click",function(){go("course")});
E("stageBack").addEventListener("click",function(){go("home")});
E("stageActionList").addEventListener("click",function(e){var b=e.target.closest("[data-go-stage]");if(b){lastStage=route().stage;go(b.dataset.goStage)}});
E("lessonList").addEventListener("click",function(e){var b=e.target.closest("[data-lesson]"),r=route();if(b&&r.page==="session")openLesson(r.s,b.dataset.lesson)});
E("readerBack").addEventListener("click",function(){var r=route();if(r.page==="reader")go(lastStage?"stage/"+lastStage:"session/"+r.s)});
E("lessonChips").addEventListener("click",function(e){var b=e.target.closest("[data-part]"),r=route();if(b&&r.page==="reader")openLesson(r.s,b.dataset.part)});
E("bookmark").addEventListener("click",function(){var r=route();if(r.page!=="reader")return;var k=doneKey(r.s,r.p),i=memory.bookmarks.indexOf(k);if(i>=0)memory.bookmarks.splice(i,1);else memory.bookmarks.push(k);save();readerControls(r.s,r.p);notice(i<0?"برای مرور بعدی نشان شد.":"نشان درس برداشته شد.")});
["previousLesson","nextLesson"].forEach(function(id){E(id).addEventListener("click",function(){var r=route(),s=session(r.s);if(!s||r.page!=="reader")return;var i=s.sections.findIndex(function(x){return x.id===r.p})+(id==="nextLesson"?1:-1);if(i>=0&&i<s.sections.length)openLesson(r.s,s.sections[i].id)})});
E("studioBack").addEventListener("click",function(){go(lastStage?"stage/"+lastStage:"home")});
E("contextBack").addEventListener("click",function(){go("home")});
document.addEventListener("click",function(e){if(e.target.closest("#sg-export"))globalThis.SabaGamification?.exportSummary();});
E("bookmarkList").addEventListener("click",function(e){var b=e.target.closest("[data-s]");if(b)openLesson(Number(b.dataset.s),b.dataset.p)});
E("openPortfolio").addEventListener("click",function(){window.open(new URL("index.html#portfolio",base).href,"_blank","noopener,noreferrer")});
E("changeContext").addEventListener("click",function(){go("course");window.open(new URL("index.html#home",base).href,"_blank","noopener,noreferrer")});
window.addEventListener("hashchange",render);window.addEventListener("popstate",render);
window.addEventListener("storage",function(ev){if(!["sabanaft_reflective_v2","sabanaft_leadership_studio_v1"].includes(ev.key))return;var g=globalThis.SabaGamification?.collect();if(g&&E("globalScore"))E("globalScore").innerHTML="⭐ <span>"+fa(g.annualScore)+" امتیاز · "+escapeText(g.level)+"</span>";if(route().page==="passport")renderPassport();if(route().page==="home")renderHome();});
var deferred=null;window.addEventListener("beforeinstallprompt",function(e){e.preventDefault();deferred=e;E("install").hidden=false});
E("install").addEventListener("click",async function(){if(!deferred){notice("در مرورگر خود گزینه افزودن به صفحه اصلی را انتخاب کنید.");return}deferred.prompt();await deferred.userChoice;deferred=null;E("install").hidden=true});
render();
if("serviceWorker" in navigator)window.addEventListener("load",function(){navigator.serviceWorker.register("./sw.js").catch(function(){})});
})();