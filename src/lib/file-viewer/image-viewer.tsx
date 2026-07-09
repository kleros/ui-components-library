import React from "react";
import { cn } from "../../utils";
import type { FileRendererProps } from "./types";

// Transparency checkerboard drawn behind the image. Uses the
// `--klerosUIComponentsImageCheckerColor` custom property so consumers can
// override the check color anywhere up the tree. Kept as an inline style (not a
// Tailwind arbitrary value) because the four-gradient stack reads far more
// clearly here than inlined into a class string.
const checker = "var(--klerosUIComponentsImageCheckerColor)";
const checkerboard: React.CSSProperties = {
  backgroundImage: [
    `linear-gradient(45deg, ${checker} 25%, transparent 25%)`,
    `linear-gradient(-45deg, ${checker} 25%, transparent 25%)`,
    `linear-gradient(45deg, transparent 75%, ${checker} 75%)`,
    `linear-gradient(-45deg, transparent 75%, ${checker} 75%)`,
  ].join(","),
  backgroundSize: "20px 20px",
  backgroundPosition: "0 0, 0 10px, 10px -10px, -10px 0px",
};

/** Renders a raster image. Reuses the `#image-renderer` / `#image-img` ids the
 * SVG renderer also targets, so the surrounding styling stays uniform. */
const ImageViewer = ({ uri, fileName }: FileRendererProps) => (
  <div
    id="image-renderer"
    style={checkerboard}
    className={cn(
      "bg-klerosUIComponentsWhiteBackground",
      "flex items-center justify-center px-6 py-4",
    )}
  >
    <img
      id="image-img"
      src={uri}
      alt={fileName ?? ""}
      className="max-h-[80vh] max-w-full"
    />
  </div>
);

export default ImageViewer;
