import React from "react";
import type { Meta, StoryObj } from "@storybook/react";

import { IPreviewArgs } from "./utils";

import AccordionComponent from "../lib/accordion/index";

const meta = {
  component: AccordionComponent,
  title: "Accordion",
  tags: ["autodocs"],
} satisfies Meta<typeof AccordionComponent>;

export default meta;

type Story = StoryObj<typeof meta> & IPreviewArgs;

export const Accordion: Story = {
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
