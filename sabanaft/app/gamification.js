/* صبا نفت ـ امتیاز و نشان برای فعالیت ثبت‌شده؛ گزارش اولیه و محلی، نه تأیید سازمانی. */
(function(global){
'use strict';
var COURSE='sabanaft_reflective_v2',STUDIO='sabanaft_leadership_studio_v1';
function arr(v){return Array.isArray(v)?v:[]}
function str(v){return typeof v==='string'?v.trim():''}
function read(k){try{return JSON.parse(localStorage.getItem(k)||'null')}catch(e){return null}}
function persianYear(date){try{var p=new Intl.DateTimeFormat('en-u-ca-persian',{year:'numeric'}).format(date||new Date());return Number(p.replace(/[^0-9]/g,''))||1405}catch(e){return 1405}}
function eventYear(raw){if(!raw)return null;var d=new Date(raw);return Number.isNaN(d.getTime())?null:persianYear(d)}
function f(n){return new Intl.NumberFormat('fa-IR').format(Number(n)||0)}
function safe(v){return String(v??'').replace(/[&<>"']/g,function(x){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[x]})}
function profile(course){if(!course||!Array.isArray(course.contexts))return null;return course.contexts.find(function(x){return x&&x.id===course.activeContext})||course.contexts[0]||null}
function hasPoint(v){return Number.isInteger(v)&&v>=0&&v<=10}
function contextCount(profile){return Object.values(profile?.dimensions||{}).filter(function(d){return d&&typeof d==='object'&&(hasPoint(d.now)&&hasPoint(d.future)||(hasPoint(d.keyNow)&&hasPoint(d.riskNow)))}).length}
function mixDone(p){return p&&p.mix&&p.mix.appropriate&&['B','C','P','E'].every(function(k){return hasPoint(p.mix.appropriate[k])})&&['B','C','P','E'].reduce(function(n,k){return n+p.mix.appropriate[k]},0)===10}
function hasPerspective(p){var d=p&&p.perspectives||{};return str(d.idea).length>=12&&str(d.self).length>=12}
function badge(id,label,desc,icon,earned){return {id:id,label:label,description:desc,icon:icon,earned:!!earned}}
function collect(opts){
 opts=opts||{};var course=opts.course===undefined?read(COURSE):opts.course,studio=opts.studio===undefined?read(STUDIO):opts.studio;
 var year=opts.year||persianYear(new Date()),p=profile(course),contexts=arr(course?.contexts),cases=arr(studio?.cases),reviews=arr(studio?.daily?.items),followups=arr(studio?.reflections),roleReviews=arr(studio?.development?.reviews),simulations=arr(studio?.simulationHistory);
 var scores=[],totals={learning:0,context:0,idea:0,relationship:0,tools:0,case:0,reflection:0},annual={learning:0,context:0,idea:0,relationship:0,tools:0,case:0,reflection:0},events=[];
 function add(type,key,amount,date,recognized){if(!recognized||!amount)return;totals[type]+=amount;scores.push({type:type,key:key,amount:amount,year:eventYear(date)});if(eventYear(date)===year){annual[type]+=amount;events.push({type:type,key:key,amount:amount,date:date})}}
 var lessons=0,contextReady=0;
 contexts.forEach(function(c){
  var unique=[...new Set(arr(c.completed).filter(function(v){return typeof v==='string'}))];
  unique.forEach(function(k){lessons++;add('learning',c.id+':'+k,8,c.completedAt?.[k],true)});
  var dims=Object.entries(c.dimensions||{});
  dims.forEach(function(pair){
   var d=pair[1],ready=d&&(hasPoint(d.now)&&hasPoint(d.future)||(pair[0]==='relevance'&&hasPoint(d.keyNow)&&hasPoint(d.keyFuture)&&hasPoint(d.riskNow)&&hasPoint(d.riskFuture)));
   if(ready){contextReady++;add('context',c.id+':'+pair[0],6,c.dimensionRatedAt?.[pair[0]],true)}
  });
  add('idea',c.id,35,c.mixRatedAt,!!mixDone(c));
  add('relationship',c.id,35,c.perspectivesRatedAt,hasPerspective(c));
  add('tools',c.id,25,c.toolRatedAt,!!(str(c.tool?.why).length>=12&&str(c.tool?.context).length>=12));
 });
 var meaningful=0,decisions=0,actions=0,returned=0;
 cases.forEach(function(c){
  if(!c||typeof c!=='object'||!c.id)return;
  var valid=str(c.title).length>=3&&str(c.situation).length>=20;
  if(!valid)return;
  meaningful++;add('case',c.id+':new',10,c.createdAt||c.date,true);
  if(str(c.decision).length>=10){decisions++;add('case',c.id+':decision',20,c.decisionAt||null,true)}
  if(str(c.action).length>=10){actions++;add('case',c.id+':action',15,c.actionAt||null,true)}
  var linked=followups.find(function(r){return r.caseId===c.id&&str(r.actual).length>=10&&str(r.observed).length>=10})||reviews.find(function(r){return r.caseId===c.id&&str(r.action).length>=10&&str(r.outcome).length>=10});
  if(linked){returned++;add('case',c.id+':followup',25,linked.createdAt||linked.date||null,true)}
 });
 var meaningfulRef=0;
 reviews.forEach(function(r){if(!r?.id||str(r.event).length<10||str(r.action).length<5||str(r.lesson).length<5)return;meaningfulRef++;add('reflection',r.id,15,r.createdAt||r.date,true)});
 followups.forEach(function(r){if(!r?.id||str(r.actual).length<10||str(r.observed).length<10)return;meaningfulRef++;add('reflection',r.id,15,r.createdAt||null,true)});
 roleReviews.forEach(function(r,i){if(str(r.action).length<10||str(r.evidence).length<10)return;add('reflection','development:'+i,15,r.createdAt||r.date,true)});
 simulations.forEach(function(r){if(!r.id||str(r.reflection).length<10)return;add('tools',r.id,10,r.date,true)});
 var annualScore=Object.values(annual).reduce(function(n,v){return n+v},0),total=Object.values(totals).reduce(function(n,v){return n+v},0);
 var levels=[{from:0,label:'آغازگر'},{from:200,label:'جست‌وجوگر'},{from:450,label:'کنشگر'},{from:800,label:'راهبر پیگیر'},{from:1200,label:'رهبر بازتابی پیشرو'}];var index=levels.reduce(function(n,l,i){return annualScore>=l.from?i:n},0);
 var next=levels[index+1];var badges=[
  badge('first-case','اولین مسئله','ثبت یک مسئله واقعی با شرح مشخص','🧩',meaningful>=1),
  badge('three-decisions','تصمیم‌ساز','ثبت سه تصمیم مشخص','🎯',decisions>=3),
  badge('action','اهل اقدام','ثبت سه اقدام قابل‌پیگیری','🚀',actions>=3),
  badge('followup','پیگیری نتیجه','بازگشت به نتیجه حداقل سه مسئله','🔎',returned>=3),
  badge('reflect','بازاندیش پیگیر','ثبت پنج بازاندیشی همراه با آموخته','🔁',meaningfulRef>=5),
  badge('context','بافت‌شناس','تکمیل همه هجده بُعد یک تیم','🧭',contexts.some(function(c){return contextCount(c)>=18})),
  badge('academy','همراه یادگیری','تکمیل دست‌کم دوازده بخش آموزشی','📚',lessons>=12),
  badge('leadership','رهبر بازتابی','رسیدن به هزار و دویست امتیاز در سال جاری','🏆',annualScore>=1200)
 ];
 var steps=[
 {id:'context',name:'شناخت بافت رهبری',icon:'🧭',done:contextReady,total:18,points:totals.context},
 {id:'idea',name:'ایده رهبری',icon:'💡',done:contexts.filter(mixDone).length,total:1,points:totals.idea},
 {id:'relationship',name:'رابطه با کارکنان',icon:'🤝',done:contexts.filter(hasPerspective).length,total:1,points:totals.relationship},
 {id:'tools',name:'ابزارهای رهبری',icon:'🛠️',done:contexts.filter(function(c){return str(c.tool?.why).length>=12&&str(c.tool?.context).length>=12}).length+simulations.filter(function(r){return str(r.reflection).length>=10}).length,total:1,points:totals.tools},
 {id:'reflection',name:'بازاندیشی مستمر',icon:'🔁',done:meaningfulRef,total:5,points:totals.reflection}
 ];
 return {year:year,annualScore:annualScore,totalScore:total,annualTarget:1200,level:levels[index].label,levelNumber:index+1,nextLevel:next?next.label:null,nextPoints:next?next.from-annualScore:0,earned:badges.filter(function(b){return b.earned}).length,badges:badges,steps:steps,points:totals,annualPoints:annual,events:events,counts:{cases:meaningful,decisions:decisions,actions:actions,followups:returned,reflections:meaningfulRef,lessons:lessons,contexts:contextReady},verified:false,scope:'محلی و خوداظهاری'};
}
function mini(data){data=data||collect();return '<span class="sg-mini">⭐ '+f(data.annualScore)+' امتیاز سال '+f(data.year)+' · سطح '+safe(data.level)+' · '+f(data.earned)+' نشان</span>'}
function dashboard(data){
 data=data||collect();var pct=Math.min(100,Math.round(data.annualScore/data.annualTarget*100));
 var cards=data.steps.map(function(s){return '<div class="sg-step"><span>'+s.icon+'</span><strong>'+safe(s.name)+'</strong><b>'+f(s.points)+' امتیاز</b><small>'+f(s.done)+' فعالیت مؤثر ثبت‌شده</small></div>'}).join('');
 var badges=data.badges.map(function(b){return '<div class="sg-badge '+(b.earned?'earned':'pending')+'" title="'+safe(b.description)+'"><span>'+b.icon+'</span><strong>'+safe(b.label)+'</strong><small>'+(b.earned?'دریافت شده':'در انتظار')+'</small></div>'}).join('');
 return '<section class="sg-dashboard" aria-label="امتیاز، سطح و نشان‌های سالانه"><div class="sg-hero"><span>🏆</span><div><h2>مسیر امتیازهای من</h2><p>سال '+f(data.year)+' · سطح '+safe(data.level)+'</p></div><strong>'+f(data.annualScore)+' <small>امتیاز</small></strong></div>'+
 '<div class="sg-goal"><div class="sg-goal-label"><span>هدف سالانه: '+f(data.annualTarget)+' امتیاز</span><strong>'+f(pct)+'٪</strong></div><div class="sg-track"><i style="width:'+pct+'%"></i></div><small>'+(data.nextLevel?'تا سطح «'+safe(data.nextLevel)+'» '+f(data.nextPoints)+' امتیاز باقی مانده است.':'به بالاترین سطح این مسیر رسیده‌اید.')+'</small></div>'+
 '<h3>از کدام بخش‌ها امتیاز گرفته‌ام؟</h3><div class="sg-steps">'+cards+'</div>'+
 '<h3>نشان‌های من · '+f(data.earned)+' از '+f(data.badges.length)+'</h3><div class="sg-badges">'+badges+'</div>'+
 '<div class="sg-summary"><strong>عملکرد ثبت‌شده</strong><p>'+f(data.counts.cases)+' مسئله، '+f(data.counts.decisions)+' تصمیم، '+f(data.counts.actions)+' اقدام، '+f(data.counts.followups)+' پیگیری نتیجه، '+f(data.counts.reflections)+' بازاندیشی و '+f(data.counts.lessons)+' بخش آموزشی.</p></div>'+
 '<p class="sg-privacy">این امتیازها از داده‌های موجود در همین مرورگر محاسبه می‌شوند و قابل‌ویرایش‌اند؛ برای پاداش سازمانی اعتبار تأییدشده ندارند. گزارش سازمانی فقط خلاصه تعداد و امتیاز است و محتوای کیس‌ها یا یادداشت‌های خصوصی را شامل نمی‌شود.</p>'+
 '<button type="button" id="sg-export" class="sg-export">دریافت گزارش خلاصه برای بررسی سازمان</button></section>';
}
function exportSummary(data){
 data=data||collect();var report={عنوان:'گزارش اولیه مشارکت در سامانه رهبری بازتابی',سال_شمسی:data.year,مجموع_امتیاز_سال:data.annualScore,سطح:data.level,نشان_های_دریافت_شده:data.badges.filter(function(b){return b.earned}).map(function(b){return b.label}),تعداد_فعالیت_ها:data.counts,امتیاز_فعالیت_ها:data.annualPoints,وضعیت_تایید:'تأییدنشده؛ محلی و خوداظهاری. برای تصمیم پاداش سازمانی کافی نیست.',یادداشت:'این خروجی هیچ نام فرد، متن کیس، یا یادداشت خصوصی را در بر ندارد.'};
 var blob=new Blob([JSON.stringify(report,null,2)],{type:'application/json;charset=utf-8'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='گزارش-پیشرفت-صبانفت-'+data.year+'.json';a.click();setTimeout(function(){URL.revokeObjectURL(url)},2000);
}
global.SabaGamification={collect:collect,dashboard:dashboard,mini:mini,exportSummary:exportSummary,persianYear:persianYear};
})(globalThis);
