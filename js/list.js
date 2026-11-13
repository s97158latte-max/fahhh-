/* ---------- 資料庫清單 ---------- */
(function (F) {
    'use strict';
    F.renameSound = function (s, row) {
        var nm = row.querySelector('.nm'), done = false;
        var inp = document.createElement('input');
        inp.type = 'text'; inp.className = 'nm-edit'; inp.maxLength = 14; inp.value = s.name;
        inp.setAttribute('aria-label', '重新命名 ' + s.name);
        nm.replaceWith(inp); inp.focus(); inp.select();
        function finish(save) {
            if (done) return; done = true;
            var v = inp.value.trim();
            if (save && v && v !== s.name) { s.name = v; F.dbPut(s); }
            F.renderList(); F.renderMenu();
        }
        inp.addEventListener('keydown', function (e) {
            if (e.key === 'Enter') { e.preventDefault(); finish(true); }
            else if (e.key === 'Escape') { e.preventDefault(); finish(false); }
        });
        inp.addEventListener('blur', function () { finish(true); });
    };
    F.renderList = function () {
        var L = F.$('#list'); L.innerHTML = '';
        F.all().forEach(function (s) {
            var row = document.createElement('div'); row.className = 'row';
            row.innerHTML = '<button class="btn play" aria-label="' + F.esc('播放 ' + s.name) + '">' + (s.emo || '🎵') + '</button><div class="nm">' + F.esc(s.name) + '</div>' +
                (s.fn || s.lock ? '' : '<button class="btn ren" aria-label="' + F.esc('重新命名 ' + s.name) + '">✏️</button>') +
                (s.fn || s.lock ? '' : '<button class="btn del" aria-label="' + F.esc('刪除 ' + s.name) + '">🗑</button>') +
                '<label class="eq"><input type="checkbox"' + (F.eq.indexOf(s.id) > -1 ? ' checked' : '') + '><b></b>裝備</label>';
            var p = row.querySelector('.play');
            p.addEventListener('click', function () { F.play(s, p); });
            row.querySelector('input').addEventListener('change', function (e) {
                var i = F.eq.indexOf(s.id);
                if (e.target.checked && i < 0) F.eq.push(s.id);
                if (!e.target.checked && i > -1) F.eq.splice(i, 1);
                F.saveEq(); F.renderMenu();
            });
            var rn = row.querySelector('.ren');
            if (rn) rn.addEventListener('click', function () { F.renameSound(s, row); });
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
