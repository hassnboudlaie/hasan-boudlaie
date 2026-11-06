/* Standalone industry-specific Business Model Canvas intake; no backend and no other-app mutation. */
(()=>{"use strict";
const cfg=window.SpecializedBMCConfig;
if(!cfg || !Array.isArray(cfg.blocks) || cfg.blocks.length!==9)return;
const $=s=>document.querySelector(s), node=(tag,cl,txt)=>{let e=document.createElement(tag);if(cl)e.className=cl;if(txt!==undefined)e.textContent=txt;return e;};
const text=(e)=>e.value.trim(), num=n=>Number(n).toLocaleString("fa-IR");
const KEY="hb-specialized-bmc-v1-"+cfg.id;
const blank=()=>({schema:1,id:cfg.id,profile:{name:"",business:"",idea:"",stage:"",objective:""},intro:{},answers:{},notes:{},evidence:{},risks:{},otherRisk:"",actions:{},customAction:{title:"",owner:"",due:"",note:""},updatedAt:""});
let d=blank();
try{const old=JSON.parse(localStorage.getItem(KEY)||"null");if(old&&old.id===cfg.id&&old.schema===1){d={...d,...old,profile:{...d.profile,...old.profile}};}}catch(e){}
if(!d.evidence || typeof d.evidence!=="object")d.evidence={};
const counters={questions:0,risks:0,actions:0};
const countQuestions=()=>cfg.blocks.reduce((a,b)=>a+b.questions.length,0);
const totalQuestions=countQuestions();
const inp=(type,name,value="")=>{const e=node("input");e.type=type;e.name=name;e.value=value;return e;};
const box=(placeholder,value="")=>{const e=node("textarea");e.rows=3;e.placeholder=placeholder;e.value=value;return e;};
const entry=(container,label,element)=>{const field=node("label","sb-field");field.append(node("span","sb-fieldname",label),element);container.append(field);return element;};
const choose=(pairs,value="")=>{const e=node("select");for(const [id,title] of pairs){const o=node("option",null,title);o.value=id;e.append(o);}e.value=value;return e;};
function safeSet(){d.updatedAt=new Date().toISOString();try{localStorage.setItem(KEY,JSON.stringify(d));$("#save-indicator").textContent="ذخیره‌شده در این دستگاه";}catch(e){$("#save-indicator").textContent="ذخیره ممکن نشد؛ خروجی دریافت کنید";}updateProgress();}
function modelIntro(){
 const p=$("#profile-fields");
 for(const [key,label,placeholder,kind] of [
 ["name","نام تکمیل‌کننده","نام و نام خانوادگی", "input"],
 ["business","نام کسب‌وکار / برند (در صورت وجود)","نام برند یا نام کاری","input"],
 ["idea","ایده کلی کسب‌وکار را با زبان خودت تعریف کن","چه ارزشی خلق می‌کنید، چه محصول یا خدمتی ارائه می‌دهید و چرا این ایده مهم است؟","textarea"],
 ["stage","وضعیت فعلی کسب‌وکار","ایده، پایلوت، فعال، در حال توسعه...","input"],
 ["objective","مهم‌ترین هدف ۱۲ ماه آینده","یک دستاورد مشخص و قابل سنجش","textarea"]]){
    const el=kind==="textarea"?box(placeholder,d.profile[key]||""):inp("text",key,d.profile[key]||"");
    el.name=key;if(kind==="input")el.placeholder=placeholder;
    entry(p,label,el);
    el.addEventListener("input",()=>{d.profile[key]=el.value;safeSet();});
 }
 const area=$("#intro-options");
 cfg.intro.forEach((x,i)=>{
   const wrap=node("section","sb-introitem");wrap.append(node("h3",null,x.label));
   const options=node("div","sb-checkgrid");
   const old=d.intro[i]||{choices:[],note:""};
   const checks=[];
   for(const option of x.options){const label=node("label","sb-check"),c=inp("checkbox","intro-"+i);c.value=option;c.checked=(old.choices||[]).includes(option);label.append(c,node("span",null,option));options.append(label);checks.push(c);}
   wrap.append(options);
   const details=node("details","sb-note");
   details.append(node("summary",null,"توضیح تکمیلی"));
   const ta=box("جزئیات موردنظر خود را بنویسید…",old.note||"");
   details.append(ta);if(old.note)details.open=true;
   wrap.append(details);
   const update=()=>{d.intro[i]={choices:checks.filter(c=>c.checked).map(c=>c.value),note:ta.value};safeSet();};
   options.addEventListener("change",update);ta.addEventListener("input",update);
   area.append(wrap);
 });
}
const questionEls=[];
function renderBMC(){
 const nav=$("#block-nav"),container=$("#block-sections");
 cfg.blocks.forEach((block,i)=>{
   const tile=node("button","sb-tile");tile.type="button";tile.dataset.to=String(i);
   tile.append(node("span","sb-tiletitle",num(i+1)+". "+block.title),node("small","sb-tilecount","۰ از "+num(block.questions.length)+" سؤال"));
   nav.append(tile);
   const sec=node("section","sb-block");sec.id="special-block-"+i;sec.hidden=i!==0;
   sec.append(node("h2",null,num(i+1)+". "+block.title),node("p","sb-hint",block.description||""));
   const essential=node("p","sb-essential-note","پیشنهاد: ابتدا ۲ سؤال اول این خانه را پاسخ دهید؛ سایر موارد برای Deep Dive و اعتبارسنجی بیشترند.");
   sec.append(essential);
   block.questions.forEach((q,j)=>{
     const k=block.id+"-"+j,previous=d.answers[k]||{choices:[],note:""};
     const question=node("details","sb-question");question.dataset.key=k;
     const summary=node("summary","sb-questiontitle");
     const qtitle=node("span","sb-questionlabel",num(j+1)+". "+q.prompt);
     if(j<2)qtitle.append(node("em","sb-core-tag","پرسش اصلی"));
     if(q.level==="advanced")qtitle.append(node("em","sb-research-tag","پرسش به‌روزشده ۲۰۲۶"));
     summary.append(qtitle,node("small","sb-questionstatus","برای مشاهده باز کنید"));
     question.append(summary);
     if(j===0)question.open=true;
     const options=node("div","sb-checkgrid");
     const checks=[];
     for(const o of [...q.options,"سایر / گزینه اختصاصی","هنوز مشخص نیست / نیازمند بررسی"]){
       const l=node("label","sb-check"),c=inp("checkbox","q-"+k);
       c.value=o;c.checked=(previous.choices||[]).includes(o);l.append(c,node("span",null,o));options.append(l);checks.push(c);
     }
     question.append(options);
     const further=node("details","sb-note");
     further.append(node("summary",null,"پاسخ باز، شواهد و توضیحات"));
     if(q.open)further.append(node("p","sb-prompt",q.open));
     const note=box("توضیح اختصاصی، مثال یا اطلاعات تکمیلی…",previous.note||"");further.append(note);
     if(previous.note)further.open=true;
     question.append(further);
     const saveAnswer=()=>{d.answers[k]={choices:checks.filter(c=>c.checked).map(c=>c.value),note:note.value};safeSet();};
     options.addEventListener("change",event=>{
       const unknown=checks[checks.length-1],custom=checks[checks.length-2];
       if(event.target===unknown&&unknown.checked)checks.forEach(c=>{if(c!==unknown)c.checked=false;});
       else if(event.target.checked&&event.target!==unknown)unknown.checked=false;
       if(custom.checked)further.open=true;
       saveAnswer();
     });
     note.addEventListener("input",saveAnswer);
     sec.append(question);questionEls.push({element:question,k,summary});
   });
   const bNote=box("جمع‌بندی این خانه، فرضیات اصلی و شواهد موجود…",d.notes[block.id]||"");
   entry(sec,"جمع‌بندی آزاد این خانه",bNote);
   bNote.addEventListener("input",()=>{d.notes[block.id]=bNote.value;safeSet();});
   const proof=d.evidence[block.id]||{},evid=node("div","sb-evidencebox");
   evid.append(node("h3",null,"اعتبار شواهد این خانه"));
   const sel=choose([["not_yet","هنوز بررسی نشده"],["assumption","فرضیه / برآورد شخصی"],["interview","مصاحبه با مشتری یا متخصص"],["observation","مشاهده رفتار یا تست واقعی"],["transaction","فروش، پرداخت یا قرارداد واقعی"]],proof.status||"not_yet");
   entry(evid,"Evidence Level — وضعیت داده‌های پشت پاسخ‌ها",sel);
   const eNote=entry(evid,"منبع شواهد و تاریخ آن (اختیاری)",box("برای مثال: مصاحبه با ۱۰ مشتری در آبان ۱۴۰۵، نتیجه فروش آزمایشی یا شماره گزارش داخلی",proof.note||""));
   const updateEvidence=()=>{d.evidence[block.id]={status:sel.value,note:eNote.value};safeSet();};
   sel.addEventListener("change",updateEvidence);eNote.addEventListener("input",updateEvidence);
   sec.append(evid);
   const pager=node("nav","sb-pager");
   if(i){const prev=node("button","sb-secondary","خانه قبلی");prev.type="button";prev.onclick=()=>go(i-1);pager.append(prev);}
   const next=node("button","sb-primary",i===8?"ادامه: ارزیابی ریسک‌ها":"ادامه: خانه "+num(i+2));next.type="button";
   next.onclick=()=>{if(i===8)$("#risk-section").scrollIntoView({behavior:"smooth",block:"start"});else go(i+1);};pager.append(next);sec.append(pager);
   container.append(sec);
 });
 for(const tile of nav.children)tile.addEventListener("click",()=>go(Number(tile.dataset.to)));
}
const riskUI=[];
function renderRisks(){
 const list=$("#risk-list");
 cfg.risks.forEach((risk,i)=>{
   const r=d.risks[risk.id]||{},item=node("div","sb-risk"),label=node("label","sb-riskhead");
   const c=inp("checkbox","risk-"+i);c.checked=!!r.selected;label.append(c,node("span",null,num(i+1)+". "+risk.title));item.append(label);
   const detail=node("div","sb-riskdetail");detail.hidden=!c.checked;
   const row=node("div","sb-cols");
   const likelihood=choose([["","انتخاب کنید"],["low","کم"],["medium","متوسط"],["high","زیاد"]],r.likelihood||"");
   const impact=choose([["","انتخاب کنید"],["low","کم"],["medium","متوسط"],["high","زیاد"]],r.impact||"");
   entry(row,"احتمال وقوع",likelihood);entry(row,"شدت اثر",impact);detail.append(row);
   const description=entry(detail,"توضیح ریسک و شواهد",box("این ریسک چگونه ممکن است به کسب‌وکار آسیب بزند؟",r.description||""));
   const response=entry(detail,"راهکار مدیریت ریسک",box("راه پیشگیری، کاهش اثر یا برنامه جایگزین",r.response||""));
   const owner=entry(detail,"مسئول پیگیری",inp("text","owner-"+i,r.owner||""));owner.placeholder="نام یا نقش";
   item.append(detail);list.append(item);
   const saveRisk=()=>{d.risks[risk.id]={selected:c.checked,likelihood:likelihood.value,impact:impact.value,description:description.value,response:response.value,owner:owner.value};safeSet();};
   c.onchange=()=>{detail.hidden=!c.checked;saveRisk();};
   detail.addEventListener("input",saveRisk);detail.addEventListener("change",saveRisk);
   riskUI.push({risk,check:c});
 });
 const other=entry($("#risk-extra"),"ریسک اختصاصی دیگری که در فهرست نیست",box("ریسک، دلیل و برنامه مدیریت آن را شرح دهید",d.otherRisk||""));
 other.addEventListener("input",()=>{d.otherRisk=other.value;safeSet();});
}
const actionUI=[];
function renderActions(){
 const list=$("#action-list");let phase="";
 cfg.actions.forEach((a,i)=>{
  if(a.phase!==phase){phase=a.phase;list.append(node("h3","sb-phase",phase));}
  const prev=d.actions[i]||{},item=node("div","sb-action"),label=node("label","sb-riskhead");
  const c=inp("checkbox","action-"+i);c.checked=!!prev.selected;
  label.append(c,node("span",null,a.title));item.append(label);
  const detail=node("div","sb-riskdetail");detail.hidden=!c.checked;
  const row=node("div","sb-cols");
  const owner=entry(row,"مسئول اجرا",inp("text","owner-action-"+i,prev.owner||""));owner.placeholder="نام یا نقش";
  const due=entry(row,"تاریخ هدف",inp("date","due-action-"+i,prev.due||""));
  detail.append(row);
  const status=entry(detail,"وضعیت",choose([["planned","برنامه‌ریزی‌شده"],["doing","در حال اجرا"],["done","انجام‌شده"]],prev.status||"planned"));
  const note=entry(detail,"جزئیات اقدام و معیار موفقیت",box("خروجی قابل تحویل، منابع و معیار سنجش",prev.note||""));
  item.append(detail);list.append(item);
  const saveAction=()=>{d.actions[i]={selected:c.checked,owner:owner.value,due:due.value,status:status.value,note:note.value};safeSet();};
  c.onchange=()=>{detail.hidden=!c.checked;saveAction();};
  detail.addEventListener("input",saveAction);detail.addEventListener("change",saveAction);
  actionUI.push({a,c,status});
 });
 const custom=$("#custom-action"),c=d.customAction||{};
 for(const [id,label,kind,placeholder] of [["title","عنوان اقدام من","text","یک اقدام مهم دیگر"],["owner","مسئول","text","نام یا نقش"],["due","موعد","date",""],["note","توضیح و معیار موفقیت","textarea","خروجی این اقدام چیست؟"]]){
 const el=kind==="textarea"?box(placeholder,c[id]||""):inp(kind,"custom-"+id,c[id]||"");
 if(placeholder&&kind==="text")el.placeholder=placeholder;
 entry(custom,label,el);
 el.addEventListener("input",()=>{d.customAction[id]=el.value;safeSet();});
 el.addEventListener("change",()=>{d.customAction[id]=el.value;safeSet();});
 }
}
let current=0;
function go(i,scroll=true){
 current=Math.max(0,Math.min(8,i));
 $("#block-sections").querySelectorAll(".sb-block").forEach((section,k)=>{section.hidden=k!==current;});
 $("#block-nav").querySelectorAll(".sb-tile").forEach((tile,k)=>{tile.classList.toggle("sb-active",k===current);tile.setAttribute("aria-current",k===current?"step":"false");});
 updateProgress();
 if(scroll)$("#block-nav").scrollIntoView({block:"start",behavior:"smooth"});
}
function updateProgress(){
 let answered=0;
 for(let i=0;i<cfg.blocks.length;i++){
   const b=cfg.blocks[i];let completed=0;
   for(let j=0;j<b.questions.length;j++){
     const a=d.answers[b.id+"-"+j]||{};
     if((a.choices&&a.choices.length)||(a.note&&a.note.trim())){completed++;answered++;}
   }
   const tile=$("#block-nav").children[i];
   if(tile)tile.querySelector(".sb-tilecount").textContent=num(completed)+" از "+num(b.questions.length)+" پرسش";
 }
 counters.questions=answered;
 $("#overall-progress").style.width=(answered/Math.max(1,totalQuestions)*100)+"%";
 $("#overall-count").textContent=num(answered)+" از "+num(totalQuestions)+" سؤال پاسخ داده شده";
 for(const item of questionEls){const a=d.answers[item.k]||{},status=item.summary.querySelector("small");status.textContent=(a.choices||[]).some(x=>x.includes("نیازمند بررسی"))?"نیازمند بررسی":((a.choices&&a.choices.length)||(a.note&&a.note.trim()))?"پاسخ ثبت شد":"برای تکمیل باز کنید";}
 counters.risks=riskUI.filter(x=>x.check.checked).length;
 $("#risk-count").textContent="ریسک‌های انتخاب‌شده: "+num(counters.risks);
 counters.actions=actionUI.filter(x=>x.c.checked).length;
 $("#action-count").textContent="اقدام‌های انتخاب‌شده: "+num(counters.actions)+" | انجام‌شده: "+num(actionUI.filter(x=>x.c.checked&&x.status.value==="done").length);
}
function report(){
 const out=[];
 out.push(cfg.title,"تکمیل‌کننده: "+(d.profile.name||"ثبت نشده"),"برند: "+(d.profile.business||"ثبت نشده"),"ایده کلی: "+(d.profile.idea||"ثبت نشده"),"مرحله فعلی: "+(d.profile.stage||"ثبت نشده"),"هدف ۱۲ ماهه: "+(d.profile.objective||"ثبت نشده"),"");
 cfg.intro.forEach((x,i)=>{const a=d.intro[i]||{};out.push(x.label+": "+((a.choices||[]).join("، ")||"ثبت نشده")+(a.note?" | "+a.note:""));});
 cfg.blocks.forEach((b,i)=>{
   out.push("","━━━━━━━━━━━━━━━━━━",num(i+1)+". "+b.title);
   b.questions.forEach((q,j)=>{const a=d.answers[b.id+"-"+j]||{};out.push(num(j+1)+") "+q.prompt,"گزینه‌ها: "+((a.choices||[]).join("، ")||"ثبت نشده"),"توضیح: "+(a.note||"ثبت نشده"));});
   out.push("جمع‌بندی: "+(d.notes[b.id]||"ثبت نشده"));
   const evidence=d.evidence[b.id]||{};
   out.push("سطح شواهد: "+({not_yet:"بررسی نشده",assumption:"فرضیه",interview:"مصاحبه",observation:"مشاهده / تست",transaction:"فروش / پرداخت واقعی"}[evidence.status]||"نامشخص"));
   if(evidence.note)out.push("منبع شواهد: "+evidence.note);
 });
 out.push("","━━━━━━━━━━━━━━━━━━","ارزیابی ریسک‌ها");
 let selected=0;
 cfg.risks.forEach(r=>{const v=d.risks[r.id]||{};if(!v.selected)return;selected++;out.push("ریسک: "+r.title,"احتمال: "+(v.likelihood||"نامشخص")+" | اثر: "+(v.impact||"نامشخص"),"شرح: "+(v.description||"ثبت نشده"),"راهکار: "+(v.response||"ثبت نشده"),"مسئول: "+(v.owner||"تعیین نشده"));});
 if(!selected)out.push("ریسکی انتخاب نشده");
 if(d.otherRisk)out.push("ریسک دیگر: "+d.otherRisk);
 out.push("","━━━━━━━━━━━━━━━━━━","برنامه اقدام ۹۰ روزه");
 let selectedActions=0;
 cfg.actions.forEach((a,i)=>{const v=d.actions[i]||{};if(!v.selected)return;selectedActions++;out.push("• "+a.title+" | "+a.phase,"مسئول: "+(v.owner||"نامشخص")+" | موعد: "+(v.due||"نامشخص")+" | وضعیت: "+(v.status||"planned"),"توضیح: "+(v.note||"ثبت نشده"));});
 if(!selectedActions)out.push("اقدامی انتخاب نشده");
 if(d.customAction.title)out.push("اقدام اضافه: "+d.customAction.title,"مسئول: "+d.customAction.owner+" | موعد: "+d.customAction.due+" | توضیح: "+d.customAction.note);
 out.push("","زمان آخرین ذخیره: "+d.updatedAt,"نسخه فرم: "+cfg.id);
 return out.join("\n");
}
const download=(content,type,filename)=>{const blob=new Blob([content],{type}),url=URL.createObjectURL(blob),a=node("a");a.href=url;a.download=filename;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),5000);};
const name=cfg.id+"-business-model";
function actions(){
 $("#download-text").onclick=()=>download("\ufeff"+report(),"text/plain;charset=utf-8",name+".txt");
 $("#download-json").onclick=()=>download(JSON.stringify({schema:1,id:cfg.id,data:d},null,2),"application/json;charset=utf-8",name+".json");
 $("#copy-text").onclick=async()=>{try{await navigator.clipboard.writeText(report());$("#result-status").textContent="کل پاسخ‌ها کپی شدند؛ در واتساپ Paste کنید.";}catch(e){$("#result-status").textContent="کپی ممکن نشد؛ فایل خروجی دریافت کنید.";}};
 $("#share-file").onclick=async()=>{
   const file=new File(["\ufeff"+report()],name+".txt",{type:"text/plain;charset=utf-8"});
   if(navigator.canShare?.({files:[file]})&&navigator.share){try{await navigator.share({files:[file],title:cfg.title,text:"پاسخ‌های بوم کسب‌وکار"});$("#result-status").textContent="گزینه اشتراک‌گذاری اجرا شد.";return;}catch(e){if(e.name==="AbortError")return;}}
   download("\ufeff"+report(),"text/plain;charset=utf-8",name+".txt");
   $("#result-status").textContent="فایل پاسخ‌ها دانلود شد؛ آن را در واتساپ ارسال کنید.";
 };
}
modelIntro();renderBMC();renderRisks();renderActions();actions();updateProgress();go(0,false);
})();