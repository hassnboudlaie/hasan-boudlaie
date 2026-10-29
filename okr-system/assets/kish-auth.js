/* Kish identity and approval gateway. Server-checked Supabase Auth + RLS; local OKR data is not claimed to be shared or confidential. */
(function(){
'use strict';
const API='https://hxcjkewlaniahvuqwwbb.supabase.co';
const KEY='sb_publishable_KpklYvrvXyorJVy4gQOWAw_SA8zaQy6';
const STORAGE='kish-okr-auth-session-v1';
const layer=document.getElementById('kishAuthLayer');
let session=null, identity=null, profile=null, working=false, mode='login';
const titles={super_admin:'مدیر کل سامانه',org_admin:'مدیر سازمان',assistant:'دستیار مدیر',department_manager:'مدیر واحد',employee:'کارمند',viewer:'مشاهده‌گر'};
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function message(err){const e=String(err?.message||err||'خطای ناشناخته');if(/Invalid login credentials/i.test(e))return 'ایمیل یا رمز عبور نادرست است.';if(/Email not confirmed/i.test(e))return 'ابتدا ایمیل تأیید حساب را باز کنید.';if(/rate limit/i.test(e))return 'محدودیت ارسال ایمیل فعال است؛ بعداً دوباره امتحان کنید.';return e;}
function saveSession(s){session=s;if(!s)localStorage.removeItem(STORAGE);else localStorage.setItem(STORAGE,JSON.stringify(s));}
function userToken(){return session&&session.access_token;}
function headers(auth){const h={'apikey':KEY,'Content-Type':'application/json'};if(auth&&userToken())h.Authorization='Bearer '+userToken();return h;}
async function req(path,options={},auth=false){
 const res=await fetch(API+path,{...options,headers:{...headers(auth),...(options.headers||{})},cache:'no-store'});
 let data=null;const txt=await res.text();if(txt){try{data=JSON.parse(txt);}catch{data={error:txt};}}
 if(!res.ok)throw Error(data?.msg||data?.error_description||data?.error||data?.message||'خطای ارتباط با سرور ('+res.status+')');
 return data;
}
async function refresh(){
 if(!session?.refresh_token)throw Error('نشست منقضی شده است.');
 const s=await req('/auth/v1/token?grant_type=refresh_token',{method:'POST',body:JSON.stringify({refresh_token:session.refresh_token})});
 if(!s?.access_token)throw Error('تمدید نشست ناموفق بود.');
 saveSession(s);return s;
}
async function authReady(){
 if(!session?.access_token)throw Error('وارد نشده‌اید.');
 if(session.expires_at&&Date.now()/1000>session.expires_at-75)await refresh();
 try{return await req('/auth/v1/user',{},true);}
 catch(e){if(/jwt|401|token|unauthor/i.test(message(e))){await refresh();return req('/auth/v1/user',{},true);}throw e;}
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
 '<form id="kishAuthForm" class="kish-auth-form">'+
 '<label>ایمیل<input type="email" id="kishEmail" inputmode="email" autocomplete="username" dir="ltr" required maxlength="254"></label>'+
 '<label>رمز عبور<input type="password" id="kishPassword" autocomplete="current-password" minlength="8" required></label>'+
 '<button class="kish-auth-btn primary" type="submit">ورود به سامانه</button></form>'+
 '<p class="kish-auth-notice" id="kishAuthNotice" role="status">'+esc(note)+'</p>'+
 '<div class="kish-auth-inline">'+button('ایجاد حساب جدید','kishSignUp')+button('بازیابی رمز عبور','kishForgot')+'</div>');
 document.getElementById('kishAuthForm').onsubmit=onLogin;
 document.getElementById('kishSignUp').onclick=showSignUp;
 document.getElementById('kishForgot').onclick=onForgot;
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
 const data=await req('/auth/v1/token?grant_type=password',{method:'POST',body:JSON.stringify({email:document.getElementById('kishEmail').value.trim(),password:document.getElementById('kishPassword').value})});
 if(!data?.access_token)throw Error('نشست کاربری دریافت نشد.');
 saveSession(data);document.getElementById('kishPassword').value='';await checkAccess();
 }catch(err){loginNotice(message(err));}
 finally{working=false;if(button.isConnected)button.disabled=false;}
}
async function onSignup(e){
 e.preventDefault();if(working)return;
 working=true;const button=e.target.querySelector('[type=submit]');button.disabled=true;loginNotice('در حال ثبت‌نام…');
 try{
 const email=document.getElementById('kishEmail').value.trim(),name=document.getElementById('kishName').value.trim(),password=document.getElementById('kishPassword').value;
 const data=await req('/auth/v1/signup',{method:'POST',body:JSON.stringify({email,password,data:{full_name:name}})});
 document.getElementById('kishPassword').value='';
 if(data?.access_token){saveSession(data);await checkAccess();}
 else showLogin('درخواست ثبت شد. ایمیل تأیید را بررسی کنید؛ پس از تأیید، در همین صفحه وارد شوید. سپس منتظر تأیید مدیر سامانه بمانید.');
 }catch(err){loginNotice(message(err));}
 finally{working=false;if(button.isConnected)button.disabled=false;}
}
async function onForgot(){
 const email=window.prompt('ایمیل حساب خود را برای بازیابی رمز عبور وارد کنید:');if(!email)return;
 try{await req('/auth/v1/recover',{method:'POST',body:JSON.stringify({email:email.trim()})});loginNotice('اگر حساب وجود داشته باشد، ایمیل بازیابی ارسال می‌شود. پس از تغییر رمز، به همین اپ برگردید.');}
 catch(e){loginNotice(message(e));}
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
 paint('حساب کاربری من',detail,'<div class="kish-auth-note">حساب شما تأیید شده است. داده‌های ویرایشی نسخه جاری OKR هنوز روی همین مرورگر ذخیره می‌شوند و بین دستگاه‌ها همگام نیستند.</div><div class="kish-auth-inline">'+button('بازگشت به سامانه','kishBack','primary')+button('خروج از حساب','kishLogout')+'</div>');
 document.getElementById('kishBack').onclick=unlock;document.getElementById('kishLogout').onclick=signOut;
}
async function showAdmin(){
 if(profile?.role!=='super_admin')return;
 paint('مدیریت کاربران و تأیید دسترسی','ثبت‌نام‌های جدید را تأیید کنید و نقش مناسب را تعیین کنید.',
 '<div class="kish-auth-inline">'+button('بازگشت به سامانه','kishBack','primary')+button('تازه‌سازی فهرست','kishRefresh')+'</div><p role="status" id="kishAuthNotice" class="kish-auth-notice"></p><div id="kishMembersList">در حال بارگذاری…</div>');
 document.getElementById('kishBack').onclick=unlock;
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
 try{const raw=localStorage.getItem(STORAGE);if(raw)session=JSON.parse(raw);}catch{saveSession(null);}
 if(!session?.access_token){showLogin();return;}
 try{await checkAccess();}
 catch(err){
  if(/jwt|token|unauthor|invalid refresh|session expired|منقض/i.test(message(err))){saveSession(null);showLogin('لطفاً دوباره وارد شوید.');}
  else {
   paint('بررسی دسترسی ممکن نشد','ارتباط با سرویس احراز هویت برقرار نشد. برای حفاظت از حساب، دسترسی بدون تأیید باز نمی‌شود.',
    '<p class="kish-auth-notice" id="kishAuthNotice">'+esc(message(err))+'</p><div class="kish-auth-inline">'+button('تلاش دوباره','kishReconnect','primary')+button('ورود مجدد','kishNewLogin')+'</div>');
   document.getElementById('kishReconnect').onclick=initialize;document.getElementById('kishNewLogin').onclick=()=>{saveSession(null);showLogin();};
  }
 }
}
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
