/* Allameh MBA — authenticated assignments, attachments and assessment inbox. */
(()=>{
"use strict";
const API="https://hxcjkewlaniahvuqwwbb.supabase.co/functions/v1/mba-ob-assignments";
const STORE="mba-ob-classroom-attendance-identity-v1";
const TEACHER_EMAIL="hasanboudlaie@gmail.com";
const MAX_FILE=8*1024*1024;
const messages={session_expired:"نشست شما منقضی شده؛ دوباره وارد اپ شوید.",student_only:"این بخش مخصوص دانشجویان تأییدشده است.",
 teacher_only:"این بخش فقط برای مدرس است.",invalid_session:"شماره جلسه معتبر نیست.",
 invalid_assignment:"عنوان، متن یا فایل تکلیف معتبر نیست.",invalid_attachment:"فقط PDF، DOCX، TXT، JPG یا PNG تا سقف ۸ مگابایت پذیرفته می‌شود.",
 invalid_file_signature:"محتوای فایل با نوع انتخاب‌شده تطبیق ندارد.",too_many_files:"حداکثر ۳ فایل ضمیمه کنید.",
 answer_or_file_required:"حداقل ۸ کاراکتر پاسخ بنویسید یا یک فایل ضمیمه کنید.",
 answer_too_long:"حداکثر ۱۲ هزار کاراکتر مجاز است.",
 upload_failed:"آپلود فایل انجام نشد؛ دوباره امتحان کنید.",
 assignment_already_submitted:"این تکلیف قبلاً ثبت شده و هنوز برای اصلاح باز نشده است.",
 assignment_save_failed:"ثبت تکلیف در سرور انجام نشد.",assignment_list_failed:"دریافت تکالیف انجام نشد.",
 invalid_review:"نمره یا Feedback معتبر نیست.",review_failed:"ثبت ارزیابی انجام نشد.",
 network_error:"ارتباط با سرور برقرار نشد.",server_error:"خطای سرور؛ دوباره امتحان کنید."};
const safe=x=>String(x??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const stamp=x=>x?new Intl.DateTimeFormat("fa-IR",{dateStyle:"medium",timeStyle:"short",timeZone:"Asia/Tehran"}).format(new Date(x)):"—";
const number=x=>Number(x).toLocaleString("fa-IR",{maximumFractionDigits:1});
const size=x=>x>=1048576?(x/1048576).toFixed(1)+" MB":Math.max(1,Math.ceil(x/1024))+" KB";
const label=k=>k==="case"?"تحلیل کیس":"تکلیف فردی";
const stateLabel=s=>s==="reviewed"?"ارزیابی‌شده":s==="revision_requested"?"نیازمند اصلاح":"ثبت‌شده · در انتظار ارزیابی";
const user=()=>{try{return JSON.parse(localStorage.getItem(STORE)||"null")}catch{return null}};
const errorText=e=>messages[e?.message]||"مشکلی در ارتباط با سامانه رخ داد.";
let my=new Map(),items=[],filterSession=0,busy=false;
function myKey(session,kind){return session+"-"+kind}
async function request(action,data={}){
 const token=user()?.token;if(!token)throw Error("session_expired");
 let response,body;
 try{
  response=await fetch(API,{method:"POST",mode:"cors",cache:"no-store",
   headers:{"Content-Type":"application/json"},body:JSON.stringify({action,token,...data})});
  body=await response.json();
 }catch{throw Error("network_error")}
 if(!response.ok||body?.ok===false)throw Error(body?.error||"server_error");
 return body;
}
function attachmentRows(rec,studentMode=false){
 const files=Array.isArray(rec.file_items)?rec.file_items:[];
 return files.length?'<div class="as-attachments"><strong>فایل‌های ضمیمه</strong>'+files.map(x=>
 '<div class="as-attachment"><span>'+safe(x.name)+' · '+size(Number(x.size||0))+'</span>'
 +'<button type="button" class="btn secondary sm" data-as-action="download" data-id="'+safe(rec.id)+'" data-path="'+safe(x.path)+'">دانلود فایل</button></div>').join("")+'</div>':(studentMode?"":'<p class="muted">بدون فایل ضمیمه</p>');
}
function emailHref(session,kind,id){
 const name=user()?.name||"دانشجو";
 const title="تکلیف "+label(kind)+" — مدیریت رفتار سازمانی MBA — جلسه "+session;
 const body="استاد محترم،\nنسخه این تکلیف در سامانه مدیریت رفتار سازمانی علامه ثبت شده است.\nنام دانشجو: "+name+
 "\nجلسه: "+session+"\nنوع تکلیف: "+label(kind)+"\nشناسه ثبت: "+id+
 "\n\nدر صورت نیاز، فایل ضمیمه را از رایانه/گوشی خود به همین ایمیل اضافه و سپس ارسال کنید.\n";
 return "https://mail.google.com/mail/?view=cm&fs=1&to="+encodeURIComponent(TEACHER_EMAIL)+
 "&su="+encodeURIComponent(title)+"&body="+encodeURIComponent(body);
}
function studentHTML(session,kind){
 const id=myKey(session,kind),rec=my.get(id),guest=window.OB_ACCESS?.role==="guest",locked=rec&&rec.status!=="revision_requested";
 const formId="as-"+id;
 return '<section class="as-student card" id="'+formId+'"><div class="as-head"><div><span class="as-caption">Assignment Submission</span><h3>ارسال '+label(kind)+'</h3><p>پاسخ خود را بنویسید یا حداکثر سه فایل ضمیمه کنید.</p></div><span class="as-count">جلسه '+String(session).padStart(2,"0")+'</span></div>'+
 (guest?'<p class="as-alert">مهمان‌ها فقط امکان مشاهده دارند؛ ارسال تکلیف ویژه دانشجویان تأییدشده است.</p>':
 '<div class="as-live" data-as-status="'+id+'">'+(rec?statusHTML(rec,session,kind):'<span>در حال بررسی وضعیت ثبت…</span>')+'</div>'+
 (locked?'':('<form data-as-submit="1" data-session="'+session+'" data-kind="'+kind+'" class="as-form">'+
 '<label for="as-answer-'+id+'">پاسخ تشریحی دانشجو</label>'+
 '<textarea id="as-answer-'+id+'" name="answer" rows="7" maxlength="12000" placeholder="تحلیل خود را با استدلال، شواهد و مفاهیم درس بنویسید…">'+safe(rec?.status==="revision_requested"?rec.answer_text:"")+'</textarea>'+
 '<div class="as-file-control"><label for="as-file-'+id+'">بارگذاری فایل تکلیف (اختیاری)</label><input id="as-file-'+id+'" type="file" name="files" accept=".pdf,.docx,.txt,.jpg,.jpeg,.png" multiple><small>حداکثر ۳ فایل؛ هر فایل تا ۸ مگابایت. فرمت‌های PDF، Word (DOCX)، TXT و تصویر مجازند.</small></div>'+
 '<p class="as-hint">پس از ارسال، متن و فایل‌ها در فضای خصوصی سامانه ثبت می‌شوند. تغییر پاسخ فقط پس از درخواست اصلاح مدرس ممکن است.</p>'+
 '<button type="submit" class="btn gold as-submit">ثبت نهایی و ارسال برای ارزیابی</button>'+
 '<div class="as-form-notice" role="status" aria-live="polite"></div></form>'))+
 (rec?'<div class="as-email"><strong>ارسال نسخه تکلیف به Gmail استاد</strong><p>این گزینه یک پیش‌نویس ایمیل در Gmail شما باز می‌کند. برای ارسال واقعی باید Send را بزنید و اگر فایل دارید، آن را در Gmail نیز ضمیمه کنید.</p><a class="btn secondary" href="'+safe(emailHref(session,kind,rec.id))+'" target="_blank" rel="noopener noreferrer">باز کردن Gmail و تهیه ایمیل</a></div>':""))+'</section>';
}
function statusHTML(rec,session,kind){
 return '<div class="as-status"><span class="as-pill '+safe(rec.status)+'">'+safe(stateLabel(rec.status))+'</span><p>ثبت سروری: '+stamp(rec.submitted_at)+' · نسخه '+rec.revision_no+'</p>'+
 (rec.feedback?'<div class="as-feedback"><strong>بازخورد مدرس</strong><p>'+safe(rec.feedback)+'</p>'+(rec.score!=null?'<strong>نمره: '+number(rec.score)+' از ۲۰</strong>':"")+'</div>':"")+
 attachmentRows(rec,true)+
 (rec.status==="revision_requested"?'<p>می‌توانید متن و فایل اصلاح‌شده را مجدداً ارسال کنید.</p>':'<p>تا زمان ارزیابی یا درخواست اصلاح، این ارسال نهایی است.</p>')+'</div>';
}
async function refreshStudent(session,force=false){
 if(window.OB_ACCESS?.role!=="student"||!Number.isInteger(Number(session)))return;
 if(!force&&my.has(myKey(session,"case"))&&my.has(myKey(session,"homework")))return;
 try{
  const data=await request("mine",{session});
  for(const kind of ["case","homework"])my.set(myKey(session,kind),(data.assignments||[]).find(x=>x.kind===kind)||null);
  for(const kind of ["case","homework"]){
   const root=document.querySelector("#as-"+myKey(session,kind));if(root)root.outerHTML=studentHTML(session,kind);
  }
 }catch(err){for(const kind of ["case","homework"]){const root=document.querySelector("#as-"+myKey(session,kind)+" .as-live");if(root)root.textContent=errorText(err)}}
}
async function submitForm(form){
 const session=Number(form.dataset.session),kind=form.dataset.kind;
 const files=Array.from(form.querySelector('input[type=file]')?.files||[]);
 const text=String(form.querySelector('textarea[name=answer]')?.value||"").trim();
 const notice=form.querySelector(".as-form-notice"),btn=form.querySelector(".as-submit");
 if(text.length<8&&!files.length){if(notice)notice.textContent=messages.answer_or_file_required;return}
 if(files.length>3||files.some(f=>f.size>MAX_FILE)){if(notice)notice.textContent=messages.invalid_attachment;return}
 if(!user()?.token){if(notice)notice.textContent=messages.session_expired;return}
 const fd=new FormData();fd.append("token",user().token);fd.append("session",String(session));fd.append("kind",kind);fd.append("answer",text);
 for(const file of files)fd.append("files",file,file.name);
 if(btn)btn.disabled=true;if(notice)notice.textContent="در حال آپلود فایل‌ها و ثبت تکلیف…";
 try{
  const resp=await fetch(API,{method:"POST",body:fd,cache:"no-store"});
  const data=await resp.json();if(!resp.ok||!data.ok)throw Error(data.error||"assignment_save_failed");
  await refreshStudent(session,true);
  const status=document.querySelector("#as-"+myKey(session,kind)+" .as-live");
  if(status)status.setAttribute("aria-live","polite");
 }catch(e){if(notice)notice.textContent=errorText(e);if(btn)btn.disabled=false}
}
function teacherHTML(){
 return '<section class="as-teacher page"><div class="page-head"><div><span class="as-caption">Submission & Assessment Inbox</span><h2>صندوق تکالیف و فایل‌های دانشجویان</h2><p>تحلیل کیس‌ها و تکالیف فردی هر ۱۶ جلسه؛ همراه با نمره و Feedback</p></div></div>'+
 '<div class="as-toolbar"><label for="as-session">جلسه</label><select id="as-session"><option value="0">همه جلسات</option>'+Array.from({length:16},(_,i)=>'<option value="'+(i+1)+'">جلسه '+(i+1)+'</option>').join("")+'</select>'+
 '<button type="button" class="btn secondary" data-as-action="refresh">تازه‌سازی</button>'+
 '<button type="button" class="btn secondary" data-as-action="csv">دانلود CSV</button></div>'+
 '<div class="as-review-list" id="as-teacher-list"><p>در حال دریافت تکالیف…</p></div></section>';
}
function drawTeacher(){
 const target=document.querySelector("#as-teacher-list");if(!target)return;
 if(busy){target.innerHTML='<p class="as-loading">در حال دریافت تکالیف…</p>';return}
 if(!items.length){target.innerHTML='<div class="card"><p>هنوز تکلیفی ارسال نشده است.</p></div>';return}
 const pending=items.filter(x=>x.status==="submitted").length;
 target.innerHTML='<div class="as-metrics"><span>کل تکالیف: '+items.length+'</span><span>در انتظار بررسی: '+pending+'</span><span>ارزیابی‌شده: '+items.filter(x=>x.status==="reviewed").length+'</span></div>'+
 items.map(x=>'<details class="as-record"><summary><span><strong>'+safe(x.student_name)+'</strong><small>جلسه '+x.session_no+' · '+label(x.kind)+' · شماره دانشجویی '+safe(x.student_number||"—")+'</small></span><span class="as-pill '+safe(x.status)+'">'+safe(stateLabel(x.status))+(x.score!=null?' · '+number(x.score)+'/۲۰':"")+'</span></summary>'+
 '<div class="as-record-body"><p class="as-date">تاریخ ارسال: '+stamp(x.submitted_at)+' · نسخه '+x.revision_no+'</p><div class="as-text-answer"><strong>پاسخ دانشجو</strong><p>'+safe(x.answer_text||"—")+'</p></div>'+
 attachmentRows(x)+'<form data-as-review="'+safe(x.id)+'" class="as-review-form"><h4>ارزیابی مدرس</h4><label>نوع ارزیابی<select name="decision"><option value="reviewed">ثبت نمره و بازخورد</option><option value="revision_requested">درخواست اصلاح</option></select></label>'+
 '<label>نمره (از ۲۰)<input name="score" type="number" min="0" max="20" step="0.5" value="'+(x.score??"")+'"></label>'+
 '<label>Feedback تخصصی<textarea name="feedback" rows="4" minlength="8" maxlength="3000" required>'+safe(x.feedback||"")+'</textarea></label><button type="submit" class="btn gold">ثبت ارزیابی در سامانه</button><p class="as-form-notice" role="status"></p></form></div></details>').join("");
 const sel=document.querySelector("#as-session");if(sel)sel.value=String(filterSession);
}
async function refreshTeacher(session=filterSession){
 if(window.OB_ACCESS?.role!=="teacher")return;
 filterSession=Number(session)||0;busy=true;drawTeacher();
 try{const result=await request("list",{session:filterSession});items=result.assignments||[];busy=false;drawTeacher()}
 catch(err){busy=false;const root=document.querySelector("#as-teacher-list");if(root)root.innerHTML='<p class="as-error">'+safe(errorText(err))+'</p>'}
}
function csv(){
 const cols=[["جلسه","نوع تکلیف","نام","شماره دانشجویی","وضعیت","نسخه","نمره","بازخورد","پاسخ","تاریخ","فایل‌ها"]];
 const cell=v=>{let s=String(v??"");if(/^[=+\-@\t\r]/.test(s))s="'"+s;return '"'+s.replace(/"/g,'""')+'"'};
 for(const x of items)cols.push([x.session_no,label(x.kind),x.student_name,x.student_number,stateLabel(x.status),x.revision_no,x.score??"",x.feedback||"",x.answer_text,x.submitted_at,(x.file_items||[]).map(i=>i.name).join("; ")]);
 const url=URL.createObjectURL(new Blob(["\ufeff"+cols.map(r=>r.map(cell).join(",")).join("\r\n")],{type:"text/csv;charset=utf-8"}));
 const a=document.createElement("a");a.href=url;a.download="MBA-OB-Assignments.csv";a.click();setTimeout(()=>URL.revokeObjectURL(url),2000);
}
document.addEventListener("submit",async e=>{
 const sf=e.target.closest?.("form[data-as-submit]");if(sf){e.preventDefault();await submitForm(sf);return}
 const form=e.target.closest?.("form[data-as-review]");if(!form)return;
 e.preventDefault();if(window.OB_ACCESS?.role!=="teacher")return;
 const fd=new FormData(form),decision=String(fd.get("decision")||""),feedback=String(fd.get("feedback")||"").trim();
 const raw=String(fd.get("score")||"").trim(),score=decision==="reviewed"?Number(raw):null;
 const notice=form.querySelector(".as-form-notice"),btn=form.querySelector("button[type=submit]");
 if(decision==="reviewed"&&(!raw||!Number.isFinite(score)||score<0||score>20)){if(notice)notice.textContent="نمره بین ۰ تا ۲۰ وارد کنید.";return}
 if(feedback.length<8){if(notice)notice.textContent="Feedback حداقل ۸ کاراکتر باشد.";return}
 if(btn)btn.disabled=true;if(notice)notice.textContent="در حال ثبت ارزیابی…";
 try{await request("review",{id:form.dataset.asReview,decision,score,feedback});await refreshTeacher(filterSession)}
 catch(err){if(notice)notice.textContent=errorText(err);if(btn)btn.disabled=false}
});
document.addEventListener("change",e=>{
 if(e.target?.id==="as-session")refreshTeacher(Number(e.target.value)||0);
 if(e.target?.matches?.(".as-review-form select[name=decision]")){
  const input=e.target.closest("form")?.querySelector('input[name=score]');
  if(input){input.disabled=e.target.value==="revision_requested";input.required=e.target.value==="reviewed";}
 }
});
document.addEventListener("click",async e=>{
 const b=e.target.closest?.("[data-as-action]");if(!b)return;
 if(b.dataset.asAction==="refresh")refreshTeacher(filterSession);
 if(b.dataset.asAction==="csv")csv();
 if(b.dataset.asAction==="download"){
  b.disabled=true;
  try{const res=await request("fileUrl",{id:b.dataset.id,path:b.dataset.path});
   const a=document.createElement("a");a.href=res.url;a.target="_blank";a.rel="noopener noreferrer";a.click();
  }catch(err){alert(errorText(err))}finally{b.disabled=false}
 }
});
window.OB_ASSIGNMENTS={studentHTML,refreshStudent,teacherHTML,refreshTeacher};
})();
