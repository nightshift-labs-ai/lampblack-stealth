# LAMPBLACK plan

Criteria (judge, most important first):
1. Complete stealth game in screenshots: top/side level, guards with vision cones, cover, exit reached unseen.
2. Fun and depth: learnable patrols, routes that reward patience, detection with a chance to recover.
3. Feel and polish: cone reacts as expected, near miss raises alarm, footsteps show where a guard is.
4. Look and originality: readable cover, guards visible against floor, lighting shows what is safe; no copying commercial games.
5. Structure: source split into files with one clear job each, named for what they do.

Exclusion in the brief, obeyed literally: "An entry copying an existing commercial game's names, characters, art, music or levels loses to an original one."

Game plan:
- Original top-down courier stealth in lamp-lit harbour rooms, canvas 2D, no image files.
- 3 rooms (Salt Warehouse, Lantern Gallery, Clock Vault), 2/3/4 guards, harder each room.
- Guards walk dashed numbered waypoint loops, pause to scan; one turning sentry.
- 70 deg / 260 px raycast cones clipped by walls and cover; per-guard meter, calm/?/! states.
- Light vs shadow changes detection speed; sneak (Shift) is slower and silent.
- Search a ghost marker at last-seen spot; LOSE HIM bar lets you recover.
- Near-miss edge flash + tone; guard footprints, step rings and panned WebAudio ticks.
- End card with time, times seen, stars; ?shot= stages for screenshots.
