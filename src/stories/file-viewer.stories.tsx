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

export const JavascriptUrlBlocked: Story = {
  args: {
    themeUI: "light",
    backgroundUI: "light",
    className: "w-[800px]",
    url: "javascript:alert('xss')",
  },
};

export const VbscriptUrlBlocked: Story = {
  args: {
    themeUI: "light",
    backgroundUI: "light",
    className: "w-[800px]",
    url: "vbscript:msgbox(1)",
  },
};

export const UnsupportedScheme: Story = {
  args: {
    themeUI: "light",
    backgroundUI: "light",
    className: "w-[800px]",
    url: "file:///etc/passwd",
  },
};

export const UnsupportedFileType: Story = {
  args: {
    themeUI: "light",
    backgroundUI: "light",
    className: "w-[800px]",
    // jsDelivr serves package.json with permissive CORS and `application/json`,
    // a MIME no doc-viewer renderer claims — reliably hits the no-renderer
    // fallback. A `.zip` URL from a non-CORS host would error during prefetch
    // and leave doc-viewer spinning forever (no error state for failed fetches).
    url: "https://cdn.jsdelivr.net/gh/kleros/ui-components-library@main/package.json",
    fileName: "package.json",
  },
};

export const DataUrlHtmlBlocked: Story = {
  args: {
    themeUI: "light",
    backgroundUI: "light",
    className: "w-[800px]",
    url: "data:text/html,<script>alert('xss')</script>",
  },
};

export const DataUrlSvgBlocked: Story = {
  args: {
    themeUI: "light",
    backgroundUI: "light",
    className: "w-[800px]",
    url: "data:image/svg+xml,<svg onload=alert(1) xmlns='http://www.w3.org/2000/svg'/>",
  },
};

export const DataUrlXhtmlBlocked: Story = {
  args: {
    themeUI: "light",
    backgroundUI: "light",
    className: "w-[800px]",
    url: "data:application/xhtml+xml,<html xmlns='http://www.w3.org/1999/xhtml'><script>alert(1)</script></html>",
  },
};

export const DataUrlXmlBlocked: Story = {
  args: {
    themeUI: "light",
    backgroundUI: "light",
    className: "w-[800px]",
    url: "data:application/xml,<?xml-stylesheet type='text/xsl' href='data:text/xsl,evil'?><root/>",
  },
};

export const DataUrlPercentEncodedMimeBlocked: Story = {
  args: {
    themeUI: "light",
    backgroundUI: "light",
    className: "w-[800px]",
    // Spec-compliant browsers treat this as `text/plain` (the mediatype is
    // parsed raw, so `text%2Fhtml` fails MIME matching and falls back) —
    // already safe at the browser level. Our gate still blocks it as
    // defense-in-depth against legacy or non-conforming runtimes.
    url: "data:text%2Fhtml,<script>alert('xss')</script>",
  },
};
