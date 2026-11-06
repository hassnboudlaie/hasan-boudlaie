
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
    assert.equal(await page.locator('a[href="./claims-presentation.html"]').count(), 1,
      'course homepage links to presentation');
    await page.locator('a[href="./claims-presentation.html"]').click();
    await page.locator('#slide h2').waitFor();
    assert.match(await page.locator('#trail').innerText(), /تاب‌آوری/);
    assert.match(await page.locator('#slide h2').innerText(), /اگر فردا/);
    assert.equal(await page.locator('#slide .slide-media img').count(), 1, 'visual storytelling should include a verified art asset');
    assert(await page.locator('#slide .slide-media img').evaluate(img => img.complete && img.naturalWidth > 0), 'approved resilience poster should load');
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
    console.log('PASS EDITORIAL presentation width=' + width + ' RTL, approved poster/assets, 3 modules, narrative, 4-strategy matrix, deferred answer reasoning, debrief, lecturer notes, offline cache, integration');
    await ctx.close();
  }
  await browser.close();
  server.close();
})().catch(err => { console.error(err); server.close(); process.exit(1); });
