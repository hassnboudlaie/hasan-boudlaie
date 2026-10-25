/* Commercial UX pilot — simplified case-first experience. No AI, payments, backend or tenant reports. */
(function(){
'use strict';
var roleInfo={B:{en:'Boss',label:'تصمیم و شفاف‌سازی',say:'«انتظار و مسئولیت را روشن می‌کنم؛ درباره مانع‌های اجرایی دقیق صحبت کنیم.»'},C:{en:'Coach',label:'پرسش و خودتنظیمی',say:'«به نظر خودت مسئله اصلی چیست و چه گزینه‌هایی داری؟»'},P:{en:'Partner',label:'گفت‌وگوی مشترک',say:'«بیایید صورت مسئله و گزینه‌ها را با هم روشن کنیم.»'},E:{en:'Enabler',label:'فراهم‌کردن شرایط',say:'«چه مانع یا کمبود منابعی اجازه نمی‌دهد کار پیش برود؟»'}};
var actors={experienced:{label:'همکار باتجربه',first:'من این مسیر را قبلاً تجربه کرده‌ام، اما شرایط فعلی پیچیده‌تر است.',react:'ترجیح می‌دهم در تصمیم از تجربه‌ام استفاده شود.'},overloaded:{label:'سرپرست پرفشار',first:'حجم کار بالاست و نمی‌دانم کدام کار را باید اول انجام بدهم.',react:'اگر اولویت و ظرفیت روشن شود، بهتر می‌توانم جلو بروم.'},new:{label:'همکار تازه‌کار',first:'فکر می‌کنم مسئله را متوجه شده‌ام اما هنوز در تصمیم‌گیری مطمئن نیستم.',react:'یک معیار روشن و فرصت تمرین کمکم می‌کند.'},challenging:{label:'همکار منتقد',first:'احساس می‌کنم تصمیم بدون شنیدن دیدگاه ما گرفته می‌شود.',react:'برایم مهم است دلیل انتخاب و سهم واقعی خودم روشن باشد.'}};
function esc(v){return String(v===undefined||v===null?'':v).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});}
function clean(v,max){return typeof v==='string'?v.slice(0,max||4000):'';}
function get(){return window.SabanaftLeadershipStudio&&window.SabanaftLeadershipStudio.commercialBridge;}
function state(){return get()&&get().state();}
function save(){return get()&&get().save();}
function render(){return get()&&get().render();}
function go(p){return get()&&get().go(p);}
function note(s){return get()&&get().toast(s);}
function openCase(id){return get()&&get().openCase(id);}
var recognizer=null,live=false;
function formattedDate(x){try{return new Intl.DateTimeFormat('fa-IR',{day:'numeric',month:'short',year:'numeric'}).format(new Date(x));}catch(e){return '';}}
function initialSimulation(){return {caseId:'',persona:'overloaded',role:'C',round:0,lines:[],reflection:''};}
function restore(s,x){s.quickDraft=clean(x&&x.quickDraft,3500);s.quickInputMode=x&&x.quickInputMode==='voice'?'voice':'text';s.simulation=initialSimulation();if(x&&x.simulation&&typeof x.simulation==='object'){var a=x.simulation;s.simulation.caseId=clean(a.caseId,48);s.simulation.persona=actors[a.persona]?a.persona:'overloaded';s.simulation.role=roleInfo[a.role]?a.role:'C';s.simulation.round=Math.max(0,Math.min(2,Number(a.round)||0));s.simulation.lines=Array.isArray(a.lines)?a.lines.slice(-4).map(function(z){return {manager:clean(z.manager,500),reply:clean(z.reply,450)};}):[];s.simulation.reflection=clean(a.reflection,850);}
s.simulationHistory=Array.isArray(x&&x.simulationHistory)?x.simulationHistory.filter(function(z){return z&&typeof z.id==='string';}).map(function(z){return {id:clean(z.id,45),date:clean(z.date,45),caseId:clean(z.caseId,48),role:roleInfo[z.role]?z.role:'C',persona:actors[z.persona]?z.persona:'overloaded',reflection:clean(z.reflection,850)};}):[];}

