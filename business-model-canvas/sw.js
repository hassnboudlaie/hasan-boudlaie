'use strict';
const PREFIX='hb-bmc-independent-', CACHE=PREFIX+'20261104-dropdown-v1';
const BASE=new URL('./',self.registration.scope);
const CORE=['./','./index.html','./studio.html','./studio.css','./choice-bank.js','./studio.js','./manifest.webmanifest','./icon.svg','./icon-192.png','./icon-512.png'];
self.addEventListener('install',event=>event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(CORE.map(path=>new URL(path,BASE).href))).then(()=>self.skipWaiting())));
self.addEventListener('activate',event=>event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>(k.startsWith(PREFIX)&&k!==CACHE)||k.startsWith('bmc-studio-demo-')).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',event=>{const req=event.request;
 if(req.method!=='GET'||!req.url.startsWith(BASE.href))return;
 if(new URL(req.url).origin!==BASE.origin)return;
 if(req.mode==='navigate'){event.respondWith(fetch(req).then(res=>{if(res.ok){const copy=res.clone();event.waitUntil(caches.open(CACHE).then(c=>c.put(req,copy)))}return res}).catch(async()=>await caches.match(req,{ignoreSearch:true})||await caches.match(new URL('./studio.html',BASE).href)||Response.error()));return}
 event.respondWith(fetch(req).then(res=>{if(res.ok){const copy=res.clone();event.waitUntil(caches.open(CACHE).then(c=>c.put(req,copy)))}return res}).catch(async()=>await caches.match(req,{ignoreSearch:true})||Response.error()));
});
