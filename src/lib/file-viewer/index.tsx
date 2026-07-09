import React, { lazy, Suspense, useMemo } from "react";

import { cn } from "../../utils";
import { useFileType } from "./use-file-type";
import { ViewerMessage } from "./status";
import ImageViewer from "./image-viewer";
import SvgViewer from "./svg-viewer";
import TextViewer from "./text-viewer";
import VideoViewer from "./video-viewer";
import DownloadButton from "./download-button";
import type { FileKind, FileRendererProps, FileViewerConfig } from "./types";

// Heavy renderers are code-split so a consumer only downloads a format's
// dependencies when a file of that type is actually opened: pdf.js (~2 MB) for
// PDFs, react-markdown for Markdown, papaparse for CSV. The image, SVG, and
// text renderers are tiny and stay in the main chunk.
const PdfViewer = lazy(() => import("./pdf-viewer"));
const MarkdownViewer = lazy(() => import("./markdown-viewer"));
const CsvViewer = lazy(() => import("./csv-viewer"));

interface FileViewerProps {
  /** URL of the file to display. Supports https:, http:, blob:, and data: URIs. */
  url: string;
  /** Optional file name override (used for download). Useful when the URL path lacks a meaningful filename. */
  fileName?: string;
  /** Viewer configuration (PDF zoom defaults, no-renderer override). */
  config?: FileViewerConfig;
  /** Class applied to the outer wrapper. */
  className?: string;
  /**
   * Opt-in allowlist of `data:` URI MIME types that bypass the script-execution
   * gate. By default the viewer rejects `data:` URLs whose MIME can execute
   * code on top-frame navigation: `text/html`, `application/xhtml+xml`,
   * `application/xml`, `text/xml`, `image/svg+xml`.
   *
   * Pass entries here only when the URL source is trusted. `image/svg+xml`
   * is rendered through `<img>` (W3C secure static mode — scripts and
   * external references are disabled by the browser) so opting it in stays
   * safe; the other entries lose the defense-in-depth gate against the
   * fallback "open in new tab" link.
   */
  allowedDataMimes?: readonly string[];
}

const SAFE_URL_SCHEMES = new Set(["http:", "https:", "blob:", "data:"]);

// Data-URL MIMEs that execute script on top-frame navigation. Modern Firefox
// and Chrome already block most of these via their data:-navigation
// restrictions, but coverage varies by version and type (XHTML and XML have
// historically slipped through), so re-enforcing at the gate keeps the threat
// model trivially auditable. SVG is included because `<svg onload>` runs
// script when navigated to (it does not when loaded via `<img src>`). XML and
// XHTML can execute script via xml-stylesheet processing instructions or
// inline `<script>` once parsed as a document.
const UNSAFE_DATA_MIMES = new Set([
  "text/html",
  "application/xhtml+xml",
  "application/xml",
  "text/xml",
  "image/svg+xml",
]);

/**
 * Returns true if `raw` is a relative URL or uses an allowlisted scheme.
 * Blocks `javascript:`, `vbscript:`, `file:`, `about:`, and anything else
 * that could execute code or escape sandboxing when clicked.
 *
 * `allowedDataMimes` is a consumer-supplied override for the default
 * `UNSAFE_DATA_MIMES` blocklist — entries here pass even if blocklisted.
 */
const isSafeUrl = (
  raw: string,
  allowedDataMimes: ReadonlySet<string>,
): boolean => {
  if (typeof raw !== "string" || raw.length === 0) return false;
  let parsed: URL;
  try {
    parsed = new URL(raw);
  } catch {
    // Relative URLs (e.g. "/foo", "./bar.pdf") throw — they resolve against
    // the page origin and inherit its safety, so they're allowed.
    return true;
  }
  const protocol = parsed.protocol.toLowerCase();
  if (!SAFE_URL_SCHEMES.has(protocol)) return false;
  if (protocol === "data:") {
    const rawMime = parsed.pathname.split(/[,;]/)[0].trim().toLowerCase();
    // Defense-in-depth: spec-compliant browsers do NOT percent-decode the
    // data:-URL mediatype (WHATWG Fetch § data URL processor parses it raw;
    // Chromium's DataURL::Parse only unescapes the body), so `text%2Fhtml`
    // fails MIME parsing and falls back to `text/plain` — already safe. We
    // decode anyway to harden against legacy or non-conforming runtimes;
    // reject if decoding throws so malformed inputs can't slip through.
    let mime: string;
    try {
      mime = decodeURIComponent(rawMime);
    } catch {
      return false;
    }
    if (allowedDataMimes.has(mime)) return true;
    if (UNSAFE_DATA_MIMES.has(mime)) return false;
  }
  return true;
};

