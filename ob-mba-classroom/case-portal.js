/* Allameh MBA — server-backed case submissions & instructor assessments.
   Device-local workbook is the draft; only explicit "Submit" sends data to Supabase.
   Private submissions/grades are accessible only through server-checked student/teacher tokens. */
(()=>{
"use strict";
const API="https://hxcjkewlaniahvuqwwbb.supabase.co/functions/v1/mba-ob-attendance";
const KEY="mba-ob-classroom-attendance-identity-v1";
const fields=["problem","evidence","levels","explain","intervention","measurement"];
const errorNames={approval_required:"عضویت شما هنوز تأیید نشده است.",case_already_submitted:"این تکلیف قبلاً ارسال شده است.",
 incomplete_case_answer:"یکی از شش بخش تحلیل ناقص است.",invalid_case_answers:"پاسخ‌ها را در هر شش بخش کامل کنید.",
 invalid_case_review:"نمره یا توضیح ارزیابی معتبر نیست.",session_expired:"دوباره وارد حساب خود شوید.",
 case_submission_failed:"ثبت پاسخ در سرور انجام نشد.",case_review_failed:"ثبت نمره انجام نشد.",
 network_error:"ارتباط با سرور برقرار نشد. پس از اتصال دوباره اقدام کنید."};
const esc=x=>String(x??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const date=v=>v?new Intl.DateTimeFormat("fa-IR",{dateStyle:"medium",timeStyle:"short",timeZone:"Asia/Tehran"}).format(new Date(v)):"—";
const digit=n=>Number(n).toLocaleString("fa-IR",{maximumFractionDigits:1});
let my=new Map(),teacherItems=[],teacherSession=0,teacherBusy=false;
function credential(){
 try{return JSON.parse(localStorage.getItem(KEY)||"null")}catch{return null}
}
async function request(action,extra={}){
 const user=credential();
 if(!user?.token)throw Error("session_expired");
 const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),18000);
 try{
  const resp=await fetch(API,{method:"POST",mode:"cors",cache:"no-store",
   headers:{"Content-Type":"application/json"},body:JSON.stringify({action,token:user.token,...extra}),signal:controller.signal});
  const obj=await resp.json();
  if(!resp.ok||obj.ok===false)throw Error(obj.error||"server_error");
  return obj;
 }catch(e){
  if(e?.name==="AbortError"||e instanceof TypeError)throw Error("network_error");
  throw e;
 }finally{clearTimeout(timer)}
}
const explain=e=>errorNames[e?.message]||"خطا در ارتباط با سامانه. دوباره تلاش کنید.";
function statusHTML(lesson){
  if(window.OB_ACCESS?.role==="guest")return '<p class="case-hint">حالت بازدید مهمان: این بخش برای آشنایی با فرایند تحلیل کیس قابل مشاهده است. ارسال رسمی تکلیف، بازخورد خصوصی و نمره‌دهی مخصوص دانشجویان تأییدشده است.</p>';
 const state=my.get(lesson);
 if(!state)return '<p class="case-network-status">در حال بررسی وضعیت تکلیف…</p>';
 const rec=state.submission;
 if(!rec)return '<span class="case-status-pill">پیش‌نویس · ارسال‌نشده</span><p class="case-hint">پس از تکمیل شش مرحله، تکلیف را برای ارزیابی مدرس ارسال کنید.</p><button type="button" class="case-submit-btn" data-action="submitCase">ثبت نهایی و ارسال برای استاد</button>';
 const history=(state.history||[]).map(h=>'<li><strong>'+esc(h.decision==="reviewed"?"ارزیابی شده":"نیازمند اصلاح")+'</strong> · '+date(h.reviewed_at)+(h.score!==null?' · '+digit(h.score)+' از ۲۰':"")+'<p>'+esc(h.feedback)+'</p></li>').join("");
 const common='<span class="case-status-pill '+(rec.status==="reviewed"?"approved":rec.status==="revision_requested"?"revision":"pending")+'">'+esc(rec.status==="reviewed"?"ارزیابی‌شده":rec.status==="revision_requested"?"نیازمند اصلاح":"ارسال‌شده · در انتظار ارزیابی")+'</span><p class="case-hint">ثبت در سرور: '+date(rec.submitted_at)+'</p>';
 const feedback=rec.feedback?'<div class="case-feedback"><strong>بازخورد مدرس</strong><p>'+esc(rec.feedback)+'</p>'+(rec.score!==null?'<strong>نمره: '+digit(rec.score)+' از ۲۰</strong>':"")+'</div>':"";
 return common+feedback+(rec.status==="revision_requested"?'<p class="case-hint">شش پاسخ را اصلاح کنید و نسخه جدید را بفرستید.</p><button type="button" class="case-submit-btn" data-action="submitCase">ارسال نسخه اصلاح‌شده</button>':"")+(history?'<details class="case-history"><summary>سوابق ارزیابی</summary><ol>'+history+'</ol></details>':"");
}
function drawStudent(lesson){
 const target=document.getElementById("caseSubmitStatus");
 if(target&&Number(target.dataset.session)===lesson)target.innerHTML=statusHTML(lesson);
}
async function refreshStudent(lesson,force=false){
  if(window.OB_ACCESS?.role==="guest"){drawStudent(Number(lesson));return;}
 if(![1,2].includes(Number(lesson)))return;
 if(!force&&my.has(lesson)){drawStudent(lesson);return}
 try{const response=await request("caseMy",{session:Number(lesson)});my.set(Number(lesson),response);drawStudent(Number(lesson))}
 catch(e){const elem=document.querySelector("#caseSubmitStatus");if(elem)elem.textContent=explain(e)}
}
async function submitCase(lesson,work){
  if(window.OB_ACCESS?.role==="guest")return false;
 const node=document.getElementById("caseSubmitStatus");
 const values={};
 for(const key of fields){
  const value=String(work?.guidedAnswers?.["case-"+key]||"").trim();
  if(value.length<8){if(node)node.innerHTML='<p class="case-error">شش بخش چارچوب را کامل کنید؛ بخش «'+esc(key)+'» هنوز پاسخ کافی ندارد.</p>';return false}
  values[key]=value;
 }
 if(node){node.innerHTML='<p class="case-network-status">در حال ارسال پاسخ به سرور…</p>'}
 try{
  await request("caseSubmit",{session:Number(lesson),answers:values});
  await refreshStudent(lesson,true);return true;
 }catch(e){
  if(node)node.innerHTML='<p class="case-error">'+esc(explain(e))+'</p><button type="button" class="case-submit-btn" data-action="submitCase">تلاش مجدد</button>';
  return false;
 }
}
const teacherHTML=()=>'<section class="page case-review-page"><div class="page-head"><div><h2>ارزیابی تحلیل کیس‌ها</h2><p>ثبت رسمی تکلیف و نمره هر دانشجو</p></div></div><div class="case-teacher-toolbar"><label for="caseLessonSelect">جلسه</label><select id="caseLessonSelect"><option value="0">همه جلسات</option><option value="1">جلسه ۱</option><option value="2">جلسه ۲</option></select><button type="button" class="btn secondary" data-case-action="refresh">تازه‌سازی</button><button type="button" class="btn secondary" data-case-action="download">خروجی CSV</button></div><div id="caseTeacherRoot" class="case-review-list"><p class="case-network-status">در حال دریافت تکالیف…</p></div></section>';
const frameworkFor=id=>(window.OB_LESSON_ENRICHMENT?.sessions||[]).find(s=>s.id===id)?.caseFramework?.steps||[];
const studentFields=item=>{
 const steps=frameworkFor(item.session_no);
 return '<div class="case-response-list">'+steps.map(s=>'<div class="case-response-row"><strong>'+esc(s.title)+'</strong><p>'+esc(item.answers?.[s.key]||"—")+'</p><small>'+esc(s.rubric||"")+' · '+s.points+' امتیاز</small></div>').join("")+'</div>';
};
function drawTeacher(){
 const target=document.querySelector("#caseTeacherRoot");if(!target)return;
 if(teacherBusy){target.innerHTML='<p class="case-network-status">در حال دریافت تکالیف…</p>';return}
 const rows=teacherItems;
 if(!rows.length){target.innerHTML='<div class="card"><h3>هنوز تکلیفی ارسال نشده است.</h3></div>';return}
 const submitted=rows.filter(x=>x.status==="submitted").length;
 const reviewed=rows.filter(x=>x.status==="reviewed").length;
 const head='<div class="case-grade-summary"><span>کل پاسخ‌ها: '+rows.length+'</span><span>در انتظار بررسی: '+submitted+'</span><span>ارزیابی‌شده: '+reviewed+'</span></div>';
 const entries=rows.map(x=>{
  const label=x.status==="reviewed"?"ارزیابی‌شده":x.status==="revision_requested"?"در انتظار اصلاح":"منتظر ارزیابی";
  return '<details class="case-student-record" data-submission="'+esc(x.id)+'"><summary><span><strong>'+esc(x.student_name)+'</strong><small>کد دانشجویی: '+esc(x.student_number||"—")+' · جلسه '+x.session_no+' · نسخه '+x.revision_no+'</small></span><span class="case-grade-chip">'+esc(label)+(x.score!==null?" · "+digit(x.score)+"/۲۰":"")+'</span></summary><div class="case-student-record-inner"><p class="case-submission-date">ارسال: '+date(x.submitted_at)+'</p>'+studentFields(x)+
  '<form class="case-review-form" data-case-review="'+esc(x.id)+'"><h4>ارزیابی مدرس</h4><label>نتیجه<select name="decision" required><option value="reviewed">ثبت نمره</option><option value="revision_requested">درخواست اصلاح</option></select></label><label>نمره از ۲۰<input type="number" name="score" min="0" max="20" step="0.5" value="'+(x.score??"")+'" placeholder="۰ تا ۲۰" required></label><label>بازخورد استاد<textarea name="feedback" rows="4" minlength="8" maxlength="3000" required>'+esc(x.feedback||"")+'</textarea></label><button type="submit" class="btn gold">ثبت در سوابق</button></form><button class="case-history-btn" data-case-action="history" data-id="'+esc(x.id)+'" type="button">سوابق قبلی این دانشجو</button><div id="caseHistory-'+esc(x.id)+'" class="case-history-content"></div></div></details>';
 }).join("");
 target.innerHTML=head+entries;
}
async function refreshTeacher(lesson=teacherSession){
 if(credential()?.role!=="teacher")return;
 teacherSession=lesson;teacherBusy=true;drawTeacher();
 try{
  const data=await request("caseList",{session:lesson});
  teacherItems=data.submissions||[];
 }catch(e){
  const element=document.querySelector("#caseTeacherRoot");if(element)element.innerHTML='<p class="case-error">'+esc(explain(e))+'</p>';
  teacherBusy=false;return;
 }
 teacherBusy=false;drawTeacher();
 const filter=document.querySelector("#caseLessonSelect");if(filter)filter.value=String(teacherSession);
}
function csv(){
 const cols=[["جلسه","نام","کد دانشجویی","نسخه","وضعیت","نمره از ۲۰","تاریخ ارسال","بازخورد مدرس","تعریف مسئله","شواهد و فرضیه‌ها","مفاهیم/سطوح","تبیین","مداخله","سنجش"]];
 const clean=x=>{let v=String(x??"");if(/^[=+\-@\t\r]/.test(v))v="'"+v;return '"'+v.replace(/"/g,'""')+'"'};
 for(const x of teacherItems)cols.push([x.session_no,x.student_name,x.student_number,x.revision_no,x.status,x.score??"",x.submitted_at,x.feedback||"",...fields.map(k=>x.answers?.[k]||"")]);
 const uri=URL.createObjectURL(new Blob(["\ufeff"+cols.map(r=>r.map(clean).join(",")).join("\r\n")],{type:"text/csv;charset=utf-8"}));
 const el=document.createElement("a");el.href=uri;el.download="MBA-OB-Case-Reviews-"+(teacherSession||"all")+".csv";el.click();
 setTimeout(()=>URL.revokeObjectURL(uri),3000);
}
document.addEventListener("change",e=>{
 const el=e.target;if(el?.id==="caseLessonSelect")refreshTeacher(Number(el.value)||0);
 if(el?.matches?.(".case-review-form select[name=decision]")){
  const input=el.closest("form")?.querySelector('input[name=score]');
  if(input){input.disabled=el.value==="revision_requested";input.required=el.value==="reviewed";}
 }
});
document.addEventListener("submit",async e=>{
 const form=e.target.closest?.("form[data-case-review]");if(!form)return;
 e.preventDefault();
 const data=new FormData(form),id=form.dataset.caseReview,decision=String(data.get("decision")||""),feedback=String(data.get("feedback")||"").trim();
 const rawScore=String(data.get("score")??"").trim(),score=decision==="reviewed"?Number(rawScore):null,btn=form.querySelector("button[type=submit]");
 if(decision==="reviewed"&&(!rawScore||!Number.isFinite(score)||score<0||score>20)){alert("نمره را بین ۰ تا ۲۰ وارد کنید.");return}
 if(btn)btn.disabled=true;
 try{
  await request("caseReview",{submission_id:id,decision,score,feedback});
  await refreshTeacher(teacherSession);
 }catch(err){alert(explain(err));if(btn)btn.disabled=false}
});
document.addEventListener("click",async e=>{
 const btn=e.target.closest?.("[data-case-action]");if(!btn)return;
 const action=btn.dataset.caseAction;
 if(action==="refresh")refreshTeacher(teacherSession);
 if(action==="download")csv();
 if(action==="history"){
  const id=btn.dataset.id;
  try{
   const {history}=await request("caseHistory",{submission_id:id});
   const node=document.getElementById("caseHistory-"+id);
   if(node)node.innerHTML=(history||[]).length?(history.map(h=>'<div class="case-history-item"><strong>'+esc(h.decision==="reviewed"?"نمره: "+digit(h.score)+"/۲۰":"درخواست اصلاح")+'</strong> · نسخه '+h.revision_no+' · '+date(h.reviewed_at)+'<p>'+esc(h.feedback)+'</p></div>').join("")):"ارزیابی قبلی ثبت نشده است.";
  }catch(err){alert(explain(err))}
 }
});
window.OB_CASE={refreshStudent,submitCase,teacherHTML,refreshTeacher,studentStatusMarkup:statusHTML};
})();