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
   assert.equal(await page.locator('#special-entry').count(),0,'Child culture spotlight must not dominate general home');
   assert.equal(await page.locator('#specializedModels').count(),1,'Missing optional specialized-model catalog');
   assert(!(await page.locator('#specializedModels').evaluate(el=>el.open)),'Specialized catalog must be collapsed by default');
   await page.locator('#specializedModels summary').click();
   assert(await page.locator('#specializedModels a[href="./child-culture.html"]').isVisible(),'Dedicated child-culture link missing');
   await page.locator('#specializedModels summary').click();

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
     if(!(await page.locator('#dataTools').evaluate(el=>el.open)))await page.locator('#dataTools summary').click();
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
   await page.locator('#demoExtra > summary').click();
   for(const id of ['segments','problem','value','channels','revenue','costs'])await page.locator('#'+id).selectOption({index:1});
   await page.locator('#businessForm button[type=submit]').click();
   assert(await page.locator('#resultPanel').isVisible(),'Demo result not shown');
   assert.equal(await page.locator('#canvas [data-key]').count(),9,'Demo canvas not 9 blocks');
   assert((await page.locator('#resultHint').innerText()).includes('فروشگاه آزمایشی'),'Demo title wrong');
   page.once('dialog',async dialog=>await dialog.accept());
   await page.locator('#reset').click();
   assert(!(await page.locator('#resultPanel').isVisible()),'Reset did not hide result');
   test('نمونه رایگان: فرم، خروجی ۹ بلوک، بازنشانی',true);
   await page.screenshot({path:path.join(DIR,'demo.png'),fullPage:true});
 }catch(e){test('نمونه رایگان',false,e.stack||String(e))}
 finally{await context.close()}
}

{
 const context=await browser.newContext({viewport:{width:390,height:844},acceptDownloads:true});
 const page=await context.newPage();
 page.on('pageerror',e=>errors.push('child-culture: '+e.message));
 try{
   const res=await page.goto(ROOT+'child-culture.html',{waitUntil:'load',timeout:30000});
   assert(res && res.ok(),'Dedicated child culture page did not open');
   assert.equal(await page.locator('#risk-assessment .ra-item').count(),11,'Risk catalog incomplete');
   assert.equal(await page.locator('#action-plan .ra-item').count(),12,'90-day action plan incomplete');
   assert.equal(await page.locator('#blocks .block').count(),9,'The nine standard BMC blocks were changed');
   await page.locator('#idea').fill('ایده آزمایشی محصولات فرهنگی کودک');
   assert.equal(await page.locator('#blocks .deep-details').count(),9,'Missing nine BMC discovery groups');
   assert.equal(await page.locator('#blocks .deep-question').count(),90,'Expected 90 tailored BMC questions');
   assert.equal(await page.locator('#tiles .tile').count(),9,'Missing nine clickable block tiles');
   for(let i=0;i<9;i++)assert.equal(await page.locator('#block'+i+' .deep-question').count(),10,'Block '+i+' does not contain ten questions');
   assert.equal(await page.locator('#blocks .block:visible').count(),1,'All blocks shown at once instead of guided flow');
   assert(await page.locator('#block0').isVisible(),'First BMC block not initially selected');
   const deepSection=page.locator('#block0 .deep-details');
   assert(await deepSection.evaluate(e=>e.open),'Current block discovery section must be open');
   const deepQuestion=deepSection.locator('.deep-question').first();
   if(!(await deepQuestion.evaluate(e=>e.open)))await deepQuestion.locator('summary.deep-question-title').click();
   assert(await deepQuestion.locator('.deep-option').first().isVisible(),'Question options do not expand');
   await deepQuestion.locator('.deep-option input[type=checkbox]').first().check();
   await deepQuestion.locator('.deep-note > summary').click();
   await deepQuestion.locator('textarea').fill('توضیح معتبر از مشتری آزمایشی');
   assert((await deepSection.locator('summary.deep-summary').innerText()).includes('۱ از ۱۰'),'Deep-question progress missing');
   assert((await page.locator('#cq-answered').innerText()).includes('۱ از ۹۰'),'Total completion progress missing');
   await page.locator('#tiles .tile').nth(1).click();
   assert(await page.locator('#block1').isVisible(),'Selecting second tile did not open BMC block');
   assert(!(await page.locator('#block0').isVisible()),'Previous block still visible');
   await page.locator('#tiles .tile').first().click();
   assert(await page.locator('#block0').isVisible(),'Returning to first block failed');

   const risk=page.locator('#risk-assessment .ra-item').first();
   await risk.locator('input[type=checkbox]').check();
   assert(await risk.locator('.ra-details').isVisible(),'Checked risk details did not open');
   await risk.locator('select').nth(0).selectOption('زیاد');
   await risk.locator('select').nth(1).selectOption('متوسط');
   await risk.locator('textarea').first().fill('شاهد آزمایشی از مصاحبه والدین');
   await risk.locator('textarea').nth(1).fill('آزمون بازار با ۱۰ والد');
   const action=page.locator('#action-plan .ra-item').first();
   await action.locator('input[type=checkbox]').check();
   assert(await action.locator('.ra-details').isVisible(),'Checked action details did not open');
   await action.locator('input[type=text]').fill('مدیر محصول');
   await action.locator('select').selectOption('doing');
   await action.locator('textarea').fill('مصاحبه با حداقل ۱۰ خانواده');
   let report=await page.evaluate(()=>window.report());
   for(const textValue of ['ایده آزمایشی محصولات فرهنگی کودک','شاهد آزمایشی از مصاحبه والدین','آزمون بازار با ۱۰ والد','مدیر محصول','مصاحبه با حداقل ۱۰ خانواده'])
     assert(report.includes(textValue),'Export report omitted: '+textValue);
   assert(report.includes('توضیح معتبر از مشتری آزمایشی'),'Full exported report missing deep answer');
   assert(report.includes('پرسش‌های تکمیلی ۹ بخش بوم'),'Deep report section absent');
   await page.reload({waitUntil:'load'});
   assert(await page.locator('#risk-assessment .ra-item').first().locator('input[type=checkbox]').isChecked(),'Risk autosave failed');
   assert(await page.locator('#action-plan .ra-item').first().locator('input[type=checkbox]').isChecked(),'Action autosave failed');
   assert.equal(await page.locator('#idea').inputValue(),'ایده آزمایشی محصولات فرهنگی کودک','Existing idea autosave lost');
   assert(await page.locator('#blocks .deep-question').first().locator('.deep-option input[type=checkbox]').first().isChecked(),'Deep answer autosave failed');
   assert.equal(await page.locator('#blocks .deep-question').first().locator('textarea').inputValue(),'توضیح معتبر از مشتری آزمایشی','Deep note autosave lost');

   const downloadWait=page.waitForEvent('download',{timeout:10000});
   await page.locator('#download').click();
   const download=await downloadWait;
   const localFile=path.join(DIR,'child-culture-risk-action.txt');
   await download.saveAs(localFile);
   const downloaded=await fs.readFile(localFile,'utf8');
   assert(downloaded.includes('آزمون بازار با ۱۰ والد'),'Downloaded report missing risk mitigation');
   assert(downloaded.includes('توضیح معتبر از مشتری آزمایشی'),'Downloaded report missing deep discovery note');

   assert(downloaded.includes('مصاحبه با حداقل ۱۰ خانواده'),'Downloaded report missing action note');
   test('فرم اختصاصی کودک: ۹ بخش بوم، ریسک‌ها، برنامه اقدام، ذخیره و خروجی',true);
   await page.screenshot({path:path.join(DIR,'child-culture-risk-action.png'),fullPage:true});
 }catch(e){
   test('فرم اختصاصی کودک: ریسک و اقدام',false,e.stack||String(e));
   await page.screenshot({path:path.join(DIR,'child-culture-failure.png'),fullPage:true}).catch(()=>{});
 }finally{await context.close()}
}


