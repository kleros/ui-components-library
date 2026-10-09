import React from "react";
import { Meta, StoryObj } from "@storybook/react";
import {
  expect,
  fireEvent,
  fn,
  userEvent,
  waitFor,
  within,
} from "@storybook/test";
import BigNumberField from "../lib/form/bignumber-field";
import Telegram from "../assets/svgs/telegram.svg";
import BigNumber from "bignumber.js";
import {
  IPreviewArgs,
  expectHoverRevealsNothing,
  expectRevealedOnEachHover,
  hoverToReveal,
} from "./utils";
import { Button, Form } from "../lib";
import { a11yExceptions } from "./a11y";
import {
  SECONDARY_TEXT_LIGHT,
  SUCCESS_TEXT_LIGHT,
  WARNING_TEXT_LIGHT,
  ERROR_TEXT_LIGHT,
  WHITE_ON_BLUE_LIGHT,
} from "./a11y-defects";

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

const callCount = (onChange: unknown) =>
  (onChange as ReturnType<typeof fn>).mock.calls.length;

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
  parameters: a11yExceptions(SECONDARY_TEXT_LIGHT),
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
  parameters: a11yExceptions(SECONDARY_TEXT_LIGHT),
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
  parameters: a11yExceptions(SECONDARY_TEXT_LIGHT, {
    rule: "aria-valid-attr-value",
    selector: 'input[aria-valuenow*="e+"]',
    reason:
      "Library defect: on the first render aria-valuenow is in exponential notation.",
    source: "src/lib/form/bignumber-field/useBigNumberField.tsx:94",
  }),
  // EXPONENTIAL_AT is global and the hook raises it only after its first
  // render, so the story starts from the bignumber.js default [-7, 20].
  beforeEach: () => {
    const { EXPONENTIAL_AT } = BigNumber.config({});
    BigNumber.config({ EXPONENTIAL_AT: [-7, 20] });
    return () => {
      BigNumber.config({ EXPONENTIAL_AT });
    };
  },
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
    // aria-valuenow is exponential but exact, so compare numerically.
    const valueNow = input.getAttribute("aria-valuenow") ?? "";
    await expect(valueNow).toContain("e+");
    await expect(
      new BigNumber(valueNow).isEqualTo("123456789012345678901234567890"),
    ).toBe(true);
  },
};

export const WithFormatting: Story = {
  parameters: a11yExceptions(SECONDARY_TEXT_LIGHT),
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
  parameters: a11yExceptions(SECONDARY_TEXT_LIGHT),
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
  parameters: a11yExceptions(SECONDARY_TEXT_LIGHT),
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
    // leaving hides the steppers and every new hover reveals them again
    await expectRevealedOnEachHover(userEvent, input, () =>
      canvas.getByRole("button", { name: "Increment" }),
    );
    await userEvent.unhover(input);
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
  parameters: a11yExceptions(SUCCESS_TEXT_LIGHT),
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
  parameters: a11yExceptions(WARNING_TEXT_LIGHT),
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
  parameters: a11yExceptions(ERROR_TEXT_LIGHT),
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
  parameters: a11yExceptions(SECONDARY_TEXT_LIGHT),
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
    fireEvent.wheel(input, { deltaY: 100 });
    await expect(input).toHaveValue("");
    await expect(args.onChange).not.toHaveBeenCalled();
    // stepper buttons are not revealed on hover while disabled
    await expectHoverRevealsNothing(userEvent, input.parentElement!, () =>
      canvas.queryByRole("button", { name: "Increment" }),
    );
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
    fireEvent.wheel(input, { deltaY: 100 });
    fireEvent.wheel(input, { deltaY: -100 });
    await expect(input).toHaveValue("42");
    await expect(args.onChange).not.toHaveBeenCalled();
  },
};

