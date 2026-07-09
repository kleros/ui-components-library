import React, { useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

import { cn } from "../../utils";
import { ViewerMessage } from "./status";
import type { FileRendererProps } from "./types";

// pdf.js parses documents in a Web Worker whose version must match the API.
// Point it at the worker inside the pinned `pdfjs-dist`, resolved as a bundled
// asset via `import.meta.url`. Per react-pdf's docs this MUST live in the same
// module that renders <Document>/<Page>: react-pdf assigns a bare-string
// default to `workerSrc` on import, and a separate setup module can be
// overwritten by load order, silently reverting to that broken default.
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url,
).toString();

const MIN_ZOOM = 0.25;
const MAX_ZOOM = 4;

const clampZoom = (z: number): number =>
  Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, z));

interface PdfViewerProps extends FileRendererProps {
  defaultZoom?: number;
  zoomJump?: number;
}

const ZoomButton = ({
  label,
  onClick,
  disabled,
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
}) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    className={cn(
      "text-klerosUIComponentsPrimaryText flex h-7 w-7 items-center justify-center",
      "rounded-base text-lg leading-none disabled:opacity-40",
      "hover:bg-klerosUIComponentsPrimaryPurple/15",
    )}
  >
    {label}
  </button>
);

/**
 * Renders every page of a PDF in a vertical scroll, with a sticky translucent
 * zoom toolbar. Replaces react-doc-viewer's PDF renderer + `#pdf-controls`;
 * pdf.js runs through the pinned `pdfjs-dist` worker configured above.
 */
const PdfViewer = ({
  uri,
  defaultZoom = 1,
  zoomJump = 0.2,
}: PdfViewerProps) => {
  const [numPages, setNumPages] = useState(0);
  // Clamp the initial zoom too: a misconfigured `pdfDefaultZoom` (e.g. 0 or 10)
  // would otherwise render out of bounds until the first manual zoom.
  const [zoom, setZoom] = useState(() => clampZoom(defaultZoom));

  const changeZoom = (delta: number) =>
    setZoom((z) => clampZoom(+(z + delta).toFixed(2)));

  return (
    <div className="relative flex flex-col">
      <div
        id="pdf-controls"
        className={cn(
          "sticky top-0 z-[3] flex items-center justify-center gap-2 p-2",
          "bg-klerosUIComponentsPrimaryPurple/15 backdrop-saturate-150",
          "dark:bg-klerosUIComponentsLightBackground/50",
        )}
      >
        <ZoomButton
          label="−"
          onClick={() => changeZoom(-zoomJump)}
          disabled={zoom <= MIN_ZOOM}
        />
        <span className="text-klerosUIComponentsSecondaryText w-12 text-center text-sm tabular-nums">
          {Math.round(zoom * 100)}%
        </span>
        <ZoomButton
          label="+"
          onClick={() => changeZoom(zoomJump)}
          disabled={zoom >= MAX_ZOOM}
        />
      </div>

      <Document
        file={uri}
        loading={<ViewerMessage>Loading PDF…</ViewerMessage>}
        error={<ViewerMessage>Unable to load this PDF.</ViewerMessage>}
        noData={<ViewerMessage>No PDF to display.</ViewerMessage>}
        onLoadSuccess={({ numPages: n }) => setNumPages(n)}
        className="flex flex-col items-center gap-4 p-4"
      >
        {Array.from({ length: numPages }, (_, i) => (
          <Page
            key={i}
            pageNumber={i + 1}
            scale={zoom}
            className="shadow-default max-w-full"
            loading=""
          />
        ))}
      </Document>
    </div>
  );
};

export default PdfViewer;
