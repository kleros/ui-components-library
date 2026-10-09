import React, { useEffect } from "react";
import clsx from "clsx";

import type { Preview } from "@storybook/react";

import { allModes } from "./modes";
import {
  auditA11y,
  expectNoStaleA11yExceptions,
  resetA11yAudit,
} from "../src/stories/a11y";

import "../src/styles/global.css";

export type IPreviewArgs = {
  themeUI: "light" | "dark";
  backgroundUI: "white" | "light";
};

// The `theme` global (toolbar, Chromatic modes) has no default and overrides
// the `themeUI` arg when set.
const applyTheme = (theme: string | undefined) => {
  document.documentElement.classList.toggle("dark", theme === "dark");
};

const preview: Preview = {
  decorators: [
    (Story, { args }) => {
      const { backgroundUI } = args;
      const background =
        backgroundUI === "white"
          ? "var(--klerosUIComponentsWhiteBackground)"
          : "var(--klerosUIComponentsLightBackground)";
      useEffect(() => {
        // Paint the whole canvas, not just the padded wrapper, so dark
        // snapshots aren't framed by the default white body.
        document.body.style.backgroundColor = background;
      }, [background]);
      return (
        <div
          className={clsx(
            "p-4",
            backgroundUI === "white"
              ? "bg-klerosUIComponentsWhiteBackground"
              : "bg-klerosUIComponentsLightBackground",
          )}
        >
          <Story />
        </div>
      );
    },
  ],
  // Runs before every render, args and globals changes included.
  beforeEach: ({ args, globals }) => {
    applyTheme(globals.theme ?? args.themeUI);
    resetA11yAudit();
  },
  // Audits the state each story ends in; plays add their own checkpoints.
  experimental_afterEach: async (context) => {
    await auditA11y(context, "end");
    await expectNoStaleA11yExceptions(context);
  },
  globalTypes: {
    theme: {
      description: "Theme (overrides the themeUI arg)",
      toolbar: {
        title: "Theme",
        icon: "mirror",
        items: [
          { value: "light", title: "Light", icon: "sun" },
          { value: "dark", title: "Dark", icon: "moon" },
        ],
        dynamicTitle: true,
      },
    },
  },
  args: {
    themeUI: "light",
    backgroundUI: "white",
  },
  argTypes: {
    themeUI: {
      options: ["light", "dark"],
      control: { type: "radio" },
    },
    backgroundUI: {
      options: ["white", "light"],
      control: { type: "radio" },
    },
  },
  parameters: {
    layout: "centered",
    a11y: {
      // Storybook UI only; story tests run `auditA11y` instead of the addon check.
      test: "error",
    },
    chromatic: {
      modes: {
        light: allModes.light,
        dark: allModes.dark,
      },
    },
  },
};

export default preview;
