/* Public anonymous browser smoke for Alborz Session Four; no credentials, participant writes or quiz submission. */
'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {chromium}=require('playwright');
const ORIGIN='https://hassnboudlaie.github.io/hasan-boudlaie';
const PROOF=path.resolve(__dirname,'..','artifacts','alborz-session4-live');
fs.mkdirSync(PROOF,{recursive:true});
async function run(){
 const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
 const report=[];
 for(const [name,w,h] of [['laptop',1366,768],['mobile',390,844]]){
  const page=await browser.newPage({viewport:{width:w,height:h},deviceScaleFactor:1});
  page.setDefaultTimeout(6500);
  const errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  const first=await page.goto(ORIGIN+'/alborz-communication-skills/index.html?m=4&health=ui',{waitUntil:'domcontentloaded',timeout:30000});
  assert.equal(first.status(),200,name+': HTTP');
  await page.locator('.s4-path').waitFor({state:'visible'});
  assert.equal(await page.locator('.s4-path-card').count(),3,name+': 3-path home');
  await page.locator('.s4-path [data-s4-open="techniques"]').click();
  assert.equal(await page.locator('.s4-tech').count(),6,name+': six techniques');
  await page.locator('.s4-tech').first().click();
  assert(await page.locator('.s4-tech-detail').isVisible(),name+': technique open');
  assert.equal(await page.locator('.s4-example-item').count(),3,name+': three examples per technique');
  assert.equal(await page.locator('.s4-linked-case').count(),2,name+': two primary cases per technique');
  assert.equal(await page.locator('.s4-tech-challenge').count(),0,name+': no micropractice');
  await page.locator('.s4-linked-case').first().click();
  assert(await page.locator('#s4-focus .s4-work').isVisible(),name+': case open');
  assert.equal(await page.locator('#s4-focus .s4-persona').count(),2,name+': both role briefs');
  assert.equal(await page.locator('#s4-focus [data-s4-step]').count(),4,name+': four roleplay stages');
  assert.equal(await page.locator('#s4-focus .s4-relation-map').count(),1,name+': direct and indirect links');
  await page.locator('#s4-focus [data-s4-next]').click();
  assert.equal(await page.locator('#s4-focus .s4-tabs button.active').getAttribute('data-s4-step'),'1',name+': stage forward');
  await page.locator('#s4-focus [data-s4-close]').first().click();
  assert(await page.locator('.s4-root[data-s4-view="technique"]').isVisible(),name+': return to technique');
  if(name==='mobile') await page.locator('.s4-mobile-nav [data-s4-open="practice"]').click();
  else {
    await page.locator('.s4-screen-back').click();
    await page.locator('.s4-screen-back').click();
    await page.locator('.s4-path [data-s4-open="practice"]').click();
  }
  assert.equal(await page.locator('.s4-cases.s4-case-flat > .s4-case').count(),12,name+': all 12 cases ungrouped');
  assert.equal(await page.locator('.s4-role-index').count(),0,name+': no role groups');
  if(name==='mobile') await page.locator('.s4-mobile-nav [data-s4-open="exam"]').click();
  else await page.locator('.s4-page-flip [data-s4-advance]').click();
  assert(await page.locator('#s4-final-exam').isVisible(),name+': final quiz available');
  await page.screenshot({path:path.join(PROOF,name+'-exam.png'),fullPage:false});
  assert.deepEqual(errors,[],name+': no uncaught JavaScript errors');
  report.push({device:name,http:200,techniques:6,examples:3,linkedRoleplays:2,cases:12,quiz:'accessible',consoleErrors:errors.length});
  await page.close();
 }
 const backup=await browser.newPage();
 const fallback=await backup.goto(ORIGIN+'/alborz4.html',{waitUntil:'domcontentloaded',timeout:30000});
 assert.equal(fallback.status(),200,'fallback link HTTP 200');
 await backup.waitForURL(/session4-classroom-fallback.html/,{timeout:10000});
 assert.equal(await backup.locator('details.case').count(),12,'fallback contains 12 roleplays');
 assert.equal(await backup.locator('.tech').count(),6,'fallback contains six techniques');
 report.push({device:'classroom fallback',http:200,techniques:6,cases:12});
 fs.writeFileSync(path.join(PROOF,'public-check.json'),JSON.stringify(report,null,2));
 console.log('PASS: anonymous live UI, desktop/mobile lesson flow, 12 cases, quiz and static fallback\n'+JSON.stringify(report));
 await browser.close();
}
run().catch(e=>{console.error('FAILED:',e);process.exitCode=1;});
