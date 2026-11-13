/* Saba Naft | genuine Chromium / mobile and desktop journey QA. Synthetic cases only. */
"use strict";
const {chromium}=require("playwright"),http=require("node:http"),fs=require("node:fs"),path=require("node:path"),assert=require("node:assert/strict");
const ROOT=path.resolve(__dirname,".."),OUT=path.join(ROOT,"qa-artifacts","saba-guided");
fs.mkdirSync(OUT,{recursive:true});
const types={".html":"text/html; charset=utf-8",".js":"text/javascript; charset=utf-8",".css":"text/css; charset=utf-8",".svg":"image/svg+xml",".woff2":"font/woff2",".jpg":"image/jpeg",".webp":"image/webp",".png":"image/png",".webmanifest":"application/manifest+json"};
const server=http.createServer((req,res)=>{try{let p=decodeURIComponent(new URL(req.url,"http://localhost").pathname).replace(/^\/hasan-boudlaie\//,"/");if(p.endsWith("/"))p+="index.html";const full=path.resolve(ROOT,"."+p);if(!full.startsWith(ROOT+path.sep)){res.writeHead(403);res.end();return}fs.readFile(full,(err,data)=>{if(err){res.writeHead(404);res.end("Not found");return}res.writeHead(200,{"content-type":types[path.extname(full)]||"application/octet-stream","cache-control":"no-store"});res.end(data)})}catch(e){res.writeHead(500);res.end(String(e))}});
async function run(){await new Promise(ok=>server.listen(0,"127.0.0.1",ok));
 const origin="http://127.0.0.1:"+server.address().port+"/hasan-boudlaie/sabanaft/app/";
 const browser=await chromium.launch({headless:true,args:["--no-sandbox","--disable-dev-shm-usage"]});
 let checks=0;
 const check=(v,msg)=>{assert.ok(v,msg);checks++};
 try{
 for(const size of [{label:"mobile-390",width:390,height:844,mobile:true},{label:"desktop-1440",width:1440,height:900,mobile:false}]){
  const context=await browser.newContext({viewport:{width:size.width,height:size.height},isMobile:size.mobile,hasTouch:size.mobile,deviceScaleFactor:1});
  const page=await context.newPage(),errors=[];
  page.on("pageerror",err=>errors.push(err.message));
  page.on("dialog",dialog=>dialog.accept()); // Accept the learner-confirmed switch to free mode
  await page.goto(origin+"#/session/1",{waitUntil:"domcontentloaded"});
  const launch=page.locator("#launchJourney");
  await launch.waitFor();
  check(await launch.isVisible(),"native session journey launcher visible");
  await launch.click();
  await page.locator("#journeyView.active .lj-mode-grid").waitFor();
  check(page.url().includes("#/journey/1"),"journey is a native page route");
  check(await page.locator("#journeyView .lj-mode").count()===2,"competitive and free choices");
  await page.screenshot({path:path.join(OUT,size.label+"-modes.png"),fullPage:true});
  const cssFont=await page.locator("#journeyView .lj-mode p").first().evaluate(el=>parseFloat(getComputedStyle(el).fontSize));
  check(cssFont>=17,"readable learning mode font >=17px");
  await page.locator('#journeyView [data-action="startComp"]').click();
  await page.locator('#journeyView #lj-stage-form').waitFor();
  check(await page.locator('#journeyView #lj-clock').isVisible(),"sticky mission timer visible");
  check(await page.locator('#lj-float-guide').isVisible(),"float coach available");
  check(!await page.locator('.lj-final-analysis').count(),"review key withheld before completion");
  const bodySize=await page.locator("#journeyView").evaluate(el=>({root:el.scrollWidth,viewport:window.innerWidth,content:document.documentElement.scrollWidth}));
  check(bodySize.content<=bodySize.viewport+5,"no document horizontal clipping at "+size.label+": "+JSON.stringify(bodySize));
  await page.screenshot({path:path.join(OUT,size.label+"-stage.png"),fullPage:true});
  await page.locator("#lj-float-guide").click();
  await page.locator('[data-action="unlockGuide"]').click();
  check(await page.locator('.lj-guide-panel').innerText().then(s=>s.includes("پرسش کوچینگ")),"coaching insight visible");
  await page.locator('[data-action="closeGuide"]').click();
  await page.locator('textarea[name="text"]').fill("تعیین مرز اختیار انتشار گزارش و مسئول ارزیابی کیفیت و زمان‌بندی تصمیم.");
  await page.locator('#lj-stage-form button[type="submit"]').click();
  check(await page.locator(".lj-feedback").isVisible(),"per-stage feedback visible");
  check(!await page.locator(".lj-final-analysis").count(),"no mid-journey key");
  await page.locator('[data-action="continue"]').click();
  check(await page.locator('.lj-stage-head').innerText().then(s=>s.includes("مرحله ۲")),"logical stage progression");
  await page.reload({waitUntil:"domcontentloaded"});
  await page.locator("#journeyView.active .lj-stage-head").waitFor();
  check(await page.locator(".lj-stage-head").innerText().then(s=>s.includes("مرحله ۲")),"refresh preserves current stage");
  await page.screenshot({path:path.join(OUT,size.label+"-resume.png"),fullPage:true});
  await page.locator('#journeyView [data-action="studySwitch"]').click();
  await page.locator('.lj-study-nav').waitFor();
  check(await page.locator('.lj-study-nav button').count()===10,"10 independently navigable study stages");
  await page.locator('[data-action="studyStep"][data-step="8"]').click();
  check(await page.locator(".lj-stage-head").innerText().then(s=>s.includes("مرحله ۹")),"study allows free travel");
  await page.locator("#lj-float-guide").click();
  check(await page.locator(".lj-guide-panel").innerText().then(s=>s.includes("تکنیک اجرایی")),"free coach direct guidance");
  check(errors.length===0,"no browser JS uncaught errors: "+errors.join("; "));
  await context.close();
 }
 console.log("Saba Naft guided learning CHROMIUM QA passed:",checks,"mobile/desktop checks; screenshots saved");
 }finally{await browser.close();server.close()}}
run().catch(e=>{console.error(e);server.close();process.exitCode=1});
