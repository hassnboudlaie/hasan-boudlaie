/* My Finance v53 · non-disruptive PWA update notice.
   Never reload while a user is working. No authentication or finance data is accessed.
*/
(()=>{
 'use strict';
 const notice=document.getElementById('mf-update-notice');
 const apply=document.getElementById('mf-update-apply');
 if(!notice||!apply)return;
 function showUpdate(){notice.hidden=false}
 apply.addEventListener('click',()=>{
  if(!window.confirm('برای نمایش نسخه تازه، صفحه دوباره بارگذاری می‌شود. اطلاعاتی که هنوز ثبت نکرده‌اید ممکن است از دست برود. ادامه می‌دهید؟'))return;
  window.location.reload();
 });
 if(!('serviceWorker' in navigator))return;
 let controlled=navigator.serviceWorker.controller;
 navigator.serviceWorker.addEventListener('controllerchange',()=>{
  const latest=navigator.serviceWorker.controller;
  if(controlled&&latest&&latest!==controlled)showUpdate();
  controlled=latest;
 });
 // Make updates discoverable on reconnect without forcing any disruptive navigation.
 window.addEventListener('online',()=>{
  navigator.serviceWorker.getRegistration().then(reg=>reg?.update()).catch(()=>{});
 });
 navigator.serviceWorker.getRegistration().then(reg=>{
  if(reg?.waiting&&navigator.serviceWorker.controller)showUpdate();
 }).catch(()=>{});
})();
