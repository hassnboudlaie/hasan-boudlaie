import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const here=path.dirname(fileURLToPath(import.meta.url));
const artifacts=process.argv[3]?path.resolve(process.argv[3]):here;
const html=fs.readFileSync(path.join(artifacts,'index.html'),'utf8');
const offline=fs.readFileSync(path.join(artifacts,'offline.html'),'utf8');
const sourcePath=process.argv[2];
const source=sourcePath?fs.readFileSync(sourcePath,'utf8'):null;
const tick=()=>new Promise(resolve=>setImmediate(resolve));
const plain=x=>JSON.parse(JSON.stringify(x));
const dataKey=x=>x.replace(/-([a-z])/g,(_,c)=>c.toUpperCase());
async function boot(storage=new Map(),input=html,blocked=false){
 const registry=new Map(),handlers=new Map(),windows=new Map(),blobs=new Map(),downloads=[];
 let fetches=0,redirects=0;
 class Element{
  constructor(id='',dataset={}){this.id=id;this.dataset=dataset;this.style={};this.value='';this.options=[];this.children=[];this._html='';this.listeners=new Map();this.classes=new Set();this.classList={add:(...x)=>x.forEach(v=>this.classes.add(v)),remove:(...x)=>x.forEach(v=>this.classes.delete(v)),toggle:(x,v)=>{v??=!this.classes.has(x);v?this.classes.add(x):this.classes.delete(x);},contains:x=>this.classes.has(x)};}
  set innerHTML(s){this._html=s;for(const m of s.matchAll(/id="([^"]+)"/g))if(!registry.has(m[1]))registry.set(m[1],new Element(m[1]));}
  get innerHTML(){return this._html;}
  addEventListener(t,f){const a=this.listeners.get(t)||[];a.push(f);this.listeners.set(t,a);}
  matches(s){return s.split(',').some(sel=>{sel=sel.trim();const m=sel.match(/^\[data-([a-z-]+)(?:="([^"]*)")?\]$/);if(m)return Object.hasOwn(this.dataset,dataKey(m[1]))&&(m[2]===undefined||this.dataset[dataKey(m[1])]===m[2]);return sel.startsWith('#')?this.id===sel.slice(1):sel.startsWith('.')?this.classes.has(sel.slice(1)):false;});}
  closest(s){return this.matches(s)?this:null;}
  hasAttribute(a){return a.startsWith('data-')&&Object.hasOwn(this.dataset,dataKey(a.slice(5)));}
  querySelectorAll(){return [];}querySelector(){return null;}appendChild(){}setAttribute(){}showModal(){this.open=true;}close(){this.open=false;}scrollIntoView(){}
  click(){if(this.href?.startsWith('blob:'))downloads.push(blobs.get(this.href));this.onclick?.({target:this,preventDefault(){}});for(const f of this.listeners.get('click')||[])f({target:this,preventDefault(){}});}
 }
 for(const m of input.matchAll(/id="([^"]+)"/g))registry.set(m[1],new Element(m[1]));
 for(const [id,el] of registry)if(id.startsWith('view-'))el.classes.add('view');
 const add=(map,t,f)=>{const a=map.get(t)||[];a.push(f);map.set(t,a);};
 const document={getElementById:id=>registry.get(id)||null,querySelectorAll:s=>s==='.view'?[...registry.values()].filter(e=>e.classes.has('view')):[],querySelector:s=>s==='.view.active'?[...registry.values()].find(e=>e.classes.has('view')&&e.classes.has('active')):null,addEventListener:(t,f)=>add(handlers,t,f),createTreeWalker:()=>({nextNode:()=>null}),documentElement:{},body:new Element(),createTextNode:s=>s,createElement:()=>new Element(),activeElement:null,hidden:false};
 const location={hostname:input===offline?'':'hassnboudlaie.github.io',protocol:input===offline?'file:':'https:',hash:'',assign(){redirects++;throw new Error('Unexpected redirect');}};
 class TestURL extends URL{static createObjectURL(blob){const key='blob:'+blobs.size;blobs.set(key,blob);return key;}static revokeObjectURL(){}}
 class TestFormData{constructor(form){this.values=form.values||{};}get(k){return this.values[k];}*[Symbol.iterator](){yield* Object.entries(this.values);}}
 class TestFileReader{readAsText(file){this.result=file.text;this.onload();}}
 const ctx={document,NodeFilter:{SHOW_TEXT:4},window:{addEventListener:(t,f)=>add(windows,t,f),scrollTo(){}},localStorage:{getItem:k=>storage.get(k)||null,setItem:(k,v)=>{if(blocked)throw new Error('Storage blocked');storage.set(k,v);}},sessionStorage:{getItem:()=>null,removeItem(){}},location,history:{pushState:(_s,_t,h)=>{location.hash=h;},replaceState:(_s,_t,h)=>{location.hash=h;}},CSS:{escape:x=>x},setTimeout:()=>0,clearTimeout(){},setInterval(){throw new Error('No polling in practice edition');},console,structuredClone,Date,URL:TestURL,Blob,FormData:TestFormData,FileReader:TestFileReader,confirm:()=>true,fetch(){fetches++;throw new Error('Practice must not contact the Cloud backend');}};
 let code=input.match(/<script>([\s\S]*?)<\/script>/)[1];
 code=code.replace(/\}\)\(\);\s*$/,`globalThis.appTest={getState:()=>state,save,flushSave,exportData,importData,goWorkspace,openTraining,closeTraining,route,setLanguage,progress,validateObjective,renderMembers,renderStart,renderRollout,renderExplore,renderEngagement,renderReports,renderMeetings,renderAlignment,renderParticipants,renderInitiatives,renderCycles,renderHistory,training:()=>TRAINING_MODULES,api,getDirty:()=>dirty,getConflict:()=>conflict};})();`);
 vm.createContext(ctx);vm.runInContext(code,ctx,{timeout:4000});await tick();
 return {app:ctx.appTest,registry,storage,location,downloads,Element,document,ctx,network:()=>({fetches,redirects}),event:async(t,dataset,values={})=>{const el=new Element('',dataset);Object.assign(el,values);for(const f of handlers.get(t)||[])await f({target:el,preventDefault(){},stopPropagation(){}});await tick();return el;}};
}
const storage=new Map(),a=await boot(storage);
assert.deepEqual(a.network(),{fetches:0,redirects:0});
assert.equal((a.registry.get('landingRoadmap').innerHTML.match(/class="landing-step"/g)||[]).length,8);
a.registry.get('entryExecBtn').click();assert.ok(a.registry.get('authScreen').classList.contains('hidden'));assert.equal(a.registry.get('executionApp').inert,false);
assert.equal(a.app.training().length,5);
if(source){assert.deepEqual([...source.matchAll(/id="(view-[^"]+)"/g)].map(x=>x[1]),[...html.matchAll(/id="(view-[^"]+)"/g)].map(x=>x[1]));assert.equal(source.match(/const TRAINING_MODULES=([\s\S]*?);\nfunction /)[1],html.match(/const TRAINING_MODULES=([\s\S]*?);\nfunction /)[1]);}
const before=a.app.getState().companyOkrs.length;
const objectiveTitle='هدف آزمایشی: کاهش زمان انتظار';
await a.event('click',{action:'add-company-okr'});
assert.equal(a.app.getState().companyOkrs.length,before+1);
const index=before;
for(const [f,value] of Object.entries({objective:objectiveTitle,owner:'Practice owner',parentId:'demo-p1',why:'Improve reliability',urgent:'This quarter'}))await a.event('input',{obj:'company',o:String(index),f},{value});
await a.event('click',{addKr:'company',o:String(index)});
for(const [f,value] of Object.entries({text:'Reduce synthetic waiting',owner:'Practice owner',unit:'minutes',baseline:'100',target:'50',current:'100'}))await a.event('input',{kr:'company',o:String(index),k:'0',f},{value});
const o=a.app.getState().companyOkrs[index];assert.equal(a.app.validateObjective(o),'');
for(const workflow of ['review','alignment','active'])await a.event('click',{workflow,id:o.id});
assert.equal(o.status,'active');
await a.event('submit',{checkForm:o.krs[0].id},{values:{current:'65',confidence:'on-track',note:'Synthetic check-in evidence'}});
assert.equal(a.app.progress(o.krs[0]),70);assert.equal(a.app.getState().history.at(-1).note,'Synthetic check-in evidence');
await a.event('input',{exercise:'prepare-0'},{value:'Synthetic workshop answer'});
assert.equal(JSON.parse(storage.get('kish_okr_free_practice_v1')).state.exercises['prepare-0'],'Synthetic workshop answer');
assert.equal(a.app.getDirty(),false);
const revisionBeforeSave=JSON.parse(storage.get('kish_okr_free_practice_v1')).revision;
a.registry.get('saveBtn').click();await tick();
const saved=JSON.parse(storage.get('kish_okr_free_practice_v1'));
assert.equal(saved.revision,revisionBeforeSave+1,'The Save button must persist a new revision');
assert.equal(saved.state.companyOkrs[index].objective,objectiveTitle);
assert.equal(a.app.getDirty(),false);
assert.ok(a.registry.get('syncStatus').textContent.includes('ذخیره در همین مرورگر'));
for(const view of [...html.matchAll(/id="view-([^"]+)"/g)].map(x=>x[1])){a.location.hash='#'+view;a.app.route();}
assert.ok(a.registry.get('membersBody').innerHTML.includes('همگام‌سازی خودکار نیست'));
assert.ok(!a.registry.get('membersBody').innerHTML.includes('inviteMemberForm'));
a.app.openTraining();assert.ok(a.registry.get('trainingBody').innerHTML.includes('Synthetic workshop answer'));a.app.closeTraining();
a.app.setLanguage('en');assert.equal(a.document.documentElement.dir,'ltr');assert.ok(a.registry.get('landingRoadmap').innerHTML.includes('Learn &amp; Repeat'));a.app.setLanguage('fa');assert.equal(a.document.documentElement.dir,'rtl');
const b=await boot(storage);assert.equal(b.app.getState().companyOkrs[index].objective,objectiveTitle);assert.equal(b.app.getState().companyOkrs[index].status,'active');assert.equal(b.app.getState().exercises['prepare-0'],'Synthetic workshop answer');
assert.deepEqual(plain(b.app.getState()),saved.state,'A fresh execution must restore the entire saved workspace');
assert.equal(b.app.getState().companyOkrs[index].krs[0].current,65);
assert.equal(b.app.progress(b.app.getState().companyOkrs[index].krs[0]),70);
console.log(JSON.stringify({test:'published data-entry/save/reload',objective:objectiveTitle,keyResultCurrent:65,progress:70,manualSaveRevision:saved.revision,fullWorkspaceRestored:true}));
const other=await boot();assert.equal(other.app.getState().companyOkrs.length,before,'Independent browser must not receive private practice data');
a.app.exportData();const exported=await a.downloads.at(-1).text();assert.ok(JSON.parse(exported).exercises['prepare-0']);
other.app.importData({text:exported});await tick();assert.equal(other.app.getState().companyOkrs[index].status,'active');assert.equal(other.app.progress(other.app.getState().companyOkrs[index].krs[0]),70);assert.equal(other.app.getState().exercises['prepare-0'],'Synthetic workshop answer');
await assert.rejects(other.app.api('invite','POST',{email:'never@example.invalid'}));await assert.rejects(other.app.api('login','POST',{password:'never-send'}));
const oldTab=await boot(storage);b.app.getState().meta.orgName='One tab changed practice';b.app.save(true);oldTab.app.getState().meta.orgName='Stale tab input';oldTab.app.save(true);assert.equal(oldTab.app.getConflict(),true);assert.equal(oldTab.app.getState().meta.orgName,'Stale tab input');assert.equal(JSON.parse(storage.get('kish_okr_free_practice_v1')).state.meta.orgName,'One tab changed practice');
oldTab.registry.get('conflictReload').onclick();await tick();assert.equal(oldTab.app.getConflict(),false);assert.equal(oldTab.app.getState().meta.orgName,'One tab changed practice');
const quota=await boot(new Map(),html,true);quota.app.save(true);assert.equal(quota.app.getDirty(),true);assert.ok(quota.registry.get('syncStatus').textContent.includes('Export')||quota.registry.get('syncStatus').textContent.includes('خروجی'));
const damaged=await boot(new Map([['kish_okr_free_practice_v1','not JSON']]));assert.equal(damaged.app.getState().companyOkrs.length,before);
const off=await boot(new Map(),offline);off.registry.get('entryExecBtn').click();assert.equal(off.registry.get('executionApp').inert,false);assert.ok(offline.includes('data:image/svg+xml;base64,'));assert.ok(!offline.includes('src="assets/'));assert.ok(!offline.includes('href="favicon.svg"'));
for(const instance of [a,b,other,oldTab,quota,damaged,off])assert.deepEqual(instance.network(),{fetches:0,redirects:0});
console.log('PASS: full public startup, original sections/handbook retained, no Cloud fetch/redirect/polling, actual goal/KR/check-in/exercise handlers, immediate save and refresh restore, independent browser isolation, JSON export/import continuity, all view routes, RTL/English, stale-tab conflict protection, storage failure feedback and self-contained offline startup. VM DOM checks; physical browser layout and Iran network are not covered.');
