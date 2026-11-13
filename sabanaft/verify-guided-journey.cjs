/* Functional regression for the in-place Saba Naft leadership learning journey.
   npm install jsdom@26 (test-only) — NODE_PATH=/path/to/node_modules node sabanaft/verify-guided-journey.cjs
*/
const assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path"),{JSDOM}=require("jsdom");
const dir=path.join(__dirname,"app"),read=p=>fs.readFileSync(path.join(dir,p),"utf8");
let assertions=0;const yes=(v,msg)=>{assert.ok(v,msg);assertions++},eq=(a,b,msg)=>{assert.equal(a,b,msg);assertions++};
const html=read("index.html");
yes(html.includes('id="journeyView"'),"journey mounted inside main app");
yes(html.includes('id="launchJourney"'),"journey launch from each session");
yes(html.includes("leadership-journey.js"),"engine wired");
yes(read("app.js").includes('page:"journey"'),"native hash route exists");
yes(read("sw.js").includes("./leadership-journey-content.js"),"offline entry included");
const output=read("leadership-journey-content.js");
function boot(saved){
 const d=new JSDOM(html,{url:"https://example.test/hasan-boudlaie/sabanaft/app/#/journey/1",runScripts:"outside-only",pretendToBeVisual:true});
 const w=d.window;w.confirm=()=>true;w.alert=()=>{};w.scrollTo=()=>{};
 if(saved)w.localStorage.setItem("sabanaft_leadership_journey_v1",saved);
 w.eval(fs.readFileSync(path.join(__dirname,"reflective-content.js"),"utf8"));
 w.eval(output);w.eval(read("leadership-journey.js"));
 const app=w.SabaLearningJourney,root=w.document.querySelector("#journeyView");
 root.classList.add("active");
 const button=a=>root.querySelector('[data-action="'+a+'"]');
 const click=a=>{let b=button(a);yes(b,"control "+a+" exists");b.click()};
 const submit=()=>{const f=root.querySelector("#lj-stage-form");yes(f,"stage form exists");f.dispatchEvent(new w.Event("submit",{bubbles:true,cancelable:true}))};
 const field=(name,val)=>{const e=root.querySelector('[name="'+name+'"]');yes(e,"field "+name+" exists");e.value=val;e.dispatchEvent(new w.Event("input",{bubbles:true}));e.dispatchEvent(new w.Event("change",{bubbles:true}))};
 const radio=(name,value)=>{const e=root.querySelector('[name="'+name+'"][value="'+value+'"]');yes(e,"radio "+name+"="+value+" exists");e.checked=true;e.dispatchEvent(new w.Event("change",{bubbles:true}))};
 return {w,d,app,root,click,submit,field,radio,button,run:()=>app.readRun(1)};
}
let x=boot();let {app,root}=x;
eq(app.overtimeCost(5),2,"5 minutes cost 2");
eq(app.overtimeCost(7),4,"7 minutes cost 4");
eq(app.overtimeCost(10),4,"10 minutes cost 4");
eq(app.overtimeCost(15),6,"15 minutes cost 6");
eq(app.overtimeCost(20),8,"20 minutes cost 8");
eq(app.overtimeCost(30),12,"30 minutes cost 12");
eq(app.overtimeCost(0),null,"zero minutes invalid");
eq(app.overtimeCost(1.5),null,"partial minute invalid");
x.click("startComp");
eq(x.run().mode,"competitive","competitive launch");
eq(x.run().stage,0,"starts at first stage");
x.click("openGuide");x.click("unlockGuide");
eq(x.run().hints.length,1,"first guide stored");
eq(app.score(x.run()).guide,0,"first guide free");
x.click("openGuide");yes(root.querySelector(".lj-guide-panel").textContent.includes("پرسش کوچینگ"),"same hint free reopening");
eq(x.run().hints.length,1,"reopening not charged");
x.click("closeGuide");
x.field("text","تعیین مسئول ارزیابی و مرز تأیید و اختیار انتشار گزارش");
x.submit();eq(x.run().scores[0],4,"first meaningful reflection credits four");
yes(root.textContent.includes("امتیاز این مرحله"),"per-stage score feedback");
yes(!root.textContent.includes("گزینه سازگارتر با بافت"),"no answer key mid-mission");
x.click("continue");eq(x.run().stage,1,"next stage");
x.click("openGuide");x.click("unlockGuide");eq(app.score(x.run()).guide,0,"second guide free");
x.click("closeGuide");x.field("text","در واحد من مسئول معیار کیفیت گزارش و زمان بازبینی مشخص است");x.submit();x.click("continue");
eq(x.run().stage,2,"third stage");
x.click("openGuide");yes(root.textContent.includes("۲ امتیاز"),"third hint displays cost first");x.click("unlockGuide");
eq(app.score(x.run()).guide,2,"third guide charged after consent");
x.click("closeGuide");
const first=x.w.SabaJourneyContent[1].cases[0],opt=first.options.findIndex(o=>o[2]===18);
x.radio("choice",opt);x.submit();
eq(x.run().scores[2],18,"contextual decision scoring");
yes(!root.textContent.includes("گزینه سازگارتر با بافت"),"choices still withheld");
x.click("continue");
const r=x.run();r.startedAt=Date.now()-3600001;app.render(1);
yes(!!root.querySelector("#lj-overtime-form"),"expiry presents extension without wiping responses");
eq(r.answers[2].choice,String(opt),"decision survived expiration");

