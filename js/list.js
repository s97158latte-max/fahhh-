/* ---------- 資料庫清單 ---------- */
(function (F) {
    'use strict';
    var flushRename = null;
    F.renameSound = function (s, row) {
        if (flushRename) flushRename();
        var nm = row.querySelector('.nm'), done = false;
        var inp = document.createElement('input');
        inp.type = 'text'; inp.className = 'nm-edit'; inp.maxLength = 14; inp.value = s.name;
        inp.setAttribute('aria-label', F.t('list.rename', { name: s.name }));
        nm.replaceWith(inp); inp.focus(); inp.select();
        /* 編輯中按列內其他按鈕:阻止 mousedown 的焦點轉移,輸入框不 blur、不被提前重繪,click 才能正常送達 */
        var L = F.$('#list');
        function keepFocus(e) { if (e.target !== inp && e.target.closest && e.target.closest('.row')) e.preventDefault(); }
        L.addEventListener('mousedown', keepFocus);
        flushRename = function () { finish(true); };
        function finish(save) {
            if (done) return; done = true;
            L.removeEventListener('mousedown', keepFocus); flushRename = null;
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
            row.innerHTML = '<button class="btn play" aria-label="' + F.esc(F.t('list.play', { name: s.name })) + '">' + (s.emo || '🎵') + '</button><div class="nm">' + F.esc(s.name) + '</div>' +
                (s.fn || s.lock ? '' : '<button class="btn ren" aria-label="' + F.esc(F.t('list.rename', { name: s.name })) + '">✏️</button>') +
                (s.fn || s.lock ? '' : '<button class="btn del" aria-label="' + F.esc(F.t('list.delete', { name: s.name })) + '">🗑</button>') +
                '<kbd class="key" aria-hidden="true"></kbd><label class="eq"><input type="checkbox"' + (F.eq.indexOf(s.id) > -1 ? ' checked' : '') + '><b></b>' + F.esc(F.t('list.equip')) + '</label>';
            var p = row.querySelector('.play');
            p.addEventListener('click', function () { F.play(s, p); });
            row.querySelector('input').addEventListener('change', function (e) {
                var i = F.eq.indexOf(s.id);
                if (e.target.checked && i < 0) F.eq.push(s.id);
                if (!e.target.checked && i > -1) F.eq.splice(i, 1);
                F.saveEq(); F.renderMenu(); F.renderKeys();
            });
            var rn = row.querySelector('.ren');
            if (rn) rn.addEventListener('click', function () { F.renameSound(s, row); });
            var d = row.querySelector('.del');
            if (d) d.addEventListener('click', function () {
                F.softDelete(s);
            });
            L.appendChild(row);
        });
        F.renderKeys();
    };
    /* ---------- 刪除可復原 ---------- */
    var pend = null, bar = null, barText = null;
    function commitPending() {
        if (!pend) return;
        clearTimeout(pend.timer); F.dbDel(pend.s.id);
        pend = null;
        if (bar) bar.hidden = true;
    }
    /* 語言切換時，仍在顯示的復原提示條直接換字 */
    F.onLang(function () {
        if (!barText || !bar || bar.hidden) return;
        barText.m.textContent = F.t('undo.msg', { name: barText.name });
        barText.u.textContent = F.t('undo.btn');
    });
    function ensureBar() {
        if (bar) return bar;
        bar = document.createElement('div'); bar.id = 'undoBar';
        bar.setAttribute('role', 'status'); bar.setAttribute('aria-live', 'polite'); bar.hidden = true;
        document.body.appendChild(bar);
        return bar;
    }
    F.softDelete = function (s) {
        if (flushRename) flushRename(); /* 進行中的改名先儲存並收掉輸入框 */
        commitPending();
        var rec = { s: s, idx: F.custom.indexOf(s), eqIdx: F.eq.indexOf(s.id), buf: F.buf[s.id] };
        F.custom = F.custom.filter(function (x) { return x.id !== s.id; });
        F.eq = F.eq.filter(function (x) { return x !== s.id; });
        delete F.buf[s.id]; F.saveEq(); F.renderList(); F.renderMenu();
        rec.timer = setTimeout(function () { if (pend === rec) commitPending(); }, 6000);
        pend = rec;
        var b = ensureBar(); b.innerHTML = '';
        var m = document.createElement('span'); m.textContent = F.t('undo.msg', { name: s.name });
        var u = document.createElement('button'); u.type = 'button'; u.className = 'btn'; u.textContent = F.t('undo.btn');
        barText = { m: m, u: u, name: s.name };
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
