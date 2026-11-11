(function(){
'use strict';
var bank=window.ALBRZ_DISCOVERY_DATA;
if(!bank){document.getElementById('saveStatus').textContent='خطا در بارگذاری بانک سؤال‌ها';return;}
var M=bank.modules,G=bank.groups,KEY='hb_alborz_training_discovery_v1';
var q=function(s){return document.querySelector(s);};
var fa=function(n){return Number(n).toLocaleString('fa-IR');};
function escapeHtml(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});}
function blank(){return {schema:1,fields:{org:'شرکت بیمه البرز'},modules:{},answers:{},notes:{},updatedAt:''};}
var state=blank(),timer=0,toastTimer=0;
try{var data=JSON.parse(localStorage.getItem(KEY)||'null');if(data&&data.schema===1){state={schema:1,fields:data.fields||{},modules:data.modules||{},answers:data.answers||{},notes:data.notes||{},updatedAt:data.updatedAt||''};}}catch(error){q('#saveStatus').textContent='ذخیره محلی در دسترس نیست';}
function moduleState(id){if(!state.modules[id])state.modules[id]={status:'',priority:'undecided',features:[],note:''};return state.modules[id];}
function save(){state.updatedAt=new Date().toISOString();try{localStorage.setItem(KEY,JSON.stringify(state));q('#saveStatus').textContent='ذخیره‌شده در همین دستگاه';}catch(error){q('#saveStatus').textContent='ذخیره ناموفق؛ فایل خروجی بگیرید';}}
function updated(){save();clearTimeout(timer);timer=setTimeout(refresh,180);}
function showToast(s){var el=q('#toast');el.textContent=s;el.hidden=false;clearTimeout(toastTimer);toastTimer=setTimeout(function(){el.hidden=true;},3500);}
function optionButton(id,v,label,chosen){return '<button type="button" data-set-status="'+v+'" data-id="'+id+'" data-status="'+v+'" aria-pressed="'+(chosen===v?'true':'false')+'">'+label+'</button>';}
function moduleCard(m,i){
 var s=moduleState(m.id),enabled=s.status==='yes'||s.status==='review',selected=Array.isArray(s.features)?s.features:[],out='';
 out+='<article class="module-card" data-module="'+m.id+'" data-status="'+escapeHtml(s.status)+'">';
 out+='<div class="module-top"><div class="module-index">'+String(i+1).padStart(2,'0')+'</div>';
 out+='<div class="module-name"><h3>'+escapeHtml(m.title)+'</h3><small>'+escapeHtml(m.en)+'</small><span class="status-count" data-feature-count="'+m.id+'">'+fa(selected.length)+' قابلیت انتخاب شده</span></div>';
 out+='<div class="module-options" role="group" aria-label="نیاز به '+escapeHtml(m.title)+'">';
 out+=optionButton(m.id,'yes','نیاز هست',s.status)+optionButton(m.id,'no','نیاز نیست',s.status)+optionButton(m.id,'review','نیازمند بررسی',s.status);
 out+='</div><button type="button" class="module-open" data-toggle-module="'+m.id+'" aria-expanded="false" aria-controls="details-'+m.id+'">جزئیات</button></div>';
 out+='<div class="module-details" id="details-'+m.id+'" hidden>';
 if(!enabled)out+='<p class="disabled-hint">برای انتخاب قابلیت‌ها، ابتدا «نیاز هست» یا «نیازمند بررسی» را انتخاب کنید.</p>';
 out+='<p class="module-intro">'+escapeHtml(m.prompt)+'</p><div class="feature-list">';
 m.features.forEach(function(f,j){out+='<label class="feature-item"><input type="checkbox" data-feature="'+m.id+'" value="'+j+'" '+(selected.indexOf(j)>=0?'checked ':'')+(enabled?'':'disabled')+'><span>'+escapeHtml(f)+'</span></label>';});
 out+='</div><div class="module-config"><label class="field-label">اولویت اجرا<select data-priority="'+m.id+'" '+(enabled?'':'disabled')+'>';
 [['undecided','هنوز تعیین نشده'],['mvp','ضروری در فاز اول (MVP)'],['phase2','فاز دوم'],['later','فازهای بعدی']].forEach(function(x){out+='<option value="'+x[0]+'" '+(s.priority===x[0]?'selected':'')+'>'+x[1]+'</option>';});
 out+='</select></label><label class="field-label module-note">توضیح آزاد، نیاز خاص یا مثال واقعی<textarea data-module-note="'+m.id+'" rows="3" '+(enabled?'':'disabled')+' placeholder="نیاز اختصاصی یا شرطی که در گزینه‌ها نیست...">'+escapeHtml(s.note||'')+'</textarea></label></div></div></article>';
 return out;
}
function renderModules(){q('#modulesList').innerHTML=M.map(moduleCard).join('');}
function questionMarkup(item){
 var id=item[0],label=item[1],type=item[2],opts=item[3]||[],value=state.answers[id],out='<div class="question">';
 out+='<label class="q-label">'+escapeHtml(label)+'</label>';
 if(type==='select'){
  out+='<select data-answer="'+id+'"><option value="">انتخاب پاسخ / نامشخص</option>';
  opts.forEach(function(o){out+='<option value="'+escapeHtml(o)+'" '+(value===o?'selected':'')+'>'+escapeHtml(o)+'</option>';});
  out+='</select>';
 }else if(type==='multi'){
  out+='<div class="checks">';
  opts.forEach(function(o,n){out+='<label><input type="checkbox" data-multi="'+id+'" value="'+n+'" '+(Array.isArray(value)&&value.indexOf(n)>=0?'checked':'')+'><span>'+escapeHtml(o)+'</span></label>';});
  out+='</div>';
 }else if(type==='long'){
  out+='<textarea data-answer="'+id+'" rows="3" placeholder="پاسخ تشریحی، نمونه واقعی یا توضیح آزاد...">'+escapeHtml(value||'')+'</textarea>';
 }else{
  out+='<input type="text" data-answer="'+id+'" value="'+escapeHtml(value||'')+'" placeholder="پاسخ / توضیح">';
 }
 if(type==='select'||type==='multi'){
  out+='<details class="answer-extra"><summary>افزودن توضیح آزاد یا گزینه «سایر»</summary><textarea rows="2" data-note="'+id+'" placeholder="توضیح یا پاسخ دیگری بنویسید...">'+escapeHtml(state.notes[id]||'')+'</textarea></details>';
 }
 return out+'</div>';
}
function renderQuestions(){q('#questionList').innerHTML=G.map(function(g,i){return '<div class="question-card"><details '+(i===0?'open':'')+'><summary><span>'+escapeHtml(g.title)+'<small>'+escapeHtml(g.en)+'</small></span></summary><div class="question-body">'+g.questions.map(questionMarkup).join('')+'</div></details></div>';}).join('');}
function fillIdentity(){document.querySelectorAll('[data-field]').forEach(function(input){input.value=state.fields[input.dataset.field]||'';});}
function hasAnswer(id){var x=state.answers[id];return Array.isArray(x)?x.length>0:String(x==null?'':x).trim()!=='';}
function getReport(){
 var out=['گزارش نیازسنجی سامانه جامع مدیریت آموزش بیمه البرز','Training Management System — Discovery & Cost Scoping','آخرین ویرایش: '+(state.updatedAt?new Date(state.updatedAt).toLocaleString('fa-IR'):'ثبت‌نشده'),'','مشخصات درخواست'];
 [['org','سازمان'],['department','واحد درخواست‌کننده'],['contact','تکمیل‌کننده'],['version','عنوان نسخه'],['problem','مسئله اصلی']].forEach(function(x){out.push(x[1]+': '+(String(state.fields[x[0]]||'').trim()||'نامشخص'));});
 out.push('','بخش اول — انتخاب ماژول‌ها و قابلیت‌ها');
 M.forEach(function(m,i){
  var s=state.modules[m.id]||{},status=s.status==='yes'?'موردنیاز':s.status==='no'?'نیاز نیست':s.status==='review'?'نیازمند بررسی':'پاسخ‌داده‌نشده';
  out.push('',''+(i+1)+'. '+m.title+' — '+status);
  if(s.status==='yes'||s.status==='review'){
   var names=(s.features||[]).map(function(j){return m.features[j];}).filter(Boolean);
   var pp={mvp:'ضروری در فاز اول (MVP)',phase2:'فاز دوم',later:'فازهای بعد',undecided:'هنوز مشخص نشده'};
   out.push('اولویت: '+(pp[s.priority]||'هنوز مشخص نشده'),'قابلیت‌های انتخاب‌شده:');
   if(names.length)names.forEach(function(n){out.push('  • '+n);});else out.push('  • هنوز انتخاب نشده');
   if(String(s.note||'').trim())out.push('توضیحات آزاد: '+s.note.trim());
  }
 });
 out.push('','بخش دوم — مشخصات فنی، اجرایی و مالی');
 G.forEach(function(g){
  out.push('',g.title);
  g.questions.forEach(function(x){
   var id=x[0],type=x[2],opts=x[3]||[],answer=state.answers[id];
   if(type==='multi'){answer=(Array.isArray(answer)?answer.map(function(j){return opts[j];}).filter(Boolean):[]).join('، ');}
   out.push('• '+x[1], '  '+(String(answer==null?'':answer).trim()||'هنوز مشخص نشده'));
   if(String(state.notes[id]||'').trim())out.push('  توضیح آزاد: '+state.notes[id].trim());
  });
 });
 out.push('','این گزارش مبنای تدوین Scope، طرح فنی، برنامه اجرا و برآورد هزینه است؛ مبلغ قطعی در آن محاسبه نشده است.');
 return out.join('\n');
}
function refresh(){
 var needed=M.filter(function(m){return (state.modules[m.id]||{}).status==='yes';}).length;
 var review=M.filter(function(m){return (state.modules[m.id]||{}).status==='review';}).length;
 var f=M.reduce(function(n,m){return n+((state.modules[m.id]||{}).features||[]).length;},0);
 var a=G.reduce(function(n,g){return n+g.questions.filter(function(x){return hasAnswer(x[0]);}).length;},0);
 var x=Object.values(state.fields).filter(function(v){return String(v||'').trim();}).length+Object.values(state.notes).filter(function(v){return String(v||'').trim();}).length+M.filter(function(m){return String((state.modules[m.id]||{}).note||'').trim();}).length;
 G.forEach(function(g){g.questions.forEach(function(item){if((item[2]==='text'||item[2]==='long')&&hasAnswer(item[0]))x++;});});
 [['#statModules',needed],['#statFeatures',f],['#statQuestions',a],['#countNeeded',needed],['#countFuture',review],['#countFeature',f],['#countOpen',x]].forEach(function(item){q(item[0]).textContent=fa(item[1]);});
 M.forEach(function(m){var el=document.querySelector('[data-feature-count="'+m.id+'"]');if(el)el.textContent=fa(((state.modules[m.id]||{}).features||[]).length)+' قابلیت انتخاب شده';});
 q('#reportPreview').textContent=getReport();
}
document.addEventListener('click',function(ev){
 var b=ev.target.closest('[data-set-status]');
 if(b){var id=b.dataset.id,s=moduleState(id);s.status=b.dataset.setStatus;renderModules();
 var card=document.querySelector('[data-module="'+id+'"]');if(s.status!=='no'){card.querySelector('.module-details').hidden=false;card.classList.add('is-open');card.querySelector('.module-open').setAttribute('aria-expanded','true');}updated();return;}
 b=ev.target.closest('[data-toggle-module]');
 if(b){var c=b.closest('.module-card'),details=c.querySelector('.module-details');details.hidden=!details.hidden;c.classList.toggle('is-open',!details.hidden);b.setAttribute('aria-expanded',String(!details.hidden));}
});
document.addEventListener('input',function(ev){
 var t=ev.target;
 if(t.hasAttribute('data-field'))state.fields[t.dataset.field]=t.value;
 else if(t.hasAttribute('data-module-note'))moduleState(t.dataset.moduleNote).note=t.value;
 else if(t.hasAttribute('data-note'))state.notes[t.dataset.note]=t.value;
 else if(t.hasAttribute('data-answer'))state.answers[t.dataset.answer]=t.value;
 else return;updated();
});
document.addEventListener('change',function(ev){
 var t=ev.target;
 if(t.hasAttribute('data-feature')){var s=moduleState(t.dataset.feature),v=Number(t.value),set=new Set(s.features||[]);if(t.checked)set.add(v);else set.delete(v);s.features=Array.from(set).sort(function(a,b){return a-b;});}
 else if(t.hasAttribute('data-priority'))moduleState(t.dataset.priority).priority=t.value;
 else if(t.hasAttribute('data-multi')){var id=t.dataset.multi,arr=new Set(Array.isArray(state.answers[id])?state.answers[id]:[]),n=Number(t.value);if(t.checked)arr.add(n);else arr.delete(n);state.answers[id]=Array.from(arr).sort(function(a,b){return a-b;});}
 else if(t.hasAttribute('data-answer'))state.answers[t.dataset.answer]=t.value;
 else return;updated();
});
q('#expandSelected').addEventListener('click',function(){document.querySelectorAll('.module-card').forEach(function(c){if(['yes','review'].indexOf(c.dataset.status)<0)return;var d=c.querySelector('.module-details');d.hidden=false;c.classList.add('is-open');c.querySelector('.module-open').setAttribute('aria-expanded','true');});});
q('#collapseAll').addEventListener('click',function(){document.querySelectorAll('.module-card').forEach(function(c){c.querySelector('.module-details').hidden=true;c.classList.remove('is-open');c.querySelector('.module-open').setAttribute('aria-expanded','false');});});
function download(name,content,mime){var blob=new Blob([content],{type:mime}),url=URL.createObjectURL(blob),anchor=document.createElement('a');anchor.href=url;anchor.download=name;document.body.appendChild(anchor);anchor.click();anchor.remove();setTimeout(function(){URL.revokeObjectURL(url);},5000);}
q('#downloadText').addEventListener('click',function(){download('alborz-training-needs-report.txt',getReport(),'text/plain;charset=utf-8');showToast('گزارش متنی آماده شد.');});
q('#downloadJson').addEventListener('click',function(){download('alborz-training-needs-backup.json',JSON.stringify(state,null,2),'application/json;charset=utf-8');showToast('نسخه پشتیبان JSON آماده شد.');});
q('#copyReport').addEventListener('click',async function(){var text=getReport();try{await navigator.clipboard.writeText(text);showToast('گزارش کامل کپی شد.');}catch(err){var ta=document.createElement('textarea');ta.value=text;document.body.appendChild(ta);ta.select();var ok=document.execCommand('copy');ta.remove();showToast(ok?'گزارش کپی شد.':'کپی امکان‌پذیر نیست؛ از دانلود گزارش استفاده کنید.');}});
q('#printReport').addEventListener('click',function(){refresh();window.print();});
q('#clearForm').addEventListener('click',function(){if(!confirm('پاسخ‌های این دستگاه پاک شوند؟ بهتر است ابتدا نسخه پشتیبان بگیرید.'))return;state=blank();save();renderModules();renderQuestions();fillIdentity();refresh();showToast('پرسشنامه پاک‌سازی شد.');});
q('#restoreFile').addEventListener('change',async function(ev){var file=ev.target.files&&ev.target.files[0];if(!file)return;
 try{var obj=JSON.parse(await file.text());if(!obj||obj.schema!==1||!obj.fields||!obj.modules||!obj.answers||!obj.notes)throw new Error('format');if(!confirm('پاسخ‌های فعلی با فایل انتخاب‌شده جایگزین شوند؟'))return;state={schema:1,fields:obj.fields,modules:obj.modules,answers:obj.answers,notes:obj.notes,updatedAt:''};save();renderModules();renderQuestions();fillIdentity();refresh();showToast('پاسخ‌ها بازیابی شدند.');}
 catch(err){showToast('فایل انتخاب‌شده معتبر نیست.');}finally{ev.target.value='';}
});
renderModules();renderQuestions();fillIdentity();refresh();
if('serviceWorker' in navigator)window.addEventListener('load',function(){navigator.serviceWorker.register('./sw.js',{scope:'./'}).catch(function(){});});
})();