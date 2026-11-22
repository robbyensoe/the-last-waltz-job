// The Last Waltz Job — the world: three scores in one night, the
// Wardens who patrol them, the Eyes of Argus that sweep them, and the
// one alarm meter every sensor feeds.
//
// Guards carry a personal detection meter: at 40 they investigate, at
// 100 they shout (+25 alarm) and chase. Cameras feed the alarm meter
// directly and never blink. Laser beams spike it instantly. At 100 the
// building locks down: the exit seals for 12 seconds and a 45-second
// getaway clock starts — reach the van before it dies, because a
// second lockdown ends the night.

import { W, H, SPEED, SIGHT, CAMERA, ALARM, LOOT } from "./config.js";
import { makeRng } from "./random.js";

export const EV = {
  LOOT: 1, MAIN: 2, LASER: 4, SUSPECT: 8, SPOTTED: 16, CAUGHT: 32,
  CLEAR: 64, LOCKDOWN: 128, BLACKOUT: 256, CAMTICK: 512, BUSTED: 1024,
};

const LEVELS = [
  {
    name: "Score I — The Marlowe Gallery",
    prize: "The Midnight Waltz",
    par: 110,
    blackouts: 1,
    patrolSpeed: 58,
    pause: 1.0,
    walls: [
      [420, 20, 24, 280], [420, 440, 24, 260], [444, 300, 392, 24],
      [860, 20, 24, 240], [860, 460, 24, 240],
    ],
    cover: [
      [200, 200, 80, 50], [620, 150, 80, 50], [980, 420, 80, 50],
      [560, 520, 160, 40],
    ],
    start: [64, 640],
    exit: { x: 1080, y: 694, w: 180, h: 26, side: "bottom" },
    main: { x: 640, y: 360, value: 1800 },
    loot: [
      { x: 140, y: 70, value: 600, kind: "painting" },
      { x: 1140, y: 70, value: 600, kind: "painting" },
      { x: 280, y: 580, value: 400, kind: "statue" },
    ],
    guards: [
      [[200, 120], [640, 120], [640, 600], [200, 600]],
      [[940, 120], [1180, 120], [1180, 600], [940, 600]],
    ],
    cameras: [{ x: 640, y: 30, base: Math.PI / 2, sweep: 0.96, period: 6, phase: 0 }],
    lasers: [],
  },
  {
    name: "Score II — First Meridian Bank",
    prize: "The Reserve Vault",
    par: 130,
    blackouts: 1,
    patrolSpeed: 66,
    pause: 0.7,
    walls: [
      [300, 330, 420, 28], [60, 80, 300, 24], [60, 80, 24, 180],
      [60, 470, 300, 24], [336, 470, 24, 180], [820, 180, 24, 360],
      [820, 180, 340, 24], [820, 516, 340, 24],
    ],
    cover: [
      [140, 300, 90, 50], [520, 560, 90, 50], [950, 300, 90, 50],
      [600, 140, 44, 44],
    ],
    start: [64, 360],
    exit: { x: 1254, y: 560, w: 26, h: 120, side: "right" },
    main: { x: 1150, y: 240, value: 3000 },
    loot: [
      { x: 180, y: 120, value: 250, kind: "boxes" },
      { x: 380, y: 600, value: 150, kind: "cash" },
      { x: 120, y: 560, value: 400, kind: "safe" },
      { x: 950, y: 470, value: 250, kind: "coins" },
    ],
    guards: [
      [[120, 140], [700, 140], [700, 620], [120, 620]],
      [[380, 300], [760, 300], [760, 420], [380, 420]],
      [[900, 240], [1200, 240], [1200, 480], [900, 480]],
    ],
    cameras: [
      { x: 42, y: 42, base: Math.PI / 4, sweep: 0.87, period: 7, phase: 0 },
      { x: 1232, y: 192, base: (3 * Math.PI) / 4, sweep: 0.78, period: 6, phase: 2 },
    ],
    lasers: [
      { x1: 844, y1: 360, x2: 1256, y2: 360, period: 3.6, on: 2.4, phase: 0, high: false },
      { x1: 480, y1: 104, x2: 480, y2: 330, period: 3.6, on: 2.4, phase: 1.2, high: false },
    ],
  },
  {
    name: "Score III — The Aurum Depository",
    prize: "The Aurum Core",
    par: 150,
    blackouts: 2,
    patrolSpeed: 74,
    pause: 0.4,
    walls: [
      [440, 180, 400, 24], [440, 516, 400, 24], [440, 180, 24, 140],
      [440, 400, 24, 140], [816, 180, 24, 140], [816, 400, 24, 140],
      [200, 20, 24, 220], [1056, 20, 24, 220], [200, 480, 24, 220],
      [1056, 480, 24, 220],
    ],
    cover: [
      [240, 300, 70, 46], [970, 300, 70, 46], [560, 580, 70, 46],
      [640, 90, 70, 46],
    ],
    start: [640, 662],
    exit: { x: 40, y: 694, w: 180, h: 26, side: "bottom" },
    main: { x: 640, y: 270, value: 5000 },
    loot: [
      { x: 300, y: 120, value: 400, kind: "bars" },
      { x: 980, y: 120, value: 400, kind: "bonds" },
      { x: 140, y: 360, value: 600, kind: "gems" },
      { x: 640, y: 620, value: 250, kind: "cash" },
    ],
    guards: [
      [[120, 100], [1160, 100], [1160, 620], [120, 620]],
      [[300, 200], [400, 200], [400, 520], [300, 520]],
      [[880, 200], [980, 200], [980, 520], [880, 520]],
      [[500, 270], [780, 270], [780, 450], [500, 450]],
    ],
    cameras: [
      { x: 42, y: 42, base: Math.PI / 4, sweep: 0.87, period: 7, phase: 0 },
      { x: 1238, y: 42, base: (3 * Math.PI) / 4, sweep: 0.87, period: 7, phase: 3 },
      { x: 640, y: 692, base: -Math.PI / 2, sweep: 0.96, period: 6, phase: 1 },
    ],
    lasers: [
      { x1: 560, y1: 204, x2: 560, y2: 516, period: 3, on: 2, phase: 0, high: false },
      { x1: 720, y1: 204, x2: 720, y2: 516, period: 3, on: 2, phase: 0.7, high: false },
      { x1: 464, y1: 360, x2: 816, y2: 360, period: 3, on: 2, phase: 1.4, high: true },
    ],
  },
];

