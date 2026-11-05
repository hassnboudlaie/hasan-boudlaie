/* Chapter 5, hypothesis 6: deliberate communication of a leadership idea.
   Self-authored statements; no fabricated employee feedback or inferred alignment. */
(function(){
'use strict';
var keys=['statement','expectation','checkPrompt','reviewNote'];
function clean(v,max){return typeof v==='string'?v.trim().slice(0,max||900):'';}
function esc(v){return String(v==null?'':v).replace(/[&<>"']/g,function(ch){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch];});}
function fresh(){return {statement:'',expectation:'',checkPrompt:'',reviewNote:'',savedAt:''};}
function restore(s,raw){
 var src=raw&&raw.roleCommunication;var x=fresh();
 if(src&&typeof src==='object'){keys.forEach(function(k){x[k]=clean(src[k],900);});x.savedAt=clean(src.savedAt,40);}
 s.roleCommunication=x;
}
function bridge(){return window.SabanaftLeadershipStudio&&window.SabanaftLeadershipStudio.communicationBridge;}
function f(k,label,value,hint){return '<div class="field"><label for="rc-'+k+'">'+esc(label)+'</label><textarea id="rc-'+k+'" rows="2" maxlength="900" placeholder="'+esc(hint)+'">'+esc(value)+'</textarea></div>';}
function render(s){
 var v=s.roleCommunication||fresh();
 return '<details class="card" style="margin-top:16px" id="role-communication" '+(v.savedAt?'':'')+'>'+
 '<summary style="cursor:pointer;font-weight:800">✦ درک مشترک از نقش رهبری · گفت‌وگوی من با تیم</summary>'+
 '<p class="muted" style="margin-top:12px">فرضیه ۶: کافی نیست خودم بدانم چگونه می‌خواهم رهبری کنم؛ باید نقشم را روشن منتقل کنم و فهم مشترک را با گفت‌وگوی واقعی بررسی کنم.</p>'+
 '<form id="role-communication-form">'+
 f('statement','می‌خواهم شیوه رهبری خود را چگونه به تیم توضیح دهم؟',v.statement,'مثلاً در چه موقعیتی مستقیم تصمیم می‌گیرم و چه زمانی تصمیم را به تیم می‌سپارم؟')+
 f('expectation','انتظار متقابل و سهم مسئولیت کارکنان چیست؟',v.expectation,'چه اختیار، بازخورد یا پاسخ‌گویی دوطرفه‌ای باید روشن شود؟')+
 f('checkPrompt','چه پرسش بازی برای بررسی فهم طرف مقابل مطرح می‌کنم؟',v.checkPrompt,'می‌توانید با زبان خودتان بگویید از نقش من و اختیار خودتان چه برداشتی دارید؟')+
 f('reviewNote','چه چیزی را هنوز نمی‌دانم یا بعداً باید با خود فرد بررسی کنم؟',v.reviewNote,'برداشت خودم را با بازخورد واقعی اشتباه نگیرم')+
 '<div class="form-actions"><button type="submit" class="btn">ذخیره برنامه گفت‌وگو</button><button type="button" class="btn light" data-go="cases">بررسی یک موقعیت واقعی</button></div></form>'+
 '<p class="small">این فقط برنامه گفت‌وگو و بازاندیشی شخصی است. متن یا امتیاز به کارکنان ارسال نمی‌شود؛ تا وقتی گفت‌وگو و بازخورد واقعی نداشته‌اید، «فهم مشترک تأییدشده» نداریم.</p></details>';
}
function caseQuestions(s){
 var v=s&&s.roleCommunication;
 if(!v||(!v.statement&&!v.expectation&&!v.checkPrompt))return [];
 var q=[];
 if(v.statement)q.push('در پیام نقش رهبری خود نوشته‌اید: «'+v.statement.slice(0,170)+'». آیا این پیام را برای افراد همین موقعیت توضیح داده‌اید یا هنوز فقط نیت شماست؟');
 if(v.checkPrompt)q.push('برای بررسی درک مشترک، پرسش «'+v.checkPrompt.slice(0,170)+'» را در گفت‌وگو مطرح کرده‌اید؟ اگر بله، پاسخ واقعی چه بوده است؟');
 else q.push('از کجا می‌دانید همکاران از نقش و میزان اختیاری که برای خودشان قائلید، همان برداشتی را دارند که شما انتظار دارید؟');
 return q;
}
function reflectionQuestion(s){
 var v=s&&s.roleCommunication;
 if(!v||(!v.statement&&!v.checkPrompt))return '';
 return 'آیا در این موقعیت، درباره نقش و انتظارات دوطرفه گفت‌وگو شد؟ شواهد فهم یا ابهام طرف مقابل چه بود؟ اگر بازخورد واقعی نگرفته‌اید، آن را فقط فرض خودتان بدانید.';
}
function onSubmit(e){
 if(!e.target||e.target.id!=='role-communication-form')return;
 e.preventDefault();e.stopImmediatePropagation();
 var b=bridge();if(!b)return;var s=b.state(),old=JSON.parse(JSON.stringify(s.roleCommunication||fresh())),v=fresh();
 keys.forEach(function(k){var el=document.getElementById('rc-'+k);v[k]=clean(el&&el.value,900);});
 if(!v.statement.trim()){b.toast('ابتدا برداشت خود از نقش رهبری را در یک جمله روشن کنید.');return;}
 v.savedAt=new Date().toISOString();s.roleCommunication=v;
 if(!b.save()){s.roleCommunication=old;b.toast('ذخیره موفق نبود؛ متن را حفظ کنید و دوباره تلاش کنید.');return;}
 b.toast('برنامه گفت‌وگو ذخیره شد؛ درک مشترک فقط با بازخورد واقعی قابل بررسی است.');
 b.render();
}
document.addEventListener('submit',onSubmit,true);
window.SabaRoleCommunication={fresh:fresh,restore:restore,render:render,caseQuestions:caseQuestions,reflectionQuestion:reflectionQuestion};
})();
