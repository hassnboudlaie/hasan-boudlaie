/* Actual Chromium acceptance: badge gallery, medal artwork, PNG/SVG downloads, small viewports. */
"use strict";
const assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path");
const {chromium}=require("playwright");
const BASE=process.env.SABA_TEST_URL?.split("#")[0]||"http://127.0.0.1:4173/sabanaft/app/";
const out=path.join(__dirname,"../artifacts/saba-leadership-awards");
fs.mkdirSync(out,{recursive:true});
(async()=>{
 const browser=await chromium.launch({headless:true});
 try{
  for(const width of [320,390,768,1365]){
   const page=await browser.newPage({viewport:{width,height:850},acceptDownloads:true});
   const errors=[];page.on("pageerror",e=>errors.push(e.message));
   await page.goto(BASE+"#/passport",{waitUntil:"domcontentloaded"});
   await page.locator("#sabaAwardCollection .sa-award-card").first().waitFor();
   assert.equal(await page.locator("#sabaAwardCollection .sa-award-card").count(),10);
   const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-document.documentElement.clientWidth);
   assert.ok(overflow<=1,"Passport horizontal overflow at "+width+": "+overflow);
   const journey=await page.evaluate(()=>({
      version:1,mode:"competitive",attemptId:"test-local",stage:9,phase:"end",finished:true,
      startedAt:Date.now()-3000000,finishedAt:Date.now(),
      answers:Object.fromEntries(Array.from({length:10},(_,i)=>[i,{choice:0,decision:7,applied:2,points:9,practice:"تمرین رفتاری قابل سنجش و مسئول مشخص",rating:3}])),
      drafts:{},breaksDone:[3,7],breakStartedAt:0,hintsUsed:[],pause:{used:false,since:0,spentMs:0},
      extensions:[],graceMs:0,history:[{attemptId:"test-local",net:90,raw:90,timePenalty:0,hintPenalty:0,badge:"طلایی",finishedAt:Date.now()}]
    }));
   await page.evaluate(s=>localStorage.setItem("sabanaft_leadership_journey_v1",JSON.stringify(s)),journey);
   await page.reload({waitUntil:"domcontentloaded"});
   await page.locator("#sabaAwardCollection .sa-award-card").first().waitFor();
   assert.equal(await page.locator(".sa-award-card.sa-earned").count(),10);
   await page.locator('[data-sa-filter="medal"]').click();
   assert.equal(await page.locator(".sa-award-card").count(),3);
   assert.equal(await page.locator(".sa-award-card.sa-earned").count(),1);
   if(width===390){
     const png=page.waitForEvent("download",{timeout:12000});
     await page.locator('[data-sa-download="medal-gold"][data-sa-format="png"]').click();
     const file=await png;assert.ok(file.suggestedFilename().endsWith(".png"));
     const buf=fs.readFileSync(await file.path());assert.deepEqual([...buf.subarray(0,8)],[137,80,78,71,13,10,26,10],"download must be actual PNG");
     const svg=page.waitForEvent("download",{timeout:12000});
     await page.locator('[data-sa-download="medal-gold"][data-sa-format="svg"]').click();
     const s=await svg;assert.ok(s.suggestedFilename().endsWith(".svg"));
     assert.match(fs.readFileSync(await s.path(),"utf8"),/^<svg/);
   }
   await page.screenshot({path:path.join(out,"passport-"+width+".png"),fullPage:true});
   await page.goto(BASE+"#/journey",{waitUntil:"domcontentloaded"});
   await page.locator(".sa-final-medal").waitFor();
   const off=await page.evaluate(()=>document.documentElement.scrollWidth-document.documentElement.clientWidth);
   assert.ok(off<=1,"Journey horizontal overflow at "+width+": "+off);
   assert.ok(await page.locator(".sa-strip-item").count()===10);
   assert.deepEqual(errors,[],"no uncaught client exceptions");
   await page.close();
  }
  console.log("Saba awards Chromium: 4 viewports, 21 badges, medal SVG and real PNG download PASS");
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
