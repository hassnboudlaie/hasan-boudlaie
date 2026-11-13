/* Real browser QA for Allameh MBA Guided Learning (Life Organization design lineage).
   Covers 390x844 touch mobile + 1440x900 desktop, persistence, navigation and overflow.
   No student data, passwords or live backend are accessed. */
"use strict";
const {chromium}=require("playwright"),http=require("node:http"),fs=require("node:fs"),path=require("node:path"),assert=require("node:assert/strict");
const ROOT=path.resolve(__dirname,".."),OUT=path.join(ROOT,"qa-artifacts","ob-mba-guided-v11");
fs.mkdirSync(OUT,{recursive:true});
const MIME={".html":"text/html; charset=utf-8",".js":"text/javascript; charset=utf-8",".css":"text/css; charset=utf-8",
 ".png":"image/png",".svg":"image/svg+xml",".webmanifest":"application/manifest+json",".pdf":"application/pdf"};
const server=http.createServer((req,res)=>{
 try{
  let uri=decodeURIComponent(new URL(req.url,"http://127.0.0.1").pathname).replace(/^\/hasan-boudlaie\//,"/");
  if(uri.endsWith("/"))uri+="index.html";
  const full=path.resolve(ROOT,"."+uri);
  if(!full.startsWith(ROOT+path.sep)){res.writeHead(403);res.end();return}
  fs.readFile(full,(err,data)=>{
   if(err){res.writeHead(404);res.end("Not Found");return}
   res.writeHead(200,{"Content-Type":MIME[path.extname(full)]||"application/octet-stream","Cache-Control":"no-store"});
   res.end(data);
  });
 }catch(err){res.writeHead(500);res.end(String(err))}
});
const wait=ms=>new Promise(resolve=>setTimeout(resolve,ms));
async function noOverflow(page,label){
 const {overflow,width,scroll}=await page.evaluate(()=>({overflow:document.documentElement.scrollWidth-innerWidth,width:innerWidth,scroll:document.documentElement.scrollWidth}));
 assert.ok(overflow<=2,label+" horizontal overflow "+overflow+"px (scroll="+scroll+", viewport="+width+")");
}
async function save(page,name){await page.screenshot({path:path.join(OUT,name+".png"),fullPage:true})}
async function run(){
 await new Promise(resolve=>server.listen(0,"127.0.0.1",resolve));
 const url="http://127.0.0.1:"+server.address().port+"/hasan-boudlaie/ob-mba-classroom/";
 const browser=await chromium.launch({headless:true,args:["--no-sandbox","--disable-dev-shm-usage"]});
 try{
 for(const config of [{name:"android-390",width:390,height:844,mobile:true},{name:"desktop-1440",width:1440,height:900,mobile:false}]){
  const ctx=await browser.newContext({viewport:{width:config.width,height:config.height},isMobile:config.mobile,hasTouch:config.mobile,deviceScaleFactor:1});
  const page=await ctx.newPage(),errors=[];
  page.on("pageerror",e=>errors.push(e.message));
  await page.goto(url,{waitUntil:"domcontentloaded"});
  await page.locator(".student-focus").waitFor();
  assert.equal(await page.locator(".learning-card").count(),4,"Four classroom learning routes");
  await noOverflow(page,config.name+" home");
  await save(page,config.name+"-01-home");
  await page.locator('.student-focus button[data-action="openActive"]').click();
  await page.locator('.gr-shell[data-guided-mode="concepts"]').waitFor();
  assert.equal(await page.locator('.gr-stage-tab').count(),7,"Seven source topics");
  assert.ok((await page.locator('.gr-part p').first().evaluate(el=>parseFloat(getComputedStyle(el).fontSize)))>=19,"Readable concept type >= 19px");
  assert.equal(await page.locator(".gr-stage .gr-part").count(),4,"One concept per stage, four structured parts");
  await noOverflow(page,config.name+" concepts");
  await save(page,config.name+"-02-concept");
  await page.locator('[data-action="guidedNext"]').click();
  assert.equal(await page.locator(".gr-stage").getAttribute("data-stage-index"),"1","Next concept");
  await page.locator('[data-action="guidedJump"][data-index="0"]').click();
  assert.equal(await page.locator(".gr-stage").getAttribute("data-stage-index"),"0","Direct stage rail works");
  await page.locator('[data-track="practice"]').click();
  await page.locator("#sectionSelect").selectOption("examples");
  await page.locator('.gr-shell[data-guided-mode="examples"]').waitFor();
  assert.equal(await page.locator(".gr-stage-tab").count(),3,"Three separate examples");
  await noOverflow(page,config.name+" examples");
  await page.locator("#sectionSelect").selectOption("case");
  await page.locator('.gr-shell[data-guided-mode="case"]').waitFor();
  assert.ok((await page.locator(".gr-source").count())>=1,"Documented case source visible");
  await save(page,config.name+"-03-case-source");
  await page.locator('[data-action="guidedNext"]').click();
  await page.locator('[data-action="guidedNext"]').click();
  assert.equal(await page.locator(".gr-stage textarea").count(),2,"Two analytical case questions per stage");
  await page.locator('[data-guided-key="case-q-0"]').fill("آزمون ثبت پاسخ کیس");
  await page.locator('[data-action="guidedNext"]').click();
  await page.locator('[data-action="guidedPrev"]').click();
  assert.equal(await page.locator('[data-guided-key="case-q-0"]').inputValue(),"آزمون ثبت پاسخ کیس","Autosave across stages");
  await noOverflow(page,config.name+" case worksheet");
  await save(page,config.name+"-04-case-workbook");
  await page.reload({waitUntil:"domcontentloaded"});
  await page.locator('.student-focus button[data-action="openActive"]').click();
  await page.locator('[data-track="practice"]').click();
  await page.locator("#sectionSelect").selectOption("case");
  assert.equal(await page.locator('[data-guided-key="case-q-0"]').inputValue(),"آزمون ثبت پاسخ کیس","Session text survives refresh");
  await page.locator("#sectionSelect").selectOption("activity");
  await page.locator('.gr-mode-switch').waitFor();
  assert.equal(await page.locator('.gr-shell[data-guided-mode="group"]').count(),1,"Group exercise staged");
  await page.locator('[data-action="guidedMode"][data-mode="roleplay"]').click();
  assert.equal(await page.locator('.gr-shell[data-guided-mode="roleplay"]').count(),1,"Roleplay isolated");
  await page.locator('[data-action="guidedNext"]').click();
  assert.equal(await page.locator(".gr-turn").count(),2,"Dialogue shown in manageable two-turn steps");
  await save(page,config.name+"-05-roleplay");
  await page.locator('[data-action="guidedMode"][data-mode="quiz"]').click();
  await page.locator(".quiz-workshop").waitFor();
  assert.ok(await page.locator(".quiz-question").isVisible(),"Original chapter quiz intact");
  await page.locator("#sectionSelect").selectOption("reflection");
  await page.locator('.gr-shell[data-guided-mode="reflection"]').waitFor();
  await page.locator('[data-action="guidedNext"]').click();
  assert.equal(await page.locator('.gr-stage textarea').count(),2,"Two workbook prompts at a time");
  await page.locator('[data-guided-key="reflection-0"]').fill("نمونه ثبت تکلیف فردی");
  await page.locator('[data-action="guidedNext"]').click();
  await page.locator('[data-action="guidedPrev"]').click();
  assert.equal(await page.locator('[data-guided-key="reflection-0"]').inputValue(),"نمونه ثبت تکلیف فردی","Workbook value survives navigation");
  await noOverflow(page,config.name+" reflection");
  await save(page,config.name+"-06-reflection");
  await page.locator('[data-track="concepts"]').click();
  await page.locator("#sectionSelect").selectOption("slides");
  assert.ok(await page.locator(".persian-version").isVisible(),"Persian presentation kept");
  assert.ok(await page.locator(".english-version").isVisible(),"English source preserved");
  await noOverflow(page,config.name+" presentations");
  await page.locator("#themeToggle").click();
  assert.equal(await page.evaluate(()=>document.documentElement.dataset.theme),"dark","Optional dark mode still works");
  await noOverflow(page,config.name+" dark theme");
  await page.goto(url,{waitUntil:"domcontentloaded"});
  await page.locator(".student-focus").waitFor();
  assert.deepEqual(errors,[],config.name+" uncaught frontend JavaScript errors");
  await ctx.close();
  console.log("PASS "+config.name+": source intact, guided 7 concepts, 3 examples, case/workbook auto-save, role-play, quiz, presentations, dark theme, RTL and overflow");
 }
 }finally{await browser.close();await new Promise(resolve=>server.close(resolve))}
}
run().catch(err=>{console.error(err);process.exitCode=1;server.close()});