'use strict';
(()=>{
const W=window.AlborzWorkshop,params=new URLSearchParams(location.search),teacher=params.has('teacher');
const requestedMission=['camel','salmon','chameleon','octopus'].indexOf(params.get('mission'));
// The local-only scorecard is an explicit offline fallback, never a second live instructor dashboard.
if(!W||(teacher&&params.get('offline')==='1'))return;
const endpoint='https://cymatyfnwuxikrghydrn.supabase.co/functions/v1/alborz-workshop-sync';
const shared=/^(?:teamname|stage|r[0-3](?:pick|initial|revision|reveal|score[0-4]|evidence|member[1-5])|created(?:Context|Roles|Choice|Event|Dialogue|Debrief|Revision|score[0-4]|evidence)|pitch)$/;
const E=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const fa=x=>Number(x).toLocaleString('fa-IR');
const sessionKey='alborz-live-v4-session',draftKey='alborz-live-v3-drafts-'+W.group;
const app=document.getElementById('app');let auth=null,records={},drafts={},timer,busy=false,generation=0,allRows=[],statusText='',statusBad=false,teacherMode='journey',gradeRound=0,gradeDrafts={};
try{drafts=JSON.parse(sessionStorage.getItem(draftKey)||'{}');if(!drafts||typeof drafts!=='object'||Array.isArray(drafts))drafts={};}catch{drafts={};}
function persistDrafts(){try{sessionStorage.setItem(draftKey,JSON.stringify(drafts));}catch{}}
function message(text,bad=false){statusText=text;statusBad=bad;const e=document.getElementById('live-status');if(e){e.textContent=text;e.classList.toggle('warning',bad);}}
async function request(body,code=auth?.code){const controller=new AbortController(),timeout=setTimeout(()=>controller.abort(),15000);try{const r=await fetch(endpoint,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({...body,code}),signal:controller.signal,cache:'no-store'});const d=await r.json();if(!r.ok){const e=Error(d.error||'خطای ارتباط');e.status=r.status;throw e;}return d;}finally{clearTimeout(timeout);}}
function panel(){let el=document.getElementById('live-panel');if(!el){el=document.createElement('section');el.id='live-panel';el.className='panel';app.prepend(el);}return el;}
function mount(){const el=panel();if(!auth){el.innerHTML=`<h2>${teacher?'ورود مدرس':'ورود شرکت‌کننده'}</h2><p>${teacher?'برای دیدن راهنمای کامل چهار مأموریت و پیشرفت گروه‌ها، کد اختصاصی مدرس را وارد کنید.':'با کد شخصی خود وصل شوید؛ شماره گروه و عضو از کد شما مشخص می‌شود.'}</p><label class="field"><span>کد اختصاصی</span><input id="live-code" type="password" autocomplete="off" maxlength="${teacher?24:8}" inputmode="${teacher?'text':'numeric'}" dir="ltr" placeholder="${teacher?'کد اختصاصی مدرس':'کد ۸ رقمی'}"></label><button class="btn primary" id="live-join">اتصال</button><p id="live-status" role="status"></p><p class="small">مطالب و تمرین آفلاین همچنان قابل استفاده‌اند. پس از اتصال، پاسخ‌های مشترک سرور نمایش داده می‌شوند؛ خودارزیابی و برنامه اقدام فردی همگام نمی‌شوند.</p>`;}else{el.innerHTML=`<div class="navline"><h2>${teacher?'داشبورد زنده مدرس':'گروه '+fa(auth.team)+' · عضو '+fa(auth.member)}</h2><button class="btn" id="live-logout">خروج از اتصال</button></div><p id="live-status" role="status"></p><p class="small">دریافت خودکار حدود هر ۱۰ ثانیه؛ نشست ورود تا ۱۲ ساعت و فقط در همین تب معتبر است. ذخیره مشترک با دکمه «اشتراک با گروه» انجام می‌شود.</p>${teacher?'<nav class="teacher-tabs" aria-label="بخش‌های مدرس"><button class="btn" data-teacher-tab="journey">راهنمای کامل A تا Z</button><button class="btn" data-teacher-tab="dashboard">داشبورد زنده و ارزیابی</button></nav><div id="live-dashboard"></div>':'<button class="btn" id="live-stage">'+(W.step>=3&&W.step<=6?'اعلام شروع مأموریت '+fa(W.step-2)+' به مدرس':'اعلام حضور در بخش '+fa(W.step+1))+'</button><div id="live-members"></div><div id="live-achievements"></div>'}`;
 if(teacher){for(const section of [...app.querySelectorAll('section.panel')])if(section!==el&&section.querySelector('h2')?.textContent.includes('جدول رقابت'))section.remove();showTeacher();}else decorate();}
 message(statusText,statusBad);
}
function draft(k,value){if(!auth||teacher||!shared.test(k))return;drafts[k]={value,base:drafts[k]?.base??records[k]?.version??0};persistDrafts();}
function decorate(){if(!auth||teacher)return;
 for(const input of app.querySelectorAll('[data-field]')){const k=input.dataset.field;if(!shared.test(k))continue;if(input.dataset.liveDecorated)continue;input.dataset.liveDecorated='1';const b=document.createElement('button');b.type='button';b.className='btn live-save';b.dataset.liveSave=k;b.textContent='اشتراک با گروه';input.closest('label')?.after(b);}
 for(const i of [0,1,2,3]){if(!app.querySelector('[data-pick="'+i+':0"]'))continue;const k='r'+i+'pick';if(!app.querySelector('[data-live-save="'+k+'"]')){const b=document.createElement('button');b.className='btn';b.dataset.liveSave=k;b.textContent='اشتراک انتخاب کارت‌ها';app.querySelector('[data-pick="'+i+':3"]').closest('label').after(b);}const r='r'+i+'reveal';if(W.read()[r]&&!app.querySelector('[data-live-save="'+r+'"]')){const b=document.createElement('button');b.className='btn';b.dataset.liveSave=r;b.textContent='اشتراک بازشدن رویداد';app.querySelector('[data-action="reveal"][data-value="'+i+'"]').after(b);}}
 showMembers();
}
function showMembers(){const el=document.getElementById('live-members');if(!el||!auth)return;const badges=document.getElementById('live-achievements');if(badges)badges.innerHTML='<h3>نشان‌های مأموریت‌ها</h3>'+badgeCards(achievedBadges(records));const rounds=W.step>=3&&W.step<=6?[W.step-3]:[];
 // Do not rebuild the member textarea while it is being edited.
 for(const i of rounds){let box=document.getElementById('live-round-'+i);if(!box){box=document.createElement('details');box.id='live-round-'+i;box.open=true;const k='r'+i+'member'+auth.member;box.innerHTML=`<summary>مشارکت اعضا · مأموریت ${fa(i+1)}</summary><label class="field"><span>نظر من · عضو ${fa(auth.member)}</span><textarea data-member-key="${k}" maxlength="2500">${E(drafts[k]?.value??records[k]?.field_value??'')}</textarea></label><button class="btn" data-live-save="${k}">اشتراک با گروه</button><div class="member-list"></div>`;el.append(box);}box.querySelector('.member-list').innerHTML=Array.from({length:5},(_,j)=>`<p><b>عضو ${fa(j+1)}:</b> <span style="white-space:pre-wrap">${E(records['r'+i+'member'+(j+1)]?.field_value||'هنوز نظری ثبت نشده')}</span></p>`).join('');const input=box.querySelector('textarea');if(document.activeElement!==input&&!drafts[input.dataset.memberKey])input.value=records[input.dataset.memberKey]?.field_value||'';}
}
function applyRows(rows){records=Object.fromEntries(rows.map(r=>[r.field_key,r]));const merge={};let redraw=false;for(const r of rows){const k=r.field_key;if(!shared.test(k)||drafts[k])continue;const input=app.querySelector('[data-field="'+k+'"]');if(input===document.activeElement)continue;merge[k]=r.field_value;if(input)input.value=r.field_value;
 if(/^r[0-3](pick|reveal)$/.test(k)&&JSON.stringify(W.read()[k])!==JSON.stringify(r.field_value))redraw=true;
}W.merge(merge);
 if(redraw&&!Object.keys(drafts).length&&!app.querySelector('textarea:focus'))W.render();else{decorate();showMembers();}
}
async function refresh(){if(!auth||busy||document.hidden)return;const gen=generation;busy=true;try{const d=await request({action:teacher?'teacher':'read',...(teacher?{}:{team:auth.team})});if(gen!==generation||!auth)return;if(teacher){allRows=d.records;showTeacher();}else applyRows(d.records);message('متصل · آخرین دریافت '+new Date().toLocaleTimeString('fa-IR')+(Object.keys(drafts).length?' · '+fa(Object.keys(drafts).length)+' تغییر هنوز اشتراک‌گذاری نشده':''));}catch(e){if(gen!==generation)return;message((e.status===401?'کد منقضی یا لغو شده؛ دوباره وارد شوید.':'ارتباط قطع است؛ پیش‌نویس شما حفظ شده است. ')+e.message,true);}finally{if(gen===generation)busy=false;}}
async function join(code){try{const d=await request({action:'login'},code);const identity=d.identity;if(teacher?identity.role!=='teacher':identity.role!=='team')throw Error('این کد برای این صفحه یا گروه نیست.');auth={...identity,code:d.session||code};generation++;busy=false;try{sessionStorage.setItem(sessionKey,JSON.stringify(auth));if(!teacher&&!localStorage.getItem('alborz-offline-backup-'+W.group))localStorage.setItem('alborz-offline-backup-'+W.group,JSON.stringify(W.read()));}catch{}if(!teacher&&identity.team!==W.group){location.replace('resilience.html?group='+identity.team);return;}mount();await refresh();clearInterval(timer);timer=setInterval(refresh,10000);}catch(e){message(e.message,true);}}
async function logout(){try{await request({action:'logout'});}catch{}generation++;auth=null;records={};allRows=[];busy=false;clearInterval(timer);try{sessionStorage.removeItem(sessionKey);}catch{}mount();message('اتصال بسته شد؛ پیش‌نویس‌های ذخیره‌نشده در همین تب باقی می‌مانند.');}


function meaningful(x,min=20){return String(x??'').trim().length>=min;}
function activityMetrics(by,i){
 if(i===4){
  const fields=['createdContext','createdChoice','createdEvent','createdDialogue','createdRevision'];
  const checks=fields.map((k,j)=>({label:['تعریف موقعیت','تفکیک راهبردها','طراحی اتفاق','گفت‌وگوی نمونه','بازاندیشی و اصلاح'][j],ok:meaningful(by[k]?.field_value)}));
  return {points:checks.filter(c=>c.ok).length*2,checks,earned:checks.every(c=>c.ok)};
 }
 const get=k=>by['r'+i+k]?.field_value;
 const selected=get('pick'),picks=Array.isArray(selected)?selected:[];
 const voices=Array.from({length:5},(_,j)=>get('member'+(j+1))).filter(x=>meaningful(x,12)).length;
 const checks=[
  {label:'انتخاب حداقل دو اقدام',ok:picks.length>=2},
  {label:'تصمیم اولیه مستدل',ok:meaningful(get('initial'))},
  {label:'بازنگری پس از رویداد',ok:get('reveal')===true&&meaningful(get('revision'))},
  {label:'ثبت شاهد قابل بررسی',ok:meaningful(get('evidence'))},
  {label:'مشارکت حداقل دو عضو',ok:voices>=2}
 ];
 return {points:checks.filter(c=>c.ok).length*2,checks,earned:checks.every(c=>c.ok)};
}
function achievedBadges(by){
 return W.catalog.badgeNames.map((name,i)=>{
  const m=activityMetrics(by,i),raw=by['instructorScore'+i]?.field_value;
  const teacherScore=raw===null||raw===undefined||raw===''?null:Number(raw);
  return {name,emoji:W.catalog.models[i][0],earned:m.earned,points:m.points,checks:m.checks,teacherScore:Number.isFinite(teacherScore)?teacherScore:null};
 });
}
function badgeCards(items){
 return '<div class="earned-badges">'+items.map(x=>
  '<div class="earned-badge '+(x.earned?'earned':'pending')+'"><span>'+x.emoji+'</span><b>'+E(x.name)+'</b><small>فعالیت خودکار: '+fa(x.points)+' از ۱۰ · '+(x.earned?'نشان کسب‌شده':'در حال تکمیل')+'</small>'+
  (x.teacherScore!==null?'<small>ارزیابی کیفی مدرس: '+fa(x.teacherScore)+' از ۱۰</small>':'')+
  '<details><summary>معیارهای تکمیل</summary>'+x.checks.map(c=>'<p class="small">'+(c.ok?'✓ ':'○ ')+E(c.label)+'</p>').join('')+'</details></div>'
 ).join('')+'</div>';
}
function batchScoreTable(groups){
 const labels=['مأموریت ۱ · شتر','مأموریت ۲ · ماهی آزاد','مأموریت ۳ · آفتاب‌پرست','مأموریت ۴ · اختاپوس','سناریوسازی'];
 const unsaved=Object.keys(gradeDrafts).filter(k=>k.endsWith(':'+gradeRound)).length;
 return '<section class="panel fast-grade-panel"><h3>امتیازدهی سریع گروه‌ها</h3>'+
 '<p>امتیاز فعالیت و نشان‌ها خودکار محاسبه می‌شوند. ارزیابی کیفی مدرس اختیاری و مستقل است؛ برای ثبت آن فقط یک بار در پایان هر مأموریت اقدام کنید.</p>'+
 '<div class="fast-grade-rounds" role="group" aria-label="انتخاب مأموریت امتیازدهی">'+labels.map((label,i)=>
 '<button type="button" class="btn '+(i===gradeRound?'primary':'')+'" data-score-round="'+i+'" aria-pressed="'+(i===gradeRound?'true':'false')+'">'+E(label)+'</button>').join('')+'</div>'+
 '<div class="table-scroll"><table class="fast-grade-table"><thead><tr><th scope="col">گروه</th><th scope="col">فعالیت خودکار</th><th scope="col">امتیاز اختیاری مدرس /۱۰</th></tr></thead><tbody>'+
 groups.map(g=>{const by=Object.fromEntries(g.rows.map(r=>[r.field_key,r])),key=g.team+':'+gradeRound,rec=by['instructorScore'+gradeRound],original=rec?.field_value??'',draft=gradeDrafts[key],score=activityMetrics(by,gradeRound);
 return '<tr><th scope="row">'+fa(g.team)+' · '+E(by.teamname?.field_value||'')+'</th><td>'+fa(score.points)+' / ۱۰'+(score.earned?' ✓':'')+'</td><td>'+
 '<input type="number" min="0" max="10" step="1" inputmode="numeric" aria-label="امتیاز کیفی گروه '+fa(g.team)+'" data-batch-grade-input="'+key+'" data-version="'+(draft?.version??rec?.version??0)+'" data-original="'+E(original)+'" value="'+E(draft?.value??original)+'"></td></tr>';}).join('')+
 '</tbody></table></div><p class="small">امتیاز فعالیت، میزان تکمیل مراحل ثبت‌شده را نشان می‌دهد؛ کیفیت علمی تصمیم‌ها باید از روی شواهد و گفت‌وگو قضاوت شود.</p>'+
 '<p id="pending-grade-count" class="small" role="status">'+fa(unsaved)+' تغییر کیفی ذخیره‌نشده در این مأموریت</p>'+
 '<button class="btn primary" data-batch-grade-save="1">ثبت یکجای امتیازهای تغییرکرده</button></section>';
}

function instructorJourney(){const c=W.catalog,milestones=['تشخیص مسئله','توزیع پنج نقش','مذاکره و انتخاب کارت','اجرای گفت‌وگو','اتفاق غیرمنتظره','اصلاح تصمیم','بازخورد و امتیاز'];const e=E;
return '<section class="instructor-roadmap"><div class="hero teacher-hero"><span>مسیر کامل مدرس · A تا Z</span><h2>چهار مأموریت مستقل، انتخاب آزاد برای هر گروه</h2><p>پس از آشنایی اولیه، هر گروه می‌تواند از هر مأموریتی شروع کند. ترتیب اجرای چهار مأموریت برای گروه‌ها مستقل است. همه چهار مأموریت باید تا پایان کارگاه تجربه شوند.</p></div>'+
'<div class="teacher-metrics"><span>۱۱ ساعت با استراحت</span><span>۱۰ گروه قابل‌دسترسی</span><span>۴ مأموریت مستقل</span><span>۴ نشان خودکار + ارزیابی اختیاری</span></div>'+
'<h3>نقشه دوره (ترتیب مأموریت‌ها آزاد است)</h3><div class="teacher-timeline">'+c.stages.map((x,i)=>'<div class="timeline-item"><strong>'+fa(i+1)+'. '+e(x[0])+'</strong><span>'+fa(x[1])+' دقیقه</span><p>'+e(x[2])+'</p></div>').join('')+'</div>'+
'<p class="instructor-note">مجموع مراحل آموزشی ۶۳۵ دقیقه است؛ ۲۵ دقیقه استراحت بین مأموریت‌ها در نظر بگیرید. زمان‌بندی عملی با شرایط کلاس قابل تنظیم است.</p>'+
'<h3>راهنمای چهار مأموریت · به هر ترتیب</h3><nav class="teacher-mission-nav">'+c.models.map((m,i)=>'<a href="#instructor-mission-'+i+'">'+m[0]+' '+e(m[1])+'</a>').join('')+'</nav>'+
c.missions.map((m,i)=>{const x=c.embedded[i],model=c.models[i];return '<details class="teacher-mission" data-mission="'+i+'" id="instructor-mission-'+i+'" '+(i===(requestedMission>=0?requestedMission:0)?'open':'')+'><summary><span class="teacher-animal">'+model[0]+'</span><span><strong>مأموریت '+fa(i+1)+' · '+e(model[1])+'</strong><small>'+e(m.title)+' · '+fa(c.missionTime[i])+' دقیقه</small></span></summary>'+
'<div class="teacher-mission-body"><div class="teacher-main-aim"><b>هدف تمرین به زبان ساده</b><p>'+e(c.cases[i].goal)+'</p></div><details><summary>نکته تخصصی برای مدرس (اختیاری)</summary><p>'+e(model[4])+'؛ '+e(model[5])+'</p><p><b>مرز راهبرد:</b> '+e(model[7])+'</p></details>'+
'<h4>۱. چه اتفاقی افتاده؟</h4><p>'+e(c.cases[i].situation)+'</p><h4>داده‌هایی که گروه دارد</h4><ul class="facilitator-case-facts">'+c.cases[i].facts.map(f=>'<li>'+e(f)+'</li>').join('')+'</ul><div class="teacher-case-task"><b>از گروه چه می‌خواهیم؟</b><p>'+e(c.cases[i].task)+'</p><p><b>پرسش اصلی:</b> '+e(c.cases[i].question)+'</p></div><details><summary>راهنمای تحلیل راهبرد برای مدرس</summary><p>بخش بیمه: '+e(m.line)+' · راهبرد: '+model[0]+' '+e(model[1])+'</p></details>'+
'<h4>۲. تقسیم نقش‌ها و اطلاعات</h4><div class="roles">'+c.roles.map((r,j)=>'<article class="role"><b>عضو '+fa((j+i)%5+1)+' · '+e(r)+'</b><p>'+e(m.info[j])+'</p></article>').join('')+'</div>'+
'<h4>۳. انتخاب اقدام با بودجه ۶ سکه</h4><div class="teacher-action-list">'+m.actions.map(a=>'<div><b>'+e(a[0])+'</b> · '+fa(a[1])+' سکه<p>'+e(a[2])+'</p></div>').join('')+'</div>'+
'<h4>۴. گفت‌وگوی شروع</h4><div class="teacher-dialogue">'+m.dialog.map(t=>'<p>'+e(t)+'</p>').join('')+'</div>'+
'<h4>۵. مدیریت خشم و جرأت‌ورزی</h4><div class="skill-layers"><div><b>تنظیم هیجان</b><p>'+e(x.anger)+'</p></div><div><b>جرأت‌ورزی</b><p>'+e(x.assertion)+'</p></div></div><p><b>دور اول:</b> '+e(x.first)+'</p><p><b>پرسش مشاهده‌گر:</b> '+e(x.check)+'</p><p><b>دور دوم:</b> '+e(x.second)+'</p>'+
'<h4>۶. کارت اتفاق و تغییر تصمیم</h4><div class="twist">'+e(m.shock)+'</div><p><b>چالش تکمیلی:</b> '+e(x.twist)+'</p>'+
'<h4>۷. تحلیل و امتیاز</h4><ol>'+c.rubric.map(r=>'<li>'+e(r)+' (صفر، یک یا دو)</li>').join('')+'</ol><p>هر معیار با شواهد رفتاری ارزیابی می‌شود. نشان «'+e(c.badgeNames[i])+'» به‌صورت خودکار با تکمیل پنج معیار فعالیت مشترک فعال می‌شود. امتیاز کیفی مدرس مستقل و اختیاری است.</p>'+
'<div class="teacher-run"><b>ریتم پیشنهادی</b><p>۱۰ دقیقه Briefing · ۱۲ دقیقه تقسیم نقش و خواندن شواهد · ۱۵ دقیقه تصمیم با بودجه · ۲۰ دقیقه دو دور گفت‌وگو · ۸ دقیقه اتفاق جدید · ۱۵ دقیقه تحلیل و بازخورد · '+fa(c.missionTime[i]-80)+' دقیقه جمع‌بندی و ثبت.</p></div></div></details>';}).join('')+
'<section class="panel"><h3>۸. طراحی سناریو توسط گروه‌ها</h3><p>هر گروه پس از تمرین هر چهار مأموریت، یک سناریو طراحی می‌کند و با گروه دیگر مبادله می‌کند. در دور پنجم نقش‌ها یک خانه جابه‌جا می‌شوند تا همه اعضا هر پنج نقش را تجربه کرده باشند.</p><h3>۹. شورای تصمیم</h3><p>گروه‌ها در پایان چهار مأموریت، تصمیم اولیه، اتفاق جدید و تغییر تصمیم خود را کوتاه ارائه می‌کنند. مدرس می‌تواند بازخورد کیفی اختیاری را یکجا ثبت کند.</p><h3>۱۰. انتقال به کار</h3><p>پس‌سنجی فردی، مرور شواهد، یک اقدام مشخص، زمان اجرا و فرد حامی تعیین می‌شود. این بخش سنجش مستقیم عملکرد شغلی نیست.</p><p><b>نکته ایمنی:</b> فقط از پرونده‌های فرضی استفاده کنید؛ شماره پرونده و اطلاعات محرمانه مشتری نباید وارد سامانه شود.</p></section></section>';
}

function showTeacher(){const el=document.getElementById('live-dashboard');if(!el)return;
for(const b of app.querySelectorAll('[data-teacher-tab]')){const selected=b.dataset.teacherTab===teacherMode;b.classList.toggle('primary',selected);b.setAttribute('aria-pressed',String(selected));}
if(teacherMode==='journey'){if(!el.querySelector('.instructor-roadmap'))el.innerHTML=instructorJourney();if(requestedMission>=0){const target=el.querySelector('#instructor-mission-'+requestedMission);if(target&&!target.dataset.highlighted){target.dataset.highlighted='1';requestAnimationFrame(()=>target.scrollIntoView({behavior:'smooth',block:'start'}));}}return;}const open=[...el.querySelectorAll('details[open]')].map(x=>x.dataset.team);const focus=document.activeElement;if(el.contains(focus)&&focus.matches('input'))return;
 const groups=Array.from({length:10},(_,i)=>({team:i+1,rows:allRows.filter(r=>r.team_no===i+1)}));
 el.innerHTML=`${batchScoreTable(groups)}<p><b>${fa(groups.filter(g=>g.rows.length).length)}</b> گروه دارای ثبت · ${fa(allRows.filter(r=>/^r[0-3]member/.test(r.field_key)&&r.field_value).length)} مشارکت در مأموریت‌ها</p><div class="grid">${groups.map(g=>{const by=Object.fromEntries(g.rows.map(r=>[r.field_key,r]));const stage=Number(by.stage?.field_value),stageLabel=Number.isInteger(stage)&&stage>=3&&stage<=6?W.catalog.models[stage-3][0]+' '+W.catalog.models[stage-3][1]:by.stage?'بخش '+fa(stage+1):'هنوز اعلام نشده';return `<article class="skill"><h3>گروه ${fa(g.team)} · ${E(by.teamname?.field_value||'')}</h3><p><b>انتخاب فعلی گروه:</b> ${E(stageLabel)}</p><p>تصمیم اولیه: ${fa([0,1,2,3].filter(i=>by['r'+i+'initial']?.field_value).length)} از ۴ · اصلاح تصمیم: ${fa([0,1,2,3].filter(i=>by['r'+i+'revision']?.field_value).length)} از ۴</p><details data-team="${g.team}" ${open.includes(String(g.team))?'open':''}><summary>مشاهده تصمیم‌ها و مشارکت اعضا</summary>${[0,1,2,3].map(i=>`<h4>مأموریت ${fa(i+1)}</h4>${[1,2,3,4,5].map(j=>`<p><b>عضو ${fa(j)}:</b> ${E(by['r'+i+'member'+j]?.field_value||'—')}</p>`).join('')}<p><b>تصمیم:</b> ${E(by['r'+i+'initial']?.field_value||'—')}</p><p><b>اصلاح:</b> ${E(by['r'+i+'revision']?.field_value||'—')}</p><p><b>شواهد:</b> ${E(by['r'+i+'evidence']?.field_value||'—')}</p>`).join('')}</details><p class="small">امتیازهای کیفی اختیاری این گروه در جدول یکپارچه بالا ثبت می‌شود.</p>${badgeCards(achievedBadges(by))}</article>`;}).join('')}</div>`;
}
async function publish(k){if(!auth||teacher)return;const value=drafts[k]?.value??W.read()[k]??'';if(!drafts[k])draft(k,value);const entry={...drafts[k]},gen=generation;try{const d=await request({action:'write',team:auth.team,fields:{[k]:entry.value},expected:{[k]:entry.base}});if(gen!==generation)return;for(const r of d.records)records[r.field_key]=r;if(JSON.stringify(drafts[k]?.value)===JSON.stringify(entry.value))delete drafts[k];else if(drafts[k])drafts[k].base=d.records[0].version;persistDrafts();document.getElementById('conflict-'+k)?.remove();message('با گروه به اشتراک گذاشته شد ✓');await refresh();}catch(e){if(gen!==generation)return;if(e.status===409){await refresh();conflict(k);}else message('ذخیره انجام نشد؛ پیش‌نویس حفظ شد. '+e.message,true);}}
function conflict(k){let el=document.getElementById('conflict-'+k);if(!el){el=document.createElement('div');el.id='conflict-'+k;el.className='twist';app.querySelector('[data-live-save="'+k+'"]')?.after(el);}el.innerHTML=`<b>تعارض ویرایش؛ متن شما حذف نشده است</b><p>نسخه تازه گروه: <span style="white-space:pre-wrap">${E(records[k]?.field_value??'')}</span></p><p>پیش‌نویس شما: <span style="white-space:pre-wrap">${E(typeof drafts[k]?.value==='string'?drafts[k].value:JSON.stringify(drafts[k]?.value))}</span></p><button class="btn" data-resolve="server:${k}">پذیرش نسخه گروه</button> <button class="btn" data-resolve="draft:${k}">نسخه گروه را دیدم؛ ادامه با پیش‌نویس من</button>`;message('تعارض ویرایش را بررسی کنید؛ هیچ بازنویسی خودکار انجام نشد.',true);}
window.addEventListener('alborz:render',mount);
app.addEventListener('input',e=>{
 const t=e.target,k=t.dataset.field||t.dataset.memberKey;
 if(k)draft(k,t.value);
 if(t.dataset.batchGradeInput){
  const id=t.dataset.batchGradeInput;
  if(t.value===t.dataset.original)delete gradeDrafts[id];
  else gradeDrafts[id]={value:t.value,version:Number(t.dataset.version)||0};
  const pending=document.getElementById('pending-grade-count');
  if(pending)pending.textContent=fa(Object.keys(gradeDrafts).filter(x=>x.endsWith(':'+gradeRound)).length)+' تغییر کیفی ذخیره‌نشده در این مأموریت';
 }
});
app.addEventListener('change',e=>{const t=e.target;if(t.dataset.field)draft(t.dataset.field,t.value);if(t.dataset.pick)draft('r'+t.dataset.pick.split(':')[0]+'pick',W.read()['r'+t.dataset.pick.split(':')[0]+'pick']);});
app.addEventListener('click',async e=>{const b=e.target.closest('button');if(!b)return;
 if(b.dataset.teacherTab&&auth?.role==='teacher'){teacherMode=b.dataset.teacherTab;showTeacher();return;}
 if(b.dataset.scoreRound!==undefined&&auth?.role==='teacher'){gradeRound=Number(b.dataset.scoreRound);showTeacher();return;}
 if(b.dataset.batchGradeSave&&auth?.role==='teacher'){
  const pending=Object.entries(gradeDrafts).filter(([key])=>key.endsWith(':'+gradeRound));
  if(!pending.length){message('در این مأموریت امتیاز تغییری نکرده است.');return;}
  for(const [key,item] of pending)if(item.value===''||!Number.isInteger(Number(item.value))||Number(item.value)<0||Number(item.value)>10){message('امتیازهای اختیاری باید عدد صحیح صفر تا ۱۰ باشند؛ کادر نامعتبر را اصلاح کنید.',true);return;}
  b.disabled=true;let saved=0;const failures=[];
  try{
   for(const [key,item] of pending){
    const [team,i]=key.split(':').map(Number);
    try{await request({action:'grade',team,fields:{['instructorScore'+i]:Number(item.value)},expected:{['instructorScore'+i]:item.version}});delete gradeDrafts[key];saved++;}
    catch(err){failures.push('گروه '+fa(team)+': '+err.message);}
   }
   await refresh();
   message(failures.length?'امتیاز '+fa(saved)+' گروه ثبت شد؛ '+fa(failures.length)+' ثبت ناموفق. '+failures.join('، '):'امتیازهای کیفی '+fa(saved)+' گروه با موفقیت ثبت شدند.',!!failures.length);
  }finally{b.disabled=false;}
  return;
 }
 if(b.id==='live-join'){b.disabled=true;await join(document.getElementById('live-code').value.trim().replace(/[۰-۹٠-٩]/g,c=>String(c.charCodeAt(0)-(c.charCodeAt(0)>=1776?1776:1632))).toLowerCase());b.disabled=false;}
 if(b.id==='live-logout')logout();
 if(b.id==='live-stage'){draft('stage',W.step);await publish('stage');}
 if(b.dataset.action==='reveal'&&auth){const k='r'+b.dataset.value+'reveal';if(W.read()[k])draft(k,true);decorate();}
 if(b.dataset.liveSave){b.disabled=true;await publish(b.dataset.liveSave);b.disabled=false;}
 if(b.dataset.resolve){const [mode,k]=b.dataset.resolve.split(':');if(mode==='server'){delete drafts[k];W.merge({[k]:records[k]?.field_value});persistDrafts();W.render();}else{drafts[k].base=records[k]?.version??0;persistDrafts();document.getElementById('conflict-'+k)?.remove();message('پیش‌نویس را بازبینی کنید و برای ثبت، دوباره اشتراک با گروه را بزنید.');}}
 if(b.dataset.gradeSave&&auth?.role==='teacher'){const [team,i]=b.dataset.gradeSave.split(':').map(Number),input=app.querySelector('[data-grade="'+team+':'+i+'"]');if(input.value===''||!Number.isInteger(Number(input.value))||Number(input.value)<0||Number(input.value)>10){message('امتیاز باید عدد صحیح صفر تا ۱۰ باشد.',true);return;}const k='instructorScore'+i,base=Number(input.dataset.version)||0;b.disabled=true;try{await request({action:'grade',team,fields:{[k]:Number(input.value)},expected:{[k]:base}});input.blur();await refresh();message('امتیاز مدرس ثبت شد.');}catch(e){message(e.message,true);}finally{b.disabled=false;}}
});
window.addEventListener('beforeunload',e=>{if(Object.keys(drafts).length){e.preventDefault();e.returnValue='';}});
document.addEventListener('visibilitychange',()=>{if(!document.hidden)refresh();});
mount();try{const cached=JSON.parse(sessionStorage.getItem(sessionKey)||'null');if(cached?.code&&(teacher?cached.role==='teacher':cached.role==='team'))join(cached.code);}catch{}
})();
