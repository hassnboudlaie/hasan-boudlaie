/* اپ مستقل راه‌اندازی کسب‌وکار — بر مبنای BOOK_FRAMEWORK.md */
(()=>{'use strict';
const GUIDE=window.SMALL_BUSINESS_GUIDE;
if(!GUIDE||!Array.isArray(GUIDE.stages))throw Error('بانک پرسش‌ها بارگذاری نشده است');
const $=sel=>document.querySelector(sel),$$=sel=>[...document.querySelectorAll(sel)];
const REG='hb-smb-01-projects',ACTIVE='hb-smb-01-active',PREFIX='hb-smb-01-data-';
const UNKNOWN=/^(هنوز|مطمئن نیستم|برای این فعالیت مطمئن|فقط نظر دوستان|مشخص نیست|هیچ شاهدی|نیاز هنوز)/;
const profileDefaults={businessName:'',owner:'',sector:'services',stage:'idea',size:'solo',market:'individual',country:'',city:'',currency:'تومان',description:''};
const profileNames={sectors:{services:'خدمات',retail:'فروشگاه و خرده‌فروشی',manufacturing:'تولید و صنعت',food:'غذا و رستوران',healthcare:'سلامت و زیبایی',education:'آموزش',tourism:'گردشگری و اقامت',digital:'فناوری و اینترنت',trade:'تجارت و توزیع',agriculture:'کشاورزی',construction:'ساخت‌وساز و پیمانکاری',other:'سایر فعالیت‌ها'},stages:{idea:'مرحله ایده',starting:'در حال راه‌اندازی',operating:'فعال',expanding:'در حال توسعه'},sizes:{solo:'فردی',micro:'خرد',small:'کوچک',medium:'متوسط'},markets:{individual:'افراد و خانواده‌ها',organization:'سازمان‌ها و شرکت‌ها',both:'افراد و سازمان‌ها',unknown:'نامشخص'}};
const qIndex=new Map(GUIDE.stages.flatMap((step,i)=>step.questions.map(q=>[q.id,{...q,step:i}]))); 
const escapeHTML=value=>String(value??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
const faNum=value=>new Intl.NumberFormat('fa-IR',{maximumFractionDigits:1}).format(value);
const formatMoney=(value,currency)=>new Intl.NumberFormat('fa-IR',{maximumFractionDigits:0}).format(value)+(currency?' '+currency:'');
const unique=values=>[...new Set(values.filter(Boolean))];
const createId=()=>('smb-'+Date.now().toString(36)+'-'+Math.random().toString(36).slice(2,9));
function fresh(){return{version:1,profile:{...profileDefaults},answers:{},notes:{},finance:{},tasks:{},step:0,createdAt:new Date().toISOString(),updatedAt:''}}
function list(){try{const rows=JSON.parse(localStorage.getItem(REG)||'[]');return Array.isArray(rows)?rows.filter(x=>x&&typeof x.id==='string'):[]}catch{return[]}}
function writeList(rows){try{localStorage.setItem(REG,JSON.stringify(rows))}catch{toast('ذخیره فهرست ممکن نیست')}}
function initialId(){const rows=list();if(!rows.length){const r={id:createId(),name:'مدل جدید',owner:'',updatedAt:''};writeList([r]);try{localStorage.setItem(ACTIVE,r.id)}catch{}return r.id}
 const id=localStorage.getItem(ACTIVE);return rows.some(x=>x.id===id)?id:rows[0].id}
let projectId=initialId();
function load(){
 try{const raw=localStorage.getItem(PREFIX+projectId);if(raw){const data=JSON.parse(raw);if(data?.version===1&&data.profile&&data.answers&&typeof data.answers==='object'){const restored=fresh();return{...restored,...data,profile:{...restored.profile,...data.profile},answers:data.answers||{},notes:data.notes||{},finance:data.finance||{},tasks:data.tasks||{},step:Number.isInteger(data.step)?Math.max(0,Math.min(9,data.step)):0}}}}catch{}
 return fresh();
}
let state=load(),activePage='home',toastTimer=null,installEvent=null;
function toast(message){const node=$('#toast');if(!node)return;node.textContent=message;node.hidden=false;if(toastTimer)clearTimeout(toastTimer);toastTimer=setTimeout(()=>node.hidden=true,3000)}
function renderProjectPicker(){const selector=$('#projectPicker'),rows=list();selector.replaceChildren();rows.forEach(r=>{const option=document.createElement('option');option.value=r.id;option.textContent=r.name+(r.owner?' · '+r.owner:'');selector.append(option)});selector.value=projectId}
function save(){
 state.updatedAt=new Date().toISOString();
 try{localStorage.setItem(PREFIX+projectId,JSON.stringify(state));$('#saveLabel').textContent='ذخیره شد';}
 catch{$('#saveLabel').textContent='ذخیره نشد';toast('فضای ذخیره دستگاه کافی نیست؛ فایل پشتیبان بگیرید');return false}
 const rows=list(),entry=rows.find(x=>x.id===projectId);
 if(entry){entry.name=state.profile.businessName.trim()||'مدل جدید';entry.owner=state.profile.owner.trim();entry.updatedAt=state.updatedAt;writeList(rows)}
 renderProjectPicker();return true;
}
function switchProject(id){
 if(id===projectId||!list().some(r=>r.id===id))return;
 projectId=id;try{localStorage.setItem(ACTIVE,id)}catch{}
 state=load();populateProfile();populateFinance();go('home');
}
function addProject(){
 const owner=prompt('نام فرد یا صاحب کسب‌وکار جدید (اختیاری):','');
 if(owner===null)return;
 const id=createId(),rows=list();
 rows.push({id,name:'مدل جدید',owner:owner.trim().slice(0,80),updatedAt:''});
 writeList(rows);projectId=id;try{localStorage.setItem(ACTIVE,id)}catch{}
 state=fresh();state.profile.owner=owner.trim().slice(0,80);save();populateProfile();populateFinance();go('profile');closeMenu();
}
function closeMenu(){const menu=$('#mainMenu');if(menu?.open)menu.open=false}
function go(page){
 if(!['home','profile','wizard','status','plan'].includes(page))page='home';
 activePage=page;
 $$('.screen').forEach(el=>el.classList.toggle('active',el.id==='page-'+page));
 $$('[data-nav]').forEach(el=>{el.classList.toggle('selected',el.dataset.nav===page);el.setAttribute('aria-current',el.dataset.nav===page?'page':'false')});
 const heads={home:'راه‌اندازی کسب‌وکار من',profile:'معرفی کسب‌وکار',wizard:'پرسش‌های راه‌اندازی',status:'وضعیت کسب‌وکار من',plan:'برنامه کسب‌وکار من'};
 $('#pageHeading').textContent=heads[page];
 if(page==='home')renderHome();
 if(page==='wizard')renderStep();
 if(page==='status')renderStatus();
 if(page==='plan')renderPlan();
 window.scrollTo({top:0,behavior:'instant'});
}
function hasProfile(){return Boolean(String(state.profile.businessName||'').trim())}
function launch(page){if(page==='wizard'&&!hasProfile()){go('profile');return}go(page)}
function populateProfile(){for(const field of $$('#profileForm [name]'))field.value=state.profile[field.name]??''}
function saveProfile(){
 for(const field of $$('#profileForm [name]'))state.profile[field.name]=field.value.trim();
 if(!state.profile.businessName){toast('نام کسب‌وکار را وارد کنید');$('#businessName').focus();return false}
 save();return true;
}
function questionChoices(q){
 const extras=GUIDE.sectorOptions[state.profile.sector]?.[q.id]||[];
 const selected=state.answers[q.id];
 const past=Array.isArray(selected)?selected:(typeof selected==='string'?[selected]:[]);
 return unique([...q.options,...extras,...past,'سایر (در توضیح بنویسید)']);
}
function answerText(id){
 const q=qIndex.get(id),raw=state.answers[id];
 if(!q)return'';
 const chosen=Array.isArray(raw)?raw:raw?[raw]:[];
 const answer=chosen.filter(v=>v!=='سایر (در توضیح بنویسید)').join('، ');
 const note=String(state.notes[id]||'').trim();
 return[answer,note].filter(Boolean).join('؛ ');
}
function answered(q){return Boolean(answerText(q.id))}
function stageStats(index){const arr=GUIDE.stages[index].questions;const done=arr.filter(answered).length;return{done,total:arr.length}}
function metrics(){
 const done=GUIDE.stages.reduce((sum,_,i)=>sum+stageStats(i).done,0),total=GUIDE.questionCount;
 return{done,total,percent:Math.round(100*done/total),stages:GUIDE.stages.filter((_,i)=>stageStats(i).done===stageStats(i).total).length};
}
function renderHome(){
 const m=metrics();
 $('#homeProgress').textContent=faNum(m.percent)+'٪';$('#homeBar').style.width=m.percent+'%';
 const name=state.profile.businessName.trim();
 $('#heroTitle').textContent=name?'مسیر رشد «'+name+'»':'ایده‌ات را به کسب‌وکار تبدیل کن.';
 $('#heroTag').textContent=name?(profileNames.stages[state.profile.stage]||'کسب‌وکار من'):'برنامه شخصی کسب‌وکار';
}
function questionElement(q){
 const root=document.createElement('div');root.className='question';
 const title=document.createElement('label');title.className='question-title';title.textContent=q.label;root.append(title);
 const options=questionChoices(q);
 if(q.multi){
  const details=document.createElement('details');details.className='multi-answer';
  const summary=document.createElement('summary');details.append(summary);
  const wrap=document.createElement('div');wrap.className='multi-items';
  const chosen=Array.isArray(state.answers[q.id])?state.answers[q.id]:[];
  for(const option of options){
   const label=document.createElement('label');label.className='multi-item';
   const check=document.createElement('input');check.type='checkbox';check.value=option;check.checked=chosen.includes(option);
   const text=document.createElement('span');text.textContent=option;
   check.addEventListener('change',()=>{
    if(check.checked&&UNKNOWN.test(option))wrap.querySelectorAll('input[type="checkbox"]').forEach(x=>{if(x!==check)x.checked=false});
    else if(check.checked)wrap.querySelectorAll('input[type="checkbox"]').forEach(x=>{if(x!==check&&UNKNOWN.test(x.value))x.checked=false});
    state.answers[q.id]=[...wrap.querySelectorAll('input:checked')].map(x=>x.value);
    summary.textContent=state.answers[q.id].length?state.answers[q.id].join('، '):'انتخاب یک یا چند گزینه';
    save();refreshCounters();
   });
   label.append(check,text);wrap.append(label);
  }
  summary.textContent=chosen.length?chosen.join('، '):'انتخاب یک یا چند گزینه';
  details.append(wrap);root.append(details);
 }else{
  const select=document.createElement('select');select.className='select-answer';select.setAttribute('aria-label',q.label);
  const empty=document.createElement('option');empty.value='';empty.textContent='انتخاب کنید';select.append(empty);
  for(const option of options){const o=document.createElement('option');o.value=option;o.textContent=option;select.append(o)}
  select.value=typeof state.answers[q.id]==='string'?state.answers[q.id]:'';
  select.addEventListener('change',()=>{state.answers[q.id]=select.value;save();refreshCounters()});
  root.append(select);
 }
 const note=document.createElement('details');note.className='note-detail';
 const summary=document.createElement('summary');summary.textContent='توضیح تکمیلی (اختیاری)';
 const textarea=document.createElement('textarea');textarea.rows=2;textarea.maxLength=1500;textarea.placeholder='مثال یا نکته خاص کسب‌وکار خود را بنویسید';
 textarea.setAttribute('aria-label','توضیح تکمیلی '+q.label);textarea.value=state.notes[q.id]||'';
 if(textarea.value)note.open=true;
 textarea.addEventListener('input',()=>{state.notes[q.id]=textarea.value;save();refreshCounters()});
 note.append(summary,textarea);root.append(note);return root;
}
function refreshCounters(){
 const stat=stageStats(state.step);
 $('#answeredThisStep').textContent=faNum(stat.done)+' از '+faNum(stat.total)+' پاسخ';
}
function renderStep(){
 const current=GUIDE.stages[state.step];
 $('#wizardIndex').textContent='مرحله '+faNum(state.step+1)+' از '+faNum(GUIDE.stages.length);
 $('#wizardTitle').textContent=current.title;$('#wizardSubtitle').textContent=current.subtitle;
 $('#wizardBar').style.width=(100*(state.step+1)/GUIDE.stages.length)+'%';
 $('#sourceText').textContent='الهام‌گرفته از فصل‌های '+current.chapters.map(faNum).join('، ')+' کتاب؛ پرسش‌ها برای همه صنایع بازنویسی شده‌اند.';
 const root=$('#questionList');root.replaceChildren();current.questions.forEach(q=>root.append(questionElement(q)));
 $('#previousStep').disabled=state.step===0;$('#nextStep').textContent=state.step===9?'ساخت برنامه من':'مرحله بعد';
 refreshCounters();
}
function moveStep(delta){
 if(delta>0&&state.step===GUIDE.stages.length-1){save();go('plan');return}
 state.step=Math.min(GUIDE.stages.length-1,Math.max(0,state.step+delta));save();renderStep();
 $('.questions-paper').scrollIntoView({behavior:'smooth',block:'start'});
}
function renderStatus(){
 const m=metrics();$('#statusPercent').textContent=faNum(m.percent)+'٪';
 $('#statusCount').textContent=faNum(m.done)+' از '+faNum(m.total);
 $('#statusStages').textContent=faNum(m.stages)+' از '+faNum(GUIDE.stages.length);
 const root=$('#stageList');root.replaceChildren();
 GUIDE.stages.forEach((stage,i)=>{
  const stat=stageStats(i),b=document.createElement('button');b.type='button';b.className='stage-item';
  const n=document.createElement('span');n.className='stage-n';n.textContent=faNum(i+1);
  const title=document.createElement('span');title.className='stage-name';title.textContent=stage.title;
  const count=document.createElement('span');count.className='stage-progress';count.textContent=faNum(stat.done)+' / '+faNum(stat.total);
  b.append(n,title,count);b.addEventListener('click',()=>{state.step=i;save();go('wizard')});root.append(b);
 });
}
function meaningful(id){
 const x=answerText(id);
 return x&& !UNKNOWN.test(x)?x:'';
}
function summary(){
 const name=state.profile.businessName||'کسب‌وکار بدون نام';
 const sector=profileNames.sectors[state.profile.sector]||'سایر فعالیت‌ها';
 const stage=profileNames.stages[state.profile.stage]||'نامشخص';
 const customers=meaningful('customer')||'مشتری اصلی هنوز قطعی نشده';
 const offer=meaningful('offer')||'پیشنهاد محصول یا خدمت هنوز مشخص نیست';
 const sale=meaningful('firstCustomer')||'شواهد اولین فروش هنوز ثبت نشده';
 const filled=metrics();
 return[
 '«'+name+'» در حوزه '+sector+' و وضعیت «'+stage+'» ثبت شده است.',
 'مشتری اصلی: '+customers+'؛ محصول یا خدمت: '+offer+'.',
 'وضعیت نخستین فروش: '+sale+'.',
 faNum(filled.done)+' پاسخ از '+faNum(filled.total)+' سؤال ثبت شده است؛ تکمیل پاسخ‌ها به معنی اعتبارسنجی بازار یا سودآوری نیست.'
 ];
}
function stageDecisions(stage){
 const answeredRows=stage.questions.filter(q=>answered(q)).map(q=>({name:q.label,value:answerText(q.id)}));
 return answeredRows;
}
function actionPlan(){
 const customer=meaningful('customer')||'گروه مشتریان اصلی';
 const delivery=meaningful('delivery')||'فرایند ارائه محصول یا خدمت';
 const outreach=meaningful('discover')||'کانال جذب مشتری';
 const first=meaningful('firstCustomer');
 const legal=meaningful('legal');
 const supports=meaningful('support');
 const country=state.profile.country.trim()?(' در '+state.profile.country.trim()):' محل فعالیت';
 const needsLocal=['food','healthcare','construction','tourism','manufacturing','agriculture'].includes(state.profile.sector);
 const days30=[
 {id:'30-a',label:'با حداقل ۵ مشتری واقعی از گروه «'+customer+'» درباره نیاز و خرید گفت‌وگو کنید.'},
 {id:'30-b',label:first.includes('پرداخت کرده')||first.includes('چند خرید')?'۳ دلیل خرید مشتریان فعلی را بررسی و ثبت کنید.':'یک پیشنهاد کوچک را به مشتری واقعی ارائه و پاسخ او را ثبت کنید.'},
 {id:'30-c',label:needsLocal?'پیش از هزینه‌کرد سنگین، مجوزها و الزامات فعالیت'+country+' را از مرجع معتبر بررسی کنید.':'موانع ثبت، مالیات و مجوز کسب‌وکار'+country+' را از مرجع معتبر بررسی کنید.'},
 {id:'30-d',label:'هزینه‌های ثابت و متغیر را با رقم واقعی جمع‌آوری و ثبت کنید.'}
 ];
 const days60=[
 {id:'60-a',label:'فروش آزمایشی را از کانال «'+outreach+'» اجرا و تعداد درخواست و خرید را ثبت کنید.'},
 {id:'60-b',label:'با ارقام واقعی، سود هر فروش و نقطه سربه‌سر را محاسبه کنید.'},
 {id:'60-c',label:'مراحل «'+delivery+'» را به یک چک‌لیست اجرای قابل تکرار تبدیل کنید.'},
 {id:'60-d',label:'بازخورد و شکایت مشتریان را ثبت و یک بهبود عملی اجرا کنید.'}
 ];
 const days90=[
 {id:'90-a',label:'۳ شاخص فروش، نقدینگی و کیفیت را برای ماه بعد تعیین کنید.'},
 {id:'90-b',label:'با داده واقعی تصمیم بگیرید چه فعالیتی ادامه یابد، اصلاح شود یا متوقف شود.'},
 {id:'90-c',label:'مسئولیت کارهای ضروری را بین مالک، تیم یا پیمانکار به‌روشنی تقسیم کنید.'},
 {id:'90-d',label:'برای حفظ مشتریان، روش «'+(supports||'پیگیری پس از خرید')+'» را آزمایش و ارزیابی کنید.'}
 ];
 return[{label:'۳۰ روز اول',items:days30},{label:'۶۰ روز',items:days60},{label:'۹۰ روز',items:days90}];
}
function calculate(){
 const f=state.finance;
 const n=k=>parseAmount(f[k]);
 const price=n('price'),variable=n('variable'),fixed=n('fixed'),volume=n('volume'),cash=n('cash'),burn=n('burn');
 const currency=state.profile.currency||'واحد پول انتخابی';
 const valid=(...vals)=>vals.every(x=>Number.isFinite(x)&&x>=0);
 let margin=null,breakEven=null,profit=null,runway=null,warning='';
 if(valid(price,variable)&&price>0){
  margin=price-variable;
  if(margin>0&&valid(fixed))breakEven=Math.ceil(fixed/margin);
  if(margin<=0)warning='هزینه متغیر هر فروش، کمتر از قیمت نیست؛ نقطه سربه‌سر با افزایش فروش به دست نمی‌آید.';
  if(valid(fixed,volume))profit=margin*volume-fixed;
 }
 if(valid(cash,burn)&&burn>0)runway=cash/burn;
 return{margin,breakEven,profit,runway,warning,currency};
}
function parseAmount(x){
 if(x===null||x===undefined||String(x).trim()==='')return null;
 const clean=String(x).replace(/[۰-۹]/g,ch=>String('۰۱۲۳۴۵۶۷۸۹'.indexOf(ch)))
 .replace(/[٠-٩]/g,ch=>String('٠١٢٣٤٥٦٧٨٩'.indexOf(ch)))
 .replace(/[٬,،\s]/g,'').replace(/[٫]/g,'.');
 if(!/^\d+(\.\d+)?$/.test(clean))return null;
 const val=Number(clean);return Number.isFinite(val)&&val<=1e15?val:null;
}
function financeData(){const calc=calculate();return{inputs:{...state.finance},...calc}}
function renderFinance(){
 const root=$('#financeResults');root.replaceChildren();
 const calc=calculate();
 const lines=[
 ['حاشیه سود هر فروش',calc.margin===null?'برای محاسبه، قیمت و هزینه هر واحد را وارد کنید':formatMoney(calc.margin,calc.currency)],
 ['تعداد فروش لازم برای سربه‌سر ماهانه',calc.breakEven===null?'نیازمند قیمت، هزینه متغیر و ثابت معتبر':faNum(calc.breakEven)+' واحد'],
 ['سود یا زیان ماهانه برآوردی',calc.profit===null?'نیازمند تعداد فروش و هزینه‌های معتبر':formatMoney(calc.profit,calc.currency)],
 ['دوام نقدینگی',calc.runway===null?'نیازمند موجودی نقد و خروج ماهانه':faNum(calc.runway)+' ماه']
 ];
 for(const row of lines){const div=document.createElement('div');div.className='fin-cell';
  const value=document.createElement('b');value.textContent=row[1];const label=document.createElement('span');label.textContent=row[0];div.append(value,label);root.append(div)}
 if(calc.warning){const note=document.createElement('div');note.className='fin-note';note.textContent=calc.warning;root.append(note)}
}
function populateFinance(){for(const el of $$('[data-fin]'))el.value=state.finance[el.dataset.fin]??'';renderFinance()}
function renderPlan(){
 const p=state.profile;
 $('#planTitle').textContent='برنامه «'+(p.businessName||'کسب‌وکار من')+'»';
 $('#planMeta').textContent='تکمیل‌کننده: '+(p.owner||'بدون نام')+' · '+(profileNames.sectors[p.sector]||'سایر فعالیت‌ها')+' · '+(profileNames.sizes[p.size]||'')+(p.city?' · '+p.city:'');
 const header=$('#planSummary');header.replaceChildren();summary().forEach(line=>{const el=document.createElement('p');el.textContent=line;header.append(el)});
 const grid=$('#decisionGrid');grid.replaceChildren();
 GUIDE.stages.forEach((stage,i)=>{
  const data=stageDecisions(stage),card=document.createElement('article');card.className='decision';
  const name=document.createElement('h4');name.textContent=faNum(i+1)+' · '+stage.title;
  const content=document.createElement('p');if(!data.length){content.className='unanswered';content.textContent='هنوز اطلاعاتی وارد نشده است.'}
  else content.textContent=data.slice(0,2).map(x=>x.value).join('؛ ')+(data.length>2?' …':'');
  const edit=document.createElement('button');edit.type='button';edit.textContent='ویرایش این بخش';
  edit.addEventListener('click',()=>{state.step=i;save();go('wizard')});card.append(name,content,edit);grid.append(card);
 });
 const roadmap=$('#roadmap');roadmap.replaceChildren();
 actionPlan().forEach(phase=>{
  const section=document.createElement('div');section.className='roadmap-phase';
  const heading=document.createElement('h4');heading.textContent=phase.label;section.append(heading);
  for(const task of phase.items){
   const item=document.createElement('label');item.className='task';
   const check=document.createElement('input');check.type='checkbox';check.checked=Boolean(state.tasks[task.id]);check.addEventListener('change',()=>{state.tasks[task.id]=check.checked;save()});
   const text=document.createElement('span');text.textContent=task.label;item.append(check,text);section.append(item);
  }
  roadmap.append(section);
 });
 renderFinance();
}
function makeReport(){
 return{application:'small-business-guide',version:1,exportedAt:new Date().toISOString(),profile:{...state.profile},metrics:metrics(),summary:summary(),stages:GUIDE.stages.map((stage,i)=>({title:stage.title,chapters:stage.chapters,questions:stage.questions.map(q=>({question:q.label,response:answerText(q.id)||'هنوز پاسخ داده نشده',isUnknown:!meaningful(q.id)}))})),roadmap:actionPlan().map(phase=>({label:phase.label,tasks:phase.items.map(t=>({text:t.label,done:Boolean(state.tasks[t.id])}))})),financial:financeData()}; 
}
function buildHTMLReport(){
 const report=makeReport(),esc=escapeHTML;const prof=report.profile;
 const rows=report.stages.map(stage=>'<section class="step"><h2>'+esc(stage.title)+'</h2><div class="answers">'+stage.questions.map(q=>'<div class="qa"><strong>'+esc(q.question)+'</strong><p>'+esc(q.response)+'</p></div>').join('')+'</div></section>').join('');
 const tasks=report.roadmap.map(phase=>'<section class="period"><h2>'+esc(phase.label)+'</h2><ul>'+phase.tasks.map(t=>'<li>'+(t.done?'☑ ':'☐ ')+esc(t.text)+'</li>').join('')+'</ul></section>').join('');
 const f=report.financial;
 const fields=[['حاشیه سود هر فروش',f.margin===null?'نامشخص':formatMoney(f.margin,f.currency)],['فروش لازم برای سربه‌سر',f.breakEven===null?'نامشخص':faNum(f.breakEven)+' واحد'],['برآورد سود ماهانه',f.profit===null?'نامشخص':formatMoney(f.profit,f.currency)],['دوام نقدینگی',f.runway===null?'نامشخص':faNum(f.runway)+' ماه']];
 const fin=fields.map(x=>'<p><b>'+esc(x[0])+'</b>: '+esc(x[1])+'</p>').join('');
 const style='*{box-sizing:border-box}body{font-family:Tahoma,Arial,sans-serif;max-width:1050px;margin:auto;padding:22px;color:#163b2e;direction:rtl;line-height:1.9}header{background:linear-gradient(120deg,#144735,#27674e);color:white;padding:22px;border-radius:15px}h1{margin:0;font-size:24px}header p{margin:4px 0 0}h2{font-size:16px;color:#1e6347;margin:0 0 12px}.intro{padding:15px;border:1px solid #dce9dd;background:#f2f7f1;border-radius:12px;margin:16px 0}.step{border:1px solid #deeadf;padding:13px;border-radius:12px;margin:10px 0;break-inside:avoid}.answers{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:9px}.qa{background:#fbfdfb;padding:9px;border-radius:8px}.qa strong{font-size:12px}.qa p{font-size:12px;margin:3px 0 0;color:#43614c}.period{break-inside:avoid;border:1px solid #dce9dd;border-radius:10px;padding:12px}.phases{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px}.period li{font-size:12px;padding:3px}.small{font-size:11px;color:#607b68}.fin{margin-top:16px;padding:13px;border-radius:11px;background:#f7f9f5}.fin p{font-size:12px;margin:5px}@media(max-width:700px){.answers,.phases{grid-template-columns:1fr}}@page{size:A4;margin:11mm}@media print{body{padding:0}header{border-radius:0}.step{break-inside:avoid}}';
 return '<!doctype html><html lang="fa" dir="rtl"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>برنامه کسب‌وکار '+esc(prof.businessName)+'</title><style>'+style+'</style></head><body><header><h1>برنامه راه‌اندازی و رشد «'+esc(prof.businessName||'کسب‌وکار من')+'»</h1><p>تکمیل‌کننده: '+esc(prof.owner||'بدون نام')+' · '+esc(profileNames.sectors[prof.sector]||'سایر فعالیت‌ها')+' · '+esc(new Date().toLocaleDateString('fa-IR'))+'</p></header><div class="intro">'+report.summary.map(x=>'<p>'+esc(x)+'</p>').join('')+'</div><h2>پاسخ‌های ۱۰ مرحله</h2>'+rows+'<h2>برنامه اقدام ۹۰روزه</h2><div class="phases">'+tasks+'</div><div class="fin"><h2>محاسبات مالی اختیاری</h2>'+fin+'<p class="small">مقادیر تنها بر اساس داده‌های اعلام‌شده محاسبه شده‌اند؛ این گزارش تأییدیه بازار، مجوز یا پیش‌بینی قطعی نیست.</p></div><p class="small">چارچوب مسیر برگرفته از توالی موضوعات کتاب راهنمای شروع کسب‌وکار کوچینگ، با بازنویسی پرسش‌ها برای تمام صنایع و کسب‌وکارهای کوچک و متوسط است.</p></body></html>';
}
function downloadBlob(data,name,type){
 const blob=new Blob([data],{type}),url=URL.createObjectURL(blob),a=document.createElement('a');
 a.href=url;a.download=name;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),2500);
}
function downloadReport(){
 const safeName=(state.profile.businessName||'کسب-وکار').replace(/[^\p{L}\p{N}-]+/gu,'-').slice(0,50);
 downloadBlob(buildHTMLReport(),'برنامه-کسب-وکار-'+safeName+'.html','text/html;charset=utf-8');
 toast('فایل برنامه ساخته شد');
}
function backup(){
 const payload={application:'small-business-guide',version:1,exportedAt:new Date().toISOString(),data:state};
 downloadBlob(JSON.stringify(payload,null,2),'پشتیبان-کسب-وکار-'+new Date().toISOString().slice(0,10)+'.json','application/json;charset=utf-8');closeMenu();
}
function restore(file){
 if(!file)return;
 if(file.size>2000000){toast('حجم فایل پشتیبان بیش از حد است');return}
 const reader=new FileReader();
 reader.onload=()=>{
  try{
   const obj=JSON.parse(reader.result);if(obj.application!=='small-business-guide'||obj.version!==1||!obj.data?.profile||!obj.data?.answers||typeof obj.data.answers!=='object')throw Error('فرمت نامعتبر');
   if(!confirm('داده‌های این فایل جایگزین پروژه فعلی شوند؟'))return;
   const d=obj.data;
   state={...fresh(),...d,profile:{...profileDefaults,...d.profile},answers:d.answers||{},notes:d.notes||{},finance:d.finance||{},tasks:d.tasks||{},step:Number.isInteger(d.step)?Math.max(0,Math.min(9,d.step)):0};
   save();populateProfile();populateFinance();go('home');toast('فایل پشتیبان بازیابی شد');
  }catch{toast('فایل پشتیبان معتبر نیست')}
 };
 reader.readAsText(file);closeMenu();
}
function reset(){
 if(!confirm('اطلاعات همین کسب‌وکار پاک شود؟ این کار قابل بازگشت نیست.'))return;
 state=fresh();save();populateProfile();populateFinance();go('home');closeMenu();toast('اطلاعات این مدل پاک شد');
}
function setupInstall(){
 window.addEventListener('beforeinstallprompt',event=>{event.preventDefault();installEvent=event;$('#installBtn').textContent='نصب برنامه'});
 $('#installBtn').addEventListener('click',async()=>{
  closeMenu();
  if(installEvent){await installEvent.prompt();await installEvent.userChoice;installEvent=null;return}
  window.location.href='./install.html';
 });
 if('serviceWorker'in navigator)window.addEventListener('load',()=>navigator.serviceWorker.register('./sw.js',{scope:'./'}).catch(()=>{}));
}
function init(){
 $$('#profileForm [name]').forEach(el=>{el.addEventListener('input',()=>{state.profile[el.name]=el.value;save()});el.addEventListener('change',()=>{state.profile[el.name]=el.value;save()})});
 $('#profileForm').addEventListener('submit',event=>{event.preventDefault();if(saveProfile())go('wizard')});
 $$('[data-go]').forEach(b=>b.addEventListener('click',()=>launch(b.dataset.go)));
 $$('[data-nav]').forEach(b=>b.addEventListener('click',()=>launch(b.dataset.nav)));
 $('#projectPicker').addEventListener('change',event=>switchProject(event.target.value));
 $('#addProject').addEventListener('click',addProject);
 $('#previousStep').addEventListener('click',()=>moveStep(-1));
 $('#nextStep').addEventListener('click',()=>moveStep(1));
 $('#skipStep').addEventListener('click',()=>moveStep(1));
 $('#downloadReport').addEventListener('click',downloadReport);
 $('#printReport').addEventListener('click',()=>{go('plan');window.print()});
 $('#backupBtn').addEventListener('click',backup);
 $('#restoreBtn').addEventListener('click',()=>$('#restoreFile').click());
 $('#restoreFile').addEventListener('change',event=>{restore(event.target.files[0]);event.target.value=''});
 $('#resetBtn').addEventListener('click',reset);
 $$('[data-fin]').forEach(el=>el.addEventListener('input',()=>{state.finance[el.dataset.fin]=el.value;save();renderFinance()}));
 populateProfile();populateFinance();renderProjectPicker();setupInstall();go('home');
}
document.addEventListener('DOMContentLoaded',init);
})();
