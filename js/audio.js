/* ---------- Web Audio ---------- */
(function (F) {
    'use strict';
    var ctx = null, master = null;
    F.buf = {};

    function getCtx() {
        if (!ctx) {
            var C = window.AudioContext || window.webkitAudioContext;
            ctx = new C(); master = ctx.createGain(); master.gain.value = .9;
            var comp = ctx.createDynamicsCompressor(); master.connect(comp); comp.connect(ctx.destination);
        }
        if (ctx.state !== 'running') { try { ctx.resume(); } catch (e) { } }
        return ctx;
    }

    /* 單聲道:cur 為目前這次 play 的發聲工作階段 { bus, nodes, n },tone/noise 會接到它的 bus */
    var FADE = .03, cur = null, curAudio = null;

    function dest() { return cur ? cur.bus : master; }
    function track(node) {
        var sess = cur;
        if (!sess) return;
        sess.nodes.push(node); sess.n++;
        node.onended = function () { if (--sess.n <= 0) release(sess); };
    }
    function release(sess) {
        if (cur === sess) cur = null;
        try { sess.bus.disconnect(); } catch (e) { }
    }
    function stopSession(sess) {
        var c = ctx, t = c.currentTime;
        try {
            var g = sess.bus.gain;
            g.cancelScheduledValues(t);
            g.setValueAtTime(g.value, t);
            g.linearRampToValueAtTime(0, t + FADE);
        } catch (e) { }
        sess.nodes.forEach(function (n) { try { n.stop(t + FADE + .01); } catch (e) { } });
        /* 已淡出,稍後斷線釋放;不依賴 onended(未 start 的節點可能不觸發) */
        setTimeout(function () { try { sess.bus.disconnect(); } catch (e) { } }, (FADE + .1) * 1000);
    }
    function stopAll() {
        if (cur) { var s = cur; cur = null; stopSession(s); }
        if (curAudio) {
            var a = curAudio; curAudio = null;
            try { a.pause(); a.currentTime = 0; } catch (e) { }
            if (a._revoke) a._revoke();
        }
    }
    function begin(c) {
        var bus = c.createGain();
        bus.gain.value = 1; bus.connect(master);
        cur = { bus: bus, nodes: [], n: 0 };
        return cur;
    }

    function tone(c, o) {
        var t = c.currentTime + (o.t0 || 0), dur = o.dur, osc = c.createOscillator(), f = c.createBiquadFilter(), g = c.createGain();
        osc.type = o.type || 'sawtooth';
        osc.frequency.setValueAtTime(o.f0, t);
        if (o.f1) osc.frequency.exponentialRampToValueAtTime(o.f1, t + dur);
        f.type = 'lowpass'; f.frequency.value = o.lp || 2000;
        g.gain.setValueAtTime(.0001, t);
        g.gain.linearRampToValueAtTime(o.gain || .5, t + (o.att || .03));
        g.gain.exponentialRampToValueAtTime(.0001, t + dur);
        osc.connect(f); f.connect(g); g.connect(dest());
        if (o.vib) {
            var l = c.createOscillator(), lg = c.createGain();
            l.frequency.value = o.vibHz || 6; lg.gain.value = o.vib;
            l.connect(lg); lg.connect(osc.frequency); track(l); l.start(t); l.stop(t + dur + .05);
        }
        track(osc); osc.start(t); osc.stop(t + dur + .05);
    }

    function noise(c, dur, gain, lp) {
        var n = Math.floor(c.sampleRate * dur), b = c.createBuffer(1, n, c.sampleRate), d = b.getChannelData(0);
        for (var i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / n);
        var s = c.createBufferSource(), f = c.createBiquadFilter(), g = c.createGain();
        s.buffer = b; f.type = 'lowpass'; f.frequency.value = lp; g.gain.value = gain;
        s.connect(f); f.connect(g); g.connect(dest()); track(s); s.start();
    }

    function loadBuf(s) {
        if ((!s.data && !s.buf) || F.buf[s.id]) return Promise.resolve();
        var c = getCtx();
        /* 新紀錄存 ArrayBuffer:解碼用複本(decodeAudioData 會 detach 原 buffer);舊紀錄為 data URL */
        /* 回傳 Promise(解碼成功或失敗皆 resolve),供啟動流程與閒置排程得知完成時機 */
        return (s.buf ? Promise.resolve(s.buf.slice(0)) : fetch(s.data).then(function (r) { return r.arrayBuffer(); }))
            .then(function (ab) { return new Promise(function (ok, no) { var p = c.decodeAudioData(ab, ok, no); if (p && p.then) p.then(ok, no); }); })
            .then(function (b) { F.buf[s.id] = b; }).catch(function () { F.buf[s.id] = null; });
    }

    function flash(el) {
        el.classList.add('flash');
        setTimeout(function () { el.classList.remove('flash'); }, 110);
    }

    function playBuf(c, b) {
        var sess = begin(c), src = c.createBufferSource();
        src.buffer = b; src.connect(sess.bus);
        track(src); src.start();
    }

    /* 單聲道:任何音效觸發時,先淡出並停止目前所有聲音,再播新的 */
    function play(s, el) {
        flash(el);
        document.dispatchEvent(new Event('fahhh:play'));
        /* 視覺回饋與「播放中」狀態:長度取 buffer 時長,合成音 700ms,Audio fallback 上限 3 秒 */
        var pb = s.fn ? null : F.buf[s.id];
        var end = F.hit ? F.hit(s, el, s.fn ? 700 : pb ? Math.max(150, pb.duration * 1000) : 3000) : null;
        if (navigator.vibrate) try { navigator.vibrate(50); } catch (e) { }
        var c = getCtx();
        stopAll();
        if (s.fn) {
            var sess = begin(c);
            try { s.fn(c); } catch (e) { }
            if (sess.n === 0) release(sess);
            return;
        }
        var b = F.buf[s.id];
        if (b) playBuf(c, b);
        else {
            try {
                var url = s.buf ? URL.createObjectURL(new Blob([s.buf], { type: s.type || 'audio/mpeg' })) : s.data;
                var a = new Audio(url); curAudio = a;
                if (s.buf) {
                    var done = false;
                    a._revoke = function () { if (done) return; done = true; try { URL.revokeObjectURL(url); } catch (e) { } };
                    a.onended = a.onerror = a._revoke;
                }
                if (end) a.addEventListener('ended', end);
                a.play().catch(function () { if (end) end(); });
            } catch (e) { }
            loadBuf(s);
        }
    }

    F.getCtx = getCtx; F.tone = tone; F.noise = noise; F.loadBuf = loadBuf; F.play = play;
})(window.Fahhh);
