/* Alborz / Session 2 r7: 4 clickable key insights + 4 indirect capstone dilemmas x 10 techniques */
(function(){
'use strict';
const bank=Object.assign({},window.ALBORZ_CAPSTONE_PART_A||{},window.ALBORZ_CAPSTONE_PART_B||{});
const keys=window.ALBORZ_KEY_COLLECTION||{};
for(let t=1;t<=10;t++){
 const q=bank[t],list=keys[t];
 if(!Array.isArray(list)||list.length!==4||new Set(list.map(x=>x.title)).size!==4)throw Error('Missing independent key messages #'+t);
 if(!Array.isArray(q)||q.length!==4)throw Error('Missing four capstone cases #'+t);
 q.forEach((item,i)=>{
  if(!item.scenario||!Array.isArray(item.options)||item.options.length!==3||new Set(item.options).size!==3||
   !Number.isInteger(item.correct)||item.correct<0||item.correct>2||!Array.isArray(item.reasons)||item.reasons.length!==3||
   new Set(item.reasons).size!==3||item.reasons.some(x=>x.length<45)||!Number.isInteger(item.habit)||
   item.habit===item.correct||!item.habitWhy||item.habitWhy.length<45)
  throw Error('Incomplete indirect capstone evidence #'+t+' question '+(i+1));
 });
}
window.ALBORZ_CAPSTONE_BANK=bank;
const previousRender=window.render,previousGo=window.go;
if(typeof previousRender!=='function'||typeof previousGo!=='function')throw Error('r6 shell missing');
const root=document.getElementById('root'),answers=Object.create(null);
let enhancing=false,queued=false;
const h=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','\'':'&#39;'}[c]));
const techId=()=>Math.min(10,Math.max(1,Number(window.__alborzActiveTech)||1));
const pageHead=(step,title,sub)=>'<div class="section-header enhanced-header"><h1>'+step+'. '+title+'</h1><p class="alborz-r7-subhead">'+sub+'</p></div>';
const nav=(last=false)=>'<div class="floatingnav lab-actions"><button class="navbtn" onclick="go(\'tech\')">→ فهرست ۶ مرحله</button>'+(last?'<button class="navbtn next" onclick="go(\'catalog\')">فهرست تکنیک‌ها ←</button>':'<button class="navbtn next" onclick="go(\'stage\',5)">مرحله بعد: کوییز ←</button>')+'</div>';
function messagePage(t){
 const items=keys[t].map((item,i)=>{
  const id='alborz-insight-'+t+'-'+i;
  return '<article class="alborz-key-tile"><button type="button" class="alborz-key-trigger" onclick="toggleAlborzMessage('+t+','+i+')" aria-expanded="false" aria-controls="'+id+'">'+
  '<span class="alborz-key-num">'+String(i+1).padStart(2,'0')+'</span><span class="alborz-key-name">'+h(item.title)+'</span><span class="alborz-key-arrow" aria-hidden="true">＋</span></button>'+
  '<div class="alborz-key-detail" id="'+id+'" hidden>'+
  '<p class="alborz-key-explain">'+h(item.explanation)+'</p>'+
  '<div class="alborz-key-example"><b>مثال متفاوت از محیط شعبه</b><p>'+h(item.example)+'</p></div>'+
  '<p class="alborz-key-transfer"><b>آنچه باید به کار ببریم:</b> '+h(item.transfer)+'</p></div></article>';
 }).join('');
 return '<section class="single-stage lab-page alborz-six-stage" data-alborz-r7="7-'+t+'">'+pageHead('💡 ۵','پیام‌های کلیدی','روی هر پیام بزنید تا توضیح و مثال کاربردی آن باز شود.')+
 '<section class="contentcard lab-card alborz-message-list"><div class="alborz-key-list">'+items+'</div></section>'+nav(false)+'</section>';
}
function quizPage(t){
 answers[t] ||= {};
 let done=0,correct=0;
 const items=bank[t].map((item,i)=>{
  const picked=answers[t][i],has=Number.isInteger(picked);
  if(has){done++;if(picked===item.correct)correct++;}
  const options=item.options.map((opt,k)=>{
   const selected=has&&picked===k;
   const css=selected?(k===item.correct?' is-correct':' is-incorrect'):'';
   const tag=has&&k===item.correct?'<span class="alborz-quiz-mark">✓</span>':(has&&selected?'<span class="alborz-quiz-mark">×</span>':'');
   return '<button type="button" class="alborz-quiz-choice'+css+'" aria-pressed="'+selected+'" onclick="answerAlborzCapstone('+t+','+i+','+k+')"><span class="alborz-quiz-index">'+String.fromCharCode(1575+k)+'</span><span>'+h(opt)+'</span>'+tag+'</button>';
  }).join('');
  let explanation='';
  if(has){
   const entries=item.reasons.map((why,k)=>{
    const isRight=k===item.correct,isChosen=k===picked;
    return '<div class="alborz-quiz-reason '+(isRight?'right':'wrong')+(isChosen?' chosen':'')+'"><strong>'+ (isRight?'✓ پاسخ مناسب‌تر':'✕ چرا این گزینه، با وجود ظاهر منطقی‌اش، بهترین نیست؟')+' — گزینه '+(k+1)+'</strong><p>'+h(why)+'</p></div>';
   }).join('');
   explanation='<div class="alborz-quiz-feedback" role="status" aria-live="polite"><p class="alborz-quiz-verdict">'+(picked===item.correct?'✓ پاسخ شما با منطق تکنیک همسوست.':'این انتخاب قابل‌فهم است؛ اما یک پاسخ دقیق‌تر وجود دارد.')+'</p>'+
   '<p class="alborz-quiz-rationale-head">تحلیل اختصاصی هر سه گزینه</p>'+entries+
   '<div class="alborz-habit-note"><b>⚠️ تله یک عادت رایج سازمانی — گزینه '+(item.habit+1)+'</b><p>'+h(item.habitWhy)+'</p></div></div>';
  }
  return '<section class="alborz-capstone-question" data-alborz-question="'+i+'"><h2>چالش '+(i+1)+' از ۴</h2><p class="alborz-quiz-scenario">'+h(item.scenario)+'</p><div class="alborz-quiz-choices" role="group" aria-label="انتخاب پاسخ چالش '+(i+1)+'">'+options+'</div>'+explanation+'</section>';
 }).join('');
 const progress='<p class="alborz-capstone-progress">پاسخ‌داده‌شده: '+done+' از ۴'+(done===4?' · پاسخ‌های منطبق با تکنیک: '+correct+' از ۴':'')+'</p>';
 return '<section class="single-stage lab-page alborz-six-stage" data-alborz-r7="5-'+t+'">'+pageHead('🧠 ۶','کوییز کاربردی','چهار تصمیم غیرمستقیم؛ هر سه گزینه ممکن است منطقی باشند. مناسب‌ترین را با توجه به شرایط انتخاب کنید.')+
 '<section class="contentcard lab-card alborz-capstone"><p class="alborz-reflection-lead">قرار نیست عبارت‌های جلسه را حفظ کنید. هر سؤال یک موقعیت تازه است؛ ابتدا تصمیم بگیرید و بعد، تحلیل هر سه گزینه و عادت رایج مرتبط را بخوانید.</p>'+progress+items+progress+'</section>'+nav(true)+'</section>';
}
function decorate(){
 if(enhancing||!root||!window.current)return;
 enhancing=true;
 try{
  if(current.page==='tech'){
   const grid=root.querySelector('.stage-grid');
   if(!grid)return;
   const cards=[...grid.querySelectorAll('.stage-card')];
   if(cards.length===5&&!grid.querySelector('[data-alborz-sixth]')){
    const sixth=cards[4].cloneNode(true);
    sixth.setAttribute('data-alborz-sixth','1');
    sixth.setAttribute('onclick',"go('stage',5)");
    sixth.setAttribute('aria-label','ورود به مرحله ۶، کوییز کاربردی');
    sixth.querySelector('.badge-digit').textContent='6';
    const icon=sixth.querySelector('.badge-emoji');if(icon)icon.textContent='🧠';
    sixth.querySelector('.body b').textContent='کوییز کاربردی';
    sixth.querySelector('.body small').textContent='چهار سؤال غیرمستقیم و تحلیل مستقل هر سه گزینه';
    grid.appendChild(sixth);
    const fifth=cards[4];
    fifth.querySelector('.body b').textContent='پیام‌های کلیدی';
    fifth.querySelector('.body small').textContent='چهار پیام کلیک‌پذیر با توضیح و مثال';
   }
  }
  if(current.page==='stage'){
   const t=techId(),stage=current.index;
   if(stage===7||stage===5){
    const marker=stage+'-'+t;
    if(!root.querySelector('[data-alborz-r7="'+marker+'"]'))root.innerHTML=stage===7?messagePage(t):quizPage(t);
   }else{
    const navButton=root.querySelector('.single-stage .floatingnav .navbtn');
    if(navButton)navButton.textContent=navButton.textContent.replace(/فهرست [۵۸] مرحله/g,'فهرست ۶ مرحله');
   }
  }
 }finally{enhancing=false;}
}
function schedule(){
 if(queued)return;
 queued=true;
 queueMicrotask(()=>{queued=false;decorate();});
}
window.render=function(){const value=previousRender.apply(this,arguments);decorate();return value;};
window.go=function(page,index){
 if(page==='stage'&&(index===5||index===6)){
  const value=previousGo('stage',7);
  current.index=5;
  window.render();
  return value;
 }
 return previousGo.apply(this,arguments);
};
window.toggleAlborzMessage=function(t,i){
 const group=root.querySelector('[data-alborz-r7="7-'+t+'"]');
 if(!group)return;
 const target=group.querySelector('#alborz-insight-'+t+'-'+i);
 if(!target)return;
 const wasClosed=target.hidden;
 group.querySelectorAll('.alborz-key-detail').forEach(panel=>panel.hidden=true);
 group.querySelectorAll('.alborz-key-trigger').forEach(button=>{button.setAttribute('aria-expanded','false');button.querySelector('.alborz-key-arrow').textContent='＋';});
 if(wasClosed){target.hidden=false;const trigger=group.querySelector('[aria-controls="alborz-insight-'+t+'-'+i+'"]');trigger.setAttribute('aria-expanded','true');trigger.querySelector('.alborz-key-arrow').textContent='−';}
};
window.answerAlborzCapstone=function(t,i,k){
 if(t!==techId()||!bank[t]?.[i]||k<0||k>2)return;
 answers[t] ||= {};
 answers[t][i]=k;
 const scroll=window.scrollY;
 window.render();
 window.scrollTo(0,scroll);
};
const observer=new MutationObserver(changes=>{if(changes.some(m=>m.type==='childList'&&[...m.addedNodes].some(n=>n.nodeType===1)))schedule();});
observer.observe(root,{childList:true,subtree:false});
window.ALBORZ_SIX_STAGE={release:'s12-r7-20261101',techniques:10,stages:60,insights:40,capstoneQuestions:40,capstoneOptionReasons:120,distinctWrongRationales:80};
window.ALBORZ_RELEASE={...window.ALBORZ_RELEASE,id:'s12-r7-20261101',stages:60,capstoneQuestions:40,insights:40};
document.documentElement.dataset.alborzRelease='s12-r7-20261101';
decorate();
})();