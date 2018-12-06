importScripts('js/cache-polyfill.js');

var CACHE_NAME = 'app-v1';
var CACHE_FILES = [
  '/',
  'images/background.jpeg',
  'js/app.js',
  'css/styles.css'
];


self.addEventListener('install', function (event) {
  event.waitUntil(
    // 安装前缓存内容
    // caches.open(CACHE_NAME)
    //   .then(function (cache) {
    //     console.log('Opened cache');
    //     return cache.addAll(CACHE_FILES);
    //   })

    // 安装阶段跳过等待，直接进入 active
    self.skipWaiting()
  );
});

self.addEventListener('activate', function (event) {
  event.waitUntil(
    Promise.all([
      // 更新客户端
      clients.claim(),
      // 清理旧版本
      caches.keys().then(cacheList => Promise.all(
        cacheList.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            caches.delete(cacheName);
          }
        })
      ))
    ])
  )
});

self.addEventListener('fetch', function (event) {
  event.respondWith(
    caches.match(event.request).then(function(res){
      if(res){
        return res;
      }
      requestBackend(event);
    })
  )
});

function requestBackend(event){
  var url = event.request.clone();
  return fetch(url).then(function(res){
    // 在资源请求成功后，将要缓存的资源加入缓存列表
    if(!res || res.status !== 200 || res.type !== 'basic'){
      return res;
    }

    var response = res.clone();

    caches.open(CACHE_NAME).then(function(cache){
      cache.put(event.request, response);
    });

    return res;
  }).catch(() => {
    // 获取失败，离线资源降级替换
    offlineRequest(event);
  })
}

function offlineRequest(request) {
  // 使用离线图片
  if (request.url.match(/\.(png|git|jpg|jpeg)/i)) {
    return caches.match('/images/background.png');
  }
  // 使用离线页面
  if (request.url.match(/.html$/)) {
    return caches.match('/');
  }
}