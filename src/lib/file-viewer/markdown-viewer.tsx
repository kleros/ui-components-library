import React from "react";
import { type DocRenderer } from "@cyntler/react-doc-viewer";
import ReactMarkdown from "react-markdown";

const MarkdownDocRenderer: DocRenderer = ({
  mainState: { currentDocument },
}) => {
  if (!currentDocument) return null;

  const fileData = currentDocument.fileData as string;
  const base64String = fileData.includes(",")
    ? fileData.split(",")[1]
    : fileData;
  const decodedData = atob(base64String);

  return (
    <div
      id="md-renderer"
      className="text-klerosUIComponentsPrimaryText [&_code]:text-klerosUIComponentsSecondaryText p-4 [&_a]:text-base"
    >
      <ReactMarkdown>{decodedData}</ReactMarkdown>
    </div>
  );
};

MarkdownDocRenderer.fileTypes = ["md", "text/plain"];
MarkdownDocRenderer.weight = 1;

export default MarkdownDocRenderer;
