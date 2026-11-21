// Guard patrols: waypoint loops with scan pauses, turning sentries, search at the ghost marker.
import { angleDiff } from './geometry.js';

export function makeGuard(def) {
  const [x, y] = def.wps[0];
  return {
    wps: def.wps, i: def.wps.length > 1 ? 1 : 0, x, y, r: 18, a: def.a ?? 0,
    sentry: def.wps.length === 1, state: 'patrol', meter: 0, pause: 0, scanBase: def.a ?? 0, scanT: 0,
    ghost: null, loseT: 0, seen: false, unseenT: 0, stepAcc: 0, near: false, nearSide: 0,
  };
}

export function guardMood(g) {
  return g.state === 'search' ? 'alert' : g.meter >= 0.35 ? 'suspicious' : 'calm';
}

export function updateGuard(g, dt, onStep) {
  g.scanT += dt;
  if (g.pause > 0) {
    g.pause -= dt;
    g.a = g.scanBase + Math.sin(g.scanT * 2.2) * 0.7;
    return;
  }
  if (g.sentry && g.state !== 'search') {
    const [hx, hy] = g.wps[0];
    if (Math.hypot(hx - g.x, hy - g.y) < 4) { g.a = g.scanBase + Math.sin(g.scanT * 0.8) * 1.5; return; }
  }
  const t = g.state === 'search' ? g.ghost : { x: g.wps[g.i][0], y: g.wps[g.i][1] };
  const dx = t.x - g.x, dy = t.y - g.y, d = Math.hypot(dx, dy);
  if (d < 4) {
    g.scanBase = g.a; g.scanT = 0;
    if (g.state === 'search') g.pause = 1.4;
    else if (!g.sentry) { g.i = (g.i + 1) % g.wps.length; g.pause = 1.2; }
    return;
  }
  g.a += angleDiff(Math.atan2(dy, dx), g.a) * Math.min(1, dt * 6);
  const s = Math.min(d, (g.state === 'search' ? 95 : 62) * dt);
  g.x += (dx / d) * s; g.y += (dy / d) * s;
  g.stepAcc += s;
  if (g.stepAcc > 26) { g.stepAcc = 0; onStep(g); }
}
