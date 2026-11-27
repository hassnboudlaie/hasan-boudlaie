/* Private acknowledgement inbox; the server verifies the existing classroom session. */
(()=>{
"use strict";
const api="https://hxcjkewlaniahvuqwwbb.supabase.co/functions/v1/mba-ob-acknowledgements",store="mba-ob-classroom-attendance-identity-v1";
const kinds={quiz:"آزمون",assignment:"تکلیف",case:"تحلیل کیس"};
const fa=n=>String(n).replace(/[0-9]/g,x=>"۰۱۲۳۴۵۶۷۸۹"[Number(x)]);
const make=(tag,txt)=>{const e=document.createElement(tag);if(txt)e.textContent=txt;return e};
const date=x=>{try{return new Date(x).toLocaleString("fa-IR",{timeZone:"Asia/Tehran",dateStyle:"short",timeStyle:"short"})}catch{return ""}};
let role="",token="",button=null,dialog=null,body=null,busy=false;
async function request(action,args={}){
 const r=await fetch(api,{method:"POST",cache:"no-store",headers:{"Content-Type":"application/json"},body:JSON.stringify({action,token,...args})});
 const d=await r.json();if(!r.ok||!d.ok)throw Error("request");return d;
}
function mount(){
 const access=document.documentElement.dataset.access;
 let cred;try{cred=JSON.parse(localStorage.getItem(store)||"null")}catch{return}
 if(!["student","teacher"].includes(access)||cred?.role!==access||!cred.token){button?.remove();dialog?.remove();button=dialog=null;role=token="";return}
 if(button?.isConnected&&role===access&&token===cred.token)return;
 button?.remove();dialog?.remove();role=access;token=cred.token;
 const header=document.querySelector(".header-actions");if(!header)return;
 button=make("button",role==="teacher"?"پیگیری تکالیف":"اعلان‌ها");button.type="button";button.className="icon-btn";button.style.cssText="width:auto;padding:0.45rem 0.65rem;white-space:nowrap;font:inherit;font-size:.8rem";header.prepend(button);
 dialog=make("dialog");dialog.dir="rtl";dialog.setAttribute("aria-label",role==="teacher"?"پیگیری تکالیف":"اعلان‌های من");
 dialog.style.cssText="width:min(92vw,560px);max-height:80vh;overflow:auto;border:1px solid #999;border-radius:16px;padding:1rem;background:Canvas;color:CanvasText;box-shadow:0 12px 45px #0003";
 const h=make("h2",role==="teacher"?"پیگیری تکالیف":"اعلان‌های من");h.style.fontSize="1.15rem";
 const close=make("button","بستن");close.type="button";close.style.cssText="float:left;font:inherit;padding:.35rem .7rem";close.onclick=()=>dialog.close();
 body=make("div");dialog.append(close,h,body);document.body.append(dialog);
 button.onclick=()=>{if(!dialog.open)dialog.showModal();load(true)};
 if(role==="student")load(false);
}
async function load(open){
 if(!button||busy)return;busy=true;
 try{
 const activeRole=role,activeToken=token;
 if(open)body.replaceChildren(make("p","در حال دریافت اطلاعات…"));
 const d=await request(role==="teacher"?"list":"my");
 if(activeRole!==role||activeToken!==token)return;
 const items=d.items||[];
 if(role==="student"){
  const unread=items.filter(x=>!x.read_at).length;
  button.textContent=unread?"اعلان‌ها ("+fa(unread)+")":"اعلان‌ها";
  if(!open)return;
  body.replaceChildren();
  if(!items.length)body.append(make("p","هنوز اعلانی برای شما ثبت نشده است."));
  for(const item of items){
   const card=make("article");card.style.cssText="padding:.8rem 0;border-bottom:1px solid #9995";
   card.append(make("strong","تکلیف شما ملاحظه شد"),make("p","دانشجوی عزیز، "+kinds[item.submission_kind]+" جلسه "+fa(item.session_no)+" شما توسط استاد ملاحظه شد. از پیگیری و تلاش شما سپاسگزاریم. موفق و پایدار باشید."),make("small",date(item.created_at)));
   body.append(card);
  }
  if(unread){await request("read");button.textContent="اعلان‌ها";}
 }else if(open){
  body.replaceChildren(make("p","پس از ملاحظه رسید یا تکلیف، دکمه تأیید را بزنید تا دانشجو پیام دریافت کند. این تأیید به معنی نمره‌دهی نیست."));
  if(!items.length)body.append(make("p","هنوز تکلیفی ثبت نشده است."));
  for(const item of items){
   const card=make("article");card.style.cssText="padding:.8rem 0;border-bottom:1px solid #9995";
   card.append(make("strong",item.mba_ob_students?.full_name||"دانشجو"),make("p",kinds[item.kind]+" جلسه "+fa(item.session_no)+" · "+date(item.submitted_at)));
   const action=make("button",item.ack?(item.ack.read_at?"دانشجو مشاهده کرده":"اعلان ثبت شده"):"ملاحظه شد؛ ارسال اعلان");action.type="button";action.disabled=!!item.ack;action.style.cssText="font:inherit;padding:.5rem .8rem;border-radius:8px";
   action.onclick=async()=>{action.disabled=true;try{await request("ack",{kind:item.kind,id:item.id});action.textContent="اعلان ثبت شده"}catch{action.disabled=false;action.textContent="ارسال ناموفق؛ تلاش مجدد"}};
   card.append(action);body.append(card);
  }
 }
 }catch{if(open)body?.replaceChildren(make("p","ارتباط با سامانه برقرار نشد. دوباره تلاش کنید."))}
 finally{busy=false}
}
setInterval(mount,1000);mount();
setInterval(()=>{if(role==="student"&&!document.hidden)load(false)},30000);
document.addEventListener("visibilitychange",()=>{if(!document.hidden){mount();if(role==="student")load(false)}});
})();