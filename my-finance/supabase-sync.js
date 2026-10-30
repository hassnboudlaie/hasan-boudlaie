/* My Finance · authenticated cloud sync v3. No service credentials belong in a public PWA. */
import {createClient} from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.76.1/+esm';
/* Keep a verified session through refresh/relaunch on trusted devices.
   Supabase persists refresh tokens, never passwords. Opt-out uses sessionStorage only.
   The adapter also migrates a legitimate existing tab session when the user opts in. */
const AUTH_SESSION_KEY='myfinance-supabase-session-v1';
const KEEP_SIGNED_IN_KEY='myfinance-keep-signed-in-v1';
const keepSignedIn=()=>localStorage.getItem(KEEP_SIGNED_IN_KEY)!=='no';
const financeAuthStorage={
 getItem(key){
  if(!keepSignedIn())return sessionStorage.getItem(key);
  const persisted=localStorage.getItem(key);
  if(persisted!==null)return persisted;
  const temporary=sessionStorage.getItem(key);
  if(temporary!==null){
   localStorage.setItem(key,temporary);
   sessionStorage.removeItem(key);
  }
  return temporary;
 },
 setItem(key,value){
  if(keepSignedIn()){
   localStorage.setItem(key,value);
   sessionStorage.removeItem(key);
  }else{
   sessionStorage.setItem(key,value);
   localStorage.removeItem(key);
  }
 },
 removeItem(key){
  sessionStorage.removeItem(key);
  localStorage.removeItem(key);
 }
};
const client=createClient('https://hxcjkewlaniahvuqwwbb.supabase.co','sb_publishable_KpklYvrvXyorJVy4gQOWAw_SA8zaQy6',{auth:{persistSession:true,storage:financeAuthStorage,storageKey:AUTH_SESSION_KEY,autoRefreshToken:true,detectSessionInUrl:true}});
const bridge=window.MyFinanceBridge;
const byId=id=>document.getElementById(id);
const login=byId('supabase-login'),actions=byId('supabase-actions'),email=byId('supabase-email');
let user=null,busy=false,queued=false,authPending=false,seen=new Map(),identityEpoch=0,bootstrapped=false;
const assertIdentity=(uid,epoch)=>{if(!user||user.id!==uid||identityEpoch!==epoch)throw Error('SYNC_SESSION_CHANGED');};
const collections={account:'accounts',receivable:'receivables',transfer:'transfers',commitment:'commitments',loan:'loans'};
let dirty=new Set();
const uuid=/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const dirtyKey=()=>user?'my-finance-dirty-'+user.id:'';

/**
 * Upgrade legacy local identifiers without deleting transactions or touching bank balances.
 * UUIDs are stable per authenticated user + original key so re-imports cannot create new IDs.
 * The original browser snapshot is retained as a local recovery backup.
 */
async function stableLegacyUUID(kind,original){
 const input=new TextEncoder().encode('my-finance/legacy/v1/'+user.id+'/'+kind+'/'+original);
 const bytes=new Uint8Array(await crypto.subtle.digest('SHA-256',input)).slice(0,16);
 bytes[6]=(bytes[6]&15)|80;bytes[8]=(bytes[8]&63)|128;
 const h=[...bytes].map(b=>b.toString(16).padStart(2,'0')).join('');
 return h.slice(0,8)+'-'+h.slice(8,12)+'-'+h.slice(12,16)+'-'+h.slice(16,20)+'-'+h.slice(20);
}
async function repairLegacyIds(){
 if(!user)return 0;
 const ownerId=user.id,epoch=identityEpoch;
 const original=bridge.getData();
 const next=JSON.parse(JSON.stringify(original));
 const remap={account:new Map(),receivable:new Map(),transfer:new Map(),commitment:new Map(),tx:new Map()};
 let repaired=0;
 for(const [kind,collection] of Object.entries({...collections,tx:'tx'})){
  for(const item of next[collection]||[]){
   if(!item||typeof item!=='object')continue;
   const old=String(item.id??'');
   if(uuid.test(old))continue;
   const newId=old?await stableLegacyUUID(kind,old):crypto.randomUUID();
   if(old)remap[kind].set(old,newId);
   item.id=newId;
   if(old)item.legacyId=old.slice(0,150);
   repaired++;
  }
 }
 if(!repaired)return 0;
 assertIdentity(ownerId,epoch);
 const mapRef=(kind,id)=>id==null?id:remap[kind].get(String(id))||id;
 for(const t of next.tx||[]){
  t.account=mapRef('account',t.account);
  t.recurringId=mapRef('commitment',t.recurringId);
 }
 for(const t of next.transfers||[]){
  t.from=mapRef('account',t.from);
  t.to=mapRef('account',t.to);
 }
 for(const c of next.commitments||[])c.account=mapRef('account',c.account);
 assertIdentity(ownerId,epoch);
 const backupKey='my-finance-backup-before-id-repair-'+ownerId;
 if(!localStorage.getItem(backupKey))localStorage.setItem(backupKey,JSON.stringify(original));
 const updatedDirty=new Set();
 for(const key of dirty){
  const n=key.indexOf(':');
  if(n<0){updatedDirty.add(key);continue}
  const kind=key.slice(0,n),old=key.slice(n+1);
  updatedDirty.add(kind+':'+(remap[kind]?.get(old)||old));
 }
 dirty=updatedDirty;
 for(const [kind,collection] of Object.entries({...collections,tx:'tx'})){
  for(const item of next[collection]||[]){if(item?.legacyId&&remap[kind].get(item.legacyId)===item.id)updatedDirty.add(kind+':'+item.id)}
 }
 dirty=updatedDirty;
 assertIdentity(ownerId,epoch);
 bridge.replaceData(next);
 localStorage.setItem(dirtyKey(),JSON.stringify([...dirty]));
 return repaired;
}

