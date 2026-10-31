/* Technique 1: same scenario and WELCOME structure, simpler stage UI. */
(function(){
'use strict';
const previous=renderStage;
const goal=()=>window.ALBORZ_BEHAVIOR_GUIDES[1];
const delivery=p=>'<div class="lab-acting-cues"><div><b>🎙️ لحن:</b> '+h(p.voice)+'</div><div><b>🧍 زبان بدن:</b> '+h(p.body)+'</div><div><b>🙂 حالت چهره:</b> '+h(p.face)+'</div></div>';
const frame=(i,title,body)=>'<section class="single-stage lab-page"><div class="section-header enhanced-header"><h1>'+title+'</h1></div>'+body+footerNav("go('tech')",i<7?"go('stage',"+(i+1)+")":null,"فهرست ۸ مرحله","مرحله بعد")+'</section>';
renderStage=function(i){
 const g=goal();
 if(i===0){
  const html='<div class="contentcard stage-opening lab-simple-case"><h2>آغاز حرفه‌ای ملاقات</h2><div class="casebox"><p>مدیرعامل یک شرکت تولیدی وارد شعبه شده است. صدور الحاقیه او عقب افتاده و چند بار پیگیری کرده است. با نگاه به ساعت می‌گوید: «من فقط بیست دقیقه وقت دارم. از پیگیری‌ها هم راضی نیستم.» شما هنوز دلیل تأخیر را دقیق نمی‌دانید. باید محترمانه استقبال کنید، نگرانی او را بشنوید و از توجیه یا وعده عجولانه دوری کنید.</p></div><div class="lab-skill-focus"><b>🎯 مهارت هدف:</b> '+h(g.skill)+'</div><div class="prompt lab-simple-start"><b>نوبت شماست</b><p>'+h(g.prompt)+'</p></div>'+delivery(g)+'<details class="accordion lab-simple-follow"><summary>دو سؤال برای گفت‌وگو</summary><div><p>۱. چطور نشان می‌دهید وقت او برایتان مهم است؟</p><p>۲. با چه سؤال کوتاهی نگرانی اصلی او را می‌فهمید؟</p></div></details></div>';
  return frame(i,'🎯 ۱. موقعیت تمرینی',html);
 }
 if(i===2){
  const body='<div class="contentcard"><h2>❓ تست و پرسش کلاسی</h2>'+Q.map((q,j)=>{
   const k=answers[j],answered=k!==undefined;
   const options=q.opts.map((o,n)=>'<button class="answer '+(k===n?'selected':'')+'" aria-pressed="'+(k===n)+'" onclick="pick('+j+','+n+')">'+h(o)+'</button>').join('');
   const explanation=answered?'<div class="response lab-answer-review"><b>'+(k===q.right?'✅ پاسخ شما درست است.':'🔄 این پاسخ بهترین انتخاب نیست.')+'</b><div class="lab-answer-explanations">'+q.opts.map((o,n)=>'<div class="lab-option-reason '+(n===q.right?'right':'wrong')+'"><b>'+(n===q.right?'✅ چرا گزینه '+(n+1)+' درست است؟':'❌ چرا گزینه '+(n+1)+' درست نیست؟')+'</b><p>'+h(q.optionReasons?.[n]||(n===q.right?q.ex:'این گزینه برای این موقعیت مناسب نیست.'))+'</p></div>').join('')+'</div><details class="accordion lab-question-extra"><summary>🎤 یک تمرین کوتاه</summary><div>'+h(q.follow)+'</div></details></div>':'';
   return '<div class="poll lab-poll"><h3>پرسش '+(j+1)+'</h3><p class="lead">'+h(q.q)+'</p>'+options+explanation+'</div>';
  }).join('')+'</div>';
  return frame(i,'❓ ۳. تست و پرسش کلاسی',body);
 }
 if(i===3){
  const body='<div class="contentcard"><h2>🎭 تمرین دونفره</h2><div class="lab-role-scene"><b>صورت مسئله</b><p>'+h(g.setting)+'</p><p><b>مهمان شروع می‌کند:</b> '+h(g.opening)+'</p></div><div class="lab-skill-focus"><b>🎯 مهارتی که باید نشان دهید:</b> '+h(g.skill)+'</div><div class="lab-role-action"><b>حالا شما چه می‌کنید؟</b><p>'+h(g.prompt)+'</p></div><div class="rolecards"><div class="role"><h3>رئیس شعبه</h3><p>علت تأخیر را هنوز دقیق نمی‌دانید. هم به وقت مهمان احترام بگذارید، هم سؤال مناسب بپرسید؛ قول نتیجه ندهید.</p></div><div class="role"><h3>مدیرعامل شرکت</h3><p>برای الحاقیه ناراضی هستید و فقط بیست دقیقه وقت دارید. از رئیس شعبه انتظار پاسخ روشن دارید.</p></div></div>'+delivery(g)+'<details class="accordion lab-question-extra"><summary>🔄 تمرین دوباره</summary><div>همین شروع را یک بار با لحن دفاعی و یک بار با لحن آرام و بدن باز اجرا کنید. تفاوت را بررسی کنید.</div></details></div>';
  return frame(i,'🎭 ۴. تمرین دونفره',body);
 }
 if(i===4){
  return previous(i).replace('<h2>🗣️ متن کامل نقش‌آفرینی</h2>','<h2>🗣️ گفت‌وگوی نمونه</h2><div class="lab-skill-focus"><b>🎯 مهارت هدف:</b> '+h(g.skill)+'</div><p class="lab-short-context">'+h(g.setting)+'</p>').replace(/<p>۲۰ نوبت گفت‌وگوی حرفه‌ای؛[\s\S]*?<\/p>/,'');
 }
 if(i===6){
  return previous(i).replace('<h2>🔁 اجرای اصلاح‌شده بدون متن</h2>','<h2>🔁 اجرای دوباره</h2><div class="lab-skill-focus"><b>🎯 مهارت هدف:</b> '+h(g.skill)+'</div>').replace('<div class="checks">',delivery(g)+'<div class="checks">');
 }
 return previous(i);
};
window.ALBORZ_FIRST_PRACTICE_READY=true;
})();