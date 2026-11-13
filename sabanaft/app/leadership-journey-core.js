/* Saba Naft — leadership journey state and scoring engine.
 * Browser-local learning only. Not tamper-proof or a formal HR assessment.
 * Separate from existing SabaGamification and original course storage.
 */
(function(root,factory){
  "use strict";
  var api=factory();
  if(typeof module!=="undefined"&&module.exports)module.exports=api;
  if(root)root.SabaJourneyCore=api;
})(typeof globalThis!=="undefined"?globalThis:this,function(){
  "use strict";
  var BASE_MS=3600000,PAUSE_MS=300000,MINUTE_MS=60000,VERSION=1;
  function integer(n){return typeof n==="number"&&Number.isInteger(n)&&Number.isFinite(n)}
  function newJourney(mode,history,now){
    if(mode!=="competitive"&&mode!=="study")throw Error("Invalid learning mode");
    now=integer(now)?now:Date.now();
    return {version:VERSION,mode:mode,attemptId:String(now),startedAt:mode==="competitive"?now:0,
      stage:0,phase:"step",answers:{},drafts:{},breaksDone:[],breakStartedAt:0,
      hintsUsed:[],pause:{used:false,since:0,spentMs:0},extensions:[],graceMs:0,
      finished:false,finishedAt:0,history:Array.isArray(history)?history.slice(-20):[]};
  }
  function pausedMs(s,now){
    var p=s.pause||{},used=Math.max(0,Math.min(PAUSE_MS,Number(p.spentMs)||0));
    return used+(p.since?Math.max(0,Math.min(PAUSE_MS-used,now-p.since)):0);
  }
  function remaining(s,now){
    now=integer(now)?now:Date.now();
    if(s.mode!=="competitive"||!s.startedAt||s.finished)return null;
    var ext=(s.extensions||[]).reduce(function(sum,g){return sum+(integer(g.minutes)&&g.minutes>0?g.minutes*MINUTE_MS:0)},0);
    return BASE_MS+ext+(s.graceMs||0)+pausedMs(s,now)-(now-s.startedAt);
  }
  function expired(s,now){var r=remaining(s,now);return r!==null&&r<=0}
  function syncPause(s,now){
    now=integer(now)?now:Date.now();
    if(s.pause&&s.pause.since&&now-s.pause.since>=PAUSE_MS-(s.pause.spentMs||0)){
      s.pause.spentMs=PAUSE_MS;s.pause.since=0;return true;
    }
    return false;
  }
  function beginPause(s,now){
    now=integer(now)?now:Date.now();syncPause(s,now);
    if(s.mode!=="competitive"||s.finished||s.pause.used||expired(s,now))return false;
    s.pause.used=true;s.pause.since=now;return true;
  }
  function resume(s,now){
    now=integer(now)?now:Date.now();
    if(!s.pause.since)return false;
    s.pause.spentMs=Math.min(PAUSE_MS,(s.pause.spentMs||0)+Math.max(0,now-s.pause.since));
    s.pause.since=0;return true;
  }
  function pauseRemaining(s,now){
    now=integer(now)?now:Date.now();
    if(!s.pause.since)return 0;
    return Math.max(0,PAUSE_MS-pausedMs(s,now));
  }
  function extensionCost(minutes){return integer(minutes)&&minutes>=1&&minutes<=60?Math.ceil(minutes/5)*2:null}
  function buyExtension(s,minutes,now){
    now=integer(now)?now:Date.now();
    if(s.mode!=="competitive"||s.finished||s.pause.since||!expired(s,now))return false;
    var cost=extensionCost(minutes);if(cost===null)return false;
    s.graceMs+=(Math.max(0,-remaining(s,now)));
    s.extensions.push({minutes:minutes,penalty:cost,at:now});return true;
  }
  function hintCost(s,id){
    if(s.mode==="study"||(s.hintsUsed||[]).includes(id))return 0;
    return (s.hintsUsed||[]).length<2?0:2;
  }
  function grantHint(s,id,now){
    if(!integer(id)||id<0||id>9)return false;
    if(s.mode==="competitive"&&(s.finished||expired(s,now)||s.pause.since))return false;
    if(!s.hintsUsed.includes(id))s.hintsUsed.push(id);
    return true;
  }
  function submit(s,stage,choice,practice,rating){
    if(s.mode!=="competitive"||s.finished||s.phase!=="step"||s.answers[s.stage])return false;
    if(!stage||!Array.isArray(stage.options)||!integer(choice)||!stage.options[choice])return false;
    practice=String(practice||"").trim();
    if(practice.length<12||practice.length>800)return false;
    if(!integer(rating)||rating<1||rating>5)return false;
    var decision=stage.options[choice].points;
    if(!integer(decision)||decision<0||decision>8)throw Error("Invalid decision points");
    s.answers[s.stage]={choice:choice,practice:practice,rating:rating,
      decision:decision,applied:2,points:decision+2};
    delete s.drafts[s.stage];s.phase="feedback";return true;
  }
  function rawScore(s){return Object.values(s.answers||{}).reduce(function(n,a){return n+(Number(a.points)||0)},0)}
  function hintPenalty(s){return Math.max(0,(s.hintsUsed||[]).length-2)*2}
  function timePenalty(s){return(s.extensions||[]).reduce(function(n,g){return n+(Number(g.penalty)||0)},0)}
  function summary(s){
    var raw=rawScore(s),time=timePenalty(s),hint=hintPenalty(s);
    return {raw:raw,timePenalty:time,hintPenalty:hint,net:Math.max(0,raw-time-hint),
      completed:Object.keys(s.answers||{}).length,coins:Object.keys(s.answers||{}).length,
      hints:(s.hintsUsed||[]).length,extensions:(s.extensions||[]).length};
  }
  function badge(score){return score>=85?"طلایی":score>=70?"نقره‌ای":"برنزی"}
  function complete(s,now){
    now=integer(now)?now:Date.now();
    if(s.mode!=="competitive"||s.finished||Object.keys(s.answers).length!==10)return false;
    var data=summary(s);
    s.finished=true;s.finishedAt=now;s.phase="end";s.history.push({
      attemptId:s.attemptId,finishedAt:now,raw:data.raw,
      timePenalty:data.timePenalty,hintPenalty:data.hintPenalty,net:data.net,badge:badge(data.net)
    });s.history=s.history.slice(-20);return true;
  }
  function restartSameAttempt(s){
    if(s.finished)return false;
    s.stage=0;s.phase="step";s.answers={};s.drafts={};s.breaksDone=[];s.breakStartedAt=0;
    /* startedAt, extensions, pause and hint allocation deliberately persist */
    return true;
  }
  function switchToStudy(s){
    if(s.mode==="study"||s.finished)return false;
    s.mode="study";s.phase="step";s.stage=Math.min(9,s.stage);
    s.breakStartedAt=0;s.pause.since=0;
    /* Already recorded competitive scores do not transfer to study credentials. */
    return true;
  }
  return {BASE_MS:BASE_MS,PAUSE_MS:PAUSE_MS,VERSION:VERSION,newJourney:newJourney,
    remaining:remaining,expired:expired,pausedMs:pausedMs,pauseRemaining:pauseRemaining,
    syncPause:syncPause,beginPause:beginPause,resume:resume,
    extensionCost:extensionCost,buyExtension:buyExtension,
    hintCost:hintCost,grantHint:grantHint,submit:submit,rawScore:rawScore,
    hintPenalty:hintPenalty,timePenalty:timePenalty,summary:summary,
    badge:badge,complete:complete,restartSameAttempt:restartSameAttempt,switchToStudy:switchToStudy};
});