export const LEVEL_COUNT = LEVELS.length;

function perimeter(exit) {
  const t = 20;
  const r = [];
  const gap = (side) => exit.side === side;
  if (gap("top")) r.push([0, 0, exit.x, t], [exit.x + exit.w, 0, W - exit.x - exit.w, t]);
  else r.push([0, 0, W, t]);
  if (gap("bottom")) r.push([0, H - t, exit.x, t], [exit.x + exit.w, H - t, W - exit.x - exit.w, t]);
  else r.push([0, H - t, W, t]);
  if (gap("left")) r.push([0, 0, t, exit.y], [0, exit.y + exit.h, t, H - exit.y - exit.h]);
  else r.push([0, 0, t, H]);
  if (gap("right")) r.push([W - t, 0, t, exit.y], [W - t, exit.y + exit.h, t, H - exit.y - exit.h]);
  else r.push([W - t, 0, t, H]);
  return r;
}

// --- geometry (shared with the renderer's cone fans) -------------------------

function segHitsRect(x1, y1, x2, y2, r) {
  let t0 = 0, t1 = 1;
  const dx = x2 - x1, dy = y2 - y1;
  const p = [-dx, dx, -dy, dy];
  const q = [x1 - r[0], r[0] + r[2] - x1, y1 - r[1], r[1] + r[3] - y1];
  for (let i = 0; i < 4; i++) {
    if (p[i] === 0) { if (q[i] < 0) return false; }
    else {
      const t = q[i] / p[i];
      if (p[i] < 0) { if (t > t1) return false; if (t > t0) t0 = t; }
      else { if (t < t0) return false; if (t < t1) t1 = t; }
    }
  }
  return true;
}

export function losBlocked(x1, y1, x2, y2, rects) {
  for (const r of rects) if (segHitsRect(x1, y1, x2, y2, r)) return true;
  return false;
}

