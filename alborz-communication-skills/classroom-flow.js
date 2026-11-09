'use strict';
(function classroomApp(){
'use strict';
const params=new URLSearchParams(location.search);
if(params.get('classroom')!=='1')return;
const W=window.AlborzWorkshop,L=window.AlborzLive,root=document.getElementById('classroom-screen');
if(!W||!L||!root)return;
const C=W.catalog,labels=['شتر','ماهی آزاد','آفتاب‌پرست','اختاپوس'],animals=['🐪','🐟','🦎','🐙'];
const names=['تشکیل و تأیید گروه‌ها','معرفی چهار راهبرد','انتخاب مأموریت',...C.missionFlow,'جمع‌بندی و انتقال به کار'];
const keys=['camel','salmon','chameleon','octopus'];
const E=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const fa=n=>Number(n).toLocaleString('fa-IR');
const formatText=x=>E(x||'هنوز پاسخی ثبت نشده است');
const requested=keys.indexOf(params.get('mission'));
let identity=L.identity(),rows=[],stage=0,stageVersion=0,classroomRound=0,reference=requested>=0?requested:0,lastFingerprint='',notice='',busy=false,needsRefresh=false,openStep=0,previewStep=null;
const rubricQueue=new Map();let rubricPump=false;
function rec(team,key){return rows.find(r=>Number(r.team_no)===Number(team)&&r.field_key===key)||null;}
function val(team,key){return rec(team,key)?.field_value;}
function version(team,key){return rec(team,key)?.version??0;}
function groupChoice(team){const v=val(team,'missionChoice');return Number(val(team,'missionChoiceRound')??-1)===classroomRound&&Number.isInteger(v)&&v>=0&&v<=3?v:null;}
function usedMissions(team){return Array.from({length:classroomRound},(_,i)=>val(team,'missionRound'+i)).filter(Number.isInteger);}
function stepReady(team){return val(team,'classStepReady')===classroomRound+':'+stage;}
function readiness(){const active=groups().filter(confirmed),ready=active.filter(stepReady),waiting=active.filter(t=>!stepReady(t));return {active,ready,waiting};}
function size(team){const v=val(team,'groupSize');return [3,4,5].includes(v)?v:0;}
function confirmed(team){return val(team,'groupReady')===true;}
function checkin(team,j){return val(team,'checkin'+j)===true;}
function attendance(team){return Array.from({length:5},(_,j)=>checkin(team,j+1)).filter(Boolean).length;}
function groups(){return Array.from({length:10},(_,i)=>i+1);}
function clearNotice(){notice='';}
function alertUser(text,error=false){notice=text;let el=root.querySelector('#classroom-feedback');if(el){el.textContent=text;el.classList.toggle('is-error',error);}else render(true);}
function className(){return identity?.role==='teacher'?'مدرس کارگاه':'گروه '+fa(identity?.team||0)+' · عضو '+fa(identity?.member||0);}
function masteryLessons(){
 return '<section class="mastery-lessons"><h3>چهار راهبرد تاب‌آوری</h3><p>برای انتخاب درست، دو پرسش را با شواهد پاسخ دهید: آیا هسته خدمت باید تغییر کند؟ آیا کسب‌وکار مستقلی خارج از هسته مطرح است؟ این‌ها تیپ شخصیتی نیستند.</p><div class="mastery-matrix">'+
 C.mastery.map((m,i)=>'<div><strong>'+C.models[i][0]+' '+E(C.models[i][1])+'</strong><span>'+E(m.lesson.core)+'</span></div>').join('')+'</div>'+
 C.mastery.map((m,i)=>'<details class="mastery-lesson"><summary>'+C.models[i][0]+' '+E(C.models[i][1])+' · توضیح و مثال</summary><div class="mastery-lesson-body"><p><strong>معنای ساده:</strong> '+E(m.lesson.definition)+'</p><p><strong>شرایط کاربرد:</strong> '+E(m.lesson.condition)+'</p><p><strong>مرز با راهبردهای دیگر:</strong> '+E(m.lesson.boundary)+'</p><p><strong>اشتباه رایج:</strong> '+E(m.lesson.error)+'</p><p><strong>کاربرد در بیمه:</strong> '+E(C.models[i][6])+'</p><strong>سه اقدام مناسب</strong><ol>'+m.lesson.actions.map(x=>'<li>'+E(x)+'</li>').join('')+'</ol><p class="mastery-takeaway">'+E(m.lesson.takeaway)+'</p></div></details>').join('')+
 '<p class="mastery-source">اقتباس از چهار راهبرد سازمانی Kurt Verweire؛ این چارچوب آزمون شخصیت نیست.</p></section>';
}
function masteryRoles(i){
 const m=C.mastery[i],info=C.missions[i].info;
 return '<section class="mastery-roles"><h3>پنج شخصیت این مأموریت</h3><p>هر نفر فقط اطلاعات شخصیت خودش را بخواند و با همان نگرانی و هدف وارد گفت‌وگو شود. در گروه سه یا چهار‌نفره می‌توانید دو نقش بگیرید؛ مشاهده‌گر هم در تحلیل پایانی صحبت می‌کند.</p><div class="mastery-person-grid">'+m.people.map((p,j)=>'<details class="mastery-person"><summary><span class="mastery-person-num">'+fa(j+1)+'</span><span><strong>'+E(p.name)+'</strong><small>'+E(p.role)+'</small></span></summary><div class="mastery-person-body"><p><b>هدف من:</b> '+E(p.goal)+'</p><p><b>نگرانی من:</b> '+E(p.concern)+'</p><p><b>اطلاعات اختصاصی:</b> '+E(info[j])+'</p><p><b>لحن و رفتار:</b> '+E(p.style)+'</p><p class="mastery-person-cue"><b>راهنمای شروع:</b> '+E(p.cue)+'</p></div></details>').join('')+'</div><p class="mastery-tip">نقش را طبیعی اجرا کنید؛ لازم نیست دیالوگ را از حفظ بگویید. اسم‌ها فرضی‌اند و اطلاعات واقعی مراجعان نباید وارد تمرین شود.</p></section>';
}

function masteryTalk(i){
 const m=C.mastery[i],lines=m.after;
 const summary=[
 'در شتر، تیم روش معتبر رسیدگی را حفظ می‌کند و به جای قول پرداخت یا حذف کنترل، تقسیم کار، ثبت مصوب و زمان پیگیری را روشن می‌سازد. این راهبرد به معنی تحمل فرسودگی نیست.',
 'در ماهی آزاد، گفت‌وگو از استقبال شفاهی به ارزش پیشنهادی، تمایل واقعی به پرداخت و آزمون کسب‌وکار مستقل می‌رسد. هسته رسیدگی خسارت ثابت می‌ماند و هیچ قرارداد بی‌مجوزی وعده داده نمی‌شود.',
 'در آفتاب‌پرست، مسئله از سرزنش مالی و پذیرش به بازطراحی مالکیت پرونده و معیار تحویل منتقل می‌شود. تغییر هسته زمانی واقعی است که رفت‌وآمد، خطا و کیفیت قبل و بعد سنجیده شوند.',
 'در اختاپوس، دو جریان متمایز روشن می‌شوند: تحول مدل اصلی رسیدگی و کسب‌وکار جدید پایش ریسک. محدودیت نیرو و بودجه، ترتیب شروع و شرط توقف را تعیین می‌کند، نه فشار بیشتر بر کارکنان.'
 ][i];
 return '<section class="mastery-dialogues"><h3>گفت‌وگوی نمونه · '+E(C.models[i][1])+'</h3><div class="mastery-dialogue">'+lines.map((x,n)=>'<article class="mastery-turn mastery-speaker-'+x.p+'"><div class="mastery-speaker"><span class="mastery-speaker-avatar">'+E(m.people[x.p].name.charAt(0))+'</span><div><strong>'+E(m.people[x.p].name)+'</strong><small>'+E(m.people[x.p].role)+'</small></div><em>'+fa(n+1)+'</em></div><p>'+E(x.t)+'</p></article>').join('')+'</div><section class="mastery-final-analysis"><h4>تحلیل پایانی</h4><p>'+E(summary)+'</p></section></section>';
}
const singleAnswers=Object.create(null);
function assessmentKey(){return 'alborz-reflection-once-v1-'+(identity?.role==='team'?'group'+identity.team+'member'+identity.member:'instructor');}
function assessmentValues(){try{return JSON.parse(sessionStorage.getItem(assessmentKey())||'{}')}catch{return {}}}
function oneTimeAssessment(){
 const labels=['در فشار، قبل از واکنش مسئله را دقیق تشخیص می‌دهم.','وعده خارج از اختیار نمی‌دهم و زمان پیگیری روشن ارائه می‌کنم.','اختلال موقت را از نقص ساختاری روش کار تمیز می‌دهم.','در پیشنهاد خدمت جدید، مجوز و فرضیه پرداخت را بررسی می‌کنم.','هنگام محدودیت منابع، اولویت را شفاف و قابل دفاع بیان می‌کنم.','پس از اتفاق غیرمنتظره، تصمیمم را بر اساس شاهد تازه اصلاح می‌کنم.'];
 const saved=assessmentValues(),count=labels.filter((_,i)=>Number(saved[i])>=1).length;
 return '<section class="mastery-lessons one-time-assessment"><h3>خودارزیابی من · فقط یک نوبت</h3><p>برای هر گزاره، رفتارتان در محیط کار را ارزیابی کنید. این یک ابزار یادگیری شخصی است؛ قبل/بعد و رتبه‌بندی افراد نداریم. پاسخ‌ها فقط روی همین دستگاه نگهداری می‌شوند.</p><div class="one-assessment-items">'+labels.map((q,i)=>'<label><strong>'+fa(i+1)+'. '+E(q)+'</strong><select data-class-single-assessment="'+i+'"><option value="">انتخاب کنید</option>'+[1,2,3,4].map(v=>'<option value="'+v+'" '+(Number(saved[i])===v?'selected':'')+'>'+fa(v)+' · '+['به‌ندرت','گاهی','اغلب','تقریباً همیشه'][v-1]+'</option>').join('')+'</select></label>').join('')+'</div><p class="mastery-one-status" role="status">'+(count===6?'هر شش گزاره ثبت شد. این ارزیابی یک‌نوبتی است.':'پاسخ ثبت‌شده: '+fa(count)+' از ۶')+'</p></section>';
}
const professionalAnswers=Object.create(null);
function testKey(){return 'alborz-professional-ten-v1-'+(identity?.role==='team'?'group'+identity.team+'member'+identity.member:'instructor');}
function testAnswers(){try{return JSON.parse(sessionStorage.getItem(testKey())||'{}')}catch{return {}}}
function professionalTest(){
 const saved=testAnswers(),done=Object.keys(saved).filter(k=>C.professionalQuiz[Number(k)]).length;
 return '<section class="mastery-lessons professional-ten"><h3>آزمون حرفه‌ای · ۱۰ موقعیت تصمیم‌گیری</h3><p>هر سؤال چند مفروض مشخص دارد. یک تصمیم مناسب‌تر انتخاب کنید؛ سپس تحلیل مستقل تمام سه گزینه نمایش داده می‌شود. پاسخ را می‌توانید بازبینی کنید.</p><p class="professional-progress">پاسخ‌داده‌شده: '+fa(done)+' از ۱۰</p>'+
 C.professionalQuiz.map((q,i)=>'<article class="professional-question" data-professional-question="'+i+'"><h4>سؤال '+fa(i+1)+' · '+E(q.stem)+'</h4><div class="professional-facts"><strong>مفروضات مسئله</strong><ul>'+q.facts.map(f=>'<li>'+E(f)+'</li>').join('')+'</ul></div><div class="professional-options">'+q.options.map((o,j)=>'<button type="button" class="mastery-answer '+(saved[i]===j?'is-selected':'')+'" data-professional-answer="'+i+'" data-professional-option="'+j+'" aria-pressed="'+(saved[i]===j?'true':'false')+'">'+fa(j+1)+'. '+E(o.t)+'</button>').join('')+'</div><div class="professional-explanation" data-professional-explanation="'+i+'" aria-live="polite">'+(saved[i]!==undefined?professionalExplanation(i,saved[i]):'')+'</div></article>').join('')+'</section>';
}
function professionalExplanation(i,chosen){
 const q=C.professionalQuiz[i],good=q.options[chosen]?.correct;
 return '<strong>'+(good?'✓ تصمیم مناسب‌تر را انتخاب کردید.':'این گزینه با تمام شواهد سازگار نیست؛ تحلیل تصمیم را بخوانید.')+'</strong>'+
 q.options.map((o,j)=>'<p><b>گزینه '+fa(j+1)+(o.correct?' · مناسب‌تر':'')+':</b> '+E(o.why)+'</p>').join('');
}
function lessonRow(phase=stage){return '<div class="class-stage-marker"><span>مرحله '+fa(phase+1)+' از ۱۱</span><strong>'+E(names[phase])+'</strong></div>';}
function stepMap(){
 const teacher=identity?.role==='teacher';
 const cards=names.map((name,i)=>{
  const state=i<stage?'complete':i===stage?'active':'upcoming';
  const status=i<stage?'✓ انجام‌شده':i===stage?'● گام فعال':'○ گام بعدی';
  const action=teacher?'باز کردن مستقل؛ بدون تغییر مرحله کلاس':i===stage?'باز کردن فعالیت این گام':i<stage?'مرور عنوان گام':'مشاهده جایگاه گام';
  return '<button type="button" class="classroom-map-card '+state+'" data-class-open="'+i+'" '+(i===stage?'aria-current="step" ':'')+'aria-label="گام '+fa(i+1)+'، '+E(name)+'، '+status+'"><span class="classroom-map-num">'+fa(i+1)+'</span><span class="classroom-map-details"><strong>'+E(name)+'</strong><small>'+status+'</small><em>'+action+'</em></span></button>';
 }).join('');
 const intro=teacher?'برای ممیزی محتوا می‌توانید هر ۱۱ گام را مستقل باز کنید؛ در حالت پیش‌نمایش، مرحله گروه‌ها و پاسخ‌های آن‌ها تغییر نمی‌کند.':'همه گام‌ها را از ابتدا می‌بینید. گام فعال را باز کنید و همراه با مدرس پیش بروید؛ گام‌های بعدی با هدایت مدرس فعال می‌شوند.';
 const preview=previewStep===null?'':'<div class="classroom-map-preview" role="status"><h3>گام '+fa(previewStep+1)+' · '+E(names[previewStep])+'</h3><p>'+(previewStep<stage?'این گام قبلاً طی شده است. فعالیت جاری را از گام مشخص‌شده با نشان «گام فعال» ادامه دهید.':'این گام هنوز فعال نشده است. پس از تکمیل گام‌های قبلی و اعلام مدرس، می‌توانید فعالیت آن را باز کنید.')+'</p></div>';
 return '<section class="classroom-map"><div class="classroom-map-intro"><span>مسیر مشترک تاب‌آوری</span><h2>مسیر کارگاه در ۱۱ گام</h2><p>'+intro+'</p></div><div class="classroom-map-grid" aria-label="فهرست کلیک‌پذیر یازده گام">'+cards+'</div>'+preview+'</section>';
}
function messageBox(){return '<p id="classroom-feedback" class="classroom-feedback" role="status">'+E(notice)+'</p>';}
function simpleTitle(kicker,title,description){return '<div class="classroom-section-title"><span>'+E(kicker)+'</span><h2>'+E(title)+'</h2>'+(description?'<p>'+E(description)+'</p>':'')+'</div>';}
function personDots(team){return '<div class="classroom-member-dots">'+Array.from({length:5},(_,j)=>'<span class="'+(checkin(team,j+1)?'has-arrived':'')+'">عضو '+fa(j+1)+(checkin(team,j+1)?' ✓':' ○')+'</span>').join('')+'</div>';}
function rosterTeacher(){
 const ready=groups().filter(confirmed).length,attending=groups().reduce((n,t)=>n+attendance(t),0);
 return simpleTitle('مرحله شروع','گروه‌ها را آماده کنیم','کارشناسان با کد ملی وارد می‌شوند و گروه آن‌ها به‌صورت خودکار تعیین می‌شود. بسته به حضور واقعی، گروه‌ها می‌توانند سه، چهار یا پنج نفره باشند. پس از ثبت حضور، هر گروه را تأیید کن.')+
 '<div class="classroom-stats"><span>'+fa(ready)+' گروه تأیید‌شده</span><span>'+fa(attending)+' عضو حاضر</span></div>'+
 '<div class="classroom-team-list">'+groups().map(t=>{const n=size(t),c=attendance(t);return '<article class="classroom-team-row"><div><h3>گروه '+fa(t)+(confirmed(t)?'<small class="class-ready">آماده ✓</small>':'')+'</h3><p>'+fa(c)+' حضور ثبت‌شده · ظرفیت گروه: '+(n?fa(n):'هنوز مشخص نشده')+'</p>'+personDots(t)+'</div><label>ظرفیت گروه<select data-class-team-size="'+t+'"><option value="0" '+(!n&&!c?'selected':'')+'>فعال نیست</option>'+[3,4,5].map(v=>'<option value="'+v+'" '+(v===n||!n&&c>0&&v===Math.min(5,Math.max(3,c))?'selected':'')+'>'+fa(v)+' نفر</option>').join('')+'</select></label><button type="button" class="btn '+(confirmed(t)?'':'primary')+'" data-class-confirm="'+t+'">'+(confirmed(t)?'ثبت دوباره':'تأیید گروه')+'</button></article>';}).join('')+'</div>'+
 '<p class="classroom-footnote">برای هر گروه پنج جایگاه ثبت‌نام وجود دارد؛ مدرس می‌تواند با توجه به تعداد حاضران، گروه‌های سه تا پنج نفره را تأیید کند. ورود تکراری با همان کد ملی، همان گروه و همان شماره عضو را باز می‌کند.</p>';
}
function checkinParticipant(){
 const t=identity.team,m=identity.member,count=attendance(t),done=checkin(t,m);
 return simpleTitle('مرحله ۱','گروه شما مشخص شد','نام گروه و شماره عضو هنگام ورود با کد ملی تعیین شده‌اند؛ لازم نیست گروه را دستی انتخاب کنی.')+
 '<div class="classroom-welcome"><div><small>شماره گروه</small><strong>'+fa(t)+'</strong></div><div><small>شماره عضو</small><strong>'+fa(m)+'</strong></div></div>'+
 '<div class="classroom-checkin"><h3>حضور خود را تأیید کن</h3><p>'+(done?'حضور تو ثبت شده است.':'پس از ورود، روی دکمه تأیید حضور بزن.')+'</p><button class="btn primary" data-class-checkin '+(done?'disabled':'')+'>'+(done?'حضور من ثبت شد ✓':'حضورم را تأیید می‌کنم')+'</button></div>'+
 personDots(t)+'<p class="classroom-wait">'+fa(count)+' عضو حضورشان را ثبت کرده‌اند. '+(confirmed(t)?'مدرس این گروه را تأیید کرده است.':'منتظر تأیید تشکیل گروه توسط مدرس بمانید.')+'</p>';
}
function strategyCards(){
 return '<div class="classroom-strategy-grid">'+C.models.map((m,i)=>'<article><span>'+m[0]+'</span><h3>'+E(m[1])+'</h3><strong>'+E(m[4])+'</strong><p>'+E(m[5])+'</p></article>').join('')+'</div>';
}
function strategyIntro(teacher){
 return simpleTitle('گام آشنایی','چهار راهبرد تاب‌آوری','این‌ها چهار انتخاب راهبردی‌اند؛ تیپ شخصیتی یا برچسب کارکنان نیستند.')+
 strategyCards()+masteryLessons()+oneTimeAssessment()+professionalTest()+
 '<p class="classroom-wait">'+(teacher?'چهار راهبرد، خودارزیابی یک‌نوبتی و آزمون ده‌سؤالی را مرور کن؛ سپس انتخاب مأموریت را آغاز کن.':'راهبردها، خودارزیابی یک‌نوبتی و ده سؤال حرفه‌ای را مرور کنید؛ سپس گروه خود مأموریتش را انتخاب می‌کند.')+'</p>';
}
function missionRoster(){
 const list=groups().filter(t=>confirmed(t)||attendance(t)||groupChoice(t)!==null);
 if(!list.length)return '<p class="classroom-empty">هنوز گروهی تشکیل نشده است.</p>';
 return '<div class="classroom-choice-roster">'+list.map(t=>'<div><strong>گروه '+fa(t)+'</strong><span>'+(groupChoice(t)===null?'مأموریت انتخاب نشده':animals[groupChoice(t)]+' '+labels[groupChoice(t)])+'</span></div>').join('')+'</div>';
}
function chooseMission(){
 const t=identity.team,selected=groupChoice(t),used=usedMissions(t);
 return simpleTitle('مرحله انتخاب مأموریت','مأموریت گروه را انتخاب کنید','هر گروه می‌تواند یکی از چهار مأموریت را مستقل از انتخاب گروه‌های دیگر بردارد. همه اعضای گروه روی همان مأموریت کار می‌کنند.')+
 '<div class="classroom-choice-grid">'+C.models.map((m,i)=>'<button class="'+(selected===i?'selected':'')+'" type="button" data-class-mission="'+i+'" '+(used.includes(i)?'disabled aria-disabled="true"':'')+'><b>'+m[0]+' '+E(m[1])+'</b><small>'+E(C.missions[i].title)+'</small><span>'+(used.includes(i)?'در دور قبل انجام شد ✓':selected===i?'انتخاب گروه ✓':requested===i?'پیشنهاد ورود شما':'انتخاب این مأموریت')+'</span></button>').join('')+'</div>'+
 '<p class="classroom-wait">'+(selected===null?'هنوز مأموریتی برای گروه ثبت نشده است.':'مأموریت «'+labels[selected]+'» ثبت شد. اکنون منتظر شروع سناریو از سوی مدرس بمانید.')+'</p>';
}
function missionTeacherChoice(){
 const ready=groups().filter(confirmed),pending=ready.filter(t=>groupChoice(t)===null);
 return simpleTitle('انتخاب مأموریت گروه‌ها','گروه‌ها مأموریت این دور را انتخاب می‌کنند','هر گروه مأموریت دلخواه خودش را انتخاب می‌کند؛ همه گروه‌ها هفت گام مشترک را با هدایت مدرس پیش می‌برند.')+
 missionRoster()+'<p class="classroom-wait">'+(pending.length?'هنوز '+fa(pending.length)+' گروه تأیید‌شده مأموریت انتخاب نکرده‌اند.':'گروه‌های تأیید‌شده آماده ورود به سناریو هستند.')+'</p>';
}
function teacherStep(phase=stage){
 const i=reference,n=phase-3,m=C.missions[i],d=C.cases[i],x=C.embedded[i],mod=C.models[i];
 const say=[
 '«مسئله را بخوانید. هدف ما این است: '+d.goal+'»',
 '«پنج نقش را متناسب با تعداد افراد تقسیم کنید. در گروه‌های سه یا چهار‌نفره، بعضی نفرات دو نقش می‌گیرند؛ هر نفر اطلاعات نقش خود را برای گروه توضیح دهد.»',
 '«گفت‌وگو را یک بار اجرا کنید؛ مشاهده‌گر بازخورد بدهد و گفت‌وگو را بار دوم اصلاح کنید.»',
 '«با شش سکه حداقل دو اقدام انتخاب کنید؛ تصمیم اولیه، دلیل و مسئول را ثبت کنید.»',
 '«اکنون یک اتفاق تازه داریم. ببینید تصمیم قبلی هنوز مناسب است یا نه.»',
 '«با توجه به اطلاعات تازه، چه چیزی را در تصمیم اصلاح می‌کنید و چرا؟»',
 '«هر گروه یک تصمیم قابل دفاع و یک نکته بهبود را با شواهد واقعی گفت‌وگو ارائه کند.»'
 ][n];
 const ask=[
 'موقعیت و سه داده اصلی را بخوانند و مسئله را در یک جمله بیان کنند.',
 'نقش‌ها را تقسیم کنند و هر فرد اطلاعات اختصاصی نقش خود را مطرح کند.',
 'دو دور Role Play اجرا کنند؛ مشاهده‌گر رفتار و جمله‌های واقعی را یادداشت کند.',
 'دو یا چند اقدام در سقف ۶ سکه انتخاب و تصمیم اولیه را با گروه به اشتراک بگذارند.',
 'اتفاق تازه را بخوانند و درباره تأثیر آن بر تصمیم گفت‌وگو کنند.',
 'تصمیم اصلاح‌شده و دلیل آن را ثبت و به اشتراک بگذارند.',
 'یک شاهد رفتاری ثبت کنند و نتیجه را برای جمع‌بندی کلاسی آماده کنند.'
 ][n];
 const bodies=[
 '<div class="classroom-story"><h3>چه اتفاقی افتاده؟</h3><p>'+E(d.situation)+'</p><h3>اطلاعاتی که گروه هم می‌بیند</h3><ul>'+d.facts.map(f=>'<li>'+E(f)+'</li>').join('')+'</ul><h3>پرسش چالشی</h3><p>'+E(d.question)+'</p></div>',
 masteryRoles(i),
 '<div class="classroom-duo"><div><b>مدیریت هیجان</b><p>'+E(x.anger)+'</p></div><div><b>جرأت‌ورزی</b><p>'+E(x.assertion)+'</p></div></div>'+masteryTalk(i),
 '<details class="classroom-reference"><summary>کارت‌های تصمیم و پیامدها</summary>'+m.actions.map(a=>'<p><strong>'+E(a[0])+' · '+fa(a[1])+' سکه</strong> — '+E(a[2])+'</p>').join('')+'</details>',
 '<div class="classroom-event"><h3>اتفاق تازه</h3><p>'+E(m.shock)+'</p></div>',
 '<p class="classroom-prompt">'+E(d.question)+'</p>',
 masteryObserver(i,true)
 ][n];
 return '<div class="classroom-teacher-scene">'+simpleTitle('هدایت سناریو','گام '+fa(n+1)+' از ۷ · '+C.missionFlow[n],'نمونه توضیح از سناریوی '+labels[i]+'؛ گروه‌های دیگر می‌توانند سناریوی متفاوتی داشته باشند.')+
 '<div class="classroom-teacher-switch">'+C.models.map((v,j)=>'<button type="button" class="'+(j===i?'selected':'')+'" data-class-reference="'+j+'">'+v[0]+' '+E(v[1])+'</button>').join('')+'</div>'+
 '<h3 class="classroom-case-caption">'+mod[0]+' '+E(m.title)+'</h3>'+
 '<div class="classroom-duo"><article><span>🎙️ مدرس چه بگوید؟</span><p>'+E(say)+'</p></article><article><span>📱 گروه‌ها چه کنند؟</span><p>'+E(ask)+'</p></article></div>'+
 '<div class="classroom-detail">'+bodies[n]+'</div>'+
 '<details class="classroom-monitor"><summary>مشاهده پیشرفت و پاسخ گروه‌ها</summary>'+monitorAllGroups()+'</details></div>';
}
function monitorAllGroups(){
 const list=groups().filter(t=>confirmed(t)||attendance(t)||groupChoice(t)!==null);
 if(!list.length)return '<p class="classroom-empty">هنوز گروهی فعالیتی ثبت نکرده است.</p>';
 return '<div class="classroom-monitor-list">'+list.map(t=>{
  const i=groupChoice(t),p=i===null?'':String(i),prefix='r'+p;
  const initial=i===null?'':val(t,prefix+'initial'),revision=i===null?'':val(t,prefix+'revision');
  const scores=i===null?[]:Array.from({length:5},(_,j)=>val(t,prefix+'score'+j));
  const complete=scores.length===5&&scores.every(v=>['0','1','2'].includes(v));
  const score=complete?scores.reduce((n,v)=>n+Number(v),0):null;
  const voices=i===null?[]:Array.from({length:5},(_,j)=>val(t,prefix+'member'+(j+1))).filter(v=>typeof v==='string'&&v.trim());
  const rubric=i===null?[]:C.mastery[i].observer;
  return '<details><summary><strong>گروه '+fa(t)+'</strong><span>'+(i===null?'بدون مأموریت':animals[i]+' '+labels[i])+'</span><small>'+(initial?'تصمیم اول ✓':'تصمیم اول ○')+' · '+(revision?'اصلاح ✓':'اصلاح ○')+' · '+(complete?'بازخورد '+fa(score)+'/۱۰':'بازخورد در انتظار')+'</small></summary>'+
  '<p><b>تصمیم اولیه:</b> '+formatText(initial)+'</p><p><b>تصمیم اصلاح‌شده:</b> '+formatText(revision)+'</p>'+
  (complete?'<p><b>ارزیابی رفتاری گروه:</b> '+fa(score)+' از ۱۰ · صرفاً برای یادگیری، نه ارزیابی فردی</p><ol>'+rubric.map((r,j)=>'<li>'+E(r.criterion)+': '+fa(Number(scores[j]))+' از ۲</li>').join('')+'</ol>':'<p>پنج معیار اختصاصی مشاهده‌گر هنوز کامل نشده‌اند.</p>')+
  '<p><b>شواهد رفتاری ثبت‌شده:</b> '+fa(voices.length)+' عضو</p>'+
  (voices.length?'<ul>'+voices.map(v=>'<li>'+E(v)+'</li>').join('')+'</ul>':'')+'</details>';
 }).join('')+'</div>';
}

function learnerMission(){
 const team=identity.team,i=groupChoice(team);
 if(i===null)return simpleTitle('یک انتخاب باقی مانده','گروه هنوز مأموریت ندارد','هم‌اکنون یکی از چهار مأموریت را انتخاب کنید تا به گام جاری کلاس برسید.')+chooseMission();
 const n=stage-3,m=C.missions[i],d=C.cases[i],x=C.embedded[i],prefix='r'+i,member=identity.member;
 const title=simpleTitle(animals[i]+' '+labels[i],'گام '+fa(n+1)+' از ۷ · '+C.missionFlow[n],m.title);
 let body='';
 if(n===0)body='<div class="classroom-story"><h3>هدف شما</h3><p>'+E(d.goal)+'</p><h3>چه اتفاقی افتاده؟</h3><p>'+E(d.situation)+'</p><h3>سه داده مهم</h3><ul>'+d.facts.map(v=>'<li>'+E(v)+'</li>').join('')+'</ul><h3>پرسش گروه</h3><p>'+E(d.question)+'</p></div>';
 if(n===1)body=masteryRoles(i);
 if(n===2)body='<div class="classroom-duo"><div><b>مدیریت هیجان</b><p>'+E(x.anger)+'</p></div><div><b>جرأت‌ورزی</b><p>'+E(x.assertion)+'</p></div></div>'+masteryTalk(i);
 if(n===3){const savedPick=val(team,prefix+'pick'),picked=Array.isArray(savedPick)?savedPick:[];
 body='<p class="classroom-prompt">با ۶ سکه حداقل دو اقدام انتخاب کنید. یک نفر تصمیم را از طرف گروه ثبت کند.</p><div class="classroom-money">بودجه تصمیم: <strong>۶ سکه</strong></div><div class="classroom-options">'+m.actions.map((a,j)=>'<label><input type="checkbox" data-class-pick="'+j+'" '+(picked.includes(j)?'checked':'')+'><span>'+E(a[0])+'</span><b>'+fa(a[1])+' سکه</b></label>').join('')+'</div><label class="classroom-input"><span>تصمیم و دلیل گروه</span><textarea data-class-answer="initial" rows="3" placeholder="چه اقدام‌هایی را انتخاب کردید؟ چرا؟ مسئول کیست؟">'+E(val(team,prefix+'initial')||'')+'</textarea></label><button class="btn primary" data-class-save="initial">ثبت تصمیم گروه</button>'+(val(team,prefix+'initial')?'<p class="classroom-saved">تصمیم قبلی گروه ثبت شده است ✓</p>':'');}
 if(n===4)body='<div class="classroom-event"><h3>اتفاق جدید</h3><p>'+E(m.shock)+'</p></div><p class="classroom-prompt">به تصمیم قبلی‌تان فکر کنید. آیا با این اطلاعات هنوز آن را مناسب می‌دانید؟</p>';
 if(n===5)body='<p class="classroom-prompt">کدام بخش از تصمیم اولیه باید تغییر کند؟ دلیل خود را بنویسید.</p><label class="classroom-input"><span>تصمیم اصلاح‌شده گروه</span><textarea data-class-answer="revision" rows="4" placeholder="چه چیزی را تغییر دادید و بر اساس چه شاهدی؟">'+E(val(team,prefix+'revision')||'')+'</textarea></label><button class="btn primary" data-class-save="revision">ثبت تصمیم اصلاح‌شده</button>'+(val(team,prefix+'revision')?'<p class="classroom-saved">اصلاح قبلی ثبت شده است ✓</p>':'');
 if(n===6){const k=prefix+'member'+member;body=masteryObserver(i)+'<p class="classroom-prompt">یک مثال از رفتار یا جمله قابل مشاهده در اجرای گروه را ثبت کنید.</p><label class="classroom-input"><span>شاهد من · عضو '+fa(member)+'</span><textarea data-class-answer="evidence" rows="3" placeholder="مثلاً چه جمله‌ای باعث شد گفت‌وگو بهتر پیش برود؟">'+E(val(team,k)||'')+'</textarea></label><button class="btn primary" data-class-save="evidence">ثبت مشاهده من</button><div class="classroom-recap"><p><b>تصمیم اولیه:</b> '+formatText(val(team,prefix+'initial'))+'</p><p><b>تصمیم اصلاح‌شده:</b> '+formatText(val(team,prefix+'revision'))+'</p></div>';}
 return title+body+'<div class="classroom-ready-action"><button type="button" class="btn primary" data-class-ready '+(stepReady(team)?'disabled':'')+'>'+(stepReady(team)?'این گام انجام شد ✓':'این گام را انجام دادیم')+'</button><p>پس از انجام فعالیت گروهی، یک نفر دکمه را بزند. مدرس می‌بیند گروه شما آماده گام بعد است.</p></div><p class="classroom-wait">منتظر اعلام مرحله بعد از سوی مدرس بمانید؛ صفحه خودکار به‌روز می‌شود.</p>';
}
function ending(){
 return simpleTitle('جمع‌بندی','از این مأموریت چه یاد گرفتیم؟','گروه‌ها تجربه، تصمیم و نکته قابل انتقال به محیط خسارت را با هم مرور می‌کنند.')+
 (identity.role==='teacher'?'<p class="classroom-prompt">از گروه‌ها بخواه یک تصمیم درست و یک اصلاح مهم را با شاهد توضیح دهند؛ سپس هر نفر یک اقدام کوچک برای کار روزمره مشخص کند.</p>'+monitorAllGroups():'<p class="classroom-prompt">هر نفر یک اقدام کوچک برای بهبود کار روزمره مشخص کند. ادامه دوره در بخش مستقل مدیریت خشم است.</p>');
}

function render(force=false){
 if(!root)return;
 if(!identity){root.innerHTML='<p class="classroom-wait">ابتدا با کد ملی (کارشناسان) یا کد اختصاصی مدرس وارد کارگاه شوید.</p>';lastFingerprint='';return;}
 const teacher=identity.role==='teacher';
 const displayStage=teacher&&previewStep!==null?previewStep:stage,previewActive=teacher&&previewStep!==null;
 const signature=String(stage)+'/'+String(previewStep)+'/'+String(openStep)+'/'+String(classroomRound)+'/'+String(teacher?'t':identity.team)+'/'+String(teacher?reference:groupChoice(identity.team))+'/'+JSON.stringify(rows.map(r=>[r.team_no,r.field_key,r.field_value,r.version]));
 if(!force&&signature===lastFingerprint)return;
 if(!force&&root.contains(document.activeElement)&&document.activeElement.matches('textarea,input,select')){needsRefresh=true;return;}
 needsRefresh=false;lastFingerprint=signature;
 const ahead=stage===10?2:stage+1;
 const countConfirmed=groups().filter(confirmed).length;
 const allReadyHaveMission=groups().filter(confirmed).every(t=>groupChoice(t)!==null);
 const stepProgress=readiness();
 const nextDisabled=teacher &&(stage===0&&countConfirmed===0||stage===2&&(countConfirmed===0||!allReadyHaveMission)||stage>=3&&stage<=9&&stepProgress.waiting.length>0||stage===10);
 const guideNote=stage>=3&&stage<=9?'آماده: '+fa(stepProgress.ready.length)+' از '+fa(stepProgress.active.length)+' گروه'+(stepProgress.waiting.length?' · منتظر گروه‌های '+stepProgress.waiting.map(fa).join('، '):' · همه آماده‌اند'):'تغییر مرحله روی موبایل گروه‌ها حدود ۱۰ ثانیه زمان می‌برد.';
 const header='<header class="classroom-top"><div><span>'+E(className())+'</span><h1>کارگاه تاب‌آوری · اجرای مرحله‌به‌مرحله</h1></div>'+lessonRow(displayStage)+'</header>';
 const controls=teacher?(previewActive?'<div class="classroom-preview-banner" role="status"><strong>👁️ پیش‌نمایش مستقل گام '+fa(displayStage+1)+'</strong><span>گام واقعی کلاس '+fa(stage+1)+' است؛ مشاهده این صفحه هیچ مرحله یا پاسخی را تغییر نمی‌دهد.</span><button type="button" class="btn primary" data-class-return-live>بازگشت به گام فعال کلاس</button></div>':'<nav class="classroom-controls" aria-label="کنترل مسیر کلاس"><button class="btn" data-class-prev '+(stage===0?'disabled':'')+'>گام قبل</button><div class="classroom-controls-note">'+E(guideNote)+'</div><button class="btn primary" data-class-next '+(nextDisabled?'disabled':'')+' >'+(stage===10?'بخش تاب‌آوری کامل شد':'گام بعد')+'</button></nav>') : '';
 let content;
 if(displayStage===0)content=teacher?rosterTeacher():checkinParticipant();
 else if(!teacher&&!confirmed(identity.team))content=simpleTitle('در انتظار تأیید گروه','مدرس هنوز گروه شما را تأیید نکرده است','پس از ثبت حضور و اعلام تعداد افراد، مدرس گروه را فعال می‌کند. سپس همین صفحه به‌طور خودکار وارد گام جاری می‌شود.')+personDots(identity.team);
 else if(displayStage===1)content=strategyIntro(teacher);
 else if(displayStage===2)content=teacher?missionTeacherChoice():chooseMission();
 else if(displayStage<=9)content=teacher?teacherStep(displayStage):learnerMission();
 else content=ending();
 const resetPanel=teacher?'<details class="classroom-reset"><summary>شروع کارگاه جدید · تنظیمات مدرس</summary><p>برای پاک‌سازی پاسخ‌ها و حضورهای آزمایشی و شروع از مرحله اول استفاده کنید. عضویت‌های ثبت‌شده با کد ملی و محتوای کارگاه حفظ می‌شوند. این عملیات قابل بازگشت نیست.</p><button type="button" class="btn" data-class-reset>پاک‌کردن داده‌های تست و شروع تازه</button></details>':'';
 const inStep=openStep===displayStage;
 const navigation=inStep?'<nav class="classroom-map-return"><button type="button" class="btn" data-class-overview>← بازگشت به نقشه ۱۱ گام</button><span>گام '+fa(displayStage+1)+' از ۱۱ · '+E(names[displayStage])+'</span></nav>':'';
 root.innerHTML='<div class="classroom-layout">'+header+messageBox()+(inStep?navigation+controls+'<main class="classroom-content">'+content+'</main>':'<main class="classroom-content">'+stepMap()+'</main>')+resetPanel+'</div>';
}
async function execute(task){
 if(busy)return;busy=true;
 try{await task();clearNotice();await L.refresh();lastFingerprint='';render(true);}
 catch(e){alertUser(e.message||'خطای ارتباط؛ دوباره تلاش کنید',true);}
 finally{busy=false;if(rubricQueue.size&&!rubricPump)drainRubricQueue();}
}
async function saveFields(fields){
 const team=identity.team;
 const expected=Object.fromEntries(Object.keys(fields).map(k=>[k,version(team,k)]));
 await L.request({action:'write',team,fields,expected});
}
async function drainRubricQueue(){
 if(rubricPump||busy||!rubricQueue.size)return;
 rubricPump=true;
 try{
  while(rubricQueue.size){
   const [key,value]=rubricQueue.entries().next().value;
   rubricQueue.delete(key);
   await execute(()=>saveFields({[key]:value}));
  }
 }finally{rubricPump=false;if(rubricQueue.size&&!busy)drainRubricQueue();}
}
root.addEventListener('change',event=>{
 const field=event.target.closest('select[data-class-single-assessment]');
 if(!field||!identity)return;
 const id=Number(field.dataset.classSingleAssessment),v=Number(field.value);
 if(!Number.isInteger(id)||id<0||id>5)return;
 const saved=assessmentValues();
 if(field.value===''||v<1||v>4)delete saved[id];else saved[id]=v;
 try{sessionStorage.setItem(assessmentKey(),JSON.stringify(saved))}catch{}
 const status=root.querySelector('.mastery-one-status');
 if(status){const n=Object.keys(saved).length;status.textContent=n===6?'هر شش گزاره ثبت شد. این ارزیابی یک‌نوبتی است.':'پاسخ ثبت‌شده: '+fa(n)+' از ۶';}
});
root.addEventListener('change',event=>{
 const select=event.target.closest('select[data-class-rubric]');
 if(!select||!identity||identity.role!=='team')return;
 const i=Number(select.dataset.classRubricMission),j=Number(select.dataset.classRubric),value=select.value;
 if(!Number.isInteger(i)||i<0||i>3||!Number.isInteger(j)||j<0||j>4||!['0','1','2'].includes(value))return;
 if(groupChoice(identity.team)!==i||stage!==9)return;
 rubricQueue.set('r'+i+'score'+j,value);
 drainRubricQueue();
});
root.addEventListener('click',event=>{
 const btn=event.target.closest('button');if(!btn||busy)return;
 if(btn.hasAttribute('data-professional-answer')){
  const i=Number(btn.dataset.professionalAnswer),j=Number(btn.dataset.professionalOption);
  if(!Number.isInteger(i)||i<0||i>9||!Number.isInteger(j)||j<0||j>2||!C.professionalQuiz[i])return;
  const saved=testAnswers();saved[i]=j;try{sessionStorage.setItem(testKey(),JSON.stringify(saved))}catch{}
  const card=btn.closest('[data-professional-question]');
  card?.querySelectorAll('[data-professional-option]').forEach(x=>{const selected=x===btn;x.classList.toggle('is-selected',selected);x.setAttribute('aria-pressed',String(selected));});
  const explanation=card?.querySelector('[data-professional-explanation]');if(explanation)explanation.innerHTML=professionalExplanation(i,j);
  const prog=root.querySelector('.professional-progress');if(prog)prog.textContent='پاسخ‌داده‌شده: '+fa(Object.keys(saved).length)+' از ۱۰';
  return;
 }
 if(btn.hasAttribute('data-class-quiz')){
  const i=Number(btn.dataset.classQuiz),j=Number(btn.dataset.classQuizOption);
  if(!Number.isInteger(i)||i<0||i>3||!Number.isInteger(j)||j<0||j>2||!(stage===1||identity?.role==='teacher'&&previewStep===1))return;
  const question=C.mastery[i].quickCheck,wrap=btn.closest('.mastery-microquiz');
  if(!wrap)return;
  wrap.querySelectorAll('[data-class-quiz-option]').forEach(b=>{b.classList.toggle('is-selected',b===btn);b.setAttribute('aria-pressed',b===btn?'true':'false');});
  const feedback=wrap.querySelector('[data-master-feedback="'+i+'"]');
  if(feedback)feedback.innerHTML='<strong>'+(question.options[j].correct?'درست انتخاب کردی ✓':'این گزینه دقیق نیست؛ دلیل هر سه را ببین:')+'</strong>'+question.options.map((o,k)=>'<p><b>گزینه '+fa(k+1)+':</b> '+E(o.why)+'</p>').join('');
  return;
 }
 if(btn.hasAttribute('data-class-return-live')){previewStep=null;openStep=stage;lastFingerprint='';render(true);return;}
 if(btn.hasAttribute('data-class-overview')){openStep=null;previewStep=null;lastFingerprint='';render(true);return;}
 if(btn.hasAttribute('data-class-open')){const n=Number(btn.dataset.classOpen);if(!Number.isInteger(n)||n<0||n>10)return;if(identity?.role==='teacher'){previewStep=n===stage?null:n;openStep=n;}else if(n===stage){openStep=stage;previewStep=null;}else{previewStep=n;openStep=null;}lastFingerprint='';render(true);return;}
 if(btn.hasAttribute('data-class-checkin')){const key='checkin'+identity.member;execute(()=>saveFields({[key]:true}));return;}
 if(identity?.role==='teacher'&&previewStep!==null&&(btn.dataset.classConfirm||btn.hasAttribute('data-class-reset')))return alertUser('این بخش در حالت پیش‌نمایش است؛ برای عملیات به گام فعال برگردید.',true);
 if(btn.dataset.classConfirm){const team=Number(btn.dataset.classConfirm),node=root.querySelector('[data-class-team-size="'+team+'"]'),size=Number(node?.value||0);
   if(![0,3,4,5].includes(size))return alertUser('برای گروه فعال ۳، ۴ یا ۵ نفر انتخاب کنید؛ عدد صفر گروه را غیرفعال می‌کند.',true);
   if(size>0&&!attendance(team))return alertUser('برای تأیید گروه '+fa(team)+' ابتدا حداقل یک عضو حضورش را ثبت کند.',true);
   execute(()=>L.request({action:'groupSetup',team,size}));return;
 }
 if(btn.dataset.classMission){const choice=Number(btn.dataset.classMission);if(choice<0||choice>3||usedMissions(identity.team).includes(choice))return alertUser('این مأموریت قبلاً اجرا شده؛ لطفاً یک راهبرد دیگر انتخاب کنید.',true);execute(()=>saveFields({missionChoice:choice,missionChoiceRound:classroomRound,['missionRound'+classroomRound]:choice}));return;}
 if(btn.hasAttribute('data-class-ready')){
  if(identity.role!=='team'||stage<3||stage>9)return;
  const chosen=groupChoice(identity.team),prefix='r'+chosen;
  if(chosen===null)return alertUser('ابتدا مأموریت گروه را انتخاب کنید.',true);
  if(stage===6&&!String(val(identity.team,prefix+'initial')||'').trim())return alertUser('ابتدا تصمیم اولیه گروه را ثبت کنید.',true);
  if(stage===8&&!String(val(identity.team,prefix+'revision')||'').trim())return alertUser('ابتدا تصمیم اصلاح‌شده گروه را ثبت کنید.',true);
  if(stage===9&&!Array.from({length:5},(_,i)=>val(identity.team,prefix+'member'+(i+1))).some(v=>String(v||'').trim()))return alertUser('ابتدا یک شاهد رفتاری از گروه ثبت کنید.',true);
  execute(()=>saveFields({classStepReady:classroomRound+':'+stage}));return;
 }
 if(btn.hasAttribute('data-class-reset')){
  if(identity.role!=='teacher')return;
  const word=window.prompt('برای پاک‌کردن داده‌های کارگاه و بازگشت به مرحله اول، عبارت «شروع تازه» را وارد کنید:');
  if(word!=='شروع تازه')return;
  if(!window.confirm('تمام حضورها، انتخاب مأموریت‌ها و پاسخ‌های فعلی این کارگاه حذف می‌شوند. عضویت افراد با کد ملی حفظ می‌شود. مطمئن هستید؟'))return;
  execute(()=>L.request({action:'resetClassroom',confirm:'RESET_ALBORZ_WORKSHOP'}));return;
 }
 if(btn.dataset.classReference){reference=Number(btn.dataset.classReference);lastFingerprint='';render(true);return;}
 if(btn.hasAttribute('data-class-prev')||btn.hasAttribute('data-class-next')){
  const next=btn.hasAttribute('data-class-next'),phase=next?(stage===10?2:stage+1):stage-1;
  if(phase<0||phase>10)return;
  execute(()=>L.request({action:'classroom',phase,expectedVersion:stageVersion}));return;
 }
 if(btn.dataset.classSave){const kind=btn.dataset.classSave,choice=groupChoice(identity.team);
  if(choice===null)return alertUser('ابتدا مأموریت گروه را انتخاب کنید.',true);
  const prefix='r'+choice;let fields;
  if(kind==='initial'){
   const selections=[...root.querySelectorAll('[data-class-pick]:checked')].map(x=>Number(x.dataset.classPick)),total=selections.reduce((n,j)=>n+C.missions[choice].actions[j][1],0);
   const answer=root.querySelector('[data-class-answer="initial"]')?.value.trim()||'';
   if(selections.length<2||total>6||answer.length<10)return alertUser('حداقل دو اقدام در سقف ۶ سکه انتخاب کنید و دلیل روشن (حداقل ۱۰ حرف) بنویسید.',true);
   fields={[prefix+'pick']:selections,[prefix+'initial']:answer};
  }else{
   const answer=root.querySelector('[data-class-answer="'+kind+'"]')?.value.trim()||'';
   if(answer.length<10)return alertUser('لطفاً یک توضیح روشن، حداقل ۱۰ حرف، ثبت کنید.',true);
   fields=kind==='revision'?{[prefix+'revision']:answer}:{[prefix+'member'+identity.member]:answer};
  }
  execute(()=>saveFields(fields));return;
 }
});
root.addEventListener('change',event=>{if(event.target.matches('[data-class-team-size]')){const row=event.target.closest('.classroom-team-row'),button=row?.querySelector('[data-class-confirm]');if(button)button.textContent='ثبت و تأیید';}});
root.addEventListener('focusout',()=>{if(needsRefresh)setTimeout(()=>{if(!root.contains(document.activeElement))render(true);},0);});
window.addEventListener('alborz:classroom-auth',event=>{identity=event.detail.identity;openStep=stage;previewStep=null;lastFingerprint='';render(true);});
window.addEventListener('alborz:classroom-data',event=>{
 const oldStage=stage,oldRound=classroomRound;
 identity=event.detail.identity;
 rows=event.detail.records||[];
 if(identity?.role==='teacher'){
  const record=rec(1,'classroomPhase');stage=Number(record?.field_value??0);stageVersion=record?.version??0;classroomRound=Number(rec(1,'classroomRound')?.field_value??0);
 }else{stage=Number(event.detail.classroom?.phase??0);stageVersion=event.detail.classroom?.version??0;classroomRound=Number(event.detail.classroom?.round??0);}
 stage=Math.max(0,Math.min(10,stage));if(stage!==oldStage||classroomRound!==oldRound){openStep=stage;previewStep=null;lastFingerprint='';}render();
});
render(true);
})();