import {chromium} from 'playwright';
import fs from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';

const ROOT='http://127.0.0.1:4173/small-business/';
const DIR='artifacts/small-business-qa';
await fs.mkdir(DIR,{recursive:true});
const browser=await chromium.launch({headless:true});
const results=[],errors=[];
const sectors=['services','retail','manufacturing','healthcare','food','digital','tourism','education','agriculture','construction','trade','other'];
const fa=n=>new Intl.NumberFormat('fa-IR').format(n);
const check=(label,ok,details='')=>{results.push({label,pass:!!ok,details:String(details)});console.log((ok?'PASS ':'FAIL ')+label+(details?' — '+String(details).slice(0,250):''))};
const popup=page=>page.on('dialog',dialog=>dialog.accept('کاربر جدید'));
async function openApp(page){
 const response=await page.goto(ROOT,{waitUntil:'domcontentloaded',timeout:25000});
 assert(response?.ok(),'App URL did not resolve');
 await page.locator('#page-home.active').waitFor({timeout:5000});
 assert.equal(await page.locator('.home-actions>.home-tile').count(),3);
}
async function profile(page,sector,name){
 await page.locator('.home-actions [data-go=wizard]').click();
 await page.locator('#page-profile.active').waitFor({timeout:3000});
 await page.locator('#businessName').fill(name);
 await page.locator('#sector').selectOption(sector);
 await page.locator('select[name=stage]').selectOption('operating');
 await page.locator('#profileForm button[type=submit]').click();
 await page.locator('#page-wizard.active').waitFor({timeout:3000});
}
async function fillStep(page,index,label){
 assert((await page.locator('#wizardIndex').innerText()).includes(fa(index+1)),'Wrong stage index');
 const questions=page.locator('#questionList .question'),count=await questions.count();
 assert(count>=4&&count<=9,'Unexpected questions '+count+' in stage '+index);
 for(let i=0;i<count;i++){
  const q=questions.nth(i),select=q.locator('select.select-answer');
  if(await select.count()){assert((await select.locator('option').count())>=4);await select.selectOption({index:1})}
  else{
   const choices=q.locator('details.multi-answer');
   assert.equal(await choices.count(),1,'Missing multi-choice dropdown');
   await choices.locator('summary').click();
   await choices.locator('input[type=checkbox]').first().check();
  }
  if(i===0){
   const note=q.locator('details.note-detail');
   await note.locator('summary').click();
   await note.locator('textarea').fill('یادداشت اختصاصی '+label+' مرحله '+fa(index+1));
  }
 }
 return count;
}
const ctx=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true,locale:'fa-IR',acceptDownloads:true});
const page=await ctx.newPage();page.on('pageerror',e=>errors.push('full: '+e.message));
try{
 await openApp(page);
 await profile(page,'retail','فروشگاه آزمایشی');
 let total=0;
 for(let index=0;index<10;index++){
  total+=await fillStep(page,index,'فروشگاه');
  await page.locator('#nextStep').click();
 }
 await page.locator('#page-plan.active').waitFor({timeout:3000});
 assert.equal(await page.locator('#decisionGrid .decision').count(),10);
 assert.equal(await page.locator('#roadmap .roadmap-phase').count(),3);
 assert((await page.locator('#planSummary').innerText()).includes(fa(total)),'Answered question count missing');
 await page.locator('#financeArea summary').click();
 const vals={price:'2000',variable:'800',fixed:'12000',volume:'50',cash:'50000',burn:'10000'};
 for(const [key,val] of Object.entries(vals))await page.locator('[data-fin="'+key+'"]').fill(val);
 const financeText=await page.locator('#financeResults').innerText();
 assert(financeText.includes('۱۰'),'Breakeven should be 10 units');
 assert(financeText.includes('۴۸٬۰۰۰'),'Profit should be 48000');
 assert(financeText.includes('۵'),'Cash runway should be 5 months');
 const dl=page.waitForEvent('download');
 await page.locator('#downloadReport').click();
 const download=await dl,reportPath=path.join(DIR,'retail-report.html');
 await download.saveAs(reportPath);
 const html=await fs.readFile(reportPath,'utf8');
 assert.equal((html.match(/class="step"/g)||[]).length,10,'Missing steps in downloaded report');
 assert(html.includes('یادداشت اختصاصی فروشگاه'));
 await page.evaluate(()=>window.print=()=>{window.__printed=true});
 await page.locator('#printReport').click();
 assert(await page.evaluate(()=>Boolean(window.__printed)),'Print not triggered');
 await page.locator('[data-nav=status]').click();
 assert.equal(await page.locator('#stageList .stage-item').count(),10);
 assert((await page.locator('#statusStages').innerText()).includes('۱۰'),'Ten stages not complete');
 await page.reload({waitUntil:'domcontentloaded'});
 await page.locator('[data-nav=plan]').click();
 assert((await page.locator('#planSummary').innerText()).includes(fa(total)),'Persistence after reload failed');
 await page.screenshot({path:path.join(DIR,'retail-mobile.png'),fullPage:true});
 check('Complete mobile scenario: 10 stages, all dropdowns, personal notes, financials, 90-day plan, report, print, persistence',true,'Questions: '+total);
}catch(e){check('Complete mobile scenario',false,e.stack||String(e));await page.screenshot({path:path.join(DIR,'FAIL-mobile.png'),fullPage:true}).catch(()=>{})}
try{
 await page.locator('#mainMenu>summary').click();
 const backupPromise=page.waitForEvent('download');
 await page.locator('#backupBtn').click();
 const dl=await backupPromise,backupPath=path.join(DIR,'backup.json');
 await dl.saveAs(backupPath);
 const json=JSON.parse(await fs.readFile(backupPath,'utf8'));
 assert(json.data?.profile?.businessName,'No profile in backup');
 check('Backup JSON with structured answers',true);
 popup(page);
 await page.locator('#mainMenu>summary').click();
 await page.locator('#addProject').click();
 await page.locator('#page-profile.active').waitFor();
 await page.locator('[data-nav=plan]').click();
 assert(!(await page.locator('#planSummary').innerText()).includes('فروشگاه آزمایشی'),'Project data leaked');
 check('Independent second business workspace',true);
 await page.locator('#mainMenu>summary').click();
 await page.locator('#restoreFile').setInputFiles(backupPath);
 await page.waitForFunction(()=>document.querySelector('#heroTitle')?.textContent?.includes('فروشگاه آزمایشی'),{timeout:6000}).catch(()=>{});
 await page.locator('[data-nav=plan]').click();
 assert((await page.locator('#planSummary').innerText()).includes('فروشگاه آزمایشی'));
 check('Backup restore into independent workspace',true);
 await page.locator('#mainMenu>summary').click();
 await page.locator('#resetBtn').click();
 await page.locator('[data-nav=plan]').click();
 assert(!(await page.locator('#planSummary').innerText()).includes('فروشگاه آزمایشی'));
 check('Reset only selected business',true);
}catch(e){check('Backup/workspace/restore/reset',false,e.stack||String(e))}
await ctx.close();
for(const sector of sectors){
 const context=await browser.newContext({viewport:{width:sector==='services'?1350:390,height:850},acceptDownloads:false});
 const p=await context.newPage();p.on('pageerror',e=>errors.push(sector+': '+e.message));
 try{
  await openApp(p);
  await profile(p,sector,'نمونه '+sector);
  const bank=await p.evaluate(()=>({n:window.SMALL_BUSINESS_GUIDE?.stages?.length,total:window.SMALL_BUSINESS_GUIDE?.questionCount,sectors:Object.keys(window.SMALL_BUSINESS_GUIDE?.sectorOptions||{})}));
  assert.equal(bank.n,10);assert(bank.total>=40);
  assert(await p.locator('#questionList .question').count()>=4);
  await p.locator('#questionList select.select-answer').first().selectOption({index:1});
  await p.locator('#nextStep').click();
  assert((await p.locator('#wizardIndex').innerText()).includes('۲'));
  await p.reload({waitUntil:'domcontentloaded'});
  await p.locator('[data-nav=status]').click();
  assert((await p.locator('#statusCount').innerText()).includes('۱'));
  check('Sector '+sector+': adaptive 10-stage form and autosave',true);
 }catch(e){check('Sector '+sector,false,e.stack||String(e));
  await p.screenshot({path:path.join(DIR,'FAIL-'+sector+'.png'),fullPage:true}).catch(()=>{})}
 finally{await context.close()}
}
{
 const context=await browser.newContext({viewport:{width:390,height:844}});
 const p=await context.newPage();p.on('pageerror',e=>errors.push('demo: '+e.message));
 try{
  const res=await p.goto(ROOT+'demo.html',{waitUntil:'domcontentloaded'});assert(res.ok());
  await p.locator('input[name=name]').fill('نمونه رایگان');
  await p.locator('select[name=industry]').selectOption({index:1});
  await p.locator('select[name=customer]').selectOption({index:2});
  await p.locator('#demoForm button[type=submit]').click();
  assert(await p.locator('#demoResult').isVisible());
  assert((await p.locator('#demoTips').innerText()).includes('گفت‌وگو با مشتریان'));
  p.once('dialog',d=>d.accept());
  await p.locator('#clearDemo').click();
  assert(!(await p.locator('#demoResult').isVisible()));
  check('Free demo scenario and personalized recommendation',true);
 }catch(e){check('Free demo',false,e.stack||String(e))}
 finally{await context.close()}
}
await browser.close();
const out={passed:results.filter(x=>x.pass).length,failed:results.filter(x=>!x.pass).length,errors,results};
await fs.writeFile(path.join(DIR,'summary.json'),JSON.stringify(out,null,2));
console.log('SUMMARY',JSON.stringify({passed:out.passed,failed:out.failed,errors:out.errors},null,2));
if(out.failed||errors.length)process.exitCode=1;