function rayRectDist(ox, oy, dx, dy, r) {
  let tmin = 0, tmax = Infinity;
  for (const [o, d, lo, hi] of [[ox, dx, r[0], r[0] + r[2]], [oy, dy, r[1], r[1] + r[3]]]) {
    if (Math.abs(d) < 1e-9) { if (o < lo || o > hi) return Infinity; }
    else {
      let t1 = (lo - o) / d, t2 = (hi - o) / d;
      if (t1 > t2) [t1, t2] = [t2, t1];
      tmin = Math.max(tmin, t1); tmax = Math.min(tmax, t2);
      if (tmin > tmax) return Infinity;
    }
  }
  return tmin;
}

export function conePolygon(x, y, face, halfAngle, range, blockers) {
  const pts = [[x, y]];
  const steps = 14;
  for (let i = 0; i <= steps; i++) {
    const a = face - halfAngle + (2 * halfAngle * i) / steps;
    const dx = Math.cos(a), dy = Math.sin(a);
    let d = range;
    for (const r of blockers) d = Math.min(d, rayRectDist(x, y, dx, dy, r));
    pts.push([x + dx * d, y + dy * d]);
  }
  return pts;
}

function circleHitsRects(x, y, rad, rects) {
  for (const r of rects) {
    const cx = Math.max(r[0], Math.min(x, r[0] + r[2]));
    const cy = Math.max(r[1], Math.min(y, r[1] + r[3]));
    if ((x - cx) ** 2 + (y - cy) ** 2 < rad * rad) return true;
  }
  return false;
}

function moveCircle(e, vx, vy, dt, solids) {
  let nx = e.x + vx * dt;
  if (!circleHitsRects(nx, e.y, e.r, solids)) e.x = nx;
  let ny = e.y + vy * dt;
  if (!circleHitsRects(e.x, ny, e.r, solids)) e.y = ny;
  e.x = Math.max(e.r, Math.min(W - e.r, e.x));
  e.y = Math.max(e.r, Math.min(H - e.r, e.y));
}

function segsCross(ax, ay, bx, by, cx, cy, dx, dy) {
  const d = (bx - ax) * (dy - cy) - (by - ay) * (dx - cx);
  if (Math.abs(d) < 1e-9) return false;
  const t = ((cx - ax) * (dy - cy) - (cy - ay) * (dx - cx)) / d;
  const u = ((cx - ax) * (by - ay) - (cy - ay) * (bx - ax)) / d;
  return t >= 0 && t <= 1 && u >= 0 && u <= 1;
}

// --- construction --------------------------------------------------------------

export function makeLevel(index, seed) {
  const def = LEVELS[index];
  const rng = makeRng(seed * 7919 + index * 131 + 7);
  const walls = [...def.walls, ...perimeter(def.exit)];
  const level = {
    index,
    name: def.name,
    prize: def.prize,
    par: def.par,
    walls,
    cover: def.cover,
    solids: [...walls, ...def.cover],
    exit: def.exit,
    start: { x: def.start[0], y: def.start[1] },
    main: { ...def.main, taken: false },
    loot: def.loot.map((l) => ({ ...l, taken: false, dropped: false, phase: rng() * 6.28 })),
    guards: def.guards.map((route) => ({
      x: route[0][0], y: route[0][1], r: 13,
      route, wp: 1 % route.length,
      face: Math.atan2(route[1 % route.length][1] - route[0][1], route[1 % route.length][0] - route[0][0]),
      state: "patrol", meter: 0, unseenFor: 0, wait: 0,
      target: null, searchT: 0, lookPhase: rng() * 6.28, hearCd: 0,
      pauseAtWp: def.pause, speed: def.patrolSpeed,
      wasSuspect: false, wasAlert: false,
    })),
    cameras: def.cameras.map((c) => ({ ...c, face: c.base, disabledT: 0, seesNow: false, wasExtreme: false })),
    lasers: def.lasers.map((l) => ({ ...l, cool: 0 })),
    blackouts: def.blackouts,
    alarm: 0,
    alarmPeak: 0,
    contactT: 99, // time since any sensor last touched the player
    lockdownT: 0,
    lockdowns: 0,
    getawayT: 0,
    spikedRecently: false,
    time: 0,
    player: null,
  };
  level.player = {
    x: def.start[0], y: def.start[1], r: 12,
    sneak: false, moving: false, face: 0, stepAcc: 0,
    bags: 0, hasMain: false, prevX: def.start[0], prevY: def.start[1],
  };
  return level;
}

