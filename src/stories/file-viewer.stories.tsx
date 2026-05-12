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

const SAMPLE_FILES_BASE =
  "https://cdn.jsdelivr.net/gh/cyntler/react-doc-viewer@v1.17.0/src/exampleFiles";

const PDF_URL = `${SAMPLE_FILES_BASE}/pdf-multiple-pages-file.pdf`;

const IMAGE_URL = `${SAMPLE_FILES_BASE}/png-image.png`;

export const FileViewer: Story = {
  args: {
    themeUI: "light",
    backgroundUI: "light",
    className: "w-[800px]",
    url: PDF_URL,
  },
};

export const Image: Story = {
  args: {
    themeUI: "light",
    backgroundUI: "light",
    className: "w-[800px]",
    url: IMAGE_URL,
  },
};
