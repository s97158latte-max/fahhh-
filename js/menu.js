/* ---------- 輪狀選單 ---------- */
(function (F) {
    'use strict';
    var dock = F.$('#dock'), ring = F.$('#ring');

    F.renderMenu = function () {
        ring.innerHTML = '';
        var list = F.all().filter(function (s) { return F.eq.indexOf(s.id) > -1; });
        F.$('#empty').classList.toggle('show', list.length === 0);
        var caps = [4, 6, 8], rad = [110, 185, 260], idx = 0, r = 0, n = list.length, k = 0;
        while (idx < n) {
            var cap = r < 2 ? caps[r] : n - idx, take = Math.min(cap, n - idx);
            for (var j = 0; j < take; j++) {
                var s = list[idx + j], ang = take === 1 ? 225 : 180 + 90 * j / (take - 1);
                var b = document.createElement('button'); b.className = 'btn item';
                b.style.setProperty('--a', ang + 'deg');
                b.style.setProperty('--r', rad[Math.min(r, 2)] + 'px');
                b.style.setProperty('--i', k++);
                b.innerHTML = '<i>' + (s.emo || '🎵') + '</i><u>' + F.esc(s.name) + '</u>';
                (function (s, b) {
                    b.addEventListener('pointerdown', function (e) { e.preventDefault(); e.stopPropagation(); F.play(s, b); });
                    b.addEventListener('contextmenu', function (e) { e.preventDefault(); });
                })(s, b);
                ring.appendChild(b);
            }
            idx += take; r++;
        }
    };

    function setOpen(v) { dock.classList.toggle('open', v); F.$('#bd').style.display = v ? 'block' : 'none'; }
    F.$('#fab').addEventListener('pointerdown', function (e) {
        e.preventDefault(); F.getCtx(); setOpen(!dock.classList.contains('open'));
    });
    F.$('#bd').addEventListener('pointerdown', function (e) { e.preventDefault(); setOpen(false); });
})(window.Fahhh);
