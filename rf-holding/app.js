(function(){
"use strict";
var KEY="rf_holding_workspace_v1";
var PHOTOS={
 restaurant:"https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1050&q=85",
 jewelry:"https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=1050&q=85",
 travel:"https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=1050&q=85",
 general:"https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=1050&q=85",
 hero:"https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1400&q=82"
};
var INDUSTRIES={
 restaurant:{name:"رستوران و کافه",icon:"🍽️",label:"RESTAURANT OPERATIONS",tabs:[["overview","نمای کلی"],["orders","سفارش‌ها"],["reservations","رزرو میز"],["tables","میزها و سالن"],["menu","منو و اقلام"]],quick:[["orders","سفارش جدید","🧾"],["reservations","رزرو جدید","📅"],["tables","تعریف میز","🪑"],["menu","آیتم منو","🍲"]]},
 jewelry:{name:"طلا و جواهر",icon:"💎",label:"JEWELRY RETAIL",tabs:[["overview","نمای کلی"],["inventory","موجودی طلا"],["sales","فروش و سفارش"],["requests","درخواست مشتری"]],quick:[["inventory","محصول جدید","💍"],["sales","ثبت فروش","🧾"],["requests","درخواست مشتری","💬"]]},
 travel:{name:"گردشگری و سفر",icon:"✈️",label:"TRAVEL AGENCY",tabs:[["overview","نمای کلی"],["packages","تور و خدمات"],["bookings","رزرو سفر"],["requests","درخواست سفر"]],quick:[["packages","تور جدید","🧳"],["bookings","رزرو جدید","🎫"],["requests","درخواست مشتری","🌐"]]},
 general:{name:"سایر کسب‌وکارها",icon:"🏢",label:"BUSINESS OPERATIONS",tabs:[["overview","نمای کلی"],["projects","پروژه‌ها"],["sales","فرصت‌های فروش"],["requests","درخواست‌ها"]],quick:[["projects","پروژه جدید","📁"],["sales","فرصت فروش","🤝"],["requests","درخواست جدید","📩"]]}
};
var RECORD_TITLES={
 orders:"سفارش",reservations:"رزرو میز",tables:"میز سالن",menu:"آیتم منو",
 inventory:"محصول طلا و جواهر",sales:"فروش / فرصت",requests:"درخواست مشتری",
 packages:"تور / خدمت سفر",bookings:"رزرو سفر",projects:"پروژه"
};
var RECORD_ICONS={orders:"🧾",reservations:"📅",tables:"🪑",menu:"🍲",inventory:"💍",sales:"💳",requests:"💬",packages:"🧳",bookings:"🎫",projects:"📁"};
var NAV=[["home","داشبورد مجموعه","⌂"],["businesses","کسب‌وکارهای من","▦"],["finance","امور مالی مشترک","◈"],["customers","مشتریان","♧"],["tasks","کارها و پیگیری‌ها","☑"],["reports","گزارش‌های مدیریتی","▤"],["settings","تنظیمات و توسعه","⚙"]];
var seed=[
 {id:"restaurant",name:"رستوران",kind:"restaurant",desc:"عملیات سالن، سفارش‌ها، رزرو میز و مدیریت منو",image:PHOTOS.restaurant,createdAt:""},
 {id:"jewelry",name:"طلا و جواهر",kind:"jewelry",desc:"کالکشن، موجودی، فروش و درخواست مشتریان",image:PHOTOS.jewelry,createdAt:""},
 {id:"travel",name:"دفتر گردشگری",kind:"travel",desc:"تورهای مسافرتی، رزروها و پرونده مسافران",image:PHOTOS.travel,createdAt:""}
];
function fresh(){return {version:1,businesses:JSON.parse(JSON.stringify(seed)),finances:[],customers:[],tasks:[],records:[],events:[],modules:[],updatedAt:""};}
var data=fresh(),route={area:"home",biz:null,tab:"overview"},filterBiz="all",searchTerm="";
try{var old=JSON.parse(localStorage.getItem(KEY)||"null");if(old&&Array.isArray(old.businesses)){data=Object.assign(fresh(),old);["businesses","finances","customers","tasks","records","events","modules"].forEach(function(k){if(!Array.isArray(data[k]))data[k]=[];});}}catch(e){}
function persist(){data.updatedAt=new Date().toISOString();try{localStorage.setItem(KEY,JSON.stringify(data));}catch(e){toast("فضای ذخیره‌سازی مرورگر کافی نیست؛ خروجی پشتیبان تهیه کنید.");}}
function esc(x){return String(x===null||x===undefined?"":x).replace(/[&<>"']/g,function(c){return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c];});}
function money(n){return Number(n||0).toLocaleString("fa-IR")+" تومان";}
function number(n){return Number(n||0).toLocaleString("fa-IR");}
function dateText(x){if(!x)return "بدون تاریخ";try{return new Date(x+"T12:00:00").toLocaleDateString("fa-IR");}catch(e){return x;}}
function today(){var d=new Date();return d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0");}
function id(prefix){return prefix+"_"+Date.now().toString(36)+"_"+Math.random().toString(36).slice(2,7);}
function findBiz(k){return data.businesses.find(function(b){return b.id===k;});}
function bizName(k){return findBiz(k)?.name||"عمومی مجموعه";}
function icon(kind){return INDUSTRIES[kind]?.icon||INDUSTRIES.general.icon;}
function customModule(key){return data.modules.find(function(m){return m.id===key;});}
function kindTitle(key){return RECORD_TITLES[key]||customModule(key)?.name||"مورد عملیاتی";}
function tabsFor(b){return kindOf(b).tabs.concat(data.modules.filter(function(m){return m.businessId===b.id;}).map(function(m){return [m.id,(m.icon||"🧩")+" "+m.name];}));}
function img(b){return b.image||PHOTOS[b.kind]||PHOTOS.general;}
function kindOf(b){return INDUSTRIES[b.kind]||INDUSTRIES.general;}
function stateLabel(s){return ({new:"جدید",pending:"در انتظار",active:"در جریان",done:"تکمیل‌شده",paid:"تسویه‌شده",cancelled:"لغوشده",free:"آزاد",reserved:"رزروشده",occupied:"اشغال"}[s]||"ثبت‌شده");}
function stateClass(s){return ["pending","active","done","paid","cancelled","free","reserved","occupied"].includes(s)?s:"other";}
function status(s){return '<span class="status '+stateClass(s)+'">'+stateLabel(s)+'</span>';}
function recordCount(biz,kind){return data.records.filter(function(x){return x.businessId===biz&&(!kind||x.kind===kind);}).length;}
function financeRows(biz){return data.finances.filter(function(f){return !biz||f.businessId===biz;});}
function financials(biz){var items=financeRows(biz),income=0,expense=0;items.forEach(function(f){if(f.type==="income")income+=Number(f.amount)||0;else expense+=Number(f.amount)||0;});return {income:income,expense:expense,balance:income-expense,count:items.length};}
function log(text,businessId){data.events.unshift({id:id("event"),text:text,businessId:businessId||"",at:new Date().toISOString()});data.events=data.events.slice(0,100);}
function routeTo(area,biz,tab){route={area:area,biz:biz||null,tab:tab||"overview"};searchTerm="";document.getElementById("globalSearch").value="";document.getElementById("searchResults").hidden=true;closeSidebar();render();window.scrollTo({top:0,behavior:"auto"});}
function toast(t){var box=document.getElementById("toast");box.textContent=t;box.classList.add("visible");clearTimeout(toast.timer);toast.timer=setTimeout(function(){box.classList.remove("visible");},2800);}
function closeSidebar(){document.getElementById("sidebar").classList.remove("is-open");document.getElementById("navOverlay").hidden=true;}
function dashboardHeading(title,sub,actions,eyebrow){return '<div class="page-head"><div><div class="eyebrow">'+esc(eyebrow||"RF HOLDING · EXECUTIVE WORKSPACE")+'</div><h1>'+esc(title)+'</h1><p class="page-subtitle">'+esc(sub||"")+'</p></div><div class="page-actions">'+(actions||"")+'</div></div>';}
function button(label,act,cls,extra){return '<button type="button" class="button '+(cls||"")+'" data-action="'+esc(act)+'" '+(extra||"")+'>'+label+'</button>';}
function sectionHead(title,sub,actionLabel,action){return '<div class="section-heading"><div><h2>'+title+'</h2>'+(sub?'<p>'+sub+'</p>':"")+'</div>'+(actionLabel?'<button type="button" class="text-action" data-action="'+action+'">'+actionLabel+' ←</button>':"")+'</div>';}
function empty(iconText,title,help,action,label){return '<div class="empty-state"><div class="empty-icon">'+iconText+'</div><strong>'+title+'</strong><p>'+help+'</p>'+(action?button(label||"ثبت اولین مورد",action,""):"")+'</div>';}
function statCard(label,value,hint,em){return '<div class="stat-card"><div class="stat-top"><span class="stat-label">'+label+'</span><span class="stat-icon">'+em+'</span></div><div class="stat-value">'+value+'</div><div class="stat-hint">'+hint+'</div></div>';}
function bizCards(withAdd){
 var s=data.businesses.map(function(b){return '<article class="business-card"><div class="business-visual"><img src="'+esc(img(b))+'" alt="تصویر نماینده کسب‌وکار '+esc(b.name)+'" loading="lazy" onerror="this.style.display=\'none\'"><span class="business-chip">'+esc(kindOf(b).name)+'</span><span class="business-initial">'+icon(b.kind)+'</span></div><div class="business-body"><h3>'+esc(b.name)+'</h3><p class="desc">'+esc(b.desc||"فضای مدیریت مستقل برای این کسب‌وکار")+'</p><div class="business-bottom"><small>'+number(recordCount(b.id))+' مورد عملیاتی ثبت‌شده</small><button class="card-go" type="button" data-biz="'+esc(b.id)+'">ورود به مدیریت ←</button></div></div></article>';}).join("");
 if(withAdd)s+='<button type="button" class="add-business-card" data-action="add-business"><span class="big-plus">＋</span><strong>افزودن کسب‌وکار جدید</strong><small>با ساختار و اطلاعات مستقل</small></button>';
 return '<div class="card-grid">'+s+'</div>';
}
function sidebar(){
 var nav=document.getElementById("mainNav");
 nav.innerHTML=NAV.map(function(n){return '<button type="button" data-route="'+n[0]+'" class="nav-link '+(route.area===n[0]?"active":"")+'"><span class="nav-icon">'+n[2]+'</span>'+n[1]+'</button>';}).join("");
 document.getElementById("bizNav").innerHTML=data.businesses.map(function(b){return '<button type="button" class="nav-link '+(route.area==="business"&&route.biz===b.id?"active":"")+'" data-biz="'+esc(b.id)+'"><span class="biz-dot">'+icon(b.kind)+'</span>'+esc(b.name)+'</button>';}).join("");
 document.getElementById("mobileNav").innerHTML=[["home","خانه","⌂"],["businesses","کسب‌وکارها","▦"],["finance","مالی","◈"],["tasks","کارها","☑"],["settings","بیشتر","⚙"]].map(function(n){var active=route.area===n[0]||(route.area==="business"&&n[0]==="businesses");return '<button type="button" class="mobile-tab '+(active?"active":"")+'" data-route="'+n[0]+'"><span class="nav-icon">'+n[2]+'</span><span>'+n[1]+'</span></button>';}).join("");
 var title=route.area==="business"?(bizName(route.biz)):NAV.find(function(n){return n[0]===route.area;})?.[1]||"داشبورد مجموعه";
 document.getElementById("breadcrumb").textContent=title;
}
function home(){
 var f=financials(),open=data.tasks.filter(function(t){return !t.done;}).length;
 var out=dashboardHeading("سلام، به RF Holding خوش آمدید","تمام کسب‌وکارهای شما در یک فضای یکپارچه، با عملیات مستقل و خدمات مشترک.",button("＋ افزودن کسب‌وکار","add-business","strong"),"BUSINESS GROUP · OWNER DASHBOARD");
 out+='<section class="overview-banner"><div class="banner-copy"><small>ONE GROUP. MULTIPLE BUSINESSES.</small><h2>دید کامل به مجموعه،<br>مدیریت دقیق هر کسب‌وکار.</h2><p>از رستوران و طلا و جواهر تا گردشگری؛ همه زیر یک سقف مدیریتی، بدون از بین رفتن استقلال هر واحد.</p>'+button("مشاهده کسب‌وکارها","go-businesses","")+'</div><div class="banner-img" style="background-image:url(\''+PHOTOS.hero+'\')"></div><span class="banner-orb"></span></section>';
 out+='<section class="stats-grid">'+statCard("کسب‌وکارهای فعال",number(data.businesses.length),"واحدهای تعریف‌شده در گروه","▦")+statCard("دریافتی ثبت‌شده",money(f.income),"جمع کل واحدها · داده واقعی واردشده","↙")+statCard("پرداختی ثبت‌شده",money(f.expense),"تمام هزینه‌های ثبت‌شده","↗")+statCard("کارهای باز",number(open),"نیازمند پیگیری","☑")+'</section>';
 out+=sectionHead("کسب‌وکارهای من","هر واحد محیط، ابزارها و داده‌های مستقل خودش را دارد.","مشاهده همه","go-businesses")+bizCards(true);
 var recent=data.finances.slice().sort(function(a,b){return (b.createdAt||b.date||"").localeCompare(a.createdAt||a.date||"");}).slice(0,5);
 var tasks=data.tasks.filter(function(t){return !t.done;}).slice().sort(function(a,b){return (a.due||"9999").localeCompare(b.due||"9999");}).slice(0,5);
 out+='<div class="two-column"><section class="card"><div class="card-title-row"><h3>آخرین گردش‌های مالی</h3><button class="link-btn" data-route="finance">مدیریت مالی ←</button></div>'+(recent.length?'<div class="record-list">'+recent.map(function(f){return '<div class="record-item"><div class="record-main"><span class="record-icon">'+(f.type==="income"?"↙":"↗")+'</span><div><strong>'+esc(f.title)+'</strong><small>'+esc(bizName(f.businessId))+' · '+dateText(f.date)+'</small></div></div><strong class="record-meta">'+(f.type==="income"?"+":"−")+money(f.amount)+'</strong></div>';}).join("")+'</div>':empty("💳","هنوز تراکنشی ثبت نشده است","ثبت دریافت و پرداخت از همین‌جا آغاز می‌شود.","add-finance","ثبت تراکنش"))+'</section><section class="card"><div class="card-title-row"><h3>پیگیری‌های نزدیک</h3><button class="link-btn" data-route="tasks">همه کارها ←</button></div>'+(tasks.length?'<div class="record-list">'+tasks.map(function(t){return '<div class="record-item"><div class="record-main"><span class="record-icon">☑</span><div><strong>'+esc(t.title)+'</strong><small>'+esc(bizName(t.businessId))+'</small></div></div><span class="record-meta">'+dateText(t.due)+'</span></div>';}).join("")+'</div>':empty("✓","موردی در انتظار پیگیری نیست","کارهای واحدها و کارهای مشترک را ثبت کنید.","add-task","افزودن کار"))+'</section></div>';
 out+='<div class="note-card" style="margin-top:18px"><strong>درباره این نسخه:</strong> این فضای اولیه برای طراحی و ثبت اطلاعات ساخته شده است. داده‌ها فقط در مرورگر همین دستگاه نگهداری می‌شوند. تا راه‌اندازی ورود امن و پایگاه داده مرکزی، اطلاعات مالی یا مشخصات محرمانه مشتریان واقعی را در این نسخه آزمایشی وارد نکنید. همگام‌سازی چندکاربره و اتصال بانکی و فروشگاهی هنوز فعال نیست.</div>';
 return out;
}
function businessesPage(){return dashboardHeading("کسب‌وکارهای من","مدیریت مستقل هر واحد در کنار خدمات تجمیعی هلدینگ.",button("＋ کسب‌وکار جدید","add-business","strong"),"BUSINESS PORTFOLIO")+bizCards(true);}
function bizOverview(b){
 var k=kindOf(b),ff=financials(b.id),rs=data.records.filter(function(r){return r.businessId===b.id;}).slice(-5).reverse();
 var out='<section class="stats-grid business-stats">'+statCard("فرایندهای ثبت‌شده",number(recordCount(b.id)),"سفارش‌ها، درخواست‌ها و عملیات","▤")+statCard("دریافتی واحد",money(ff.income),"تراکنش‌های واحد","↙")+statCard("هزینه‌های واحد",money(ff.expense),"پرداخت‌های واحد","↗")+statCard("مانده ثبت‌شده",money(ff.balance),"دریافتی منهای پرداختی","◈")+'</section>';
 out+='<div class="business-widget-grid"><div class="card"><div class="card-title-row"><h3>آخرین فعالیت‌های این کسب‌وکار</h3><button class="link-btn" data-action="biz-all-records" data-id="'+esc(b.id)+'">مشاهده فعالیت‌ها ←</button></div>'+(rs.length?'<div class="record-list">'+rs.map(function(r){return '<button type="button" class="record-item" data-record="'+esc(r.id)+'" style="background:none;border-left:0;border-right:0;border-top:0;width:100%;text-align:right;cursor:pointer"><div class="record-main"><span class="record-icon">'+(RECORD_ICONS[r.kind]||"▤")+'</span><div><strong>'+esc(r.title)+'</strong><small>'+RECORD_TITLES[r.kind]+' · '+dateText(r.date)+'</small></div></div>'+status(r.status)+'</button>';}).join("")+'</div>':empty("🗂️","هنوز فعالیتی ثبت نشده است","با یکی از ابزارهای تخصصی این کسب‌وکار شروع کنید.","add-record:"+k.quick[0][0]+":"+b.id,"شروع ثبت"))+'</div><div class="card"><div class="card-title-row"><h3>دسترسی سریع</h3><span class="card-caption">'+k.name+'</span></div><div class="quick-buttons">'+k.quick.map(function(item){return '<button class="quick-tile" type="button" data-action="add-record:'+item[0]+':'+esc(b.id)+'"><span class="quick-icon">'+item[2]+'</span><strong>'+item[1]+'</strong><small>ثبت و پیگیری در این واحد</small></button>';}).join("")+'<button type="button" class="quick-tile" data-action="add-finance:'+esc(b.id)+'"><span class="quick-icon">💳</span><strong>دریافت / پرداخت</strong><small>در حساب مشترک مالی</small></button></div></div></div>';
 return out;
}

function specialTab(b,tab,rows){
 var title=kindTitle(tab),action="add-record:"+tab+":"+b.id;
 if(tab==="tables"){
  var out=sectionHead("نقشه میزهای رستوران","وضعیت و ظرفیت میزها؛ برای ویرایش روی هر میز بزنید.","＋ تعریف میز",action);
  out+=rows.length?'<div class="table-floor">'+rows.map(function(r){
   return '<button type="button" data-record="'+esc(r.id)+'" class="floor-table '+stateClass(r.status)+'"><span class="table-icon">🪑</span><strong>'+esc(r.title)+'</strong><small>'+esc(r.detail||"سالن اصلی")+'</small><span class="capacity">ظرفیت: '+number(r.amount)+' نفر</span>'+status(r.status)+'</button>';
  }).join("")+'</div>':empty("🪑","هنوز میزی تعریف نشده است","برای هر میز، عنوان، ظرفیت و وضعیت ثبت کنید.",action,"＋ تعریف اولین میز");
  return out;
 }
 if(tab==="inventory"){
  var out=sectionHead("ویترین موجودی طلا و جواهر","کد محصول، وزن، عیار، تعداد و قیمت ثبت‌شده.","＋ محصول جدید",action);
  out+=rows.length?'<div class="product-grid">'+rows.map(function(r){
   var m=r.meta||{};
   var media=m.image?'<img src="'+esc(m.image)+'" alt="'+esc(r.title)+'" loading="lazy" onerror="this.hidden=true">':'<span>💍</span>';
   return '<button type="button" data-record="'+esc(r.id)+'" class="product-tile"><div class="product-media">'+media+'</div><div class="product-content"><strong>'+esc(r.title)+'</strong><small>'+esc(m.sku||r.detail||"بدون کد")+'</small><div class="product-facts"><span>'+esc(m.grams||"—")+' گرم</span><span>'+esc(m.karat||"—")+' عیار</span><span>تعداد '+number(m.qty||0)+'</span></div><b>'+money(r.amount)+'</b></div></button>';
  }).join("")+'</div>':empty("💎","هنوز موجودی ثبت نشده است","محصول جدید با عیار، وزن، تعداد و تصویر واقعی ثبت کنید.",action,"＋ ثبت اولین محصول");
  return out;
 }
 if(tab==="packages"){
  var out=sectionHead("تور و خدمات سفر","مقصد، تاریخ حرکت و ظرفیت هر تور در یک نما.","＋ تور / خدمت",action);
  out+=rows.length?'<div class="product-grid">'+rows.map(function(r){
   var m=r.meta||{};
   var media=m.image?'<img src="'+esc(m.image)+'" alt="'+esc(r.title)+'" loading="lazy" onerror="this.hidden=true">':'<span>🧳</span>';
   return '<button type="button" data-record="'+esc(r.id)+'" class="product-tile"><div class="product-media">'+media+'</div><div class="product-content"><strong>'+esc(r.title)+'</strong><small>'+esc(m.destination||r.detail||"مقصد تعیین نشده")+'</small><div class="product-facts"><span>حرکت: '+dateText(m.departure)+'</span><span>ظرفیت: '+number(m.capacity||0)+'</span></div><b>'+money(r.amount)+'</b></div></button>';
  }).join("")+'</div>':empty("✈️","هنوز تور یا خدمتی تعریف نشده است","مقصد، زمان‌بندی، ظرفیت و قیمت خدمات سفر را ثبت کنید.",action,"＋ ثبت تور جدید");
  return out;
 }
 return null;
}
function bizPage(){
 var b=findBiz(route.biz);if(!b)return businessesPage();
 var k=kindOf(b),tabs=tabsFor(b),valid=tabs.some(function(x){return x[0]===route.tab;});if(!valid)route.tab="overview";
 var title=route.tab==="overview"?"":kindTitle(route.tab);
 var out='<section class="detail-hero"><div class="detail-copy"><small>'+esc(k.label)+' · RF HOLDING</small><h1>'+esc(b.name)+'</h1><p>'+esc(b.desc||"مدیریت عملیات و اطلاعات این کسب‌وکار")+'</p><div class="details-action">'+button("＋ ثبت در واحد","quick-record:"+esc(b.id),"")+button("ویرایش مشخصات","edit-business:"+esc(b.id),"ghost")+'</div></div><img class="detail-photo" src="'+esc(img(b))+'" alt="نمای مرتبط با '+esc(b.name)+'" onerror="this.style.opacity=0"></section>';
 out+='<div class="tabs" role="tablist">'+tabs.map(function(t){return '<button type="button" class="tab '+(route.tab===t[0]?"active":"")+'" data-tab="'+esc(t[0])+'" data-forbiz="'+esc(b.id)+'" role="tab" aria-selected="'+(route.tab===t[0]?"true":"false")+'">'+esc(t[1])+'</button>';}).join("")+'<button type="button" class="tab" data-action="add-module:'+esc(b.id)+'">＋ ماژول جدید</button></div>';
 if(route.tab==="overview")return out+bizOverview(b);
 var rows=data.records.filter(function(r){return r.businessId===b.id&&r.kind===route.tab;}).slice().sort(function(a,z){return (z.date||"").localeCompare(a.date||"");});
 var customView=specialTab(b,route.tab,rows);if(customView!==null)return out+customView;
 var fields={
 orders:["سفارش","مشتری / میز","مبلغ","وضعیت","تاریخ"],tables:["میز","جایگاه / توضیح","ظرفیت","وضعیت","تاریخ"],
 reservations:["نام رزرو","مشتری / میز","تعداد / مبلغ","وضعیت","تاریخ"],
 menu:["نام آیتم","دسته‌بندی","قیمت","وضعیت","تاریخ"],
 inventory:["نام محصول","کد / عیار / وزن","مبلغ","وضعیت","تاریخ"],
 sales:["عنوان فروش","مشتری","مبلغ","وضعیت","تاریخ"],
 requests:["عنوان درخواست","مشتری","برآورد","وضعیت","تاریخ"],
 packages:["نام تور / خدمت","مقصد / توضیح","قیمت","وضعیت","تاریخ"],
 bookings:["عنوان رزرو","مسافر / مقصد","مبلغ","وضعیت","تاریخ"],
 projects:["عنوان پروژه","مسئول / جزئیات","بودجه","وضعیت","تاریخ"]
 };
 var heads=fields[route.tab]||fields.projects;
 out+=sectionHead(title+" · "+b.name,"اطلاعات مستقل این واحد؛ برای ویرایش روی هر ردیف کلیک کنید.","＋ "+title,"add-record:"+route.tab+":"+b.id);
 out+='<section class="wide-card">'+(rows.length?'<div class="table-wrap"><table class="data-table"><thead><tr>'+heads.map(function(h){return '<th>'+h+'</th>';}).join("")+'</tr></thead><tbody>'+rows.map(function(r){return '<tr data-record="'+esc(r.id)+'" style="cursor:pointer" title="مشاهده و ویرایش"><td><strong>'+esc(r.title)+'</strong></td><td>'+esc(r.detail||"—")+'</td><td>'+money(r.amount)+'</td><td>'+status(r.status)+'</td><td>'+dateText(r.date)+'</td></tr>';}).join("")+'</tbody></table></div>':empty(RECORD_ICONS[route.tab]||"▤","موردی در بخش "+title+" ثبت نشده","برای ایجاد اولین مورد، از دکمه بالا استفاده کنید.","add-record:"+route.tab+":"+b.id,"＋ افزودن "+title))+'</section>';
 out+='<div class="note-card" style="margin-top:16px">این بخش متناسب با ماهیت «'+k.name+'» طراحی شده است. گردش‌های مالی واقعی را در قسمت «امور مالی مشترک» ثبت کنید تا گزارش تجمیعی هلدینگ به‌روز شود.</div>';
 return out;
}
function financePage(){
 var ff=financials(filterBiz==="all"?null:filterBiz);var items=financeRows(filterBiz==="all"?null:filterBiz).slice().sort(function(a,b){return (b.date||"").localeCompare(a.date||"");});
 var out=dashboardHeading("امور مالی مشترک","یک نقطه کنترل مالی، با تفکیک دقیق درآمد و هزینه هر کسب‌وکار.",button("＋ ثبت دریافت / پرداخت","add-finance","strong"),"SHARED SERVICES · FINANCE");
 out+='<section class="stats-grid">'+statCard("دریافتی",money(ff.income),"تراکنش‌های ثبت‌شده","↙")+statCard("پرداختی",money(ff.expense),"هزینه‌های ثبت‌شده","↗")+statCard("مانده",money(ff.balance),"دریافتی منهای پرداختی","◈")+statCard("تعداد تراکنش",number(ff.count),"در محدوده انتخاب‌شده","▤")+'</section>';
 out+='<div class="filter-row"><select id="financeFilter" class="select-box" aria-label="فیلتر کسب‌وکار"><option value="all">تمام کسب‌وکارها</option>'+data.businesses.map(function(b){return '<option value="'+esc(b.id)+'" '+(filterBiz===b.id?"selected":"")+'>'+esc(b.name)+'</option>';}).join("")+'</select>'+button("دریافت خروجی CSV","export-finance","")+'</div>';
 out+='<section class="wide-card"><h3>دفتر گردش‌های مالی</h3>'+(items.length?'<div class="table-wrap"><table class="data-table"><thead><tr><th>شرح</th><th>کسب‌وکار</th><th>نوع</th><th>مبلغ</th><th>تاریخ</th></tr></thead><tbody>'+items.map(function(f){return '<tr data-finance="'+esc(f.id)+'" title="ویرایش یا حذف" style="cursor:pointer"><td><strong>'+esc(f.title)+'</strong><br><span class="muted">'+esc(f.category||"")+'</span></td><td>'+esc(bizName(f.businessId))+'</td><td>'+status(f.type==="income"?"paid":"pending").replace(f.type==="income"?"تسویه‌شده":"در انتظار",f.type==="income"?"دریافتی":"پرداختی")+'</td><td>'+money(f.amount)+'</td><td>'+dateText(f.date)+'</td></tr>';}).join("")+'</tbody></table></div>':empty("💳","دفتر مالی هنوز خالی است","دریافت و پرداخت هر واحد را ثبت کنید؛ گزارش کل هلدینگ به‌صورت خودکار به‌روز می‌شود.","add-finance","ثبت اولین تراکنش"))+'</section>';
 return out;
}
function customersPage(){
 var list=data.customers.slice().reverse(),out=dashboardHeading("مشتریان و ارتباطات","یک دفتر مشترک مشتریان، با امکان اتصال هر مخاطب به کسب‌وکار مربوطه.",button("＋ افزودن مشتری","add-customer","strong"),"SHARED SERVICES · CRM");
 out+='<section class="stats-grid">'+statCard("مشتریان ثبت‌شده",number(list.length),"در تمام واحدها","♧")+statCard("مشتریان رستوران",number(list.filter(function(x){return findBiz(x.businessId)?.kind==="restaurant";}).length),"مخاطبان این واحد","🍽️")+statCard("طلا و جواهر",number(list.filter(function(x){return findBiz(x.businessId)?.kind==="jewelry";}).length),"مخاطبان این واحد","💎")+statCard("گردشگری",number(list.filter(function(x){return findBiz(x.businessId)?.kind==="travel";}).length),"مخاطبان این واحد","✈️")+'</section>';
 out+='<div class="wide-card" style="margin-top:20px"><h3>فهرست مخاطبان</h3>'+(list.length?'<div class="table-wrap"><table class="data-table"><thead><tr><th>نام</th><th>کسب‌وکار</th><th>تلفن</th><th>یادداشت</th></tr></thead><tbody>'+list.map(function(c){return '<tr data-customer="'+esc(c.id)+'" style="cursor:pointer"><td><strong>'+esc(c.name)+'</strong></td><td>'+esc(bizName(c.businessId))+'</td><td dir="ltr" style="text-align:right">'+esc(c.phone||"—")+'</td><td>'+esc(c.note||"—")+'</td></tr>';}).join("")+'</tbody></table></div>':empty("👤","هنوز مشتری ثبت نشده است","می‌توانید مشتری هر واحد را در همین دفتر مشترک ثبت و پیگیری کنید.","add-customer","＋ مشتری جدید"))+'</div>';
 return out;
}
function tasksPage(){
 var list=data.tasks.slice().sort(function(a,b){return Number(a.done)-Number(b.done)||(a.due||"9999").localeCompare(b.due||"9999");});
 var out=dashboardHeading("کارها و پیگیری‌ها","اقدامات مشترک هلدینگ و پیگیری‌های اختصاصی هر کسب‌وکار.",button("＋ کار جدید","add-task","strong"),"SHARED SERVICES · WORKFLOW");
 out+='<section class="stats-grid">'+statCard("کل کارها",number(list.length),"تمام موارد ثبت‌شده","▤")+statCard("در انتظار",number(list.filter(function(t){return !t.done;}).length),"کارهای باز","⌛")+statCard("انجام‌شده",number(list.filter(function(t){return t.done;}).length),"تکمیل‌شده","✓")+statCard("فرصت سررسید گذشته",number(list.filter(function(t){return !t.done&&t.due&&t.due<today();}).length),"نیازمند پیگیری","!")+'</section>';
 out+='<section class="wide-card" style="margin-top:20px"><h3>فهرست اقدام‌ها</h3>'+(list.length?list.map(function(t){return '<div class="mini-task"><label class="'+(t.done?"done":"")+'"><input type="checkbox" data-taskcheck="'+esc(t.id)+'" '+(t.done?"checked":"")+' aria-label="تکمیل '+esc(t.title)+'"><span><strong>'+esc(t.title)+'</strong><br><small class="muted">'+esc(bizName(t.businessId))+' · '+dateText(t.due)+'</small></span></label><button class="link-btn" type="button" data-task="'+esc(t.id)+'">جزئیات ←</button></div>';}).join(""):empty("☑","فهرست کارها خالی است","اقدام‌ها و مسئولیت‌های هر واحد را در این صفحه متمرکز کنید.","add-task","افزودن کار"))+'</section>';
 return out;
}
function reportsPage(){
 var f=financials(),out=dashboardHeading("گزارش‌های مدیریتی","مقایسه واحدها بر پایه اطلاعاتی که واقعاً در سامانه ثبت شده‌اند.",button("چاپ گزارش","print-page",""),"EXECUTIVE REPORTING");
 out+='<section class="stats-grid">'+statCard("کل دریافتی",money(f.income),"در همه واحدها","↙")+statCard("کل پرداختی",money(f.expense),"در همه واحدها","↗")+statCard("مانده تجمیعی",money(f.balance),"گزارش داخلی","◈")+statCard("پرونده‌های عملیاتی",number(data.records.length),"ثبت‌شده در تمام واحدها","▤")+'</section>';
 var max=Math.max(1,...data.businesses.map(function(b){return financials(b.id).income;}));
 out+='<div class="two-column"><div class="card"><div class="card-title-row"><h3>مقایسه دریافتی کسب‌وکارها</h3><span class="card-caption">تومان</span></div><div class="business-breakdown">'+data.businesses.map(function(b){var inc=financials(b.id).income;return '<div class="bar-row"><span>'+esc(b.name)+'</span><div class="bar-track"><div class="bar-fill" style="width:'+Math.round(inc/max*100)+'%"></div></div><strong class="num">'+number(inc)+'</strong></div>';}).join("")+'</div>'+(f.income===0?'<p class="micro-note" style="margin-top:15px">پس از ثبت تراکنش، نمودار مقایسه نمایش داده می‌شود.</p>':"")+'</div><div class="card"><h3>مقایسه فعالیت عملیاتی</h3><div class="business-breakdown" style="margin-top:20px">'+data.businesses.map(function(b){return '<div class="bar-row"><span>'+esc(b.name)+'</span><div class="bar-track"><div class="bar-fill" style="width:'+Math.round(recordCount(b.id)/Math.max(1,data.records.length)*100)+'%"></div></div><strong class="num">'+number(recordCount(b.id))+'</strong></div>';}).join("")+'</div></div></div>';
 out+=sectionHead("نمای مقایسه‌ای واحدها","هر واحد، داده‌های اختصاصی دارد؛ هلدینگ فقط آنها را تجمیع می‌کند.");
 out+='<section class="wide-card"><div class="table-wrap"><table class="data-table"><thead><tr><th>واحد</th><th>دریافتی</th><th>پرداختی</th><th>مانده</th><th>فعالیت</th></tr></thead><tbody>'+data.businesses.map(function(b){var z=financials(b.id);return '<tr><td><strong>'+esc(b.name)+'</strong></td><td>'+money(z.income)+'</td><td>'+money(z.expense)+'</td><td>'+money(z.balance)+'</td><td>'+number(recordCount(b.id))+'</td></tr>';}).join("")+'</tbody></table></div></section>';
 out+='<div class="note-card" style="margin-top:17px">این گزارش فقط ثبت‌های دستی در نسخه اولیه را نمایش می‌دهد؛ اتصال به صندوق رستوران، حسابداری، موجودی واقعی و سامانه‌های گردشگری هنوز راه‌اندازی نشده است.</div>';
 return out;
}
function settingsPage(){
 var out=dashboardHeading("تنظیمات و توسعه مجموعه","مدیریت ساختار کسب‌وکارها، نگهداری داده‌ها و برنامه توسعه سامانه.",button("＋ تعریف کسب‌وکار","add-business","strong"),"WORKSPACE SETTINGS");
 out+=sectionHead("ساختار گروه","برای هر کسب‌وکار هویت و ماژول‌های جداگانه تعریف می‌شود.");
 out+='<section class="wide-card"><div class="record-list">'+data.businesses.map(function(b){return '<div class="record-item"><div class="record-main"><span class="record-icon">'+icon(b.kind)+'</span><div><strong>'+esc(b.name)+'</strong><small>'+esc(kindOf(b).name)+' · '+number(recordCount(b.id))+' ثبت</small></div></div><button type="button" class="link-btn" data-action="edit-business:'+esc(b.id)+'">ویرایش ←</button></div>';}).join("")+'</div></section>';
 out+=sectionHead("ماژول‌های اختصاصی","برای هر کسب‌وکار می‌توانید ماژول‌های جدید تعریف کنید.");
 out+='<section class="wide-card"><div class="record-list">'+(data.modules.length?data.modules.map(function(m){return '<div class="record-item"><div class="record-main"><span class="record-icon">'+esc(m.icon)+'</span><div><strong>'+esc(m.name)+'</strong><small>'+esc(bizName(m.businessId))+' · '+esc(m.description||"ماژول سفارشی")+'</small></div></div><button class="link-btn" type="button" data-action="edit-module:'+esc(m.id)+'">ویرایش ←</button></div>';}).join(""):empty("🧩","هنوز ماژول سفارشی تعریف نشده است","داخل هر کسب‌وکار، از دکمه «ماژول جدید» استفاده کنید."))+'</div></section>';
 out+=sectionHead("نسخه پشتیبان و نگهداری اطلاعات","برای جلوگیری از از دست رفتن اطلاعات مرورگر، مرتب فایل پشتیبان بگیرید.");
 out+='<div class="tool-cards"><button type="button" class="tool-card" data-action="export-json"><span class="tool-ico">⬇️</span><strong>دریافت پشتیبان</strong><small>دریافت همه کسب‌وکارها، تراکنش‌ها، مشتریان و کارها در یک فایل JSON.</small></button><button type="button" class="tool-card" data-action="import-json"><span class="tool-ico">📤</span><strong>بازیابی پشتیبان</strong><small>بارگذاری فایل خروجی قبلی؛ پس از تأیید جایگزین داده‌های مرورگر می‌شود.</small></button><button type="button" class="tool-card" data-action="reset-data"><span class="tool-ico">♻️</span><strong>بازنشانی فضای آزمایشی</strong><small>پاک کردن داده‌های واردشده و بازگشت به سه کسب‌وکار اولیه.</small></button></div>';
 out+=sectionHead("نقشه توسعه محصول","قابلیت‌های زیر برای فاز عملیاتی به زیرساخت اختصاصی نیاز دارند.");
 out+='<div class="report-box"><div class="report-card"><h4>🔐 حساب کاربری و نقش‌ها</h4><p>ورود امن رضا فخرایی و مدیران هر واحد با سطح دسترسی مستقل.</p></div><div class="report-card"><h4>☁️ پایگاه داده مرکزی</h4><p>داده‌های مشترک بین دستگاه‌ها، پشتیبان‌گیری خودکار و ثبت سوابق تغییرات.</p></div><div class="report-card"><h4>🔗 یکپارچگی با سیستم‌های موجود</h4><p>صندوق رستوران، حسابداری، موجودی طلا، رزروهای سفر و درگاه‌های مالی.</p></div><div class="report-card"><h4>📊 تحلیل پیشرفته</h4><p>گزارش‌های لحظه‌ای، KPIهای اختصاصی و تصمیم‌سازی مدیریتی.</p></div></div>';
 return out;
}
function render(){
 sidebar();
 var html=route.area==="home"?home():route.area==="businesses"?businessesPage():route.area==="business"?bizPage():route.area==="finance"?financePage():route.area==="customers"?customersPage():route.area==="tasks"?tasksPage():route.area==="reports"?reportsPage():settingsPage();
 document.getElementById("workspace").innerHTML=html;
}
function optsBusiness(selected,includeGroup){var out=(includeGroup?'<option value="">مشترک · کل مجموعه</option>':"");return out+data.businesses.map(function(b){return '<option value="'+esc(b.id)+'" '+(b.id===selected?"selected":"")+'>'+esc(b.name)+'</option>';}).join("");}
function field(n,label,type,value,extra,span2){
 var v=value===undefined?"":value;return '<div class="form-row '+(span2?"span2":"")+'"><label for="f_'+esc(n)+'">'+esc(label)+'</label><input id="f_'+esc(n)+'" name="'+esc(n)+'" type="'+(type||"text")+'" value="'+esc(v)+'" '+(extra||"")+'></div>';
}
function select(n,label,options,selected,span2){
 return '<div class="form-row '+(span2?"span2":"")+'"><label for="f_'+esc(n)+'">'+label+'</label><select id="f_'+esc(n)+'" name="'+esc(n)+'">'+options.map(function(o){var pair=Array.isArray(o)?o:[o,o];return '<option value="'+esc(pair[0])+'" '+(pair[0]===selected?"selected":"")+'>'+esc(pair[1])+'</option>';}).join("")+'</select></div>';
}
function textarea(n,label,value){return '<div class="form-row span2"><label for="f_'+esc(n)+'">'+label+'</label><textarea id="f_'+esc(n)+'" name="'+esc(n)+'" placeholder="توضیحات تکمیلی (اختیاری)">'+esc(value||"")+'</textarea></div>';}
function businessSelect(chosen,includeGroup){var opts=(includeGroup?[["","مشترک · کل مجموعه"]]:[]).concat(data.businesses.map(function(b){return [b.id,b.name];}));return select("businessId","کسب‌وکار مرتبط",opts,chosen);}
function modal(title,body,onSubmit,submitLabel,dangerLabel,dangerAction){
 var root=document.getElementById("modalRoot");root.classList.add("has-modal");
 root.innerHTML='<div class="modal-backdrop" data-modal-close></div><div role="dialog" aria-modal="true" aria-label="'+esc(title)+'" class="modal"><div class="modal-head"><h2>'+esc(title)+'</h2><button class="modal-close" data-modal-close type="button" aria-label="بستن پنجره">×</button></div><form id="editForm" class="modal-body"><div class="form-grid">'+body+'</div><div class="form-footer"><div>'+button("انصراف","close-modal","")+(dangerLabel?' '+button(dangerLabel,dangerAction,"danger"):"")+'</div><button class="button strong" type="submit">'+esc(submitLabel||"ذخیره اطلاعات")+'</button></div></form></div>';
 var form=document.getElementById("editForm");form.addEventListener("submit",function(e){e.preventDefault();if(!form.reportValidity())return;var v=Object.fromEntries(new FormData(form).entries());onSubmit(v);});
 root.querySelectorAll("[data-modal-close]").forEach(function(x){x.addEventListener("click",closeModal);});
 setTimeout(function(){root.querySelector("input,select,textarea")?.focus();},30);
}
function closeModal(){var root=document.getElementById("modalRoot");root.innerHTML="";root.classList.remove("has-modal");}
function afterSave(msg){persist();closeModal();render();toast(msg);}
function editBusiness(bid){
 var b=findBiz(bid);var isEdit=!!b;
 var body=field("name","نام کسب‌وکار","text",b?.name||"","required maxlength=90",true)+select("kind","حوزه فعالیت",Object.keys(INDUSTRIES).map(function(x){return [x,INDUSTRIES[x].name];}),b?.kind||"general")+field("image","آدرس تصویر (اختیاری)","url",b?.image||"",'placeholder="https://..."')+textarea("desc","شرح کوتاه فعالیت",b?.desc||"");
 modal(isEdit?"ویرایش کسب‌وکار":"تعریف کسب‌وکار جدید",body,function(v){
  if(!v.name.trim()){toast("نام کسب‌وکار را وارد کنید.");return;}
  if(isEdit){b.name=v.name.trim();b.kind=v.kind;b.desc=v.desc.trim();b.image=v.image||PHOTOS[v.kind]||PHOTOS.general;}
  else{var nb={id:id("business"),name:v.name.trim(),kind:v.kind,desc:v.desc.trim(),image:v.image||PHOTOS[v.kind]||PHOTOS.general,createdAt:new Date().toISOString()};data.businesses.push(nb);route={area:"business",biz:nb.id,tab:"overview"};}
  log(isEdit?"ویرایش کسب‌وکار "+v.name:"تعریف کسب‌وکار "+v.name,bid||"");afterSave(isEdit?"مشخصات کسب‌وکار به‌روزرسانی شد.":"کسب‌وکار جدید ساخته شد.");
 },"ذخیره کسب‌وکار",isEdit&& !["restaurant","jewelry","travel"].includes(b.id)?"حذف کسب‌وکار":null,"delete-business:"+bid);
}
function editModule(mid,bid){
 var m=data.modules.find(function(x){return x.id===mid;});var isEdit=!!m;
 var b=findBiz(bid||m?.businessId);if(!b){toast("ابتدا کسب‌وکار را انتخاب کنید.");return;}
 var body=field("name","عنوان ماژول","text",m?.name||"","required maxlength=80",true)
 +select("icon","نشانه ماژول",[["🧩","🧩 عمومی"],["📦","📦 موجودی"],["📋","📋 فرایند"],["🛒","🛒 فروش"],["📅","📅 برنامه‌ریزی"],["🤝","🤝 قراردادها"],["📈","📈 عملکرد"],["🧑‍💼","🧑‍💼 منابع انسانی"]],m?.icon||"🧩")
 +field("description","توضیح کاربرد","text",m?.description||"",'placeholder="مثلاً مدیریت قراردادها"',true);
 modal(isEdit?"ویرایش ماژول":"افزودن ماژول به "+b.name,body,function(v){
  if(isEdit){m.name=v.name.trim();m.icon=v.icon;m.description=v.description.trim();}
  else{var item={id:id("mod"),name:v.name.trim(),icon:v.icon,description:v.description.trim(),businessId:b.id};data.modules.push(item);route={area:"business",biz:b.id,tab:item.id};}
  log((isEdit?"ویرایش ":"افزودن ")+"ماژول "+v.name,b.id);afterSave("ماژول اختصاصی ذخیره شد.");
 },"ذخیره ماژول",isEdit?"حذف ماژول":null,"delete-module:"+mid);
}
function editFinance(fid,chosenBiz){
 var f=data.finances.find(function(x){return x.id===fid;});var isEdit=!!f;
 var body=field("title","شرح تراکنش","text",f?.title||"","required maxlength=120",true)+select("type","نوع تراکنش",[["income","دریافتی / درآمد"],["expense","پرداختی / هزینه"]],f?.type||"expense")+businessSelect(f?.businessId||chosenBiz||data.businesses[0]?.id)+field("amount","مبلغ (تومان)","number",f?.amount||"","required min=0 step=1")+field("date","تاریخ","date",f?.date||today(),"required")+field("category","دسته‌بندی","text",f?.category||"",'placeholder="مثلاً خرید مواد اولیه"')+textarea("note","توضیحات",f?.note||"");
 modal(isEdit?"ویرایش تراکنش":"ثبت دریافت / پرداخت",body,function(v){
  var value=Number(v.amount);if(!Number.isFinite(value)||value<0){toast("مبلغ نامعتبر است.");return;}
  var item={id:fid||id("fin"),title:v.title.trim(),type:v.type,businessId:v.businessId,amount:value,date:v.date,category:v.category.trim(),note:v.note.trim(),createdAt:f?.createdAt||new Date().toISOString()};
  if(isEdit)Object.assign(f,item);else data.finances.push(item);
  log((isEdit?"اصلاح":"ثبت")+" "+(v.type==="income"?"دریافتی":"پرداختی")+" "+v.title,v.businessId);afterSave("تراکنش مالی ذخیره شد.");
 },"ذخیره تراکنش",isEdit?"حذف تراکنش":null,"delete-finance:"+fid);
}
function editRecord(bid,kind,rid){
 var r=data.records.find(function(x){return x.id===rid;});var isEdit=!!r;
 var title=kindTitle(kind);
 var labelTitle=({tables:"شماره یا نام میز",menu:"نام غذا / نوشیدنی",inventory:"نام محصول",reservations:"نام رزرو یا میز",packages:"نام تور / خدمت",bookings:"عنوان رزرو / مسافر",projects:"عنوان پروژه",requests:"عنوان درخواست",orders:"شماره یا عنوان سفارش",sales:"عنوان فروش"}[kind]||"عنوان");
 var labelDetail=({tables:"بخش سالن / موقعیت میز",menu:"دسته‌بندی منو",inventory:"کد / عیار / وزن",reservations:"نام مشتری / شماره میز",packages:"مقصد / مدت",bookings:"مقصد / نام مسافر",projects:"مسئول / مرحله",requests:"مشتری / توضیح",orders:"مشتری / میز",sales:"مشتری / شرح"}[kind]||"جزئیات");
 var labelAmount=({tables:"ظرفیت میز (نفر)",menu:"قیمت فروش (تومان)",inventory:"ارزش / قیمت (تومان)",reservations:"بیعانه (تومان)",packages:"قیمت تور (تومان)",bookings:"مبلغ رزرو (تومان)",projects:"بودجه (تومان)",requests:"برآورد (تومان)",orders:"مبلغ سفارش (تومان)",sales:"مبلغ فروش (تومان)"}[kind]||"مبلغ (تومان)");
 var body=field("title",labelTitle,"text",r?.title||"","required maxlength=150",true)+field("detail",labelDetail,"text",r?.detail||"",'placeholder="توضیحات کوتاه"')+field("amount",labelAmount,"number",r?.amount||"","min=0 step=1")+select("status","وضعیت",kind==="tables"?[["free","آزاد"],["reserved","رزروشده"],["occupied","اشغال"],["cancelled","غیرفعال"]]:[["new","جدید"],["pending","در انتظار"],["active","در جریان"],["done","تکمیل‌شده"],["paid","تسویه‌شده"],["cancelled","لغوشده"]],r?.status||(kind==="tables"?"free":"new"))+field("date","تاریخ","date",r?.date||today(),"required")+textarea("note","توضیحات / جزئیات",r?.note||"");

 var meta=r?.meta||{};
 if(kind==="inventory"){
  body+=field("sku","کد محصول / SKU","text",meta.sku||"")+field("grams","وزن (گرم)","number",meta.grams||"",'step="0.001" min="0"');
  body+=select("karat","عیار",[["18","۱۸ عیار"],["21","۲۱ عیار"],["24","۲۴ عیار"],["other","سایر"]],meta.karat||"18");
  body+=field("qty","تعداد موجودی","number",meta.qty||"",'min="0" step="1"')+field("image","لینک تصویر واقعی محصول","url",meta.image||"",'placeholder="https://..."',true);
 }
 if(kind==="packages"){
  body+=field("destination","مقصد","text",meta.destination||"")+field("departure","تاریخ حرکت","date",meta.departure||"");
  body+=field("capacity","ظرفیت (نفر)","number",meta.capacity||"",'min="0" step="1"')+field("image","لینک تصویر تور / مقصد","url",meta.image||"",'placeholder="https://..."',true);
 }
 if(kind==="reservations"){body+=field("partySize","تعداد نفرات","number",meta.partySize||"",'min="1" step="1"');body+=field("time","ساعت رزرو","time",meta.time||"");}
 if(kind==="bookings")body+=field("passengers","تعداد مسافران","number",meta.passengers||"",'min="1" step="1"');
 if(kind==="orders")body+=field("items","اقلام سفارش","text",meta.items||"",'placeholder="نام غذا و تعداد"',true);
 modal((isEdit?"ویرایش ":"ثبت ")+title,body,function(v){
  var extraFields={};["sku","grams","karat","qty","image","destination","departure","capacity","partySize","passengers","items","time"].forEach(function(k){if(v[k]!==undefined)extraFields[k]=v[k];});
  var item={id:rid||id("record"),businessId:bid,kind:kind,title:v.title.trim(),detail:v.detail.trim(),amount:Math.max(0,Number(v.amount)||0),status:v.status,date:v.date,note:v.note.trim(),meta:extraFields,createdAt:r?.createdAt||new Date().toISOString()};
  if(isEdit)Object.assign(r,item);else data.records.push(item);
  log((isEdit?"ویرایش ":"ثبت ")+title+" "+v.title,bid);afterSave(title+" ذخیره شد.");
 },"ذخیره "+title,isEdit?"حذف این مورد":null,"delete-record:"+rid);
}
function editCustomer(cid,bid){
 var c=data.customers.find(function(x){return x.id===cid;});var isEdit=!!c;
 var body=field("name","نام مشتری","text",c?.name||"","required maxlength=120",true)+field("phone","شماره تماس","tel",c?.phone||"",'placeholder="09..."')+businessSelect(c?.businessId||bid||data.businesses[0]?.id)+textarea("note","یادداشت ارتباط",c?.note||"");
 modal(isEdit?"ویرایش مشتری":"افزودن مشتری",body,function(v){
  var item={id:cid||id("cust"),name:v.name.trim(),phone:v.phone.trim(),businessId:v.businessId,note:v.note.trim(),createdAt:c?.createdAt||new Date().toISOString()};
  if(isEdit)Object.assign(c,item);else data.customers.push(item);
  log((isEdit?"ویرایش مشتری ":"افزودن مشتری ")+v.name,v.businessId);afterSave("اطلاعات مشتری ذخیره شد.");
 },"ذخیره مشتری",isEdit?"حذف مشتری":null,"delete-customer:"+cid);
}
function editTask(tid,bid){
 var t=data.tasks.find(function(x){return x.id===tid;});var isEdit=!!t;
 var body=field("title","عنوان اقدام","text",t?.title||"","required maxlength=140",true)+businessSelect(t?.businessId||bid||"","yes")+field("due","سررسید","date",t?.due||today())+select("priority","اولویت",[["normal","عادی"],["high","بالا"],["critical","فوری"]],t?.priority||"normal")+textarea("note","شرح کار",t?.note||"");
 modal(isEdit?"ویرایش کار":"کار و پیگیری جدید",body,function(v){
  var item={id:tid||id("task"),title:v.title.trim(),businessId:v.businessId||"",due:v.due,priority:v.priority,note:v.note.trim(),done:t?.done||false,createdAt:t?.createdAt||new Date().toISOString()};
  if(isEdit)Object.assign(t,item);else data.tasks.push(item);
  log((isEdit?"ویرایش کار ":"ایجاد کار ")+v.title,v.businessId);afterSave("کار ثبت شد.");
 },"ذخیره کار",isEdit?"حذف کار":null,"delete-task:"+tid);
}
function removeItem(kind,k){
 var target={finance:"finances",record:"records",customer:"customers",task:"tasks",business:"businesses"}[kind];
 if(!target)return;
 if(kind==="business"&&["restaurant","jewelry","travel"].includes(k)){toast("برای واحدهای اصلی، از ویرایش مشخصات استفاده کنید.");return;}
 if(!confirm("این مورد به‌صورت دائمی از همین مرورگر حذف شود؟"))return;
 if(kind==="business"&&(data.finances.some(function(f){return f.businessId===k;})||data.records.some(function(f){return f.businessId===k;})||data.customers.some(function(f){return f.businessId===k;})||data.tasks.some(function(f){return f.businessId===k;})||data.modules.some(function(f){return f.businessId===k;}))){toast("ابتدا اطلاعات وابسته این کسب‌وکار را حذف یا منتقل کنید.");return;}
 data[target]=data[target].filter(function(x){return x.id!==k;});
 if(route.biz===k)route={area:"businesses",biz:null,tab:"overview"};log("حذف مورد از "+target,"");afterSave("مورد انتخاب‌شده حذف شد.");
}
function exportBlob(name,content,mime){var a=document.createElement("a"),url=URL.createObjectURL(new Blob([content],{type:mime}));a.href=url;a.download=name;document.body.appendChild(a);a.click();a.remove();setTimeout(function(){URL.revokeObjectURL(url);},1200);}
function exportCSV(){var rows=[["تاریخ","کسب‌وکار","نوع","شرح","دسته‌بندی","مبلغ تومان","یادداشت"]].concat(financeRows(filterBiz==="all"?null:filterBiz).map(function(f){return [f.date,bizName(f.businessId),f.type==="income"?"دریافتی":"پرداختی",f.title,f.category,f.amount,f.note];}));var csv="\uFEFF"+rows.map(function(x){return x.map(function(c){return '"'+String(c===undefined?"":c).replace(/"/g,'""')+'"';}).join(",");}).join("\r\n");exportBlob("RF-Holding-Finance.csv",csv,"text/csv;charset=utf-8");toast("فایل CSV آماده شد.");}
function exportJSON(){exportBlob("RF-Holding-Backup-"+today()+".json",JSON.stringify({product:"rf-holding",exportedAt:new Date().toISOString(),data:data},null,2),"application/json;charset=utf-8");toast("فایل پشتیبان دریافت شد.");}
function importJSON(){var input=document.createElement("input");input.type="file";input.accept=".json,application/json";input.addEventListener("change",function(){var file=input.files[0];if(!file)return;file.text().then(function(txt){var src=JSON.parse(txt);if(src.product!=="rf-holding"||!src.data||!Array.isArray(src.data.businesses)){throw new Error("فرمت فایل پشتیبان معتبر نیست.");}if(!confirm("داده‌های موجود این دستگاه با فایل انتخاب‌شده جایگزین شوند؟"))return;var incoming=src.data;for(var k of ["finances","customers","tasks","records","events","modules"]){if(!Array.isArray(incoming[k]))throw Error("ساختار پشتیبان کامل نیست.");}data=incoming;persist();routeTo("home");toast("اطلاعات پشتیبان بازیابی شدند.");}).catch(function(err){alert("بازیابی ناموفق: "+err.message);});});input.click();}
function runAction(a){
 if(a==="add-business"){editBusiness();return;}
 if(a.startsWith("add-module:")){editModule(null,a.split(":")[1]);return;}
 if(a.startsWith("edit-module:")){editModule(a.split(":")[1]);return;}
 if(a.startsWith("delete-module:")){var mid=a.split(":")[1];if(data.records.some(function(r){return r.kind===mid;})){toast("ابتدا موارد ثبت‌شده در این ماژول را حذف کنید.");return;}if(confirm("ماژول حذف شود؟")){data.modules=data.modules.filter(function(m){return m.id!==mid;});route.tab="overview";afterSave("ماژول حذف شد.");}return;}
 if(a==="add-finance"){editFinance();return;}
 if(a==="add-customer"){editCustomer();return;}
 if(a==="add-task"){editTask();return;}
 if(a==="go-businesses"){routeTo("businesses");return;}
 if(a==="quick-add"){
  var body='<div class="form-row span2"><p class="micro-note">چه چیزی می‌خواهید ثبت کنید؟</p></div><div class="form-row span2"><div class="tool-cards" style="grid-template-columns:repeat(2,1fr)"><button type="button" class="tool-card" data-action="add-finance"><span class="tool-ico">💳</span><strong>دریافت / پرداخت</strong></button><button type="button" class="tool-card" data-action="add-task"><span class="tool-ico">☑</span><strong>کار و پیگیری</strong></button><button type="button" class="tool-card" data-action="add-customer"><span class="tool-ico">👤</span><strong>مشتری</strong></button><button type="button" class="tool-card" data-action="add-business"><span class="tool-ico">＋</span><strong>کسب‌وکار</strong></button></div></div>';
  modal("ثبت سریع در RF Holding",body,function(){}, "بستن");
  return;
 }
 if(a==="close-modal"){closeModal();return;}
 if(a==="export-finance"){exportCSV();return;}
 if(a==="export-json"){exportJSON();return;}
 if(a==="import-json"){importJSON();return;}
 if(a==="reset-data"){if(confirm("تمام داده‌های ثبت‌شده در این مرورگر حذف شود؟ ابتدا نسخه پشتیبان بگیرید.")){data=fresh();filterBiz="all";persist();routeTo("home");toast("فضای اولیه بازنشانی شد.");}return;}
 if(a==="print-page"){window.print();return;}
 if(a.startsWith("edit-business:")){editBusiness(a.split(":")[1]);return;}
 if(a.startsWith("add-finance:")){editFinance(null,a.split(":")[1]);return;}
 if(a.startsWith("add-record:")){var z=a.split(":");editRecord(z[2],z[1]);return;}
 if(a.startsWith("quick-record:")){var b=findBiz(a.split(":")[1]);if(b)editRecord(b.id,kindOf(b).quick[0][0]);return;}
 if(a.startsWith("biz-all-records")){var bid=a.split(":")[1];var b=findBiz(bid);if(b)routeTo("business",b.id,kindOf(b).tabs[1][0]);return;}
 if(a.startsWith("delete-")){var z=a.split(":");removeItem(z[0].slice(7),z[1]);return;}
}
document.addEventListener("click",function(e){
 var x=e.target.closest("[data-route]");if(x){routeTo(x.dataset.route);return;}
 x=e.target.closest("[data-biz]");if(x){routeTo("business",x.dataset.biz);return;}
 x=e.target.closest("[data-tab]");if(x){routeTo("business",x.dataset.forbiz,x.dataset.tab);return;}
 x=e.target.closest("[data-record]");if(x){var r=data.records.find(function(r){return r.id===x.dataset.record;});if(r)editRecord(r.businessId,r.kind,r.id);return;}
 x=e.target.closest("[data-finance]");if(x){editFinance(x.dataset.finance);return;}
 x=e.target.closest("[data-customer]");if(x){editCustomer(x.dataset.customer);return;}
 x=e.target.closest("[data-task]");if(x){editTask(x.dataset.task);return;}
 x=e.target.closest("[data-action]");if(x){runAction(x.dataset.action);return;}
});
document.addEventListener("change",function(e){
 if(e.target.id==="financeFilter"){filterBiz=e.target.value;render();}
 var tid=e.target.dataset.taskcheck;if(tid){var t=data.tasks.find(function(t){return t.id===tid;});if(t){t.done=!!e.target.checked;persist();render();toast(t.done?"کار تکمیل شد.":"کار به فهرست پیگیری بازگشت.");}}
});
document.getElementById("menuOpen").addEventListener("click",function(){document.getElementById("sidebar").classList.add("is-open");document.getElementById("navOverlay").hidden=false;});
document.getElementById("closeSidebar").addEventListener("click",closeSidebar);
document.getElementById("navOverlay").addEventListener("click",closeSidebar);
document.addEventListener("keydown",function(e){if(e.key==="Escape"){closeModal();closeSidebar();document.getElementById("searchResults").hidden=true;}});
document.getElementById("globalSearch").addEventListener("input",function(e){
 var term=e.target.value.trim().toLocaleLowerCase("fa"),box=document.getElementById("searchResults");searchTerm=term;if(!term){box.hidden=true;return;}
 var list=[];
 data.businesses.filter(function(b){return b.name.toLowerCase().includes(term);}).forEach(function(b){list.push({label:b.name,sub:"کسب‌وکار",biz:b.id});});
 data.customers.filter(function(c){return c.name.toLowerCase().includes(term);}).slice(0,5).forEach(function(c){list.push({label:c.name,sub:"مشتری · "+bizName(c.businessId),customer:c.id});});
 data.tasks.filter(function(t){return t.title.toLowerCase().includes(term);}).slice(0,5).forEach(function(t){list.push({label:t.title,sub:"کار · "+bizName(t.businessId),task:t.id});});
 data.records.filter(function(r){return r.title.toLowerCase().includes(term);}).slice(0,5).forEach(function(r){list.push({label:r.title,sub:RECORD_TITLES[r.kind]+" · "+bizName(r.businessId),record:r.id});});
 box.hidden=false;box.innerHTML=list.length?list.slice(0,10).map(function(item){return '<button class="search-result" type="button" '+(item.biz?'data-biz="'+esc(item.biz)+'"':item.customer?'data-customer="'+esc(item.customer)+'"':item.task?'data-task="'+esc(item.task)+'"':'data-record="'+esc(item.record)+'"')+'><span>⌕</span><span><strong>'+esc(item.label)+'</strong><br><small class="muted">'+esc(item.sub)+'</small></span></button>';}).join(""):'<p class="micro-note" style="padding:12px">موردی پیدا نشد.</p>';
});
render();
})();