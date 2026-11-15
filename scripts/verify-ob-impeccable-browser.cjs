/* Impeccable release checks: synthetic enrolled student; no live personal data.
 * Chromium and WebKit, 360/390/768/1366, font loading, RTL, overflow, axe.
 */
"use strict";
const {chromium,webkit}=require("playwright");
const AxeBuilder=require("@axe-core/playwright").default;
const fs=require("node:fs"),path=require("node:path"),http=require("node:http"),assert=require("node:assert/strict");
const ROOT=path.resolve(__dirname,"..");
const OUTPUT=path.join(ROOT,"qa-artifacts","ob-impeccable");
fs.mkdirSync(OUTPUT,{recursive:true});
const mime={".html":"text/html; charset=utf-8",".js":"text/javascript; charset=utf-8",
 ".css":"text/css; charset=utf-8",".woff2":"font/woff2",".svg":"image/svg+xml",".png":"image/png",
 ".webmanifest":"application/manifest+json"};
const server=http.createServer((req,res)=>{
 try{
  let name=decodeURIComponent(new URL(req.url,"http://127.0.0.1").pathname).replace(/^\/hasan-boudlaie\//,"/");
  if(name.endsWith("/"))name+="index.html";
  const target=path.resolve(ROOT,"."+name);
  if(!target.startsWith(ROOT+path.sep)){res.writeHead(403);res.end();return}
  fs.readFile(target,(err,data)=>{
   if(err){res.writeHead(404);res.end("Not found");return}
   res.writeHead(200,{"Content-Type":mime[path.extname(target)]||"application/octet-stream","Cache-Control":"no-store"});
   res.end(data);
  });
 }catch(e){res.writeHead(500);res.end(String(e))}
});
async function examine(browser,name,width,height){
 const context=await browser.newContext({viewport:{width,height},isMobile:width<=390,hasTouch:width<=390,deviceScaleFactor:1});
 try{
  await context.addInitScript(()=>{
   localStorage.setItem("mba-ob-classroom-attendance-identity-v1",JSON.stringify({
    role:"student",token:"ob-a11y-synthetic",name:"دانشجوی تست"
   }));
  });
  await context.route("https://hxcjkewlaniahvuqwwbb.supabase.co/functions/v1/mba-ob-attendance",async route=>{
   const body=JSON.parse(route.request().postData()||"{}");
   const data=body.action==="accessState"
    ?{ok:true,role:"student",approval_status:"approved",student:{name:"دانشجوی تست",student_number:"123456789"}}
    :{ok:true,submission:null,history:[]};
   await route.fulfill({status:200,contentType:"application/json",headers:{"Access-Control-Allow-Origin":"*"},body:JSON.stringify(data)});
  });
  // Keep privacy-sensitive analytics deterministic in synthetic enrolled users:
  // WebKit treats unmocked third-party CORS failures as page errors.
  await context.route("**/functions/v1/mba-ob-learning-analytics",async route=>{
   const input=JSON.parse(route.request().postData()||"{}");
   const empty={visits:1,active_seconds:120,activity_count:2,latest_at:new Date().toISOString(),by_area:{home:1}};
   const data=input.action==="mine"?{ok:true,summary:empty,recent:[],recent_visits:[],period_days:365}:{ok:true};
   await route.fulfill({status:200,contentType:"application/json",headers:{"Access-Control-Allow-Origin":"*"},body:JSON.stringify(data)});
  });
  const page=await context.newPage();
  const errors=[];
  page.on("pageerror",error=>errors.push(error.message));
  const url="http://127.0.0.1:"+server.address().port+"/hasan-boudlaie/ob-mba-classroom/";
  await page.goto(url,{waitUntil:"domcontentloaded"});
  await page.locator(".student-focus").waitFor({timeout:18000});
  const metrics=await page.evaluate(async()=>{
   await document.fonts.load('400 20px "Vazirmatn"');
   return {font:getComputedStyle(document.body).fontFamily,
    loaded:document.fonts.check('400 20px "Vazirmatn"'),
    overflow:document.documentElement.scrollWidth-innerWidth,
    lang:document.documentElement.lang,dir:document.documentElement.dir};
  });
  assert.ok(metrics.loaded,name+" "+width+" local Vazirmatn font failed to load");
  assert.match(metrics.font,/Vazirmatn/,name+" "+width+" applied font");
  assert.equal(metrics.dir,"rtl");
  assert.equal(metrics.lang,"fa");
  assert.ok(metrics.overflow<=2,name+" "+width+" home overflow: "+metrics.overflow);
  if(width===360||width===1366)await page.screenshot({path:path.join(OUTPUT,name+"-"+width+"-home.png"),fullPage:true});
  await page.locator('.student-focus button[data-action="openActive"]').click();
  await page.locator('.gr-shell[data-guided-mode="concepts"]').waitFor({timeout:15000});
  const active=await page.evaluate(()=>document.activeElement?.id);
  assert.equal(active,"main",name+" "+width+" should focus main after SPA route");
  const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth);
  assert.ok(overflow<=2,name+" "+width+" learning overflow: "+overflow);
  const result=await new AxeBuilder({page})
   .withTags(["wcag2a","wcag2aa","wcag21a","wcag21aa","wcag22aa"]).analyze();
  const high=result.violations.filter(v=>["serious","critical"].includes(v.impact));
  if(high.length){
   const detail=high.slice(0,8).map(v=>v.id+" "+v.impact+": "+
     v.nodes.slice(0,2).map(n=>n.target.join(" ")).join(", ")).join("\n");
   throw Error(name+" "+width+" axe serious/critical violations:\n"+detail);
  }
  if(width===390)await page.screenshot({path:path.join(OUTPUT,name+"-"+width+"-concept.png"),fullPage:true});
  assert.deepEqual(errors,[],name+" "+width+" JS runtime errors");
  console.log("PASS",name,width,"Vazirmatn, focus, RTL, no overflow, axe high-severity=0");
 }finally{await context.close()}
}

