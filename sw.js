const CACHE_NAME = 'sakura-cache-v2'; // 升级版本号，清空旧缓存

self.addEventListener('install', event => {
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) return caches.delete(cacheName);
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  // 忽略非 GET 请求及第三方跨域接口
  if (event.request.method !== 'GET' || !event.request.url.startsWith(self.location.origin)) {
    return;
  }

  // 判断是否是 HTML、JS 或 CSS（需频繁更新的代码）
  const isCode = ['script', 'style'].includes(event.request.destination) || 
                 event.request.headers.get('accept')?.includes('text/html');

  if (isCode) {
    // 【网络优先】：先拿最新的，断网了再用缓存
    event.respondWith(
      fetch(event.request)
        .then(networkResponse => {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, responseToCache));
          return networkResponse;
        })
        .catch(() => caches.match(event.request))
    );
  } else {
    // 【缓存优先】：图片、字体、音乐等静态资源，直接走缓存
    event.respondWith(
      caches.match(event.request).then(cachedResponse => {
        return cachedResponse || fetch(event.request).then(networkResponse => {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, responseToCache));
          return networkResponse;
        });
      })
    );
  }
});