/* ---------- 啟動 ---------- */
(function (F) {
    'use strict';
    var TOTAL = 3, BUILTIN_TIMEOUT = 3000, done = 0, readyFired = false;

    /* 每完成一個階段派發 fahhh:progress;全部完成(含失敗)後只派發一次 fahhh:ready,然後才開始閒置解碼 */
    function step() {
        if (done >= TOTAL) return;
        done++;
        document.dispatchEvent(new CustomEvent('fahhh:progress', { detail: { done: done, total: TOTAL } }));
        if (done === TOTAL && !readyFired) {
            readyFired = true;
            document.dispatchEvent(new Event('fahhh:ready'));
            idle(decodeNext);
        }
    }

    function idle(fn) {
        if (window.requestIdleCallback) window.requestIdleCallback(fn, { timeout: 2000 });
        else setTimeout(fn, 50);
    }

    /* 自訂音效:一次只解碼一個,完成後再排下一個;已被 play()/上傳插隊解碼過的(F.buf 有值或為 null)自動略過 */
    function decodeNext() {
        var next = null;
        for (var i = 0; i < F.custom.length; i++) {
            if (F.buf[F.custom[i].id] === undefined) { next = F.custom[i]; break; }
        }
        if (!next) return;
        var p;
        try { p = F.loadBuf(next); } catch (e) { return; }
        if (!p || !p.then) return;
        p.then(function () { if (F.buf[next.id] === undefined) F.buf[next.id] = null; idle(decodeNext); });
    }

    F.onLang(function () { F.renderList(); F.renderMenu(); });
    document.addEventListener('contextmenu', function (e) { e.preventDefault(); });
    F.renderList(); F.renderMenu();

    /* 階段 3:內建音效解碼(失敗或逾時 3000ms 也算完成) */
    (function () {
        var fin = false, t;
        function ok() { if (fin) return; fin = true; clearTimeout(t); step(); }
        t = setTimeout(ok, BUILTIN_TIMEOUT);
        var ps = [];
        F.BUILTIN.forEach(function (s) {
            try { var p = F.loadBuf(s); if (p && p.then) ps.push(p); } catch (e) { }
        });
        Promise.all(ps).then(ok, ok);
    })();

    /* 階段 1:開啟資料庫並讀出自訂音效;階段 2:清單與選單第一次完整渲染 */
    F.openDB().then(function (d) { F.db = d; return F.dbAll(); }).catch(function () { return []; }).then(function (rows) {
        F.custom = (rows || []).sort(function (a, b) { return a.id < b.id ? -1 : 1; });
        var ids = F.all().map(function (s) { return s.id; });
        F.eq = F.eq.filter(function (x) { return ids.indexOf(x) > -1; });
        step();
        try { F.renderList(); F.renderMenu(); } finally { step(); }
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
