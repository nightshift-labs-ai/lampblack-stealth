// Per-guard detection meter: fills while seen (faster close / lit), drains after 1 s unseen.
import { FOV, RANGE, angleDiff, canSee, lineClear } from './geometry.js';

export const SUSPICIOUS = 0.35;
export const LOSE_TIME = 6;

export function updateDetection(g, p, dt, solids, onAlert) {
  const d = Math.hypot(p.x - g.x, p.y - g.y);
  const sees = canSee(g.x, g.y, g.a, p.x, p.y, solids);
  g.seen = sees;
  if (sees) {
    g.unseenT = 0;
    const close = 1 + (1 - d / RANGE) * 1.5;
    const light = p.lit ? 1.6 : 0.55;
    const sneak = p.sneak ? 0.6 : 1;
    g.meter = Math.min(1, g.meter + dt * 0.55 * close * light * sneak);
    if (g.state === 'search') { g.ghost = { x: p.x, y: p.y }; g.loseT = LOSE_TIME; }
  } else {
    g.unseenT += dt;
    if (g.unseenT > 1 && g.state !== 'search') g.meter = Math.max(0, g.meter - dt * 0.25);
  }
  if (g.meter >= 1 && g.state !== 'search') {
    g.state = 'search'; g.ghost = { x: p.x, y: p.y }; g.loseT = LOSE_TIME; g.pause = 0;
    onAlert(g);
  }
  if (g.state === 'search' && !sees) {
    g.loseT -= dt;
    if (g.loseT <= 0) { g.state = 'patrol'; g.meter = SUSPICIOUS - 0.01; g.ghost = null; g.pause = 0; }
  }
  g.near = false;
  if (!sees && d < RANGE + 16 && d > 20) {
    const off = angleDiff(Math.atan2(p.y - g.y, p.x - g.x), g.a);
    const gap = (Math.abs(off) - FOV / 2) * d;
    if (gap > 0 && gap < 16 + p.r && lineClear(g.x, g.y, p.x, p.y, solids)) { g.near = true; g.nearSide = Math.sign(off); }
  }
  return sees;
}
