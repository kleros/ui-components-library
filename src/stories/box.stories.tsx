import React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { expect, within } from "@storybook/test";

import { IPreviewArgs } from "./utils";

import BoxComponent from "../lib/container/box";

const meta = {
  component: BoxComponent,
  title: "Containers/Box",
  tags: ["autodocs"],
} satisfies Meta<typeof BoxComponent>;

export default meta;

type Story = StoryObj<typeof meta> & IPreviewArgs;

export const Box: Story = {
  args: {
    themeUI: "dark",
    backgroundUI: "light",
    className: "w-[500px]",
    children: (
      <span className="text-klerosUIComponentsPrimaryText">Box content</span>
    ),
  },
  play: async ({ canvasElement }) => {
    const box = canvasElement.querySelector(
      ".bg-klerosUIComponentsMediumBlue",
    ) as HTMLElement;
    await expect(box).toHaveTextContent("Box content");
    await expect(box).toHaveClass("rounded-[18px]", "h-[200px]");
    // className overrides the default width (tailwind-merge)
    await expect(box).toHaveClass("w-[500px]");
    await expect(box).not.toHaveClass("w-[328px]");
    await expect(box.getBoundingClientRect().width).toBe(500);
  },
};

/** Props other than `className` and `children` reach the element. */
export const WithDomProps: Story = {
  args: {
    themeUI: "dark",
    backgroundUI: "light",
    id: "evidence-box",
    role: "region",
    "aria-label": "Evidence",
    children: (
      <span className="text-klerosUIComponentsPrimaryText">Box content</span>
    ),
  },
  play: async ({ canvasElement }) => {
    const box = within(canvasElement).getByRole("region", {
      name: "Evidence",
    });
    await expect(box).toHaveAttribute("id", "evidence-box");
    // the defaults still apply next to the spread props
    await expect(box).toHaveClass("bg-klerosUIComponentsMediumBlue");
    await expect(box).toHaveTextContent("Box content");
  },
};
