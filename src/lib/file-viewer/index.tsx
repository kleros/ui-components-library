import React, { useMemo } from "react";
import DocViewer, {
  DocViewerRenderers,
  type IConfig,
  type ITheme,
  type IDocument,
} from "@cyntler/react-doc-viewer";

import { cn } from "../../utils";
import MarkdownDocRenderer from "./markdown-viewer";
import "@cyntler/react-doc-viewer/dist/index.css";

interface FileViewerProps {
  /** URL of the file to display. Supports https:, http:, blob:, and data: URIs. */
  url: string;
  /** Optional file name override (used for download). Useful when the URL path lacks a meaningful filename. */
  fileName?: string;
  /** Override the DocViewer config. Merged shallowly over the defaults. */
  config?: IConfig;
  /** Class applied to the outer wrapper. */
  className?: string;
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
 */
const isSafeUrl = (raw: string): boolean => {
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
    if (UNSAFE_DATA_MIMES.has(mime)) return false;
  }
  return true;
};

type PdfjsLib = {
  version?: string;
  GlobalWorkerOptions?: { workerSrc?: string };
};

const getPdfjs = (): PdfjsLib | undefined =>
  typeof globalThis === "undefined"
    ? undefined
    : (globalThis as unknown as { pdfjsLib?: PdfjsLib }).pdfjsLib;

const buildDefaultPdfWorkerSrc = (): string => {
  // doc-viewer bundles its own pdfjs and assigns it to globalThis.pdfjsLib at
  // module init; reading the version from there guarantees the worker we load
  // matches the runtime pdfjs (mismatched versions throw "incompatible worker").
  // Fallback constant is the version doc-viewer@1.17.x ships with.
  const version = getPdfjs()?.version ?? "4.3.136";
  return `https://cdn.jsdelivr.net/npm/pdfjs-dist@${version}/build/pdf.worker.min.mjs`;
};

const setPdfWorkerSrc = (src: string): void => {
  const lib = getPdfjs();
  if (lib?.GlobalWorkerOptions && lib.GlobalWorkerOptions.workerSrc !== src) {
    lib.GlobalWorkerOptions.workerSrc = src;
  }
};

// Module init: doc-viewer's module top-level code points workerSrc at
// unpkg.com. Override it immediately so no unpkg request ever fires (the
// worker is only fetched when a PDF is rendered, which is always after this).
setPdfWorkerSrc(buildDefaultPdfWorkerSrc());

/**
 * Override the PDF.js worker URL globally. Call once at app startup if you
 * want to self-host the worker (e.g. under strict CSP) instead of using the
 * default version-pinned jsDelivr URL. The worker is a process-wide singleton
 * on `globalThis.pdfjsLib.GlobalWorkerOptions` — there is no per-instance
 * configuration.
 */
export const configurePdfWorker = (src: string): void => {
  setPdfWorkerSrc(src);
};

const defaultConfig: IConfig = {
  header: {
    disableHeader: true,
    disableFileName: true,
  },
  pdfZoom: {
    defaultZoom: 0.8,
    zoomJump: 0.1,
  },
  pdfVerticalScrollByDefault: true,
};

const docTheme: ITheme = {
  primary: "var(--klerosUIComponentsWhiteBackground)",
  secondary: "var(--klerosUIComponentsLightBackground)",
  tertiary: "var(--klerosUIComponentsLightBackground)",
  textPrimary: "var(--klerosUIComponentsPrimaryText)",
  textSecondary: "var(--klerosUIComponentsSecondaryText)",
  textTertiary: "var(--klerosUIComponentsSecondaryText)",
};

const UnsupportedUrlMessage = ({ url }: { url: string }) => (
  <div
    className={cn(
      "text-klerosUIComponentsSecondaryText",
      "flex flex-col gap-2 p-6 text-sm",
    )}
  >
    <p>Unable to display this file.</p>
    <p className="font-mono text-xs break-all">{url}</p>
  </div>
);

const NoRendererFallback = ({
  document,
  fileName,
}: {
  document: IDocument | undefined;
  fileName: string;
}) => (
  <div
    className={cn(
      "text-klerosUIComponentsPrimaryText",
      "flex flex-col items-start gap-3 p-6 text-sm",
    )}
  >
    <p>This file type can&apos;t be previewed.</p>
    <a
      className="text-klerosUIComponentsPrimaryBlue underline"
      href={document?.uri ?? ""}
      download={fileName}
      rel="noopener noreferrer"
      target="_blank"
    >
      Open in a new tab
    </a>
  </div>
);

/**
 * Displays a file from a URL inside the application. Supports PDFs, images,
 * markdown, plaintext, and common document formats.
 *
 * Security: rejects `javascript:`, `vbscript:`, `file:`, and other unlisted
 * schemes up front so a hostile `url` can't deliver code execution through
 * the underlying viewer or its fallback download link.
 */
function FileViewer({
  url,
  fileName,
  config,
  className,
}: Readonly<FileViewerProps>) {
  const safe = isSafeUrl(url);

  const docs = useMemo(() => [{ uri: url, fileName }], [url, fileName]);

  const pluginRenderers = useMemo(
    () => [...DocViewerRenderers, MarkdownDocRenderer],
    [],
  );

  const mergedConfig = useMemo<IConfig>(
    () => ({
      ...defaultConfig,
      ...config,
      noRenderer: {
        ...config?.noRenderer,
        overrideComponent:
          config?.noRenderer?.overrideComponent ?? NoRendererFallback,
      },
    }),
    [config],
  );

  return (
    <div
      className={cn(
        "bg-klerosUIComponentsWhiteBackground shadow-default",
        "rounded-base max-h-[80vh] overflow-auto",
        className,
      )}
    >
      {safe ? (
        <DocViewer
          documents={docs}
          pluginRenderers={pluginRenderers}
          config={mergedConfig}
          theme={docTheme}
          className={cn(
            "!bg-klerosUIComponentsWhiteBackground",
            "[&_#pdf-controls]:!z-[3]",
            "[&_#pdf-controls_svg_path]:!fill-klerosUIComponentsPrimaryText",
            "[&_#pdf-controls_svg_polygon]:!fill-klerosUIComponentsPrimaryText",
            "[&_#image-renderer]:!bg-klerosUIComponentsWhiteBackground",
            "[&_[class*='--loading']]:text-klerosUIComponentsSecondaryText",
          )}
        />
      ) : (
        <UnsupportedUrlMessage url={url} />
      )}
    </div>
  );
}

export default FileViewer;
