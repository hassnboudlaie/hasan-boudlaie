/* My Finance · Voice Entry (FA). Local parsing, explicit review, no unattended financial writes. */
(()=>{
'use strict';
const $=id=>document.getElementById(id),bridge=window.MyFinanceBridge;
if(!bridge||!$('voice-review'))return;
const words=['فروردین','اردیبهشت','خرداد','تیر','مرداد','شهریور','مهر','آبان','آذر','دی','بهمن','اسفند'];
const greg=new Intl.DateTimeFormat('en-US',{timeZone:'Asia/Tehran',year:'numeric',month:'2-digit',day:'2-digit'});
const jalali=new Intl.DateTimeFormat('en-US-u-ca-persian',{timeZone:'Asia/Tehran',year:'numeric',month:'numeric',day:'numeric'});
const fmt=new Intl.NumberFormat('fa-IR',{maximumFractionDigits:2});
const digits=s=>String(s??'').replace(/[۰-۹]/g,c=>String('۰۱۲۳۴۵۶۷۸۹'.indexOf(c))).replace(/[٠-٩]/g,c=>String('٠١٢٣٤٥٦٧٨٩'.indexOf(c)));
const norm=s=>digits(s).toLowerCase().replace(/ي|ى/g,'ی').replace(/ك/g,'ک').replace(/\u200c/g,' ').replace(/\s+/g,' ').trim();
const part=(formatter,d)=>Object.fromEntries(formatter.formatToParts(d).filter(x=>['year','month','day'].includes(x.type)).map(x=>[x.type,Number(x.value)]));
const isoDay=d=>{const p=part(greg,d);return p.year+'-'+String(p.month).padStart(2,'0')+'-'+String(p.day).padStart(2,'0')};
const todayDay=()=>isoDay(new Date());
function jalaliLabel(day){const d=new Date(day+'T12:00:00+03:30'),p=part(jalali,d);return String(p.day).replace(/\d/g,d=>'۰۱۲۳۴۵۶۷۸۹'[Number(d)])+' '+words[p.month-1]+' '+String(p.year).replace(/\d/g,d=>'۰۱۲۳۴۵۶۷۸۹'[Number(d)])}
const status=(message,alert=false)=>{const e=$('voice-status');e.textContent=message;e.classList.toggle('voice-alert',alert)};
function dateOffset(days){const d=new Date(todayDay()+'T12:00:00+03:30');d.setUTCDate(d.getUTCDate()+days);return isoDay(d)}
function resolvePersian(day,month,year){
 const now=new Date(),p=part(jalali,now);
 if(year&&(year<p.year-6||year>p.year+1))return null;
 // Scan dates; accepts historical backfill but never silently shifts an invalid date.
 const base=new Date(todayDay()+'T12:00:00+03:30').getTime();
 for(let i=0;i<=2400;i++){
  const d=new Date(base-i*86400000),j=part(jalali,d);
  if(j.day===day&&j.month===month&&(!year||j.year===year))return isoDay(d);
 }
 return null;
}
function extractDate(text){
 let clean=text,day=todayDay(),invalid=false,recognized=false;
 const slash=clean.match(/(?:^|\s)(1[34]\d{2})[\/\-](0?[1-9]|1[0-2])[\/\-](0?[1-9]|[12]\d|3[01])(?=\s|$|[،.])/);
 if(slash){const resolved=resolvePersian(Number(slash[3]),Number(slash[2]),Number(slash[1]));invalid=!resolved;recognized=true;if(resolved)day=resolved;clean=clean.replace(slash[0],' ')}
 else{
  const match=clean.match(new RegExp('(?:^|\\s)(\\d{1,2})\\s+('+words.join('|')+')(?:\\s+(1[34]\\d{2}))?(?=\\s|$|[،.])'));
  if(match){const resolved=resolvePersian(Number(match[1]),words.indexOf(match[2])+1,match[3]?Number(match[3]):null);invalid=!resolved;recognized=true;if(resolved)day=resolved;clean=clean.replace(match[0],' ')}
 }
 if(!recognized){
  if(/پریروز/.test(clean)){day=dateOffset(-2);clean=clean.replace(/پریروز/g,' ')}
  else if(/دیروز/.test(clean)){day=dateOffset(-1);clean=clean.replace(/دیروز/g,' ')}
  else clean=clean.replace(/امروز/g,' ');
 }
 clean=clean.replace(/ساعت\s*\d{1,2}(?::\d{1,2})?/g,' ');
 return {date:day,clean,invalid};
}
function parseMoney(text){
 let input=text.replace(/(\d)[٬،,](?=\d{3}(?:\D|$))/g,'$1').replace(/(\d)\.(?=\d{3}(?:\D|$))/g,'$1').replace(/٫/g,'.');
 input=input.replace(/(یک|یه|دو|سه|چهار|پنج|شش|هفت|هشت|نه|\d+)\s+میلیون\s+و\s+نیم/g,'$1 و نیم میلیون');
 let result=typeof window.parsePersianNumber==='function'?window.parsePersianNumber(input):null;
 return result&&Number.isFinite(result)&&result>0?result:null;
}
function categoryOf(t,type){
 if(type==='income'){
  if(/حقوق|دستمزد/.test(t))return 'حقوق و درآمد ثابت';
  if(/تدریس|کارگاه|آموزش/.test(t))return 'تدریس و آموزش';
  if(/مشاوره|حق المشاوره/.test(t))return 'مشاوره';
  if(/سود|اجاره دریافتی/.test(t))return 'سرمایه‌گذاری و اجاره';
  return 'سایر درآمدها';
 }
 if(/خیریه|صدقه|نذر|کمک مالی|کمک به خیریه|امور خیریه/.test(t))return 'خیریه و کمک‌های مردمی';
 if(/بنزین|گازوئیل|سوخت|اسنپ|تپسی|تاکسی|مترو|اتوبوس|کرایه ماشین|حمل و نقل/.test(t))return 'حمل‌ونقل و سوخت';
 if(/کله پاچه|صبحانه|ناهار|شام|رستوران|غذا|کافه|قهوه|سوپرمارکت|میوه|خواربار/.test(t))return 'خوراک و روزمره';
 if(/اجاره|کرایه خانه|شارژ ساختمان|آپارتمان/.test(t))return 'مسکن';
 if(/دارو|دکتر|پزشک|بیمارستان|آزمایشگاه|درمان|دندانپزشک|باشگاه/.test(t))return 'سلامت و ورزش';
 if(/قبض|اینترنت|موبایل|تلفن|شارژ سیم/.test(t))return 'قبوض و ارتباطات';
 if(/قسط|اقساط|بدهی|وام/.test(t))return 'اقساط و بدهی';
 if(/سفر|هتل|هواپیما|تفریح|سینما/.test(t))return 'سفر و تفریح';
 if(/آموزش|کتاب|دوره|کلاس/.test(t))return 'آموزش و حرفه‌ای';
 return 'سایر هزینه‌ها';
}
function detectAccount(text,accounts){
 const t=norm(text).replace(/[،,]/g,' ');
 // Match only a bank / wallet that belongs to the currently authenticated user.
 const candidates=(accounts||[]).filter(a=>{
  const name=norm(a.name);
  if(!name)return false;
  const bare=name.replace(/^بانک\s+/,'').trim();
  const full=textIncludesWord(t,name);
  const short=bare.length>=3&&textIncludesWord(t,bare);
  return full||short;
 });
 return candidates.length===1?candidates[0].id:null;
}
function textIncludesWord(haystack,needle){
 const pos=haystack.indexOf(needle);
 if(pos<0)return false;
 return (pos===0||!/[آ-ی\w]/.test(haystack[pos-1]))&&(pos+needle.length===haystack.length||!/[آ-ی\w]/.test(haystack[pos+needle.length]));
}
function loanRecipient(text){
 // Name can precede or follow the verb; do not turn "حساب بانک" into a person.
 let match=text.match(/(?:^|\s)(?:به|برای)\s+([آ-ی]+(?:\s+[آ-ی]+){0,3})(?=\s+(?:قرض|وام|دادم|داده|پرداختم|پرداخت|امروز|دیروز)|[،,.]|$)/u);
 if(!match)match=text.match(/(?:قرض\s*(?:دادم|داد|داده\s*شد|داده\s*ام|داده\s*ایم))\s+(?:به|برای)\s+([آ-ی]+(?:\s+[آ-ی]+){0,3})/u);
 if(!match)return '';
 return match[1].replace(/\s+(?:قرض|وام|دادم|داده|پرداختم|پرداخت|مثلا|مثلاً|امروز|دیروز|بانک|حساب|کارت).*$/u,'').trim().slice(0,70);
}
function hasNaturalCorrection(text){
 return /(?:^|\s)(?:نه|اصلاح\s*می\s*کنم|ببخشید|منظورم|درستش|اشتباه\s*گفتم|یعنی)(?=\s|$)/.test(text);
}
function parse(raw,accounts=[]){
 const original=String(raw||'').trim().slice(0,1600);
 if(!original)return {error:'ابتدا صحبت کنید یا متن تراکنش را بنویسید.'};
 const text=norm(original),temporal=extractDate(text);
 if(temporal.invalid)return {error:'تاریخ گفته‌شده نامعتبر است؛ آن را اصلاح کنید.'};
 if(hasNaturalCorrection(text))return {error:'در جمله خودتان مبلغ یا اطلاعات را اصلاح کرده‌اید؛ برای جلوگیری از ثبت رقم اشتباه، این متن باید با مدل هوشمند تحلیل شود. فعلاً مبلغ نهایی را در متن روشن بنویسید یا دستی تأیید کنید.',requiresAI:true};
 const account=detectAccount(text,accounts);
 const isLoan=/(?:قرض\s*(?:دادم|داد|داده\s*شد|داده\s*ام|داده\s*ایم|می\s*دهم)|وام\s*دادم|وام\s*داده\s*شد)/.test(text);
 const unsupported=/(?:بین\s+حساب|از\s+(?:حساب|بانک)\s+.+\s+به\s+(?:حساب|بانک)|قرض\s+گرفت|وام\s+گرفت|پول\s+پیش|رهن\s+خانه|خرید\s+(?:طلا|سکه|دلار|یورو|سهام)|سرمایه\s+گذاری|سرمایه‌گذاری)/.test(text);
 if(unsupported&&!isLoan)return {error:'این گفتار مربوط به انتقال، وام دریافتی یا سرمایه‌گذاری است؛ برای جلوگیری از ثبت اشتباه باید در بخش مخصوص خودش بررسی شود.'};
 const amount=parseMoney(temporal.clean);
 if(!amount)return {error:'مبلغ واضح تشخیص داده نشد. مثلاً «دو میلیون تومان به امیر نوری قرض دادم». هیچ موردی ثبت نشده است.'};
 const currency=/(?:usd|دلار)/.test(text)?'USD':/(?:eur|یورو)/.test(text)?'EUR':/ریال/.test(text)?'IRR':'IRT';
 if(isLoan){
  const person=loanRecipient(text),warnings=[];
  if(!person)warnings.push('نام شخص روشن نیست و باید قبل از ثبت وارد شود.');
  if(!account)warnings.push('حساب مبدأ مشخص نیست؛ بدون حساب، فقط طلب ثبت می‌شود و موجودی تغییر نمی‌کند.');
  return {entryType:'loan_given',person,amount,currency,account,date:temporal.date,memo:original,warnings};
 }
 if(/(?:قرض|وام|طلب)/.test(text))return {error:'نوع قرض یا طلب مشخص نیست؛ جمله را کامل‌تر بیان کنید.'};
 const income=/(?:درآمد|حقوق|دستمزد|حق\s*الزحمه|دریافت\s+کرد|واریز\s+شد|به\s+حسابم\s+آمد|پول\s+گرفتم|فروش\s+کردم|سود\s+گرفتم)/.test(text);
 const expense=/(?:هزینه|پرداخت|خرید|دادم|خرج|برداشتم|کارت\s+کشیدم|بنزین\s+زدم|کرایه\s+دادم)/.test(text);
 const kind=income&&!expense?'income':'expense',warnings=[];
 if(!income&&!expense)warnings.push('نوع تراکنش از گفتار قطعی نیست؛ لطفاً «هزینه» بودن آن را بررسی کنید.');
 if(/(?:حساب|بانک|کارت|کیف\s+پول)/.test(text)&&!account)warnings.push('حساب موردنظر شناسایی نشد؛ آن را انتخاب کنید.');
 return {entryType:'transaction',amount,currency,kind,category:categoryOf(text,kind),account,date:temporal.date,memo:original,scope:/(?:شرکت|کاری|پروژه|بیزنس)/.test(text)?'business':'personal',warnings};
}
let recognition=null,listening=false,hasSaved=false,voiceTimer=null,restartTimer=null,voiceToken=0,transcript='',voiceError='',hadAudio=false,voiceSession=null;
function setMic(active){
 const b=$('voice-mic');if(!b)return;
 b.setAttribute('aria-pressed',String(active));b.textContent=active?'■':'🎙';
 b.title=active?'پایان شنیدن و بررسی نتیجه':'شروع تشخیص گفتار';
 b.setAttribute('aria-label',active?'توقف شنیدن':'شروع ثبت صوتی');
}
function clearVoiceTimer(){
 if(voiceTimer!==null){clearTimeout(voiceTimer);voiceTimer=null}
 if(restartTimer!==null){clearTimeout(restartTimer);restartTimer=null}
}
function stopListening(message='',isError=false){
 ++voiceToken;clearVoiceTimer();
 const current=recognition;
 voiceSession=null;recognition=null;listening=false;setMic(false);
 if(current){try{current.abort()}catch(e){}}
 if(message)status(message,isError);
}
function keyboardDictation(){
 if(listening)stopListening();
 const input=$('quick');
 input.focus();
 try{input.setSelectionRange(input.value.length,input.value.length)}catch(e){}
 status('صفحه‌کلید گوشی را باز کنید، روی علامت میکروفون کیبورد بزنید و فارسی صحبت کنید. بعد از ظاهرشدن متن، «بررسی» را بزنید.');
}
function recognitionFallback(reason){
 return reason+' از دکمه «دیکته با کیبورد» زیر کادر استفاده کنید؛ سپس «بررسی» را بزنید.';
}
function clearPreview(){hasSaved=false;$('voice-review').hidden=true;$('voice-loan-review').hidden=true}
function accountOptions(selected){
 const a=bridge.getData().accounts||[];
 const list=$('voice-account');list.replaceChildren();
 for(const [id,label] of [['','بدون انتخاب حساب · موجودی حساب تغییر نمی‌کند'],...a.map(x=>[x.id,x.name+' ('+x.currency+')'])]){
  const o=document.createElement('option');o.value=id;o.textContent=label;list.append(o);
 }
 list.value=selected&&a.some(x=>x.id===selected)?selected:'';
}
function details(){
 const data=bridge.getData(),acct=data.accounts.find(a=>a.id===$('voice-account').value);
 const currency=$('voice-currency').value,amount=Number($('voice-amount').value);
 let stored=amount,unit=currency,problem='';
 if(acct&&acct.currency!==currency){
  if(currency==='IRT'&&acct.currency==='IRR'){stored=amount*10;unit='IRR'}
  else if(currency==='IRR'&&acct.currency==='IRT'){stored=amount/10;unit='IRT'}
  else problem='ارز مبلغ با ارز حساب انتخاب‌شده سازگار نیست. حساب دیگری انتخاب کنید یا ارز را اصلاح کنید.';
 }
 if(!Number.isFinite(amount)||amount<=0||!Number.isFinite(stored)||stored<=0)problem='مبلغ باید یک عدد مثبت و معتبر باشد.';
 if(!$('voice-category').value.trim())problem='دسته‌بندی را تکمیل کنید.';
 const when=$('voice-date').value;
 if(!/^\d{4}-\d{2}-\d{2}$/.test(when)||!Number.isFinite(new Date(when+'T12:00:00+03:30').getTime()))problem='تاریخ معتبر انتخاب کنید.';
 else if(when>todayDay())problem='ثبت تراکنش با تاریخ آینده مجاز نیست.';
 if(!document.body.classList.contains('finance-unlocked')||!window.MyFinanceCloud?.authenticated())problem='برای ثبت، ابتدا وارد حساب تأییدشده خود شوید.';
 return {acct,amount,stored,unit,problem,when};
}
function updateDetails(){
 if($('voice-review').hidden)return;
 const v=details(),out=$('voice-validation');
 out.textContent=v.problem||('پیش‌نمایش: '+($('voice-kind').value==='income'?'درآمد':'هزینه')+' '+fmt.format(v.stored)+' '+v.unit+(v.acct?' از حساب '+v.acct.name:' · بدون حساب مشخص')+' · '+jalaliLabel(v.when));
 out.classList.toggle('voice-alert',!!v.problem);
 $('voice-confirm').disabled=!!v.problem||hasSaved;
 const note=$('voice-account-note');
 note.textContent=v.acct&&v.unit!==$('voice-currency').value?'تبدیل مبلغ برای ثبت روی حساب '+v.acct.currency+': '+fmt.format(v.stored)+' '+v.unit:!v.acct?'بدون انتخاب حساب، موجودی هیچ حسابی تغییر نمی‌کند.':'';
}
function loanAccountOptions(selected){
 const list=$('voice-loan-account'),accounts=bridge.getData().accounts||[];
 list.replaceChildren();
 for(const [id,label] of [['','حساب نامشخص (فقط ثبت طلب؛ بدون تغییر موجودی)'],...accounts.map(a=>[a.id,a.name+' ('+a.currency+')'])]){
  const option=document.createElement('option');option.value=id;option.textContent=label;list.append(option);
 }
 list.value=selected&&accounts.some(a=>a.id===selected)?selected:'';
}
function previewLoan(parsed){
 hasSaved=false;
 $('voice-review').hidden=true;
 $('voice-loan-review').hidden=false;
 $('voice-loan-person').value=parsed.person||'';
 $('voice-loan-amount').value=parsed.amount;
 $('voice-loan-currency').value=parsed.currency;
 $('voice-loan-date').value=parsed.date;
 $('voice-loan-due').value='';
 $('voice-loan-notes').value=parsed.memo;
 loanAccountOptions(parsed.account);
 $('voice-loan-warnings').textContent=parsed.warnings.join(' ');
 status('مفهوم مالی: قرض پرداختی. پیش‌نمایش مطالبات آماده است؛ برای ثبت باید تأیید کنید.');
 updateLoanReview();
 $('voice-loan-review').scrollIntoView?.({behavior:'smooth',block:'nearest'});
 return parsed;
}
function validateLoan(){
 const person=$('voice-loan-person').value.trim(),amount=Number($('voice-loan-amount').value),
 currency=$('voice-loan-currency').value,accountId=$('voice-loan-account').value,date=$('voice-loan-date').value,
 due=digits($('voice-loan-due').value).trim();
 const account=bridge.getData().accounts.find(a=>a.id===accountId);
 let debit=amount,unit=currency,problem='';
 if(!person||person.length>150)problem='نام دریافت‌کننده قرض لازم است.';
 if(!(amount>0)||!Number.isFinite(amount))problem='مبلغ قرض نامعتبر است.';
 if(!['IRT','IRR','USD','EUR'].includes(currency))problem='ارز نامعتبر است.';
 if(account&&account.currency!==currency){
  if(currency==='IRT'&&account.currency==='IRR'){debit=amount*10;unit='IRR'}
  else if(currency==='IRR'&&account.currency==='IRT'){debit=amount/10;unit='IRT'}
  else problem='واحد پول حساب پرداخت‌کننده با مبلغ قرض سازگار نیست.';
 }
 if(due&&!/^(1[34]\d{2})\/(0[1-9]|1[0-2])$/.test(due))problem='سررسید را مانند ۱۴۰۵/۱۲ وارد کنید.';
 if(!/^\d{4}-\d{2}-\d{2}$/.test(date)||!Number.isFinite(new Date(date+'T12:00:00+03:30').getTime())||date>todayDay())problem='تاریخ پرداخت نامعتبر است.';
 if(!document.body.classList.contains('finance-unlocked')||!window.MyFinanceCloud?.authenticated())problem='برای ثبت، ابتدا وارد حساب شخصی شوید.';
 return {person,amount,currency,accountId,account,debit,unit,date,due,problem};
}
function updateLoanReview(){
 if($('voice-loan-review').hidden)return;
 const v=validateLoan(),e=$('voice-loan-validation');
 e.textContent=v.problem||('طلب از '+v.person+' · '+fmt.format(v.amount)+' '+v.currency+' · '+jalaliLabel(v.date)+
  (v.account?' · کسر '+fmt.format(v.debit)+' '+v.unit+' از '+v.account.name:' · بدون برداشت از حساب')+
  (v.due?' · سررسید: '+v.due:' · سررسید نامشخص'));
 e.classList.toggle('voice-alert',!!v.problem);$('voice-loan-confirm').disabled=!!v.problem||hasSaved;
}
function saveLoan(){
 if(hasSaved)return;
 const v=validateLoan();if(v.problem){status(v.problem,true);updateLoanReview();return}
 const note=$('voice-loan-notes').value.trim().slice(0,600);
 const caption='ثبت طلب از '+v.person+' به مبلغ '+fmt.format(v.amount)+' '+v.currency+
  (v.account?' و کسر '+fmt.format(v.debit)+' '+v.unit+' از '+v.account.name:' بدون کسر از حساب')+
  '؛ نه به‌عنوان هزینه.';
 if(!window.confirm(caption+'\nآیا تأیید می‌کنید؟'))return;
 const data=bridge.getData(),id=crypto.randomUUID(),paidAt=v.date===todayDay()?new Date().toISOString():new Date(v.date+'T12:00:00+03:30').toISOString();
 const claim={id,counterparty:v.person,principal:v.amount,expected:v.amount,currency:v.currency,termMonths:null,dueMonth:v.due,location:'',sector:'قرض پرداختی',notes:note,status:'pending',createdAt:paidAt,disbursementAccountId:v.accountId||null,disbursedAt:paidAt};
 const tx=v.account?{id:crypto.randomUUID(),account:v.account.id,kind:'investment',category:'پرداخت اصل قرض به '+v.person,currency:v.unit,
  amount:v.debit,status:'completed',scope:'personal',memo:'پرداخت قرض به '+v.person+' · '+note,date:paidAt,source:'voice',receivableId:id}:null;
 const entries=tx?[...(data.tx||[]),tx]:(data.tx||[]);
 hasSaved=true;$('voice-loan-confirm').disabled=true;
 try{
  bridge.commitData({...data,receivables:[...(data.receivables||[]),claim],tx:entries});
  $('quick').value='';clearPreview();
  status('✓ قرض در مطالبات ثبت شد.'+(tx?' خروج وجه نیز در حساب مبدأ ثبت شد؛ در گزارش هزینه حساب نمی‌شود.':' به‌دلیل نامشخص‌بودن حساب، موجودی تغییر نکرد.'));
 }catch(e){hasSaved=false;updateLoanReview();status('ثبت قرض ناموفق: '+String(e.message||e),true)}
}
function preview(raw){
 const current=bridge.getData();
 const parsed=parse(raw,current.accounts);
 if(parsed.error){clearPreview();status(parsed.error,true);return parsed}
 if(parsed.entryType==='loan_given')return previewLoan(parsed);
 $('voice-loan-review').hidden=true;
 hasSaved=false;
 $('voice-review').hidden=false;
 $('voice-amount').value=parsed.amount;
 $('voice-currency').value=parsed.currency;
 $('voice-kind').value=parsed.kind;
 $('voice-category').value=parsed.category;
 $('voice-scope').value=parsed.scope;
 $('voice-memo').value=parsed.memo;
 $('voice-date').value=parsed.date;
 accountOptions(parsed.account);
 $('voice-warnings').textContent=parsed.warnings.join(' ');
 status('متن دریافت شد. پیش از ثبت، مشخصات را بررسی و در صورت نیاز اصلاح کنید.');
 updateDetails();
 $('voice-review').scrollIntoView?.({behavior:'smooth',block:'nearest'});
 return parsed;
}
function previewFromInput(){return preview($('quick').value)}
function joinSpeech(previous,newText){
 const a=String(previous||'').trim(),b=String(newText||'').trim();
 if(!b)return a;
 if(!a)return b;
 if(a===b||a.endsWith(' '+b)||a.endsWith(b))return a;
 if(b.startsWith(a))return b;
 const left=a.replace(/[.،؛!؟\s]+$/g,''),right=b.replace(/^[.،؛!؟\s]+/g,'');
 const leftWords=left.split(/\s+/),rightWords=right.split(/\s+/);
 for(let n=Math.min(leftWords.length,rightWords.length,9);n>=1;n--){
  if(leftWords.slice(-n).join(' ')==rightWords.slice(0,n).join(' '))
   return left+' '+rightWords.slice(n).join(' ');
 }
 return left+' '+right;
}
function finishVoice(session,reason='',failed=false){
 if(!session||session.token!==voiceToken||voiceSession!==session)return;
 const all=joinSpeech(session.base,session.partial);
 ++voiceToken;clearVoiceTimer();
 const current=recognition;
 recognition=null;voiceSession=null;listening=false;setMic(false);
 if(current){try{current.abort()}catch(e){}}
 if(all.trim()){
  $('quick').value=all;
  preview(all);
  if(failed)status('گفتار کامل دریافت نشد؛ متن را بررسی و بخش ناقص را دستی تکمیل کنید.',true);
 }else status(reason||recognitionFallback('هیچ گفتاری به متن تبدیل نشد.'),true);
}
function start(){
 if(listening&&voiceSession){
  const session=voiceSession;
  finishVoice(session,'شنیدن متوقف شد و متنی دریافت نشد.',false);
  return;
 }
 const Speech=window.SpeechRecognition||window.webkitSpeechRecognition;
 if(!Speech){
  status(recognitionFallback('تشخیص گفتار در این مرورگر پشتیبانی نمی‌شود.'),true);
  return;
 }
 if(!document.body.classList.contains('finance-unlocked')){
  status('ابتدا وارد حساب شخصی خود شوید.',true);
  return;
 }
 const token=++voiceToken;
 const session={token,base:$('quick').value.trim(),partial:'',cycle:0,emptyCycles:0,errors:0,seconds:75,startedAt:Date.now()};
 voiceSession=session;
 listening=true;hadAudio=false;voiceError='';transcript=session.base;
 setMic(true);
 const renderLive=()=>{
  transcript=joinSpeech(session.base,session.partial);
  $('quick').value=transcript;
 };
 function beginCycle(){
  if(session!==voiceSession||token!==voiceToken||!listening)return;
  if(Date.now()-session.startedAt>75000||session.cycle>=12){
   finishVoice(session,'مهلت ضبط تمام شد؛ لطفاً دوباره تلاش کنید.',false);
   return;
  }
  session.cycle++;
  session.partial='';
  let resultsSeen=false,cycleError='', ended=false;
  const r=new Speech();
  recognition=r;
  r.lang='fa-IR';r.interimResults=true;r.maxAlternatives=1;
  // Android Chrome currently ignores continuous=true. Accumulate and restart short sessions.
  r.continuous=true;
  r.onstart=()=>{
   if(token!==voiceToken||recognition!==r)return;
   status(session.cycle===1?
    'در حال شنیدن… جمله را بگویید. وقتی تمام شد دوباره روی میکروفون بزنید.':
    'در حال شنیدن ادامه جمله… برای پایان دوباره روی میکروفون بزنید.');
  };
  r.onaudiostart=()=>{if(token===voiceToken)hadAudio=true};
  r.onspeechstart=()=>{
   if(token===voiceToken&&recognition===r)status('صدا دریافت شد؛ در حال تبدیل گفتار به متن…');
  };
  r.onresult=event=>{
   if(token!==voiceToken||recognition!==r)return;
   const pieces=[];
   for(let i=0;i<(event.results?.length||0);i++){
    const txt=event.results[i]?.[0]?.transcript?.trim();
    if(txt)pieces.push(txt);
   }
   if(!pieces.length)return;
   resultsSeen=true;
   session.partial=pieces.join(' ').trim();
   renderLive();
   status('متن دریافت‌شده: '+transcript+' · ادامه دهید یا برای پایان روی میکروفون بزنید.');
   // Do not stop on the first final result; that was truncating Android speech.
  };
  r.onnomatch=()=>{if(token===voiceToken)status('این بخش واضح نبود؛ می‌توانید ادامه دهید.',true)};
  r.onerror=event=>{
   if(token!==voiceToken||recognition!==r)return;
   cycleError=event.error||'unknown';
   voiceError=cycleError;
   const fatal=['not-allowed','service-not-allowed','audio-capture','language-not-supported','network'].includes(cycleError);
   if(fatal){
    const reason={
     'not-allowed':'دسترسی میکروفون رد شد.',
     'service-not-allowed':'سرویس تشخیص گفتار در مرورگر مجاز نیست.',
     'audio-capture':'میکروفون گوشی در دسترس نیست.',
     'language-not-supported':'پشتیبانی از فارسی در سرویس گفتار موجود نیست.',
     'network':'سرویس اینترنتی گفتار پاسخ نداد.'
    }[cycleError];
    finishVoice(session,recognitionFallback(reason),true);
   }else if(cycleError==='no-speech')status('صدایی در این بخش دریافت نشد؛ هنوز می‌توانید صحبت کنید.');
  };
  r.onend=()=>{
   if(ended||token!==voiceToken||session!==voiceSession||recognition!==r)return;
   ended=true;
   recognition=null;
   session.base=joinSpeech(session.base,session.partial);
   session.partial='';
   renderLive();
   if(resultsSeen)session.emptyCycles=0;
   else session.emptyCycles++;
   if(session.emptyCycles>=2){
    finishVoice(session,recognitionFallback('مرورگر در چند نوبت صدایی تشخیص نداد.'),true);
    return;
   }
   if(!listening||Date.now()-session.startedAt>75000){
    finishVoice(session,'ضبط پایان یافت.',false);return;
   }
   status(session.base?'بخش اول ثبت شد؛ در حال آماده‌سازی شنیدن ادامه…':'در حال تلاش برای شنیدن…');
   restartTimer=setTimeout(()=>{
    restartTimer=null;
    if(token!==voiceToken||voiceSession!==session)return;
    try{beginCycle()}catch(e){finishVoice(session,recognitionFallback('مرورگر اجازه ادامه خودکار ضبط را نداد.'),true)}
   },350);
  };
  try{r.start()}catch(e){finishVoice(session,recognitionFallback('تشخیص گفتار در این دستگاه شروع نشد.'),true)}
 }
 voiceTimer=setTimeout(()=>{
  if(token!==voiceToken||voiceSession!==session)return;
  finishVoice(session,recognitionFallback('مهلت ضبط (۷۵ ثانیه) تمام شد.'),false);
 },75000);
 status('در حال اتصال به میکروفون… فارسی صحبت کنید و برای پایان دوباره میکروفون را لمس کنید.');
 beginCycle();
}
/* Optional AI mode: record the whole voice message before analysis. Audio is never stored in localStorage. */
let aiRecorder=null,aiStream=null,aiChunks=[],aiBusy=false,aiTimer=null,aiCancel=false;
function aiStopStream(){
 if(aiTimer!==null){clearTimeout(aiTimer);aiTimer=null}
 if(aiStream){for(const track of aiStream.getTracks())track.stop();aiStream=null}
}
function aiClearRecorder(){
 aiStopStream();
 if(aiRecorder&&aiRecorder.state!=='inactive'){
  aiCancel=true;try{aiRecorder.stop()}catch(e){}
 }
 aiRecorder=null;aiChunks=[];
 setMic(false);
}
function aiAccounts(){return (bridge.getData().accounts||[]).map(a=>({name:a.name,currency:a.currency}))}
function applyAI(packet){
 const r=packet?.result,spoken=String(packet?.transcript||'').trim();
 if(!r||!spoken)throw Error('پاسخ قابل فهمی از هوش مصنوعی دریافت نشد.');
 $('quick').value=spoken;
 if(r.needs_clarification||!(Number(r.amount)>0)||!Number.isFinite(Number(r.amount))||r.confidence<0.60){
  clearPreview();
  status('نیاز به توضیح بیشتر: '+(r.question||'لطفاً مبلغ نهایی، نوع عملیات و نام طرف حساب را واضح بگویید.'),true);
  return r;
 }
 const currency=['IRT','IRR','USD','EUR'].includes(r.currency)?r.currency:null;
 if(!currency){clearPreview();status('واحد پول مشخص نیست؛ لطفاً آن را روشن کنید.',true);return r}
 const date=/^\d{4}-\d{2}-\d{2}$/.test(r.occurred_on)&&r.occurred_on<=todayDay()?r.occurred_on:todayDay();
 const accounts=bridge.getData().accounts||[];
 const match=accounts.filter(a=>norm(a.name)===norm(r.account_name));
 const account=match.length===1?match[0].id:null;
 if(r.action==='loan_given'){
  return previewLoan({
   entryType:'loan_given',person:String(r.person||'').slice(0,150),amount:Number(r.amount),currency,account,date,
   memo:spoken,warnings:account?[]:['حساب پرداخت‌کننده از گفتار مشخص نشده است؛ در صورت پرداخت از حساب، آن را انتخاب کنید.']
  });
 }
 if(r.action==='expense'||r.action==='income'){
  $('voice-loan-review').hidden=true;$('voice-review').hidden=false;hasSaved=false;
  $('voice-kind').value=r.action;
  $('voice-amount').value=Number(r.amount);
  $('voice-currency').value=currency;
  $('voice-category').value=String(r.category||'سایر').slice(0,150);
  $('voice-scope').value='personal';
  $('voice-memo').value=spoken;
  $('voice-date').value=date;
  accountOptions(account);
  $('voice-warnings').textContent=account?'':'در صورت پرداخت یا دریافت از حساب، حساب مربوط را انتخاب کنید.';
  status('✓ تحلیل هوشمند انجام شد. '+(r.action==='expense'?'هزینه':'درآمد')+' تشخیص داده شد؛ پیش‌نمایش را بررسی و تأیید کنید.');
  updateDetails();$('voice-review').scrollIntoView?.({behavior:'smooth',block:'nearest'});
  return r;
 }
 clearPreview();
 const destinations={internal_transfer:'انتقال و ارز',loan_received:'وام‌ها',asset_purchase:'دارایی‌ها',unknown:'نامشخص'};
 status('عملیات «'+(destinations[r.action]||r.action)+'» تشخیص داده شد و به‌عنوان هزینه ثبت نمی‌شود. '+(r.question||'برای ثبت، اطلاعات بخش مخصوص را کامل کنید.'),true);
 return r;
}
async function analyzeAIText(){
 const text=$('quick').value.trim();
 if(!text)return status('ابتدا متن تراکنش را وارد کنید.',true);
 if(aiBusy)return;
 if(!window.MyFinanceAI)return status('اتصال AI هنوز آماده نیست. می‌توانید ثبت متنی معمولی را استفاده کنید.',true);
 aiBusy=true;status('در حال تحلیل معنایی با هوش مصنوعی…');
 try{
  const packet=await window.MyFinanceAI.analyzeText(text,aiAccounts());
  applyAI(packet);
 }catch(e){status('تحلیل هوشمند انجام نشد: '+String(e.message||e)+' اطلاعاتی ثبت نشده است.',true)}
 finally{aiBusy=false}
}
function parseSelected(){
 if($('voice-ai-consent')?.checked)return analyzeAIText();
 return previewFromInput();
}
async function startAIRecording(){
 if(aiBusy){status('تحلیل فایل صوتی قبلی هنوز در حال انجام است.',true);return}
 if(aiRecorder&&aiRecorder.state==='recording'){
  status('ضبط تمام شد؛ در حال ارسال امن فایل صوتی برای تحلیل…');
  try{aiRecorder.stop()}catch(e){aiClearRecorder();status('ضبط پایان نیافت؛ دوباره تلاش کنید.',true)}
  setMic(false);return;
 }
 if(!window.MyFinanceAI)return status('سرویس هوش مصنوعی هنوز متصل نیست. از ورود متنی یا دیکته با کیبورد استفاده کنید.',true);
 if(!navigator.mediaDevices?.getUserMedia||typeof MediaRecorder==='undefined')
  return status('ضبط صوت کامل در این مرورگر در دسترس نیست؛ از دیکته با کیبورد استفاده کنید.',true);
 if(!document.body.classList.contains('finance-unlocked'))return status('ابتدا وارد حساب خود شوید.',true);
 try{
  aiStream=await navigator.mediaDevices.getUserMedia({audio:{echoCancellation:true,noiseSuppression:true}});
  const mime=MediaRecorder.isTypeSupported?.('audio/webm;codecs=opus')?'audio/webm;codecs=opus':undefined;
  const recorder=new MediaRecorder(aiStream,mime?{mimeType:mime}:undefined);
  aiRecorder=recorder;aiChunks=[];aiCancel=false;
  recorder.ondataavailable=e=>{if(e.data&&e.data.size)aiChunks.push(e.data)};
  recorder.onerror=()=>{aiClearRecorder();status('ضبط صدا ناموفق بود؛ میکروفون و مجوز آن را بررسی کنید.',true)};
  recorder.onstop=async()=>{
   const cancelled=aiCancel,parts=aiChunks.slice(),type=recorder.mimeType||'audio/webm';
   aiStopStream();aiRecorder=null;aiChunks=[];setMic(false);
   if(cancelled)return;
   const blob=new Blob(parts,{type});
   if(blob.size<500)return status('فایل صوتی خالی است؛ دوباره امتحان کنید.',true);
   if(blob.size>10_000_000)return status('فایل صوتی بزرگ است؛ گفتار کوتاه‌تری ضبط کنید.',true);
   aiBusy=true;status('در حال تبدیل صدای کامل به متن و تحلیل مالی با AI…');
   try{
    const packet=await window.MyFinanceAI.analyzeAudio(blob,aiAccounts());
    applyAI(packet);
   }catch(e){status('پردازش هوشمند انجام نشد: '+String(e.message||e)+' هیچ تراکنشی ثبت نشد.',true)}
   finally{aiBusy=false}
  };
  recorder.start(400);setMic(true);
  status('🎙 ضبط کامل صدا شروع شد؛ طبیعی صحبت کنید و خودتان را اصلاح کنید. برای پایان دوباره روی میکروفون بزنید.');
  aiTimer=setTimeout(()=>{if(recorder.state==='recording')recorder.stop()},75000);
 }catch(e){aiClearRecorder();status('اجازه ضبط صدا داده نشد یا میکروفون در دسترس نیست. از ورود متنی استفاده کنید.',true)}
}
function startSelected(){
 if($('voice-ai-consent')?.checked){if(listening)stopListening();return startAIRecording()}
 if(aiRecorder){aiClearRecorder();return}
 return start();
}
function save(){
 if(hasSaved)return;
 const v=details();if(v.problem){status(v.problem,true);updateDetails();return}
 const note=$('voice-memo').value.trim().slice(0,1000),category=$('voice-category').value.trim().slice(0,150);
 const kind=$('voice-kind').value,scope=$('voice-scope').value,account=$('voice-account').value||null;
 const desc=(kind==='income'?'درآمد':'هزینه')+' '+fmt.format(v.stored)+' '+v.unit+(v.acct?' · '+v.acct.name:' · بدون حساب مشخص')+' · '+jalaliLabel(v.when);
 if(!window.confirm('آیا این تراکنش ثبت شود؟\n'+desc+'\n'+category))return;
 const data=bridge.getData();
 const occurredAt=v.when===todayDay()?new Date().toISOString():new Date(v.when+'T12:00:00+03:30').toISOString();
 const item={id:crypto.randomUUID(),account,currency:v.unit,amount:v.stored,kind,status:'completed',scope,category,memo:note,date:occurredAt,source:'voice'};
 // No network credentials or private data are written to the public repository.
 hasSaved=true;$('voice-confirm').disabled=true;
 try{bridge.commitData({...data,tx:[...(data.tx||[]),item]});$('quick').value='';$('voice-review').hidden=true;
  status('✓ تراکنش با تأیید شما ثبت شد و برای همگام‌سازی امن آماده است.');}
 catch(e){hasSaved=false;updateDetails();status('ثبت انجام نشد: '+String(e.message||e),true)}
}
$('voice-mic').addEventListener('click',startSelected);
$('voice-keyboard').addEventListener('click',keyboardDictation);
$('voice-parse').addEventListener('click',parseSelected);
$('quick').addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();parseSelected()}});
$('voice-confirm').addEventListener('click',save);
$('voice-loan-confirm').addEventListener('click',saveLoan);
$('voice-loan-cancel').addEventListener('click',()=>{clearPreview();status('ثبت قرض لغو شد؛ هیچ داده‌ای ذخیره نشده است.')});
for(const id of ['voice-loan-person','voice-loan-amount','voice-loan-currency','voice-loan-date','voice-loan-account','voice-loan-due','voice-loan-notes'])
 $(id).addEventListener('input',updateLoanReview);
$('voice-cancel').addEventListener('click',()=>{clearPreview();status('پیش‌نمایش لغو شد؛ چیزی ثبت نشده است.')});
for(const id of ['voice-amount','voice-currency','voice-kind','voice-category','voice-account','voice-date','voice-scope','voice-memo'])
 $(id).addEventListener('input',updateDetails);
document.addEventListener('myfinance:rebound',()=>{stopListening();aiClearRecorder();clearPreview();accountOptions(null)});
document.addEventListener('visibilitychange',()=>{if(document.hidden&&listening)stopListening('تشخیص گفتار به دلیل خروج از اپ متوقف شد؛ چیزی ثبت نشده است.');if(document.hidden&&aiRecorder)aiClearRecorder()});
window.MyFinanceVoiceEntry={parse,previewFromInput,start,startSelected,parseSelected,applyAI,keyboardDictation};
setMic(false);
})();