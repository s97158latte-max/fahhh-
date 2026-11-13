/* ---------- 資料庫清單 ---------- */
(function (F) {
    'use strict';
    F.renderList = function () {
        var L = F.$('#list'); L.innerHTML = '';
        F.all().forEach(function (s) {
            var row = document.createElement('div'); row.className = 'row';
            row.innerHTML = '<button class="btn play">' + (s.emo || '🎵') + '</button><div class="nm">' + F.esc(s.name) + '</div>' +
                (s.fn || s.lock ? '' : '<button class="btn del">🗑</button>') +
                '<label class="eq"><input type="checkbox"' + (F.eq.indexOf(s.id) > -1 ? ' checked' : '') + '><b></b>裝備</label>';
            var p = row.querySelector('.play');
            p.addEventListener('click', function () { F.play(s, p); });
            row.querySelector('input').addEventListener('change', function (e) {
                var i = F.eq.indexOf(s.id);
                if (e.target.checked && i < 0) F.eq.push(s.id);
                if (!e.target.checked && i > -1) F.eq.splice(i, 1);
                F.saveEq(); F.renderMenu();
            });
            var d = row.querySelector('.del');
            if (d) d.addEventListener('click', function () {
                if (!confirm('刪除「' + s.name + '」？(つД｀)')) return;
                F.custom = F.custom.filter(function (x) { return x.id !== s.id; });
                F.eq = F.eq.filter(function (x) { return x !== s.id; });
                delete F.buf[s.id]; F.dbDel(s.id); F.saveEq(); F.renderList(); F.renderMenu();
            });
            L.appendChild(row);
        });
    };
})(window.Fahhh);
