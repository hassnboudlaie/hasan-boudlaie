/* Private classroom quizzes: one-time submission, server grading; session 1 reviews visible immediately after submission. */
(()=>{
"use strict";
const API="https://hxcjkewlaniahvuqwwbb.supabase.co/functions/v1/mba-ob-quizzes",KEY="mba-ob-classroom-attendance-identity-v1",MAIL="hasanboudlaie@gmail.com";
const safe=v=>String(v??"").replace(/[&<>"']/g,c=>c==="&"?"&amp;":c==="<"?"&lt;":c===">"?"&gt;":c==='"'?"&quot;":"&#39;");
const digits=n=>Number(n).toLocaleString("fa-IR");
const date=t=>t?new Intl.DateTimeFormat("fa-IR",{dateStyle:"medium",timeStyle:"short",timeZone:"Asia/Tehran"}).format(new Date(t)):"—";
const local=t=>{if(!t)return "";const d=new Date(t),pad=x=>String(x).padStart(2,"0");return d.getFullYear()+"-"+pad(d.getMonth()+1)+"-"+pad(d.getDate())+"T"+pad(d.getHours())+":"+pad(d.getMinutes())};
const errors={session_expired:"برای ادامه دوباره وارد حساب خود شوید.",student_only:"فقط دانشجویان تأییدشده می‌توانند آزمون بدهند.",teacher_only:"این قسمت مخصوص مدرس است.",invalid_answers:"به هر ده سؤال پاسخ بدهید.",quiz_closed:"مهلت ۲۴ساعته آزمون به پایان رسیده است.",already_submitted:"پاسخ شما قبلاً ثبت نهایی شده است.",question_bank_incomplete:"بانک سؤالات این جلسه هنوز تکمیل نشده است.",schedule_locked_after_attempt:"پس از نخستین ارسال، زمان آزمون قابل جابه‌جایی نیست.",invalid_time:"تاریخ و زمان پایان جلسه معتبر نیست.",unscheduled:"مدرس هنوز زمان پایان جلسه را تعیین نکرده است."};
let cache=new Map(),teacherStatus=null,teacherSession=1,roster=null,profile=null;
function cred(){try{return JSON.parse(localStorage.getItem(KEY)||"null")}catch{return null}}
async function request(action,payload={}){
 const token=cred()?.token;if(!token)throw Error("session_expired");
 const response=await fetch(API,{method:"POST",mode:"cors",headers:{"Content-Type":"application/json"},cache:"no-store",body:JSON.stringify({action,token,...payload})});
 const result=await response.json();if(!response.ok||!result.ok)throw Error(result.error||"server_error");
 return result;
}
const error=e=>errors[e?.message]||"ارتباط با سامانه آزمون برقرار نشد. دوباره تلاش کنید.";
function emailHref(session,id){
 const name=cred()?.name||"دانشجو";
 const subj="رسید آزمون رفتار سازمانی MBA — جلسه "+session;
 const body="استاد محترم،\nآزمون پایان جلسه در سامانه به صورت رسمی ثبت شد.\nنام: "+name+"\nجلسه: "+session+"\nشناسه ثبت: "+id+"\nپاسخ‌ها و نمره در داشبورد مدرس قابل مشاهده خواهند بود.\n";
 return "https://mail.google.com/mail/?view=cm&fs=1&to="+encodeURIComponent(MAIL)+"&su="+encodeURIComponent(subj)+"&body="+encodeURIComponent(body);
}
function studentHTML(session){
 if(window.OB_ACCESS?.role==="guest")return '<section class="quiz-portal"><h3>آزمون پایان جلسه</h3><p class="quiz-locked">مهمان‌ها می‌توانند محتوای آموزشی را ببینند؛ شرکت در آزمون و ثبت نمره فقط برای دانشجویان تأییدشده است.</p></section>';
 return '<section class="quiz-portal" id="quizPortal" data-quiz-session="'+session+'"><div class="quiz-portal-header"><div><span class="quiz-eyebrow">End-of-Session Assessment</span><h3>آزمون پایانی جلسه '+digits(session)+'</h3><p>۱۰ سؤال چهارگزینه‌ای · ۲۰ نمره · فقط یک بار ثبت نهایی</p>'+(Number(session)===1?'<p>پس از پاسخ به هر ۱۰ سؤال و ثبت نهایی، نمره قطعی و پاسخنامه تشریحی بلافاصله در همین صفحه و پرونده آموزشی شما ثبت و نمایش داده می‌شود.</p>':'')+'</div><span class="quiz-window-tag">مهلت ۲۴ساعته</span></div><div id="quizPortalContent" class="quiz-content"><p>در حال بررسی وضعیت آزمون و مهلت پاسخ‌گویی…</p></div></section>';
}
function studentView(s){
 const a=s.attempt;
 const windowInfo=s.opens_at?'<p class="quiz-window-details"><strong>شروع:</strong> '+date(s.opens_at)+' <strong>پایان مهلت:</strong> '+date(s.closes_at)+'</p>':"";
 if(a){
  return '<div class="quiz-confirm"><h4>پاسخ‌ها ثبت نهایی شدند</h4><p>شناسه ثبت: <code dir="ltr">'+safe(a.id)+'</code></p><p>تاریخ: '+date(a.submitted_at)+'</p>'+
  (a.score!=null?'<strong>نمره قطعی: '+digits(a.score)+' از ۲۰ · '+digits(a.correct_count)+' پاسخ درست از ۱۰ سؤال</strong><details class="quiz-review" open><summary>مشاهده پاسخنامه تشریحی و ارزیابی تک‌تک سؤال‌ها</summary>'+a.review.map(q=>'<div class="quiz-answer-review"><strong>سؤال '+digits(q.no)+': '+safe(q.text||"")+'</strong><p>پاسخ شما: '+safe(q.options?.[q.answer]||("گزینه "+digits(q.answer+1)))+'</p><p>پاسخ صحیح: '+safe(q.options?.[q.correct_index]||("گزینه "+digits(q.correct_index+1)))+'</p><p><strong>توضیح علمی:</strong> '+safe(q.explanation)+'</p></div>').join("")+'</details>':'<p>نمره و پاسخنامه پس از پایان مهلت آزمون نمایش داده می‌شوند.</p>')+
  windowInfo+'<p>این تکلیف در پرونده آموزشی شما و صفحه ارزیابی مدرس ثبت شده است.</p><p class="quiz-mail-help">در صورت نیاز، برای ارسال رسید به Gmail استاد از گزینه زیر استفاده کنید؛ خودتان باید دکمه Send را بزنید.</p><a href="'+safe(emailHref(s.session,a.id))+'" target="_blank" rel="noopener noreferrer" class="quiz-mail">تهیه ایمیل رسید برای استاد</a></div>';
 }
 if(s.status==="not_ready")return '<p class="quiz-locked">سؤالات این جلسه هنوز با محتوای پاورپوینت نهایی تطبیق داده نشده‌اند؛ آزمون فعال نیست.</p>';
 if(s.status==="unscheduled")return '<p class="quiz-locked">بانک ۱۰ سؤال آماده است. آزمون بعد از ثبت زمان پایان کلاس توسط مدرس فعال می‌شود.</p>';
 if(s.status==="upcoming")return '<p class="quiz-locked">آزمون هنوز شروع نشده است.</p>'+windowInfo;
 if(s.status==="closed")return '<p class="quiz-locked">مهلت این آزمون به پایان رسیده و پاسخ جدید پذیرفته نمی‌شود.</p>'+windowInfo;
 return windowInfo+'<form id="quizFinalForm" data-quiz-session="'+s.session+'" class="quiz-questions">'+s.questions.map((q,i)=>
 '<fieldset class="quiz-question"><legend><span class="quiz-question-no">سؤال '+digits(i+1)+'</span> '+safe(q.text)+'</legend>'+
 q.options.map((v,j)=>'<label class="quiz-option"><input type="radio" name="q'+i+'" value="'+j+'" required><span><b>'+["الف","ب","ج","د"][j]+'.</b> '+safe(v)+'</span></label>').join("")+'</fieldset>').join("")+
 '<p class="quiz-final-warning">بعد از ثبت نهایی، امکان ویرایش پاسخ‌ها وجود ندارد. قبل از ارسال، هر ۱۰ سؤال را بررسی کنید.</p><p class="quiz-form-status" id="quizCompletion" role="status" aria-live="polite">۰ از ۱۰ سؤال پاسخ داده شده است.</p><button type="submit" class="quiz-submit" disabled>ثبت نهایی پاسخ‌های ۱۰ سؤال</button><p class="quiz-form-status" role="status" aria-live="polite"></p></form>';
}
async function refreshStudent(session){
 const el=document.getElementById("quizPortalContent");if(!el||Number(el.closest("#quizPortal")?.dataset.quizSession)!==Number(session))return;
 try{const data=await request("get",{session});cache.set(session,data);if(el.isConnected)el.innerHTML=studentView(data)}
 catch(e){if(el.isConnected)el.innerHTML='<p class="quiz-error">'+safe(error(e))+'</p>'}
}
async function submit(form){
 const session=Number(form.dataset.quizSession);
 const answers=Array.from({length:10},(_,i)=>{const el=form.querySelector('input[name="q'+i+'"]:checked');return el?Number(el.value):null});
 const status=form.querySelector(".quiz-form-status");
 if(answers.some(x=>x===null)){status.textContent="برای ثبت نهایی، باید به همه ده سؤال پاسخ بدهید.";return}
 if(!confirm("پاسخ‌های این آزمون فقط یک بار قابل ثبت‌اند. ثبت نهایی انجام شود؟"))return;
 const btn=form.querySelector(".quiz-submit");btn.disabled=true;status.textContent="در حال ثبت امن پاسخ‌ها…";
 try{await request("submit",{session,answers});await refreshStudent(session);await refreshProfile();}
 catch(e){status.textContent=error(e);btn.disabled=false}
}
function profileHTML(){
 return '<section class="quiz-profile" id="obQuizProfile"><h3>پرونده آزمون‌های پایان جلسه</h3><p>نمره نهایی جلسه اول بلافاصله پس از ثبت ۱۰ پاسخ نمایش داده می‌شود؛ نمره سایر جلسات طبق زمان‌بندی آن‌ها منتشر می‌شود.</p><div id="obQuizProfileContents">در حال دریافت سوابق…</div></section>';
}
async function refreshProfile(){
 const t=document.getElementById("obQuizProfileContents");if(!t)return;
 try{const v=await request("my");profile=v; if(!t.isConnected)return;t.innerHTML=v.attempts.length?'<div class="quiz-profile-list">'+v.attempts.map(a=>
 '<div class="quiz-profile-row"><span>جلسه '+digits(a.session)+'<small> · ثبت: '+date(a.submitted_at)+'</small></span><strong>'+(a.score!=null?digits(a.score)+' / ۲۰':'در انتظار پایان مهلت')+'</strong></div>').join("")+'</div>':'<p>هنوز آزمون پایان جلسه‌ای ثبت نکرده‌اید.</p>'}
 catch(e){if(t.isConnected)t.textContent=error(e)}
}

let previewCache=new Map();
function previewMarkup(data){
 const n=Number(data?.question_count||0),rows=Array.isArray(data?.questions)?data.questions:[];
 if(!n)return '<p class="quiz-locked">برای این جلسه هنوز بانک آزمون تأییدشده ثبت نشده است. پس از تکمیل پاورپوینت جلسه، بانک ۱۰ سؤال طراحی می‌شود.</p>';
 return '<div class="quiz-preview-heading"><strong>پیش‌نمایش آزمون جلسه '+digits(data.session)+' · '+digits(n)+' سؤال از ۱۰</strong><small>فقط مدرس؛ کلید پاسخ و توضیح علمی برای دانشجو پیش از ثبت نهایی نمایش داده نمی‌شوند.</small></div>'+
 '<div class="quiz-preview-list">'+rows.map(q=>'<details class="quiz-preview-question"><summary><strong>سؤال '+digits(q.no)+'</strong> '+safe(q.text)+'</summary><div class="quiz-preview-options">'+q.options.map((option,j)=>
 '<p class="quiz-preview-option '+(j===q.correct_index?'is-correct':'')+'"><strong>'+["الف","ب","ج","د"][j]+'.</strong> '+safe(option)+(j===q.correct_index?' <span class="quiz-preview-key">پاسخ صحیح</span>':'')+'</p>').join("")+
 '</div><div class="quiz-preview-explanation"><strong>پاسخنامه تشریحی:</strong> '+safe(q.explanation)+'</div></details>').join("")+'</div>';
}
async function refreshTeacherPreview(session){
 const nodes=[...document.querySelectorAll('[data-quiz-teacher-preview="'+Number(session)+'"]')];
 if(!nodes.length||window.OB_ACCESS?.role!=="teacher")return;
 nodes.forEach(node=>{if(!previewCache.has(session))node.innerHTML='<p class="quiz-preview-loading">در حال دریافت آزمون ۱۰سؤالی از سامانه امن مدرس…</p>'});
 try{
  let preview=previewCache.get(session);
  if(!preview){preview=await request("teacherPreview",{session});previewCache.set(session,preview)}
  for(const node of nodes)if(node.isConnected)node.innerHTML=previewMarkup(preview);
 }catch(e){
  for(const node of nodes)if(node.isConnected)node.innerHTML='<p class="quiz-error">'+safe(error(e))+'</p>';
 }
}

function teacherHTML(){
 return '<section class="quiz-teacher" id="obQuizTeacher"><div class="quiz-portal-header"><div><span class="quiz-eyebrow">Instructor Assessment Console</span><h2>آزمون‌های ۲۴ساعته پایان جلسه</h2><p>انتشار زمان پایان کلاس، مشاهده پاسخ‌ها و پرونده ارزیابی دانشجویان</p></div></div>'+
 '<div class="quiz-admin-panel"><label>انتخاب جلسه<select id="quizTeacherSession">'+Array.from({length:16},(_,i)=>'<option value="'+(i+1)+'">جلسه '+digits(i+1)+'</option>').join("")+'</select></label>'+
 '<label>تاریخ و ساعت پایان واقعی کلاس<input id="quizClassEnd" type="datetime-local"></label>'+
 '<button type="button" class="quiz-submit" data-quiz-action="schedule">فعال‌سازی آزمون برای ۲۴ ساعت پس از پایان کلاس</button><p id="quizTeacherNote" role="status"></p></div>'+
 '<div id="quizTeacherStatus">در حال دریافت وضعیت بانک سؤالات و آزمون‌ها…</div>'+
 '<section class="quiz-teacher-bank"><h3>پیش‌نمایش کامل آزمون و کلید پاسخ — مخصوص مدرس</h3><div id="quizTeacherPreview" data-quiz-teacher-preview="1">در حال دریافت سؤالات…</div></section>'+
 '<h3>پاسخ‌ها و ارزیابی دانشجویان</h3><div id="quizTeacherRoster">ابتدا جلسه را انتخاب کنید.</div></section>';
}
function drawTeacher(){
 const target=document.getElementById("quizTeacherStatus");if(!target||!teacherStatus)return;
 const q=teacherStatus.sessions.find(x=>x.session===teacherSession);
 if(!q)return;
 target.innerHTML='<div class="quiz-admin-metrics"><span>بانک سؤال: <strong>'+digits(q.question_count)+' / ۱۰</strong></span><span>ارسال‌های دانشجویان: <strong>'+digits(q.attempt_count)+'</strong></span></div>'+
 (q.opens_at?'<p>شروع: '+date(q.opens_at)+' | پایان: '+date(q.closes_at)+'</p>':'<p>برای این جلسه هنوز زمان پایان کلاس ثبت نشده است.</p>')+
 (q.question_count!==10?'<p class="quiz-error">بانک سؤالات این جلسه ناقص است. آزمون را قبل از هم‌ترازی با اسلایدها فعال نکنید.</p>':"")+
 (q.attempt_count>0?'<p>به دلیل ثبت پاسخ دانشجو، زمان آزمون قفل است.</p>':"");
 const dateInput=document.getElementById("quizClassEnd");if(dateInput)dateInput.value=local(q.opens_at);
}
async function refreshTeacher(){
 if(!document.getElementById("obQuizTeacher"))return;
 try{teacherStatus=await request("teacherStatus");drawTeacher();await Promise.all([refreshRoster(),refreshTeacherPreview(teacherSession)])}
 catch(e){const t=document.getElementById("quizTeacherStatus");if(t)t.textContent=error(e)}
}
async function refreshRoster(){
 const el=document.getElementById("quizTeacherRoster");if(!el)return;
 el.textContent="در حال دریافت پاسخ‌های دانشجویان…";
 try{
  roster=await request("list",{session:teacherSession});if(!el.isConnected)return;
  el.innerHTML=roster.attempts.length?roster.attempts.map(a=>
  '<details class="quiz-student-record"><summary><strong>'+safe(a.student_name)+'</strong><span>شماره دانشجویی '+safe(a.student_number)+' · '+digits(a.score)+'/۲۰ · '+digits(a.correct_count)+'/۱۰</span></summary>'+
  '<p>ثبت: '+date(a.submitted_at)+'</p>'+
  a.details.map((d,i)=>'<div class="quiz-answer-review"><strong>سؤال '+digits(i+1)+': '+safe(roster.questions[i]?.text||"")+'</strong><p>پاسخ دانشجو: '+safe(roster.questions[i]?.options[d.answer]||"")+'</p><p>پاسخ صحیح: '+safe(roster.questions[i]?.options[d.correct_index]||"")+'</p><small>'+safe(d.explanation)+'</small></div>').join("")+'</details>').join(""):'<p>هنوز پاسخی از دانشجویان برای این جلسه ثبت نشده است.</p>';
 }catch(e){if(el.isConnected)el.textContent=error(e)}
}
async function schedule(){
 const note=document.getElementById("quizTeacherNote"),time=document.getElementById("quizClassEnd")?.value;
 if(!time||Number.isNaN(new Date(time).getTime())){if(note)note.textContent="تاریخ و ساعت پایان کلاس را مشخص کنید.";return}
 if(!confirm("آزمون جلسه "+teacherSession+" از زمان پایان کلاس به مدت دقیقاً ۲۴ ساعت باز شود؟"))return;
 if(note)note.textContent="در حال تنظیم بازه ۲۴ساعته…";
 try{await request("schedule",{session:teacherSession,opens_at:new Date(time).toISOString()});if(note)note.textContent="مهلت ۲۴ساعته آزمون با موفقیت ثبت شد.";await refreshTeacher()}
 catch(e){if(note)note.textContent=error(e)}
}
document.addEventListener("submit",e=>{const form=e.target;if(form?.id!=="quizFinalForm")return;e.preventDefault();submit(form)});
document.addEventListener("click",e=>{const b=e.target.closest("[data-quiz-action]");if(b?.dataset.quizAction==="schedule")schedule()});
document.addEventListener("change",e=>{if(e.target?.id==="quizTeacherSession"){teacherSession=Number(e.target.value);drawTeacher();const preview=document.getElementById("quizTeacherPreview");if(preview){preview.dataset.quizTeacherPreview=String(teacherSession);preview.innerHTML="در حال دریافت آزمون این جلسه…"}refreshRoster();refreshTeacherPreview(teacherSession)}if(e.target?.matches?.("#quizFinalForm input[type=radio]")){const form=e.target.closest("#quizFinalForm");const count=Array.from({length:10},(_,i)=>form.querySelector('input[name="q'+i+'"]:checked')).filter(Boolean).length;const progress=form.querySelector("#quizCompletion"),btn=form.querySelector(".quiz-submit");if(progress)progress.textContent=digits(count)+" از ۱۰ سؤال پاسخ داده شده است."+(count===10?" آماده ثبت نهایی.":"");if(btn)btn.disabled=count!==10}});
window.OB_QUIZ={studentHTML,refreshStudent,profileHTML,refreshProfile,teacherHTML,refreshTeacher,refreshTeacherPreview};
})();