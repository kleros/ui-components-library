import React, { useMemo } from "react";
import DocViewer, {
  DocViewerRenderers,
  type IConfig,
  type ITheme,
  type IDocument,
} from "@cyntler/react-doc-viewer";

import { cn } from "../../utils";
import MarkdownDocRenderer from "./markdown-viewer";
import SvgDocRenderer from "./svg-viewer";
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
      "text-klerosUIComponentsSecondaryText text-sm",
      "flex flex-col gap-2 p-6",
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
      "text-klerosUIComponentsPrimaryText text-sm",
      "flex flex-col items-start gap-3 p-6",
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
  allowedDataMimes,
}: Readonly<FileViewerProps>) {
  const allowedDataMimesSet = useMemo(
    () => new Set((allowedDataMimes ?? []).map((m) => m.toLowerCase())),
    [allowedDataMimes],
  );
  const safe = isSafeUrl(url, allowedDataMimesSet);

  const docs = useMemo(() => [{ uri: url, fileName }], [url, fileName]);

  const pluginRenderers = useMemo(
    () => [...DocViewerRenderers, MarkdownDocRenderer, SvgDocRenderer],
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
            "[&_#pdf-controls]:!bg-klerosUIComponentsPrimaryPurple/15",
            "dark:[&_#pdf-controls]:!bg-klerosUIComponentsLightBackground/50",
            "[&_#pdf-controls]:!backdrop-saturate-150",
            "[&_#pdf-controls_svg_path]:!fill-klerosUIComponentsPrimaryText",
            "[&_#pdf-controls_svg_polygon]:!fill-klerosUIComponentsPrimaryText",
            "[&_#image-renderer]:!bg-klerosUIComponentsWhiteBackground",
            "[&_#image-renderer]:!h-auto",
            "[&_#image-renderer]:!flex-none",
            "[&_#image-renderer]:!px-6",
            // Transparency checkerboard. The gradient is inlined in the
            // arbitrary property (rather than a theme token) so the inner
            // `var(--klerosUIComponentsImageCheckerColor)` resolves at this
            // element's cascade — consumers can override that single variable
            // anywhere up the tree and the color propagates. A theme-token
            // wrapper would bake the inner var() at `:root` and the override
            // would silently no-op for descendants. Full arbitrary-property
            // syntax (not `bg-*` shortcut) so `tailwind-merge` recognizes this
            // as background-image and doesn't collide with the bg-color above.
            // eslint-disable-next-line max-len
            "[&_#image-renderer]:![background-image:linear-gradient(45deg,var(--klerosUIComponentsImageCheckerColor)_25%,transparent_25%),linear-gradient(-45deg,var(--klerosUIComponentsImageCheckerColor)_25%,transparent_25%),linear-gradient(45deg,transparent_75%,var(--klerosUIComponentsImageCheckerColor)_75%),linear-gradient(-45deg,transparent_75%,var(--klerosUIComponentsImageCheckerColor)_75%)]",
            "[&_#image-renderer]:![background-size:20px_20px]",
            "[&_#image-renderer]:![background-position:0_0,0_10px,10px_-10px,-10px_0px]",
            "[&_#image-img]:!max-w-full",
            "[&_#image-img]:!max-h-[80vh]",
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
