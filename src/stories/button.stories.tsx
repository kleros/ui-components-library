import type { Meta, StoryObj } from "@storybook/react";

import { IPreviewArgs } from "./utils";

import Button from "../lib/button/index";
import Telegram from "../assets/svgs/telegram.svg";

const meta = {
  component: Button,
  title: "Button",
  tags: ["autodocs"],
  argTypes: {
    // by default storybook generates an inputType,
    // https://storybook.js.org/docs/essentials/controls#choosing-the-control-type
    variant: {
      options: ["primary", "secondary", "tertiary"],
      control: { type: "radio" },
    },
    isDisabled: {
      control: "boolean",
    },
  },
} satisfies Meta<typeof Button>;

export default meta;

type Story = StoryObj<typeof meta> & IPreviewArgs;

export const PrimaryButton: Story = {
  args: {
    variant: "primary",
    text: "Primary",
    themeUI: "dark",
    backgroundUI: "light",
  },
};

export const SecondaryButton: Story = {
  args: {
    variant: "secondary",
    text: "Secondary",
    themeUI: "dark",
    backgroundUI: "light",
  },
};

export const TertiaryButton: Story = {
  args: {
    variant: "tertiary",
    text: "Tertiary",
    themeUI: "dark",
    backgroundUI: "light",
  },
};

export const IconButton: Story = {
  args: {
    variant: "primary",
    text: "Telegram",
    Icon: Telegram,
    themeUI: "dark",
    backgroundUI: "light",
  },
};

export const LoadingButton: Story = {
  args: {
    variant: "primary",
    text: "Loading",
    isLoading: true,
    isDisabled: true,
    themeUI: "dark",
    backgroundUI: "light",
  },
};
