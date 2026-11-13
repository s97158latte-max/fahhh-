/* ---------- 情境式提示:iOS 靜音鍵(第一次播放時顯示一次) ---------- */
(function (F) {
    'use strict';
    var KEY = 'fahhh_silent_hint';
    var ua = '', plat = '', touch = 0;
    try { ua = navigator.userAgent || ''; plat = navigator.platform || ''; touch = navigator.maxTouchPoints || 0; } catch (e) { }
    if (!(/iPad|iPhone|iPod/.test(ua) || (plat === 'MacIntel' && touch > 1))) return;
    try { if (localStorage.getItem(KEY)) return; } catch (e) { return; }
    var el = null, timer = 0;
    function hide() { clearTimeout(timer); if (el) { el.remove(); el = null; } }
    document.addEventListener('fahhh:play', function show() {
        document.removeEventListener('fahhh:play', show);
        try { localStorage.setItem(KEY, '1'); } catch (e) { }
        el = document.createElement('div');
        el.id = 'silentHint'; el.setAttribute('role', 'status');
        el.textContent = F.t('hint.silent');
        el.addEventListener('click', hide);
        document.body.appendChild(el);
        timer = setTimeout(hide, 4000);
        F.onLang(function () { if (el) el.textContent = F.t('hint.silent'); });
    });
})(window.Fahhh);
