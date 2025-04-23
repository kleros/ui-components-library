import React from "react";
import type { Meta, StoryObj } from "@storybook/react";

import { IPreviewArgs } from "./utils";

import DraggableList from "../lib/draggable-list";

const meta = {
  component: DraggableList,
  title: "Draggable List",
  tags: ["autodocs"],
} satisfies Meta<typeof DraggableList>;

export default meta;

type Story = StoryObj<typeof meta> & IPreviewArgs;

export const Default: Story = {
  args: {
    themeUI: "light",
    backgroundUI: "light",
    items: [
      { id: 1, name: "Illustrator", value: "" },
      { id: 2, name: "Premiere", value: "" },
      { id: 3, name: "Acrobat", value: "" },
    ],
  },
  render: (args) => {
    return <DraggableList {...args} />;
  },
};

export const CustomDragPreview: Story = {
  args: {
    themeUI: "light",
    backgroundUI: "light",
    items: [
      { id: 1, name: "Illustrator", value: "" },
      { id: 2, name: "Premiere", value: "" },
      { id: 3, name: "Acrobat", value: "" },
    ],
    renderDragPreview: (items) => (
      <div className="rounded-base bg-klerosUIComponentsPrimaryBlue px-4 py-2">
        <span className="text-klerosUIComponentsPrimaryText text-base">
          {items[0]["text/plain"]}
        </span>
      </div>
    ),
  },
  render: (args) => {
    return <DraggableList {...args} />;
  },
};
