import type { Meta, StoryObj } from "@storybook/react";

import { IPreviewArgs } from "./utils";

import CircularComponent from "../lib/progress/circular";

const meta = {
  component: CircularComponent,
  title: "Progress/Circular",
  tags: ["autodocs"],
  argTypes: {
    value: {
      control: "number",
    },
    minValue: {
      control: "number",
    },
    maxValue: {
      control: "number",
    },
    animated: {
      control: "boolean",
    },
    small: {
      control: "boolean",
    },
  },
} satisfies Meta<typeof CircularComponent>;

export default meta;

type Story = StoryObj<typeof meta> & IPreviewArgs;

export const Default: Story = {
  args: {
    themeUI: "dark",
    backgroundUI: "light",
    value: 50,
  },
};

export const Completed: Story = {
  args: {
    themeUI: "dark",
    backgroundUI: "light",
    value: 100,
  },
};

export const Small: Story = {
  args: {
    themeUI: "dark",
    backgroundUI: "light",
    value: 70,
    small: true,
  },
};

/** `animate` flag can be used to not show the fill animation. */
export const NonAnimated: Story = {
  args: {
    themeUI: "dark",
    backgroundUI: "light",
    value: 70,
    animated: false,
  },
};
