import React from "react";
import { cn } from "../../utils";
import { ViewerMessage } from "./status";
import { useFileText } from "./use-file-text";
import type { FileRendererProps } from "./types";

/**
 * Renders plain text. The content is a string interpolated as a React child, so
 * React escapes it — a `.txt` full of `<script>` shows as literal text, never
 * executes. (This is the deliberately-safe replacement for react-doc-viewer's
 * TXTRenderer, which the same escaping made non-exploitable but which triggered
 * a recurring advisory.)
 */
const TextViewer = ({ uri }: FileRendererProps) => {
  const { text, loading, error } = useFileText(uri);

  if (loading) return <ViewerMessage>Loading…</ViewerMessage>;
  if (error || text === null)
    return <ViewerMessage>Unable to load this file.</ViewerMessage>;

  return (
    <pre
      id="txt-renderer"
      className={cn(
        "text-klerosUIComponentsPrimaryText p-6 text-sm",
        "font-mono break-words whitespace-pre-wrap",
      )}
    >
      {text}
    </pre>
  );
};

export default TextViewer;
