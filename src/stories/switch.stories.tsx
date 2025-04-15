import type { Meta, StoryObj } from "@storybook/react";

import { IPreviewArgs } from "./utils";

import SwitchComponent from "../lib/form/switch";

const meta = {
  component: SwitchComponent,
  title: "Input/Switch",
  tags: ["autodocs"],
  argTypes: {
    small: {
      control: "boolean",
    },
  },
} satisfies Meta<typeof SwitchComponent>;

export default meta;

type Story = StoryObj<typeof meta> & IPreviewArgs;

export const Switch: Story = {
  args: {
    themeUI: "light",
    backgroundUI: "light",
    small: false,
  },
};
