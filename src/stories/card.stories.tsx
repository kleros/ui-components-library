import React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { expect, fn, userEvent, within } from "@storybook/test";

import { IPreviewArgs } from "./utils";

import CardComponent from "../lib/container/card";

const meta = {
  component: CardComponent,
  title: "Containers/Card",
  tags: ["autodocs"],
  argTypes: {
    hover: {
      control: "boolean",
    },
    round: {
      control: "boolean",
    },
  },
} satisfies Meta<typeof CardComponent>;

export default meta;

type Story = StoryObj<typeof meta> & IPreviewArgs;

export const Card: Story = {
  args: {
    themeUI: "dark",
    backgroundUI: "light",
    hover: false,
    round: true,
    className: "w-[500px]",
    children: (
      <span className="text-klerosUIComponentsPrimaryText">Card content</span>
    ),
  },
  play: async ({ canvasElement }) => {
    const card = within(canvasElement).getByText("Card content")
      .parentElement as HTMLElement;
    await expect(card).toHaveClass("rounded-[18px]", "w-[500px]");
    await expect(card).not.toHaveClass("rounded-base");
    await expect(card).not.toHaveClass("hover:cursor-pointer");
  },
};

/** `hover` adds hover feedback and extra HTML props (e.g. handlers, ARIA) are forwarded. */
export const HoverableCard: Story = {
  args: {
    ...Card.args,
    hover: true,
    round: false,
    role: "region",
    "aria-label": "Hoverable card",
    onClick: fn(),
  },
  play: async ({ canvasElement, args }) => {
    const card = within(canvasElement).getByRole("region", {
      name: "Hoverable card",
    });
    await expect(card).toHaveClass("rounded-base", "hover:cursor-pointer");
    await expect(card).not.toHaveClass("rounded-[18px]");
    await userEvent.click(card);
    await expect(args.onClick).toHaveBeenCalledTimes(1);
  },
};
