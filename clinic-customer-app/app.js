const IMG={
  hero:"https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=1200&q=85",
  skin:"https://images.unsplash.com/photo-1556228578-0d85b1a4d571?auto=format&fit=crop&w=1000&q=85",
  care:"https://images.unsplash.com/photo-1611930022073-b7a4ba5fcccd?auto=format&fit=crop&w=1000&q=85",
  product:"https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?auto=format&fit=crop&w=900&q=85",
  spa:"https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=1000&q=85",
  beauty:"https://images.unsplash.com/photo-1515377905703-c4788e51af15?auto=format&fit=crop&w=1000&q=85",
  serum:"https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=900&q=85",
  clinic:"https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?auto=format&fit=crop&w=1000&q=85"
};

const services=[
 {name:"فیلر",icon:"💉",image:IMG.beauty,sessions:"۱ جلسه",before:["مشاوره پزشک","اعلام داروها"],after:["فشار ندهید","پیگیری غیرعادی"]},
 {name:"بوتاکس",icon:"🌿",image:IMG.skin,sessions:"۱ جلسه",before:["مشاوره پزشکی","بررسی منع مصرف"],after:["ماساژ ندهید","طبق توصیه پزشک"]},
 {name:"جوان‌سازی",icon:"✨",image:IMG.spa,sessions:"چند جلسه",before:["ارزیابی پوست","انتخاب پروتکل"],after:["ضدآفتاب","مراقبت منظم"]},
 {name:"نخ",icon:"🧵",image:IMG.beauty,sessions:"با نظر پزشک",before:["انتظار واقع‌بینانه","شرح سوابق"],after:["محدودیت حرکتی","پیگیری"]},
 {name:"مزوتراپی مو",icon:"🌱",image:IMG.clinic,sessions:"دوره‌ای",before:["بررسی علت ریزش","شرح درمان‌ها"],after:["فاصله جلسات","محصول مناسب"]},
 {name:"پی‌آرپی",icon:"🩸",image:IMG.hero,sessions:"۳–۵ جلسه",before:["آب کافی","بررسی سوابق"],after:["مراقبت محل","پیگیری جلسات"]},
 {name:"فیلر بادی",icon:"◌",image:IMG.beauty,sessions:"با نظر پزشک",before:["مشاوره حضوری","تعیین هدف"],after:["پیگیری نزدیک","مراقبت اختصاصی"]},
 {name:"لاغری",icon:"⚖️",image:IMG.care,sessions:"چند جلسه",before:["هدف‌گذاری","بررسی سوابق"],after:["تداوم برنامه","ثبت تغییرات"]},
 {name:"لیزر موهای زائد",icon:"☀️",image:IMG.clinic,sessions:"دوره‌ای",before:["اصلاح طبق دستور","بدون آفتاب شدید"],after:["ضدآفتاب","فاصله جلسات"]},
 {name:"لیزر کیوسوییچ",icon:"✦",image:IMG.skin,sessions:"با نظر پزشک",before:["ارزیابی پوست","عدم برنزه‌کردن"],after:["ترمیم‌کننده","ضدآفتاب"]},
 {name:"فیشیال",icon:"🫧",image:IMG.hero,sessions:"قابل تکرار",before:["بررسی حساسیت","اعلام درمان اخیر"],after:["آبرسان","محصول ملایم"]}
];

const products=[
 {name:"ضدآفتاب",icon:"☀️",image:IMG.product},
 {name:"سرم آبرسان",icon:"💧",image:IMG.serum},
 {name:"کرم ترمیم‌کننده",icon:"🧴",image:IMG.spa},
 {name:"مراقبت مو",icon:"🌿",image:IMG.clinic},
 {name:"پاک‌کننده",icon:"🫧",image:IMG.hero},
 {name:"سرم تخصصی",icon:"✨",image:IMG.skin}
];

let currentPage="home";
let deferredPrompt=null;
const pages=[...document.querySelectorAll(".page")];
const backBtn=document.getElementById("backBtn");
const toast=document.getElementById("toast");
const installBtn=document.getElementById("installBtn");
const installCardBtn=document.getElementById("installCardBtn");
const installCard=document.getElementById("installCard");

function showToast(msg){
 toast.textContent=msg;toast.classList.add("show");
 clearTimeout(showToast.t);showToast.t=setTimeout(()=>toast.classList.remove("show"),2400);
}

function go(page,push=true){
 if(!document.querySelector('[data-page="'+page+'"]')) page="home";
 currentPage=page;
 pages.forEach(p=>p.classList.toggle("active",p.dataset.page===page));
 backBtn.hidden=page==="home";
 document.querySelectorAll(".bottom-nav [data-go]").forEach(b=>b.classList.toggle("active",b.dataset.go===page));
 if(push) history.pushState({page},"","#"+page);
 window.scrollTo({top:0,behavior:"smooth"});
 document.getElementById("app").focus({preventScroll:true});
}

