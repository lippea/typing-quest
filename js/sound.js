// Tiny generated sound effects; no audio files needed.
const Sound = (() => {
  let ctx = null;
  let muted = false;

  function audio() {
    if (!ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      ctx = new AC();
    }
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  }

  function tone(freq, dur, { type = 'square', vol = 0.06, delay = 0, slideTo = null } = {}) {
    if (muted) return;
    const ac = audio();
    if (!ac) return;
    const t0 = ac.currentTime + delay;
    const osc = ac.createOscillator();
    const gain = ac.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t0);
    if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, t0 + dur);
    gain.gain.setValueAtTime(vol, t0);
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    osc.connect(gain).connect(ac.destination);
    osc.start(t0);
    osc.stop(t0 + dur + 0.02);
  }

  return {
    setMuted(m) { muted = m; },
    isMuted() { return muted; },
    unlock() { if (!muted) audio(); },
    key() { tone(1100 + Math.random() * 300, 0.03, { type: 'triangle', vol: 0.025 }); },
    error() {
      tone(180, 0.4, { type: 'sawtooth', vol: 0.1, slideTo: 55 });
      tone(120, 0.4, { type: 'square', vol: 0.05, slideTo: 40 });
    },
    coin() {
      tone(988, 0.07, { vol: 0.05 });
      tone(1319, 0.18, { vol: 0.05, delay: 0.07 });
    },
    win() {
      [523, 659, 784, 1047, 784, 1047].forEach((f, i) =>
        tone(f, 0.2, { vol: 0.06, delay: i * 0.11 }));
    },
    badge() {
      [784, 988, 1175, 1568].forEach((f, i) =>
        tone(f, 0.15, { type: 'triangle', vol: 0.07, delay: i * 0.08 }));
    },
    twist() {
      [392, 370, 349, 330].forEach((f, i) =>
        tone(f, 0.22, { type: 'sawtooth', vol: 0.05, delay: i * 0.18 }));
    },
    secret() {
      [523, 784, 659, 1047, 1319, 1568].forEach((f, i) =>
        tone(f, 0.12, { type: 'triangle', vol: 0.07, delay: i * 0.07 }));
    },
  };
})();
