// sw.js (示例)
const CACHE_NAME = 'event-pwa-cache-v1';
const urlsToCache = [
  '/',
  '/login.html',
  '/user.html',
  '/admin.html',
  '/public/css/style.css',
  '/public/js/admin.js',
  '/public/js/user.js',
  '/manifest.json'
  // ...你需要缓存的其他文件
];

// 监听install事件，缓存所需文件
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(urlsToCache);
    })
  );
});

// 监听fetch事件，使用缓存
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      // 如果有缓存则返回缓存，否则fetch
      return response || fetch(event.request);
    })
  );
});
