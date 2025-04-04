import type { Meta, StoryObj } from "@storybook/react";

import { IPreviewArgs } from "./utils";

import TimelineComponent from "../lib/progress/timeline";

const meta = {
  component: TimelineComponent,
  title: "Progress/Timeline",
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
};
