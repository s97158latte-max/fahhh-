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
        }
    ];
    F.custom = [];
    F.all = function () { return F.BUILTIN.concat(F.custom); };
})(window.Fahhh);
