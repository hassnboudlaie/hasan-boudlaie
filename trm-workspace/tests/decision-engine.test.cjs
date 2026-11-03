'use strict';
const fs=require('fs'),vm=require('vm'),assert=require('assert');
const path=require('path');
const file=fs.readFileSync(path.join(__dirname,'..','decision-engine.js'),'utf8');
const env={window:{}};
vm.runInNewContext(file,env);
const E=env.window.TRMEngine;
assert.equal(E.version,'3.0');
const role={id:'r1',name:'Critical engineer',strategic:5,availability:2,demand:3,strategyEvidence:'research',marketEvidence:'past hiring',challenges:'operational failures',targetGroup:'engineers',gap:'train tools'};
const db={roles:[role],people:[{roleId:'r1',consent:'yes',readiness:'later'},{roleId:'r1',consent:'no',readiness:'now'}],evps:[{roleId:'r1',strengths:'real assignments',preferences:'autonomy',competition:'competitors',difference:'autonomy',proof:'approved project'}],vacancies:[{id:'v1',roleId:'r1',reason:'growth',owner:'recruiter'}],sourcingPlans:[],activities:[]};
for (const type of ['evp','role','relationship','vacancy']){
 const r=E.analyze(db,type,{roleId:'r1',vacancyId:'v1'});
 assert(r.title&&r.source&&r.steps.length>0,type);
}
const vacancy=E.analyze(db,'vacancy',{roleId:'r1',vacancyId:'v1'});
assert(vacancy.summary.includes('1 |') || vacancy.summary.includes('1 ') || vacancy.summary.includes('1؛'),'only opted-in candidate should be counted');
const incomplete=E.evpAssessment(db,role,{strengths:'real',preferences:'growth',competition:'rivals',difference:'real'});
assert(incomplete.missing.includes('شاهد واقعی و Signature Experience'));
assert(incomplete.draft.includes('فاقد شاهد'));
assert(!file.includes('api.openai.com'));
const noRole=E.analyze({roles:[],people:[],activities:[]},'vacancy',{});
assert(noRole.missing.includes('نقش'));
console.log('TRM decision engine: all tests passed');
