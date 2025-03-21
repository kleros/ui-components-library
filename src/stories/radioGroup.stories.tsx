import React from "react";
import type { Meta, StoryObj } from "@storybook/react";

import { IPreviewArgs } from "./utils";

import RadioGroup from "../lib/form/radio-group";
import { Form } from "react-aria-components";
import Button from "../lib/button";

const meta = {
  component: RadioGroup,
  title: "Input/RadioGroup",
  tags: ["autodocs"],
  argTypes: {
    small: {
      control: "boolean",
    },
    isDisabled: {
      control: "boolean",
    },
    isRequired: {
      control: "boolean",
    },
    isInvalid: {
      control: "boolean",
    },
    orientation: {
      options: ["vertical", "horizontal"],
      control: "radio",
    },
  },
} satisfies Meta<typeof RadioGroup>;

export default meta;

type Story = StoryObj<typeof meta> & IPreviewArgs;

export const Vertical: Story = {
  args: {
    themeUI: "dark",
    backgroundUI: "light",
    groupLabel: "Variants",
    options: [
      { value: "primary", label: "Primary" },
      { value: "secondary", label: "Secondary" },
    ],
    small: true,
  },
};

export const Horizontal: Story = {
  args: {
    themeUI: "dark",
    backgroundUI: "light",
    groupLabel: "Variants:",
    options: [
      { value: "primary", label: "Primary" },
      { value: "secondary", label: "Secondary" },
    ],
    orientation: "horizontal",
    small: true,
  },
};

export const DisabledOptions: Story = {
  args: {
    themeUI: "dark",
    backgroundUI: "light",
    groupLabel: "Variants:",
    options: [
      { value: "primary", label: "Primary", isDisabled: true },
      { value: "secondary", label: "Secondary" },
    ],
    small: true,
  },
};

export const RequiredOptions: Story = {
  args: {
    themeUI: "dark",
    backgroundUI: "light",
    groupLabel: "Variants:",
    options: [
      { value: "primary", label: "Primary" },
      { value: "secondary", label: "Secondary" },
    ],
    small: true,
    isRequired: true,
    isReadOnly: true,
  },
  render: (args) => (
    <Form
      onSubmit={(e) => {
        e.preventDefault();
      }}
    >
      <RadioGroup {...args} />
      <Button
        variant="primary"
        type="submit"
        aria-pressed="true"
        text="Click me!"
        small
        className="mt-4"
      />
    </Form>
  ),
};
