'use strict';
const {chromium}=require('playwright'),assert=require('node:assert/strict');
(async()=>{const browser=await chromium.launch({headless:true,args:['--no-sandbox']});const context=await browser.newContext({viewport:{width:1365,height:850},locale:'fa-IR',timezoneId:'Asia/Tehran'});const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));const root='http://127.0.0.1:8765/okr-system/?qa=explore-ci';
const fill=async(values)=>{for(const [key,value] of Object.entries(values))await page.locator('#pf-'+key).fill(value);};
try{
 await page.goto(root+'#explore');await page.waitForSelector('.kx-app');const initial=await page.locator('[data-kx-record]').count();assert.ok(initial>=90);
 await page.getByRole('button',{name:'＋ رکن',exact:true}).click();await page.locator('[data-kx-pillar] input[name="title"]').fill('QA nested pillar');await page.locator('[data-kx-pillar] select').selectOption('doc-pillar-1');await page.getByRole('button',{name:'ذخیره رکن',exact:true}).click();assert.equal(await page.locator('[data-kx-record]').count(),initial+1);await page.reload();await page.getByRole('link',{name:'QA nested pillar',exact:true}).waitFor();
 await page.getByRole('button',{name:'＋ هدف',exact:true}).click();await fill({objective:'QA weighted goal',owner:'QA owner'});await page.locator('#pf-parentId').selectOption('doc-pillar-1');await page.locator('#pf-progressMode').selectOption('weighted');await page.getByRole('button',{name:'ذخیره',exact:true}).click();await page.getByRole('heading',{name:'QA weighted goal',exact:true}).waitFor();const goalUrl=page.url(),goalId=goalUrl.split('/').at(-1);
 for(const [title,current,weight] of [['QA KR one','100','1'],['QA KR two','0','3']]){await page.getByRole('button',{name:'افزودن نتیجه کلیدی',exact:true}).click();await fill({text:title,owner:'QA owner',unit:'%',baseline:'0',target:'100',current,weight,measurementNote:'Synthetic CI evidence'});await page.getByRole('button',{name:'ذخیره',exact:true}).click();await page.getByRole('heading',{name:title,exact:true}).waitFor();await page.goto(goalUrl);}
 await page.goto(root+'#explore');for(const view of ['cascade','map','board']){await page.locator('[data-kx-view="'+view+'"]').click();assert.match(await page.locator('[data-kx-record="'+goalId+'"]').innerText(),/۲۵٪/);}
 await page.reload();await page.locator('[data-kx-record="'+goalId+'"]').waitFor();assert.match(await page.locator('[data-kx-record="'+goalId+'"]').innerText(),/۲۵٪/);
 // Perdoo 3.0 parity: eight sort fields, reversible order, demo-mode disclosure, all read-only.
 assert.equal(await page.locator('[data-kx-sort] option').count(),8);
 assert.ok(await page.locator('.kx-local-note').isVisible());
 await page.locator('[data-kx-view="board"]').click();
 await page.locator('[data-kx-sort]').selectOption('title');
 const labels=()=>page.locator('.kx-board tbody tr td:first-child a').allTextContents();
 const ascending=await labels();assert.ok(ascending.length>20);
 await page.locator('[data-kx-sort-direction]').selectOption('desc');
 const descending=await labels();assert.deepEqual(descending,ascending.slice().reverse());
 await page.locator('[data-kx-sort]').selectOption('owner');
 assert.equal(await page.locator('[data-kx-sort-direction]').inputValue(),'asc');
 await page.locator('.kx-filters summary').click();await page.locator('[data-kx-filter="types"]').selectOption(['objective']);assert.equal(await page.locator('[data-kx-record]').count(),14);
 await page.locator('[data-kx-sort]').selectOption('lastUpdate');await page.locator('[data-kx-sort-direction]').selectOption('asc');
 await page.getByRole('button',{name:'ذخیره نمای این مرورگر',exact:true}).click();await page.locator('[data-kx-save] input').fill('QA objectives');await page.getByRole('button',{name:'ذخیره نما',exact:true}).click();await page.reload();await page.locator('.kx-filters summary').click();await page.locator('[data-kx-saved]').selectOption({label:'QA objectives'});assert.equal(await page.locator('[data-kx-record]').count(),14);assert.equal(await page.locator('[data-kx-sort]').inputValue(),'lastUpdate');assert.equal(await page.locator('[data-kx-sort-direction]').inputValue(),'asc');
 const snapshot=await page.evaluate(()=>JSON.parse(localStorage.getItem('kish_qa_explore-ci:kish_okr_free_practice_v1')));assert.equal(snapshot.state.companyOkrs.find(g=>g.id===goalId).progressMode,'weighted');assert.deepEqual(snapshot.state.companyOkrs.find(g=>g.id===goalId).krs.map(k=>k.weight),[1,3]);assert.ok(await page.evaluate(()=>localStorage.getItem('kish_qa_explore-ci:kish_okr_before_unified_explore_v1')));
 // Cross-tab optimistic revision guard: a stale edit must not overwrite newer data.
 const second=await context.newPage();await second.goto(root+'#explore');await second.waitForSelector('.kx-app');await page.getByRole('button',{name:'＋ رکن',exact:true}).click();await page.locator('[data-kx-pillar] input').fill('QA first writer');await page.getByRole('button',{name:'ذخیره رکن',exact:true}).click();await second.getByRole('button',{name:'＋ رکن',exact:true}).click();await second.locator('[data-kx-pillar] input').fill('QA stale writer');await second.getByRole('button',{name:'ذخیره رکن',exact:true}).click();assert.match(await second.locator('[data-kx-error]').innerText(),/ذخیره|تعارض/);await second.close();
 await page.setViewportSize({width:390,height:844});await page.goto(root+'#explore');assert.equal(await page.locator('.kx-app').getAttribute('dir'),'rtl');await page.locator('[data-kx-view="map"]').click();assert.ok(await page.locator('.kx-map').isVisible());assert.deepEqual(errors,[]);console.log('PASS Explore E2E: create pillar/goal/KRs, weighted 25% in three views, reload, filters, saved view, backup, stale write protection, mobile RTL');
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exit(1)});
