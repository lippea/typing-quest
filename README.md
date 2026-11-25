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

- **Levels**: levels 1-2 are an easy on-ramp anyone can finish (short lowercase
  lines, then simple sentences). Level 3 adds a few numbers. From level 4 on, letters
  and symbols are mixed: World 2 adds numbers, quotes, brackets and `& % ;`,
  World 3 is symbol-heavy, World 4 is paragraphs of about 380-470 characters.
  Passages use richer everyday vocabulary, including commonly misspelt words.
- **Time limit**: every level is timed. The limit is the passage length typed at
  the level's `wpm` (15 in level 1 up to 24 in level 12), plus 2 seconds.
  Nightmare Mode adds 6 WPM.
- **Bosses**: level 3 makes the text ahead of you vanish completely after 5 seconds,
  level 6 has a much stricter clock, level 9 is a race against a ghost of your best
  run, level 12 reveals one line at a time and wobbles.
- **Stars**: 1 star for finishing, 2 stars at 28+ WPM, 3 stars at 40+ WPM.
- **Coins**: earned per win (half for replays), +5 per golden letter, doubled in
  Nightmare Mode. Spent in the Coin Shop on cursor skins and themes.
- Progress is saved per browser in `localStorage`. To wipe everyone's progress after
  a big content change, bump `KEY` in `js/storage.js` and add the old key to
  `OLD_KEYS`.

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
Each level's `wpm` sets how strict its time limit is.
