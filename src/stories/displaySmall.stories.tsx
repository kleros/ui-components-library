import type { Meta, StoryObj } from "@storybook/react";
import { expect, within } from "@storybook/test";

import { IPreviewArgs } from "./utils";

import SmallDisplayComponent from "../lib/display/small";
import Dai from "../assets/svgs/dai.svg";

const meta = {
  component: SmallDisplayComponent,
  title: "Display/DisplaySmall",
  tags: ["autodocs"],
} satisfies Meta<typeof SmallDisplayComponent>;

export default meta;

type Story = StoryObj<typeof meta> & IPreviewArgs;

export const DisplaySmall: Story = {
  args: {
    themeUI: "dark",
    backgroundUI: "light",
    className: "w-[217px]",
    text: "250 DAI",
    label: "Amount",
    Icon: Dai,
  },
  play: async ({ canvasElement }) => {
    // the value is labelled by the `label` text
    const heading = within(canvasElement).getByRole("heading", {
      level: 2,
      name: "Amount",
    });
    await expect(heading).toHaveTextContent("250 DAI");
    // the label is rendered above the value card
    const label = within(canvasElement).getByText("Amount");
    await expect(
      label.compareDocumentPosition(heading) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
  },
};
