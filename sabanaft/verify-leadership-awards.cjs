/* Saba Naft: achievement gallery regression (browser-local, no score mutation). */
"use strict";
const assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path");
const {JSDOM}=require("jsdom");
const source=fs.readFileSync(path.join(__dirname,"app/leadership-awards.js"),"utf8");
function app(){
 const dom=new JSDOM('<!doctype html><html lang="fa" dir="rtl"><body>'+
  '<section id="passportView"><div id="journeyPassportSummary"></div><div id="gamificationDashboard"></div></section>'+
  '<section id="journeyView"><div id="journeyRoot"><div class="lj-shell"><header class="lj-banner"></header></div></div></section>'+
  '</body></html>',{url:"https://example.test/hasan-boudlaie/sabanaft/app/#/journey",
     runScripts:"outside-only",pretendToBeVisual:true});
 const w=dom.window;
 const base=[
 ["first-case",true],["three-decisions",false],["action",true],["followup",false],
 ["reflect",false],["context",false],["academy",true],["leadership",false]
 ];
 w.SabaGamification={collect:()=>({badges:base.map(([id,earned])=>({id,label:id,description:"شرح واقعی "+id,earned}))})};
 w.eval(source);
 return dom;
}
(async function(){
 const dom=app(),w=dom.window,A=w.SabaLeadershipAwards;
 assert.ok(A&&A.awards&&A.svg&&A.download&&A.render,"public visual-only API must load");
 let data=A.awards();
 assert.equal(data.steps.length,10);assert.equal(data.activity.length,8);assert.equal(data.medals.length,3);
 assert.equal(data.all.length,21);
 assert.equal(data.steps.filter(a=>a.earned).length,0,"initially no stage badge");
 assert.equal(data.activity.filter(a=>a.earned).length,3,"use preexisting activity evaluation");
 assert.equal(data.medals.filter(a=>a.earned).length,0);
 assert.ok(w.document.getElementById("sabaAwardCollection"));
 assert.equal(w.document.querySelectorAll(".sa-award-card").length,10,"initial tab shows 10 stages");
 assert.equal(w.document.querySelectorAll(".sa-strip-item").length,10);
 assert.equal(w.document.querySelectorAll(".sa-award-card button[data-sa-download]").length,0,"unearned stages are not downloadable");
 const competitive={version:1,mode:"competitive",history:[],answers:{0:{points:8}},stage:0};
 w.localStorage.setItem("sabanaft_leadership_journey_v1",JSON.stringify(competitive));
 assert.equal(A.awards().steps.filter(a=>a.earned).length,1,"completed decision + practice is the source of truth");
 let study={...competitive,mode:"study",history:[]};
 w.localStorage.setItem("sabanaft_leadership_journey_v1",JSON.stringify(study));
 assert.equal(A.awards().steps.filter(a=>a.earned).length,0,"study grants no competitive awards");
 const finished={...competitive,mode:"competitive",finished:true,history:[{net:91,badge:"طلایی"}]};
 w.localStorage.setItem("sabanaft_leadership_journey_v1",JSON.stringify(finished));
 data=A.awards();
 assert.equal(data.steps.filter(a=>a.earned).length,10,"completed history earns ten stage badges");
 assert.equal(data.medals.filter(a=>a.earned).length,1,"one actual medal per result");
 assert.equal(data.medals.find(a=>a.rank==="طلایی").earned,true);
 assert.equal(data.medals.find(a=>a.rank==="نقره‌ای").earned,false);
 A.render();
 assert.equal(w.document.querySelectorAll(".sa-award-card button[data-sa-download]").length,20);
 w.document.querySelector('[data-sa-filter="medal"]').click();
 assert.equal(w.document.querySelectorAll(".sa-award-card").length,3);
 assert.equal(w.document.querySelectorAll(".sa-award-card button[data-sa-download]").length,2);
 assert.match(A.svg(data.medals[2]),/^<svg xmlns="http:\/\/www.w3.org\/2000\/svg"/);
 assert.ok(A.svg(data.steps[0]).includes("linearGradient"));
 const keys=Object.keys(w.localStorage);
 assert.deepEqual(keys,["sabanaft_leadership_journey_v1"],"gallery must not create separate scoring storage");
 w.document.getElementById("journeyRoot").innerHTML=
  '<div class="lj-shell"><header class="lj-banner"></header><section class="lj-milestone"><div class="lj-earn"></div></section></div>';
 await new Promise(r=>w.setTimeout(r,10));
 assert.ok(w.document.querySelector(".sa-milestone-award"),"newly rendered milestone must show source-backed achievement");
 assert.equal(w.document.querySelectorAll(".sa-journey-strip .sa-strip-item").length,10);
 dom.window.close();
 console.log("Saba leadership awards: 21 assets, activity scoring, study exclusion, medal, SVG, milestone and no score writes PASS");
})().catch(e=>{console.error(e);process.exitCode=1});
