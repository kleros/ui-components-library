import React from "react";
import type { Meta, StoryObj } from "@storybook/react";

import { IPreviewArgs } from "./utils";

import TimelineComponent from "../lib/progress/timeline/custom";
import Circle from "../assets/svgs/check-circle-outline.svg";

const meta = {
  component: TimelineComponent,
  title: "Progress/CustomTimeline",
  tags: ["autodocs"],
} satisfies Meta<typeof TimelineComponent>;

export default meta;

type Story = StoryObj<typeof meta> & IPreviewArgs;

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
};
