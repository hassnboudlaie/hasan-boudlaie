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
const caseSelect=(lessonId,item,work)=>{
 const cfg=window.OB_CASE_CHOICES?.[lessonId]?.steps?.[item.key];
 if(!cfg)return note("case-"+item.key,"تحلیل شما با استفاده از مفهوم جلسه",work,"معیار ارزیابی: "+item.rubric+" · "+item.points+" امتیاز");
 const key="case-"+item.key, current=String(work?.guidedAnswers?.[key]||"");
 if(cfg.options?.length){
  const valid=cfg.options.includes(current);
  return '<div class="gr-note gr-choice"><p class="gr-choice-hint">'+escapeHtml(cfg.hint)+'</p><fieldset style="border:0;padding:0;margin:0;min-width:0"><legend>یک گزینه را انتخاب کنید</legend>'+
  cfg.options.map((v,i)=>'<label class="gr-choice-option" style="display:flex;align-items:flex-start;gap:10px;padding:12px 8px;border-bottom:1px solid var(--line,#ddd);cursor:pointer"><input type="radio" name="gr-'+escapeHtml(key)+'" data-guided-key="'+escapeHtml(key)+'" value="'+escapeHtml(v)+'" '+(v===current?'checked':'')+' style="flex:none;margin-top:5px"><span>'+["الف","ب","پ","ت"][i]+' — '+escapeHtml(v)+'</span></label>').join("")+'</fieldset>'+
  (!valid&&current?originalDraft("پاسخ متنی قبلی من",current):"")+
  '<div class="gr-note"><label for="gr-'+escapeHtml(key)+'-note">دلیل انتخاب یا تحلیل تکمیلی (اختیاری)</label><textarea id="gr-'+escapeHtml(key)+'-note" data-guided-key="'+escapeHtml(key)+'-note" rows="3" maxlength="1500" placeholder="اگر نکته‌ای دارید اینجا بنویسید...">'+escapeHtml(work?.guidedAnswers?.[key+"-note"]||"")+'</textarea></div></div>';
 }
 return '<div class="gr-note gr-choice"><label for="gr-'+escapeHtml(key)+'">از میان چهار تحلیل، گزینه دقیق‌تر را انتخاب کنید</label>'+
 '<p class="gr-choice-hint">'+escapeHtml(cfg.hint)+'</p>'+
 '<select id="gr-'+escapeHtml(key)+'" data-guided-key="'+escapeHtml(key)+'" aria-label="'+escapeHtml(item.title)+'">'+
 '<option value="">انتخاب پاسخ تحلیلی…</option>'+
 cfg.options.map((v,i)=>'<option value="'+escapeHtml(v)+'" '+(v===current?'selected':'')+'>'+["الف","ب","پ","ت"][i]+' — '+escapeHtml(v)+'</option>').join('')+'</select>'+
 '<p class="gr-choice-result" role="status">'+(current?escapeHtml(current):'پس از انتخاب، پاسخ کامل این مرحله اینجا نمایش داده می‌شود.')+'</p>'+
 '<small>پاسخ‌ها در همین دستگاه ذخیره می‌شوند؛ پس از تکمیل هر شش مرحله، ثبت نهایی برای استاد را انجام دهید.</small></div>';
};
const originalDraft=(label,value)=>value?'<details class="gr-prior"><summary>'+escapeHtml(label)+'</summary><p>'+escapeHtml(value)+'</p></details>':"";
const caseMethod=[["تعریف مسئله","Problem Definition","مشخص کنید فاصله میان وضع موجود و مطلوب چیست.","در یک انبار، درصد سفارش‌های دیررس از ۵٪ به ۱۵٪ رسیده است؛ مسئله افت تحویل به‌موقع است، نه الزاماً کم‌کاری کارکنان."],["داده‌ها و شواهد","Evidence & Data","واقعیت قابل سنجش را از فرضیه جدا کنید.","داده: درصد تأخیر و زمان پردازش؛ فرضیه: افزایش حجم سفارش یا اختلال در تخصیص کار."],["تحلیل با مفاهیم علمی","OB Analysis","مفاهیم مناسب را در سطح فرد، گروه یا سازمان به کار ببرید.","مهارت کارکنان، هماهنگی شیفت‌ها و فرایند تخصیص سفارش را بررسی کنید."],["تبیین و پیش‌بینی","Explanation & Prediction","توضیح‌های رقیب و پیامدهای احتمالی را ارزیابی کنید.","آیا تأخیر از ظرفیت ناکافی است یا تحویل نامنظم بین شیفت‌ها؟ اگر ادامه یابد، احتمال شکایت مشتری بیشتر می‌شود."],["اقدام اصلاحی","Managerial Intervention","یک اقدام متناسب با شواهد و علت محتمل پیشنهاد دهید.","اگر داده‌ها گلوگاه تحویل بین شیفت‌ها را تأیید کنند، یک فرایند تحویل استاندارد را آزمایشی اجرا کنید."],["سنجش و پیگیری","Measurement & Follow-through","شاخص، زمان و معیار موفقیت تعیین کنید.","در چهار هفته، درصد تأخیر و زمان پردازش را نسبت به خط مبنا بررسی کنید؛ هدف آزمایشی کاهش تأخیر به ۸٪ است."]];
const caseMethodHTML=()=>'<section class="card stack case-method-guide" aria-label="راهنمای شش مرحله تحلیل کیس"><h4>شش مرحله تحلیل کیس با مثال</h4><p>مثال آموزشی مستقل: تأخیر تحویل سفارش در یک انبار (فرضی). همین روش را برای کیس اختصاصی جلسه به کار ببرید.</p><ol class="case-method-steps">'+caseMethod.map(v=>'<li><strong>'+escapeHtml(v[0])+' · '+escapeHtml(v[1])+'</strong><p>'+escapeHtml(v[2])+'</p><p><strong>مثال: </strong>'+escapeHtml(v[3])+'</p></li>').join("")+'</ol></section>';
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
  const c=x.caseStudy,framework=x.caseFramework,assignment=x.assignment;if(!c||!framework)return [];
  const cells=cleanArray(c.dataTable),columns=cells[0]||[];
  const table=cells.length?'<div class="gr-table-scroll"><table class="gr-case-table"><thead><tr>'+columns.map(v=>'<th>'+escapeHtml(v)+'</th>').join("")+'</tr></thead><tbody>'+cells.slice(1).map(row=>'<tr>'+row.map(value=>'<td>'+escapeHtml(value)+'</td>').join("")+'</tr>').join("")+'</tbody></table></div>':"";
  const concepts='<div class="gr-concept-tools">'+cleanArray(framework.concepts).map(v=>
   '<div class="gr-concept-tool"><strong>'+escapeHtml(v.name)+'</strong><p>'+escapeHtml(v.use)+'</p></div>').join("")+'</div>';
  const itemSteps=cleanArray(framework.steps).map((item,i)=>({
   kicker:"تحلیل کیس · مرحله "+(i+1),
   title:item.title,sub:item.en||"",
   body:'<details class="gr-case-reference"><summary>مرور داده‌های کیس در همین گام</summary>'+list(c.facts)+table+'</details>'+part("سؤال تحلیل",window.OB_CASE_CHOICES?.[x.id]?.steps?.[item.key]?.question||item.prompt,"gr-definition")+caseSelect(x.id,item,work)
  }));
  return [
   {kicker:"کیس جلسه "+x.id,title:c.title,sub:c.tag||"",
    body:part("موقعیت",c.facts[0],"gr-definition")+(window.OB_CASE_CHOICES?.[x.id]?part("راهنمای تحلیل کیس",window.OB_CASE_CHOICES[x.id].introduction,"gr-takeaway"):"")+'<h4 class="gr-section">اطلاعات کیس</h4>'+list(c.facts.slice(1))+table+part("یادداشت مدرس",c.teachingNote)},
   {kicker:"ابزار تحلیل",title:framework.title,sub:"Concept Toolkit · Robbins",
    body:part("هدف",framework.description,"gr-takeaway")+concepts+
    caseMethodHTML()},
   {kicker:"تصمیم مدیریتی",title:"مسئله تصمیم‌گیری",sub:c.title,
    body:part("مأموریت شما",window.OB_CASE_CHOICES?.[x.id]?"با تکیه بر مفاهیم همین جلسه، در هر یک از شش مرحله یک برداشت مستدل‌تر را انتخاب کنید.":"برای هر یک از شش مرحله پاسخ شواهدمحور بنویسید و پس از بازبینی برای استاد ارسال کنید.","gr-definition")+part("خروجی نهایی","شش مرحله را تکمیل کنید، گزارش یکپارچه را پیش‌نمایش و در قالب Word یا PDF دریافت کنید و پاسخ‌ها را برای استاد ارسال کنید.")+
    part("معیار یک تحلیل خوب",assignment?.quality)+originalDraft("پیش‌نویس قبلی من",work?.case||"")},
   ...itemSteps,
   {kicker:"ثبت تکلیف",title:"تحویل تمرین ساختارمند شش‌مرحله‌ای",sub:"Structured Case Exercise",
    body:'<div class="gr-case-submit"><h4>تحلیل نهایی و ثبت تکلیف</h4><p>انتخاب‌های شش گام شما در متن زیر کنار هم قرار گرفته‌اند. قبل از ثبت نهایی، تحلیل را از ابتدا تا انتها بخوانید؛ اگر لازم است به گام مربوط برگردید و انتخاب خود را اصلاح کنید.</p><div id="caseIntegratedReport" data-session="'+x.id+'">'+(window.OB_CASE_EXPORT?.inlineReport(window.OB_CASE_EXPORT.build(x.id,x,work,window.OB_CASE?.submittedReport?.(x.id)))||"گزارش در دسترس نیست.")+'</div><div class="gr-report-actions"><button type="button" class="gr-next" data-action="casePreview">پیش‌نمایش گزارش کامل</button><button type="button" class="gr-prev" data-action="caseDownloadWord">دریافت Word</button><button type="button" class="gr-prev" data-action="casePrintPDF">دریافت PDF</button></div><div id="caseSubmitStatus" data-session="'+x.id+'">'+(window.OB_CASE?.studentStatusMarkup(x.id)||"")+'</div></div>'}
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
 return [];
};
function render({enrichment,mode,work,index=0,lessonId=1}){
 const steps=stepsOf(enrichment,mode,work);
 if(!steps.length)return '<div class="gr-empty">محتوای این بخش هنوز ثبت نشده است.</div>';
 const n=Math.max(0,Math.min(steps.length-1,Number(index)||0)),stage=steps[n];
 const progress=Math.round((n+1)/steps.length*100);
 const nav='<div class="gr-step-navigation"><button type="button" data-action="guidedPrev" class="gr-prev" '+(n===0?"disabled":"")+'>مرحله قبل</button><span aria-label="مرحله '+(n+1)+' از '+steps.length+'">'+(n+1)+' / '+steps.length+'</span><button type="button" data-action="guidedNext" class="gr-next" '+(n===steps.length-1?"disabled":"")+'>'+(mode==="case"&&n===steps.length-2?"مشاهده تحلیل یکپارچه":"مرحله بعد")+'</button></div>';
 const rail='<nav class="gr-step-rail" aria-label="فهرست مراحل">'+steps.map((step,i)=>'<button type="button" data-action="guidedJump" data-index="'+i+'" class="gr-stage-tab '+(i===n?"active":"")+'" '+(i===n?'aria-current="step"':'')+' aria-label="رفتن به مرحله '+(i+1)+'">'+(i+1)+'</button>').join("")+'</nav>';
 return '<section class="gr-shell" data-guided-mode="'+escapeHtml(mode)+'" data-guided-session="'+lessonId+'"><div class="gr-header"><div><span class="gr-eyebrow">'+escapeHtml(stage.kicker||"")+'</span><h3 tabindex="-1" id="guidedStageTitle">'+escapeHtml(stage.title||"")+'</h3>'+(stage.sub?'<p class="gr-subtitle">'+escapeHtml(stage.sub)+'</p>':"")+'</div><div class="gr-step-count">'+(n+1)+' از '+steps.length+'</div></div><div class="gr-meter" role="progressbar" aria-valuemin="0" aria-valuemax="'+steps.length+'" aria-valuenow="'+(n+1)+'" aria-label="مراحل مشاهده‌شده"><span style="width:'+progress+'%"></span></div>'+rail+'<div class="gr-stage" data-stage-index="'+n+'">'+stage.body+'</div><div class="gr-actions">'+nav+'</div><div class="gr-autosave"><span data-save-status>پاسخ‌ها در همین دستگاه ذخیره می‌شوند</span>'+(mode==="case"||mode==="group"||mode==="roleplay"?'<button type="button" class="gr-export" data-action="guidedExport">دریافت پاسخ‌ها ↓</button>':"")+'</div></section>';
}

