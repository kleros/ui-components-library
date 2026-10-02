import type { Meta, StoryObj } from "@storybook/react";
import { expect, within } from "@storybook/test";

import { IPreviewArgs, disableA11yRules } from "./utils";

import StepComponent from "../lib/progress/steps";

const meta = {
  component: StepComponent,
  title: "Progress/Steps",
  tags: ["autodocs"],
  // Pre-existing design issue: inactive step titles/numbers use the
  // secondary text / stroke colors, below the WCAG AA contrast ratio.
  parameters: disableA11yRules("color-contrast"),
  argTypes: {
    horizontal: {
      control: "boolean",
    },
    currentItemIndex: {
      control: "number",
    },
  },
} satisfies Meta<typeof StepComponent>;

export default meta;

type Story = StoryObj<typeof meta> & IPreviewArgs;

/** Asserts completed / current / upcoming state of each step (index 1 is current). */
const expectStepStates = async (list: HTMLElement) => {
  const [done, current, upcoming] = within(list).getAllByRole("listitem");
  await expect(done).toHaveAccessibleName("Escrow Details");
  // completed steps show a check icon instead of their number
  await expect(done.querySelector("svg")).toBeInTheDocument();
  await expect(done).not.toHaveAttribute("aria-current");
  await expect(done).not.toHaveAttribute("aria-disabled");

  await expect(current).toHaveAccessibleName("Terms");
  await expect(current).toHaveAttribute("aria-current", "step");
  await expect(current).not.toHaveAttribute("aria-disabled");
  await expect(within(current).getByText("2")).toHaveClass(
    "text-klerosUIComponentsWhiteBackground",
  );

  await expect(upcoming).toHaveAccessibleName("Preview");
  await expect(upcoming).toHaveAttribute("aria-disabled", "true");
  await expect(upcoming).not.toHaveAttribute("aria-current");
  await expect(within(upcoming).getByText("3")).toHaveClass(
    "text-klerosUIComponentsStroke",
  );
};

export const Default: Story = {
  args: {
    themeUI: "light",
    backgroundUI: "light",
    items: [
      { title: "Escrow Details" },
      { title: "Terms" },
      { title: "Preview" },
    ],
    horizontal: true,
    currentItemIndex: 1,
    className: "h-auto w-[500px]",
  },
  play: async ({ canvasElement }) => {
    const list = within(canvasElement).getByRole("list", {
      name: "Horizontal progress steps",
    });
    await expectStepStates(list);
  },
};

/** Steps can be oriented vertically. */
export const VerticalOrientation: Story = {
  args: {
    ...Default.args,
    horizontal: false,
    className: "h-[300px] w-auto",
  },
  // Pre-existing component issue: the vertical variant wraps all but the last
  // <li> in a <div> inside the <ol> (invalid list structure).
  parameters: disableA11yRules("color-contrast", "list", "listitem"),
  play: async ({ canvasElement }) => {
    const list = within(canvasElement).getByRole("list", {
      name: "Vertical progress steps",
    });
    await expectStepStates(list);
  },
};

/** Sub items can be provided for each individual step. */
export const SubItems: Story = {
  args: {
    ...Default.args,
    items: [
      { title: "Escrow Details", subitems: ["Type of Escrow", "Title"] },
      { title: "Terms", subitems: ["Deliverable", "Payment", "Deadline"] },
      { title: "Preview" },
    ],
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const terms = canvas.getByRole("listitem", { name: "Terms" });
    const subitems = ["Deliverable", "Payment", "Deadline"];
    for (const [i, text] of subitems.entries()) {
      const subitem = within(terms).getByText(text);
      await expect(subitem).toHaveAttribute("aria-label", text);
      await expect(subitem).toHaveAttribute(
        "aria-description",
        `subitem ${i + 1}`,
      );
    }
    const preview = canvas.getByRole("listitem", { name: "Preview" });
    await expect(preview.querySelectorAll("small")).toHaveLength(0);
  },
};

/** All steps completed when `currentItemIndex` is past the last step. */
export const AllCompleted: Story = {
  args: {
    ...Default.args,
    currentItemIndex: 3,
  },
  play: async ({ canvasElement }) => {
    const items = within(canvasElement).getAllByRole("listitem");
    for (const item of items) {
      await expect(item).not.toHaveAttribute("aria-current");
      await expect(item).not.toHaveAttribute("aria-disabled");
      await expect(item.querySelector("svg")).toBeInTheDocument();
    }
  },
};
