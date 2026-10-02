import React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { expect, fn, userEvent, waitFor, within } from "@storybook/test";

import { IPreviewArgs } from "./utils";

import NumberFieldComponent from "../lib/form/number-field";
import Telegram from "../assets/svgs/telegram.svg";
import { Form } from "react-aria-components";
import Button from "../lib/button";

const meta = {
  component: NumberFieldComponent,
  title: "Form/NumberField",
  tags: ["autodocs"],
  args: {
    onChange: fn(),
  },
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
  play: async ({ canvasElement, args, step }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole("textbox");
    await expect(input).toHaveAttribute("placeholder", "Enter Number");

    await step("typed values are committed on blur", async () => {
      await userEvent.type(input, "42");
      await expect(args.onChange).not.toHaveBeenCalled();
      await userEvent.tab();
      await expect(args.onChange).toHaveBeenLastCalledWith(42);
      await expect(input).toHaveValue("42");
    });

    await step("non numeric characters are rejected", async () => {
      await userEvent.type(input, "abc");
      await expect(input).toHaveValue("42");
    });

    await step("arrow keys step the value", async () => {
      await userEvent.click(input);
      await userEvent.keyboard("{ArrowUp}");
      await expect(input).toHaveValue("43");
      await expect(args.onChange).toHaveBeenLastCalledWith(43);
      await userEvent.keyboard("{ArrowDown}{ArrowDown}");
      await expect(args.onChange).toHaveBeenLastCalledWith(41);
    });

    await step("stepper buttons appear on hover", async () => {
      await userEvent.hover(input);
      const increase = canvas.getByRole("button", { name: /Increase/ });
      await userEvent.click(increase);
      await expect(args.onChange).toHaveBeenLastCalledWith(42);
      await userEvent.click(canvas.getByRole("button", { name: /Decrease/ }));
      await expect(args.onChange).toHaveBeenLastCalledWith(41);
      await userEvent.unhover(input);
    });
  },
};

export const Variant: Story = {
  args: {
    ...Default.args,
    variant: "success",
  },
  play: async ({ canvasElement }) => {
    const input = within(canvasElement).getByRole("textbox");
    await expect(input).toHaveClass(
      "border-klerosUIComponentsSuccess",
      "pr-13",
    );
    await expect(
      input.parentElement?.querySelector("svg.fill-klerosUIComponentsSuccess"),
    ).toBeInTheDocument();
  },
};

export const CustomIcon: Story = {
  args: {
    ...Default.args,
    Icon: Telegram,
  },
  play: async ({ canvasElement }) => {
    const input = within(canvasElement).getByRole("textbox");
    await expect(input).toHaveClass("pr-16");
    await expect(
      input.parentElement?.querySelector(".bg-klerosUIComponentsLightBlue svg"),
    ).toBeInTheDocument();
  },
};

export const Labelled: Story = {
  args: {
    ...Default.args,
    label: "Age",
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole("textbox", { name: "Age" });
    await userEvent.click(canvas.getByText("Age"));
    await expect(input).toHaveFocus();
  },
};

export const WithDescription: Story = {
  args: {
    ...Default.args,
    label: "Age",
    message: "Your current age.",
  },
  play: async ({ canvasElement }) => {
    const input = within(canvasElement).getByRole("textbox", { name: "Age" });
    await expect(input).toHaveAccessibleDescription("Your current age.");
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
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole("textbox");
    const submit = canvas.getByRole("button", { name: "Click me!" });
    await expect(input).toBeRequired();

    await step(
      "submitting an empty required field shows an error",
      async () => {
        await userEvent.click(submit);
        await waitFor(() =>
          expect(input).toHaveAttribute("aria-invalid", "true"),
        );
        await expect(canvas.getAllByRole("listitem")).toHaveLength(1);
      },
    );

    await step("custom validation errors are listed", async () => {
      await userEvent.type(input, "0");
      await userEvent.click(submit);
      await expect(await canvas.findByText("Zero not allowed.")).toBeVisible();
      await expect(input).toHaveAttribute("aria-invalid", "true");
    });

    await step("a valid value clears the error", async () => {
      await userEvent.clear(input);
      await userEvent.type(input, "5");
      await userEvent.click(submit);
      await waitFor(() =>
        expect(canvas.queryByRole("listitem")).not.toBeInTheDocument(),
      );
      await expect(input).not.toHaveAttribute("aria-invalid");
    });
  },
};

/** `minValue` / `maxValue` clamp the value and disable the steppers at the limits. */
export const WithMinMax: Story = {
  args: {
    ...Default.args,
    label: "Rating",
    minValue: 0,
    maxValue: 10,
    defaultValue: 10,
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole("textbox", { name: "Rating" });
    await expect(input).toHaveValue("10");
    await userEvent.hover(input);
    await expect(
      canvas.getByRole("button", { name: /Increase/ }),
    ).toBeDisabled();
    await expect(
      canvas.getByRole("button", { name: /Decrease/ }),
    ).toBeEnabled();

    await userEvent.clear(input);
    await userEvent.type(input, "7");
    await userEvent.tab();
    await expect(args.onChange).toHaveBeenLastCalledWith(7);
    // out of range values are clamped on commit
    await userEvent.clear(input);
    await userEvent.type(input, "99");
    await userEvent.tab();
    await expect(input).toHaveValue("10");
    await expect(args.onChange).toHaveBeenLastCalledWith(10);
    await userEvent.unhover(input);
  },
};

export const Disabled: Story = {
  args: {
    ...Default.args,
    label: "Age",
    defaultValue: 30,
    isDisabled: true,
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole("textbox", { name: "Age" });
    await expect(input).toBeDisabled();
    await userEvent.type(input, "5{ArrowUp}");
    await expect(input).toHaveValue("30");
    await expect(args.onChange).not.toHaveBeenCalled();
    // steppers are not shown on hover when disabled
    await userEvent.hover(input);
    await expect(input.nextElementSibling).toHaveClass("hidden");
  },
};
