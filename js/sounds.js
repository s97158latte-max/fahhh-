/* ---------- 內建音效 ---------- */
(function (F) {
    'use strict';
    var tone = F.tone, noise = F.noise;

    F.BUILTIN = [
        { id: 'b1', name: 'FAHHH!', emo: '😱', lock: true, data: 'audio/memes/fahhh.m4a' },
        { id: 'b2', name: 'Bruh', emo: '😑', lock: true, data: 'audio/memes/bruh-sound-effect_WstdzdM.mp3' },
        { id: 'b3', name: 'Vine Boom', emo: '💥', lock: true, data: 'audio/memes/vine-boom.mp3' },
        {
            id: 'b4', name: 'Wah Wah', emo: '🎺', fn: function (c) {
                var n = [[311, .5], [294, .5], [277, .5], [262, 1.2]], t = 0;
                n.forEach(function (x, i) { tone(c, { f0: x[0], dur: x[1], t0: t, gain: .5, lp: 900, att: .04, vib: i === 3 ? 6 : 0, vibHz: 5 }); t += x[1]; });
            }
        },
        { id: 'b30', name: 'Oh No No No', emo: '🎵', lock: true, lazy: true, data: 'audio/memes/oh-no-no-no-tik-tok-song-sound-effect.mp3' },
        { id: 'b31', name: 'Metal Pipe', emo: '🔩', lock: true, lazy: true, data: 'audio/memes/metal-pipe-falling-sound-effect.mp3' },
        { id: 'b32', name: 'Sheesh', emo: '😤', lock: true, lazy: true, data: 'audio/memes/original-sheesh.mp3' },
        { id: 'b33', name: 'Bong', emo: '🔔', lock: true, lazy: true, data: 'audio/memes/taco-bell-bong-meme-mp3.mp3' },
        { id: 'b34', name: 'Oof', emo: '🧱', lock: true, lazy: true, data: 'audio/memes/og-roblox-death-sound-effect-uhh-oof.mp3' },
        { id: 'b35', name: 'Airhorn', emo: '📯', lock: true, lazy: true, data: 'audio/memes/mlg-horns-sound-effect.mp3' },
        {
            id: 'b8', name: 'Rimshot', emo: '🥁', pin: true, fn: function (c) {
                tone(c, { type: 'sine', f0: 220, f1: 70, dur: .16, gain: .9, att: .004 });
                tone(c, { type: 'sine', f0: 180, f1: 60, dur: .18, t0: .17, gain: .9, att: .004 });
                noise(c, .12, .5, 4000, .17);
                noise(c, .7, .45, 10000, .45);
                tone(c, { type: 'sine', f0: 140, f1: 50, dur: .25, t0: .45, gain: .6, att: .004 });
            }
        },
        { id: 'b36', name: '哭啊', emo: '😭', lock: true, lazy: true, data: 'audio/memes/ku-a.mp3' },
        { id: 'b37', name: '安安啊', emo: '👋', lock: true, lazy: true, data: 'audio/memes/m_fixed_Eiqk86r.mp3' },
        { id: 'b38', name: '笑死', emo: '🤣', lock: true, lazy: true, data: 'audio/memes/m_fixed_gulctfL.mp3' },
        { id: 'b39', name: '口以鳴笛嗎', emo: '📢', lock: true, lazy: true, data: 'audio/memes/kou-yi-ming-di-ma.mp3' },
        { id: 'b40', name: '解除契約', emo: '📜', lock: true, lazy: true, data: 'audio/memes/jie-chu-qi-yue.mp3' },
        { id: 'b41', name: 'Wilhelm Scream', emo: '🤸', lock: true, pin: false, lazy: true, data: 'audio/memes/wilhelmscream.mp3' },
        { id: 'b42', name: 'XP Error', emo: '⚠️', lock: true, pin: false, lazy: true, data: 'audio/memes/windows-xp-critical-error-full-version.mp3' },
        { id: 'b43', name: 'What The Dog Doing', emo: '🐕', lock: true, pin: false, lazy: true, data: 'audio/memes/what-the-dog-doing_PzhJikU.mp3' },
        { id: 'b44', name: 'Sad Violin', emo: '🎻', lock: true, pin: false, lazy: true, data: 'audio/memes/meme-violin-sad-violin.mp3' },
        { id: 'b45', name: 'Emotional Damage', emo: '💔', lock: true, pin: false, lazy: true, data: 'audio/memes/emotional-damage-meme.mp3' },
        { id: 'b46', name: 'John Cena', emo: '🎺', lock: true, pin: false, lazy: true, data: 'audio/memes/and-his-name-is-john-cena.mp3' },
        { id: 'b47', name: 'Run', emo: '🏃', lock: true, pin: false, lazy: true, data: 'audio/memes/run-vine-sound-effect.mp3' },
        { id: 'b48', name: 'Get Out', emo: '🚪', lock: true, pin: false, lazy: true, data: 'audio/memes/get-out-tuco.mp3' },
        { id: 'b49', name: 'Yeet', emo: '🚀', lock: true, pin: false, lazy: true, data: 'audio/memes/yeet-sound-effect.mp3' },
        { id: 'b50', name: 'FBI Open Up', emo: '🚔', lock: true, pin: false, lazy: true, data: 'audio/memes/fbi-open-up-sfx.mp3' },
        { id: 'b51', name: 'Among Us', emo: '🕵️', lock: true, pin: false, lazy: true, data: 'audio/memes/among-us-role-reveal-sound.mp3' },
        { id: 'b52', name: '我就爛', emo: '🗑️', lock: true, pin: false, lazy: true, data: 'audio/memes/m_fixed_2yFrajR.mp3' },
        { id: 'b53', name: '屁啦', emo: '🙄', lock: true, pin: false, lazy: true, data: 'audio/memes/m_fixed_1412wOh.mp3' },
        { id: 'b54', name: '不要啦', emo: '🙅', lock: true, pin: false, lazy: true, data: 'audio/memes/m_fixed_fngPRAE.mp3' },
        { id: 'b55', name: '好棒喔三點了', emo: '🕒', lock: true, pin: false, lazy: true, data: 'audio/memes/m_fixed_exQlL7P.mp3' },
        { id: 'b56', name: '好貴喔', emo: '💸', lock: true, pin: false, lazy: true, data: 'audio/memes/m_fixed_J5aKmT4.mp3' },
        { id: 'b57', name: '太好啦', emo: '🎉', lock: true, pin: false, lazy: true, data: 'audio/memes/tai-hao-la.mp3' },
        { id: 'b58', name: '哈哈', emo: '😆', lock: true, pin: false, lazy: true, data: 'audio/memes/m_fixed_EoqfY8A.mp3' }
    ];
    F.custom = [];
    F.all = function () { return F.BUILTIN.concat(F.custom); };
})(window.Fahhh);
