/* Integration checks for Saba Naft PWA coach -> studio handoff, isolated storage and privacy. */
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const { JSDOM, VirtualConsole } = require('jsdom');
const ROOT = __dirname;
const read = p => fs.readFileSync(path.join(ROOT,p),'utf8');
function env(html,pathname) {
 const vc=new VirtualConsole(),errors=[];vc.on('jsdomError',e=>errors.push(e));
 const dom=new JSDOM(html,{url:'https://hassnboudlaie.github.io/hasan-boudlaie/sabanaft/'+pathname,runScripts:'outside-only',virtualConsole:vc});
 const w=dom.window;
 w.scrollTo=()=>{};
 w.HTMLElement.prototype.scrollIntoView=()=>{};
 w.confirm=()=>true;
 return {w,errors,dom};
}
async function run(){
 // PWA case intake and deterministic coaching answer, with AI intentionally disabled.
 const {w,errors}=env(read('app/index.html'),'app/');
 for(const f of ['reflective-content.js','app/app.js','app/coaching-journey.js','app/ai-connector.js'])w.eval(read(f));
 assert.equal(w.document.getElementById('cj-ask-ai').disabled,true,'AI remains disabled without secure backend/login');
 w.location.hash='#/coach';w.dispatchEvent(new w.HashChangeEvent('hashchange'));
 const $=id=>w.document.getElementById(id);
 $('cj-situation').value='سرپرست پروژه از اختلاف اولویت بین اجرا و تدارکات گزارش داده و درباره مسئولیت هماهنگی سؤال دارد.';
 $('cj-choice').value='conflict';
 $('cj-urgency').value='normal';
 $('cj-guide').click();
 assert.equal($('cj-output').hidden,false,'case guide visible');
 assert.match($('cj-output').textContent,/دو گزینه رفتاری قابل دفاع/);
 assert.match($('cj-output').textContent,/Partner/);
 assert.match($('cj-output').textContent,/Boss/);
 const human=$('cj-book-human'),mailEvt=new w.MouseEvent('click',{bubbles:true,cancelable:true});
 human.dispatchEvent(mailEvt);assert.ok(!decodeURIComponent(human.href).includes('سرپرست پروژه از اختلاف'),'human coach email never auto-shares case');
 $('cj-share-summary').checked=true;
 human.dispatchEvent(new w.MouseEvent('click',{bubbles:true,cancelable:true}));
 assert.ok(decodeURIComponent(human.href).includes('سرپرست پروژه از اختلاف'),'case shared only on explicit opt-in');
 $('cj-send-studio').click();
 const handoff=JSON.parse(w.localStorage.getItem('sabanaft_case_handoff_v1'));
 assert.match(handoff.text,/سرپرست پروژه/);
 assert.equal(handoff.issue,'conflict');
 assert.equal(w.localStorage.getItem('sabanaft_leadership_studio_v1'),null,'app does not mutate existing studio database directly');
 assert.equal(w.localStorage.getItem('sabanaft_reflective_v2'),null,'course progress untouched');

 // Studio consumes the one-time handoff and retains existing saved cases.
 const {w:studio}=env(read('leadership-studio.html'),'leadership-studio.html');
 studio.localStorage.setItem('sabanaft_case_handoff_v1',JSON.stringify(handoff));
 studio.localStorage.setItem('sabanaft_leadership_studio_v1',JSON.stringify({
  schema:1,cases:[{id:'old',title:'موقعیت قبلی',situation:'یک کیس قدیمی فرضی'}],
 }));
 const deps=['reflective-content.js','my-reflection.js','light-flow.js','commercial-ux.js','case-clarity.js','impact-pulse.js'];
 for(const f of deps)studio.eval(read(f));
 const html=read('leadership-studio.html'),scripts=[...html.matchAll(/<script(?:[^>]*)>([\s\S]*?)<\/script>/g)].map(m=>m[1]).filter(s=>s.trim());
 assert.equal(scripts.length,1,'studio has one inline app script');
 studio.eval(scripts[0]);
 const state=studio.SabanaftLeadershipStudio.getState();
 assert.equal(state.cases.length,2,'old case preserved and new case added');
 assert.ok(state.cases.some(c=>c.id==='old'),'previous data retained');
 assert.ok(state.cases.some(c=>c.situation===handoff.text),'new case registered');
 assert.equal(studio.localStorage.getItem('sabanaft_case_handoff_v1'),null,'one-time handoff removed after successful save');
 assert.equal(studio.location.hash,'#workbench','new case opens directly in decision workbench');
 console.log('Saba Naft coach integration passed: 16 checks');
}
run().catch(e=>{console.error(e.stack||e);process.exitCode=1});
