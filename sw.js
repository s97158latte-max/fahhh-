'use strict';
/*
 * Service Worker：stale-while-revalidate（先回傳快取、背景更新）。
 *
 * 什麼時候要把 CACHE 版本號加一（fahhh-v1 -> fahhh-v2）？
 *   只有「預快取清單 / 路徑結構」改變時：新增、刪除、改名檔案，或調整 CORE_ASSETS / OPTIONAL_ASSETS。
 *   版本號一變，activate 會刪掉舊版快取並重新預快取。
 * 一般內容更新（修改既有檔案的內容）「不需要」改版本號：
 *   使用者開啟頁面時會先看到快取版本，同時背景抓取新版並更新快取，下次開啟即為新版。
 *   SW 更新快取後不會自動重整頁面。
 */
var CACHE = 'fahhh-v1';

// 核心：任何一個失敗都讓 install 失敗（瀏覽器之後會重試）。
var CORE_ASSETS = [
    './', 'index.html',
    'css/base.css', 'css/boot.css', 'css/dock.css', 'css/characters.css', 'css/tour.css',
    'js/audio.js', 'js/boot.js', 'js/fonts.js', 'js/feedback.js', 'js/hints.js', 'js/i18n.js', 'js/list.js', 'js/main.js', 'js/keys.js', 'js/menu.js', 'js/sounds.js', 'js/storage.js', 'js/tour.js', 'js/upload.js', 'js/util.js'
];

// 盡力而為：失敗不影響 install，之後被請求時會由 fetch 流程補進快取。
var OPTIONAL_ASSETS = [
    'manifest.json',
    'audio/fahhh.m4a',
    'images/edgedeploy-horizontal-blue.png', 'images/edgedeploy-horizontal-white.png', 'images/wjA.png', 'images/wjB.png',
    'icons/logo.svg', 'icons/icon-192.png', 'icons/icon-512.png', 'icons/icon-maskable-192.png', 'icons/icon-maskable-512.png', 'icons/apple-touch-icon.png', 'icons/favicon.png', 'icons/favicon.ico'
];

// 快取鍵去掉 query/hash，配合 ignoreSearch 讓同一資源只有一份。
function cacheKey(url) {
    var u = new URL(url);
    return u.origin + u.pathname;
}

self.addEventListener('install', function (e) {
    e.waitUntil(caches.open(CACHE).then(function (c) {
        var core = Promise.all(CORE_ASSETS.map(function (a) { return c.add(a); }));
        var optional = Promise.all(OPTIONAL_ASSETS.map(function (a) { return c.add(a).catch(function () {}); }));
        return Promise.all([core, optional]);
    }).then(function () { return self.skipWaiting(); }));
});

self.addEventListener('activate', function (e) {
    e.waitUntil(caches.keys().then(function (keys) {
        return Promise.all(keys.filter(function (k) { return k !== CACHE; }).map(function (k) { return caches.delete(k); }));
    }).then(function () { return self.clients.claim(); }));
});

self.addEventListener('fetch', function (e) {
    var req = e.request;
    if (req.method !== 'GET') return;
    var url = new URL(req.url);
    if (url.origin !== self.location.origin) return; // 跨網域（Google Fonts 等）不攔截、不快取

    // 背景抓網路版本，成功（200 且 basic）才寫入快取；失敗回傳 null。
    var network = fetch(req).then(function (res) {
        if (res && res.status === 200 && res.type === 'basic') {
            var copy = res.clone();
            return caches.open(CACHE).then(function (c) { return c.put(cacheKey(req.url), copy); })
                .catch(function () {}).then(function () { return res; });
        }
        return res;
    }).catch(function () { return null; });

    // 讓背景更新不被中止（必須在事件處理期間同步呼叫）。
    e.waitUntil(network);

    e.respondWith(
        caches.match(req, { ignoreSearch: true }).then(function (hit) {
            if (hit) return hit;
            return network.then(function (res) {
                if (res) return res;
                if (req.mode === 'navigate') {
                    return caches.match('index.html').then(function (h) { return h || Response.error(); });
                }
                return Response.error();
            });
        })
    );
});
