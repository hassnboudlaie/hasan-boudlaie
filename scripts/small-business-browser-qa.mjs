import { chromium } from 'playwright';
import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
import path from 'node:path';

const ROOT='http://127.0.0.1:4173/small-business/',DIR='artifacts/small-business-qa';
await fs.mkdir(DIR,{recursive:true});
const browser=await chromium.launch({headless:true});
const results=[],errors=[];
function mark(label,pass,extra=''){results.push({label,pass:Boolean(pass),extra:String(extra||'')});console.log((pass?'PASS ':'FAIL ')+label+(extra?' — '+String(extra).slice(0,400):''))}
const samples=[
 {id:'retail',label:'فروشگاه',stage:'idea'},
 {id:'service',label:'خدمات',stage:'running'},
 {id:'manufacturing',label:'تولید',stage:'launching'},
 {id:'health',label:'سلامت',stage:'running'},
 {id:'food',label:'رستوران',stage:'launching'},
 {id:'digital',label:'نرم‌افزار',stage:'growing'},
 {id:'tourism',label:'گردشگری',stage:'idea'},
 {id:'education',label:'آموزش',stage:'running'},
 {id:'agriculture',label:'کشاورزی',stage:'idea'},
 {id:'construction',label:'ساختمان',stage:'growing'},
 {id:'trade',label:'تجارت',stage:'running'},
 {id:'other',label:'سایر',stage:'idea'}
];
async function answerStep(page,step,item){
 const questions=page.locator('#questionList .question'),num=await questions.count();
 assert(num>=4&&num<=6,'Question count at step '+step+': '+num);
 for(let i=0;i<num;i++){
  const question=questions.nth(i),select=question.locator('select');
  if(await select.count()){assert((await select.locator('option').count())>=4);await select.selectOption({index:1})}
  else {const drop=question.locator('details.multi-choices');assert.equal(await drop.count(),1);
   await drop.locator('summary').click();await drop.locator('input[type=checkbox]').first().check()}
  if(i===0){const note=question.locator('details.note-box');await note.locator('summary').click();await note.locator('textarea').fill('نکته اختصاصی '+item.label+' مرحله '+(step+1))}
 }
 return num;
}
async function fullCase(item,idx){
 const ctx=await browser.newContext({viewport:idx%2?{width:1340,height:860}:{width:390,height:844},isMobile:idx%2===0,hasTouch:idx%2===0,acceptDownloads:true,locale:'fa-IR'});
 const page=await ctx.newPage();
 page.on('pageerror',e=>errors.push(item.label+': '+e.message));
 try{
  const res=await page.goto(ROOT,{waitUntil:'domcontentloaded',timeout:25000});assert(res?.ok(),'App HTTP not OK');
  await page.locator('#view-home.active').waitFor({timeout:12000});
  assert.equal(await page.locator('.home-action').count(),3,'Only three home actions');
  await page.locator('.home-action.primary-action').click();
  await page.locator('#view-profile.active').waitFor();
  await page.locator('input[name=businessName]').fill('نمونه '+item.label);
  await page.locator('input[name=ownerName]').fill('کاربر آزمایشی');
  await page.locator('select[name=industry]').selectOption(item.id);
  await page.locator('select[name=stage]').selectOption(item.stage);
  await page.locator('#view-profile button[data-go=wizard]').click();
  await page.locator('#view-wizard.active').waitFor();
  let questions=0;
  for(let i=0;i<10;i++){
   assert((await page.locator('#stepCounter').innerText()).includes(String(i+1)),'Step label '+i);
   questions+=await answerStep(page,i,item);
   if(i===4){
    const fin=page.locator('#financialInputs');
    assert(await fin.isVisible(),'Finance calculator hidden');
    await fin.locator('input[name=unitPrice]').fill('2000');
    await fin.locator('input[name=variableCost]').fill('800');
    await fin.locator('input[name=fixedCost]').fill('12000');
    await fin.locator('input[name=monthlyVolume]').fill('50');
    assert((await page.locator('#financialPreview').innerText()).includes('۱۰'),'Financial breakeven not 10');
   }
   await page.locator('#nextStep').click();
  }
  await page.locator('#view-report.active').waitFor();
  assert.equal(await page.locator('#reportDecisions .decision').count(),10,'Report must cover ten stages');
  assert((await page.locator('#reportSummary').innerText()).includes('۱۰ مرحله'),'10 steps not summarized');
  assert((await page.locator('#reportDecisions').innerText()).includes('نکته اختصاصی '+item.label),'Notes missing');
  assert((await page.locator('#financialResults').innerText()).includes('۴۸٬۰۰۰'),'Operating profit must be 48,000');
  const downloadPromise=page.waitForEvent('download',{timeout:10000});
  await page.locator('#downloadPlan').click();
  const file=await downloadPromise,filepath=path.join(DIR,'report-'+item.id+'.html');
  await file.saveAs(filepath);
  const report=await fs.readFile(filepath,'utf8');
  assert((report.match(/class="step"/g)||[]).length===10,'Downloaded report missing chapters');
  assert(report.includes('نکته اختصاصی '+item.label),'Downloaded report missing notes');
  await page.evaluate(()=>{window.__printed=0;window.print=()=>{window.__printed++}});
  await page.locator('#printPlan').click();
  assert(await page.evaluate(()=>window.__printed===1),'Print not invoked');
  await page.locator('button[data-view=status]').click();
  await page.locator('#view-status.active').waitFor();
  assert.equal(await page.locator('#statusSteps .status-item').count(),10);
  assert((await page.locator('#statusScore').innerText()).includes('۱۰'),'All ten steps must be counted');
  await page.locator('#statusSteps .status-item').first().click();
  await page.locator('#view-wizard.active').waitFor();
  assert((await page.locator('#stepCounter').innerText()).includes('۱'));
  await page.locator('#nextStep').click();
  await page.reload({waitUntil:'domcontentloaded'});
  await page.locator('button[data-view=report]').click();
  assert((await page.locator('#reportDecisions').innerText()).includes('نکته اختصاصی '+item.label),'Persisted state missing after reload');
  mark('مدل '+item.label+' — ده مرحله، ذخیره، مالی، خروجی، چاپ، وضعیت',true,'پرسش‌های پاسخ‌داده‌شده: '+questions);
  await page.screenshot({path:path.join(DIR,'report-'+item.id+'.png'),fullPage:true});
  if(idx===0){
    await page.locator('.data-drawer>summary').click();
    const backupPromise=page.waitForEvent('download');
    await page.locator('#exportBackup').click();
    const backup=await backupPromise,backupPath=path.join(DIR,'backup-retail.json');await backup.saveAs(backupPath);
    const data=JSON.parse(await fs.readFile(backupPath,'utf8'));
    assert(data.data.answers.motivation,'Backup missing first answer');
    mark('فایل پشتیبان شامل پاسخ‌های واقعی است',true);
    await page.locator('#topMenu>summary').click();
    page.once('dialog',async d=>{assert.equal(d.type(),'prompt');await d.accept('نمونه دوم')});
    await page.locator('#newProject').click();
    await page.locator('#view-profile.active').waitFor();
    assert.equal(await page.locator('input[name=businessName]').inputValue(),'نمونه دوم');
    await page.locator('button[data-view=report]').click();
    assert(!(await page.locator('#reportDecisions').innerText()).includes('نکته اختصاصی فروشگاه'),'Second project inherited answers');
    mark('پروژه دوم مستقل از اول است',true);
    page.on('dialog',async d=>await d.accept());
    await page.locator('#backupFile').setInputFiles(backupPath);
    await page.waitForFunction(()=>document.querySelector('input[name=businessName]').value==='نمونه فروشگاه');
    mark('بازیابی نسخه پشتیبان',true);
    if(!(await page.locator('.data-drawer').evaluate(e=>e.open)))await page.locator('.data-drawer>summary').click();
    await page.locator('#resetProject').click();
    assert.equal(await page.locator('input[name=businessName]').inputValue(),'');
    mark('بازنشانی اطلاعات کسب‌وکار',true);
  }
 }catch(e){mark('مدل '+item.label+' — آزمون مرورگر',false,e.stack||String(e));
  await page.screenshot({path:path.join(DIR,'FAIL-'+item.id+'.png'),fullPage:true}).catch(()=>{});
 }finally{await ctx.close()}
}
for(let i=0;i<samples.length;i++)await fullCase(samples[i],i);
{
 const context=await browser.newContext({viewport:{width:390,height:844},acceptDownloads:true});
 const page=await context.newPage();page.on('pageerror',e=>errors.push('نمونه رایگان: '+e.message));
 try{
  const response=await page.goto(ROOT+'demo.html',{waitUntil:'domcontentloaded'});assert(response.ok());
  await page.locator('input[name=name]').fill('نمونه آزمایشی');
  await page.locator('select[name=industry]').selectOption({index:1});
  await page.locator('select[name=customer]').selectOption({index:2});
  await page.locator('#demoForm button[type=submit]').click();
  assert(await page.locator('#demoResult').isVisible(),'Demo does not show result');
  assert((await page.locator('#demoTips').innerText()).includes('گفت‌وگو با مشتریان'),'Demo advice not personalized');
  page.once('dialog',d=>d.accept());
  await page.locator('#clearDemo').click();
  assert(!(await page.locator('#demoResult').isVisible()),'Demo reset did not hide result');
  mark('نمونه رایگان: پرسشنامه و توصیه اختصاصی و بازنشانی',true);
 }catch(e){mark('نمونه رایگان',false,e.stack||String(e))}
 finally{await context.close()}
}
await browser.close();
const summary={passed:results.filter(x=>x.pass).length,failed:results.filter(x=>!x.pass).length,errors,results};
await fs.writeFile(path.join(DIR,'summary.json'),JSON.stringify(summary,null,2));
console.log('SUMMARY',JSON.stringify({passed:summary.passed,failed:summary.failed,errors:summary.errors},null,2));
if(summary.failed||errors.length)process.exitCode=1;
