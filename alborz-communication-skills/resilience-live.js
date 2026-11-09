'use strict';
(()=>{
const W=window.AlborzWorkshop,params=new URLSearchParams(location.search),teacher=params.has('teacher'),classroom=params.get('classroom')==='1';
const requestedMission=['camel','salmon','chameleon','octopus'].indexOf(params.get('mission'));
// The local-only scorecard is an explicit offline fallback, never a second live instructor dashboard.
if(!W||(teacher&&params.get('offline')==='1'))return;
const endpoint='https://cymatyfnwuxikrghydrn.supabase.co/functions/v1/alborz-workshop-sync';
const shared=/^(?:teamname|stage|r[0-3](?:pick|initial|revision|reveal|score[0-4]|evidence|member[1-5])|created(?:Context|Roles|Choice|Event|Dialogue|Debrief|Revision|score[0-4]|evidence)|pitch)$/;
const E=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const fa=x=>Number(x).toLocaleString('fa-IR');
const sessionKey='alborz-live-v5-national-session',draftKey='alborz-live-v3-drafts-'+W.group;
const app=document.getElementById('app');let auth=null,records={},drafts={},timer,busy=false,generation=0,allRows=[],statusText='',statusBad=false,teacherMode='journey',gradeRound=0,gradeDrafts={},monitorMission=requestedMission>=0?requestedMission:0,teacherPhase=0;
try{drafts=JSON.parse(sessionStorage.getItem(draftKey)||'{}');if(!drafts||typeof drafts!=='object'||Array.isArray(drafts))drafts={};}catch{drafts={};}
function persistDrafts(){try{sessionStorage.setItem(draftKey,JSON.stringify(drafts));}catch{}}
function message(text,bad=false){statusText=text;statusBad=bad;const e=document.getElementById('live-status');if(e){e.textContent=text;e.classList.toggle('warning',bad);}}
async function request(body,code=auth?.code){const controller=new AbortController(),timeout=setTimeout(()=>controller.abort(),15000);try{const r=await fetch(endpoint,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({...body,code}),signal:controller.signal,cache:'no-store'});const d=await r.json();if(!r.ok){const e=Error(d.error||'خطای ارتباط');e.status=r.status;throw e;}return d;}finally{clearTimeout(timeout);}}
function panel(){let el=document.getElementById('live-panel');if(!el){el=document.createElement('section');el.id='live-panel';el.className='panel';app.prepend(el);}return el;}
function mount(){const el=panel();el.classList.toggle('live-authenticated',!!auth);
 if(classroom){
  if(!auth){
   el.innerHTML='<div class="classroom-login"><h2>'+(teacher?'ورود مدرس':'ورود کارشناسان به کارگاه')+'</h2>'+
   '<p>'+(teacher?'کد ملی ده‌رقمی مدرس را وارد کنید؛ پنل هدایت کلاس بدون PIN یا رمز دیگر باز می‌شود.':'کد ملی ده‌رقمی را وارد کنید؛ گروه و شماره عضو در اولین ورود خودکار تعیین می‌شود.')+'</p>'+
   '<label class="field"><span>'+(teacher?'کد ملی مدرس':'کد ملی')+'</span><input id="live-code" type="text" inputmode="numeric" maxlength="10" autocomplete="off" dir="ltr" placeholder="کد ملی ۱۰ رقمی"></label>'+
   
   '<button class="btn primary" id="live-join">ورود به کارگاه</button><p id="live-status" role="status"></p></div>';
  }else{
   el.innerHTML='<div class="classroom-auth-line"><span>'+ (teacher?'🎓 مدرس · کنترل مراحل کلاس':'✅ گروه '+fa(auth.team)+' · عضو '+fa(auth.member))+'</span><button type="button" class="btn" id="live-logout">خروج</button></div><p id="live-status" class="classroom-connect-status" role="status"></p>';
  }
  message(statusText,statusBad);
  window.dispatchEvent(new CustomEvent('alborz:classroom-auth',{detail:{connected:!!auth,identity:auth?{role:auth.role,team:auth.team,member:auth.member}:null}}));
  return;
 }
if(!auth){
 el.innerHTML='<h2>'+(teacher?'ورود مدرس':'ورود شرکت‌کننده')+'</h2><p>'+(teacher?'کد ملی ده‌رقمی مدرس را وارد کنید؛ رمز دیگری لازم نیست.':'با کد ملی خود وارد شوید؛ گروه شما هنگام ورود مشخص می‌شود.')+'</p>'+
 '<label class="field"><span>'+(teacher?'کد ملی مدرس':'کد ملی')+'</span><input id="live-code" type="text" inputmode="numeric" maxlength="10" autocomplete="off" dir="ltr" placeholder="کد ملی ۱۰ رقمی"></label>'+
 
 '<button class="btn primary" id="live-join">اتصال</button><p id="live-status" role="status"></p>';
}else{el.innerHTML=`<div class="navline"><h2>${teacher?'داشبورد زنده مدرس':'گروه '+fa(auth.team)+' · عضو '+fa(auth.member)}</h2><button class="btn" id="live-logout">خروج از اتصال</button></div><p id="live-status" role="status"></p><p class="small">برای دیده‌شدن پاسخ در پنل مدرس، کارشناسان «اشتراک با گروه» را می‌زنند. دریافت پاسخ‌ها خودکار است.</p>${teacher?'<div id="live-dashboard"></div>':'<button class="btn" id="live-stage">'+(W.step>=3&&W.step<=6?'اعلام شروع مأموریت '+fa(W.step-2)+' به مدرس':'اعلام حضور در بخش '+fa(W.step+1))+'</button><div id="live-members"></div>'}`;
 if(teacher){for(const section of [...app.querySelectorAll('section.panel')])if(section!==el&&section.querySelector('h2')?.textContent.includes('جدول رقابت'))section.remove();showTeacher();}else{decorate();if(W.step>=3&&W.step<=6){const phase=W.currentPhase?.()??0;const stage=app.querySelector('#live-stage'),members=app.querySelector('#live-members');if(stage)stage.hidden=phase!==0;if(members)members.hidden=phase!==6;}}}
 message(statusText,statusBad);
}
function draft(k,value){if(!auth||teacher||!shared.test(k))return;drafts[k]={value,base:drafts[k]?.base??records[k]?.version??0};persistDrafts();}
function decorate(){if(!auth||teacher)return;
 for(const input of app.querySelectorAll('[data-field]')){const k=input.dataset.field;if(!shared.test(k))continue;if(input.dataset.liveDecorated)continue;input.dataset.liveDecorated='1';const b=document.createElement('button');b.type='button';b.className='btn live-save';b.dataset.liveSave=k;b.textContent='اشتراک با گروه';input.closest('label')?.after(b);}
 for(const i of [0,1,2,3]){if(!app.querySelector('[data-pick="'+i+':0"]'))continue;const k='r'+i+'pick';if(!app.querySelector('[data-live-save="'+k+'"]')){const b=document.createElement('button');b.className='btn';b.dataset.liveSave=k;b.textContent='اشتراک انتخاب کارت‌ها';app.querySelector('[data-pick="'+i+':3"]').closest('label').after(b);}const r='r'+i+'reveal';if(W.read()[r]&&!app.querySelector('[data-live-save="'+r+'"]')){const b=document.createElement('button');b.className='btn';b.dataset.liveSave=r;b.textContent='اشتراک بازشدن رویداد';app.querySelector('[data-action="reveal"][data-value="'+i+'"]').after(b);}}
 showMembers();
}
function showMembers(){const el=document.getElementById('live-members');if(!el||!auth)return;const rounds=W.step>=3&&W.step<=6?[W.step-3]:[];
 // Do not rebuild the member textarea while it is being edited.
 for(const i of rounds){let box=document.getElementById('live-round-'+i);if(!box){box=document.createElement('details');box.id='live-round-'+i;box.open=false;const k='r'+i+'member'+auth.member;box.innerHTML=`<summary>مشارکت اعضا · مأموریت ${fa(i+1)}</summary><label class="field"><span>نظر من · عضو ${fa(auth.member)}</span><textarea data-member-key="${k}" maxlength="2500">${E(drafts[k]?.value??records[k]?.field_value??'')}</textarea></label><button class="btn" data-live-save="${k}">اشتراک با گروه</button><div class="member-list"></div>`;el.append(box);}box.querySelector('.member-list').innerHTML=Array.from({length:5},(_,j)=>`<p><b>عضو ${fa(j+1)}:</b> <span style="white-space:pre-wrap">${E(records['r'+i+'member'+(j+1)]?.field_value||'هنوز نظری ثبت نشده')}</span></p>`).join('');const input=box.querySelector('textarea');if(document.activeElement!==input&&!drafts[input.dataset.memberKey])input.value=records[input.dataset.memberKey]?.field_value||'';}
}
function applyRows(rows){records=Object.fromEntries(rows.map(r=>[r.field_key,r]));const merge={};let redraw=false;for(const r of rows){const k=r.field_key;if(!shared.test(k)||drafts[k])continue;const input=app.querySelector('[data-field="'+k+'"]');if(input===document.activeElement)continue;merge[k]=r.field_value;if(input)input.value=r.field_value;
 if(/^r[0-3](pick|reveal)$/.test(k)&&JSON.stringify(W.read()[k])!==JSON.stringify(r.field_value))redraw=true;
}W.merge(merge);
 if(redraw&&!Object.keys(drafts).length&&!app.querySelector('textarea:focus'))W.render();else{decorate();showMembers();}
}
async function refresh(force=false){
 if(!auth||(!force&&document.hidden))return;
 // A deliberate classroom refresh must never be silently discarded behind another poll.
 if(busy){
  if(!force)return;
  for(let attempt=0;busy&&attempt<160;attempt++)await new Promise(resolve=>setTimeout(resolve,100));
  if(busy||!auth)return;
 }
 const gen=generation;busy=true;try{const d=await request({action:teacher?'teacher':'read',...(teacher?{}:{team:auth.team})});if(gen!==generation||!auth)return;if(classroom){
  if(teacher)allRows=d.records;else records=Object.fromEntries(d.records.map(r=>[r.field_key,r]));
  window.dispatchEvent(new CustomEvent('alborz:classroom-data',{detail:{identity:{role:auth.role,team:auth.team,member:auth.member},records:d.records,classroom:d.classroom||null}}));
 }else if(teacher){allRows=d.records;showTeacher();}else applyRows(d.records);message('متصل · آخرین دریافت '+new Date().toLocaleTimeString('fa-IR')+(Object.keys(drafts).length?' · '+fa(Object.keys(drafts).length)+' تغییر هنوز اشتراک‌گذاری نشده':''));}catch(e){if(gen!==generation)return;message((e.status===401?'کد منقضی یا لغو شده؛ دوباره وارد شوید.':'ارتباط قطع است؛ پیش‌نویس شما حفظ شده است. ')+e.message,true);}finally{if(gen===generation)busy=false;}}
async function join(code){
 try{
  const payload={action:'login',...(teacher?{instructorView:true}:{})};
  const d=await request(payload,code),identity=d.identity;
  if(!teacher&&identity.role==='teacher'){
   auth={...identity,code:d.session||code};
   try{sessionStorage.setItem(sessionKey,JSON.stringify(auth));}catch{}
   location.replace('resilience.html?classroom=1&teacher=1');
   return;
  }
  if(teacher?identity.role!=='teacher':identity.role!=='team')throw Error('این کد برای این صفحه یا گروه نیست.');
  auth={...identity,code:d.session||code};generation++;busy=false;
  try{
   sessionStorage.setItem(sessionKey,JSON.stringify(auth));
   if(!teacher&&!localStorage.getItem('alborz-offline-backup-'+W.group))
    localStorage.setItem('alborz-offline-backup-'+W.group,JSON.stringify(W.read()));
  }catch{}
  if(!teacher&&identity.team!==W.group){
   const missionQuery=requestedMission>=0?'&mission='+encodeURIComponent(params.get('mission')):'';
   location.replace(classroom?'resilience.html?classroom=1&group='+identity.team+missionQuery:'resilience.html?group='+identity.team+'&step='+(requestedMission>=0?requestedMission+3:0)+missionQuery);
   return;
  }
  mount();await refresh();clearInterval(timer);timer=setInterval(refresh,10000);
 }catch(e){message(e.message,true);}
}

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


function instructorJourney(){
 const c=W.catalog,i=monitorMission,n=teacherPhase,m=c.missions[i],caseData=c.cases[i],x=c.embedded[i],model=c.models[i],E2=E;
 const stageTitle=c.missionFlow[n];
 const facts='<ul class="simple-facts">'+caseData.facts.map(v=>'<li>'+E2(v)+'</li>').join('')+'</ul>';
 const soft=(title,body)=>'<details class="teacher-reference"><summary>'+title+'</summary><div>'+body+'</div></details>';
 const steps=[
 {
 lead:'سناریو را بخوانید، مسئله را روشن کنید.',
 say:'«هدف امروز این است: '+caseData.goal+'» سپس بپرسید: '+caseData.question,
 ask:'اطلاعات سناریو را بخوانند و هر گروه، مسئله اصلی را در یک جمله بیان کند.',
 body:'<section class="simple-story"><h3>چه اتفاقی افتاده؟</h3><p>'+E2(caseData.situation)+'</p><h3>اطلاعات لازم</h3>'+facts+'</section>'
 },
 {
 lead:'از گروه‌ها بخواهید نقش‌ها را تقسیم کنند.',
 say:'«هر نفر یکی از نقش‌ها را بگیرد و اطلاعات مخصوص نقش خودش را بخواند. اگر گروه کمتر از پنج نفر است، بعضی نقش‌ها مشترک باشند.»',
 ask:'نقش‌ها را تقسیم و اطلاعات مورد نیاز برای تصمیم را بین اعضا مطرح کنند.',
 body:soft('پنج نقش و اطلاعات هر نفر','<div class="simple-role-list">'+c.roles.map((r,j)=>'<div><strong>'+E2(r)+'</strong><p>'+E2(m.info[j])+'</p></div>').join('')+'</div>')
 },
 {
 lead:'گفت‌وگو را در دو دور اجرا کنید.',
 say:'«دور اول را اجرا کنید. مشاهده‌گر فقط جملات و رفتارهای قابل مشاهده را یادداشت کند. حالا یک بازخورد کوتاه و دور دوم.»',
 ask:'با مدیریت هیجان و جرأت‌ورزی، گفت‌وگو را دوباره و حرفه‌ای‌تر اجرا کنند.',
 body:'<div class="simple-skill-pair"><div><b>مدیریت خشم</b><p>'+E2(x.anger)+'</p></div><div><b>جرأت‌ورزی</b><p>'+E2(x.assertion)+'</p></div></div>'+
 soft('نمونه گفت‌وگو و بازخورد','<p>'+m.dialog.map(v=>E2(v)).join('</p><p>')+'</p><p><b>بازخورد دور اول:</b> '+E2(x.first)+'</p><p><b>سؤال مشاهده‌گر:</b> '+E2(x.check)+'</p><p><b>دور دوم:</b> '+E2(x.second)+'</p>')
 },
 {
 lead:'از گروه‌ها یک تصمیم روشن بخواهید.',
 say:'«با بودجه شش سکه حداقل دو اقدام انتخاب کنید؛ تصمیم را با یک دلیل و مسئول اجرا ثبت و با گروه اشتراک‌گذاری کنید.»',
 ask:'دو اقدام انتخاب کنند، بودجه را رعایت کنند، سپس تصمیم اولیه را بنویسند و دکمه «اشتراک با گروه» را بزنند.',
 body:soft('کارت‌های اقدام و پیامد آن‌ها','<div class="simple-option-list">'+m.actions.map(a=>'<p><b>'+E2(a[0])+' · '+fa(a[1])+' سکه</b><span>'+E2(a[2])+'</span></p>').join('')+'</div>')
 },
 {
 lead:'اتفاق غیرمنتظره را اعلام کنید.',
 say:'«حالا اطلاعات تازه‌ای به پرونده اضافه شده است. ببینیم آیا تصمیم قبلی هنوز جواب می‌دهد.»',
 ask:'در موبایل روی «ثبت تصمیم و آشکارسازی اتفاق» بزنند؛ پیش از آن تصمیم اولیه باید ثبت شده باشد.',
 body:'<div class="simple-event"><strong>اتفاق تازه</strong><p>'+E2(m.shock)+'</p></div><p><b>پرسش مکمل:</b> '+E2(x.twist)+'</p>'
 },
 {
 lead:'تصمیم اصلاح‌شده را دریافت کنید.',
 say:'«با این اطلاعات تازه، دقیقاً چه چیزی را تغییر می‌دهید؟ چرا؟»',
 ask:'تصمیم جدید و دلیل تغییر را بنویسند و با گروه اشتراک‌گذاری کنند.',
 body:'<p class="simple-challenge">'+E2(caseData.question)+'</p>'
 },
 {
 lead:'از تجربه گروه‌ها جمع‌بندی کنید.',
 say:'«یک تصمیم خوب و یک نکته قابل بهبود را با شاهد مشخص بیان کنید.»',
 ask:'مشاهده‌گر یک رفتار یا جمله قابل مشاهده را ثبت و با گروه به اشتراک بگذارد.',
 body:'<div class="simple-recap"><strong>سه سؤال برای بازخورد</strong><ol><li>کدام شاهد، تصمیم شما را تغییر داد؟</li><li>چه چیزی به مشتری و کیفیت رسیدگی کمک کرد؟</li><li>در محیط واقعی کار، یک اقدام قابل اجرا چیست؟</li></ol></div>'+
 soft('معیارهای تخصصی برای مدرس (اختیاری)','<ol>'+c.rubric.map(r=>'<li>'+E2(r)+'</li>').join('')+'</ol>')
 }
 ];
 const item=steps[n];
 return '<section class="simple-teacher-workspace"><div class="simple-workshop-title"><span>پنل اجرای مدرس</span><h2>فقط یک سناریو؛ یک گام در هر لحظه</h2><p>راهبرد را انتخاب کنید، گام را اعلام کنید و نتیجه گروه‌ها را ببینید.</p></div>'+
 '<nav class="simple-animal-selector" aria-label="انتخاب راهبرد">'+c.models.map((a,j)=>'<button type="button" class="'+(j===i?'selected':'')+'" data-teacher-mission="'+j+'" aria-pressed="'+String(j===i)+'">'+a[0]+' '+E2(a[1])+'</button>').join('')+'</nav>'+
 '<header class="simple-case-header"><small>سناریوی '+fa(i+1)+'</small><h2>'+E2(m.title)+'</h2><p>'+E2(caseData.goal)+'</p></header>'+
 '<nav class="simple-teacher-stepbar" aria-label="پیشروی مدرس"><div><span>گام '+fa(n+1)+' از ۷</span><strong>'+E2(stageTitle)+'</strong></div><button type="button" class="btn" data-teacher-prev '+(n===0?'disabled':'')+'>گام قبل</button><button type="button" class="btn primary" data-teacher-next '+(n===6?'disabled':'')+'>گام بعد</button></nav>'+
 '<section class="simple-now"><h3>'+E2(item.lead)+'</h3><div class="simple-two-actions"><article class="simple-say"><span>🎙️ مدرس چه بگوید؟</span><p>'+E2(item.say)+'</p></article><article class="simple-do"><span>📱 کارشناسان چه کنند؟</span><p>'+E2(item.ask)+'</p></article></div><div class="simple-stage-body">'+item.body+'</div></section>'+
 '<details class="simple-live-box" '+(n===3||n===5||n===6?'open':'')+'><summary>مشاهده پاسخ گروه‌ها در این سناریو</summary><div id="teacher-journey-live"></div></details>'+
 '<p class="simple-teacher-footer">مرحله‌های مدرس و کارشناسان عنوان یکسان دارند. حرکت در صفحه مدرس، صفحه موبایل گروه‌ها را خودکار تغییر نمی‌دهد.</p></section>';
}
function refreshTeacherJourneyProgress(){
 const host=document.getElementById('teacher-journey-live');if(!host||!auth||!teacher)return;
 const i=monitorMission,prefix='r'+i;
 const open=new Set([...host.querySelectorAll('details[open]')].map(d=>d.dataset.team));
 const relevant=Array.from({length:10},(_,j)=>{
  const team=j+1,fields=Object.fromEntries(allRows.filter(r=>r.team_no===team).map(r=>[r.field_key,r.field_value]));
  const initial=String(fields[prefix+'initial']||'').trim(),revision=String(fields[prefix+'revision']||'').trim(),evidence=String(fields[prefix+'evidence']||'').trim();
  const stage=Number(fields.stage)===i+3;
  const revealed=fields[prefix+'reveal']===true;
  const members=Array.from({length:5},(_,k)=>String(fields[prefix+'member'+(k+1)]||'').trim()).filter(Boolean).length;
  return {team,initial,revision,evidence,stage,revealed,members};
 }).filter(g=>g.stage||g.initial||g.revision||g.evidence||g.revealed||g.members);
 if(!relevant.length){host.innerHTML='<div class="simple-live-empty">هنوز گروهی در این سناریو پاسخی به اشتراک نگذاشته است. با شروع اجرا، پاسخ‌ها همین‌جا ظاهر می‌شوند.</div>';return;}
 host.innerHTML='<p class="simple-live-count">'+fa(relevant.length)+' گروه دارای فعالیت ثبت‌شده</p><div class="simple-live-list">'+relevant.map(g=>
 '<details data-team="'+g.team+'" '+(open.has(String(g.team))?'open':'')+'><summary>گروه '+fa(g.team)+' · '+(g.revision?'تصمیم اصلاح‌شده ثبت شد':g.initial?'تصمیم اولیه ثبت شد':g.stage?'در حال اجرا':'مشارکت ثبت‌شده')+'</summary>'+
 '<p><b>تصمیم اولیه:</b> '+E(g.initial||'هنوز اشتراک‌گذاری نشده')+'</p><p><b>تصمیم اصلاح‌شده:</b> '+E(g.revision||'هنوز اشتراک‌گذاری نشده')+'</p><p><b>شواهد مشاهده‌گر:</b> '+E(g.evidence||'هنوز اشتراک‌گذاری نشده')+'</p></details>').join('')+'</div>';
}
function showTeacher(force=false){
 const el=document.getElementById('live-dashboard');if(!el)return;
 if(force||!el.querySelector('.simple-teacher-workspace'))el.innerHTML=instructorJourney();
 refreshTeacherJourneyProgress();
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
app.addEventListener('click',async e=>{
 const mission=e.target.closest('[data-teacher-mission]');
 if(mission&&auth?.role==='teacher'){monitorMission=Number(mission.dataset.teacherMission);teacherPhase=0;showTeacher(true);return;}
 const previous=e.target.closest('[data-teacher-prev]'),next=e.target.closest('[data-teacher-next]');
 if((previous||next)&&auth?.role==='teacher'){teacherPhase=Math.max(0,Math.min(6,teacherPhase+(next?1:-1)));showTeacher(true);app.querySelector('.simple-teacher-stepbar')?.scrollIntoView({block:'start'});return;}
 const b=e.target.closest('button');if(!b)return;
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
window.AlborzLive={identity:()=>auth?{role:auth.role,team:auth.team,member:auth.member}:null,request:body=>request(body),refresh:()=>refresh(true),isClassroom:classroom};
mount();try{const cached=JSON.parse(sessionStorage.getItem(sessionKey)||'null');if(cached?.code&&(teacher?cached.role==='teacher':cached.role==='team'))join(cached.code);}catch{}
})();
