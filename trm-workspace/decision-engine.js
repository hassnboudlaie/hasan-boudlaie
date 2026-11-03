/* TRM Decision Engine v3 — explainable, local, privacy-preserving decision support.
   This is NOT a connected generative LLM. No external network calls, no candidate scoring.
   Independent adaptation from Trost (2014), ch.3–9. */
(function(root){
"use strict";
const isText=v=>typeof v==="string"&&v.trim().length>2;
const val=v=>String(v??"").trim();
const list=v=>Array.isArray(v)?v:[];
const book={
  strategy:"Trost (2014), فصل ۴: Key/Bottleneck Functions; نمودارهای ۴.۱ و ۴.۴",
  evp:"Trost (2014), فصل ۵: شکل‌های ۵.۳ و ۵.۶",
  vacancy:"Trost (2014), فصل‌های ۳، ۴، ۶، ۷ و ۸: Talent Focus و Candidate Retention",
  relationship:"Trost (2014), فصل ۷: Candidate Retention Cycle و Documentation",
  governance:"Trost (2014), فصل ۹: Management, Organisation and IT"
};
function roleAssessment(db,role){
  if(!role)return {title:"تحلیل نقش‌های بحرانی",summary:"ابتدا نقش یا خانواده شغلی را تعریف کنید.",readiness:"نیازمند داده",missing:["نقش هدف","اهمیت راهبردی","تقاضای آتی","دسترسی بازار"],steps:[
    "استراتژی سازمان و دلیل ایجاد ارزش رقابتی را ثبت کنید.",
    "تقاضا، خروج پیش‌بینی‌شده و دسترسی به استعداد در بازار را برآورد کنید.",
    "با مدیر صف Critical Incidents را شناسایی کنید.",
    "گروه هدف مستقیم و جایگزین را تعریف کنید."],source:book.strategy};
  const strategic=Number(role.strategic)||0,availability=Number(role.availability)||0,demand=Number(role.demand)||0;
  const isKey=strategic>=4,isBottleneck=availability>0&&availability<=2&&demand>0;
  const kind=isKey&&isBottleneck?"هم Key و هم Bottleneck":isKey?"Key Function":isBottleneck?"Bottleneck Function":"نیازمند بررسی موقعیت در پرتفوی";
  const missing=[["strategyEvidence","شاهد پیوند نقش با استراتژی"],["marketEvidence","شواهد دسترسی به نیروی کار"],["challenges","موقعیت‌های بحرانی نقش"],["targetGroup","گروه هدف"],["gap","شکاف مهارتی قابل جبران"]].filter(([k])=>!isText(role[k])).map(([,title])=>title);
  return {title:"تشخیص نقش: "+val(role.name),summary:"طبقه‌بندی مقدماتی: "+kind+"؛ بر مبنای امتیازهای ثبت‌شده، نه داده زنده بازار. حدود امتیاز در این اپ یک قاعده طراحی است، نه فرمول رسمی Trost.",readiness:missing.length?"نیازمند تکمیل":"برای تصمیم مدیریتی آماده",
    missing,steps:["با مدیر ارشد نقش را در پرتفوی سه‌معیاره تأیید کنید.","از دو یا سه Critical Incident برای تعریف توانایی‌های لازم استفاده کنید.","نیاز روز اول را از قابلیت‌های قابل‌یادگیری تفکیک کنید.","گروه مستقیم، جایگزین و کانال‌های دسترسی را مشخص کنید."],source:book.strategy};
}
function evpAssessment(db,role,evp){
  if(!role)return {title:"EVP Coach",summary:"برای تدوین EVP، ابتدا گروه هدف مرتبط با یک نقش تعریف شود.",readiness:"نیازمند داده",missing:["نقش هدف"],steps:["ابتدا در بخش نقش‌های حیاتی، نقش هدف را ثبت کنید."],source:book.evp};
  evp=evp||{};
  const keys=[["strengths","نقاط قوت واقعی سازمان"],["preferences","ترجیحات مبتنی بر داده گروه هدف"],["competition","رقبای جذب استعداد"],["difference","تمایز قابل دفاع"],["proof","شاهد واقعی و Signature Experience"]];
  const missing=keys.filter(([k])=>!isText(evp[k])).map(([,label])=>label);
  const complete=!missing.length;
  let text="برای «"+val(role.name)+"»";
  if(isText(evp.preferences))text+=" و افرادی که "+val(evp.preferences)+" برایشان مهم است";
  if(isText(evp.strengths))text+="، این سازمان می‌تواند "+val(evp.strengths)+" را ارائه کند";
  if(isText(evp.difference))text+="؛ وجه تمایز قابل‌بررسی: "+val(evp.difference);
  if(isText(evp.proof))text+=". شاهد ثبت‌شده: "+val(evp.proof);
  else text+=". ⚠ این وعده هنوز فاقد شاهد عینی و آماده انتشار نیست";
  text+=".";
  return {title:"ممیزی EVP · "+val(role.name),summary:complete?"پنج ورودی ضروری ثبت شده است؛ اعتبار آنها باید با کارمندان و گروه هدف راستی‌آزمایی شود.":"پیش‌نویس EVP هنوز داده کافی برای وعده قابل انتشار ندارد.",readiness:complete?"آماده بازبینی انسانی":"پیش‌نویس مشروط",
    draft:text,missing,steps:["اعتبار نقاط قوت را با تجربه واقعی کارکنان راستی‌آزمایی کنید.","ترجیحات را از اعضای واقعی گروه هدف جمع‌آوری کنید.","مزیت‌های مشابه رقبا را از ادعای تمایز حذف کنید.","از تجربه‌های واقعی، پیام اختصاصی کوتاه بسازید و پیش از انتشار تأیید کنید."],source:book.evp};
}
function vacancyAssessment(db,role,vacancy){
  if(!role)return {title:"Vacancy Activation",summary:"ابتدا نقش موردنظر را تعریف کنید.",readiness:"نیازمند نقش",missing:["نقش"],steps:["یک نقش حیاتی تعریف کنید."],source:book.vacancy};
  const pool=list(db.people).filter(p=>p.roleId===role.id),consented=pool.filter(p=>p.consent==="yes"&&p.readiness!=="no");
  const evp=list(db.evps).find(e=>e.roleId===role.id);
  const plans=list(db.sourcingPlans).filter(p=>p.roleId===role.id);
  const missing=[];
  if(!isText(role.targetGroup))missing.push("تعریف گروه هدف");
  if(!isText(role.challenges))missing.push("چالش‌های بحرانی شغل");
  if(!evp||!isText(evp.proof))missing.push("EVP معتبر و دارای شاهد");
  if(!vacancy||!isText(vacancy.reason))missing.push("علت و ضرورت فرصت شغلی");
  if(!vacancy||!isText(vacancy.owner))missing.push("مسئول اجرایی جذب");
  const steps=[
    "۱. ضرورت فرصت و تصویب مدیر واحد را مشخص کنید؛ بررسی کنید آیا جابه‌جایی داخلی پاسخ می‌دهد.",
    "۲. Critical Incidents و الزامات روز اول را با مدیر صف بازنگری کنید.",
    "۳. "+(consented.length?"بانک استعداد: "+consented.length+" پرونده مرتبط با اجازه تماس/عدم مخالفت ثبت شده؛ تناسب را انسانی بررسی کنید.":"بانک استعداد: گزینه مرتبط با اجازه تماس ثبت نشده؛ بدون مجوز تماس نگیرید.") ,
    "۴. "+(evp&&isText(evp.proof)?"EVP گروه هدف موجود است؛ پیام آن را با فرصت فعلی تطبیق دهید.":"EVP با شواهد واقعی برای گروه هدف تهیه و تأیید کنید."),
    "۵. "+(plans.length?plans.length+" برنامه منبع‌یابی مرتبط وجود دارد؛ نتایج را بررسی و اصلاح کنید.":"Employee Referrals، شبکه متخصصان، Campus یا Scouting را متناسب با گروه هدف انتخاب کنید."),
    "۶. تماس فردی و محترمانه با رضایت و ثبت در Timeline؛ از پیام‌های انبوه بدون زمینه خودداری کنید.",
    "۷. ارزیابی متناسب با چالش‌های واقعی، همراه با سرعت، شفافیت و احترام در تمام نقاط تماس.",
    "۸. ثبت نتایج، علت انصراف یا عدم پذیرش، تصمیم نهایی و یادگیری برای Talent Pool."
  ];
  return {title:"برنامه فعال‌سازی: "+val(role.name),summary:"نقش: "+val(role.name)+" | استعدادهای مرتبط ثبت‌شده: "+pool.length+" | دارای اجازه تماس و بدون مخالفت صریح: "+consented.length+" | برنامه‌های کانال: "+plans.length+". این اعداد، امتیاز تناسب یا پیش‌بینی موفقیت استخدام نیستند.",
    readiness:missing.length?"برنامه مشروط به تکمیل داده":"آماده تأیید برنامه",missing,steps,source:book.vacancy};
}
function relationshipAssessment(db){
  const people=list(db.people),acts=list(db.activities),now=new Date().toISOString().slice(0,10),overdue=acts.filter(a=>a.nextDate&&a.nextDate<=now&&a.state!=="done");
  const unconsented=people.filter(p=>p.consent!=="yes"), withoutActions=people.filter(p=>!acts.some(a=>a.personId===p.id));
  return {title:"Relationship Coach",summary:"بانک استعداد: "+people.length+" پرونده؛ "+overdue.length+" پیگیری سررسید؛ "+unconsented.length+" پرونده بدون مجوز فعال تماس؛ "+withoutActions.length+" پرونده بدون تعامل. این وضعیت از داده‌های همین دستگاه استخراج شده است.",
    readiness:"بررسی عملیاتی",missing:[],steps:[
      "پیگیری‌های سررسید را به ترتیب توافق‌های قبلی بررسی کنید؛ قبل از هر تماس، رضایت و ترجیح فرد را کنترل کنید.",
      "برای هر فرد، آخرین گفت‌وگو، علاقه حرفه‌ای و اقدام بعدی مورد توافق را در Timeline ثبت کنید.",
      "پرونده‌های فاقد تعامل را با هدف روشن بازنگری کنید؛ نگهداری نامحدود داده توصیه نمی‌شود.",
      "برای افرادی که تمایل به ارتباط ندارند، هیچ اقدام ترویجی خودکار ایجاد نکنید."
    ],source:book.relationship};
}
function analyze(db,mode,opts={}){
  const role=list(db.roles).find(r=>r.id===opts.roleId)||list(db.roles)[0];
  if(mode==="evp")return evpAssessment(db,role,list(db.evps).find(e=>e.roleId===role?.id));
  if(mode==="role")return roleAssessment(db,role);
  if(mode==="relationship")return relationshipAssessment(db);
  if(mode==="vacancy")return vacancyAssessment(db,role,list(db.vacancies).find(v=>v.id===opts.vacancyId)||list(db.vacancies).find(v=>v.roleId===role?.id));
  return {title:"TRM Coach",summary:"نوع تحلیل را انتخاب کنید.",missing:[],steps:[],source:book.governance};
}
root.TRMEngine=Object.freeze({analyze,evpAssessment,vacancyAssessment,roleAssessment,relationshipAssessment,version:"3.0"});
})(window);
