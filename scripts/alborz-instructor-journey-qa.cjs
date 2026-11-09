'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),http=require('node:http');
const {chromium}=require('playwright-core');
fs.mkdirSync('artifacts/alborz-resilience',{recursive:true});
const root=path.resolve(__dirname,'..');
const server=http.createServer((req,res)=>{const target=path.resolve(root,'.'+decodeURIComponent(new URL(req.url,'http://localhost').pathname));if(!target.startsWith(root+path.sep)){res.writeHead(403);res.end();return;}fs.readFile(target,(err,buf)=>{res.statusCode=err?404:200;res.setHeader('content-type',target.endsWith('.js')?'text/javascript':target.endsWith('.css')?'text/css':'text/html');res.end(err?'not found':buf);});});
(async()=>{
 await new Promise(ok=>server.listen(4181,'127.0.0.1',ok));
 const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
 const base='http://127.0.0.1:4181/alborz-communication-skills/';
 for(const width of [390,1366]){
  const ctx=await browser.newContext({viewport:{width,height:850}}),page=await ctx.newPage(),errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  let teacherRows=[];
  await page.route('**/functions/v1/alborz-workshop-sync',async route=>{
   const data=route.request().postDataJSON();
   const body=data.action==='login'?{identity:{role:'teacher'},session:'mock-session'}:data.action==='teacher'?{records:teacherRows}:{records:[]};
   await route.fulfill({status:200,contentType:'application/json',body:JSON.stringify(body)});
  });
  await page.goto(base+'resilience.html?group=1&step=3&legacy=1',{waitUntil:'load'});
  const labels=await page.evaluate(()=>window.AlborzWorkshop.catalog.missionFlow);
  assert.equal(labels.length,7,'same seven-stage curriculum for both roles');
  assert.equal(await page.locator('.mission-simple-progress').count(),1,'participant has one compact stepper');
  assert.equal(await page.locator('h3.shared-flow-heading:visible').count(),1,'only one mission step visible');
  assert.match(await page.locator('#mission-progress-text').innerText(),/مسئله و هدف/);
  assert.equal(await page.locator('.mission-pick-card').count(),0,'participant focuses on chosen mission');
  await page.locator('[data-mission-next]').click();
  assert.match(await page.locator('#mission-progress-text').innerText(),/تقسیم نقش‌ها/);
  assert.equal(await page.locator('h3.shared-flow-heading:visible').count(),1);
  await page.locator('[data-mission-prev]').click();
  assert.match(await page.locator('#mission-progress-text').innerText(),/مسئله و هدف/);
  const goal=await page.locator('.case-goal').innerText();
  assert.match(goal,/خدمت|خطا/);
  await page.goto(base+'resilience.html?teacher=1&mission=camel&legacy=1',{waitUntil:'load'});
  assert.equal(await page.locator('#live-code').count(),1,'instructor access remains separate and required');
  assert.equal(await page.locator('.simple-teacher-workspace').count(),0,'teaching content protected before login');
  assert.equal(await page.getByText('پشتیبان آفلاین امتیازها').count(),0,'unused offline shortcut removed');
  await page.locator('#live-code').fill('test-teacher-code');
  await page.locator('#live-join').click();
  await page.locator('.simple-teacher-workspace').waitFor();
  assert.equal(await page.locator('.simple-now').count(),1,'only one teaching step displayed');
  assert.equal(await page.locator('.teacher-tabs,.fast-grade-panel,[data-batch-grade-save]').count(),0,'old parallel teacher dashboard removed');
  assert.equal(await page.locator('.simple-animal-selector button').count(),4,'four independent missions still available');
  assert.match(await page.locator('.simple-case-header h2').innerText(),/صفی که ناگهان سه برابر شد/);
  assert.match(await page.locator('.simple-stage-body').innerText(),/خدمت|مراجع|پرونده/);
  assert.equal(await page.locator('.simple-live-empty').count(),1,'blank state instead of ten empty cards');
  for(let i=0;i<7;i++){
    assert.match(await page.locator('.simple-teacher-stepbar strong').innerText(),new RegExp(labels[i]),'instructor phase follows participant label');
    assert.equal(await page.locator('.simple-now').count(),1,'single visible teacher activity');
    if(i<6)await page.locator('[data-teacher-next]').click();
  }
  assert.equal(await page.locator('[data-teacher-next]').isDisabled(),true,'last step stops at debrief');
  await page.locator('[data-teacher-mission="2"]').click();
  assert.match(await page.locator('.simple-case-header h2').innerText(),/رفت‌وآمدی که پایان ندارد/,'chameleon has matching core-transform case');
  assert.match(await page.locator('.simple-teacher-stepbar strong').innerText(),/مسئله و هدف/,'changing mission resets teacher step');
  teacherRows=[
   {team_no:3,field_key:'stage',field_value:5,version:1},
   {team_no:3,field_key:'r2initial',field_value:'مسئول هر مرحله را تعیین می‌کنیم و رفت‌وآمد را کم می‌کنیم.',version:1}
  ];
  await page.evaluate(()=>document.dispatchEvent(new Event('visibilitychange')));
  await page.locator('.simple-live-box').evaluate(el=>el.open=true);
  await page.locator('.simple-live-list details').first().waitFor({timeout:10000});
  assert.equal(await page.locator('.simple-live-list details').count(),1,'only groups with shared results appear');
  assert.match(await page.locator('.simple-live-list').innerText(),/گروه ۳/);
  await page.screenshot({path:'artifacts/alborz-resilience/simple-facilitator-'+width+'.png',fullPage:true});
  assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'no horizontal layout overflow');
  assert.deepEqual(errors,[],'no browser errors: '+errors.join('; '));
  console.log('PASS focused instructor + expert '+width+'px: same seven stages, zero-data state, scenario switch, live shared answers, no score clutter');
  await ctx.close();
 }
 await browser.close();server.close();
})().catch(e=>{console.error(e);server.close();process.exit(1);});
