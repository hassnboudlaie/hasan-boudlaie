/* Book One · Complete reading frontmatter and the final 8-map profile.
   Source text and axes come strictly from authenticated Drive manuscripts.
   Pure local view over persisted worksheet and contextMap data; no total score. */
(function(){
"use strict";
const book=window.LifeBook,src=window.LifeBookContent;
if(!book||!src||!Array.isArray(src.frontMatter)||src.chapters.length!==12)return;
const old={landing:book.landing,chapter:book.chapter,worksheet:book.worksheet,workbook:book.workbook};
const esc=s=>String(s==null?"":s).replace(/[&<>"']/g,ch=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[ch]));
const tr=(lang,fa,en)=>lang==="en"?en:fa;
const fronts=[...src.frontMatter,{id:"toc",title:"فهرست مطالب جلد اول",en:"Book One contents",sourceText:src.tableOfContents.sourceText,sourceUrl:src.tableOfContents.sourceUrl}];
const safeNumber=str=>Number(String(str).replace(/[۰-۹]/g,c=>"۰۱۲۳۴۵۶۷۸۹".indexOf(c)).replace(/[٠-٩]/g,c=>"٠١٢٣٤٥٦٧٨٩".indexOf(c)));
function nav(lang,selected){
 return '<nav class="lp-front-nav" aria-label="'+tr(lang,"صفحه‌های آغاز کتاب","Book opening pages")+'">'+
 fronts.map(f=>'<button type="button" data-route="book1/front/'+f.id+'" class="'+(selected===f.id?"is-current":"")+'">'+esc(tr(lang,f.title,f.en))+'</button>').join("")+'</nav>';
}
function sourceParagraphs(text,section){
 const lines=text.split(/\r?\n/).map(t=>t.trim()).filter(Boolean);
 const headers=/^(پیشگفتار|شناسنامه|درباره مجموعه|مقدمه$|چگونه از این کتاب استفاده کنیم|لایف کوچ من در اپ|اپ همراه سازمان|فهرست مطالب$|بخش اول|بخش دوم|بخش سوم)$/;
 return lines.map((p,i)=>{
  if(section==="toc"){
   const m=/^فصل\s+([۰-۹٠-٩0-9]+)\s*[|｜]/.exec(p);
   if(m){const n=safeNumber(m[1]);if(n>=1&&n<=12)return '<button class="lp-toc-chapter" data-route="book1/'+n+'" type="button"><b>'+esc(m[1])+'</b><span>'+esc(p.slice(m[0].length).trim())+'</span><span aria-hidden="true">↗</span></button>';}
   if(p.startsWith("بخش "))return '<h3 class="lp-toc-part">'+esc(p)+'</h3>';
  }
  if(i===0||headers.test(p)||p.startsWith("درباره مجموعه")||p.startsWith("لایف کوچ من"))return '<h'+(i===0?1:2)+'>'+esc(p)+'</h'+(i===0?1:2)+'>';
  if(section==="about"&&i<12)return '<p class="lp-imprint">'+esc(p)+'</p>';
  return '<p>'+esc(p)+'</p>';
 }).join("");
}
function frontmatter(lang,id){
 const item=fronts.find(f=>f.id===id)||fronts[0],i=fronts.indexOf(item);
 return '<div class="lp-root lp-frontmatter" lang="fa" dir="rtl"><header class="lp-front-heading"><img src="./brand-symbol.svg" width="58" height="58" alt=""><div><span>THE LIFE ORGANIZATION · BOOK ONE</span><h1>'+esc(item.title)+'</h1><p>جلد اول — من کجای زندگی ایستاده‌ام؟</p></div></header>'+
 nav(lang,item.id)+
 '<article class="lp-manuscript" id="lp-front-text">'+sourceParagraphs(item.sourceText,item.id)+'</article>'+
 '<footer class="lp-front-footer"><a href="'+esc(item.sourceUrl)+'" rel="noopener noreferrer" target="_blank">'+tr(lang,"مشاهده سند تألیفی در Google Drive","Open authored source in Google Drive")+'</a><div>'+
 (i>0?'<button data-route="book1/front/'+fronts[i-1].id+'">'+tr(lang,"صفحه قبل","Previous")+'</button>':'')+
 (i+1<fronts.length?'<button data-route="book1/front/'+fronts[i+1].id+'">'+tr(lang,"صفحه بعد","Next")+'</button>':
 '<button data-route="book1/1">'+tr(lang,"شروع فصل اول","Start Chapter One")+'</button>')+
 '</div></footer></div>';
}
function selectedLabel(m,i){
 return i===null||i===undefined||!(i>=0&&i<=3)?"شاهد کافی ندارم":m.cells[Math.floor(i/2)][i%2];
}
function mapCard(n,context){
 const defs=book.contextMapDefinitions||{},m=defs[n];if(!m)return "";
 const v=context[n]||{},cells=m.cells.map((line,row)=>line.map((label,col)=>{
 const k=row*2+col;
 const a=v.current===k,b=v.suitable===k;
 return '<span class="lp-mini-cell'+(a?" is-current":"")+(b?" is-suitable":"")+'"><span>'+esc(label.replace(/ · (نیلوفر|رضا|آرش|لیلا)$/,""))+'</span><small>'+(a?"● ":"")+(b?"○":"")+'</small></span>';
 }).join("")).join("");
 return '<article class="lp-matrix-card"><div class="lp-matrix-title"><span>'+String(n).padStart(2,"0")+'</span><strong>'+esc(m.title)+'</strong></div>'+
 '<div class="lp-matrix-axes"><span>'+esc(m.x[0])+'</span><span>'+esc(m.x[1])+'</span></div><div class="lp-mini-grid">'+cells+'</div>'+
 '<div class="lp-matrix-summary"><p><b>● فعلی:</b> '+esc(selectedLabel(m,v.current))+'</p><p><b>○ مناسب:</b> '+esc(selectedLabel(m,v.suitable))+'</p></div>'+
 '<button type="button" data-route="book1/'+n+'/workbook" class="lp-open-map">مرور شواهد و اصلاح جایگاه</button></article>';
}
function profile(lang){
 const data=book.exportAll(),maps=data.contextMaps||{},record=(book.exportData().worksheetResponses||{})[12]||{};
 const summary=[["scope","حوزه یا تصمیم"],["period","بازه"],["choiceA","انتخاب اول"],["choiceB","انتخاب دوم"],["fit","همسویی / مغایرت و دلیل"],["preserve","چیزی که حفظ می‌کنم"],["next","تغییر اولویت‌دار"],["readiness","شرط آمادگی"],["review","زمان بازبینی"]];
 const lines=summary.map(([id,title])=>'<div><span>'+title+'</span><p>'+esc(record[id]||"— ثبت نشده —")+'</p></div>').join("");
 const n=Array.from({length:8},(_,i)=>i+4),placed=n.filter(i=>maps[i]&&(maps[i].current!=null||maps[i].suitable!=null)).length;
 return '<div class="lp-root lp-profile-page" lang="fa" dir="rtl">'+
 '<header class="lp-profile-cover"><div><span>BOOK I · FOUNDATIONAL LIFE PROFILE</span><h1>نمایه بنیادین سازمان زندگی من</h1><p>هشت نگاه به انتخاب‌ها، بدون نمره کلی و بدون قضاوت درباره ارزش فرد.</p></div><img src="./brand-symbol.svg" width="88" height="88" alt=""></header>'+
 '<div class="lp-profile-toolbar"><span>● وضع موجود &nbsp; ○ وضع مناسب پیشنهادی &nbsp; — نامعلوم</span><div><button type="button" data-route="book1/12/workbook">تکمیل جمع‌بندی</button><button type="button" data-lp-action="print">چاپ نمایه</button></div></div>'+
 '<p class="lp-context-warning">این نمایه انتخاب‌های فصل‌های ۴ تا ۱۱ را کنار هم نشان می‌دهد. جایگاه‌ها ممکن است درباره موضوع‌ها یا بازه‌های متفاوت باشند؛ پیش از نتیجه‌گیری درباره همسویی یا مغایرت، همان موضوع و بازه را مشخص کنید. شباهت ظاهری خانه‌ها نشانه تناسب نیست.</p>'+
 '<div class="lp-profile-heading"><h2>هشت موضع بنیادین</h2><span>'+placed+' از ۸ نقشه با علامت ثبت‌شده</span></div>'+
 '<div class="lp-profile-matrices">'+n.map(x=>mapCard(x,maps)).join("")+'</div>'+
 '<section class="lp-profile-synthesis"><h2>یک تصمیم؛ دو انتخاب اثرگذار</h2><p>آنچه در کاربرگ فصل دوازدهم نوشته‌اید، اینجا برای مرور و چاپ کنار هم می‌نشیند.</p><div class="lp-synthesis-lines">'+lines+'</div><button data-route="book1/12/workbook" type="button">تکمیل یا بازبینی این جمع‌بندی</button></section>'+
 ''+
 '<div class="lp-final-actions"><button data-route="book1/12" type="button">بازگشت به روایت فصل دوازدهم</button><button data-route="module/1" type="button">مسیر جلد اول</button></div></div>';
}
book.frontmatter=frontmatter;
book.profile=profile;
book.landing=function(lang){
 const before=old.landing(lang);
 const section='<section class="lp-front-teaser"><div><span>BEFORE CHAPTER ONE</span><h2>پیش از آنکه فصل اول را باز کنید</h2><p>پیشگفتار، مقدمه و راهنمای استفاده از کتاب و اپ را بخوانید؛ سپس همراه متن فصل‌ها و دفتر کار پیش بروید.</p></div><div><button data-route="book1/front/about" type="button">درباره مجموعه و پیشگفتار</button><button data-route="book1/front/intro" type="button">مقدمه</button><button data-route="book1/front/guide" type="button">راهنمای خواندن و اپ</button><button data-route="book1/front/toc" type="button">فهرست مطالب</button></div></section>';
 return before.replace('<div class="lb-section-header">',section+'<div class="lb-section-header">');
};
book.chapter=function(n,lang){
 let page=old.chapter(n,lang);
 if(n===12){
 const link='<div class="lp-profile-quick"><div><strong>نمایه یکپارچه این جلد</strong><p>هشت ماتریس پیشین را در یک صفحه مرور کنید و یک انتخاب اثرگذار بر انتخاب دیگر را شناسایی کنید.</p></div><button data-route="book1/profile" type="button">نمایه هشت‌ماتریسی من</button></div>';
 page=page.replace('<div class="lj-reading-layout">',link+'<div class="lj-reading-layout">');
 }
 return page;
};
book.worksheet=function(n,lang){
 const h=old.worksheet(n,lang);
 if(n!==12)return h;
 const link='<div class="lp-profile-quick"><div><strong>نگاهی به تصویر کل</strong><p>جایگاه‌های وضع موجود و مناسب در هشت ماتریس فصل‌های ۴ تا ۱۱ به‌صورت خودکار از همین دستگاه بازیابی می‌شوند.</p></div><button data-route="book1/profile" type="button">بازکردن نمایه یکپارچه</button></div>';
 return h.replace('<form class="lb-workbook-form',link+'<form class="lb-workbook-form');
};
book.workbook=function(lang){
 return old.workbook(lang).replace('<section class="lo-dossier">','<section class="lp-profile-quick"><div><strong>نمایه نهایی جلد اول</strong><p>از یادداشت‌های دوازده فصل، نقشه هشت‌ماتریسی و تصمیم قابل‌بازبینی بسازید.</p></div><button data-route="book1/profile" type="button">نمایه بنیادین من</button></section><section class="lo-dossier">');
};
document.addEventListener("click",function(e){
 const btn=e.target.closest?.("[data-lp-action]");if(!btn)return;
 const action=btn.dataset.lpAction;
 if(action==="print"&&typeof window.print==="function"){window.print();return;}
 if(action==="copy-prompt"){
  const value=(src.chapters[11].sourceText.match(/«با من مثل یک منتور[^»]*»/)||[])[0]||"";
  if(!value)return;
  if(navigator.clipboard&&navigator.clipboard.writeText){
   navigator.clipboard.writeText(value).then(()=>{const out=document.getElementById("lp-copy-status");if(out)out.textContent="متن راهنما کپی شد.";}).catch(()=>{const out=document.getElementById("lp-copy-status");if(out)out.textContent="کپی خودکار ممکن نشد؛ متن بالا را انتخاب کنید.";});
  }
 }
});
})();