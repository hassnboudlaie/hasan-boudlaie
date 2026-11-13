/* The Life Organization v0.2.1 Life Architecture service worker */
const CACHE="life-org-brand-v021";
const ASSETS=["./","./index.html","./styles.css?v=0.1.2","./brand.css?v=life-architecture-1","./book1.css?v=0.2.0","./book1-content.js?v=0.2.0","./book1-ui.js?v=0.2.0","./app.js?v=0.2.0","./brand-symbol.svg","./icon.svg?v=life-architecture-1","./icon-192.png","./icon-512.png","./maskable-512.png","./manifest.webmanifest?v=life-architecture-1"];
self.addEventListener("install",event=>{
  event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(ASSETS)).then(()=>self.skipWaiting()));
});
self.addEventListener("activate",event=>{
  event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith("life-org-")&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));
});
self.addEventListener("fetch",event=>{
  const req=event.request;
  if(req.method!=="GET"||new URL(req.url).origin!==self.location.origin)return;
  if(req.mode==="navigate"){
    event.respondWith(fetch(req).then(res=>{if(res.ok){const copy=res.clone();caches.open(CACHE).then(cache=>cache.put("./index.html",copy))}return res}).catch(()=>caches.match("./index.html")));
    return;
  }
  event.respondWith(caches.match(req).then(cached=>cached||fetch(req)));
});