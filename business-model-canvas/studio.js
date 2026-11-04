
(()=>{'use strict';
const KEY='hb-bmc-studio-v2', OLD='hb-bmc-demo-v1';

const BANK=window.BMCChoiceBank||{questions:{},industry:{}};
const REGISTRY_KEY='hb-bmc-project-registry-v1', ACTIVE_KEY='hb-bmc-active-project-v1', PROJECT_PREFIX='hb-bmc-project-v1-';
function makeId(){return 'bmc-'+Date.now().toString(36)+'-'+Math.random().toString(36).slice(2,9)}
function registry(){try{const x=JSON.parse(localStorage.getItem(REGISTRY_KEY)||'[]');return Array.isArray(x)?x.filter(y=>y&&typeof y.id==='string'):[]}catch(e){return []}}
function setRegistry(rows){try{localStorage.setItem(REGISTRY_KEY,JSON.stringify(rows))}catch(e){}}
function initWorkspace(){let rows=registry();if(!rows.length){rows=[{id:makeId(),name:'اولین مدل کسب‌وکار',owner:'',updatedAt:new Date().toISOString()}];setRegistry(rows)}
let active='';try{active=localStorage.getItem(ACTIVE_KEY)||''}catch(e){}
if(!rows.some(r=>r.id===active))active=rows[0].id;
try{localStorage.setItem(ACTIVE_KEY,active)}catch(e){}
return active}
let workspaceId=initWorkspace();
function refreshWorkspaceSelector(){
 const picker=document.getElementById('workspaceSelect');if(!picker)return;
 picker.replaceChildren();registry().forEach(w=>{const opt=document.createElement('option');opt.value=w.id;opt.textContent=(w.name||'مدل بدون نام')+(w.owner?' · '+w.owner:'');picker.append(opt)});picker.value=workspaceId;
}
function updateWorkspaceLabel(){
 const rows=registry(),r=rows.find(x=>x.id===workspaceId);if(!r)return;
 r.name=String(state.profile.businessName||'مدل بدون نام').trim().slice(0,90);
 r.owner=String(state.profile.ownerName||'').trim().slice(0,80);
 r.updatedAt=state.updatedAt||new Date().toISOString();
 setRegistry(rows);refreshWorkspaceSelector();
}
function switchWorkspace(id){
 if(!registry().some(w=>w.id===id)||id===workspaceId)return;
 save();workspaceId=id;try{localStorage.setItem(ACTIVE_KEY,id)}catch(e){}
 state=load();initProfile();refreshWorkspaceSelector();goto('dashboard');
}
function createWorkspace(){
 const owner=prompt('نام یا نام مستعار صاحب مدل جدید (اختیاری):','');if(owner===null)return;
 save();const id=makeId(),rows=registry();rows.push({id,name:'مدل جدید',owner:owner.trim().slice(0,80),updatedAt:new Date().toISOString()});
 setRegistry(rows);workspaceId=id;state=fresh();state.profile.ownerName=owner.trim().slice(0,80);
 try{localStorage.setItem(ACTIVE_KEY,id)}catch(e){}
 save();initProfile();refreshWorkspaceSelector();goto('onboard');
}

const BLOCKS=[
{id:'segments',title:'بخش‌های مشتریان',en:'Customer Segments',desc:'مشتری مشخص، مسئله مشخص؛ نه «همه مردم».',questions:[
{id:'seg_main',title:'مشتریان اصلی شما چه کسانی هستند؟',help:'مثال: مدیران منابع انسانی سازمان‌های ۲۰۰ تا ۵۰۰ نفر، نه صرفاً «شرکت‌ها».',type:'text',core:true},
{id:'seg_need',title:'مهم‌ترین نیاز یا مشکل حل‌نشده این گروه چیست؟',help:'مسئله را از زبان مشتری و در قالب موقعیت واقعی توضیح بده.',type:'text',core:true},
{id:'seg_decider',title:'در شرکت مشتری، چه کسی تصمیم به خرید می‌گیرد و چه کسی استفاده می‌کند؟',help:'ممکن است تصمیم‌گیرنده خرید با استفاده‌کننده متفاوت باشد.',type:'text',when:p=>p.market==='b2b'||p.market==='both'},
{id:'seg_behavior',title:'مشتری شخصی شما معمولاً چگونه تصمیم به خرید می‌گیرد؟',help:'موقعیت، معیار انتخاب، زمان و محرک خرید را توضیح بده.',type:'text',when:p=>p.market==='b2c'||p.market==='both'},
{id:'seg_first',title:'برای شروع سراغ کدام زیرگروه کوچک‌تر می‌روید؟',help:'مشتریان اولیه: مشتریانی که مسئله برایشان شدیدتر و دسترسی به آنان آسان‌تر است.',type:'text'}
]},
{id:'value',title:'ارزش پیشنهادی',en:'Value Proposition',desc:'چه ارزشی، برای کدام مسئله و در مقایسه با چه جایگزینی؟',questions:[
{id:'val_problem',title:'کدام مسئله مشخص را حل می‌کنی؟',help:'آیا مشتری همین حالا برای حل آن هزینه، زمان یا تلاش می‌کند؟',type:'text',core:true},
{id:'val_solution',title:'محصول یا خدمت شما چیست و چه نتیجه‌ای به مشتری می‌دهد؟',help:'نتیجه دریافتی را توضیح بده، نه فقط فهرست ویژگی‌ها را.',type:'text',core:true},
{id:'val_alt',title:'مشتری در نبود شما از چه جایگزین‌هایی استفاده می‌کند؟',help:'رقبا، انجام کار به روش دستی یا حتی انجام ندادن کار.',type:'text'},
{id:'val_edge',title:'چه تمایز قابل اثباتی در برابر این جایگزین‌ها دارید؟',help:'از ادعاهایی مانند «کیفیت عالی» بدون شاهد پرهیز کن.',type:'text'}
]},
{id:'channels',title:'کانال‌ها',en:'کانال‌ها',desc:'مشتری چگونه از شما مطلع می‌شود، می‌خرد و خدمت را دریافت می‌کند؟',questions:[
{id:'chan_discovery',title:'مشتریان چطور با شما آشنا خواهند شد؟',help:'یک یا چند کانال واقعاً قابل آزمون انتخاب کن.',type:'multi',options:['معرفی مشتریان','شبکه‌های اجتماعی','سئو و وب‌سایت','فروش حضوری','فروش مستقیم سازمانی','نمایندگی یا شریک فروش','تبلیغات پولی','رویدادها و شبکه‌سازی'],core:true},
{id:'chan_sale',title:'مراحل خرید از آشنایی تا پرداخت چیست؟',help:'مثال: آشنایی → مشاوره اولیه → پیشنهاد قیمت → قرارداد.',type:'text',core:true},
{id:'chan_delivery',title:'محصول یا خدمت چگونه تحویل داده می‌شود؟',help:'فروش اینترنتی، ارسال، جلسه حضوری، تحویل پروژه یا روش دیگر.',type:'text'},
{id:'chan_test',title:'کدام کانال را با کمترین هزینه در ۳۰ روز اول آزمایش می‌کنی؟',help:'آزمایش قابل اندازه‌گیری تعریف کن.',type:'text'}
]},
{id:'relations',title:'ارتباط با مشتری',en:'Customer Relationships',desc:'چگونه مشتری را جذب، همراهی و حفظ می‌کنی؟',questions:[
{id:'rel_type',title:'مدل اصلی رابطه با مشتری چیست؟',help:'یکی را به عنوان مدل غالب انتخاب کن.',type:'select',options:['پشتیبانی و تعامل انسانی','خودخدمتی / دیجیتال','مدیر حساب اختصاصی','جامعه و شبکه کاربران','ترکیبی'],core:true},
{id:'rel_onboard',title:'پس از اولین خرید چگونه مشتری را همراهی می‌کنی؟',help:'اولین تجربه مشتری را طراحی کن.',type:'text'},
{id:'rel_retention',title:'برای تکرار خرید یا حفظ مشتری چه برنامه‌ای داری؟',help:'حفظ مشتری و ارزش خریدهای تکراری.',type:'text',core:true},
{id:'rel_feedback',title:'بازخورد و شکایت مشتری چگونه دریافت و پیگیری می‌شود؟',help:'مثلاً نظرسنجی، تماس پس از فروش، پاسخگویی مشخص.',type:'text'}
]},
{id:'revenues',title:'جریان درآمد',en:'Revenue Streams',desc:'برای چه ارزشی و با چه الگوی قیمت‌گذاری پول دریافت می‌کنی؟',questions:[
{id:'rev_model',title:'مدل اصلی درآمد چیست؟',help:'یک مدل غالب را انتخاب کن؛ در صورت نیاز مدل مکمل را توضیح بده.',type:'select',options:['فروش کالا','فروش خدمات','اشتراک ماهانه / سالانه','قرارداد پروژه‌ای','کارمزد / کمیسیون','مجوز استفاده / لایسنس','ترکیبی'],core:true},
{id:'rev_price',title:'قیمت یا دامنه تقریبی قیمت چگونه تعیین می‌شود؟',help:'فرضیات قیمت و مقایسه با جایگزین‌ها را بیان کن؛ رقم نامطمئن را قطعی معرفی نکن.',type:'text',core:true},
{id:'rev_repeat',title:'مشتری هر چند وقت یکبار خرید می‌کند و چه چیزی موجب خرید بعدی می‌شود؟',help:'یک‌باره، ماهانه، دوره‌ای یا به‌ازای استفاده.',type:'text'},
{id:'rev_evidence',title:'چه شاهدی از تمایل به پرداخت مشتری داری؟',help:'تمایل ابرازشده با پرداخت واقعی تفاوت دارد.',type:'select',options:['هنوز هیچ شاهدی ندارم','مصاحبه یا ابراز علاقه','پیش‌سفارش','پرداخت یا فروش واقعی'],core:true}
]},
{id:'resources',title:'منابع کلیدی',en:'Key Resources',desc:'برای ساخت و ارائه ارزش به چه دارایی‌هایی نیاز داری؟',questions:[
{id:'res_team',title:'چه نقش‌ها و شایستگی‌های انسانی ضروری است؟',help:'افراد، تجربه تخصصی، فروش، فناوری، عملیات و مدیریت.',type:'text',core:true},
{id:'res_assets',title:'چه دارایی، زیرساخت یا منابع مالی لازم است؟',help:'تجهیزات، مکان، مجوز، داده، موجودی یا سرمایه در گردش.',type:'text',core:true},
{id:'res_access',title:'چه منبع یا قابلیت مهمی فعلاً در اختیار ندارید؟',help:'کمبود توانمندی یا وابستگی پرریسک.',type:'text'},
{id:'res_ip',title:'چه دانش، برند، شبکه یا فناوری تمایزآفرین دارید؟',help:'مزیتی که رقبا به‌آسانی کپی نمی‌کنند.',type:'text'}
]},
{id:'activities',title:'فعالیت‌های کلیدی',en:'Key Activities',desc:'کدام فعالیت‌ها مستقیماً ایجاد و تحویل ارزش را ممکن می‌کند؟',questions:[
{id:'act_delivery',title:'سه فعالیت اصلی تولید یا ارائه ارزش چیست؟',help:'مثال: تأمین، تولید و تحویل / جذب مشتری، اجرا و پشتیبانی.',type:'text',core:true},
{id:'act_sale',title:'فرایند اصلی فروش و جذب مشتری را چه کسی انجام می‌دهد؟',help:'مسئولیت، ظرفیت و گلوگاه را مشخص کن.',type:'text'},
{id:'act_quality',title:'چطور کیفیت خروجی را می‌سنجی و بهبود می‌دهی؟',help:'شاخص کیفیت، فرایند کنترل، حلقه بازخورد.',type:'text'},
{id:'act_ops',title:'بزرگ‌ترین گلوگاه عملیاتی فعلی یا احتمالی چیست؟',help:'مثلاً تأمین، نیروی انسانی، تحویل یا نقدینگی.',type:'text'}
]},
{id:'partners',title:'شرکای کلیدی',en:'Key Partners',desc:'چه فعالیت یا منبعی از بیرون کسب‌وکار فراهم می‌شود؟',questions:[
{id:'par_core',title:'کدام تأمین‌کنندگان یا شرکای حیاتی را نیاز داری؟',help:'فقط شرکایی که بدون آن‌ها مدل آسیب می‌بیند.',type:'text',core:true},
{id:'par_role',title:'هر شریک دقیقاً چه ارزش یا منبعی ارائه می‌دهد؟',help:'تأمین، توزیع، فناوری، اعتبار یا دسترسی به مشتری.',type:'text'},
{id:'par_risk',title:'اگر مهم‌ترین شریک همکاری را قطع کند، راه‌حل جایگزین چیست؟',help:'وابستگی حیاتی را شناسایی کن.',type:'text'},
{id:'par_contract',title:'مبنای همکاری و تعهدات طرفین چیست؟',help:'توافق، قرارداد یا شیوه پرداخت.',type:'text'}
]},
{id:'costs',title:'ساختار هزینه',en:'Cost Structure',desc:'برای ایجاد، رساندن و نگه‌داشت ارزش چقدر هزینه می‌کنید؟',questions:[
{id:'cost_fixed',title:'مهم‌ترین هزینه‌های ثابت ماهانه چیست؟',help:'حقوق، اجاره، نرم‌افزار، بیمه یا هزینه دفتر.',type:'text',core:true},
{id:'cost_variable',title:'هزینه‌های متغیر هر سفارش یا مشتری چیست؟',help:'مواد اولیه، کارمزد، ارسال، نیروی پروژه‌ای و موارد مشابه.',type:'text',core:true},
{id:'cost_acq',title:'برای جذب یک مشتری چقدر هزینه یا زمان صرف می‌کنی؟',help:'اگر هنوز نمی‌دانی، «نامشخص» بنویس و آزمایش تعریف کن.',type:'text'},
{id:'cost_cash',title:'مهم‌ترین ریسک نقدینگی چیست؟',help:'تأخیر وصول، سرمایه در گردش، موجودی و پیش‌پرداخت.',type:'text'}
]}
];
const LABEL=Object.fromEntries(BLOCKS.map(b=>[b.id,b.title]));
const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];

function fresh(){return{version:2,profile:{ownerName:'',businessName:'',industry:'',stage:'idea',market:'b2c',team:'solo',city:'',challenge:''},answers:{},manual:{},evidence:{},financial:{},tasks:{},reflection:'',step:0,createdAt:new Date().toISOString(),updatedAt:''}}
function load(){
 try{
  const local=localStorage.getItem(PROJECT_PREFIX+workspaceId);
  if(local){const d=JSON.parse(local);if(d&&d.version===2&&d.profile&&typeof d.answers==='object')return Object.assign(fresh(),d)}
 }catch(e){}
 const first=registry()[0];if(!first||workspaceId!==first.id)return fresh();
 try{const raw=localStorage.getItem(KEY);if(raw){const d=JSON.parse(raw);if(d&&d.version===2&&d.profile&&typeof d.answers==='object')return Object.assign(fresh(),d)}}catch(e){}
 let d=fresh();
 try{const old=JSON.parse(localStorage.getItem(OLD)||'null');if(old&&typeof old==='object'){d.profile.businessName=old.name||'';d.profile.stage={idea:'idea',validation:'testing',running:'running',growth:'growing'}[old.stage]||'idea';const map={segments:'seg_main',problem:'val_problem',value:'val_solution',channels:'chan_delivery',revenue:'rev_model',costs:'cost_fixed'};Object.entries(map).forEach(([k,v])=>{if(old[k])d.answers[v]=old[k]});if(old.evidence==='sales')d.evidence.revenues={status:'paid',note:'از دموی قبلی منتقل شده؛ شواهد را مجدداً بررسی کنید'};}}catch(e){}
 return d
}

let state=load(),active='dashboard',reflectionTopic='customer',saveCount=0;

function save(){
 state.updatedAt=new Date().toISOString();
 try{localStorage.setItem(PROJECT_PREFIX+workspaceId,JSON.stringify(state));$('#saveStatus').textContent='ذخیره خودکار · '+new Date().toLocaleTimeString('fa-IR',{hour:'2-digit',minute:'2-digit'})}
 catch(e){$('#saveStatus').textContent='ذخیره ممکن نیست؛ از گزارش خروجی بگیرید'}
 updateWorkspaceLabel();saveCount++;
}
const UNKNOWN=/^(هنوز|نامشخص|مطمئن نیستم|قیمت هنوز|فعلاً برنامه‌ای|هیچ شاهدی ندارم|مسئله هنوز|فرایند هنوز|مسئول مشخص نیست|تعیین نشده|برآورد نکرده|فعالیت‌ها هنوز|مزیت خاصی فعلاً|تمایز هنوز|هزینه‌ها هنوز|هزینه جذب را|برنامه نگهداشت هنوز|نقش‌ها هنوز|جایگزین‌ها را شناسایی نکرده)/;
function unknown(s){return UNKNOWN.test(String(s||'').trim())}

function persianOption(v){return String(v||'')
.replaceAll('فروش مستقیم B2B','فروش مستقیم سازمانی')
.replaceAll('خودخدمتی / DIY','انجام کار توسط خود مشتری')
.replaceAll('قرارداد و SLA مشخص داریم','قرارداد و توافق سطح خدمت مشخص داریم')
.replaceAll('نرم‌افزار تحت وب (SaaS)','نرم‌افزار اشتراکی برخط')
.replaceAll('پرداخت به‌ازای مصرف API','پرداخت به‌ازای میزان استفاده')
.replaceAll('B2B','سازمانی').replaceAll('B2C','فردی');
}
function parts(id){
 const x=state.answers[id];
 if(x&&typeof x==='object'&&!Array.isArray(x)){return {choices:Array.isArray(x.choices)?x.choices.filter(v=>typeof v==='string').map(persianOption):[],note:typeof x.note==='string'?x.note.trim():''}}
 if(Array.isArray(x))return{choices:x.filter(v=>typeof v==='string').map(persianOption),note:''};
 return{choices:[],note:typeof x==='string'?x.trim():''};
}
function text(v){
 if(Array.isArray(v))return v.map(x=>text(persianOption(x))).filter(Boolean).join('، ');
 if(v&&typeof v==='object'){const a=Array.isArray(v.choices)?v.choices.map(persianOption).filter(x=>!unknown(x)&&x!=='سایر (با توضیح)').join('، '):'';return [a,typeof v.note==='string'?v.note.trim():''].filter(Boolean).join('؛ ')}
 return typeof v==='string'?(unknown(v)?'':v.trim()):typeof v==='number'?String(v):'';
}
function value(id){return text(state.answers[id])}
function shownQuestion(q){return !q.when||q.when(state.profile)}
function questions(b){return b.questions.filter(shownQuestion)}
function countAnswers(){return BLOCKS.reduce((n,b)=>n+questions(b).filter(q=>value(q.id)).length,0)}
function totalQuestions(){return BLOCKS.reduce((n,b)=>n+questions(b).length,0)}
function generatedBlock(block){return questions(block).filter(q=>value(q.id)).map(q=>'• '+q.title.replace('؟','')+': '+value(q.id)).join('\n')}
function blockValue(id){if(Object.prototype.hasOwnProperty.call(state.manual,id))return String(state.manual[id]||'').trim();const b=BLOCKS.find(x=>x.id===id);return b?generatedBlock(b):''}
function completedBlocks(){return BLOCKS.filter(b=>blockValue(b.id).length>0).length}


function goto(page){
 const allowed=['dashboard','onboard','wizard','canvas','roadmap','final'];if(!allowed.includes(page))page='dashboard';active=page;
 $$('.page').forEach(p=>p.classList.toggle('active',p.id==='page-'+page));
 $$('.navitem').forEach(b=>{const on=b.dataset.page===page;b.classList.toggle('active',on);b.setAttribute('aria-current',on?'page':'false')});
 if(page==='wizard')renderStep();if(page==='canvas')renderCanvas();if(page==='roadmap')renderRoadmap();if(page==='final'){renderFinal();restoreSubmissionReceipt();}
 renderDashboard();document.querySelector('main')?.scrollIntoView({behavior:'smooth',block:'start'});
}
function el(tag,cls='',txt=''){const n=document.createElement(tag);if(cls)n.className=cls;if(txt)n.textContent=txt;return n}

function optionsFor(q){
 const spec=BANK.questions[q.id]||{mode:q.type==='multi'?'multi':'select',options:q.options||[]};
 const relevant=BANK.industry?.[state.profile.industry]?.[q.id]||[];
 return{mode:spec.mode||'select',options:[...new Set([...(spec.options||q.options||[]),...relevant])]};
}
function fieldFor(q){
 const answer=parts(q.id),spec=optionsFor(q),root=el('div','choice-wrapper');
 const known=answer.choices.length?answer.choices:(answer.note&&spec.options.includes(answer.note)?[answer.note]:[]);
 let selection=[],selectedNote=answer.note;
 if(spec.mode==='multi'){
  const details=el('details','dropdown-multi'),summary=el('summary','','انتخاب یک یا چند گزینه');
  const choices=el('div','dropdown-options');
  details.append(summary,choices);
  for(const option of spec.options){
   const line=el('label','dropdown-choice'),input=el('input');input.type='checkbox';input.value=option;input.checked=known.includes(option);
   input.addEventListener('change',()=>{
    let chosen=[...choices.querySelectorAll('input:checked')].map(x=>x.value);
    if(input.checked&&unknown(option)){for(const ch of choices.querySelectorAll('input'))if(ch!==input)ch.checked=false;chosen=[option]}
    else if(input.checked){for(const ch of choices.querySelectorAll('input'))if(unknown(ch.value))ch.checked=false;chosen=[...choices.querySelectorAll('input:checked')].map(x=>x.value)}
    update(chosen);summary.textContent=chosen.length?chosen.join('، '):'انتخاب یک یا چند گزینه';
   });
   line.append(input,el('span','',option));choices.append(line);
  }
  summary.textContent=known.length?known.join('، '):'انتخاب یک یا چند گزینه';
  root.append(details);
 }else{
  const select=el('select');select.id='q-'+q.id;const first=el('option','','انتخاب کنید');first.value='';select.append(first);
  for(const option of spec.options){const opt=el('option','',option);opt.value=option;select.append(opt)}
  select.value=known[0]||'';select.addEventListener('change',()=>update(select.value?[select.value]:[]));root.append(select);
 }
 const other=el('details','note-details'),summaryNote=el('summary','','توضیح تکمیلی (اختیاری)'),textarea=el('textarea','note-text');
 textarea.rows=2;textarea.placeholder='مثال، عدد، شاهد یا نکته اختصاصی کسب‌وکار خود را بنویسید. این متن در گزارش شما لحاظ می‌شود.';
 const isLegacy=typeof state.answers[q.id]==='string';
 if(isLegacy&&spec.options.includes(selectedNote))selectedNote='';
 textarea.value=selectedNote;
 other.append(summaryNote,textarea);
 if(textarea.value)other.open=true;
 textarea.addEventListener('input',()=>update(currentChoices()));
 root.append(other);
 function currentChoices(){
  if(spec.mode==='multi')return [...root.querySelectorAll('.dropdown-options input:checked')].map(i=>i.value);
  const elSelect=root.querySelector('select');return elSelect&&elSelect.value?[elSelect.value]:[];
 }
 function update(chosen){state.answers[q.id]={choices:chosen,note:textarea.value.trim()};save();renderDashboard();const block=BLOCKS[state.step];if(block)$('#wizardCount').textContent=questions(block).filter(x=>value(x.id)).length+' / '+questions(block).length}
 return root;
}


function renderStep(){
 const b=BLOCKS[state.step]||BLOCKS[0];
 $('#wizardStepLabel').textContent='بخش '+(state.step+1)+' از ۹';
 $('#wizardTitle').textContent=b.title;$('#wizardDesc').textContent=b.desc;
 $('#wizardProgress').style.width=(100*(state.step+1)/9)+'%';
 const qlist=$('#questionList');qlist.replaceChildren();
 for(const q of questions(b)){const wrap=el('div','question');wrap.append(el('label','',q.title),fieldFor(q));qlist.append(wrap)}
 $('#wizardCount').textContent=questions(b).filter(q=>value(q.id)).length+' / '+questions(b).length;
 $('#previousStep').disabled=state.step===0;
 $('#nextStep').textContent=state.step===8?'تولید بوم اختصاصی من':'مرحله بعد';
}
function moveStep(delta){
 if(delta>0&&state.step>=8){goto('final');return}
 state.step=Math.max(0,Math.min(8,state.step+delta));save();renderStep();
 $('.page.active')?.scrollIntoView({behavior:'smooth',block:'start'});
}

function renderDashboard(){const filled=completedBlocks(),count=countAnswers(),total=totalQuestions();$('#dashboardBlocks').textContent=filled+' از ۹';$('#dashboardQuestions').textContent=count+' از '+total;$('#dashboardEvidence').textContent='';$('#progressBar').style.width=(100*count/Math.max(total,1))+'%';$('#stepProgress').textContent=filled+'/۹';$('#projectStage').textContent=({idea:'مرحله ایده',testing:'آزمون بازار',running:'کسب‌وکار فعال',growing:'مرحله رشد'})[state.profile.stage]||'شناخت اولیه';$('#welcomeTitle').textContent=state.profile.businessName?('مدل کسب‌وکار «'+state.profile.businessName+'»') :'بوم کسب‌وکار من'}
let canvasEditingId=null;
function renderCanvas(){
 for(const block of BLOCKS){
  const tile=document.querySelector('#canvas [data-block="'+block.id+'"]');
  if(!tile)continue;
  const summary=tile.querySelector('.block-preview');
  const content=blockValue(block.id);
  if(summary)summary.textContent=content||'هنوز تکمیل نشده';
  tile.classList.toggle('filled',Boolean(content));
 }
}
function openCanvasEditor(id){
 const block=BLOCKS.find(b=>b.id===id),dialog=$('#canvasDialog');
 if(!block||!dialog)return;
 canvasEditingId=id;
 $('#canvasEditTitle').textContent=block.title;
 $('#canvasEditText').value=blockValue(id);
 if(typeof dialog.showModal==='function')dialog.showModal();
 else dialog.setAttribute('open','');
 $('#canvasEditText').focus();
}
function saveCanvasEditor(){
 if(!canvasEditingId)return;
 state.manual[canvasEditingId]=$('#canvasEditText').value;
 save();renderCanvas();renderDashboard();
}
function closeCanvasEditor(){
 const dialog=$('#canvasDialog');
 if(dialog?.open&&typeof dialog.close==='function')dialog.close();
 else dialog?.removeAttribute('open');
 canvasEditingId=null;
}

function roadmapData(){const stage=state.profile.stage;const isStart=stage==='idea'||stage==='testing';const customer=value('seg_main')||'مشتریان هدف';const channel=value('chan_discovery')||'کانال جذب اولیه';const tasks=[
[{id:'30a',label:'بازنگری مشتری هدف: '+customer},{id:'30b',label:'انجام ۵ تا ۱۰ گفتگوی مسئله‌محور با مشتریان واقعی'},{id:'30c',label:'بررسی سه فرضیه مهم مدل'},{id:'30d',label:isStart?'طراحی پیشنهاد اولیه قابل آزمون':'جمع‌آوری داده فروش، ریزش و بازخورد مشتریان فعلی'}],
[{id:'60a',label:'آزمایش کانال: '+channel},{id:'60b',label:'ارائه پیشنهاد واقعی و سنجش تمایل به پرداخت'},{id:'60c',label:'محاسبه حاشیه مشارکت و نقطه سربه‌سر با ارقام واقعی'},{id:'60d',label:'بازنگری ارزش پیشنهادی براساس شواهد آزمایش'}],
[{id:'90a',label:'بازطراحی بلوک‌هایی که فرضیات آن‌ها رد شده است'},{id:'90b',label:'تعیین شاخص‌های فروش، جذب مشتری و نقدینگی برای دوره بعد'},{id:'90c',label:'تصمیم برای ادامه، اصلاح یا توقف بر اساس نتایج آزمون'},{id:'90d',label:stage==='growing'?'انتخاب یک آزمایش توسعه بازار با بودجه و مسئول مشخص':'تعیین مسئول، منابع و تاریخ شروع فاز اجرایی بعدی'}]
];return tasks}
function renderRoadmap(){const root=$('#roadmap');root.replaceChildren();const names=['۳۰ روز اول · کشف و شفاف‌سازی','۶۰ روز · آزمایش و اعتبارسنجی','۹۰ روز · تصمیم و اجرا'],desc=['خروجی: شناخت مشتری و فرضیات اصلی','خروجی: نتیجه آزمون ارزش و درآمد','خروجی: تصمیم مستند و برنامه اجرا'];let total=0;roadmapData().forEach((tasks,i)=>{const panel=el('div','phase');panel.append(el('h3','',names[i]),el('p','',desc[i]));tasks.forEach(t=>{const label=el('label','task'),check=el('input');check.type='checkbox';check.checked=!!state.tasks[t.id];if(check.checked)total++;check.addEventListener('change',()=>{state.tasks[t.id]=check.checked;save();$('#doneCount').textContent=new Intl.NumberFormat('fa-IR').format(Object.values(state.tasks).filter(Boolean).length)+' اقدام انجام‌شده'});label.append(check,el('span','',t.label));panel.append(label)});root.append(panel)});$('#doneCount').textContent=new Intl.NumberFormat('fa-IR').format(total)+' اقدام انجام‌شده'}

const INDUSTRY_NAMES={service:'خدمات',retail:'فروشگاه و خرده‌فروشی',digital:'فناوری و نرم‌افزار',manufacturing:'تولید و صنعت',health:'سلامت و زیبایی',education:'آموزش',other:'سایر'};
const STAGE_NAMES={idea:'ایده',testing:'آزمایش اولیه',running:'فعال',growing:'در حال رشد'};
function answerNotes(){return BLOCKS.flatMap(b=>questions(b).map(q=>({block:b,title:q.title,note:parts(q.id).note})).filter(q=>q.note))}
function buildFinalModel(){return {
 title:'بوم کسب‌وکار من',
 name:String(state.profile.businessName||'مدل بدون نام'),owner:String(state.profile.ownerName||'بدون نام'),
 industry:INDUSTRY_NAMES[state.profile.industry]||'نامشخص',
 stage:STAGE_NAMES[state.profile.stage]||'نامشخص',
 date:new Date().toLocaleDateString('fa-IR'),
 blocks:BLOCKS.map(b=>({id:b.id,name:b.title,text:blockValue(b.id)||'هنوز تکمیل نشده'})),
 notes:answerNotes().map(n=>({block:n.block.title,question:n.title,note:n.note}))
}}
function renderFinal(){
 const report=buildFinalModel();
 $('#finalTitle').textContent='بوم کسب‌وکار «'+report.name+'»';
 $('#finalMeta').textContent='تکمیل‌کننده: '+report.owner+' · '+report.industry+' · '+report.date;
 const grid=$('#finalCanvas');grid.replaceChildren();
 report.blocks.forEach(b=>{
  const card=el('article','final-block');card.dataset.block=b.id;card.append(el('strong','',b.name),el('p','',b.text));grid.append(card);
 });
}
function htmlEscape(s){return String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}


function downloadCanvasReport(){
 const r=buildFinalModel(),safe=htmlEscape;
 const icons={partners:'🤝',activities:'⚙️',resources:'📚',value:'💎',relations:'💬',channels:'📣',segments:'🎯',costs:'📊',revenues:'🪙'};
 const cards=r.blocks.map(x=>
  '<article class="block '+safe(x.id)+'"><h2><span aria-hidden="true">'+(icons[x.id]||'◈')+'</span>'+safe(x.name)+'</h2><p>'+safe(x.text).replaceAll('\n','<br>')+'</p></article>'
 ).join('');
 const css=String.raw`
*{box-sizing:border-box}body{max-width:1200px;margin:auto;padding:27px 20px;background:#f6f9f6;color:#173a2e;font-family:Tahoma,Arial,sans-serif;line-height:1.9;direction:rtl}header{display:flex;align-items:center;justify-content:space-between;gap:20px;background:linear-gradient(115deg,#103b34,#276950);padding:24px;color:white;border-radius:18px;margin-bottom:19px}h1{margin:0;font-size:clamp(19px,3vw,27px)}header p{font-size:12px;margin:4px 0 0;color:#e1eee5}header .mark{width:54px;height:54px;border:1px solid #ffffff77;border-radius:13px;display:grid;place-items:center;color:#f2d19e;font-size:29px;font-weight:900;flex:none}.canvas{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));grid-template-rows:repeat(2,minmax(185px,auto)) minmax(130px,auto);gap:9px}.block{background:white;border:1px solid #dce8df;border-radius:13px;overflow:hidden;break-inside:avoid;display:flex;flex-direction:column;min-width:0}.block h2{margin:0;padding:9px;background:#1c6651;color:white;font-size:12px;line-height:1.7;display:flex;align-items:center;gap:6px}.block h2 span{font-size:15px}.block p{padding:11px;margin:0;font-size:11px;line-height:1.85;overflow-wrap:anywhere;flex:1}.value{background:#fff9ed;border-color:#e7c796}.value h2{background:#b37b37}.partners{grid-area:1/1/3/2}.activities{grid-area:1/2}.resources{grid-area:2/2}.value{grid-area:1/3/3/4}.relations{grid-area:1/4}.channels{grid-area:2/4}.segments{grid-area:1/5/3/6}.costs{grid-area:3/1/4/4}.revenues{grid-area:3/4/4/6}.footnote{font-size:11px;color:#6b8171;margin-top:19px}@media(max-width:850px){.canvas{grid-template-columns:repeat(2,minmax(0,1fr));grid-template-rows:none}.block{grid-area:auto!important;min-height:128px}.value,.costs,.revenues{grid-column:1/-1}}@media(max-width:510px){body{padding:12px}.canvas{grid-template-columns:1fr}.block{grid-column:1/-1}.block p{font-size:12px}header{padding:17px}}@page{size:A4 landscape;margin:9mm}@media print{body{padding:0;margin:0;max-width:none;background:white}.canvas{grid-template-columns:repeat(5,minmax(0,1fr));grid-template-rows:repeat(2,165px) 135px}.block{min-height:0;border-radius:6px;grid-column:auto}.partners{grid-area:1/1/3/2!important}.activities{grid-area:1/2!important}.resources{grid-area:2/2!important}.value{grid-area:1/3/3/4!important}.relations{grid-area:1/4!important}.channels{grid-area:2/4!important}.segments{grid-area:1/5/3/6!important}.costs{grid-area:3/1/4/4!important}.revenues{grid-area:3/4/4/6!important}.block h2{font-size:9px;padding:6px}.block h2 span{font-size:10px}.block p{font-size:8px;padding:6px;line-height:1.5}header{padding:10px 16px;margin-bottom:9px;border-radius:8px}header h1{font-size:17px}.footnote{font-size:8px;margin-top:8px}}
`;
 const html='<!doctype html><html lang="fa" dir="rtl"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>بوم کسب‌وکار '+safe(r.name)+'</title><style>'+css+'</style></head><body><header><div><h1>بوم کسب‌وکار '+safe(r.name)+'</h1><p>تکمیل‌کننده: '+safe(r.owner)+' · '+safe(r.industry)+' · '+safe(r.date)+'</p></div><div class="mark" aria-hidden="true">▦</div></header><main class="canvas">'+cards+'</main><p class="footnote">این بوم بر پایه پاسخ‌های تکمیل‌کننده تهیه شده است.</p></body></html>';
 const b=new Blob([html],{type:'text/html;charset=utf-8'}),url=URL.createObjectURL(b),a=el('a');
 a.href=url;a.download='بوم-کسب-وکار-'+r.name.replace(/[^\p{L}\p{N}-]/gu,'-').slice(0,45)+'.html';
 document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1200);
}
function printFinal(){goto('final');document.body.classList.add('print-final');window.addEventListener('afterprint',()=>document.body.classList.remove('print-final'),{once:true});window.print();}