function renderServices(){
 const box=document.getElementById("servicesList");
 box.innerHTML=services.map((s,i)=>`<button class="service-card visual-service" data-service-index="${i}">
   <img src="${s.image}" alt="${s.name}" loading="lazy">
   <span class="service-label"><b>${s.icon}</b><strong>${s.name}</strong></span>
 </button>`).join("");
 document.getElementById("bookingService").innerHTML='<option value="">انتخاب کنید</option>'+services.map(s=>`<option>${s.name}</option>`).join("");
}

function openService(index){
 const s=services[index];
 if(!s)return;
 document.getElementById("serviceDetail").innerHTML=`
  <div class="service-photo-hero">
    <img src="${s.image}" alt="${s.name}">
    <div><span>${s.icon}</span><h1>${s.name}</h1></div>
  </div>
  <div class="mini-info-grid">
    <div><span>🕒</span><small>جلسات</small><strong>${s.sessions}</strong></div>
    <div><span>✅</span><small>قبل</small><strong>${s.before[0]}</strong></div>
    <div><span>💗</span><small>بعد</small><strong>${s.after[0]}</strong></div>
  </div>
  <div class="care-mini">
    <div><span>قبل</span>${s.before.map(x=>'<b>• '+x+'</b>').join("")}</div>
    <div><span>بعد</span>${s.after.map(x=>'<b>• '+x+'</b>').join("")}</div>
  </div>
  <button class="primary full big-cta" id="detailBooking">📅 نوبت ${s.name}</button>`;
 go("service");
 document.getElementById("detailBooking").onclick=()=>{document.getElementById("bookingService").value=s.name;go("booking");};
}

function renderProducts(){
 document.getElementById("productsList").innerHTML=products.map(p=>`<article class="product-card visual-product">
  <img src="${p.image}" alt="${p.name}" loading="lazy">
  <div><span>${p.icon}</span><strong>${p.name}</strong></div>
  <button data-product="${p.name}">مشاوره</button>
 </article>`).join("");
}

document.addEventListener("click",e=>{
 const goBtn=e.target.closest("[data-go]");
 if(goBtn){go(goBtn.dataset.go);return;}
 const serviceBtn=e.target.closest("[data-service-index]");
 if(serviceBtn){openService(Number(serviceBtn.dataset.serviceIndex));return;}
 const homeService=e.target.closest("[data-service]");
 if(homeService){const i=services.findIndex(s=>s.name===homeService.dataset.service);openService(i);return;}
 const placeholder=e.target.closest("[data-placeholder]");
 if(placeholder){showToast(placeholder.dataset.placeholder);return;}
 const product=e.target.closest("[data-product]");
 if(product){showToast("🧴 "+product.dataset.product+" — درخواست مشاوره در نسخه بعدی مستقیم ارسال می‌شود.");}
});

backBtn.addEventListener("click",()=>history.length>1?history.back():go("home"));
window.addEventListener("popstate",e=>go((e.state&&e.state.page)||location.hash.replace("#","")||"home",false));

document.getElementById("bookingForm").addEventListener("submit",e=>{
 e.preventDefault();
 const data={
  service:document.getElementById("bookingService").value,
  branch:document.getElementById("bookingBranch").value,
  time:document.getElementById("bookingTime").value,
  name:document.getElementById("bookingName").value.trim(),
  phone:document.getElementById("bookingPhone").value.trim(),
  createdAt:new Date().toISOString()
 };
 localStorage.setItem("clinic-booking-demo",JSON.stringify(data));
 const result=document.getElementById("bookingResult");
 result.hidden=false;
 result.innerHTML="<strong>✓ ثبت شد</strong><br>نسخه آزمایشی";
 e.target.reset();
});

window.addEventListener("beforeinstallprompt",e=>{
 e.preventDefault();deferredPrompt=e;if(installCard)installCard.hidden=false;
});
async function installApp(){
 if(deferredPrompt){
  deferredPrompt.prompt();await deferredPrompt.userChoice;deferredPrompt=null;
 }else{
  showToast("از منوی مرورگر «نصب برنامه» را بزنید.");
 }
}
if(installBtn) installBtn.addEventListener("click",installApp);
if(installCardBtn) installCardBtn.addEventListener("click",installApp);
window.addEventListener("appinstalled",()=>{if(installCard)installCard.hidden=true;showToast("✓ نصب شد");});

if(navigator.userAgent.includes("ClinicCustomerAndroid")){
 if(installCard) installCard.hidden=true;
 if(installBtn) installBtn.hidden=true;
}

renderServices();renderProducts();
const initial=location.hash.replace("#","")||"home";
history.replaceState({page:initial},"","#"+initial);go(initial,false);

if("serviceWorker" in navigator){
 window.addEventListener("load",()=>navigator.serviceWorker.register("./sw.js",{scope:"./",updateViaCache:"none"}).catch(()=>{}));
}
