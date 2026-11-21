// Lamp pools and darkness: warm light is where you are SEEN, shadow is SAFE.
let dark = null;

export function lightAt(lamps, x, y) {
  let best = 0;
  for (const L of lamps) best = Math.max(best, 1 - Math.hypot(x - L.x, y - L.y) / L.r);
  return best;
}

export function drawLampGlow(ctx, lamps) {
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  for (const L of lamps) {
    const g = ctx.createRadialGradient(L.x, L.y, 0, L.x, L.y, L.r);
    g.addColorStop(0, 'rgba(255,196,100,0.62)');
    g.addColorStop(0.55, 'rgba(255,150,60,0.30)');
    g.addColorStop(1, 'rgba(255,140,50,0)');
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.arc(L.x, L.y, L.r, 0, Math.PI * 2); ctx.fill();
  }
  ctx.restore();
}

export function drawDarkness(ctx, lamps, w, h) {
  if (!dark) { dark = document.createElement('canvas'); dark.width = w; dark.height = h; }
  const d = dark.getContext('2d');
  d.globalCompositeOperation = 'source-over';
  d.clearRect(0, 0, w, h);
  d.fillStyle = 'rgba(2,4,10,0.70)';
  d.fillRect(0, 0, w, h);
  d.globalCompositeOperation = 'destination-out';
  for (const L of lamps) {
    const g = d.createRadialGradient(L.x, L.y, 0, L.x, L.y, L.r);
    g.addColorStop(0, 'rgba(0,0,0,1)');
    g.addColorStop(0.6, 'rgba(0,0,0,0.8)');
    g.addColorStop(1, 'rgba(0,0,0,0)');
    d.fillStyle = g;
    d.beginPath(); d.arc(L.x, L.y, L.r, 0, Math.PI * 2); d.fill();
  }
  ctx.drawImage(dark, 0, 0);
}

export function drawLampFixtures(ctx, lamps) {
  for (const L of lamps) {
    ctx.fillStyle = '#2a1d10'; ctx.beginPath(); ctx.arc(L.x, L.y, 9, 0, 7); ctx.fill();
    ctx.fillStyle = '#ffe2a0'; ctx.beginPath(); ctx.arc(L.x, L.y, 5, 0, 7); ctx.fill();
  }
}
