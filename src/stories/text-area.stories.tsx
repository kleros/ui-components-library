import React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { expect, fn, userEvent, waitFor, within } from "@storybook/test";

import { IPreviewArgs } from "./utils";

import TextAreaFieldComponent from "../lib/form/text-area";
import { Form } from "react-aria-components";
import Button from "../lib/button";
import { a11yExceptions } from "./a11y";
import {
  SECONDARY_TEXT_LIGHT,
  ERROR_TEXT_LIGHT,
  WHITE_ON_BLUE_LIGHT,
} from "./a11y-defects";

const meta = {
  component: TextAreaFieldComponent,
  title: "Form/TextArea",
  parameters: a11yExceptions(
    SECONDARY_TEXT_LIGHT,
    ERROR_TEXT_LIGHT,
    WHITE_ON_BLUE_LIGHT,
  ),
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
    resizeX: {
      control: "boolean",
    },
    resizeY: {
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
} satisfies Meta<typeof TextAreaFieldComponent>;

export default meta;

type Story = StoryObj<typeof meta> & IPreviewArgs;

export const Default: Story = {
  args: {
    themeUI: "dark",
    backgroundUI: "light",
    className: "w-[500px]",
    placeholder: "Enter description",
  },
  play: async ({ canvasElement, args }) => {
    const textarea = within(canvasElement).getByRole("textbox");
    await expect(textarea.tagName).toBe("TEXTAREA");
    await expect(textarea).toHaveAttribute("placeholder", "Enter description");
    await userEvent.type(textarea, "Line 1{Enter}Line 2");
    await expect(textarea).toHaveValue("Line 1\nLine 2");
    await expect(args.onChange).toHaveBeenLastCalledWith("Line 1\nLine 2");
    // not resizable by default
    await expect(textarea).not.toHaveClass("resize", "resize-x", "resize-y");
  },
};

export const Variant: Story = {
  args: {
    ...Default.args,
    variant: "success",
  },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByRole("textbox")).toHaveClass(
      "border-klerosUIComponentsSuccess",
    );
  },
};

export const Labelled: Story = {
  args: {
    ...Default.args,
    label: "Description",
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const textarea = canvas.getByRole("textbox", { name: "Description" });
    await userEvent.click(canvas.getByText("Description"));
    await expect(textarea).toHaveFocus();
  },
};

export const Resizable: Story = {
  args: {
    ...Default.args,
    label: "Description",
    message: "Your auto-biography",
    resizeX: true,
    resizeY: true,
  },
  play: async ({ canvasElement }) => {
    const textarea = within(canvasElement).getByRole("textbox", {
      name: "Description",
    });
    await expect(textarea).toHaveClass("resize");
    await expect(textarea).toHaveAccessibleDescription("Your auto-biography");
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
      <TextAreaFieldComponent
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
    const textarea = canvas.getByRole("textbox");
    const submit = canvas.getByRole("button", { name: "Click me!" });
    await expect(textarea).toBeRequired();

    await step("empty required field is invalid on submit", async () => {
      await userEvent.click(submit);
      await waitFor(() =>
        expect(textarea).toHaveAttribute("aria-invalid", "true"),
      );
    });

    await step("custom validation message is shown", async () => {
      await userEvent.type(textarea, "admin");
      await userEvent.click(submit);
      await expect(await canvas.findByText("Nice try!")).toBeVisible();
    });

    await step("valid input clears the error", async () => {
      await userEvent.type(textarea, "istrator");
      await userEvent.click(submit);
      await waitFor(() =>
        expect(canvas.queryByText("Nice try!")).not.toBeInTheDocument(),
      );
      await expect(textarea).not.toHaveAttribute("aria-invalid");
    });
  },
};

export const Disabled: Story = {
  args: {
    ...Default.args,
    label: "Description",
    defaultValue: "Read me",
    isDisabled: true,
  },
  play: async ({ canvasElement, args }) => {
    const textarea = within(canvasElement).getByRole("textbox", {
      name: "Description",
    });
    await expect(textarea).toBeDisabled();
    await userEvent.type(textarea, "more");
    await expect(textarea).toHaveValue("Read me");
    await expect(args.onChange).not.toHaveBeenCalled();
  },
};

export const ErrorMessage: Story = {
  args: {
    ...Default.args,
    label: "Description",
    variant: "error",
    message: "Description is too short.",
    isInvalid: true,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const textarea = canvas.getByRole("textbox", { name: "Description" });
    await expect(textarea).toHaveAttribute("aria-invalid", "true");
    await expect(textarea).toHaveClass("border-klerosUIComponentsError");
    const message = canvas.getByText("Description is too short.");
    await expect(message).toHaveClass("text-klerosUIComponentsError");
    await expect(message.querySelector("svg")).toHaveClass(
      "fill-klerosUIComponentsError",
    );
  },
};
