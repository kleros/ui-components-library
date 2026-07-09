import React from "react";
import type { FileRendererProps } from "./types";

/**
 * Render SVG via `<img src>` rather than embedding it as a document. An
 * `<img>`-loaded SVG runs in the W3C "secure static" mode: scripts, event
 * handlers, external `<image>`/`<use>` references, CSS `url()`, and
 * `<foreignObject>` are all disabled by the browser. This is the same sandbox
 * GitHub, Wikipedia, and Notion use for user-uploaded SVGs. Rendering it any
 * other way (inline, or a top-frame navigation) would execute scripts embedded
 * in the SVG document.
 *
 * Reuses the `#image-renderer` / `#image-img` ids so it shares the raster image
 * renderer's surrounding styling.
 */
const SvgViewer = ({ uri, fileName }: FileRendererProps) => (
  <div
    id="image-renderer"
    className="flex items-center justify-center px-6 py-4"
  >
    <img
      id="image-img"
      src={uri}
      alt={fileName ?? ""}
      className="max-h-[80vh] max-w-full"
    />
  </div>
);

export default SvgViewer;
