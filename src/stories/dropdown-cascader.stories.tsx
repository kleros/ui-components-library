import React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { expect, fn, userEvent, waitFor, within } from "@storybook/test";

import { IPreviewArgs, waitForAnimations } from "./utils";

import DropdownCascaderComponent from "../lib/dropdown/cascader";
import { Form } from "react-aria-components";
import { Button } from "../lib";
import { a11yExceptions } from "./a11y";
import { WHITE_ON_BLUE_LIGHT } from "./a11y-defects";

const meta = {
  component: DropdownCascaderComponent,
  title: "Dropdown/Cascader",
  parameters: a11yExceptions(WHITE_ON_BLUE_LIGHT),
  tags: ["autodocs"],
  args: {
    callback: fn(),
  },
  argTypes: {
    isRequired: {
      control: "boolean",
    },
    isDisabled: {
      control: "boolean",
    },
    label: {
      control: "text",
    },
  },
} satisfies Meta<typeof DropdownCascaderComponent>;

export default meta;

type Story = StoryObj<typeof meta> & IPreviewArgs;

const body = within(document.body);

/** Opens the cascader and returns its tree (rendered in a popover). */
const openTree = async (trigger: HTMLElement) => {
  await userEvent.click(trigger);
  const dialog = await body.findByRole("dialog", { name: "dropdown-dialog" });
  return within(dialog);
};

const row = (tree: ReturnType<typeof within>, name: string) =>
  // row names also include the children count, e.g. "Blockchain3"
  tree.getByRole("row", {
    name: (accessibleName: string) => accessibleName.startsWith(name),
  });

const waitForClose = () =>
  waitFor(() => expect(body.queryByRole("dialog")).not.toBeInTheDocument());

export const DropdownCascader: Story = {
  args: {
    themeUI: "dark",
    backgroundUI: "light",
    items: [
      {
        label: "General Court",
        id: 0,
        itemValue: 0,
        children: [
          {
            label: "Blockchain",
            id: 1,
            itemValue: 1,
            children: [
              {
                label: "Technical",
                id: 2,
                itemValue: 2,
              },
              {
                label: "Non-technical",
                id: 3,
                itemValue: 3,
              },
              {
                label: "Other",
                id: 4,
                itemValue: 4,
              },
            ],
          },
          {
            label: "Marketing Services",
            id: 5,
            itemValue: 5,
          },
        ],
      },
    ],
    placeholder: "Select a value",
  },
  play: async ({ canvasElement, args, step }) => {
    const trigger = within(canvasElement).getByRole("button");
    await expect(trigger).toHaveTextContent("Select a value");
    const tree = await openTree(trigger);
    await expect(tree.getByRole("treegrid")).toBeInTheDocument();
    const confirm = tree.getByRole("button", { name: "No Selection" });
    await expect(confirm).toBeDisabled();
    // only the root level is visible initially
    await expect(tree.queryByRole("row", { name: /^Blockchain/ })).toBeNull();

    await step("selecting a parent expands its children", async () => {
      await userEvent.click(row(tree, "General Court"));
      await expect(row(tree, "General Court")).toHaveAttribute(
        "aria-expanded",
        "true",
      );
      await waitFor(() => expect(row(tree, "Blockchain")).toBeVisible());
      await expect(row(tree, "Marketing Services")).toBeVisible();
      await userEvent.click(row(tree, "Blockchain"));
      await waitFor(() => expect(row(tree, "Technical")).toBeVisible());
      await expect(row(tree, "Blockchain")).toHaveAttribute(
        "aria-selected",
        "true",
      );
    });

    await step("selecting a leaf enables the confirm button", async () => {
      await userEvent.click(row(tree, "Non-technical"));
      await waitFor(() =>
        expect(row(tree, "Non-technical")).toHaveAttribute(
          "aria-selected",
          "true",
        ),
      );
      const select = await tree.findByRole("button", {
        name: /Select\s+Non-technical/,
      });
      await expect(select).toBeEnabled();
      await expect(args.callback).not.toHaveBeenCalled();
      await userEvent.click(select);
    });

    await step("confirming reports the item and closes", async () => {
      await expect(args.callback).toHaveBeenCalledTimes(1);
      await expect(args.callback).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 3,
          itemValue: 3,
          label: "Non-technical",
        }),
      );
      await waitForClose();
      await expect(trigger).toHaveTextContent("Non-technical");
    });
  },
};
/** Dropdown Cascader with a default key selected. */
export const DefaultValueSelected: Story = {
  args: {
    ...DropdownCascader.args,
    defaultSelectedKey: 1,
  },
  play: async ({ canvasElement, args }) => {
    const trigger = within(canvasElement).getByRole("button");
    await expect(trigger).toHaveTextContent("Blockchain");
    const tree = await openTree(trigger);
    // the path to the default key is expanded
    await waitFor(() =>
      expect(row(tree, "Blockchain")).toHaveAttribute("aria-expanded", "true"),
    );
    await expect(row(tree, "Blockchain")).toHaveAttribute(
      "aria-selected",
      "true",
    );
    await expect(row(tree, "Technical")).toBeVisible();
    // clicking outside closes without reporting a selection
    await userEvent.click(document.body);
    await waitForClose();
    await expect(args.callback).not.toHaveBeenCalled();
  },
};

