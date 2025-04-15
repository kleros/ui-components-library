import type { Meta, StoryObj } from "@storybook/react";

import { IPreviewArgs } from "./utils";

import FileUploaderComponent from "../lib/form/file-uploader";

const meta = {
  component: FileUploaderComponent,
  title: "Form/File Uploader",
  tags: ["autodocs"],
  argTypes: {
    variant: {
      options: ["success", "warning", "error", "info"],
      control: "radio",
    },
    isDisabled: {
      control: "boolean",
    },
  },
} satisfies Meta<typeof FileUploaderComponent>;

export default meta;

type Story = StoryObj<typeof meta> & IPreviewArgs;

export const FileUploader: Story = {
  args: {
    themeUI: "dark",
    backgroundUI: "light",
    className: "w-[500px]",
    callback: () => {},
  },
};

export const FileUploaderWithMessage: Story = {
  args: {
    themeUI: "dark",
    backgroundUI: "light",
    className: "w-[500px]",
    variant: "info",
    msg: "Please upload the file.",
    callback: () => {},
  },
};
export const FileUploaderVariant: Story = {
  args: {
    themeUI: "dark",
    backgroundUI: "light",
    className: "w-[500px]",
    msg: "Please upload the file.",
    variant: "warning",
    callback: () => {},
  },
};

export const FileUploaderWithAcceptedTypes: Story = {
  args: {
    themeUI: "dark",
    backgroundUI: "light",
    className: "w-[500px]",
    callback: () => {},
    acceptedFileTypes: ["image/png"],
    msg: "This will only accept png images.",
    variant: "info",
  },
};
