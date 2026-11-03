const services=[
 {name:"فیلر",icon:"💉",short:"فرم‌دهی و اصلاح حجم",sessions:"معمولاً یک جلسه با ارزیابی دوره‌ای",before:["عدم مصرف خودسرانه داروهای رقیق‌کننده خون","اطلاع به پزشک درباره حساسیت یا بیماری زمینه‌ای"],after:["پرهیز از فشار و ماساژ محل مگر با دستور پزشک","پیگیری در صورت تورم یا درد غیرعادی"]},
 {name:"بوتاکس",icon:"🌿",short:"کاهش خطوط ناشی از حرکت عضلات",sessions:"معمولاً یک جلسه با ارزیابی نتیجه",before:["مشاوره پزشکی و بررسی سابقه دارویی","عدم انجام در صورت وجود منع پزشکی"],after:["از ماساژ محل خودداری کنید","توصیه‌های پزشک درباره فعالیت روزانه را رعایت کنید"]},
 {name:"جوان‌سازی",icon:"✨",short:"بهبود کیفیت و شادابی پوست",sessions:"بسته به روش، معمولاً چند جلسه",before:["ارزیابی پوست و انتخاب پروتکل مناسب","اعلام سابقه حساسیت پوستی"],after:["استفاده منظم از ضدآفتاب","رعایت برنامه مراقبتی پیشنهادی"]},
 {name:"نخ",icon:"🧵",short:"خدمت تخصصی برای لیفت و اصلاح فرم",sessions:"بر اساس ارزیابی پزشک",before:["مشاوره دقیق و تعیین انتظار واقع‌بینانه","بررسی داروها و بیماری‌های زمینه‌ای"],after:["رعایت محدودیت‌های حرکتی توصیه‌شده","پیگیری طبق برنامه پزشک"]},
 {name:"مزوتراپی مو",icon:"🌱",short:"برنامه تقویتی برای پوست سر و مو",sessions:"معمولاً چند جلسه دوره‌ای",before:["بررسی علت ریزش مو","ثبت داروها و درمان‌های قبلی"],after:["رعایت فاصله زمانی جلسات","استفاده از محصولات توصیه‌شده"]},
 {name:"پی‌آرپی",icon:"🩸",short:"درمان مبتنی بر پلاسمای خود فرد",sessions:"معمولاً ۳ تا ۵ جلسه بر اساس نیاز",before:["آب کافی و وضعیت عمومی مناسب","مشاوره و بررسی سابقه پزشکی"],after:["رعایت توصیه‌های محل تزریق","پیگیری منظم جلسات"]},
 {name:"فیلر بادی",icon:"◌",short:"اصلاح حجم و فرم بدن",sessions:"کاملاً وابسته به ارزیابی پزشک",before:["مشاوره حضوری الزامی","تعیین هدف و میزان موردنیاز"],after:["پیگیری نزدیک طبق دستور پزشک","رعایت مراقبت‌های اختصاصی"]},
 {name:"لاغری",icon:"⚖️",short:"برنامه چندجلسه‌ای متناسب با شرایط فرد",sessions:"بر اساس نوع برنامه و هدف",before:["ارزیابی اولیه و تعیین هدف","بررسی سوابق پزشکی"],after:["تداوم برنامه و جلسات","ثبت تغییرات و پیگیری"]},
 {name:"لیزر موهای زائد",icon:"☀️",short:"جلسات منظم برای کاهش موهای زائد",sessions:"چندجلسه‌ای و دوره‌ای",before:["اصلاح مو طبق دستور مرکز","پرهیز از آفتاب شدید"],after:["ضدآفتاب در نواحی در معرض نور","رعایت فاصله جلسات"]},
 {name:"لیزر کیوسوییچ",icon:"✦",short:"خدمات پوستی بر اساس تشخیص",sessions:"وابسته به نوع ضایعه و پاسخ پوست",before:["ارزیابی پوست و نوع ضایعه","پرهیز از آفتاب و برنزه‌کردن"],after:["مراقبت دقیق از پوست","ضدآفتاب و ترمیم‌کننده طبق توصیه"]},
 {name:"فیشیال",icon:"🫧",short:"پاک‌سازی و مراقبت غیرتهاجمی پوست",sessions:"قابل تکرار بر اساس نوع پوست",before:["بررسی حساسیت و وضعیت پوست","اعلام درمان‌های پوستی اخیر"],after:["مرطوب‌کننده و ضدآفتاب","پرهیز از محصولات محرک در ساعات اول"]}
];

