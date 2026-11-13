/* ---------- 內建音效 ---------- */
(function (F) {
    'use strict';
    var tone = F.tone, noise = F.noise;

    F.BUILTIN = [
        { id: 'b1', name: 'FAHHH!', emo: '😱', lock: true, data: 'audio/fahhh.m4a' },
        {
            id: 'b2', name: 'Bruh', emo: '😑', fn: function (c) {
                tone(c, { f0: 180, f1: 90, dur: .45, gain: .7, lp: 700 });
                tone(c, { type: 'square', f0: 90, f1: 60, dur: .3, t0: .12, gain: .25, lp: 400 });
            }
        },
        {
            id: 'b3', name: 'Boom', emo: '💥', fn: function (c) {
                tone(c, { type: 'sine', f0: 170, f1: 35, dur: 1.1, gain: 1, att: .01 });
                noise(c, .15, .6, 900);
            }
        },
        {
            id: 'b4', name: 'Wah Wah', emo: '🎺', fn: function (c) {
                var n = [[311, .5], [294, .5], [277, .5], [262, 1.2]], t = 0;
                n.forEach(function (x, i) { tone(c, { f0: x[0], dur: x[1], t0: t, gain: .5, lp: 900, att: .04, vib: i === 3 ? 6 : 0, vibHz: 5 }); t += x[1]; });
            }
        },
        {
            id: 'b5', name: 'Ding', emo: '🔔', fn: function (c) {
                tone(c, { type: 'sine', f0: 1318, dur: 1.1, gain: .55, att: .005, lp: 6000 });
                tone(c, { type: 'sine', f0: 2637, dur: .6, gain: .14, att: .005, lp: 8000 });
            }
        },
        {
            id: 'b6', name: 'Error', emo: '❌', fn: function (c) {
                tone(c, { type: 'square', f0: 440, dur: .2, gain: .3, att: .005, lp: 3000 });
                tone(c, { type: 'square', f0: 440, dur: .28, t0: .24, gain: .3, att: .005, lp: 3000 });
            }
        },
        {
            id: 'b7', name: 'Coin', emo: '🪙', fn: function (c) {
                tone(c, { type: 'square', f0: 988, dur: .09, gain: .28, att: .004, lp: 5000 });
                tone(c, { type: 'square', f0: 1319, dur: .7, t0: .08, gain: .28, att: .004, lp: 5000 });
            }
        },
        {
            id: 'b8', name: 'Rimshot', emo: '🥁', fn: function (c) {
                tone(c, { type: 'sine', f0: 220, f1: 70, dur: .16, gain: .9, att: .004 });
                tone(c, { type: 'sine', f0: 180, f1: 60, dur: .18, t0: .17, gain: .9, att: .004 });
                noise(c, .12, .5, 4000, .17);
                noise(c, .7, .45, 10000, .45);
                tone(c, { type: 'sine', f0: 140, f1: 50, dur: .25, t0: .45, gain: .6, att: .004 });
            }
        },
        {
            id: 'b9', name: 'Crickets', emo: '🦗', fn: function (c) {
                for (var g = 0; g < 2; g++) for (var i = 0; i < 3; i++)
                    tone(c, { type: 'square', f0: 4200, dur: .05, t0: g * .55 + i * .08, gain: .12, att: .004, lp: 6000 });
            }
        },
        {
            id: 'b10', name: 'Fail Slide', emo: '📉', fn: function (c) {
                tone(c, { f0: 330, f1: 196, dur: 1.5, gain: .5, lp: 900, att: .08, vib: 6, vibHz: 6 });
            }
        },
        {
            id: 'b11', name: 'Siren', emo: '🚨', fn: function (c) {
                for (var i = 0; i < 5; i++)
                    tone(c, { type: 'square', f0: i % 2 ? 950 : 600, f1: i % 2 ? 600 : 950, dur: .45, t0: i * .45, gain: .3, att: .03, lp: 2500 });
            }
        },
        {
            id: 'b12', name: 'Buzz', emo: '📳', fn: function (c) {
                for (var i = 0; i < 4; i++)
                    tone(c, { type: 'square', f0: 120, dur: .14, t0: i * .2, gain: .5, att: .005, lp: 500 });
            }
        },
        {
            id: 'b13', name: 'Nokia', emo: '📱', fn: function (c) {
                var n = [[659, 1], [587, 1], [370, 2], [415, 2], [554, 1], [494, 1], [294, 2], [330, 2], [494, 1], [440, 1], [277, 2], [330, 2], [440, 5]], t = 0, u = .085;
                n.forEach(function (x) { tone(c, { type: 'square', f0: x[0], dur: x[1] * u * .95, t0: t, gain: .22, att: .004, lp: 3500 }); t += x[1] * u; });
            }
        },
        {
            id: 'b14', name: 'Startup', emo: '🖥️', fn: function (c) {
                [311, 466, 415, 622].forEach(function (f, i) { tone(c, { type: 'sine', f0: f, dur: .5, t0: i * .2, gain: .35, att: .02, lp: 3000 }); });
                [415, 622, 831, 1047].forEach(function (f) { tone(c, { type: 'sine', f0: f, dur: 1.6, t0: .85, gain: .2, att: .05, lp: 3000 }); });
            }
        }
    ];
    F.custom = [];
    F.all = function () { return F.BUILTIN.concat(F.custom); };
})(window.Fahhh);
