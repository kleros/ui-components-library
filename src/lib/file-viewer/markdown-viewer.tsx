import React from "react";
import ReactMarkdown from "react-markdown";

import { ViewerMessage } from "./status";
import { useFileText } from "./use-file-text";
import type { FileRendererProps } from "./types";

/**
 * Renders Markdown. `react-markdown` is used without `rehype-raw`, so raw HTML
 * embedded in the document is NOT parsed as markup — it renders as escaped
 * text. That keeps hostile `.md` content inert. The body is fetched via
 * `useFileText`, which decodes `data:`/`blob:` URLs for us.
 */
const MarkdownViewer = ({ uri }: FileRendererProps) => {
  const { text, loading, error } = useFileText(uri);

  if (loading) return <ViewerMessage>Loading…</ViewerMessage>;
  if (error || text === null)
    return <ViewerMessage>Unable to load this file.</ViewerMessage>;

  return (
    <div
      id="md-renderer"
      className="text-klerosUIComponentsPrimaryText [&_code]:text-klerosUIComponentsSecondaryText p-4 [&_a]:text-base"
    >
      <ReactMarkdown>{text}</ReactMarkdown>
    </div>
  );
};

export default MarkdownViewer;
