/* The Life Organization · Guided Learning Journey v0.3
 * Coaching and mentoring prompts are editorial guidance, not an AI conversation.
 * Coins and XP recognize learning actions only; never a life quality score.
 * All data remains in unencrypted local browser storage, with no network transfer. */
(function(){
"use strict";
if(!window.LifeBook||!window.LifeBookContent)return;
const ORIGINAL={
 landing:window.LifeBook.landing,chapter:window.LifeBook.chapter,
 worksheet:window.LifeBook.worksheet,workbook:window.LifeBook.workbook,
 homeFeature:window.LifeBook.homeFeature,resetAll:window.LifeBook.resetAll,
 exportData:window.LifeBook.exportData
};
const BOOK=window.LifeBookContent;
const KEY="tlo-guided-learning-v03";
const READING={xp:15,coins:5};
const PRACTICE={xp:45,coins:15};
const BADGES=[
 {id:"observe",chapter:1,fa:"کاوشگر سازمان زندگی",en:"LIFE OBSERVER",accent:"#58c5b2",symbol:"✦",tag:"OBSERVE"},
 {id:"fit",chapter:2,fa:"معمار تناسب",en:"FIT ARCHITECT",accent:"#e8b96d",symbol:"◇",tag:"FIT"},
 {id:"evidence",chapter:3,fa:"کاوشگر شواهد",en:"EVIDENCE EXPLORER",accent:"#9cb3f5",symbol:"✧",tag:"EVIDENCE"},
 {id:"foundation",chapter:0,fa:"معمار شناخت زندگی",en:"FOUNDATION BUILDER",accent:"#f3d08c",symbol:"✺",tag:"THE FOUNDATION"}
];
const COACH={
 1:[
  ["پیش از هر تغییر، چه چیزی را می‌خواهی دقیق‌تر ببینی؟","Before making changes, what do you want to observe more clearly?"],
  ["چه تعهد تازه‌ای وارد شده بی‌آنکه ظرفیتی آزاد شده باشد؟","What new commitment entered your life without new capacity?"],
  ["چه ارتباطی میان نقش‌ها و منابع مشترک توجه تو را جلب می‌کند؟","Which interaction between roles and shared resources stands out?"],
  ["کدام گلایه کلی را می‌توانی به یک سؤال قابل مشاهده تبدیل کنی؟","Which general complaint could become an observable question?"],
  ["در نمای فوری خود، چه چیزی خوب کار می‌کند و باید حفظ شود؟","What already works in your snapshot and deserves to be preserved?"],
  ["یک مشاهده روشن کافی است؛ قرار نیست تمام زندگی را اصلاح کنی.","One clear observation is enough. You do not need to fix everything."],
  ["پیش از عبور، یک نکته را به تجربه واقعی خود ربط بده.","Before moving on, connect one insight to your lived experience."],
  ["منابع فصل را به‌عنوان پشتوانه تحلیل ببین، نه نسخه‌ای برای همه.","Treat the sources as analytical foundations, not universal prescriptions."]
 ],
 2:[
  ["موفقیت ظاهری و کیفیت اداره زندگی لزوماً یکسان نیستند؛ تفاوتشان برای تو کجاست؟","An apparent success and a well-managed life are not always the same. Where do they differ for you?"],
  ["کدام نتیجه ارزشمند را به هزینه نادیده‌گرفته‌شده به دست می‌آوری؟","Which valuable outcome might come with an overlooked cost?"],
  ["چه چیزی در شرایط شخصی تو باعث می‌شود یک معیار مناسب باشد؟","What makes a criterion suitable for your circumstances?"],
  ["کجا شواهد واقعی داری و کجا صرفاً برداشت شخصی؟","Where do you have evidence, and where only an interpretation?"],
  ["دو معیار اولیه و قابل بازنگری بهتر از یک نمره کلی و قطعی‌اند.","Two revisable criteria are more useful than a definitive overall score."],
  ["معیارها راهنمای مشاهده‌اند؛ ابزار مقایسه خودت با دیگران نیستند.","Criteria guide observation; they are not a ranking against other people."],
  ["چه پرسشی را برای مشاهده دقیق‌تر به فصل بعد می‌بری؟","Which question will you investigate more precisely next?"],
  ["منطق تعالی را برای یادگیری استفاده کن، نه کمال‌گرایی.","Use excellence thinking to learn, not to demand perfection."]
 ],
 3:[
  ["یک موضوع قابل مشاهده را انتخاب کن؛ قرار نیست کل زندگی را اندازه بگیری.","Choose one observable subject, rather than measuring your entire life."],
  ["مرز بررسی را چقدر روشن کرده‌ای؟ نقش، موضوع و بازه را ثابت نگه دار.","How clear is the scope? Keep the role, topic and time window consistent."],
  ["چه شاهدی واقعاً درباره وضع موجود داری و چه چیزی مجهول مانده است؟","What evidence describes the present state, and what remains unknown?"],
  ["وضع مناسب برای تو با توجه به شرایط و ظرفیتت چه شکلی دارد؟","What would a suitable state look like given your circumstances and capacity?"],
  ["فاصله را با علت آن یا ارزش شخصی خودت یکی نگیر.","Do not confuse the gap with its cause or with your personal worth."],
  ["اگر فقط یک مشاهده بعدی انتخاب کنی، چه خواهد بود؟","If you chose just one next observation, what would it be?"],
  ["اکنون می‌توانی سه برگه را کنار هم ببینی و یک مجهول را دقیق‌تر نام ببری.","You can now put the three sheets together and name one unknown more precisely."],
  ["نتیجه‌گیری شتاب‌زده لازم نیست؛ شفافیت صورت مسئله خودش پیشرفت است.","Avoid premature conclusions; greater clarity is meaningful progress."],
  ["برای ادامه، معیارهایی را که پشت انتخاب‌هایت هستند بررسی کن.","Next, explore the assumptions behind your choices."]
 ]
};
const FOLLOW=[
 ["دیدن رابطه میان اجزا، پایه تحلیل بهتر است. چه چیزی از قبل برایت روشن‌تر شد؟","Noticing connections sets a foundation for better analysis. What has become clearer?"],
 ["مهم‌ترین معیار، معیاری است که با شرایط تو تناسب داشته باشد. چه چیزی را می‌خواهی بیشتر بررسی کنی؟","A useful criterion fits your circumstances. What deserves closer examination?"],
 ["شناخت مجهول نیز یک دستاورد است. برای مشاهده بعدی به چه شاهدی نیاز داری؟","Recognizing an unknown is progress. What evidence would help next?"]
];
const REST=[
 ["ایستگاه مکث اول","قرار نیست هر مرحله به تصمیم فوری ختم شود. فقط یک چیز ارزشمند در زندگی کنونی‌ات را به یاد بیاور.","Reflection stop one","Not every step needs an immediate decision. Remember one thing that currently works."],
 ["ایستگاه مکث دوم","یک معیار مهم را انتخاب کن و بپرس: این معیار از ارزش‌های خودم آمده یا از مقایسه با دیگران؟","Reflection stop two","Choose one criterion and ask: does it come from my values or from comparisons?"]
];
function read(){
 try{
  const raw=JSON.parse(localStorage.getItem(KEY)||"null");
  if(raw&&typeof raw==="object"&&!Array.isArray(raw)){
   return {
    claimed:raw.claimed&&typeof raw.claimed==="object"?raw.claimed:{},
    practice:raw.practice&&typeof raw.practice==="object"?raw.practice:{},
    notes:raw.notes&&typeof raw.notes==="object"?raw.notes:{},
    view:raw.view&&typeof raw.view==="object"?raw.view:{},
    formPage:raw.formPage&&typeof raw.formPage==="object"?raw.formPage:{}
   };
  }
 }catch(e){}
 return {claimed:{},practice:{},notes:{},view:{},formPage:{}};
}
let game=read();
function persist(){
 try{localStorage.setItem(KEY,JSON.stringify(game));return true}catch(e){return false}
}
const T=(l,fa,en)=>l==="en"?en:fa;
const E=v=>String(v==null?"":v).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const leading=n=>String(n).padStart(2,"0");
const lines={};
function parse(n){
 if(lines[n])return lines[n];
 const ch=BOOK.chapters[n-1];
 if(!ch)return [];
 const groups=[{type:"intro",title:"آغاز فصل",lines:[]}];
 for(const row of ch.sourceText.split(/\r?\n/).slice(2)){
  if(/^(گفتار (اول|دوم|سوم|چهارم|پنجم)|ابزار فصل|پایان فصل|یادداشت‌ها و منابع فصل|پایان بخش اول)/.test(row)){
   const type=row.startsWith("گفتار ")?"talk":row.startsWith("ابزار فصل")?"tool":row.startsWith("پایان فصل")?"ending":row.startsWith("یادداشت‌ها")?"reference":"partend";
   groups.push({type,title:row,lines:[]});
  }else groups[groups.length-1].lines.push(row);
 }
 lines[n]=groups;return groups;
}
function spread(group){
 const items=group.lines.filter(line=>line.trim());
 const pages=[];let page=[],count=0;
 for(const p of items){
  if(page.length&&(count+p.length>1650||page.length>=7)){
   pages.push(page);page=[];count=0;
  }
  page.push(p);count+=p.length;
 }
 if(page.length)pages.push(page);
 return pages.length?pages:[[]];
}
function auditProgress(){
 const out=ORIGINAL.exportData();
 return out.completedReadingSections||{};
}
function ownedReading(n){return parse(n).reduce((num,part,i)=>num+(part.type==="talk"&&game.claimed["read:"+n+"-"+i]?1:0),0)}
function talkTotal(n){return parse(n).filter(s=>s.type==="talk").length}
function awards(){
 let xp=0,coins=0;
 for(const a of Object.values(game.claimed)){if(a&&typeof a==="object"){xp+=a.xp||0;coins+=a.coins||0}}
 return {xp,coins,reads:[1,2,3].reduce((s,n)=>s+ownedReading(n),0),practices:[1,2,3].filter(n=>game.practice[n]).length};
}
function badgeUnlocked(id){
 if(id==="foundation")return [1,2,3].every(n=>ownedReading(n)===talkTotal(n)&&!!game.practice[n]);
 const b=BADGES.find(x=>x.id===id);return !!b&&ownedReading(b.chapter)===talkTotal(b.chapter)&&!!game.practice[b.chapter];
}
function earnedBadgeIds(){return BADGES.filter(b=>badgeUnlocked(b.id)).map(b=>b.id)}
function sync(){
 const prior=auditProgress();let change=false;
 for(const [key,done] of Object.entries(prior)){
  if(!done)continue;
  const m=/^([1-3])-([0-9]+)$/.exec(key);
  if(!m)continue;
  const n=Number(m[1]),i=Number(m[2]);
  if(parse(n)[i]?.type!=="talk")continue;
  const k="read:"+key;
  if(!game.claimed[k]){game.claimed[k]={...READING,at:new Date().toISOString()};change=true}
 }
 for(let n=1;n<=3;n++)if(game.practice[n]&&!game.claimed["practice:"+n]){
  game.claimed["practice:"+n]={...PRACTICE,at:new Date().toISOString()};change=true;
 }
 if(change)persist();
}
sync();
function bank(l,compact=false){
 const a=awards(),b=earnedBadgeIds().length;
 return '<div class="lj-bank'+(compact?" lj-bank-compact":"")+'" aria-label="'+T(l,"پیشرفت مسیر یادگیری","Learning journey progress")+'">'+
 '<span class="lj-bank-item"><span class="lj-bank-icon lj-xp-icon" aria-hidden="true">✧</span><strong>'+a.xp+'</strong><small>'+T(l,"XP یادگیری","Learning XP")+'</small></span>'+
 '<span class="lj-bank-item"><span class="lj-bank-icon lj-coin-icon" aria-hidden="true">◈</span><strong>'+a.coins+'</strong><small>'+T(l,"سکه مسیر","Journey coins")+'</small></span>'+
 '<span class="lj-bank-item"><span class="lj-bank-icon lj-badge-icon" aria-hidden="true">✦</span><strong>'+b+' / 4</strong><small>'+T(l,"نشان","Badges")+'</small></span></div>';
}
function stageLabel(s,n,l){
 if(s.type==="intro")return T(l,"شروع و هدف فصل","Chapter opening");
 if(s.type==="talk")return s.title.replace(/^گفتار\s+(اول|دوم|سوم|چهارم|پنجم)\s+/,"");
 if(s.type==="tool")return T(l,"ابزار اصلی کتاب","Source worksheet");
 if(s.type==="ending")return T(l,"مکث و جمع‌بندی","Closing reflection");
 if(s.type==="reference")return T(l,"منابع علمی","Research notes");
 return T(l,"پایان بخش اول","End of Part One");
}
function stageTypeLabel(s,l){
 const x={intro:["آغاز مسیر","WELCOME"],talk:["مطالعه و کشف","READ & EXPLORE"],tool:["کاربست","PRACTICE"],ending:["جمع‌بندی","REFLECT"],reference:["منابع","SOURCES"],partend:["نقطه اتصال","BRIDGE"]}[s.type];
 return T(l,x[0],x[1]);
}
function stageHint(n,index,l){
 const c=COACH[n],pos=Math.min(c.length-1,index);
 return T(l,c[pos][0],c[pos][1]);
}
function formatLine(line){
 const x=line.trim();
 if(!x)return "";
 if(/^https:\/\//.test(x)){
  try{const u=new URL(x);if(u.protocol==="https:")return '<p class="lj-source"><a href="'+E(u.href)+'" target="_blank" rel="noopener noreferrer" dir="ltr">'+E(x)+'</a></p>';}catch(e){}
 }
 if(/^[•●▪]/.test(x))return '<p class="lj-bullet"><span aria-hidden="true">✦</span>'+E(x.replace(/^[•●▪]\s*/,""))+'</p>';
 if(/^(سؤال بزرگ فصل|در پایان این فصل|هدف این فصل|در سازمان زندگی|در سازمان|بخش اول|دیدن سازمان زندگی)$/.test(x))return '<h4 class="lj-inline-heading">'+E(x)+'</h4>';
 return '<p class="lj-paragraph">'+E(x)+'</p>';
}
function badgeSvg(id){
 const b=BADGES.find(x=>x.id===id)||BADGES[0];
 const safe=id.replace(/[^a-z0-9]/g,"");
 const extra=id==="foundation"?"<path d='M360 220L396 298L482 306L418 363L436 448L360 407L284 448L302 363L238 306L324 298Z' fill='#f4cb7f' stroke='#fff4c6' stroke-width='6'/>":
 '<circle cx="360" cy="343" r="111" fill="none" stroke="'+b.accent+'" stroke-width="9" stroke-dasharray="8 18"/>'+
 '<path d="M360 247L389 316L465 343L389 371L360 442L331 371L255 343L331 316Z" fill="'+b.accent+'" stroke="#e4f7f0" stroke-width="6"/>';
 return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 720 720" width="720" height="720" role="img" aria-label="'+E(b.fa)+'">'+
 '<defs><radialGradient id="lj-g-'+safe+'" cx="40%" cy="20%" r="90%"><stop stop-color="#2d7477"/><stop offset="0.53" stop-color="#153f4b"/><stop offset="1" stop-color="#101e31"/></radialGradient><linearGradient id="lj-r-'+safe+'" x1="0%" y1="0%" x2="100%" y2="100%"><stop stop-color="#fff4cc"/><stop offset="0.52" stop-color="'+b.accent+'"/><stop offset="1" stop-color="#a47b43"/></linearGradient></defs>'+
 '<circle cx="360" cy="360" r="329" fill="url(#lj-g-'+safe+')" stroke="url(#lj-r-'+safe+')" stroke-width="23"/>'+
 '<circle cx="360" cy="360" r="292" fill="none" stroke="#e8ddba" stroke-opacity=".65" stroke-width="2"/>'+
 '<circle cx="360" cy="360" r="275" fill="none" stroke="#b0d7cd" stroke-opacity=".35" stroke-width="3" stroke-dasharray="4 19"/>'+
 '<path d="M124 165L155 152M558 160L583 175M123 551L155 572M567 562L589 540" stroke="#e7cd95" stroke-width="8" stroke-linecap="round"/>'+
 '<text x="360" y="143" fill="#f5dfa8" text-anchor="middle" font-size="27" font-family="sans-serif" letter-spacing="5" font-weight="800">THE LIFE ORGANIZATION</text>'+
 extra+
 '<text x="360" y="495" fill="#fff6d8" text-anchor="middle" font-size="35" font-family="Vazirmatn,Tahoma,sans-serif" font-weight="900" direction="rtl">'+E(b.fa)+'</text>'+
 '<text x="360" y="546" fill="#cfebe1" text-anchor="middle" font-size="19" font-family="sans-serif" font-weight="700" letter-spacing="3">'+E(b.en)+'</text>'+
 '<text x="360" y="605" fill="'+b.accent+'" text-anchor="middle" font-size="18" font-family="sans-serif" letter-spacing="4" font-weight="800">'+E(b.tag)+' · BOOK I</text>'+
 '</svg>';
}
function gallery(l,compact=false){
 return '<section class="lj-gallery'+(compact?" lj-gallery-compact":"")+'"><div class="lj-gallery-title"><div><span class="lj-kicker">'+T(l,"مجموعه نشان‌ها","BADGE COLLECTION")+'</span><h2>'+T(l,"نشان‌های مسیر من","My learning badges")+'</h2></div><p>'+T(l,"پس از مرور گفتارها و ثبت خروجی فصل آزاد می‌شوند.","Unlock by reviewing the chapter sections and recording an output.")+'</p></div>'+
 '<div class="lj-badge-grid">'+BADGES.map(b=>{
  const unlocked=badgeUnlocked(b.id);
  return '<article class="lj-badge-card'+(unlocked?" lj-is-unlocked":" lj-is-locked")+'"><div class="lj-badge-image" aria-hidden="true">'+badgeSvg(b.id)+'</div>'+
   '<h3>'+E(T(l,b.fa,b.en))+'</h3><p>'+T(l,unlocked?"نشان به دست آمد":"هنوز آزاد نشده",unlocked?"Badge unlocked":"Not unlocked yet")+'</p>'+
   (unlocked?'<button type="button" class="lj-download" data-lj-action="download-badge" data-id="'+b.id+'">'+T(l,"دریافت PNG","Download PNG")+'</button>':
   '<span class="lj-locked-tag">'+T(l,"در مسیر یادگیری","Keep exploring")+'</span>')+'</article>';
 }).join("")+'</div></section>';
}
function coachBox(n,index,l){
 const s=parse(n)[index],hint=stageHint(n,index,l),key=n+"-"+index;
 return '<section class="lj-coach" aria-label="'+T(l,"همراه یادگیری","Learning companion")+'">'+
 '<div class="lj-coach-symbol" aria-hidden="true">✦</div><div class="lj-coach-content"><span class="lj-kicker">'+T(l,"همراه شما در مسیر · COACHING CHECK-IN","LEARNING COMPANION · COACHING CHECK-IN")+'</span>'+
 '<h3>'+T(l,"یک مکث برای روشن‌تر دیدن","A moment to clarify")+'</h3><p>'+E(hint)+'</p>'+
 '<label for="lj-note-'+n+'-'+index+'">'+T(l,"یادداشت اختیاری · اینجا قرار نیست به پاسخ شما نمره بدهیم.","Optional reflection · Your answer is never graded.")+'</label>'+
 '<textarea id="lj-note-'+n+'-'+index+'" rows="2" maxlength="600" data-lj-note="'+key+'" placeholder="'+E(T(l,"یک مشاهده کوتاه یا سؤال بنویسید...","Write a short observation or question..."))+'">'+E(game.notes[key]||"")+'</textarea>'+
 '<small>'+T(l,"فقط روی همین دستگاه ذخیره می‌شود؛ اطلاعات حساس وارد نکنید.","Stored on this device only. Do not enter sensitive information.")+'</small></div></section>';
}
function chapter(n,l){
 if(!(n>=1&&n<=3))return ORIGINAL.landing(l);
 sync();
 const all=parse(n),stored=game.view[n]||{},idx=Math.max(0,Math.min(all.length-1,Number(stored.stage)||0));
 const s=all[idx],pages=spread(s),page=Math.max(0,Math.min(pages.length-1,Number(stored.page)||0));
 const totalTalk=talkTotal(n),done=ownedReading(n),percent=Math.round(100*(done+(game.practice[n]?1:0))/(totalTalk+1));
 const claimed=!!game.claimed["read:"+n+"-"+idx],atLast=page===pages.length-1;
 const steps=all.map((st,i)=>{
  const doneStep=st.type==="talk"&&!!game.claimed["read:"+n+"-"+i];
  return '<button type="button" class="lj-step'+(i===idx?" lj-step-current":"")+(doneStep?" lj-step-done":"")+'" data-lj-action="step" data-chapter="'+n+'" data-step="'+i+'" '+(i===idx?'aria-current="step"':"")+'>'+
   '<span class="lj-step-index">'+(doneStep?"✓":leading(i+1))+'</span>'+
   '<span class="lj-step-details"><small>'+stageTypeLabel(st,l)+'</small><strong>'+E(stageLabel(st,n,l))+'</strong></span>'+
   '<span class="lj-step-caret" aria-hidden="true">›</span></button>';
 }).join("");
 const reader='<article class="lj-paper" aria-label="'+T(l,"صفحه مطالعه","Reading page")+'">'+
 '<div class="lj-page-heading"><span class="lj-kicker">'+stageTypeLabel(s,l)+'</span><span class="lj-page-count">'+T(l,"صفحه "+(page+1)+" از "+pages.length,"Page "+(page+1)+" of "+pages.length)+'</span></div>'+
 '<h2>'+E(stageLabel(s,n,l))+'</h2><div class="lj-paper-rule"></div>'+
 '<div class="lj-manuscript" lang="fa" dir="rtl">'+pages[page].map(formatLine).join("")+'</div>'+
 '<div class="lj-page-end"><span>'+T(l,"متن اصلی کتاب · جلد اول","Original manuscript · Book One")+'</span><span class="lj-pages-number">'+leading(page+1)+' / '+leading(pages.length)+'</span></div></article>';
 const readingReward=s.type==="talk"?
  claimed?'<span class="lj-completed-label">✓ '+T(l,"این گفتار مرور شده است","Reading reviewed")+'</span>':
  atLast?'<button type="button" class="lj-action-main" data-lb-action="mark" data-lj-action="read" data-chapter="'+n+'" data-section="'+idx+'">'+T(l,"مرور کردم · +۱۵ XP و ۵ سکه","Mark reviewed · +15 XP / 5 coins")+'</button>':
  '<span class="lj-continue-hint">'+T(l,"پس از آخرین صفحه می‌توانید مرور این گفتار را ثبت کنید.","You can mark this section reviewed after its last page.")+'</span>':"";
 const nextStage=idx<all.length-1?'<button type="button" class="lj-action-secondary" data-lj-action="step" data-chapter="'+n+'" data-step="'+(idx+1)+'">'+T(l,"گام بعد","Next step")+' <span aria-hidden="true">‹</span></button>':
 n<3?'<button type="button" class="lj-action-secondary" data-route="book1/'+(n+1)+'">'+T(l,"فصل بعد","Next chapter")+'</button>':
 '<button type="button" class="lj-action-secondary" data-route="book1/workbook">'+T(l,"مرور دفتر کار","Workbook overview")+'</button>';
 const nav='<div class="lj-pager">'+
 '<button type="button" data-lj-action="page" data-chapter="'+n+'" data-page="'+(page-1)+'" '+(page===0?"disabled":"")+'>'+T(l,"صفحه قبل","Previous page")+'</button>'+
 '<div class="lj-page-dots">'+pages.map((_,i)=>'<button type="button" class="'+(i===page?"active":"")+'" data-lj-action="page" data-chapter="'+n+'" data-page="'+i+'" aria-label="'+T(l,"صفحه "+(i+1),"Page "+(i+1))+'" '+(i===page?'aria-current="page"':"")+'></button>').join("")+'</div>'+
 '<button type="button" data-lj-action="page" data-chapter="'+n+'" data-page="'+(page+1)+'" '+(atLast?"disabled":"")+'>'+T(l,"ورق بعد","Next page")+'</button></div>';
 const question=BOOK.chapters[n-1].sourceText.split("\n");const qIndex=question.indexOf("سؤال بزرگ فصل"),q=qIndex>=0?question[qIndex+1]:"";
 const nums=bank(l,true);
 const finish=badgeUnlocked(BADGES[n-1].id)?'<span class="lj-milestone"><span aria-hidden="true">✦</span> '+T(l,"نشان این فصل آزاد شد","Chapter badge unlocked")+'</span>':
 '<span class="lj-milestone lj-milestone-pending">'+T(l,"پس از مرور گفتارها و خروجی Workbook، نشان فصل آزاد می‌شود.","Complete readings and a workbook output to unlock the chapter badge.")+'</span>';
 return '<div class="lb-root lj-root lj-chapter" data-lj-chapter="'+n+'">'+
 '<div class="lj-topnav"><button type="button" data-route="module/1">'+T(l,"مسیر سه فصل","Three-chapter journey")+'</button><span>'+T(l,"جلد اول · فصل "+n,"Book One · Chapter "+n)+'</span></div>'+
 '<section class="lj-head"><div class="lj-head-art" aria-hidden="true"><div class="lj-orbit"><span>'+leading(n)+'</span></div></div>'+
 '<div class="lj-head-copy"><span class="lj-kicker">BOOK I · CHAPTER '+leading(n)+'</span><h1>'+E(T(l,BOOK.chapters[n-1].title,BOOK.chapters[n-1].englishTitle))+'</h1>'+
 '<p class="lj-core"><span aria-hidden="true">✦</span><span lang="fa" dir="rtl">'+E(q)+'</span></p>'+
 '<div class="lj-head-bottom"><div class="lj-head-progress"><strong>'+T(l,done+" / "+totalTalk+" گفتار مرورشده",done+" / "+totalTalk+" sections reviewed")+'</strong>'+
 '<div class="lj-progress-track" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="'+percent+'" aria-label="'+T(l,"فعالیت‌های یادگیری فصل","Chapter learning activities")+'"><span style="width:'+percent+'%"></span></div></div>'+
 '<button type="button" data-route="book1/'+n+'/workbook" class="lj-head-worksheet">'+T(l,"ابزار فصل","Chapter workbook")+'</button></div></div></section>'+
 nums+'<div class="lj-reading-layout"><aside class="lj-rail"><div class="lj-rail-header"><span class="lj-kicker">'+T(l,"نقشه مسیر","JOURNEY MAP")+'</span><h2>'+T(l,"گام‌های این فصل","Chapter steps")+'</h2></div>'+
 '<nav class="lj-steps" aria-label="'+T(l,"گام‌های فصل","Chapter steps")+'">'+steps+'</nav></aside>'+
 '<div class="lj-reading-content">'+reader+nav+coachBox(n,idx,l)+
 '<div class="lj-after-reading">'+readingReward+nextStage+'</div>'+
 '<div class="lj-chapter-outcome"><div><h3>'+T(l,"از خواندن به کاربست","From reading to practice")+'</h3><p>'+T(l,"پاسخ درست یا غلط نداریم. با یک مشاهده واقعی، مسیر یادگیری را ادامه بده.","There is no right or wrong personal answer. Continue with one real observation.")+'</p></div>'+
 '<button data-route="book1/'+n+'/workbook" type="button">'+T(l,"ثبت خروجی فصل","Capture chapter output")+'</button></div>'+
 finish+
 (n<3?'<button class="lj-rest-link" type="button" data-lj-action="rest" data-after="'+n+'"><span aria-hidden="true">☼</span> '+T(l,"ایستگاه مکث اختیاری · ۳۰ ثانیه","Optional 30-second reflection stop")+'</button>':"")+
 '</div></div><div class="lj-footer-nav"><button type="button" data-route="module/1">'+T(l,"بازگشت به نقشه سه فصل","Back to three-chapter map")+'</button>'+
 '<a href="'+E(BOOK.sourceUrl)+'" target="_blank" rel="noopener noreferrer">'+T(l,"متن مرجع Google Drive","Original source in Google Drive")+'</a></div>'+
 '<p class="lj-disclaimer">'+T(l,"امتیازها و سکه‌ها فقط برای مشارکت در مطالعه و تمرین هستند و کیفیت زندگی یا پاسخ‌های فردی را اندازه نمی‌گیرند. متن فارسی از نسخه نهایی کتاب است.","Points and coins recognize reading and practice only; they do not score your life or personal answers. Persian text is sourced from the final manuscript.")+'</p></div>';
}
function enhancedLanding(l){
 sync();
 let s=ORIGINAL.landing(l);
 const strip='<section class="lj-landing-welcome"><div class="lj-mentor-art" aria-hidden="true"><span>✧</span></div><div><span class="lj-kicker">'+T(l,"راهنمای سفر یادگیری","YOUR LEARNING COMPANION")+'</span>'+
 '<h2>'+T(l,"آرام، آگاهانه و قدم‌به‌قدم پیش برو","Make progress with clarity, one step at a time")+'</h2>'+
 '<p>'+T(l,"در هر گفتار یک پرسش برای مکث داری. با مرور واقعی گفتارها، سکه و XP یادگیری می‌گیری و با ثبت خروجی هر فصل یک نشان آزاد می‌کنی.","Each reading step includes a coaching question. Earn learning coins and XP for reviewed sections, then unlock a badge with each chapter’s workbook output.")+'</p></div></section>'+
 bank(l)+'<div class="lj-legend"><span>✧ '+T(l,"۱۳ گفتار","13 sections")+'</span><span>◈ '+T(l,"۳ ابزار","3 worksheets")+'</span><span>✦ '+T(l,"۴ نشان","4 badges")+'</span></div>';
 s=s.replace('<div class="lb-intro-statement">',strip+'<div class="lb-intro-statement">');
 s=s.replace('<p class="lb-privacy">',gallery(l)+'<p class="lb-privacy">');
 return s;
}
function worksheetCoach(n,l){
 const fa=[
 "از تجربه خودت آغاز کن؛ می‌خواهیم تصویر واقعی را ببینیم، نه تصویری بی‌نقص.",
 "چه چیزی واقعاً برای تو مهم است؟ معیارها را متناسب با منابع و نقش‌ها انتخاب کن.",
 "موضوع، بازه و شواهد را یکسان نگه دار. حتی «نمی‌دانم» یک خروجی معتبر است."
 ][n-1];
 const en=[
 "Draw on your own experience: capture the reality, not a flawless version of it.",
 "What matters most here? Choose criteria that fit your roles and available resources.",
 "Keep the topic, time window and evidence consistent. An unknown is a valid finding."
 ][n-1];
 const filled=Object.values((ORIGINAL.exportData().worksheetResponses||{})[n]||{}).filter(x=>typeof x==="string"&&x.trim()).length;
 const finished=!!game.practice[n];
 return '<section class="lj-practice-coach"><div class="lj-practice-icon" aria-hidden="true">✦</div><div><span class="lj-kicker">'+T(l,"گفت‌وگوی کوچینگ در پایان فصل","CHAPTER COACHING CHECK-IN")+'</span><h3>'+T(l,"یک مشاهده معتبر، بهتر از پاسخ اجباری است","One useful observation beats a forced answer")+'</h3><p>'+T(l,fa,en)+'</p>'+
 '<div class="lj-practice-actions"><strong>'+T(l,filled+" یادداشت ثبت‌شده",filled+" prompts with notes")+'</strong>'+
 (finished?'<span class="lj-finished">✓ '+T(l,"خروجی فصل ثبت شد · +۴۵ XP و ۱۵ سکه دریافت شده","Output recorded · +45 XP / 15 coins earned")+'</span>':
 '<button type="button" class="lj-action-main" data-lj-action="finish-workbook" data-chapter="'+n+'">'+T(l,"ثبت خروجی فصل · +۴۵ XP و ۱۵ سکه","Confirm chapter output · +45 XP / 15 coins")+'</button>')+
 '</div><small>'+T(l,"برای ثبت خروجی، حداقل یک مشاهده بنویس. طول پاسخ، سکه و امتیاز بیشتری نمی‌دهد.","Capture at least one observation. Longer answers do not earn extra points or coins.")+'</small></div></section>';
}
function enhancedWorksheet(n,l){
 sync();
 let html=ORIGINAL.worksheet(n,l);
 const count=(html.match(/class="lb-form-field /g)||[]).length;
 const groups=Math.ceil(count/2),now=Math.max(0,Math.min(groups-1,Number(game.formPage[n])||0));
 let idx=0;
 html=html.replace(/class="lb-form-field ([^"]*)"/g,(whole,classes)=>{
  const group=Math.floor(idx++/2);return 'class="lb-form-field '+classes+'" data-lj-form-group="'+group+'"';
 });
 html=html.replace('<form class="lb-workbook-form" autocomplete="off">','<form class="lb-workbook-form lj-form-stepper" data-lj-active="'+now+'" autocomplete="off">');
 const pager='<nav class="lj-form-pager" aria-label="'+T(l,"صفحات دفتر کار","Workbook pages")+'"><button type="button" data-lj-action="form-page" data-chapter="'+n+'" data-form-page="'+(now-1)+'" '+(now===0?"disabled":"")+'>'+T(l,"صفحه قبل","Previous")+'</button>'+
 '<span>'+T(l,"برگه "+(now+1)+" از "+groups,"Sheet "+(now+1)+" of "+groups)+'</span>'+
 '<button type="button" data-lj-action="form-page" data-chapter="'+n+'" data-form-page="'+(now+1)+'" '+(now===groups-1?"disabled":"")+'>'+T(l,"برگه بعدی","Next")+'</button></nav>';
 html=html.replace('</form>',"</form>"+pager+worksheetCoach(n,l));
 html=html.replace('<div class="lb-workbook-nav">',bank(l)+"<div class=\"lb-workbook-nav\">");
 return html;
}
function enhancedWorkbook(l){sync();return ORIGINAL.workbook(l).replace('<div class="lb-summary-flow">',bank(l)+"<div class=\"lb-summary-flow\">").replace('<p class="lb-privacy">',gallery(l)+'<p class="lb-privacy">');}
function enhancedHome(l){
 return ORIGINAL.homeFeature(l).replace('</section>',bank(l,true)+'</section>');
}
function reload(scroll=true){
 const root=document.querySelector("#page");if(!root)return;
 const url=decodeURIComponent(location.hash.replace(/^#/,""));
 const m=/^book1\/([1-3])(?:\/workbook)?$/.exec(url);
 if(m){
  const n=Number(m[1]);root.innerHTML=url.endsWith("/workbook")?enhancedWorksheet(n,document.documentElement.lang):chapter(n,document.documentElement.lang);
 }else if(url==="module/1")root.innerHTML=enhancedLanding(document.documentElement.lang);
 else if(url==="book1/workbook")root.innerHTML=enhancedWorkbook(document.documentElement.lang);
 if(scroll&&window.scrollTo)window.scrollTo({top:0,behavior:"smooth"});
}
function showReward(l,xp,coins,unlock){
 const previous=document.getElementById("lj-celebration");
 if(previous)previous.remove();
 const text=unlock?T(l,"یک نشان تازه به مجموعه تو اضافه شد.","A new badge has joined your collection."):T(l,"یک گام دیگر را با آگاهی پیش بردی.","You completed another deliberate learning step.");
 const badge=unlock?BADGES.find(x=>x.id===unlock):null;
 const box=document.createElement("div");box.id="lj-celebration";box.className="lj-reward-overlay";
 box.innerHTML='<div class="lj-reward-dialog" role="dialog" aria-modal="true" aria-labelledby="lj-reward-title" tabindex="-1">'+
 '<div class="lj-reward-glow" aria-hidden="true">✦</div><span class="lj-kicker">'+T(l,"گام تکمیل شد","LEARNING MILESTONE")+'</span>'+
 '<h2 id="lj-reward-title">'+T(l,"آفرین به این پیگیری آگاهانه","Progress worth acknowledging")+'</h2><p>'+text+'</p>'+
 (badge?'<div class="lj-reward-badge">'+badgeSvg(unlock)+'</div><strong class="lj-reward-name">'+E(T(l,badge.fa,badge.en))+'</strong>':"")+
 '<div class="lj-reward-numbers"><strong>+'+xp+' XP</strong><strong>+'+coins+' ◈</strong></div>'+
 '<p class="lj-reward-message">'+T(l,"این امتیاز برای انجام فعالیت است، نه برای ارزش‌گذاری زندگی یا پاسخ تو.","These rewards recognize the learning action, not your life or the content of your response.")+'</p>'+
 '<div class="lj-reward-buttons">'+(badge?'<button type="button" data-lj-action="download-badge" data-id="'+unlock+'">'+T(l,"دریافت نشان PNG","Download badge PNG")+'</button>':"")+
 '<button type="button" class="lj-action-main" data-lj-action="close-reward">'+T(l,"ادامه مسیر","Continue journey")+'</button></div></div>';
 document.body.appendChild(box);
 box.querySelector(".lj-reward-dialog").focus();
}
function simpleNotice(l,fa,en){
 const old=document.getElementById("lj-mini-notice");if(old)old.remove();
 const el=document.createElement("div");el.id="lj-mini-notice";el.className="lj-mini-notice";el.setAttribute("role","status");el.textContent=T(l,fa,en);
 document.body.appendChild(el);setTimeout(()=>{if(el.isConnected)el.remove()},4200);
}
function downloadBlob(name,content,type){
 const url=URL.createObjectURL(new Blob([content],{type}));
 const a=document.createElement("a");a.href=url;a.download=name;document.body.appendChild(a);a.click();a.remove();
 setTimeout(()=>URL.revokeObjectURL(url),1500);
}
function downloadBadge(id,l){
 if(!badgeUnlocked(id))return;
 const data=badgeSvg(id),base="life-organization-badge-"+id;
 const url=URL.createObjectURL(new Blob([data],{type:"image/svg+xml;charset=utf-8"}));
 const image=new Image();image.onload=function(){
  try{
   const canvas=document.createElement("canvas");canvas.width=1200;canvas.height=1200;
   const ctx=canvas.getContext("2d");ctx.drawImage(image,0,0,1200,1200);
   if(canvas.toBlob){canvas.toBlob(blob=>{
    if(blob){const u=URL.createObjectURL(blob);const a=document.createElement("a");a.href=u;a.download=base+".png";document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(u),1500);}
    else downloadBlob(base+".svg",data,"image/svg+xml;charset=utf-8");
    URL.revokeObjectURL(url);
   },"image/png");}
   else {downloadBlob(base+".svg",data,"image/svg+xml;charset=utf-8");URL.revokeObjectURL(url)}
  }catch(e){downloadBlob(base+".svg",data,"image/svg+xml;charset=utf-8");URL.revokeObjectURL(url)}
 };
 image.onerror=()=>{URL.revokeObjectURL(url);downloadBlob(base+".svg",data,"image/svg+xml;charset=utf-8")};
 image.src=url;
}
let restTimer=null;
function rest(l,n){
 if(!(n===1||n===2))return;
 const old=document.getElementById("lj-rest");if(old)old.remove();
 if(restTimer)clearInterval(restTimer);
 const entry=REST[n-1];
 const el=document.createElement("div");el.id="lj-rest";el.className="lj-rest-overlay";
 el.innerHTML='<div class="lj-rest-dialog" role="dialog" aria-modal="true" tabindex="-1"><div class="lj-rest-orbit" aria-hidden="true"><span>☼</span></div>'+
 '<span class="lj-kicker">'+T(l,"ایستگاه تأمل","REFLECTION STATION")+'</span><h2>'+T(l,entry[0],entry[2])+'</h2><p>'+T(l,entry[1],entry[3])+'</p>'+
 '<div class="lj-rest-clock"><strong id="lj-rest-sec">۳۰</strong><span>'+T(l,"ثانیه مکث اختیاری","seconds · optional")+'</span></div>'+
 '<button type="button" class="lj-action-main" data-lj-action="close-rest">'+T(l,"بازگشت به مسیر","Return to journey")+'</button></div>';
 document.body.appendChild(el);el.querySelector(".lj-rest-dialog").focus();
 let seconds=30;
 restTimer=setInterval(()=>{seconds=Math.max(0,seconds-1);const s=document.getElementById("lj-rest-sec");if(s)s.textContent=String(seconds);if(!seconds){clearInterval(restTimer);restTimer=null;}},1000);
}
function closeOverlay(id){
 const el=document.getElementById(id);if(el)el.remove();
 if(id==="lj-rest"&&restTimer){clearInterval(restTimer);restTimer=null;}
}
document.addEventListener("input",function(ev){
 const field=ev.target.closest?.("[data-lj-note]");
 if(!field)return;
 game.notes[field.dataset.ljNote]=field.value.slice(0,600);persist();
});
document.addEventListener("click",function(ev){
 const target=ev.target.closest?.("[data-lj-action]");if(!target)return;
 const action=target.dataset.ljAction,l=document.documentElement.lang;
 if(action==="step"||action==="page"){
  const n=Number(target.dataset.chapter);if(!(n>=1&&n<=3))return;
  const all=parse(n),prev=game.view[n]||{stage:0,page:0};
  const stage=action==="step"?Number(target.dataset.step):Number(prev.stage)||0;
  const max=spread(all[stage]||all[0]).length;
  const page=action==="step"?0:Number(target.dataset.page);
  if(stage<0||stage>=all.length||page<0||page>=max)return;
  game.view[n]={stage,page};persist();reload();return;
 }
 if(action==="form-page"){
  const n=Number(target.dataset.chapter),p=Number(target.dataset.formPage);
  const groups=Math.ceil((n===1?8:n===2?10:12)/2);
  if(!(n>=1&&n<=3)||p<0||p>=groups)return;
  game.formPage[n]=p;persist();reload(false);
  document.querySelector(".lj-form-pager")?.scrollIntoView({block:"nearest",behavior:"smooth"});return;
 }
 if(action==="read"){
  const n=Number(target.dataset.chapter),i=Number(target.dataset.section);
  const before=awards(),prior=earnedBadgeIds();
  sync();
  const isDone=!!game.claimed["read:"+n+"-"+i];
  if(isDone){
   game.view[n]={stage:Math.min(parse(n).length-1,i+1),page:0};persist();reload();
   const after=awards(),now=earnedBadgeIds(),newBadge=now.find(x=>!prior.includes(x));
   if(after.xp>before.xp)showReward(l,after.xp-before.xp,after.coins-before.coins,newBadge);
  }return;
 }
 if(action==="finish-workbook"){
  const n=Number(target.dataset.chapter),inputs=(ORIGINAL.exportData().worksheetResponses||{})[n]||{};
  if(game.practice[n])return;
  if(!Object.values(inputs).some(x=>typeof x==="string"&&x.trim())){
   simpleNotice(l,"یک مشاهده کوتاه بنویس؛ قرار نیست پاسخ‌ها را کامل یا بی‌نقص کنی.","Write one short observation. Your answers do not need to be perfect or exhaustive.");return;
  }
  const prior=earnedBadgeIds(),before=awards();
  game.practice[n]=true;persist();sync();
  const after=awards(),unlocked=earnedBadgeIds().filter(x=>!prior.includes(x));
  const newBadge=unlocked.includes("foundation")?"foundation":unlocked[0];
  reload(false);showReward(l,after.xp-before.xp,after.coins-before.coins,newBadge);return;
 }
 if(action==="download-badge"){downloadBadge(target.dataset.id,l);return;}
 if(action==="close-reward"){closeOverlay("lj-celebration");return;}
 if(action==="rest"){rest(l,Number(target.dataset.after));return;}
 if(action==="close-rest"){closeOverlay("lj-rest");return;}
});
document.addEventListener("keydown",function(e){
 if(e.key==="Escape"){closeOverlay("lj-celebration");closeOverlay("lj-rest");return;}
 if(e.key==="Tab"){
  const overlay=document.getElementById("lj-celebration")||document.getElementById("lj-rest");
  if(!overlay)return;
  const focusable=[...overlay.querySelectorAll("button:not(:disabled),a[href]")];
  if(!focusable.length){e.preventDefault();return;}
  const first=focusable[0],last=focusable[focusable.length-1];
  if(e.shiftKey&&(document.activeElement===first||document.activeElement===overlay)){e.preventDefault();last.focus();}
  else if(!e.shiftKey&&(document.activeElement===last||document.activeElement===overlay)){e.preventDefault();first.focus();}
 }
});
window.LifeBook.landing=enhancedLanding;
window.LifeBook.chapter=chapter;
window.LifeBook.worksheet=enhancedWorksheet;
window.LifeBook.workbook=enhancedWorkbook;
window.LifeBook.homeFeature=enhancedHome;
window.LifeBook.resetAll=function(){ORIGINAL.resetAll();game={claimed:{},practice:{},notes:{},view:{},formPage:{}};try{localStorage.removeItem(KEY)}catch(e){}};
window.LifeBook.engagement=function(){sync();return {wallet:awards(),badges:earnedBadgeIds(),practice:{...game.practice}}};
window.LifeBook.walletHtml=function(l){sync();return bank(l);};
window.LifeBook.badgesHtml=function(l){sync();return gallery(l);};
window.LifeBook.exportAll=function(){return {...ORIGINAL.exportData(),journey:window.LifeBook.engagement(),coachingNotes:game.notes};};
})();