function resetData(){if(!confirm('تمام اطلاعات این پروژه در این مرورگر پاک شود؟ این کار قابل بازگشت نیست.'))return;state=fresh();save();initProfile();goto('dashboard')}
function exportData(){const b=new Blob([JSON.stringify({application:'بوم کسب‌وکار',exportedAt:new Date().toISOString(),data:state},null,2)],{type:'application/json'}),u=URL.createObjectURL(b),a=el('a');a.href=u;a.download='bmc-studio-'+new Date().toISOString().slice(0,10)+'.json';document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(u),900)}
function readImport(file){if(!file)return;if(file.size>2000000){alert('فایل بسیار بزرگ است.');return}const reader=new FileReader();reader.onload=()=>{try{const obj=JSON.parse(reader.result),d=obj.data||obj;if(!d||d.version!==2||!d.profile||!d.answers||typeof d.answers!=='object')throw Error('format');if(!confirm('فایل جایگزین پروژه فعلی شود؟ ابتدا در صورت نیاز نسخه پشتیبان بگیرید.'))return;state=Object.assign(fresh(),d);save();initProfile();goto('dashboard');alert('پروژه بازیابی شد.')}catch(e){alert('فایل پشتیبان این برنامه معتبر نیست.')}};reader.readAsText(file)}
function initProfile(){$$('#page-onboard [name]').forEach(input=>{const k=input.name;input.value=state.profile[k]===undefined?'':state.profile[k];input.oninput=input.onchange=()=>{state.profile[k]=input.value;save();renderDashboard()}});}


