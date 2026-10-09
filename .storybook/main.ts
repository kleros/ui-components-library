import type { StorybookConfig } from "@storybook/react-vite";

const config: StorybookConfig = {
  stories: ["../src/**/*.mdx", "../src/**/*.stories.@(js|jsx|mjs|ts|tsx)"],
  staticDirs: [
    // Small local files used by stories (e.g. the file viewer), so Storybook,
    // story tests and Chromatic render the same deterministic content.
    { from: "../src/stories/fixtures", to: "/fixtures" },
    // react-doc-viewer's own pdf.js worker; it must match the bundled API version.
    { from: "../node_modules/@cyntler/react-doc-viewer/dist", to: "/pdfjs" },
  ],
  addons: [
    "@storybook/addon-essentials",
    "@storybook/addon-onboarding",
    "@chromatic-com/storybook",
    "@storybook/addon-a11y",
    "@storybook/experimental-addon-test",
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
