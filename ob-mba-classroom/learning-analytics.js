/* MBA OB – first-party learning analytics, 2026-11.
   Only approved student activity taxonomy, browser foreground time and visit
   count leave the device. NEVER transmit free-text responses or form fields.
   Authorization: existing hashed, revocable classroom token (validated by Edge). */
(()=>{
"use strict";
const role=window.OB_ACCESS?.role;
if(role!=="student")return;
const API="https://hxcjkewlaniahvuqwwbb.supabase.co/functions/v1/mba-ob-learning-analytics";
const KEY="mba-ob-classroom-attendance-identity-v1";
const token=(()=>{try{return JSON.parse(localStorage.getItem(KEY)||"null")?.token||null}catch{return null}})();
if(!token)return;
const names={home:"خانه",sessions:"جلسات",session:"جلسه آموزشی",concepts:"مفاهیم",case:"تحلیل کیس",resources:"منابع تکمیلی",quiz:"آزمون",performance:"داشبورد عملکرد",reflection:"تأمل فردی",journey:"سفر یادگیری",other:"فعالیت دیگر"};
let visitId=typeof crypto?.randomUUID==="function"?crypto.randomUUID():null;
let lastTick=Date.now(),lastVisitKey="",lastLogged=0;
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
 }
}
document.addEventListener("click",e=>{
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
window.OB_ANALYTICS={onRender,track:(action,area,session)=>send(action,area,session)};
})();