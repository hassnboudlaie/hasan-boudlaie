const CACHE="rf-holding-shell-v5-impeccable-20261114";
const ASSETS=["./","./index.html","./style.css?v=20261111.10","./kish-theme.css?v=20261111.10","./i18n.js?v=20261111.10","./app.js?v=20261111.10","./icon.svg","./manifest.webmanifest"];
const HB_EXTRA=['../hb-impeccable-shared.css?v=20261114','../ob-mba-classroom/assets/fonts/Vazirmatn.woff2'];
const HB_PATHS=new Set(HB_EXTRA.map(p=>new URL(p,self.registration.scope).pathname));
self.addEventListener("install",e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll([...ASSETS,...HB_EXTRA])).then(()=>self.skipWaiting())));
self.addEventListener("activate",e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith("rf-holding-shell-")&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener("fetch",e=>{const u=new URL(e.request.url);if(e.request.method!=="GET"||u.origin!==location.origin||(!u.pathname.startsWith(new URL(self.registration.scope).pathname)&&!HB_PATHS.has(u.pathname)))return;e.respondWith(fetch(e.request).then(r=>{if(r.ok){const clone=r.clone();caches.open(CACHE).then(c=>c.put(e.request,clone)).catch(()=>{});}return r;}).catch(()=>caches.match(e.request)));});