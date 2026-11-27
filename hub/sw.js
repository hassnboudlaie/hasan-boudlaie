/* HB Hub v3. Offline shell only; no child-app API, state or navigation interception. */
const NAME='hb-executive-hub-shell-v7-20261127';
const FILES=['./','./index.html','./catalog.css?v=2','./catalog.js?v=6','./impeccable.css?v=20261115','./icon.svg','./icon-192.png','./icon-512.png','./manifest.webmanifest?v=1',
'../discovery.css?v=1','../experience.css?v=2.0','../experience.js?v=2.1','../assets/fonts/Vazirmatn.woff2'];
const SCOPE=new URL(self.registration.scope);
const ALLOWED=new Set(FILES.map(p=>new URL(p,SCOPE).pathname));
self.addEventListener('install',event=>event.waitUntil(caches.open(NAME).then(cache=>cache.addAll(FILES.map(p=>new URL(p,SCOPE).href))).then(()=>self.skipWaiting())));
self.addEventListener('activate',event=>event.waitUntil(Promise.all([
 caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('hb-executive-hub-shell-')&&k!==NAME).map(k=>caches.delete(k)))),
 self.clients.claim()
])));
self.addEventListener('fetch',event=>{
 const req=event.request,url=new URL(req.url);
 if(req.method!=='GET'||url.origin!==SCOPE.origin)return;
 const inHub=url.pathname.startsWith(SCOPE.pathname);
 if(req.mode==='navigate'){
  if(!inHub)return;
  event.respondWith(fetch(req).catch(()=>caches.match(new URL('./index.html',SCOPE).href)));
  return;
 }
 if(!inHub&&!ALLOWED.has(url.pathname))return;
 event.respondWith(caches.match(req,{ignoreSearch:true}).then(hit=>hit||fetch(req)));
});
