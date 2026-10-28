const CACHE='my-finance-preview-20261028-cloud-sync-v4';
const ASSETS=['./','./index.html','./manifest.webmanifest','./icon-v2.svg'];
self.addEventListener('install',event=>{
 event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(ASSETS)).then(()=>self.skipWaiting()));
});
self.addEventListener('activate',event=>{
 event.waitUntil(caches.keys().then(keys=>Promise.all(
  keys.filter(key=>key.startsWith('my-finance-preview-')&&key!==CACHE).map(key=>caches.delete(key))
 )).then(()=>self.clients.claim()));
});
self.addEventListener('fetch',event=>{
 if(event.request.method!=='GET')return;
 const url=new URL(event.request.url);
 if(url.origin!==self.location.origin)return;
 const isBrandAsset=url.pathname.endsWith('/manifest.webmanifest')||url.pathname.endsWith('/icon.svg')||url.pathname.endsWith('/icon-v2.svg');
 const isNavigation=event.request.mode==='navigate';
 if(isNavigation){
  event.respondWith(fetch(event.request).then(response=>{
   if(response.ok){const copy=response.clone();caches.open(CACHE).then(cache=>cache.put('./index.html',copy));}
   return response;
  }).catch(()=>caches.match('./index.html')));
 }else if(isBrandAsset){
  event.respondWith(fetch(event.request).catch(()=>caches.match(event.request)));
 }else{
  event.respondWith(caches.match(event.request).then(cached=>cached||fetch(event.request)));
 }
});
