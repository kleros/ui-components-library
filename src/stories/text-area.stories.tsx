import React from "react";
import type { Meta, StoryObj } from "@storybook/react";

import { IPreviewArgs } from "./utils";

import TextAreaFieldComponent from "../lib/form/text-area";
import { Form } from "react-aria-components";
import Button from "../lib/button";

const meta = {
  component: TextAreaFieldComponent,
  title: "Form/TextArea",
  tags: ["autodocs"],
  argTypes: {
    variant: {
      options: ["success", "warning", "error", "info"],
      control: "radio",
    },
    isRequired: {
      control: "boolean",
    },
    isDisabled: {
      control: "boolean",
    },
    resizeX: {
      control: "boolean",
    },
    resizeY: {
      control: "boolean",
    },
    message: {
      control: "text",
    },
    label: {
      control: "text",
    },
    placeholder: {
      control: "text",
    },
  },
} satisfies Meta<typeof TextAreaFieldComponent>;

export default meta;

type Story = StoryObj<typeof meta> & IPreviewArgs;

export const Default: Story = {
  args: {
    themeUI: "dark",
    backgroundUI: "light",
    className: "w-[500px]",
    placeholder: "Enter description",
  },
};

export const Variant: Story = {
  args: {
    ...Default.args,
    variant: "success",
  },
};

export const Labelled: Story = {
  args: {
    ...Default.args,
    label: "Description",
  },
};

export const Resizable: Story = {
  args: {
    ...Default.args,
    label: "Description",
    message: "Your auto-biography",
    resizeX: true,
    resizeY: true,
  },
};

/** Make a field required. Optionally you can choose to show the validation error and customize their style. */
export const Required: Story = {
  args: {
    ...Default.args,
    isRequired: true,
  },
  render: (args) => (
    <Form
      onSubmit={(e) => {
        e.preventDefault();
      }}
    >
      <TextAreaFieldComponent
        {...args}
        showFieldError
        validate={(value) => (value === "admin" ? "Nice try!" : null)}
        fieldErrorProps={{
          children: ({ validationErrors }) => (
            <ul>
              {validationErrors.map((error) => (
                <li
                  key={error}
                  className="text-klerosUIComponentsError text-sm"
                >
                  {error}
                </li>
              ))}
            </ul>
          ),
        }}
      />
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
