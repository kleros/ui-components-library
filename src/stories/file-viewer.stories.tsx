import type { Meta, StoryObj } from "@storybook/react";
import { expect, userEvent, waitFor, within } from "@storybook/test";
import React, { useState } from "react";

import { IPreviewArgs } from "./utils";
import { a11yExceptions } from "./a11y";
import { PRIMARY_BLUE_TEXT_LIGHT } from "./a11y-defects";
import {
  expectLocalWorkerScripts,
  expectOnlyLocalRequests,
  expectStoryStayedPut,
  isLocalRequest,
  observed,
  scannedUrls,
  srcsetUrls,
  startObservers,
} from "./network-observer";

import FileViewerComponent from "../lib/file-viewer";
import MarkdownDocRenderer from "../lib/file-viewer/markdown-viewer";

// react-doc-viewer points pdf.js at unpkg.com. This is the pdf.js worker build
// it bundles (same version), served by Storybook `staticDirs`.
const PDF_WORKER_URL = "./pdfjs/pdf.worker.mjs";

const serveLocalPdfWorker = () => {
  const { pdfjsLib } = globalThis as {
    pdfjsLib?: { GlobalWorkerOptions: { workerSrc: string } };
  };
  if (pdfjsLib) pdfjsLib.GlobalWorkerOptions.workerSrc = PDF_WORKER_URL;
};

const meta = {
  component: FileViewerComponent,
  title: "File Viewer",
  tags: ["autodocs"],
  beforeEach: [serveLocalPdfWorker, startObservers],
  experimental_afterEach: expectStoryStayedPut,
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
  await expectOnlyLocalRequests();
};

// Fixture documents are fetched before they render; waitFor defaults to 1 s.
const LOAD = { timeout: 5000 };

/** Waits until the viewer has left its loading state and shows text. */
const viewerText = (canvasElement: HTMLElement) =>
  waitFor(() => {
    expect(canvasElement.querySelector("#loading-renderer")).toBeNull();
    expect(canvasElement.textContent?.trim()).toBeTruthy();
  }, LOAD);

/** The rendered `#image-img`, once it has decoded. An `<img>` without `src`
 * also reports `complete`. */
const loadedImage = (canvasElement: HTMLElement) =>
  waitFor(() => {
    const img = canvasElement.querySelector<HTMLImageElement>("#image-img");
    expect(img).toBeInTheDocument();
    expect(img?.getAttribute("src")).toBeTruthy();
    expect(img?.complete).toBe(true);
    expect(img?.naturalWidth).toBeGreaterThan(0);
    return img as HTMLImageElement;
  }, LOAD);

const PDF_URL = "./fixtures/sample.pdf";

const IMAGE_URL = "./fixtures/sample.png";

// `application/json`: a MIME no doc-viewer renderer claims, so the
// no-renderer fallback is rendered.
const UNSUPPORTED_URL = "./fixtures/sample.json";

// Chromatic skips these stories; the README lists them with the reasons.
const NO_SNAPSHOT = { chromatic: { disableSnapshot: true } };

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
  // pdf.js canvas output is not pixel-stable across runs.
  parameters: {
    ...NO_SNAPSHOT,
    ...a11yExceptions(
      {
        rule: "button-name",
        selector:
          "#pdf-zoom-in, #pdf-zoom-out, #pdf-zoom-reset, #pdf-toggle-pagination",
        reason:
          "Dependency defect: react-doc-viewer's PDF controls are icon-only buttons with no accessible name.",
        source: "src/lib/file-viewer/index.tsx:208",
      },
      {
        rule: "color-contrast",
        selector: "#pdf-page-info",
        reason:
          "Dependency defect: react-doc-viewer's grey #999999 page counter is 2.8:1 on white.",
        source: "src/lib/file-viewer/index.tsx:208",
        themes: ["light"],
      },
    ),
  },
  args: {
    themeUI: "light",
    backgroundUI: "light",
    className: "w-[800px]",
    url: PDF_URL,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(
      canvasElement.querySelector("#react-doc-viewer"),
    ).toBeInTheDocument();
    await waitFor(() => expect(observed.workers.length).toBeGreaterThan(0), {
      timeout: 10000,
    });
    await expectLocalWorkerScripts();
    await expect(observed.workers).toEqual([
      new URL(PDF_WORKER_URL, window.location.href).href,
    ]);
    // pdf.js renders each page to a canvas once the file has been fetched
    await waitFor(
      () =>
        expect(
          canvasElement.querySelectorAll("canvas").length,
        ).toBeGreaterThanOrEqual(1),
      { timeout: 10000 },
    );
    await expect(
      canvas.queryByText("Unable to display this file."),
    ).not.toBeInTheDocument();
    await expect(
      canvas.queryByText("This file type can't be previewed."),
    ).not.toBeInTheDocument();
    await expectOnlyLocalRequests();
  },
};

