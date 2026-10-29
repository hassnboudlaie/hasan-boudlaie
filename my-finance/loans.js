/* My Finance · private loan portfolio. Financial figures are loaded from the user's private data only. */
(()=>{
'use strict';
const bridge=window.MyFinanceBridge;
if(!bridge||!document.getElementById('reports'))return;
const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const fmt=n=>new Intl.NumberFormat('fa-IR',{maximumFractionDigits:1}).format(Number(n)||0);
const toman=irr=>fmt(Number(irr||0)/10)+' تومان';
const section=document.createElement('section');
section.id='loans';section.hidden=true;
section.innerHTML='<div class="card"><h2>💳 وام‌ها و بدهی‌ها</h2><p class="muted">مانده‌های اعلام‌شده توسط بانک، برنامه اقساط و تعهدات آتی؛ پرداخت‌های گذشته مجدداً از حساب کسر نمی‌شوند.</p><div id="loans-overview" class="loan-summary"></div></div><div id="loans-items"></div>';
document.getElementById('reports').insertAdjacentElement('beforebegin',section);
// The main router is a global lexical binding in index.html; register the dynamically-created section.
if(typeof financeRoutes!=='undefined')financeRoutes.add('loans');
// Keep loans reachable on desktop, tablet and mobile (the legacy .tabs row is hidden at those breakpoints).
const sidebar=document.querySelector('.finance-side-links');
if(sidebar&&!sidebar.querySelector('[data-finance-route="loans"]')){
 const sideButton=document.createElement('button');
 sideButton.type='button';sideButton.dataset.financeRoute='loans';sideButton.setAttribute('aria-current','false');
 sideButton.innerHTML='<span aria-hidden="true">◷</span><span data-fa="وام‌ها و اقساط" data-en="Loans & Installments">وام‌ها و اقساط</span>';
 sideButton.addEventListener('click',()=>financeNavGo('loans'));
 const before=sidebar.querySelector('[data-finance-route="reports"]');
 sidebar.insertBefore(sideButton,before||null);
}
const moreLinks=document.querySelector('.finance-more-links');
if(moreLinks&&!moreLinks.querySelector('[data-loans-more]')){
 const moreButton=document.createElement('button');
 moreButton.type='button';moreButton.dataset.loansMore='1';moreButton.textContent='◷ وام‌ها و اقساط';
 moreButton.addEventListener('click',()=>financeNavGo('loans'));
 moreLinks.insertBefore(moreButton,moreLinks.querySelector('button')||null);
}
const nav=document.querySelector('.tabs');
const btn=document.createElement('button');btn.className='alt';btn.textContent='وام‌ها';
btn.setAttribute('onclick',"financeNavGo('loans')");btn.setAttribute('data-finance-route','loans');btn.setAttribute('data-fa','وام‌ها و اقساط');btn.setAttribute('data-en','Loans & Installments');
if(nav){const reportButton=[...nav.querySelectorAll('button')].find(b=>b.getAttribute('onclick')==="tab('reports')");nav.insertBefore(btn,reportButton||null);}
const style=document.createElement('style');
style.textContent=`
.loan-summary{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px;margin-top:14px}
.loan-stat{padding:14px;background:var(--bg);border:1px solid var(--line);border-radius:15px}
.loan-stat strong{display:block;font-size:21px;font-weight:800;line-height:1.5;font-variant-numeric:tabular-nums;color:var(--fg)}
.loan-stat span,.loan-stat small{display:block;color:var(--muted);font-size:12px}
.loan-item{margin-top:12px}
.loan-head{display:flex;align-items:start;justify-content:space-between;gap:14px;flex-wrap:wrap}
.loan-head h3{font-size:17px;margin:0}
.loan-pill{border:1px solid var(--line);border-radius:50px;color:var(--muted);padding:4px 9px;font-size:12px}
.loan-metrics{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px;margin-top:13px}
.loan-metrics>div{padding:10px;background:var(--bg);border-radius:12px}
.loan-metrics small{color:var(--muted);display:block;font-size:12px}
.loan-metrics b{display:block;font-size:16px;font-weight:700;margin-top:4px}
.loan-progress{height:7px;border-radius:20px;background:var(--line);overflow:hidden;margin:15px 0 8px}
.loan-progress>i{display:block;height:100%;background:var(--accent);border-radius:20px}
.loan-schedule{border-top:1px solid var(--line);padding-top:12px;margin-top:12px}
.loan-schedule summary{cursor:pointer;color:var(--accent);font-weight:700}
.loan-schedule table{margin-top:9px;font-size:13px}
@media(max-width:390px){.loan-summary,.loan-metrics{grid-template-columns:1fr}.loan-stat strong{font-size:19px}}
`;
style.textContent+=`
.loan-reminder-banner{display:flex;align-items:center;justify-content:space-between;gap:14px;flex-wrap:wrap;margin:12px 0 19px;padding:17px 20px;border-radius:18px;background:var(--card);border:1px solid var(--line);color:var(--fg);box-shadow:0 5px 20px rgba(13,46,58,.055)}
.loan-reminder-banner[hidden]{display:none!important}
.loan-reminder-banner .loan-reminder-copy{flex:1;min-width:220px}
.loan-reminder-banner strong{font-size:17px;display:block;font-weight:850}
.loan-reminder-banner p{margin:5px 0 0;font-size:14px;line-height:1.95}
.loan-reminder-banner button{flex-shrink:0;white-space:nowrap;min-height:43px;padding:9px 13px}
.loan-reminder-banner.loan-alert-orange{background:#fff0d6!important;border:2px solid #f2a12b!important;color:#703b06!important;box-shadow:0 9px 26px rgba(183,107,24,.14)}
.loan-reminder-banner.loan-alert-red{background:#fff0ef!important;border:2px solid #d74545!important;color:#8a1e23!important;box-shadow:0 9px 26px rgba(166,38,38,.16)}
.loan-reminder-banner.loan-alert-orange strong,.loan-reminder-banner.loan-alert-red strong{font-size:19px}
body.dark .loan-reminder-banner.loan-alert-orange{background:#473119!important;color:#ffe0ab!important}
body.dark .loan-reminder-banner.loan-alert-red{background:#492127!important;color:#ffe3e3!important}
@media(max-width:600px){.loan-reminder-banner{padding:15px 14px;gap:10px}.loan-reminder-banner strong{font-size:16px}.loan-reminder-banner.loan-alert-orange strong,.loan-reminder-banner.loan-alert-red strong{font-size:17px}.loan-reminder-banner button{width:100%}}
`;
document.head.appendChild(style);
// Place the status inside #home, not directly under <main>; only the home view should show it.
const reminder=document.createElement('div');
reminder.id='loan-due-notice';reminder.className='loan-reminder-banner';reminder.hidden=true;
reminder.innerHTML='<div class="loan-reminder-copy"><strong id="loan-reminder-title"></strong><p id="loan-reminder-detail"></p></div><button type="button" id="loan-reminder-open">مشاهده اقساط</button>';
document.querySelector('#home .finance-home-heading')?.insertAdjacentElement('afterend',reminder);
document.getElementById('loan-reminder-open')?.addEventListener('click',()=>financeNavGo('loans'));
const persianDate=new Intl.DateTimeFormat('en-US-u-ca-persian',{timeZone:'Asia/Tehran',year:'numeric',month:'2-digit',day:'2-digit'});
function nextJalali(daysAhead){
 const parts=persianDate.formatToParts(new Date(Date.now()+daysAhead*86400000));
 const p=k=>parts.find(x=>x.type===k)?.value||'0';
 return p('year')+'/'+p('month').padStart(2,'0')+'/'+p('day').padStart(2,'0');
}
function dueReminders(loans){
 const today=nextJalali(0),upcoming=[],overdue=[],later=[];
 for(const loan of loans){
  const due=String(loan.nextDueJalali||'').replace(/-/g,'/');
  if(!/^\d{4}[/]\d{2}[/]\d{2}$/.test(due))continue;
  const amount=(loan.currency==='IRR'?toman(loan.installment):fmt(loan.installment)+' '+(loan.currency==='IRT'?'تومان':loan.currency||''));
  const title=String(loan.title||'وام');
  const days=Array.from({length:6},(_,i)=>i).find(i=>nextJalali(i)===due);
  const item={title,due,amount,days};
  if(days!==undefined)upcoming.push(item);
  else if(due<today)overdue.push(item);
  else later.push(item);
 }
 reminder.hidden=loans.length===0;
 if(reminder.hidden)return;
 const critical=overdue.length>0||upcoming.some(x=>x.days<=1);
 const warning=upcoming.some(x=>x.days>=2&&x.days<=5);
 reminder.classList.toggle('loan-alert-red',critical);
 reminder.classList.toggle('loan-alert-orange',!critical&&warning);
 const title=document.getElementById('loan-reminder-title');
 const detail=document.getElementById('loan-reminder-detail');
 if(critical||warning){
  const messages=overdue.map(x=>x.title+' · سررسید گذشته '+x.due+' · '+x.amount).concat(
   upcoming.map(x=>x.title+' · '+(x.days===0?'امروز':x.days+' روز تا سررسید')+' · '+x.amount));
  title.textContent=critical?'🔴 هشدار مهم سررسید اقساط':'🟠 یادآوری پرداخت اقساط';
  detail.textContent=messages.slice(0,3).join(' | ')+(messages.length>3?' · و '+fmt(messages.length-3)+' مورد دیگر':'');
  reminder.setAttribute('role','alert');
 }else{
  const nearest=later.sort((x,y)=>x.due.localeCompare(y.due))[0];
  title.textContent='📅 برنامه اقساط شما فعال است';
  detail.textContent=nearest?'نزدیک‌ترین سررسید: '+nearest.due+' · '+nearest.title+' · '+nearest.amount+'؛ هشدار رنگی از ۵ روز قبل ظاهر می‌شود.':'فعلاً سررسید معتبری برای وام‌های فعال ثبت نشده است.';
  reminder.setAttribute('role','status');
 }
}
function dueSchedule(loan){
 const due=String(loan.nextDueJalali||'');
 const match=due.match(/^(\d{4})\/(\d{2})\/(\d{2})$/);
 if(!match)return '';
 const paid=Math.max(0,Number(loan.paidInstallments)||0);
 const total=Math.max(0,Number(loan.totalInstallments)||0);
 let y=Number(match[1]),m=Number(match[2]),day=Number(match[3]),rows='';
 for(let n=paid+1;n<=Math.min(total,paid+24);n++){
  const date=[y,String(m).padStart(2,'0'),String(day).padStart(2,'0')].join('/');
  rows+='<tr><td>قسط '+fmt(n)+'</td><td>'+esc(date)+'</td><td>'+toman(loan.installment)+'</td><td>در انتظار</td></tr>';
  m++;if(m>12){m=1;y++;}
 }
 return '<details class="loan-schedule"><summary>برنامه اقساط باقیمانده</summary><div class="scroll"><table><thead><tr><th>شماره</th><th>سررسید شمسی</th><th>مبلغ</th><th>وضعیت</th></tr></thead><tbody>'+rows+'</tbody></table></div><p class="muted">برنامه ماهانه بر اساس روز سررسید تصویر بازسازی شده است؛ در صورت تغییر برنامه توسط بانک، اطلاعات بانک ملاک است.</p></details>';
}
function render(){
 const data=bridge.getData(),loans=(data.loans||[]).filter(l=>l.status!=='closed');
 const summary=document.getElementById('loans-overview'),list=document.getElementById('loans-items');
 dueReminders(loans);
 if(!summary||!list)return;
 if(!loans.length){
  summary.innerHTML='<p class="muted">هنوز وامی ثبت نشده است.</p>';
  list.innerHTML='';return;
 }
 const irr=loans.filter(l=>l.currency==='IRR');
 const outstanding=irr.reduce((s,l)=>s+Number(l.outstanding||0),0);
 const monthly=irr.reduce((s,l)=>s+Number(l.installment||0),0);
 const next=[...loans].filter(l=>l.nextDueJalali).sort((a,b)=>a.nextDueJalali.localeCompare(b.nextDueJalali))[0];
 summary.innerHTML='<div class="loan-stat"><span>مانده بدهی ثبت‌شده</span><strong>'+toman(outstanding)+'</strong><small>بر اساس آخرین تصویر بانک</small></div>'+
 '<div class="loan-stat"><span>جمع اقساط ماهانه</span><strong>'+toman(monthly)+'</strong><small>به‌صورت تعهد؛ نه هزینه پرداخت‌شده</small></div>'+
 '<div class="loan-stat"><span>تعداد وام‌های فعال</span><strong>'+fmt(loans.length)+'</strong><small>قرارداد مستقل</small></div>'+
 '<div class="loan-stat"><span>نزدیک‌ترین سررسید</span><strong>'+esc(next?.nextDueJalali||'—')+'</strong><small>تقویم شمسی</small></div>';
 list.innerHTML=[...loans].sort((a,b)=>String(a.nextDueJalali).localeCompare(String(b.nextDueJalali))).map(l=>{
  const paid=Math.max(0,Number(l.paidInstallments)||0),total=Math.max(1,Number(l.totalInstallments)||12);
  return '<div class="card loan-item"><div class="loan-head"><div><h3>'+esc(l.title||'وام')+'</h3><p class="muted">بلو · '+esc(l.loanType==='guarantor'?'با ضامن':'با وثیقه')+'</p></div><span class="loan-pill">'+fmt(paid)+' از '+fmt(total)+' پرداخت‌شده</span></div>'+
  '<div class="loan-progress" aria-label="پیشرفت اقساط"><i style="width:'+Math.min(100,Math.round(paid/total*100))+'%"></i></div>'+
  '<div class="loan-metrics"><div><small>مانده اعلام‌شده توسط بانک</small><b>'+toman(l.outstanding)+'</b></div>'+
  '<div><small>قسط بعدی</small><b>'+toman(l.installment)+'</b></div>'+
  '<div><small>سررسید بعدی</small><b>'+esc(l.nextDueJalali||'—')+'</b></div>'+
  '<div><small>اصل وام</small><b>'+toman(l.principal)+'</b></div></div>'+
  dueSchedule(l)+'</div>';
 }).join('');
}
document.addEventListener('myfinance:changed',render);
document.addEventListener('myfinance:rebound',render);
document.addEventListener('visibilitychange',()=>{if(!document.hidden)render()});
setInterval(()=>{if(!document.hidden)render()},3600000);
render();
})();