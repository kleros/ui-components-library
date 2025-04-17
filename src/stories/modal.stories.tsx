import type { Meta, StoryObj } from "@storybook/react";
import React, { useState } from "react";
import { IPreviewArgs } from "./utils";

import ModalComponent from "../lib/container/modal";
import { Button } from "../lib";

const meta = {
  component: ModalComponent,
  title: "Containers/Modal",
  tags: ["autodocs"],
  argTypes: {
    isOpen: {
      control: "boolean",
    },
    isDismissable: {
      control: "boolean",
    },
  },
} satisfies Meta<typeof ModalComponent>;

export default meta;

type Story = StoryObj<typeof meta> & IPreviewArgs;

export const Modal: Story = {
  args: {
    themeUI: "dark",
    backgroundUI: "light",
    className: "w-[500px]",
    isDismissable: true,
  },
  render: function Render(args) {
    const [isOpen, setOpen] = useState(false);
    return (
      <div>
        <Button text="Press me!" onPress={() => setOpen(true)} />
        <ModalComponent {...args} isOpen={isOpen} onOpenChange={setOpen}>
          <div className="flex size-full items-center justify-center">
            <p className="text-klerosUIComponentsPrimaryText font-semibold">
              I am a Modal.
            </p>
          </div>
        </ModalComponent>
      </div>
    );
  },
};
