import type React from "react";

/** The categories of file the viewer knows how to render inline. */
export type FileKind =
  | "pdf"
  | "image"
  | "svg"
  | "markdown"
  | "text"
  | "csv"
  | "video"
  | "unsupported";

/** Props every inline renderer receives. Text-based renderers fetch the
 * content themselves from `uri`; binary renderers (pdf, image, svg) hand the
 * `uri` straight to the browser/pdf.js. */
export interface FileRendererProps {
  /** The already-safety-checked URL of the file. */
  uri: string;
  /** Optional download name, used by the fallback link. */
  fileName?: string;
}

/**
 * Optional viewer configuration. Replaces the old react-doc-viewer `IConfig`
 * with only the knobs this viewer actually exposes.
 */
export interface FileViewerConfig {
  /** Initial PDF zoom as a scale factor (1 = 100%). Default 1. */
  pdfDefaultZoom?: number;
  /** How much each zoom step changes the scale factor. Default 0.2. */
  pdfZoomJump?: number;
  /** Override the component shown when a file type can't be previewed. */
  noRenderer?: {
    overrideComponent?: React.ComponentType<FileRendererProps>;
  };
}
