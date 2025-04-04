import type { Meta, StoryObj } from "@storybook/react";

import { IPreviewArgs } from "./utils";

import TagComponent from "../lib/tag";

const meta = {
  component: TagComponent,
  title: "Display/Tag",
  tags: ["autodocs"],
  argTypes: {
    active: {
      control: "boolean",
    },
  },
} satisfies Meta<typeof TagComponent>;

export default meta;

type Story = StoryObj<typeof meta> & IPreviewArgs;

export const Tag: Story = {
  args: {
    active: false,
    themeUI: "light",
    backgroundUI: "light",
    text: "Label",
  },
};

export const ActiveTag: Story = {
  args: {
    active: true,
    themeUI: "light",
    backgroundUI: "light",
    text: "Active",
  },
};
