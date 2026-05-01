import React, { useMemo } from "react";
import DocViewer, {
  DocViewerRenderers,
  type IConfig,
} from "@cyntler/react-doc-viewer";

import { cn } from "../../utils";
import MarkdownDocRenderer from "./markdown-viewer";
import "@cyntler/react-doc-viewer/dist/index.css";
import "./styles.css";

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

/**
 * In-app viewer for policies, evidence attachments, and arbitrary file-URI
 * links. Supports PDFs, images, markdown, plaintext, and common document
 * formats via `@cyntler/react-doc-viewer`.
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
        "max-h-[80vh] overflow-auto rounded-[3px]",
        className,
      )}
    >
      <DocViewer
        documents={docs}
        pluginRenderers={pluginRenderers}
        config={mergedConfig}
        className="kleros-file-viewer-doc"
      />
    </div>
  );
}

export default FileViewer;
