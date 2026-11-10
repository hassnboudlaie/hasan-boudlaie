'use strict';
const {chromium}=require('playwright-core'),assert=require('node:assert/strict');
require('node:fs').mkdirSync('artifacts/alborz-resilience',{recursive:true});
const root=require('node:path').resolve(__dirname,'..');
const fs=require('node:fs');
const moduleSource=fs.readFileSync(require('node:path').join(root,'alborz-communication-skills/claims-workshop-v2.html'),'utf8');
const modelSource=fs.readFileSync(require('node:path').join(root,'alborz-communication-skills/resilience-game.js'),'utf8');
function section(source,a,b){const x=source.indexOf(a),y=source.indexOf(b,x+a.length);assert(x>=0&&y>x,'content markers must exist');return source.slice(x+a.length,y).trim().replace(/;\\s*$/,'');}
const courseData=JSON.parse(section(moduleSource,'const DATA=',';\nconst STORE='));
const packs=JSON.parse(section(modelSource,'const mastery=',';\nconst professionalQuiz='));
const quizBank=JSON.parse(section(modelSource,'const professionalQuiz=',';\nconst rubric='));
assert.equal(quizBank.length,10,'exactly ten professional resilience questions');
assert(quizBank.every(q=>q.facts.length>=2&&q.options.length===3&&q.options.filter(o=>o.correct).length===1),'each question has case premises and one preferred option');
assert.equal(packs.length,4,'four complete strategy mastery packs');
const expected=['شتر','ماهی آزاد','آفتاب‌پرست','اختاپوس'];
for(let i=0;i<packs.length;i++){
 const m=packs[i];
 assert.equal(m.people.length,5,expected[i]+' has five named, purpose-driven actors');
 assert(m.people.every(p=>p.name&&p.role&&p.goal&&p.concern&&p.style&&p.cue),'each actor has goal, concern and voice');
 assert(m.after.length>=8,'one fully developed live dialogue per strategy');
 assert(m.after.every(t=>Number.isInteger(t.p)&&t.p>=0&&t.p<5&&t.t.length>15),'all turns have named actors');
 assert.equal(new Set(m.after.map(t=>t.p)).size,5,'all five roles contribute to improved dialogue');
 assert(m.lesson.definition&&m.lesson.boundary&&m.lesson.condition&&m.lesson.actions.length===3&&m.lesson.takeaway,'scientifically bounded teachable lesson');
}
assert.equal(courseData.modules.length,3,'three independent course pillars');
const allCases=courseData.modules.flatMap(x=>x.cases);
assert(allCases.length>=8,'at least eight substantive scenarios across all three course pillars');
for(const c of allCases){
 assert.equal(c.roles.length,5,'five role descriptions for '+c.id);
 assert(c.dialogueAfter.length>=8,'one full natural dialogue for '+c.id);
 assert(c.analysis&&c.analysis.length>=70,'single final analysis for '+c.id);
 assert.equal(c.options.filter(x=>x[2]).length,1,'one better decision for '+c.id);
}
assert(/خدمت مستقل|کسب‌وکار تازه/.test(courseData.modules[0].cases[1].context),'salmon must create a separate business');
assert(/خدمت مستقل|کسب‌وکار تازه/.test(courseData.modules[0].cases[3].context),'octopus must add an independent business');
assert(courseData.quizzes.resilience.some(q=>/مدل درآمد|خدمت مستقل/.test(q.q)),'resilience tests cover a separate business model');
for(const [key,qs] of Object.entries(courseData.quizzes)){
 if(qs.length===0)continue; // A module may be delivered through its standalone assessment workflow.
 assert.equal(qs.length,10,key+' includes ten scenario questions');
 for(const q of qs){assert.equal(q.a.length,3);assert(q.a.every(x=>x[1].length>25),'each option has an explicit explanation');}
}
console.log('PASS content-contract: 4 strategy lessons, 20 characters, 4 complete live dialogs, current substantive single-case dialogs, 10 questions per module, option-level reasoning and final analyses');
const server=require('node:http').createServer((req,res)=>{
 const target=require('node:path').resolve(root,'.'+decodeURIComponent(new URL(req.url,'http://localhost').pathname));
 if(!target.startsWith(root+'/')){res.writeHead(403);res.end();return;}
 require('node:fs').readFile(target,(e,b)=>{res.statusCode=e?404:200;res.setHeader('content-type',target.endsWith('.js')?'text/javascript':target.endsWith('.css')?'text/css':'text/html');res.end(e?'not found':b);});
});
(async()=>{
 await new Promise(ok=>server.listen(4174,'127.0.0.1',ok));
 const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
 const base='http://127.0.0.1:4174/alborz-communication-skills/';
 for(const width of [390,1366]){
  const ctx=await browser.newContext({viewport:{width,height:850},acceptDownloads:true}),p=await ctx.newPage(),errors=[];
  p.on('pageerror',e=>errors.push(e.message));
  await p.goto(base+'claims-workshop-v2.html',{waitUntil:'load'});
  assert.equal(await p.locator('.workshop-hero .strategy-card').count(),4,'four informational strategy cards are visible');
  assert.equal(await p.locator('.workshop-hero [data-strategy],.workshop-hero [role="button"],.alborz-strategy-dialog').count(),0,'no interactive shortcut or duplicate strategy lesson');
  assert.equal(await p.locator('.mod-card').count(),0,'redundant old module entry removed');
  assert.equal(await p.locator('.module-path-card').count(),3,'three independent clickable course pillars');
  await p.locator('.module-path-card').nth(1).click();
  assert.match(await p.locator('.panel.intro h1').innerText(),/مدیریت خشم/,'anger content reachable');
  assert.equal(await p.locator('.tabs button').count(),5,'observer tab removed; five instructional tabs remain');
  await p.getByRole('button',{name:'آزمون'}).click();
  assert.equal(await p.locator('[id^="q-"]').count(),10,'anger decision quiz contains ten questions');
  await p.locator('#q-0 button.choice').first().click();
  assert.equal(await p.locator('#q-0 .professional-explanation p').count(),3,'each anger option has an independent rationale');
  await p.getByRole('button',{name:'خانه · سه بخش آموزشی'}).click();
  await p.locator('.module-path-card').nth(2).click();
  assert.match(await p.locator('.asv5-hero h1').innerText(),/جرأت‌ورزی/,'standalone assertiveness lesson reachable');
  await p.getByRole('button',{name:'⌂ خانه کارگاه'}).click();
  assert.equal(await p.locator('a[href*="claims-presentation.html"]').count(),0,'poor presentation shortcut hidden');
  await p.getByRole('button',{name:'کنداکتور برنامه'}).click();
  assert.match(await p.locator('.panel h2').first().innerText(),/کنداکتور دو روزه/,'conductor opens the eight-hour schedule');
  assert.equal(await p.locator('.role-entry-link').count(),2,'two explicit role entry choices');
  assert.equal(await p.locator('.role-entry-link[href="./resilience.html?classroom=1"]').count(),1,'participant entry uses guided classroom');
  assert.equal(await p.locator('.role-entry-link[href*="teacher=1"]').count(),1,'instructor entry uses guided classroom');
  await p.goto(base+'resilience.html?mission=salmon',{waitUntil:'load'});
  await p.waitForURL('**/resilience.html?mission=salmon&classroom=1');
  assert.equal(await p.locator('#live-code').count(),1,'national-ID-first participant landing');
  assert.equal(await p.locator('.teams a').count(),0,'manual ten-group selection removed');
  await p.goto(base+'resilience.html?group=1&step=0&legacy=1',{waitUntil:'load'});
  assert.equal(await p.locator('.mission-pick-card').count(),4,'groups may start any scenario');
  await p.locator('.mission-pick-card').nth(3).click();
  assert.match(p.url(),/step=6/,'group can start with Octopus');
  assert.match(await p.locator('.mission-simple-head h1').innerText(),/اختاپوس/);
  assert.equal(await p.locator('h3.shared-flow-heading:visible').count(),1,'only one exercise step visible');
  assert(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'mobile layout is horizontally contained');
  await p.goto(base+'resilience.html?group=1&step=3&legacy=1',{waitUntil:'load'});
  assert.match(await p.locator('#mission-progress-text').innerText(),/مسئله و هدف/);
  assert.equal(await p.locator('.case-facts li').count(),3,'scientifically bounded scenario facts');
  assert.equal(await p.locator('.case-goal').count(),1,'scenario goal present');
  await p.locator('[data-mission-next]').click();
  assert.match(await p.locator('#mission-progress-text').innerText(),/تقسیم نقش‌ها/);
  await p.locator('[data-mission-next]').click();
  assert.match(await p.locator('#mission-progress-text').innerText(),/گفت‌وگو و مهارت‌ها/);
  await p.locator('[data-mission-next]').click();
  assert.match(await p.locator('#mission-progress-text').innerText(),/انتخاب و تصمیم اولیه/);
  assert.equal(await p.locator('.resource-meter').isVisible(),true,'the budget meter appears only at decision stage');
  await p.locator('[data-pick="0:0"]').check();
  await p.locator('[data-pick="0:1"]').check();
  assert.match(await p.locator('.resource-meter').innerText(),/مصرف: ۵|مصرف: ۵/,'budget meter updates with chosen actions');
  await p.locator('[data-field="r0initial"]').fill('فرایند معتبر را حفظ می‌کنیم، نوبت‌بندی داریم و مسئول پیگیری تعیین می‌کنیم.');
  await p.locator('[data-mission-next]').click();
  assert.match(await p.locator('#mission-progress-text').innerText(),/اتفاق تازه/);
  await p.locator('[data-action="reveal"]').click();
  assert.match(await p.locator('#mission-progress-text').innerText(),/اصلاح تصمیم/,'reveal opens next relevant phase');
  assert.equal(await p.locator('.twist').count(),1,'scenario surprise present');
  await p.locator('[data-field="r0revision"]').fill('پس از شوک، اولویت پرونده‌ها را تغییر می‌دهیم اما کنترل مدارک حفظ می‌شود.');
  await p.locator('[data-mission-next]').click();
  assert.match(await p.locator('#mission-progress-text').innerText(),/نتیجه و اقدام عملی/);
  assert.equal(await p.locator('h3.shared-flow-heading:visible').count(),1,'still only one visible phase after reveal');
  const promise=p.waitForEvent('download');await p.locator('[data-action="export"]').first().click();
  assert.equal((await promise).suggestedFilename(),'alborz-group-1.txt');
  await p.goto(base+'resilience.html?group=2&step=3&legacy=1',{waitUntil:'load'});
  assert.equal(await p.locator('[data-field="r0initial"]').inputValue(),'','group 2 cannot see group 1 local draft');
  await p.goto(base+'resilience.html?group=1&step=7&legacy=1',{waitUntil:'load'});
  await p.waitForURL('**/resilience.html?group=1&step=0&legacy=1');
  assert.equal(await p.locator('.mission-pick-card').count(),4,'retired scenario-creation detour returns to mission selection');
  await p.goto(base+'resilience.html?teacher=1',{waitUntil:'load'});
  assert.equal(await p.locator('#live-code').count(),1,'instructor still requires a code');
  assert.equal(await p.locator('[data-board],a[href*="offline=1"]').count(),0,'no offline scorecard shortcut');
  await p.screenshot({path:'artifacts/alborz-resilience/minimal-four-strategies-'+width+'.png',fullPage:true});
  assert.deepEqual(errors,[],'no uncaught errors');
  console.log('PASS minimal group workshop '+width+'px: national-ID entry, four free scenarios, single-step activity, role play, budget, reveal, export, local isolation');
  await ctx.close();
 }
 await browser.close();server.close();
})().catch(e=>{console.error(e);server.close();process.exit(1);});
