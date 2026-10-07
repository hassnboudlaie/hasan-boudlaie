'use strict';
let currentLang='en';
let isPreview=false;
try{currentLang=localStorage.getItem('hb-lang')==='fa'?'fa':'en'}catch(e){}
function esc(value){return String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function textOf(value,lang=currentLang){return typeof value==='string'?value:(value?.[lang]??value?.en??'')}
function webURL(value){try{const u=new URL(String(value||''),location.href);return ['https:','http:'].includes(u.protocol)?u.href:''}catch(e){return ''}}
function imageURL(value){return /^data:image\/(?:jpeg|png|webp);base64,[A-Za-z0-9+/=]+$/.test(value||'')?value:webURL(value)}
function emailAddress(value){return /^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(value||'')?value:''}
function dataAt(data,path){return path.split('.').reduce((v,k)=>v?.[k],data)}
function setLang(lang){
 currentLang=lang==='fa'?'fa':'en';document.documentElement.lang=currentLang;document.documentElement.dir=currentLang==='fa'?'rtl':'ltr';
 document.querySelectorAll('[data-en][data-fa]').forEach(el=>{el.textContent=el.getAttribute('data-'+currentLang)||''});
 document.querySelectorAll('[data-aria-en]').forEach(el=>el.setAttribute('aria-label',el.getAttribute('data-aria-'+currentLang)||''));
 document.querySelectorAll('[data-lang]').forEach(el=>el.setAttribute('aria-pressed',String(el.dataset.lang===currentLang)));
 try{localStorage.setItem('hb-lang',currentLang)}catch(e){}
 if(window.siteData)renderSite(window.siteData);
}
function cardLink(url,cls,inner){const safe=webURL(url);return safe?`<a class="${cls}" href="${esc(safe)}" target="_blank" rel="noopener">${inner}</a>`:`<article class="${cls}">${inner}</article>`}
function renderProducts(products){
 const box=document.getElementById('productsList');if(!box||!Array.isArray(products))return;
 box.innerHTML=products.map((p,i)=>cardLink(p.url,'product-card',`<div class="card-meta"><span class="index" aria-hidden="true">${String(i+1).padStart(2,'0')}</span>${p.stage?`<span class="tag">${esc(textOf(p.stage))}</span>`:''}</div><h2>${esc(textOf(p.title))}</h2><p class="organization">${esc(textOf(p.org))}</p><p class="card-description">${esc(textOf(p.description))}</p>${webURL(p.url)?`<span class="card-action">${currentLang==='fa'?'باز کردن اپلیکیشن':'Open application'}</span>`:''}`)).join('');
}
function renderServices(services){
 const box=document.getElementById('services');if(!box||!Array.isArray(services))return;
 box.innerHTML=services.map((s,i)=>`<article class="service-card"><span class="index" aria-hidden="true">${String(i+1).padStart(2,'0')}</span><h2>${esc(textOf(s))}</h2>${s.description?`<p>${esc(textOf(s.description))}</p>`:''}${s.outcome?`<div class="deliverable"><span class="eyebrow">${currentLang==='fa'?'نمونهٔ خروجی':'Example deliverables'}</span><p>${esc(textOf(s.outcome))}</p></div>`:''}</article>`).join('');
}
function renderList(id,items){const box=document.getElementById(id);if(box&&Array.isArray(items))box.innerHTML=items.map(x=>`<li>${esc(textOf(x))}</li>`).join('')}
function renderPublications(items){
 const box=document.getElementById('publications');if(!box||!Array.isArray(items))return;
 box.innerHTML=items.map(p=>`<article class="publication"><div class="publication-copy"><p class="publication-meta" dir="auto">${esc(textOf(p.meta))}</p><h3>${esc(textOf(p.title))}</h3><p>${esc(textOf(p.description))}</p></div>${webURL(p.url)?`<a class="btn" href="${esc(webURL(p.url))}" target="_blank" rel="noopener">${currentLang==='fa'?'مشاهدهٔ مقاله':'Read publication'}</a>`:''}</article>`).join('');
}
function renderSite(data){
 document.querySelectorAll('[data-content]').forEach(el=>{const value=dataAt(data,el.dataset.content);if(value!==undefined)el.textContent=textOf(value)});
 document.querySelectorAll('.brand').forEach(el=>el.setAttribute('aria-label',textOf(data.brand)));
 const photo=document.getElementById('profilePhoto');const photoURL=imageURL(data.profile?.photoUrl);if(photo&&photoURL&&photo.src!==photoURL)photo.src=photoURL;
 renderProducts(data.products);renderServices(data.advisory?.services);renderList('aboutCredentials',data.about?.credentials);renderList('researchTopics',data.research?.topics);renderPublications(data.research?.publications);
 document.querySelectorAll('[data-contact]').forEach(el=>{const url=webURL(data.contact?.[el.dataset.contact]);if(url){el.href=url;el.hidden=false}else el.hidden=true});
 const email=emailAddress(data.contact?.email);const emailLink=document.getElementById('emailLink');if(emailLink&&email){emailLink.href='mailto:'+email;emailLink.textContent=email}
 const subjects=currentLang==='fa'?{advisory:'درخواست همکاری مشاوره‌ای',education:'درخواست آموزش مدیران',research:'پیشنهاد همکاری پژوهشی'}:{advisory:'Advisory inquiry',education:'Executive education inquiry',research:'Research collaboration'};
 if(email)document.querySelectorAll('[data-inquiry]').forEach(el=>el.href='mailto:'+email+'?subject='+encodeURIComponent(subjects[el.dataset.inquiry]||''));
 const page=document.body?.dataset.page;const labels={index:{en:'Management & Leadership',fa:'مدیریت و رهبری'},products:{en:'Applications & learning tools',fa:'اپلیکیشن‌ها و ابزارهای یادگیری'},advisory:{en:'Advisory',fa:'مشاوره'},about:{en:'About',fa:'دربارهٔ من'},research:{en:'Research',fa:'پژوهش'},contact:{en:'Contact',fa:'تماس'}};
 if(labels[page])document.title=textOf(labels[page])+' | '+textOf(data.brand);
 if(isPreview)previewLinks();
}
function previewLinks(){document.querySelectorAll('a[href]').forEach(el=>{try{const url=new URL(el.getAttribute('href'),location.href);if(url.origin===location.origin&&/\/hasan-boudlaie\/(?:index|products|advisory|about|research|contact)\.html$/.test(url.pathname)){url.searchParams.set('preview','1');el.href=url.href}}catch(e){}})}
function closeMenu(focus=false){document.querySelector('.site-header')?.classList.remove('menu-open');const button=document.querySelector('.menu-toggle');button?.setAttribute('aria-expanded','false');if(focus)button?.focus()}
async function loadSiteData(){
 const status=document.getElementById('loadStatus');
 try{
  const r=await fetch('content.json?v='+Date.now(),{cache:'no-store'});if(!r.ok)throw new Error('load');const d=await r.json();if(!d||typeof d!=='object'||!Array.isArray(d.products))throw new Error('content');window.siteData=d;renderSite(d);if(status)status.hidden=true;
 }catch(e){if(status){status.hidden=false;status.replaceChildren();const label=document.createElement('span');label.textContent=currentLang==='fa'?'نسخهٔ موجود نمایش داده می‌شود؛ دریافت آخرین محتوا ممکن نشد.':'Showing the published page; the latest content could not be loaded.';const retry=document.createElement('button');retry.type='button';retry.textContent=currentLang==='fa'?'تلاش دوباره':'Retry';retry.addEventListener('click',loadSiteData);status.append(label,retry)}}
}
document.addEventListener('DOMContentLoaded',()=>{
 document.querySelectorAll('[data-lang]').forEach(button=>button.addEventListener('click',()=>setLang(button.dataset.lang)));
 const menu=document.querySelector('.menu-toggle');menu?.addEventListener('click',()=>{const expanded=menu.getAttribute('aria-expanded')!=='true';menu.setAttribute('aria-expanded',String(expanded));document.querySelector('.site-header')?.classList.toggle('menu-open',expanded)});
 document.addEventListener('keydown',e=>{if(e.key==='Escape')closeMenu(true)});
 document.addEventListener('click',e=>{if(!e.target.closest('.site-header'))closeMenu()});document.querySelectorAll('.navlinks a').forEach(el=>el.addEventListener('click',()=>closeMenu()));
 const photo=document.getElementById('profilePhoto');const fallbackPhoto=photo?.getAttribute('src');photo?.addEventListener('error',()=>{if(photo.src!==fallbackPhoto)photo.src=fallbackPhoto;else photo.closest('.portrait-card').hidden=true});
 setLang(currentLang);
 let preview=false;try{if(new URLSearchParams(location.search).get('preview')==='1'){const d=JSON.parse(sessionStorage.getItem('hb-site-preview')||'null');if(d&&Array.isArray(d.products)){isPreview=true;window.siteData=d;renderSite(d);document.getElementById('previewBanner').hidden=false;preview=true}}}catch(e){}
 if(!preview)loadSiteData();
});
