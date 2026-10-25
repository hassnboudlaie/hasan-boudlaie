'use strict';
const {chromium}=require('playwright');
const assert=require('node:assert/strict');
(async()=>{
 const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
 const failures=[];
 const page=await browser.newPage({viewport:{width:1365,height:850},locale:'fa-IR',timezoneId:'Asia/Tehran'});
 page.on('pageerror',error=>failures.push(error.message));
 const root='http://127.0.0.1:8765/okr-system/';
 try{
  await page.goto(root+'#map',{waitUntil:'domcontentloaded',timeout:45000});
  await page.waitForSelector('#kmCanvas',{timeout:30000});
  assert.ok(await page.locator('#kmViewport').isVisible(),'map viewport visible');
  assert.ok(await page.locator('.km-ultimate').count(),'Ultimate Goal card exists');
  const before=await page.locator('#kmZoomValue').innerText();
  await page.locator('[data-km-zoom="1"]').click();
  const after=await page.locator('#kmZoomValue').innerText();
  assert.notEqual(before,after,'zoom control works');
  console.log('PASS desktop map, ultimate goal, zoom');
  await page.goto(root+'#team/company/goals',{waitUntil:'domcontentloaded',timeout:45000});
  await page.waitForSelector('.kt-shell',{timeout:30000});
  assert.ok(await page.locator('.kt-tabs').isVisible(),'Team profile tabs visible');
  console.log('PASS team profile');
  await page.setViewportSize({width:390,height:844});
  await page.goto(root+'#map',{waitUntil:'domcontentloaded',timeout:45000});
  await page.waitForSelector('#kmViewport',{timeout:30000});
  assert.equal(await page.evaluate(()=>getComputedStyle(document.querySelector('.km-app')).direction),'rtl');
  assert.ok(await page.locator('#kmViewport').isVisible(),'Map visible on mobile');
  console.log('PASS mobile RTL map');
  assert.deepEqual(failures,[],'No uncaught runtime errors');
 }finally{await browser.close()}
})().catch(error=>{console.error(error);process.exit(1)});
