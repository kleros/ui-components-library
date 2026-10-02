import type { Meta, StoryObj } from "@storybook/react";
import { expect, within } from "@storybook/test";

import { IPreviewArgs } from "./utils";

import CircularComponent from "../lib/progress/circular";

const meta = {
  component: CircularComponent,
  title: "Progress/Circular",
  tags: ["autodocs"],
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
    animated: {
      control: "boolean",
    },
    small: {
      control: "boolean",
    },
  },
} satisfies Meta<typeof CircularComponent>;

export default meta;

type Story = StoryObj<typeof meta> & IPreviewArgs;

/** The filled arc is the second <path> of the svg. */
const getFill = (progressbar: HTMLElement) =>
  progressbar.querySelectorAll("path")[1];

export const Default: Story = {
  args: {
    themeUI: "dark",
    backgroundUI: "light",
    value: 50,
  },
  play: async ({ canvasElement }) => {
    const progressbar = within(canvasElement).getByRole("progressbar");
    await expect(progressbar).toHaveAttribute("aria-valuenow", "50");
    await expect(progressbar).toHaveAttribute("aria-valuemin", "0");
    await expect(progressbar).toHaveAttribute("aria-valuemax", "100");
    await expect(progressbar).toHaveTextContent("50%");
    await expect(progressbar.querySelector("svg")).toHaveAttribute(
      "width",
      "126",
    );
    const fill = getFill(progressbar);
    await expect(fill).toHaveClass(
      "stroke-klerosUIComponentsPrimaryBlue",
      "animate-progress-fill",
    );
  },
};

export const Completed: Story = {
  args: {
    themeUI: "dark",
    backgroundUI: "light",
    value: 100,
  },
  play: async ({ canvasElement }) => {
    const progressbar = within(canvasElement).getByRole("progressbar");
    await expect(progressbar).toHaveAttribute("aria-valuenow", "100");
    await expect(progressbar).toHaveTextContent("100%");
    // a completed progress turns green
    await expect(getFill(progressbar)).toHaveClass(
      "stroke-klerosUIComponentsSuccess",
    );
  },
};

export const Small: Story = {
  args: {
    themeUI: "dark",
    backgroundUI: "light",
    value: 70,
    small: true,
  },
  play: async ({ canvasElement }) => {
    const progressbar = within(canvasElement).getByRole("progressbar");
    await expect(progressbar).toHaveTextContent("70%");
    await expect(progressbar.querySelector("svg")).toHaveAttribute(
      "width",
      "84",
    );
    await expect(progressbar.querySelector("text")).toHaveAttribute(
      "font-size",
      "16",
    );
  },
};

/** `animate` flag can be used to not show the fill animation. */
export const NonAnimated: Story = {
  args: {
    themeUI: "dark",
    backgroundUI: "light",
    value: 70,
    animated: false,
  },
  play: async ({ canvasElement }) => {
    const progressbar = within(canvasElement).getByRole("progressbar");
    await expect(getFill(progressbar)).not.toHaveClass("animate-progress-fill");
  },
};

/** With a custom `maxValue`, the displayed percentage is relative to the range. */
export const CustomRange: Story = {
  args: {
    themeUI: "dark",
    backgroundUI: "light",
    value: 50,
    maxValue: 200,
  },
  play: async ({ canvasElement }) => {
    const progressbar = within(canvasElement).getByRole("progressbar");
    await expect(progressbar).toHaveAttribute("aria-valuenow", "50");
    await expect(progressbar).toHaveAttribute("aria-valuemax", "200");
    await expect(progressbar).toHaveTextContent("25%");
  },
};

/** No progress: the fill arc is not rendered. */
export const Empty: Story = {
  args: {
    themeUI: "dark",
    backgroundUI: "light",
    value: 0,
  },
  play: async ({ canvasElement }) => {
    const progressbar = within(canvasElement).getByRole("progressbar");
    await expect(progressbar).toHaveTextContent("0%");
    await expect(progressbar.querySelectorAll("path")).toHaveLength(1);
  },
};