/** Make a field required. Optionally you can choose to show the validation error and customize their style. */
export const Required: Story = {
  parameters: a11yExceptions(WHITE_ON_BLUE_LIGHT),
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

const ControlledHarness = (
  props: React.ComponentProps<typeof BigNumberField>,
) => {
  const [value, setValue] = React.useState<string | BigNumber>("10");
  return (
    <div>
      <BigNumberField
        {...props}
        value={value}
        onChange={(v) => {
          setValue(v);
          props.onChange?.(v);
        }}
      />
      <Button
        variant="primary"
        small
        text="Set string"
        onPress={() => setValue("1234.5")}
      />
      <Button
        variant="primary"
        small
        text="Set BigNumber"
        onPress={() => setValue(new BigNumber("-3.25"))}
      />
    </div>
  );
};

export const ControlledValue: Story = {
  parameters: a11yExceptions(SECONDARY_TEXT_LIGHT, WHITE_ON_BLUE_LIGHT),
  args: { ...Default.args, label: "Amount" },
  render: (args) => <ControlledHarness {...args} />,
  play: async ({ canvasElement, args, step }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole("spinbutton");
    await expect(input).toHaveAttribute("aria-valuenow", "10");

    await step("a parent string value replaces the display", async () => {
      await userEvent.click(canvas.getByRole("button", { name: "Set string" }));
      await waitFor(() => expect(input).toHaveValue("1234.5"));
      await expect(input).toHaveAttribute("aria-valuenow", "1234.5");
      await expect(input).toHaveAttribute("aria-valuetext", "1234.5");
    });

    await step("a parent BigNumber value replaces the display", async () => {
      await userEvent.click(
        canvas.getByRole("button", { name: "Set BigNumber" }),
      );
      await waitFor(() => expect(input).toHaveValue("-3.25"));
      await expect(input).toHaveAttribute("aria-valuenow", "-3.25");
    });

    await step("parent updates do not call onChange", async () => {
      await expect(args.onChange).not.toHaveBeenCalled();
    });

    await step("user edits call onChange and flow back", async () => {
      await userEvent.click(input);
      await userEvent.keyboard("{ArrowUp}");
      await expect(input).toHaveValue("-2.25");
      await expect(input).toHaveAttribute("aria-valuenow", "-2.25");
      await expect(lastChange(args.onChange)).toBe("-2.25");
      await expect(callCount(args.onChange)).toBe(1);
    });
  },
};

export const FractionalStep: Story = {
  parameters: a11yExceptions(SECONDARY_TEXT_LIGHT),
  args: {
    ...Default.args,
    label: "Amount",
    step: "0.1",
    defaultValue: "0.1",
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole("spinbutton");
    await userEvent.click(input);
    // exact decimal arithmetic: 0.1 + 0.1 + 0.1 is 0.3, not 0.30000000000000004
    await userEvent.keyboard("{ArrowUp}{ArrowUp}");
    await expect(input).toHaveValue("0.3");
    await expect(input).toHaveAttribute("aria-valuenow", "0.3");
    await expect(lastChange(args.onChange)).toBe("0.3");
    await userEvent.keyboard("{ArrowDown}{ArrowDown}{ArrowDown}{ArrowDown}");
    await expect(input).toHaveValue("-0.1");
    await expect(lastChange(args.onChange)).toBe("-0.1");
  },
};

export const NegativeStep: Story = {
  parameters: a11yExceptions(SECONDARY_TEXT_LIGHT),
  args: { ...Default.args, label: "Amount", step: "-0.5" },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole("spinbutton");
    await userEvent.click(input);
    // the sign of the step is ignored, so ArrowUp still increments
    await userEvent.keyboard("{ArrowUp}");
    await expect(input).toHaveValue("0.5");
    await userEvent.keyboard("{ArrowDown}{ArrowDown}{ArrowDown}");
    await expect(input).toHaveValue("-1");
    await expect(lastChange(args.onChange)).toBe("-1");
    await userEvent.keyboard("{ArrowUp}");
    await expect(input).toHaveValue("-0.5");
    await expect(lastChange(args.onChange)).toBe("-0.5");
  },
};

export const FractionalStepButtons: Story = {
  parameters: a11yExceptions(SECONDARY_TEXT_LIGHT),
  args: {
    ...Default.args,
    label: "Amount",
    step: "0.25",
    minValue: "0",
    maxValue: "0.5",
    defaultValue: "0.25",
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole("spinbutton");
    const increment = await hoverToReveal(userEvent, input, () =>
      canvas.getByRole("button", { name: "Increment" }),
    );
    const decrement = canvas.getByRole("button", { name: "Decrement" });
    await userEvent.click(increment);
    await expect(input).toHaveValue("0.5");
    await expect(increment).toBeDisabled();
    await userEvent.click(decrement);
    await userEvent.click(decrement);
    await expect(input).toHaveValue("0");
    await expect(decrement).toBeDisabled();
    await expect(lastChange(args.onChange)).toBe("0");
  },
};