function notice(message,online=false){
 byId('supabase-status').textContent=message;
 const indicator=byId('cloud-indicator');
 if(indicator){indicator.textContent=online?'● امن و همگام':'● '+message;indicator.classList.toggle('online',online)}
}
async function refreshPairStatus(){
 if(!user)return;
 const {data,error}=await client.from('finance_voice_pairings').select('consumed_at,expires_at').eq('user_id',user.id).maybeSingle();
 if(error)return;
 if(data?.consumed_at)byId('supabase-pair-status').textContent='✓ اتصال ChatGPT تأیید شده است. از این به بعد می‌توانید تراکنش را در همین چت اعلام کنید.';
 else if(data?.expires_at&&new Date(data.expires_at)>new Date())byId('supabase-pair-status').textContent='کد اتصال فعال است؛ اگر کد را گم کرده‌اید، یک کد جدید ایجاد کنید.';
 else byId('supabase-pair-status').textContent='برای اتصال مستقیم به ChatGPT یک کد یک‌بارمصرف بسازید.';
}
function renderAuth(){
 login.hidden=!!user;actions.hidden=!user;
 if(!user){notice('حالت محلی · ورود امن برای اتصال');byId('supabase-pair-status').textContent='پس از ورود، برای اتصال مستقیم به ChatGPT کد یک‌بارمصرف بسازید.'}
 else {notice('حساب متصل: '+user.email,true);refreshPairStatus().catch(()=>{});}
}

