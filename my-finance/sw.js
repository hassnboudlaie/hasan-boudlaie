const CACHE='my-finance-release-20261030r66';
const ASSETS=['./','./index.html','./my-finance-ui-v54.css?v=20261030r66','./navigation-v60.css?v=20261030r63','./drilldown-v61.css?v=20261030r63','./drilldown-v61.js?v=20261030r63','./embed-v60.css?v=20261030r60','./embed-nav-v60.js?v=20261030r60','./mobile-polish-v58.css?v=20261030r63','./mobile-dock-v58.js?v=20261030r60','./admin-ui-v58.css?v=20261030r58','./brand-mark-v57.svg?v=20261030r57','./app-update-v53.js?v=20261029r53','./subpages-v51.css?v=20261029r52','./subpage-auth-v51.js?v=20261029r51','./voice-entry.js?v=20261029r42','./transaction-history.js?v=20261030r63','./commitments.js?v=20261029r53','./loans.js?v=20261029r51','./reports.js?v=20261028r6','./receivables-actions.js?v=20261028r5','./supabase-sync.js?v=20261030r66','./install-prompt.js?v=20261030r63','./manifest.webmanifest?v=10','./icon-v3.svg?v=20261028r1','./icon-maskable-v3.svg?v=20261028r1','./icon-192-r4.png','./icon-512-r4.png','./icon-maskable-512-r4.png','./admin.html','./contracts.html','./assets.html'];
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