{
 const ctx=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true,acceptDownloads:true});
 const pg=await ctx.newPage();pg.on('pageerror',e=>errors.push('specialized: '+e.message));
 for(const v of [{id:'parastoo',file:'parastoo-canvas.html',total:54},{id:'jewelry',file:'jewelry-canvas.html',total:45}]){
  try{
   const res=await pg.goto(ROOT+v.file,{waitUntil:'load'});
   assert(res?.ok(),v.id+' page failed to open');
   assert.equal(await pg.locator('#block-nav .sb-tile').count(),9,'Nine tiles missing');
   assert.equal(await pg.locator('.sb-question').count(),v.total,'Question count incorrect');
   assert.equal(await pg.locator('.sb-risk').count(),12,'Risk count incorrect');
   assert.equal(await pg.locator('.sb-action').count(),12,'Action count incorrect');
   await pg.locator('textarea[name=idea]').fill('Test idea '+v.id);
   await pg.locator('.sb-question').first().locator('input[type=checkbox]').first().check();
   const risk=pg.locator('.sb-risk').first();await risk.locator('input[type=checkbox]').check();
   await risk.locator('textarea').first().fill('Risk evidence '+v.id);
   const action=pg.locator('.sb-action').first();await action.locator('input[type=checkbox]').check();
   await action.locator('input[type=text]').fill('Owner '+v.id);
   const promise=pg.waitForEvent('download');
   await pg.locator('#download-text').click();
   const file=await promise;
   const filename=path.join(DIR,'intake-'+v.id+'.txt');await file.saveAs(filename);
   const output=await fs.readFile(filename,'utf8');
   for(const term of ['Test idea '+v.id,'Risk evidence '+v.id,'Owner '+v.id])assert(output.includes(term),'Missing export term '+term);
   await pg.reload({waitUntil:'load'});
   assert.equal(await pg.locator('textarea[name=idea]').inputValue(),'Test idea '+v.id,'Autosave missing');
   assert(await pg.locator('.sb-risk').first().locator('input[type=checkbox]').isChecked(),'Risk did not persist');
   assert(await pg.locator('.sb-action').first().locator('input[type=checkbox]').isChecked(),'Action did not persist');
   if(v.id==='jewelry')assert(await pg.evaluate(()=>!!localStorage.getItem('hb-specialized-bmc-v1-parastoo')),'Parastoo data lost after jewelry');
   test('Specialized '+v.id+' — nine blocks, questions, risks, actions, independent save, file export',true);
  }catch(e){test('Specialized '+v.id,false,e.stack||String(e));await pg.screenshot({path:path.join(DIR,'specialized-failure-'+v.id+'.png'),fullPage:true}).catch(()=>{});}
 }
 await ctx.close();
}

await browser.close();
await fs.writeFile(path.join(DIR,'results.json'),JSON.stringify({results,errors},null,2));
console.log('نتایج:',results.filter(x=>x.pass).length,'موفق،',results.filter(x=>!x.pass).length,'ناموفق،',errors.length,'خطای جاوااسکریپت');
if(results.some(x=>!x.pass)||errors.length)process.exitCode=1;
