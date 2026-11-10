'use strict';
(function classroomApp(){
'use strict';
const params=new URLSearchParams(location.search);
if(params.get('classroom')!=='1')return;
const W=window.AlborzWorkshop,L=window.AlborzLive,root=document.getElementById('classroom-screen');
if(!W||!L||!root)return;
const C=W.catalog,labels=['شتر','ماهی آزاد','آفتاب‌پرست','اختاپوس'],animals=['🐪','🐟','🦎','🐙'];

/* Individual Resilience Alignment | 2026-11-10 | classroom-only, no DB migration.
 * These four strategies are educational analogies adapted from Verweire's
 * ORGANIZATIONAL framework; they are NOT validated psychological scales.
 * Never modify an existing identity, team, access token or stored progress.
 */
(function alignIndividualResilience(){
 const profiles=[
 {
  title:'حفظ دقت زیر فشار', line:'شتر · روش معتبر، مدیریت انرژی و بازیابی',
  meaning:'روش اصلی رسیدگی هنوز مؤثر است. در فشار، همان روش را با اولویت‌بندی، مرزبندی و بازیابی انرژی ادامه می‌دهم.',
  when:'ازدحام مقطعی و قطع کوتاه سامانه، زمانی که روش اصلی بررسی مدارک همچنان درست است.',
  boundary:'وقتی روش اصلی بارها شکست می‌خورد، ادامه همان روش به‌تنهایی راه‌حل نیست.',
  mistake:'تحمل بی‌وقفه فشار یا حذف کنترل‌های ضروری، تاب‌آوری نیست.',
  core:'حفظ روش معتبر + حفاظت از توان فردی',
  aim:'در ازدحام، دقت خود را از دست ندهم و فشار یک پرونده را به پرونده بعدی منتقل نکنم.',
  setting:'صبح دوشنبه ۳۰ نفر در صف مراجعه‌کنندگان خسارت ثالث منتظرند و سامانه موقتاً کند است. یک نفر با صدای بلند می‌گوید: «شما هیچ کاری نمی‌کنید!»',
  facts:['روش کنترل مدارک همچنان معتبر است.','اجازه حذف کنترل‌ها یا قول پرداخت قطعی ندارید.','برای ثبت موقت فقط مسیر مصوب شرکت مجاز است.'],
  ask:'چطور همان روش دقیق را حفظ کنم و در عین حال آرامش و توانم را بازیابی کنم؟',
  answers:['ازدحام و اتهام مستقیم، توجه و انرژی مرا کم کرده است؛ فشار اصلی، هم‌زمانی صف و تنش کلامی است.','یک پرونده را در هر نوبت بررسی می‌کنم؛ نقص مدرک را روشن می‌گویم، زمان پیگیری می‌دهم و برای ثبت فقط از روش مجاز استفاده می‌کنم.','بعد از پایان گفت‌وگو، چند دم‌وبازدم آرام، یک مکث کوتاه و مرور مدارک پرونده بعدی کمک می‌کند توجه خود را دوباره تنظیم کنم.'],
  actions:[['تفکیک پرونده‌های کامل و ناقص',2,'بار ذهنی کمتر و کنترل مدارک حفظ می‌شود.'],['اطلاع‌رسانی وضعیت و زمان پیگیری واقعی',1,'فشار ابهام کم می‌شود؛ وعده نتیجه نمی‌دهم.'],['مکث و تنظیم تنفس بین دو مراجعه',1,'تنش پرونده قبل را منتقل نمی‌کنم.'],['استفاده از مسیر ثبت موقت مصوب',2,'دقت مستندات حفظ می‌شود.']],
  shock:'مراجع بعدی عصبانی است و هم‌زمان سامانه دوباره کند می‌شود. بدون حذف کنترل‌ها، کدام اقدام را حفظ می‌کنی؟',
  talk:['مراجع: «سه بار آمدم؛ امروز پرداخت می‌کنید یا نه؟»','کارشناس: «می‌دانم پیگیری تکراری خسته‌کننده است. هنوز نتیجه قطعی نداریم. همین حالا مدارک را کنترل می‌کنم و زمان پیگیری را دقیق می‌گویم.»','همکار: «صف شلوغ است؛ لازم نیست بعضی مدارک را رد کنیم؟»','کارشناس: «نه، کنترل را حذف نمی‌کنیم. پرونده‌های کامل و ناقص را جدا می‌کنم.»','مشاهده‌گر: «قبل از پرونده بعدی چه می‌کنی؟»','کارشناس: «یک مکث کوتاه می‌کنم و ذهنم را به پرونده تازه برمی‌گردانم.»'],
  recovery:'روش بررسی ثابت ماند، پاسخ‌گویی روشن شد و کارشناس با یک وقفه کوتاه، تمرکز خود را بازیابی کرد.'
 },
 {
  title:'مسیر تازه برای یادگیری', line:'ماهی آزاد · کار اصلی ثابت، مسیر یادگیری مستقل',
  meaning:'رسیدگی معمول را با همان روش مؤثر انجام می‌دهم و در کنار آن یک مسیر تازه و متمایز برای یادگیری یا اقدام نوآورانه شخصی ایجاد می‌کنم.',
  when:'وقتی خدمت فعلی درست پیش می‌رود اما فشار تکراری یک مهارت تازه را ضروری کرده است.',
  boundary:'تغییر یک جمله یا سرعت دادن به همان کار، مسیر مستقل تازه ایجاد نمی‌کند.',
  mistake:'نوآوری شخصی به معنای راه‌اندازی خدمت یا کسب‌وکار جدید بدون اختیار نیست.',
  core:'حفظ رسیدگی مؤثر + یک مسیر جداگانه یادگیری',
  aim:'کیفیت کار روزمره را حفظ کنم و برای برخورد با تماس‌های دشوار مهارت تازه بسازم.',
  setting:'در خسارت درمان، بررسی مدارک درست پیش می‌رود اما تماس‌های مکرر و لحن تند برخی مراجعان، پایان روز ذهنم را درگیر می‌کند.',
  facts:['روش کنترل مدارک همچنان درست است.','تغییر روند رسمی رسیدگی در اختیار کارشناس نیست.','می‌توان تجربه‌های بی‌نام را برای یادگیری شخصی و بازخورد همکار ثبت کرد.'],
  ask:'چطور رسیدگی فعلی را حفظ کنم و یک مسیر مستقل برای رشد توان برخورد با فشار بسازم؟',
  answers:['فشار از تکرار گفت‌وگوهای دشوار و ادامه یافتن ذهنی آن‌ها بعد از تماس می‌آید.','با روش فعلی پرونده‌ها را بررسی می‌کنم؛ جداگانه یک دفترچه بی‌نام از موقعیت‌های دشوار و جمله‌های مؤثر می‌سازم و برای بازخورد با همکار تمرین می‌کنم.','در پایان روز یک آموخته کوتاه ثبت می‌کنم، کار را ذهنی می‌بندم و زمان بازیابی خارج از کار را حفظ می‌کنم.'],
  actions:[['ادامه کنترل مدارک طبق روش فعلی',1,'کیفیت اصلی خدمت حفظ می‌شود.'],['ثبت بی‌نام دو موقعیت دشوار در دفتر یادگیری',2,'مسیر یادگیری مستقل شکل می‌گیرد.'],['گفت‌وگوی کوتاه یادگیری با همکار',2,'یک پاسخ تازه را تمرین می‌کنم.'],['تعیین زمان پایان مرور ذهنی پرونده',1,'بازیابی روانی از کار جدا می‌شود.']],
  shock:'هفته بعد حجم تماس بیشتر می‌شود و فرصت یادگیری کم است. چگونه مسیر اصلی را حفظ می‌کنی و یادگیری مستقل را واقع‌بینانه ادامه می‌دهی؟',
  talk:['مراجع: «چرا هر بار توضیح می‌دهم؟»','کارشناس: «این بار وضعیت مدارک و قدم بعدی را مشخص می‌کنم.»','همکار: «دیروز هم از این تماس‌ها خسته بودی.»','کارشناس: «کار اصلی را ادامه می‌دهم؛ جداگانه هر روز یک موقعیت بی‌نام را ثبت می‌کنم تا جمله‌های مناسب‌تر را تمرین کنیم.»','مشاهده‌گر: «این مسیر تازه چه تفاوتی دارد؟»','کارشناس: «پرونده را مثل قبل رسیدگی می‌کنم؛ دفتر یادگیری، فعالیت مستقلی برای توسعه مهارت من است.»'],
  recovery:'کیفیت رسیدگی حفظ شد و یک مسیر مستقل یادگیری شکل گرفت تا فشار تکراری به توان حرفه‌ای تبدیل شود.'
 },
 {
  title:'روش قدیمی دیگر جواب نمی‌دهد', line:'آفتاب‌پرست · تغییر روش اصلی فرد',
  meaning:'وقتی روش اصلی من دیگر کارآمد نیست، نحوه رسیدگی شخصی خود را اساساً بازطراحی می‌کنم؛ نه فقط لحنم را تغییر دهم.',
  when:'پیگیری واکنشی و موردبه‌مورد، به‌صورت تکراری باعث دوباره‌کاری، اضطراب و خطا شده است.',
  boundary:'تغییر لحن یا یک جمله، تغییر بنیادین روش کار نیست.',
  mistake:'بدون اختیار، رویه رسمی شرکت یا مسئولیت واحد دیگر را تغییر نمی‌دهم.',
  core:'جایگزینی روش اصلی ناکارآمد با روش حرفه‌ای جدید در اختیار خودم',
  aim:'از پیگیری واکنشی و فرساینده به رسیدگی منظم و مستند در محدوده اختیاراتم بروم.',
  setting:'در خسارت بدنه، هر روز به تماس‌ها یکی‌یکی و بدون یادداشت یکپارچه پاسخ می‌دهم؛ همان پرونده چند بار باز می‌شود و در پایان روز چیزهایی را فراموش می‌کنم.',
  facts:['پیگیری پراکنده در چند هفته تکرار شده است.','چک‌لیست رسمی مدارک موجود است و باید رعایت شود.','می‌توان روش شخصی برنامه‌ریزی و ثبت پیگیری‌ها را تغییر داد.'],
  ask:'کدام بخش روش اصلی خودم باید واقعاً عوض شود تا دوباره‌کاری و فشار کمتر شود؟',
  answers:['فشار اصلی از رفت‌وبرگشت پرونده‌ها و تکیه بر حافظه به‌جای ثبت منظم است.','روش واکنشی را کنار می‌گذارم؛ هر پرونده را با چک‌لیست رسمی، فهرست یکجای نواقص و زمان پیگیری ثبت‌شده مدیریت می‌کنم.','در انتهای هر بازه کار، فهرست پرونده‌های باز را می‌بندم و برای شروع پرونده بعدی اولویت روشن تعیین می‌کنم.'],
  actions:[['کنار گذاشتن پیگیری پراکنده و حافظه‌محور',2,'روش قدیمی واقعاً تغییر می‌کند.'],['استفاده منظم از چک‌لیست رسمی در شروع هر پرونده',2,'روش جایگزین قابل تکرار می‌شود.'],['ثبت یکجای نواقص و نوبت پیگیری',1,'رفت‌وبرگشت کمتر می‌شود.'],['مرور کوتاه پرونده‌های باز در پایان بازه',1,'ذهن از کار ناتمام رها می‌شود.']],
  shock:'مراجع جدید مدرک دیگری می‌آورد و دو پرونده قبلی باز مانده‌اند. چگونه روش جدید را حفظ می‌کنی؟',
  talk:['مراجع: «باز هم مدرک جدید می‌خواهید؟»','کارشناس: «بگذارید طبق چک‌لیست رسمی تمام نواقص را یکجا بررسی و ثبت کنیم.»','همکار: «قبل‌تر هر تماس را جدا پیگیری می‌کردی.»','کارشناس: «آن روش باعث دوباره‌کاری بود؛ حالا فهرست نواقص و زمان پیگیری را برای هر پرونده ثبت می‌کنم.»','مشاهده‌گر: «این فقط تغییر لحن نیست؟»','کارشناس: «نه؛ ترتیب و منطق اصلی رسیدگی شخصی‌ام عوض شده است.»'],
  recovery:'با تغییر واقعی روش اصلی، ابهام و دوباره‌کاری کاهش یافت و ذهن کارشناس نظم و آرامش بیشتری گرفت.'
 },
 {
  title:'تغییر روش و یادگیری هم‌زمان', line:'اختاپوس · روش تازه + مسیر نوآوری مستقل',
  meaning:'هم روش اصلی ناکارآمد خود را تغییر می‌دهم و هم یک مسیر تازه و متمایز برای یادگیری یا آزمودن اقدام نوآورانه ایجاد می‌کنم.',
  when:'فشار مزمن هم به اصلاح بنیادی روش کار و هم به ظرفیت‌سازی تازه نیاز دارد.',
  boundary:'صرفاً انجام چند کار هم‌زمان یا شلوغ‌تر شدن برنامه، اختاپوس نیست.',
  mistake:'هر دو مسیر باید کوچک، در اختیار فرد، دارای زمان مشخص و سازگار با محرمانگی باشند.',
  core:'تغییر روش اصلی + ایجاد مسیر یادگیری مستقل',
  aim:'هم دوباره‌کاری را با روش جدید کم کنم و هم برای رویارویی با فشار آینده مهارتی تازه بسازم.',
  setting:'در خسارت اموال، پس از حادثه گسترده، تماس‌ها زیاد و روش یادداشت‌برداری پراکنده من ناکارآمد شده است. پس از پایان هر روز هم تنش به خانه منتقل می‌شود.',
  facts:['روش پیگیری حافظه‌محور خطا و دوباره‌کاری ایجاد کرده است.','چک‌لیست رسمی و ابزار ثبت مجاز در اختیار کارشناس است.','می‌توان در کنار کار، مسیر مستقل تمرین مدیریت گفت‌وگوهای پرتنش ایجاد کرد.'],
  ask:'چه تغییری در روش اصلی و چه مسیر یادگیری جداگانه‌ای با هم لازم است؟',
  answers:['فشار هم از حجم پرونده‌ها و هم از روش ناکارآمد پیگیری و انتقال تنش به بعد از کار ناشی می‌شود.','روش اصلی را به ثبت ساختاریافته و اولویت‌بندی تبدیل می‌کنم؛ هم‌زمان، یک مسیر کوتاه و مستقل تمرین گفت‌وگو و بازخورد با همکار ایجاد می‌کنم.','پایان هر نوبت، پرونده‌های باز را مرور می‌کنم و سپس با مکث و خروج ذهنی از کار، فرصت بازیابی را حفظ می‌کنم.'],
  actions:[['جایگزین کردن ثبت پراکنده با پیگیری ساختاریافته',2,'روش اصلی واقعاً تغییر می‌کند.'],['اولویت‌بندی پرونده‌ها با معیارهای رسمی',1,'خطا و آشفتگی کاهش می‌یابد.'],['ایجاد تمرین مستقل هفتگی برای گفت‌وگوی دشوار',2,'مسیر یادگیری تازه شکل می‌گیرد.'],['مرور کوتاه و بستن ذهنی نوبت کار',1,'فشار به پرونده یا خانه منتقل نمی‌شود.']],
  shock:'در یک روز شلوغ، همکار فرصت تمرین ندارد. چگونه روش اصلی جدید را نگه می‌داری و مسیر یادگیری را بدون فشار اضافی ادامه می‌دهی؟',
  talk:['همکار: «با این همه پرونده دیگر فرصت نداریم.»','کارشناس: «اول روش ثبت و اولویت‌بندی خودم را عوض می‌کنم تا دوباره‌کاری کمتر شود.»','مراجع: «پس وضعیت پرونده من چیست؟»','کارشناس: «طبق فهرست جدید، اقدام بعدی و زمان پیگیری را مشخص می‌کنم.»','مشاهده‌گر: «مسیر دوم چیست؟»','کارشناس: «جدا از رسیدگی روزانه، هفته‌ای یک گفت‌وگوی دشوار فرضی را با همکار تمرین می‌کنم؛ با اطلاعات واقعی مشتری کار نمی‌کنیم.»'],
  recovery:'روش اصلی اصلاح شد؛ مسیر مستقل یادگیری هم شکل گرفت، بدون اینکه چندوظیفگی یا فرسودگی بیشتر هدف باشد.'
 }];
 const observation=[
 'الان دقیقاً چه چیزی به من فشار می‌آورد؟',
 'در این موقعیت چه اقداماتی واقعاً در اختیار خودم است؟',
 'بعد از این موقعیت چطور تمرکز و آرامشم را بازیابی کنم تا فشار به پرونده بعدی منتقل نشود؟'
 ];
 profiles.forEach((p,i)=>{
   const model=C.models[i],m=C.missions[i],d=C.cases[i],lesson=C.mastery[i]?.lesson;
   model[2]=i<2?'حفظ روش اصلی':'تغییر روش اصلی';
   model[3]=i%2?'مسیر تازه مستقل':'بدون مسیر تازه مستقل';
   model[4]=p.core;
   model[5]=p.meaning;
   model[6]='فشار: '+p.setting+' اقدام: '+p.answers[1]+' بازیابی: '+p.answers[2];
   model[7]=p.mistake; model[8]=p.answers[1];
   Object.assign(m,{title:p.title,line:p.line,brief:p.setting,actions:p.actions,shock:p.shock,
     info:[p.facts[0],p.facts[1],p.facts[2],'همکار فقط بازخورد می‌دهد؛ جایگزین تصمیم کارشناس نمی‌شود.','مشاهده‌گر سه چیز را بررسی می‌کند: فشار، اقدام در اختیار فرد، بازیابی.'],
     dialog:p.talk});
   Object.assign(d,{goal:p.aim,situation:p.setting,facts:p.facts,task:'گفت‌وگوی شفاهی؛ نوشتن اجباری نیست.',question:p.ask,individualAnswers:p.answers,individualQuestions:observation});
   if(lesson)Object.assign(lesson,{definition:p.meaning,condition:p.when,boundary:p.boundary,error:p.mistake,core:p.core,
     actions:[p.actions[0][0],p.actions[1][0],p.actions[3][0]],question:p.ask,takeaway:p.recovery});
   if(C.mastery[i]){
     const names=['مینا','آرمان','بهاره','سارا','نیما'];
     const roles=['کارشناس خسارت','مراجع فرضی','همکار واحد خسارت','سرپرست','مشاهده‌گر'];
     C.mastery[i].people=roles.map((role,j)=>({
       name:names[j],role,goal:j===0?p.aim:j===1?'پاسخ دقیق و محترمانه بگیرم':j===4?'رفتار قابل مشاهده را بررسی کنم':'از کیفیت رسیدگی پشتیبانی کنم',
       concern:j===0?'حفظ دقت و آرامش زیر فشار':'درست انجام شدن گام بعدی',
       style:j===1?'ناراحت اما واقع‌گرا':'طبیعی و کوتاه',
       cue:j===0?p.answers[1]:j===4?'به سه بخش فشار، اقدام و بازیابی بازخورد بده.':'به پاسخ و اقدام واقع‌گرایانه کمک کن.'
     }));
     const closure=[
       ['سرپرست: «برای حفظ دقت در این ازدحام چه پشتیبانی لازم داری؟»','کارشناس: «اولویت‌ها را روشن می‌کنم و از مسیر مصوب پیش می‌روم؛ بعد از هر مراجعه هم تمرکزم را بازیابی می‌کنم.»'],
       ['سرپرست: «مسیر تازه یادگیری تو چگونه از رسیدگی روزانه جدا می‌ماند؟»','کارشناس: «رسیدگی فعلی را حفظ می‌کنم و جداگانه هر هفته یک گفت‌وگوی دشوار بی‌نام را با همکار تمرین می‌کنم.»'],
       ['سرپرست: «چه چیزی در روش اصلی خودت واقعاً تغییر کرده است؟»','کارشناس: «به‌جای اتکا به حافظه و پاسخ واکنشی، از ثبت ساختاریافته و پیگیری زمان‌بندی‌شده استفاده می‌کنم.»'],
       ['سرپرست: «تفاوت دو مسیر تغییر در برنامه تو چیست؟»','کارشناس: «ثبت و اولویت‌بندی پرونده‌ها را عوض کرده‌ام؛ تمرین هفتگی گفت‌وگو یک مسیر یادگیری مستقل است.»']
     ][i];
     C.mastery[i].after=p.talk.concat(closure).map((t,j)=>({p:[1,0,2,0,4,0,3,0][j%8],t:t.replace(/^[^:]+:\s*/, '')}));
   }
   if(C.embedded?.[i])Object.assign(C.embedded[i],{
      anger:'شناخت نشانه‌های خشم هنگام فشار این پرونده و مکث قبل از پاسخ',
      assertion:'مرزبندی محترمانه، بیان محدودیت اختیار و پیشنهاد اقدام مجاز',
      first:'مراجع: «همه چیز تقصیر شماست!» / کارشناس: «دیگر خسته شدم؛ صبر کنید!»',
      second:'کارشناس: «می‌دانم انتظار دشوار است. اجازه بدهید وضعیت مدرک و اقدام بعدی را دقیق روشن کنیم؛ قول پرداخت قطعی نمی‌دهم.»',
      check:'آیا فرد فشار را شناخت، بدون پرخاش مرز گذاشت و برای بازیابی تمرکز مکث کرد؟',
      twist:p.shock
   });
 });
 // Ten individual-level, evidence-based classroom decisions; each option has its own explanation.
 const quiz=[
 ['مراجعی با صدای بلند اصرار به پرداخت فوری دارد.', 'شتر: بررسی مدارک طبق رویه، مرزبندی و مکث کوتاه.', 'قول پرداخت امروز برای آرام کردن او.', 'حذف کنترل مدارک برای پایان صف.'],
 ['بررسی پرونده‌ها درست است ولی تماس‌های دشوار هر روز شما را خسته می‌کند.', 'ماهی آزاد: حفظ بررسی فعلی و ایجاد دفتر مستقل یادگیری گفت‌وگو.', 'تغییر تنها یک کلمه در پاسخ معمول.', 'متوقف کردن رسیدگی جاری و شروع خدمت جدید.'],
 ['ثبت حافظه‌محور چند هفته است دوباره‌کاری ایجاد می‌کند.', 'آفتاب‌پرست: جایگزین کردن روش اصلی با ثبت ساختاریافته.', 'فقط مؤدبانه‌تر حرف زدن.', 'ادامه همان روش و بیشتر کار کردن.'],
 ['روش ثبت پراکنده ناکارآمد است و توان گفت‌وگو در فشار هم باید تقویت شود.', 'اختاپوس: تغییر روش ثبت + مسیر جداگانه یادگیری.', 'پاسخ دادن به چند پرونده هم‌زمان.', 'فقط برگزاری یک گفت‌وگوی انگیزشی.'],
 ['سرپرست می‌خواهد بدون کنترل مدرک، پاسخ قطعی بدهید.', 'محترمانه محدودیت اختیار را بگویم و بررسی مجاز پیشنهاد دهم.', 'برای جلوگیری از تنش فوراً موافقت کنم.', 'در برابر سرپرست و مشتری پرخاش کنم.'],
 ['پس از یک تماس سنگین، مراجعه‌کننده بعدی وارد می‌شود.', 'مکث کوتاه، تنظیم تنفس و مرور مشخصات پرونده تازه.', 'همان عصبانیت را در گفت‌وگوی جدید ادامه دهم.', 'پرونده بعدی را بدون نگاه به مدارک پاسخ دهم.'],
 ['مراجعی می‌گوید «شما همیشه کار را عقب می‌اندازید».', 'ابتدا فشار و نگرانی او را بازتاب دهم؛ سپس گام بعدی را روشن کنم.', 'بگویم «به من ربطی ندارد».', 'وعده نتیجه‌ای بدهم که اختیارش را ندارم.'],
 ['همکار از شما می‌خواهد اطلاعات پرونده فرد دیگری را نمایش دهید.', 'با احترام از افشای اطلاعات خودداری و مسیر مجاز را معرفی کنم.', 'برای حفظ رابطه اطلاعات را نشان بدهم.', 'بدون توضیح سرزنشش کنم.'],
 ['روش موجود یک بار در قطعی کوتاه سامانه کند شده است.', 'ابتدا موقتی بودن مشکل و کیفیت روش را بررسی کنم.', 'فوراً نتیجه بگیرم تمام روش کار باید تغییر کند.', 'همه کنترل‌ها را تا پایان قطعی کنار بگذارم.'],
 ['در پایان روز هنوز ذهن شما درگیر یک پرونده دشوار است.', 'مرور اقدام بعدی، بستن نوبت کاری و ایجاد فرصت بازیابی.', 'ادامه مرور ذهنی پرونده در خانه.', 'نادیده گرفتن نشانه‌های فرسودگی و اضافه‌کاری بی‌برنامه.']
 ];
 const facts=['حدود اختیار و مدارک باید رعایت شوند.','فعالیت اصلی مؤثر است؛ مسیر تازه باید متمایز باشد.','دوباره‌کاری تکراری نشان‌دهنده ناکارآمدی روش است.','دو تغییر واقعی و متمایز لازم است.','وعده خارج از اختیار ممنوع است.','تنش نباید به پرونده بعد منتقل شود.','همدلی به معنی تأیید ادعای اثبات‌نشده نیست.','محرمانگی حتی هنگام فشار حفظ می‌شود.','شاهد کافی برای تغییر بنیادی وجود ندارد.','بازیابی بخشی از حرفه‌ای‌بودن است.'];
 C.professionalQuiz.splice(0,C.professionalQuiz.length,...quiz.map((q,i)=>({
   stem:q[0], facts:[facts[i],'چه کاری در اختیار خود کارشناس است؟'],
   options:[
    {t:q[1],why:'مناسب‌تر است: '+facts[i]+' اقدام عملی در اختیار فرد و حفظ کیفیت کار را دربرمی‌گیرد.',correct:true},
    {t:q[2],why:'نامناسب است: این واکنش مشکل را حل نمی‌کند یا تمایز راهبرد و اختیار فرد را نادیده می‌گیرد.',correct:false},
    {t:q[3],why:'نامناسب است: ممکن است دقت، مرزبندی حرفه‌ای یا بازیابی توان فردی را تضعیف کند.',correct:false}
   ]
 })));
})();
function individualDiscussion(i){
 const c=C.cases[i],qs=c.individualQuestions||[],as=c.individualAnswers||[];
 return '<section class="individual-discussion" dir="rtl" style="font-size:18px;line-height:1.9">'+
 '<h3>سه پرسش برای گفت‌وگوی گروه</h3><p>هر پنج نفر نظر بدهند. هیچ پاسخ نوشتاری اجباری نیست.</p>'+
 qs.map((q,j)=>'<article style="margin:12px 0;padding:12px;border:1px solid #d6e5dc;border-radius:14px"><p><strong>'+E((j+1)+'. '+q)+'</strong></p><details><summary style="cursor:pointer;font-weight:700">پاسخ پیشنهادی</summary><p>'+E(as[j]||'')+'</p></details></article>').join('')+
 '<p>پس از جمع‌بندی شفاهی، یکی از اعضا دکمه «گام بعد» را بزند.</p></section>';
}

const names=['ورود و ثبت حضور گروه','معرفی چهار راهبرد','انتخاب مأموریت',...C.missionFlow,'جمع‌بندی و انتقال به کار'];
const keys=['camel','salmon','chameleon','octopus'];
const E=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const fa=n=>Number(n).toLocaleString('fa-IR');
const formatText=x=>E(x||'هنوز پاسخی ثبت نشده است');
const requested=keys.indexOf(params.get('mission'));
let identity=L.identity(),rows=[],assignedCount=0,assignedCounts=null,stage=0,stageVersion=0,classroomRound=0,reference=requested>=0?requested:0,lastFingerprint='',notice='',busy=false,needsRefresh=false,openStep=0,previewStep=null,earlyMissionOpen=false,consensusDraft=null,previewDraft=null,consensusAgreed=false,consensusRound=0,projectedTeam=1,projectedMember=1,projectionMode=false,projectionSample=false;

function rec(team,key){return rows.find(r=>Number(r.team_no)===Number(team)&&r.field_key===key)||null;}
function val(team,key){return rec(team,key)?.field_value;}
function version(team,key){return rec(team,key)?.version??0;}
function groupChoice(team){const v=val(team,'missionChoice');return Number(val(team,'missionChoiceRound')??-1)===classroomRound&&Number.isInteger(v)&&v>=0&&v<=3?v:null;}
function usedMissions(team){return Array.from({length:classroomRound},(_,i)=>val(team,'missionRound'+i)).filter(Number.isInteger);}
function stepReady(team,phase=stage){return val(team,'classStepReady')===classroomRound+':'+phase;}
function readiness(){const active=groups().filter(confirmed),ready=active.filter(stepReady),waiting=active.filter(t=>!stepReady(t));return {active,ready,waiting};}
function size(team){const actual=identity?.role==='teacher'?assignedCounts?.[team]:(team===identity?.team?assignedCount:null);if(Number.isInteger(actual))return actual;const v=val(team,'groupSize');return [3,4,5].includes(v)?v:0;}
function confirmed(team){return size(team)>=3;}
function checkin(team,j){return val(team,'checkin'+j)===true;}
function attendance(team){return Array.from({length:5},(_,j)=>checkin(team,j+1)).filter(Boolean).length;}
function groups(){return Array.from({length:10},(_,i)=>i+1);}
function clearNotice(){notice='';}
function alertUser(text,error=false){notice=text;let el=root.querySelector('#classroom-feedback');if(el){el.textContent=text;el.classList.toggle('is-error',error);}else render(true);}
function className(){return identity?.role==='teacher'?'مدرس کارگاه':'گروه '+fa(identity?.team||0)+' · عضو '+fa(identity?.member||0);}
function strategyContrast(compact=false){
 const comparisons=[
 ['🐪','شتر','بله؛ روش فعلی درست است','خیر','بدنه و شخص ثالث؛ صف یک‌روزه شلوغ شده'],
 ['🐟','ماهی آزاد','بله؛ روش فعلی درست است','بله؛ خدمت جداگانه','ناوگان طرف قرارداد؛ خدمت مستقلِ پیشگیری از توقف'],
 ['🦎','آفتاب‌پرست','خیر؛ روش باید بازطراحی شود','خیر','درمان تکمیلی؛ مدارک ماه‌ها برگشت می‌خورند'],
 ['🐙','اختاپوس','خیر؛ روش باید بازطراحی شود','بله؛ خدمت جداگانه','اموال تجاری؛ اصلاح ارزیابی خسارت + خدمت مستقل پیشگیری ریسک']
 ];
 return '<section class="classroom-strategy-comparison"><h3>چهار راهبرد؛ چهار تصمیم متفاوت</h3><p>دو سؤال بپرسید: آیا روش فعلی رسیدگی جواب می‌دهد؟ آیا خدمت مستقلی بیرون از رسیدگی معمول شکل می‌گیرد؟</p><div class="classroom-contrast-grid">'+comparisons.map((r,i)=>'<article class="contrast-item contrast-'+i+'"><div class="contrast-head"><span role="img" aria-label="'+E(r[1])+'">'+r[0]+'</span><h4>'+r[1]+'</h4></div><p><b>رسیدگی فعلی:</b> '+r[2]+'</p><p><b>خدمت مستقل:</b> '+r[3]+'</p><p class="contrast-example"><b>نمونه خسارت:</b> '+r[4]+'</p></article>').join('')+'</div>'+(compact?'':'<p class="contrast-note">این استعاره‌ها از یک چارچوب راهبردی سازمانی برای بحث آموزشی اقتباس شده‌اند؛ آزمون شخصیت یا تشخیص روان‌شناختی نیستند.</p>')+'</section>';
}
function caseIllustration(i){
 const icons=['🚗','🚚','🏥','🏢'],areas=['بدنه و شخص ثالث','ناوگان و مشتری طرف قرارداد','درمان تکمیلی','اموال و مشتریان تجاری'];
 return '<div class="classroom-case-art case-art-'+i+'"><span class="classroom-case-emoji" role="img" aria-label="'+E(areas[i])+'">'+icons[i]+'</span><div><strong>'+E(C.models[i][0]+' '+C.models[i][1])+'</strong><p>'+E(areas[i])+'</p></div></div>';
}
function masteryLessons(){
 return '<section class="mastery-lessons"><h3>چهار راهبرد تاب‌آوری</h3><p>برای انتخاب راهبرد، دو سؤال بپرسید: آیا روش اصلی من هنوز مؤثر است؟ آیا در کنار آن به یک مسیر تازه و متمایز برای یادگیری نیاز دارم؟ این چهار استعاره، اقتباس آموزشی از چارچوب سازمانی Kurt Verweire هستند؛ آزمون روان‌شناختی نیستند.</p><div class="mastery-matrix">'+
 C.mastery.map((m,i)=>'<div><strong>'+C.models[i][0]+' '+E(C.models[i][1])+'</strong><span>'+E(m.lesson.core)+'</span></div>').join('')+'</div>'+
 C.mastery.map((m,i)=>'<details class="mastery-lesson"><summary>'+C.models[i][0]+' '+E(C.models[i][1])+' · توضیح و مثال</summary><div class="mastery-lesson-body"><p><strong>معنای ساده:</strong> '+E(m.lesson.definition)+'</p><p><strong>شرایط کاربرد:</strong> '+E(m.lesson.condition)+'</p><p><strong>مرز با راهبردهای دیگر:</strong> '+E(m.lesson.boundary)+'</p><p><strong>اشتباه رایج:</strong> '+E(m.lesson.error)+'</p><p><strong>کاربرد در بیمه:</strong> '+E(C.models[i][6])+'</p><strong>سه اقدام مناسب</strong><ol>'+m.lesson.actions.map(x=>'<li>'+E(x)+'</li>').join('')+'</ol><p class="mastery-takeaway">'+E(m.lesson.takeaway)+'</p></div></details>').join('')+
 '<p class="mastery-source">اقتباس از چهار راهبرد سازمانی Kurt Verweire؛ این چارچوب آزمون شخصیت نیست.</p></section>';
}
function masteryRoles(i){
 const m=C.mastery[i],info=C.missions[i].info;
 return '<section class="mastery-roles"><h3>پنج کاراکتر این مأموریت</h3><p>هر نفر اطلاعات نقش خودش را بخواند و با هدف و نگرانی همان شخصیت در گفت‌وگو حضور پیدا کند. در گروه سه یا چهار‌نفره، بعضی افراد دو نقش می‌گیرند.</p><div class="mastery-person-grid">'+m.people.map((p,j)=>'<details class="mastery-person"><summary><span class="mastery-person-num">'+fa(j+1)+'</span><span><strong>'+E(p.name)+'</strong><small>'+E(p.role)+'</small></span></summary><div class="mastery-person-body"><p><b>هدف من:</b> '+E(p.goal)+'</p><p><b>نگرانی من:</b> '+E(p.concern)+'</p><p><b>اطلاعات اختصاصی:</b> '+E(info[j])+'</p><p><b>لحن و رفتار:</b> '+E(p.style)+'</p><p class="mastery-person-cue"><b>پاسخ احتمالی:</b> '+E(p.cue)+'</p></div></details>').join('')+'</div><p class="mastery-tip">تمرین پنج‌دقیقه‌ای: یک نفر نقش مشتری یا مدیر دشوار را اجرا کند و بقیه پاسخ حرفه‌ای بسازند؛ سپس نقش‌ها را عوض کنید. نام‌ها فرضی‌اند و داده واقعی پرونده را وارد تمرین نکنید.</p></section>';
}

function masteryTalk(i){
 const m=C.mastery[i];
 const summary=[
 'شتر: فشار موقتِ مراجعه در خسارت بدنه و شخص ثالث افزایش یافت؛ روش رسیدگی صحیح ماند و تیم با اولویت‌بندی، کنترل مدارک، تقسیم بار و بازیابی انرژی خدمت را حفظ کرد.',
 'ماهی آزاد: خدمت خسارت ناوگان به روش معمول ادامه پیدا کرد؛ در کنار آن یک خدمت پیشگیری مستقل با مشتری و مدل درآمد جداگانه، فقط به‌صورت فرضیه قابل‌آزمون بررسی شد.',
 'آفتاب‌پرست: در خسارت درمان، مشکل تکراریِ برگشت مدارک با تغییر مالک پرونده و مسیر تحویل میان ارزیابی و مالی اصلاح شد؛ خدمت تازه‌ای ساخته نشد.',
 'اختاپوس: در خسارت اموال، دو تغییر مستقل انجام شد: اصلاح روال بازدید و ارزیابی، و آزمون خدمت جداگانه پیشگیری ریسک؛ هر مسیر مالک، منابع و معیار خودش را داشت.'
 ][i];
 const line=(x,n,mode)=>'<article class="mastery-turn mastery-speaker-'+x.p+' '+mode+'"><div class="mastery-speaker"><span class="mastery-speaker-avatar">'+E(m.people[x.p].name.charAt(0))+'</span><div><strong>'+E(m.people[x.p].name)+'</strong><small>'+E(m.people[x.p].role)+'</small></div><em>'+fa(n+1)+'</em></div><p>'+E(x.t)+'</p></article>';
 return '<section class="mastery-dialogues"><h3>گفت‌وگوی نمونه · '+E(C.models[i][1])+'</h3>'+
 '<p>ابتدا یک اجرای سه‌تاپنج‌دقیقه‌ای داشته باشید؛ بعد نمونه زیر را بخوانید و تفاوت جمله‌ها را پیدا کنید.</p>'+
 '<details class="mastery-weak-dialog"><summary>گفت‌وگوی غیرمؤثر · تشخیص خطاها</summary><div class="mastery-dialogue">'+m.before.map((x,n)=>line(x,n,'weak')).join('')+'</div></details>'+
 '<h4 class="mastery-effective-heading">گفت‌وگوی حرفه‌ای · قابل بلندخوانی در کلاس</h4><div class="mastery-dialogue">'+m.after.map((x,n)=>line(x,n,'effective')).join('')+'</div>'+
 '<section class="mastery-final-analysis"><h4>تحلیل پایانی</h4><p>'+E(summary)+'</p><h4>چک‌لیست مشاهده و بازخورد</h4>'+
 '<ul>'+m.observer.map(o=>'<li><b>'+E(o.criterion)+'</b><p>'+E(o.evidence)+'</p></li>').join('')+'</ul>'+
 '<h4>سه سؤال برای گفت‌وگوی جمعی</h4><ol>'+m.debrief.map(x=>'<li>'+E(x)+'</li>').join('')+'</ol>'+
 '<p><b>اجرای دوباره:</b> نقش‌ها را عوض کنید و این بار یک جمله قابل مشاهده را بهتر اجرا کنید.</p></section></section>';
}
const singleAnswers=Object.create(null);
function assessmentKey(){return 'alborz-reflection-once-v1-'+(identity?.role==='team'?'group'+identity.team+'member'+identity.member:'instructor');}
function assessmentValues(){try{return JSON.parse(sessionStorage.getItem(assessmentKey())||'{}')}catch{return {}}}
function oneTimeAssessment(neutral=false){
 const labels=['در فشار، قبل از واکنش مسئله را دقیق تشخیص می‌دهم.','وعده خارج از اختیار نمی‌دهم و زمان پیگیری روشن ارائه می‌کنم.','اختلال موقت را از نقص ساختاری روش کار تمیز می‌دهم.','در کنار رسیدگی معمول، برای یادگیری از فشارهای تکراری برنامه جداگانه دارم.','هنگام محدودیت منابع، اولویت را شفاف و قابل دفاع بیان می‌کنم.','پس از اتفاق غیرمنتظره، تصمیمم را بر اساس شاهد تازه اصلاح می‌کنم.'];
 const saved=neutral?{}:assessmentValues(),count=labels.filter((_,i)=>Number(saved[i])>=1).length;
 return '<section class="mastery-lessons one-time-assessment"><h3>خودارزیابی من · فقط یک نوبت</h3><p>برای هر گزاره، رفتارتان در محیط کار را ارزیابی کنید. این یک ابزار یادگیری شخصی است؛ قبل/بعد و رتبه‌بندی افراد نداریم. پاسخ‌ها فقط روی همین دستگاه نگهداری می‌شوند.</p><div class="one-assessment-items">'+labels.map((q,i)=>'<label><strong>'+fa(i+1)+'. '+E(q)+'</strong><select data-class-single-assessment="'+i+'"><option value="">انتخاب کنید</option>'+[1,2,3,4].map(v=>'<option value="'+v+'" '+(Number(saved[i])===v?'selected':'')+'>'+fa(v)+' · '+['به‌ندرت','گاهی','اغلب','تقریباً همیشه'][v-1]+'</option>').join('')+'</select></label>').join('')+'</div><p class="mastery-one-status" role="status">'+(count===6?'هر شش گزاره ثبت شد. این ارزیابی یک‌نوبتی است.':'پاسخ ثبت‌شده: '+fa(count)+' از ۶')+'</p></section>';
}
const professionalAnswers=Object.create(null);
function testKey(){return 'alborz-professional-ten-v1-'+(identity?.role==='team'?'group'+identity.team+'member'+identity.member:'instructor');}
function testAnswers(){try{return JSON.parse(sessionStorage.getItem(testKey())||'{}')}catch{return {}}}
function professionalTest(neutral=false){
 const saved=neutral?{}:testAnswers(),done=Object.keys(saved).filter(k=>C.professionalQuiz[Number(k)]).length;
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
 const intro=teacher?'برای ممیزی محتوا می‌توانید هر ۱۱ گام را مستقل باز کنید؛ در حالت پیش‌نمایش، مرحله گروه‌ها و پاسخ‌های آن‌ها تغییر نمی‌کند.':'هر گروه مستقل پیش می‌رود. بعد از انجام فعالیت و ثبت نتیجه، روی «گام بعد» بزنید؛ تأیید مدرس لازم نیست.';
 const preview=previewStep===null?'':'<div class="classroom-map-preview" role="status"><h3>گام '+fa(previewStep+1)+' · '+E(names[previewStep])+'</h3><p>'+(previewStep<stage?'این گام قبلاً طی شده است. فعالیت جاری را از گام مشخص‌شده با نشان «گام فعال» ادامه دهید.':'پس از تکمیل فعالیت قبلی، با دکمه «گام بعد» وارد این مرحله شوید.')+'</p></div>';
 return '<section class="classroom-map"><div class="classroom-map-intro"><span>مسیر مشترک تاب‌آوری</span><h2>مسیر کارگاه در ۱۱ گام</h2><p>'+intro+'</p></div><div class="classroom-map-grid" aria-label="فهرست کلیک‌پذیر یازده گام">'+cards+'</div>'+preview+'</section>';
}
function messageBox(){return '<p id="classroom-feedback" class="classroom-feedback" role="status">'+E(notice)+'</p>';}
function simpleTitle(kicker,title,description){return '<div class="classroom-section-title"><span>'+E(kicker)+'</span><h2>'+E(title)+'</h2>'+(description?'<p>'+E(description)+'</p>':'')+'</div>';}
function personDots(team){return '<div class="classroom-member-dots">'+Array.from({length:size(team)||5},(_,j)=>'<span class="'+(checkin(team,j+1)?'has-arrived':'')+'">عضو '+fa(j+1)+(checkin(team,j+1)?' ✓':' ○')+'</span>').join('')+'</div>';}
function rosterTeacher(){
 const ready=groups().filter(confirmed).length,attending=groups().reduce((n,t)=>n+attendance(t),0);
 return simpleTitle('مرحله شروع','گروه‌ها را آماده کنیم','کارشناسان با کد ملی وارد می‌شوند و گروه آن‌ها به‌صورت خودکار تعیین می‌شود. بسته به حضور واقعی، گروه‌ها می‌توانند سه، چهار یا پنج نفره باشند. پس از ثبت حضور، هر گروه را تأیید کن.')+
 '<div class="classroom-stats"><span>'+fa(ready)+' گروه تأیید‌شده</span><span>'+fa(attending)+' عضو حاضر</span></div>'+
 '<div class="classroom-team-list">'+groups().map(t=>{const n=size(t),c=attendance(t);return '<article class="classroom-team-row"><div><h3>گروه '+fa(t)+(confirmed(t)?'<small class="class-ready">آماده ✓</small>':'')+'</h3><p>'+fa(c)+' حضور ثبت‌شده · ظرفیت گروه: '+(n?fa(n):'هنوز مشخص نشده')+'</p>'+personDots(t)+'</div><label>ظرفیت گروه<select data-class-team-size="'+t+'"><option value="0" '+(!n&&!c?'selected':'')+'>فعال نیست</option>'+[3,4,5].map(v=>'<option value="'+v+'" '+(v===n||!n&&c>0&&v===Math.min(5,Math.max(3,c))?'selected':'')+'>'+fa(v)+' نفر</option>').join('')+'</select></label><button type="button" class="btn '+(confirmed(t)?'':'primary')+'" data-class-confirm="'+t+'">'+(confirmed(t)?'ثبت دوباره':'تأیید گروه')+'</button></article>';}).join('')+'</div>'+
 '<p class="classroom-footnote">برای هر گروه پنج جایگاه ثبت‌نام وجود دارد؛ مدرس می‌تواند با توجه به تعداد حاضران، گروه‌های سه تا پنج نفره را تأیید کند. ورود تکراری با همان کد ملی، همان گروه و همان شماره عضو را باز می‌کند.</p>';
}
function checkinParticipant(t=identity.team,m=identity.member){
 const count=attendance(t),done=checkin(t,m);
 return simpleTitle('مرحله ۱','گروه شما مشخص شد','نام گروه و شماره عضو هنگام ورود با کد ملی تعیین شده‌اند؛ لازم نیست گروه را دستی انتخاب کنی.')+
 '<div class="classroom-welcome"><div><small>شماره گروه</small><strong>'+fa(t)+'</strong></div><div><small>شماره عضو</small><strong>'+fa(m)+'</strong></div></div>'+
 '<div class="classroom-checkin"><h3>حضور خود را تأیید کن</h3><p>'+(done?'حضور تو ثبت شده است.':'پس از ورود، روی دکمه تأیید حضور بزن.')+'</p><button class="btn primary" data-class-checkin '+(done?'disabled':'')+'>'+(done?'حضور من ثبت شد ✓':'حضورم را تأیید می‌کنم')+'</button></div>'+
 personDots(t)+'<p class="classroom-wait">'+fa(count)+' عضو حضورشان را ثبت کرده‌اند. '+(confirmed(t)?'مدرس این گروه را تأیید کرده است.':'برای انتخاب مأموریت نیازی به تأیید مدرس ندارید.')+'</p>';
}
function strategyCards(){
 return '<div class="classroom-strategy-grid">'+C.models.map((m,i)=>'<article><span>'+m[0]+'</span><h3>'+E(m[1])+'</h3><strong>'+E(m[4])+'</strong><p>'+E(m[5])+'</p></article>').join('')+'</div>';
}
function strategyIntro(teacher,neutral=false){
 return simpleTitle('گام آشنایی','چهار راهبرد تاب‌آوری','تفاوت راهبردها را با مثال‌های خسارت ببینید؛ سپس در مورد انتخاب مناسب گفت‌وگو کنید.')+
 '<figure class="classroom-hero-figure"><img loading="lazy" src="assets/claims-resilience-approved-20261106.png" alt="پوستر رسمی کارگاه تاب‌آوری کارشناسان خسارت بیمه البرز"><figcaption>آکادمی مدیریت بیمه البرز · تمرین تصمیم‌گیری در شرایط دشوار</figcaption></figure>'+strategyContrast()+
 strategyCards()+masteryLessons()+oneTimeAssessment(neutral)+professionalTest(neutral)+
 '<p class="classroom-wait">'+(teacher?'چهار راهبرد، خودارزیابی یک‌نوبتی و آزمون ده‌سؤالی را مرور کن؛ سپس انتخاب مأموریت را آغاز کن.':'راهبردها، خودارزیابی یک‌نوبتی و ده سؤال حرفه‌ای را مرور کنید؛ سپس گروه خود مأموریتش را انتخاب می‌کند.')+'</p>';
}
function consensusProcess(){
 return '<section class="classroom-consensus-process"><div class="classroom-consensus-heading"><strong>🤝 انتخاب مأموریت با اجماع گروهی</strong><span>⏱️ ۲ دقیقه گفت‌وگو</span></div>'+
 '<div class="classroom-consensus-steps"><p><b>۱. گفت‌وگو کنید</b><span>هر نفر خیلی کوتاه بگوید کدام راهبرد برای تمرین گروه مناسب‌تر است و چرا.</span></p>'+
 '<p><b>۲. به توافق برسید</b><span>فقط یک مأموریت را انتخاب کنید؛ لازم نیست همه گروه‌ها راهبرد یکسان داشته باشند.</span></p>'+
 '<p><b>۳. یک نفر ثبت کند</b><span>نماینده گروه گزینه توافق‌شده را انتخاب و ثبت نهایی می‌کند.</span></p></div>'+
 '<p class="classroom-consensus-note">زمان گفت‌وگو پیشنهادی است. نیازی به رأی‌گیری یا ثبت پاسخ تک‌تک افراد نیست.</p></section>';
}
function missionCards(mode,team=0){
 const used=mode==='group'?usedMissions(team):[];
 const saved=mode==='group'?groupChoice(team):null;
 const choice=mode==='preview'?previewDraft:saved!==null?saved:consensusDraft;
 const locked=mode==='group'&&saved!==null;
 const attr=mode==='preview'?'data-class-preview-mission':'data-class-mission';
 return '<div class="classroom-choice-grid" aria-label="چهار مأموریت تاب‌آوری">'+C.models.map((m,i)=>
  '<button type="button" class="'+(choice===i?'selected':'')+'" '+attr+'="'+i+'" '+(locked||used.includes(i)?'disabled aria-disabled="true"':'')+
  ' aria-pressed="'+(choice===i?'true':'false')+'"><b>'+m[0]+' '+E(m[1])+'</b><small>'+E(C.missions[i].title)+'</small><span>'+
  (used.includes(i)?'در دور قبل انجام شده':locked&&saved===i?'✓ انتخاب نهایی گروه':locked?'مأموریت دیگری ثبت شده':choice===i?'✓ انتخاب موقت؛ هنوز ثبت نشده':'برای بررسی انتخاب کنید')+
  '</span></button>').join('')+'</div>';
}
function missionRoster(){
 const list=groups().filter(t=>confirmed(t)||attendance(t)||groupChoice(t)!==null);
 if(!list.length)return '<p class="classroom-empty">هنوز گروهی تشکیل یا تأیید نشده است. پیش‌نمایش پایین صرفاً آموزشی است و داده‌ای ثبت نمی‌کند.</p>';
 return '<div class="classroom-choice-roster">'+list.map(t=>{
  const mission=groupChoice(t),canReopen=identity?.role==='teacher'&&stage===2&&previewStep===null&&mission!==null;
  return '<div><strong>گروه '+fa(t)+'</strong><span>'+(mission===null?'منتظر انتخاب و ثبت نماینده':animals[mission]+' '+labels[mission])+'</span>'+
   (canReopen?'<button type="button" class="classroom-reopen-mission" data-class-reopen-mission="'+t+'">اصلاح انتخاب</button>':'')+'</div>';
 }).join('')+'</div>';
}
function missionShortcut(){return '<section class="classroom-mission-shortcut"><p><strong>گام سوم برای همه باز است.</strong> بدون تأیید مدرس می‌توانید مأموریت گروه خود را انتخاب و ثبت کنید.</p><button type="button" class="btn primary" data-class-open-mission>ورود به گام سوم · انتخاب مأموریت</button></section>';}
function chooseMission(team=identity.team){
 const selected=groupChoice(team);
 if(selected!==null&&identity?.role==='team'){consensusDraft=null;consensusAgreed=false;}
 return simpleTitle('مرحله انتخاب مأموریت','انتخاب مأموریت با توافق اعضای گروه','چهار مأموریت باز هستند؛ گروه شما یکی را انتخاب می‌کند. ابتدا گفت‌وگو کنید، بعد فقط یک نفر به نمایندگی ثبت نهایی کند.')+
 strategyContrast(true)+consensusProcess()+missionCards('group',team)+
 (selected!==null?
  '<section class="classroom-choice-confirmed" role="status"><strong>✅ مأموریت گروه ثبت شد: '+animals[selected]+' '+labels[selected]+'</strong><p>انتخاب گروه ثبت شد. دکمه «گام بعد» را بزنید و سناریوی خود را شروع کنید.</p></section>':
  '<section class="classroom-consensus-submit"><p>'+(consensusDraft===null?'ابتدا مأموریت توافق‌شده را از چهار گزینه بالا انتخاب کنید.':'انتخاب موقت: <strong>'+animals[consensusDraft]+' '+labels[consensusDraft]+'</strong>')+'</p>'+
  '<label class="classroom-consensus-check"><input type="checkbox" data-class-consensus-check '+(consensusAgreed?'checked':'')+'><span>به نمایندگی از اعضای گروه تأیید می‌کنم که درباره این مأموریت گفت‌وگو کرده و به توافق رسیده‌ایم.</span></label>'+
  '<button type="button" class="btn primary" data-class-confirm-mission '+(consensusDraft===null||!consensusAgreed?'disabled':'')+'>ثبت نهایی مأموریت گروه</button>'+
  '<p class="classroom-consensus-note">با ثبت نهایی، مأموریت این دور قفل می‌شود؛ اگر اشتباهی رخ دهد، مدرس می‌تواند انتخاب گروه را باز کند.</p></section>');
}
function missionTeacherChoice(){
 const ready=groups().filter(confirmed),pending=ready.filter(t=>groupChoice(t)===null),saved=ready.filter(t=>groupChoice(t)!==null);
 const status=!ready.length?'در حال حاضر گروه تشکیل‌شده‌ای وجود ندارد؛ این پیش‌نمایش مستقل از تشکیل گروه قابل بررسی است.':pending.length?
  'از '+fa(ready.length)+' گروه تشکیل‌شده، '+fa(saved.length)+' گروه انتخاب نهایی را ثبت کرده و '+fa(pending.length)+' گروه هنوز در حال گفت‌وگو یا انتخاب هستند.':
  'هر '+fa(ready.length)+' گروه تشکیل‌شده انتخاب نهایی خود را ثبت کرده‌اند و آماده ورود به سناریو هستند.';
 return simpleTitle('انتخاب مأموریت گروه‌ها','هر گروه با توافق اعضا مأموریتش را انتخاب می‌کند','دو دقیقه گفت‌وگوی گروهی؛ سپس یک نماینده انتخاب توافق‌شده را ثبت می‌کند. گروه‌ها می‌توانند مأموریت یکسان یا متفاوت انتخاب کنند.')+
 '<section class="classroom-live-roster"><h3>وضعیت واقعی گروه‌ها</h3>'+missionRoster()+'<p class="classroom-wait">'+status+'</p></section>'+
 '<section class="classroom-teacher-demo"><div class="classroom-teacher-demo-head"><strong>👁️ پیش‌نمایش تعاملی تجربه کارشناس</strong><span>فقط نمایش · بدون ثبت اطلاعات</span></div>'+
 '<p>برای بررسی طراحی و محتوای گام سوم، یکی از چهار کارت زیر را انتخاب کنید. این انتخاب نمونه است و روی هیچ گروهی تأثیر ندارد.</p>'+
 consensusProcess()+missionCards('preview')+
 '<div class="classroom-demo-selection" role="status">'+(previewDraft===null?
  'یک کارت را انتخاب کنید تا مرحله تأیید نماینده را ببینید.':
  '<strong>انتخاب نمونه: '+animals[previewDraft]+' '+labels[previewDraft]+'</strong><p>پس از دو دقیقه گفت‌وگوی اعضا، نماینده گروه همین مأموریت را انتخاب و با تأیید اجماع، دکمه «ثبت نهایی مأموریت گروه» را می‌زند. در این پیش‌نمایش، دکمه ثبت عمداً غیرفعال است.</p><button class="btn" type="button" disabled>ثبت نهایی مأموریت گروه · فقط نمونه</button>')+
 '</div></section>';
}
function teacherStep(phase=stage){
 const i=reference,n=phase-3,m=C.missions[i],d=C.cases[i],x=C.embedded[i],mod=C.models[i];
 const say=[
 '«موقعیت را بخوانید. هر نفر بگوید چه چیزی به او فشار می‌آورد، چه کاری در اختیارش است و چطور تمرکز را بازمی‌یابد. پاسخ نوشتاری لازم نیست.»',
 '«پنج نقش را متناسب با تعداد افراد تقسیم کنید. در گروه‌های سه یا چهار‌نفره، بعضی نفرات دو نقش می‌گیرند؛ هر نفر اطلاعات نقش خود را برای گروه توضیح دهد.»',
 '«گفت‌وگوی نمونه را یک بار با حضور شخصیت‌ها اجرا کنید؛ در پایان تحلیل راهبردی همان گفت‌وگو را بخوانید.»',
 '«با شش سکه حداقل دو اقدام انتخاب کنید؛ تصمیم اولیه، دلیل و مسئول را ثبت کنید.»',
 '«اکنون یک اتفاق تازه داریم. ببینید تصمیم قبلی هنوز مناسب است یا نه.»',
 '«با توجه به اطلاعات تازه، چه چیزی را در تصمیم اصلاح می‌کنید و چرا؟»',
 '«هر گروه نتیجه نهایی و یک اقدام واقعی برای واحد خسارت را با دلیل کوتاه ثبت کند.»'
 ][n];
 const ask=[
 'سناریوی راهبرد انتخابی گروه را بخوانند، هر پنج نفر درباره سه پرسش گفت‌وگو کنند و فقط یک نفر پایان گام را ثبت کند؛ نوشتن اجباری نیست.',
 'نقش‌ها را تقسیم کنند و هر فرد اطلاعات اختصاصی نقش خود را مطرح کند.',
 'یک گفت‌وگوی کامل اجرا و تحلیل نهایی راهبرد را مرور کنند.',
 'دو یا چند اقدام در سقف ۶ سکه انتخاب و تصمیم اولیه را با گروه به اشتراک بگذارند.',
 'اتفاق تازه را بخوانند و درباره تأثیر آن بر تصمیم گفت‌وگو کنند.',
 'تصمیم اصلاح‌شده و دلیل آن را ثبت و به اشتراک بگذارند.',
 'نتیجه مأموریت و یک اقدام قابل اجرا را ثبت کنند.'
 ][n];
 const bodies=[
 '<div class="classroom-story"><h3>چه اتفاقی افتاده؟</h3><p>'+E(d.situation)+'</p><h3>اطلاعاتی که گروه هم می‌بیند</h3><ul>'+d.facts.map(f=>'<li>'+E(f)+'</li>').join('')+'</ul></div>'+individualDiscussion(i),
 masteryRoles(i),
 masteryTalk(i),
 '<details class="classroom-reference"><summary>کارت‌های تصمیم و پیامدها</summary>'+m.actions.map(a=>'<p><strong>'+E(a[0])+' · '+fa(a[1])+' سکه</strong> — '+E(a[2])+'</p>').join('')+'</details>',
 '<div class="classroom-event"><h3>اتفاق تازه</h3><p>'+E(m.shock)+'</p></div>',
 '<p class="classroom-prompt">'+E(d.question)+'</p>',
 '<p class="classroom-prompt">هر گروه نتیجه و یک اقدام قابل اجرا در خسارت را با دلیل کوتاه بیان می‌کند.</p>'+monitorAllGroups()
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
  const i=groupChoice(t),prefix='r'+i;
  const initial=i===null?'':val(t,prefix+'initial'),revision=i===null?'':val(t,prefix+'revision');
  const results=i===null?[]:Array.from({length:5},(_,j)=>val(t,prefix+'member'+(j+1))).filter(v=>typeof v==='string'&&v.trim());
  return '<details><summary><strong>گروه '+fa(t)+'</strong><span>'+(i===null?'مأموریت انتخاب نشده':animals[i]+' '+labels[i])+'</span><small>'+(initial?'تصمیم اول ✓':'تصمیم اول ○')+' · '+(revision?'اصلاح ✓':'اصلاح ○')+' · '+fa(results.length)+' نتیجه ثبت‌شده</small></summary>'+
  '<p><b>تصمیم اولیه:</b> '+formatText(initial)+'</p><p><b>تصمیم اصلاح‌شده:</b> '+formatText(revision)+'</p>'+
  '<ul>'+results.map(v=>'<li>'+E(v)+'</li>').join('')+'</ul></details>';
 }).join('')+'</div>';
}
function learnerMission(team=identity.team,member=identity.member,phase=stage,sampleMission=null){
 const i=groupChoice(team)??sampleMission;
 if(i===null)return simpleTitle('یک انتخاب باقی مانده','گروه هنوز مأموریت ندارد','هم‌اکنون یکی از چهار مأموریت را انتخاب کنید تا به گام جاری کلاس برسید.')+chooseMission(team);
 const n=phase-3,m=C.missions[i],d=C.cases[i],x=C.embedded[i],prefix='r'+i;
 const title=simpleTitle(animals[i]+' '+labels[i],'گام '+fa(n+1)+' از ۷ · '+C.missionFlow[n],m.title);
 let body='';
 if(n===0)body='<div class="classroom-story"><h3>هدف شما</h3><p>'+E(d.goal)+'</p><h3>چه اتفاقی افتاده؟</h3><p>'+E(d.situation)+'</p><h3>سه داده مهم</h3><ul>'+d.facts.map(v=>'<li>'+E(v)+'</li>').join('')+'</ul></div>'+individualDiscussion(i);
 if(n===1)body=masteryRoles(i);
 if(n===2)body=masteryTalk(i);
 if(n===3){const savedPick=val(team,prefix+'pick'),picked=Array.isArray(savedPick)?savedPick:[];
 body='<p class="classroom-prompt">با ۶ سکه حداقل دو اقدام انتخاب کنید. یک نفر تصمیم را از طرف گروه ثبت کند.</p><div class="classroom-money">بودجه تصمیم: <strong>۶ سکه</strong></div><div class="classroom-options">'+m.actions.map((a,j)=>'<label><input type="checkbox" data-class-pick="'+j+'" '+(picked.includes(j)?'checked':'')+'><span>'+E(a[0])+'</span><b>'+fa(a[1])+' سکه</b></label>').join('')+'</div><label class="classroom-input"><span>تصمیم و دلیل گروه</span><textarea data-class-answer="initial" rows="3" placeholder="چه اقدام‌هایی را انتخاب کردید؟ چرا؟ مسئول کیست؟">'+E(val(team,prefix+'initial')||'')+'</textarea></label><button class="btn primary" data-class-save="initial">ثبت تصمیم گروه</button>'+(val(team,prefix+'initial')?'<p class="classroom-saved">تصمیم قبلی گروه ثبت شده است ✓</p>':'');}
 if(n===4)body='<div class="classroom-event"><h3>اتفاق جدید</h3><p>'+E(m.shock)+'</p></div><p class="classroom-prompt">به تصمیم قبلی‌تان فکر کنید. آیا با این اطلاعات هنوز آن را مناسب می‌دانید؟</p>';
 if(n===5)body='<p class="classroom-prompt">کدام بخش از تصمیم اولیه باید تغییر کند؟ دلیل خود را بنویسید.</p><label class="classroom-input"><span>تصمیم اصلاح‌شده گروه</span><textarea data-class-answer="revision" rows="4" placeholder="چه چیزی را تغییر دادید و بر اساس چه شاهدی؟">'+E(val(team,prefix+'revision')||'')+'</textarea></label><button class="btn primary" data-class-save="revision">ثبت تصمیم اصلاح‌شده</button>'+(val(team,prefix+'revision')?'<p class="classroom-saved">اصلاح قبلی ثبت شده است ✓</p>':'');
 if(n===6){const k=prefix+'member'+member;body='<p class="classroom-prompt">نتیجه تیم و یک اقدام واقعی برای محیط خسارت را کوتاه بنویسید.</p><label class="classroom-input"><span>نتیجه و اقدام من · عضو '+fa(member)+'</span><textarea data-class-answer="evidence" rows="3" placeholder="از این مأموریت چه نتیجه‌ای گرفتید؟ فردا چه اقدامی انجام می‌دهید؟">'+E(val(team,k)||'')+'</textarea></label><button class="btn primary" data-class-save="evidence">ثبت نتیجه من</button><div class="classroom-recap"><p><b>تصمیم اولیه:</b> '+formatText(val(team,prefix+'initial'))+'</p><p><b>تصمیم اصلاح‌شده:</b> '+formatText(val(team,prefix+'revision'))+'</p></div>';}
 return title+caseIllustration(i)+body+'<div class="classroom-ready-action"><p>وقتی گفت‌وگو و ثبت نتیجه این مرحله تمام شد، یکی از اعضا روی «گام بعد» بزند؛ ادامه مسیر به تأیید مدرس وابسته نیست.</p></div>';
}
function missionMilestones(team){
 const i=groupChoice(team);
 if(i===null)return [attendance(team)>0,false,false,false,false];
 const p='r'+i;
 return [attendance(team)>0,true,!!String(val(team,p+'initial')||'').trim(),!!String(val(team,p+'revision')||'').trim(),Array.from({length:5},(_,j)=>val(team,p+'member'+(j+1))).some(v=>String(v||'').trim())];
}
function missionBadge(team){
 const i=groupChoice(team),flags=missionMilestones(team);
 if(i===null||!flags.every(Boolean))return '';
 return '<section class="classroom-completion-badge"><h3>🏅 نشان گروه · '+animals[i]+' '+labels[i]+'</h3><p>مأموریت انتخاب و انجام شد؛ تصمیم اولیه، اصلاح تصمیم و نتیجه کاربردی ثبت شده‌اند. این نشان برای تکمیل مسیر یادگیری است، نه رتبه‌بندی کارکنان.</p></section>';
}
function ending(team=identity.team,asParticipant=false){
 return simpleTitle('جمع‌بندی','از این مأموریت چه یاد گرفتیم؟','گروه‌ها تجربه، تصمیم و نکته قابل انتقال به محیط خسارت را با هم مرور می‌کنند.')+
 (identity.role==='teacher'&&!asParticipant?'<p class="classroom-prompt">نتیجه هر گروه و یک اقدام عملی برای کار روزمره را جمع‌بندی کن.</p>'+monitorAllGroups():'<p class="classroom-prompt">یک نتیجه و یک اقدام قابل اجرا برای محیط خسارت با خود ببرید. ادامه دوره در بخش مستقل مدیریت خشم است.</p>'+missionBadge(team));
}

function projectedParticipantContent(team,member,phase,sample){
 if(phase===0)return checkinParticipant(team,member);
 if(!confirmed(team)&&!sample)return simpleTitle('در انتظار تأیید گروه','مدرس هنوز گروه شما را تأیید نکرده است','پس از ثبت حضور و تعیین ظرفیت گروه، مدرس گروه را فعال می‌کند.')+personDots(team);
 if(phase===1)return strategyIntro(false,true);
 if(phase===2)return chooseMission(team);
 if(phase<=9)return learnerMission(team,member,phase,sample?reference:null);
 return ending(team,true);
}
function projectorPanel(phase){
 const team=projectedTeam,member=projectedMember,realChoice=groupChoice(team),hasGroup=confirmed(team);
 const sampleAvailable=!hasGroup&&phase>=1||realChoice===null&&phase>=3&&phase<=10;
 const useSample=projectionSample&&sampleAvailable;
 const selectedChoice=realChoice===null&&useSample?reference:realChoice;
 const missionName=selectedChoice===null?'هنوز ثبت نشده':animals[selectedChoice]+' '+labels[selectedChoice];
 const options=groups().map(t=>{
  const chosen=groupChoice(t),people=attendance(t),ready=confirmed(t),label=chosen===null?'انتخاب نشده':animals[chosen]+' '+labels[chosen];
  return '<button type="button" class="classroom-projector-team '+(t===team?'selected':'')+'" data-class-projection-team="'+t+'" aria-pressed="'+(t===team?'true':'false')+'"><strong>گروه '+fa(t)+'</strong><span>'+E(label)+'</span><small>'+fa(people)+' حضور · '+(ready?'تأیید شده':'در انتظار تأیید')+'</small></button>';
 }).join('');
 const members=Array.from({length:5},(_,j)=>'<button type="button" class="'+(member===j+1?'selected':'')+'" data-class-projection-member="'+(j+1)+'" aria-pressed="'+(member===j+1?'true':'false')+'">عضو '+fa(j+1)+(checkin(team,j+1)?' ✓':'')+'</button>').join('');
 const mustSample=realChoice===null&&!useSample&&phase>=3&&phase<=10;
 let content=projectedParticipantContent(team,member,phase,useSample);
 const scope=phase===1?'شش گزاره خودارزیابی و ده سؤال فردی فقط روی دستگاه هر کارشناس ذخیره می‌شوند؛ پاسخ‌های شخصی در پنل مدرس قابل مشاهده نیستند.':'محتوای صفحه و پاسخ‌های ثبت‌شده این گروه از اطلاعات مشترک کلاس نمایش داده می‌شوند. انتخاب‌های موقت و متن تایپ‌شده‌ای که هنوز ذخیره نشده‌اند روی دستگاه اعضا باقی می‌مانند.';
 const bodyLabel=mustSample?'این گروه هنوز مأموریت ثبت نکرده است؛ نمای واقعی عضو در این گام، انتظار برای انتخاب مأموریت است.':'این بخش با استفاده از محتوای مشترک نمایش کارشناسان ساخته شده است.';
 const ready=phase===stage&&phase>=3&&phase<=9?(stepReady(team)?'این گام را انجام داده‌اند ✓':'هنوز تکمیل گام را اعلام نکرده‌اند'):'مرحله واقعی کلاس: '+fa(stage+1)+' از ۱۱';
 return '<section class="classroom-projector" aria-label="صفحه کارشناسان برای نمایش روی پرده">'+
 '<div class="classroom-projector-head"><div><span>نمایش قابل‌اشتراک روی پرده · فقط خواندنی</span><h2>صفحه گروه '+fa(team)+' · گام '+fa(phase+1)+' از ۱۱</h2><p>مأموریت: <strong>'+E(missionName)+'</strong> · '+ready+'</p></div><span class="classroom-projector-status">'+(useSample?'نمونه فرضی · نه داده واقعی':hasGroup?'اطلاعات واقعی گروه':'گروه هنوز تأیید نشده')+'</span></div>'+
 '<div class="classroom-projector-team-grid" aria-label="انتخاب گروه برای مشاهده">'+options+'</div>'+
 '<div class="classroom-projector-member-picker"><span>نمای کدام عضو؟</span>'+members+'</div>'+
 '<div class="classroom-projector-note"><strong>اطلاع مهم:</strong> '+E(scope)+'</div>'+
 (sampleAvailable?'<div class="classroom-projector-demo-controls"><button type="button" class="btn" data-class-projection-sample>'+ (useSample?'بازگشت به وضعیت واقعی گروه':'نمایش نمونه آموزشی بدون ثبت مأموریت')+'</button>'+ (useSample?'<div class="classroom-teacher-switch">'+C.models.map((m,i)=>'<button type="button" class="'+(reference===i?'selected':'')+'" data-class-reference="'+i+'">'+m[0]+' '+E(m[1])+'</button>').join('')+'</div>':'')+'</div>':'')+
 '<p class="classroom-projector-label">'+E(bodyLabel)+'</p>'+
 '<div class="classroom-projection-body">'+content+'</div>'+
 '<p class="classroom-projector-footer">این نما فقط برای مشاهده و پاسخ به پرسش‌هاست؛ نمی‌توان از آن حضور، انتخاب، آزمون یا تصمیم گروه را تغییر داد.</p></section>';
}

function render(force=false){
 if(classroomRound!==consensusRound){consensusRound=classroomRound;consensusDraft=null;consensusAgreed=false;previewDraft=null;}
 if(!root)return;
 if(!identity){root.innerHTML='<p class="classroom-wait">ابتدا با کد ملی وارد شوید؛ نقش مدرس یا کارشناس در سامانه مشخص می‌شود.</p>';lastFingerprint='';return;}
 const teacher=identity.role==='teacher';
 const displayStage=teacher?(previewStep!==null?previewStep:stage):(earlyMissionOpen&&stage<2?2:stage),previewActive=teacher&&previewStep!==null;
 const signature=String(stage)+'/'+String(previewStep)+'/'+String(openStep)+'/'+String(classroomRound)+'/'+String(projectionMode)+'/'+String(projectedTeam)+'/'+String(projectedMember)+'/'+String(projectionSample)+'/'+String(teacher?'t':identity.team)+'/'+String(teacher?reference:groupChoice(identity.team))+'/'+JSON.stringify(rows.map(r=>[r.team_no,r.field_key,r.field_value,r.version]));
 if(!force&&signature===lastFingerprint)return;
 if(!force&&root.contains(document.activeElement)&&document.activeElement.matches('textarea,input,select')){needsRefresh=true;return;}
 needsRefresh=false;lastFingerprint=signature;
 const ahead=stage===10?2:stage+1;
 const countConfirmed=groups().filter(confirmed).length;
 const allReadyHaveMission=groups().filter(confirmed).every(t=>groupChoice(t)!==null);
 const stepProgress=readiness();
 const nextDisabled=teacher &&(stage===0&&countConfirmed===0||stage===2&&(countConfirmed===0||!allReadyHaveMission)||stage>=3&&stage<=9&&stepProgress.waiting.length>0||stage===10);
 const guideNote=stage>=3&&stage<=9?'آماده: '+fa(stepProgress.ready.length)+' از '+fa(stepProgress.active.length)+' گروه'+(stepProgress.waiting.length?' · منتظر گروه‌های '+stepProgress.waiting.map(fa).join('، '):' · همه آماده‌اند'):'گروه‌ها مستقل پیش می‌روند و هر مرحله را خودشان باز می‌کنند.';
 const header='<header class="classroom-top"><div><span>'+E(className())+'</span><h1>کارگاه تاب‌آوری · اجرای مرحله‌به‌مرحله</h1></div>'+lessonRow(displayStage)+'</header>'+
 '<div class="classroom-stage-progress" role="status"><span>پیشرفت کلاس: '+fa(stage+1)+' از ۱۱</span><meter min="0" max="11" value="'+(stage+1)+'"></meter><span>'+(previewActive?'نمایش مستقل: گام '+fa(displayStage+1):'گام فعال')+'</span></div>';
 const controls=teacher?(previewActive?'<div class="classroom-preview-banner" role="status"><strong>👁️ پیش‌نمایش مستقل گام '+fa(displayStage+1)+'</strong><span>گام واقعی کلاس '+fa(stage+1)+' است؛ مشاهده این صفحه هیچ مرحله یا پاسخی را تغییر نمی‌دهد.</span><button type="button" class="btn primary" data-class-return-live>بازگشت به گام فعال کلاس</button></div>':'<nav class="classroom-controls" aria-label="کنترل مسیر کلاس"><button class="btn" data-class-prev '+(stage===0?'disabled':'')+'>گام قبل</button><div class="classroom-controls-note">'+E(guideNote)+'</div><button class="btn primary" data-class-next '+(nextDisabled?'disabled':'')+' >'+(stage===10?'بخش تاب‌آوری کامل شد':'گام بعد')+'</button></nav>') : '<nav class="classroom-controls classroom-team-controls" aria-label="پیشروی مستقل گروه"><button type="button" class="btn" data-team-prev '+(stage===0?'disabled':'')+'>گام قبل</button><span class="classroom-controls-note">گروه شما مستقل پیش می‌رود · گام '+fa(stage+1)+' از ۱۱</span>'+(stage<10?'<button type="button" class="btn primary" data-team-next '+(stage===0&&!checkin(identity.team,identity.member)||stage===2&&groupChoice(identity.team)===null?'disabled':'')+'>گام بعد ←</button>':classroomRound<3?'<button type="button" class="btn primary" data-team-restart>انتخاب مأموریت بعدی</button>':'<strong>چهار مأموریت تکمیل شد ✓</strong>')+'</nav>';
 let content;
 if(teacher&&projectionMode)content=projectorPanel(displayStage);
 else if(displayStage===0)content=teacher?rosterTeacher():checkinParticipant()+missionShortcut();
 else if(displayStage===1)content=teacher?strategyIntro(true):missionShortcut()+strategyIntro(false);
 else if(displayStage===2)content=teacher?missionTeacherChoice():(stage<2?'<button type="button" class="btn" data-class-back-current>بازگشت به گام جاری</button>':'')+chooseMission();
 else if(displayStage<=9)content=teacher?teacherStep(displayStage):learnerMission();
 else content=ending();
 const resetPanel=teacher?'<details class="classroom-reset"><summary>شروع کارگاه جدید · تنظیمات مدرس</summary><p>برای پاک‌سازی پاسخ‌ها و حضورهای آزمایشی و شروع از مرحله اول استفاده کنید. عضویت‌های ثبت‌شده با کد ملی و محتوای کارگاه حفظ می‌شوند. این عملیات قابل بازگشت نیست.</p><button type="button" class="btn" data-class-reset>پاک‌کردن داده‌های تست و شروع تازه</button></details>':'';
 const inStep=openStep===displayStage||(!teacher&&displayStage===2&&stage<2);
 const viewSwitch=teacher&&inStep?'<nav class="classroom-view-switch" aria-label="نمای مخصوص مدرس یا گروه"><button type="button" class="'+(!projectionMode?'selected':'')+'" data-class-view="teacher" aria-pressed="'+(!projectionMode?'true':'false')+'">راهنمای مدرس</button><button type="button" class="'+(projectionMode?'selected':'')+'" data-class-view="participant" aria-pressed="'+(projectionMode?'true':'false')+'">نمایش صفحه گروه روی پرده</button></nav>':'';
 const navigation=inStep?'<nav class="classroom-map-return"><button type="button" class="btn" data-class-overview>← بازگشت به نقشه ۱۱ گام</button><span>گام '+fa(displayStage+1)+' از ۱۱ · '+E(names[displayStage])+'</span></nav>':'';
 root.innerHTML='<div class="classroom-layout">'+header+messageBox()+(inStep?navigation+viewSwitch+controls+'<main class="classroom-content">'+content+'</main>':'<main class="classroom-content">'+stepMap()+'</main>')+resetPanel+'</div>';
 if(teacher&&projectionMode&&inStep)root.querySelectorAll('.classroom-projection-body input,.classroom-projection-body textarea,.classroom-projection-body select,.classroom-projection-body button').forEach(el=>{el.disabled=true;el.setAttribute('aria-disabled','true');});
}
async function execute(task){
 if(busy)return;busy=true;
 try{await task();clearNotice();await L.refresh();lastFingerprint='';render(true);}
 catch(e){alertUser(e.message||'خطای ارتباط؛ دوباره تلاش کنید',true);}
 finally{busy=false;}
}
async function saveFields(fields){
 const team=identity.team;
 const expected=Object.fromEntries(Object.keys(fields).map(k=>[k,version(team,k)]));
 await L.request({action:'write',team,fields,expected});
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
 const box=event.target.closest('[data-class-consensus-check]');
 if(!box||identity?.role!=='team'||Math.max(stage,2)!==2||groupChoice(identity.team)!==null)return;
 consensusAgreed=box.checked;
 const submit=root.querySelector('[data-class-confirm-mission]');
 if(submit)submit.disabled=!consensusAgreed||consensusDraft===null;
});
root.addEventListener('click',event=>{
 const btn=event.target.closest('button');if(!btn||busy)return;
 if(btn.closest('.classroom-projection-body'))return;
 if(btn.hasAttribute('data-team-prev')||btn.hasAttribute('data-team-next')){
  if(identity?.role!=='team'||earlyMissionOpen)return;
  const delta=btn.hasAttribute('data-team-next')?1:-1, next=Math.max(0,Math.min(10,stage+delta));
  if(delta>0&&stage===0&&!checkin(identity.team,identity.member))return alertUser('ابتدا حضور خود را ثبت کنید.',true);
  if(delta>0&&stage===2&&groupChoice(identity.team)===null)return alertUser('ابتدا مأموریت گروه را ثبت کنید.',true);
  const chosen=groupChoice(identity.team),prefix='r'+chosen;
  if(delta>0&&stage===6&&!String(val(identity.team,prefix+'initial')||'').trim())return alertUser('ابتدا تصمیم اولیه گروه را ثبت کنید.',true);
  if(delta>0&&stage===8&&!String(val(identity.team,prefix+'revision')||'').trim())return alertUser('ابتدا تصمیم اصلاح‌شده گروه را ثبت کنید.',true);
  if(delta>0&&stage===9&&!Array.from({length:5},(_,i)=>val(identity.team,prefix+'member'+(i+1))).some(v=>String(v||'').trim()))return alertUser('ابتدا نتیجه یا اقدام گروه را ثبت کنید.',true);
  if(next===stage)return;
  execute(()=>saveFields({teamPhase:next}));return;
 }
 if(btn.hasAttribute('data-team-restart')){
  if(identity?.role!=='team'||stage!==10||classroomRound>=3)return;
  if(!window.confirm('مأموریت فعلی ثبت شده است. آیا دور بعد را با انتخاب یک مأموریت دیگر شروع می‌کنید؟'))return;
  execute(()=>saveFields({teamRound:classroomRound+1,teamPhase:2}));return;
 }
 if(btn.hasAttribute('data-class-open-mission')){if(identity?.role!=='team'||stage>=2)return;earlyMissionOpen=true;openStep=2;lastFingerprint='';render(true);return;}
 if(btn.hasAttribute('data-class-back-current')){if(identity?.role!=='team'||stage>=2)return;earlyMissionOpen=false;openStep=stage;lastFingerprint='';render(true);return;}
 if(btn.hasAttribute('data-class-view')){if(identity?.role!=='teacher')return;projectionMode=btn.dataset.classView==='participant';lastFingerprint='';render(true);return;}
 if(btn.hasAttribute('data-class-projection-team')){if(identity?.role!=='teacher')return;const team=Number(btn.dataset.classProjectionTeam);if(!Number.isInteger(team)||team<1||team>10)return;projectedTeam=team;projectedMember=1;projectionSample=false;lastFingerprint='';render(true);return;}
 if(btn.hasAttribute('data-class-projection-member')){if(identity?.role!=='teacher')return;const member=Number(btn.dataset.classProjectionMember);if(!Number.isInteger(member)||member<1||member>5)return;projectedMember=member;lastFingerprint='';render(true);return;}
 if(btn.hasAttribute('data-class-projection-sample')){if(identity?.role!=='teacher')return;projectionSample=!projectionSample;lastFingerprint='';render(true);return;}
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
 if(btn.hasAttribute('data-class-preview-mission')){
  if(identity?.role!=='teacher'||(previewStep!==2&&stage!==2))return;
  const choice=Number(btn.dataset.classPreviewMission);if(!Number.isInteger(choice)||choice<0||choice>3)return;
  previewDraft=choice;lastFingerprint='';render(true);return;
 }
 if(btn.hasAttribute('data-class-mission')){
  if(identity?.role!=='team'||Math.max(stage,2)!==2||groupChoice(identity.team)!==null)return;
  const choice=Number(btn.dataset.classMission);
  if(!Number.isInteger(choice)||choice<0||choice>3||usedMissions(identity.team).includes(choice))return alertUser('این مأموریت در دور قبلی اجرا شده؛ یک راهبرد دیگر انتخاب کنید.',true);
  consensusDraft=choice;consensusAgreed=false;lastFingerprint='';render(true);return;
 }
 if(btn.hasAttribute('data-class-confirm-mission')){
  if(identity?.role!=='team'||Math.max(stage,2)!==2||groupChoice(identity.team)!==null)return;
  if(consensusDraft===null||!consensusAgreed||usedMissions(identity.team).includes(consensusDraft))return alertUser('ابتدا با گروه به توافق برسید و انتخاب نهایی را تأیید کنید.',true);
  const choice=consensusDraft;
  execute(()=>saveFields({missionChoice:choice,missionChoiceRound:classroomRound,['missionRound'+classroomRound]:choice}));
  return;
 }
 if(btn.hasAttribute('data-class-reopen-mission')){
  if(identity?.role!=='teacher'||previewStep!==null||stage!==2)return;
  const team=Number(btn.dataset.classReopenMission);if(!Number.isInteger(team)||team<1||team>10||groupChoice(team)===null)return;
  if(!window.confirm('انتخاب مأموریت گروه '+fa(team)+' باز شود؟ فقط مأموریت همین دور حذف می‌شود و نماینده گروه می‌تواند دوباره ثبت کند.'))return;
  execute(()=>L.request({action:'reopenMission',team}));
  return;
 }
 if(btn.hasAttribute('data-class-ready')){
  if(identity.role!=='team'||stage<3||stage>9)return;
  const chosen=groupChoice(identity.team),prefix='r'+chosen;
  if(chosen===null)return alertUser('ابتدا مأموریت گروه را انتخاب کنید.',true);
  if(stage===6&&!String(val(identity.team,prefix+'initial')||'').trim())return alertUser('ابتدا تصمیم اولیه گروه را ثبت کنید.',true);
  if(stage===8&&!String(val(identity.team,prefix+'revision')||'').trim())return alertUser('ابتدا تصمیم اصلاح‌شده گروه را ثبت کنید.',true);
  if(stage===9&&!Array.from({length:5},(_,i)=>val(identity.team,prefix+'member'+(i+1))).some(v=>String(v||'').trim()))return alertUser('ابتدا نتیجه یا اقدام گروه را ثبت کنید.',true);
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
 assignedCount=Number(event.detail.assignedCount??0);
 assignedCounts=event.detail.assignedCounts||null;
 rows=event.detail.records||[];
 if(identity?.role==='teacher'){
  const record=rec(1,'classroomPhase');stage=Number(record?.field_value??0);stageVersion=record?.version??0;classroomRound=Number(rec(1,'classroomRound')?.field_value??0);
 }else{stage=Number(val(identity.team,'teamPhase')??0);stageVersion=version(identity.team,'teamPhase');classroomRound=Number(val(identity.team,'teamRound')??0);}
 stage=Math.max(0,Math.min(10,stage));if(stage!==oldStage||classroomRound!==oldRound){openStep=stage;previewStep=null;lastFingerprint='';}render();
});
render(true);
})();