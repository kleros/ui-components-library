import type { Meta, StoryObj } from "@storybook/react";
import { expect, within } from "@storybook/test";

import { IPreviewArgs } from "./utils";

import IconDisplayComponent from "../lib/display/icon";
import Balance from "../assets/svgs/balance.svg";
import { a11yExceptions } from "./a11y";
import { SECONDARY_TEXT_LIGHT } from "./a11y-defects";

const meta = {
  component: IconDisplayComponent,
  title: "Display/DisplayIcon",
  parameters: a11yExceptions(SECONDARY_TEXT_LIGHT),
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
  play: async ({ canvasElement }) => {
    // the value is labelled by the `label` text
    const heading = within(canvasElement).getByRole("heading", {
      level: 1,
      name: "Disputes",
    });
    await expect(heading).toHaveTextContent("247");
    // the icon is rendered inside its own card
    await expect(canvasElement.querySelector(".size-12 svg")).toBeTruthy();
  },
};
