import React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { expect, userEvent, within } from "@storybook/test";

import {
  IPreviewArgs,
  disableA11yRules,
  hoverForTooltip,
  mouseHover,
  waitForAnimations,
  waitForTooltipHidden,
} from "./utils";

import TooltipComponent from "../lib/tooltip";
import Tag from "../lib/tag";

const meta = {
  component: TooltipComponent,
  title: "Tooltip",
  tags: ["autodocs"],
  // Pre-existing component issues: the trigger wrapper is a focusable
  // `role="button"` div around the (interactive) children, and the Tag used as
  // child has primary blue text on medium blue, below WCAG AA contrast.
  parameters: disableA11yRules("nested-interactive", "color-contrast"),
  argTypes: {
    place: {
      options: ["top", "right", "bottom", "left"],
      control: "radio",
    },
    small: {
      control: "boolean",
    },
    isDisabled: {
      control: "boolean",
    },
    delay: {
      control: "number",
    },
    closeDelay: {
      control: "boolean",
    },
    className: {
      control: "text",
    },
    isOpen: {
      control: "boolean",
    },
    defaultOpen: {
      control: "boolean",
    },
  },
} satisfies Meta<typeof TooltipComponent>;

export default meta;

type Story = StoryObj<typeof meta> & IPreviewArgs;

const body = within(document.body);

/** The focusable wrapper rendered by the tooltip around its children. */
const getTrigger = (canvasElement: HTMLElement) =>
  canvasElement.querySelector('[role="button"][tabindex]') as HTMLElement;

const waitForHidden = waitForTooltipHidden;

export const Tooltip: Story = {
  args: {
    themeUI: "light",
    backgroundUI: "light",
    children: <Tag active text="Hover me, I'm a tag" />,
    text: "Tooltip Text",
  },
  play: async ({ canvasElement, step }) => {
    const trigger = getTrigger(canvasElement);
    await expect(body.queryByRole("tooltip")).not.toBeInTheDocument();

    await step("hovering shows the tooltip", async () => {
      // react-aria opens tooltips instantly for 500 ms after another one
      // closed; waiting that out makes this hover exercise `delay` itself
      await new Promise((resolve) => setTimeout(resolve, 600));
      // the default `delay` is 0: one hover opens the tooltip within
      // HOVER_REVEAL_TIMEOUT_MS
      const tooltip = await hoverForTooltip(userEvent, trigger);
      await expect(tooltip).toHaveTextContent("Tooltip Text");
      await expect(trigger).toHaveAttribute("aria-describedby", tooltip.id);
    });

    await step("moving the pointer away hides it", async () => {
      await userEvent.unhover(trigger);
      await waitForHidden();
      await expect(trigger).not.toHaveAttribute("aria-describedby");
    });

    await step("keyboard focus shows it and Escape hides it", async () => {
      await userEvent.tab();
      await expect(trigger).toHaveFocus();
      await expect(await body.findByRole("tooltip")).toHaveTextContent(
        "Tooltip Text",
      );
      await userEvent.keyboard("{Escape}");
      await waitForHidden();
    });
  },
};

export const OpenTooltip: Story = {
  args: {
    themeUI: "light",
    backgroundUI: "light",
    children: <Tag active text="Hover me, I'm a tag" />,
    text: "I will always display",
    isOpen: true,
  },
  play: async ({ canvasElement }) => {
    // controlled open state: visible without any interaction
    const tooltip = await body.findByRole("tooltip");
    await expect(tooltip).toHaveTextContent("I will always display");
    await expect(getTrigger(canvasElement)).toHaveAttribute(
      "aria-describedby",
      tooltip.id,
    );
    // ...and it stays open when the pointer leaves
    await userEvent.unhover(getTrigger(canvasElement));
    await expect(body.getByRole("tooltip")).toBeInTheDocument();
    // left open: the axe check covers the tooltip once it is fully shown
    await waitForAnimations(document.body);
  },
};

export const BottomPlacement: Story = {
  args: {
    ...OpenTooltip.args,
    text: "Below the trigger",
    place: "bottom",
    small: true,
  },
  play: async () => {
    const tooltip = await body.findByRole("tooltip");
    await expect(tooltip).toHaveAttribute("data-placement", "bottom");
    await expect(within(tooltip).getByText("Below the trigger")).toHaveClass(
      "text-center",
    );
    await waitForAnimations(document.body);
  },
};

export const DisabledTooltip: Story = {
  args: {
    ...Tooltip.args,
    isDisabled: true,
  },
  play: async ({ canvasElement }) => {
    const trigger = getTrigger(canvasElement);
    await mouseHover(userEvent, trigger);
    await userEvent.tab();
    // give a (wrongly) opening tooltip the chance to appear
    await new Promise((resolve) => setTimeout(resolve, 100));
    await expect(body.queryByRole("tooltip")).not.toBeInTheDocument();
    await userEvent.unhover(trigger);
  },
};
