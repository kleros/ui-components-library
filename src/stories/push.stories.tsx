import type { Meta, StoryObj } from "@storybook/react";
import { expect, fn, userEvent, within } from "@storybook/test";

import { IPreviewArgs } from "./utils";

import PushComponent from "../lib/messages/push";
import { a11yExceptions } from "./a11y";
import { WHITE_ON_BLUE_LIGHT } from "./a11y-defects";

const meta = {
  component: PushComponent,
  title: "Message/Push",
  parameters: a11yExceptions(WHITE_ON_BLUE_LIGHT),
  tags: ["autodocs"],
  args: {
    callback: fn(),
  },
  argTypes: {
    variant: {
      options: ["success", "sync", "error"],
      control: "radio",
    },
  },
} satisfies Meta<typeof PushComponent>;

export default meta;

type Story = StoryObj<typeof meta> & IPreviewArgs;

const ICON_ONLY_CLOSE_BUTTON = a11yExceptions({
  rule: "button-name",
  selector: "button.absolute",
  reason:
    "Library defect: the close button is icon-only and cannot be given an accessible name.",
  source: "src/lib/messages/push.tsx:62",
});

export const Push: Story = {
  parameters: ICON_ONLY_CLOSE_BUTTON,
  args: {
    themeUI: "dark",
    backgroundUI: "light",
    className: "w-[500px]",
    variant: "sync",
    title: "Transaction",
    msg: "Transaction pending",
    small: false,
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await expect(
      canvas.getByRole("heading", { level: 2, name: "Transaction" }),
    ).toBeVisible();
    await expect(canvas.getByText("Transaction pending")).toBeVisible();

    const close = canvas.getByRole("button");
    await userEvent.click(close);
    await expect(args.callback).toHaveBeenCalledTimes(1);
    // keyboard
    await userEvent.keyboard("{Enter}");
    await expect(close).toHaveFocus();
    await expect(args.callback).toHaveBeenCalledTimes(2);
  },
};

/** The small variant only shows the title: no message and no close button. */
export const SmallPush: Story = {
  args: {
    ...Push.args,
    variant: "success",
    title: "Saved",
    small: true,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("heading", { name: "Saved" })).toBeVisible();
    await expect(canvas.queryByText("Transaction pending")).toBeNull();
    await expect(canvas.queryByRole("button")).toBeNull();
  },
};

export const ErrorPush: Story = {
  parameters: ICON_ONLY_CLOSE_BUTTON,
  args: {
    ...Push.args,
    variant: "error",
    title: "Transaction failed",
    msg: "The transaction was reverted.",
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await expect(
      canvas.getByRole("heading", { name: "Transaction failed" }),
    ).toBeVisible();
    // variant icon + close icon
    await expect(canvasElement.querySelectorAll("svg")).toHaveLength(2);
    await userEvent.click(canvas.getByRole("button"));
    await expect(args.callback).toHaveBeenCalledTimes(1);
  },
};
