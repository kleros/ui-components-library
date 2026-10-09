import React, { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { expect, fn, userEvent, waitFor, within } from "@storybook/test";

import { IPreviewArgs } from "./utils";

import RadioGroup from "../lib/form/radio-group";
import { Form } from "react-aria-components";
import Button from "../lib/button";
import { a11yExceptions } from "./a11y";
import {
  SECONDARY_TEXT_LIGHT,
  ERROR_TEXT_LIGHT,
  WHITE_ON_BLUE_LIGHT,
} from "./a11y-defects";

const meta = {
  component: RadioGroup,
  title: "Input/RadioGroup",
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
  play: async ({ canvasElement, args, step }) => {
    const canvas = within(canvasElement);
    const group = canvas.getByRole("radiogroup", { name: "Variants" });
    await expect(group).toHaveAttribute("aria-orientation", "vertical");
    const primary = canvas.getByRole("radio", { name: "Primary" });
    const secondary = canvas.getByRole("radio", { name: "Secondary" });
    await expect(primary).not.toBeChecked();
    await expect(secondary).not.toBeChecked();

    await step("clicking a label selects the option", async () => {
      await userEvent.click(canvas.getByText("Secondary"));
      await expect(secondary).toBeChecked();
      await expect(args.onChange).toHaveBeenLastCalledWith("secondary");
    });

    await step("arrow keys move the selection", async () => {
      await userEvent.keyboard("{ArrowUp}");
      await expect(primary).toBeChecked();
      await expect(primary).toHaveFocus();
      await expect(secondary).not.toBeChecked();
      await expect(args.onChange).toHaveBeenLastCalledWith("primary");
    });

    await step("only the selected radio is in the tab order", async () => {
      (document.activeElement as HTMLElement | null)?.blur();
      await userEvent.tab();
      await expect(primary).toHaveFocus();
      await userEvent.tab();
      await expect(secondary).not.toHaveFocus();
    });
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
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const group = canvas.getByRole("radiogroup", { name: "Variants:" });
    await expect(group).toHaveAttribute("aria-orientation", "horizontal");
    await userEvent.click(canvas.getByRole("radio", { name: "Primary" }));
    await userEvent.keyboard("{ArrowRight}");
    await expect(
      canvas.getByRole("radio", { name: "Secondary" }),
    ).toBeChecked();
    await expect(args.onChange).toHaveBeenLastCalledWith("secondary");
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
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const primary = canvas.getByRole("radio", { name: "Primary" });
    await expect(primary).toBeDisabled();
    await userEvent.click(canvas.getByText("Primary"));
    await expect(primary).not.toBeChecked();
    await expect(args.onChange).not.toHaveBeenCalled();
    await userEvent.click(canvas.getByText("Secondary"));
    await expect(args.onChange).toHaveBeenCalledWith("secondary");
    // keyboard navigation skips the disabled option
    await userEvent.keyboard("{ArrowUp}");
    await expect(primary).not.toBeChecked();
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
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const group = canvas.getByRole("radiogroup");
    await expect(group).toHaveAttribute("aria-required", "true");
    await expect(group).toHaveAttribute("aria-readonly", "true");
    // read only: options cannot be selected
    await userEvent.click(canvas.getByText("Primary"));
    await expect(
      canvas.getByRole("radio", { name: "Primary" }),
    ).not.toBeChecked();
    await expect(args.onChange).not.toHaveBeenCalled();
    // submitting without a value marks the group invalid
    await userEvent.click(canvas.getByRole("button", { name: "Click me!" }));
    await waitFor(() => expect(group).toHaveAttribute("aria-invalid", "true"));
    await expect(
      canvasElement.querySelector(".text-klerosUIComponentsError"),
    ).not.toBeEmptyDOMElement();
  },
};

/** Controlled group: the value lives in the parent's state. */
export const Controlled: Story = {
  args: {
    ...Vertical.args,
    groupLabel: "Controlled",
  },
  render: function Render(args) {
    const [value, setValue] = useState("secondary");
    return (
      <div>
        <RadioGroup
          {...args}
          value={value}
          onChange={(v) => {
            setValue(v);
            args.onChange?.(v);
          }}
        />
        <p className="text-klerosUIComponentsPrimaryText">Selected: {value}</p>
      </div>
    );
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await expect(
      canvas.getByRole("radio", { name: "Secondary" }),
    ).toBeChecked();
    await userEvent.click(canvas.getByRole("radio", { name: "Primary" }));
    await expect(canvas.getByText("Selected: primary")).toBeVisible();
    await expect(args.onChange).toHaveBeenCalledWith("primary");
  },
};

/** Externally invalid group, e.g. after server-side validation. */
export const Invalid: Story = {
  args: {
    ...Vertical.args,
    isInvalid: true,
    fieldErrorProps: { children: "Please pick a variant." },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const group = canvas.getByRole("radiogroup", { name: "Variants" });
    await expect(group).toHaveAttribute("aria-invalid", "true");
    const error = canvas.getByText("Please pick a variant.");
    await expect(group).toHaveAttribute(
      "aria-describedby",
      expect.stringContaining(error.id),
    );
  },
};
