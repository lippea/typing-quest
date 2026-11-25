// Progress lives in localStorage, signed with a simple checksum so that
// hand-editing the save in devtools resets it.
const Storage = (() => {
  const KEY = 'typoTerror.save.v3';
  const OLD_KEYS = ['typoTerror.save.v1', 'typoTerror.save.v2'];
  const SALT = 'tt-y7-no-cheaters-2026';
  let tampered = false;

  OLD_KEYS.forEach(k => localStorage.removeItem(k));

  function defaults() {
    return {
      unlocked: 1,
      stars: {},
      coins: 0,
      badges: [],
      owned: ['skin-classic', 'theme-arcade'],
      skin: 'classic',
      theme: 'arcade',
      nightmareUnlocked: false,
      secretUnlocked: false,
      muted: false,
      ghosts: {},
      totalFails: 0,
    };
  }

  function hash(str) {
    let h1 = 5381, h2 = 52711;
    for (let i = 0; i < str.length; i++) {
      const c = str.charCodeAt(i);
      h1 = (h1 * 33) ^ c;
      h2 = (h2 * 31 + c) | 0;
    }
    return ((h1 >>> 0).toString(36) + (h2 >>> 0).toString(36));
  }

  function load() {
    const raw = localStorage.getItem(KEY);
    if (!raw) return defaults();
    try {
      const { data, sig } = JSON.parse(raw);
      const body = JSON.stringify(data);
      if (sig !== hash(body + SALT)) throw new Error('bad signature');
      return Object.assign(defaults(), data);
    } catch (e) {
      tampered = true;
      localStorage.removeItem(KEY);
      return defaults();
    }
  }

  function save(data) {
    const body = JSON.stringify(data);
    localStorage.setItem(KEY, JSON.stringify({ data, sig: hash(body + SALT) }));
  }

  return { load, save, wasTampered: () => tampered };
})();
