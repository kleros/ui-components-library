import type { Meta, StoryObj } from "@storybook/react";

import { IPreviewArgs } from "./utils";

import DatepickerComponent from "../lib/form/datepicker";
import { getLocalTimeZone, now } from "@internationalized/date";

const meta = {
  component: DatepickerComponent,
  title: "Form/Datepicker",
  tags: ["autodocs"],
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
    minValue: now(getLocalTimeZone()),
  },
};
