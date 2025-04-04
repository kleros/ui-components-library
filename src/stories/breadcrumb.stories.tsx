import type { Meta, StoryObj } from "@storybook/react";

import { IPreviewArgs } from "./utils";

import BreadcrumbComponent from "../lib/breadcrumb";

const meta = {
  component: BreadcrumbComponent,
  title: "Pagination/Breadcrumb",
  tags: ["autodocs"],
  argTypes: {
    variant: {
      options: ["primary", "secondary"],
      control: { type: "radio" },
    },
    clickable: {
      control: "boolean",
    },
  },
} satisfies Meta<typeof BreadcrumbComponent>;

export default meta;

type Story = StoryObj<typeof meta> & IPreviewArgs;

export const Breadcrumb: Story = {
  args: {
    variant: "primary",
    themeUI: "dark",
    backgroundUI: "light",
    items: [
      { text: "General Court", value: 0 },
      { text: "Blockchain", value: 1 },
      { text: "Non-Technical", value: 2 },
    ],
    clickable: false,
  },
};
