import { defineProject } from "vitest/config";

// Unit tests for standalone functions (src/utils, src/hooks) in jsdom.
// Kept separate from vite.config.ts so the lib/dts build plugins are not loaded.
export default defineProject({
  test: {
    name: "unit",
    environment: "jsdom",
    include: ["src/utils/**/*.test.{ts,tsx}", "src/hooks/**/*.test.{ts,tsx}"],
    exclude: ["**/node_modules/**", "**/*.stories.*"],
    restoreMocks: true,
    unstubGlobals: true,
  },
});
