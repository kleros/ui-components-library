import React, { useState } from "react";
import { Form, type Key } from "react-aria-components";
import type { Meta, StoryObj } from "@storybook/react";
import { expect, fn, userEvent, waitFor, within } from "@storybook/test";

import { IPreviewArgs, expectTruncated } from "./utils";

import SelectComponent, { type SelectProps } from "../lib/dropdown/select";
import { Button } from "../lib";
import { a11yExceptions, auditA11y } from "./a11y";
import {
  ERROR_TEXT_LIGHT,
  SECONDARY_TEXT_LIGHT,
  WHITE_ON_BLUE_LIGHT,
} from "./a11y-defects";

/** DropdownSelect with `selectionMode="multiple"`. */
function MultipleSelect(props: Omit<SelectProps<"multiple">, "selectionMode">) {
  return <SelectComponent selectionMode="multiple" {...props} />;
}

const meta = {
  component: MultipleSelect,
  title: "Dropdown/Select Multiple",
  args: {
    callback: fn(),
    onChange: fn(),
  },
} satisfies Meta<typeof MultipleSelect>;

export default meta;

type Story = StoryObj<typeof meta> & IPreviewArgs;

const body = within(document.body);

const items = [
  { text: "hello 1", dot: "red", itemValue: 1, id: 1 },
  { text: "hello 2", dot: "blue", itemValue: 2, id: 2 },
  { text: "hello 3", dot: "blue", itemValue: 3, id: 3 },
  { text: "hello 4", dot: "blue", itemValue: 4, id: 4 },
];

const openListbox = async (trigger: HTMLElement) => {
  await userEvent.click(trigger);
  return body.findByRole("listbox");
};

const waitForClose = () =>
  waitFor(() => expect(body.queryByRole("listbox")).not.toBeInTheDocument());

/** Texts of the selected options, in list order. */
const selectedOptions = (listbox: HTMLElement) =>
  within(listbox)
    .getAllByRole("option")
    .filter((option) => option.getAttribute("aria-selected") === "true")
    .map((option) => option.textContent);

/** Picking keeps the list open. `callback` gets the selected items and `onChange` their keys. */
export const MultipleSelection: Story = {
  args: {
    themeUI: "dark",
    backgroundUI: "light",
    items,
    placeholder: "Select values",
  },
  play: async ({ canvasElement, args, step, ...context }) => {
    const trigger = within(canvasElement).getByRole("button");
    await expect(trigger).toHaveTextContent("Select values");

    await step(
      "clicking options adds them and the list stays open",
      async () => {
        const listbox = await openListbox(trigger);
        await expect(listbox).toHaveAttribute("aria-multiselectable", "true");
        await userEvent.click(
          within(listbox).getByRole("option", { name: "hello 1" }),
        );
        await userEvent.click(
          within(listbox).getByRole("option", { name: "hello 3" }),
        );
        await expect(body.getByRole("listbox")).toBe(listbox);
        await expect(selectedOptions(listbox)).toEqual(["hello 1", "hello 3"]);
        await expect(args.onChange).toHaveBeenLastCalledWith([1, 3]);
        await expect(args.callback).toHaveBeenLastCalledWith([
          expect.objectContaining({ id: 1, text: "hello 1" }),
          expect.objectContaining({ id: 3, text: "hello 3" }),
        ]);
        await expect(trigger).toHaveTextContent("hello 1 and hello 3");
        await auditA11y(context, "open");
      },
    );

    await step("clicking a selected option removes it", async () => {
      const listbox = body.getByRole("listbox");
      await userEvent.click(
        within(listbox).getByRole("option", { name: "hello 1" }),
      );
      await expect(selectedOptions(listbox)).toEqual(["hello 3"]);
      await expect(args.callback).toHaveBeenLastCalledWith([
        expect.objectContaining({ id: 3 }),
      ]);
      // one item shows as in single selection, with its dot
      await expect(trigger).toHaveTextContent(/^hello 3$/);
      await expect(trigger.querySelector(".rounded-full")).toBeInTheDocument();
    });

    await step("Escape closes the list and keeps the selection", async () => {
      await userEvent.keyboard("{Escape}");
      await waitForClose();
      await expect(trigger).toHaveTextContent("hello 3");
      await expect(args.callback).toHaveBeenCalledTimes(3);
    });

    await step("keyboard: Space toggles the focused option", async () => {
      trigger.focus();
      await userEvent.keyboard("{ArrowDown}");
      const listbox = await body.findByRole("listbox");
      // focus lands on the selected option
      await waitFor(() =>
        expect(
          within(listbox).getByRole("option", { name: "hello 3" }),
        ).toHaveFocus(),
      );
      await userEvent.keyboard("{ArrowDown} ");
      await expect(selectedOptions(listbox)).toEqual(["hello 3", "hello 4"]);
      await expect(args.onChange).toHaveBeenLastCalledWith([3, 4]);
      await userEvent.keyboard("{Escape}");
      await waitForClose();
      await expect(trigger).toHaveTextContent("hello 3 and hello 4");
    });
  },
};

