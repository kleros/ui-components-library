import type { Meta, StoryObj } from "@storybook/react";

import { IPreviewArgs } from "./utils";

import BoxComponent from "../lib/container/box";

const meta = {
  component: BoxComponent,
  title: "Containers/Box",
  tags: ["autodocs"],
} satisfies Meta<typeof BoxComponent>;

export default meta;

type Story = StoryObj<typeof meta> & IPreviewArgs;

export const Box: Story = {
  args: {
    themeUI: "dark",
    backgroundUI: "light",
    className: "w-[500px]",
  },
};
