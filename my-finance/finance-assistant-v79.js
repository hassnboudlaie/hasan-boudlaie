/* My Finance voice report assistant: local rules, no paid API, no automated writes. */
(()=>{
'use strict';
const $=id=>document.getElementById(id);
const bridge=window.MyFinanceBridge,anchor=$('personal-ai-panel');
if(!bridge||!anchor)return;
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const norm=s=>String(s||'').replace(/[۰-۹]/g,c=>String('۰۱۲۳۴۵۶۷۸۹'.indexOf(c))).replace(/[٠-٩]/g,c=>String('٠١٢٣٤٥٦٧٨٩'.indexOf(c))).replace(/[يى]/g,'ی').replace(/ك/g,'ک').replace(/\u200c/g,' ').replace(/\s+/g,' ').trim();
const fmt=n=>new Intl.NumberFormat('fa-IR',{maximumFractionDigits:2}).format(Number(n)||0);
const jalali=new Intl.DateTimeFormat('en-US-u-ca-persian',{timeZone:'Asia/Tehran',year:'numeric',month:'numeric',day:'numeric'});
const parts=d=>Object.fromEntries(jalali.formatToParts(d).filter(x=>['year','month','day'].includes(x.type)).map(x=>[x.type,Number(x.value)]));
const now=parts(new Date()),idx=p=>p.year*12+p.month-1;
const months=['فروردین','اردیبهشت','خرداد','تیر','مرداد','شهریور','مهر','آبان','آذر','دی','بهمن','اسفند'];
const parsedDate=t=>{
 const v=String(t.date||t.occurredAt||'');
 if(!/^\d{4}-\d{2}-\d{2}/.test(v))return null;
 const d=new Date(v.length===10?v+'T12:00:00Z':v);
 return Number.isNaN(d.getTime())?null:d;
};
const accountCurrency=(t,accounts)=>t.currency||accounts.find(a=>a.id===t.account)?.currency||'IRT';
function period(q){
 q=norm(q);const n=idx(now),month=months.findIndex(m=>q.includes(m));
 if(month>=0){
  const year=Number(q.match(/(?:13|14)\d{2}/)?.[0]|| (month+1>now.month?now.year-1:now.year));
  return {from:year*12+month,to:year*12+month,label:months[month]+' '+fmt(year)};
 }
 if(/ماه گذشته|ماه قبل|ماه پیش/.test(q))return {from:n-1,to:n-1,label:'ماه گذشته'};
 if(/کل|همه|تمام دوره|از ابتدا/.test(q))return {from:-Infinity,to:Infinity,label:'همه زمان‌ها'};
 if(/امسال|سال جاری/.test(q))return {from:now.year*12,to:n,label:'سال جاری'};
 const count=/(سه|3) ماه/.test(q)?3:/(شش|6) ماه/.test(q)?6:/(دوازده|12) ماه|یک سال اخیر/.test(q)?12:1;
 return {from:n-count+1,to:n,label:count===1?'ماه جاری':fmt(count)+' ماه اخیر'};
}
const card=document.createElement('div');card.className='card mf-voice-reports';card.id='finance-smart-assistant';
card.innerHTML='<div class="mf-va-heading"><span aria-hidden="true">🎙️</span><div><h2>دستیار مالی من</h2><p class="muted">با صدا یا متن سؤال بپرسید، تراکنش ثبت کنید و خروجی بگیرید.</p></div></div>'
 +'<label for="mf-va-question">درخواست شما</label><div class="mf-va-input"><textarea id="mf-va-question" rows="2" maxlength="500" placeholder="مثلاً: این ماه چقدر هزینه کردم؟"></textarea><button type="button" id="mf-va-mic" aria-label="شروع یا توقف ضبط درخواست صوتی" aria-pressed="false">🎙</button></div>'
 +'<div class="mf-va-actions"><button type="button" id="mf-va-go">بررسی درخواست</button><button type="button" class="alt" id="mf-va-keyboard">⌨ دیکته با کیبورد</button></div><p class="muted" id="mf-va-status" role="status" aria-live="polite">رایگان و بدون API پولی؛ قابلیت میکروفون به مرورگر بستگی دارد.</p>'
 +'<div class="mf-va-prompts"><button type="button" data-va-query="این ماه چقدر هزینه کردم؟">هزینه این ماه</button><button type="button" data-va-query="بیشترین هزینه‌های سه ماه اخیر چیست؟">بیشترین هزینه‌ها</button><button type="button" data-va-query="اقساط هفته آینده چیست؟">اقساط پیش رو</button><button type="button" data-va-query="آخرین تراکنش من چیست؟">آخرین تراکنش</button></div>'
 +'<div id="mf-va-result" hidden><h3 id="mf-va-title"></h3><p id="mf-va-summary"></p><div id="mf-va-details"></div><div class="mf-va-actions"><button type="button" id="mf-va-csv">CSV برای Excel</button><button type="button" id="mf-va-pdf" class="alt">چاپ / ذخیره PDF</button><button type="button" id="mf-va-speak" class="alt">🔊 خواندن پاسخ</button></div></div>'
 +'<p class="mf-va-note">محاسبات روی اطلاعات حساب فعال شما در دستگاه انجام می‌شوند؛ داده مالی به AI خارجی ارسال نمی‌شود. سرویس گفتار مرورگر ممکن است آنلاین باشد. ثبت تراکنش فقط با تأیید شما انجام می‌شود.</p>';
anchor.before(card);
const home=document.createElement('button');home.className='mf-va-home';home.type='button';home.textContent='🎙️ دستیار مالی من · گزارش صوتی';
home.addEventListener('click',()=>{if(!document.body.classList.contains('finance-unlocked'))return;window.financeNavGo?.('assistant');requestAnimationFrame(()=>$('mf-va-question').focus({preventScroll:true}))});
document.querySelector('#home .finance-quick-card')?.insertAdjacentElement('beforebegin',home);
const style=document.createElement('style');style.textContent=
'.mf-voice-reports{padding:23px!important;border:1px solid var(--line)!important;border-radius:22px!important;scroll-margin-top:30px}.mf-va-heading{display:flex;align-items:center;gap:13px}.mf-va-heading>span{font-size:35px;padding:14px;background:#e7f5f1;border-radius:16px}.mf-va-heading h2{font-size:26px;margin:0}.mf-va-heading p{font-size:15px;margin:5px 0}.mf-voice-reports label{font-size:19px;font-weight:700;display:block;margin:16px 0 8px}.mf-va-input{display:flex;align-items:stretch;gap:10px}.mf-va-input textarea{flex:1;min-width:0;padding:12px;min-height:90px;font-size:20px!important;line-height:1.9;border:2px solid var(--line);border-radius:15px}.mf-va-input button{min-width:64px;font-size:28px;border-radius:14px}.mf-va-input button[aria-pressed=true]{background:#b91c1c;color:white}.mf-va-actions{display:flex;flex-wrap:wrap;gap:9px;margin:12px 0}.mf-va-actions button{min-height:49px;border-radius:12px;padding:10px 15px;font-size:16px;font-weight:700}.mf-va-prompts{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px;margin:14px 0}.mf-va-prompts button{min-height:54px;background:var(--card);color:var(--fg);border:1px solid var(--line);border-radius:13px;font-size:16px;font-weight:700}.mf-va-home{display:block;width:100%;margin:14px 0;min-height:66px;padding:13px;border:2px solid var(--accent);border-radius:18px;text-align:right;background:var(--card);color:var(--fg);font-size:21px;font-weight:800}#mf-va-result{border:1px solid var(--line);border-radius:16px;background:var(--bg);padding:16px;margin:18px 0}#mf-va-title{font-size:22px}#mf-va-summary{font-size:20px;line-height:2;white-space:pre-line}.mf-va-detail{display:flex;justify-content:space-between;gap:12px;padding:11px 0;border-bottom:1px solid var(--line);font-size:17px}.mf-va-note{font-size:13px;line-height:1.9;color:var(--muted)}#mf-va-status{font-size:15px;line-height:1.7}.mf-va-print{position:fixed;inset:0;z-index:99999;overflow:auto;background:white;color:#182634;padding:25px}.mf-va-print section{max-width:760px;margin:auto}.mf-va-print p{white-space:pre-line;font-size:18px;line-height:2}@media(max-width:560px){.mf-voice-reports{padding:16px!important}.mf-va-actions button{flex:1}.mf-va-input textarea{font-size:18px!important}.mf-va-heading h2{font-size:23px}}@media print{body *{visibility:hidden!important}.mf-va-print,.mf-va-print *{visibility:visible!important}.mf-va-print{position:absolute;inset:0;overflow:visible;padding:0}.mf-va-print .mf-va-actions{display:none!important}}';
document.head.append(style);
const status=(s,err=false)=>{const p=$('mf-va-status');p.textContent=s;p.style.color=err?'#b91c1c':'';};
let last=null,recognition=null,transcript='',listening=false;
function display(title,summary,details,rows){
 last={title,summary,details,rows};
 $('mf-va-title').textContent=title;$('mf-va-summary').textContent=summary;
 $('mf-va-details').innerHTML=details.map(([k,v])=>'<div class="mf-va-detail"><span>'+esc(k)+'</span><strong>'+esc(v)+'</strong></div>').join('');
 $('mf-va-result').hidden=false;$('mf-va-csv').disabled=!rows.length;
 $('mf-va-result').scrollIntoView({block:'nearest',behavior:'smooth'});
}
const CSV_HEADERS=['تاریخ','نوع','مبلغ','ارز','دسته‌بندی','حساب','توضیح'];
const row=(t,d,accounts)=>[
 Object.fromEntries(new Intl.DateTimeFormat('en-US',{timeZone:'Asia/Tehran',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(d).filter(p=>['year','month','day'].includes(p.type)).map(p=>[p.type,p.value])).year+'-'+String(Object.fromEntries(new Intl.DateTimeFormat('en-US',{timeZone:'Asia/Tehran',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(d).filter(p=>['year','month','day'].includes(p.type)).map(p=>[p.type,p.value])).month).padStart(2,'0')+'-'+String(Object.fromEntries(new Intl.DateTimeFormat('en-US',{timeZone:'Asia/Tehran',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(d).filter(p=>['year','month','day'].includes(p.type)).map(p=>[p.type,p.value])).day).padStart(2,'0'),
 t.kind==='expense'?'هزینه':t.kind==='income'?'درآمد':t.kind||'',
 Number(t.amount)||0,accountCurrency(t,accounts),t.category||'',accounts.find(a=>a.id===t.account)?.name||t.accountName||'',t.memo||''
];
function report(q){
 const data=bridge.getData(),accounts=data.accounts||[],p=period(q);
 const entries=(data.tx||[]).filter(t=>['income','expense'].includes(t.kind)&&!['cancelled','pending'].includes(t.status))
 .map(t=>({t,d:parsedDate(t)})).filter(o=>o.d&&idx(parts(o.d))>=p.from&&idx(parts(o.d))<=p.to).sort((a,b)=>b.d-a.d);
 const totals=new Map(),cats=new Map();
 for(const {t} of entries){
  const currency=accountCurrency(t,accounts),unit=currency==='IRR'?'IRT':currency;
  const amount=Number(t.amount)/(currency==='IRR'?10:1);if(!Number.isFinite(amount)||amount<0)continue;
  const x=totals.get(unit)||{income:0,expense:0};x[t.kind]+=amount;totals.set(unit,x);
  if(t.kind==='expense'){const key=unit+'|'+(t.category||'سایر');cats.set(key,(cats.get(key)||0)+amount)}
 }
 const sums=[],detail=[];
 for(const [currency,t] of [...totals].sort((a,b)=>a[0].localeCompare(b[0]))){
  const name=currency==='IRT'?'تومان':currency;
  sums.push('درآمد '+fmt(t.income)+'، هزینه '+fmt(t.expense)+'، خالص '+fmt(t.income-t.expense)+' '+name);
  detail.push(['خالص جریان نقد '+name,fmt(t.income-t.expense)]);
 }
 for(const [currency] of totals){for(const [k,v] of [...cats].filter(([key])=>key.startsWith(currency+'|')).sort((a,b)=>b[1]-a[1]).slice(0,5)){detail.push([k.slice(currency.length+1)+' · '+(currency==='IRT'?'تومان':currency),fmt(v)+' '+(currency==='IRT'?'تومان':currency)])}}
 display('گزارش مالی · '+p.label,entries.length?'بازه: '+p.label+'\n'+sums.join('\n')+'\nتعداد تراکنش‌های قطعی: '+fmt(entries.length)+'\nقرض‌ها، انتقال‌ها و تراکنش‌های در انتظار در جمع درآمد و هزینه محاسبه نمی‌شوند.':'در این بازه تراکنش قطعی درآمد یا هزینه ثبت نشده است.',detail,entries.map(({t,d})=>row(t,d,accounts)));
 status('گزارش با داده‌های حساب شما ساخته شد؛ ارزهای متفاوت با هم جمع نشده‌اند.');
}
function dues(q){
 const data=bridge.getData(),from=parts(new Date()),nearest=/بعدی|نزدیک ترین|نزدیک‌ترین|اولین/.test(q),to=nearest?{year:9999,month:12,day:31}:parts(new Date(Date.now()+(/ماه/.test(q)?31:7)*86400000));
 const num=p=>p.year*10000+p.month*100+p.day;
 const due=(data.loans||[]).filter(l=>!['closed','paid'].includes(l.status)).map(l=>{
  const date=norm(l.nextDueJalali||'').replace(/[-.]/g,'/');
  if(!/^\d{4}\/\d{1,2}\/\d{1,2}$/.test(date))return null;
  const [year,month,day]=date.split('/').map(Number),n=num({year,month,day}),a=Number(l.installment);
  return n>=num(from)&&n<=num(to)&&a>0?{date,n,a,name:l.title||'قسط',currency:l.currency||'IRT'}:null;
 }).filter(Boolean).sort((a,b)=>a.n-b.n).slice(0,nearest?1:100);
 const details=due.map(l=>[l.name+' · '+l.date,fmt(l.a)+' '+(l.currency==='IRT'?'تومان':l.currency==='IRR'?'ریال':l.currency)]);
 const rows=due.map(l=>[l.date,'قسط',l.a,l.currency,l.name,'','سررسید ثبت‌شده']);
 display('اقساط پیش رو',due.length?fmt(due.length)+' قسط با سررسید و مبلغ معتبر پیدا شد.':'قسطی با تاریخ و مبلغ معتبر در بازه آینده ثبت نشده است؛ موعدهای نامشخص تخمین زده نمی‌شوند.',details,rows);
 status('فقط اقساط دارای تاریخ ثبت‌شده نمایش داده شده‌اند.');
}
function latest(){
 const data=bridge.getData(),accounts=data.accounts||[];
 const entries=(data.tx||[]).filter(t=>t.status!=='cancelled').map(t=>({t,d:parsedDate(t)})).filter(o=>o.d).sort((a,b)=>b.d-a.d);
 if(!entries.length)return display('آخرین تراکنش','هنوز تراکنشی ثبت نشده است.',[],[]);
 const {t,d}=entries[0],currency=accountCurrency(t,accounts);
 display('آخرین تراکنش',(t.kind==='income'?'درآمد':t.kind==='expense'?'هزینه':'تراکنش')+' · '+fmt(t.amount)+' '+(currency==='IRT'?'تومان':currency)+'\n'+(t.category||'بدون دسته‌بندی')+' · '+new Intl.DateTimeFormat('fa-IR-u-ca-persian',{timeZone:'Asia/Tehran',year:'numeric',month:'long',day:'numeric'}).format(d)+(t.status==='pending'?'\nدر انتظار تأیید':''),t.memo?[['توضیح',t.memo]]:[],[row(t,d,accounts)]);
 status('آخرین تراکنش براساس تاریخ درج‌شده در دفتر مالی نمایش داده شد.');
}
function run(){
 if(!document.body.classList.contains('finance-unlocked'))return status('ابتدا وارد حساب خود شوید.',true);
 const q=norm($('mf-va-question').value);if(!q)return status('ابتدا درخواستتان را بنویسید یا بگویید.',true);
 if(/اقساط|قسط|سررسید|موعد/.test(q))return dues(q);
 if(/آخرین تراکنش|آخرین هزینه|آخرین پرداخت|آخرین درآمد/.test(q))return latest();
 if(/گزارش|چقدر|جمع |میزان|بیشترین|خرج|هزینه ها|هزینه های|هزینه‌ها|هزینه‌های|درآمد|وضعیت مالی|خروجی|اکسل|excel|pdf|فایل/.test(q))return report(q);
 if(/پرداخت کردم|خرج کردم|خریدم|هزینه کردم|دریافت کردم|واریز شد|قرض دادم/.test(q)){
  if(!window.MyFinanceVoiceEntry?.previewFromInput)return status('فرم ثبت تراکنش در دسترس نیست.',true);
  $('quick').value=q;window.financeNavGo?.('quick-entry');window.MyFinanceVoiceEntry.previewFromInput();
  return status('پیش‌نویس آماده است. مبلغ، حساب و نوع را پیش از ثبت بررسی کنید.');
 }
 status('فعلاً ثبت تراکنش، گزارش درآمد و هزینه، اقساط و آخرین تراکنش پشتیبانی می‌شود. درخواست را مشخص‌تر بفرمایید.',true);
}
$('mf-va-go').addEventListener('click',run);
$('mf-va-question').addEventListener('keydown',e=>{if(e.key==='Enter'&&(e.ctrlKey||e.metaKey)){e.preventDefault();run()}});
card.querySelectorAll('[data-va-query]').forEach(b=>b.addEventListener('click',()=>{$('mf-va-question').value=b.dataset.vaQuery;run()}));
$('mf-va-keyboard').addEventListener('click',()=>{$('mf-va-question').focus();status('میکروفون صفحه‌کلید گوشی را بزنید؛ سپس «بررسی درخواست» را انتخاب کنید.')});
$('mf-va-mic').addEventListener('click',()=>{
 if(!document.body.classList.contains('finance-unlocked'))return status('ابتدا وارد حساب خود شوید.',true);
 if(listening&&recognition){recognition.stop();return}
 const Speech=window.SpeechRecognition||window.webkitSpeechRecognition;
 if(!Speech)return status('میکروفون مرورگر پشتیبانی نمی‌شود؛ از دیکته صفحه‌کلید یا تایپ استفاده کنید.',true);
 const r=new Speech();recognition=r;listening=true;transcript='';
 r.lang='fa-IR';r.interimResults=true;r.continuous=false;
 $('mf-va-mic').setAttribute('aria-pressed','true');status('در حال شنیدن… برای توقف، دوباره میکروفون را بزنید.');
 r.onresult=e=>{let text='';for(let i=0;i<e.results.length;i++)text+=e.results[i][0].transcript+' ';transcript=text.trim();$('mf-va-question').value=transcript};
 r.onerror=e=>status(e.error==='not-allowed'?'مجوز میکروفون داده نشده است؛ از کیبورد استفاده کنید.':'تشخیص گفتار کامل نشد؛ متن را بنویسید.',true);
 r.onend=()=>{if(recognition!==r)return;recognition=null;listening=false;$('mf-va-mic').setAttribute('aria-pressed','false');if(transcript)run()};
 try{r.start()}catch(e){recognition=null;listening=false;$('mf-va-mic').setAttribute('aria-pressed','false');status('میکروفون آماده نشد؛ دیکته کیبورد را امتحان کنید.',true)}
});
const cell=v=>{const s=String(v??''),safe=/^\s*[=+\-@\t\r]/.test(s)?"'"+s:s;return '"'+safe.replace(/"/g,'""')+'"'};
$('mf-va-csv').addEventListener('click',()=>{
 if(!last?.rows?.length)return;
 const csv='\ufeff'+[CSV_HEADERS,...last.rows].map(r=>r.map(cell).join(',')).join('\r\n');
 const url=URL.createObjectURL(new Blob([csv],{type:'text/csv;charset=utf-8'}));
 const a=document.createElement('a');a.href=url;a.download='my-finance-report.csv';document.body.append(a);a.click();a.remove();
 setTimeout(()=>URL.revokeObjectURL(url),5000);status('فایل CSV آماده شد و در Excel قابل بازکردن است.');
});
$('mf-va-pdf').addEventListener('click',()=>{
 if(!last)return;
 $('mf-va-print')?.remove();
 const el=document.createElement('div');el.id='mf-va-print';el.className='mf-va-print';
 el.innerHTML='<section><h2>'+esc(last.title)+'</h2><p>'+esc(last.summary)+'</p>'+last.details.map(([k,v])=>'<div class="mf-va-detail"><span>'+esc(k)+'</span><strong>'+esc(v)+'</strong></div>').join('')+'<div class="mf-va-actions"><button type="button" id="mf-va-print-go">چاپ / ذخیره PDF</button><button type="button" class="alt" id="mf-va-print-close">بستن</button></div></section>';
 document.body.append(el);
 $('mf-va-print-close').addEventListener('click',()=>el.remove());
 $('mf-va-print-go').addEventListener('click',()=>window.print());
 status('از پنجره چاپ مرورگر گزینه Save as PDF را انتخاب کنید.');
});
$('mf-va-speak').addEventListener('click',()=>{
 if(!last)return;
 if(!window.speechSynthesis)return status('صدای خواندن پاسخ در این مرورگر در دسترس نیست.',true);
 speechSynthesis.cancel();const speech=new SpeechSynthesisUtterance((last.title+'؛ '+last.summary).slice(0,1300));
 speech.lang='fa-IR';speech.rate=.9;speechSynthesis.speak(speech);status('خواندن فارسی به صدای موجود روی گوشی وابسته است.');
});
document.addEventListener('myfinance:rebound',()=>{last=null;$('mf-va-result').hidden=true;$('mf-va-question').value='';if(recognition){try{recognition.abort()}catch(_){}}recognition=null;listening=false;$('mf-va-mic').setAttribute('aria-pressed','false');});
window.MyFinanceVoiceReports={run,period};
})();