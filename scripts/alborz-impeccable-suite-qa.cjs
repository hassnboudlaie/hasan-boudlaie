/* Alborz cross-surface Impeccable QA — deterministic, no live secrets or API calls. */
'use strict';
const fs=require('node:fs');
const path=require('node:path');
const assert=require('node:assert/strict');
const vm=require('node:vm');
const root=path.resolve(__dirname,'..','alborz-communication-skills');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const files=[
 ['index.html','academy'],
 ['session2-demo.html','communication-session2'],
 ['claims-workshop-v2.html','claims-course'],
 ['resilience.html','resilience-classroom'],
 ['claims-presentation.html','presentation']
];
let checks=0;
function ok(expr,label){assert(expr,label);checks++;}
const css=read('alborz-impeccable.css');
ok(css.includes('ALBORZ ACADEMY · IMPECCABLE DESIGN SYSTEM'),'shared provenance marker');
ok(css.includes('font-family:AlborzImpeccable'),'shared Persian font');
ok(css.includes('prefers-reduced-motion'),'reduced motion fallback');
ok(css.includes('focus-visible'),'keyboard focus design');
ok(css.includes('min-height:53px'),'touch sizes in mobile navigation');
for(const [file,surface] of files){
 const content=read(file);
 ok(content.includes('data-alborz-surface="'+surface+'"'),surface+' scope');
 ok(content.includes('alborz-impeccable.css?v=20261115-suite-r1'),surface+' CSS linked');
 ok(content.includes('dir="rtl"'),surface+' RTL');
 ok(content.includes('<main'),surface+' main landmark');
}
const index=read('index.html');
const a=index.indexOf('src="session3-listening-lab.js');
const b=index.indexOf('src="session3-impeccable-journey.js');
const c=index.indexOf('src="session4-speaking-lab.js');
ok(a>0&&b>a&&c>b,'session 3 wrapper follows core and precedes session 4');
ok(index.includes('if(id===4){window.alborzSession4Page();return}'),'session 4 isolated');
ok(index.includes('if(id===3){window.alborzSession3Page();return}'),'session 3 isolated');
const journey=read('session3-impeccable-journey.js');
new vm.Script(journey,{filename:'session3-impeccable-journey.js'});checks++;
for(const token of ['data-s3j-open="techniques"','data-s3j-open="practice"',
 'data-s3j-tech','data-s3j-group','data-s3j-stageback',
 'data-s3j-done','s3j-practice','s3j-case-group',
 'sessionStorage','requestAnimationFrame']){
 ok(journey.includes(token),'session3 guided route: '+token);
}
const original=read('session3-listening-lab.js');
new vm.Script(original,{filename:'session3-listening-lab.js'});checks++;
ok(original.includes('window.alborzSession3Page=function()'),'session 3 base intact');
ok(journey.includes('const original=window.alborzSession3Page'),'wrapper keeps base core');
const s4=read('session4-ob-mba-theme.js');
new vm.Script(s4,{filename:'session4-ob-mba-theme.js'});checks++;
ok(s4.includes('const original=window.alborzSession4Page'),'session 4 enhancement intact');
const exam=read('session4-final-exam.js');
ok(exam.includes('const DURATION_MS=360000'),'6-minute exam unchanged');
ok(exam.includes('if(!deadline)activateTimer()'),'starts at first answer');
const r=read('resilience.html');
ok(r.includes('classroom-flow.js'),'live classroom logic preserved');
ok(r.includes('resilience-live.js'),'live group engine preserved');
ok(r.includes('classroom-timer.js'),'instructor timer preserved');
const claims=read('claims-workshop-v2.html');
ok(claims.includes('claims-assertiveness-v2.js'),'assertiveness curriculum preserved');
const presentation=read('claims-presentation.html');
ok(presentation.includes('claims-presentation.js'),'instructor presentation source preserved');
console.log('PASS:',checks,'static checks across 5 entrypoints; session3/4 behavior and live-class integrations preserved.');