const products=[
 {name:"ضدآفتاب",icon:"☀️",desc:"مناسب برای مراقبت روزانه و بسیاری از خدمات پوستی."},
 {name:"سرم آبرسان",icon:"💧",desc:"برای حفظ رطوبت و آرام‌سازی پوست."},
 {name:"کرم ترمیم‌کننده",icon:"🧴",desc:"برای برخی مراقبت‌های بعد از درمان، با توصیه پزشک."},
 {name:"محصولات مو",icon:"🌿",desc:"مراقبت مکمل در برنامه‌های تقویت مو."},
 {name:"پاک‌کننده ملایم",icon:"🫧",desc:"مناسب برای روتین پوستی ساده و منظم."},
 {name:"سرم تخصصی پوست",icon:"✨",desc:"انتخاب بر اساس نوع پوست و نیاز واقعی فرد."}
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
 clearTimeout(showToast.t);showToast.t=setTimeout(()=>toast.classList.remove("show"),2800);
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
 box.innerHTML=services.map((s,i)=>`<button class="service-card" data-service-index="${i}">
   <span class="service-icon">${s.icon}</span><span class="service-copy"><strong>${s.name}</strong><small>${s.short}</small></span><span class="arrow">‹</span>
 </button>`).join("");
 document.getElementById("bookingService").innerHTML='<option value="">انتخاب کنید</option>'+services.map(s=>`<option>${s.name}</option>`).join("");
}

function openService(index){
 const s=services[index];
 if(!s)return;
 document.getElementById("serviceDetail").innerHTML=`
  <div class="detail-hero"><div class="big-icon">${s.icon}</div><span class="pill">خدمات کلینیک</span><h1>${s.name}</h1><p>${s.short}</p></div>
  <div class="detail-grid">
   <div class="detail-card"><h3>برای چه کسی مناسب است؟</h3><p>تشخیص مناسب‌بودن این خدمت فقط بعد از بررسی شرایط فرد و مشاوره انجام می‌شود. هدف، انجام خدمت متناسب با نیاز واقعی شماست.</p></div>
   <div class="detail-card"><h3>تعداد جلسات تقریبی</h3><p>${s.sessions}</p></div>
   <div class="detail-card"><h3>قبل از مراجعه</h3><ul>${s.before.map(x=>'<li>'+x+'</li>').join("")}</ul></div>
   <div class="detail-card"><h3>بعد از خدمت</h3><ul>${s.after.map(x=>'<li>'+x+'</li>').join("")}</ul></div>
   <button class="primary full" id="detailBooking">درخواست نوبت برای ${s.name}</button>
  </div>`;
 go("service");
 document.getElementById("detailBooking").onclick=()=>{document.getElementById("bookingService").value=s.name;go("booking");};
}

function renderProducts(){
 document.getElementById("productsList").innerHTML=products.map(p=>`<article class="product-card">
  <div class="product-art">${p.icon}</div><h3>${p.name}</h3><p>${p.desc}</p><button data-product="${p.name}">درخواست مشاوره خرید</button>
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
 if(product){showToast("درخواست «"+product.dataset.product+"» در نسخه نهایی به فروش کلینیک ارسال می‌شود.");}
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
 result.innerHTML="<strong>درخواست شما ثبت شد ✓</strong><br>این نسخه آزمایشی است و اطلاعات فقط روی همین گوشی ذخیره شده. در نسخه نهایی، درخواست مستقیماً برای کلینیک ارسال می‌شود.";
 e.target.reset();
});

window.addEventListener("beforeinstallprompt",e=>{
 e.preventDefault();deferredPrompt=e;installCard.hidden=false;
});
async function installApp(){
 if(deferredPrompt){
  deferredPrompt.prompt();await deferredPrompt.userChoice;deferredPrompt=null;
 }else{
  showToast("اگر گزینه نصب ظاهر نشد، از منوی مرورگر «افزودن به صفحه اصلی» یا «نصب برنامه» را انتخاب کنید.");
 }
}
installBtn.addEventListener("click",installApp);
installCardBtn.addEventListener("click",installApp);
window.addEventListener("appinstalled",()=>{installCard.hidden=true;showToast("اپ با موفقیت نصب شد.");});

renderServices();renderProducts();
const initial=location.hash.replace("#","")||"home";
history.replaceState({page:initial},"","#"+initial);go(initial,false);

if("serviceWorker" in navigator){
 window.addEventListener("load",()=>navigator.serviceWorker.register("./sw.js",{scope:"./",updateViaCache:"none"}).catch(()=>{}));
}
