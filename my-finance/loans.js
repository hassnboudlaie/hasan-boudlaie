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
const nav=document.querySelector('.tabs');
const btn=document.createElement('button');btn.className='alt';btn.textContent='وام‌ها';
btn.setAttribute('onclick',"tab('loans')");btn.setAttribute('data-fa','وام‌ها');btn.setAttribute('data-en','Loans');
const reportButton=[...nav.querySelectorAll('button')].find(b=>b.getAttribute('onclick')==="tab('reports')");
nav.insertBefore(btn,reportButton||null);
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
#loan-due-notice:not([hidden]){display:block!important;position:relative;z-index:3;margin:12px 0 20px;padding:22px 24px;border-radius:18px;background:#fff0d6;color:#713b06;border:2px solid #f5a623;box-shadow:0 8px 26px rgba(177,102,12,.15);font-size:17px;font-weight:800;line-height:1.9;white-space:normal}
#loan-due-notice.loan-alert-critical:not([hidden]){background:#fff0ef;color:#8b1d20;border-color:#dc4848;box-shadow:0 8px 26px rgba(180,35,35,.14)}
body.dark #loan-due-notice:not([hidden]){background:#4b341b;color:#ffe0a7}
body.dark #loan-due-notice.loan-alert-critical:not([hidden]){background:#4c2328;color:#ffd5d5}
@media(max-width:600px){#loan-due-notice:not([hidden]){font-size:15px;padding:18px}}
`;
document.head.appendChild(style);
const reminder=document.createElement('div');reminder.id='loan-due-notice';reminder.className='upcoming-notice';reminder.hidden=true;
document.querySelector('main')?.insertAdjacentElement('afterbegin',reminder);
const persianDate=new Intl.DateTimeFormat('en-US-u-ca-persian',{timeZone:'Asia/Tehran',year:'numeric',month:'2-digit',day:'2-digit'});
function nextJalali(daysAhead){
 const parts=persianDate.formatToParts(new Date(Date.now()+daysAhead*86400000));
 const p=k=>parts.find(x=>x.type===k)?.value||'0';
 return p('year')+'/'+p('month').padStart(2,'0')+'/'+p('day').padStart(2,'0');
}
function dueReminders(loans){
 const today=nextJalali(0),notices=[];let overdue=false,urgent=false;
 for(const loan of loans){
  const due=String(loan.nextDueJalali||'');
  if(!due)continue;
  const d=Array.from({length:6},(_,i)=>i).find(offset=>nextJalali(offset)===due);
  if(d!==undefined){if(d<=1)urgent=true;notices.push((loan.title||'وام')+' · '+(d===0?'امروز':d+' روز تا سررسید')+' · '+toman(loan.installment));}
  else if(due<today){overdue=true;notices.push((loan.title||'وام')+' · سررسید گذشته؛ وضعیت پرداخت را بررسی کنید');}
 }
 reminder.hidden=notices.length===0;
 reminder.classList.toggle('loan-alert-critical',overdue||urgent);
 reminder.setAttribute('role',notices.length?'alert':'status');
 reminder.textContent=notices.length?'🔔 یادآوری مهم اقساط · '+notices.join(' | '):'';
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
render();
})();