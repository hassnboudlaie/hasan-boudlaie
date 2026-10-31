/* Alborz Insurance | Session 2 — Practice Lab Expansion | 2026-10-31
   Extends the reviewed technique-one shell without changing its lesson content. */
(function(){
'use strict';
const bank=window.ALBORZ_TECH_DATA||{};
const techStages=[
 ['🎯','موقعیت تمرینی','چالش واقعی‌نمای شغلی و اجرای نخستین پاسخ'],
 ['🧩','اصول و تکنیک‌های کاربردی','پنج اصل، بایدها و نبایدها، مثال مناسب و نامناسب'],
 ['❓','تست و پرسش کلاسی','سه تصمیم تعاملی و پرسش پیگیری مدرس'],
 ['🎭','تمرین دونفره بدون متن','دو نقش محرمانه، اجرا جلوی وب‌کم و جابه‌جایی نقش'],
 ['🗣️','اسکریپت کامل گفت‌وگو','متن چندمرحله‌ای همراه با راهنمای اجرا و توقف تحلیل'],
 ['🔎','نقد و بازخورد رفتاری','شاهد رفتاری، امتیاز مشاهده‌گر و بازخورد مشخص'],
 ['🔁','اجرای اصلاح‌شده','چالش تازه، اجرای بدون متن و مقایسه با اجرای قبلی'],
 ['💡','نکات کلیدی یادگیری','جمع‌بندی کاربردی، تعهد رفتاری و منابع']
];
const partnerNames={2:'مدیر منطقه',3:'مدیرعامل شرکت',4:'مهمان سازمانی',5:'مدیر منابع انسانی',6:'بیمه‌گذار',7:'مدیر خرید شرکت',8:'همراه مدیر ستادی',9:'نماینده فروش',10:'مدیرعامل مشتری'};
let chosenTech=0;
let selectedPolls={};
let selectedRubrics={};
let scriptView='both';
let stageDirections=true;
const oldRender=window.render;
if(typeof oldRender!=='function')return;
const escapeText=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','\'':'&#39;'}[c]));
const e=escapeText;
const attr=escapeText;
const fileFor=d=>'assets/session2-'+(d.photo||'welcome')+'-hq.webp';
const pageTitle=(main,desc,mark)=>'<div class="section-header enhanced-header"><span class="lab-kicker">'+e(mark||'آزمایشگاه ارتباطات حرفه‌ای')+'</span><h1>'+e(main)+'</h1><p>'+e(desc)+'</p></div>';
const buttons=(index)=>'<div class="floatingnav lab-actions"><button class="navbtn" onclick="go(\'tech\')">→ فهرست ۸ مرحله</button>'+(index<7?'<button class="navbtn next" onclick="go(\'stage\','+(index+1)+')">مرحله بعد ←</button>':'<button class="navbtn next" onclick="go(\'catalog\')">فهرست تکنیک‌ها ←</button>')+'</div>';
const faq=(q,answer,heading='سؤال مدرس')=>'<details class="accordion lab-faq"><summary>❔ '+e(heading)+'</summary><div><p>'+e(q)+'</p>'+(answer?'<p class="lab-note">'+e(answer)+'</p>':'')+'</div></details>';
const photo=(d,label)=>'<figure class="lab-photo"><a href="'+fileFor(d)+'" target="_blank" rel="noopener" aria-label="بزرگ‌نمایی تصویر آموزشی"><img src="'+fileFor(d)+'" loading="lazy" alt="'+e(label||d.title)+'"></a><figcaption>📷 '+e(label||d.title)+' · برای دیدن تصویر در اندازه بزرگ روی آن بزنید</figcaption></figure>';
const card=(x,cl='')=>'<section class="contentcard lab-card '+cl+'">'+x+'</section>';
function getTech(){return bank[chosenTech+1];}
function showCatalog(){
const intro=pageTitle('فهرست تکنیک‌های جلسه دوم','۱۰ تکنیک آماده تمرین؛ هر تکنیک ۸ مرحله تعاملی دارد. برای کلاس ۱۲۰ دقیقه‌ای، اجرای زنده ۴ تا ۵ آزمایشگاه منتخب پیشنهاد می‌شود.','📚 آداب معاشرت و تشریفات حرفه‌ای');
const cards=T.map((t,i)=>'<button class="tech-card lab-tech" onclick="openAdvancedTech('+i+')" aria-label="ورود به تکنیک '+(i+1)+' '+e(t[0])+'"><span class="iconbox"><span class="icon-num">'+String(i+1).padStart(2,'0')+'</span><span class="icon-emoji" aria-hidden="true">'+(TECH_EMOJI[i]||'✦')+'</span></span><span class="tech-copy"><b>'+e(t[0])+'</b><small>'+e(t[1])+'</small></span><span class="lab-enter">ورود ←</span></button>').join('');
return intro+'<div class="catalog">'+cards+'</div>';
}
function showTechnique(d){
const title='<div class="subhero lab-tech-hero" style="background-image:linear-gradient(100deg,rgba(3,46,33,.98),rgba(4,77,53,.82) 62%,rgba(5,71,48,.42)),url('+fileFor(d)+')"><div><span class="eyebrow">جلسه دوم · تکنیک '+(chosenTech+1)+'</span><h1>'+e(d.icon)+' '+e(d.title)+'</h1><p>'+e(d.subtitle)+'</p><span class="lab-hero-tags">🎭 دو نقش · 🧠 تست · 🗣️ '+d.dialogue.length+' نوبت گفت‌وگو · 🔁 اجرای مجدد</span></div></div>';
const cards=techStages.map((x,i)=>'<button class="stage-card lab-stage" onclick="go(\'stage\','+i+')" aria-label="ورود به مرحله '+(i+1)+'"><span class="stage-no"><span class="badge-digit">'+(i+1)+'</span><span class="badge-emoji" aria-hidden="true">'+x[0]+'</span></span><span class="body"><b>'+e(x[1])+'</b><small>'+e(x[2])+'</small></span><span class="arrow">←</span></button>').join('');
return title+'<div class="stage-grid">'+cards+'</div>';
}
function showPrinciples(d){
const items=d.principles.map((p,i)=>'<details id="lab-principle-'+i+'" class="accordion lab-principle" '+(i===0?'open':'')+'><summary><span class="lab-principle-count">'+(i+1)+'</span><span>'+e(p[0])+'</span></summary><div><p class="lab-lead">'+e(p[1])+'</p><div class="compare"><div class="panel good"><b>✅ نمونه مناسب</b><p>'+e(p[2])+'</p></div><div class="panel bad"><b>❌ نمونه نامناسب</b><p>'+e(p[3])+'</p></div></div><div class="tip"><b>🔍 تحلیل فنی</b><p>'+e(p[4])+'</p></div><div class="tip"><b>👀 نشانه قابل مشاهده</b><p>'+e(p[5])+'</p></div></div></details>').join('');
return card('<h2>🧩 پنج اصل قابل اجرا</h2><p class="lab-lead">روی هر اصل بزنید؛ نمونه‌های مناسب و نامناسب، منطق انتخاب و نشانه رفتاری جداگانه باز می‌شوند.</p><div class="lab-concept-flow">'+d.principles.map((p,i)=>'<button class="lab-flow-item" onclick="openAdvancedPrinciple('+i+')"><span>'+(i+1)+'</span><b>'+e(p[0])+'</b><small>مشاهده نمونه‌ها ←</small></button>').join('')+'</div>'+items,'lab-principles')+card('<h2>🖼️ لنز مشاهده این تکنیک</h2>'+photo(d,d.title)+'<p>در اجرای دونفره، به <strong>کلام، لحن، حالت چهره و رفتار قابل مشاهده</strong> توجه کنید؛ از قضاوت شخصیت یا استنتاج نیت از یک ژست بپرهیزید.</p>');
}
function showQuiz(d){
selectedPolls[chosenTech] ||= {};
const answers=selectedPolls[chosenTech];
const items=d.quiz.map((q,i)=>{
let score=answers[i], answered=score!==undefined;
return '<div class="poll lab-poll"><h3>❓ پرسش '+(i+1)+'</h3><p class="lead">'+e(q.q)+'</p>'+q.options.map((o,k)=>'<button class="answer '+(score===k?'selected':'')+'" onclick="chooseAdvancedPoll('+chosenTech+','+i+','+k+')">'+e(o)+'</button>').join('')+
(answered?'<div class="response"><b>'+(score===q.correct?'✅ تصمیم قابل دفاع':'🔄 این انتخاب را بازنگری کنید')+'</b><p>'+e(q.why)+'</p><strong>🎤 پرسش مدرس:</strong> '+e(q.ask)+'</div>':'')+'</div>';
}).join('');
return card('<h2>🧠 پیش از اجرا، تصمیم بگیرید</h2><p>هر پاسخ قابل‌کلیک است. پس از انتخاب، تحلیل و یک پرسش برای گفت‌وگوی کلاسی نمایش داده می‌شود.</p>'+items);
}
function showRoles(d){
const roles='<div class="rolecards"><div class="role"><h3>🧑‍💼 نقش A — رئیس شعبه</h3><p>'+e(d.roles.a)+'</p></div><div class="role"><h3>👤 نقش B — '+e(partnerNames[chosenTech+1])+'</h3><p>'+e(d.roles.b)+'</p></div></div>';
return card('<h2>🎭 Role Play دونفره با وب‌کم</h2><p class="lab-lead">این بار متن اسکریپت را نخوانید. موقعیت را براساس اطلاعات نقش‌ها اجرا کنید؛ سپس نقش‌ها را جابه‌جا کنید.</p>'+roles+'<div class="lab-instructions"><p><b>⏱️ اجرای اول:</b> ۲ دقیقه گفت‌وگو، ۱ دقیقه بازخورد</p><p><b>🔄 اجرای دوم:</b> جابه‌جایی نقش و تکرار</p><p><b>👀 مشاهده‌گر:</b> دو رفتار مؤثر و یک رفتار قابل اصلاح را با مثال دقیق بیان کند.</p></div>'+faq('اگر طرف مقابل پاسخ غیرمنتظره‌ای داد چه می‌کنید؟','بر اساس اصل مهارتی همان تکنیک، سؤال روشن‌کننده بپرسید و به متن حفظ‌شده تکیه نکنید.'));
}
function scriptRows(d){
return d.dialogue.map((turn,i)=>{
const role=turn[0]==='الف'?'رئیس شعبه':partnerNames[chosenTech+1];
const match=String(turn[1]).match(/^\[([^\]]+)\]\s*/);
const full=String(turn[1]); const speechText=match?full.replace(/^\[[^\]]+\]\s*/,''):full;
const visible=scriptView==='both'||(scriptView==='A'&&turn[0]==='الف')||(scriptView==='B'&&turn[0]==='ب');
return '<div class="speech '+(turn[0]==='الف'?'manager':'')+(visible?'':' hidden')+'"><small>'+(i+1)+' · '+e(role)+'</small>'+(match&&stageDirections?'<div class="lab-direction">🎬 '+e(match[1])+'</div>':'')+'<p>'+e(speechText)+'</p></div>';
}).join('');
}
function showDialogue(d){
return card('<h2>🗣️ متن حرفه‌ای نقش‌آفرینی</h2><p>این اسکریپت برای خواندن دونفره و تحلیل رفتار طراحی شده است. پس از آن، یک اجرای بدون متن انجام دهید.</p><div class="scriptbar"><button class="tab '+(scriptView==='both'?'active':'')+'" onclick="showAdvancedRole(\'both\')">هر دو نقش</button><button class="tab '+(scriptView==='A'?'active':'')+'" onclick="showAdvancedRole(\'A\')">رئیس شعبه</button><button class="tab '+(scriptView==='B'?'active':'')+'" onclick="showAdvancedRole(\'B\')">مخاطب</button><button class="tab" onclick="toggleAdvancedDirection()">راهنمای اجرا '+(stageDirections?'روشن':'خاموش')+'</button><button class="tab" onclick="copyAdvancedScript()">📋 کپی گفت‌وگو</button></div>'+
'<div class="lab-dialogue-count">'+d.dialogue.length+' نوبت گفت‌وگو؛ همراه با نقاط توقف مدرس</div>'+scriptRows(d)+
'<div class="lab-pause"><h3>⏸️ توقف‌های تحلیل در کلاس</h3>'+d.pause.map(p=>'<p><strong>بعد از نوبت '+p.at+': </strong>'+e(p.q)+'</p>').join('')+'</div>');
}
function showFeedback(d){
selectedRubrics[chosenTech] ||= {};
const scores=selectedRubrics[chosenTech];
const widgets=d.observe.map((label,i)=>'<div class="rubric"><b>'+e(label)+'</b><div class="scale">'+[1,2,3,4,5].map(n=>'<button aria-pressed="'+(scores[i]===n)+'" class="'+(scores[i]===n?'active':'')+'" onclick="rateAdvanced('+chosenTech+','+i+','+n+')">'+n+'</button>').join('')+'</div></div>').join('');
const total=Object.values(scores).reduce((a,b)=>a+b,0);
return card('<h2>🔎 مشاهده رفتار، نه قضاوت شخصیت</h2><p>در هر شاخص از ۱ تا ۵ امتیاز دهید و برای آن <strong>شاهد قابل مشاهده</strong> بیان کنید. این Rubric صرفاً برای Feedback آموزشی است.</p><div class="observer">'+widgets+'</div><div class="summary"><b>'+total+' / ۳۰</b><p>'+Object.keys(scores).length+' شاخص از ۶ شاخص امتیازدهی شده است.</p></div><label class="actionfield">🟢 دو رفتار مؤثر چه بودند؟<textarea class="lab-positives" placeholder="دو رفتار دقیق و قابل مشاهده بنویسید…"></textarea></label><label class="actionfield">🟠 یک رفتار برای اصلاح چیست؟<textarea class="lab-change" placeholder="یک تغییر قابل اجرا برای نوبت دوم بنویسید…"></textarea></label><button class="navbtn" onclick="copyAdvancedFeedback()">📋 کپی بازخورد</button>');
}
function showRepractice(d){
return card('<h2>🔁 اجرای اصلاح‌شده — چالش جدید</h2><div class="casebox"><b>موقعیت دوم</b><p>'+e(d.repractice.trigger)+'</p></div><h3>چهار شرط اجرای دوم</h3><div class="checks">'+d.repractice.constraints.map((v,i)=>'<div class="checkitem"><b>'+(i+1)+'. </b>'+e(v)+'</div>').join('')+'</div><div class="prompt">🎤 پرسش مدرس: نسبت به دور اول، <strong>چه رفتار مشخصی</strong> تغییر کرد و مخاطب چگونه پاسخ داد؟</div>');
}
function showTakeaways(d){
return card('<h2>💡 نکات یادگیری و انتقال به شعبه</h2><div class="checks">'+d.takeaways.map((s,i)=>'<div class="checkitem"><b>'+(i+1)+'. </b>'+e(s)+'</div>').join('')+'</div><label class="actionfield">🎯 در ملاقات بعدی چه رفتار مشخصی را تغییر می‌دهید؟<textarea class="lab-commit" placeholder="موقعیت اجرا + رفتار + شاهد پیشرفت…"></textarea></label><button class="navbtn next" onclick="copyAdvancedCommit()">📋 کپی برنامه اقدام</button><details class="accordion"><summary>📚 مبنای محتوایی و یادداشت علمی</summary><div><p>توسعه بومی و بازنویسی مستقل براساس نقشه منابع آموزشی آکادمی و راهنماهای حرفه‌ای. سناریوها ساختگی‌اند و جایگزین دستورالعمل‌های مصوب بیمه البرز نیستند.</p>'+d.sources.map(x=>'<p>• '+e(x)+'</p>').join('')+'<p>قواعد تشریفاتی وابسته به موقعیت، پروتکل سازمانی و فرهنگ هستند؛ درباره نیت یا صداقت افراد از یک نشانه غیرکلامی نتیجه قطعی نگیرید.</p></div></details>');
}
function showStage(d,i){
let content='';
if(i===0)content=card('<span class="tag">🎯 موقعیت واقعی‌نما</span><h2>'+e(d.title)+'</h2><div class="casebox"><p>'+e(d.situation)+'</p></div><div class="prompt">🎤 '+e(d.opening)+'</div><div class="tip"><b>⚖️ آنچه در خطر است:</b><p>'+e(d.stakes)+'</p></div>'+faq('به جای توضیح نظری، اولین جمله خود را دقیقاً چگونه می‌گویید؟','دو نفر داوطلب شوند و پاسخ را جلوی دوربین اجرا کنند.'),'lab-stage-intro');
if(i===1)content=showPrinciples(d);
if(i===2)content=showQuiz(d);
if(i===3)content=showRoles(d);
if(i===4)content=showDialogue(d);
if(i===5)content=showFeedback(d);
if(i===6)content=showRepractice(d);
if(i===7)content=showTakeaways(d);
return '<section class="single-stage lab-page">'+pageTitle(techStages[i][0]+' '+(i+1)+'. '+techStages[i][1],techStages[i][2],'تکنیک '+(chosenTech+1)+' · '+d.title)+content+buttons(i)+'</section>';
}
function enhancedRender(){
if(current.page==='catalog'){
$('root').innerHTML=showCatalog();document.title='فهرست تکنیک‌ها | بیمه البرز';return;
}
if(chosenTech>0 && (current.page==='tech'||current.page==='stage')){
const d=getTech();
if(!d){$('root').innerHTML=card('<h2>محتوای این تکنیک هنوز بارگذاری نشده است.</h2><button class="navbtn" onclick="go(\'catalog\')">بازگشت به فهرست</button>');return;}
$('root').innerHTML=current.page==='tech'?showTechnique(d):showStage(d,current.index);
document.title=d.title+' | بیمه البرز';
return;
}
oldRender();
}
window.render=enhancedRender;
window.openAdvancedTech=function(i){chosenTech=i;scriptView='both';stageDirections=true;go('tech');};
window.chooseAdvancedPoll=function(t,i,k){selectedPolls[t] ||= {};selectedPolls[t][i]=k; const y=window.scrollY;render();window.scrollTo(0,Math.max(0,y-15));};
window.rateAdvanced=function(t,i,n){selectedRubrics[t] ||= {};selectedRubrics[t][i]=n;const y=window.scrollY;render();window.scrollTo(0,y);};
window.openAdvancedPrinciple=function(i){const item=document.getElementById('lab-principle-'+i);if(item){item.open=true;item.scrollIntoView({behavior:'smooth',block:'start'});}};
window.showAdvancedRole=function(v){scriptView=v;const y=window.scrollY;render();window.scrollTo(0,y);};
window.toggleAdvancedDirection=function(){stageDirections=!stageDirections;const y=window.scrollY;render();window.scrollTo(0,y);};
window.copyAdvancedScript=async function(){const d=getTech();const text=d.dialogue.map((a,i)=>(i+1)+'. '+(a[0]==='الف'?'رئیس شعبه':partnerNames[chosenTech+1])+'\n'+a[1]).join('\n\n');await copyText(text);};
window.copyAdvancedFeedback=async function(){const d=getTech(),scores=selectedRubrics[chosenTech]||{};const positive=document.querySelector('.lab-positives')?.value||'',change=document.querySelector('.lab-change')?.value||'';await copyText(d.title+'\n'+d.observe.map((v,i)=>v+': '+(scores[i]||'—')+'/5').join('\n')+'\nدو رفتار مثبت:\n'+positive+'\nرفتار قابل اصلاح:\n'+change);};
window.copyAdvancedCommit=async function(){await copyText(getTech().title+'\n'+(document.querySelector('.lab-commit')?.value||''));};
async function copyText(t){if(!t.trim()){alert('ابتدا متن را تکمیل کنید.');return;}try{await navigator.clipboard.writeText(t);alert('متن کپی شد.')}catch(err){alert('کپی خودکار در این مرورگر مجاز نیست.');}}
window.__alborzQA={bank,techStages,getTech,showCatalog,showTechnique,showStage,render:enhancedRender};
render();
})();