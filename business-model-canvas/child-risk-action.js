/* Dedicated child-culture BMC: Risk Register + 90-day Action Plan. Independent data storage. */
(() => {
"use strict";
const R = [
  ["market","تقاضای واقعی والدین کمتر از انتظار باشد"],
  ["retention","خرید مجدد یا تمایل به پرداخت پایین باشد"],
  ["values","محتوا با حساسیت‌های فرهنگی و مذهبی خانواده‌های هدف تناسب نداشته باشد"],
  ["age","محصول با سن، رشد و سلامت روانی کودک سازگار نباشد"],
  ["accuracy","محتوای دینی یا توصیه تربیتی بدون بررسی تخصصی منتشر شود"],
  ["finance","هزینه تولید، چاپ یا جذب مشتری از بودجه فراتر برود"],
  ["quality","کیفیت تولید، موجودی یا تحویل محصول دچار مشکل شود"],
  ["channels","دسترسی به مدارس، والدین یا کانال‌های فروش دشوار باشد"],
  ["rights","حق نشر کتاب، تصویر، بازی یا مجوزهای لازم رعایت نشده باشد"],
  ["privacy","در خدمات دیجیتال، داده‌ها و تصاویر کودکان بدون رضایت مناسب استفاده شوند"],
  ["people","اجرای کسب‌وکار به افراد یا تخصص‌های محدود وابسته باشد"]
];
const A = [
  ["۳۰ روز نخست","با دست‌کم ۱۰ والد درباره نیازها و پرداخت گفت‌وگو کنیم"],
  ["۳۰ روز نخست","گروه سنی، مسئله اصلی و ارزش پیشنهادی را روشن کنیم"],
  ["۳۰ روز نخست","یک نمونه اولیه قصه، بازی یا بسته والد–کودک بسازیم"],
  ["۳۰ روز نخست","محتوای تربیتی و دینی را با متخصص مرتبط بازبینی کنیم"],
  ["روزهای ۳۱ تا ۶۰","نمونه محصول را با چند خانواده و کودک متناسب با سن آزمایش کنیم"],
  ["روزهای ۳۱ تا ۶۰","بر اساس بازخورد، طراحی و قیمت‌گذاری محصول را اصلاح کنیم"],
  ["روزهای ۳۱ تا ۶۰","حقوق نشر، الزامات قانونی و کیفیت محصول را بررسی کنیم"],
  ["روزهای ۳۱ تا ۶۰","یک کانال فروش کم‌هزینه را به‌صورت آزمایشی ارزیابی کنیم"],
  ["روزهای ۶۱ تا ۹۰","فروش آزمایشی محدود و دریافت بازخورد واقعی را شروع کنیم"],
  ["روزهای ۶۱ تا ۹۰","با حداقل سه مدرسه یا مرکز فرهنگی مذاکره کنیم"],
  ["روزهای ۶۱ تا ۹۰","هزینه هر محصول، حاشیه سود و نقدینگی را محاسبه کنیم"],
  ["روزهای ۶۱ تا ۹۰","ریسک‌ها و نتایج ۹۰ روزه را مرور و تصمیم مرحله بعد را ثبت کنیم"]
];
const KEY = "bmc-child-culture-risk-actions-v1";
const riskWidgets = [];
const actionWidgets = [];
const node = (tag,cls,txt) => {const e=document.createElement(tag);if(cls)e.className=cls;if(txt!==undefined)e.textContent=txt;return e;};
const addLabel = (parent,text,control) => {const l=node("label","ra-field");l.append(node("span","ra-field-title",text),control);parent.append(l);return control;};
const select = options => {const s=node("select");options.forEach(([value,label])=>{const o=node("option",null,label);o.value=value;s.append(o)});return s;};
const textbox = placeholder => {const e=node("textarea");e.placeholder=placeholder;e.rows=3;return e;};
const inputText = placeholder => {const e=node("input");e.type="text";e.placeholder=placeholder;return e;};
const read = e => e.value.trim();
function load(){try{return JSON.parse(localStorage.getItem(KEY))||{};}catch{return {};}}
const saved = load();
const mainBlocks=document.getElementById("blocks");
if(!mainBlocks)return;
const riskSection=node("section","card ra-section");
riskSection.id="risk-assessment";
riskSection.append(node("h2",null,"۳. شناسایی و مدیریت ریسک‌ها"));
riskSection.append(node("p","muted","ریسک‌های مرتبط با ایده خود را تیک بزنید. با انتخاب هر ریسک، کادر توضیح و برنامه پاسخ به آن باز می‌شود. می‌توانید چند مورد انتخاب کنید."));
const riskCount=node("p","ra-stats");riskCount.setAttribute("role","status");riskSection.append(riskCount);
const riskList=node("div","ra-list");
R.forEach(([id,title],idx)=>{
  const item=node("div","ra-item");
  const l=node("label","ra-check");
  const c=node("input");c.type="checkbox";c.setAttribute("aria-controls","risk-details-"+id);
  l.append(c,node("span",null,(idx+1)+". "+title));item.append(l);
  const details=node("div","ra-details");details.id="risk-details-"+id;
  const selectors=node("div","ra-pair");
  const likelihood=select([["","انتخاب کنید"],["کم","کم"],["متوسط","متوسط"],["زیاد","زیاد"]]);
  const impact=select([["","انتخاب کنید"],["کم","کم"],["متوسط","متوسط"],["زیاد","زیاد"]]);
  addLabel(selectors,"احتمال وقوع",likelihood);addLabel(selectors,"شدت اثر",impact);details.append(selectors);
  const desc=textbox("چرا این ریسک برای ایده شما مهم است؟ نمونه یا شواهد موجود را بنویسید.");
  const mitigation=textbox("برای پیشگیری، کاهش اثر یا جبران این ریسک چه اقدامی انجام می‌دهید؟");
  addLabel(details,"شرح اختصاصی ریسک",desc);addLabel(details,"راهکار کاهش ریسک / پاسخ پیشنهادی",mitigation);
  const owner=inputText("نام یا نقش فرد مسئول");
  addLabel(details,"مسئول پیگیری (اختیاری)",owner);item.append(details);riskList.append(item);
  const prior=saved.risks?.[id]||{};c.checked=!!prior.selected;likelihood.value=prior.likelihood||"";impact.value=prior.impact||"";desc.value=prior.description||"";mitigation.value=prior.mitigation||"";owner.value=prior.owner||"";
  details.hidden=!c.checked;
  c.addEventListener("change",()=>{details.hidden=!c.checked;saveAll();});
  riskWidgets.push({id,title,c,likelihood,impact,desc,mitigation,owner});
});
riskSection.append(riskList);
const extraRisk=node("div","ra-custom");
extraRisk.append(node("h3",null,"ریسک دیگری که در فهرست نیست"));
const otherRisk=textbox("ریسک اختصاصی خود را با ذکر دلیل و راهکار احتمالی توضیح دهید.");
otherRisk.value=saved.otherRisk||"";
extraRisk.append(otherRisk);riskSection.append(extraRisk);
const actionSection=node("section","card ra-section");actionSection.id="action-plan";
actionSection.append(node("h2",null,"۴. برنامه اقدام ۹۰ روزه"));
actionSection.append(node("p","muted","اقدام‌های مناسب کسب‌وکار خود را انتخاب کنید و برای هر مورد مسئول، موعد و وضعیت اجرا را مشخص کنید؛ توضیح آزاد نیز اختیاری است."));
const actionCount=node("p","ra-stats");actionCount.setAttribute("role","status");actionSection.append(actionCount);
const actionList=node("div","ra-list");let lastPhase="";
A.forEach(([phase,title],i)=>{
  if(phase!==lastPhase){actionList.append(node("h3","ra-phase",phase));lastPhase=phase;}
  const item=node("div","ra-item"),l=node("label","ra-check");
  const c=node("input");c.type="checkbox";c.setAttribute("aria-controls","action-details-"+i);
  l.append(c,node("span",null,title));item.append(l);
  const details=node("div","ra-details");details.id="action-details-"+i;
  const fields=node("div","ra-pair");
  const owner=inputText("نام فرد یا نقش مسئول");
  const due=node("input");due.type="date";due.setAttribute("aria-label","تاریخ هدف");
  addLabel(fields,"مسئول اجرا",owner);addLabel(fields,"موعد انجام",due);details.append(fields);
  const status=select([["planned","برنامه‌ریزی‌شده"],["doing","در حال اجرا"],["done","انجام‌شده"]]);
  addLabel(details,"وضعیت",status);
  const note=textbox("جزئیات اقدام، منابع موردنیاز و خروجی قابل‌اندازه‌گیری را بنویسید.");
  addLabel(details,"شرح اقدام و معیار موفقیت",note);item.append(details);actionList.append(item);
  const prev=saved.actions?.[i]||{};c.checked=!!prev.selected;owner.value=prev.owner||"";due.value=prev.due||"";status.value=prev.status||"planned";note.value=prev.note||"";
  details.hidden=!c.checked;
  c.addEventListener("change",()=>{details.hidden=!c.checked;saveAll();});
  actionWidgets.push({phase,title,c,owner,due,status,note});
});
actionSection.append(actionList);
const customAction=node("div","ra-custom");customAction.append(node("h3",null,"اقدام اختصاصی من"));
const actionTitle=inputText("چه اقدام دیگری باید انجام دهید؟");
const actionOwner=inputText("مسئول این اقدام");
const actionDue=node("input");actionDue.type="date";
const actionNote=textbox("شرح اقدام، منابع لازم و نتیجه مورد انتظار");
addLabel(customAction,"عنوان اقدام",actionTitle);
const pair=node("div","ra-pair");addLabel(pair,"مسئول",actionOwner);addLabel(pair,"زمان هدف",actionDue);customAction.append(pair);
addLabel(customAction,"توضیحات",actionNote);actionSection.append(customAction);
actionTitle.value=saved.customAction?.title||"";actionOwner.value=saved.customAction?.owner||"";actionDue.value=saved.customAction?.due||"";actionNote.value=saved.customAction?.note||"";
mainBlocks.insertAdjacentElement("afterend",riskSection);
riskSection.insertAdjacentElement("afterend",actionSection);
const headings=[...document.querySelectorAll("main h2")];
const outHeading=headings.find(x=>x.textContent.includes("خروجی بوم و پاسخ‌ها"));
if(outHeading)outHeading.textContent="۵. خروجی بوم، ریسک‌ها و برنامه اقدام";
function gather(){
  return {
    risks:Object.fromEntries(riskWidgets.map(w=>[w.id,{selected:w.c.checked,likelihood:w.likelihood.value,impact:w.impact.value,description:read(w.desc),mitigation:read(w.mitigation),owner:read(w.owner)}])),
    otherRisk:read(otherRisk),
    actions:actionWidgets.map(w=>({selected:w.c.checked,owner:read(w.owner),due:w.due.value,status:w.status.value,note:read(w.note)})),
    customAction:{title:read(actionTitle),owner:read(actionOwner),due:actionDue.value,note:read(actionNote)}
  };
}
function saveAll(){
  const d=gather();
  try{localStorage.setItem(KEY,JSON.stringify(d));}catch(e){riskCount.textContent="ذخیره خودکار در این مرورگر ممکن نیست؛ خروجی را دانلود کنید.";return;}
  const selectedRisks=riskWidgets.filter(w=>w.c.checked);
  riskCount.textContent="ریسک‌های انتخاب‌شده: "+selectedRisks.length+" از "+R.length;
  const activeActions=actionWidgets.filter(w=>w.c.checked);
  actionCount.textContent="اقدام‌های انتخاب‌شده: "+activeActions.length+" | انجام‌شده: "+activeActions.filter(w=>w.status.value==="done").length;
}
riskSection.addEventListener("input",saveAll);riskSection.addEventListener("change",saveAll);
actionSection.addEventListener("input",saveAll);actionSection.addEventListener("change",saveAll);
saveAll();
const originalReport=window.report;
if(typeof originalReport==="function"){
  window.report=function(){
    const d=gather();
    const riskText=riskWidgets.filter(w=>w.c.checked).map(w=>{
      const x=d.risks[w.id];
      return "• "+w.title+"\nاحتمال: "+(x.likelihood||"نامشخص")+" | اثر: "+(x.impact||"نامشخص")+"\nشرح: "+(x.description||"ثبت نشده")+"\nراهکار: "+(x.mitigation||"ثبت نشده")+"\nمسئول: "+(x.owner||"تعیین نشده");
    });
    if(d.otherRisk)riskText.push("• سایر ریسک‌ها: "+d.otherRisk);
    const statusLabels={planned:"برنامه‌ریزی‌شده",doing:"در حال اجرا",done:"انجام‌شده"};
    const actionText=actionWidgets.filter(w=>w.c.checked).map(w=>{
      const x=d.actions[actionWidgets.indexOf(w)];
      return "• "+w.title+" ("+w.phase+")\nمسئول: "+(x.owner||"تعیین نشده")+" | موعد: "+(x.due||"تعیین نشده")+" | وضعیت: "+statusLabels[x.status]+"\nشرح و خروجی: "+(x.note||"ثبت نشده");
    });
    if(d.customAction.title)actionText.push("• "+d.customAction.title+"\nمسئول: "+d.customAction.owner+" | موعد: "+d.customAction.due+"\nتوضیحات: "+d.customAction.note);
    return originalReport()+"\n\n۳. ارزیابی ریسک‌ها\n"+(riskText.join("\n\n")||"ریسکی انتخاب نشده است")+"\n\n۴. برنامه اقدام ۹۰ روزه\n"+(actionText.join("\n\n")||"اقدامی انتخاب نشده است");
  };
}
})();