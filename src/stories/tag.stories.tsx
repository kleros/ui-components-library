import React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { expect, fn, userEvent, within } from "@storybook/test";

import { IPreviewArgs } from "./utils";

import TagComponent from "../lib/tag";
import { a11yExceptions } from "./a11y";
import {
  PRIMARY_BLUE_TEXT_LIGHT,
  PRIMARY_BLUE_TEXT_RICH_LIGHT,
} from "./a11y-defects";

const meta = {
  component: TagComponent,
  title: "Display/Tag",
  tags: ["autodocs"],
  args: {
    onPress: fn(),
  },
  argTypes: {
    active: {
      control: "boolean",
    },
    toggle: {
      control: "boolean",
    },
  },
} satisfies Meta<typeof TagComponent>;

export default meta;

type Story = StoryObj<typeof meta> & IPreviewArgs;

const TAG_CONTRAST = a11yExceptions(PRIMARY_BLUE_TEXT_LIGHT);

export const Tag: Story = {
  parameters: TAG_CONTRAST,
  args: {
    active: false,
    themeUI: "light",
    backgroundUI: "light",
    text: "Label",
  },
  play: async ({ canvasElement, args }) => {
    const tag = within(canvasElement).getByRole("button", { name: "Label" });
    await expect(tag).not.toHaveClass("border-klerosUIComponentsPrimaryBlue");
    await expect(within(tag).getByText("Label")).toHaveClass(
      "hover:text-klerosUIComponentsSecondaryBlue",
    );
    await userEvent.click(tag);
    await expect(args.onPress).toHaveBeenCalledTimes(1);
    await userEvent.keyboard("{Enter}");
    await expect(args.onPress).toHaveBeenCalledTimes(2);
  },
};

export const ActiveTag: Story = {
  parameters: TAG_CONTRAST,
  args: {
    active: true,
    themeUI: "light",
    backgroundUI: "light",
    text: "Active",
  },
  play: async ({ canvasElement }) => {
    const tag = within(canvasElement).getByRole("button", { name: "Active" });
    await expect(tag).toHaveClass(
      "border-klerosUIComponentsPrimaryBlue",
      "border",
    );
    await expect(within(tag).getByText("Active")).not.toHaveClass(
      "hover:text-klerosUIComponentsSecondaryBlue",
    );
  },
};

export const DisabledTag: Story = {
  args: {
    themeUI: "light",
    backgroundUI: "light",
    text: "Disabled",
    isDisabled: true,
  },
  play: async ({ canvasElement, args }) => {
    const tag = within(canvasElement).getByRole("button", { name: "Disabled" });
    await expect(tag).toBeDisabled();
    await userEvent.click(tag);
    await expect(args.onPress).not.toHaveBeenCalled();
  },
};

/** With `toggle`, `active` is announced as `aria-pressed`, not only drawn as a border. */
export const ToggleTag: Story = {
  parameters: TAG_CONTRAST,
  args: {
    toggle: true,
    active: true,
    themeUI: "light",
    backgroundUI: "light",
    text: "Pinned",
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const tag = canvas.getByRole("button", { name: "Pinned", pressed: true });
    await expect(tag).toHaveAttribute("aria-pressed", "true");
    await expect(tag).toHaveClass("border-klerosUIComponentsPrimaryBlue");
    await userEvent.click(tag);
    await expect(args.onPress).toHaveBeenCalledTimes(1);
  },
};

/** An inactive toggle is announced as not pressed, rather than without a state. */
export const ToggleTagInactive: Story = {
  parameters: TAG_CONTRAST,
  args: {
    toggle: true,
    active: false,
    themeUI: "light",
    backgroundUI: "light",
    text: "Pinned",
  },
  play: async ({ canvasElement }) => {
    const tag = within(canvasElement).getByRole("button", {
      name: "Pinned",
      pressed: false,
    });
    await expect(tag).toHaveAttribute("aria-pressed", "false");
  },
};

/** Without `toggle`, an active tag carries no `aria-pressed`, as before. */
export const ActiveWithoutToggle: Story = {
  parameters: TAG_CONTRAST,
  args: {
    active: true,
    themeUI: "light",
    backgroundUI: "light",
    text: "Active",
  },
  play: async ({ canvasElement }) => {
    await expect(
      within(canvasElement).getByRole("button", { name: "Active" }),
    ).not.toHaveAttribute("aria-pressed");
  },
};

/** `children` replace `text` in the tag; `text` stays the accessible name. */
export const RichTag: Story = {
  parameters: a11yExceptions(
    PRIMARY_BLUE_TEXT_LIGHT,
    PRIMARY_BLUE_TEXT_RICH_LIGHT,
  ),
  args: {
    themeUI: "light",
    backgroundUI: "light",
    text: "Open cases",
    children: (
      <>
        <span
          aria-hidden="true"
          className="bg-klerosUIComponentsSuccess mr-2 inline-block size-2 rounded-full"
          data-testid="dot"
        />
        Open <strong>(12)</strong>
      </>
    ),
  },
  play: async ({ canvasElement }) => {
    const tag = within(canvasElement).getByRole("button", {
      name: "Open cases",
    });
    await expect(tag).toHaveAttribute("aria-label", "Open cases");
    await expect(tag).toHaveTextContent("Open (12)");
    await expect(tag.querySelector("strong")).toHaveTextContent("(12)");
    await expect(tag.querySelector("[data-testid=dot]")).toBeInTheDocument();
    // the plain-text paragraph is not rendered next to the children
    await expect(tag.querySelector("p")).toBeNull();
  },
};
