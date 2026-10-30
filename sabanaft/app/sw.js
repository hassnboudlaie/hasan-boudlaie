const CACHE="sabanaft-reflective-pwa-shell-v2",ASSETS=["./","./index.html","./app.css","./app.js","./manifest.webmanifest","../assets/sabanaft-logo.svg","../assets/sabanaft-site.webp","../assets/sabanaft-niayesh.webp","../assets/sabanaft-meeting.jpg","../assets/sabanaft-farmanieh.webp","../assets/vazirmatn.woff2","../reflective-content.js"];
self.addEventListener("install",e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)).then(()=>self.skipWaiting()))});
self.addEventListener("activate",e=>{e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith("sabanaft-reflective-pwa-shell-")&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener("fetch",e=>{if(e.request.method!=="GET")return;const u=new URL(e.request.url);if(u.origin!==location.origin)return;
if(e.request.mode==="navigate"){e.respondWith(fetch(e.request).then(r=>{const copy=r.clone();caches.open(CACHE).then(c=>c.put("./index.html",copy)).catch(()=>{});return r}).catch(()=>caches.match("./index.html")));return}
e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request)))});
