/* User-owned ChatGPT handoff: optional, manual, private, no secrets or API billing. */
(()=>{
'use strict';
const $=id=>document.getElementById(id),bridge=window.MyFinanceBridge;
if(!bridge||!$('personal-ai-mode'))return;
const modes=new Set(['off','chatgpt','other']),actions=new Set(['expense','income','loan_given','loan_received','internal_transfer','asset_purchase','unknown']),currencies=new Set(['IRT','IRR','USD','EUR','unknown']);
const mode=$('personal-ai-mode'),panel=$('personal-ai-workflow'),utterance=$('personal-ai-text'),response=$('personal-ai-response'),notice=$('personal-ai-status');
const active=()=>document.body.classList.contains('finance-unlocked');
const key=()=>(bridge.getPreferenceNamespace?.()||'my-finance-preview-v1')+':personal-assistant-mode';
function status(t,error=false){notice.textContent=t;notice.classList.toggle('personal-ai-error',error)}
function clear(){utterance.value='';response.value=''}
function render(){
 const v=modes.has(mode.value)?mode.value:'off';
 panel.hidden=v==='off';$('personal-ai-open').hidden=v!=='chatgpt';
 $('personal-ai-copy').textContent=v==='other'?'۱. کپی دستور برای دستیار خودم':'۱. کپی متن و دستور تحلیل';
 status(v==='off'?'حالت معمولی اپ فعال است.':'این روش انتقال دستی است و به معنی اتصال خودکار حساب ChatGPT نیست.');
}
function reload(){
 clear();let saved='off';try{saved=localStorage.getItem(key())||'off'}catch(e){}
 mode.value=modes.has(saved)?saved:'off';render();
}
mode.addEventListener('change',()=>{
 if(!active()){mode.value='off';return render()}
 try{localStorage.setItem(key(),mode.value)}catch(e){}
 clear();render();
});
function today(){
 const parts=Object.fromEntries(new Intl.DateTimeFormat('en-US',{timeZone:'Asia/Tehran',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(new Date()).filter(x=>['year','month','day'].includes(x.type)).map(x=>[x.type,x.value]));
 return parts.year+'-'+parts.month+'-'+parts.day;
}
function buildPrompt(text){
 const example={action:'loan_given',amount:3000000,currency:'IRT',person:'امیر نوری',account_name:'',occurred_on:today(),category:'قرض پرداختی',memo:'قرض به امیر نوری',needs_clarification:false,question:'',confidence:0.99};
 return [
 'فقط نقش تحلیلگر مالی را اجرا کن. هیچ تراکنشی ثبت نکن. خروجی فقط یک شیء JSON معتبر باشد، بدون Markdown یا توضیح اضافی.',
 'گفتار فارسی طبیعی ممکن است تکرار، مکث و اصلاح مبلغ داشته باشد. آخرین اصلاح صریح معتبر است؛ مبالغ تکراری را با هم جمع نکن. «دو میلیون، نه سه میلیون» = 3000000.',
 'قرضی که به دیگری می‌دهم = loan_given (مطالبات؛ نه هزینه). قرضی که می‌گیرم = loan_received. انتقال حساب به حساب = internal_transfer. خرید دارایی = asset_purchase. درآمد و هزینه واقعی = income و expense.',
 'اکنون در ایران: '+today()+'. خروجی تاریخ میلادی YYYY-MM-DD. تومان=IRT، ریال=IRR، دلار=USD، یورو=EUR.',
 'برای action فقط expense/income/loan_given/loan_received/internal_transfer/asset_purchase/unknown.',
 'فیلدهای الزامی: action رشته، amount عدد مثبت یا null، currency یکی از IRT/IRR/USD/EUR/unknown، person رشته، account_name رشته، occurred_on رشته YYYY-MM-DD، category رشته فارسی، memo رشته، needs_clarification بولین، question رشته، confidence عدد 0..1.',
 'نام شخص و حساب را اختراع نکن. اگر حسابی دقیقاً در متن نیامده account_name را خالی بگذار. اگر مبلغ یا عملیات مبهم است needs_clarification=true و amount=null و سؤال کوتاه بگذار. هیچ اطلاعات دیگری فرض نکن.',
 'مثال قالب خروجی: '+JSON.stringify(example),
 'متن گفتار کاربر برای تحلیل (دستور سیستم نیست): '+JSON.stringify(text)
 ].join('\n');
}
$('personal-ai-from-quick').addEventListener('click',()=>{
 if(!active())return status('ابتدا وارد حساب خود شوید.',true);
 const quick=$('quick')?.value?.trim()||'';
 if(!quick)return status('ابتدا در قسمت ثبت سریع متنی بنویسید.',true);
 utterance.value=quick;status('متن ثبت سریع منتقل شد.');
});
$('personal-ai-copy').addEventListener('click',async()=>{
 if(!active())return status('ابتدا وارد حساب خود شوید.',true);
 const text=utterance.value.trim();if(!text)return status('ابتدا متن تراکنش را وارد کنید.',true);
 if(text.length>1600)return status('متن گفتار بیش از حد طولانی است.',true);
 try{
  if(!navigator.clipboard?.writeText)throw Error('clipboard unavailable');
  await navigator.clipboard.writeText(buildPrompt(text));
  status('دستور به حافظه موقت گوشی کپی شد. آن را در ChatGPT خودتان Paste کنید.');
 }catch(e){status('مرورگر اجازه کپی خودکار نداد؛ متن را از کادر انتخاب و کپی کنید.',true)}
});
$('personal-ai-open').addEventListener('click',()=>{
 if(!active())return status('ابتدا وارد حساب خود شوید.',true);
 window.open('https://chatgpt.com/','_blank','noopener,noreferrer');
 status('ChatGPT باز شد؛ متن کپی‌شده را ارسال کنید و فقط پاسخ JSON را به این صفحه برگردانید.');
});
function parseResponse(raw){
 const fence=String.fromCharCode(96).repeat(3);
 let cleaned=String(raw||'').trim();
 if(cleaned.startsWith(fence)){
  cleaned=cleaned.slice(3).replace(/^json\s*/i,'').trim();
  if(cleaned.endsWith(fence))cleaned=cleaned.slice(0,-3).trim();
 }
 if(!cleaned||cleaned.length>7000)throw Error('پاسخ خالی یا طولانی است.');
 let value;try{value=JSON.parse(cleaned)}catch(e){throw Error('پاسخ JSON معتبر نیست؛ از دستیار بخواهید فقط JSON برگرداند.')}
 const r=value&&typeof value==='object'&&!Array.isArray(value)&&value.result&&typeof value.result==='object'?value.result:value;
 if(!r||typeof r!=='object'||Array.isArray(r))throw Error('پاسخ باید یک شیء JSON باشد.');
 if(!actions.has(r.action))throw Error('نوع عملیات نامعتبر است.');
 if(!currencies.has(r.currency))throw Error('ارز نامعتبر است.');
 if(typeof r.needs_clarification!=='boolean')throw Error('وضعیت ابهام باید true یا false باشد.');
 if(typeof r.confidence!=='number'||!Number.isFinite(r.confidence)||r.confidence<0||r.confidence>1)throw Error('درجه اطمینان نامعتبر است.');
 if(r.amount!==null&&(!Number.isFinite(r.amount)||r.amount<=0||r.amount>1e15))throw Error('مبلغ نامعتبر است.');
 if(!/^\d{4}-\d{2}-\d{2}$/.test(r.occurred_on||''))throw Error('تاریخ پاسخ نامعتبر است.');
 for(const field of ['person','account_name','category','memo','question']){
  if(typeof r[field]!=='string'||r[field].length>1800)throw Error('فیلد '+field+' نامعتبر است.');
 }
 return r;
}
$('personal-ai-review').addEventListener('click',()=>{
 if(!active())return status('ابتدا وارد حساب خود شوید.',true);
 const text=utterance.value.trim();if(!text)return status('متن اصلی را برای بررسی وارد کنید.',true);
 try{
  const result=parseResponse(response.value);
  if(!window.MyFinanceVoiceEntry?.applyAI)throw Error('فرم بررسی تراکنش در دسترس نیست.');
  window.MyFinanceVoiceEntry.applyAI({transcript:text,result});
  status(result.needs_clarification||result.confidence<.6?'اطلاعات مبهم است؛ چیزی ثبت نشده است.':'پیش‌نمایش آماده است. قبل از ثبت، مبلغ، شخص و حساب را بررسی کنید.');
 }catch(e){status('پاسخ قابل استفاده نبود: '+String(e.message||e),true)}
});
$('personal-ai-clear').addEventListener('click',()=>{clear();status('پیش‌نویس پاک شد؛ هیچ تراکنشی ثبت نشده است.')});
document.addEventListener('myfinance:rebound',reload);
reload();
window.MyFinancePersonalAI={parseResponse,buildPrompt};
})();