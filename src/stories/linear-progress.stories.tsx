import type { Meta, StoryObj } from "@storybook/react";
import { expect, within } from "@storybook/test";

import { IPreviewArgs } from "./utils";

import LinearComponent from "../lib/progress/linear";
import { a11yExceptions } from "./a11y";
import { ERROR_TEXT_LIGHT } from "./a11y-defects";

const meta = {
  component: LinearComponent,
  title: "Progress/Linear",
  tags: ["autodocs"],
  parameters: {
    // Chromatic pauses CSS animations at their first frame by default, which
    // for the `progressFill` entry animation is an empty bar. Capture the end
    // state instead.
    chromatic: { pauseAnimationAtEnd: true },
  },
  argTypes: {
    value: {
      control: "number",
    },
    minValue: {
      control: "number",
    },
    maxValue: {
      control: "number",
    },
    width: {
      control: "number",
    },
    animated: {
      control: "boolean",
    },
  },
} satisfies Meta<typeof LinearComponent>;

export default meta;

type Story = StoryObj<typeof meta> & IPreviewArgs;

/** The filled part of the bar is the second <path> of the svg. */
const getFill = (progressbar: HTMLElement) =>
  progressbar.querySelectorAll("path")[1];

export const Default: Story = {
  args: {
    themeUI: "dark",
    backgroundUI: "light",
    value: 50,
    width: 400,
    valueLabel: "Deposit required = xETH of 0.01ETH",
  },
  play: async ({ canvasElement }) => {
    const progressbar = within(canvasElement).getByRole("progressbar", {
      name: "Deposit required = xETH of 0.01ETH",
    });
    await expect(progressbar).toHaveAttribute("aria-valuenow", "50");
    await expect(progressbar).toHaveAttribute("aria-valuemin", "0");
    await expect(progressbar).toHaveAttribute("aria-valuemax", "100");
    await expect(progressbar).toHaveAttribute(
      "aria-valuetext",
      "Deposit required = xETH of 0.01ETH",
    );
    // half of the 400px track is filled
    const fill = getFill(progressbar);
    await expect(fill.getAttribute("stroke-dasharray")).toMatch(/^200,/);
    await expect(fill).toHaveClass("animate-progress-fill");
    await expect(progressbar.querySelector("svg")).toHaveAttribute(
      "width",
      "400",
    );
  },
};

/** `animate` flag can be used to not show the fill animation. */
export const NonAnimated: Story = {
  args: {
    themeUI: "dark",
    backgroundUI: "light",
    value: 70,
    width: 400,
    valueLabel: "Deposit required = xETH of 0.01ETH",
    animated: false,
  },
  play: async ({ canvasElement }) => {
    const progressbar = within(canvasElement).getByRole("progressbar");
    await expect(progressbar).toHaveAttribute("aria-valuenow", "70");
    const fill = getFill(progressbar);
    await expect(fill.getAttribute("stroke-dasharray")).toMatch(/^280,/);
    await expect(fill).not.toHaveClass("animate-progress-fill");
  },
};

/** Optional timer text can be provided, in case of time related progress */
export const WithTimerLabel: Story = {
  parameters: a11yExceptions(ERROR_TEXT_LIGHT),
  args: {
    themeUI: "dark",
    backgroundUI: "light",
    value: 50,
    width: 400,
    valueLabel: "Deposit required = xETH of 0.01ETH",
    timerText: "00d 03h 00m",
  },
  play: async ({ canvasElement }) => {
    const progressbar = within(canvasElement).getByRole("progressbar");
    const timer = within(progressbar).getByText("00d 03h 00m");
    await expect(timer.querySelector("svg")).toHaveClass(
      "fill-klerosUIComponentsError",
    );
  },
};

/** Without `valueLabel` the label is visually hidden but still names the bar. */
export const WithoutValueLabel: Story = {
  args: {
    themeUI: "dark",
    backgroundUI: "light",
    value: 25,
    width: 200,
  },
  play: async ({ canvasElement }) => {
    const progressbar = within(canvasElement).getByRole("progressbar", {
      name: "Progress 25",
    });
    await expect(within(progressbar).getByText("Progress 25")).toHaveClass(
      "hidden",
    );
    await expect(getFill(progressbar).getAttribute("stroke-dasharray")).toMatch(
      /^50,/,
    );
  },
};