/** An iterable can be passed to mark keys as disabled. */
export const DisabledKeysSelect: Story = {
  args: {
    ...DropdownCascader.args,
    defaultSelectedKey: 1,
    disabledKeys: [2, 5],
  },
  play: async ({ canvasElement, args }) => {
    const trigger = within(canvasElement).getByRole("button");
    const tree = await openTree(trigger);
    await waitFor(() => expect(row(tree, "Technical")).toBeVisible());
    await expect(row(tree, "Technical")).toHaveAttribute(
      "aria-disabled",
      "true",
    );
    await expect(row(tree, "Marketing Services")).toHaveAttribute(
      "aria-disabled",
      "true",
    );
    await expect(row(tree, "Other")).not.toHaveAttribute("aria-disabled");
    await userEvent.click(row(tree, "Technical"));
    await expect(row(tree, "Technical")).not.toHaveAttribute(
      "aria-selected",
      "true",
    );
    await userEvent.click(row(tree, "Other"));
    await userEvent.click(
      await tree.findByRole("button", { name: /Select\s+Other/ }),
    );
    await expect(args.callback).toHaveBeenCalledWith(
      expect.objectContaining({ id: 4 }),
    );
    await waitForClose();
  },
};

/** When used with Form, Dropdown Cacader can be marked as `required` to prevent form submission. */
export const RequiredSelect: Story = {
  args: {
    ...DropdownCascader.args,
    isRequired: true,
  },
  render: (args) => (
    <Form
      onSubmit={(e) => {
        e.preventDefault();
      }}
    >
      <DropdownCascaderComponent {...args} />
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
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole("button", { name: /Select a value/ });
    await userEvent.click(canvas.getByRole("button", { name: "Click me!" }));
    await waitFor(() =>
      expect(trigger.closest("[data-invalid]")).toBeInTheDocument(),
    );
    const tree = await openTree(trigger);
    await userEvent.click(row(tree, "General Court"));
    await waitFor(() => expect(row(tree, "Marketing Services")).toBeVisible());
    await userEvent.click(row(tree, "Marketing Services"));
    await userEvent.click(
      await tree.findByRole("button", { name: /Select\s+Marketing Services/ }),
    );
    await waitForClose();
    await expect(trigger).toHaveTextContent("Marketing Services");
    await waitFor(() =>
      expect(trigger.closest("[data-invalid]")).not.toBeInTheDocument(),
    );
  },
};

/** The cascader left open, so its (portaled) tree is covered by the a11y check. */
export const OpenCascader: Story = {
  args: {
    ...DropdownCascader.args,
    defaultSelectedKey: 3,
    disabledKeys: [5],
    defaultOpen: true,
  },
  play: async () => {
    const dialog = await body.findByRole("dialog", { name: "dropdown-dialog" });
    const tree = within(dialog);
    // the path to the selected key is expanded
    await waitFor(() => expect(row(tree, "Non-technical")).toBeVisible());
    await expect(row(tree, "Non-technical")).toHaveAttribute(
      "aria-selected",
      "true",
    );
    await expect(row(tree, "Marketing Services")).toHaveAttribute(
      "aria-disabled",
      "true",
    );
    await expect(
      tree.getByRole("button", { name: /Select\s+Non-technical/ }),
    ).toBeEnabled();
    await waitForAnimations(document.body);
  },
};
