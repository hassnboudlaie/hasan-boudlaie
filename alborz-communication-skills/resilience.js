'use strict';
/* Alborz Insurance — Claims Adjuster Resilience, first two-hour module.
   Verweire's four ANIMAL metaphors represent corporate strategic responses,
   not personality categories or a validated worker resilience questionnaire.
   This standalone classroom MVP saves only in the local browser by group.
   No external API, tracking, authentication, or real customer information. */
(function(){
const APP=document.getElementById('course');
const COURSE='./resilience.html';
const STORAGE='alborz-claims-resilience-v1:group-';
const STAGES=[
 {label:'تقسیم نقش‌ها',short:'آغاز گروه',icon:'👥',mins:10},
 {label:'شناخت آشوب',short:'مسئله واقعی',icon:'🌪️',mins:15},
 {label:'شناخت چهار راهبرد',short:'جزوه و آزمون',icon:'🐪',mins:25},
 {label:'انتخاب هوشمند',short:'تشخیص راهبرد',icon:'🧭',mins:20},
 {label:'طراحی الگوی گروه',short:'برنامه اقدام',icon:'🛠️',mins:35},
 {label:'ارائه و بازخورد',short:'اشتراک نتیجه',icon:'🎤',mins:15}
];
const MODELS=[
 {id:'camel',animal:'🐪',name:'شتر',nameEn:'Core Resilience',type:'حفظ هسته و تقویت تاب‌آوری',focus:'شیوه اصلی کار حفظ می‌شود؛ ظرفیت تحمل، بازیابی و انعطاف عملیاتی تقویت می‌شود.',method:'پروتکل پشتیبان، مدیریت بحران، اولویت‌بندی پرونده‌ها، تقسیم بار و بازگشت به خدمت.',example:'در قطعی کوتاه سامانه، مسیر ثبت موقت مجاز، اطلاع‌رسانی شفاف و تقسیم کار اجرا می‌شود؛ مدل اصلی رسیدگی تغییر نمی‌کند.',caution:'مقاومت در برابر هر تغییر نیست؛ حفظ هسته با آماده‌سازی و چابکی است.'},
 {id:'salmon',animal:'🐟',name:'ماهی آزاد',nameEn:'Corporate Innovation',type:'نوآوری جدید بیرون از هسته',focus:'کار اصلی ادامه دارد و هم‌زمان ابتکار تازه‌ای در کنار آن آزموده می‌شود.',method:'اجرای آزمایشی محدود، فرضیه روشن، معیار موفقیت و یادگیری با هزینه کنترل‌شده.',example:'در کنار رسیدگی جاری، خدمت داوطلبانه جدید برای پیش‌آگاه‌سازی و آموزش پیشگیری از خسارت پیشنهاد و آزمایش می‌شود.',caution:'هر ایده کوچک یا اضافه‌کاری «نوآوری بیرون از هسته» نیست؛ ابتکار باید واقعاً متمایز باشد.'},
 {id:'chameleon',animal:'🦎',name:'آفتاب‌پرست',nameEn:'Core Transformation',type:'دگرگونی در هسته فعالیت',focus:'برای پاسخ پایدار به آشوب، شیوه اصلی ارائه خدمت یا مدل عملیاتی تغییر می‌کند.',method:'بازطراحی گردش‌کار، نقش‌ها، مهارت‌ها و نقاط تصمیم همراه با مدیریت تغییر.',example:'مسیر اصلی رسیدگی از صف واحد دستی به تریاژ استاندارد، تخصیص پویا و فرایند دیجیتال بازطراحی می‌شود.',caution:'صرف عوض‌کردن ظاهر فرم یا جابه‌جایی کارها تحول هسته محسوب نمی‌شود.'},
 {id:'octopus',animal:'🐙',name:'اختاپوس',nameEn:'Corporate Transformation',type:'تحول هسته + نوآوری بیرونی',focus:'هم‌زمان با تحول در کار اصلی، یک حوزه یا خدمت جدید خارج از هسته نیز ایجاد می‌شود.',method:'دو جریان هماهنگ تغییر، مدیریت وابستگی‌ها، ظرفیت اجرایی و هویت جدید ارزش‌آفرینی.',example:'هم رسیدگی خسارت به شکل اساسی بازطراحی می‌شود و هم خدمت نوین پیشگیری/پایش ریسک در کنار آن ایجاد می‌شود.',caution:'پیچیده‌ترین گزینه است؛ بدون اختیار، منابع و پشتیبانی مدیریتی نباید به‌صورت شعار انتخاب شود.'}
];
const CASES=[
 {title:'موج خسارت و ازدحام',icon:'🌊',desc:'پس از بارندگی شدید، تعداد درخواست‌ها ناگهان بالا رفته؛ مشتریان منتظرند و همکاران تحت فشارند. باید سرعت، دقت و رفتار انسانی هم‌زمان حفظ شود.'},
 {title:'قطعی سامانه رسیدگی',icon:'💻',desc:'در اوج ساعت مراجعه، سامانه اصلی برای چند ساعت از دسترس خارج شده و پرونده‌ها در صف مانده‌اند. وعده غیرمجاز و ثبت اطلاعات حساس در ابزار عمومی ممنوع است.'},
 {title:'تغییر رویه و اختلاف',icon:'🔁',desc:'رویه بررسی مدارک تغییر کرده، کارشناسان برداشت یکسانی ندارند و تماس‌های تکراری مشتریان زیاد شده است. باید ابهام، نقش‌ها و هماهنگی اصلاح شود.'}
];
const ROLE_NAMES=['تسهیل‌گر گفت‌وگو','تحلیلگر موقعیت','منتقد فرض‌ها','طراح راهکار','ارائه‌دهنده و زمان‌بان'];
const QUIZZES=[
 {title:'موقعیت ۱: قطعی موقت سامانه',question:'تیم بدون تغییر شیوه اصلی رسیدگی، برای قطعی سامانه مسیر پشتیبان مجاز، تقسیم کار و اطلاع‌رسانی روشن ایجاد می‌کند. این تصمیم به کدام الگو نزدیک‌تر است؟',correct:'camel',reasons:{
 camel:'درست است: هسته خدمت ثابت است و ظرفیت بازیابی و تداوم عملیات تقویت می‌شود.',
 salmon:'نادرست است: ابتکار کسب‌وکار یا خدمت تازه‌ای خارج از فعالیت اصلی ایجاد نشده است.',
 chameleon:'نادرست است: روش اصلی رسیدگی از پایه بازطراحی نشده؛ فقط تاب‌آوری عملیاتی افزایش یافته است.',
 octopus:'نادرست است: هم تحول هسته و هم نوآوری بیرونی لازم است، ولی هیچ‌کدام در سناریو رخ نداده است.'
 }},
 {title:'موقعیت ۲: تغییر در دو جبهه',question:'سازمان، فرآیند اصلی بررسی خسارت را اساساً بازطراحی می‌کند و هم‌زمان یک خدمت مستقل پیشگیری از خسارت را آزمایش می‌کند. نزدیک‌ترین پاسخ چیست؟',correct:'octopus',reasons:{
 camel:'نادرست است: هسته فعالیت از وضعیت قبلی حفظ نشده و تغییر اساسی دارد.',
 salmon:'نادرست است: علاوه بر نوآوری بیرونی، خود هسته خدمت هم دگرگون شده است.',
 chameleon:'نادرست است: تحول هسته درست است، اما ابتکار مستقل بیرونی را توضیح نمی‌دهد.',
 octopus:'درست است: هم تحول هسته انجام می‌شود و هم یک خدمت جدید بیرون از آن شکل می‌گیرد.'
 }}
];
const qs=new URLSearchParams(location.search);
const raw=qs.get('group');
const GROUP=raw && /^(?:[1-9]|10)$/.test(raw) ? Number(raw):0;
const ESC={'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'};
const esc=x=>String(x===undefined||x===null?'':x).replace(/[&<>"']/g,c=>ESC[c]);
const nl=x=>String(x===undefined||x===null?'':x);
const fa=n=>Number(n).toLocaleString('fa-IR');
const link=(g,s)=>COURSE+'?group='+g+(Number.isInteger(s)?'&step='+s:'');
const empty=()=>({done:[],quiz0:'',quiz1:'',scene:0,core:'',outside:'',model:'',feedback:[],roles:['','','','','']});
function read(g){
 const key=STORAGE+g;
 try{
  const d=JSON.parse(localStorage.getItem(key)||'{}');
  return Object.assign(empty(),d&&typeof d==='object'?d:{},
   {done:Array.isArray(d.done)?d.done.filter(n=>Number.isInteger(n)&&n>=0&&n<6):[],
    feedback:Array.isArray(d.feedback)?d.feedback:[],
    roles:Array.isArray(d.roles)?ROLE_NAMES.map((_,i)=>nl(d.roles[i]||'')):['','','','','']});
 }catch(e){return empty();}
}
let state=GROUP?read(GROUP):null;
function save(){
 if(!GROUP)return;
 try{
  localStorage.setItem(STORAGE+GROUP,JSON.stringify(state));
  const el=document.getElementById('saved');if(el)el.textContent='روی همین دستگاه ذخیره شد ✓';
 }catch(e){const el=document.getElementById('saved');if(el)el.textContent='ذخیره این مرورگر در دسترس نیست؛ از خروجی متنی استفاده کنید.';}
}
const credits=()=>'<span>۱ نشان برای هر مرحله تکمیل‌شده؛ بدون رتبه‌بندی و رقابت بین گروه‌ها</span>';
function previewStages(){
 return '<div class="stages-preview">'+STAGES.map(x=>'<div class="preview-step"><span class="step-emoji" aria-hidden="true">'+x.icon+'</span><b>'+x.short+'</b><small>'+fa(x.mins)+' دقیقه</small></div>').join('')+'</div>';
}
function landing(){
 document.title='تاب‌آوری کارشناسان خسارت | انتخاب گروه';
 APP.innerHTML='<section class="hero"><span class="hero-eyebrow">دوره مستقل · کارشناسان خسارت بیمه البرز</span>'+
 '<h1>تاب‌آوری کارکنان در محیط‌های پرتلاطم</h1>'+
 '<p>از شناخت چهار راهبرد تا طراحی الگوی تاب‌آوری گروهی؛ یادگیری عملی با راهنمایی منتور دوره.</p>'+
 '<div class="stat-row"><span>👥 ۵۰ شرکت‌کننده</span><span>🧩 ۱۰ گروه پنج‌نفره</span><span>⏱ کل دوره: ۸ ساعت</span><span>🎯 بخش اول: ۲ ساعت</span></div></section>'+
 '<div class="section-head"><div><h2>گروه خود را انتخاب کنید</h2><p>هر گروه فضای کار، جزوه، مسیر یادگیری و خروجی جداگانه دارد.</p></div></div>'+
 '<div class="group-grid" aria-label="فهرست ده گروه">'+Array.from({length:10},(_,i)=>{
  const g=i+1,progress=read(g).done.length;
  return '<a class="group-link" href="'+link(g)+'" aria-label="ورود به گروه '+fa(g)+'"><div><div class="group-number">گروه '+fa(g)+'</div>'+
  '<div class="group-sub">۵ نفر · '+(progress?fa(progress)+' مرحله ثبت‌شده':'آماده شروع')+'</div></div>'+
  '<div class="group-enter"><span>ورود به گروه</span><span aria-hidden="true">←</span></div></a>';
 }).join('')+'</div>'+
 '<div class="callout soft"><p><strong>روش اجرا:</strong> پنج عضو هر گروه با هم گفت‌وگو می‌کنند و یک نفر به‌عنوان ثبت‌کننده، تصمیم‌ها را در اپ وارد می‌کند. هر گروه می‌تواند پاسخ‌هایش را کپی و در پایان ارائه کند.</p></div>'+
 '<div class="section-head"><div><h2>نقشه دو ساعت نخست</h2><p>۶ گام کوتاه، قابل کلیک و بدون منوهای اضافی</p></div></div>'+previewStages()+
 '<div class="animal-row">'+MODELS.map(m=>'<div class="animal-tile"><span class="emoji">'+m.animal+'</span><b>'+m.name+'</b><small>'+m.type+'</small></div>').join('')+'</div>'+
 '<div class="callout amber"><p><strong>نکته علمی:</strong> این چهار حیوان چهار گزینه راهبردی برای سازمان‌ها هستند، نه تیپ شخصیتی یا ابزار تشخیص سلامت روان کارکنان. تمرین ما کاربرد استعاری و متناسب با اختیار تیم خسارت است.</p></div>'+
 '<div class="section-head"><div><h2>ساختار دوره ۸ ساعته</h2><p>جزئیات علمی و تمرین‌های دو ساعت اول آماده شده‌اند.</p></div></div>'+
 '<div class="callout"><p><b>بخش اول · ۲ ساعت:</b> شناسایی آشوب، مطالعه مدل شتر/ماهی آزاد/آفتاب‌پرست/اختاپوس، طراحی و ارائه الگوی گروهی.</p>'+
 '<p><b>۶ ساعت بعدی:</b> در ساختار دوره پیش‌بینی شده‌اند؛ سرفصل‌ها و فعالیت‌های آن‌ها پس از نهایی‌شدن برنامه مدرس توسعه می‌یابند.</p></div>';
}
function sectionHead(k,desc){
 const a=STAGES[k];
 return '<div class="section-top"><span class="step-emoji" aria-hidden="true">'+a.icon+'</span><div><small>گام '+fa(k+1)+' از ۶ · '+fa(a.mins)+' دقیقه</small><h2>'+a.label+'</h2></div></div>'+
 (desc?'<p>'+desc+'</p>':'');
}
function mentor(prompt){
 return '<aside class="mentor-line"><b>💬 پرسش راهنمای منتور</b><p>'+prompt+'</p></aside>';
}
function field(key,label,placeholder,long=false,helper=''){
 const val=esc(state[key]||'');
 return '<label class="field"><span class="field-label">'+label+'</span>'+
 (long?'<textarea data-field="'+key+'" rows="3" placeholder="'+esc(placeholder)+'">'+val+'</textarea>':
 '<input data-field="'+key+'" type="text" value="'+val+'" placeholder="'+esc(placeholder)+'" maxlength="600">')+
 (helper?'<small>'+helper+'</small>':'')+'</label>';
}
function roleField(i){
 return '<label class="field"><span class="field-label">'+fa(i+1)+'. '+ROLE_NAMES[i]+'</span>'+
 '<input data-role="'+i+'" maxlength="90" value="'+esc(state.roles[i])+'" placeholder="نام کوچک یا نام مستعار (اختیاری)">'+
 '</label>';
}
function modelCard(m){
 return '<article class="animal-card"><h3><span aria-hidden="true">'+m.animal+'</span>'+m.name+'</h3>'+
 '<div class="scientific"><b>'+m.type+'</b></div>'+
 '<p><strong>منطق:</strong> '+m.focus+'</p>'+
 '<p><strong>ابزارها:</strong> '+m.method+'</p>'+
 '<p><strong>مثال خسارت:</strong> '+m.example+'</p>'+
 '<small>توجه: '+m.caution+'</small></article>';
}
function quizCard(q,i){
 const current=state['quiz'+i];
 return '<div class="callout"><h3>'+q.title+'</h3><p>'+q.question+'</p>'+
 '<div class="quiz-grid">'+MODELS.map(m=>'<button type="button" data-quiz="'+i+'" data-answer="'+m.id+'" class="quiz-btn'+(current===m.id?' chosen':'')+'">'+m.animal+' '+m.name+'</button>').join('')+'</div>'+
 (current?'<div class="quiz-feedback" role="status"><b>'+(current===q.correct?'✓ انتخاب درست است.':'این انتخاب با شواهد سناریو سازگار نیست؛ دلیل هر گزینه را بخوانید.')+'</b>'+
 '<ul>'+MODELS.map(m=>'<li><strong>'+m.animal+' '+m.name+':</strong> '+q.reasons[m.id]+'</li>').join('')+'</ul></div>':'')+'</div>';
}
function matrix(){
 return '<div class="matrix" aria-label="ماتریس چهار راهبرد تاب‌آوری در آشوب"><div class="matrix-axis">دو تصمیم: تغییر هسته فعالیت؟ و نوآوری مستقل بیرون از هسته؟</div>'+
 '<div class="matrix-grid">'+[
  {id:'camel',caption:'هسته ثابت · نوآوری بیرونی نه'},
  {id:'salmon',caption:'هسته ثابت · نوآوری بیرونی بله'},
  {id:'chameleon',caption:'هسته تغییر می‌کند · نوآوری بیرونی نه'},
  {id:'octopus',caption:'هسته تغییر می‌کند · نوآوری بیرونی بله'}
 ].map(item=>{const m=MODELS.find(x=>x.id===item.id);return '<div class="matrix-cell"><span class="emoji">'+m.animal+'</span><b>'+m.name+'</b><small>'+item.caption+'</small></div>'}).join('')+'</div>'+
 '<div class="matrix-note">این ماتریس ابزار گفت‌وگوی راهبردی است؛ برای انتخاب، شواهد موقعیت و حدود اختیار را بررسی کنید.</div></div>';
}
function step0(){
 return sectionHead(0,'هر گروه پنج نفر دارد؛ نقش‌ها را برای گفت‌وگوی مؤثر تقسیم کنید. همه اعضا حق طرح پرسش و مخالفت محترمانه دارند.')+
 '<div class="roles">'+ROLE_NAMES.map((_,i)=>roleField(i)).join('')+'</div>'+
 '<div class="callout soft"><p>🎯 <strong>مأموریت ۱۲۰ دقیقه‌ای:</strong> مسئله آشوبناک کار خسارت را تحلیل کنید، چهار راهبرد را بشناسید، یکی را با دلیل انتخاب کنید و در پایان یک الگوی سه‌اقدامی قابل اجرا ارائه دهید.</p></div>'+
 mentor('اگر قرار باشد خروجی این دو ساعت واقعاً به کار کارشناسان خسارت بیاید، چه چیزی باید در پایان روشن‌تر شده باشد؟')+
 '<div class="badge-line"><span>🎙️ منتور دوره: راهنما و پرسشگر</span><span>🤝 تصمیم و اجرای کار: اعضای گروه</span></div>';
}
function step1(){
 const scene=CASES[Number(state.scene)||0];
 return sectionHead(1,'ابتدا نوع آشوب و پیامد آن برای کارشناس، مشتری و کیفیت تصمیم را مشخص کنید؛ راهکار را زود انتخاب نکنید.')+
 '<h3>یک موقعیت آشنا انتخاب کنید</h3>'+
 '<div class="cases">'+CASES.map((c,i)=>'<button type="button" class="case-tile'+(Number(state.scene)===i?' selected':'')+'" data-case="'+i+'"><b>'+c.icon+' '+c.title+'</b><small>انتخاب سناریو ←</small></button>').join('')+'</div>'+
 '<div class="callout soft"><strong>اتفاق آشنا · '+scene.title+'</strong><p>'+scene.desc+'</p></div>'+
 '<div class="field-grid">'+field('signal','سه نشانه آشوب را بنویسید','مثلاً افزایش حجم تماس، کندی پاسخ، خستگی تیم',true)+
 field('impact','اگر اقدام نکنیم، کدام نتیجه آسیب می‌بیند؟','دقت ارزیابی، اعتماد مشتری، زمان رسیدگی، سلامت کارکنان',true)+
 field('control','در اختیار تیم چه چیزهایی است؟','مثلاً تقسیم کار مجاز، اطلاع‌رسانی و ارجاع به مسئول',true)+
 field('limits','چه چیزی خارج از اختیار تیم است؟','مثلاً تغییر مقررات، پرداخت خارج از اختیار یا تغییر سامانه اصلی',true)+'</div>'+
 mentor('کدام بخش ماجرا واقعاً «آشوب» است و کدام بخش صرفاً یک مسئله عادیِ قابل حل؟ چه فرضی را هنوز بررسی نکرده‌ایم؟');
}
function step2(){
 return sectionHead(2,'این بخش جزوه علمی مستقل گروه شماست. هر چهار مدل را مرور کنید؛ سپس درباره موقعیت‌های خسارت به دو سؤال تحلیلی پاسخ دهید.')+
 matrix()+'<h3>جزوه چهار راهبرد با مثال‌های خسارت</h3>'+
 '<div class="animal-grid">'+MODELS.map(modelCard).join('')+'</div>'+
 '<div class="callout amber"><p><b>مرز کاربرد:</b> این مدل برای واکنش استراتژیک سازمان به آشوب طراحی شده است؛ در کارگاه از آن به‌عنوان لنز تصمیم‌گیری برای تیم خسارت استفاده می‌کنیم، نه ابزار تشخیص شخصیت، اختلال روانی یا امتیاز تاب‌آوری فردی.</p></div>'+
 '<h3>سؤال‌های برای تفکر گروهی</h3>'+QUIZZES.map(quizCard).join('')+
 '<p><a class="secondary" href="'+COURSE+'?group='+GROUP+'&handout=1">📚 بازکردن جزوه کامل و منابع علمی</a></p>'+
 mentor('آیا تیم ما دارد مسئله را با «حفظ هسته» پاسخ می‌دهد یا باید برای یک تغییر پایدارتر، اختیار و منابع بیشتری درخواست کند؟');
}
function step3(){
 const recommend=state.core&&state.outside?({no:{no:'camel',yes:'salmon'},yes:{no:'chameleon',yes:'octopus'}}[state.core]||{})[state.outside]:null;
 const rec=MODELS.find(m=>m.id===recommend),selected=MODELS.find(m=>m.id===state.model);
 const choices=(key,value)=>'<div class="choice-grid">'+[{id:'no',text:'خیر'},{id:'yes',text:'بله'}].map(opt=>
 '<button class="choice'+(state[key]===opt.id?' selected':'')+'" type="button" data-decision="'+key+'" data-answer="'+opt.id+'">'+opt.text+'</button>').join('')+'</div>';
 return sectionHead(3,'ماتریس را برای تحلیل به کار ببرید. انتخاب نهایی باید همراه با دلیل، شواهد و حدود اختیار گروه باشد.')+
 '<h3>۱. آیا برای پاسخ پایدار، شیوه اصلی رسیدگی خسارت باید از اساس تغییر کند؟</h3>'+choices('core')+
 '<h3>۲. آیا ابتکار یا خدمت جدیدی خارج از فعالیت اصلی نیز باید ایجاد شود؟</h3>'+choices('outside')+
 (rec?'<div class="callout soft"><p><strong>نتیجه اولیه بر اساس دو پاسخ:</strong> '+rec.animal+' '+rec.name+' · '+rec.type+'</p><p>این فقط یک پیشنهاد تحلیلی است، نه تشخیص قطعی.</p></div>':'<div class="callout">پس از پاسخ به دو پرسش، نزدیک‌ترین گزینه ماتریس نمایان می‌شود.</div>')+
 '<h3>۳. انتخاب نهایی گروه</h3><div class="choice-grid">'+MODELS.map(m=>'<button type="button" class="choice'+(state.model===m.id?' selected':'')+'" data-model="'+m.id+'"><strong>'+m.animal+' '+m.name+'</strong><small>'+m.type+'</small></button>').join('')+'</div>'+
 (selected?'<div class="callout soft"><p><b>الگوی منتخب:</b> '+selected.name+'؛ '+selected.focus+'</p></div>':'')+
 field('why','دو دلیل روشن برای انتخاب‌تان بنویسید','چه نشانه‌هایی در سناریو وجود دارد؟ چرا سه گزینه دیگر اولویت کمتری دارند؟',true)+
 field('authority','کدام تصمیم در اختیار شماست و برای چه چیزی باید از مدیر حمایت بگیرید؟','مرز اختیار، نیازهای تصویب، وابستگی به ستاد یا فناوری',true)+
 mentor('اگر این راهبرد اشتباه باشد، اولین نشانه‌ای که به ما هشدار می‌دهد چیست؟ چگونه بدون سرزنش فرد، تصمیم را بازنگری می‌کنیم؟');
}
function step4(){
 const selected=MODELS.find(m=>m.id===state.model);
 return sectionHead(4,'خروجی اصلی گروه اینجاست: یک الگوی تاب‌آوری با اقدام‌های مشخص، مسئول پیگیری و معیار مشاهده‌پذیر.')+
 '<div class="callout soft"><p><b>الگوی گروه:</b> '+(selected?selected.animal+' '+selected.name+' · '+selected.type:'هنوز الگوی اصلی انتخاب نشده است؛ می‌توانید به گام قبلی برگردید.')+'</p></div>'+
 field('modelName','نام اختصاصی الگوی تاب‌آوری گروه شما','مثلاً سپر منعطف خسارت؛ نامی کوتاه و کاربردی')+
 field('promise','هدف رفتاری و عملیاتی الگو','مثلاً در اختلال سامانه، صداقت در اطلاع‌رسانی و دقت بررسی را حفظ کنیم',true)+
 '<h3>سه اقدام کوچک و قابل اجرا</h3><div class="field-grid">'+
 field('act1','اقدام اول | همین امروز','چه کاری؟ چه کسی؟ در چه زمانی؟',true)+
 field('act2','اقدام دوم | هفته نخست','چه کاری؟ چه کسی؟ در چه زمانی؟',true)+
 field('act3','اقدام سوم | اقدام پشتیبان','اگر فشار ادامه یافت چه می‌کنیم؟',true)+
 field('metric','از کجا می‌فهمیم بهتر شده‌ایم؟','مثلاً درصد پاسخ در موعد، کیفیت مستندسازی یا شکایات تکراری',true)+'</div>'+
 '<h3>محافظت از کیفیت و انسان</h3><div class="field-grid">'+
 field('support','برای اجرای الگو، چه حمایتی لازم داریم؟','منابع، آموزش، هماهنگی با سرپرست و ستاد',true)+
 field('guardrail','چه خط قرمزهایی را حفظ می‌کنیم؟','محرمانگی، انصاف، ضوابط بیمه، صحت تصمیم، سلامت تیم',true)+'</div>'+
 mentor('این طرح روی کاغذ خوب است؛ در شلوغ‌ترین روز شعبه هم می‌شود اولین قدم را انجام داد؟ چه چیزی را ساده‌تر کنیم؟');
}
function step5(){
 const m=MODELS.find(m=>m.id===state.model);
 const checks=[
 'به مسئله واقعی و شواهد آن پاسخ داده‌ایم، نه یک شعار کلی.',
 'اقدام‌ها در حدود اختیار گروه‌اند یا برای حمایت مدیریتی مسیر روشن دارند.',
 'کیفیت تصمیم خسارت، محرمانگی مشتری و سلامت اعضای تیم رعایت شده است.',
 'برای سه اقدام، صاحب کار و شاخص پیگیری مشخص کرده‌ایم.'
 ];
 return sectionHead(5,'خروجی را در ۹۰ ثانیه ارائه دهید؛ سپس گروه دیگری با چک‌لیست، بازخورد مشخص و سازنده ارائه کند.')+
 '<div class="callout soft"><h3>🎤 روایت ۹۰ ثانیه‌ای گروه</h3>'+
 '<p><b>مسئله:</b> '+esc(state.signal||'هنوز نشانه‌های آشوب ثبت نشده است.')+'</p>'+
 '<p><b>راهبرد:</b> '+(m?m.animal+' '+m.name:'هنوز انتخاب نشده است.')+'</p>'+
 '<p><b>الگوی ما:</b> '+esc(state.modelName||'هنوز نام‌گذاری نشده است.')+'</p>'+
 '<p><b>اقدام اول:</b> '+esc(state.act1||'هنوز نوشته نشده است.')+'</p>'+
 '<p><b>معیار بررسی:</b> '+esc(state.metric||'هنوز ثبت نشده است.')+'</p></div>'+
 '<h3>چک‌لیست مشاهده و بازخورد همتایان</h3>'+
 '<div class="check-grid">'+checks.map((q,i)=>'<label class="check-line"><input type="checkbox" data-check="'+i+'" '+(state.feedback.includes(i)?'checked':'')+'><span>'+q+'</span></label>').join('')+'</div>'+
 '<div class="field-grid">'+field('peerFeedback','قوی‌ترین نقطه طرح از نگاه همتایان','رفتار یا تصمیم مشخص و قابل مشاهده',true)+
 field('improvement','یک پیشنهاد عملی برای بهترشدن','قدم بعدی، شخص مسئول و موعد بازبینی',true)+'</div>'+
 '<div class="badge-line"><span>🏁 '+fa(state.done.length)+' نشان از ۶ مرحله</span><span>⭐ ارزش یادگیری: استدلال روشن و مسئولیت‌پذیری، نه امتیاز رقابتی</span></div>'+
 '<details class="callout"><summary style="cursor:pointer;font-size:18px;font-weight:850;color:#085b43">📄 مشاهده متن کامل گزارش گروه (قابل انتخاب و کپی)</summary><p style="font-size:14px;color:#49635a">این مسیر در اپ اندروید هم بدون دانلود فایل قابل استفاده است؛ برای رونوشت، متن را انتخاب کنید.</p><textarea readonly aria-label="گزارش کامل گروه" style="width:100%;min-height:300px;border:1px solid #b9d3c5;border-radius:12px;padding:14px;line-height:1.85;font:inherit;font-size:16px;background:#f9fcfa;resize:vertical;direction:rtl">'+esc(reportText())+'</textarea></details>'+
 '<div class="stage-actions"><button class="primary" type="button" data-action="download">↓ دریافت خروجی گروه</button>'+
 '<button class="secondary" type="button" data-action="copy">رونوشت گزارش گروه</button><button class="secondary" type="button" data-action="print">چاپ / ذخیره به‌صورت PDF</button></div>'+
 mentor('از کار گروهی امروز چه چیزی را با خود به محیط واقعی خسارت می‌برید؟ چه کسی مسئول پیگیری اولین اقدام است؟');
}
const STEPFNS=[step0,step1,step2,step3,step4,step5];
function groupHeader(){
 const done=state.done.length;
 return '<div class="course-banner"><div class="crumbs"><a href="'+COURSE+'">تمام گروه‌ها</a> ← گروه '+fa(GROUP)+'</div>'+
 '<nav class="mini-links" aria-label="ابزارهای گروه"><a class="ghost" href="'+COURSE+'?group='+GROUP+'&guide=1">🗺️ راهنمای مصور</a>'+
 '<a class="ghost" href="'+COURSE+'?group='+GROUP+'&handout=1">📚 جزوه علمی</a></nav></div>'+
 '<div class="group-hero"><div><div class="hero-eyebrow" style="background:#146d4d;color:#fff">گروه '+fa(GROUP)+' · ۵ شرکت‌کننده</div>'+
 '<h1>کارگاه طراحی تاب‌آوری</h1><p>دو ساعت نخست · استراتژی در محیط‌های آشوبناک</p></div><div class="group-icon" aria-hidden="true">🌱</div></div>'+
 '<div class="progress-box"><div class="progress-head"><span>پیشرفت گروه: '+fa(done)+' از ۶ مرحله</span><span> '+fa(Math.round(done/6*100))+'٪ تکمیل‌شده</span></div>'+
 '<div class="progress-meter" role="progressbar" aria-valuemin="0" aria-valuemax="6" aria-valuenow="'+done+'" aria-label="پیشرفت گروه"><span style="width:'+(done/6*100)+'%"></span></div></div>';
}
function group(){
 let step=Number(qs.get('step'));
 if(!Number.isInteger(step)||step<0||step>=STAGES.length)step=0;
 document.title='گروه '+fa(GROUP)+' | تاب‌آوری کارشناسان خسارت';
 APP.innerHTML=groupHeader()+
 '<nav class="stage-nav" aria-label="شش گام کارگاه">'+STAGES.map((s,i)=>
 '<a class="stage-link'+(step===i?' current':'')+(state.done.includes(i)?' done':'')+'" href="'+link(GROUP,i)+'" '+(step===i?'aria-current="step"':'')+'>'+
 '<span class="step-emoji" aria-hidden="true">'+s.icon+'</span><b>'+s.short+'</b><small>'+fa(s.mins)+' دقیقه</small></a>').join('')+'</nav>'+
 '<section class="workspace">'+STEPFNS[step]()+
 '<div class="stage-actions"><a class="secondary" href="'+(step?link(GROUP,step-1):COURSE)+'">'+(step?'→ گام قبل':'→ انتخاب گروه')+'</a>'+
 '<span class="save-message" id="saved">ثبت پاسخ‌ها فقط در همین دستگاه است</span>'+
 '<button type="button" class="primary" data-action="complete" data-step="'+step+'">'+
 (state.done.includes(step)?(step===5?'بازبینی خروجی ✓':'گام بعد ←'):(step===5?'تأیید پایان بخش اول ✓':'این گام انجام شد ✓'))+'</button></div></section>'+
 '<div class="callout amber"><p><strong>محرمانگی و همکاری:</strong> اطلاعات واقعی پرونده، شماره بیمه‌نامه یا مشخصات مشتری را وارد نکنید. پاسخ‌ها در همین دستگاه ذخیره می‌شوند و میان گوشی‌های اعضای گروه خودکار همگام نمی‌شوند؛ یک نفر مسئول ثبت و ارائه باشد.</p></div>';
}
function guide(){
 document.title='راهنمای مصور | گروه '+fa(GROUP)+' تاب‌آوری';
 APP.innerHTML=groupHeader()+
 '<div class="section-head"><div><h2>راهنمای مصور و گام‌به‌گام</h2><p>روی هر تصویر بزنید تا وارد همان مرحله شوید.</p></div></div>'+
 '<div class="guide-steps">'+STAGES.map((s,i)=>{
 const help=[
 'پنج نقش را تقسیم کنید و درباره معیار موفقیت گروه توافق کنید.',
 'با یک سناریوی خسارت شروع کنید؛ آشوب، پیامد و حدود اختیار را بنویسید.',
 'چهار استعاره را بخوانید و درباره پاسخ مناسب به دو سؤال کاربردی بحث کنید.',
 'با دو تصمیم ماتریس، راهبرد را انتخاب کنید و دلایل خود را بنویسید.',
 'یک الگوی اختصاصی با سه اقدام، منابع لازم و شاخص پیگیری بسازید.',
 'در ۹۰ ثانیه ارائه کنید، چک‌لیست همتایان را بگیرید و خروجی را ذخیره کنید.'
 ][i];
 return '<a class="guide-step" href="'+link(GROUP,i)+'"><span class="visual" aria-hidden="true">'+s.icon+'</span>'+
 '<h2>گام '+fa(i+1)+' · '+s.label+'</h2><p>'+help+'</p><div class="enter">'+fa(s.mins)+' دقیقه · ورود به مرحله ←</div></a>';
 }).join('')+'</div>'+
 '<div class="callout soft"><p><strong>شیوه منتورینگ:</strong> منتور با طرح پرسش، بازتاب نکات، به چالش کشیدن فرض‌ها و تسهیل گفت‌وگو کمک می‌کند؛ تصمیم نهایی، طراحی الگو و مسئولیت پیگیری بر عهده خود گروه است.</p></div>';
}
function handout(){
 document.title='جزوه علمی تاب‌آوری | گروه '+fa(GROUP);
 APP.innerHTML='<div class="course-banner no-print"><div class="crumbs"><a href="'+COURSE+'">گروه‌ها</a> ← <a href="'+link(GROUP,2)+'">گروه '+fa(GROUP)+'</a> ← جزوه</div>'+
 '<nav class="mini-links"><a class="ghost" href="'+link(GROUP,2)+'">← بازگشت به کارگاه</a><button class="secondary" data-action="print">چاپ / ذخیره PDF</button></nav></div>'+
 '<article class="paper"><span class="hero-eyebrow" style="background:#e9f4ec;color:#085b43">جزوه علمی گروه '+fa(GROUP)+'</span>'+
 '<h1>از استراتژی در آشوب تا تاب‌آوری حرفه‌ای در خسارت</h1>'+
 '<p><b>هدف:</b> تشخیص اختلال، بررسی دو تصمیم راهبردی و تدوین یک پاسخ گروهی متناسب با ظرفیت و اختیار تیم خسارت.</p>'+
 '<h2>۱. مفهوم کلیدی تاب‌آوری حرفه‌ای</h2>'+
 '<p>تاب‌آوری در محیط کار صرفاً «تحمل فشار توسط فرد» نیست؛ توانایی آماده‌شدن، سازگاری، حفظ کیفیت تصمیم، بازیابی پس از اختلال و یادگیری از تجربه است. بخشی از این ظرفیت به رفتار فرد و تیم مربوط می‌شود و بخشی نیز وابسته به بار کاری، حمایت مدیر، ابزارها و طراحی فرایند است. سازمان نباید همه مسئولیت شرایط نامناسب را بر دوش کارکنان بگذارد.</p>'+
 '<h2>۲. مدل چهارپاسخی در شرایط آشوبناک</h2>'+
 '<p>در کتاب <cite>Strategy in Turbulent Times</cite> نوشته Kurt Verweire، Koen Tackx و Walter Van Dyck، دو پرسش مهم مطرح می‌شود: آیا مدل اصلی کسب‌وکار حفظ یا تغییر می‌کند؟ و آیا نوآوری جدیدی خارج از هسته ایجاد می‌شود؟ از ترکیب پاسخ‌ها، چهار گزینه راهبردی حاصل می‌شود.</p>'+
 matrix()+'<div class="animal-grid">'+MODELS.map(modelCard).join('')+'</div>'+
 '<h2>۳. کاربرد مسئولانه برای کارشناس خسارت</h2>'+
 '<p>این چارچوب در اصل درباره استراتژی سازمانی است. یک گروه پنج‌نفره اختیار تغییر مدل کسب‌وکار شرکت را ندارد؛ بنابراین هر جا تصمیم فراتر از حدود اختیار است، باید به‌صورت پیشنهاد آزمایشیِ قابل ارجاع به مدیر یا ستاد بیان شود.</p>'+
 '<ul><li><b>حفظ کیفیت:</b> هر راهبرد باید با مقررات خسارت، مستندسازی درست و انصاف در برخورد سازگار بماند.</li>'+
 '<li><b>حفظ انسان:</b> بار کاری غیرقابل‌تحمل، خشونت کلامی مشتری و ابهام نقش، تنها با توصیه فردی به «صبوری بیشتر» اصلاح نمی‌شوند.</li>'+
 '<li><b>مراقبت از داده:</b> در تمرین فقط سناریوها و داده‌های فرضی استفاده کنید.</li>'+
 '<li><b>یادگیری تیمی:</b> پس از اجرا بپرسید چه چیزی جواب داده، چه چیزی جواب نداده و کدام فرض باید تغییر کند.</li></ul>'+
 '<h2>۴. چرخه تصمیم گروه</h2>'+
 '<div class="stages-preview">'+[
 ['🔎','شناخت نشانه'],['🧭','تشخیص دامنه'],['🐪','مقایسه گزینه‌ها'],['🛠️','اقدام کوچک'],['📏','سنجش نتیجه'],['🔁','بازنگری']
 ].map(x=>'<div class="preview-step"><span class="step-emoji">'+x[0]+'</span><b>'+x[1]+'</b></div>').join('')+'</div>'+
 '<h2>۵. راهنمای کوتاه طراحی الگوی گروهی</h2>'+
 '<ol><li>یک مسئله واقعی اما ناشناس‌شده انتخاب کنید.</li><li>مشخص کنید چه چیزی در اختیار تیم و چه چیزی خارج از اختیار آن است.</li>'+
 '<li>با ماتریس چهارگانه، یک گزینه اصلی و در صورت لزوم یک اقدام مکمل انتخاب کنید.</li><li>سه اقدام کوچک همراه با مسئول پیگیری و نشانه موفقیت بنویسید.</li>'+
 '<li>بازخورد گروه دیگر را بگیرید و از الگو در برابر انتقاد سازنده دفاع یا آن را اصلاح کنید.</li></ol>'+
 '<h2>۶. منابع و حدود علمی</h2>'+
 '<div class="ref-list"><ol>'+
 '<li>Verweire, K., Tackx, K., &amp; Van Dyck, W. <i>Strategy in Turbulent Times</i>. چارچوب چهار پاسخ راهبردی: <a href="https://www.vlerick.com/en/insights/how-to-be-successful-in-turbulent-times/" target="_blank" rel="noopener">Vlerick Business School</a></li>'+
 '<li>World Health Organization (2022). <i>WHO guidelines on mental health at work</i>. توصیه به اقدامات سازمانی و مشارکتی برای عوامل خطر روانی‌اجتماعی: <a href="https://www.ncbi.nlm.nih.gov/books/NBK586381/" target="_blank" rel="noopener">WHO Guidelines</a></li>'+
 '<li>WHO &amp; ILO (2022). <i>Mental health at work: Policy brief</i>. نقش بار کاری، کنترل شغل، حمایت اجتماعی و طراحی کار: <a href="https://www.ilo.org/sites/default/files/wcmsp5/groups/public/%40ed_protect/%40protrav/%40safework/documents/publication/wcms_856976.pdf" target="_blank" rel="noopener">WHO–ILO Policy Brief</a></li>'+
 '</ol></div>'+
 '<div class="callout amber"><p>این محتوا آموزشی است، تشخیص بالینی یا ارزیابی استاندارد تاب‌آوری فردی محسوب نمی‌شود. مثال‌ها اقتباس آموزشی برای حوزه خسارت‌اند و جایگزین دستورالعمل‌های رسمی بیمه البرز نیستند.</p></div></article>';
}
function reportText(){
 const scene=CASES[Number(state.scene)||0],m=MODELS.find(x=>x.id===state.model);
 const lines=[
 'خروجی کارگاه تاب‌آوری کارکنان – کارشناسان خسارت بیمه البرز',
 'گروه '+fa(GROUP)+' | دو ساعت اول دوره هشت‌ساعته',
 'سناریو: '+scene.title,
 'اعضای تیم: '+ROLE_NAMES.map((x,i)=>x+': '+(state.roles[i]||'ثبت نشده')).join('؛ '),
 'نشانه‌های آشوب: '+nl(state.signal),
 'پیامدهای بی‌اقدامی: '+nl(state.impact),
 'در اختیار تیم: '+nl(state.control),
 'خارج از اختیار: '+nl(state.limits),
 'راهبرد اصلی: '+(m?m.name+' – '+m.type:'تعیین نشده'),
 'دلیل انتخاب: '+nl(state.why),
 'حدود اختیار و حمایت: '+nl(state.authority),
 'نام الگوی اختصاصی: '+nl(state.modelName),
 'هدف: '+nl(state.promise),
 'اقدام ۱: '+nl(state.act1),
 'اقدام ۲: '+nl(state.act2),
 'اقدام ۳: '+nl(state.act3),
 'شاخص پیگیری: '+nl(state.metric),
 'حمایت موردنیاز: '+nl(state.support),
 'خط قرمزها: '+nl(state.guardrail),
 'بازخورد همتایان: '+nl(state.peerFeedback),
 'گام اصلاحی: '+nl(state.improvement),
 'مراحل تکمیل‌شده: '+fa(state.done.length)+' از ۶',
 'یادداشت: این گزارش فقط از پاسخ‌های ذخیره‌شده روی همین دستگاه ساخته شده است.'
 ];
 return lines.join('\n\n');
}
function copyReport(){
 const content=reportText();
 if(navigator.clipboard&&navigator.clipboard.writeText){
  navigator.clipboard.writeText(content).then(()=>{const e=document.getElementById('saved');if(e)e.textContent='گزارش کپی شد ✓';}).catch(()=>window.prompt('متن گزارش را کپی کنید:',content));
 }else window.prompt('متن گزارش را کپی کنید:',content);
}
function downloadReport(){
 const str=reportText();
 const blob=new Blob(['\ufeff',str],{type:'text/plain;charset=utf-8'});
 const url=URL.createObjectURL(blob);const a=document.createElement('a');
 a.href=url;a.download='alborz-resilience-group-'+GROUP+'.txt';
 document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1500);
}
APP.addEventListener('input',e=>{
 const el=e.target;
 if(el.matches('[data-field]')){state[el.dataset.field]=el.value;save();}
 if(el.matches('[data-role]')){state.roles[Number(el.dataset.role)]=el.value;save();}
});
APP.addEventListener('change',e=>{
 const el=e.target;
 if(el.matches('[data-check]')){
  const index=Number(el.dataset.check);
  state.feedback=state.feedback.filter(i=>i!==index);
  if(el.checked)state.feedback.push(index);
  save();
 }
});
APP.addEventListener('click',e=>{
 const btn=e.target.closest('button');if(!btn || !APP.contains(btn))return;
 if(btn.dataset.action==='print'){window.print();return;}
 if(btn.dataset.action==='copy'){copyReport();return;}
 if(btn.dataset.action==='download'){downloadReport();return;}
 if(btn.dataset.action==='complete'){
  const step=Number(btn.dataset.step);
  if(!state.done.includes(step))state.done.push(step);
  save();
  location.href=link(GROUP,Math.min(5,step+1));
  return;
 }
 if(btn.hasAttribute('data-case')){state.scene=Number(btn.dataset.case);save();group();return;}
 if(btn.hasAttribute('data-quiz')){
  state['quiz'+btn.dataset.quiz]=btn.dataset.answer;save();group();return;
 }
 if(btn.hasAttribute('data-decision')){
  state[btn.dataset.decision]=btn.dataset.answer;save();group();return;
 }
 if(btn.hasAttribute('data-model')){state.model=btn.dataset.model;save();group();return;}
});
function start(){
 if(!GROUP){landing();return;}
 if(qs.get('handout')==='1'){handout();return;}
 if(qs.get('guide')==='1'){guide();return;}
 group();
}
start();
})();