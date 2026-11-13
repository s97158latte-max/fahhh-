/* 共用命名空間與小工具 */
window.Fahhh = window.Fahhh || {};
(function (F) {
    'use strict';
    F.$ = function (s) { return document.querySelector(s); };
    F.esc = function (s) {
        return s.replace(/[&<>"]/g, function (c) {
            return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
        });
    };
})(window.Fahhh);
