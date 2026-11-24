const AntiCheat = (() => {
  const FAST_MS = 15;
  const FAST_LIMIT = 6;
  const WINDOW = 20;
  const STEADY_SAMPLE = 15;
  const STEADY_MAX_SD = 3;

  let intervals = [];
  let last = null;

  function reset() {
    intervals = [];
    last = null;
  }

  // Returns true when the recent keystroke rhythm looks scripted:
  // lots of near-instant keys, or a metronome-perfect cadence.
  function record(t) {
    if (last !== null) intervals.push(t - last);
    last = t;
    if (intervals.length > WINDOW) intervals.shift();

    if (intervals.filter(x => x < FAST_MS).length >= FAST_LIMIT) return true;

    if (intervals.length >= STEADY_SAMPLE) {
      const recent = intervals.slice(-STEADY_SAMPLE);
      const mean = recent.reduce((a, b) => a + b, 0) / recent.length;
      const variance = recent.reduce((a, b) => a + (b - mean) ** 2, 0) / recent.length;
      if (mean < 250 && Math.sqrt(variance) < STEADY_MAX_SD) return true;
    }
    return false;
  }

  function install({ onCheat }) {
    const block = e => e.preventDefault();
    ['copy', 'cut', 'contextmenu', 'selectstart', 'dragstart', 'dragover'].forEach(ev =>
      document.addEventListener(ev, block));

    document.addEventListener('paste', e => { e.preventDefault(); onCheat('paste'); });
    document.addEventListener('drop', e => { e.preventDefault(); onCheat('paste'); });

    window.addEventListener('blur', () => onCheat('focus'));
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) onCheat('focus');
    });
  }

  return { install, record, reset };
})();
