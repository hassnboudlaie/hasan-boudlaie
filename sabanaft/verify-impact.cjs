const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {JSDOM}=require('jsdom');
const source=fs.readFileSync(path.join(__dirname,'impact-report.js'),'utf8');
const {window:w}=new JSDOM('<!doctype html><html><body></body></html>',{url:'https://example.test/sabanaft/leadership-studio.html',runScripts:'outside-only'});
w.eval(source);const m=w.SabaImpactExport;assert.ok(m);
const none=m.summarize({});assert.equal(none.cases,0);assert.equal(none.decisionCoverage,null);
const data={
 profile:{name:'SENSITIVE_PERSON_NAME'},
 cases:[
  {id:'c1',title:'CONFIDENTIAL_CASE_TITLE',situation:'SECRET_EMPLOYEE_DETAIL',decision:'قدم اول',action:'انجام گفت‌وگو'},
  {id:'c2',title:'CASE_2',decision:'',action:''}
 ],
 daily:{items:[{caseId:'c1',outcome:'واقعیت قابل مشاهده',event:'DONT_SHARE_REFLECTION',next:'next'}]},
 reflections:[{caseId:'c1',actual:'OTHER_PRIVATE_REFLECTION'}],
 simulationHistory:[{id:'sim'}],
 valuePulses:[{score:5},{score:3},{score:999}],
 development:{reviews:[{action:'PRIVATE_IDP_NOTE'}]}
};
const t=m.summarize(data);
assert.equal(t.cases,2);assert.equal(t.decisions,1);assert.equal(t.actions,1);assert.equal(t.reviewed,1);
assert.equal(t.reflections,1);assert.equal(t.roleplaySessions,1);assert.equal(t.developmentReviews,1);
assert.equal(t.voluntaryFeedback,2);assert.equal(t.feedbackMean,4);assert.equal(t.decisionCoverage,50);
const csv=m.csv(data),html=m.render(data);
for(const secret of ['SENSITIVE_PERSON_NAME','SECRET_EMPLOYEE_DETAIL','CONFIDENTIAL_CASE_TITLE','DONT_SHARE_REFLECTION','OTHER_PRIVATE_REFLECTION','PRIVATE_IDP_NOTE']){
 assert.equal(csv.includes(secret),false,'CSV must not include '+secret);
 assert.equal(html.includes(secret),false,'UI must not include '+secret);
}
assert.match(csv,/Recorded cases/);assert.ok(csv.startsWith('\uFEFF'));
assert.match(html,/Process Metrics/);assert.match(html,/data-saba-export-impact/);
let downloads=0;w.confirm=()=>false;w.document.body.innerHTML=html;
w.SabanaftLeadershipStudio={commercialBridge:{state:()=>data,toast:()=>{}}};
w.document.querySelector('[data-saba-export-impact]').click();
assert.equal(downloads,0);
w.close();console.log('PASS impact report: aggregate-only metrics, empty-state handling, data-minimal export, explicit consent');
