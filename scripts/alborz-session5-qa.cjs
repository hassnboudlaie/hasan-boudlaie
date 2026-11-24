/* Standalone reproducible QA for Alborz Academy session 5; no browser or network dependency. */
const fs=require("node:fs"),vm=require("node:vm"),assert=require("node:assert/strict"),path=require("node:path");
const base=path.join(__dirname,"../alborz-communication-skills");
const source=n=>fs.readFileSync(path.join(base,n),"utf8");
const w={};
for(const n of ["session5-lessons.js","session5-cases.js"]){new vm.Script(source(n),{filename:n}).runInNewContext({window:w});}
new vm.Script(source("session5-employee-app.js"),{filename:"session5-employee-app.js"});
assert.equal(w.ALBORZ_S5_LESSONS.lessons.length,6);
assert.equal(w.ALBORZ_S5_CASES.cases.length,12);
const keys=[0,0,0,0];
w.ALBORZ_S5_CASES.cases.forEach((c,i)=>{
 assert.equal(c.skill,Math.floor(i/2),"skill index aligns with paired scenarios");
 assert.equal(c.opts.length,4,"four options per scenario");
 assert.equal(c.checks.length,3,"three observer criteria");
 assert.equal(c.before.length,6,"baseline: three turns per speaker");
 assert.equal(c.after.length,6,"improved: three turns per speaker");
 for(const stage of ["before","after"]){
   const dialogue=c[stage];
   const speakers=dialogue.map(line=>line.split(":",1)[0].trim());
   const roles=[...new Set(speakers)];
   assert.equal(roles.length,2,`case ${i+1} ${stage} must have two active speakers`);
   assert.ok(roles.every(r=>speakers.filter(s=>s===r).length===3),`case ${i+1} ${stage}: three turns each`);
   assert.ok(speakers.every((s,j)=>j===0||s!==speakers[j-1]),`case ${i+1} ${stage}: speakers alternate`);
   assert.ok(dialogue.every(line=>line.length>=65),`case ${i+1} ${stage}: each turn is substantial`);
 }

 assert.ok(Number.isInteger(c.best)&&c.best>=0&&c.best<4);
 keys[c.best]++;
});
assert.deepEqual(keys,[3,3,3,3],"balanced answer keys");
const index=source("index.html"),sw=source("sw.js");
for(const file of ["session5-lessons.js","session5-cases.js","session5-employee-app.js","session5-employee-app.css"]){
 assert.ok(index.includes(file),"index references "+file);
 assert.ok(sw.includes(file),"service worker precaches "+file);
}
assert.ok(index.includes("if(id===5){window.alborzSession5Page();return}"),"session five route exists");
assert.ok(source("session5-employee-app.css").includes("@media(max-width:760px)"),"mobile CSS is present");
let store={},events={},html="",screen="";
const sessionStorage={getItem:k=>store[k]||null,setItem:(k,v)=>store[k]=v};
const appEl={set innerHTML(v){html=v},get innerHTML(){return html}};
const screenEl={set innerHTML(v){screen=v},get innerHTML(){return screen},focus(){}};
const document={title:"",getElementById:id=>id==="app"?appEl:id==="s5-screen"?screenEl:id==="s5-clock"?{textContent:"",parentElement:{classList:{toggle(){}}}}:null,querySelector:q=>q===".s5-root"&&html.includes("s5-root")?{scrollIntoView(){}}:null,querySelectorAll:()=>[],addEventListener:(kind,fn)=>events[kind]=fn};
const context={window:w,document,sessionStorage,setInterval:()=>1,clearInterval:()=>{},header:()=>"<header></header>",footer:()=>"<footer></footer>",Date,Math,Number,String,Array,JSON,Set};
vm.runInNewContext(source("session5-employee-app.js"),context,{filename:"session5-employee-app.js"});
w.alborzSession5Page();
assert.ok(screen.includes("مفهوم و هدف"),"learning screen renders");
function click(selector,data){events.click({target:{closest:s=>s===selector?{dataset:data}:null}});}
click("[data-s5-action]",{s5Action:"learn"});
assert.deepEqual(JSON.parse(store["alborz-session5-learning-v1"]).learned,[0]);
click("[data-s5-tab]",{s5Tab:"cases"});
for(let i=0;i<3;i++)click("[data-s5-action]",{s5Action:"nextStage"});
assert.ok(screen.includes("چک‌لیست مشاهده‌گر"));
click("[data-s5-action]",{s5Action:"completeCase"});
assert.ok(JSON.parse(store["alborz-session5-learning-v1"]).completed.includes(0));
click("[data-s5-tab]",{s5Tab:"exam"});
assert.ok(screen.includes("شروع با اولین پاسخ"),"timer has not started before answer");
const answers=w.ALBORZ_S5_CASES.cases.map(c=>c.best);
click("[data-s5-answer]",{s5Answer:String(answers[0])});
assert.ok(JSON.parse(store["alborz-session5-learning-v1"]).deadline>Date.now(),"timer starts on first answer");
for(let i=1;i<12;i++){click("[data-s5-action]",{s5Action:"nextQuestion"});click("[data-s5-answer]",{s5Answer:String(answers[i])});}
click("[data-s5-action]",{s5Action:"nextQuestion"});
assert.ok(screen.includes("۱۲ از ۱۲"),"score calculated and shown");
assert.ok(screen.includes("پاسخنامه تحلیلی"),"analytical feedback shown");
console.log("PASS Alborz S5: 6 lessons, 12 cases, 48 rationales, balanced answer keys, app routing, 4-stage lab, timer and 12/12 scoring.");
