/* ---------- 儲存 ---------- */
(function (F) {
    'use strict';
    F.db = null;
    F.eq = null;
    try { F.eq = JSON.parse(localStorage.getItem('fahhh_eq')); } catch (e) { }
    if (!Array.isArray(F.eq)) F.eq = F.BUILTIN.filter(function (s) { return s.pin !== false; }).map(function (s) { return s.id; });
    else {
        /* 舊使用者:自動釘選之後新增的內建音效(只做一次,之後尊重使用者取消釘選) */
        var seen = [];
        try { seen = JSON.parse(localStorage.getItem('fahhh_seen')) || []; } catch (e) { }
        if (!seen.length) seen = ['b1', 'b2', 'b3', 'b4'];
        F.BUILTIN.forEach(function (s) { if (s.pin !== false && seen.indexOf(s.id) < 0 && F.eq.indexOf(s.id) < 0) F.eq.push(s.id); });
    }
    try { localStorage.setItem('fahhh_seen', JSON.stringify(F.BUILTIN.map(function (s) { return s.id; }))); } catch (e) { }

    F.saveEq = function () { try { localStorage.setItem('fahhh_eq', JSON.stringify(F.eq)); } catch (e) { } };

    F.openDB = function () {
        return new Promise(function (r) {
            try {
                var q = indexedDB.open('fahhh', 1);
                q.onupgradeneeded = function () { q.result.createObjectStore('sounds', { keyPath: 'id' }); };
                q.onsuccess = function () { r(q.result); }; q.onerror = function () { r(null); };
            } catch (e) { r(null); }
        });
    };
    F.dbAll = function () {
        return new Promise(function (r) {
            if (!F.db) return r([]);
            try {
                var q = F.db.transaction('sounds').objectStore('sounds').getAll();
                q.onsuccess = function () { r(q.result || []); }; q.onerror = function () { r([]); };
            } catch (e) { r([]); }
        });
    };
    F.dbPut = function (o) { try { F.db && F.db.transaction('sounds', 'readwrite').objectStore('sounds').put(o); } catch (e) { } };
    F.persisted = false;
    F.requestPersist = function () {
        if (F.persistAsked) return; F.persistAsked = true;
        try {
            var st = navigator.storage;
            if (!st || !st.persist) return;
            var done = function (v) { F.persisted = !!v; };
            var ask = function () { return st.persist().then(done); };
            var p = st.persisted ? st.persisted().then(function (v) { return v ? done(v) : ask(); }) : ask();
            p.catch(function () { });
        } catch (e) { }
    };
    F.dbDel = function (id) { try { F.db && F.db.transaction('sounds', 'readwrite').objectStore('sounds').delete(id); } catch (e) { } };
})(window.Fahhh);
