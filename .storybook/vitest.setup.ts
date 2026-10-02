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
