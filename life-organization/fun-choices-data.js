/* Dual-choice entertainment catalogue · 58 curated prompts / 8 categories.
   The 42 early items came from explicitly written slide pairings; 43–58 are
   interpretations from slide imagery, not verbatim original pairings.
   This is reflective entertainment, NOT an evidence-based personality test. */
(function(){
"use strict";
const cat=(id,fa,en,desc,descEn,anchor,insights,items)=>({id,fa,en,desc,descEn,anchor,insights,items:items.map(p=>({id:p[0],a:p[1],b:p[2],q:p[3],ae:p[4],be:p[5],qe:p[6],origin:p[0]<=42?"explicit":"interpretive"}))});
window.LifeFunCategories=[
cat("values","فلسفه، هویت و ارزش‌ها","Values & identity","وقتی کسی تو را تماشا نمی‌کند، چه چیزهایی هنوز برایت مهم‌اند؟","What matters when no one is watching?",15,
["در این انتخاب، معیارهای بیرونی را جلوتر گذاشتی. این می‌تواند نشان‌دهنده توجه به جامعه باشد؛ پرسش این است که چه زمانی صدای جمع جای صدای خودت می‌نشیند.","در این انتخاب، معیار شخصی را ترجیح دادی. استقلال ارزشمند است؛ اما دیدگاه دیگران هم گاهی به دیدن نقاط کور کمک می‌کند."],[
[4,"منِ دیوانه","منِ عاقل","وقتی رؤیایی نامتعارف به سراغت می‌آید، اول جسارتت را صدا می‌زنی یا حسابگری‌ات را؟","Unconventional me","Rational me","When an unusual dream appears, do you lead with courage or calculation?"],
[7,"شیک","مفید","برای وسیله‌ای که هر روز استفاده می‌کنی، جذابیت ظاهری مهم‌تر است یا کارراه‌انداز بودن؟","Stylish","Useful","For everyday things, do you favor style or usefulness?"],
[15,"معیار جامعه","معیار خودم","اگر همه موفقیت را یک جور تعریف کنند، تعریف جمع را می‌پذیری یا تعریف خودت را می‌سازی؟","Society's standards","My standards","Whose definition of success would guide you?"],
[17,"صورت زیبا","سیرت زیبا","در اولین آشنایی، کدام برایت کشش بیشتری دارد: ظاهر فرد یا منش او؟","Appearance","Character","What draws you in first: looks or character?"],
[18,"کاراکتر","جایگاه","در برخورد با آدم‌ها، چه چیزی زودتر احترام تو را جلب می‌کند: شخصیت یا عنوان؟","Character","Status","What earns your respect first: character or status?"],
[22,"کمال و ایده‌آل","واقعیت","اگر زندگی مطابق تصویر بی‌نقص ذهنت نباشد، اول سراغ ایده‌آل می‌روی یا واقعیت امروز؟","The ideal","The real","Do you start with ideals or today's reality?"],
[23,"قلبم","عقاید دیگران","برای تصمیمی که قرار است خودت با پیامدش زندگی کنی، به دلت گوش می‌دهی یا به نظر جمع؟","My inner voice","Others' opinions","For a personal decision, do you trust yourself or public opinion?"],
[49,"رضایت درونی","جلب رضایت جامعه","کاری را تصور کن که تحسین نمی‌شود اما برایت معنا دارد؛ آن را ادامه می‌دهی یا تأیید دیگران را می‌جویی؟","Inner fulfillment","Social approval","Would you prefer inner meaning or public approval?"],
[53,"راه درست","راه آسان","وقتی گزینه آسان با ارزش‌هایت سازگار نیست، راه درست را می‌روی یا میان‌بُر را؟","Right path","Easy path","When convenience conflicts with values, what do you choose?"],
[54,"نقش اصلی در زندگی خود","نقش فرعی در زندگی دیگران","چه کسی باید داستان زندگی‌ات را جلو ببرد: خودت یا انتظارات اطرافیان؟","Lead in my story","Supporting role in others' stories","Who should lead the story of your life?"]
]),
cat("direction","جهت‌گیری کلان و سبک زندگی","Life direction","قطب‌نمای زندگی‌ات بیشتر به کدام سو می‌چرخد؟","Where does your life compass point?",52,
["در این موقعیت، کار را جلوتر گذاشتی. به این فکر کن که این انتخاب چگونه با روابط، سلامت و استراحت سازگار می‌شود.","در این موقعیت، کل زندگی را جلوتر گذاشتی. ببین چه ساختار اقتصادی و شغلی‌ای برای حفظ این اولویت لازم داری."],[
[2,"آینده‌نگر","گذشته‌نگر","سر یک دوراهی مهم، اول به فرصت‌های فردا نگاه می‌کنی یا درس‌های دیروز؟","Future-focused","Past-focused","At a crossroads, do you look ahead or look back?"],
[10,"دوی سرعت","ماراتن","برای رسیدن به یک هدف مهم، جهش پرشتاب را ترجیح می‌دهی یا ریتم پایدار و بلندمدت را؟","Sprint","Marathon","For a big goal, do you prefer a sprint or a marathon?"],
[41,"انتظار نوبت","آماده‌سازی","اگر فرصت بزرگ زندگی هنوز نرسیده، منتظرش می‌مانی یا برایش آماده می‌شوی؟","Wait my turn","Get ready","Do you wait for opportunity or prepare for it?"],
[52,"کارمحوری","زندگی‌محوری","اگر تقویمت می‌توانست فقط یک اولویت را فریاد بزند، آن کار بود یا زندگی در تمام ابعادش؟","Work-centered","Life-centered","Would your calendar prioritize work or your wider life?"]
]),
cat("growth","رشد، یادگیری و موفقیت","Growth & success","پیشرفت همیشه یک خط صاف نیست؛ سبک حرکت تو چیست؟","Growth is rarely a straight line.",47,
["در این دور، کمال را انتخاب کردی. استاندارد بالا می‌تواند مفید باشد، اما چه زمانی شروع‌کردن یا یادگرفتن را به تأخیر می‌اندازد؟","در این دور، استمرار را انتخاب کردی. برای حفظ کیفیت، چه معیاری کمک می‌کند قدم‌هایت هدفمند بمانند؟"],[
[5,"تأثیر بر دیگران","پیشرفت خودم","اگر فقط یکی دیده شود، دوست داری دیگران از تو تأثیر بگیرند یا خودت واقعاً جلو رفته باشی؟","Impress others","Make progress","Would you rather impress others or make real progress?"],
[11,"بهانه","پیشرفت","پس از روزی سخت، بیشتر به دلایل نرسیدن فکر می‌کنی یا یک قدم هرچند کوچک پیدا می‌کنی؟","Excuses","Progress","After a hard day, do you dwell on obstacles or find a small step?"],
[34,"پذیرش رشد با درد","میان‌بُر در تعارض با ارزش‌ها","اگر یک مسیر دشوار با ارزش‌هایت هماهنگ باشد و راهی آسان‌تر نه، کدام را می‌روی؟","Grow through discomfort","Compromising shortcut","Do you choose difficult growth or a value-compromising shortcut?"],
[44,"اثبات خود","بهبود خود","اگر هیچ‌کس تماشایت نکند، باز هم همان‌قدر برای بهترشدن تلاش می‌کنی؟","Prove myself","Improve myself","Without an audience, do you focus on proving or improving?"],
[47,"کمال‌گرایی","استمرار و تداوم","شروع بی‌نقص اما دیرهنگام یا قدم‌های معمولی اما پیوسته؟","Perfection","Consistency","A perfect delayed start or steady imperfect steps?"],
[51,"موفقیت ناگهانی","تلاش مستمر و پنهان","وقتی دستاورد بزرگی می‌بینی، بیشتر لحظه درخشش را می‌بینی یا سال‌های تلاش پشت آن را؟","Sudden success","Quiet sustained effort","Do you notice the breakthrough or the years behind it?"],
[56,"مقایسه با دیگران","تمرکز بر مسیر خود","وقتی دوستی از تو جلو می‌زند، بیشتر به سرعت او نگاه می‌کنی یا به مسیر خودت؟","Compare with others","Focus on my path","When a friend moves faster, where does your attention go?"],
[58,"پیشرفت خطی","پیشرفت پرفرازونشیب","اگر نمودار پیشرفتت بالا و پایین برود، انتظار مسیر صاف داری یا فرازونشیب را طبیعی می‌بینی؟","Linear progress","Uneven progress","Do you expect linear growth or allow for ups and downs?"]
]),
cat("work","شغل، رهبری و اثربخشی","Work & leadership","بین نتیجه و شیوه رسیدن به آن، انتخاب‌های زیادی پنهان‌اند.","How we achieve outcomes matters.",3,
["اختیار رسمی را برجسته کردی. ببین در چه موقعیت‌هایی این قدرت به تصمیم‌گیری کمک می‌کند و چه زمانی مشارکت دیگران ضروری می‌شود.","نفوذ و همراهی را ترجیح دادی. ببین در چه موقعیت‌هایی نقش و مسئولیت رسمی نیز به پیشبرد کار کمک می‌کند."],[
[3,"رئیس","رهبر","اگر یک تیم خسته روبه‌رویت باشد، بیشتر دستور می‌دهی یا جهت و معنا می‌سازی؟","Boss","Leader","With a tired team, do you rely on authority or shared direction?"],
[19,"مربی خوب","مربی عالی","از راهنمایی یک مربی، فقط عملکرد بهتر می‌خواهی یا تغییر عمیق‌تری در نگاهت؟","Good coach","Great coach","Do you seek better performance or a shift in perspective?"],
[46,"سخت کار کردن","هوشمندانه کار کردن","وقتی وظایف زیاد می‌شوند، اولین راه‌حل تو ساعت بیشتر است یا روش بهتر؟","Work harder","Work smarter","With too much work, do you add hours or improve the method?"],
[50,"حرف و وعده","اقدام و عمل","برای سنجیدن قابل‌اعتمادبودن یک نفر، به وعده‌ها تکیه می‌کنی یا رفتار واقعی؟","Promises","Actions","What proves reliability: promises or actions?"],
[57,"اندیشیدن","اقدام کردن","برای ایده‌ای که هنوز کامل نیست، باز هم فکر می‌کنی یا آزمایشی کوچک شروع می‌کنی؟","Think further","Try it out","For an unfinished idea, do you think more or test it?"]
]),
cat("money","اقتصاد، ثروت و معیار ارزش","Wealth & value","ثروت فقط عدد حساب بانکی نیست؛ اما پول هم بی‌اهمیت نیست.","Wealth is not just money, but money matters.",43,
["در این موقعیت، پول و دارایی ملموس را در اولویت گذاشتی. ببین زمان، سلامت و روابط چه سهمی در تعریف تو از ثروت دارند.","در این موقعیت، کیفیت کلی زندگی را جلوتر گذاشتی. ببین چه پشتوانه مالی‌ای برای محافظت از این کیفیت ضروری است."],[
[1,"ثروت","سواد","اگر در پنج سال آینده فقط یکی را چند برابر کنی، دارایی مالی را انتخاب می‌کنی یا دانش و یادگیری را؟","Wealth","Knowledge","Would you rather multiply wealth or knowledge over five years?"],
[16,"من سرمایه","من هزینه","در نگاه به نقش خود در کار و زندگی، خودت را بیشتر سرمایه‌ای در حال رشد می‌بینی یا هزینه‌ای که باید مدیریت شود؟","I am an asset","I am a cost","Do you see your role as an asset to grow or a cost to manage?"],
[43,"پولدار بودن","ثروتمند بودن","حساب پُر اما وقت کم، یا منابع متنوع و فرصت نفس‌کشیدن؛ کدام جذاب‌تر است؟","Money-rich","Life-rich","Would you favor more money or a richer mix of life resources?"],
[45,"کیفیت","کمیت","برای چیزی که دوستش داری، چند تجربه عمیق می‌خواهی یا تعداد زیادی تجربه؟","Quality","Quantity","Would you choose fewer deep experiences or more experiences?"]
]),
cat("relations","روابط و زندگی اجتماعی","Relationships","چه کسانی را نزدیک می‌گذاری و با آن‌ها چطور رفتار می‌کنی؟","Who belongs in your circle?",35,
["حلقه کوچک را انتخاب کردی. این می‌تواند به صمیمیت و عمق کمک کند؛ آیا برای آشنایی‌های تازه هم جایی باقی می‌گذاری؟","حلقه بزرگ را انتخاب کردی. این می‌تواند فرصت‌های متنوعی بیاورد؛ آیا برای رابطه‌های عمیق هم وقت کافی داری؟"],[
[6,"اجبار دیگران به پذیرفتن","اختیار دیگران به پذیرفتن","وقتی پیشنهادت پذیرفته نمی‌شود، بیشتر فشار می‌آوری یا حق انتخاب فرد را به رسمیت می‌شناسی؟","Press for acceptance","Allow choice","When someone rejects your idea, do you push or allow choice?"],
[8,"دیگران کمک من","دیگران مانع من","در روایت مسیرت، آدم‌ها بیشتر همراهت بوده‌اند یا مانع تو؟","Others support me","Others block me","In your story, do people mostly support or obstruct you?"],
[9,"مخفی","آشکار","وقتی هدف تازه‌ای داری، اول در سکوت جلو می‌روی یا از همان ابتدا درباره‌اش حرف می‌زنی؟","Keep private","Share openly","With a new goal, do you stay quiet or share it?"],
[12,"افراد درست","افراد غلط","برای هم‌صحبتی طولانی، بیشتر دنبال آدم‌های همسو می‌روی یا بدون سخت‌گیری انتخاب می‌کنی؟","Right people","Wrong people","How selectively do you choose companions?"],
[13,"دفاع","نقد","وقتی فرد نزدیکی اشتباه می‌کند، اول دفاع می‌کنی یا نقد؟","Defend","Critique","When someone close errs, do you defend or critique first?"],
[14,"در جمع","در خفا","برای بازخورد حساس، گفت‌وگوی جمعی را مناسب‌تر می‌دانی یا صحبت خصوصی را؟","In public","In private","Would you give sensitive feedback publicly or privately?"],
[33,"وصال","فراق","وقتی فاصله‌ای ناخواسته ایجاد می‌شود، بیشتر دنبال نزدیک‌شدن هستی یا معنای فاصله را می‌پذیری؟","Reunion","Distance","When separated, do you seek reunion or accept distance?"],
[35,"حلقه کوچک","حلقه بزرگ","پنج دوست صمیمی یا شبکه‌ای بزرگ از آشنایان؛ کدام بیشتر به تو انرژی می‌دهد؟","Small circle","Large circle","Do close friends or a broad network energize you more?"],
[36,"زندگی خصوصی","زندگی عمومی","برای بخشی از زندگی‌ات که می‌تواند دیده شود، حفظ حریم را ترجیح می‌دهی یا اشتراک‌گذاری را؟","Private life","Public life","Do you lean toward privacy or sharing?"]
]),
cat("wellbeing","آرامش، احساسات و ذهن","Calm & emotions","گاهی انتخاب، میان دو جور زیستن است؛ نه دو کار.","Sometimes choices are between ways of living.",37,
["در این انتخاب، آرامش و خلوت را برگزیدی. ببین چگونه به این نیاز پاسخ می‌دهی بی‌آنکه از فرصت‌های ارزشمند کناره بگیری.","در این انتخاب، درگیری ذهنی و جنب‌وجوش پررنگ‌تر بود. چه زمانی این انرژی کمک می‌کند و چه زمانی مکث به نفع توست؟"],[
[20,"ذهن آسوده","ذهن پرمشغله","وقتی شب می‌رسد، کدام حالت برایت آشناتر است: رهاکردن فکرها یا ادامه‌دادن آن‌ها؟","Unburdened mind","Busy mind","At night, do you let go or keep processing thoughts?"],
[21,"روزهای مهیج","شب‌های آسوده","اگر یکی پررنگ‌تر باشد، روزهای پرهیجان را انتخاب می‌کنی یا شب‌های آرام را؟","Exciting days","Peaceful nights","Would you choose exciting days or peaceful nights?"],
[24,"زندگی جدید","دردهای کهنه","در شروع فصل تازه، بیشتر به امکان‌های نو نگاه می‌کنی یا زخم‌های گذشته؟","New beginnings","Old hurts","At a fresh start, what draws your attention?"],
[25,"آرامش در پنهان","آرامش در آشکار","آرامشت بیشتر در خلوت به دست می‌آید یا وقتی خودت را آشکارا ابراز می‌کنی؟","Calm in privacy","Calm in openness","Where does calm come more naturally?"],
[26,"آرامش در تنهایی","آرامش در جمع","پس از روز سخت، برای شارژشدن تنهایی را می‌خواهی یا همراهی دیگران را؟","Solitude","Company","After a hard day, do you recharge alone or with others?"],
[27,"آرامش در سکوت","آرامش در شلوغی","برای مرتب‌کردن افکارت، سکوت لازم داری یا حضور و صدای زندگی؟","Quiet","Bustle","Where do you think clearly: in silence or in a lively place?"],
[37,"ذهن آرام","ذهن آشفته","وقتی چند مسئله هم‌زمان رخ می‌دهد، ذهنت بیشتر آرام می‌ماند یا شلوغ می‌شود؟","Calm mind","Restless mind","When challenges arrive together, does your mind stay calm or get busy?"],
[38,"توجه","عدم توجه","وقتی رفتاری تو را ناراحت می‌کند، دنبال فهمیدن آن می‌روی یا از کنارش رد می‌شوی؟","Notice","Let pass","When something upsets you, do you examine it or pass it by?"],
[39,"واکنش","عدم واکنش","اگر کسی ناعادلانه قضاوتت کند، سریع پاسخ می‌دهی یا سکوت را انتخاب می‌کنی؟","Respond","Not respond","When judged unfairly, do you respond or let it pass?"],
[40,"سکوت پُر از معنا","سکوت خالی از معنا","وقتی در گفت‌وگو ساکت می‌مانی، سکوتت بیشتر فکر و توجه است یا فاصله‌گرفتن؟","Meaningful silence","Empty silence","Does your silence signal reflection or disconnection?"],
[42,"ذخیره احساسات","مصرف احساسات","وقتی احساس عمیقی داری، آن را برای موقعیت و آدم مناسب نگه می‌داری یا همان لحظه ابراز می‌کنی؟","Save feelings","Express feelings","Do you hold feelings for the right moment or express them now?"]
]),
cat("character","شخصیت، منش و رفتار","Character & behavior","شخصیت را اغلب در ظرافت مرزها می‌شود دید.","Character often lives in subtle distinctions.",48,
["در این انتخاب، تردید و احتیاط را برگزیدی. شاید به زمینه و ریسک حساس هستی؛ ببین در چه موقعیت‌هایی این احتیاط به تو کمک می‌کند.","در این انتخاب، اعتمادبه‌نفس را برگزیدی. ببین کجا این قوت از شواهد می‌آید و کجا شنیدن بازخورد می‌تواند آن را دقیق‌تر کند."],[
[28,"قوی","بی‌ادب","وقتی لازم است محکم بایستی، قاطعیت محترمانه را برمی‌گزینی یا تندی را؟","Strong","Rude","When setting boundaries, do you lean toward strength or harshness?"],
[29,"مهربان","ضعیف","اگر در موقعیتی مهربانی ممکن است بد فهمیده شود، همچنان با مهربانی رفتار می‌کنی یا عقب می‌نشینی؟","Kind","Weak","When kindness could be misread, which response feels closer?"],
[30,"جسور","زورگو","برای رسیدن به خواسته‌ات، جسارت در بیان را ترجیح می‌دهی یا تحمیل نظر را؟","Bold","Pushy","When pursuing a goal, do you speak boldly or push others?"],
[31,"فروتن","خجالتی","در جمعی تازه، بیشتر فروتنی آگاهانه نشان می‌دهی یا به خاطر خجالت سکوت می‌کنی؟","Humble","Shy","In a new group, are you more humble or shy?"],
[32,"مفتخر","مغرور","وقتی موفق می‌شوی، بیشتر با افتخار سالم از آن حرف می‌زنی یا برتری‌ات را نشان می‌دهی؟","Proud","Arrogant","When you succeed, do you feel pride or show superiority?"],
[48,"ناامنی درونی","اعتمادبه‌نفس","در برخورد با یک چالش تازه، کدام احساس زودتر می‌آید: تردید یا اطمینان به توان یادگیری؟","Insecurity","Confidence","Facing a challenge, do doubt or confidence arrive first?"],
[55,"تمرکز","پراکندگی توجه","اگر ده ایده جذاب هم‌زمان داشته باشی، یکی را جلو می‌بری یا میانشان جابه‌جا می‌شوی؟","Focus","Scattered attention","With ten attractive ideas, do you focus on one or switch often?"]
])
];
})();