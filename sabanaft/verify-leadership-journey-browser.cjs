/* Real browser acceptance: ten stages, temporal edge cases, persistence and exports. */
'use strict';
const {chromium}=require('playwright'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const BASE=process.env.SABA_TEST_URL||'http://127.0.0.1:4173/sabanaft/app/#/journey';
const OUT=path.join(__dirname,'../artifacts/saba-leadership-journey');fs.mkdirSync(OUT,{recursive:true});
const KEY='sabanaft_leadership_journey_v1';
const logs=[];const read=p=>p.evaluate(k=>JSON.parse(localStorage.getItem(k)),KEY);
const click=(p,a)=>p.locator('[data-lj="'+a+'"]').click();
const panel=(p,n)=>p.locator('[data-lj-panel="'+n+'"]').first().click();
async function shot(p,name){await p.screenshot({path:path.join(OUT,name+'.png'),fullPage:true});}
async function layout(p){
 const bad=await p.locator('#journeyRoot').evaluate(root=>Array.from(root.querySelectorAll('*')).filter(e=>{const r=e.getBoundingClientRect(),s=getComputedStyle(e);return r.width&&r.height&&s.visibility!=='hidden'&&(r.left< -1||r.right>innerWidth+1)}).map(e=>e.className||e.tagName));
 assert.deepEqual(bad,[],'Journey must fit viewport without clipping');
}
async function open(context,time){const p=await context.newPage();p.on('dialog',d=>d.accept());await p.clock.install({time:new Date(time||'2026-11-13T12:00:00Z')});await p.goto(BASE,{waitUntil:'domcontentloaded'});return p;}
async function fullJourney(browser,name,width){
 const ctx=await browser.newContext({viewport:{width,height:900},locale:'fa-IR',reducedMotion:'reduce',acceptDownloads:true});let p=await open(ctx);const errors=[];p.on('pageerror',e=>errors.push(e.message));
 await p.locator('[data-lj="startCompetitive"]').waitFor();await layout(p);await shot(p,name+'-intro');
 const annual=await p.evaluate(()=>Object.fromEntries(Object.entries(localStorage).filter(([k])=>/gamification|passport/i.test(k))));
 await click(p,'startCompetitive');await layout(p);await shot(p,name+'-learning');
 await click(p,'pause');assert.ok(await p.locator('#ljPauseClock').isVisible());await p.clock.fastForward(10000);await click(p,'resume');assert.equal((await read(p)).pause.used,true);
 let expected=0;const points=[8,6,4,2,8,6,8,4,8,8];
 for(let i=0;i<10;i++){
  assert.equal((await read(p)).stage,i);
  if(i<3){await click(p,'hint');await click(p,'confirmHint');assert.equal(await p.locator('.lj-hint-grid>div').count(),3);await p.keyboard.press('Escape');await click(p,'hint');await click(p,'closeHint');assert.equal((await read(p)).hintsUsed.length,i+1);}
  if(i===2){ // Time expires while a hint dialog is open: overtime must replace it.
   await click(p,'hint');await p.clock.fastForward(3600001);await p.locator('#ljExtraMinutes').waitFor();
   assert.equal(await p.locator('.lj-hint-grid').count(),0);await p.locator('#ljExtraMinutes').fill('7');await click(p,'extend');assert.equal((await read(p)).extensions[0].penalty,4);
  }
  await panel(p,1);await layout(p);if(i===0)await shot(p,name+'-decision');
  const choice=await p.evaluate(({i,points})=>window.SABA_LEADERSHIP_JOURNEY.steps[i].options.findIndex(o=>o.points===points),{i,points:points[i]});
  await p.locator('input[name="ljDecision"][value="'+choice+'"]').check();await panel(p,2);
  await p.locator('#ljPractice').fill('در جلسه بعد، مرز اختیار و موعد تحویل را با مسئول برنامه‌ریزی روشن می‌کنم و نتیجه را پس از دو هفته بررسی می‌کنیم.');await p.locator('#ljRating').selectOption(String(i%5+1));
  if(i===0){await p.reload({waitUntil:'domcontentloaded'});assert.match(await p.locator('#ljPractice').inputValue(),/مرز اختیار/);assert.equal((await read(p)).drafts[0].choice,choice);await shot(p,name+'-practice');}
  if(i===4){const now=await p.evaluate(()=>Date.now());await p.close();p=await open(ctx,now);p.on('pageerror',e=>errors.push(e.message));assert.equal((await read(p)).stage,4);assert.match(await p.locator('#ljPractice').inputValue(),/موعد تحویل/);}
  await click(p,'submit');expected+=points[i]+2;assert.equal((await read(p)).answers[i].points,points[i]+2);assert.equal(await p.locator('.lj-fullreview').count(),0);await layout(p);
  if(i===0)await shot(p,name+'-feedback');await click(p,'advance');
  if(i===3||i===7){assert.ok(await p.locator('.lj-recovery').isVisible());assert.equal(await p.locator('[data-lj="breakContinue"]').isDisabled(),true);await shot(p,name+'-recovery-'+i);await p.clock.fastForward(30001);await click(p,'breakContinue');}
 }
 const state=await read(p);assert.equal(state.finished,true);assert.equal(Object.keys(state.answers).length,10);assert.equal(state.history.at(-1).net,expected-6);assert.equal(state.history.at(-1).badge,'نقره‌ای');assert.equal(await p.locator('.lj-review-item').count(),10);assert.equal(await p.locator('.lj-option-review').count(),40);assert.equal(state.breaksDone.length,2);
 await p.locator('.lj-review-item summary').first().click();await layout(p);await shot(p,name+'-result');
 await p.locator('#ljAction').fill('در جلسه هفتگی، اختیار تغییر ترتیب کار را با سرپرست روشن می‌کنم.');await p.locator('#ljDue').fill('2026-11-27');await p.locator('#ljEvidence').fill('ثبت دو تصمیم مستقل و بازخورد سرپرست');await click(p,'saveCommitment');await p.reload({waitUntil:'domcontentloaded'});assert.match(await p.locator('#ljAction').inputValue(),/جلسه هفتگی/);
 const dl=p.waitForEvent('download');await click(p,'png');const download=await dl;const file=path.join(OUT,name+'-badge.png');await download.saveAs(file);assert.ok(fs.statSync(file).size>1000);
 await p.evaluate(()=>{window.__printed=0;window.print=()=>{window.__printed++}});await click(p,'print');assert.equal(await p.evaluate(()=>window.__printed),1);await p.emulateMedia({media:'print'});await p.pdf({path:path.join(OUT,name+'-badge.pdf'),printBackground:true});await p.emulateMedia({media:'screen'});
 for(const route of ['course','passport','stage/idea','stage/relationship','stage/tools','stage/reflection','context','studio/cases','coach','home']){await p.goto(BASE.replace('#/journey','#/'+route),{waitUntil:'domcontentloaded'});assert.ok(await p.locator('.view.active').count()>0);}
 await p.goto(BASE,{waitUntil:'domcontentloaded'});assert.ok((await read(p)).finished);assert.deepEqual(await p.evaluate(()=>Object.fromEntries(Object.entries(localStorage).filter(([k])=>/gamification|passport/i.test(k)))),annual,'Journey must not alter annual score storage');
 assert.deepEqual(errors,[]);logs.push({name,width,completed:10,raw:expected,penalty:6,net:expected-6,exports:['PNG','print','PDF'],routes:10});await ctx.close();
}
async function edges(browser){
 const ctx=await browser.newContext({viewport:{width:390,height:844}});const p=await open(ctx);await click(p,'startCompetitive');await click(p,'pause');await p.clock.fastForward(300001);assert.equal((await read(p)).pause.since,0);assert.equal(await p.locator('[data-lj="pause"]').isDisabled(),true);await p.reload({waitUntil:'domcontentloaded'});assert.equal(await p.locator('#ljPauseClock').count(),0);
 await click(p,'hint');await p.keyboard.press('Tab');assert.equal(await p.evaluate(()=>!!document.activeElement.closest('#ljModal')),true);await p.keyboard.press('Escape');assert.equal(await p.locator('#ljModal').count(),0);
 const before=await read(p);await click(p,'restart');const after=await read(p);assert.equal(after.startedAt,before.startedAt);assert.deepEqual(after.pause,before.pause);
 await click(p,'switch');assert.equal((await read(p)).mode,'study');assert.equal(await p.locator('#ljClock').count(),0);
 for(let i=0;i<10;i++){assert.equal((await read(p)).stage,i);await panel(p,1);await p.locator('.lj-study-reasons summary').click();assert.equal(await p.locator('.lj-study-reasons>div').count(),4);await click(p,'hint');await click(p,'closeHint');if(i<9)await click(p,'nextStudy');}
 await click(p,'finishStudy');assert.match(await p.locator('.lj-result-feedback').innerText(),/جمع‌بندی مطالعه آزاد/);assert.equal((await read(p)).history.length,0);await shot(p,'study-finished');await click(p,'reviewStudy');await click(p,'prev');assert.equal((await read(p)).stage,8);
 // Old v1 state survives with canonical option indices and pre-existing data.
 await p.evaluate(k=>{const s=JSON.parse(localStorage.getItem(k));delete s.contentSteps;delete s.presentationVersion;s.mode='competitive';s.startedAt=Date.now();s.stage=1;s.phase='step';s.answers={0:{choice:1,practice:'تمرین قدیمی محفوظ بماند',rating:3,decision:8,applied:2,points:10}};localStorage.setItem(k,JSON.stringify(s))},KEY);await p.reload({waitUntil:'domcontentloaded'});assert.equal((await read(p)).answers[0].choice,1);assert.match((await read(p)).answers[0].practice,/قدیمی/);
 logs.push({edgeCases:['pause cap','pause refresh','focus trap','escape','restart quota','study 10 stages','legacy state']});await ctx.close();
}
(async()=>{const browser=await chromium.launch({headless:true});try{for(const [name,width] of [['desktop',1365],['tablet',768],['mobile',390],['narrow',320]])await fullJourney(browser,name,width);await edges(browser);fs.writeFileSync(path.join(OUT,'results.json'),JSON.stringify(logs,null,2));console.log('PASS: full 10-stage Chromium journeys at 1365/768/390/320px, timing, study, exports and persistence');}finally{await browser.close()}})().catch(e=>{console.error(e);process.exitCode=1});
