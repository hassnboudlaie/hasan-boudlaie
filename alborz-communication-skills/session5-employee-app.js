/* Session 5 — interactive employee communication laboratory. No backend or user-identifying data. */
(function(){
"use strict";
const L=window.ALBORZ_S5_LESSONS,C=window.ALBORZ_S5_CASES;
if(!L||!C||!Array.isArray(L.lessons)||L.lessons.length!==6||!Array.isArray(C.cases)||C.cases.length!==12)return;
const lessons=L.lessons,cases=C.cases,storeKey="alborz-session5-learning-v1";
const state={view:"lessons",lesson:0,caseId:0,stage:0,learned:[],completed:[],checks:{},answers:Array(12).fill(null),qi:0,deadline:0,finished:false,expired:false};
const esc=v=>String(v).replace(/[&<>"']/g,ch=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[ch]));
const fa=n=>String(n).replace(/\d/g,c=>"۰۱۲۳۴۵۶۷۸۹"[Number(c)]);
const root=()=>document.querySelector(".s5-root");
let ticker=null;
function restore(){try{const p=JSON.parse(sessionStorage.getItem(storeKey)||"null");if(!p)return;
  for(const k of ["view","lesson","caseId","stage","qi","deadline","finished","expired"])if(p[k]!==undefined)state[k]=p[k];
  state.learned=Array.isArray(p.learned)?p.learned.filter(x=>Number.isInteger(x)&&x>=0&&x<6):[];
  state.completed=Array.isArray(p.completed)?p.completed.filter(x=>Number.isInteger(x)&&x>=0&&x<12):[];
  state.checks=p.checks&&typeof p.checks==="object"?p.checks:{};
  if(Array.isArray(p.answers)&&p.answers.length===12)state.answers=p.answers.map(v=>Number.isInteger(v)&&v>=0&&v<4?v:null);
  if(state.deadline&&!state.finished&&Date.now()>=state.deadline){state.finished=true;state.expired=true;}
  if(!["lessons","cases","exam","guide"].includes(state.view))state.view="lessons";
  state.lesson=Math.max(0,Math.min(5,Number(state.lesson)||0));
  state.caseId=Math.max(0,Math.min(11,Number(state.caseId)||0));
  state.stage=Math.max(0,Math.min(3,Number(state.stage)||0));
  state.qi=Math.max(0,Math.min(11,Number(state.qi)||0));
}catch(_){}}
function save(){try{sessionStorage.setItem(storeKey,JSON.stringify(state));}catch(_){}}
function button(label,act,cl){return '<button type="button" class="s5-button '+(cl||"")+'" data-s5-action="'+act+'">'+esc(label)+'</button>';}
function shell(){
 const n=state.completed.length,pct=Math.round(n/12*100);
 return (typeof header==="function"?header():"")+
 '<main class="s5-root" dir="rtl"><div class="s5-wrap"><div class="s5-crumb"><a href="?">خانه آکادمی</a> / <a href="?m=4">جلسه چهارم</a> / جلسه پنجم</div>'+
 '<section class="s5-hero"><div class="s5-overline">آکادمی مدیریت بیمه البرز · جلسه پنجم · ۱۲۰ دقیقه</div><h1>ارتباط مؤثر با کارکنان شعبه</h1><p>از دستور دادن تا گفت‌وگویی که اعتماد، وضوح انتظار و مسئولیت‌پذیری را تقویت می‌کند.</p><div class="s5-chips"><span>۶ تکنیک کاربردی</span><span>۱۲ نقش‌آفرینی</span><span>آزمون ۱۲سؤالی</span><span>۶ دقیقه</span></div></section>'+
 '<section class="s5-stat" aria-label="پیشرفت یادگیری"><div><b>'+fa(state.learned.length)+'</b><small>تکنیک تمرین‌شده</small></div><div><b>'+fa(n)+'</b><small>سناریوی تکمیل‌شده</small></div><div><b>'+fa(pct)+'٪</b><small>پیشرفت نقش‌آفرینی</small></div></section>'+
 '<nav class="s5-tabs" aria-label="بخش‌های جلسه پنجم">'+[["lessons","درسنامه و تکنیک‌ها"],["cases","آزمایشگاه گفت‌وگو"],["exam","آزمون تحلیلی"],["guide","راهنمای مدرس"]].map(([key,label])=>'<button type="button" data-s5-tab="'+key+'" aria-current="'+(state.view===key?"page":"false")+'" class="'+(state.view===key?"on":"")+'">'+label+'</button>').join("")+'</nav>'+
 '<div id="s5-screen" class="s5-screen" tabindex="-1"></div><div class="s5-bottom"><a href="?m=4">جلسه قبل</a><a href="?">خانه آکادمی</a><a href="?m=6">جلسه بعد</a></div></div></main>'+
 (typeof footer==="function"?footer():"");
}
function badges(){return '<div class="s5-badges"><h3>نشان‌های تکمیل تمرین</h3><div class="s5-badge-grid">'+lessons.map((l,i)=>{const done=state.completed.includes(i*2)&&state.completed.includes(i*2+1);return '<div class="s5-badge '+(done?"earned":"")+'"><span class="s5-medal">'+(done?"◆":"◇")+'</span><strong>'+esc(l.title)+'</strong><small>'+(done?"هر دو نقش‌آفرینی ثبت شد":"پس از تکمیل دو سناریو")+'</small>'+(done?'<button data-s5-badge="'+i+'" type="button">دریافت نشان</button>':"")+'</div>';}).join("")+'</div></div>';}
function lessonScreen(){
 const l=lessons[state.lesson];
 return '<div class="s5-heading"><div><span class="s5-kicker">درسنامه تخصصی · تکنیک '+fa(state.lesson+1)+' از ۶</span><h2>'+esc(l.title)+'</h2></div><div class="s5-picker">'+lessons.map((x,i)=>'<button type="button" data-s5-lesson="'+i+'" class="'+(i===state.lesson?"selected":"")+'" aria-label="تکنیک '+fa(i+1)+'">'+fa(i+1)+'</button>').join("")+'</div></div>'+
 '<div class="s5-teach"><div class="s5-idea"><h3>مفهوم و هدف</h3><p>'+esc(l.summary)+'</p></div><div class="s5-steps"><h3>چگونه در شعبه اجرا کنیم؟</h3><ol>'+l.steps.map(x=>'<li>'+esc(x)+'</li>').join("")+'</ol></div><div class="s5-example"><h3>گفت‌وگوی نمونه رئیس شعبه</h3><p>'+esc(l.example)+'</p></div><div class="s5-caution"><h3>خطای رایج</h3><p>'+esc(l.pitfall)+'</p></div><div class="s5-rehearsal"><h3>تمرین ۳۰ ثانیه‌ای</h3><p>'+esc(l.exercise)+'</p>'+button(state.learned.includes(state.lesson)?"تمرین ثبت شده":"این تکنیک را تمرین کردم","learn","secondary")+'</div></div>'+
 '<div class="s5-actions">'+button("سناریوهای این تکنیک","lessonCases")+ (state.lesson<5?button("تکنیک بعد","nextLesson","secondary"):"")+'</div>'+badges();
}
function dialogue(lines){return '<div class="s5-dialogue">'+lines.map((line,i)=>'<p class="'+(i%2?"manager":"employee")+'"><span>'+esc(line)+'</span></p>').join("")+'</div>';}
function checklist(c){
 const a=Array.isArray(state.checks[state.caseId])?state.checks[state.caseId]:[];
 return '<div class="s5-checklist"><h3>چک‌لیست مشاهده‌گر</h3>'+c.checks.map((label,i)=>'<label><input type="checkbox" data-s5-check="'+i+'" '+(a.includes(i)?"checked":"")+'> '+esc(label)+'</label>').join("")+'</div>';
}
function caseStage(c){
 switch(state.stage){
 case 0:return '<h3>اجرای اول؛ گفت‌وگوی نیازمند اصلاح</h3><p>دو نفر نقش‌ها را اجرا کنند؛ مشاهده‌گر فقط رفتارهای قابل‌مشاهده را یادداشت کند.</p>'+dialogue(c.before)+button("مشاهده قواعد تکنیک","nextStage");
 case 1:{const l=lessons[c.skill];return '<h3>قواعدی که باید در اجرای دوم دیده شوند</h3><p class="s5-rule">'+esc(l.summary)+'</p><ol class="s5-rulelist">'+l.steps.map(s=>'<li>'+esc(s)+'</li>').join("")+'</ol><div class="s5-prompt">پیش از اجرای دوم، هر نفر ۳۰ ثانیه فرصت دارد یک جمله بهتر بسازد.</div>'+button("اجرای اصلاح‌شده","nextStage");}
 case 2:return '<h3>اجرای دوم؛ به‌کارگیری تکنیک</h3><p>نقش‌ها دوباره اجرا شوند؛ هدف تکرار طوطی‌وار دیالوگ نیست، بلکه تغییر رفتار است.</p>'+dialogue(c.after)+button("مشاهده و جمع‌بندی","nextStage");
 default:return checklist(c)+'<div class="s5-reflect"><h3>پرسش منتور برای بازاندیشی</h3><p>'+esc(c.reflect)+'</p></div><p class="s5-subnote">ثبت تکمیل به معنی تمرین این سناریوست، نه گواهی صلاحیت حرفه‌ای.</p>'+button(state.completed.includes(state.caseId)?"سناریو ثبت شده؛ ادامه":"ثبت تکمیل و ادامه","completeCase")+' '+button("بازاجرای همین سناریو","restartCase","secondary");
 }
}
function caseScreen(){
 const c=cases[state.caseId],steps=["اجرای اول","یادگیری","اجرای دوم","جمع‌بندی"];
 return '<div class="s5-heading"><div><span class="s5-kicker">آزمایشگاه عملی · سناریو '+fa(state.caseId+1)+' از ۱۲</span><h2>'+esc(c.title)+'</h2></div><div class="s5-picker"><label for="s5-choose-case">انتخاب سناریو</label><select id="s5-choose-case">'+cases.map((x,i)=>'<option value="'+i+'" '+(i===state.caseId?"selected":"")+'>'+fa(i+1)+'. '+esc(x.title)+'</option>').join("")+'</select></div></div>'+
 '<div class="s5-context"><strong>نقش‌ها:</strong> '+esc(c.roles)+'<p>'+esc(c.setting)+'</p><span>تکنیک محوری: '+esc(lessons[c.skill].title)+'</span></div>'+
 '<div class="s5-stages" role="group" aria-label="مراحل سناریو">'+steps.map((t,i)=>'<button type="button" data-s5-stage="'+i+'" class="'+(state.stage===i?"on":"")+'">'+fa(i+1)+'. '+t+'</button>').join("")+'</div>'+
 '<div class="s5-stagebody">'+caseStage(c)+'</div><div class="s5-actions">'+button("سناریوی قبلی","previousCase","secondary")+' '+button("سناریوی بعدی","nextCase","secondary")+'</div>';
}
function remaining(){return state.deadline?Math.max(0,Math.ceil((state.deadline-Date.now())/1000)):360;}
function fmt(s){return fa(String(Math.floor(s/60)).padStart(2,"0"))+":"+fa(String(s%60).padStart(2,"0"));}
function summary(){
 const score=state.answers.filter((a,i)=>a===cases[i].best).length;
 let level=score>=11?"به‌کارگیری بسیار خوب قواعد":score>=9?"تسلط قابل قبول و آماده تمرین":score>=6?"نیاز به مرور چند تکنیک":"پیشنهاد به بازآموزی و تمرین دوباره";
 const detail=cases.map((c,i)=>'<details class="s5-result-detail"><summary>سؤال '+fa(i+1)+' · '+esc(c.title)+' · '+(state.answers[i]===c.best?"پاسخ منطبق با قاعده":"نیازمند مرور")+'</summary><p>'+esc(c.q)+'</p><div>'+c.opts.map((o,j)=>'<div class="s5-rationale '+(j===c.best?"correct":"")+'"><strong>'+(j===c.best?"پاسخ برتر: ":"")+(state.answers[i]===j?"انتخاب شما: ":"")+fa(j+1)+'. '+esc(o[0])+'</strong><p>'+esc(o[1])+'</p></div>').join("")+'</div></details>').join("");
 return '<div class="s5-heading"><div><span class="s5-kicker">بازخورد نهایی آزمون</span><h2>نتیجه و پاسخنامه تحلیلی</h2></div></div><div class="s5-score"><b>'+fa(score)+' از ۱۲</b><strong>'+level+'</strong><p>'+(state.expired?"زمان آزمون پایان یافت؛ پاسخ‌های ثبت‌شده ارزیابی شدند.":"آزمون به پایان رسید.")+' پاسخ‌های درست نشانه انتخاب متناسب با تکنیک در این سناریوهاست، نه سنجش جامع شایستگی مدیریتی.</p></div><div class="s5-actions">'+button("مرور همه پاسخ‌ها","showAnswers","secondary")+button("دریافت نشان حضور در تمرین","completionBadge")+'</div><div id="s5-answers" class="s5-answer-area">'+detail+'</div><div class="s5-learning-plan"><h3>انتقال یادگیری در ۷ روز آینده</h3><p>یک گفت‌وگو با کارمند انتخاب کنید؛ تکنیک مرتبط را تمرین و رفتار مشاهده‌شده و نتیجه را بدون ثبت اطلاعات فردی گزارش کنید.</p></div><p class="s5-subnote">نتایج تنها در حافظه موقت همین مرورگر نگهداری می‌شوند و برای مدرس ارسال نمی‌شوند.</p>';
}
function examScreen(){
 if(state.finished)return summary();
 const c=cases[state.qi],a=state.answers[state.qi],filled=state.answers.filter(x=>x!==null).length;
 return '<div class="s5-heading"><div><span class="s5-kicker">۱۲ تصمیم مدیریتی · یک سؤال برای هر سناریو</span><h2>آزمون تحلیلی جلسه پنجم</h2></div></div><p class="s5-subnote">هر چهار گزینه می‌توانند از یک جنبه قابل دفاع باشند؛ بهترین پاسخ را دقیقاً بر اساس قاعده تکنیک محوری انتخاب کنید. پاسخنامه بعد از پایان آزمون دیده می‌شود.</p>'+
 '<div class="s5-examtop"><div><span>سؤال '+fa(state.qi+1)+' از ۱۲</span><small>'+fa(filled)+' پاسخ ثبت‌شده</small></div><div class="s5-clock" role="timer" aria-live="off"><b id="s5-clock">'+fmt(remaining())+'</b><small>'+(state.deadline?"شمارش معکوس فعال":"شروع با اولین پاسخ")+'</small></div></div>'+
 '<div class="s5-progress"><i style="width:'+(filled/12*100)+'%"></i></div><div class="s5-question"><small>موقعیت: '+esc(c.title)+'</small><h3>'+esc(c.q)+'</h3><div class="s5-options">'+c.opts.map((x,j)=>'<button type="button" data-s5-answer="'+j+'" class="'+(a===j?"chosen":"")+'"><b>'+["الف","ب","ج","د"][j]+'</b><span>'+esc(x[0])+'</span></button>').join("")+'</div></div>'+
 '<div class="s5-actions">'+button("سؤال قبل","previousQuestion","secondary")+button(state.qi===11?"پایان و دریافت نتیجه":"سؤال بعد","nextQuestion")+'</div><p class="s5-subnote">پیش از پایان می‌توانید به سؤال‌های قبلی برگردید و پاسخ را اصلاح کنید. پس از پایان زمان آزمون، پاسخ‌ها قفل می‌شوند.</p>';
}
function guideScreen(){return '<div class="s5-heading"><div><span class="s5-kicker">راهنمای اجرای کلاسی</span><h2>مسیر ۱۲۰ دقیقه‌ای تسهیل‌گری</h2></div></div><div class="s5-plan">'+L.guide.segments.map(([time,txt])=>'<div><strong>'+esc(time)+'</strong><p>'+esc(txt)+'</p></div>').join("")+'</div><div class="s5-facilitator"><h3>نقش‌ها و قواعد اجرا</h3><p>در هر سناریو دو نفر گفت‌وگو را اجرا و نفر سوم مشاهده می‌کند. اجرای اول بدون راهنمایی؛ سپس مرور قاعده؛ اجرای دوم با تغییر رفتار؛ در پایان مشاهده‌گر سه معیار را ثبت و یک بازخورد مشخص می‌دهد. سناریوها بین گروه‌ها توزیع می‌شوند و نیازی نیست هر گروه تمام ۱۲ مورد را اجرا کند.</p><h3>مراقبت‌های حرفه‌ای</h3><p>سناریوها آموزشی و فرضی‌اند؛ از ثبت نام واقعی کارکنان، مشخصات مشتریان یا پرونده‌ها خودداری کنید. ارجاع‌ها، تعهدها و حدود اختیار باید مطابق مقررات و فرایندهای رسمی بیمه البرز باشند.</p><h3>مبانی علمی</h3>'+L.guide.sources.map(s=>'<p><a href="'+esc(s[1])+'" target="_blank" rel="noopener noreferrer">'+esc(s[0])+'</a></p>').join("")+'</div>'+badges();}
function show(){
 if(!root())return;
 const el=document.getElementById("s5-screen");
 if(!el)return;
 el.innerHTML=state.view==="lessons"?lessonScreen():state.view==="cases"?caseScreen():state.view==="exam"?examScreen():guideScreen();
 document.querySelectorAll("[data-s5-tab]").forEach(x=>{const on=x.dataset.s5Tab===state.view;x.classList.toggle("on",on);x.setAttribute("aria-current",on?"page":"false")});
 save();updateClock();
}
function updateClock(){
 if(!root())return;
 if(state.deadline&&!state.finished&&remaining()===0){state.finished=true;state.expired=true;save();show();return;}
 const b=document.getElementById("s5-clock");if(b){b.textContent=fmt(remaining());b.parentElement?.classList.toggle("urgent",remaining()<=60);}
}
function jump(view){state.view=view;show();document.getElementById("s5-screen")?.focus({preventScroll:true});root()?.scrollIntoView({block:"start",behavior:"smooth"});}
function badgeSVG(label){const safe=esc(label);return '<svg xmlns="http://www.w3.org/2000/svg" width="760" height="480" viewBox="0 0 760 480"><rect width="760" height="480" rx="32" fill="#142d46"/><rect x="24" y="24" width="712" height="432" rx="24" fill="#193b55" stroke="#c9a351" stroke-width="4"/><circle cx="380" cy="127" r="64" fill="#c9a351"/><path d="M350 126 l20 20 l41 -44" fill="none" stroke="#14354c" stroke-width="12" stroke-linecap="round"/><text x="380" y="238" text-anchor="middle" font-size="26" fill="#ffffff" font-family="Tahoma,Arial,sans-serif">آکادمی مدیریت بیمه البرز</text><text x="380" y="295" text-anchor="middle" font-size="24" fill="#e7c57c" font-family="Tahoma,Arial,sans-serif">'+safe+'</text><text x="380" y="351" text-anchor="middle" font-size="20" fill="#f1f5f8" font-family="Tahoma,Arial,sans-serif">جلسه پنجم · ارتباط مؤثر با کارکنان شعبه</text><text x="380" y="404" text-anchor="middle" font-size="15" fill="#c9d8e3" font-family="Tahoma,Arial,sans-serif">نشان تکمیل تمرین؛ نه گواهی احراز صلاحیت</text></svg>';}
function downloadBadge(label,file){try{const blob=new Blob([badgeSVG(label)],{type:"image/svg+xml;charset=utf-8"}),url=URL.createObjectURL(blob);const a=document.createElement("a");a.href=url;a.download=file;a.click();setTimeout(()=>URL.revokeObjectURL(url),2500);}catch(err){alert("امکان دریافت نشان در این مرورگر فراهم نیست.");}}
function handleAction(action){
 switch(action){
 case "learn":if(!state.learned.includes(state.lesson))state.learned.push(state.lesson);break;
 case "nextLesson":state.lesson=Math.min(5,state.lesson+1);break;
 case "lessonCases":state.caseId=state.lesson*2;state.stage=0;state.view="cases";break;
 case "nextStage":state.stage=Math.min(3,state.stage+1);break;
 case "restartCase":state.stage=0;break;
 case "completeCase":if(!state.completed.includes(state.caseId))state.completed.push(state.caseId);if(state.caseId===11){state.view="exam";}else{state.caseId++;state.stage=0;}break;
 case "nextCase":state.caseId=Math.min(11,state.caseId+1);state.stage=0;break;
 case "previousCase":state.caseId=Math.max(0,state.caseId-1);state.stage=0;break;
 case "nextQuestion":if(state.qi===11){if(state.answers.every(x=>x!==null)){state.finished=true;}else{const first=state.answers.findIndex(x=>x===null);state.qi=first>=0?first:11;}}else state.qi++;break;
 case "previousQuestion":state.qi=Math.max(0,state.qi-1);break;
 case "showAnswers":document.getElementById("s5-answers")?.scrollIntoView({block:"start",behavior:"smooth"});return;
 case "completionBadge":downloadBadge("تکمیل آزمون تحلیلی ۱۲سؤالی","alborz-session5-assessment.svg");return;
 default:return;
 }
 show();
}
document.addEventListener("click",e=>{
 if(!root())return;
 const tab=e.target.closest("[data-s5-tab]");if(tab){jump(tab.dataset.s5Tab);return;}
 const l=e.target.closest("[data-s5-lesson]");if(l){state.lesson=Number(l.dataset.s5Lesson);show();return;}
 const s=e.target.closest("[data-s5-stage]");if(s){state.stage=Number(s.dataset.s5Stage);show();return;}
 const chk=e.target.closest("[data-s5-check]");if(chk){const i=Number(chk.dataset.s5Check),current=Array.isArray(state.checks[state.caseId])?state.checks[state.caseId]:[];state.checks[state.caseId]=chk.checked?[...new Set([...current,i])]:current.filter(x=>x!==i);save();return;}
 const answer=e.target.closest("[data-s5-answer]");if(answer&&!state.finished){if(!state.deadline)state.deadline=Date.now()+360000;state.answers[state.qi]=Number(answer.dataset.s5Answer);show();return;}
 const badge=e.target.closest("[data-s5-badge]");if(badge){const i=Number(badge.dataset.s5Badge);if(state.completed.includes(i*2)&&state.completed.includes(i*2+1))downloadBadge("تمرین "+lessons[i].title,"alborz-session5-skill-"+(i+1)+".svg");return;}
 const act=e.target.closest("[data-s5-action]");if(act)handleAction(act.dataset.s5Action);
});
document.addEventListener("change",e=>{if(!root())return;if(e.target.id==="s5-choose-case"){state.caseId=Number(e.target.value);state.stage=0;show();}});
window.alborzSession5Page=function(){restore();document.title="جلسه پنجم | ارتباط مؤثر با کارکنان شعبه | بیمه البرز";document.getElementById("app").innerHTML=shell();show();if(ticker)clearInterval(ticker);ticker=setInterval(updateClock,250);};
})();