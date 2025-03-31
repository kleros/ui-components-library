import type { Meta, StoryObj } from "@storybook/react";

import { IPreviewArgs } from "./utils";

import StepComponent from "../lib/progress/steps";

const meta = {
  component: StepComponent,
  title: "Progress/Steps",
  tags: ["autodocs"],
  argTypes: {
    horizontal: {
      control: "boolean",
    },
    currentItemIndex: {
      control: "number",
    },
  },
} satisfies Meta<typeof StepComponent>;

export default meta;

type Story = StoryObj<typeof meta> & IPreviewArgs;

export const Default: Story = {
  args: {
    themeUI: "light",
    backgroundUI: "light",
    items: [
      { title: "Escrow Details" },
      { title: "Terms" },
      { title: "Preview" },
    ],
    horizontal: true,
    currentItemIndex: 1,
    className: "h-auto w-[500px]",
  },
};

/** Steps can be oriented vertically. */
export const VerticalOrientation: Story = {
  args: {
    ...Default.args,
    horizontal: false,
    className: "h-[300px] w-auto",
  },
};

/** Sub items can be provided for each individual step. */
export const SubItems: Story = {
  args: {
    ...Default.args,
    items: [
      { title: "Escrow Details", subitems: ["Type of Escrow", "Title"] },
      { title: "Terms", subitems: ["Deliverable", "Payment", "Deadline"] },
      { title: "Preview" },
    ],
  },
};
