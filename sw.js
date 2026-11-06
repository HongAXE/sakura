const CACHE_NAME = 'sakura-cache-v1';
// 这里改成了相对路径，确保本地和线上都能找到
const STATIC_ASSETS = [
  './static/fonts/Zpix.woff2',
  './static/image/sakura.png'
];

// 1. 安装：预缓存核心资源，并立刻跳过等待
self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      // 如果某些资源暂时找不到（比如路径错了），不阻塞整个安装过程
      return Promise.allSettled(
        STATIC_ASSETS.map(url => cache.add(url).catch(err => console.warn('预缓存失败:', url)))
      );
    })
  );
});

// 2. 激活：清理掉之前旧版本的缓存
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// 3. 拦截请求
self.addEventListener('fetch', event => {
  // 忽略非 GET 请求，以及网易云音乐等跨域接口
  if (event.request.method !== 'GET' || event.request.url.includes('music.163.com')) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then(cachedResponse => {
      // 如果在缓存中找到了，直接返回缓存
      if (cachedResponse) {
        return cachedResponse;
      }
      // 如果没找到，发起网络请求
      return fetch(event.request).then(networkResponse => {
        // 只缓存同源（你自己的网站）的成功请求
        if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
          return networkResponse;
        }
        // 把新请求到的资源（比如封面图、CSS、JS）动态加入缓存
        const responseToCache = networkResponse.clone();
        caches.open(CACHE_NAME).then(cache => {
          cache.put(event.request, responseToCache);
        });

        return networkResponse;
      }).catch(() => {
        // 网络请求失败时的兜底（可选）
      });
    })
  );
});
