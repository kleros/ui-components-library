import React, { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";

import { IPreviewArgs } from "./utils";

import CheckboxComponent from "../lib/form/checkbox";

const meta = {
  component: CheckboxComponent,
  title: "Input/Checkbox",
  tags: ["autodocs"],
} satisfies Meta<typeof CheckboxComponent>;

export default meta;

type Story = StoryObj<typeof meta> & IPreviewArgs;

export const Box: Story = {
  args: {
    themeUI: "dark",
    backgroundUI: "light",
    className: "w-[500px]",
    label: "Checkbox",
    small: false,
  },
  render: function Render(args) {
    const [checked, setChecked] = useState(false);

    return (
      <CheckboxComponent
        {...args}
        checked={checked}
        onChange={() => setChecked((current) => !current)}
      />
    );
  },
};
