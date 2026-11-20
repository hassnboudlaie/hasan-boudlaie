/* Book One chapters 4–11: contextual two-axis maps and a connected personal dossier.
 * Reflective learning only; no official DiSC diagnostic, no wellbeing score. */
(function(){
"use strict";
if(!window.LifeBook||!window.LifeBookContent)return;
const book=window.LifeBook,source=window.LifeBookContent;
const old={chapter:book.chapter,worksheet:book.worksheet,workbook:book.workbook,reset:book.resetAll,exportAll:book.exportAll};
const KEY="tlo-book1-context-maps-v1";
const maps={
4:{title:"نقشه فرض‌ها و منطق اداره زندگی",en:"Assumptions & organization logic",
  x:["اتکا به قواعد پیشین","هماهنگی در همان موقعیت"],y:["چابکی و بازنگری","ثبات و حفظ روش"],
  cells:[["بازنگری بر پایه قواعد موجود","بازنگری و هماهنگی موقعیتی"],["حفظ روال با قواعد قبلی","حفظ روال با هماهنگی ضمنی"]],
  note:"این ماتریس، مدل تألیفی فصل چهارم است. جای‌گذاری فقط به همان روش، زمینه و بازه مربوط است."},
5:{title:"نقشه شادی و موفقیت",en:"Happiness × success",
  x:["موفقیت: خیر","موفقیت: بله"],y:["شادی: بله","شادی: خیر"],
  cells:[["خانه C · شاد و ناموفق · آرش","خانه D · شاد و موفق · لیلا"],["خانه A · نه شاد، نه موفق · نیلوفر","خانه B · موفق و غمگین · رضا"]],
  note:"شادی، ارزیابی شخصی تجربه همان دوره است؛ موفقیت را نسبت به معیار نتیجه همان دوره بسنجید."},
6:{title:"نقشه ترجیحات رفتاری DiSC",en:"DiSC behavioral preferences",
  x:["پرسشگر و نقاد","پذیرا و گرم"],y:["پرتحرک و صریح","سنجیده و محتاط"],
  cells:[["D · تسلط · آرش","i · اثرگذاری · نیلوفر"],["C · دقت و وظیفه‌شناسی · رضا","S · ثبات · لیلا"]],
  note:"این ابزار، مشاهده زمینه‌مند رفتار است؛ آزمون استاندارد، نمره یا پروفایل رسمی Everything DiSC نیست."},
7:{"title":"نقشه دانستن و عمل‌کردن","en":"Knowing × Doing","x":["عمل نکرده‌ام","عمل کرده‌ام"],"y":["دانستن کافی و روشن","دانسته‌ام کافی نیست"],"cells":[["خانه C · می‌دانم، اما عمل نکرده‌ام · آرش","خانه D · می‌دانم و عمل کرده‌ام · لیلا"],["خانه A · نه دانستن کافی، نه عمل · نیلوفر","خانه B · عمل کرده‌ام، اما تناسب روش نامعلوم · رضا"]],"note":"دانستن یعنی بتوان گام مناسب و دلیلش را در همان زمان توضیح داد؛ عمل یعنی رخداد قابل مشاهده در همان بازه. قصد جای عمل نیست."},
8:{"title":"نقشه مدیرعاملی و بهره‌وری زندگی","en":"Effectiveness × Efficiency","x":["کارایی پایین‌تر","کارایی بالاتر"],"y":["اثربخشی بالاتر","اثربخشی پایین‌تر"],"cells":[["مدیرعامل گرفتار","مدیرعامل راهبردی"],["مدیرعامل پراکنده‌کار","مدیرعامل متخصص"]],"note":"اثربخشی، دستیابی به نتیجه مهم است؛ کارایی، مصرف منابع در یک مقایسه منصفانه. این ماتریس درباره زحمت ذاتی کار نیست."},
9:{"title":"نقشه رفتار و نتیجه","en":"Behavioral Fit × Outcome","x":["رفتار نامتناسب","رفتار متناسب"],"y":["نتیجه حاصل شد","نتیجه حاصل نشد"],"cells":[["نتیجه حاصل شد؛ رفتار نیازمند اصلاح","نتیجه حاصل شد؛ رفتار متناسب"],["نتیجه حاصل نشد؛ رفتار نیازمند اصلاح","نتیجه حاصل نشد؛ رفتار می‌تواند متناسب باشد"]],"note":"رفتار را نسبت به نیاز و توافق همان موقعیت بسنجید؛ نتیجه را جدا بررسی کنید. هیچ یک از چهار خانه، رابطه علّی را ثابت نمی‌کند."},
10:{"title":"نقشه زحمت و بازده","en":"Effort × Yield","x":["پرزحمت","کم‌زحمت"],"y":["پربازده","کم‌بازده"],"cells":[["پرزحمت و پربازده","کم‌زحمت و پربازده"],["پرزحمت و کم‌بازده","کم‌زحمت و کم‌بازده"]],"note":"زحمت ذاتی کار با اتلاف منابع فرق دارد؛ بازده را با معیار ارزشمند خود بسنجید و گزینه ازدست‌رفته را هم در کاربرگ ثبت کنید. این نقشه، رفتار × نتیجه فصل نهم نیست."},
11:{"title":"نقشه فلسفه پیشرفت من","en":"Starting Point × Progress Method","x":["شروع از معنا و چشم‌انداز","شروع از شواهد و امکانات"],"y":["بهبود گام‌به‌گام","بازطراحی مسیر"],"cells":[["بهبود روال برای هدفی معنادار · رضا","بهبود روال با بررسی شرایط · لیلا"],["طراحی مسیر از یک چشم‌انداز · نیلوفر","بازطراحی روش از روی شواهد · آرش"]],"note":"این ماتریس تألیفی، اقتباسی از منطق دو محور مستقل است و معادل چهار پارادایم جامعه‌شناسی بارل و مورگان نیست. نقطه شروع و شیوه حرکت را برای یک تصمیم و بازه مشخص با شواهد بررسی کنید."}
};
book.contextMapDefinitions=maps;
const esc=x=>String(x==null?"":x).replace(/[&<>"']/g,ch=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[ch]));
const tr=(fa,en)=>document.documentElement.lang==="en"?en:fa;
function read(){try{const a=JSON.parse(localStorage.getItem(KEY)||"{}");return a&&typeof a==="object"&&!Array.isArray(a)?a:{}}catch(e){return {}}}
let state=read(),modes={};
function save(){try{localStorage.setItem(KEY,JSON.stringify(state));return true}catch(e){return false}}
function positions(n){return state[n]&&typeof state[n]==="object"?state[n]:{current:null,suitable:null}}
function mapHtml(n){
 const m=maps[n],v=positions(n),mode=modes[n]||"current",cell=(row,col)=>row*2+col;
 const grid=m.cells.map((r,i)=>r.map((name,j)=>{
  const k=cell(i,j),a=v.current===k,b=v.suitable===k;
  return '<button type="button" class="lo-map-cell'+(a?" lo-current":"")+(b?" lo-suitable":"")+'" data-lo-action="place" data-ch="'+n+'" data-cell="'+k+'" aria-label="'+esc(name)+'">'+
   '<span class="lo-map-cell-title">'+esc(name)+'</span>'+
   '<span class="lo-map-markers">'+(a?'<span class="lo-dot" title="وضع موجود">● '+tr("فعلی","Current")+'</span>':"")+
   (b?'<span class="lo-ring" title="وضع مناسب">○ '+tr("مناسب","Suitable")+'</span>':"")+'</span></button>';
 }).join("")).join("");
 const summarize=(v2)=>v2===null||v2===undefined?tr("هنوز جای‌گذاری نشده","Not placed"):(m.cells[Math.floor(v2/2)]||[])[v2%2];
 return '<section class="lo-map" data-lo-map="'+n+'" aria-label="'+esc(m.title)+'"><div class="lo-map-top"><div><span class="lo-map-kicker">'+tr("ابزار تعاملیِ برگرفته از کتاب","SOURCE-ALIGNED INTERACTIVE TOOL")+'</span><h3>'+esc(tr(m.title,m.en))+'</h3></div><span class="lo-map-book">BOOK I · '+String(n).padStart(2,"0")+'</span></div>'+
 '<p class="lo-map-lead">'+esc(m.note)+'</p>'+
 '<div class="lo-map-choice"><span>'+tr("اکنون کدام وضعیت را علامت می‌زنید؟","Choose a position to place")+'</span>'+
 '<button type="button" class="'+(mode==="current"?"active":"")+'" data-lo-action="mode" data-ch="'+n+'" data-mode="current" aria-pressed="'+(mode==="current")+'">● '+tr("وضع فعلی","Current")+'</button>'+
 '<button type="button" class="'+(mode==="suitable"?"active":"")+'" data-lo-action="mode" data-ch="'+n+'" data-mode="suitable" aria-pressed="'+(mode==="suitable")+'">○ '+tr("وضع مناسب","Suitable")+'</button></div>'+
 '<div class="lo-map-board"><span class="lo-map-axis lo-map-y">'+esc(m.y[0])+' / '+esc(m.y[1])+'</span>'+
 '<div class="lo-map-grid-head"><span>'+esc(m.x[0])+'</span><span>'+esc(m.x[1])+'</span></div>'+
 '<div class="lo-map-grid">'+grid+'</div></div>'+
 '<div class="lo-map-results"><div><small>● '+tr("فعلی","Current")+'</small><strong>'+esc(summarize(v.current))+'</strong></div><div><small>○ '+tr("مناسب","Suitable")+'</small><strong>'+esc(summarize(v.suitable))+'</strong></div></div>'+
 '<div class="lo-map-bottom"><p>'+tr("اگر شواهد ترکیبی یا ناکافی‌اند، یکی از جای‌گذاری‌ها را باز بگذارید و دلیلش را در برگه فصل بنویسید. این شکل، نمره یا رتبه تولید نمی‌کند.","If evidence is mixed or insufficient, leave a position blank and explain it in your worksheet. No personal score is calculated.")+'</p>'+
 '<button type="button" data-lo-action="clear" data-ch="'+n+'">'+tr("نامعلوم / پاک‌کردن انتخاب جاری","Unknown / Clear current placement")+'</button></div></section>';
}
function dossier(){
 const answers=book.exportData().worksheetResponses||{};
 const descriptors=[
  [1,"نمای فوری سازمان زندگی",["observations","strengths"]],
  [2,"معیارهای متناسب",["criterion1","focus"]],
  [3,"وضع موجود و مناسب",["topic","gap"]],
  [4,"فرض‌ها و موضع فلسفی",["assumption","stance"]],
  [5,"شادی و موفقیت",["scope","current"]],
  [6,"ترجیحات رفتاری",["pattern","suitable"]],
  [7,"دانستن و عمل",["knowledge","action"]],
  [8,"مدیرعاملی و بهره‌وری",["efficiency","current"]],
  [9,"رفتار و نتیجه",["behavior","outcome"]],
  [10,"زحمت، بازده و گزینه ازدست‌رفته",["opportunityCost","current"]],
  [11,"فلسفه پیشرفت من",["currentStart","suitableStart","review"]],
  [12,"نمایه و ممیزی بنیادین من",["scope","fit","next"]]
 ];
 let count=0;
 const items=descriptors.map(([n,name,keys])=>{
  const val=answers[n]||{},line=keys.map(k=>val[k]).find(t=>typeof t==="string"&&t.trim());
  if(line)count++;
  const pos=positions(n);const choice=n>=4&&pos.current!=null?maps[n].cells[Math.floor(pos.current/2)][pos.current%2]:"";
  return '<article class="lo-dossier-item"><span>'+String(n).padStart(2,"0")+'</span><div><h3>'+esc(name)+'</h3>'+
   '<p>'+esc(line?line.trim().slice(0,210):"هنوز خروجی متنی ثبت نشده است.")+'</p>'+
   (choice?'<small>'+esc("نقشه فعلی: "+choice)+'</small>':"")+'</div>'+
   '<button type="button" data-route="book1/'+n+'/workbook">'+tr("تکمیل","Open")+'</button></article>';
 }).join("");
 return '<section class="lo-dossier"><div class="lo-dossier-header"><div><span class="lo-map-kicker">INTEGRATED LIFE PROFILE · WORKBOOK</span><h2>'+tr("پرونده شناخت سازمان زندگی من","My Life Organization dossier")+'</h2></div><strong>'+count+' / 12</strong></div>'+
 '<p>'+tr("دوازده خروجی را در کنار یکدیگر می‌بینید، اما آن‌ها را به یک نمره کل یا قضاوت درباره شخصیت تبدیل نمی‌کنیم. موضوع و بازه هر فصل را در پاسخ‌های همان فصل نگه دارید.","Twelve connected learning outputs without a total life or personality score. Keep each chapter’s context and time window.")+'</p>'+
 '<div class="lo-dossier-list">'+items+'</div></section>';
}
document.addEventListener("click",e=>{
 const btn=e.target.closest?.("[data-lo-action]");if(!btn)return;
 const n=Number(btn.dataset.ch);if(!maps[n])return;
 const a=btn.dataset.loAction;
 if(a==="mode"){modes[n]=btn.dataset.mode==="suitable"?"suitable":"current";}
 if(a==="place"||a==="clear"){
  const mode=modes[n]||"current",v={...positions(n)};
  v[mode]=a==="clear"?null:Number(btn.dataset.cell);state[n]=v;save();
 }
 document.querySelectorAll('[data-lo-map="'+n+'"]').forEach(el=>{el.outerHTML=mapHtml(n)});
});
book.chapter=function(n,l){
 let h=old.chapter(n,l);
 if(maps[n])h=h.replace('<div class="lj-reading-layout">',mapHtml(n)+'<div class="lj-reading-layout">');
 return h;
};
book.worksheet=function(n,l){
 let h=old.worksheet(n,l);
 if(maps[n])h=h.replace('<form class="lb-workbook-form',mapHtml(n)+'<form class="lb-workbook-form');
 return h;
};
book.workbook=function(l){
 return old.workbook(l).replace('<div class="lb-summary-grid">',dossier()+'<div class="lb-summary-grid">');
};
book.resetAll=function(){old.reset();state={};modes={};try{localStorage.removeItem(KEY)}catch(e){}};
book.exportAll=function(){return {...(old.exportAll?old.exportAll():book.exportData()),contextMaps:state};};
})();