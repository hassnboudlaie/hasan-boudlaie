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
async function boot(storage=new Map(),input=html,blocked=false,options={}){
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
  dispatchEvent(e){for(const f of [...this.listeners.get(e.type)||[],...handlers.get(e.type)||[]])f({target:this,preventDefault(){},stopPropagation(){}});return true;}querySelectorAll(){return [];}querySelector(s){if(s==='form'){return this._form ||= Object.assign(new Element(),{reportValidity:()=>true});}if(s==='[data-modal-cancel]')return this._cancel ||= new Element();return null;}appendChild(){}setAttribute(){}showModal(){this.open=true;}close(){this.open=false;}scrollIntoView(){}
  click(){if(this.href?.startsWith('blob:'))downloads.push(blobs.get(this.href));this.onclick?.({target:this,preventDefault(){}});for(const f of this.listeners.get('click')||[])f({target:this,preventDefault(){}});}
 }
 for(const m of input.matchAll(/id="([^"]+)"/g))registry.set(m[1],new Element(m[1]));
 for(const [id,el] of registry)if(id.startsWith('view-'))el.classes.add('view');
 const add=(map,t,f)=>{const a=map.get(t)||[];a.push(f);map.set(t,a);};
 const document={getElementById:id=>registry.get(id)||null,querySelectorAll:s=>s==='.view'?[...registry.values()].filter(e=>e.classes.has('view')):[],querySelector:s=>s==='.view.active'?[...registry.values()].find(e=>e.classes.has('view')&&e.classes.has('active')):null,addEventListener:(t,f)=>add(handlers,t,f),createTreeWalker:()=>({nextNode:()=>null}),documentElement:{},body:new Element(),createTextNode:s=>s,createElement:()=>new Element(),activeElement:null,hidden:false};
 const location={hostname:input===offline?'':'hassnboudlaie.github.io',protocol:input===offline?'file:':'https:',hash:options.hash||'',assign(){redirects++;throw new Error('Unexpected redirect');}};
 const session=options.session||new Map(),historyEntries=[{hash:location.hash,state:options.historyState||null}];let historyIndex=0;
 const history={state:options.historyState||null,pushState:(s,_t,h)=>{location.hash=h;history.state=s;historyEntries.splice(historyIndex+1);historyEntries.push({hash:h,state:s});historyIndex++;},replaceState:(s,_t,h)=>{location.hash=h;history.state=s;historyEntries[historyIndex]={hash:h,state:s};}};
 class TestURL extends URL{static createObjectURL(blob){const key='blob:'+blobs.size;blobs.set(key,blob);return key;}static revokeObjectURL(){}}
 class TestFormData{constructor(form){this.values=form.values||{};}get(k){return this.values[k];}*[Symbol.iterator](){yield* Object.entries(this.values);}}
 class TestFileReader{readAsText(file){this.result=file.text;this.onload();}}
 const ctx={Event:class{constructor(type,options={}){this.type=type;Object.assign(this,options);}},document,NodeFilter:{SHOW_TEXT:4},window:{addEventListener:(t,f)=>add(windows,t,f),scrollTo(){}},localStorage:{getItem:k=>storage.get(k)||null,setItem:(k,v)=>{if(blocked)throw new Error('Storage blocked');storage.set(k,v);}},sessionStorage:{getItem:k=>session.get(k)||null,setItem:(k,v)=>session.set(k,v),removeItem:k=>session.delete(k)},location,history,CSS:{escape:x=>x},setTimeout:()=>0,clearTimeout(){},setInterval(){throw new Error('No polling in practice edition');},console,structuredClone,Date,URL:TestURL,Blob,FormData:TestFormData,FileReader:TestFileReader,confirm:()=>true,fetch(){fetches++;throw new Error('Practice must not contact the Cloud backend');}};
 let code=input.match(/<script>([\s\S]*?)<\/script>/)[1];
 code=code.replace(/\}\)\(\);\s*$/,`globalThis.appTest={getState:()=>state,save,flushSave,exportData,importData,goWorkspace,openTraining,closeTraining,route,setLanguage,renderTraining,progress,validateObjective,renderMembers,renderStart,renderRollout,renderExplore,renderEngagement,renderReports,renderMeetings,renderAlignment,renderParticipants,renderInitiatives,renderCycles,renderHistory,renderTeams,reportData,filteredKrs,orgSelectOptions,orgFieldOptions,orgDescendantIds,orgChart:()=>ORG_CHART,sourceDocument:()=>COMPANY_STRATEGY,renderCompanyDocument,sourceInitiatives,ensureCompanyDocument,adoptSourceInitiative,documentFilters:()=>documentFilters,training:()=>TRAINING_MODULES,api,getDirty:()=>dirty,getConflict:()=>conflict};})();`);
 vm.createContext(ctx);vm.runInContext(code,ctx,{timeout:4000});await tick();
 return {app:ctx.appTest,registry,storage,session,history,location,downloads,Element,document,ctx,network:()=>({fetches,redirects}),browserMove:async delta=>{historyIndex=Math.max(0,Math.min(historyEntries.length-1,historyIndex+delta));const entry=historyEntries[historyIndex];location.hash=entry.hash;history.state=entry.state;for(const f of windows.get('popstate')||[])await f({state:entry.state});for(const f of windows.get('hashchange')||[])await f({});await tick();},event:async(t,dataset,values={})=>{const el=new Element('',dataset);Object.assign(el,values);for(const f of handlers.get(t)||[])await f({target:el,preventDefault(){},stopPropagation(){}});await tick();return el;}};
}
// Follow real app controls across landing, workspace, nested references and learning.
const nav=await boot();
assert.equal(nav.location.hash,'#home');assert.equal(nav.registry.get('executionApp').inert,true);
assert.equal(nav.registry.get('sectionBackBtn').disabled,true);
assert.ok(html.includes('<details class="home-guide">'),'Implementation guidance is available without crowding the landing page');
assert.equal((html.match(/class="home-card /g)||[]).length,3);
const navState=JSON.stringify(nav.app.getState());
nav.registry.get('documentEntryBtn').click();assert.equal(nav.location.hash,'#document/foundation');
nav.location.hash='#document/objectives';nav.app.route();
nav.location.hash='#document/reader/62';nav.app.route();
nav.registry.get('sectionBackBtn').click();assert.equal(nav.location.hash,'#document/objectives');
nav.registry.get('sectionBackBtn').click();assert.equal(nav.location.hash,'#document/foundation');
nav.registry.get('sectionBackBtn').click();assert.equal(nav.location.hash,'#home');
assert.equal(nav.registry.get('executionApp').inert,true);assert.equal(nav.registry.get('authScreen').inert,false);
nav.registry.get('entryExecBtn').click();assert.equal(nav.location.hash,'#start');
nav.registry.get('mobileStage').value='teams';nav.registry.get('mobileStage').dispatchEvent({type:'change'});assert.equal(nav.location.hash,'#teams');
nav.registry.get('sectionHomeLink').click();assert.equal(nav.location.hash,'#home');
nav.registry.get('sectionBackBtn').click();assert.equal(nav.location.hash,'#teams');
nav.registry.get('entryTrainBtn').click();assert.equal(nav.location.hash,'#learn/prepare');assert.ok(nav.registry.get('trainingScreen').classList.contains('show'));
nav.app.renderTraining('create');assert.equal(nav.location.hash,'#learn/create');
nav.registry.get('sectionBackBtn').click();assert.equal(nav.location.hash,'#learn/prepare');
nav.registry.get('sectionBackBtn').click();assert.equal(nav.location.hash,'#teams');assert.ok(!nav.registry.get('trainingScreen').classList.contains('show'));
nav.app.openTraining();nav.registry.get('trainingCloseBtn').click();assert.equal(nav.location.hash,'#home');
assert.ok(!nav.registry.get('trainingScreen').classList.contains('show'));assert.equal(nav.registry.get('authScreen').inert,false);
assert.equal(JSON.stringify(nav.app.getState()),navState,'Navigation must not change any entered workspace data');
const direct=await boot(new Map(),html,false,{hash:'#document/reader/306'});
assert.equal(direct.location.hash,'#document/reader/306');assert.ok(direct.registry.get('authScreen').classList.contains('hidden'));
direct.registry.get('sectionBackBtn').click();assert.equal(direct.location.hash,'#document/reader');
direct.registry.get('sectionBackBtn').click();assert.equal(direct.location.hash,'#document/foundation');
direct.registry.get('sectionBackBtn').click();assert.equal(direct.location.hash,'#home');
const learning=await boot(new Map(),html,false,{hash:'#learn/train'});assert.ok(learning.registry.get('trainingScreen').classList.contains('show'));
learning.registry.get('trainingExecBtn').click();assert.equal(learning.location.hash,'#start');assert.equal(learning.registry.get('executionApp').inert,false);
learning.registry.get('sectionBackBtn').click();assert.equal(learning.location.hash,'#learn/train');
learning.app.setLanguage('en');assert.equal(learning.document.documentElement.dir,'ltr');assert.match(learning.registry.get('navigationLocation').textContent,/Learning/);
learning.app.setLanguage('fa');assert.equal(learning.document.documentElement.dir,'rtl');
const refreshed=await boot(learning.storage,html,false,{hash:learning.location.hash,session:learning.session,historyState:learning.history.state});
assert.ok(refreshed.registry.get('trainingScreen').classList.contains('show'));refreshed.registry.get('sectionBackBtn').click();assert.equal(refreshed.location.hash,'#home');
const native=await boot();native.registry.get('entryExecBtn').click();native.registry.get('mobileStage').value='reports';native.registry.get('mobileStage').dispatchEvent({type:'change'});
await native.browserMove(-1);assert.equal(native.location.hash,'#start');await native.browserMove(-1);assert.equal(native.location.hash,'#home');
await native.browserMove(1);assert.equal(native.location.hash,'#start');await native.browserMove(1);assert.equal(native.location.hash,'#reports');
native.registry.get('sectionBackBtn').click();assert.equal(native.location.hash,'#start');
const offNav=await boot(new Map(),offline,false,{hash:'#learn/create'});offNav.registry.get('sectionHomeLink').click();assert.equal(offNav.location.hash,'#home');assert.deepEqual(offNav.network(),{fetches:0,redirects:0});
console.log('PASS: compact three-entry homepage; shared Back/Home controls; nested/deep links; learning-to-workspace transitions; refresh and native browser Back/Forward; Persian/English labels; unchanged workspace data; offline navigation.');
const storage=new Map(),a=await boot(storage);
assert.deepEqual(a.network(),{fetches:0,redirects:0});
assert.equal((a.registry.get('landingRoadmap').innerHTML.match(/class="landing-step"/g)||[]).length,8);
a.registry.get('entryExecBtn').click();assert.ok(a.registry.get('authScreen').classList.contains('hidden'));assert.equal(a.registry.get('executionApp').inert,false);
assert.equal(a.app.training().length,5);
if(source){assert.deepEqual([...source.matchAll(/id="(view-[^"]+)"/g)].map(x=>x[1]),[...html.matchAll(/id="(view-[^"]+)"/g)].map(x=>x[1]).filter(x=>x!=='view-document'));assert.equal(source.match(/const TRAINING_MODULES=([\s\S]*?);\nfunction /)[1],html.match(/const TRAINING_MODULES=([\s\S]*?);\nfunction /)[1]);}
// Exercise the actual source navigation, selectors, adoption and migration paths.
const docClient=await boot(),d=plain(docClient.app.sourceDocument());
assert.equal(d.source.pageCount,366);assert.equal(d.sourcePages.length,366);
assert.equal(d.foundation.values.length,6);assert.equal(d.pillars.length,6);assert.equal(d.kpis.length,18);assert.equal(d.objectives.length,13);
assert.equal(d.objectives.flatMap(o=>o.krs).length,53);
assert.ok(d.initiatives.length>650);assert.ok(d.optionalBank.length>0);
for(const o of d.objectives)for(const k of o.krs){assert.ok(k.fields['تعریف و روش محاسبه']);assert.ok(k.fields['نام شاخص']);assert.ok(k.targetLabel);assert.ok(k.page>=62&&k.page<=107);}
assert.equal(new Set(d.initiatives.map(i=>i.id)).size,d.initiatives.length);
for(const i of d.initiatives){assert.ok(d.objectives.some(o=>o.id===i.objectiveId&&o.krs.some(k=>k.id===i.krId)));assert.ok(!i.title.includes('ابتکار عملیاتی :'),'An extracted action must not swallow its next action');}
const ss=docClient.app.getState();assert.equal(ss.companyOkrs.length,13);assert.equal(ss.strategy.kpis.length,18);
for(const o of ss.companyOkrs){assert.equal(o.status,'draft');assert.equal(o.owner,'');for(const k of o.krs){assert.equal(k.baseline,'');assert.equal(k.current,'');assert.equal(docClient.app.progress(k),0);}}
assert.equal(ss.companyOkrs[0].krs[1].target,'','Conflicting emergency response target stays unresolved');
for(const k of ss.strategy.kpis){assert.equal(k.current,'');assert.equal(k.target,'');assert.equal(k.previous,'');}
docClient.registry.get('documentEntryBtn').click();docClient.app.route();assert.ok(docClient.registry.get('authScreen').classList.contains('hidden'));assert.ok(docClient.registry.get('documentResults').innerHTML.includes('۱۴۱۰'));
for(const tab of ['foundation','pillars','objectives','initiatives','review','reader']){docClient.location.hash='#document/'+tab;docClient.app.route();assert.ok(docClient.registry.get('documentResults').innerHTML.length>100);}
docClient.location.hash='#document/reader/306';docClient.app.route();assert.ok(docClient.registry.get('documentResults').innerHTML.includes('ستاره شمالی'));
docClient.registry.get('documentQuery').value='بانک ابتکارهای عملیاتی';docClient.registry.get('documentQuery').oninput();assert.ok(docClient.registry.get('documentResults').innerHTML.includes('#document/reader/348'));
docClient.location.hash='#document/objectives';docClient.app.route();docClient.registry.get('documentPillar').value='doc-pillar-5';docClient.registry.get('documentPillar').onchange();assert.equal((docClient.registry.get('documentResults').innerHTML.match(/class="source-kr"/g)||[]).length,9);
await docClient.event('click',{sourceUnit:'org-finance-admin'});docClient.app.route();const sf=docClient.app.sourceInitiatives();assert.ok(sf.length>0);assert.ok(sf.every(i=>['org-human-resources','org-finance','org-finance-admin'].includes(i.unitId)));
assert.equal((docClient.registry.get('documentResults').innerHTML.match(/class="card source-initiative"/g)||[]).length,30,'Source actions are paginated');
await docClient.event('click',{sourceOffset:'30'});assert.ok(docClient.registry.get('documentResults').innerHTML.includes('31–60'));
const action=d.initiatives.find(i=>i.unitId==='org-human-resources');const originalCatalog=JSON.stringify(d);
await docClient.event('click',{sourceAdopt:action.id});assert.equal(docClient.app.getState().initiatives.length,1);const adopted=docClient.app.getState().initiatives[0];assert.equal(adopted.objectiveId,action.objectiveId);assert.equal(adopted.krId,action.krId);assert.equal(adopted.status,'planned');
await docClient.event('click',{sourceAdopt:action.id});assert.equal(docClient.app.getState().initiatives.length,1,'Adoption is idempotent');
await docClient.event('change',{initiative:adopted.id,f:'unitId'},{value:'org-training'});
await docClient.event('input',{initiative:adopted.id,f:'owner'},{value:'Synthetic training owner'});
const resumed=await boot(docClient.storage);assert.equal(resumed.app.getState().initiatives[0].unitId,'org-training');assert.equal(resumed.app.getState().initiatives[0].owner,'Synthetic training owner');assert.equal(JSON.stringify(plain(resumed.app.sourceDocument())),originalCatalog,'Editing a plan must not alter the published reference');
const preDocument=plain(JSON.parse(docClient.storage.get('kish_okr_free_practice_v1')));delete preDocument.state.companyDocumentVersion;
preDocument.state.companyOkrs=preDocument.state.companyOkrs.filter(o=>o.id!==d.objectives[0].id);preDocument.state.strategy.mission='Keep my existing mission';preDocument.state.strategy.pillars.push({id:'keep-custom-pillar',title:'Keep custom pillar',description:'Prior user entry'});
const prior=JSON.stringify(preDocument),priorStorage=new Map([['kish_okr_free_practice_v1',prior]]),upgraded=await boot(priorStorage);
assert.equal(priorStorage.get('kish_okr_before_company_document_v1'),prior);assert.equal(upgraded.app.getState().strategy.mission,'Keep my existing mission');assert.ok(upgraded.app.getState().strategy.pillars.some(p=>p.id==='keep-custom-pillar'));assert.equal(upgraded.app.getState().initiatives[0].owner,'Synthetic training owner');assert.equal(upgraded.app.getState().companyOkrs.length,13);
const docAgain=await boot(priorStorage);assert.equal(docAgain.app.getState().companyOkrs.length,13);assert.equal(docAgain.app.getState().strategy.kpis.length,18);
docClient.app.setLanguage('en');assert.equal(docClient.document.documentElement.dir,'ltr');assert.ok(docClient.registry.get('companyDocumentBody').innerHTML.includes('Initiative bank'));docClient.app.setLanguage('fa');
console.log('PASS: actual source navigation, full-text page search, source counts/links, pillar/department filtering, pagination, source-to-execution adoption, editable department assignment, save/refresh restoration, reference immutability, draft/no-measurement defaults and non-destructive idempotent document migration.');
const chart=plain(a.app.orgChart());
assert.equal(chart.length,65);assert.equal(new Set(chart.map(n=>n.id)).size,65);
assert.equal(chart.filter(n=>n.level==='deputy').length,7);
for(const node of chart){assert.ok(node.page>=2&&node.page<=10);assert.ok(node.fa&&node.en);const seen=new Set();let cursor=node;while(cursor){assert.ok(!seen.has(cursor.id),'No cyclic reporting lines');seen.add(cursor.id);if(cursor.parentId)assert.ok(chart.some(n=>n.id===cursor.parentId));cursor=chart.find(n=>n.id===cursor.parentId);}}
assert.equal(chart.find(n=>n.id==='org-human-resources').parentId,'org-finance-admin');
assert.equal(chart.find(n=>n.id==='org-training').parentId,'org-human-resources');
assert.equal(chart.find(n=>n.id==='org-charak-maritime').parentId,'org-charak');
assert.equal(chart.find(n=>n.id==='org-hendorabi-airport').parentId,'org-airports');
const choices=a.app.orgSelectOptions('org-training');
for(const node of chart)assert.ok(choices.includes('value="'+node.id+'"'),'Unit missing from dropdown: '+node.id);
assert.ok(choices.includes('<optgroup'));assert.ok(choices.includes('مدیریت منابع انسانی / اداره آموزش'));
a.app.renderTeams();assert.ok(a.registry.get('teams').innerHTML.includes('orgUnitJump'));
a.registry.get('orgUnitLevel').value='deputy';a.registry.get('orgUnitLevel').onchange();
assert.equal((a.registry.get('orgUnitRows').innerHTML.match(/data-org-team=/g)||[]).length,7);
a.registry.get('orgUnitLevel').value='all';a.registry.get('orgUnitLevel').onchange();
a.registry.get('orgUnitSearch').value='چارک';a.registry.get('orgUnitSearch').oninput();
assert.equal((a.registry.get('orgUnitRows').innerHTML.match(/data-org-team=/g)||[]).length,3);
a.registry.get('orgUnitJump').value='org-training';a.registry.get('orgUnitJump').onchange();
assert.ok(a.registry.get('orgUnitRows').innerHTML.includes('data-org-team="org-training" class="team-box open"'));
async function unitGoal(client,unitId,title){
 const pending=client.event('click',{quickObjective:''});await tick();
 const modal=client.registry.get('okrModal');assert.ok(modal.innerHTML.includes('value="'+unitId+'"'));const form=modal.querySelector('form');form.values={scope:unitId,title};form.onsubmit({preventDefault(){}});await pending;
 const ti=client.app.getState().teams.findIndex(t=>t.id===unitId),team=client.app.getState().teams[ti],oi=team.okrs.length-1,o=team.okrs[oi];
 for(const [f,value] of Object.entries({parentId:'doc-okr-1',why:'Synthetic department evidence',urgent:'This quarter'}))await client.event('input',{obj:'team:'+ti,o:String(oi),f},{value});
 for(const [f,value] of Object.entries({text:'Synthetic department result',owner:'Practice owner',unit:'minutes',baseline:'100',target:'50',current:'75'}))await client.event('input',{kr:'team:'+ti,o:String(oi),k:'0',f},{value});
 for(const workflow of ['review','alignment','active'])await client.event('click',{workflow,id:o.id});assert.equal(o.status,'active');return o;
}
const trainingGoal=await unitGoal(a,'org-training','هدف آزمایشی اداره آموزش');
assert.ok(a.app.reportData('org-human-resources').objs.some(o=>o.id===trainingGoal.id));
assert.ok(a.app.reportData('org-finance-admin').objs.some(o=>o.id===trainingGoal.id));
assert.ok(!a.app.reportData('org-airports').objs.some(o=>o.id===trainingGoal.id));
assert.ok(a.app.filteredKrs({q:'',team:'org-finance-admin',status:'all',owner:'all',freshness:'all'}).some(x=>x.objective.id===trainingGoal.id));
const before=a.app.getState().companyOkrs.length;
const objectiveTitle='هدف آزمایشی: کاهش زمان انتظار';
await a.event('click',{action:'add-company-okr'});
assert.equal(a.app.getState().companyOkrs.length,before+1);
const index=before;
for(const [f,value] of Object.entries({objective:objectiveTitle,owner:'Practice owner',parentId:'doc-pillar-1',why:'Improve reliability',urgent:'This quarter'}))await a.event('input',{obj:'company',o:String(index),f},{value});
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
 a.app.setLanguage('en');assert.ok(a.app.orgSelectOptions('org-training').includes('Human Resources Management / Training Office'));a.app.setLanguage('fa');
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
// A pre-update workspace must retain identifiers, custom units, OKRs and history.
const legacy=plain(saved);delete legacy.state.orgChartVersion;
legacy.state.teams=legacy.state.teams.filter(t=>t.id==='org-training');const originalTeam=legacy.state.teams[0];originalTeam.id='existing-training-id';delete originalTeam.orgChartId;delete originalTeam.orgParentId;delete originalTeam.orgLevel;
legacy.state.teams.push({id:'old-custom-unit',name:'واحد ثبت‌شده کاربر',okrs:[],kpis:[],parent:'Custom parent'});
legacy.state.companyOkrs[index].dependencies=[{id:'legacy-dependency',teamId:'existing-training-id',commitment:'Keep reference',accepted:true}];
const originalText=JSON.stringify(legacy),legacyStorage=new Map([['kish_okr_free_practice_v1',originalText]]),migrated=await boot(legacyStorage);
assert.equal(migrated.app.getState().teams.find(t=>t.orgChartId==='org-training').id,'existing-training-id');
assert.equal(migrated.app.getState().teams.find(t=>t.id==='existing-training-id').okrs[0].id,trainingGoal.id);
assert.equal(migrated.app.getState().teams.find(t=>t.id==='old-custom-unit').parent,'Custom parent');
assert.equal(migrated.app.getState().companyOkrs[index].dependencies[0].teamId,'existing-training-id');
assert.equal(migrated.app.getState().history.length,legacy.state.history.length);
assert.equal(legacyStorage.get('kish_okr_before_org_chart_v1'),originalText);
const again=await boot(legacyStorage);assert.equal(again.app.getState().teams.length,66,'Migration must be idempotent');
assert.ok(again.app.orgSelectOptions('existing-training-id').includes('value="existing-training-id" selected'));
for(const instance of [a,b,other,oldTab,quota,damaged,off,migrated,again])assert.deepEqual(instance.network(),{fetches:0,redirects:0});
console.log('PASS: 65 source-backed organization units, seven deputy directorates, complete grouped dropdowns, hierarchy/search/level filters, actual unit selection and goal creation, parent-branch reporting, FA/EN names, non-destructive legacy migration, reference preservation, local rollback copy and repeated-load deduplication.');
console.log('PASS: full public startup, original sections/handbook retained, no Cloud fetch/redirect/polling, actual goal/KR/check-in/exercise handlers, immediate save and refresh restore, independent browser isolation, JSON export/import continuity, all view routes, RTL/English, stale-tab conflict protection, storage failure feedback and self-contained offline startup. VM DOM checks; physical browser layout and Iran network are not covered.');