/* Account-gated beta. A verified session can persist on a trusted device; passwords are never saved here. */
const rememberKey='myfinance-saved-email-v1';
const confirmationHelp=byId('auth-confirm-help');
const emailProblem=e=>{const msg=String(e?.code||'')+' '+String(e?.message||'');if(/email.address.not.authorized|email_address_not_authorized/i.test(msg))return 'ارسال تأییدیه برای این ایمیل در تنظیمات فعلی سرور مجاز نیست. مدیر باید سرویس ارسال ایمیل (Custom SMTP) را فعال کند.';if(/rate.limit|over_email_send_rate_limit|too.many.requests/i.test(msg))return 'محدودیت تعداد ایمیل‌های سرور فعال شده است. بعداً دوباره تلاش کنید؛ مدیر باید سرویس ایمیل مستقل را تنظیم کند.';return 'درخواست ایمیل ناموفق بود. لطفاً آدرس و اتصال اینترنت را بررسی کنید. جزئیات: '+String(e?.message||'خطای نامشخص');};
const authEmail=byId('auth-email'),authPassword=byId('auth-password'),authRemember=byId('auth-remember');
const remembered=localStorage.getItem(rememberKey);
if(remembered)authEmail.value=remembered;
authRemember.checked=keepSignedIn();
let recovery=false;
function authStatus(text,error=false){const e=byId('auth-status');e.textContent=text;e.classList.toggle('error',error)}
function saveRemembered(){
 const stay=!!authRemember.checked;
 localStorage.setItem(KEEP_SIGNED_IN_KEY,stay?'yes':'no');
 if(stay){
  const old=sessionStorage.getItem(AUTH_SESSION_KEY);
  if(old!==null){localStorage.setItem(AUTH_SESSION_KEY,old);sessionStorage.removeItem(AUTH_SESSION_KEY)}
  localStorage.setItem(rememberKey,authEmail.value.trim().toLowerCase());
 }else{
  const old=localStorage.getItem(AUTH_SESSION_KEY);
  if(old!==null){sessionStorage.setItem(AUTH_SESSION_KEY,old);localStorage.removeItem(AUTH_SESSION_KEY)}
  localStorage.removeItem(rememberKey);
 }
}
function gate(text,identity=null,error=false){
 document.body.classList.remove('finance-unlocked');
 byId('auth-form').hidden=!!identity;byId('auth-pending').hidden=!identity;
 byId('auth-pending-email').textContent=identity?.email||'';
 authStatus(text,error);
}
function lock(text,identity=null,error=false){
 const before=!!user;identityEpoch++;user=null;dirty=new Set();seen=new Map();
 if(before)bridge.bindUser(null);
 resetAdminBell();
 resetProfile();
 renderAuth();gate(text,identity,error);
}
function validAccess(a){return a?.status==='active'&&(!a.expires_at||Date.parse(a.expires_at)>Date.now())}
function pendingText(a){
 if(a.status==='suspended')return 'دسترسی این حساب توسط مدیر تعلیق شده است. داده‌ها حذف نشده‌اند.';
 if(a.status==='active')return 'اعتبار دسترسی آزمایشی به پایان رسیده است. مدیر می‌تواند آن را تمدید کند.';
 return 'در حال بررسی فعال‌سازی حساب شما؛ اگر مشکل ادامه داشت، دوباره تلاش کنید.';
}
async function getAccess(identity){
 let{data,error}=await client.from('finance_access').select('status,expires_at').eq('user_id',identity.id).maybeSingle();
 if(error)throw error;if(data)return data;
 const created=await client.from('finance_access').insert({user_id:identity.id,email:identity.email,status:'active'}).select('status,expires_at').single();
 if(created.error){
  const retry=await client.from('finance_access').select('status,expires_at').eq('user_id',identity.id).maybeSingle();
  if(retry.error||!retry.data)throw created.error;
  return retry.data;
 }
 return created.data;
}
let adminEventsLoaded=false,adminLastEventId=0;
function resetAdminBell(){
 document.getElementById('finance-admin-bell')?.remove();
 adminEventsLoaded=false;adminLastEventId=0;
}
async function showLatestAdminAlert(e){
 if(!('Notification' in window)||Notification.permission!=='granted')return;
 try{
  const names={registered:'ثبت‌نام جدید',activated:'فعال‌سازی مجدد',suspended:'تعلیق دسترسی',pending:'در انتظار'};
  const title='My Finance · '+(names[e.event_type]||'رویداد جدید');
  const opts={body:e.subject_email,icon:'./icon-192-r4.png',tag:'my-finance-event-'+e.id};
  if('serviceWorker' in navigator){
   const reg=await navigator.serviceWorker.getRegistration('./')||await navigator.serviceWorker.register('./sw.js');
   await reg.showNotification(title,opts);
  }else new Notification(title,opts);
 }catch(_ignored){}
}
async function refreshAdminEvents(){
 const bell=document.getElementById('finance-admin-bell');
 if(!user||!bell)return;
 const {data,error}=await client.from('finance_admin_events').select('id,event_type,subject_email,read_at').order('id',{ascending:false}).limit(50);
 if(error)return;
 const arr=data||[],newest=arr[0]?.id||0;
 if(adminEventsLoaded&&newest>adminLastEventId){
  for(const e of arr.filter(x=>x.id>adminLastEventId).reverse().slice(-3))await showLatestAdminAlert(e);
 }
 adminEventsLoaded=true;adminLastEventId=Math.max(adminLastEventId,newest);
 const unread=arr.filter(x=>!x.read_at).length;
 bell.textContent=unread?'🔔 '+new Intl.NumberFormat('fa-IR').format(unread):'🔔';
 bell.setAttribute('aria-label',unread?unread+' اعلان خوانده‌نشده · مدیریت My Finance':'مدیریت و اعلان‌های My Finance');
 bell.title='رویدادهای مدیریتی My Finance';
}
async function showAdmin(){
 const link=byId('finance-admin-link');if(!link||!user)return;
 const{data,error}=await client.from('finance_admins').select('user_id').eq('user_id',user.id).maybeSingle();
 const allowed=!error&&!!data;
 link.hidden=!allowed;
 if(!allowed){resetAdminBell();return;}
 if(!document.getElementById('finance-admin-bell')){
  const bell=document.createElement('a');
  bell.id='finance-admin-bell';bell.href='./admin.html';bell.textContent='🔔';
  bell.className='finance-admin-header-bell';
  bell.setAttribute('aria-label','اعلان‌های مدیریت My Finance');
  // Keep admin-only notifications next to the existing header tools, never
  // floating over account balances or behind the mobile navigation dock.
  const headerTools=document.querySelector('.finance-app-header .row');
  (headerTools||document.querySelector('.finance-app-header')||document.body).append(bell);
 }
 await refreshAdminEvents();
}
setInterval(()=>{if(user&&!document.hidden)refreshAdminEvents().catch(()=>{})},30000);
document.addEventListener('visibilitychange',()=>{if(!document.hidden&&user)refreshAdminEvents().catch(()=>{})});
/* Mobile-safe login/registration is a single in-app view: no page navigation or external tab. */
const signupDetails=byId('auth-registration-details');
const authPasswordConfirm=byId('auth-password-confirm');
const authPasswordInput=byId('auth-password');
const authSubmitButton=byId('auth-login');
const authSwitchButton=byId('auth-register');
let authMode='login',authActionInFlight=false;
function setAuthMode(nextMode){
 authMode=nextMode==='signup'?'signup':'login';
 const signup=authMode==='signup';
 signupDetails.hidden=!signup;
 authPasswordConfirm.disabled=!signup;
 authPasswordConfirm.required=signup;
 authPasswordConfirm.value='';
 authPasswordInput.setAttribute('autocomplete',signup?'new-password':'current-password');
 authSubmitButton.textContent=signup?'ساخت حساب و شروع':'ورود';
 authSwitchButton.textContent=signup?'بازگشت به ورود':'ساخت حساب جدید';
 byId('auth-heading').textContent=signup?'ساخت حساب جدید':'ورود به حساب مالی شخصی';
 byId('auth-description').textContent=signup
  ?'برای ثبت‌نام فقط ایمیل و رمز عبور دلخواه خود را وارد کنید.'
  :'با ایمیل و رمز عبور خود وارد شوید. اطلاعات هر کاربر مستقل است.';
 const remember=byId('auth-remember')?.closest('.auth-remember');
 if(remember)remember.hidden=signup;
 document.querySelector('.auth-trusted-device')?.toggleAttribute('hidden',signup);
 document.getElementById('auth-gate')?.setAttribute('data-auth-mode',authMode);
 confirmationHelp.hidden=true;
 authStatus(signup?'صفحه ساخت حساب باز شد. ایمیل، رمز و تکرار آن را وارد کنید.':'برای ورود، ایمیل و رمز عبور خود را وارد کنید.');
}
function clearSignupMode(){setAuthMode('login');}
function signupMetadata(){return {app_source:'my-finance'};}
authSwitchButton.addEventListener('click',event=>{
 event.preventDefault();
 if(authActionInFlight)return;
 setAuthMode(authMode==='login'?'signup':'login');
});
byId('auth-form').addEventListener('submit',async event=>{
 event.preventDefault();
 if(authActionInFlight)return;
 const requestedMode=authMode;
 const accountEmail=authEmail.value.trim().toLowerCase();
 const password=authPassword.value;
 if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(accountEmail))return authStatus('ایمیل معتبر وارد کنید.',true);
 if(!password)return authStatus('رمز عبور لازم است.',true);
 if(requestedMode==='signup'){
  if(password.length<10)return authStatus('رمز عبور باید حداقل ۱۰ کاراکتر باشد.',true);
  if(password!==authPasswordConfirm.value)return authStatus('تکرار رمز عبور یکسان نیست.',true);
 }
 authActionInFlight=true;
 authSubmitButton.disabled=true;authSwitchButton.disabled=true;
 saveRemembered();
 confirmationHelp.hidden=true;
 authStatus(requestedMode==='signup'?'در حال ساخت حساب…':'در حال ورود…');
 try{
  if(requestedMode==='signup'){
   const {data,error}=await client.auth.signUp({
    email:accountEmail,password,
    options:{emailRedirectTo:location.origin+location.pathname,data:signupMetadata()}
   });
   if(error)return authStatus('ثبت‌نام انجام نشد. '+emailProblem(error),true);
   authPassword.value='';authPasswordConfirm.value='';
   clearSignupMode();
   if(data?.session)await refreshIdentity();
   else{
    confirmationHelp.hidden=false;
    authStatus('حساب ثبت شد، اما سرویس احراز هویت هنوز تأیید ایمیل را الزامی می‌داند. پس از تأیید ایمیل با همین حساب وارد شوید.');
   }
  }else{
   const {error}=await client.auth.signInWithPassword({email:accountEmail,password});
   if(error){
    if(/email.not.confirmed|email_not_confirmed/i.test(String(error.code||'')+' '+String(error.message||''))){
     confirmationHelp.hidden=false;
     return authStatus('ایمیل حساب هنوز تأیید نشده است. ایمیل ارسالی را بررسی کنید.',true);
    }
    return authStatus('ورود ناموفق: ایمیل یا رمز عبور را بررسی کنید.',true);
   }
   authPassword.value='';
   await refreshIdentity();
  }
 }catch(e){
  authStatus('ارتباط برقرار نشد. بدون بستن برنامه دوباره تلاش کنید: '+String(e?.message||'خطای شبکه'),true);
 }finally{
  authActionInFlight=false;authSubmitButton.disabled=false;authSwitchButton.disabled=false;
 }
});
byId('auth-resend-confirm').addEventListener('click',async()=>{
 const value=authEmail.value.trim().toLowerCase();
 if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value))return authStatus('برای ارسال مجدد، ایمیل ثبت‌نام را وارد کنید.',true);
 authStatus('در حال درخواست ارسال مجدد ایمیل تأیید…');
 const {error}=await client.auth.resend({type:'signup',email:value,options:{emailRedirectTo:location.origin+location.pathname}});
 authStatus(error?emailProblem(error):'اگر حساب نیاز به تأیید داشته باشد، ایمیل ارسال می‌شود. Inbox و Spam را بررسی کنید.',!!error);
});
byId('auth-logout').addEventListener('click',async()=>{
 const{error}=await client.auth.signOut({scope:'local'});
 if(error)return authStatus('خروج ناموفق: '+error.message,true);
 lock('از حساب خارج شدید؛ برای ورود مجدد از ایمیل و رمز عبور استفاده کنید.');
});
byId('auth-recheck').addEventListener('click',()=>refreshIdentity());
byId('auth-forgot').addEventListener('click',async()=>{
 const email=authEmail.value.trim().toLowerCase();
 if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))return authStatus('ابتدا ایمیل خود را وارد کنید.',true);
 const{error}=await client.auth.resetPasswordForEmail(email,{redirectTo:location.origin+location.pathname});
 authStatus(error?'درخواست بازیابی ناموفق: '+error.message:'اگر حسابی با این ایمیل وجود داشته باشد، لینک بازیابی ارسال می‌شود.',!!error);
});
byId('auth-set-password').addEventListener('click',async()=>{
 const password=byId('auth-new-password').value;
 if(password.length<10)return authStatus('رمز جدید باید حداقل ۱۰ کاراکتر باشد.',true);
 const{error}=await client.auth.updateUser({password});
 if(error)return authStatus('تغییر رمز ناموفق: '+error.message,true);
 byId('auth-new-password').value='';recovery=false;byId('auth-reset-panel').hidden=true;
 authStatus('رمز عبور جدید ذخیره شد.');await refreshIdentity();
});

