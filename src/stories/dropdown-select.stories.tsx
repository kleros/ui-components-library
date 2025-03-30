import React from "react";
import type { Meta, StoryObj } from "@storybook/react";

import { IPreviewArgs } from "./utils";

import SelectComponent from "../lib/dropdown/select";
import { Form } from "react-aria-components";
import { Button } from "../lib";

const meta = {
  component: SelectComponent,
  title: "Dropdown/Select",
  tags: ["autodocs"],
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

export const Select: Story = {
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
    callback: () => {},
  },
};
/** Select with a default key selected. */
export const DefaultValueSelect: Story = {
  args: {
    ...Select.args,
    defaultSelectedKey: 1,
  },
};

/** Select with a simple button. */
export const SimpleSelect: Story = {
  args: {
    ...Select.args,
    defaultSelectedKey: 1,
    simpleButton: true,
  },
};

/** The simple button can be scaled down by setting `smallButton` flag to true. */
export const SmallSimpleSelect: Story = {
  args: {
    ...Select.args,
    defaultSelectedKey: 1,
    simpleButton: true,
    smallButton: true,
  },
};

/** An iterable can be passed to mark keys as disabled. */
export const DisabledKeysSelect: Story = {
  args: {
    ...Select.args,
    defaultSelectedKey: 1,
    disabledKeys: [3, 5],
  },
};

/** When used with Form, Select can be marked as `required` to prevent form submission. */
export const RequiredSelect: Story = {
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
};
