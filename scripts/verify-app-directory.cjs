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
const entries=[...products.matchAll(/<article class="app-card"\b[^>]*>[\s\S]*?<\/article>/g)].map(m=>m[0]);
assert.equal(entries.length,20,'The website should list all 20 current cards including HB Hub');
function card(href){
 const matches=entries.filter(s=>s.includes('href="'+href+'"'));
 assert.equal(matches.length,1,'One catalog card must point to '+href);
 return matches[0];
}
const expected=[
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
for(const route of ['../okr-system/','../trm-workspace/','../sabanaft/app/','../business-model-canvas/studio.html','../small-business/index.html','../okr-service/index.html','../alborz-communication-skills/','../clinic-customer-app/','../life-organization/','../my-finance/']){
 assert.ok(hub.includes('href="'+route+'"'),'The HB Hub must still link to '+route);
}
assert.ok(products.includes('The general-purpose OKR application is not yet available.'),'OKR guide must not be presented as completed general-purpose system');
assert.ok(products.includes('href="hub/"'),'HB Hub must be independently discoverable in full catalog');
console.log('PASS: 12 screenshot-distinct apps mapped to site; 11 internal entrypoints exist, Behparvar external repo verified separately; categories and hub routes correct.');
