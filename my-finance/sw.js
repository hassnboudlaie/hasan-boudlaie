const CACHE='my-finance-release-20261029r7';
const ASSETS=['./','./index.html','./premium.css?v=20261029r7','./voice-entry.js?v=20261029r7','./transaction-history.js?v=20261029r6','./commitments.js?v=20261028r4','./loans.js?v=20261028r2','./reports.js?v=20261028r6','./receivables-actions.js?v=20261028r5','./supabase-sync.js?v=20261029r6','./manifest.webmanifest?v=9','./icon-v3.svg?v=20261028r1','./icon-maskable-v3.svg?v=20261028r1','./icon-192-r4.png','./icon-512-r4.png','./icon-maskable-512-r4.png','./admin.html','./contracts.html','./assets.html'];
self.addEventListener('install',event=>event.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)).then(()=>self.skipWaiting())));
self.addEventListener('activate',event=>event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('my-finance-')&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',event=>{
 if(event.request.method!=='GET')return;
 const url=new URL(event.request.url);if(url.origin!==self.location.origin)return;
 if(event.request.mode==='navigate'){
  event.respondWith(fetch(event.request).then(r=>{if(r.ok)caches.open(CACHE).then(c=>c.put('./index.html',r.clone()));return r}).catch(()=>caches.match('./index.html')));return;
 }
 const revalidate=url.pathname.endsWith('/manifest.webmanifest')||url.pathname.endsWith('.svg')||url.pathname.endsWith('.js')||url.pathname.endsWith('.css');
 if(revalidate){
  event.respondWith(fetch(event.request).then(r=>{if(r.ok)caches.open(CACHE).then(c=>c.put(event.request,r.clone()));return r}).catch(()=>caches.match(event.request)));return;
 }
 event.respondWith(caches.match(event.request).then(r=>r||fetch(event.request)));
});