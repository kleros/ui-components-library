import React from "react";
import { type DocRenderer } from "@cyntler/react-doc-viewer";

// Render SVG via `<img src>` rather than navigating to it or embedding it as a
// document. `<img>`-loaded SVG runs in the W3C "secure static" mode: scripts,
// event handlers, external `<image>`/`<use>` references, CSS `url()`, and
// `<foreignObject>` are all disabled by the browser. This is the same sandbox
// GitHub, Wikipedia, and Notion use for user-uploaded SVGs. Without this
// renderer, DocViewer has no SVG match and falls back to the "open in new
// tab" link, which top-frame-navigates to the URL and executes any scripts
// in the SVG document.
//
// IDs match upstream image renderer ids (`#image-renderer`, `#image-img`) so
// the existing arbitrary-variant styles in `index.tsx` apply uniformly.
// `flex items-center justify-center` here mirrors what doc-viewer's PNG
// styled-component provides for raster renderers — our element doesn't pick
// up that class, so we set it inline to keep the image centered.
const SvgDocRenderer: DocRenderer = ({ mainState: { currentDocument } }) => {
  if (!currentDocument?.uri) return null;
  return (
    <div id="image-renderer" className="flex items-center justify-center">
      <img
        id="image-img"
        src={currentDocument.uri}
        alt={currentDocument.fileName ?? ""}
      />
    </div>
  );
};

SvgDocRenderer.fileTypes = ["svg", "image/svg+xml"];
SvgDocRenderer.weight = 1;

export default SvgDocRenderer;
