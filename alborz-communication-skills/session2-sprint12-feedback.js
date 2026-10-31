/* Sprint 1–2 assessment data + shared renderer, reused in all ten techniques.
   Requires batch files and previous educational enrichments; must run before first-practice-polish and extended renderer. */
(function(){
"use strict";
const combined=Object.assign({},window.ALBORZ_SPRINT_QA_PART_A||{},window.ALBORZ_SPRINT_QA_PART_B||{});
const bank=window.ALBORZ_TECH_DATA||{};
for(let t=1;t<=10;t++){
 const set=combined[t];
 if(!Array.isArray(set)||set.length!==3)throw Error("Missing 3 questions for technique "+t);
 const mapped=set.map((z,i)=>{
  if(!z.q||!Array.isArray(z.options)||z.options.length!==3||!Number.isInteger(z.correct)||z.correct<0||z.correct>2||
     !Array.isArray(z.reasons)||z.reasons.length!==3||new Set(z.reasons).size!==3||
     z.options.some(v=>String(v).length<12)||z.reasons.some(v=>String(v).length<25))
    throw Error("Incomplete question or rationale for technique "+t+" question "+(i+1));
  return {q:z.q,options:z.options.slice(),correct:z.correct,optionReasons:z.reasons.slice(),why:z.reasons[z.correct],ask:z.ask};
 });
 if(t===1){
   Q.splice(0,Q.length,...mapped.map(z=>({q:z.q,opts:z.options,right:z.correct,optionReasons:z.optionReasons,
       ex:z.why,follow:z.ask})));
 }else{
   if(!bank[t])throw Error("Missing technique "+t);
   bank[t].quiz=mapped;
 }
}
function render(items,answers,action,e,first=false){
 const current=answers||{};
 return items.map((q,i)=>{
   const opt=first?q.opts:q.options,correct=first?q.right:q.correct;
   const reasons=q.optionReasons||[];
   const answer=current[i],selected=Number.isInteger(answer)&&answer>=0&&answer<3;
   const head='<div class="lab-quiz-question" role="group" aria-label="پرسش '+(i+1)+'"><h3>پرسش '+(i+1)+'</h3><p class="lead">'+e(q.q)+'</p>';
   const choices=opt.map((o,k)=>{
     const isThis=selected&&answer===k, correctChoice=k===correct;
     const css=isThis?(correctChoice?' selected selected-correct':' selected selected-incorrect'):'';
     return '<button type="button" class="answer lab-choice'+css+'" aria-pressed="'+isThis+
       '" data-quiz-index="'+i+'" data-option-index="'+k+'" onclick="'+action(i,k)+'">'+
       '<span class="lab-answer-index">'+(k+1)+'</span><span class="lab-answer-label">'+e(o)+'</span>'+
       (isThis?'<span class="lab-answer-mark" aria-hidden="true">'+(correctChoice?'✓':'×')+'</span>':'')+
       '</button>';
   }).join('');
   let feedback='';
   if(selected){
     const yes=answer===correct;
     const primary='<div class="lab-feedback-selected '+(yes?'correct':'incorrect')+'"><strong>'+
       (yes?'✅ انتخاب شما درست است.':'✖ این انتخاب بهترین پاسخ نیست.')+'</strong>'+
       '<p>'+e(reasons[answer])+'</p></div>';
     const others=opt.map((v,k)=>{
       if(k===answer)return '';
       const isRight=k===correct;
       return '<div class="lab-feedback-another '+(isRight?'right':'wrong')+'"><b>'+
          (isRight?'✓ گزینه '+(k+1)+' — پاسخ مناسب':'✕ گزینه '+(k+1)+' — چرا مناسب نیست؟')+
          '</b><p>'+e(reasons[k])+'</p></div>';
     }).join('');
     feedback='<div class="lab-feedback-result" role="status" aria-live="polite" aria-label="تحلیل پاسخ">'+primary+
       '<div class="lab-feedback-subtitle">بررسی دو گزینه دیگر</div><div class="lab-feedback-others">'+others+'</div>'+
       '<details class="accordion lab-feedback-practice"><summary>تمرین کوتاه</summary><div>'+
        e(first?q.follow:q.ask)+'</div></details></div>';
   }
   return '<section class="poll lab-poll lab-quiz-question-wrap">'+head+choices+feedback+'</div></section>';
 }).join('');
}
window.ALBORZ_QUIZ_UI={render,release:"sprint12-r1",totalQuestions:30};
window.ALBORZ_ASSESSMENT_READY=true;
})();