/* Browser UI test. Synthetic data only, Supabase auth is mocked in CI. */
import { chromium } from 'playwright-core';
import {existsSync,mkdirSync} from 'node:fs';
import assert from 'node:assert/strict';
const bin=['/usr/bin/google-chrome','/usr/bin/google-chrome-stable','/usr/bin/chromium','/usr/bin/chromium-browser',chromium.executablePath()].find(existsSync);
if(!bin)throw Error('No Chromium browser on CI runner');
mkdirSync('/tmp/myfinance-ui-smoke',{recursive:true});
const browser=await chromium.launch({executablePath:bin,headless:true,args:['--no-sandbox']});
const context=await browser.newContext({viewport:{width:390,height:844},deviceScaleFactor:1.5,isMobile:true,hasTouch:true,serviceWorkers:'block'});
const page=await context.newPage();
page.setDefaultTimeout(20000);
await page.addInitScript(()=>{
 const example={
  accounts:[{id:'account-example',name:'حساب آزمایشی',currency:'IRT',opening:25000000}],
  tx:[{id:'tx-example',account:'account-example',kind:'expense',amount:1000000,currency:'IRT',date:'2026-10-30',category:'هزینه آزمایشی',memo:'صرفاً تست رابط کاربری',status:'completed'}],
  transfers:[],receivables:[],commitments:[],loans:[]
 };
 localStorage.setItem('my-finance-preview-v1',JSON.stringify(example));
});
await page.route('**/supabase-sync.js*',route=>route.fulfill({status:200,contentType:'text/javascript',
 body:'document.body.classList.add("finance-unlocked");document.dispatchEvent(new Event("myfinance:unlocked"));'}));
const check=route=>page.waitForFunction(x=>document.body.dataset.financeView===x,route,{timeout:12000});
try{
 await page.goto('http://127.0.0.1:8765/index.html',{waitUntil:'domcontentloaded'});
 await page.waitForSelector('body.finance-unlocked');await check('home');
 assert.equal(await page.locator('#finance-cashflow-card').isVisible(),false,'Home should not render long chart');
 assert.equal(await page.locator('#mf-home-more').isVisible(),false,'Home should not render long insights');
 assert.equal(await page.locator('.finance-home-hub').count(),2,'Only two short detail links expected');
 assert.equal(await page.locator('#finance-quick-fab').isVisible(),false,'Floating button obscures content');
 const installOverlap=await page.evaluate(()=>{
  const panel=document.getElementById('mf-install'),header=document.querySelector('.finance-app-header');
  if(!panel||panel.hidden||!header)return false;
  return panel.getBoundingClientRect().top < header.getBoundingClientRect().bottom-2;
 });
 assert.equal(installOverlap,false,'Install prompt overlaps app header');
 const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-window.innerWidth);
 assert.ok(overflow<=2,'Mobile horizontal overflow: '+overflow);
 const visual=await page.evaluate(()=>{
  const font=selector=>parseFloat(getComputedStyle(document.querySelector(selector)).fontSize);
  const height=selector=>document.querySelector(selector).getBoundingClientRect().height;
  return {
   heading:font('#home .finance-home-heading h2'),
   hub:font('#home .finance-home-hub-copy strong'),
   amount:font('#home .finance-kpi b'),
   buttonHeight:height('#home .mf-action'),
   hubHeight:height('#home .finance-home-hub'),
   cssLoaded:[...document.styleSheets].some(x=>x.href?.includes('visual-upgrade-v75.css'))
  };
 });
 assert.equal(visual.cssLoaded,true,'v75 visual stylesheet not loaded');
 assert.ok(visual.heading>=28,'Home title is too small: '+visual.heading);
 assert.ok(visual.hub>=19,'Clickable tile label is too small: '+visual.hub);
 assert.ok(visual.amount>=27,'Financial KPI amount is too small: '+visual.amount);
 assert.ok(visual.buttonHeight>=85&&visual.hubHeight>=85,'Mobile tap surface too small: '+JSON.stringify(visual));
 await page.setViewportSize({width:360,height:780});
 const overflow360=await page.evaluate(()=>document.documentElement.scrollWidth-window.innerWidth);
 assert.ok(overflow360<=2,'360px horizontal overflow: '+overflow360);
 await page.screenshot({path:'/tmp/myfinance-ui-smoke/home-360.png',fullPage:true});
 await page.setViewportSize({width:390,height:844});
 await page.screenshot({path:'/tmp/myfinance-ui-smoke/home-390.png',fullPage:true});
 await page.locator('.finance-balance-hero').click();await check('accounts');
 await page.locator('button[data-account="account-example"]').click();await check('account-detail');
 await page.waitForSelector('.mf-drill-balance');
 assert.ok((await page.locator('#finance-account-detail-body').innerText()).includes('حساب آزمایشی'));
 assert.ok(!page.url().includes('account-example'),'Account ID leaked in URL');
 await page.screenshot({path:'/tmp/myfinance-ui-smoke/account-390.png',fullPage:true});
 await page.locator('.mf-drill-item').first().click();await check('transaction-detail');
 assert.equal(await page.locator('.finance-mobile-nav .finance-active').count(),1,'Multiple bottom navigation tabs are active');
 assert.equal(await page.locator('.finance-mobile-nav .finance-active').first().getAttribute('data-finance-route'),'transactions','Transaction detail must highlight Transactions, not Accounts');
 const details=await page.locator('#finance-transaction-detail-body').innerText();
 assert.ok(details.includes('۱٬۰۰۰٬۰۰۰')&&details.includes('تومان'),'Exact amount/unit not visible');
 assert.ok(!page.url().includes('tx-example'),'Transaction ID leaked in URL');
 await page.screenshot({path:'/tmp/myfinance-ui-smoke/transaction-390.png',fullPage:true});
 const link=page.locator('#finance-transaction-detail-body .mf-drill-all');
 await link.scrollIntoViewIfNeeded();
 await page.waitForTimeout(280);
 const overlap=await page.evaluate(()=>{
  const link=document.querySelector('#finance-transaction-detail-body .mf-drill-all');
  const dock=document.querySelector('.finance-mobile-nav');
  if(!link||!dock)return true;
  const a=link.getBoundingClientRect(),b=dock.getBoundingClientRect();
  const cs=getComputedStyle(dock);
  return cs.display!=='none'&&Number(cs.opacity)>0.1&&a.bottom>b.top&&a.top<b.bottom;
 });
 assert.equal(overlap,false,'Bottom dock overlaps clickable financial detail action');
 await page.goBack();await check('account-detail');
 await page.goBack();await check('accounts');
 await page.goBack();await check('home');
 await page.locator('.finance-balance-hero').click();await check('accounts');
 await page.locator('button[data-account="account-example"]').click();await check('account-detail');
 await page.reload({waitUntil:'domcontentloaded'});
 await page.waitForSelector('body.finance-unlocked');await check('account-detail');
 assert.ok((await page.locator('#finance-account-detail-body').innerText()).includes('حساب آزمایشی'));
 await page.goBack();await check('accounts');
 await page.goBack();await check('home');
 console.log('PASS Chromium 360/390px: large readable UI, tap targets, no overflow, nested Back and reload');
}finally{
 await context.close();await browser.close();
}
