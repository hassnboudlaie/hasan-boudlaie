'use strict';
(function(){
const KEY='alborz-mybranch-v1';
const $=s=>document.querySelector(s);
const labels={overview:'خانه و نمای امروز',tasks:'کارها و پیگیری‌ها',people:'کارکنان شعبه',customers:'مشتریان و خدمات',agents:'شبکه نمایندگان',hq:'مکاتبات و ستاد',goals:'اهداف و عملکرد',reports:'گزارش مدیریتی',settings:'راهنما و تنظیمات'};
const titles={tasks:'کار',people:'کارمند',customers:'پرونده مشتری',agents:'نماینده',hq:'مکاتبه ستادی',goals:'شاخص عملکرد'};
const descriptions={tasks:'کارهای روزانه، هفتگی و بلندمدت؛ با مسئول مشخص و موعد پیگیری',people:'شناخت نقش‌ها، اولویت‌های توسعه و جلسات گفت‌وگوی عملکرد',customers:'پیگیری درخواست، شکایت، تمدید و تجربه مشتری از دریافت تا حل مسئله',agents:'پایش شبکه فروش، عملکرد نمایندگان و موارد نیازمند حمایت',hq:'ثبت مکاتبات، الزامات، تصمیم‌ها و پاسخ‌های مورد انتظار ستاد',goals:'پایش اهداف شعبه و عملکرد در افق ماهانه و فصلی'};
const sections=['tasks','people','customers','agents','hq','goals'];
const esc=x=>String(x==null?'':x).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const fmt=x=>Number(x||0).toLocaleString('fa-IR',{maximumFractionDigits:1});
const number=x=>Number.isFinite(Number(x))?Number(x):0;
const uid=()=>String(Date.now())+'-'+Math.random().toString(36).slice(2,8);
const isDate=x=>/^\d{4}-\d{2}-\d{2}$/.test(String(x||''));
function today(){return new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Tehran',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date())}
function addDays(n){const d=new Date(today()+'T12:00:00');d.setDate(d.getDate()+n);return [d.getFullYear(),String(d.getMonth()+1).padStart(2,'0'),String(d.getDate()).padStart(2,'0')].join('-')}
function dateFA(d){if(!isDate(d))return '—';const p=new Date(d+'T12:00:00');return Number.isNaN(p.getTime())?'—':p.toLocaleDateString('fa-IR-u-ca-persian',{year:'numeric',month:'short',day:'numeric'})}
function statusClass(v){if(['انجام شد','مختومه','پاسخ داده شد','محقق شده','مطلوب'].includes(v))return '';if(['در حال انجام','در انتظار','در جریان','نیازمند پیگیری'].includes(v))return 'warn';if(['فوری','بحرانی','معوق','نیازمند حمایت','شکایت باز'].includes(v))return 'danger';return 'gray'}
function badge(value){return '<span class="badge '+statusClass(value)+'">'+esc(value||'نامشخص')+'</span>'}
function seed(){return {version:1,branch:{name:'شعبه نمونه مرکزی',manager:'رئیس شعبه',period:'مهر ۱۴۰۵'},tasks:[
{id:'t1',title:'پیگیری پرونده‌های خسارت معوق',area:'خدمات مشتری',owner:'کارشناس خسارت',due:addDays(-1),priority:'فوری',status:'در حال انجام',horizon:'روزانه'},
{id:'t2',title:'مرور وضعیت تمدید بیمه‌نامه‌ها',area:'مشتریان',owner:'کارشناس صدور',due:addDays(0),priority:'بالا',status:'انجام نشده',horizon:'روزانه'},
{id:'t3',title:'جلسه کوتاه هماهنگی تیم',area:'کارکنان',owner:'رئیس شعبه',due:addDays(0),priority:'متوسط',status:'انجام شد',horizon:'روزانه'},
{id:'t4',title:'ارزیابی عملکرد ماهانه نمایندگان',area:'نمایندگان',owner:'مسئول شبکه فروش',due:addDays(3),priority:'بالا',status:'انجام نشده',horizon:'هفتگی'},
{id:'t5',title:'تهیه پاسخ گزارش عملکرد برای ستاد',area:'ستاد',owner:'رئیس شعبه',due:addDays(4),priority:'بالا',status:'در حال انجام',horizon:'هفتگی'},
{id:'t6',title:'برنامه توسعه تجربه مشتری در فصل آینده',area:'برنامه راهبردی',owner:'رئیس شعبه',due:addDays(25),priority:'متوسط',status:'انجام نشده',horizon:'فصلی'}
],people:[
{id:'p1',name:'کارمند نمونه ۱',role:'کارشناس صدور',objective:'کاهش خطا و افزایش سرعت صدور',checkin:addDays(5),status:'مطلوب'},
{id:'p2',name:'کارمند نمونه ۲',role:'کارشناس خسارت',objective:'کاهش پرونده‌های معوق',checkin:addDays(2),status:'نیازمند حمایت'},
{id:'p3',name:'کارمند نمونه ۳',role:'کارشناس فروش',objective:'بهبود تمدید و حفظ مشتری',checkin:addDays(7),status:'در حال انجام'},
{id:'p4',name:'کارمند نمونه ۴',role:'کارشناس وصول',objective:'بهبود وصول مطالبات',checkin:addDays(12),status:'مطلوب'}
],customers:[
{id:'c1',name:'مشتری نمونه ۱',topic:'شکایت درباره زمان پاسخ‌گویی',channel:'مراجعه حضوری',owner:'کارشناس خسارت',due:addDays(-1),status:'شکایت باز'},
{id:'c2',name:'مشتری نمونه ۲',topic:'تمدید بیمه‌نامه سررسیدشده',channel:'تلفن',owner:'کارشناس صدور',due:addDays(1),status:'در جریان'},
{id:'c3',name:'مشتری نمونه ۳',topic:'پیگیری صدور الحاقیه',channel:'حضوری',owner:'کارشناس صدور',due:addDays(2),status:'در انتظار'},
{id:'c4',name:'مشتری نمونه ۴',topic:'درخواست راهنمایی بیمه مسئولیت',channel:'نماینده',owner:'کارشناس فروش',due:addDays(4),status:'مختومه'}
],agents:[
{id:'a1',name:'نماینده نمونه الف',territory:'حوزه شمال',target:420,actual:360,renewals:82,status:'در حال انجام'},
{id:'a2',name:'نماینده نمونه ب',territory:'حوزه مرکز',target:340,actual:355,renewals:91,status:'مطلوب'},
{id:'a3',name:'نماینده نمونه ج',territory:'حوزه جنوب',target:380,actual:270,renewals:74,status:'نیازمند حمایت'}
],hq:[
{id:'h1',title:'ارسال گزارش ماهانه فروش و پرتفوی',unit:'مدیریت منطقه',ref:'نامه نمونه ۱۴۰۵/۰۱',due:addDays(2),priority:'بالا',status:'در حال انجام'},
{id:'h2',title:'پاسخ به درخواست واحد منابع انسانی',unit:'منابع انسانی ستاد',ref:'نامه نمونه ۱۴۰۵/۰۲',due:addDays(5),priority:'متوسط',status:'در انتظار'},
{id:'h3',title:'ابلاغ و مرور بخشنامه جدید',unit:'مدیریت فنی',ref:'بخشنامه نمونه ۱۴۰۵/۰۳',due:addDays(9),priority:'متوسط',status:'پاسخ داده شد'}
],goals:[
{id:'g1',title:'نرخ تمدید بیمه‌نامه‌ها',owner:'واحد فروش',unit:'درصد',target:85,actual:79,horizon:'ماهانه',notes:'شاخص نمایشی و قابل تغییر'},
{id:'g2',title:'رضایت مشتریان',owner:'خدمات مشتری',unit:'از ۱۰۰',target:90,actual:82,horizon:'ماهانه',notes:'داده نمونه، نه نتیجه نظرسنجی واقعی'},
{id:'g3',title:'نسبت وصول مطالبات',owner:'واحد وصول',unit:'درصد',target:90,actual:87,horizon:'فصلی',notes:'شاخص نمونه'},
{id:'g4',title:'پرونده‌های مختومه در موعد هدف',owner:'واحد خسارت',unit:'درصد',target:95,actual:91,horizon:'ماهانه',notes:'شاخص نمونه'}
]}}
let data;
try{const raw=localStorage.getItem(KEY);data=raw?JSON.parse(raw):seed();if(!valid(data))throw Error('invalid')}catch(e){data=seed()}
let query='',condition='همه',horizon='همه',current='overview',editType='',editId='',toastTimer;
function valid(d){return !!d&&d.version===1&&d.branch&&typeof d.branch.name==='string'&&typeof d.branch.manager==='string'&&typeof d.branch.period==='string'&&sections.every(k=>Array.isArray(d[k])&&d[k].length<3000&&d[k].every(r=>r&&typeof r.id==='string'&&r.id.length<100)&&new Set(d[k].map(r=>r.id)).size===d[k].length)}
function save(message){try{localStorage.setItem(KEY,JSON.stringify(data));if(message)toast(message)}catch(e){toast('ذخیره در مرورگر ممکن نشد؛ فایل پشتیبان بگیرید.')}render()}
function toast(message){$('#toast').textContent=message;$('#toast').hidden=false;clearTimeout(toastTimer);toastTimer=setTimeout(()=>{$('#toast').hidden=true},3500)}
function title(type){return titles[type]||'رکورد'}
function button(label,attrs,cls){return '<button type="button" class="button '+(cls||'')+'" '+attrs+'>'+label+'</button>'}
function top(name,sub,actions){return '<div class="view-top"><div><div class="overline">ALBORZ / MY BRANCH</div><h1>'+esc(name)+'</h1><p>'+esc(sub||'')+'</p></div><div class="top-actions">'+(actions||'')+'</div></div>'}
function panel(name,inner,action){return '<section class="panel"><div class="panel-head"><h2>'+esc(name)+'</h2>'+(action||'')+'</div>'+inner+'</section>'}
function stat(label,value,extra,icon,cl){return '<div class="kpi '+(cl||'')+'"><div class="kpi-head"><span>'+esc(label)+'</span><span class="kpi-symbol">'+icon+'</span></div><b>'+fmt(value)+'</b><small>'+esc(extra||'')+'</small></div>'}
function isOpen(st){return !['انجام شد','مختومه','پاسخ داده شد'].includes(st)}
function dueLate(x){return isDate(x.due)&&x.due<today()&&isOpen(x.status)}
function percent(g){return number(g.target)>0?Math.min(120,Math.max(0,100*number(g.actual)/number(g.target))):0}
function total(){return {pending:data.tasks.filter(x=>isOpen(x.status)).length,overdue:data.tasks.filter(dueLate).length,clients:data.customers.filter(x=>isOpen(x.status)).length,letters:data.hq.filter(x=>isOpen(x.status)).length,agents:data.agents.length,people:data.people.length,avg:data.goals.length?data.goals.reduce((s,x)=>s+Math.min(100,percent(x)),0)/data.goals.length:0}}
function overview(){
const s=total();
const urgent=[...data.tasks.filter(x=>isOpen(x.status)).map(x=>({title:x.title,due:x.due,area:'کار / '+x.area,view:'tasks',priority:x.priority})),...data.customers.filter(x=>isOpen(x.status)).map(x=>({title:x.topic,due:x.due,area:'مشتری / '+x.owner,view:'customers',priority:'متوسط'})),...data.hq.filter(x=>isOpen(x.status)).map(x=>({title:x.title,due:x.due,area:'ستاد / '+x.unit,view:'hq',priority:x.priority}))].sort((a,b)=>String(a.due).localeCompare(String(b.due))).slice(0,6);
const agenda=urgent.length?'<div class="item-list">'+urgent.map(x=>'<div class="item"><div class="item-main"><strong>'+esc(x.title)+'</strong><p>'+esc(x.area)+' · موعد: '+dateFA(x.due)+'</p></div><div class="item-actions">'+(x.due<today()?badge('معوق'):badge(x.priority))+'<a class="button mini" href="#'+x.view+'">مشاهده ←</a></div></div>').join('')+'</div>':'<div class="empty">فعلاً مورد بازی برای پیگیری وجود ندارد.</div>';
const links=[['tasks','مدیریت کارها','واگذاری، پیگیری و تقویم اقدامات'],['people','کارکنان','برنامه توسعه و جلسات عملکرد'],['customers','مشتریان','درخواست‌ها، تمدیدها و شکایت‌ها'],['agents','نمایندگان','هدف فروش و وضعیت شبکه'],['hq','امور ستاد','ابلاغ‌ها و مکاتبات معوق'],['goals','عملکرد شعبه','شاخص‌ها و تحقق اهداف']];
const shortcuts='<div class="quick-links">'+links.map(x=>'<a class="quick-link" href="#'+x[0]+'"><b>'+esc(x[1])+'</b><span>'+esc(x[2])+'</span><span class="arrow">←</span></a>').join('')+'</div>';
const chart=data.goals.map(x=>bar(x.title,percent(x))).join('')||'<div class="empty">هنوز شاخصی ثبت نشده است.</div>';
return top('سلام، خوش آمدید به شعبه من','یک نگاه مدیریتی به اولویت‌ها، تعهدات و عملکرد شعبه',button('+ ثبت کار جدید','data-add="tasks"','primary'))+
'<div class="hero"><div><div class="hero-motto">YOUR BRANCH. CLEAR PRIORITIES.</div><h2>امروز، چه چیزی به توجه شما نیاز دارد؟</h2><p>کارهای معوق، درخواست‌های مشتری، پیگیری با نمایندگان و مکاتبات ستاد را از همین صفحه مدیریت کنید. هر اقدام یک مسئول و موعد مشخص داشته باشد.</p><a class="button" href="#tasks">رفتن به فهرست اقدامات ←</a></div><div class="hero-side"><strong>'+fmt(s.pending+s.clients+s.letters)+'</strong><span>موضوع باز برای مدیریت و پیگیری</span></div></div>'+
'<div class="notice caution"><strong>نسخه نمایشی:</strong> همه نام‌ها و اعداد پیش‌فرض فرضی‌اند. داده‌ها فقط روی همین مرورگر ذخیره می‌شوند؛ برای اطلاعات حساس مشتریان یا کارکنان مناسب استفاده عملیاتی نیست.</div>'+
'<div class="kpis">'+stat('کارهای باز',s.pending,'در انتظار تکمیل','☑')+stat('کارهای معوق',s.overdue,'فراتر از تاریخ سررسید','!','warn')+stat('درخواست مشتری باز',s.clients,'نیازمند پیگیری یا پاسخ','♡')+stat('مکاتبات ستاد باز',s.letters,'تعهدات و پاسخ‌های باقی‌مانده','⇄')+'</div>'+
'<div class="two-columns"><div>'+panel('اولویت‌های نزدیک و معوق',agenda,'<a class="button mini" href="#tasks">همه کارها ←</a>')+panel('مسیرهای سریع مدیریت',shortcuts)+'</div><div>'+
panel('وضعیت اهداف شعبه',chart,'<a class="button mini" href="#goals">جزئیات ←</a>')+
panel('تصویر تیم و نمایندگان','<div class="section-cards" style="grid-template-columns:1fr 1fr"><div class="simple-card"><span class="value">'+fmt(s.people)+'</span><b>همکار</b><p>در فهرست کارکنان</p></div><div class="simple-card"><span class="value">'+fmt(s.agents)+'</span><b>نماینده</b><p>در شبکه فروش</p></div></div><p class="small-foot">میانگین تحقق شاخص‌ها: '+fmt(s.avg)+'٪ · محاسبه ساده برای نمایش و پایش، نه امتیاز رسمی شرکت</p>')+
panel('ابزارهای مکمل','<div class="item-list"><div class="item"><div class="item-main"><strong>هم‌مسیر · مدیریت عملکرد کارکنان</strong><p>اهداف فردی، گفت‌وگوی عملکرد و بازخورد مشتری از طریق QR</p></div><a class="button mini" href="../">ورود ↗</a></div><div class="item"><div class="item-main"><strong>آکادمی ارتباطات اثربخش بیمه البرز</strong><p>محتوای آموزشی رؤسای شعب و مهارت‌های ارتباطی</p></div><a class="button mini" href="https://hassnboudlaie.github.io/alborz-communication-academy/" target="_blank" rel="noopener">ورود ↗</a></div></div>')+'</div></div>';
}
function bar(name,val){let width=Math.min(100,Math.max(0,Number(val)||0));return '<div class="chart-row"><span class="chart-label">'+esc(name)+'</span><div class="chart-bar" role="img" aria-label="'+esc(name)+'؛ '+fmt(val)+' درصد"><span style="width:'+width+'%"></span></div><span class="chart-value">'+fmt(val)+'%</span></div>'}
const schema={
tasks:[['title','عنوان کار','text',true],['area','حوزه فعالیت','select',true,['امور جاری','کارکنان','مشتریان','خدمات مشتری','نمایندگان','ستاد','برنامه راهبردی','سایر']],['owner','مسئول پیگیری','text',true],['due','موعد انجام','date',true],['priority','اولویت','select',true,['فوری','بالا','متوسط','پایین']],['status','وضعیت','select',true,['انجام نشده','در حال انجام','در انتظار','انجام شد']],['horizon','افق زمانی','select',true,['روزانه','هفتگی','ماهانه','فصلی']]],
people:[['name','نام یا کد همکار','text',true],['role','سمت','text',true],['objective','اولویت توسعه / هدف','textarea',false],['checkin','موعد گفت‌وگوی عملکرد','date',false],['status','وضعیت','select',true,['مطلوب','در حال انجام','نیازمند حمایت']]],
customers:[['name','نام یا کد پیگیری مشتری','text',true],['topic','درخواست / موضوع','textarea',true],['channel','کانال دریافت','select',true,['حضوری','تلفن','نماینده','وب‌سایت','سایر']],['owner','مسئول پاسخ','text',true],['due','موعد پاسخ','date',true],['status','وضعیت','select',true,['در جریان','در انتظار','شکایت باز','مختومه']]],
agents:[['name','نام یا کد نماینده','text',true],['territory','محدوده / حوزه فعالیت','text',false],['target','هدف فروش (واحد توافق‌شده)','number',true],['actual','عملکرد در همان واحد','number',true],['renewals','نرخ تمدید (درصد)','number',false],['status','وضعیت همکاری','select',true,['مطلوب','در حال انجام','نیازمند حمایت']]],
hq:[['title','موضوع مکاتبه / ابلاغ','textarea',true],['unit','واحد ستادی مرتبط','text',true],['ref','شماره پیگیری / ارجاع','text',false],['due','مهلت پاسخ','date',true],['priority','اولویت','select',true,['فوری','بالا','متوسط','پایین']],['status','وضعیت','select',true,['در انتظار','در حال انجام','پاسخ داده شد']]],
goals:[['title','عنوان شاخص','text',true],['owner','واحد مسئول','text',true],['unit','واحد سنجش','text',true],['target','هدف','number',true],['actual','مقدار محقق‌شده','number',true],['horizon','دوره','select',true,['ماهانه','فصلی','سالانه']],['notes','منبع داده یا توضیح','textarea',false]]
};
function makeField(field,value){const [key,label,type,req,opts]=field;const attrs=' name="'+esc(key)+'" id="field-'+esc(key)+'" '+(req?'required ':'')+(type==='number'?'min="0" step="any" ':'')+(type==='text'?'maxlength="180" ':'');let el='';
if(type==='select')el='<select '+attrs+'>'+opts.map(o=>'<option value="'+esc(o)+'" '+(String(value)===o?'selected':'')+'>'+esc(o)+'</option>').join('')+'</select>';
else if(type==='textarea')el='<textarea '+attrs+' maxlength="500" rows="3">'+esc(value)+'</textarea>';
else el='<input type="'+type+'" '+attrs+' value="'+esc(value)+'">';
return '<label class="'+(type==='textarea'?'field-wide':'')+'" for="field-'+esc(key)+'">'+esc(label)+(req?' *':'')+el+'</label>'}
function openEditor(type,id){if(!schema[type])return;editType=type;editId=id||'';const item=id?data[type].find(x=>x.id===id):null;
$('#dialogTitle').textContent=(id?'ویرایش ':'افزودن ')+title(type);
$('#formFields').innerHTML=schema[type].map(f=>makeField(f,item?item[f[0]]:f[2]==='date'?today():f[2]==='number'?0:'')).join('');
$('#editorDialog').showModal()}
function actionButtons(type,id,extra){return '<div class="item-actions">'+(extra||'')+button('ویرایش','data-edit="'+type+'" data-id="'+esc(id)+'"','mini')+button('حذف','data-delete="'+type+'" data-id="'+esc(id)+'"','mini danger')+'</div>'}
function rowActions(type,id){return actionButtons(type,id,type==='tasks'?button('✓','data-done="'+esc(id)+'" aria-label="تغییر وضعیت انجام کار"','mini'):'')}
function cell(html){return '<td>'+html+'</td>'}
function tableOf(headers,rows){return '<div class="table-wrap"><table><thead><tr>'+headers.map(x=>'<th scope="col">'+esc(x)+'</th>').join('')+'</tr></thead><tbody>'+rows.join('')+'</tbody></table></div>'}
function rowsFor(type,records){
return records.map(x=>{
let cells=[];
if(type==='tasks')cells=[cell('<div class="td-title">'+esc(x.title)+'</div><div class="td-sub">'+esc(x.horizon)+'</div>'),cell(esc(x.area)),cell(esc(x.owner)),cell(dateFA(x.due)+(dueLate(x)?' '+badge('معوق'):'')),cell(badge(x.priority)),cell(badge(x.status))];
if(type==='people')cells=[cell('<div class="td-title">'+esc(x.name)+'</div><div class="td-sub">'+esc(x.role)+'</div>'),cell(esc(x.objective)),cell(dateFA(x.checkin)),cell(badge(x.status))];
if(type==='customers')cells=[cell('<div class="td-title">'+esc(x.name)+'</div><div class="td-sub">'+esc(x.channel)+'</div>'),cell(esc(x.topic)),cell(esc(x.owner)),cell(dateFA(x.due)),cell(badge(x.status))];
if(type==='agents')cells=[cell('<div class="td-title">'+esc(x.name)+'</div><div class="td-sub">'+esc(x.territory)+'</div>'),cell(fmt(x.actual)+' / '+fmt(x.target)),cell('<div class="progress-line"><div class="progress-track"><span style="width:'+Math.min(100,100*number(x.actual)/Math.max(1,number(x.target)))+'%"></span></div><b>'+fmt(100*number(x.actual)/Math.max(1,number(x.target)))+'٪</b></div>'),cell(fmt(x.renewals)+'٪'),cell(badge(x.status))];
if(type==='hq')cells=[cell('<div class="td-title">'+esc(x.title)+'</div><div class="td-sub">'+esc(x.ref)+'</div>'),cell(esc(x.unit)),cell(dateFA(x.due)+(dueLate(x)?' '+badge('معوق'):'')),cell(badge(x.priority)),cell(badge(x.status))];
if(type==='goals')cells=[cell('<div class="td-title">'+esc(x.title)+'</div><div class="td-sub">'+esc(x.owner)+'</div>'),cell(fmt(x.actual)+' '+esc(x.unit)),cell(fmt(x.target)+' '+esc(x.unit)),cell('<div class="progress-line"><div class="progress-track"><span style="width:'+Math.min(100,percent(x))+'%"></span></div><b>'+fmt(percent(x))+'٪</b></div>'),cell(esc(x.horizon))];
return '<tr>'+cells.join('')+cell(rowActions(type,x.id))+'</tr>'
})}
const columnNames={tasks:['کار و افق','حوزه','مسئول','موعد','اولویت','وضعیت','اقدامات'],people:['همکار و سمت','هدف توسعه','گفت‌وگوی بعدی','وضعیت','اقدامات'],customers:['مشتری / کانال','موضوع درخواست','مسئول','مهلت پاسخ','وضعیت','اقدامات'],agents:['نماینده / حوزه','فروش / هدف','تحقق هدف','تمدید','وضعیت','اقدامات'],hq:['عنوان / ارجاع','واحد مرتبط','مهلت','اولویت','وضعیت','اقدامات'],goals:['شاخص / مسئول','مقدار واقعی','هدف','درصد تحقق','دوره','اقدامات']};
function filtered(type){let records=data[type].filter(x=>!query||Object.values(x).some(v=>String(v).toLocaleLowerCase('fa').includes(query.toLocaleLowerCase('fa'))));if(condition!=='همه')records=records.filter(x=>x.status===condition);if(type==='tasks'&&horizon!=='همه')records=records.filter(x=>x.horizon===horizon);return records}
function listView(type){
const statuses=[...new Set(data[type].map(x=>x.status).filter(Boolean))];
let filters='<input id="search" type="search" placeholder="جست‌وجو در فهرست..." aria-label="جست‌وجو" value="'+esc(query)+'">'+(type!=='goals'?'<select id="filterStatus" aria-label="فیلتر وضعیت"><option value="همه">همه وضعیت‌ها</option>'+statuses.map(x=>'<option '+(condition===x?'selected':'')+'>'+esc(x)+'</option>').join('')+'</select>':'');
if(type==='tasks')filters+='<select id="filterHorizon" aria-label="فیلتر افق زمانی">'+['همه','روزانه','هفتگی','ماهانه','فصلی'].map(x=>'<option value="'+esc(x)+'" '+(horizon===x?'selected':'')+'>'+esc(x==='همه'?'تمام بازه‌ها':x)+'</option>').join('')+'</select>';
let rows=rowsFor(type,filtered(type));
let extra='';
if(type==='people')extra='<div class="notice"><b>ارتباط با هم‌مسیر:</b> جزئیات ارزیابی کارکنان، هدف‌گذاری فردی و فرم بازخورد مشتریان با QR در <a href="../" style="text-decoration:underline;color:var(--navy)">سامانه مدیریت عملکرد کارکنان ↗</a> قرار دارد. این صفحه برای مدیریت کلی تیم و پیگیری جلسات است.</div>';
if(type==='agents')extra='<div class="notice">واحد هدف و عملکرد فروش باید یکسان باشد (مثلاً میلیون ریال). درصد تحقق به‌شکل خودکار محاسبه می‌شود.</div>';
if(type==='goals')extra='<div class="notice">درصد تحقق برای شاخص‌های «بیشتر بهتر است» محاسبه می‌شود. برای شاخص‌های کاهشی، مانند زمان انتظار، لازم است فرمول اختصاصی در نسخه عملیاتی اضافه شود.</div>';
return top(labels[type],descriptions[type],button('+ افزودن '+title(type),'data-add="'+type+'"','primary'))+extra+
'<section class="panel"><div class="panel-head"><h2>فهرست '+esc(labels[type])+'</h2><span class="count-note">تعداد کل: '+fmt(data[type].length)+'</span></div>'+
'<div class="toolbar">'+filters+'<span class="count">'+fmt(rows.length)+' مورد نمایش داده می‌شود</span></div>'+
(rows.length?tableOf(columnNames[type],rows):'<div class="empty">موردی با این معیارها پیدا نشد. می‌توانید مورد جدید اضافه کنید یا فیلتر را تغییر دهید.</div>')+
'<p class="small-foot">تمام تغییرات در مرورگر فعلی ذخیره می‌شوند و بین کاربران یا دستگاه‌ها همگام‌سازی ندارند.</p></section>';
}
function reports(){
const s=total();
const outstanding=data.tasks.filter(x=>isOpen(x.status)).sort((a,b)=>String(a.due).localeCompare(String(b.due)));
const rows=outstanding.slice(0,12).map(x=>'<tr>'+cell(esc(x.title))+cell(esc(x.owner))+cell(dateFA(x.due))+cell(badge(x.status))+'</tr>');
const chart=data.goals.map(x=>bar(x.title,percent(x))).join('')||'<div class="empty">شاخصی وجود ندارد.</div>';
return top('گزارش مدیریتی شعبه','خلاصه تصمیم‌محور برای مرور هفتگی، جلسه تیم و گزارش به ستاد',button('چاپ / PDF','data-print','')+button('دریافت Excel / CSV','data-csv','primary'))+
'<div class="notice">گزارش از داده‌های همین مرورگر ساخته می‌شود. نام‌ها و اعداد پیش‌فرض فرضی‌اند؛ هیچ داده‌ای از سامانه‌های رسمی بیمه البرز دریافت نشده است.</div>'+
'<div class="kpis">'+stat('اقدام باز',s.pending,'در دست پیگیری','☑')+stat('مورد معوق',s.overdue,'نیازمند تصمیم','!','warn')+stat('پرونده مشتری باز',s.clients,'در انتظار پاسخ','♡')+stat('میانگین تحقق شاخص‌ها',Math.round(s.avg),'درصد، بدون وزن‌دهی','◎','good')+'</div>'+
panel('جمع‌بندی مدیریتی','<div class="report-summary">در شعبه «'+esc(data.branch.name)+'» در دوره «'+esc(data.branch.period)+'»، '+fmt(s.pending)+' اقدام باز و '+fmt(s.overdue)+' اقدام معوق ثبت شده است. '+fmt(s.clients)+' پرونده مشتری و '+fmt(s.letters)+' مکاتبه ستادی هنوز باز هستند. پیشنهاد می‌شود موارد معوق، مشتریان ناراضی و تعهدات ستادی در اولویت جلسه بعدی قرار گیرند.</div>')+
'<div class="two-columns"><div>'+panel('فهرست اقدامات باز',rows.length?tableOf(['عنوان','مسئول','موعد','وضعیت'],rows):'<div class="empty">اقدام بازی وجود ندارد.</div>')+
panel('مشتریان نیازمند پیگیری','<div class="item-list">'+(data.customers.filter(x=>isOpen(x.status)).map(x=>'<div class="item"><div class="item-main"><strong>'+esc(x.topic)+'</strong><p>'+esc(x.name)+' · مسئول: '+esc(x.owner)+' · موعد '+dateFA(x.due)+'</p></div>'+badge(x.status)+'</div>').join('')||'<div class="empty">مورد بازی وجود ندارد.</div>')+'</div>')+'</div><div>'+
panel('تحقق اهداف',chart)+panel('نمایندگان نیازمند حمایت','<div class="item-list">'+(data.agents.filter(x=>x.status==='نیازمند حمایت').map(x=>'<div class="item"><div class="item-main"><strong>'+esc(x.name)+'</strong><p>تحقق هدف '+fmt(100*number(x.actual)/Math.max(1,number(x.target)))+'٪</p></div>'+badge(x.status)+'</div>').join('')||'<div class="empty">در اطلاعات ثبت‌شده، نماینده‌ای با این وضعیت وجود ندارد.</div>')+'</div>')+
panel('تعهدات باز نسبت به ستاد','<div class="item-list">'+(data.hq.filter(x=>isOpen(x.status)).map(x=>'<div class="item"><div class="item-main"><strong>'+esc(x.title)+'</strong><p>'+esc(x.unit)+' · '+dateFA(x.due)+'</p></div>'+badge(x.status)+'</div>').join('')||'<div class="empty">مکاتبه بازی ثبت نشده است.</div>')+'</div>')+'</div></div>';
}
function settings(){
return top('راهنما و تنظیمات','آشنایی با دامنه ابزار و مدیریت اطلاعات نسخه نمایشی')+
'<div class="two-columns"><div>'+
panel('مشخصات شعبه','<form id="branchForm" class="form-fields"><label>عنوان شعبه<input name="name" maxlength="100" required value="'+esc(data.branch.name)+'"></label><label>عنوان مدیر / مسئول<input name="manager" maxlength="100" required value="'+esc(data.branch.manager)+'"></label><label class="field-wide">دوره گزارش<input name="period" maxlength="100" required value="'+esc(data.branch.period)+'"></label><div class="field-wide"><button class="button primary" type="submit">ذخیره اطلاعات شعبه</button></div></form>')+
panel('اطلاعات و پشتیبان','<p class="panel-title-sub">از اطلاعات فعلی یک فایل پشتیبان بگیرید یا نسخه ذخیره‌شده را دوباره وارد کنید.</p><div class="button-wrap">'+button('دریافت پشتیبان JSON','data-backup','')+button('بازیابی از فایل','data-import','')+button('بازنشانی به نمونه','data-reset','danger')+'</div><p class="small-foot">بازنشانی، همه تغییرات این ابزار را در مرورگر جاری جایگزین داده‌های نمونه می‌کند. پشتیبان پیش از بازنشانی توصیه می‌شود.</p>')+
'</div><div>'+
panel('راهنمای استفاده','<details open><summary>۱. از کجا شروع کنم؟</summary><p>اول نام شعبه و دوره را در همین صفحه مشخص کنید. سپس در «کارها» مسئول، موعد و اولویت بگذارید؛ در «مشتریان» موضوع و زمان پاسخ ثبت کنید؛ و در «اهداف» وضعیت شاخص‌های منتخب را به‌روزرسانی کنید.</p></details><details><summary>۲. چه تفاوتی با هم‌مسیر دارد؟</summary><p>«شعبه من» برای هماهنگی عملیات کل شعبه است. «هم‌مسیر» برای مدیریت عملکرد فردی کارکنان، گفت‌وگوی توسعه و بازخورد مشتریان طراحی شده است.</p></details><details><summary>۳. داده‌ها کجا ذخیره می‌شوند؟</summary><p>فقط در Local Storage همین مرورگر. ورود با حساب سازمانی، سطح دسترسی، پشتیبان‌گیری سروری، همگام‌سازی و اتصال به بیمه البرز در این نسخه وجود ندارد.</p></details><details><summary>۴. آیا می‌توانم اطلاعات واقعی وارد کنم؟</summary><p>تا پیش از استقرار Backend امن، Authentication، دسترسی مبتنی بر نقش، Encryption، سیاست نگهداری داده و مصوبه واحد فناوری اطلاعات شرکت، اطلاعات شخصی و محرمانه کارکنان و مشتریان را در این وب‌سایت عمومی وارد نکنید. برای آزمایش از داده فرضی و کدهای غیرقابل‌شناسایی استفاده کنید.</p></details><details><summary>۵. گزارش‌گیری چگونه انجام می‌شود؟</summary><p>در بخش گزارش مدیریتی، می‌توانید گزارش مرورگر را چاپ یا PDF کنید و داده‌های بخش‌ها را به CSV خروجی بگیرید. توجه کنید برای فایل CSV لازم است در Excel گزینه UTF-8 انتخاب شود.</p></details>')+
panel('الهام از نمونه‌های بین‌المللی','<p class="panel-title-sub">الگوی dashboard شعبه و tracking تعاملات از Salesforce Financial Services Cloud، و الگوی فهرست فعالیت‌ها، تمدیدها، روابط مشتری و گزارش مدیریتی از Vertafore AMS360 الهام گرفته شده است. این پیاده‌سازی مستقل است و با محصولات فوق ارتباط فنی ندارد.</p><div class="button-wrap"><a class="button mini" target="_blank" rel="noopener" href="https://trailhead.salesforce.com/content/learn/modules/branch-management-in-financial-services-cloud/get-started-with-branch-management">Salesforce ↗</a><a class="button mini" target="_blank" rel="noopener" href="https://www.vertafore.com/products/agency-management-software/ams360">AMS360 ↗</a></div>')+'</div></div>';
}
function render(){current=(location.hash.slice(1)||'overview');if(!(current in labels))current='overview';document.title=labels[current]+' | شعبه من · بیمه البرز';$('#branchLabel').textContent=data.branch.name;$('#branchOwner').textContent=data.branch.manager+' · بیمه البرز';document.querySelectorAll('[data-view]').forEach(a=>{a.classList.toggle('active',a.dataset.view===current);if(a.dataset.view===current)a.setAttribute('aria-current','page');else a.removeAttribute('aria-current')});$('#mobileNav').value=current;
$('#workspace').innerHTML=current==='overview'?overview():current==='reports'?reports():current==='settings'?settings():listView(current)}
function changeView(){query='';condition='همه';horizon='همه';render();window.scrollTo({top:0,behavior:'instant'})}
function download(filename,text,type){const blob=new Blob([text],{type:type||'text/plain;charset=utf-8'});const a=document.createElement('a');const url=URL.createObjectURL(blob);a.href=url;a.download=filename;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1500)}
function csvCell(x){let v=String(x==null?'':x);if(/^[\s]*[=+\-@]/.test(v))v="'"+v;return '"'+v.replace(/"/g,'""')+'"'}
function exportCSV(){let rows=[['بخش','شناسه','عنوان/نام','وضعیت','مسئول/واحد','موعد/دوره','هدف','عملکرد']];sections.forEach(k=>data[k].forEach(x=>{rows.push([labels[k],x.id,x.title||x.name,x.status||'',x.owner||x.unit||x.role||'',x.due||x.horizon||x.checkin||'',x.target??'',x.actual??''])}));download('my-branch-alborz-'+today()+'.csv','\uFEFF'+rows.map(r=>r.map(csvCell).join(',')).join('\r\n'),'text/csv;charset=utf-8')}
document.addEventListener('click',function(e){
const b=e.target.closest('button');if(!b)return;
if(b.dataset.add){openEditor(b.dataset.add,'');return}
if(b.dataset.edit){openEditor(b.dataset.edit,b.dataset.id);return}
if(b.dataset.close!==undefined){$('#editorDialog').close();return}
if(b.dataset.delete){const type=b.dataset.delete;const id=b.dataset.id;if(confirm('این مورد حذف شود؟')){data[type]=data[type].filter(x=>x.id!==id);save('مورد حذف شد.')}return}
if(b.dataset.done){const x=data.tasks.find(t=>t.id===b.dataset.done);if(x){x.status=x.status==='انجام شد'?'انجام نشده':'انجام شد';save('وضعیت کار به‌روزرسانی شد.')}return}
if(b.hasAttribute('data-print')){window.print();return}
if(b.hasAttribute('data-csv')){exportCSV();return}
if(b.hasAttribute('data-backup')){download('my-branch-backup-'+today()+'.json',JSON.stringify(data,null,2),'application/json');return}
if(b.hasAttribute('data-import')){$('#importFile').click();return}
if(b.hasAttribute('data-reset')){if(confirm('اطلاعات محلی فعلی با داده‌های نمونه جایگزین شوند؟ ابتدا یک فایل پشتیبان بگیرید.')){data=seed();save('داده‌های نمونه بارگذاری شدند.')}return}
});
$('#editorForm').addEventListener('submit',function(e){e.preventDefault();const values=Object.fromEntries(new FormData(this).entries());for(const f of schema[editType]){if(f[2]==='number'){const n=Number(values[f[0]]);if(!Number.isFinite(n)||n<0){toast('مقادیر عددی باید صفر یا بزرگ‌تر باشند.');return}values[f[0]]=n}}
if(editId){const idx=data[editType].findIndex(x=>x.id===editId);if(idx>=0)data[editType][idx]={id:editId,...values}}else data[editType].unshift({id:uid(),...values});$('#editorDialog').close();save('اطلاعات با موفقیت ثبت شد.')});
document.addEventListener('submit',function(e){if(e.target.id!=='branchForm')return;e.preventDefault();const x=Object.fromEntries(new FormData(e.target).entries());if(x.name.trim()&&x.manager.trim()&&x.period.trim()){data.branch={name:x.name.trim(),manager:x.manager.trim(),period:x.period.trim()};save('مشخصات شعبه به‌روزرسانی شد.')}});
document.addEventListener('input',function(e){if(e.target.id==='search'){query=e.target.value;const cursor=e.target.selectionStart;render();const inp=$('#search');inp.focus();inp.setSelectionRange(cursor,cursor)}});
document.addEventListener('change',function(e){if(e.target.id==='filterStatus'){condition=e.target.value;render()}if(e.target.id==='filterHorizon'){horizon=e.target.value;render()}if(e.target.id==='mobileNav'){location.hash=e.target.value}});
$('#importFile').addEventListener('change',async function(){if(!this.files.length)return;try{const text=await this.files[0].text();if(text.length>2000000)throw Error('large');const parsed=JSON.parse(text);if(!valid(parsed))throw Error('invalid');if(confirm('اطلاعات موجود جایگزین نسخه پشتیبان شوند؟')){data=parsed;save('بازیابی اطلاعات انجام شد.')}}catch(e){toast('فایل پشتیبان معتبر نیست.')}this.value=''});
$('#editorDialog').addEventListener('click',function(e){if(e.target===this)this.close()});
$('#mobileNav').innerHTML=Object.keys(labels).map(k=>'<option value="'+k+'">'+labels[k]+'</option>').join('');
window.addEventListener('hashchange',changeView);
render();
})();