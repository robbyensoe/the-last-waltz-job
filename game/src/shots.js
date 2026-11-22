// The Last Waltz Job — screenshot staging. Each scene is the real
// simulation in a composed state: the cover must show, in one frame, a
// room being crossed, guard cones, a camera fan, the loot target and
// the alarm meter — because that is the frame the night is judged by.

import { makeLevel } from "./world.js";

const idle = {
  keys: new Set(),
  pressed: new Set(),
  axis: () => ({ x: 0, y: 0 }),
};

export function applyShot(name, seed, game) {
  window.__shotFrozen = true; // the staged frame must not drift
  if (name === "play") {
    if (seed === 2) {
      // Score II: frozen at the violet fan's edge, laser live below,
      // alarm high and orange, a Warden converging.
      const level = makeLevel(1, seed);
      const p = level.player;
      p.x = 1050; p.y = 300; p.face = -0.6;
      const g = level.guards[2];
      g.x = 990; g.y = 430;
      g.face = Math.atan2(p.y - g.y, p.x - g.x);
      g.state = "investigate";
      g.meter = 66;
      const cam = level.cameras[1];
      cam.face = Math.atan2(p.y - cam.y, p.x - cam.x);
      level.time = 0.5; // both beams live at this phase
      level.alarm = 72;
      level.alarmPeak = 72;
      p.bags = 1;
      level.loot[0].taken = true;
      game.ui.score = 2350;
      game.ui.levelLoot = 250;
      game.setLevel(level);
      game.setMode("play");
      return;
    }
    // Cover — Score I: the crossing. Amber thief between a warm cone
    // and the violet fan, the Waltz glowing ahead, meter already warm.
    const level = makeLevel(0, seed);
    const p = level.player;
    p.x = 470; p.y = 352; p.face = 0.3;
    const g0 = level.guards[0];
    g0.x = 330; g0.y = 170;
    g0.face = Math.atan2(p.y - g0.y, p.x - g0.x) - 0.35;
    g0.meter = 22;
    const g1 = level.guards[1];
    g1.x = 1080; g1.y = 300;
    g1.face = Math.PI;
    const cam = level.cameras[0];
    cam.face = Math.PI / 2 + 0.1;
    level.alarm = 34;
    level.alarmPeak = 34;
    p.bags = 1;
    level.loot[1].taken = true;
    game.ui.score = 600;
    game.ui.levelLoot = 600;
    game.setLevel(level);
    game.setMode("play");
    return;
  }
  if (name === "end") {
    game.ui.score = 18740;
    game.ui.rank = "A";
    game.ui.style = "Professional";
    game.ui.alarms = 0;
    game.ui.spotteds = 2;
    game.ui.lootCount = 9;
    game.ui.lootTotal = 11;
    game.ui.mains = 3;
    game.setMode("win");
    return;
  }
}
