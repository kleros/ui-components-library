import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";

// Vitest globals are disabled, so React Testing Library cannot register its
// automatic cleanup. Unmount everything rendered by a test before the next one.
afterEach(() => {
  cleanup();
});
