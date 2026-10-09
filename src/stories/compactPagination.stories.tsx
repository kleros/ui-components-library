import type { Meta, StoryObj } from "@storybook/react";
import { expect, fn, userEvent, within } from "@storybook/test";

import { IPreviewArgs } from "./utils";

import Pagination from "../lib/pagination/compact";
import React, { useState } from "react";
import { a11yExceptions } from "./a11y";
import { ICON_ONLY_PAGE_ARROWS } from "./a11y-defects";

const meta = {
  component: Pagination,
  title: "Pagination/Compact Pagination",
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
  },
} satisfies Meta<typeof Pagination>;

export default meta;

type Story = StoryObj<typeof meta> & IPreviewArgs;

export const CompactPagination: Story = {
  args: {
    themeUI: "light",
    backgroundUI: "light",
    numPages: 6,
    currentPage: 0,
    callback: fn(),
    className: "w-full",
    label: "Label:",
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
    await expect(canvas.getByText("Label:")).toBeVisible();
    const [previous, next] = canvas.getAllByRole("button");

    // NOTE: the arrow buttons are only *styled* as disabled at the limits (the
    // component does not forward `isDisabled`), so presses are clamped by
    // `usePagination` instead of being blocked.
    await step("on the first page 'previous' is styled disabled", async () => {
      await expect(previous).toHaveClass(
        "[&>svg]:fill-klerosUIComponentsStroke",
      );
      await expect(next).toHaveClass(
        "[&>svg]:fill-klerosUIComponentsPrimaryBlue",
      );
      await userEvent.click(previous);
      await expect(args.callback).toHaveBeenLastCalledWith(1);
    });

    await step("'next' advances one page at a time", async () => {
      await userEvent.click(next);
      await expect(args.callback).toHaveBeenLastCalledWith(2);
      await expect(previous).toHaveClass(
        "[&>svg]:fill-klerosUIComponentsPrimaryBlue",
      );
      for (let i = 0; i < 4; i++) await userEvent.click(next);
      await expect(args.callback).toHaveBeenLastCalledWith(6);
      await expect(args.callback).toHaveBeenCalledTimes(6);
    });

    await step("on the last page 'next' cannot go further", async () => {
      await expect(next).toHaveClass("[&>svg]:fill-klerosUIComponentsStroke");
      await userEvent.click(next);
      await expect(args.callback).toHaveBeenLastCalledWith(6);
    });

    await step("'previous' works with the keyboard", async () => {
      previous.focus();
      await userEvent.keyboard("{Enter}");
      await expect(args.callback).toHaveBeenLastCalledWith(5);
      await expect(next).toHaveClass(
        "[&>svg]:fill-klerosUIComponentsPrimaryBlue",
      );
    });
  },
};

export const CompactPaginationWithCloseCallback: Story = {
  args: {
    themeUI: "light",
    backgroundUI: "light",
    numPages: 6,
    currentPage: 0,
    callback: fn(),
    onCloseOnLastPage: fn(),
    className: "w-full",
    label: "Shows close button in end.",
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
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const next = canvas.getAllByRole("button")[1];
    for (let i = 0; i < 5; i++) await userEvent.click(next);
    await expect(args.callback).toHaveBeenLastCalledWith(6);
    await expect(args.onCloseOnLastPage).not.toHaveBeenCalled();

    // on the last page the "next" arrow is replaced by a close button
    const close = canvas.getAllByRole("button")[1];
    await expect(close.querySelector("svg")).toHaveClass(
      "fill-klerosUIComponentsPrimaryBlue",
    );
    await expect(close.querySelector("svg")).not.toHaveClass("rotate-180");
    await userEvent.click(close);
    await expect(args.onCloseOnLastPage).toHaveBeenCalledTimes(1);
    await expect(args.callback).toHaveBeenCalledTimes(5);
  },
};
