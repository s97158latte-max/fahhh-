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
            'sub1': '迷因總資料庫。勾選「釘選」，右下角的小白點就會長出那顆按鈕 (╥﹏╥)',
            'sub2': '沒聲音？先檢查 iPhone 側邊的靜音鍵和音量',
            'tip.keys': '小技巧：已釘選的迷因可以直接按鍵盤 1～0、Q～P 播放',
            'note': '(;´Д`) 音檔只存在這個瀏覽器；iPhone 的「主畫面 App」和 Safari 各自獨立，加入主畫面後要重新上傳。',
            'upload.btn': '＋ 上傳新迷因',
            'credit': 'created by',
            'brand': '邊境部署 EdgeDeploy',
            'lang.btn': 'EN',
            'lang.aria': '切換成英文',
            'fab.aria': '迷因快捷選單',
            'empty.1': '還沒有釘選任何迷因 😭',
            'empty.2': '去資料庫勾選！',
            'hint': '點我展開你釘選的迷因',
            'more': '還有 {n} 個沒顯示,請取消勾選一些',
            'list.play': '播放 {name}',
            'list.rename': '重新命名 {name}',
            'list.delete': '刪除 {name}',
            'list.equip': '釘選',
            'undo.msg': '已刪除「{name}」',
            'undo.btn': '復原',
            'sep': '、',
            'upload.progress': '正在加入 {i}/{n}…',
            'upload.added': '已加入 {n} 個,已自動釘選',
            'upload.added.one': '已加入 {n} 個,已自動釘選',
            'upload.skipped': '略過 {n} 個不是音訊的檔案({names}),可用格式:{formats}',
            'upload.skipped.one': '略過 {n} 個不是音訊的檔案({names}),可用格式:{formats}',
            'upload.big': '略過 {n} 個太大的檔案(單檔上限 {mb}MB):{names}',
            'upload.big.one': '略過 {n} 個太大的檔案(單檔上限 {mb}MB):{names}',
            'upload.long': '略過 {n} 個太長的檔案(上限 {sec} 秒):{names}',
            'upload.long.one': '略過 {n} 個太長的檔案(上限 {sec} 秒):{names}',
            'upload.bad': '{n} 個檔案無法播放:{names}(可能不是有效的音訊檔,或這個瀏覽器不支援此格式;建議改用 mp3 或 m4a)',
            'upload.bad.one': '{n} 個檔案無法播放:{names}(可能不是有效的音訊檔,或這個瀏覽器不支援此格式;建議改用 mp3 或 m4a)',
            'upload.cut': '名稱太長,已縮短為 {names}',
            'upload.nopersist': '這個瀏覽器無法保存音檔,重新整理後會消失',
            'upload.readfail': '讀取失敗的檔案'
        },
        en: {
            'title': 'fahhh! meme soundboard | created by 邊境部署 EdgeDeploy',
            'sub1': 'The meme sound library. Tick “Pin” and the little white dot at the bottom right will sprout that button (╥﹏╥)',
            'sub2': 'No sound? Check your iPhone’s silent switch and volume first',
            'tip.keys': 'Tip: press 1–0 or Q–P to play your pinned memes',
            'note': '(;´Д`) Your sounds only live in this browser. On iPhone, the Home Screen app and Safari don’t share them, so you’ll need to re-upload after adding to the Home Screen.',
            'upload.btn': '+ Upload a new meme',
            'credit': 'created by',
            'brand': '邊境部署 EdgeDeploy',
            'lang.btn': '中',
            'lang.aria': 'Switch to Chinese',
            'fab.aria': 'Meme quick menu',
            'empty.1': 'No memes pinned yet 😭',
            'empty.2': 'Go tick some in the library!',
            'hint': 'Tap to open your pinned memes',
            'more': '{n} more not shown. Untick a few to make room',
            'list.play': 'Play {name}',
            'list.rename': 'Rename {name}',
            'list.delete': 'Delete {name}',
            'list.equip': 'Pin',
            'undo.msg': 'Deleted “{name}”',
            'undo.btn': 'Undo',
            'sep': ', ',
            'upload.progress': 'Adding {i}/{n}…',
            'upload.added': 'Added {n} sounds and pinned them',
            'upload.added.one': 'Added 1 sound and pinned it',
            'upload.skipped': 'Skipped {n} files that aren’t audio ({names}). Supported formats: {formats}',
            'upload.skipped.one': 'Skipped 1 file that isn’t audio ({names}). Supported formats: {formats}',
            'upload.big': 'Skipped {n} files that are too big ({mb} MB max each): {names}',
            'upload.big.one': 'Skipped 1 file that’s too big ({mb} MB max each): {names}',
            'upload.long': 'Skipped {n} files that are too long ({sec} seconds max): {names}',
            'upload.long.one': 'Skipped 1 file that’s too long ({sec} seconds max): {names}',
            'upload.bad': '{n} files can’t be played: {names} (maybe not valid audio, or this browser doesn’t support the format. Try mp3 or m4a)',
            'upload.bad.one': '1 file can’t be played: {names} (maybe not valid audio, or this browser doesn’t support the format. Try mp3 or m4a)',
            'upload.cut': 'Name too long, shortened to {names}',
            'upload.nopersist': 'This browser can’t save sounds, so they’ll be gone after a refresh',
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
