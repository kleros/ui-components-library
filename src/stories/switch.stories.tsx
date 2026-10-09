import React, { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { expect, fn, userEvent, within } from "@storybook/test";

import { IPreviewArgs } from "./utils";

import SwitchComponent from "../lib/form/switch";

const meta = {
  component: SwitchComponent,
  title: "Input/Switch",
  tags: ["autodocs"],
  args: {
    onChange: fn(),
  },
  argTypes: {
    small: {
      control: "boolean",
    },
  },
} satisfies Meta<typeof SwitchComponent>;

export default meta;

type Story = StoryObj<typeof meta> & IPreviewArgs;

/** The visual track whose classes reflect the switch state. */
const getTrack = (canvasElement: HTMLElement) =>
  canvasElement.querySelector("label > span.absolute") as HTMLElement;

/** Uncontrolled switch. */
export const Switch: Story = {
  args: {
    themeUI: "light",
    backgroundUI: "light",
    small: false,
    // a switch must have an accessible name
    "aria-label": "Enable notifications",
  },
  play: async ({ canvasElement, args, step }) => {
    const canvas = within(canvasElement);
    const toggle = canvas.getByRole("switch", { name: "Enable notifications" });
    await expect(toggle).not.toBeChecked();
    await expect(getTrack(canvasElement)).not.toHaveClass(
      "bg-klerosUIComponentsPrimaryBlue",
    );

    await step("clicking toggles the switch", async () => {
      await userEvent.click(getTrack(canvasElement));
      await expect(toggle).toBeChecked();
      await expect(args.onChange).toHaveBeenLastCalledWith(true);
      await expect(getTrack(canvasElement)).toHaveClass(
        "bg-klerosUIComponentsPrimaryBlue",
        "before:translate-x-6",
      );
      await userEvent.click(getTrack(canvasElement));
      await expect(toggle).not.toBeChecked();
      await expect(args.onChange).toHaveBeenLastCalledWith(false);
    });

    await step("Space toggles the focused switch", async () => {
      (document.activeElement as HTMLElement | null)?.blur();
      await userEvent.tab();
      await expect(toggle).toHaveFocus();
      await userEvent.keyboard(" ");
      await expect(toggle).toBeChecked();
      await expect(args.onChange).toHaveBeenCalledTimes(3);
    });
  },
};

export const SmallSelected: Story = {
  args: {
    ...Switch.args,
    small: true,
    defaultSelected: true,
  },
  play: async ({ canvasElement, args }) => {
    const toggle = within(canvasElement).getByRole("switch");
    await expect(toggle).toBeChecked();
    await expect(getTrack(canvasElement)).toHaveClass("before:translate-x-4");
    await expect(toggle.closest("label")).toHaveClass("h-4", "w-8");
    await userEvent.click(getTrack(canvasElement));
    await expect(toggle).not.toBeChecked();
    await expect(args.onChange).toHaveBeenCalledWith(false);
  },
};

export const Disabled: Story = {
  args: {
    ...Switch.args,
    isDisabled: true,
  },
  play: async ({ canvasElement, args }) => {
    const toggle = within(canvasElement).getByRole("switch");
    await expect(toggle).toBeDisabled();
    await userEvent.click(getTrack(canvasElement));
    await expect(toggle).not.toBeChecked();
    await expect(args.onChange).not.toHaveBeenCalled();
  },
};

/** A consumer `className` is merged with the base classes and wins conflicts. */
export const CustomClassName: Story = {
  args: {
    ...Switch.args,
    className: "custom-switch w-20",
  },
  play: async ({ canvasElement }) => {
    const label = within(canvasElement).getByRole("switch").closest("label");
    await expect(label).toHaveClass("custom-switch", "relative", "h-6", "w-20");
    await expect(label).not.toHaveClass("w-12");
  },
};

/** Controlled switch: the state lives in the parent. */
export const Controlled: Story = {
  args: {
    ...Switch.args,
    "aria-label": "Dark mode",
  },
  render: function Render(args) {
    const [isSelected, setSelected] = useState(true);
    return (
      <div className="flex items-center gap-4">
        <SwitchComponent
          {...args}
          isSelected={isSelected}
          onChange={(value) => {
            setSelected(value);
            args.onChange?.(value);
          }}
        />
        <span className="text-klerosUIComponentsPrimaryText">
          {isSelected ? "On" : "Off"}
        </span>
      </div>
    );
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const toggle = canvas.getByRole("switch", { name: "Dark mode" });
    await expect(toggle).toBeChecked();
    await expect(canvas.getByText("On")).toBeVisible();
    await userEvent.click(getTrack(canvasElement));
    await expect(toggle).not.toBeChecked();
    await expect(canvas.getByText("Off")).toBeVisible();
    await expect(args.onChange).toHaveBeenCalledWith(false);
  },
};
