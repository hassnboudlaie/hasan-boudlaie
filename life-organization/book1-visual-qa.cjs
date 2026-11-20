/* Headless browser QA for Life Organization v0.5.
   Run on a runner with playwright installed: node life-organization/book1-visual-qa.cjs
   Requires no account and exercises public, entirely local app paths. */
"use strict";
const {chromium}=require("playwright");
const http=require("node:http"),fs=require("node:fs"),path=require("node:path"),assert=require("node:assert/strict");
const ROOT=path.resolve(__dirname,"..");
const SHOTS=path.join(ROOT,"qa-artifacts","life-org-v07");
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
   if(await page.locator("#brand-splash").count())await page.locator("#brand-splash").waitFor({state:"detached"});
   assert.equal(await page.locator(".lb-chapter-tile").count(),12,"twelve fully authored chapter tiles");
   assert.equal(await page.locator(".lb-chapter-tile.lo-upcoming").count(),0,"all twelve chapters are authored");
   assert.equal(await page.locator(".lj-badge-card").count(),13,"twelve chapter badges and foundation badge");
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
    for(const hash of ["#module/1","#book1/1","#book1/1/workbook","#book1/6","#book1/7","#book1/8","#book1/9","#book1/10","#book1/11","#book1/12","#book1/12/workbook","#book1/profile","#book1/front/about","#book1/front/intro","#book1/front/guide","#book1/front/toc","#progress"]){
     await page.goto(home+hash,{waitUntil:"domcontentloaded"});
     await page.locator("#page").waitFor();
     const overflow=await page.evaluate(()=>Math.max(0,document.documentElement.scrollWidth-window.innerWidth));
     assert.ok(overflow<=2,"no horizontal viewport overflow in "+hash+": "+overflow+"px");
    }
   }
   
   // The authored tools are contextual maps, not personality / wellbeing scores.
   for(const n of [4,5,6,7,8,9,10,11]){
    await page.goto(home+"#book1/"+n,{waitUntil:"domcontentloaded"});
    await page.locator('[data-lo-map="'+n+'"]').waitFor();
    assert.equal(await page.locator('[data-lo-map="'+n+'"] .lo-map-cell').count(),4,"chapter "+n+" matrix has four positions");
    await page.locator('[data-lo-map="'+n+'"] [data-lo-action="place"][data-cell="0"]').click();
    assert.ok(await page.locator('[data-lo-map="'+n+'"] .lo-map-cell.lo-current').count()===1,"current placement selected");
    await page.locator('[data-lo-map="'+n+'"] [data-lo-action="mode"][data-mode="suitable"]').click();
    await page.locator('[data-lo-map="'+n+'"] [data-lo-action="place"][data-cell="3"]').click();
    assert.ok(await page.locator('[data-lo-map="'+n+'"] .lo-map-cell.lo-suitable').count()===1,"suitable placement selected");
    await page.screenshot({path:path.join(SHOTS,item.name+"-chapter"+n+"-matrix.png"),fullPage:true});
    await page.goto(home+"#book1/"+n+"/workbook",{waitUntil:"domcontentloaded"});
    assert.equal(await page.locator(".lj-form-stepper").count(),1,"chapter "+n+" workbook available");
    if(item.mobile){
     const overflow=await page.evaluate(()=>Math.max(0,document.documentElement.scrollWidth-window.innerWidth));
     assert.ok(overflow<=2,"no horizontal overflow in chapter "+n+" worksheet: "+overflow);
    }
   }
   await page.goto(home+"#book1/workbook",{waitUntil:"domcontentloaded"});
   assert.equal(await page.locator(".lo-dossier-item").count(),12,"twelve dossier entries");
   await page.goto(home+"#book1/11/workbook",{waitUntil:"domcontentloaded"});
   assert.equal(await page.locator(".lb-form-field").count(),10,"chapter 11 all 10 prompts render");
   await page.goto(home+"#book1/12",{waitUntil:"domcontentloaded"});
   await page.locator(".lj-reading-layout .lj-paper").waitFor();
   assert.ok(await page.locator(".lp-profile-quick [data-route='book1/profile']").isVisible(),"final chapter links to live eight-map profile");
   await page.goto(home+"#book1/12/workbook",{waitUntil:"domcontentloaded"});
   assert.equal(await page.locator(".lb-form-field").count(),10,"chapter 12 ten guided workbook fields");
   await page.locator(".lj-form-stepper .lb-form-field:visible textarea").first().fill("دو انتخاب واقعی با بازه مشخص");
   await page.goto(home+"#book1/profile",{waitUntil:"domcontentloaded"});
   assert.equal(await page.locator(".lp-matrix-card").count(),8,"eight authored matrices shown on one connected profile");
   assert.equal(await page.locator(".lp-mini-cell.is-current").count(),8,"eight previously saved current map positions present");
   assert.equal(await page.locator(".lp-mini-cell.is-suitable").count(),8,"eight suitable map positions present");
   assert.ok((await page.locator(".lp-synthesis-lines").innerText()).includes("دو انتخاب واقعی"),"final workbook response feeds live profile");
   await page.screenshot({path:path.join(SHOTS,item.name+"-integrated-life-profile.png"),fullPage:true});
   await page.goto(home+"#book1/front/guide",{waitUntil:"domcontentloaded"});
   assert.ok(await page.locator(".lp-manuscript").isVisible(),"authored how-to-use guide available");
   await page.goto(home+"#book1/front/toc",{waitUntil:"domcontentloaded"});
   assert.equal(await page.locator(".lp-toc-chapter").count(),12,"approved Book One table of contents has 12 active chapters");

   
   for(const n of [9,10,11,12]){
    await page.goto(home+"#book1/"+n,{waitUntil:"domcontentloaded"});
    assert.ok(await page.locator(".lo-source-state").isVisible(),"review manuscript clearly labeled "+n);
   }
   assert.deepEqual(errors,[],"no browser uncaught JS errors");
   console.log("PASS "+item.name+": 12 chapters, 13 badges, 8 connected matrices, dossier, readable type, coaching, rewards, paged workbook, saved answers, global wallet"+(item.mobile?", no horizontal overflow":""));
   await ctx.close();
  }
 }finally{await browser.close();}
}
main().then(()=>{server.close();process.exitCode=0}).catch(err=>{console.error(err);server.close();process.exitCode=1});
