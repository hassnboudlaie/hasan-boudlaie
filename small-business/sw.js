'use strict';
const CACHE='hb-small-business-independent-v1';
const PREFIX='hb-small-business-independent-';
const FILES=['./','./index.html','./style.css','./steps.js','./app.js','./manifest.webmanifest','./icon.svg','./icon-192.png','./icon-512.png'];
const BASE=new URL('./',self.registration.scope);
self.addEventListener('install',event=>{
 event.waitUntil(caches.open(CACHE).then(c=>c.addAll(FILES.map(f=>new URL(f,BASE).href))).then(()=>self.skipWaiting()));
});
self.addEventListener('activate',event=>{
 event.waitUntil(caches.keys().then(names=>Promise.all(names.filter(x=>x.startsWith(PREFIX)&&x!==CACHE).map(x=>caches.delete(x)))).then(()=>self.clients.claim()));
});
self.addEventListener('fetch',event=>{
 const req=event.request,u=new URL(req.url);
 if(req.method!=='GET'||u.origin!==BASE.origin||!u.pathname.startsWith(BASE.pathname))return;
 if(req.mode==='navigate'){
  event.respondWith(fetch(req).then(res=>{if(res.ok){const copy=res.clone();event.waitUntil(caches.open(CACHE).then(c=>c.put(req,copy)))}return res})
  .catch(async()=>await caches.match(req,{ignoreSearch:true})||await caches.match(new URL('./index.html',BASE).href)||Response.error()));return;
 }
 event.respondWith(fetch(req).then(res=>{if(res.ok){const copy=res.clone();event.waitUntil(caches.open(CACHE).then(c=>c.put(req,copy)))}return res})
  .catch(async()=>await caches.match(req,{ignoreSearch:true})||Response.error()));
});
