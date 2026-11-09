
'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');
const { chromium } = require('playwright-core');
const root = path.resolve(__dirname, '..');
const dest = 'artifacts/alborz-resilience';
fs.mkdirSync(dest, {recursive: true});
const server = http.createServer((req, res) => {
  const pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
  const full = path.resolve(root, '.' + pathname);
  if (!full.startsWith(root + path.sep)) { res.writeHead(403); res.end('forbidden'); return; }
  fs.readFile(full, (error, buffer) => {
    res.statusCode = error ? 404 : 200;
    res.setHeader('content-type', full.endsWith('.js') ? 'application/javascript; charset=utf-8' :
      full.endsWith('.css') ? 'text/css; charset=utf-8' : 'text/html; charset=utf-8');
    res.end(error ? 'not found' : buffer);
  });
});
(async () => {
  await new Promise(resolve => server.listen(4179, '127.0.0.1', resolve));
  const browser = await chromium.launch({headless: true, args: ['--no-sandbox']});
  const base = 'http://127.0.0.1:4179/alborz-communication-skills/';
  for (const width of [390, 1366]) {
    const ctx = await browser.newContext({viewport: {width, height: 820}});
    const page = await ctx.newPage(), errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.goto(base + 'claims-workshop-v2.html', {waitUntil: 'load'});
    assert.equal(await page.locator('a[href="./claims-presentation.html"]').count(), 0,
      'retired classroom presentation entry is not visible on the homepage');
    assert.match(await page.locator('.workshop-hero h1').innerText(), /تلاطم.*راهبرد/s);
    assert.equal(await page.locator('.strategy-strip span').count(), 4);
    assert.equal(await page.getByText('راهنمای کوتاه کلاس').count(), 0);
    assert.equal(await page.getByText('نمایش درشت و مرحله‌ای', {exact:false}).count(), 0);
    assert.equal(await page.getByText('Presentation Mode', {exact:false}).count(), 0);
    assert.equal(await page.getByText('برنامه هشت‌ساعته', {exact:true}).count(), 0);
    assert.equal(await page.getByText('کنداکتور برنامه', {exact:true}).count(), 1);
    assert.equal(await page.locator('.workshop-hero .strategy-card').count(), 4, 'four informational strategies remain visible');
    assert.equal(await page.locator('.module-path-card').count(), 3, 'independent resilience, anger and assertiveness entries are visible');
    assert.equal(await page.locator('.workshop-hero .strategy-card[role="button"],.workshop-hero .strategy-card[data-strategy],dialog.alborz-strategy-dialog').count(), 0,
      'removed duplicate clickable lesson and mission route from the homepage');
    await page.getByRole('button', {name:'کنداکتور برنامه'}).click();
    assert.match(await page.locator('.panel h2').first().innerText(), /کنداکتور دو روزه/);
    assert.equal(await page.locator('.role-entry-link').count(), 2, 'guided workshop has separate instructor and expert entrances');
    assert.equal(await page.locator('.role-entry-link[href="./resilience.html?classroom=1"]').count(), 1, 'one expert route');
    assert.equal(await page.locator('.role-entry-link[href*="teacher=1"]').count(), 1, 'one instructor route');
    await page.locator('#homeBtn').click();
    assert.equal(await page.getByText('سناریوی پایانی مشترک', {exact:true}).count(), 0);
    assert.equal(await page.locator('.home-actions a[href*="claims-presentation"]').count(), 0,
      'weak presentation feature no longer competes with the four strategies');
    assert.equal(await page.locator('.mod-art').count(), 0, 'old three-module cards removed from homepage');
    assert.equal(await page.locator('section.grid3[aria-label="بخش‌های کارگاه"]').count(), 0,
      'home has no competing module entry');
    assert.equal(await page.locator('.workshop-hero .strategy-card').count(), 4,
      'only four strategy cards remain');
    await page.route('**/functions/v1/alborz-workshop-sync', async route => {
      const payload = route.request().postDataJSON();
      const body = payload.action === 'login'
        ? {identity:{role:'team',team:7,member:4},session:'mock-session'}
        : {records:[],classroom:{phase:0,version:0}};
      await route.fulfill({status:200,contentType:'application/json',body:JSON.stringify(body)});
    });
    await page.goto(base + 'resilience.html?classroom=1&mission=camel', {waitUntil:'load'});
    await page.locator('#live-code').fill('0001000012');
    await page.locator('#live-join').click();
    await page.waitForURL('**/resilience.html?classroom=1&group=7&mission=camel', {timeout: 9000});
    await page.locator('[data-class-open="0"]').click();
    assert.match(await page.locator('.classroom-welcome').innerText(), /۷[\s\S]*۴/,
      'national ID identifies the assigned group and member in the guided classroom');
    await page.goto(base + 'claims-workshop-v2.html', {waitUntil:'load'});
    await page.goto(base + 'claims-presentation.html', {waitUntil:'load'});
    await page.locator('#slide h2').waitFor();
    assert.equal(await page.getByText('مسیر آموزش').count(), 0);
    assert.equal(await page.getByText('یک نمایش منسجم برای هر سه بخش کارگاه').count(), 0);
    assert.equal(await page.getByText('Instructor Presentation').count(), 0);
    assert.equal(await page.locator('#source-status').isVisible(), false, 'no normal online status badge');
    assert.match(await page.locator('#trail').innerText(), /تاب‌آوری/);
    assert.match(await page.locator('#slide h2').innerText(), /اگر فردا/);
    assert.equal(await page.locator('#slide .slide-media img').count(), 1, 'visual storytelling should include a verified art asset');
    await page.waitForFunction(() => { const img=document.querySelector('#slide .slide-media img');return img?.complete && img.naturalWidth>0;}, null, {timeout:10000});
    assert(await page.locator('#slide .slide-media img').evaluate(img => img.complete && img.naturalWidth > 0), 'professional resilience editorial photo should load');
    assert.equal(await page.locator('#module-nav img.module-thumb').count(), 4, 'all modules must have editorial images');
    assert.equal(await page.locator('#slide .narrative-overline').count(), 1, 'narrative must open with a clear numbered scene');
    assert.equal(await page.locator('#slide .challenge-box').count(), 1, 'opening scenario must include challenge questions');
    assert.equal(await page.locator('#module-nav button').count(), 4);
    const firstSlideCount = await page.locator('#slide-nav button').count();
    assert(firstSlideCount >= 12, 'resilience has a complete lesson and scenario list');
    assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
      'presentation has no horizontal page overflow at ' + width);
    assert.equal(await page.locator('#instructor-notes').isHidden(), true,
      'notes are hidden in public projection view');
    await page.locator('#notes-toggle').click();
    assert.equal(await page.locator('#instructor-notes').isVisible(), true);
    await page.locator('#notes-toggle').click();
    assert.equal(await page.locator('#instructor-notes').isHidden(), true);
    await page.locator('#module-nav [data-module="anger"]').click();
    assert.match(await page.locator('#trail').innerText(), /خشم/);
    assert.equal(await page.locator('#slide .slide-media img').count(), 1);
    await page.waitForFunction(() => { const img=document.querySelector('#slide .slide-media img');return img?.complete && img.naturalWidth>0;}, null, {timeout:10000});
    assert(await page.locator('#slide .slide-media img').evaluate(img => img.complete && img.naturalWidth > 0), 'anger section photo must load');
    assert(await page.locator('#slide-nav button').count() >= 12, 'anger module includes scenarios and quizzes');
    await page.locator('#slide-nav button:has-text("سناریو")').first().click();
    assert.equal(await page.locator('#slide .diagnosis').count(), 0, 'no answer key may be visible at case entry');
    assert.equal(await page.locator('#slide .narrative-overline').count(), 1, 'case starts with the story and situation');
    assert.equal(await page.locator('#slide .hook-question').count(), 1, 'case includes instructor hook');
    for (let j = 0; j < 6; j++) await page.locator('#reveal').click();
    assert.equal(await page.locator('#slide .crisis-moment').count(), 1, 'new information/turning point must appear');
    assert.equal(await page.locator('#slide .diagnosis').count(), 0, 'no early answer disclosure');
    await page.locator('#reveal').click();
    assert.equal(await page.locator('#slide .decision-list .answer').count(), 3, 'all decision options visible before analysis');
    assert.equal(await page.locator('#slide .diagnosis').count(), 0, 'choices must not leak solution');
    for(let j=0;j<3;j++){
      await page.locator('#reveal').click();
      assert.equal(await page.locator('#slide .option-breakdown').count(),1, 'independent option feedback');
      assert.equal(await page.locator('#slide .diagnosis').count(),1, 'one explanation at a time');
      assert.equal(await page.locator('#slide .option-breakdown .answer').count(),1,'only one option is analyzed per step');
    }
    await page.locator('#reveal').click();
    assert.equal(await page.locator('#slide .facilitated-debrief').count(),1,'case ends with debrief, not just story');
    assert((await page.locator('#slide .facilitated-debrief li').count())>=3,'case includes substantive debrief questions');
    assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),'no horizontal overflow in case steps');
    await page.locator('#module-nav [data-module="assertiveness"]').click();
    assert.match(await page.locator('#trail').innerText(), /جرأت‌ورزی/);
    await page.locator('#module-nav [data-module="resilience"]').click();
    await page.locator('#reveal').click();
    await page.locator('#reveal').click();
    assert.equal(await page.locator('#slide .strategy-matrix .matrix-cell').count(),4,'scientifically defined four-strategy diagram');
    await page.locator('#module-nav [data-module="capstone"]').click();
    assert.match(await page.locator('#slide h2').innerText(), /روز پرتلاطم|مأموریت|خسارت/);
    assert.equal(await page.locator('#slide .hook-question').count(),1,'integrated capstone requires problem framing');
    await page.screenshot({path: dest + '/presentation-' + width + '.png', fullPage: true});
    // Once the published source has been seen, a local-only backup can render it.
    await page.route('**/claims-workshop-v2.html', route => route.abort('internetdisconnected'));
    await page.goto(base + 'claims-presentation.html', {waitUntil: 'load'});
    await page.locator('#slide h2').waitFor();
    assert.match(await page.locator('#source-status').innerText(), /نسخه ذخیره‌شده/);
    assert.equal(errors.length, 0, 'no uncaught browser errors: ' + errors.join('; '));
    console.log('PASS 4-STRATEGY ENTRY + EDITORIAL presentation width=' + width + ' RTL, approved poster/assets, 3 modules, narrative, 4-strategy matrix, deferred answer reasoning, debrief, lecturer notes, offline cache, integration');
    await ctx.close();
  }
  await browser.close();
  server.close();
})().catch(err => { console.error(err); server.close(); process.exit(1); });
