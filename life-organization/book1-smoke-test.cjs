/* Run with: node life-organization/book1-smoke-test.cjs
   No dependencies. Checks editorial coverage, JS syntax, routing, and workbook persistence. */
"use strict";
const fs=require("node:fs");
const vm=require("node:vm");
const assert=require("node:assert/strict");
const path=require("node:path");
const root=__dirname;
const get=f=>fs.readFileSync(path.join(root,f),"utf8");
for(const name of ["book1-content.js","book1-ui.js","book1-journey.js","app.js","sw.js"]){
 new vm.Script(get(name),{filename:name});
 console.log("Syntax OK:",name);
}
const chapters=(get("book1-content.js").match(/window\.LifeBookContent=/)||[]).length;
assert.equal(chapters,1,"Single canonical source object");
const storage=new Map();
const localStorage={
 getItem:k=>storage.has(k)?storage.get(k):null,
 setItem:(k,v)=>{storage.set(k,String(v))},
 removeItem:k=>storage.delete(k)
};
const handlers={};
const nodes={};
function node(key){
 return nodes[key]||(nodes[key]={
  innerHTML:"",textContent:"",value:"",dataset:{},style:{},classList:{add(){},remove(){},toggle(){}},
  addEventListener(){},setAttribute(){},focus(){},showModal(){},remove(){},querySelector:()=>node("reward-dialog")
 });
}
const document={
 documentElement:{lang:"fa",dir:"rtl",dataset:{}},
 querySelector:node,querySelectorAll:()=>[],
 getElementById:()=>null,createElement:()=>node("created-element"),body:{appendChild(){}},addEventListener:(name,cb)=>{(handlers[name]||=[]).push(cb)}
};
const window={
 addEventListener:(name,cb)=>{(handlers["window:"+name]||=[]).push(cb)},
 matchMedia:()=>({matches:false,addEventListener(){}}),
 scrollTo(){},LifeBookContent:null
};
const location={hash:"#module/1"};
const context={window,document,localStorage,URL,location,navigator:{},Blob,
 setTimeout:()=>1,clearTimeout:()=>{},setInterval:()=>1,clearInterval:()=>{},matchMedia:window.matchMedia,console};
