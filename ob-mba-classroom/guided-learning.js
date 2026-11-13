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
  const c=x.caseStudy,framework=x.caseFramework;if(!c||!framework)return [];
  const cells=cleanArray(c.dataTable),columns=cells[0]||[];
  const table=cells.length?'<div class="gr-table-scroll"><table class="gr-case-table"><thead><tr>'+columns.map(v=>'<th>'+escapeHtml(v)+'</th>').join("")+'</tr></thead><tbody>'+cells.slice(1).map(row=>'<tr>'+row.map(value=>'<td>'+escapeHtml(value)+'</td>').join("")+'</tr>').join("")+'</tbody></table></div>':"";
  const concepts='<div class="gr-concept-tools">'+cleanArray(framework.concepts).map(v=>
   '<div class="gr-concept-tool"><strong>'+escapeHtml(v.name)+'</strong><p>'+escapeHtml(v.use)+'</p></div>').join("")+'</div>';
  const itemSteps=cleanArray(framework.steps).map((item,i)=>({
   kicker:"تحلیل کیس · مرحله "+(i+1),
   title:item.title,sub:item.en||"",
   body:part("سؤال راهنما",item.prompt,"gr-definition")+note("case-"+item.key,"تحلیل شما با استفاده از مفهوم جلسه",work,"معیار ارزیابی: "+item.rubric+" · "+item.points+" امتیاز")
  }));
  return [
   {kicker:"کیس جلسه "+x.id,title:c.title,sub:c.tag||"",
    body:part("موقعیت",c.facts[0],"gr-definition")+'<h4 class="gr-section">اطلاعات کیس</h4>'+list(c.facts.slice(1))+table+part("یادداشت مدرس",c.teachingNote)},
   {kicker:"ابزار تحلیل",title:framework.title,sub:"Concept Toolkit · Robbins",
    body:part("هدف",framework.description,"gr-takeaway")+concepts+
    '<h4 class="gr-section">شش مرحله تحلیل</h4>'+list(framework.steps.map(item=>item.title),true)},
   {kicker:"تصمیم مدیریتی",title:"مسئله تصمیم‌گیری",sub:c.title,
    body:part("مأموریت شما",c.decision,"gr-definition")+part("خروجی نهایی","برای هر یک از شش مرحله چارچوب پاسخ بنویسید. در انتها پاسخ‌ها را برای ارزیابی مدرس ارسال کنید.")+
    originalDraft("پیش‌نویس قبلی من",work?.case||"")},
   ...itemSteps,
   {kicker:"ثبت تکلیف",title:"تحویل تحلیل کیس به استاد",sub:"Assignment Submission",
    body:'<div class="gr-case-submit"><h4>ثبت نهایی تحلیل شش‌مرحله‌ای</h4><p>پاسخ‌های شما در این دستگاه ذخیره شده‌اند. پس از ارسال نهایی، استاد می‌تواند آن‌ها را بررسی، نمره‌گذاری یا برای اصلاح برگرداند.</p><div id="caseSubmitStatus" data-session="'+x.id+'">'+(window.OB_CASE?.studentStatusMarkup(x.id)||"")+'</div></div>'}
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
  const fw=x.caseFramework,a=x.assignment;
  if(!fw||!a)return [];
  return [
   {kicker:"تکلیف جلسه "+x.id,title:a.title,sub:"Case-Based Assignment",
    body:part("صورت تکلیف",a.instruction,"gr-definition")+part("خروجی مورد انتظار",a.submit)+part("معیار یک پاسخ خوب",a.quality)},
   {kicker:"الگوی تحویل",title:"شش مرحله تحلیل کیس",sub:"Framework",
    body:list(fw.steps.map(st=>st.title+" — "+st.rubric),true)+
      '<button type="button" class="gr-next gr-case-open" data-action="jumpToCase">ورود به تحلیل و ثبت تکلیف ←</button>'+
      originalDraft("یادداشت‌های قدیمی",work?.reflection||"")}
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