export const Image: Story = {
  parameters: a11yExceptions({
    rule: "image-alt",
    selector: "#image-img",
    reason:
      "Dependency defect: react-doc-viewer's image renderer sets no alt attribute.",
    source: "src/lib/file-viewer/index.tsx:208",
  }),
  args: {
    themeUI: "light",
    backgroundUI: "light",
    className: "w-[800px]",
    url: IMAGE_URL,
  },
  play: async ({ canvasElement }) => {
    const img = await loadedImage(canvasElement);
    await expect(img.tagName).toBe("IMG");
    // doc-viewer fetches the file and renders it from a data URI
    await expect(img.getAttribute("src")).toMatch(/^data:image\/png;base64,/);
    await expectOnlyLocalRequests();
  },
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

export const AboutUrlBlocked: Story = {
  args: {
    themeUI: "light",
    backgroundUI: "light",
    className: "w-[800px]",
    url: "about:blank",
  },
  play: expectBlocked,
};

export const UnsupportedFileType: Story = {
  parameters: a11yExceptions(PRIMARY_BLUE_TEXT_LIGHT),
  args: {
    themeUI: "light",
    backgroundUI: "light",
    className: "w-[800px]",
    url: UNSUPPORTED_URL,
    fileName: "sample.json",
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(
      await canvas.findByText("This file type can't be previewed."),
    ).toBeVisible();
    const link = canvas.getByRole("link", { name: "Open in a new tab" });
    await expect(link).toHaveAttribute("download", "sample.json");
    await expect(link.getAttribute("href")).toContain("fixtures/sample.json");
    await expect(link).toHaveAttribute("target", "_blank");
    const rel = (link.getAttribute("rel") ?? "").split(/\s+/);
    await expect(rel).toContain("noopener");
    await expect(rel).toContain("noreferrer");
    await expectOnlyLocalRequests();
  },
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
    // the external <image> in the SVG is never fetched and onload never runs
    await new Promise((resolve) => setTimeout(resolve, 300));
    await expectOnlyLocalRequests();
  },
};

