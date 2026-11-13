/* ---------- 資料庫清單 ---------- */
(function (F) {
    'use strict';
    F.renderList = function () {
        var L = F.$('#list'); L.innerHTML = '';
        F.all().forEach(function (s) {
            var row = document.createElement('div'); row.className = 'row';
            row.innerHTML = '<button class="btn play" aria-label="' + F.esc('播放 ' + s.name) + '">' + (s.emo || '🎵') + '</button><div class="nm">' + F.esc(s.name) + '</div>' +
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
            var d = row.querySelector('.del');
            if (d) d.addEventListener('click', function () {
                F.softDelete(s);
            });
            L.appendChild(row);
        });
    };
    /* ---------- 刪除可復原 ---------- */
    var pend = null, bar = null;
    function commitPending() {
        if (!pend) return;
        clearTimeout(pend.timer); F.dbDel(pend.s.id);
        pend = null;
        if (bar) bar.hidden = true;
    }
    function ensureBar() {
        if (bar) return bar;
        bar = document.createElement('div'); bar.id = 'undoBar';
        bar.setAttribute('role', 'status'); bar.setAttribute('aria-live', 'polite'); bar.hidden = true;
        document.body.appendChild(bar);
        return bar;
    }
    F.softDelete = function (s) {
        commitPending();
        var rec = { s: s, idx: F.custom.indexOf(s), eqIdx: F.eq.indexOf(s.id), buf: F.buf[s.id] };
        F.custom = F.custom.filter(function (x) { return x.id !== s.id; });
        F.eq = F.eq.filter(function (x) { return x !== s.id; });
        delete F.buf[s.id]; F.saveEq(); F.renderList(); F.renderMenu();
        rec.timer = setTimeout(function () { if (pend === rec) commitPending(); }, 6000);
        pend = rec;
        var b = ensureBar(); b.innerHTML = '';
        var m = document.createElement('span'); m.textContent = '已刪除「' + s.name + '」';
        var u = document.createElement('button'); u.type = 'button'; u.className = 'btn'; u.textContent = '復原';
        u.addEventListener('click', function () {
            if (pend !== rec) return;
            clearTimeout(rec.timer); pend = null; b.hidden = true;
            F.custom.splice(Math.min(rec.idx < 0 ? F.custom.length : rec.idx, F.custom.length), 0, rec.s);
            if (rec.buf) F.buf[rec.s.id] = rec.buf;
            if (rec.eqIdx > -1 && F.eq.indexOf(rec.s.id) < 0) F.eq.splice(Math.min(rec.eqIdx, F.eq.length), 0, rec.s.id);
            F.saveEq(); F.renderList(); F.renderMenu();
        });
        b.appendChild(m); b.appendChild(u); b.hidden = false;
    };
})(window.Fahhh);
