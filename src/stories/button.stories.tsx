import React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { expect, fn, userEvent, waitFor, within } from "@storybook/test";

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

/** `title` is set on the button element, which react-aria would otherwise drop. */
export const WithTitle: Story = {
  parameters: a11yExceptions(WHITE_ON_BLUE_LIGHT),
  args: {
    variant: "primary",
    text: "Submit",
    title: "Submit the form",
    themeUI: "dark",
    backgroundUI: "light",
  },
  play: async ({ canvasElement }) => {
    const button = within(canvasElement).getByRole("button", {
      name: "Submit",
    });
    // set in an effect, after the first render
    await waitFor(() =>
      expect(button).toHaveAttribute("title", "Submit the form"),
    );
  },
};

/** Without `title`, the button has no title attribute. */
export const WithoutTitle: Story = {
  parameters: a11yExceptions(WHITE_ON_BLUE_LIGHT),
  args: {
    variant: "primary",
    text: "Submit",
    themeUI: "dark",
    backgroundUI: "light",
  },
  play: async ({ canvasElement }) => {
    await expect(
      within(canvasElement).getByRole("button", { name: "Submit" }),
    ).not.toHaveAttribute("title");
  },
};

/** A `ref` reaches the `<button>` element. */
export const WithRef: Story = {
  parameters: a11yExceptions(WHITE_ON_BLUE_LIGHT),
  args: {
    variant: "primary",
    text: "Focus me",
    ref: fn(),
    themeUI: "dark",
    backgroundUI: "light",
  },
  play: async ({ canvasElement, args }) => {
    const button = within(canvasElement).getByRole("button", {
      name: "Focus me",
    });
    await expect(button.tagName).toBe("BUTTON");
    await expect(args.ref).toHaveBeenCalledWith(button);
  },
};

/** `children` replace `text` in the button; `text` is the accessible name. */
export const RichChildren: Story = {
  parameters: a11yExceptions(WHITE_ON_BLUE_LIGHT),
  args: {
    variant: "primary",
    text: "Pay 5 ETH",
    children: (
      <>
        Pay <strong>5</strong> ETH
      </>
    ),
    themeUI: "dark",
    backgroundUI: "light",
  },
  play: async ({ canvasElement, args }) => {
    const button = within(canvasElement).getByRole("button", {
      name: "Pay 5 ETH",
    });
    await expect(button).toHaveAttribute("aria-label", "Pay 5 ETH");
    await expect(button.querySelector("strong")).toHaveTextContent("5");
    await expect(button.querySelector("p")).toBeNull();
    await expect(button.querySelector(".button-text")).toHaveTextContent(
      "Pay 5 ETH",
    );
    await userEvent.click(button);
    await expect(args.onPress).toHaveBeenCalledTimes(1);
  },
};

/** An icon-only button: the icon is the `children`, and `text` names the button. */
export const IconOnly: Story = {
  args: {
    variant: "primary",
    text: "Telegram",
    children: <Telegram aria-hidden="true" className="size-4" />,
    themeUI: "dark",
    backgroundUI: "light",
  },
  play: async ({ canvasElement, args }) => {
    const button = within(canvasElement).getByRole("button", {
      name: "Telegram",
    });
    await expect(button.querySelectorAll("svg")).toHaveLength(1);
    await expect(button.textContent).toBe("");
    await userEvent.click(button);
    await expect(args.onPress).toHaveBeenCalledTimes(1);
  },
};

/** With `children`, a caller's `aria-label` still names the button instead of `text`. */
export const ChildrenWithAriaLabel: Story = {
  args: {
    variant: "primary",
    text: "Close",
    "aria-label": "Close dialog",
    children: <Telegram aria-hidden="true" className="size-4" />,
    themeUI: "dark",
    backgroundUI: "light",
  },
  play: async ({ canvasElement }) => {
    await expect(
      within(canvasElement).getByRole("button", { name: "Close dialog" }),
    ).toBeInTheDocument();
  },
};
