import React from "react";
import { Meta, StoryObj } from "@storybook/react";
import BigNumberField from "../lib/form/bignumber-field";
import Telegram from "../assets/svgs/telegram.svg";
import BigNumber from "bignumber.js";
import { IPreviewArgs } from "./utils";
import { Button, Form } from "../lib";

const meta: Meta<typeof BigNumberField> = {
  title: "Form/BigNumberField",
  component: BigNumberField,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: "select",
      options: ["success", "warning", "error", "info"],
    },
    isDisabled: {
      control: "boolean",
    },
    isReadOnly: {
      control: "boolean",
    },
    isRequired: {
      control: "boolean",
    },
    isWheelDisabled: {
      control: "boolean",
    },
    minValue: {
      control: "text",
    },
    maxValue: {
      control: "text",
    },
    step: {
      control: "text",
    },
    placeholder: {
      control: "text",
    },
    message: {
      control: "text",
    },
    label: {
      control: "text",
    },
    formatOptions: {
      control: "object",
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta> & IPreviewArgs;

export const Default: Story = {
  args: {
    themeUI: "dark",
    backgroundUI: "light",
    placeholder: "Enter a number",
  },
};

export const WithLabel: Story = {
  args: {
    ...Default.args,
    label: "Amount",
  },
};

export const WithMinMax: Story = {
  args: {
    ...Default.args,
    label: "Amount",
    minValue: "0",
    maxValue: "1000",
  },
};

export const WithLargeNumbers: Story = {
  args: {
    ...Default.args,
    placeholder: "Enter a large number",
    label: "Large Amount",
    defaultValue: new BigNumber("123456789012345678901234567890"),
  },
};

export const WithFormatting: Story = {
  args: {
    ...Default.args,
    placeholder: "Enter a number with formatting",
    label: "Formatted Amount",
    defaultValue: new BigNumber("1234567.89"),
    formatOptions: {
      prefix: "$",
      decimalSeparator: ".",
      groupSeparator: ",",
      groupSize: 3,
      suffix: " USD",
    },
  },
};

export const WithCustomFormatting: Story = {
  args: {
    ...Default.args,
    placeholder: "Enter a number with custom formatting",
    label: "Custom Formatted Amount",
    defaultValue: new BigNumber("1234567.89"),
    formatOptions: {
      prefix: "€",
      decimalSeparator: ",",
      groupSeparator: " ",
      groupSize: 3,
      suffix: "",
    },
  },
};

export const WithStep: Story = {
  args: {
    ...Default.args,
    label: "Amount",
    minValue: "0",
    maxValue: "100",
    step: "5",
  },
};

export const WithIcon: Story = {
  args: {
    ...Default.args,
    Icon: Telegram,
  },
};

export const SuccessVariant: Story = {
  args: {
    ...Default.args,
    variant: "success",
    message: "Valid amount",
  },
};

export const WarningVariant: Story = {
  args: {
    ...Default.args,
    variant: "warning",
    message: "Amount is close to the limit",
  },
};

export const ErrorVariant: Story = {
  args: {
    ...Default.args,
    variant: "error",
    message: "Invalid amount",
  },
};

export const InfoVariant: Story = {
  args: {
    ...Default.args,
    variant: "info",
    message: "Enter the amount you want to transfer",
  },
};

export const Disabled: Story = {
  args: {
    ...Default.args,
    isDisabled: true,
  },
};

export const ReadOnly: Story = {
  args: {
    ...Default.args,
    isReadOnly: true,
    defaultValue: "42",
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
      <BigNumberField
        {...args}
        placeholder="Enter '0'"
        showFieldError
        validate={(value) => (value?.eq(0) ? "Zero not allowed" : null)}
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
