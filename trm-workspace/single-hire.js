/* TRM Workspace · Single Hiring Pilot (Trost-inspired).
 * Standalone, local-first, opt-in demo. No AI calls, no networking, no automatic messages,
 * no automatic hiring decisions. All records use the existing local workspace schema.
 */
(function(root){
 'use strict';
 const STAGES=[
  ['نیاز و نقش','نقش حیاتی، هدف کسب‌وکار و فرصت استخدام'],
  ['EVP','وعده واقعی و متناسب با گروه هدف'],
  ['جست‌وجو','کانال، مسئول و اقدام مشخص'],
  ['استعداد','شناخت فرد و رضایت ارتباط'],
  ['حفظ رابطه','اقدام ارزشمند و برنامه پیگیری Candidate Retention'],
  ['ارزیابی','شواهد رفتاری و تصمیم انسانی'],
  ['تجربه نامزد','تعهد پاسخ و پیگیری محترمانه'],
  ['تصمیم و گزارش','ثبت نتیجه و درس‌آموخته‌ها']
 ];
 const STRATEGY={growth:'رشد و توسعه بازار',cost:'رهبری هزینه و بهره‌وری',quality:'کیفیت و تجربه مشتری',innovation:'نوآوری و تمایز'};
 const EVP={tasks:'چالش و استقلال حرفه‌ای',colleagues:'همکاران و یادگیری',benefits:'جبران خدمات و توسعه',values:'فرهنگ و ارزش‌ها',purpose:'معنا و اثر کار',company:'اعتبار و آینده سازمان'};
 const SOURCES={referral:'Employee Referral · معرفی کارکنان',community:'Social Community Recruiting · انجمن حرفه‌ای',social:'Social Media Recruiting · رسانه اجتماعی',campus:'Campus Recruiting · دانشگاه',scouting:'Talent Scouting · استعدادیابی فعال',competitive:'Competitive Intelligence · نقشه بازار',guerilla:'Guerilla Recruiting · اقدام خلاقانه',pr:'Employer PR · روابط عمومی کارفرما',alumni:'Alumni · همکاران پیشین',event:'Talent Community Events · رویداد',direct:'Direct Search · جست‌وجوی مستقیم'};
 const DECISIONS={offer:'پیشنهاد همکاری',hired:'استخدام تأیید شد',nurture:'حفظ رابطه برای آینده',hold:'نیاز به بررسی بیشتر',closed:'عدم ادامه فرایند'};
 const safe=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const today=()=>new Date().toISOString().slice(0,10);
 const byId=(items,id)=>Array.isArray(items)?items.find(x=>x.id===id):null;
 const options=(choices,value)=>Object.entries(choices).map(([k,v])=>`<option value="${safe(k)}"${String(value)===k?' selected':''}>${safe(v)}</option>`).join('');
 const input=(name,label,value='',type='text',attrs='')=>`<label class="hire-field"><span>${safe(label)}</span><input name="${safe(name)}" type="${type}" value="${safe(value)}" ${attrs}></label>`;
 const area=(name,label,value='',placeholder='',attrs='')=>`<label class="hire-field hire-wide"><span>${safe(label)}</span><textarea name="${safe(name)}" rows="3" placeholder="${safe(placeholder)}" ${attrs}>${safe(value)}</textarea></label>`;
 const select=(name,label,data,value)=>`<label class="hire-field"><span>${safe(label)}</span><select name="${safe(name)}">${options(data,value)}</select></label>`;
 const advice=(title,description)=>`<div class="hire-tip"><span class="hire-tip-icon">✧</span><div><b>${safe(title)}</b><p>${safe(description)}</p></div></div>`;
 const header=(title,description)=>`<header class="hire-stage-head"><span class="hire-kicker">SINGLE HIRE · GUIDED WORKFLOW</span><h2>${safe(title)}</h2><p>${safe(description)}</p></header>`;
 const submit=(label='ثبت و ادامه')=>`<div class="hire-form-actions"><button type="submit" class="btn hire-primary">${safe(label)} <span aria-hidden="true">←</span></button></div>`;
 const shellForm=(kind,inner)=>`<form class="hire-form" data-form="pilot-${kind}"><div class="hire-fields">${inner}</div>${submit()}</form>`;
 function ensureCollections(db){for(const k of ['roles','vacancies','evps','sourcingPlans','people','journeys','activities','tasks','surveys'])if(!Array.isArray(db[k]))db[k]=[];}
 function pilot(db){return db.hirePilot && typeof db.hirePilot==='object'?db.hirePilot:null;}
 function refs(db){const p=pilot(db);return {p,role:byId(db.roles,p?.roleId),vacancy:byId(db.vacancies,p?.vacancyId),evp:byId(db.evps,p?.evpId),source:byId(db.sourcingPlans,p?.sourceId),person:byId(db.people,p?.personId),journey:byId(db.journeys,p?.journeyId),retention:byId(db.activities,p?.retentionId)};}
 function complete(db){const r=refs(db);return [!!(r.role?.name&&r.vacancy?.roleId),!!(r.evp?.strengths&&r.evp?.proof),!!(r.source?.channel&&r.source?.owner),!!(r.person?.name),!!(r.retention?.type&&r.retention?.nextDate),!!(r.p?.assessment?.evidence),!!(r.journey?.promised),!!(r.p?.decision?.choice&&r.p?.decision?.reason)];}
 function start(db,id,mode='blank'){
  ensureCollections(db);
  db.hirePilot={id:id(),mode,stage:0,roleId:'',vacancyId:'',evpId:'',sourceId:'',personId:'',retentionId:'',journeyId:'',assessment:null,decision:null,startedAt:new Date().toISOString(),updatedAt:new Date().toISOString()};
  if(mode==='demo'){
   // All of the initial records are explicitly fictional. The user completes the remaining steps.
   const role={id:id(),name:'مدیر خرید راهبردی (مثال آزمایشی)',sector:'retail',strategy:'cost',strategic:5,availability:2,why:'مذاکره و مدیریت تأمین بر بهای تمام‌شده و مزیت رقابتی اثر دارد.',strategyEvidence:'فرض مثال: کاهش ریسک تأمین و کنترل قیمت خرید',targetGroup:'متخصصان خرید صنعتی و زنجیره تأمین',challenges:'وقتی تأمین‌کننده اصلی تحویل را متوقف می‌کند، بین قیمت، کیفیت و زمان تصمیم بگیرد.',createdAt:new Date().toISOString(),pilot:true};
   const vacancy={id:id(),roleId:role.id,owner:'کارشناس منابع انسانی (آزمایشی)',reason:'فرض آزمایشی: توسعه تیم خرید راهبردی',status:'open',deadline:'',createdAt:new Date().toISOString(),pilot:true};
   db.roles.unshift(role);db.vacancies.unshift(vacancy);db.hirePilot.roleId=role.id;db.hirePilot.vacancyId=vacancy.id;
  }
  return db.hirePilot;
 }
 function record(db,kind,values,id){const coll=db[kind];const i=id?coll.findIndex(x=>x.id===id):-1;const prev=i>=0?coll[i]:{};const rec={...prev,...values,id:id||values.id,updatedAt:new Date().toISOString(),createdAt:prev.createdAt||new Date().toISOString()};if(i>=0)coll[i]=rec;else coll.unshift(rec);return rec;}
 function save(db,kind,v,uid){
  ensureCollections(db);const p=pilot(db);if(!p)throw Error('ابتدا یک پرونده استخدام جدید شروع کنید.');
  const val=k=>String(v[k]??'').trim();
  const required=(k,label)=>{if(!val(k))throw Error(label+' را تکمیل کنید.');return val(k)};
  let item;
  if(kind==='need'){
   const role={name:required('title','عنوان نقش'),strategy:val('strategy')||'growth',strategic:Math.min(5,Math.max(1,Number(v.strategic)||3)),availability:Math.min(5,Math.max(1,Number(v.availability)||3)),targetGroup:required('targetGroup','گروه هدف'),strategyEvidence:required('businessImpact','اثر بر کسب‌وکار'),challenges:required('criticalIncident','موقعیت بحرانی شغل'),pilot:true};
   item=record(db,'roles',role,p.roleId||uid());p.roleId=item.id;
   const vacancy={roleId:p.roleId,owner:required('owner','مسئول استخدام'),reason:val('vacancyReason')||'تأمین نقش راهبردی',deadline:val('deadline'),status:byId(db.vacancies,p.vacancyId)?.status||'open',pilot:true};
   item=record(db,'vacancies',vacancy,p.vacancyId||uid());p.vacancyId=item.id;
  }else if(kind==='evp'){
   if(!p.roleId)throw Error('ابتدا نقش را تعریف کنید.');
   item=record(db,'evps',{roleId:p.roleId,pillar:val('pillar')||'tasks',strengths:required('strengths','نقطه قوت واقعی'),preferences:required('preferences','ترجیح گروه هدف'),competition:val('competition'),difference:required('difference','وجه تمایز'),proof:required('proof','شاهد قابل‌تأیید'),message:val('message'),media:val('media'),contentIdea:val('contentIdea'),pilot:true},p.evpId||uid());p.evpId=item.id;
  }else if(kind==='source'){
   if(!p.roleId)throw Error('ابتدا نقش را تعریف کنید.');
   item=record(db,'sourcingPlans',{roleId:p.roleId,channel:val('channel')||'referral',targetGroup:required('targetGroup','گروه هدف کانال'),owner:required('owner','مسئول منبع‌یابی'),goal:required('goal','هدف جست‌وجو'),nextStep:required('nextStep','اقدام بعدی'),due:val('due'),metric:val('metric'),ethicsCheck:val('ethicsCheck'),status:'planned',pilot:true},p.sourceId||uid());p.sourceId=item.id;
  }else if(kind==='talent'){
   if(!p.roleId)throw Error('ابتدا نقش را تعریف کنید.');
   const consent=val('consent')||'unknown';
   if(!['yes','no','unknown'].includes(consent))throw Error('وضعیت رضایت معتبر نیست.');
   const before=byId(db.people,p.personId);
   item=record(db,'people',{name:required('name','نام نمایشی فرد'),title:required('title','تخصص'),skills:val('skills'),source:val('source')||'direct',priority:'B',priorityReason:val('evidence'),stage:before?.stage||'identified',consent,roleId:p.roleId,vacancyId:p.vacancyId,interests:val('interests'),pilot:val('isFictional')==='yes'||Boolean(before?.pilot)},p.personId||uid());p.personId=item.id;
  }else if(kind==='retention'){
   if(!p.personId)throw Error('ابتدا استعداد را ثبت کنید.');
   const person=byId(db.people,p.personId);
   if(person.consent!=='yes')throw Error('بدون رضایت فعال، برنامه تماس نباید ثبت شود.');
   item=record(db,'activities',{measure:val('measure'),personId:p.personId,type:'followup',date:today(),nextDate:required('nextDate','موعد پیگیری'),note:required('value','ارزش حرفه‌ای تعامل'),nextAction:required('nextAction','اقدام بعدی'),owner:required('owner','مسئول رابطه'),state:val('state')||'open',pilot:true},p.retentionId||uid());p.retentionId=item.id;
  }else if(kind==='assessment'){
   if(!p.personId)throw Error('ابتدا استعداد را ثبت کنید.');
   p.assessment={evidence:required('evidence','شاهد شایستگی'),criticalIncident:required('criticalIncident','تحلیل مسئله واقعی'),development:required('development','شکاف قابل توسعه'),interviewer:required('interviewer','ارزیاب انسانی'),recommendation:val('recommendation')||'review',updatedAt:new Date().toISOString()};
   const person=byId(db.people,p.personId);if(person&&person.stage!=='hired')person.stage='selection';
  }else if(kind==='experience'){
   if(!p.personId)throw Error('ابتدا استعداد را ثبت کنید.');
   const person=byId(db.people,p.personId);if(person.consent!=='yes')throw Error('برای برنامه تماس، ابتدا رضایت فعال ثبت کنید.');
   const promised=required('promised','موعد پاسخ');const message=required('message','توضیح تعهد پاسخ');
   const was=byId(db.journeys,p.journeyId);
   item=record(db,'journeys',{personId:p.personId,vacancyId:p.vacancyId,stage:'interview',promised,notes:message,responded:val('responded')==='yes',respondedAt:val('responded')==='yes'?today():was?.respondedAt||'',pilot:true},p.journeyId||uid());p.journeyId=item.id;
   const scores=['speed','transparency','respect'].map(k=>Number(v[k]||0));
   if(scores.some(x=>x>0)){
    if(scores.some(x=>!Number.isInteger(x)||x<1||x>5))throw Error('امتیازهای تجربه نامزد باید ۱ تا ۵ باشند.');
    const survey=record(db,'surveys',{personId:p.personId,vacancyId:p.vacancyId,speed:scores[0],transparency:scores[1],respect:scores[2],comment:val('surveyComment'),pilot:true},p.surveyId||uid());
    p.surveyId=survey.id;
   }
  }else if(kind==='decision'){
   if(!p.assessment?.evidence||!p.personId)throw Error('پیش از تصمیم، ارزیابی مستند را ثبت کنید.');
   const choice=required('choice','تصمیم نهایی');if(!Object.hasOwn(DECISIONS,choice))throw Error('گزینه تصمیم نامعتبر است.');
   p.decision={choice,reason:required('reason','دلیل تصمیم'),decisionMaker:required('decisionMaker','تصمیم‌گیر انسانی'),nextAction:required('nextAction','اقدام بعدی'),lesson:val('lesson'),sponsor:val('sponsor'),date:today()};
   const person=byId(db.people,p.personId),vacancy=byId(db.vacancies,p.vacancyId);
   if(person){person.stage=choice==='hired'?'hired':choice==='closed'?'declined':choice==='nurture'?'nurturing':'selection';}
   if(vacancy){vacancy.status=choice==='hired'?'filled':choice==='closed'?'closed':'active';}
  }else throw Error('مرحله ناشناخته است.');
  const index=['need','evp','source','talent','retention','assessment','experience','decision'].indexOf(kind);
  p.stage=Math.min(7,index+1);p.updatedAt=new Date().toISOString();
  return {step:index,next:p.stage,complete:complete(db)};
 }
 function renderForm(db,stage){const {p,role,vacancy,evp,source,person,journey,retention}=refs(db),assessment=p.assessment||{},decision=p.decision||{};
  if(stage===0)return header('۱. چه کسی را برای چه نقشی نیاز داریم؟','از استراتژی کسب‌وکار شروع کنید؛ عنوان شغلی به‌تنهایی کافی نیست.')+
   advice('معیار Trost · Key Function','در کدام نقش، عملکرد عالی می‌تواند مزیت رقابتی نامتناسب ایجاد کند؟ نقش ضروری لزوماً نقش کلیدی نیست.')+
   shellForm('need',input('title','عنوان دقیق نقش',role?.name||'','text','required maxlength="150"')+select('strategy','اثر اصلی بر استراتژی',STRATEGY,role?.strategy||'cost')+select('strategic','اهمیت راهبردی',{'1':'۱ کم','2':'۲','3':'۳ متوسط','4':'۴ زیاد','5':'۵ بسیار زیاد'},String(role?.strategic||5))+select('availability','دسترسی در بازار',{'1':'۱ بسیار کمیاب','2':'۲ دشوار','3':'۳ متوسط','4':'۴ نسبتاً آسان','5':'۵ فراوان'},String(role?.availability||2))+area('targetGroup','گروه هدف در بازار کار',role?.targetGroup||'','مثال: مدیران خرید صنعتی و متخصصان زنجیره تأمین','required')+area('businessImpact','این نقش چطور برای شرکت ارزش می‌سازد؟',role?.strategyEvidence||'','مثال: کنترل هزینه خرید و کاهش ریسک توقف تولید','required')+area('criticalIncident','در یک اتفاق واقعی و بحرانی، فرد موفق چه می‌کند؟',role?.challenges||'','مثال: تأمین‌کننده اصلی تحویل را متوقف کرده است.','required')+input('vacancyReason','علت باز شدن فرصت',vacancy?.reason||'')+input('owner','مسئول این استخدام',vacancy?.owner||'','text','required')+input('deadline','تاریخ هدف استخدام',vacancy?.deadline||'','date'));
  if(stage===1)return header('۲. چرا یک استعداد خوب ما را انتخاب کند؟','EVP باید واقعی، مورد علاقه گروه هدف و متفاوت از سایر کارفرمایان باشد.')+
   advice('مدل سه‌گانه EVP','توانمندی واقعی کارفرما × ترجیحات گروه هدف × تمایز نسبت به رقبای جذب. هر ادعا باید یک شاهد روشن داشته باشد.')+
   shellForm('evp',select('pillar','محور اصلی EVP',EVP,evp?.pillar||'tasks')+area('strengths','مزیت واقعی ما چیست؟',evp?.strengths||'','مثال: اختیار حل مسائل تأمین در پروژه‌های حساس','required')+area('preferences','از کجا می‌دانیم این گروه چه می‌خواهد؟',evp?.preferences||'','مثال: مصاحبه با متخصصان مشابه؛ فعلاً فرضیه است','required')+area('competition','کارفرمایان رقیب چه پیشنهاد می‌کنند؟',evp?.competition||'','اگر داده ندارید «نیازمند بررسی» بنویسید')+area('difference','تمایز معتبر ما چیست؟',evp?.difference||'','مثال: دسترسی مستقیم به تصمیم‌های راهبردی','required')+area('proof','یک شاهد / Signature Experience',evp?.proof||'','مثال واقعی قابل بررسی؛ ادعای بدون شاهد نگذارید','required')+area('message','متن کوتاه قابل ویرایش برای گروه هدف',evp?.message||'','شعار تبلیغاتی نباشد؛ پیام مستند و صادقانه')+select('media','کانال اصلی رساندن EVP',{'social':'Social Media · روایت و گفت‌وگو','story':'روایت تجربه واقعی کارمند','pr':'Employer PR · روابط عمومی','community':'انجمن حرفه‌ای','event':'رویداد تخصصی'},evp?.media||'story')+area('contentIdea','ایده محتوای قابل‌اثبات برای این کانال',evp?.contentIdea||'','موضوع، مخاطب، قالب، شاهد و دعوت به تعامل'));
  if(stage===2)return header('۳. استعداد مناسب را کجا پیدا کنیم؟','یک کانال انتخاب کنید؛ هدف، اقدام، مسئول و موعد را مشخص کنید.')+
   advice('Active Sourcing','برای نامزد منفعل، ارتباط حرفه‌ای و ارزش‌آفرین بسازید؛ صرفاً آگهی استخدام منتشر نکنید.')+
   shellForm('source',select('channel','کانال اولویت‌دار',SOURCES,source?.channel||'referral')+input('targetGroup','گروه هدف این کمپین',source?.targetGroup||role?.targetGroup||'','text','required')+input('owner','مسئول جست‌وجو',source?.owner||vacancy?.owner||'','text','required')+area('goal','هدف این مرحله',source?.goal||'','مثال: شناسایی سه متخصص واجد شرایط بدون جمع‌آوری پنهانی اطلاعات','required')+area('nextStep','اقدام بعدی مشخص',source?.nextStep||'','مثال: گفت‌وگوی حرفه‌ای با معرفی مدیر خط، بعد از رضایت فرد','required')+input('metric','معیار سنجش این روش',source?.metric||'','text','placeholder="مثال: نرخ پاسخ معتبر / تعداد گفت‌وگوی مفید"')+select('ethicsCheck','کنترل حریم خصوصی و شفافیت',{'checked':'منبع و رضایت بررسی شد','pending':'پیش از اجرا باید بررسی شود'},source?.ethicsCheck||'pending')+input('due','موعد انجام',source?.due||'','date'));
  if(stage===3)return header('۴. یک استعداد را وارد پرونده کنیم','برای تست می‌توانید از نام کاملاً ساختگی استفاده کنید؛ داده واقعی محرمانه وارد نکنید.')+
   advice('Consent & Talent Pool','هر پروفایل باید علت حضور در بانک استعداد و ترجیح تماس داشته باشد؛ آرشیو رزومه بدون رابطه، TRM نیست.')+
   `<div class="hire-inline-action"><button type="button" class="btn secondary" data-action="pilot-fictional">استفاده از نامزد ساختگی آماده</button><small>فاقد نام، شماره یا اطلاعات شخصی واقعی</small></div>`+
   shellForm('talent',input('name','نام نمایشی / کد استعداد',person?.name||'','text','required')+input('title','عنوان تخصصی',person?.title||'','text','required')+select('source','مسیر آشنایی',SOURCES,person?.source||'referral')+select('consent','وضعیت رضایت ارتباط',{unknown:'نامشخص؛ بدون تماس',yes:'با رضایت؛ مجاز به ارتباط',no:'عدم تماس / لغو رضایت'},person?.consent||'unknown')+input('skills','شواهد مهارت یا تجربه',person?.skills||'')+area('evidence','دلیل مرتبط بودن این استعداد',person?.priorityReason||'','فقط شواهد حرفه‌ای، نه ویژگی‌های شخصی')+area('interests','علاقه و آمادگی فرد (اگر گفته باشد)',person?.interests||'','آیا برای تغییر شغل آمادگی دارد؟')+`<input type="hidden" name="isFictional" value="${person?.pilot?'yes':'no'}">`);
  if(stage===4)return header('۵. Candidate Retention؛ رابطه را فعال نگه داریم','داشتن یک نام در Talent Pool کافی نیست؛ برای فرد یک تعامل ارزشمند و اقدام بعدی با موعد تعریف کنید.')+
   advice('Candidate Retention Cycle · Trost Ch.7','با رضایت فرد، یک ارزش حرفه‌ای مستقل از استخدام ایجاد کنید؛ تعامل را مستند کنید، زمان پیگیری بعدی بگذارید و به حق قطع رابطه احترام بگذارید.')+
   (person?.consent!=='yes'?'<div class="hire-warning">پیش از ثبت برنامه تماس، در مرحله ۴ وضعیت رضایت را «مجاز به ارتباط» ثبت کنید.</div>':'')+
   shellForm('retention',select('measure','نوع اقدام ارزش‌آفرین',{'career':'گفت‌وگوی مسیر شغلی','event':'دعوت به نشست تخصصی','learning':'تبادل تجربه با همکار فنی','newsletter':'محتوای انتخابی با رضایت','intro':'گفت‌وگوی حرفه‌ای با مدیر خط'},retention?.measure||'career')+area('value','این تعامل برای فرد چه ارزش واقعی دارد؟',retention?.note||'','مثال: تبادل تجربه درباره مدیریت تأمین در بحران؛ نه فشار برای استخدام','required')+area('nextAction','اقدام بعدی با توافق طرفین',retention?.nextAction||'','مثال: دعوت به گفت‌وگوی تخصصی کوتاه','required')+input('nextDate','تاریخ پیگیری آینده',retention?.nextDate||'','date','required')+input('owner','مالک این رابطه',retention?.owner||vacancy?.owner||'','text','required'));
  if(stage===5)return header('۶. ارزیابی مستند، نه قضاوت سریع','یک سناریوی واقعی و شواهد رفتاری را ثبت کنید؛ تصمیم باید توسط انسان گرفته شود.')+
   advice('Critical Incident & Compensable Gap','مهارت لازم از روز اول را از شکاف قابل آموزش جدا کنید. امتیاز خودکار یا رتبه‌بندی AI نداریم.')+
   shellForm('assessment',area('criticalIncident','تحلیل یک موقعیت بحرانی نقش',assessment.criticalIncident||'','نامزد در توقف تأمین چه تصمیم‌هایی پیشنهاد می‌دهد؟','required')+area('evidence','شاهد عملکرد / پاسخ واقعی نامزد',assessment.evidence||'','رفتار قابل مشاهده، پاسخ مصاحبه یا نمونه کار','required')+area('development','شکاف قابل جبران و برنامه یادگیری',assessment.development||'','مثال: شناخت سیستم داخلی قابل آموزش است','required')+select('recommendation','جمع‌بندی ارزیاب',{review:'نیازمند بررسی بیشتر',continue:'ادامه ارزیابی',pause:'توقف تا دریافت شواهد'},assessment.recommendation||'review')+input('interviewer','نام / نقش ارزیاب انسانی',assessment.interviewer||'','text','required'));
  if(stage===6)return header('۷. تجربه نامزد را مدیریت کنیم','یک قول ساده بدهید: اقدام بعدی چیست، چه کسی پاسخ می‌دهد و چه تاریخی؟')+
   advice('Speed · Transparency · Respect','شفافیت و احترام با ثبت وعده پاسخ و وفای به تعهد سنجیده می‌شود؛ اپ هیچ پیام خودکاری ارسال نمی‌کند.')+
   (person?.consent!=='yes'?`<div class="hire-warning"><b>پیش‌نیاز این مرحله:</b> وضعیت رضایت استعداد «مجاز به ارتباط» نیست. در مرحله چهارم رضایت را اصلاح کنید؛ بدون اجازه پیام ارسال نکنید.</div>`:'')+
   shellForm('experience',input('promised','تاریخ وعده پاسخ',journey?.promised||'','date','required')+area('message','چه پاسخی و از طرف چه کسی داده می‌شود؟',journey?.notes||'','مثال: اعلام نتیجه مصاحبه توسط مسئول جذب؛ حتی در صورت عدم پذیرش','required')+select('responded','آیا پاسخ واقعاً داده شد؟',{no:'هنوز نه',yes:'بله؛ پیگیری انجام شد'},journey?.responded?'yes':'no')+`<div class="hire-wide"><h3 class="h-subhead">Candidate Experience Survey · بازخورد داوطلبانه</h3><p class="h-caption">امتیاز آزمایشی ۱ تا ۵؛ اگر پاسخ واقعی دریافت نشده است خالی بگذارید.</p></div>`+select('speed','سرعت پاسخ‌گویی',{'0':'هنوز نظرسنجی نشده','1':'۱','2':'۲','3':'۳','4':'۴','5':'۵'},String((db.surveys||[]).find(x=>x.id===p.surveyId)?.speed||0))+select('transparency','شفافیت مراحل',{'0':'هنوز نظرسنجی نشده','1':'۱','2':'۲','3':'۳','4':'۴','5':'۵'},String((db.surveys||[]).find(x=>x.id===p.surveyId)?.transparency||0))+select('respect','احترام و قدردانی',{'0':'هنوز نظرسنجی نشده','1':'۱','2':'۲','3':'۳','4':'۴','5':'۵'},String((db.surveys||[]).find(x=>x.id===p.surveyId)?.respect||0))+area('surveyComment','نظر نامزد یا مشاهده ثبت‌شده (اختیاری)',(db.surveys||[]).find(x=>x.id===p.surveyId)?.comment||''));
  return header('۸. تصمیم انسانی و گزارش پایانی','پس از مرور شواهد، تصمیم را مستند کنید. هیچ تصمیمی از سوی AI گرفته نمی‌شود.')+
   advice('Decision & Accountability','تصمیم با ارزیاب/مدیر مجاز است؛ دلیل و اقدام بعدی را ثبت کنید. نتیجه برای گزارش نهایی استفاده می‌شود.')+
   shellForm('decision',select('choice','نتیجه فرایند',DECISIONS,decision.choice||'hold')+area('reason','شواهد و دلیل تصمیم',decision.reason||'','فقط دلیل شغلی و قابل دفاع؛ بدون تبعیض','required')+input('decisionMaker','تأییدکننده انسانی',decision.decisionMaker||'','text','required')+area('nextAction','اقدام بعدی و مسئول آن',decision.nextAction||'','مثال: توافق درباره شرایط پیشنهاد / زمان پیگیری بعدی','required')+input('sponsor','حامی یا صاحب تصمیم در سازمان',decision.sponsor||'')+area('lesson','درس‌آموخته برای استخدام بعدی',decision.lesson||'','چه چیز در sourcing، EVP یا تجربه نامزد بهتر شود؟'));
 }
 function resultText(db){const {p,role,vacancy,evp,source,person,journey}=refs(db);if(!p)return '';
 const a=p.assessment||{},d=p.decision||{};return [
 'گزارش آزمایشی TRM — یک پرونده استخدام',
 'هشدار: داده‌ها صرفاً روی همین دستگاه و برای پایلوت ذخیره می‌شوند.',
 'نقش: '+(role?.name||'تعریف نشده'),
 'اثر راهبردی: '+(role?.strategyEvidence||'ثبت نشده'),
 'گروه هدف: '+(role?.targetGroup||'تعریف نشده'),
 'مسئول جذب: '+(vacancy?.owner||'ثبت نشده'),
 'EVP: '+(evp?.strengths||'ثبت نشده'),
 'شاهد EVP: '+(evp?.proof||'ثبت نشده'),
 'کانال منبع‌یابی: '+(SOURCES[source?.channel]||'ثبت نشده'),
 'اقدام منبع‌یابی: '+(source?.nextStep||'ثبت نشده'),
 'استعداد: '+(person?.name||'ثبت نشده'),
 'رضایت: '+(person?.consent==='yes'?'ثبت‌شده':person?.consent==='no'?'عدم تماس':'نامشخص'),
 'اقدام حفظ رابطه: '+(byId(db.activities,p.retentionId)?.nextAction||'ثبت نشده'),
   'موعد حفظ رابطه: '+(byId(db.activities,p.retentionId)?.nextDate||'ثبت نشده'),
   'شواهد ارزیابی: '+(a.evidence||'ثبت نشده'),
 'تعهد پاسخ: '+(journey?.promised||'ثبت نشده'),
 'انجام تعهد: '+(journey?.responded?'بله':'ثبت نشده / خیر'),
 'تصمیم انسانی: '+(DECISIONS[d.choice]||'ثبت نشده'),
 'دلیل تصمیم: '+(d.reason||'ثبت نشده'),
 'اقدام بعدی: '+(d.nextAction||'ثبت نشده'),
 'Candidate Retention: '+(byId(db.activities,p.retentionId)?.measure||'ثبت نشده')+'؛ موعد: '+(byId(db.activities,p.retentionId)?.nextDate||'ثبت نشده'),
 'Social Media/Employer PR: '+(evp?.media||'ثبت نشده')+'؛ ایده محتوا: '+(evp?.contentIdea||'ثبت نشده'),
 'درس‌آموخته: '+(d.lesson||'ثبت نشده'),
 'مبنای علمی: Armin Trost (2014), Ch.3–9 · کاربرد اقتباسی مستقل',
 ].join('\n');}
 function render(db){ensureCollections(db);const p=pilot(db);if(!p)return `<div class="hire-view"><section class="hire-welcome"><span class="hire-kicker">PILOT · ONE COMPLETE HIRE</span><h2>یک استخدام را، از اول تا آخر، اجرا کنید.</h2><p>در یک مسیر هشت‌مرحله‌ای، نیاز سازمان، EVP، منبع‌یابی، پرونده استعداد، ارزیابی، تجربه نامزد و تصمیم را به هم وصل کنید؛ بدون سرویس بیرونی یا ثبت‌نام.</p><div class="hire-welcome-actions"><button class="btn hire-primary" data-action="pilot-start-demo">شروع با مثال آماده خرید راهبردی</button><button class="btn secondary" data-action="pilot-start-blank">تعریف یک استخدام جدید</button></div><div class="hire-welcome-note">داده نمونه کاملاً ساختگی است. این نسخه Local-First است و برای پرونده واقعی محرمانه سازمان مناسب نیست.</div></section><div class="hire-benefit-grid"><div><strong>۰۱</strong><b>فرم‌های راهنمایی‌شده</b><small>انتخاب گزینه و مثال، نه صفحه خالی</small></div><div><strong>۰۲</strong><b>پرونده واحد</b><small>اطلاعات نقش، فرد و فرصت به یکدیگر مرتبط‌اند</small></div><div><strong>۰۳</strong><b>گزارش قابل استفاده</b><small>نتیجه انسانی و اقدام بعدی مستند می‌شود</small></div></div></div>`;
 const done=complete(db),count=done.filter(Boolean).length,step=Math.max(0,Math.min(7,Number(p.stage)||0)),r=refs(db);const status=count===8?'تمام مراحل ثبت شده':`${count} از ۸ مرحله تکمیل شده`;
 const steps=STAGES.map((s,i)=>`<button type="button" class="hire-step ${i===step?'active':''} ${done[i]?'done':''}" data-action="pilot-step" data-id="${i}" aria-current="${i===step?'step':'false'}"><span class="hire-step-no">${done[i]?'✓':String(i+1).padStart(2,'0')}</span><span class="hire-step-label">${safe(s[0])}</span></button>`).join('');
 const synopsis=`<div class="hire-context"><div><span>پرونده فعال</span><strong>${safe(r.role?.name||'یک استخدام جدید')}</strong></div><div><span>مسئول</span><strong>${safe(r.vacancy?.owner||'هنوز مشخص نشده')}</strong></div><div><span>نامزد</span><strong>${safe(r.person?.name||'ثبت نشده')}</strong></div></div>`;
 const after=step===7?`<section class="hire-result"><div><h3>جمع‌بندی پرونده</h3><p>بر مبنای اطلاعات ثبت‌شده شما؛ بدون عدد نمایشی یا قضاوت خودکار.</p></div><dl><dt>وضعیت</dt><dd>${safe(r.p?.decision?.choice?DECISIONS[r.p.decision.choice]:'در انتظار تصمیم')}</dd><dt>پوشش مراحل</dt><dd>${count} از ۸</dd><dt>پیگیری نامزد</dt><dd>${r.journey?.responded?'انجام شده':'در انتظار پاسخ یا ثبت'}</dd></dl><div class="hire-form-actions"><button type="button" class="btn secondary" data-action="pilot-copy">کپی گزارش پرونده</button><button type="button" class="btn secondary" data-action="pilot-print">چاپ / PDF</button></div></section>`:'';
 return `<div class="hire-view"><section class="hire-banner"><div><span class="hire-kicker">WORKING PILOT · SINGLE HIRE</span><h2>یک پرونده. هشت گام. یک نتیجه روشن.</h2><p>همه مراحل به یک موقعیت استخدامی وصل‌اند. فقط داده آزمایشی، بدون AI متصل یا پیام خودکار.</p></div><div class="hire-progress"><strong>${Math.round(count/8*100)}٪</strong><span>${status}</span></div></section><div class="hire-progress-bar" role="progressbar" aria-valuemin="0" aria-valuemax="8" aria-valuenow="${count}"><span style="width:${count/8*100}%"></span></div><nav class="hire-stepper" aria-label="مراحل استخدام">${steps}</nav>${synopsis}<section class="hire-stage-card">${renderForm(db,step)}<div class="hire-learning-bar"><button class="btn secondary" data-action="pilot-open-library">▤ کتاب و ابزارهای Trost در این مرحله</button><button class="btn secondary" data-go="agent">✧ دستیار TRM</button><button class="btn secondary" data-action="pilot-coach">راهنمای هوشمند همین گام</button></div>${p.showCoach?'<div class="hire-coach-note"><b>Next Best Step · راهنمای داخلی</b><p>'+safe(["نقش و گروه هدف را با شواهد تعریف کنید؛ تصمیم راهبردی نیازمند دلیل است.","EVP را با قوت واقعی، ترجیح گروه هدف و شاهد قابل بررسی بسازید.","کانال Sourcing را متناسب با جامعه هدف و با معیار پاسخ انتخاب کنید.","تنها با رضایت فرد ارتباط بگیرید و دلیل حرفه‌ای تناسب را مستند کنید.","Candidate Retention چرخه تعامل ارزشمند و پیگیری است، نه فقط آرشیو رزومه.","در مصاحبه شواهد رفتاریِ Critical Incident را ثبت کنید و شکاف قابل آموزش را جدا سازید.","برای تجربه مثبت، Speed و Transparency و احترام را با موعد پاسخ واقعی نشان دهید.","نتیجه را انسان با شواهد ثبت کند؛ پیشنهاد استخدام، استخدام قطعی نیست."][step])+"</p><small>این توصیه از راهنمای قاعده‌محور کتاب استخراج می‌شود؛ مدل زبانی مولد به اپ متصل نشده است.</small></div>":''}</section>${after}<footer class="hire-bottom"><span>این پایلوت نقش فناوری‌های ATS، CRM سازمانی یا AI متصل را ادعا نمی‌کند.</span><button class="btn ghost small" data-action="pilot-reset">شروع پرونده آزمایشی دیگر</button></footer></div>`;
 }
 function onAction(action,uid,db,ctx){
  if(action==='pilot-start-demo'||action==='pilot-start-blank'){if(pilot(db)&&!confirm('پرونده فعال با یک پرونده تازه جایگزین شود؟ رکوردهای قبلی حذف نمی‌شوند.'))return;start(db,ctx.id,action.endsWith('demo')?'demo':'blank');ctx.persist();ctx.render();ctx.toast('پرونده استخدام آزمایشی ایجاد شد.');return true;}
  if(action==='pilot-step'){const p=pilot(db);if(!p)return true;p.stage=Math.max(0,Math.min(6,Number(uid)||0));ctx.persist();ctx.render();return true;}
  if(action==='pilot-fictional'){const p=pilot(db);if(!p?.roleId){ctx.toast('ابتدا نقش را تعریف کنید.');return true;}
   if(p.personId&&!confirm('نامزد قبلی این پایلوت با یک پرونده ساختگی جایگزین شود؟'))return true;
   const rec=record(db,'people',{name:'نامزد آزمایشی الف',title:'متخصص خرید و زنجیره تأمین (ساختگی)',skills:'مذاکره چندجانبه، تحلیل هزینه، مدیریت ریسک تأمین (فرض آزمایشی)',source:'referral',priority:'B',priorityReason:'نمونه ساختگی برای تمرین معیارهای شغلی',stage:'identified',consent:'yes',roleId:p.roleId,vacancyId:p.vacancyId,interests:'نمونه آموزشی؛ هیچ شخص واقعی وجود ندارد',pilot:true},ctx.id());p.personId=rec.id;p.stage=4;ctx.persist();ctx.render();ctx.toast('نامزد کاملاً ساختگی ثبت شد.');return true;}
  if(action==='pilot-open-library'){ctx.go('playbook');return true;}
  if(action==='pilot-coach'){const p=pilot(db);if(!p)return true;p.showCoach=!p.showCoach;ctx.persist();ctx.render();return true;}
  if(action==='pilot-reset'){if(!confirm('پرونده پایلوت فعلی کنار گذاشته شود و صفحه شروع نمایش داده شود؟ رکوردهای قبلی باقی می‌مانند.'))return true;db.hirePilot=null;ctx.persist();ctx.render();return true;}
  if(action==='pilot-copy'){const copy=resultText(db);if(navigator.clipboard?.writeText){navigator.clipboard.writeText(copy).then(()=>ctx.toast('گزارش کپی شد.')).catch(()=>ctx.toast('اجازه کپی در این مرورگر فعال نیست.'));}else ctx.toast('کپی در این مرورگر پشتیبانی نمی‌شود.');return true;}
  if(action==='pilot-print'){window.print();return true;}
  return false;
 }
 function onForm(form,db,ctx){const kind=String(form.dataset.form||'').replace(/^pilot-/,'');const values=Object.fromEntries(new FormData(form));const result=save(db,kind,values,ctx.id);if(!ctx.persist())return;ctx.render();ctx.toast('مرحله ثبت شد؛ به گام بعدی بروید.');return result;}
 const api=Object.freeze({render,start,save,complete,refs,resultText,onAction,onForm,STAGES});
 root.TRMSingleHire=api;
 if(typeof module!=='undefined'&&module.exports)module.exports=api;
})(typeof window!=='undefined'?window:globalThis);