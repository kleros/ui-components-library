import type { Meta, StoryObj } from "@storybook/react";

import { IPreviewArgs } from "./utils";

import DatepickerComponent from "../lib/form/datepicker";
import { parseZonedDateTime } from "@internationalized/date";

// The component defaults to "now", which would make every visual snapshot
// (Chromatic) differ from the previous one. Stories pin a fixed date instead.
const FIXED_DATE = parseZonedDateTime("2025-01-15T10:30[UTC]");

const meta = {
  component: DatepickerComponent,
  title: "Form/Datepicker",
  tags: ["autodocs"],
  args: {
    defaultValue: FIXED_DATE,
  },
  argTypes: {
    time: {
      control: "boolean",
    },
  },
} satisfies Meta<typeof DatepickerComponent>;

export default meta;

type Story = StoryObj<typeof meta> & IPreviewArgs;

export const Datepicker: Story = {
  args: {
    themeUI: "dark",
    backgroundUI: "light",
    className: "w-full",
  },
};

export const DatepickerWithTime: Story = {
  args: {
    themeUI: "dark",
    backgroundUI: "light",
    className: "w-full",
    time: true,
  },
};

/** We can provide a minimum Date */
export const DatepickerWithMinDate: Story = {
  args: {
    themeUI: "dark",
    backgroundUI: "light",
    className: "w-full",
    time: true,
    minValue: FIXED_DATE,
  },
};
