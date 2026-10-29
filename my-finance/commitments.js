/* My Finance · recurring commitments, pending payments and in-app reminders */
(()=>{
const bridge=window.MyFinanceBridge,$=id=>document.getElementById(id);
if(!bridge||!$('reports'))return;
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const fmt=n=>new Intl.NumberFormat('fa-IR',{maximumFractionDigits:2}).format(Number(n)||0);
function today(){const p=new Intl.DateTimeFormat('en-US',{timeZone:'Asia/Tehran',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(new Date());const v=t=>p.find(x=>x.type===t).value;return v('year')+'-'+v('month')+'-'+v('day')}
const valid=s=>{if(!/^\d{4}-\d{2}-\d{2}$/.test(s))return false;const d=new Date(s+'T12:00:00Z');return !Number.isNaN(d.getTime())&&d.toISOString().slice(0,10)===s};
const days=s=>Math.round((new Date(s+'T12:00:00Z')-new Date(today()+'T12:00:00Z'))/86400000);
const jalaliFormat=new Intl.DateTimeFormat('en-US-u-ca-persian',{timeZone:'Asia/Tehran',year:'numeric',month:'numeric'});
function addDays(iso,number){
 const [y,m,d]=iso.split('-').map(Number);
 return new Date(Date.UTC(y,m-1,d+number,12)).toISOString().slice(0,10);
}
function jalaliMonthKey(iso){
 const fields=jalaliFormat.formatToParts(new Date(iso+'T12:00:00Z'));
 const part=type=>fields.find(x=>x.type===type)?.value;
 return part('year')+'/'+part('month');
}
// Find the last Gregorian date belonging to the current Persian calendar month.
// Use Tehran-local Persian calendar to handle 29/30/31-day months and leap years correctly.
function jalaliMonthEndOnOrAfter(iso){
 const key=jalaliMonthKey(iso);
 for(let offset=1;offset<=33;offset++){
  if(jalaliMonthKey(addDays(iso,offset))!==key)return addDays(iso,offset-1);
 }
 throw Error('Cannot determine Persian month end');
}
function nextJalaliMonthEnd(iso){
 const currentEnd=jalaliMonthEndOnOrAfter(iso);
 return jalaliMonthEndOnOrAfter(addDays(currentEnd,1));
}
const fdate=s=>valid(s)?new Date(s+'T12:00:00Z').toLocaleDateString('fa-IR',{timeZone:'Asia/Tehran'}):'نامشخص';
function next(iso,cadence,anchor){
 const [y,m,d]=iso.split('-').map(Number);
 if(cadence==='jalali-month-end')return nextJalaliMonthEnd(iso);
 if(cadence==='weekly')return new Date(Date.UTC(y,m-1,d+7)).toISOString().slice(0,10);
 const total=y*12+m-1+(cadence==='yearly'?12:1),yy=Math.floor(total/12),mm=total%12;
 const last=new Date(Date.UTC(yy,mm+1,0)).getUTCDate();
 return [yy,String(mm+1).padStart(2,'0'),String(Math.min(anchor||d,last)).padStart(2,'0')].join('-');
}
const sec=$('commitments')||document.createElement('section');sec.id='commitments';sec.hidden=true;
sec.innerHTML='<div class="mf-section-hero"><div><span class="mf-section-kicker">RECURRING PAYMENTS</span><h2>تعهدات و هزینه‌های ثابت</h2><p>برنامه پرداخت‌های تکراری، موارد در انتظار و تأیید پرداخت</p></div></div><div class="card"><h2>ثبت تعهد جدید</h2><p class="muted">در سررسید، هزینه با وضعیت «در انتظار پرداخت» ثبت می‌شود؛ موجودی فقط پس از تأیید پرداخت تغییر می‌کند.</p>'+
'<div class="fields"><input id="com-title" aria-label="عنوان تعهد" maxlength="120" placeholder="عنوان، مثلاً اجاره یا اشتراک"><input id="com-amount" aria-label="مبلغ تعهد" type="number" min="0.01" step="any" placeholder="مبلغ">'+
'<select id="com-currency" aria-label="ارز تعهد"><option value="IRT">تومان · IRT</option><option value="IRR">ریال · IRR</option><option value="USD">دلار · USD</option><option value="EUR">یورو · EUR</option></select>'+
'<select id="com-cadence" aria-label="دوره تکرار تعهد"><option value="monthly">ماهانه</option><option value="weekly">هفتگی</option><option value="yearly">سالانه</option><option value="jalali-month-end">ماهانه · آخر ماه شمسی</option></select>'+
'<label>اولین سررسید (میلادی)<input id="com-due" type="date"></label><label>روزهای یادآوری قبل از سررسید<input id="com-reminders" value="7,5,3,1,0" dir="ltr"></label>'+
'<select id="com-account" aria-label="حساب پرداخت‌کننده"><option value="">حساب نامشخص</option></select><input id="com-category" aria-label="دسته‌بندی تعهد" placeholder="دسته‌بندی"></div><button id="com-create">افزودن تعهد</button></div>'+
'<div class="card"><h2>پرداخت‌های در انتظار</h2><div id="com-pending"></div></div>'+
'<div class="card"><h2>برنامه تعهدات</h2><div id="com-list"></div><p class="muted">یادآوری‌ها هنگام باز بودن اپ نمایش داده می‌شوند؛ اعلان زمان بسته بودن به Push جداگانه نیاز دارد.</p></div>';
if(!sec.isConnected)$('reports').insertAdjacentElement('beforebegin',sec);
const btn=document.createElement('button');btn.className='alt';btn.textContent='تعهدات';btn.setAttribute('onclick',"tab('commitments')");document.querySelector('.tabs')?.append(btn);
$('com-due').value=today();
function commit(data){bridge.commitData(data)}
function generate(){
 const data=bridge.getData();let changed=false;
 for(const c of data.commitments||[]){
  if(!c.active||!valid(c.nextDue)||!(c.amount>0))continue;
  let n=0;
  while(days(c.nextDue)<=0&&n++<60){
   const due=c.nextDue;
   if(!data.tx.some(t=>t.recurringId===c.id&&t.dueDate===due)){
    data.tx.push({id:crypto.randomUUID(),kind:'expense',amount:Number(c.amount),currency:c.currency,
     account:c.account||null,category:c.category||'ثابت',memo:c.title,date:due+'T12:00:00Z',dueDate:due,
     recurringId:c.id,status:'pending',source:'pwa',scope:'personal'});
    changed=true;
   }
   c.nextDue=next(due,c.cadence,c.anchorDay);changed=true;
  }
 }
 if(changed)commit(data);else render();
}
function create(){
 const title=$('com-title').value.trim(),amount=Number($('com-amount').value),due=$('com-due').value;
 if(!title||!(amount>0)||!valid(due))return alert('عنوان، مبلغ و تاریخ صحیح وارد کنید.');
 const reminders=$('com-reminders').value.split(/[,،\s]+/).filter(Boolean).map(Number);
 if(reminders.some(x=>!Number.isInteger(x)||x<0||x>365)||reminders.length>12)return alert('روزهای یادآوری باید مثل 7,3,1,0 باشند.');
 const data=bridge.getData();
 const cadence=$('com-cadence').value;
 const nextDue=cadence==='jalali-month-end'?jalaliMonthEndOnOrAfter(due):due;
 data.commitments.push({id:crypto.randomUUID(),title,amount,currency:$('com-currency').value,
  cadence,nextDue,anchorDay:cadence==='jalali-month-end'?null:Number(due.slice(8,10)),calendar:cadence==='jalali-month-end'?'jalali':'gregorian',
  reminders:[...new Set(reminders)],account:$('com-account').value||null,category:$('com-category').value,
  active:true,createdAt:new Date().toISOString()});
 commit(data);$('com-title').value='';$('com-amount').value='';generate();
}
function render(){
 const data=bridge.getData(),acc=$('com-account'),old=acc.value;
 acc.innerHTML='<option value="">حساب نامشخص</option>'+(data.accounts||[]).map(a=>'<option value="'+esc(a.id)+'">'+esc(a.name)+' · '+esc(a.currency)+'</option>').join('');
 acc.value=old||'';
 const pending=(data.tx||[]).filter(t=>t.recurringId&&t.status==='pending').sort((a,b)=>(a.dueDate||'').localeCompare(b.dueDate||''));
 $('com-pending').innerHTML=pending.length?pending.map(t=>'<div class="notice" style="margin-bottom:10px"><strong>'+esc(t.memo)+'</strong> · '+fmt(t.amount)+' '+esc(t.currency)+'<p class="muted">سررسید '+fdate(t.dueDate)+'</p><button data-action="pay" data-id="'+esc(t.id)+'">تأیید پرداخت</button></div>').join(''):'<p class="muted">پرداختی در انتظار نیست.</p>';
 const cs=data.commitments||[];
 $('com-list').innerHTML=cs.length?cs.map(c=>'<div class="notice" style="margin-bottom:10px"><strong>'+esc(c.title)+'</strong> · '+fmt(c.amount)+' '+esc(c.currency)+'<p class="muted">سررسید بعدی '+fdate(c.nextDue)+' · '+(c.cadence==='weekly'?'هفتگی':c.cadence==='yearly'?'سالانه':c.cadence==='jalali-month-end'?'آخر هر ماه شمسی':'ماهانه')+' · یادآورها: '+esc((c.reminders||[]).join('، '))+'</p><button class="alt" data-action="toggle" data-id="'+esc(c.id)+'">'+(c.active?'توقف موقت':'فعال‌سازی')+'</button></div>').join(''):'<p class="muted">هنوز تعهدی ثبت نشده است.</p>';
 // Visual reminders never complete a transaction or deduct any account balance.
 const notices=[],named=new Set();let severity=0;
 const addNotice=(title,d,amount,currency,state)=>{
  const name=String(title||'تعهد مالی');
  if(named.has(name))return;
  named.add(name);
  const level=d<=1?2:d<=5?1:0;
  severity=Math.max(severity,level);
  const remaining=d<0?'معوق ('+fmt(-d)+' روز)':d===0?'سررسید امروز':fmt(d)+' روز مانده';
  const label=currency==='IRT'?'تومان':currency==='IRR'?'ریال':currency||'';
  const amountText=Number(amount)>0?' · '+fmt(amount)+' '+label:'';
  notices.push(name+' · '+remaining+amountText+(state==='pending'?' · تأیید پرداخت نشده':''));
 };
 // Pending installments are examined first: generate() rolls the next due date
 // forward on the due day, but the unconfirmed payment still needs an alert.
 for(const t of pending){
  if(!valid(t.dueDate))continue;
  const d=days(t.dueDate);
  if(d<=5)addNotice(t.memo||t.category,d,t.amount,t.currency,'pending');
 }
 for(const c of cs.filter(x=>x.active&&valid(x.nextDue))){
  const d=days(c.nextDue);
  if(d<=5||(c.reminders||[7,5,3,1,0]).includes(d))
   addNotice(c.title,d,c.amount,c.currency,'scheduled');
 }
 const target=$('upcoming-notice');
 target.replaceChildren();
 if(notices.length){
  const copy=document.createElement('span');
  copy.className='finance-bills-alert-copy';
  copy.textContent=(severity===2?'🔴 ':severity===1?'🟠 ':'📅 ')+(severity===2?'پرداخت نیازمند توجه: ':severity===1?'سررسید نزدیک: ':'یادآوری: ')+notices.slice(0,3).join(' | ')+(notices.length>3?' · و '+fmt(notices.length-3)+' مورد دیگر':'');
  const open=document.createElement('button');
  open.type='button';open.className='finance-bills-alert-open';open.textContent='مشاهده تعهدات';
  open.addEventListener('click',()=>financeNavGo('commitments'));
  target.append(copy,open);
 }
 target.classList.toggle('finance-bills-alert-critical',notices.length>0&&severity===2);
 target.classList.toggle('finance-bills-alert-warning',notices.length>0&&severity===1);
 target.setAttribute('role',severity===2?'alert':'status');
 target.setAttribute('aria-live',severity===2?'assertive':'polite');
}
$('com-create').addEventListener('click',create);
sec.addEventListener('click',e=>{
 const b=e.target.closest('button[data-action]');if(!b)return;
 const data=bridge.getData();
 if(b.dataset.action==='pay'){
  const t=data.tx.find(x=>x.id===b.dataset.id);
  if(!t||t.status!=='pending'||!confirm('پرداخت '+fmt(t.amount)+' '+t.currency+' تأیید شود؟'))return;
  t.status='completed';t.paidAt=new Date().toISOString();
 }else{
  const c=data.commitments.find(x=>x.id===b.dataset.id);if(!c)return;c.active=!c.active;
 }
 commit(data);
});
document.addEventListener('myfinance:changed',render);
document.addEventListener('myfinance:rebound',()=>{render();generate()});
document.addEventListener('visibilitychange',()=>{if(!document.hidden)generate()});
setInterval(()=>{if(!document.hidden)generate()},3600000);
render();generate();
})();