/* The Life Organization v0.7.0 Life Architecture + Guided Journey service worker */
const CACHE="life-org-fun-strategic-choices-v082-20261120";
const ASSETS=["./","./index.html","./styles.css?v=0.1.2","./brand.css?v=life-architecture-1","./book1.css?v=0.2.0","./book1-journey.css?v=0.3.0","./book1-matrices.css?v=0.5.0","./book1-complete.css?v=0.7.0","./fun-choices.css?v=0.8.2","./book1-content.js?v=0.2.0","./book1-part2-content.js?v=0.4.0","./book1-chapters-20261120.js?v=0.5.0","./book1-chapter11-20261120.js?v=0.6.0","./book1-complete-20261120.js?v=0.7.0","./book1-ui.js?v=0.7.0","./book1-journey.js?v=0.7.0","./book1-matrices.js?v=0.7.0","./book1-complete-ui.js?v=0.7.0","./fun-choices-data.js?v=0.8.0","./fun-choices-images.js?v=0.8.1","./fun-choices.js?v=0.8.2","./app.js?v=0.8.0","./brand-symbol.svg","./icon.svg?v=life-architecture-1","./icon-192.png?v=life-architecture-1","./icon-512.png?v=life-architecture-1","./maskable-512.png?v=life-architecture-1","./manifest.webmanifest?v=life-architecture-1"];
const HB_EXTRA=['../hb-impeccable-shared.css?v=20261114','../assets/fonts/Vazirmatn.woff2'];
const HB_PATHS=new Set(HB_EXTRA.map(p=>new URL(p,self.registration.scope).pathname));
self.addEventListener("install",event=>{
  event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll([...ASSETS,...HB_EXTRA])).then(()=>self.skipWaiting()));
});
self.addEventListener("activate",event=>{
  event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith("life-org-")&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));
});
self.addEventListener("fetch",event=>{
  const req=event.request;
  if(req.method!=="GET"||new URL(req.url).origin!==self.location.origin||(!new URL(req.url).pathname.startsWith(new URL(self.registration.scope).pathname)&&!HB_PATHS.has(new URL(req.url).pathname)))return;
  if(req.mode==="navigate"){
    event.respondWith(fetch(req).then(res=>{if(res.ok){const copy=res.clone();caches.open(CACHE).then(cache=>cache.put("./index.html",copy))}return res}).catch(()=>caches.match("./index.html")));
    return;
  }
  event.respondWith(caches.match(req).then(cached=>cached||fetch(req)));
});