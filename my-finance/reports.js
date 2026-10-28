/* My Finance reports — currency-safe cashflow, expense categories and receivable summaries */
(()=>{
const bridge=window.MyFinanceBridge,$=id=>document.getElementById(id);
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const fmt=n=>new Intl.NumberFormat('fa-IR',{maximumFractionDigits:2}).format(Number(n)||0);
const currency=t=>t.currency||bridge.getData().accounts.find(a=>a.id===t.account)?.currency||'IRT';
const card=(label,value,unit)=>'<div class="finance-stat"><span>'+esc(label)+'</span><strong>'+fmt(value)+'</strong><small>'+esc(unit)+'</small></div>';
const box=$('report');box.hidden=true;
const panel=document.createElement('div');panel.id='finance-report-dashboard';panel.setAttribute('aria-live','polite');box.after(panel);
function render(){
 const data=bridge.getData(),posted=(data.tx||[]).filter(t=>['expense','income'].includes(t.kind)&&!['pending','cancelled'].includes(t.status));
 const currencies=[...new Set([...posted.map(currency),...(data.receivables||[]).map(r=>r.currency)])].filter(Boolean).sort();
 if(!currencies.length){panel.innerHTML='<p class="muted">هنوز تراکنش یا سرمایه‌گذاری ثبت نشده است. گزارش پس از ثبت اولین داده ساخته می‌شود.</p>';return}
 let output='';
 for(const cur of currencies){
  const tx=posted.filter(t=>currency(t)===cur);
  const income=tx.filter(t=>t.kind==='income').reduce((s,t)=>s+Number(t.amount||0),0);
  const expense=tx.filter(t=>t.kind==='expense').reduce((s,t)=>s+Number(t.amount||0),0);
  const receivables=(data.receivables||[]).filter(r=>r.currency===cur&&r.status!=='paid');
  const expected=receivables.reduce((s,r)=>s+Math.max(0,Number(r.expected||0)-Number(r.receivedAmount||0)),0);
  output+='<div class="report-unit"><h3>گزارش '+esc(cur)+'</h3><div class="report-overview">'+card('درآمد محقق‌شده',income,cur)+card('هزینه پرداخت‌شده',expense,cur)+card('خالص جریان نقد',income-expense,cur)+card('مطالبات و بازگشت سرمایه',expected,cur)+'</div>';
  const cats=new Map();
  for(const t of tx.filter(t=>t.kind==='expense'))cats.set(t.category||'سایر',(cats.get(t.category||'سایر')||0)+Number(t.amount));
  const sorted=[...cats].sort((a,b)=>b[1]-a[1]).slice(0,7);
  if(sorted.length){
   const max=sorted[0][1]||1;
   output+='<h4>بیشترین هزینه‌ها</h4><div class="expense-categories">'+sorted.map(([name,value])=>'<div class="expense-row"><div class="row"><span>'+esc(name)+'</span><strong>'+fmt(value)+' '+esc(cur)+'</strong></div><div class="expense-track"><span style="width:'+Math.max(2,Math.round(value/max*100))+'%"></span></div></div>').join('')+'</div>';
  }
  const months=[...new Set(tx.map(t=>String(t.date||'').slice(0,7)).filter(m=>/^\d{4}-\d{2}$/.test(m)))].sort().reverse().slice(0,6).reverse();
  if(months.length){
   output+='<h4>جریان نقد ماهانه</h4><div class="scroll"><table class="report-table"><thead><tr><th>ماه</th><th>درآمد</th><th>هزینه</th><th>خالص</th></tr></thead><tbody>';
   for(const month of months){
    const rows=tx.filter(t=>String(t.date||'').slice(0,7)===month);
    const inc=rows.filter(t=>t.kind==='income').reduce((s,t)=>s+Number(t.amount),0);
    const exp=rows.filter(t=>t.kind==='expense').reduce((s,t)=>s+Number(t.amount),0);
    const date=new Date(month+'-15T12:00:00Z');
    output+='<tr><td>'+esc(date.toLocaleDateString('fa-IR',{year:'numeric',month:'long',timeZone:'Asia/Tehran'}))+'</td><td>'+fmt(inc)+'</td><td>'+fmt(exp)+'</td><td>'+fmt(inc-exp)+'</td></tr>';
   }
   output+='</tbody></table></div>';
  }
  output+='</div>';
 }
 const pending=(data.tx||[]).filter(t=>t.status==='pending').length;
 const commitments=(data.commitments||[]).filter(c=>c.active).length;
 output+='<p class="muted">تعهدات فعال: '+fmt(commitments)+' · تراکنش‌های در انتظار: '+fmt(pending)+' · تعداد کل تراکنش‌های قطعی: '+fmt(posted.length)+'</p>';
 panel.innerHTML=output;
}
document.addEventListener('myfinance:changed',render);
document.addEventListener('myfinance:rebound',render);
render();
})();