import React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { expect, fn, userEvent, waitFor, within } from "@storybook/test";

import { IPreviewArgs, waitForAnimations } from "./utils";

import SelectComponent from "../lib/dropdown/select";
import { Form } from "react-aria-components";
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
