/* Saba Naft — approved Chapter 5 H08 personal development and H07 upward alignment.
   Self-directed practice; not psychometric testing, AI coaching or HR appraisal. */
(function(){
'use strict';
var roles={
 B:{name:'Boss',label:'شفاف‌کردن تصمیم و مسئولیت',question:'آیا معیار، تصمیم، زمان‌بندی و صاحب مسئولیت را روشن کرده‌ام؟',exercise:'در ۹۰ ثانیه تصمیم، انتظار رفتاری، حد اختیار و زمان مرور را با صدای بلند بیان کنید.'},
 C:{name:'Coach',label:'پرسش و مسئولیت‌پذیری',question:'آیا به‌جای جواب فوری، پرسشی باز پرسیده و واقعاً گوش داده‌ام؟',exercise:'سه سؤال باز بپرسید، پاسخ فرد را بازتاب دهید و اجازه دهید اقدام بعدی را خودش پیشنهاد کند.'},
 P:{name:'Partner',label:'هم‌فکری و تصمیم مشترک',question:'آیا دیدگاه طرف مقابل واقعاً در تصمیم اثر داشته است؟',exercise:'در یک اختلاف کاری، دو دیدگاه را خلاصه و یک تصمیم مشترک با مسئول روشن ثبت کنید.'},
 E:{name:'Enabler',label:'رفع مانع و ایجاد ظرفیت',question:'کدام مانع یا کمبود منبع را بدون گرفتن مالکیت کار از فرد برطرف می‌کنم؟',exercise:'یک مانع ساختاری یا دانشی را شناسایی کنید و برای رفع آن یک اقدام کوچک مشخص کنید.'}
};
function clean(v,n){return typeof v==='string'?v.trim().slice(0,n||900):'';}
function esc(v){return String(v==null?'':v).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});}
function fresh(){return {levels:{B:'',C:'',P:'',E:''},evidence:{B:'',C:'',P:'',E:''},focus:'',caseId:'',goal:'',microAction:'',due:'',superiorExpectations:'',authorityLimit:'',supportRequest:'',reviews:[]};}
function restore(s,raw){
 var x=raw&&raw.development,d=fresh();
 if(x&&typeof x==='object'){
  Object.keys(roles).forEach(function(k){d.levels[k]=['1','2','3','4'].includes(String(x.levels&&x.levels[k]))?String(x.levels[k]):'';d.evidence[k]=clean(x.evidence&&x.evidence[k],600);});
  d.focus=roles[x.focus]?x.focus:'';d.caseId=clean(x.caseId,55);
  ['goal','microAction','superiorExpectations','authorityLimit','supportRequest'].forEach(function(k){d[k]=clean(x[k],900);});
  d.due=clean(x.due,20);
  if(Array.isArray(x.reviews))d.reviews=x.reviews.slice(-60).filter(function(r){return r&&typeof r==='object';}).map(function(r){return {date:clean(r.date,30),caseId:clean(r.caseId,55),action:clean(r.action,800),evidence:clean(r.evidence,800),learning:clean(r.learning,800)};});
 }
 s.development=d;
}
function bridge(){return window.SabanaftLeadershipStudio&&window.SabanaftLeadershipStudio.developmentBridge;}
function entry(){return '<section class="card" style="margin-top:14px"><span class="kicker">توسعه رهبری در عمل</span><h2>برنامه توسعه مهارت چهار نقش</h2><p class="muted">نقش غالب الزاماً مهارت بیشتر نیست. شواهد رفتاری را مرور کنید، یک نقش برای توسعه انتخاب کنید و تمرین را در کار واقعی پیگیری کنید.</p><button type="button" class="btn" data-ux-go="development">برنامه توسعه فردی من ←</button></section>';}
function field(k,label,value,hint){
 return '<div class="field"><label for="dev-'+k+'">'+esc(label)+'</label><textarea id="dev-'+k+'" maxlength="900" rows="2" placeholder="'+esc(hint)+'">'+esc(value)+'</textarea></div>';
}
function page(s){
 var d=s.development||fresh(),focus=roles[d.focus],reviews=d.reviews||[],cases=Array.isArray(s.cases)?s.cases:[];
 var skill=Object.keys(roles).map(function(k){var r=roles[k],v=d.levels[k];return '<div class="dimension"><h3>'+esc(r.name)+' · '+esc(r.label)+'</h3><p>'+esc(r.question)+'</p><div class="form-grid"><div class="field"><label for="dev-level-'+k+'">ارزیابی اولیه خودم (اختیاری)</label><select id="dev-level-'+k+'"><option value="">هنوز نمی‌دانم</option>'+
 [['1','نیازمند تمرین بیشتر'],['2','در حال توسعه'],['3','توانمند در موقعیت‌های آشنا'],['4','شواهد تکرارشونده در موقعیت‌های مختلف']].map(function(o){return '<option value="'+o[0]+'" '+(v===o[0]?'selected':'')+'>'+o[1]+'</option>';}).join('')+
 '</select></div><div class="field"><label for="dev-evidence-'+k+'">شاهد رفتار واقعی یا بازخورد</label><textarea id="dev-evidence-'+k+'" rows="2" maxlength="600" placeholder="رفتار مشاهده‌شده، نه فقط تصور من">'+esc(d.evidence[k])+'</textarea></div></div></div>';}).join('');
 var selected=focus?'<div class="note"><strong>تمرین پیشنهادی '+esc(focus.name)+':</strong> '+esc(focus.exercise)+'</div>':'<div class="note">یک نقش را برای تمرین انتخاب کنید؛ کمتر غالب بودن یک نقش، به‌تنهایی نشانه ضعف در آن نیست.</div>';
 return '<h1 class="page-title">برنامه توسعه فردی رهبری من</h1><p class="intro">یک چرخه ساده: شواهد → هدف → تمرین → اقدام واقعی → بازاندیشی و بازبینی.</p>'+
 '<div class="note">این ابزار خودارزیابی و تمرین شخصی است، نه آزمون معتبر، امتیازدهی سازمانی یا تشخیص خودکار. اطلاعات فقط در مرورگر همین دستگاه ذخیره می‌شود؛ از واردکردن اطلاعات محرمانه اشخاص خودداری کنید.</div>'+
 '<form id="role-development-form"><section class="card"><h2>۱. توانمندی من در چهار نقش</h2><p class="muted">ارزیابی اختیاری است و فقط با شواهد و بازخورد واقعی معنا پیدا می‌کند.</p>'+skill+'</section>'+
 '<section class="card" style="margin-top:16px"><h2>۲. هدف و برنامه تمرین من</h2><div class="field"><label for="dev-focus">نقش هدف</label><select id="dev-focus"><option value="">هنوز انتخاب نکرده‌ام</option>'+
 Object.keys(roles).map(function(k){return '<option value="'+k+'" '+(d.focus===k?'selected':'')+'>'+roles[k].name+' · '+esc(roles[k].label)+'</option>';}).join('')+
 '</select></div>'+(cases.length?'<div class="field"><label for="dev-case">کیس واقعی مرتبط با برنامه توسعه (اختیاری)</label><select id="dev-case"><option value="">بدون کیس مرتبط</option>'+cases.map(function(c){return '<option value="'+esc(c.id)+'" '+(d.caseId===c.id?'selected':'')+'>'+esc(c.title||'موقعیت بدون عنوان')+'</option>';}).join('')+'</select></div>':'')+field('goal','رفتار مشخصی که می‌خواهم بهتر انجام دهم',d.goal,'مثلاً به جای دستور فوری، دو سؤال باز بپرسم')+
 field('microAction','یک اقدام کوچک در محیط واقعی کار',d.microAction,'در کدام گفت‌وگوی واقعی، با چه کسی و چگونه تمرین می‌کنم؟')+
 '<div class="field"><label for="dev-due">زمان مرور برنامه (اختیاری)</label><input type="date" id="dev-due" value="'+esc(d.due)+'"></div>'+selected+
 '<div class="form-actions"><button class="btn" type="submit">ذخیره برنامه توسعه من</button><button class="btn light" type="button" data-go="roleplay">تمرین گفت‌وگو</button><button class="btn light" type="button" data-dev-reflect="true">بازاندیشی درباره تمرین</button></div></section>'+
 '<section class="card" style="margin-top:16px"><h2>۳. رابطه با مافوق و حدود اختیار</h2><p class="muted">بر اساس فرضیه هفتم: محدودیت واقعی را از برداشت خودم جدا کنم و راه گفت‌وگو یا درخواست حمایت را بررسی کنم.</p>'+
 field('superiorExpectations','انتظارات مافوق از نقش من',d.superiorExpectations,'چه چیزی را صریحاً می‌دانم و چه چیزی هنوز فرض من است؟')+
 field('authorityLimit','حدود اختیار و محدودیت‌های واقعی یا ادراک‌شده',d.authorityLimit,'کدام تصمیم نیازمند تأیید بالادست است؟')+
 field('supportRequest','گفت‌وگو یا حمایت موردنیاز',d.supportRequest,'برای روشن‌کردن اختیار یا دریافت حمایت چه درخواستی دارم؟')+
 '<button class="btn light" type="submit">ثبت و به‌روزرسانی</button></section></form>'+
 '<section class="card" style="margin-top:16px"><h2>۴. مرور تجربه و پیشرفت</h2><p class="muted">پیشرفت با اقدام و شواهد واقعی سنجیده می‌شود، نه تعداد کلیک یا نمره خوداظهاری.</p>'+
 '<form id="role-development-review">'+field('review-action','چه تمرینی را واقعاً اجرا کردم؟','','اقدام انجام‌شده و موقعیت')+
 field('review-evidence','چه شواهد یا بازخوردی دیدم؟','','شواهد مشاهده‌شده؛ اگر هنوز ندارم، همین را بنویسم')+
 field('review-learning','چه آموختم و دفعه بعد چه تغییری می‌دهم؟','','یک تصمیم یا تمرین بعدی')+
 '<button class="btn" type="submit">ثبت مرور واقعی</button></form>'+
 (reviews.length?'<h3>مرورهای ثبت‌شده ('+reviews.length+')</h3><ol>'+reviews.slice(-6).reverse().map(function(r){return '<li><strong>'+esc(r.date)+'</strong> '+(r.caseId&&cases.some(function(c){return c.id===r.caseId;})?'· کیس مرتبط: '+esc(cases.find(function(c){return c.id===r.caseId;}).title||'موقعیت'):'')+' — '+esc(r.action)+'<p class="small">شاهد: '+esc(r.evidence||'ثبت نشده')+' | آموخته: '+esc(r.learning||'ثبت نشده')+'</p></li>';}).join('')+'</ol>':'<p class="note">هنوز هیچ اقدام واقعی ثبت نشده است.</p>')+
 '</section><section class="card" style="margin-top:16px"><h2>۵. همراهی کوچ</h2><p>می‌توانید تمرین را با Role Play موجود انجام دهید یا برای جلسه Human Coaching درخواست بدهید. رزرو خودکار و AI Coach متصل در این نسخه فعال نیستند.</p>'+
 '<a class="btn light" id="dev-human" href="mailto:hasanboudlaie@ut.ac.ir?subject=%D8%AF%D8%B1%D8%AE%D9%88%D8%A7%D8%B3%D8%AA%20%DA%A9%D9%88%DA%86%DB%8C%D9%86%DA%AF%20%D8%B1%D9%87%D8%A8%D8%B1%DB%8C">درخواست جلسه کوچ انسانی (ایمیل) ↗</a>'+
 '<p class="small">این لینک فقط پیش‌نویس ایمیل را باز می‌کند؛ اطلاعات خصوصی برنامه یا کیس به‌طور خودکار ارسال نمی‌شود.</p></section>';
}
function handle(e){
 var f=e.target;if(!f||!['role-development-form','role-development-review'].includes(f.id))return;
 e.preventDefault();e.stopImmediatePropagation();
 var b=bridge();if(!b)return;var s=b.state();if(!s)return;var old=JSON.parse(JSON.stringify(s.development||fresh())),d=s.development||fresh();
 if(f.id==='role-development-form'){
  Object.keys(roles).forEach(function(k){var level=document.getElementById('dev-level-'+k).value;d.levels[k]=['1','2','3','4'].includes(level)?level:'';d.evidence[k]=clean(document.getElementById('dev-evidence-'+k).value,600);});
  var fc=document.getElementById('dev-focus').value;d.focus=roles[fc]?fc:'';
  ['goal','microAction','superiorExpectations','authorityLimit','supportRequest'].forEach(function(k){d[k]=clean(document.getElementById('dev-'+k).value,900);});
  d.due=clean(document.getElementById('dev-due').value,20);var linked=document.getElementById('dev-case');d.caseId=linked&&s.cases&&s.cases.some(function(c){return c.id===linked.value;})?linked.value:'';
 }else{
  var a=clean(document.getElementById('dev-review-action').value,800);
  if(a.length<8){b.toast('برای ثبت مرور، اقدام واقعی انجام‌شده را روشن‌تر بنویسید.');return;}
  d.reviews.push({date:new Date().toLocaleDateString('fa-IR'),caseId:d.caseId||'',action:a,evidence:clean(document.getElementById('dev-review-evidence').value,800),learning:clean(document.getElementById('dev-review-learning').value,800)});
  if(d.reviews.length>60)d.reviews=d.reviews.slice(-60);
 }
 s.development=d;
 if(!b.save()){s.development=old;b.toast('ذخیره انجام نشد؛ متن فرم را نگه دارید یا در حافظه دیگری کپی کنید.');return;}
 b.toast('تغییرات برنامه توسعه ذخیره شد.');b.render();
}
document.addEventListener('submit',handle,true);
document.addEventListener('click',function(e){
 var t=e.target.closest('[data-dev-reflect]');if(!t)return;
 var b=bridge();if(!b)return;
 var s=b.state(),d=s.development||fresh(),caseId=d.caseId;
 if(!caseId||!s.cases||!s.cases.some(function(c){return c.id===caseId;})){b.go('daily');return;}
 var old=JSON.parse(JSON.stringify(s.guidedDialogue||{}));
 if(s.guidedDialogue&&s.guidedDialogue.stage>0&&!window.confirm('پیش‌نویس بازاندیشی فعلی با گفت‌وگوی تازه جایگزین شود؟'))return;
 if(!window.SabaGuidedReflection){b.go('daily');return;}
 s.guidedDialogue=window.SabaGuidedReflection.fresh();s.guidedDialogue.caseId=caseId;
 if(!b.save()){s.guidedDialogue=old;b.toast('انتقال کیس به بازاندیشی ذخیره نشد.');return;}
 b.go('daily');
});

window.SabaRoleDevelopment={fresh:fresh,restore:restore,page:page,entry:entry};
})();
