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
  const ui=window.ALBORZ_QUIZ_UI;
  if(!ui)throw Error('Assessment UI not loaded for technique 1');
  const body='<div class="contentcard">'+
    ui.render(Q,answers,(j,k)=>'pick('+j+','+k+')',h,true)+'</div>';
  return frame(i,'❓ ۳. تست و پرسش کلاسی',body);
 }
 if(i===3){
  const body='<div class="contentcard"><div class="lab-role-scene"><b>صورت مسئله</b><p>'+h(g.setting)+'</p><p><b>مهمان شروع می‌کند:</b> '+h(g.opening)+'</p></div><div class="lab-skill-focus"><b>🎯 مهارتی که باید نشان دهید:</b> '+h(g.skill)+'</div><div class="lab-role-action"><b>حالا شما چه می‌کنید؟</b><p>'+h(g.prompt)+'</p></div><div class="rolecards"><div class="role"><h3>رئیس شعبه</h3><p>علت تأخیر را هنوز دقیق نمی‌دانید. هم به وقت مهمان احترام بگذارید، هم سؤال مناسب بپرسید؛ قول نتیجه ندهید.</p></div><div class="role"><h3>مدیرعامل شرکت</h3><p>برای الحاقیه ناراضی هستید و فقط بیست دقیقه وقت دارید. از رئیس شعبه انتظار پاسخ روشن دارید.</p></div></div>'+delivery(g)+'</div>';
  return frame(i,'🎭 ۴. تمرین دونفره',body);
 }
 if(i===4){
  return previous(i).replace('<h2>🗣️ متن کامل نقش‌آفرینی</h2>','<div class="lab-skill-focus"><b>🎯 مهارت هدف:</b> '+h(g.skill)+'</div><p class="lab-short-context">'+h(g.setting)+'</p>').replace(/<p>۲۰ نوبت گفت‌وگوی حرفه‌ای؛[\s\S]*?<\/p>/,'');
 }
 if(i===6){
  const r=window.ALBORZ_TECH1_RETRY||{};
  const cues={...g,voice:r.tone||g.voice};
  const content='<div class="contentcard lab-retry-content"><div class="lab-skill-focus"><b>🎯 همان مهارت:</b> '+h(g.skill)+'</div><div class="lab-role-scene"><b>همان ملاقات، یک اتفاق تازه</b><p>'+h(r.retry||'مدیرعامل از نتیجه پیگیری هنوز مطمئن نیست.')+'</p></div><div class="lab-role-action"><b>این بار چه می‌گویید؟</b><p>'+h(r.mission||g.prompt)+'</p></div>'+delivery(cues)+'<p class="lab-retry-watch"><b>👀 به این رفتار توجه کنید:</b> '+h(r.watch||'لحن و کلام مناسب')+'</p></div>';
  return frame(i,'🔁 ۷. اجرای دوباره',content);
 }
 return previous(i);
};
window.ALBORZ_FIRST_PRACTICE_READY=true;
})();