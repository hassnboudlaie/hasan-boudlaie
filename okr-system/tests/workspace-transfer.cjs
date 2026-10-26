'use strict';
const {chromium}=require('playwright'),assert=require('node:assert/strict');
(async()=>{const browser=await chromium.launch({headless:true,args:['--no-sandbox']});const context=await browser.newContext();const page=await context.newPage();const root='http://127.0.0.1:8765/okr-system/?qa=transfer-ci';const errors=[];page.on('pageerror',e=>errors.push(e.message));
try{
 await page.goto(root+'#explore');await page.waitForSelector('.kx-app');
 for(const [title,kpi] of [['QA standalone initiative',''],['QA KPI initiative','doc-kpi-1-1']]){
  await page.getByRole('button',{name:'＋ ابتکار',exact:true}).click();for(const [field,value] of Object.entries({title,owner:'QA owner',due:'2026-12-20'}))await page.locator('#pf-'+field).fill(value);
  if(kpi)await page.locator('#pf-kpiId').selectOption(kpi);await page.getByRole('button',{name:'ذخیره',exact:true}).click();await page.getByRole('heading',{name:title,exact:true}).waitFor();await page.goto(root+'#explore');
 }
 await page.reload();assert.ok(await page.getByRole('link',{name:'QA standalone initiative',exact:true}).count());assert.ok(await page.getByRole('link',{name:'QA KPI initiative',exact:true}).count());
 await page.getByRole('button',{name:'＋ شاخص',exact:true}).click();for(const [field,value] of Object.entries({name:'QA draft KPI',owner:'QA owner',unit:'%'}))await page.locator('#pf-'+field).fill(value);await page.locator('#pf-status').selectOption('draft');await page.getByRole('button',{name:'ذخیره',exact:true}).click();await page.getByRole('heading',{name:'QA draft KPI',exact:true}).waitFor();await page.goto(root+'#explore');
 const prior=await page.evaluate(()=>JSON.parse(localStorage.getItem('kish_qa_transfer-ci:kish_okr_free_practice_v1')));assert.equal(prior.state.strategy.kpis.find(k=>k.name==='QA draft KPI').status,'draft');
 await page.getByRole('button',{name:'فضای سازمانی و بازیابی',exact:true}).click();
 const invalid=JSON.parse(JSON.stringify(prior.state));invalid.strategy.pillars[0].parentId=invalid.strategy.pillars[0].id;
 const upload=state=>page.locator('[data-kish-transfer-file]').setInputFiles({name:'workspace.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(state))});
 await upload(invalid);await page.locator('[data-kish-transfer-error]').filter({hasText:'معتبر نیست'}).waitFor();assert.equal(await page.locator('[data-kish-transfer-apply]').isEnabled(),false);
 const imported=structuredClone(prior.state);imported.initiatives[0].title='QA recovered initiative';
 await upload(imported);await page.locator('[data-kish-transfer-apply]:enabled').waitFor();assert.match(await page.locator('[data-kish-transfer-preview]').innerText(),/مرورگر فعلی/);await page.locator('[data-kish-transfer-apply]').click();await page.reload();await page.getByRole('link',{name:'QA recovered initiative',exact:true}).waitFor();
 const backups=await page.evaluate(()=>Object.keys(localStorage).filter(k=>k.startsWith('kish_qa_transfer-ci:kish_okr_before_transfer_')).map(k=>JSON.parse(localStorage.getItem(k))));assert.ok(backups.some(b=>b.state.initiatives.some(i=>i.title==='QA standalone initiative')),'pre-import records remain recoverable');
 assert.deepEqual(errors,[]);console.log('PASS standalone and KPI-linked initiatives, KPI draft, validated import, comparison, backup, reload');
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exit(1)});
