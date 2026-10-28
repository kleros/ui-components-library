import React, { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { expect, fn, userEvent, waitFor, within } from "@storybook/test";

import { IPreviewArgs, expectTruncated, waitForAnimations } from "./utils";

import SelectComponent from "../lib/dropdown/select";
import { Form, type Key } from "react-aria-components";
import { Button } from "../lib";
import Telegram from "../assets/svgs/telegram.svg";
import { a11yExceptions, auditA11y } from "./a11y";
import {
  ERROR_TEXT_LIGHT,
  SECONDARY_TEXT_LIGHT,
  SELECT_VALUE_LIGHT,
  WHITE_ON_BLUE_LIGHT,
} from "./a11y-defects";

const meta = {
  component: SelectComponent,
  title: "Dropdown/Select",
  tags: ["autodocs"],
  args: {
    callback: fn(),
  },
  argTypes: {
    smallButton: {
      control: "boolean",
    },
    simpleButton: {
      control: "boolean",
    },
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
} satisfies Meta<typeof SelectComponent>;

export default meta;

type Story = StoryObj<typeof meta> & IPreviewArgs;

const body = within(document.body);

/** Opens the select by clicking its trigger and returns the listbox. */
const openListbox = async (trigger: HTMLElement) => {
  await userEvent.click(trigger);
  const listbox = await body.findByRole("listbox");
  await expect(trigger).toHaveAttribute("aria-expanded", "true");
  return listbox;
};

const waitForClose = () =>
  waitFor(() => expect(body.queryByRole("listbox")).not.toBeInTheDocument());

export const Select: Story = {
  parameters: a11yExceptions(SECONDARY_TEXT_LIGHT),
  args: {
    themeUI: "dark",
    backgroundUI: "light",
    items: [
      { text: "hello 1", dot: "red", itemValue: 1, id: 1 },
      { text: "hello 2", dot: "blue", itemValue: 2, id: 2 },
      { text: "hello 3", dot: "blue", itemValue: 3, id: 3 },
      { text: "hello 4", dot: "blue", itemValue: 4, id: 4 },
      { text: "hello 5", dot: "blue", itemValue: 5, id: 5 },
    ],
    placeholder: "Select a value",
  },
  play: async ({ canvasElement, args, step, ...context }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole("button");
    await expect(trigger).toHaveTextContent("Select a value");
    await expect(trigger).toHaveAttribute("aria-haspopup", "listbox");
    await expect(trigger).toHaveAttribute("aria-expanded", "false");
    await auditA11y(context, "resting");

    await step("selecting an option with the mouse", async () => {
      const listbox = await openListbox(trigger);
      const options = within(listbox).getAllByRole("option");
      await expect(options.map((o) => o.textContent)).toEqual([
        "hello 1",
        "hello 2",
        "hello 3",
        "hello 4",
        "hello 5",
      ]);
      await auditA11y(context, "open");
      await userEvent.click(
        within(listbox).getByRole("option", { name: "hello 3" }),
      );
      await waitForClose();
      await expect(trigger).toHaveTextContent("hello 3");
      await expect(args.callback).toHaveBeenCalledTimes(1);
      await expect(args.callback).toHaveBeenLastCalledWith(
        expect.objectContaining({ id: 3, itemValue: 3, text: "hello 3" }),
      );
    });

    await step("keyboard: open, navigate and select", async () => {
      trigger.focus();
      await userEvent.keyboard("{ArrowDown}");
      const listbox = await body.findByRole("listbox");
      // the selected option receives focus
      await expect(
        within(listbox).getByRole("option", { name: "hello 3" }),
      ).toHaveAttribute("aria-selected", "true");
      await userEvent.keyboard("{ArrowDown}{Enter}");
      await waitForClose();
      await expect(trigger).toHaveTextContent("hello 4");
      await expect(args.callback).toHaveBeenLastCalledWith(
        expect.objectContaining({ id: 4 }),
      );
    });

    await step("Escape closes without changing the value", async () => {
      await openListbox(trigger);
      await userEvent.keyboard("{Escape}");
      await waitForClose();
      await expect(trigger).toHaveTextContent("hello 4");
      await expect(args.callback).toHaveBeenCalledTimes(2);
    });
  },
};
/** Select with a default key selected. */
export const DefaultValueSelect: Story = {
  args: {
    ...Select.args,
    defaultSelectedKey: 1,
  },
  play: async ({ canvasElement, args }) => {
    const trigger = within(canvasElement).getByRole("button");
    await expect(trigger).toHaveTextContent("hello 1");
    const listbox = await openListbox(trigger);
    await expect(
      within(listbox).getByRole("option", { name: "hello 1" }),
    ).toHaveAttribute("aria-selected", "true");
    await userEvent.keyboard("{Escape}");
    await waitForClose();
    await expect(args.callback).not.toHaveBeenCalled();
  },
};

/** Select with a simple button. */
export const SimpleSelect: Story = {
  parameters: a11yExceptions(SELECT_VALUE_LIGHT),
  args: {
    ...Select.args,
    defaultSelectedKey: 1,
    simpleButton: true,
  },
  play: async ({ canvasElement, args }) => {
    const trigger = within(canvasElement).getByRole("button");
    await expect(trigger).toHaveTextContent("hello 1");
    await expect(trigger.querySelector("small")).toBeNull();
    const listbox = await openListbox(trigger);
    // the arrow rotates while open
    await expect(trigger.querySelector("svg")).toHaveClass("rotate-180");
    // the simple button stretches across the field, but its list stays 240px
    await expect(
      (listbox.closest("[data-trigger]") as HTMLElement).getBoundingClientRect()
        .width,
    ).toBe(240);
    await userEvent.click(
      within(listbox).getByRole("option", { name: "hello 2" }),
    );
    await waitForClose();
    await expect(trigger).toHaveTextContent("hello 2");
    await expect(trigger.querySelector("svg")).not.toHaveClass("rotate-180");
    await expect(args.callback).toHaveBeenCalledWith(
      expect.objectContaining({ id: 2 }),
    );
  },
};

/** The simple button can be scaled down by setting `smallButton` flag to true. */
export const SmallSimpleSelect: Story = {
  parameters: a11yExceptions(SELECT_VALUE_LIGHT),
  args: {
    ...Select.args,
    defaultSelectedKey: 1,
    simpleButton: true,
    smallButton: true,
  },
  play: async ({ canvasElement }) => {
    const trigger = within(canvasElement).getByRole("button");
    await expect(trigger.querySelector("small")).toHaveTextContent("hello 1");
    await expect(trigger.querySelector("svg")).toHaveClass("size-2");
  },
};

/** An iterable can be passed to mark keys as disabled. */
export const DisabledKeysSelect: Story = {
  args: {
    ...Select.args,
    defaultSelectedKey: 1,
    disabledKeys: [3, 5],
  },
  play: async ({ canvasElement, args }) => {
    const trigger = within(canvasElement).getByRole("button");
    const listbox = await openListbox(trigger);
    const disabled = within(listbox).getByRole("option", { name: "hello 3" });
    await expect(disabled).toHaveAttribute("aria-disabled", "true");
    await expect(
      within(listbox).getByRole("option", { name: "hello 2" }),
    ).not.toHaveAttribute("aria-disabled");
    await userEvent.click(disabled);
    await expect(args.callback).not.toHaveBeenCalled();
    // keyboard navigation skips disabled options: 1 -> 2 -> 4
    await userEvent.keyboard("{ArrowDown}{ArrowDown}{Enter}");
    await waitForClose();
    await expect(trigger).toHaveTextContent("hello 4");
    await expect(args.callback).toHaveBeenCalledWith(
      expect.objectContaining({ id: 4 }),
    );
  },
};

/** When used with Form, Select can be marked as `required` to prevent form submission. */
export const RequiredSelect: Story = {
  parameters: a11yExceptions(
    SECONDARY_TEXT_LIGHT,
    ERROR_TEXT_LIGHT,
    WHITE_ON_BLUE_LIGHT,
  ),
  args: {
    ...Select.args,
    isRequired: true,
  },
  render: (args) => (
    <Form
      onSubmit={(e) => {
        e.preventDefault();
      }}
    >
      <SelectComponent {...args} />
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
  play: async ({ canvasElement, ...context }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole("button", { name: /Select a value/ });
    await userEvent.click(canvas.getByRole("button", { name: "Click me!" }));
    // native required validation blocks the submit and shows an error
    await waitFor(() =>
      expect(trigger.closest("[data-invalid]")).toBeInTheDocument(),
    );
    await expect(
      canvasElement.querySelector(".text-klerosUIComponentsError"),
    ).not.toBeEmptyDOMElement();
    await auditA11y(context, "error");

    const listbox = await openListbox(trigger);
    await userEvent.click(
      within(listbox).getByRole("option", { name: "hello 5" }),
    );
    await waitForClose();
    await waitFor(() =>
      expect(trigger.closest("[data-invalid]")).not.toBeInTheDocument(),
    );
  },
};

let keyboardSubmits = 0;

/** A key pressed on the closed button that picks an item clears a required error. */
export const RequiredSelectKeyboard: Story = {
  parameters: a11yExceptions(WHITE_ON_BLUE_LIGHT),
  args: {
    ...Select.args,
    isRequired: true,
  },
  render: (args) => (
    <Form
      onSubmit={(e) => {
        e.preventDefault();
        keyboardSubmits++;
      }}
    >
      <SelectComponent {...args} />
      <Button
        variant="primary"
        type="submit"
        text="Submit"
        small
        className="mt-4"
      />
    </Form>
  ),
  play: async ({ canvasElement, args }) => {
    keyboardSubmits = 0;
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole("button", { name: /Select a value/ });
    await userEvent.click(canvas.getByRole("button", { name: "Submit" }));
    await waitFor(() =>
      expect(trigger.closest("[data-invalid]")).toBeInTheDocument(),
    );
    await expect(keyboardSubmits).toBe(0);

    trigger.focus();
    await userEvent.keyboard("{ArrowRight}");
    await expect(trigger).toHaveTextContent("hello 1");
    await expect(args.callback).toHaveBeenCalledWith(
      expect.objectContaining({ id: 1 }),
    );
    await waitFor(() =>
      expect(trigger.closest("[data-invalid]")).not.toBeInTheDocument(),
    );
    await userEvent.click(canvas.getByRole("button", { name: "Submit" }));
    await waitFor(() => expect(keyboardSubmits).toBe(1));
  },
};

export const CustomItemIcon: Story = {
  args: {
    themeUI: "dark",
    backgroundUI: "light",
    items: [
      {
        text: "hello 1",
        itemValue: 1,
        id: 1,
        icon: <Telegram className="mr-2 size-4 fill-white" />,
      },
      {
        text: "hello 2",
        itemValue: 2,
        id: 2,
        icon: <Telegram className="mr-2 size-4 fill-white" />,
      },
      {
        text: "hello 3",
        itemValue: 3,
        id: 3,
        icon: <Telegram className="mr-2 size-4 fill-white" />,
      },
      {
        text: "hello 4",
        itemValue: 4,
        id: 4,
        icon: <Telegram className="mr-2 size-4 fill-white" />,
      },
      {
        text: "hello 5",
        itemValue: 5,
        id: 5,
        icon: <Telegram className="mr-2 size-4 fill-white" />,
      },
    ],
    placeholder: "Select a value",
  },
  play: async ({ canvasElement, args }) => {
    const trigger = within(canvasElement).getByRole("button");
    const listbox = await openListbox(trigger);
    for (const option of within(listbox).getAllByRole("option"))
      await expect(option.querySelector("svg")).toBeInTheDocument();
    await userEvent.click(
      within(listbox).getByRole("option", { name: "hello 1" }),
    );
    await waitForClose();
    // the selected item's icon is shown in the trigger
    await expect(trigger.querySelector("svg.mr-2")).toBeInTheDocument();
    await expect(args.callback).toHaveBeenCalledWith(
      expect.objectContaining({ id: 1, itemValue: 1 }),
    );
  },
};

/** The listbox left open, so its (portaled) options are covered by the a11y check. */
export const OpenSelect: Story = {
  args: {
    ...Select.args,
    defaultSelectedKey: 2,
    disabledKeys: [4],
    defaultOpen: true,
  },
  play: async ({ canvasElement }) => {
    const listbox = await body.findByRole("listbox");
    // the rest of the page is aria-hidden while the popover is open
    await expect(
      within(canvasElement).getByRole("button", { hidden: true }),
    ).toHaveAttribute("aria-expanded", "true");
    await expect(
      within(listbox).getByRole("option", { name: "hello 2" }),
    ).toHaveAttribute("aria-selected", "true");
    await expect(
      within(listbox).getByRole("option", { name: "hello 4" }),
    ).toHaveAttribute("aria-disabled", "true");
    await waitForAnimations(document.body);
  },
};

const namingItems = [
  { text: "General", itemValue: 1, id: 1 },
  { text: "Blockchain", itemValue: 2, id: 2 },
];

/** The accessible name comes from `aria-label`, a visible `label`, or `aria-labelledby`; "Select" is the fallback. */
export const AccessibleName: Story = {
  parameters: a11yExceptions(SECONDARY_TEXT_LIGHT),
  args: {
    themeUI: "dark",
    backgroundUI: "light",
    items: namingItems,
    placeholder: "Pick one",
  },
  render: (args) => (
    <div className="flex flex-col gap-4">
      <div data-testid="aria-label">
        <SelectComponent {...args} aria-label="Court" />
      </div>
      <div data-testid="label">
        <SelectComponent {...args} label="Jurisdiction" />
      </div>
      <div data-testid="labelledby">
        <span
          id="select-external-name"
          className="text-klerosUIComponentsPrimaryText"
        >
          Appeal court
        </span>
        <SelectComponent {...args} aria-labelledby="select-external-name" />
      </div>
      <div data-testid="fallback">
        <SelectComponent {...args} />
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

/** A caller's `onSelectionChange` runs alongside the component's own `callback`. */
export const OnSelectionChange: Story = {
  args: {
    ...Select.args,
    onSelectionChange: fn(),
  },
  play: async ({ canvasElement, args }) => {
    const trigger = within(canvasElement).getByRole("button");
    const listbox = await openListbox(trigger);
    await userEvent.click(
      within(listbox).getByRole("option", { name: "hello 3" }),
    );
    await waitForClose();
    await expect(args.onSelectionChange).toHaveBeenCalledTimes(1);
    await expect(args.onSelectionChange).toHaveBeenCalledWith(3);
    await expect(trigger).toHaveTextContent("hello 3");
    await expect(args.callback).toHaveBeenCalledTimes(1);
    await expect(args.callback).toHaveBeenCalledWith(
      expect.objectContaining({ id: 3, itemValue: 3, text: "hello 3" }),
    );
  },
};

/** react-aria's `value` and `onChange` control the selected key, alongside `callback`. */
export const ValueAndOnChange: Story = {
  args: {
    ...Select.args,
    onChange: fn(),
  },
  render: function Render(args) {
    const [value, setValue] = useState<Key | null>(2);
    return (
      <SelectComponent
        {...args}
        value={value}
        onChange={(key) => {
          setValue(key);
          args.onChange?.(key);
        }}
      />
    );
  },
  play: async ({ canvasElement, args }) => {
    const trigger = within(canvasElement).getByRole("button");
    await expect(trigger).toHaveTextContent("hello 2");
    const listbox = await openListbox(trigger);
    await expect(
      within(listbox).getByRole("option", { name: "hello 2" }),
    ).toHaveAttribute("aria-selected", "true");
    await userEvent.click(
      within(listbox).getByRole("option", { name: "hello 4" }),
    );
    await waitForClose();
    await expect(trigger).toHaveTextContent("hello 4");
    await expect(args.onChange).toHaveBeenCalledTimes(1);
    await expect(args.onChange).toHaveBeenCalledWith(4);
    await expect(args.callback).toHaveBeenCalledTimes(1);
    await expect(args.callback).toHaveBeenCalledWith(
      expect.objectContaining({ id: 4 }),
    );
  },
};

const longItems = [
  {
    text: "A very long option label that does not fit",
    dot: "red",
    itemValue: 1,
    id: 1,
  },
  { text: "0x7fbd8b2a1c9e4d3f6a5b0c8e2d1f4a7b9c3e6d5f", itemValue: 2, id: 2 },
  { text: "Short", itemValue: 3, id: 3 },
];

/** Long text stays on one line inside the button, cut with an ellipsis. The list shows it in full. */
export const LongText: Story = {
  args: {
    themeUI: "dark",
    backgroundUI: "light",
    items: longItems,
    defaultSelectedKey: 1,
  },
  play: async ({ canvasElement, args }) => {
    const trigger = within(canvasElement).getByRole("button");
    await expect(trigger.getBoundingClientRect().width).toBe(240);
    await expectTruncated(trigger);
    // the accessible name keeps the whole text
    await expect(trigger).toHaveAccessibleName(
      /A very long option label that does not fit/,
    );

    const listbox = await openListbox(trigger);
    // each option, long words included, stays inside the list
    const listRight = listbox.getBoundingClientRect().right;
    for (const option of within(listbox).getAllByRole("option"))
      await expect(option.getBoundingClientRect().right).toBeLessThanOrEqual(
        listRight,
      );
    await userEvent.click(
      within(listbox).getByRole("option", { name: longItems[1].text }),
    );
    await waitForClose();
    await expect(trigger.getBoundingClientRect().width).toBe(240);
    await expectTruncated(trigger);
    await expect(args.callback).toHaveBeenCalledWith(
      expect.objectContaining({ id: 2 }),
    );
  },
};

/**
 * `buttonClassName` sizes the trigger, and the list is never narrower than it.
 * By default the trigger is 240px, or the field's width when that is less.
 */
export const ButtonWidth: Story = {
  args: {
    themeUI: "dark",
    backgroundUI: "light",
    items: longItems,
    defaultSelectedKey: 1,
  },
  render: (args) => (
    <div className="flex flex-col gap-6">
      <div data-testid="full" className="w-100">
        <SelectComponent {...args} aria-label="Full" buttonClassName="w-full" />
      </div>
      <div data-testid="narrow" className="w-40">
        <SelectComponent {...args} aria-label="Narrow" />
      </div>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = (id: string) =>
      within(canvas.getByTestId(id)).getByRole("button");
    const listWidth = async (button: HTMLElement) => {
      const listbox = await openListbox(button);
      const popover = listbox.closest("[data-trigger]") as HTMLElement;
      const { width } = popover.getBoundingClientRect();
      await userEvent.keyboard("{Escape}");
      await waitForClose();
      return width;
    };

    await expect(trigger("full").getBoundingClientRect().width).toBe(400);
    await expect(await listWidth(trigger("full"))).toBe(400);

    await expect(trigger("narrow").getBoundingClientRect().width).toBe(160);
    await expectTruncated(trigger("narrow"));
    await expect(await listWidth(trigger("narrow"))).toBe(240);
  },
};
