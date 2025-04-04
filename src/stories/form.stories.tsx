import React from "react";
import type { Meta, StoryObj } from "@storybook/react";

import { IPreviewArgs } from "./utils";

import FormComponent from "../lib/form";
import { Button, TextField } from "../lib";

const meta = {
  component: FormComponent,
  title: "Form/Form",
  tags: ["autodocs"],
} satisfies Meta<typeof FormComponent>;

export default meta;

type Story = StoryObj<typeof meta> & IPreviewArgs;

export const Form: Story = {
  args: {
    themeUI: "light",
    backgroundUI: "light",
    className: "flex flex-col gap-4",
  },
  render: (args) => {
    return (
      <FormComponent
        onSubmit={(e) => {
          e.preventDefault();
        }}
        {...args}
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
};
