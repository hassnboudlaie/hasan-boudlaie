(function(){'use strict';
let deferred=null;
const install=document.getElementById('install'),status=document.getElementById('status');
const standalone=()=>window.matchMedia('(display-mode: standalone)').matches || !!navigator.standalone;
const guide=()=>{status.textContent='اگر پنجره نصب نمایش داده نشد، از منوی سه‌نقطه مرورگر گزینه «نصب برنامه» یا «افزودن به صفحه اصلی» را انتخاب کنید.';document.getElementById('instructions').scrollIntoView({behavior:'smooth',block:'nearest'});};
if(standalone()){install.textContent='برنامه نصب شده؛ ورود به برنامه';status.textContent='این صفحه در حالت برنامه مستقل اجرا شده است.';install.onclick=()=>location.assign('./index.html')}
else{
 install.onclick=async()=>{
  if(!deferred){guide();return}
  const prompt=deferred;deferred=null;
  try{await prompt.prompt();const result=await prompt.userChoice;if(result&&result.outcome==='accepted'){status.textContent='درخواست نصب پذیرفته شد؛ پس از تکمیل، آیکون برنامه را باز کنید.'}else{status.textContent='درخواست نصب لغو شد. برای نصب می‌توانید از منوی مرورگر اقدام کنید.'}}
  catch(e){guide()}
 };
 window.addEventListener('beforeinstallprompt',event=>{event.preventDefault();deferred=event;status.textContent='آماده نصب مستقیم از مرورگر؛ روی دکمه بالا بزنید.'});
 window.addEventListener('appinstalled',()=>{status.textContent='نصب برنامه با موفقیت انجام شد.';install.textContent='ورود به برنامه';install.onclick=()=>location.assign('./index.html')});
 setTimeout(()=>{if(!deferred)status.textContent='برای نصب، دکمه بالا یا منوی سه‌نقطه مرورگر را انتخاب کنید.'},1200);
}
if('serviceWorker' in navigator){window.addEventListener('load',()=>navigator.serviceWorker.register('./sw.js',{scope:'./'}).catch(()=>{status.textContent='ثبت قابلیت نصب انجام نشد. اتصال اینترنت و مرورگر را بررسی کنید.'}))}
})();