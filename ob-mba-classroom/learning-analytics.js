/* MBA OB – first-party learning analytics, 2026-11.
   Only approved student activity taxonomy, browser foreground time and visit
   count leave the device. NEVER transmit free-text responses or form fields.
   Authorization: existing hashed, revocable classroom token (validated by Edge). */
(()=>{
"use strict";
const role=window.OB_ACCESS?.role;
if(role!=="student"&&role!=="teacher")return;
const API="https://hxcjkewlaniahvuqwwbb.supabase.co/functions/v1/mba-ob-learning-analytics";
const KEY="mba-ob-classroom-attendance-identity-v1";
const token=(()=>{try{return JSON.parse(localStorage.getItem(KEY)||"null")?.token||null}catch{return null}})();
if(!token)return;
const escape=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const fa=n=>Number(n||0).toLocaleString("fa-IR");
const formatDate=s=>{if(!s)return "هنوز ثبت نشده";const d=new Date(s);return Number.isFinite(d.getTime())?d.toLocaleString("fa-IR",{year:"numeric",month:"short",day:"numeric",hour:"2-digit",minute:"2-digit"}):"—"};
const duration=n=>{const m=Math.floor(Number(n||0)/60);return m>=60?fa(Math.floor(m/60))+" ساعت و "+fa(m%60)+" دقیقه":fa(m)+" دقیقه"};
const names={home:"خانه",sessions:"جلسات",session:"جلسه آموزشی",concepts:"مفاهیم",case:"تحلیل کیس",resources:"منابع تکمیلی",quiz:"آزمون",performance:"داشبورد عملکرد",reflection:"تأمل فردی",journey:"سفر یادگیری",other:"فعالیت دیگر"};
const verbs={open:"ورود به اپ",navigate:"بازدید از بخش",guided_step:"پیمودن گام آموزشی",case_work:"فعالیت تحلیل کیس",quiz_open:"ورود به آزمون",resource_open:"مرور منابع",reflection_saved:"ثبت تأمل",journey_check:"تکمیل خوداظهاری گام",assignment_open:"ورود به تکلیف"};
let visitId=typeof crypto?.randomUUID==="function"?crypto.randomUUID():null;
let lastTick=Date.now(),lastVisitKey="",lastLogged=0;
let me=null,overview=null,detail=null,lastMineFetch=0,lastOverviewFetch=0,pendingMine=false,pendingTeacher=false;
async function api(action,more={}){
 const controller=new AbortController(),timeout=setTimeout(()=>controller.abort(),13000);
 try{
  const response=await fetch(API,{method:"POST",headers:{"Content-Type":"application/json"},
   cache:"no-store",signal:controller.signal,body:JSON.stringify({action,token,...more})});
  const data=await response.json();
  if(!response.ok||!data.ok)throw Error(data.error||"network_error");
  return data;
 }finally{clearTimeout(timeout)}
}
const send=(activity,area,session_no,kind="event",seconds=0)=>{
 if(role!=="student"||!visitId||!navigator.onLine)return;
 api("record",{visit_id:visitId,kind,activity,area: names[area]?area:"other",
  session_no:Number.isInteger(session_no)&&session_no>=1&&session_no<=16?session_no:null,seconds})
  .catch(()=>{/* Offline and network errors do not interrupt classroom study. */});
};
if(role==="student"){
 send("open","home",null);
 setInterval(()=>{
  const now=Date.now(),delta=Math.min(30,Math.floor((now-lastTick)/1000));
  lastTick=now;
  if(document.visibilityState==="visible"&&document.hasFocus()&&delta>0)
   send("open","other",null,"heartbeat",delta);
 },30000);
 document.addEventListener("visibilitychange",()=>{lastTick=Date.now()});
 document.addEventListener("focus",()=>{lastTick=Date.now()});
}
function activityArea(page,tab){
 if(page==="session")return tab==="case"?"case":tab==="resources"?"resources":tab==="finalQuiz"?"quiz":"concepts";
 return names[page]?page:"other";
}
function onRender(ctx={}){
 const page=String(ctx.page||"home"),area=activityArea(page,ctx.tab),session=Number(ctx.session||0);
 if(role==="student"){
  const visitKey=page+"/"+area+"/"+session+"/"+String(ctx.tab||"");
  if(visitKey!==lastVisitKey&&Date.now()-lastLogged>900){
   lastVisitKey=visitKey;lastLogged=Date.now();
   if(page!=="home")send("navigate",area,session);
  }
  if(document.querySelector("[data-oba-student]")){
   showMine();if(!me||Date.now()-lastMineFetch>40000)refreshMine();
  }
 }
 if(role==="teacher"&&page==="analytics"){
  showOverview();if(!overview||Date.now()-lastOverviewFetch>30000)refreshOverview();
 }
}
function studentCard(){
 return '<section class="oba-block" data-oba-student aria-label="فعالیت یادگیری من">'+
  '<div class="oba-top"><div><span class="oba-kicker">گزارش یادگیری من</span><h3>فعالیت یادگیری من</h3><p>تعداد ورود، زمان استفاده و فعالیت‌ها، در طول ترم و خارج از ساعت کلاس</p></div>'+
  '<button type="button" data-oba-refresh="mine" class="oba-refresh">به‌روزرسانی</button></div>'+
  '<div class="oba-student-data" data-oba-data role="status" aria-live="polite">در حال دریافت آمار…</div>'+
  '<p class="oba-privacy">فقط زمان حضور فعال روی صفحه و نوع فعالیت ثبت می‌شود؛ متن پاسخ‌ها و یادداشت‌های شخصی ارسال نمی‌شوند. این آمار نمره رسمی درس نیست.</p></section>';
}
function myDashboard(){return studentCard();}
function metrics(s){
 const cards=[["دفعات ورود",fa(s?.visits)],["زمان استفاده",duration(s?.active_seconds)],["فعالیت‌های ثبت‌شده",fa(s?.activity_count)]];
 return '<div class="oba-metrics">'+cards.map(([label,value])=>'<div class="oba-metric"><span>'+label+'</span><strong>'+value+'</strong></div>').join("")+'</div>';
}
function eventRows(events){
 return events.length?'<div class="oba-recent">'+events.slice(0,18).map(e=>'<div class="oba-event"><div><strong>'+escape(verbs[e.action]||"فعالیت آموزشی")+'</strong><span>'+escape(names[e.area]||"بخش دیگر")+(e.session_no?" · جلسه "+fa(e.session_no):"")+'</span></div><time>'+formatDate(e.recorded_at)+'</time></div>').join("")+'</div>':'<p class="oba-empty">هنوز فعالیتی ثبت نشده است. آمار از زمان فعال‌شدن این قابلیت جمع‌آوری می‌شود.</p>';
}
function showMine(){
 document.querySelectorAll("[data-oba-student]").forEach(panel=>{
  const output=panel.querySelector("[data-oba-data]");
  if(!output)return;
  if(!me){output.textContent="در حال دریافت آمار…";return}
  output.innerHTML=metrics(me.summary)+'<p class="oba-last">آخرین استفاده: '+formatDate(me.summary.latest_at)+'</p>'+
   (panel.dataset.obaDetail==="true"?'<h4>آخرین فعالیت‌ها</h4>'+eventRows(me.recent):"");
 });
}
async function refreshMine(){
 if(pendingMine)return;pendingMine=true;
 try{
  me=await api("mine");lastMineFetch=Date.now();showMine();
 }catch{
  document.querySelectorAll("[data-oba-data]").forEach(n=>{if(!me)n.innerHTML='<p class="oba-empty">اتصال آمار برقرار نیست؛ مطالعه بدون وقفه ادامه دارد. بعداً دوباره بررسی کنید.</p>'});
 }finally{pendingMine=false}
}
function teacherHTML(){
 return '<div class="page oba-teacher-page"><header class="oba-title"><span class="oba-kicker">مشارکت آموزشی</span><h2>مشارکت و فعالیت دانشجویان</h2>'+
 '<p>گزارش اختصاصی هر دانشجو؛ تعداد ورود، زمان استفاده و مسیرهای مطالعه خارج از کلاس نیز ثبت می‌شوند.</p></header>'+
 '<div class="oba-block"><div class="oba-top"><strong>دانشجویان تأییدشده</strong><button type="button" class="oba-refresh" data-oba-refresh="teacher">به‌روزرسانی</button></div>'+
 '<div id="obaTeacherBody" role="status" aria-live="polite">در حال دریافت گزارش…</div></div>'+
 '<p class="oba-privacy">این گزارش فقط Metadata رفتاری را نشان می‌دهد و شامل محتوای پاسخ‌ها و یادداشت‌های خصوصی نیست. برای ارزیابی علمی باید کیفیت تکالیف و آزمون‌ها را جداگانه بررسی کنید.</p></div>';
}
function showOverview(){
 const host=document.getElementById("obaTeacherBody");
 if(!host||!overview)return;
 const all=overview.students||[];
 if(detail?.student){showDetail();return}
 const total=all.reduce((s,x)=>s+x+(x.active_seconds||0),0);
 host.innerHTML='<div class="oba-summary"><strong>'+fa(all.length)+' دانشجو</strong><span>مجموع زمان ثبت‌شده: '+duration(total)+'</span></div>'+
 '<div class="oba-student-list">'+(all.length?all.map(s=>
 '<button type="button" class="oba-student-row" data-oba-detail="'+escape(s.student_id)+'">'+
 '<span><strong>'+escape(s.name)+'</strong><small>شماره دانشجویی: '+escape(s.student_number||"—")+'</small></span>'+
 '<span class="oba-student-numbers">ورود '+fa(s.visits)+' · '+duration(s.active_seconds)+'<small>آخرین فعالیت: '+formatDate(s.latest_at)+'</small></span>'+
 '<span class="oba-chevron" aria-hidden="true">←</span></button>').join(""):'<p class="oba-empty">هنوز دانشجوی تأییدشده‌ای ثبت نشده است.</p>')+'</div>';
}
function showDetail(){
 const host=document.getElementById("obaTeacherBody");
 if(!host||!detail)return;
 const student=detail.student||{},sum=detail.summary||{};
 host.innerHTML='<button type="button" data-oba-back class="oba-back">→ بازگشت به فهرست دانشجویان</button>'+
 '<h3 class="oba-student-title">'+escape(student.name||"دانشجو")+'</h3>'+
 metrics(sum)+'<p class="oba-last">آخرین استفاده: '+formatDate(sum.latest_at)+'</p>'+
 '<h4>بخش‌های مراجعه‌شده</h4><div class="oba-tags">'+Object.entries(sum.by_area||{}).sort((a,b)=>b[1]-a[1]).map(([area,c])=>'<span>'+escape(names[area]||area)+' · '+fa(c)+'</span>').join("")+'</div>'+
 '<h4>آخرین فعالیت‌های آموزشی</h4>'+eventRows(detail.recent||[])+
 (detail.truncated?'<p class="oba-privacy">این گزارش به بیشترین تعداد رکورد قابل نمایش محدود شده است.</p>':"");
}
async function refreshOverview(){
 if(pendingTeacher)return;pendingTeacher=true;
 try{overview=await api("classOverview");lastOverviewFetch=Date.now();detail=null;showOverview()}
 catch{
  const e=document.getElementById("obaTeacherBody");
  if(e&&!overview)e.innerHTML='<p class="oba-empty">دریافت گزارش ممکن نشد. اتصال اینترنت را بررسی و دوباره تلاش کنید.</p>';
 }finally{pendingTeacher=false}
}
async function openDetail(id){
 const host=document.getElementById("obaTeacherBody");
 if(host)host.textContent="در حال دریافت پرونده فعالیت دانشجو…";
 try{detail=await api("studentDetail",{student_id:id});showDetail()}
 catch{if(host)host.innerHTML='<p class="oba-empty">گزارش این دانشجو در دسترس نیست.</p><button type="button" class="oba-back" data-oba-back>بازگشت به فهرست</button>'}
}
document.addEventListener("click",e=>{
 const refresh=e.target.closest?.("[data-oba-refresh]");
 if(refresh){if(refresh.dataset.obaRefresh==="teacher")refreshOverview();else refreshMine();return}
 const detailBtn=e.target.closest?.("[data-oba-detail]");
 if(detailBtn&&role==="teacher"){openDetail(detailBtn.dataset.obaDetail);return}
 if(e.target.closest?.("[data-oba-back]")){detail=null;showOverview();return}
 if(role!=="student")return;
 const btn=e.target.closest?.("[data-action]");
 if(!btn)return;
 const action=btn.dataset.action||"";
 const group={
  guidedNext:"guided_step",guidedPrev:"guided_step",guidedMode:"guided_step",
  casePreview:"case_work",caseDownloadWord:"case_work",casePrintPDF:"case_work",
  openOriginalEnglish:"resource_open",copyResourceUrl:"resource_open",
  openSessionQuiz:"quiz_open",openSessionQuizAdmin:"quiz_open",
  openCaseReviews:"assignment_open"
 };
 if(!group[action]&&action!=="guidedJump"&&action!=="guidedExport")return;
 const activity=group[action]||(action==="guidedJump"?"guided_step":"resource_open");
 const session=Number(btn.dataset.id||document.querySelector("[data-guided-session]")?.dataset.guidedSession||document.querySelector("[data-oba-session]")?.dataset.obaSession||0);
 const area=activity==="guided_step"?"concepts":activity==="case_work"?"case":activity==="quiz_open"?"quiz":"resources";
 send(activity,area,session);
},true);
document.addEventListener("click",e=>{
 if(role!=="student")return;
 const quiz=e.target.closest?.("[data-quiz-action]");
 const caseBtn=e.target.closest?.("[data-case-action]");
 const area=quiz?"quiz":caseBtn?"case":null;
 if(!area)return;
 const session=Number(document.querySelector("[data-guided-session]")?.dataset.guidedSession||document.querySelector("[data-oba-session]")?.dataset.obaSession||0);
 send(quiz?"quiz_open":"case_work",area,session);
},true);
document.addEventListener("change",e=>{
 if(role!=="student")return;
 const field=e.target.closest?.("[data-guided-key]");
 if(!field)return;
 const session=Number(document.querySelector("[data-guided-session]")?.dataset.guidedSession||0);
 send("reflection_saved","reflection",session);
},true);
window.OB_ANALYTICS={onRender,studentCard,myDashboard,teacherHTML,track:(action,area,session)=>send(action,area,session),refreshMine,refreshOverview};
})();