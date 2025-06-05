import React from "react";
import type { Meta, StoryObj } from "@storybook/react";

import { IPreviewArgs } from "./utils";

import SearchbarComponent from "../lib/form/searchbar";
import { Form } from "react-aria-components";
import Button from "../lib/button";

const meta = {
  component: SearchbarComponent,
  title: "Form/Searchbar",
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
} satisfies Meta<typeof SearchbarComponent>;

export default meta;

type Story = StoryObj<typeof meta> & IPreviewArgs;

export const Default: Story = {
  args: {
    themeUI: "dark",
    backgroundUI: "light",
    className: "w-[500px]",
  },
};

export const Labelled: Story = {
  args: {
    ...Default.args,
    label: "Search registry",
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
      <SearchbarComponent
        {...args}
        showFieldError
        placeholder="Try searching 'Dogs'"
        validate={(value) => (value.trim() === "Dogs" ? "Why not cats?" : null)}
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
