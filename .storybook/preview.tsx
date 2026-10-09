import React, { useEffect } from "react";
import clsx from "clsx";

import type { Preview } from "@storybook/react";

import { allModes } from "./modes";
import { auditA11y } from "../src/stories/a11y";

import "../src/styles/global.css";

export type IPreviewArgs = {
  themeUI: "light" | "dark";
  backgroundUI: "white" | "light";
};

const preview: Preview = {
  decorators: [
    (Story, { args, globals }) => {
      const { themeUI, backgroundUI } = args;
      // The `theme` global (toolbar / Chromatic modes) takes precedence over
      // the per-story `themeUI` arg. It has no default value, so when it is
      // unset the story's own `themeUI` arg keeps working as before.
      const theme = globals.theme ?? themeUI;
      const background =
        backgroundUI === "white"
          ? "var(--klerosUIComponentsWhiteBackground)"
          : "var(--klerosUIComponentsLightBackground)";
      useEffect(() => {
        if (theme === "dark") document.documentElement.classList.add("dark");
        else document.documentElement.classList.remove("dark");
      }, [theme]);
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
  // Audits the state each story ends in; plays add their own checkpoints.
  experimental_afterEach: (context) => auditA11y(context, "end"),
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
