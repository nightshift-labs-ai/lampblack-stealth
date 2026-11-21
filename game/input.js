// Keyboard state: WASD / arrows to move, Shift to sneak, R to restart room.
export const keys = {};
export function bindInput(onFirstKey) {
  addEventListener('keydown', (e) => {
    keys[e.key.toLowerCase()] = true;
    onFirstKey();
    if (e.key.startsWith('Arrow') || e.key === ' ') e.preventDefault();
  });
  addEventListener('keyup', (e) => { keys[e.key.toLowerCase()] = false; });
  addEventListener('blur', () => { for (const k in keys) keys[k] = false; });
}
