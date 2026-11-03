/* My Finance: secure, opt-in ChatGPT API permissions and review-only draft inbox.
 * The external ChatGPT OAuth/GPT client must be connected separately. The application
 * never shares a session token, password or automatic database write permission.
 */
(()=>{
'use strict';
const $=id=>document.getElementById(id);
const host=document.querySelector('.mf-cg-card[aria-label="تنظیم اتصال ChatGPT شخصی"]');
const homeCard=document.querySelector('.mf-cg-card[aria-label="ChatGPT شخصی من"]');
if(!host||!homeCard||!window.MyFinanceBridge)return;
const css=document.createElement('style');
css.textContent='.mf-cg-bridge{direction:rtl;text-align:right;border-top:1px solid var(--line,#ddd);margin-top:18px;padding-top:17px}.mf-cg-bridge h3{font-size:21px;margin:0 0 8px}.mf-cg-bridge label{display:flex;align-items:center;gap:9px;font-size:17px;margin:10px 0;line-height:1.8}.mf-cg-bridge input[type=checkbox]{width:22px;height:22px;accent-color:#087e65}.mf-cg-bridge .mf-cg-bridge-row{display:flex;flex-wrap:wrap;gap:9px;margin:15px 0}.mf-cg-bridge button{font-size:16px;min-height:48px;border-radius:12px;padding:10px 15px}.mf-cg-bridge button:disabled{opacity:.55}.mf-cg-bridge p{font-size:15px;line-height:1.9}.mf-cg-bridge .mf-cg-bridge-note{color:var(--muted,#64748b)}.mf-cg-inbox{display:grid;gap:8px;margin-top:12px}.mf-cg-inbox button{width:100%;text-align:right;background:var(--card,#fff);color:var(--fg,#16263a);border:1px solid var(--line,#d3dde6);font-size:16px}.mf-cg-bridge-flag{font-size:14px;font-weight:700;margin-top:9px}@media(max-width:590px){.mf-cg-bridge button{width:100%}}';
document.head.append(css);
const bridgePanel=document.createElement('div');
bridgePanel.className='mf-cg-bridge';
bridgePanel.innerHTML='<h3>🔐 مجوز اتصال امن</h3><p class="mf-cg-bridge-note">هر کاربر فقط به حساب خودش اجازه می‌دهد. روشن‌کردن مجوز، به‌تنهایی ChatGPT را متصل نمی‌کند؛ اتصال نهایی از داخل ChatGPT و با OAuth انجام می‌شود.</p><label><input type="checkbox" id="mf-cg-permission-drafts" checked>اجازه ساخت پیش‌نویس تراکنش (بدون ثبت خودکار)</label><label><input type="checkbox" id="mf-cg-permission-summary">اجازه دریافت خلاصه آماری حساب</label><div class="mf-cg-bridge-row"><button type="button" id="mf-cg-permission-enable">فعال‌کردن مجوز</button><button type="button" id="mf-cg-permission-disable" class="mf-cg-secondary">قطع دسترسی</button><button type="button" id="mf-cg-inbox-refresh" class="mf-cg-secondary">📥 پیش‌نویس‌ها</button></div><p id="mf-cg-permission-state" role="status" aria-live="polite">وضعیت اتصال در حال بررسی است.</p><div id="mf-cg-inbox" class="mf-cg-inbox" aria-live="polite"></div><p class="mf-cg-bridge-note">در حساب‌های ChatGPT که ساخت اتصال اختصاصی پشتیبانی نمی‌شود، همچنان می‌توان از روش انتقال دستی بالای همین صفحه استفاده کرد.</p>';
host.append(bridgePanel);
const homeNote=document.createElement('p');
homeNote.id='mf-cg-pending-home';homeNote.className='mf-cg-note';
homeCard.append(homeNote);
const cloud=()=>window.MyFinanceCloud;
const authenticated=()=>document.body.classList.contains('finance-unlocked')&&!!cloud()?.authenticated?.();
const state=txt=>{const el=$('mf-cg-permission-state');if(el)el.textContent=txt;};
const fmt=n=>new Intl.NumberFormat('fa-IR').format(Number(n)||0);
const mask=()=>{
 const enabled=authenticated();
 for(const id of ['mf-cg-permission-enable','mf-cg-permission-disable','mf-cg-inbox-refresh']){
  const el=$(id);if(el)el.disabled=!enabled;
 }
};
let latestUser=null,currentDraft=null,loading=false,deepLinkBusy=false;
async function refresh(){
 mask();
 if(!authenticated()){
  latestUser=null;currentDraft=null;state('برای فعال‌سازی وارد حساب شخصی My Finance شوید.');
  $('mf-cg-pending-home').textContent='';$('mf-cg-inbox').replaceChildren();
  return;
 }
 const uid=cloud().currentUserId();
 latestUser=uid;
 try{
  const [connection,drafts]=await Promise.all([cloud().chatgptConnection(),cloud().chatgptDrafts()]);
  if(latestUser!==uid||cloud()?.currentUserId()!==uid)return;
  $('mf-cg-permission-drafts').checked=connection.enabled?!!connection.allow_drafts:true;
  $('mf-cg-permission-summary').checked=connection.enabled?!!connection.allow_summary:false;
  $('mf-cg-permission-disable').disabled=!connection.enabled;
  state(connection.enabled?
   '✓ مجوز سمت My Finance روشن است. اتصال حساب ChatGPT باید جداگانه در ChatGPT تأیید شود.':
   'مجوز سمت My Finance خاموش است؛ هیچ ابزار خارجی اجازه دریافت گزارش یا ایجاد پیش‌نویس ندارد.');
  const area=$('mf-cg-inbox');area.replaceChildren();
  for(const draft of drafts){
   const b=document.createElement('button');b.type='button';
   const title=draft.action==='expense'?'هزینه':draft.action==='income'?'درآمد':'قرض پرداختی';
   b.textContent='بررسی '+title+' · '+fmt(draft.amount)+' '+draft.currency+' · '+(draft.person||draft.category||'بدون عنوان');
   b.addEventListener('click',()=>openDraft(draft.id));
   area.append(b);
  }
  if(!drafts.length){const p=document.createElement('p');p.className='mf-cg-bridge-note';p.textContent='پیش‌نویس جدیدی برای بررسی ندارید.';area.append(p)}
  $('mf-cg-pending-home').textContent=drafts.length?'📥 '+fmt(drafts.length)+' پیش‌نویس نیازمند بررسی در تنظیمات':'';
 }catch(e){
  if(cloud()?.currentUserId()!==uid)return;
  state('دریافت وضعیت انجام نشد: '+String(e.message||e).slice(0,160));
 }
}
async function togglePermission(enabled){
 if(!authenticated()||loading)return;
 if(enabled&&!$('mf-cg-permission-drafts').checked&&!$('mf-cg-permission-summary').checked){
  state('حداقل یکی از دو سطح دسترسی را انتخاب کنید.');return;
 }
 if(!enabled&&!confirm('دسترسی ابزارهای ChatGPT به حساب مالی شما در سرور قطع شود؟'))return;
 loading=true;mask();state('در حال ثبت امن تصمیم شما...');
 const uid=cloud().currentUserId();
 try{
  await cloud().chatgptSetConnection(enabled,
   $('mf-cg-permission-summary').checked,$('mf-cg-permission-drafts').checked);
  if(cloud()?.currentUserId()!==uid)return;
  state(enabled?'مجوز سمت My Finance ثبت شد. برای اتصال به ChatGPT، تأیید OAuth در سرویس پشتیبانی‌شده لازم است.':'✓ دسترسی سرور قطع شد. توکن قبلی دیگر نمی‌تواند از API مالی استفاده کند.');
  await refresh();
 }catch(e){state('ذخیره مجوز ناموفق: '+String(e.message||e).slice(0,170))}
 finally{loading=false;mask()}
}
async function openDraft(id){
 if(!authenticated()||deepLinkBusy)return;
 deepLinkBusy=true;const uid=cloud().currentUserId();
 try{
  const d=await cloud().chatgptDraft(id);
  if(cloud()?.currentUserId()!==uid)return;
  if(!d)throw Error('این پیش‌نویس برای حساب فعلی پیدا نشد.');
  if(!['pending','opened'].includes(d.status)||Date.parse(d.expires_at)<=Date.now())
   throw Error('پیش‌نویس منقضی یا قبلاً بسته شده است.');
  const voice=window.MyFinanceVoiceEntry?.applyAI;
  if(typeof voice!=='function')throw Error('فرم بررسی آماده نیست؛ اپ را به‌روزرسانی کنید.');
  const transcript=String(d.memo||d.category||'پیش‌نویس ثبت مالی از ChatGPT').trim();
  // Do not save. Open the existing manual review and require user confirmation.
  const result={action:d.action,amount:Number(d.amount),currency:d.currency,
   person:d.person||'',account_name:d.account_name||'',occurred_on:d.occurred_on,
   category:d.category||'سایر',memo:transcript,needs_clarification:false,
   question:'',confidence:1};
  if(typeof window.financeNavGo==='function')window.financeNavGo('home');
  voice({transcript,result});
  currentDraft={id,uid,kind:d.action};
  await cloud().chatgptUpdateDraft(id,'opened');
  state('✓ پیش‌نویس باز شد؛ فقط پس از بررسی و تأیید شما ثبت می‌شود.');
 }catch(e){state('بازکردن پیش‌نویس ممکن نبود: '+String(e.message||e).slice(0,170))}
 finally{deepLinkBusy=false}
}
async function checkDeepLink(){
 if(!authenticated()||deepLinkBusy)return;
 const match=location.hash.match(/^#chatgpt-draft=([0-9a-f-]{36})$/i);
 if(!match)return;
 const id=match[1];
 // Consume the link only after authenticating; never erase it before login.
 history.replaceState(history.state,'',location.pathname+location.search+'#/home');
 await openDraft(id);
}
$('mf-cg-permission-enable').addEventListener('click',()=>togglePermission(true));
$('mf-cg-permission-disable').addEventListener('click',()=>togglePermission(false));
$('mf-cg-inbox-refresh').addEventListener('click',refresh);
document.addEventListener('myfinance:voice-saved',async(e)=>{
 const d=currentDraft;
 if(!d||!authenticated()||cloud()?.currentUserId()!==d.uid||e.detail?.kind!==d.kind)return;
 currentDraft=null;
 try{await cloud().chatgptUpdateDraft(d.id,'accepted');await refresh();}
 catch(error){state('ثبت مالی انجام شد؛ اما بستن پیش‌نویس ناموفق بود. از فهرست دوباره بررسی کنید.')}
});
for(const id of ['voice-cancel','voice-loan-cancel'])$(id)?.addEventListener('click',()=>{currentDraft=null});
document.addEventListener('myfinance:unlocked',()=>{refresh().then(checkDeepLink)});
document.addEventListener('myfinance:rebound',()=>{
 if(cloud()?.currentUserId()!==latestUser){currentDraft=null;latestUser=null;$('mf-cg-inbox').replaceChildren();mask();}
});
document.addEventListener('myfinance:cloud-synced',()=>{if(authenticated())refresh()});
window.addEventListener('hashchange',checkDeepLink);
window.addEventListener('visibilitychange',()=>{if(!document.hidden&&authenticated())refresh().then(checkDeepLink)});
refresh().then(checkDeepLink);
window.MyFinanceChatGPTBridge={refresh,openDraft};
})();
