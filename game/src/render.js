// The Last Waltz Job — rendering. One frame must tell the whole
// story: a thief crossing a room, warm guard cones, cold violet camera
// fans, the gold prize, and the alarm meter that judges them all.

import { W, H, COLORS as C, SIGHT, CAMERA } from "./config.js";
import { conePolygon, laserActive, exitSealed, alarmTier } from "./world.js";

function rr(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
}

export function drawWorld(ctx, level, ui) {
  ctx.fillStyle = C.floor;
  ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = C.floorAlt;
  const cell = 64;
  for (let y = 0; y < H / cell; y++)
    for (let x = 0; x < W / cell; x++)
      if ((x + y) % 2 === 0) ctx.fillRect(x * cell, y * cell, cell, cell);
  ctx.strokeStyle = "rgba(255,255,255,0.025)";
  for (let x = 0; x <= W; x += cell) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); }
  for (let y = 0; y <= H; y += cell) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }

  drawVan(ctx, level);
  for (const l of level.lasers) drawLaser(ctx, level, l);
  for (const item of level.loot) if (!item.taken) drawLoot(ctx, item, ui.t);
  if (!level.main.taken) drawMain(ctx, level, ui.t);
  for (const r of level.walls) drawBlock(ctx, r, C.wall, C.wallTop);
  for (const r of level.cover) drawBlock(ctx, r, C.cover, C.coverTop);

  // Camera fans first (cold, rigid), then guard cones (warm, soft).
  for (const c of level.cameras) drawCamCone(ctx, level, c);
  for (const g of level.guards)
    drawCone(ctx, level, g.x, g.y, g.face, SIGHT.halfAngle, SIGHT.range,
      g.state === "chase" || g.meter >= SIGHT.alertAt ? C.coneAlert
        : g.meter >= SIGHT.suspectAt || g.state === "investigate" || g.state === "search" || g.state === "converge" ? C.coneSuspect
        : C.coneCalm, 0.16);
  for (const c of level.cameras) drawCamera(ctx, c, ui.t);
  for (const g of level.guards) drawGuard(ctx, g, ui.t);
  drawPlayer(ctx, level.player);

  // At high alarm the room itself warns you.
  const tier = alarmTier(level);
  if (tier >= 2) {
    const a = 0.10 + 0.06 * Math.sin(ui.t * 6);
    ctx.strokeStyle = `rgba(255, 77, 77, ${a + (level.alarm - 60) / 400})`;
    ctx.lineWidth = 10;
    ctx.strokeRect(0, 0, W, H);
  }
  const vg = ctx.createRadialGradient(W / 2, H / 2, H * 0.42, W / 2, H / 2, H * 0.86);
  vg.addColorStop(0, "rgba(0,0,0,0)");
  vg.addColorStop(1, "rgba(0,0,0,0.40)");
  ctx.fillStyle = vg;
  ctx.fillRect(0, 0, W, H);

  drawHud(ctx, level, ui);
}

function drawBlock(ctx, r, base, top) {
  ctx.fillStyle = "rgba(0,0,0,0.35)";
  ctx.fillRect(r[0] + 5, r[1] + 7, r[2], r[3]);
  ctx.fillStyle = base;
  ctx.fillRect(r[0], r[1], r[2], r[3]);
  ctx.fillStyle = top;
  ctx.fillRect(r[0], r[1], r[2], Math.min(7, r[3]));
  ctx.fillRect(r[0], r[1], Math.min(7, r[2]), r[3]);
}

function drawVan(ctx, level) {
  const e = level.exit;
  const sealed = exitSealed(level);
  ctx.fillStyle = sealed ? "#3d1520" : C.exitDark;
  ctx.fillRect(e.x, e.y, e.w, e.h);
  ctx.strokeStyle = sealed ? C.danger : C.exit;
  ctx.lineWidth = 3;
  ctx.strokeRect(e.x + 2, e.y + 2, e.w - 4, e.h - 4);
  ctx.fillStyle = sealed ? C.danger : C.exit;
  ctx.font = "700 13px system-ui, sans-serif";
  ctx.textAlign = "center";
  const label = sealed ? "SEALED" : "GETAWAY VAN";
  if (e.side === "right") {
    ctx.save();
    ctx.translate(e.x + e.w / 2 + 1, e.y + e.h / 2);
    ctx.rotate(Math.PI / 2);
    ctx.fillText(label, 0, 5);
    ctx.restore();
  } else {
    ctx.fillText(label, e.x + e.w / 2, e.y + 19);
  }
}

