/* Scoped exclusively to /hasan-boudlaie/alborz-communication-skills/.
 * No shared cache names, site-root interception, or other app storage mutations. */
const CACHE_NAME = 'alborz-communication-academy-v1-20261101';
const CACHE_PREFIX = 'alborz-communication-academy-';
const SCOPE_PATH = new URL(self.registration.scope).pathname;
const SHELL = [
  './', './index.html', './session2-demo.html',
  './manifest.webmanifest', './icon-192.png', './icon-512.png'
];
self.addEventListener('install', event => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_NAME);
    await Promise.allSettled(SHELL.map(path => cache.add(new URL(path, self.registration.scope))));
    await self.skipWaiting();
  })());
});
self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const names = await caches.keys();
    await Promise.all(names.filter(name => name.startsWith(CACHE_PREFIX) && name !== CACHE_NAME).map(name => caches.delete(name)));
    await self.clients.claim();
  })());
});
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin || !url.pathname.startsWith(SCOPE_PATH)) return;
  event.respondWith((async () => {
    const cache = await caches.open(CACHE_NAME);
    try {
      const response = await fetch(event.request);
      if (response.ok && response.type === 'basic') {
        await cache.put(event.request, response.clone()).catch(() => {});
      }
      return response;
    } catch (error) {
      const saved = await cache.match(event.request);
      if (saved) return saved;
      if (event.request.mode === 'navigate') {
        const offline = await cache.match(new URL('./index.html', self.registration.scope));
        if (offline) return offline;
      }
      throw error;
    }
  })());
});
