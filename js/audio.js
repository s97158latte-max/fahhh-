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

    function play(s, el) {
        flash(el);
        if (navigator.vibrate) try { navigator.vibrate(50); } catch (e) { }
        var c = getCtx();
        if (s.fn) { s.fn(c); return; }
        var b = F.buf[s.id];
        if (b) { var src = c.createBufferSource(); src.buffer = b; src.connect(master); src.start(); }
        else { try { new Audio(s.data).play().catch(function () { }); } catch (e) { } loadBuf(s); }
    }

    F.getCtx = getCtx; F.tone = tone; F.noise = noise; F.loadBuf = loadBuf; F.play = play;
})(window.Fahhh);
