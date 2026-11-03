/* My Finance: explicit, per-user ChatGPT handoff. Not an OAuth or automatic API connection. */
(()=>{
'use strict';
const bridge=window.MyFinanceBridge, mode=document.getElementById('personal-ai-mode');
const settings=document.getElementById('personal-ai-panel'),home=document.getElementById('home');
if(!bridge||!mode||!settings||!home)return;
const byId=id=>document.getElementById(id);
const css=document.createElement('style');
css.textContent='.mf-cg-card{direction:rtl;text-align:right;background:var(--card,#fff);color:var(--fg,#16263a);border:1px solid var(--line,#dfe7ee);border-radius:21px;padding:20px;margin:15px 0;box-shadow:0 7px 24px rgba(16,37,60,.045)}.mf-cg-head{display:flex;align-items:center;gap:13px}.mf-cg-logo{display:grid;place-items:center;width:51px;height:51px;flex:none;font-size:26px;border-radius:15px;background:#e3f6f0;color:#065f46}.mf-cg-head h2{font-size:24px;line-height:1.5;margin:0!important}.mf-cg-sub{font-size:16px;color:var(--muted,#64748b);line-height:1.85;margin:8px 0 12px!important}.mf-cg-status{display:inline-block;font-size:14px;font-weight:700;border-radius:100px;padding:5px 10px;background:#f0f4f8;color:#334155;margin-inline-start:auto;white-space:nowrap}.mf-cg-status[data-on=true]{background:#e5f4ef;color:#065f46}.mf-cg-actions{display:flex;flex-wrap:wrap;gap:9px;margin:12px 0}.mf-cg-actions button{font-size:17px!important;min-height:51px;padding:10px 17px!important;border-radius:13px!important;flex:1 1 170px}.mf-cg-actions button:disabled{opacity:.52;cursor:not-allowed}.mf-cg-card .mf-cg-secondary{background:transparent!important;color:var(--fg,#16425e)!important;border:1px solid var(--line,#cbd5e1)!important}.mf-cg-note{font-size:14px;line-height:1.85;color:var(--muted,#64748b);margin:10px 0 0!important}.mf-cg-message{font-size:15px;line-height:1.8;min-height:23px;margin-top:8px!important}.mf-cg-fallback{font-size:15px;line-height:1.7;width:100%;min-height:120px;resize:vertical;direction:rtl}.mf-cg-steps{border-top:1px solid var(--line,#e2e8f0);padding-top:12px;margin-top:14px;font-size:15px;line-height:2}.mf-cg-steps summary{font-weight:700;cursor:pointer;font-size:17px}.mf-cg-steps p{margin:8px 0!important}@media(max-width:590px){.mf-cg-card{padding:16px;border-radius:17px}.mf-cg-head h2{font-size:22px}.mf-cg-status{font-size:12px}.mf-cg-actions button{font-size:17px!important}}';
document.head.append(css);
const homeCard=document.createElement('section');
homeCard.className='mf-cg-card';
homeCard.setAttribute('aria-label','ChatGPT شخصی من');
homeCard.innerHTML='<div class="mf-cg-head"><span class="mf-cg-logo" aria-hidden="true">🔗</span><div><h2>ChatGPT شخصی من</h2><div class="mf-cg-sub">اختیاری · مخصوص حساب خودتان</div></div><span class="mf-cg-status" id="mf-cg-home-state">خاموش</span></div><p class="mf-cg-sub">با ChatGPT خودتان گفت‌وگو کنید و لینک پیش‌نویس تراکنش برای My Finance بگیرید.</p><div class="mf-cg-actions"><button type="button" id="mf-cg-start">راه‌اندازی ChatGPT من</button><button type="button" class="mf-cg-secondary" id="mf-cg-settings">راهنما و تنظیمات</button></div><p class="mf-cg-message" id="mf-cg-home-message" role="status" aria-live="polite"></p>';
const anchor=byId('finance-smart-assistant');
if(anchor)anchor.insertAdjacentElement('beforebegin',homeCard);else home.append(homeCard);
const settingsCard=document.createElement('section');
settingsCard.className='mf-cg-card';
settingsCard.setAttribute('aria-label','تنظیم اتصال ChatGPT شخصی');
settingsCard.innerHTML='<div class="mf-cg-head"><span class="mf-cg-logo" aria-hidden="true">🤖</span><div><h2>ChatGPT من</h2><div class="mf-cg-sub">فعال‌سازی مستقل توسط هر کاربر</div></div><span class="mf-cg-status" id="mf-cg-settings-state">خاموش</span></div><p class="mf-cg-sub">از حساب ChatGPT خودتان استفاده کنید؛ رمز، API Key یا اشتراک مشترک لازم نیست.</p><div class="mf-cg-actions"><button type="button" id="mf-cg-connect">آماده‌سازی و بازکردن ChatGPT</button><button type="button" class="mf-cg-secondary" id="mf-cg-summary">کپی خلاصه ۳۰ روزه برای تحلیل</button><button type="button" class="mf-cg-secondary" id="mf-cg-off">غیرفعال‌کردن</button></div><p id="mf-cg-settings-message" class="mf-cg-message" role="status" aria-live="polite"></p><textarea class="mf-cg-fallback" id="mf-cg-fallback" hidden readonly aria-label="متن آماده برای کپی دستی"></textarea><details class="mf-cg-steps"><summary>این قابلیت دقیقاً چگونه کار می‌کند؟</summary><p>۱. «آماده‌سازی» دستور استفاده را کپی می‌کند و ChatGPT شما را باز می‌کند. دستور را در گفتگو Paste کنید.</p><p>۲. تراکنش را با صدا یا متن بگویید؛ ChatGPT لینک پیش‌نویس My Finance می‌دهد و ثبت نهایی فقط با تأیید شما انجام می‌شود.</p><p>۳. برای تحلیل مالی می‌توانید خلاصه تجمیعی ۳۰ روزه را کپی و خودتان در ChatGPT ارسال کنید. نام، شماره حساب و ریزتراکنش‌ها در خلاصه نیست.</p><p><strong>توجه:</strong> این مسیر، انتقال دستی با تأیید کاربر است؛ اتصال خودکار OAuth/API نیست و ChatGPT به پایگاه داده شما دسترسی ندارد. خاموش‌کردن آن، پیام‌های قبلی ChatGPT را پاک نمی‌کند.</p></details>';
settings.insertAdjacentElement('beforebegin',settingsCard);
const namespace=()=>String(bridge.getPreferenceNamespace?.()||'');
const signedIn=()=>document.body.classList.contains('finance-unlocked')&&namespace().startsWith('my-finance-user-');
const enabled=()=>signedIn()&&mode.value==='chatgpt';
const status=(id,message)=>{const el=byId(id);if(el)el.textContent=message;};
function render(){
 const ready=signedIn(),on=enabled();
 for(const id of ['mf-cg-home-state','mf-cg-settings-state']){
  const el=byId(id);el.dataset.on=String(on);
  el.textContent=!ready?'ابتدا وارد شوید':on?'روش شخصی فعال':'خاموش';
 }
 byId('mf-cg-start').disabled=!ready;
 byId('mf-cg-connect').disabled=!ready;
 byId('mf-cg-summary').disabled=!ready;
 byId('mf-cg-off').disabled=!ready||!on;
 status('mf-cg-home-message',!ready?'برای استفاده ابتدا وارد حساب My Finance خودتان شوید.':on?'آماده استفاده؛ هیچ داده‌ای خودکار ارسال نمی‌شود.':'فقط با انتخاب شما فعال می‌شود.');
}
function switchMode(on){
 if(!signedIn())return false;
 mode.value=on?'chatgpt':'off';
 mode.dispatchEvent(new Event('change',{bubbles:true}));
 render();return true;
}
async function copy(text){
 try{
  if(!navigator.clipboard?.writeText)throw Error('clipboard unavailable');
  await navigator.clipboard.writeText(text);
  byId('mf-cg-fallback').hidden=true;return true;
 }catch(_){
  const el=byId('mf-cg-fallback');
  el.hidden=false;el.value=text;el.focus();el.select();return false;
 }
}
async function start(){
 if(!switchMode(true))return;
 const prompt=window.MyFinancePersonalAI?.linkInstruction?.();
 if(!prompt){status('mf-cg-settings-message','راهنما بارگذاری نشده؛ صفحه را به‌روزرسانی کنید.');return;}
 window.open('https://chatgpt.com/','_blank','noopener,noreferrer');
 const ok=await copy(prompt);
 if(!ok){window.financeNavGo?.('settings');settingsCard.scrollIntoView({behavior:'smooth',block:'start'});}
 const message=ok?'راهنما کپی شد؛ در ChatGPT شخصی خود Paste کنید.':'دستور در کادر تنظیمات آماده است؛ آن را دستی Copy کنید.';
 status('mf-cg-settings-message',message+' اگر ChatGPT باز نشد، chatgpt.com را باز کنید.');
 status('mf-cg-home-message',message);
}
function parsedDate(v){
 const s=String(v||'').slice(0,10);
 return /^\d{4}-\d{2}-\d{2}$/.test(s)?Date.parse(s+'T12:00:00Z'):NaN;
}
function financialSummary(){
 const rows=bridge.getData()?.tx||[],now=Date.now(),from=now-30*86400000,totals=new Map();
 for(const t of rows){
  const kind=String(t?.kind||t?.entry_type||'');
  if(kind!=='expense'&&kind!=='income')continue;
  const amount=Number(t.amount),date=parsedDate(t.date||t.occurredAt||t.occurred_on);
  if(!Number.isFinite(amount)||amount<=0||!Number.isFinite(date)||date<from||date>now+86400000)continue;
  const currency=String(t.currency||'IRT').slice(0,10);
  if(!totals.has(currency))totals.set(currency,{income:0,expense:0,count:0,categories:new Map()});
  const v=totals.get(currency);v[kind]+=amount;v.count++;
  if(kind==='expense'){
   const category=String(t.category||'سایر').slice(0,45).replace(/[\r\n]/g,' ');
   v.categories.set(category,(v.categories.get(category)||0)+amount);
  }
 }
 const lines=['لطفاً داده تجمیعی ۳۰ روز گذشته My Finance را تحلیل کن. هیچ تراکنشی ثبت نکن و واحدهای پول را با هم جمع نزن.'];
 for(const [currency,v] of totals){
  lines.push('ارز '+currency+': درآمد '+v.income+'؛ هزینه '+v.expense+'؛ خالص '+(v.income-v.expense)+'؛ تعداد تراکنش '+v.count);
  lines.push('دسته‌های هزینه: '+[...v.categories].sort((a,b)=>b[1]-a[1]).slice(0,5).map(x=>x[0]+' '+x[1]).join('؛ '));
 }
 if(!totals.size)lines.push('در این بازه تراکنش درآمد یا هزینه قابل گزارش پیدا نشد.');
 lines.push('سه insight و دو اقدام کاربردی پیشنهاد بده؛ داده غایب را حدس نزن.');
 return lines.join('\n');
}
byId('mf-cg-start').addEventListener('click',start);
byId('mf-cg-connect').addEventListener('click',start);
byId('mf-cg-settings').addEventListener('click',()=>{
 window.financeNavGo?.('settings');
 settingsCard.scrollIntoView({behavior:'smooth',block:'start'});
});
byId('mf-cg-off').addEventListener('click',()=>{
 if(!switchMode(false))return;
 byId('mf-cg-fallback').hidden=true;
 status('mf-cg-settings-message','روش ChatGPT در این دستگاه خاموش شد؛ هیچ مجوزی به پایگاه داده داده نشده بود.');
});
byId('mf-cg-summary').addEventListener('click',async()=>{
 if(!signedIn())return;
 const ok=await copy(financialSummary());
 status('mf-cg-settings-message',ok?'خلاصه تجمیعی کپی شد؛ فقط اگر مایلید، آن را در ChatGPT Paste کنید.':'خلاصه آماده است؛ در صورت تمایل آن را دستی Copy کنید.');
});
mode.addEventListener('change',render);
document.addEventListener('myfinance:rebound',()=>{byId('mf-cg-fallback').value='';byId('mf-cg-fallback').hidden=true;status('mf-cg-settings-message','');render();});
document.addEventListener('myfinance:unlocked',render);
document.addEventListener('visibilitychange',render);
render();
window.MyFinancePersonalChatGPT={render,financialSummary};
})();
