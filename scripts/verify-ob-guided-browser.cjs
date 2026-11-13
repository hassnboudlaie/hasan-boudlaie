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
  await ctx.addInitScript(()=>localStorage.setItem("mba-ob-classroom-attendance-identity-v1",JSON.stringify({role:"student",token:"qa-approved-device",name:"دانشجوی آزمون"})));
  let draftSent=null;
  await ctx.route("https://hxcjkewlaniahvuqwwbb.supabase.co/functions/v1/mba-ob-attendance",async route=>{
   const params=JSON.parse(route.request().postData()||"{}");
   let result={ok:false,error:"invalid_action"};
   if(params.action==="accessState")result={ok:true,role:"student",approval_status:"approved",student:{name:"دانشجوی آزمون",student_number:"123456789"}};
   if(params.action==="caseMy")result={ok:true,submission:draftSent,history:[]};
   if(params.action==="caseSubmit"){
    draftSent={id:"aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",session_no:params.session,answers:params.answers,
     status:"submitted",score:null,feedback:null,submitted_at:new Date().toISOString(),revision_no:1};
    result={ok:true,status:"submitted",id:draftSent.id,revision_no:1};
   }
   await route.fulfill({status:200,contentType:"application/json",headers:{"Access-Control-Allow-Origin":"*"},body:JSON.stringify(result)});
  });
  const page=await ctx.newPage(),errors=[];
  page.on("pageerror",e=>errors.push(e.message));
  page.on("console",message=>{if(message.text().includes("PRESENTER_CHANGE"))console.log(message.text())});
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
  assert.ok((await page.locator(".gr-case-table").count())===1,"Chapter case presents evidence table rather than an irrelevant case link");
  assert.ok((await page.locator(".gr-case-table tr").count())>=5,"Case contains usable management data");
  await save(page,config.name+"-03-case-source");
  await page.locator('[data-action="guidedNext"]').click();
  assert.ok(await page.getByText("Three Levels of OB").first().isVisible(),"Theory toolbox links case to Robbins");
  await page.locator('[data-action="guidedNext"]').click();
  await page.locator('[data-action="guidedNext"]').click();
  assert.equal(await page.locator(".gr-stage textarea").count(),1,"Case workbook shows one rubric section per stage");
  await page.locator('[data-guided-key="case-problem"]').fill("آزمون ثبت پاسخ کیس که به داده های همین جلسه مربوط است");
  await page.locator('[data-action="guidedNext"]').click();
  await page.locator('[data-action="guidedPrev"]').click();
  assert.equal(await page.locator('[data-guided-key="case-problem"]').inputValue(),"آزمون ثبت پاسخ کیس که به داده های همین جلسه مربوط است","Autosave across stages");
  await noOverflow(page,config.name+" case worksheet");
  await save(page,config.name+"-04-case-workbook");
  await page.reload({waitUntil:"domcontentloaded"});
  await page.locator('.student-focus button[data-action="openActive"]').click();
  await page.locator('[data-track="practice"]').click();
  await page.locator("#sectionSelect").selectOption("case");
  assert.equal(await page.locator('[data-guided-key="case-problem"]').inputValue(),"آزمون ثبت پاسخ کیس که به داده های همین جلسه مربوط است","Session text survives refresh");
  const keys=["problem","evidence","levels","explain","intervention","measurement"];
  for(let i=0;i<keys.length;i++){
   await page.locator('[data-action="guidedJump"][data-index="'+(i+3)+'"]').click();
   await page.locator('[data-guided-key="case-'+keys[i]+'"]').fill("پاسخ تحلیلی مستند و مرتبط با کیس برای "+keys[i]);
  }
  await page.locator('[data-action="guidedJump"][data-index="9"]').click();
  await page.locator('[data-action="submitCase"]').click();
  await page.getByText("ارسال‌شده · در انتظار ارزیابی").waitFor();
  assert.ok(draftSent&&Object.keys(draftSent.answers).length===6,"All six analytical answers submitted to backend");
  await noOverflow(page,config.name+" submission");
  await save(page,config.name+"-04b-submitted");
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
  assert.ok(await page.locator('[data-action="jumpToCase"]').isVisible(),"Assignment follows exactly the same six-step case framework");
  await page.locator('[data-action="jumpToCase"]').click();
  assert.ok(await page.locator('.gr-shell[data-guided-mode="case"]').isVisible(),"Assignment returns to case not disconnected tasks");
  await noOverflow(page,config.name+" assignment");
  await save(page,config.name+"-06-assignment");
  await page.locator('[data-track="concepts"]').click();
  await page.locator("#sectionSelect").selectOption("slides");
  assert.ok(await page.locator(".persian-version").isVisible(),"Persian presentation kept");
  assert.ok(await page.locator(".english-version").isVisible(),"English source preserved");
  await page.locator('[data-action="openOriginalEnglish"]').click();
  await page.locator("#presenterStage").waitFor();
  assert.equal(await page.locator('#presenterStage').getAttribute('data-variant'),'en',"Original source is selected in the same app player");
  await page.locator('.presenter-original-slide img').waitFor();
  assert.ok(await page.locator('.presenter-original-slide img').evaluate(img=>img.complete&&img.naturalWidth>=900),"Slide is a real full-resolution source render, not a screenshot of Google Drive");
  assert.ok((await page.locator('.presenter-count').textContent()).includes("16"),"Chapter 1 original has 16 pages");
  await noOverflow(page,config.name+" English source");
  await save(page,config.name+"-07-original-English-1");
  await page.locator('[data-action="slideNext"]').click();
  assert.ok((await page.locator('.presenter-original-slide img').getAttribute('src')).includes('slide-02.webp'),"Next English slide has original page 2");
  await page.locator("#presenterPageSelect").selectOption("15");
  const jumpInfo={src:await page.locator('.presenter-original-slide img').getAttribute('src'),selected:await page.locator('#presenterPageSelect').inputValue(),count:await page.locator('.presenter-count').textContent()};
  console.log('PRESENTER_JUMP_DIAGNOSTIC',JSON.stringify(jumpInfo));
  assert.ok(jumpInfo.src.includes('slide-16.webp'),"Can jump to last English slide without switching page");
  await page.locator('[data-action="presenterLanguage"][data-language="fa"]').click();
  assert.ok(await page.locator('.presenter-fa-slide').isVisible(),"Persian deck stays in the same player");
  await page.locator('[data-action="presenterLanguage"][data-language="en"]').click();
  assert.ok(await page.locator('.presenter-original-slide img').isVisible(),"Language switching is reversible");
  await page.locator('[data-action="slideFull"]').click();
  const fullscreen=await page.evaluate(()=>Boolean(document.fullscreenElement));
  assert.equal(fullscreen,true,"Fullscreen presentation must activate on click");
  await page.locator('[data-action="slideNext"]').click();
  assert.equal(await page.evaluate(()=>Boolean(document.fullscreenElement)),true,"Slide navigation does not exit fullscreen");
  await page.locator('[data-action="presenterLanguage"][data-language="fa"]').click();
  assert.equal(await page.evaluate(()=>Boolean(document.fullscreenElement)),true,"Language switching does not exit fullscreen");
  await page.keyboard.press("Escape");
  await page.locator("#lectureSlide").focus();
  await page.keyboard.press("PageDown");
  assert.ok((await page.locator('.presenter-count').textContent()).includes("۲")||(await page.locator('.presenter-count').textContent()).includes("2"),"Keyboard PageDown advances Persian deck");
  await noOverflow(page,config.name+" unified fullscreen/slide controls");
  await save(page,config.name+"-08-Persian-presenter");
  await page.locator('[data-action="backFromPresentation"]').click();
  await page.locator("#sectionSelect").waitFor();
  // Both chapters must use their own original source image sequence.
  await page.locator('[data-action="backSessions"]').click();
  await page.locator('[data-action="openSession"][data-id="2"]').click();
  await page.locator('[data-track="concepts"]').click();
  await page.locator("#sectionSelect").selectOption("slides");
  await page.locator('[data-action="openOriginalEnglish"]').click();
  assert.ok(await page.locator('.presenter-original-slide img').evaluate(img=>img.complete&&img.naturalWidth>=900),"Second chapter original source image renders");
  assert.ok((await page.locator('.presenter-count').textContent()).includes("14"),"Second chapter has 14 original English slides");
  await page.locator('[data-action="backFromPresentation"]').click();
  await noOverflow(page,config.name+" presentations");
  await page.locator("#themeToggle").click();
  assert.equal(await page.evaluate(()=>document.documentElement.dataset.theme),"dark","Optional dark mode still works");
  await noOverflow(page,config.name+" dark theme");
  await page.goto(url,{waitUntil:"domcontentloaded"});
  await page.locator(".student-focus").waitFor();
  assert.deepEqual(errors,[],config.name+" uncaught frontend JavaScript errors");
  await ctx.close();
  console.log("PASS "+config.name+": 7 concepts, chapter-aligned case, six-part submitted workbook, role-play, quiz, presentations, dark theme, RTL and overflow");
 }
 // Access-gate approval flow: registration does not unlock lessons before teacher review.
 const pendingCtx=await browser.newContext({viewport:{width:390,height:844},hasTouch:true,isMobile:true});
 let admitted=false;
 await pendingCtx.route("https://hxcjkewlaniahvuqwwbb.supabase.co/functions/v1/mba-ob-attendance",async route=>{
  const data=JSON.parse(route.request().postData()||"{}");
  const value=data.action==="registerStudent"?{ok:true,role:"student",name:"دانشجوی تست",student_number:"991122334",approval_status:"pending",token:"qa-pending-token"}:
    data.action==="accessState"?{ok:true,role:"student",approval_status:admitted?"approved":"pending",student:{name:"دانشجوی تست",student_number:"991122334"}}:{ok:false,error:"invalid_action"};
  await route.fulfill({status:200,contentType:"application/json",headers:{"Access-Control-Allow-Origin":"*"},body:JSON.stringify(value)});
 });
 const pendingPage=await pendingCtx.newPage();
 await pendingPage.goto(url,{waitUntil:"domcontentloaded"});
 await pendingPage.locator("#entranceStudent").waitFor();
 await pendingPage.locator("#studentNumber").fill("991122334");
 await pendingPage.locator("#studentName").fill("دانشجوی تست");
 await pendingPage.locator("#entranceStudent button[type=submit]").click();
 await pendingPage.getByText("در انتظار تأیید مدرس").waitFor();
 assert.equal(await pendingPage.locator(".student-focus").count(),0,"Pending student cannot reach lesson UI");
 assert.ok(await pendingPage.locator("#site").isHidden(),"App shell hidden before teacher approval");
 await pendingPage.getByText("بررسی وضعیت").click();
 assert.equal(await pendingPage.locator(".student-focus").count(),0,"Pending remains locked on status refresh");
 admitted=true;
 await pendingPage.getByText("بررسی وضعیت").click();
 await pendingPage.locator(".student-focus").waitFor();
 assert.ok(await pendingPage.locator("#entryGate").isHidden(),"Approved student enters class");
 await noOverflow(pendingPage,"mobile auth gate");
 await save(pendingPage,"android-390-07-approved-entry");
 await pendingCtx.close();
 // Teacher authority: pending student appears in admin list and only verified teacher can approve.
 const instructorCtx=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true});
 await instructorCtx.addInitScript(()=>localStorage.setItem("mba-ob-classroom-attendance-identity-v1",JSON.stringify({role:"teacher",token:"qa-teacher-session"})));
 let reviewed=false,caseGraded=false;
 const sampleSubmission={id:"bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb",student_id:"aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",student_name:"دانشجوی منتظر",student_number:"991122334",session_no:1,case_title:"مرکز خدمات سپهر",answers:{problem:"مسئله خدمات","evidence":"شواهد مورد نیاز","levels":"سازمان فرد گروه","explain":"تبیین رفتار","intervention":"مداخله عملی","measurement":"شاخص سنجش"},revision_no:1,status:"submitted",score:null,feedback:null,submitted_at:new Date().toISOString()};
 
 await instructorCtx.route("https://hxcjkewlaniahvuqwwbb.supabase.co/functions/v1/mba-ob-attendance",async route=>{
  const req=JSON.parse(route.request().postData()||"{}");
  let out={ok:false,error:"invalid_action"};
  if(req.action==="accessState")out={ok:true,role:"teacher",approval_status:"approved"};
  if(req.action==="teacherState")out={ok:true,students:[{id:"aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",full_name:"دانشجوی منتظر",student_number:"991122334",approval_status:reviewed?"approved":"pending",disabled_at:null}],attendance:[],windows:[],invites:[],unredeemed:0,server_time:new Date().toISOString()};
  if(req.action==="reviewStudent"){assert.equal(req.status,"approved");reviewed=true;out={ok:true,approval_status:"approved"}}
  if(req.action==="caseList")out={ok:true,submissions:[sampleSubmission],server_time:new Date().toISOString()};
  if(req.action==="caseReview"){assert.equal(req.submission_id,sampleSubmission.id);assert.equal(req.score,18);caseGraded=true;
   sampleSubmission.status="reviewed";sampleSubmission.score=req.score;sampleSubmission.feedback=req.feedback;out={ok:true,status:"reviewed",score:18}}
  if(req.action==="caseHistory")out={ok:true,history:[{decision:"reviewed",score:18,feedback:"پاسخ مبتنی بر شواهد و با چارچوب دقیق است.",reviewed_at:new Date().toISOString(),revision_no:1}]};
  await route.fulfill({status:200,contentType:"application/json",headers:{"Access-Control-Allow-Origin":"*"},body:JSON.stringify(out)});
 });
 const instructorPage=await instructorCtx.newPage();
 await instructorPage.goto(url,{waitUntil:"domcontentloaded"});
 await instructorPage.locator(".page").waitFor();
 assert.equal(await instructorPage.locator("#roleSummary").textContent(),"مدرس","Verified teacher starts in teacher role");
 assert.ok(await instructorPage.locator(".join-qr-card img[src='./join-qr.svg']").isVisible(),"Teacher home shows classroom QR");
 await instructorPage.locator('[data-action="teacherCurrentPresentation"]').click();
 assert.ok(await instructorPage.locator('[data-action="presenterLanguage"][data-language="en"]').isVisible(),"Teacher can choose original English in the classroom player");
 await instructorPage.locator('[data-action="presenterLanguage"][data-language="en"]').click();
 assert.ok(await instructorPage.locator('.presenter-original-slide img').isVisible(),"Teacher English deck opens inside the app");
 await instructorPage.locator('[data-action="backFromPresentation"]').click();
 await instructorPage.locator(".teacher-home details.disclosure").first().locator("summary").click();
 await instructorPage.locator('[data-page="caseReviews"]').click();
 await instructorPage.getByText("ارزیابی تحلیل کیس‌ها").waitFor();
 await instructorPage.getByText("کد دانشجویی: 991122334").first().waitFor();
 await instructorPage.locator(".case-student-record summary").click();
 await instructorPage.locator('.case-review-form [name=score]').fill("18");
 await instructorPage.locator('.case-review-form [name=feedback]').fill("پاسخ مبتنی بر شواهد و با چارچوب دقیق است.");
 await instructorPage.locator('.case-review-form button[type=submit]').click();
 await instructorPage.getByText("ارزیابی‌شده").first().waitFor();
 assert.ok(caseGraded,"Real teacher case evaluation reaches backend");
 await noOverflow(instructorPage,"teacher case grading");
 await save(instructorPage,"android-390-08-gradebook");
 await instructorPage.locator('[data-action="navigate"][data-page="home"]').first().click();
assert.ok(await instructorPage.locator(".join-qr-card img[src='./join-qr.svg']").isVisible(),"Teacher home shows classroom QR");
 await instructorPage.locator('[data-action="showJoinQR"]').click();
 assert.ok(await instructorPage.locator(".join-qr-projector").isVisible(),"Projected first screen shows large join QR");
 await noOverflow(instructorPage,"teacher projector QR");
 await save(instructorPage,"android-390-08-qr-projector");
 await instructorPage.goto(url+"attendance.html",{waitUntil:"domcontentloaded"});
 await instructorPage.getByText("درخواست‌های عضویت").waitFor();
 assert.ok((await instructorPage.locator('[data-action="reviewStudent"][data-status="approved"]').count())===1,"Teacher sees pending student");
 await instructorPage.locator('[data-action="reviewStudent"][data-status="approved"]').click();
 await instructorPage.getByText("درخواست جدیدی وجود ندارد.").waitFor();
 assert.equal(reviewed,true,"Teacher approval sent to server");
 await save(instructorPage,"android-390-08-teacher-approval");
 await instructorCtx.close();

 }finally{await browser.close();await new Promise(resolve=>server.close(resolve))}
}
run().catch(err=>{console.error(err);process.exitCode=1;server.close()});