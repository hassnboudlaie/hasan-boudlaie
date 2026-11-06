/* Linear guided journey for Parastoo and Jewelry BMC only.
   Reuses existing answer storage / report engine, never resets stored answers. */
(() => {
"use strict";
const cfg=window.SpecializedBMCConfig;
if(!cfg||!["parastoo","jewelry"].includes(cfg.id))return;
const $=s=>document.querySelector(s);
const qa=$('#business-intro'),group=$('#block-sections'),risk=$('#risk-section'),action=$('#action-section'),finish=$('#output-section'),visual=$('#visual-section'),research=$('#research-method'),catalog=$('#bmc-navigation');
if(!qa||!group||!risk||!action||!finish||!visual||!catalog)return;
const num=n=>Number(n).toLocaleString("fa-IR");
const key="hb-specialized-wizard-v1-"+cfg.id;
const sections=[qa,catalog,group,visual,risk,action,finish,research].filter(Boolean);
const blocks=[...group.querySelectorAll(".sb-block")];
const questions=blocks.map(b=>[...b.querySelectorAll(".sb-question")]);
const riskRows=[...risk.querySelectorAll(".sb-risk")];
const actionRows=[...action.querySelectorAll(".sb-action")];
const riskChecks=riskRows.map(r=>r.querySelector('.sb-riskhead input[type=checkbox]'));
const actionChecks=actionRows.map(r=>r.querySelector('.sb-riskhead input[type=checkbox]'));
const names=cfg.blocks.map(b=>b.title);
let current="intro";
try{const saved=localStorage.getItem(key);if(saved)current=saved;}catch(e){}
const wizard=document.createElement("section");
wizard.id="sb-wizard";
wizard.className="sb-wizard-status";
wizard.setAttribute("aria-label","پیشرفت تکمیل گام‌به‌گام");
wizard.innerHTML='<div class="sb-wizard-eyebrow">راهنمای گام‌به‌گام • Step-by-Step</div><div class="sb-wizard-heading" id="sb-wizard-heading" role="status" aria-live="polite"></div><div class="sb-wizard-count" id="sb-wizard-count"></div><div class="sb-wizard-track"><div id="sb-wizard-fill"></div></div><p class="sb-wizard-help" id="sb-wizard-help">پاسخ‌ها اختیاری‌اند؛ می‌توانید به هر سؤال بعداً برگردید.</p>';
$('.hero').insertAdjacentElement("afterend",wizard);
const footer=document.createElement("nav");
footer.id="sb-wizard-controls";
footer.setAttribute("aria-label","کنترل مراحل پرسشنامه");
footer.innerHTML='<button class="sb-wizard-back" type="button" id="sb-wizard-back">قبلی</button><button class="sb-wizard-forward" type="button" id="sb-wizard-next">شروع تکمیل بوم</button>';
document.body.append(footer);
document.body.classList.add("sb-linear-active");
$('.sb-jump')?.setAttribute("hidden","");
const visualGrid=$('#visual-grid');
if(visualGrid){
 visualGrid.classList.add("sb-review-only");
 visualGrid.setAttribute("aria-label","پیش‌نمایش نهایی بوم ۹ خانه‌ای");
 visualGrid.addEventListener("click",e=>{e.preventDefault();e.stopImmediatePropagation();},true);
 for(const tile of visualGrid.querySelectorAll("button")){tile.tabIndex=-1;tile.setAttribute("aria-disabled","true");}
}
if(research)research.open=false;
function stageList(){
 const out=[{key:"intro",kind:"intro"}];
 for(let bi=0;bi<cfg.blocks.length;bi++){
  for(let qi=0;qi<questions[bi].length;qi++)out.push({key:"q:"+cfg.blocks[bi].id+":"+qi,kind:"question",bi,qi});
 }
 out.push({key:"risk-select",kind:"risk-select"});
 riskChecks.forEach((check,i)=>{if(check?.checked)out.push({key:"risk:"+i,kind:"risk-detail",i});});
 out.push({key:"action-select",kind:"action-select"});
 actionChecks.forEach((check,i)=>{if(check?.checked)out.push({key:"action:"+i,kind:"action-detail",i});});
 out.push({key:"finish",kind:"finish"});
 return out;
}
function safeSaveStage(){try{localStorage.setItem(key,current);}catch(e){}}
function selectStage(){
 const steps=stageList();
 let index=steps.findIndex(x=>x.key===current);
 if(index<0){
  if(current.startsWith("risk:"))current="risk-select";
  else if(current.startsWith("action:"))current="action-select";
  else current="intro";
  index=steps.findIndex(x=>x.key===current);
 }
 return{steps,index,step:steps[index]};
}
function labelOf(step){
 if(step.kind==="intro")return{title:"ابتدا کسب‌وکارت را معرفی کن",context:"مرحله شروع • شرح ایده و شرایط اولیه",next:"ورود به پرسش‌های بوم"};
 if(step.kind==="question")return{title:names[step.bi],context:"خانه "+num(step.bi+1)+" از ۹ • سؤال "+num(step.qi+1)+" از "+num(questions[step.bi].length),next:step.qi===questions[step.bi].length-1?"خانه بعدی":"سؤال بعدی"};
 if(step.kind==="risk-select")return{title:"ریسک‌های کسب‌وکارت را انتخاب کن",context:"Risk Assessment • انتخاب ریسک",next:riskChecks.some(c=>c.checked)?"بررسی ریسک‌های منتخب":"ورود به برنامه اقدام"};
 if(step.kind==="risk-detail"){const count=riskChecks.filter(c=>c.checked).length;const selected=riskChecks.slice(0,step.i+1).filter(c=>c.checked).length;return{title:"جزئیات ریسک انتخاب‌شده",context:"ریسک "+num(selected)+" از "+num(count),next:"ریسک بعدی / ادامه"};}
 if(step.kind==="action-select")return{title:"اقدام‌های ۹۰ روز آینده را انتخاب کن",context:"Action Plan • انتخاب اقدام",next:actionChecks.some(c=>c.checked)?"تکمیل اقدام‌های منتخب":"مرور و ارسال پاسخ‌ها"};
 if(step.kind==="action-detail"){const count=actionChecks.filter(c=>c.checked).length;const selected=actionChecks.slice(0,step.i+1).filter(c=>c.checked).length;return{title:"جزئیات اقدام انتخاب‌شده",context:"اقدام "+num(selected)+" از "+num(count),next:"اقدام بعدی / ادامه"};}
 return{title:"مرور بوم و ارسال پاسخ‌ها",context:"پایان مسیر • Review & Share",next:""};
}
function hideEverything(){
 sections.forEach(el=>el.hidden=true);
 blocks.forEach(b=>{
  b.hidden=true;
  [...b.children].forEach(el=>el.hidden=true);
 });
 riskRows.forEach((row,i)=>{row.hidden=false;const d=row.querySelector(".sb-riskdetail");if(d)d.hidden=true;if(riskChecks[i])riskChecks[i].disabled=false;});
 actionRows.forEach((row,i)=>{row.hidden=false;const d=row.querySelector(".sb-riskdetail");if(d)d.hidden=true;if(actionChecks[i])actionChecks[i].disabled=false;});
 const rx=$("#risk-extra"),ca=$("#custom-action");
 if(rx)rx.hidden=false;if(ca)ca.hidden=false;
}
function showQuestion(step){
 group.hidden=false;
 const b=blocks[step.bi];b.hidden=false;
 for(const el of b.children){
  if(el.matches("h2, p.sb-hint, p.sb-essential-note"))el.hidden=false;
 }
 const q=questions[step.bi][step.qi];q.hidden=false;q.open=true;
 const note=q.querySelector(".sb-note");if(note)note.open=true;
 // A block recap and its Evidence Level appear with its final question.
 if(step.qi===questions[step.bi].length-1){
  for(const el of b.children){
   if(el.classList.contains("sb-field")||el.classList.contains("sb-evidencebox"))el.hidden=false;
  }
 }
}
function showRiskSelection(){
 risk.hidden=false;
 riskRows.forEach(row=>{row.hidden=false;const detail=row.querySelector(".sb-riskdetail");if(detail)detail.hidden=true;});
 const rx=$("#risk-extra");if(rx)rx.hidden=false;
}
function showRiskDetail(step){
 risk.hidden=false;
 riskRows.forEach((row,i)=>{row.hidden=i!==step.i;const detail=row.querySelector(".sb-riskdetail");if(detail)detail.hidden=i!==step.i;});
 const rx=$("#risk-extra");if(rx)rx.hidden=true;
 riskChecks[step.i].disabled=true;
}
function showActionSelection(){
 action.hidden=false;
 actionRows.forEach(row=>{row.hidden=false;const detail=row.querySelector(".sb-riskdetail");if(detail)detail.hidden=true;});
 const custom=$("#custom-action");if(custom)custom.hidden=false;
}
function showActionDetail(step){
 action.hidden=false;
 actionRows.forEach((row,i)=>{row.hidden=i!==step.i;const detail=row.querySelector(".sb-riskdetail");if(detail)detail.hidden=i!==step.i;});
 const custom=$("#custom-action");if(custom)custom.hidden=true;
 actionChecks[step.i].disabled=true;
}
function updateHeader(){
 const{steps,index,step}=selectStage();
 const info=labelOf(step);
 $("#sb-wizard-heading").textContent=info.title;
 $("#sb-wizard-count").textContent=info.context+" | گام "+num(index+1)+" از "+num(steps.length);
 $("#sb-wizard-fill").style.width=Math.max(3,Math.round(100*(index+1)/steps.length))+"%";
 $("#sb-wizard-back").disabled=index===0;
 $("#sb-wizard-next").hidden=index===steps.length-1;
 $("#sb-wizard-next").textContent=info.next;
 const help=$("#sb-wizard-help");
 if(step.kind==="risk-select")help.textContent="فقط ریسک‌های مرتبط را تیک بزن. در مراحل بعد برای هر ریسک انتخاب‌شده، توضیح و راهکار ثبت می‌کنی.";
 else if(step.kind==="action-select")help.textContent="اقدام‌ها را تیک بزن؛ سپس مسئول، زمان و نتیجه مورد انتظار هر اقدام را تکمیل کن.";
 else if(step.kind==="question")help.textContent=step.qi===questions[step.bi].length-1?"در پایان این خانه می‌توانی جمع‌بندی و سطح شواهد را هم ثبت کنی.":"هر سؤال دارای گزینه‌های قابل انتخاب و یک پاسخ باز است. پاسخ‌دادن اجباری نیست.";
 else if(step.kind==="finish")help.textContent="پاسخ‌ها روی همین دستگاه ذخیره شده‌اند. از بخش پایین فایل را برای مشاور ارسال کن.";
 else help.textContent="پاسخ‌ها خودکار ذخیره می‌شوند. می‌توانی بدون پاسخ نیز ادامه بدهی و با «قبلی» برگردی.";
}
function render({scroll=true}={}){
 const{step}=selectStage();hideEverything();
 if(step.kind==="intro")qa.hidden=false;
 else if(step.kind==="question")showQuestion(step);
 else if(step.kind==="risk-select")showRiskSelection();
 else if(step.kind==="risk-detail")showRiskDetail(step);
 else if(step.kind==="action-select")showActionSelection();
 else if(step.kind==="action-detail")showActionDetail(step);
 else if(step.kind==="finish"){visual.hidden=false;finish.hidden=false;if(research)research.hidden=false;}
 updateHeader();safeSaveStage();
 if(scroll){
   const y=wizard.getBoundingClientRect().top+window.scrollY-63;
   window.scrollTo({top:Math.max(0,y),behavior:"instant"});
 }
}
function move(dir){
 const{steps,index}=selectStage();
 const next=steps[index+dir];
 if(!next)return;
 current=next.key;
 render();
}
$("#sb-wizard-back").addEventListener("click",()=>move(-1));
$("#sb-wizard-next").addEventListener("click",()=>move(1));
risk.querySelector("#risk-list")?.addEventListener("change",()=>{if(current==="risk-select")render({scroll:false});});
action.querySelector("#action-list")?.addEventListener("change",()=>{if(current==="action-select")render({scroll:false});});
render({scroll:false});
})();
