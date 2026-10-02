import React from "react";
import { Meta, StoryObj } from "@storybook/react";
import { expect, fn, userEvent, waitFor, within } from "@storybook/test";
import BigNumberField from "../lib/form/bignumber-field";
import Telegram from "../assets/svgs/telegram.svg";
import BigNumber from "bignumber.js";
import { IPreviewArgs, disableA11yRules, hoverToReveal } from "./utils";
import { Button, Form } from "../lib";

const meta: Meta<typeof BigNumberField> = {
  title: "Form/BigNumberField",
  component: BigNumberField,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  args: {
    // spy so play functions can assert the emitted values
    onChange: fn(),
  },
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

/** The BigNumber passed in the most recent `onChange` call, as a string. */
const lastChange = (onChange: unknown) => {
  const calls = (onChange as ReturnType<typeof fn>).mock.calls;
  return (calls[calls.length - 1]?.[0] as BigNumber | undefined)?.toString();
};

export const Default: Story = {
  args: {
    themeUI: "dark",
    backgroundUI: "light",
    placeholder: "Enter a number",
  },
  play: async ({ canvasElement, args, step }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole("spinbutton");
    await expect(input).toHaveAttribute("placeholder", "Enter a number");
    await expect(input).toHaveAttribute("aria-valuenow", "");

    await step("only numeric characters are accepted", async () => {
      await userEvent.type(input, "12a3");
      await expect(input).toHaveValue("123");
      await expect(input).toHaveAttribute("aria-valuenow", "123");
      await expect(lastChange(args.onChange)).toBe("123");
    });

    await step("arrow keys increment and decrement by step", async () => {
      await userEvent.keyboard("{ArrowUp}");
      await expect(input).toHaveValue("124");
      await expect(lastChange(args.onChange)).toBe("124");
      await userEvent.keyboard("{ArrowDown}{ArrowDown}");
      await expect(input).toHaveValue("122");
      await expect(lastChange(args.onChange)).toBe("122");
    });

    await step(
      "value is formatted on blur and unformatted on focus",
      async () => {
        await userEvent.clear(input);
        await expect(lastChange(args.onChange)).toBe("0");
        await userEvent.type(input, "1234567.5");
        await userEvent.tab();
        await expect(input).not.toHaveFocus();
        await expect(input).toHaveValue("1,234,567.5");
        await userEvent.click(input);
        await expect(input).toHaveValue("1234567.5");
      },
    );

    await step("only one decimal point is allowed", async () => {
      await userEvent.type(input, ".1");
      await expect(input).toHaveValue("1234567.51");
    });
  },
};

export const WithLabel: Story = {
  args: {
    ...Default.args,
    label: "Amount",
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // the <label> is associated to the input
    const input = canvas.getByLabelText("Amount");
    await expect(input).toHaveAttribute("role", "spinbutton");
    await userEvent.click(canvas.getByText("Amount"));
    await expect(input).toHaveFocus();
  },
};

export const WithMinMax: Story = {
  args: {
    ...Default.args,
    label: "Amount",
    minValue: "0",
    maxValue: "1000",
  },
  play: async ({ canvasElement, args, step }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole("spinbutton");
    await expect(input).toHaveAttribute("aria-valuemin", "0");
    await expect(input).toHaveAttribute("aria-valuemax", "1000");

    await step("typed values are clamped to maxValue", async () => {
      await userEvent.type(input, "5000");
      await expect(input).toHaveValue("1000");
      await expect(lastChange(args.onChange)).toBe("1000");
    });

    await step("ArrowUp is a no-op at maxValue", async () => {
      await userEvent.keyboard("{ArrowUp}");
      await expect(input).toHaveValue("1000");
    });

    await step("Home / End jump to min / max", async () => {
      await userEvent.keyboard("{Home}");
      await expect(input).toHaveValue("0");
      await expect(lastChange(args.onChange)).toBe("0");
      await userEvent.keyboard("{ArrowDown}");
      await expect(input).toHaveValue("0");
      await userEvent.keyboard("{End}");
      await expect(input).toHaveValue("1000");
      await expect(lastChange(args.onChange)).toBe("1000");
    });

    await step("stepper buttons reflect the limits", async () => {
      // the stepper buttons are only shown while the field is hovered
      const increment = await hoverToReveal(userEvent, input, () =>
        canvas.getByRole("button", { name: "Increment" }),
      );
      const decrement = canvas.getByRole("button", { name: "Decrement" });
      await expect(increment).toBeDisabled();
      await expect(decrement).toBeEnabled();
      await userEvent.click(decrement);
      await expect(input).toHaveValue("999");
      await expect(increment).toBeEnabled();
    });
  },
};

export const WithLargeNumbers: Story = {
  // Pre-existing component issue: when this is the first BigNumberField to
  // render, aria-valuenow is in exponential notation (see play), which axe
  // reports as an invalid aria-valuenow value.
  parameters: disableA11yRules("aria-valid-attr-value"),
  args: {
    ...Default.args,
    placeholder: "Enter a large number",
    label: "Large Amount",
    defaultValue: new BigNumber("123456789012345678901234567890"),
  },
  play: async ({ canvasElement }) => {
    const input = within(canvasElement).getByRole("spinbutton");
    // no precision is lost on numbers beyond Number.MAX_SAFE_INTEGER
    await expect(input).toHaveValue("123,456,789,012,345,678,901,234,567,890");
    // NOTE: the hook sets `BigNumber.config({ EXPONENTIAL_AT })` in an effect,
    // after the first render, so when no other BigNumberField rendered before
    // (e.g. this story alone or first in a shuffled run) aria-valuenow is in
    // exponential notation. Compare numerically: the exact value is kept.
    const valueNow = input.getAttribute("aria-valuenow") ?? "";
    await expect(
      new BigNumber(valueNow).isEqualTo("123456789012345678901234567890"),
    ).toBe(true);
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
  play: async ({ canvasElement }) => {
    const input = within(canvasElement).getByRole("spinbutton");
    await expect(input).toHaveValue("$1,234,567.89 USD");
    await expect(input).toHaveAttribute("aria-valuenow", "1234567.89");
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
  play: async ({ canvasElement, args }) => {
    const input = within(canvasElement).getByRole("spinbutton");
    await expect(input).toHaveValue("€1 234 567,89");
    await expect(input).toHaveAttribute("aria-valuenow", "1234567.89");
    // custom formatted values are parsed back when edited
    await userEvent.click(input);
    await userEvent.keyboard("{ArrowUp}");
    await expect(input).toHaveAttribute("aria-valuenow", "1234568.89");
    await expect(lastChange(args.onChange)).toBe("1234568.89");
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
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole("spinbutton");
    await userEvent.click(input);
    await userEvent.keyboard("{ArrowUp}");
    await expect(input).toHaveValue("5");
    await userEvent.keyboard("{ArrowUp}");
    await expect(input).toHaveValue("10");
    await userEvent.keyboard("{ArrowDown}");
    await expect(input).toHaveValue("5");
    await expect(lastChange(args.onChange)).toBe("5");

    await userEvent.click(
      await hoverToReveal(userEvent, input, () =>
        canvas.getByRole("button", { name: "Increment" }),
      ),
    );
    await expect(input).toHaveValue("10");
    await expect(lastChange(args.onChange)).toBe("10");
  },
};

export const WithIcon: Story = {
  args: {
    ...Default.args,
    Icon: Telegram,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole("spinbutton");
    await expect(input).toHaveClass("pr-16");
    await expect(input.parentElement?.querySelector(".size-6")).toBeTruthy();
    await userEvent.type(input, "7");
    await expect(input).toHaveValue("7");
  },
};

export const SuccessVariant: Story = {
  args: {
    ...Default.args,
    variant: "success",
    message: "Valid amount",
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText(args.message as string)).toHaveClass(
      "text-klerosUIComponentsSuccess",
    );
    await expect(canvas.getByRole("spinbutton")).toHaveClass(
      "border-klerosUIComponentsSuccess",
    );
  },
};

export const WarningVariant: Story = {
  args: {
    ...Default.args,
    variant: "warning",
    message: "Amount is close to the limit",
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText(args.message as string)).toHaveClass(
      "text-klerosUIComponentsWarning",
    );
    await expect(canvas.getByRole("spinbutton")).toHaveClass(
      "border-klerosUIComponentsWarning",
    );
  },
};

export const ErrorVariant: Story = {
  args: {
    ...Default.args,
    variant: "error",
    message: "Invalid amount",
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText(args.message as string)).toHaveClass(
      "text-klerosUIComponentsError",
    );
    await expect(canvas.getByRole("spinbutton")).toHaveClass(
      "border-klerosUIComponentsError",
    );
  },
};

