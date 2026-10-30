/* My Finance r63: compact install invitation below header, never an overlay. */
(()=>{
 'use strict';
 if(window.__myFinanceInstallUI)return;
 window.__myFinanceInstallUI=true;
 let deferred=null;
 const standalone=()=>window.matchMedia('(display-mode: standalone)').matches||navigator.standalone===true;
 const dismissKey='myfinance-install-hidden-until-v2';
 const dismissed=()=>{try{return Number(localStorage.getItem(dismissKey)||0)>Date.now()}catch(_){return false}};
 const css=document.createElement('style');
 css.textContent=[
 '#mf-install{position:relative;z-index:1;margin:0 0 13px;padding:10px 13px;max-width:100%;',
 'background:var(--card,#fff);color:var(--fg,#163540);border:1px solid var(--line,#dae6e1);',
 'border-inline-start:3px solid var(--accent,#087d72);border-radius:14px;box-shadow:none;',
 'direction:rtl;font:12px Tahoma,Arial,sans-serif}',
 '#mf-install[hidden]{display:none!important}',
 '#mf-install .mf-install-row{display:flex;align-items:center;gap:9px;min-height:36px}',
 '#mf-install strong{font-size:12px;font-weight:800;line-height:1.65}',
 '#mf-install .mf-install-copy{flex:1 1 auto;min-width:0}',
 '#mf-install button{min-height:35px;padding:6px 11px;border:1px solid var(--line,#dae6e1);',
 'background:var(--mf-soft,#eef5f2);color:var(--accent,#087d72);border-radius:10px;',
 'cursor:pointer;font-weight:800;font-size:12px;white-space:nowrap}',
 '#mf-install button.mf-install-close{min-width:34px;width:34px;padding:4px;background:transparent;',
 'color:var(--muted,#657b80);font-size:19px;border-color:transparent}',
 '#mf-install-info{margin-top:8px;font-size:11px;line-height:1.9;color:var(--muted,#657b80)}',
 '@media(max-width:390px){#mf-install{padding:8px 9px}#mf-install strong{font-size:11px}',
 '#mf-install button{font-size:11px;padding:6px 8px}}'
 ].join('');
 document.head.appendChild(css);
 const panel=document.createElement('aside');
 panel.id='mf-install';panel.hidden=true;
 panel.setAttribute('aria-label','نصب اپلیکیشن');
 panel.innerHTML='<div class="mf-install-row"><div class="mf-install-copy"><strong>📲 نصب برنامه روی گوشی</strong></div><button type="button" id="mf-install-action">نصب</button><button type="button" class="mf-install-close" id="mf-install-close" aria-label="بستن پیشنهاد نصب">×</button></div><div id="mf-install-info" role="status" hidden></div>';
 const anchor=document.querySelector('.finance-app-header');
 if(anchor)anchor.insertAdjacentElement('afterend',panel);else document.body.appendChild(panel);
 const info=panel.querySelector('#mf-install-info');
 const isIOS=/iPad|iPhone|iPod/.test(navigator.userAgent);
 const show=()=>{panel.hidden=standalone()||dismissed()};
 const message=t=>{info.hidden=false;info.textContent=t};
 panel.querySelector('#mf-install-close').addEventListener('click',()=>{
  panel.hidden=true;try{localStorage.setItem(dismissKey,String(Date.now()+14*86400000))}catch(_){}
 });
 panel.querySelector('#mf-install-action').addEventListener('click',async()=>{
  if(deferred){
   const event=deferred;deferred=null;event.prompt();
   try{const result=await event.userChoice;if(result?.outcome==='accepted'){panel.hidden=true;return}}catch(_){}
   message('اگر پنجره نصب ظاهر نشد، از منوی مرورگر گزینه نصب برنامه را انتخاب کنید.');return;
  }
  message(isIOS?'در Safari گزینه اشتراک‌گذاری و سپس Add to Home Screen را انتخاب کنید.':
   'در Chrome از منوی سه‌نقطه گزینه Install app یا Add to Home screen را انتخاب کنید.');
 });
 window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();deferred=e;show()});
 window.addEventListener('appinstalled',()=>{deferred=null;panel.hidden=true});
 window.matchMedia('(display-mode: standalone)').addEventListener?.('change',()=>{if(standalone())panel.hidden=true});
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',show,{once:true});else show();
})();