const SUBMISSION_URL='https://hxcjkewlaniahvuqwwbb.supabase.co/rest/v1/bmc_client_submissions';
const SUBMISSION_PUBLIC_KEY="sb_publishable_KpklYvrvXyorJVy4gQOWAw_SA8zaQy6";
function submissionStatus(message,kind='info'){
 const status=$('#analystSubmitStatus');if(!status)return;
 status.textContent=message;status.dataset.kind=kind;
}
function restoreSubmissionReceipt(){
 const receipt=state.analystSubmission;
 if(receipt&&receipt.id){
  submissionStatus('نسخه قبلی با موفقیت ثبت شده است. کد پیگیری: '+receipt.id+' — پس از تغییر پاسخ‌ها می‌توانید نسخه جدیدی ارسال کنید.','ok');
 }else{
  submissionStatus('ارسال فقط با انتخاب دکمه بالا انجام می‌شود؛ تا پیش از آن داده‌ها روی همین دستگاه باقی می‌مانند.');
 }
}
let submittingToAnalyst=false;
async function sendToAnalyst(){
 if(submittingToAnalyst)return;
 const submitBtn=$('#submitToAnalyst');
 const name=String(state.profile.ownerName||'').trim();
 const business=String(state.profile.businessName||'').trim();
 if(name.length<2||business.length<2){
  submissionStatus('برای ارسال، نام تکمیل‌کننده و نام کسب‌وکار را در بخش «اطلاعات کسب‌وکار» ثبت کنید.','error');
  alert('لطفاً نام تکمیل‌کننده و نام کسب‌وکار را ثبت کنید. سپس از «پیش‌نویس بوم» ارسال را انجام دهید.');
  goto('onboard');return;
 }
 const missing=BLOCKS.filter(b=>!blockValue(b.id)).map(b=>b.title);
 if(missing.length){
  submissionStatus('قبل از ارسال، این بخش‌های بوم را تکمیل کنید: '+missing.join('، ')+' .','error');
  return;
 }
 if(!$('#analystConsent').checked){submissionStatus('برای اشتراک‌گذاری اطلاعات با تحلیلگر، ابتدا گزینه موافقت را فعال کنید.','error');return;}
 if(!navigator.onLine){submissionStatus('اینترنت متصل نیست. پاسخ‌ها روی همین دستگاه حفظ شده‌اند؛ پس از اتصال دوباره ارسال کنید.','error');return;}
 const id=crypto.randomUUID();
 const submittedAt=new Date().toISOString();
 const snapshot={
  schema_version:1,
  exported_at:submittedAt,
  project_id:workspaceId,
  application:'Business Model Canvas – Client Intake',
  data:JSON.parse(JSON.stringify(state)),
  report:buildFinalModel()
 };
 const packet={
  id,contact_name:name,business_name:business,
  industry:String(state.profile.industry||'other'),
  completed_blocks:9,share_consent:true,source:'business-model-canvas/studio',
  payload:snapshot
 };
 if(new Blob([JSON.stringify(snapshot)]).size>230000){
  submissionStatus('حجم اطلاعات زیاد است. لطفاً نسخه پاسخ‌ها را دریافت و از طریق مشاور ارسال کنید.','error');return;
 }
 submittingToAnalyst=true;submitBtn.disabled=true;submitBtn.textContent='در حال ثبت اطلاعات...';
 submissionStatus('در حال ثبت امن نسخه کامل بوم...');
 try{
  const response=await fetch(SUBMISSION_URL,{
   method:'POST',
   headers:{apikey:SUBMISSION_PUBLIC_KEY,'Content-Type':'application/json','Prefer':'return=minimal'},
   body:JSON.stringify(packet),cache:'no-store'
  });
  if(!response.ok)throw new Error('HTTP '+response.status);
  state.analystSubmission={id,submittedAt,modelUpdatedAt:state.updatedAt};
  save();
  submissionStatus('✓ تمام پاسخ‌ها و بوم ۹ بخشی با موفقیت برای تحلیلگر ثبت شد. کد پیگیری: '+id+' . برای تغییرات جدید، دوباره «ارسال به تحلیلگر» را انتخاب کنید.','ok');
  $('#analystConsent').checked=false;
 }catch(error){
  submissionStatus('ثبت در سامانه تأیید نشد ('+(error.message||'خطای ارتباط')+'). پاسخ‌ها از بین نرفته‌اند. لطفاً دوباره تلاش کنید یا «نسخه تمام پاسخ‌ها» را دریافت کنید.','error');
 }finally{submittingToAnalyst=false;submitBtn.disabled=false;submitBtn.textContent='ارسال به تحلیلگر';}
}

