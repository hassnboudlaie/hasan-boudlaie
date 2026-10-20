import assert from 'node:assert/strict';
import fs from 'node:fs';
import {boot} from './verify-free-pages.mjs';
const appDir=process.argv[3]||'okr-system';
const html=fs.readFileSync(appDir+'/index.html','utf8');
const plain=x=>JSON.parse(JSON.stringify(x));
const a=await boot();
assert.equal(a.app.getState().platform.version,1);
assert.deepEqual(plain(a.app.orgChart().filter(n=>n.level==='deputy'&&!n.parentId).map(n=>n.id)),['org-finance-admin','org-economic-technical']);
for(const route of ['map','organization','organization/company','organization/hq','organization/org-airports','organization/org-ports','organization/org-finance-admin','organization/org-economic-technical','organization/org-airport-operations','goals','goals/doc-okr-1','results/doc-okr-1-kr-1','kpis','kpis/doc-kpi-1-1','projects','sessions','analytics','reporting','resources','resources/airport-plan','resources/airport-appendices','resources/ports-plan','resources/org-chart','people','revision','search']){
 a.location.hash='#'+route;a.app.route();assert.equal(a.location.hash,'#'+route);assert.ok(a.registry.get('view-platform').classes.has('active'),route);assert.ok(a.registry.get('platformBody').innerHTML.length>200,route);
}
for(const tab of ['overview','goals','kpis','projects','sessions','revision','resources','people']){a.location.hash='#organization/org-airports/'+tab;a.app.route();assert.ok(a.registry.get('platformBody').innerHTML.includes('org-airports'));}
const sourceBefore=JSON.stringify(a.app.sourceDocument());
// Exercise actual form launch, submit, persistence and routing handlers.
await a.event('click',{pAction:'goal',pId:'org-airports'});
await a.event('submit',{platformForm:'goal'},{values:{objective:'کاهش انتظار مسافران',owner:'مسئول آزمایشی',teamId:'org-airports',parentId:'doc-okr-7',status:'draft',why:'تمرین عملیاتی',due:'2026-12-31',linkedTeamId:''}});
const objective=a.app.getState().teams.find(t=>t.id==='org-airports').okrs.find(o=>o.objective==='کاهش انتظار مسافران');assert.ok(objective);assert.equal(a.location.hash,'#goals/'+objective.id);
await a.event('click',{pAction:'kr',pId:objective.id});
await a.event('submit',{platformForm:'kr'},{values:{text:'کاهش زمان انتظار از ۳۰ به ۱۰ دقیقه',owner:'مسئول آزمایشی',unit:'دقیقه',baseline:'30',target:'10',current:'',measurementNote:''}});
const kr=a.app.getState().teams.find(t=>t.id==='org-airports').okrs.find(o=>o.id===objective.id).krs[0];assert.ok(kr);assert.equal(a.app.pGoalScore(a.app.getState().teams.find(t=>t.id==='org-airports').okrs[0]).value,null);
await a.event('click',{pAction:'checkin',pId:kr.id});
await a.event('submit',{platformForm:'checkin'},{values:{current:'20',confidence:'on-track',note:'اندازه‌گیری در ۲۰ نمونه؛ پیگیری شیفت بعد'}});
assert.equal(a.app.getState().history.at(-1).current,20);assert.equal(a.app.pMetrics('org-airports').measured,1);assert.equal(a.app.pGoalScore(a.app.getState().teams.find(t=>t.id==='org-airports').okrs[0]).value,50);
await a.event('click',{pAction:'project-goal',pId:objective.id});
await a.event('submit',{platformForm:'project'},{values:{title:'بهبود هماهنگی شیفت',owner:'مسئول آزمایشی',teamId:'org-airports',objectiveId:objective.id,due:'2026-12-31',status:'in-progress',krId:kr.id,description:'پروژه متصل به هدف'}});
const project=a.app.getState().initiatives.find(i=>i.title==='بهبود هماهنگی شیفت');assert.ok(project);assert.equal(a.location.hash,'#projects/'+project.id);
await a.event('click',{pAction:'task-project',pId:project.id});
await a.event('submit',{platformForm:'task'},{values:{title:'توافق سرپرستان شیفت',owner:'مسئول آزمایشی',teamId:'org-airports',objectiveId:objective.id,projectId:project.id,due:'2026-10-01',status:'todo',description:'توافق مسئولیت‌ها'}});
const task=a.app.getState().platform.tasks[0];assert.equal(task.projectId,project.id);assert.ok(a.app.pOverdue(task));assert.equal(a.app.pMetrics('org-airports').delayed,1);
await a.event('click',{pAction:'task-toggle',pId:task.id});assert.equal(a.app.getState().platform.tasks[0].status,'done');assert.equal(a.app.pMetrics('org-airports').delayed,0);assert.equal(a.app.progress(kr),50,'Task completion cannot create KR progress');
await a.event('click',{pAction:'meeting-goal',pId:objective.id});
await a.event('submit',{platformForm:'meeting'},{values:{title:'مرور تجربه مسافر',type:'review',date:'2026-10-20',teamId:'org-airports',objectiveId:objective.id,participants:'مدیر و سرپرست شیفت',points:'علت انتظار',note:'تقسیم نقش‌ها روشن شود',next:'بررسی تحویل شیفت\nثبت نمونه زمان انتظار',actionOwner:'مسئول آزمایشی',actionDue:'2026-10-30'}});
const meeting=a.app.getState().meetings.find(m=>m.title==='مرور تجربه مسافر');assert.ok(meeting);assert.equal(a.app.getState().platform.tasks.filter(t=>t.meetingId===meeting.id).length,2);assert.equal(a.location.hash,'#sessions/'+meeting.id);
await a.event('click',{pAction:'meeting-edit',pId:meeting.id});
await a.event('submit',{platformForm:'meeting'},{values:{...plain(meeting),actionOwner:'مسئول آزمایشی',actionDue:'2026-10-30'}});
assert.equal(a.app.getState().platform.tasks.filter(t=>t.meetingId===meeting.id).length,2,'Editing the same meeting must not duplicate next actions');
await a.event('click',{pAction:'unit',pId:'org-airports'});
await a.event('submit',{platformForm:'unit'},{values:{owner:'مسئول آزمایشی',purpose:'هماهنگی خدمات هوایی',revisionStatus:'submitted',rolloutStatus:'active',revisionNote:'صورت‌جلسه مرور ثبت شد'}});
assert.equal(a.app.getState().teams.find(t=>t.id==='org-airports').lead,'مسئول آزمایشی');assert.equal(a.app.pMetrics('org-airports').revised,1);assert.equal(a.app.pMetrics('org-airports').rollout,1);
await a.event('click',{pAction:'kpi',pId:'org-airports'});
await a.event('submit',{platformForm:'kpi'},{values:{name:'رضایت مسافر آزمایشی',owner:'مسئول آزمایشی',teamId:'org-airports',unit:'درصد',direction:'up',pillarId:'doc-pillar-1',current:'82',target:'90',definition:'درصد پاسخ مثبت',formula:'پاسخ مثبت تقسیم بر کل',measurementNote:'نمونه آزمایشی مستقل'}});
const kpi=a.app.getState().strategy.kpis.find(k=>k.name==='رضایت مسافر آزمایشی');assert.ok(kpi);assert.equal(a.app.pKpi(kpi.id).teamId,'org-airports');assert.equal(a.app.getState().platform.kpiHistory.length,1);assert.equal(a.app.pMetrics('org-airports').kpiCovered,1);
await a.event('click',{pAction:'person',pId:'org-airports'});
await a.event('submit',{platformForm:'person'},{values:{name:'مسئول آزمایشی',email:'test@example.invalid',title:'مسئول تمرینی',teamId:'org-airports'}});const person=a.app.getState().platform.people[0];assert.ok(person);
// Failed validation is atomic, including invalid goal alignment.
const before=JSON.stringify(a.app.getState());assert.throws(()=>a.app.pSubmit('goal',{objective:'نامعتبر',owner:'test',teamId:'company',parentId:'unknown',status:'draft'},'',{}));assert.equal(JSON.stringify(a.app.getState()),before);
assert.throws(()=>a.app.pSubmit('kr',{text:'مبنای یکسان',owner:'test',unit:'%',baseline:'10',target:'10',current:''},'',{objectiveId:objective.id}));assert.equal(JSON.stringify(a.app.getState()),before);
await a.event('click',{pAction:'adopt-logistics',pId:'air-fuel'});const count=a.app.getState().initiatives.length;await a.event('click',{pAction:'adopt-logistics',pId:'air-fuel'});assert.equal(a.app.getState().initiatives.length,count);assert.equal(a.app.getState().initiatives.find(i=>i.logisticsSourceId==='air-fuel').owner,'');
assert.equal(JSON.stringify(a.app.sourceDocument()),sourceBefore,'Source strategy must remain immutable');
// Refresh independently and verify the complete state, including new platform records.
const saved=plain(a.app.getState()),b=await boot(a.storage);assert.deepEqual(plain(b.app.getState()),saved);
for(const link of ['#goals/'+objective.id,'#results/'+kr.id,'#projects/'+project.id,'#tasks/'+task.id,'#sessions/'+meeting.id,'#people/'+person.id,'#kpis/'+kpi.id]){const deep=await boot(a.storage,html,false,{hash:link});assert.equal(deep.location.hash,link);assert.ok(deep.registry.get('platformBody').innerHTML.length>200);}
b.app.exportData();const exported=await b.downloads.at(-1).text();const imported=await boot();await imported.app.importData({text:exported});assert.deepEqual(plain(imported.app.getState()),saved,'JSON transfer must preserve all new records');
b.location.hash='#organization/org-airports';b.app.route();b.app.setLanguage('en');assert.equal(b.location.hash,'#organization/org-airports');assert.equal(b.document.documentElement.dir,'ltr');assert.ok(b.registry.get('platformBody').innerHTML.includes('Kish Airports'));b.app.setLanguage('fa');assert.equal(b.document.documentElement.dir,'rtl');
await b.event('change',{pFilter:'unit'},{value:'org-airports'});assert.equal(b.app.pFilter().unit,'org-airports');b.location.hash='#projects';b.app.route();await b.event('change',{pFilter:'group'},{value:'unit'});assert.ok(b.registry.get('platformBody').innerHTML.includes('p-group'));
b.app.pExportWork();assert.ok((await b.downloads.at(-1).text()).includes('بهبود هماهنگی شیفت'));b.app.pExportReport();assert.ok((await b.downloads.at(-1).text()).includes('Revision'));
assert.deepEqual(a.network(),{fetches:0,redirects:0});assert.ok(html.includes('prefers-reduced-motion'));assert.ok(html.includes('p-table-wrap'));assert.ok(html.includes('PLATFORM_RELEASE'));
console.log('PASS: source-correct hierarchy, all module routes/unit tabs, actual create/edit/check-in/task/meeting/KPI/person handlers, meeting follow-up deduplication, logistics adoption, truthful coverage/trends, atomic validation, complete refresh/deep-link/JSON restoration, CSV filters, bilingual direction and zero cloud calls.');
