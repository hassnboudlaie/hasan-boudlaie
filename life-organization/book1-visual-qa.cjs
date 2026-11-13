/* Headless browser QA for Life Organization v0.3.
   Run on a runner with playwright installed: node life-organization/book1-visual-qa.cjs
   Requires no account and exercises public, entirely local app paths. */
"use strict";
const {chromium}=require("playwright");
const http=require("node:http"),fs=require("node:fs"),path=require("node:path"),assert=require("node:assert/strict");
const ROOT=path.resolve(__dirname,"..");
const SHOTS=path.join(ROOT,"qa-artifacts","life-org-v03");
fs.mkdirSync(SHOTS,{recursive:true});
const TYPES={".html":"text/html;charset=utf-8",".js":"text/javascript;charset=utf-8",".css":"text/css;charset=utf-8",".png":"image/png",".svg":"image/svg+xml",".webmanifest":"application/manifest+json"};
const server=http.createServer((req,res)=>{
 try{
  let pathname=decodeURIComponent(new URL(req.url,"http://localhost").pathname);
  pathname=pathname.replace(/^\/hasan-boudlaie\//,"/");
  if(pathname.endsWith("/"))pathname+="index.html";
  const full=path.resolve(ROOT,"."+pathname);
  if(!full.startsWith(ROOT+path.sep)){res.writeHead(403);res.end();return;}
  fs.readFile(full,(err,data)=>{
   if(err){res.writeHead(404);res.end("Not found");return;}
   res.writeHead(200,{"Content-Type":TYPES[path.extname(full)]||"application/octet-stream","Cache-Control":"no-store"});
   res.end(data);
  });
 }catch(err){res.writeHead(500);res.end(String(err));}
});
async function main(){
 await new Promise(resolve=>server.listen(0,"127.0.0.1",resolve));
 const port=server.address().port;
 const home="http://127.0.0.1:"+port+"/hasan-boudlaie/life-organization/";
 const browser=await chromium.launch({headless:true,args:["--no-sandbox","--disable-dev-shm-usage"]});
 const cases=[{name:"android-390",width:390,height:844,mobile:true},{name:"desktop-1440",width:1440,height:900,mobile:false}];
 try{
  for(const item of cases){
   const ctx=await browser.newContext({viewport:{width:item.width,height:item.height},deviceScaleFactor:1,isMobile:item.mobile,hasTouch:item.mobile});
   const page=await ctx.newPage(),errors=[];
   page.on("pageerror",err=>errors.push(err.message));
   await page.goto(home+"#module/1",{waitUntil:"domcontentloaded"});
   await page.locator(".lb-landing .lj-bank").waitFor();
   assert.equal(await page.locator(".lb-chapter-tile").count(),3,"three chapter tiles");
   assert.equal(await page.locator(".lj-badge-card").count(),4,"four badge collection slots");
   await page.screenshot({path:path.join(SHOTS,item.name+"-landing.png"),fullPage:true});
   await page.goto(home+"#book1/1",{waitUntil:"domcontentloaded"});
   await page.locator(".lj-reading-layout .lj-paper").waitFor();
   const font=await page.locator(".lj-paragraph").first().evaluate(x=>parseFloat(getComputedStyle(x).fontSize));
   assert.ok(font>=17,"body reading type is at least 17px: "+font);
   assert.equal(await page.locator(".lj-step").count(),8,"chapter 1 has eight editorial stages");
   assert.ok(await page.locator(".lj-coach textarea").isVisible(),"coaching note is optional and visible");
   await page.screenshot({path:path.join(SHOTS,item.name+"-chapter1.png"),fullPage:true});
   await page.locator(".lj-step").nth(1).click();
   await page.locator(".lj-page-dots button").last().click();
   await page.locator('[data-lj-action="read"]').click();
   await page.locator("#lj-celebration").waitFor();
   assert.match(await page.locator("#lj-celebration").innerText(),/\+15 XP/,"reader awards 15 XP");
   await page.locator('[data-lj-action="close-reward"]').click();
   await page.goto(home+"#book1/1/workbook",{waitUntil:"domcontentloaded"});
   await page.locator(".lj-form-stepper").waitFor();
   assert.equal(await page.locator(".lj-form-stepper .lb-form-field:visible").count(),2,"two active fields per workbook screen");
   const first=page.locator(".lj-form-stepper .lb-form-field:visible textarea").first();
   await first.fill("مشاهده نمونه برای آزمون ذخیره محلی");
   const saved=await first.inputValue();
   await page.locator('[data-lj-action="form-page"][data-form-page="1"]').click();
   assert.equal(await page.locator(".lj-form-stepper .lb-form-field:visible").count(),2,"next workbook screen has two fields");
   await page.locator('[data-lj-action="form-page"][data-form-page="0"]').click();
   assert.equal(await page.locator(".lj-form-stepper .lb-form-field:visible textarea").first().inputValue(),saved,"worksheet answer survives page change");
   await page.screenshot({path:path.join(SHOTS,item.name+"-workbook.png"),fullPage:true});
   await page.goto(home+"#progress",{waitUntil:"domcontentloaded"});
   await page.locator(".lj-global-progress .lj-bank").waitFor();
   assert.ok(await page.locator(".lj-global-progress-heading").isVisible(),"global journey wallet shown");
   if(item.mobile){
    for(const hash of ["#module/1","#book1/1","#book1/1/workbook","#progress"]){
     await page.goto(home+hash,{waitUntil:"domcontentloaded"});
     await page.locator("#page").waitFor();
     const overflow=await page.evaluate(()=>Math.max(0,document.documentElement.scrollWidth-window.innerWidth));
     assert.ok(overflow<=2,"no horizontal viewport overflow in "+hash+": "+overflow+"px");
    }
   }
   assert.deepEqual(errors,[],"no browser uncaught JS errors");
   console.log("PASS "+item.name+": 3 chapters, 4 badges, readable type, coaching, rewards, paged workbook, saved answers, global wallet"+(item.mobile?", no horizontal overflow":""));
   await ctx.close();
  }
 }finally{await browser.close();}
}
main().then(()=>{server.close();process.exitCode=0}).catch(err=>{console.error(err);server.close();process.exitCode=1});
