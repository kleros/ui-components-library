import type { Meta, StoryObj } from "@storybook/react";
import { expect, within } from "@storybook/test";

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
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // NOTE: `aria-labelledby` uses the raw label as an id, so a label with a
    // space ("ETH Price") does not resolve and the heading keeps its own text
    // as accessible name.
    const heading = canvas.getByRole("heading", { level: 1 });
    await expect(heading).toHaveTextContent("$244.08");
    await expect(heading).toHaveAttribute("aria-labelledby", "ETH Price");
    await expect(canvas.getByText("ETH Price")).toHaveAttribute(
      "id",
      "ETH Price",
    );
    await expect(canvasElement.querySelector("svg")).toHaveClass("absolute");
  },
};
