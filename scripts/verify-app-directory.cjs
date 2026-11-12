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
const entries=[...products.matchAll(/<article class="app-card"[^>]*>[\s\S]*?<\/article>/g)].map(m=>m[0]);
const hubEntries=[...hub.matchAll(/<a class="super-app-link"[^>]*>/g)].map(m=>m[0]);
assert.equal(hubEntries.length,entries.length-1,'HB Hub must contain every product except its own launcher');

assert.ok(entries.length>=22,'The website should list the new MBA classroom in addition to the existing catalog');
function card(href){
 const matches=entries.filter(s=>s.includes('href="'+href+'"'));
 assert.equal(matches.length,1,'One catalog card must point to '+href);
 return matches[0];
}
const expected=[
 ['OB MBA Classroom','ob-mba-classroom/','organization','ob-mba-classroom/index.html'],
 ['Alborz Training Discovery','alborz-training-system-discovery/','organization','alborz-training-system-discovery/index.html'],
 ['TRM','trm-workspace/','organization','trm-workspace/index.html'],
 ['OKR Kish','okr-system/','strategy','okr-system/index.html'],
 ['Saba Naft','sabanaft/app/','organization','sabanaft/app/index.html'],
 ['Behparvar','https://hassnboudlaie.github.io/behparvar-leadership-lab/','organization',null],
 ['My Finance','my-finance/','personal','my-finance/index.html'],
 ['Life Org','life-organization/','personal','life-organization/index.html'],
 ['Alborz Academy','alborz-communication-skills/','organization','alborz-communication-skills/index.html'],
 ['Clinic Customers','clinic-customer-app/','client','clinic-customer-app/index.html'],
 ['HB Hub','hub/','personal','hub/index.html'],
 ['Business Model Canvas','business-model-canvas/studio.html','business','business-model-canvas/studio.html'],
 ['Small Business','small-business/index.html','business','small-business/index.html'],
 ['Objectives / OKR Guide','okr-service/index.html','strategy','okr-service/index.html']
];
const hrefs=new Set();
for(const [name,href,category,target] of expected){
 const s=card(href),part=s.match(/\bdata-category="([^"]+)"/)?.[1]?.split(/\s+/)||[];
 assert.ok(part.includes(category),name+' is not under its proper catalog category '+category);
 assert.ok(!hrefs.has(href),'Duplicate target '+href);hrefs.add(href);
 if(target)assert.ok(fs.existsSync(path.join(root,target)),name+' link target is not in this repository: '+target);
}
for(const filt of ['all','organization','strategy','business','client','personal']){
 assert.ok(products.includes('data-filter="'+filt+'"'),'Missing discoverable filter: '+filt);
}
for(const route of ['../ob-mba-classroom/','../alborz-training-system-discovery/','../okr-system/','../trm-workspace/','../sabanaft/app/','../business-model-canvas/studio.html','../small-business/index.html','../okr-service/index.html','../alborz-communication-skills/','../clinic-customer-app/','../life-organization/','../my-finance/','../ba-parastoo/','../alborz-performance/my-branch/','../alborz-performance/','../sabanaft/leadership-studio.html','https://hassnboudlaie.github.io/afra-tejarat-mad/','https://hassnboudlaie.github.io/reflective-leader/','https://hassnboudlaie.github.io/naavsanat-culture-app/','https://hassnboudlaie.github.io/behparvar-leadership-lab/']){
 assert.ok(hub.includes('href="'+route+'"'),'The HB Hub must still link to '+route);
}
assert.ok(products.includes('Independent interactive OKR pilot: strategy map'),'OKR product must be explicitly described as functional local pilot');
assert.ok(products.includes('data-en="Interactive public pilot"'),'strategy category describes public pilot');
assert.ok(hub.includes('superDirectory'),'Super App must group all independent applications');
assert.ok(hub.includes('catalog.js?v=2'),'Super App searchable directory script is linked');
assert.ok(!hub.includes('app not yet released'),'Super App must not advertise released OKR as future guide');
assert.ok(products.includes('href="hub/"'),'HB Hub must be independently discoverable in full catalog');
assert.ok(products.includes('href="okr-service/index.html"'),'General OKR must open its own app path');
assert.ok(products.includes('data-category="strategy" data-search="OKR'),'General OKR belongs to Strategy');
assert.ok(products.includes('data-category="business" data-search="Business Model Canvas'),'BMC belongs to Business Consulting');
assert.ok(products.includes('data-category="business" data-search="Small Business'),'Small Business belongs to Business Consulting');
assert.ok(read('index.html').includes('href="okr-service/index.html"'),'Main website Strategy section must link directly to public OKR');
assert.ok(read('okr-consulting.html').includes('href="okr-service/index.html"'),'Strategic service landing must open functional OKR');
assert.ok(read('strategic-management/index.html').includes("../okr-service/index.html"),'Strategic Management section must expose OKR product');
assert.ok(read('downloads/install.html').includes('نصب اپ OKR'),'Install directory must present actual OKR app, not service guide');
assert.ok(read('okr-service/index.html').includes('./model.js?v=2'),'Independent OKR model is linked');
assert.ok(read('okr-service/sw.js').includes("hb-public-okr-service-"),'Independent OKR app cache namespace is unique');
assert.ok(read('hub/manifest.webmanifest').includes("Super App"),'Hub identity clarifies the super app role');
assert.equal((hub.match(/data-kind="strategy"/g)||[]).length,2,'Public OKR and Kish OKR are two distinct Strategy entries');
assert.equal(hub.split('href="../okr-system/"').length-1,1,'Kish destination remains unmodified and unique inside Super App');

assert.ok(read('ob-mba-classroom/app.js').includes('Array.from({length:16}'),'OB classroom must start with 16 unpopulated sessions');
assert.ok(read('ob-mba-classroom/index.html').includes('dir="rtl"'),'OB classroom must be RTL');
console.log('PASS: existing 12 installed apps remain mapped, classroom present, and all '+hubEntries.length+' independent products are listed in Super App.');
