const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),vm=require('node:vm');
const {JSDOM}=require('jsdom');const read=p=>fs.readFileSync(path.join(__dirname,p),'utf8');
function setup(){const w=new JSDOM(read('app/index.html'),{url:'https://example.test/sabanaft/app/',runScripts:'outside-only'}).window;w.HTMLElement.prototype.scrollIntoView=()=>{};w.eval(read('app/coaching-journey.js'));w.document.dispatchEvent(new w.Event('DOMContentLoaded'));return w;}
let w=setup(),d=w.document;assert.equal(d.querySelector('#cj-choice').value,'unknown');d.querySelector('#cj-situation').value='سناریوی فرضی برای بررسی مسئولیت مدیر در هماهنگی تیم';d.querySelector('#cj-guide').click();assert.equal(d.querySelectorAll('.cj-roles article').length,4);assert.match(d.querySelector('#cj-output').textContent,/تحلیل AI نیست/);assert.equal(d.querySelector('[data-cj-lesson]').dataset.cjLesson,'1/daily');
d.querySelector('#cj-choice').value='conflict';d.querySelector('#cj-guide').click();assert.equal(d.querySelectorAll('.cj-roles article').length,2);assert.match(d.querySelector('#cj-output').textContent,/Partner/);
const secondary=d.querySelector('[data-cj-secondary][value="capability"]');secondary.checked=true;d.querySelector('#cj-guide').click();assert.equal(d.querySelectorAll('.cj-roles article').length,4);assert.match(d.querySelector('#cj-output').textContent,/چالش‌های همزمان/);secondary.checked=false;
const notes=new JSDOM(read('app/lesson-notes.html')).window.document;assert.equal(notes.querySelectorAll('article').length,6);assert.equal(notes.querySelectorAll('#chapter6 li').length,7);assert.ok(notes.querySelector('#chapter6 a').getAttribute('href').includes('#/context'));assert.equal(notes.querySelectorAll('#chapter5 li').length,10);assert.equal(notes.querySelectorAll('#chapter5 details,#chapter5 button,#chapter5 a').length,0);assert.ok(!/[a-z]/i.test(notes.querySelector('#chapter5').textContent));assert.match(notes.querySelector('#chapter5').textContent,/توانمندساز/);
// Ensure service-worker upgrade retains unrelated app caches and offline notes resolve correctly.
const callbacks={},deleted=[];const sw={addEventListener:(n,f)=>callbacks[n]=f,skipWaiting:()=>{},clients:{claim:()=>{}}};let cached;
const caches={keys:async()=>['my-finance-cache','sabanaft-reflective-pwa-shell-v7','sabanaft-reflective-pwa-shell-v8','sabanaft-reflective-pwa-shell-v9','sabanaft-reflective-pwa-shell-v10'],delete:async k=>deleted.push(k),match:async k=>typeof k==='string'?(cached=k,'offline notes'):undefined};
vm.runInNewContext(read('app/sw.js'),{self:sw,caches,location:{origin:'https://example.test'},URL,fetch:async()=>{throw Error('offline')}});
(async()=>{let done;callbacks.activate({waitUntil:p=>done=p});await done;assert.deepEqual(deleted,['sabanaft-reflective-pwa-shell-v7','sabanaft-reflective-pwa-shell-v8','sabanaft-reflective-pwa-shell-v9','sabanaft-reflective-pwa-shell-v10']);callbacks.fetch({request:{method:'GET',url:'https://example.test/sabanaft/app/lesson-notes.html',mode:'navigate'},respondWith:p=>done=p});assert.equal(await done,'offline notes');assert.equal(cached,'./lesson-notes.html');
// Studio save failure must retain existing records and entered text.
const st=new JSDOM(read('leadership-studio.html'),{url:'https://example.test/sabanaft/leadership-studio.html',runScripts:'outside-only'}).window;st.scrollTo=()=>{};for(const f of ['role-communication.js','role-development.js','guided-reflection.js','reflective-content.js','my-reflection.js','light-flow.js','commercial-ux.js','case-clarity.js','impact-pulse.js','impact-report.js'])st.eval(read(f));const scripts=[...read('leadership-studio.html').matchAll(/<script[^>]*>([\s\S]*?)<\/script>/g)].map(m=>m[1]).filter(x=>x.trim());st.localStorage.setItem('sabanaft_leadership_studio_v1',JSON.stringify({schema:1,cases:[{id:'old',title:'کیس قبلی',situation:'سناریوی آزمایشی'}]}));st.eval(scripts[0]);st.SabanaftLeadershipStudio.navigate('daily');assert.ok(st.document.getElementById('guided-reflection-form'),'guided reflection is accessible');assert.ok(st.document.getElementById('rfx-form'),'legacy reflection remains accessible');
st.SabanaftLeadershipStudio.navigate('insights');assert.ok(st.document.querySelector('[data-saba-export-impact]'),'user-controlled CSV export available');
st.SabanaftLeadershipStudio.navigate('mix');assert.ok(st.document.getElementById('role-communication-form'),'Chapter 5 H06 communication prompt is visible');
st.document.getElementById('rc-statement').value='در تصمیم فوری Boss و در توسعه Coach هستم';
st.document.getElementById('rc-expectation').value='انتظار مشارکت واقعی در تصمیم‌ها دارم';
st.document.getElementById('rc-checkPrompt').value='برداشت شما از اختیار خودتان چیست؟';
st.document.getElementById('role-communication-form').dispatchEvent(new st.Event('submit',{bubbles:true,cancelable:true}));
assert.match(st.SabanaftLeadershipStudio.getState().roleCommunication.statement,/Boss/);
assert.ok(st.SabanaftLeadershipStudio.contextInsights(st.SabanaftLeadershipStudio.getState().cases[0]).some(x=>x.includes('پیام نقش رهبری')));
st.SabanaftLeadershipStudio.navigate('development');assert.equal(st.document.querySelectorAll('#role-development-form .dimension').length,4);
st.document.querySelector('#dev-focus').value='C';st.document.querySelector('#dev-goal').value='پرسش باز در موقعیت واقعی';st.document.querySelector('#dev-case').value='old';
st.document.querySelector('#role-development-form').dispatchEvent(new st.Event('submit',{bubbles:true,cancelable:true}));
assert.equal(st.SabanaftLeadershipStudio.getState().development.focus,'C');assert.equal(st.SabanaftLeadershipStudio.getState().development.caseId,'old');
st.SabanaftLeadershipStudio.navigate('workbench');assert.ok(st.document.getElementById('wb-toolUsed'),'role-tool fit in case workbench');
st.document.getElementById('wb-toolUsed').value='پرسش باز';
st.document.getElementById('wb-toolFit').value='تناسب با نقش Coach و شرایط تیم';
st.document.getElementById('decision-form').dispatchEvent(new st.Event('submit',{bubbles:true,cancelable:true}));
assert.equal(st.SabanaftLeadershipStudio.getState().cases[0].toolUsed,'پرسش باز');
assert.equal(st.SabanaftLeadershipStudio.getState().cases[0].toolFit,'تناسب با نقش Coach و شرایط تیم');

st.SabanaftLeadershipStudio.navigate('development');st.document.querySelector('#dev-review-action').value='در گفت‌وگوی آزمایشی دو سؤال باز پرسیدم';
st.document.querySelector('#role-development-review').dispatchEvent(new st.Event('submit',{bubbles:true,cancelable:true}));
assert.equal(st.SabanaftLeadershipStudio.getState().development.reviews.length,1);assert.equal(st.SabanaftLeadershipStudio.getState().development.reviews[0].caseId,'old');
// Independent retention regressions: real input events, navigation, restore, quota failure.
const api=st.SabanaftLeadershipStudio, state=api.dialogueBridge.state();
api.navigate('daily');
function typeDraft(value){const el=st.document.getElementById('gd-answer');el.value=value;el.dispatchEvent(new st.Event('input',{bubbles:true}));}
function submitDialogue(){st.document.getElementById('guided-reflection-form').dispatchEvent(new st.Event('submit',{bubbles:true,cancelable:true}));}
const answer='پاسخ آزمایشی با <متن> و & علامت';
typeDraft(answer);
assert.equal(JSON.parse(st.localStorage.getItem('sabanaft_leadership_studio_v1')).guidedDialogue.answers.moment,answer);
api.navigate('development');api.navigate('daily');
assert.equal(st.document.getElementById('gd-answer').value,answer,'unsent text survives route change');
submitDialogue();typeDraft('پاسخ مرحله دوم برای حفظ پیش نویس');
st.document.querySelector('[data-gd-back]').click();
assert.equal(st.document.getElementById('gd-answer').value,answer,'Back prefills submitted answer safely');
typeDraft('پاسخ ویرایش شده در مرحله اول');submitDialogue();
assert.equal(st.document.getElementById('gd-answer').value,'پاسخ مرحله دوم برای حفظ پیش نویس','later draft survives editing an earlier answer');
const restored={};st.SabaGuidedReflection.restore(restored,JSON.parse(st.localStorage.getItem('sabanaft_leadership_studio_v1')));
assert.equal(restored.guidedDialogue.stage,1);assert.equal(restored.guidedDialogue.answers.action,'پاسخ مرحله دوم برای حفظ پیش نویس');
// First-step draft must require confirmation before a new dialogue discards it.
state.guidedDialogue.stage=0;api.dialogueBridge.render();let confirmations=0;st.confirm=()=>{confirmations++;return false;};
st.document.querySelector('[data-gd-reset]').click();assert.equal(confirmations,1);assert.equal(state.guidedDialogue.answers.moment,'پاسخ ویرایش شده در مرحله اول');
// More than 60 development reviews survive a new entry and full normalization.
api.navigate('development');state.development.reviews=Array.from({length:65},(_,i)=>({date:'2026-11-05',caseId:'old',action:'retained review '+i,evidence:'',learning:''}));
st.document.querySelector('#dev-review-action').value='مرور شصت و ششم برای کنترل حفظ سوابق';
st.document.querySelector('#role-development-review').dispatchEvent(new st.Event('submit',{bubbles:true,cancelable:true}));
assert.equal(state.development.reviews.length,66);assert.equal(state.development.reviews[0].action,'retained review 0');
const reloaded={};st.SabaRoleDevelopment.restore(reloaded,JSON.parse(st.localStorage.getItem('sabanaft_leadership_studio_v1')));
assert.equal(reloaded.development.reviews.length,66);assert.equal(reloaded.development.reviews[0].action,'retained review 0');
// Keep earlier save-failure assertion independent of the history-size test.
state.development.reviews=state.development.reviews.slice(-1);api.developmentBridge.save();
const originalSetItem=st.Storage.prototype.setItem;st.Storage.prototype.setItem=function(){throw Error('quota')};
api.navigate('daily');typeDraft('پیش نویس هنگام پر بودن حافظه');api.navigate('development');api.navigate('daily');
assert.equal(st.document.getElementById('gd-answer').value,'پیش نویس هنگام پر بودن حافظه','failed save retains in-session text');
const unload=new st.Event('beforeunload',{cancelable:true});st.dispatchEvent(unload);assert.ok(unload.defaultPrevented,'failed persistence warns before closing');
st.Storage.prototype.setItem=originalSetItem;typeDraft('پیش نویس پس از بازیابی امکان ذخیره');
assert.equal(JSON.parse(st.localStorage.getItem('sabanaft_leadership_studio_v1')).guidedDialogue.answers.moment,'پیش نویس پس از بازیابی امکان ذخیره');

st.SabanaftLeadershipStudio.navigate('review');st.document.querySelector('#r-actual').value='نتیجه آزمایشی';st.Storage.prototype.setItem=function(){throw Error('quota')};st.document.querySelector('#reflection-form').dispatchEvent(new st.Event('submit',{bubbles:true,cancelable:true}));assert.equal(st.SabanaftLeadershipStudio.getState().reflections.length,0);assert.equal(st.document.querySelector('#r-actual').value,'نتیجه آزمایشی');assert.match(st.document.querySelector('#toast').textContent,/موفق نبود/);
st.SabanaftLeadershipStudio.navigate('development');st.document.querySelector('#dev-review-action').value='یک تمرین دیگر انجام شد';
st.document.querySelector('#role-development-review').dispatchEvent(new st.Event('submit',{bubbles:true,cancelable:true}));
assert.equal(st.SabanaftLeadershipStudio.getState().development.reviews.length,1);
assert.equal(st.document.querySelector('#dev-review-action').value,'یک تمرین دیگر انجام شد');
console.log('PASS chapter audit: optional multi-challenge intake, IDP plan and review, managing-up, Persian hypotheses, cache isolation, offline lessons, failed-save retention');w.close();st.close();})().catch(e=>{console.error(e);process.exitCode=1});
