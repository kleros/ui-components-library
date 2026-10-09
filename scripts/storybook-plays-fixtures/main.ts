import type { StorybookConfig } from "@storybook/react-vite";

// Known-bad stories for the plays checker's self-test; never part of the real Storybook.
const config: StorybookConfig = {
  stories: ["./*.stories.tsx"],
  framework: { name: "@storybook/react-vite", options: {} },
  core: { disableTelemetry: true },
};
export default config;
