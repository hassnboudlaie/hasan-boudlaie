/* Sensitive candidate data must NEVER be cached by a service worker. */
const CACHE='trm-workspace-shell-v1-unique-2026';
const ASSETS=['/static/style.css','/static/app.js','/static/icon.svg','/static/icon-192.png','/static/icon-512.png','/manifest.webmanifest'];
self.addEventListener('install',event=>{event.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)));self.skipWaiting();});
self.addEventListener('activate',event=>{event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('trm-workspace-')&&k!==CACHE).map(k=>caches.delete(k)))));self.clients.claim();});
self.addEventListener('fetch',event=>{
 const req=event.request;const url=new URL(req.url);
 if(req.method!=='GET'||url.origin!==location.origin||url.pathname.startsWith('/api/')||url.pathname==='/')return;
 if(ASSETS.includes(url.pathname))event.respondWith(caches.match(req).then(cached=>cached||fetch(req)));
});