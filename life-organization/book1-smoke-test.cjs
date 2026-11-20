/* Run with: node life-organization/book1-smoke-test.cjs
   No dependencies. Checks editorial coverage, JS syntax, routing, and workbook persistence. */
"use strict";
const fs=require("node:fs");
const vm=require("node:vm");
const assert=require("node:assert/strict");
const path=require("node:path");
const root=__dirname;
const get=f=>fs.readFileSync(path.join(root,f),"utf8");
for(const name of ["book1-content.js","book1-part2-content.js","book1-chapters-20261120.js","book1-chapter11-20261120.js","book1-ui.js","book1-journey.js","book1-matrices.js","app.js","sw.js"]){
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
vm.runInNewContext(get("book1-part2-content.js"),context);
vm.runInNewContext(get("book1-chapters-20261120.js"),context);
vm.runInNewContext(get("book1-chapter11-20261120.js"),context);
const source=window.LifeBookContent;
assert.equal(source.chapters.length,11,"eleven authored chapters from Drive");
assert.equal(source.plannedChapters.length,12,"twelve-chapter locked table of contents");
assert.equal(source.version,"Book1_Chapters1to11_Drive_2026-11-20");
source.chapters.forEach((chapter,index)=>{
 assert.ok(chapter.sourceText.length>10000,"Chapter "+(index+1)+" long-form text");
 assert.equal((chapter.sourceText.match(/^گفتار /gm)||[]).length,[4,4,5,6,5,5,5,5,4,4,5][index],"expected subchapters");
 assert.ok(chapter.sourceText.includes("یادداشت‌ها و منابع فصل"),"chapter references");
});
assert.ok(source.chapters[2].sourceText.includes("پایان بخش اول"),"Part One end matter");
vm.runInNewContext(get("book1-ui.js"),context);
vm.runInNewContext(get("book1-journey.js"),context);
assert.ok(window.LifeBook,"Book UI was installed");
vm.runInNewContext(get("book1-matrices.js"),context);
assert.equal(window.LifeBook.progress().length,11);
const landing=window.LifeBook.landing("fa");
for(const n of [1,2,3,4,5,6,7,8,9,10,11]){
 assert.ok(landing.includes('data-route="book1/'+n+'"'),"chapter link "+n);
 const page=window.LifeBook.chapter(n,"fa");
 assert.ok(page.includes("lj-reading-layout"),"guided reader layout");
 assert.ok(page.includes("lj-paper"),"paged manuscript");
 assert.ok(page.includes("lj-coach"),"coaching check-in");
 assert.ok(page.includes("data-lj-action="),"interactive journey buttons");
 const form=window.LifeBook.worksheet(n,"fa");
 assert.equal((form.match(/data-lb-field=/g)||[]).length,[8,10,12,8,9,11,8,12,10,11,10][n-1],"worksheet field count");
 assert.ok(form.includes("data-lb-action"),"export and clear actions");
 assert.ok(form.includes("lj-form-stepper"),"paginated workbook");
 assert.equal((form.match(/data-lj-form-group=/g)||[]).length,[8,10,12,8,9,11,8,12,10,11][n-1],"all workbook inputs have page groups");
}
assert.ok(source.chapters[2].sourceText.includes("پایان بخش اول"),"full closing prose remains in source");
assert.ok(window.LifeBook.landing("en").includes("Eleven"),"English interface");
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

/* Chapter 4–6 interactive tool, behavior and reward coverage */
assert.ok(window.LifeBook.workbook("fa").includes("lo-dossier"),"integrated ten-chapter dossier");
for(const n of [4,5,6]){
 const page=window.LifeBook.chapter(n,"fa"),form=window.LifeBook.worksheet(n,"fa");
 assert.ok(page.includes('data-lo-map="'+n+'"'),"chapter "+n+" visual matrix");
 assert.ok(form.includes('data-lo-map="'+n+'"'),"chapter "+n+" workbook matrix");
 assert.ok(form.includes("lj-form-stepper"),"chapter "+n+" paged workbook");
 const input={dataset:{chapter:String(n),lbField:n===4?"situation":"scope"},value:"مشاهده زمینه‌مند همراه شاهد"};
 for(const h of handlers.input||[])h({target:{closest:sel=>sel==="[data-lb-field]"?input:null}});
 const count=[0,0,0,6,5,5][n-1];
 for(let i=1;i<=count;i++){
   marker.dataset.chapter=String(n);marker.dataset.section=String(i);
   passMarker();
 }
 practice.dataset.chapter=String(n);
 for(const h of handlers.click||[])h({target:{closest:sel=>sel==="[data-lj-action]"?practice:null}});
}
const six=window.LifeBook.engagement();
assert.equal(six.wallet.reads,29,"29 authored subchapters across six chapters");
assert.equal(six.wallet.practices,6,"six submitted workbooks");
assert.equal(six.wallet.xp,705,"29 readings plus 6 workbook outputs");
assert.equal(six.wallet.coins,235,"correct activity-based coin totals");
assert.equal(six.badges.length,7,"three new chapter badges plus four legacy badges");
const placement={dataset:{loAction:"place",ch:"5",cell:"3"}};
for(const h of handlers.click||[])h({target:{closest:sel=>sel==="[data-lo-action]"?placement:null}});
assert.equal(window.LifeBook.exportAll().contextMaps["5"].current,3,"current position saved in contextual map");
assert.ok(storage.has("tlo-book1-context-maps-v1"),"context maps persist locally");


for(const n of [7,8,9,10]){
 const page=window.LifeBook.chapter(n,"fa"),form=window.LifeBook.worksheet(n,"fa");
 assert.ok(page.includes('data-lo-map="'+n+'"'),"chapter "+n+" distinct visual map");
 assert.ok(form.includes('data-lo-map="'+n+'"'),"chapter "+n+" interactive workbook map");
 assert.ok(form.includes("lj-form-stepper"),"chapter "+n+" guided workbook");
 const input={dataset:{chapter:String(n),lbField:"scope"},value:"حوزه محدود، بازه و شواهد معتبر"};
 for(const h of handlers.input||[])h({target:{closest:sel=>sel==="[data-lb-field]"?input:null}});
 const total=[5,5,4,4][n-7];
 for(let i=1;i<=total;i++){
  marker.dataset.chapter=String(n);marker.dataset.section=String(i);passMarker();
 }
 practice.dataset.chapter=String(n);
 for(const h of handlers.click||[])h({target:{closest:sel=>sel==="[data-lj-action]"?practice:null}});
}
const ten=window.LifeBook.engagement();
assert.equal(ten.wallet.reads,47,"47 authored reading sections");
assert.equal(ten.wallet.practices,10,"ten completed workbook outputs");
assert.equal(ten.wallet.xp,1155,"47 reading and ten workbook rewards");
assert.equal(ten.wallet.coins,385,"correct ten-chapter coin total");
assert.equal(ten.badges.length,11,"ten chapter badges plus foundation");
assert.equal((window.LifeBook.workbook("fa").match(/class="lo-dossier-item/g)||[]).length,10,"ten dossier entries");
assert.equal((window.LifeBook.landing("fa").match(/class="lb-chapter-tile/g)||[]).length,12,"locked 12 chapter architecture");
assert.equal((window.LifeBook.landing("fa").match(/lo-upcoming/g)||[]).length,1,"only Chapter 12 is still planned");
assert.ok(window.LifeBook.chapter(9,"fa").includes("lo-source-state"),"review manuscript status visible");
assert.ok(window.LifeBook.chapter(10,"fa").includes("lo-source-state"),"review manuscript status visible");

assert.equal(source.chapters[10].title,"فلسفه پیشرفت من","Chapter 11 uses the current Drive manuscript title");
assert.equal(source.chapters[10].priorLockedTitle,"پرمشغله بودن و مفید بودن","old locked title remains in editorial metadata");
assert.ok(source.chapters[10].sourceText.includes("Burrell, G."),"Burrell and Morgan reference preserved");
const ch11=window.LifeBook.chapter(11,"fa"),form11=window.LifeBook.worksheet(11,"fa");
assert.ok(ch11.includes('data-lo-map="11"'),"chapter 11 progress matrix present in reader");
assert.ok(form11.includes('data-lo-map="11"'),"chapter 11 progress matrix present in workbook");
assert.ok(ch11.includes("lo-source-state"),"chapter 11 review label shown");
assert.equal((form11.match(/data-lb-field=/g)||[]).length,10,"chapter 11 has ten exercise fields");
const answer11={dataset:{chapter:"11",lbField:"scope"},value:"نمونه‌کار واقعی در یک هفته"};
for(const h of handlers.input||[])h({target:{closest:sel=>sel==="[data-lb-field]"?answer11:null}});
assert.equal(window.LifeBook.exportData().worksheetResponses["11"].scope,answer11.value,"chapter 11 locally persisted");
assert.equal(window.LifeBook.exportData().worksheetResponses["1"].roles,"نقش حرفه‌ای و خانوادگی","old chapter 1 answer retained");
for(let i=1;i<=5;i++){marker.dataset.chapter="11";marker.dataset.section=String(i);passMarker();}
practice.dataset.chapter="11";
for(const h of handlers.click||[])h({target:{closest:sel=>sel==="[data-lj-action]"?practice:null}});
const eleven=window.LifeBook.engagement();
assert.equal(eleven.wallet.reads,52,"52 reading talks");
assert.equal(eleven.wallet.practices,11,"11 workbook outputs");
assert.equal(eleven.wallet.xp,1275,"eleven chapter full XP");
assert.equal(eleven.wallet.coins,425,"eleven chapter full coins");
assert.equal(eleven.badges.length,12,"11 chapter badges and foundation");
assert.ok(eleven.badges.includes("progress-philosophy"),"chapter 11 badge earned");
assert.equal((window.LifeBook.workbook("fa").match(/class="lo-dossier-item/g)||[]).length,11,"11 dossier records");
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
location.hash="#book1/11/workbook";
for(const fn of handlers["window:hashchange"]||[])fn();
assert.ok(node("#page").innerHTML.includes("کاربرگ فلسفه پیشرفت من"),"chapter 11 workbook route works");
location.hash="#progress";
for(const fn of handlers["window:hashchange"]||[])fn();
assert.ok(node("#page").innerHTML.includes("امتیاز، سکه و نشان‌های یادگیری"),"My Journey includes rewards dashboard");
assert.ok(node("#page").innerHTML.includes("نشان‌های مسیر من"),"My Journey includes badges");
const html=get("index.html"),sw=get("sw.js");
for(const a of ["book1-content.js","book1-part2-content.js","book1-chapters-20261120.js","book1-chapter11-20261120.js","book1-ui.js","book1.css","book1-journey.js","book1-journey.css","book1-matrices.js","book1-matrices.css"]){
 assert.ok(html.includes(a),"HTML asset "+a);
 assert.ok(sw.includes(a),"Offline cache "+a);
}
window.LifeBook.resetAll();
assert.ok(!storage.has("tlo-book1-part1-workbook-v1"),"reset clears saved workbook");
assert.ok(!storage.has("tlo-guided-learning-v03"),"reset clears gamification ledger");
assert.ok(!storage.has("tlo-book1-context-maps-v1"),"reset clears contextual map storage");
console.log("PASS: 11 Drive manuscripts, 52 talks, 109 prompts, 8 maps, 11 dossier entries, 1275 XP / 425 coins, 12 badges, and one planned chapter.");