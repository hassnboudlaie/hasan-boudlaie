const CACHE_NAME="clinic-mohammadhossein-v1";
const CORE=["./","./index.html","./style.css?v=1","./app.js?v=1","./manifest.webmanifest","./icon.svg","./icon-192.png","./icon-512.png"];
self.addEventListener("install",event=>{event.waitUntil(caches.open(CACHE_NAME).then(cache=>cache.addAll(CORE)));self.skipWaiting()});
self.addEventListener("activate",event=>{event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>key.startsWith("clinic-mohammadhossein-")&&key!==CACHE_NAME).map(key=>caches.delete(key)))).then(()=>self.clients.claim()))});
self.addEventListener("fetch",event=>{const request=event.request,url=new URL(request.url);
if(request.method!=="GET"||url.origin!==self.location.origin||!url.pathname.startsWith("/hasan-boudlaie/clinic-mohammadhossein/"))return;
event.respondWith(fetch(request).then(response=>{if(response.ok){const copy=response.clone();caches.open(CACHE_NAME).then(cache=>cache.put(request,copy))}return response}).catch(()=>caches.match(request).then(cached=>cached||(request.mode==="navigate"?caches.match("./index.html"):Response.error()))))});