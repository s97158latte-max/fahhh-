/* ---------- 新手導覽(coach marks):第一次造訪自動出現,之後可由 #tourBtn 重看 ---------- */
(function (F) {
    'use strict';
    var KEY = 'fahhh_tour', root = document.documentElement;

    var ICONS = {
        tick: '<svg viewBox="0 0 48 48" aria-hidden="true" focusable="false"><path class="o" d="M8 25l11 11L40 11"/><path class="i" d="M8 25l11 11L40 11"/></svg>',
        dot: '<svg viewBox="0 0 40 40" aria-hidden="true" focusable="false"><use href="#wj"/></svg>',
        tap: '<svg viewBox="0 0 48 48" aria-hidden="true" focusable="false"><path class="f" d="M12 5v31l8-7 6 12 6-3-6-12h11z"/><path class="o" d="M34 6q8 4 8 12"/><path class="i" d="M34 6q8 4 8 12"/></svg>',
        key: '<svg viewBox="0 0 48 48" aria-hidden="true" focusable="false"><rect x="9" y="11" width="36" height="32" rx="8" fill="#000"/><rect class="f" x="5" y="6" width="36" height="32" rx="8"/><path class="i" d="M16 30l8-14 8 14"/></svg>'
    };
    var ARROW = 'M70 112C20 90 80 50 46 12M51 33L46 12L67 20';
    var SKIP = '<svg viewBox="0 0 40 40" width="26" height="26" aria-hidden="true" focusable="false"><path d="M8 8C15 15 22 24 32 32M32 7C25 15 16 25 8 33" fill="none" stroke="#000" stroke-width="5" stroke-linecap="round"/></svg>';
    var NEXT = '<svg viewBox="0 0 40 24" width="32" height="20" aria-hidden="true" focusable="false"><path d="M3 12C12 9 22 14 36 12M28 4L37 12L28 20" fill="none" stroke="#000" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round"/></svg>';

    var STEPS = [
        { sel: '#list .row:first-child .eq', icon: 'tick', key: 'tour.s1' },
        { sel: '#fab', icon: 'dot', key: 'tour.s2', fixed: true },
        { sel: '#ring .item', icon: 'tap', key: 'tour.s3', open: true, fixed: true },
        { sel: '.row .key:not(:empty)', icon: 'key', key: 'tour.s4', desktop: true }
    ];

    var tour, spot, arrow, word, wordTxt, wordIc, live, dots, nextBtn, skipBtn;
    var steps, cur, prevFocus, openedByTour, token, resizeT, raf;

    function reduced() {
        try { return window.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) { return false; }
    }
    function desktop() {
        try { return window.matchMedia('(hover:hover) and (pointer:fine) and (min-width:820px)').matches; } catch (e) { return false; }
    }
    function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
    function find(st) { return st ? document.querySelector(st.sel) : null; }
    function usable(st) {
        if (!st || (st.desktop && !desktop())) return false;
        var el = find(st);
        if (!el) return false;
        var r = el.getBoundingClientRect();
        return r.width > 0 && r.height > 0;
    }
    function mk(tag, cls, html) {
        var e = document.createElement(tag);
        if (cls) e.className = cls;
        if (html) e.innerHTML = html;
        return e;
    }

    /* 輪狀選單:走和點擊 #fab 相同的路徑(click 的 detail 為 0 會 toggle) */
    function menuOpen() { return F.$('#dock').classList.contains('open'); }
    function setMenu(v) { if (menuOpen() !== v) F.$('#fab').click(); }

    function place() {
        raf = 0;
        if (!tour) return;
        var st = steps[cur], el = find(st);
        if (!el) return;
        var r = el.getBoundingClientRect(), pad = 6;
        spot.style.left = (r.left - pad) + 'px';
        spot.style.top = (r.top - pad) + 'px';
        spot.style.width = (r.width + pad * 2) + 'px';
        spot.style.height = (r.height + pad * 2) + 'px';
        var vw = root.clientWidth, vh = window.innerHeight;
        var below = (vh - r.bottom >= 230) || (r.top < 190 && vh - r.bottom > r.top);
        tour.classList.toggle('below', below);
        tour.classList.toggle('above', !below);
        var ax = clamp(r.left + r.width / 2 - 46, 4, vw - 104);
        var ay = below ? r.bottom + pad - 10 : r.top - pad - 110;
        arrow.style.left = ax + 'px';
        arrow.style.top = ay + 'px';
        var w = word.offsetWidth;
        word.style.left = clamp(ax + 70, w / 2 + 8, vw - w / 2 - 8) + 'px';
        word.style.top = (below ? ay + 114 : ay + 6) + 'px';
    }
    function schedule() { if (!raf) raf = requestAnimationFrame(place); }
    function onResize() { clearTimeout(resizeT); schedule(); resizeT = setTimeout(place, 300); }

    function setLabels() {
        tour.setAttribute('aria-label', F.t('tour.aria'));
        skipBtn.setAttribute('aria-label', F.t('tour.skip'));
        nextBtn.setAttribute('aria-label', F.t('tour.next'));
        if (steps[cur]) { wordTxt.textContent = F.t(steps[cur].key); live.textContent = F.t(steps[cur].key); }
    }

    function go(n, dir) {
        while (n >= 0 && n < steps.length && !usable(steps[n])) n += dir;
        if (n >= steps.length) { end(); return; }
        if (n < 0) return;
        var my = ++token, st = steps[n];
        cur = n;
        if (st.open) setMenu(true);
        else if (openedByTour) setMenu(false);
        if (st.open) openedByTour = true;
        else openedByTour = false;
        var el = find(st);
        if (!st.fixed && el.scrollIntoView) el.scrollIntoView({ block: 'center', behavior: reduced() ? 'auto' : 'smooth' });
        wordIc.innerHTML = ICONS[st.icon];
        wordTxt.textContent = F.t(st.key);
        live.textContent = '';
        setTimeout(function () { if (my === token && live) live.textContent = F.t(st.key); }, 50);
        for (var i = 0; i < dots.children.length; i++) dots.children[i].classList.toggle('on', i === n);
        tour.classList.add('wait');
        void tour.offsetWidth;
        if (st.open) {
            // 等選單項目的展開轉場結束再量位置
            setTimeout(function () {
                if (my !== token || !tour) return;
                place(); tour.classList.remove('wait');
            }, 720);
        } else {
            place();
            tour.classList.remove('wait');
            setTimeout(function () { if (my === token) place(); }, 450);
        }
    }
    function next() { go(cur + 1, 1); }
    function prev() { go(cur - 1, -1); }

    function stop(e) { e.preventDefault(); e.stopPropagation(); }
    function onKey(e) {
        if (!tour || e.isComposing) return;
        var k = e.key;
        if (k === 'Escape') { stop(e); end(); }
        else if (k === 'ArrowRight') { stop(e); next(); }
        else if (k === 'ArrowLeft') { stop(e); prev(); }
        else if (k === 'Tab') {
            var a = document.activeElement;
            if (!tour.contains(a)) { stop(e); nextBtn.focus(); }
            else if (e.shiftKey && a === skipBtn) { stop(e); nextBtn.focus(); }
            else if (!e.shiftKey && a === nextBtn) { stop(e); skipBtn.focus(); }
        } else if ((k === 'Enter' || k === ' ') && !(e.target.closest && e.target.closest('#tour button'))) {
            stop(e); next();
        }
    }
    function onFocusIn(e) { if (tour && !tour.contains(e.target)) nextBtn.focus(); }

    function start() {
        if (tour) return;
        steps = STEPS.filter(usable);
        if (!steps.length) { remember(); return; }
        token = 0; cur = 0; openedByTour = false;
        prevFocus = document.activeElement;
        tour = mk('div'); tour.id = 'tour';
        tour.setAttribute('role', 'dialog'); tour.setAttribute('aria-modal', 'true');
        spot = mk('div', 't-spot');
        arrow = mk('div', 't-arrow', '<svg viewBox="0 0 100 120" aria-hidden="true" focusable="false"><path class="o" d="' + ARROW + '"/><path class="i" d="' + ARROW + '"/></svg>');
        wordIc = mk('span', 't-ic'); wordTxt = mk('span', 't-tx');
        word = mk('div', 't-word'); word.setAttribute('aria-hidden', 'true');
        word.appendChild(wordIc); word.appendChild(wordTxt);
        live = mk('div', 't-sr'); live.setAttribute('aria-live', 'polite');
        skipBtn = mk('button', 'btn t-skip', SKIP); skipBtn.type = 'button';
        nextBtn = mk('button', 'btn t-next', NEXT); nextBtn.type = 'button';
        dots = mk('div', 't-dots'); dots.setAttribute('aria-hidden', 'true');
        for (var i = 0; i < steps.length; i++) dots.appendChild(mk('span', 't-dot'));
        var bar = mk('div', 't-bar'); bar.appendChild(dots); bar.appendChild(nextBtn);
        [spot, arrow, word, live, skipBtn, bar].forEach(function (n) { tour.appendChild(n); });
        skipBtn.addEventListener('click', function (e) { e.stopPropagation(); end(); });
        nextBtn.addEventListener('click', function (e) { e.stopPropagation(); next(); });
        tour.addEventListener('click', next);
        document.body.appendChild(tour);
        root.classList.add('touring');
        document.addEventListener('keydown', onKey, true);
        document.addEventListener('focusin', onFocusIn);
        window.addEventListener('resize', onResize);
        window.addEventListener('scroll', schedule, true);
        setLabels();
        nextBtn.focus();
        go(0, 1);
    }

    function remember() { try { localStorage.setItem(KEY, '1'); } catch (e) { } }

    function end() {
        if (!tour) return;
        token++;
        if (openedByTour) setMenu(false);
        openedByTour = false;
        document.removeEventListener('keydown', onKey, true);
        document.removeEventListener('focusin', onFocusIn);
        window.removeEventListener('resize', onResize);
        window.removeEventListener('scroll', schedule, true);
        tour.remove(); tour = null;
        root.classList.remove('touring');
        remember();
        try { if (prevFocus && prevFocus.focus && document.contains(prevFocus)) prevFocus.focus(); } catch (e) { }
        prevFocus = null;
    }

    F.onLang(function () { if (tour) setLabels(); });
    F.startTour = start;

    var btn = F.$('#tourBtn');
    if (btn) btn.addEventListener('click', start);

    /* 自動啟動:未看過才開;讀取失敗視為已看過 */
    function auto() {
        var seen = true;
        try { seen = !!localStorage.getItem(KEY); } catch (e) { }
        if (!seen) setTimeout(start, 400);
    }
    if (root.classList.contains('booting')) document.addEventListener('fahhh:booted', auto, { once: true });
    else if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', auto, { once: true });
    else auto();
})(window.Fahhh);
