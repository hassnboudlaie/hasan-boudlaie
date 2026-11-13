/* Automated regression: isolated score engine + jsdom user journeys. */
"use strict";
const assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path");
const {JSDOM}=require("jsdom");
const root=__dirname,core=require("./app/leadership-journey-core.js");
function tickStateTests(){
 const C=core,start=1000000000;
 const fresh=C.newJourney("competitive",[],start);
 assert.equal(C.remaining(fresh,start),3600000);
 assert.equal(C.extensionCost(5),2);assert.equal(C.extensionCost(7),4);
 assert.equal(C.extensionCost(10),4);assert.equal(C.extensionCost(15),6);
 assert.equal(C.extensionCost(20),8);assert.equal(C.extensionCost(30),12);
 assert.equal(C.extensionCost(0),null);assert.equal(C.extensionCost(61),null);
 assert.equal(C.beginPause(fresh,start+1000),true);assert.equal(C.beginPause(fresh,start+2000),false);
 assert.equal(C.remaining(fresh,start+300000),3599000);
 assert.equal(C.pauseRemaining(fresh,start+100000),201000);
 assert.equal(C.syncPause(fresh,start+300100),false);
 assert.equal(C.syncPause(fresh,start+301000),true);
 assert.equal(fresh.pause.spentMs,300000);assert.equal(fresh.pause.since,0);
 assert.equal(C.remaining(fresh,start+3600000),300000);
 assert.equal(C.beginPause(fresh,start+3600000),false);
 assert.equal(C.expired(fresh,start+3900000),true);
 assert.equal(C.buyExtension(fresh,7,start+6000000),true);
 assert.equal(C.timePenalty(fresh),4);
 assert.equal(C.remaining(fresh,start+6000000),420000);
 assert.equal(C.buyExtension(fresh,10,start+7000000),true);
 assert.equal(C.timePenalty(fresh),8);
 assert.equal(C.remaining(fresh,start+7000000),600000);
 assert.equal(C.hintCost(fresh,0),0);assert.equal(C.grantHint(fresh,0,start+7000000),true);
 assert.equal(C.hintCost(fresh,1),0);assert.equal(C.grantHint(fresh,1,start+7000000),true);
 assert.equal(C.hintCost(fresh,2),2);assert.equal(C.grantHint(fresh,2,start+7000000),true);
 assert.equal(C.hintCost(fresh,2),0);assert.equal(C.hintPenalty(fresh),2);
 const step={options:[{points:8},{points:4}]};
 fresh.stage=0;assert.equal(C.submit(fresh,step,0,"پرسش کاربردی درباره تحویل",3),true);
 assert.equal(C.submit(fresh,step,1,"تلاش دوباره در همان مرحله",3),false);
 assert.equal(C.summary(fresh).net,0);
 assert.equal(C.restartSameAttempt(fresh),true);
 assert.equal(C.hintPenalty(fresh),2);assert.equal(C.timePenalty(fresh),8);
 assert.equal(fresh.pause.used,true);assert.equal(fresh.startedAt,start);
 assert.equal(C.newJourney("competitive",fresh.history,start+1).pause.used,false);
 assert.equal(C.switchToStudy(fresh),true);assert.equal(C.hintCost(fresh,9),0);
 const res=C.newJourney("competitive",[],start);
 for(let i=0;i<10;i++){res.stage=i;res.phase="step";assert.equal(C.submit(res,step,0,"یک تمرین مدیریتی مشخص",3),true)}
 assert.equal(C.complete(res,start+1000),true);
 assert.deepEqual(C.summary(res),{raw:100,timePenalty:0,hintPenalty:0,net:100,completed:10,coins:10,hints:0,extensions:0});
 assert.equal(res.history[0].net,100);assert.equal(C.complete(res,start+2000),false);
 assert.equal(C.badge(69),"برنزی");assert.equal(C.badge(70),"نقره‌ای");assert.equal(C.badge(85),"طلایی");
}
const file=p=>fs.readFileSync(path.join(root,"app",p),"utf8");
let now=2000000000;
function harness(snapshot){
 const dom=new JSDOM('<!doctype html><html lang="fa" dir="rtl"><body><div id="journeyView" class="view active"><div id="journeyRoot"></div></div><div id="journeyPassportSummary"></div></body></html>',{
  url:"https://example.test/hasan-boudlaie/sabanaft/app/#/journey",runScripts:"outside-only",pretendToBeVisual:true
 });
 const w=dom.window;w.Date.now=()=>now;w.confirm=()=>true;w.alert=(message)=>{throw new Error("Unexpected browser alert: "+message)};
 w.print=()=>{};w.scrollTo=()=>{};w.requestAnimationFrame=(f)=>f();
 if(snapshot)w.localStorage.setItem("sabanaft_leadership_journey_v1",snapshot);
 ["leadership-journey-core.js","leadership-journey-content.js","leadership-journey.js"].forEach(name=>w.eval(file(name)));
 const q=(sel)=>w.document.querySelector(sel),click=(sel)=>{const t=q(sel);assert.ok(t,"Missing button "+sel);t.click()},
 input=(sel,value,type="input")=>{const t=q(sel);assert.ok(t,"Missing input "+sel);t.value=value;t.dispatchEvent(new w.Event(type,{bubbles:true}))},
 snapshotNow=()=>w.localStorage.getItem("sabanaft_leadership_journey_v1");
 return {w,q,click,input,snapshot:snapshotNow,close:()=>dom.window.close()};
}
function stageSubmit(h,opt=0){
 h.click('input[name="ljDecision"][value="'+opt+'"]');
 h.input("#ljPractice","یک گفت‌وگوی مشخص با معیار قابل مشاهده و موعد توافق‌شده");
 h.input("#ljRating","3","change");
 h.click('[data-lj="submit"]');
 assert.ok(h.q(".lj-milestone"),"Submission must show milestone");
 assert.equal(h.q(".lj-fullreview"),null,"No answer key before final completion");
}
function flowTests(){
 let h=harness();
 assert.ok(h.q('[data-lj="startCompetitive"]'));h.click('[data-lj="startCompetitive"]');
 assert.ok(h.q("#ljClock"));assert.ok(h.q('[data-lj="hint"]'));
 h.click('[data-lj="hint"]');assert.equal(h.q(".lj-hint-grid"),null);h.click('[data-lj="confirmHint"]');
 assert.ok(h.q(".lj-hint-grid"));h.click('[data-lj="closeHint"]');
 assert.equal(JSON.parse(h.snapshot()).hintsUsed.length,1);
 h.click('[data-lj="hint"]');assert.ok(h.q(".lj-hint-grid"));h.click('[data-lj="closeHint"]');
 assert.equal(JSON.parse(h.snapshot()).hintsUsed.length,1,"Reopen must be free");
 h.click('[data-lj="pause"]');assert.ok(h.q("#ljPauseClock"));
 const paused=h.snapshot();h.close();
 now+=310000;
 h=harness(paused);assert.equal(JSON.parse(h.snapshot()).pause.since,0,"Pause auto-resumes after refresh");
 assert.equal(JSON.parse(h.snapshot()).pause.used,true);
 stageSubmit(h);h.click('[data-lj="advance"]');
 h.click('[data-lj="hint"]');h.click('[data-lj="confirmHint"]');h.click('[data-lj="closeHint"]');
 stageSubmit(h);h.click('[data-lj="advance"]');
 h.click('[data-lj="hint"]');assert.match(h.q("#ljModal").textContent,/۲ امتیاز/);
 h.click('[data-lj="confirmHint"]');h.click('[data-lj="closeHint"]');
 assert.equal(JSON.parse(h.snapshot()).hintsUsed.length,3);
 assert.equal(h.w.SabaJourneyCore.hintPenalty(JSON.parse(h.snapshot())),2);
 now+=3600000;
 h.w.dispatchEvent(new h.w.Event("hashchange"));
 assert.ok(h.q("#ljExtraMinutes"),"Overtime preserves current stage");
 h.input("#ljExtraMinutes","7");assert.match(h.q("#ljExtraCost").textContent,/۴/);
 h.click('[data-lj="extend"]');
 assert.equal(JSON.parse(h.snapshot()).extensions[0].penalty,4);
 now+=800000;
 h.w.dispatchEvent(new h.w.Event("hashchange"));
 assert.ok(h.q("#ljExtraMinutes"),"Second extension supported");
 h.input("#ljExtraMinutes","10");h.click('[data-lj="extend"]');
 assert.equal(h.w.SabaJourneyCore.timePenalty(JSON.parse(h.snapshot())),8);
 for(let i=2;i<10;i++){
   stageSubmit(h,i%4);h.click('[data-lj="advance"]');
   if(i===3||i===7){
     assert.ok(h.q(".lj-recovery"));now+=30001;
     h.w.dispatchEvent(new h.w.Event("hashchange"));
     h.click('[data-lj="breakContinue"]');
   }
 }
 assert.ok(h.q(".lj-result"),"Finished 10-step mission should show result");
 let s=JSON.parse(h.snapshot()),sum=h.w.SabaJourneyCore.summary(s);
 assert.equal(sum.raw-sum.hintPenalty-sum.timePenalty,sum.net);
 assert.equal(s.history[0].net,sum.net);
 assert.equal(h.q(".lj-fullreview").querySelectorAll(".lj-review-item").length,10);
 assert.ok(h.q('[data-lj="png"]'));
 assert.ok(h.q('[data-lj="print"]'));
 assert.ok(h.q("#journeyPassportSummary").textContent.includes("سوابق"));
 h.close();
 h=harness();h.click('[data-lj="startStudy"]');
 assert.ok(h.q(".lj-study-nav"));assert.equal(h.q("#ljClock"),null);
 h.click('[data-lj="hint"]');assert.ok(h.q(".lj-hint-grid"));h.click('[data-lj="closeHint"]');
 h.click('[data-lj="nextStudy"]');h.click('[data-lj="prev"]');
 assert.equal(h.q(".lj-number").textContent,"۱");
 const studySnapshot=h.snapshot();h.close();
 h=harness(studySnapshot);assert.ok(h.q(".lj-study-nav"));assert.equal(h.q("#ljClock"),null);
 h.close();
}
tickStateTests();flowTests();
console.log("PASS: Saba Naft leadership journey engine & jsdom journey user flows");
