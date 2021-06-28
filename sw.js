const CACHE_STATIC_NAME = "static-v8";
const CACHE_DYNAMIC_NAME = "dynamic-v5";

self.addEventListener("install", event => {
  console.log("[Service Worker] 已安裝 Service Worker ...", event);

  // 使用cache api
  // 等caches完成才繼續
  event.waitUntil(
    caches.open(CACHE_STATIC_NAME).then(cache => {
      console.log("[Service Worker] 開始設置緩存");
      // 添加需要緩存的檔案
      cache.addAll([
        "/",
        "/css/icon-font.css",
        "/css/style.css",
        "/img/favicon.png"
      ]);
    })
  );
});

self.addEventListener("activate", event => {
  console.log("[Service Worker] 已激活 Service Worker ...", event);
  // 清除舊緩存
  event.waitUnitl(
    caches.keys().then(keyList => {
      return Promise.all(
        keyList.map(key => {
          // 如果目前緩存不符合動態緩存跟當前靜態緩存就刪除
          if (key !== CACHE_STATIC_NAME && key !== CACHE_DYNAMIC_NAME) {
            console.log("[Service Worker] 刪除就緩存 ", key);
            return caches.delete(key);
          }
        })
      );
    })
  );
  return self.clients.claim();
});

// 監聽所有的請求事件
self.addEventListener("fetch", event => {
  // console.log("[Servic Worker] 捕獲事件 ...", event);
  // 回應請求事件
  event.respondWith(
    // 使用已緩存檔案
    caches.match(event.request).then(response => {
      if (response) {
        return response;
      } else {
        // 動態緩存: 尚未儲存的資源與外部請求的資源在此抓出並緩存
        return fetch(event.request)
          .then(res => {
            return caches.open(CACHE_DYNAMIC_NAME).then(cache => {
              cache.put(event.request.url, res.clone());
              return res;
            });
          })
          .catch(err => console.log(err));
      }
    })
  );
});
