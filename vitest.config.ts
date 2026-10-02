import path from "node:path";
import { fileURLToPath } from "node:url";

import { defineConfig } from "vitest/config";
import { storybookTest } from "@storybook/experimental-addon-test/vitest-plugin";

const dirname =
  typeof __dirname !== "undefined"
    ? __dirname
    : path.dirname(fileURLToPath(import.meta.url));

// Vitest projects. Each project is self-contained so other projects (e.g. a
// jsdom `unit` project) can be added alongside `storybook` without coupling.
// More info: https://storybook.js.org/docs/8.6/writing-tests/test-addon
export default defineConfig({
  test: {
    projects: [
      {
        extends: "./vite.config.ts",
        plugins: [
          // Runs every story (and its play function) as a test.
          storybookTest({ configDir: path.join(dirname, ".storybook") }),
        ],
        // Pre-bundle the test-only dependencies up front so Vite does not
        // re-optimize (and reload) in the middle of a run.
        optimizeDeps: {
          include: ["@storybook/test", "@storybook/addon-a11y/preview"],
        },
        test: {
          name: "storybook",
          browser: {
            enabled: true,
            headless: true,
            provider: "playwright",
            instances: [{ browser: "chromium" }],
          },
          setupFiles: ["./.storybook/vitest.setup.ts"],
        },
      },
      "./vitest.unit.config.ts",
    ],
    coverage: {
      provider: "v8",
      include: ["src/utils/**", "src/hooks/**"],
      exclude: ["**/*.test.{ts,tsx}"],
      reporter: ["text", "html"],
      reportsDirectory: "coverage",
    },
  },
});
