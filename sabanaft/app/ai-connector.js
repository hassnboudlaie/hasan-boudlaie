/* Optional authenticated AI backend connector.
   Disabled until an isolated Supabase Saba Naft project, login, consent, quotas and OpenAI secret exist.
   NEVER send an API secret to this browser. */
(function(){
'use strict';
var btn=document.getElementById('cj-ask-ai'),out=document.getElementById('cj-ai-response');
if(!btn||!out)return;
function config(){
 var c=window.SABA_AI_CONFIG||{};
 if(!c.endpoint||!c.publishableKey||!window.SabaSecureSession||typeof window.SabaSecureSession.getAccessToken!=='function')return null;
 try{
  var u=new URL(c.endpoint);
  if(u.protocol!=='https:'||!u.hostname.endsWith('.supabase.co')||!u.pathname.endsWith('/functions/v1/leadership-coach'))return null;
  return c;
 }catch(e){return null;}
}
var c=config();
if(!c)return;
btn.disabled=false;
btn.textContent='درخواست راهنمایی از AI Coach';
btn.addEventListener('click',async function(){
 var situation=document.getElementById('cj-situation').value.trim();
 var consent=document.getElementById('cj-ai-consent').checked;
 if(situation.length<12||situation.length>2200){out.hidden=false;out.textContent='ابتدا یک موقعیت روشن و بدون اطلاعات محرمانه بنویسید.';return;}
 if(!consent){out.hidden=false;out.textContent='برای ارسال متن به سرویس هوش مصنوعی، باید رضایت آگاهانه را فعال کنید.';return;}
 var token;
 try{token=await window.SabaSecureSession.getAccessToken();}catch(e){}
 if(typeof token!=='string'||token.length<30){out.hidden=false;out.textContent='ورود امن کاربر انجام نشده است. ابتدا باید حساب سازمانی فعال شود.';return;}
 btn.disabled=true;btn.textContent='در حال دریافت پاسخ AI...';
 out.hidden=false;out.textContent='پرسش فقط پس از تأیید شما برای پردازش ارسال شد.';
 var abort=new AbortController(),timeout=setTimeout(function(){abort.abort();},30000);
 try{
  var response=await fetch(c.endpoint,{
   method:'POST',
   mode:'cors',
   credentials:'omit',
   headers:{'Authorization':'Bearer '+token,'apikey':c.publishableKey,'Content-Type':'application/json'},
   body:JSON.stringify({situation:situation,context:document.getElementById('cj-context').value,urgency:document.getElementById('cj-urgency').value,issue:document.getElementById('cj-choice').value,consent:true}),
   signal:abort.signal
  });
  var data=await response.json().catch(function(){return {};});
  if(!response.ok)throw new Error(data.error||'no_response');
  if(typeof data.answer!=='string'||!data.answer.trim())throw new Error('empty_response');
  out.textContent=data.answer.trim()+'\n\nاین پاسخ با هوش مصنوعی تولید شده است؛ تصمیم نهایی، مقررات و مسئولیت با مدیر و مرجع مجاز سازمان است.';
 }catch(e){
  out.textContent='دریافت پاسخ AI انجام نشد ('+(e.name==='AbortError'?'پایان زمان پاسخ':'خطا در اتصال یا مجوز')+'). راهنمای اولیه بدون AI همچنان قابل استفاده است.';
 }finally{
  clearTimeout(timeout);btn.disabled=false;btn.textContent='درخواست راهنمایی از AI Coach';
 }
});
})();