function drawLaser(ctx, level, l) {
  const on = laserActive(level, l);
  ctx.strokeStyle = on ? "rgba(255, 95, 86, 0.9)" : "rgba(255, 95, 86, 0.18)";
  ctx.lineWidth = on ? 3 : 2;
  ctx.beginPath();
  ctx.moveTo(l.x1, l.y1);
  ctx.lineTo(l.x2, l.y2);
  ctx.stroke();
  if (on) {
    ctx.strokeStyle = "rgba(255, 95, 86, 0.25)";
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.moveTo(l.x1, l.y1);
    ctx.lineTo(l.x2, l.y2);
    ctx.stroke();
  }
  for (const [x, y] of [[l.x1, l.y1], [l.x2, l.y2]]) {
    ctx.fillStyle = "#2b2f36";
    ctx.fillRect(x - 5, y - 5, 10, 10);
    ctx.fillStyle = on ? C.laser : "#7a3436";
    ctx.beginPath();
    ctx.arc(x, y, 3, 0, 6.29);
    ctx.fill();
  }
}

const LOOT_GLYPH = { painting: "▭", statue: "♟", boxes: "▦", cash: "$", safe: "▣", coins: "◉", bars: "▬", bonds: "▤", gems: "◆" };

function drawLoot(ctx, item, t) {
  const bob = Math.sin(t * 2.2 + item.phase) * 2;
  const glow = ctx.createRadialGradient(item.x, item.y + bob, 2, item.x, item.y + bob, 22);
  glow.addColorStop(0, "rgba(255,210,63,0.5)");
  glow.addColorStop(1, "rgba(255,210,63,0)");
  ctx.fillStyle = glow;
  ctx.fillRect(item.x - 22, item.y + bob - 22, 44, 44);
  ctx.fillStyle = C.loot;
  ctx.font = "700 17px system-ui, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText(LOOT_GLYPH[item.kind] ?? "◆", item.x, item.y + bob + 6);
  ctx.font = "600 10px system-ui, sans-serif";
  ctx.fillStyle = "#ffe9a8";
  ctx.fillText(String(item.value), item.x, item.y + bob + 20);
}

function drawMain(ctx, level, t) {
  const m = level.main;
  const glow = ctx.createRadialGradient(m.x, m.y, 4, m.x, m.y, 64);
  glow.addColorStop(0, "rgba(255,210,63,0.65)");
  glow.addColorStop(1, "rgba(255,210,63,0)");
  ctx.fillStyle = glow;
  ctx.fillRect(m.x - 64, m.y - 64, 128, 128);
  // A pedestal, a rotating sparkle ring, and the prize itself.
  ctx.fillStyle = "#2c3442";
  rr(ctx, m.x - 20, m.y - 14, 40, 30, 5);
  ctx.fill();
  ctx.strokeStyle = "rgba(255,210,63,0.8)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(m.x, m.y, 26 + Math.sin(t * 2) * 2, 0, 6.29);
  ctx.stroke();
  for (let i = 0; i < 4; i++) {
    const a = t * 1.3 + (i * Math.PI) / 2;
    ctx.fillStyle = "#fff3c4";
    ctx.beginPath();
    ctx.arc(m.x + Math.cos(a) * 26, m.y + Math.sin(a) * 26, 2.2, 0, 6.29);
    ctx.fill();
  }
  ctx.fillStyle = C.loot;
  ctx.font = "800 24px system-ui, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("◆", m.x, m.y + 8);
  ctx.font = "700 12px system-ui, sans-serif";
  ctx.fillText(level.prize.toUpperCase(), m.x, m.y + 40);
  ctx.fillStyle = "#ffe9a8";
  ctx.fillText(String(m.value), m.x, m.y + 55);
}

