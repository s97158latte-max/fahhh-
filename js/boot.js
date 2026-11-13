'use strict';
/*
 * 載入畫面控制（同步載入於 <head>，極小、不依賴其他腳本）。
 * 沒有 JS 時不會加上 html.booting，載入畫面的 CSS 永遠不顯示。
 * 收起條件（全部成立）：DOMContentLoaded、字型就緒(或 2000ms)、fahhh:ready(後備：load 後再等 4000ms)、
 * 已顯示至少 700ms（同 session 再次載入 300ms）；絕對上限 3500ms 強制收起。
 */
(function () {
    var d = document, root = d.documentElement, win = window;
    var MSGS = {
        zh: ['載入迷因中…', 'FAHHH 還在路上 (╥﹏╥)', '再等一下下…'],
        en: ['Loading memes…', 'FAHHH is on the way (╥﹏╥)', 'Hold on a sec…']
    };
    var SR = { zh: '載入中', en: 'Loading' };
    var MIN_FIRST = 700, MIN_REPEAT = 300, FONT_MAX = 2000, READY_FALLBACK = 4000, HARD_MAX = 3500;
    var ROTATE = 900, STAMP = 260, FADE = 200;

    var lang = (function () {
        try {
            var v = localStorage.getItem('fahhh_lang');
            if (v === 'en') return 'en';
        } catch (e) { }
        return 'zh';
    })();

    var repeat = false;
    try { repeat = !!sessionStorage.getItem('fahhh_booted'); } catch (e) { }

    root.classList.add('booting');
    root.setAttribute('aria-busy', 'true');

    var st = { dcl: false, fonts: false, ready: false, min: false, done: false };
    var timers = [], rotateId = null, mo = null, idx = 0, lastPct = 0;

    function later(fn, ms) { var id = setTimeout(fn, ms); timers.push(id); return id; }
    function $(id) { return d.getElementById(id); }

    function showMsg(i) {
        var m = $('bootMsg');
        if (!m) return;
        m.textContent = MSGS[lang][i % MSGS[lang].length];
        m.className = 'msg';
        void m.offsetWidth; // 重新觸發淡入
        m.className = 'msg in';
    }

    // overlay 在 body 最前面；解析到時就填入文案，避免先出現空白再閃字
    var inited = false;
    function init() {
        if (inited || st.done) return;
        var m = $('bootMsg');
        if (!m) return;
        inited = true;
        if (mo) { mo.disconnect(); mo = null; }
        var sr = $('bootSr');
        if (sr) sr.textContent = SR[lang];
        showMsg(0);
        rotateId = setInterval(function () { showMsg(++idx); }, ROTATE);
    }
    if (typeof MutationObserver === 'function') {
        mo = new MutationObserver(init);
        mo.observe(d, { childList: true, subtree: true });
    }

    function setFill(pct) {
        var f = $('bootFill');
        if (!f) return;
        var b = $('bootBar');
        if (b) b.classList.remove('ind');
        f.style.width = pct + '%';
    }

    function onProgress(e) {
        var dt = e && e.detail;
        if (!dt || !(dt.total > 0)) return;
        var p = Math.max(0, Math.min(1, dt.done / dt.total)) * 100;
        if (p < lastPct) p = lastPct; // 只前進不倒退
        lastPct = p;
        setFill(p);
    }

    function cleanup() {
        var el = $('boot');
        if (el && el.parentNode) el.parentNode.removeChild(el);
        root.classList.remove('booting');
        root.removeAttribute('aria-busy');
        d.dispatchEvent(new Event('fahhh:booted'));
    }

    function finish() {
        if (st.done) return;
        st.done = true;
        for (var i = 0; i < timers.length; i++) clearTimeout(timers[i]);
        timers = [];
        if (rotateId !== null) { clearInterval(rotateId); rotateId = null; }
        if (mo) { mo.disconnect(); mo = null; }
        d.removeEventListener('fahhh:progress', onProgress);
        d.removeEventListener('fahhh:ready', onReady);
        try { sessionStorage.setItem('fahhh_booted', '1'); } catch (e) { }
        var el = $('boot');
        if (!el) { cleanup(); return; }
        setFill(100);
        var reduced = false;
        try { reduced = !!(win.matchMedia && win.matchMedia('(prefers-reduced-motion: reduce)').matches); } catch (e) { }
        function out() {
            el.className += ' out';
            setTimeout(cleanup, FADE);
        }
        if (reduced) { out(); }
        else {
            el.className += ' stamping';
            setTimeout(out, STAMP);
        }
    }

    function check() {
        if (st.dcl && st.fonts && st.ready && st.min) finish();
    }
    function onReady() { st.ready = true; check(); }

    d.addEventListener('fahhh:progress', onProgress);
    d.addEventListener('fahhh:ready', onReady);

    // (a) DOMContentLoaded
    if (d.readyState === 'loading') {
        d.addEventListener('DOMContentLoaded', function () { st.dcl = true; init(); check(); });
    } else { st.dcl = true; }

    // (b) 字型（逾時 2000ms）
    later(function () { st.fonts = true; check(); }, FONT_MAX);
    try {
        if (d.fonts && d.fonts.ready) d.fonts.ready.then(function () { st.fonts = true; check(); }, function () { st.fonts = true; check(); });
        else st.fonts = true;
    } catch (e) { st.fonts = true; }

    // (c) fahhh:ready 後備：window load 之後最多再等 4000ms
    function armFallback() { later(function () { st.ready = true; check(); }, READY_FALLBACK); }
    if (d.readyState === 'complete') armFallback();
    else win.addEventListener('load', armFallback);

    // (d) 最短顯示時間
    later(function () { st.min = true; check(); }, repeat ? MIN_REPEAT : MIN_FIRST);

    // 絕對上限
    later(finish, HARD_MAX);
})();
