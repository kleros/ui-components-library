import { defineConfig } from "vitest/config";

// Root Vitest config. Each test suite is a separate project so that other
// projects (e.g. Storybook browser tests) can be added to `projects` alongside
// `unit`. Run a single one with `vitest run --project=<name>`.
export default defineConfig({
  test: {
    projects: ["./vitest.unit.config.ts"],
    coverage: {
      provider: "v8",
      include: ["src/utils/**", "src/hooks/**"],
      exclude: ["**/*.test.{ts,tsx}"],
      reporter: ["text", "html"],
      reportsDirectory: "coverage",
    },
  },
});
