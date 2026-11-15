/* Saba Naft | My Leadership Skills — visual award library.
 * Presentation-only overlay. Uses existing SabaGamification + JourneyCore results.
 * No duplicate points, no new storage keys, no fabricated achievements.
 */
(function(global){
"use strict";
const ROOT="sabanaft_leadership_journey_v1";
const STAGES=[
 ["مکث آگاهانه","pause"],["شناخت بافت","layers"],["چند روایت","messages"],
 ["انتخاب نقش","compass"],["شفافیت انتظار","list"],["گفت‌وگوی دشوار","talk"],
 ["تفویض توانمند","delegate"],["توافق اجرایی","link"],["ابزار متناسب","sliders"],
 ["پیگیری و بازاندیشی","cycle"]
];
const LEGACY_ICONS={"first-case":"puzzle","three-decisions":"target","action":"arrow",
 "followup":"search","reflect":"cycle","context":"compass","academy":"book","leadership":"crown"};
const PATHS={
 pause:'<circle cx="12" cy="12" r="9"/><path d="M9 8v8M15 8v8"/>',
 layers:'<path d="m12 2 9 5-9 5-9-5 9-5ZM3 12l9 5 9-5M3 17l9 5 9-5"/>',
 messages:'<path d="M3 4h13v9H8l-4 4v-4H3V4Z"/><path d="M11 18h6l3 3v-8h-3M7 8h6M7 11h3"/>',
 compass:'<circle cx="12" cy="12" r="9"/><path d="m15.8 8.2-2.3 5.3-5.3 2.3 2.3-5.3 5.3-2.3Z"/>',
 list:'<rect x="5" y="3" width="14" height="18" rx="2"/><path d="M9 3V2h6v1M8 9l2 2 3-3M8 16h8"/>',
 talk:'<path d="M3 4h13v10H9l-5 4v-4H3V4ZM11 18h6l3 3v-9h-3"/><path d="M7 8h5M7 11h5"/>',
 delegate:'<path d="M4 12V5h7M4 5l9 9"/><path d="M12 5h8v8M20 5l-9 9"/><path d="M8 19h8M12 16v6"/>',
 link:'<path d="m10 13 4-4M8 16H7a5 5 0 0 1 0-10h4M16 8h1a5 5 0 0 1 0 10h-4"/>',
 sliders:'<path d="M4 5h16M4 12h16M4 19h16"/><circle cx="9" cy="5" r="2" fill="#113d3b"/><circle cx="16" cy="12" r="2" fill="#113d3b"/><circle cx="7" cy="19" r="2" fill="#113d3b"/>',
 cycle:'<path d="M20 7v5h-5M4 17v-5h5"/><path d="M5.9 9A7 7 0 0 1 18 6l2 6M4 12l2 6a7 7 0 0 0 12.1-3"/>',
 puzzle:'<path d="M8 3h4c0 3 4 3 4 0h5v6c-3 0-3 4 0 4v8h-7c0-3-4-3-4 0H3v-7c3 0 3-4 0-4V3h5Z"/>',
 target:'<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.2" fill="#f5d68d"/><path d="m16 8 5-5"/>',
 arrow:'<path d="M4 18 20 5M11 5h9v9"/><path d="m5 9 3-3M4 14l-2 4 4-2"/>',
 search:'<circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 5 5M8 11l2 2 3-4"/>',
 book:'<path d="M12 6C8 3 5 4 3 5v14c4-1 7 0 9 2 2-2 5-3 9-2V5c-2-1-5-2-9 1ZM12 6v15"/>',
 crown:'<path d="m3 8 5 5 4-8 4 8 5-5-2 11H5L3 8Z"/><path d="M6 22h12"/>',
 star:'<path d="m12 2 3 6 6.7 1-4.85 4.7 1.15 6.7L12 17.3l-6 3.1 1.15-6.7L2.3 9 9 8l3-6Z"/>'
};
function escaped(value){return String(value==null?"":value).replace(/[&<>"']/g,x=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[x]))}
function f(value){return Number(value||0).toLocaleString("fa-IR")}
function readJourney(){try{const s=JSON.parse(localStorage.getItem(ROOT)||"null");return s&&s.version===1&&Array.isArray(s.history)&&s.answers?s:null}catch(e){return null}}
function awards(){
 const s=readJourney(),hist=s&&s.history||[],hasCompleted=hist.length>0;
 const steps=STAGES.map((pair,i)=>({
  id:"stage-"+(i+1),type:"stage",title:pair[0],
  description:"ثبت تصمیم و تمرین مرحله "+f(i+1)+" در مأموریت رقابتی",
  icon:pair[1],index:i+1,
  earned:hasCompleted||!!(s&&s.mode==="competitive"&&s.answers[i])
 }));
 let activity=[];
 if(global.SabaGamification&&typeof global.SabaGamification.collect==="function"){
  try{activity=global.SabaGamification.collect().badges.map(b=>({
   id:"activity-"+b.id,type:"activity",title:b.label,description:b.description,
   icon:LEGACY_ICONS[b.id]||"star",earned:!!b.earned
  }))}catch(e){activity=[]}
 }
 const medals=[["برنزی","bronze"],["نقره‌ای","silver"],["طلایی","gold"]].map(pair=>({
  id:"medal-"+pair[1],type:"medal",title:"مدال "+pair[0],
  description:pair[1]==="gold"?"نمره خالص ۸۵ تا ۱۰۰":pair[1]==="silver"?"نمره خالص ۷۰ تا ۸۴":"نمره خالص کمتر از ۷۰",
  icon:"star",rank:pair[0],earned:hist.some(h=>h&&h.badge===pair[0])
 }));
 return {steps:steps,activity:activity,medals:medals,state:s,history:hist,
  all:steps.concat(activity,medals)};
}
function svg(a){
 const id=String(a.id).replace(/[^a-z0-9-]/g,"");
 const medal=a.type==="medal";
 const tone=a.rank==="طلایی"?"gold":a.rank==="نقره‌ای"?"silver":a.rank==="برنزی"?"bronze":"emerald";
 const metal=tone==="gold"?["#fff2bd","#e0ab40","#8b5a14"]:tone==="silver"?["#fff","#a9bac2","#52656e"]:tone==="bronze"?["#ffdbaf","#b87848","#764326"]:["#ffefbb","#d6b273","#7e602f"];
 const icon=PATHS[a.icon]||PATHS.star;
 const shape=medal?
 '<path d="M58 22 80 64l-27 18-22-46ZM142 22l-22 42 27 18 22-46Z" fill="#0d5554" stroke="#ddba7a" stroke-width="4"/>'+
 '<circle cx="100" cy="112" r="81" fill="url(#rim-'+id+')" stroke="'+metal[2]+'" stroke-width="4"/><circle cx="100" cy="112" r="70" fill="url(#base-'+id+')" stroke="#fff0c4" stroke-width="2"/>'+
 '<circle cx="100" cy="112" r="59" fill="none" stroke="'+metal[1]+'" stroke-width="3" stroke-dasharray="2 8"/>'
 :
 '<path d="M100 8 171 42v88c0 41-35 65-71 84-36-19-71-43-71-84V42Z" fill="url(#rim-'+id+')" stroke="'+metal[2]+'" stroke-width="3"/>'+
 '<path d="M100 19 160 49v78c0 34-30 54-60 71-30-17-60-37-60-71V49Z" fill="url(#base-'+id+')" stroke="#f6deb0" stroke-width="2.5"/>'+
 '<path d="M100 29 151 55v67c0 28-24 47-51 62-27-15-51-34-51-62V55Z" fill="none" stroke="#d8b779" opacity=".46"/>';
 return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 220" width="200" height="220" role="img" aria-label="'+escaped(a.title)+'"><defs>'+
 '<linearGradient id="rim-'+id+'" x1="0" x2="1" y1="0" y2="1"><stop stop-color="'+metal[0]+'"/><stop offset=".5" stop-color="'+metal[1]+'"/><stop offset="1" stop-color="'+metal[2]+'"/></linearGradient>'+
 '<linearGradient id="base-'+id+'" x1="0" x2=".8" y1="0" y2="1"><stop stop-color="#176760"/><stop offset=".55" stop-color="#073c40"/><stop offset="1" stop-color="#071d31"/></linearGradient>'+
 '<filter id="shadow-'+id+'" x="-25%" y="-25%" width="150%" height="160%"><feDropShadow dx="0" dy="5" stdDeviation="5" flood-color="#00191a" flood-opacity=".29"/></filter></defs>'+
 '<g filter="url(#shadow-'+id+')">'+shape+'</g>'+
 '<g transform="translate(52 66) scale(4)" fill="none" stroke="'+metal[0]+'" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">'+icon+'</g>'+
 (medal?'<path d="M50 173q50 29 100 0l-8 25q-42 20-84 0Z" fill="url(#rim-'+id+')" stroke="'+metal[2]+'" stroke-width="2"/>':
 '<circle cx="100" cy="43" r="3" fill="'+metal[0]+'"/><path d="M68 173q32 19 64 0" stroke="'+metal[1]+'" stroke-width="2" fill="none"/>')+
 '</svg>';
}
let filter="stage",cached="";
function card(a){
 return '<article class="sa-award-card '+(a.earned?"sa-earned":"sa-locked")+'" aria-label="'+escaped(a.title+(a.earned?"، دریافت‌شده":"، دریافت‌نشده"))+'">'+
 '<div class="sa-art" aria-hidden="true">'+svg(a)+'</div>'+
 '<div class="sa-card-copy"><strong>'+escaped(a.title)+'</strong><p>'+escaped(a.description)+'</p>'+
 '<span class="sa-card-state">'+(a.earned?"دریافت شده":"هنوز دریافت نشده")+'</span></div>'+
 (a.earned?'<div class="sa-card-actions"><button type="button" data-sa-download="'+escaped(a.id)+'" data-sa-format="png" aria-label="دانلود '+escaped(a.title)+' با فرمت PNG">PNG</button>'+
 '<button type="button" data-sa-download="'+escaped(a.id)+'" data-sa-format="svg" aria-label="دانلود '+escaped(a.title)+' با فرمت SVG">SVG</button></div>':'')+
 '</article>';
}
function tab(id,label,count){
 return '<button type="button" role="tab" aria-selected="'+(filter===id)+'" tabindex="'+(filter===id?'0':'-1')+'" data-sa-filter="'+id+'">'+escaped(label)+' <span>'+f(count)+'</span></button>';
}
function collection(data){
 const list=filter==="stage"?data.steps:filter==="activity"?data.activity:data.medals;
 const earned=list.filter(a=>a.earned).length;
 return '<section class="sa-collection" dir="rtl" aria-label="مجموعه نشان‌های مهارت‌های رهبری من">'+
 '<header class="sa-collection-header"><div><span class="sa-eyebrow">Leadership Achievement Collection</span><h2>مجموعه نشان‌های رهبری من</h2>'+
 '<p>دستاوردهای یادگیری و رفتار ثبت‌شده؛ با معیارهای روشن و قابل پیگیری</p></div>'+
 '<div class="sa-count" aria-label="'+f(data.all.filter(a=>a.earned).length)+' نشان از '+f(data.all.length)+' نشان"><strong>'+f(data.all.filter(a=>a.earned).length)+'</strong><span>از '+f(data.all.length)+' نشان</span></div></header>'+
 '<div class="sa-tabs" role="tablist" aria-label="دسته‌بندی نشان‌ها">'+
 tab("stage","۱۰ ایستگاه یادگیری",data.steps.length)+tab("activity","فعالیت‌های رهبری",data.activity.length)+tab("medal","مدال‌های نهایی",data.medals.length)+'</div>'+
 '<p class="sa-group-status" aria-live="polite">'+f(earned)+' نشان دریافت شده از '+f(list.length)+'</p>'+
 '<div class="sa-grid" role="tabpanel">'+list.map(card).join("")+'</div>'+
 '<footer class="sa-collection-footer"><p>نشان مرحله‌ای فقط پس از ثبت تصمیم و تمرین در حالت رقابتی دریافت می‌شود. نشان‌های فعالیت از سوابق واقعی ثبت‌شده در همین مرورگر محاسبه می‌شوند. مدال نهایی بر اساس امتیاز خالص هر مأموریت است. این‌ها <strong>گواهی رسمی یا ارزیابی سازمانی تأییدشده نیستند</strong>.</p>'+
 '<button type="button" data-sa-print>چاپ / ذخیره مجموعه به PDF</button></footer></section>';
}
function addCollection(data){
 const passport=document.getElementById("passportView"),before=document.getElementById("journeyPassportSummary");
 if(!passport||!before)return;
 let host=document.getElementById("sabaAwardCollection");
 if(!host){host=document.createElement("div");host.id="sabaAwardCollection";before.parentNode.insertBefore(host,before)}
 const signature=JSON.stringify({filter:filter,ids:data.all.filter(x=>x.earned).map(x=>x.id),n:data.all.length});
 if(signature===cached&&host.firstElementChild)return;
 cached=signature;host.innerHTML=collection(data);
}
function journeyStrip(data){
 const root=document.getElementById("journeyRoot"),shell=root&&root.querySelector(".lj-shell");if(!shell)return;
 if(!shell.querySelector(".sa-journey-strip")){
  const bar=document.createElement("div");bar.className="sa-journey-strip";
  bar.setAttribute("aria-label","نشان‌های ده ایستگاه سفر یادگیری");
  bar.innerHTML='<div class="sa-strip-header"><strong>نشان‌های ده ایستگاه</strong><a href="#/passport">مجموعه کامل نشان‌ها</a></div>'+
  '<div class="sa-strip-items">'+data.steps.map(a=>'<div class="sa-strip-item '+(a.earned?"sa-earned":"sa-locked")+'" title="'+escaped(a.title)+'">'+svg(a)+'<span>'+f(a.index)+'</span></div>').join("")+'</div>';
  const banner=shell.querySelector(".lj-banner");if(banner)banner.insertAdjacentElement("afterend",bar);else shell.prepend(bar);
 }
 const milestone=shell.querySelector(".lj-milestone");
 if(milestone&&!milestone.querySelector(".sa-milestone-award")&&data.state&&data.state.mode==="competitive"){
  const a=data.steps[data.state.stage];
  if(a&&a.earned){
   const reward=document.createElement("div");reward.className="sa-milestone-award";
   reward.innerHTML='<div class="sa-milestone-icon" aria-hidden="true">'+svg(a)+'</div>'+
     '<div><span>نشان مهارتی این ایستگاه</span><strong>'+escaped(a.title)+'</strong><small>با ثبت تصمیم و تمرین دریافت شد</small></div>'+
     '<button type="button" data-sa-download="'+escaped(a.id)+'" data-sa-format="png">دریافت PNG</button>';
   milestone.querySelector(".lj-earn")?.insertAdjacentElement("afterend",reward);
  }
 }
 const result=shell.querySelector(".lj-result");
 if(result&&!result.querySelector(".sa-final-medal")){
  const rank=data.state&&data.state.history&&data.state.history.at(-1)?.badge;
  const a=data.medals.find(x=>x.rank===rank);
  if(a){
   const m=document.createElement("div");m.className="sa-final-medal";m.innerHTML='<div aria-hidden="true">'+svg(a)+'</div>'+
   '<div><span>مدال نهایی این مأموریت</span><strong>'+escaped(a.title)+'</strong><small>براساس امتیاز خالص ثبت‌شده؛ مستقل از امتیاز سالانه</small></div>'+
   '<button type="button" data-sa-download="'+escaped(a.id)+'" data-sa-format="png">دریافت مدال PNG</button>';
   result.prepend(m);
   const old=result.querySelector('[data-lj="png"]');if(old)old.textContent="دریافت کارت نتیجه PNG";
  }
 }
}
function render(){const data=awards();addCollection(data);journeyStrip(data)}
function download(a,format){
 if(!a||!a.earned)return;
 const markup=svg(a),filename="saba-leadership-"+a.id;
 function save(blob,ext){const url=URL.createObjectURL(blob),link=document.createElement("a");link.href=url;link.download=filename+"."+ext;document.body.appendChild(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(url),4000)}
 if(format==="svg"){save(new Blob([markup],{type:"image/svg+xml;charset=utf-8"}),"svg");return}
 const image=new Image(),url=URL.createObjectURL(new Blob([markup],{type:"image/svg+xml;charset=utf-8"}));
 image.onload=function(){
  try{const canvas=document.createElement("canvas");canvas.width=800;canvas.height=880;const ctx=canvas.getContext("2d");if(!ctx)throw Error("Canvas unsupported");
   ctx.clearRect(0,0,800,880);ctx.drawImage(image,0,0,800,880);
   canvas.toBlob(blob=>{if(blob)save(blob,"png");else save(new Blob([markup],{type:"image/svg+xml;charset=utf-8"}),"svg")},"image/png");
  }catch(e){save(new Blob([markup],{type:"image/svg+xml;charset=utf-8"}),"svg")}
  URL.revokeObjectURL(url);
 };
 image.onerror=function(){URL.revokeObjectURL(url);save(new Blob([markup],{type:"image/svg+xml;charset=utf-8"}),"svg")};
 image.src=url;
}
document.addEventListener("click",function(event){
 const tab=event.target.closest("[data-sa-filter]");
 if(tab){filter=tab.dataset.saFilter;cached="";render();document.querySelector('[data-sa-filter="'+filter+'"]')?.focus();return}
 const action=event.target.closest("[data-sa-download]");
 if(action){const a=awards().all.find(x=>x.id===action.dataset.saDownload);download(a,action.dataset.saFormat);return}
 if(event.target.closest("[data-sa-print]")){global.print();return}
 if(event.target.closest("[data-lj], [data-go], [data-model-nav], a[href^='#/']"))requestAnimationFrame(render);
});
global.addEventListener("hashchange",render);
global.addEventListener("storage",function(e){if(["sabanaft_leadership_journey_v1","sabanaft_reflective_v2","sabanaft_leadership_studio_v1"].includes(e.key))render()});
const target=document.getElementById("journeyRoot");
if(target){const observer=new MutationObserver(function(){journeyStrip(awards())});observer.observe(target,{childList:true,subtree:true})}
global.SabaLeadershipAwards={awards:awards,svg:svg,render:render,download:download};
render();
})(window);
