const Surprises = (() => {
  const BADGES = [
    { id: 'first-win', icon: '1', name: 'Off the Mark', desc: 'Beat your first level.' },
    { id: 'unbreakable', icon: 'U', name: 'Unbreakable', desc: '100 correct keys in a row.' },
    { id: 'comeback', icon: 'C', name: 'Comeback Kid', desc: 'Win a level after 10+ failed attempts.' },
    { id: 'speed-demon', icon: 'S', name: 'Speed Demon', desc: 'Hit 60+ words per minute.' },
    { id: 'night-owl', icon: 'N', name: 'Night Owl', desc: 'Win a level after 9pm.' },
    { id: 'golden-touch', icon: 'G', name: 'Golden Touch', desc: 'Grab every golden letter in one run.' },
    { id: 'boss-slayer', icon: 'B', name: 'Boss Slayer', desc: 'Beat all four boss levels.' },
    { id: 'champion', icon: 'W', name: 'Champion', desc: 'Defeat the Final Boss.' },
    { id: 'nightmare', icon: 'X', name: 'Nightmare Survivor', desc: 'Beat a level in Nightmare Mode.' },
    { id: 'big-spender', icon: '$', name: 'Big Spender', desc: 'Buy something from the Coin Shop.' },
    { id: 'iron-will', icon: 'I', name: 'Iron Will', desc: 'Fail 50 times and keep going.' },
    { id: 'konami', icon: '?', name: 'Secret Agent', desc: 'Found the secret level.', secret: true },
  ];

  const SHOP = [
    { id: 'skin-classic', type: 'skin', value: 'classic', name: 'Classic Block', price: 0 },
    { id: 'skin-underline', type: 'skin', value: 'underline', name: 'Blinky Line', price: 40 },
    { id: 'skin-ghost', type: 'skin', value: 'ghost', name: 'Spooky Box', price: 80 },
    { id: 'skin-flame', type: 'skin', value: 'flame', name: 'On Fire', price: 150 },
    { id: 'skin-rainbow', type: 'skin', value: 'rainbow', name: 'Rainbow Rage', price: 250 },
    { id: 'theme-arcade', type: 'theme', value: 'arcade', name: 'Arcade', price: 0,
      swatch: ['#0f1024', '#36e2ff', '#4cff8f', '#ff4d6d'] },
    { id: 'theme-ice', type: 'theme', value: 'ice', name: 'Ice Cold', price: 100,
      swatch: ['#06142a', '#7fdbff', '#5cffd6', '#ff5c8a'] },
    { id: 'theme-matrix', type: 'theme', value: 'matrix', name: 'The Matrix', price: 180,
      swatch: ['#000000', '#00ff66', '#e6ffe6', '#ff3b3b'] },
    { id: 'theme-lava', type: 'theme', value: 'lava', name: 'Lava Lair', price: 300,
      swatch: ['#1a0905', '#ff6a2b', '#ffd166', '#ff2e4d'] },
  ];

  const FAIL_JOKES = {
    5: 'Five fails. Your keyboard is filing a complaint.',
    10: 'Ten fails! Legend says the letters are laughing at you.',
    15: 'Fun fact: nobody has ever won by smashing the keys harder.',
    20: 'Twenty fails. At this point the keyboard needs a holiday.',
    30: 'Thirty! Your fingers have entered the chat... and left it.',
    50: 'FIFTY. Respect. Most people would have rage-quit by now.',
  };

  const FAIL_LINES = [
    'Back to the start!',
    'Oof. From the top!',
    'So close... not really.',
    'The keyboard wins this round.',
    'Wiped! Try again.',
  ];

  const WIN_TITLES = ['LEGEND!', 'UNSTOPPABLE!', 'CLEAN RUN!', 'FLAWLESS!', 'NAILED IT!', 'GG!'];

  const KONAMI = ['arrowup', 'arrowup', 'arrowdown', 'arrowdown', 'arrowleft', 'arrowright',
    'arrowleft', 'arrowright', 'b', 'a'];
  let konamiPos = 0;

  function feedKonami(key) {
    const k = key.toLowerCase();
    if (k === KONAMI[konamiPos]) {
      konamiPos++;
      if (konamiPos === KONAMI.length) {
        konamiPos = 0;
        return true;
      }
    } else {
      konamiPos = k === KONAMI[0] ? 1 : 0;
    }
    return false;
  }

  function pickGoldens(text) {
    const n = text.length < 40 ? 1 : text.length < 120 ? 2 : text.length < 250 ? 3 : 4;
    const candidates = [];
    for (let i = 3; i < text.length; i++) if (text[i] !== ' ') candidates.push(i);
    const chosen = new Set();
    while (chosen.size < n && chosen.size < candidates.length) {
      chosen.add(candidates[Math.floor(Math.random() * candidates.length)]);
    }
    return chosen;
  }

  function isNight() {
    const h = new Date().getHours();
    return h >= 21 || h < 5;
  }

  function pick(list) {
    return list[Math.floor(Math.random() * list.length)];
  }

  function confetti(count = 140) {
    const box = document.getElementById('confetti');
    const palette = ['#ffd23f', '#36e2ff', '#4cff8f', '#ff4d6d', '#b388ff', '#ffffff'];
    for (let i = 0; i < count; i++) {
      const piece = document.createElement('div');
      piece.className = 'confetti-piece';
      piece.style.left = Math.random() * 100 + 'vw';
      piece.style.background = pick(palette);
      piece.style.animationDuration = 2 + Math.random() * 2.5 + 's';
      piece.style.animationDelay = Math.random() * 0.6 + 's';
      piece.style.transform = `rotate(${Math.random() * 360}deg)`;
      box.appendChild(piece);
      setTimeout(() => piece.remove(), 5500);
    }
  }

  return {
    BADGES, SHOP, FAIL_JOKES, FAIL_LINES, WIN_TITLES,
    feedKonami, pickGoldens, isNight, pick, confetti,
  };
})();
