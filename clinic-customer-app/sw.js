/* Clinic customer app: scoped offline shell; never deletes another app's CacheStorage. */
const PREFIX="clinic-customer-app-",CACHE=PREFIX+"v3-impeccable-20261114";
const SCOPE=new URL(self.registration.scope);
const ASSETS=["./","./index.html","./app.css?v=2","./app.js?v=2","./manifest.webmanifest?v=2","./icon-192.svg","./icon-512.svg",
"../hb-impeccable-shared.css?v=20261114","../ob-mba-classroom/assets/fonts/Vazirmatn.woff2"];
const ALLOWED=new Set(ASSETS.map(x=>new URL(x,SCOPE).pathname));
self.addEventListener("install",e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS.map(x=>new URL(x,SCOPE).href))).then(()=>self.skipWaiting())));
self.addEventListener("activate",e=>e.waitUntil(Promise.all([caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith(PREFIX)&&k!==CACHE).map(k=>caches.delete(k)))),self.clients.claim()])));
self.addEventListener("fetch",e=>{
 const req=e.request,u=new URL(req.url);
 if(req.method!=="GET"||u.origin!==SCOPE.origin||req.headers.has("Authorization")||u.pathname.includes("/api/"))return;
 const inScope=u.pathname.startsWith(SCOPE.pathname);
 if(!inScope&&!ALLOWED.has(u.pathname))return;
 if(req.mode==="navigate"){
  if(!inScope)return;
  e.respondWith(fetch(req).catch(async()=>await caches.match(req,{ignoreSearch:true})||await caches.match(new URL("./index.html",SCOPE).href)||Response.error()));
  return;
 }
 e.respondWith(fetch(req).then(res=>{if(res.ok){const copy=res.clone();e.waitUntil(caches.open(CACHE).then(c=>c.put(req,copy)));}return res;}).catch(async()=>await caches.match(req,{ignoreSearch:true})||Response.error()));
});
