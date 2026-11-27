const CACHE='ob-mba-classroom-shell-v69';
const FILES=['./index.html','./style.css?v=21','./access-gate.js?v=45','./access-gate.css?v=2','./icon.svg'];
self.addEventListener('install',event=>{event.waitUntil(caches.open(CACHE).then(cache=>Promise.allSettled(FILES.map(path=>cache.add(new Request(path,{cache:'reload'}))))).then(()=>self.skipWaiting()))});
self.addEventListener('activate',event=>{event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('ob-mba-classroom-')&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
const APP_SCOPE=new URL(self.registration.scope);
self.addEventListener('fetch',event=>{
 if(event.request.method!=='GET')return;
 const url=new URL(event.request.url);
 if(url.origin!==APP_SCOPE.origin||!url.pathname.startsWith(APP_SCOPE.pathname))return;
 // Participation needs a live authenticated API; never serve an obsolete cached shell.
 if(url.pathname.endsWith('/participation.html')||url.pathname.endsWith('/participation.js')){
  event.respondWith(fetch(event.request,{cache:'no-store'}));return;
 }
 event.respondWith(fetch(event.request,{cache:'no-cache'}).then(r=>{
  if(r.ok){const copy=r.clone();caches.open(CACHE).then(c=>c.put(event.request,copy)).catch(()=>{})}
  return r;
 }).catch(()=>caches.match(event.request).then(hit=>hit||Response.error())));
});