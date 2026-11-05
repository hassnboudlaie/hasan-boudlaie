/* Saba Naft — conversational, evidence-aware reflection without claiming model inference.
   Six contextual turns share the existing My Reflection journal. No remote transmission. */
(function(){
'use strict';
var roleNames={B:'Boss',C:'Coach',P:'Partner',E:'Enabler'};
var steps=[
 {key:'moment',label:'لحظه مهم',question:'چه اتفاق مشخصی افتاد که ارزش بازاندیشی دارد؟'},
 {key:'action',label:'رفتار من',question:'در آن لحظه چه گفتید یا انجام دادید؟'},
 {key:'impact',label:'اثر رفتار',question:'چه واکنش یا پیامدی مشاهده کردید؟ اگر نتیجه هنوز روشن نیست، همین را بگویید.'},
 {key:'evidence',label:'شواهد',question:'کدام بخش را واقعاً دیدید یا شنیدید و کدام بخش هنوز برداشت شخصی شماست؟'},
 {key:'learning',label:'یادگیری',question:'درباره برداشت خود از نقش رهبری چه چیزی آموختید یا نیاز دارید بازبینی کنید؟'},
 {key:'next',label:'اقدام بعدی',question:'در موقعیت بعدی، یک رفتار مشخص و قابل مشاهده که می‌خواهید امتحان کنید چیست؟'}
];
function fresh(){return {stage:0,caseId:'',role:'',answers:{moment:'',action:'',impact:'',evidence:'',learning:'',next:''},done:false};}
function clean(v,n){return typeof v==='string'?v.slice(0,n||1500):'';}
function esc(v){return String(v==null?'':v).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','\'':'&#39;'}[c]})}
function restore(s,raw){
 var p=raw&&raw.guidedDialogue,d=fresh();
 if(p&&typeof p==='object'){
  d.stage=Number.isInteger(p.stage)?Math.max(0,Math.min(steps.length,p.stage)):0;
  d.caseId=clean(p.caseId,55);d.role=roleNames[p.role]?p.role:'';
  steps.forEach(function(t){d.answers[t.key]=clean(p.answers&&p.answers[t.key],1500)});
  d.done=!!p.done;
 }
 s.guidedDialogue=d;
}
function bridge(){return window.SabanaftLeadershipStudio&&window.SabanaftLeadershipStudio.dialogueBridge;}
function prompt(s,d){
 var t=steps[d.stage],c=(s.cases||[]).find(function(x){return x.id===d.caseId;});
 if(!t)return '';
 if(d.stage===0&&c)return 'برای کیس «'+c.title+'»: '+t.question+' لازم نیست شرح کامل کیس را تکرار کنید.';
 if(d.stage===1){var mix=s.mix||{},r=Object.keys(roleNames).filter(function(k){return mix[k]!==null&&Number(mix[k])>0;}).sort(function(a,b){return Number(mix[b])-Number(mix[a]);})[0];return t.question+(r?' در نقش غالب شما '+roleNames[r]+' دیده می‌شود، ولی این الزاماً نقش همین موقعیت نیست.':'');}
 if(d.stage===2&&d.role)return 'با ایفای نقش '+roleNames[d.role]+'، '+t.question;
 if(d.stage===3)return t.question+' از برچسب‌زدن به نیت دیگران پرهیز کنید.';
 if(d.stage===4&&d.role)return 'وقتی نقش '+roleNames[d.role]+' را انتخاب کردید، '+t.question;
 return t.question;
}
function render(s){
 var d=s.guidedDialogue||fresh();var cs=s.cases||[],num=steps.length;
 var previous=steps.slice(0,d.stage).map(function(t){return '<div class="card" style="padding:12px;margin:9px 0;background:#f3f7fc"><small>'+esc(t.label)+'</small><p style="margin:3px 0">'+esc(t.question)+'</p><p style="margin:4px 0;color:#125d9d"><strong>پاسخ شما:</strong> '+esc(d.answers[t.key])+'</p></div>';}).join('');
 var context=(d.caseId?'<p class="small">این گفت‌وگو به یک Case قبلی متصل است؛ اطلاعات کیس جداگانه باقی می‌ماند.</p>':'');
 var form=d.stage<num?'<form id="guided-reflection-form">'+(d.stage===0?(cs.length?'<div class="field"><label for="gd-case">پیوند به کیس (اختیاری)</label><select id="gd-case"><option value="">موقعیت تازه</option>'+cs.map(function(c){return '<option value="'+esc(c.id)+'" '+(d.caseId===c.id?'selected':'')+'>'+esc(c.title)+'</option>';}).join('')+'</select></div>':''):'')+
 (d.stage===1?'<div class="field"><label for="gd-role">کدام نقش را واقعاً ایفا کردید؟ (اختیاری)</label><select id="gd-role"><option value="">هنوز مشخص نیست</option>'+Object.keys(roleNames).map(function(k){return '<option value="'+k+'" '+(d.role===k?'selected':'')+'>'+roleNames[k]+'</option>';}).join('')+'</select></div>':'')+
 '<div class="field"><label for="gd-answer">'+esc(prompt(s,d))+'</label><textarea id="gd-answer" maxlength="1500" rows="3" required placeholder="با زبان خودتان توضیح دهید؛ از نام و اطلاعات محرمانه کارکنان استفاده نکنید."></textarea></div>'+
 '<div class="form-actions"><button type="submit" class="btn">'+(d.stage===num-1?'ثبت تجربه در My Reflection ✓':'ادامه گفت‌وگو ←')+'</button>'+(d.stage>0?'<button type="button" class="btn light" data-gd-back>پرسش قبل</button>':'')+'</div></form>':
 '<div class="note">گفت‌وگو به پایان رسید. برای ذخیره، اقدام نهایی را ثبت کنید.</div>';
 return '<section class="card" aria-label="گفت‌وگوی بازاندیشی" style="margin-bottom:15px"><div class="title-row"><div><span class="kicker">CONVERSATIONAL REFLECTION · بدون اتصال AI</span><h2>بازاندیشی به شکل گفت‌وگو</h2></div><span class="pill">'+Math.min(d.stage+1,num)+' از '+num+'</span></div>'+
 '<p class="muted">راهنمای مرحله‌ای با پرسش‌های متناسب با کیس و نقش شما؛ فعلاً Rule-based است و جایگزین AI Coach یا کوچ انسانی نیست. متن فقط روی همین دستگاه ذخیره می‌شود.</p>'+
 context+previous+form+'<div class="form-actions"><button type="button" class="btn light sm" data-gd-reset>شروع گفت‌وگوی تازه</button></div>'+
 '<details style="margin-top:12px"><summary>پرسشنامه ساختاریافته قبلی</summary><p class="small">نسخه چهارمرحله‌ای قبلی حفظ شده و می‌توانید از آن نیز استفاده کنید.</p></details></section>';
}
function submit(e){
 if(!e.target||e.target.id!=='guided-reflection-form')return;
 e.preventDefault();e.stopImmediatePropagation();
 var b=bridge();if(!b)return;var s=b.state(),d=s.guidedDialogue||fresh(),t=steps[d.stage];if(!t)return;
 var el=document.getElementById('gd-answer'),val=clean(el&&el.value.trim(),1500);
 if(val.length<8){b.toast('لطفاً تجربه را در یک جمله روشن‌تر بیان کنید.');return;}
 if(d.stage===0){var linked=document.getElementById('gd-case');d.caseId=linked?clean(linked.value,55):d.caseId;}
 if(d.stage===1){var role=document.getElementById('gd-role');d.role=role&&roleNames[role.value]?role.value:'';}
 var before=JSON.parse(JSON.stringify(d));d.answers[t.key]=val;d.stage++;
 if(d.stage<steps.length){
  if(!b.save()){s.guidedDialogue=before;b.toast('ثبت موقت موفق نبود؛ متن را نگه دارید.');return;}
  b.render();return;
 }
 var now=new Date(),r=s.daily||{draft:{},items:[]};if(!Array.isArray(r.items))r.items=[];
 var item={step:4,caseId:d.caseId,moment:'ordinary',event:d.answers.moment,role:d.role,action:d.answers.action,outcome:d.answers.impact,source:'self',evidence:d.answers.evidence,contextChanged:'unsure',lesson:d.answers.learning,next:d.answers.next,reviewDate:'',support:'self',id:'gdr'+now.getTime().toString(36)+Math.random().toString(36).slice(2,5),date:[now.getFullYear(),String(now.getMonth()+1).padStart(2,'0'),String(now.getDate()).padStart(2,'0')].join('-'),createdAt:now.toISOString()};
 r.items.push(item);s.daily=r;s.guidedDialogue=fresh();
 if(!b.save()){r.items.pop();s.guidedDialogue=before;b.toast('ذخیره نهایی انجام نشد؛ پاسخ‌ها حفظ شدند.');return;}
 b.toast('بازاندیشی در سوابق My Reflection ثبت شد.');b.render();
}
function click(e){
 var t=e.target.closest('[data-gd-reset],[data-gd-back]');if(!t)return;var b=bridge();if(!b)return;
 var s=b.state(),d=s.guidedDialogue||fresh(),previous=JSON.parse(JSON.stringify(d));
 if(t.hasAttribute('data-gd-reset')){if(d.stage>0&&!window.confirm('پیش‌نویس گفت‌وگو پاک شود؟'))return;s.guidedDialogue=fresh();}
 else {d.stage=Math.max(0,d.stage-1);}
 if(!b.save()){s.guidedDialogue=previous;b.toast('تغییر ذخیره نشد.');return;}b.render();
}
document.addEventListener('submit',submit,true);
document.addEventListener('click',click);
window.SabaGuidedReflection={fresh:fresh,restore:restore,render:render,steps:steps.length};
})();
