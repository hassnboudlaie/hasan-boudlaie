/* My Finance · private transaction history: Tehran/Jalali dates, period filters and local search.
   Uses only already-authorized browser data. No financial data or search terms leave the device. */
(()=>{
'use strict';
const bridge=window.MyFinanceBridge;
const holder=document.getElementById('txrows');
if(!bridge||!holder)return;
const byId=id=>document.getElementById(id);
const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const faNums=value=>String(value).replace(/[0-9]/g,d=>'۰۱۲۳۴۵۶۷۸۹'[Number(d)]);
const greg=new Intl.DateTimeFormat('en-US',{timeZone:'Asia/Tehran',year:'numeric',month:'numeric',day:'numeric'});
const persian=new Intl.DateTimeFormat('en-US-u-ca-persian',{timeZone:'Asia/Tehran',year:'numeric',month:'numeric',day:'numeric'});
const weekday=new Intl.DateTimeFormat('fa-IR',{timeZone:'Asia/Tehran',weekday:'long'});
const months=['','فروردین','اردیبهشت','خرداد','تیر','مرداد','شهریور','مهر','آبان','آذر','دی','بهمن','اسفند'];
const number=new Intl.NumberFormat('fa-IR',{maximumFractionDigits:2});
const labels={all:['همه','All'],day:['روز','Day'],week:['هفته','Week'],month:['ماه','Month']};
let view='all',offset=0,search='',kindFilter='',accountFilter='',categoryFilter='',transactionFilter='';
const en=()=>document.documentElement.lang==='en';
function parts(formatter,date){
 const p=Object.fromEntries(formatter.formatToParts(date).filter(x=>['year','month','day'].includes(x.type)).map(x=>[x.type,Number(x.value)]));
 return p.year&&p.month&&p.day?p:null;
}
function parseDate(raw){
 if(!raw)return null;
 let value=raw;
 if(typeof value==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(value))value+='T12:00:00+03:30';
 const d=new Date(value);
 return Number.isFinite(d.getTime())?d:null;
}
function dayIndex(date){
 const p=parts(greg,date);
 return p?Math.floor(Date.UTC(p.year,p.month-1,p.day)/86400000):null;
}
function dayDate(day){return new Date(day*86400000+12*3600000)}
function solarDate(date,withWeekday=false){
 if(!date)return en()?'Unknown date':'تاریخ نامشخص';
 const p=parts(persian,date);
 if(!p)return en()?'Unknown date':'تاریخ نامشخص';
 if(en())return new Intl.DateTimeFormat('en-GB',{timeZone:'Asia/Tehran',day:'numeric',month:'short',year:'numeric'}).format(date);
 const text=faNums(p.day)+' '+months[p.month]+' '+faNums(p.year);
 return withWeekday?weekday.format(date)+'، '+text:text;
}
function monthNumber(date){const p=parts(persian,date);return p?p.year*12+p.month-1:null}
function normal(value){
 return String(value??'').toLowerCase()
  .replace(/[۰-۹]/g,d=>String('۰۱۲۳۴۵۶۷۸۹'.indexOf(d)))
  .replace(/[٠-٩]/g,d=>String('٠١٢٣٤٥٦٧٨٩'.indexOf(d)))
  .replace(/[يى]/g,'ی').replace(/ك/g,'ک').replace(/[\u064b-\u065f]/g,'')
  .replace(/[\u200c٬،,\-_/]/g,' ').replace(/\s+/g,' ').trim();
}
function periodContext(){
 const now=new Date(),today=dayIndex(now),month=monthNumber(now);
 const dayOfWeek=new Date(today*86400000).getUTCDay();
 return {today,month,weekStart:today-((dayOfWeek+1)%7)};
}
function inPeriod(date,context){
 if(view==='all')return true;
 if(!date)return false;
 const day=dayIndex(date);
 if(view==='day')return day===context.today+offset;
 if(view==='week')return day>=context.weekStart+offset*7&&day<context.weekStart+(offset+1)*7;
 return monthNumber(date)===context.month+offset;
}
function periodLabel(context){
 if(view==='all')return en()?'All dates':'تمام تاریخ‌ها';
 if(view==='day')return solarDate(dayDate(context.today+offset),true);
 if(view==='week'){
  const begin=dayDate(context.weekStart+offset*7),end=dayDate(context.weekStart+offset*7+6);
  return solarDate(begin)+' – '+solarDate(end);
 }
 const index=context.month+offset,year=Math.floor(index/12),month=((index%12)+12)%12+1;
 return en()?('Persian month '+month+' / '+year):(months[month]+' '+faNums(year));
}
function searchText(t,accounts,date){
 const account=accounts.find(a=>a.id===t.account);
 const kind=t.kind==='income'?'درآمد income':t.kind==='expense'?'هزینه expense':t.kind==='investment'?'سرمایه‌گذاری investment':'انتقال transfer';
 const gregDate=date?parts(greg,date):null;
 const dateText=gregDate?gregDate.year+'-'+String(gregDate.month).padStart(2,'0')+'-'+String(gregDate.day).padStart(2,'0'):'';
 return normal([kind,t.category,t.memo,t.scope,t.status,t.amount,number.format(t.amount),
  t.currency,account?.name,t.accountName,solarDate(date),dateText].join(' '));
}
function row(t,accounts,date,expanded=false){
 const account=accounts.find(a=>a.id===t.account);
 const kind=t.kind==='income'?'income':t.kind==='expense'?'expense':t.kind==='investment'?'investment':'other';
 const type=t.kind==='investment'&&/قرض/.test(t.category||'')?(en()?'Loan paid':'پرداخت اصل قرض'):en()?({income:'Income',expense:'Expense',investment:'Investment',transfer:'Transfer'}[t.kind]||'Transaction'):({income:'درآمد',expense:'هزینه',investment:'سرمایه‌گذاری',transfer:'انتقال'}[t.kind]||'تراکنش');
 const status=t.status==='pending'?(en()?'Pending':'در انتظار پرداخت'):t.status==='cancelled'?(en()?'Cancelled':'لغوشده'):'';
 const title=String(t.category||type).trim();
 const currency=t.currency||account?.currency||'';
 const sign=['expense','investment'].includes(kind)?'−':kind==='income'?'+':'';
 const accountName=account?.name||t.accountName||'';
 const amount=number.format(Number(t.amount)||0);
 const dateText=solarDate(date,true);
 return '<details class="tx-ledger-item"'+(expanded?' open':'')+'><summary class="tx-ledger-summary">'
  +'<div class="tx-ledger-top"><div class="tx-ledger-heading"><span class="tx-ledger-type tx-'+kind+'">'+esc(type)+'</span><strong>'+esc(title)+'</strong></div>'
  +'<strong class="tx-ledger-amount tx-'+kind+'" dir="ltr">'+sign+esc(amount)+' <small>'+esc(currency)+'</small></strong></div>'
  +'<div class="tx-ledger-meta"><span>📅 '+esc(dateText)+'</span>'
  +(accountName?'<span>· '+esc(accountName)+'</span>':'')
  +(status?'<span>· '+esc(status)+'</span>':'')+'</div>'
  +'<span class="tx-expand-hint">'+(en()?'Details':'جزئیات')+' ‹</span></summary>'
  +'<div class="tx-ledger-detail"><div><span>'+(en()?'Account':'حساب')+'</span><strong>'+esc(accountName|| (en()?'Unassigned':'حساب نامشخص'))+'</strong></div>'
  +'<div><span>'+(en()?'Type':'نوع تراکنش')+'</span><strong>'+esc(type)+'</strong></div>'
  +'<div><span>'+(en()?'Category':'دسته‌بندی')+'</span><strong>'+esc(title)+'</strong></div>'
  +'<div><span>'+(en()?'Status':'وضعیت')+'</span><strong>'+esc(status|| (en()?'Completed':'ثبت‌شده'))+'</strong></div>'
  +(t.memo?'<p>'+esc(t.memo)+'</p>':'')+'</div></details>';
}
function renderHistory(){
 const data=bridge.getData();
 const accounts=data.accounts||[],all=(data.tx||[]).filter(t=>t.status!=='cancelled'),context=periodContext(),needle=normal(search);
 const selected=all.map((t,i)=>({t,i,date:parseDate(t.date||t.occurredAt)}))
  .filter(({t,date})=>inPeriod(date,context)&&(!kindFilter||t.kind===kindFilter)&&(!accountFilter||t.account===accountFilter)&&(!categoryFilter||normal(t.category)===normal(categoryFilter))&&(!transactionFilter||t.id===transactionFilter)&&(!needle||searchText(t,accounts,date).includes(needle)))
  .sort((a,b)=>(b.date?.getTime()||0)-(a.date?.getTime()||0)||b.i-a.i);
 holder.innerHTML=selected.length?selected.map(({t,date})=>row(t,accounts,date,t.id===transactionFilter)).join(''):
  '<div class="tx-ledger-empty">'+(en()?'No transactions match the selected period or search.':'تراکنشی برای این بازه یا عبارت جست‌وجو پیدا نشد.')+'</div>';
 const count=byId('tx-results-count');
 if(count)count.textContent=en()?selected.length+' of '+all.length+' transactions':faNums(selected.length)+' از '+faNums(all.length)+' تراکنش';
 const period=byId('tx-period-label');if(period)period.textContent=periodLabel(context);
 const nav=byId('tx-period-nav');if(nav)nav.hidden=view==='all';
 const next=byId('tx-period-next');if(next)next.disabled=offset>=0;
 const entry=byId('tx-entry-date');if(entry)entry.textContent=(en()?'Entry date: ':'تاریخ ثبت: ')+solarDate(new Date(),true);
 document.querySelectorAll('[data-tx-range]').forEach(button=>{
  const active=button.dataset.txRange===view;
  button.setAttribute('aria-pressed',String(active));
  button.textContent=labels[button.dataset.txRange][en()?1:0];
 });
 const searchBox=byId('tx-search');
 if(searchBox)searchBox.placeholder=en()?'Search transactions, amount, category…':'جست‌وجوی مبلغ، دسته‌بندی، نام، توضیح…';
 const summary=byId('tx-active-filter'),summaryText=byId('tx-active-filter-text');
 if(summary&&summaryText){
  const accountName=accounts.find(a=>a.id===accountFilter)?.name||'';
  const filters=[kindFilter?(kindFilter==='income'?(en()?'Income':'درآمد'):(en()?'Expenses':'هزینه‌ها')):'',
   categoryFilter,accountName,transactionFilter?(en()?'Selected transaction':'تراکنش انتخاب‌شده'):''].filter(Boolean);
  summary.hidden=!filters.length;summaryText.textContent=(en()?'Filter: ':'فیلتر: ')+filters.join(' · ');
 }
}
document.querySelectorAll('[data-tx-range]').forEach(button=>{
 button.addEventListener('click',()=>{view=button.dataset.txRange;offset=0;renderHistory()});
});
byId('tx-period-prev')?.addEventListener('click',()=>{offset--;renderHistory()});
byId('tx-period-next')?.addEventListener('click',()=>{if(offset<0){offset++;renderHistory()}});
byId('tx-search')?.addEventListener('input',event=>{search=event.target.value;renderHistory()});
function openFiltered(opts={}){
 view=['all','day','week','month'].includes(opts.period)?opts.period:'all';
 offset=0;search='';kindFilter=['income','expense','investment'].includes(opts.kind)?opts.kind:'';
 accountFilter=String(opts.accountId||'');categoryFilter=String(opts.category||'');
 transactionFilter=String(opts.transactionId||'');
 if(byId('tx-search'))byId('tx-search').value='';
 if(typeof window.financeNavGo==='function')window.financeNavGo('transactions');
 renderHistory();
 requestAnimationFrame(()=>document.querySelector('.tx-history-card')?.scrollIntoView({block:'start',behavior:'smooth'}));
}
byId('tx-filter-reset')?.addEventListener('click',()=>openFiltered());
window.MyFinanceHistory={openFiltered,renderHistory};
window.renderTransactionHistory=renderHistory;
document.addEventListener('myfinance:changed',renderHistory);
document.addEventListener('myfinance:cloud-synced',renderHistory);
document.addEventListener('myfinance:rebound',renderHistory);
renderHistory();
})();