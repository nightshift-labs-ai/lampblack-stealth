// LAMPBLACK main loop: room flow, update order, draw order (light under cones and actors).
import { ROOMS } from './levels.js';
import { pointInRect } from './geometry.js';
import { keys, bindInput } from './input.js';
import { makePlayer, movePlayer } from './player.js';
import { makeGuard, updateGuard } from './guards.js';
import { updateDetection } from './detection.js';
import { lightAt, drawLampGlow, drawDarkness, drawLampFixtures } from './lighting.js';
import * as R from './render.js';
import { drawTopBar, drawLegend, drawHint, drawEndCard, drawCaught } from './hud.js';
import { initAudio, playStep, playNearMiss, playAlert, playEscape } from './audio.js';
import { stageShot, exposeDebug } from './debug.js';

const ctx = document.getElementById('game').getContext('2d');
const game = {
  roomIndex: 0, room: null, player: null, guards: [], solids: [], prints: [], rings: [],
  mode: 'play', hintT: 3, time: 0, seenCount: 0, caughtT: 0, vignette: 0, frozen: false, clock: 0,
};

function loadRoom(i) {
  const room = ROOMS[i];
  Object.assign(game, { roomIndex: i, room, solids: [...room.walls, ...room.cover], prints: [], rings: [], mode: 'play', caughtT: 0 });
  game.player = makePlayer(...room.start);
  game.guards = room.guards.map(makeGuard);
}

function onStep(g) {
  game.prints.push({ x: g.x, y: g.y, a: g.a, side: game.prints.length % 2 ? 1 : -1, t: 0 });
  game.rings.push({ x: g.x, y: g.y, t: 0, life: 0.8, max: 40, color: 'rgba(255,110,110,A)' });
  playStep(g.x, g.y, game.player.x, game.player.y);
}

// Unsneaked steps within 220 px are heard: the guard turns to look and grows suspicious.
function hearStep(g, p) {
  if (g.state === 'search' || Math.hypot(g.x - p.x, g.y - p.y) > 220) return;
  g.heard = { x: p.x, y: p.y, t: 2 };
  g.meter = Math.max(g.meter, Math.min(0.6, g.meter + 0.12));
  g.scanBase = Math.atan2(p.y - g.y, p.x - g.x); g.scanT = 0; g.pause = Math.max(g.pause, 1);
}

function onAlert() { game.seenCount++; playAlert(); }

function step(dt) {
  game.clock += dt;
  if (game.mode === 'caught') { game.caughtT += dt; if (game.caughtT > 1.2) loadRoom(game.roomIndex); return; }
  if (game.mode !== 'play') { if (keys.r) { game.time = 0; game.seenCount = 0; loadRoom(0); } return; }
  if (keys.r) { loadRoom(game.roomIndex); return; }
  game.time += dt; game.hintT -= dt;
  const p = game.player;
  movePlayer(p, keys, dt, game.solids);
  p.lit = lightAt(game.room.lamps, p.x, p.y) > 0.3;
  if (p.moving && !p.sneak && (p.stepT += dt) > 0.35) {
    p.stepT = 0;
    game.rings.push({ x: p.x, y: p.y, t: 0, life: 0.6, max: 50, color: 'rgba(80,240,220,A)' });
    for (const g of game.guards) hearStep(g, p);
  }
  let alert = false;
  for (const g of game.guards) {
    const wasNear = g.near;
    updateGuard(g, dt, onStep);
    updateDetection(g, p, dt, game.solids, onAlert);
    if (g.near && !wasNear) playNearMiss();
    if (g.state === 'search') alert = true;
    if (Math.hypot(g.x - p.x, g.y - p.y) < g.r + p.r) { game.mode = 'caught'; return; }
  }
  game.vignette += ((alert ? 1 : 0) - game.vignette) * Math.min(1, dt * 3);
  for (const g of game.guards) if (g.heard) g.heard.t -= dt;
  for (const f of game.prints) f.t += dt;
  for (const r of game.rings) r.t += dt;
  game.prints = game.prints.filter((f) => f.t < 4);
  game.rings = game.rings.filter((r) => r.t < r.life);
  if (pointInRect(p.x, p.y, game.room.exit)) {
    playEscape();
    if (game.roomIndex < ROOMS.length - 1) loadRoom(game.roomIndex + 1); else game.mode = 'complete';
  }
}

function draw() {
  ctx.fillStyle = '#07090e'; ctx.fillRect(0, 0, 1280, 800);
  drawTopBar(ctx, game);
  ctx.save(); ctx.translate(0, 48);
  ctx.beginPath(); ctx.rect(0, 0, R.W, R.H); ctx.clip();
  const room = game.room;
  R.drawFloor(ctx);
  drawLampGlow(ctx, room.lamps);
  drawDarkness(ctx, room.lamps, R.W, R.H);
  drawLampFixtures(ctx, room.lamps);
  R.drawRoutes(ctx, game.guards);
  R.drawPrints(ctx, game.prints);
  R.drawExit(ctx, room.exit, game.clock);
  R.drawWalls(ctx, room.walls);
  R.drawCover(ctx, room.cover);
  const flash = game.frozen || Math.floor(game.clock * 10) % 2 === 0;
  for (const g of game.guards) R.drawCone(ctx, g, game.solids, flash);
  for (const g of game.guards) R.drawHeard(ctx, g);
  R.drawRings(ctx, game.rings);
  for (const g of game.guards) R.drawGhost(ctx, g);
  for (const g of game.guards) R.drawGuard(ctx, g);
  R.drawPlayer(ctx, game.player);
  R.drawVignette(ctx, game.vignette);
  ctx.restore();
  drawLegend(ctx);
  if (!game.frozen) drawHint(ctx, game.hintT);
  if (game.mode === 'complete') drawEndCard(ctx, game);
  if (game.mode === 'caught') drawCaught(ctx, game.caughtT);
}

let last = 0;
function frame(t) {
  const dt = Math.min(0.05, (t - last) / 1000 || 0);
  last = t;
  if (!game.frozen) step(dt);
  draw();
  requestAnimationFrame(frame);
}

const shot = new URLSearchParams(location.search).get('shot');
loadRoom(0);
bindInput(initAudio);
exposeDebug(game, step, keys);
if (shot) {
  stageShot(shot, game, loadRoom);
  game.player.lit = lightAt(game.room.lamps, game.player.x, game.player.y) > 0.3;
  draw();
  window.__shotReady = true;
} else requestAnimationFrame(frame);
