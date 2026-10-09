import type { Meta, StoryObj } from "@storybook/react";
import { expect, fn, userEvent, within } from "@storybook/test";

import { IPreviewArgs } from "./utils";

import Pagination from "../lib/pagination/standard";
import React, { useState } from "react";
import { a11yExceptions } from "./a11y";
import { ICON_ONLY_PAGE_ARROWS } from "./a11y-defects";

const meta = {
  component: Pagination,
  title: "Pagination/Standard Pagination",
  tags: ["autodocs"],
  parameters: a11yExceptions(ICON_ONLY_PAGE_ARROWS),
  argTypes: {
    numPages: {
      control: "number",
    },
    currentPage: {
      control: "number",
    },
    className: {
      control: "text",
    },
    disableNumbers: {
      control: "boolean",
    },
    hideNumbers: {
      control: "boolean",
    },
  },
} satisfies Meta<typeof Pagination>;

export default meta;

type Story = StoryObj<typeof meta> & IPreviewArgs;

/** Number buttons currently rendered, in order. */
const pageNumbers = (canvasElement: HTMLElement) =>
  within(canvasElement)
    .getAllByRole("button")
    .map((button) => button.textContent)
    .filter(Boolean);

const isCurrent = (button: HTMLElement) =>
  button.classList.contains("border-klerosUIComponentsPrimaryBlue");

export const StandardPagination: Story = {
  args: {
    themeUI: "light",
    backgroundUI: "light",
    numPages: 6,
    currentPage: 0,
    callback: fn(),
    className: "w-full",
    disableNumbers: false,
    hideNumbers: false,
  },
  render: function Render(args) {
    const [currentPage, setCurrentPage] = useState(1);

    return (
      <Pagination
        {...args}
        currentPage={currentPage}
        callback={(page) => {
          setCurrentPage(page);
          args.callback(page);
        }}
      />
    );
  },
  play: async ({ canvasElement, args, step }) => {
    const canvas = within(canvasElement);
    const buttons = () => canvas.getAllByRole("button");
    const previous = () => buttons()[0];
    const next = () => buttons()[buttons().length - 1];

    await step("first page: window 1-5, previous disabled", async () => {
      await expect(pageNumbers(canvasElement)).toEqual([
        "1",
        "2",
        "3",
        "4",
        "5",
      ]);
      await expect(isCurrent(canvas.getByRole("button", { name: "1" }))).toBe(
        true,
      );
      await expect(previous()).toBeDisabled();
      await expect(next()).toBeEnabled();
    });

    await step("clicking a number goes to that page", async () => {
      await userEvent.click(canvas.getByRole("button", { name: "4" }));
      await expect(args.callback).toHaveBeenLastCalledWith(4);
      await expect(isCurrent(canvas.getByRole("button", { name: "4" }))).toBe(
        true,
      );
      await expect(isCurrent(canvas.getByRole("button", { name: "3" }))).toBe(
        false,
      );
      // the window of page numbers follows the current page
      await expect(pageNumbers(canvasElement)).toEqual([
        "2",
        "3",
        "4",
        "5",
        "6",
      ]);
    });

    await step("arrows move one page and stop at the last page", async () => {
      await userEvent.click(next());
      await expect(args.callback).toHaveBeenLastCalledWith(5);
      await userEvent.click(next());
      await expect(args.callback).toHaveBeenLastCalledWith(6);
      await expect(next()).toBeDisabled();
      await userEvent.click(previous());
      await expect(args.callback).toHaveBeenLastCalledWith(5);
    });

    await step("keyboard: Tab to a number and press Enter", async () => {
      canvas.getByRole("button", { name: "3" }).focus();
      await userEvent.keyboard("{Enter}");
      await expect(args.callback).toHaveBeenLastCalledWith(3);
      await userEvent.tab();
      await userEvent.keyboard(" ");
      await expect(args.callback).toHaveBeenLastCalledWith(4);
    });
  },
};

/** `disableNumbers` only allows navigating with the arrows. */
export const DisabledNumbers: Story = {
  ...StandardPagination,
  args: {
    ...StandardPagination.args,
    disableNumbers: true,
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const three = canvas.getByRole("button", { name: "3" });
    await expect(three).toBeDisabled();
    await userEvent.click(three);
    await expect(args.callback).not.toHaveBeenCalled();
    const buttons = canvas.getAllByRole("button");
    await userEvent.click(buttons[buttons.length - 1]);
    await expect(args.callback).toHaveBeenCalledWith(2);
  },
};

/** `hideNumbers` renders only the arrows. */
export const HiddenNumbers: Story = {
  ...StandardPagination,
  args: {
    ...StandardPagination.args,
    hideNumbers: true,
  },
  play: async ({ canvasElement, args }) => {
    const buttons = within(canvasElement).getAllByRole("button");
    await expect(buttons).toHaveLength(2);
    await expect(pageNumbers(canvasElement)).toEqual([]);
    await userEvent.click(buttons[1]);
    await expect(args.callback).toHaveBeenCalledWith(2);
  },
};
