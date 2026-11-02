import assert from 'node:assert/strict';
import { chromium } from 'playwright';
import { mkdir } from 'node:fs/promises';

const HOST='http://127.0.0.1:4173';
const BASE=HOST+'/alborz-communication-skills/';
await mkdir('artifacts/alborz-resilience',{recursive:true});
const browser=await chromium.launch({headless:true,args:['--no-sandbox']});

async function qa(size,name){
 const ctx=await browser.newContext({viewport:size,locale:'fa-IR',deviceScaleFactor:1});
 const page=await ctx.newPage();
 const errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 try{
  await page.goto(BASE,{waitUntil:'domcontentloaded'});
  await page.getByRole('heading',{name:'دوره‌های آموزشی بیمه البرز'}).waitFor();
  const entry=page.getByRole('link',{name:/ورود به دوره تاب‌آوری/});
  assert.equal(await entry.count(),1,'Home page must have one new resilience course entry');
  assert.equal(await page.getByRole('link',{name:/ورود به دوره مهارت‌های ارتباطی/}).count(),1);
  await page.screenshot({path:'artifacts/alborz-resilience/'+name+'-academy.png'});
  await entry.click();
  await page.waitForURL(/resilience\.html$/);
  await page.getByRole('heading',{name:'گروه خود را انتخاب کنید'}).waitFor();
  const links=page.locator('a.group-link');
  assert.equal(await links.count(),10,'Ten independently navigable group cards required');
  await page.screenshot({path:'artifacts/alborz-resilience/'+name+'-groups.png'});
  await page.locator('a.group-link').first().click();
  await page.waitForURL(/\?group=1$/);
  assert.equal(await page.locator('a.stage-link').count(),6,'Six-step two-hour flow required');
  assert.equal(await page.locator('.roles input[data-role]').count(),5);
  assert.equal(await page.locator('.stage-link small').allTextContents().then(x=>x.map(t=>parseInt(t.replace(/[۰-۹]/g,d=>String('۰۱۲۳۴۵۶۷۸۹'.indexOf(d))).replace(/[^0-9]/g,''),10)).reduce((a,b)=>a+b,0)),120);
  await page.locator('input[data-role="0"]').fill('آزمایشی-گروه-یک');
  await page.getByRole('button',{name:/این گام انجام شد/}).click();
  await page.waitForURL(/\?group=1&step=1$/);
  await page.locator('button[data-case="1"]').click();
  assert.match(await page.locator('.callout.soft').first().innerText(),/قطعی سامانه/);
  await page.locator('textarea[data-field="signal"]').fill('ثبت آزمایشی گروه یک');
  await page.screenshot({path:'artifacts/alborz-resilience/'+name+'-workshop.png'});
  await page.goto(BASE+'resilience.html?group=2&step=1');
  assert.equal(await page.locator('textarea[data-field="signal"]').inputValue(),'','Group 2 must not inherit Group 1 data');
  await page.goto(BASE+'resilience.html?group=1&step=1');
  assert.equal(await page.locator('textarea[data-field="signal"]').inputValue(),'ثبت آزمایشی گروه یک','Group 1 data must persist');
  await page.goto(BASE+'resilience.html?group=1&step=2');
  assert.equal(await page.locator('.animal-card').count(),4);
  await page.locator('button[data-quiz="0"][data-answer="camel"]').click();
  await page.getByText('انتخاب درست است.',{exact:false}).first().waitFor();
  assert.equal(await page.locator('.quiz-feedback li').count(),4,'Each alternative must receive individual feedback');
  await page.goto(BASE+'resilience.html?group=1&step=3');
  await page.locator('button[data-decision="core"][data-answer="no"]').click();
  await page.locator('button[data-decision="outside"][data-answer="yes"]').click();
  await page.getByText('ماهی آزاد · نوآوری جدید بیرون از هسته',{exact:false}).first().waitFor();
  await page.locator('button[data-model="salmon"]').click();
  await page.goto(BASE+'resilience.html?group=1&handout=1');
  await page.getByRole('heading',{name:'منابع و حدود علمی'}).waitFor();
  assert.equal(await page.locator('.animal-card').count(),4,'Scientific handout visible inside each group');
  await page.goto(BASE+'resilience.html?group=10&guide=1');
  assert.equal(await page.locator('.guide-step').count(),6,'Group 10 illustrated guide available');
  await page.screenshot({path:'artifacts/alborz-resilience/'+name+'-guide.png'});
  assert.deepEqual(errors,[],'No uncaught JS errors: '+JSON.stringify(errors));
  console.log('PASS',name,'two course routes, 10 groups, six steps, isolation, autosave, models, quiz, scientific handout, visual guide');
 }finally{await ctx.close();}
}
try{await qa({width:1366,height:860},'desktop');await qa({width:390,height:844},'mobile');}
finally{await browser.close();}