function drawCone(ctx, level, x, y, face, half, range, rgb, alpha) {
  const poly = conePolygon(x, y, face, half, range, level.solids);
  ctx.beginPath();
  poly.forEach(([px, py], i) => (i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py)));
  ctx.closePath();
  ctx.fillStyle = `rgba(${rgb}, ${alpha})`;
  ctx.fill();
  ctx.save();
  ctx.clip();
  const grad = ctx.createRadialGradient(x, y, 8, x, y, range);
  grad.addColorStop(0, `rgba(${rgb}, 0.26)`);
  grad.addColorStop(1, `rgba(${rgb}, 0)`);
  ctx.fillStyle = grad;
  ctx.fillRect(x - range, y - range, range * 2, range * 2);
  ctx.restore();
}

function drawCamCone(ctx, level, c) {
  if (c.disabledT > 0) return;
  const poly = conePolygon(c.x, c.y, c.face, CAMERA.halfAngle, CAMERA.range, level.solids);
  ctx.beginPath();
  poly.forEach(([px, py], i) => (i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py)));
  ctx.closePath();
  ctx.fillStyle = `rgba(${C.camCone}, ${c.seesNow ? 0.30 : 0.17})`;
  ctx.fill();
  ctx.strokeStyle = `rgba(${C.camCone}, 0.55)`;
  ctx.lineWidth = 1;
  ctx.setLineDash([6, 5]);
  ctx.stroke();
  ctx.setLineDash([]);
}

function drawCamera(ctx, c, t) {
  ctx.fillStyle = "#22262e";
  ctx.beginPath();
  ctx.arc(c.x, c.y, 10, 0, 6.29);
  ctx.fill();
  ctx.strokeStyle = C.camera;
  ctx.lineWidth = 2;
  ctx.stroke();
  const lx = c.x + Math.cos(c.face) * 6, ly = c.y + Math.sin(c.face) * 6;
  ctx.fillStyle = c.disabledT > 0 ? "#444" : "#c9c2ff";
  ctx.beginPath();
  ctx.arc(lx, ly, 3.4, 0, 6.29);
  ctx.fill();
  if (c.disabledT <= 0 && Math.sin(t * 4) > 0) {
    ctx.fillStyle = "#ff4040";
    ctx.beginPath();
    ctx.arc(c.x, c.y - 13, 2.4, 0, 6.29);
    ctx.fill();
  }
  if (c.disabledT > 0) {
    ctx.fillStyle = C.muted;
    ctx.font = "700 11px system-ui, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("DARK", c.x, c.y - 16);
  }
}

function drawGuard(ctx, g, t) {
  ctx.fillStyle = "rgba(0,0,0,0.4)";
  ctx.beginPath();
  ctx.ellipse(g.x, g.y + 9, 12, 5, 0, 0, 6.29);
  ctx.fill();
  ctx.fillStyle = C.guardDark;
  ctx.beginPath();
  ctx.arc(g.x, g.y, g.r, 0, 6.29);
  ctx.fill();
  ctx.fillStyle = C.guard;
  ctx.beginPath();
  ctx.arc(g.x, g.y - 2, g.r - 4, 0, 6.29);
  ctx.fill();
  const fx = g.x + Math.cos(g.face) * 10, fy = g.y + Math.sin(g.face) * 10;
  ctx.fillStyle = "#ffffff";
  ctx.beginPath();
  ctx.arc(fx, fy, 3, 0, 6.29);
  ctx.fill();
  if (g.state === "chase") mark(ctx, g.x, g.y - 26, "!", C.danger, t);
  else if (g.meter >= SIGHT.suspectAt || g.state === "investigate" || g.state === "search" || g.state === "converge")
    mark(ctx, g.x, g.y - 26, "?", "#ffb03d", t);
  if (g.meter > 1) {
    ctx.strokeStyle = g.meter >= SIGHT.alertAt ? C.danger : "#ffb03d";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(g.x, g.y, g.r + 5, -Math.PI / 2, -Math.PI / 2 + (g.meter / 100) * 6.29);
    ctx.stroke();
  }
}

function mark(ctx, x, y, ch, color, t) {
  ctx.fillStyle = color;
  ctx.font = "800 19px system-ui, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText(ch, x, y + Math.sin(t * 5) * 1.5);
}

