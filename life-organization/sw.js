/* The Life Organization v0.1.1 service worker */
const CACHE="life-org-preview-v012";
const ASSETS=["./","./index.html","./styles.css?v=0.1.1","./app.js?v=0.1.1","./icon.svg","./manifest.webmanifest?v=20261029r2"];
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