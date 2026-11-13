/* Run with: node life-organization/book1-smoke-test.cjs
   No dependencies. Checks editorial coverage, JS syntax, routing, and workbook persistence. */
"use strict";
const fs=require("node:fs");
const vm=require("node:vm");
const assert=require("node:assert/strict");
const path=require("node:path");
const root=__dirname;
const get=f=>fs.readFileSync(path.join(root,f),"utf8");
for(const name of ["book1-content.js","book1-ui.js","app.js","sw.js"]){
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
  addEventListener(){},setAttribute(){},focus(){},showModal(){}
 });
}
const document={
 documentElement:{lang:"fa",dir:"rtl",dataset:{}},
 querySelector:node,querySelectorAll:()=>[],
 getElementById:()=>null,addEventListener:(name,cb)=>{(handlers[name]||=[]).push(cb)}
};
const window={
 addEventListener:(name,cb)=>{(handlers["window:"+name]||=[]).push(cb)},
 matchMedia:()=>({matches:false,addEventListener(){}}),
 scrollTo(){},LifeBookContent:null
};
const location={hash:"#module/1"};
const context={window,document,localStorage,URL,location,navigator:{},Blob,
 setTimeout:()=>1,clearTimeout:()=>{},matchMedia:window.matchMedia,console};
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
assert.ok(window.LifeBook,"Book UI was installed");
assert.equal(window.LifeBook.progress().length,3);
const landing=window.LifeBook.landing("fa");
for(const n of [1,2,3]){
 assert.ok(landing.includes('data-route="book1/'+n+'"'),"chapter link "+n);
 const page=window.LifeBook.chapter(n,"fa");
 assert.ok(page.includes("lb-reading-panel"),"reader panels");
 assert.ok(page.includes("یادداشت‌ها و منابع"),"bibliography kept");
 assert.ok(page.includes("حمید"),"characters preserved");
 const form=window.LifeBook.worksheet(n,"fa");
 assert.equal((form.match(/data-lb-field=/g)||[]).length,[8,10,12][n-1],"worksheet field count");
 assert.ok(form.includes("data-lb-action"),"export and clear actions");
}
assert.ok(window.LifeBook.chapter(3,"fa").includes("پایان بخش اول"),"closing prose");
assert.ok(window.LifeBook.landing("en").includes("Three"),"English interface");
const inputField={dataset:{chapter:"1",lbField:"roles"},value:"نقش حرفه‌ای و خانوادگی"};
for(const h of handlers.input||[])h({target:{closest:sel=>sel==="[data-lb-field]"?inputField:null}});
assert.equal(window.LifeBook.exportData().worksheetResponses["1"].roles,inputField.value,"local fields tracked");
assert.ok(storage.has("tlo-book1-part1-workbook-v1"),"stored in browser");
const marker={dataset:{lbAction:"mark",chapter:"1",section:"1"},classList:{toggle(){}},setAttribute(){},textContent:""};
for(const h of handlers.click||[])h({target:{closest:sel=>sel==="[data-lb-action]"?marker:null}});
assert.equal(window.LifeBook.progress()[0].reviewed,1,"reading marker updated");
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
const html=get("index.html"),sw=get("sw.js");
for(const a of ["book1-content.js","book1-ui.js","book1.css"]){
 assert.ok(html.includes(a),"HTML asset "+a);
 assert.ok(sw.includes(a),"Offline cache "+a);
}
window.LifeBook.resetAll();
assert.ok(!storage.has("tlo-book1-part1-workbook-v1"),"reset clears saved workbook");
console.log("PASS: manuscript, 13 reading sections, 30 prompts, navigation, persistence, reset and offline asset references.");