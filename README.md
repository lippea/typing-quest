# Typo Terror

A typing challenge game for Year 7. Type the passage exactly: one wrong key and the
whole run clears and you start again (the same rule StayFocusd uses for its typing
challenge). Twelve levels in four worlds, a boss every third level, coins, badges,
a coin shop and a few hidden surprises.

Plain HTML, CSS and JavaScript. No build step, no backend. Needs a physical keyboard.

## Run locally

Open `index.html` in a browser. That's it; nothing is fetched at runtime.

## Deploy to GitHub Pages

The workflow in `.github/workflows/deploy-pages.yml` deploys whenever `main` is updated.

1. Push this folder as its own repository.
2. In the repository, open `Settings` -> `Pages` and set **Source** to **GitHub Actions**.

## How the game works

- **Levels**: World 1 is short lowercase words, World 2 adds capitals and punctuation,
  World 3 adds numbers and symbols, World 4 is full paragraphs.
- **Bosses**: level 3 fades out the text ahead of you, level 6 has a countdown,
  level 9 is a race against a ghost of your best run, level 12 reveals one line at a
  time and wobbles.
- **Stars**: 1 star for finishing, 2 stars at 20+ WPM, 3 stars at 35+ WPM.
- **Coins**: earned per win (half for replays), +5 per golden letter, doubled in
  Nightmare Mode. Spent in the Coin Shop on cursor skins and themes.
- Progress is saved per browser in `localStorage`.

## Surprises (spoilers)

- Golden letters glow in the passage and pay bonus coins.
- Some passages are jokes; the punchline only appears on the win screen.
- A few early passages fake their ending with a plot twist.
- Fail jokes appear after 5, 10, 15, 20, 30 and 50 failed attempts on a level.
- Badges for streaks, speed, comebacks, late-night wins and more.
- Konami code (up up down down left right left right B A) on the title screen
  unlocks a secret Tongue Twisters level.
- Beating level 12 unlocks Nightmare Mode: every level gets a boss twist.

## Anti-cheat

- The passage is drawn on a `<canvas>`, so it can't be selected, copied or translated.
- There is no text box; keys are read directly. Paste and drop reset the run.
  Copy, cut, right-click and text selection are blocked.
- Synthetic key events (`isTrusted === false`) are ignored.
- Autotypers are detected by rhythm: many near-instant keystrokes, or a
  metronome-steady cadence, resets the run.
- Switching tabs or leaving the window mid-run resets it.
- Saved progress is signed with a checksum; hand-edited saves reset to level 1.

**Limits**: everything runs in the browser, so a determined student with developer
tools can still get around it (for example by reading the passages in `js/levels.js`
or patching the game). That's fine for a classroom game; it stops the easy cheats.

## Editing content

Passages live in `js/levels.js`. A passage is a string, or an object with optional
`punchline` (shown on the win screen) and `twist` (appended when you think you've
finished). Keep text plain ASCII with straight quotes so every character is typeable.
