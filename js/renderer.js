// Draws the passage on a canvas so the text never exists in the page as
// selectable/copyable DOM text.
const Renderer = (() => {
  const FONT = '"SF Mono", ui-monospace, Menlo, Consolas, "Courier New", monospace';
  const PAD_X = 26;
  const PAD_Y = 22;
  const FADE_DELAY = 3000;
  const FADE_TIME = 1500;
  const FADE_LOOKAHEAD = 6;

  let canvas, ctx;
  let width = 0, height = 0, dpr = 1;
  let fontSize = 26, charW = 14, lineH = 44;
  let lines = [];
  let pos = [];
  let popups = [];
  const colors = {};

  function init(el) {
    canvas = el;
    ctx = canvas.getContext('2d');
    readColors();
  }

  function readColors() {
    const style = getComputedStyle(document.body);
    ['text', 'muted', 'accent', 'good', 'bad', 'gold', 'ghost', 'panel', 'panel2'].forEach(k => {
      colors[k] = style.getPropertyValue('--' + k).trim();
    });
  }

  function setFont() {
    ctx.font = `600 ${fontSize}px ${FONT}`;
    ctx.textBaseline = 'middle';
  }

  function measure() {
    width = canvas.parentElement.clientWidth;
    fontSize = width < 520 ? 19 : width < 760 ? 22 : 26;
    setFont();
    charW = ctx.measureText('M').width;
    lineH = Math.round(fontSize * 1.75);
  }

  function layout(text) {
    measure();
    const maxCols = Math.max(10, Math.floor((width - PAD_X * 2) / charW));
    const tokens = text.match(/\S+\s*|\s+/g) || [];
    lines = [];
    let start = 0, len = 0, idx = 0;
    for (const tok of tokens) {
      if (len > 0 && len + tok.trimEnd().length > maxCols) {
        lines.push({ start, len });
        start = idx;
        len = 0;
      }
      len += tok.length;
      idx += tok.length;
    }
    lines.push({ start, len });

    pos = new Array(text.length);
    lines.forEach((line, l) => {
      for (let k = 0; k < line.len; k++) pos[line.start + k] = { line: l, col: k };
    });

    height = PAD_Y * 2 + lines.length * lineH;
    dpr = window.devicePixelRatio || 1;
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    setFont();
  }

  function cellX(i) { return PAD_X + pos[i].col * charW; }
  function cellY(i) { return PAD_Y + pos[i].line * lineH; }

  function popup(index, label) {
    if (!pos[index]) return;
    popups.push({ x: cellX(index), y: cellY(index), label, t0: performance.now() });
  }

  function clearPopups() { popups = []; }

  function drawCursor(i, skin, now) {
    const x = cellX(i) - 1;
    const y = cellY(i) + 4;
    const w = charW + 2;
    const h = lineH - 8;
    ctx.save();
    switch (skin) {
      case 'underline': {
        if (Math.floor(now / 450) % 2 === 0) {
          ctx.fillStyle = colors.accent;
          ctx.fillRect(x, y + h - 5, w, 5);
        }
        break;
      }
      case 'flame': {
        const flick = 0.85 + Math.sin(now / 60) * 0.1 + Math.random() * 0.05;
        const fh = h * flick;
        const g = ctx.createLinearGradient(0, y + h, 0, y + h - fh);
        g.addColorStop(0, '#ff3d00');
        g.addColorStop(0.6, '#ff9100');
        g.addColorStop(1, 'rgba(255,214,0,0.2)');
        ctx.fillStyle = g;
        ctx.shadowColor = '#ff6d00';
        ctx.shadowBlur = 16;
        ctx.fillRect(x, y + h - fh, w, fh);
        break;
      }
      case 'rainbow': {
        ctx.fillStyle = `hsla(${(now / 6) % 360}, 95%, 60%, 0.75)`;
        ctx.shadowColor = ctx.fillStyle;
        ctx.shadowBlur = 14;
        ctx.fillRect(x, y, w, h);
        break;
      }
      case 'ghost': {
        ctx.strokeStyle = colors.text;
        ctx.globalAlpha = 0.5 + Math.sin(now / 200) * 0.4;
        ctx.lineWidth = 2;
        ctx.strokeRect(x, y, w, h);
        break;
      }
      default: {
        ctx.globalAlpha = 0.35;
        ctx.fillStyle = colors.accent;
        ctx.fillRect(x, y, w, h);
        ctx.globalAlpha = 1;
        ctx.fillRect(x, y + h - 4, w, 4);
      }
    }
    ctx.restore();
  }

  function draw(view) {
    const { text, index, goldens, mods, attemptStart, now, ghostIndex, skin, failAt } = view;
    ctx.clearRect(0, 0, width, height);
    ctx.save();

    if (mods.wobble) {
      const a = Math.sin(now / 520) * 0.012;
      ctx.translate(width / 2, height / 2 + Math.sin(now / 340) * 3);
      ctx.rotate(a);
      ctx.translate(-width / 2, -height / 2);
    }

    const failing = failAt && now - failAt < 650;
    const curLine = index < text.length ? pos[index].line : lines.length - 1;
    const sinceShown = now - attemptStart;
    const fadeAmount = mods.fade && sinceShown > FADE_DELAY
      ? Math.min(1, (sinceShown - FADE_DELAY) / FADE_TIME) : 0;

    for (let i = 0; i < text.length; i++) {
      const ch = text[i];
      const x = cellX(i);
      const y = cellY(i) + lineH / 2;
      const line = pos[i].line;

      if (mods.reveal && line > curLine) {
        if (ch !== ' ') {
          ctx.fillStyle = colors.panel2;
          ctx.fillRect(x + 1, y - 3, charW - 2, 6);
        }
        continue;
      }

      if (i === index && !failing) drawCursor(i, skin, now);

      let alpha = 1;
      let color = colors.text;
      let glow = 0;

      if (failing) {
        color = i < index ? colors.bad : colors.muted;
      } else if (i < index) {
        color = goldens.has(i) ? colors.gold : colors.good;
      } else {
        if (goldens.has(i)) {
          color = colors.gold;
          glow = 12 + Math.sin(now / 150) * 6;
        }
        if (fadeAmount > 0 && i > index + FADE_LOOKAHEAD) {
          alpha = Math.max(0.1, 1 - fadeAmount);
        }
      }

      if (ch === ' ') continue;
      ctx.globalAlpha = alpha;
      ctx.fillStyle = color;
      if (glow) {
        ctx.shadowColor = colors.gold;
        ctx.shadowBlur = glow;
      }
      ctx.fillText(ch, x, y);
      ctx.shadowBlur = 0;
      ctx.globalAlpha = 1;
    }

    if (ghostIndex != null && ghostIndex < text.length && !failing) {
      const gx = cellX(ghostIndex) - 1;
      const gy = cellY(ghostIndex) + 4;
      ctx.globalAlpha = 0.45 + Math.sin(now / 180) * 0.15;
      ctx.fillStyle = colors.ghost;
      ctx.shadowColor = colors.ghost;
      ctx.shadowBlur = 18;
      ctx.fillRect(gx, gy, charW + 2, lineH - 8);
      ctx.shadowBlur = 0;
      ctx.globalAlpha = 1;
    }

    popups = popups.filter(p => now - p.t0 < 900);
    for (const p of popups) {
      const t = (now - p.t0) / 900;
      ctx.globalAlpha = 1 - t;
      ctx.fillStyle = colors.gold;
      ctx.font = `900 ${Math.round(fontSize * 0.8)}px ${FONT}`;
      ctx.fillText(p.label, p.x, p.y - t * 30);
      setFont();
    }
    ctx.globalAlpha = 1;
    ctx.restore();
  }

  return { init, readColors, layout, draw, popup, clearPopups };
})();
