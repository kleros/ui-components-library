import type { Meta, StoryObj } from "@storybook/react";
import { expect, fn, userEvent, within } from "@storybook/test";

import { IPreviewArgs } from "./utils";

import TagComponent from "../lib/tag";
import { a11yExceptions } from "./a11y";
import { PRIMARY_BLUE_TEXT_LIGHT } from "./a11y-defects";

const meta = {
  component: TagComponent,
  title: "Display/Tag",
  tags: ["autodocs"],
  args: {
    onPress: fn(),
  },
  argTypes: {
    active: {
      control: "boolean",
    },
  },
} satisfies Meta<typeof TagComponent>;

export default meta;

type Story = StoryObj<typeof meta> & IPreviewArgs;

const TAG_CONTRAST = a11yExceptions(PRIMARY_BLUE_TEXT_LIGHT);

export const Tag: Story = {
  parameters: TAG_CONTRAST,
  args: {
    active: false,
    themeUI: "light",
    backgroundUI: "light",
    text: "Label",
  },
  play: async ({ canvasElement, args }) => {
    const tag = within(canvasElement).getByRole("button", { name: "Label" });
    await expect(tag).not.toHaveClass("border-klerosUIComponentsPrimaryBlue");
    await expect(within(tag).getByText("Label")).toHaveClass(
      "hover:text-klerosUIComponentsSecondaryBlue",
    );
    await userEvent.click(tag);
    await expect(args.onPress).toHaveBeenCalledTimes(1);
    await userEvent.keyboard("{Enter}");
    await expect(args.onPress).toHaveBeenCalledTimes(2);
  },
};

export const ActiveTag: Story = {
  parameters: TAG_CONTRAST,
  args: {
    active: true,
    themeUI: "light",
    backgroundUI: "light",
    text: "Active",
  },
  play: async ({ canvasElement }) => {
    const tag = within(canvasElement).getByRole("button", { name: "Active" });
    await expect(tag).toHaveClass(
      "border-klerosUIComponentsPrimaryBlue",
      "border",
    );
    await expect(within(tag).getByText("Active")).not.toHaveClass(
      "hover:text-klerosUIComponentsSecondaryBlue",
    );
  },
};

export const DisabledTag: Story = {
  args: {
    themeUI: "light",
    backgroundUI: "light",
    text: "Disabled",
    isDisabled: true,
  },
  play: async ({ canvasElement, args }) => {
    const tag = within(canvasElement).getByRole("button", { name: "Disabled" });
    await expect(tag).toBeDisabled();
    await userEvent.click(tag);
    await expect(args.onPress).not.toHaveBeenCalled();
  },
};
