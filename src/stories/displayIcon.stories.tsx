import type { Meta, StoryObj } from "@storybook/react";

import { IPreviewArgs } from "./utils";

import IconDisplayComponent from "../lib/display/icon";
import Balance from "../assets/svgs/balance.svg";

const meta = {
  component: IconDisplayComponent,
  title: "Display/DisplayIcon",
  tags: ["autodocs"],
} satisfies Meta<typeof IconDisplayComponent>;

export default meta;

type Story = StoryObj<typeof meta> & IPreviewArgs;

export const DisplayIcon: Story = {
  args: {
    themeUI: "dark",
    backgroundUI: "light",
    className: "w-[400px]",
    text: "247",
    label: "Disputes",
    Icon: Balance,
  },
};
