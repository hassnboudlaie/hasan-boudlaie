/* Context-aware case clarification in the browser; explicit human decision, no AI. */
(function(){
'use strict';
function esc(v){return String(v===undefined||v===null?'':v).replace(/[&<>"']/g,function(k){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[k];});}
var textQuestions={
  urgency:'تا چه زمانی باید درباره این موضوع تصمیم بگیرید؟',
  risk:'اگر اقدام اشتباه یا دیر انجام شود، چه پیامدی ممکن است رخ دهد؟',
  authority:'در این موضوع دقیقاً اختیار چه بخشی از تصمیم با شماست؟',
  capability:'فرد یا تیم برای اجرای تصمیم به چه دانشی یا حمایتی نیاز دارد؟',
  dependencies:'کدام بخش از پیشبرد موضوع به افراد یا واحدهای دیگر وابسته است؟'
};
function missing(c){return Object.keys(textQuestions).filter(function(k){return !c[k]||c[k]==='unknown';});}
function prompts(c,s){
 var p=[];
 if(c.risk==='high'||c.urgency==='critical'){p.push('اگر موضوع الزام ایمنی، حقوقی یا مقرراتی دارد، ابتدا مرجع مجاز و الزامات رسمی را مشخص کنید؛ ابزار بازاندیشی جایگزین آن نیست.');}
 if(c.authority==='formal')p.push('در تصمیمی که اختیار نهایی با مرجع رسمی است، کدام اقدام حمایتی یا گفت‌وگو همچنان در اختیار شماست؟');
 if(c.dependencies==='cross')p.push('چه کسی باید برای رفع وابستگی بین‌واحدی وارد گفت‌وگو شود؟');
 if(c.capability==='developing')p.push('آیا مسئله از ناآشنایی، فقدان فرصت تمرین یا محدودیت منابع ناشی می‌شود؟');
 if(!p.length&&missing(c).length)p.push('هنوز بعضی از ویژگی‌های موقعیت روشن نیستند؛ پیش از انتخاب نقش، فقط اطلاعات واقعاً اثرگذار را تکمیل کنید.');
 var context=s.context&&s.context.dimensions||{};
 if(Object.values(context).some(function(d){return d&&d.value;}))p.push('پروفایل Context قبلی در دسترس است؛ آیا همین موقعیت نسبت به بافت معمول شما استثنا محسوب می‌شود؟');
 return p.slice(0,2);
}
function render(s,c){
 var gaps=missing(c).slice(0,3);
 var contextCount=Object.values((s.context&&s.context.dimensions)||{}).filter(function(v){return v&&v.value;}).length;
 var roleReady=Object.values(s.mix||{}).every(function(v){return v!==null;})&&Object.values(s.mix||{}).reduce(function(a,b){return a+Number(b||0);},0)===10;
 var alerts=prompts(c,s);
 return '<section class="ux-case-clarity"><div class="ux-case-states"><span class="ux-case-state">'+(contextCount?'✓ '+contextCount+' بُعد از Context قبلی موجود':'◌ Context پایه اختیاری')+'</span><span class="ux-case-state">'+(roleReady?'✓ Leadership Idea موجود':'◌ Leadership Idea هنوز کامل نیست')+'</span></div>'+
 '<div class="ux-clarity-title"><h2>مسئله را روشن کنیم</h2><span>فقط همین کیس</span></div><p class="muted">هیچ اطلاعات ثابتی را دوباره نمی‌پرسیم. آنچه می‌دانید و آنچه هنوز فرض می‌کنید، از هم جدا کنید.</p>'+
 (alerts.length?alerts.map(function(p){return '<div class="ux-clarity-alert">◈ '+esc(p)+'</div>';}).join(''):'')+
 '<details class="ux-clarity-details" '+(!c.caseFact&&!c.caseAssumption&&!c.caseOutcome?'open':'')+'><summary>سه پرسش کوتاه برای تصمیم بهتر</summary><div class="ux-clarity-inputs">'+
 '<div class="field"><label for="clarity-caseFact">۱. چه چیزی واقعاً می‌دانید؟</label><textarea id="clarity-caseFact" data-clarity-field="caseFact" rows="2" maxlength="1200" placeholder="شاهد قابل بررسی، نه صرفاً برداشت من">'+esc(c.caseFact||'')+'</textarea></div>'+
 '<div class="field"><label for="clarity-caseAssumption">۲. چه فرض یا ابهامی هنوز باید بررسی شود؟</label><textarea id="clarity-caseAssumption" data-clarity-field="caseAssumption" rows="2" maxlength="1200" placeholder="چیزی که هنوز برای من نامطمئن است">'+esc(c.caseAssumption||'')+'</textarea></div>'+
 '<div class="field"><label for="clarity-caseOutcome">۳. موفقیت این تصمیم را با چه نشانه‌ای می‌سنجید؟</label><textarea id="clarity-caseOutcome" data-clarity-field="caseOutcome" rows="2" maxlength="1200" placeholder="یک نتیجه مشاهده‌پذیر، نه فقط رضایت از تصمیم">'+esc(c.caseOutcome||'')+'</textarea></div>'+
 '</div><small>پاسخ‌ها خودکار فقط در همین مرورگر ذخیره می‌شوند. از آوردن نام اشخاص یا اطلاعات محرمانه خودداری کنید.</small></details>'+
 (gaps.length?'<details class="ux-missing-facts"><summary>◷ اطلاعات موقعیتیِ هنوز نامشخص ('+gaps.length+' مورد مهم)</summary><div class="ux-missing-body">'+gaps.map(function(k){return '<p>• '+esc(textQuestions[k])+'</p>';}).join('')+'<button class="btn light sm" type="button" data-go="cases">تکمیل جزئیات موقعیت</button></div></details>':'')+
 '</section>';
}
document.addEventListener('input',function(e){var t=e.target;if(!t||!t.dataset.clarityField)return;var api=window.SabanaftLeadershipStudio&&window.SabanaftLeadershipStudio.commercialBridge;if(!api)return;var s=api.state(),c=api.currentCase&&api.currentCase(),key=t.dataset.clarityField;if(!c||!['caseFact','caseAssumption','caseOutcome'].includes(key))return;var old=c[key]||'';c[key]=String(t.value||'').slice(0,1200);if(api.save()===false){c[key]=old;api.toast('ذخیره ممکن نشد. از داده‌ها خروجی پشتیبان تهیه کنید.');}});
window.SabaCaseClarity={render:render,missing:missing};
})();