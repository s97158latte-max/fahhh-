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

    function tone(c, o) {
        var t = c.currentTime + (o.t0 || 0), dur = o.dur, osc = c.createOscillator(), f = c.createBiquadFilter(), g = c.createGain();
        osc.type = o.type || 'sawtooth';
        osc.frequency.setValueAtTime(o.f0, t);
        if (o.f1) osc.frequency.exponentialRampToValueAtTime(o.f1, t + dur);
        f.type = 'lowpass'; f.frequency.value = o.lp || 2000;
        g.gain.setValueAtTime(.0001, t);
        g.gain.linearRampToValueAtTime(o.gain || .5, t + (o.att || .03));
        g.gain.exponentialRampToValueAtTime(.0001, t + dur);
        osc.connect(f); f.connect(g); g.connect(master);
        if (o.vib) {
            var l = c.createOscillator(), lg = c.createGain();
            l.frequency.value = o.vibHz || 6; lg.gain.value = o.vib;
            l.connect(lg); lg.connect(osc.frequency); l.start(t); l.stop(t + dur + .05);
        }
        osc.start(t); osc.stop(t + dur + .05);
    }

    function noise(c, dur, gain, lp) {
        var n = Math.floor(c.sampleRate * dur), b = c.createBuffer(1, n, c.sampleRate), d = b.getChannelData(0);
        for (var i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / n);
        var s = c.createBufferSource(), f = c.createBiquadFilter(), g = c.createGain();
        s.buffer = b; f.type = 'lowpass'; f.frequency.value = lp; g.gain.value = gain;
        s.connect(f); f.connect(g); g.connect(master); s.start();
    }

    function loadBuf(s) {
        if (!s.data || F.buf[s.id]) return;
        var c = getCtx();
        fetch(s.data).then(function (r) { return r.arrayBuffer(); })
            .then(function (ab) { return new Promise(function (ok, no) { var p = c.decodeAudioData(ab, ok, no); if (p && p.then) p.then(ok, no); }); })
            .then(function (b) { F.buf[s.id] = b; }).catch(function () { F.buf[s.id] = null; });
    }

    function flash(el) {
        el.classList.add('flash');
        setTimeout(function () { el.classList.remove('flash'); }, 110);
    }

    /* 取樣音檔的發聲追蹤:同 id 重播切掉前一聲,全域上限切掉最舊 */
    var MAX_VOICES = 8, FADE = .03, FN_GAP = 40;
    var voices = [], lastFn = {};

    function stopVoice(v) {
        var i = voices.indexOf(v);
        if (i < 0) return;
        voices.splice(i, 1);
        try {
            var t = ctx.currentTime;
            v.g.gain.cancelScheduledValues(t);
            v.g.gain.setValueAtTime(v.g.gain.value, t);
            v.g.gain.linearRampToValueAtTime(0, t + FADE);
            v.src.stop(t + FADE + .01);
        } catch (e) { }
    }

    function playBuf(c, s, b) {
        for (var i = voices.length - 1; i >= 0; i--) if (voices[i].id === s.id) stopVoice(voices[i]);
        while (voices.length >= MAX_VOICES) stopVoice(voices[0]);
        var src = c.createBufferSource(), g = c.createGain(), v = { id: s.id, src: src, g: g };
        src.buffer = b; src.connect(g); g.connect(master);
        src.onended = function () {
            var k = voices.indexOf(v);
            if (k >= 0) voices.splice(k, 1);
            try { src.disconnect(); g.disconnect(); } catch (e) { }
        };
        voices.push(v);
        src.start();
    }

    function play(s, el) {
        flash(el);
        if (navigator.vibrate) try { navigator.vibrate(50); } catch (e) { }
        var c = getCtx();
        if (s.fn) {
            var now = Date.now();
            if (lastFn[s.id] && now - lastFn[s.id] < FN_GAP) return;
            lastFn[s.id] = now;
            s.fn(c); return;
        }
        var b = F.buf[s.id];
        if (b) playBuf(c, s, b);
        else { try { new Audio(s.data).play().catch(function () { }); } catch (e) { } loadBuf(s); }
    }

    F.getCtx = getCtx; F.tone = tone; F.noise = noise; F.loadBuf = loadBuf; F.play = play;
})(window.Fahhh);
