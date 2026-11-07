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
  const endpoint='**/functions/v1/alborz-workshop-sync';
  await page.route(endpoint,async route=>{
   const request=route.request().postDataJSON();
   if(request.action==='login')return route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({identity:{role:'teacher'},session:'mock-protected-session'})});
   if(request.action==='teacher')return route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({records:[]})});
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
  assert.equal(await page.locator('details.teacher-mission').count(),4,'four instructor missions');
  assert.equal(await page.locator('.timeline-item').count(),10,'A-to-Z learning steps');
  assert.equal(await page.locator('.teacher-mission-nav a').count(),4,'direct mission links');
  assert.match(await page.locator('details.teacher-mission').first().innerText(),/مدیریت خشم و جرأت‌ورزی/);
  await page.locator('details.teacher-mission').last().evaluate(el=>el.open=true);
  assert.match(await page.locator('details.teacher-mission').last().innerText(),/کارت اتفاق/);
  assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'no horizontal instructor overflow '+width);
  await page.locator('[data-teacher-tab="dashboard"]').click();
  assert.equal(await page.locator('.instructor-roadmap').count(),0,'switch to live view');
  assert.equal(await page.locator('[data-grade]').count(),50,'ten groups times five graded rounds');
  await page.locator('[data-teacher-tab="journey"]').click();
  assert.equal(await page.locator('details.teacher-mission').count(),4,'guide remains accessible after dashboard');
  await page.screenshot({path:'artifacts/alborz-resilience/instructor-journey-'+width+'.png',fullPage:true});
  assert.deepEqual(errors,[],'browser errors at '+width);
  console.log('PASS instructor A-to-Z '+width+'px: protected login, four missions, embedded skills, live dashboard, badges, RTL');
  await ctx.close();
 }
 await browser.close();server.close();
})().catch(e=>{console.error(e);server.close();process.exit(1);});