function init(){
 $$('[data-page]').forEach(b=>b.addEventListener('click',()=>goto(b.dataset.page)));
 $$('[data-goto]').forEach(b=>b.addEventListener('click',()=>{if(b.classList.contains('main-action')&&!String(state.profile.businessName||'').trim())goto('onboard');else goto(b.dataset.goto)}));
 $('#previousStep').addEventListener('click',()=>moveStep(-1));
 $('#nextStep').addEventListener('click',()=>moveStep(1));
 $('#regenerateCanvas').addEventListener('click',()=>{if(!confirm('بوم ویرایش‌شده با پاسخ‌های پرسشنامه جایگزین شود؟'))return;state.manual={};save();renderCanvas();renderDashboard()});
 $('#exportJSON').addEventListener('click',exportData);
 $('#submitToAnalyst').addEventListener('click',sendToAnalyst);
 $('#downloadFullAnswers').addEventListener('click',exportData);
 $('#importJSON').addEventListener('click',()=>$('#importFile').click());
 $('#importFile').addEventListener('change',e=>{readImport(e.target.files[0]);e.target.value=''});
 $('#clearAll').addEventListener('click',resetData);
 $('#workspaceSelect').addEventListener('change',e=>switchWorkspace(e.target.value));
 $('#newWorkspace').addEventListener('click',createWorkspace);
 $('#downloadCanvasReport').addEventListener('click',downloadCanvasReport);
 $('#printFinal').addEventListener('click',printFinal);
 $('#canvas').addEventListener('click',event=>{
  const tile=event.target.closest('[data-block]');
  if(tile)openCanvasEditor(tile.dataset.block);
 });
 $('#canvasEditText').addEventListener('input',saveCanvasEditor);
 $('#canvasDialogClose').addEventListener('click',closeCanvasEditor);
 $('#canvasDialogDone').addEventListener('click',closeCanvasEditor);
 $('#canvasDialog').addEventListener('click',event=>{if(event.target===event.currentTarget)closeCanvasEditor()});
 $('#canvasDialog').addEventListener('close',()=>{canvasEditingId=null});
 initProfile();refreshWorkspaceSelector();goto('dashboard');
 let prompt=null;
 window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();prompt=e;$('#installButton').textContent='نصب برنامه'});
 $('#installButton').addEventListener('click',async()=>{
  if(prompt){prompt.prompt();await prompt.userChoice;prompt=null;$('#installButton').textContent='راهنمای نصب';return}
  alert(/iPad|iPhone|iPod/.test(navigator.userAgent)?'برای نصب روی آیفون، در مرورگر سافاری گزینه اشتراک‌گذاری و سپس افزودن به صفحه اصلی را انتخاب کنید.':'برای نصب روی گوشی، از منوی مرورگر گزینه نصب برنامه یا افزودن به صفحه اصلی را انتخاب کنید.')
 });
 window.addEventListener('appinstalled',()=>$('#installButton').textContent='نصب شده');
 if('serviceWorker'in navigator)window.addEventListener('load',()=>navigator.serviceWorker.register('./sw.js',{scope:'./'}).catch(()=>{}));
}
document.addEventListener('DOMContentLoaded',init);
})();
