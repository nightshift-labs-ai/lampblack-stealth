# LAMPBLACK

An original top-down stealth game. You play a night courier slipping through three lamp-lit harbour rooms (Salt Warehouse, Lantern Gallery, Clock Vault) to reach the glowing EXIT without being seen.

## How to play
- **WASD / arrows** to move, **Shift** to sneak (half speed, makes no footstep rings), **R** to restart the room.
- Guards walk dashed, numbered patrol loops and stop to scan. Each guard has his own meter. It fills while he sees you: faster up close or in lamplight, slower in shadow or while you sneak. It drains once you have been out of sight for 1 s.
- At 35% the guard shows **?** and his cone turns orange. At 100% he shows **!**, his cone turns red, and he walks to your last-seen marker. Stay hidden while his **LOSE HIM** bar drains and he goes back to his route.
- If you slip within 16 px of a cone's edge, the edge flashes white and a tone rises. Guard footprints and step rings (with panned audio ticks) show you where the guards are.
- If a guard touches you, the room restarts. The end card shows your time, how many times you were seen, and your stars.

## Run locally
`node serve.ts` (Node 22.18+), then open http://localhost:8080. Or serve `game/` with any static server. There is no build step and no network access.

## Hand-in
`mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts` copies game/ and screenshots/ and writes dossier.json.

## How it was made
An AI coding agent (Claude) built this game. All art is procedural canvas 2D, all sound is generated with WebAudio, and the fonts are the system UI fonts. There are no image, sound or font files. The screenshots come from `tools/shots.mjs` (Playwright, `?shot=cover|vault|alarm|complete`). `vendor/makefun-game.ts` is make.fun's vendored kit library.

MIT licence, see LICENSE.