// Outcome: allowlist entries are matched case-insensitively.
export const DataUrlSvgAllowedMixedCase: Story = {
  args: {
    themeUI: "light",
    backgroundUI: "light",
    className: "w-[800px]",
    url: SVG_DATA_URL,
    allowedDataMimes: ["Image/SVG+XML"],
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await waitFor(() =>
      expect(canvasElement.querySelector("#image-img")).toBeInTheDocument(),
    );
    await expect(
      canvas.queryByText("Unable to display this file."),
    ).not.toBeInTheDocument();
    await expectOnlyLocalRequests();
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

const blockedDataUrlStory = (url: string): Story => ({
  args: {
    themeUI: "light",
    backgroundUI: "light",
    className: "w-[800px]",
    url,
  },
  play: expectBlocked,
});

// One case per UNSAFE_DATA_MIMES entry. Removing a guard makes that story's
// `expectBlocked` assertion fail because the viewer renders instead.
export const DataUrlTextXmlBlocked = blockedDataUrlStory(
  "data:text/xml,<?xml-stylesheet type='text/xsl' href='data:text/xsl,evil'?><root/>",
);

// Outcome: mixed-case MIMEs are lowercased before matching, so they are blocked.
export const DataUrlHtmlMixedCaseBlocked = blockedDataUrlStory(
  "data:TeXt/HtMl,<script>alert('xss')</script>",
);

export const DataUrlXhtmlMixedCaseBlocked = blockedDataUrlStory(
  "data:Application/XHTML+XML,<html xmlns='http://www.w3.org/1999/xhtml'><script>alert(1)</script></html>",
);

export const DataUrlXmlMixedCaseBlocked = blockedDataUrlStory(
  "data:APPLICATION/XML,<root/>",
);

export const DataUrlTextXmlMixedCaseBlocked = blockedDataUrlStory(
  "data:TEXT/XML,<root/>",
);

export const DataUrlSvgMixedCaseBlocked = blockedDataUrlStory(
  "data:IMAGE/SVG+XML,<svg onload=alert(1) xmlns='http://www.w3.org/2000/svg'/>",
);

// Outcome: percent-encoded MIMEs are decoded before matching, so they are blocked.
export const DataUrlXhtmlPercentEncodedBlocked = blockedDataUrlStory(
  "data:application%2Fxhtml%2Bxml,<html/>",
);

export const DataUrlXmlPercentEncodedBlocked = blockedDataUrlStory(
  "data:application%2Fxml,<root/>",
);

export const DataUrlTextXmlPercentEncodedBlocked = blockedDataUrlStory(
  "data:text%2Fxml,<root/>",
);

export const DataUrlSvgPercentEncodedBlocked = blockedDataUrlStory(
  "data:image%2Fsvg%2Bxml,<svg onload=alert(1) xmlns='http://www.w3.org/2000/svg'/>",
);

// Outcome: MIME parameters (`;charset=...`) are stripped before matching, so they are blocked.
export const DataUrlHtmlParamsBlocked = blockedDataUrlStory(
  "data:text/html;charset=utf-8,<script>alert('xss')</script>",
);

export const DataUrlXhtmlParamsBlocked = blockedDataUrlStory(
  "data:application/xhtml+xml;charset=utf-8,<html/>",
);

export const DataUrlXmlParamsBlocked = blockedDataUrlStory(
  "data:application/xml;charset=utf-8,<root/>",
);

export const DataUrlTextXmlParamsBlocked = blockedDataUrlStory(
  "data:text/xml;charset=utf-8,<root/>",
);

export const DataUrlSvgParamsBlocked = blockedDataUrlStory(
  "data:image/svg+xml;base64,PHN2ZyBvbmxvYWQ9YWxlcnQoMSkgeG1sbnM9J2h0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnJy8+",
);

// Outcome: leading whitespace in the MIME is trimmed before matching (Fetch
// strips it too), so these are blocked.
export const DataUrlHtmlLeadingSpaceBlocked = blockedDataUrlStory(
  "data: text/html,<script>alert('xss')</script>",
);

export const DataUrlXhtmlLeadingSpaceBlocked = blockedDataUrlStory(
  "data: application/xhtml+xml,<html/>",
);

export const DataUrlXmlLeadingSpaceBlocked = blockedDataUrlStory(
  "data: application/xml,<root/>",
);

export const DataUrlTextXmlLeadingSpaceBlocked = blockedDataUrlStory(
  "data: text/xml,<root/>",
);

export const DataUrlSvgLeadingSpaceBlocked = blockedDataUrlStory(
  "data: image/svg+xml,<svg onload=alert(1) xmlns='http://www.w3.org/2000/svg'/>",
);

/** Relative URLs resolve against the page origin and are allowed. The file is
 * a local fixture (served through Storybook `staticDirs`), so the rendered
 * result is deterministic. */
export const RelativeUrl: Story = {
  args: {
    themeUI: "light",
    backgroundUI: "light",
    className: "w-[800px]",
    url: "./fixtures/sample.txt",
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(
      canvas.queryByText("Unable to display this file."),
    ).not.toBeInTheDocument();
    // handed over to the document viewer, which fetches and renders the file
    await expect(
      canvasElement.querySelector("#react-doc-viewer"),
    ).toBeInTheDocument();
    await expect(
      await canvas.findByText(
        "Kleros file viewer fixture.",
        {},
        { timeout: 5000 },
      ),
    ).toBeVisible();
    await expectOnlyLocalRequests();
  },
};

const failedResponseStory = (
  fileName: string,
  respond: () => Promise<Response>,
): Story => ({
  parameters: NO_SNAPSHOT,
  beforeEach: () => {
    observed.stubs.set(fileName, respond);
  },
  args: {
    themeUI: "light",
    backgroundUI: "light",
    className: "w-[800px]",
    url: `./fixtures/${fileName}`,
  },
  play: async ({ canvasElement }) => {
    await viewerText(canvasElement);
    await expect(observed.requests.some((url) => url.endsWith(fileName))).toBe(
      true,
    );
    // The body renders as markdown: 2026-10-09-ui-components-library-file-viewer-http-error-body.
    await expect(canvasElement.querySelector("canvas, img")).toBeNull();
    await expectOnlyLocalRequests();
  },
});

/** The server answers 500 for a PDF: no PDF or image is rendered. */
export const FailedResponseServerError = failedResponseStory(
  "broken.pdf",
  async () => new Response("boom", { status: 500, statusText: "Server Error" }),
);

/** The server answers 404 for an image: no PDF or image is rendered. */
export const FailedResponseNotFound = failedResponseStory(
  "missing.png",
  async () =>
    new Response("not found", { status: 404, statusText: "Not Found" }),
);

const SWITCH_DOCS = [
  { label: "Text", url: "./fixtures/sample.txt" },
  { label: "Image", url: "./fixtures/sample.png" },
  { label: "Unsupported", url: UNSUPPORTED_URL },
  { label: "Blocked", url: "javascript:alert('xss')" },
  { label: "Markdown", url: "./fixtures/malicious-markdown.txt" },
];

const SwitchableViewer = (
  args: React.ComponentProps<typeof FileViewerComponent>,
) => {
  const [url, setUrl] = useState(args.url);
  return (
    <div>
      <div className="flex gap-2 pb-2">
        {SWITCH_DOCS.map((doc) => (
          <button
            key={doc.label}
            type="button"
            className="text-klerosUIComponentsPrimaryText"
            onClick={() => setUrl(doc.url)}
          >
            {doc.label}
          </button>
        ))}
      </div>
      <FileViewerComponent {...args} url={url} />
    </div>
  );
};

/** Switching `url` on a mounted viewer replaces the previous document. */
export const DocumentSwitching: Story = {
  parameters: NO_SNAPSHOT,
  args: {
    themeUI: "light",
    backgroundUI: "light",
    className: "w-[800px]",
    url: SWITCH_DOCS[0].url,
  },
  render: (args) => <SwitchableViewer {...args} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const viewer = () => canvasElement.querySelector("#react-doc-viewer");

    await expect(
      await canvas.findByText("Kleros file viewer fixture.", {}, LOAD),
    ).toBeVisible();

    await userEvent.click(canvas.getByRole("button", { name: "Image" }));
    await loadedImage(canvasElement);
    await expect(
      canvas.queryByText("Kleros file viewer fixture."),
    ).not.toBeInTheDocument();

    await userEvent.click(canvas.getByRole("button", { name: "Unsupported" }));
    await expect(
      await canvas.findByText("This file type can't be previewed.", {}, LOAD),
    ).toBeVisible();
    await expect(canvasElement.querySelector("#image-img")).toBeNull();

    await userEvent.click(canvas.getByRole("button", { name: "Blocked" }));
    await expect(
      await canvas.findByText("Unable to display this file."),
    ).toBeVisible();
    await expect(viewer()).toBeNull();
    await expect(canvas.queryByRole("link")).not.toBeInTheDocument();

    await userEvent.click(canvas.getByRole("button", { name: "Text" }));
    await expect(
      await canvas.findByText("Kleros file viewer fixture.", {}, LOAD),
    ).toBeVisible();
    await expect(
      canvas.queryByText("Unable to display this file."),
    ).not.toBeInTheDocument();

    await userEvent.click(canvas.getByRole("button", { name: "Markdown" }));
    await expect(
      await canvas.findByText("Malicious markdown fixture", {}, LOAD),
    ).toBeVisible();
    await expect(
      canvas.queryByText("Kleros file viewer fixture."),
    ).not.toBeInTheDocument();
    await expectOnlyLocalRequests();
  },
};

/** An SVG with `onload`, `<script>` and external references, served from
 * localhost. It is shown through `<img>`, so nothing runs or is fetched. */
export const MaliciousSvgFile: Story = {
  args: {
    themeUI: "light",
    backgroundUI: "light",
    className: "w-[800px]",
    url: "./fixtures/malicious.svg",
    fileName: "malicious.svg",
  },
  play: async ({ canvasElement }) => {
    await loadedImage(canvasElement);
    await expect(
      canvasElement.querySelector("iframe, object, embed, script"),
    ).toBeNull();
    await expect(canvasElement.querySelectorAll("img")).toHaveLength(1);
    await new Promise((resolve) => setTimeout(resolve, 300));
    await expectOnlyLocalRequests();
  },
};

/** Markdown with `<script>`, event-handler HTML, a `javascript:` link and an
 * iframe. None of it may execute or reach the network. */
export const MaliciousMarkdownFile: Story = {
  args: {
    themeUI: "light",
    backgroundUI: "light",
    className: "w-[800px]",
    url: "./fixtures/malicious-markdown.txt",
    fileName: "malicious-markdown.txt",
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(
      await canvas.findByText("Malicious markdown fixture"),
    ).toBeVisible();
    await expect(
      canvasElement.querySelector("script, iframe, embed, object, [onerror]"),
    ).toBeNull();
    const hrefs = Array.from(
      canvasElement.querySelectorAll("#md-renderer a"),
    ).map((a) => a.getAttribute("href") ?? "");
    await expect(hrefs.length).toBeGreaterThan(0);
    for (const href of hrefs)
      await expect(href).not.toMatch(/^\s*javascript:/i);
    await new Promise((resolve) => setTimeout(resolve, 300));
    await expectOnlyLocalRequests();
  },
};

/** The observer itself: anything off-origin must be classified as remote. */
export const RequestObserverRejectsRemote: Story = {
  args: {
    themeUI: "light",
    backgroundUI: "light",
    className: "w-[800px]",
    url: "./fixtures/sample.txt",
  },
  play: async () => {
    await expect(isLocalRequest("./fixtures/sample.txt")).toBe(true);
    await expect(isLocalRequest(`${window.location.origin}/x`)).toBe(true);
    await expect(isLocalRequest("https://evil.example/exfil")).toBe(false);
    await expect(isLocalRequest("//evil.example/exfil")).toBe(false);
    await expect(isLocalRequest("http://localhost.evil.example/")).toBe(false);
    await expect(
      srcsetUrls("data:image/png;base64,a,b 1x, https://evil.example/a.png 2x"),
    ).toEqual(["data:image/png;base64,a,b", "https://evil.example/a.png"]);
    await expect(srcsetUrls("./a.png, https://evil.example/b.png")).toEqual([
      "./a.png",
      "https://evil.example/b.png",
    ]);
  },
};

/** A `srcset` candidate off-origin fails the DOM scan. A lone `<source>`
 * outside `<picture>` never loads, so nothing is requested. */
export const SrcsetObserverRejectsRemote: Story = {
  args: {
    themeUI: "light",
    backgroundUI: "light",
    className: "w-[800px]",
    url: "./fixtures/sample.txt",
  },
  play: async ({ canvasElement }) => {
    // parsed markup bypasses the setter and setAttribute hooks
    canvasElement.insertAdjacentHTML(
      "beforeend",
      '<source id="probe" srcset="./a.png 1x, https://evil.example/a.png 2x">',
    );
    const error = await expectOnlyLocalRequests().catch((e: Error) => e);
    canvasElement.querySelector("#probe")?.remove();
    await expect(error).toEqual(
      new Error("Non-local requests: https://evil.example/a.png"),
    );
  },
};

/** A URL set on a detached loading element is recorded when it is set. A
 * `<source>` outside a media element never loads, so nothing is requested. */
export const DetachedElementObserverRejectsRemote: Story = {
  args: {
    themeUI: "light",
    backgroundUI: "light",
    className: "w-[800px]",
    url: "./fixtures/sample.txt",
  },
  play: async () => {
    document.createElement("source").src = "https://evil.example/a.png";
    document
      .createElement("source")
      .setAttribute("srcset", "https://evil.example/b.png 2x");
    const error = await expectOnlyLocalRequests().catch((e: Error) => e);
    observed.requests = [];
    await expect(error).toEqual(
      new Error(
        "Non-local requests: https://evil.example/a.png, https://evil.example/b.png",
      ),
    );
  },
};

/** A `blob:` worker whose source names an off-origin URL fails the worker
 * check. The source only holds the URL as a string, so nothing is fetched. */
export const WorkerObserverRejectsRemote: Story = {
  args: {
    themeUI: "light",
    backgroundUI: "light",
    className: "w-[800px]",
    url: "./fixtures/sample.txt",
  },
  play: async () => {
    const source = 'const target = "https://evil.example/worker.mjs";';
    const worker = new Worker(URL.createObjectURL(new Blob([source])));
    worker.terminate();
    const error = await expectLocalWorkerScripts().catch((e: Error) => e);
    observed.workers = [];
    await expect(error).toEqual(
      new Error("Non-local worker scripts: https://evil.example/worker.mjs"),
    );
  },
};

// Chromium refuses port 9 (ERR_UNSAFE_PORT), so a probe that escapes its hook
// never leaves the browser.
const UNREACHABLE = "http://127.0.0.1:9";

const observerProbeArgs: Story["args"] = {
  themeUI: "light",
  backgroundUI: "light",
  className: "w-[800px]",
  url: "./fixtures/sample.txt",
};

/** `fetch` to another origin fails the check. */
export const FetchObserverRejectsRemote: Story = {
  args: observerProbeArgs,
  play: async () => {
    const url = `${UNREACHABLE}/fetch-probe`;
    observed.stubs.set("/fetch-probe", async () => new Response("probe"));
    await fetch(url);
    const error = await expectOnlyLocalRequests().catch((e: Error) => e);
    observed.requests = [];
    await expect(error).toEqual(new Error(`Non-local requests: ${url}`));
  },
};

/** `XMLHttpRequest.open` to another origin fails the check; it is never sent. */
export const XhrObserverRejectsRemote: Story = {
  args: observerProbeArgs,
  play: async () => {
    const url = `${UNREACHABLE}/xhr-probe`;
    new XMLHttpRequest().open("GET", url);
    const error = await expectOnlyLocalRequests().catch((e: Error) => e);
    observed.requests = [];
    await expect(error).toEqual(new Error(`Non-local requests: ${url}`));
  },
};

/** Each of `alert`, `confirm` and `prompt` fails the check. */
export const DialogObserverRejectsDialogs: Story = {
  args: observerProbeArgs,
  play: async () => {
    const dialogs: [string, () => void][] = [
      ["alert:a", () => window.alert("a")],
      ["confirm:c", () => window.confirm("c")],
      ["prompt:p", () => window.prompt("p")],
    ];
    for (const [entry, open] of dialogs) {
      open();
      const error = await expectOnlyLocalRequests().catch((e: Error) => e);
      observed.dialogs = [];
      await expect(error).toEqual(new Error(`Dialogs: ${entry}`));
    }
  },
};

/** `window.open` fails the check. */
export const WindowOpenObserverRejectsPopups: Story = {
  args: observerProbeArgs,
  play: async () => {
    const url = `${UNREACHABLE}/open-probe`;
    window.open(url);
    const error = await expectOnlyLocalRequests().catch((e: Error) => e);
    observed.opened = [];
    await expect(error).toEqual(new Error(`window.open: ${url}`));
  },
};

/** A `beforeunload` event fails the check. */
export const UnloadObserverRejectsUnloads: Story = {
  args: observerProbeArgs,
  play: async () => {
    window.dispatchEvent(new Event("beforeunload"));
    const error = await expectOnlyLocalRequests().catch((e: Error) => e);
    observed.unloads = 0;
    await expect(error).toEqual(new Error("beforeunload events: 1"));
  },
};

/** The DOM scan reads `href` and `xlink:href` on SVG `image`, `use` and
 * `feImage`. Template content is inert, so nothing is requested. */
export const SvgObserverScansHrefs: Story = {
  args: observerProbeArgs,
  play: async () => {
    const template = document.createElement("template");
    template.innerHTML = `<svg xmlns:xlink="http://www.w3.org/1999/xlink">
      <image href="https://evil.example/image.png" />
      <use xlink:href="https://evil.example/use.svg#a" />
      <filter><feImage href="https://evil.example/fe.png" /></filter>
    </svg>`;
    await expect(scannedUrls(template.content)).toEqual([
      "https://evil.example/image.png",
      "https://evil.example/use.svg#a",
      "https://evil.example/fe.png",
    ]);
  },
};

/** Resource timing entries from before a story starts are not checked. */
export const ObserverClearsResourceTimings: Story = {
  args: observerProbeArgs,
  play: async () => {
    const url = new URL("./fixtures/sample.txt?timing-probe", location.href)
      .href;
    const timed = () =>
      performance.getEntriesByType("resource").some((e) => e.name === url);
    await (await fetch(url)).text();
    await waitFor(() => expect(timed()).toBe(true));
    const stop = startObservers();
    const timedAfterStart = timed();
    stop();
    await expect(timedAfterStart).toBe(false);
  },
};

/** A load no hook sees (a CSS background) fails the check through resource
 * timing. Chromium records the blocked request without sending it. */
export const ResourceTimingObserverRejectsRemote: Story = {
  args: observerProbeArgs,
  play: async ({ canvasElement }) => {
    const url = `${UNREACHABLE}/timing-probe.png`;
    const probe = document.createElement("div");
    probe.style.backgroundImage = `url("${url}")`;
    probe.style.height = "1px";
    canvasElement.append(probe);
    await waitFor(() =>
      expect(
        performance.getEntriesByType("resource").map((e) => e.name),
      ).toContain(url),
    );
    const error = await expectOnlyLocalRequests().catch((e: Error) => e);
    probe.remove();
    performance.clearResourceTimings();
    await expect(error).toEqual(new Error(`Non-local requests: ${url}`));
  },
};

/** `src` set on a detached image is recorded when it is set. A lazy image
 * outside the document never loads, so nothing is requested. */
export const ImageSrcObserverRejectsRemote: Story = {
  args: observerProbeArgs,
  play: async () => {
    const url = `${UNREACHABLE}/image-probe.png`;
    const image = document.createElement("img");
    image.loading = "lazy";
    image.src = url;
    const error = await expectOnlyLocalRequests().catch((e: Error) => e);
    observed.requests = [];
    await expect(error).toEqual(new Error(`Non-local requests: ${url}`));
  },
};

/** The meta `afterEach` fails a story that changed the page URL. */
export const AfterEachRejectsNavigation: Story = {
  args: observerProbeArgs,
  play: async () => {
    const start = location.href;
    history.replaceState(history.state, "", "#navigated");
    const error = await meta.experimental_afterEach().catch((e: Error) => e);
    history.replaceState(history.state, "", start);
    await expect(error).toEqual(
      new Error(`Story navigated away to ${new URL("#navigated", start)}`),
    );
  },
};

/** The meta `afterEach` fails a story that made a non-local request. */
export const AfterEachRejectsRemoteRequests: Story = {
  args: observerProbeArgs,
  play: async () => {
    const url = `${UNREACHABLE}/after-each-probe`;
    new XMLHttpRequest().open("GET", url);
    const error = await meta.experimental_afterEach().catch((e: Error) => e);
    observed.requests = [];
    await expect(error).toEqual(new Error(`Non-local requests: ${url}`));
  },
};

const UNICODE_URL = "./fixtures/unicode.txt";

/** Reads the fixture with the browser's own UTF-8 decoder, as the reference. */
const loadUnicodeSource = async () => ({
  source: await (await fetch(UNICODE_URL)).text(),
});

const sourceParagraphs = (source: string) => source.trim().split(/\n\n+/);

const expectMarkdownText = async (
  canvasElement: HTMLElement,
  expected: string[],
) => {
  const renderer = await waitFor(() => {
    const el = canvasElement.querySelector("#md-renderer");
    expect(el).not.toBeNull();
    return el as HTMLElement;
  }, LOAD);
  const paragraphs = Array.from(renderer.querySelectorAll("p")).map(
    (p) => p.textContent,
  );
  await expect(paragraphs).toEqual(expected);
  // react-markdown separates block elements with "\n" text nodes
  await expect(renderer.textContent).toBe(expected.join("\n"));
};

/** Accented, non-Latin and emoji text fetched by the viewer renders unchanged. */
export const MarkdownUnicodeFixture: Story = {
  loaders: [loadUnicodeSource],
  args: {
    themeUI: "light",
    backgroundUI: "light",
    className: "w-[800px]",
    url: UNICODE_URL,
  },
  play: async ({ canvasElement, loaded }) => {
    await expectMarkdownText(canvasElement, sourceParagraphs(loaded.source));
    await expectOnlyLocalRequests();
  },
};

const utf8Base64 = (text: string) =>
  btoa(String.fromCharCode(...new TextEncoder().encode(text)));

/** Renders the markdown renderer directly with `fileData`, the only way to
 * reach its ArrayBuffer, percent-encoded and plain-string branches. */
const markdownDataStory = (
  toFileData: (source: string) => string | ArrayBuffer,
  expected: (source: string) => string[],
): Story => ({
  loaders: [loadUnicodeSource],
  args: {
    themeUI: "light",
    backgroundUI: "light",
    className: "w-[800px]",
    url: "",
  },
  render: (_args, { loaded }) => {
    const document = { uri: "", fileData: toFileData(loaded.source) };
    return (
      <MarkdownDocRenderer
        mainState={{
          currentFileNo: 0,
          documents: [document],
          currentDocument: document,
          language: "en",
        }}
      />
    );
  },
  play: async ({ canvasElement, loaded }) => {
    await expectMarkdownText(canvasElement, expected(loaded.source));
  },
});

export const MarkdownBase64DataUrl = markdownDataStory(
  (source) => `data:text/markdown;base64,${utf8Base64(source)}`,
  sourceParagraphs,
);

// The `;base64` marker is matched case-insensitively.
export const MarkdownBase64UppercaseMarker = markdownDataStory(
  (source) => `data:text/markdown;BASE64,${utf8Base64(source)}`,
  sourceParagraphs,
);

export const MarkdownPercentEncodedDataUrl = markdownDataStory(
  (source) => `data:text/markdown;charset=utf-8,${encodeURIComponent(source)}`,
  sourceParagraphs,
);

// Without `;base64` the payload is percent-decoded even when it is valid base64.
export const MarkdownPercentPayloadNotBase64 = markdownDataStory(
  () => "data:text/plain,test",
  () => ["test"],
);

export const MarkdownArrayBuffer = markdownDataStory(
  (source) => new TextEncoder().encode(source).buffer as ArrayBuffer,
  sourceParagraphs,
);

export const MarkdownPlainString = markdownDataStory(
  (source) => source,
  sourceParagraphs,
);

export const MarkdownEmptyBase64DataUrl = markdownDataStory(
  () => "data:text/markdown;base64,",
  () => [],
);

export const MarkdownEmptyPercentDataUrl = markdownDataStory(
  () => "data:text/markdown,",
  () => [],
);

export const MarkdownEmptyArrayBuffer = markdownDataStory(
  () => new ArrayBuffer(0),
  () => [],
);
