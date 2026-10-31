/* Option-specific feedback for all 30 classroom questions. */
(function(){
'use strict';
const bank=window.ALBORZ_TECH_DATA||{},reasons=window.ALBORZ_WRONG_REASONS||{};
for(let id=1;id<=10;id++){
 const questions=id===1?Q:bank[id]?.quiz;
 if(!questions||questions.length!==3||!reasons[id]||reasons[id].length!==3)throw new Error('Quiz feedback missing for technique '+id);
 questions.forEach((q,i)=>{
  const correct=id===1?q.right:q.correct;
  const wrongIds=[0,1,2].filter(k=>k!==correct);
  const why=id===1?q.ex:q.why;
  const texts=reasons[id][i];
  if(texts.length!==2||!texts.every(Boolean))throw new Error('Missing wrong reasons '+id+'/'+i);
  const out=[null,null,null];out[correct]=why;wrongIds.forEach((k,j)=>out[k]=texts[j]);
  q.optionReasons=out;
 });
}
window.ALBORZ_QUIZ_EXPLANATIONS_READY=true;
})();