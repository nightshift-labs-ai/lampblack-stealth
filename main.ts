// LAMPBLACK hand-in: copies game/ and screenshots/ to /output (or $MAKEFUN_OUTPUT_DIR)
// and writes dossier.json with the vendored make.fun buildDossier.
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
import { cpSync, existsSync, mkdirSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-game.ts';

const repo: string = fileURLToPath(new URL('.', import.meta.url));
const outDir: string = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

mkdirSync(outDir, { recursive: true });
cpSync(join(repo, 'game'), join(outDir, 'game'), { recursive: true });
mkdirSync(join(outDir, 'screenshots'), { recursive: true });
if (existsSync(join(repo, 'screenshots'))) {
  cpSync(join(repo, 'screenshots'), join(outDir, 'screenshots'), { recursive: true });
}

const dossier: string = buildDossier(outDir, {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  game_max_files: 993,
  game_max_bytes: 50331648,
  game_path_max_bytes: 1000,
});
writeFileSync(join(outDir, 'dossier.json'), dossier);

// Self-check of what was just written: refuse an entry the gate would refuse.
const problems: string[] = [];
const dossierPath = join(outDir, 'dossier.json');
if (!existsSync(dossierPath) || statSync(dossierPath).size > 1.5 * 1024 * 1024) problems.push('dossier.json missing or over 1.5 MiB');
const shots = readdirSync(join(outDir, 'screenshots')).filter((n) => !n.startsWith('.'));
if (shots.length < 3 || shots.length > 4) problems.push(`expected 3-4 screenshots, found ${shots.length}`);
for (const n of shots) if (statSync(join(outDir, 'screenshots', n)).size > 262144) problems.push(`${n} is over 256 KiB`);
if (!existsSync(join(outDir, 'game', 'index.html'))) problems.push('game/index.html missing');
if (problems.length) {
  console.error(`self-check failed:\n- ${problems.join('\n- ')}`);
  process.exit(1);
}
console.log(`wrote ${dossierPath} (${statSync(dossierPath).size} bytes), ${shots.length} screenshots, self-check ok`);
