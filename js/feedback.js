/* 按下音效的視覺回饋:整頁輕微震動 + 音效名稱字泡。由 audio.js 的 play 呼叫 F.hit */
(function (F) {
    'use strict';
    var pop = null, popTimer = 0, shakeTimer = 0, flip = false, cur = null;

    function reduced() {
        try { return !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches); } catch (e) { return false; }
    }

    /* 震動掛在 <html> 的 class,由 CSS 只作用在非 fixed 的內容區塊,fixed 元素不受影響 */
    function shake() {
        var root = document.documentElement;
        if (reduced()) return;
        root.classList.remove('shake');
        void root.offsetWidth; /* 重新觸發動畫 */
        root.classList.add('shake');
        clearTimeout(shakeTimer);
        shakeTimer = setTimeout(function () { root.classList.remove('shake'); }, 200);
    }

    function removePop() {
        clearTimeout(popTimer);
        if (pop) { if (pop.parentNode) pop.parentNode.removeChild(pop); pop = null; }
    }

    /* 字泡放在被按元素上方,放不下改下方,再不行改左右;並夾在視窗內 */
    function place(b, el) {
        var r = el.getBoundingClientRect(), vw = document.documentElement.clientWidth, vh = window.innerHeight || 0;
        var w = b.offsetWidth, h = b.offsetHeight, M = 14, TOP = 54, gap = 8, x, y;
        x = r.left + r.width / 2 - w / 2; y = r.top - h - gap;
        if (y < TOP) y = r.bottom + gap;
        if (y + h > vh - M) {
            y = Math.max(TOP, Math.min(r.top + r.height / 2 - h / 2, vh - h - M));
            x = r.left - w - gap;
            if (x < M) x = r.right + gap;
        }
        x = Math.max(M, Math.min(x, vw - w - M));
        b.style.left = Math.round(x) + 'px';
        b.style.top = Math.round(y) + 'px';
    }

    function bubble(s, el) {
        removePop();
        var b = document.createElement('div');
        b.className = 'pop ' + ((flip = !flip) ? 'pa' : 'pb');
        b.setAttribute('aria-hidden', 'true');
        b.textContent = s.name;
        document.body.appendChild(b);
        place(b, el);
        pop = b;
        popTimer = setTimeout(removePop, 750);
    }

    /* 播放中狀態:同一時間只有一個;結束(計時或呼叫回傳的 end)或被下一個取代時移除 */
    function clearPlaying() {
        if (!cur) return;
        var c = cur; cur = null;
        clearTimeout(c.timer);
        c.node.classList.remove('playing');
        c.node.removeAttribute('aria-current');
    }
    function mark(el, ms) {
        clearPlaying();
        var node = (el.closest && el.closest('.row')) || el, c = { node: node, timer: 0 };
        node.classList.add('playing');
        node.setAttribute('aria-current', 'true');
        c.timer = setTimeout(function () { if (cur === c) clearPlaying(); }, ms);
        cur = c;
        return function () { if (cur === c) clearPlaying(); };
    }

    /* 回傳 end():提前結束此次的播放中狀態(已被取代則不動作) */
    F.hit = function (s, el, ms) {
        try { shake(); bubble(s, el); } catch (e) { }
        try { return mark(el, ms); } catch (e) { return function () { }; }
    };
})(window.Fahhh);
