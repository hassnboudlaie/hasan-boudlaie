/* Saba Naft · My Leadership Skills | Guided Learning Journey v1
   Integrates with the existing course shell and its original content; isolated local storage.
   This is a self-directed educational tool. No server-side examination, identity proof or certification.
*/
(function(g){"use strict";
const KEY="sabanaft_leadership_journey_v1", BASE=3600000, BREAK=300000, RECOVERY=30000;
const FREE_HINTS=2,HINT_COST=2,MAX_EXTENSION=60;
const COURSE=g.SABA_REFLECTIVE?.sessions||[], CASES=g.SabaJourneyContent||{};
const root=document.getElementById("journeyView");
if(!root||!COURSE.length)return;
const esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const fa=n=>Number(n||0).toLocaleString("fa-IR");
const clamp=(n,a,b)=>Math.max(a,Math.min(b,Number(n)||0));
const stages=["جهت‌گیری و مسئله","مفهوم کلیدی اول","تصمیم موقعیتی اول","شواهد و بافت","خودارزیابی بازتابی","تحلیل رفتار رهبری","تصمیم موقعیتی دوم","تمرین گفت‌وگو","تعهد و پیگیری","آزمون فهم و جمع‌بندی"];
const weights=[4,6,18,8,2,8,18,10,10,16];
let store={version:1,runs:{},history:[]},activeSession=1,guideVisible=false,storeError=false,restartApproved=false;
try{const x=JSON.parse(localStorage.getItem(KEY)||"null");if(x&&x.version===1&&x.runs&&typeof x.runs==="object"){store={version:1,runs:x.runs,history:Array.isArray(x.history)?x.history:[]}}}catch(e){storeError=true}
function save(){try{localStorage.setItem(KEY,JSON.stringify(store));storeError=false;return true}catch(e){storeError=true;return false}}
function session(id){return COURSE.find(s=>s.id===Number(id))}
function runOf(id){const x=store.runs[id];return x&&x.session===Number(id)?x:null}
function fresh(id,mode){const t=Date.now();return {id:String(t)+"-"+Math.random().toString(36).slice(2,8),session:Number(id),mode,createdAt:t,startedAt:mode==="competitive"?t:0,status:"active",stage:0,answers:{},drafts:{},scores:{},hints:[],extensions:[],overtimeGraceMs:0,pause:{used:false,since:0,spentMs:0},rest:null,rested:[],feedbackStage:null,finishedAt:0}}
function total(list,field){return (Array.isArray(list)?list:[]).reduce((n,x)=>n+(Math.max(0,Number(x?.[field])||0)),0)}
function rawScore(r){return Math.round(Object.values(r?.scores||{}).reduce((sum,n)=>sum+clamp(n,0,18),0))}
function penalty(r){return {guide:total(r?.hints,"cost"),overtime:total(r?.extensions,"cost")}}
function score(r){const p=penalty(r),raw=rawScore(r);return {raw,guide:p.guide,overtime:p.overtime,net:Math.max(0,raw-p.guide-p.overtime)}}
function badge(n){return n>=85?"طلایی":n>=70?"نقره‌ای":n>=55?"برنزی":"نیازمند تمرین"}
function left(r,now=Date.now()){if(!r||r.mode!=="competitive"||!r.startedAt)return Infinity;
 const p=r.pause||{},active=p.since?clamp(now-p.since,0,BREAK-clamp(p.spentMs,0,BREAK)):0;
 return BASE+total(r.extensions,"minutes")*60000+clamp(p.spentMs,0,BREAK)+active+(Number(r.overtimeGraceMs)||0)-(now-r.startedAt)}
function overtimeCost(n){return Number.isInteger(n)&&n>=1&&n<=MAX_EXTENSION?Math.ceil(n/5)*2:null}
function toNumber(v){return Number(String(v??"").replace(/[۰-۹]/g,c=>String(c.charCodeAt(0)-1776)).replace(/[٠-٩]/g,c=>String(c.charCodeAt(0)-1632)))}
function hh(ms){if(!Number.isFinite(ms))return "بدون محدودیت";const x=Math.max(0,Math.ceil(ms/1000)),h=Math.floor(x/3600),m=Math.floor(x%3600/60),s=x%60;return [h,m,s].map(n=>String(n).padStart(2,"0")).join(":")}
function normalizePause(r,now=Date.now()){if(!r?.pause?.since)return false;
 if(now-r.pause.since<BREAK-clamp(r.pause.spentMs,0,BREAK))return false;
 r.pause.spentMs=BREAK;r.pause.since=0;save();return true}
function section(s,n){return s.sections[Math.min(n,s.sections.length-1)]}
function lessonBlock(s,n){const a=section(s,n);if(!a)return "";
 return '<article class="lj-lesson"><span class="lj-pill">از محتوای اصلی دوره · '+esc(a.title)+'</span><h3>'+esc(a.lead)+'</h3>'+
 (a.blocks||[]).map(b=>'<div class="lj-point"><strong>'+esc(b.title)+'</strong><p>'+esc(b.text)+'</p></div>').join("")+
 '<p class="lj-source">ارجاع کتاب: فصل '+esc(a.source?.chapter||"")+' · صفحه '+esc(a.source?.pages||"")+'</p></article>'}
function caseCard(c,free,draft){return '<div class="lj-case"><h3>موقعیت مدیریتی</h3><p>'+esc(c.scene)+'</p></div>'+
 '<fieldset class="lj-options"><legend>'+esc(c.question)+'</legend>'+c.options.map((o,j)=>'<label class="lj-option"><input type="radio" name="choice" value="'+j+'" '+(Number(draft.choice)===j?'checked':'')+'><span>'+esc(o[0])+'</span></label>').join("")+'</fieldset>'+
 (free?'<details class="lj-open-analysis"><summary>تحلیل آموزشی گزینه‌ها (مطالعه آزاد)</summary>'+c.options.map(o=>'<p><strong>'+esc(o[0])+'</strong> '+esc(o[1])+'</p>').join("")+'</details>':"")}
function txt(label,name,placeholder,value="",min=12){return '<label class="lj-field"><strong>'+esc(label)+'</strong><textarea name="'+name+'" data-min="'+min+'" rows="4" placeholder="'+esc(placeholder)+'">'+esc(value)+'</textarea></label>'}
function selfCopy(k){return ["این موقعیت هنوز نیازمند تمرین هدفمند است. از یک رفتار کوچک شروع کن.","پایه مهارت دیده می‌شود، اما بهتر است شواهد و شرایط اجرای آن را روشن کنی.","در بسیاری از موقعیت‌ها از این مهارت استفاده می‌کنی. یک موقعیت دشوار را برای آزمون انتخاب کن.","اعتمادبه‌نفس بالاست؛ با دریافت بازخورد دیگران آن را با رفتار واقعی اعتبارسنجی کن."][k-1]||""}
function stageBody(s,r,i,free){const d=r.drafts?.[i]||{},c=CASES[s.id],opts=s.checks||[];
 let heading='<div class="lj-stage-head"><span>مرحله '+fa(i+1)+' از ۱۰</span><h2>'+stages[i]+'</h2><p>'+esc([c.focus,section(s,0)?.lead, "دو راه قابل دفاع را از نظر پیامد مقایسه کن.",section(s,1)?.lead,"سطح رفتار خود را بر اساس یک شاهد ارزیابی کن.",section(s,2)?.lead,"تصمیم را با ریسک و نقش مدیر بسنج.",section(s,3)?.lead,"جمله‌ای بنویس که در گفت‌وگوی واقعی قابل بیان باشد.","یک اقدام مشخص برای محیط کار انتخاب کن.","این دو پرسش فقط فهم مفهوم را می‌سنجند؛ بازبینی گزینه‌ها در پایان مأموریت است."][i])+'</p></div>';
 let body="";
 if(i===0)body='<div class="lj-case"><h3>مسئله آغازین این جلسه</h3><p>'+esc(c.cases[0].scene)+'</p></div>'+txt("در این موقعیت، مدیر دقیقاً با کدام تصمیم درباره نقش خود روبه‌روست؟","text","یک جمله درباره مسئولیت، اختیار یا انتظار تیم بنویسید.",d.text,12);
 if(i===1)body=lessonBlock(s,0)+txt("این ایده در کدام موقعیت کار شما قابل مشاهده است؟","text","نام فرد یا اطلاعات محرمانه ننویسید.",d.text,10);
 if(i===2)body=caseCard(c.cases[0],free,d);
 if(i===3)body=lessonBlock(s,1)+txt("یک شاهد واقعی از بافت واحد خود ذکر کنید.","text","رفتار یا شرایط قابل مشاهده را توصیف کنید.",d.text,12);
 if(i===4)body=lessonBlock(s,Math.min(2,s.sections.length-1))+'<fieldset class="lj-self"><legend>در دو هفته گذشته چقدر توانسته‌اید این مهارت را در یک موقعیت واقعی به‌کار ببرید؟</legend>'+["به‌ندرت","گاهی و با کمک","اغلب","مستمر و آگاهانه"].map((x,j)=>'<label><input type="radio" name="self" value="'+(j+1)+'" '+(Number(d.self)===j+1?'checked':'')+'><span>'+esc(x)+'</span></label>').join("")+'</fieldset>'+txt("شاهد رفتاری انتخاب خود","text","چه کردید و دیگری چه دید؟",d.text,10);
 if(i===5)body=lessonBlock(s,2)+txt("چه فرضی را در شیوه رهبری خود لازم است دوباره بررسی کنید؟","text","فرض، شواهد و پیامد احتمالی را مختصر توضیح دهید.",d.text,12);
 if(i===6)body=caseCard(c.cases[1],free,d);
 if(i===7)body=lessonBlock(s,3)+'<div class="lj-case"><h3>Role-play | گفت‌وگوی دونفره</h3><p>شما مدیر هستید و همکار درباره محدوده اختیار یا نحوه کار سؤال دارد. دو نوبت دیالوگ بنویسید: یک جمله از مدیر و یک پاسخ محتمل از همکار؛ سپس یک پرسش پیگیری مطرح کنید.</p></div>'+txt("گفت‌وگوی قابل اجرا","text","مدیر: … / همکار: … / پرسش پیگیری: …",d.text,30);
 if(i===8)body=lessonBlock(s,Math.min(4,s.sections.length-1))+(s.sections.length>5?lessonBlock(s,5):"")+
 txt("Next best action | اقدام مشخص شما","action","چه کاری انجام خواهید داد؟",d.action,12)+
 '<div class="lj-grid2">'+txt("موعد و مسئول","when","چه زمانی و با مسئولیت چه کسی؟",d.when,6)+txt("شاهد موفقیت و روش بازبینی","evidence","از چه چیزی می‌فهمید پیشرفت کرده‌اید؟",d.evidence,12)+'</div>';
 if(i===9)body=opts.slice(0,2).map((q,k)=>'<fieldset class="lj-options lj-check"><legend>'+fa(k+1)+'. '+esc(q.question)+'</legend>'+
 (q.options||[]).map((o,j)=>'<label class="lj-option"><input type="radio" name="check'+k+'" value="'+j+'" '+(Number(d["check"+k])===j?'checked':'')+'><span>'+esc(o)+'</span></label>').join("")+'</fieldset>').join("");
 if(free&&[0,1,3,4,5,7,8].includes(i))body+='<p class="lj-free-note">در مطالعه آزاد، نوشتن پاسخ اختیاری است و هیچ امتیازی محاسبه نمی‌شود.</p>';
 if(free&&i===9)body+='<details class="lj-open-analysis"><summary>پاسخنامه مفهومی برای مطالعه آزاد</summary>'+opts.slice(0,2).map((q,k)=>'<p><strong>پرسش '+fa(k+1)+':</strong> '+esc(q.options[q.correct])+' — '+esc(q.why)+'</p>').join("")+'</details>';
 return heading+'<form id="lj-stage-form">'+body+(free?'<div class="lj-actions"><button type="button" class="lj-primary" data-action="nextStudy">مطالعه مرحله بعد ←</button></div>':'<div class="lj-actions"><button class="lj-primary" type="submit">ثبت فعالیت و امتیاز مرحله ←</button></div>')+'</form>'}
function coachText(r,i,event,quality){let x=CASES[r.session],target=stages[i];
 if(event==="start")return ["پیش از پاسخ، مسئله و انتظار از نقش مدیر را از هم جدا کن.","در این بخش به شواهد عملی توجه کن، نه برداشت کلی.","کدام پیامد انتخاب تو برای تیم قابل مشاهده خواهد بود؟","از یک تجربه واقعی و مشخص کمک بگیر.","نمره خودارزیابی، برچسب شخصیتی نیست؛ شاهد رفتاری مهم است.","کدام پیش‌فرض پنهان، انتخاب تو را هدایت می‌کند؟","پیش از انتخاب، اختیار و ریسک را یک بار دیگر بررسی کن.","به جمله‌هایی فکر کن که واقعاً در جلسه می‌توانی بگویی.","چه چیزی به تو کمک می‌کند تعهد را پیگیری کنی؟","با فهم مفهوم پاسخ بده؛ پاسخنامه پس از پایان ارائه می‌شود."][i];
 if(event==="done")return quality>=0.8?["انتخابت نشان می‌دهد به شواهد توجه کرده‌ای. در محیط واقعی نیز آن را بیازما.","نکته کلیدی را به رفتار تبدیل کن؛ ادامه مسیر همین است.","تصمیمت از چند زاویه بررسی شده است. حالا برای پیامد آن آماده باش."][i%3]:["این انتخاب یک نقطه خوب برای بازنگری است؛ چه فرضی پشت آن قرار داشت؟","نگاه دیگری به مسئولیت، خطر و تجربه همکار بینداز.","پیش از قضاوت نهایی، پیامد احتمالی را در بافت خود بسنج."][i%3];
 return "این مرحله فرصتی برای آزمودن «"+esc(x.skill)+"» در رفتار واقعی است."}
function hintText(s,i){const x=CASES[s.id],a=section(s,Math.min(4,Math.floor(i/2))),kind=[2,6].includes(i)?"decision":i===4?"self":i===7?"role":i===8?"follow":"learning";
 const tips={decision:["سه چیز را جدا کن: واقعیت مسئله، محدوده اختیار، و پیامد هر گزینه.","برای دو گزینه نزدیک، بپرس اگر فردا اجرا شوند چه شواهدی تفاوتشان را نشان می‌دهد؟","کدام فرض درباره توان تیم را هنوز بررسی نکرده‌ای؟"],self:["یک موقعیت مشخص از دو هفته اخیر را انتخاب کن.","رفتار خودت را با جمله و اقدام قابل مشاهده توصیف کن، نه با صفت شخصیتی.","چه بازخوردی از یک همکار می‌تواند خودارزیابی تو را دقیق‌تر کند؟"],role:["هدف گفت‌وگو را قبل از جمله اول روشن کن.","از یک سؤال باز، بازتاب برداشت و توافق اقدام استفاده کن.","اگر همکار با برداشت تو مخالف باشد، چه پرسشی به گفت‌وگو کمک می‌کند؟"],follow:["یک تعهد کوچک اما قابل مشاهده انتخاب کن.","صاحب اقدام، موعد و شاهد موفقیت را در یک جمله ثبت کن.","چه مانعی ممکن است Follow-through را متوقف کند و راه مواجهه چیست؟"],learning:["ایده را در یک موقعیت واقعی از همان واحد آزمایش کن.","از مشاهده یک رفتار، تحلیل علت و انتخاب اقدام بعدی استفاده کن.","کدام فرض در این بافت ممکن است درست نباشد؟"]};
 const t=tips[kind];return '<h3>راهنمای همراه · '+esc(stages[i])+'</h3><p><strong>نکته کاربردی:</strong> '+esc(x.focus)+'؛ '+esc(a?.lead||"")+'</p><p><strong>تکنیک اجرایی:</strong> '+esc(t[1])+'</p><p><strong>پرسش کوچینگ:</strong> '+esc(t[2])+'</p><p class="lj-guide-note">این راهنما برای تقویت تفکر است؛ پاسخ صحیح آزمون را نشان نمی‌دهد.</p>'}
function header(s,r){const p=score(r),study=r.mode==="study";return '<header class="lj-top"><button type="button" class="lj-back" data-action="back">→ جلسات</button><div class="lj-brand"><img src="./assets/my-leadership-icon.svg" alt=""><div><strong>سفر مهارت‌های رهبری من</strong><small>جلسه '+fa(s.id)+' · '+esc(s.title)+'</small></div></div><div class="lj-metrics"><span id="lj-clock" class="lj-time" aria-label="زمان باقی‌مانده">'+(study?"مطالعه آزاد":hh(left(r)))+'</span><span class="lj-points">'+(study?"بدون رقابت":fa(p.net)+" امتیاز خالص فعلی")+'</span></div></header>'+
 '<div class="lj-track" aria-label="پیشرفت مأموریت">'+stages.map((a,i)=>'<span class="'+(i<r.stage||r.status==="completed"?"done":i===r.stage?"current":"")+'" title="'+esc(a)+'"></span>').join("")+'</div>'+
 '<div class="lj-meta"><strong>مرحله '+fa(Math.min(r.stage+1,10))+' از ۱۰</strong><span>'+fa(Math.round((r.status==="completed"?10:r.stage)/10*100))+'٪ پیشرفت</span><span>'+esc(study?"بدون تایمر و نشان":"مأموریت رقابتی ۶۰ دقیقه‌ای")+'</span></div>'}
function menus(s,r){return '<div class="lj-controls"><button type="button" data-action="back">→ بازگشت</button>'+
 (r.mode==="competitive"&&r.status==="active"?'<button type="button" data-action="pause" '+(r.pause.used?'disabled title="سهمیه مکث استفاده شده"':'')+'>⏸ '+(r.pause.used?"مکث استفاده شده":"مکث ۵ دقیقه‌ای")+'</button><button type="button" data-action="studySwitch">مطالعه آزاد</button>':"")+
 '<button type="button" data-action="restart">شروع مأموریت جدید</button></div>'}
function archive(r){if(r.status!=="completed"||store.history.some(x=>x.id===r.id))return;
 const p=score(r);
 store.history.unshift({id:r.id,session:r.session,createdAt:r.createdAt,finishedAt:r.finishedAt,
 raw:p.raw,guide:p.guide,overtime:p.overtime,net:p.net,badge:badge(p.net),
 answers:r.answers,scores:r.scores});
 store.history=store.history.slice(0,40);save()}
function history(sid){const rows=store.history.filter(x=>!sid||x.session===sid);
 return '<details class="lj-history"><summary>سوابق مأموریت‌های تکمیل‌شده · '+fa(rows.length)+'</summary>'+
 (rows.length?rows.map(x=>{const n=Math.max(0,(Number(x.raw)||0)-(Number(x.guide)||0)-(Number(x.overtime)||0));return '<div class="lj-history-item"><strong>جلسه '+fa(x.session)+' · '+fa(n)+' از ۱۰۰ · '+esc(badge(n))+'</strong><span>خام: '+fa(x.raw)+' | راهنما: −'+fa(x.guide)+' | زمان: −'+fa(x.overtime)+' | '+new Date(x.finishedAt).toLocaleDateString("fa-IR")+'</span></div>'}).join(""):'<p>هنوز مأموریت تکمیل‌شده‌ای ثبت نشده است.</p>')+'</details>'}
function overview(s){const r=runOf(s.id),active=r?.status==="active";return '<div class="lj-overview"><div class="lj-cover"><img src="../assets/sabanaft-meeting.jpg" alt="همکاری تیم مدیریتی"><div><span>Leadership Development Journey</span><h1>'+esc(s.title)+'</h1><p>'+esc(s.subtitle)+' · '+esc(CASES[s.id].skill)+'</p></div></div>'+
 '<h2>مسیر یادگیری خود را انتخاب کنید</h2><div class="lj-mode-grid"><article class="lj-mode competitive"><span>۰۱ · Competitive Mission</span><h3>مأموریت رقابتی</h3><p>۱۰ مرحله هدفمند، ۶۰ دقیقه، کوچ همراه، دو ایستگاه بازیابی تمرکز، امتیاز و نشان نهایی.</p><button type="button" class="lj-primary" data-action="startComp">شروع مأموریت رقابتی</button></article>'+
 '<article class="lj-mode study"><span>۰۲ · Free Learning</span><h3>مطالعه آزاد</h3><p>همان محتوای اصلی، بدون محدودیت زمانی و امتیاز؛ جابه‌جایی آزاد میان همه مراحل و راهنمای نامحدود.</p><button type="button" class="lj-primary" data-action="startStudy">ورود به مطالعه آزاد</button></article></div>'+
 (active?'<div class="lj-resume"><strong>مسیر ناتمام شما محفوظ است.</strong><span>مرحله '+fa(r.stage+1)+' از ۱۰ · '+(r.mode==="study"?"مطالعه آزاد":"مأموریت رقابتی")+'</span><button type="button" class="lj-primary" data-action="resumeJourney">ادامه مسیر قبلی ←</button></div>':"")+
 '<p class="lj-disclaimer">حفظ داده‌ها فقط در همین مرورگر انجام می‌شود. نمره‌ها خوداظهاری و برای یادگیری‌اند؛ اعتبار آزمون یا گواهی سازمانی ندارند. هیچ داده محرمانه‌ای وارد نکنید.</p>'+history(s.id)+'</div>'}
function studyNav(r){return '<nav class="lj-study-nav" aria-label="انتخاب آزاد مراحل">'+stages.map((x,i)=>'<button data-action="studyStep" data-step="'+i+'" class="'+(i===r.stage?"current":"")+'">'+fa(i+1)+' · '+esc(x)+'</button>').join("")+'</nav>'}
function feedback(s,r){let i=r.feedbackStage??r.stage,earned=Number(r.scores[i])||0,p=score(r),q=earned/weights[i];
 return '<section class="lj-feedback"><span class="lj-check-icon">✓</span><h2>مرحله '+fa(i+1)+' ثبت شد</h2><p class="lj-earned">امتیاز این مرحله: <strong>'+fa(earned)+' از '+fa(weights[i])+'</strong></p><p>'+esc(coachText(r,i,"done",q))+'</p><div class="lj-score-strip"><span>امتیاز خام تا اینجا: '+fa(p.raw)+'</span><span>کسرها: '+fa(p.guide+p.overtime)+'</span><strong>خالص فعلی: '+fa(p.net)+'</strong></div><p class="lj-muted">پاسخنامه و تحلیل گزینه‌ها پس از پایان کامل مأموریت نمایش داده می‌شود.</p><button type="button" data-action="continue" class="lj-primary">مرحله بعد ←</button></section>'}
function recovery(r){const idx=r.rest?.after===3?0:1,elapsed=Date.now()-(r.rest?.startedAt||0),rem=Math.max(0,Math.ceil((RECOVERY-elapsed)/1000));
 const photo=idx===0?"sabanaft-niayesh.webp":"sabanaft-site.webp";
 return '<section class="lj-recovery"><div class="lj-recovery-visual" style="background-image:linear-gradient(90deg,#052e34dd,#134f4b9c),url(../assets/'+photo+')"><div class="lj-breath" aria-hidden="true"></div><div><span>Focus Recovery · ایستگاه '+fa(idx+1)+'</span><h2>۳۰ ثانیه بازیابی تمرکز</h2><p>'+(idx===0?"نگاهت را از صفحه بردار؛ نفس را آرام‌تر کن و به یک اولویت بازگرد.":"از خودت بپرس: کدام فرض مهم را باید در ادامه با شواهد بررسی کنم؟")+'</p></div></div><strong class="lj-recovery-clock" id="lj-recovery-clock">'+fa(rem)+' ثانیه</strong><p>زمان این توقف در ۶۰ دقیقه مأموریت لحاظ می‌شود.</p><button type="button" data-action="finishRest" id="lj-rest-go" class="lj-primary" '+(rem>0?"disabled":"")+'>ادامه سفر ←</button></section>'}
function pausePanel(r){const remaining=Math.max(0,Math.ceil((BREAK-clamp(r.pause.spentMs,0,BREAK)-(Date.now()-r.pause.since))/1000));
 return '<div class="lj-overlay" role="presentation"><section class="lj-dialog" role="dialog" aria-modal="true" aria-labelledby="lj-pause-title"><span>⏸ Pause Timer</span><h2 id="lj-pause-title">مکث کوتاه شما فعال است</h2><p>تایمر مأموریت تا سقف ۵ دقیقه متوقف شده و پس از آن خودکار ادامه می‌یابد. Refresh این زمان را تمدید نمی‌کند.</p><strong id="lj-pause-clock">'+hh(remaining*1000)+'</strong><button type="button" class="lj-primary" data-action="resumeTime">ادامه مأموریت</button></section></div>'}
function overtimePanel(r){return '<div class="lj-overlay" role="presentation"><section class="lj-dialog" role="dialog" aria-modal="true" aria-labelledby="lj-overtime-title"><span>Time Extension</span><h2 id="lj-overtime-title">درخواست زمان اضافه</h2><p>زمان ۶۰ دقیقه‌ای تمام شده است؛ پاسخ‌ها محفوظ هستند. برای هر ۵ دقیقه یا بخشی از آن ۲ امتیاز از نمره نهایی کسر می‌شود.</p><form id="lj-overtime-form"><label class="lj-field"><strong>چند دقیقه اضافه نیاز دارید؟</strong><input id="lj-extension-min" type="number" inputmode="numeric" min="1" max="60" step="1" value="5" required></label><p class="lj-cost" id="lj-extension-preview">۵ دقیقه · کسر ۲ امتیاز</p><button type="submit" class="lj-primary">تأیید کسر امتیاز و ادامه</button></form><button type="button" class="lj-secondary" data-action="studySwitch">ادامه بدون رقابت</button></section></div>'}
function guidePanel(s,r){const key=String(r.stage),old=(r.hints||[]).some(x=>x.key===key),cost=r.mode==="study"||old||(r.hints||[]).length<FREE_HINTS?0:HINT_COST;
 return '<aside class="lj-guide-panel" id="lj-guide-panel" role="dialog" aria-modal="false" aria-label="راهنمای همراه"><button class="lj-guide-close" type="button" data-action="closeGuide" aria-label="بستن راهنما">×</button>'+
 (old||r.mode==="study"?hintText(s,r.stage):'<div class="lj-guide-locked"><h3>راهنمای اختصاصی مرحله</h3><p>'+(cost?'دو راهنمای رایگان این مأموریت استفاده شده است. دریافت این راهنمای جدید '+fa(cost)+' امتیاز از نمره نهایی کسر می‌کند.':'این راهنما رایگان است و به تصمیم‌گیری مستقل کمک می‌کند.')+'</p><button type="button" data-action="unlockGuide" class="lj-primary">'+(cost?'تأیید کسر '+fa(cost)+' امتیاز و دریافت':'دریافت راهنمای رایگان')+'</button></div>')+
 '<div class="lj-guide-foot">راهنماهای دریافت‌شده: '+fa(r.hints.length)+' · مجموع کسر: '+fa(penalty(r).guide)+'</div></aside>'}
function finish(s,r){const p=score(r);let entries=[];
 [2,6].forEach((i,k)=>{const c=CASES[s.id].cases[k],selected=Number(r.answers?.[i]?.choice);entries.push('<article class="lj-review-item"><h3>تصمیم موقعیتی '+fa(k+1)+'</h3><p>'+esc(c.scene)+'</p><p><strong>انتخاب شما:</strong> '+esc(c.options[selected]?.[0]||"بدون پاسخ")+'</p>'+c.options.map((o,j)=>'<p class="'+(j===selected?"lj-review-selected":"")+'"><b>'+fa(j+1)+'. '+esc(o[0])+'</b> '+esc(o[1])+(o[2]===18?' <em>گزینه سازگارتر با بافتِ تعریف‌شده</em>':'')+'</p>').join("")+'</article>')});
 const qs=s.checks.slice(0,2);qs.forEach((q,j)=>{const chosen=Number(r.answers?.[9]?.["check"+j]);entries.push('<article class="lj-review-item"><h3>پرسش مفهومی '+fa(j+1)+'</h3><p>'+esc(q.question)+'</p><p>پاسخ شما: '+esc(q.options[chosen]||"ثبت نشده")+'</p><p><strong>گزینه قابل دفاع:</strong> '+esc(q.options[q.correct])+'</p><p>'+esc(q.why)+'</p></article>')});
 const weakest=[2,6].map(i=>Number(r.scores[i])||0);const next=weakest.some(x=>x<12)?"در موقعیت مدیریتی بعدی، قبل از تصمیم سه فرض درباره اختیار، ریسک و آمادگی تیم را بنویس و با یک همکار قابل اعتماد مرور کن.":"در هفت روز آینده یک تصمیم مشخص را با چارچوب نقش رهبری اجرا کن، اثر آن را ثبت کن و در گفت‌وگوی بعدی بازخورد بگیر.";
 return '<section class="lj-results"><div class="lj-result-hero"><img src="./assets/my-leadership-icon.svg" alt="نشان برند"><span>My Leadership Skills</span><h1>مأموریت رهبری تکمیل شد</h1><p>جلسه '+fa(s.id)+' · '+esc(s.title)+'</p><div class="lj-medal '+(p.net>=85?"gold":p.net>=70?"silver":p.net>=55?"bronze":"neutral")+'"><span>✦</span><strong>'+esc(badge(p.net))+'</strong><b>'+fa(p.net)+'/۱۰۰</b></div></div>'+
 '<div class="lj-score-grid"><div><span>امتیاز خام</span><strong>'+fa(p.raw)+'</strong></div><div><span>کسر راهنما</span><strong>−'+fa(p.guide)+'</strong></div><div><span>کسر زمان اضافه</span><strong>−'+fa(p.overtime)+'</strong></div><div><span>امتیاز خالص نهایی</span><strong>'+fa(p.net)+'</strong></div></div>'+
 '<div class="lj-next-step"><h2>Next Best Development Step</h2><p>'+esc(next)+'</p><p>این امتیاز یک بازخورد یادگیری است و درباره شایستگی شغلی یا عملکرد واقعی شما حکم قطعی صادر نمی‌کند.</p></div>'+
 '<div class="lj-actions"><button type="button" class="lj-primary" data-action="downloadPng">دریافت نشان به‌صورت PNG</button><button type="button" class="lj-secondary" data-action="printBadge">چاپ / ذخیره به‌صورت PDF</button><button type="button" class="lj-secondary" data-action="restart">مأموریت جدید</button></div>'+
 '<details class="lj-final-analysis"><summary>مشاهده پاسخنامه، تحلیل گزینه‌ها و بازخورد توسعه‌ای</summary>'+entries.join("")+'</details>'+
 history(s.id)+'<p class="lj-disclaimer">این نتیجه بر اساس امتیاز خالص پس از همه کسرهای تأییدشده است. داده‌ها فقط در مرورگر این دستگاه ذخیره می‌شوند.</p></section>'}
function drawBadge(s,r,print){const p=score(r),c=document.createElement("canvas");c.width=1000;c.height=670;const ctx=c.getContext("2d");if(!ctx){alert("مرورگر امکان دریافت تصویر را ندارد.");return}
 const grd=ctx.createLinearGradient(0,0,1000,670);grd.addColorStop(0,"#083c3a");grd.addColorStop(1,"#12675b");ctx.fillStyle=grd;ctx.fillRect(0,0,1000,670);
 ctx.strokeStyle="#dab46f";ctx.lineWidth=5;ctx.strokeRect(38,38,924,594);ctx.textAlign="center";ctx.fillStyle="#fff8e6";ctx.font="bold 42px Tahoma";ctx.fillText("مهارت‌های رهبری من",500,125);
 ctx.fillStyle="#cfe8dd";ctx.font="26px Tahoma";ctx.fillText("Leadership Learning Achievement",500,174);
 ctx.beginPath();ctx.arc(500,320,95,0,Math.PI*2);ctx.fillStyle=p.net>=85?"#d9aa52":p.net>=70?"#b8c3cd":p.net>=55?"#bb815c":"#78968e";ctx.fill();ctx.strokeStyle="#fff2c9";ctx.lineWidth=8;ctx.stroke();
 ctx.fillStyle="#132d31";ctx.font="bold 52px Tahoma";ctx.fillText(String(p.net),500,325);ctx.font="24px Tahoma";ctx.fillText("از ۱۰۰",500,365);
 ctx.fillStyle="#ffffff";ctx.font="bold 34px Tahoma";ctx.fillText(badge(p.net),500,468);
 ctx.font="26px Tahoma";ctx.fillText("جلسه "+fa(s.id)+" · "+s.title.slice(0,32),500,529);
 ctx.font="18px Tahoma";ctx.fillText("امتیاز خام "+fa(p.raw)+" | کسر راهنما "+fa(p.guide)+" | کسر زمان "+fa(p.overtime),500,580);
 const url=c.toDataURL("image/png");if(print){const win=g.open("","_blank");if(!win){alert("برای ذخیره PDF اجازه بازشدن صفحه چاپ را بدهید.");return}win.document.write('<!doctype html><html lang="fa" dir="rtl"><head><meta charset="utf-8"><title>نشان رهبری من</title><style>body{margin:0;display:grid;place-items:center;min-height:100vh}img{max-width:100%;height:auto}@page{size:A4 landscape;margin:12mm}</style></head><body><img src="'+url+'" onload="window.print()" alt="نشان مهارت‌های رهبری من"></body></html>');win.document.close()}else{const a=document.createElement("a");a.href=url;a.download="my-leadership-skills-session-"+s.id+".png";a.click()}}
function render(id,showIntro=false){if(!showIntro)restartApproved=false;const s=session(id);if(!s||!CASES[s.id])return;activeSession=s.id;normalizePause(runOf(id));
 const r=runOf(id);guideVisible=false;
 if(!r||showIntro){root.innerHTML='<div class="lj-wrap"><div class="lj-pagebar"><button data-action="back" type="button">→ بازگشت به جلسه</button><img src="./assets/my-leadership-icon.svg" alt=""><strong>مهارت‌های رهبری من</strong></div>'+overview(s)+'</div>';return}
 let html=header(s,r);
 if(r.status==="completed")html+=finish(s,r);
 else if(r.rest)html+=recovery(r);
 else if(r.feedbackStage!==null)html+=feedback(s,r);
 else html+='<div class="lj-layout"><div class="lj-main"><div class="lj-coach"><span>کوچ همراه</span><p>'+esc(coachText(r,r.stage,"start"))+'</p></div>'+stageBody(s,r,r.stage,r.mode==="study")+'</div>'+
 (r.mode==="study"?'<aside class="lj-study-panel"><h3>مرور آزاد مراحل</h3>'+studyNav(r)+'</aside>':'')+'</div>';
 html+=r.status==="active"?menus(s,r):"";
 html+='<p class="lj-disclaimer">محتوای این مسیر برای توسعه فردی است؛ داده‌ها در همان مرورگر می‌مانند. هیچ پاسخ یا کیس محرمانه‌ای ثبت نکنید.</p>';
 if(storeError)html+='<p class="lj-error">ذخیره‌سازی مرورگر در دسترس نیست؛ پیشرفت پس از خروج ممکن است باقی نماند.</p>';
 if(r.status==="active")html+='<button type="button" id="lj-float-guide" class="lj-float-guide" data-action="openGuide" aria-haspopup="dialog">؟ <strong>راهنمای همراه</strong><small>'+(r.mode==="study"?"رایگان":r.hints.length<FREE_HINTS?fa(FREE_HINTS-r.hints.length)+" رایگان":'هر راهنمای جدید: −۲')+'</small></button>';
 if(r.pause?.since)html+=pausePanel(r);else if(r.mode==="competitive"&&r.status==="active"&&left(r)<=0)html+=overtimePanel(r);
 root.innerHTML='<div class="lj-wrap">'+html+'</div>';
}
function start(mode){const old=runOf(activeSession);
 if(old?.status==="active"&&!restartApproved&&!confirm("با شروع یک مسیر جدید، پاسخ‌ها و پیشرفت مسیر ناتمام این جلسه پاک می‌شوند. ادامه می‌دهید؟"))return;
 restartApproved=false;
 store.runs[activeSession]=fresh(activeSession,mode);if(!save())alert("هشدار: داده‌ها در حافظه مرورگر ذخیره نشدند.");
 render(activeSession)}
function switchStudy(){const r=runOf(activeSession);if(!r||r.mode==="study")return;
 if(!confirm("با خروج از رقابت، امتیاز و حق دریافت نشانِ این تلاش لغو می‌شود. مطالعه آزاد از همین مرحله و بدون محدودیت ادامه پیدا می‌کند. تأیید می‌کنید؟"))return;
 r.mode="study";r.startedAt=0;r.rest=null;r.feedbackStage=null;r.hints=[];r.extensions=[];r.scores={};r.answers={};r.pause={used:false,since:0,spentMs:0};save();render(activeSession)}
function chooseStep(i){const r=runOf(activeSession);if(r?.mode!=="study")return;r.stage=clamp(i,0,9);save();render(activeSession)}
function collectDraft(){const r=runOf(activeSession),form=root.querySelector("#lj-stage-form");if(!r||!form||r.status!=="active"||r.feedbackStage!==null||r.rest)return;
 const item={};form.querySelectorAll("textarea,input").forEach(el=>{if(el.type==="radio"){if(el.checked)item[el.name]=el.value}else item[el.name]=el.value});r.drafts[r.stage]=item;save()}
function submitStage(){const r=runOf(activeSession),s=session(activeSession);if(!r||r.mode!=="competitive"||r.feedbackStage!==null||r.status!=="active"||r.rest||r.pause.since||left(r)<=0)return;
 collectDraft();const i=r.stage,d=r.drafts[i]||{};
 const min=i===7?30:i===8?0:i===4?10:([0,1,3,5].includes(i)?10:0);
 if(min&&String(d.text||"").trim().length<min){alert("برای ثبت این مرحله، یک پاسخ مشخص و قابل مشاهده بنویسید.");return}
 if(i===4&&(!d.self||!String(d.text||"").trim())){alert("سطح و شاهد رفتاری خود را ثبت کنید.");return}
 if(i===8&&(!d.action||String(d.action).trim().length<12||!d.when||String(d.when).trim().length<6||!d.evidence||String(d.evidence).trim().length<12)){alert("اقدام، موعد و شاهد پیشرفت را تکمیل کنید.");return}
 if([2,6].includes(i)&&(d.choice===undefined||d.choice==="")){alert("یک گزینه را انتخاب کنید.");return}
 if(i===9&&(![0,1].every(k=>d["check"+k]!==undefined&&d["check"+k]!==""))){alert("برای هر دو پرسش یک پاسخ ثبت کنید.");return}
 let pts=weights[i];
 if(i===2||i===6)pts=CASES[activeSession].cases[i===2?0:1].options[Number(d.choice)][2];
 if(i===9)pts=[0,1].reduce((sum,k)=>sum+(Number(d["check"+k])===s.checks[k].correct?8:0),0);
 r.answers[i]=Object.assign({},d);r.scores[i]=pts;r.feedbackStage=i;
 if(i===9){r.status="completed";r.finishedAt=Date.now();r.feedbackStage=null;archive(r)}
 save();render(activeSession)}
function goNext(){const r=runOf(activeSession);if(!r)return;if(r.mode==="study"){r.stage=Math.min(9,r.stage+1);save();render(activeSession);return}
 if(r.feedbackStage===null)return;
 const old=r.feedbackStage;r.feedbackStage=null;
 if([3,6].includes(old)&&!r.rested.includes(old)){r.rest={after:old,startedAt:Date.now()}}else r.stage=Math.min(9,old+1);
 save();render(activeSession)}
function restNext(){const r=runOf(activeSession);if(!r?.rest||Date.now()-r.rest.startedAt<RECOVERY)return;
 r.rested.push(r.rest.after);r.stage=Math.min(9,r.rest.after+1);r.rest=null;save();render(activeSession)}
function pause(){const r=runOf(activeSession);if(!r||r.mode!=="competitive"||r.pause.used||r.pause.since||left(r)<=0)return;
 if(!confirm("یک نوبت مکث رایگان تا سقف ۵ دقیقه دارید. شروع مکث؟"))return;
 r.pause.used=true;r.pause.since=Date.now();r.pause.spentMs=0;save();render(activeSession)}
function resumeTime(){const r=runOf(activeSession);if(!r?.pause?.since)return;
 r.pause.spentMs=clamp(r.pause.spentMs+Date.now()-r.pause.since,0,BREAK);r.pause.since=0;save();render(activeSession)}
function extend(){const r=runOf(activeSession),n=toNumber(root.querySelector("#lj-extension-min")?.value),cost=overtimeCost(n);
 if(!r||r.mode!=="competitive"||left(r)>0||cost===null){alert("تعداد دقیقه باید عدد صحیح بین ۱ تا ۶۰ باشد.");return}
 if(!confirm(fa(n)+" دقیقه تمدید با کسر "+fa(cost)+" امتیاز ثبت شود؟"))return;
 // Negative time accumulated while the decision modal was open is not charged to the learner.
 const expiredBy=Math.max(0,-left(r));r.overtimeGraceMs=(Number(r.overtimeGraceMs)||0)+expiredBy;
 r.extensions.push({minutes:n,cost,at:Date.now()});save();render(activeSession)}
function openGuide(){const r=runOf(activeSession),s=session(activeSession);if(!r||r.status!=="active")return;
 guideVisible=true;root.querySelector(".lj-guide-panel")?.remove();root.querySelector(".lj-wrap")?.insertAdjacentHTML("beforeend",guidePanel(s,r));root.querySelector("#lj-float-guide")?.setAttribute("aria-expanded","true")}
function unlockGuide(){const r=runOf(activeSession);if(!r)return;const key=String(r.stage);
 if(!r.hints.some(x=>x.key===key)){const cost=r.mode==="study"||r.hints.length<FREE_HINTS?0:HINT_COST;
 if(cost&&!confirm("دریافت این راهنمای جدید "+fa(cost)+" امتیاز از نمره نهایی کسر می‌کند. تأیید می‌کنید؟"))return;
 r.hints.push({key,cost,at:Date.now()});if(!save())alert("ثبت راهنما ممکن نشد؛ ذخیره‌سازی مرورگر را بررسی کنید.")}
 openGuide()}
function closeGuide(){guideVisible=false;root.querySelector(".lj-guide-panel")?.remove();root.querySelector("#lj-float-guide")?.setAttribute("aria-expanded","false")}
function tick(){const r=runOf(activeSession);if(!r||r.status!=="active"||!root.classList.contains("active"))return;
 if(normalizePause(r)){render(activeSession);return}
 const c=root.querySelector("#lj-clock");if(c&&r.mode==="competitive")c.textContent=hh(left(r));
 if(r.rest){const remain=Math.max(0,Math.ceil((RECOVERY-(Date.now()-r.rest.startedAt))/1000));const x=root.querySelector("#lj-recovery-clock");if(x)x.textContent=fa(remain)+" ثانیه";const b=root.querySelector("#lj-rest-go");if(b)b.disabled=remain>0}
 const pc=root.querySelector("#lj-pause-clock");if(pc&&r.pause.since)pc.textContent=hh(Math.max(0,BREAK-r.pause.spentMs-(Date.now()-r.pause.since)));
 if(r.mode==="competitive"&&!r.pause.since&&!root.querySelector("#lj-overtime-form")&&left(r)<=0){render(activeSession)}}
root.addEventListener("click",e=>{const b=e.target.closest("[data-action]");if(!b)return;const a=b.dataset.action;
 if(a==="back"){g.location.hash="/session/"+activeSession;return}
 if(a==="startComp")return start("competitive");
 if(a==="startStudy")return start("study");
 if(a==="resumeJourney")return render(activeSession);
 if(a==="studySwitch")return switchStudy();
 if(a==="restart"){const r=runOf(activeSession);if(r?.status!=="completed"&&!confirm("شروع مجدد، پیشرفت ناتمام این جلسه را پاک می‌کند. سوابق تکمیل‌شده محفوظ می‌مانند. ادامه می‌دهید؟"))return;restartApproved=true;return render(activeSession,true)}
 if(a==="pause")return pause();
 if(a==="resumeTime")return resumeTime();
 if(a==="openGuide")return openGuide();
 if(a==="closeGuide")return closeGuide();
 if(a==="unlockGuide")return unlockGuide();
 if(a==="continue")return goNext();
 if(a==="finishRest")return restNext();
 if(a==="studyStep")return chooseStep(Number(b.dataset.step));
 if(a==="nextStudy")return goNext();
 if(a==="downloadPng"||a==="printBadge")return drawBadge(session(activeSession),runOf(activeSession),a==="printBadge")
});
root.addEventListener("submit",e=>{if(e.target.id==="lj-stage-form"){e.preventDefault();submitStage()}
 if(e.target.id==="lj-overtime-form"){e.preventDefault();extend()}});
root.addEventListener("input",e=>{if(e.target.closest("#lj-stage-form"))collectDraft();
 if(e.target.id==="lj-extension-min"){const n=toNumber(e.target.value),cost=overtimeCost(n);root.querySelector("#lj-extension-preview").textContent=cost===null?"عدد صحیح بین ۱ تا ۶۰ دقیقه وارد کنید.":fa(n)+" دقیقه · کسر "+fa(cost)+" امتیاز · مجموع کسر زمان: "+fa(penalty(runOf(activeSession)).overtime+cost)}});
root.addEventListener("change",e=>{if(e.target.closest("#lj-stage-form"))collectDraft();
 if(e.target.name==="self"){const n=Number(e.target.value),form=e.target.closest("form");let msg=form.querySelector(".lj-self-feedback");if(!msg){msg=document.createElement("p");msg.className="lj-self-feedback";form.querySelector(".lj-self").after(msg)}msg.textContent=selfCopy(n)}});
g.addEventListener("keydown",e=>{if(e.key==="Escape"&&guideVisible)closeGuide()});
g.SabaLearningJourney={render,score,badge,left,overtimeCost,history,getStore:()=>store,readRun:id=>runOf(id)};
setInterval(tick,1000);
const match=g.location.hash.match(/^#\/journey\/([1-9])(?:\/|$)/);if(match)render(Number(match[1]));
})(globalThis);
