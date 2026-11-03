const assert=require('node:assert/strict');
const P=require('../single-hire.js'),B=require('../trost-book-workflows.js');
const uid=(()=>{let i=0;return ()=>'test-'+(++i);})();
const db={people:[],roles:[],vacancies:[],evps:[],sourcingPlans:[],activities:[],journeys:[],tasks:[],surveys:[],bookPractice:[]};
const p=P.start(db,uid,'demo');assert.equal(p.stage,0);assert.equal(db.roles.length,1);
const vals=[
['need',{title:'مدیر خرید راهبردی',strategy:'cost',strategic:'5',availability:'2',targetGroup:'مدیران خرید صنایع معدنی',businessImpact:'کاهش ریسک توقف تولید و هزینه خرید',criticalIncident:'تأمین‌کننده حیاتی در بحران به تعهد عمل نمی‌کند',owner:'کارشناس منابع انسانی'}],
['evp',{pillar:'tasks',strengths:'اختیار تصمیم',preferences:'حل مسئله پیچیده',difference:'مشارکت در تصمیم راهبردی',proof:'مثال آزمایشی پروژه ساختگی',message:'دعوت به گفت‌وگو'}],
['source',{channel:'socialmedia',targetGroup:'متخصصان خرید',owner:'کارشناس HR',goal:'سه گفت‌وگوی حرفه‌ای',nextStep:'انتشار روایت پروژه و دعوت داوطلبانه',due:'2026-12-01'}],
['talent',{name:'نامزد فرضی X',title:'مدیر تأمین',source:'referral',consent:'yes',skills:'مدیریت ریسک',evidence:'ارائه در رویداد فرضی',interests:'تجربه مسائل سخت',isFictional:'yes'}],
['retention',{measure:'learning',value:'گفت‌وگوی فنی درباره ریسک تامین',nextAction:'دعوت به نشست با رضایت',nextDate:'2026-12-10',owner:'کارشناس HR'}],
['assessment',{criticalIncident:'در توقف تامین چه می‌کنید؟',evidence:'مثال مستند از انتخاب تأمین‌کننده جایگزین فرضی',development:'آشنایی با نرم‌افزار داخلی',interviewer:'مدیر خرید',recommendation:'review'}],
['experience',{promised:'2026-12-12',message:'پاسخ درباره زمان‌بندی مرحله بعد',responded:'no'}],
['decision',{choice:'nurture',reason:'نیاز به بررسی نیاز آتی با شواهد تکمیلی',decisionMaker:'مدیر واحد',nextAction:'پیگیری سه ماه بعد'}]
];
assert.equal(P.STAGES.length,8);
for(const [kind,v] of vals){const next=P.save(db,kind,v,uid);assert.equal(next.complete.length,8,kind);}
assert.equal(P.complete(db).filter(Boolean).length,8);
assert.equal(db.activities.length,1);assert.equal(db.activities[0].measure,'learning');
assert.equal(db.journeys.length,1);
assert.equal(db.people.length,1);assert.equal(db.people[0].stage,'nurturing');
const text=P.resultText(db);assert.match(text,/موعد حفظ رابطه/);assert.match(text,/Social Media/);
const page=P.render(db);assert.match(page,/هشت گام/);assert.match(page,/Candidate Retention|حفظ رابطه/);
assert.equal(B.data.length,41);assert.equal(new Set(B.data.map(x=>x.key)).size,41);
for(let ch=1;ch<=10;ch++){assert(B.data.some(x=>x.chapter===ch),`Missing book chapter ${ch}`)}
const bookMarkup=B.render(db);assert.match(bookMarkup,/Social Community Recruiting/);assert.match(bookMarkup,/دستیار TRM/);
// Consent gate enforced.
const noConsent={...db,hirePilot:{...db.hirePilot},people:[{...db.people[0],consent:'no'}]};
assert.throws(()=>P.save(noConsent,'retention',vals[4][1],uid),/رضایت/);
console.log('PASS one-hire complete 8-step journey, Trost 41 tools / 10 chapters, consent gate, book view');