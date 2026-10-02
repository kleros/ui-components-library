import React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { expect, fn, userEvent, waitFor, within } from "@storybook/test";

import { IPreviewArgs } from "./utils";

import SearchbarComponent from "../lib/form/searchbar";
import { Form } from "react-aria-components";
import Button from "../lib/button";

const meta = {
  component: SearchbarComponent,
  title: "Form/Searchbar",
  tags: ["autodocs"],
  args: {
    onChange: fn(),
    onSubmit: fn(),
    onClear: fn(),
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
} satisfies Meta<typeof SearchbarComponent>;

export default meta;

type Story = StoryObj<typeof meta> & IPreviewArgs;

export const Default: Story = {
  args: {
    themeUI: "dark",
    backgroundUI: "light",
    className: "w-[500px]",
  },
  play: async ({ canvasElement, args }) => {
    const input = within(canvasElement).getByRole("searchbox");
    await expect(input).toHaveAttribute("placeholder", "Search");
    await userEvent.type(input, "cats");
    await expect(input).toHaveValue("cats");
    await expect(args.onChange).toHaveBeenLastCalledWith("cats");
    await userEvent.keyboard("{Enter}");
    await expect(args.onSubmit).toHaveBeenCalledWith("cats");
    // Escape clears the field
    await userEvent.keyboard("{Escape}");
    await expect(input).toHaveValue("");
    await expect(args.onClear).toHaveBeenCalledTimes(1);
    await expect(args.onChange).toHaveBeenLastCalledWith("");
  },
};

export const Labelled: Story = {
  args: {
    ...Default.args,
    label: "Search registry",
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole("searchbox", { name: "Search registry" });
    await userEvent.click(canvas.getByText("Search registry"));
    await expect(input).toHaveFocus();
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
  play: async ({ canvasElement, args, step }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole("searchbox");
    const submit = canvas.getByRole("button", { name: "Click me!" });
    await expect(input).toHaveAttribute("placeholder", "Try searching 'Dogs'");

    await step("empty required field is invalid on submit", async () => {
      await userEvent.click(submit);
      await waitFor(() =>
        expect(input).toHaveAttribute("aria-invalid", "true"),
      );
    });

    await step("custom validation message is shown", async () => {
      await userEvent.type(input, "Dogs");
      await userEvent.click(submit);
      await expect(await canvas.findByText("Why not cats?")).toBeVisible();
      await expect(input).toHaveAttribute("aria-invalid", "true");
    });

    await step("valid input clears the error", async () => {
      await userEvent.clear(input);
      await userEvent.type(input, "Cats");
      await userEvent.click(submit);
      await waitFor(() =>
        expect(canvas.queryByText("Why not cats?")).not.toBeInTheDocument(),
      );
      await expect(input).not.toHaveAttribute("aria-invalid");
      await expect(args.onChange).toHaveBeenLastCalledWith("Cats");
    });
  },
};

export const Disabled: Story = {
  args: {
    ...Default.args,
    label: "Search registry",
    isDisabled: true,
  },
  play: async ({ canvasElement, args }) => {
    const input = within(canvasElement).getByRole("searchbox", {
      name: "Search registry",
    });
    await expect(input).toBeDisabled();
    await userEvent.type(input, "cats");
    await expect(input).toHaveValue("");
    await expect(args.onChange).not.toHaveBeenCalled();
  },
};
