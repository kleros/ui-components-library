import type { Meta, StoryObj } from "@storybook/react";

import { IPreviewArgs } from "./utils";

import PushComponent from "../lib/messages/push";

const meta = {
  component: PushComponent,
  title: "Message/Push",
  tags: ["autodocs"],
  argTypes: {
    variant: {
      options: ["success", "sync", "error"],
      control: "radio",
    },
  },
} satisfies Meta<typeof PushComponent>;

export default meta;

type Story = StoryObj<typeof meta> & IPreviewArgs;

export const Push: Story = {
  args: {
    themeUI: "dark",
    backgroundUI: "light",
    className: "w-[500px]",
    variant: "sync",
    title: "Transaction",
    msg: "Transaction pending",
    small: false,
    callback: () => {},
  },
};
