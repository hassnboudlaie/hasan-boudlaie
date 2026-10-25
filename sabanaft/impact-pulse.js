/* Private, voluntary perceived usefulness pulse. Not ROI, psychometrics or employer access. */
(function(){
'use strict';
function esc(v){return String(v===undefined||v===null?'':v).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]});}
function clean(s,n){return typeof s==='string'?s.slice(0,n||500):'';}
function restore(s,x){s.valuePulses=Array.isArray(x&&x.valuePulses)?x.valuePulses.filter(function(p){return p&&typeof p.id==='string'&&Number.isInteger(Number(p.score))&&Number(p.score)>=1&&Number(p.score)<=5;}).map(function(p){return {id:clean(p.id,50),caseId:clean(p.caseId,55),date:clean(p.date,50),score:Number(p.score),reason:clean(p.reason,500)}}):[];}
function render(s){
var pulses=s.valuePulses||[],cases=s.cases||[],mean=pulses.length?(pulses.reduce(function(n,p){return n+p.score},0)/pulses.length).toFixed(1):'—';
return '<div class="ux-pulse"><div class="ux-pulse-title"><h3>آیا این سامانه به روشن‌ترشدن تصمیم شما کمک کرد؟</h3><span class="pill">'+(pulses.length?'میانگین '+mean+' / ۵، '+pulses.length+' پاسخ':'بدون پاسخ')+'</span></div><p>پرسش کاملاً اختیاری برای ارزیابی مفیدبودن تجربه کاربری؛ نه امتیاز رهبری، نه اندازه‌گیری بهره‌وری یا اثبات ROI. بازخورد فقط روی همین دستگاه ذخیره می‌شود.</p>'+
 (cases.length?'<form id="ux-pulse-form"><div class="field"><label for="ux-pulse-case">کدام مسئله؟</label><select id="ux-pulse-case">'+cases.map(function(c){return '<option value="'+esc(c.id)+'">'+esc(c.title)+'</option>'}).join('')+'</select></div><div class="ux-pulse-choices" role="group" aria-label="میزان مفید بودن">'+[1,2,3,4,5].map(function(i){return '<label><input type="radio" name="ux-pulse-score" value="'+i+'"> '+i+'</label>'}).join('')+'</div><p class="small">۱ = اصلاً کمکی نکرد · ۵ = بسیار مفید بود</p><div class="field"><label for="ux-pulse-reason">کدام قسمت مفید یا ناکافی بود؟ (اختیاری)</label><textarea id="ux-pulse-reason" maxlength="500" rows="2" placeholder="مثلاً تفکیک فرض‌ها از شواهد"></textarea></div><button class="btn light sm" type="submit">ثبت بازخورد داوطلبانه</button></form>':'<p class="small">برای پاسخ به این پرسش ابتدا یک کیس ثبت کنید.</p>')+'</div>';
}
document.addEventListener('submit',function(e){if(e.target.id!=='ux-pulse-form')return;e.preventDefault();
var api=window.SabanaftLeadershipStudio&&window.SabanaftLeadershipStudio.commercialBridge;if(!api)return;
var s=api.state(),checked=e.target.querySelector('input[name="ux-pulse-score"]:checked'),score=checked?Number(checked.value):0;
if(!Number.isInteger(score)||score<1||score>5){api.toast('لطفاً میزان مفیدبودن را بین ۱ تا ۵ انتخاب کنید.');return;}
var caseEl=document.getElementById('ux-pulse-case'),explain=document.getElementById('ux-pulse-reason');
var p={id:'pulse'+Date.now().toString(36)+Math.random().toString(36).slice(2,5),caseId:clean(caseEl&&caseEl.value,55),date:new Date().toISOString(),score:score,reason:clean(explain&&explain.value,500)};
s.valuePulses.push(p);
if(api.save()===false){s.valuePulses.pop();api.toast('ذخیره بازخورد ممکن نشد.');return;}
api.render();api.toast('بازخورد داوطلبانه شما ثبت شد.');
});
window.SabaImpactPulse={render:render,restore:restore};
})();