function drawPlayer(ctx, p) {
  ctx.fillStyle = "rgba(0,0,0,0.45)";
  ctx.beginPath();
  ctx.ellipse(p.x, p.y + 8, 11, 5, 0, 0, 6.29);
  ctx.fill();
  ctx.fillStyle = p.sneak ? C.playerDark : C.player;
  ctx.beginPath();
  ctx.arc(p.x, p.y, p.sneak ? 10 : 12, 0, 6.29);
  ctx.fill();
  ctx.strokeStyle = "#fff0d0";
  ctx.lineWidth = 2;
  ctx.stroke();
  const fx = p.x + Math.cos(p.face) * 13, fy = p.y + Math.sin(p.face) * 13;
  ctx.fillStyle = "#fff0d0";
  ctx.beginPath();
  ctx.arc(fx, fy, 3, 0, 6.29);
  ctx.fill();
  if (p.bags > 0 || p.hasMain) {
    ctx.fillStyle = "#3a2c12";
    rr(ctx, p.x + 7, p.y - 4, 11, 12, 3);
    ctx.fill();
    ctx.strokeStyle = C.loot;
    ctx.lineWidth = 1;
    ctx.stroke();
  }
  if (p.sneak) {
    ctx.strokeStyle = "rgba(255,179,64,0.5)";
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.arc(p.x, p.y, 17, 0, 6.29);
    ctx.stroke();
    ctx.setLineDash([]);
  }
}

function chip(ctx, x, y, text, color = C.text) {
  ctx.font = "600 15px system-ui, sans-serif";
  const w = ctx.measureText(text).width + 22;
  ctx.fillStyle = "rgba(5,8,12,0.66)";
  rr(ctx, x, y, w, 30, 8);
  ctx.fill();
  ctx.fillStyle = color;
  ctx.textAlign = "left";
  ctx.fillText(text, x + 11, y + 20);
  return x + w + 8;
}

function drawHud(ctx, level, ui) {
  let x = 14;
  x = chip(ctx, x, 12, `SCORE ${ui.score}`);
  const lootValue = ui.levelLoot;
  x = chip(ctx, x, 12, `LOOT ${lootValue}`, C.loot);
  x = chip(ctx, x, 12, `BAGS ${level.player.bags}${level.player.hasMain ? " + PRIZE" : ""}`, C.loot);
  ctx.font = "600 15px system-ui, sans-serif";
  const boText = `BLACKOUT ×${level.blackouts}`;
  const boW = ctx.measureText(boText).width + 22;
  ctx.fillStyle = "rgba(5,8,12,0.66)";
  rr(ctx, W - boW - 14, 12, boW, 30, 8);
  ctx.fill();
  ctx.fillStyle = "#c9c2ff";
  ctx.textAlign = "left";
  ctx.fillText(boText, W - boW - 3, 32);

  // The alarm meter: ten blocks, top center, impossible to miss.
  const bw = 300, bx = W / 2 - bw / 2;
  ctx.fillStyle = "rgba(5,8,12,0.72)";
  rr(ctx, bx - 64, 10, bw + 128, 36, 9);
  ctx.fill();
  ctx.fillStyle = level.alarm >= 100 ? C.danger : C.text;
  ctx.font = "800 14px system-ui, sans-serif";
  ctx.textAlign = "left";
  ctx.fillText("ALARM", bx - 54, 33);
  const segW = (bw - 18) / 10;
  for (let i = 0; i < 10; i++) {
    const filled = level.alarm > i * 10;
    ctx.fillStyle = !filled ? "rgba(255,255,255,0.10)"
      : i < 3 ? "#ffd23f" : i < 7 ? "#ff8a3d" : "#ff4d4d";
    rr(ctx, bx + i * (segW + 2), 17, segW, 22, 4);
    ctx.fill();
  }
  ctx.font = "800 14px system-ui, sans-serif";
  ctx.textAlign = "left";
  if (level.lockdownT > 0) {
    ctx.fillStyle = C.danger;
    ctx.fillText(`SEALED ${Math.ceil(level.lockdownT)}s`, bx + bw + 8, 33);
  } else if (level.getawayT > 0) {
    ctx.fillStyle = C.danger;
    ctx.fillText(`GETAWAY ${Math.ceil(level.getawayT)}s`, bx + bw + 8, 33);
  } else {
    ctx.fillStyle = C.muted;
    ctx.fillText(`${Math.round(level.alarm)}%`, bx + bw + 8, 33);
  }
  ctx.fillStyle = C.muted;
  ctx.font = "500 13px system-ui, sans-serif";
  ctx.textAlign = "right";
  ctx.fillText("WASD move · Shift sneak · E blackout · X drop bag · P pause", W - 14, H - 12);
}