export const WheelEnabled: Story = {
  parameters: a11yExceptions(SECONDARY_TEXT_LIGHT),
  args: { ...Default.args, label: "Amount", defaultValue: "5" },
  play: async ({ canvasElement, args, step }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole("spinbutton");
    await userEvent.click(input);

    await step("scrolling down increments and up decrements", async () => {
      // fireEvent returns false when the event was cancelled
      await expect(fireEvent.wheel(input, { deltaY: 100 })).toBe(false);
      await expect(input).toHaveValue("6");
      await expect(lastChange(args.onChange)).toBe("6");
      fireEvent.wheel(input, { deltaY: -100 });
      fireEvent.wheel(input, { deltaY: -100 });
      await expect(input).toHaveValue("4");
      await expect(lastChange(args.onChange)).toBe("4");
    });

    await step("a mostly vertical scroll with some X still steps", async () => {
      fireEvent.wheel(input, { deltaX: 10, deltaY: 100 });
      await expect(input).toHaveValue("5");
    });

    await step("horizontal-dominant or zero scroll is ignored", async () => {
      const calls = callCount(args.onChange);
      fireEvent.wheel(input, { deltaX: 100, deltaY: 50 });
      fireEvent.wheel(input, { deltaX: 50, deltaY: 50 });
      fireEvent.wheel(input, { deltaX: 0, deltaY: 0 });
      await expect(input).toHaveValue("5");
      await expect(callCount(args.onChange)).toBe(calls);
    });

    await step("an unfocused field ignores the wheel", async () => {
      await userEvent.tab();
      await expect(input).not.toHaveFocus();
      const calls = callCount(args.onChange);
      await expect(fireEvent.wheel(input, { deltaY: 100 })).toBe(true);
      await expect(input).toHaveValue("5");
      await expect(callCount(args.onChange)).toBe(calls);
    });
  },
};

export const WheelDisabled: Story = {
  parameters: a11yExceptions(SECONDARY_TEXT_LIGHT),
  args: {
    ...Default.args,
    label: "Amount",
    isWheelDisabled: true,
    defaultValue: "5",
  },
  play: async ({ canvasElement, args }) => {
    const input = within(canvasElement).getByRole("spinbutton");
    await userEvent.click(input);
    await expect(input).toHaveFocus();
    fireEvent.wheel(input, { deltaY: 100 });
    fireEvent.wheel(input, { deltaY: -100 });
    await expect(input).toHaveValue("5");
    await expect(args.onChange).not.toHaveBeenCalled();
    // the keyboard still steps
    await userEvent.keyboard("{ArrowUp}");
    await expect(input).toHaveValue("6");
  },
};

export const LowerBoundTyping: Story = {
  parameters: a11yExceptions(SECONDARY_TEXT_LIGHT),
  args: {
    ...Default.args,
    label: "Amount",
    minValue: "-10",
    maxValue: "10",
  },
  play: async ({ canvasElement, args }) => {
    const input = within(canvasElement).getByRole("spinbutton");
    await expect(input).toHaveAttribute("aria-valuemin", "-10");
    await userEvent.type(input, "-5");
    await expect(input).toHaveValue("-5");
    await expect(lastChange(args.onChange)).toBe("-5");
    // a second digit takes the value below the lower bound
    await userEvent.type(input, "0");
    await expect(input).toHaveValue("-10");
    await expect(input).toHaveAttribute("aria-valuenow", "-10");
    await expect(lastChange(args.onChange)).toBe("-10");
    await userEvent.keyboard("{ArrowDown}");
    await expect(input).toHaveValue("-10");
    await userEvent.keyboard("{ArrowUp}");
    await expect(input).toHaveValue("-9");
  },
};

/** An empty field steps from zero: ArrowDown gives -step, ArrowUp gives +step. */
export const SteppingFromEmpty: Story = {
  parameters: a11yExceptions(SECONDARY_TEXT_LIGHT),
  args: { ...Default.args, label: "Amount", step: "2" },
  play: async ({ canvasElement, args }) => {
    const input = within(canvasElement).getByRole("spinbutton");
    await userEvent.click(input);
    await expect(input).toHaveValue("");
    await userEvent.keyboard("{ArrowDown}");
    await expect(input).toHaveValue("-2");
    await expect(lastChange(args.onChange)).toBe("-2");
    await userEvent.clear(input);
    await userEvent.keyboard("{ArrowUp}");
    await expect(input).toHaveValue("2");
    await expect(lastChange(args.onChange)).toBe("2");
  },
};

