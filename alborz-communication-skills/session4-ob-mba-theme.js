/* Session four — premium multi-screen classroom UX (OB MBA design DNA).
   Keeps six techniques, twelve live roleplays and the original 6-minute quiz.
   No extra backend, no duplicated learning content. */
(function(){
"use strict";
const original=window.alborzSession4Page;
if(typeof original!=="function")return;

const techniqueEmojis=["🎤","🎯","🎙️","⏸️","🧍","💬"];
// Each of the twelve original roleplays has exactly one primary skill.
// Their original scripts, roles and four stages remain in the core source.
const techniqueCases=[[0,1],[2,3],[4,5],[6,7],[8,9],[10,11]];
const caseSequence=techniqueCases.flat();
const primaryByCase=Object.fromEntries(techniqueCases.flatMap((ids,skill)=>ids.map(id=>[id,skill])));
const extraExamples=[["در گفت‌وگوی دو رئیس شعبه: «جلوی آینه نحوه شروع و ژست را تمرین کردم و بعد صدایم را ضبط کردم.»","اگر صحبت در جمع دشوار است، از یک گفت‌وگوی یک‌دقیقه‌ای با یک همکار شروع و به‌تدریج گروه را بزرگ‌تر کنید."],["در گزارش به مدیرعامل: «پیشنهاد من یک دوره آزمایشی کاهش انتظار است؛ گزارش مراجعات مبنای آن است؛ درخواست بررسی طرح را دارم.»","در گفت‌وگوی داخلی: «اصل موضوع تأخیر پاسخ‌گویی است؛ شاهد ما گزارش امروز است؛ گام بعدی بررسی ظرفیت است.»"],["به مشتری: «فرایند در گردش است» را به «نتیجه هنوز نهایی نشده است» تبدیل کنید.","بعد از تپق: [مکث] «اجازه بدهید روشن‌تر بگویم...» و بدون عذرخواهی تکراری ادامه بدهید."],["در توضیح به بیمارستان: «اول وضعیت مدارک را بررسی می‌کنیم [مکث] بعد مسیر پیگیری را مشخص می‌کنیم.»","در گفت‌وگو با کارکنان روی واژه «آزمایشی» تأکید کنید، سپس برای طرح نگرانی‌ها مکث واقعی داشته باشید."],["موقع شنیدن اعتراض نماینده، گوشی را کنار بگذارید، به او نگاه کنید و حرفش را قطع نکنید.","در ارائه آنلاین با سازمان طرف قرارداد، به جای خواندن اسلاید برداشت مدیریتی خود را رو به دوربین بیان کنید."],["در جلسه با مدیرعامل: «افزایش شکایت ثبت شده؛ علت نهایی هنوز تأیید نشده است.»","در پاسخ به نهاد نظارتی: «برای عدد مستند باید گزارش ثبت‌شده را بررسی کنیم؛ عدد حدسی نمی‌دهم.»"]];
// Primary/direct and secondary/indirect links are grounded in each scenario's actual dialogue.
const caseRelations={"0":{"why":"آیا رئیس شعبه با توضیح تمرین‌های قابل اجرا به‌جای نسبت‌دادن توانایی به استعداد ذاتی، گفت‌وگوی دلگرم‌کننده‌ای داشت؟","other":[[1,"تمرین مکمل برای کنترل پیام و شیوه بیان"],[2,"پشتیبانی از تعامل حرفه‌ای با شنونده"]]},"1":{"why":"آیا سخنران بدون عذرخواهی و شتاب، با مکث و جمله آغازین روشن شروع کرد؟","other":[[1,"تمرین مکمل برای کنترل پیام و شیوه بیان"],[2,"پشتیبانی از تعامل حرفه‌ای با شنونده"]]},"2":{"why":"آیا نتیجه، شاهد و درخواست هر سه به‌صورت واضح و به‌ترتیب منتقل شدند؟","other":[[2,"تمرین مکمل برای کنترل پیام و شیوه بیان"],[3,"پشتیبانی از تعامل حرفه‌ای با شنونده"]]},"3":{"why":"آیا توصیه اصلی، یک شاهد معتبر و درخواست تصمیم به‌ترتیب و کوتاه بیان شد؟","other":[[2,"تمرین مکمل برای کنترل پیام و شیوه بیان"],[3,"پشتیبانی از تعامل حرفه‌ای با شنونده"]]},"4":{"why":"آیا مجری با صدای کافی، بازدم طبیعی و جملات کوتاه بعد از لرزش به ارائه ادامه داد؟","other":[[3,"تمرین مکمل برای کنترل پیام و شیوه بیان"],[4,"پشتیبانی از تعامل حرفه‌ای با شنونده"]]},"5":{"why":"آیا پس از تپق، رئیس شعبه بدون عذرخواهی مکرر دوباره شفاف و شمرده صحبت کرد؟","other":[[3,"تمرین مکمل برای کنترل پیام و شیوه بیان"],[4,"پشتیبانی از تعامل حرفه‌ای با شنونده"]]},"6":{"why":"آیا لحن غیرسرزنشگر، مکث واقعی و تأکید بر «آزمایشی» امکان گفت‌وگو را بیشتر کرد؟","other":[[4,"تمرین مکمل برای کنترل پیام و شیوه بیان"],[5,"پشتیبانی از تعامل حرفه‌ای با شنونده"]]},"7":{"why":"آیا رئیس شعبه سرعتش را کاهش داد، لحن دفاعی را کنار گذاشت و بعد از سؤال مکث کرد؟","other":[[4,"تمرین مکمل برای کنترل پیام و شیوه بیان"],[5,"پشتیبانی از تعامل حرفه‌ای با شنونده"]]},"8":{"why":"آیا رئیس شعبه گوشی را کنار گذاشت، رو به مخاطب قرار گرفت و با نگاه طبیعی گوش داد؟","other":[[5,"تمرین مکمل برای کنترل پیام و شیوه بیان"],[0,"پشتیبانی از تعامل حرفه‌ای با شنونده"]]},"9":{"why":"آیا مدیر هنگام صحبت از روی متن جدا شد، تماس دیداری نسبی داشت و خودِ پیام اسلاید را بیان کرد؟","other":[[5,"تمرین مکمل برای کنترل پیام و شیوه بیان"],[0,"پشتیبانی از تعامل حرفه‌ای با شنونده"]]},"10":{"why":"آیا پاسخ بدون قطع سؤال و ادعای بی‌سند ارائه شد؟","other":[[0,"تمرین مکمل برای کنترل پیام و شیوه بیان"],[1,"پشتیبانی از تعامل حرفه‌ای با شنونده"]]},"11":{"why":"آیا مدیر با شنیدن سؤال کامل، صریح‌گویی درباره محدودیت داده و پاسخ غیردفاعی اعتماد ایجاد کرد؟","other":[[0,"تمرین مکمل برای کنترل پیام و شیوه بیان"],[1,"پشتیبانی از تعامل حرفه‌ای با شنونده"]]}};
const persianNumber=n=>String(n).replace(/[0-9]/g,d=>"۰۱۲۳۴۵۶۷۸۹"[+d]);
const subtitles={
 home:["جلسه چهارم","فن بیان مدیریتی، لحن و زبان بدن","یادگیری را از یکی از سه مسیر زیر آغاز کنید."],
 techniques:["گام ۱ از ۳","شش تکنیک فن بیان و مهارت‌های کلامی","تعریف، سه مثال و خطای رایج را بخوانید؛ سپس دو رول‌پلی هر تکنیک را ببینید."],
 technique:["درسنامه","تکنیک انتخاب‌شده","سه مثال شغلی و دو رول‌پلی اصلی این مهارت"],
 practice:["گام ۲ از ۳","۱۲ رول‌پلی؛ بدون گروه‌بندی","هر گفت‌وگو یا ارائه یک مهارت اصلی و دو مهارت مکمل دارد؛ رفتار شنیدنی و دیدنی را ارزیابی کنید."],
 case:["آزمایشگاه تعاملی","اجرای گفت‌وگو","چهار مرحله: اجرای اول، قواعد، اجرای دوم و بازخورد"],
 exam:["گام ۳ از ۳","آزمون پایانی","۱۲ سؤال موقعیتی؛ شمارش معکوس با اولین پاسخ آغاز می‌شود."],
 guide:["ویژه مدرس","راهنمای اجرای کلاس","کنداکتور و زمان‌بندی ۱۲۰ دقیقه‌ای جلسه"]
};
let currentView="home",techIndex=0,caseIndex=0,caseReturn="practice";

const $=q=>document.querySelector(q);
const $$=q=>Array.from(document.querySelectorAll(q));
const el=(tag,cls,html)=>{const node=document.createElement(tag);if(cls)node.className=cls;if(html!==undefined)node.innerHTML=html;return node;};
function loadTheme(){
 if(!document.getElementById("s4-ob-mba-theme-css")){
  const theme=el("link");theme.id="s4-ob-mba-theme-css";theme.rel="stylesheet";
  theme.href="session4-ob-mba-theme.css?v=20261114-impeccable-r1";
  document.head.appendChild(theme);
 }
 // The mobile layer loads after the established Session Four theme.
 if(!document.getElementById("s4-mobile-first-css")){
  const mobile=el("link");mobile.id="s4-mobile-first-css";mobile.rel="stylesheet";
  mobile.href="session4-mobile-first-20261115.css?v=1";
  document.head.appendChild(mobile);
 }
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
 ["techniques","📘","۰۱","تکنیک‌های مدیریتی","شش مهارت فن بیان، تعامل کلامی و ارائه با تمرین‌های اجرایی"],
 ["practice","🎭","۰۲","آزمایشگاه گفت‌وگو و ارائه","دوازده موقعیت واقعی: گفت‌وگوی دونفره، ارائه و پرسش‌وپاسخ"],
 ["exam","🏅","۰۳","آزمون و تحلیل نتیجه","دوازده سؤال، شش دقیقه و پاسخنامه تشریحی"]
 ].map(a=>'<button type="button" class="s4-path-card" data-s4-open="'+a[0]+'"><span class="s4-path-sticker" aria-hidden="true">'+a[1]+'</span><span class="s4-path-copy"><small>'+a[2]+' · مسیر یادگیری</small><strong>'+a[3]+'</strong><span>'+a[4]+'</span></span><span class="s4-path-arrow" aria-hidden="true">←</span></button>').join("");
 hero.insertAdjacentElement("afterend",nav);
 if(!wrap.querySelector(".s4-home-footer")){
  const footer=el("div","s4-home-footer",'<button type="button" data-s4-open="guide">🎓 کنداکتور و راهنمای مدرس</button><span>✨ از انتخاب مسیر تا مشاهده بازخورد، مرحله‌به‌مرحله پیش بروید.</span>');
  nav.insertAdjacentElement("afterend",footer);
 }
 if(!wrap.querySelector(".s4-screen-head")){
  const head=el("header","s4-screen-head");
  head.innerHTML='<div class="s4-screen-banner"><div class="s4-screen-mark" id="s4-screen-emoji" aria-hidden="true">📘</div><div class="s4-screen-copy"><span id="s4-screen-step">گام ۱ از ۳</span><h2 id="s4-screen-title" tabindex="-1">شش تکنیک</h2><p id="s4-screen-description"></p></div></div><button type="button" class="s4-screen-back" data-s4-back>↩ بازگشت</button>';
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
  wrap.appendChild(nav);
 }
}
function decorateTechniques(){
 const cards=$$(".s4-overview .s4-tech");
 cards.forEach((card,i)=>{
  card.querySelector(".s4-tech-icon")?.replaceChildren(el("span","s4-emoji-sticker",techniqueEmojis[i]));
  const teaser=card.querySelector("small");
  if(teaser)teaser.textContent="تعریف · سه مثال · خطای رایج · دو رول‌پلی";
  card.setAttribute("aria-label","مطالعه تکنیک "+(i+1));
 });
 const overview=$(".s4-overview");
 if(overview?.querySelector(".s4-heading h2"))overview.querySelector(".s4-heading h2").textContent="شش تکنیک فن بیان مدیریتی";
}

function techniqueName(i){
 return $('.s4-tech[data-s4-tech="'+i+'"] strong')?.textContent||("تکنیک "+persianNumber(i+1));
}
function caseLabel(id){
 return $('.s4-case[data-s4-case="'+id+'"] .s4-case-label strong')?.textContent||("کیس "+persianNumber(id+1));
}
function caseRole(id){
 return $('.s4-case[data-s4-case="'+id+'"] .s4-case-label small')?.textContent.split(" · ")[0]||"";
}
function appendText(parent,tag,className,text){
 const item=el(tag,className);item.textContent=text;parent.appendChild(item);return item;
}
function decorateRoleplays(){
 const list=$(".s4-lab .s4-cases");
 if(!list)return;
 $$(".s4-role-index,.s4-group-nav").forEach(x=>x.remove());
 const cards=$$(".s4-lab .s4-cases > .s4-case");
 if(cards.length!==12)return;
 const byId=new Map(cards.map(c=>[Number(c.dataset.s4Case),c]));
 list.classList.add("s4-case-flat");
 for(const id of caseSequence){
  const card=byId.get(id),relation=caseRelations[id];
  if(!card||!relation)continue;
  const label=card.querySelector(".s4-case-label");
  const note=label?.querySelector("small");
  if(note)note.textContent=note.textContent.split(" · ")[0];
  const prior=label?.querySelector(".s4-case-tags");
  prior?.remove();
  const tags=el("span","s4-case-tags");
  appendText(tags,"span","s4-direct-tag","ارتباط مستقیم: "+techniqueName(primaryByCase[id]));
  appendText(tags,"span","s4-indirect-tag","ارتباط غیرمستقیم: "+relation.other.map(x=>techniqueName(x[0])).join("، "));
  label?.appendChild(tags);
  card.setAttribute("aria-label","رول‌پلی "+persianNumber(id+1)+"، "+caseLabel(id)+"، مهارت اصلی "+techniqueName(primaryByCase[id]));
  list.appendChild(card);
 }
 const head=$(".s4-lab .s4-heading");
 if(head){
  const h=head.querySelector("h2"),p=head.querySelector("p");
  if(h)h.textContent="دوازده رول‌پلی گفت‌وگو و ارائه";
  if(p)p.textContent="بدون گروه‌بندی: برای هر تکنیک دقیقاً دو کیس اصلی داریم. روی هر کیس بزنید و ارتباط‌های مستقیم و غیرمستقیم را ببینید.";
 }
}
function decorateTechniqueDetail(){
 const detail=$("#s4-tech-detail");
 if(!detail||detail.hidden)return;
 detail.querySelector(".s4-tech-challenge")?.remove();
 detail.querySelector(".s4-tech-flipper")?.remove();
 detail.querySelector(".s4-linked-roleplays")?.remove();
 const content=detail.querySelector(".s4-tech-detail-content");
 const exampleBox=content?.children[1];
 if(exampleBox){
  const lead=exampleBox.querySelector("b");
  if(lead)lead.textContent="سه مثال واقعی در فضای شعبه";
  const original=exampleBox.querySelector("p");
  if(original){
   const items=[original.textContent,...extraExamples[techIndex]];
   const list=el("ol","s4-example-list");
   items.forEach((sentence,i)=>{
    const li=el("li","s4-example-item");
    appendText(li,"strong","","مثال "+persianNumber(i+1));
    appendText(li,"p","",sentence);
    list.appendChild(li);
   });
   original.replaceWith(list);
  }
 }
 const links=el("section","s4-linked-roleplays");
 appendText(links,"h4","","دو تمرین عملی همین تکنیک");
 appendText(links,"p","s4-linked-help","یکی را انتخاب کنید. نقش‌ها، گفت‌وگوی پیش از اصلاح، قواعد و نمونه حرفه‌ای بعد از اصلاح در چهار صفحه نمایش داده می‌شوند.");
 const pair=el("div","s4-linked-pair");
 for(const id of techniqueCases[techIndex]){
  const relation=caseRelations[id],button=el("button","s4-linked-case");
  button.type="button";button.dataset.s4LinkedCase=String(id);
  appendText(button,"span","s4-linked-index","رول‌پلی "+persianNumber(id+1));
  appendText(button,"strong","",caseLabel(id));
  appendText(button,"small","","ارتباط مستقیم: "+techniqueName(techIndex));
  appendText(button,"span","s4-linked-reason",relation.why);
  pair.appendChild(button);
 }
 links.appendChild(pair);
 detail.appendChild(links);
}
function decorateCaseRelations(){
 const work=$("#s4-focus .s4-work");
 if(!work)return;
 work.querySelector(".s4-relation-map")?.remove();
 const rel=caseRelations[caseIndex];
 if(!rel)return;
 const block=el("section","s4-relation-map");
 appendText(block,"h4","","پیوند این رول‌پلی با تکنیک‌های جلسه");
 const direct=el("div","s4-relation-direct");
 appendText(direct,"strong","","ارتباط مستقیم · "+techniqueName(primaryByCase[caseIndex]));
 appendText(direct,"p","",rel.why);
 block.appendChild(direct);
 const others=el("div","s4-relation-indirect");
 appendText(others,"strong","","ارتباط غیرمستقیم · مهارت‌های مکمل");
 const ul=el("ul","");
 rel.other.forEach(([skill,reason])=>appendText(ul,"li","",techniqueName(skill)+" — "+reason));
 others.appendChild(ul);block.appendChild(others);
 const scene=work.querySelector(".s4-scene");
 if(scene)scene.insertAdjacentElement("afterend",block);
 else work.prepend(block);
}

function showCasePager(){
 const focus=$("#s4-focus"),work=focus?.querySelector(".s4-work");
 if(!work)return;
 // Only one navigation system: the original four-stage tabs and action row.
 // Remove the older secondary stage counter/pager if it exists.
 work.querySelector(".s4-case-pagination")?.remove();
 const current=work.querySelector(".s4-tabs button.active");
 const step=Number(current?.dataset.s4Step||0);
 const actions=work.querySelector(".s4-actions");
 if(!actions)return;
 actions.querySelector("[data-s4-stepback]")?.remove();
 const back=el("button","s4-secondary","→ مرحله قبل");
 back.type="button";back.dataset.s4Stepback="";
 back.disabled=step===0;back.setAttribute("aria-label","بازگشت به مرحله قبل همین گفت‌وگو");
 actions.prepend(back);
 const returnBtn=actions.querySelector("[data-s4-close]");
 if(returnBtn)returnBtn.textContent=caseReturn==="technique"?"بازگشت به درسنامه تکنیک":"بازگشت به فهرست رول‌پلی‌ها";
 if(step===3){
  const checklist=work.querySelector(".s4-behavior-check");
  if(checklist&&!checklist.querySelector('input[type="checkbox"]')){
   checklist.querySelectorAll("li").forEach((item,i)=>{
    const note=item.textContent.trim();item.textContent="";
    const label=el("label","s4-observation-option");
    const input=el("input");input.type="checkbox";input.dataset.s4Observe=String(i);
    label.appendChild(input);label.appendChild(document.createTextNode(note));item.appendChild(label);
   });
   const feedback=el("p","s4-observation-progress","۰ از ۳ رفتار مشاهده شد");
   feedback.setAttribute("role","status");checklist.appendChild(feedback);
  }
  // The same case-specific criterion already appears in the checklist.
  const repeated=Array.from(work.querySelectorAll(".s4-feedback-panel > p"))
   .find(p=>p.querySelector("b")?.textContent?.trim()==="معیار این کیس:");
  repeated?.remove();
  const nextCase=work.querySelector("[data-s4-nextcase]");
  if(nextCase)nextCase.textContent=caseSequence.indexOf(caseIndex)===11?"پایان رول‌پلی‌ها · ورود به آزمون ←":"رول‌پلی بعدی ←";
 }
}

function renderView(view,options={}){
 if(!Object.hasOwn(subtitles,view))view="home";
 if(view!=="case")$(".s4-lab")?.classList.remove("s4-active");
 currentView=view;
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
 if(lab)lab.hidden=!["practice","case"].includes(view);
 if(guide){guide.hidden=view!=="guide";if(view==="guide")guide.open=true;}
 if(exam)exam.hidden=view!=="exam";
 if(head)head.hidden=view==="home";
 // Roleplay already has four stage tabs and next/back buttons: do not duplicate navigation.
 if(flip)flip.hidden=view==="home"||view==="case";
 const labels={
  technique:["تکنیک "+persianNumber(techIndex+1)+" از ۶",techniqueName(techIndex),"تعریف، سه مثال، خطای رایج و دو رول‌پلی مرتبط"],
  case:["رول‌پلی "+persianNumber(caseSequence.indexOf(caseIndex)+1)+" از ۱۲",caseLabel(caseIndex),"ارتباط مستقیم و غیرمستقیم با تکنیک‌ها + گفت‌وگوی چهارمرحله‌ای"]
 };
 const a=labels[view]||subtitles[view];
 const step=$("#s4-screen-step"),title=$("#s4-screen-title"),desc=$("#s4-screen-description"),emoji=$("#s4-screen-emoji");
 if(step)step.textContent=a[0];if(title)title.textContent=a[1];if(desc)desc.textContent=a[2];
 if(emoji)emoji.textContent=view==="technique"?techniqueEmojis[techIndex]:view==="case"?"🗣️":view==="practice"?"🎭":view==="exam"?"🏅":"📘";
 const overviewHeading=overview?.querySelector(".s4-heading"),techGrid=overview?.querySelector(".s4-techs"),detail=$("#s4-tech-detail"),science=overview?.querySelector(".s4-science");
 if(overviewHeading)overviewHeading.hidden=view==="technique";
 if(techGrid)techGrid.hidden=view==="technique";
 if(science)science.hidden=view!=="techniques";
 if(view==="techniques"&&detail){
  detail.hidden=true;
  detail.replaceChildren();
  $$(".s4-overview [data-s4-tech]").forEach(btn=>btn.setAttribute("aria-expanded","false"));
 }
 const labHeading=lab?.querySelector(".s4-heading"),caseList=lab?.querySelector(".s4-cases"),focus=lab?.querySelector(".s4-focus");
 if(labHeading)labHeading.hidden=view!=="practice";
 if(caseList)caseList.hidden=view!=="practice";
 if(focus)focus.hidden=view!=="case";
 if(view==="technique")decorateTechniqueDetail();
 if(view==="case"){showCasePager();decorateCaseRelations();}
 if(flip){
  const label=$("#s4-page-counter"),next=flip.querySelector("[data-s4-advance]");
  const names={techniques:"۱ / ۳ · تکنیک‌ها",technique:persianNumber(techIndex+1)+" / ۶ · تکنیک",practice:"۲ / ۳ · رول‌پلی",exam:"۳ / ۳ · آزمون",guide:"راهنمای مدرس"};
  if(label)label.textContent=names[view]||"مسیر یادگیری";
  if(next){
   next.textContent=view==="techniques"?"مطالعه تکنیک اول ←":view==="technique"?(techIndex===5?"مشاهده همه رول‌پلی‌ها ←":"تکنیک بعد ←"):view==="practice"?"ورود به آزمون پایانی ←":"بازگشت به خانه ←";
   next.disabled=false;
  }
 }
 $$(".s4-mobile-nav [data-s4-open]").forEach(btn=>btn.classList.toggle("active",btn.dataset.s4Open===view||(view==="technique"&&btn.dataset.s4Open==="techniques")||(view==="case"&&btn.dataset.s4Open==="practice")));
 if(options.scroll!==false){
  window.scrollTo?.({top:0,behavior:"instant"});
  if(view!=="home")requestAnimationFrame(()=>$("#s4-screen-title")?.focus({preventScroll:true}));
 }
}
function openTechnique(n){
 if(!Number.isInteger(n)||n<0||n>5)return;
 techIndex=n;
 const card=$('.s4-tech[data-s4-tech="'+n+'"]');
 if(card)card.click(); // Base owns the definition and original example.
}
function openCase(n){
 if(!Number.isInteger(n)||!Object.hasOwn(primaryByCase,n))return;
 caseIndex=n;
 const card=$('.s4-case[data-s4-case="'+n+'"]');
 if(card)card.click(); // Base owns the personas, dialogue and four-stage rules.
}
function back(){
 if(currentView==="case"){const b=$("#s4-focus [data-s4-close]");if(b)b.click();else renderView(caseReturn);return;}
 if(currentView==="technique"){renderView("techniques");return;}
 if(currentView==="practice"){renderView("techniques");return;}
 renderView("home");
}
function forward(){
 if(currentView==="techniques")return openTechnique(0);
 if(currentView==="technique")return techIndex===5?renderView("practice"):openTechnique(techIndex+1);
 if(currentView==="practice")return renderView("exam");
 renderView("home");
}
function start(){
 const wrap=$(".s4-root .wrap");
 if(!wrap)return;
 loadTheme();buildHome();decorateTechniques();decorateRoleplays();
 renderView("home",{scroll:false});
}
window.alborzSession4Page=function(){original();start();};
// The original case engine increments by original index. We instead follow the
// technique-first sequence without changing any core roleplay transcripts.
document.addEventListener("click",ev=>{
 if(!$(".s4-root"))return;
 const next=ev.target.closest?.("[data-s4-nextcase]");
 if(!next)return;
 ev.preventDefault();ev.stopImmediatePropagation();
 const offset=caseSequence.indexOf(caseIndex)+1;
 if(offset>=caseSequence.length)renderView("exam");
 else openCase(caseSequence[offset]);
},true);
document.addEventListener("click",ev=>{
 if(!$(".s4-root"))return;
 const b=ev.target.closest?.("button,a");
 if(!b)return;
 if(b.matches("[data-s4-open]")){
  ev.preventDefault();renderView(b.dataset.s4Open);return;
 }
 if(b.matches("[data-s4-back]")){back();return;}
 if(b.matches("[data-s4-advance]")){forward();return;}
 if(b.matches("[data-s4-tech]")){
  techIndex=Number(b.dataset.s4Tech);renderView("technique",{techIndex});return;
 }
 if(b.matches("[data-s4-linked-case]")){
  caseReturn="technique";openCase(Number(b.dataset.s4LinkedCase));return;
 }
 if(b.matches("[data-s4-tech-close]")){renderView("techniques");return;}
 if(b.matches("[data-s4-case]")){
  if(currentView==="practice")caseReturn="practice";
  caseIndex=Number(b.dataset.s4Case);renderView("case",{caseIndex});return;
 }
 if(b.matches("[data-s4-step]")||b.matches("[data-s4-next]")){showCasePager();decorateCaseRelations();return;}
 if(b.matches("[data-s4-stepback]")){
  const selected=$("#s4-focus .s4-tabs button.active");
  const n=Number(selected?.dataset.s4Step||0);
  if(n>0)$('#s4-focus [data-s4-step="'+(n-1)+'"]')?.click();
  return;
 }
 if(b.matches("[data-s4-close]")){renderView(caseReturn);return;}
});

document.addEventListener("change",ev=>{
 const input=ev.target;
 if(!input?.matches?.("#s4-focus [data-s4-observe]"))return;
 const panel=input.closest(".s4-behavior-check");
 const completed=panel?.querySelectorAll('input[data-s4-observe]:checked').length||0;
 const status=panel?.querySelector(".s4-observation-progress");
 if(status)status.textContent=persianNumber(completed)+" از ۳ رفتار مشاهده شد"+(completed===3?" · آماده جمع‌بندی با همکار":"");
});
})();
