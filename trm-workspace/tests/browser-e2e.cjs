'use strict';
/* TRM v4 public PWA: real Chromium desktop/mobile, fictional single-hire end-to-end.
 * No Firebase login, no external AI request, no actual personal candidate data.
 */
const {chromium}=require('playwright');
const assert=require('node:assert/strict');
(async()=>{
 const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
 const page=await browser.newPage({viewport:{width:1365,height:900},locale:'fa-IR',timezoneId:'Asia/Tehran'});
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 const root='http://127.0.0.1:8765/trm-workspace/';
 const fill=async (step,data)=>{const f=page.locator(`form[data-form="pilot-${step}"]`);await f.waitFor();for(const [name,value] of Object.entries(data)){const el=f.locator(`[name="${name}"]`);if(await el.count()){const tag=await el.evaluate(x=>x.tagName);if(tag==='SELECT')await el.selectOption(value);else await el.fill(value)}}await f.locator('button[type="submit"]').click();};
 try{
  await page.goto(root,{waitUntil:'domcontentloaded'});await page.locator('.command-hero').waitFor();
  assert.equal(await page.locator('.command-tile').count(),4);
  assert(await page.locator('.command-tile[data-go="pilot"]').isVisible());
  await page.locator('.command-tile[data-go="pilot"]').click();
  await page.locator('[data-action="pilot-start-demo"]').click();
  await fill('need',{businessImpact:'صرفاً مثال آموزشی؛ مدیریت تأمین برای کنترل هزینه خرید مهم است',criticalIncident:'تأمین‌کننده در یک سناریوی ساختگی به تعهد تحویل عمل نمی‌کند',owner:'کارشناس منابع انسانی آزمایشی'});
  await fill('evp',{strengths:'اختیار واقعی در یک پروژه فرضی',preferences:'علاقه به حل مسئله پیچیده',difference:'مشارکت در تصمیم مدیریتی ساختگی',proof:'نمونه تمرینی برای تست؛ ادعای واقعی نیست'});
  await fill('source',{channel:'socialmedia',targetGroup:'متخصصان خرید صنعتی',owner:'مسئول آزمایشی',goal:'یافتن دو متخصص برای گفت‌وگوی داوطلبانه',nextStep:'انتشار محتوای تخصصی ساختگی و دعوت بدون فشار'});
  await page.locator('[data-action="pilot-fictional"]').click();
  await fill('retention',{measure:'learning',value:'ارائه یک نشست تخصصی ساختگی برای تمرین',nextAction:'دعوت داوطلبانه به گفت‌وگو',nextDate:'2026-12-10',owner:'مسئول آزمایشی'});
  await fill('assessment',{criticalIncident:'در اختلال تأمین چه اقدام‌هایی می‌کنید؟',evidence:'تحلیل قابل مشاهده در یک مصاحبه ساختگی',development:'آموزش نرم‌افزار داخلی فرضی',interviewer:'مدیر خط ساختگی'});
  await fill('experience',{promised:'2026-12-12',message:'مسئول جذب در تاریخ توافق‌شده پاسخ ساختگی را ارائه می‌کند'});
  await fill('decision',{choice:'nurture',reason:'نیازمند اطلاعات بیشتر در سناریوی ساختگی',decisionMaker:'مدیر واحد آزمایشی',nextAction:'پیگیری توافق‌شده در سه ماه آینده'});
  assert(await page.locator('.hire-result').isVisible(),'report visible');
  assert((await page.locator('.hire-progress').innerText()).includes('۱۰۰')|| (await page.locator('.hire-progress').innerText()).includes('100'),'all steps completed');
  console.log('PASS one fictional hiring case through eight stages');
  await page.reload({waitUntil:'domcontentloaded'});await page.locator('.hire-banner').waitFor();
  assert(await page.locator('.hire-result').isVisible(),'local data persisted after refresh');
  await page.locator('.nav-link[data-go="playbook"]').click();
  assert(await page.locator('.trost-chapters button').count()===10,'ten chapters visible');
  await page.locator('[data-action="book-chapter"][data-id="5"]').click();
  await page.locator('[data-action="book-open"][data-id="socialmedia"]').click();
  assert((await page.locator('.trost-detail h3').innerText()).includes('Social Media'));
  const f=page.locator('form[data-form="book-practice"]');
  await f.locator('input[name="choice"][value="0"]').check();
  await f.locator('textarea[name="evidence"]').fill('نمونه شاهد ساختگی از برنامه رسانه اجتماعی سازمان برای تست UI');
  await f.locator('input[name="owner"]').fill('کارشناس ارتباطات');
  await f.locator('button[type="submit"]').click();
  assert((await page.locator('.trost-overview').innerText()).includes('1')|| (await page.locator('.trost-overview').innerText()).includes('۱'));
  console.log('PASS all-chapter workbench and social-media planning save');
  await page.locator('.nav-link[data-go="agent"]').click();
  await page.locator('#trm-book-question').fill('Candidate Retention');
  await page.locator('[data-action="book-ask"]').click();
  assert((await page.locator('.book-ai-answer').innerText()).includes('Candidate Retention Cycle'));
  console.log('PASS local Trost knowledge assistant answers and cites relevant workflow');
  await page.setViewportSize({width:390,height:844});
  await page.goto(root,{waitUntil:'domcontentloaded'});await page.locator('.command-grid').waitFor();
  assert.equal(await page.evaluate(()=>document.documentElement.dir),'rtl');
  assert(await page.locator('.bottombar').isVisible());
  assert((await page.evaluate(()=>document.documentElement.scrollWidth))<445,'no major horizontal mobile overflow');
  await page.locator('.bottombar button[data-go="pilot"]').click();
  assert(await page.locator('.hire-stage-card').isVisible(),'pilot usable on mobile');
  console.log('PASS mobile 390px RTL and bottom navigation');
  assert.deepEqual(errors,[],`no browser page errors: ${errors.join(' | ')}`);
 }catch(e){try{await page.screenshot({path:'/tmp/trm-v4-e2e-failure.png',fullPage:true})}catch{}throw e}finally{await browser.close()}
})().catch(e=>{console.error(e);process.exit(1)});