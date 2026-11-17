/* Backwards-compatible entry from the existing coaching desk.
 * All model calls and consent are handled by the universal companion.
 */
(function(){
 "use strict";
 const button=document.getElementById("cj-ask-ai");
 const output=document.getElementById("cj-ai-response");
 if(!button)return;
 button.disabled=false;button.textContent="بازکردن کوچ همراه رهبری";
 button.addEventListener("click",function(){
   if(window.SabaAiCoach&&typeof window.SabaAiCoach.open==="function"){
     window.SabaAiCoach.open();
   }else if(output){
     output.hidden=false;output.textContent="پنل کوچ همراه بارگذاری نشد؛ صفحه را دوباره باز کنید.";
   }
 });
})();
