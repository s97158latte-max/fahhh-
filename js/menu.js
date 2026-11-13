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

    F.renderMenu = function () {
        ring.innerHTML = '';
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
            }
            idx += take; r++;
        }
        var more = F.$('#more'), left = n - idx;
        more.textContent = left > 0 ? F.t('more', { n: left }) : '';
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
    function setOpen(v) { dock.classList.toggle('open', v); F.$('#bd').style.display = v ? 'block' : 'none'; fab.setAttribute('aria-expanded', v ? 'true' : 'false'); }
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
