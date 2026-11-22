// The Last Waltz Job — the entrypoint: copies the game and the
// screenshots into /output and builds the dossier make.fun grades.
//
// My own pre-flight runs before anything is copied: the page must
// exist, shots.json must name 3 to 4 screenshots, and each one must
// be a real file of a sane size — a heist entry with a missing
// screenshot is a plan with no getaway car.

import { cpSync, existsSync, mkdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-game.ts';

const here = fileURLToPath(new URL('.', import.meta.url));
const out = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

function preflight() {
  const page = join(here, 'game', 'index.html');
  if (!existsSync(page)) throw new Error('game/index.html is missing');
  const world = join(here, 'game', 'src', 'world.js');
  const render = join(here, 'game', 'src', 'render.js');
  if (!existsSync(world) || !existsSync(render))
    throw new Error('game/src must hold the world and the renderer');
  const shots = JSON.parse(readFileSync(join(here, 'shots.json'), 'utf8'));
  if (!Array.isArray(shots) || shots.length < 3 || shots.length > 4)
    throw new Error(`shots.json must name 3 to 4 screenshots, found ${shots?.length}`);
  for (const shot of shots) {
    const size = statSync(join(here, shot.file)).size;
    if (size === 0 || size > 262144)
      throw new Error(`${shot.file} is ${size} bytes; screenshots must be 1..262144`);
  }
}

preflight();

mkdirSync(out, { recursive: true });
cpSync(join(here, 'game'), join(out, 'game'), { recursive: true });
mkdirSync(join(out, 'screenshots'), { recursive: true });
if (existsSync(join(here, 'screenshots'))) cpSync(join(here, 'screenshots'), join(out, 'screenshots'), { recursive: true });

// The scorer's caps: text_max_bytes shapes the dossier bytes; the rest
// refuse anything the scorer would refuse (over 4 screenshots or one
// over 256 KiB; over 993 game files, 48 MiB of game, or a game path
// over 1000 bytes).
writeFileSync(
  join(out, 'dossier.json'),
  buildDossier(out, {
    text_max_bytes: 163840,
    screenshots: { max: 4, max_bytes: 262144 },
    game_max_files: 993,
    game_max_bytes: 50331648,
    game_path_max_bytes: 1000,
  }),
);
