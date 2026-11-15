/* Allameh MBA: self-service password setup on an approved student device.
   The personal password is sent to the isolated Edge function over HTTPS,
   bcrypt-hashed on the server and NEVER stored in browser storage. */
(()=>{
"use strict";
if(window.OB_ACCESS?.role!=="student")return;
const ENDPOINT="https://hxcjkewlaniahvuqwwbb.supabase.co/functions/v1/mba-ob-student-devices";
const STORE="mba-ob-classroom-attendance-identity-v1";
const getToken=()=>{try{return JSON.parse(localStorage.getItem(STORE)||"null")?.token||null}catch{return null}};
let dialog=null;
function ensureDialog(){
 if(dialog)return dialog;
 dialog=document.createElement("dialog");
 dialog.id="obDeviceDialog";dialog.className="ob-device-dialog";
 dialog.setAttribute("aria-labelledby","obDeviceTitle");
 dialog.innerHTML='<div class="ob-device-inner"><div class="ob-device-head"><div><span>ورود مستقل به همه دستگاه‌ها</span><h2 id="obDeviceTitle">تعریف رمز شخصی دانشجو</h2></div><button type="button" data-device-close aria-label="بستن پنجره">×</button></div>'+
 '<p>عضویت شما قبلاً تأیید شده است. یک‌بار رمز شخصی تعریف کنید تا بعداً با <strong>شماره دانشجویی و این رمز</strong> روی هر گوشی یا لپ‌تاپ دیگری وارد شوید؛ بدون تأیید دوباره مدرس.</p>'+
 '<form id="obDeviceForm" class="ob-device-form"><label for="obDevicePassword">رمز ورود (حداقل ۱۲ نویسه، شامل حرف و عدد)</label>'+
 '<input id="obDevicePassword" type="password" name="password" minlength="12" maxlength="128" autocomplete="new-password" required>'+
 '<label for="obDeviceConfirm">تکرار رمز ورود</label>'+
 '<input id="obDeviceConfirm" type="password" name="confirm" minlength="12" maxlength="128" autocomplete="new-password" required>'+
 '<button type="submit" class="ob-device-submit">ثبت رمز برای ورود در دستگاه‌های دیگر</button></form>'+
 '<div id="obDeviceStatus" class="ob-device-status" role="status" aria-live="polite" aria-atomic="true"></div>'+
 '<p class="ob-device-private">این رمز برای شماست؛ آن را به افراد دیگر ندهید. با تعریف رمز جدید، رمز قبلی ورود دستگاه‌های جدید غیرفعال می‌شود. حساب دستگاه‌های قبلاً واردشده فقط طبق اعتبار Session خود فعال می‌مانند.</p></div>';
 document.body.append(dialog);
 dialog.querySelector("[data-device-close]").addEventListener("click",()=>dialog.close());
 dialog.addEventListener("click",e=>{if(e.target===dialog)dialog.close()});
 dialog.querySelector("#obDeviceForm").addEventListener("submit",submit);
 return dialog;
}
async function submit(e){
 e.preventDefault();
 const form=e.currentTarget,status=dialog.querySelector("#obDeviceStatus");
 const password=form.elements.namedItem('password').value,confirm=form.elements.namedItem('confirm').value;
 if(password!==confirm){status.textContent="دو رمز واردشده یکسان نیستند.";return}
 if(password.length<12||password.length>128||!/\p{L}/u.test(password)||!/[0-9]/.test(password)){
  status.textContent="رمز باید حداقل ۱۲ نویسه و شامل حرف و عدد باشد.";return;
 }
 const token=getToken();if(!token){status.textContent="جلسه شما منقضی شده است؛ دوباره وارد اپ شوید.";return}
 const button=form.querySelector('[type="submit"]');
 button.disabled=true;status.textContent="در حال ثبت رمز…";
 try{
  const controller=new AbortController(),timeout=setTimeout(()=>controller.abort(),16000);
  let response;try{
   response=await fetch(ENDPOINT,{method:"POST",cache:"no-store",signal:controller.signal,
    headers:{"content-type":"application/json"},body:JSON.stringify({action:"setPassword",token,password})});
  }finally{clearTimeout(timeout)}
  const data=await response.json();
  if(!response.ok||!data.ok)throw Error(data.error||"server_error");
  form.reset();
  status.textContent="رمز شخصی ثبت شد. اکنون با شماره دانشجویی و این رمز روی دستگاه‌های دیگر، بدون تأیید مدرس، وارد شوید.";
 }catch{status.textContent="ثبت رمز انجام نشد. اتصال اینترنت را بررسی و دوباره تلاش کنید."}
 finally{button.disabled=false}
}
document.addEventListener("click",e=>{
 if(!e.target.closest?.("[data-student-device-settings]"))return;
 const d=ensureDialog();if(!d.open){d.showModal();d.querySelector("#obDevicePassword").focus()}
});
})();
