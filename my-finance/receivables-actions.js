/* My Finance · partial/full receivable settlement, without assuming cash arrived in an account */
(()=>{
const bridge=window.MyFinanceBridge,$=id=>document.getElementById(id);
const money=n=>new Intl.NumberFormat('fa-IR',{maximumFractionDigits:2}).format(Number(n)||0);
function renderActions(){
 const data=bridge.getData(),items=[...(data.receivables||[])].reverse();
 const cards=$('rcvlist')?.querySelectorAll('.notice')||[];
 cards.forEach((card,index)=>{
  const r=items[index];if(!r||r.status==='paid'||r.expected==null||card.querySelector('button[data-rcv]'))return;
  const remain=Math.max(0,Number(r.expected||0)-Number(r.receivedAmount||0));
  const button=document.createElement('button');button.className='alt';
  button.dataset.rcv=r.id;button.textContent='ثبت وصول ('+money(remain)+' '+r.currency+')';
  button.style.marginTop='7px';card.append(button);
 });
}
$('rcvlist').addEventListener('click',event=>{
 const button=event.target.closest('button[data-rcv]');if(!button)return;
 const data=bridge.getData(),r=data.receivables.find(x=>x.id===button.dataset.rcv);
 if(!r||r.status==='paid'||r.expected==null)return;
 const remaining=Math.max(0,Number(r.expected||0)-Number(r.receivedAmount||0));
 const raw=prompt('مبلغ دریافت‌شده را به '+r.currency+' وارد کنید. مانده قابل وصول: '+money(remaining),String(remaining));
 if(raw===null)return;
 const amount=Number(raw.replace(/[۰-۹]/g,c=>'۰۱۲۳۴۵۶۷۸۹'.indexOf(c)).replace(/,/g,''));
 if(!Number.isFinite(amount)||amount<=0||amount>remaining)return alert('مبلغ وصول معتبر نیست.');
 if(!confirm('دریافت '+money(amount)+' '+r.currency+' از '+r.counterparty+' ثبت شود؟ این عملیات به‌خودی‌خود موجودی هیچ حسابی را تغییر نمی‌دهد.'))return;
 r.receivedAmount=Number(r.receivedAmount||0)+amount;
 r.status=(Number(r.expected)-r.receivedAmount)<0.000001?'paid':'partial';
 r.lastReceivedAt=new Date().toISOString();
 if(r.status==='paid')r.paidAt=r.lastReceivedAt;
 bridge.commitData(data);
});
document.addEventListener('myfinance:changed',renderActions);
document.addEventListener('myfinance:rebound',renderActions);
renderActions();
})();