import type { Meta, StoryObj } from "@storybook/react";

import { IPreviewArgs } from "./utils";

import SliderComponent from "../lib/form/slider";

const meta = {
  component: SliderComponent,
  title: "Form/Slider",
  tags: ["autodocs"],
  argTypes: {
    isDisabled: {
      control: "boolean",
    },
  },
} satisfies Meta<typeof SliderComponent>;

export default meta;

type Story = StoryObj<typeof meta> & IPreviewArgs;

export const Slider: Story = {
  args: {
    themeUI: "dark",
    backgroundUI: "light",
    isDisabled: false,
    minValue: 0,
    maxValue: 100,
    defaultValue: 50,
    leftLabel: "0",
    rightLabel: "100",
    callback: () => {},
  },
};

/** We can pass a formatter function to format the value thats displayed on the Slider thumb. */
export const FormattedValueSlider: Story = {
  args: {
    ...Slider.args,
    formatter: (val) => `${val} days`,
  },
};
