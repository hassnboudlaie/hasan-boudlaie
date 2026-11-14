"use strict";
/* HB Hub ecosystem: objective source-integrity checks. No user data accessed. */
const assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path");
const ROOT=path.resolve(__dirname,"..");
const read=p=>fs.readFileSync(path.join(ROOT,p),"utf8");
const targets=[
"okr-system/index.html","okr-service/index.html","business-model-canvas/studio.html",
"small-business/index.html","trm-workspace/index.html","clinic-customer-app/index.html",
"ba-parastoo/index.html","rf-holding/index.html","life-organization/index.html","my-finance/index.html"];
const serviceWorkers=["okr-system","okr-service","business-model-canvas","small-business",
"trm-workspace","clinic-customer-app","rf-holding","life-organization","my-finance"];
const shared=read("hb-impeccable-shared.css");
assert.match(shared,/assets\/fonts\/Vazirmatn\.woff2/);
assert.ok(fs.statSync(path.join(ROOT,"assets/fonts/Vazirmatn.woff2")).size>100000);
for(const entry of targets){
 const html=read(entry);
 assert.match(html,/data-hb-impeccable="1"/,entry+" missing design opt-in");
 assert.match(html,/hb-impeccable-shared\.css\?v=20261114/,entry+" stylesheet missing");
 assert.match(html,/<html[^>]*lang="fa"[^>]*dir="rtl"/,entry+" RTL regression");
}
for(const dir of serviceWorkers){
 const sw=read(dir+"/sw.js");
 assert.ok(sw.includes("hb-impeccable-shared.css?v=20261114"),dir+" missing CSS precache");
 assert.ok(sw.includes("Vazirmatn.woff2"),dir+" missing font precache");
}
const clinic=read("clinic-customer-app/sw.js");
assert.match(clinic,/keys\.filter\(k=>k\.startsWith\(PREFIX\)&&k!==CACHE\)/,"Unsafe cross-app CacheStorage deletion");
const hub=read("hub/index.html");
assert.match(hub,/impeccable\.css\?v=20261114/);
assert.match(hub,/superResultCount/);
assert.match(hub,/id="superReset"/,"Search empty state recovery missing");
assert.match(hub,/catalog\.js\?v=4/,"Hub must load deep-audit search");
const search=read("hub/catalog.js");
for(const token of ["normalize('NFKC')","replace(/[يى]/g","replace(/ك/g","superReset","menu-toggle","Escape"])
 assert.ok(search.includes(token),"Hub search/navigation regression: "+token);
const parastoo=read("ba-parastoo/index.html");
for(const token of ['id="mobileNavToggle"','id="mobileNav"','class="skip-link"','modalReturnFocus','setMobileNav'])
 assert.ok(parastoo.includes(token),"Ba Parastoo mobile/focus flow missing "+token);
const links=[...hub.matchAll(/<a class="super-app-link" href="([^"]+)"/g)].map(m=>m[1]);
assert.equal(links.length,21,"HB Hub must preserve all 21 entries");
assert.equal(new Set(links).size,21,"Hub has duplicate entries");
assert.equal([...hub.matchAll(/<section class="super-group" data-group="([^"]+)"/g)].length,5);
let internal=0,external=0;
for(const url of links){
 if(url.startsWith("https://")){external++;continue}
 assert.ok(url.startsWith("../"),"Unexpected app href "+url);
 const rel=url.slice(3),dest=rel.endsWith("/")?rel+"index.html":rel;
 assert.ok(fs.existsSync(path.join(ROOT,dest)),"Missing app "+url);
 internal++;
}
assert.equal(internal,17);assert.equal(external,4);
for(const excluded of ["ob-mba-classroom/index.html","sabanaft/app/index.html",
"alborz-communication-skills/index.html"]){
 assert.ok(!read(excluded).includes("hb-impeccable-shared.css"),"Protected app modified: "+excluded);
}
const hubSw=read("hub/sw.js");
for(const asset of ["../experience.css?v=2.0","../experience.js?v=2.0",
"./impeccable.css?v=20261114","../assets/fonts/Vazirmatn.woff2"])
 assert.ok(hubSw.includes(asset),"Hub offline cache missing "+asset);
console.log("PASS: 21 app links, 5 groups, 10 local app entrypoints, 9 offline shells, protected exclusions.");
