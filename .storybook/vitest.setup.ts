import { beforeAll } from "vitest";
import { setProjectAnnotations } from "@storybook/react";

import * as projectAnnotations from "./preview";
// Also drops real Playwright input; tests that drive the real mouse belong in
// the `storybook-native` project (src/native), which does not load this file.
import "./trusted-event-filter";

// The a11y addon's afterEach is left out: preview's `auditA11y` afterEach
// covers the end state in both themes, with the story's a11y exceptions.
const project = setProjectAnnotations([projectAnnotations]);

beforeAll(project.beforeAll);
