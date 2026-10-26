'use strict';
/* Targeted non-destructive regression for Explore navigation, contrast and responsiveness. */
const {chromium}=require('playwright');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
(async()=>{
 const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
 const page=await browser.newPage({viewport:{width:1365,height:850},locale:'fa-IR',timezoneId:'Asia/Tehran'});
 const errors=[];page.on('pageerror',error=>errors.push(error.message));
 const url='http://127.0.0.1:8765/okr-system/?qa=explore-ux-a11y#explore';
 const output=path.join(__dirname,'artifacts');
 fs.mkdirSync(output,{recursive:true});
 try{
  await page.goto(url);await page.waitForSelector('.kx-app');
  assert.equal(await page.locator('.kx-toolbar [role="tablist"] [role="tab"]').count(),3);
  assert.equal(await page.locator('[data-kx-view="cascade"]').getAttribute('aria-selected'),'true');
  await page.locator('[data-kx-view="cascade"]').focus();
  await page.keyboard.press('ArrowLeft');
  assert.equal(await page.locator('[data-kx-view="map"]').getAttribute('aria-selected'),'true');
  await page.locator('[data-kx-view="map"]').focus();await page.keyboard.press('End');
  assert.equal(await page.locator('[data-kx-view="board"]').getAttribute('aria-selected'),'true');
  await page.locator('[data-kx-view="board"]').focus();await page.keyboard.press('Home');
  assert.equal(await page.locator('[data-kx-view="cascade"]').getAttribute('aria-selected'),'true');
  const before=await page.locator('[data-kx-record]').count();
  await page.locator('.kx-filters summary').click();
  const archive=page.locator('[data-kx-archived]');
  await archive.check();
  assert.equal(await archive.isChecked(),true);
  await archive.uncheck();
  assert.equal(await page.locator('[data-kx-record]').count(),before);
  const result=await page.evaluate(()=>{
   const root=document.querySelector('.kx-app');
   const test=document.createElement('div');test.className='kx-meta';
   const states=['good','bad','attention','neutral'];
   for(const state of states){const span=document.createElement('span');span.className='kx-status kx-status-'+state;span.textContent='وضعیت';test.append(span);}
   root.append(test);
   const rgb=s=>{const a=s.match(/[\d.]+/g).map(Number);return a.slice(0,3);};
   const lum=s=>rgb(s).map(x=>{x/=255;return x<=.04045?x/12.92:Math.pow((x+.055)/1.055,2.4);}).reduce((v,x,i)=>v+x*[.2126,.7152,.0722][i],0);
   const ratios=states.map((state,i)=>{const cs=getComputedStyle(test.children[i]);const a=lum(cs.color),b=lum(cs.backgroundColor);return {state,ratio:(Math.max(a,b)+.05)/(Math.min(a,b)+.05)};});
   const tabs=[...root.querySelectorAll('[role="tablist"] [role="tab"]')].map(el=>({minHeight:getComputedStyle(el).minHeight}));
   test.remove();return {ratios,tabs};
  });
  for(const p of result.ratios)assert.ok(p.ratio>=4.5, p.state+' contrast below WCAG AA: '+p.ratio);
  for(const tab of result.tabs)assert.ok(parseFloat(tab.minHeight)>=44,'Tab touch target below 44px');
  await page.locator('.kx-filters summary').click().catch(()=>{});
  await page.screenshot({path:path.join(output,'explore-desktop.png'),fullPage:false});
  await page.setViewportSize({width:390,height:844});
  await page.reload();await page.waitForSelector('.kx-app');
  await page.locator('[data-kx-view="map"]').click();
  assert.equal(await page.locator('.kx-app').getAttribute('dir'),'rtl');
  assert.ok(await page.locator('.kx-map').isVisible());
  const box=await page.locator('.kx-app').boundingBox();
  assert.ok(box.width<=392,'Explore container overflows phone viewport');
  await page.screenshot({path:path.join(output,'explore-mobile-map.png'),fullPage:false});
  assert.deepEqual(errors,[]);
  console.log('PASS Explore accessibility: keyboard tabs, archive toggle, contrast >= 4.5, 44px targets, mobile RTL');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exit(1)});
