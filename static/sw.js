const CACHE_NAME = 'sakura-v1';
const STATIC_ASSETS = [
  '/sakura/static/fonts/Zpix.woff2',
  '/sakura/static/music/music.mp3',
  '/sakura/static/image/sakura.png'
  // ... 其他需要缓存的资源
];

// 安装时预缓存关键资源
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(STATIC_ASSETS))
  );
  self.skipWaiting();
});

// 拦截请求，优先从缓存读取
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(cached => {
      return cached || fetch(event.request);
    })
  );
});