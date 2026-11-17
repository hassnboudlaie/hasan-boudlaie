/* Legacy case desk bridge: keep original AI-only button DISABLED until backend setup.
 * The new ubiquitous local educational companion remains available independently.
 */
(function(){
 "use strict";
 const button=document.getElementById("cj-ask-ai");
 const output=document.getElementById("cj-ai-response");
 if(!button)return;
 const cfg=window.SABA_AI_CONFIG||{};
 const isConfigured=typeof cfg.endpoint==="string"&&/^https:\/\/[a-z0-9-]+\.supabase\.co\/functions\/v1\/leadership-coach$/.test(cfg.endpoint)
   &&!!cfg.publishableKey&&!!window.SabaAiCoach;
 if(!isConfigured){button.disabled=true;button.textContent="کوچ AI زنده · نیازمند اتصال امن";return}
 button.disabled=false;button.textContent="بازکردن کوچ همراه رهبری";
 button.addEventListener("click",function(){
   if(window.SabaAiCoach&&typeof window.SabaAiCoach.open==="function")window.SabaAiCoach.open();
   else if(output){output.hidden=false;output.textContent="پنل کوچ همراه بارگذاری نشد؛ صفحه را دوباره باز کنید."}
 });
})();
