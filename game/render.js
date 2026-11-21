// Drawing the level: floor, walls, cover, exit, routes, footprints, cones, guards, courier.
import { castCone } from './geometry.js';
import { guardMood } from './guards.js';
import { LOSE_TIME } from './detection.js';

export const W = 1280, H = 712;
const CONE = {
  calm: ['rgba(255,236,150,0.20)', '#ffe98a'],
  suspicious: ['rgba(255,150,40,0.32)', '#ff9a2a'],
  alert: ['rgba(255,45,45,0.34)', '#ff3b3b'],
};

export function drawFloor(ctx) {
  ctx.fillStyle = '#1c2533'; ctx.fillRect(0, 0, W, H);
  ctx.strokeStyle = '#243042'; ctx.lineWidth = 1;
  for (let x = 0; x <= W; x += 32) { ctx.beginPath(); ctx.moveTo(x + 0.5, 0); ctx.lineTo(x + 0.5, H); ctx.stroke(); }
  for (let y = 0; y <= H; y += 32) { ctx.beginPath(); ctx.moveTo(0, y + 0.5); ctx.lineTo(W, y + 0.5); ctx.stroke(); }
}

export function drawWalls(ctx, walls) {
  for (const r of walls) {
    ctx.fillStyle = 'rgba(0,0,0,0.45)'; ctx.fillRect(r.x + 5, r.y + 5, r.w, r.h);
    ctx.fillStyle = '#cfc8b6'; ctx.fillRect(r.x, r.y, r.w, r.h);
    ctx.strokeStyle = '#8a8476'; ctx.lineWidth = 2; ctx.strokeRect(r.x + 1, r.y + 1, r.w - 2, r.h - 2);
  }
}

export function drawCover(ctx, cover) {
  for (const c of cover) {
    ctx.fillStyle = 'rgba(0,0,0,0.55)'; ctx.fillRect(c.x + 7, c.y + 7, c.w, c.h);
    ctx.fillStyle = c.kind === 'pillar' ? '#d9772a' : '#ee9234';
    ctx.fillRect(c.x, c.y, c.w, c.h);
    ctx.strokeStyle = '#a5561a'; ctx.lineWidth = 3;
    if (c.kind === 'pillar') {
      ctx.beginPath(); ctx.arc(c.x + c.w / 2, c.y + c.h / 2, c.w / 2 - 9, 0, 7); ctx.stroke();
    } else {
      ctx.beginPath(); ctx.moveTo(c.x + 6, c.y + 6); ctx.lineTo(c.x + c.w - 6, c.y + c.h - 6);
      ctx.moveTo(c.x + c.w - 6, c.y + 6); ctx.lineTo(c.x + 6, c.y + c.h - 6); ctx.stroke();
      ctx.strokeRect(c.x + 6, c.y + 6, c.w - 12, c.h - 12);
    }
    ctx.strokeStyle = '#000'; ctx.lineWidth = 3; ctx.strokeRect(c.x, c.y, c.w, c.h);
  }
}

export function drawExit(ctx, e, t) {
  const pulse = 0.6 + Math.sin(t * 3) * 0.25;
  const g = ctx.createRadialGradient(e.x + e.w / 2, e.y + e.h / 2, 4, e.x + e.w / 2, e.y + e.h / 2, 90);
  g.addColorStop(0, `rgba(80,255,140,${0.55 * pulse})`); g.addColorStop(1, 'rgba(80,255,140,0)');
  ctx.fillStyle = g; ctx.fillRect(e.x - 90, e.y - 90, e.w + 180, e.h + 180);
  ctx.fillStyle = '#1f9a52'; ctx.fillRect(e.x, e.y, e.w, e.h);
  ctx.strokeStyle = '#9dffbf'; ctx.lineWidth = 3; ctx.strokeRect(e.x, e.y, e.w, e.h);
  ctx.fillStyle = '#eafff0'; ctx.font = 'bold 16px system-ui, sans-serif'; ctx.textAlign = 'center';
  ctx.fillText('EXIT', e.x + e.w / 2, e.y + e.h / 2 + 6);
}

export function drawRoutes(ctx, guards) {
  ctx.save();
  for (const g of guards) {
    if (g.wps.length < 2) continue;
    ctx.strokeStyle = 'rgba(255,120,120,0.45)'; ctx.lineWidth = 2; ctx.setLineDash([8, 7]);
    ctx.beginPath();
    g.wps.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
    if (g.wps.length > 2) ctx.closePath();
    ctx.stroke(); ctx.setLineDash([]);
    g.wps.forEach(([x, y], i) => {
      ctx.fillStyle = 'rgba(120,30,30,0.9)'; ctx.beginPath(); ctx.arc(x, y, 9, 0, 7); ctx.fill();
      ctx.fillStyle = '#ffd0d0'; ctx.font = 'bold 11px system-ui, sans-serif'; ctx.textAlign = 'center';
      ctx.fillText(String(i + 1), x, y + 4);
    });
  }
  ctx.restore();
}

export function drawPrints(ctx, prints) {
  for (const f of prints) {
    const a = Math.max(0, 1 - f.t / 4) * 0.6;
    ctx.save(); ctx.translate(f.x, f.y); ctx.rotate(f.a);
    ctx.fillStyle = `rgba(255,130,110,${a})`;
    ctx.beginPath(); ctx.ellipse(0, f.side * 6, 5, 3, 0, 0, 7); ctx.fill();
    ctx.restore();
  }
}

export function drawRings(ctx, rings) {
  for (const r of rings) {
    const k = r.t / r.life;
    ctx.strokeStyle = r.color.replace('A', (1 - k) * 0.8);
    ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(r.x, r.y, 8 + k * r.max, 0, 7); ctx.stroke();
  }
}

