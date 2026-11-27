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
const bmcHtml=read("business-model-canvas/studio.html");
const bmcJs=read("business-model-canvas/studio.js");
assert.match(bmcHtml,/class="progress dashboard-progress" role="progressbar"/,"BMC progress semantics missing");
assert.match(bmcHtml,/studio\.js\?v=12/,"BMC fresh script version missing");
assert.match(bmcJs,/setAttribute\('aria-valuenow'/,"BMC accessible progress should follow actual data");
const clinic=read("clinic-customer-app/sw.js");
assert.match(clinic,/keys\.filter\(k=>k\.startsWith\(PREFIX\)&&k!==CACHE\)/,"Unsafe cross-app CacheStorage deletion");
const hub=read("hub/index.html");
assert.match(hub,/impeccable\.css\?v=20261115/);
assert.match(hub,/superResultCount/);
assert.ok(hub.indexOf('id="superDirectory"')<hub.indexOf('class="site-shortcuts"'),"Application catalog must precede secondary website shortcuts");
assert.match(hub,/id="superReset"/,"Search empty state recovery missing");
for(const token of ['id="hubQuickAccess"','id="hubPinnedList"','id="hubRecentList"','id="hubClearRecents"','data-super-filter="pinned"'])
 assert.ok(hub.includes(token),"Quick access flow missing: "+token);
const descriptions=[...hub.matchAll(/<a class="super-app-link"[^>]*>[\s\S]*?<small data-en="([^"]+)" data-fa="([^"]+)"/g)];
assert.equal(descriptions.length,29,"Each app needs one task-oriented description");
assert.equal(descriptions.filter(x=>x[1]==="Open independent app").length,0,"Generic app descriptions are not actionable");
for(const token of ['hb-hub-saved-apps-v1','hb-hub-recent-apps-v1','hub-quick-link','aria-pressed','replaceChildren','const valid=values=>'])
 assert.ok(read("hub/catalog.js").includes(token),"Safe local-only quick access missing "+token);

assert.match(hub,/catalog\.js\?v=6/,"Hub must load deep-audit search");
const search=read("hub/catalog.js");
for(const token of ["normalize('NFKC')","replace(/[يى]/g","replace(/ك/g","superReset","menu-toggle","Escape"])
 assert.ok(search.includes(token),"Hub search/navigation regression: "+token);
const parastoo=read("ba-parastoo/index.html");
for(const token of ['id="mobileNavToggle"','id="mobileNav"','class="skip-link"','modalReturnFocus','setMobileNav'])
 assert.ok(parastoo.includes(token),"Ba Parastoo mobile/focus flow missing "+token);
const links=[...hub.matchAll(/<a class="super-app-link" href="([^"]+)"/g)].map(m=>m[1]);
assert.equal(links.length,29,"HB Hub must preserve all 29 directory entries");
assert.equal(new Set(links).size,29,"Hub has duplicate entries");
assert.equal([...hub.matchAll(/<section class="super-group" data-group="([^"]+)"/g)].length,6);
let internal=0,external=0;
for(const url of links){
 if(url.startsWith("https://")){external++;continue}
 assert.ok(url.startsWith("../"),"Unexpected app href "+url);
 const rel=url.slice(3),dest=rel.endsWith("/")?rel+"index.html":rel;
 assert.ok(fs.existsSync(path.join(ROOT,dest)),"Missing app "+url);
 internal++;
}
assert.equal(internal,26);assert.equal(external,3);
for(const excluded of ["ob-mba-classroom/index.html","sabanaft/app/index.html",
"alborz-communication-skills/index.html"]){
 assert.ok(!read(excluded).includes("hb-impeccable-shared.css"),"Protected app modified: "+excluded);
}
const hubSw=read("hub/sw.js");
for(const asset of ["../experience.css?v=2.0","../experience.js?v=2.1",
"./impeccable.css?v=20261115","../assets/fonts/Vazirmatn.woff2"])
 assert.ok(hubSw.includes(asset),"Hub offline cache missing "+asset);
console.log("PASS: 29 app links, 6 groups, 10 local app entrypoints, 9 offline shells, protected exclusions.");
