import type { Meta, StoryObj } from "@storybook/react";

import { IPreviewArgs } from "./utils";

import Pagination from "../lib/pagination/compact";
import React, { useState } from "react";

const meta = {
  component: Pagination,
  title: "Pagination/Compact Pagination",
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
  },
} satisfies Meta<typeof Pagination>;

export default meta;

type Story = StoryObj<typeof meta> & IPreviewArgs;

export const CompactPagination: Story = {
  args: {
    themeUI: "light",
    backgroundUI: "light",
    numPages: 6,
    currentPage: 0,
    callback: () => {},
    className: "w-full",
    label: "Label:",
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

export const CompactPaginationWithCloseCallback: Story = {
  args: {
    themeUI: "light",
    backgroundUI: "light",
    numPages: 6,
    currentPage: 0,
    callback: () => {},
    className: "w-full",
    label: "Shows close button in end.",
  },
  render: function Render(args) {
    const [currentPage, setCurrentPage] = useState(1);

    return (
      <Pagination
        {...args}
        currentPage={currentPage}
        callback={setCurrentPage}
        onCloseOnLastPage={() => {}}
      />
    );
  },
};
