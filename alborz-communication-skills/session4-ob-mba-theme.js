/* Enhance session four with the OB MBA Classroom's visual system.
 * Isolated to ?m=4. Original instruction, twelve role-play cases,
 * and six-minute assessment remain untouched.
 */
(function(){
"use strict";
const original=window.alborzSession4Page;
if(typeof original!=="function")return;
const iconPaths=[
 '<path d="M11 17h24M11 26h34M11 35h29"/><path d="M12 47h37M47 18l6 8-6 8"/>',
 '<path d="M13 19h38M23 19v31M17 50h12M35 28h16M35 36h12M35 44h9"/>',
 '<path d="M12 30h7m6-10v22m7-32v40m7-30v22m7-27v32m7-17h2"/>',
 '<circle cx="32" cy="33" r="20"/><path d="M32 19v16l10 6M27 7h10"/>',
 '<path d="M7 33s9-13 25-13 25 13 25 13-9 13-25 13S7 33 7 33Z"/><circle cx="32" cy="33" r="7"/>',
 '<path d="M9 12h34v26H25L13 49v-11H9Z"/><path d="M24 24h11M24 31h15M47 24h9v24H42l-8 7v-7"/>'
];
function icon(n){
 return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2.8" aria-hidden="true" focusable="false">'+iconPaths[n]+'</svg>';
}
function addTheme(){
 if(document.getElementById("s4-ob-mba-theme-css"))return;
 const link=document.createElement("link");
 link.id="s4-ob-mba-theme-css";
 link.rel="stylesheet";
 link.href="session4-ob-mba-theme.css?v=20261112-executive-v1";
 document.head.appendChild(link);
}
function addIntroMetrics(){
 const copy=document.querySelector(".s4-hero-copy");
 if(!copy||copy.querySelector(".s4-hero-metrics"))return;
 const bar=document.createElement("div");bar.className="s4-hero-metrics";
 bar.innerHTML='<span>۶ تکنیک مدیریتی</span><span>۱۲ سناریوی واقعی</span><span>آزمون ۶ دقیقه‌ای</span>';
 copy.appendChild(bar);
}
function addPath(){
 const wrap=document.querySelector(".s4-root .wrap");
 const hero=wrap?.querySelector(".s4-hero");
 const overview=wrap?.querySelector(".s4-overview");
 const lab=wrap?.querySelector(".s4-lab");
 const exam=wrap?.querySelector("#s4-final-exam");
 if(!wrap||!hero||!overview||!lab||!exam)return;
 overview.id="s4-techniques";
 lab.id="s4-roleplays";
 const items=[
 ["01","یادگیری تکنیک‌ها","شش مهارت فن بیان و رفتار ارتباطی","techniques"],
 ["02","تمرین و ایفای نقش","۱۲ موقعیت با تحلیل رفتاری","practice"],
 ["03","آزمون پایانی","۱۰ سؤال، زمان پاسخ‌گویی ۶ دقیقه","exam"]
 ];
 if(!wrap.querySelector(".s4-path")){
  const nav=document.createElement("nav");nav.className="s4-path";nav.setAttribute("aria-label","مسیر یادگیری جلسه چهارم");
  nav.innerHTML=items.map(i=>'<a class="s4-path-card" data-s4-section="'+i[3]+'" href="#'+(i[3]==="techniques"?"s4-techniques":i[3]==="practice"?"s4-roleplays":"s4-final-exam")+'"><span class="s4-path-num" aria-hidden="true">'+i[0]+'</span><span class="s4-path-copy"><strong>'+i[1]+'</strong><small>'+i[2]+'</small></span><span class="s4-path-arrow" aria-hidden="true">←</span></a>').join("");
  hero.insertAdjacentElement("afterend",nav);
 }
 for(const [section,kicker] of [[overview,"گام اول · یادگیری"],[lab,"گام دوم · تمرین و بازخورد"]]){
  const heading=section.querySelector(".s4-heading"),title=heading?.querySelector("h2");
  if(title&&!heading.querySelector(".s4-section-kicker")){
   const badge=document.createElement("span");badge.className="s4-section-kicker";badge.textContent=kicker;
   title.insertAdjacentElement("beforebegin",badge);
  }
 }
 const bottom=document.querySelector(".s4-mobile-nav");
 if(!bottom){
  const nav=document.createElement("nav");nav.className="s4-mobile-nav";nav.setAttribute("aria-label","دسترسی سریع به بخش‌های جلسه چهارم");
  nav.innerHTML='<a href="#s4-techniques"><span aria-hidden="true">۰۱</span>تکنیک‌ها</a><a href="#s4-roleplays"><span aria-hidden="true">۰۲</span>تمرین‌ها</a><a href="#s4-final-exam"><span aria-hidden="true">۰۳</span>آزمون</a>';
  document.body.appendChild(nav);
 }
}
function upgradeIcons(){
 document.querySelectorAll(".s4-overview .s4-tech").forEach((card,index)=>{
  const holder=card.querySelector(".s4-tech-icon");
  if(holder&&iconPaths[index])holder.innerHTML=icon(index);
  card.setAttribute("aria-label",card.querySelector("strong")?.textContent+"؛ مشاهده تعریف و مثال");
 });
}
function groupRoleplays(){
 const list=document.querySelector(".s4-lab .s4-cases");
 if(!list||list.dataset.s4Grouped==="true")return;
 const cards=Array.from(list.children).filter(el=>el.classList.contains("s4-case"));
 if(cards.length!==12)return; // leave the original layout intact if course content is edited
 let current=null,currentRole="";
 cards.forEach(card=>{
  const role=card.querySelector(".s4-case-label small")?.textContent?.split("·")[0]?.trim()||"موقعیت‌های ارتباطی";
  if(!current||role!==currentRole){
   currentRole=role;
   const section=document.createElement("section");section.className="s4-case-group";section.setAttribute("aria-label","گفت‌وگو با "+role);
   const head=document.createElement("div");head.className="s4-case-group-header";
   const title=document.createElement("h3");title.textContent=role;
   const number=document.createElement("span");number.textContent="۲ موقعیت";
   head.appendChild(title);head.appendChild(number);
   const pair=document.createElement("div");pair.className="s4-case-pair";
   section.appendChild(head);section.appendChild(pair);list.appendChild(section);
   current=pair;
  }
  current.appendChild(card);
 });
 list.dataset.s4Grouped="true";
}
function enhance(){
 const wrap=document.querySelector(".s4-root .wrap");
 if(!wrap)return;
 addIntroMetrics();
 addPath();
 upgradeIcons();
 groupRoleplays();
 addTheme();
}
window.alborzSession4Page=function(){
 // Do not recreate the teaching module or exam: retain the original lifecycle.
 original();
 enhance();
};
})();
