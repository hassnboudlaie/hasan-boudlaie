
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
 state=load();initProfile();initFinancial();refreshWorkspaceSelector();goto('dashboard');
}
function createWorkspace(){
 const owner=prompt('نام یا نام مستعار صاحب مدل جدید (اختیاری):','');if(owner===null)return;
 save();const id=makeId(),rows=registry();rows.push({id,name:'مدل جدید',owner:owner.trim().slice(0,80),updatedAt:new Date().toISOString()});
 setRegistry(rows);workspaceId=id;state=fresh();state.profile.ownerName=owner.trim().slice(0,80);
 try{localStorage.setItem(ACTIVE_KEY,id)}catch(e){}
 save();initProfile();initFinancial();goto('onboard');
}

const BLOCKS=[
{id:'segments',title:'بخش‌های مشتریان',en:'Customer Segments',desc:'مشتری مشخص، مسئله مشخص؛ نه «همه مردم».',questions:[
{id:'seg_main',title:'اولین و مهم‌ترین بخش مشتریان شما دقیقاً چه کسانی هستند؟',help:'مثال: مدیران منابع انسانی سازمان‌های ۲۰۰ تا ۵۰۰ نفر، نه صرفاً «شرکت‌ها».',type:'text',core:true},
{id:'seg_need',title:'مهم‌ترین نیاز یا مشکل حل‌نشده این گروه چیست؟',help:'مسئله را از زبان مشتری و در قالب موقعیت واقعی توضیح بده.',type:'text',core:true},
{id:'seg_decider',title:'در شرکت مشتری، چه کسی تصمیم به خرید می‌گیرد و چه کسی استفاده می‌کند؟',help:'Decision maker و End user ممکن است افراد متفاوتی باشند.',type:'text',when:p=>p.market==='b2b'||p.market==='both'},
{id:'seg_behavior',title:'مشتری شخصی شما معمولاً چگونه تصمیم به خرید می‌گیرد؟',help:'موقعیت، معیار انتخاب، زمان و محرک خرید را توضیح بده.',type:'text',when:p=>p.market==='b2c'||p.market==='both'},
{id:'seg_first',title:'برای شروع سراغ کدام زیرگروه کوچک‌تر می‌روید؟',help:'Early Adopters: مشتریانی که مسئله برایشان شدیدتر و دسترسی به آنان آسان‌تر است.',type:'text'}
]},
{id:'value',title:'ارزش پیشنهادی',en:'Value Proposition',desc:'چه ارزشی، برای کدام مسئله و در مقایسه با چه جایگزینی؟',questions:[
{id:'val_problem',title:'کدام مسئله مشخص را حل می‌کنی؟',help:'آیا مشتری همین حالا برای حل آن هزینه، زمان یا تلاش می‌کند؟',type:'text',core:true},
{id:'val_solution',title:'محصول یا خدمت شما چیست و چه نتیجه‌ای به مشتری می‌دهد؟',help:'Outcome را توضیح بده، نه فقط فهرست ویژگی‌ها را.',type:'text',core:true},
{id:'val_alt',title:'مشتری در نبود شما از چه جایگزین‌هایی استفاده می‌کند؟',help:'رقبا، انجام کار به روش دستی یا حتی انجام ندادن کار.',type:'text'},
{id:'val_edge',title:'چه تمایز قابل اثباتی در برابر این جایگزین‌ها دارید؟',help:'از ادعاهایی مانند «کیفیت عالی» بدون شاهد پرهیز کن.',type:'text'}
]},
{id:'channels',title:'کانال‌ها',en:'Channels',desc:'مشتری چگونه از شما مطلع می‌شود، می‌خرد و خدمت را دریافت می‌کند؟',questions:[
{id:'chan_discovery',title:'مشتریان چطور با شما آشنا خواهند شد؟',help:'یک یا چند کانال واقعاً قابل آزمون انتخاب کن.',type:'multi',options:['معرفی مشتریان','شبکه‌های اجتماعی','سئو و وب‌سایت','فروش حضوری','فروش مستقیم B2B','نمایندگی یا شریک فروش','تبلیغات پولی','رویدادها و شبکه‌سازی'],core:true},
{id:'chan_sale',title:'مراحل خرید از آشنایی تا پرداخت چیست؟',help:'مثال: آشنایی → مشاوره اولیه → پیشنهاد قیمت → قرارداد.',type:'text',core:true},
{id:'chan_delivery',title:'محصول یا خدمت چگونه تحویل داده می‌شود؟',help:'فروش اینترنتی، ارسال، جلسه حضوری، تحویل پروژه یا روش دیگر.',type:'text'},
{id:'chan_test',title:'کدام کانال را با کمترین هزینه در ۳۰ روز اول آزمایش می‌کنی؟',help:'آزمایش قابل اندازه‌گیری تعریف کن.',type:'text'}
]},
{id:'relations',title:'ارتباط با مشتری',en:'Customer Relationships',desc:'چگونه مشتری را جذب، همراهی و حفظ می‌کنی؟',questions:[
{id:'rel_type',title:'مدل اصلی رابطه با مشتری چیست؟',help:'یکی را به عنوان مدل غالب انتخاب کن.',type:'select',options:['پشتیبانی و تعامل انسانی','خودخدمتی / دیجیتال','مدیر حساب اختصاصی','جامعه و شبکه کاربران','ترکیبی'],core:true},
{id:'rel_onboard',title:'پس از اولین خرید چگونه مشتری را همراهی می‌کنی؟',help:'اولین تجربه مشتری را طراحی کن.',type:'text'},
{id:'rel_retention',title:'برای تکرار خرید یا حفظ مشتری چه برنامه‌ای داری؟',help:'Retention و Customer Lifetime Value.',type:'text',core:true},
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
{id:'res_access',title:'چه منبع یا قابلیت مهمی فعلاً در اختیار ندارید؟',help:'Gap in capability یا وابستگی پرریسک.',type:'text'},
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
{id:'par_risk',title:'اگر مهم‌ترین شریک همکاری را قطع کند، راه‌حل جایگزین چیست؟',help:'Single Point of Failure را شناسایی کن.',type:'text'},
{id:'par_contract',title:'مبنای همکاری و تعهدات طرفین چیست؟',help:'توافق، قرارداد، SLA یا شیوه پرداخت.',type:'text'}
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
function parts(id){
 const x=state.answers[id];
 if(x&&typeof x==='object'&&!Array.isArray(x)){return {choices:Array.isArray(x.choices)?x.choices.filter(v=>typeof v==='string'):[],note:typeof x.note==='string'?x.note.trim():''}}
 if(Array.isArray(x))return{choices:x.filter(v=>typeof v==='string'),note:''};
 return{choices:[],note:typeof x==='string'?x.trim():''};
}
function text(v){
 if(Array.isArray(v))return v.map(text).filter(Boolean).join('، ');
 if(v&&typeof v==='object'){const a=Array.isArray(v.choices)?v.choices.filter(x=>!unknown(x)&&x!=='سایر (با توضیح)').join('، '):'';return [a,typeof v.note==='string'?v.note.trim():''].filter(Boolean).join('؛ ')}
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
function evidenceCount(){return BLOCKS.filter(b=>{const e=state.evidence[b.id];return e&&e.status&&e.status!=='assumed'&&blockValue(b.id)}).length}

function goto(page){const allowed=['dashboard','onboard','wizard','canvas','evidence','diagnosis','roadmap','reflection','final'];if(!allowed.includes(page))page='dashboard';active=page;$$('.page').forEach(p=>p.classList.toggle('active',p.id==='page-'+page));$$('.navitem').forEach(b=>{const on=b.dataset.page===page;b.classList.toggle('active',on);b.setAttribute('aria-current',on?'page':'false')});if(page==='wizard')renderStep();if(page==='canvas')renderCanvas();if(page==='evidence')renderEvidence();if(page==='diagnosis')renderDiagnosis();if(page==='roadmap')renderRoadmap();if(page==='reflection')renderReflection();if(page==='final')renderFinal();renderDashboard();document.querySelector('main')?.scrollIntoView({behavior:'smooth',block:'start'})}
function el(tag,cls='',txt=''){const n=document.createElement(tag);if(cls)n.className=cls;if(txt)n.textContent=txt;return n}

function optionsFor(q){
 const spec=BANK.questions[q.id]||{mode:q.type==='multi'?'multi':'select',options:q.options||[]};
 const relevant=BANK.industry?.[state.profile.industry]?.[q.id]||[];
 return{mode:spec.mode||'select',options:[...new Set([...(spec.options||q.options||[]),...relevant])]};
}
function fieldFor(q){
 const answer=parts(q.id),spec=optionsFor(q),root=el('div','choice-wrapper'),label=el('div','choice-label','پاسخ انتخابی');
 root.append(label);
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
 $('#wizardTitle').textContent=b.title+' · '+b.en;$('#wizardDesc').textContent=b.desc;
 $('#wizardProgress').style.width=(100*(state.step+1)/9)+'%';
 const qlist=$('#questionList');qlist.replaceChildren();
 for(const q of questions(b)){const wrap=el('div','question');wrap.append(el('label','',q.title+(q.core?' *':'')),el('p','help',q.help),fieldFor(q));qlist.append(wrap)}
 $('#wizardCount').textContent=questions(b).filter(q=>value(q.id)).length+' / '+questions(b).length;
 $('#previousStep').disabled=state.step===0;
 $('#nextStep').textContent=state.step===8?'تولید بوم اختصاصی من':'مرحله بعد';
}
function moveStep(delta){
 if(delta>0&&state.step>=8){goto('final');return}
 state.step=Math.max(0,Math.min(8,state.step+delta));save();renderStep();
 $('.page.active')?.scrollIntoView({behavior:'smooth',block:'start'});
}

function renderDashboard(){const filled=completedBlocks(),count=countAnswers(),total=totalQuestions();$('#dashboardBlocks').textContent=filled+' از ۹';$('#dashboardQuestions').textContent=count+' از '+total;$('#dashboardEvidence').textContent=evidenceCount();$('#progressBar').style.width=(100*count/Math.max(total,1))+'%';$('#stepProgress').textContent=filled+'/۹';$('#projectStage').textContent=({idea:'مرحله ایده',testing:'آزمون بازار',running:'کسب‌وکار فعال',growing:'مرحله رشد'})[state.profile.stage]||'شناخت اولیه';$('#welcomeTitle').textContent=state.profile.businessName?('مدل کسب‌وکار «'+state.profile.businessName+'»'):'استودیوی طراحی مدل کسب‌وکار'}
function renderCanvas(){for(const block of BLOCKS){const node=document.querySelector('[data-block="'+block.id+'"] textarea');if(!node)continue;node.value=blockValue(block.id);node.oninput=()=>{state.manual[block.id]=node.value;save();renderDashboard()}}}
function renderEvidence(){const list=$('#evidenceList');list.replaceChildren();for(const b of BLOCKS){const item=el('div','evidence-item'),label=el('label','',b.title),sel=el('select'),current=state.evidence[b.id]||{status:'assumed',note:''};[['assumed','فرضیه / نامشخص'],['interview','مصاحبه یا مشاهده'],['paid','پرداخت یا خرید واقعی'],['data','داده عملکردی مستند']].forEach(([v,t])=>{let o=el('option','',t);o.value=v;sel.append(o)});sel.value=current.status||'assumed';sel.addEventListener('change',()=>{const x=state.evidence[b.id]||{};x.status=sel.value;state.evidence[b.id]=x;save();renderDashboard()});const note=el('input');note.placeholder='منبع یا شرح شاهد (اختیاری)';note.value=current.note||'';note.addEventListener('input',()=>{const x=state.evidence[b.id]||{};x.note=note.value;state.evidence[b.id]=x;save()});item.append(label,sel,note,el('small','','فقط شواهد واقعی را ثبت کنید.'));list.append(item)}}
function risks(){const out=[];const add=(priority,title,description)=>out.push({priority,title,description});if(!value('seg_main'))add('فوری','بخش مشتریان روشن نیست','قبل از سرمایه‌گذاری یک گروه مشتری مشخص و قابل دسترس انتخاب کنید.');if(!value('seg_need')&&!value('val_problem'))add('فوری','نیاز مشتری تعریف نشده','با مشتری واقعی درباره موقعیت و مسئله فعلی گفتگو کنید.');if(!value('val_solution'))add('فوری','ارزش پیشنهادی مبهم است','توصیف کنید مشتری دقیقاً چه نتیجه‌ای از شما دریافت می‌کند.');if(!value('val_alt'))add('مهم','جایگزین‌های رقابتی بررسی نشده‌اند','گزینه‌هایی را که مشتری بدون شما دارد فهرست کنید.');if(!value('rev_model')&&!value('rev_price'))add('فوری','منطق درآمدزایی مشخص نیست','مدل درآمد و مبنای قیمت‌گذاری را تعریف کنید.');if(value('rev_model')&&value('rev_evidence')!=='پرداخت یا فروش واقعی')add('مهم','پرداخت واقعی هنوز اثبات نشده است','پس از گفتگو، یک پیشنهاد واقعی را با امکان پیش‌سفارش یا فروش آزمایشی بیازمایید.');if(!value('cost_variable'))add('مهم','هزینه متغیر نامشخص است','هزینه تحویل یک واحد خدمت یا محصول را محاسبه کنید.');if(!value('chan_discovery'))add('مهم','کانال دستیابی به مشتری مبهم است','یک کانال کم‌هزینه را به شکل آزمایش ۳۰روزه بسنجید.');if(value('par_core')&&!value('par_risk'))add('قابل بررسی','وابستگی به شریک بدون برنامه جایگزین','برای تأمین‌کننده یا شریک حیاتی جایگزین یا طرح پشتیبان مشخص کنید.');if(!value('res_team'))add('قابل بررسی','قابلیت‌های اجرایی تیم مشخص نیست','مسئول اجرای فروش، تحویل و مدیریت مالی را روشن کنید.');let needEvidence=BLOCKS.filter(b=>{const ev=state.evidence[b.id];return blockValue(b.id)&&(!ev||ev.status==='assumed')}).length;if(needEvidence)add('مهم','شواهد کافی برای '+needEvidence+' بلوک ثبت نشده','فرضیات مهم را با گفتگو، مشاهده، آزمایش خرید و داده واقعی مستند کنید.');if(state.profile.stage==='running'||state.profile.stage==='growing'){if(!value('rel_retention'))add('مهم','سازوکار نگهداشت مشتری نامشخص است','داده‌های تکرار خرید و ریزش مشتری را بررسی کنید.')}for(const a of answerNotes().slice(0,10)){if(/ریسک|مشکل|محدودیت|ابهام|نامشخص|کمبود|تاخیر|تأخیر|نبود|نداریم|نمی‌دان/i.test(a.note))add('قابل بررسی','محدودیت مطرح‌شده توسط پاسخ‌دهنده · '+a.block.title,'یادداشت شما: '+a.note.slice(0,180))}if(out.length===0)add('پایش','مدل اولیه تکمیل شده است','آزمایش مداوم فرضیات، سنجش شاخص‌ها و بازنگری دوره‌ای را ادامه دهید.');return out}
function financial(){const get=k=>state.financial[k]===''||state.financial[k]===undefined?null:Number(state.financial[k]);const p=get('price'),v=get('variable'),f=get('fixed'),q=get('volume'),result=$('#financialOutput');if([p,v,f].some(x=>x===null||!Number.isFinite(x)||x<0)){result.textContent='قیمت متوسط، هزینه متغیر و هزینه ثابت را با واحد تومان وارد کنید تا محاسبه شود.';return}if(p<=v){result.textContent='حاشیه مشارکت هر واحد '+fmt(p-v)+' تومان است. با این فرض‌ها نقطه سربه‌سر عملیاتی مثبت به دست نمی‌آید؛ قیمت یا هزینه متغیر را بازنگری کنید.';return}const cm=p-v,be=Math.ceil(f/cm),str=['حاشیه مشارکت هر واحد: '+fmt(cm)+' تومان','حداقل تعداد فروش لازم برای پوشش هزینه ثابت ماهانه: '+fmt(be)+' واحد'];if(q!==null&&Number.isFinite(q)&&q>=0)str.push('برآورد سود/زیان عملیاتی ماهانه: '+fmt(q*cm-f)+' تومان (قبل از مالیات، هزینه مالی و اقلام خارج از مدل)');result.textContent=str.join(' | ')}
function fmt(v){return new Intl.NumberFormat('fa-IR',{maximumFractionDigits:1}).format(v)}
function renderDiagnosis(){const data=[['بلوک‌های دارای پاسخ',completedBlocks()+'/۹'],['بلوک‌های دارای شاهد اولیه',evidenceCount()+'/۹'],['ریسک‌ها / شکاف‌های مطرح',risks().length]];const stats=$('#diagnosisStats');stats.replaceChildren();data.forEach(([label,n])=>{const d=el('div','metric');d.append(el('b','',String(n)),el('span','',label));stats.append(d)});const list=$('#riskList');list.replaceChildren();for(const r of risks()){const d=el('div','risk'),left=el('div');left.append(el('b','',r.title),el('p','',r.description));d.append(el('span','priority',r.priority),left);list.append(d)}const summary=$('#diagnosisSummary');summary.replaceChildren();summaryLines().forEach(t=>summary.append(el('p','',t)));financial()}
function roadmapData(){const stage=state.profile.stage;const isStart=stage==='idea'||stage==='testing';const customer=value('seg_main')||'مشتریان هدف';const channel=value('chan_discovery')||'کانال جذب اولیه';const tasks=[
[{id:'30a',label:'بازنگری مشتری هدف: '+customer},{id:'30b',label:'انجام ۵ تا ۱۰ گفتگوی مسئله‌محور با مشتریان واقعی'},{id:'30c',label:'تکمیل شواهد برای سه فرضیه پرریسک Canvas'},{id:'30d',label:isStart?'طراحی پیشنهاد اولیه قابل آزمون':'جمع‌آوری داده فروش، ریزش و بازخورد مشتریان فعلی'}],
[{id:'60a',label:'آزمایش کانال: '+channel},{id:'60b',label:'ارائه پیشنهاد واقعی و سنجش تمایل به پرداخت'},{id:'60c',label:'محاسبه حاشیه مشارکت و نقطه سربه‌سر با ارقام واقعی'},{id:'60d',label:'بازنگری ارزش پیشنهادی براساس شواهد آزمایش'}],
[{id:'90a',label:'بازطراحی بلوک‌هایی که فرضیات آن‌ها رد شده است'},{id:'90b',label:'تعیین KPIهای فروش، جذب مشتری و نقدینگی برای دوره بعد'},{id:'90c',label:'تصمیم Go / Pivot / Stop با شواهد قابل بررسی'},{id:'90d',label:stage==='growing'?'انتخاب یک آزمایش توسعه بازار با بودجه و مسئول مشخص':'تعیین مسئول، منابع و تاریخ شروع فاز اجرایی بعدی'}]
];return tasks}
function renderRoadmap(){const root=$('#roadmap');root.replaceChildren();const names=['۳۰ روز اول · کشف و شفاف‌سازی','۶۰ روز · آزمایش و اعتبارسنجی','۹۰ روز · تصمیم و اجرا'],desc=['Outcome: فرضیات اولویت‌دار و مشتری هدف','Outcome: داده واقعی برای سنجش ارزش و درآمد','Outcome: تصمیم مستند و طرح پیاده‌سازی'];let total=0;roadmapData().forEach((tasks,i)=>{const panel=el('div','phase');panel.append(el('h3','',names[i]),el('p','',desc[i]));tasks.forEach(t=>{const label=el('label','task'),check=el('input');check.type='checkbox';check.checked=!!state.tasks[t.id];if(check.checked)total++;check.addEventListener('change',()=>{state.tasks[t.id]=check.checked;save();$('#doneCount').textContent=Object.values(state.tasks).filter(Boolean).length+' اقدام انجام‌شده'});label.append(check,el('span','',t.label));panel.append(label)});root.append(panel)});$('#doneCount').textContent=total+' اقدام انجام‌شده'}
function reflective(topic){const customer=value('seg_main'),p=value('val_problem')||value('seg_need'),promise=value('val_solution'),rev=value('rev_model');const dict={
customer:customer?'What might you be overlooking? چه شواهدی نشان می‌دهد «'+customer+'» واقعاً اولویت فوری برای حل مسئله دارد؟':'What matters most here? اگر مجبور باشی تنها یک گروه مشتری را انتخاب کنی، کدام گروه بیشترین نیاز و دسترسی را دارد؟',
value:p?'Can I challenge that assumption? چه چیزی ثابت می‌کند راه‌حل شما برای «'+p+'» از گزینه‌های موجود مشتری بهتر است؟':'What sits behind that? مشتری دقیقاً چه مشکلی دارد که حاضر است برای حل آن زمان یا پول بپردازد؟',
evidence:evidenceCount()?'What can you draw on from your experience? کدام شاهد ثبت‌شده می‌تواند فرضیه را رد کند، نه فقط تأیید؟':'What would progress look like? اولین گفتگوی واقعی یا آزمایش پرداخت که عدم قطعیت را کاهش بدهد چیست؟',
money:rev?'What might you be overlooking? اگر درآمد از «'+rev+'» باشد، هزینه جذب، ارائه خدمت و تکرار خرید چگونه بر سود اثر می‌گذارند؟':'How might you test willingness to pay? چه پیشنهاد مشخصی با چه قیمتی می‌توانید همین هفته آزمایش کنید؟',
execution:promise?'What is the next best step? کوچک‌ترین اقدامی که ادعای ارزش «'+promise+'» را با واقعیت بازار روبه‌رو کند چیست؟':'What is the next best step? کدام فرضیه اگر اشتباه باشد کل مدل را تغییر می‌دهد؟'
};return dict[topic]||dict.customer}

const INDUSTRY_NAMES={service:'خدمات حرفه‌ای',retail:'خرده‌فروشی',digital:'دیجیتال و نرم‌افزار',manufacturing:'تولید و صنعت',health:'سلامت و زیبایی',education:'آموزش',other:'سایر صنایع'};
const STAGE_NAMES={idea:'ایده',testing:'آزمایش بازار',running:'فعال',growing:'رشد و توسعه'};
const MARKET_NAMES={b2c:'B2C',b2b:'B2B',both:'B2B و B2C'};
const EV_NAMES={assumed:'فرضیه فاقد شاهد',interview:'مصاحبه یا مشاهده',paid:'پرداخت یا خرید واقعی',data:'داده عملکردی مستند'};
function answerNotes(){return BLOCKS.flatMap(b=>questions(b).map(q=>({block:b,title:q.title,note:parts(q.id).note})).filter(q=>q.note))}
function summaryLines(){
 const name=String(state.profile.businessName||'ایده / کسب‌وکار بدون نام').trim();
 const owner=String(state.profile.ownerName||'تکمیل‌کننده نامشخص').trim();
 const chosen=(id)=>value(id)||'هنوز مشخص نشده';
 const lines=[
 'مدل «'+name+'» توسط «'+owner+'» برای حوزه «'+(INDUSTRY_NAMES[state.profile.industry]||'نامشخص')+'» و بازار '+(MARKET_NAMES[state.profile.market]||'نامشخص')+' در مرحله «'+(STAGE_NAMES[state.profile.stage]||'نامشخص')+'» ثبت شده است.',
 'Customer Segment: '+chosen('seg_main')+'؛ نیاز / مسئله: '+(value('seg_need')||value('val_problem')||'نیازمند Customer Discovery')+'.',
 'Value Proposition: '+chosen('val_solution')+'؛ تمایز: '+(value('val_edge')||'هنوز اثبات نشده')+'.',
 'Channel & Revenue: '+(value('chan_discovery')||'کانال نامشخص')+'؛ '+(value('rev_model')||'مدل درآمد نامشخص')+'.',
 'Evidence & Gaps: '+completedBlocks()+' بلوک از ۹ دارای پاسخ، '+evidenceCount()+' بلوک دارای شاهد ثبت‌شده و '+answerNotes().length+' پاسخ دارای توضیح تکمیلی است. این‌ها نشان‌دهنده کامل‌بودن یا اعتبار مدل نیستند.'
 ];
 if(state.profile.challenge)lines.push('مسئله اولویت‌دار اعلام‌شده توسط پاسخ‌دهنده: '+String(state.profile.challenge).slice(0,350));
 return lines;
}
function buildFinalModel(){return{
 title:'بوم مدل کسب‌وکار اختصاصی',name:String(state.profile.businessName||'مدل بدون نام'),owner:String(state.profile.ownerName||'بدون نام'),stage:STAGE_NAMES[state.profile.stage]||'نامشخص',industry:INDUSTRY_NAMES[state.profile.industry]||'نامشخص',date:new Date().toLocaleDateString('fa-IR'),summary:summaryLines(),
 blocks:BLOCKS.map(b=>({name:b.title,en:b.en,text:blockValue(b.id)||'هنوز مشخص نشده — نیازمند تکمیل / اعتبارسنجی',status:EV_NAMES[state.evidence[b.id]?.status]||'فرضیه فاقد شاهد',evidenceNote:String(state.evidence[b.id]?.note||'')})),
 risk:risks().slice(0,8),
 next:roadmapData().map((tasks,i)=>({period:['۳۰ روز','۶۰ روز','۹۰ روز'][i],actions:tasks.map(x=>x.label)})),
 notes:answerNotes().map(x=>({block:x.block.title,question:x.title,note:x.note}))
}}
function renderFinal(){
 const report=buildFinalModel();
 $('#finalTitle').textContent='بوم مدل کسب‌وکار «'+report.name+'»';
 $('#finalMeta').textContent='تکمیل‌کننده: '+report.owner+' · '+report.industry+' · مرحله '+report.stage+' · تاریخ '+report.date;
 const sm=$('#finalSummary');sm.replaceChildren();
 report.summary.forEach((line,i)=>sm.append(el('p',i===0?'lead-summary':'',line)));
 const grid=$('#finalCanvas');grid.replaceChildren();
 report.blocks.forEach(b=>{
  const card=el('article','final-block');
  card.append(el('strong','',b.name+' · '+b.en),el('p','',b.text),el('small','evidence-tag',b.status));
  if(b.evidenceNote)card.append(el('small','', 'شاهد اعلام‌شده: '+b.evidenceNote));
  grid.append(card);
 });
 const risksRoot=$('#finalRisks');risksRoot.replaceChildren();
 report.risk.forEach(r=>{const card=el('div','risk'),content=el('div');content.append(el('b','',r.title),el('p','',r.description));card.append(el('span','priority',r.priority),content);risksRoot.append(card)});
 const nextRoot=$('#finalNext');nextRoot.replaceChildren();
 report.next.forEach(x=>{const card=el('div','mini-step');card.append(el('strong','',x.period),el('p','',x.actions.slice(0,2).join('؛ ')));nextRoot.append(card)});
}
function htmlEscape(s){return String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function downloadCanvasReport(){
 const r=buildFinalModel();
 const paragraphs=r.summary.map(x=>'<p>'+htmlEscape(x)+'</p>').join('');
 const blocks=r.blocks.map(x=>'<article><h3>'+htmlEscape(x.name)+' <small>'+htmlEscape(x.en)+'</small></h3><p>'+htmlEscape(x.text).replaceAll('\n','<br>')+'</p><small>'+htmlEscape(x.status)+(x.evidenceNote?' · '+htmlEscape(x.evidenceNote):'')+'</small></article>').join('');
 const risks=r.risk.map(x=>'<li><strong>'+htmlEscape(x.priority)+' — '+htmlEscape(x.title)+'</strong>: '+htmlEscape(x.description)+'</li>').join('');
 const steps=r.next.map(x=>'<section><h3>'+htmlEscape(x.period)+'</h3><ul>'+x.actions.map(y=>'<li>'+htmlEscape(y)+'</li>').join('')+'</ul></section>').join('');
 const notes=r.notes.map(x=>'<li>'+htmlEscape(x.block)+' · '+htmlEscape(x.question)+': '+htmlEscape(x.note)+'</li>').join('');
 const html='<!doctype html><html lang="fa" dir="rtl"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>'+htmlEscape(r.name)+' | Business Model Canvas</title><style>body{font-family:Tahoma,Arial,sans-serif;line-height:1.95;color:#17392e;margin:28px auto;max-width:1100px;padding:20px}h1{color:#174d3d}h2{border-bottom:2px solid #e0e9de;padding-bottom:9px;margin-top:25px}h3{color:#285e4a}small{font-size:.75rem;color:#60746a}main{display:grid;grid-template-columns:repeat(3,1fr);gap:12px}article{border:1px solid #d6e2d9;border-radius:13px;padding:15px;break-inside:avoid;background:#fbfcfa}article p{white-space:normal;font-size:.89rem}section{break-inside:avoid}li{margin:8px 0}@media(max-width:750px){main{grid-template-columns:1fr}}@media print{body{padding:0;margin:0}main{grid-template-columns:repeat(3,1fr)}} </style></head><body><h1>'+htmlEscape(r.title)+' — '+htmlEscape(r.name)+'</h1><p>تکمیل‌کننده: '+htmlEscape(r.owner)+' · '+htmlEscape(r.industry)+' · '+htmlEscape(r.stage)+' · '+htmlEscape(r.date)+'</p><h2>Executive Summary</h2>'+paragraphs+'<h2>Business Model Canvas — ۹ بلوک</h2><main>'+blocks+'</main><h2>ریسک‌ها و عدم قطعیت‌ها</h2><ol>'+risks+'</ol><h2>نقشه اقدام اولیه</h2>'+steps+'<h2>توضیحات اختصاصی ثبت‌شده</h2><ul>'+notes+'</ul><p><small>خروجی بر پایه خوداظهاری و قواعد تحلیلی است و جایگزین اعتبارسنجی واقعی بازار نیست.</small></p></body></html>';
 const blob=new Blob([html],{type:'text/html;charset=utf-8'}),url=URL.createObjectURL(blob),a=el('a');
 a.href=url;a.download='BMC-'+(r.name.replace(/[^\p{L}\p{N}-]/gu,'-').slice(0,45)||'model')+'.html';
 document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1200);
}
function printFinal(){goto('final');document.body.classList.add('print-final');window.addEventListener('afterprint',()=>document.body.classList.remove('print-final'),{once:true});window.print();}

function renderReflection(){const box=$('#reflectionPrompt');box.textContent=reflective(reflectionTopic);$$('[data-topic]').forEach(b=>b.classList.toggle('active',b.dataset.topic===reflectionTopic));$('#reflectionNote').value=state.reflection||''}
function resetData(){if(!confirm('تمام اطلاعات این پروژه در این مرورگر پاک شود؟ این کار قابل بازگشت نیست.'))return;state=fresh();save();$$('.field input,.field select,.field textarea').forEach(i=>{if(i.dataset.profile)i.value=''});initProfile();goto('dashboard')}
function exportData(){const b=new Blob([JSON.stringify({application:'BMC Studio',exportedAt:new Date().toISOString(),data:state},null,2)],{type:'application/json'}),u=URL.createObjectURL(b),a=el('a');a.href=u;a.download='bmc-studio-'+new Date().toISOString().slice(0,10)+'.json';document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(u),900)}
function readImport(file){if(!file)return;if(file.size>2000000){alert('فایل بسیار بزرگ است.');return}const reader=new FileReader();reader.onload=()=>{try{const obj=JSON.parse(reader.result),d=obj.data||obj;if(!d||d.version!==2||!d.profile||!d.answers||typeof d.answers!=='object')throw Error('format');if(!confirm('فایل جایگزین پروژه فعلی شود؟ ابتدا در صورت نیاز نسخه پشتیبان بگیرید.'))return;state=Object.assign(fresh(),d);save();initProfile();goto('dashboard');alert('پروژه بازیابی شد.')}catch(e){alert('فایل معتبر BMC Studio نیست.')}};reader.readAsText(file)}
function initProfile(){$$('#page-onboard [name]').forEach(input=>{const k=input.name;input.value=state.profile[k]===undefined?'':state.profile[k];input.oninput=input.onchange=()=>{state.profile[k]=input.value;save();renderDashboard()}});$('#reflectionNote').value=state.reflection||''}
function initFinancial(){for(const id of ['price','variable','fixed','volume']){const input=document.getElementById(id);input.value=state.financial[id]===undefined?'':state.financial[id];input.addEventListener('input',()=>{state.financial[id]=input.value;save();financial()})}}
function init(){$$('[data-page]').forEach(b=>b.addEventListener('click',()=>goto(b.dataset.page)));$$('[data-goto]').forEach(b=>b.addEventListener('click',()=>goto(b.dataset.goto)));$('#previousStep').addEventListener('click',()=>moveStep(-1));$('#nextStep').addEventListener('click',()=>moveStep(1));$('#regenerateCanvas').addEventListener('click',()=>{if(!confirm('ویرایش‌های دستی Canvas جایگزین شوند؟'))return;state.manual={};save();renderCanvas();renderDashboard()});$('#exportJSON').addEventListener('click',exportData);$('#importJSON').addEventListener('click',()=>$('#importFile').click());$('#importFile').addEventListener('change',e=>{readImport(e.target.files[0]);e.target.value=''});$('#clearAll').addEventListener('click',resetData);$('#printCanvas').addEventListener('click',printFinal);$('#printReport').addEventListener('click',printFinal);$('[data-topic]').forEach(b=>b.addEventListener('click',()=>{reflectionTopic=b.dataset.topic;renderReflection()}));$('#workspaceSelect').addEventListener('change',e=>switchWorkspace(e.target.value));$('#newWorkspace').addEventListener('click',createWorkspace);$('#downloadCanvasReport').addEventListener('click',downloadCanvasReport);$('#printFinal').addEventListener('click',printFinal);$('#reflectionNote').addEventListener('input',e=>{state.reflection=e.target.value;save()});initProfile();initFinancial();refreshWorkspaceSelector();goto('dashboard');let prompt=null;window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();prompt=e;$('#installButton').textContent='نصب اپ'});$('#installButton').addEventListener('click',async()=>{if(prompt){prompt.prompt();await prompt.userChoice;prompt=null;$('#installButton').textContent='راهنمای نصب'}else{alert(/iPad|iPhone|iPod/.test(navigator.userAgent)?'برای نصب در iPhone: این صفحه را در Safari باز کنید، Share را بزنید، سپس Add to Home Screen را انتخاب کنید.':'برای نصب اپ در Android: از منوی مرورگر گزینه Install app یا Add to Home Screen را انتخاب کنید.')}});window.addEventListener('appinstalled',()=>$('#installButton').textContent='نصب شده');if('serviceWorker'in navigator)window.addEventListener('load',()=>navigator.serviceWorker.register('./sw.js',{scope:'./'}).catch(()=>{}));}
document.addEventListener('DOMContentLoaded',init);
})();
