/* Saba Naft — universal, context-aware leadership companion.
 * Local educational assistance works without a server.
 * Generative coaching is available ONLY via authenticated HTTPS Edge Function.
 * No implicit uploads; every AI request requires user consent and a deliberate click.
 */
(function(){
"use strict";
const $=id=>document.getElementById(id);
const trim=(v,n=1200)=>String(v==null?"":v).trim().slice(0,n);
const safeText=s=>String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const names={home:"خانه",course:"مسیر یادگیری",session:"جلسه آموزشی",lesson:"درس و تمرین",stage:"مدل رهبری",context:"بافت رهبری",studio:"استودیوی رهبری",coach:"مسئله من",journey:"سفر ده‌مرحله‌ای",passport:"پیشرفت من"};
const methods={guide:"توضیح گام‌به‌گام",review:"بازخورد بر نوشته من",reflect:"پرسش بازاندیشی",next:"اقدام بعدی",ask:"گفت‌وگوی آزاد"};
let history=[],inFlight=false,previousFocus=null,session=null;
function config(){
 const c=window.SABA_AI_CONFIG||{};if(!c.endpoint)return null;
 try{
  const u=new URL(c.endpoint);
  if(u.protocol!=="https:")return null;
  if(c.provider==="cloudflare"){
   if(!u.hostname.endsWith(".workers.dev")||u.pathname!=="/v1/coach"||u.search||u.hash)return null;
   return {provider:"cloudflare",endpoint:u.toString(),base:u.origin,key:""};
  }
  if(!c.publishableKey||!u.hostname.endsWith(".supabase.co")||!u.pathname.endsWith("/functions/v1/leadership-coach"))return null;
  return {provider:"supabase",endpoint:u.toString(),base:u.origin,key:c.publishableKey};
 }catch(e){return null}
}
function readSession(){
 try{let s=JSON.parse(sessionStorage.getItem("saba_ai_session_v1")||"null");return s&&typeof s.access_token==="string"?s:null}catch(e){return null}
}
function setSession(s){session=s;try{if(s)sessionStorage.setItem("saba_ai_session_v1",JSON.stringify(s));else sessionStorage.removeItem("saba_ai_session_v1")}catch(e){}status()}
function status(){
 const el=$("sabaAiStatus"),auth=$("sabaAiAuth");
 if(!el)return;
 const cfg=config(),live=!!cfg,logged=!!session;
 el.textContent=!live?"راهنمای آموزشی · AI هنوز متصل نیست":logged?"Live AI آماده درخواست":"Live AI · ورود سازمانی لازم است";
 if(auth)auth.hidden=!live||logged;
 const pilot=$("sabaAiPilotAuth"),old=$("sabaAiSupabaseAuth");
 if(pilot)pilot.hidden=!live||cfg.provider!=="cloudflare";
 if(old)old.hidden=!live||cfg.provider!=="supabase";
 const logout=$("sabaAiLogout");if(logout)logout.hidden=!live||!logged;
}
async function signIn(){
 const c=config();if(!c)return;
 if(c.provider==="cloudflare"){
  const code=trim($("sabaAiPilotCode").value,80).toLowerCase();
  if(!/^snp_[a-f0-9]{64}$/.test(code)){show("کد اختصاصی Pilot معتبر نیست. کد دعوت‌شده را کامل وارد کنید.","system");return}
  $("sabaAiSignIn").disabled=true;
  try{
   const resp=await fetch(c.base+"/v1/session",{method:"GET",headers:{"Authorization":"Bearer "+code},mode:"cors",credentials:"omit",cache:"no-store"});
   if(!resp.ok)throw new Error("invalid_access");
   setSession({provider:"cloudflare",access_token:code,expires_at:Date.now()+7*24*3600*1000});
   $("sabaAiPilotCode").value="";
   show("دسترسی Pilot تأیید شد. با رضایت صریح شما، پرسش و متن تمرین به مدل Cloudflare Workers AI ارسال می‌شود.","system");
  }catch(e){show("کد دسترسی رد شد، منقضی شده یا Backend در دسترس نیست.","system")}
  finally{$("sabaAiSignIn").disabled=false}
  return;
 }
 const email=trim($("sabaAiEmail").value,160),password=$("sabaAiPassword").value;
 if(!/^\S+@\S+\.\S+$/.test(email)||password.length<8){show("لطفاً ایمیل معتبر و رمز عبور حساب دعوت‌شده سازمانی را وارد کنید.","system");return;}
 $("sabaAiSignIn").disabled=true;
 try{
  const r=await fetch(c.base+"/auth/v1/token?grant_type=password",{method:"POST",headers:{"apikey":c.key,"Content-Type":"application/json"},body:JSON.stringify({email,password})});
  const d=await r.json().catch(()=>({}));if(!r.ok||!d.access_token)throw new Error("invalid_credentials");
  setSession({access_token:d.access_token,refresh_token:d.refresh_token,expires_at:Date.now()+Math.max(30,d.expires_in||3600)*1000});
  $("sabaAiPassword").value="";show("ورود انجام شد. برای ارسال پرسش به AI، رضایت ارسال متن را فعال کنید.","system");
 }catch(e){show("ورود انجام نشد؛ حساب سازمانی، ایمیل و رمز را بررسی کنید.","system")}
 finally{$("sabaAiSignIn").disabled=false}
}
async function getAccessToken(){
 if(!session)session=readSession();if(!session)return null;
 if(session.provider==="cloudflare"){
  if(Date.now()<Number(session.expires_at||0))return session.access_token;
  setSession(null);return null;
 }
 if(Date.now()<Number(session.expires_at||0)-90000)return session.access_token;
 const c=config();if(!c||!session.refresh_token){setSession(null);return null}
 try{
  const r=await fetch(c.base+"/auth/v1/token?grant_type=refresh_token",{method:"POST",headers:{"apikey":c.key,"Content-Type":"application/json"},body:JSON.stringify({refresh_token:session.refresh_token})});
  const d=await r.json();if(!r.ok||!d.access_token)throw new Error("refresh");
  setSession({access_token:d.access_token,refresh_token:d.refresh_token,expires_at:Date.now()+Math.max(30,d.expires_in||3600)*1000});
  return session.access_token;
 }catch(e){setSession(null);return null}
}
window.SabaSecureSession={getAccessToken:getAccessToken,signOut:()=>setSession(null)};
window.SabaAiCoach={open:open,close:close,context:routeContext};
function routeContext(){
 let arr=decodeURIComponent(location.hash.replace(/^#\/?/,"")).split("/"),area=arr[0]||"home",title=names[area]||"بخش جاری";
 const c={area,route:location.hash||"#/home",title,framework:"The Reflective Leader — applied adaptation",assessmentMode:"none"};
 const D=window.SABA_REFLECTIVE,J=window.SABA_LEADERSHIP_JOURNEY;
 if(area==="journey"&&J&&Array.isArray(J.steps)){
  try{
   const s=JSON.parse(localStorage.getItem("sabanaft_leadership_journey_v1")||"null");
   if(s&&Number.isInteger(s.stage)&&s.stage>=0&&s.stage<10){
    const st=J.steps[s.stage];c.stageNumber=s.stage+1;c.title=st.title;c.objective=trim(st.objective,450);c.concept=trim(st.concept,750);c.criteria=(st.practiceCriteria||[]).slice(0,6);c.practice=trim(st.practice,550);c.scenario=trim(st.scenario,900);
    c.assessmentMode=s.mode==="competitive"&&!s.finished?"competitive_locked":"study_or_finished";
    c.framework=trim(st.anchor||"مدل رهبری بازتابی",120);c.question=trim(st.question,250);
   }
  }catch(e){}
 }else if((area==="lesson"||area==="session")&&D&&D.sessions){
  const ss=D.sessions.find(x=>x.id===Number(arr[1]));
  if(ss){c.title=ss.title;c.framework=trim(ss.coverage,140);const p=area==="lesson"&&ss.sections.find(x=>x.id===arr[2]);if(p){c.title=p.title;c.objective=trim(p.lead,450);c.practice=trim(p.prompt,500);c.concept=trim((p.blocks||[]).map(x=>x.text).join(" "),900);}}
 }else if(area==="stage"){
  const map={
   idea:{title:"ایده رهبری من",objective:"تعریف آگاهانه نقش مدیریتی متناسب با بافت",criteria:["تعریف روشن نقش Boss/Coach/Partner/Enabler","شواهد مربوط به بافت","توضیح چرایی انتخاب نقش","مرز اختیار و مسئولیت مدیر"]},
   relationship:{title:"رابطه با کارکنان",objective:"روشن‌کردن انتظارات دوطرفه درباره نقش، اختیار و مسئولیت",criteria:["انتظارات متقابل و شفاف","پرسش و شنیدن دیدگاه کارکنان","نحوه توافق بر مرز مسئولیت","حفظ احترام و اعتماد"]},
   tools:{title:"ابزارهای رهبری",objective:"انتخاب ابزار متناسب با بافت و نقش، نه ابزار صرفاً محبوب",criteria:["تناسب ابزار و مسئله","پیامد و محدودیت کاربرد","مسئول اجرا و پیگیری","شاخص قابل مشاهده اثربخشی"]},
   reflection:{title:"بازاندیشی مستمر",objective:"تبدیل مشاهده و تجربه به یادگیری و اقدام بعدی",criteria:["تفکیک مشاهده از تفسیر","شناسایی فرض‌ها و خطاها","بازخورد و دیدگاه جایگزین","اقدام اصلاحی و زمان بازبینی"]}
  };
  const m=map[arr[1]]||map.idea;c.title=m.title;c.objective=m.objective;c.criteria=m.criteria;
 }else if(area==="studio"){
  const tab=arr[1]||"home",map={
   cases:["شرح مسئله و موقعیت قابل راستی‌آزمایی","تفکیک واقعیت، تفسیر و فرضیه","نقش و مرز اختیار مدیر","گزینه‌های تصمیم و Trade-off","اقدام و شاخص نتیجه"],
   daily:["توصیف تجربه بدون قضاوت","تبیین انتخاب نقش و فرض‌های پنهان","دریافت بازخورد یا تفسیر جایگزین","یادگیری و next best step"],
   roleplay:["هدف و نقش گفت‌وگو","پرسش باز و شنود","مرزبندی مسئولیت و اختیار","جمع‌بندی توافق قابل پیگیری"],
   context:["تعیین واحد تحلیل","شواهد بافت کار و کارکنان","تفکیک امروز و افق آینده","تناسب سبک و نیاز واقعی"],
   roles:["دلایل انتخاب Boss/Coach/Partner/Enabler","تفاوت سطح توانمندی و اختیار","تناسب نقش با پیامد مطلوب","پیش‌بینی واکنش کارکنان"],
   action:["اقدام مشخص و قابل مشاهده","مالک اقدام و موعد","معیار موفقیت","نقطه بازبینی"],
   development:["هدف توسعه‌ای روشن","فاصله شایستگی و شواهد","تمرین و فرصت یادگیری","شاخص پیشرفت و بازخورد"]
  };
  c.title="استودیوی رهبری · "+tab;c.objective="به‌کارگیری عملی رویکرد رهبری بازتابی در کار مدیریتی";c.criteria=map[tab]||map.cases;
 }else if(area==="context"){
  c.objective="ارزیابی بافت رهبری با توجه به کار، افراد، زمان و حوزه مشخص";
  c.criteria=["تعریف تیم/حوزه به‌عنوان واحد تحلیل","شواهد به‌جای حدس","تمایز شرایط امروز و آینده","تناسب نیاز حمایت و اختیار"];
 }
 return c;
}
function draftFromPage(){
 const path=routeContext().area;let id=path==="journey"?"ljPractice":path==="coach"?"cj-situation":null;
 if(id&&$(id)&&$(id).value.trim())return trim($(id).value,1800);
 if(path==="studio"||path==="context"||path==="lesson"){
  const frame=path==="studio"?$("studioFrame"):path==="context"?$("contextFrame"):$("courseFrame");
  try{const doc=frame&&frame.contentDocument;if(doc){let focused=doc.activeElement;const candidates=[focused,...doc.querySelectorAll("textarea")].filter(x=>x&&x.matches&&x.matches("textarea")&&x.value.trim()&&x.offsetParent!==null);if(candidates.length)return trim(candidates[0].value,1800)}}catch(e){}
 }
 return "";
}
function coachLocal(mode,c,draft){
 const intro="این راهنمای اولیه از محتوای آموزشی همین مرحله استخراج شده و تحلیل Generative AI نیست.";
 if(mode==="review"){
  if(!draft)return intro+"\n\nمتنی پیدا نشد. متن خود را در باکس پرسش این پنل paste کنید یا ابتدا تمرین همین مرحله را بنویسید.";
  const criteria=c.criteria&&c.criteria.length?c.criteria:["شرح روشن موقعیت و شواهد","تناسب نقش مدیر با بافت","رفتار یا تصمیم قابل مشاهده","معیار و زمان پیگیری"];
  return intro+"\n\nبرای self-review نوشته خود، این معیارها را بررسی کنید:\n• "+criteria.join("\n• ")+"\n\nبررسی دقیق انطباق متن شما، تشخیص اشکالات روش و پیشنهاد بازنویسی به اتصال Live AI نیاز دارد.";
 }
 if(mode==="reflect")return intro+"\n\nWhat might you be overlooking? کدام فرض هنوز شاهد کافی ندارد؟ چه پیامدی برای تیم ممکن است ناخواسته ایجاد شود؟";
 if(mode==="next")return intro+"\n\nیک اقدام کوچک تعریف کنید: چه کاری؟ با چه کسی؟ تا چه زمانی؟ با کدام evidence از تحقق نتیجه؟";
 return intro+"\n\n"+(c.objective?"هدف این بخش: "+c.objective+"\n\n":"")+(c.concept?"مبنای آموزشی: "+c.concept+"\n\n":"")+(c.practice?"تمرین پیشنهادی: "+c.practice:"برای شروع، یک موقعیت واقعی اما غیرمحرمانه را توصیف کنید و از خود بپرسید چه نقش مدیریتی مناسب این بافت است.");
}
function show(value,kind){
 let log=$("sabaAiLog");const item=document.createElement("div");item.className="saba-ai-message saba-ai-"+(kind||"coach");item.setAttribute("dir","auto");item.textContent=value;log.appendChild(item);log.scrollTop=log.scrollHeight;while(log.children.length>16)log.removeChild(log.firstChild);
}
function open(){
 previousFocus=document.activeElement;
 $("sabaAiPanel").hidden=false;$("sabaAiFab").setAttribute("aria-expanded","true");updateContext();status();$("sabaAiQuestion").focus();
}
function close(){
 $("sabaAiPanel").hidden=true;$("sabaAiFab").setAttribute("aria-expanded","false");
 if(previousFocus&&typeof previousFocus.focus==="function")previousFocus.focus();else $("sabaAiFab").focus();
}
function updateContext(){
 const c=routeContext();
 $("sabaAiWhere").textContent=c.title+(c.stageNumber?" · مرحله "+c.stageNumber+" از ۱۰":"");
 $("sabaAiStageNote").textContent=c.assessmentMode==="competitive_locked"?"حالت رقابتی: پاسخ صحیح و کلید نمره‌دهی پیش از پایان نمایش داده نمی‌شود.":"کوچ در بستر همین صفحه، چارچوب و تمرین مربوط را می‌شناسد.";
}
async function run(mode){
 if(inFlight)return;
 const c=routeContext();const typed=trim($("sabaAiQuestion").value,1500);
 const draft=mode==="review"?(draftFromPage()||typed):draftFromPage();
 if(mode==="review"&&!draft){show("ابتدا نوشته خود را در همین اپ یا کادر پرسش وارد کنید.","system");return}
 if(mode==="ask"&&!typed){show("پرسش خود را وارد کنید.","system");return}
 const question=typed||(mode==="guide"?"این مرحله را گام‌به‌گام توضیح بده.":mode==="review"?"نوشته مرا با معیارهای همین مرحله ارزیابی کن.":mode==="reflect"?"یک پرسش بازاندیشی عمیق مطرح کن.":"اقدام بعدی قابل اجرا چیست؟");
 show((methods[mode]||"پرسش")+": "+question,"user");
 const cfg=config();if(!cfg){show(coachLocal(mode,c,draft),"local");return}
 if(!$("sabaAiConsent").checked){show("برای ارسال پرسش و نوشته به سرویس AI، ابتدا رضایت ارسال را فعال کنید. در غیر این صورت «راهنمای محلی» در دسترس است.","system");return}
 const token=await getAccessToken();if(!token){show("ابتدا از قسمت ورود سازمانی وارد شوید. بدون ورود، متن به بیرون ارسال نمی‌شود.","system");return}
 inFlight=true;$("sabaAiSend").disabled=true;const ctl=new AbortController();const timer=setTimeout(()=>ctl.abort(),35000);
 try{
  const h={"Authorization":"Bearer "+token,"Content-Type":"application/json"};
  if(cfg.provider==="supabase")h.apikey=cfg.key;
  const r=await fetch(cfg.endpoint,{method:"POST",mode:"cors",credentials:"omit",headers:h,body:JSON.stringify({mode,question,draft,context:c,history:history.slice(-4),consent:true}),signal:ctl.signal});
  const data=await r.json().catch(()=>({}));
  if(!r.ok||typeof data.answer!=="string")throw new Error(String(data.error||"connection_failure"));
  const answer=trim(data.answer,5500);show(answer+"\n\nبازخورد AI یک ابزار توسعه‌ای است، نه ارزیابی رسمی عملکرد یا حکم قطعی روش‌شناختی.","coach");
  history.push({question:question.slice(0,400),answer:answer.slice(0,1100)});history=history.slice(-4);
  $("sabaAiQuestion").value="";
 }catch(e){show("پاسخ Live AI دریافت نشد. "+(e.name==="AbortError"?"زمان اتصال پایان یافت.":"اتصال، مجوز یا سهمیه را بررسی کنید.")+" راهنمای محلی همچنان قابل استفاده است.","system")}
 finally{clearTimeout(timer);inFlight=false;$("sabaAiSend").disabled=false}
}
function boot(){
 if($("sabaAiFab"))return;session=readSession();
 const root=document.createElement("div");root.id="sabaAiRoot";root.dir="rtl";
 root.innerHTML=`<button type="button" id="sabaAiFab" class="saba-ai-fab" aria-controls="sabaAiPanel" aria-expanded="false"><span aria-hidden="true">✦</span> کوچ همراه</button>
 <aside id="sabaAiPanel" class="saba-ai-panel" role="dialog" aria-label="کوچ همراه رهبری" aria-modal="false" hidden>
 <header class="saba-ai-header"><div><strong>کوچ همراه رهبری</strong><small id="sabaAiStatus"></small></div><button type="button" id="sabaAiClose" aria-label="بستن پنل کوچ">×</button></header>
 <div class="saba-ai-context"><strong id="sabaAiWhere"></strong><p id="sabaAiStageNote"></p></div>
 <div class="saba-ai-actions" role="group" aria-label="روش راهنمایی">
  <button type="button" data-saba-mode="guide">توضیح مرحله</button>
  <button type="button" data-saba-mode="review">بررسی نوشته من</button>
  <button type="button" data-saba-mode="reflect">بازاندیشی</button>
  <button type="button" data-saba-mode="next">اقدام بعدی</button>
 </div>
 <div id="sabaAiLog" class="saba-ai-log" aria-live="polite" aria-label="گفت‌وگو با کوچ"></div>
 <label class="saba-ai-input-label" for="sabaAiQuestion">سؤال یا نوشته من</label>
 <textarea id="sabaAiQuestion" rows="3" maxlength="1500" placeholder="مثلاً: در این متن نقش Coach را درست به کار برده‌ام؟ کجای استدلالم نیاز به اصلاح دارد؟"></textarea>
 <label class="saba-ai-consent"><input id="sabaAiConsent" type="checkbox"> فقط با درخواست من، متن و بافت آموزشی همین مرحله برای پردازش AI ارسال شود.</label>
 <button type="button" id="sabaAiSend" class="saba-ai-primary">ارسال پرسش / راهنمای محلی</button>
 <section id="sabaAiAuth" class="saba-ai-auth" aria-label="ورود سازمانی" hidden><details><summary>ورود به Live AI سازمانی</summary>
 <div id="sabaAiPilotAuth" hidden><label for="sabaAiPilotCode">کد اختصاصی شرکت‌کننده Pilot</label><input id="sabaAiPilotCode" type="password" autocomplete="off" spellcheck="false" maxlength="80" placeholder="snp_…"><small>کد شخصی، موقت و قابل ابطال است. به دیگران ندهید؛ فقط Hash آن در پایگاه داده نگهداری می‌شود.</small></div>
 <div id="sabaAiSupabaseAuth" hidden><label for="sabaAiEmail">ایمیل حساب دعوت‌شده</label><input id="sabaAiEmail" type="email" autocomplete="email" placeholder="name@organization.com">
 <label for="sabaAiPassword">رمز عبور</label><input id="sabaAiPassword" type="password" autocomplete="current-password" placeholder="رمز حساب سازمانی"><small>ورود سازمانی؛ رمز فقط برای Supabase Auth فرستاده می‌شود.</small></div>
 <button type="button" id="sabaAiSignIn">تأیید دسترسی امن</button></details></section>
 <button type="button" id="sabaAiLogout" class="saba-ai-logout" hidden>خروج از حساب AI</button>
 <p class="saba-ai-warning">اطلاعات محرمانه اشخاص، قراردادها، پروژه‌ها و داده‌های حساس را وارد نکنید. راهنمای محلی بدون ارسال داده کار می‌کند.</p>
 </aside>`;
 document.body.appendChild(root);
 $("sabaAiFab").addEventListener("click",()=> $("sabaAiPanel").hidden?open():close());
 $("sabaAiClose").addEventListener("click",close);
 $("sabaAiSend").addEventListener("click",()=>run("ask"));
 root.querySelectorAll("[data-saba-mode]").forEach(b=>b.addEventListener("click",()=>run(b.dataset.sabaMode)));
 $("sabaAiSignIn").addEventListener("click",signIn);
 $("sabaAiLogout").addEventListener("click",()=>{setSession(null);history=[];show("از حساب AI خارج شدید.","system")});
 window.addEventListener("hashchange",()=>{updateContext();history=[]});
 document.addEventListener("keydown",e=>{if(e.key==="Escape"&&!$("sabaAiPanel").hidden)close()});
 document.addEventListener("click",e=>{const b=e.target.closest("#cj-ask-ai");if(b&&b.disabled&&config()){e.preventDefault();open()}});
 status();updateContext();
}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",boot);else boot();
})();