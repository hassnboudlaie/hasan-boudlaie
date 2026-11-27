/* Masir Oman LXP: authenticated accounts, cases, reading, event analytics, admin */
(function(){
'use strict';
const PROJECT_URL='https://hxcjkewlaniahvuqwwbb.supabase.co';
const PROJECT_KEY='sb_publishable_KpklYvrvXyorJVy4gQOWAw_SA8zaQy6';
const LESSONS=[
 {id:'negotiation',title:'مذاکره و مدیریت اعتراض مشتری',domain:'فروش',minutes:8,question:'در برابر درخواست تخفیف چه می‌کنی؟',parts:[
 ['گام اول؛ اعتراض را تفسیر نکن','وقتی مشتری می‌گوید قیمت بالاست، هنوز مشخص نیست چه چیزی برایش نامناسب است. ممکن است بودجه محدود، گزینه مشابه، نگرانی از بازده، یا عدم اطمینان به توضیحات فروشنده پشت این جمله باشد. واکنش فوری با فهرستی از مزایای ملک معمولاً گفت‌وگو را به رقابت توضیحات تبدیل می‌کند. ابتدا با پرسش باز و بدون حالت دفاعی بپرسید معیار او برای مقایسه چیست و کدام بخش تصمیم بیشترین ابهام را دارد.'],
 ['گام دوم؛ منافع را از مواضع جدا کن','موضع مشتری ممکن است «تخفیف بدهید» باشد، اما منفعت او می‌تواند امنیت سرمایه، نقدشوندگی، ثبات درآمد اجاره یا کاهش ریسک باشد. از مشتری بپرسید کدام معیار در مقایسه دو ملک تعیین‌کننده است. سپس داده‌های مربوط به آن معیار را عرضه کنید. این رویکرد به معنای حذف مذاکره بر سر قیمت نیست؛ بلکه مذاکره را به منافع واقعی مرتبط می‌کند.'],
 ['گام سوم؛ واقع‌بینی و اقدام بعد','هنگام بحث درباره بازده سرمایه‌گذاری، هیچ بازدهی را بدون مبنای معتبر تضمین نکنید. سناریوهای محتمل، محدودیت داده‌ها، ریسک‌ها و فرض‌های محاسبات را روشن کنید. در پایان مشخص کنید چه اطلاعاتی باید بررسی شود، چه کسی مسئول است و چه زمانی به مشتری بازمی‌گردید. این سه جز، اعتماد را بیش از وعده مبهم تقویت می‌کنند.']],
 example:'مشتری: «چرا این ملک گران‌تر است؟» / کارشناس: «برای اینکه مقایسه مفید باشد، دوست دارم بدانم در گزینه دیگر چه چیزی برایتان جذاب‌تر بوده: قیمت کل، موقعیت، وضعیت اجاره یا ریسک سرمایه‌گذاری؟»'},
 {id:'ownership',title:'مسئولیت‌پذیری و پیگیری تعهد',domain:'رفتار حرفه‌ای',minutes:7,question:'وقتی پرونده عقب می‌افتد چه کسی مالک مسئله است؟',parts:[
 ['مسئولیت یک نام دارد','وقتی مسئولیت میان فروش، مدیریت و مالی دست‌به‌دست می‌شود، مشتری نمی‌داند چه کسی پاسخ نهایی را می‌دهد. یک نفر باید نقش مالک پرونده را بپذیرد؛ این به معنای انجام شخصی همه کارها نیست، بلکه یعنی هماهنگی، اطلاع‌رسانی و پیگیری نتیجه با اوست.'],
 ['خطا را زود گزارش کن','سکوت در برابر تأخیر معمولاً هزینه خطا را افزایش می‌دهد. وضعیت را بدون سرزنش افراد توصیف کنید؛ پیامد احتمالی آن را توضیح دهید؛ سپس اقدام اصلاحی، مسئول و موعد را مشخص کنید. عذرخواهی زمانی مؤثر است که با برنامه عملی همراه باشد.'],
 ['حلقه پیگیری را ببند','«موضوع را به همکار منتقل کردم» به معنای پایان کار نیست. بازبینی کنید که اقدام انجام شده، به مشتری اطلاع داده شده و نتیجه در پرونده ثبت شده است. از انتقال مبهم مسئولیت و پیگیری وابسته به حافظه شخصی پرهیز کنید.']],
 example:'«در آماده‌سازی مدارک تأخیر داریم و من پیگیری موضوع را تا دریافت نتیجه بر عهده می‌گیرم. تا ساعت تعیین‌شده، وضعیت و گزینه‌های بعدی را اطلاع می‌دهم.»'},
 {id:'regulation',title:'مدیریت فشار و هیجان در مذاکره',domain:'تاب‌آوری',minutes:7,question:'وقتی فشار بالا می‌رود، لحن تو چه تغییری می‌کند؟',parts:[
 ['مکث پیش از واکنش','وقتی مشتری لحن تندی دارد، واکنش سریع و تدافعی می‌تواند وضعیت را تشدید کند. در لحظه حساس مکث کوتاه، تنظیم سرعت و حجم صدا و تمرکز روی محتوای پیام مشتری کمک می‌کند کیفیت پاسخ حفظ شود. مکث، نشانه ضعف نیست؛ یک انتخاب حرفه‌ای است.'],
 ['تفکیک شخص از مسئله','به‌جای قضاوت درباره شخصیت مشتری، اتفاق مشخص و اثر آن بر تصمیم را نام‌گذاری کنید. «شرایط تغییر کرده و این برای شما مشکل ایجاد کرده» بسیار سازنده‌تر از «شما عصبانی هستید» است. اجازه بدهید مشتری روایتش را کامل کند و سپس موضوع قابل‌حل را خلاصه کنید.'],
 ['بازگشت پس از ناکامی','شکست یک مذاکره به معنای بی‌کفایتی فرد نیست. پس از پایان گفت‌وگوی سخت، سه نکته ثبت کنید: چه چیزی رخ داد، کدام رفتار قابل اصلاح است، و در تعامل بعدی چه کاری متفاوت انجام می‌دهید. بازتاب کوتاه به بازگشت سریع‌تر به عملکرد کمک می‌کند.']],
 example:'«می‌بینم تغییر شرایط برنامه شما را تحت تأثیر قرار داده است. اجازه بدهید دقیق روشن کنیم چه چیزی تغییر کرده و چه گزینه‌هایی برای پیگیری داریم.»'},
 {id:'delegation',title:'تفویض اختیار و تصمیم‌گیری',domain:'رهبری',minutes:8,question:'کدام تصمیم هنوز بی‌دلیل منتظر تأیید مدیر است؟',parts:[
 ['تفویض فقط سپردن کار نیست','تفویض مؤثر شامل هدف، خروجی قابل سنجش، سطح اختیار، منابع و موعد بازبینی است. اگر کار به دیگری داده شده اما حق تصمیم‌گیری روشن نباشد، وابستگی به مدیر کاهش نمی‌یابد.'],
 ['مرزهای تصمیم را تعریف کن','بین تصمیم‌های مستقل، تصمیم‌های مشورتی و موارد نیازمند تأیید تفکیک قائل شوید. برای هر مورد معیارهای ریسک، سود، ارزش مشتری و تعهدات قراردادی را روشن کنید. این مرزها هم استقلال ایجاد می‌کنند و هم ریسک خطای پرهزینه را مدیریت می‌کنند.'],
 ['از پاسخ آماده به پرسشگری برو','هنگامی که کارشناس با یک مسئله می‌آید، همیشه راه‌حل را فوراً اعلام نکنید. بپرسید: مسئله اصلی چیست؟ چه گزینه‌هایی داریم؟ ریسک هر گزینه چیست؟ پیشنهاد تو کدام است؟ در پایان مسئول اقدام و زمان بازبینی را مشخص کنید.']],
 example:'«برای این نوع پیشنهاد، در محدوده مشخص می‌توانی تصمیم بگیری؛ موارد خارج از آن را همراه با دو گزینه و ارزیابی ریسک برای تصمیم مشترک مطرح کن.»'},
 {id:'complaints',title:'مدیریت مشتری ناراضی و مرزبندی',domain:'تجربه مشتری',minutes:7,question:'چگونه همدل باشی، بدون وعده خارج از اختیار؟',parts:[
 ['احساس را بپذیر، نه لزوماً درخواست را','وقتی مشتری ناراضی است، اولین نیاز او اغلب شنیده‌شدن است. می‌توانید ناراحتی مشتری را تصدیق کنید، بی‌آنکه درباره حقانیت همه ادعاها قضاوت کنید یا با درخواست ناممکن موافقت کنید.'],
 ['مرز را با احترام بیان کن','جملاتی مانند «تضمین نتیجه خارج از اختیار من است، اما می‌توانم این دو مسیر را پیگیری کنم» هم شفاف‌اند، هم حمایتی. هدف، نه گفتن خشک یا تسلیم‌شدن نیست؛ بلکه ایجاد توافقی قابل اجراست.'],
 ['انتقال درست پرونده','اگر ارجاع به مدیر لازم شد، خلاصه مسئله، اقدامات قبلی، انتظار مشتری و موعد پاسخ را همراه پرونده منتقل کنید. مشتری نباید هر بار داستان را از ابتدا بازگو کند. مالکیت پیگیری را نیز روشن نگه دارید.']],
 example:'«نگرانی شما را متوجه‌ام. نمی‌توانم نتیجه‌ای خارج از اختیارمان را تضمین کنم؛ اما می‌توانم همین الان مراحل قابل پیگیری و زمان پاسخ را شفاف کنم.»'},
 {id:'followup',title:'پیگیری فروش و تحویل کار',domain:'فرایند فروش',minutes:7,question:'بعد از بازدید، گام بعد برای همه روشن است؟',parts:[
 ['پیگیری باید ارزش ایجاد کند','پیام پیگیری صرفاً یادآوری فروش نیست. در پایان بازدید بپرسید چه اطلاعات یا مقایسه‌ای برای تصمیم‌گیری لازم است، چه زمانی مناسب تماس بعدی است و چه کسی مسئول پاسخ به پرسش‌های باز خواهد بود.'],
 ['ثبت فقط نام مشتری نیست','در CRM یا فایل پیگیری، نیاز کلیدی، نگرانی، آخرین تعامل، اقدام بعد، مالک و موعد را بنویسید. ثبت اطلاعات بدون گام بعد مشخص ممکن است تنها یک آرشیو بسازد و کمک چندانی به تبدیل مشتری نکند.'],
 ['تحویل بین واحدها','در انتقال پرونده از فروش به مالی یا قراردادها، مدارک لازم، وضعیت فعلی، موارد حل‌نشده، مسئول جدید و زمان پاسخ را با هم منتقل کنید. دریافت‌کننده باید بداند از او چه خروجی‌ای انتظار می‌رود.']],
 example:'«برای مقایسه دو ملکی که دیدید، خلاصه تفاوت‌هایشان را آماده می‌کنم. اگر موافق باشید، سه‌شنبه برای بررسی پرسش‌های باقی‌مانده با شما تماس می‌گیرم.»'}
];
const $=s=>document.querySelector(s);
const escapeHTML=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const fmt=n=>new Intl.NumberFormat('fa-IR').format(Number(n||0));
const dateFmt=v=>v?new Intl.DateTimeFormat('fa-IR',{dateStyle:'medium',timeStyle:'short'}).format(new Date(v)):'—';
const shortDate=v=>v?new Intl.DateTimeFormat('fa-IR',{dateStyle:'short'}).format(new Date(v)):'—';
const timeFmt=s=>{let n=Math.max(0,Number(s||0));return n<60?fmt(n)+' ثانیه':fmt(Math.floor(n/60))+' دقیقه'+(n%60?' و '+fmt(n%60)+' ثانیه':'');};
const eventNames={app_open:'بازدید از سامانه',sign_in:'ورود به حساب',lesson_open:'بازکردن جزوه',lesson_finish:'تکمیل مطالعه جزوه',practice_finish:'اتمام تمرین و دریافت نشان',case_created:'ثبت کیس',case_updated:'ویرایش کیس',practice_start:'شروع تمرین',decision_answered:'انتخاب پاسخ در سناریو',roleplay_saved:'ثبت رول‌پلی',coach_note_saved:'ثبت یادداشت بازتابی',mission_defined:'تعریف مأموریت میدانی'};
let sb=null,user=null,profile=null,isAdmin=false,modal=false,tab='profile',authMode='login',recovery=false,loginName='';
let course={records:[],seconds:0,start:null,error:''};
let modalTrigger=null;
let courseEntry=null;
let memberCourse={records:[],seconds:0,error:''};
const academy=window.MasirCourse;
let own={cases:[],readings:[],events:[]},adminData=[],selectedUser=null,selectedUserCases=[],selectedUserEvents=[];
let readingId=null,readingStarted=false,lastActivity=Date.now(),readCallBusy=false,loginBusy=false;
let activeReadSeconds=0, lastReadTick=Date.now();
function note(text,type){return '<div class="mp-note '+(type==='error'?'mp-error':type==='warning'?'mp-warning':'')+'">'+escapeHTML(text)+'</div>';}
function btn(text,action,extra){return '<button class="mp-btn '+(extra||'')+'" data-mp="'+action+'">'+text+'</button>';}
function toast(msg){let existing=$('#mpNoticeToast');if(!existing){existing=document.createElement('div');existing.id='mpNoticeToast';existing.style.cssText='position:fixed;bottom:22px;right:22px;z-index:200;background:#163f39;color:white;padding:12px 17px;border-radius:10px;font:800 12px Vazirmatn,Tahoma,sans-serif;box-shadow:0 10px 25px #0003;max-width:90vw';document.body.appendChild(existing);}existing.textContent=msg;existing.hidden=false;clearTimeout(existing._timer);existing._timer=setTimeout(()=>existing.hidden=true,4000);}
function setBusy(b){loginBusy=b;const f=$('#mpAuthForm');if(f){f.querySelectorAll('button').forEach(x=>x.disabled=b);}}
function ensureUI(){
 if(!$('#mpEntry')){
   const e=document.createElement('div');e.id='mpEntry';e.className='mp-entry';const t=$('.topbar .top-right')||$('.topbar');t.appendChild(e);
 }
 if(!$('#mpOverlay')){
   const d=document.createElement('div');d.id='mpOverlay';d.className='mp-overlay';d.hidden=true;d.setAttribute('role','dialog');d.setAttribute('aria-modal','true');d.setAttribute('aria-label','حساب کاربری و سامانه مدیریت یادگیری');document.body.appendChild(d);
 }
 paintEntry();
}
function paintEntry(){
 const e=$('#mpEntry');if(!e)return;
 e.innerHTML='<button class="mp-account-btn" data-mp="open-profile">'+(user?'◉ '+escapeHTML(profile?.display_name||'حساب من'):'◉ ورود / ایجاد پروفایل')+'</button>'+(isAdmin?'<button class="mp-admin-btn" data-mp="open-admin">▦ داشبورد ادمین</button>':'');
}
function show(t){
 if(!modal)modalTrigger=document.activeElement;
 tab=t||tab;modal=true;ensureUI();const e=$('#mpOverlay');e.hidden=false;document.body.style.overflow='hidden';paint();e.scrollTop=0;$('#mpOverlay .mp-close')?.focus();
}
function close(){
 if(!modal)return;modal=false;readingId=null;$('#mpOverlay').hidden=true;document.body.style.overflow='';stopReading();scanCore();if(modalTrigger?.isConnected)modalTrigger.focus();
}
function topNav(){
 if(!user)return'';
 const nav=[['course','تقویم ۹۰ روزه'],['profile','پروفایل من'],['library','جزوه‌ها'],['cases','ثبت و مشاهده کیس'],['record','کارنامه من']];
 if(isAdmin)nav.push(['admin','داشبورد مدیر']);
 return '<nav class="mp-tabs" aria-label="بخش‌های حساب کاربری">'+nav.map(x=>'<button class="'+(tab===x[0]?'active':'')+'" data-mp-tab="'+x[0]+'">'+x[1]+'</button>').join('')+'</nav>';
}
function paint(){
 if(!modal)return;
 const title=!user?'ورود و ساخت پروفایل':tab==='course'?'آکادمی فروش املاک عمان':tab==='admin'?'داشبورد ادمین':tab==='library'?'کتابخانه و مطالعه':tab==='cases'?'کیس‌های کاری':tab==='record'?'کارنامه فردی':'پروفایل من';
 const overlay=$('#mpOverlay');
 overlay.dataset.tab=user?tab:'auth';
 overlay.innerHTML='<div class="mp-window"><div class="mp-head"><div><span>MASIR · LEARNING & PERFORMANCE</span><h2>'+title+'</h2></div><button class="mp-close" data-mp="close" aria-label="بستن">بستن ×</button></div>'+topNav()+'<div class="mp-content" id="mpContent">'+(!sb?note('بارگذاری ارتباط امن سامانه با خطا مواجه شد. صفحه را تازه‌سازی کنید.','error'):!user?authView():tab==='course'?academy.render(course):tab==='profile'?profileView():tab==='library'?libraryView():tab==='cases'?casesView():tab==='record'?recordView():isAdmin?adminView():note('برای دسترسی به این بخش مجوز مدیریتی لازم است.','error'))+'</div></div>';
}
function enterCourse(destination){
 courseEntry=destination;
 const today=course.start?academy.currentDay(course.start):1;
 academy.selection(destination==='week-case'?academy.weekEnd(today):today,destination==='calendar');
 show('course');
 if(destination==='calendar'&&user)$('#academyCalendar summary')?.focus();
 if(destination==='week-case'&&user)$('.academy-casefile')?.focus();
}
function authView(){
 const mode=authMode;
 if(mode==='newpassword')return'<h3>تنظیم رمز عبور جدید</h3><p>رمز تازه خودت را وارد کن.</p><form class="mp-form" id="mpNewPassForm"><label>رمز جدید (حداقل ۸ کاراکتر)<input type="password" name="password" minlength="8" required autocomplete="new-password"></label>'+btn('ذخیره رمز جدید','noop')+'</form>';
 if(mode==='reset')return'<h3>بازیابی رمز عبور</h3><p>لینک بازیابی رمز به ایمیل حساب فرستاده می‌شود. برای فعال‌شدن لینک، تنظیم آدرس بازگشت در Supabase نیز لازم است.</p><form class="mp-form" id="mpResetForm"><label>ایمیل حساب<input type="email" name="email" required autocomplete="email" dir="ltr" placeholder="name@example.com"></label><button class="mp-btn" type="submit">ارسال لینک بازیابی رمز</button></form><p><button class="mp-link" data-mp="to-login">بازگشت به ورود</button></p>';
 return'<div class="mp-grid"><section class="mp-panel"><span class="mp-label">'+(mode==='signup'?'ایجاد حساب جدید':'ورود امن')+'</span><h3>'+(mode==='signup'?'پروفایل اختصاصی خود را بساز':'به فضای شخصی یادگیری خوش آمدی')+'</h3><p>برای ثبت دائمی پرونده، سوابق مطالعه و فعالیت‌ها، با ایمیل و رمز خودت وارد شو.</p><form class="mp-form" id="mpAuthForm">'+
 (mode==='signup'?'<label>نام و نام خانوادگی<input name="name" maxlength="100" minlength="2" required autocomplete="name" placeholder="مثلاً علی رضایی"></label>':'')+
 '<label>ایمیل<input type="email" name="email" required autocomplete="email" dir="ltr" placeholder="name@example.com"></label><label>رمز عبور<input type="password" name="password" required minlength="8" autocomplete="'+(mode==='signup'?'new-password':'current-password')+'" placeholder="حداقل ۸ کاراکتر"></label><button class="mp-btn" type="submit">'+(mode==='signup'?'ساخت پروفایل و ثبت‌نام':'ورود به حساب')+'</button></form><div class="mp-between" style="margin-top:13px"><button class="mp-link" data-mp="'+(mode==='signup'?'to-login':'to-signup')+'">'+(mode==='signup'?'قبلاً حساب ساخته‌ام':'حساب ندارم؛ ثبت‌نام')+'</button><button class="mp-link" data-mp="to-reset">رمزم را فراموش کرده‌ام</button></div></section>'+
 '<section class="mp-panel"><span class="mp-label">کارکردهای فضای شخصی</span><h3>یادگیری قابل پیگیری، نه فقط مشاهده محتوا</h3><div class="mp-action-list">'+['پروفایل دائمی با نام، نقش و واحد سازمانی','آمار ورودها و دفعات مراجعه به سامانه','ثبت تمرین‌ها و نشان‌های مهارتی','مطالعه جزوه همراه با زمان فعال و وضعیت تکمیل','ثبت کیس واقعی، اقدام و درس آموخته','گزارش تیمی برای مدیر مجاز'].map(x=>'<div class="mp-event"><span>✓ '+x+'</span></div>').join('')+'</div><div style="margin-top:13px">'+note('کیس‌های ثبت‌شده علاوه بر صاحب پرونده برای ادمین این سامانه قابل مشاهده‌اند. داده‌های حساس یا هویتی مشتریان را وارد نکنید.','warning')+'</div></section></div>';
}
function profileView(){
 return'<div class="mp-grid"><section class="mp-panel"><span class="mp-label">حساب احراز هویت‌شده</span><h3>'+escapeHTML(profile?.display_name||'کاربر')+'</h3><div class="mp-identity" dir="ltr">'+escapeHTML(user.email||'')+'</div><p>از این پس پیشرفت آموزشی و کیس‌ها به شناسه این حساب متصل می‌شوند و روی دستگاه‌های دیگر با ورود به همین حساب در دسترس خواهند بود.</p><form class="mp-form" id="mpProfileForm"><label>نام و نام خانوادگی<input name="name" minlength="2" maxlength="100" value="'+escapeHTML(profile?.display_name||'')+'" required></label><label>سمت یا نقش<input name="role" maxlength="80" value="'+escapeHTML(profile?.role_label||'کارشناس')+'" required></label><label>واحد یا حوزه فعالیت<input name="department" maxlength="100" value="'+escapeHTML(profile?.department||'فروش املاک')+'" required></label><button class="mp-btn" type="submit">ذخیره تغییرات پروفایل</button></form><div class="mp-between" style="margin-top:14px"><span class="mp-small">عضویت از: '+shortDate(profile?.joined_at)+'</span>'+btn('خروج از حساب','signout','mp-btn-light')+'</div></section>'+
 '<section class="mp-panel"><h3>مسیر شخصی تو</h3>'+statsOwn()+'<div style="margin-top:16px" class="mp-flex">'+btn('مشاهده کارنامه','open-record')+btn('ثبت کیس جدید','open-cases','mp-btn-light')+'</div><div style="margin-top:16px">'+note('تعداد ورود و مطالعه، شاخص فعالیت هستند؛ برای نتیجه‌گیری درباره کیفیت یادگیری باید به عملکرد واقعی در کار هم توجه کرد.')+'</div></section></div>';
}
function statsOwn(){
 const visits=own.events.filter(x=>x.event_type==='app_open').length,signins=own.events.filter(x=>x.event_type==='sign_in').length;
 const secs=own.readings.reduce((sum,x)=>sum+(x.active_seconds||0),0);
 const completed=own.readings.filter(x=>x.completed_at).length;
 const practices=new Set(own.events.filter(x=>x.event_type==='practice_finish').map(x=>x.module_id)).size;
 return '<div class="mp-grid-3">'+[[fmt(visits),'مراجعه'],[fmt(signins),'ورود ثبت‌شده'],[fmt(practices),'مسیر کامل'],[fmt(own.cases.length),'کیس ثبت‌شده'],[fmt(completed),'جزوه تکمیل‌شده'],[timeFmt(secs),'مطالعه فعال']].map(x=>'<div class="mp-stat"><strong>'+x[0]+'</strong><span>'+x[1]+'</span></div>').join('')+'</div>';
}
function libraryView(){
 if(readingId)return readingView(readingId);
 return'<div class="mp-between"><div><h3>کتابخانه مهارت‌های کاربردی</h3><p>شش جزوه کوتاه بر اساس مسائل شناسایی‌شده در نیازسنجی. زمان مطالعه تنها وقتی صفحه فعال است ثبت می‌شود.</p></div><span class="mp-label">مطالعه + تمرین واقعی</span></div><div class="mp-grid">'+LESSONS.map(l=>{
  const st=own.readings.find(r=>r.module_id===l.id);
  return'<article class="mp-card"><span class="mp-label">'+l.domain+'</span><h4>'+l.title+'</h4><p>'+l.question+'</p><div class="mp-flex"><span class="mp-small">زمان پیشنهادی '+l.minutes+' دقیقه</span><span class="mp-small">'+(st?'زمان فعال: '+timeFmt(st.active_seconds):'هنوز مطالعه نشده')+'</span></div><div class="mp-between" style="margin-top:12px">'+btn(st?.completed_at?'مطالعه مجدد':'بازکردن جزوه','read-'+l.id)+((st?.completed_at)?'<span class="mp-label">✓ مطالعه تکمیل شده</span>':'')+'</div></article>';
 }).join('')+'</div>';
}
function readingView(id){
 const l=LESSONS.find(x=>x.id===id);if(!l)return note('جزوه یافت نشد.');
 const st=own.readings.find(r=>r.module_id===id);
 return'<div class="mp-between" style="margin-bottom:16px"><button class="mp-btn mp-btn-light" data-mp="back-library">بازگشت به کتابخانه</button><span class="mp-label">'+l.domain+' · '+l.minutes+' دقیقه پیشنهادی</span></div>'+
 '<article class="mp-reading-body"><h3>'+l.title+'</h3><p>'+l.question+'</p>'+l.parts.map((p,i)=>'<h4>'+fmt(i+1)+'. '+p[0]+'</h4><p>'+p[1]+'</p>').join('')+'<h4>مثال کاربردی</h4><p>'+escapeHTML(l.example)+'</p>'+
 '<h4>پرسش بازتابی برای انتقال یادگیری</h4><p>در اولین گفت‌وگوی واقعی، کدام رفتار را می‌خواهی به‌صورت آگاهانه امتحان کنی؟ چه مشاهده‌ای به تو نشان می‌دهد این مهارت را به کار گرفته‌ای؟</p></article>'+
 '<div class="mp-between mp-panel" style="margin-top:14px"><div><strong style="font-size:13px">شواهد مطالعه</strong><div class="mp-small">زمان فعال ثبت‌شده: <span id="mpActiveReadSeconds">'+timeFmt(st?.active_seconds||0)+'</span> · دفعات بازکردن: '+fmt(st?.open_count||0)+'</div></div>'+
 (st?.completed_at?'<span class="mp-label">✓ مطالعه تکمیل شده</span>':btn('مطالعه این جزوه را تکمیل کردم','mark-read'))+'</div>'+
 '<div class="mp-note" style="margin-top:12px">«تکمیل مطالعه» با انتخاب شخص ثبت می‌شود؛ زمان فعال به‌صورت تقریبی اندازه‌گیری می‌شود و لزوماً به معنای تسلط مهارتی نیست.</div>';
}
function casesView(){
 return'<div class="mp-between" style="margin-bottom:17px"><div><h3>ثبت کیس واقعی</h3><p>یک موقعیت واقعی، تصمیم یا اقدام انجام‌شده و درس آموخته را ثبت کن. بهتر است مورد، کوتاه و بدون مشخصات هویتی مشتری باشد.</p></div><span class="mp-label">'+fmt(own.cases.length)+' کیس</span></div>'+
 '<div class="mp-grid"><section class="mp-panel"><h4>ثبت کیس جدید</h4><form class="mp-form" id="mpCaseForm"><label>عنوان کیس<input name="title" minlength="5" maxlength="140" required placeholder="مثلاً اعتراض مشتری به بازده ملک"></label><label>حوزه مهارتی<select name="skill">'+LESSONS.map(l=>'<option value="'+l.id+'">'+l.title+'</option>').join('')+'</select></label><label>چه اتفاقی افتاد؟<textarea name="situation" minlength="15" maxlength="3000" required placeholder="موقعیت را بدون اطلاعات شخصی مشتری شرح بده..."></textarea></label><label>چه اقدامی انجام دادی؟<textarea name="action_taken" maxlength="3000" placeholder="اقدام یا گفت‌وگوی خودت..."></textarea></label><label>چه نتیجه‌ای به دست آمد؟<textarea name="outcome" maxlength="3000" placeholder="نتیجه قابل مشاهده..."></textarea></label><label>درس آموخته یا پیشنهاد تو<textarea name="reflection" maxlength="3000" placeholder="اگر دوباره رخ دهد چه می‌کنی؟"></textarea></label>'+note('محتوای کیس برای خودت و ادمین سامانه قابل مشاهده است. اطلاعات محرمانه قرارداد، نام یا شماره تماس مشتری را ثبت نکن.','warning')+'<button class="mp-btn" type="submit">ثبت کیس در پرونده شخصی</button></form></section>'+
 '<section class="mp-panel"><h4>کیس‌های من</h4>'+(own.cases.length?'<div class="mp-action-list">'+own.cases.map(c=>'<article class="mp-card"><span class="mp-label">'+escapeHTML(LESSONS.find(l=>l.id===c.skill)?.title||c.skill)+'</span><h4>'+escapeHTML(c.title)+'</h4><p>'+escapeHTML(c.situation).slice(0,280)+(c.situation.length>280?'…':'')+'</p><span class="mp-small">ثبت: '+dateFmt(c.created_at)+'</span><details style="margin-top:12px"><summary style="font-size:12px;color:#117568;font-weight:800;cursor:pointer">مشاهده جزئیات</summary><p><b>اقدام:</b> '+escapeHTML(c.action_taken||'—')+'</p><p><b>نتیجه:</b> '+escapeHTML(c.outcome||'—')+'</p><p><b>درس آموخته:</b> '+escapeHTML(c.reflection||'—')+'</p></details></article>').join('')+'</div>':'<div class="mp-note">هنوز کیس ثبت نشده است. اولین موقعیت واقعی را از همین فرم شروع کن.</div>')+'</section></div>';
}
function recordView(){
 const total=own.events.filter(x=>x.event_type==='practice_finish').length;
 const unique=new Set(own.events.filter(x=>x.event_type==='practice_finish').map(x=>x.module_id)).size;
 return'<h3>کارنامه و سابقه فعالیت من</h3><p>این اطلاعات از دیتابیس حساب تو خوانده می‌شوند و در دستگاه‌های دیگر نیز قابل دسترسی‌اند.</p>'+statsOwn()+academy.history(course.records,course.seconds,course.rewards)+
 '<div class="mp-grid" style="margin-top:17px"><section class="mp-panel"><h4>وضعیت مطالعه جزوه‌ها</h4><div class="mp-action-list">'+LESSONS.map(l=>{
  const r=own.readings.find(x=>x.module_id===l.id);
  return'<div class="mp-event"><div><b>'+l.title+'</b><div class="mp-small">'+(r?timeFmt(r.active_seconds)+' · '+fmt(r.open_count)+' نوبت بازکردن':'مطالعه نشده')+'</div></div><span class="mp-small">'+(r?.completed_at?'تکمیل‌شده':'—')+'</span></div>';
 }).join('')+'</div></section><section class="mp-panel"><h4>سابقه اقدامات و فعالیت‌ها</h4><p class="mp-small">تمرین‌های تکمیل شده: '+fmt(total)+' نوبت، '+fmt(unique)+' مسیر متمایز</p>'+
 (own.events.length?'<div class="mp-action-list">'+own.events.slice(0,30).map(e=>'<div class="mp-event"><span>'+escapeHTML(eventNames[e.event_type]||e.event_type)+(e.module_id?' · '+escapeHTML(LESSONS.find(l=>l.id===e.module_id)?.title||e.module_id):'')+'</span><time class="mp-small">'+dateFmt(e.created_at)+'</time></div>').join('')+'</div>':'<div class="mp-note">هنوز سابقه ثبت نشده است.</div>')+'</section></div>';
}
function adminView(){
 if(!isAdmin)return note('دسترسی مدیریتی تأیید نشده است.','error');
 const team=adminData.filter(x=>x.user_id!==user.id);const n=team.length,totalVisits=team.reduce((s,x)=>s+Number(x.visits||0),0),totalSigns=team.reduce((s,x)=>s+Number(x.sign_ins||0),0),totalCases=team.reduce((s,x)=>s+Number(x.cases_count||0),0),totalTime=team.reduce((s,x)=>s+Number(x.reading_seconds||0),0);
 return'<div class="mp-between" style="margin-bottom:17px"><div><h3>رصد فعالیت و توسعه مهارتی تیم</h3><p>نمای خصوصی Admin · فقط حساب مجاز می‌تواند به داده‌های کارکنان دسترسی داشته باشد.</p></div>'+btn('به‌روزرسانی گزارش','refresh-admin','mp-btn-light')+'</div>'+
 '<form class="academy-start" id="academyStart"><label for="academyStartDate">تاریخ شروع گروه (میلادی، به وقت عمان)</label><input id="academyStartDate" type="date" required value="'+escapeHTML(course.start||'')+'"><button class="mp-btn" type="submit">ذخیره تاریخ شروع</button></form>'+
 '<div class="mp-grid-3">'+[[fmt(n),'کاربر دارای پروفایل'],[fmt(totalVisits),'مراجعه به سامانه'],[fmt(totalSigns),'ورود ثبت‌شده'],[fmt(totalCases),'کیس ثبت‌شده'],[timeFmt(totalTime),'مطالعه فعال تیم'],[fmt(team.reduce((s,x)=>s+Number(x.practices||0),0)),'اتمام تمرین‌ها']].map(x=>'<div class="mp-stat"><strong>'+x[0]+'</strong><span>'+x[1]+'</span></div>').join('')+'</div>'+
 '<div class="mp-panel" style="margin-top:17px"><div class="mp-between" style="margin-bottom:12px"><h4>عملکرد و فعالیت افراد</h4><span class="mp-small">برای جزئیات، گزینه مشاهده هر ردیف را بزن.</span></div>'+
 (n?'<div class="mp-table-wrap"><table class="mp-table"><thead><tr><th>نام / نقش</th><th>ورود</th><th>مراجعه</th><th>تمرین</th><th>کیس</th><th>جزوه تکمیل</th><th>زمان مطالعه</th><th>آخرین فعالیت</th><th>جزئیات</th></tr></thead><tbody>'+
 team.map(x=>'<tr><td><b>'+escapeHTML(x.display_name)+'</b><div class="mp-muted">'+escapeHTML(x.role_label||'')+'</div></td><td>'+fmt(x.sign_ins)+'</td><td>'+fmt(x.visits)+'</td><td>'+fmt(x.practices)+'</td><td>'+fmt(x.cases_count)+'</td><td>'+fmt(x.lessons_completed)+'</td><td>'+timeFmt(x.reading_seconds)+'</td><td>'+shortDate(x.last_activity)+'</td><td><button class="mp-rowbtn" data-admin-user="'+escapeHTML(x.user_id)+'">مشاهده</button></td></tr>').join('')+'</tbody></table></div>':'<div class="mp-note">هنوز کاربری وارد سامانه نشده و پروفایل ثبت نکرده است.</div>')+'</div>'+
 (selectedUser?adminDetails():'<div class="mp-note" style="margin-top:12px">با انتخاب هر فرد، سابقه فعالیت‌ها و عنوان کیس‌های او نمایش داده می‌شود.</div>')+
 '<div class="mp-note mp-warning" style="margin-top:12px">آمار ورود و زمان مطالعه از رویدادهای ثبت‌شده توسط اپ محاسبه می‌شوند و باید شاخص Engagement محسوب شوند، نه ارزیابی قطعی شایستگی.</div>';
}
function adminDetails(){
 const p=adminData.find(x=>x.user_id===selectedUser);if(!p)return'';
 return'<section class="mp-panel" style="margin-top:17px"><div class="mp-between"><div><h3>پرونده فعالیت: '+escapeHTML(p.display_name)+'</h3><div class="mp-small" dir="ltr">'+escapeHTML(p.email)+'</div><p>'+escapeHTML(p.role_label)+' · '+escapeHTML(p.department)+'</p></div>'+btn('بستن جزئیات','close-user','mp-btn-light')+'</div>'+
 (memberCourse.error?note(memberCourse.error,'error'):academy.history(memberCourse.records,memberCourse.seconds,memberCourse.rewards,true,course.start))+'<div class="mp-grid"><div><h4>کیس‌های ثبت‌شده</h4>'+(selectedUserCases.length?'<div class="mp-action-list">'+selectedUserCases.map(c=>'<article class="mp-card"><h4>'+escapeHTML(c.title)+'</h4><span class="mp-small">'+dateFmt(c.created_at)+'</span><details><summary style="font-size:12px;cursor:pointer;color:#176b65">مشاهده متن کیس</summary><p><b>موقعیت:</b> '+escapeHTML(c.situation)+'</p><p><b>اقدام:</b> '+escapeHTML(c.action_taken||'—')+'</p><p><b>نتیجه:</b> '+escapeHTML(c.outcome||'—')+'</p><p><b>درس آموخته:</b> '+escapeHTML(c.reflection||'—')+'</p></details></article>').join('')+'</div>':'<div class="mp-note">کیسی ثبت نشده است.</div>')+'</div>'+
 '<div><h4>رویدادهای اخیر</h4>'+(selectedUserEvents.length?'<div class="mp-action-list">'+selectedUserEvents.map(e=>'<div class="mp-event"><span>'+escapeHTML(eventNames[e.event_type]||e.event_type)+(e.module_id?' · '+escapeHTML(LESSONS.find(l=>l.id===e.module_id)?.title||e.module_id):'')+'</span><time class="mp-small">'+dateFmt(e.created_at)+'</time></div>').join('')+'</div>':'<div class="mp-note">رویدادی ثبت نشده است.</div>')+'</div></div></section>';
}
async function fetchCourseData(id){
 const [days,clock,rewards]=await Promise.all([
  sb.from('oman_lxp_course_days').select('day,read_at,task,quiz_answers,quiz_score,updated_at').eq('user_id',id).order('day'),
  sb.from('oman_lxp_course_clock').select('active_seconds').eq('user_id',id).maybeSingle(),
  sb.from('oman_lxp_course_rewards').select('week,points,rate_irr,amount_irr,approved_at,issued_at').eq('user_id',id).order('week')
 ]);
 return {records:days.data||[],seconds:clock.data?.active_seconds||0,rewards:rewards.data||[],error:days.error||clock.error||rewards.error?'بخشی از پرونده دوره بارگذاری نشد. دوباره تلاش کنید.':''};
}
async function loadCourse(){
 const id=user?.id;
 if(!id)return;
 const [data,schedule]=await Promise.all([
  fetchCourseData(id),
  sb.from('oman_lxp_course_schedule').select('start_date').eq('id',true).maybeSingle()
 ]);
 if(user?.id===id)course={...data,start:schedule.data?.start_date||null,error:data.error||(schedule.error?'بارگذاری تاریخ شروع ناموفق بود.':'')};
}
async function saveCourse(action,button){
 const id=user?.id;
 if(!id||tab!=='course'||button.disabled)return;
 let values;
 try{values=academy.patch(action,$('#mpContent'));}catch(error){toast(error.message);return;}
 button.disabled=true;
 try{
  const result=await sb.from('oman_lxp_course_days').upsert({...values,user_id:id,updated_at:new Date().toISOString()},{onConflict:'user_id,day'}).select('day,read_at,task,quiz_answers,quiz_score,updated_at').single();
  if(user?.id!==id)return;
  if(result.error){toast('ثبت انجام نشد. دوباره تلاش کنید.');return;}
  course.records=[...course.records.filter(row=>row.day!==values.day),result.data].sort((a,b)=>a.day-b.day);
  if(tab==='course'){
   paint();$('#academyLesson')?.focus();
  }
  toast('فعالیت ثبت شد.');
 }finally{button.disabled=false;}
}
async function saveSchedule(form){
 if(!isAdmin)return;
 const start=form.querySelector('input').value;
 const result=await sb.from('oman_lxp_course_schedule').upsert({id:true,start_date:start},{onConflict:'id'});
 if(result.error){toast('تاریخ ثبت نشد. دوباره تلاش کنید.');return;}
 course.start=start;
 academy.selection(0);
 toast('تاریخ شروع گروه ذخیره شد.');
}
async function processReward(control,issue=false){
 const id=selectedUser;
 if(!isAdmin||!id)return;
 const week=Number(issue?control.dataset.academyIssue:control.dataset.academyReward);
 const rate=issue?null:Number(new FormData(control).get('rate'));
 if(!issue&&(!Number.isInteger(rate)||rate<1||rate>100000000)){toast('نرخ هر امتیاز را به ریال وارد کنید.');return;}
 const button=issue?control:control.querySelector('button');
 if(button.disabled)return;
 button.disabled=true;
 try{
  const args={p_user:id,p_week:week};
  if(!issue)args.p_rate=rate;
  const result=await sb.rpc(issue?'oman_lxp_issue_reward':'oman_lxp_approve_reward',args);
  if(result.error){toast('ثبت مشوق ممکن نشد. تاریخ پایان هفته و امتیاز فرد را بررسی کنید.');return;}
  if(selectedUser===id){
   await loadUserDetails(id);
   document.querySelectorAll('.academy-week-report')[week-1]?.setAttribute('open','');
  }
  toast(issue?'تحویل مشوق ثبت شد.':'امتیاز و ارزش ریالی هفته تأیید شد.');
 }finally{button.disabled=false;}
}
async function trackCourseClock(){
 if(!user||document.visibilityState!=='visible'||!document.hasFocus()||Date.now()-lastActivity>90000)return;
 const id=user.id;
 const {data,error}=await sb.rpc('oman_lxp_course_tick');
 if(!error&&Number.isInteger(data)&&user?.id===id)course.seconds=data;
}
async function logEvent(event_type,module_id){
 if(!user||!sb)return;
 try{
  const {error}=await sb.from('oman_lxp_events').insert({user_id:user.id,event_type,module_id:module_id||null});
  if(error)console.warn('event log',error.message);
 }catch(e){console.warn('event log error',e);}
}
async function loadOwn(){
 if(!sb||!user)return;
 const [a,b,c]=await Promise.all([
  sb.from('oman_lxp_cases').select('*').eq('user_id',user.id).order('created_at',{ascending:false}).limit(250),
  sb.from('oman_lxp_readings').select('*').eq('user_id',user.id),
  sb.from('oman_lxp_events').select('id,event_type,module_id,created_at').eq('user_id',user.id).order('created_at',{ascending:false}).limit(2500)
 ]);
 if(a.error||b.error||c.error)console.warn('profile data issue',a.error?.message,b.error?.message,c.error?.message);
 own={cases:a.data||[],readings:b.data||[],events:c.data||[]};
 // On a second device, restore previously earned practice badges from secure history.
 if(window.MasirCoreSync?.setIdentity){
  const completed=[...new Set(own.events.filter(e=>e.event_type==='practice_finish'&&e.module_id).map(e=>e.module_id))];
  window.MasirCoreSync.setIdentity(user.id,completed);
 }
}
async function initUser(nameHint){
 if(!sb)return;
 const {data:auth}=await sb.auth.getUser();
 user=auth?.user||null;
 if(!user){profile=null;isAdmin=false;own={cases:[],events:[],readings:[]};paintEntry();return;}
 const [p,a]=await Promise.all([sb.rpc('oman_lxp_ensure_profile',{p_name:nameHint||user.user_metadata?.full_name||null}),sb.rpc('oman_lxp_is_admin')]);
 if(p.error)console.warn('profile setup',p.error.message);
 profile=p.data||{display_name:nameHint||user.email.split('@')[0],email:user.email};
 isAdmin=!!a.data&&!a.error;
 await logEvent('app_open',null);
 await Promise.all([loadOwn(),loadCourse()]);
 paintEntry();if(modal)paint();
}
async function adminRefresh(){
 if(!isAdmin)return;
 const r=await sb.rpc('oman_lxp_admin_overview');
 if(r.error){toast('خطا در بارگذاری داشبورد: '+r.error.message);return;}
 adminData=r.data||[];
 if(selectedUser)await loadUserDetails(selectedUser,false);
 paint();
}
async function loadUserDetails(id,repaint=true){
 if(!isAdmin||!adminData.some(x=>x.user_id===id))return;
 selectedUser=id;
 const [a,b,details]=await Promise.all([
  sb.from('oman_lxp_cases').select('id,title,situation,action_taken,outcome,reflection,created_at').eq('user_id',id).order('created_at',{ascending:false}).limit(80),
  sb.from('oman_lxp_events').select('event_type,module_id,created_at').eq('user_id',id).order('created_at',{ascending:false}).limit(100),fetchCourseData(id)
 ]);
 if(selectedUser!==id||!isAdmin)return;
 memberCourse=details;
 if(a.error||b.error)toast('بخشی از اطلاعات این فرد قابل بارگذاری نبود.');
 selectedUserCases=a.data||[];selectedUserEvents=b.data||[];
 if(repaint)paint();
}
function moduleFromCore(){
 const heading=$('#appMain .breadcrumb');const content=$('#appMain details.technique');
 if(!heading||!content)return null;
 const s=heading.textContent||'';
 return LESSONS.find(x=>s.includes(x.title))?.id||null;
}
function getReadingContext(){
 if(modal&&tab==='library'&&readingId)return readingId;
 if(modal)return null;
 return moduleFromCore();
}
async function scanCore(){
 const id=getReadingContext();
 if(id===readingId && readingStarted)return;
 if(readingStarted)await flushReading();
 readingId=id;readingStarted=false;lastReadTick=Date.now();activeReadSeconds=0;
 if(id&&user&&sb){
  readingStarted=true;
  const res=await sb.rpc('oman_lxp_record_reading',{p_module_id:id,p_seconds:0,p_open:true,p_complete:false});
  if(res.error)console.warn('reading open',res.error.message);
  await logEvent('lesson_open',id);
 }
}
function stopReading(){readingStarted=false;lastReadTick=Date.now();activeReadSeconds=0;}
async function flushReading(){
 if(readCallBusy||!readingStarted||!readingId||!sb||!user)return;
 const now=Date.now();
 if(document.visibilityState!=='visible'||now-lastActivity>120000){lastReadTick=now;return;}
 const secs=Math.max(0,Math.min(30,Math.floor((now-lastReadTick)/1000)));
 if(secs<5)return;
 readCallBusy=true;lastReadTick=now;
 const id=readingId;
 try{
  const result=await sb.rpc('oman_lxp_record_reading',{p_module_id:id,p_seconds:secs,p_open:false,p_complete:false});
  if(!result.error){
   activeReadSeconds+=secs;
   const st=own.readings.find(r=>r.module_id===id);
   if(st)st.active_seconds+=secs;
   else own.readings.push({module_id:id,active_seconds:secs,open_count:1,completed_at:null});
   const x=$('#mpActiveReadSeconds');if(x)x.textContent=timeFmt(own.readings.find(x=>x.module_id===id)?.active_seconds||secs);
  }
 }catch(e){console.warn('reading timer',e);}
 readCallBusy=false;
}
async function markLesson(id){
 if(!id||!user||!sb)return;
 await flushReading();
 const r=await sb.rpc('oman_lxp_record_reading',{p_module_id:id,p_seconds:0,p_open:false,p_complete:true});
 if(r.error){toast('ثبت تکمیل مطالعه انجام نشد.');return;}
 await logEvent('lesson_finish',id);
 await loadOwn();
 toast('مطالعه جزوه در پرونده شما ثبت شد.');
 if(modal)paint();
}
async function handleAuthForm(form){
 if(loginBusy)return;
 const f=new FormData(form),email=String(f.get('email')||'').trim().toLowerCase(),password=String(f.get('password')||''),name=String(f.get('name')||'').trim();
 if(!email||password.length<8){toast('ایمیل معتبر و رمز حداقل هشت‌کاراکتری لازم است.');return;}
 setBusy(true);
 try{
  if(authMode==='signup'){
   const {data,error}=await sb.auth.signUp({email,password,options:{data:{full_name:name},emailRedirectTo:location.origin+location.pathname}});
   if(error)throw error;
   if(!data.session){toast('در صورت فعال‌بودن تأیید ایمیل، لینک فعال‌سازی را در صندوق ایمیل بررسی کن.');authMode='login';paint();}
   else{loginName=name;await initUser(name);if(tab==='course'&&courseEntry)enterCourse(courseEntry);await logEvent('sign_in',null);await loadOwn();if(tab!=='course')tab='profile';paint();}
  }else{
   const {error}=await sb.auth.signInWithPassword({email,password});
   if(error)throw error;
   await initUser();if(tab==='course'&&courseEntry)enterCourse(courseEntry);
   await logEvent('sign_in',null);await loadOwn();if(tab!=='course')tab=isAdmin?'admin':'profile';
   if(isAdmin)await adminRefresh();paint();toast('ورود به حساب موفق بود.');
  }
 }catch(err){toast('ورود / ثبت‌نام انجام نشد: '+(err.message||'خطای ناشناخته'));}
 finally{setBusy(false);}
}
async function handleProfileForm(form){
 const f=new FormData(form),display_name=String(f.get('name')||'').trim(),role_label=String(f.get('role')||'').trim(),department=String(f.get('department')||'').trim();
 if(display_name.length<2){toast('نام و نام خانوادگی را کامل بنویس.');return;}
 const {data,error}=await sb.from('oman_lxp_profiles').update({display_name,role_label,department}).eq('user_id',user.id).select().single();
 if(error){toast('ذخیره پروفایل ناموفق بود: '+error.message);return;}
 profile=data;paintEntry();paint();toast('پروفایل ذخیره شد.');
}
async function handleCaseForm(form){
 const f=new FormData(form),row={user_id:user.id,title:String(f.get('title')||'').trim(),skill:String(f.get('skill')||''),situation:String(f.get('situation')||'').trim(),action_taken:String(f.get('action_taken')||'').trim(),outcome:String(f.get('outcome')||'').trim(),reflection:String(f.get('reflection')||'').trim()};
 if(row.title.length<5||row.situation.length<15){toast('عنوان و شرح موقعیت را کامل‌تر بنویس.');return;}
 const {error}=await sb.from('oman_lxp_cases').insert(row);
 if(error){toast('کیس ثبت نشد: '+error.message);return;}
 await logEvent('case_created',row.skill);await loadOwn();paint();toast('کیس با موفقیت در پرونده شما ثبت شد.');
}
async function handleReset(form){
 const email=String(new FormData(form).get('email')||'').trim();
 const {error}=await sb.auth.resetPasswordForEmail(email,{redirectTo:location.origin+location.pathname});
 if(error)toast('درخواست بازیابی ناموفق بود: '+error.message);
 else toast('اگر حسابی با این ایمیل وجود داشته باشد، لینک بازیابی ارسال می‌شود.');
}
async function handleNewPassword(form){
 const password=String(new FormData(form).get('password')||'');
 if(password.length<8){toast('رمز باید حداقل هشت کاراکتر باشد.');return;}
 const {error}=await sb.auth.updateUser({password});
 if(error){toast(error.message);return;}
 recovery=false;authMode='login';await initUser();paint();toast('رمز جدید تنظیم شد.');
}
document.addEventListener('keydown',e=>{
 if(e.key==='Escape'&&modal){e.preventDefault();close();}
});
document.addEventListener('submit',async e=>{
 const f=e.target;
 if(f.matches('[data-academy-reward]')){e.preventDefault();await processReward(f);return;}
 if(!f.matches('#mpAuthForm,#mpResetForm,#mpNewPassForm,#mpProfileForm,#mpCaseForm,#academyStart'))return;
 e.preventDefault();
 if(f.id==='mpAuthForm')await handleAuthForm(f);
 if(f.id==='mpResetForm')await handleReset(f);
 if(f.id==='mpNewPassForm')await handleNewPassword(f);
 if(f.id==='mpProfileForm')await handleProfileForm(f);
 if(f.id==='mpCaseForm')await handleCaseForm(f);
 if(f.id==='academyStart')await saveSchedule(f);
});
document.addEventListener('click',async e=>{
 const issue=e.target.closest('[data-academy-issue]');
 if(issue){await processReward(issue,true);return;}
 const daily=e.target.closest('[data-academy-day],[data-academy-today],[data-academy-save]');
 if(daily&&tab==='course'&&user){
  if(daily.dataset.academySave){await saveCourse(daily.dataset.academySave,daily);return;}
  academy.selection(Number(daily.dataset.academyDay)||(course.start?academy.currentDay(course.start):1));
  paint();$('#academyLesson')?.focus();return;
 }
 const t=e.target.closest('[data-mp],[data-mp-tab],[data-admin-user]');
 if(t){
  if(t.dataset.mpTab){tab=t.dataset.mpTab;readingId=null;paint();if(tab==='library')await loadOwn();if(tab==='admin')await adminRefresh();scanCore();return;}
  if(t.dataset.adminUser){await loadUserDetails(t.dataset.adminUser);return;}
  const a=t.dataset.mp;
  if(!a)return;
  if(a==='close'){close();return;}
  if(['open-course','open-today','open-calendar','open-week-case'].includes(a)){enterCourse(a.slice(5));return;}
  if(a==='open-profile'){tab='profile';show(tab);return;}
  if(a==='open-admin'){tab='admin';show(tab);await adminRefresh();return;}
  if(a==='open-cases'){tab='cases';show(tab);return;}
  if(a==='open-record'){tab='record';show(tab);return;}
  if(a==='to-signup'){authMode='signup';paint();return;}
  if(a==='to-login'){authMode='login';paint();return;}
  if(a==='to-reset'){authMode='reset';paint();return;}
  if(a==='signout'){await sb.auth.signOut();user=null;profile=null;isAdmin=false;course={records:[],seconds:0,start:null,error:''};academy.selection(0);own={cases:[],readings:[],events:[]};selectedUser=null;window.MasirCoreSync?.setIdentity(null,[]);paintEntry();close();toast('از حساب خارج شدی.');return;}
  if(a==='refresh-admin'){await adminRefresh();toast('گزارش به‌روزرسانی شد.');return;}
  if(a==='close-user'){selectedUser=null;selectedUserCases=[];selectedUserEvents=[];paint();return;}
  if(a==='back-library'){await flushReading();readingId=null;readingStarted=false;await loadOwn();paint();return;}
  if(a==='mark-read'){await markLesson(readingId);return;}
  if(a.startsWith('read-')){
   readingId=a.slice(5);paint();readingStarted=false;await scanCore();return;
  }
  if(a==='noop')return;
 }
},false);
// Hook existing functional prototype, without changing its scenario logic.
document.addEventListener('click',function(e){
 if(!user)return;
 const start=e.target.closest('#appMain [data-practice]');
 if(start){logEvent('practice_start',start.dataset.practice);return;}
 const choice=e.target.closest('#appMain [data-choice]');
 if(choice){
  const id=Object.entries(window.MasirCoreSync?.titles||{}).find(([,title])=>($('#appMain .breadcrumb')?.textContent||'').includes(title))?.[0];
  if(id&&!choice.disabled)logEvent('decision_answered',id);
  return;
 }
 const t=e.target.closest('#appMain [data-action]');if(!t)return;
 const action=t.dataset.action;
 const id=Object.entries(window.MasirCoreSync?.titles||{}).find(([,title])=>($('#appMain .breadcrumb')?.textContent||'').includes(title))?.[0];
 if(action==='save-speech'&&$('#speechBox')?.value.trim()&&id)logEvent('roleplay_saved',id);
 if(action==='save-coach'&&$('#coachEntry')?.value.trim())logEvent('coach_note_saved',null);
 if(action==='finish'&&$('#missionBox')?.value.trim()&&id){
   logEvent('mission_defined',id);
   setTimeout(async()=>{await logEvent('practice_finish',id);await loadOwn();},10);
 }
 if(action==='to-commit'){
   const lesson=moduleFromCore();
   if(lesson)setTimeout(()=>markLesson(lesson),100);
 }
},true);
['click','keydown','touchstart','scroll'].forEach(type=>document.addEventListener(type,()=>{lastActivity=Date.now();},{passive:true,capture:true}));
document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='hidden'){lastReadTick=Date.now();}else{lastActivity=Date.now();lastReadTick=Date.now();}});
function startObserver(){
 const core=$('#appMain');if(!core)return;
 const observer=new MutationObserver(()=>{if(!modal)scanCore();});
 observer.observe(core,{childList:true,subtree:false});
 setInterval(()=>{if(!modal)scanCore();},2500);
 setInterval(flushReading,15000);
}
async function init(){
 ensureUI();
 if(!window.supabase?.createClient){console.warn('Supabase JavaScript SDK is missing');return;}
 sb=window.supabase.createClient(PROJECT_URL,PROJECT_KEY,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}});
 sb.auth.onAuthStateChange((event)=>{
  if(event==='PASSWORD_RECOVERY'){recovery=true;authMode='newpassword';setTimeout(()=>show('profile'),0);}
  if(event==='SIGNED_OUT'){user=null;profile=null;isAdmin=false;course={records:[],seconds:0,start:null,error:''};academy.selection(0);window.MasirCoreSync?.setIdentity(null,[]);paintEntry();}
 });
 startObserver();
 setInterval(trackCourseClock,15000);
 try{const {data}=await sb.auth.getSession();if(data?.session)await initUser();}catch(err){console.warn('Masir session init',err);}
 paintEntry();
 if(window.location.hash==='#admin'){tab='admin';show('admin');}else if(window.location.hash==='#account')show('profile');else if(window.location.hash==='#academy')enterCourse('today');
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
