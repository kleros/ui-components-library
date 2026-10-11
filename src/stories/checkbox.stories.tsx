import React, { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { expect, fn, userEvent, within } from "@storybook/test";

import { IPreviewArgs } from "./utils";

import CheckboxComponent from "../lib/form/checkbox";
import Button from "../lib/button";
import { a11yExceptions, auditA11y } from "./a11y";
import { PRIMARY_BLUE_TEXT_LIGHT } from "./a11y-defects";

const meta = {
  component: CheckboxComponent,
  title: "Input/Checkbox",
  tags: ["autodocs"],
  args: {
    onChange: fn(),
  },
  argTypes: {
    small: {
      control: "boolean",
    },
  },
} satisfies Meta<typeof CheckboxComponent>;

export default meta;

type Story = StoryObj<typeof meta> & IPreviewArgs;

/** Uncontrolled checkbox. */
export const Box: Story = {
  args: {
    themeUI: "dark",
    backgroundUI: "light",
    className: "w-[500px]",
    label: "Checkbox",
    small: false,
  },
  play: async ({ canvasElement, args, step }) => {
    const canvas = within(canvasElement);
    const checkbox = canvas.getByRole("checkbox", { name: "Checkbox" });
    await expect(checkbox).not.toBeChecked();

    await step("clicking the label toggles the checkbox", async () => {
      await userEvent.click(canvas.getByText("Checkbox"));
      await expect(checkbox).toBeChecked();
      await expect(args.onChange).toHaveBeenLastCalledWith(true);
      await userEvent.click(canvas.getByText("Checkbox"));
      await expect(checkbox).not.toBeChecked();
      await expect(args.onChange).toHaveBeenLastCalledWith(false);
    });

    await step("Space toggles the focused checkbox", async () => {
      (document.activeElement as HTMLElement | null)?.blur();
      await userEvent.tab();
      await expect(checkbox).toHaveFocus();
      await userEvent.keyboard(" ");
      await expect(checkbox).toBeChecked();
      await expect(args.onChange).toHaveBeenCalledTimes(3);
    });
  },
};

export const DefaultSelected: Story = {
  args: {
    ...Box.args,
    label: "Remember me",
    defaultSelected: true,
    small: true,
  },
  play: async ({ canvasElement, args }) => {
    const checkbox = within(canvasElement).getByRole("checkbox", {
      name: "Remember me",
    });
    await expect(checkbox).toBeChecked();
    await userEvent.click(checkbox);
    await expect(checkbox).not.toBeChecked();
    await expect(args.onChange).toHaveBeenCalledWith(false);
  },
};

export const Disabled: Story = {
  args: {
    ...Box.args,
    label: "Disabled checkbox",
    isDisabled: true,
  },
  play: async ({ canvasElement, args, ...context }) => {
    const canvas = within(canvasElement);
    const checkbox = canvas.getByRole("checkbox", {
      name: "Disabled checkbox",
    });
    await expect(checkbox).toBeDisabled();
    await auditA11y(context, "disabled");
    await userEvent.click(canvas.getByText("Disabled checkbox"));
    await expect(checkbox).not.toBeChecked();
    await expect(args.onChange).not.toHaveBeenCalled();
    await userEvent.tab();
    await expect(checkbox).not.toHaveFocus();
  },
};

export const Invalid: Story = {
  args: {
    ...Box.args,
    label: "I accept the terms",
    isInvalid: true,
  },
  play: async ({ canvasElement }) => {
    const checkbox = within(canvasElement).getByRole("checkbox", {
      name: "I accept the terms",
    });
    await expect(checkbox).toHaveAttribute("aria-invalid", "true");
    await expect(checkbox).toBeInvalid();
  },
};

/** Controlled checkbox: the selection lives in the parent's state. */
export const Controlled: Story = {
  parameters: a11yExceptions(PRIMARY_BLUE_TEXT_LIGHT),
  args: {
    ...Box.args,
    label: "Controlled",
  },
  render: function Render(args) {
    const [isSelected, setSelected] = useState(false);
    return (
      <div>
        <CheckboxComponent
          {...args}
          isSelected={isSelected}
          onChange={(value) => {
            setSelected(value);
            args.onChange?.(value);
          }}
        />
        <p className="text-klerosUIComponentsPrimaryText">
          {isSelected ? "Selected" : "Not selected"}
        </p>
        <Button
          small
          variant="secondary"
          text="Reset"
          onPress={() => setSelected(false)}
        />
      </div>
    );
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const checkbox = canvas.getByRole("checkbox", { name: "Controlled" });
    await expect(canvas.getByText("Not selected")).toBeVisible();
    await userEvent.click(checkbox);
    await expect(checkbox).toBeChecked();
    await expect(canvas.getByText("Selected")).toBeVisible();
    await expect(args.onChange).toHaveBeenCalledWith(true);
    // the parent can reset the value
    await userEvent.click(canvas.getByRole("button", { name: "Reset" }));
    await expect(checkbox).not.toBeChecked();
  },
};