vm.runInNewContext(get("book1-content.js"),context);
const source=window.LifeBookContent;
assert.equal(source.chapters.length,3,"three complete chapters");
assert.equal(source.version,"Book1_Part1_FINAL_v1.0_FA");
source.chapters.forEach((chapter,index)=>{
 assert.ok(chapter.sourceText.length>20000,"Chapter "+(index+1)+" long-form text");
 assert.equal((chapter.sourceText.match(/^گفتار /gm)||[]).length,[4,4,5][index],"expected subchapters");
 assert.ok(chapter.sourceText.includes("یادداشت‌ها و منابع فصل"),"chapter references");
});
assert.ok(source.chapters[2].sourceText.includes("پایان بخش اول"),"Part One end matter");
vm.runInNewContext(get("book1-ui.js"),context);
vm.runInNewContext(get("book1-journey.js"),context);
assert.ok(window.LifeBook,"Book UI was installed");
assert.equal(window.LifeBook.progress().length,3);
const landing=window.LifeBook.landing("fa");
for(const n of [1,2,3]){
 assert.ok(landing.includes('data-route="book1/'+n+'"'),"chapter link "+n);
 const page=window.LifeBook.chapter(n,"fa");
 assert.ok(page.includes("lj-reading-layout"),"guided reader layout");
 assert.ok(page.includes("lj-paper"),"paged manuscript");
 assert.ok(page.includes("lj-coach"),"coaching check-in");
 assert.ok(page.includes("data-lj-action="),"interactive journey buttons");
 const form=window.LifeBook.worksheet(n,"fa");
 assert.equal((form.match(/data-lb-field=/g)||[]).length,[8,10,12][n-1],"worksheet field count");
 assert.ok(form.includes("data-lb-action"),"export and clear actions");
 assert.ok(form.includes("lj-form-stepper"),"paginated workbook");
 assert.equal((form.match(/data-lj-form-group=/g)||[]).length,[8,10,12][n-1],"all workbook inputs have page groups");
}
assert.ok(source.chapters[2].sourceText.includes("پایان بخش اول"),"full closing prose remains in source");
assert.ok(window.LifeBook.landing("en").includes("Three"),"English interface");
const inputField={dataset:{chapter:"1",lbField:"roles"},value:"نقش حرفه‌ای و خانوادگی"};
for(const h of handlers.input||[])h({target:{closest:sel=>sel==="[data-lb-field]"?inputField:null}});
assert.equal(window.LifeBook.exportData().worksheetResponses["1"].roles,inputField.value,"local fields tracked");
assert.ok(storage.has("tlo-book1-part1-workbook-v1"),"stored in browser");
const marker={dataset:{lbAction:"mark",ljAction:"read",chapter:"1",section:"1"},classList:{toggle(){}},setAttribute(){},textContent:""};
const passMarker=()=>{for(const h of handlers.click||[])h({target:{closest:sel=>["[data-lb-action]","[data-lj-action]"].includes(sel)?marker:null}})};
passMarker();
assert.equal(window.LifeBook.progress()[0].reviewed,1,"reading marker updated");
assert.equal(window.LifeBook.engagement().wallet.xp,15,"15 XP per reading, awarded once");
assert.equal(window.LifeBook.engagement().wallet.coins,5,"5 coins per reading");
passMarker();
assert.equal(window.LifeBook.engagement().wallet.xp,15,"no duplicate XP for toggled review");
assert.equal(window.LifeBook.engagement().wallet.coins,5,"no duplicate coins");
const practice={dataset:{ljAction:"finish-workbook",chapter:"1"}};
for(const h of handlers.click||[])h({target:{closest:sel=>sel==="[data-lj-action]"?practice:null}});
assert.equal(window.LifeBook.engagement().wallet.xp,60,"workbook output adds 45 XP");
assert.equal(window.LifeBook.engagement().wallet.coins,20,"workbook output adds 15 coins");
assert.ok(window.LifeBook.engagement().practice["1"],"workbook confirmation persisted");
for(const h of handlers.click||[])h({target:{closest:sel=>sel==="[data-lj-action]"?practice:null}});
assert.equal(window.LifeBook.engagement().wallet.xp,60,"practice rewards idempotent");
for(const n of [1,2,3]){
 const first=n===1?2:1,last=n===3?5:4;
 for(let i=first;i<=last;i++){
  marker.dataset.chapter=String(n);marker.dataset.section=String(i);
  passMarker();
 }
 if(n>1){
  const extra={dataset:{chapter:String(n),lbField:n===2?"criterion1":"topic"},value:"یک مشاهده عینی درباره وضع فعلی"};
  for(const h of handlers.input||[])h({target:{closest:sel=>sel==="[data-lb-field]"?extra:null}});
  practice.dataset.chapter=String(n);
  for(const h of handlers.click||[])h({target:{closest:sel=>sel==="[data-lj-action]"?practice:null}});
 }
}
const allRewards=window.LifeBook.engagement();
assert.equal(allRewards.wallet.xp,330,"13 readings and 3 outputs earn 330 learning XP");
assert.equal(allRewards.wallet.coins,110,"13 readings and 3 outputs earn 110 journey coins");
assert.equal(allRewards.wallet.reads,13,"all distinct reading steps earn once");
assert.equal(allRewards.wallet.practices,3,"all three workbook outputs confirmed");
assert.equal(allRewards.badges.length,4,"four earned badges including foundation");
assert.ok(allRewards.badges.includes("foundation"),"final foundation badge unlocked");
assert.ok(window.LifeBook.landing("fa").includes('data-lj-action="download-badge"'),"unlocked downloadable badges visible");
assert.ok(storage.has("tlo-guided-learning-v03"),"reward ledger saved locally");
vm.runInNewContext(get("app.js"),context);
assert.ok(node("#page").innerHTML.includes("من کجای زندگی ایستاده‌ام"),"Book I module landing integrated");
location.hash="#book1/2";
for(const fn of handlers["window:hashchange"]||[])fn();
assert.ok(node("#page").innerHTML.includes("سازمان عالی زندگی چیست"),"Chapter route works");
location.hash="#book1/3/workbook";
for(const fn of handlers["window:hashchange"]||[])fn();
assert.ok(node("#page").innerHTML.includes("وضع موجود و وضع مناسب"),"Chapter worksheet route works");
location.hash="#book1/workbook";
for(const fn of handlers["window:hashchange"]||[])fn();
assert.ok(node("#page").innerHTML.includes("دفتر کار یکپارچه"),"Summary route works");
location.hash="#progress";
for(const fn of handlers["window:hashchange"]||[])fn();
assert.ok(node("#page").innerHTML.includes("امتیاز، سکه و نشان‌های یادگیری"),"My Journey includes rewards dashboard");
assert.ok(node("#page").innerHTML.includes("نشان‌های مسیر من"),"My Journey includes badges");
const html=get("index.html"),sw=get("sw.js");
for(const a of ["book1-content.js","book1-ui.js","book1.css","book1-journey.js","book1-journey.css"]){
 assert.ok(html.includes(a),"HTML asset "+a);
 assert.ok(sw.includes(a),"Offline cache "+a);
}
window.LifeBook.resetAll();
assert.ok(!storage.has("tlo-book1-part1-workbook-v1"),"reset clears saved workbook");
assert.ok(!storage.has("tlo-guided-learning-v03"),"reset clears gamification ledger");
console.log("PASS: manuscript, 13 reading steps, 30 paged prompts, coaching, 330 XP / 110 coins, 4 badges, idempotence, navigation, persistence, reset and offline assets.");