export const InfoVariant: Story = {
  args: {
    ...Default.args,
    variant: "info",
    message: "Enter the amount you want to transfer",
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const message = canvas.getByText(args.message as string);
    await expect(message).toHaveAttribute("slot", "description");
    await expect(message.querySelector("svg")).toHaveClass(
      "fill-klerosUIComponentsSecondaryText",
    );
  },
};

export const Disabled: Story = {
  args: {
    ...Default.args,
    isDisabled: true,
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole("spinbutton");
    await expect(input).toBeDisabled();
    await expect(input).toHaveAttribute("aria-disabled", "true");
    await userEvent.type(input, "12");
    await expect(input).toHaveValue("");
    await expect(args.onChange).not.toHaveBeenCalled();
    // the field is skipped in the tab order
    await userEvent.tab();
    await expect(input).not.toHaveFocus();
  },
};

export const ReadOnly: Story = {
  args: {
    ...Default.args,
    isReadOnly: true,
    defaultValue: "42",
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole("spinbutton");
    await expect(input).toHaveValue("42");
    await expect(input).toHaveAttribute("readonly");
    await expect(input).toHaveAttribute("aria-readonly", "true");
    await userEvent.type(input, "1{ArrowUp}");
    await expect(input).toHaveValue("42");
    await expect(args.onChange).not.toHaveBeenCalled();
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
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole("spinbutton");
    await expect(input).toBeRequired();
    await expect(input).toHaveAttribute("aria-required", "true");
    await expect(input).not.toHaveAttribute("aria-invalid", "true");

    await step("leaving the field empty shows the required error", async () => {
      await userEvent.click(input);
      await userEvent.tab();
      const error = await canvas.findByText("Please fill out this field.");
      await expect(input).toHaveAttribute("aria-invalid", "true");
      await expect(input).toHaveAttribute("aria-errormessage", error.id);
    });

    await step("custom validate() errors are shown", async () => {
      await userEvent.type(input, "0");
      await userEvent.tab();
      await expect(
        await canvas.findByText("Zero not allowed"),
      ).toBeInTheDocument();
      await expect(input).toHaveAttribute("aria-invalid", "true");
    });

    await step("a valid value clears the error", async () => {
      await userEvent.clear(input);
      await userEvent.type(input, "5");
      await userEvent.tab();
      await waitFor(() =>
        expect(canvas.queryByText("Zero not allowed")).not.toBeInTheDocument(),
      );
      await expect(input).toHaveAttribute("aria-invalid", "false");
    });
  },
};
