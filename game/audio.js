// WebAudio: guard footstep ticks panned by position and faded by distance; near-miss rising tone.
let ac = null;

export function initAudio() {
  if (ac) return;
  try { ac = new (window.AudioContext || window.webkitAudioContext)(); } catch { ac = null; }
}

function blip(freq, endFreq, dur, vol, pan, type = 'square') {
  if (!ac) return;
  const t = ac.currentTime;
  const o = ac.createOscillator(), g = ac.createGain(), p = ac.createStereoPanner();
  o.type = type;
  o.frequency.setValueAtTime(freq, t);
  o.frequency.exponentialRampToValueAtTime(endFreq, t + dur);
  g.gain.setValueAtTime(vol, t);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  p.pan.value = Math.max(-1, Math.min(1, pan));
  o.connect(g).connect(p).connect(ac.destination);
  o.start(t); o.stop(t + dur + 0.02);
}

export function playStep(gx, gy, px, py) {
  const d = Math.hypot(gx - px, gy - py);
  const vol = Math.max(0, 1 - d / 700) * 0.06;
  if (vol > 0.002) blip(170, 90, 0.06, vol, (gx - px) / 500);
}
export function playNearMiss() { blip(420, 900, 0.25, 0.05, 0, 'triangle'); }
export function playAlert() { blip(700, 1200, 0.3, 0.08, 0, 'sawtooth'); }
export function playEscape() { blip(330, 990, 0.5, 0.07, 0, 'triangle'); }