export function drawCone(ctx, g, solids, flash) {
  const mood = guardMood(g);
  const [fill, edge] = CONE[mood];
  const pts = castCone(g.x, g.y, g.a, solids);
  ctx.fillStyle = fill; ctx.beginPath(); ctx.moveTo(g.x, g.y);
  for (const [x, y] of pts) ctx.lineTo(x, y);
  ctx.closePath(); ctx.fill();
  ctx.strokeStyle = edge; ctx.lineWidth = 2; ctx.stroke();
  if (g.near && flash) {
    const p = g.nearSide < 0 ? pts[0] : pts[pts.length - 1];
    ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 5; ctx.shadowColor = '#fff'; ctx.shadowBlur = 14;
    ctx.beginPath(); ctx.moveTo(g.x, g.y); ctx.lineTo(p[0], p[1]); ctx.stroke();
    ctx.shadowBlur = 0;
  }
}

export function drawGhost(ctx, g) {
  if (!g.ghost) return;
  const { x, y } = g.ghost;
  ctx.save(); ctx.setLineDash([5, 4]); ctx.strokeStyle = '#7ff3e6'; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.arc(x, y, 15, 0, 7); ctx.stroke(); ctx.setLineDash([]);
  ctx.fillStyle = 'rgba(127,243,230,0.25)'; ctx.beginPath(); ctx.arc(x, y, 13, 0, 7); ctx.fill();
  ctx.fillStyle = '#7ff3e6'; ctx.font = 'bold 11px system-ui, sans-serif'; ctx.textAlign = 'center';
  ctx.fillText('LAST SEEN', x, y + 30);
  const k = Math.max(0, g.loseT / LOSE_TIME);
  ctx.fillStyle = 'rgba(0,0,0,0.75)'; ctx.fillRect(x - 46, y - 46, 92, 20);
  ctx.fillStyle = '#ff4a4a'; ctx.fillRect(x - 43, y - 43, 86 * k, 14);
  ctx.fillStyle = '#fff'; ctx.font = 'bold 11px system-ui, sans-serif'; ctx.fillText('LOSE HIM', x, y - 32);
  ctx.restore();
}

export function drawGuard(ctx, g) {
  const mood = guardMood(g);
  ctx.fillStyle = 'rgba(0,0,0,0.5)'; ctx.beginPath(); ctx.arc(g.x + 4, g.y + 5, g.r, 0, 7); ctx.fill();
  ctx.fillStyle = mood === 'alert' ? '#ff2b2b' : '#e8373a';
  ctx.beginPath(); ctx.arc(g.x, g.y, g.r, 0, 7); ctx.fill();
  ctx.strokeStyle = '#fff'; ctx.lineWidth = 3; ctx.stroke();
  ctx.save(); ctx.translate(g.x, g.y); ctx.rotate(g.a);
  ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.moveTo(g.r + 9, 0); ctx.lineTo(g.r - 4, -8); ctx.lineTo(g.r - 4, 8); ctx.closePath(); ctx.fill();
  ctx.restore();
  // meter under the guard
  ctx.fillStyle = 'rgba(0,0,0,0.7)'; ctx.fillRect(g.x - 22, g.y + g.r + 6, 44, 7);
  ctx.fillStyle = g.meter >= 1 ? '#ff3b3b' : g.meter >= 0.35 ? '#ff9a2a' : '#ffe066';
  ctx.fillRect(g.x - 21, g.y + g.r + 7, 42 * g.meter, 5);
  if (mood !== 'calm') {
    const ch = mood === 'alert' ? '!' : '?';
    ctx.fillStyle = mood === 'alert' ? '#ff3b3b' : '#ff9a2a';
    ctx.beginPath(); ctx.arc(g.x, g.y - g.r - 18, 14, 0, 7); ctx.fill();
    ctx.strokeStyle = '#000'; ctx.lineWidth = 2; ctx.stroke();
    ctx.fillStyle = '#fff'; ctx.font = 'bold 22px system-ui, sans-serif'; ctx.textAlign = 'center';
    ctx.fillText(ch, g.x, g.y - g.r - 10);
  }
}

export function drawPlayer(ctx, p) {
  ctx.fillStyle = 'rgba(0,0,0,0.5)'; ctx.beginPath(); ctx.arc(p.x + 3, p.y + 4, p.r, 0, 7); ctx.fill();
  ctx.fillStyle = '#21d4c0'; ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, 7); ctx.fill();
  ctx.strokeStyle = '#06302c'; ctx.lineWidth = 3; ctx.stroke();
  ctx.fillStyle = '#d9fffa'; ctx.beginPath(); ctx.arc(p.x, p.y, 4, 0, 7); ctx.fill();
  const tag = p.lit ? 'LIT' : 'HIDDEN';
  ctx.font = 'bold 12px system-ui, sans-serif'; ctx.textAlign = 'center';
  const w = ctx.measureText(tag).width + 10;
  ctx.fillStyle = p.lit ? '#ffcf5a' : '#0d3b37'; ctx.fillRect(p.x - w / 2, p.y - p.r - 22, w, 16);
  ctx.fillStyle = p.lit ? '#2a1a00' : '#7ff3e6'; ctx.fillText(tag, p.x, p.y - p.r - 10);
}

export function drawVignette(ctx, strength) {
  if (strength <= 0) return;
  const g = ctx.createRadialGradient(W / 2, H / 2, H * 0.35, W / 2, H / 2, W * 0.7);
  g.addColorStop(0, 'rgba(255,0,0,0)'); g.addColorStop(1, `rgba(200,0,0,${0.55 * strength})`);
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
}
