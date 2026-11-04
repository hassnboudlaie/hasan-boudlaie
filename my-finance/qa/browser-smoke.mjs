/* Browser UI test. Synthetic data only, Supabase auth is mocked in CI. */
import { chromium } from 'playwright-core';
import {existsSync,mkdirSync} from 'node:fs';
import assert from 'node:assert/strict';
const bin=['/usr/bin/google-chrome','/usr/bin/google-chrome-stable','/usr/bin/chromium','/usr/bin/chromium-browser',chromium.executablePath()].find(existsSync);
if(!bin)throw Error('No Chromium browser on CI runner');
mkdirSync('/tmp/myfinance-ui-smoke',{recursive:true});
const browser=await chromium.launch({executablePath:bin,headless:true,args:['--no-sandbox']});
const context=await browser.newContext({viewport:{width:390,height:844},screen:{width:390,height:844},deviceScaleFactor:1.5,isMobile:true,hasTouch:true,serviceWorkers:'block'});
const page=await context.newPage();
page.setDefaultTimeout(20000);
await page.addInitScript(()=>{
 const due=n=>{
  const date=new Date(Date.now()+n*86400000);
  const parts=new Intl.DateTimeFormat('en-US-u-ca-persian',{timeZone:'Asia/Tehran',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(date);
  const get=key=>String(parts.find(x=>x.type===key)?.value||'').padStart(key==='year'?4:2,'0');
  return [get('year'),get('month'),get('day')].join('/');
 };
 const example={
  accounts:[{id:'account-example',name:'حساب آزمایشی',currency:'IRT',opening:25000000}],
  tx:[{id:'tx-example',account:'account-example',kind:'expense',amount:1000000,currency:'IRT',date:'2026-10-30',category:'هزینه آزمایشی',memo:'صرفاً تست رابط کاربری',status:'completed'}],
  transfers:[],receivables:[],commitments:[],
  loans:[{id:'far-loan',title:'وام آزمایشی دیرتر',currency:'IRR',installment:120000000,nextDueJalali:due(9),status:'active'},
         {id:'near-loan',title:'وام آزمایشی نزدیک',currency:'IRR',installment:50000000,nextDueJalali:due(2),status:'active'}]
 };
 localStorage.setItem('my-finance-preview-v1',JSON.stringify(example));
});
await page.route('https://raw.githubusercontent.com/iran-market/iran-market.github.io/main/data/popular.json',route=>{
 const stamp=new Date().toISOString();
 return route.fulfill({status:200,contentType:'application/json',headers:{'access-control-allow-origin':'*'},
 body:JSON.stringify({data:[
  {symbol:'USD_IRR_FREE',currency:'IRT',price:250000,timestamp:stamp,stale:false,change_pct:1.23},
  {symbol:'EUR_IRR_FREE',currency:'IRT',price:280000,timestamp:stamp,stale:false,change_pct:-0.4},
  {symbol:'GOLD_18K_IRR',currency:'IRT',price:24000000,timestamp:stamp,stale:false,change_pct:0.5},
  {symbol:'COIN_EMAMI_IRR',currency:'IRT',price:250000000,timestamp:stamp,stale:false,change_pct:0.9}
 ],meta:{unit:'toman',stale:false,updated_at:stamp,update_frequency_minutes:30}})});
});
await page.route('**/supabase-sync.js*',route=>route.fulfill({status:200,contentType:'text/javascript',
 body:'document.body.classList.add("finance-unlocked");document.dispatchEvent(new Event("myfinance:unlocked"));'}));
const check=route=>page.waitForFunction(x=>document.body.dataset.financeView===x,route,{timeout:12000});
try{
 await page.goto('http://127.0.0.1:8765/index.html',{waitUntil:'domcontentloaded'});
 await page.waitForSelector('body.finance-unlocked');await check('home');
 assert.equal(await page.locator('#finance-cashflow-card').isVisible(),false,'Home should not render long chart');
 assert.equal(await page.locator('#mf-home-more').isVisible(),false,'Home should not render long insights');
 assert.equal(await page.locator('#home .mf-action').count(),8,'Home must present eight clickable icon tiles');
 assert.equal(await page.locator('#home .finance-home-hubs').isVisible(),false,'Duplicate secondary hubs must not crowd Home');
 assert.equal(await page.locator('#home #finance-smart-assistant').isVisible(),false,'Long voice report form must not crowd Home');
 assert.equal(await page.locator('#home .mf-cg-card').isVisible(),false,'ChatGPT onboarding must remain one tap away');
 await page.waitForFunction(()=>document.getElementById('mf-last-tx-title')?.textContent.includes('هزینه آزمایشی'));
 await page.waitForFunction(()=>document.getElementById('loan-reminder-detail')?.textContent.includes('وام آزمایشی نزدیک'));
 assert.ok((await page.locator('#loan-reminder-detail').innerText()).includes('۵٬۰۰۰٬۰۰۰'),'Nearest installment amount must show in toman');
 assert.equal(await page.locator('#loan-due-notice').isVisible(),true,'Nearest installment must always appear');
 assert.equal(await page.locator('#mf-market-disclosure').evaluate(el=>el.open),false,'Live market details should default collapsed');
 await page.waitForFunction(()=>document.querySelectorAll('.mf-market-rate').length===4);
 await page.locator('#mf-market-disclosure summary').click();
 assert.equal(await page.locator('#mf-market-grid').isVisible(),true,'Market values should expand on tap');
 assert.ok((await page.locator('#mf-market-grid').innerText()).includes('۲۵۰٬۰۰۰'),'Live market widget must render JSON values');
 assert.ok((await page.locator('#mf-market-status').innerText()).includes('۳۰ دقیقه'),'Market feed cadence must be disclosed');
 await page.locator('#mf-market-disclosure summary').click();

 // The full report assistant and ChatGPT onboarding are accessible from the Home icon.
 await page.locator('#home .mf-action-assistant').click();await check('assistant');
 assert.equal(await page.locator('#finance-smart-assistant').isVisible(),true,'Voice reporting must be accessible inside Assistant');
 assert.equal(await page.locator('#home .mf-cg-card').isVisible(),true,'ChatGPT onboarding must be accessible inside Assistant');
 await page.locator('#mf-va-question').fill('گزارش کل دوره');
 await page.locator('#mf-va-go').click();
 assert.ok((await page.locator('#mf-va-summary').innerText()).includes('۱٬۰۰۰٬۰۰۰'),'Report must use the synthetic expense');
 await page.locator('#mf-va-pdf').click();
 assert.equal(await page.locator('#mf-va-print').isVisible(),true,'Printable report should open');
 await page.locator('#mf-va-print-close').click();
 await page.goBack();await check('home');
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
  const css=[...document.styleSheets].some(x=>x.href?.includes('home-dashboard-v84.css'));
  return {
   heading:font('#home .finance-home-heading h2'),
   tile:font('#home .mf-action span:last-child'),
   amount:font('#home .finance-kpi b'),
   buttonHeight:height('#home .mf-action'),
   cashHeight:height('#home .finance-balance-hero'),
   cssLoaded:css
  };
 });
 assert.equal(visual.cssLoaded,true,'r84 home-dashboard CSS not loaded');
 assert.equal(await page.locator('#home .mf-home-visual img').isVisible(),false,'Decorative hero should not crowd Home');
 assert.ok(await page.locator('#home .finance-home-heading').evaluate(el=>getComputedStyle(el).backgroundImage==='none'),'Oversized welcome gradient should be removed');
 const actionInk=await page.locator('#home .mf-action-expense').evaluate(el=>({background:getComputedStyle(el).backgroundColor,color:getComputedStyle(el).color}));
 assert.notEqual(actionInk.background,actionInk.color,'Expense tile lacks color contrast');
 assert.ok(visual.heading>=19,'Home title is too small: '+visual.heading);
 assert.ok(visual.tile>=14,'Clickable icon label is too small: '+visual.tile);
 assert.ok(visual.amount>=20,'Financial KPI amount is too small: '+visual.amount);
 assert.ok(visual.buttonHeight>=88&&visual.cashHeight>=105,'Tap surface too small: '+JSON.stringify(visual));
 await page.locator('#home .mf-action-voice').click();await check('quick-entry');
 assert.equal(await page.locator('#quick').isVisible(),true,'Voice quick-entry tile is not actionable');
 await page.goBack();await check('home');
 await page.setViewportSize({width:360,height:780});
 const overflow360=await page.evaluate(()=>document.documentElement.scrollWidth-window.innerWidth);
 assert.ok(overflow360<=2,'360px horizontal overflow: '+overflow360);
 await page.screenshot({path:'/tmp/myfinance-ui-smoke/home-360.png',fullPage:true});
 await page.setViewportSize({width:390,height:844});
 await page.screenshot({path:'/tmp/myfinance-ui-smoke/home-390.png',fullPage:true});
 await page.locator('#mf-last-tx').click();await check('transaction-detail');
 assert.ok((await page.locator('#finance-transaction-detail-body').innerText()).includes('هزینه آزمایشی'));
 await page.goBack();await check('home');
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
 await page.evaluate(()=>document.body.classList.add('dark'));
 await page.screenshot({path:'/tmp/myfinance-ui-smoke/home-dark-390.png',fullPage:true});
 await page.evaluate(()=>document.body.classList.remove('dark'));
 /* Simulate Android's physical 390px screen with Chrome Desktop site using a 980px layout viewport.
    Playwright otherwise changes screen.width alongside setViewportSize, which hides the real-world bug. */
 await page.evaluate(()=>{
   Object.defineProperty(window.screen,'width',{configurable:true,get:()=>390});
   Object.defineProperty(window.screen,'height',{configurable:true,get:()=>844});
 });
 await page.setViewportSize({width:980,height:844});
 await page.evaluate(()=>window.dispatchEvent(new Event('resize')));
 await page.waitForFunction(()=>document.documentElement.classList.contains('mf-wide-mobile'));

 await page.waitForTimeout(400);
 const wide=await page.evaluate(()=>({
   innerWidth:window.innerWidth,screenWidth:screen.width,
   detected:document.documentElement.classList.contains('mf-wide-mobile'),
   zoom:parseFloat(getComputedStyle(document.body).zoom||'1')
 }));
 assert.ok(wide.screenWidth<900&&wide.innerWidth>900,'Desktop-mode simulation needs narrow screen and wide layout: '+JSON.stringify(wide));
 assert.equal(wide.detected,true,'Android wide desktop mode must be recognized');
 assert.ok(wide.zoom>=2.2,'Wide viewport downscale must be compensated: '+JSON.stringify(wide));
 await page.screenshot({path:'/tmp/myfinance-ui-smoke/desktop-mode-fallback.png',fullPage:true});
 console.log('PASS Chromium 360/390px + wide desktop-mode fallback: icon dashboard, tappable routes, nested Back and reload');
}finally{
 await context.close();await browser.close();
}
