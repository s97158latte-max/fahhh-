'use strict';
var CACHE = 'fahhh-v1';
var ASSETS = [
    './', 'index.html', 'manifest.json',
    'css/base.css', 'css/dock.css', 'css/characters.css',
    'js/audio.js', 'js/list.js', 'js/main.js', 'js/menu.js', 'js/sounds.js', 'js/storage.js', 'js/upload.js', 'js/util.js',
    'audio/fahhh.m4a',
    'images/edgedeploy-horizontal-blue.png', 'images/wjA.png', 'images/wjB.png',
    'icons/icon-192.png', 'icons/icon-512.png', 'icons/apple-touch-icon.png', 'icons/favicon.png', 'icons/favicon.ico'
];

self.addEventListener('install', function (e) {
    e.waitUntil(caches.open(CACHE).then(function (c) { return c.addAll(ASSETS); }).then(function () { return self.skipWaiting(); }));
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
    e.respondWith(
        caches.match(req, { ignoreSearch: true }).then(function (hit) {
            if (hit) return hit;
            return fetch(req).catch(function () {
                if (req.mode === 'navigate') return caches.match('index.html');
                return Response.error();
            });
        })
    );
});
