/* Classroom Presenter — unified slide-by-slide player for original English PPT
   and Persian teaching slides. The English slides render the *actual* uploaded
   PowerPoint pages, converted to faithful 4:3 WebP images from the source PPTs.
   No dependency on Drive login, iframe controls, paid APIs or browser PPT plugins. */
(()=>{
"use strict";
const originals={1:16,2:14};
const enc=x=>String(x??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const two=x=>String(x).padStart(2,"0");
const supportsOriginal=s=>Boolean(originals[s?.id]);
const count=(s,variant)=>variant==="en"&&supportsOriginal(s)?originals[s.id]:(Array.isArray(s?.presentation)?s.presentation.length:0);
const sourceImage=(s,n)=>"./materials/original/session-"+two(s.id)+"/slide-"+two(n+1)+".webp";
function slideMarkup(s,variant,n){
 if(variant==="en"&&supportsOriginal(s)){
  const img=sourceImage(s,n);
  return '<div class="presenter-original-slide" dir="ltr"><img src="'+img+'" loading="eager" decoding="async" width="1200" height="900" draggable="false" alt="Robbins original English slide '+(n+1)+' of '+count(s,"en")+'"></div>';
 }
 const slide=Array.isArray(s.presentation)?s.presentation[n]||[]:[];
 return '<div class="lecture-slide presenter-fa-slide" dir="rtl" aria-label="اسلاید فارسی '+(n+1)+'">'+
 '<div class="lecture-slide-kicker">مدیریت رفتار سازمانی · جلسه '+two(s.id)+'</div>'+
 '<h3>'+enc(slide[0]||"اسلاید موجود نیست")+'</h3>'+
 '<div class="lecture-slide-points">'+slide.slice(1).map(v=>'<div class="lecture-slide-point">'+enc(v)+'</div>').join("")+'</div>'+
 '<div class="lecture-slide-footer"><span>اسلاید '+(n+1)+' از '+count(s,"fa")+'</span><span>نسخه فارسی تدریس</span></div></div>';
}
function downloads(s,variant){
 const no=two(s.id);
 const b="./materials/session-"+no+"-robbins",o="./materials/original/session-"+no;
 const links=variant==="en"&&supportsOriginal(s)
 ?'<a href="'+o+'.pdf" target="_blank" rel="noopener noreferrer">PDF اصلی ↗</a><a href="'+o+'-robbins.ppt" download>PowerPoint اصلی ↓</a>'
 :'<a href="'+b+'.pdf" target="_blank" rel="noopener noreferrer">PDF فارسی ↗</a><a href="'+b+'.pptx" download>PowerPoint فارسی ↓</a>';
 return '<details class="presenter-files"><summary>دریافت فایل ارائه</summary><div class="presenter-files-links">'+links+'</div></details>';
}
function render({session:s,variant="fa",index=0}){
 const en=variant==="en"&&supportsOriginal(s),mode=en?"en":"fa",length=count(s,mode);
 const n=Math.max(0,Math.min(Math.max(0,length-1),Number(index)||0));
 const pick='<label class="presenter-page-select">اسلاید <select id="presenterPageSelect" data-action="presenterGo" aria-label="رفتن به شماره اسلاید">'+
 Array.from({length},(_,i)=>'<option value="'+i+'" '+(i===n?'selected':'')+'>'+(i+1)+'</option>').join("")+'</select></label>';
 const active=m=>mode===m?' aria-pressed="true" class="presenter-mode active"':' aria-pressed="false" class="presenter-mode"';
 const modeSwitch='<div class="presenter-mode-switch" role="group" aria-label="انتخاب نسخه ارائه">'+
 '<button type="button" data-action="presenterLanguage" data-language="fa"'+active("fa")+'>فارسی</button>'+
 (supportsOriginal(s)?'<button type="button" data-action="presenterLanguage" data-language="en"'+active("en")+'>English · Original</button>':"")+'</div>';
 const nav='<nav class="presenter-navigation" aria-label="کنترل ورق زدن اسلایدها">'+
 '<button type="button" data-action="slidePrev" class="presenter-arrow" '+(n<=0?'disabled':'')+'>قبلی</button>'+pick+
 '<span class="presenter-count" role="status" aria-live="polite">اسلاید '+(n+1)+' از '+length+'</span>'+
 '<button type="button" data-action="slideNext" class="presenter-arrow presenter-primary" '+(n>=length-1?'disabled':'')+'>بعدی</button>'+
 '</nav>';
 return '<div class="page presentation-page presenter-page">'+
 '<div class="page-head presenter-page-heading"><h2>نمایش اسلایدها · جلسه '+two(s.id)+'</h2></div>'+
 '<section id="presenterStage" class="presenter-stage" data-variant="'+mode+'" data-lesson="'+s.id+'" dir="rtl" aria-label="نمایش اسلایدهای جلسه">'+
 '<div class="presenter-toolbar">'+modeSwitch+
 '<button type="button" class="presenter-fullscreen" data-action="slideFull" aria-label="نمایش تمام صفحه">تمام‌صفحه <span aria-hidden="true">⛶</span></button></div>'+
 '<div class="presenter-viewport" id="lectureSlide" tabindex="-1" role="group" aria-label="اسلاید '+(n+1)+' از '+length+'">'+slideMarkup(s,mode,n)+'</div>'+
 '<div class="presenter-progress" aria-hidden="true"><span style="width:'+((n+1)/Math.max(length,1)*100).toFixed(1)+'%"></span></div>'+nav+'</section>'+
 '<div class="presentation-more presenter-bottom">'+
 '<button type="button" class="btn secondary" data-action="backFromPresentation">بازگشت</button>'+downloads(s,mode)+'</div></div>';
}
function update({session:s,variant="fa",index=0}){
 const stage=document.getElementById("presenterStage"),screen=document.getElementById("lectureSlide");
 if(!stage||!screen||stage.dataset.lesson!==String(s?.id))return false;
 const mode=variant==="en"&&supportsOriginal(s)?"en":"fa",total=count(s,mode),n=Math.max(0,Math.min(Math.max(0,total-1),Number(index)||0));
 stage.dataset.variant=mode;
 screen.setAttribute("aria-label","اسلاید "+(n+1)+" از "+total);
 screen.innerHTML=slideMarkup(s,mode,n);
 stage.querySelectorAll("[data-action=presenterLanguage]").forEach(b=>{
  const active=b.dataset.language===mode;b.classList.toggle("active",active);b.setAttribute("aria-pressed",String(active));
 });
 const countEl=stage.querySelector(".presenter-count");if(countEl)countEl.textContent="اسلاید "+(n+1)+" از "+total;
 const prev=stage.querySelector("[data-action=slidePrev]"),next=stage.querySelector("[data-action=slideNext]");
 if(prev)prev.disabled=n<=0;if(next)next.disabled=n>=total-1;
 const select=stage.querySelector("#presenterPageSelect");
 if(select){
  if(select.options.length!==total){
   select.innerHTML=Array.from({length:total},(_,i)=>'<option value="'+i+'">'+(i+1)+'</option>').join("");
  }
  select.value=String(n);
 }
 const progress=stage.querySelector(".presenter-progress>span");if(progress)progress.style.width=(100*(n+1)/Math.max(1,total)).toFixed(1)+"%";
 const downloadSection=document.querySelector(".presenter-bottom .presenter-files");if(downloadSection)downloadSection.outerHTML=downloads(s,mode);
 if(mode==="en"&&n+1<total){
  // Best-effort one-slide prefetch; does not preload unrelated apps or sources.
  const img=new Image();img.src=sourceImage(s,n+1);
 }
 return true;
}
window.OB_PRESENTER={render,update,count,sourceImage,supportsOriginal};
})();