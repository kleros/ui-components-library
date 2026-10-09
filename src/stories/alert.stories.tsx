import type { Meta, StoryObj } from "@storybook/react";
import { expect, within } from "@storybook/test";

import { IPreviewArgs } from "./utils";

import AlertComponent from "../lib/messages/alert";
import { a11yExceptions } from "./a11y";
import {
  PRIMARY_BLUE_TEXT_LIGHT,
  SUCCESS_TEXT_LIGHT,
  WARNING_TEXT_LIGHT,
  ERROR_TEXT_LIGHT,
} from "./a11y-defects";

const meta = {
  component: AlertComponent,
  title: "Message/Alert",
  tags: ["autodocs"],
  argTypes: {
    variant: {
      options: ["success", "error", "warning", "info"],
      control: "radio",
    },
  },
} satisfies Meta<typeof AlertComponent>;

export default meta;

type Story = StoryObj<typeof meta> & IPreviewArgs;

/** Asserts the title, message, icon and border all use the variant's color. */
const variantPlay =
  (colorToken: string): Story["play"] =>
  async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const heading = canvas.getByRole("heading", { level: 2, name: args.title });
    await expect(heading).toHaveClass(`text-${colorToken}`);
    await expect(canvas.getByText(args.msg)).toBeVisible();
    // only the icon matching the variant is rendered
    const icons = canvasElement.querySelectorAll("svg");
    await expect(icons).toHaveLength(1);
    await expect(icons[0]).toHaveClass(`fill-${colorToken}`);
    await expect(heading.closest(".border")).toHaveClass(
      `border-${colorToken}`,
    );
  };

export const Alert: Story = {
  parameters: a11yExceptions(WARNING_TEXT_LIGHT),
  args: {
    themeUI: "dark",
    backgroundUI: "light",
    className: "w-[500px]",
    variant: "warning",
    title: "This is a warning",
    msg: "Hiring an outside contractor?",
  },
  play: variantPlay("klerosUIComponentsWarning"),
};

export const SuccessAlert: Story = {
  parameters: a11yExceptions(SUCCESS_TEXT_LIGHT),
  args: {
    ...Alert.args,
    variant: "success",
    title: "Transaction confirmed",
    msg: "Your deposit was received.",
  },
  play: variantPlay("klerosUIComponentsSuccess"),
};

export const ErrorAlert: Story = {
  parameters: a11yExceptions(ERROR_TEXT_LIGHT),
  args: {
    ...Alert.args,
    variant: "error",
    title: "Something went wrong",
    msg: "Please try again later.",
  },
  play: variantPlay("klerosUIComponentsError"),
};

export const InfoAlert: Story = {
  parameters: a11yExceptions(PRIMARY_BLUE_TEXT_LIGHT),
  args: {
    ...Alert.args,
    variant: "info",
    title: "Did you know?",
    msg: "Jurors are drawn randomly.",
  },
  play: variantPlay("klerosUIComponentsPrimaryBlue"),
};
