/* Child culture BMC: visible section navigation and completeness dashboard. */
(() => {
"use strict";
const panel=document.getElementById("blocks"),tiles=document.getElementById("tiles");
if(!panel||!tiles)return;
const blocks=[...panel.querySelectorAll(".block")];
const links=[...tiles.querySelectorAll('a[href^="#block"]')];
if(blocks.length!==9||links.length!==9)return;
let active=0,showAll=false;
const help=document.createElement("section");
help.className="cq-guide";
help.setAttribute("aria-label","راهنمای تکمیل بوم");
help.innerHTML='<strong>مسیر تکمیل اختصاصی: ۹ خانه، ۹۰ سؤال</strong><p>ابتدا یک خانه را انتخاب کنید. سؤال‌های آن خانه باز می‌شوند؛ گزینه‌ها را تیک بزنید و برای هر سؤال دلخواه توضیح بدهید. سپس با «خانه بعدی» ادامه دهید. ریسک‌ها و برنامه اقدام پس از خانه نهم هستند.</p><div class="cq-progress" aria-label="میزان تکمیل ۹۰ سؤال"><span id="cq-progress-fill"></span></div><div class="cq-stats"><span id="cq-answered" role="status">۰ از ۹۰ سؤال</span><span id="cq-uncertain">نیازمند بررسی: ۰</span></div><button type="button" id="cq-show-all" class="cq-secondary">نمایش همه خانه‌ها</button>';
tiles.parentElement.insertBefore(help,tiles);
const tileCount=document.createElement("div");tileCount.id="cq-tile-explain";tileCount.className="cq-hint";tileCount.textContent="روی یکی از ۹ خانه بوم بزنید. هر خانه ۱۰ پرسش تکمیلی دارد.";tiles.insertAdjacentElement("beforebegin",tileCount);
function num(n){return Number(n).toLocaleString("fa-IR")}
function refresh(){
 let count=0,uncertain=0,completeBlocks=0;
 blocks.forEach((b,i)=>{
   const questions=[...b.querySelectorAll(".deep-question")];
   const answered=questions.filter(q=>q.querySelector('.deep-options input[type="checkbox"]:checked')||q.querySelector("textarea")?.value.trim()).length;
   count+=answered;
   uncertain+=questions.filter(q=>!![...q.querySelectorAll('.deep-options input[type="checkbox"]:checked')].find(x=>x.value==="نیازمند بررسی")).length;
   if(questions.length&&answered===questions.length)completeBlocks++;
   const tile=links[i];
   tile.innerHTML='<strong>'+(i+1).toLocaleString("fa-IR")+'. '+b.querySelector("h2")?.textContent.replace(/^\d+\.\s*/,"")+'</strong><small>'+num(answered)+' از '+num(questions.length)+' پرسش</small>';
   tile.setAttribute("aria-label",b.querySelector("h2")?.textContent+"، "+num(answered)+" پاسخ از "+num(questions.length)+" پرسش");
 });
 const percent=Math.round(100*count/90);
 document.getElementById("cq-answered").textContent=num(count)+" از ۹۰ پرسش پاسخ داده شده | "+num(completeBlocks)+" خانه کامل";
 document.getElementById("cq-uncertain").textContent="موارد نیازمند بررسی: "+num(uncertain);
 document.getElementById("cq-progress-fill").style.width=percent+"%";
}
function setView(index,{scroll=false}={}){
 if(index<0||index>=9)return;
 active=index;
 showAll=false;
 blocks.forEach((block,i)=>{
   block.hidden=i!==active;
   const details=block.querySelector(".deep-details");
   if(details)details.open=i===active;
   links[i].classList.toggle("cq-current",i===active);
   links[i].setAttribute("aria-current",i===active?"step":"false");
 });
 const show=document.getElementById("cq-show-all");show.textContent="نمایش همه خانه‌ها";
 if(scroll)blocks[active].scrollIntoView({behavior:"smooth",block:"start"});
 refresh();
}
links.forEach((a,i)=>a.addEventListener("click",e=>{e.preventDefault();setView(i,{scroll:true});}));
blocks.forEach((block,i)=>{
 const controls=document.createElement("nav");controls.className="cq-pager";controls.setAttribute("aria-label","حرکت بین خانه‌های بوم");
 if(i>0){const prev=document.createElement("button");prev.type="button";prev.className="cq-secondary";prev.textContent="خانه قبلی";prev.addEventListener("click",()=>setView(i-1,{scroll:true}));controls.append(prev);}
 const next=document.createElement("button");next.type="button";next.className="cq-primary";next.textContent=i<8?"ادامه: خانه "+num(i+2):"ادامه: ارزیابی ریسک‌ها";
 next.addEventListener("click",()=>{if(i<8)setView(i+1,{scroll:true});else document.getElementById("risk-assessment")?.scrollIntoView({behavior:"smooth",block:"start"});});
 controls.append(next);block.append(controls);
});
document.getElementById("cq-show-all").addEventListener("click",()=>{
 showAll=!showAll;
 if(showAll){blocks.forEach(b=>{b.hidden=false;const details=b.querySelector(".deep-details");if(details)details.open=false;});links.forEach(l=>l.classList.remove("cq-current"));document.getElementById("cq-show-all").textContent="بازگشت به تکمیل گام‌به‌گام";}
 else setView(active,{scroll:true});
 refresh();
});
panel.addEventListener("input",refresh);
panel.addEventListener("change",refresh);
window.addEventListener("pageshow",refresh);
const h=window.location.hash;
const match=h.match(/^#block(\d)$/);
if(match)setView(Number(match[1]));
else setView(0);
})();