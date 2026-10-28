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
  // Perdoo 3.0 navigation cleanup: legacy rollout and learning entries are not primary modules.
  const nav=page.locator('#platformNav');
  assert.equal(await nav.count(),1,'operational navigation exists');
  for(const route of ['roadmap','introduce','announce','educate','learn','training']){
   assert.equal(await nav.locator('a[href="#'+route+'"]:visible').count(),0,'retired legacy link visible: '+route);
  }
  for(const route of ['history','admin']){
   assert.ok(await nav.locator('a[href="#'+route+'"]:visible').count()<=1,'duplicate administrative navigation: '+route);
  }
  console.log('PASS Perdoo 3.0 navigation cleanup: no legacy learning menu or duplicate admin links');

  await page.goto(root+'#explore',{waitUntil:'domcontentloaded'});
  await page.waitForSelector('.kx-app');
  const clean=page.locator('#kish-clean-navigation');
  assert.ok(await clean.isVisible(),'consolidated operational navigation visible');
  assert.equal(await nav.locator('[data-kish-nav-original]:visible').count(),0,'old primary menu must be hidden');
  assert.equal(await clean.locator('a:visible').count(),9,'nine daily operational links, advanced links collapsed');
  assert.equal(await clean.locator('a[href="#explore"]:visible').count(),1,'one canonical Explore link');
  assert.equal(await page.locator('[data-kish-advanced-map]').count(),1,'advanced map accessible from Explore');
  assert.match(await page.locator('#profileBtn').innerText(),/پروفایل محلی/, 'no classroom identity label');
  const advanced=clean.locator('.kish-nav-details').last();
  await advanced.locator('summary').click();
  assert.ok(await advanced.locator('a[href="#map"]').isVisible(),'detailed strategy map remains available');
  await advanced.locator('a[href="#map"]').click();
  await page.waitForSelector('#kmCanvas');
  assert.ok(await page.locator('#kmViewport').isVisible(),'legacy deep route continues functioning after cleanup');
  console.log('PASS clean sidebar: nine primary entries, preserved advanced workflows and valid Map deep link');


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