/** Typing into the idle-formatted, still focused field clamps to the bounds. */
export const TypingAfterIdleFormatting: Story = {
  parameters: a11yExceptions(SECONDARY_TEXT_LIGHT),
  args: {
    ...Default.args,
    label: "Amount",
    minValue: "-10",
    maxValue: "10",
    formatOptions: { prefix: "$" },
  },
  play: async ({ canvasElement, args }) => {
    const input = within(canvasElement).getByRole("spinbutton");
    await userEvent.type(input, "5");
    await expect(input).toHaveValue("5");
    // the focused field is formatted in place after 3s without input
    await waitFor(() => expect(input).toHaveValue("$5"), { timeout: 5000 });
    await expect(input).toHaveFocus();
    await userEvent.keyboard("9");
    await expect(input).toHaveValue("10");
    await expect(input).toHaveAttribute("aria-valuenow", "10");
    await expect(lastChange(args.onChange)).toBe("10");
  },
};

/** Typing into the idle-formatted negative value clamps to the min bound. */
export const TypingAfterIdleFormattingBelowMin: Story = {
  parameters: a11yExceptions(SECONDARY_TEXT_LIGHT),
  args: {
    ...TypingAfterIdleFormatting.args,
  },
  play: async ({ canvasElement, args }) => {
    const input = within(canvasElement).getByRole("spinbutton");
    await userEvent.type(input, "-5");
    await expect(input).toHaveValue("-5");
    await waitFor(() => expect(input).toHaveValue("$-5"), { timeout: 5000 });
    await expect(input).toHaveFocus();
    await userEvent.keyboard("9");
    await expect(input).toHaveValue("-10");
    await expect(input).toHaveAttribute("aria-valuenow", "-10");
    await expect(lastChange(args.onChange)).toBe("-10");
  },
};

const BoundsHarness = (props: React.ComponentProps<typeof BigNumberField>) => {
  const [bounds, setBounds] = React.useState({ min: "0", max: "10" });
  return (
    <div>
      <BigNumberField {...props} minValue={bounds.min} maxValue={bounds.max} />
      <Button
        variant="primary"
        small
        text="Max 5"
        onPress={() => setBounds({ min: "0", max: "5" })}
      />
      <Button
        variant="primary"
        small
        text="Range 3 to 7"
        onPress={() => setBounds({ min: "3", max: "7" })}
      />
    </div>
  );
};

export const ChangingBounds: Story = {
  parameters: a11yExceptions(SECONDARY_TEXT_LIGHT, WHITE_ON_BLUE_LIGHT),
  args: { ...Default.args, label: "Amount", defaultValue: "4" },
  render: (args) => <BoundsHarness {...args} />,
  play: async ({ canvasElement, args, step }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole("spinbutton");
    await expect(input).toHaveAttribute("aria-valuemax", "10");

    await step("a lowered max applies to stepping and buttons", async () => {
      await userEvent.click(canvas.getByRole("button", { name: "Max 5" }));
      await waitFor(() => expect(input).toHaveAttribute("aria-valuemax", "5"));
      await userEvent.click(input);
      await userEvent.keyboard("{ArrowUp}{ArrowUp}");
      await expect(input).toHaveValue("5");
      await expect(lastChange(args.onChange)).toBe("5");
      const increment = await hoverToReveal(userEvent, input, () =>
        canvas.getByRole("button", { name: "Increment" }),
      );
      await expect(increment).toBeDisabled();
    });

    await step("a raised min and max apply to Home and End", async () => {
      await userEvent.click(
        canvas.getByRole("button", { name: "Range 3 to 7" }),
      );
      await waitFor(() => expect(input).toHaveAttribute("aria-valuemin", "3"));
      await expect(input).toHaveAttribute("aria-valuemax", "7");
      await userEvent.click(input);
      await userEvent.keyboard("{Home}");
      await expect(input).toHaveValue("3");
      await expect(lastChange(args.onChange)).toBe("3");
      await userEvent.keyboard("{ArrowDown}");
      await expect(input).toHaveValue("3");
      await userEvent.keyboard("{End}");
      await expect(input).toHaveValue("7");
      await expect(lastChange(args.onChange)).toBe("7");
    });
  },
};
