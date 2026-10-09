import type { Meta, StoryObj } from "@storybook/react";
import { expect, fn, userEvent, within } from "@storybook/test";

import { IPreviewArgs } from "./utils";

import Button from "../lib/button/index";
import Telegram from "../assets/svgs/telegram.svg";
import { a11yExceptions, auditA11y } from "./a11y";
import { PRIMARY_BLUE_TEXT_LIGHT, WHITE_ON_BLUE_LIGHT } from "./a11y-defects";

const meta = {
  component: Button,
  title: "Button",
  tags: ["autodocs"],
  args: {
    onPress: fn(),
  },
  argTypes: {
    // by default storybook generates an inputType,
    // https://storybook.js.org/docs/essentials/controls#choosing-the-control-type
    variant: {
      options: ["primary", "secondary", "tertiary"],
      control: { type: "radio" },
    },
    isDisabled: {
      control: "boolean",
    },
  },
} satisfies Meta<typeof Button>;

export default meta;

type Story = StoryObj<typeof meta> & IPreviewArgs;

export const PrimaryButton: Story = {
  parameters: a11yExceptions(WHITE_ON_BLUE_LIGHT),
  args: {
    variant: "primary",
    text: "Primary",
    themeUI: "dark",
    backgroundUI: "light",
  },
  play: async ({ canvasElement, args, step }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole("button", { name: "Primary" });
    await expect(button).toHaveClass("bg-klerosUIComponentsPrimaryBlue");
    await expect(button).toBeEnabled();

    await step("click calls onPress", async () => {
      await userEvent.click(button);
      await expect(args.onPress).toHaveBeenCalledTimes(1);
    });

    await step("Enter and Space call onPress when focused", async () => {
      button.blur();
      await userEvent.tab();
      await expect(button).toHaveFocus();
      await userEvent.keyboard("{Enter}");
      await expect(args.onPress).toHaveBeenCalledTimes(2);
      await userEvent.keyboard(" ");
      await expect(args.onPress).toHaveBeenCalledTimes(3);
    });
  },
};

export const SecondaryButton: Story = {
  parameters: a11yExceptions(PRIMARY_BLUE_TEXT_LIGHT),
  args: {
    variant: "secondary",
    text: "Secondary",
    themeUI: "dark",
    backgroundUI: "light",
  },
  play: async ({ canvasElement, args }) => {
    const button = within(canvasElement).getByRole("button", {
      name: "Secondary",
    });
    await expect(button).toHaveClass(
      "bg-klerosUIComponentsWhiteBackground",
      "border-klerosUIComponentsPrimaryBlue",
    );
    await expect(within(button).getByText("Secondary")).toHaveClass(
      "text-klerosUIComponentsPrimaryBlue",
    );
    await userEvent.click(button);
    await expect(args.onPress).toHaveBeenCalledTimes(1);
  },
};

export const TertiaryButton: Story = {
  args: {
    variant: "tertiary",
    text: "Tertiary",
    themeUI: "dark",
    backgroundUI: "light",
  },
  play: async ({ canvasElement, args }) => {
    const button = within(canvasElement).getByRole("button", {
      name: "Tertiary",
    });
    await expect(button).toHaveClass("bg-klerosUIComponentsSecondaryPurple");
    await userEvent.click(button);
    await expect(args.onPress).toHaveBeenCalledTimes(1);
    // move the pointer away: the axe check runs on the resting state (the
    // hovered purple background has lower contrast, tracked separately)
    await userEvent.unhover(button);
  },
};

export const IconButton: Story = {
  parameters: a11yExceptions(WHITE_ON_BLUE_LIGHT),
  args: {
    variant: "primary",
    text: "Telegram",
    Icon: Telegram,
    themeUI: "dark",
    backgroundUI: "light",
  },
  play: async ({ canvasElement, args }) => {
    const button = within(canvasElement).getByRole("button", {
      name: "Telegram",
    });
    // the icon is rendered next to the text
    await expect(button.querySelectorAll("svg")).toHaveLength(1);
    await expect(button.querySelector(".button-loading")).toBeNull();
    await userEvent.click(button);
    await expect(args.onPress).toHaveBeenCalledTimes(1);
  },
};

export const LoadingButton: Story = {
  args: {
    variant: "primary",
    text: "Loading",
    isLoading: true,
    isDisabled: true,
    themeUI: "dark",
    backgroundUI: "light",
  },
  parameters: a11yExceptions({
    rule: "button-name",
    selector: "button[data-disabled]",
    reason:
      "Library defect: while loading, the label is `invisible` and the button has no accessible name.",
    source: "src/lib/button/ButtonText.tsx:14",
  }),
  play: async ({ canvasElement, args }) => {
    const button = within(canvasElement).getByRole("button");
    await expect(button).toBeDisabled();
    // loading spinner replaces the (hidden) text
    await expect(button.querySelector(".button-loading")).toBeInTheDocument();
    await expect(within(button).getByText("Loading")).toHaveClass("invisible");
    await userEvent.click(button);
    await expect(args.onPress).not.toHaveBeenCalled();
  },
};

export const DisabledButton: Story = {
  args: {
    variant: "secondary",
    text: "Disabled",
    isDisabled: true,
    themeUI: "dark",
    backgroundUI: "light",
  },
  play: async ({ canvasElement, args, ...context }) => {
    const button = within(canvasElement).getByRole("button", {
      name: "Disabled",
    });
    await expect(button).toBeDisabled();
    await auditA11y(context, "disabled");
    await expect(button).toHaveClass(
      "bg-klerosUIComponentsLightGrey",
      "hover:cursor-not-allowed",
    );
    await userEvent.click(button);
    await expect(args.onPress).not.toHaveBeenCalled();
    // disabled buttons are skipped in the tab order
    await userEvent.tab();
    await expect(button).not.toHaveFocus();
  },
};
