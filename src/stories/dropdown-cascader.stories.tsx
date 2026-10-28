import React, { useState } from "react";
import type { Key } from "react-aria-components";
import type { Meta, StoryObj } from "@storybook/react";
import { expect, fn, userEvent, waitFor, within } from "@storybook/test";

import { IPreviewArgs, expectTruncated, waitForAnimations } from "./utils";

import DropdownCascaderComponent from "../lib/dropdown/cascader";
import { Form } from "react-aria-components";
import { Button } from "../lib";
import { a11yExceptions } from "./a11y";
import {
  PRIMARY_BLUE_TEXT_LIGHT,
  SECONDARY_TEXT_LIGHT,
  WHITE_ON_BLUE_LIGHT,
} from "./a11y-defects";

const meta = {
  component: DropdownCascaderComponent,
  title: "Dropdown/Cascader",
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

const findTrigger = (canvasElement: HTMLElement) => {
  const trigger = within(canvasElement)
    .getAllByRole("button")
    .find((button) => button.hasAttribute("aria-haspopup"));
  if (!trigger) throw new Error("cascader trigger not found");
  return trigger;
};

const closeTree = async () => {
  await userEvent.click(document.body);
  await waitForClose();
};

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
  parameters: a11yExceptions(WHITE_ON_BLUE_LIGHT),
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
  parameters: a11yExceptions(WHITE_ON_BLUE_LIGHT),
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

/** Controlled cascader: the parent owns `selectedKey` and can change it from outside. */
export const ControlledSelectedKey: Story = {
  parameters: a11yExceptions(PRIMARY_BLUE_TEXT_LIGHT),
  args: {
    ...DropdownCascader.args,
  },
  render: function Render(args) {
    const [selectedKey, setSelectedKey] = useState<Key | null>(1);
    return (
      <div className="flex flex-col gap-4">
        <DropdownCascaderComponent
          {...args}
          selectedKey={selectedKey}
          onSelectionChange={setSelectedKey}
        />
        <Button
          small
          variant="secondary"
          text="Pick Non-technical"
          onPress={() => setSelectedKey(3)}
        />
        <Button
          small
          variant="secondary"
          text="Pick Marketing Services"
          onPress={() => setSelectedKey(5)}
        />
      </div>
    );
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    const trigger = findTrigger(canvasElement);
    await expect(trigger).toHaveTextContent("Blockchain");

    await step("the mounted key is highlighted", async () => {
      const tree = await openTree(trigger);
      await waitFor(() => expect(row(tree, "Blockchain")).toBeVisible());
      await expect(row(tree, "Blockchain")).toHaveAttribute(
        "aria-selected",
        "true",
      );
      await closeTree();
    });

    await step("an external change moves the highlight", async () => {
      await userEvent.click(
        canvas.getByRole("button", { name: "Pick Non-technical" }),
      );
      await waitFor(() => expect(trigger).toHaveTextContent("Non-technical"));
      const tree = await openTree(trigger);
      await waitFor(() => expect(row(tree, "Non-technical")).toBeVisible());
      await expect(row(tree, "Non-technical")).toHaveAttribute(
        "aria-selected",
        "true",
      );
      await expect(row(tree, "Blockchain")).not.toHaveAttribute(
        "aria-selected",
        "true",
      );
      await closeTree();
    });

    await step("a second external change moves it again", async () => {
      await userEvent.click(
        canvas.getByRole("button", { name: "Pick Marketing Services" }),
      );
      await waitFor(() =>
        expect(trigger).toHaveTextContent("Marketing Services"),
      );
      const tree = await openTree(trigger);
      await waitFor(() =>
        expect(row(tree, "Marketing Services")).toBeVisible(),
      );
      await expect(row(tree, "Marketing Services")).toHaveAttribute(
        "aria-selected",
        "true",
      );
      await expect(
        tree.queryByRole("row", {
          name: (name: string) => name.startsWith("Non-technical"),
          selected: true,
        }),
      ).toBeNull();
      await expect(row(tree, "Blockchain")).not.toHaveAttribute(
        "aria-selected",
        "true",
      );
      await closeTree();
    });
  },
};

/** Uncontrolled cascader: a user selection replaces the default key in both the label and the tree. */
export const UncontrolledUserSelection: Story = {
  args: {
    ...DropdownCascader.args,
    defaultSelectedKey: 1,
  },
  play: async ({ canvasElement, args, step }) => {
    const trigger = findTrigger(canvasElement);
    await expect(trigger).toHaveTextContent("Blockchain");

    await step("the default key is highlighted on open", async () => {
      const tree = await openTree(trigger);
      await waitFor(() => expect(row(tree, "Blockchain")).toBeVisible());
      await expect(row(tree, "Blockchain")).toHaveAttribute(
        "aria-selected",
        "true",
      );
      await waitFor(() => expect(row(tree, "Non-technical")).toBeVisible());
      await userEvent.click(row(tree, "Non-technical"));
      await userEvent.click(
        await tree.findByRole("button", { name: /Select\s+Non-technical/ }),
      );
      await waitForClose();
    });

    await step("the user selection updates label and tree", async () => {
      await expect(args.callback).toHaveBeenCalledWith(
        expect.objectContaining({ id: 3 }),
      );
      await expect(trigger).toHaveTextContent("Non-technical");
      const tree = await openTree(trigger);
      await waitFor(() => expect(row(tree, "Non-technical")).toBeVisible());
      await expect(row(tree, "Non-technical")).toHaveAttribute(
        "aria-selected",
        "true",
      );
      await expect(row(tree, "Blockchain")).not.toHaveAttribute(
        "aria-selected",
        "true",
      );
      await closeTree();
    });
  },
};

/** The accessible name comes from `aria-label`, a visible `label`, or `aria-labelledby`; "Select" is the fallback. */
export const AccessibleName: Story = {
  parameters: a11yExceptions(SECONDARY_TEXT_LIGHT),
  args: {
    themeUI: "dark",
    backgroundUI: "light",
    items: [{ label: "General Court", id: 0, itemValue: 0 }],
    placeholder: "Pick one",
  },
  render: (args) => (
    <div className="flex flex-col gap-4">
      <div data-testid="aria-label">
        <DropdownCascaderComponent {...args} aria-label="Court" />
      </div>
      <div data-testid="label">
        <DropdownCascaderComponent {...args} label="Jurisdiction" />
      </div>
      <div data-testid="labelledby">
        <span
          id="cascader-external-name"
          className="text-klerosUIComponentsPrimaryText"
        >
          Appeal court
        </span>
        <DropdownCascaderComponent
          {...args}
          aria-labelledby="cascader-external-name"
        />
      </div>
      <div data-testid="fallback">
        <DropdownCascaderComponent {...args} />
      </div>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = (id: string) =>
      within(canvas.getByTestId(id)).getByRole("button");

    await expect(trigger("aria-label")).toHaveAccessibleName(/\bCourt\b/);
    await expect(trigger("aria-label")).not.toHaveAccessibleName(/\bSelect\b/);

    await expect(trigger("label")).toHaveAccessibleName(/\bJurisdiction\b/);
    await expect(trigger("label")).not.toHaveAccessibleName(/\bSelect\b/);
    await expect(trigger("label")).not.toHaveAccessibleName(
      /Jurisdiction.*Jurisdiction/,
    );

    await expect(trigger("labelledby")).toHaveAccessibleName(
      /\bAppeal court\b/,
    );
    await expect(trigger("labelledby")).not.toHaveAccessibleName(/\bSelect\b/);

    await expect(trigger("fallback")).toHaveAccessibleName(/\bSelect\b/);
  },
};

/**
 * A long label stays on one line inside the button, cut with an ellipsis.
 * `buttonClassName` sizes the trigger.
 */
export const LongLabel: Story = {
  args: {
    themeUI: "dark",
    backgroundUI: "light",
    items: [
      {
        label: "A very long court name that does not fit in the button",
        itemValue: 1,
        id: 1,
      },
    ],
    defaultSelectedKey: 1,
  },
  render: (args) => (
    <div className="flex flex-col gap-6">
      <div data-testid="default">
        <DropdownCascaderComponent {...args} aria-label="Default" />
      </div>
      <div data-testid="full" className="w-100">
        <DropdownCascaderComponent
          {...args}
          aria-label="Full"
          buttonClassName="w-full"
        />
      </div>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = (id: string) => findTrigger(canvas.getByTestId(id));

    await expect(trigger("default").getBoundingClientRect().width).toBe(240);
    await expectTruncated(trigger("default"));
    await expect(trigger("default")).toHaveAccessibleName(
      /A very long court name that does not fit in the button/,
    );
    await expect(trigger("full").getBoundingClientRect().width).toBe(400);
  },
};
