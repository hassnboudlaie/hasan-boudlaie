/* My Finance internal asset/contract views: keep links inside parent shell.
   In standalone mode, native links remain unchanged. */
(()=>{
 'use strict';
 if(window.parent===window)return;
 const params=new URLSearchParams(location.search);
 if(params.get('embedded')!=='1')return;
 document.documentElement.classList.add('mf-embedded');
 document.addEventListener('click',event=>{
  const a=event.target.closest?.('a[href]');
  if(!a||a.target==='_blank')return;
  let url;
  try{url=new URL(a.href,location.href)}catch(_){return}
  if(url.origin!==location.origin)return;
  const base=location.pathname.replace(/(?:assets|contracts)\.html$/,'');
  if(!url.pathname.startsWith(base))return;
  const page=url.pathname.slice(base.length);
  let route;
  if(page==='assets.html')route='assets';
  else if(page==='contracts.html')route='contracts';
  else if(page===''||page==='index.html')route='home';
  if(!route||typeof window.parent.financeNavGo!=='function')return;
  event.preventDefault();
  window.parent.financeNavGo(route);
 });
})();
