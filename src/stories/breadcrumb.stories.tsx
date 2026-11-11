import type { Meta, StoryObj } from "@storybook/react";
import { expect, fn, userEvent, within } from "@storybook/test";

import { IPreviewArgs } from "./utils";

import BreadcrumbComponent from "../lib/breadcrumb";
import { a11yExceptions } from "./a11y";
import { PRIMARY_BLUE_TEXT_LIGHT, SECONDARY_TEXT_LIGHT } from "./a11y-defects";

const meta = {
  component: BreadcrumbComponent,
  title: "Pagination/Breadcrumb",
  tags: ["autodocs"],
  args: {
    callback: fn(),
  },
  argTypes: {
    variant: {
      options: ["primary", "secondary"],
      control: { type: "radio" },
    },
    clickable: {
      control: "boolean",
    },
    as: {
      options: ["div", "nav"],
      control: { type: "radio" },
    },
  },
} satisfies Meta<typeof BreadcrumbComponent>;

export default meta;

type Story = StoryObj<typeof meta> & IPreviewArgs;

export const Breadcrumb: Story = {
  parameters: a11yExceptions(PRIMARY_BLUE_TEXT_LIGHT),
  args: {
    variant: "primary",
    themeUI: "dark",
    backgroundUI: "light",
    items: [
      { text: "General Court", value: 0 },
      { text: "Blockchain", value: 1 },
      { text: "Non-Technical", value: 2 },
    ],
    clickable: false,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // every item except the last one is a button
    const buttons = canvas.getAllByRole("button");
    await expect(buttons.map((b) => b.textContent)).toEqual([
      "General Court",
      "Blockchain",
    ]);
    const current = canvas.getByText("Non-Technical");
    await expect(current.closest("button")).toBeNull();
    await expect(current).toHaveClass("font-semibold");
    await expect(canvas.getAllByText("/")).toHaveLength(2);
    // not clickable: text cursor
    await expect(buttons[0]).toHaveClass("cursor-text");
    // the last item is the current page; the markup is a plain div
    await expect(current).toHaveAttribute("aria-current", "page");
    await expect(canvas.queryAllByRole("link")).toHaveLength(0);
    await expect(canvas.queryByRole("navigation")).not.toBeInTheDocument();
    await expect(buttons[0].closest("div")?.tagName).toBe("DIV");
  },
};

/** With `clickable`, pressing an item calls `callback` with that item's `value`. */
export const ClickableBreadcrumb: Story = {
  parameters: a11yExceptions(SECONDARY_TEXT_LIGHT),
  args: {
    ...Breadcrumb.args,
    variant: "secondary",
    clickable: true,
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const blockchain = canvas.getByRole("button", { name: "Blockchain" });
    await expect(blockchain).toHaveClass("cursor-pointer");

    await userEvent.click(blockchain);
    await expect(args.callback).toHaveBeenCalledTimes(1);
    await expect(args.callback).toHaveBeenLastCalledWith(1);

    // keyboard: Tab to the first crumb and press Enter
    blockchain.blur();
    await userEvent.tab();
    await expect(
      canvas.getByRole("button", { name: "General Court" }),
    ).toHaveFocus();
    await userEvent.keyboard("{Enter}");
    await expect(args.callback).toHaveBeenLastCalledWith(0);
    await expect(args.callback).toHaveBeenCalledTimes(2);
  },
};

/** An item with `href` is a link; the last item is the current page, never a link. */
export const LinkBreadcrumb: Story = {
  parameters: a11yExceptions(SECONDARY_TEXT_LIGHT),
  args: {
    ...Breadcrumb.args,
    variant: "secondary",
    clickable: true,
    items: [
      { text: "General Court", value: 0, href: "#general-court" },
      { text: "Blockchain", value: 1, href: "#blockchain" },
      { text: "Non-Technical", value: 2, href: "#non-technical" },
    ],
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const links = canvas.getAllByRole("link");
    await expect(links.map((link) => link.getAttribute("href"))).toEqual([
      "#general-court",
      "#blockchain",
    ]);
    await expect(canvas.queryAllByRole("button")).toHaveLength(0);
    const current = canvas.getByText("Non-Technical");
    await expect(current.closest("a")).toBeNull();
    await expect(current).toHaveAttribute("aria-current", "page");
    await expect(links[0]).not.toHaveAttribute("aria-current");

    // keep the test page in place: following the href navigates the runner away
    canvasElement.addEventListener("click", (event) => event.preventDefault());
    await userEvent.click(links[1]);
    await expect(args.callback).toHaveBeenCalledTimes(1);
    await expect(args.callback).toHaveBeenLastCalledWith(1);
  },
};

/** With `as="nav"`, the breadcrumb is a named navigation landmark. */
export const NavBreadcrumb: Story = {
  parameters: a11yExceptions(PRIMARY_BLUE_TEXT_LIGHT),
  args: {
    ...Breadcrumb.args,
    as: "nav",
    "aria-label": "Case path",
  },
  play: async ({ canvasElement }) => {
    const nav = within(canvasElement).getByRole("navigation", {
      name: "Case path",
    });
    await expect(nav.tagName).toBe("NAV");
    await expect(nav).toHaveTextContent("Non-Technical");
  },
};

/** The landmark name defaults to "Breadcrumb". */
export const NavBreadcrumbDefaultName: Story = {
  parameters: a11yExceptions(PRIMARY_BLUE_TEXT_LIGHT),
  args: {
    ...Breadcrumb.args,
    as: "nav",
  },
  play: async ({ canvasElement }) => {
    await expect(
      within(canvasElement).getByRole("navigation", { name: "Breadcrumb" }),
    ).toBeInTheDocument();
  },
};