function allRecords(data){
 const records=new Map();
 for(const [kind,collection] of Object.entries(collections)){
  for(const item of data[collection]||[])if(item&&item.id)records.set(kind+':'+item.id,JSON.stringify(item));
 }
 for(const item of data.tx||[])if(item&&item.id)records.set('tx:'+item.id,JSON.stringify(item));
 return records;
}
function setDirty(){
 if(!user)return;
 const current=allRecords(bridge.getData());
 for(const [key,value] of current)if(!seen.has(key)||seen.get(key)!==value)dirty.add(key);
 localStorage.setItem(dirtyKey(),JSON.stringify([...dirty]));
 queueSync();
}
function queueSync(){
 queued=true;
 if(!busy)setTimeout(()=>sync().catch(e=>notice('خطای همگام‌سازی: '+e.message)),850);
}
async function readAll(table,fields,ownerId){
 const rows=[];
 for(let i=0;i<10000;i+=500){
  const {data,error}=await client.from(table).select(fields).eq('user_id',ownerId).order('created_at',{ascending:true}).range(i,i+499);
  if(error)throw error;
  rows.push(...data);
  if(data.length<500)return rows;
 }
 throw Error('تعداد رکوردها از محدودیت فعلی همگام‌سازی بیشتر است.');
}
function fromEntry(row){
 const meta=row.metadata||{};
 return {id:row.id,kind:row.entry_type,amount:Number(row.amount),currency:row.currency,
  category:row.category||'',memo:row.description||'',date:row.occurred_at,status:row.status,
  account:meta.accountId||null,accountName:meta.accountName||'',
  paymentMethod:meta.paymentMethod||'',scope:meta.scope||'personal',legacyId:meta.legacyId||null,
  recurringId:meta.recurringId||null,dueDate:meta.dueDate||null,paidAt:meta.paidAt||null,source:'supabase'};
}
function toEntry(item){
 const account=bridge.getData().accounts.find(a=>a.id===item.account);
 const currency=item.currency||account?.currency||'IRT';
 const metadata={accountId:item.account||null,accountName:item.accountName||account?.name||null,
  paymentMethod:item.paymentMethod||null,scope:item.scope||'personal',legacyId:item.legacyId||null,
  recurringId:item.recurringId||null,dueDate:item.dueDate||null,paidAt:item.paidAt||null};
 return {id:item.id,user_id:user.id,entry_type:item.kind,amount:Number(item.amount),currency,
  category:item.category||null,description:item.memo||null,occurred_at:item.date||new Date().toISOString(),
  status:['pending','cancelled'].includes(item.status)?item.status:'completed',
  source:item.source==='chatgpt'?'chatgpt':'pwa',metadata};
}
async function writeBatch(table,rows){
 for(let i=0;i<rows.length;i+=80){
  const {error}=await client.from(table).upsert(rows.slice(i,i+80),{onConflict:'id'});
  if(error)throw error;
 }
}
async function sync(){
 if(!user)return false;
 if(busy){queued=true;return false;}
 const ownerId=user.id,epoch=identityEpoch;
 busy=true;queued=false;
 notice('در حال همگام‌سازی…',true);
 try{
  const repaired=await repairLegacyIds();assertIdentity(ownerId,epoch);
  const [cloudObjects,cloudEntries]=await Promise.all([
   readAll('finance_objects','id,kind,payload,updated_at,created_at',ownerId),
   readAll('finance_entries','id,entry_type,amount,currency,category,description,occurred_at,status,source,metadata,updated_at,created_at',ownerId)
  ]);
  assertIdentity(ownerId,epoch);
  const latest=bridge.getData(),next={...latest};
  const remoteObjects=new Set(),remoteTx=new Set();
  for(const [kind,collection] of Object.entries(collections)){
   const map=new Map((latest[collection]||[]).map(r=>[r.id,r]));
   for(const row of cloudObjects.filter(r=>r.kind===kind)){
    remoteObjects.add(kind+':'+row.id);
    if(!dirty.has(kind+':'+row.id)&&row.payload&&typeof row.payload==='object'){
     const payload={...row.payload,id:row.id};
     map.set(row.id,payload);
    }
   }
   next[collection]=[...map.values()];
  }
  const transactions=new Map((latest.tx||[]).map(r=>[r.id,r]));
  for(const row of cloudEntries){
   remoteTx.add('tx:'+row.id);
   if(!dirty.has('tx:'+row.id))transactions.set(row.id,fromEntry(row));
  }
  next.tx=[...transactions.values()];
  assertIdentity(ownerId,epoch);
  bridge.replaceData(next); // Do not mark cloud downloads as locally edited.
  document.dispatchEvent(new CustomEvent('myfinance:cloud-synced',{detail:{transactions:cloudEntries.length}}));
  const outgoingEntries=[],outgoingObjects=[];
  const errors=[];
  for(const t of next.tx){
   const key='tx:'+t.id;
   if(remoteTx.has(key)&&!dirty.has(key))continue;
   if(!uuid.test(t.id)||!['income','expense','investment','transfer'].includes(t.kind)||!(Number(t.amount)>0)){
    errors.push(key);continue;
   }
   outgoingEntries.push(toEntry(t));
  }
  for(const [kind,collection] of Object.entries(collections)){
   for(const item of next[collection]||[]){
    const key=kind+':'+item.id;
    if(remoteObjects.has(key)&&!dirty.has(key))continue;
    if(!uuid.test(item.id)){errors.push(key);continue}
    outgoingObjects.push({id:item.id,user_id:user.id,kind,payload:item});
   }
  }
  if(outgoingObjects.length){assertIdentity(ownerId,epoch);await writeBatch('finance_objects',outgoingObjects);assertIdentity(ownerId,epoch);}
  if(outgoingEntries.length){assertIdentity(ownerId,epoch);await writeBatch('finance_entries',outgoingEntries);assertIdentity(ownerId,epoch);}
  for(const row of outgoingObjects)dirty.delete(row.kind+':'+row.id);
  for(const row of outgoingEntries)dirty.delete('tx:'+row.id);
  assertIdentity(ownerId,epoch);
  localStorage.setItem(dirtyKey(),JSON.stringify([...dirty]));
  seen=allRecords(bridge.getData());
  refreshPairStatus().catch(()=>{});
  const count=cloudEntries.length+cloudObjects.length+outgoingEntries.length+outgoingObjects.length;
  notice('همگام‌سازی امن فعال · '+count.toLocaleString('fa-IR')+' رکورد'+(repaired?' · '+repaired+' شناسه قدیمی اصلاح شد':'')+(errors.length?' · '+errors.length+' رکورد نیازمند بررسی':'') ,true);
  return true;
 }catch(e){
  if(String(e.message||e)==='SYNC_SESSION_CHANGED')return false;
  if(user?.id===ownerId&&identityEpoch===epoch)notice('همگام‌سازی ناموفق: '+String(e.message||e).slice(0,180),false);
  throw e;
 }finally{
  busy=false;
  if(queued)queueSync();
 }
}

