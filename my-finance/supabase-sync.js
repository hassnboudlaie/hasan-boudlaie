/* My Finance · authenticated cloud sync v3. No service credentials belong in a public PWA. */
import {createClient} from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.76.1/+esm';
const client=createClient('https://hxcjkewlaniahvuqwwbb.supabase.co','sb_publishable_KpklYvrvXyorJVy4gQOWAw_SA8zaQy6',{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}});
const bridge=window.MyFinanceBridge;
const byId=id=>document.getElementById(id);
const login=byId('supabase-login'),actions=byId('supabase-actions'),email=byId('supabase-email');
let user=null,busy=false,queued=false,authPending=false,seen=new Map();
const collections={account:'accounts',receivable:'receivables',transfer:'transfers',commitment:'commitments'};
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
 const backupKey='my-finance-backup-before-id-repair-'+user.id;
 if(!localStorage.getItem(backupKey))localStorage.setItem(backupKey,JSON.stringify(original));
 const updatedDirty=new Set();
 for(const key of dirty){
  const n=key.indexOf(':');
  if(n<0){updatedDirty.add(key);continue}
  const kind=key.slice(0,n),old=key.slice(n+1);
  updatedDirty.add(kind+':'+(remap[kind]?.get(old)||old));
 }
 dirty=updatedDirty;
 bridge.commitData(next);
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
async function readAll(table,fields){
 const rows=[];
 for(let i=0;i<10000;i+=500){
  const {data,error}=await client.from(table).select(fields).order('created_at',{ascending:true}).range(i,i+499);
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
  paymentMethod:meta.paymentMethod||'',scope:meta.scope||'personal',legacyId:meta.legacyId||null,source:'supabase'};
}
function toEntry(item){
 const account=bridge.getData().accounts.find(a=>a.id===item.account);
 const currency=item.currency||account?.currency||'IRT';
 const metadata={accountId:item.account||null,accountName:item.accountName||account?.name||null,
  paymentMethod:item.paymentMethod||null,scope:item.scope||'personal',legacyId:item.legacyId||null};
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
 if(!user||busy)return;
 busy=true;queued=false;
 notice('در حال همگام‌سازی…',true);
 try{
  const repaired=await repairLegacyIds();
  const [cloudObjects,cloudEntries]=await Promise.all([
   readAll('finance_objects','id,kind,payload,updated_at,created_at'),
   readAll('finance_entries','id,entry_type,amount,currency,category,description,occurred_at,status,source,metadata,updated_at,created_at')
  ]);
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
  if(outgoingObjects.length)await writeBatch('finance_objects',outgoingObjects);
  if(outgoingEntries.length)await writeBatch('finance_entries',outgoingEntries);
  for(const row of outgoingObjects)dirty.delete(row.kind+':'+row.id);
  for(const row of outgoingEntries)dirty.delete('tx:'+row.id);
  localStorage.setItem(dirtyKey(),JSON.stringify([...dirty]));
  seen=allRecords(bridge.getData());
  refreshPairStatus().catch(()=>{});
  const count=cloudEntries.length+cloudObjects.length+outgoingEntries.length+outgoingObjects.length;
  notice('همگام‌سازی امن فعال · '+count.toLocaleString('fa-IR')+' رکورد'+(repaired?' · '+repaired+' شناسه قدیمی اصلاح شد':'')+(errors.length?' · '+errors.length+' رکورد نیازمند بررسی':'') ,true);
 }catch(e){
  notice('همگام‌سازی ناموفق: '+String(e.message||e).slice(0,180),false);
  throw e;
 }finally{
  busy=false;
  if(queued)queueSync();
 }
}
async function refreshIdentity(){
 if(authPending)return;
 authPending=true;
 try{
  const {data,error}=await client.auth.getUser();
  const next=error?null:data?.user||null;
  if((next?.id||null)===(user?.id||null))return;
  user=next;
  dirty=new Set();
  seen=new Map();
  if(user){
   bridge.bindUser(user.id);
   try{dirty=new Set(JSON.parse(localStorage.getItem(dirtyKey())||'[]'))}catch(e){}
  }else bridge.bindUser(null);
  renderAuth();
  if(user)await sync();
 }catch(e){notice('اتصال حساب ناموفق: '+e.message)}
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
document.addEventListener('visibilitychange',()=>{if(!document.hidden&&user)sync().catch(()=>{})});
window.addEventListener('online',()=>{if(user)sync().catch(()=>{})});
setInterval(()=>{if(user&&!document.hidden&&navigator.onLine)sync().catch(()=>{})},15000);
client.auth.onAuthStateChange(()=>setTimeout(refreshIdentity,0));
window.MyFinanceCloud={sync,authenticated:()=>!!user};
renderAuth();refreshIdentity();
