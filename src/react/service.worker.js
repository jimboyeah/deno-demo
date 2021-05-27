console.log("service.worker.js installed");
/* 
Service Worker 更新要遵循以下步骤:

- 更新您的服务工作线程 JavaScript 脚本文件。 
- 用户导航至您的站点时，浏览器会尝试在后台重新下载脚本文件，比较前后两个版本有差异则更新执行。
- 新 Service Worker 将会启动，且将会触发 install 事件。
- 此时，旧 Service Worker 仍控制着当前页面，因此新 Service Worker 将进入 waiting 状态。
- 当网站上当前打开的页面关闭时，旧 Service Worker 将会被终止，新 Service Worker 将会取得控制权。
- 新 Service Worker 取得控制权后，将会触发其 activate 事件。
*/
var CACHE_NAME = 'my-site-cache-v1';
var urlsToCache = [
  '/',
  '/service_worker.html',
  '/service.worker.js',
];

// 通过 Service Worker 缓存目标资源
self.addEventListener('install', function(event) {
  console.log("Perform install steps")
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(function(cache) {
        console.log('Opened cache', urlsToCache);
        return cache.addAll(urlsToCache);
      })
  );
});

// 通过 Service Worker 返回一个缓存的响应
self.addEventListener('fetch', function(event) {
  event.respondWith(
    caches.match(event.request)
      .then(function(response) {
        console.log("Cache hit - return response")
        if (response) {
          return response;
        }
        return cacheFetch(event);
        // return fetch(event.request);
      }
    )
  );
});

function cacheFetch(event){
  // IMPORTANT:Clone the request. A request is a stream and
  // can only be consumed once. Since we are consuming this
  // once by cache and once by the browser for fetch, we need
  // to clone the response.
  var fetchRequest = event.request.clone();
  console.log("try Cache", event)

  return fetch(fetchRequest).then(
    function(response) {
      // Check if we received a valid response
      if(!response || response.status !== 200 || response.type !== 'basic') {
        return response;
      }

      // IMPORTANT:Clone the response. A response is a stream
      // and because we want the browser to consume the response
      // as well as the cache consuming the response, we need
      // to clone it so we have two streams.
      var responseToCache = response.clone();

      caches.open(CACHE_NAME)
        .then(function(cache) {
          cache.put(event.request, responseToCache);
        });

      return response;
    }
  );
}