/* Scoped exclusively to /hasan-boudlaie/alborz-communication-skills/.
 * No shared cache names, site-root interception, or other app storage mutations. */
const CACHE_NAME = 'alborz-communication-academy-v2-20261115-s4-content-repair';
const CACHE_PREFIX = 'alborz-communication-academy-';
const SCOPE_PATH = new URL(self.registration.scope).pathname;
const SHELL = [
  './', './index.html', './session2-demo.html',
  // Session 3 and 4 HTML is routed from index.html; all JS must survive an offline reload.
  './session3-listening-lab.js?v=20261108-r6-six-roles',
  './session3-impeccable-journey.js?v=20261115-suite-r1',
  './session4-speaking-lab.js?v=20261112-content-audit2',
  './session4-final-quiz-data.js?v=20261112-r2-audited',
  './session4-final-exam.js?v=20261112-r2-6min',
  './session4-ob-mba-theme.js?v=20261115-session4-content-repair-r1',
  './session4-ob-mba-theme.css?v=20261114-impeccable-r1',
  './session4-mobile-first-20261115.css?v=1',
  './alborz-impeccable.css?v=20261115-suite-r1',
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