async function verifyInstaller(browser,name){
 const context=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true});
 try{
  const page=await context.newPage(),errors=[];
  page.on("pageerror",e=>errors.push(e.message));
  const base="http://127.0.0.1:"+server.address().port+"/hasan-boudlaie/ob-mba-classroom/";
  await page.goto(base,{waitUntil:"domcontentloaded"});
  const entrance=page.locator("#entryGate .entrance-install-link");
  await entrance.waitFor({timeout:12000});
  assert.equal(await entrance.isVisible(),true,"Install must be reachable before teacher/student login");
  assert.equal(await entrance.getAttribute("href"),"./install.html");
  await entrance.click();
  await page.waitForURL(/\/install\.html/);
  assert.equal(await page.locator("#installAction").isVisible(),true,"Mobile install action missing");
  assert.equal(await page.locator(".open-app").getAttribute("href"),"./");
  const manifest=await page.evaluate(async()=>{
   const href=document.querySelector('link[rel="manifest"]')?.href;
   if(!href)return null;
   const response=await fetch(href);
   if(!response.ok)return null;
   return response.json();
  });
  assert.ok(manifest,"Install page must expose a reachable manifest");
  assert.equal(manifest.display,"standalone");
  assert.equal(manifest.start_url,"./");
  assert.equal(manifest.scope,"./");
  assert.ok(manifest.icons.some(i=>i.sizes==="192x192"));
  assert.ok(manifest.icons.some(i=>i.sizes==="512x512"));
  await page.locator("#instructions summary").click();
  assert.equal(await page.locator("#instructions").evaluate(e=>e.open),true,"Android and iPhone install steps must expand");
  assert.match(await page.locator("#instructions").textContent(),/Chrome/);
  assert.match(await page.locator("#instructions").textContent(),/Samsung Internet/);
  await page.locator("#copyLink").click();
  await page.locator("#installStatus:visible").waitFor({timeout:5000});
  assert.ok((await page.locator("#installStatus").textContent()).length>2,"Copy feedback must be announced");
  const measurements=await page.evaluate(()=>({overflow:document.documentElement.scrollWidth-innerWidth,dir:document.documentElement.dir}));
  assert.equal(measurements.dir,"rtl");
  assert.ok(measurements.overflow<=2,"Install page horizontal overflow "+measurements.overflow);
  const axe=await new AxeBuilder({page}).withTags(["wcag2a","wcag2aa","wcag21aa","wcag22aa"]).analyze();
  const serious=axe.violations.filter(v=>["serious","critical"].includes(v.impact));
  if(serious.length)throw Error("Install page accessibility "+JSON.stringify(serious.map(v=>({id:v.id,targets:v.nodes.slice(0,3).map(n=>n.target)}))));
  if(name==="chromium")await page.screenshot({path:path.join(OUTPUT,"allameh-390-install.png"),fullPage:true});
  assert.deepEqual(errors,[],"Install journey runtime errors");
  console.log("PASS installer",name,"login CTA, manifest, device instructions, copy, RTL, axe serious/critical=0");
 }finally{await context.close()}
}


