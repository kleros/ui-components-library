import { defineProject } from "vitest/config";

// Unit tests for standalone functions (src/utils, src/hooks) in jsdom.
// Kept separate from vite.config.ts so the lib/dts build plugins are not loaded.
export default defineProject({
  test: {
    name: "unit",
    environment: "jsdom",
    setupFiles: ["./src/test/setup.ts"],
    include: [
      "src/lib/**/*.test.{ts,tsx}",
      "src/utils/**/*.test.{ts,tsx}",
      "src/hooks/**/*.test.{ts,tsx}",
      "src/test/**/*.test.{ts,tsx}",
    ],
    exclude: ["**/node_modules/**", "**/*.stories.*", "**/*.browser.test.*"],
    restoreMocks: true,
    unstubGlobals: true,
  },
});