/* PRIVATE PERSONAL PROFILE
 * Name/phone/city/DOB are optional. Photos are compressed, re-encoded and saved in a private
 * Supabase Storage bucket with per-user RLS. Never copy images into GitHub or finance tx data. */
const PROFILE_BUCKET='finance-profile-photos';
let loadedProfileFor=null,profileEpoch=0,avatarObjectURL=null,pendingPhoto=null;
const profileStatus=(message,error=false)=>{
 const el=byId('profile-status');if(!el)return;
 el.textContent=message;el.classList.toggle('danger',error);
};
const profilePath=id=>id+'/avatar.webp';
const profileAlive=(id,epoch)=>!!user&&user.id===id&&identityEpoch===epoch;
function releaseAvatar(){
 if(avatarObjectURL){URL.revokeObjectURL(avatarObjectURL);avatarObjectURL=null}
}
function displayAvatar(blob){
 releaseAvatar();
 const image=byId('profile-avatar'),placeholder=byId('profile-avatar-placeholder');
 const otherImages=document.querySelectorAll('.finance-user-avatar-image');
 const otherPlaceholders=document.querySelectorAll('.finance-avatar-placeholder');
 if(blob){
  avatarObjectURL=URL.createObjectURL(blob);image.src=avatarObjectURL;
  image.hidden=false;placeholder.hidden=true;
  otherImages.forEach(img=>{img.src=avatarObjectURL;img.hidden=false});
  otherPlaceholders.forEach(el=>{el.hidden=true});
 }else{
  image.hidden=true;image.removeAttribute('src');placeholder.hidden=false;
  otherImages.forEach(img=>{img.hidden=true;img.removeAttribute('src')});
  otherPlaceholders.forEach(el=>{el.hidden=false});
 }
}
function resetProfile(){
 loadedProfileFor=null;profileEpoch++;
 pendingPhoto=null;
 byId('profile-photo-save').disabled=true;
 byId('profile-photo').value='';
 for(const key of ['full-name','phone','city','birth-date'])byId('profile-'+key).value='';
 byId('profile-summary').textContent='اطلاعات اختصاصی حساب شما';
 document.querySelectorAll('.finance-identity-name,.finance-header-profile-name').forEach(el=>{el.textContent='پروفایل من'});
 document.querySelectorAll('.finance-identity-email').forEach(el=>{el.textContent='حساب اختصاصی'});
 profileStatus('اطلاعات این بخش فقط در حساب شخصی شما نمایش داده می‌شود.');
 displayAvatar(null);
}
function sanitizeProfile(input){
 const name=String(input?.full_name||'').trim().slice(0,120);
 const phone=String(input?.phone||'').trim().slice(0,30);
 const city=String(input?.city||'').trim().slice(0,100);
 const date=String(input?.birth_date||'').trim();
 if(date&&(!/^\d{4}-\d{2}-\d{2}$/.test(date)||date<'1900-01-01'||date>new Date().toISOString().slice(0,10)||
   !Number.isFinite(Date.parse(date+'T12:00:00Z'))||
   new Date(date+'T12:00:00Z').toISOString().slice(0,10)!==date))
   throw Error('تاریخ تولد نامعتبر است. می‌توانید این فیلد را خالی بگذارید.');
 return {full_name:name,phone,city,birth_date:date||null};
}
function displayProfile(info,id){
 if(!user||user.id!==id)return;
 byId('profile-full-name').value=info.full_name||'';
 byId('profile-phone').value=info.phone||'';
 byId('profile-city').value=info.city||'';
 byId('profile-birth-date').value=info.birth_date||'';
 byId('profile-summary').textContent=(info.full_name||'کاربر My Finance')+' · '+user.email;
 document.querySelectorAll('.finance-identity-name,.finance-header-profile-name').forEach(el=>{el.textContent=info.full_name||'پروفایل من'});
 document.querySelectorAll('.finance-identity-email').forEach(el=>{el.textContent=user.email||'حساب اختصاصی'});
}
async function loadAvatar(id,path,epoch){
 if(!profileAlive(id,epoch))return;
 if(!path){displayAvatar(null);return}
 if(path!==profilePath(id)){displayAvatar(null);return}
 const {data,error}=await client.storage.from(PROFILE_BUCKET).download(path);
 if(!profileAlive(id,epoch))return;
 if(error||!data){displayAvatar(null);profileStatus('مشخصات بارگیری شد اما تصویر در دسترس نیست. می‌توانید عکس جدید انتخاب کنید.',true);return}
 displayAvatar(data);
}
async function loadProfile(force=false){
 if(!user||!document.body.classList.contains('finance-unlocked'))return;
 const uid=user.id,epoch=identityEpoch,token=++profileEpoch;
 if(!force&&loadedProfileFor===uid)return;
 profileStatus('در حال دریافت پروفایل خصوصی شما…');
 let {data,error}=await client.from('finance_profiles').select('full_name,phone,city,birth_date,avatar_path').eq('user_id',uid).maybeSingle();
 if(!profileAlive(uid,epoch)||token!==profileEpoch)return;
 if(error)throw error;
 if(!data){
  const initial=sanitizeProfile(user.user_metadata||{});
  const created=await client.from('finance_profiles').insert({user_id:uid,...initial}).select('full_name,phone,city,birth_date,avatar_path').single();
  if(created.error){
   const reread=await client.from('finance_profiles').select('full_name,phone,city,birth_date,avatar_path').eq('user_id',uid).maybeSingle();
   if(reread.error||!reread.data)throw created.error;
   data=reread.data;
  }else data=created.data;
 }
 if(!profileAlive(uid,epoch)||token!==profileEpoch)return;
 loadedProfileFor=uid;
 displayProfile(data,uid);
 profileStatus('اطلاعات شما به‌صورت خصوصی ذخیره شده است. تاریخ تولد و سایر اطلاعات اختیاری‌اند.');
 await loadAvatar(uid,data.avatar_path,epoch);
}
byId('profile-save').addEventListener('click',async()=>{
 if(!user||!document.body.classList.contains('finance-unlocked'))return profileStatus('برای ذخیره ابتدا وارد حساب خود شوید.',true);
 const uid=user.id,epoch=identityEpoch,btn=byId('profile-save');
 let data;
 try{data=sanitizeProfile({full_name:byId('profile-full-name').value,phone:byId('profile-phone').value,
 city:byId('profile-city').value,birth_date:byId('profile-birth-date').value})}
 catch(e){return profileStatus(String(e.message||e),true)}
 btn.disabled=true;profileStatus('در حال ذخیره اطلاعات شخصی…');
 try{
  const {error}=await client.from('finance_profiles').upsert({user_id:uid,...data,updated_at:new Date().toISOString()},{onConflict:'user_id'});
  if(error)throw error;
  if(!profileAlive(uid,epoch))return;
  byId('profile-summary').textContent=(data.full_name||'کاربر My Finance')+' · '+user.email;
  document.querySelectorAll('.finance-identity-name,.finance-header-profile-name').forEach(el=>{el.textContent=data.full_name||'پروفایل من'});
  profileStatus('✓ مشخصات پروفایل ذخیره شد.');
 }catch(e){if(profileAlive(uid,epoch))profileStatus('ذخیره موفق نبود: '+String(e.message||e),true)}
 finally{btn.disabled=false}
});
byId('profile-photo').addEventListener('change',event=>{
 const file=event.target.files?.[0];
 pendingPhoto=null;byId('profile-photo-save').disabled=true;
 if(!file)return;
 if(!['image/png','image/jpeg','image/webp'].includes(file.type)||file.size>6*1024*1024||file.size<100)
  return profileStatus('فقط عکس JPG، PNG یا WebP با حجم حداکثر ۶ مگابایت انتخاب کنید.',true);
 if(!user||!document.body.classList.contains('finance-unlocked'))
  return profileStatus('برای انتخاب عکس ابتدا وارد حساب شخصی شوید.',true);
 pendingPhoto=file;
 displayAvatar(file);
 byId('profile-photo-save').disabled=false;
 profileStatus('عکس انتخاب شد، اما هنوز ذخیره نشده است. برای بارگذاری «ذخیره عکس انتخاب‌شده» را بزنید.');
});
async function compressedPhoto(file){
 let bitmap=null,objectURL=null,img;
 try{
  if(typeof createImageBitmap==='function')bitmap=await createImageBitmap(file);
  if(!bitmap){
   img=new Image();objectURL=URL.createObjectURL(file);img.src=objectURL;await img.decode();
  }
  const width=bitmap?.width||img.naturalWidth,height=bitmap?.height||img.naturalHeight;
  if(!(width>0&&height>0)||width>12000||height>12000)throw Error('ابعاد عکس نامعتبر است.');
  const scale=Math.min(1,512/Math.max(width,height)),canvas=document.createElement('canvas');
  canvas.width=Math.max(1,Math.round(width*scale));canvas.height=Math.max(1,Math.round(height*scale));
  canvas.getContext('2d').drawImage(bitmap||img,0,0,canvas.width,canvas.height);
  const blob=await new Promise(resolve=>canvas.toBlob(resolve,'image/webp',.82));
  if(!blob||blob.type!=='image/webp'||blob.size>2*1024*1024)throw Error('فشرده‌سازی عکس انجام نشد. تصویر کوچک‌تری انتخاب کنید.');
  return blob;
 }finally{if(bitmap)bitmap.close();if(objectURL)URL.revokeObjectURL(objectURL)}
}
byId('profile-photo-save').addEventListener('click',async()=>{
 if(!pendingPhoto||!user||!document.body.classList.contains('finance-unlocked'))return profileStatus('ابتدا عکس را انتخاب کنید.',true);
 const uid=user.id,epoch=identityEpoch,button=byId('profile-photo-save'),file=pendingPhoto;
 button.disabled=true;profileStatus('در حال کوچک‌سازی و ذخیره خصوصی عکس…');
 try{
  const image=await compressedPhoto(file);
  if(!profileAlive(uid,epoch))return;
  const path=profilePath(uid);
  const {error}=await client.storage.from(PROFILE_BUCKET).upload(path,image,{upsert:true,contentType:'image/webp',cacheControl:'3600'});
  if(error)throw error;
  if(!profileAlive(uid,epoch))return;
  const {error:profileError}=await client.from('finance_profiles').upsert({user_id:uid,avatar_path:path,updated_at:new Date().toISOString()},{onConflict:'user_id'});
  if(profileError)throw profileError;
  if(!profileAlive(uid,epoch))return;
  pendingPhoto=null;byId('profile-photo').value='';
  displayAvatar(image);profileStatus('✓ عکس پروفایل در فضای خصوصی شما ذخیره شد.');
 }catch(e){if(profileAlive(uid,epoch)){profileStatus('بارگذاری عکس ناموفق بود: '+String(e.message||e),true);button.disabled=!pendingPhoto}}
});
byId('profile-photo-remove').addEventListener('click',async()=>{
 if(!user||!document.body.classList.contains('finance-unlocked'))return profileStatus('ابتدا وارد حساب خود شوید.',true);
 if(!confirm('عکس پروفایل خود را حذف می‌کنید؟'))return;
 const uid=user.id,epoch=identityEpoch,button=byId('profile-photo-remove');
 button.disabled=true;profileStatus('در حال حذف عکس خصوصی…');
 try{
  const {error}=await client.storage.from(PROFILE_BUCKET).remove([profilePath(uid)]);
  if(error)throw error;
  if(!profileAlive(uid,epoch))return;
  const {error:e}=await client.from('finance_profiles').update({avatar_path:null,updated_at:new Date().toISOString()}).eq('user_id',uid);
  if(e)throw e;
  if(!profileAlive(uid,epoch))return;
  pendingPhoto=null;byId('profile-photo').value='';byId('profile-photo-save').disabled=true;
  displayAvatar(null);profileStatus('✓ عکس پروفایل حذف شد.');
 }catch(e){if(profileAlive(uid,epoch))profileStatus('حذف عکس کامل نشد: '+String(e.message||e),true)}
 finally{button.disabled=false}
});

