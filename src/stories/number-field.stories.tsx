import React from "react";
import type { Meta, StoryObj } from "@storybook/react";

import { IPreviewArgs } from "./utils";

import NumberFieldComponent from "../lib/form/number-field";
import Telegram from "../assets/svgs/telegram.svg";
import { Form } from "react-aria-components";
import Button from "../lib/button";

const meta = {
  component: NumberFieldComponent,
  title: "Form/NumberField",
  tags: ["autodocs"],
  argTypes: {
    variant: {
      options: ["success", "warning", "error", "info"],
      control: "radio",
    },
    isRequired: {
      control: "boolean",
    },
    isDisabled: {
      control: "boolean",
    },
    message: {
      control: "text",
    },
    label: {
      control: "text",
    },
    placeholder: {
      control: "text",
    },
  },
} satisfies Meta<typeof NumberFieldComponent>;

export default meta;

type Story = StoryObj<typeof meta> & IPreviewArgs;

export const Default: Story = {
  args: {
    themeUI: "dark",
    backgroundUI: "light",
    className: "w-[500px]",
    placeholder: "Enter Number",
  },
};

export const Variant: Story = {
  args: {
    ...Default.args,
    variant: "success",
  },
};

export const CustomIcon: Story = {
  args: {
    ...Default.args,
    Icon: Telegram,
  },
};

export const Labelled: Story = {
  args: {
    ...Default.args,
    label: "Age",
  },
};

export const WithDescription: Story = {
  args: {
    ...Default.args,
    label: "Age",
    message: "Your current age.",
  },
};

/** Make a field required. Optionally you can choose to show the validation error and customize their style. */
export const Required: Story = {
  args: {
    ...Default.args,
    isRequired: true,
  },
  render: (args) => (
    <Form
      onSubmit={(e) => {
        e.preventDefault();
      }}
    >
      <NumberFieldComponent
        {...args}
        showFieldError
        validate={(value) => (value === 0 ? "Zero not allowed." : null)}
        fieldErrorProps={{
          children: ({ validationErrors }) => (
            <ul>
              {validationErrors.map((error) => (
                <li
                  key={error}
                  className="text-klerosUIComponentsError text-sm"
                >
                  {error}
                </li>
              ))}
            </ul>
          ),
        }}
      />
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
