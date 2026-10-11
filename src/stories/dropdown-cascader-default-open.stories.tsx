import type { Meta, StoryObj } from "@storybook/react";
import { expect, fn, waitFor, within } from "@storybook/test";

import { IPreviewArgs } from "./utils";

import DropdownCascaderComponent from "../lib/dropdown/cascader";
import { a11yExceptions } from "./a11y";
import { WHITE_ON_BLUE_LIGHT } from "./a11y-defects";

const meta = {
  component: DropdownCascaderComponent,
  title: "Dropdown/Cascader Default Open",
  args: {
    callback: fn(),
  },
} satisfies Meta<typeof DropdownCascaderComponent>;

export default meta;

type Story = StoryObj<typeof meta> & IPreviewArgs;

const body = within(document.body);

/** Uncontrolled cascader that mounts open: the tree starts on the default key. */
export const DefaultKeyFocusedOnMount: Story = {
  parameters: a11yExceptions(WHITE_ON_BLUE_LIGHT),
  args: {
    themeUI: "dark",
    backgroundUI: "light",
    placeholder: "Select a value",
    defaultOpen: true,
    defaultSelectedKey: 6,
    items: [
      { label: "General Court", id: 0, itemValue: 0 },
      { label: "Curation", id: 6, itemValue: 6 },
    ],
  },
  play: async () => {
    const dialog = await body.findByRole("dialog", { name: "dropdown-dialog" });
    const tree = within(dialog);
    await waitFor(() =>
      expect(
        tree
          .queryAllByRole("row", { selected: true })
          .map((row) => row.textContent),
      ).toEqual(["Curation"]),
    );
    // Tree's autoFocus lands on the selected key present at its first render.
    await expect(document.activeElement).toHaveTextContent("Curation");
  },
};
