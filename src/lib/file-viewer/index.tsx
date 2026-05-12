import React, { useMemo } from "react";
import DocViewer, {
  DocViewerRenderers,
  type IConfig,
  type ITheme,
} from "@cyntler/react-doc-viewer";

import { cn } from "../../utils";
import MarkdownDocRenderer from "./markdown-viewer";
import "@cyntler/react-doc-viewer/dist/index.css";

interface FileViewerProps {
  /** URL of the file to display. Supports URLs, blob URLs, data URIs, and IPFS URIs. */
  url: string;
  /** Optional file name override (used for download). Useful for IPFS URIs that lack one. */
  fileName?: string;
  /** Override the DocViewer config. Merged shallowly over the defaults. */
  config?: IConfig;
  /** Class applied to the outer wrapper. */
  className?: string;
}

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

/**
 * Displays a file from a URL inside the application. Supports PDFs, images,
 * markdown, plaintext, and common document formats.
 */
function FileViewer({
  url,
  fileName,
  config,
  className,
}: Readonly<FileViewerProps>) {
  const docs = useMemo(() => [{ uri: url, fileName }], [url, fileName]);

  const pluginRenderers = useMemo(
    () => [...DocViewerRenderers, MarkdownDocRenderer],
    [],
  );

  const mergedConfig = useMemo<IConfig>(
    () => ({ ...defaultConfig, ...config }),
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
    </div>
  );
}

export default FileViewer;
