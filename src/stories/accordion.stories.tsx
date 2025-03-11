import React from "react";
import type { Meta, StoryObj } from "@storybook/react";

import { IPreviewArgs } from "./utils";

import Accordion from "../lib/accordion/index";

const meta = {
  component: Accordion,
} satisfies Meta<typeof Accordion>;

export default meta;

type Story = StoryObj<typeof meta> & IPreviewArgs;

export const DarkTheme: Story = {
  args: {
    className: "max-w-[80dvw]",

    items: [
      {
        title: "How it works?",
        body: (
          <small className="text-klerosUIComponentsPrimaryText">
            {"hello\nhello\n\n\n\n\nhello"}
          </small>
        ),
      },
      {
        title: "How it works?",
        body: (
          <small className="text-klerosUIComponentsPrimaryText">hello</small>
        ),
      },
    ],

    themeUI: "dark",
    backgroundUI: "light",
  },
};
