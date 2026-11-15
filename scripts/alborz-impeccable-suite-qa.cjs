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
ok(s4.includes('wrap.appendChild(nav)'),'S4 mobile navigation cannot leak into other sessions');
ok(s4.includes('detail.replaceChildren()'),'S4 index resets stale technique detail');
ok(s4.includes('repeated?.remove()'),'S4 checklist criterion not duplicated in feedback');
ok(s4.includes('actions.prepend(back)'),'S4 single roleplay action row');
ok(!s4.includes('document.body.appendChild(nav)'),'S4 no body-level stale navigation');
const coreS4=read('session4-speaking-lab.js');
const getS4Data=(prefix,next)=>{
 const a=coreS4.indexOf(prefix),b=coreS4.indexOf(next,a);
 ok(a>=0&&b>a,'S4 content marker '+prefix);
 return JSON.parse(coreS4.slice(a+prefix.length,b));
};
const s4Skills=getS4Data('const techniques=',';\\nconst techniqueDetails='.replace('\\n','\n'));
const s4Details=getS4Data('const techniqueDetails=',';\\nconst raw='.replace('\\n','\n'));
const s4Cases=getS4Data('const raw=',';\\nconst cases='.replace('\\n','\n'));
ok(s4Skills.length===6&&s4Details.length===6,'S4 has six distinct techniques');
ok(s4Details.every(x=>x.definition&&x.example&&x.pitfall),'S4 every technique has definition, branch example and pitfall');
ok(s4Cases.length===12&&new Set(s4Cases.map(x=>x[1])).size===12,'S4 has 12 unique roleplay scenarios');
ok(s4Cases.every((x,i)=>x[0]===s4Cases[i-(i%2)][0]),'S4 two cases for each of six roles');
ok(s4Cases.every(x=>x[4].split('|').length===6&&x[5].split('|').length===6),'S4 every case contains 3 speaking turns before and after');
const mobile=read('session4-mobile-first-20261115.css');
ok(s4.includes('session4-mobile-first-20261115.css?v=1'),'Session 4 mobile stylesheet loaded after existing theme');
ok(index.includes('session4-ob-mba-theme.js?v=20261115-session4-content-repair-r1'),'Session 4 JS cache-busted');
ok(mobile.includes('grid-template-columns:repeat(4,minmax(0,1fr))'),'Four-way mobile navigation is readable');
ok(mobile.includes('max-width:380px'),'320px phones covered');
ok(mobile.includes('prefers-reduced-motion'),'Accessible animation fallback');
ok(read('sw.js').includes('session4-mobile-first-20261115.css?v=1'),'PWA shell includes mobile CSS');
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
