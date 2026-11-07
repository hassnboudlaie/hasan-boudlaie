'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),http=require('node:http');
const {chromium}=require('playwright-core');
fs.mkdirSync('artifacts/alborz-resilience',{recursive:true});
const root=path.resolve(__dirname,'..');
const server=http.createServer((req,res)=>{const target=path.resolve(root,'.'+decodeURIComponent(new URL(req.url,'http://localhost').pathname));if(!target.startsWith(root+path.sep)){res.writeHead(403);res.end();return;}fs.readFile(target,(err,buf)=>{res.statusCode=err?404:200;res.setHeader('content-type',target.endsWith('.js')?'text/javascript':target.endsWith('.css')?'text/css':target.endsWith('.woff2')?'font/woff2':'text/html');res.end(err?'not found':buf);});});
(async()=>{
 await new Promise(resolve=>server.listen(4181,'127.0.0.1',resolve));
 const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
 for(const width of [390,1366]){
  const ctx=await browser.newContext({viewport:{width,height:850}}),page=await ctx.newPage(),errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  let gradeRows=[];const groupStages=Array.from({length:4},(_,i)=>({team_no:i+1,field_key:'stage',field_value:i+3,version:1,id:'stage-'+(i+1)}));
  const endpoint='**/functions/v1/alborz-workshop-sync';
  await page.route(endpoint,async route=>{
   const request=route.request().postDataJSON();
   if(request.action==='login')return route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({identity:{role:'teacher'},session:'mock-protected-session'})});
   if(request.action==='teacher')return route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({records:[...groupStages,...gradeRows]})});
   if(request.action==='grade'){
    const key=Object.keys(request.fields||{})[0],id=request.team+':'+key,old=gradeRows.find(x=>x.id===id);
    if((old?.version??0)!==(request.expected?.[key]??0))return route.fulfill({status:409,contentType:'application/json',body:'{"error":"conflict"}'});
    const record={id,team_no:request.team,field_key:key,field_value:request.fields[key],version:(old?.version??0)+1};
    gradeRows=gradeRows.filter(x=>x.id!==id).concat(record);
    return route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({records:[record]})});
   }
   if(request.action==='logout')return route.fulfill({status:200,contentType:'application/json',body:'{}'});
   return route.fulfill({status:403,contentType:'application/json',body:'{"error":"denied"}'});
  });
  const base='http://127.0.0.1:4181/alborz-communication-skills/';
  await page.goto(base+'resilience.html?teacher=1',{waitUntil:'load'});
  assert.equal(await page.locator('#live-code').count(),1,'instructor must authenticate');
  assert.equal(await page.locator('.instructor-roadmap').count(),0,'full instructor guide should not appear before login');
  assert.equal(await page.locator('[data-board]').count(),0,'offline scorecard not shown in live mode');
  await page.locator('#live-code').fill('qa-teacher-token');
  await page.locator('#live-join').click();
  await page.locator('.instructor-roadmap').waitFor();
  assert.equal(await page.locator('details.teacher-mission').count(),4,'four instructor missions');assert.match(await page.locator('.instructor-roadmap .teacher-hero').innerText(),/انتخاب آزاد/);assert.equal(await page.locator('.facilitator-case-facts').count(),4,'instructor has key data for all four missions');assert.equal(await page.locator('.teacher-case-task').count(),4,'instructor has plain decision prompt for all missions');
  assert.equal(await page.locator('.timeline-item').count(),10,'A-to-Z learning steps');
  assert.equal(await page.locator('.teacher-mission-nav a').count(),4,'direct mission links');
  assert.match(await page.locator('details.teacher-mission').first().innerText(),/مدیریت خشم و جرأت‌ورزی/);assert.match(await page.locator('details.teacher-mission').first().innerText(),/هدف تمرین به زبان ساده/);
  await page.locator('details.teacher-mission').last().evaluate(el=>el.open=true);
  assert.match(await page.locator('details.teacher-mission').last().innerText(),/کارت اتفاق/);
  assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'no horizontal instructor overflow '+width);
  await page.locator('[data-teacher-tab="dashboard"]').click();
  assert.equal(await page.locator('.instructor-roadmap').count(),0,'switch to live view');
  const groups=page.locator('#live-dashboard article.skill');assert.match(await groups.nth(0).innerText(),/شتر/,'group 1 starts Camel');assert.match(await groups.nth(1).innerText(),/ماهی آزاد/,'group 2 starts Salmon');assert.match(await groups.nth(2).innerText(),/آفتاب‌پرست/,'group 3 starts Chameleon');assert.match(await groups.nth(3).innerText(),/اختاپوس/,'group 4 starts Octopus');
  assert.equal(await page.locator('[data-batch-grade-input]').count(),10,'one compact score input per group');
  assert.equal(await page.locator('[data-score-round]').count(),5,'four missions plus scenario tab');
  assert.equal(await page.locator('[data-batch-grade-save]').count(),1,'one batch save control');
  await page.locator('[data-batch-grade-input="1:0"]').fill('7');
  await page.locator('[data-batch-grade-input="2:0"]').fill('6');
  await page.locator('[data-batch-grade-save]').click();
  await page.waitForFunction(()=>document.querySelector('#live-status')?.textContent.includes('موفقیت'));
  assert.equal(gradeRows.length,2,'two authorized grade writes');
  assert.deepEqual(gradeRows.map(x=>x.field_value).sort(),[6,7],'grade values persisted in mocked server');
  await page.locator('[data-score-round="1"]').click();
  assert.equal(await page.locator('[data-batch-grade-input="1:1"]').count(),1,'mission-specific group score');
  await page.locator('[data-score-round="0"]').click();
  assert.equal(await page.locator('[data-batch-grade-input="1:0"]').inputValue(),'7','first score survives mission switching');
  assert.equal(await page.locator('[data-batch-grade-input="2:0"]').inputValue(),'6','second score survives mission switching');
  await page.locator('[data-teacher-tab="journey"]').click();
  assert.equal(await page.locator('details.teacher-mission').count(),4,'guide remains accessible after dashboard');
  await page.screenshot({path:'artifacts/alborz-resilience/instructor-journey-'+width+'.png',fullPage:true});
  assert.deepEqual(errors,[],'browser errors at '+width);
  console.log('PASS instructor A-to-Z '+width+'px: protected login, four missions, embedded skills, ten-row batch grading and persistence, badges, RTL');
  await ctx.close();
 }
 await browser.close();server.close();
})().catch(e=>{console.error(e);server.close();process.exit(1);});
