// The courier: movement, sneaking, collision with walls and cover.
export function makePlayer(x, y) {
  return { x, y, r: 13, sneak: false, moving: false, lit: false, stepT: 0 };
}

function pushOut(p, solids) {
  for (const r of solids) {
    const cx = Math.max(r.x, Math.min(p.x, r.x + r.w));
    const cy = Math.max(r.y, Math.min(p.y, r.y + r.h));
    const dx = p.x - cx, dy = p.y - cy, d = Math.hypot(dx, dy);
    if (d < p.r && d > 0) { p.x = cx + (dx / d) * p.r; p.y = cy + (dy / d) * p.r; }
  }
}

export function movePlayer(p, keys, dt, solids) {
  const dx = (keys.d || keys.arrowright ? 1 : 0) - (keys.a || keys.arrowleft ? 1 : 0);
  const dy = (keys.s || keys.arrowdown ? 1 : 0) - (keys.w || keys.arrowup ? 1 : 0);
  p.sneak = !!keys.shift;
  const speed = p.sneak ? 80 : 160;
  const len = Math.hypot(dx, dy);
  p.moving = len > 0;
  if (!len) return;
  p.x += (dx / len) * speed * dt; pushOut(p, solids);
  p.y += (dy / len) * speed * dt; pushOut(p, solids);
}
