import type { Meta, StoryObj } from "@storybook/react";

import { IPreviewArgs } from "./utils";

import LargeDisplayComponent from "../lib/display/large";
import Dai from "../assets/svgs/dai.svg";

const meta = {
  component: LargeDisplayComponent,
  title: "Display/DisplayLarge",
  tags: ["autodocs"],
} satisfies Meta<typeof LargeDisplayComponent>;

export default meta;

type Story = StoryObj<typeof meta> & IPreviewArgs;

export const DisplayLarge: Story = {
  args: {
    themeUI: "dark",
    backgroundUI: "light",
    className: "w-[288px]",
    text: "$244.08",
    label: "ETH Price",
    Icon: Dai,
  },
};
