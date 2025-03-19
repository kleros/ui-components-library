import type { Meta, StoryObj } from "@storybook/react";

import { IPreviewArgs } from "./utils";

import CopiableComponent from "../lib/copiable";

const meta = {
  component: CopiableComponent,
  title: "Copiable",
  tags: ["autodocs"],
  argTypes: {
    iconPlacement: {
      options: ["left", "right"],
      control: "radio",
    },
  },
} satisfies Meta<typeof CopiableComponent>;

export default meta;

type Story = StoryObj<typeof meta> & IPreviewArgs;

export const Copiable: Story = {
  args: {
    themeUI: "light",
    backgroundUI: "light",
    iconPlacement: "right",
    copiableContent: "I can be copied!",
    children: "I can be copied!",
    info: "Copy this text.",
  },
};

export const LeftAlignedCopiable: Story = {
  args: {
    themeUI: "light",
    backgroundUI: "light",
    iconPlacement: "left",
    copiableContent: "I can be copied!",
    children: "I can be copied!",
    info: "Copy this text",
  },
};
