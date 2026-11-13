/* ---------- 上傳 ---------- */
(function (F) {
    'use strict';
    var NAME_MAX = 14, MAX_BYTES = 10 * 1024 * 1024, MAX_SEC = 30, msgTimer = null;
    var upBtn = F.$('#up'), msgEl = F.$('#upMsg');
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
    function names(list) { return list.slice(0, 3).map(function (x) { return x.name; }).join('、') + (list.length > 3 ? '…' : ''); }
    upBtn.addEventListener('click', function () { F.$('#file').click(); });
    F.$('#file').addEventListener('change', async function (e) {
        var input = e.target, all = Array.prototype.slice.call(input.files);
        var ok = [], skipped = [];
        all.forEach(function (f) {
            (f.type.indexOf('audio') === 0 || /\.(mp3|m4a|wav|ogg|aac|flac|caf)$/i.test(f.name) ? ok : skipped).push(f);
        });
        var added = 0, cut = [], big = [], long_ = [], bad = [];
        upBtn.disabled = true;
        try {
            for (var i = 0; i < ok.length; i++) {
                var f = ok[i];
                say(['正在加入 ' + (i + 1) + '/' + ok.length + '…'], true);
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
            skipped.push({ name: '讀取失敗的檔案' });
        }
        if (added) F.requestPersist();
        F.saveEq(); F.renderList(); F.renderMenu(); input.value = '';
        upBtn.disabled = false;
        var lines = [];
        if (added) lines.push('已加入 ' + added + ' 個,已自動裝備');
        if (skipped.length) lines.push('略過 ' + skipped.length + ' 個不是音訊的檔案(' + names(skipped) + '),可用格式:mp3、m4a、wav、ogg、aac');
        if (big.length) lines.push('略過 ' + big.length + ' 個太大的檔案(單檔上限 10MB):' + names(big));
        if (long_.length) lines.push('略過 ' + long_.length + ' 個太長的檔案(上限 30 秒):' + names(long_));
        if (bad.length) lines.push(bad.length + ' 個檔案無法播放,可能不是有效的音訊檔:' + names(bad));
        if (cut.length) lines.push('名稱太長,已縮短為 ' + cut.slice(0, 3).join('、') + (cut.length > 3 ? '…' : ''));
        if (added && !F.db) lines.push('這個瀏覽器無法保存音檔,重新整理後會消失');
        say(lines);
    });
})(window.Fahhh);
