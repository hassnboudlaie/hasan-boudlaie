
/* Curated from the workshop's resilience-game.js handout and mission cases.
   These are organizational strategies translated into claims-workshop practice,
   not psychological personality types. */
(function(){
'use strict';
const strategies={
 camel:{
  n:'۰۱',name:'شتر',en:'Core Resilience',label:'ادامه خدمت در شرایط سخت',
  subtitle:'روش رسیدگی درست است؛ با نظم، تقسیم کار و آمادگی بیشتر، خدمت را حتی در شرایط سخت ادامه می‌دهیم.',
  traits:['حفظ فرایند معتبر','تقسیم بار و اولویت‌بندی','آمادگی برای اختلال موقت'],
  condition:'وقتی فشار کار یا اختلال موقتی است اما شیوه رسیدگی درست عمل می‌کند، لازم نیست همه‌چیز را از نو طراحی کنیم؛ باید خدمت را با دقت ادامه دهیم.',
  application:'در واحد خسارت، پرونده‌ها را بر اساس فوریت و کامل‌بودن مدارک دسته‌بندی می‌کنیم، جانشین مشخص می‌کنیم و از مسیر ثبت موقت مصوب استفاده می‌کنیم؛ کنترل‌های قانونی را حذف نمی‌کنیم.',
  example:'بعد از تعطیلات، تعداد مراجعه‌کنندگان ناگهان سه برابر شده است. سامانه نیز یک ساعت مختل می‌شود. تیم باید نوبت‌بندی، ثبت موقت مجاز و اطلاع‌رسانی دقیق را هماهنگ کند.',
  lesson1:'هسته خدمت یعنی آن بخش از مدل عملیاتی که برای ایجاد ارزش به مشتری به کار می‌رود. در راهبرد شتر، این هسته حفظ می‌شود و توان پاسخ‌گویی به شوک تقویت می‌شود.',
  lesson2:'پروتکل پشتیبان، اولویت‌بندی پرونده‌ها، مدیریت خستگی و تعیین زمان بازبینی از ابزارهای این راهبرد هستند. هدف حفظ کیفیت در فشار است، نه صرفاً افزایش سرعت.',
  boundary:'تحمل فرسودگی، پنهان‌کردن خطا یا اصرار بر روالی که دیگر کارآمد نیست، تاب‌آوری نیست.',
  question:'چه شواهدی نشان می‌دهد مشکل امروز فقط افزایش فشار است، نه ناکارآمدی خودِ روش رسیدگی؟',
  mission:'صفی که ناگهان سه برابر شد'
 },
 salmon:{
  n:'۰۲',name:'ماهی آزاد',en:'Corporate Innovation',label:'خلق یک خدمت تازه در کنار کار اصلی',
  subtitle:'کار اصلی را حفظ می‌کنیم و در کنار آن، برای نیاز جدید مشتری یک خدمت مستقل را با احتیاط می‌آزماییم.',
  traits:['تداوم کار اصلی','طراحی ارزش پیشنهادی تازه','آزمایش کوچک و مجوزدار'],
  condition:'وقتی فعالیت جاری قابل‌اتکاست ولی نیاز یا فرصت جدیدی در بازار پدید آمده که با یک خدمت یا مدل کسب‌وکار مستقل پاسخ بهتری می‌گیرد.',
  application:'تیم خسارت، بدون اختلال در رسیدگی روزانه، می‌تواند نیاز مشتریان ناوگان به خدمت مستقل پایش و پیشگیری از خسارت را به مدیریت پیشنهاد کند؛ مدل درآمدی و امکان‌پذیری باید بررسی شود.',
  example:'مشتریان ناوگان خواهان کاهش توقف خودرو هستند. گروه باید برای خدمت پیشگیری و پایش ریسک، مشتری هدف، ارزش پیشنهادی، فرضیه درآمد و طرح پایلوت تعریف کند؛ هنوز مجوز اجرا صادر نشده است.',
  lesson1:'Corporate Innovation افزودن هر ابزار کوچک به کار فعلی نیست؛ به معنای ساخت یا آزمون یک ارزش پیشنهادی متمایز، در کنار هسته موجود است.',
  lesson2:'با مسئله مشتری شروع کنید، فرضیه‌های ارزش و درآمد را روشن کنید و یک آزمایش محدود و کم‌ریسک با معیار توقف و مجوز لازم طراحی کنید.',
  boundary:'افزودن پیامک، فرم یا یک فعالیت جانبی به فرایند موجود، به‌تنهایی ایجاد کسب‌وکار تازه محسوب نمی‌شود.',
  question:'این ایده دقیقاً چه ارزش تازه‌ای می‌آفریند و چه شواهدی می‌تواند فرضیه ما را رد کند؟',
  mission:'فرصتی بیرون از رسیدگی خسارت'
 },
 chameleon:{
  n:'۰۳',name:'آفتاب‌پرست',en:'Core Transformation',label:'اصلاح اساسی شیوه رسیدگی',
  subtitle:'وقتی مشکل بارها تکرار می‌شود، به‌جای فشار بیشتر بر کارکنان، مسیر اصلی رسیدگی را بهتر طراحی می‌کنیم.',
  traits:['تشخیص مسئله ساختاری','بازطراحی گردش‌کار','تعریف نقش و کنترل تازه'],
  condition:'وقتی مشکل با افزایش نیرو، صبوری بیشتر یا یک راه‌حل موقت برطرف نمی‌شود و خودِ شیوه اصلی خدمت نیازمند تغییر است.',
  application:'در خسارت درمان، می‌توان مدل ارائه خدمت را از مراجعه‌های تکراری به رسیدگی یکپارچه حضوری–دیجیتال با یک مالک پرونده، نقاط تماس تازه و شاخص کیفیت تبدیل کرد.',
  example:'مراجع بارها بین واحدها رفت‌وآمد می‌کند. گروه باید مدل خدمت «قبل و بعد» را مشخص کند: کانال ورود مشتری، مالک پرونده، حدود اختیار واحدها، کیفیت و تجربه مشتری.',
  lesson1:'Core Transformation یعنی تغییر معنادار در مدل عملیاتی اصلی، نه تغییر آرایش ظاهری فرم‌ها یا جابه‌جایی ساده کارها.',
  lesson2:'نقاط شکست مدل فعلی را شناسایی کنید؛ سپس شیوه جدید ارائه خدمت، مالک پرونده، نقاط تماس مشتری، مهارت‌ها و کنترل کیفیت را همراه با برنامه مدیریت تغییر تعریف کنید.',
  boundary:'تغییر رنگ فرم، یک دستورالعمل یا جابه‌جایی یک کارشناس، تحول هسته‌ای محسوب نمی‌شود.',
  question:'کدام بخش از روش فعلی باید واقعاً تغییر کند تا مسئله به‌صورت پایدار حل شود؟',
  mission:'رفت‌وآمدی که پایان ندارد'
 },
 octopus:{
  n:'۰۴',name:'اختاپوس',en:'Corporate Transformation',label:'نوسازی خدمت اصلی و خلق خدمت جدید',
  subtitle:'هم شیوه رسیدگی را تغییر می‌دهیم، هم یک خدمت مستقل جدید را بررسی می‌کنیم؛ البته با اولویت و منابع روشن.',
  traits:['تحول هم‌زمان دو جریان','هماهنگی منابع و اختیارات','مدیریت وابستگی‌ها'],
  condition:'وقتی برای پاسخ آینده هم تغییر مدل عملیاتی اصلی لازم است و هم ساخت ارزش پیشنهادی تازه بیرون از هسته.',
  application:'در بیمه اموال، ممکن است بازطراحی کامل رسیدگی دیجیتال همراه با راه‌اندازی خدمت مستقل پایش و پیشگیری ریسک مطرح شود؛ هر مسیر مالک، بودجه و شاخص جدا می‌خواهد.',
  example:'شرکت هم با صف و دوباره‌کاری خسارت مواجه است و هم فرصتی برای خدمت جدید پایش ریسک دارد، ولی ظرفیت کارشناسان محدود است. گروه باید دو جریان تغییر را اولویت‌بندی و هماهنگ کند.',
  lesson1:'Corporate Transformation ترکیب دو تغییر واقعی است: تحول هسته فعلی و ایجاد کسب‌وکار یا خدمت جدید در کنار آن؛ صرف زیادبودن تعداد کارها کافی نیست.',
  lesson2:'مالک و منابع هر جریان را مشخص کنید، وابستگی‌ها و ریسک فشار بر تیم را بسنجید و اجرای مرحله‌ای با نقاط تصمیم مدیریتی طراحی کنید.',
  boundary:'چندوظیفگی، فعالیت‌های پراکنده یا تغییرات نمایشی به‌معنای راهبرد اختاپوس نیست؛ اجرای آن به اختیار و ظرفیت سازمانی نیاز دارد.',
  question:'چه چیزی را باید هم‌زمان تغییر دهیم و کدام فعالیت باید به دلیل کمبود ظرفیت فعلاً متوقف شود؟',
  mission:'دو تغییر، یک ظرفیت محدود'
 }
};
const keys=['camel','salmon','chameleon','octopus'];
const esc=x=>String(x).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const dlg=document.createElement('dialog');
dlg.className='alborz-strategy-dialog';
dlg.setAttribute('aria-label','معرفی و درس‌نامه راهبرد تاب‌آوری');
dlg.innerHTML='<div class="sd-wrap"><div class="sd-bar"><span class="sd-kicker">آکادمی مدیریت بیمه البرز · راهبردهای تاب‌آوری</span><button class="sd-close" type="button" data-close-strategy aria-label="بستن و بازگشت به چهار راهبرد">×</button></div><div id="sd-heading"></div><nav class="sd-tabs" role="tablist" aria-label="بخش‌های راهبرد"><button type="button" class="sd-tab" role="tab" data-detail-tab="overview">معرفی و کاربرد</button><button type="button" class="sd-tab" role="tab" data-detail-tab="lesson">درس‌نامه</button><button type="button" class="sd-tab" role="tab" data-detail-tab="mission">اجرای مأموریت</button></nav><div id="sd-content" role="tabpanel"></div></div>';
document.body.append(dlg);
let chosen='camel',tab='overview',origin=null;
const section=(title,body,extra='')=>'<section class="sd-section '+extra+'"><h3>'+title+'</h3>'+body+'</section>';
function overview(x){
 return section('راهبرد در یک نگاه','<p>'+esc(x.subtitle)+'</p><div class="sd-pill-row">'+x.traits.map(y=>'<span class="sd-pill">'+esc(y)+'</span>').join('')+'</div>','sd-soft')
 +section('چه زمانی این راهبرد مناسب است؟','<p>'+esc(x.condition)+'</p>')
 +section('کاربرد برای کارشناس خسارت','<p>'+esc(x.application)+'</p>','sd-gold')
 +section('یک موقعیت واقعی‌نما از محیط بیمه','<p>'+esc(x.example)+'</p>')
 +'<button class="sd-action" type="button" data-detail-tab="lesson">مطالعه درس‌نامه این راهبرد ←</button>';
}
function lesson(x){
 return '<p class="sd-label">درس‌نامه تخصصی · یادگیری مرحله‌به‌مرحله</p>'
 +section('۱. مفهوم و منطق راهبرد','<p>'+esc(x.lesson1)+'</p>','sd-soft')
 +section('۲. چگونه آن را به کار بگیریم؟','<p>'+esc(x.lesson2)+'</p>')
 +section('۳. مثال در بیمه و واحد خسارت','<p>'+esc(x.example)+'</p>','sd-gold')
 +section('۴. مرز و خطای رایج','<p><strong>توجه:</strong> '+esc(x.boundary)+'</p>')
 +section('پرسش تأملی برای بحث گروهی','<p><strong>'+esc(x.question)+'</strong></p>','sd-soft')
 +'<p class="sd-small">مبنای علمی: چهار راهبرد سازمانی Kurt Verweire برای مواجهه با آشوب؛ مثال‌ها اقتباس آموزشی برای صنعت بیمه‌اند، نه تشخیص تیپ شخصیتی افراد.</p>'
 +'<button type="button" class="sd-action" data-detail-tab="mission">رفتن به مأموریت مرتبط ←</button>';
}
function mission(x){
 return section('مأموریت '+esc(x.n)+' · '+esc(x.name),'<p><strong>'+esc(x.mission)+'</strong></p><p>'+esc(x.example)+'</p>','sd-soft')
 +section('مسیر اجرای مشترک مدرس و کارشناسان','<p>مدرس هر گام را روی پرده اعلام می‌کند. گروه‌ها همان گام را روی موبایل دنبال می‌کنند و پاسخ‌ها را ثبت و اشتراک‌گذاری می‌کنند.</p><ol class="sd-list"><li>مسئله و هدف</li><li>تقسیم نقش‌ها</li><li>گفت‌وگو و مهارت‌ها</li><li>انتخاب و تصمیم اولیه</li><li>اتفاق تازه</li><li>اصلاح تصمیم</li><li>بازخورد و نتیجه</li></ol><p class="sd-small">مدرس نتیجه گروه‌ها را در نمای زنده سناریو می‌بیند. جابه‌جایی مرحله‌ها با راهنمایی مدرس است و صفحه موبایل افراد خودکار عوض نمی‌شود.</p>')
 +section('ورود به سناریوی «'+esc(x.mission)+'»',
  '<p>برای اجرای همین سناریو، مطابق نقش خود وارد شوید. هر دو مسیر از سیستم ورود امن فعلی استفاده می‌کنند؛ گروه کارشناسان پس از ورود با PIN اختصاصی به سناریوی انتخاب‌شده هدایت می‌شود.</p>'
  +'<div class="sd-entry-grid">'
  +'<a class="sd-entry-card sd-entry-participant" href="./resilience.html?classroom=1&amp;mission='+encodeURIComponent(chosen)+'"><span class="sd-entry-eyebrow">ویژه کارشناسان خسارت</span><strong>ورود کارشناسان به سناریو</strong><span class="sd-entry-scenario">'+esc(x.mission)+'</span><small>ورود با PIN اختصاصی ۸ رقمی · گروه و عضو به‌صورت خودکار مشخص می‌شوند</small></a>'
  +'<a class="sd-entry-card sd-entry-teacher" href="./resilience.html?classroom=1&amp;teacher=1&amp;mission='+encodeURIComponent(chosen)+'"><span class="sd-entry-eyebrow">ویژه مدرس کارگاه</span><strong>ورود مدرس به سناریوی «'+esc(x.mission)+'»</strong><small>ورود با کد اختصاصی مدرس · راهنمای اجرای همین سناریو و داشبورد زنده</small></a>'
  +'</div>'
  +'<p class="sd-small">هر گروه می‌تواند مأموریت‌ها را به ترتیب دلخواه انجام دهد؛ انتخاب این سناریو، دسترسی به سه سناریوی دیگر را محدود نمی‌کند. داده‌ها، PINها و همگام‌سازی گروه‌ها بدون تغییر می‌مانند.</p>','sd-gold');
}
function render(){
 const x=strategies[chosen];
 document.getElementById('sd-heading').innerHTML='<div class="sd-heading"><div class="sd-photo strategy-'+chosen+'" role="img" aria-label="تصویر '+esc(x.name)+' از پوستر مصوب کارگاه"></div><div><span class="sd-kicker">راهبرد '+esc(x.n)+'</span><h2>'+esc(x.name)+'</h2><span class="sd-title">'+esc(x.label)+'</span><p class="sd-english" dir="ltr">'+esc(x.en)+'</p><p class="sd-sentence">'+esc(x.subtitle)+'</p></div></div>';
 dlg.querySelectorAll('.sd-tab').forEach(b=>{const active=b.dataset.detailTab===tab;b.setAttribute('aria-selected',String(active));b.tabIndex=active?0:-1;});
 document.getElementById('sd-content').innerHTML=tab==='lesson'?lesson(x):tab==='mission'?mission(x):overview(x);
 dlg.scrollTop=0;
}
function open(id,target){
 if(!strategies[id])return;
 chosen=id;tab=target||'overview';origin=document.activeElement;
 render();
 if(typeof dlg.showModal==='function')dlg.showModal();else dlg.setAttribute('open','');
 dlg.querySelector('.sd-close').focus();
}
document.addEventListener('click',e=>{
 const card=e.target.closest('.workshop-hero .strategy-card[data-strategy]');
 if(card){open(card.dataset.strategy);return;}
});
document.addEventListener('keydown',e=>{
 const card=e.target.closest('.workshop-hero .strategy-card[data-strategy]');
 if(card&&(e.key==='Enter'||e.key===' ')){e.preventDefault();open(card.dataset.strategy);}
});
dlg.addEventListener('click',e=>{
 const close=e.target.closest('[data-close-strategy]');
 if(close){dlg.close();return;}
 const b=e.target.closest('[data-detail-tab]');
 if(b){tab=b.dataset.detailTab;render();dlg.querySelector('.sd-tab[data-detail-tab="'+tab+'"]')?.focus();}
 if(e.target===dlg)dlg.close();
});
dlg.addEventListener('close',()=>{if(origin&&origin.isConnected)origin.focus();});
})();
