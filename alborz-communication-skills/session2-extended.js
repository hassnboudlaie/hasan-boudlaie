/* Alborz Insurance | Session 2 — Practice Lab Expansion | 2026-10-31
   Extends the reviewed technique-one shell without changing its lesson content. */
(function(){
'use strict';
const bank=window.ALBORZ_TECH_DATA||{};
const techStages=[
 ['🎯','موقعیت تمرینی','یک اتفاق آشنا، یک پاسخ کاربردی'],
 ['🧩','اصول و تکنیک‌های کاربردی','پنج اصل، بایدها و نبایدها، مثال مناسب و نامناسب'],
 ['❓','تست و پرسش کلاسی','سه سؤال ساده درباره رفتار خودتان'],
 ['🎭','تمرین دونفره','اجرای همین موقعیت با دو نقش مشخص'],
 ['🗣️','گفت‌وگوی نمونه','کلام، صدا، بدن و چهره'],
 ['🔎','نقد و بازخورد رفتاری','چه چیزی خوب بود و چه چیزی بهتر می‌شود؟'],
 ['🔁','اجرای دوباره','همان مهارت، این بار بهتر'],
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
const pageTitle=(main,desc,mark)=>'<div class="section-header enhanced-header"><h1>'+e(main)+'</h1></div>';
const buttons=(index)=>'<div class="floatingnav lab-actions"><button class="navbtn" onclick="go(\'tech\')">→ فهرست ۸ مرحله</button>'+(index<7?'<button class="navbtn next" onclick="go(\'stage\','+(index+1)+')">مرحله بعد ←</button>':'<button class="navbtn next" onclick="go(\'catalog\')">فهرست تکنیک‌ها ←</button>')+'</div>';
const faq=(q,answer,heading='سؤال مدرس')=>'<details class="accordion lab-faq"><summary>❔ '+e(heading)+'</summary><div><p>'+e(q)+'</p>'+(answer?'<p class="lab-note">'+e(answer)+'</p>':'')+'</div></details>';
const photo=(d,label)=>'<figure class="lab-photo"><a href="'+fileFor(d)+'" target="_blank" rel="noopener" aria-label="بزرگ‌نمایی تصویر آموزشی"><img src="'+fileFor(d)+'" loading="lazy" alt="'+e(label||d.title)+'"></a><figcaption>📷 '+e(label||d.title)+' · برای دیدن تصویر در اندازه بزرگ روی آن بزنید</figcaption></figure>';
const card=(x,cl='')=>'<section class="contentcard lab-card '+cl+'">'+x+'</section>';
function getTech(){return bank[chosenTech+1];}
function showCatalog(){
const intro=pageTitle('تکنیک‌های جلسه دوم','','');
const cards=T.map((t,i)=>'<button class="tech-card lab-tech" onclick="openAdvancedTech('+i+')" aria-label="ورود به تکنیک '+(i+1)+' '+e(t[0])+'"><span class="iconbox"><span class="icon-num">'+String(i+1).padStart(2,'0')+'</span><span class="icon-emoji" aria-hidden="true">'+(TECH_EMOJI[i]||'✦')+'</span></span><span class="tech-copy"><b>'+e(t[0])+'</b><small>'+e(t[1])+'</small></span><span class="lab-enter">ورود ←</span></button>').join('');
return intro+'<div class="catalog">'+cards+'</div>';
}
function showTechnique(d){
const title='<div class="subhero lab-tech-hero" style="background-image:linear-gradient(100deg,rgba(3,46,33,.98),rgba(4,77,53,.82) 62%,rgba(5,71,48,.42)),url('+fileFor(d)+')"><div><span class="eyebrow">جلسه دوم · تکنیک '+(chosenTech+1)+'</span><h1>'+e(d.icon)+' '+e(d.title)+'</h1><p>'+e(d.subtitle)+'</p></div></div>';
const cards=techStages.map((x,i)=>'<button class="stage-card lab-stage" onclick="go(\'stage\','+i+')" aria-label="ورود به مرحله '+(i+1)+'"><span class="stage-no"><span class="badge-digit">'+(i+1)+'</span><span class="badge-emoji" aria-hidden="true">'+x[0]+'</span></span><span class="body"><b>'+e(x[1])+'</b><small>'+e(x[2])+'</small></span><span class="arrow">←</span></button>').join('');
return title+'<div class="stage-grid">'+cards+'</div>';
}
function showPrinciples(d){
 const items=d.principles.map((p,i)=>'<details id="lab-principle-'+i+'" class="accordion lab-principle" '+(i===0?'open':'')+'><summary><span class="lab-principle-count">'+(i+1)+'</span><span>'+e(p[0])+'</span></summary><div><p class="lab-lead">'+e(p[1])+'</p><div class="compare"><div class="panel good"><b>✓ رفتار مناسب</b><p>'+e(p[2])+'</p></div><div class="panel bad"><b>✕ رفتار نامناسب</b><p>'+e(p[3])+'</p></div></div><details class="accordion lab-optional-science"><summary>چرا این روش مؤثرتر است؟</summary><div><p>'+e(p[4])+'</p><p><b>نشانه قابل مشاهده:</b> '+e(p[5])+'</p></div></details></div></details>').join('');
 return card(items+'<details class="accordion lab-optional-science"><summary>مبنای علمی و تصویر نمونه</summary><div><p>'+e(d.learningAnchor?.use||'')+'</p>'+photo(d,d.title)+'</div></details>','lab-principles');
}
function behaviorCues(p){
 if(!p)return '';
 return '<div class="lab-acting-cues"><div><b>🎙️ لحن:</b> '+e(p.voice||'آرام و روشن')+'</div><div><b>🧍 زبان بدن:</b> '+e(p.body||'باز و رو به مخاطب')+'</div><div><b>🙂 حالت چهره:</b> '+e(p.face||'متناسب با موقعیت')+'</div></div>';
}
function showQuiz(d){
  selectedPolls[chosenTech] ||= {};
  const ui=window.ALBORZ_QUIZ_UI;
  if(!ui)throw Error('Assessment UI not loaded for '+chosenTech);
  return card(ui.render(
    d.quiz,selectedPolls[chosenTech],(i,k)=>'chooseAdvancedPoll('+chosenTech+','+i+','+k+')',e,false
  ));
}
function showRoles(d){
const p=d.performance||{skill:d.title,setting:d.situation,opening:'',prompt:d.opening,voice:'روشن و محترمانه',body:'باز و متناسب',face:'طبیعی'};
const roleCards='<div class="rolecards"><div class="role"><h3>رئیس شعبه</h3><p>'+e(d.roles.a)+'</p></div><div class="role"><h3>'+e(partnerNames[chosenTech+1])+'</h3><p>'+e(d.roles.b)+'</p></div></div>';
return card('<div class="lab-role-scene"><b>صورت مسئله</b><p>'+e(d.situation)+'</p><p><b>طرف مقابل گفت‌وگو را این‌طور شروع می‌کند:</b> «'+e(p.opening.replace(/[«»]/g,''))+'»</p></div><div class="lab-skill-focus"><b>🎯 مهارتی که باید نشان دهید:</b> '+e(p.skill)+'</div><div class="lab-role-action"><strong>حالا شما چه می‌کنید؟</strong><p>'+e(p.prompt)+'</p></div>'+roleCards+behaviorCues(p));
}
function scriptRows(d){
return d.dialogue.map((turn,i)=>{
const role=turn[0]==='الف'?'رئیس شعبه':partnerNames[chosenTech+1];
const match=String(turn[1]).match(/^\[([^\]]+)\]\s*/);
const full=String(turn[1]); const speechText=match?full.replace(/^\[[^\]]+\]\s*/,''):full;
const visible=scriptView==='both'||(scriptView==='A'&&turn[0]==='الف')||(scriptView==='B'&&turn[0]==='ب');
const cue=d.delivery?.[i];
const direction=stageDirections&&cue?'<div class="performance-guide"><div class="performance-guide-heading">🎬 راهنمای اجرای این نوبت</div><div><b>🎙️ لحن و صدا:</b> '+e(cue.tone)+'</div><div><b>🧍 زبان بدن:</b> '+e(cue.body)+'</div><div><b>🙂 حالت چهره:</b> '+e(cue.face)+'</div></div>':(match&&stageDirections?'<div class="lab-direction">🎬 '+e(match[1])+'</div>':'');
return '<div class="speech '+(turn[0]==='الف'?'manager':'')+(visible?'':' hidden')+'"><small>'+(i+1)+' · '+e(role)+'</small><p>'+e(speechText)+'</p>'+direction+'</div>';
}).join('');
}
function showDialogue(d){
const p=d.performance;
return card('<div class="lab-skill-focus"><b>🎯 مهارت هدف:</b> '+e(p?.skill||d.title)+'</div><p class="lab-short-context">'+e(p?.setting||d.situation)+'</p><div class="scriptbar"><button class="tab '+(scriptView==='both'?'active':'')+'" onclick="showAdvancedRole(\'both\')">هر دو نقش</button><button class="tab '+(scriptView==='A'?'active':'')+'" onclick="showAdvancedRole(\'A\')">رئیس شعبه</button><button class="tab '+(scriptView==='B'?'active':'')+'" onclick="showAdvancedRole(\'B\')">مخاطب</button><button class="tab" onclick="toggleAdvancedDirection()">راهنمای اجرا '+(stageDirections?'روشن':'خاموش')+'</button><button class="tab" onclick="copyAdvancedScript()">کپی متن</button></div>'+scriptRows(d)+
'<details class="accordion lab-question-extra"><summary>❓ پرسش‌های بررسی گفت‌وگو</summary><div>'+d.pause.map(x=>'<p><b>پس از نوبت '+x.at+':</b> '+e(x.q)+'</p>').join('')+'</div></details>');
}
function showFeedback(d){
 selectedRubrics[chosenTech] ||= {};
 const scores=selectedRubrics[chosenTech],done=Object.keys(scores).length;
 const items=d.observe.map((label,i)=>'<div class="rubric lab-rubric-row"><b>'+e(label)+'</b><div class="scale" role="group" aria-label="'+e(label)+'">'+[1,2,3,4,5].map(n=>'<button type="button" aria-pressed="'+(scores[i]===n)+'" class="'+(scores[i]===n?'active':'')+'" onclick="rateAdvanced('+chosenTech+','+i+','+n+')">'+n+'</button>').join('')+'</div></div>').join('');
 const total=Object.values(scores).reduce((a,v)=>a+v,0);
 return card('<div class="lab-skill-focus"><b>🎯 رفتار مورد مشاهده:</b> '+e(d.performance?.skill||d.title)+'</div><p class="lab-feedback-hint">برای هر رفتار، از ۱ تا ۵ امتیاز بدهید و یک مثال واقعی از اجرای طرف مقابل بگویید.</p><div class="observer">'+items+'</div><div class="summary lab-rubric-summary"><b>'+(done===6?total+' / ۳۰':'ارزیابی '+done+' از ۶ رفتار')+'</b>'+(done===6?'<p>حالا یک رفتار برای بهترشدن انتخاب کنید.</p>':'')+'</div><label class="actionfield">چه چیزی خوب بود؟<textarea class="lab-positives" placeholder="مثلاً: با لحن آرام سؤال را روشن کرد."></textarea></label><label class="actionfield">دفعه بعد چه چیزی بهتر شود؟<textarea class="lab-change" placeholder="مثلاً: قبل از پاسخ، یک مکث کوتاه داشته باشد."></textarea></label><button class="navbtn" onclick="copyAdvancedFeedback()">کپی بازخورد</button>');
}
function showRepractice(d){
 const p=d.performance||{},r=d.repractice||{},cues={...p,voice:r.tone||p.voice};
 return card('<div class="lab-skill-focus"><b>🎯 همان مهارت:</b> '+e(p.skill||d.title)+'</div><div class="lab-role-scene"><b>همان ملاقات، یک اتفاق تازه</b><p>'+e(r.trigger||'')+'</p></div><div class="lab-role-action"><b>این بار چه می‌گویید؟</b><p>'+e(r.mission||p.prompt||'')+'</p></div>'+behaviorCues(cues)+'<div class="lab-retry-watch"><b>👀 هنگام اجرا توجه کنید:</b> '+e(r.watch||'لحن و رفتار متناسب')+'</div><details class="accordion lab-question-extra"><summary>نکته‌های کمکی</summary><div>'+r.constraints.map((v,i)=>'<p>'+(i+1)+'. '+e(v)+'</p>').join('')+'</div></details>');
}
function showTakeaways(d){
 return card('<div class="checks">'+d.takeaways.map((x,i)=>'<div class="checkitem"><b>'+(i+1)+'. </b>'+e(x)+'</div>').join('')+'</div><label class="actionfield">در ملاقات بعدی کدام رفتار را تمرین می‌کنید؟<textarea class="lab-commit" placeholder="مثلاً: در تماس با مشتری ناراضی، اول نگرانی او را می‌پرسم."></textarea></label><button class="navbtn next" onclick="copyAdvancedCommit()">کپی برنامه اقدام</button><details class="accordion lab-optional-science"><summary>منابع و نکات تخصصی</summary><div><p>این سناریوها تمرینی‌اند و جایگزین مقررات مصوب بیمه البرز نیستند.</p>'+d.sources.map(x=>'<p>• '+e(x)+'</p>').join('')+'</div></details>');
}
function showStage(d,i){
let content='';
if(i===0){
const p=d.practice||{questions:[]},g=d.performance||{skill:p.skill||d.title,prompt:d.opening,voice:'آرام و محترمانه',body:'باز و رو به مخاطب',face:'طبیعی'};
const extras=(p.questions||[]).map((q,n)=>'<p>'+(n+1)+'. '+e(q)+'</p>').join('');
content=card('<div class="casebox"><p>'+e(d.situation)+'</p></div><div class="lab-skill-focus"><b>🎯 مهارت هدف:</b> '+e(g.skill)+'</div><div class="prompt lab-simple-start"><b>نوبت شماست</b><p>'+e(g.prompt)+'</p></div>'+behaviorCues(g)+'<details class="accordion lab-simple-follow"><summary>دو سؤال برای گفت‌وگو</summary><div>'+extras+'</div></details>','lab-stage-intro lab-simple-case');
}
if(i===1)content=showPrinciples(d);
if(i===2)content=showQuiz(d);
if(i===3)content=showRoles(d);
if(i===4)content=showDialogue(d);
if(i===5)content=showFeedback(d);
if(i===6)content=showRepractice(d);
if(i===7)content=showTakeaways(d);
return '<section class="single-stage lab-page">'+pageTitle(techStages[i][0]+' '+(i+1)+'. '+techStages[i][1]+' — '+d.title,'','')+content+buttons(i)+'</section>';
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