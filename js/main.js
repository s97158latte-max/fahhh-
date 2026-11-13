/* ---------- 啟動 ---------- */
(function (F) {
    'use strict';
    F.onLang(function () { F.renderList(); F.renderMenu(); });
    document.addEventListener('contextmenu', function (e) { e.preventDefault(); });
    F.renderList(); F.renderMenu(); F.BUILTIN.forEach(F.loadBuf);
    F.openDB().then(function (d) { F.db = d; return F.dbAll(); }).then(function (rows) {
        F.custom = rows.sort(function (a, b) { return a.id < b.id ? -1 : 1; });
        var ids = F.all().map(function (s) { return s.id; });
        F.eq = F.eq.filter(function (x) { return ids.indexOf(x) > -1; });
        F.renderList(); F.renderMenu(); F.custom.forEach(F.loadBuf);
    });
})(window.Fahhh);

/* ---------- PWA：註冊 service worker ---------- */
try {
    if ('serviceWorker' in navigator &&
        (location.protocol === 'https:' || location.hostname === 'localhost' || location.hostname === '127.0.0.1')) {
        window.addEventListener('load', function () {
            navigator.serviceWorker.register('sw.js').catch(function () { });
        });
    }
} catch (e) { }
