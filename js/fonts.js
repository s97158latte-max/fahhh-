// 讓 Google Fonts 樣式表不阻塞首次渲染：index.html 先以 media="print" 載入（不阻塞），
// 這裡再改為 all 套用。CSP 禁止行內 onload，所以放在外部檔。
(function () {
    var links = document.querySelectorAll('link[data-font]');
    for (var i = 0; i < links.length; i++) links[i].media = 'all';
})();
