/* My Finance · authenticated cloud sync v3. No service credentials belong in a public PWA. */
import {createClient} from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.76.1/+esm';
const client=createClient('https://hxcjkewlaniahvuqwwbb.supabase.co','sb_publishable_KpklYvrvXyorJVy4gQOWAw_SA8zaQy6',{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}});
const bridge=window.MyFinanceBridge;
const byId=id=>document.getElementById(id);
const login=byId('supabase-login'),actions=byId('supabase-actions'),email=byId('supabase-email');
let user=null,busy=false,queued=false,authPending=false,seen=new Map(),identityEpoch=0;
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

/* Account-gated beta. Browser remembers email only; Supabase handles passwords and sessions. */
const rememberKey='myfinance-saved-email-v1';
const confirmationHelp=byId('auth-confirm-help');
const emailProblem=e=>{const msg=String(e?.code||'')+' '+String(e?.message||'');if(/email.address.not.authorized|email_address_not_authorized/i.test(msg))return 'ارسال تأییدیه برای این ایمیل در تنظیمات فعلی سرور مجاز نیست. مدیر باید سرویس ارسال ایمیل (Custom SMTP) را فعال کند.';if(/rate.limit|over_email_send_rate_limit|too.many.requests/i.test(msg))return 'محدودیت تعداد ایمیل‌های سرور فعال شده است. بعداً دوباره تلاش کنید؛ مدیر باید سرویس ایمیل مستقل را تنظیم کند.';return 'درخواست ایمیل ناموفق بود. لطفاً آدرس و اتصال اینترنت را بررسی کنید. جزئیات: '+String(e?.message||'خطای نامشخص');};
const authEmail=byId('auth-email'),authPassword=byId('auth-password'),authRemember=byId('auth-remember');
const remembered=localStorage.getItem(rememberKey);
if(remembered){authEmail.value=remembered;authRemember.checked=true}else authRemember.checked=false;
let recovery=false;
function authStatus(text,error=false){const e=byId('auth-status');e.textContent=text;e.classList.toggle('error',error)}
function saveRemembered(){if(authRemember.checked)localStorage.setItem(rememberKey,authEmail.value.trim().toLowerCase());else localStorage.removeItem(rememberKey)}
function gate(text,identity=null,error=false){
 document.body.classList.remove('finance-unlocked');
 byId('auth-form').hidden=!!identity;byId('auth-pending').hidden=!identity;
 byId('auth-pending-email').textContent=identity?.email||'';
 authStatus(text,error);
}
function lock(text,identity=null,error=false){
 const before=!!user;identityEpoch++;user=null;dirty=new Set();seen=new Map();
 if(before)bridge.bindUser(null);
 renderAuth();gate(text,identity,error);
}
function validAccess(a){return a?.status==='active'&&(!a.expires_at||Date.parse(a.expires_at)>Date.now())}
function pendingText(a){
 if(a.status==='suspended')return 'دسترسی این حساب توسط مدیر تعلیق شده است. داده‌ها حذف نشده‌اند.';
 if(a.status==='active')return 'اعتبار دسترسی آزمایشی به پایان رسیده است. مدیر می‌تواند آن را تمدید کند.';
 return 'ثبت‌نام انجام شده است. برای شروع استفاده، منتظر تأیید مدیر باشید.';
}
async function getAccess(identity){
 let{data,error}=await client.from('finance_access').select('status,expires_at').eq('user_id',identity.id).maybeSingle();
 if(error)throw error;if(data)return data;
 const created=await client.from('finance_access').insert({user_id:identity.id,email:identity.email,status:'pending'}).select('status,expires_at').single();
 if(created.error){
  const retry=await client.from('finance_access').select('status,expires_at').eq('user_id',identity.id).maybeSingle();
  if(retry.error||!retry.data)throw created.error;
  return retry.data;
 }
 return created.data;
}
async function showAdmin(){
 const link=byId('finance-admin-link');if(!link||!user)return;
 const{data,error}=await client.from('finance_admins').select('user_id').eq('user_id',user.id).maybeSingle();
 link.hidden=!!error||!data;
}
byId('auth-form').addEventListener('submit',async event=>{
 event.preventDefault();const email=authEmail.value.trim().toLowerCase(),password=authPassword.value;
 if(!email||!password)return authStatus('ایمیل و رمز عبور لازم است.',true);
 saveRemembered();confirmationHelp.hidden=true;authStatus('در حال ورود…');
 const{error}=await client.auth.signInWithPassword({email,password});authPassword.value='';
 if(error){if(/email.not.confirmed|email_not_confirmed/i.test(String(error.code||'')+' '+String(error.message||''))){confirmationHelp.hidden=false;return authStatus('ابتدا ایمیل خود را تأیید کنید؛ در صورت نرسیدن ایمیل از گزینه ارسال مجدد استفاده کنید.',true);}return authStatus('ورود ناموفق: ایمیل یا رمز عبور را بررسی کنید.',true);}
 await refreshIdentity();
});
byId('auth-register').addEventListener('click',async()=>{
 const email=authEmail.value.trim().toLowerCase(),password=authPassword.value;
 if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))return authStatus('ایمیل معتبر وارد کنید.',true);
 if(password.length<10)return authStatus('رمز عبور باید حداقل ۱۰ کاراکتر باشد.',true);
 saveRemembered();confirmationHelp.hidden=true;authStatus('در حال ساخت حساب…');
 const{data,error}=await client.auth.signUp({email,password,options:{emailRedirectTo:location.origin+location.pathname}});
 authPassword.value='';
 if(error)return authStatus('ثبت‌نام انجام نشد. '+emailProblem(error),true);
 if(data.session)await refreshIdentity();
 else {confirmationHelp.hidden=false;authStatus('درخواست ثبت‌نام دریافت شد. ایمیل تأیید را بررسی کنید (از جمله Spam). سپس با رمز عبور وارد شوید. اگر ایمیل نرسید، ارسال مجدد را امتحان کنید.');}
});
byId('auth-resend-confirm').addEventListener('click',async()=>{
 const value=authEmail.value.trim().toLowerCase();
 if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value))return authStatus('برای ارسال مجدد، ایمیل ثبت‌نام را وارد کنید.',true);
 authStatus('در حال درخواست ارسال مجدد ایمیل تأیید…');
 const {error}=await client.auth.resend({type:'signup',email:value,options:{emailRedirectTo:location.origin+location.pathname}});
 authStatus(error?emailProblem(error):'اگر حساب نیاز به تأیید داشته باشد، ایمیل ارسال می‌شود. Inbox و Spam را بررسی کنید.',!!error);
});
byId('auth-logout').addEventListener('click',async()=>{
 const{error}=await client.auth.signOut();
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
  bridge.replaceData(next); // Deliberately does not emit local-change event.
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
async function refreshIdentity(){
 if(authPending)return;
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
 }catch(e){lock('دسترسی امن تأیید نشد. اتصال اینترنت را بررسی کنید و دوباره تلاش کنید. '+String(e.message||''),next,true)}
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
 const {error}=await client.auth.signOut();
 if(error)notice('خروج ناموفق: '+error.message);
 else await refreshIdentity();
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

window.MyFinanceCloud={sync,authenticated:()=>!!user};
renderAuth();refreshIdentity();
