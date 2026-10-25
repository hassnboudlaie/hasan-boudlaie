/* Saba Naft · lightweight Perdoo-inspired follow-through; no extra navigation. */
(function(){
'use strict';
function esc(x){return String(x==null?'':x).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','\'':'&#39;'}[c]});}
function cut(x,n){return typeof x==='string'?x.slice(0,n):'';}
function fresh(){return {caseId:'',actual:'',outcome:'',source:'none',next:''};}
function state(){return window.SabanaftLeadershipStudio&&window.SabanaftLeadershipStudio.commercialBridge;}
function store(s){if(!s.lightFlow)s.lightFlow={quickOpen:false,quick:fresh()};return s.lightFlow;}
function restore(s,raw){var v=raw&&raw.lightFlow||{},q=v.quick||{},item=fresh();['caseId','actual','outcome','next'].forEach(function(k){item[k]=cut(q[k],k==='caseId'?60:1800)});item.source=['none','self','feedback','document'].includes(q.source)?q.source:'none';s.lightFlow={quickOpen:!!v.quickOpen,quick:item};}
function openQuick(caseId){
 var api=state();if(!api)return false;var s=api.state(),c=(s.cases||[]).find(function(v){return v.id===caseId;});if(!c)return false;
 var l=store(s);if(l.quick.caseId!==caseId)l.quick=fresh();l.quick.caseId=c.id;l.quickOpen=true;
 if(!api.save()){api.toast('ذخیره پیش‌نویس فعال نیست؛ از اطلاعات پشتیبان تهیه کنید.');return false;}
 api.go('daily');return true;
}
function field(k,label,hint,val){return '<div class="field"><label for="lf-'+k+'">'+label+'</label><textarea id="lf-'+k+'" data-lf-field="'+k+'" rows="2" maxlength="1800" placeholder="'+esc(hint)+'">'+esc(val||'')+'</textarea></div>';}
function quickView(s){
 var l=store(s),q=l.quick,c=(s.cases||[]).find(function(v){return v.id===q.caseId;});if(!c){l.quickOpen=false;return window.SabaDailyReflection.render(s);}
 return '<div class="lf-page"><div class="lf-header"><span class="rfx-overline">MY REFLECTION · QUICK CHECK-IN</span><h1>مرور نتیجه اقدام</h1><p>سه پرسش کوتاه، برای یادگیری از یک تصمیم واقعی.</p></div>'
 +'<section class="card lf-card"><div class="lf-case"><div><span class="small">مسئله مرتبط</span><h2>'+esc(c.title)+'</h2><p class="muted">'+esc(c.action||'اقدام اولیه هنوز ثبت نشده')+'</p></div><button type="button" class="btn light sm" data-lf-close>بازگشت</button></div>'
 +'<form id="lf-form">'+field('actual','۱. چه اقدامی انجام دادید؟','دقیقاً چه گفتید یا انجام دادید؟',q.actual)
 +field('outcome','۲. چه نتیجه‌ای مشاهده کردید؟','اگر هنوز روشن نیست، صریح بنویسید.',q.outcome)
 +'<div class="field"><label for="lf-source">مبنای این برداشت</label><select id="lf-source" data-lf-field="source">'+[['none','هنوز شواهد کافی ندارم'],['self','مشاهده شخصی'],['feedback','بازخورد واقعی همکار یا تیم'],['document','سند یا نتیجه قابل بررسی']].map(function(v){return '<option value="'+v[0]+'" '+(q.source===v[0]?'selected':'')+'>'+v[1]+'</option>';}).join('')+'</select></div>'
 +field('next','۳. گام بعدی چیست؟','یک اقدام مشخص و قابل اجرا',q.next)
 +'<div class="lf-actions"><button type="submit" class="btn">ثبت مرور</button><button type="button" class="btn light" data-lf-deep>بازاندیشی کامل</button></div>'
 +'</form><p class="small">پاسخ‌ها صرفاً خوداظهاری‌اند؛ ثبت مرور به معنی تأیید موفقیت تصمیم نیست. داده‌ها در همین دستگاه نگهداری می‌شوند.</p></section></div>';
}
function dateKey(d){return [d.getFullYear(),String(d.getMonth()+1).padStart(2,'0'),String(d.getDate()).padStart(2,'0')].join('-');}
function quickEntry(s,caseObj,q){
 var item=window.SabaDailyReflection.fresh();
 item.step=4;item.caseId=caseObj.id;item.event=caseObj.title;item.action=cut(q.actual,1800);item.outcome=cut(q.outcome,1800);
 item.source=q.source;item.next=cut(q.next,1800);item.role=caseObj.firstRole||'';
 var now=new Date();item.id='rfx'+now.getTime().toString(36)+Math.random().toString(36).slice(2,6);item.date=dateKey(now);item.createdAt=now.toISOString();item.followedUpAt='';
 return item;
}
function quickUpdate(t){
 var api=state();if(!api)return;var s=api.state(),l=store(s),key=t.dataset.lfField;
 if(!['actual','outcome','source','next'].includes(key))return;
 l.quick[key]=cut(t.value,1800);api.save();
}
document.addEventListener('input',function(e){if(e.target&&e.target.dataset.lfField)quickUpdate(e.target);});
document.addEventListener('change',function(e){if(e.target&&e.target.dataset.lfField)quickUpdate(e.target);});
document.addEventListener('click',function(e){
 var t=e.target.closest('[data-lf-close],[data-lf-deep]');if(!t)return;
 var api=state();if(!api)return;var s=api.state(),l=store(s);
 if(t.hasAttribute('data-lf-deep')){
   s.daily=s.daily||{draft:window.SabaDailyReflection.fresh(),items:[]};
   if(!s.daily.draft)s.daily.draft=window.SabaDailyReflection.fresh();
   var d=s.daily.draft,q=l.quick;d.caseId=q.caseId;
   if(!d.event)d.event=q.actual;if(!d.action)d.action=q.actual;
   if(!d.outcome)d.outcome=q.outcome;
   if(!d.next)d.next=q.next;
   l.quickOpen=false;
 }else l.quickOpen=false;
 if(!api.save()){api.toast('تغییر وضعیت ذخیره نشد.');return;}api.render();
});
document.addEventListener('submit',function(e){
 if(e.target.id!=='lf-form')return;e.preventDefault();
 var api=state();if(!api)return;var s=api.state(),l=store(s),q=l.quick;
 var c=(s.cases||[]).find(function(v){return v.id===q.caseId;});if(!c){api.toast('کیس مرتبط پیدا نشد.');return;}
 if(!q.actual.trim()||!q.outcome.trim()||!q.next.trim()){api.toast('هر سه پرسش کوتاه را تکمیل کنید.');return;}
 var item=quickEntry(s,c,q);
 if(!s.daily||!Array.isArray(s.daily.items))s.daily={draft:window.SabaDailyReflection.fresh(),items:[]};
 s.daily.items.push(item);l.quickOpen=false;l.quick=fresh();
 if(!api.save()){s.daily.items.pop();l.quick=q;l.quickOpen=true;api.toast('ذخیره مرور موفق نبود؛ متن‌ها حفظ شدند.');return;}
 api.render();api.toast('مرور نتیجه به My Reflection اضافه شد.');
});
window.SabaLightFlow={fresh:fresh,restore:restore,openQuick:openQuick,quickView:quickView,store:store};
})();