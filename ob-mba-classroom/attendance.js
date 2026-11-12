/* MBA OB attendance: all student activity drafts stay in the existing on-device learning store.
   Only roster, session windows, and attendance state reach the isolated attendance API. */
(()=>{
"use strict";
const API="https://hxcjkewlaniahvuqwwbb.supabase.co/functions/v1/mba-ob-attendance";
const STORAGE="mba-ob-classroom-attendance-identity-v1";
const root=document.getElementById("attendanceRoot");
const named={
 session_expired:"دسترسی این دستگاه منقضی شده است.",invalid_credentials:"رمز مدرس صحیح نیست.",
 invalid_invitation:"کد دعوت یا نام معتبر نیست.",invite_unavailable:"این کد دعوت قبلاً مصرف شده یا معتبر نیست.",
 invalid_name:"نام دانشجو معتبر نیست.",window_closed:"مهلت حضور این جلسه پایان یافته است.",
 wrong_code:"کد حضور صحیح نیست.",too_many_attempts:"تعداد تلاش‌های ناموفق بیش از حد مجاز است.",
 invalid_code:"کد شش‌رقمی حضور را وارد کنید.",student_disabled:"دسترسی این دانشجو غیرفعال است.",
 teacher_auth_required:"ورود مدرس لازم است.",server_error:"ارتباط با سامانه برقرار نشد.",
 attendance_submit_failed:"ثبت حضور انجام نشد؛ دوباره بررسی کنید."
};
const esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const persian=n=>Number(n).toLocaleString("fa-IR");
const dateText=v=>!v?"—":new Intl.DateTimeFormat("fa-IR",{timeZone:"Asia/Tehran",hour:"2-digit",minute:"2-digit",year:"numeric",month:"short",day:"numeric"}).format(new Date(v));
const t=()=>new Date().toISOString();
let credential=null;try{credential=JSON.parse(localStorage.getItem(STORAGE)||"null")}catch{}
let activeTab="student",selectedLesson=1,busy=false,error="",notice="",remote=null,issued=[];
function storeIdentity(id){credential=id;localStorage.setItem(STORAGE,JSON.stringify(id))}
function clearIdentity(){credential=null;localStorage.removeItem(STORAGE);remote=null;issued=[]}
async function api(action,extra={},token=credential?.token){
 const controller=new AbortController();
 const timeout=setTimeout(()=>controller.abort(),15000);
 try{
  const r=await fetch(API,{method:"POST",mode:"cors",cache:"no-store",
   headers:{"Content-Type":"application/json"},body:JSON.stringify({action,...extra,token}),signal:controller.signal});
  let data;try{data=await r.json()}catch{throw Error("server_error")}
  if(!r.ok||data.ok===false)throw Error(String(data.error||"server_error"));
  return data;
 }catch(e){
  if(e.name==="AbortError"||e instanceof TypeError)throw Error("network_error");
  throw e;
 }finally{clearTimeout(timeout)}
}
function explain(e){const msg=String(e?.message||e);return msg==="network_error"?"برای ثبت حضور اتصال اینترنت لازم است.":(named[msg]||"خطا در ارتباط با سامانه کلاس.")}
const errorHtml=()=>error?'<div class="alert error" role="alert">'+esc(error)+'</div>':"";
const noticeHtml=()=>notice?'<div class="alert success" role="status">'+esc(notice)+'</div>':"";
const btn=(text,act,cls="minor-btn",extra="")=>'<button type="button" class="'+cls+'" data-action="'+act+'" '+extra+'>'+text+'</button>';
const links=()=>'<a class="link-btn" href="./">مشاهده جلسات و درسنامه‌ها ←</a>';
const indicator=v=>v==="approved"?'<span class="pill ok">حاضر</span>':v==="pending"?'<span class="pill warn">در انتظار تأیید</span>':v==="rejected"?'<span class="pill bad">ردشده</span>':'<span class="pill">غایب / ثبت‌نشده</span>';
async function refresh(){
 if(!credential?.token){remote=null;return}
 remote=await api(credential.role==="teacher"?"teacherState":"studentState");
 if(credential.role==="student"&&remote.student?.name)credential.name=remote.student.name;
}
async function run(fn){
 if(busy)return;busy=true;error="";notice="";root.classList.add("loading");
 try{await fn()}catch(e){error=explain(e)}finally{busy=false;root.classList.remove("loading");render()}
}
function loginPage(){
 return '<section class="card"><div class="switcher">'+btn("دانشجو","tab-student",activeTab==="student"?"active":"")+btn("مدرس","tab-teacher",activeTab==="teacher"?"active":"")+'</div>'+
 (activeTab==="student"?'<form id="studentEnroll" class="stack"><h2>ورود دانشجو</h2><div class="field"><label for="studentName">نام و نام خانوادگی</label><input id="studentName" name="name" autocomplete="name" maxlength="90" required></div><div class="field"><label for="inviteCode">کد دعوت اختصاصی</label><input id="inviteCode" name="invite" dir="ltr" maxlength="32" autocomplete="off" autocapitalize="off" spellcheck="false" required></div><button class="main-btn gold-btn" type="submit">ورود به کلاس</button></form>':
 '<form id="teacherLogin" class="stack"><h2>ورود مدرس</h2><div class="field"><label for="teacherPass">رمز مدیریت کلاس</label><input id="teacherPass" type="password" name="password" autocomplete="current-password" required></div><button class="main-btn" type="submit">ورود به داشبورد</button></form>')+
 errorHtml()+noticeHtml()+'</section>'+links();
}
function studentPage(){
 const active=remote?.active,allowed=Boolean(active&&Date.parse(active.closes_at)>Date.now());
 const attended=remote?.attendance||[];
 const registered=attended.find(x=>x.session_no===active?.session_no);
 return '<section class="card status-card"><div class="row"><h2>'+esc(credential?.name||remote?.student?.name||"دانشجو")+'</h2>'+btn("تازه‌سازی","refresh","minor-btn")+'</div>'+
 (allowed?'<span class="pill ok">حضور جلسه '+persian(active.session_no)+' باز است</span><span class="small">پایان: '+dateText(active.closes_at)+'</span>':'<span class="pill">بازه ثبت حضور بسته است</span>')+
 (allowed&&!registered?'<form id="checkIn" class="stack"><div class="field"><label for="attendanceCode">کد شش‌رقمی کلاس</label><input id="attendanceCode" class="code-input" name="code" inputmode="numeric" pattern="[0-9]{6}" maxlength="6" autocomplete="one-time-code" placeholder="••••••" required></div><button class="main-btn gold-btn" type="submit">ثبت حضور</button></form>':registered?indicator(registered.status):"")+
 errorHtml()+noticeHtml()+'</section>'+
 '<section class="card"><h3>سوابق حضور من</h3><div class="list">'+(attended.length?attended.map(x=>'<div class="list-entry"><div><strong>جلسه '+persian(x.session_no)+'</strong><small>'+dateText(x.checked_at)+'</small></div>'+indicator(x.status)+'</div>').join(""):'<p class="empty">هنوز حضوری ثبت نشده است.</p>')+'</div></section>'+
 links()+'<details class="expand"><summary>تنظیمات دستگاه</summary><div class="inner"><p class="small">پاسخ تمرین‌ها روی همین دستگاه می‌ماند. خروج از حساب، دسترسی این دستگاه به سوابق حضور را قطع می‌کند.</p>'+btn("خروج از این دستگاه","signout","minor-btn danger-btn")+'</div></details>';
}
function teacherPage(){
 const students=remote?.students||[],attendance=remote?.attendance||[],invites=remote?.invites||[];
 const windows=remote?.windows||[],win=windows.find(x=>x.session_no===selectedLesson);
 const open=Boolean(win&&!win.closed_at&&Date.parse(win.closes_at)>Date.now());
 const seen=new Map(attendance.filter(x=>x.session_no===selectedLesson).map(x=>[x.student_id,x]));
 const pending=students.filter(x=>seen.get(x.id)?.status==="pending").length;
 const confirmed=students.filter(x=>seen.get(x.id)?.status==="approved").length;
 const enrolled=students.filter(x=>!x.disabled_at);
 const namedPending=invites.filter(x=>!x.redeemed_at&&!x.revoked_at&&x.expected_name).map(x=>x.expected_name);
 const roster=[...enrolled.map(x=>({id:x.id,name:x.full_name,record:seen.get(x.id)||null})),
  ...namedPending.map(n=>({id:null,name:n,record:null}))].sort((a,b)=>a.name.localeCompare(b.name,"fa"));
 const row=(x,i)=>'<tr><td>'+persian(i+1)+'</td><td><strong>'+esc(x.name)+'</strong></td><td>'+indicator(x.record?.status)+'</td><td>'+(x.record?'<div class="roster-actions">'+(x.record.status!=="approved"?btn("تأیید","review","minor-btn",'data-student="'+esc(x.id)+'" data-status="approved"'):"")+(x.record.status!=="rejected"?btn("رد","review","minor-btn",'data-student="'+esc(x.id)+'" data-status="rejected"'):"")+'</div>':'—')+'</td></tr>';
 const inviteLines=issued.map(x=>(x.name?x.name+" | ":"")+x.code).join("\n");
 return '<section class="card"><div class="row"><h2>داشبورد مدرس</h2>'+btn("به‌روزرسانی","refresh","minor-btn")+'</div><div class="grid-two"><div class="pill">ثبت‌نام‌شده: '+persian(enrolled.length)+'</div><div class="pill">کد دعوت استفاده‌نشده: '+persian(remote?.unredeemed||0)+'</div></div></section>'+
 '<section class="card"><h3>ثبت حضور جلسه</h3><form id="openWindow" class="stack"><div class="grid-two"><div class="field"><label for="sessionPick">جلسه</label><select id="sessionPick" name="session">'+Array.from({length:16},(_,i)=>'<option value="'+(i+1)+'" '+(selectedLesson===i+1?"selected":"")+'>'+persian(i+1)+'</option>').join("")+'</select></div><div class="field"><label for="windowMinutes">مهلت ثبت</label><select id="windowMinutes" name="minutes">'+[5,10,15,20,30].map(n=>'<option value="'+n+'" '+(n===15?"selected":"")+'>'+persian(n)+' دقیقه</option>').join("")+'</select></div></div><button type="submit" class="main-btn gold-btn">'+(open?"تولید کد جدید و شروع مجدد":"شروع ثبت حضور")+'</button></form>'+
 (open?'<div class="alert">مهلت حضور جلسه '+persian(selectedLesson)+' تا '+dateText(win.closes_at)+' باز است.</div>':win?'<span class="pill">مهلت حضور این جلسه بسته است</span>':"")+
 (currentCode&&Number(currentCode.session)===selectedLesson?'<div class="code-box">'+esc(currentCode.code)+'</div><span class="small">کد کلاس را فقط هنگام شروع حضور به دانشجویان اعلام کنید.</span>':"")+
 (open?btn("بستن فوری ثبت حضور","closeWindow","minor-btn danger-btn"):"")+
 errorHtml()+noticeHtml()+'</section>'+
 '<section class="card"><div class="row"><h3>فهرست حضور · جلسه '+persian(selectedLesson)+'</h3><span class="pill ok">'+persian(confirmed)+' حاضر</span></div><div class="toolbar">'+btn("دانلود CSV","exportCsv","minor-btn")+btn("تأیید درخواست‌های معلق ("+persian(pending)+")","approvePending","minor-btn")+'</div><div class="table-scroll"><table class="roster-table"><thead><tr><th>ردیف</th><th>دانشجو</th><th>وضعیت</th><th>تأیید مدرس</th></tr></thead><tbody>'+ (roster.length?roster.map(row).join(""):'<tr><td colspan="4">هنوز دانشجویی ثبت نشده است.</td></tr>')+'</tbody></table></div></section>'+
 '<details class="expand"><summary>دعوت دانشجویان</summary><div class="inner"><form id="issueInvites" class="stack"><div class="field"><label for="rosterNames">نام دانشجویان (هر نفر یک خط)</label><textarea id="rosterNames" name="names" placeholder="نام و نام خانوادگی دانشجوی اول&#10;نام و نام خانوادگی دانشجوی دوم"></textarea></div><div class="field"><label for="inviteCount">یا تعداد کدهای بدون نام</label><input id="inviteCount" name="count" type="number" value="10" min="1" max="50"></div><button type="submit" class="main-btn">ساخت کدهای دعوت</button></form>'+
 (issued.length?'<div class="code-output" id="inviteOutput">'+esc(inviteLines)+'</div>'+btn("کپی کدها","copyInvites","minor-btn"):'')+
 '<p class="small">هر کد دعوت فقط یک‌بار قابل استفاده است. کدها را جداگانه برای دانشجویان بفرستید.</p></div></details>'+
 '<details class="expand"><summary>تنظیمات</summary><div class="inner">'+btn("خروج از حساب مدرس","signout","minor-btn danger-btn")+'</div></details>';
}
let currentCode=null;
function render(){root.innerHTML=credential?.role==="teacher"&&remote?teacherPage():credential?.role==="student"&&remote?studentPage():loginPage()}
async function start(){
 if(!credential){render();return}
 try{await refresh()}catch(e){error=explain(e);if(String(e?.message).includes("expired")){clearIdentity();error="برای ورود دوباره، از مدرس کد دعوت جدید بگیرید."}}
 render();
}
async function work(action,extras={}){
 const d=await api(action,extras);
 await refresh();
 return d;
}
document.addEventListener("submit",e=>{
 if(!root.contains(e.target))return;
 const form=e.target;e.preventDefault();const data=new FormData(form);
 if(form.id==="studentEnroll"){run(async()=>{
  const result=await api("redeem",{name:String(data.get("name")||""),invite:String(data.get("invite")||"").trim()});
  storeIdentity({role:"student",token:result.token,name:result.name});await refresh();notice="ورود انجام شد.";
 })}else if(form.id==="teacherLogin"){run(async()=>{
  const result=await api("teacherLogin",{password:String(data.get("password")||"")});
  storeIdentity({role:"teacher",token:result.token});activeTab="teacher";await refresh();
 })}else if(form.id==="checkIn"){run(async()=>{
  const win=remote?.active;if(!win)throw Error("window_closed");
  const result=await work("checkIn",{session:Number(win.session_no),code:String(data.get("code")||"").trim()});
  notice=result.already?"حضور قبلاً ثبت شده است.":"درخواست حضور ثبت شد؛ در انتظار تأیید مدرس.";
 })}else if(form.id==="openWindow"){run(async()=>{
  const session=Number(data.get("session")),minutes=Number(data.get("minutes"));
  selectedLesson=session;
  const result=await work("openWindow",{session,minutes});
  currentCode={session,code:result.code};notice="کد جلسه فعال شد.";
 })}else if(form.id==="issueInvites"){run(async()=>{
  const names=String(data.get("names")||"").split(/\r?\n/).map(x=>x.trim()).filter(Boolean);
  const result=await work("issueInvites",names.length?{names}:{count:Number(data.get("count"))});
  issued=result.codes||[];
  notice=persian(issued.length)+" کد دعوت ساخته شد.";
 })}}
);
document.addEventListener("change",e=>{
 if(!root.contains(e.target))return;
 if(e.target.id==="sessionPick"){selectedLesson=Number(e.target.value);currentCode=null;render()}
});
function csvValue(v){let str=String(v??"");if(/^[=+\-@\t\r]/.test(str))str="'"+str;return '"'+str.replace(/"/g,'""')+'"'}
function exportCsv(){
 const att=remote?.attendance||[],students=remote?.students||[],invites=remote?.invites||[];
 const rows=[["جلسه","نام","وضعیت","زمان ثبت"]];
 students.filter(s=>!s.disabled_at).forEach(s=>{
  const a=att.find(x=>x.student_id===s.id&&x.session_no===selectedLesson);
  rows.push([selectedLesson,s.full_name,a?.status||"absent",a?.checked_at||""]);
 });
 invites.filter(x=>!x.redeemed_at&&!x.revoked_at&&x.expected_name).forEach(x=>
  rows.push([selectedLesson,x.expected_name,"not_registered",""]));
 const csv="\ufeff"+rows.map(x=>x.map(csvValue).join(",")).join("\r\n");
 const url=URL.createObjectURL(new Blob([csv],{type:"text/csv;charset=utf-8"}));
 const a=document.createElement("a");a.href=url;a.download="MBA-OB-Attendance-Session-"+selectedLesson+".csv";a.click();
 setTimeout(()=>URL.revokeObjectURL(url),3000);
}
document.addEventListener("click",e=>{
 const b=e.target.closest("[data-action]");if(!b||!root.contains(b))return;
 const action=b.dataset.action;
 if(action==="tab-student"||action==="tab-teacher"){activeTab=action==="tab-student"?"student":"teacher";error="";render();return}
 if(action==="signout"){
  if(!confirm("اطلاعات ورود این دستگاه حذف شود؟ برای ورود دوباره، ممکن است به کد دعوت جدید نیاز داشته باشید."))return;
  clearIdentity();notice="از حساب خارج شدید.";render();return;
 }
 if(action==="exportCsv"){exportCsv();return}
 if(action==="copyInvites"){run(async()=>{await navigator.clipboard.writeText(issued.map(x=>(x.name?x.name+" | ":"")+x.code).join("\n"));notice="کدها کپی شدند."});return}
 if(action==="refresh"){run(()=>refresh());return}
 if(action==="closeWindow"){run(async()=>{await work("closeWindow",{session:selectedLesson});currentCode=null;notice="ثبت حضور بسته شد."});return}
 if(action==="review"){run(async()=>{await work("review",{student_id:b.dataset.student,session:selectedLesson,status:b.dataset.status});notice="وضعیت ذخیره شد."});return}
 if(action==="approvePending"){
  run(async()=>{const pending=(remote?.attendance||[]).filter(a=>a.session_no===selectedLesson&&a.status==="pending");
   for(const a of pending)await api("review",{student_id:a.student_id,session:selectedLesson,status:"approved"});
   await refresh();notice=persian(pending.length)+" درخواست تأیید شد.";
  });return;
 }
});
start();
})();