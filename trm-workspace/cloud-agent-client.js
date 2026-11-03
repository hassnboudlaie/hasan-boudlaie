/* TRM Cloud Agent client. No personal candidate data, secrets or raw CVs are sent.
   Uses Supabase Auth access token kept in memory only; no plaintext credentials persisted. */
(function(root){
"use strict";
const cfg=root.TRM_CLOUD_CONFIG||{},base=String(cfg.supabaseUrl||"").replace(/\/$/,"");
let accessToken="",user=null,memberships=[],orgId="";
const configured=Boolean(cfg.enabled&&base.startsWith("https://")&&String(cfg.publishableKey||"").length>12);
function errorMessage(response){return response?.msg||response?.error_description||response?.message||response?.error||"درخواست با خطا مواجه شد."}
async function read(response){
 const result=await response.json().catch(()=>({}));
 if(!response.ok)throw Error(errorMessage(result));
 return result;
}
function headers(){return {apikey:cfg.publishableKey,authorization:"Bearer "+accessToken,"content-type":"application/json"}}
function isAuthenticated(){return Boolean(accessToken&&user?.id&&orgId)}
async function signIn(email,password){
 if(!configured)throw Error("اتصال سازمانی AI هنوز پیکربندی نشده است.");
 if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)||!password)throw Error("ایمیل و گذرواژه معتبر ضروری هستند.");
 const s=await read(await fetch(base+"/auth/v1/token?grant_type=password",{
 method:"POST",headers:{apikey:cfg.publishableKey,"content-type":"application/json"},
 body:JSON.stringify({email,password}),cache:"no-store"
 }));
 if(!s.access_token||!s.user?.id)throw Error("ورود تأیید نشد.");
 accessToken=s.access_token;user=s.user;
 try{
  memberships=await read(await fetch(base+"/rest/v1/trm_memberships?select=org_id,role,status&user_id=eq."+encodeURIComponent(user.id)+"&status=eq.active",{headers:headers(),cache:"no-store"}));
  memberships=(Array.isArray(memberships)?memberships:[]).filter(x=>["owner","admin","recruiter","manager"].includes(x.role));
  if(!memberships.length)throw Error("برای حساب شما عضویت فعال TRM تعریف نشده است.");
  orgId=memberships.length===1?memberships[0].org_id:"";
  return {user,organizations:memberships,needsSelection:!orgId};
 }catch(e){logout();throw e}
}
function chooseOrg(id){
 if(!memberships.some(x=>x.org_id===id))throw Error("سازمان انتخابی به حساب شما تعلق ندارد.");
 orgId=id;
}
function logout(){accessToken="";user=null;memberships=[];orgId=""}
function status(){return {configured,authenticated:isAuthenticated(),signedIn:Boolean(user&&accessToken),organizations:[...memberships],orgId}}
async function analyze(mode,context,question=""){
 if(!configured)throw Error("Agent روی Backend اختصاصی نصب نشده است.");
 if(!isAuthenticated())throw Error("ابتدا وارد حساب سازمانی شوید و سازمان را انتخاب کنید.");
 if(!["evp","role","vacancy","relationship"].includes(mode))throw Error("نوع تحلیل معتبر نیست.");
 // Deliberate explicit allowlist; never serialize the full local workspace.
 const payload={mode,org_id:orgId,context,question:String(question||"").slice(0,850)};
 const res=await fetch(base+"/functions/v1/"+encodeURIComponent(cfg.functionName||"trm-agent"),{
  method:"POST",headers:headers(),body:JSON.stringify(payload),cache:"no-store"
 });
 const data=await read(res);
 if(data.kind!=="generative_draft"||!data.requiresHumanApproval||!data.analysis)throw Error("خروجی Agent معتبر نیست.");
 return data.analysis;
}
root.TRMCloudAgent=Object.freeze({get configured(){return configured},status,signIn,chooseOrg,logout,analyze});
})(window);
