/* Saba Naft — case-first coaching journey.
   This is a rule-guided educational preview, NOT a language model.
   No network request is made and no content is shared without an explicit user action. */
(function(){
'use strict';
var byId=function(id){return document.getElementById(id);};
var esc=function(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});};
var KEY='sabanaft_case_handoff_v1', DRAFT='sabanaft_coaching_draft_v1';
var roles={
 B:{name:'Boss',label:'تصمیم و شفاف‌سازی',appropriate:'وقتی اختیار تصمیم، معیار یا مسئولیت باید روشن شود.',sample:'«این بخش از تصمیم بر عهده من است. معیار، مسئول اجرا و زمان مرور را روشن می‌کنیم.»',risk:'تصمیم گرفتن به جای فردی که اختیار لازم را دارد.'},
 C:{name:'Coach',label:'پرسش و خودتنظیمی',appropriate:'وقتی فرد فرصت و توان تحلیل دارد و مسئولیت را می‌تواند بپذیرد.',sample:'«به نظر شما مسئله اصلی چیست؟ چه گزینه‌هایی دارید و برای انتخابشان چه معیاری می‌گذارید؟»',risk:'پرسیدن سؤال در شرایطی که تصمیم فوری یا مرز اختیار نامشخص است.'},
 P:{name:'Partner',label:'حل مشترک',appropriate:'وقتی دیدگاه‌ها و وابستگی‌های بین واحدی باید به تصمیم مشترک تبدیل شوند.',sample:'«بیایید فرض‌ها و محدودیت‌های هر طرف را روی میز بگذاریم و به یک تصمیم مشترک برسیم.»',risk:'مبهم ماندن مسئول پاسخ‌گو بعد از تصمیم جمعی.'},
 E:{name:'Enabler',label:'فراهم‌کردن شرایط',appropriate:'وقتی مانع ساختاری، منابع یا توانمندی اجرایی بر سر راه است.',sample:'«کدام مانع باید برداشته شود تا بتوانید کار را با مسئولیت خودتان پیش ببرید؟»',risk:'برداشتن همه مسئولیت‌ها از دوش همکار به نام حمایت.'}
};
var issues={
 clarity:{lesson:'4/compare',first:'B',second:'C',look:'مرز اختیار، معیار تصمیم، پیامد اشتباه و این‌که چه کسی پاسخ‌گوست'},
 capability:{lesson:'4/roles',first:'E',second:'C',look:'فاصله مهارت، منابع واقعی، فرصت تمرین و اختیار فرد'},
 conflict:{lesson:'6/dialogue',first:'P',second:'B',look:'تعارض منافع، وابستگی دو واحد و مرز مسئولیت مشترک'},
 performance:{lesson:'8/performance',first:'C',second:'B',look:'معیار عملکرد، شواهد رفتار، توانایی، انگیزه و مجوز عمل'}
};
var labels={project:'پروژه و عملیات',team:'سرپرستی و تیم',headquarters:'ستاد و بین‌واحدی'};
var draft={text:'',context:'project',urgency:'normal',issue:'unknown'};
try{var p=JSON.parse(localStorage.getItem(DRAFT)||'null');if(p&&typeof p==='object'){draft.text=String(p.text||'').slice(0,2200);if(labels[p.context])draft.context=p.context;if(issues[p.issue]||p.issue==='unknown')draft.issue=p.issue;if(['normal','urgent','sensitive'].includes(p.urgency))draft.urgency=p.urgency;}}catch(e){}
function values(){return {text:byId('cj-situation').value.trim().slice(0,2200),context:byId('cj-context').value,urgency:byId('cj-urgency').value,issue:byId('cj-choice').value};}
function persist(){try{localStorage.setItem(DRAFT,JSON.stringify(values()));}catch(e){}}
function status(s){var el=byId('cj-output');el.hidden=false;el.textContent=s;}
function advice(v){
 var i=issues[v.issue]||{first:'B',second:'C',look:'بافت و مسئولیت تصمیم',lesson:'1/daily'};
 var selectedRoles=issues[v.issue]?[roles[i.first],roles[i.second]]:Object.values(roles);
 var sensitive=v.urgency==='sensitive',urgent=v.urgency==='urgent';
 var pre=sensitive?'این موضوع دارای ریسک حساس است. پیش از هر تصمیم، مسیرهای رسمی ایمنی، حقوقی یا منابع انسانی، اختیارات و الزامات سازمان را رعایت کنید؛ این راهنما جایگزین تصمیم مسئول مجاز نیست.':urgent?'فوریت را از فشار لحظه‌ای جدا کنید؛ مشخص کنید تا چه زمانی باید درباره چه چیزی تصمیم گرفته شود.':'ابتدا فرض‌ها و شواهد را روشن کنید؛ لازم نیست فوراً یک نقش را قطعی انتخاب کنید.';
 var context= v.context==='project'?'وابستگی‌های اجرا، پیمانکاران و تحویل کار':v.context==='team'?'توان تیم، اختیار سرپرست و تعهد افراد':'هماهنگی بین‌واحدی، پاسخ‌گویی و مسیر تصویب';
 var q=[
 'دقیقاً چه تصمیمی لازم است و چه کسی اختیار آن را دارد؟',
 'کدام بخش از روایت شما شاهد واقعی است و کدام بخش هنوز یک فرض است؟',
 'چه چیزی درباره '+context+' باید قبل از تصمیم روشن شود؟',
 'اگر یک همکار از زاویه دیگری نگاه کند، چه فرضی ممکن است تغییر کند؟'
 ];
 var warn='<div class="cj-result-disclaimer"><strong>محدوده راهنما:</strong> این پاسخ از یک چارچوب آموزشی ثابت ساخته شده و تحلیل AI نیست. انتخاب نقش «درست قطعی» وجود ندارد و مسئولیت تصمیم با مدیر است.</div>';
 return '<div class="cj-answer-head"><span>راهنمای اولیه آماده شد</span><h2>از تشخیص مسئله تا اقدام</h2><p>'+esc(pre)+'</p></div>'+
 '<div class="cj-answer-block"><h3>۱. پرسش‌های شفاف‌سازی</h3><ol>'+q.map(function(x){return '<li>'+esc(x)+'</li>';}).join('')+'</ol></div>'+
 '<div class="cj-answer-block"><h3>۲. '+(issues[v.issue]?'دو گزینه رفتاری قابل دفاع':'چهار نقش برای بررسی؛ بدون دسته‌بندی قطعی')+'</h3><div class="cj-roles">'+selectedRoles.map(function(r){return '<article><strong>'+esc(r.name)+' — '+esc(r.label)+'</strong><p>'+esc(r.appropriate)+'</p><blockquote>'+esc(r.sample)+'</blockquote><small>نقطه احتیاط: '+esc(r.risk)+'</small></article>';}).join('')+'</div><p>این گزینه‌ها، پاسخ قطعی نیستند. بافت ممکن است انتخاب یا ترکیب متفاوتی را توجیه کند.</p></div>'+
 '<div class="cj-answer-block"><h3>۳. اقدام و شواهد قابل مشاهده</h3><p>برای گفت‌وگوی بعدی، فقط یک اقدام مشخص تعیین کنید: با چه کسی، درباره کدام تصمیم، تا چه موعدی؟ سپس یک شاهد قابل مشاهده از نتیجه ثبت کنید. اگر نتیجه نامعلوم است، «نامعلوم» را ثبت کنید؛ موفقیت را فرض نکنید.</p></div>'+
 '<div class="cj-answer-actions"><button type="button" class="cj-secondary" data-cj-lesson="'+esc(i.lesson)+'">درس مرتبط کتاب ←</button><button type="button" class="cj-primary" id="cj-after-guide">ثبت و ادامه کیس در استودیو ←</button></div>'+warn;
}
function generate(){
 var v=values();if(v.text.length<12){status('لطفاً موقعیت را دست‌کم در یک جمله روشن توضیح دهید.');return;}
 persist();var node=byId('cj-output');node.hidden=false;node.innerHTML=advice(v);node.scrollIntoView({behavior:'smooth',block:'start'});
}
function handoff(){
 var v=values();if(v.text.length<12){status('ابتدا مسئله را در یک جمله توضیح دهید، سپس آن را در استودیو ادامه دهید.');return;}
 persist();
 try{localStorage.setItem(KEY,JSON.stringify({schema:1,text:v.text,context:v.context,issue:v.issue,createdAt:new Date().toISOString()}));}
 catch(e){status('ذخیره مرورگر در دسترس نیست. متن را کپی کنید و در استودیو وارد کنید.');return;}
 // The studio consumes this one-time handoff without changing the existing case schema.
 location.hash='/studio/home';
}
function makePrompt(){
 var v=values();if(v.text.length<12){status('برای ساخت پرسش ابتدا یک مسئله کوتاه بنویسید.');return;}
 var msg='برای بازاندیشی رهبری بر اساس کتاب The Reflective Leader نوشته Armin Trost، درباره این موقعیت فرضی و بدون داده محرمانه کمک کن. نقش‌های Boss, Coach, Partner و Enabler را بی‌طرفانه بررسی کن. اول ۴ سؤال شفاف‌کننده بپرس، سپس دو گزینه قابل دفاع با trade-off و جمله نمونه گفت‌وگو پیشنهاد بده؛ نقش قطعی تعیین نکن. اختیار قانونی، HSE، HR و شواهد را بررسی کن. برنامه اقدام قابل مشاهده و نحوه مرور نتیجه را هم پیشنهاد بده.\nبافت: '+(labels[v.context]||'')+'\nفوریت: '+(v.urgency==='normal'?'عادی':v.urgency==='urgent'?'زمان‌دار':'حساس')+'\nموضوع: '+v.text;
 // The user explicitly triggers copying, not transmission.
 var b=byId('cj-copy-ai');
 if(navigator.clipboard&&navigator.clipboard.writeText){
  navigator.clipboard.writeText(msg).then(function(){b.textContent='پرسش کپی شد ✓';}).catch(function(){fallbackCopy(msg);});
 }else fallbackCopy(msg);
}
function fallbackCopy(s){
 var t=document.createElement('textarea');t.value=s;document.body.appendChild(t);t.select();
 try{document.execCommand('copy');byId('cj-copy-ai').textContent='پرسش کپی شد ✓';}catch(e){status('مرورگر اجازه کپی خودکار نداد. متن را به‌صورت دستی کپی کنید.');}
 t.remove();
}
function humanLink(){
 var v=values(),body='سلام و احترام\nبرای یک جلسه کوچینگ/منتورینگ رهبری درخواست دارم.\nموضوع کلی: '+(labels[v.context]||'رهبری')+'\nترجیح می‌دهم زمان مناسب و نحوه برگزاری جلسه را هماهنگ کنیم.';
 if(byId('cj-share-summary').checked&&v.text){body+='\n\nخلاصه‌ای که خودم انتخاب کرده‌ام به اشتراک بگذارم:\n'+v.text.slice(0,400);}
 byId('cj-book-human').href='mailto:hasanboudlaie@ut.ac.ir?subject='+encodeURIComponent('درخواست جلسه کوچینگ و منتورینگ رهبری صبا نفت')+'&body='+encodeURIComponent(body);
}
function addVoice(){
 var Rec=window.SpeechRecognition||window.webkitSpeechRecognition;
 if(!Rec){var hint=document.createElement('p');hint.className='small';hint.textContent='تبدیل گفتار در این مرورگر پشتیبانی نمی‌شود؛ از میکروفن صفحه‌کلید یا تایپ استفاده کنید.';byId('cj-situation').insertAdjacentElement('afterend',hint);return;}
 var textarea=byId('cj-situation'),b=document.createElement('button');
 b.type='button';b.className='cj-voice';b.textContent='🎙️ گفتن مسئله';b.setAttribute('aria-pressed','false');textarea.insertAdjacentElement('afterend',b);
 var rec=null,live=false;
 b.addEventListener('click',function(){
  if(live&&rec){rec.stop();return;}
  if(!window.confirm('تبدیل گفتار ممکن است صدا را به سرویس بیرونی مرورگر ارسال کند. بدون اطلاعات محرمانه ادامه می‌دهید؟'))return;
  try{rec=new Rec();rec.lang='fa-IR';rec.interimResults=false;rec.maxAlternatives=1;
   rec.onresult=function(e){var text=Array.from(e.results).map(function(r){return r[0].transcript;}).join(' ');textarea.value=(textarea.value?textarea.value+'\n':'')+text;persist();};
   rec.onerror=function(){b.textContent='میکروفون در دسترس نیست؛ تایپ کنید';};
   rec.onend=function(){live=false;b.setAttribute('aria-pressed','false');if(!b.textContent.includes('نیست'))b.textContent='🎙️ گفتن مسئله';};
   rec.start();live=true;b.setAttribute('aria-pressed','true');b.textContent='توقف ضبط ●';
  }catch(e){b.textContent='میکروفون در این مرورگر فعال نیست';}
 });
}
function boot(){
 if(!byId('cj-situation'))return;
 byId('cj-situation').value=draft.text;byId('cj-context').value=draft.context;byId('cj-urgency').value=draft.urgency;byId('cj-choice').value=draft.issue;
 ['cj-situation','cj-context','cj-urgency','cj-choice'].forEach(function(id){byId(id).addEventListener('input',persist);byId(id).addEventListener('change',persist);});
 byId('cj-guide').addEventListener('click',generate);
 byId('cj-send-studio').addEventListener('click',handoff);
 byId('cj-copy-ai').addEventListener('click',makePrompt);
 byId('cj-book-human').addEventListener('click',humanLink);
 byId('cj-after-guide')?.addEventListener('click',handoff);
 byId('cj-output').addEventListener('click',function(e){var t=e.target.closest('[data-cj-lesson],#cj-after-guide');if(!t)return;if(t.id==='cj-after-guide')handoff();else if(t.dataset.cjLesson)location.hash='/lesson/'+t.dataset.cjLesson;});
 addVoice();
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();