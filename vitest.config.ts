import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { defineConfig } from "vitest/config";
import { storybookTest } from "@storybook/experimental-addon-test/vitest-plugin";

const dirname =
  typeof __dirname !== "undefined"
    ? __dirname
    : path.dirname(fileURLToPath(import.meta.url));

const { dependencies } = JSON.parse(
  readFileSync(path.join(dirname, "package.json"), "utf8"),
) as { dependencies: Record<string, string> };

// Vite skips its import scan on a warm cache, so a dependency first imported
// by a new test file re-optimizes and reloads mid-run unless it is listed here.
const browserDeps = {
  include: [
    ...Object.keys(dependencies),
    "@storybook/test",
    "@testing-library/react",
    "axe-core",
  ],
};

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
        optimizeDeps: browserDeps,
        test: {
          name: "storybook",
          browser: {
            enabled: true,
            headless: true,
            provider: "playwright",
            instances: [{ browser: "chromium" }],
          },
          setupFiles: ["./.storybook/vitest.setup.ts"],
          // `A11Y_AUDIT_LOG=1` logs every a11y audit (checkpoint and theme).
          env: { A11Y_AUDIT_LOG: process.env.A11Y_AUDIT_LOG ?? "" },
        },
      },
      {
        extends: "./vite.config.ts",
        optimizeDeps: browserDeps,
        test: {
          name: "storybook-native",
          // Real Playwright input; the trusted-event filter in
          // .storybook/vitest.setup.ts is not installed here.
          include: [
            "src/native/**/*.native.test.tsx",
            "src/test/**/*.browser.test.tsx",
          ],
          browser: {
            enabled: true,
            headless: true,
            provider: "playwright",
            instances: [{ browser: "chromium" }],
          },
          setupFiles: ["./src/test/setup.ts", "./src/native/setup.ts"],
          // Runs after the other projects instead of beside them.
          sequence: { groupOrder: 1 },
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
