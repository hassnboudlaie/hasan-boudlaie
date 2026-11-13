/* Dedicated Allameh entrance. UI-level gate for the GitHub Pages PWA.
  Backend independently controls membership/attendance; publicly hosted static
  assets are not confidential. No national ID is stored in the browser. */
(()=>{
"use strict";
const API="https://hxcjkewlaniahvuqwwbb.supabase.co/functions/v1/mba-ob-attendance";
const STORE="mba-ob-classroom-attendance-identity-v1",TRUST="mba-ob-teacher-trusted-device-v1";
const gate=document.getElementById("entryGate"),site=document.getElementById("site");
const message={invalid_registration:"نام و کد دانشجویی را بررسی کنید.",already_registered:"این کد دانشجویی قبلاً ثبت شده است. برای بازیابی دسترسی با مدرس هماهنگ کنید.",
 invalid_credentials:"اطلاعات ورود مدرس صحیح نیست یا این دستگاه تأیید نشده است.",
 invalid_national_id:"کد ملی معتبر نیست.",session_expired:"دسترسی این دستگاه منقضی شده است.",
 network_error:"اتصال اینترنت برای بررسی عضویت لازم است.",server_error:"اتصال به سامانه کلاس برقرار نشد."};
const enc=x=>String(x??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const digit=s=>String(s||"").replace(/[۰-۹]/g,c=>String(c.charCodeAt(0)-1776)).replace(/[٠-٩]/g,c=>String(c.charCodeAt(0)-1632)).trim();
let credential=null,trusted=null,selected="student",error="",loading=false,view="login",status=null,loaded=false;
try{credential=JSON.parse(localStorage.getItem(STORE)||"null");trusted=localStorage.getItem(TRUST)}catch{}
if(credential?.role==="teacher")selected="teacher";
const fromStore=()=>{try{return JSON.parse(localStorage.getItem(STORE)||"null")}catch{return null}};
function saveCred(c){credential=c;localStorage.setItem(STORE,JSON.stringify(c))}
function forgetCred(){credential=null;localStorage.removeItem(STORE)}
async function request(action,args={},token=credential?.token){
 const controller=new AbortController(),kill=setTimeout(()=>controller.abort(),16000);
 try{
  const r=await fetch(API,{method:"POST",mode:"cors",cache:"no-store",headers:{"Content-Type":"application/json"},
    body:JSON.stringify({action,...args,token}),signal:controller.signal});
  const data=await r.json();
  if(!r.ok||!data.ok)throw Error(data.error||"server_error");
  return data;
 }catch(e){
  if(e.name==="AbortError"||e instanceof TypeError)throw Error("network_error");
  throw e;
 }finally{clearTimeout(kill)}
}
function present(){
 site.hidden=true;document.documentElement.dataset.access="locked";
 const flash=error?'<p class="entrance-error" role="alert">'+enc(message[error]||"درخواست انجام نشد؛ دوباره بررسی کنید.")+'</p>':"";
 const tabs='<div class="entrance-tabs"><button type="button" data-entrance="student" aria-pressed="'+(selected==="student")+'">دانشجو</button><button type="button" data-entrance="teacher" aria-pressed="'+(selected==="teacher")+'">مدرس</button></div>';
 let inner="";
 if(view==="pending"||view==="rejected"){
  inner='<div class="entrance-status-icon" aria-hidden="true">'+(view==="pending"?"◷":"!")+'</div><h2>'+(view==="pending"?"در انتظار تأیید مدرس":"درخواست تأیید نشد")+'</h2><p>'+(view==="pending"?"درخواست شما ثبت شده است. بعد از تأیید مدرس به کلاس دسترسی پیدا می‌کنید.":"برای بررسی وضعیت عضویت با مدرس هماهنگ کنید.")+'</p>'
  +(credential?.name?'<div class="entrance-student">'+enc(credential.name)+(credential.student_number?' · '+enc(credential.student_number):"")+'</div>':"")
  +'<button class="entrance-primary" data-entrance="refresh" type="button">بررسی وضعیت</button>'
  +'<button class="entrance-secondary" data-entrance="reset" type="button">تغییر دستگاه یا حساب</button>';
 }else if(selected==="student"){
  inner='<h2>ورود دانشجو</h2><form id="entranceStudent" class="entrance-form"><label for="studentNumber">کد دانشجویی</label><input id="studentNumber" name="student_number" dir="ltr" inputmode="numeric" pattern="[0-9۰-۹]{6,16}" minlength="6" maxlength="16" required autocomplete="off" placeholder="کد دانشجویی"><label for="studentName">نام و نام خانوادگی</label><input id="studentName" name="name" maxlength="90" autocomplete="name" required placeholder="نام و نام خانوادگی"><button class="entrance-primary" type="submit">درخواست ورود</button></form><p class="entrance-hint">ورود به کلاس بعد از تأیید مدرس فعال می‌شود.</p>';
 }else if(trusted){
  inner='<h2>ورود مدرس</h2><form id="entranceTeacher" class="entrance-form"><label for="teacherNational">کد ملی مدرس</label><input id="teacherNational" name="national_id" dir="ltr" inputmode="numeric" pattern="[0-9۰-۹]{10}" maxlength="10" autocomplete="off" required placeholder="کد ملی ۱۰ رقمی"><button class="entrance-primary" type="submit">ورود به کلاس</button></form><button class="entrance-secondary" data-entrance="newDevice" type="button">ورود با دستگاه دیگر</button>';
 }else{
  inner='<h2>فعال‌سازی دستگاه مدرس</h2><form id="entranceTeacherSetup" class="entrance-form"><label for="teacherNational">کد ملی مدرس</label><input id="teacherNational" name="national_id" dir="ltr" inputmode="numeric" pattern="[0-9۰-۹]{10}" maxlength="10" required autocomplete="off"><label for="teacherPass">رمز مدیریت فعلی (فقط بار اول روی این دستگاه)</label><input id="teacherPass" name="password" type="password" minlength="16" maxlength="100" autocomplete="current-password" required><button class="entrance-primary" type="submit">تأیید دستگاه و ورود</button></form><p class="entrance-hint">پس از فعال‌سازی، روی همین دستگاه تنها کد ملی را وارد می‌کنید.</p>';
 }
 gate.innerHTML='<div class="entrance-shell"><div class="entrance-brand"><span class="entrance-logo">OB</span><div><small>دانشگاه علامه طباطبایی · MBA</small><strong>مدیریت رفتار سازمانی</strong></div></div><div class="entrance-card">'+(view==="login"?tabs:"")+inner+flash+'</div><p class="entrance-foot">۱۶ جلسه · ۴۸ ساعت</p></div>';
 gate.hidden=false;
}
function unlock(role){
 if(loaded)return;
 view="ready";loaded=true;
 window.OB_ACCESS={role,student:credential?.name||"",approved:true};
 document.documentElement.dataset.access=role;
 gate.hidden=true;site.hidden=false;
 const roleMenu=document.querySelector(".demo-role-menu");
 if(role==="student"&&roleMenu)roleMenu.hidden=true;
 // Education scripts load only after the server authorizes this device.
 const scripts=["./course-content.js?v=1","./lesson-enrichment.js?v=1","./guided-learning.js?v=1","./app.js?v=12"];
 (async()=>{for(const src of scripts)await new Promise((resolve,reject)=>{
  const tag=document.createElement("script");tag.src=src;tag.onload=resolve;tag.onerror=reject;
  document.body.appendChild(tag);
 })})().catch(()=>{loaded=false;error="server_error";present()});
}
async function check(){
 if(!credential?.token){view="login";present();return}
 try{
  loading=true;
  const data=await request("accessState");
  if(data.role==="teacher"){unlock("teacher");return}
  credential.name=data.student?.name||credential.name;
  credential.student_number=data.student?.student_number||credential.student_number;
  localStorage.setItem(STORE,JSON.stringify(credential));
  status=data.approval_status;
  if(status==="approved"){unlock("student");return}
  view=status==="rejected"?"rejected":"pending";error="";present();
 }catch(e){
  if(e.message==="session_expired"||e.message==="student_disabled"||e.message==="teacher_auth_required"){
    forgetCred();view="login";
  }
  error=e.message;present();
 }finally{loading=false}
}
gate.addEventListener("click",e=>{
 const b=e.target.closest("[data-entrance]");if(!b||loading)return;
 const act=b.dataset.entrance;
 if(act==="student"||act==="teacher"){selected=act;error="";present()}
 else if(act==="refresh"){check()}
 else if(act==="newDevice"){trusted=null;localStorage.removeItem(TRUST);present()}
 else if(act==="reset"){
  if(!confirm("دسترسی این دستگاه پاک می‌شود. برای ورود دوباره ممکن است به کمک مدرس نیاز داشته باشید. ادامه می‌دهید؟"))return;
  forgetCred();view="login";error="";present();
 }
});
gate.addEventListener("submit",e=>{
 const form=e.target.closest("form");if(!form||loading)return;
 e.preventDefault();loading=true;error="";const btn=form.querySelector('[type="submit"]');if(btn)btn.disabled=true;
 const d=new FormData(form);
 (async()=>{
  if(form.id==="entranceStudent"){
   const studentNumber=digit(d.get("student_number"));
   if(!/^\d{6,16}$/.test(studentNumber))throw Error("invalid_registration");
   const data=await request("registerStudent",{student_number:studentNumber,name:String(d.get("name")||"").trim()},null);
   saveCred({role:"student",token:data.token,name:data.name,student_number:studentNumber});
   view="pending";status="pending";
  }else if(form.id==="entranceTeacher"){
   const data=await request("teacherNationalLogin",{national_id:digit(d.get("national_id")),device_token:trusted},null);
   saveCred({role:"teacher",token:data.token});unlock("teacher");
  }else if(form.id==="entranceTeacherSetup"){
   const nationalId=digit(d.get("national_id"));
   const pwd=String(d.get("password")||"");
   const data=await request("teacherLogin",{password:pwd,national_id:nationalId},null);
   const bound=await request("teacherBindNational",{national_id:nationalId},data.token);
   trusted=bound.device_token;localStorage.setItem(TRUST,trusted);
   saveCred({role:"teacher",token:data.token});unlock("teacher");
  }
 })().catch(e=>{error=e.message}).finally(()=>{loading=false;if(!loaded)present()});
});
present();check();
})();