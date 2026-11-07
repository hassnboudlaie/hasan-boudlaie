'use strict';
(function classroomApp(){
'use strict';
const params=new URLSearchParams(location.search);
if(params.get('classroom')!=='1')return;
const W=window.AlborzWorkshop,L=window.AlborzLive,root=document.getElementById('classroom-screen');
if(!W||!L||!root)return;
const C=W.catalog,labels=['شتر','ماهی آزاد','آفتاب‌پرست','اختاپوس'],animals=['🐪','🐟','🦎','🐙'];
const names=['تشکیل و تأیید گروه‌ها','معرفی چهار راهبرد','انتخاب مأموریت',...C.missionFlow,'جمع‌بندی و انتخاب دور بعد'];
const keys=['camel','salmon','chameleon','octopus'];
const E=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const fa=n=>Number(n).toLocaleString('fa-IR');
const formatText=x=>E(x||'هنوز پاسخی ثبت نشده است');
const requested=keys.indexOf(params.get('mission'));
let identity=L.identity(),rows=[],stage=0,stageVersion=0,reference=requested>=0?requested:0,lastFingerprint='',notice='',busy=false,needsRefresh=false;
function rec(team,key){return rows.find(r=>Number(r.team_no)===Number(team)&&r.field_key===key)||null;}
function val(team,key){return rec(team,key)?.field_value;}
function version(team,key){return rec(team,key)?.version??0;}
function groupChoice(team){const v=val(team,'missionChoice');return Number.isInteger(v)&&v>=0&&v<=3?v:null;}
function size(team){const v=val(team,'groupSize');return [3,4,5,6].includes(v)?v:0;}
function confirmed(team){return val(team,'groupReady')===true;}
function checkin(team,j){return val(team,'checkin'+j)===true;}
function attendance(team){return Array.from({length:5},(_,j)=>checkin(team,j+1)).filter(Boolean).length;}
function groups(){return Array.from({length:10},(_,i)=>i+1);}
function clearNotice(){notice='';}
function alertUser(text,error=false){notice=text;let el=root.querySelector('#classroom-feedback');if(el){el.textContent=text;el.classList.toggle('is-error',error);}else render(true);}
function className(){return identity?.role==='teacher'?'مدرس کارگاه':'گروه '+fa(identity?.team||0)+' · عضو '+fa(identity?.member||0);}
function lessonRow(){return '<div class="class-stage-marker"><span>مرحله '+fa(stage+1)+' از ۱۱</span><strong>'+E(names[stage])+'</strong></div>';}
function messageBox(){return '<p id="classroom-feedback" class="classroom-feedback" role="status">'+E(notice)+'</p>';}
function simpleTitle(kicker,title,description){return '<div class="classroom-section-title"><span>'+E(kicker)+'</span><h2>'+E(title)+'</h2>'+(description?'<p>'+E(description)+'</p>':'')+'</div>';}
function personDots(team){return '<div class="classroom-member-dots">'+Array.from({length:5},(_,j)=>'<span class="'+(checkin(team,j+1)?'has-arrived':'')+'">عضو '+fa(j+1)+(checkin(team,j+1)?' ✓':' ○')+'</span>').join('')+'</div>';}
function rosterTeacher(){
 const ready=groups().filter(confirmed).length,attending=groups().reduce((n,t)=>n+attendance(t),0);
 return simpleTitle('مرحله شروع','گروه‌ها را آماده کنیم','کارشناسان با PIN وارد می‌شوند و حضور خود را ثبت می‌کنند. تعداد افراد حاضر را مشخص و هر گروه را تأیید کن.')+
 '<div class="classroom-stats"><span>'+fa(ready)+' گروه تأیید‌شده</span><span>'+fa(attending)+' عضو با PIN حاضر</span></div>'+
 '<div class="classroom-team-list">'+groups().map(t=>{const n=size(t),c=attendance(t);return '<article class="classroom-team-row"><div><h3>گروه '+fa(t)+(confirmed(t)?'<small class="class-ready">آماده ✓</small>':'')+'</h3><p>'+fa(c)+' حضور با PIN ثبت‌شده · تعداد اعلامی: '+(n?fa(n):'هنوز مشخص نشده')+'</p>'+personDots(t)+'</div><label>تعداد حاضر<select data-class-team-size="'+t+'"><option value="0" '+(!n?'selected':'')+'>فعال نیست</option>'+[3,4,5,6].map(v=>'<option value="'+v+'" '+(v===n?'selected':'')+'>'+fa(v)+' نفر</option>').join('')+'</select></label><button type="button" class="btn '+(confirmed(t)?'':'primary')+'" data-class-confirm="'+t+'">'+(confirmed(t)?'ثبت دوباره':'تأیید گروه')+'</button></article>';}).join('')+'</div>'+
 '<p class="classroom-footnote">اگر شش نفر در یک گروه هستند، تعداد حضور می‌تواند ۶ ثبت شود؛ اما کدهای فعلی حداکثر برای پنج عضو هر گروه صادر شده‌اند. نفر ششم می‌تواند در اجرای حضوری با دستگاه مشترک مشارکت کند؛ PIN ششمِ اختصاصی ایجاد نشده است.</p>';
}
function checkinParticipant(){
 const t=identity.team,m=identity.member,count=attendance(t),done=checkin(t,m);
 return simpleTitle('مرحله ۱','گروه شما مشخص شد','نام گروه و شماره عضو از روی PIN تعیین شده‌اند؛ لازم نیست گروه را دستی انتخاب کنی.')+
 '<div class="classroom-welcome"><div><small>شماره گروه</small><strong>'+fa(t)+'</strong></div><div><small>شماره عضو</small><strong>'+fa(m)+'</strong></div></div>'+
 '<div class="classroom-checkin"><h3>حضور خود را تأیید کن</h3><p>'+(done?'حضور تو ثبت شده است.':'پس از ورود، روی دکمه تأیید حضور بزن.')+'</p><button class="btn primary" data-class-checkin '+(done?'disabled':'')+'>'+(done?'حضور من ثبت شد ✓':'حضورم را تأیید می‌کنم')+'</button></div>'+
 personDots(t)+'<p class="classroom-wait">'+fa(count)+' عضو با PIN حضورشان را ثبت کرده‌اند. '+(confirmed(t)?'مدرس این گروه را تأیید کرده است.':'منتظر تأیید تشکیل گروه توسط مدرس بمانید.')+'</p>';
}
function strategyCards(){
 return '<div class="classroom-strategy-grid">'+C.models.map((m,i)=>'<article><span>'+m[0]+'</span><h3>'+E(m[1])+'</h3><strong>'+E(m[4])+'</strong><p>'+E(m[5])+'</p></article>').join('')+'</div>';
}
function strategyIntro(teacher){
 return simpleTitle('گام آشنایی','چهار راهبرد تاب‌آوری','این‌ها تیپ شخصیتی نیستند؛ چهار انتخاب راهبردی برای موقعیت‌های متفاوت‌اند.')+
 strategyCards()+'<p class="classroom-wait">'+(teacher?'چهار راهبرد را توضیح بده، سپس با دکمه «گام بعد» وارد انتخاب مأموریت شو.':'چهار راهبرد را همراه با توضیحات مدرس مرور کنید؛ انتخاب مأموریت در گام بعد انجام می‌شود.')+'</p>';
}
function missionRoster(){
 const list=groups().filter(t=>confirmed(t)||attendance(t)||groupChoice(t)!==null);
 if(!list.length)return '<p class="classroom-empty">هنوز گروهی تشکیل نشده است.</p>';
 return '<div class="classroom-choice-roster">'+list.map(t=>'<div><strong>گروه '+fa(t)+'</strong><span>'+(groupChoice(t)===null?'مأموریت انتخاب نشده':animals[groupChoice(t)]+' '+labels[groupChoice(t)])+'</span></div>').join('')+'</div>';
}
function chooseMission(){
 const t=identity.team,selected=groupChoice(t);
 return simpleTitle('مرحله انتخاب','مأموریت گروه را انتخاب کنید','به ترتیب دلخواه یکی از چهار راهبرد را انتخاب کنید؛ همه اعضا در همین مأموریت با هم کار می‌کنند.')+
 '<div class="classroom-choice-grid">'+C.models.map((m,i)=>'<button class="'+(selected===i?'selected':'')+'" type="button" data-class-mission="'+i+'"><b>'+m[0]+' '+E(m[1])+'</b><small>'+E(C.missions[i].title)+'</small><span>'+(selected===i?'انتخاب گروه ✓':(requested===i?'پیشنهاد ورود شما':'انتخاب این مأموریت'))+'</span></button>').join('')+'</div>'+
 '<p class="classroom-wait">'+(selected===null?'هنوز مأموریتی برای گروه ثبت نشده است.':'مأموریت «'+labels[selected]+'» ثبت شد. اکنون منتظر شروع سناریو از سوی مدرس بمانید.')+'</p>';
}
function missionTeacherChoice(){
 const ready=groups().filter(confirmed),pending=ready.filter(t=>groupChoice(t)===null);
 return simpleTitle('مرحله انتخاب مأموریت','گروه‌ها مأموریت خود را انتخاب می‌کنند','هر گروه می‌تواند مأموریت متفاوتی بگیرد؛ تو همچنان تمام گروه‌ها را با هفت گام مشترک هدایت می‌کنی.')+
 missionRoster()+'<p class="classroom-wait">'+(pending.length?'هنوز '+fa(pending.length)+' گروه تأیید‌شده مأموریت انتخاب نکرده‌اند.':'گروه‌های تأیید‌شده آماده ورود به سناریو هستند.')+'</p>';
}
function teacherStep(){
 const i=reference,n=stage-3,m=C.missions[i],d=C.cases[i],x=C.embedded[i],mod=C.models[i];
 const say=[
 '«مسئله را بخوانید. هدف ما این است: '+d.goal+'»',
 '«نقش‌ها را بین افراد حاضر تقسیم کنید. هر نفر اطلاعات نقش خود را برای گروه توضیح دهد.»',
 '«گفت‌وگو را یک بار اجرا کنید؛ مشاهده‌گر بازخورد بدهد و گفت‌وگو را بار دوم اصلاح کنید.»',
 '«با شش سکه حداقل دو اقدام انتخاب کنید؛ تصمیم اولیه، دلیل و مسئول را ثبت کنید.»',
 '«اکنون یک اتفاق تازه داریم. ببینید تصمیم قبلی هنوز مناسب است یا نه.»',
 '«با توجه به اطلاعات تازه، چه چیزی را در تصمیم اصلاح می‌کنید و چرا؟»',
 '«هر گروه یک تصمیم قابل دفاع و یک نکته بهبود را با شواهد واقعی گفت‌وگو ارائه کند.»'
 ][n];
 const ask=[
 'موقعیت و سه داده اصلی را بخوانند و مسئله را در یک جمله بیان کنند.',
 'نقش‌ها را تقسیم کنند و هر فرد اطلاعات اختصاصی نقش خود را مطرح کند.',
 'دو دور Role Play اجرا کنند؛ مشاهده‌گر رفتار و جمله‌های واقعی را یادداشت کند.',
 'دو یا چند اقدام در سقف ۶ سکه انتخاب و تصمیم اولیه را با گروه به اشتراک بگذارند.',
 'اتفاق تازه را بخوانند و درباره تأثیر آن بر تصمیم گفت‌وگو کنند.',
 'تصمیم اصلاح‌شده و دلیل آن را ثبت و به اشتراک بگذارند.',
 'یک شاهد رفتاری ثبت کنند و نتیجه را برای جمع‌بندی کلاسی آماده کنند.'
 ][n];
 const bodies=[
 '<div class="classroom-story"><h3>چه اتفاقی افتاده؟</h3><p>'+E(d.situation)+'</p><h3>اطلاعاتی که گروه هم می‌بیند</h3><ul>'+d.facts.map(f=>'<li>'+E(f)+'</li>').join('')+'</ul><h3>پرسش چالشی</h3><p>'+E(d.question)+'</p></div>',
 '<details class="classroom-reference"><summary>پنج نقش و اطلاعات اختصاصی</summary>'+C.roles.map((r,j)=>'<p><b>'+E(r)+':</b> '+E(m.info[j])+'</p>').join('')+'</details>',
 '<div class="classroom-duo"><div><b>مدیریت هیجان</b><p>'+E(x.anger)+'</p></div><div><b>جرأت‌ورزی</b><p>'+E(x.assertion)+'</p></div></div><details class="classroom-reference"><summary>نمونه گفت‌وگو و بازخورد</summary>'+m.dialog.map(v=>'<p>'+E(v)+'</p>').join('')+'<p><b>سؤال مشاهده‌گر:</b> '+E(x.check)+'</p><p><b>اجرای اصلاح‌شده:</b> '+E(x.second)+'</p></details>',
 '<details class="classroom-reference"><summary>کارت‌های تصمیم و پیامدها</summary>'+m.actions.map(a=>'<p><strong>'+E(a[0])+' · '+fa(a[1])+' سکه</strong> — '+E(a[2])+'</p>').join('')+'</details>',
 '<div class="classroom-event"><h3>اتفاق تازه</h3><p>'+E(m.shock)+'</p></div>',
 '<p class="classroom-prompt">'+E(d.question)+'</p>',
 '<div class="classroom-duo"><div><b>بازتاب تصمیم</b><p>کدام شاهد باعث تغییر تصمیم گروه شد؟</p></div><div><b>کاربرد شغلی</b><p>فردا در واحد خسارت، چه اقدامی قابل اجراست؟</p></div></div>'
 ][n];
 return '<div class="classroom-teacher-scene">'+simpleTitle('هدایت سناریو','گام '+fa(n+1)+' از ۷ · '+C.missionFlow[n],'نمونه توضیح از سناریوی '+labels[i]+'؛ گروه‌های دیگر می‌توانند سناریوی متفاوتی داشته باشند.')+
 '<div class="classroom-teacher-switch">'+C.models.map((v,j)=>'<button type="button" class="'+(j===i?'selected':'')+'" data-class-reference="'+j+'">'+v[0]+' '+E(v[1])+'</button>').join('')+'</div>'+
 '<h3 class="classroom-case-caption">'+mod[0]+' '+E(m.title)+'</h3>'+
 '<div class="classroom-duo"><article><span>🎙️ مدرس چه بگوید؟</span><p>'+E(say)+'</p></article><article><span>📱 گروه‌ها چه کنند؟</span><p>'+E(ask)+'</p></article></div>'+
 '<div class="classroom-detail">'+bodies[n]+'</div>'+
 '<details class="classroom-monitor"><summary>مشاهده پیشرفت و پاسخ گروه‌ها</summary>'+monitorAllGroups()+'</details></div>';
}
function monitorAllGroups(){
 const list=groups().filter(t=>confirmed(t)||attendance(t)||groupChoice(t)!==null);
 if(!list.length)return '<p class="classroom-empty">هنوز گروهی فعالیتی ثبت نکرده است.</p>';
 return '<div class="classroom-monitor-list">'+list.map(t=>{const i=groupChoice(t),p=i===null?'':String(i);
 const initial=i===null?'':val(t,'r'+p+'initial'),revision=i===null?'':val(t,'r'+p+'revision');
 return '<details><summary><strong>گروه '+fa(t)+'</strong><span>'+(i===null?'بدون مأموریت':animals[i]+' '+labels[i])+'</span><small>'+(initial?'تصمیم اول ✓':'تصمیم اول ○')+' · '+(revision?'اصلاح ✓':'اصلاح ○')+'</small></summary><p><b>تصمیم اولیه:</b> '+formatText(initial)+'</p><p><b>تصمیم اصلاح‌شده:</b> '+formatText(revision)+'</p></details>';}).join('')+'</div>';
}
function learnerMission(){
 const team=identity.team,i=groupChoice(team);
 if(i===null)return simpleTitle('یک انتخاب باقی مانده','گروه هنوز مأموریت ندارد','هم‌اکنون یکی از چهار مأموریت را انتخاب کنید تا به گام جاری کلاس برسید.')+chooseMission();
 const n=stage-3,m=C.missions[i],d=C.cases[i],x=C.embedded[i],prefix='r'+i,member=identity.member;
 const title=simpleTitle(animals[i]+' '+labels[i],'گام '+fa(n+1)+' از ۷ · '+C.missionFlow[n],m.title);
 let body='';
 if(n===0)body='<div class="classroom-story"><h3>هدف شما</h3><p>'+E(d.goal)+'</p><h3>چه اتفاقی افتاده؟</h3><p>'+E(d.situation)+'</p><h3>سه داده مهم</h3><ul>'+d.facts.map(v=>'<li>'+E(v)+'</li>').join('')+'</ul><h3>پرسش گروه</h3><p>'+E(d.question)+'</p></div>';
 if(n===1)body='<p class="classroom-prompt">پنج نقش زیر را بین افراد حاضر تقسیم کنید. در گروه‌های کوچک‌تر، یک نفر می‌تواند دو نقش بگیرد.</p><div class="classroom-role-list">'+C.roles.map((r,j)=>'<details><summary>نقش '+fa(j+1)+' · '+E(r)+'</summary><p>'+E(m.info[j])+'</p></details>').join('')+'</div>';
 if(n===2)body='<p class="classroom-prompt">اول گفت‌وگو را اجرا کنید. مشاهده‌گر یک نکته بگوید؛ سپس گفت‌وگو را دوباره انجام دهید.</p><div class="classroom-duo"><div><b>مدیریت هیجان</b><p>'+E(x.anger)+'</p></div><div><b>جرأت‌ورزی</b><p>'+E(x.assertion)+'</p></div></div><details class="classroom-reference"><summary>نمونه گفت‌وگو و پرسش مشاهده‌گر</summary>'+m.dialog.map(v=>'<p>'+E(v)+'</p>').join('')+'<p><b>پرسش:</b> '+E(x.check)+'</p><p><b>نمونه بهتر:</b> '+E(x.second)+'</p></details>';
 if(n===3){const savedPick=val(team,prefix+'pick'),picked=Array.isArray(savedPick)?savedPick:[];
 body='<p class="classroom-prompt">با ۶ سکه حداقل دو اقدام انتخاب کنید. یک نفر تصمیم را از طرف گروه ثبت کند.</p><div class="classroom-money">بودجه تصمیم: <strong>۶ سکه</strong></div><div class="classroom-options">'+m.actions.map((a,j)=>'<label><input type="checkbox" data-class-pick="'+j+'" '+(picked.includes(j)?'checked':'')+'><span>'+E(a[0])+'</span><b>'+fa(a[1])+' سکه</b></label>').join('')+'</div><label class="classroom-input"><span>تصمیم و دلیل گروه</span><textarea data-class-answer="initial" rows="3" placeholder="چه اقدام‌هایی را انتخاب کردید؟ چرا؟ مسئول کیست؟">'+E(val(team,prefix+'initial')||'')+'</textarea></label><button class="btn primary" data-class-save="initial">ثبت تصمیم گروه</button>'+(val(team,prefix+'initial')?'<p class="classroom-saved">تصمیم قبلی گروه ثبت شده است ✓</p>':'');}
 if(n===4)body='<div class="classroom-event"><h3>اتفاق جدید</h3><p>'+E(m.shock)+'</p></div><p class="classroom-prompt">به تصمیم قبلی‌تان فکر کنید. آیا با این اطلاعات هنوز آن را مناسب می‌دانید؟</p>';
 if(n===5)body='<p class="classroom-prompt">کدام بخش از تصمیم اولیه باید تغییر کند؟ دلیل خود را بنویسید.</p><label class="classroom-input"><span>تصمیم اصلاح‌شده گروه</span><textarea data-class-answer="revision" rows="4" placeholder="چه چیزی را تغییر دادید و بر اساس چه شاهدی؟">'+E(val(team,prefix+'revision')||'')+'</textarea></label><button class="btn primary" data-class-save="revision">ثبت تصمیم اصلاح‌شده</button>'+(val(team,prefix+'revision')?'<p class="classroom-saved">اصلاح قبلی ثبت شده است ✓</p>':'');
 if(n===6){const k=prefix+'member'+member;body='<p class="classroom-prompt">یک مثال از رفتار یا جمله قابل مشاهده در اجرای گروه را ثبت کنید.</p><label class="classroom-input"><span>شاهد من · عضو '+fa(member)+'</span><textarea data-class-answer="evidence" rows="3" placeholder="مثلاً چه جمله‌ای باعث شد گفت‌وگو بهتر پیش برود؟">'+E(val(team,k)||'')+'</textarea></label><button class="btn primary" data-class-save="evidence">ثبت مشاهده من</button><div class="classroom-recap"><p><b>تصمیم اولیه:</b> '+formatText(val(team,prefix+'initial'))+'</p><p><b>تصمیم اصلاح‌شده:</b> '+formatText(val(team,prefix+'revision'))+'</p></div>';}
 return title+body+'<p class="classroom-wait">این گام مشترک است. وقتی مدرس گام بعدی را فعال کند، صفحه خودکار به‌روز می‌شود؛ به قسمت‌های دیگر نروید.</p>';
}
function ending(){
 const ready=groups().filter(confirmed).length;
 return simpleTitle('جمع‌بندی','از این مأموریت چه یاد گرفتیم؟','گروه‌ها تجربه، تصمیم و نکته قابل انتقال به محیط خسارت را با هم مرور می‌کنند.')+
 (identity.role==='teacher'?'<p class="classroom-prompt">از گروه‌ها بخواه یک تصمیم درست و یک اصلاح مهم را با شاهد توضیح دهند. می‌توانی برای دور بعد، انتخاب مأموریت تازه را فعال کنی.</p>'+monitorAllGroups():'<p class="classroom-prompt">هر نفر یک اقدام کوچک برای بهبود کار روزمره خود مشخص کند. در انتظار اعلام دور بعد از سوی مدرس بمانید.</p>');
}
function render(force=false){
 if(!root)return;
 if(!identity){root.innerHTML='<p class="classroom-wait">ابتدا با کد اختصاصی وارد کارگاه شوید.</p>';lastFingerprint='';return;}
 const teacher=identity.role==='teacher';
 const signature=String(stage)+'/'+String(teacher?'t':identity.team)+'/'+String(teacher?reference:groupChoice(identity.team))+'/'+JSON.stringify(rows.map(r=>[r.team_no,r.field_key,r.field_value,r.version]));
 if(!force&&signature===lastFingerprint)return;
 if(!force&&root.contains(document.activeElement)&&document.activeElement.matches('textarea,input,select')){needsRefresh=true;return;}
 needsRefresh=false;lastFingerprint=signature;
 const ahead=stage===10?2:stage+1,readyTeams=groups().filter(confirmed(t=>t)).length;
 const countConfirmed=groups().filter(confirmed).length;
 const allReadyHaveMission=groups().filter(confirmed).every(t=>groupChoice(t)!==null);
 const nextDisabled=teacher &&(stage===0&&countConfirmed===0||stage===2&&(countConfirmed===0||!allReadyHaveMission));
 const header='<header class="classroom-top"><div><span>'+E(className())+'</span><h1>کارگاه تاب‌آوری · اجرای مرحله‌به‌مرحله</h1></div>'+lessonRow()+'</header>';
 const controls=teacher?'<nav class="classroom-controls" aria-label="کنترل مسیر کلاس"><button class="btn" data-class-prev '+(stage===0?'disabled':'')+'>گام قبل</button><div class="classroom-controls-note">مرحله روی موبایل گروه‌ها هم تغییر می‌کند (حدود ۱۰ ثانیه).</div><button class="btn primary" data-class-next '+(nextDisabled?'disabled':'')+'>'+(stage===10?'شروع دور بعد':'گام بعد')+'</button></nav>':'';
 let content;
 if(stage===0)content=teacher?rosterTeacher():checkinParticipant();
 else if(stage===1)content=strategyIntro(teacher);
 else if(stage===2)content=teacher?missionTeacherChoice():chooseMission();
 else if(stage<=9)content=teacher?teacherStep():learnerMission();
 else content=ending();
 root.innerHTML='<div class="classroom-layout">'+header+controls+messageBox()+'<main class="classroom-content">'+content+'</main>'+(teacher?'<p class="classroom-footer">هدایت مراحل با مدرس است. اعضا صرفاً حضور و تصمیم‌های گروه را ثبت می‌کنند.</p>':'')+'</div>';
}
async function execute(task){
 if(busy)return;busy=true;
 try{await task();clearNotice();await L.refresh();lastFingerprint='';render(true);}
 catch(e){alertUser(e.message||'خطای ارتباط؛ دوباره تلاش کنید',true);}
 finally{busy=false;}
}
async function saveFields(fields){
 const team=identity.team;
 const expected=Object.fromEntries(Object.keys(fields).map(k=>[k,version(team,k)]));
 await L.request({action:'write',team,fields,expected});
}
root.addEventListener('click',event=>{
 const btn=event.target.closest('button');if(!btn||busy)return;
 if(btn.hasAttribute('data-class-checkin')){const key='checkin'+identity.member;execute(()=>saveFields({[key]:true}));return;}
 if(btn.dataset.classConfirm){const team=Number(btn.dataset.classConfirm),node=root.querySelector('[data-class-team-size="'+team+'"]'),size=Number(node?.value||0);
   if(![0,3,4,5,6].includes(size))return alertUser('تعداد حاضر باید ۳ تا ۶ یا غیرفعال باشد.',true);
   if(size>0&&!attendance(team))return alertUser('برای تأیید گروه '+fa(team)+' ابتدا حداقل یک عضو با PIN حضورش را ثبت کند.',true);
   execute(()=>L.request({action:'groupSetup',team,size}));return;
 }
 if(btn.dataset.classMission){const choice=Number(btn.dataset.classMission);if(choice<0||choice>3)return;execute(()=>saveFields({missionChoice:choice}));return;}
 if(btn.dataset.classReference){reference=Number(btn.dataset.classReference);lastFingerprint='';render(true);return;}
 if(btn.hasAttribute('data-class-prev')||btn.hasAttribute('data-class-next')){
  const next=btn.hasAttribute('data-class-next'),phase=next?(stage===10?2:stage+1):stage-1;
  if(phase<0||phase>10)return;
  execute(()=>L.request({action:'classroom',phase,expectedVersion:stageVersion}));return;
 }
 if(btn.dataset.classSave){const kind=btn.dataset.classSave,choice=groupChoice(identity.team);
  if(choice===null)return alertUser('ابتدا مأموریت گروه را انتخاب کنید.',true);
  const prefix='r'+choice;let fields;
  if(kind==='initial'){
   const selections=[...root.querySelectorAll('[data-class-pick]:checked')].map(x=>Number(x.dataset.classPick)),total=selections.reduce((n,j)=>n+C.missions[choice].actions[j][1],0);
   const answer=root.querySelector('[data-class-answer="initial"]')?.value.trim()||'';
   if(selections.length<2||total>6||answer.length<10)return alertUser('حداقل دو اقدام در سقف ۶ سکه انتخاب کنید و دلیل روشن (حداقل ۱۰ حرف) بنویسید.',true);
   fields={[prefix+'pick']:selections,[prefix+'initial']:answer};
  }else{
   const answer=root.querySelector('[data-class-answer="'+kind+'"]')?.value.trim()||'';
   if(answer.length<10)return alertUser('لطفاً یک توضیح روشن، حداقل ۱۰ حرف، ثبت کنید.',true);
   fields=kind==='revision'?{[prefix+'revision']:answer}:{[prefix+'member'+identity.member]:answer};
  }
  execute(()=>saveFields(fields));return;
 }
});
root.addEventListener('change',event=>{if(event.target.matches('[data-class-team-size]')){const row=event.target.closest('.classroom-team-row'),button=row?.querySelector('[data-class-confirm]');if(button)button.textContent='ثبت و تأیید';}});
root.addEventListener('focusout',()=>{if(needsRefresh)setTimeout(()=>{if(!root.contains(document.activeElement))render(true);},0);});
window.addEventListener('alborz:classroom-auth',event=>{identity=event.detail.identity;lastFingerprint='';render(true);});
window.addEventListener('alborz:classroom-data',event=>{
 identity=event.detail.identity;
 rows=event.detail.records||[];
 if(identity?.role==='teacher'){
  const record=rec(1,'classroomPhase');stage=Number(record?.field_value??0);stageVersion=record?.version??0;
 }else{stage=Number(event.detail.classroom?.phase??0);stageVersion=event.detail.classroom?.version??0;}
 stage=Math.max(0,Math.min(10,stage));render();
});
render(true);
})();