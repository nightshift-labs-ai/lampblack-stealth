// Play-test + screenshots: serves game/ in-process, asserts on window.__game, saves JPEGs to screenshots/.
import { createRequire } from 'node:module';
import { createServer } from 'node:http';
import { readFileSync, writeFileSync, statSync } from 'node:fs';
import { join, extname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));
const require = createRequire(join(process.env.PW_NODE_MODULES, 'x.js'));
const { chromium } = require('playwright');
const types = { '.html': 'text/html', '.js': 'text/javascript' };
const server = createServer((req, res) => {
  const p = join(root, 'game', decodeURIComponent(req.url.split('?')[0]).replace(/^\/$/, '/index.html'));
  try { res.writeHead(200, { 'content-type': types[extname(p)] || 'application/octet-stream' }); res.end(readFileSync(p)); }
  catch { res.writeHead(404); res.end(); }
});
await new Promise((r) => server.listen(0, r));
const base = `http://localhost:${server.address().port}/`;
const browser = await chromium.launch();
const errors = [];
try {
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 }, deviceScaleFactor: 1 });
  page.on('pageerror', (e) => errors.push(String(e)));
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
  await page.goto(base);
  await page.waitForFunction(() => window.__game);
  const r = await page.evaluate(() => {
    const G = window.__game, out = {};
    G.teleport(300, 600);
    for (let i = 0; i < 5; i++) G.step(0.1);
    out.seenMeter = G.guards[0].meter;
    G.teleport(60, 100);
    for (let i = 0; i < 40; i++) G.step(0.1);
    out.hiddenMeter = G.guards[0].meter;
    G.teleport(60, 100); G.step(0.1, { d: true }); out.moved = G.player.x > 60;
    G.teleport(1224, 68); G.step(0.05);
    out.room = G.room;
    return out;
  });
  console.log('playtest', JSON.stringify(r));
  if (!(r.seenMeter > 0.1 && r.hiddenMeter < r.seenMeter && r.moved && r.room === 1)) throw new Error('playtest failed');
  for (const [name, q] of [['1-cover.jpg', 'cover'], ['2-vault.jpg', 'vault'], ['3-alarm.jpg', 'alarm'], ['4-complete.jpg', 'complete']]) {
    await page.goto(`${base}?shot=${q}`);
    await page.waitForFunction(() => window.__shotReady);
    let quality = 85, file = join(root, 'screenshots', name);
    do { writeFileSync(file, await page.screenshot({ type: 'jpeg', quality })); quality -= 10; } while (statSync(file).size > 262144);
    console.log(name, statSync(file).size);
  }
} finally {
  await browser.close();
  server.close();
}
if (errors.length) { console.error('console errors:', errors); process.exit(1); }
