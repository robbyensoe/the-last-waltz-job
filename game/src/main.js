// The Last Waltz Job — the frame loop and the night's bookkeeping:
// three scores, one running score, and a verdict at the van.

import { W, H, SCORE } from "./config.js";
import { makeInput } from "./input.js";
import { makeSound } from "./sound.js";
import { makeLevel, stepWorld, EV, LEVEL_COUNT } from "./world.js";
import {
  drawWorld, drawTitle, drawLevelClear, drawWin, drawBusted, drawPaused,
} from "./render.js";
import { applyShot } from "./shots.js";

const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
const input = makeInput(canvas);
const sound = makeSound();
const sr = document.getElementById("sr");

const MAX_PER_LEVEL = [8400, 9050, 11650];
const MAX_SCORE = MAX_PER_LEVEL.reduce((a, b) => a + b, 0);

let mode = "title";
let seed = 1;
let level = makeLevel(0, seed);
let levelStats = freshStats();
let summary = null;
const ui = {
  score: 0,
  levelLoot: 0,
  t: 0,
  lastLevel: false,
  alarms: 0,
  spotteds: 0,
  lootCount: 0,
  lootTotal: 11,
  mains: 0,
  rank: "—",
  style: "—",
  levelName: level.name,
  reason: "",
};

function freshStats() {
  return { spotteds: 0 };
}

function reset(seedValue) {
  seed = seedValue;
  ui.score = 0;
  ui.alarms = 0;
  ui.spotteds = 0;
  ui.lootCount = 0;
  ui.mains = 0;
  ui.levelLoot = 0;
  level = makeLevel(0, seed);
  levelStats = freshStats();
  ui.levelName = level.name;
  mode = "play";
  sound.setKlaxon(false);
  announce("Score one. The gallery is dark and the Waltz is waiting.");
}

function lootValueOf(lv) {
  let v = 0;
  for (const item of lv.loot) if (item.taken) v += item.value;
  if (lv.main.taken) v += lv.main.value;
  return v;
}

function finishLevel() {
  const lootValue = lootValueOf(level);
  const timeBonus = Math.min(SCORE.timeCap, Math.max(0, Math.round((level.par - level.time) * SCORE.timePerSecond)));
  let bonus = 0;
  let verdict = "LOUD EXIT";
  if (level.alarmPeak <= 0) { bonus = SCORE.ghost; verdict = "GHOST — the meter never moved"; }
  else if (level.alarmPeak < 100) { bonus = SCORE.cleanGetaway; verdict = "CLEAN GETAWAY"; }
  const penalties = level.lockdowns * SCORE.alarmTrigger
    + (levelStats.spotteds) * SCORE.spotted;
  const gained = Math.max(0, lootValue + timeBonus + bonus + penalties);
  ui.score += gained;
  ui.lootCount += level.loot.filter((i) => i.taken).length;
  if (level.main.taken) ui.mains++;
  summary = { lootValue, timeBonus, bonus, verdict, gained, peak: level.alarmPeak };
  ui.lastLevel = level.index >= LEVEL_COUNT - 1;
  mode = "clear";
  sound.setKlaxon(false);
  sound.win();
  announce(`Getaway. ${level.prize} ${level.main.taken ? "taken" : "left behind"}. Score ${ui.score}.`);
}

function gradeAndWin() {
  const share = ui.score / MAX_SCORE;
  const maxPeak = ui.alarms > 0 ? 100 : 0;
  ui.rank = share >= 0.85 && ui.alarms === 0 ? "S — PHANTOM"
    : share >= 0.7 ? "A" : share >= 0.5 ? "B" : share >= 0.3 ? "C" : "D — LOUD & LUCKY";
  ui.style = ui.spotteds === 0 && ui.alarms === 0 ? "Ghost"
    : ui.alarms === 0 ? "Professional" : "Smash-and-Grab";
  mode = "win";
  sound.win();
  announce(`The night is yours. Final score ${ui.score}, grade ${ui.rank}.`);
}

function bust(reason) {
  ui.reason = reason;
  ui.levelName = level.name;
  mode = "busted";
  sound.setKlaxon(false);
  sound.caught();
  announce(`Busted. ${reason}`);
}

function nextLevel() {
  level = makeLevel(level.index + 1, seed);
  levelStats = freshStats();
  ui.levelName = level.name;
  ui.levelLoot = 0;
  mode = "play";
}

function announce(text) {
  if (sr) sr.textContent = text;
}

let last = performance.now();
function frame(now) {
  const dt = Math.min(0.05, (now - last) / 1000);
  last = now;
  ui.t = now / 1000;

  if (mode === "title") {
    drawTitle(ctx);
    if (input.pressed.has("Enter")) { sound.unlock(); reset((Math.random() * 1e9) | 0); }
  } else if (mode === "play") {
    if (input.pressed.has("KeyP") || input.pressed.has("Escape")) mode = "paused";
    if (window.__shotFrozen) { drawWorld(ctx, level, ui); input.endFrame(); requestAnimationFrame(frame); return; }
    const ev = stepWorld(level, input, dt);
    ui.levelLoot = lootValueOf(level);
    if (ev & EV.LOOT) sound.loot();
    if (ev & EV.MAIN) sound.vault();
    if (ev & EV.LASER) sound.laser();
    if (ev & EV.SUSPECT) sound.suspect();
    if (ev & EV.SPOTTED) { sound.spotted(); levelStats.spotteds++; ui.spotteds++; }
    if (ev & EV.BLACKOUT) sound.blackout();
    if (ev & EV.CAMTICK) sound.camTick();
    if (ev & EV.LOCKDOWN) ui.alarms++;
    sound.setKlaxon(level.lockdownT > 0 || level.getawayT > 0);
    sound.setAlarm(Math.max(level.alarm, (level.maxMeter ?? 0) * 0.7) / 100);
    const p = level.player;
    if (p.moving && p.stepAcc >= 26) {
      p.stepAcc = 0;
      if (p.sneak) sound.sneakStep(); else sound.step(true, (ui.t * 2 | 0) % 2 === 0);
    }
    drawWorld(ctx, level, ui);
    if (ev & EV.CAUGHT) bust("A Warden's hands closed on your coat in the dark.");
    else if (ev & EV.BUSTED)
      bust(level.getawayT <= 0 && level.lockdowns === 1
        ? "The doors sealed with you still inside."
        : "A second lockdown — and there is no third chance.");
    else if (ev & EV.CLEAR) finishLevel();
  } else if (mode === "clear") {
    drawLevelClear(ctx, level, ui, summary);
    if (input.pressed.has("Enter")) {
      if (ui.lastLevel) gradeAndWin();
      else nextLevel();
    }
  } else if (mode === "win") {
    drawWin(ctx, ui);
    if (input.pressed.has("Enter")) mode = "title";
  } else if (mode === "busted") {
    drawBusted(ctx, ui);
    if (input.pressed.has("Enter")) mode = "title";
  } else if (mode === "paused") {
    drawPaused(ctx, level, ui);
    if (input.pressed.has("KeyP") || input.pressed.has("Escape")) mode = "play";
  }
  input.endFrame();
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);

// Screenshot staging: ?shot=<name>&seed=<n> pins a composed frame.
const params = new URLSearchParams(location.search);
if (params.has("shot")) {
  const shotSeed = Number(params.get("seed") ?? 1);
  const game = { ui, setLevel: (lv) => (level = lv), getLevel: () => level, setMode: (m) => (mode = m), sound };
  applyShot(params.get("shot"), shotSeed, game);
}
window.__shotReady = true;
