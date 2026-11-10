/* Dedicated toy business plan wizard; data remains on this device until deliberately exported. */
(()=>{'use strict';
const spec=window.ToyPlanSpec;if(!spec?.stages||!Array.isArray(spec.stages))return;
const KEY='hb-toy-business-plan-v1',PERSIAN=new Intl.NumberFormat('fa-IR',{maximumFractionDigits:1});
const $=id=>document.getElementById(id);
const escape=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const money=x=>Number.isFinite(x)?PERSIAN.format(x):'—';
const profiles=Object.fromEntries(spec.profile.map(a=>[a[0],a[2]||'']));
const fresh=()=>({version:1,project:'toys-iran',profile:{...profiles},answers:{},evidence:{},risks:{},finance:{},canvas:{},updatedAt:''});
let state=fresh();try{const s=JSON.parse(localStorage.getItem(KEY)||'null');if(s?.project==='toys-iran'&&s.version===1){state={...fresh(),...s,profile:{...profiles,...s.profile}};}}catch(e){}
for(const k of ['answers','evidence','risks','finance','canvas'])if(!state[k]||typeof state[k]!=='object')state[k]={};
let current=0;
const steps=[{id:'profile',title:'شروع و مشخصات',desc:'پاسخ‌های اولیه محمدحسین؛ قابل ویرایش'},...spec.stages.map(s=>({id:s.id,title:s.title,desc:s.desc})),{id:'financial',title:'محاسبات مالی پایلوت',desc:'هزینه تمام‌شده، حاشیه سود و نقدینگی'},{id:'canvas',title:'بوم ۹ بخشی کسب‌وکار',desc:'نمای یکپارچه با امکان ویرایش'},{id:'export',title:'گزارش و خروجی',desc:'فایل کامل، نسخه پشتیبان و چاپ'}];
function save(){state.updatedAt=new Date().toISOString();try{localStorage.setItem(KEY,JSON.stringify(state));$('saved').textContent='ذخیره‌شده روی این دستگاه';}catch(e){$('saved').textContent='ذخیره ممکن نشد؛ خروجی بگیرید';}progress();}
function totalAnswered(){let c=0,total=0;for(const s of spec.stages)for(let i=0;i<s.qs.length;i++){total++;const a=state.answers[s.id+'_'+i];if(a&&((a.options||[]).length||(a.note||'').trim()))c++;}return [c,total];}
function progress(){const [c,t]=totalAnswered();$('answerCount').textContent=money(c)+' از '+money(t)+' پرسش پاسخ داده شده';$('progressFill').style.width=((c/t)*100)+'%';$('stepCount').textContent='گام '+money(current+1)+' از '+money(steps.length);const nodes=$('steps').querySelectorAll('button');nodes.forEach((n,i)=>{n.classList.toggle('active',i===current);n.setAttribute('aria-current',i===current?'step':'false');});}
function renderNav(){$('steps').replaceChildren();steps.forEach((s,i)=>{const b=document.createElement('button');b.type='button';b.className='step';b.innerHTML='<span class="stepno">'+money(i+1)+'</span><span>'+escape(s.title)+'</span>';b.onclick=()=>go(i);$('steps').append(b);});}
const field=(label,control,helper='')=>'<label class="field"><span>'+escape(label)+'</span>'+control+(helper?'<small>'+escape(helper)+'</small>':'')+'</label>';
const input=(id,value='',placeholder='',type='text')=>'<input type="'+type+'" id="'+escape(id)+'" value="'+escape(value)+'" placeholder="'+escape(placeholder)+'">';
const textarea=(id,value='',placeholder='')=>'<textarea rows="3" id="'+escape(id)+'" placeholder="'+escape(placeholder)+'">'+escape(value)+'</textarea>';
function renderProfile(){
 $('content').innerHTML='<div class="intro-note"><strong>پیش‌فرض‌های ثبت‌شده</strong><p>اطلاعات اولیه از پاسخ‌های محمدحسین وارد شده است. این اطلاعات قابل اصلاح‌اند؛ مزیت رقابتی و پرفروش‌ترین کالاها هنوز نیازمند اعتبارسنجی هستند.</p></div><div class="profile-fields">'+spec.profile.map(([id,title],i)=>field(title,(id==='products'||id==='assets'||id==='customers'||id==='model'||id==='advantage'||id==='strategy')?textarea('p-'+id,state.profile[id]||''):input('p-'+id,state.profile[id]||''))).join('')+'</div>';
 for(const [id] of spec.profile){$('p-'+id).addEventListener('input',e=>{state.profile[id]=e.target.value;save();});}
}
function renderQuestions(s){
 let html='<p class="intro-note">'+escape(s.desc)+'</p><div class="questions">';
 s.qs.forEach((q,i)=>{const id=s.id+'_'+i,a=state.answers[id]||{options:[],note:''};
 html+='<fieldset class="question"><legend><span class="qnum">'+money(i+1)+'</span> '+escape(q.p)+'</legend>';
 if(q.h)html+='<p class="hint">'+escape(q.h)+'</p>';
 html+='<div class="choices">'+q.o.map((o,j)=>'<label class="choice"><input type="checkbox" data-q="'+escape(id)+'" value="'+escape(o)+'" '+((a.options||[]).includes(o)?'checked':'')+'><span>'+escape(o)+'</span></label>').join('')+'</div>';
 html+=field('توضیحات، اعداد، نام شرکت‌ها و شواهد واقعی',textarea('a-'+id,a.note||'','آنچه می‌دانید یا باید بررسی شود را بنویسید...'))+'</fieldset>';
 });
 const ev=state.evidence[s.id]||{level:'unknown',note:''};
 html+='</div><div class="evidence"><h3>سطح شواهد و اعتبارسنجی</h3>'+field('پاسخ‌های این بخش بر چه مبنایی هستند؟','<select id="ev-level"><option value="unknown">هنوز شواهد نداریم</option><option value="assumption">فرضیه یا تخمین اولیه</option><option value="interview">مصاحبه یا استعلام مستند</option><option value="market">داده بازار و قیمت واقعی</option><option value="transaction">سفارش، فروش یا قرارداد واقعی</option></select>')+field('منبع شواهد و تاریخ',textarea('ev-note',ev.note||'','مثلاً ۱۲ فروشگاه تهران، آبان ۱۴۰۵'))+'</div>';
 if(s.id==='risks')html+=renderRisksHTML();
 $('content').innerHTML=html;
 for(const q of s.qs.map((x,i)=>s.id+'_'+i)){
   $('a-'+q).addEventListener('input',e=>{if(!state.answers[q])state.answers[q]={options:[],note:''};state.answers[q].note=e.target.value;save();});
   document.querySelectorAll('[data-q="'+q+'"]').forEach(cb=>cb.addEventListener('change',()=>{
      if(!state.answers[q])state.answers[q]={options:[],note:''};
      state.answers[q].options=[...document.querySelectorAll('[data-q="'+q+'"]:checked')].map(x=>x.value);save();
   }));
 }
 $('ev-level').value=ev.level||'unknown';
 $('ev-level').addEventListener('change',e=>{if(!state.evidence[s.id])state.evidence[s.id]={};state.evidence[s.id].level=e.target.value;save();});
 $('ev-note').addEventListener('input',e=>{if(!state.evidence[s.id])state.evidence[s.id]={};state.evidence[s.id].note=e.target.value;save();});
 if(s.id==='risks')wireRisks();
}
function renderRisksHTML(){return '<div class="evidence"><h3>دفتر ریسک و مسئول پیگیری</h3><p class="hint">برای ریسک‌های مهم، اولویت و اقدام اصلاحی ثبت کنید.</p>'+spec.risks.map((name,i)=>{const r=state.risks[i]||{};return '<div class="risk"><label class="riskhead"><input type="checkbox" data-risk="'+i+'" '+(r.selected?'checked':'')+'> <span>'+escape(name)+'</span></label><div class="risk-fields" '+(r.selected?'':'hidden')+'>'+field('اولویت','<select data-risk-level="'+i+'"><option value="">انتخاب نشده</option><option value="بالا">بالا</option><option value="متوسط">متوسط</option><option value="پایین">پایین</option></select>')+field('راهکار، مسئول و زمان',textarea('risk-note-'+i,r.note||''))+'</div></div>';}).join('')+'</div>';}
function wireRisks(){spec.risks.forEach((n,i)=>{const r=state.risks[i]||{};document.querySelector('[data-risk-level="'+i+'"]').value=r.level||'';document.querySelector('[data-risk="'+i+'"]').addEventListener('change',e=>{state.risks[i]={...(state.risks[i]||{}),selected:e.target.checked};e.target.closest('.risk').querySelector('.risk-fields').hidden=!e.target.checked;save();});document.querySelector('[data-risk-level="'+i+'"]').addEventListener('change',e=>{state.risks[i]={...(state.risks[i]||{}),level:e.target.value};save();});$('risk-note-'+i).addEventListener('input',e=>{state.risks[i]={...(state.risks[i]||{}),note:e.target.value};save();});});}
const financialFields=[
['purchase','قیمت خرید هر واحد کالا','تومان','قیمت خرید تبدیل‌شده به تومان، بدون هزینه‌های بعدی'],
['freight','حمل و بیمه سرشکن هر واحد','تومان','هزینه حمل و بیمه تقسیم بر تعداد واحد'],
['customs','گمرک، مالیات و استاندارد هر واحد','تومان','پس از استعلام برای کالا و تعرفه مشخص'],
['other','هزینه دیگر هر واحد تا آماده فروش','تومان','بسته‌بندی، خسارت برآوردی، حمل داخل و...'],
['wholesale','قیمت فروش عمده هر واحد','تومان','قیمت فروش خالص بدون مالیات قابل انتقال'],
['retail','قیمت فروش مستقیم هر واحد','تومان','اختیاری؛ سود خرده‌فروشی با هزینه کانال باید جدا سنجیده شود'],
['units','تعداد واحد در پایلوت','عدد','جمع مقدار سفارش آزمایشی'],
['sold','درصد فروش موجودی پایلوت','درصد','فرضیه فروش؛ عدد واقعی را پس از اجرا جایگزین کنید'],
['setup','هزینه ثابت اجرای پایلوت','میلیون تومان','هزینه ثابت بازاریابی، تجهیز، حقوق و...'],
['reserve','ذخیره نقدینگی و سرمایه در گردش','میلیون تومان','برای تأخیر، مطالبات و هزینه‌های پیش‌بینی‌نشده']
];
function compute(){
 const f=state.finance,n=k=>{const z=Number(f[k]);return f[k]!==''&&f[k]!==undefined&&Number.isFinite(z)&&z>=0?z:null;};
 const price=n('wholesale'),purchase=n('purchase'),freight=n('freight'),customs=n('customs'),other=n('other'),qty=n('units'),sold=n('sold'),setup=n('setup'),reserve=n('reserve'),retail=n('retail');
 if([purchase,freight,customs,other].some(x=>x===null))return null;
 const landed=purchase+freight+customs+other, margin=price!==null&&price>0?(price-landed)/price*100:null;
 const purchaseBudget=qty!==null?qty*landed:null;
 const totalNeed=purchaseBudget!==null&&setup!==null&&reserve!==null?purchaseBudget+(setup+reserve)*1e6:null;
 const expectedSales=qty!==null&&sold!==null&&sold<=100?qty*sold/100:null;
 const grossRevenue=price!==null&&expectedSales!==null?price*expectedSales:null;
 const cogs=expectedSales!==null?expectedSales*landed:null;
 return {landed,price,retail,margin,qty,purchaseBudget,totalNeed,expectedSales,grossRevenue,grossProfit:grossRevenue!==null?grossRevenue-cogs:null,unsold:qty!==null&&expectedSales!==null?qty-expectedSales:null,setup};
}
function financeResults(){
 const r=compute();if(!r)return '<p class="empty">برای محاسبه، قیمت خرید و سه جزء هزینه هر واحد را وارد کنید؛ حتی برای هزینه صفر هم عدد «۰» ثبت کنید.</p>';
 const row=(k,v)=>'<div class="metric"><span>'+k+'</span><strong>'+v+'</strong></div>';
 const fmt=x=>x===null?'نیازمند داده':money(x)+' تومان';
 return '<div class="metrics">'+row('بهای تمام‌شده هر واحد',fmt(r.landed))+row('حاشیه سود ناخالص عمده',r.margin===null?'نیازمند قیمت عمده':money(r.margin)+'٪')+row('کل ارزش موجودی پایلوت',fmt(r.purchaseBudget))+row('نیاز نقدینگی کل پایلوت',fmt(r.totalNeed))+row('درآمد فروش در فرض نرخ فروش ثبت‌شده',fmt(r.grossRevenue))+row('سود ناخالص کالاهای فروخته‌شده',fmt(r.grossProfit))+row('تعداد کالای فروش‌نرفته',r.unsold===null?'نیازمند تعداد و درصد فروش':money(r.unsold)+' واحد')+'</div>'+(r.price!==null&&r.price<r.landed?'<p class="warning">هشدار: قیمت عمده از بهای تمام‌شده کمتر است.</p>':'')+'<p class="hint">این محاسبه فقط برای یک کالای نمونه و سناریوی فرضی است؛ هزینه مالی، مالیات عملکرد، تخفیف، مرجوعی، تفاوت قیمت کانال‌ها و هزینه فرصت را کامل پوشش نمی‌دهد. برای کل سبد، هر کد کالا باید جدا محاسبه شود.</p>';
}
function renderFinancial(){
 $('content').innerHTML='<div class="intro-note">بودجه اعلام‌شده: <strong>۵ تا ۱۰ میلیارد تومان</strong>. این یک سقف سرمایه اولیه است، نه اثبات توجیه اقتصادی. اعداد مالی را از پیش‌فاکتور و بازار واقعی وارد کنید. مبالغ واحد «تومان» و هزینه‌های ثابت «میلیون تومان» هستند.</div><div class="finance-grid">'+financialFields.map(([id,label,unit,hint])=>field(label+' ('+unit+')',input('f-'+id,state.finance[id]??'','عدد را وارد کنید','number'),hint)).join('')+'</div><div class="evidence"><h3>خروجی محاسبه سناریوی نمونه</h3><div id="financialResults"></div></div>';
 financialFields.forEach(([id])=>{const e=$('f-'+id);e.min='0';if(id==='sold')e.max='100';e.step=id==='sold'?'0.1':'any';e.addEventListener('input',()=>{state.finance[id]=e.value;save();$('financialResults').innerHTML=financeResults();});});
 $('financialResults').innerHTML=financeResults();
}
function getCanvasText(ids){
 const found=[];
 for(const id of ids){const s=spec.stages.find(x=>x.id===id);if(!s)continue;
 for(let i=0;i<s.qs.length;i++){const a=state.answers[id+'_'+i]||{};const choices=(a.options||[]).slice(0,4);if(choices.length)found.push(choices.join('، '));else if((a.note||'').trim())found.push(a.note.trim().slice(0,130));if(found.length>=7)break;}if(found.length>=7)break;}
 return found.join('؛ ')||'هنوز تکمیل نشده؛ نیازمند اطلاعات و اعتبارسنجی';
}
function canvasText(item){return state.canvas[item[0]]!==undefined?state.canvas[item[0]]:getCanvasText(item[2]);}
function renderCanvas(){
 $('content').innerHTML='<div class="intro-note">این ۹ خانه براساس پاسخ‌های پرسشنامه ساخته می‌شوند و هنوز به معنای «مدل اعتبارسنجی‌شده» نیستند. می‌توانید هر خانه را مستقل اصلاح کنید.</div><div class="canvas-grid">'+spec.canvas.map((c,i)=>'<section class="canvas-tile"><span class="overline">خانه '+money(i+1)+'</span><h3>'+escape(c[1])+'</h3>'+textarea('c-'+c[0],canvasText(c),'جمع‌بندی قابل ارائه')+'<button type="button" class="reset-small" data-reset="'+escape(c[0])+'">بازسازی از پاسخ‌ها</button></section>').join('')+'</div>';
 spec.canvas.forEach(c=>{$('c-'+c[0]).addEventListener('input',e=>{state.canvas[c[0]]=e.target.value;save();});document.querySelector('[data-reset="'+c[0]+'"]').addEventListener('click',()=>{delete state.canvas[c[0]];$('c-'+c[0]).value=getCanvasText(c[2]);save();});});
}
function reportHtml(){
 let s='<header><h1>'+escape(spec.title)+'</h1><p>طرح اولیه و فرضیات قابل اعتبارسنجی | آخرین ثبت: '+escape(state.updatedAt?new Date(state.updatedAt).toLocaleString('fa-IR'):'ثبت نشده')+'</p></header>';
 s+='<section><h2>۱. مشخصات و مفروضات اولیه</h2><table>'+spec.profile.map(([id,label])=>'<tr><th>'+escape(label)+'</th><td>'+escape(state.profile[id]||'ثبت نشده')+'</td></tr>').join('')+'</table></section>';
 spec.stages.forEach((st,i)=>{s+='<section><h2>'+money(i+2)+'. '+escape(st.title)+'</h2>';st.qs.forEach((q,j)=>{const a=state.answers[st.id+'_'+j]||{};s+='<div class="answer"><strong>'+money(j+1)+'. '+escape(q.p)+'</strong><p>گزینه‌های انتخاب‌شده: '+escape((a.options||[]).join('، ')||'ثبت نشده')+'</p><p>شرح و شواهد: '+escape(a.note||'ثبت نشده')+'</p></div>';});const ev=state.evidence[st.id]||{};s+='<p class="evidence-note">سطح شواهد: '+escape(({unknown:'ثبت نشده',assumption:'فرضیه',interview:'مصاحبه / استعلام',market:'داده بازار',transaction:'فروش / قرارداد'})[ev.level]||'ثبت نشده')+' | منبع: '+escape(ev.note||'ثبت نشده')+'</p></section>';});
 const r=compute();s+='<section><h2>محاسبات مالی اولیه برای یک کالای نمونه</h2><table>'+financialFields.map(([id,label,unit])=>'<tr><th>'+escape(label)+'</th><td>'+escape(state.finance[id]===undefined||state.finance[id]===''?'ثبت نشده':state.finance[id]+' '+unit)+'</td></tr>').join('')+'</table>';
 if(r)s+='<p>بهای تمام‌شده واحد: '+escape(money(r.landed))+' تومان | حاشیه عمده: '+escape(r.margin===null?'نامشخص':money(r.margin)+'٪')+' | نقدینگی لازم: '+escape(r.totalNeed===null?'نامشخص':money(r.totalNeed)+' تومان')+' | سود ناخالص سناریو: '+escape(r.grossProfit===null?'نامشخص':money(r.grossProfit)+' تومان')+'</p>';s+='</section>';
 s+='<section><h2>بوم ۹ بخشی مدل کسب‌وکار</h2><div class="report-canvas">'+spec.canvas.map(c=>'<div><h3>'+escape(c[1])+'</h3><p>'+escape(canvasText(c))+'</p></div>').join('')+'</div></section>';
 s+='<section><h2>دفتر ریسک</h2>'+spec.risks.map((risk,i)=>{const r=state.risks[i]||{};return r.selected?'<p><strong>'+escape(risk)+'</strong> | اولویت: '+escape(r.level||'ثبت نشده')+' | اقدام/مسئول: '+escape(r.note||'ثبت نشده')+'</p>':'';}).join('')+'</section>';
 s+='<footer>این گزارش با داده‌های ثبت‌شده توسط تکمیل‌کننده تهیه شده و جایگزین بررسی حقوقی، گمرکی، ایمنی یا ارزیابی مستقل مالی نیست.</footer>';
 return s;
}
function htmlDocument(){return '<!doctype html><html lang="fa" dir="rtl"><meta charset="utf-8"><title>طرح کسب‌وکار اسباب‌بازی</title><style>body{font:14px/2 Tahoma,Arial,sans-serif;color:#1c342f;max-width:980px;margin:auto;padding:24px;direction:rtl}h1{color:#125742}h2{color:#17624c;border-bottom:2px solid #d6e8dd;padding-bottom:8px}h3{margin:0 0 8px}section{page-break-inside:avoid;margin-bottom:28px}table{width:100%;border-collapse:collapse}th,td{border:1px solid #d6e6df;padding:8px;text-align:right;vertical-align:top}th{background:#eef5f0;width:35%}.answer{border-bottom:1px solid #e1eae5;padding:9px 0}.answer p{margin:3px 0}.evidence-note{background:#f0f6ef;padding:12px}.report-canvas{display:grid;grid-template-columns:repeat(3,1fr);gap:8px}.report-canvas>div{border:1px solid #d7e4da;padding:12px;border-radius:8px;overflow-wrap:anywhere}footer{font-size:12px;color:#667}@media print{body{padding:0}section{break-inside:auto}.answer{break-inside:avoid}}@media(max-width:650px){.report-canvas{grid-template-columns:1fr}}</style><body>'+reportHtml()+'</body></html>';}
function textReport(){const d=document.createElement('div');d.innerHTML=reportHtml();return d.innerText||d.textContent||'';}
function download(data,filename,type){const blob=new Blob([data],{type}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=filename;a.click();setTimeout(()=>URL.revokeObjectURL(url),10000);}
function renderExport(){
 const [a,t]=totalAnswered();const percent=Math.round(a/t*100);
 $('content').innerHTML='<div class="intro-note"><strong>گزارش طرح کسب‌وکار آماده دریافت است.</strong><p>'+money(a)+' پرسش از '+money(t)+' پاسخ داده شده ('+money(percent)+'٪). خانه‌های بدون پاسخ در خروجی با «ثبت نشده» مشخص می‌شوند. تکمیل همه پرسش‌ها برای دریافت فایل الزامی نیست.</p></div><div class="export-grid"><button type="button" class="primary" id="printReport">چاپ / ذخیره به‌صورت پی‌دی‌اف</button><button type="button" class="secondary" id="saveHtml">دریافت گزارش کامل قابل بازکردن</button><button type="button" class="secondary" id="saveTxt">دریافت فایل متنی</button><button type="button" class="secondary" id="shareTxt">اشتراک‌گذاری پاسخ‌ها</button><button type="button" class="secondary" id="saveJson">فایل پشتیبان</button><label class="secondary filelabel">بازیابی پشتیبان<input type="file" id="importJson" accept=".json,application/json" hidden></label></div><p id="exportStatus" role="status" class="hint"></p><div class="preview-report"><h3>پیش‌نمایش آغاز گزارش</h3><p>مشخصات اولیه، ۱۲ حوزه تحلیلی، محاسبات مالی، ۹ خانه بوم، ریسک‌ها و برنامه اقدامات در فایل کامل قرار دارند.</p><p>برای ارسال به مشاور می‌توانید فایل را با گزینه اشتراک‌گذاری در واتس‌اپ بفرستید. هیچ داده‌ای خودکار به سرور یا شخص دیگری ارسال نمی‌شود.</p></div>';
 $('printReport').onclick=()=>{$('printArea').innerHTML=reportHtml();window.print();};
 $('saveHtml').onclick=()=>download('\ufeff'+htmlDocument(),'toy-business-plan.html','text/html;charset=utf-8');
 $('saveTxt').onclick=()=>download('\ufeff'+textReport(),'toy-business-plan.txt','text/plain;charset=utf-8');
 $('saveJson').onclick=()=>download(JSON.stringify({app:'toys-iran',data:state},null,2),'toy-business-plan-backup.json','application/json;charset=utf-8');
 $('shareTxt').onclick=async()=>{const file=new File(['\ufeff'+textReport()],'toy-business-plan.txt',{type:'text/plain'});if(navigator.share&&navigator.canShare?.({files:[file]})){try{await navigator.share({files:[file],title:spec.title});$('exportStatus').textContent='صفحه انتخاب برنامه برای اشتراک‌گذاری باز شد.';return;}catch(e){if(e.name==='AbortError')return;}}download('\ufeff'+textReport(),'toy-business-plan.txt','text/plain;charset=utf-8');$('exportStatus').textContent='فایل دانلود شد؛ آن را به واتس‌اپ پیوست کنید.';};
 $('importJson').onchange=async e=>{const file=e.target.files?.[0];if(!file)return;try{const obj=JSON.parse(await file.text());if(obj.app!=='toys-iran'||obj.data?.project!=='toys-iran'||obj.data.version!==1)throw Error('invalid');if(!confirm('پاسخ‌های فعلی با پشتیبان جایگزین شوند؟'))return;state={...fresh(),...obj.data};save();render();$('exportStatus').textContent='بازیابی انجام شد.';}catch(err){$('exportStatus').textContent='فایل پشتیبان معتبر این برنامه نیست.';}};
}
function render(){
 const step=steps[current];$('sectionLabel').textContent='گام '+money(current+1)+' از '+money(steps.length);$('sectionTitle').textContent=step.title;$('sectionDesc').textContent=step.desc;
 if(step.id==='profile')renderProfile();else if(step.id==='financial')renderFinancial();else if(step.id==='canvas')renderCanvas();else if(step.id==='export')renderExport();else renderQuestions(spec.stages.find(s=>s.id===step.id));
 $('prev').disabled=current===0;$('next').hidden=current===steps.length-1;$('next').textContent=current===steps.length-2?'دریافت گزارش و خروجی':'ذخیره و ادامه';progress();
}
function go(i){if(i<0||i>=steps.length)return;current=i;render();$('workspace').scrollIntoView({block:'start',behavior:'smooth'});}
$('prev').onclick=()=>go(current-1);$('next').onclick=()=>go(current+1);
$('clearData').onclick=()=>{if(!confirm('همه اطلاعات این طرح روی همین دستگاه پاک شوند؟'))return;state=fresh();save();go(0);};
renderNav();render();
})();