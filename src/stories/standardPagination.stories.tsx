import type { Meta, StoryObj } from "@storybook/react";

import { IPreviewArgs } from "./utils";

import Pagination from "../lib/pagination/standard";
import React, { useState } from "react";

const meta = {
  component: Pagination,
  title: "Pagination/Standard Pagination",
  tags: ["autodocs"],
  argTypes: {
    numPages: {
      control: "number",
    },
    currentPage: {
      control: "number",
    },
    className: {
      control: "text",
    },
    disableNumbers: {
      control: "boolean",
    },
    hideNumbers: {
      control: "boolean",
    },
  },
} satisfies Meta<typeof Pagination>;

export default meta;

type Story = StoryObj<typeof meta> & IPreviewArgs;

export const StandardPagination: Story = {
  args: {
    themeUI: "light",
    backgroundUI: "light",
    numPages: 6,
    currentPage: 0,
    callback: () => {},
    className: "w-full",
    disableNumbers: false,
    hideNumbers: false,
  },
  render: function Render(args) {
    const [currentPage, setCurrentPage] = useState(1);

    return (
      <Pagination
        {...args}
        currentPage={currentPage}
        callback={setCurrentPage}
      />
    );
  },
};