export function laserActive(level, l) {
  return ((level.time + l.phase) % l.period) < l.on;
}

export function exitSealed(level) {
  return level.lockdownT > 0;
}

export function alarmTier(level) {
  if (level.alarm >= 100) return 3;
  if (level.alarm >= ALARM.tierAlarm) return 2;
  if (level.alarm >= ALARM.tierSuspect) return 1;
  return 0;
}

// --- simulation ------------------------------------------------------------------

export function stepWorld(level, input, dt) {
  let events = 0;
  const p = level.player;
  level.time += dt;
  p.prevX = p.x;
  p.prevY = p.y;

  // Player movement, slowed by whatever the bags hold.
  const ax = input.axis();
  p.sneak = input.keys.has("ShiftLeft") || input.keys.has("ShiftRight");
  const mag = Math.hypot(ax.x, ax.y);
  p.moving = mag > 0;
  const weight = Math.max(
    LOOT.minSpeedFactor,
    1 - LOOT.bagSlowdown * p.bags - (p.hasMain ? LOOT.mainSlowdown : 0),
  );
  if (p.moving) {
    const sp = (p.sneak ? SPEED.sneak : SPEED.walk) * weight;
    const vx = (ax.x / mag) * sp, vy = (ax.y / mag) * sp;
    p.face = Math.atan2(vy, vx);
    moveCircle(p, vx, vy, dt, level.solids);
    p.stepAcc += sp * dt;
  }

  // Footstep noise: walking is audible, sneaking is not.
  if (p.moving && !p.sneak) {
    const radius = LOOT.walkNoiseBase + LOOT.walkNoisePerBag * p.bags;
    for (const g of level.guards) {
      g.hearCd = Math.max(0, g.hearCd - dt);
      if (g.hearCd <= 0 && g.state === "patrol" && Math.hypot(g.x - p.x, g.y - p.y) <= radius) {
        g.state = "investigate";
        g.target = { x: p.x, y: p.y };
        g.wait = 0;
        g.hearCd = 1.2;
      }
    }
  }

  // Blackout pulse: the Eyes go dark for six seconds.
  if (input.pressed.has("KeyE") && level.blackouts > 0) {
    level.blackouts--;
    for (const c of level.cameras) c.disabledT = 6;
    events |= EV.BLACKOUT;
  }

  // Drop the last bag where you stand.
  if (input.pressed.has("KeyX") && p.bags > 0) {
    const item = [...level.loot].reverse().find((l) => l.taken && !l.dropped);
    if (item) {
      item.taken = false;
      item.dropped = true;
      item.x = p.x;
      item.y = p.y;
      p.bags--;
    }
  }

  let contact = false;

  // Cameras.
  for (const c of level.cameras) {
    c.disabledT = Math.max(0, c.disabledT - dt);
    const sees = cameraSees(level, c);
    c.seesNow = sees && c.disabledT <= 0;
    if (c.seesNow) {
      contact = true;
      const d = Math.hypot(p.x - c.x, p.y - c.y);
      const rate = d <= CAMERA.innerRange ? CAMERA.fillInner : CAMERA.fillOuter;
      level.alarm = Math.min(100, level.alarm + rate * dt);
      level.lastSeen = { x: p.x, y: p.y };
    }
    // The sweep holds its aim while it has you; ticks at each reversal.
    if (!c.seesNow && c.disabledT <= 0) {
      const before = Math.sin((level.time * 2 * Math.PI) / c.period + c.phase);
      c.face = c.base + Math.sin(((level.time + dt) * 2 * Math.PI) / c.period + c.phase) * c.sweep;
      const after = Math.sin(((level.time + dt) * 2 * Math.PI) / c.period + c.phase);
      if (Math.sign(before) !== Math.sign(after) && Math.abs(after) > 0.98) events |= EV.CAMTICK;
    } else {
      c.face = Math.atan2(p.y - c.y, p.x - c.x);
    }
  }

  // Guards.
  let maxMeter = 0;
  for (const g of level.guards) {
    const seen = stepGuard(level, g, dt, () => (contact = true));
    if (seen) level.lastSeen = { x: p.x, y: p.y };
    maxMeter = Math.max(maxMeter, g.meter);
    if (g.meter >= SIGHT.suspectAt && !g.wasSuspect) { g.wasSuspect = true; events |= EV.SUSPECT; }
    if (g.meter < SIGHT.suspectAt - 5) g.wasSuspect = false;
    if (g.meter >= SIGHT.alertAt && !g.wasAlert) {
      g.wasAlert = true;
      events |= EV.SPOTTED;
      level.alarm = Math.min(100, level.alarm + ALARM.guardSpike);
      contact = true;
    }
    if (g.meter < SIGHT.alertAt - 10) g.wasAlert = false;
    if (g.state === "chase" && Math.hypot(g.x - p.x, g.y - p.y) < g.r + p.r - 2) events |= EV.CAUGHT;
  }
  level.maxMeter = maxMeter;

  // Lasers.
  for (const l of level.lasers) {
    l.cool = Math.max(0, l.cool - dt);
    if (!laserActive(level, l) || l.cool > 0) continue;
    if (l.high && p.sneak) continue; // crawl under a high beam
    if (segsCross(p.prevX, p.prevY, p.x, p.y, l.x1, l.y1, l.x2, l.y2)) {
      l.cool = 1.5;
      level.alarm = Math.min(100, level.alarm + ALARM.laserSpike);
      contact = true;
      events |= EV.LASER;
      level.lastSeen = { x: (l.x1 + l.x2) / 2, y: (l.y1 + l.y2) / 2 };
    }
  }

  // The alarm meter: drain once the building loses you.
  if (contact) level.contactT = 0;
  else level.contactT += dt;
  if (level.lockdownT > 0) {
    level.lockdownT -= dt;
    level.alarm = 100;
    if (level.lockdownT <= 0) level.alarm = 84;
  } else if (level.contactT > ALARM.drainDelay) {
    const rate = level.lockdowns > 0 && level.alarm >= ALARM.tierAlarm ? ALARM.lockdownDecay : ALARM.drain;
    level.alarm = Math.max(0, level.alarm - rate * dt);
  }
  level.alarmPeak = Math.max(level.alarmPeak, level.alarm);

  // Lockdown and the getaway clock.
  if (level.alarm >= 100 && level.lockdownT <= 0) {
    level.lockdowns++;
    events |= EV.LOCKDOWN;
    if (level.lockdowns >= 2) {
      events |= EV.BUSTED;
    } else {
      level.lockdownT = ALARM.lockdownLatch;
      level.getawayT = ALARM.getawaySeconds;
    }
  }
  if (level.getawayT > 0 && level.lockdowns === 1) {
    level.getawayT -= dt;
    if (level.getawayT <= 0) events |= EV.BUSTED;
  }

  // Loot.
  for (const item of level.loot) {
    if (!item.taken && Math.hypot(item.x - p.x, item.y - p.y) < 22) {
      item.taken = true;
      item.dropped = false;
      p.bags++;
      events |= EV.LOOT;
    }
  }
  if (!level.main.taken && Math.hypot(level.main.x - p.x, level.main.y - p.y) < 24) {
    level.main.taken = true;
    p.hasMain = true;
    events |= EV.MAIN;
  }

  // The van.
  const ex = level.exit;
  if (!exitSealed(level) && p.x > ex.x && p.x < ex.x + ex.w && p.y > ex.y && p.y < ex.y + ex.h)
    events |= EV.CLEAR;
  return events;
}

