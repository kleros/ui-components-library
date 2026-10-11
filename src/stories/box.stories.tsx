import React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { expect } from "@storybook/test";

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
