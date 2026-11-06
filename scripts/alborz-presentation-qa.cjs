
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
    assert.match(await page.locator('#slide h2').innerText(), /تاب‌آوری/);
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
    assert.match(await page.locator('#slide h2').innerText(), /خشم/);
    assert(await page.locator('#slide-nav button').count() >= 12, 'anger module includes scenarios and quizzes');
    await page.locator('#slide-nav button:has-text("سناریو")').first().click();
    assert.equal(await page.getByText('تحلیل تک‌تک گزینه‌ها').count(), 0,
      'answer reasons must stay hidden initially');
    for (let j = 0; j < 5; j++) await page.locator('#reveal').click();
    assert.equal(await page.getByText('تحلیل تک‌تک گزینه‌ها').count(), 1,
      'complete reasons become visible by deliberate reveal');
    assert.equal(await page.locator('#slide .answer.correct').count(), 1);
    assert.equal(await page.locator('#slide .answer.weak').count(), 2);
    await page.locator('#module-nav [data-module="assertiveness"]').click();
    assert.match(await page.locator('#slide h2').innerText(), /جرأت‌ورزی/);
    await page.locator('#module-nav [data-module="capstone"]').click();
    assert.match(await page.locator('#slide h2').innerText(), /روز پرتلاطم|مأموریت|خسارت/);
    await page.screenshot({path: dest + '/presentation-' + width + '.png', fullPage: true});
    // Once the published source has been seen, a local-only backup can render it.
    await page.route('**/claims-workshop-v2.html', route => route.abort('internetdisconnected'));
    await page.goto(base + 'claims-presentation.html', {waitUntil: 'load'});
    await page.locator('#slide h2').waitFor();
    assert.match(await page.locator('#source-status').innerText(), /نسخه ذخیره‌شده/);
    assert.equal(errors.length, 0, 'no uncaught browser errors: ' + errors.join('; '));
    console.log('PASS presentation width=' + width + ' RTL, 3 modules, sources, progressive reveal, lecturer notes, offline cache, integration');
    await ctx.close();
  }
  await browser.close();
  server.close();
})().catch(err => { console.error(err); server.close(); process.exit(1); });
