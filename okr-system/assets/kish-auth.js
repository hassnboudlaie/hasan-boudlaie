/* Kish identity and approval gateway. Server-checked Supabase Auth + RLS; local OKR data is not claimed to be shared or confidential. */
(function(){
'use strict';
const API='https://hxcjkewlaniahvuqwwbb.supabase.co';
const KEY='sb_publishable_KpklYvrvXyorJVy4gQOWAw_SA8zaQy6';
const STORAGE='kish-okr-auth-session-v1';
const LAST_EMAIL='kish-okr-last-email-v1';
const CREDENTIAL_PREF='kish-okr-credential-pref-v1';
let saveCredentials=localStorage.getItem(CREDENTIAL_PREF)!=='0';
let refreshInFlight=null;
function setSaveCredentials(enabled){
 saveCredentials=Boolean(enabled);
 localStorage.setItem(CREDENTIAL_PREF,saveCredentials?'1':'0');
 if(!saveCredentials){localStorage.removeItem(STORAGE);localStorage.removeItem(LAST_EMAIL);}
 else if(session?.access_token&&session?.refresh_token)localStorage.setItem(STORAGE,JSON.stringify(session));
}
function lastEmail(){return localStorage.getItem(LAST_EMAIL)||'';}
function rememberEmail(email){if(saveCredentials)localStorage.setItem(LAST_EMAIL,email);else localStorage.removeItem(LAST_EMAIL);}
function clearOldSessions(){
 localStorage.removeItem(STORAGE);
 sessionStorage.removeItem(STORAGE);
 localStorage.removeItem('kish-okr-remember-device-v1');
}
function restoreSavedSession(){
 if(!saveCredentials)return null;
 try{
  const raw=localStorage.getItem(STORAGE);
  if(!raw)return null;
  const parsed=JSON.parse(raw);
  if(!parsed||typeof parsed.access_token!=='string'||typeof parsed.refresh_token!=='string'||!parsed.access_token||!parsed.refresh_token)throw Error('Invalid session');
  return parsed;
 }catch{
  clearOldSessions();
  return null;
 }
}
function offerSavePassword(email,password){
 if(!saveCredentials||typeof PasswordCredential==='undefined'||!navigator.credentials?.store)return;
 // The browser/OS decides whether to offer saving. Never persist the password in app storage.
 try{
  const credential=new PasswordCredential({id:email,password,name:'OKR کیش'});
  Promise.resolve(navigator.credentials.store(credential)).catch(()=>{});
 }catch{}
}
const layer=document.getElementById('kishAuthLayer');
let session=null, identity=null, profile=null, working=false, mode='login';
const titles={super_admin:'مدیر کل سامانه',org_admin:'مدیر سازمان',assistant:'دستیار مدیر',department_manager:'مدیر واحد',employee:'کارمند',viewer:'مشاهده‌گر'};
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function message(err){const e=String(err?.message||err||'خطای ناشناخته');if(/Invalid login credentials/i.test(e))return 'ایمیل یا رمز عبور نادرست است.';if(/Email not confirmed/i.test(e))return 'ابتدا ایمیل تأیید حساب را باز کنید.';if(/rate limit/i.test(e))return 'محدودیت ارسال ایمیل فعال است؛ بعداً دوباره امتحان کنید.';return e;}
function saveSession(s){
 if(!s){session=null;clearOldSessions();return;}
 const expiry=Number(s.expires_at)||Math.floor(Date.now()/1000)+Math.max(60,Number(s.expires_in)||3600);
 session={access_token:s.access_token,refresh_token:s.refresh_token,expires_at:expiry,token_type:s.token_type||'bearer'};
 if(saveCredentials)localStorage.setItem(STORAGE,JSON.stringify(session));
 else clearOldSessions();
}
function userToken(){return session&&session.access_token;}
function headers(auth){const h={'apikey':KEY,'Content-Type':'application/json'};if(auth&&userToken())h.Authorization='Bearer '+userToken();return h;}
async function req(path,options={},auth=false){
 const res=await fetch(API+path,{...options,headers:{...headers(auth),...(options.headers||{})},cache:'no-store'});
 let data=null;const txt=await res.text();if(txt){try{data=JSON.parse(txt);}catch{data={error:txt};}}
 if(!res.ok)throw Error(data?.msg||data?.error_description||data?.error||data?.message||'خطای ارتباط با سرور ('+res.status+')');
 return data;
}
async function refresh(){
 if(refreshInFlight)return refreshInFlight;
 if(!session?.refresh_token)throw Error('نشست منقضی شده است.');
 // Supabase refresh tokens are single use. Never issue two simultaneous refresh requests.
 refreshInFlight=(async()=>{
  const s=await req('/auth/v1/token?grant_type=refresh_token',{
   method:'POST',body:JSON.stringify({refresh_token:session.refresh_token})
  });
  if(!s?.access_token||!s?.refresh_token)throw Error('تمدید نشست ناموفق بود.');
  saveSession(s);
  return s;
 })();
 try{return await refreshInFlight;}finally{refreshInFlight=null;}
}
function isSessionExpired(){
 return !Number.isFinite(Number(session?.expires_at)) ||
   !Number(session?.expires_at) ||
   (Date.now()/1000)>=Number(session.expires_at)-90;
}
async function authReady(){
 if(!session?.access_token)throw Error('وارد نشده‌اید.');
 if(isSessionExpired())await refresh();
 try{return await req('/auth/v1/user',{},true);}
 catch(e){
  if(/jwt|401|token|unauthor|expired|invalid claim/i.test(message(e))){
   await refresh();
   return req('/auth/v1/user',{},true);
  }
  throw e;
 }
}
async function listOwn(){
 const uid=encodeURIComponent(identity.id);
 const rows=await req('/rest/v1/kish_members?user_id=eq.'+uid+'&select=user_id,email,full_name,role,status,department',{},true);
 return Array.isArray(rows)?rows[0]||null:null;
}
function paint(head,detail,html){
 document.documentElement.classList.add('kish-auth-pending');
 layer.hidden=false;layer.innerHTML='<div class="kish-auth-panel"><div class="kish-auth-brand"><img src="assets/kishports_main.svg" alt="لوگوی بنادر و فرودگاه‌های کیش"><div><strong>سامانه راهبری اهداف و عملکرد</strong><small>KISH PORTS & AIRPORTS · SECURE ACCESS</small></div></div><h1>'+esc(head)+'</h1><p class="kish-auth-detail">'+esc(detail)+'</p>'+html+'<p class="kish-auth-foot">ورود با حساب شخصی · تأیید دسترسی توسط مدیر سامانه</p></div>';
}
function button(text,id,extra){return '<button type="button" class="kish-auth-btn '+(extra||'')+'" id="'+id+'">'+esc(text)+'</button>';}
function loginNotice(t){const el=document.getElementById('kishAuthNotice');if(el)el.textContent=t;}
function showLogin(note=''){
 mode='login';
 paint('ورود به سامانه کیش','ورود با ایمیل و رمز عبور شخصی. برای نخستین ورود ابتدا ثبت‌نام کنید.',
 '<form id="kishAuthForm" name="kish-login" class="kish-auth-form">'+
 '<label>ایمیل<input type="email" name="username" id="kishEmail" list="kishSavedEmails" inputmode="email" autocomplete="username" dir="ltr" required maxlength="254"></label>'+
 '<datalist id="kishSavedEmails"><option value="'+esc(lastEmail())+'"></datalist>'+
 '<label>رمز عبور<input type="password" name="password" id="kishPassword" autocomplete="current-password" minlength="8" required></label>'+
 '<label class="kish-remember-label"><input type="checkbox" id="kishSaveCredentials" '+(saveCredentials?'checked':'')+'> ذخیره حساب برای ورود با تأیید من در دفعات بعد</label>'+
 '<button class="kish-auth-btn primary" type="submit">ورود به سامانه</button></form>'+
 '<p class="kish-auth-detail kish-autofill-hint">دفعه اول ایمیل و رمز را وارد کنید؛ دفعات بعد فقط روی «ورود به حساب ذخیره‌شده» بزنید. رمز در خود برنامه ذخیره نمی‌شود.</p>'+
 '<p class="kish-auth-notice" id="kishAuthNotice" role="status">'+esc(note)+'</p>'+
 '<div class="kish-auth-inline">'+button('ایجاد حساب جدید','kishSignUp')+button('بازیابی رمز عبور','kishForgot')+'</div>');
 document.getElementById('kishAuthForm').onsubmit=onLogin;
 document.getElementById('kishEmail').value=lastEmail();
 document.getElementById('kishSaveCredentials').onchange=e=>setSaveCredentials(e.target.checked);
 document.getElementById('kishSignUp').onclick=showSignUp;
 document.getElementById('kishForgot').onclick=onForgot;
}
function showRememberedLogin(note=''){
 const email=lastEmail()||'حساب ذخیره‌شده';
 mode='remembered';
 paint('ورود به سامانه کیش','برای ادامه، ورود به حساب خودتان را تأیید کنید.',
  '<div class="kish-auth-note kish-account-choice"><strong dir="ltr">'+esc(email)+'</strong><span>حساب ثبت‌شده در این دستگاه</span></div>'+
  '<div class="kish-auth-inline">'+button('ورود به حساب ذخیره‌شده','kishConfirmSaved','primary')+
  button('ورود با حساب دیگر','kishDifferentAccount')+'</div>'+
  '<p class="kish-auth-notice" role="status" id="kishAuthNotice">'+esc(note)+'</p>'+
  '<p class="kish-auth-detail kish-autofill-hint">بدون تایپ مجدد رمز؛ با تأیید شما، اعتبار حساب از سرور بررسی می‌شود.</p>');
 document.getElementById('kishConfirmSaved').onclick=confirmRememberedLogin;
 document.getElementById('kishDifferentAccount').onclick=async()=>{
  // Revoke only Kish's current device session, not other products.
  const token=userToken();saveSession(null);identity=null;profile=null;
  if(token){try{await fetch(API+'/auth/v1/logout?scope=local',{method:'POST',headers:{apikey:KEY,Authorization:'Bearer '+token}});}catch{}}
  showLogin();
 };
}
async function confirmRememberedLogin(){
 if(working)return;
 working=true;
 const button=document.getElementById('kishConfirmSaved');
 if(button)button.disabled=true;
 loginNotice('در حال تأیید حساب…');
 try{
  session=session||restoreSavedSession();
  if(!session)throw Error('حساب ذخیره‌شده پیدا نشد.');
  await checkAccess();
 }catch(e){
  const txt=message(e);
  const expired=/refresh token|invalid_grant|session.*expired|invalid token|jwt expired|حساب ذخیره‌شده پیدا نشد|not found/i.test(txt);
  if(expired){
   saveSession(null);
   showLogin('نشست ذخیره‌شده معتبر نیست. لطفاً یک‌بار دیگر با رمز عبور وارد شوید.');
  }else showRememberedLogin('ارتباط با سرور برقرار نشد: '+txt);
 }finally{
  working=false;
  if(button?.isConnected)button.disabled=false;
 }
}
function showSignUp(){
 mode='signup';
 paint('ایجاد حساب کاربری','بعد از ثبت‌نام و تأیید ایمیل، مدیر سامانه باید دسترسی شما را تأیید کند.',
 '<form id="kishAuthForm" class="kish-auth-form">'+
 '<label>نام و نام خانوادگی<input type="text" id="kishName" autocomplete="name" required maxlength="120"></label>'+
 '<label>ایمیل<input type="email" id="kishEmail" inputmode="email" autocomplete="username" dir="ltr" required maxlength="254"></label>'+
 '<label>رمز عبور (حداقل ۸ نویسه)<input type="password" id="kishPassword" autocomplete="new-password" minlength="8" required></label>'+
 '<button type="submit" class="kish-auth-btn primary">ثبت‌نام</button></form>'+
 '<p class="kish-auth-notice" role="status" id="kishAuthNotice"></p>'+
 '<div class="kish-auth-inline">'+button('قبلاً حساب ساخته‌ام؛ ورود','kishSwitchLogin')+'</div>');
 document.getElementById('kishAuthForm').onsubmit=onSignup;
 document.getElementById('kishSwitchLogin').onclick=()=>showLogin();
}
async function onLogin(e){
 e.preventDefault();if(working)return;
 working=true;const button=e.target.querySelector('[type=submit]');button.disabled=true;loginNotice('در حال بررسی حساب…');
 try{
 const email=document.getElementById('kishEmail').value.trim();
 const data=await req('/auth/v1/token?grant_type=password',{method:'POST',body:JSON.stringify({email,password:document.getElementById('kishPassword').value})});
 if(!data?.access_token||!data?.refresh_token)throw Error('نشست کاربری دریافت نشد.');
 setSaveCredentials(document.getElementById('kishSaveCredentials').checked);
 rememberEmail(email);
 // Offer the credentials to the device's password manager only after a valid server response.
 offerSavePassword(email,document.getElementById('kishPassword').value);
 saveSession(data);
 await checkAccess();
 // Password field is cleared only after approval check; it is never stored in localStorage.
 const passwordField=document.getElementById('kishPassword');
 if(passwordField)passwordField.value='';
 }catch(err){loginNotice(message(err));}
 finally{working=false;if(button.isConnected)button.disabled=false;}
}
async function onSignup(e){
 e.preventDefault();if(working)return;
 working=true;const button=e.target.querySelector('[type=submit]');button.disabled=true;loginNotice('در حال ثبت‌نام…');
 try{
 const email=document.getElementById('kishEmail').value.trim(),name=document.getElementById('kishName').value.trim(),password=document.getElementById('kishPassword').value;
 const data=await req('/auth/v1/signup?redirect_to='+encodeURIComponent(APP_CALLBACK),{method:'POST',body:JSON.stringify({email,password,data:{full_name:name,app_source:'kish-okr'}})});
 document.getElementById('kishPassword').value='';
 if(data?.access_token){saveSession(data);await checkAccess();}
 else showLogin('درخواست ثبت شد. ایمیل تأیید را بررسی کنید؛ پس از تأیید، در همین صفحه وارد شوید. سپس منتظر تأیید مدیر سامانه بمانید.');
 }catch(err){loginNotice(message(err));}
 finally{working=false;if(button.isConnected)button.disabled=false;}
}
const APP_CALLBACK=location.origin+location.pathname;
/* Supabase implicit recovery callback, never put tokens in requests or logs to GitHub Pages. */
async function handleEmailCallback(){
 const callbackHash=window.__kishAuthReturnFragment||location.hash;
 delete window.__kishAuthReturnFragment;
 const p=new URLSearchParams(callbackHash.startsWith('#')?callbackHash.slice(1):'');
 if(p.get('error_code')){
  const note=p.get('error_description')||'لینک تأیید منقضی یا نامعتبر شده است؛ دوباره درخواست بدهید.';
  history.replaceState(null,'',location.pathname+location.search+'#start');
  showLogin(note);
  return true;
 }
 const access=p.get('access_token'),refreshToken=p.get('refresh_token');
 if(!access||!refreshToken)return false;
 const type=p.get('type');
 const expires=Number(p.get('expires_in'))||3600;
 saveSession({access_token:access,refresh_token:refreshToken,token_type:'bearer',expires_at:Math.floor(Date.now()/1000)+Math.max(60,expires)});
 history.replaceState(null,'',location.pathname+location.search+'#start');
 if(type==='recovery'){
  try{identity=await authReady();showPasswordReset();}
  catch(e){saveSession(null);showLogin('اعتبار لینک بازیابی قابل تأیید نبود. دوباره درخواست بدهید.');}
  return true;
 }
 // Email-confirmation URLs should lead to login, not bypass it.
 saveSession(null);
 showLogin('ایمیل شما تأیید شد. اکنون برای ورود، مشخصات حساب را انتخاب کرده و «ورود» را بزنید.');
 return true;
}
function showPasswordReset(){
 paint('تعیین رمز عبور جدید','ایمیل حساب شما تأیید شد. برای ورود بعدی رمز عبور تازه انتخاب کنید.',
 '<form id="kishResetForm" class="kish-auth-form">'+
 '<label>رمز عبور جدید (حداقل ۸ نویسه)<input type="password" id="kishNewPassword" autocomplete="new-password" minlength="8" required></label>'+
 '<label>تکرار رمز عبور جدید<input type="password" id="kishConfirmNewPassword" autocomplete="new-password" minlength="8" required></label>'+
 '<button type="submit" class="kish-auth-btn primary">ذخیره رمز جدید</button></form>'+
 '<p id="kishAuthNotice" class="kish-auth-notice" role="status"></p>');
 document.getElementById('kishResetForm').onsubmit=async e=>{
  e.preventDefault();if(working)return;
  const pass=document.getElementById('kishNewPassword').value,again=document.getElementById('kishConfirmNewPassword').value;
  if(pass!==again){loginNotice('تکرار رمز عبور یکسان نیست.');return;}
  working=true;const button=e.target.querySelector('[type=submit]');button.disabled=true;
  try{
   await req('/auth/v1/user',{method:'PUT',body:JSON.stringify({password:pass})},true);
   saveSession(null);identity=null;profile=null;
   showLogin('✅ رمز جدید ثبت شد. اکنون با ایمیل و رمز جدید وارد شوید.');
  }catch(e){loginNotice(message(e));button.disabled=false;}
  finally{working=false;}
 };
}
async function onForgot(){
 const email=window.prompt('ایمیل حساب خود را برای بازیابی رمز عبور وارد کنید:');if(!email)return;
 try{
  const target='/auth/v1/recover?redirect_to='+encodeURIComponent(APP_CALLBACK);
  await req(target,{method:'POST',body:JSON.stringify({email:email.trim()})});
  loginNotice('اگر حساب وجود داشته باشد، ایمیل بازیابی ارسال می‌شود. لینک ایمیل باید به آدرس اپ کیش برگردد؛ اگر به صفحه ۴۰۴ رفت، تنظیم Redirect URLs سرور نیاز به اصلاح دارد.');
 }catch(e){loginNotice(message(e));}
}
function showPending(){
 paint(profile?.status==='suspended'?'دسترسی شما غیرفعال شده است':'در انتظار تأیید مدیر',
 'حساب '+(identity?.email||'')+' ثبت شده است، اما هنوز مجوز ورود به فضای کاری صادر نشده است.',
 '<div class="kish-auth-note">'+(profile?.status==='suspended'?'برای فعال‌سازی با مدیر سامانه هماهنگ کنید.':'پس از تأیید حساب توسط مدیر، دکمه «بررسی مجدد» را بزنید.')+'</div>'+
 '<div class="kish-auth-inline">'+button('بررسی مجدد','kishRetry','primary')+button('خروج از حساب','kishLogoutPending')+'</div><p role="status" id="kishAuthNotice" class="kish-auth-notice"></p>');
 document.getElementById('kishRetry').onclick=async()=>{loginNotice('در حال بررسی…');try{await checkAccess();}catch(e){loginNotice(message(e));}};
 document.getElementById('kishLogoutPending').onclick=signOut;
}
function unlock(){
 document.documentElement.classList.remove('kish-auth-pending');
 layer.hidden=true;layer.textContent='';
 document.documentElement.dataset.kishRole=profile.role;
 const top=document.querySelector('.top-actions');
 if(top&&!document.getElementById('kishAccountButton')){
  const btn=document.createElement('button');btn.type='button';btn.id='kishAccountButton';btn.className='btn';btn.textContent='🔐 حساب من';
  btn.onclick=()=>showAccount();top.prepend(btn);
 }
 if(top&&profile.role==='super_admin'&&!document.getElementById('kishMembersButton')){
  const btn=document.createElement('button');btn.type='button';btn.id='kishMembersButton';btn.className='btn';btn.textContent='👥 مدیریت کاربران';
  btn.onclick=()=>showAdmin();top.prepend(btn);
 }
}
function showAccount(){
 const detail=(identity?.email||'')+' · '+(titles[profile.role]||profile.role);
 paint('حساب کاربری من',detail,'<div class="kish-auth-note">حساب شما تأیید شده است. داده‌های ویرایشی نسخه جاری OKR هنوز روی همین مرورگر ذخیره می‌شوند و بین دستگاه‌ها همگام نیستند.</div><div class="kish-auth-note">هر بار که اپ را باز کنید، با زدن دکمه «ورود به حساب ذخیره‌شده» ورودتان را تأیید می‌کنید. رمز عبور در حافظه اپ نگهداری نمی‌شود.</div><label class="kish-remember-label kish-account-remember"><input type="checkbox" id="kishCredentialPreference" '+(saveCredentials?'checked':'')+'> ذخیره حساب برای ورود یک‌کلیکی</label><div class="kish-auth-inline">'+button('بازگشت به سامانه','kishBack','primary')+button('خروج از حساب','kishLogout')+'</div>');
 document.getElementById('kishCredentialPreference').onchange=e=>setSaveCredentials(e.target.checked);
 document.getElementById('kishBack').onclick=unlock;document.getElementById('kishLogout').onclick=signOut;
}
async function showAdmin(){
 if(profile?.role!=='super_admin')return;
 paint('مدیریت کاربران و تأیید دسترسی','ثبت‌نام‌های جدید را تأیید کنید و نقش مناسب را تعیین کنید.',
 '<div class="kish-auth-inline">'+button('بازگشت به سامانه','kishBack','primary')+button('تنظیمات حساب من','kishAdminAccount')+button('تازه‌سازی فهرست','kishRefresh')+'</div><p role="status" id="kishAuthNotice" class="kish-auth-notice"></p><div id="kishMembersList">در حال بارگذاری…</div>');
 document.getElementById('kishBack').onclick=unlock;
 document.getElementById('kishAdminAccount').onclick=showAccount;
 document.getElementById('kishRefresh').onclick=loadAdminList;
 await loadAdminList();
}
async function loadAdminList(){
 const panel=document.getElementById('kishMembersList');if(!panel)return;
 panel.textContent='در حال بارگذاری…';
 try{
 await authReady();
 const people=await req('/rest/v1/kish_members?select=user_id,email,full_name,role,status,department,created_at&order=created_at.desc',{},true);
 if(!panel.isConnected)return;panel.textContent='';
 const approved=people.filter(x=>x.status==='approved').length;
 const summary=document.createElement('p');summary.className='kish-auth-detail';summary.textContent=people.length+' حساب · '+approved+' فعال · '+(people.length-approved)+' در انتظار/غیرفعال';panel.append(summary);
 for(const p of people){
 const card=document.createElement('div');card.className='kish-member-row';
 const title=document.createElement('strong');title.textContent=(p.full_name||'نام ثبت نشده')+' — '+p.email;card.append(title);
 const own=p.user_id===identity.id;
 const fields=document.createElement('div');fields.className='kish-member-controls';
 const status=document.createElement('select');status.setAttribute('aria-label','وضعیت دسترسی');
 for(const [v,t] of [['pending','در انتظار'],['approved','فعال'],['suspended','مسدود']]){const o=new Option(t,v);status.add(o);}status.value=p.status;
 const role=document.createElement('select');role.setAttribute('aria-label','نقش کاربر');
 for(const [v,t] of Object.entries(titles)){const o=new Option(t,v);role.add(o);}role.value=p.role;
 const dep=document.createElement('input');dep.placeholder='واحد سازمانی (اختیاری)';dep.value=p.department||'';dep.maxLength=120;
 const save=document.createElement('button');save.type='button';save.className='kish-auth-btn primary';save.textContent='ذخیره دسترسی';
 fields.append(status,role,dep,save);card.append(fields);panel.append(card);
 if(own){status.disabled=true;role.disabled=true;dep.disabled=true;save.disabled=true;save.textContent='حساب مالک سامانه';continue;}
 save.onclick=async()=>{
  if(role.value==='super_admin'&&!window.confirm('آیا از اعطای دسترسی مدیر کل به این شخص مطمئن هستید؟'))return;
  save.disabled=true;save.textContent='در حال ذخیره…';
  try{
   const path='/rest/v1/kish_members?user_id=eq.'+encodeURIComponent(p.user_id)+'&select=user_id,status,role';
   const updated=await req(path,{method:'PATCH',headers:{Prefer:'return=representation'},body:JSON.stringify({status:status.value,role:role.value,department:dep.value.trim()})},true);
   if(!Array.isArray(updated)||updated.length!==1)throw Error('تغییر ثبت نشد.');
   save.textContent='ذخیره شد ✓';setTimeout(()=>{if(save.isConnected){save.disabled=false;save.textContent='ذخیره دسترسی';}},1400);
  }catch(err){save.disabled=false;save.textContent='ذخیره دسترسی';const notice=document.getElementById('kishAuthNotice');if(notice)notice.textContent=message(err);}
 };
 }
 }catch(err){if(panel.isConnected)panel.textContent='خواندن کاربران ناموفق بود: '+message(err);}
}
async function checkAccess(){
 identity=await authReady();
 if(!identity?.id)throw Error('هویت کاربر قابل تأیید نیست.');
 profile=await listOwn();
 if(!profile){showPending();return;}
 if(profile.status==='approved')unlock();else showPending();
}
async function signOut(){
 const token=userToken();
 saveSession(null);identity=null;profile=null;
 if(token){try{await fetch(API+'/auth/v1/logout?scope=local',{method:'POST',headers:{apikey:KEY,Authorization:'Bearer '+token}});}catch{}}
 location.reload();
}
async function initialize(){
 if(location.hostname==='127.0.0.1' && window.__kishAuthTestBypass===true){
  identity={id:'00000000-0000-4000-8000-000000000001',email:'qa@localhost.invalid'};
  profile={role:'super_admin',status:'approved'};
  unlock();
  return;
 }
 paint('بررسی وضعیت ورود','در حال اتصال امن به سرویس احراز هویت…','<p class="kish-auth-notice">لطفاً اتصال اینترنت را بررسی کنید.</p>');
 session=restoreSavedSession();
 // Email-confirmation and password-recovery callbacks retain their separate secure flow.
 if(await handleEmailCallback())return;
 if(session)showRememberedLogin();
 else showLogin();
}
// A PWA resumed from the launcher can reuse an already-running webview.
// Require a fresh, explicit user confirmation after leaving the app too.
let wasBackgrounded=false;
function lockForNextEntry(){
 if(!profile||profile.status!=='approved')return;
 identity=null;profile=null;
 delete document.documentElement.dataset.kishRole;
 // Never open the workspace automatically when the PWA returns to foreground.
 if(saveCredentials&&restoreSavedSession())showRememberedLogin();
 else {session=null;showLogin();}
}
document.addEventListener('visibilitychange',()=>{
 if(document.hidden){if(profile?.status==='approved')wasBackgrounded=true;return;}
 if(wasBackgrounded){wasBackgrounded=false;lockForNextEntry();}
});
window.addEventListener('pagehide',()=>{if(profile?.status==='approved')wasBackgrounded=true;});
window.addEventListener('pageshow',e=>{
 if(e.persisted&&wasBackgrounded){wasBackgrounded=false;lockForNextEntry();}
});

setInterval(async()=>{
 if(!session?.access_token||!profile||document.hidden)return;
 try{
  identity=await authReady();const latest=await listOwn();
  if(!latest||latest.status!=='approved'){profile=latest;showPending();}
  else profile=latest;
 }catch{ /* Fail closed on next reload; do not overwrite local user data on transient network failure. */ }
},60000);
initialize();
})();
