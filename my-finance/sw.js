const CACHE='my-finance-release-20261028r8';
const ASSETS=['./','./index.html','./premium.css?v=20261028r5','./commitments.js?v=20261028r3','./reports.js?v=20261028r5','./receivables-actions.js?v=20261028r5','./supabase-sync.js?v=20261028r6','./manifest.webmanifest?v=7','./icon-v2.svg?v=20261028r3','./icon-maskable.svg?v=20261028r3'];
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