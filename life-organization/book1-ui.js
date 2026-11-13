/* The Life Organization · Book I, Part I · Interactive reading and workbook.
   Source text lives in book1-content.js. No AI life scoring, no backend.
   Answers stay on this device unless the reader explicitly exports them. */
(function(){
"use strict";
const SOURCE=window.LifeBookContent;
if(!SOURCE||!Array.isArray(SOURCE.chapters))return;
const STORAGE="tlo-book1-part1-workbook-v1";
const TITLES=[
 "سازمانی که همین حالا اداره می‌کنید",
 "سازمان عالی زندگی چیست؟",
 "چگونه وضع موجود و وضع مناسب را ببینیم؟"
];
const BOOK_FIELDS=[
 [
  ["domains","حوزه‌ها و تعهدات فعلی","Current domains and commitments","۵ تا ۱۰ مورد واقعی را ثبت کنید؛ قرار نیست فهرست آرزوها باشد.","List five to ten actual commitments, not aspirations."],
  ["roles","نقش‌های موجود","Roles you currently carry","کدام نقش‌ها مسئولیت واقعی ایجاد می‌کنند؟","Which roles create real responsibilities?"],
  ["resources","منابع درگیر","Resources under pressure","زمان، انرژی، توجه، پول و ظرفیت جسمی و ذهنی بیشتر کجا مصرف می‌شوند؟","Where are your time, attention, energy, money and capacity being used?"],
  ["patterns","الگوهای تکرارشونده","Recurring patterns","چه چیزهایی معمولاً هفته‌به‌هفته تکرار می‌شوند؟","Which situations recur week after week?"],
  ["environment","شرایط محیطی مؤثر","Relevant external conditions","کدام عوامل بیرونی انتخاب‌های شما را محدود یا ممکن می‌کنند؟","Which outside conditions shape your choices?"],
  ["frictions","اصطکاک‌ها و وابستگی‌ها","Friction and dependencies","کدام تعهدها برای منابع مشترک با یکدیگر برخورد می‌کنند؟","Which commitments compete for the same limited resources?"],
  ["strengths","چیزهایی که خوب کار می‌کنند","What already works","چه رابطه‌ها، عادت‌ها و حمایت‌هایی ارزش حفظ‌کردن دارند؟","Which relationships, habits and supports should you preserve?"],
  ["observations","دو مشاهده اصلی","Two most important observations","فقط دو جمله دقیق و مبتنی بر مشاهده بنویسید.","Record two precise observations, rather than labels or judgments."]
 ],
 [
  ["criterion1","معیار اول؛ چه چیزی مهم است؟","Criterion 1 · What matters?","یک معیار مرتبط با شرایط واقعی خود انتخاب کنید.","Choose a criterion that fits your real situation."],
  ["reason1","چرا معیار اول مهم است؟","Why criterion 1 matters","اهمیت آن را برای زندگی فعلی خود روشن کنید.","Explain why it matters in your present circumstances."],
  ["evidence1","شاهد یا مجهول معیار اول","Evidence or unknown for criterion 1","چه شاهدی دارید؟ اگر ندارید، «نمی‌دانم» بنویسید.","State the evidence, or explicitly say what is unknown."],
  ["criterion2","معیار دوم","Criterion 2","معیار دیگری انتخاب کنید؛ الزاماً بیشترشدن یک عدد نیست.","Choose another criterion, not necessarily a number to maximize."],
  ["reason2","چرا معیار دوم مهم است؟","Why criterion 2 matters","دلیل متناسب با نقش‌ها و منابع خود را بنویسید.","Tie the rationale to your roles and resources."],
  ["evidence2","شاهد یا مجهول معیار دوم","Evidence or unknown for criterion 2","نتیجه را از کیفیت اداره آن جدا ببینید.","Distinguish the outcome from how you achieved it."],
  ["criterion3","معیار سوم (اختیاری)","Criterion 3 (optional)","اگر لازم است، یک معیار سوم اضافه کنید.","Add a third criterion only if useful."],
  ["reason3","چرا معیار سوم مهم است؟","Why criterion 3 matters","اهمیتش را مشخص کنید، نه اینکه از دیگران تقلید کنید.","Describe its importance without copying others."],
  ["evidence3","شاهد یا مجهول معیار سوم","Evidence or unknown for criterion 3","شاهد، برداشت و مجهول را از هم جدا نگه دارید.","Separate evidence, interpretations and unknowns."],
  ["focus","موضوع منتخب برای بررسی فصل سوم","Focus for Chapter 3","یک موضوع روشن انتخاب کنید تا در فصل سوم همان را بررسی کنید.","Choose one bounded topic to examine in Chapter 3."]
 ],
 [
  ["topic","موضوع مشخص بررسی","Defined topic","به‌جای «کل زندگی»، یک موضوع قابل مشاهده را نام ببرید.","Choose one observable topic, not your whole life."],
  ["boundary","مرز بررسی و شرایط مؤثر","Scope and relevant conditions","کدام نقش، فعالیت یا موقعیت را بررسی می‌کنید؟","State exactly which role, activity or situation is in scope."],
  ["period","بازه زمانی مشاهده","Observation period","بازه مشخص و قابل مقایسه تعیین کنید.","Set a clear and comparable time window."],
  ["criterion","معیار مناسب‌بودن و دلیل آن","Fit criterion and rationale","همان معیار تعریف‌شده در فصل دوم را دقیق‌تر کنید.","Refine a criterion established in Chapter 2."],
  ["current","وضع موجود با شاهد و واحد","Current state with evidence and unit","واقعیت مشاهده‌شده، منشأ آن و واحد سنجش را مشخص کنید.","Describe observations, their source and their unit."],
  ["baseline","مقدار آغازین و تاریخ (اگر موجود است)","Baseline and date (if available)","اگر شاهدی وجود ندارد، مقدار نسازید.","Do not invent a baseline where none exists."],
  ["suitable","وضع مناسب اولیه، دلیل و زمان مرجع","Initial suitable state, rationale and timing","وضع مناسب را متناسب با شرایط خود و قابل بازنگری بنویسید.","Define a suitable, revisable state for your own circumstances."],
  ["gap","فاصله قابل مشاهده","Observable gap","فاصله را فقط در صورت وجود شاهد، دقیق توصیف کنید.","Describe the gap without turning it into a judgment of yourself."],
  ["unknown","آنچه هنوز نمی‌دانم","What I still do not know","شاهدِ گمشده را مشخص کنید؛ شکاف را با علت اشتباه نگیرید.","List missing evidence; a gap is not a diagnosis."],
  ["preserve","چیزهایی که ارزش حفظ‌کردن دارند","What is worth preserving","حتی وقتی فاصله‌ای می‌بینید، نقاط قوت موجود را ثبت کنید.","Note existing strengths even when there is a gap."],
  ["next","مشاهده بعدی","Next observation","در گام بعد، چه چیزی را دقیق‌تر مشاهده خواهید کرد؟","What will you observe next?"],
  ["review","زمان بازبینی","Review date or time","زمانی واقع‌بینانه برای مراجعه دوباره تعیین کنید.","Set a realistic point to review the evidence."]
 ]
];
let state=readState();
function readState(){
 try{
  const raw=JSON.parse(localStorage.getItem(STORAGE)||"null");
  if(raw&&typeof raw==="object"&&!Array.isArray(raw))return {
   fields:raw.fields&&typeof raw.fields==="object"?raw.fields:{},
   checked:raw.checked&&typeof raw.checked==="object"?raw.checked:{}
  };
 }catch(e){}
 return {fields:{},checked:{}};
}
function persist(){
 try{localStorage.setItem(STORAGE,JSON.stringify(state));return true}
 catch(e){return false}
}
const E=s=>String(s==null?"":s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const T=(lang,fa,en)=>lang==="en"?en:fa;
const cnum=n=>String(n).padStart(2,"0");
const sectionsMemo={};
function parse(n){
 if(sectionsMemo[n])return sectionsMemo[n];
 const book=SOURCE.chapters[n-1];
 if(!book)return [];
 const lines=book.sourceText.split(/\r?\n/);
 const parts=[{heading:"آغاز فصل",type:"intro",lines:[]}];
 for(const line of lines.slice(2)){
  if(/^(گفتار (اول|دوم|سوم|چهارم|پنجم)|ابزار فصل|پایان فصل|یادداشت‌ها و منابع فصل|پایان بخش اول)/.test(line)){
   const kind=line.startsWith("گفتار ")?"talk":line.startsWith("ابزار فصل")?"original-tool":line.startsWith("پایان فصل")?"ending":line.startsWith("یادداشت‌ها")?"references":"part-end";
   parts.push({heading:line,type:kind,lines:[]});
  }else parts[parts.length-1].lines.push(line);
 }
 sectionsMemo[n]=parts;
 return parts;
}
function talks(n){return parse(n).filter(x=>x.type==="talk")}
function completed(n){
 return parse(n).filter((section,i)=>section.type==="talk"&&state.checked[n+"-"+i]).length;
}
function totalTalks(n){return talks(n).length}
function question(n){
 const x=SOURCE.chapters[n-1].sourceText.split("\n");
 const i=x.indexOf("سؤال بزرگ فصل");
 return i>=0?x[i+1]:"";
}
function formatLine(s){
 const x=s.trim();
 if(!x)return "";
 if(/^https:\/\//.test(x)){
  try{
   const url=new URL(x);
   if(url.protocol==="https:")return '<p class="lb-source-link"><a href="'+E(url.href)+'" rel="noopener noreferrer" target="_blank" dir="ltr">'+E(x)+'</a></p>';
  }catch(e){}
 }
 const list=/^[•●▪]\s*/.test(x);
 if(list)return '<p class="lb-manuscript-bullet"><span aria-hidden="true">•</span>'+E(x.replace(/^[•●▪]\s*/,""))+'</p>';
 return '<p class="lb-manuscript-line">'+E(x)+'</p>';
}
function progressText(n,lang){
 return T(lang,"مرور "+completed(n)+" از "+totalTalks(n)+" گفتار","Reviewed "+completed(n)+" of "+totalTalks(n)+" sections");
}
function masthead(lang){
 return '<div class="lb-topline"><span>'+T(lang,"کتاب اول / بخش اول","Book One / Part One")+'</span><span dir="ltr">THE LIFE ORGANIZATION</span></div>';
}
function progressTrack(n){
 return '<div class="lb-track" aria-hidden="true"><div style="width:'+Math.round(100*completed(n)/totalTalks(n))+'%"></div></div>';
}
function ribbon(lang,chapter){
 return '<div class="lb-ribbon"><button class="lb-text-button" type="button" data-route="module/1">'+T(lang,"نمای کلی جلد اول","Book One overview")+'</button>'+
 '<span class="lb-ribbon-split" aria-hidden="true">/</span><span>'+T(lang,"فصل "+chapter,"Chapter "+chapter)+'</span></div>';
}
function landing(lang){
 const content=SOURCE.chapters.map((ch,i)=>{
  const n=i+1;
  const descriptions=[
   T(lang,"دیدن اجزا، نقش‌ها، منابع و الگوهای واقعی زندگی","Observe roles, resources and the actual patterns of your life"),
   T(lang,"معیارهای متناسب با خود را از نتایج ظاهری جدا کنیم","Clarify criteria that fit you, beyond apparent results"),
   T(lang,"توصیف شاهددار وضع موجود، وضع مناسب و فاصله آنها","Compare present and suitable states using evidence")
  ];
  return '<article class="lb-chapter-tile"><div class="lb-tile-top"><span class="lb-chapter-number">'+cnum(n)+'</span><span class="lb-tile-status">'+progressText(n,lang)+'</span></div>'+
   '<h3>'+E(T(lang,ch.title,ch.englishTitle))+'</h3><p>'+descriptions[i]+'</p>'+
   progressTrack(n)+'<div class="lb-tile-actions"><button class="lb-button lb-button-primary" type="button" data-route="book1/'+n+'">'+T(lang,"مطالعه فصل","Read chapter")+'</button>'+
   '<button class="lb-button lb-button-quiet" type="button" data-route="book1/'+n+'/workbook">'+T(lang,"ابزار فصل","Worksheet")+'</button></div></article>';
 }).join("");
 return '<div class="lb-root lb-landing">'+masthead(lang)+
 '<section class="lb-cover"><div class="lb-cover-orbit" aria-hidden="true"><span>01</span><i></i><i></i><i></i></div><div class="lb-cover-copy"><p class="lb-eyebrow">BOOK I · THE FOUNDATION</p>'+
 '<h1>'+T(lang,"من کجای زندگی ایستاده‌ام؟","Where do I stand in my life?")+'</h1>'+
 '<p class="lb-cover-intro">'+T(lang,"بخش اول: دیدن سازمان زندگی. پیش از تغییر، یاد می‌گیریم چگونه زندگی را ببینیم، معیارهای خود را روشن کنیم و درباره فاصله‌ها با شواهد حرف بزنیم.","Part One: Seeing your life organization. Before changing it, learn to observe, define your criteria and compare states with evidence.")+'</p>'+
 '<div class="lb-cover-buttons"><button class="lb-button lb-button-light" type="button" data-route="book1/1">'+T(lang,"شروع فصل اول","Start Chapter 1")+'</button>'+
 '<button class="lb-button lb-button-outline-light" type="button" data-route="book1/workbook">'+T(lang,"دفتر کار سه فصل","Three-chapter workbook")+'</button></div></div></section>'+
 '<div class="lb-intro-statement"><span>01</span><p>'+T(lang,"ببینیم چه چیزی هست","Observe what is")+'</p><span class="lb-chevron">›</span><span>02</span><p>'+T(lang,"روشن کنیم چه چیزی مهم است","Clarify what matters")+'</p><span class="lb-chevron">›</span><span>03</span><p>'+T(lang,"شاهد و فاصله را مقایسه کنیم","Compare evidence and gaps")+'</p></div>'+
 '<div class="lb-section-header"><div><p class="lb-eyebrow">THREE CONNECTED CHAPTERS</p><h2>'+T(lang,"مسیر مطالعه و تمرین","Your reading and practice journey")+'</h2></div><span class="lb-muted">'+T(lang,"بدون نمره‌دهی به زندگی","No life score")+'</span></div>'+
 '<div class="lb-tiles">'+content+'</div>'+
 '<section class="lb-journal-teaser"><div><h2>'+T(lang,"دفتر کار یکپارچه من","My connected workbook")+'</h2><p>'+T(lang,"خروجی‌های سه فصل به هم متصل‌اند: نمای فوری، معیارهای اولیه و برگه وضع موجود/مناسب. یادداشت‌ها فقط در همین مرورگر ذخیره می‌شوند.","Your snapshot, initial criteria and current/suitable-state sheet form one coherent workbook. Notes are stored only in this browser.")+'</p></div>'+
 '<button type="button" class="lb-button lb-button-primary" data-route="book1/workbook">'+T(lang,"مشاهده دفتر کار","Open workbook")+'</button></section>'+
 '<p class="lb-privacy">'+T(lang,"این نسخه ابزار تأمل آموزشی است، نه آزمون روان‌شناختی یا ارزیابی استاندارد. اطلاعات محرمانه وارد نکنید؛ ذخیره‌سازی Local و رمزنگاری‌نشده است.","These are learning and reflection tools, not validated psychometric assessments. Avoid sensitive information; local storage is unencrypted.")+'</p></div>';
}
function chapterPage(n,lang){
 const ch=SOURCE.chapters[n-1];
 if(!ch)return landing(lang);
 const parts=parse(n);
 const isEn=lang==="en";
 const tabs=SOURCE.chapters.map((x,i)=>{
  const id=i+1;
  return '<button type="button" data-route="book1/'+id+'" class="lb-chapter-tab'+(id===n?" current":"")+'" '+(id===n?'aria-current="page"':"")+'><span>'+cnum(id)+'</span>'+E(T(lang,x.title,x.englishTitle))+'</button>';
 }).join("");
 const content=parts.map((part,i)=>{
  const talk=part.type==="talk",done=!!state.checked[n+"-"+i];
  const heading=i===0?T(lang,"آغاز فصل و اهداف یادگیری","Chapter opening and learning goals"):part.heading;
  const original=part.lines.map(formatLine).join("");
  const badge=part.type==="references"?"REFERENCE NOTES":part.type==="original-tool"?"SOURCE WORKSHEET":part.type==="part-end"?"PART ONE COMPLETE":talk?"READING":"REFLECTION";
  const btn=talk?'<button type="button" class="lb-mark'+(done?" is-done":"")+'" data-lb-action="mark" data-chapter="'+n+'" data-section="'+i+'" aria-pressed="'+done+'">'+(done?T(lang,"✓ مرور شد","✓ Reviewed"):T(lang,"علامت‌گذاری: مطالعه شد","Mark as reviewed"))+'</button>':"";
  return '<details id="lb-sec-'+n+'-'+i+'" class="lb-reading-panel lb-reading-'+part.type+'" '+(i===0||i===1?"open":"")+'>'+
    '<summary><div><span class="lb-panel-label">'+badge+'</span><h3>'+E(heading)+'</h3></div><span class="lb-expand-icon" aria-hidden="true">⌄</span></summary>'+
    '<div class="lb-panel-body" lang="fa" dir="rtl">'+original+btn+'</div></details>';
 }).join("");
 const jump=parts.filter(p=>p.type==="talk").map(p=>{const index=parts.indexOf(p);return '<button type="button" data-lb-action="jump" data-target="lb-sec-'+n+'-'+index+'">'+E(p.heading.replace(/^گفتار (اول|دوم|سوم|چهارم|پنجم)\s+/,""))+'</button>';}).join("");
 const next=n<3?'<button type="button" class="lb-button lb-button-primary" data-route="book1/'+(n+1)+'">'+T(lang,"فصل بعدی","Next chapter")+'</button>':'<button type="button" class="lb-button lb-button-primary" data-route="book1/workbook">'+T(lang,"مرور خروجی سه فصل","Review all three outputs")+'</button>';
 return '<div class="lb-root lb-reader">'+ribbon(lang,n)+masthead(lang)+
 '<section class="lb-chapter-hero"><div class="lb-hero-meta"><span>'+T(lang,"فصل "+n+" از ۳","Chapter "+n+" of 3")+'</span><span dir="ltr">BOOK ONE · PART I</span></div>'+
 '<h1>'+E(T(lang,ch.title,ch.englishTitle))+'</h1><p class="lb-original-title">'+T(lang,"متن کامل نسخه نهایی فارسی","Full Persian edition")+'</p>'+
 '<div class="lb-big-question"><small>'+T(lang,"سؤال بزرگ فصل","Core chapter question")+'</small><strong lang="fa" dir="rtl">'+E(question(n))+'</strong></div>'+
 '<div class="lb-read-meta"><span data-lb-progress="'+n+'">'+progressText(n,lang)+'</span><span>'+T(lang,"مطالعه در گفتارهای قابل‌بازشدن","Expandable reading sections")+'</span></div>'+progressTrack(n)+'</section>'+
 '<nav class="lb-chapter-tabs" aria-label="Book One chapters">'+tabs+'</nav>'+
 '<div class="lb-reader-toolbar"><div><h2>'+T(lang,"متن فصل و منابع","Chapter text and references")+'</h2><p>'+T(lang,"برای مطالعه، هر گفتار را باز کنید. متن اصلی بدون تلخیص آمده است.","Open each section to read. The Persian manuscript is presented without summarization.")+'</p></div>'+
 '<button type="button" class="lb-button lb-button-primary" data-route="book1/'+n+'/workbook">'+T(lang,"ورود به ابزار فصل","Open chapter worksheet")+'</button></div>'+
 '<div class="lb-jump-list" aria-label="Chapter section navigation">'+jump+'</div>'+
 '<div class="lb-reading-stack">'+content+'</div>'+
 '<section class="lb-reflection-prompt"><span class="lb-eyebrow">REFLECT · APPLY · LEARN</span><h2>'+T(lang,"از مطالعه به مشاهده","From reading to observation")+'</h2>'+
 '<p>'+T(lang,"قرار نیست خودتان را با دیگران مقایسه کنید. این فصل را به یک مشاهده روشن و قابل استفاده در دفتر کار تبدیل کنید.","The point is not comparison with other people. Turn the chapter into an observation you can use in your workbook.")+'</p>'+
 '<button type="button" class="lb-button lb-button-primary" data-route="book1/'+n+'/workbook">'+T(lang,"ثبت خروجی فصل "+n,"Capture Chapter "+n+" output")+'</button></section>'+
 '<div class="lb-page-bottom"><button class="lb-button lb-button-quiet" type="button" data-route="module/1">'+T(lang,"بازگشت به مسیر سه فصل","Back to chapters")+'</button>'+next+'</div>'+
 '<p class="lb-manuscript-note">'+T(lang,"منبع: Book1_Part1_FINAL_v1.0_FA. روایت‌ها و شخصیت‌ها آموزشی و فرضی‌اند. منابع علمی در انتهای هر فصل درج شده‌اند.","Source: Book1_Part1_FINAL_v1.0_FA. Characters and situations are fictional teaching examples; references are included at each chapter’s end.")+'</p></div>';
}
function fieldValue(n,key){
 const group=state.fields[n];
 return group&&typeof group[key]==="string"?group[key]:"";
}
function fieldsFilled(n){return BOOK_FIELDS[n-1].filter(x=>fieldValue(n,x[0]).trim()).length}
function worksheetPage(n,lang){
 if(!(n>=1&&n<=3))return workbookOverview(lang);
 const ch=SOURCE.chapters[n-1],fs=BOOK_FIELDS[n-1];
 const total=fs.length;
 const title=T(lang,["نمای فوری سازمان زندگی من","معیارهای اولیه زندگی من","برگه وضع موجود و وضع مناسب"][n-1],["My Life Organization Snapshot","My Initial Fit Criteria","Current and Suitable States"][n-1]);
 const fields=fs.map((f,i)=>{
  const id="lb-input-"+n+"-"+f[0];
  return '<div class="lb-form-field '+(n===3&&["current","suitable","gap"].includes(f[0])?"lb-field-major":"")+'">'+
   '<label for="'+id+'"><span class="lb-field-number">'+cnum(i+1)+'</span>'+E(T(lang,f[1],f[2]))+'</label>'+
   '<p>'+E(T(lang,f[3],f[4]))+'</p>'+
   '<textarea id="'+id+'" data-lb-field="'+E(f[0])+'" data-chapter="'+n+'" rows="4" maxlength="1800" placeholder="'+E(T(lang,"مشاهده خود را بنویسید؛ «نمی‌دانم» هم یک پاسخ معتبر است.","Write your observation. Saying “I don’t know yet” is valid."))+'">'+E(fieldValue(n,f[0]))+'</textarea></div>';
 }).join("");
 const next=n<3?'<button class="lb-button lb-button-primary" data-route="book1/'+(n+1)+'/workbook">'+T(lang,"ابزار فصل بعدی","Next worksheet")+'</button>':'<button class="lb-button lb-button-primary" data-route="book1/workbook">'+T(lang,"جمع‌بندی سه فصل","Review three chapters")+'</button>';
 return '<div class="lb-root lb-workbook-page">'+ribbon(lang,n)+masthead(lang)+
 '<section class="lb-worksheet-hero"><div class="lb-eyebrow">'+T(lang,"WORKBOOK · فصل "+cnum(n),"WORKBOOK · CHAPTER "+cnum(n))+'</div><h1>'+title+'</h1>'+
 '<p>'+T(lang,"این یک برگه مشاهده و بازاندیشی است، نه آزمون یا نمره زندگی. پاسخ‌ها فقط در دستگاه شما ذخیره می‌شوند.","This is a learning and reflection worksheet, not a diagnostic test or life score. Answers remain on this device.")+'</p>'+
 '<div class="lb-worksheet-meta"><strong>'+T(lang,fieldsFilled(n)+" از "+total+" بخش دارای یادداشت",fieldsFilled(n)+" of "+total+" prompts filled")+'</strong><span id="lb-save-status" role="status">'+T(lang,"ذخیره محلی خودکار","Auto-saved locally")+'</span></div></section>'+
 '<div class="lb-workbook-nav"><button class="lb-button lb-button-quiet" data-route="book1/'+n+'">'+T(lang,"مطالعه متن اصلی","Read original chapter")+'</button><button class="lb-button lb-button-quiet" data-route="book1/workbook">'+T(lang,"نمای کلی دفتر کار","Workbook overview")+'</button></div>'+
 '<form class="lb-workbook-form" autocomplete="off">'+fields+'</form>'+
 '<div class="lb-workbook-actions"><button class="lb-button lb-button-quiet" type="button" data-lb-action="download-text">'+T(lang,"دریافت نسخه متنی سه فصل","Export readable workbook")+'</button>'+
 '<button class="lb-button lb-button-quiet" type="button" data-lb-action="download-json">'+T(lang,"پشتیبان داده‌ها JSON","Backup JSON")+'</button>'+
 '<button class="lb-button lb-button-danger" type="button" data-lb-action="clear-chapter" data-chapter="'+n+'">'+T(lang,"پاک‌کردن پاسخ‌های این فصل","Clear this chapter’s answers")+'</button></div>'+
 '<div class="lb-page-bottom"><button class="lb-button lb-button-outline" data-route="module/1">'+T(lang,"مسیر سه فصل","All three chapters")+'</button>'+next+'</div>'+
 '<p class="lb-privacy">'+T(lang,"هشدار حریم خصوصی: ذخیره‌سازی این نسخه از نوع LocalStorage و رمزنگاری‌نشده است. برای حفظ اطلاعات مهم، Export بگیرید؛ پاک‌کردن داده مرورگر می‌تواند پاسخ‌ها را حذف کند.","Privacy notice: This version uses unencrypted browser storage. Export important notes; clearing browser data can remove them.")+'</p></div>';
}
function workbookOverview(lang){
 const tiles=SOURCE.chapters.map((ch,i)=>{
  const n=i+1,num=fieldsFilled(n),fs=BOOK_FIELDS[i];
  const previews=fs.filter(f=>fieldValue(n,f[0]).trim()).slice(0,2).map(f=>
   '<p class="lb-workbook-preview"><strong>'+E(T(lang,f[1],f[2]))+': </strong>'+E(fieldValue(n,f[0]).trim().slice(0,155))+'</p>').join("");
  return '<article class="lb-summary-card"><div class="lb-summary-top"><span class="lb-chapter-number">'+cnum(n)+'</span><span>'+T(lang,num+" از "+fs.length+" یادداشت",num+" of "+fs.length+" prompts")+'</span></div>'+
  '<h2>'+E(T(lang,ch.title,ch.englishTitle))+'</h2>'+(previews||'<p class="lb-empty">'+T(lang,"هنوز یادداشتی ثبت نشده است.","No notes captured yet.")+'</p>')+
  '<button class="lb-button lb-button-primary" data-route="book1/'+n+'/workbook">'+T(lang,"بازکردن برگه","Open worksheet")+'</button></article>';
 }).join("");
 return '<div class="lb-root lb-summary">'+masthead(lang)+
 '<div class="lb-ribbon"><button class="lb-text-button" type="button" data-route="module/1">'+T(lang,"بازگشت به جلد اول","Back to Book One")+'</button></div>'+
 '<section class="lb-worksheet-hero"><div class="lb-eyebrow">THE CONNECTED WORKBOOK</div><h1>'+T(lang,"دفتر کار یکپارچه سه فصل","Your connected three-chapter workbook")+'</h1>'+
 '<p>'+T(lang,"سه خروجی به هم پیوسته‌اند: تصویر واقعی زندگی، معیارهای مناسب‌بودن و نخستین مقایسه وضع موجود و مناسب. جای خالی و «نمی‌دانم» هم بخشی از یادگیری‌اند.","Your snapshot, fit criteria and initial current/suitable-state comparison build on one another. Unanswered questions are part of the learning process.")+'</p></section>'+
 '<div class="lb-summary-flow"><span>'+T(lang,"مشاهده","Observe")+'</span><b>→</b><span>'+T(lang,"معیار","Criteria")+'</span><b>→</b><span>'+T(lang,"مقایسه","Compare")+'</span></div>'+
 '<div class="lb-summary-grid">'+tiles+'</div>'+
 '<section class="lb-download-card"><div><h2>'+T(lang,"پشتیبان و خروجی شخصی","Back up and export your work")+'</h2><p>'+T(lang,"خروجی متنی قابل مطالعه یا فایل JSON قابل بازیابی دریافت کنید. هیچ داده‌ای به سرور ارسال نمی‌شود.","Download a readable text report or JSON backup. No data is transmitted to a server.")+'</p></div>'+
 '<div class="lb-download-actions"><button class="lb-button lb-button-primary" data-lb-action="download-text">'+T(lang,"دریافت دفتر کار TXT","Download TXT")+'</button>'+
 '<button class="lb-button lb-button-outline" data-lb-action="download-json">'+T(lang,"دریافت پشتیبان JSON","Download JSON")+'</button></div></section>'+
 '<p class="lb-privacy">'+T(lang,"تعداد یادداشت‌ها نشان‌دهنده میزان تکمیل فرم است، نه کیفیت زندگی، مهارت یا رشد فردی شما.","The number of filled prompts reflects form completion only, not personal capability or quality of life.")+'</p></div>';
}
function homeFeature(lang){
 return '<section class="lb-home-feature"><div class="lb-home-emblem" aria-hidden="true">01</div><div><p class="lb-eyebrow">BOOK ONE · AVAILABLE NOW</p>'+
 '<h2>'+T(lang,"سه فصل اول، آماده مطالعه و تمرین","Three chapters ready to read and practice")+'</h2><p>'+T(lang,"متن کامل نسخه نهایی، روایت‌ها، منابع علمی و سه ابزار متصل در Workbook.","Full source text, narratives, references and a connected three-part workbook.")+'</p></div>'+
 '<button class="lb-button lb-button-primary" type="button" data-route="module/1">'+T(lang,"ورود به جلد اول","Open Book One")+'</button></section>';
}
function download(filename,text,kind){
 const url=URL.createObjectURL(new Blob([text],{type:kind+";charset=utf-8"}));
 const a=document.createElement("a");a.href=url;a.download=filename;document.body.appendChild(a);a.click();a.remove();
 setTimeout(()=>URL.revokeObjectURL(url),1000);
}
function exportData(){
 return {format:"tlo-book1-workbook-v1",manuscript:SOURCE.version,exportedAt:new Date().toISOString(),
  completedReadingSections:state.checked,worksheetResponses:state.fields};
}
function downloadText(){
 const out=["سازمان عالی زندگی من — دفتر کار بخش اول","منبع: "+SOURCE.version,"تاریخ خروجی: "+new Date().toLocaleString("fa-IR"),""];
 SOURCE.chapters.forEach((ch,i)=>{
  const n=i+1;
  out.push("════════════════════════════════","فصل "+n+" — "+ch.title,"");
  BOOK_FIELDS[i].forEach(f=>{out.push(f[1]);out.push(fieldValue(n,f[0]).trim()||"—");out.push("");});
 });
 download("life-organization-book1-workbook.txt",out.join("\n"),"text/plain");
}
function updateProgress(n){
 const el=document.querySelector('[data-lb-progress="'+n+'"]');
 if(el)el.textContent=progressText(n,document.documentElement.lang);
 const track=document.querySelector(".lb-chapter-hero .lb-track>div");
 if(track)track.style.width=Math.round(100*completed(n)/totalTalks(n))+"%";
}
document.addEventListener("submit",function(e){if(e.target.matches(".lb-workbook-form"))e.preventDefault();});
document.addEventListener("input",function(e){
 const field=e.target.closest("[data-lb-field]");
 if(!field)return;
 const n=Number(field.dataset.chapter),key=field.dataset.lbField;
 if(!(n>=1&&n<=3)||!BOOK_FIELDS[n-1].some(f=>f[0]===key))return;
 if(!state.fields[n]||typeof state.fields[n]!=="object")state.fields[n]={};
 state.fields[n][key]=field.value.slice(0,1800);
 const status=document.getElementById("lb-save-status");
 const saved=persist();
 if(status)status.textContent=saved?"ذخیره شد · Saved locally":"ذخیره ممکن نشد · Export now";
});
document.addEventListener("click",function(e){
 const el=e.target.closest("[data-lb-action]");
 if(!el)return;
 const action=el.dataset.lbAction;
 if(action==="mark"){
  const n=Number(el.dataset.chapter),i=Number(el.dataset.section);
  if(!(n>=1&&n<=3)||!parse(n)[i]||parse(n)[i].type!=="talk")return;
  const key=n+"-"+i;state.checked[key]=!state.checked[key];persist();
  const yes=!!state.checked[key],lang=document.documentElement.lang;
  el.classList.toggle("is-done",yes);el.setAttribute("aria-pressed",String(yes));
  el.textContent=yes?T(lang,"✓ مرور شد","✓ Reviewed"):T(lang,"علامت‌گذاری: مطالعه شد","Mark as reviewed");
  updateProgress(n);
 }
 if(action==="jump"){
  const target=document.getElementById(el.dataset.target);
  if(target){target.open=true;target.scrollIntoView({behavior:"smooth",block:"start"});}
 }
 if(action==="download-json")download("life-organization-book1-backup.json",JSON.stringify(exportData(),null,2),"application/json");
 if(action==="download-text")downloadText();
 if(action==="clear-chapter"){
  const n=Number(el.dataset.chapter);
  if(n>=1&&n<=3&&confirm(T(document.documentElement.lang,"پاسخ‌های این فصل از این مرورگر پاک شوند؟","Delete this chapter’s answers from this browser?"))){
   delete state.fields[n];persist();window.dispatchEvent(new HashChangeEvent("hashchange"));
  }
 }
});
function resetAll(){state={fields:{},checked:{}};try{localStorage.removeItem(STORAGE)}catch(e){}}
window.LifeBook={
 landing:landing,chapter:chapterPage,worksheet:worksheetPage,workbook:workbookOverview,homeFeature:homeFeature,
 progress:function(){return SOURCE.chapters.map(ch=>({chapter:ch.id,reviewed:completed(ch.id),sections:totalTalks(ch.id),filled:fieldsFilled(ch.id),fields:BOOK_FIELDS[ch.id-1].length}))},
 exportData:exportData,resetAll:resetAll
};
})();