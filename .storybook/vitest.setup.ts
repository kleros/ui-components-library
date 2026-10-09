import { beforeAll } from "vitest";
import { setProjectAnnotations } from "@storybook/react";

import * as projectAnnotations from "./preview";

// The a11y addon's afterEach is left out: preview's `auditA11y` afterEach
// covers the end state in both themes, with the story's a11y exceptions.
const project = setProjectAnnotations([projectAnnotations]);

beforeAll(project.beforeAll);

// Interactions in story tests are synthetic (userEvent); the real (Playwright)
// mouse never moves. Chromium still dispatches *trusted* pointer/mouse boundary
// events at that stationary cursor whenever the layout under it changes (e.g.
// hover-revealed stepper buttons appearing), which react-aria reads as the
// pointer leaving the hovered element. Drop those events so hover state only
// follows the simulated pointer.
// This also drops real Playwright input; tests that drive the real mouse belong
// in the `storybook-native` project (src/native), which does not load this file.
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
