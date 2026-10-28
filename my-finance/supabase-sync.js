import {createClient} from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.76.1/+esm';
const client=createClient('https://hxcjkewlaniahvuqwwbb.supabase.co','sb_publishable_KpklYvrvXyorJVy4gQOWAw_SA8zaQy6',{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}});
const container=document.getElementById('supabase-sync');
const status=document.getElementById('supabase-status');
const email=document.getElementById('supabase-email');
const say=s=>{status.textContent=s};
let activeUser=null;
function renderAuth(){document.getElementById('supabase-login').hidden=!!activeUser;document.getElementById('supabase-actions').hidden=!activeUser;say(activeUser?'اتصال امن فعال است: '+activeUser.email:'برای همگام‌سازی ابتدا وارد حساب خود شوید.')}
async function refresh(){const {data,error}=await client.auth.getUser();activeUser=error?null:data.user;renderAuth()}
client.auth.onAuthStateChange(()=>{setTimeout(refresh,0)});
document.getElementById('supabase-send').addEventListener('click',async()=>{
 const value=email.value.trim();if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value))return say('ایمیل معتبر وارد کنید.');
 say('در حال ارسال لینک ورود...');
 const {error}=await client.auth.signInWithOtp({email:value,options:{emailRedirectTo:location.origin+location.pathname,shouldCreateUser:true}});
 say(error?'خطا: '+error.message:'لینک ورود ارسال شد. ایمیل را باز کنید و لینک را در همین مرورگر اجرا کنید.');
});
document.getElementById('supabase-logout').addEventListener('click',async()=>{await client.auth.signOut();activeUser=null;renderAuth()});
document.getElementById('supabase-pull').addEventListener('click',async()=>{
 if(!activeUser)return say('ابتدا وارد شوید.');
 say('در حال دریافت تراکنش‌ها...');
 const {data,error}=await client.from('finance_entries').select('id,entry_type,amount,currency,category,description,occurred_at').in('entry_type',['income','expense']).order('occurred_at',{ascending:false}).limit(1000);
 if(error)return say('خطای دریافت: '+error.message);
 const existing=new Set(db.tx.map(t=>t.id));let added=0,skipped=0;
 for(const item of data){
  if(existing.has(item.id))continue;
  const accounts=db.accounts.filter(a=>a.currency===item.currency);
  const matched=accounts.length===1?accounts[0]:null;
  if(!matched)skipped++;
  db.tx.push({id:item.id,account:matched?.id||null,currency:item.currency,amount:Number(item.amount),kind:item.entry_type,scope:'personal',category:item.category||'',memo:item.description||'',date:item.occurred_at,source:'supabase',accountName:matched?.name||'حساب نامشخص'});added++;
 }
 if(added)save();
 say(added+' تراکنش دریافت شد؛ '+skipped+' تراکنش با حساب نامشخص (بدون تغییر موجودی حساب‌ها). داده‌های موجود حفظ شدند.');
});
document.getElementById('supabase-push').addEventListener('click',async()=>{
 if(!activeUser)return say('ابتدا وارد شوید.');
 if(!confirm('تراکنش‌های محلی درآمد و هزینه در فضای خصوصی Supabase ذخیره شوند؟ این عمل موجودی و حساب‌ها را منتقل نمی‌کند.'))return;
 say('در حال انتقال تراکنش‌ها...');
 const items=db.tx.filter(t=>['income','expense'].includes(t.kind)&&t.source!=='supabase'&&t.id&&Number.isFinite(Number(t.amount))&&Number(t.amount)>0).map(t=>({id:t.id,user_id:activeUser.id,entry_type:t.kind,amount:Number(t.amount),currency:t.currency||db.accounts.find(a=>a.id===t.account)?.currency||'IRT',category:t.category||null,description:t.memo||null,occurred_at:t.date||new Date().toISOString(),source:'pwa',status:'completed'}));
 if(!items.length)return say('تراکنشی برای انتقال وجود ندارد.');
 let sent=0;
 for(let i=0;i<items.length;i+=100){const {error}=await client.from('finance_entries').upsert(items.slice(i,i+100),{onConflict:'id',ignoreDuplicates:true});if(error)return say('انتقال متوقف شد: '+error.message+'؛ '+sent+' رکورد منتقل شد.');sent+=Math.min(100,items.length-i)}
 say(sent+' تراکنش با موفقیت در Supabase ذخیره شد.');
});
refresh().catch(e=>say('خطای اتصال: '+e.message));
