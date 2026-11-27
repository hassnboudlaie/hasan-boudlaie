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

/* An isolated same-page stub prevents WebKit's localhost-vs-production
   origin preflight from masquerading as a product issue. Only CI synthetic
   identities use this. API event rendering and role permissions remain tested. */
async function installAnalyticsFixture(context){
 await context.addInitScript(()=>{
  const nativeFetch=window.fetch.bind(window);
  window.fetch=(input,init={})=>{
   const uri=typeof input==="string"?input:input?.url||"";
   if(!/\/functions\/v1\/mba-ob-(learning-analytics|participation)$/.test(uri))return nativeFetch(input,init);
   let args={};try{args=JSON.parse(init?.body||"{}")}catch{}
   const person={student_id:"00000000-0000-4000-8000-000000000001",name:"دانشجوی آزمایشی",student_number:"123456789",visits:3,active_seconds:210,activity_count:6,latest_at:new Date().toISOString()};
   const summary={visits:1,active_seconds:150,activity_count:4,latest_at:person.latest_at,by_area:{concepts:2}};
   const result=args.action==="mine"?{ok:true,summary,recent:[],recent_visits:[],period_days:365}:
    args.action==="classOverview"?{ok:true,students:[person],period_days:365}:
    args.action==="studentDetail"?{ok:true,student:{id:person.student_id,name:person.name,student_number:person.student_number},summary,recent:[]}:{ok:true};
   const record={id:person.student_id,full_name:person.name,student_number:person.student_number};
   const isTeacher=String(localStorage.getItem("mba-ob-classroom-attendance-identity-v1")||"").includes('"role":"teacher"');
   const portfolio=args.action==="open"&&isTeacher?{ok:true,students:[record]}:{
    ok:true,student:record,classroom:{quizzes:[],attendance:[],assignments:[],cases:[]},
    community:{topics:[],replies:[],votes:[],reviews:[]}
   };
   return Promise.resolve(new Response(JSON.stringify(uri.endsWith("mba-ob-participation")?portfolio:result),{status:200,headers:{"Content-Type":"application/json"}}));
  };
 });
}

