/* Screenshot-to-website app directory regression.
 * Distinct installed launchers: 12; Kish OKR is duplicated on the phone, not the site.
 * All routes checked without accessing or modifying any app data.
 */
'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const products=read('products.html'),hub=read('hub/index.html');
const hubEntries=[...hub.matchAll(/<a class="super-app-link" href="([^"]+)" data-kind="([^"]+)"/g)];
const categories=new Set([...products.matchAll(/href="hub\/#([^"]+)"/g)].map(match=>match[1]));
assert.equal(categories.size,6);
assert.deepEqual(categories,new Set(hubEntries.map(match=>match[2])));
assert.equal(hubEntries.length,29);
assert.equal(new Set(hubEntries.map(match=>match[1])).size,hubEntries.length);
assert.ok(products.includes('id="questionnaires"'),'Preserve incoming needs-assessment links');
assert.ok(read('index.html').includes('href="advisory.html#interactive-learning"'),'Home must lead to interactive training');
assert.ok(read('cases.html').includes('href="hub/#alborz"'),'Alborz case must lead to its suite');
for(const route of ['../nekoufekr-hr/','../ob-mba-classroom/','../alborz-training-system-discovery/','../okr-system/','../trm-workspace/','../sabanaft/app/','../business-model-canvas/studio.html','../small-business/index.html','../okr-service/index.html','../alborz-communication-skills/','../clinic-customer-app/','../life-organization/','../my-finance/','../ba-parastoo/','../alborz-performance/my-branch/','../alborz-performance/','https://hassnboudlaie.github.io/afra-tejarat-mad/','https://hassnboudlaie.github.io/naavsanat-culture-app/','https://hassnboudlaie.github.io/behparvar-leadership-lab/']){
 assert.ok(hub.includes('href="'+route+'"'),'The HB Hub must still link to '+route);
}
assert.ok(hub.includes('superDirectory'),'Hub must group independent applications');
assert.ok(hub.includes('catalog.js?v=6'),'Hub directory script is linked');
assert.ok(products.includes('href="hub/"'),'Hub must be discoverable from products');
assert.ok(read('okr-consulting.html').includes('href="okr-service/index.html"'),'Strategic service landing must open functional OKR');
assert.ok(read('strategic-management/index.html').includes("../okr-service/index.html"),'Strategic Management section must expose OKR product');
assert.ok(read('downloads/install.html').includes('نصب اپ OKR'),'Install directory must present actual OKR app, not service guide');
assert.ok(read('okr-service/index.html').includes('./model.js?v=2'),'Independent OKR model is linked');
assert.ok(read('okr-service/sw.js').includes("hb-public-okr-service-"),'Independent OKR app cache namespace is unique');
assert.ok(read('hub/manifest.webmanifest').includes("Super App"),'Hub identity clarifies the super app role');
assert.equal(hub.split('href="../okr-system/"').length-1,1,'Kish destination remains unmodified and unique inside Super App');

assert.ok(read('ob-mba-classroom/app.js').includes('Array.from({length:16}'),'OB classroom must start with 16 unpopulated sessions');
assert.ok(read('ob-mba-classroom/index.html').includes('dir="rtl"'),'OB classroom must be RTL');
for(const stale of ['sabanaft/leadership-studio.html','hassnboudlaie.github.io/reflective-leader/']) {
 assert.ok(!hub.includes(stale),'Retired app present in Hub: '+stale);
 assert.ok(!products.includes(stale),'Retired app present in catalog: '+stale);
 assert.ok(!read('content.json').includes(stale),'Retired app present in source data: '+stale);
}
assert.ok(hub.includes('href="../sabanaft/app/"'),'Canonical Saba My Leadership Skills missing');
console.log('PASS: '+hubEntries.length+' canonical HB Hub apps; standalone leadership duplicates removed.');
