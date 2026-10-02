import React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { expect, userEvent, within } from "@storybook/test";

import { IPreviewArgs, disableA11yRules } from "./utils";

import CustomAccordion from "../lib/accordion/custom";
import Button from "../lib/button/index";

const meta = {
  component: CustomAccordion,
  title: "CustomAccordion",
  tags: ["autodocs"],
  // Pre-existing component issue: custom `expandButton`s are rendered inside
  // the item's header, which is itself a button (nested interactive controls).
  parameters: disableA11yRules("nested-interactive"),
} satisfies Meta<typeof CustomAccordion>;

export default meta;

type Story = StoryObj<typeof meta> & IPreviewArgs;

const getHeaders = (canvasElement: HTMLElement) =>
  within(canvasElement).getAllByRole("button", { name: /^How it works\?/ });

/** CustomAccordion provides the ability to render custom title, body and expandButton. */
export const Accordion: Story = {
  args: {
    className: "max-w-[80dvw]",

    items: [
      {
        title: (
          <div className="text-klerosUIComponentsPrimaryText font-semibold">
            How it works?
          </div>
        ),
        body: (
          <small className="text-klerosUIComponentsPrimaryText">
            {"hello\nhello\n\n\n\n\nhello"}
          </small>
        ),
        expandButton: ({ expanded, toggle }) => {
          return expanded ? (
            <Button text="Close" variant="secondary" onPress={toggle} />
          ) : (
            <Button text="Expand" onPress={toggle} />
          );
        },
      },
      {
        title: (
          <div className="text-klerosUIComponentsPrimaryText font-semibold">
            How it works?
          </div>
        ),
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
    const [first, second] = getHeaders(canvasElement);
    await expect(first).toHaveAttribute("aria-expanded", "false");

    await step("the custom expand button toggles its item", async () => {
      await userEvent.click(canvas.getByRole("button", { name: "Expand" }));
      await expect(first).toHaveAttribute("aria-expanded", "true");
      // the render prop receives the new `expanded` state
      const close = canvas.getByRole("button", { name: "Close" });
      await expect(
        canvas.queryByRole("button", { name: "Expand" }),
      ).not.toBeInTheDocument();
      await userEvent.click(close);
      await expect(first).toHaveAttribute("aria-expanded", "false");
    });

    await step("items without expandButton use the default icon", async () => {
      await expect(within(second).queryByRole("button")).toBeNull();
      await expect(second.querySelector("svg")).toBeInTheDocument();
      await userEvent.click(second);
      await expect(second).toHaveAttribute("aria-expanded", "true");
      await expect(first).toHaveAttribute("aria-expanded", "false");
    });
  },
};

/** You can provide an expand button at Parent level for all Accordion Items */
export const GlobalExpandButton: Story = {
  args: {
    className: "max-w-[80dvw]",

    items: [
      {
        title: (
          <div className="text-klerosUIComponentsPrimaryText font-semibold">
            How it works?
          </div>
        ),
        body: (
          <small className="text-klerosUIComponentsPrimaryText">
            {"hello\nhello\n\n\n\n\nhello"}
          </small>
        ),
      },
      {
        title: (
          <div className="text-klerosUIComponentsPrimaryText font-semibold">
            How it works?
          </div>
        ),
        body: (
          <small className="text-klerosUIComponentsPrimaryText">hello</small>
        ),
      },
    ],
    expandButton: ({ expanded, toggle }) => {
      return expanded ? (
        <Button text="Close" variant="secondary" onPress={toggle} />
      ) : (
        <Button text="Expand" onPress={toggle} />
      );
    },
    themeUI: "dark",
    backgroundUI: "light",
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const [first, second] = getHeaders(canvasElement);
    // the parent-level expandButton is used by every item
    const expandButtons = canvas.getAllByRole("button", { name: "Expand" });
    await expect(expandButtons).toHaveLength(2);
    await expect(within(second).getByRole("button")).toBe(expandButtons[1]);

    await userEvent.click(expandButtons[1]);
    await expect(second).toHaveAttribute("aria-expanded", "true");
    await expect(first).toHaveAttribute("aria-expanded", "false");
    await expect(within(second).getByRole("button")).toHaveTextContent("Close");
    await expect(within(first).getByRole("button")).toHaveTextContent("Expand");

    // keyboard: the nested button is focusable and toggles with Enter
    within(first).getByRole("button").focus();
    await userEvent.keyboard("{Enter}");
    await expect(first).toHaveAttribute("aria-expanded", "true");
    await expect(second).toHaveAttribute("aria-expanded", "false");
  },
};

/** Parent Expand Button can be ovverrided at Item level if required */
export const ItemExpandButton: Story = {
  args: {
    className: "max-w-[80dvw]",

    items: [
      {
        title: (
          <div className="text-klerosUIComponentsPrimaryText font-semibold">
            How it works?
          </div>
        ),
        body: (
          <small className="text-klerosUIComponentsPrimaryText">
            {"hello\nhello\n\n\n\n\nhello"}
          </small>
        ),
        expandButton: ({ expanded, toggle }) => {
          return expanded ? (
            <Button text="Item Close" variant="secondary" onPress={toggle} />
          ) : (
            <Button text="Item Expand" onPress={toggle} />
          );
        },
      },
      {
        title: (
          <div className="text-klerosUIComponentsPrimaryText font-semibold">
            How it works?
          </div>
        ),
        body: (
          <small className="text-klerosUIComponentsPrimaryText">hello</small>
        ),
      },
    ],
    expandButton: ({ expanded, toggle }) => {
      return expanded ? (
        <Button text="Close" variant="secondary" onPress={toggle} />
      ) : (
        <Button text="Expand" onPress={toggle} />
      );
    },
    themeUI: "dark",
    backgroundUI: "light",
  },
  play: async ({ canvasElement }) => {
    const [first, second] = getHeaders(canvasElement);
    // the item-level button overrides the parent-level one
    await expect(within(first).getByRole("button")).toHaveTextContent(
      "Item Expand",
    );
    await expect(within(second).getByRole("button")).toHaveTextContent(
      /^Expand$/,
    );
    await userEvent.click(within(first).getByRole("button"));
    await expect(first).toHaveAttribute("aria-expanded", "true");
    await expect(within(first).getByRole("button")).toHaveTextContent(
      "Item Close",
    );
  },
};
