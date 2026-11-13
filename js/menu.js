/* ---------- 輪狀選單 ---------- */
(function (F) {
    'use strict';
    var dock = F.$('#dock'), ring = F.$('#ring');

    // 量測 safe-area(以隱藏元素的 padding 取得 env() 對應 px;不支援時為 0)
    var probe = document.createElement('div');
    probe.setAttribute('aria-hidden', 'true');
    probe.style.cssText = 'position:fixed;left:0;top:0;width:0;height:0;visibility:hidden;pointer-events:none;' +
        'padding:env(safe-area-inset-top,0px) env(safe-area-inset-right,0px) env(safe-area-inset-bottom,0px) env(safe-area-inset-left,0px)';
    document.body.appendChild(probe);
    function safeInsets() {
        var cs = getComputedStyle(probe);
        return { t: parseFloat(cs.paddingTop) || 0, r: parseFloat(cs.paddingRight) || 0, b: parseFloat(cs.paddingBottom) || 0 };
    }

    var items = [];
    F.renderMenu = function () {
        ring.innerHTML = '';
        items = [];
        var list = F.all().filter(function (s) { return F.eq.indexOf(s.id) > -1; });
        F.$('#empty').classList.toggle('show', list.length === 0);
        // 依半徑算每圈容量:弧長(90°) / 間距;半徑逐圈 +75,最外圈不超出螢幕左/上緣
        var si = safeInsets();
        var maxR = Math.min(window.innerWidth - 87 - si.r, window.innerHeight - 52 - 27 - 56 - si.t - si.b), idx = 0, r = 0, n = list.length, k = 0;
        while (idx < n) {
            var rr = 120 + 75 * r;
            if (rr > maxR) break;
            var cap = Math.floor(Math.PI / 2 * rr / 60) + 1, take = Math.min(cap, n - idx);
            for (var j = 0; j < take; j++) {
                var s = list[idx + j], ang = take === 1 ? 225 : 180 + 90 * j / (take - 1);
                var b = document.createElement('button'); b.className = 'btn item';
                b.setAttribute('aria-label', F.t('list.play', { name: s.name })); b.title = s.name;
                b.style.setProperty('--a', ang + 'deg');
                b.style.setProperty('--r', rr + 'px');
                b.style.setProperty('--i', k++);
                b.innerHTML = '<i>' + (s.emo || '🎵') + '</i><u>' + F.esc(s.name) + '</u>';
                (function (s, b) {
                    b.addEventListener('pointerdown', function (e) { e.preventDefault(); e.stopPropagation(); F.play(s, b); });
                    b.addEventListener('click', function (e) { if (e.detail === 0) { e.stopPropagation(); F.play(s, b); } });
                    b.addEventListener('contextmenu', function (e) { e.preventDefault(); });
                })(s, b);
                ring.appendChild(b);
                // 彈簧狀態:新建的項目直接靜止在目前(開/關)的終點,不重播動畫
                var open = dock.classList.contains('open'), rad = ang * Math.PI / 180;
                b._sp = newItem(rr * Math.cos(rad), rr * Math.sin(rad), open);
                items.push(b);
            }
            idx += take; r++;
        }
        var more = F.$('#more'), left = n - idx;
        more.textContent = '';
        if (left > 0) {
            var vis = document.createElement('span'); vis.setAttribute('aria-hidden', 'true'); vis.innerHTML = '<svg width="18" height="18" focusable="false"><use href="#pin"/></svg> +' + left;
            var sr = document.createElement('span'); sr.className = 'sr-only'; sr.textContent = F.t('more', { n: left });
            more.appendChild(vis); more.appendChild(sr);
        }
        more.classList.toggle('show', left > 0);
    };

    // 旋轉/縮放後重算:rAF 合併 + 150ms debounce。展開中只重建項目,不動 .open,
    // 新項目直接套用 .open 樣式(無舊狀態可轉場),因此不會閃爍或重播動畫。
    var resizeTimer = 0;
    function onResize() {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(function () { requestAnimationFrame(function () { F.renderMenu(); }); }, 150);
    }
    window.addEventListener('resize', onResize);
    window.addEventListener('orientationchange', onResize);

    var fab = F.$('#fab');

    /* ---------- 彈簧動畫(只動 transform / opacity) ----------
     * 兩參數:阻尼比 ζ + response(約等於「一個彈跳週期/2π」的秒數);ω = 2π/response。
     * 用解析解逐幀推進,所以任意 dt 都穩定;狀態(位置+速度)被保存,中途反向時由當下的
     * 位置與速度往新目標彈。x、y、scale 各自獨立一個彈簧。最後靜止位置由 CSS 決定(動畫結束就清掉 inline)。 */
    var Z_ITEM = 0.8, R_ITEM = 0.35, Z_FAB = 1, R_FAB = 0.3, STAGGER = 45;
    var closedS = 0.2, raf = 0, last = 0;
    function reduced() {
        try { return !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches); } catch (e) { return false; }
    }
    function sp(x, t) { return { x: x, v: 0, t: t }; }
    function step(q, dt, z, resp) {
        var w = 2 * Math.PI / resp, d = q.x - q.t, v = q.v, e = Math.exp(-z * w * dt);
        if (z < 1) {
            var wd = w * Math.sqrt(1 - z * z), c = Math.cos(wd * dt), sn = Math.sin(wd * dt), b = (v + z * w * d) / wd;
            q.x = q.t + e * (d * c + b * sn);
            q.v = e * (-z * w * (d * c + b * sn) + wd * (b * c - d * sn));
        } else {
            var k = v + w * d;
            q.x = q.t + e * (d + k * dt);
            q.v = e * (v - w * k * dt);
        }
    }
    function rest(q, eps, veps) { return Math.abs(q.x - q.t) < eps && Math.abs(q.v) < veps; }
    function newItem(ax, ay, open) {
        return { ax: ax, ay: ay, x: sp(open ? ax : 0, open ? ax : 0), y: sp(open ? ay : 0, open ? ay : 0), s: sp(open ? 1 : closedS, open ? 1 : closedS),
            active: false, moving: false, pend: 0 };
    }
    function itemAtTarget(p) { return rest(p.x, 0.01, 0.01) && rest(p.y, 0.01, 0.01) && rest(p.s, 1e-4, 1e-3); }
    function writeItem(el, p) {
        var s = Math.max(0, p.s.x), o = Math.min(1, Math.max(0, (s - closedS) / 0.35));
        el.style.transform = 'translate3d(' + p.x.x.toFixed(2) + 'px,' + p.y.x.toFixed(2) + 'px,0) scale(' + s.toFixed(4) + ')';
        el.style.opacity = o.toFixed(3);
    }
    function clearItem(el) {
        var st = el.style;
        st.transform = ''; st.opacity = ''; st.visibility = ''; st.pointerEvents = ''; st.willChange = '';
        el.inert = false;
    }
    function finishItem(el, p) {
        p.active = false; p.moving = false;
        p.x.x = p.x.t; p.y.x = p.y.t; p.s.x = p.s.t; p.x.v = p.y.v = p.s.v = 0;
        clearItem(el);
    }
    var fp = { r: sp(0, 0), k: sp(1, 1), active: false };
    function writeFab() { fab.style.transform = 'rotate(' + fp.r.x.toFixed(3) + 'deg) scale(' + fp.k.x.toFixed(4) + ')'; }
    function finishFab() {
        fp.active = false; fp.r.x = fp.r.t; fp.k.x = fp.k.t; fp.r.v = fp.k.v = 0;
        fab.style.transform = ''; fab.style.willChange = '';
    }
    function frame(t) {
        raf = 0;
        var dt = Math.min(Math.max((t - last) / 1000, 0), 1 / 30), busy = false;
        last = t;
        for (var i = 0; i < items.length; i++) {
            var el = items[i], p = el._sp;
            if (!p.active) continue;
            if (!p.moving) { if (t < p.pend) { busy = true; continue; } p.moving = true; }
            step(p.x, dt, Z_ITEM, R_ITEM); step(p.y, dt, Z_ITEM, R_ITEM); step(p.s, dt, Z_ITEM, R_ITEM);
            if (rest(p.x, 0.5, 5) && rest(p.y, 0.5, 5) && rest(p.s, 0.005, 0.05)) finishItem(el, p);
            else { writeItem(el, p); busy = true; }
        }
        if (fp.active) {
            step(fp.r, dt, Z_FAB, R_FAB); step(fp.k, dt, Z_FAB, R_FAB);
            if (rest(fp.r, 0.1, 1) && rest(fp.k, 0.001, 0.01)) finishFab();
            else { writeFab(); busy = true; }
        }
        if (busy) raf = requestAnimationFrame(frame);
    }
    function kick() { if (!raf) { last = performance.now(); raf = requestAnimationFrame(frame); } }
    function cancelAll() {
        if (raf) { cancelAnimationFrame(raf); raf = 0; }
        var open = dock.classList.contains('open');
        for (var i = 0; i < items.length; i++) {
            var p = items[i]._sp;
            p.x.t = open ? p.ax : 0; p.y.t = open ? p.ay : 0; p.s.t = open ? 1 : closedS;
            finishItem(items[i], p);
        }
        fp.r.t = open ? -14 : 0; fp.k.t = open ? 0.92 : 1; finishFab();
    }
    // 開/關:設新目標、保留當下位置與速度;stagger 只給「還靜止」的項目(進行中的項目立刻改向)
    function animate(v) {
        if (reduced()) { cancelAll(); return; }
        var now = performance.now();
        for (var i = 0; i < items.length; i++) {
            var el = items[i], p = items[i]._sp;
            p.x.t = v ? p.ax : 0; p.y.t = v ? p.ay : 0; p.s.t = v ? 1 : closedS;
            if (!p.moving) {
                if (itemAtTarget(p)) { finishItem(el, p); continue; }
                p.pend = now + i * STAGGER;
            }
            p.active = true;
            el.style.willChange = 'transform, opacity';
            if (v) { el.style.visibility = ''; el.style.pointerEvents = ''; el.inert = false; }
            else { el.style.visibility = 'visible'; el.style.pointerEvents = 'none'; el.inert = true; }
            writeItem(el, p);
        }
        fp.r.t = v ? -14 : 0; fp.k.t = v ? 0.92 : 1; fp.active = true;
        fab.style.willChange = 'transform';
        writeFab();
        kick();
    }
    function setOpen(v) { dock.classList.toggle('open', v); animate(v); F.$('#bd').style.display = v ? 'block' : 'none'; fab.setAttribute('aria-expanded', v ? 'true' : 'false'); }
    fab.setAttribute('aria-expanded', 'false');

    fab.addEventListener('click', function (e) {
        if (e.detail === 0) { F.getCtx(); setOpen(!dock.classList.contains('open')); }
    });
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && dock.classList.contains('open')) { setOpen(false); fab.focus(); }
    });
    F.$('#fab').addEventListener('pointerdown', function (e) {
        e.preventDefault(); F.getCtx(); setOpen(!dock.classList.contains('open'));
    });
    F.$('#bd').addEventListener('pointerdown', function (e) { e.preventDefault(); setOpen(false); });
})(window.Fahhh);
