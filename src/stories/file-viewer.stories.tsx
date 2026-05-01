import type { Meta, StoryObj } from "@storybook/react";

import { IPreviewArgs } from "./utils";

import FileViewerComponent from "../lib/file-viewer";

const meta = {
  component: FileViewerComponent,
  title: "File Viewer",
  tags: ["autodocs"],
} satisfies Meta<typeof FileViewerComponent>;

export default meta;

type Story = StoryObj<typeof meta> & IPreviewArgs;

export const FileViewer: Story = {
  args: {
    themeUI: "light",
    backgroundUI: "light",
    className: "w-[800px]",
    url: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
  },
};

export const Image: Story = {
  args: {
    themeUI: "light",
    backgroundUI: "light",
    className: "w-[800px]",
    url:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/" +
      "PNG_transparency_demonstration_1.png/280px-PNG_transparency_demonstration_1.png",
  },
};