/** `defaultValue` takes the keys selected at first. */
export const DefaultValue: Story = {
  args: {
    themeUI: "dark",
    backgroundUI: "light",
    items,
    defaultValue: [2, 4],
  },
  play: async ({ canvasElement, args }) => {
    const trigger = within(canvasElement).getByRole("button");
    await expect(trigger).toHaveTextContent("hello 2 and hello 4");
    const listbox = await openListbox(trigger);
    await expect(selectedOptions(listbox)).toEqual(["hello 2", "hello 4"]);
    await userEvent.keyboard("{Escape}");
    await waitForClose();
    await expect(args.callback).not.toHaveBeenCalled();
  },
};

/** `value` and `onChange` keep the selected keys in the parent. */
export const Controlled: Story = {
  parameters: a11yExceptions(SECONDARY_TEXT_LIGHT, WHITE_ON_BLUE_LIGHT),
  args: {
    themeUI: "dark",
    backgroundUI: "light",
    items,
    placeholder: "Select values",
  },
  render: function Render(args) {
    const [keys, setKeys] = useState<Key[]>([1]);
    return (
      <div className="flex flex-col items-start gap-4">
        <MultipleSelect
          {...args}
          value={keys}
          onChange={(value) => {
            setKeys(value);
            args.onChange?.(value);
          }}
        />
        <p className="text-klerosUIComponentsPrimaryText" data-testid="keys">
          {keys.join(",") || "none"}
        </p>
        <Button text="Clear" small onPress={() => setKeys([])} />
      </div>
    );
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole("button", { name: /hello 1/ });
    const listbox = await openListbox(trigger);
    await userEvent.click(
      within(listbox).getByRole("option", { name: "hello 2" }),
    );
    await expect(canvas.getByTestId("keys")).toHaveTextContent("1,2");
    await expect(args.callback).toHaveBeenLastCalledWith([
      expect.objectContaining({ id: 1 }),
      expect.objectContaining({ id: 2 }),
    ]);
    await userEvent.keyboard("{Escape}");
    await waitForClose();
    await expect(trigger).toHaveTextContent("hello 1 and hello 2");

    await userEvent.click(canvas.getByRole("button", { name: "Clear" }));
    await expect(trigger).toHaveTextContent("Select values");
    await expect(canvas.getByTestId("keys")).toHaveTextContent("none");
  },
};

let submittedTags: FormDataEntryValue[] | undefined;

/** In a form, a required multiple select needs an item, and submits every selected key under its `name`. */
export const RequiredInForm: Story = {
  parameters: a11yExceptions(
    SECONDARY_TEXT_LIGHT,
    ERROR_TEXT_LIGHT,
    WHITE_ON_BLUE_LIGHT,
  ),
  args: {
    themeUI: "dark",
    backgroundUI: "light",
    items,
    placeholder: "Select values",
    isRequired: true,
    name: "tags",
  },
  render: (args) => (
    <Form
      onSubmit={(e) => {
        e.preventDefault();
        submittedTags = new FormData(e.currentTarget).getAll("tags");
      }}
    >
      <MultipleSelect {...args} />
      <Button
        variant="primary"
        type="submit"
        text="Submit"
        small
        className="mt-4"
      />
    </Form>
  ),
  play: async ({ canvasElement, ...context }) => {
    submittedTags = undefined;
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole("button", { name: /Select values/ });
    await userEvent.click(canvas.getByRole("button", { name: "Submit" }));
    await waitFor(() =>
      expect(trigger.closest("[data-invalid]")).toBeInTheDocument(),
    );
    await expect(submittedTags).toBeUndefined();
    await auditA11y(context, "error");

    const listbox = await openListbox(trigger);
    await userEvent.click(
      within(listbox).getByRole("option", { name: "hello 2" }),
    );
    await userEvent.click(
      within(listbox).getByRole("option", { name: "hello 4" }),
    );
    await userEvent.keyboard("{Escape}");
    await waitForClose();
    await waitFor(() =>
      expect(trigger.closest("[data-invalid]")).not.toBeInTheDocument(),
    );
    await userEvent.click(canvas.getByRole("button", { name: "Submit" }));
    await waitFor(() => expect(submittedTags).toEqual(["2", "4"]));
  },
};

/** Many selected texts stay on one line in the button, cut with an ellipsis. */
export const LongSelection: Story = {
  args: {
    themeUI: "dark",
    backgroundUI: "light",
    items,
    defaultValue: [1, 2, 3, 4],
  },
  play: async ({ canvasElement }) => {
    const trigger = within(canvasElement).getByRole("button");
    await expect(trigger.getBoundingClientRect().width).toBe(240);
    await expectTruncated(trigger);
    // the accessible name keeps every text
    await expect(trigger).toHaveAccessibleName(
      /hello 1, hello 2, hello 3, and hello 4/,
    );
  },
};
