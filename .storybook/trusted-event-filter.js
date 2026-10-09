// Interactions in story plays are synthetic (userEvent); the real (Playwright)
// mouse never moves. Chromium still dispatches *trusted* pointer/mouse boundary
// events at that stationary cursor whenever the layout under it changes (e.g.
// hover-revealed stepper buttons appearing), which react-aria reads as the
// pointer leaving the hovered element. Drop those events so hover state only
// follows the simulated pointer. Plain JS: also injected by
// scripts/check-storybook-plays.mjs as a page init script.

// Read by the plays checker's self-test fixture to prove the filter is loaded.
window.__trustedEventFilter = true;

for (const type of [
  "pointerover",
  "pointerout",
  "pointerenter",
  "pointerleave",
  "pointermove",
  "mouseover",
  "mouseout",
  "mouseenter",
  "mouseleave",
  "mousemove",
]) {
  window.addEventListener(
    type,
    (event) => {
      if (event.isTrusted) event.stopImmediatePropagation();
    },
    { capture: true },
  );
}
