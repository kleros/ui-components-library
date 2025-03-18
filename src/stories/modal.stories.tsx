import type { Meta, StoryObj } from "@storybook/react";

import { IPreviewArgs } from "./utils";

import ModalComponent from "../lib/container/box";

const meta = {
  component: ModalComponent,
  title: "Containers/Modal",
  tags: ["autodocs"],
} satisfies Meta<typeof ModalComponent>;

export default meta;

type Story = StoryObj<typeof meta> & IPreviewArgs;

export const Modal: Story = {
  args: {
    themeUI: "dark",
    backgroundUI: "light",
    className: "w-[500px]",
  },
};
