import React from "react";
import type { Meta, StoryObj } from "@storybook/react";

import { IPreviewArgs } from "./utils";

import TooltipComponent from "../lib/tooltip";
import Tag from "../lib/tag";

const meta = {
  component: TooltipComponent,
  title: "Tooltip",
  tags: ["autodocs"],
  argTypes: {
    place: {
      options: ["top", "right", "bottom", "left"],
      control: "radio",
    },
    small: {
      control: "boolean",
    },
    isDisabled: {
      control: "boolean",
    },
    delay: {
      control: "number",
    },
    closeDelay: {
      control: "boolean",
    },
    className: {
      control: "text",
    },
    isOpen: {
      control: "boolean",
    },
    defaultOpen: {
      control: "boolean",
    },
  },
} satisfies Meta<typeof TooltipComponent>;

export default meta;

type Story = StoryObj<typeof meta> & IPreviewArgs;

export const Tooltip: Story = {
  args: {
    themeUI: "light",
    backgroundUI: "light",
    children: <Tag active text="Hover me, I'm a tag" />,
    text: "Tooltip Text",
  },
};

export const OpenTooltip: Story = {
  args: {
    themeUI: "light",
    backgroundUI: "light",
    children: <Tag active text="Hover me, I'm a tag" />,
    text: "I will always display",
    isOpen: true,
  },
};
