import type { Meta, StoryObj } from "@storybook/react";
import { expect, within } from "@storybook/test";

import { IPreviewArgs, disableA11yRules } from "./utils";

import TimelineComponent from "../lib/progress/timeline";

const meta = {
  component: TimelineComponent,
  title: "Progress/Timeline",
  tags: ["autodocs"],
  // Pre-existing design issue: the party text is colored with the item's
  // arbitrary `variant` color (e.g. #ca2314 on the light background), which
  // does not meet the WCAG AA contrast ratio.
  parameters: disableA11yRules("color-contrast"),
} satisfies Meta<typeof TimelineComponent>;

export default meta;

type Story = StoryObj<typeof meta> & IPreviewArgs;

const getItems = (canvasElement: HTMLElement) => {
  const list = within(canvasElement).getByRole("list", { name: "Timeline" });
  return within(list).getAllByRole("listitem");
};

export const Timeline: Story = {
  args: {
    themeUI: "light",
    backgroundUI: "light",
    items: [
      {
        title: "Pay 250 DAI",
        party: "Yes",
        subtitle: "06 Jul 2023 12:00 UTC",
        variant: "#4D00B4",
        rightSided: true,
      },
      {
        title: "Jury Decision - Round 1",
        party: "No",
        subtitle: "06 Jul 2023 12:00 UTC",
        variant: "#ca2314",
        rightSided: true,
      },
    ],
    className: "w-[500px]",
  },
  play: async ({ canvasElement }) => {
    const items = getItems(canvasElement);
    await expect(items).toHaveLength(2);
    await expect(items[1]).toHaveAccessibleName(
      "Timeline item: Jury Decision - Round 1",
    );
    await expect(
      within(items[0]).getByLabelText(
        "Timeline item date: 06 Jul 2023 12:00 UTC",
      ),
    ).toBeVisible();
    await expect(
      within(items[0]).getByLabelText("Timeline item party: Yes"),
    ).toHaveStyle({ color: "rgb(77, 0, 180)" });
    for (const item of items) {
      await expect(item).toHaveClass("justify-start");
      await expect(item).toHaveClass("translate-x-[calc(50%_-_8px)]");
    }
  },
};

/** Alignment can be changed for individual steps.
 * All steps are right aligned by default.
 */
export const TimelineAlignment: Story = {
  args: {
    themeUI: "light",
    backgroundUI: "light",
    items: [
      {
        title: "Pay 250 DAI",
        party: "Yes",
        subtitle: "06 Jul 2023 12:00 UTC",
        variant: "#4D00B4",
        rightSided: true,
      },
      {
        title: "Jury Decision - Round 1",
        party: "No",
        subtitle: "06 Jul 2023 12:00 UTC",
        variant: "#ca2314",
        rightSided: false,
      },
    ],
    className: "w-[500px]",
  },
  play: async ({ canvasElement }) => {
    const [right, left] = getItems(canvasElement);
    await expect(right).toHaveClass(
      "justify-start",
      "translate-x-[calc(50%_-_8px)]",
    );
    await expect(left).toHaveClass(
      "justify-end",
      "translate-x-[calc(-50%_+_8px)]",
    );
    // left sided items render the text before the spine
    await expect(left.lastElementChild).toHaveClass("-order-1", "text-right");
  },
};
