'use strict';
/* Non-destructive regression tests for the existing Kish Strategy Map module.
   Run from the repository root: node okr-system/tests/perdoo3-map-regression.cjs */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const modulePath = path.join(__dirname,'..','assets','kish-strategy-map-20261025.js');
const js = fs.readFileSync(modulePath,'utf8');
const window = {addEventListener(){}};
const document = {addEventListener(){},getElementById(){return null;}};
vm.runInNewContext(js,{window,document,Intl,Date,Set,Map,Number,String,Math,Object,Array,encodeURIComponent},{filename:modulePath,timeout:5000});
assert.equal(typeof window.KishMapView?.render,'function','Map entry point');
function fixture(){
 return {
  strategy:{ultimateGoal:'کیش؛ هاب لجستیک ایمن',pillars:[{id:'p1',title:'بهره‌وری'},{id:'p2',title:'لجستیک بندری',parentId:'p1'}]},
  goals:[{id:'g1',parentId:'p2',objective:'ارتقای خدمات بندری',owner:'',status:'active',progressMode:'weighted',krs:[{id:'kr1',text:'نتیجه یکم',baseline:0,target:100,current:100,weight:1},{id:'kr2',text:'نتیجه دوم',baseline:0,target:100,current:0,weight:3}]}],
  kpis:[],cycles:[{id:'cy1',cadenceId:'ca1',name:'سال',start:'2026-03-21',end:'2027-03-20',goalIds:['g1']}],
  cadences:[{id:'ca1',type:'annual'}],teams:[],history:[],people:[],initiatives:[]
 };
}
let data=fixture(),out=window.KishMapView.render(data);
assert.ok(out.includes('km-nested-lane'),'nested strategic pillar is rendered');
assert.ok(out.includes('لجستیک بندری'),'nested pillar name is visible');
assert.equal(out.split('ارتقای خدمات بندری').length-1,1,'goal appears once');
assert.ok(out.includes('۲۵٪'),'weighted progress 25%');
assert.ok(out.includes('رکن راهبردی'),'strategy count visible');
data.goals[0].progressMode='average';
out=window.KishMapView.render(data);
assert.ok(out.includes('۵۰٪'),'legacy simple mean retained');
data.goals[0].progressMode='weighted';
delete data.goals[0].krs[1].weight;
out=window.KishMapView.render(data);
assert.ok(!out.includes('۲۵٪')&&!out.includes('۵۰٪'),'missing weight does not invent progress');
data=fixture();data.goals[0].krs[0].current=null;data.goals[0].krs[1].current=null;
out=window.KishMapView.render(data);
assert.ok(out.includes('—'),'missing actual is disclosed');
data=fixture();data.goals[0].objective='<img src=x onerror=alert(1)>';
out=window.KishMapView.render(data);
assert.ok(!out.includes('<img src=x'),'XSS-sensitive title is escaped');
data=fixture();data.strategy.pillars=[{id:'p1',title:'A',parentId:'p2'},{id:'p2',title:'B',parentId:'p1'}];
out=window.KishMapView.render(data);
assert.ok(out.includes('ساختار ارکان دارای چرخه'),'cycles do not recurse forever');
// Cross-view parity: same Objective must produce the same progress on Team and Map.
const teamJs=fs.readFileSync(path.join(__dirname,'..','assets','kish-team-dashboard-20261025.js'),'utf8');
document.documentElement={lang:'fa'};
vm.runInNewContext(teamJs,{window,document,Intl,Date,Set,Map,Number,String,Math,Object,Array,encodeURIComponent},{filename:'kish-team-dashboard-20261025.js',timeout:5000});
const cross=fixture().goals[0];
assert.equal(window.KishTeamView.progress(cross),25,'Map and Team weighted agreement');
cross.progressMode='average';
assert.equal(window.KishTeamView.progress(cross),50,'Map and Team default average agreement');
cross.progressMode='weighted';
delete cross.krs[0].weight;
assert.equal(window.KishTeamView.progress(cross),null,'Unknown weight is consistent across views');
console.log('PASS Kish Map and Team cross-view regression suite');