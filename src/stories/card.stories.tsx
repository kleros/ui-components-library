import type { Meta, StoryObj } from "@storybook/react";

import { IPreviewArgs } from "./utils";

import CardComponent from "../lib/container/card";

const meta = {
  component: CardComponent,
  title: "Containers/Card",
  tags: ["autodocs"],
  argTypes: {
    hover: {
      control: "boolean",
    },
    round: {
      control: "boolean",
    },
  },
} satisfies Meta<typeof CardComponent>;

export default meta;

type Story = StoryObj<typeof meta> & IPreviewArgs;

export const Card: Story = {
  args: {
    themeUI: "dark",
    backgroundUI: "light",
    hover: false,
    round: true,
    className: "w-[500px]",
  },
};
