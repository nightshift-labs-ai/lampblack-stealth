// Ray casting against axis-aligned rectangles (walls and cover).
export const FOV = (70 * Math.PI) / 180;
export const RANGE = 260;

export function angleDiff(a, b) {
  let d = a - b;
  while (d > Math.PI) d -= Math.PI * 2;
  while (d < -Math.PI) d += Math.PI * 2;
  return d;
}

function slab(o, d, lo, hi) {
  if (Math.abs(d) < 1e-9) return o < lo || o > hi ? null : [-Infinity, Infinity];
  let t1 = (lo - o) / d, t2 = (hi - o) / d;
  return t1 < t2 ? [t1, t2] : [t2, t1];
}

export function rayHit(ox, oy, dx, dy, maxD, rects) {
  let best = maxD;
  for (const r of rects) {
    const sx = slab(ox, dx, r.x, r.x + r.w);
    const sy = slab(oy, dy, r.y, r.y + r.h);
    if (!sx || !sy) continue;
    const tmin = Math.max(0, sx[0], sy[0]);
    const tmax = Math.min(sx[1], sy[1]);
    if (tmin <= tmax && tmin < best) best = tmin;
  }
  return best;
}

export function castCone(x, y, angle, rects, rays = 48) {
  const pts = [];
  for (let i = 0; i <= rays; i++) {
    const a = angle - FOV / 2 + (FOV * i) / rays;
    const dx = Math.cos(a), dy = Math.sin(a);
    const d = rayHit(x, y, dx, dy, RANGE, rects);
    pts.push([x + dx * d, y + dy * d]);
  }
  return pts;
}

export function lineClear(x1, y1, x2, y2, rects) {
  const dx = x2 - x1, dy = y2 - y1, d = Math.hypot(dx, dy);
  if (d < 1) return true;
  return rayHit(x1, y1, dx / d, dy / d, d, rects) >= d - 1;
}

export function canSee(gx, gy, angle, px, py, rects) {
  const d = Math.hypot(px - gx, py - gy);
  if (d > RANGE) return false;
  if (Math.abs(angleDiff(Math.atan2(py - gy, px - gx), angle)) > FOV / 2) return false;
  return lineClear(gx, gy, px, py, rects);
}

export function pointInRect(x, y, r) {
  return x >= r.x && x <= r.x + r.w && y >= r.y && y <= r.y + r.h;
}
