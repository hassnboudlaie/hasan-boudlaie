/* Run with jsdom 26 installed: NODE_PATH=<node_modules> node verify-reflective.cjs */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {JSDOM,VirtualConsole}=require('jsdom');
const root=__dirname,html=fs.readFileSync(path.join(root,'index.html'),'utf8');
const scripts=['reflective-content.js','reflective-cases.js','reflective-app.js'].map(f=>fs.readFileSync(path.join(root,f),'utf8'));
const KEY='sabanaft_reflective_v2',old={'sabanaft_session1_v4':'{"note":"یادداشت قبلی"}','sabanaft_session6_v1':'{"answer":"پاسخ قبلی"}','sabanaft_practice_v1':'{"kept":true}'};
let assertions=0;const check=(x,message)=>{assert.ok(x,message);assertions++};
const equal=(a,b,message)=>{assert.equal(a,b,message);assertions++};
const plain=x=>JSON.parse(JSON.stringify(x));
function boot(seed={},options={}){
 const errors=[],downloads=[],blobs=[],vc=new VirtualConsole();vc.on('jsdomError',e=>errors.push(e));
 const dom=new JSDOM(html,{url:'https://hassnboudlaie.github.io/hasan-boudlaie/sabanaft/'+(options.hash||''),runScripts:'outside-only',virtualConsole:vc});
 const w=dom.window;w.scrollTo=()=>{};w.HTMLElement.prototype.scrollIntoView=()=>{};w.print=()=>{w.printed=true};w.confirm=()=>options.confirm!==false;
 w.Blob=Blob;w.URL.createObjectURL=b=>{blobs.push(b);return 'blob:qa-'+blobs.length};w.URL.revokeObjectURL=()=>{};
 const anchorClick=w.HTMLAnchorElement.prototype.click;w.HTMLAnchorElement.prototype.click=function(){if(this.download)downloads.push({name:this.download,url:this.href});else anchorClick.call(this)};
 for(const[k,v]of Object.entries(seed))w.localStorage.setItem(k,v);
 if(options.blockStorage)w.Storage.prototype.setItem=()=>{throw new Error('blocked')};
 for(const s of scripts)w.eval(s);
 const $=s=>w.document.querySelector(s),$$=s=>[...w.document.querySelectorAll(s)];
 const api=w.SabaReflectiveApp,state=()=>api.getState(),ctx=()=>state().contexts.find(c=>c.id===state().activeContext);
 const go=r=>api.navigate(r);
 const click=s=>{const el=$(s);check(el,'click target '+s);el.click()};
 const input=(s,v,event='input')=>{const el=$(s);check(el,'input target '+s);el.value=v;el.dispatchEvent(new w.Event(event,{bubbles:true}))};
 const snapshot=()=>Object.fromEntries(Object.keys(w.localStorage).map(k=>[k,w.localStorage.getItem(k)]));
 return {dom,w,$,$$,api,state,ctx,go,click,input,snapshot,errors,downloads,blobs};
}
async function run(){
 const t=boot(old),{w,$,$$,api,state,ctx,go,click,input}=t,D=w.SABA_REFLECTIVE,C=w.SABA_CASES;
 equal(D.sessions.length,9,'nine sessions');equal(D.sessions.reduce((n,s)=>n+s.sections.length,0),47,'47 sections');
 equal(D.dimensions.length,18,'18 dimensions');equal(D.roles.length,4,'four roles');equal(D.benefits.length,8,'eight benefits');equal(C.length,15,'15 appendix themes');
 assert.deepEqual(plain(D.sessions.map(s=>s.sections.length)),[5,5,5,5,6,5,5,6,5]);assertions++;
 equal($$('.session-card').length,9,'home cards');equal(ctx().completed.length,0,'opening home never completes lessons');
 check(!Object.values(ctx().mix).flatMap(Object.values).some(x=>x!==null),'no preselected mix');
 for(const s of D.sessions){
  equal(s.checks.length,2,'two concept checks');
  for(const q of s.checks)check(q.correct>=0&&q.correct<q.options.length&&q.why,'concept answer valid');
  go('s/'+s.id+'/overview');equal($$('.section-card').length,s.sections.length,'overview section count');
  for(const x of s.sections){
   check(x.source.chapter&&x.source.pages&&x.blocks.length>=2,'each section has substantive blocks and printed-page source');
   go('s/'+s.id+'/'+x.id);equal($('#lessonTitle').textContent,x.title,'section title');
   equal($$('#sidebar nav a').length,s.sections.length+1,'sidebar follows variable structure');
   equal($$('#sidebar nav a[aria-current="page"]').length,1,'current page indicated');
   const ids=$$('[id]').map(el=>el.id);equal(new Set(ids).size,ids.length,'unique DOM IDs');
   for(const img of $$('img'))check(fs.existsSync(path.join(root,img.getAttribute('src'))),'local photo/logo exists');
   for(const a of $$('[data-route]'))check(api.parseRoute('#'+a.dataset.route).kind!=='home'||a.dataset.route==='home','all internal links resolve: '+a.dataset.route);
  }
 }
 equal(ctx().completed.length,0,'opening all pages does not complete work');
 go('s/1/daily');click('.skip-link');equal(w.document.activeElement.id,'main','skip link focus');equal(w.location.hash,'#s/1/daily','skip link preserves current lesson');
 input('#sectionNote','یادداشت اختصاصی ستاد');click('[data-complete]');equal(ctx().completed.length,1,'explicit completion');
 input('[data-context-select]','project','change');equal($('#sectionNote').value,'','notes isolated by context');equal(ctx().completed.length,0,'completion isolated');
 input('#sectionNote','یادداشت پروژه');input('[data-context-select]','hq','change');equal($('#sectionNote').value,'یادداشت اختصاصی ستاد','prior note restored');
 go('s/2/map');equal($$('.dimension').length,7,'tasks and people dimensions');
 for(const el of $$('[data-dimension][data-time=now], [data-dimension][data-time=future]'))equal(el.value,'','context starts unrated');
 const dim=D.dimensions[0].id;input('[data-dimension="'+dim+'"][data-time=now]','4','change');input('[data-dimension="'+dim+'"][data-time=future]','8','change');
 check($('#horizonHint').textContent.includes('مشخص کنید'),'future horizon prompt');input('#horizon','پایان مرحله فعلی');input('#evidence-'+dim,'شاهد بافت');
 equal(ctx().dimensions[dim].now,4,'today saved');equal(ctx().dimensions[dim].future,8,'future saved');equal(ctx().dimensions[dim].evidence,'شاهد بافت','evidence saved');
 go('s/3/map');equal($$('.dimension').length,11,'team and organization dimensions');equal($('#horizon').value,'پایان مرحله فعلی','shared horizon');
 go('s/5/mix');for(const[r,v]of Object.entries({B:4,C:3,P:2,E:1}))input('#mix-appropriate-'+r,String(v));
 equal(api.roleTotals(ctx().mix.appropriate).sum,10,'ten point mix');check($('#mix-total-appropriate').textContent.includes('آماده'),'valid mix status');
 input('#mix-appropriate-B','11');equal(ctx().mix.appropriate.B,4,'invalid role value not saved');check(!$('#mix-appropriate-B').checkValidity(),'native validity');
 input('#mix-appropriate-B','4');input('#field-mixText-mixWhy','استدلال بر اساس شواهد');
 for(const item of C){
  equal(new Set(item.options.map(o=>o.role)).size,4,'all role options distinct');check(!('correct' in item),'cases have no normative answer');
  go('s/9/cases/'+item.id);equal($$('.case-options .option').length,4,'four case choices');
  for(const o of item.options){click('[data-case-choice="'+o.role+'"]');equal(ctx().cases[item.id].choice,o.role,'case saved');check($('#caseFeedback').textContent.includes(D.roles.find(r=>r.id===o.role).en),'feedback identifies chosen role');check(!$('#caseFeedback').textContent.includes('نمره'),'no case score')}
 }
 const item=C[0];go('s/9/cases/'+item.id);input('[data-case-note=reason]','دلیل بافتی من');input('[data-case-note=alternative]','گزینه دیگر معقول');input('[data-case-note=condition]','شرط تغییر من');
 go('s/9/review');equal($$('.count-grid b').reduce((n,e)=>n+Number(e.textContent.replace(/[۰-۹]/g,c=>'۰۱۲۳۴۵۶۷۸۹'.indexOf(c))),0),15,'case frequencies sum to answered cases');
 input('[data-context-select]','project','change');check(!ctx().cases[item.id]?.choice,'case isolation');input('[data-context-select]','hq','change');
 go('s/7/perspectives');check($('#field-perspectives-expected').disabled,'actual employee input gated');equal($('#field-perspectives-expected').value,'','no fabricated feedback');
 input('#field-perspectives-idea','برداشت مطلوب من');input('#employeeInput','yes','change');input('#field-perspectives-expected','انتظار گفته‌شده');input('#field-perspectives-experienced','رفتار تجربه‌شده');
 input('#employeeInput','no','change');equal($('#field-perspectives-expected').value,'','hidden when not collected');
 input('#employeeInput','yes','change');equal($('#field-perspectives-expected').value,'انتظار گفته‌شده','manual entry retained');
 go('s/7/peer');input('#field-journal-title','مرور یک رویداد');input('#journalRole','C','change');input('#field-journal-next','قدم بعدی');
 go('s/8/design');input('#toolBenefit',D.benefits[0].id,'change');input('#field-tool-method','روش پیشنهادی من');input('#field-tool-permission','هماهنگی مسئول مجاز');
 go('s/9/plan');input('#field-plan-behavior','رفتار قابل مشاهده');input('#field-plan-review','مرور دو هفته بعد');
 for(const s of D.sessions){
  go('s/'+s.id+'/'+s.sections.at(-1).id);equal($$('.knowledge .feedback').length,0,'explanations withheld');
  click('[data-submit-check]');check(!ctx().checks[s.id]?.submitted,'cannot submit unanswered check');
  for(let i=0;i<s.checks.length;i++)click('[data-check-question="'+i+'"][data-check-option="'+s.checks[i].correct+'"]');
  equal($$('.knowledge .feedback').length,0,'explanations withheld until submit');click('[data-submit-check]');equal($$('.knowledge .feedback').length,2,'analyses revealed');check(ctx().checks[s.id].submitted,'submission saved');
  click('[data-check-question="0"][data-check-option="'+((s.checks[0].correct+1)%s.checks[0].options.length)+'"]');equal($$('.knowledge .feedback').length,0,'changing answer clears prior analysis');
 }
 go('portfolio');for(const text of ['یادداشت اختصاصی ستاد','شاهد بافت','استدلال بر اساس شواهد','دلیل بافتی من','گزینه دیگر معقول','شرط تغییر من','انتظار گفته‌شده','روش پیشنهادی من','رفتار قابل مشاهده'])check($('#main').textContent.includes(text),'portfolio includes '+text);
 check($$('.portfolio-section details[open]').length>0,'case reasoning available in print');click('[data-action=print]');check(w.printed,'print hook');
 click('[data-action=export]');const exported=JSON.parse(await t.blobs.at(-1).text());equal(exported.schema,2,'export schema');equal(exported.contexts.length,3,'export all contexts');equal(t.downloads.at(-1).name,'sabanaft-reflective-work.json','export filename');
 click('[data-action=export-legacy]');const legacy=JSON.parse(await t.blobs.at(-1).text());equal(Object.keys(legacy.data).length,3,'legacy backup readable');
 for(const[k,v]of Object.entries(old))equal(w.localStorage.getItem(k),v,'v1 key unchanged');
 const reloaded=boot(t.snapshot());reloaded.go('s/1/daily');equal(reloaded.$('#sectionNote').value,'یادداشت اختصاصی ستاد','reload persistence');reloaded.go('s/5/mix');equal(reloaded.$('#mix-appropriate-B').value,'4','mix reload');
 go('home');input('#newContextName','حوزه تازه');click('[data-action=add-context]');equal(ctx().name,'حوزه تازه','new context');check(!Object.keys(ctx().notes).length,'new context empty');
 go('s/4/roles');w.innerWidth=390;click('#menuToggle');equal($('#menuToggle').getAttribute('aria-expanded'),'true','menu opens');check($('#main').inert,'main inert');
 const last=$$('#sidebar a').at(-1);last.focus();last.dispatchEvent(new w.KeyboardEvent('keydown',{key:'Tab',bubbles:true,cancelable:true}));equal(w.document.activeElement.className,'close-menu','drawer focus wraps');
 w.document.dispatchEvent(new w.KeyboardEvent('keydown',{key:'Escape',bubbles:true,cancelable:true}));equal($('#menuToggle').getAttribute('aria-expanded'),'false','Escape closes');equal(w.document.activeElement.id,'menuToggle','focus returned');check(!$('#main').inert,'main restored');
 equal(api.parseRoute('#session4-techniques').session.id,4,'legacy session route');equal(api.parseRoute('#m1').session.id,1,'legacy first session route');equal(api.parseRoute('#s/88/missing').kind,'home','bad route safe');
 const corrupt=boot({[KEY]:'not json'});equal(corrupt.state().contexts.length,3,'malformed storage fallback');corrupt.go('s/1/daily');corrupt.input('#sectionNote','تعویض داده خراب');check(!corrupt.$('#saveStatus').classList.contains('error'),'save recovers');
 const blocked=boot({}, {blockStorage:true});blocked.go('s/1/daily');blocked.input('#sectionNote','یادداشت در حافظه');check(blocked.$('#saveStatus').classList.contains('error'),'blocked storage disclosed');equal(blocked.ctx().notes['s1-daily'],'یادداشت در حافظه','work retained in memory');
 const payload=plain(exported);payload.contexts[0].notes['s1-daily']='<img src=x onerror=alert(1)><script>alert(1)</script>';payload.contexts[0].mix.appropriate.B=500;payload.contexts[0].dimensions[dim].now=-3;payload.contexts[0].cases[item.id].choice='X';
 const safe=boot({[KEY]:JSON.stringify(payload)});safe.go('s/1/daily');equal(safe.$('#main script'),null,'imported text never becomes script');equal(safe.$('#main img'),null,'imported text never becomes image');check(safe.$('#sectionNote').value.includes('<img'),'raw text preserved as text');equal(safe.ctx().mix.appropriate.B,null,'invalid imported mix');equal(safe.ctx().dimensions[dim].now,null,'invalid imported dimension');equal(safe.ctx().cases[item.id].choice,null,'invalid imported role');
 async function importData(instance,raw){instance.go('portfolio');Object.defineProperty(instance.$('#importFile'),'files',{value:[{size:100,text:async()=>typeof raw==='string'?raw:JSON.stringify(raw)}],configurable:true});instance.$('#importFile').dispatchEvent(new instance.w.Event('change',{bubbles:true}));await new Promise(r=>setImmediate(r));}
 await importData(t,exported);equal(t.state().contexts.length,3,'valid import restores all');equal(t.ctx().notes['s1-daily'],'یادداشت اختصاصی ستاد','import restores content');
 const before=JSON.stringify(t.state());await importData(t,'{broken');equal(JSON.stringify(t.state()),before,'bad JSON import leaves state');await importData(t,{schema:2,contexts:[{id:'<bad>'}]});equal(JSON.stringify(t.state()),before,'unusable contexts rejected');await importData(t,null);equal(JSON.stringify(t.state()),before,'null import safe');
 const cancel=boot({}, {confirm:false});const cancelBefore=JSON.stringify(cancel.state());await importData(cancel,exported);equal(JSON.stringify(cancel.state()),cancelBefore,'cancel import leaves state');
 const style=w.document.createElement('style');style.textContent=fs.readFileSync(path.join(root,'assets/reflective.css'),'utf8');w.document.head.append(style);check(style.sheet.cssRules.length>100,'stylesheet parses');
 for(const inst of [t,reloaded,corrupt,blocked,safe,cancel]){equal(inst.errors.length,0,'no DOM runtime errors: '+inst.errors.map(x=>x.message).join('; '));inst.dom.window.close()}
 console.log('PASS: '+assertions+' assertions; 9 sessions / 47 routes; 18 dimensions; all 60 case choices; concept checks, context isolation, local save/reload, import/export, legacy retention and drawer keyboard behavior. No browser layout test.');
}
run().catch(e=>{console.error(e.stack);process.exitCode=1});
