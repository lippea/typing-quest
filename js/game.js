(() => {
  const $ = sel => document.querySelector(sel);

  const RESET_LOCK_MS = 700;
  const COUNTDOWN_WPM = 18;
  const NIGHTMARE_COUNTDOWN_WPM = 25;
  const DEFAULT_GHOST_WPM = 25;
  const NIGHTMARE_CYCLE = ['fade', 'countdown', 'ghost', 'final'];
  const BOSS_IDS = [3, 6, 9, 12];

  let save = Storage.load();
  let screen = 'title';
  let nightmare = false;
  let modalOpenedAt = 0;
  let loopRunning = false;

  const S = {
    level: null,
    mods: {},
    passage: null,
    passageIdx: -1,
    text: '',
    twistPending: null,
    index: 0,
    attemptStart: 0,
    startTime: null,
    timeline: [],
    goldens: new Set(),
    goldenHit: 0,
    timeLimit: 0,
    ghostTimeline: null,
    fails: 0,
    attempts: 1,
    streak: 0,
    locked: false,
    failAt: 0,
    result: null,
  };

  // ---------- helpers ----------

  function persist() { Storage.save(save); }

  function toast(msg, type = 'info', ms = 2400) {
    const el = document.createElement('div');
    el.className = 'toast ' + type;
    el.textContent = msg;
    $('#toasts').appendChild(el);
    setTimeout(() => el.classList.add('out'), ms);
    setTimeout(() => el.remove(), ms + 350);
  }

  function refreshCoins(bump = false) {
    $('#coinCount').textContent = save.coins;
    if (bump) {
      const c = $('.coins');
      c.classList.remove('bump');
      void c.offsetWidth;
      c.classList.add('bump');
    }
  }

  function refreshMute() {
    $('#muteBtn').textContent = save.muted ? 'Sound: Off' : 'Sound: On';
    Sound.setMuted(save.muted);
  }

  function applyTheme() {
    document.body.dataset.theme = save.theme;
    Renderer.readColors();
  }

  function award(id) {
    if (save.badges.includes(id)) return;
    save.badges.push(id);
    persist();
    const badge = Surprises.BADGES.find(b => b.id === id);
    Sound.badge();
    toast(`Badge unlocked: ${badge.name}!`, 'badge', 3200);
  }

  function starsKey(id) { return (nightmare ? 'n' : '') + id; }

  function starString(n) {
    return '\u2605'.repeat(n) + '\u2606'.repeat(3 - n);
  }

  function levelIndex(level) {
    return level.id === 'secret' ? 0 : level.id - 1;
  }

  function charLabel(ch) {
    return ch === ' ' ? 'space' : `"${ch}"`;
  }

  // ---------- screens ----------

  function showScreen(name) {
    document.querySelectorAll('.screen').forEach(el => {
      el.hidden = el.id !== 'screen-' + name;
    });
    screen = name;
    if (document.activeElement && document.activeElement !== document.body) document.activeElement.blur();
    document.body.classList.toggle('nightmare', nightmare && (name === 'map' || name === 'play'));
    if (name === 'map') renderMap();
    if (name === 'shop') renderShop();
    if (name === 'badges') renderBadges();
  }

  function renderMap() {
    const toggle = $('#nightmareToggle');
    toggle.hidden = !save.nightmareUnlocked;
    $('#nightmareCheck').checked = nightmare;

    const wrap = $('#worlds');
    wrap.innerHTML = '';

    WORLDS.forEach(world => {
      const section = document.createElement('div');
      section.className = 'world';
      section.innerHTML = `<h3>World ${world.id}: ${world.name}</h3>`;
      const tiles = document.createElement('div');
      tiles.className = 'tiles';
      LEVELS.filter(l => l.world === world.id).forEach(level => {
        tiles.appendChild(makeTile(level, level.id > save.unlocked));
      });
      section.appendChild(tiles);
      wrap.appendChild(section);
    });

    if (save.secretUnlocked) {
      const section = document.createElement('div');
      section.className = 'world';
      section.innerHTML = '<h3>Secret World</h3>';
      const tiles = document.createElement('div');
      tiles.className = 'tiles';
      tiles.appendChild(makeTile(SECRET_LEVEL, false));
      section.appendChild(tiles);
      wrap.appendChild(section);
    }
  }

  function makeTile(level, locked) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'tile' + (level.boss ? ' boss' : '') + (level.id === 'secret' ? ' secret' : '');
    btn.disabled = locked;
    const stars = save.stars[starsKey(level.id)] || 0;
    const num = level.id === 'secret' ? '??' : level.id;
    btn.innerHTML = `
      ${level.boss ? '<span class="tag">BOSS</span>' : ''}
      <span class="num">${num}</span>
      <span class="name">${locked ? 'Locked' : level.name}</span>
      <span class="tile-stars">${locked ? '' : starString(stars)}</span>`;
    btn.addEventListener('click', () => startLevel(level.id));
    return btn;
  }

  function renderShop() {
    const fill = (type, el) => {
      el.innerHTML = '';
      Surprises.SHOP.filter(i => i.type === type).forEach(item => {
        const owned = save.owned.includes(item.id);
        const equipped = save[type] === item.value;
        const card = document.createElement('div');
        card.className = 'card' + (equipped ? ' equipped' : '');
        const preview = type === 'skin'
          ? `<div class="skin-preview skin-${item.value}">ty<b>p</b>o</div>`
          : `<div class="swatch">${item.swatch.map(c => `<span style="background:${c}"></span>`).join('')}</div>`;
        card.innerHTML = `
          ${preview}
          <div class="card-name">${item.name}</div>
          <div class="price">${item.price ? item.price + ' coins' : 'Free'}</div>`;
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'btn';
        if (equipped) {
          btn.textContent = 'Equipped';
          btn.disabled = true;
        } else if (owned) {
          btn.textContent = 'Equip';
          btn.addEventListener('click', () => equip(item));
        } else {
          btn.textContent = `Buy (${item.price})`;
          btn.disabled = save.coins < item.price;
          btn.addEventListener('click', () => buy(item));
        }
        card.appendChild(btn);
        el.appendChild(card);
      });
    };
    fill('skin', $('#shopSkins'));
    fill('theme', $('#shopThemes'));
  }

  function buy(item) {
    if (save.coins < item.price || save.owned.includes(item.id)) return;
    save.coins -= item.price;
    save.owned.push(item.id);
    refreshCoins(true);
    Sound.coin();
    award('big-spender');
    equip(item);
  }

  function equip(item) {
    save[item.type] = item.value;
    persist();
    if (item.type === 'theme') applyTheme();
    renderShop();
  }

  function renderBadges() {
    const grid = $('#badgeGrid');
    grid.innerHTML = '';
    Surprises.BADGES.forEach(b => {
      const earned = save.badges.includes(b.id);
      const hidden = b.secret && !earned;
      const card = document.createElement('div');
      card.className = 'card badge-card' + (earned ? '' : ' locked');
      card.innerHTML = `
        <div class="medal">${earned ? b.icon : '?'}</div>
        <div class="card-name">${hidden ? '???' : b.name}</div>
        <div class="card-desc">${hidden ? 'Some secrets are hidden in plain sight...' : b.desc}</div>`;
      grid.appendChild(card);
    });
  }

  // ---------- gameplay ----------

  function modsFor(level) {
    const m = { fade: false, countdown: false, ghost: false, reveal: false, wobble: false };
    const apply = boss => {
      if (boss === 'final') { m.reveal = true; m.wobble = true; }
      else if (boss) m[boss] = true;
    };
    apply(level.boss);
    if (nightmare) {
      if (level.boss) apply(level.boss === 'countdown' ? 'fade' : 'countdown');
      else apply(NIGHTMARE_CYCLE[levelIndex(level) % NIGHTMARE_CYCLE.length]);
    }
    return m;
  }

  function modDescription(mods) {
    const parts = [];
    if (mods.reveal) parts.push(BOSS_INFO.final);
    if (mods.fade) parts.push(BOSS_INFO.fade);
    if (mods.countdown) parts.push(BOSS_INFO.countdown);
    if (mods.ghost) parts.push(BOSS_INFO.ghost);
    return parts.join(' ');
  }

  function ghostKey() { return starsKey(S.level.id); }

  function countdownMs(chars) {
    const wpm = nightmare ? NIGHTMARE_COUNTDOWN_WPM : COUNTDOWN_WPM;
    return Math.ceil((chars / 5) / wpm * 60000);
  }

  function startLevel(id) {
    S.level = getLevel(id);
    S.mods = modsFor(S.level);
    S.fails = 0;
    S.attempts = 1;
    S.passageIdx = -1;
    closeModal();
    showScreen('play');

    const prefix = S.level.id === 'secret' ? 'Secret Level' : `Level ${S.level.id}`;
    $('#hudLevel').textContent = `${nightmare ? 'NIGHTMARE ' : ''}${prefix}: ${S.level.name}`;
    const desc = modDescription(S.mods);
    $('#hudMod').hidden = !desc;
    $('#hudMod').textContent = desc;
    $('#ghostBarWrap').hidden = !S.mods.ghost;
    $('#hudTimerLabel').textContent = S.mods.countdown ? 'Left' : 'Time';
    if (desc && S.level.boss) toast(`BOSS LEVEL! ${desc}`, 'bad', 3500);
    else if (desc) toast(desc, 'bad', 3000);

    newAttempt();
    startLoop();
  }

  function newAttempt() {
    const pool = S.level.passages;
    let idx = Math.floor(Math.random() * pool.length);
    if (pool.length > 1 && idx === S.passageIdx) idx = (idx + 1) % pool.length;
    S.passageIdx = idx;
    S.passage = normalizePassage(pool[idx]);
    S.text = S.passage.text;
    S.twistPending = S.passage.twist || null;
    S.index = 0;
    S.startTime = null;
    S.attemptStart = performance.now();
    S.timeline = [];
    S.goldens = Surprises.pickGoldens(S.text);
    S.goldenHit = 0;
    S.timeLimit = S.mods.countdown ? countdownMs(S.text.length) + 3000 : 0;
    S.ghostTimeline = S.mods.ghost ? (save.ghosts[ghostKey()] || null) : null;
    S.locked = false;
    AntiCheat.reset();
    Renderer.clearPopups();
    Renderer.layout(S.text);
    $('#stage').classList.remove('fail');
    $('#stagePrompt').hidden = false;
    updateHud(performance.now());
  }

  function ghostIndexAt(now) {
    if (!S.mods.ghost || !S.startTime) return null;
    const t = now - S.startTime;
    const tl = S.ghostTimeline;
    if (!tl || !tl.length) {
      return Math.floor(t / (60000 / (DEFAULT_GHOST_WPM * 5)));
    }
    let i = 0;
    while (i < tl.length && tl[i] <= t) i++;
    if (i === tl.length) {
      const avg = tl[tl.length - 1] / tl.length || 1;
      i += Math.floor((t - tl[tl.length - 1]) / avg);
    }
    return i;
  }

  function updateHud(now) {
    $('#hudAttempt').textContent = S.attempts;
    $('#hudGold').textContent = `${S.goldenHit}/${S.goldens.size}`;
    const timerStat = $('#hudTimer').parentElement;
    if (S.mods.countdown) {
      const left = S.startTime ? Math.max(0, S.timeLimit - (now - S.startTime)) : S.timeLimit;
      $('#hudTimer').textContent = (left / 1000).toFixed(1);
      timerStat.classList.toggle('danger', left < 10000);
    } else {
      const elapsed = S.startTime ? now - S.startTime : 0;
      $('#hudTimer').textContent = (elapsed / 1000).toFixed(1);
      timerStat.classList.remove('danger');
    }
    $('#barYou').style.width = (S.index / S.text.length * 100) + '%';
    if (S.mods.ghost) {
      const g = Math.min(S.text.length, ghostIndexAt(now) || 0);
      $('#barGhost').style.width = (g / S.text.length * 100) + '%';
    }
  }

  function startLoop() {
    if (loopRunning) return;
    loopRunning = true;
    const frame = () => {
      if (screen !== 'play') { loopRunning = false; return; }
      const now = performance.now();
      tick(now);
      Renderer.draw({
        text: S.text,
        index: S.index,
        goldens: S.goldens,
        mods: S.mods,
        attemptStart: S.attemptStart,
        now,
        ghostIndex: S.mods.ghost ? ghostIndexAt(now) : null,
        skin: save.skin,
        failAt: S.failAt,
      });
      requestAnimationFrame(frame);
    };
    requestAnimationFrame(frame);
  }

  function tick(now) {
    updateHud(now);
    if (S.locked || !S.startTime) return;
    if (S.mods.countdown && now - S.startTime > S.timeLimit) fail('time');
    else if (S.mods.ghost && ghostIndexAt(now) >= S.text.length) fail('ghost');
  }

  function handleChar(ch, t) {
    if (S.locked) return;
    if (AntiCheat.record(t)) { fail('bot'); return; }

    const expected = S.text[S.index];
    if (ch !== expected) { fail('typo', ch, expected); return; }

    const now = performance.now();
    if (!S.startTime) {
      S.startTime = now;
      $('#stagePrompt').hidden = true;
    }
    S.timeline.push(Math.round(now - S.startTime));

    if (S.goldens.has(S.index)) {
      S.goldenHit++;
      Sound.coin();
      Renderer.popup(S.index, '+5');
    } else {
      Sound.key();
    }

    S.index++;
    S.streak++;
    if (S.streak >= 100) award('unbreakable');

    if (S.index >= S.text.length) {
      if (S.twistPending) plotTwist();
      else win();
    }
  }

  function plotTwist() {
    const extra = S.twistPending;
    S.twistPending = null;
    S.text += extra;
    if (S.mods.countdown) S.timeLimit += countdownMs(extra.length);
    Renderer.layout(S.text);
    Sound.twist();
    toast('PLOT TWIST! You are not done yet...', 'joke', 2600);
  }

  function fail(reason, typed, expected) {
    if (S.locked) return;
    S.locked = true;
    S.fails++;
    S.streak = 0;
    S.failAt = performance.now();
    save.totalFails++;
    persist();
    if (save.totalFails >= 50) award('iron-will');

    Sound.error();
    const stage = $('#stage');
    stage.classList.remove('shake');
    void stage.offsetWidth;
    stage.classList.add('shake', 'fail');

    const messages = {
      typo: `You typed ${charLabel(typed)} but needed ${charLabel(expected)}. ${Surprises.pick(Surprises.FAIL_LINES)}`,
      bot: 'Robot fingers detected! Humans only, please.',
      paste: 'Nice try. Pasting is not allowed!',
      focus: 'You left the game, so your run reset. Stay focused!',
      time: 'Out of time! Back to the start.',
      ghost: 'The ghost beat you! Back to the start.',
    };
    toast(messages[reason], 'bad', 2600);
    const joke = Surprises.FAIL_JOKES[S.fails];
    if (joke) setTimeout(() => toast(joke, 'joke', 3500), 500);

    setTimeout(() => {
      if (screen !== 'play') return;
      S.attempts++;
      newAttempt();
    }, RESET_LOCK_MS);
  }

  function win() {
    S.locked = true;
    const now = performance.now();
    const ms = Math.max(1, now - S.startTime);
    const chars = S.text.length;
    const wpm = Math.round((chars / 5) / (ms / 60000));
    const stars = wpm >= 35 ? 3 : wpm >= 20 ? 2 : 1;
    const level = S.level;
    const key = starsKey(level.id);
    const firstClear = !save.stars[key];

    let coins = (5 + 3 * levelIndex(level)) * stars;
    if (!firstClear) coins = Math.ceil(coins / 2);
    coins += S.goldenHit * 5;
    if (nightmare) coins *= 2;

    save.coins += coins;
    save.stars[key] = Math.max(save.stars[key] || 0, stars);
    if (typeof level.id === 'number' && !nightmare) {
      save.unlocked = Math.min(LEVELS.length, Math.max(save.unlocked, level.id + 1));
    }

    if (S.mods.ghost) {
      const old = save.ghosts[key];
      const pace = tl => tl[tl.length - 1] / tl.length;
      if (!old || pace(S.timeline) < pace(old)) save.ghosts[key] = S.timeline.slice();
    }

    let extra = '';
    if (level.id === LEVELS.length && !save.nightmareUnlocked) {
      save.nightmareUnlocked = true;
      extra = 'NIGHTMARE MODE UNLOCKED! Look for the toggle on the level map...';
    }
    persist();

    award('first-win');
    if (S.fails >= 10) award('comeback');
    if (wpm >= 60 && chars >= 40) award('speed-demon');
    if (Surprises.isNight()) award('night-owl');
    if (S.goldens.size >= 2 && S.goldenHit === S.goldens.size) award('golden-touch');
    if (level.id === LEVELS.length) award('champion');
    if (BOSS_IDS.every(id => save.stars[id] || save.stars['n' + id])) award('boss-slayer');
    if (nightmare) award('nightmare');

    refreshCoins(true);
    Sound.win();
    Surprises.confetti();

    S.result = { wpm, stars, coins, ms, extra };
    setTimeout(() => showWin(), 450);
  }

  function showWin() {
    const r = S.result;
    $('#winTitle').textContent = Surprises.pick(Surprises.WIN_TITLES);
    $('#winStars').innerHTML = [1, 2, 3]
      .map(n => `<span class="${n <= r.stars ? '' : 'off'}">\u2605</span>`).join('');
    $('#winStats').innerHTML = `
      <div><small>Speed</small>${r.wpm} WPM</div>
      <div><small>Time</small>${(r.ms / 1000).toFixed(1)}s</div>
      <div><small>Attempts</small>${S.attempts}</div>
      <div><small>Coins</small>+${r.coins}</div>`;

    const punch = $('#winPunchline');
    punch.hidden = !S.passage.punchline;
    punch.textContent = S.passage.punchline || '';

    const extra = $('#winExtra');
    extra.hidden = !r.extra;
    extra.textContent = r.extra;

    const next = getLevel(typeof S.level.id === 'number' ? S.level.id + 1 : null);
    $('#nextBtn').hidden = !next || (!nightmare && next.id > save.unlocked);

    $('#winModal').hidden = false;
    modalOpenedAt = performance.now();
  }

  function closeModal() {
    $('#winModal').hidden = true;
  }

  function quitToMap() {
    closeModal();
    showScreen('map');
  }

  // ---------- input ----------

  function onKeyDown(e) {
    if (!e.isTrusted) return;
    Sound.unlock();

    if (!$('#winModal').hidden) {
      if (performance.now() - modalOpenedAt < 800) { e.preventDefault(); return; }
      if (e.key === 'Enter') {
        e.preventDefault();
        if (!$('#nextBtn').hidden) $('#nextBtn').click();
        else $('#retryBtn').click();
      } else if (e.key === 'Escape') {
        quitToMap();
      }
      return;
    }

    if (screen === 'title') {
      if (Surprises.feedKonami(e.key)) unlockSecret();
      else if (e.key === 'Enter') showScreen('map');
      return;
    }

    if (screen !== 'play') {
      if (e.key === 'Escape') showScreen('title');
      return;
    }

    if (e.key === 'Escape') { quitToMap(); return; }
    if (e.ctrlKey || e.metaKey) return;
    if (e.isComposing || e.key === 'Dead' || e.repeat) { e.preventDefault(); return; }
    if (e.key === 'Backspace') {
      e.preventDefault();
      if (!S.locked && S.index > 0 && Math.random() < 0.3) toast('No take-backs!', 'joke', 1200);
      return;
    }
    if (e.key.length !== 1) return;

    e.preventDefault();
    handleChar(e.key, e.timeStamp || performance.now());
  }

  function onCheat(kind) {
    if (screen !== 'play' || S.locked || !$('#winModal').hidden) return;
    if (kind === 'focus' && !S.startTime) return;
    fail(kind);
  }

  function unlockSecret() {
    Sound.secret();
    Surprises.confetti(80);
    if (!save.secretUnlocked) {
      save.secretUnlocked = true;
      persist();
      toast('SECRET LEVEL UNLOCKED! Check the level map.', 'gold', 4000);
    } else {
      toast('You already know the secret...', 'gold', 2500);
    }
    award('konami');
  }

  // ---------- wiring ----------

  function init() {
    Renderer.init($('#board'));
    applyTheme();
    refreshCoins();
    refreshMute();

    AntiCheat.install({ onCheat });
    document.addEventListener('keydown', onKeyDown);

    window.addEventListener('resize', () => {
      if (screen === 'play') Renderer.layout(S.text);
    });

    $('#homeBtn').addEventListener('click', () => { closeModal(); showScreen('title'); });
    $('#muteBtn').addEventListener('click', e => {
      save.muted = !save.muted;
      persist();
      refreshMute();
      e.currentTarget.blur();
    });
    $('#playBtn').addEventListener('click', () => showScreen('map'));
    $('#shopBtn').addEventListener('click', () => showScreen('shop'));
    $('#badgesBtn').addEventListener('click', () => showScreen('badges'));
    document.querySelectorAll('[data-go]').forEach(btn =>
      btn.addEventListener('click', () => showScreen(btn.dataset.go)));

    $('#nightmareCheck').addEventListener('change', e => {
      nightmare = e.target.checked;
      if (nightmare) toast('Nightmare Mode ON. Every level has a twist. Coins x2.', 'bad', 3000);
      showScreen('map');
    });

    $('#quitBtn').addEventListener('click', quitToMap);
    $('#nextBtn').addEventListener('click', () => startLevel(S.level.id + 1));
    $('#retryBtn').addEventListener('click', () => startLevel(S.level.id));
    $('#mapBtn').addEventListener('click', quitToMap);

    if (Storage.wasTampered()) {
      toast('Your save file looked... edited. Back to level 1!', 'bad', 5000);
    }

    showScreen('title');
  }

  init();
})();
