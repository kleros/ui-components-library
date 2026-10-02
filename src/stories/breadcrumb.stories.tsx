import type { Meta, StoryObj } from "@storybook/react";
import { expect, fn, userEvent, within } from "@storybook/test";

import { IPreviewArgs } from "./utils";

import BreadcrumbComponent from "../lib/breadcrumb";

const meta = {
  component: BreadcrumbComponent,
  title: "Pagination/Breadcrumb",
  tags: ["autodocs"],
  args: {
    callback: fn(),
  },
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
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // every item except the last one is a button
    const buttons = canvas.getAllByRole("button");
    await expect(buttons.map((b) => b.textContent)).toEqual([
      "General Court",
      "Blockchain",
    ]);
    const current = canvas.getByText("Non-Technical");
    await expect(current.closest("button")).toBeNull();
    await expect(current).toHaveClass("font-semibold");
    await expect(canvas.getAllByText("/")).toHaveLength(2);
    // not clickable: text cursor
    await expect(buttons[0]).toHaveClass("cursor-text");
  },
};

/** With `clickable`, pressing an item calls `callback` with that item's `value`. */
export const ClickableBreadcrumb: Story = {
  args: {
    ...Breadcrumb.args,
    variant: "secondary",
    clickable: true,
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const blockchain = canvas.getByRole("button", { name: "Blockchain" });
    await expect(blockchain).toHaveClass("cursor-pointer");

    await userEvent.click(blockchain);
    await expect(args.callback).toHaveBeenCalledTimes(1);
    await expect(args.callback).toHaveBeenLastCalledWith(1);

    // keyboard: Tab to the first crumb and press Enter
    blockchain.blur();
    await userEvent.tab();
    await expect(
      canvas.getByRole("button", { name: "General Court" }),
    ).toHaveFocus();
    await userEvent.keyboard("{Enter}");
    await expect(args.callback).toHaveBeenLastCalledWith(0);
    await expect(args.callback).toHaveBeenCalledTimes(2);
  },
};
