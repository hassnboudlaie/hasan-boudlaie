/* My Finance · recurring commitments, pending payments and in-app reminders */
(()=>{
const bridge=window.MyFinanceBridge,$=id=>document.getElementById(id);
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const fmt=n=>new Intl.NumberFormat('fa-IR',{maximumFractionDigits:2}).format(Number(n)||0);
function today(){const p=new Intl.DateTimeFormat('en-US',{timeZone:'Asia/Tehran',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(new Date());const v=t=>p.find(x=>x.type===t).value;return v('year')+'-'+v('month')+'-'+v('day')}
const valid=s=>{if(!/^\d{4}-\d{2}-\d{2}$/.test(s))return false;const d=new Date(s+'T12:00:00Z');return !Number.isNaN(d.getTime())&&d.toISOString().slice(0,10)===s};
const days=s=>Math.round((new Date(s+'T12:00:00Z')-new Date(today()+'T12:00:00Z'))/86400000);
const fdate=s=>valid(s)?new Date(s+'T12:00:00Z').toLocaleDateString('fa-IR',{timeZone:'Asia/Tehran'}):'نامشخص';
function next(iso,cadence,anchor){
 const [y,m,d]=iso.split('-').map(Number);
 if(cadence==='weekly')return new Date(Date.UTC(y,m-1,d+7)).toISOString().slice(0,10);
 const total=y*12+m-1+(cadence==='yearly'?12:1),yy=Math.floor(total/12),mm=total%12;
 const last=new Date(Date.UTC(yy,mm+1,0)).getUTCDate();
 return [yy,String(mm+1).padStart(2,'0'),String(Math.min(anchor||d,last)).padStart(2,'0')].join('-');
}
const sec=document.createElement('section');sec.id='commitments';sec.hidden=true;
sec.innerHTML='<div class="card"><h2>تعهدات و هزینه‌های ثابت</h2><p class="muted">در سررسید، هزینه با وضعیت «در انتظار پرداخت» ثبت می‌شود؛ موجودی فقط پس از تأیید پرداخت تغییر می‌کند.</p>'+
'<div class="fields"><input id="com-title" maxlength="120" placeholder="عنوان، مثلاً اجاره یا اشتراک"><input id="com-amount" type="number" min="0.01" step="any" placeholder="مبلغ">'+
'<select id="com-currency"><option value="IRT">تومان · IRT</option><option value="IRR">ریال · IRR</option><option value="USD">دلار · USD</option><option value="EUR">یورو · EUR</option></select>'+
'<select id="com-cadence"><option value="monthly">ماهانه</option><option value="weekly">هفتگی</option><option value="yearly">سالانه</option></select>'+
'<label>اولین سررسید (میلادی)<input id="com-due" type="date"></label><label>روزهای یادآوری قبل از سررسید<input id="com-reminders" value="7,3,1,0" dir="ltr"></label>'+
'<select id="com-account"><option value="">حساب نامشخص</option></select><input id="com-category" placeholder="دسته‌بندی"></div><button id="com-create">افزودن تعهد</button></div>'+
'<div class="card"><h2>پرداخت‌های در انتظار</h2><div id="com-pending"></div></div>'+
'<div class="card"><h2>برنامه تعهدات</h2><div id="com-list"></div><p class="muted">یادآوری‌ها هنگام باز بودن اپ نمایش داده می‌شوند؛ اعلان زمان بسته بودن به Push جداگانه نیاز دارد.</p></div>';
$('reports').insertAdjacentElement('beforebegin',sec);
const btn=document.createElement('button');btn.className='alt';btn.textContent='تعهدات';btn.setAttribute('onclick',"tab('commitments')");document.querySelector('.tabs').append(btn);
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
 data.commitments.push({id:crypto.randomUUID(),title,amount,currency:$('com-currency').value,
  cadence:$('com-cadence').value,nextDue:due,anchorDay:Number(due.slice(8,10)),
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
 $('com-list').innerHTML=cs.length?cs.map(c=>'<div class="notice" style="margin-bottom:10px"><strong>'+esc(c.title)+'</strong> · '+fmt(c.amount)+' '+esc(c.currency)+'<p class="muted">سررسید بعدی '+fdate(c.nextDue)+' · '+(c.cadence==='weekly'?'هفتگی':c.cadence==='yearly'?'سالانه':'ماهانه')+' · یادآورها: '+esc((c.reminders||[]).join('، '))+'</p><button class="alt" data-action="toggle" data-id="'+esc(c.id)+'">'+(c.active?'توقف موقت':'فعال‌سازی')+'</button></div>').join(''):'<p class="muted">هنوز تعهدی ثبت نشده است.</p>';
 const alerts=[];
 for(const c of cs.filter(c=>c.active)){const d=days(c.nextDue);if(d<0||(c.reminders||[7,3,1,0]).includes(d))alerts.push(c.title+' · '+(d<0?'سررسید گذشته':d===0?'امروز':d+' روز مانده'))}
 for(const t of pending.filter(t=>days(t.dueDate)<0))if(!alerts.some(x=>x.startsWith(t.memo+' ·')))alerts.push(t.memo+' · پرداخت معوق');
 $('upcoming-notice').textContent=alerts.length?'⏰ یادآوری: '+alerts.slice(0,3).join(' | '):'';
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