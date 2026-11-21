// HUD: top bar (room, detection meter, mood chip), legend strip, hint, end and caught cards.
const FONT = 'system-ui, sans-serif';

export function drawTopBar(ctx, game) {
  ctx.fillStyle = '#0b0f17'; ctx.fillRect(0, 0, 1280, 48);
  ctx.fillStyle = '#21d4c0'; ctx.font = `900 24px ${FONT}`; ctx.textAlign = 'left';
  ctx.fillText('LAMPBLACK', 18, 33);
  ctx.fillStyle = '#d8d2c2'; ctx.font = `600 17px ${FONT}`;
  ctx.fillText(`Room ${game.roomIndex + 1}/3 · ${game.room.name}`, 190, 31);
  const m = Math.max(0, ...game.guards.map((g) => g.meter));
  const alert = game.guards.some((g) => g.state === 'search');
  ctx.fillStyle = '#9aa4b5'; ctx.font = `700 13px ${FONT}`; ctx.fillText('DETECTION', 560, 30);
  ctx.fillStyle = '#1d2533'; ctx.fillRect(650, 15, 300, 20);
  const grad = ctx.createLinearGradient(650, 0, 950, 0);
  grad.addColorStop(0, '#ffe066'); grad.addColorStop(0.5, '#ff9a2a'); grad.addColorStop(1, '#ff2b2b');
  ctx.fillStyle = grad; ctx.fillRect(650, 15, 300 * m, 20);
  ctx.strokeStyle = '#4a5568'; ctx.lineWidth = 2; ctx.strokeRect(650, 15, 300, 20);
  const chip = alert ? ['SEARCHING', '#ff3b3b'] : m >= 0.35 ? ['SUSPICIOUS', '#ff9a2a'] : ['CALM', '#3fcf7a'];
  ctx.fillStyle = chip[1]; ctx.fillRect(968, 11, 130, 28);
  ctx.fillStyle = '#0b0f17'; ctx.font = `800 15px ${FONT}`; ctx.textAlign = 'center'; ctx.fillText(chip[0], 1033, 31);
  ctx.fillStyle = '#9aa4b5'; ctx.font = `600 14px ${FONT}`; ctx.textAlign = 'right';
  ctx.fillText(`${game.time.toFixed(1)} s · seen ${game.seenCount}`, 1262, 31);
}

export function drawLegend(ctx) {
  ctx.fillStyle = '#0b0f17'; ctx.fillRect(0, 760, 1280, 40);
  const items = [
    ['GUARD', (x) => { ctx.fillStyle = '#e8373a'; ctx.beginPath(); ctx.arc(x, 780, 9, 0, 7); ctx.fill(); ctx.strokeStyle = '#fff'; ctx.lineWidth = 2; ctx.stroke(); }],
    ['VISION CONE', (x) => { ctx.fillStyle = 'rgba(255,236,150,0.5)'; ctx.beginPath(); ctx.moveTo(x - 9, 780); ctx.lineTo(x + 10, 771); ctx.lineTo(x + 10, 789); ctx.fill(); }],
    ['PATROL ROUTE', (x) => { ctx.strokeStyle = '#ff8a8a'; ctx.setLineDash([5, 4]); ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x - 10, 780); ctx.lineTo(x + 10, 780); ctx.stroke(); ctx.setLineDash([]); }],
    ['COVER', (x) => { ctx.fillStyle = '#ee9234'; ctx.fillRect(x - 9, 771, 18, 18); ctx.strokeStyle = '#000'; ctx.strokeRect(x - 9, 771, 18, 18); }],
    ['SHADOW = SAFE', (x) => { ctx.fillStyle = '#10151f'; ctx.fillRect(x - 9, 771, 18, 18); ctx.strokeStyle = '#21d4c0'; ctx.strokeRect(x - 9, 771, 18, 18); }],
    ['LAMPLIGHT = SEEN', (x) => { ctx.fillStyle = '#ffb455'; ctx.beginPath(); ctx.arc(x, 780, 9, 0, 7); ctx.fill(); }],
    ['EXIT', (x) => { ctx.fillStyle = '#1f9a52'; ctx.fillRect(x - 9, 771, 18, 18); ctx.strokeStyle = '#9dffbf'; ctx.strokeRect(x - 9, 771, 18, 18); }],
  ];
  let x = 30;
  ctx.font = `700 14px ${FONT}`; ctx.textAlign = 'left';
  for (const [label, icon] of items) {
    icon(x);
    ctx.fillStyle = '#d8d2c2'; ctx.fillText(label, x + 16, 785);
    x += ctx.measureText(label).width + 62;
  }
}

export function drawHint(ctx, t) {
  if (t <= 0) return;
  ctx.globalAlpha = Math.min(1, t);
  ctx.fillStyle = 'rgba(8,11,18,0.85)'; ctx.fillRect(390, 70, 500, 40);
  ctx.fillStyle = '#e8e2d2'; ctx.font = `600 16px ${FONT}`; ctx.textAlign = 'center';
  ctx.fillText('WASD move · SHIFT sneak · stay in shadow · reach the EXIT', 640, 96);
  ctx.globalAlpha = 1;
}

export function drawEndCard(ctx, game) {
  ctx.fillStyle = 'rgba(4,6,12,0.72)'; ctx.fillRect(0, 48, 1280, 712);
  ctx.fillStyle = '#121a26'; ctx.fillRect(390, 230, 500, 300);
  ctx.strokeStyle = '#21d4c0'; ctx.lineWidth = 4; ctx.strokeRect(390, 230, 500, 300);
  const stars = game.seenCount === 0 ? 3 : game.seenCount <= 2 ? 2 : 1;
  ctx.textAlign = 'center';
  ctx.fillStyle = '#7ff3e6'; ctx.font = `900 40px ${FONT}`;
  ctx.fillText(game.seenCount === 0 ? 'ESCAPED UNSEEN' : 'ESCAPED', 640, 300);
  ctx.font = `900 64px ${FONT}`;
  ctx.fillStyle = '#ffd24a'; ctx.fillText('★'.repeat(stars) + '☆'.repeat(3 - stars), 640, 385);
  ctx.fillStyle = '#d8d2c2'; ctx.font = `600 22px ${FONT}`;
  ctx.fillText(`Time ${game.time.toFixed(1)} s   ·   Times seen ${game.seenCount}`, 640, 440);
  ctx.fillStyle = '#9aa4b5'; ctx.font = `600 16px ${FONT}`;
  ctx.fillText('3 rooms crossed · press R to run the harbour again', 640, 490);
}

export function drawCaught(ctx, t) {
  ctx.fillStyle = `rgba(120,0,0,${Math.min(0.6, t)})`; ctx.fillRect(0, 48, 1280, 712);
  ctx.fillStyle = '#fff'; ctx.font = `900 48px ${FONT}`; ctx.textAlign = 'center';
  ctx.fillText('CAUGHT — room restarts', 640, 420);
}
