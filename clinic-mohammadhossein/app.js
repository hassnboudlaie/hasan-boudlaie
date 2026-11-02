"use strict";
const WISH_KEY="mh_clinic_favorites_v1";
let favorites=new Set();
try{let v=JSON.parse(localStorage.getItem(WISH_KEY)||"[]");if(Array.isArray(v))favorites=new Set(v.filter(x=>typeof x==="string"))}catch(_){}
const $=s=>document.querySelector(s), $$=s=>Array.from(document.querySelectorAll(s));
const number=n=>new Intl.NumberFormat("fa-IR").format(n);
const clean=s=>String(s||"").trim().replace(/[<>&]/g,"");
let installPrompt=null, currentDraft="", currentTopic="";
function toast(str){let n=$("#toast");if(!n)return;n.textContent=str;n.classList.add("show");clearTimeout(toast.timer);toast.timer=setTimeout(()=>n.classList.remove("show"),4500)}
function saveWish(){try{localStorage.setItem(WISH_KEY,JSON.stringify([...favorites]))}catch(_){toast("ذخیره علاقه‌مندی‌ها در این مرورگر ممکن نیست.")}}
function updateWish(){let n=$("#wishCount");if(n)n.textContent=number(favorites.size);$$("[data-wish]").forEach(el=>{let yes=favorites.has(el.dataset.wish);el.classList.toggle("active",yes);el.setAttribute("aria-pressed",yes?"true":"false");el.setAttribute("aria-label",(yes?"حذف از":"افزودن به")+" علاقه‌مندی‌ها: "+el.dataset.wish);el.textContent=yes?"♥":"♡"})}
function showDialog(el){if(!el)return;if(typeof el.showModal==="function")el.showModal();else el.setAttribute("open","")}
function hideDialog(el){if(!el)return;if(typeof el.close==="function")el.close();else el.removeAttribute("open")}
function openBooking(topic){const dialog=$("#bookingDialog");currentTopic=topic||"";$("#bookingResult").hidden=true;$("#consultForm").hidden=false;$("#consultForm").reset();if(currentTopic){const opt=Array.from($("#topicSelect").options).find(x=>x.value===currentTopic);$("#topicSelect").value=opt?currentTopic:"استعلام محصولات"}
showDialog(dialog);setTimeout(()=>$("#consultForm").querySelector('input[name="name"]')?.focus(),80)}
function getRequest(data){return ["درخواست مشاوره کلینیک زیبایی — پیش‌نویس ارسال‌نشده","نام: "+clean(data.get("name")),"شماره تماس: "+clean(data.get("phone")),"موضوع: "+clean(data.get("topic")),"زمان ترجیحی: "+clean(data.get("time")),"توضیح: "+(clean(data.get("note"))||"ثبت نشده"),"","توجه: این متن هنوز برای کلینیک ارسال نشده و هیچ نوبتی ثبت نشده است."].join("\n")}
document.addEventListener("click",e=>{
const booking=e.target.closest("[data-open-booking]");if(booking){e.preventDefault();openBooking(booking.dataset.bookTopic);return}
const interest=e.target.closest("[data-product-interest]");if(interest){e.preventDefault();openBooking("استعلام محصولات");toast("موضوع محصول: "+interest.dataset.productInterest+"؛ می‌توانید نام محصول را در توضیحات ذکر کنید.");return}
const wish=e.target.closest("[data-wish]");if(wish){let id=wish.dataset.wish;if(favorites.has(id)){favorites.delete(id);toast("از علاقه‌مندی‌ها حذف شد.")}else{favorites.add(id);toast("به علاقه‌مندی‌ها اضافه شد.")}saveWish();updateWish();return}
const close=e.target.closest("#closeBooking");if(close){hideDialog($("#bookingDialog"));return}
const closeFav=e.target.closest("#closeFavorites");if(closeFav){hideDialog($("#favoritesDialog"));return}
if(e.target.closest("#wishBtn")){const content=$("#favoritesContent");content.innerHTML=favorites.size?'<p>دسته‌بندی‌های مورد علاقه شما (فقط روی این دستگاه ذخیره شده‌اند):</p><ul>'+[...favorites].map(x=>'<li>'+x+'</li>').join("")+'</ul><p>این بخش فهرست علاقه‌مندی است؛ سفارش یا خرید محسوب نمی‌شود.</p>':'<p>هنوز محصول یا دسته‌بندی‌ای به فهرست علاقه‌مندی‌ها اضافه نکرده‌اید.</p>';showDialog($("#favoritesDialog"));return}
if(e.target.closest("#copyRequest")){const s=$("#requestText").value;const done=()=>toast("متن پیش‌نویس کپی شد؛ هنوز ارسال نشده است.");if(navigator.clipboard&&window.isSecureContext)navigator.clipboard.writeText(s).then(done).catch(()=>{let t=$("#requestText");t.select();document.execCommand("copy");done()});else{let t=$("#requestText");t.select();document.execCommand("copy");done()}return}
if(e.target.closest("#newRequest")){$("#bookingResult").hidden=true;$("#consultForm").hidden=false;$("#consultForm").reset();return}
if(e.target.closest("#menuBtn")){const menu=$("#mobileMenu"),isOpen=!menu.hidden;menu.hidden=isOpen;$("#menuBtn").setAttribute("aria-expanded",isOpen?"false":"true");return}
if(e.target.closest("#mobileMenu a")){$("#mobileMenu").hidden=true;$("#menuBtn").setAttribute("aria-expanded","false")}
if(e.target.closest("#mobileMenu button")){$("#mobileMenu").hidden=true;$("#menuBtn").setAttribute("aria-expanded","false")}
if(e.target.closest("#installFooter,#mobileInstall")){install();return}
});
$("#consultForm").addEventListener("submit",e=>{e.preventDefault();let f=e.currentTarget;if(!f.reportValidity())return;const data=new FormData(f);if(!data.get("consent"))return;currentDraft=getRequest(data);$("#requestText").value=currentDraft;f.hidden=true;$("#bookingResult").hidden=false;toast("پیش‌نویس ساخته شد؛ برای ارسال آماده‌سازی نهایی لازم است.")});
$("#bookingDialog").addEventListener("click",e=>{if(e.target===$("#bookingDialog"))hideDialog(e.target)});
$("#favoritesDialog").addEventListener("click",e=>{if(e.target===$("#favoritesDialog"))hideDialog(e.target)});
document.addEventListener("keydown",e=>{if(e.key==="Escape"){$("#mobileMenu").hidden=true;$("#menuBtn").setAttribute("aria-expanded","false")}});
window.addEventListener("beforeinstallprompt",e=>{e.preventDefault();installPrompt=e});
async function install(){if(installPrompt){installPrompt.prompt();try{const r=await installPrompt.userChoice;if(r.outcome==="accepted")toast("درخواست نصب دریافت شد.")}catch(_){}installPrompt=null}else{const ios=/iPad|iPhone|iPod/.test(navigator.userAgent);toast(ios?"در Safari گزینه Share و سپس Add to Home Screen را بزنید.":"در Chrome از منوی سه‌نقطه گزینه «نصب برنامه» یا «افزودن به صفحه اصلی» را انتخاب کنید.")}}
window.addEventListener("appinstalled",()=>toast("اپ کلینیک با موفقیت نصب شد."));
$$("img").forEach(img=>img.addEventListener("error",()=>{img.classList.add("image-failed");let parent=img.parentElement;if(parent)parent.classList.add("image-unavailable")}));
if("serviceWorker" in navigator)window.addEventListener("load",()=>navigator.serviceWorker.register("./sw.js",{scope:"./"}).catch(err=>console.warn("Offline service unavailable",err)));
updateWish();