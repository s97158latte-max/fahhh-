/* ---------- 上傳 ---------- */
(function (F) {
    'use strict';
    // 支援的副檔名單一來源(通用的在前,ogg 在 Safari/iOS 支援不完整放最後)
    var EXTS = ['mp3', 'm4a', 'wav', 'aac', 'flac', 'caf', 'ogg'];
    var EXT_RE = new RegExp('\\.(' + EXTS.join('|') + ')$', 'i');
    var NAME_MAX = 14, MAX_BYTES = 10 * 1024 * 1024, MAX_SEC = 30, msgTimer = null;
    var upBtn = F.$('#up'), msgEl = F.$('#upMsg');
    var SEP = function () { return F.t('sep'); };
    // sticky 訊息(不自動消失)用於處理中;其餘幾秒後淡出
    function say(lines, sticky) {
        clearTimeout(msgTimer);
        msgEl.textContent = '';
        lines.forEach(function (t) { var p = document.createElement('div'); p.textContent = t; msgEl.appendChild(p); });
        msgEl.hidden = !lines.length;
        msgEl.classList.remove('out');
        if (!lines.length || sticky) return;
        var still = window.matchMedia && matchMedia('(prefers-reduced-motion:reduce)').matches;
        msgTimer = setTimeout(function () {
            if (still) { msgEl.hidden = true; return; }
            msgEl.classList.add('out');
            msgTimer = setTimeout(function () { msgEl.hidden = true; msgEl.classList.remove('out'); }, 600);
        }, 6000);
    }
    // 驗證可解碼且不超過長度上限;成功回傳 { buf },失敗回傳 { err: 'bad' | 'long' }
    // decodeAudioData 會 detach 傳入的 ArrayBuffer,所以解碼用複本,原始 ab 留給資料庫儲存
    function validateAudio(file, ab) {
        return new Promise(function (ok, no) { var p = F.getCtx().decodeAudioData(ab.slice(0), ok, no); if (p && p.then) p.then(ok, no); })
            .then(function (b) { return b.duration > MAX_SEC ? { err: 'long' } : { buf: b }; },
                function () { return { err: 'bad' }; });
    }
    function names(list) { return list.slice(0, 3).map(function (x) { return x.name; }).join(SEP()) + (list.length > 3 ? '…' : ''); }
    // 用同一份清單設定 accept,index.html 內的值只當無 JS 時的後備
    F.$('#file').setAttribute('accept', ['audio/*'].concat(EXTS.map(function (x) { return '.' + x; })).join(','));
    /* 換語言時舊訊息已是舊語言，直接清掉（處理中的進度會在下一個檔案時重新顯示） */
    F.onLang(function () { say([]); });
    upBtn.addEventListener('click', function () { F.$('#file').click(); });
    F.$('#file').addEventListener('change', async function (e) {
        var input = e.target, all = Array.prototype.slice.call(input.files);
        var ok = [], skipped = [];
        all.forEach(function (f) {
            (f.type.indexOf('audio') === 0 || EXT_RE.test(f.name) ? ok : skipped).push(f);
        });
        var added = 0, cut = [], big = [], long_ = [], bad = [];
        upBtn.disabled = true;
        try {
            for (var i = 0; i < ok.length; i++) {
                var f = ok[i];
                say([F.t('upload.progress', { i: i + 1, n: ok.length })], true);
                if (f.size > MAX_BYTES) { big.push(f); continue; }
                var ab = await (f.arrayBuffer ? f.arrayBuffer() : new Promise(function (res, rej) { var fr = new FileReader(); fr.onload = function () { res(fr.result); }; fr.onerror = function () { rej(fr.error); }; fr.readAsArrayBuffer(f); }));
                var v = await validateAudio(f, ab);
                if (v.err) { (v.err === 'long' ? long_ : bad).push(f); continue; }
                var full = f.name.replace(/\.[^.]+$/, ''), name = full.slice(0, NAME_MAX);
                if (name !== full) cut.push(name);
                var s = { id: 'c' + Date.now() + Math.random().toString(36).slice(2, 6), name: name, buf: ab, type: f.type || '' };
                F.custom.push(s); F.dbPut(s); F.eq.push(s.id); F.buf[s.id] = v.buf;
                added++;
            }
        } catch (err) {
            skipped.push({ name: F.t('upload.readfail') });
        }
        if (added) {
            F.requestPersist();
            /* 第一次成功上傳:主動展開一次資料保存提醒 */
            try { if (!localStorage.getItem('fahhh_store_info')) { localStorage.setItem('fahhh_store_info', '1'); if (F.showStoreInfo) F.showStoreInfo(); } } catch (err) { }
        }
        F.saveEq(); F.renderList(); F.renderMenu(); input.value = '';
        upBtn.disabled = false;
        var lines = [];
        if (added) lines.push(F.t('upload.added', { n: added }));
        if (skipped.length) lines.push(F.t('upload.skipped', { n: skipped.length, names: names(skipped), formats: EXTS.join(SEP()) }));
        if (big.length) lines.push(F.t('upload.big', { n: big.length, mb: MAX_BYTES / 1024 / 1024, names: names(big) }));
        if (long_.length) lines.push(F.t('upload.long', { n: long_.length, sec: MAX_SEC, names: names(long_) }));
        if (bad.length) lines.push(F.t('upload.bad', { n: bad.length, names: names(bad) }));
        if (cut.length) lines.push(F.t('upload.cut', { names: cut.slice(0, 3).join(SEP()) + (cut.length > 3 ? '…' : '') }));
        if (added && !F.db) lines.push(F.t('upload.nopersist'));
        say(lines);
    });
})(window.Fahhh);
