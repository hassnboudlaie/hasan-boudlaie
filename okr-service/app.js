/* Public OKR v3 pilot. Independent from Kish client systems. Client-only, no authentication. */
(function(){'use strict';
const M=window.PublicOKRModel;if(!M)throw Error('Model missing');
const KEY='hb-public-okr-v3-workspace',BACKUP=KEY+'-backup';
const $=id=>document.getElementById(id);
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','\'':'&#39;'}[c]));
const val=v=>Number.isFinite(Number(v))&&v!==''&&v!==null?Number(v):null;
const today=()=>new Date().toISOString().slice(0,10);
const short=id=>String(id||'').slice(0,30);
const fmt=n=>n===null||n===undefined?'—':new Intl.NumberFormat('fa-IR',{maximumFractionDigits:1}).format(n);
const names={home:'داشبورد راهبرد و OKR',map:'نقشه راهبرد',explore:'اهداف و نتایج کلیدی',board:'KPI و ابتکارات',checkins:'بازبینی و Check-in',settings:'داده و تنظیمات'};
const statuses={draft:'پیش‌نویس',active:'فعال',closed:'بسته‌شده'};
const metricLabel=n=>n===null?'ثبت نشده':fmt(n)+'٪';
const stack={blocked:false,reason:'',warned:false,stale:false};
let state,filter={q:'',status:'all'},route='home',toastTimer;
try{const t=localStorage.getItem(KEY);state=t?M.normalize(JSON.parse(t)):M.blank();}
catch(err){state=M.blank();stack.blocked=true;stack.reason='داده‌های ذخیره‌شده قابل خواندن نیستند. برای جلوگیری از از دست رفتن اطلاعات، ذخیره غیرفعال شد؛ ابتدا فایل پشتیبان بگیرید یا داده معتبر Import کنید.';}
function notify(message){const x=$('toast');x.textContent=message;x.hidden=false;clearTimeout(toastTimer);toastTimer=setTimeout(()=>x.hidden=true,4800);}
function save(){
 if(stack.blocked){notify(stack.reason);return false;}
 try{
  const existing=localStorage.getItem(KEY);
  if(existing){const raw=JSON.parse(existing);const rev=Number(raw.revision)||0;if(rev!==state.revision){stack.stale=true;notify('نسخه جدیدتر در تب دیگری ثبت شده است؛ برای جلوگیری از تداخل، صفحه را تازه‌سازی کنید.');return false;}}
  const copy=JSON.parse(JSON.stringify(state));copy.revision=state.revision+1;copy.updatedAt=new Date().toISOString();
  if(existing)localStorage.setItem(BACKUP,existing);
  localStorage.setItem(KEY,JSON.stringify(copy));state=M.normalize(copy);
  return true;
 }catch(e){notify('ذخیره انجام نشد. فضای ذخیره دستگاه و مجوز مرورگر را بررسی کنید.');return false;}
}
window.addEventListener('storage',e=>{if(e.key===KEY){stack.stale=true;notify('داده در تب دیگری تغییر کرد. قبل از ویرایش، صفحه را Refresh کنید.');}});
const doChange=(callback)=>{if(stack.blocked||stack.stale){notify(stack.reason||'ابتدا صفحه را تازه‌سازی کنید.');return false;}let snapshot=JSON.stringify(state);try{callback();if(!save()){state=M.normalize(JSON.parse(snapshot));return false;}render();return true;}catch(e){state=M.normalize(JSON.parse(snapshot));notify(e.message||'تغییر ثبت نشد.');return false;}};
const btn=(action,label,cls='small',id='')=>'<button type="button" class="btn '+cls+'" data-action="'+esc(action)+'" '+(id?'data-id="'+esc(id)+'"':'')+'>'+label+'</button>';
const card=(content,extra='')=>'<section class="card '+extra+'">'+content+'</section>';
const tag=(label,type='grey')=>'<span class="pill '+type+'">'+esc(label)+'</span>';
const pct=n=>n===null?'<span class="progress-empty">تا ثبت نتیجه، پیشرفت محاسبه نمی‌شود</span>':'<div class="progress" role="meter" aria-valuemin="0" aria-valuemax="100" aria-valuenow="'+n+'"><span style="width:'+Math.max(0,Math.min(100,n))+'%"></span></div><div class="progress-info"><span>شروع</span><strong>'+fmt(n)+'٪</strong><span>هدف</span></div>';
const empty=(title,desc,action,label)=>'<div class="empty"><strong>'+title+'</strong><p>'+desc+'</p>'+btn(action,label,'primary')+'</div>';
const findO=id=>state.objectives.find(x=>x.id===id);
const findK=id=>state.kpis.find(x=>x.id===id);
const alignName=a=>{if(!a||!a.type||!a.id)return 'بدون هم‌راستایی';const r=a.type==='pillar'?state.pillars.find(x=>x.id===a.id):a.type==='kpi'?findK(a.id):findO(a.id);return (a.type==='pillar'?'رکن راهبردی: ':a.type==='kpi'?'شاخص: ':'هدف: ')+(r?r.name:'مرجع حذف‌شده');};
const status=o=>tag(statuses[o.status]||'پیش‌نویس',o.status==='active'?'green':o.status==='closed'?'grey':'amber');
const bar=o=>pct(M.objectiveProgress(o));
const views={
home(){
 let active=state.objectives.filter(x=>x.status==='active'),scores=active.map(M.objectiveProgress).filter(x=>x!==null),avg=scores.length?Math.round(scores.reduce((a,b)=>a+b,0)/scores.length):null;
 const stats='<div class="grid">'+[
 ['هدف فعال',active.length,''],['میانگین پیشرفت',avg===null?'—':avg+'٪','بر پایه KRهای ثبت‌شده'],['شاخص‌های کسب‌وکار',state.kpis.length,'KPI'],['بازبینی ثبت‌شده',state.checkins.length,'Check-ins']
 ].map(([n,v,d])=>card('<span class="metric-label">'+n+'</span><div class="metric">'+fmt(v).replace('٪','')+(typeof v==='string'&&v.includes('٪')?'٪':'')+'</div><small class="metric-hint">'+d+'</small>','span3')).join('')+'</div>';
 const hero='<section class="hero"><div><span class="eyebrow" style="color:#b4dce8">YOUR STRATEGY OPERATING SYSTEM</span><h2>استراتژی را به نتیجه تبدیل کنید.</h2><p>راهبرد ← هدف ← نتیجه قابل‌اندازه‌گیری ← بازبینی مستمر</p><div class="row-actions" style="margin-top:14px">'+btn('new-objective','+ هدف جدید','')+btn('new-pillar','+ رکن راهبردی','')+'</div></div><span class="hero-icon" aria-hidden="true">◈</span></section>';
 const latest=[...state.objectives].sort((a,b)=>(b.createdAt||'').localeCompare(a.createdAt||'')).slice(0,4);
 return hero+'<div class="section">'+stats+'</div><div class="section"><div class="section-title"><div><h2>اولویت‌های جاری</h2><p>پیشرفت بر اساس Key Resultهای قابل‌سنجش</p></div>'+btn('go-explore','مشاهده همه اهداف')+'</div>'+
 (latest.length?'<div class="grid">'+latest.map(o=>card('<div class="row-actions">'+status(o)+tag(o.team||'بدون تیم')+'</div><h3>'+esc(o.name)+'</h3>'+bar(o)+'<div style="margin-top:13px">'+btn('view-objective','جزئیات و نتایج','small',o.id)+'</div>','span6')).join('')+'</div>':empty('هنوز هدفی تعریف نشده','می‌توانید از یک نمونه تمرینی شروع کنید یا اهداف واقعی خود را بسازید.','load-demo','بارگذاری نمونه تمرینی'))+
 '</div><div class="section">'+card('<h3>راهبرد روشن، اهداف هم‌راستا</h3><p>Ultimate Goal و Strategic Pillars را مشخص کنید و هر Objective را به یک اولویت مرتبط کنید؛ هم‌راستایی اجباری نیست.</p><div class="row-actions">'+btn('go-map','نقشه راهبرد')+btn('new-kpi','+ KPI')+btn('go-settings','پشتیبان و Export')+'</div>')+'</div>';
},
map(){
 let pillars=state.pillars,objectives=state.objectives;
 function subtree(p,depth=0,trail=new Set()){if(depth>7||trail.has(p.id))return '<div class="warning">چرخه نامعتبر در ارکان راهبردی</div>';let next=new Set(trail);next.add(p.id);
 let children=pillars.filter(c=>c.parentId===p.id);
 let aligned=objectives.filter(o=>o.align&&o.align.type==='pillar'&&o.align.id===p.id);
 return '<article class="pillar"><div class="row-actions">'+tag('Strategic Pillar','green')+btn('edit-pillar','ویرایش','small',p.id)+'</div><div class="pillar-name">'+esc(p.name)+'</div><div class="sub">'+aligned.length+' هدف مرتبط</div>'+
 aligned.map(o=>'<div class="nested">'+esc(o.name)+' · '+metricLabel(M.objectiveProgress(o))+'</div>').join('')+
 children.map(c=>'<div class="nested">'+subtree(c,depth+1,next)+'</div>').join('')+'</article>';}
 const root='<div class="map-root"><span class="eyebrow">ULTIMATE GOAL</span><div class="row-actions" style="justify-content:space-between"><strong>'+esc(state.ultimateGoal||'Ultimate Goal هنوز تعریف نشده')+'</strong>'+btn('edit-strategy',state.ultimateGoal?'ویرایش':'تعریف هدف غایی')+'</div></div>';
 const top=pillars.filter(p=>!p.parentId||!pillars.some(x=>x.id===p.parentId));
 const unmapped=objectives.filter(o=>!o.align||!o.align.id);
 return '<div class="section-title"><div><h2>Strategy Map</h2><p>نمای ارتباط راهبرد، ارکان و اهداف</p></div>'+btn('new-pillar','+ رکن راهبردی','primary')+'</div>'+root+
 (pillars.length?'<div class="pillar-grid">'+top.map(p=>subtree(p)).join('')+'</div>':empty('ارکان راهبردی هنوز ثبت نشده‌اند','۳ تا ۵ رکن انتخابی را برای تحقق هدف غایی مشخص کنید.','new-pillar','ایجاد اولین رکن'))+
 '<div class="section">'+card('<h3>اهداف هم‌راستا با اهداف دیگر یا KPI</h3><div class="list">'+
 (objectives.filter(o=>o.align&&o.align.type!=='pillar').map(o=>'<div class="item"><div><strong>'+esc(o.name)+'</strong><div class="meta">'+esc(alignName(o.align))+'</div></div>'+btn('view-objective','باز کردن','small',o.id)+'</div>').join('')||'<p>فعلاً هیچ هدفی به Objective یا KPI دیگری مرتبط نشده است.</p>')+
 '</div>')+'</div>'+(unmapped.length?'<div class="section">'+card('<h3>اهداف بدون هم‌راستایی</h3><p>'+unmapped.map(x=>esc(x.name)).join(' · ')+'</p>')+'</div>':'');
},
explore(){
 const fs=state.objectives.filter(o=>(filter.status==='all'||o.status===filter.status)&&(!filter.q||(o.name+' '+o.team+' '+o.lead).toLowerCase().includes(filter.q.toLowerCase())));
 return '<div class="section-title"><div><h2>Explore · اهداف و نتایج</h2><p>هدف‌ها را جست‌وجو، اندازه‌گیری و به‌روزرسانی کنید.</p></div>'+btn('new-objective','+ Objective','primary')+'</div>'+
 '<div class="toolbar"><div class="field"><label for="searchObjectives">جست‌وجو</label><input id="searchObjectives" type="search" placeholder="عنوان، تیم یا مسئول" value="'+esc(filter.q)+'"></div><div class="field"><label for="statusFilter">وضعیت</label><select id="statusFilter"><option value="all">همه</option>'+Object.keys(statuses).map(k=>'<option value="'+k+'" '+(filter.status===k?'selected':'')+'>'+statuses[k]+'</option>').join('')+'</select></div></div>'+
 (fs.length?'<div class="list">'+fs.map(o=>'<article class="item"><div style="flex:1;max-width:720px"><div class="row-actions">'+status(o)+tag(o.team||'بدون تیم')+'</div><h3>'+esc(o.name)+'</h3><div class="meta">مسئول: '+esc(o.lead||'نامشخص')+' · '+esc(o.timeframe||'بدون بازه')+' · '+esc(alignName(o.align))+'</div>'+bar(o)+'<div class="meta">'+o.results.length+' نتیجه کلیدی</div></div><div class="actions">'+btn('view-objective','جزئیات','small',o.id)+btn('new-result','+ KR','small',o.id)+btn('new-checkin','Check-in','small',o.id)+'</div></article>').join('')+'</div>':empty('هیچ هدفی با فیلتر فعلی پیدا نشد','فیلتر را تغییر دهید یا یک هدف جدید بسازید.','new-objective','هدف جدید'));
},
board(){
 const kpis=state.kpis,initiatives=state.initiatives;
 return '<div class="section-title"><div><h2>Board · شاخص‌ها و اقدامات</h2><p>KPI برای سلامت جاری؛ OKR برای بهبود؛ Initiative برای کار اجرایی.</p></div><div class="row-actions">'+btn('new-kpi','+ KPI','primary')+btn('new-initiative','+ Initiative')+'</div></div>'+
 '<div class="board-cols"><section><h3>KPI Board</h3><div class="list">'+(kpis.length?kpis.map(k=>'<article class="board-card"><div class="row-actions">'+tag(k.type==='weekly'?'هفتگی':k.type==='binary'?'باینری':'عددی')+tag(M.KPIHealth(k)==='good'?'در محدوده هدف':M.KPIHealth(k)==='risk'?'نیازمند توجه':'بدون داده',M.KPIHealth(k)==='good'?'green':M.KPIHealth(k)==='risk'?'amber':'grey')+'</div><h3>'+esc(k.name)+'</h3><p>مقدار فعلی: '+(k.type==='binary'?(k.current?'انجام‌شده':'انجام‌نشده'):fmt(k.current)+' '+esc(k.unit))+' · هدف: '+(k.type==='binary'?'انجام شود':fmt(k.target)+' '+esc(k.unit))+'</p><div class="row-actions">'+btn('update-kpi','ثبت مقدار','small',k.id)+btn('edit-kpi','ویرایش','small',k.id)+'</div></article>').join(''):empty('هنوز KPI ندارید','شاخص‌های جاری سلامت عملکرد را جدا از OKR دنبال کنید.','new-kpi','ایجاد KPI'))+'</div></section>'+
 '<section><h3>Initiatives · اقدام‌ها</h3><div class="list">'+(initiatives.length?initiatives.map(i=>'<article class="board-card"><div class="row-actions">'+tag(i.status==='done'?'انجام‌شده':i.status==='doing'?'در حال اجرا':'برنامه‌ریزی',i.status==='done'?'green':i.status==='doing'?'amber':'grey')+'</div><h3>'+esc(i.name)+'</h3><p>مسئول: '+esc(i.owner||'نامشخص')+'</p><p>'+(i.objectiveId?'هدف مرتبط: '+esc(findO(i.objectiveId)?.name||'یافت نشد'):i.kpiId?'KPI مرتبط: '+esc(findK(i.kpiId)?.name||'یافت نشد'):'اقدام مستقل')+'</p>'+btn('edit-initiative','ویرایش و وضعیت','small',i.id)+'</article>').join(''):empty('هنوز Initiative ندارید','اقدام اجرایی را مستقل یا مرتبط با هدف تعریف کنید.','new-initiative','ایجاد Initiative'))+'</div></section></div>';
},
checkins(){
 const list=[...state.checkins].sort((a,b)=>(b.date||'').localeCompare(a.date||'')).slice(0,35);
 return '<div class="section-title"><div><h2>Weekly Check-in</h2><p>مقدار واقعی، اعتماد به تحقق هدف و مانع را ثبت کنید.</p></div>'+btn('new-checkin','+ ثبت بازبینی','primary')+'</div>'+
 card('<h3>چرخه یادگیری و پاسخ‌گویی</h3><p>Check-in باید یک مقدار واقعی برای نتیجه کلیدی ثبت کند. گزارش‌ها فقط بر پایه داده‌هایی که خودتان وارد کرده‌اید محاسبه می‌شوند.</p><div class="callout">ثبت بازبینی در نسخه فعلی فقط در همین مرورگر است؛ برای تیم‌ها Notification و Sync چندکاربره فعال نیست.</div>')+
 '<div class="section"><div class="list">'+(list.length?list.map(x=>'<article class="checkin"><div class="row-actions">'+tag(x.date)+tag(x.confidence==='high'?'اطمینان بالا':x.confidence==='low'?'ریسک بالا':'اطمینان متوسط',x.confidence==='high'?'green':x.confidence==='low'?'red':'amber')+'</div><strong>'+esc(findO(x.objectiveId)?.name||'هدف حذف‌شده')+'</strong><p>نتیجه: '+esc(findO(x.objectiveId)?.results.find(r=>r.id===x.resultId)?.name||'ثبت قبلی')+' · مقدار ثبت‌شده: '+(x.actual===true?'انجام‌شده':fmt(x.actual))+'</p>'+(x.blocker?'<p>مانع/اقدام: '+esc(x.blocker)+'</p>':'')+'</article>').join(''):empty('هنوز بازبینی ثبت نشده','پس از ایجاد Objective و KR، اولین Check-in را ثبت کنید.','new-checkin','شروع بازبینی'))+'</div></div>';
},
settings(){
 return '<div class="section-title"><div><h2>فضای کاری و داده‌ها</h2><p>پشتیبان‌گیری، بازیابی و شفافیت محدودیت‌ها</p></div></div>'+
 card('<h3>مالکیت داده با شماست</h3><p>این نسخه برای استفاده شخصی/آزمایشی است. اطلاعات صرفاً در localStorage همین مرورگر ذخیره می‌شوند؛ حساب کاربری، فضای ابری، دسترسی تیمی یا پشتیبان سروری وجود ندارد.</p><p>آخرین تغییر: '+esc(state.updatedAt?new Date(state.updatedAt).toLocaleString('fa-IR'):'هنوز ذخیره نشده')+' · نسخه داده: '+state.revision+'</p>'+
 '<div class="row-actions">'+btn('export-json','دانلود پشتیبان JSON','primary')+btn('import-json','بازیابی از فایل')+btn('export-csv','گزارش CSV')+'</div>')+
 '<div class="section">'+card('<h3>نمونه تمرینی و آغاز مجدد</h3><p>برای شناخت اپ می‌توانید داده‌های نمونه غیرواقعی را جایگزین اطلاعات فعلی کنید. پیش از این کار، از داده‌های خود خروجی بگیرید.</p><div class="row-actions">'+btn('load-demo','بارگذاری مثال تمرینی')+btn('reset','پاک‌سازی داده این اپ','danger')+'</div>')+'</div>'+
 '<div class="section"><div class="callout warning"><strong>محدودیت امنیتی پایلوت</strong><p>از ورود داده محرمانه سازمان، اطلاعات پرسنلی، قراردادها و رمزهای عبور خودداری کنید. Multi-user، مجوزهای سروری، اعلان، API هوش مصنوعی و یکپارچگی با OKR کیش وجود ندارد.</p></div></div>';
}
};
function render(){
 const r=(location.hash||'#/home').slice(2);route=views[r]?r:'home';
 $('pageTitle').textContent=names[route];$('view').innerHTML=views[route]();
 document.querySelectorAll('[data-route]').forEach(x=>{if(x.dataset.route===route)x.setAttribute('aria-current','page');else x.removeAttribute('aria-current');});
}
function navigate(name){location.hash='#/'+name;render();window.scrollTo?.({top:0,behavior:'smooth'});}
function input(name,label,value='',required=false,kind='text',help=''){
 return '<div class="field"><label for="fld-'+name+'">'+esc(label)+'</label>'+
 (kind==='textarea'?'<textarea name="'+name+'" id="fld-'+name+'" maxlength="700" '+(required?'required':'')+'>'+esc(value)+'</textarea>':
 '<input name="'+name+'" id="fld-'+name+'" type="'+kind+'" value="'+esc(value)+'" '+(required?'required':'')+' '+(kind==='number'?'step="any"':'')+' maxlength="240">')+
 (help?'<small class="help">'+esc(help)+'</small>':'')+'</div>';
}
function select(name,label,options,selected){
 return '<div class="field"><label for="fld-'+name+'">'+esc(label)+'</label><select name="'+name+'" id="fld-'+name+'">'+options.map(([v,t])=>'<option value="'+esc(v)+'" '+(String(v)===String(selected)?'selected':'')+'>'+esc(t)+'</option>').join('')+'</select></div>';
}
function alignmentOptions(exclude=''){
 return [['','بدون هم‌راستایی'],...state.pillars.map(x=>['pillar:'+x.id,'رکن: '+x.name]),...state.objectives.filter(x=>x.id!==exclude).map(x=>['objective:'+x.id,'هدف: '+x.name]),...state.kpis.map(x=>['kpi:'+x.id,'KPI: '+x.name])];
}
const form=(name,inside,button='ذخیره',id='')=>'<form data-form="'+name+'" '+(id?'data-id="'+esc(id)+'"':'')+'><div class="modal-content">'+inside+'</div><div class="modal-actions">'+btn('close-dialog','انصراف')+'<button class="btn primary" type="submit">'+button+'</button></div></form>';
function show(title,body){$('dialogTitle').textContent=title;$('dialogBody').innerHTML=body;$('modalLayer').hidden=false;document.body.style.overflow='hidden';$('dialogBody').querySelector('input,textarea,select,button')?.focus();}
function close(){if(document.activeElement instanceof HTMLElement)document.activeElement.blur();$('modalLayer').hidden=true;$('dialogBody').innerHTML='';document.body.style.overflow='';}
function openForm(action,id=''){
 let o,body='',title='',name=action;
 if(action==='edit-strategy'){title='Ultimate Goal';body=form('strategy',input('ultimateGoal','هدف غایی سازمان',state.ultimateGoal,true,'textarea','هدف بنیادی سازمان را با یک جمله روشن بیان کنید.'));}
 if(action==='new-pillar'||action==='edit-pillar'){o=state.pillars.find(x=>x.id===id);title=o?'ویرایش رکن راهبردی':'رکن راهبردی جدید';body=form('pillar',input('name','عنوان رکن راهبردی',o?.name||'',true)+select('parentId','رکن بالادستی (اختیاری)',[['','بدون والد'],...state.pillars.filter(x=>x.id!==id).map(x=>[x.id,x.name])],o?.parentId||''),'ذخیره رکن',id);}
 if(action==='new-objective'||action==='edit-objective'){o=findO(id);title=o?'ویرایش Objective':'Objective جدید';const align=o?.align?(o.align.type+':'+o.align.id):'';body=form('objective',
 input('name','عنوان هدف کیفی',o?.name||'',true)+
 '<div class="form-grid">'+input('team','سطح / تیم',o?.team||'شرکت')+input('lead','مسئول هدف',o?.lead||'')+input('timeframe','دوره یا فصل',o?.timeframe||'')+
 select('status','وضعیت',[['draft','پیش‌نویس'],['active','فعال'],['closed','بسته‌شده']],o?.status||'draft')+'</div>'+
 select('alignment','هم‌راستایی با یک هدف یا رکن',alignmentOptions(id),align)+
 '<small class="help">هر Objective فقط یک Parent اصلی دارد؛ چرخه و ارتباط با خودش مجاز نیست.</small>','ذخیره Objective',id);}
 if(action==='new-result'||action==='edit-result'){const [oid,rid]=id.split('|');o=findO(oid);let kr=o?.results.find(x=>x.id===rid);if(!o){notify('ابتدا یک Objective انتخاب کنید.');return;}title=kr?'ویرایش Key Result':'نتیجه کلیدی جدید';body=form('result',
 '<p class="muted">هدف: '+esc(o.name)+'</p>'+
 input('name','عنوان نتیجه قابل‌اندازه‌گیری',kr?.name||'',true)+
 '<div class="form-grid">'+select('type','نوع نتیجه',[['number','عددی'],['binary','باینری: انجام شد / نشد']],kr?.type||'number')+
 input('unit','واحد سنجش',kr?.unit||'')+
 input('start','Baseline',kr?.start??0,false,'number')+input('current','مقدار فعلی',kr?.type==='binary'?(kr.current?1:0):(kr?.current??0),false,'number')+
 input('target','Target',kr?.target??100,false,'number')+input('weight','وزن پیشرفت (مثبت)',kr?.weight??1,false,'number')+'</div>'+
 '<div class="callout">نتیجه عددی باید Baseline و Target متفاوت داشته باشد. پیشرفت کاهش مطلوب نیز درست محاسبه می‌شود.</div>'+
 '<input type="hidden" name="objectiveId" value="'+esc(oid)+'">','ذخیره نتیجه',id);}
 if(action==='new-kpi'||action==='edit-kpi'){o=findK(id);title=o?'ویرایش KPI':'KPI جدید';body=form('kpi',input('name','عنوان شاخص سلامت عملکرد',o?.name||'',true)+
 '<div class="form-grid">'+select('type','نوع شاخص',[['number','عددی'],['weekly','هفتگی'],['binary','باینری']],o?.type||'weekly')+
 select('direction','جهت مطلوب',[['up','افزایش'],['down','کاهش']],o?.direction||'up')+
 input('current','مقدار فعلی (باینری ۰ یا ۱)',o?.type==='binary'?(o.current?1:0):(o?.current??0),false,'number')+
 input('target','حد هدف',o?.target??100,false,'number')+
 input('unit','واحد',o?.unit||'')+input('owner','مسئول',o?.owner||'')+'</div>','ذخیره KPI',id);}
 if(action==='new-initiative'||action==='edit-initiative'){o=state.initiatives.find(x=>x.id===id);title=o?'ویرایش اقدام':'Initiative جدید';body=form('initiative',input('name','عنوان اقدام یا پروژه',o?.name||'',true)+
 input('owner','مسئول',o?.owner||'')+
 select('status','وضعیت',[['todo','برنامه‌ریزی'],['doing','در حال اجرا'],['done','انجام‌شده']],o?.status||'todo')+
 select('objectiveId','هدف مرتبط (اختیاری)',[['','بدون هدف'],...state.objectives.map(x=>[x.id,x.name])],o?.objectiveId||'')+
 select('kpiId','KPI مرتبط (اختیاری)',[['','بدون KPI'],...state.kpis.map(x=>[x.id,x.name])],o?.kpiId||'')+
 '<p class="small muted">می‌توانید Initiative را مستقل هم ثبت کنید.</p>','ذخیره اقدام',id);}
 if(action==='new-checkin'){if(!state.objectives.some(x=>x.results.length)){notify('برای Check-in ابتدا یک Objective با Key Result بسازید.');navigate('explore');return;}title='ثبت Check-in';let results=state.objectives.flatMap(o=>o.results.map(r=>[o.id+'|'+r.id,o.name+' — '+r.name]));const selected=results.some(x=>x[0].startsWith(id+'|'))?results.find(x=>x[0].startsWith(id+'|'))[0]:results[0][0];
 body=form('checkin',select('result','نتیجه کلیدی',results,selected)+
 input('date','تاریخ بازبینی',today(),true,'date')+
 input('actual','مقدار واقعی (برای باینری: ۰ یا ۱)',0,true,'number')+
 select('confidence','سطح اطمینان',[['high','بالا'],['medium','متوسط'],['low','پایین / ریسک']], 'medium')+
 input('blocker','مانع، یادگیری یا اقدام بعدی', '',false,'textarea'),'ثبت و به‌روزرسانی');}
 if(action==='update-kpi'){o=findK(id);if(!o)return;title='به‌روزرسانی KPI';body=form('kpi-update','<p class="muted">'+esc(o.name)+'</p>'+input('date','تاریخ',today(),true,'date')+input('value','مقدار جدید (باینری ۰ یا ۱)',o.type==='binary'?(o.current?1:0):o.current,true,'number'),'ثبت اندازه‌گیری',id);}
 if(body)show(title,body);
}
function objectiveDetail(id){const o=findO(id);if(!o){notify('هدف پیدا نشد.');return;}const results=o.results.map(r=>'<article class="item"><div style="flex:1"><h3>'+esc(r.name)+'</h3><div class="meta">Baseline: '+fmt(r.start)+' · Current: '+fmt(r.current)+' · Target: '+fmt(r.target)+' '+esc(r.unit)+' · وزن: '+fmt(r.weight)+'</div>'+pct(M.progress(r.start,r.current,r.target,r.type))+'</div>'+btn('edit-result','ویرایش','small',o.id+'|'+r.id)+'</article>').join('');
 show('جزئیات Objective','<div class="modal-content"><h2>'+esc(o.name)+'</h2><div class="row-actions">'+status(o)+tag(o.team||'بدون تیم')+'</div><p>مسئول: '+esc(o.lead||'نامشخص')+' · دوره: '+esc(o.timeframe||'بدون دوره')+'</p><p>Alignment: '+esc(alignName(o.align))+'</p>'+pct(M.objectiveProgress(o))+
 '<h3 style="margin-top:20px">Key Results</h3><div class="list">'+(results||'<p class="muted">نتیجه‌ای تعریف نشده است.</p>')+'</div>'+
 '<div class="row-actions" style="margin-top:15px">'+btn('new-result','+ نتیجه کلیدی','small',o.id)+btn('new-checkin','ثبت Check-in','small',o.id)+btn('edit-objective','ویرایش هدف','small',o.id)+btn('clone-objective','کپی برای دوره جدید','small',o.id)+(o.status!=='closed'?btn('close-objective','بستن هدف','small',o.id):'')+'</div></div>');
}
function read(form,key){return String(new FormData(form).get(key)??'').trim();}
function n(form,key){const s=read(form,key);return s===''?NaN:Number(s);}
function processForm(f){
 const type=f.dataset.form,id=f.dataset.id||'';let go;
 try{
  if(type==='strategy'){const x=read(f,'ultimateGoal');if(x.length<5)throw Error('هدف غایی را روشن‌تر بنویسید.');go=()=>{state.ultimateGoal=x;};}
  if(type==='pillar'){const x=read(f,'name'),parent=read(f,'parentId'),p=state.pillars.find(q=>q.id===id);if(x.length<3)throw Error('عنوان رکن کوتاه است.');if(p&&!M.validParent(state.pillars,id,parent))throw Error('چرخه یا والد نامعتبر است.');go=()=>{if(p){p.name=x;p.parentId=parent;}else state.pillars.push({id:M.uid(),name:x,parentId:parent});};}
  if(type==='objective'){const title=read(f,'name');if(title.length<5)throw Error('عنوان هدف را روشن‌تر بنویسید.');const a=read(f,'alignment'),[kind,ref]=a?a.split(':'):['',''],align=kind?{type:kind,id:ref}:null;const status=read(f,'status');if(!M.validAlignment(state,id||'new',align))throw Error('هم‌راستایی نامعتبر یا دارای چرخه است.');go=()=>{const old=findO(id);let item={id:old?.id||M.uid(),name:title,team:read(f,'team'),lead:read(f,'lead'),timeframe:read(f,'timeframe'),status,align,results:old?.results||[],createdAt:old?.createdAt||new Date().toISOString(),closedNote:old?.closedNote||''};if(old)Object.assign(old,item);else state.objectives.push(item);};}
  if(type==='result'){const oid=read(f,'objectiveId'),o=findO(oid),[_,rid]=id.split('|');if(!o)throw Error('Objective یافت نشد.');const kind=read(f,'type'),x=read(f,'name'),w=n(f,'weight'),start=n(f,'start'),current=n(f,'current'),target=n(f,'target');if(x.length<4)throw Error('عنوان KR کافی نیست.');if(kind==='number'&&(![start,current,target].every(Number.isFinite)||start===target))throw Error('Baseline و Target باید عددی و متفاوت باشند.');if(!Number.isFinite(w)||w<=0||w>10000)throw Error('وزن KR باید مثبت و معتبر باشد.');if(kind==='binary'&&current!==0&&current!==1)throw Error('برای نتیجه باینری مقدار فعلی ۰ یا ۱ است.');go=()=>{const old=o.results.find(x=>x.id===rid),item={id:old?.id||M.uid(),name:x,type:kind,start:kind==='binary'?0:start,current:kind==='binary'?current===1:current,target:kind==='binary'?1:target,weight:w,unit:read(f,'unit')};if(old)Object.assign(old,item);else o.results.push(item);};}
  if(type==='kpi'){const kind=read(f,'type'),x=read(f,'name'),current=n(f,'current'),target=n(f,'target');if(x.length<3||!Number.isFinite(current)||(kind!=='binary'&&!Number.isFinite(target)))throw Error('عنوان و مقادیر KPI باید معتبر باشند.');if(kind==='binary'&&current!==0&&current!==1)throw Error('مقدار باینری فقط ۰ یا ۱ است.');go=()=>{const old=findK(id),k={id:old?.id||M.uid(),name:x,type:kind,direction:read(f,'direction'),current:kind==='binary'?current===1:current,target:kind==='binary'?1:target,unit:read(f,'unit'),owner:read(f,'owner'),history:old?.history||[]};if(old)Object.assign(old,k);else state.kpis.push(k);};}
  if(type==='initiative'){const x=read(f,'name');if(x.length<4)throw Error('عنوان Initiative کافی نیست.');go=()=>{const old=state.initiatives.find(i=>i.id===id),item={id:old?.id||M.uid(),name:x,owner:read(f,'owner'),status:read(f,'status'),objectiveId:read(f,'objectiveId'),kpiId:read(f,'kpiId')};if(old)Object.assign(old,item);else state.initiatives.push(item);};}
  if(type==='checkin'){const [oid,rid]=read(f,'result').split('|'),o=findO(oid),kr=o?.results.find(r=>r.id===rid),v=n(f,'actual'),date=read(f,'date');if(!kr||!Number.isFinite(v)||(kr.type==='binary'&&v!==0&&v!==1))throw Error('مقدار واقعی معتبر انتخاب کنید.');if(!/^\d{4}-\d{2}-\d{2}$/.test(date))throw Error('تاریخ معتبر نیست.');go=()=>{kr.current=kr.type==='binary'?v===1:v;state.checkins.push({id:M.uid(),date,objectiveId:oid,resultId:rid,actual:kr.current,confidence:read(f,'confidence'),blocker:read(f,'blocker')});};}
  if(type==='kpi-update'){const k=findK(id),v=n(f,'value'),date=read(f,'date');if(!k||!Number.isFinite(v)||(k.type==='binary'&&v!==0&&v!==1))throw Error('مقدار KPI معتبر نیست.');if(!/^\d{4}-\d{2}-\d{2}$/.test(date))throw Error('تاریخ معتبر نیست.');go=()=>{k.current=k.type==='binary'?v===1:v;k.history.push({date,value:v});};}
  if(!go)throw Error('نوع فرم ناشناخته است.');
  if(doChange(go)){close();notify('اطلاعات ذخیره شد.');}
 }catch(e){notify(e.message||'ورودی نامعتبر است.');}
}
function fileDownload(content,filename,mime){const a=document.createElement('a'),url=URL.createObjectURL(new Blob([content],{type:mime}));a.href=url;a.download=filename;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1200);}
function exportJson(){fileDownload(JSON.stringify(state,null,2),'okr-workspace-backup-'+today()+'.json','application/json;charset=utf-8');notify('پشتیبان JSON دانلود شد؛ در جای امن ذخیره کنید.');}
document.addEventListener('submit',e=>{if(e.target.matches('[data-form]')){e.preventDefault();processForm(e.target);}});
document.addEventListener('click',e=>{
 const t=e.target.closest('[data-action],[data-route]');if(!t)return;
 if(t.dataset.route){navigate(t.dataset.route);return;}
 const action=t.dataset.action,id=t.dataset.id||'';
 if(action==='close-dialog'){close();return;}
 const formActions=['edit-strategy','new-pillar','edit-pillar','new-objective','edit-objective','new-result','edit-result','new-kpi','edit-kpi','new-initiative','edit-initiative','new-checkin','update-kpi'];
 if(formActions.includes(action)){openForm(action,id);return;}
 if(action==='view-objective'){objectiveDetail(id);return;}
 if(action==='clone-objective'){const o=findO(id);if(!o||!confirm('نسخه پیش‌نویس جدید با شناسه تازه ایجاد شود؟ مقدار KRها به Baseline بازنشانی می‌شود.'))return;const ok=doChange(()=>{let c=JSON.parse(JSON.stringify(o));c.id=M.uid();c.name+=' (دوره جدید)';c.status='draft';c.createdAt=new Date().toISOString();c.results.forEach(x=>{x.id=M.uid();x.current=x.type==='binary'?false:x.start;});state.objectives.push(c);});if(ok){close();navigate('explore');}return;}
 if(action==='close-objective'){const o=findO(id);if(o&&confirm('هدف بسته شود؟ داده و تاریخچه حفظ خواهد شد.')){if(doChange(()=>{o.status='closed';})){close();notify('هدف بسته شد.');}}return;}
 if(action==='go-explore'){navigate('explore');return;}
 if(action==='go-map'){navigate('map');return;}
 if(action==='go-settings'){navigate('settings');return;}
 if(action==='export-json'){exportJson();return;}
 if(action==='export-csv'){fileDownload(M.csv(state),'okr-report-'+today()+'.csv','text/csv;charset=utf-8');return;}
 if(action==='import-json'){$('importFile').click();return;}
 if(action==='load-demo'){if(!confirm('نمونه تمرینی جایگزین داده فعلی این اپ شود؟ پیش از ادامه پشتیبان بگیرید.'))return;doChange(()=>{const demo=M.demo();Object.assign(state,demo,{revision:state.revision,updatedAt:state.updatedAt});});navigate('home');return;}
 if(action==='reset'){if(!confirm('تمام داده‌های OKR عمومی این دستگاه پاک شوند؟ این کار ارتباطی با OKR کیش ندارد.'))return;if(!confirm('تأیید دوم: داده‌ها فقط در صورت داشتن فایل پشتیبان قابل بازیابی‌اند.'))return;doChange(()=>{const b=M.blank();Object.assign(state,b,{revision:state.revision});});navigate('home');return;}
});
$('importFile').addEventListener('change',async e=>{
 const f=e.target.files?.[0];e.target.value='';if(!f)return;
 if(f.size>2_000_000){notify('فایل بزرگ‌تر از سقف مجاز است.');return;}
 try{const raw=JSON.parse(await f.text()),parsed=M.normalize(raw);if(!confirm('داده فایل جایگزین همه اطلاعات OKR عمومی همین دستگاه شود؟'))return;
 const savedRevision=state.revision;const earlier=state;state=parsed;state.revision=savedRevision;stack.blocked=false;stack.stale=false;
 if(!save()){state=earlier;notify('Import موفق نبود.');return;}close();render();notify('فضای کاری از فایل وارد شد.');
 }catch(err){notify('فایل JSON معتبر و مطابق Schema نسخه ۳ نیست.');}
});
$('view').addEventListener('input',e=>{if(e.target.id==='searchObjectives'){filter.q=e.target.value;let at=e.target.selectionStart;const main=$('view');main.innerHTML=views.explore();let el=$('searchObjectives');el.focus();el.setSelectionRange(at,at);}});
$('view').addEventListener('change',e=>{if(e.target.id==='statusFilter'){filter.status=e.target.value;render();}});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!$('modalLayer').hidden)close();});
window.addEventListener('hashchange',render);
render();
if(stack.blocked)notify(stack.reason);
if('serviceWorker' in navigator)window.addEventListener('load',()=>navigator.serviceWorker.register('./sw.js',{scope:'./'}).catch(()=>{}));
})();