function cameraSees(level, c) {
  if (c.disabledT > 0) return false;
  const p = level.player;
  const dx = p.x - c.x, dy = p.y - c.y;
  const dist = Math.hypot(dx, dy);
  if (dist > CAMERA.range || dist < CAMERA.deadRadius) return false;
  let ang = Math.atan2(dy, dx) - c.face;
  while (ang > Math.PI) ang -= 2 * Math.PI;
  while (ang < -Math.PI) ang += 2 * Math.PI;
  if (Math.abs(ang) > CAMERA.halfAngle) return false;
  return !losBlocked(c.x, c.y, p.x, p.y, level.solids);
}

function stepGuard(level, g, dt, onSeen) {
  const p = level.player;
  const dx = p.x - g.x, dy = p.y - g.y;
  const dist = Math.hypot(dx, dy);
  let seen = false;
  if (dist <= SIGHT.range) {
    let ang = Math.atan2(dy, dx) - g.face;
    while (ang > Math.PI) ang -= 2 * Math.PI;
    while (ang < -Math.PI) ang += 2 * Math.PI;
    if (Math.abs(ang) <= SIGHT.halfAngle) {
      const blockers = p.sneak ? level.solids : level.walls;
      if (!losBlocked(g.x, g.y, p.x, p.y, blockers)) seen = true;
    }
  }
  if (dist <= SIGHT.proximityRange && !p.sneak && p.moving) seen = true;

  if (seen) {
    onSeen();
    const rate = dist <= SIGHT.innerRange ? SIGHT.fillInner : SIGHT.fillOuter;
    g.meter = Math.min(100, g.meter + rate * dt * (p.sneak ? 0.55 : 1));
    g.unseenFor = 0;
    g.lastSeen = { x: p.x, y: p.y };
  } else {
    g.unseenFor += dt;
    if (g.unseenFor > SIGHT.holdBeforeDrain)
      g.meter = Math.max(0, g.meter - SIGHT.drain * dt * (g.state === "investigate" ? 1.6 : 1));
  }

  const tier = alarmTier(level);
  if (g.meter >= SIGHT.alertAt) g.state = "chase";
  else if (g.meter >= SIGHT.suspectAt && g.state === "patrol") {
    g.state = "investigate";
    g.target = g.lastSeen ?? { x: p.x, y: p.y };
    g.wait = 0;
  } else if (tier >= 2 && g.state === "patrol" && level.lastSeen) {
    g.state = "converge";
    g.target = level.lastSeen;
  }

  const speedBoost = tier >= 2 ? 1.25 : 1;
  const arrive = (tx, ty, speed) => {
    const ddx = tx - g.x, ddy = ty - g.y;
    const d = Math.hypot(ddx, ddy);
    if (d < 4) return true;
    g.face = Math.atan2(ddy, ddx);
    moveCircle(g, (ddx / d) * speed * speedBoost, (ddy / d) * speed * speedBoost, dt, level.solids);
    return Math.hypot(tx - g.x, ty - g.y) < 6;
  };

  if (g.state === "patrol") {
    const [tx, ty] = g.route[g.wp];
    if (g.wait > 0) {
      g.wait -= dt;
      g.face += Math.sin(level.time * 1.4 + g.lookPhase) * 0.35 * dt;
    } else if (arrive(tx, ty, g.speed)) {
      g.wp = (g.wp + 1) % g.route.length;
      g.wait = g.pauseAtWp;
    }
  } else if (g.state === "investigate" || g.state === "converge") {
    const t = g.target ?? g.lastSeen ?? { x: g.x, y: g.y };
    if (g.wait > 0) {
      g.wait -= dt;
      g.face += Math.sin(level.time * 2.1 + g.lookPhase) * 0.8 * dt;
      if (g.wait <= 0 && g.meter < SIGHT.suspectAt) g.state = "return";
    } else if (arrive(t.x, t.y, g.state === "converge" ? SPEED.converge : SPEED.investigate)) {
      g.wait = 1.4;
      if (g.state === "converge") g.state = "investigate";
    }
  } else if (g.state === "chase") {
    const t = seen ? { x: p.x, y: p.y } : g.lastSeen ?? { x: g.x, y: g.y };
    arrive(t.x, t.y, SPEED.chase);
    if (!seen && g.unseenFor > 1.5) {
      g.state = "search";
      g.searchT = 6;
      g.target = g.lastSeen ?? { x: g.x, y: g.y };
    }
    if (g.meter <= 30) g.state = "return";
  } else if (g.state === "search") {
    g.searchT -= dt;
    const t = g.target ?? { x: g.x, y: g.y };
    if (arrive(t.x, t.y, SPEED.investigate)) {
      g.face += Math.sin(level.time * 2.4 + g.lookPhase) * 1.1 * dt;
    }
    if (g.searchT <= 0 || g.meter < SIGHT.suspectAt) g.state = "return";
  } else if (g.state === "return") {
    let best = 0, bd = Infinity;
    g.route.forEach(([x, y], i) => {
      const d = (x - g.x) ** 2 + (y - g.y) ** 2;
      if (d < bd) { bd = d; best = i; }
    });
    if (arrive(g.route[best][0], g.route[best][1], SPEED.return)) {
      g.wp = best;
      g.state = "patrol";
      g.wait = 0;
    }
  }
  return seen;
}
