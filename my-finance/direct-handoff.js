/* My Finance: optional one-tap ChatGPT-to-preview link; no API costs. */
(()=>{
'use strict';
const prefix='#finance-direct=';
const dateToday=()=>{const d=new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Tehran',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(new Date());const p=k=>d.find(x=>x.type===k)?.value;return p('year')+'-'+p('month')+'-'+p('day')};
const norm=s=>String(s||'').replace(/[-_]+/g,' ').trim();
function parse(value){
 if(!value||value.length>1500)throw Error('طول لینک نامعتبر است.');
 const p=new URLSearchParams(value);
 const action=p.get('action')||'',amountText=p.get('amount')||'',currency=p.get('currency')||'IRT';
 if(!['loan_given','income','expense'].includes(action))throw Error('نوع تراکنش پشتیبانی نمی‌شود.');
 if(!/^\d{1,13}(?:\.\d{1,2})?$/.test(amountText))throw Error('مبلغ مشخص نیست.');
 if(!['IRT','IRR','USD','EUR'].includes(currency))throw Error('واحد پول درست نیست.');
 const amount=Number(amountText),date=p.get('date')||dateToday();
 if(!Number.isFinite(amount)||amount<=0)throw Error('مبلغ درست نیست.');
 if(!/^\d{4}-\d{2}-\d{2}$/.test(date)||date>dateToday()||!Number.isFinite(Date.parse(date+'T12:00:00+03:30')))throw Error('تاریخ معتبر نیست.');
 const person=norm(p.get('person')).slice(0,120),account=norm(p.get('account')).slice(0,100);
 const category=norm(p.get('category')).slice(0,140)||(action==='loan_given'?'قرض پرداختی':'سایر');
 const memo=norm(p.get('memo')).slice(0,450)||(action==='loan_given'?'قرض به '+(person||'شخص نامشخص'):'ثبت مالی از ChatGPT');
 return {transcript:memo,result:{action,amount,currency,person,account_name:account,occurred_on:date,category,memo,needs_clarification:false,question:'',confidence:1}};
}
function open(){
 if(!location.hash.startsWith(prefix))return;
 if(!document.body.classList.contains('finance-unlocked')||!window.MyFinanceCloud?.authenticated?.())return;
 const source=location.hash.slice(prefix.length);
 history.replaceState(null,'',location.pathname+location.search);
 try{
  const item=parse(source);
  window.MyFinanceVoiceEntry.applyAI(item);
  document.getElementById('voice-status').textContent='لینک دریافت شد؛ مبلغ، حساب و سرفصل را بررسی و سپس تأیید کنید.';
 }catch(e){
  const out=document.getElementById('voice-status');
  out.textContent='لینک نامعتبر: '+String(e.message||e)+'؛ هیچ تراکنشی ثبت نشد.';
 }
}
window.addEventListener('hashchange',open);
document.addEventListener('myfinance:unlocked',open);
setTimeout(open,0);
window.MyFinanceDirectHandoff={parse,open};
})();