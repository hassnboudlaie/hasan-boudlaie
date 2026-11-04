import { chromium } from 'playwright';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';

const ROOT='http://127.0.0.1:4173/business-model-canvas/';
const DIR='artifacts/bmc-qa';
await fs.mkdir(DIR,{recursive:true});
const browser=await chromium.launch({headless:true});
const results=[],errors=[];
const test=(name,pass,detail='')=>{
  results.push({name,pass:Boolean(pass),detail:String(detail||'')});
  console.log((pass?'PASS ':'FAIL ')+name+(detail?' — '+String(detail).slice(0,400):''));
};
const cases=[
 {industry:'retail',market:'b2c',stage:'idea',name:'فروشگاه'},
 {industry:'service',market:'b2b',stage:'running',name:'خدمات سازمانی'},
 {industry:'digital',market:'both',stage:'testing',name:'نرم‌افزار'},
 {industry:'manufacturing',market:'b2b',stage:'growing',name:'تولید'},
 {industry:'health',market:'b2c',stage:'running',name:'کلینیک'},
 {industry:'education',market:'both',stage:'idea',name:'آموزش'},
 {industry:'other',market:'b2c',stage:'testing',name:'سایر'}
];
async function fillStep(page,step,label){
 const questions=page.locator('#questionList .question');
 const count=await questions.count();
 assert(count>=2 && count<=6,'Question count at step '+step+': '+count);
 for(let q=0;q<count;q++){
   const root=questions.nth(q),select=root.locator('.choice-wrapper select');
   if(await select.count()){
     assert((await select.locator('option').count())>=4,'Dropdown lacks options');
     await select.selectOption({index:1});
   }else{
     const dropdown=root.locator('details.dropdown-multi');
     assert.equal(await dropdown.count(),1,'Missing multi-select dropdown');
     await dropdown.locator('summary').click();
     assert((await dropdown.locator('input[type=checkbox]').count())>=3,'No multi-select options');
     await dropdown.locator('input[type=checkbox]').first().check();
   }
   if(q===0){
     const note=root.locator('details.note-details');
     await note.locator('summary').click();
     await note.locator('textarea').fill('یادداشت اختصاصی '+label+' بخش '+(step+1));
   }
 }
 const labelText=await page.locator('#wizardCount').innerText();
 assert(labelText.includes('/'),'Question counter missing');
 return count;
}
async function runCase(item,index){
 const ctx=await browser.newContext({viewport:index%2?{width:1365,height:900}:{width:390,height:844},isMobile:index%2===0,hasTouch:index%2===0,acceptDownloads:true});
 const page=await ctx.newPage();
 page.on('pageerror',e=>errors.push(item.name+': '+e.message));
 try{
   const res=await page.goto(ROOT+'studio.html',{waitUntil:'domcontentloaded',timeout:30000});
   assert(res && res.ok(),'Cannot open app');
   await page.locator('#page-dashboard.active').waitFor({timeout:10000});
   assert.equal(await page.locator('.dash-action').count(),3,'Three dashboard actions');
   await page.locator('.dash-action.main-action').click();
   await page.locator('#page-onboard.active').waitFor();
   await page.locator('#ownerName').fill('تکمیل‌کننده '+item.name);
   await page.locator('#businessName').fill('کسب‌وکار آزمایشی '+item.name);
   await page.locator('#industry').selectOption(item.industry);
   await page.locator('#market').selectOption(item.market);
   await page.locator('#stage').selectOption(item.stage);
   await page.locator('#page-onboard button[data-goto=wizard]').click();
   await page.locator('#page-wizard.active').waitFor();
   let total=0;
   for(let i=0;i<9;i++){
     assert((await page.locator('#wizardStepLabel').innerText()).includes(String(i+1)),'Step '+i+' wrong');
     total+=await fillStep(page,i,item.name);
     await page.locator('#nextStep').click();
   }
   await page.locator('#page-final.active').waitFor();
   assert.equal(await page.locator('#finalCanvas .final-block').count(),9,'Final report not nine blocks');
   const finalText=await page.locator('#finalCanvas').innerText();
   assert(finalText.includes('یادداشت اختصاصی '+item.name),'Notes not in report');
   assert((await page.locator('#finalMeta').innerText()).includes(item.name),'User name not in report');
   const downloadPromise=page.waitForEvent('download',{timeout:10000});
   await page.locator('#downloadCanvasReport').click();
   const download=await downloadPromise;
   const reportPath=path.join(DIR,'canvas-'+item.industry+'.html');
   await download.saveAs(reportPath);
   const report=await fs.readFile(reportPath,'utf8');
   assert.equal((report.match(/<article class="block /g)||[]).length,9,'Downloaded HTML report incomplete');
   assert(report.includes('یادداشت اختصاصی '+item.name),'Downloaded report missing context');
   await page.locator('button[data-page=canvas]').click();
   await page.locator('#page-canvas.active').waitFor();
   const block=page.locator('#canvas [data-block=segments]');
   await block.click();
   assert(await page.locator('#canvasDialog').isVisible(),'Click did not open block editor');
   await page.locator('#canvasEditText').fill('اصلاح‌شده برای '+item.name);
   await page.locator('#canvasDialogDone').click();
   assert((await block.innerText()).includes('اصلاح‌شده برای '+item.name),'Edited block preview missing');
   await page.reload({waitUntil:'domcontentloaded'});
   await page.locator('button[data-page=canvas]').click();
   assert((await page.locator('#canvas [data-block=segments]').innerText()).includes('اصلاح‌شده برای '+item.name),'Autosave not persisted');
   await page.locator('button[data-page=final]').click();
   assert((await page.locator('#finalCanvas [data-block=segments]').innerText()).includes('اصلاح‌شده برای '+item.name),'Final model not refreshed');
   await page.evaluate(()=>{window.__printCount=0;window.print=()=>{window.__printCount++}});
   await page.locator('#printFinal').click();
   assert(await page.evaluate(()=>window.__printCount===1),'Print button not functional');
   await page.locator('#page-final button[data-goto=roadmap]').click();
   assert(await page.locator('#page-roadmap.active').isVisible(),'Roadmap not reachable');
   const tasks=page.locator('#roadmap input[type=checkbox]');
   assert.equal(await tasks.count(),12,'Roadmap tasks missing');
   await tasks.first().check();
   assert((await page.locator('#doneCount').innerText()).includes('۱'),'Roadmap progress not updated');
   await page.locator('button[data-page=dashboard]').click();
   assert(await page.locator('#page-dashboard.active').isVisible(),'Home button does not work');
   assert((await page.locator('#dashboardBlocks').innerText()).includes('۹'),'Progress count incorrect');
   test(item.name+' — تکمیل ۹ مرحله و خروجی شخصی و چاپ و ویرایش و ذخیره و برنامه اقدام',true,'پرسش‌ها: '+total);
   await page.screenshot({path:path.join(DIR,'dashboard-'+item.industry+'.png'),fullPage:true});
   if(index===0){
     await page.locator('#dataTools summary').click();
     const backupPromise=page.waitForEvent('download');
     await page.locator('#exportJSON').click();
     const backup=await backupPromise,backupPath=path.join(DIR,'backup-retail.json');
     await backup.saveAs(backupPath);
     const backupData=JSON.parse(await fs.readFile(backupPath,'utf8'));
     assert.equal(backupData.data.profile.industry,'retail','Backup industry incorrect');
     assert(backupData.data.answers.seg_main,'Backup answers missing');
     test('فایل پشتیبان داده‌های فرد را دارد',true);
     page.once('dialog',async d=>{assert.equal(d.type(),'prompt');await d.accept('شخص دوم')});
     await page.locator('details.header-menu summary').click();
     await page.locator('#newWorkspace').click();
     assert.equal(await page.locator('#businessName').inputValue(),'','New project still has old data');
     test('ساخت مدل دوم مستقل بدون انتقال اطلاعات نفر اول',true);
     page.on('dialog',async d=>{await d.accept()});
     await page.locator('#importFile').setInputFiles(backupPath);
     await page.waitForFunction(()=>document.getElementById('businessName').value.includes('فروشگاه'),null,{timeout:10000});
     test('بازیابی نسخه پشتیبان در مدل مستقل',true);
     await page.locator('#clearAll').click();
     assert.equal(await page.locator('#businessName').inputValue(),'','Reset did not clear project');
     test('پاک‌کردن مدل فعلی',true);
   }
 }catch(e){
   test(item.name+' — آزمون سرتاسری',false,e.stack||String(e));
   await page.screenshot({path:path.join(DIR,'failure-'+item.industry+'.png'),fullPage:true}).catch(()=>{});
 }finally{await ctx.close()}
}
for(let i=0;i<cases.length;i++)await runCase(cases[i],i);
{
 const context=await browser.newContext({viewport:{width:390,height:844},acceptDownloads:true});
 const page=await context.newPage();
 page.on('pageerror',e=>errors.push('demo: '+e.message));
 try{
   const res=await page.goto(ROOT,{waitUntil:'domcontentloaded'});
   assert(res.ok(),'Free demo does not load');
   await page.locator('#name').fill('فروشگاه آزمایشی');
   await page.locator('#owner').fill('فرد آزمایشی');
   for(const id of ['segments','problem','value','channels','revenue','costs'])await page.locator('#'+id).selectOption({index:1});
   await page.locator('#businessForm button[type=submit]').click();
   assert(await page.locator('#resultPanel').isVisible(),'Demo result not shown');
   assert.equal(await page.locator('#canvas [data-key]').count(),9,'Demo canvas not 9 blocks');
   assert((await page.locator('#resultHint').innerText()).includes('فروشگاه آزمایشی'),'Demo title wrong');
   await page.locator('#reset').click();
   assert(!(await page.locator('#resultPanel').isVisible()),'Reset did not hide result');
   test('نمونه رایگان: فرم، خروجی ۹ بلوک، بازنشانی',true);
   await page.screenshot({path:path.join(DIR,'demo.png'),fullPage:true});
 }catch(e){test('نمونه رایگان',false,e.stack||String(e))}
 finally{await context.close()}
}
await browser.close();
await fs.writeFile(path.join(DIR,'results.json'),JSON.stringify({results,errors},null,2));
console.log('نتایج:',results.filter(x=>x.pass).length,'موفق،',results.filter(x=>!x.pass).length,'ناموفق،',errors.length,'خطای جاوااسکریپت');
if(results.some(x=>!x.pass)||errors.length)process.exitCode=1;
