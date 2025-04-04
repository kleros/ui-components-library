import type { Meta, StoryObj } from "@storybook/react";

import { IPreviewArgs } from "./utils";

import LinearComponent from "../lib/progress/linear";

const meta = {
  component: LinearComponent,
  title: "Progress/Linear",
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
    width: {
      control: "number",
    },
    animated: {
      control: "boolean",
    },
  },
} satisfies Meta<typeof LinearComponent>;

export default meta;

type Story = StoryObj<typeof meta> & IPreviewArgs;

export const Default: Story = {
  args: {
    themeUI: "dark",
    backgroundUI: "light",
    value: 50,
    width: 400,
    valueLabel: "Deposit required = xETH of 0.01ETH",
  },
};

/** `animate` flag can be used to not show the fill animation. */
export const NonAnimated: Story = {
  args: {
    themeUI: "dark",
    backgroundUI: "light",
    value: 70,
    width: 400,
    valueLabel: "Deposit required = xETH of 0.01ETH",
    animated: false,
  },
};

/** Optional timer text can be provided, in case of time related progress */
export const WithTimerLabel: Story = {
  args: {
    themeUI: "dark",
    backgroundUI: "light",
    value: 50,
    width: 400,
    valueLabel: "Deposit required = xETH of 0.01ETH",
    timerText: "00d 03h 00m",
  },
};
