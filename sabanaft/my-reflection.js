/* Reflective Leadership OS — My Reflection (Trost 2025, chapters 4, 8, 9, 11). */
(function(){
'use strict';
var roleNames={B:'Boss',C:'Coach',P:'Partner',E:'Enabler'};
var colors={B:'#2479ce',C:'#139c93',P:'#e79c36',E:'#896bd4'};
var fields=['caseId','moment','event','role','action','outcome','source','evidence','contextChanged','lesson','next','reviewDate','support'];
function fresh(){return {step:1,caseId:'',moment:'challenge',event:'',role:'',action:'',outcome:'',source:'self',evidence:'',contextChanged:'unsure',lesson:'',next:'',reviewDate:'',support:'self'};}
function clean(v,n){return typeof v==='string'?v.slice(0,n||1800):'';}
function esc(v){return String(v===undefined||v===null?'':v).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});}
function normalized(x){var d=fresh();if(!x||typeof x!=='object')return d;fields.forEach(function(k){d[k]=clean(x[k],k==='event'||k==='action'||k==='outcome'?1800:900);});d.step=[1,2,3,4].includes(x.step)?x.step:1;if(!roleNames[d.role])d.role='';if(!['challenge','success','surprise','ordinary'].includes(d.moment))d.moment='challenge';if(!['self','feedback','document','none'].includes(d.source))d.source='self';if(!['yes','no','unsure'].includes(d.contextChanged))d.contextChanged='unsure';if(!['self','ai','human'].includes(d.support))d.support='self';return d;}
function restore(state,raw){var x=raw&&raw.daily||{};state.daily={draft:normalized(x.draft),items:Array.isArray(x.items)?x.items.filter(function(v){return v&&typeof v==='object'&&typeof v.id==='string';}).map(function(v){var o=normalized(v);o.id=clean(v.id,48);o.date=clean(v.date,12);o.createdAt=clean(v.createdAt,50);o.followedUpAt=clean(v.followedUpAt,50);return o;}):[],historyExpanded:!!x.historyExpanded,dueExpanded:!!x.dueExpanded};}
function getDaily(state){if(!state.daily)state.daily={draft:fresh(),items:[],historyExpanded:false,dueExpanded:false};return state.daily;}
function bridge(){return window.SabanaftLeadershipStudio&&window.SabanaftLeadershipStudio.dailyBridge;}
function data(){return bridge()&&bridge().state();}
function persist(){return bridge()?bridge().save():false;}
function redraw(){if(bridge())bridge().render();}
function message(t){if(bridge())bridge().toast(t);}
function go(t){if(bridge())bridge().go(t);}
function dateKey(d){d=d||new Date();return [d.getFullYear(),String(d.getMonth()+1).padStart(2,'0'),String(d.getDate()).padStart(2,'0')].join('-');}
function localDate(d){try{return new Intl.DateTimeFormat('fa-IR',{day:'numeric',month:'long',year:'numeric'}).format(d);}catch(e){return dateKey(d);}}
function field(k,label,value,hint,small){return '<div class="field"><label for="rfx-'+k+'">'+esc(label)+'</label><textarea id="rfx-'+k+'" data-rfx-field="'+k+'" rows="'+(small?2:3)+'" maxlength="1800" placeholder="'+esc(hint)+'">'+esc(value)+'</textarea></div>';}
function select(k,label,options,v){return '<div class="field"><label for="rfx-'+k+'">'+esc(label)+'</label><select id="rfx-'+k+'" data-rfx-field="'+k+'">'+options.map(function(o){return '<option value="'+esc(o[0])+'" '+(v===o[0]?'selected':'')+'>'+esc(o[1])+'</option>';}).join('')+'</select></div>';}
function choices(k,opts,cur){return '<div class="rfx-choices" role="group" aria-label="'+(k==='role'?'نقش واقعی':'نوع موقعیت')+'">'+opts.map(function(o){return '<button type="button" data-rfx-choice="'+k+'" data-rfx-value="'+o[0]+'" aria-pressed="'+(cur===o[0])+'" class="rfx-choice '+(cur===o[0]?'selected':'')+'">'+esc(o[1])+'</button>';}).join('')+'</div>';}
function linkCase(s,d){return (s.cases||[]).find(function(c){return c.id===d.caseId;})||null;}
function prompt(s,d){var out=[];
if(d.role==='B')out.push('چه تصمیم و استانداردی را روشن کردید و اختیار آن از کجا می‌آید؟');
if(d.role==='C')out.push('آیا فرد فضای کافی برای فکرکردن و پیشنهاد مسئولانه داشت؟');
if(d.role==='P')out.push('کدام بخش تصمیم واقعاً مشترک بود و اختلاف‌نظر چگونه بررسی شد؟');
if(d.role==='E')out.push('کدام مانع ساختاری، منبع یا قابلیت را فراهم کردید؟');
var c=linkCase(s,d);
if(c&&c.firstRole&&d.role&&c.firstRole!==d.role)out.push('در کیس اولیه نقش '+roleNames[c.firstRole]+' ثبت شده بود. تغییر نقش آگاهانه بود یا واکنشی؟');
if(d.contextChanged==='yes')out.push('چه تغییری در بافت رخ داده و چه شاهدی آن را تأیید می‌کند؟');
if(d.source==='self')out.push('تفاوت احتمالی نیت شما با تجربه کارکنان را چگونه می‌توانید بررسی کنید؟');
if(d.source==='none')out.push('برای بررسی این برداشت به چه داده یا بازخورد مشخصی نیاز دارید؟');
return out.slice(0,3);
}
function stage1(s,d){var cs=(s.cases||[]).map(function(c){return [c.id,c.title];});return '<h2>امروز چه لحظه‌ای برای شما مهم بود؟</h2><p class="muted">یک موقعیت واقعی کافی است؛ حتی اگر اتفاق کوچکی بوده باشد.</p>'+choices('moment',[['challenge','⚡ چالش'],['success','✦ تجربه موفق'],['surprise','◉ غیرمنتظره'],['ordinary','◌ روزمره']],d.moment)+(cs.length?select('caseId','ارتباط با کیس قبلی (اختیاری)',[['','موقعیت مستقل']].concat(cs),d.caseId):'')+field('event','چه اتفاقی افتاد؟',d.event,'یک موقعیت مشخص، بدون نام اشخاص یا داده‌های حساس')+'<div class="rfx-soft">اگر کیس قبلی انتخاب شود، لازم نیست شرح مسئله را دوباره وارد کنید.</div>';}
function stage2(s,d){var mix=s.mix||{},ranking=Object.keys(roleNames).filter(function(k){return mix[k]!==null&&Number.isInteger(Number(mix[k]));}).sort(function(a,b){return Number(mix[b])-Number(mix[a]);});
var intro=ranking.length?'<div class="rfx-soft">در Leadership Idea شما، '+roleNames[ranking[0]]+' جایگاه برجسته‌تری دارد؛ اما الزاماً مناسب همین وضعیت نیست.</div>':'';
return '<h2>در عمل کدام نقش را ایفا کردید؟</h2><p class="muted">رفتار واقعی را ثبت کنید، نه نقشی که تصور می‌کنید باید داشته باشید.</p>'+intro+choices('role',[['B','◆ Boss'],['C','◇ Coach'],['P','◈ Partner'],['E','✧ Enabler']],d.role)+field('action','دقیقاً چه گفتید یا انجام دادید؟',d.action,'رفتار قابل مشاهده من ...');}
function stage3(s,d){return '<h2>چه تأثیری دیدید و چه شواهدی دارید؟</h2><p class="muted">واقعیت مشاهده‌شده، تعبیر شخصی و بازخورد واقعی را از هم جدا کنید.</p>'+
field('outcome','نتیجه یا واکنش چه بود؟',d.outcome,'اگر هنوز مشخص نیست، همین را بنویسید.')+
select('source','مبنای برداشت من',[['self','مشاهده یا یادآوری شخصی'],['feedback','بازخورد واقعی دریافت‌شده از فرد یا تیم'],['document','نتیجه یا سند قابل بررسی'],['none','هنوز شواهد کافی ندارم']],d.source)+
field('evidence','شاهد یا فرضیه‌ای که نیاز به بررسی دارد (اختیاری)',d.evidence,'دقیقاً چه دیدم، شنیدم یا فرض کردم؟',true)+
select('contextChanged','آیا شرایط بافت با وضعیت معمول فرق داشت؟',[['unsure','نمی‌دانم'],['no','خیر، تقریباً مشابه بود'],['yes','بله، متفاوت بود']],d.contextChanged);}
function stage4(s,d){return '<h2>چه چیزی را حفظ یا تغییر می‌دهید؟</h2><p class="muted">یک Insight ملموس و یک Next Best Step کافی است.</p>'+field('lesson','امروز درباره نقش یا شیوه رهبری خود چه فهمیدم؟',d.lesson,'کدام فرضم تأیید یا به چالش کشیده شد؟')+
field('next','دفعه بعد چه اقدام مشخصی می‌کنم؟',d.next,'یک رفتار قابل مشاهده که می‌توانم انجام دهم',true)+
'<div class="field"><label for="rfx-reviewDate">تاریخ مرور بعدی (اختیاری)</label><input type="date" id="rfx-reviewDate" data-rfx-field="reviewDate" value="'+esc(d.reviewDate)+'"></div>'+
select('support','برای ادامه چه حمایتی لازم دارم؟',[['self','پیگیری توسط خودم'],['ai','گفت‌وگوی تکمیلی با AI (در نسخه آینده)'],['human','درخواست کوچ یا منتور انسانی (در نسخه آینده)']],d.support)+
(d.support!=='self'?'<div class="rfx-soft">این انتخاب درخواست رزرو یا ارسال اطلاعات نیست؛ صرفاً برای پیگیری شخصی ذخیره می‌شود.</div>':'');}
var stages=[stage1,stage2,stage3,stage4];
function history(s){var arr=getDaily(s).items;if(!arr.length)return '<div class="rfx-empty">هنوز بازاندیشی ثبت نکرده‌اید. با یک لحظه واقعی امروز شروع کنید.</div>';
return arr.slice().reverse().slice(0,getDaily(s).historyExpanded?arr.length:8).map(function(d){var date=d.createdAt?localDate(new Date(d.createdAt)):esc(d.date);return '<details class="rfx-record"><summary><b>'+esc(date)+'</b><span>'+(roleNames[d.role]||'')+' · '+esc((d.event||(linkCase(s,d)&&linkCase(s,d).title)||'بازاندیشی').slice(0,45))+'</span></summary><div><p><b>رفتار:</b> '+esc(d.action||'—')+'</p><p><b>نتیجه:</b> '+esc(d.outcome||'—')+'</p><p><b>یادگیری:</b> '+esc(d.lesson||'—')+'</p><p><b>اقدام:</b> '+esc(d.next||'—')+'</p></div></details>';}).join('');}
function render(s){var store=getDaily(s),d=store.draft||fresh(),date=dateKey();var todayCount=store.items.filter(function(x){return x.date===date;}).length;var steps=['لحظه مهم','رفتار و نقش','اثر و شواهد','یادگیری و اقدام'];
var dueAll=store.items.filter(function(x){return x.reviewDate&&x.reviewDate<=date&&!x.followedUpAt;}).slice().reverse();var due=store.dueExpanded?dueAll:dueAll.slice(0,3);var displayName=s.profile&&s.profile.name?esc(s.profile.name.split(' ')[0]):'مدیر گرامی';
var stage=stages[d.step-1]||stage1;
return '<section class="rfx-hero"><span class="rfx-overline">MY REFLECTION · DAILY LEADERSHIP PRACTICE</span><h1>'+displayName+'، امروز درباره رهبری خود چه چیزی آموختید؟</h1><p>از یک لحظه واقعی تا یک Next Best Step. بدون تست شخصیت، امتیازدهی یا گزارش اجباری.</p><div class="rfx-meta"><span>◷ حدود ۳ دقیقه</span><span>'+localDate(new Date())+'</span><span>🔒 ذخیره محلی</span></div></section>'+
'<div class="rfx-metrics"><div><small>بازاندیشی‌های من</small><b>'+store.items.length+'</b></div><div><small>بازاندیشی امروز</small><b>'+todayCount+'</b></div><div><small>گام جاری</small><b>'+d.step+' / ۴</b></div></div>'+
'<div class="grid"><section class="span8 card rfx-main"><div class="title-row"><h2>بازاندیشی روزانه من</h2><span class="pill">گام '+d.step+' از ۴</span></div><div class="rfx-steps">'+steps.map(function(name,i){return '<button type="button" data-rfx-step="'+(i+1)+'" class="'+(d.step===i+1?'active':'')+'" aria-current="'+(d.step===i+1?'step':'false')+'"><span>'+(i+1)+'</span>'+name+'</button>';}).join('')+'</div><div class="rfx-bar"><span style="width:'+(d.step*25)+'%"></span></div><form id="rfx-form">'+stage(s,d)+'<div class="rfx-buttons">'+(d.step===1?'<button type="button" data-rfx-reset class="btn light">شروع تازه</button>':'<button type="button" data-rfx-prev class="btn light">بازگشت</button>')+(d.step===4?'<button class="btn" type="submit">ثبت بازاندیشی ✓</button>':'<button type="button" data-rfx-next class="btn">مرحله بعد ←</button>')+'</div><p class="small">پیش‌نویس خودکار روی همین دستگاه ذخیره می‌شود.</p></form></section>'+
'<aside class="span4 card rfx-mirror"><span class="rfx-overline">REFLECTION MIRROR</span><h2>یک پرسش برای فکرکردن</h2><p class="muted">این پرسش‌ها براساس رفتار شما و اطلاعات کیس ساخته می‌شوند؛ نتیجه قطعی نیستند.</p>'+
(d.role?'<div class="rfx-role"><i style="background:'+colors[d.role]+'"></i> نقش ثبت‌شده: '+roleNames[d.role]+'</div>':'<p class="rfx-soft">در گام دوم نقش واقعی را انتخاب کنید.</p>')+prompt(s,d).map(function(p){return '<div class="rfx-prompt">◈ '+esc(p)+'</div>';}).join('')+
'<div class="rfx-links"><button type="button" data-rfx-go="mix" class="btn light sm">Leadership Idea</button><button type="button" data-rfx-go="context" class="btn light sm">Context</button></div><p class="rfx-confidential">این یادداشت به‌طور خودکار برای سازمان، منابع انسانی یا کوچ ارسال نمی‌شود.</p></aside></div>'+
'<div class="grid"><section class="span8 card"><div class="title-row"><h2>تاریخچه بازاندیشی‌ها</h2><span class="small">'+(store.historyExpanded?'همه سوابق':'۸ مورد اخیر')+'</span></div>'+history(s)+(store.items.length>8?'<button type="button" class="btn light sm" data-rfx-history-more>'+(store.historyExpanded?'نمایش ۸ مورد اخیر':'نمایش همه '+store.items.length+' مورد')+'</button>':'')+'</section><aside class="span4 card"><h2>Follow-through</h2>'+(due.length?due.map(function(x){return '<div class="rfx-prompt"><small>موعد بازاندیشی: '+esc(x.reviewDate)+'</small><p>'+esc(x.next||x.lesson||'بازبینی تصمیم')+'</p><button type="button" data-rfx-follow="'+esc(x.id)+'" class="btn light sm">مرور نتیجه</button></div>';}).join(''):'<p class="muted">پس از ثبت یک Next Best Step می‌توانید موعد بازاندیشی بعدی را تعیین کنید. اعلان خودکار هنوز فعال نیست.</p>')+(dueAll.length>3?'<button type="button" data-rfx-due-more class="btn light sm">'+(store.dueExpanded?'نمایش ۳ مورد':'نمایش همه '+dueAll.length+' پیگیری')+'</button>':'')+'<button type="button" data-rfx-go="portfolio" class="btn light sm">دریافت گزارش شخصی</button></aside></div>'+
'<p class="rfx-citation">مبنای مفهومی: Armin Trost, The Reflective Leader (2025), فصل‌های ۴، ۸، ۹ و ۱۱. یادداشت شخصی جایگزین بازخورد واقعی کارکنان نیست.</p>';
}
function check(d,step){
if(step===1&&!d.event.trim()&&!d.caseId)return 'شرح کوتاه موقعیت یا یک کیس را انتخاب کنید.';
if(step===2&&(!d.role||!d.action.trim()))return 'نقش واقعی و رفتار خود را ثبت کنید.';
if(step===3&&!d.outcome.trim())return 'نتیجه را وارد کنید؛ اگر هنوز مشخص نیست، همین را بنویسید.';
if(step===4&&!d.lesson.trim()&&!d.next.trim())return 'یک یادگیری یا اقدام بعدی ثبت کنید.';
return '';
}
document.addEventListener('input',function(e){var x=e.target;if(!x.dataset.rfxField)return;var s=data();if(!s)return;getDaily(s).draft[x.dataset.rfxField]=clean(x.value,1800);persist();});
document.addEventListener('change',function(e){var x=e.target;if(!x.dataset.rfxField)return;var s=data();if(!s)return;getDaily(s).draft[x.dataset.rfxField]=clean(x.value,1800);persist();if(['source','contextChanged','support','caseId'].includes(x.dataset.rfxField))redraw();});
document.addEventListener('click',function(e){var x=e.target.closest('[data-rfx-choice],[data-rfx-step],[data-rfx-prev],[data-rfx-next],[data-rfx-reset],[data-rfx-go],[data-rfx-from-case],[data-rfx-follow],[data-rfx-history-more],[data-rfx-due-more]');if(!x)return;var s=data();if(!s)return;var d=getDaily(s).draft;
if(x.hasAttribute('data-rfx-history-more')){getDaily(s).historyExpanded=!getDaily(s).historyExpanded;persist();redraw();return;}
if(x.hasAttribute('data-rfx-due-more')){getDaily(s).dueExpanded=!getDaily(s).dueExpanded;persist();redraw();return;}
if(x.dataset.rfxFollow){var item=getDaily(s).items.find(function(v){return v.id===x.dataset.rfxFollow;});if(!item)return;var c=(s.cases||[]).find(function(v){return v.id===item.caseId;});if(c&&window.SabaLightFlow){window.SabaLightFlow.openQuick(c.id);return;}d.caseId=item.caseId||'';d.event=item.event||'';d.step=1;if(!persist()){message('بازکردن پیش‌نویس مرور موفق نبود.');return;}redraw();message('اقدام را در بازاندیشی تازه بررسی کنید.');return;}
if(x.dataset.rfxFromCase){var linked=(s.cases||[]).find(function(v){return v.id===x.dataset.rfxFromCase;});if(linked&&(linked.action||linked.decision)&&window.SabaLightFlow){window.SabaLightFlow.openQuick(linked.id);return;}d.caseId=x.dataset.rfxFromCase;d.step=1;persist();go('daily');return;}
if(x.dataset.rfxChoice){d[x.dataset.rfxChoice]=x.dataset.rfxValue;persist();redraw();return;}
if(x.dataset.rfxGo){go(x.dataset.rfxGo);return;}
if(x.hasAttribute('data-rfx-reset')){if((d.event||d.action||d.lesson)&&!confirm('پیش‌نویس فعلی پاک شود؟'))return;getDaily(s).draft=fresh();persist();redraw();return;}
if(x.hasAttribute('data-rfx-prev')){d.step=Math.max(1,d.step-1);persist();redraw();return;}
if(x.dataset.rfxStep){var n=Number(x.dataset.rfxStep);if(n>d.step){var m=check(d,d.step);if(m){message(m);return;}}d.step=n;persist();redraw();return;}
if(x.hasAttribute('data-rfx-next')){var issue=check(d,d.step);if(issue){message(issue);return;}d.step=Math.min(d.step+1,4);persist();redraw();}
});
document.addEventListener('submit',function(e){if(e.target.id!=='rfx-form')return;e.preventDefault();var s=data();if(!s)return;var d=getDaily(s).draft;for(var i=1;i<=4;i++){var err=check(d,i);if(err){d.step=i;persist();redraw();message(err);return;}}
var date=new Date(),item=normalized(d);item.id='rfx'+date.getTime().toString(36)+Math.random().toString(36).slice(2,6);item.date=dateKey(date);item.createdAt=date.toISOString();s.daily.items.push(item);s.daily.draft=fresh();if(!persist()){s.daily.items.pop();s.daily.draft=d;message('ذخیره مرورگر در دسترس نیست؛ اطلاعات پیش‌نویس را از دست ندهید و از بسته شخصی خروجی بگیرید.');return;}redraw();message('بازاندیشی شما ذخیره شد.');
});
window.SabaDailyReflection={render:render,restore:restore,fresh:fresh};
})();