let ext=root.querySelector("#lj-extension-min");ext.value="7";ext.dispatchEvent(new x.w.Event("input",{bubbles:true}));
yes(root.querySelector("#lj-extension-preview").textContent.includes("۴"),"overtime quote shown");
root.querySelector("#lj-overtime-form").dispatchEvent(new x.w.Event("submit",{bubbles:true,cancelable:true}));
eq(app.score(r).overtime,4,"seven-minute extension charged 4");
yes(app.left(r)>6*60000,"new extension starts at confirmation");
r.startedAt-=7*60000+3000;app.render(1);
yes(!!root.querySelector("#lj-overtime-form"),"repeat extension available");
root.querySelector("#lj-overtime-form").dispatchEvent(new x.w.Event("submit",{bubbles:true,cancelable:true}));
eq(app.score(r).overtime,6,"repeated extension cumulative");
x.click("pause");yes(r.pause.used,"single pause used");yes(r.pause.since>0,"pause active");
const frozen=app.left(r);yes(frozen>0,"pause preserves time");
const persisted=x.w.localStorage.getItem("sabanaft_leadership_journey_v1");
x.d.window.close();
let y=boot(persisted);let {app:app2,root:root2}=y;
eq(y.run().pause.used,true,"pause survives refresh");
eq(y.run().scores[2],18,"decision survives refresh");
eq(app2.score(y.run()).guide,2,"hint charge survives refresh");
eq(app2.score(y.run()).overtime,6,"extension charge survives refresh");
y.run().pause.since=Date.now()-300001;app2.render(1);eq(y.run().pause.since,0,"five-minute pause auto-ends");
eq(y.run().pause.used,true,"pause cannot be reused");
y.click("studySwitch");eq(y.run().mode,"study","switch to untimed learning");
eq(app2.score(y.run()).raw,0,"competitive score no longer awarded");
y.click("studyStep"); // stage navigation controls are data-action studyStep; first moves to step0
const stage6=root2.querySelector('[data-action="studyStep"][data-step="6"]');yes(stage6,"free navigation to any stage");stage6.click();eq(y.run().stage,6,"free navigation");
y.click("openGuide");yes(root2.querySelector(".lj-guide-panel").textContent.includes("تکنیک اجرایی"),"study hints free and visible");
y.d.window.close();
// Full 10-stage mission, with two recovery stations, book checks and final net scoring.
let z=boot();z.click("startComp");
function complete(i){
 const s=z.w.SABA_REFLECTIVE.sessions[0],r=z.run();
 eq(r.stage,i,"correct stage "+i);
 if([0,1,3,5,7].includes(i))z.field("text",i===7?"مدیر: برای این تصمیم چه معیاری داری؟ همکار: دو معیار کیفیت و زمان. مدیر: تا فردا کدام شاهد را جمع می‌کنی؟":"در این موقعیت از شواهد مشخص و حدود نقش و اختیار تصمیم استفاده می‌کنم");
 if(i===4){z.radio("self","3");z.field("text","در دو جلسه اخیر معیار تصمیم و شواهد تیم را با هم بررسی کردیم")}
 if(i===8){z.field("action","توافق درباره معیار تصمیم و مالکیت ارزیابی گزارش");z.field("when","با مسئولیت مدیر تا روز دوشنبه آینده");z.field("evidence","تعداد گزارش‌هایی که بدون ارجاع دوباره تأیید می‌شوند")}
 if([2,6].includes(i)){const j=i===2?0:1,c=z.w.SabaJourneyContent[1].cases[j];z.radio("choice",c.options.findIndex(o=>o[2]===18))}
 if(i===9)for(let j=0;j<2;j++)z.radio("check"+j,String(s.checks[j].correct));
 z.submit();
 if(i<9){yes(!z.root.querySelector(".lj-final-analysis"),"no early response review");z.click("continue")}
 if([3,6].includes(i)){yes(!!z.run().rest,"recovery station triggered");z.run().rest.startedAt-=31000;z.app.render(1);z.click("finishRest")}
}
for(let i=0;i<10;i++)complete(i);
eq(z.run().status,"completed","mission completed");
eq(app2.overtimeCost(7),4,"price rule unchanged");
eq(z.app.score(z.run()).raw,100,"raw score sums to 100");
eq(z.app.score(z.run()).net,100,"net score unpenalized");
yes(z.root.querySelector(".lj-final-analysis"),"answer analysis only after completion");
eq(z.app.getStore().history.length,1,"completed run archived");
eq(z.app.getStore().history[0].net,100,"history uses net score");
eq(z.app.getStore().history[0].badge,"طلایی","badge uses net");
z.w.eval(read("gamification.js"));eq(z.w.SabaGamification.collect({course:{contexts:[],activeContext:"none"},studio:{cases:[]}}).points.learning,100,"passport credits net completed mission");
z.click("restart");yes(z.root.textContent.includes("مأموریت رقابتی"),"restart returns mode picker");
eq(z.app.getStore().history.length,1,"restart preserves completed history");
z.d.window.close();
console.log("Saba Naft guided journey regression passed:",assertions,"assertions");
