/* Allameh MBA guided learning. Presentation only: original Robbins-derived
   course content and instructor-authored enrichment stay in their own modules.
   Writes remain browser-local; this module has no network/API calls. */
(()=>{
"use strict";
const escapeHtml=value=>String(value??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const cleanArray=a=>Array.isArray(a)?a:[];
const part=(title,body,kind="")=>body?'<section class="gr-part '+kind+'"><h4>'+escapeHtml(title)+'</h4><p>'+escapeHtml(body)+'</p></section>':"";
const list=(arr,ordered=false)=>{
 const tag=ordered?"ol":"ul";
 return '<'+tag+' class="gr-list">'+cleanArray(arr).map(x=>'<li>'+escapeHtml(x)+'</li>').join("")+'</'+tag+'>';
};
const note=(key,prompt,work,small="")=>'<div class="gr-note"><label for="gr-'+escapeHtml(key)+'">'+escapeHtml(prompt)+'</label><textarea id="gr-'+escapeHtml(key)+'" data-guided-key="'+escapeHtml(key)+'" maxlength="3500" rows="4" placeholder="پاسخ خود را بنویسید...">'+escapeHtml(work?.guidedAnswers?.[key]||"")+'</textarea>'+(small?'<small>'+escapeHtml(small)+'</small>':"")+'</div>';
const originalDraft=(label,value)=>value?'<details class="gr-prior"><summary>'+escapeHtml(label)+'</summary><p>'+escapeHtml(value)+'</p></details>':"";
const stepsOf=(x,mode,work)=>{
 if(!x)return [];
 if(mode==="concepts")return cleanArray(x.concepts).map((c,i)=>({
  kicker:"مفهوم "+(i+1),title:c.title,sub:c.en||"",
  body:part("تعریف",c.definition,"gr-definition")+part("توضیح علمی",c.explanation)+part("مثال مدیریتی",c.example,"gr-example")+part("نکته کلیدی",c.takeaway,"gr-takeaway")
 }));
 if(mode==="examples")return cleanArray(x.examples).map((e,i)=>({
  kicker:"مثال "+(i+1),title:e.title,sub:e.tag||"",
  body:part("موقعیت",e.situation)+part("واقعیت مشاهده‌شده",e.observation,"gr-definition")+part("تحلیل با مفهوم درس",e.analysis)+part("اقدام پیشنهادی",e.action,"gr-example")+part("پرسش برای بحث",e.question,"gr-takeaway")
 }));
 if(mode==="case"){
  const c=x.caseStudy;if(!c)return [];
  return [
   {kicker:"کیس مستند · ۱",title:"اطلاعات رویداد",sub:c.title,body:'<h4 class="gr-section">واقعیت‌های مستند</h4>'+list(c.facts)+part("رویکرد علمی",c.teachingNote)+
    (c.sourceUrl?'<a class="gr-source" href="'+escapeHtml(c.sourceUrl)+'" target="_blank" rel="noopener noreferrer">'+escapeHtml(c.sourceTitle||"منبع رسمی")+' ↗</a>':"")},
   {kicker:"کیس مستند · ۲",title:"موقعیت تصمیم‌گیری",sub:c.title,body:part("تصمیم مدیریتی",c.decision,"gr-definition")+originalDraft("پاسخ قبلی من",work?.case||"")},
   ...Array.from({length:Math.ceil(cleanArray(c.questions).length/2)},(_,page)=>({
    kicker:"تحلیل کیس",title:"پرسش‌های تحلیلی",sub:"پاسخ شخصی · بدون نمره رسمی",
    body:cleanArray(c.questions).slice(page*2,page*2+2).map((q,j)=>note("case-q-"+(page*2+j),"پرسش "+(page*2+j+1)+" · "+q,work)).join("")
   })),
   {kicker:"جمع‌بندی",title:"از تحلیل تا اقدام",sub:"Decision & Evidence",
    body:part("راهنمای تحلیل",c.teachingNote)+note("case-decision","تصمیم نهایی و شواهد پشتیبان شما",work)+
    (c.sourceUrl?'<a class="gr-source" href="'+escapeHtml(c.sourceUrl)+'" target="_blank" rel="noopener noreferrer">مشاهده منبع ↗</a>':"")}
  ];
 }
 if(mode==="group"){
  const g=x.groupWork;if(!g)return [];
  return [
   {kicker:"فعالیت گروهی",title:g.title,sub:g.duration||"",body:part("نقش‌ها",g.roles)+part("خروجی",g.deliverable,"gr-definition")},
   ...cleanArray(g.steps).map((step,i)=>({kicker:"گام "+(i+1),title:"انجام فعالیت",sub:"تمرین گروهی",body:part("مأموریت",step)+note("group-"+i,"خروجی یا نکته گروه در این گام",work,"یادداشت روی همین گوشی ذخیره می‌شود.")})),
   {kicker:"بازنگری",title:"ارائه و بازخورد",sub:"Group Debrief",body:part("خروجی مورد انتظار",g.deliverable)+part("معیار ارزیابی",g.rubric)+note("group-review","جمع‌بندی کوتاه گروه",work)}
  ];
 }
 if(mode==="roleplay"){
  const rp=x.rolePlay;if(!rp)return [];
  const dialogues=cleanArray(rp.dialogue);
  return [
   {kicker:"نقش‌آفرینی",title:rp.title,sub:rp.duration||"",body:part("نقش‌ها",rp.roles)+part("موقعیت",rp.context,"gr-definition")+part("دستور اجرا",rp.task)},
   ...Array.from({length:Math.ceil(dialogues.length/2)},(_,i)=>({
    kicker:"اجرای گفت‌وگو",title:"گفت‌وگوی نمونه",sub:"نوبت‌های "+(i*2+1)+" و "+Math.min(dialogues.length,i*2+2),
    body:'<div class="gr-dialogue">'+dialogues.slice(i*2,i*2+2).map(([person,words])=>'<div class="gr-turn"><strong>'+escapeHtml(person)+'</strong><p>'+escapeHtml(words)+'</p></div>').join("")+'</div>'
   })),
   {kicker:"Debrief",title:"تحلیل و بازخورد",sub:"Role-Play",body:part("پرسش راهنما",rp.debrief)+note("role-review","چه تغییری در شیوه گفت‌وگو پیشنهاد می‌کنید؟",work)}
  ];
 }
 if(mode==="reflection"){
  const a=x.assignment;if(!a)return [];
  const prompts=x.id===1?[
   "مشاهده عینی: مسئله سازمانی را بدون تفسیر توصیف کنید.",
   "برای مسئله، فرضیه‌های فردی، گروهی و سازمانی بنویسید.",
   "برای بررسی هر فرضیه به چه شواهد و داده‌هایی نیاز دارید؟",
   "یک اقدام مدیریتی و شاخص پیگیری پیشنهاد کنید."
  ]:[
   "رفتار مشاهده‌شده را بدون قضاوت توصیف کنید.",
   "برداشت یا نتیجه‌گیری اولیه شما چه بود؟",
   "کدام خطای ادراکی یا اسنادی محتمل است و چه شواهدی کم دارید؟",
   "تصمیم اصلاح‌شده و یک سؤال حرفه‌ای برای گفت‌وگو چیست؟"
  ];
  return [
   {kicker:"دفتر تمرین",title:a.title,sub:"Personal Reflection",
    body:part("صورت تکلیف",a.instruction)+part("خروجی مورد انتظار",a.submit)+originalDraft("پاسخ قبلی من",work?.reflection||"")},
   ...Array.from({length:Math.ceil(prompts.length/2)},(_,page)=>({
    kicker:"پرسش‌های "+(page*2+1)+" و "+Math.min(prompts.length,(page+1)*2),title:"تکمیل دفتر تمرین",sub:"دو پرسش در هر صفحه",
    body:prompts.slice(page*2,page*2+2).map((p,i)=>note("reflection-"+(page*2+i),p,work)).join("")
   })),
   {kicker:"مرور نهایی",title:"جمع‌بندی و بازبینی",sub:"Next Best Step",body:
    part("معیار یک پاسخ خوب",a.quality)+part("خروجی قابل ارائه",a.submit)+note("reflection-summary","یک اقدام مشخص که از این تمرین می‌گیرید",work)}
  ];
 }
 return [];
};
function render({enrichment,mode,work,index=0,lessonId=1}){
 const steps=stepsOf(enrichment,mode,work);
 if(!steps.length)return '<div class="gr-empty">محتوای این بخش هنوز ثبت نشده است.</div>';
 const n=Math.max(0,Math.min(steps.length-1,Number(index)||0)),stage=steps[n];
 const progress=Math.round((n+1)/steps.length*100);
 const nav='<div class="gr-step-navigation"><button type="button" data-action="guidedPrev" class="gr-prev" '+(n===0?"disabled":"")+'>مرحله قبل</button><span aria-label="مرحله '+(n+1)+' از '+steps.length+'">'+(n+1)+' / '+steps.length+'</span><button type="button" data-action="guidedNext" class="gr-next" '+(n===steps.length-1?"disabled":"")+'>مرحله بعد</button></div>';
 const rail='<nav class="gr-step-rail" aria-label="فهرست مراحل">'+steps.map((step,i)=>'<button type="button" data-action="guidedJump" data-index="'+i+'" class="gr-stage-tab '+(i===n?"active":"")+'" '+(i===n?'aria-current="step"':'')+' aria-label="رفتن به مرحله '+(i+1)+'">'+(i+1)+'</button>').join("")+'</nav>';
 return '<section class="gr-shell" data-guided-mode="'+escapeHtml(mode)+'" data-guided-session="'+lessonId+'"><div class="gr-header"><div><span class="gr-eyebrow">'+escapeHtml(stage.kicker||"")+'</span><h3 tabindex="-1" id="guidedStageTitle">'+escapeHtml(stage.title||"")+'</h3>'+(stage.sub?'<p class="gr-subtitle">'+escapeHtml(stage.sub)+'</p>':"")+'</div><div class="gr-step-count">'+(n+1)+' از '+steps.length+'</div></div><div class="gr-meter" role="progressbar" aria-valuemin="0" aria-valuemax="'+steps.length+'" aria-valuenow="'+(n+1)+'" aria-label="مراحل مشاهده‌شده"><span style="width:'+progress+'%"></span></div>'+rail+'<div class="gr-stage" data-stage-index="'+n+'">'+stage.body+'</div><div class="gr-actions">'+nav+'</div><div class="gr-autosave"><span data-save-status>پاسخ‌ها در همین دستگاه ذخیره می‌شوند</span>'+(mode==="case"||mode==="reflection"||mode==="group"||mode==="roleplay"?'<button type="button" class="gr-export" data-action="guidedExport">دریافت پاسخ‌ها ↓</button>':"")+'</div></section>';
}
window.OB_GUIDED={render,stepsOf};
})();