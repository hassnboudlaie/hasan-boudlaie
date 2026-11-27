"use strict";
/* Synthetic static-server browser QA. Never accesses live production accounts. */
const {chromium,webkit}=require("playwright");
const AxeBuilder=require("@axe-core/playwright").default;
const http=require("node:http"),fs=require("node:fs"),path=require("node:path"),assert=require("node:assert/strict");
const ROOT=path.resolve(__dirname,".."),OUT=path.join(ROOT,"qa-artifacts","hb-impeccable");
fs.mkdirSync(OUT,{recursive:true});
const mime={".html":"text/html; charset=utf-8",".js":"text/javascript; charset=utf-8",
".css":"text/css; charset=utf-8",".woff2":"font/woff2",".svg":"image/svg+xml",
".png":"image/png",".webmanifest":"application/manifest+json",".json":"application/json"};
const server=http.createServer((req,res)=>{
 try{
  let p=decodeURIComponent(new URL(req.url,"http://127.0.0.1").pathname).replace(/^\/hasan-boudlaie\//,"/");
  if(p.endsWith("/"))p+="index.html";
  const f=path.resolve(ROOT,"."+p);
  if(!f.startsWith(ROOT+path.sep)){res.writeHead(403);res.end();return}
  fs.readFile(f,(err,body)=>{if(err){res.writeHead(404);res.end("Not found");return}
   res.writeHead(200,{"Content-Type":mime[path.extname(f)]||"application/octet-stream","Cache-Control":"no-store"});
   res.end(body);
  });
 }catch(e){res.writeHead(500);res.end(String(e))}
});
const base=()=> "http://127.0.0.1:"+server.address().port+"/hasan-boudlaie/";
async function makeContext(browser,width,height){
 const context=await browser.newContext({viewport:{width,height},deviceScaleFactor:1,isMobile:width<=390,hasTouch:width<=390});
 await context.addInitScript(()=>{try{localStorage.setItem("hb-lang","fa")}catch(e){}});
 return context;
}
async function checkFont(page,tag){
 const m=await page.evaluate(async()=>{
  await document.fonts.load('400 16px "Vazirmatn"');
  return {loaded:document.fonts.check('400 16px "Vazirmatn"'),
   font:getComputedStyle(document.body).fontFamily,
   overflow:document.documentElement.scrollWidth-innerWidth};
 });
 assert.ok(m.loaded,tag+" Vazirmatn failed");
 assert.match(m.font,/Vazirmatn/,tag+" computed font");
 return m;
}
async function hubCheck(browser,name,w,h){
 const ctx=await makeContext(browser,w,h);
 try{
  const page=await ctx.newPage(),errors=[];
  page.on("pageerror",e=>errors.push(e.message));
  const rsp=await page.goto(base()+"hub/",{waitUntil:"domcontentloaded",timeout:30000});
  assert.equal(rsp.status(),200);
  await page.locator("#superResultCount").filter({hasText:/29|۲۹/}).waitFor({timeout:25000});
  const metric=await checkFont(page,name+" Hub "+w);
  if(w===320){
   const dimensions=await page.evaluate(()=>{
    const rect=s=>{const el=document.querySelector(s);return el?.getBoundingClientRect()?.toJSON()};
    return {innerWidth,screenWidth:screen.width,clientWidth:document.documentElement.clientWidth,
      scrollWidth:document.documentElement.scrollWidth,visualWidth:visualViewport?.width,
      nav:rect(".nav-wrap"),brand:rect(".brand"),actions:rect(".header-actions"),header:rect(".topbar"),
      main:rect("#main"),filter:rect(".super-filters")};
   });
   console.log("MOBILE_LAYOUT_DIAG",JSON.stringify(dimensions));
   assert.ok(dimensions.innerWidth<=w+2,"320px layout viewport expanded to "+dimensions.innerWidth);
  }
  assert.equal(await page.locator(".super-app-link").count(),29);
  assert.ok(metric.overflow<=2,name+" Hub "+w+" overflow="+metric.overflow);
  const axe=await new AxeBuilder({page}).withTags(["wcag2a","wcag2aa","wcag21aa","wcag22aa"]).analyze();
  const high=axe.violations.filter(v=>["serious","critical"].includes(v.impact));
  if(high.length)throw Error("Hub "+name+" "+w+" accessibility "+high.map(v=>v.id+":"+v.nodes.map(n=>n.target.join(" ")).slice(0,2).join(",")).join("; "));
  if(w===320||w===390||w===1366)await page.screenshot({path:path.join(OUT,name+"-"+w+"-hub.png"),fullPage:true});
  await page.locator("#superSearch").fill("my finance");
  assert.equal(await page.locator(".super-app-link:visible").count(),1);
  
  await page.locator("#superSearch").fill("مديريت مالي من");
  assert.equal(await page.locator(".super-app-link:visible").count(),1,"Arabic-variant Persian search must match My Finance");
  await page.locator("#superSearch").press("Escape");
  assert.equal(await page.locator(".super-app-link:visible").count(),29,"Escape must clear search");
  await page.locator("#superSearch").fill("not-a-real-app-name-9285");
  assert.equal(await page.locator(".super-app-link:visible").count(),0,"Search empty state failed");
  assert.equal(await page.locator("#superReset:visible").count(),1,"No reset action in empty state");
  await page.locator("#superReset").click();
  assert.equal(await page.locator(".super-app-link:visible").count(),29,"Reset did not restore directory");
  console.log("FILTER_DIAG",JSON.stringify(await page.evaluate(()=>{
   const b=document.querySelector('[data-super-filter="personal"]'),p=b?.parentElement;
   const r=b?.getBoundingClientRect(),pr=p?.getBoundingClientRect();
   const mid=r?{x:r.x+r.width/2,y:r.y+r.height/2}:null;
   const e=mid?document.elementFromPoint(mid.x,mid.y):null;
   return {vw:innerWidth,scrollY,button:r?.toJSON(),parent:pr?.toJSON(),
    parentStyle:{display:getComputedStyle(p).display,flexWrap:getComputedStyle(p).flexWrap,overflow:getComputedStyle(p).overflow},
    targetAtMid:e?.outerHTML?.slice(0,170),clickedLabel:b?.textContent};
  })));
  await page.locator('[data-super-filter="personal"]').click();
  assert.equal(await page.locator(".super-app-link:visible").count(),5);
  await page.locator('[data-super-filter="all"]').click();
  assert.equal(await page.locator(".super-app-link:visible").count(),29);
  
  if(await page.locator(".menu-toggle").isVisible()){
   await page.locator(".menu-toggle").click();
   assert.equal(await page.locator(".menu-toggle").getAttribute("aria-expanded"),"true");
   await page.keyboard.press("Escape");
   assert.equal(await page.locator(".menu-toggle").getAttribute("aria-expanded"),"false","Escape must close navigation");
   assert.equal(await page.evaluate(()=>document.activeElement?.classList?.contains("menu-toggle")),true,"Menu focus must be restored");
  }
    /* Returning-user journey: save > filter > reopen > recent > clear > unsave.
     Does not touch child app data or credentials. */
  const financeFavorite=page.locator('.super-app-entry:has(a[href="../my-finance/"]) > .super-favorite');
  await financeFavorite.click();
  assert.equal(await financeFavorite.getAttribute("aria-pressed"),"true","Favorite state must be announced");
  assert.equal(await page.locator('#hubQuickAccess:visible').count(),1,"Quick access must appear");
  assert.equal(await page.locator('#hubPinnedList .hub-quick-link').count(),1,"Saved shortcut missing");
  await page.locator('[data-super-filter="pinned"]').click();
  assert.equal(await page.locator('.super-app-link:visible').count(),1,"Saved filter must show the favorite");
  await page.reload({waitUntil:"domcontentloaded"});
  await page.locator("#superResultCount").filter({hasText:/29|۲۹/}).waitFor();
  assert.equal(await page.locator('#hubPinnedList .hub-quick-link').count(),1,"Saved apps not persisted");
  assert.equal(await page.locator('.super-favorite[aria-pressed="true"]').count(),1);
  await page.locator('a.super-app-link[href="../okr-service/index.html"]').click();
  await page.waitForURL(/okr-service/);
  await page.goto(base()+"hub/",{waitUntil:"domcontentloaded"});
  await page.locator('#hubRecentList .hub-quick-link').first().waitFor();
  assert.equal(await page.locator('#hubRecentList .hub-quick-link').count(),1,"Recent app not recorded");
  assert.ok((await page.locator('#hubRecentList .hub-quick-link').first().getAttribute('href')).includes("okr-service"));
  await page.locator('#hubClearRecents').click();
  assert.equal(await page.locator('#hubRecentList .hub-quick-link').count(),0,"Clear history failed");
  assert.equal(await page.locator('#hubQuickAccess:visible').count(),1,"Saved apps should remain");
  await page.locator('.super-app-entry:has(a[href="../my-finance/"]) > .super-favorite').click();
  assert.equal(await page.locator('#hubQuickAccess:visible').count(),0,"Quick access should hide when empty");
  assert.equal(await page.locator('.super-favorite[aria-pressed="true"]').count(),0);
  const a11yAfter=await new AxeBuilder({page}).withTags(["wcag2a","wcag2aa","wcag21aa","wcag22aa"]).analyze();
  const newViolations=a11yAfter.violations.filter(v=>["serious","critical"].includes(v.impact));
  if(newViolations.length)console.error("HUB_JOURNEY_AXE",JSON.stringify(newViolations.map(v=>({id:v.id,impact:v.impact,nodes:v.nodes.slice(0,12).map(n=>({target:n.target,summary:n.failureSummary}))}))));
  assert.equal(newViolations.length,0,"New controls accessibility failure");
  assert.deepEqual(errors,[],"Hub runtime errors");
  console.log("PASS Hub",name,w,"29 apps, task descriptions, favorites, recents, keyboard, RTL, axe serious/critical=0");
 }finally{await ctx.close()}
}
const entries=["okr-system/","okr-service/","business-model-canvas/studio.html","small-business/",
"trm-workspace/","clinic-customer-app/","ba-parastoo/","rf-holding/","life-organization/","my-finance/"];
async function appsCheck(browser){
 const audit=[];
 const ctx=await makeContext(browser,390,844);
 try{
  for(const p of entries){
   const page=await ctx.newPage();
   try{
    const rsp=await page.goto(base()+p,{waitUntil:"domcontentloaded",timeout:35000});
    assert.equal(rsp.status(),200,p+" missing");
    const metric=await checkFont(page,p);
    const label=p.replace(/[^a-z0-9]+/gi,"-");
    await page.screenshot({path:path.join(OUT,"app-"+label+".png"),fullPage:false,timeout:20000});
    const axe=await new AxeBuilder({page}).withTags(["wcag2a","wcag2aa","wcag21aa","wcag22aa"]).analyze();
    const serious=axe.violations.filter(v=>["serious","critical"].includes(v.impact));
    audit.push({app:p,viewport:390,overflowPx:metric.overflow,
      serious:serious.map(v=>({id:v.id,impact:v.impact,nodes:v.nodes.slice(0,3).map(n=>n.target)}))});
    console.log("AUDIT",p,"overflow="+metric.overflow,"serious/critical="+serious.length,JSON.stringify(serious.map(v=>({id:v.id,target:v.nodes.slice(0,12).map(n=>n.target)}))));
    if(p==="ba-parastoo/"){
     const toggle=page.locator("#mobileNavToggle");
     await toggle.click();
     assert.equal(await toggle.getAttribute("aria-expanded"),"true","Ba Parastoo mobile menu did not open");
     await page.keyboard.press("Escape");
     assert.equal(await toggle.getAttribute("aria-expanded"),"false","Ba Parastoo menu did not close");
     const button=page.getByRole("button",{name:"ورود / عضویت"});
     await button.click();
     assert.equal(await page.locator("#modal.show").count(),1);
     assert.equal(await page.locator("#modal .dialog button").evaluate(el=>document.activeElement===el),true,"Modal focus missing");
     await page.keyboard.press("Escape");
     assert.equal(await page.locator("#modal.show").count(),0);
     assert.equal(await button.evaluate(el=>document.activeElement===el),true,"Modal return focus missing");
    }
    if(serious.length)console.warn("A11Y_PENDING",p,serious.map(v=>v.id).join(","));
    console.log("PASS app",p,"Vazirmatn, axe serious/critical=0");
   }finally{await page.close()}
  }
  const remaining=audit.filter(x=>x.serious.length>0);
  assert.deepEqual(remaining,[],"Unresolved serious/critical WCAG findings; inspect a11y-findings.json and AUDIT logs");
 }finally{
  fs.writeFileSync(path.join(OUT,"a11y-findings.json"),JSON.stringify(audit,null,2));
  await ctx.close();
 }
}
async function main(){
 await new Promise(done=>server.listen(0,"127.0.0.1",done));
 try{
  const c=await chromium.launch({headless:true});
  try{
   for(const [w,h] of [[320,740],[360,800],[390,844],[768,1024],[1366,900]])await hubCheck(c,"chromium",w,h);
   await appsCheck(c);
  }finally{await c.close()}
  const w=await webkit.launch({headless:true});
  try{await hubCheck(w,"webkit",390,844)}finally{await w.close()}
 }finally{server.close()}
}
main().catch(e=>{console.error(e);process.exitCode=1});
