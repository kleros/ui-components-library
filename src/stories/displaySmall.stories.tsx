import type { Meta, StoryObj } from "@storybook/react";

import { IPreviewArgs } from "./utils";

import SmallDisplayComponent from "../lib/display/large";
import Dai from "../assets/svgs/dai.svg";

const meta = {
  component: SmallDisplayComponent,
  title: "Display/DisplaySmall",
  tags: ["autodocs"],
} satisfies Meta<typeof SmallDisplayComponent>;

export default meta;

type Story = StoryObj<typeof meta> & IPreviewArgs;

export const DisplayLarge: Story = {
  args: {
    themeUI: "dark",
    backgroundUI: "light",
    className: "w-[217px]",
    text: "250 DAI",
    label: "Amount",
    Icon: Dai,
  },
};
