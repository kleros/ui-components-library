import type { StorybookConfig } from "@storybook/react-vite";

const config: StorybookConfig = {
  stories: ["../src/**/*.mdx", "../src/**/*.stories.@(js|jsx|mjs|ts|tsx)"],
  addons: [
    "@storybook/addon-essentials",
    "@storybook/addon-onboarding",
    "@chromatic-com/storybook",
    "@storybook/addon-interactions",
  ],
  framework: {
    name: "@storybook/react-vite",
    options: {},
  },
  typescript: {
    reactDocgen: "react-docgen-typescript",
    reactDocgenTypescriptOptions: {
      propFilter: (prop) => {
        if (prop.parent) {
          const fileName = prop.parent.fileName;
          // Include props from our own code (not in node_modules)
          if (!fileName.includes("node_modules")) {
            return true;
          }
          // Include props from react-aria-components and react-aria
          if (
            fileName.includes("react-aria-components") ||
            fileName.includes("react-aria") ||
            fileName.includes("node_modules/@react-types")
          ) {
            return true;
          }
          // Exclude all other props from node_modules
          return false;
        }
        return true;
      },
    },
  },
};
export default config;
