/* ---------- 電腦版鍵盤快捷鍵:已釘選音效依序對應 1~0、Q~P(最多 20 個) ---------- */
(function (F) {
    'use strict';
    var KEYS = '1234567890QWERTYUIOP';
    var CODES = {};
    KEYS.split('').forEach(function (k, i) { CODES[/\d/.test(k) ? 'Digit' + k : 'Key' + k] = i; });

    /* 已釘選(F.eq)的音效,依 F.all() 順序,取前 20 個;即時計算,清單怎麼變都不會過期 */
    function pinned() {
        return F.all().filter(function (s) { return F.eq.indexOf(s.id) > -1; }).slice(0, KEYS.length);
    }

    /* 第 index 個已釘選音效對應的按鍵字元;超出範圍回傳 '' */
    F.keyFor = function (index) { return index >= 0 && index < KEYS.length ? KEYS[index] : ''; };

    /* 同步清單列的按鍵提示與 aria-keyshortcuts(列順序與 F.all() 一致) */
    F.renderKeys = function () {
        var rows = F.$('#list').children, all = F.all(), ids = pinned().map(function (s) { return s.id; });
        for (var i = 0; i < rows.length && i < all.length; i++) {
            var k = F.keyFor(ids.indexOf(all[i].id)), kbd = rows[i].querySelector('.key'), p = rows[i].querySelector('.play');
            if (kbd) kbd.textContent = k;
            if (p) { if (k) p.setAttribute('aria-keyshortcuts', k); else p.removeAttribute('aria-keyshortcuts'); }
        }
    };

    function shown(el) {
        if (!el || !el.getBoundingClientRect) return false;
        var r = el.getBoundingClientRect(), vh = window.innerHeight || 0;
        return r.width > 0 && r.height > 0 && r.bottom > 0 && r.top < vh;
    }

    /* 視覺回饋用的元素:清單列播放鈕(可見時) > 輪狀選單對應項 > 右下角 fab > body */
    function target(s, n) {
        var all = F.all(), rows = F.$('#list').children, row = rows[all.indexOf(s)];
        var p = row && row.querySelector('.play');
        if (shown(p)) return p;
        var it = F.$('#ring').children[n];
        if (shown(it)) return it;
        var fab = F.$('#fab');
        return shown(fab) ? fab : document.body;
    }

    function typing(el) {
        if (!el || !el.tagName) return false;
        if (el.isContentEditable) return true;
        var tag = el.tagName;
        if (tag === 'TEXTAREA' || tag === 'SELECT') return true;
        if (tag === 'INPUT') return !/^(checkbox|radio|button|submit|reset|file|range|image|color)$/i.test(el.type || 'text');
        return !!(el.closest && el.closest('[contenteditable]:not([contenteditable="false"])'));
    }

    document.addEventListener('keydown', function (e) {
        if (e.ctrlKey || e.metaKey || e.altKey || e.repeat || e.isComposing) return;
        var n = CODES[e.code];
        if (n === undefined) return;
        if (document.documentElement.classList.contains('booting')) return;
        if (typing(e.target) || typing(document.activeElement)) return;
        var s = pinned()[n];
        if (!s) return;
        F.play(s, target(s, n));
    });
})(window.Fahhh);
