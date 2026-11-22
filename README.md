# The Last Waltz Job

[![make.fun · best-heist-game-20261122-0559](https://make.fun/badge/best-heist-game-20261122-0559.svg)](https://make.fun/bounty/best-heist-game-20261122-0559?utm_source=github&utm_medium=readme&utm_campaign=best-heist-game-20261122-0559)
[![rank](https://make.fun/badge/best-heist-game-20261122-0559/robbyensoe/the-last-waltz-job/rank.svg)](https://make.fun/bounty/best-heist-game-20261122-0559/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=best-heist-game-20261122-0559)
[![reward](https://make.fun/badge/best-heist-game-20261122-0559/robbyensoe/the-last-waltz-job/reward.svg)](https://make.fun/bounty/best-heist-game-20261122-0559?utm_source=github&utm_medium=readme&utm_campaign=best-heist-game-20261122-0559)

**One night. One jewel. One last waltz.**

Vesper Cole, a retired dancer turned master thief, comes back for a
farewell tour: three scores in one night — the Marlowe Gallery, the
First Meridian Bank, the Aurum Depository. Take the prize, fill the
bags if you dare, and reach the getaway van. Every eye in the building
feeds **one alarm meter**: the Wardens' warm vision cones, the Eyes of
Argus sweeping in violet, and the laser grids between you and the gold.

## How it plays

- **WASD / arrows** move, **Shift** sneaks (silent, half-hidden by
  furniture), **E** fires a blackout pulse that darkens every camera
  for six seconds, **X** drops your last bag, **P** pauses.
- Guards carry personal detection meters — at 40 they investigate, at
  100 they shout, chase, and spike the alarm. Cameras never blink and
  feed the meter directly; lasers spike it instantly (sneak under the
  high ones).
- Every bag of side loot is score in the hand and speed off your feet.
  Greed is a decision you make with your legs.
- At alarm 100 the building **locks down**: the van seals for 12
  seconds and a 45-second getaway clock starts. A second lockdown ends
  the night. Caught by a chasing Warden ends it sooner.
- Grades reward the quiet: a **Ghost** run (the meter never moved)
  out-earns any smash-and-grab.

## Layout

- `game/index.html` — the page, no build step, no network.
- `game/src/config.js` — arena, palette, speeds, sensors, alarm rules.
- `game/src/world.js` — the three scores, guards, cameras, lasers and
  the alarm meter they all feed.
- `game/src/render.js` — canvas drawing: cones, fans, beams, the meter.
- `game/src/main.js` — the frame loop and the night's bookkeeping.
- `game/src/sound.js` — WebAudio synthesis: footsteps, the rising
  detection tone, the lockdown klaxon, the getaway chord.
- `game/src/input.js`, `game/src/random.js`, `game/src/shots.js` —
  controls, the seeded rng, and the screenshot staging.

Run it with any static file server, e.g. `node serve.ts`, then open
`game/index.html`. Built for the make.fun bounty
[Make the best heist game](https://make.fun/bounty/best-heist-game-20261122-0559).
