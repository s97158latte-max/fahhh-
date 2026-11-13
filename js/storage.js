/* ---------- 儲存 ---------- */
(function (F) {
    'use strict';
    F.db = null;
    F.eq = null;
    try { F.eq = JSON.parse(localStorage.getItem('fahhh_eq')); } catch (e) { }
    if (!Array.isArray(F.eq)) F.eq = F.BUILTIN.map(function (s) { return s.id; });

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
