/* Allameh MBA | student-led case and wiki community. No secret keys in client. */
(()=>{"use strict";
const API="https://hxcjkewlaniahvuqwwbb.supabase.co/functions/v1/mba-ob-community";
const STORE="mba-ob-classroom-attendance-identity-v1";
const app=document.getElementById("communityApp"),toastBox=document.getElementById("communityToast");
const terms=[
 ["جلسه اول",["رفتار فردی، گروهی و سازمانی","رضایت شغلی و عملکرد","غیبت و ترک خدمت","کیفیت و بهره‌وری","توانمندسازی کارکنان","اخلاق در محیط کار"]],
 ["جلسه دوم",["ارزش‌ها و نگرش‌ها","نگرش و رفتار","رضایت شغلی","ناهماهنگی شناختی","ادراک و تفاوت برداشت‌ها","اثر هاله‌ای و خطاهای ادراکی","نظریه اسناد و خطاهای قضاوت","یادگیری و تغییر رفتار"]]
];
let topics=[],invited=new Set(),grades=[],me=null,current=null,filter="all",kind="case",parentReply=null,classmates=null,mode="feed",busy=false;
const esc=v=>String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const fmt=s=>{try{return new Intl.DateTimeFormat("fa-IR",{year:"numeric",month:"short",day:"numeric"}).format(new Date(s))}catch{return ""}};
const short=(s,n=200)=>s.length>n?s.slice(0,n)+"…":s;
const kindName=x=>x==="case"?"کیس مدیریتی":"دانشنامه";
const myToken=()=>{try{return JSON.parse(localStorage.getItem(STORE)||"null")?.token||""}catch{return ""}};
const isStudent=()=>me?.role==="student";
const isTeacher=()=>me?.role==="teacher";
const owned=t=>!!me&&((isStudent()&&t.author_student_id===me.id)||(isTeacher()&&t.teacher_post));
const safeUrl=u=>{try{const p=new URL(u);return ["https:","http:"].includes(p.protocol)?p.href:null}catch{return null}};
function alertText(e){
 const list={session_expired:"نشست شما معتبر نیست. از صفحه کلاس دوباره وارد شوید.",student_only:"ایجاد محتوا مخصوص دانشجوی تأییدشده است.",owner_only:"توسعه و جمع‌بندی این موضوع بر عهده نویسنده آن است.",teacher_only:"این بخش مخصوص مدرس است.",invalid_topic:"عنوان، توضیح یا پرسش کامل نیست.",invalid_reply:"متن پاسخ را کامل‌تر بنویسید.",invalid_poll:"برای نظرسنجی حداقل دو گزینه روشن وارد کنید.",invalid_url:"لینک منبع باید معتبر و با http یا https آغاز شود.",daily_limit:"سقف ثبت موضوع روزانه پر شده است.",hourly_limit:"تعداد پاسخ‌های ثبت‌شده در این ساعت به سقف رسیده است.",not_found:"این موضوع پیدا نشد یا توسط مدرس پنهان شده است.",network_error:"ارتباط با سرور برقرار نشد.",server_error:"درخواست انجام نشد؛ دوباره تلاش کنید."};
 return list[e?.message]||e?.message||list.server_error;
}
function notify(v){toastBox.textContent=v;toastBox.hidden=false;clearTimeout(notify.timer);notify.timer=setTimeout(()=>toastBox.hidden=true,4500);}
async function api(action,data={}){
 const token=myToken();if(!token)throw Error("session_expired");
 let res,body;
 try{res=await fetch(API,{method:"POST",mode:"cors",cache:"no-store",headers:{"Content-Type":"application/json"},body:JSON.stringify({action,token,...data})});body=await res.json();}
 catch{throw Error("network_error");}
 if(!res.ok||body?.ok===false)throw Error(body?.error||"server_error");
 return body;
}
function loading(){app.innerHTML='<div class="card loading"><p>در حال دریافت اطلاعات…</p></div>';}
function crumb(){return '<div class="actions"><button type="button" class="btn link" data-action="feed">→ بازگشت به باشگاه</button></div>';}
function filtersHTML(){
 return '<div class="filters" role="group" aria-label="فیلتر موضوعات">'+
 [["all","همه موضوعات"],["mine","موضوعات من"],["invited","دعوت‌های من"]].map(x=>'<button type="button" class="filter '+(filter===x[0]?"active":"")+'" data-action="filter" data-filter="'+x[0]+'">'+x[1]+(x[0]==="invited"&&invited.size?" ("+invited.size+")":"")+'</button>').join("")+'</div>';
}
function topicCard(t){
 const mark=t.demo?'<span class="pill demo">نمونه آموزشی · فرضی</span>':owned(t)?'<span class="pill mine">موضوع شما · تسهیل‌گر</span>':"";
 return '<button type="button" class="topic-card" data-action="open" data-id="'+esc(t.id)+'">'+
 '<div class="tags"><span class="pill">'+kindName(t.kind)+'</span><span class="pill">'+esc(t.category)+'</span>'+mark+(invited.has(t.id)?'<span class="pill mine">دعوت شده‌اید</span>':"")+'</div>'+
 '<h3>'+esc(t.title)+'</h3><p>'+esc(short(t.body))+'</p>'+
 '<div class="card-footer"><span>'+esc(t.author_name)+' · '+fmt(t.created_at)+'</span><span>'+Number(t.reply_count||0).toLocaleString("fa-IR")+' نظر و پاسخ</span></div></button>';
}
function feedHTML(){
 const visible=topics.filter(t=>filter==="all"||(filter==="mine"&&owned(t))||(filter==="invited"&&invited.has(t.id)));
 return '<section class="hero"><span class="eyebrow">فضای گفت‌وگوی علمی کلاس</span><h1>باشگاه اندیشه رفتار سازمانی</h1><p>یک مسئله مطرح کنید، دانشی به اشتراک بگذارید و همکلاسی‌ها را به گفت‌وگو دعوت کنید. نویسنده هر موضوع مسئول پیگیری و جمع‌بندی بحث است.</p></section>'+
 '<div class="section-head"><h2>می‌خواهید چه چیزی ثبت کنید؟</h2></div>'+
 '<div class="choice-grid">'+
 '<button class="choice" data-action="new" data-kind="case" type="button"><span class="choice-icon" aria-hidden="true">◇</span><span><strong>کیس مدیریتی</strong><small>یک موقعیت واقعی یا فرضی، همراه با مسئله و پرسش برای تصمیم‌گیری</small></span></button>'+
 '<button class="choice" data-action="new" data-kind="wiki" type="button"><span class="choice-icon" aria-hidden="true">▤</span><span><strong>دانشنامه</strong><small>یک مفهوم رفتار سازمانی، همراه با توضیح، مثال و دعوت به تکمیل</small></span></button></div>'+
 '<div class="section-head"><h2>گفت‌وگوهای کلاس</h2>'+filtersHTML()+'</div>'+
 '<div class="list">'+(visible.length?visible.map(topicCard).join(""):'<div class="empty">هنوز موضوعی در این بخش وجود ندارد. از یکی از دو قالب بالا شروع کنید.</div>')+'</div>'+
 '<p class="note">نمونه‌های آموزشی با برچسب «فرضی» مشخص‌اند. نظرسنجی و کامنت‌های نمونه در نمره دانشجویان لحاظ نمی‌شوند.</p>';
}
function categories(){
 let html='<option value="">موضوع آزاد / موضوع دیگر</option>';
 for(const [name,list] of terms){html+='<optgroup label="'+name+'">'+list.map(v=>'<option value="'+esc(v)+'" data-session="'+(name==="جلسه اول"?1:2)+'">'+esc(v)+'</option>').join("")+'</optgroup>';}
 return html;
}
function formHTML(){
 return crumb()+'<div class="hero"><span class="eyebrow">مشارکت تازه</span><h1>ثبت '+kindName(kind)+'</h1><p>'+(kind==="case"?"یک مسئله مطرح کنید؛ هدف یافتن راه‌حل از راه تحلیل و گفت‌وگوست.":"یک مفهوم را ساده توضیح دهید و از دیگران برای تکمیل آن کمک بگیرید.")+'</p></div>'+
 '<form class="card" data-form="create">'+
 '<label class="field"><span>حوزه موضوع</span><select name="category" id="categorySelect">'+categories()+'</select><small>انتخاب موضوع اختیاری است؛ می‌توانید موضوع تازه‌ای مطرح کنید.</small></label>'+
 '<label class="field"><span>عنوان '+(kind==="case"?"کیس":"دانشنامه")+'</span><input type="text" name="title" minlength="6" maxlength="150" required placeholder="'+(kind==="case"?"مثلاً: چرا مدیر درباره عملکرد زود قضاوت کرد؟":"مثلاً: آیا نگرش مثبت همیشه به رفتار مثبت منجر می‌شود؟")+'"></label>'+
 '<label class="field"><span>'+(kind==="case"?"چه اتفاقی افتاده است؟":"این مفهوم را به زبان ساده توضیح دهید")+'</span><textarea name="body" minlength="20" maxlength="5000" rows="5" required placeholder="'+(kind==="case"?"موقعیت، افراد و شواهد موجود را بدون افشای اطلاعات محرمانه بنویسید.":"معنا، مثال و کاربرد مفهوم را بنویسید.")+'"></textarea></label>'+
 '<label class="field"><span>چه پرسشی برای گفت‌وگو دارید؟</span><textarea name="question" minlength="8" maxlength="900" rows="2" required placeholder="یک سؤال باز و قابل بحث مطرح کنید."></textarea></label>'+
 '<details class="extra"><summary>افزودن نظرسنجی چندگزینه‌ای (اختیاری)</summary><p>اگر می‌خواهید همکلاسی‌ها انتخاب کنند، دست‌کم دو گزینه قابل دفاع بنویسید. پرسش باز بالا همچنان باقی می‌ماند.</p>'+
 [0,1,2,3].map(i=>'<label class="field"><span>گزینه '+(i+1).toLocaleString("fa-IR")+'</span><input type="text" name="poll_'+i+'" maxlength="180" placeholder="پاسخ یا رویکرد پیشنهادی"></label>').join("")+'</details>'+
 '<details class="extra"><summary>افزودن لینک و منبع (اختیاری)</summary><label class="field"><span>آدرس لینک</span><input type="url" name="source_url" maxlength="500" dir="ltr" placeholder="https://..."></label><label class="field"><span>عنوان منبع</span><input name="source_label" maxlength="140" placeholder="مثلاً: فصل دوم کتاب رابینز"></label></details>'+
 '<p class="note">موضوع بلافاصله به نام شما منتشر می‌شود. مسئولیت دعوت، پاسخ به دیدگاه‌ها، پرسیدن سؤال تکمیلی و جمع‌بندی با شماست.</p>'+
 '<div class="actions"><button type="submit" class="btn primary">انتشار موضوع</button><button type="button" class="btn" data-action="feed">انصراف</button></div></form>';
}
function pollHTML(data){
 const t=data.topic,opts=Array.isArray(t.poll_options)?t.poll_options:[];
 if(!opts.length)return "";
 const total=(data.vote_totals||[]).reduce((a,b)=>a+b,0),showResults=data.my_vote!==null||isTeacher();
 const canVote=isStudent();
 return '<section class="card"><h2 style="font-size:1.06rem;margin-top:0">انتخاب شما چیست؟</h2><form data-form="vote">'+
 opts.map((option,i)=>'<label class="radio"><input type="radio" name="vote" value="'+i+'" '+(data.my_vote===i?"checked":"")+' '+(!canVote?"disabled":"")+' required>'+esc(option)+'</label>'+
 (showResults?'<div class="poll-results">'+(data.vote_totals[i]||0).toLocaleString("fa-IR")+' رأی · '+(total?Math.round(data.vote_totals[i]/total*100):0).toLocaleString("fa-IR")+'٪<div class="progress"><span style="width:'+(total?Math.round(data.vote_totals[i]/total*100):0)+'%"></span></div></div>':"")).join("")+
 (canVote?'<button class="btn primary sm" type="submit">'+(data.my_vote===null?"ثبت انتخاب":"تغییر انتخاب")+'</button>':"")+
 '</form><p class="note">انتخاب شما پایان گفت‌وگو نیست؛ دلیل خود را هم در پاسخ‌ها توضیح دهید.</p></section>';
}
function responseHTML(data){
 const replies=data.replies||[],lookup=new Map(replies.map(x=>[x.id,x.author_name]));
 return '<div class="section-head"><h2>دیدگاه‌ها و گفت‌وگوها</h2><span class="meta">'+replies.length.toLocaleString("fa-IR")+' پاسخ</span></div>'+
 '<section class="card">'+(replies.length?replies.map(r=>
 '<article class="reply"><div class="reply-head"><strong>'+esc(r.author_name)+(r.author_student_id&&r.author_student_id===data.topic.author_student_id?' · نویسنده موضوع':'')+'</strong><span class="meta">'+fmt(r.created_at)+'</span></div>'+
 (r.parent_reply_id?'<div class="reply-parent">در پاسخ به '+esc(lookup.get(r.parent_reply_id)||"دیدگاه قبلی")+'</div>':"")+
 '<p>'+esc(r.body)+'</p><div class="actions">'+(r.demo?'<span class="pill demo">گفت‌وگوی فرضی</span>':"")+
 (isStudent()||isTeacher()?'<button type="button" class="btn link sm" data-action="replyTo" data-id="'+esc(r.id)+'" data-name="'+esc(r.author_name)+'">پاسخ به این دیدگاه</button>':"")+
 (isTeacher()&&!r.demo?'<button type="button" class="btn danger sm" data-action="hideReply" data-id="'+esc(r.id)+'">پنهان‌کردن</button>':"")+'</div></article>'
 ).join(""):'<div class="empty">هنوز پاسخی ثبت نشده است. اولین دیدگاه را شما بنویسید.</div>')+'</section>';
}
function reviewHTML(data){
 if(!isTeacher())return "";
 const people=data.contributors||[];
 return '<section class="card" style="margin-top:18px"><h2>ارزیابی مشارکت دانشجویان</h2><p class="note">هر دانشجو در این موضوع بر اساس کیفیت علمی (۴)، استدلال (۴) و کمک به توسعه گفت‌وگو (۲) از ۱۰ امتیاز ارزیابی می‌شود. ثبت نمره فقط با تأیید شما انجام می‌شود.</p>'+
 (people.length?people.map(p=>'<form class="review" data-form="review" data-student="'+esc(p.id)+'"><strong>'+esc(p.name)+(p.author?' · نویسنده و مسئول توسعه بحث':' · مشارکت‌کننده')+'</strong><p class="meta">'+p.replies+' پاسخ ثبت‌شده'+(p.author?' · ارزیابی پیگیری و جمع‌بندی نیز مهم است':'')+'</p>'+
 '<div class="row"><label class="field"><span>نمره از ۱۰</span><select name="score">'+Array.from({length:11},(_,i)=>'<option value="'+i+'" '+(p.review?.score===i?"selected":"")+'>'+i.toLocaleString("fa-IR")+'</option>').join("")+'</select></label>'+
 '<label class="field"><span>بازخورد کوتاه</span><textarea name="feedback" rows="2" maxlength="1500" placeholder="یک بازخورد کاربردی بنویسید">'+esc(p.review?.feedback||"")+'</textarea></label></div>'+
 '<button class="btn primary sm" type="submit">'+(p.review?"به‌روزرسانی نمره":"ثبت نمره")+'</button></form>').join(""):'<p class="empty">هنوز مشارکت واقعی دانشجویان برای نمره‌دهی ثبت نشده است.</p>')+'</section>';
}
function detailHTML(data){
 const t=data.topic,isOwner=owned(t),actual=(data.replies||[]).filter(r=>r.author_student_id&&r.author_student_id===t.author_student_id).length;
 const link=safeUrl(t.source_url);
 return crumb()+'<article class="hero"><div class="tags"><span class="pill">'+kindName(t.kind)+'</span><span class="pill">'+esc(t.category)+'</span>'+(t.demo?'<span class="pill demo">نمونه آموزشی · فرضی</span>':"")+(isOwner?'<span class="pill mine">شما تسهیل‌گر هستید</span>':"")+'</div><h1 class="detail-title">'+esc(t.title)+'</h1><p class="meta">نویسنده: '+esc(t.author_name)+' · '+fmt(t.created_at)+' · جلسه '+Number(t.session_no).toLocaleString("fa-IR")+'</p></article>'+
 '<section class="card"><div class="detail-text">'+esc(t.body)+'</div><div class="question"><strong>پرسش برای گفت‌وگو</strong>'+esc(t.question)+'</div>'+
 (link?'<p class="note">منبع: <a class="external" href="'+esc(link)+'" target="_blank" rel="noopener noreferrer">'+esc(t.source_label||link)+'</a></p>':"")+
 '<div class="actions">'+(isOwner&&!t.demo&&isStudent()?'<button type="button" class="btn primary sm" data-action="invite">دعوت همکلاسی‌ها</button>':"")+
 '<button type="button" class="btn sm" data-action="share">کپی لینک بحث</button>'+
 (isTeacher()&&!t.demo?'<button type="button" class="btn danger sm" data-action="hideTopic">پنهان‌کردن موضوع</button>':"")+'</div>'+
 '<div id="inviteArea" class="hidden" style="margin-top:12px"></div></section>'+
 (isOwner?'<div class="owner-note" style="margin:15px 0"><strong>مسئولیت توسعه گفت‌وگو با شماست</strong><p>به نظرات پاسخ دهید، یک پرسش پیگیری مطرح کنید، دیگران را دعوت کنید و برداشت نهایی را ثبت کنید.'+(isStudent()?' پاسخ‌های شما تاکنون: '+actual.toLocaleString("fa-IR"):"")+'</p></div>':"")+
 (isOwner&&t.kind==="wiki"?'<details class="extra"><summary>توسعه متن دانشنامه با استفاده از نظر دیگران</summary><form data-form="editWiki"><label class="field"><span>متن به‌روزشده دانشنامه</span><textarea name="body" rows="6" minlength="20" maxlength="5000" required>'+esc(t.body)+'</textarea></label><p class="note">نظرهای همکلاسی‌ها در پایین صفحه حفظ می‌شوند؛ متن اصلی را با استفاده از پیشنهادهای معتبر غنی‌تر کنید.</p><button class="btn primary sm" type="submit">ذخیره نسخه تکمیل‌شده</button></form></details>':"")+
 (t.summary?'<section class="summary"><strong>جمع‌بندی و یادگیری‌های این بحث</strong><p class="detail-text">'+esc(t.summary)+'</p></section>':"")+
 (isOwner?'<details class="extra"><summary>'+(t.summary?"ویرایش جمع‌بندی نویسنده":"ثبت جمع‌بندی نویسنده")+'</summary><form data-form="summary"><label class="field"><span>از این گفت‌وگو چه آموختیم؟</span><textarea name="summary" rows="4" minlength="30" maxlength="3000" required placeholder="دیدگاه‌های متفاوت، نتیجه و پرسش بازمانده را بنویسید.">'+esc(t.summary||"")+'</textarea></label><button type="submit" class="btn primary sm">ذخیره جمع‌بندی</button></form></details>':"")+
 '<div style="margin:18px 0">'+pollHTML(data)+'</div>'+
 responseHTML(data)+
 '<section class="card" style="margin-top:18px"><h2 style="margin-top:0">به گفت‌وگو بپیوندید</h2>'+
 '<p class="note">'+(isOwner?"به دیدگاه‌ها پاسخ بدهید و با یک پرسش تازه بحث را جلو ببرید.":"دیدگاه خود را همراه با دلیل، مثال یا پرسش تکمیلی بنویسید.")+'</p>'+
 '<form data-form="reply"><div id="replyingTo" class="meta"></div><label class="field"><span>دیدگاه یا پرسش شما</span><textarea name="body" rows="3" maxlength="2500" minlength="3" required placeholder="چه نکته‌ای به تحلیل دیگران اضافه می‌کنید؟"></textarea></label><div class="actions"><button class="btn primary" type="submit">ثبت پاسخ</button><button type="button" class="btn sm hidden" data-action="clearReply" id="clearReply">لغو پاسخ به دیدگاه</button></div></form></section>'+
 (data.my_review?'<p class="grade">نمره مشارکت شما در این موضوع: <strong>'+Number(data.my_review.score).toLocaleString("fa-IR")+' از ۱۰</strong>'+(data.my_review.feedback?' · بازخورد مدرس: '+esc(data.my_review.feedback):"")+'</p>':"")+
 reviewHTML(data);
}
async function feed(changeUrl=true){
 loading();try{
 const r=await api("feed");topics=r.topics||[];invited=new Set(r.invited||[]);grades=r.grades||[];me=r.me;current=null;mode="feed";parentReply=null;
 app.innerHTML=feedHTML();if(changeUrl)history.pushState(null,"",location.pathname);
 }catch(e){app.innerHTML='<div class="card alert">'+esc(alertText(e))+' <a href="./index.html">بازگشت به ورود کلاس</a></div>';}
}
async function openTopic(id,changeUrl=true){
 loading();
 try{const r=await api("view",{id});me=r.me;current=r;mode="topic";parentReply=null;app.innerHTML=detailHTML(r);if(changeUrl)history.pushState(null,"","#topic/"+id);
 }catch(e){notify(alertText(e));await feed();}
}
function begin(k){if(!me){notify("ابتدا وارد کلاس شوید.");return}kind=k;mode="new";parentReply=null;app.innerHTML=formHTML();history.pushState(null,"","#new-"+k);window.scrollTo(0,0);}
async function refreshTopic(){if(current)await openTopic(current.topic.id,false);}
async function sendTopic(form){
 const fd=new FormData(form),category=String(fd.get("category")||"").trim(),choice=form.querySelector('select[name="category"] option:checked');
 const options=[0,1,2,3].map(i=>String(fd.get("poll_"+i)||"").trim()).filter(Boolean);
 if(options.length===1){notify("نظرسنجی باید حداقل دو گزینه داشته باشد.");return}
 const payload={kind,title:String(fd.get("title")||"").trim(),body:String(fd.get("body")||"").trim(),question:String(fd.get("question")||"").trim(),category:category||"موضوع آزاد",session_no:Number(choice?.dataset.session||2),poll_options:options,source_url:String(fd.get("source_url")||"").trim(),source_label:String(fd.get("source_label")||"").trim()};
 await withBusy(form,async()=>{const r=await api("create",payload);notify("موضوع به نام شما منتشر شد. حالا گفت‌وگو را هدایت کنید.");await openTopic(r.id);window.scrollTo(0,0);});
}
async function withBusy(form,fn){if(busy)return;busy=true;const buttons=[...form.querySelectorAll('button[type="submit"]')];buttons.forEach(b=>b.disabled=true);try{await fn()}catch(e){notify(alertText(e))}finally{busy=false;buttons.forEach(b=>b.disabled=false)}}
async function inviteView(){
 if(!current||!owned(current.topic)||!isStudent())return;
 const root=document.getElementById("inviteArea");if(!root)return;root.classList.remove("hidden");root.textContent="در حال دریافت فهرست همکلاسی‌ها…";
 try{
  if(!classmates){const d=await api("classmates");classmates=d.students||[];}
  root.innerHTML='<div class="extra"><strong>دعوت یک همکلاسی به این گفت‌وگو</strong><p>فقط نام دانشجویان تأییدشده نمایش داده می‌شود.</p><div class="actions"><select class="select" id="inviteSelect" style="width:auto;max-width:100%" aria-label="انتخاب همکلاسی">'+
  '<option value="">انتخاب همکلاسی</option>'+classmates.map(s=>'<option value="'+esc(s.id)+'">'+esc(s.full_name)+'</option>').join("")+'</select><button type="button" class="btn primary sm" data-action="sendInvite">ارسال دعوت</button></div></div>';
 }catch(e){root.textContent=alertText(e);}
}
function share(){
 if(!current)return;const url=location.origin+location.pathname+"#topic/"+current.topic.id;
 if(navigator.share){navigator.share({title:current.topic.title,url}).then(()=>notify("لینک گفت‌وگو آماده اشتراک‌گذاری است.")).catch(()=>{});return}
 if(navigator.clipboard?.writeText){navigator.clipboard.writeText(url).then(()=>notify("لینک گفت‌وگو کپی شد.")).catch(()=>notify("لینک: "+url));return}
 notify("لینک: "+url);
}
document.addEventListener("click",async e=>{
 const b=e.target.closest("[data-action]");if(!b||b.disabled)return;const action=b.dataset.action;
 if(action==="feed"){await feed();window.scrollTo(0,0)}
 if(action==="filter"){filter=b.dataset.filter;app.innerHTML=feedHTML()}
 if(action==="open"){await openTopic(b.dataset.id);window.scrollTo(0,0)}
 if(action==="new"){begin(b.dataset.kind)}
 if(action==="replyTo"&&current){parentReply=b.dataset.id;const box=document.getElementById("replyingTo"),clear=document.getElementById("clearReply");if(box)box.textContent="در پاسخ به: "+b.dataset.name;if(clear)clear.classList.remove("hidden");const field=document.querySelector('form[data-form="reply"] textarea');field?.focus();field?.scrollIntoView({behavior:"smooth",block:"center"});}
 if(action==="clearReply"){parentReply=null;document.getElementById("replyingTo").textContent="";b.classList.add("hidden");}
 if(action==="invite")await inviteView();
 if(action==="sendInvite"&&current){const id=document.getElementById("inviteSelect")?.value;if(!id){notify("ابتدا همکلاسی را انتخاب کنید.");return}b.disabled=true;try{await api("invite",{topic_id:current.topic.id,invitee_id:id});notify("دعوت در باشگاه برای همکلاسی ثبت شد.");}catch(err){notify(alertText(err))}finally{b.disabled=false}}
 if(action==="share")share();
 if(action==="hideTopic"&&current&&confirm("این موضوع از دید دانشجویان پنهان شود؟")){try{await api("hideTopic",{id:current.topic.id});notify("موضوع پنهان شد.");await feed()}catch(err){notify(alertText(err))}}
 if(action==="hideReply"&&current&&confirm("این پاسخ پنهان شود؟")){try{await api("hideReply",{id:b.dataset.id});notify("پاسخ پنهان شد.");await refreshTopic()}catch(err){notify(alertText(err))}}
});
document.addEventListener("submit",async e=>{
 const form=e.target.closest("form[data-form]");if(!form)return;e.preventDefault();
 const what=form.dataset.form;
 if(what==="create")return sendTopic(form);
 if(!current)return;
 if(what==="reply")return withBusy(form,async()=>{await api("reply",{topic_id:current.topic.id,body:form.querySelector("textarea").value.trim(),parent_reply_id:parentReply});notify("پاسخ شما ثبت شد.");await refreshTopic();});
 if(what==="editWiki")return withBusy(form,async()=>{await api("editWiki",{topic_id:current.topic.id,body:form.querySelector("textarea").value.trim()});notify("دانشنامه با مشارکت همکلاسی‌ها به‌روزرسانی شد.");await refreshTopic();});
 if(what==="summary")return withBusy(form,async()=>{await api("summarize",{topic_id:current.topic.id,summary:form.querySelector("textarea").value.trim()});notify("جمع‌بندی ثبت شد.");await refreshTopic();});
 if(what==="vote")return withBusy(form,async()=>{const selected=form.querySelector("input[name=vote]:checked");if(!selected){notify("یکی از گزینه‌ها را انتخاب کنید.");return}await api("vote",{topic_id:current.topic.id,option_index:Number(selected.value)});notify("انتخاب شما ثبت شد.");await refreshTopic();});
 if(what==="review")return withBusy(form,async()=>{const fd=new FormData(form);await api("review",{topic_id:current.topic.id,student_id:form.dataset.student,score:Number(fd.get("score")),feedback:String(fd.get("feedback")||"")});notify("نمره مشارکت ثبت شد.");await refreshTopic();});
});
window.addEventListener("popstate",()=>{const match=location.hash.match(/^#topic\/([0-9a-f-]{36})$/i);if(match)openTopic(match[1],false);else feed(false);});
(async()=>{const m=location.hash.match(/^#topic\/([0-9a-f-]{36})$/i);if(m)await openTopic(m[1],false);else await feed(false)})();
})();