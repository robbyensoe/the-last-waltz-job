// The Last Waltz Job — input: keyboard state plus mouse position.
// WASD / arrows move, Shift sneaks, E fires the blackout pulse,
// X drops the last bag, P or Esc pauses, Enter confirms panels.

export function makeInput(canvas) {
  const keys = new Set();
  const state = {
    keys,
    mouseX: 0,
    mouseY: 0,
    pressed: new Set(),
    clicked: false,
  };

  window.addEventListener("keydown", (e) => {
    if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "Space"].includes(e.code))
      e.preventDefault();
    if (!keys.has(e.code)) state.pressed.add(e.code);
    keys.add(e.code);
  });
  window.addEventListener("keyup", (e) => keys.delete(e.code));
  canvas.addEventListener("mousemove", (e) => {
    const r = canvas.getBoundingClientRect();
    state.mouseX = ((e.clientX - r.left) / r.width) * canvas.width;
    state.mouseY = ((e.clientY - r.top) / r.height) * canvas.height;
  });
  canvas.addEventListener("mousedown", () => (state.clicked = true));

  state.axis = () => {
    let x = 0;
    let y = 0;
    if (keys.has("KeyA") || keys.has("ArrowLeft")) x -= 1;
    if (keys.has("KeyD") || keys.has("ArrowRight")) x += 1;
    if (keys.has("KeyW") || keys.has("ArrowUp")) y -= 1;
    if (keys.has("KeyS") || keys.has("ArrowDown")) y += 1;
    return { x, y };
  };
  state.endFrame = () => {
    state.pressed.clear();
    state.clicked = false;
  };
  return state;
}