// --- panels ---------------------------------------------------------------------

function panel(ctx, title, lines, accent = C.loot) {
  ctx.fillStyle = "rgba(4,6,10,0.80)";
  ctx.fillRect(0, 0, W, H);
  ctx.textAlign = "center";
  ctx.fillStyle = accent;
  ctx.font = "800 52px Georgia, serif";
  ctx.fillText(title, W / 2, 208);
  lines.forEach((ln, i) => {
    ctx.fillStyle = ln.color ?? C.text;
    ctx.font = ln.big ? "700 24px system-ui, sans-serif" : "500 19px system-ui, sans-serif";
    ctx.fillText(ln.text, W / 2, 278 + i * 34);
  });
}

export function drawTitle(ctx) {
  ctx.fillStyle = "#0b0e13";
  ctx.fillRect(0, 0, W, H);
  panel(ctx, "THE LAST WALTZ JOB", [
    { text: "One night. One jewel. One last waltz.", color: C.muted },
    { text: "Steal the music. Leave no footprints.", color: C.muted },
    { text: "" },
    { text: "Vesper Cole dances through three scores in one night:" },
    { text: "a gallery, a bank, a depository. Take the prize, fill the bags," },
    { text: "and reach the van — every eye in the building feeds one ALARM meter." },
    { text: "" },
    { text: "Wardens see in warm cones · the Eyes of Argus sweep in violet", color: C.muted },
    { text: "Lasers spike the meter · at 100 the doors seal and the clock starts", color: C.muted },
    { text: "WASD move · Shift sneak · E blackout pulse · X drop a bag", color: C.muted },
    { text: "" },
    { text: "Press Enter — the orchestra is tuning", big: true },
  ]);
}

export function drawLevelClear(ctx, level, ui, s) {
  drawWorld(ctx, level, ui);
  panel(ctx, "CLEAN GETAWAY — " + level.prize.toUpperCase(), [
    { text: level.name, color: C.muted },
    { text: "" },
    { text: `Loot ${s.lootValue}   ·   Time bonus ${s.timeBonus}   ·   ${s.verdict} ${s.bonus > 0 ? "+" + s.bonus : ""}`, big: true },
    { text: `Alarm peaked at ${Math.round(s.peak)}%   ·   Score this score: ${s.gained}`, big: true },
    { text: "" },
    { text: ui.lastLevel ? "Press Enter for the final reckoning" : "Press Enter — the next score waits", color: C.muted },
  ], C.exit);
}

export function drawWin(ctx, ui) {
  ctx.fillStyle = "#0b0e13";
  ctx.fillRect(0, 0, W, H);
  panel(ctx, "THE WALTZ ENDS — YOU VANISH", [
    { text: "Three scores, one night, and the van is gone before the music stops.", color: C.muted },
    { text: "" },
    { text: `Final score ${ui.score}`, big: true },
    { text: `Grade ${ui.rank} — ${ui.style}   ·   Alarms ${ui.alarms}   ·   Spotted ${ui.spotteds}x`, big: true },
    { text: `Loot taken ${ui.lootCount}/${ui.lootTotal}   ·   Prizes ${ui.mains}/3`, big: true },
    { text: "" },
    { text: "Press Enter to dance it again", color: C.muted },
  ], C.exit);
}

export function drawBusted(ctx, ui) {
  ctx.fillStyle = "#0b0e13";
  ctx.fillRect(0, 0, W, H);
  panel(ctx, "BUSTED", [
    { text: ui.reason, color: C.muted },
    { text: "" },
    { text: `Score kept: ${ui.score}   ·   Reached ${ui.levelName}`, big: true },
    { text: "" },
    { text: "Press Enter to plan the night again", color: C.muted },
  ], C.danger);
}

export function drawPaused(ctx, level, ui) {
  drawWorld(ctx, level, ui);
  panel(ctx, "PAUSED", [{ text: "Press P or Esc — the waltz resumes", color: C.muted }]);
}