const UnsupportedUrlMessage = ({ url }: { url: string }) => (
  <div
    className={cn(
      "text-klerosUIComponentsSecondaryText text-sm",
      "flex flex-col gap-2 p-6",
    )}
  >
    <p>Unable to display this file.</p>
    <p className="font-mono text-xs break-all">{url}</p>
  </div>
);

const NoRendererFallback = ({ uri, fileName }: FileRendererProps) => (
  <div
    className={cn(
      "text-klerosUIComponentsPrimaryText text-sm",
      "flex flex-col items-start gap-3 p-6",
    )}
  >
    <p>This file type can&apos;t be previewed.</p>
    <a
      className="text-klerosUIComponentsPrimaryBlue underline"
      href={uri}
      download={fileName}
      rel="noopener noreferrer"
      target="_blank"
    >
      Open in a new tab
    </a>
  </div>
);

/**
 * Displays a file from a URL inside the application. Supports PDFs, images
 * (incl. SVG), markdown, plaintext, and CSV.
 *
 * Security: rejects `javascript:`, `vbscript:`, `file:`, and other unlisted
 * schemes up front so a hostile `url` can't deliver code execution through a
 * renderer or the fallback download link. Text-based content is rendered as
 * escaped React children (never `dangerouslySetInnerHTML`) and SVG is loaded
 * through `<img>` secure-static mode.
 */
function FileViewer({
  url,
  fileName,
  config,
  className,
  allowedDataMimes,
}: Readonly<FileViewerProps>) {
  const allowedDataMimesSet = useMemo(
    () => new Set((allowedDataMimes ?? []).map((m) => m.toLowerCase())),
    [allowedDataMimes],
  );
  const safe = isSafeUrl(url, allowedDataMimesSet);

  const { kind } = useFileType(url, safe);

  const Override = config?.noRenderer?.overrideComponent ?? NoRendererFallback;

  const renderers: Record<Exclude<FileKind, "unsupported">, React.ReactNode> = {
    pdf: (
      <PdfViewer
        uri={url}
        fileName={fileName}
        defaultZoom={config?.pdfDefaultZoom}
        zoomJump={config?.pdfZoomJump}
      />
    ),
    image: <ImageViewer uri={url} fileName={fileName} />,
    svg: <SvgViewer uri={url} fileName={fileName} />,
    markdown: <MarkdownViewer uri={url} fileName={fileName} />,
    text: <TextViewer uri={url} fileName={fileName} />,
    csv: <CsvViewer uri={url} fileName={fileName} />,
    video: <VideoViewer uri={url} fileName={fileName} />,
  };

  let body: React.ReactNode;
  if (!safe) {
    body = <UnsupportedUrlMessage url={url} />;
  } else if (kind === null) {
    body = <ViewerMessage>Loading…</ViewerMessage>;
  } else if (kind === "unsupported") {
    body = <Override uri={url} fileName={fileName} />;
  } else {
    body = renderers[kind];
  }

  return (
    <div
      className={cn(
        "bg-klerosUIComponentsWhiteBackground shadow-default",
        "rounded-base relative overflow-hidden",
        className,
      )}
    >
      {safe && <DownloadButton url={url} fileName={fileName} />}
      <div className="max-h-[80vh] overflow-auto">
        <Suspense fallback={<ViewerMessage>Loading…</ViewerMessage>}>
          {body}
        </Suspense>
      </div>
    </div>
  );
}

export default FileViewer;
