const CACHE='my-finance-release-20261029r46';
const ASSETS=['./','./index.html','./premium.css?v=20261029r32','./dashboard-r33.css?v=20261029r33','./voice-entry.js?v=20261029r42','./transaction-history.js?v=20261029r43','./commitments.js?v=20261028r4','./loans.js?v=20261029r46','./reports.js?v=20261028r6','./receivables-actions.js?v=20261028r5','./supabase-sync.js?v=20261029r43','./install-prompt.js?v=20261029r2','./manifest.webmanifest?v=10','./icon-v3.svg?v=20261028r1','./icon-maskable-v3.svg?v=20261028r1','./icon-192-r4.png','./icon-512-r4.png','./icon-maskable-512-r4.png','./admin.html','./contracts.html','./assets.html'];
self.addEventListener('install',event=>event.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)).then(()=>self.skipWaiting())));
self.addEventListener('activate',event=>event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('my-finance-')&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',event=>{
 if(event.request.method!=='GET')return;
 const url=new URL(event.request.url);if(url.origin!==self.location.origin)return;
 if(event.request.mode==='navigate'){
  // Cache each public app shell URL separately; never replace the index with an admin/asset page.
  const basePath=new URL('./',self.registration.scope).pathname;
  const isHome=url.pathname===basePath||url.pathname===basePath+'index.html';
  event.respondWith(fetch(event.request).then(r=>{
   if(r.ok)caches.open(CACHE).then(c=>c.put(event.request,r.clone()));
   return r;
  }).catch(async()=>await caches.match(event.request)||(isHome?await caches.match('./index.html'):Response.error())));return;
 }
 const revalidate=url.pathname.endsWith('/manifest.webmanifest')||url.pathname.endsWith('.svg')||url.pathname.endsWith('.js')||url.pathname.endsWith('.css');
 if(revalidate){
  event.respondWith(fetch(event.request).then(r=>{if(r.ok)caches.open(CACHE).then(c=>c.put(event.request,r.clone()));return r}).catch(()=>caches.match(event.request)));return;
 }
 event.respondWith(caches.match(event.request).then(r=>r||fetch(event.request)));
});