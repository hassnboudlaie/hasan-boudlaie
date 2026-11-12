/* Alborz Insurance — Session 4 final quiz UI. Browser-local only. */
(function(){
"use strict";
const dataset=window.ALBORZ_S4_FINAL_QUIZ;
if(!dataset || !Array.isArray(dataset.questions) || dataset.questions.length!==10)return;
const questions=dataset.questions,skills=dataset.skills;
const letter=["الف","ب","ج","د"];
const digit=n=>String(n).replace(/[0-9]/g,d=>"۰۱۲۳۴۵۶۷۸۹"[+d]);
const escapeHTML=v=>String(v).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
let answers=Array(10).fill(null),index=0,started=false,finished=false;
const css=[
".s4-final-exam{margin:32px 0 45px;border:1px solid #c7dfcf;border-radius:21px;background:#fff;box-shadow:0 10px 30px #123b2b10;overflow:hidden;color:#153d2c;scroll-margin-top:105px}.s4-final-exam *{box-sizing:border-box}",
".s4e-header{background:linear-gradient(115deg,#09553e,#187a58);padding:24px clamp(16px,3vw,30px);color:#fff}.s4e-header h2{color:#fff;font-size:clamp(24px,3vw,32px);margin:0 0 6px}.s4e-header p{color:#edf8f0;font-size:17px;line-height:1.85;margin:0}.s4e-main{padding:clamp(16px,3vw,30px)}",
".s4e-tags{display:flex;gap:9px;flex-wrap:wrap;margin-bottom:15px}.s4e-tags span{font-size:14px;color:#0c6144;background:#e7f5eb;border-radius:999px;padding:5px 12px;font-weight:800}.s4e-intro{font-size:19px;line-height:1.85;margin:9px 0 23px}",
".s4e-button{font:inherit;font-size:18px;font-weight:850;border:1px solid #0b6849;border-radius:12px;min-height:49px;padding:10px 19px;color:#fff;background:#0b6849;cursor:pointer}.s4e-button.secondary{color:#0b6044;background:white;border-color:#b8d9c5}.s4e-button:disabled{opacity:.48;cursor:not-allowed}.s4e-buttons{display:flex;gap:10px;flex-wrap:wrap;margin-top:19px}",
".s4e-progress{height:9px;border-radius:10px;background:#e5eee8;overflow:hidden;margin:12px 0 23px}.s4e-progress>span{display:block;height:100%;background:#0b835a;transition:width .2s}.s4e-question{color:#123d2d;font-size:clamp(20px,2.3vw,24px);line-height:1.9;margin:0 0 19px;font-weight:850}",
".s4e-options{display:grid;gap:11px}.s4e-option{display:flex;align-items:flex-start;gap:12px;padding:13px 15px;border:2px solid #d7e6db;background:#f9fcfa;border-radius:13px;min-height:64px;font-size:18px;line-height:1.85;cursor:pointer;color:#1b4633}.s4e-option input{width:21px;height:21px;margin:6px 0 0;accent-color:#08744d;flex-shrink:0}.s4e-option b{min-width:22px;color:#12573e}.s4e-option:has(input:checked){border-color:#0c7451;background:#e8f6ed}.s4e-option:focus-within{outline:3px solid #c7a15e;outline-offset:1px}",
".s4e-alert{color:#a53a2a;font-weight:750;font-size:16px;margin-top:10px}.s4e-note{font-size:15px;line-height:1.8;color:#54705e;margin-top:13px}.s4e-score{font-size:clamp(29px,4vw,42px);font-weight:900;color:#0b6748}.s4e-interpret{font-size:19px;line-height:1.95;margin:10px 0 23px}",
".s4e-subtitle{color:#14553e;font-size:24px;line-height:1.6;margin:25px 0 13px}.s4e-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:11px}.s4e-skill{border:1px solid #d2e6d7;border-radius:13px;background:#f1f8f3;padding:14px 16px}.s4e-skill strong{font-size:17px;color:#175640}.s4e-skill p{margin:3px 0;color:#2d523c;font-size:16px}",
".s4e-nextstep{border-right:4px solid #ad9354;background:#f8f7ef;border-radius:13px;padding:16px 20px;margin-top:23px}.s4e-nextstep h3{font-size:22px;color:#514728;margin:0 0 7px}.s4e-nextstep p{font-size:17px;line-height:1.9;margin:7px 0}",
".s4e-review{border:1px solid #d5e5d9;border-radius:13px;margin:10px 0;overflow:hidden}.s4e-review summary{font-size:18px;line-height:1.8;font-weight:800;cursor:pointer;color:#14513a;padding:14px 18px}.s4e-review summary::marker{color:#0b7650}.s4e-review-body{padding:0 17px 16px}.s4e-review-body>p{font-size:17px;line-height:1.85}",
".s4e-explain{border:1px solid #e0e9e1;border-radius:10px;background:#fbfcfb;margin:8px 0;padding:11px 13px}.s4e-explain.correct{background:#eaf8ee;border-color:#add7b9}.s4e-explain.selected:not(.correct){background:#fff7f2;border-color:#e3c3b6}.s4e-explain b{font-size:16px;color:#204c36}.s4e-explain p{font-size:16px;line-height:1.8;color:#385444;margin:4px 0}",
"@media(max-width:650px){.s4e-grid{grid-template-columns:1fr}.s4e-option{font-size:17px;padding:11px 12px}.s4e-header p{font-size:16px}}",
"@media print{.s4-topbar,.s4-hero,.s4-overview,.s4-lab,.s4-instructor,.s4e-buttons{display:none!important}.s4-final-exam{box-shadow:none;border:0}.s4e-header{background:#fff;color:#123d2d}.s4e-header h2,.s4e-header p{color:#123d2d}.s4e-review{break-inside:avoid}}"
].join("\n");
function styleOnce(){if(document.getElementById("s4-final-exam-style"))return;const element=document.createElement("style");element.id="s4-final-exam-style";element.textContent=css;document.head.appendChild(element);}
function root(){return document.getElementById("s4-final-exam");}
function frame(content){
 const holder=root();if(!holder)return;
 holder.innerHTML='<div class="s4e-header"><h2>آزمون پایانی جلسه چهارم</h2><p>فن بیان مدیریتی، لحن و زبان بدن · سنجش فردی پس از آموزش و ایفای نقش</p></div><div class="s4e-main">'+content+'</div>';
}
function home(){
 frame('<div class="s4e-tags"><span>۱۰ سؤال چهارگزینه‌ای</span><span>هر پاسخ درست: ۱ امتیاز</span><span>۱۲ تا ۱۵ دقیقه</span></div>'+
 '<p class="s4e-intro">پس از مرور شش تکنیک و اجرای Role-playها، هر شرکت‌کننده به‌صورت فردی به ده موقعیت واقعی از محیط شعبه پاسخ دهد. پاسخنامه تحلیلی و تفسیر نتیجه تنها پس از ثبت نهایی نمایش داده می‌شود.</p>'+
 '<button type="button" class="s4e-button" data-s4e-start>شروع آزمون فردی</button>'+
 '<p class="s4e-note">در این نسخه، پاسخ‌ها فقط در همین مرورگر پردازش می‌شوند و به سامانه مرکزی ارسال نمی‌شوند.</p>');
}
function question(){
 const q=questions[index],count=answers.filter(x=>x!==null).length;
 frame('<div class="s4e-tags"><span>سؤال '+digit(index+1)+' از ۱۰</span><span>'+digit(count)+' پاسخ ثبت‌شده</span><span>'+escapeHTML(skills[q.skill][0])+'</span></div>'+
 '<div class="s4e-progress" role="progressbar" aria-label="میزان تکمیل آزمون" aria-valuemin="0" aria-valuemax="10" aria-valuenow="'+count+'"><span style="width:'+(count*10)+'%"></span></div>'+
 '<h3 class="s4e-question">'+escapeHTML(q.stem)+'</h3>'+
 '<div class="s4e-options" role="radiogroup" aria-label="گزینه‌های سؤال '+digit(index+1)+'">'+q.options.map((o,j)=>'<label class="s4e-option"><input type="radio" name="s4e-answer" value="'+j+'" '+(answers[index]===j?'checked':'')+'><b>'+letter[j]+'.</b><span>'+escapeHTML(o[0])+'</span></label>').join("")+'</div>'+
 '<p class="s4e-alert" id="s4e-alert" role="alert" hidden></p><div class="s4e-buttons"><button class="s4e-button secondary" type="button" data-s4e-prev '+(index===0?'disabled':'')+'>سؤال قبل</button><button class="s4e-button" type="button" data-s4e-next>'+(index===9?'ثبت نهایی و مشاهده نتیجه':'سؤال بعد')+'</button></div>'+
 '<p class="s4e-note">پیش از ثبت نهایی، امکان بازگشت و اصلاح پاسخ‌ها وجود دارد.</p>');
}
function summary(){
 const total=questions.reduce((n,q,j)=>n+(answers[j]===q.answer?1:0),0);
 const interpretation=total===10?"در این سنجش موقعیتی، همه پاسخ‌ها درست بوده‌اند. انتقال تکنیک‌ها به گفت‌وگوهای واقعی و دریافت بازخورد، گام بعدی شماست.":total>=8?"کاربرد تکنیک‌ها را به‌خوبی تشخیص می‌دهید. روی سناریوهایی که پاسخ نادرست داشتید تمرین هدفمند انجام دهید.":total>=5?"پایه یادگیری شکل گرفته است. برای عملکرد باثبات‌تر، قواعد تکنیک‌های ضعیف‌تر را مرور و اجرای دوم سناریوها را تکرار کنید.":"مرور دوباره شش تکنیک و نمونه‌های حرفه‌ای توصیه می‌شود. سپس با تمرین موقعیتی، یک بار دیگر آزمون را انجام دهید.";
 const scores=skills.map((skill,i)=>{let right=0,all=0;questions.forEach((q,j)=>{if(q.skill===i){all++;if(answers[j]===q.answer)right++;}});return {skill,right,all};});
 const practice=scores.filter(s=>s.right<s.all).slice(0,2);
 frame('<div class="s4e-tags"><span>ثبت نهایی انجام شد</span><span>پاسخ صحیح: '+digit(total)+'</span></div><div class="s4e-score">'+digit(total)+' از ۱۰</div><p class="s4e-interpret">'+escapeHTML(interpretation)+'</p>'+
 '<h3 class="s4e-subtitle">پروفایل یادگیری شش تکنیک</h3><div class="s4e-grid">'+scores.map(s=>'<div class="s4e-skill"><strong>'+escapeHTML(s.skill[0])+'</strong><p>'+digit(s.right)+' از '+digit(s.all)+' پاسخ درست'+(s.right===s.all?' · مناسب در این آزمون':' · اولویت تمرین')+'</p></div>').join("")+'</div>'+
 '<div class="s4e-nextstep"><h3>Next Best Step | تمرین بعدی</h3>'+(practice.length?practice.map(s=>'<p><b>'+escapeHTML(s.skill[0])+':</b> '+escapeHTML(s.skill[1])+'</p>').join(""):'<p>در هفته پیش رو، دو تکنیک دلخواه را در محیط کار به‌کار ببرید و از یک همکار درباره رفتار قابل مشاهده خود بازخورد بگیرید.</p>')+'</div>'+
 '<h3 class="s4e-subtitle">پاسخنامه تحلیلی</h3><p class="s4e-intro">روی هر سؤال بزنید تا گزینه انتخابی خود، پاسخ درست و دلیل هر چهار گزینه را ببینید.</p>'+
 questions.map((q,i)=>{
 const right=answers[i]===q.answer;
 return '<details class="s4e-review" '+(i===0?'open':'')+'><summary>سؤال '+digit(i+1)+' · '+escapeHTML(skills[q.skill][0])+' · '+(right?'پاسخ صحیح':'نیازمند بازنگری')+'</summary><div class="s4e-review-body"><p><b>'+escapeHTML(q.stem)+'</b></p><p>انتخاب شما: <strong>'+letter[answers[i]]+'</strong> · پاسخ درست: <strong>'+letter[q.answer]+'</strong></p>'+
 q.options.map((o,j)=>'<div class="s4e-explain '+(j===q.answer?'correct':'')+' '+(j===answers[i]?'selected':'')+'"><b>'+letter[j]+'. '+escapeHTML(o[0])+(j===q.answer?' · گزینه صحیح':'')+(j===answers[i]?' · انتخاب شما':'')+'</b><p>'+escapeHTML(o[1])+'</p></div>').join("")+'</div></details>';
 }).join("")+
 '<p class="s4e-note">این تفسیر، نتیجه یک آزمون کوتاه آموزشی است؛ نمره به‌تنهایی معیار قطعی شایستگی شغلی نیست. نتیجه فقط در همین دستگاه نمایش داده می‌شود.</p>'+
 '<div class="s4e-buttons"><button class="s4e-button" type="button" data-s4e-print>چاپ / ذخیره به PDF</button><button class="s4e-button secondary" type="button" data-s4e-reset>شروع آزمون جدید</button></div>');
}
function render(){if(!started)home();else if(finished)summary();else question();}
function move(n){
 if(n>index&&answers[index]===null){const e=document.getElementById("s4e-alert");if(e){e.hidden=false;e.textContent="لطفاً برای ادامه یک گزینه انتخاب کنید.";}return;}
 if(n===10){const firstUnanswered=answers.indexOf(null);if(firstUnanswered>=0){index=firstUnanswered;question();return;}finished=true;summary();root()?.scrollIntoView({behavior:"smooth",block:"start"});return;}
 index=Math.max(0,Math.min(9,n));question();
}
function mount(){
 styleOnce();answers=Array(10).fill(null);index=0;started=false;finished=false;
 const wrap=document.querySelector(".s4-root .wrap");if(!wrap)return;
 const section=document.createElement("section");section.id="s4-final-exam";section.className="s4-final-exam";section.setAttribute("aria-label","آزمون پایانی جلسه چهارم");wrap.appendChild(section);
 const guide=document.querySelector(".s4-instructor");
 if(guide){
  const plan=guide.querySelector(".s4-plan");
  if(plan)plan.innerHTML=[["۸ دقیقه","شروع و طرح مسئله"],["۱۲ دقیقه","مرور شش تکنیک"],["۲۴ دقیقه","تمرین کیس‌های ۱ تا ۴"],["۲۴ دقیقه","تمرین کیس‌های ۵ تا ۸"],["۲۴ دقیقه","تمرین کیس‌های ۹ تا ۱۲"],["۱۳ دقیقه","جمع‌بندی و بازخورد"],["۱۵ دقیقه","آزمون فردی و پاسخنامه"]].map(a=>'<div><strong>'+a[0]+'</strong><span>'+a[1]+'</span></div>').join("");
  const description=guide.querySelector("p");if(description)description.textContent="هر کیس: ۲ دقیقه اجرای اول، ۱ دقیقه مطالعه قواعد، ۲ دقیقه اجرای دوم و ۱ دقیقه Feedback. زوج‌ها هم‌زمان تمرین می‌کنند. آزمون فردی در انتهای جلسه برگزار می‌شود.";
 }
 render();
}
document.addEventListener("change",event=>{
 const target=event.target;if(target&&target.matches('#s4-final-exam input[name="s4e-answer"]')){answers[index]=Number(target.value);const error=document.getElementById("s4e-alert");if(error)error.hidden=true;}
});
document.addEventListener("click",event=>{
 if(!event.target.closest("#s4-final-exam"))return;
 if(event.target.closest("[data-s4e-start]")){started=true;index=0;answers=Array(10).fill(null);finished=false;render();}
 else if(event.target.closest("[data-s4e-prev]"))move(index-1);
 else if(event.target.closest("[data-s4e-next]"))move(index+1);
 else if(event.target.closest("[data-s4e-reset]")){started=false;finished=false;answers=Array(10).fill(null);index=0;render();root()?.scrollIntoView({behavior:"smooth",block:"start"});}
 else if(event.target.closest("[data-s4e-print]"))window.print();
});
window.addEventListener("beforeprint",()=>{document.querySelectorAll("#s4-final-exam .s4e-review").forEach(d=>{d.dataset.wasOpen=d.open?"1":"0";d.open=true;});});
window.addEventListener("afterprint",()=>{document.querySelectorAll("#s4-final-exam .s4e-review").forEach(d=>{d.open=d.dataset.wasOpen==="1";});});
const previous=window.alborzSession4Page;
if(typeof previous==="function")window.alborzSession4Page=function(){previous();mount();};
})();
