import React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { expect, userEvent, waitFor, within } from "@storybook/test";

import { IPreviewArgs } from "./utils";

import AccordionComponent from "../lib/accordion/index";

const meta = {
  component: AccordionComponent,
  title: "Accordion",
  tags: ["autodocs"],
} satisfies Meta<typeof AccordionComponent>;

export default meta;

type Story = StoryObj<typeof meta> & IPreviewArgs;

/** Inline height of the collapsible body that follows an accordion header. */
const bodyHeight = (header: HTMLElement) =>
  (header.nextElementSibling as HTMLElement).style.height;

export const Accordion: Story = {
  args: {
    className: "max-w-[80dvw]",

    items: [
      {
        title: "How it works?",
        body: (
          <small className="text-klerosUIComponentsPrimaryText">
            {"hello\nhello\n\n\n\n\nhello"}
          </small>
        ),
      },
      {
        title: "How it works?",
        body: (
          <small className="text-klerosUIComponentsPrimaryText">hello</small>
        ),
      },
    ],

    themeUI: "dark",
    backgroundUI: "light",
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    const [first, second] = canvas.getAllByRole("button", {
      name: "How it works?",
    });

    await step("all items start collapsed", async () => {
      await expect(first).toHaveAttribute("aria-expanded", "false");
      await expect(second).toHaveAttribute("aria-expanded", "false");
      // collapsed body wrappers have zero height
      await expect(bodyHeight(first)).toBe("0px");
    });

    await step("clicking an item expands only that item", async () => {
      await userEvent.click(first);
      await expect(first).toHaveAttribute("aria-expanded", "true");
      await expect(second).toHaveAttribute("aria-expanded", "false");
      // the body wrapper animates to the measured content height
      await waitFor(() => expect(bodyHeight(first)).toMatch(/^[1-9][\d.]*px$/));
    });

    await step(
      "expanding another item collapses the previous one",
      async () => {
        await userEvent.click(second);
        await expect(first).toHaveAttribute("aria-expanded", "false");
        await expect(second).toHaveAttribute("aria-expanded", "true");
      },
    );

    await step("clicking an expanded item collapses it", async () => {
      await userEvent.click(second);
      await expect(second).toHaveAttribute("aria-expanded", "false");
    });

    await step("items can be toggled with the keyboard", async () => {
      first.focus();
      await userEvent.keyboard("{Enter}");
      await expect(first).toHaveAttribute("aria-expanded", "true");
      await userEvent.tab();
      await expect(second).toHaveFocus();
      await userEvent.keyboard(" ");
      await expect(second).toHaveAttribute("aria-expanded", "true");
      await expect(first).toHaveAttribute("aria-expanded", "false");
    });
  },
};

/** `defaultExpanded` opens an item on mount (uncontrolled). */
export const DefaultExpanded: Story = {
  args: {
    ...Accordion.args,
    defaultExpanded: 1,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const [first, second] = canvas.getAllByRole("button", {
      name: "How it works?",
    });
    await expect(first).toHaveAttribute("aria-expanded", "false");
    await expect(second).toHaveAttribute("aria-expanded", "true");
    await userEvent.click(second);
    await expect(second).toHaveAttribute("aria-expanded", "false");
  },
};