/* Simple process states; never a performance or psychological score. */
function caseStatus(s,c){
  var day=new Date();var today=[day.getFullYear(),String(day.getMonth()+1).padStart(2,'0'),String(day.getDate()).padStart(2,'0')].join('-');
  var old=(s.reflections||[]).some(function(r){return r.caseId===c.id&&!!(r.actual||'').trim()&&!!(r.observed||'').trim();});
  var recent=(s.daily&&s.daily.items||[]).some(function(r){return r.caseId===c.id&&r.source!=='none'&&!!(r.outcome||'').trim();});
  if(old||recent)return 'reviewed';
  if(c.decision&&(!c.action||(c.reviewDate&&c.reviewDate<=today)))return 'attention';
  if(c.decision||c.action)return 'progress';
  return 'unstarted';
}
function statusLabel(key){return {reviewed:'مرور شده',attention:'نیازمند توجه',progress:'در حال اقدام',unstarted:'در انتظار تصمیم'}[key]||'نامشخص';}
function focus(s){
 var cases=s.cases||[];if(!cases.length)return null;
 var weight={attention:0,progress:1,unstarted:2,reviewed:3};
 var cs=cases.map(function(c,i){return {c:c,kind:caseStatus(s,c),i:i};});
 cs.sort(function(a,b){return weight[a.kind]-weight[b.kind]||a.i-b.i;});
 return cs[0];
}
function home(s){
 var f=focus(s),p=s.profile||{},name=clean((p.name||'').trim().split(/\s+/)[0],45);
 var draft=s.quickDraft||'',dimensions=Object.values((s.context&&s.context.dimensions)||{}).filter(function(x){return x&&x.value;}).length;
 var todayCount=s.daily&&Array.isArray(s.daily.items)?s.daily.items.length:0;
 var c=f&&f.c,kind=f&&f.kind,actionable=c&&(kind==='attention'||kind==='progress')&&!!c.action;
 var actionText=c?(kind==='reviewed'?'دیدن یادگیری':actionable?'مرور نتیجه':'ادامه تصمیم'):'شناخت رهبری من';
 var actionAttr=c?(kind==='reviewed'?'data-ux-go="daily"':actionable?'data-ux-checkin="'+esc(c.id)+'"':'data-ux-open="'+esc(c.id)+'"'):'data-ux-go="profile"';
 return '<div class="up-home ed-home">'
 +'<section class="ed-hero" aria-label="شروع از یک مسئله واقعی">'
 +'<div class="ed-hero-ornament" aria-hidden="true"><span class="ed-ring ed-ring-one"></span><span class="ed-ring ed-ring-two"></span><span class="ed-orb"></span></div>'
 +'<div class="ed-hero-head"><span class="ed-supra">SABA NAFT <span aria-hidden="true">/</span> REFLECTIVE LEADERSHIP</span><span class="ed-hero-mark" aria-hidden="true">✳</span></div>'
 +'<div class="ed-hero-content"><div class="ed-pretitle">فضای شخصی رهبری بازاندیشانه</div>'
 +'<h1>'+(name?'<span class="ed-greet">سلام '+esc(name)+'،</span>':'')+'امروز چه مسئله‌ای <span>پیش روی شماست؟</span></h1>'
 +'<p>از یک موقعیت واقعی شروع کنید؛ به تصمیمی روشن‌تر، گفت‌وگویی بهتر و یادگیری عملی برسید.</p></div>'
 +'<div class="ed-compose"><div class="ed-compose-head"><span class="ed-compose-index">01</span><div><h2>مسئله‌تان را مطرح کنید</h2><p>بنویسید یا بگویید؛ نیازی به پرکردن فرم طولانی نیست.</p></div></div>'
 +'<label for="ux-quick-case" class="ed-label">چه اتفاقی افتاده است؟</label>'
 +'<textarea id="ux-quick-case" rows="4" maxlength="3500" placeholder="مثلاً یکی از اعضای تیم مسئولیت جدیدی را نمی‌پذیرد و نمی‌دانم گفت‌وگو را چگونه شروع کنم.">'+esc(draft)+'</textarea>'
 +'<div class="ed-compose-actions"><div class="ed-compose-voice"><button type="button" class="ed-voice-button" data-ux-voice aria-pressed="false"><span aria-hidden="true">◉</span> گفتن مسئله</button><span id="ux-voice-status" class="ed-voice-status" role="status">متن قابل ویرایش است</span></div>'
 +'<button type="button" class="ed-submit-button" data-ux-submit-case>بررسی مسئله <span aria-hidden="true">←</span></button></div></div>'
 +'</section>'
 +'<div class="up-privacy-line ed-privacy"><span aria-hidden="true">◇</span> نسخه آزمایشی با ذخیره‌سازی در همین مرورگر؛ اطلاعات محرمانه وارد نکنید. تبدیل گفتار ممکن است از سرویس بیرونی استفاده کند.</div>'
 +'<div class="ed-section-title"><div><span>YOUR NEXT STEP</span><h2>ادامه مسیر من</h2></div><span class="ed-section-rule" aria-hidden="true"></span></div>'
 +'<div class="ed-journey">'
 +'<article class="ed-journey-item ed-journey-focus"><span class="ed-journey-number">01</span><div class="ed-journey-content"><span class="ed-kicker">'+(c?'تمرکز فعلی من':'شروع مسیر شخصی')+'</span>'
 +'<h3>'+esc(c?c.title:'شناخت ایده رهبری من')+'</h3><p>'+esc(c?(c.action||'هنوز اقدام مشخصی ثبت نشده'):'ایده رهبری و بافت خود را به‌تدریج بشناسید.')+'</p>'
 +(c?'<span class="ed-progress-state '+kind+'">'+statusLabel(kind)+'</span>':'')+'</div>'
 +'<button type="button" class="ed-journey-action" '+actionAttr+' aria-label="'+esc(actionText+(c?' برای '+c.title:''))+'">'+actionText+' <span aria-hidden="true">←</span></button></article>'
 +'<button type="button" class="ed-journey-item ed-journey-reflect" data-ux-go="daily"><span class="ed-journey-number">02</span><span class="ed-journey-content"><span class="ed-kicker">MY REFLECTION</span><strong>سه دقیقه برای بازاندیشی</strong><small>'+(todayCount?'ادامه یادگیری از تجربه امروز':'یک اتفاق کوچک امروز کافی است')+'</small></span><span class="ed-journey-arrow" aria-hidden="true">←</span></button>'
 +'</div>'
 +'<div class="ed-footlinks"><span>Context من: '+dimensions+' از ۱۸ بُعد</span><button type="button" data-ux-go="mix">ایده رهبری من</button><button type="button" data-ux-go="coach">کوچ و منتور</button></div>'
 +'</div>';
}
function select(id,label,opts,v){return '<div class="field"><label for="'+id+'">'+label+'</label><select id="'+id+'" data-ux-select="'+id+'">'+opts.map(function(o){return '<option value="'+o[0]+'" '+(o[0]===v?'selected':'')+'>'+o[1]+'</option>';}).join('')+'</select></div>';}
function simulation(s){var cases=s.cases||[],sim=s.simulation||initialSimulation(),c=cases.find(function(x){return x.id===sim.caseId;})||cases[0],persona=actors[sim.persona]||actors.overloaded;
if(!c)return '<h1 class="page-title">تمرین گفت‌وگو · Role Play</h1><div class="card ux-empty"><b>برای شروع تمرین، ابتدا یک کیس ثبت کنید.</b><p>شخصیت گفت‌وگو براساس مسئله انتخاب می‌شود؛ در این پایلوت پاسخ‌ها از سناریوهای از پیش نوشته‌شده‌اند.</p><button type="button" class="btn" data-ux-go="home">ثبت مسئله</button></div>';
return '<h1 class="page-title">آزمایشگاه گفت‌وگو</h1><p class="intro">یک گفت‌وگوی دشوار را بدون ریسک واقعی تمرین کنید. این بخش یک شبیه‌سازی قاعده‌مند آزمایشی است، نه AI Role Play و نه ارزیابی توان رهبری.</p>'+
'<div class="grid"><section class="span8 card ux-sim"><div class="ux-sim-settings">'+select('ux-sim-case','کیس تمرین',cases.map(function(a){return [a.id,a.title]}),sim.caseId||c.id)+select('ux-sim-persona','شخصیت مقابل',Object.keys(actors).map(function(k){return [k,actors[k].label];}),sim.persona)+select('ux-sim-role','نقش مورد تمرین',Object.keys(roleInfo).map(function(k){return [k,roleInfo[k].en+' · '+roleInfo[k].label];}),sim.role)+'</div><div class="ux-dialogue"><div class="ux-bubble ux-counterpart"><small>'+persona.label+'</small><p>'+esc(persona.first)+'</p></div>'+sim.lines.map(function(l){return '<div class="ux-bubble ux-me"><small>من، مدیر</small><p>'+esc(l.manager)+'</p></div><div class="ux-bubble ux-counterpart"><small>'+persona.label+'</small><p>'+esc(l.reply)+'</p></div>';}).join('')+'</div>'+
(sim.round<2?'<form id="ux-roleplay-form"><div class="field"><label for="ux-sim-response">اگر روبه‌روی این فرد بودید، دقیقاً چه می‌گفتید؟</label><textarea id="ux-sim-response" rows="3" maxlength="500" placeholder="جمله خودتان را در نقش '+roleInfo[sim.role].en+' بنویسید..."></textarea></div><div class="ux-example"><span>برای الهام:</span> '+esc(roleInfo[sim.role].say)+'</div><button type="submit" class="btn">ارسال پاسخ و دیدن واکنش ←</button></form>':'<div class="ux-sim-finish"><h3>گفت‌وگو به پایان رسید</h3><p>کدام بخش از نقش انتخاب‌شده را به‌خوبی اجرا کردید؟ چه چیزی را دفعه بعد تغییر می‌دهید؟ پاسخ‌های شخصیت در این پایلوت از پیش نوشته‌شده‌اند و متن شما را به‌صورت معنایی تحلیل نمی‌کنند.</p><div class="field"><label for="ux-sim-reflection">Self-feedback</label><textarea id="ux-sim-reflection" maxlength="850" rows="3" placeholder="یک نقطه قوت و یک بهبود مشخص">'+esc(sim.reflection||'')+'</textarea></div><div class="form-actions"><button type="button" class="btn" data-ux-save-sim>ثبت تمرین و بازاندیشی</button><button type="button" class="btn light" data-ux-restart>تکرار تمرین</button></div></div>')+'</section>'+
'<aside class="span4 card ux-sim-side"><span class="ux-eyebrow">ROLE-BASED PRACTICE</span><h2>چه چیزی را تمرین می‌کنید؟</h2><p>در این سناریو می‌توانید بین چهار نقش جابه‌جا شوید و ببینید چه نوع گفت‌وگویی ایجاد می‌شود.</p><div class="ux-reflect-prompt"><b>'+roleInfo[sim.role].en+'</b><p>'+roleInfo[sim.role].label+'</p></div><p class="small">به‌جای امتیاز درست/غلط، درباره مسئولیت تصمیم، قابلیت فرد مقابل، احترام متقابل و انطباق نقش با Context تأمل کنید.</p><div class="note">برای نسخه تجاری: شبیه‌ساز گفت‌وگوی طبیعی با AI، رضایت آگاهانه و درگاه محافظت‌شده به سیستم افزوده می‌شود.</div></aside></div>';
}
function insights(s){var cases=s.cases||[],daily=s.daily&&s.daily.items||[],rehearsals=s.simulationHistory||[];
var decided=cases.filter(function(c){return !!c.decision;}).length,action=cases.filter(function(c){return !!c.action;}).length,followed=cases.filter(function(c){return (s.reflections||[]).some(function(r){return r.caseId===c.id;})||daily.some(function(r){return r.caseId===c.id&&!!r.outcome;});}).length;
function ratio(n,d){return d?Math.round(n*100/d)+'٪':'—';}
function row(label,n,d,desc){return '<div class="ux-metric-row"><div class="title-row"><strong>'+label+'</strong><span class="pill">'+n+' / '+d+' ('+ratio(n,d)+')</span></div><div class="progress"><span style="width:'+(d?Math.min(100,n*100/d):0)+'%"></span></div><p class="small">'+desc+'</p></div>';}
return '<h1 class="page-title">گزارش ارزش استفاده · My Impact</h1><p class="intro">آنچه اکنون می‌توان سنجید، میزان استفاده و کیفیت مستندسازی فرایند تصمیم‌گیری است؛ نه اثبات افزایش بهره‌وری یا عملکرد شغلی.</p><div class="grid">'+
'<div class="span3 card metric"><div><strong>'+cases.length+'</strong><p>کیس‌های ثبت‌شده</p></div><span class="cube">◇</span></div><div class="span3 card metric"><div><strong>'+decided+'</strong><p>تصمیم مستند</p></div><span class="cube">↗</span></div><div class="span3 card metric"><div><strong>'+daily.length+'</strong><p>بازاندیشی روزانه</p></div><span class="cube">◷</span></div><div class="span3 card metric"><div><strong>'+rehearsals.length+'</strong><p>تمرین گفت‌وگو</p></div><span class="cube">♧</span></div>'+
'<section class="span7 card"><h2>Decision Process Indicators</h2>'+row('ثبت تصمیم و منطق آن',decided,cases.length,'از کل کیس‌هایی که ثبت کرده‌اید، چند مورد تصمیم مکتوب دارند؟')+row('گام اجرایی مشخص',action,cases.length,'چند کیس دارای Next Best Step ثبت‌شده هستند؟')+row('بازگشت به نتیجه و شواهد',followed,cases.length,'چند کیس به دست‌کم یک بازاندیشی مرتبط و دارای نتیجه وصل شده‌اند؟')+window.SabaImpactPulse.render(s)+'<div class="warn">این شاخص‌ها Self-reported و Process Metrics هستند؛ نرخ بالاتر الزاماً به معنای تصمیم بهتر یا ROI بالاتر نیست.</div></section>'+
'<aside class="span5 card"><h2>ارزش برای سازمان چگونه سنجیده می‌شود؟</h2><p class="muted">گزارش سازمانی واقعی بعد از فراهم‌شدن حساب‌های سازمانی، مجوز دسترسی و داده‌های تجمیعی ایجاد می‌شود.</p><div class="ux-report-stack"><div><b>۱ · Adoption</b><span>کاربران فعال داوطلبانه / کاربران دارای مجوز</span></div><div><b>۲ · Engagement</b><span>بازگشت ماهانه و تداوم استفاده معنادار</span></div><div><b>۳ · Applied Learning</b><span>اقدامات ثبت‌شده و مرور نتیجه با منشأ شواهد</span></div><div><b>۴ · Perceived Value</b><span>ارزیابی ناشناس سودمندی از نگاه مدیران</span></div><div><b>۵ · Business Outcomes</b><span>فقط نتایج قابل انتساب و مبتنی بر داده واقعی</span></div></div><div class="note">هیچ گزارش فردی از متن کیس، چت کوچینگ یا بازاندیشی خصوصی، به‌صورت پیش‌فرض برای سازمان قابل دسترسی نیست.</div></aside></div>';
}
function coach(s){return '<h1 class="page-title">My Coach · راهنمای رهبری من</h1><p class="intro">مدیر می‌تواند در محصول تجاری میان بازاندیشی با AI، تمرین گفت‌وگو و کوچینگ یا منتورینگ انسانی انتخاب کند.</p>'+
'<div class="grid"><section class="span4 card ux-service"><div class="ux-tile-icon">✦</div><h2>AI Reflection Companion</h2><p>پرسش‌های بازاندیشانه، روشن‌کردن مسئله، بررسی فرض‌ها و طراحی گام بعدی با استفاده از داده‌های مجاز خود مدیر.</p><div class="note">در این نسخه AI فعال نیست و هیچ کیس یا یادداشتی به مدل ارسال نمی‌شود.</div><button type="button" class="btn light" data-ux-go="daily">بازاندیشی من</button></section>'+
'<section class="span4 card ux-service"><div class="ux-tile-icon">♧</div><h2>Role Play Simulator</h2><p>تمرین گفت‌وگو با شخصیت شبیه‌سازی‌شده قبل از اقدام واقعی.</p><button type="button" class="btn" data-ux-go="roleplay">شروع شبیه‌سازی آزمایشی</button></section>'+
'<section class="span4 card ux-service"><div class="ux-tile-icon">◉</div><h2>Human Coaching & Mentoring</h2><p>جلسات ۳۰ یا ۶۰ دقیقه‌ای، آنلاین یا حضوری؛ امکان انتخاب کوچ یا منتور و اشتراک‌گذاری خلاصه کیس با اجازه صریح مدیر.</p><div class="note">رزرو، پرداخت و ارسال درخواست هنوز فعال نشده‌اند. این قسمت مسیر محصول تجاری را نشان می‌دهد.</div></section></div>';}
function reply(sim){var p=actors[sim.persona]||actors.overloaded;
if(sim.role==='B')return sim.round===0?'متوجه شدم چه انتظاری دارید. می‌خواهم مطمئن شوم معیار و منابع انجام کار هم مشخص است.':'مسئولیت را می‌پذیرم، اما برای اجرا به هماهنگی با بخش مرتبط نیاز دارم.';
if(sim.role==='C')return sim.round===0?'فکر می‌کنم یک راه این باشد که ابتدا اولویت‌ها را مرتب کنم. می‌توانید به من کمک کنید معیار تصمیم را روشن کنم؟':'یک پیشنهاد عملی دارم؛ اگر محدودیت‌ها را روشن کنیم، مسئولیت اجرای آن را می‌پذیرم.';
if(sim.role==='P')return sim.round===0?'خوب است دیدگاه من هم در تصمیم شنیده شود. اختلاف ما بیشتر بر سر اولویت‌هاست.':'با این جمع‌بندی موافقم؛ بهتر است سهم مسئولیت هر طرف را مکتوب کنیم.';
return sim.round===0?'مانع اصلی دسترسی به اطلاعات و اختیار هماهنگی است. اگر روشن شود بهتر می‌توانم تصمیم بگیرم.':p.react;
}
document.addEventListener('input',function(e){var t=e.target,s=state();if(!s)return;if(t.id==='ux-quick-case'){s.quickDraft=clean(t.value,3500);save();}if(t.id==='ux-sim-reflection'){s.simulation.reflection=clean(t.value,850);save();}});
document.addEventListener('change',function(e){var t=e.target,s=state();if(!s||!t.dataset.uxSelect)return;var k=t.dataset.uxSelect,sim=s.simulation;if(k==='ux-sim-case')sim.caseId=t.value;if(k==='ux-sim-persona')sim.persona=actors[t.value]?t.value:'overloaded';if(k==='ux-sim-role')sim.role=roleInfo[t.value]?t.value:'C';sim.round=0;sim.lines=[];sim.reflection='';save();render();});
document.addEventListener('submit',function(e){if(e.target.id!=='ux-roleplay-form')return;e.preventDefault();var s=state(),sim=s&&s.simulation,t=document.getElementById('ux-sim-response');if(!sim||!t)return;var messageText=clean(t.value,500).trim();if(messageText.length<3){note('پاسخ خودتان را بنویسید.');return;}sim.lines.push({manager:messageText,reply:reply(sim)});sim.round=Math.min(2,sim.round+1);save();render();});
document.addEventListener('click',function(e){var t=e.target.closest('[data-ux-voice],[data-ux-submit-case],[data-ux-go],[data-ux-open],[data-ux-checkin],[data-ux-save-sim],[data-ux-restart]');if(!t)return;var s=state();if(!s)return;
if(t.dataset.uxGo){go(t.dataset.uxGo);return;}
if(t.dataset.uxOpen){openCase(t.dataset.uxOpen);return;}
if(t.dataset.uxCheckin){if(window.SabaLightFlow&&window.SabaLightFlow.openQuick){window.SabaLightFlow.openQuick(t.dataset.uxCheckin);}else note('مرور سریع در دسترس نیست.');return;}
if(t.hasAttribute('data-ux-submit-case')){var value=clean(s.quickDraft,3500).trim();if(value.length<12){note('لطفاً در یک یا دو جمله مسئله را روشن‌تر بنویسید.');return;}var c={id:'c'+Date.now().toString(36)+Math.random().toString(36).slice(2,6),title:clean(value.split(/[.؟!\n]/)[0]||value,82),situation:value,urgency:'unknown',risk:'unknown',authority:'unknown',capability:'unknown',dependencies:'unknown',createdAt:new Date().toISOString(),inputMode:s.quickInputMode==='voice'?'voice-reviewed':'text'};s.cases.unshift(c);s.quickDraft='';s.quickInputMode='text';if(!save()){s.cases.shift();s.quickDraft=value;s.quickInputMode=c.inputMode==='voice-reviewed'?'voice':'text';note('ذخیره ممکن نشد؛ از داده‌ها پشتیبان تهیه کنید.');return;}openCase(c.id);note('صورت مسئله ثبت شد. اکنون شرایط آن را بررسی کنید.');return;}
if(t.hasAttribute('data-ux-restart')){s.simulation.round=0;s.simulation.lines=[];s.simulation.reflection='';save();render();return;}
if(t.hasAttribute('data-ux-save-sim')){if(s.simulation.round<2){note('ابتدا دو مرحله تمرین را انجام دهید.');return;}if(!s.simulation.reflection.trim()){note('یک نکته یادگیری یا اصلاح رفتار ثبت کنید.');return;}var r={id:'sim'+Date.now().toString(36),date:new Date().toISOString(),caseId:s.simulation.caseId||(s.cases[0]&&s.cases[0].id)||'',role:s.simulation.role,persona:s.simulation.persona,reflection:s.simulation.reflection};s.simulationHistory.push(r);s.simulation=initialSimulation();if(!save()){s.simulationHistory.pop();note('ذخیره تمرین ممکن نشد.');return;}note('تمرین ثبت شد.');go('insights');return;}
if(t.hasAttribute('data-ux-voice')){if(live){if(recognizer)recognizer.stop();return;}var Recognition=window.SpeechRecognition||window.webkitSpeechRecognition;if(!Recognition){note('تشخیص گفتار در این مرورگر پشتیبانی نمی‌شود. می‌توانید با میکروفن صفحه‌کلید گوشی دیکته کنید.');return;}if(!window.confirm('این یک قابلیت آزمایشی مرورگر است. در برخی مرورگرها صدا برای تبدیل به متن به سرویس بیرونی ارسال می‌شود. از گفتن نام اشخاص و اطلاعات محرمانه خودداری کنید. ادامه می‌دهید؟'))return;
recognizer=new Recognition();recognizer.lang='fa-IR';recognizer.interimResults=false;recognizer.continuous=false;recognizer.maxAlternatives=1;
recognizer.onstart=function(){live=true;t.setAttribute('aria-pressed','true');t.textContent='■ توقف گفتار';var st=document.getElementById('ux-voice-status');if(st)st.textContent='در حال شنیدن…';};
recognizer.onresult=function(event){var text=Array.from(event.results).map(function(x){return x[0]&&x[0].transcript||'';}).join(' ').trim();if(text){s.quickDraft=clean((s.quickDraft?s.quickDraft+' ':'')+text,3500);s.quickInputMode='voice';save();var field=document.getElementById('ux-quick-case');if(field)field.value=s.quickDraft;}};
recognizer.onerror=function(event){note(event.error==='not-allowed'?'مجوز میکروفن داده نشد.':'تشخیص گفتار کامل نشد. می‌توانید متن را دستی وارد کنید.');};
recognizer.onend=function(){live=false;var b=document.querySelector('[data-ux-voice]');if(b){b.setAttribute('aria-pressed','false');b.textContent='🎙️ گفتن مسئله';}var st=document.getElementById('ux-voice-status');if(st)st.textContent='متن تولیدشده را بازبینی و اصلاح کنید';recognizer=null;};
try{recognizer.start();}catch(err){note('میکروفن در دسترس نیست. از تایپ استفاده کنید.');recognizer=null;}return;}
});
window.addEventListener('hashchange',function(){if(live&&recognizer)recognizer.stop();});
window.SabaCommercialUX={home:home,insights:insights,coach:coach,simulation:simulation,restore:restore,caseStatus:caseStatus,statusLabel:statusLabel,focus:focus};
})();