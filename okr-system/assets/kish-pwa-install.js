/* Installability only; no changes to OKR routes, models, storage or data. */
(()=>{
 'use strict';
 let deferredPrompt=null;
 let button=null;
 const installed=()=>window.matchMedia('(display-mode: standalone)').matches||window.navigator.standalone===true;
 function hide(){if(button){button.remove();button=null;}}
 function show(){
  if(installed()||!deferredPrompt)return;
  const actions=document.querySelector('.top-actions');
  if(!actions||button)return;
  button=document.createElement('button');
  button.type='button';
  button.className='btn';
  button.id='kishPwaInstall';
  button.textContent='نصب اپ';
  button.title='نصب سامانه OKR کیش روی دستگاه';
  button.setAttribute('aria-label','نصب اپلیکیشن بنادر و فرودگاه‌های کیش');
  button.style.minHeight='42px';
  button.addEventListener('click',async()=>{
   const prompt=deferredPrompt;
   if(!prompt)return;
   deferredPrompt=null;
   hide();
   try{await prompt.prompt();await prompt.userChoice;}catch(e){/* browser controls install */ }
  });
  actions.appendChild(button);
 }
 window.addEventListener('beforeinstallprompt',event=>{
  if(installed())return;
  event.preventDefault();
  deferredPrompt=event;
  show();
 });
 window.addEventListener('appinstalled',()=>{deferredPrompt=null;hide();});
 window.addEventListener('load',()=>{
  if('serviceWorker' in navigator && location.protocol==='https:'){
   navigator.serviceWorker.register('./sw.js',{scope:'./',updateViaCache:'none'})
    .then(reg=>reg.update().catch(()=>{})).catch(()=>{});
  }
  show();
 });
})();
