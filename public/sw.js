const cacheName = 'pwa-cache-v1';
const staticAssets = [
  '/',
  '/views/login.html',
  '/views/user.html',
  '/views/admin.html',
  '/css/styles.css',
  '/js/login.js',
  '/js/user.js',
  '/js/admin.js',
  '/manifest.json',
  '/images/icon-192.png',
  '/images/icon-512.png'
];

// Install event: cache all static assets for offline use
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(cacheName).then(cache => cache.addAll(staticAssets))
  );
  console.log('Service Worker installed');
});

// Activate event: clean up old caches if any
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.filter(key => key !== cacheName).map(key => caches.delete(key))
      );
    })
  );
  console.log('Service Worker activated');
});

// Fetch event: serve cached content when offline or network fails
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  event.respondWith(
    caches.match(event.request).then(cachedResponse => {
      return cachedResponse || fetch(event.request).then(response => {
        // We can optionally cache new requests here if desired
        return response;
      });
    })
  );
});
