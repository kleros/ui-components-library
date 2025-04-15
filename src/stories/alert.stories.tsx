import type { Meta, StoryObj } from "@storybook/react";

import { IPreviewArgs } from "./utils";

import AlertComponent from "../lib/messages/alert";

const meta = {
  component: AlertComponent,
  title: "Message/Alert",
  tags: ["autodocs"],
  argTypes: {
    variant: {
      options: ["success", "error", "warning", "info"],
      control: "radio",
    },
  },
} satisfies Meta<typeof AlertComponent>;

export default meta;

type Story = StoryObj<typeof meta> & IPreviewArgs;

export const Alert: Story = {
  args: {
    themeUI: "dark",
    backgroundUI: "light",
    className: "w-[500px]",
    variant: "warning",
    title: "This is a warning",
    msg: "Hiring an outside contractor?",
  },
};
