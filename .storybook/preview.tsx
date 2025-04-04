import React, { useEffect } from "react";
import clsx from "clsx";

import type { Preview } from "@storybook/react";

import "../src/styles/global.css";

export type IPreviewArgs = {
  themeUI: "light" | "dark";
  backgroundUI: "white" | "light";
};

const preview: Preview = {
  decorators: [
    (Story, { args }) => {
      const { themeUI, backgroundUI } = args;
      useEffect(() => {
        if (themeUI === "dark") document.documentElement.classList.add("dark");
        else document.documentElement.classList.remove("dark");
      }, [themeUI]);
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
  },
};

export default preview;
