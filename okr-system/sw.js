/* Kish Ports & Airports OKR - strictly scoped static PWA cache (no API or user data). */
'use strict';
const PREFIX='kish-okr-pwa-';
const CACHE=PREFIX+'20261029-functional-v2';
const SCOPE=new URL('./',self.registration.scope);
const SHELL=new URL('index.html',SCOPE).href;
const CORE=['index.html','manifest.webmanifest','favicon.svg','icon-192.png','icon-512.png','pwa-maskable.svg',
  'assets/kish-pwa-install.js','assets/kish-auth.js','assets/kish-auth.css','assets/kish-entry.css','assets/kish-explore.js',
  'assets/kish-dashboards.js','assets/kish-explore-model.js','assets/kish-explore.css',
  'assets/kish-operational-20261025.js','assets/kish-operational-20261025.css',
  'assets/kish-strategy-map-20261025.js','assets/kish-strategy-map-20261025.css',
  'assets/kish-team-dashboard-20261025.js','assets/kish-team-dashboard-20261025.css',
  'assets/okr-visual-upgrade-20261023.css'];
self.addEventListener('install',event=>{
 event.waitUntil(caches.open(CACHE)
   .then(cache=>Promise.allSettled(CORE.map(path=>cache.add(new Request(new URL(path,SCOPE).href,{cache:'reload'})))))
   .then(()=>self.skipWaiting()));
});
self.addEventListener('activate',event=>{
 event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith(PREFIX)&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));
});
self.addEventListener('fetch',event=>{
 const req=event.request;
 if(req.method!=='GET'||!req.url.startsWith(SCOPE.href))return;
 const url=new URL(req.url);
 if(url.origin!==SCOPE.origin||url.pathname.includes('/api/')||url.pathname.includes('/auth/'))return;
 if(req.mode==='navigate'){
  event.respondWith(fetch(req).then(response=>{
   if(response.ok){const copy=response.clone();event.waitUntil(caches.open(CACHE).then(cache=>cache.put(req,copy)));}
   return response;
  }).catch(async()=>{
   const cached=await caches.match(req,{ignoreSearch:true});
   return cached||await caches.match(SHELL)||Response.error();
  }));
  return;
 }
 if(!/\.(?:js|css|svg|png|webp|woff2?|webmanifest)$/i.test(url.pathname))return;
 event.respondWith(fetch(req).then(response=>{
  if(response.ok&&response.type==='basic'){const copy=response.clone();event.waitUntil(caches.open(CACHE).then(cache=>cache.put(req,copy)));}
  return response;
 }).catch(()=>caches.match(req,{ignoreSearch:true}).then(hit=>hit||Response.error())));
});
