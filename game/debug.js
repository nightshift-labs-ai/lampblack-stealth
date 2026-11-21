// ?shot=cover|vault|alarm|complete stages a fixed scene; window.__game is a read-only view + test step.
import { FOV } from './geometry.js';

function aimPast(g, p, side, extra = 0.07) {
  const a = Math.atan2(p.y - g.y, p.x - g.x);
  g.a = a - side * (FOV / 2 + extra);
}

export function stageShot(name, game, loadRoom) {
  if (name === 'cover') {
    loadRoom(1);
    const [a, b, c] = game.guards;
    Object.assign(game.player, { x: 497, y: 445 });
    Object.assign(a, { x: 735, y: 350, meter: 0.55, state: 'patrol' });
    aimPast(a, game.player, -1);
    a.near = true; a.nearSide = -1;
    Object.assign(b, { x: 1000, y: 330, meter: 1, state: 'search', ghost: { x: 1100, y: 250 }, loseT: 3 });
    b.a = Math.atan2(250 - 330, 1100 - 1000);
    Object.assign(c, { x: 320, y: 230, a: Math.PI / 2, meter: 0 });
    game.prints = [];
    for (let i = 0; i < 7; i++) game.prints.push({ x: 735, y: 140 + i * 28, a: Math.PI / 2, side: i % 2 ? 1 : -1, t: 3 - i * 0.4 });
    for (let i = 0; i < 5; i++) game.prints.push({ x: 320, y: 100 + i * 26, a: Math.PI / 2, side: i % 2 ? 1 : -1, t: 2.6 - i * 0.5 });
    game.rings.push({ x: 320, y: 230, t: 0.25, life: 0.8, max: 40, color: 'rgba(255,110,110,A)' });
    game.time = 41.3; game.seenCount = 1;
  } else if (name === 'vault') {
    loadRoom(2);
    const g = game.guards;
    Object.assign(g[0], { x: 560, y: 250, a: 0 });
    Object.assign(g[1], { x: 720, y: 460, a: Math.PI });
    Object.assign(g[2], { x: 410, y: 420, a: Math.PI / 2 });
    Object.assign(g[3], { x: 870, y: 300, a: -Math.PI / 2 });
    Object.assign(game.player, { x: 236, y: 300 });
    game.time = 12.8;
  } else if (name === 'alarm') {
    loadRoom(0);
    const [a, b] = game.guards;
    const ghost = { x: 672, y: 300 };
    Object.assign(game.player, { x: 672, y: 158 });
    Object.assign(a, { x: 560, y: 440, meter: 1, state: 'search', ghost, loseT: 5.2 });
    Object.assign(b, { x: 800, y: 430, meter: 1, state: 'search', ghost: { ...ghost }, loseT: 5.2 });
    a.a = Math.atan2(ghost.y - a.y, ghost.x - a.x); b.a = Math.atan2(ghost.y - b.y, ghost.x - b.x);
    game.vignette = 1; game.seenCount = 2; game.time = 23.4;
  } else if (name === 'complete') {
    loadRoom(0);
    Object.assign(game.player, { x: 1224, y: 70 });
    game.mode = 'complete'; game.time = 96.4; game.seenCount = 0;
  }
  game.frozen = true;
}

export function exposeDebug(game, step, keys) {
  const view = {
    get room() { return game.roomIndex; },
    get mode() { return game.mode; },
    get player() { return { ...game.player }; },
    get guards() { return game.guards.map((g) => ({ x: g.x, y: g.y, meter: g.meter, state: g.state, seen: g.seen })); },
    get seenCount() { return game.seenCount; },
    step(dt, pressed = {}) { for (const k in keys) keys[k] = false; Object.assign(keys, pressed); step(dt); },
    teleport(x, y) { game.player.x = x; game.player.y = y; },
  };
  Object.defineProperty(window, '__game', { value: Object.freeze(view), writable: false });
}
