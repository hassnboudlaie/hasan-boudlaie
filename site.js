let currentLang=localStorage.getItem('hb-lang')==='fa'?'fa':'en';
function setLang(lang){
  currentLang=lang;
  const fa=lang==='fa';
  document.documentElement.lang=fa?'fa':'en';
  document.documentElement.dir=fa?'rtl':'ltr';
  document.body.classList.toggle('rtl',fa);
  document.querySelectorAll('[data-en][data-fa]').forEach(el=>{
    const v=el.getAttribute(fa?'data-fa':'data-en')||'';
    if(v.includes('<')) el.innerHTML=v; else el.textContent=v;
  });
  document.querySelectorAll('[data-lang]').forEach(b=>b.classList.toggle('active',b.dataset.lang===lang));
  localStorage.setItem('hb-lang',lang);
  if(window.siteData && typeof window.renderDynamic==='function') window.renderDynamic(window.siteData,lang);
}
function esc(v){return String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
async function loadSiteData(){
  try{
    const r=await fetch('content.json?v='+Date.now(),{cache:'no-store'});
    if(!r.ok) throw new Error('content');
    window.siteData=await r.json();
    if(typeof window.renderDynamic==='function') window.renderDynamic(window.siteData,currentLang);
  }catch(e){}
}
document.addEventListener('DOMContentLoaded',()=>{
  setLang(currentLang);
  loadSiteData();
});
