/* ---------- 上傳 ---------- */
(function (F) {
    'use strict';
    F.$('#up').addEventListener('click', function () { F.$('#file').click(); });
    F.$('#file').addEventListener('change', async function (e) {
        var files = Array.prototype.slice.call(e.target.files);
        for (var f of files) {
            if (f.type.indexOf('audio') !== 0 && !/\.(mp3|m4a|wav|ogg|aac|flac|caf)$/i.test(f.name)) continue;
            var data = await new Promise(function (r) { var fr = new FileReader(); fr.onload = function () { r(fr.result); }; fr.readAsDataURL(f); });
            var s = { id: 'c' + Date.now() + Math.random().toString(36).slice(2, 6), name: f.name.replace(/\.[^.]+$/, '').slice(0, 14), data: data };
            F.custom.push(s); F.dbPut(s); F.eq.push(s.id); F.loadBuf(s);
        }
        F.saveEq(); F.renderList(); F.renderMenu(); e.target.value = '';
    });
})(window.Fahhh);