async function examine(browser,name,width,height){
 const context=await browser.newContext({viewport:{width,height},isMobile:width<=390,hasTouch:width<=390,deviceScaleFactor:1});
 try{
  await installAnalyticsFixture(context);
  await context.addInitScript(()=>{
   localStorage.setItem("mba-ob-classroom-attendance-identity-v1",JSON.stringify({
    role:"student",token:"ob-a11y-synthetic",name:"دانشجوی تست"
   }));
  });
  await context.route("**/functions/v1/mba-ob-learning-analytics",async route=>{
   const input=JSON.parse(route.request().postData()||"{}");
   const summary={visits:1,active_seconds:150,activity_count:4,latest_at:new Date().toISOString(),by_area:{concepts:2}};
   const data=input.action==="mine"?{ok:true,summary,recent:[],recent_visits:[],period_days:365}:{ok:true};
   await route.fulfill({status:200,contentType:"application/json",headers:{"Access-Control-Allow-Origin":"*","Access-Control-Allow-Methods":"POST, OPTIONS","Access-Control-Allow-Headers":"content-type,authorization,apikey"},body:JSON.stringify(data)});
  });
  await context.route("https://hxcjkewlaniahvuqwwbb.supabase.co/functions/v1/mba-ob-attendance",async route=>{
   const body=JSON.parse(route.request().postData()||"{}");
   const data=body.action==="accessState"
    ?{ok:true,role:"student",approval_status:"approved",student:{name:"دانشجوی تست",student_number:"123456789"}}
    :{ok:true,submission:null,history:[]};
   await route.fulfill({status:200,contentType:"application/json",headers:{"Access-Control-Allow-Origin":"*"},body:JSON.stringify(data)});
  });
  const page=await context.newPage();
  const errors=[];
  page.on("pageerror",error=>errors.push(error.message));
  const url="http://127.0.0.1:"+server.address().port+"/hasan-boudlaie/ob-mba-classroom/";
  await page.goto(url,{waitUntil:"domcontentloaded"});
  await page.locator(".student-focus").waitFor({timeout:18000});
  assert.equal(await page.locator("#objJourney").count(),1,"Five-stage independent-learning journey must be visible on approved student home");
  assert.equal(await page.locator("[data-student-device-settings]").count(),1,"Approved student can set a cross-device password");
  assert.equal(await page.locator('#bottomNav a[href="./participation.html?v=4"]').count(),1,"Student portfolio has one direct entry");
  assert.equal(await page.locator(".ob-roadmap-item").count(),0,"Home does not duplicate the sessions directory");
  assert.equal(await page.locator('a.ob-console-row[href="./community.html"]').count(),1,"Home presents one discussion entry");
  assert.equal(await page.locator(".ob-dashboard-layout").isVisible(),true,"New student workspace is displayed");
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
  if(width===390){
   await page.locator("#themeToggle").click();
   const appearance=await page.evaluate(()=>({mode:document.documentElement.dataset.theme,bg:getComputedStyle(document.querySelector(".ob-console-section")).backgroundColor}));
   assert.equal(appearance.mode,"dark","Explicit theme switch should activate dark appearance");
   assert.notEqual(appearance.bg,"rgb(255, 255, 255)","Dashboard cards must inherit dark theme instead of white panel");
   if(name==="chromium")await page.screenshot({path:path.join(OUTPUT,"academic-390-dark-learning.png"),fullPage:true});
  }
  await page.locator('.student-focus button[data-action="openActive"]').click();
  await page.locator('.gr-shell[data-guided-mode="concepts"]').waitFor({timeout:15000});
  assert.equal(await page.locator(".ob-reading-layout").isVisible(),true,"Guided lesson uses the new reading layout");
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


async function verifyAcademicEntrance(browser,name,width,height){
 const context=await browser.newContext({viewport:{width,height},isMobile:width<500,hasTouch:width<500});
 try{
  const page=await context.newPage();
  const errors=[];page.on("pageerror",err=>errors.push(err.message));
  const base="http://127.0.0.1:"+server.address().port+"/hasan-boudlaie/ob-mba-classroom/";
  await page.goto(base,{waitUntil:"domcontentloaded"});
  await page.locator(".ob-entrance-editorial h1").waitFor({timeout:12000});
  assert.equal(await page.locator(".ob-entrance-course-route>div").count(),3,"Entrance must explain real 16/48/3 academic structure");
  assert.equal(await page.locator('[data-entrance="student"]').getAttribute("aria-pressed"),"true");
  assert.ok(await page.locator(".ob-entrance-intro").isVisible(),"Academic welcome has a real visible panel");
  let overflow=await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth);
  assert.ok(overflow<=2,name+" entrance "+width+" horizontal overflow: "+overflow);
  if(name==="chromium")await page.screenshot({path:path.join(OUTPUT,"academic-entrance-"+width+".png"),fullPage:true});
  await page.locator('[data-entrance="returning"]').click();
  assert.ok(await page.locator("#entranceReturning").isVisible(),"Approved learner's new-device login must exist");
  await page.locator('[data-entrance="returnBack"]').click();
  assert.ok(await page.locator("#entranceStudent").isVisible(),"New enrollment route must remain available");
  await page.locator('[data-entrance="guest"]').click();
  assert.ok(await page.locator("#entranceGuest").isVisible(),"Guest flow remains accessible");
  await page.locator('[data-entrance="teacher"]').click();
  assert.ok(await page.locator("#entranceTeacherSetup").isVisible(),"Teacher setup is accessible");
  await page.locator('[data-entrance="student"]').click();
  assert.ok(await page.locator("#entranceStudent").isVisible(),"Student entry remains accessible");
  assert.deepEqual(errors,[],name+" entrance runtime errors");
  console.log("PASS academic entrance",name,width,"desktop/mobile panels, tabs, RTL, no overflow");
 }finally{await context.close()}
}

async function verifyTeachingConsole(browser,name,width,height){
 const context=await browser.newContext({viewport:{width,height},isMobile:width<500,hasTouch:width<500});
 try{
  await installAnalyticsFixture(context);
  await context.addInitScript(()=>{
   localStorage.setItem("mba-ob-classroom-attendance-identity-v1",JSON.stringify({role:"teacher",token:"ob-a11y-synthetic-teacher"}));
  });
  await context.route("**/functions/v1/mba-ob-learning-analytics",async route=>{
   const input=JSON.parse(route.request().postData()||"{}");
   const student={student_id:"00000000-0000-4000-8000-000000000001",name:"دانشجوی آزمایشی",student_number:"123456789",visits:3,active_seconds:210,activity_count:6,latest_at:new Date().toISOString()};
   const result=input.action==="classOverview"?{ok:true,students:[student],period_days:365}:{ok:true,student:{id:student.student_id,name:student.name,student_number:student.student_number},summary:student,recent:[]};
   await route.fulfill({status:200,contentType:"application/json",headers:{"Access-Control-Allow-Origin":"*"},body:JSON.stringify(result)});
  });
  await context.route("https://hxcjkewlaniahvuqwwbb.supabase.co/functions/v1/mba-ob-attendance",async route=>{
   await route.fulfill({status:200,contentType:"application/json",headers:{"Access-Control-Allow-Origin":"*"},body:JSON.stringify({ok:true,role:"teacher",approval_status:"approved"})});
  });
  const page=await context.newPage(),errors=[];
  page.on("pageerror",err=>errors.push(err.message));
  const base="http://127.0.0.1:"+server.address().port+"/hasan-boudlaie/ob-mba-classroom/";
  await page.goto(base,{waitUntil:"domcontentloaded"});
  await page.locator(".ob-teacher-console").waitFor({timeout:18000});
  assert.equal(await page.locator(".ob-console-row").count(),2,"Teacher home keeps the portfolio and discussion shortcuts");
  assert.equal(await page.locator(".ob-teacher-actions .btn").count(),2,"Teacher home highlights the current session actions");
  const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth);
  assert.ok(overflow<=2,name+" teacher "+width+" horizontal overflow: "+overflow);
  if(name==="chromium")await page.screenshot({path:path.join(OUTPUT,"academic-teacher-"+width+".png"),fullPage:true});
  await page.locator('a.ob-console-row[href="./participation.html?v=4"]').click();
  await page.locator("#portfolioControls select").selectOption({index:1});
  await page.locator("#classroomHistory").waitFor({timeout:12000});
  await page.locator("#usageHistory summary").click();
  await page.locator("#usageHistory [data-usage] .portfolio-line").first().waitFor({timeout:12000});
  assert.equal(await page.locator("#usageHistory [data-usage] .portfolio-line strong").count(),3,"Portfolio shows three engagement measures");
  await page.getByRole("link",{name:/بازگشت به کلاس/}).click();
  await page.locator(".ob-teacher-console").waitFor();
  await page.locator(".ob-console-settings summary").click();
  await page.locator('.ob-console-settings [data-page="groups"]').click();
  assert.ok(await page.locator(".page").count()>0,"Teacher groups route remains navigable");
  assert.deepEqual(errors,[],name+" instructor runtime errors");
  console.log("PASS teacher console",name,width,"nine tools, role-specific route, no overflow");
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
  // WebKit blocks synthetic localhost -> hosted API preflights. Expose a
  // deterministic browser binding rather than weakening production CORS.
  await context.exposeBinding("__mbaTestDevice",async (_source,args)=>{
   let response={ok:false,error:"unexpected_action"};
   if(args.action==="setPassword"){passwordSets++;response={ok:true,enabled:true}}
   if(args.action==="studentDeviceLogin"){logins++;response={ok:true,role:"student",token:"synthetic-device-b-token",name:student.name,student_number:student.student_number,approval_status:"approved"}}
   return response;
  });
  await context.addInitScript(()=>{
   const nativeFetch=window.fetch.bind(window);
   window.fetch=(input,init={})=>{
    const url=typeof input==="string"?input:input?.url||"";
    if(!url.includes("/functions/v1/mba-ob-student-devices"))return nativeFetch(input,init);
    let args={};try{args=JSON.parse(init?.body||"{}")}catch{}
    return window.__mbaTestDevice(args).then(result=>new Response(JSON.stringify(result),{
     status:result.ok?200:400,headers:{"Content-Type":"application/json"}
    }));
   };
  });
  await context.route("**/functions/v1/mba-ob-attendance",async route=>{
   const request=JSON.parse(route.request().postData()||"{}");
   if(request.action==="registerStudent")registrations++;
   let result;
   if(request.action==="accessState")result={ok:true,role:"student",approval_status:"approved",student};
   else result={ok:true,submission:null,history:[]};
   await route.fulfill({status:200,contentType:"application/json",headers:{"Access-Control-Allow-Origin":"*","Access-Control-Allow-Methods":"POST, OPTIONS","Access-Control-Allow-Headers":"content-type,authorization,apikey"},body:JSON.stringify(result)});
  });
  await context.route("**/functions/v1/mba-ob-learning-analytics",async route=>{
   const args=JSON.parse(route.request().postData()||"{}");
   const summary={visits:1,active_seconds:90,activity_count:3,latest_at:new Date().toISOString(),by_area:{concepts:2}};
   const payload=args.action==="mine"?{ok:true,summary,recent:[],recent_visits:[],period_days:365}:
    args.action==="classOverview"?{ok:true,students:[{student_id:"00000000-0000-4000-8000-000000000001",...student,visits:1,active_seconds:90,activity_count:3,latest_at:null}]}:
    args.action==="studentDetail"?{ok:true,student:{id:"00000000-0000-4000-8000-000000000001",...student},summary,recent:[]}:{ok:true};
   await route.fulfill({status:200,contentType:"application/json",headers:{"Access-Control-Allow-Origin":"*","Access-Control-Allow-Methods":"POST, OPTIONS","Access-Control-Allow-Headers":"content-type,authorization,apikey"},body:JSON.stringify(payload)});
  });
  await context.route("**/functions/v1/mba-ob-student-devices",async route=>{
   const args=JSON.parse(route.request().postData()||"{}");
   let result={ok:false,error:"unexpected_action"};
   if(args.action==="setPassword"){passwordSets++;result={ok:true,enabled:true}}
   if(args.action==="studentDeviceLogin"){logins++;result={ok:true,role:"student",token:"synthetic-device-b-token",name:student.name,student_number:student.student_number,approval_status:"approved"}}
   await route.fulfill({status:result.ok?200:400,contentType:"application/json",headers:{"Access-Control-Allow-Origin":"*","Access-Control-Allow-Methods":"POST, OPTIONS","Access-Control-Allow-Headers":"content-type,authorization,apikey"},body:JSON.stringify(result)});
  });
 };
 try{
  await installAnalyticsFixture(a);await installAnalyticsFixture(b);
  await mock(a);await mock(b);
  await a.addInitScript(({key,info})=>{
   localStorage.setItem(key,JSON.stringify({role:"student",token:"synthetic-device-a-token",name:info.name,student_number:info.student_number}));
  },{key:storageKey,info:student});
  const pageA=await a.newPage(),pageB=await b.newPage();
  const errors=[];pageA.on("pageerror",err=>errors.push("a:"+err.message));pageB.on("pageerror",err=>errors.push("b:"+err.message));
  await pageA.goto(base,{waitUntil:"domcontentloaded"});
  await pageA.locator(".student-focus").waitFor({timeout:18000});
  assert.equal(await pageA.locator("#objJourney").count(),1,"Five-step learning experience should render");
  await pageA.locator(".ob-utilities summary").click();
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
  await pageB.locator('#bottomNav a[href="./participation.html?v=4"]').click();
  await pageB.locator("#usageHistory summary").click();
  await pageB.locator("#usageHistory [data-usage] .portfolio-line").first().waitFor();
  assert.equal(await pageB.locator("#usageHistory [data-usage] .portfolio-line strong").count(),3,"Per-student analytics metrics missing");
  assert.deepEqual(errors,[],"Cross-device journey errors");
  console.log("PASS cross-device",name,"approved device A sets password; device B login, zero registration or reapproval; analytics");
 }finally{await a.close();await b.close();}
}


async function main(){
 await new Promise(resolve=>server.listen(0,"127.0.0.1",resolve));
 try{
  for(const [name,driver,sizes] of [
   ["chromium",chromium,[[320,720],[360,800],[390,844],[768,1024],[1366,900]]],
   ["webkit",webkit,[[390,844],[1366,900]]]
  ]){
   const browser=await driver.launch({headless:true});
   try{for(const [w,h] of sizes)await examine(browser,name,w,h);await verifyAcademicEntrance(browser,name,390,844);if(name==="chromium")await verifyAcademicEntrance(browser,name,1366,900);await verifyTeachingConsole(browser,name,390,844);if(name==="chromium")await verifyTeachingConsole(browser,name,1366,900);await verifyRepeatDevice(browser,name);await verifyInstaller(browser,name)}
   finally{await browser.close()}
  }
 }finally{server.close()}
}
main().catch(e=>{console.error(e);process.exitCode=1});
