import React from "react";
import type { Meta, StoryObj } from "@storybook/react";

import { IPreviewArgs } from "./utils";

import DropdownCascaderComponent from "../lib/dropdown/cascader";
import { Form } from "react-aria-components";
import { Button } from "../lib";

const meta = {
  component: DropdownCascaderComponent,
  title: "Dropdown/Cascader",
  tags: ["autodocs"],
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
    callback: () => {},
  },
};
/** Dropdown Cascader with a default key selected. */
export const DefaultValueSelected: Story = {
  args: {
    ...DropdownCascader.args,
    defaultSelectedKey: 1,
  },
};

/** An iterable can be passed to mark keys as disabled. */
export const DisabledKeysSelect: Story = {
  args: {
    ...DropdownCascader.args,
    defaultSelectedKey: 1,
    disabledKeys: [2, 5],
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
};
