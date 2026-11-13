/* Saba Naft — integrated coach-supported reflective leadership journey.
   Public static PWA, local-only progress and rule-based educational coaching. */
(function(){
"use strict";
var C=window.SabaJourneyCore,D=window.SABA_LEADERSHIP_JOURNEY,root=document.getElementById("journeyRoot");
if(!C||!D||!root||!Array.isArray(D.steps)||D.steps.length!==10)return;
var lastFocus=null;
var KEY="sabanaft_leadership_journey_v1",state=null,ticker=null;
var fa=function(n){return Number(n||0).toLocaleString("fa-IR");};
var esc=function(v){return String(v==null?"":v).replace(/[&<>"']/g,function(c){return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]})};
var active=function(){return location.hash.replace(/^#\/?/,"").split("/")[0]==="journey"};
function load(){try{var s=JSON.parse(localStorage.getItem(KEY)||"null");return s&&s.version===C.VERSION&&Array.isArray(s.history)&&s.pause&&s.drafts&&s.answers?s:null}catch(e){return null}}
function save(){try{localStorage.setItem(KEY,JSON.stringify(state));return true}catch(e){alert("ذخیره پیشرفت روی این مرورگر انجام نشد. فضای ذخیره‌سازی را بررسی کنید.");return false}}
function startJourney(mode,history){
 var fresh=C.newJourney(mode,history,Date.now());fresh.contentSteps=JSON.parse(JSON.stringify(window.SABA_LEADERSHIP_JOURNEY.steps));fresh.presentationVersion=2;return fresh;
}
function orderedOptions(stage,index){
 var entries=stage.options.map(function(o,i){return {option:o,index:i}});
 if(state&&state.presentationVersion===2){var best=entries.findIndex(function(e){return e.option.points===8}),target=[0,2,1,3,2,0,3,1,0,2][index];var shift=(best-target+4)%4;entries=entries.slice(shift).concat(entries.slice(0,shift))}
 return entries;
}
function fmt(ms){var n=Math.max(0,Math.ceil(ms/1000));return fa(Math.floor(n/60)).padStart(2,"۰")+":"+String(n%60).padStart(2,"0").replace(/\d/g,function(c){return"۰۱۲۳۴۵۶۷۸۹"[Number(c)]})}
function coach(stage,context){
 var prefix=["پیش از اقدام، شواهد را از برداشت جدا کنید.","بافت واقعی فرد و کار را بررسی کنید.","چند روایت را کنار هم ببینید.","نقش مدیر را متناسب با اختیار و ریسک انتخاب کنید.","انتظار را به رفتار قابل مشاهده تبدیل کنید.","در گفت‌وگوی دشوار، هم احترام و هم استاندارد مهم است.","واگذاری، بدون پشتیبانی کافی، توانمندسازی نیست.","توافق را قابل پیگیری کنید.","پیش از انتخاب ابزار، فایده را تعریف کنید.","یادگیری را با یک اقدام بعدی تثبیت کنید."];
 if(context==="late")return "زمان محدودتر شده است. روی تصمیم ضروری و یک اقدام مشخص تمرکز کنید؛ از کامل‌نویسی غیرضروری بپرهیزید.";
 return prefix[stage]||prefix[0];
}
function frame(inner,opts){
 opts=opts||{};
 var competitive=state.mode==="competitive",on=competitive&&!state.finished,summary=C.summary(state);
 return '<div class="lj-shell" dir="rtl">'+
 '<header class="lj-banner"><div class="lj-brand"><img src="./assets/my-leadership-icon.svg" alt="نشان مهارت‌های رهبری من"><div><span>مهارت‌های رهبری من · صبا نفت</span><h1>'+esc(D.title)+'</h1><p>سفر یادگیری ۱۰ مرحله‌ای · سناریوهای آموزشی فرضی</p></div></div>'+
 '<div class="lj-actions"><a class="lj-quiet" href="#/course">بازگشت به جلسات</a>'+
 (on?'<div class="lj-clock" aria-live="off" aria-label="زمان باقی‌مانده"><span>زمان مأموریت</span><strong id="ljClock">'+fmt(C.remaining(state))+'</strong></div><button type="button" class="lj-quiet" data-lj="pause" '+(state.pause.used?'disabled title="سهمیه مکث استفاده شده"':'')+'>مکث ۵ دقیقه‌ای</button>':'<span class="lj-mode">'+(competitive?"مأموریت پایان‌یافته":"مطالعه آزاد · بدون امتیاز")+'</span>')+
 (!state.finished?'<button type="button" class="lj-quiet" data-lj="restart">شروع مجدد</button>':'')+
 (on?'<button type="button" class="lj-quiet" data-lj="switch">مطالعه آزاد</button>':'')+
 '</div></header>'+
 '<div class="lj-topline"><span>'+(competitive?"مأموریت رقابتی":"مطالعه آزاد")+'</span><span>مرحله '+fa(Math.min(10,state.stage+1))+' از ۱۰ · '+fa(state.finished?100:(state.stage+(state.phase!=="step"?1:0))*10)+'٪</span>'+
 (competitive?'<span>امتیاز خام: '+fa(summary.raw)+' · سکه تمرین: '+fa(summary.coins)+'</span>':'<span>بدون محدودیت زمانی</span>')+'</div>'+
 '<div class="lj-track" role="progressbar" aria-label="پیشرفت سفر رهبری" aria-valuemin="0" aria-valuemax="100" aria-valuenow="'+(state.finished?100:Math.min(100,(state.stage+(state.phase!=="step"?1:0))*10))+'"><i style="width:'+(state.finished?100:Math.min(100,(state.stage+(state.phase!=="step"?1:0))*10))+'%"></i></div>'+
 inner+'</div>';
}
function coachCard(text,kind){
 return '<aside class="lj-coach '+(kind||"")+'" aria-label="کوچ همراه"><div class="lj-coach-icon" aria-hidden="true">✧</div><div><strong>همراه مسیر رهبری</strong><p>'+esc(text)+'</p></div></aside>';
}
function baseStep(stage){
 return '<div class="lj-stephead"><div class="lj-number">'+fa(state.stage+1)+'</div><div><span class="lj-kicker">'+esc(stage.focus)+'</span><h2>'+esc(stage.title)+'</h2><p>'+esc(stage.objective)+'</p></div></div>';
}
function renderChoice(stage,study){
 var dr=state.drafts[state.stage]||{};
 return '<fieldset class="lj-options"><legend>گزینه‌ای را که در این موقعیت قابل‌دفاع‌تر می‌دانید انتخاب کنید</legend>'+
 orderedOptions(stage,state.stage).map(function(entry,position){var o=entry.option,i=entry.index;return '<label class="lj-choice"><input type="radio" name="ljDecision" value="'+i+'" '+(dr.choice===i?'checked':'')+'><span class="lj-choice-letter">'+String.fromCharCode(65+position)+'</span><span>'+esc(o.text)+'</span></label>'}).join("")+'</fieldset>'+
 (study?'<details class="lj-study-reasons"><summary>مقایسه و تحلیل چهار گزینه</summary>'+orderedOptions(stage,state.stage).map(function(entry,position){var o=entry.option;return '<div><strong>گزینه '+String.fromCharCode(65+position)+'</strong><p>'+esc(o.why)+'</p></div>'}).join("")+'</details>':'<p class="lj-muted">تحلیل گزینه‌ها و پاسخ‌های ارجح فقط پس از تکمیل مأموریت رقابتی نمایش داده می‌شود.</p>');
}
function studyNav(){
 return '<div class="lj-study-nav"><button type="button" data-lj="prev" '+(state.stage===0?"disabled":"")+'>مرحله قبل</button><button type="button" data-lj="nextStudy" '+(state.stage===9?"disabled":"")+'>مرحله بعد ←</button></div>'+
 '<details class="lj-step-index"><summary>فهرست ۱۰ مرحله</summary><div>'+D.steps.map(function(st,i){return '<button type="button" data-lj-stage="'+i+'" '+(i===state.stage?'aria-current="step"':'')+'>'+fa(i+1)+'. '+esc(st.title)+'</button>'}).join("")+'</div></details>';
}
function renderStep(){
 var stage=D.steps[state.stage],study=state.mode==="study",dr=state.drafts[state.stage]||{},left=C.remaining(state),late=left!==null&&left<600000;
 var main='<div class="lj-content">'+baseStep(stage)+coachCard(coach(state.stage,late?"late":"start"))+
 (stage.bridge?'<p class="lj-bridge">'+esc(stage.bridge)+'</p>':'')+
 (state.stage>0?(state.answers[state.stage-1]||state.drafts[state.stage-1])?'<details class="lj-carry"><summary>تمرین مرحله قبل شما</summary><p>'+esc((state.answers[state.stage-1]||state.drafts[state.stage-1]).practice||'هنوز تمرینی ثبت نشده است.')+'</p></details>':'':'')+
 '<details class="lj-panel lj-principle" open><summary>اصل مدیریتی و دو تکنیک کاربردی</summary><p class="lj-muted">توسعه آموزشی بر پایه مدل؛ نقل‌قول کتاب نیست.</p><p>'+esc(stage.concept)+'</p><div class="lj-techniques">'+stage.techniques.map(function(t,i){return '<div><strong>تکنیک '+fa(i+1)+'</strong><p>'+esc(t)+'</p></div>'}).join("")+'</div></details>'+
 '<article class="lj-panel lj-scenario"><span class="lj-panel-tag">موقعیت مدیریتی · فرضی</span><p>'+esc(stage.scenario)+'</p><h3>'+esc(stage.question)+'</h3>'+
 renderChoice(stage,study)+'<p id="ljSelectionStatus" class="lj-muted" role="status">'+(dr.choice!=null?'انتخاب موقت ذخیره شد؛ پیش از ثبت، پیامد آن را در تمرین بنویسید.':'')+'</p></article>'+
 '<article class="lj-panel"><span class="lj-panel-tag">تمرین عملی / Role-Play</span><h3>از تصمیم به رفتار برسید</h3><p>'+esc(stage.practice)+'</p>'+
 '<label for="ljPractice" class="lj-field-label">متن تمرین شما '+(study?"(اختیاری)":"(حداقل ۱۲ حرف)")+'</label><textarea id="ljPractice" maxlength="800" rows="4" placeholder="جمله یا اقدام مشخص خود را بنویسید…">'+esc(dr.practice||"")+'</textarea>'+
 '<label for="ljRating" class="lj-field-label">خودارزیابی: '+esc(stage.reflection)+'</label>'+
 '<select id="ljRating"><option value="">یک سطح انتخاب کنید'+(study?" (اختیاری)":"")+'</option>'+
 [1,2,3,4,5].map(function(n){return '<option value="'+n+'" '+(dr.rating===n?'selected':'')+'>'+fa(n)+' از ۵ · '+(["","نیاز به تمرین جدی","در حال شکل‌گیری","متوسط","نسبتاً پایدار","نقطه قوت فعلی"][n])+'</option>'}).join("")+'</select>'+
 '<p class="lj-muted">خودارزیابی امتیاز ندارد؛ ثبت تمرین ۲ امتیاز مشارکت دارد، نه ارزیابی کیفیت متن. همراه مسیر قاعده‌محور است.</p></article>'+
 (study?studyNav()+(state.stage===9?'<button type="button" class="lj-primary" data-lj="finishStudy">جمع‌بندی مطالعه و اقدام بعدی</button>':'')+'<div class="lj-actions-bottom"><button type="button" data-lj="newMission">شروع مأموریت رقابتی جدید</button></div>':
 '<div class="lj-actions-bottom"><button type="button" class="lj-primary" data-lj="submit">ثبت تصمیم و تمرین · مرحله '+fa(state.stage+1)+'</button><small>پس از ثبت، انتخاب این مرحله قفل می‌شود؛ پاسخ صحیح در پایان نمایش داده خواهد شد.</small></div>')+
 '</div><button type="button" class="lj-float-guide" data-lj="hint" aria-label="بازکردن راهنمای همراه"><span>✦</span> راهنمای همراه</button>';
 root.innerHTML=frame(main);
 var panels=Array.from(root.querySelectorAll('.lj-content>.lj-panel')),current=dr.panel||0;
 var bar=document.createElement('div');bar.className='lj-pagebar';
 bar.innerHTML='<nav class="lj-panel-tabs" aria-label="بخش‌های مرحله">'+['یادگیری','تصمیم','تمرین'].map(function(label,i){return '<button type="button" data-lj-panel="'+i+'" aria-current="'+(current===i?'step':'false')+'">'+fa(i+1)+' · '+label+'</button>'}).join('')+'</nav>';
 var guide=root.querySelector('.lj-float-guide'),clock=root.querySelector('.lj-clock');if(clock)bar.appendChild(clock);bar.appendChild(guide);
 root.querySelector('.lj-content').before(bar);
 if(current>0){var bridge=root.querySelector(".lj-bridge");if(bridge)bridge.hidden=true;}
 panels.forEach(function(panel,i){panel.hidden=i!==current});
 var submit=root.querySelector('.lj-actions-bottom');if(submit&&!study)submit.hidden=current!==2;
 var pager=document.createElement('div');pager.className='lj-panel-pager';pager.innerHTML=(current>0?'<button type="button" class="lj-secondary" data-lj-panel="'+(current-1)+'">بازگشت</button>':'')+(current<2?'<button type="button" class="lj-primary" data-lj-panel="'+(current+1)+'">'+(current===0?'بررسی موقعیت و انتخاب تصمیم':'نوشتن تمرین و خودارزیابی')+' ←</button>':'');
 panels[current].after(pager);
 if(state.mode==="competitive"&&state.pause.since)showPause();
 else if(state.mode==="competitive"&&C.expired(state))showOvertime();
}
function renderFeedback(){
 var st=D.steps[state.stage],a=state.answers[state.stage],level=a.rating<=2?
 "خودتان نیاز به تمرین گزارش کرده‌اید؛ یک رفتار مشخص را انتخاب کنید و از یک همکار بازخورد بگیرید.":
 a.rating===3?"سطح متوسط گزارش کرده‌اید؛ یک نمونه موفق و یک موقعیت دشوار را کنار هم بررسی کنید.":
 "این توانمندی را با شواهد رفتار واقعی و دیدگاه همکاران اعتبارسنجی کنید.";
 var body='<section class="lj-milestone"><span class="lj-milestone-icon">✧</span><span class="lj-kicker">ایستگاه دستاورد · مرحله '+fa(state.stage+1)+'</span>'+
 '<h2>تصمیم و تمرین شما ثبت شد</h2>'+
 '<div class="lj-earn"><div><strong>'+fa(a.points)+'</strong><span>از ۱۰ امتیاز این مرحله</span></div><div><strong>'+fa(C.summary(state).raw)+'</strong><span>امتیاز خام تا اینجا</span></div><div><strong>+۱</strong><span>سکه تمرین</span></div></div>'+
 coachCard((a.decision>=8?"انتخاب شما تعادل مناسبی میان شواهد، اختیار و پیامد برقرار می‌کند. در اجرا نیز این معیار را حفظ کنید.":a.decision>=6?"در این انتخاب بخشی از مسئله پوشش داده شد. کدام Trade-off یا محدودیت را باید پیش از اقدام روشن‌تر کنید؟":"انتخابتان ثبت شد. یک فرض کلیدی پشت تصمیم خود را شناسایی کنید و اثر آن را بر افراد، اختیار و نتیجه دوباره بسنجید.")+" "+st.focus+": "+(st.coachQuestions?st.coachQuestions[a.decision>=8?0:a.decision>=6?1:2]:st.hint.question),"milestone")+
 '<div class="lj-coach-reflect"><strong>گام عملی بعدی</strong><p>'+esc('در تمرین بعدی این روش را امتحان کنید: '+st.techniques[0])+'</p></div>'+
 '<div class="lj-coach-reflect"><strong>بازتاب خودارزیابی '+fa(a.rating)+' از ۵</strong><p>'+esc(level)+'</p></div>'+
 '<p class="lj-muted">این امتیاز براساس معیار آموزشی مرحله ثبت شد؛ کلید و تحلیل گزینه‌ها در پایان ۱۰ مرحله باز می‌شوند.</p>'+
 '<button type="button" class="lj-primary" data-lj="advance">'+(state.stage===9?"مشاهده نتیجه نهایی ←":"ادامه به مرحله بعد ←")+'</button></section>';
 root.innerHTML=frame(body);
 if(state.pause.since)showPause();else if(C.expired(state))showOvertime();
}
function renderBreak(){
 var n=state.stage===3?1:2,ms=30000-(Date.now()-(state.breakStartedAt||Date.now()));
 var body='<section class="lj-recovery"><div class="lj-recovery-visual"><img src="../assets/sabanaft-site.webp" alt="تصویر واقعی مجموعه صبا نفت"><div class="lj-breath" aria-hidden="true"></div></div>'+
 '<span class="lj-kicker">ایستگاه بازیابی تمرکز '+fa(n)+' از ۲</span><h2>۳۰ ثانیه برای بازگشت به تمرکز</h2>'+
 '<p>نگاه را برای چند لحظه از متن بردارید؛ شانه‌ها را آزاد کنید و با چند دم و بازدم آرام، روی تصمیم بعدی تمرکز کنید.</p>'+
 '<strong class="lj-breakclock" id="ljBreakClock">'+fmt(ms)+'</strong>'+
 '<button type="button" class="lj-primary" data-lj="breakContinue" '+(ms>0?"disabled":"")+'>ادامه مسیر ←</button></section>';
 root.innerHTML=frame(body);
 if(state.pause.since)showPause();else if(C.expired(state))showOvertime();
}
function latestResults(){
 var h=state&&Array.isArray(state.history)?state.history:[];
 if(!h.length)return '<p>هنوز مأموریت رقابتی تکمیل‌شده‌ای ثبت نشده است.</p>';
 return h.slice(-5).reverse().map(function(r){return '<div class="lj-history-row"><span>'+new Date(r.finishedAt).toLocaleDateString("fa-IR")+'</span><strong>'+fa(r.net)+' / ۱۰۰</strong><span>'+esc(r.badge)+'</span><small>خام '+fa(r.raw)+' − تمدید '+fa(r.timePenalty)+' − راهنما '+fa(r.hintPenalty)+'</small></div>'}).join("");
}
function updatePassport(){
 var el=document.getElementById("journeyPassportSummary");if(!el)return;
 el.innerHTML='<div class="lj-passport"><h2>سفر رهبری بازتابی · سوابق مأموریت</h2><p>امتیاز مأموریت مستقل از امتیاز مشارکت سالانه است؛ هیچ امتیازی دوباره‌شماری نمی‌شود.</p>'+latestResults()+'<a href="#/journey">ورود به سفر رهبری ←</a></div>';
}
function renderEnd(){
 var sm=C.summary(state),rank=C.badge(sm.net),accent=rank==="طلایی"?"gold":rank==="نقره‌ای"?"silver":"bronze";
 var stReview=D.steps.map(function(st,i){var a=state.answers[i];if(!a)return"";return '<details class="lj-review-item"><summary>مرحله '+fa(i+1)+' · '+esc(st.title)+' <span>'+fa(a.points)+' امتیاز</span></summary>'+
 '<p><strong>سناریو:</strong> '+esc(st.scenario)+'</p><p><strong>پرسش:</strong> '+esc(st.question)+'</p>'+
 orderedOptions(st,i).map(function(entry,position){var o=entry.option,j=entry.index;return '<div class="lj-option-review '+(a.choice===j?"selected":"")+' '+(o.points===8?"strongest":"")+'"><strong>گزینه '+String.fromCharCode(65+position)+(a.choice===j?" · انتخاب شما":"")+(o.points===8?" · اولویت آموزشی":"")+'</strong><p>'+esc(o.text)+'</p><small>'+esc(o.why)+'</small></div>'}).join("")+
 '<div class="lj-review-practice"><strong>تمرین ثبت‌شده شما</strong><p>'+esc(a.practice)+'</p></div><p><strong>یادگیری محوری:</strong> '+esc(st.takeaway)+'</p></details>'}).join("");
 var html='<section class="lj-result '+accent+'" id="ljPrintableBadge"><div class="lj-result-mark"><img src="./assets/my-leadership-icon.svg" alt=""><span>✦</span></div>'+
 '<span class="lj-kicker">مأموریت رهبری · تکمیل‌شده</span><h2>نشان '+rank+' رهبری بازتابی</h2><p>از مسئله تا اقدام، با پذیرش مسئولیت و یادگیری از تجربه</p>'+
 '<div class="lj-finalscore"><strong>'+fa(sm.net)+'</strong><span>امتیاز خالص از ۱۰۰</span></div>'+
 '<div class="lj-score-grid"><div><span>امتیاز خام</span><strong>'+fa(sm.raw)+'</strong></div><div><span>کسر تمدید زمان</span><strong>−'+fa(sm.timePenalty)+'</strong></div><div><span>کسر راهنما</span><strong>−'+fa(sm.hintPenalty)+'</strong></div><div><span>امتیاز نهایی</span><strong>'+fa(sm.net)+'</strong></div></div>'+
 '<p class="lj-result-note">این نشان آموزشی، محلی و خوداظهاری است و مدرک رسمی یا ارزیابی تأییدشده منابع انسانی محسوب نمی‌شود.</p>'+
 '<div class="lj-download"><button type="button" data-lj="png">دریافت نشان PNG</button><button type="button" data-lj="print">چاپ / ذخیره PDF</button><button type="button" data-lj="newMission">مأموریت جدید</button></div></section>'+
 '<section class="lj-result-feedback"><h2>بازخورد توسعه‌ای شما</h2>'+coachCard(sm.raw>=85?
 "در سناریوهای این تمرین، بیشتر تصمیم‌های شما با معیار آموزشی هم‌راستا بود. این الگو را در یک موقعیت واقعی با داده معتبر بیازمایید.":
 sm.raw>=70?"در این تمرین چند تصمیم قابل دفاع ثبت کرده‌اید. برای پیشرفت، بر روشن‌کردن مرز اختیار و کیفیت شواهد پیش از انتخاب ابزار تمرکز کنید.":
 "این تمرین فرصتی برای شناسایی فرضیات تصمیم‌گیری بود. یک موقعیت واقعی کوچک را انتخاب کنید، معیار تصمیم را بنویسید و نتیجه را مرور کنید.")+
 '<h3>تعهد شما برای اقدام بعدی</h3><p>ظرف ۱۴ روز، یک گفت‌وگوی واقعی درباره مرز اختیار یا یک تعهد بین‌واحدی برگزار کنید. اقدام، مالک، موعد و نتیجه قابل‌مشاهده را در «استودیوی رهبری» ثبت و بازبینی کنید.</p>'+
 '<div class="lj-review-practice"><strong>اقدام ثبت‌شده در مرحله دهم</strong><p>'+esc(state.answers[9]?state.answers[9].practice:'')+'</p></div>'+commitmentForm()+
 '<a class="lj-primary lj-link" href="#/studio/cases">ورود به کیس‌های من ←</a></section>'+
 '<section class="lj-fullreview"><h2>تحلیل ۱۰ تصمیم و گزینه‌ها</h2><p>پاسخ هر مرحله با توجه به شرایط سناریوی فرضی ارزیابی شده است. در موقعیت واقعی ممکن است با شواهد دیگر، گزینه دیگری قابل‌دفاع باشد.</p>'+stReview+'</section>'+
 '<section class="lj-history"><h2>سوابق تکمیل‌شده</h2>'+latestResults()+'</section>';
 root.innerHTML=frame(html);
}
function commitmentForm(){
 var c=state.commitment||{};
 return '<div class="lj-commitment"><h3>برنامه پیگیری شخصی</h3><label class="lj-field-label" for="ljAction">یک رفتار واقعی که اجرا می‌کنید</label><textarea id="ljAction" maxlength="800">'+esc(c.action||'')+'</textarea><label class="lj-field-label" for="ljDue">تاریخ بررسی نتیجه</label><input id="ljDue" type="date" value="'+esc(c.due||'')+'"><label class="lj-field-label" for="ljEvidence">با چه شاهدی و با بازخورد چه کسی؟</label><textarea id="ljEvidence" maxlength="400">'+esc(c.evidence||'')+'</textarea><button type="button" class="lj-primary" data-lj="saveCommitment">ثبت تعهد و موعد</button><p id="ljCommitmentStatus" role="status">'+(c.action?'تعهد روی همین مرورگر ذخیره شده؛ یادآوری خودکار ارسال نمی‌شود.':'')+'</p></div>';
}
function renderStudyEnd(){
 root.innerHTML=frame('<section class="lj-result-feedback"><h2>جمع‌بندی مطالعه آزاد</h2><p>این مسیر نمره یا نشان رقابتی ندارد. یک تصمیم را برای تمرین در محیط کار انتخاب کنید.</p>'+commitmentForm()+studyNav()+'<button type="button" class="lj-primary" data-lj="reviewStudy">بازگشت به مرور مراحل</button></section>');
}
function renderIntro(){
 var html='<section class="lj-intro"><div class="lj-intro-copy"><span class="lj-kicker">آزمایشگاه مهارت‌های رهبری</span><h2>تمرین رهبری در یک مسیر واقعی‌نما</h2>'+
 '<p>در ۱۰ مرحله مرتبط، یک مسئله مدیریتی فرضی را از تشخیص تا تصمیم، گفت‌وگو، تفویض و بازاندیشی دنبال می‌کنید. هر تصمیم را به یک رفتار قابل اجرا در کار خود تبدیل می‌کنید.</p>'+
 '<div class="lj-intro-numbers"><div><strong>۱۰</strong><span>مرحله</span></div><div><strong>۶۰</strong><span>دقیقه رقابتی</span></div><div><strong>۲</strong><span>ایستگاه تمرکز</span></div></div></div>'+
 '<div class="lj-mode-cards"><article><span>۰۱ · مأموریت رقابتی</span><h3>تصمیم بگیر، تمرین کن، پیشرفتت را ببین</h3><p>تایمر ۶۰ دقیقه، امتیاز خام تا ۱۰۰، راهنمای ۲ نوبت رایگان، مکث ۵ دقیقه‌ای و امکان تمدید با کسر امتیاز.</p><button class="lj-primary" type="button" data-lj="startCompetitive">شروع مأموریت ←</button></article>'+
 '<article><span>۰۲ · مطالعه آزاد</span><h3>با سرعت خودت یاد بگیر</h3><p>بدون تایمر، نمره و نشان؛ مطالعه همه مراحل، مرور تحلیل گزینه‌ها، تمرین اختیاری و راهنمای رایگان و نامحدود.</p><button class="lj-secondary" type="button" data-lj="startStudy">ورود به مطالعه آزاد ←</button></article></div>'+
 '<details class="lj-carry"><summary>قواعد امتیاز و زمان</summary><p>هر مرحله: حداکثر ۸ امتیاز تصمیم و ۲ امتیاز ثبت تمرین؛ خودارزیابی بدون امتیاز. امتیاز خالص: خام منهای جریمه‌ها. نشان طلایی از ۸۵، نقره‌ای از ۷۰ و برنزی زیر ۷۰ است؛ نشان به معنی سنجش شایستگی نیست.</p><p>یک مکث حداکثر ۵ دقیقه‌ای؛ پس از پایان زمان، هر ۵ دقیقه تمدید یا بخشی از آن ۲ امتیاز کسر دارد. دو راهنمای مرحله‌ای رایگان؛ از سومین راهنمای جدید، هر بار ۲ امتیاز کسر. بازکردن دوباره همان راهنما رایگان است. دو ایستگاه ۳۰ ثانیه‌ای بخشی از زمان مأموریت‌اند. شروع مجدد سهمیه و زمان را بازنشانی نمی‌کند.</p></details>'+
 '<p class="lj-privacy">همراه مسیر قاعده‌محور است؛ هوش مصنوعی مولد یا کوچ انسانی نیست. پیشرفت فقط روی همین مرورگر ذخیره می‌شود؛ برای سنجش رسمی یا اطلاعات محرمانه مناسب نیست.</p></section>'+
 (state&&state.history&&state.history.length?'<section class="lj-history"><h2>سوابق قبلی</h2>'+latestResults()+'</section>':'');
 root.innerHTML='<div class="lj-shell" dir="rtl"><header class="lj-banner lj-intro-banner"><div class="lj-brand"><img src="./assets/my-leadership-icon.svg" alt="نشان اپ"><div><span>صبا نفت · مهارت‌های رهبری من</span><h1>سفر تعاملی رهبری بازتابی</h1></div></div><a class="lj-quiet" href="#/course">بازگشت به جلسات</a></header>'+html+'</div>';
}
function render(){
 D=Object.assign({},window.SABA_LEADERSHIP_JOURNEY,{steps:state&&state.contentSteps||window.SABA_LEADERSHIP_JOURNEY.steps});
 if(!state){renderIntro();updatePassport();return}
 if(state.mode==="competitive"&&state.pause.since&&C.syncPause(state,Date.now()))save();
 if(state.mode==="study"&&state.studyFinished)renderStudyEnd();
 else if(state.finished)renderEnd();
 else if(state.phase==="break"&&state.mode==="competitive")renderBreak();
 else if(state.phase==="feedback"&&state.mode==="competitive")renderFeedback();
 else renderStep();
 updatePassport();
}
function modal(html,cls){
 if(!root.querySelector("#ljModal"))lastFocus=document.activeElement;
 var old=root.querySelector("#ljModal");if(old)old.remove();
 var div=document.createElement("div");div.id="ljModal";div.className="lj-modal "+(cls||"");div.innerHTML='<div class="lj-dialog" role="dialog" aria-modal="true" aria-labelledby="ljModalTitle">'+html+'</div>';root.appendChild(div);
 var shell=root.querySelector(".lj-shell");if(shell)shell.inert=true;
 var focus=div.querySelector("input,button");if(focus)focus.focus();
}
function closeModal(){
 root.querySelector("#ljModal")?.remove();var shell=root.querySelector(".lj-shell");if(shell)shell.inert=false;
 if(lastFocus&&lastFocus.isConnected)lastFocus.focus();
}
function showPause(){
 if(root.querySelector("#ljModal"))return;
 modal('<span class="lj-kicker">مکث رایگان · حداکثر ۵ دقیقه</span><h2 id="ljModalTitle">بازیابی تمرکز</h2><p>تایمر مأموریت موقتاً متوقف شده است. مکث پس از ۵ دقیقه، حتی با خروج یا Refresh، خودکار پایان می‌یابد.</p><strong class="lj-pauseclock" id="ljPauseClock">'+fmt(C.pauseRemaining(state))+'</strong><button type="button" class="lj-primary" data-lj="resume">ادامه مأموریت ←</button>',"pause");
}
function showOvertime(){
 if(root.querySelector("#ljModal"))return;
 modal('<span class="lj-kicker">زمان اصلی پایان یافته است</span><h2 id="ljModalTitle">درخواست زمان اضافه</h2><p>پاسخ‌ها و مرحله فعلی حفظ شده‌اند. هر ۵ دقیقه یا بخشی از آن، ۲ امتیاز از نمره نهایی کسر می‌شود.</p><label class="lj-field-label" for="ljExtraMinutes">چند دقیقه اضافه نیاز دارید؟ (۱ تا ۶۰)</label><input type="number" id="ljExtraMinutes" min="1" max="60" step="1" value="5" inputmode="numeric"><p class="lj-cost" id="ljExtraCost">۵ دقیقه · ۲ امتیاز کسر</p><button type="button" class="lj-primary" data-lj="extend">تأیید کسر امتیاز و ادامه</button><button type="button" class="lj-quiet" data-lj="switch">ادامه در مطالعه آزاد، بدون امتیاز</button>',"overtime");
}
function showHint(){
 var st=D.steps[state.stage],already=state.hintsUsed.includes(state.stage),cost=C.hintCost(state,state.stage);
 if(state.mode==="competitive"&&!already&&(C.expired(state)||state.pause.since)){render();return}
 var heading='<span class="lj-kicker">راهنمای همراه · مرحله '+fa(state.stage+1)+'</span><h2 id="ljModalTitle">یک زاویه تازه برای فکرکردن</h2>';
 var body='<div class="lj-hint-grid"><div><strong>نکته کاربردی</strong><p>'+esc(st.hint.tip)+'</p></div><div><strong>تکنیک قابل اجرا</strong><p>'+esc(st.hint.method)+'</p></div><div><strong>پرسش بازاندیشی</strong><p>'+esc(st.hint.question)+'</p></div></div><p class="lj-muted">این راهنما جواب آزمون را افشا نمی‌کند.</p><button type="button" class="lj-primary" data-lj="closeHint">بازگشت به تصمیم ←</button>';
 if(already||state.mode==="study"){
   modal(heading+body);
 }else{
   modal(heading+'<p class="lj-cost">'+(cost===0?'این راهنما رایگان است. '+fa(2-state.hintsUsed.length)+' راهنمای رایگان باقی مانده.':'استفاده از این راهنما: ۲ امتیاز کسر از نمره نهایی؛ مجموع جریمه راهنما پس از دریافت: '+fa(C.hintPenalty(state)+2))+'</p><button type="button" class="lj-primary" data-lj="confirmHint">تأیید '+(cost?"کسر ۲ امتیاز و ":"")+'نمایش راهنما</button><button type="button" class="lj-quiet" data-lj="closeHint">انصراف</button>');
 }
}
function saveDraft(){
 if(!state||state.finished||state.phase!=="step")return;
 var inp=root.querySelector('input[name="ljDecision"]:checked');
 var p=root.querySelector("#ljPractice"),rating=root.querySelector("#ljRating");
 state.drafts[state.stage]={panel:(state.drafts[state.stage]||{}).panel||0,choice:inp?Number(inp.value):null,practice:p?p.value.slice(0,800):"",rating:rating&&rating.value?Number(rating.value):null};
 save();var status=root.querySelector("#ljSelectionStatus");if(status&&inp)status.textContent="انتخاب موقت ذخیره شد؛ پیش از ثبت، پیامد آن را در تمرین بنویسید.";
}
function downloadBadge(){
 var sm=C.summary(state),rank=C.badge(sm.net),cv=document.createElement("canvas");cv.width=1200;cv.height=720;
 var g=cv.getContext("2d");if(!g){alert("مرورگر امکان خروجی تصویر ندارد.");return}
 var grad=g.createLinearGradient(0,0,1200,720);grad.addColorStop(0,"#073e39");grad.addColorStop(1,"#147c69");g.fillStyle=grad;g.fillRect(0,0,1200,720);
 g.strokeStyle="#d8a64d";g.lineWidth=7;g.strokeRect(40,40,1120,640);
 g.textAlign="center";g.direction="rtl";g.fillStyle="#f9f5eb";
 g.font="bold 48px Vazirmatn, sans-serif";g.fillText("مهارت‌های رهبری من",600,150);
 g.fillStyle="#dfbb75";g.font="bold 40px Vazirmatn, sans-serif";g.fillText("صبا نفت · سفر رهبری بازتابی",600,222);
 g.beginPath();g.arc(600,350,93,0,2*Math.PI);g.fillStyle=rank==="طلایی"?"#d8a64d":rank==="نقره‌ای"?"#ccd6de":"#bc9071";g.fill();
 g.fillStyle="#083d38";g.font="bold 63px Vazirmatn, sans-serif";g.fillText(String(sm.net).replace(/\d/g,function(c){return "۰۱۲۳۴۵۶۷۸۹"[Number(c)]}),600,372);
 g.fillStyle="#fff";g.font="bold 48px Vazirmatn, sans-serif";g.fillText("نشان "+rank,600,505);
 g.font="30px Vazirmatn, sans-serif";g.fillText("خام "+fa(sm.raw)+"  |  کسر زمان "+fa(sm.timePenalty)+"  |  کسر راهنما "+fa(sm.hintPenalty),600,568);
 g.font="24px Vazirmatn, sans-serif";g.fillText("دستاورد آموزشی محلی · بدون اعتبار ارزیابی رسمی",600,627);
 cv.toBlob(function(blob){if(!blob){alert("ساخت تصویر ممکن نشد.");return}var url=URL.createObjectURL(blob),a=document.createElement("a");a.href=url;a.download="saba-leadership-badge-"+sm.net+".png";a.click();setTimeout(function(){URL.revokeObjectURL(url)},3000)},"image/png");
}
function next(){
 if(state.mode==="study"){state.stage=Math.min(9,state.stage+1);save();render();return}
 if(state.phase!=="feedback")return;
 if(state.stage===9){if(C.expired(state)){render();return}if(C.complete(state,Date.now())){save();render()}return}
 if(state.stage===3||state.stage===7){
   state.phase="break";state.breakStartedAt=Date.now();
 }else{state.stage++;state.phase="step"}
 save();render();
}
function handleClick(e){
 var panelBtn=e.target.closest('[data-lj-panel]');
 if(panelBtn&&root.contains(panelBtn)&&state){var panel=Number(panelBtn.dataset.ljPanel);if(panel>=0&&panel<=2){var draft=state.drafts[state.stage]||{};draft.panel=panel;state.drafts[state.stage]=draft;save();render();var bar=root.querySelector('.lj-pagebar');if(bar&&bar.scrollIntoView)bar.scrollIntoView({block:'start'});}return}

 var stageBtn=e.target.closest("[data-lj-stage]");
 if(stageBtn&&root.contains(stageBtn)&&state&&state.mode==="study"){state.studyFinished=false;state.phase="step";state.stage=Math.max(0,Math.min(9,Number(stageBtn.dataset.ljStage)));save();render();return}
 var b=e.target.closest("[data-lj]");if(!b||!root.contains(b))return;
 var action=b.dataset.lj;
 if(action==="startCompetitive"||action==="startStudy"){
   var history=state?state.history:[],mode=action==="startStudy"?"study":"competitive";
   state=startJourney(mode,history);if(save())render();return;
 }
 if(!state)return;
 if(action==="saveCommitment"){
  var actionText=root.querySelector('#ljAction').value.trim(),due=root.querySelector('#ljDue').value,evidence=root.querySelector('#ljEvidence').value.trim();
  if(actionText.length<12||!due||evidence.length<8){root.querySelector('#ljCommitmentStatus').textContent='رفتار مشخص، تاریخ و شاهد نتیجه را کامل کنید.';return}
  state.commitment={action:actionText,due:due,evidence:evidence};if(save())root.querySelector('#ljCommitmentStatus').textContent='تعهد روی همین مرورگر ذخیره شد؛ یادآوری خودکار ارسال نمی‌شود.';return;
 }
 if(action==="finishStudy"&&state.mode==="study"){state.studyFinished=true;state.phase="end";save();render();return}
 if(action==="reviewStudy"&&state.mode==="study"){state.studyFinished=false;state.phase="step";save();render();return}
 if(action==="newMission"){
   if(!confirm("مأموریت مستقل جدیدی آغاز شود؟ پیشرفت مأموریت فعلی جایگزین می‌شود؛ سوابق تکمیل‌شده حفظ خواهند شد."))return;
   state=startJourney("competitive",state.history);save();render();return;
 }
 if(action==="prev"&&state.mode==="study"){state.studyFinished=false;state.phase="step";state.stage=Math.max(0,state.stage-1);save();render();return}
 if(action==="nextStudy"&&state.mode==="study"){state.studyFinished=false;state.phase="step";state.stage=Math.min(9,state.stage+1);save();render();return}
 if(action==="restart"){
   if(!confirm("پاسخ‌ها و پیشرفت فعلی پاک می‌شود. زمان، جریمه‌ها و سهمیه راهنما/مکث این تلاش بازنشانی نمی‌شوند؛ تنها یک مأموریت مستقل جدید سهمیه تازه دارد. ادامه می‌دهید؟"))return;
   C.restartSameAttempt(state);state.studyFinished=false;save();render();return;
 }
 if(action==="switch"){
   if(!confirm("به مطالعه آزاد منتقل شوید؟ این تلاش دیگر امتیاز رقابتی و نشان نخواهد داشت. برای رقابت دوباره، مأموریت مستقلی آغاز کنید."))return;
   C.switchToStudy(state);save();render();return;
 }
 if(action==="pause"){
   if(C.beginPause(state,Date.now())){save();render()}else alert("مکث رایگان این تلاش استفاده شده یا زمان پایان یافته است.");return;
 }
 if(action==="resume"){if(C.resume(state,Date.now())){save();render()}return}
 if(action==="hint"){showHint();return}
 if(action==="closeHint"){closeModal();if(C.expired(state))showOvertime();return}
 if(action==="confirmHint"){
   var cost=C.hintCost(state,state.stage);
   if(cost&&!confirm("برای دریافت این راهنمای جدید ۲ امتیاز از نمره نهایی کسر می‌شود. تأیید می‌کنید؟"))return;
   if(C.grantHint(state,state.stage)){save();showHint()}return;
 }
 if(action==="extend"){
   var input=root.querySelector("#ljExtraMinutes"),mins=input?Number(input.value):0,cost=C.extensionCost(mins);
   if(cost===null){alert("عدد صحیحی بین ۱ و ۶۰ دقیقه وارد کنید.");return}
   if(!confirm(fa(mins)+" دقیقه وقت اضافه و "+fa(cost)+" امتیاز کسر تأیید شود؟"))return;
   if(C.buyExtension(state,mins,Date.now())){save();render()}return;
 }
 if(action==="submit"){
   if(state.pause.since)return;
   if(C.expired(state)){render();return}
   var dr=state.drafts[state.stage]||{},st=D.steps[state.stage];
   if(!C.submit(state,st,dr.choice,dr.practice,dr.rating)){alert("یک گزینه انتخاب کنید، حداقل ۱۲ حرف در تمرین بنویسید و سطح خودارزیابی را مشخص کنید.");return}
   save();render();return;
 }
 if(action==="advance"){if(state.pause.since||C.expired(state)){render();return}next();return}
 if(action==="breakContinue"){
   if(state.pause.since)return;
   if(Date.now()-state.breakStartedAt<30000)return;
   if(C.expired(state)){render();return}
   state.breaksDone.push(state.stage);state.stage++;state.phase="step";state.breakStartedAt=0;save();render();return;
 }
 if(action==="png"&&state.finished){downloadBadge();return}
 if(action==="print"&&state.finished){window.print();return}
}
function tick(){
 if(!state||!active()||state.finished||state.mode!=="competitive")return;
 if(state.pause.since&&C.syncPause(state,Date.now())){save();render();return}
 var pause=root.querySelector("#ljPauseClock");if(pause)pause.textContent=fmt(C.pauseRemaining(state));
 var clock=root.querySelector("#ljClock");if(clock)clock.textContent=fmt(C.remaining(state));
 var b=root.querySelector("#ljBreakClock");if(b){
   var left=Math.max(0,30000-(Date.now()-state.breakStartedAt));
   b.textContent=fmt(left);var next=root.querySelector('[data-lj="breakContinue"]');if(next)next.disabled=left>0;
 }
 if(C.expired(state)&&!state.pause.since){if(!root.querySelector(".lj-modal.overtime")){closeModal();showOvertime();}}
}
root.addEventListener("keydown",function(e){
 var m=root.querySelector('#ljModal');if(!m)return;
 if(e.key==='Escape'&&!m.matches('.pause,.overtime')){e.preventDefault();closeModal();return}
 if(e.key==='Tab'){var items=Array.from(m.querySelectorAll('button:not(:disabled),input,select,textarea,a[href]')),first=items[0],last=items[items.length-1];if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus()}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus()}}
});
root.addEventListener("click",handleClick);
root.addEventListener("input",function(e){
 if(e.target.id==="ljExtraMinutes"){var n=Number(e.target.value),c=C.extensionCost(n),x=root.querySelector("#ljExtraCost");if(x)x.textContent=c===null?"عدد صحیح بین ۱ تا ۶۰ دقیقه وارد کنید.":fa(n)+" دقیقه · "+fa(c)+" امتیاز کسر؛ مجموع تمدید: "+fa(C.timePenalty(state)+c);return}
 if(e.target.matches('input[name="ljDecision"],#ljPractice,#ljRating'))saveDraft();
});
root.addEventListener("change",function(e){if(e.target.matches('input[name="ljDecision"],#ljPractice,#ljRating'))saveDraft()});
window.addEventListener("hashchange",function(){if(active())render()});
window.addEventListener("storage",function(e){if(e.key===KEY){state=load();if(active())render();else updatePassport()}});
var topbar=document.querySelector('.topbar');
if(topbar&&window.ResizeObserver){new ResizeObserver(function(){root.style.setProperty('--lj-topbar-height',topbar.getBoundingClientRect().height+'px')}).observe(topbar)}
state=load();render();ticker=setInterval(tick,1000);
})();