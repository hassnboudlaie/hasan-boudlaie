/* Real Chromium smoke tests against the existing static Saba PWA route. */
"use strict";
const {chromium}=require("playwright"),assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path");
const BASE=process.env.SABA_TEST_URL||"http://127.0.0.1:4173/sabanaft/app/#/journey";
const artifacts=path.join(__dirname,"../artifacts/saba-leadership-journey");
fs.mkdirSync(artifacts,{recursive:true});
async function run(browser,name,viewport){
 const context=await browser.newContext({viewport,locale:"fa-IR",reducedMotion:"reduce"});
 const page=await context.newPage(),errors=[];
 page.on("pageerror",e=>errors.push(e.message));
 await page.goto(BASE,{waitUntil:"domcontentloaded"});
 await page.locator('[data-lj="startCompetitive"]').waitFor({timeout:30000});
 const brand=await page.locator(".lj-brand h1").innerText();
 assert.match(brand,/سفر تعاملی|رهبری بازتابی/);
 assert.equal(await page.locator('section#journeyView.active').count(),1);
 assert.equal(await page.locator('[data-lj="startStudy"]').count(),1);
 await page.screenshot({path:path.join(artifacts,name+"-intro.png"),fullPage:true});
 await page.locator('[data-lj="startCompetitive"]').click();
 assert.equal(await page.locator("#ljClock").count(),1);
 assert.equal(await page.locator(".lj-choice").count(),4);
 assert.equal(await page.locator(".lj-float-guide").count(),1);
 assert.equal(await page.locator(".lj-fullreview").count(),0);
 await page.locator('[data-lj="hint"]').click();
 assert.equal(await page.locator(".lj-hint-grid").count(),0);
 await page.locator('[data-lj="confirmHint"]').click();
 assert.equal(await page.locator(".lj-hint-grid>div").count(),3);
 await page.locator('[data-lj="closeHint"]').click();
 await page.locator('[data-lj="pause"]').click();
 assert.equal(await page.locator("#ljPauseClock").count(),1);
 await page.locator('[data-lj="resume"]').click();
 assert.equal(await page.locator("#ljPauseClock").count(),0);
 await page.locator('input[name="ljDecision"][value="1"]').check();
 await page.locator("#ljPractice").fill("در جلسه کوتاه، معیار تصمیم را با داده تأییدشده و موعد روشن مشخص می‌کنم.");
 await page.locator("#ljRating").selectOption("3");
 await page.reload({waitUntil:"domcontentloaded"});
 await page.locator(".lj-choice input:checked").waitFor();
 assert.equal(await page.locator('input[name="ljDecision"]:checked').inputValue(),"1");
 assert.match(await page.locator("#ljPractice").inputValue(),/در جلسه کوتاه/);
 await page.screenshot({path:path.join(artifacts,name+"-step.png"),fullPage:true});
 await page.locator('[data-lj="submit"]').click();
 assert.equal(await page.locator(".lj-milestone").count(),1);
 assert.equal(await page.locator(".lj-fullreview").count(),0);
 const checked=await page.evaluate(()=>({viewport:innerWidth,scroll:document.documentElement.scrollWidth}));
 assert.ok(checked.scroll-checked.viewport<=24,"Horizontal clipping "+JSON.stringify(checked));
 assert.deepEqual(errors,[],"No JS page errors during journey");
 await context.close();
}
(async()=>{
 const browser=await chromium.launch({headless:true});
 try{
  await run(browser,"desktop",{width:1365,height:900});
  await run(browser,"mobile",{width:390,height:844});
  console.log("PASS: Real Chromium Saba Naft desktop/mobile journey smoke + screenshots");
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