function casePage(x,work){
 const c=x?.caseStudy,framework=x?.caseFramework,cfg=window.OB_CASE_CHOICES?.[x?.id]?.steps;
 if(!c||!framework||!cfg)return '<p>کیس و پرسش‌های این جلسه هنوز آماده نشده‌اند.</p>';
 const cells=cleanArray(c.dataTable),columns=cells[0]||[],rec=window.OB_CASE?.submittedReport?.(x.id);
 const table=cells.length?'<div class="gr-table-scroll"><table class="gr-case-table"><thead><tr>'+columns.map(v=>'<th scope="col">'+escapeHtml(v)+'</th>').join("")+'</tr></thead><tbody>'+cells.slice(1).map(row=>'<tr>'+row.map(v=>'<td>'+escapeHtml(v)+'</td>').join("")+'</tr>').join("")+'</tbody></table></div>':"";
 const effective=rec?{guidedAnswers:Object.fromEntries(framework.steps.flatMap(item=>{const v=String(rec.answers?.[item.key]||""),sep="\n\nتوضیح تکمیلی: ",idx=v.indexOf(sep);return [["case-"+item.key,idx<0?v:v.slice(0,idx)],["case-"+item.key+"-note",idx<0?"":v.slice(idx+sep.length)]]}))}:work;
 const report=window.OB_CASE_EXPORT?.build(x.id,x,work,rec);
 return '<div class="case-linear-workspace" data-case-session="'+x.id+'"><section class="card stack case-source"><h3>۱. متن و داده‌های کیس</h3><h4>'+escapeHtml(c.title)+'</h4><small>'+escapeHtml(c.tag||"")+'</small>'+list(c.facts)+table+part("موقعیت تصمیم‌گیری",c.decision)+'</section>'+
 '<details class="disclosure case-method-disclosure"><summary>راهنمای شش مرحله تحلیل کیس با مثال</summary><div class="disclosure-body">'+caseMethodHTML()+'</div></details>'+
 '<section class="card stack case-question-block"><h3>۲. پرسش‌های تحلیلی کیس</h3><p>برای هر گام یک گزینه انتخاب کنید. توضیح تکمیلی اختیاری است.</p><div data-save-status>پاسخ‌ها در همین دستگاه ذخیره می‌شوند.</div><fieldset id="caseQuestionFields" style="border:0;padding:0;margin:0;min-width:0" '+(rec?'disabled':'')+'><legend class="case-question-legend">شش گام تحلیل</legend>'+
 framework.steps.map((item,i)=>'<section class="case-step" id="case-step-'+escapeHtml(item.key)+'"><h4>گام '+(i+1)+' — '+escapeHtml(caseMethod[i][0])+'</h4><p lang="en" dir="ltr" class="gr-subtitle">'+escapeHtml(caseMethod[i][1])+'</p><p>'+escapeHtml(cfg[item.key]?.question||item.prompt)+'</p>'+caseSelect(x.id,item,effective)+'</section>').join("")+'</fieldset></section>'+
 '<section class="card stack case-result"><h3>۳. روایت تحلیلی شما از کیس</h3><p>با انتخاب ششمین پاسخ، متن تحلیل شما خودکار ساخته می‌شود. اگر گزینه‌ای را تغییر دهید، روایت نیز به‌روز می‌شود. این روایت پاسخنامه نیست.</p><div id="caseIntegratedReport" data-session="'+x.id+'">'+(report?window.OB_CASE_EXPORT.inlineReport(report):"گزارش در دسترس نیست.")+'</div><div class="gr-report-actions"><button type="button" class="gr-prev" data-action="caseDownloadWord" '+(report?.completed===6?'':'disabled')+'>دریافت Word</button><button type="button" class="gr-prev" data-action="casePrintPDF" '+(report?.completed===6?'':'disabled')+'>دریافت PDF</button></div><div id="caseSubmitStatus" data-session="'+x.id+'">'+(window.OB_CASE?.studentStatusMarkup(x.id)||"")+'</div></section></div>';
}

window.OB_GUIDED={render,stepsOf,caseMethodHTML,casePage};
})();