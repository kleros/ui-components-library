import React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { expect, fn, userEvent, waitFor, within } from "@storybook/test";

import { IPreviewArgs } from "./utils";

import FormComponent from "../lib/form";
import { Button, TextField } from "../lib";
import { a11yExceptions } from "./a11y";
import { SECONDARY_TEXT_LIGHT, WHITE_ON_BLUE_LIGHT } from "./a11y-defects";

const meta = {
  component: FormComponent,
  title: "Form/Form",
  tags: ["autodocs"],
} satisfies Meta<typeof FormComponent>;

export default meta;

type Story = StoryObj<typeof meta> & IPreviewArgs;

/** Spy receiving the submitted form values. */
const submitted = fn();

export const Form: Story = {
  args: {
    themeUI: "light",
    backgroundUI: "light",
    className: "flex flex-col gap-4",
  },
  parameters: a11yExceptions(SECONDARY_TEXT_LIGHT, WHITE_ON_BLUE_LIGHT),
  beforeEach: () => {
    submitted.mockClear();
  },
  render: (args) => {
    return (
      <FormComponent
        {...args}
        onSubmit={(e) => {
          e.preventDefault();
          const data = new FormData(e.currentTarget);
          submitted({ email: data.get("email") });
        }}
      >
        <TextField
          name="email"
          type="email"
          isRequired
          label="Enter your email"
          placeholder="abc@gmail.com"
        />
        <Button text="Submit" type="submit" small />
      </FormComponent>
    );
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole("textbox", { name: "Enter your email" });
    const submit = canvas.getByRole("button", { name: "Submit" });
    await expect(input).toBeRequired();

    await step("empty required field blocks the submit", async () => {
      await userEvent.click(submit);
      await expect(submitted).not.toHaveBeenCalled();
      await waitFor(() =>
        expect(input).toHaveAttribute("aria-invalid", "true"),
      );
      // focus moves to the first invalid field
      await expect(input).toHaveFocus();
    });

    await step("an invalid email blocks the submit", async () => {
      await userEvent.type(input, "not-an-email");
      await userEvent.keyboard("{Enter}");
      await expect(submitted).not.toHaveBeenCalled();
      await expect(input).toBeInvalid();
    });

    await step("a valid email is submitted", async () => {
      await userEvent.clear(input);
      await userEvent.type(input, "juror@kleros.io");
      await userEvent.click(submit);
      await expect(submitted).toHaveBeenCalledTimes(1);
      await expect(submitted).toHaveBeenCalledWith({
        email: "juror@kleros.io",
      });
      await expect(input).not.toHaveAttribute("aria-invalid");
    });
  },
};
