import React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { expect, within } from "@storybook/test";

import { IPreviewArgs, disableA11yRules } from "./utils";

import TimelineComponent from "../lib/progress/timeline/custom";
import Circle from "../assets/svgs/check-circle-outline.svg";

const meta = {
  component: TimelineComponent,
  title: "Progress/CustomTimeline",
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
        Icon: Circle,
      },
      {
        title: "Jury Decision - Round 1",
        party: "No",
        subtitle: "06 Jul 2023 12:00 UTC",
        variant: "#ca2314",
      },
    ],
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const items = getItems(canvasElement);
    await expect(items).toHaveLength(2);
    await expect(items[0]).toHaveAccessibleName("Timeline item: Pay 250 DAI");
    await expect(
      canvas.getByRole("heading", { name: "Timeline item title: Pay 250 DAI" }),
    ).toHaveTextContent("Pay 250 DAI");
    // hex variants color the party text
    const party = canvas.getByLabelText("Timeline item party: Yes");
    await expect(party).toHaveStyle({ color: "rgb(77, 0, 180)" });
    await expect(
      within(items[1]).getByLabelText("Timeline item party: No"),
    ).toHaveStyle({ color: "rgb(202, 35, 20)" });
    // custom timelines are always right sided
    for (const item of items) await expect(item).toHaveClass("justify-start");
    // a custom Icon replaces the default bullet
    await expect(items[0].querySelector("svg")).toBeInTheDocument();
    await expect(items[1].querySelector("svg")).toBeNull();
  },
};

/** Step states can be changed to reflect their current status. */
export const TimelineStates: Story = {
  args: {
    themeUI: "light",
    backgroundUI: "light",
    items: [
      {
        title: "Pay 250 DAI",
        party: "No",
        subtitle: "06 Jul 2023 12:00 UTC",
        variant: "#4D00B4",
        Icon: Circle,
      },
      {
        title: "Jury Decision - Round 1",
        party: "No",
        subtitle: "06 Jul 2023 12:00 UTC",
        variant: "#ca2314",
        state: "disabled",
      },
      {
        title: "Jury Decision - Round 2",
        party: "No",
        subtitle: "08 Jul 2023 12:00 UTC",
        variant: "#ca2314",
        state: "loading",
      },
    ],
  },
  play: async ({ canvasElement }) => {
    const [first, disabled, loading] = getItems(canvasElement);
    await expect(first).not.toHaveClass("opacity-50");
    await expect(first).not.toHaveClass("animate-loading");
    await expect(disabled).toHaveClass("opacity-50");
    await expect(loading).toHaveClass("animate-loading");
    for (const item of [first, disabled, loading])
      await expect(item).not.toHaveAttribute("aria-current");
  },
};

/** Custom Element can be provided for `party` for interactivity. */
export const TimelineCustomParty: Story = {
  args: {
    themeUI: "light",
    backgroundUI: "light",
    items: [
      {
        title: "Pay 250 DAI",
        party: (
          <div className="flex items-center gap-2">
            <span className="text-klerosUIComponentsPrimaryText leading-4">
              alice.eth -
            </span>
            <a
              className="text-klerosUIComponentsPrimaryBlue text-sm"
              href="https://docs.kleros.io/"
              target="_blank"
              rel="noreferrer"
            >
              Justification
            </a>
          </div>
        ),
        subtitle: "06 Jul 2023 12:00 UTC",
        variant: "#4D00B4",
        Icon: Circle,
      },
      {
        title: "Jury Decision - Round 1",
        party: "No",
        subtitle: "06 Jul 2023 12:00 UTC",
        variant: "#ca2314",
        state: "loading",
      },
    ],
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const party = canvas.getByLabelText("Timeline item party element");
    const link = within(party).getByRole("link", { name: "Justification" });
    await expect(link).toHaveAttribute("href", "https://docs.kleros.io/");
    await expect(link).toHaveAttribute("target", "_blank");
    await expect(party).toHaveTextContent("alice.eth -");
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
        party: (
          <div className="flex items-center gap-2">
            <span className="text-klerosUIComponentsPrimaryText leading-4">
              alice.eth -
            </span>
            <a
              className="text-klerosUIComponentsPrimaryBlue text-sm"
              href="https://docs.kleros.io/"
              target="_blank"
              rel="noreferrer"
            >
              Justification
            </a>
          </div>
        ),
        subtitle: "06 Jul 2023 12:00 UTC",
        variant: "#4D00B4",
        Icon: Circle,
      },
      {
        title: "Jury Decision - Round 1",
        party: "No",
        subtitle: "06 Jul 2023 12:00 UTC",
        variant: "#ca2314",
        state: "loading",
      },
    ],
    className: "w-[500px]",
  },
  play: async ({ canvasElement }) => {
    const list = within(canvasElement).getByRole("list", { name: "Timeline" });
    await expect(list).toHaveClass("w-[500px]");
    await expect(getItems(canvasElement)[1]).toHaveClass("animate-loading");
  },
};

/** An item can be marked as the current step. */
export const ActiveItem: Story = {
  args: {
    themeUI: "light",
    backgroundUI: "light",
    items: [
      {
        title: "Evidence period",
        party: "Done",
        subtitle: "06 Jul 2023 12:00 UTC",
        variant: "accepted",
      },
      {
        title: "Voting",
        party: "Ongoing",
        subtitle: "08 Jul 2023 12:00 UTC",
        variant: "refused",
        state: "active",
      },
    ],
  },
  play: async ({ canvasElement }) => {
    const [done, voting] = getItems(canvasElement);
    await expect(voting).toHaveAttribute("aria-current", "step");
    await expect(done).not.toHaveAttribute("aria-current");
    // named variants map to theme colors
    await expect(
      within(done).getByLabelText("Timeline item party: Done"),
    ).toHaveClass("text-klerosUIComponentsSuccess");
    await expect(
      within(voting).getByLabelText("Timeline item party: Ongoing"),
    ).toHaveClass("text-klerosUIComponentsError");
  },
};
