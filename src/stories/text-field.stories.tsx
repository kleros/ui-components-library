import React, { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { expect, fn, userEvent, waitFor, within } from "@storybook/test";

import { IPreviewArgs } from "./utils";

import TextFieldComponent from "../lib/form/text-field";
import Telegram from "../assets/svgs/telegram.svg";
import { Form } from "react-aria-components";
import Button from "../lib/button";

const meta = {
  component: TextFieldComponent,
  title: "Form/TextField",
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
} satisfies Meta<typeof TextFieldComponent>;

export default meta;

type Story = StoryObj<typeof meta> & IPreviewArgs;

export const Default: Story = {
  args: {
    themeUI: "dark",
    backgroundUI: "light",
    className: "w-[500px]",
    placeholder: "Enter Text",
  },
  play: async ({ canvasElement, args }) => {
    const input = within(canvasElement).getByRole("textbox");
    await expect(input).toHaveAttribute("placeholder", "Enter Text");
    await userEvent.type(input, "Kleros");
    await expect(input).toHaveValue("Kleros");
    await expect(args.onChange).toHaveBeenLastCalledWith("Kleros");
    await expect(args.onChange).toHaveBeenCalledTimes(6);
    await userEvent.keyboard("{Backspace}");
    await expect(args.onChange).toHaveBeenLastCalledWith("Klero");
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
      "pr-11",
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
    await expect(input).toHaveClass("pr-14");
    const icon = input.parentElement?.querySelector('[aria-hidden="true"]');
    await expect(icon?.querySelector("svg")).toBeInTheDocument();
  },
};

export const Labelled: Story = {
  args: {
    ...Default.args,
    label: "Name",
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole("textbox", { name: "Name" });
    await userEvent.click(canvas.getByText("Name"));
    await expect(input).toHaveFocus();
  },
};

export const WithDescription: Story = {
  args: {
    ...Default.args,
    label: "Name",
    message: "Your name",
  },
  play: async ({ canvasElement }) => {
    const input = within(canvasElement).getByRole("textbox", { name: "Name" });
    await expect(input).toHaveAccessibleDescription("Your name");
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
      <TextFieldComponent
        {...args}
        showFieldError
        validate={(value) => (value === "admin" ? "Nice try!" : null)}
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

    await step("empty required field is invalid on submit", async () => {
      await userEvent.click(submit);
      await waitFor(() =>
        expect(input).toHaveAttribute("aria-invalid", "true"),
      );
      await expect(input).toHaveFocus();
    });

    await step("custom validation message is shown", async () => {
      await userEvent.type(input, "admin");
      await userEvent.click(submit);
      await expect(await canvas.findByText("Nice try!")).toBeVisible();
      await expect(input).toHaveAccessibleDescription(/Nice try!/);
    });

    await step("valid input clears the error", async () => {
      await userEvent.clear(input);
      await userEvent.type(input, "juror");
      await userEvent.click(submit);
      await waitFor(() =>
        expect(canvas.queryByText("Nice try!")).not.toBeInTheDocument(),
      );
      await expect(input).not.toHaveAttribute("aria-invalid");
    });
  },
};

export const Disabled: Story = {
  args: {
    ...Default.args,
    label: "Name",
    defaultValue: "Alice",
    isDisabled: true,
  },
  play: async ({ canvasElement, args }) => {
    const input = within(canvasElement).getByRole("textbox", { name: "Name" });
    await expect(input).toBeDisabled();
    await userEvent.type(input, "Bob");
    await expect(input).toHaveValue("Alice");
    await expect(args.onChange).not.toHaveBeenCalled();
    await userEvent.tab();
    await expect(input).not.toHaveFocus();
  },
};

export const ReadOnly: Story = {
  args: {
    ...Default.args,
    label: "Name",
    defaultValue: "Alice",
    isReadOnly: true,
  },
  play: async ({ canvasElement, args }) => {
    const input = within(canvasElement).getByRole("textbox", { name: "Name" });
    await expect(input).toHaveAttribute("readonly");
    await userEvent.type(input, "Bob");
    await expect(input).toHaveValue("Alice");
    await expect(args.onChange).not.toHaveBeenCalled();
    // read only fields remain focusable
    await expect(input).toHaveFocus();
  },
};

/** Controlled usage with `value` + `onChange`. */
export const Controlled: Story = {
  args: {
    ...Default.args,
    label: "Name",
  },
  render: function Render(args) {
    const [value, setValue] = useState("");
    return (
      <div>
        <TextFieldComponent
          {...args}
          value={value}
          onChange={(v) => {
            // the parent upper-cases every change
            setValue(v.toUpperCase());
            args.onChange?.(v);
          }}
        />
        <p className="text-klerosUIComponentsPrimaryText">Value: {value}</p>
      </div>
    );
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole("textbox", { name: "Name" });
    await userEvent.type(input, "abc");
    await expect(input).toHaveValue("ABC");
    await expect(canvas.getByText("Value: ABC")).toBeVisible();
    await expect(args.onChange).toHaveBeenLastCalledWith("ABc");
  },
};

export const ErrorMessage: Story = {
  args: {
    ...Default.args,
    label: "Name",
    variant: "error",
    message: "This name is taken.",
    isInvalid: true,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole("textbox", { name: "Name" });
    await expect(input).toHaveAttribute("aria-invalid", "true");
    await expect(input).toHaveClass("border-klerosUIComponentsError");
    await expect(canvas.getByText("This name is taken.")).toHaveClass(
      "text-klerosUIComponentsError",
    );
  },
};
