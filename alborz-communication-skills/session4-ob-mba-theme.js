/* Session four — premium multi-screen classroom UX (OB MBA design DNA).
   Keeps six techniques, twelve live roleplays and the original 6-minute quiz.
   No extra backend, no duplicated learning content. */
(function(){
"use strict";
const original=window.alborzSession4Page;
if(typeof original!=="function")return;

const techniqueEmojis=["🎯","🔎","🎙️","⏱️","👁️","🧭"];
const groupEmojis=["🤝","👔","🧑‍💻","💬","🧩","🏛️"];
const subtitles={
 home:["جلسه چهارم","فن بیان مدیریتی، لحن و زبان بدن","یادگیری را از یکی از سه مسیر زیر آغاز کنید."],
 techniques:["گام ۱ از ۳","شش تکنیک بیان حرفه‌ای","برای مطالعه تعریف، مثال و خطای رایج روی هر تکنیک بزنید."],
 technique:["درسنامه تعاملی","تمرین یک مهارت کاربردی","با ورق‌زدن بین شش تکنیک، مرور را کامل کنید."],
 practice:["گام ۲ از ۳","آزمایشگاه ایفای نقش","یکی از شش گروه مخاطب را انتخاب کنید."],
 group:["سناریوهای گفت‌وگو","انتخاب موقعیت","یکی از دو موقعیت این گروه را باز کنید."],
 case:["آزمایشگاه تعاملی","اجرای گفت‌وگو","چهار مرحله را به‌ترتیب اجرا کنید و بازخورد بگیرید."],
 exam:["گام ۳ از ۳","آزمون پایانی","۱۰ سؤال موقعیتی؛ شمارش معکوس با اولین پاسخ آغاز می‌شود."],
 guide:["ویژه مدرس","راهنمای اجرای کلاس","کنداکتور و زمان‌بندی ۱۲۰ دقیقه‌ای جلسه"]
};
let currentView="home",groupIndex=0,techIndex=0,caseIndex=0,internalNavigation=false;

const $=q=>document.querySelector(q);
const $$=q=>Array.from(document.querySelectorAll(q));
const el=(tag,cls,html)=>{const node=document.createElement(tag);if(cls)node.className=cls;if(html!==undefined)node.innerHTML=html;return node;};
function loadTheme(){
 if(document.getElementById("s4-ob-mba-theme-css"))return;
 const link=el("link");link.id="s4-ob-mba-theme-css";link.rel="stylesheet";
 link.href="session4-ob-mba-theme.css?v=20261112-s4-v3";
 document.head.appendChild(link);
}
function buildHome(){
 const wrap=$(".s4-root .wrap"),hero=wrap?.querySelector(".s4-hero");
 if(!wrap||!hero)return;
 const copy=hero.querySelector(".s4-hero-copy");
 if(copy&&!copy.querySelector(".s4-hero-metrics")){
  const metrics=el("div","s4-hero-metrics","<span>🎯 شش تکنیک</span><span>🎭 دوازده رول‌پلی</span><span>⏱️ آزمون شش‌دقیقه‌ای</span>");
  copy.appendChild(metrics);
 }
 const old=wrap.querySelector(".s4-path");
 if(old)old.remove();
 const nav=el("nav","s4-path");nav.setAttribute("aria-label","انتخاب مسیر یادگیری");
 nav.innerHTML=[
 ["techniques","📘","۰۱","تکنیک‌های مدیریتی","شش مهارت، مثال‌های شعبه و خطاهای رایج"],
 ["practice","🎭","۰۲","آزمایشگاه گفت‌وگو","شش گروه مخاطب، دوازده کیس، چهار مرحله"],
 ["exam","🏅","۰۳","آزمون و تحلیل نتیجه","ده سؤال، شش دقیقه و پاسخنامه تحلیلی"]
 ].map(a=>'<button type="button" class="s4-path-card" data-s4-open="'+a[0]+'"><span class="s4-path-sticker" aria-hidden="true">'+a[1]+'</span><span class="s4-path-copy"><small>'+a[2]+' · مسیر یادگیری</small><strong>'+a[3]+'</strong><span>'+a[4]+'</span></span><span class="s4-path-arrow" aria-hidden="true">←</span></button>').join("");
 hero.insertAdjacentElement("afterend",nav);
 if(!wrap.querySelector(".s4-home-footer")){
  const footer=el("div","s4-home-footer",'<button type="button" data-s4-open="guide">🎓 کنداکتور و راهنمای مدرس</button><span>✨ از انتخاب مسیر تا مشاهده بازخورد، مرحله‌به‌مرحله پیش بروید.</span>');
  nav.insertAdjacentElement("afterend",footer);
 }
 if(!wrap.querySelector(".s4-screen-head")){
  const head=el("header","s4-screen-head");
  head.innerHTML='<div class="s4-screen-banner"><div class="s4-screen-mark" id="s4-screen-emoji" aria-hidden="true">📘</div><div class="s4-screen-copy"><span id="s4-screen-step">گام ۱ از ۳</span><h2 id="s4-screen-title">شش تکنیک</h2><p id="s4-screen-description"></p></div></div><button type="button" class="s4-screen-back" data-s4-back>↩ بازگشت</button>';
  nav.insertAdjacentElement("afterend",head);
 }
 if(!wrap.querySelector(".s4-page-flip")){
  const flip=el("nav","s4-page-flip");flip.setAttribute("aria-label","ورق‌زدن مسیر آموزشی");
  flip.innerHTML='<button type="button" class="s4-flip-prev" data-s4-back>→ صفحه قبل</button><span class="s4-page-counter" id="s4-page-counter">مرحله جاری</span><button type="button" class="s4-flip-next" data-s4-advance>صفحه بعد ←</button>';
  wrap.appendChild(flip);
 }
 const oldMobile=$(".s4-mobile-nav");if(oldMobile)oldMobile.remove();
 if(!$(".s4-mobile-nav")){
  const nav=el("nav","s4-mobile-nav",'<button type="button" data-s4-open="home"><span>🏠</span>خانه</button><button type="button" data-s4-open="techniques"><span>📘</span>تکنیک‌ها</button><button type="button" data-s4-open="practice"><span>🎭</span>رول‌پلی</button><button type="button" data-s4-open="exam"><span>📝</span>آزمون</button>');
  nav.setAttribute("aria-label","ناوبری جلسه چهارم");
  document.body.appendChild(nav);
 }
}
function decorateTechniques(){
 const cards=$$(".s4-overview .s4-tech");
 cards.forEach((card,i)=>{
  card.querySelector(".s4-tech-icon")?.replaceChildren(el("span","s4-emoji-sticker",techniqueEmojis[i]));
  const teaser=card.querySelector("small");
  if(teaser)teaser.textContent="تعریف · مثال · خطای رایج";
  card.setAttribute("aria-label","مطالعه تکنیک "+(i+1));
 });
 const overview=$(".s4-overview");
 if(overview?.querySelector(".s4-heading h2"))overview.querySelector(".s4-heading h2").textContent="شش تکنیک فن بیان مدیریتی";
}
function decorateRoles(){
 const list=$(".s4-lab .s4-cases");
 if(!list)return;
 const cards=$$(".s4-lab .s4-cases > .s4-case");
 if(cards.length!==12)return;
 const existing=$(".s4-role-index");if(existing)existing.remove();
 const roleIndex=el("div","s4-role-index");
 const roles=["رئیس شعبه همتا","معاون شعبه","کارشناس شعبه","مشتری","نماینده","ستاد"];
 const descriptions=["همسویی بین دو شعبه","گفت‌وگوی مسئولیت و پیگیری","بازخورد و هماهنگی تیم","اعتمادسازی در ارتباط با مشتری","مدیریت انتظارات شبکه فروش","تعامل حرفه‌ای شعبه و ستاد"];
 roleIndex.innerHTML=roles.map((name,i)=>'<button type="button" class="s4-role-tile" data-s4-group="'+i+'"><span class="s4-role-sticker" aria-hidden="true">'+groupEmojis[i]+'</span><span class="s4-role-tile-copy"><small>گروه '+String(i+1).replace(/[0-9]/g,d=>"۰۱۲۳۴۵۶۷۸۹"[+d])+' · ۲ موقعیت</small><strong>'+name+'</strong><span>'+descriptions[i]+'</span></span><span class="s4-role-arrow" aria-hidden="true">←</span></button>').join("");
 list.insertAdjacentElement("beforebegin",roleIndex);
 // Physical grouping avoids a long 12-card wall and preserves the original delegated handlers.
 const oldGroups=Array.from(list.children).filter(x=>x.classList?.contains("s4-case-group"));
 oldGroups.forEach(x=>x.remove());
 const allCards=cards.length?cards:$$(".s4-lab .s4-case");
 // If the page was enhanced before, cards were moved into groups. Move by actual case number.
 const sorted=allCards.slice().sort((a,b)=>Number(a.dataset.s4Case)-Number(b.dataset.s4Case));
 for(let i=0;i<6;i++){
  const g=el("section","s4-case-group");
  g.dataset.s4Group=String(i);
  const head=el("div","s4-case-group-header",'<span class="s4-group-label">گروه '+String(i+1).replace(/[0-9]/g,d=>"۰۱۲۳۴۵۶۷۸۹"[+d])+'</span><h3>'+groupEmojis[i]+' '+roles[i]+'</h3><p>'+descriptions[i]+'</p>');
  g.appendChild(head);
  const pair=el("div","s4-case-pair");
  sorted.slice(i*2,i*2+2).forEach(c=>pair.appendChild(c));
  g.appendChild(pair);list.appendChild(g);
 }
 if(!$(".s4-group-nav")){
  const bar=el("div","s4-group-nav",'<button type="button" data-s4-group-prev>→ گروه قبل</button><span id="s4-group-counter">گروه ۱ از ۶</span><button type="button" data-s4-group-next>گروه بعد ←</button>');
  list.insertAdjacentElement("afterend",bar);
 }
}
function highlightGroup(){
 $$(".s4-case-group").forEach((g,i)=>{g.hidden=i!==groupIndex;});
 const bar=$(".s4-group-nav");
 if(bar){
  bar.hidden=currentView!=="group";
  const c=$("#s4-group-counter");if(c)c.textContent="گروه "+String(groupIndex+1).replace(/[0-9]/g,d=>"۰۱۲۳۴۵۶۷۸۹"[+d])+" از ۶";
  const before=bar.querySelector("[data-s4-group-prev]"),after=bar.querySelector("[data-s4-group-next]");
  if(before)before.disabled=groupIndex===0;if(after)after.disabled=groupIndex===5;
 }
}
function showTechnologyPager(){
 const detail=$("#s4-tech-detail");
 if(!detail||detail.hidden)return;
 const old=detail.querySelector(".s4-tech-flipper");if(old)old.remove();
 const pager=el("nav","s4-tech-flipper");pager.setAttribute("aria-label","ورق زدن تکنیک‌ها");
 pager.innerHTML='<button type="button" data-s4-tech-flip="'+(techIndex-1)+'" '+(techIndex===0?"disabled":"")+'>→ تکنیک قبل</button><span>📖 تکنیک '+String(techIndex+1).replace(/[0-9]/g,d=>"۰۱۲۳۴۵۶۷۸۹"[+d])+' از ۶</span><button type="button" data-s4-tech-flip="'+(techIndex+1)+'" '+(techIndex===5?"disabled":"")+'>تکنیک بعد ←</button>';
 detail.appendChild(pager);
}
function showCasePager(){
 const focus=$("#s4-focus"),work=focus?.querySelector(".s4-work");
 if(!work)return;
 const old=work.querySelector(".s4-case-pagination");if(old)old.remove();
 const box=el("div","s4-case-pagination");
 const current=work.querySelector(".s4-tabs button.active");
 const step=Number(current?.dataset.s4Step||0);
 box.innerHTML='<button type="button" data-s4-stepback '+(step===0?'disabled':'')+'>→ مرحله قبل</button><span>🎭 مرحله '+String(step+1).replace(/[0-9]/g,d=>"۰۱۲۳۴۵۶۷۸۹"[+d])+' از ۴</span><button type="button" data-s4-open="group">فهرست کیس‌ها</button>';
 work.querySelector(".s4-actions")?.insertAdjacentElement("beforebegin",box);
}
function renderView(view,options={}){
 const valid=Object.keys(subtitles);
 if(!valid.includes(view))view="home";
 currentView=view;
 if(Number.isInteger(options.groupIndex))groupIndex=Math.max(0,Math.min(5,options.groupIndex));
 if(Number.isInteger(options.techIndex))techIndex=Math.max(0,Math.min(5,options.techIndex));
 if(Number.isInteger(options.caseIndex))caseIndex=Math.max(0,Math.min(11,options.caseIndex));
 const root=$(".s4-root"),wrap=$(".s4-root .wrap");
 if(!root||!wrap)return;
 root.dataset.s4View=view;
 const hero=wrap.querySelector(".s4-hero"),path=wrap.querySelector(".s4-path");
 const overview=wrap.querySelector(".s4-overview"),lab=wrap.querySelector(".s4-lab");
 const guide=wrap.querySelector(".s4-instructor"),exam=wrap.querySelector("#s4-final-exam");
 const head=wrap.querySelector(".s4-screen-head"),flip=wrap.querySelector(".s4-page-flip");
 const footer=wrap.querySelector(".s4-home-footer");
 if(hero)hero.hidden=view!=="home";
 if(path)path.hidden=view!=="home";
 if(footer)footer.hidden=view!=="home";
 if(overview)overview.hidden=!["techniques","technique"].includes(view);
 if(lab)lab.hidden=!["practice","group","case"].includes(view);
 if(guide)guide.hidden=view!=="guide";
 if(exam)exam.hidden=view!=="exam";
 if(head)head.hidden=view==="home";
 if(flip)flip.hidden=view==="home";
 const labels={
 technique:["تکنیک "+String(techIndex+1).replace(/[0-9]/g,d=>"۰۱۲۳۴۵۶۷۸۹"[+d])+" از ۶","مطالعه و مرور مهارت","تعریف، مثال و خطای رایج را بررسی کنید."],
 group:["گروه "+String(groupIndex+1).replace(/[0-9]/g,d=>"۰۱۲۳۴۵۶۷۸۹"[+d])+" از ۶","انتخاب یکی از دو سناریو","وارد کیس شوید و چهار مرحله اجرا را جلو ببرید."],
 case:["کیس "+String(caseIndex+1).replace(/[0-9]/g,d=>"۰۱۲۳۴۵۶۷۸۹"[+d])+" از ۱۲","ایفای نقش و بازخورد","هر مرحله یک صفحه مستقل از اجرای گفت‌وگو است."]
 };
 const a=labels[view]||subtitles[view];
 const emojis={techniques:"📘",technique:techniqueEmojis[techIndex],practice:"🎭",group:groupEmojis[groupIndex],case:"🗣️",exam:"🏅",guide:"🎓"};
 const step=$("#s4-screen-step"),title=$("#s4-screen-title"),desc=$("#s4-screen-description"),emoji=$("#s4-screen-emoji");
 if(step)step.textContent=a[0];if(title)title.textContent=a[1];if(desc)desc.textContent=a[2];if(emoji)emoji.textContent=emojis[view]||"📘";
 const overviewHeading=overview?.querySelector(".s4-heading"),techGrid=overview?.querySelector(".s4-techs"),detail=$("#s4-tech-detail"),science=overview?.querySelector(".s4-science");
 if(overviewHeading)overviewHeading.hidden=view==="technique";
 if(techGrid)techGrid.hidden=view==="technique";
 if(science)science.hidden=view!=="techniques";
 // The original technique renderer owns detail.hidden. Visual hiding is scoped to the list view.
 const labHeading=lab?.querySelector(".s4-heading"),roleIndex=lab?.querySelector(".s4-role-index");
 const caseList=lab?.querySelector(".s4-cases"),focus=lab?.querySelector(".s4-focus");
 if(labHeading)labHeading.hidden=view!=="practice";
 if(roleIndex)roleIndex.hidden=view!=="practice";
 if(caseList)caseList.hidden=view!=="group";
 if(focus)focus.hidden=view!=="case";
 highlightGroup();
 if(view==="technique")showTechnologyPager();
 if(view==="case")showCasePager();
 if(flip){
  const label=$("#s4-page-counter"),next=flip.querySelector("[data-s4-advance]");
  const labels={techniques:"۱ / ۳ · تکنیک‌ها",technique:(techIndex+1)+" / ۶ · تکنیک",practice:"۲ / ۳ · تمرین",group:(groupIndex+1)+" / ۶ · گروه",case:(caseIndex+1)+" / ۱۲ · کیس",exam:"۳ / ۳ · آزمون",guide:"راهنمای مدرس"};
  if(label)label.textContent=labels[view]||"مسیر یادگیری";
  if(next){
   const navNames={techniques:"شروع مطالعه ←",technique:techIndex===5?"ورود به تمرین‌ها ←":"تکنیک بعد ←",practice:"مشاهده گروه اول ←",group:groupIndex===5?"آزمون پایانی ←":"گروه بعد ←",case:"کیس بعد ←",exam:"پایان مسیر",guide:"بازگشت به خانه"};
   next.textContent=navNames[view]||"صفحه بعد ←";
   next.disabled=view==="exam";
  }
 }
 $$(".s4-mobile-nav [data-s4-open]").forEach(btn=>btn.classList.toggle("active",btn.dataset.s4Open===view));
 if(options.scroll!==false)window.scrollTo?.({top:0,behavior:"instant"});
}
function openTechnique(n){
 if(n<0||n>5)return;
 techIndex=n;
 const btn=$('.s4-tech[data-s4-tech="'+n+'"]');
 if(!btn)return;
 // The original click handler populates the learning content, no duplicate source of truth.
 const expanded=btn.getAttribute("aria-expanded")==="true";
 if(!expanded)btn.click();
 else renderView("technique",{techIndex:n});
}
function openCase(n){
 if(n<0||n>11)return;
 const button=$('.s4-case[data-s4-case="'+n+'"]');
 if(!button)return;
 caseIndex=n;groupIndex=Math.floor(n/2);
 button.click();
}
function goBack(){
 if(currentView==="technique"){renderView("techniques");return;}
 if(currentView==="case"){
  const close=$("#s4-focus [data-s4-close]");
  if(close){close.click();return;}
  renderView("group");return;
 }
 if(currentView==="group"){renderView("practice");return;}
 renderView("home");
}
function goForward(){
 if(currentView==="techniques"){openTechnique(0);return;}
 if(currentView==="technique"){if(techIndex<5)openTechnique(techIndex+1);else renderView("practice");return;}
 if(currentView==="practice"){renderView("group",{groupIndex:0});return;}
 if(currentView==="group"){if(groupIndex<5)renderView("group",{groupIndex:groupIndex+1});else renderView("exam");return;}
 if(currentView==="case"){if(caseIndex<11)openCase(caseIndex+1);else renderView("exam");return;}
 if(currentView==="guide")renderView("home");
}
function start(){
 const wrap=$(".s4-root .wrap");
 if(!wrap)return;
 loadTheme();
 buildHome();
 decorateTechniques();
 decorateRoles();
 renderView("home",{scroll:false});
}
// Script ordering: core roleplay, timed exam, then this progressive disclosure layer.
window.alborzSession4Page=function(){original();start();};
document.addEventListener("click",ev=>{
 if(!$(".s4-root"))return;
 const b=ev.target.closest?.("button,a");
 if(!b)return;
 if(b.matches("[data-s4-open]")){
  ev.preventDefault();
  const route=b.dataset.s4Open;
  if(route==="group"){if(currentView==="case"){const close=$("#s4-focus [data-s4-close]");if(close){close.click();return;}}renderView("group");return;}
  renderView(route);return;
 }
 if(b.matches("[data-s4-back]")){goBack();return;}
 if(b.matches("[data-s4-advance]")){goForward();return;}
 if(b.matches("[data-s4-group]")){renderView("group",{groupIndex:Number(b.dataset.s4Group)});return;}
 if(b.matches("[data-s4-group-prev]")){renderView("group",{groupIndex:groupIndex-1});return;}
 if(b.matches("[data-s4-group-next]")){renderView("group",{groupIndex:groupIndex+1});return;}
 if(b.matches("[data-s4-tech]")){renderView("technique",{techIndex:Number(b.dataset.s4Tech)});return;}
 if(b.matches("[data-s4-tech-flip]")){openTechnique(Number(b.dataset.s4TechFlip));return;}
 if(b.matches("[data-s4-tech-close]")){renderView("techniques");return;}
 if(b.matches("[data-s4-case]")){caseIndex=Number(b.dataset.s4Case);renderView("case",{caseIndex,groupIndex:Math.floor(caseIndex/2)});return;}
 if(b.matches("[data-s4-step]")||b.matches("[data-s4-next]")){showCasePager();return;}
 if(b.matches("[data-s4-stepback]")){
  const active=$("#s4-focus .s4-tabs button.active");
  const n=Number(active?.dataset.s4Step||0);
  if(n>0)$('#s4-focus [data-s4-step="'+(n-1)+'"]')?.click();
  return;
 }
 if(b.matches("[data-s4-nextcase]")){
  const n=caseIndex;
  if(n>=11){renderView("practice");return;}
  caseIndex=n+1;renderView("case",{caseIndex,groupIndex:Math.floor(caseIndex/2)});return;
 }
 if(b.matches("[data-s4-close]")){renderView("group");return;}
});
})();
