import type { Meta, StoryObj } from "@storybook/react";
import { expect, waitFor, within } from "@storybook/test";

import { IPreviewArgs } from "./utils";

import FileViewerComponent from "../lib/file-viewer";

const meta = {
  component: FileViewerComponent,
  title: "File Viewer",
  tags: ["autodocs"],
} satisfies Meta<typeof FileViewerComponent>;

export default meta;

type Story = StoryObj<typeof meta> & IPreviewArgs;

/** Asserts the URL was rejected before reaching the underlying viewer. */
const expectBlocked: Story["play"] = async ({ canvasElement, args }) => {
  const canvas = within(canvasElement);
  await expect(canvas.getByText("Unable to display this file.")).toBeVisible();
  await expect(canvas.getByText(args.url)).toBeVisible();
  // neither the viewer nor the fallback link is rendered
  await expect(canvasElement.querySelector("#react-doc-viewer")).toBeNull();
  await expect(canvas.queryByRole("link")).not.toBeInTheDocument();
  await expect(canvasElement.querySelector("iframe, img, object")).toBeNull();
};

/** These stories load remote sample files, so they are excluded from the
 * (offline-safe) story tests. */
const NETWORK_TAGS = ["!test"];

const SAMPLE_FILES_BASE =
  "https://cdn.jsdelivr.net/gh/cyntler/react-doc-viewer@v1.17.0/src/exampleFiles";

const PDF_URL = `${SAMPLE_FILES_BASE}/pdf-multiple-pages-file.pdf`;

const IMAGE_URL = `${SAMPLE_FILES_BASE}/png-image.png`;

// A real-world malicious-style SVG: `onload` script + external `<image>` to
// exfiltrate. When rendered via `<img>` (our SvgDocRenderer), the browser
// disables both — so this displays as an inert red square. If it ever leaks
// to a top-frame navigation, the alert fires.
const SVG_DATA_URL =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100' onload=\"alert('xss')\">" +
      "<rect width='100' height='100' fill='red'/>" +
      "<image href='https://evil.example/exfil' width='1' height='1'/>" +
      "</svg>",
  );

export const FileViewer: Story = {
  args: {
    themeUI: "light",
    backgroundUI: "light",
    className: "w-[800px]",
    url: PDF_URL,
  },
  tags: NETWORK_TAGS,
};

export const Image: Story = {
  args: {
    themeUI: "light",
    backgroundUI: "light",
    className: "w-[800px]",
    url: IMAGE_URL,
  },
  tags: NETWORK_TAGS,
};

export const JavascriptUrlBlocked: Story = {
  args: {
    themeUI: "light",
    backgroundUI: "light",
    className: "w-[800px]",
    url: "javascript:alert('xss')",
  },
  play: expectBlocked,
};

export const VbscriptUrlBlocked: Story = {
  args: {
    themeUI: "light",
    backgroundUI: "light",
    className: "w-[800px]",
    url: "vbscript:msgbox(1)",
  },
  play: expectBlocked,
};

export const UnsupportedScheme: Story = {
  args: {
    themeUI: "light",
    backgroundUI: "light",
    className: "w-[800px]",
    url: "file:///etc/passwd",
  },
  play: expectBlocked,
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
  tags: NETWORK_TAGS,
};

export const DataUrlHtmlBlocked: Story = {
  args: {
    themeUI: "light",
    backgroundUI: "light",
    className: "w-[800px]",
    url: "data:text/html,<script>alert('xss')</script>",
  },
  play: expectBlocked,
};

export const DataUrlSvgBlocked: Story = {
  args: {
    themeUI: "light",
    backgroundUI: "light",
    className: "w-[800px]",
    url: "data:image/svg+xml,<svg onload=alert(1) xmlns='http://www.w3.org/2000/svg'/>",
  },
  play: expectBlocked,
};

// Same URL, but the consumer opts `image/svg+xml` past the blocklist.
// Renders via `<img>` (secure static mode) — `onload` does not fire and
// `<image href>` to external origins is dropped.
export const DataUrlSvgAllowed: Story = {
  args: {
    themeUI: "light",
    backgroundUI: "light",
    className: "w-[800px]",
    url: SVG_DATA_URL,
    allowedDataMimes: ["image/svg+xml"],
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    // opted-in SVG data URLs are rendered through <img> (secure static mode)
    await waitFor(() =>
      expect(canvasElement.querySelector("#image-img")).toBeInTheDocument(),
    );
    const img = canvasElement.querySelector("#image-img") as HTMLImageElement;
    await expect(img.tagName).toBe("IMG");
    await expect(img).toHaveAttribute("src", args.url);
    await expect(canvasElement.querySelector("iframe, object")).toBeNull();
    await expect(
      canvas.queryByText("Unable to display this file."),
    ).not.toBeInTheDocument();
  },
};

export const DataUrlXhtmlBlocked: Story = {
  args: {
    themeUI: "light",
    backgroundUI: "light",
    className: "w-[800px]",
    url: "data:application/xhtml+xml,<html xmlns='http://www.w3.org/1999/xhtml'><script>alert(1)</script></html>",
  },
  play: expectBlocked,
};

export const DataUrlXmlBlocked: Story = {
  args: {
    themeUI: "light",
    backgroundUI: "light",
    className: "w-[800px]",
    url: "data:application/xml,<?xml-stylesheet type='text/xsl' href='data:text/xsl,evil'?><root/>",
  },
  play: expectBlocked,
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
  play: expectBlocked,
};

/** Relative URLs resolve against the page origin and are allowed. */
export const RelativeUrl: Story = {
  args: {
    themeUI: "light",
    backgroundUI: "light",
    className: "w-[800px]",
    url: "./sample.txt",
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(
      canvas.queryByText("Unable to display this file."),
    ).not.toBeInTheDocument();
    // handed over to the document viewer
    await expect(
      canvasElement.querySelector("#react-doc-viewer"),
    ).toBeInTheDocument();
  },
};
