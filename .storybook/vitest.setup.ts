import { beforeAll } from "vitest";
import { setProjectAnnotations } from "@storybook/react";
import * as a11yAddonAnnotations from "@storybook/addon-a11y/preview";

import * as projectAnnotations from "./preview";

// Apply Storybook's project annotations (decorators, args, parameters and the
// a11y addon's afterEach check) to the stories run by Vitest.
const project = setProjectAnnotations([
  a11yAddonAnnotations,
  projectAnnotations,
]);

beforeAll(project.beforeAll);

// Interactions in story tests are synthetic (userEvent); the real (Playwright)
// mouse never moves. Chromium still dispatches *trusted* pointer/mouse boundary
// events at that stationary cursor whenever the layout under it changes (e.g.
// hover-revealed stepper buttons appearing), which react-aria reads as the
// pointer leaving the hovered element. Drop those events so hover state only
// follows the simulated pointer.
// WARNING: this also drops events from *real* browser input. A future story
// test driving the real mouse (e.g. `userEvent` from `@vitest/browser/context`)
// would have its hover/move events silently swallowed; remove or scope this
// filter before adding such a test.
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
