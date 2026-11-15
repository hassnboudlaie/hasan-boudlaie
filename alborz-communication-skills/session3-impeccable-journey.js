/* Impeccable Journey — session 3, aligned to session 4. Isolated from session 4 and all backend paths. */
(function(){
"use strict";
const original=window.alborzSession3Page;
if(typeof original!=="function")return;
const q=(s)=>document.querySelector(s);
const qa=(s)=>Array.from(document.querySelectorAll(s));
const digits=n=>String(n).replace(/[0-9]/g,d=>"۰۱۲۳۴۵۶۷۸۹"[+d]);
const roles=["رئیس شعبه همتا","معاون شعبه","کارشناس شعبه","مشتری","نماینده بیمه","کارشناس ستاد"];
const descriptions=["هماهنگی میان دو شعبه","شنیدن دغدغه‌های همکار","گفت‌وگوی رشد و بازخورد","شناخت نگرانی مراجعه‌کننده","رفع ابهام نماینده","شنیدن و روشن‌سازی مطالبه ستاد"];
const roleIcons=["🤝","👔","🧑‍💻","💬","🧩","🏛️"];
const techniques=[
"پس از یک توضیح ناتمامِ کارشناس، پنج ثانیه سکوت کنید. بدون قطع کردن حرفش، بپرسید: «ادامه می‌دید؟»",
"حرف همتای شعبه را در یک جمله با زبان خودتان بازگو کنید و بپرسید: «درست فهمیدم؟»",
"به جای حدس‌زدن علت نارضایتی مشتری، یک پرسش باز درباره اتفاق مشخص مطرح کنید.",
"سه نکته مطرح‌شده در جلسه شعبه را به یک جمع‌بندی کوتاه و یک اقدام بعدی تبدیل کنید.",
"احساس نگرانی مراجعه‌کننده را نام ببرید؛ بدون وعده پرداخت یا تأیید پرونده.",
"پس از شنیدن نظر کارشناس، برداشت خود را بگویید و از او بخواهید آن را تصحیح کند."
];
const skillIcons=["👂","🔁","❓","🧩","💬","✅"];
const state={view:"home",tech:0,group:0,caseIndex:0};
const storageKey="alborz-session3-impeccable-practice-v1";
let completed=new Set();
const node=(tag,cls,html)=>{const e=document.createElement(tag);if(cls)e.className=cls;if(html!==undefined)e.innerHTML=html;return e;};
function read(){
 try{const a=JSON.parse(sessionStorage.getItem(storageKey)||"[]");
 completed=new Set(Array.isArray(a)?a.filter(v=>Number.isInteger(v)&&v>=0&&v<6):[]);
 }catch(_){completed=new Set();}
}
function persist(){try{sessionStorage.setItem(storageKey,JSON.stringify([...completed]));}catch(_){}}
function install(){
 const wrap=q(".s3-root .wrap"),hero=wrap?.querySelector(".s3-hero");
 if(!wrap||!hero)return;
 const path=node("nav","s3-journey-path");
 path.setAttribute("aria-label","مراحل شنود مؤثر");
 path.innerHTML='<button type="button" data-s3j-open="techniques"><span aria-hidden="true" class="s3j-sticker">📘</span><span><small>گام ۱ از ۲</small><strong>شش تکنیک شنود مؤثر</strong><em>تعریف، مثال و تمرین ۳۰ثانیه‌ای</em></span><b aria-hidden="true">←</b></button>'+
 '<button type="button" data-s3j-open="practice"><span aria-hidden="true" class="s3j-sticker">🎭</span><span><small>گام ۲ از ۲</small><strong>آزمایشگاه ۱۲ گفت‌وگو</strong><em>شش گروه مخاطب؛ چهار مرحله برای هر کیس</em></span><b aria-hidden="true">←</b></button>';
 hero.insertAdjacentElement("afterend",path);
 const guide=node("div","s3j-instructor-link",'<button type="button" data-s3j-open="guide">🎓 راهنمای اجرای کلاس و زمان‌بندی</button>');
 path.insertAdjacentElement("afterend",guide);
 const head=node("header","s3j-head",'<div class="s3j-headmark" aria-hidden="true">📘</div><div class="s3j-headcopy"><span id="s3j-step">گام ۱ از ۲</span><h2 id="s3j-title" tabindex="-1">تکنیک‌های شنود</h2><p id="s3j-desc"></p></div><button type="button" class="s3j-back" data-s3j-back>بازگشت</button>');
 guide.insertAdjacentElement("afterend",head);
 const pager=node("nav","s3j-pager",'<button type="button" data-s3j-back>→ صفحه قبل</button><span id="s3j-page">گام جاری</span><button type="button" data-s3j-forward>صفحه بعد ←</button>');
 pager.setAttribute("aria-label","ورق‌زدن صفحات جلسه سوم");
 wrap.appendChild(pager);
 const overview=q(".s3-overview"),cards=qa(".s3-overview .s3-tech");
 cards.forEach((card,i)=>{card.querySelector(".s3-tech-icon")?.replaceChildren(node("span","s3j-tech-icon",skillIcons[i]));const small=card.querySelector("small");if(small)small.textContent="تعریف · مثال · تمرین";});
 const lab=q(".s3-lab"),list=lab?.querySelector(".s3-cases");
 const cases=list?qa(".s3-cases > .s3-case"):[];
 if(cases.length===12){
  const roleIndex=node("div","s3j-roles");
  roleIndex.innerHTML=roles.map((role,i)=>'<button type="button" data-s3j-group="'+i+'"><span class="s3j-sticker" aria-hidden="true">'+roleIcons[i]+'</span><span><small>گروه '+digits(i+1)+' · دو موقعیت</small><strong>'+role+'</strong><em>'+descriptions[i]+'</em></span><b aria-hidden="true">←</b></button>').join("");
  list.insertAdjacentElement("beforebegin",roleIndex);
  for(let i=0;i<6;i++){
   const section=node("section","s3j-case-group");
   section.dataset.s3jGroup=String(i);
   section.innerHTML='<div class="s3j-group-heading"><small>گروه '+digits(i+1)+' از ۶</small><h3>'+roleIcons[i]+' '+roles[i]+'</h3><p>'+descriptions[i]+'</p></div>';
   const pair=node("div","s3j-pair");
   cases.slice(i*2,i*2+2).forEach(card=>pair.appendChild(card));
   section.appendChild(pair);list.appendChild(section);
  }
  const groupPager=node("nav","s3j-grouppager",'<button type="button" data-s3j-groupprev>→ گروه قبل</button><span id="s3j-groupcount">گروه ۱ از ۶</span><button type="button" data-s3j-groupnext>گروه بعد ←</button>');
  list.insertAdjacentElement("afterend",groupPager);
 }
 render("home",{focus:false});
}
function showTechniquePractice(){
 const detail=q("#s3-tech-detail");
 if(!detail||detail.hidden)return;
 detail.querySelector(".s3j-practice")?.remove();
 detail.querySelector(".s3j-techpager")?.remove();
 const current=completed.has(state.tech);
 const card=node("section","s3j-practice");
 card.innerHTML='<h4>تمرین کوتاه شنود مؤثر</h4><p>'+techniques[state.tech]+'</p>'+
 '<button type="button" aria-pressed="'+current+'" data-s3j-done="'+state.tech+'">'+(current?'✓ انجام شد؛ تغییر وضعیت':'تمرین کردم؛ ثبت پیشرفت')+'</button>'+
 '<small role="status">'+digits(completed.size)+' از ۶ تمرین ثبت شد</small>';
 detail.appendChild(card);
 const pager=node("nav","s3j-techpager",'<button type="button" data-s3j-tech="'+(state.tech-1)+'" '+(state.tech===0?"disabled":"")+'>→ تکنیک قبل</button><span>تکنیک '+digits(state.tech+1)+' از ۶</span><button type="button" data-s3j-tech="'+(state.tech+1)+'" '+(state.tech===5?"disabled":"")+'>تکنیک بعد ←</button>');
 detail.appendChild(pager);
}
function showCasePager(){
 const focus=q("#s3-focus"),work=focus?.querySelector(".s3-work");
 if(!work)return;
 work.querySelector(".s3j-casepager")?.remove();
 const active=work.querySelector(".s3-tabs button.active");
 const step=Number(active?.dataset.s3Step||0);
 const pager=node("nav","s3j-casepager",'<button type="button" data-s3j-stageback '+(step===0?"disabled":"")+'>→ مرحله قبل</button><span>مرحله '+digits(step+1)+' از ۴</span><button type="button" data-s3j-open="group">فهرست کیس‌ها</button>');
 work.querySelector(".s3-actions")?.insertAdjacentElement("beforebegin",pager);
}
function render(view,{tech,group,caseIndex,focus=true}={}){
 if(!["home","techniques","technique","practice","group","case","guide"].includes(view))view="home";
 if(Number.isInteger(tech))state.tech=Math.max(0,Math.min(5,tech));
 if(Number.isInteger(group))state.group=Math.max(0,Math.min(5,group));
 if(Number.isInteger(caseIndex))state.caseIndex=Math.max(0,Math.min(11,caseIndex));
 if(view!=="case")q(".s3-lab")?.classList.remove("s3-active");
 state.view=view;
 const root=q(".s3-root");if(!root)return;
 root.dataset.s3jView=view;
 const setHidden=(selector,hidden)=>{const e=q(selector);if(e)e.hidden=hidden;};
 setHidden(".s3-hero",view!=="home");
 setHidden(".s3-journey-path",view!=="home");
 setHidden(".s3j-instructor-link",view!=="home");
 setHidden(".s3j-head",view==="home");
 setHidden(".s3j-pager",view==="home");
 setHidden(".s3-overview",!["techniques","technique"].includes(view));
 setHidden(".s3-lab",!["practice","group","case"].includes(view));
 setHidden(".s3-instructor",view!=="guide");
 if(view==="guide"){const g=q(".s3-instructor");if(g)g.open=true;}
 setHidden(".s3-overview .s3-heading",view==="technique");
 setHidden(".s3-overview .s3-techs",view==="technique");
 setHidden(".s3-science",view==="technique");
 setHidden(".s3-lab .s3-heading",view!=="practice");
 setHidden(".s3j-roles",view!=="practice");
 setHidden(".s3-cases",view!=="group");
 setHidden(".s3j-grouppager",view!=="group");
 setHidden("#s3-focus",view!=="case");
 qa(".s3j-case-group").forEach((section,i)=>{section.hidden=view!=="group"||i!==state.group;});
 const info={
 techniques:["گام ۱ از ۲","شش تکنیک شنود مؤثر","یک تکنیک را باز کنید؛ مثال آن را در شعبه تمرین کنید.","📘"],
 technique:["تکنیک "+digits(state.tech+1)+" از ۶","تمرین یک مهارت شنود","تعریف، مثال، خطای رایج و تمرین کوتاه","👂"],
 practice:["گام ۲ از ۲","آزمایشگاه شنود مؤثر","با انتخاب یک گروه مخاطب، دو سناریوی کاربردی را تمرین کنید.","🎭"],
 group:["گروه "+digits(state.group+1)+" از ۶","انتخاب یک موقعیت","یکی از دو سناریو را برای ایفای نقش باز کنید.",roleIcons[state.group]],
 case:["کیس "+digits(state.caseIndex+1)+" از ۱۲","اجرای گفت‌وگو و بازخورد","اول اجرا کنید، سپس قواعد را ببینید و ادامه گفت‌وگو را تمرین کنید.","🗣️"],
 guide:["ویژه مدرس","راهنمای کلاس ۱۲۰ دقیقه‌ای","مراحل اجرا و نکات تسهیل‌گری","🎓"]
 }[view]||[];
 if(info.length){q("#s3j-step").textContent=info[0];q("#s3j-title").textContent=info[1];q("#s3j-desc").textContent=info[2];q(".s3j-headmark").textContent=info[3];}
 const count=q("#s3j-groupcount");
 if(count)count.textContent="گروه "+digits(state.group+1)+" از ۶";
 const gp=q("[data-s3j-groupprev]"),gn=q("[data-s3j-groupnext]");
 if(gp)gp.disabled=state.group===0;if(gn)gn.disabled=state.group===5;
 const labels={techniques:"۱/۲ · تکنیک‌ها",technique:digits(state.tech+1)+"/۶ · تکنیک",practice:"۲/۲ · رول‌پلی",group:digits(state.group+1)+"/۶ · گروه",case:digits(state.caseIndex+1)+"/۱۲ · کیس",guide:"راهنمای مدرس"};
 if(q("#s3j-page"))q("#s3j-page").textContent=labels[view]||"مسیر یادگیری";
 const next=q("[data-s3j-forward]");
 if(next){next.textContent=view==="case"?"کیس بعد ←":view==="guide"?"خانه دوره ←":view==="technique"&&state.tech===5?"ورود به آزمایشگاه ←":view==="group"&&state.group===5?"پایان مرور گروه‌ها":view==="group"?"گروه بعد ←":"صفحه بعد ←";next.disabled=view==="group"&&state.group===5;}
 if(view==="technique")showTechniquePractice();
 if(view==="case")showCasePager();
 if(focus&&view!=="home"){
  window.scrollTo?.({top:0,behavior:"instant"});
  requestAnimationFrame(()=>q("#s3j-title")?.focus({preventScroll:true}));
 }
}
function openTech(n){
 if(n<0||n>=6)return;
 const button=q('.s3-tech[data-s3-tech="'+n+'"]');
 if(!button)return;
 if(button.getAttribute("aria-expanded")!=="true" || q("#s3-tech-detail")?.hidden)button.click();
 render("technique",{tech:n});
}
function openCase(n){
 if(n<0||n>=12)return;
 const b=q('.s3-case[data-s3-case="'+n+'"]');
 if(b)b.click();
}
function back(){
 const v=state.view;
 if(v==="technique")return render("techniques");
 if(v==="case"){q("#s3-focus [data-s3-close]")?.click();return render("group");}
 if(v==="group")return render("practice");
 render("home");
}
function forward(){
 const v=state.view;
 if(v==="techniques")return openTech(0);
 if(v==="technique")return state.tech<5?openTech(state.tech+1):render("practice");
 if(v==="practice")return render("group",{group:0});
 if(v==="group"&&state.group<5)return render("group",{group:state.group+1});
 if(v==="case")return state.caseIndex<11?openCase(state.caseIndex+1):render("practice");
 if(v==="guide")return render("home");
}
window.alborzSession3Page=function(){original();read();install();};
document.addEventListener("click",event=>{
 if(!q(".s3-root"))return;
 const button=event.target.closest?.("button,a");
 if(!button)return;
 if(button.matches("[data-s3j-open]")){
  event.preventDefault();
  if(button.dataset.s3jOpen==="group"&&state.view==="case")q("#s3-focus [data-s3-close]")?.click();
  return render(button.dataset.s3jOpen);
 }
 if(button.matches("[data-s3j-done]")){
  const n=Number(button.dataset.s3jDone);
  if(completed.has(n))completed.delete(n);else completed.add(n);
  persist();showTechniquePractice();return;
 }
 if(button.matches("[data-s3j-back]"))return back();
 if(button.matches("[data-s3j-forward]"))return forward();
 if(button.matches("[data-s3j-group]"))return render("group",{group:Number(button.dataset.s3jGroup)});
 if(button.matches("[data-s3j-groupprev]"))return render("group",{group:state.group-1});
 if(button.matches("[data-s3j-groupnext]"))return render("group",{group:state.group+1});
 if(button.matches("[data-s3j-tech]"))return openTech(Number(button.dataset.s3jTech));
 if(button.matches("[data-s3-tech]")){
  const id=Number(button.dataset.s3Tech);
  if(q("#s3-tech-detail")?.hidden){button.click();return;}
  return render("technique",{tech:id});
 }
 if(button.matches("[data-s3-tech-close]"))return render("techniques");
 if(button.matches("[data-s3-case]"))return render("case",{caseIndex:Number(button.dataset.s3Case),group:Math.floor(Number(button.dataset.s3Case)/2)});
 if(button.matches("[data-s3-step],[data-s3-next]"))return showCasePager();
 if(button.matches("[data-s3j-stageback]")){
  const n=Number(q("#s3-focus .s3-tabs button.active")?.dataset.s3Step||0);
  if(n>0)q('#s3-focus [data-s3-step="'+(n-1)+'"]')?.click();
  return;
 }
 if(button.matches("[data-s3-nextcase]")){
  const current=state.caseIndex;
  return current<11?render("case",{caseIndex:current+1,group:Math.floor((current+1)/2)}):render("practice");
 }
 if(button.matches("[data-s3-close]"))return render("group");
});
})();