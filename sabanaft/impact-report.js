/* Saba Naft — user-controlled, privacy-minimal individual impact summary.
   No server calls and no access to employer dashboards. Process indicators are NOT ROI. */
(function(){
'use strict';
function safeNumber(n){return Number.isFinite(n)&&n>=0?Math.floor(n):0;}
function ratio(n,d){return d?Math.round(100*n/d):null;}
function summarize(s){
 s=s&&typeof s==='object'?s:{};
 var cases=Array.isArray(s.cases)?s.cases:[],daily=Array.isArray(s.daily&&s.daily.items)?s.daily.items:[],
 older=Array.isArray(s.reflections)?s.reflections:[],
 roleplays=Array.isArray(s.simulationHistory)?s.simulationHistory:[],
 pulses=Array.isArray(s.valuePulses)?s.valuePulses:[],
 reviews=Array.isArray(s.development&&s.development.reviews)?s.development.reviews:[];
 var counted=cases.filter(function(c){return c&&typeof c==='object';}),ids=new Set(counted.map(function(c){return c.id;}).filter(Boolean));
 var decided=counted.filter(function(c){return typeof c.decision==='string'&&c.decision.trim();}).length;
 var actionable=counted.filter(function(c){return typeof c.action==='string'&&c.action.trim();}).length;
 var reviewed=counted.filter(function(c){return ids.has(c.id)&&older.some(function(r){return r&&r.caseId===c.id;})||daily.some(function(r){return r&&r.caseId===c.id&&r.outcome&&r.outcome.trim();});}).length;
 var validPulses=pulses.map(function(p){return Number(p&&p.score);}).filter(function(n){return Number.isInteger(n)&&n>=1&&n<=5;});
 var pulseAverage=validPulses.length?Math.round(validPulses.reduce(function(a,b){return a+b;},0)*10/validPulses.length)/10:null;
 return {
  cases:safeNumber(counted.length),
  decisions:safeNumber(decided),
  actions:safeNumber(actionable),
  reviewed:safeNumber(reviewed),
  reflections:safeNumber(daily.length),
  roleplaySessions:safeNumber(roleplays.length),
  developmentReviews:safeNumber(reviews.length),
  voluntaryFeedback:safeNumber(validPulses.length),
  feedbackMean:pulseAverage,
  decisionCoverage:ratio(decided,counted.length),
  actionCoverage:ratio(actionable,counted.length),
  followThroughCoverage:ratio(reviewed,counted.length)
 };
}
function csv(s){
 var x=summarize(s);
 var data=[
 ['Metric','Value'],
 ['Scope','Individual self-reported process indicators only; not proof of business ROI'],
 ['Recorded cases',x.cases],
 ['Documented decisions',x.decisions],
 ['Cases with action',x.actions],
 ['Cases with reflection/evidence',x.reviewed],
 ['Daily reflections',x.reflections],
 ['Role-play sessions',x.roleplaySessions],
 ['IDP action reviews',x.developmentReviews],
 ['Voluntary value ratings',x.voluntaryFeedback],
 ['Average value rating (1-5)',x.feedbackMean===null?'Not available':x.feedbackMean],
 ['Decision documentation (%)',x.decisionCoverage===null?'Not available':x.decisionCoverage],
 ['Action follow-through (%)',x.actionCoverage===null?'Not available':x.actionCoverage],
 ['Evidence review (%)',x.followThroughCoverage===null?'Not available':x.followThroughCoverage]
 ];
 return '\uFEFF'+data.map(function(row){return row.map(function(v){var a=String(v===null?'':v);return '"'+a.replace(/"/g,'""')+'"';}).join(',');}).join('\r\n');
}
function render(s){
 var x=summarize(s);
 return '<section class="card" style="margin-top:16px" aria-label="خلاصه شواهد فردی">'+
 '<span class="kicker">INDIVIDUAL EVIDENCE SUMMARY</span>'+
 '<h2>خلاصه قابل اشتراک‌گذاری، فقط با انتخاب شما</h2>'+
 '<p class="muted">گزارش شامل شمارش کلی Case، Reflection، تمرین و Follow-through است؛ <strong>نام مدیر، شرح کیس، متن بازاندیشی، تاریخچه گفت‌وگو یا اطلاعات کارکنان را شامل نمی‌شود.</strong> با این وجود، اعداد یک فرد در گروه کوچک ممکن است هویت او را آشکار کند؛ قبل از اشتراک‌گذاری بررسی کنید.</p>'+
 '<div class="grid"><div class="span4"><strong>'+x.cases+'</strong><p class="small">Case ثبت‌شده</p></div>'+
 '<div class="span4"><strong>'+x.reviewed+'</strong><p class="small">Case با مرور نتیجه</p></div>'+
 '<div class="span4"><strong>'+x.developmentReviews+'</strong><p class="small">مرور IDP</p></div></div>'+
 '<p class="note">این فایل صرفاً Process Metrics فردی است؛ ارزیابی عملکرد، تصمیم مدیریتی، اثر اقتصادی یا ROI واقعی را اثبات نمی‌کند. ارسال خودکار به سازمان وجود ندارد.</p>'+
 '<button type="button" data-saba-export-impact class="btn light">دریافت خلاصه آماری CSV</button></section>';
}
function download(){
 var api=window.SabanaftLeadershipStudio&&window.SabanaftLeadershipStudio.commercialBridge;
 if(!api||!api.state())return;
 if(!window.confirm('فقط شاخص‌های آماری فردی، بدون نام و متن کیس، به یک فایل CSV روی دستگاه شما صادر شوند؟'))return;
 var blob=new Blob([csv(api.state())],{type:'text/csv;charset=utf-8'}),url=URL.createObjectURL(blob),a=document.createElement('a');
 a.href=url;a.download='sabanaft-individual-impact-summary.csv';document.body.appendChild(a);a.click();a.remove();
 setTimeout(function(){URL.revokeObjectURL(url);},1000);
 api.toast('خلاصه آماری فقط روی دستگاه شما آماده شد؛ چیزی به سرور یا سازمان ارسال نشد.');
}
document.addEventListener('click',function(e){var t=e.target.closest('[data-saba-export-impact]');if(t)download();});
window.SabaImpactExport={summarize:summarize,csv:csv,render:render};
})();