async function verifyRepeatDevice(browser,name){
 // Two genuinely independent browser storage contexts. Neither ever calls
 // registerStudent or requires an instructor approval for device B.
 const base="http://127.0.0.1:"+server.address().port+"/hasan-boudlaie/ob-mba-classroom/";
 const storageKey="mba-ob-classroom-attendance-identity-v1";
 const student={name:"دانشجوی آزمایشی",student_number:"123456789"};
 const a=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true});
 const b=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true});
 let registrations=0,logins=0,passwordSets=0;
 const mock=async(context)=>{
  await context.route("**/functions/v1/mba-ob-attendance",async route=>{
   const request=JSON.parse(route.request().postData()||"{}");
   if(request.action==="registerStudent")registrations++;
   let result;
   if(request.action==="accessState")result={ok:true,role:"student",approval_status:"approved",student};
   else result={ok:true,submission:null,history:[]};
   await route.fulfill({status:200,contentType:"application/json",headers:{"Access-Control-Allow-Origin":"*"},body:JSON.stringify(result)});
  });
  await context.route("**/functions/v1/mba-ob-learning-analytics",async route=>{
   const args=JSON.parse(route.request().postData()||"{}");
   const summary={visits:1,active_seconds:90,activity_count:3,latest_at:new Date().toISOString(),by_area:{concepts:2}};
   const payload=args.action==="mine"?{ok:true,summary,recent:[],recent_visits:[],period_days:365}:
    args.action==="classOverview"?{ok:true,students:[{student_id:"00000000-0000-4000-8000-000000000001",...student,visits:1,active_seconds:90,activity_count:3,latest_at:null}]}:
    args.action==="studentDetail"?{ok:true,student:{id:"00000000-0000-4000-8000-000000000001",...student},summary,recent:[]}:{ok:true};
   await route.fulfill({status:200,contentType:"application/json",headers:{"Access-Control-Allow-Origin":"*"},body:JSON.stringify(payload)});
  });
  await context.route("**/functions/v1/mba-ob-student-devices",async route=>{
   const args=JSON.parse(route.request().postData()||"{}");
   let result={ok:false,error:"unexpected_action"};
   if(args.action==="setPassword"){passwordSets++;result={ok:true,enabled:true}}
   if(args.action==="studentDeviceLogin"){logins++;result={ok:true,role:"student",token:"synthetic-device-b-token",name:student.name,student_number:student.student_number,approval_status:"approved"}}
   await route.fulfill({status:result.ok?200:400,contentType:"application/json",headers:{"Access-Control-Allow-Origin":"*"},body:JSON.stringify(result)});
  });
 };
 try{
  await mock(a);await mock(b);
  await a.addInitScript(({key,info})=>{
   localStorage.setItem(key,JSON.stringify({role:"student",token:"synthetic-device-a-token",name:info.name,student_number:info.student_number}));
  },{key:storageKey,info:student});
  const pageA=await a.newPage(),pageB=await b.newPage();
  const errors=[];pageA.on("pageerror",err=>errors.push("a:"+err.message));pageB.on("pageerror",err=>errors.push("b:"+err.message));
  await pageA.goto(base,{waitUntil:"domcontentloaded"});
  await pageA.locator(".student-focus").waitFor({timeout:18000});
  assert.equal(await pageA.locator("#objJourney").count(),1,"Five-step learning experience should render");
  await pageA.locator('[data-student-device-settings]').first().click();
  await pageA.locator('#obDeviceDialog[open]').waitFor();
  await pageA.locator("#obDevicePassword").fill("LearnerPersonal12345");
  await pageA.locator("#obDeviceConfirm").fill("LearnerPersonal12345");
  await pageA.locator("#obDeviceForm button[type=submit]").click();
  await pageA.locator("#obDeviceStatus").getByText(/رمز شخصی ثبت شد/).waitFor({timeout:10000});
  assert.equal(passwordSets,1,"Existing approved device must set password exactly once");
  assert.equal((await pageA.evaluate(()=>localStorage.getItem("mba-ob-classroom-attendance-identity-v1"))).includes("LearnerPersonal12345"),false,"Password must never be written to localStorage");
  await pageB.goto(base,{waitUntil:"domcontentloaded"});
  await pageB.locator('#entryGate [data-entrance="returning"]').click();
  await pageB.locator("#entranceReturning").waitFor();
  await pageB.locator("#returningNumber").fill(student.student_number);
  await pageB.locator("#returningPassword").fill("LearnerPersonal12345");
  await pageB.locator("#entranceReturning button[type=submit]").click();
  await pageB.locator(".student-focus").waitFor({timeout:18000});
  assert.equal(logins,1,"New device should exchange password for a new student session");
  assert.equal(registrations,0,"No re-registration, device review or instructor approval allowed");
  const idA=await pageA.evaluate(()=>window.OB_ACCESS.student_number);
  const idB=await pageB.evaluate(()=>window.OB_ACCESS.student_number);
  assert.equal(idA,idB,"Both devices should have the same student identity");
  await pageB.locator('#bottomNav [data-action="navigate"][data-page="results"]').click();
  await pageB.locator("[data-oba-student]").waitFor();
  assert.equal(await pageB.locator(".oba-metric").count(),3,"Per-student analytics metrics missing");
  assert.deepEqual(errors,[],"Cross-device journey errors");
  console.log("PASS cross-device",name,"approved device A sets password; device B login, zero registration or reapproval; analytics");
 }finally{await a.close();await b.close();}
}

async function main(){
 await new Promise(resolve=>server.listen(0,"127.0.0.1",resolve));
 try{
  for(const [name,driver,sizes] of [
   ["chromium",chromium,[[360,800],[390,844],[768,1024],[1366,900]]],
   ["webkit",webkit,[[390,844],[1366,900]]]
  ]){
   const browser=await driver.launch({headless:true});
   try{for(const [w,h] of sizes)await examine(browser,name,w,h);await verifyInstaller(browser,name);await verifyRepeatDevice(browser,name)}
   finally{await browser.close()}
  }
 }finally{server.close()}
}
main().catch(e=>{console.error(e);process.exitCode=1});
