import React, { useState } from "react";
import type { Key } from "react-aria-components";
import type { Meta, StoryObj } from "@storybook/react";
import { expect, fn, userEvent, waitFor, within } from "@storybook/test";

import { IPreviewArgs } from "./utils";

import DropdownCascaderComponent from "../lib/dropdown/cascader";

const meta = {
  component: DropdownCascaderComponent,
  title: "Dropdown/Cascader Controlled",
  args: {
    callback: fn(),
  },
} satisfies Meta<typeof DropdownCascaderComponent>;

export default meta;

type Story = StoryObj<typeof meta> & IPreviewArgs;

const body = within(document.body);

// The play changes the parent's key directly, since any click outside the popover closes it.
let setParentKey: ((key: Key | null) => void) | undefined;

const selectedRows = () =>
  body.queryAllByRole("row", { selected: true }).map((row) => row.textContent);

/** Parent changes the controlled `selectedKey` while the tree is open, clears it, then sets it again. */
export const ExternalChangeWhileOpen: Story = {
  args: {
    themeUI: "dark",
    backgroundUI: "light",
    placeholder: "Select a value",
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
              { label: "Technical", id: 2, itemValue: 2 },
              { label: "Non-technical", id: 3, itemValue: 3 },
            ],
          },
          { label: "Marketing Services", id: 5, itemValue: 5 },
        ],
      },
    ],
  },
  render: function Render(args) {
    const [selectedKey, setSelectedKey] = useState<Key | null>(1);
    setParentKey = setSelectedKey;
    return (
      <DropdownCascaderComponent
        {...args}
        selectedKey={selectedKey}
        onSelectionChange={setSelectedKey}
      />
    );
  },
  play: async ({ canvasElement, step }) => {
    const trigger = within(canvasElement)
      .getAllByRole("button")
      .find((button) => button.hasAttribute("aria-haspopup"));
    if (!trigger) throw new Error("cascader trigger not found");
    const setKey = (key: Key | null) => {
      if (!setParentKey) throw new Error("story did not render");
      setParentKey(key);
    };

    await userEvent.click(trigger);
    await body.findByRole("dialog", { name: "dropdown-dialog" });
    await waitFor(() => expect(selectedRows()).toEqual(["Blockchain2"]));

    await step("a change while open moves the highlight", async () => {
      setKey(3);
      await waitFor(() => expect(trigger).toHaveTextContent("Non-technical"));
      await waitFor(() => expect(selectedRows()).toEqual(["Non-technical"]));
      await expect(
        body.getByRole("button", { name: /Select\s+Non-technical/ }),
      ).toBeVisible();
    });

    await step("clearing the key clears the highlight", async () => {
      setKey(null);
      await waitFor(() => expect(trigger).toHaveTextContent("Select a value"));
      await waitFor(() => expect(selectedRows()).toEqual([]));
    });

    await step("a key set after clearing is highlighted", async () => {
      setKey(5);
      await waitFor(() =>
        expect(trigger).toHaveTextContent("Marketing Services"),
      );
      await waitFor(() =>
        expect(selectedRows()).toEqual(["Marketing Services"]),
      );
    });

    await userEvent.click(document.body);
    await waitFor(() =>
      expect(body.queryByRole("dialog")).not.toBeInTheDocument(),
    );
  },
};
