/* ---------- 多語系（中文 / English）---------- */
(function (F) {
    'use strict';
    var KEY = 'fahhh_lang';
    var HTML_LANG = { zh: 'zh-Hant', en: 'en' };

    // 鍵名語意化；兩份字典的鍵集合必須完全一致。
    // 「.one」是 n === 1 時的單數形（中文與基底相同）。內建音效名稱與使用者自訂名稱不在此翻譯。
    var DICT = {
        zh: {
            'h1.sub': '迷因音效按鈕',
            'list.h': '內建迷因音效',
            'intro': 'fahhh! 是免費的線上迷因音效板：一鍵播放 FAHHH!、Bruh、Boom、Wah Wah，也能上傳自己的音檔，手機與電腦都能用。',
            'title': '迷因音效按鈕｜fahhh! 免費迷因音效板 Meme Soundboard',
            'note': '(;´Д`) 音檔只存在這個瀏覽器；iPhone 的「主畫面 App」和 Safari 各自獨立，加入主畫面後要重新上傳。',
            'upload.btn': '＋ 上傳',
            'credit': 'created by',
            'legal': '部分內建音效取自網路，版權屬原作者所有，僅供娛樂。如有疑慮，請與我們聯絡，將立即移除。',
            'legal.link': '聯絡我們',
            'brand': '邊境部署 EdgeDeploy',
            'credit.aria': 'created by 邊境部署 EdgeDeploy（開新分頁）',
            'lang.btn': 'EN',
            'lang.aria': '切換成英文',
            'fab.aria': '迷因快捷選單',
            'empty.aria': '還沒有釘選任何迷因，去資料庫勾選！',
            'hint.silent': '🔇 沒聲音？看靜音鍵',
            'tour.aria': '新手導覽',
            'tour.btn.aria': '新手導覽',
            'tour.skip': '略過',
            'tour.next': '下一步',
            'tour.s1': '點這裡播放',
            'tour.s2': '勾起來，加進快捷選單',
            'tour.s3': '點圓點，打開快捷選單',
            'tour.s4': '點按鈕就能播放',
            'tour.s5': '也能按鍵盤這個鍵',
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
            'upload.drop': '放開上傳',
            'upload.readfail': '讀取失敗的檔案',
            'desc': 'fahhh! 免費線上迷因音效板：一鍵播放 FAHHH、Bruh、Boom 等迷因音效，免安裝，還能上傳自己的音檔。Free meme soundboard.'
        },
        en: {
            'h1.sub': 'Meme Soundboard',
            'list.h': 'Built-in meme sounds',
            'intro': 'fahhh! is a free online meme soundboard: play FAHHH!, Bruh, Boom and Wah Wah with one tap, or upload your own sounds. Works on phone and desktop.',
            'title': 'Meme Soundboard | fahhh! Free Online Meme Sound Buttons',
            'note': '(;´Д`) Your sounds only live in this browser. On iPhone, the Home Screen app and Safari don’t share them, so you’ll need to re-upload after adding to the Home Screen.',
            'upload.btn': '+ Upload',
            'credit': 'created by',
            'legal': 'Some built-in sounds are taken from the internet and belong to their original creators; for fun only. If you have a concern, contact us and we will remove them right away.',
            'legal.link': 'Contact us',
            'brand': '邊境部署 EdgeDeploy',
            'credit.aria': 'created by 邊境部署 EdgeDeploy (opens in a new tab)',
            'lang.btn': '中',
            'lang.aria': 'Switch to Chinese',
            'fab.aria': 'Meme quick menu',
            'empty.aria': 'No memes pinned yet. Go tick some in the library!',
            'hint.silent': '🔇 No sound? Check the silent switch',
            'tour.aria': 'Quick tour',
            'tour.btn.aria': 'Quick tour',
            'tour.skip': 'Skip',
            'tour.next': 'Next',
            'tour.s1': 'Tap to play',
            'tour.s2': 'Tick to add to quick menu',
            'tour.s3': 'Tap the dot to open it',
            'tour.s4': 'Tap a button to play',
            'tour.s5': 'Or press this key',
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
            'upload.drop': 'Drop to upload',
            'upload.readfail': 'A file that failed to load',
            'desc': 'fahhh! is a free online meme soundboard: play FAHHH, Bruh, Boom and more meme sounds with one tap, no install, and upload your own audio.'
        }
    };
    F.DICT = DICT;

    // 只有使用者明確存過 en 才用英文；首次造訪一律繁中（利於爬蟲以中文渲染）
    F.detectLang = function () {
        try {
            var v = localStorage.getItem(KEY);
            if (v === 'en') return 'en';
        } catch (e) { }
        return 'zh';
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
        var md = document.querySelector('meta[name="description"]');
        if (md) md.setAttribute('content', F.t('desc'));
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
