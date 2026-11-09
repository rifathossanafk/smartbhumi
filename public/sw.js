/**
 * SmartBhumi Service Worker v2
 * Network-first for fresh bundles, falls back to cache when offline.
 */

const CACHE_NAME = 'smartbhumi-shell-v2';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((k) => caches.delete(k))
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  // Let /api calls go through to server directly unless simulated airplane mode is on in client
  if (event.request.url.includes('/api/')) {
    return;
  }

  // Navigation requests: ALWAYS network-first so new bundles are never stale
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(() => caches.match('/index.html'))
    );
    return;
  }

  // Asset requests: network-first, fallback to cache
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        if (response.status === 200) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        }
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});
