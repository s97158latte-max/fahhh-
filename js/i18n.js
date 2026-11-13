/* ---------- 多語系（中文 / English）---------- */
(function (F) {
    'use strict';
    var KEY = 'fahhh_lang';
    var HTML_LANG = { zh: 'zh-Hant', en: 'en' };

    // 鍵名語意化；兩份字典的鍵集合必須完全一致。
    // 「.one」是 n === 1 時的單數形（中文與基底相同）。內建音效名稱與使用者自訂名稱不在此翻譯。
    var DICT = {
        zh: {
            'title': 'fahhh! 迷因音效按鈕｜Meme Soundboard｜created by 邊境部署 EdgeDeploy',
            'note': '(;´Д`) 音檔只存在這個瀏覽器；iPhone 的「主畫面 App」和 Safari 各自獨立，加入主畫面後要重新上傳。',
            'upload.btn': '＋ 上傳',
            'credit': 'created by',
            'brand': '邊境部署 EdgeDeploy',
            'credit.aria': 'created by 邊境部署 EdgeDeploy（開新分頁）',
            'lang.btn': 'EN',
            'lang.aria': '切換成英文',
            'fab.aria': '迷因快捷選單',
            'empty.aria': '還沒有釘選任何迷因，去資料庫勾選！',
            'hint': '點我展開你釘選的迷因',
            'hint.silent': '🔇 沒聲音？看靜音鍵',
            'more': '還有 {n} 個沒顯示,請取消勾選一些',
            'list.play': '播放 {name}',
            'list.rename': '重新命名 {name}',
            'list.delete': '刪除 {name}',
            'list.equip': '釘選',
            'undo.msg': '已刪除「{name}」',
            'undo.btn': '復原',
            'sep': '、',
            'upload.progress': '正在加入 {i}/{n}…',
            'upload.added': '已加入 {n} 個',
            'upload.added.one': '已加入 {n} 個',
            'upload.skipped': '略過 {n} 個非音訊檔：{names}',
            'upload.skipped.one': '略過 {n} 個非音訊檔：{names}',
            'upload.big': '{n} 個太大(上限 {mb}MB)：{names}',
            'upload.big.one': '{n} 個太大(上限 {mb}MB)：{names}',
            'upload.long': '{n} 個太長(上限 {sec} 秒)：{names}',
            'upload.long.one': '{n} 個太長(上限 {sec} 秒)：{names}',
            'upload.bad': '{n} 個無法播放：{names}',
            'upload.bad.one': '{n} 個無法播放：{names}',
            'upload.cut': '名稱已縮短：{names}',
            'upload.nopersist': '無法保存音檔，重新整理會消失',
            'upload.readfail': '讀取失敗的檔案'
        },
        en: {
            'title': 'fahhh! meme soundboard | created by 邊境部署 EdgeDeploy',
            'note': '(;´Д`) Your sounds only live in this browser. On iPhone, the Home Screen app and Safari don’t share them, so you’ll need to re-upload after adding to the Home Screen.',
            'upload.btn': '+ Upload',
            'credit': 'created by',
            'brand': '邊境部署 EdgeDeploy',
            'credit.aria': 'created by 邊境部署 EdgeDeploy (opens in a new tab)',
            'lang.btn': '中',
            'lang.aria': 'Switch to Chinese',
            'fab.aria': 'Meme quick menu',
            'empty.aria': 'No memes pinned yet. Go tick some in the library!',
            'hint': 'Tap to open your pinned memes',
            'hint.silent': '🔇 No sound? Check the silent switch',
            'more': '{n} more not shown. Untick a few to make room',
            'list.play': 'Play {name}',
            'list.rename': 'Rename {name}',
            'list.delete': 'Delete {name}',
            'list.equip': 'Pin',
            'undo.msg': 'Deleted “{name}”',
            'undo.btn': 'Undo',
            'sep': ', ',
            'upload.progress': 'Adding {i}/{n}…',
            'upload.added': 'Added {n}',
            'upload.added.one': 'Added {n}',
            'upload.skipped': 'Skipped {n} non-audio: {names}',
            'upload.skipped.one': 'Skipped {n} non-audio: {names}',
            'upload.big': '{n} too big ({mb} MB max): {names}',
            'upload.big.one': '{n} too big ({mb} MB max): {names}',
            'upload.long': '{n} too long ({sec}s max): {names}',
            'upload.long.one': '{n} too long ({sec}s max): {names}',
            'upload.bad': '{n} can’t play: {names}',
            'upload.bad.one': '{n} can’t play: {names}',
            'upload.cut': 'Name shortened: {names}',
            'upload.nopersist': 'Can’t save sounds; gone after refresh',
            'upload.readfail': 'A file that failed to load'
        }
    };
    F.DICT = DICT;

    // 先看使用者上次的選擇，否則依瀏覽器語言：zh 開頭用中文，其餘英文
    F.detectLang = function () {
        try {
            var v = localStorage.getItem(KEY);
            if (v === 'zh' || v === 'en') return v;
        } catch (e) { }
        var nl = '';
        try { nl = String(navigator.language || ''); } catch (e) { }
        return /^zh/i.test(nl) ? 'zh' : 'en';
    };

    F.lang = F.detectLang();

    // 取字串並插值；缺英文鍵退回中文（console.warn），兩邊都沒有則回傳鍵名
    F.t = function (key, params) {
        var p = params || {};
        if (p.n === 1 && (key + '.one') in DICT[F.lang]) key += '.one';
        var s = DICT[F.lang][key];
        if (s === undefined) {
            s = DICT.zh[key];
            try { console.warn('[i18n] missing "' + F.lang + '" key: ' + key); } catch (e) { }
            if (s === undefined) return key;
        }
        return s.replace(/\{(\w+)\}/g, function (m, k) { return p[k] === undefined ? m : String(p[k]); });
    };

    var cbs = [];
    F.onLang = function (cb) { cbs.push(cb); };

    function applyStatic() {
        if (typeof document === 'undefined') return;
        var root = document.documentElement;
        root.setAttribute('lang', HTML_LANG[F.lang]);
        document.title = F.t('title');
        [['data-i18n', null], ['data-i18n-aria', 'aria-label'], ['data-i18n-title', 'title'], ['data-i18n-alt', 'alt']].forEach(function (m) {
            var els = document.querySelectorAll('[' + m[0] + ']');
            for (var i = 0; i < els.length; i++) {
                var v = F.t(els[i].getAttribute(m[0]));
                if (m[1]) els[i].setAttribute(m[1], v); else els[i].textContent = v;
            }
        });
        // 切換鈕顯示的是「另一種語言」的文字，標記該語言讓讀屏與字型正確
        var lb = document.getElementById('lang');
        if (lb) lb.setAttribute('lang', HTML_LANG[F.lang === 'zh' ? 'en' : 'zh']);
    }

    F.setLang = function (l) {
        if (l !== 'zh' && l !== 'en') return;
        F.lang = l;
        try { localStorage.setItem(KEY, l); } catch (e) { }
        applyStatic();
        cbs.slice().forEach(function (cb) { try { cb(l); } catch (e) { } });
    };

    applyStatic();
    if (typeof document !== 'undefined') {
        var lb = document.getElementById('lang');
        if (lb) lb.addEventListener('click', function () { F.setLang(F.lang === 'zh' ? 'en' : 'zh'); });
    }
})(window.Fahhh);