async function refreshIdentity(){
 if(!bootstrapped||authPending)return;
 authPending=true;let next=null;
 try{
  const{data,error}=await client.auth.getUser();if(error)throw error;
  next=data?.user||null;
  if(!next){lock('برای ادامه وارد حساب خود شوید.');return}
  const access=await getAccess(next);
  if(!validAccess(access)){lock(pendingText(access),next);return}
  if(recovery){lock('رمز عبور جدید را تعیین کنید.',next);byId('auth-reset-panel').hidden=false;return}
  const same=user?.id===next.id;
  if(!same){
   resetProfile(); // Never display previous user's profile while the new account loads.
   identityEpoch++;
   user=next;dirty=new Set();seen=new Map();bridge.bindUser(user.id);
   try{dirty=new Set(JSON.parse(localStorage.getItem(dirtyKey())||'[]'))}catch(e){}
  }
  const loginEpoch=identityEpoch;
  if(!same||!document.body.classList.contains('finance-unlocked')){
   const result=await sync();
   if(result===false){gate('در حال دریافت اطلاعات اختصاصی حساب؛ دوباره بررسی کنید.',next);return;}
  }
  if(user?.id!==next.id||identityEpoch!==loginEpoch)return;
  renderAuth();document.body.classList.add('finance-unlocked');document.dispatchEvent(new Event('myfinance:unlocked'));
  byId('account-access-summary').textContent='حساب فعال: '+next.email+(access.expires_at?' · تا '+new Date(access.expires_at).toLocaleDateString('fa-IR'):' · بدون سررسید');
  showAdmin().catch(()=>{});
  if(loadedProfileFor!==next.id)loadProfile().catch(e=>profileStatus('بارگیری پروفایل موفق نبود: '+String(e.message||e),true));
 }catch(e){
  // Network failures must not be interpreted as explicit logout.
  // Only a server-verified identity may unlock financial data.
  let storedSession=null,hasRememberedToken=false;
  try{const {data}=await client.auth.getSession();storedSession=data?.session||null}catch(_ignored){}
  // Presence of a saved token is only a signal to display "retry"; never authorization.
  try{hasRememberedToken=!!(keepSignedIn()?localStorage.getItem(AUTH_SESSION_KEY):sessionStorage.getItem(AUTH_SESSION_KEY))}catch(_ignored){}
  if(storedSession||hasRememberedToken){
   lock('اتصال برای بررسی حساب برقرار نیست؛ نشست این دستگاه محفوظ است. پس از برقراری اینترنت «بررسی مجدد وضعیت دسترسی» را بزنید.',storedSession?.user||next||{email:authEmail.value},true);
  }else{
   lock('ورود امن تأیید نشد. اتصال اینترنت را بررسی کنید و اگر نشست پایان یافته، دوباره وارد شوید.',null,true);
  }
 }
 finally{authPending=false}
}
byId('supabase-send').addEventListener('click',async()=>{
 const value=email.value.trim();
 if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value))return notice('ایمیل معتبر وارد کنید.');
 notice('لینک ورود در حال ارسال…');
 const {error}=await client.auth.signInWithOtp({email:value,options:{emailRedirectTo:location.origin+location.pathname,shouldCreateUser:true}});
 notice(error?'ارسال انجام نشد: '+error.message:'لینک ورود ارسال شد. ایمیل را در همین گوشی باز کنید.');
});
byId('supabase-pair').addEventListener('click',async()=>{
 if(!user)return notice('اول وارد حساب خود شوید.');
 const {data:existing,error:checkError}=await client.from('finance_voice_pairings').select('consumed_at').eq('user_id',user.id).maybeSingle();
 if(checkError)return notice('خطای بررسی اتصال: '+checkError.message);
 if(existing?.consumed_at&&!confirm('اتصال فعلی ChatGPT تأیید شده است. آیا می‌خواهید آن را لغو کرده و کد اتصال جدید بسازید؟'))return;
 const buf=new Uint32Array(2);crypto.getRandomValues(buf);
 const code=String(((buf[0]^buf[1])>>>0)%100000000).padStart(8,'0');
 const expires_at=new Date(Date.now()+15*60*1000).toISOString();
 const {error}=await client.from('finance_voice_pairings').upsert({user_id:user.id,pairing_code:code,expires_at,consumed_at:null},{onConflict:'user_id'});
 if(error)return byId('supabase-pair-status').textContent='ساخت کد انجام نشد: '+error.message;
 byId('supabase-pair-status').textContent='کد اتصال شما: '+code+' · این کد فقط ۱۵ دقیقه معتبر است. آن را یک‌بار در همین گفتگوی ChatGPT اعلام کنید.';
});
byId('supabase-logout').addEventListener('click',async()=>{
 const {error}=await client.auth.signOut({scope:'local'});
 if(error)notice('خروج ناموفق: '+error.message);
 else await refreshIdentity();
});
byId('supabase-signout-wipe').addEventListener('click',async()=>{
 if(!user)return notice('ابتدا وارد حساب خود شوید.');
 if(!confirm('پس از همگام‌سازی، داده‌های محلی این حساب و نسخه پیش‌نمایش قدیمی از این دستگاه پاک شوند؟ اطلاعات ذخیره‌شده در Cloud باقی می‌مانند. ادامه می‌دهید؟'))return;
 const ownerId=user.id;
 try{
  const synced=await sync();
  if(!synced||user?.id!==ownerId||dirty.size)throw Error('ابتدا همگام‌سازی کامل و بدون خطا لازم است؛ داده‌های محلی حذف نشدند.');
  const {error}=await client.auth.signOut({scope:'local'});
  if(error)throw error;
  localStorage.removeItem('my-finance-user-'+ownerId);
  localStorage.removeItem('my-finance-dirty-'+ownerId);
  localStorage.removeItem('my-finance-backup-before-id-repair-'+ownerId);
  localStorage.removeItem('my-finance-preview-v1');
  lock('با موفقیت خارج شدید و داده‌های محلی این حساب از این دستگاه پاک شدند.');
 }catch(e){notice('پاکسازی انجام نشد: '+String(e.message||e),false)}
});
byId('supabase-pull').addEventListener('click',()=>sync().catch(()=>{}));
byId('supabase-push').addEventListener('click',()=>sync().catch(()=>{}));
document.addEventListener('myfinance:changed',setDirty);
document.addEventListener('visibilitychange',()=>{if(!document.hidden)refreshIdentity()});
window.addEventListener('online',()=>refreshIdentity());
setInterval(()=>{if(!document.hidden&&navigator.onLine)refreshIdentity().then(()=>{if(user)sync().catch(()=>{})})},15000);
client.auth.onAuthStateChange(event=>{if(event==='PASSWORD_RECOVERY'){recovery=true;byId('auth-reset-panel').hidden=false}setTimeout(refreshIdentity,0)});
async function runFinanceAI(body){
 if(!user)throw Error('ابتدا به حساب شخصی خود وارد شوید.');
 const {data,error}=await client.functions.invoke('finance-voice-ai',{body});
 if(error){
  let detail='';
  try{
   const context=error.context;
   if(context&&typeof context.json==='function'){
    const payload=await context.json();detail=String(payload?.message||payload?.error||'');
   }
  }catch{}
  if(detail==='AI_NOT_CONFIGURED'||detail.includes('کلید API'))throw Error('سرویس تحلیل هوشمند هنوز کلید API ندارد و فعال نشده است.');
  throw Error(detail||'سرویس تحلیل هوشمند در حال حاضر پاسخ نمی‌دهد.');
 }
 if(!data||!data.result)throw Error('پاسخ قابل استفاده‌ای از تحلیل هوشمند دریافت نشد.');
 return data;
}
window.MyFinanceAI={
 analyzeText:(text,accounts=[])=>runFinanceAI({text,accounts:accounts.map(a=>({name:a.name,currency:a.currency}))}),
 analyzeAudio:(blob,accounts=[])=>{
  const form=new FormData();
  form.append('audio',blob,'finance-recording.webm');
  form.append('accounts',JSON.stringify(accounts.map(a=>({name:a.name,currency:a.currency}))));
  return runFinanceAI(form);
 }
};

window.MyFinanceCloud={sync,authenticated:()=>!!user,currentUserId:()=>user?.id||null};
// Avoid flashing the sign-in form on every refresh while a valid remembered session is being verified.
byId('auth-form').hidden=true;
byId('auth-pending').hidden=true;
authStatus('در حال بررسی ورود امن شما…');
renderAuth();
// Keep the verified, tab-scoped Supabase session across reloads.
// Auth callbacks from email confirmation/password recovery must be processed first.
function isAuthCallback(){
 const qs=new URLSearchParams(location.search);
 const hs=new URLSearchParams(location.hash.replace(/^#/,''));
 return qs.has('code')||qs.has('token_hash')||qs.has('type')||hs.has('access_token')||hs.has('refresh_token')||hs.has('type');
}
(async()=>{
 // Reuse the session provided by Supabase after reload; reverify authorization on each launch.
 bootstrapped=true;
 await refreshIdentity();
})().catch(e=>gate('راه‌اندازی ورود امن با خطا روبه‌رو شد: '+String(e.message||e),null,true));
