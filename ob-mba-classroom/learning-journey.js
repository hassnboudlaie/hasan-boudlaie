/* Allameh MBA · 5-stage evidence-led independent learning journey.
   Complements existing academic lessons; never substitutes fake course content,
   grades, instructor evaluation or official quizzes. */
(()=>{
"use strict";
const htmlEscape=x=>String(x??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const fmt=n=>Number(n).toLocaleString("fa-IR");
const steps=[
 {title:"جهت‌گیری و هدف",detail:"موضوع جلسه و هدف‌های یادگیری را مرور کنید.",route:"openActive",label:"مشاهده جلسه"},
 {title:"فهم مفاهیم",detail:"یک مفهوم را با مثال واقعی مدیریتی توضیح دهید.",route:"openTrack",track:"concepts",label:"مطالعه مفاهیم"},
 {title:"تحلیل موقعیت",detail:"در کیس، مشاهده را از برداشت شخصی تفکیک کنید.",route:"openTrack",track:"practice",label:"ورود به کیس"},
 {title:"پیوند با منابع",detail:"یک منبع تکمیلی پیدا و نکته اصلی آن را مرور کنید.",route:"openResources",label:"مشاهده منابع"},
 {title:"بازتاب و اقدام",detail:"یک اقدام مدیریتی مشخص از این جلسه استخراج کنید.",route:null,label:"ثبت تأمل"}
];
const messages=[
 "از همان ابتدا بپرسید: این جلسه به کدام تصمیم مدیریتی من کمک می‌کند؟",
 "اکنون مفاهیم را به زبان خودتان بازگو کنید؛ فهم عمیق با حفظ‌کردن متفاوت است.",
 "در تحلیل کیس، شواهد را از فرض‌ها جدا کنید. چه چیزی ممکن است از قلم افتاده باشد؟",
 "یک دیدگاه متفاوت پیدا کنید و فرض اولیه‌تان را دوباره بررسی کنید.",
 "یادگیری وقتی به عمل تبدیل می‌شود که یک گام عملی بعدی مشخص داشته باشید.",
 "پنج گام خودآموزی را کامل کرده‌اید. حالا می‌توانید آموخته‌ها را در موقعیت واقعی به کار ببرید."
];
const keys=()=>{const id=window.OB_ACCESS?.student_number||window.OB_ACCESS?.student||"guest";return "mba-ob-learning-journey-v1:"+id};
const read=()=>{try{const obj=JSON.parse(localStorage.getItem(keys())||"{}");return obj&&typeof obj==="object"?obj:{}}catch{return {}}};
let activeSession=1,sessionReady=true;
function save(data){try{localStorage.setItem(keys(),JSON.stringify(data));return true}catch{return false}}
const current=()=>{const s=read();return s[String(activeSession)]&&typeof s[String(activeSession)]==="object"?s[String(activeSession)]:{done:[],reflection:""}};
const completed=()=>new Set((current().done||[]).filter(x=>Number.isInteger(x)&&x>=0&&x<steps.length));
function badge(n){return n>=5?"یادگیرنده پیگیر":n>=3?"تحلیلگر فعال":n>=1?"شروع‌کننده":"آماده آغاز"}
function nextIndex(set){return steps.findIndex((_,i)=>!set.has(i))}
function layout(){
 const done=completed(),num=done.size,next=nextIndex(done),step=steps[next]||steps[4],percent=Math.round(num/steps.length*100),state=current();
 const note=messages[Math.min(num,messages.length-1)];
 const disabled=!sessionReady;
 return '<section class="obj-shell" aria-label="سفر یادگیری فردی">'+
 '<div class="obj-hero"><div class="obj-hero-top"><span>یادگیری مستقل · جلسه '+fmt(activeSession)+'</span><span class="obj-badge">'+badge(num)+'</span></div>'+
 '<h3>سفر یادگیری مستقل من</h3><p>پنج گام کوتاه برای تبدیل مفاهیم رفتار سازمانی به تحلیل و تصمیم مدیریتی؛ در هر ساعت از شبانه‌روز.</p>'+
 '<div class="obj-progress-top"><strong>'+fmt(num)+' از '+fmt(steps.length)+' گام</strong><span>'+fmt(percent)+'٪ تکمیل خوداظهاری</span></div>'+
 '<div class="obj-track" role="progressbar" aria-valuenow="'+num+'" aria-valuemin="0" aria-valuemax="5" aria-label="پیشرفت سفر یادگیری"><span style="width:'+percent+'%"></span></div></div>'+
 '<div class="obj-coach"><span class="obj-coach-mark" aria-hidden="true">◎</span><div><strong>همراه یادگیری</strong><p>'+htmlEscape(note)+'</p></div></div>'+
 (disabled?'<p class="obj-unavailable">محتوای آموزشی این جلسه هنوز منتشر نشده است. می‌توانید از طرح درس و سایر جلسات منتشرشده استفاده کنید.</p>':
 next<0?'<div class="obj-next-done"><strong>مسیر این جلسه تکمیل شد.</strong><p>این گام‌ها تمرین فردی‌اند و جای نمره رسمی یا ارزیابی استاد را نمی‌گیرند.</p></div>':
 '<div class="obj-next"><small>گام بعدی · '+fmt(next+1)+' از '+fmt(steps.length)+'</small><h4>'+htmlEscape(step.title)+'</h4><p>'+htmlEscape(step.detail)+'</p>'+
 (next===4?'<label for="objReflection">برداشت یا اقدام مشخص من</label><textarea id="objReflection" data-obj-reflection maxlength="2000" rows="3" placeholder="یک اقدام مشخص که در محیط کار می‌توانم انجام دهم...">'+htmlEscape(state.reflection||"")+'</textarea><p class="obj-private-note">متن این تأمل فقط در همین مرورگر ذخیره می‌شود.</p>':
 '<button class="obj-open" type="button" data-action="'+step.route+'" '+(step.track?'data-track="'+step.track+'"':"")+'>'+step.label+' ←</button>')+
 '<button class="obj-mark" type="button" data-obj-complete="'+next+'">'+(next===4?"ثبت تأمل و تکمیل گام":"این گام را انجام دادم")+'</button></div>')+
 '<details class="obj-all"><summary>مشاهده همه گام‌ها و نشان‌ها</summary><ol>'+steps.map((s,i)=>'<li><span class="obj-step-bullet">'+(done.has(i)?"✓":fmt(i+1))+'</span><div><strong>'+htmlEscape(s.title)+'</strong><p>'+htmlEscape(s.detail)+'</p></div><span class="obj-step-state">'+(done.has(i)?"انجام‌شده":"باز")+'</span></li>').join("")+'</ol></details>'+
 '<p class="obj-caption">پیشرفت این مسیر برای تمرین شخصی است؛ تعداد مراجعه و نوع فعالیت (بدون متن پاسخ‌ها) در داشبورد آموزشی قابل مشاهده خواهد بود.</p>'+
 '</section>';
}
function homeHTML(session,ready){
 if(window.OB_ACCESS?.role!=="student")return "";
 activeSession=Number(session)||1;sessionReady=Boolean(ready);
 return '<div id="objJourney" data-oba-session="'+activeSession+'">'+layout()+'</div>';
}
function rerender(){
 const root=document.getElementById("objJourney");
 if(root)root.innerHTML=layout();
}
document.addEventListener("click",e=>{
 const button=e.target.closest?.("[data-obj-complete]");
 if(!button)return;
 const idx=Number(button.dataset.objComplete),set=completed();
 if(!Number.isInteger(idx)||idx<0||idx>=steps.length||set.has(idx)||!sessionReady)return;
 const state=current();
 if(idx===4){
  const field=document.getElementById("objReflection");
  const value=field?.value.trim()||"";
  if(value.length<12){field?.focus();field?.setAttribute("aria-invalid","true");return;}
  state.reflection=value;
 }
 set.add(idx);state.done=[...set];
 const all=read();all[String(activeSession)]=state;
 if(!save(all))return;
 window.OB_ANALYTICS?.track?.(idx===4?"reflection_saved":"journey_check",idx===4?"reflection":"journey",activeSession);
 rerender();
 const next=document.querySelector("#objJourney .obj-next h4")||document.querySelector("#objJourney .obj-next-done strong");
 if(next){next.setAttribute("tabindex","-1");next.focus({preventScroll:true})}
});
window.OB_JOURNEY={homeHTML};
})();