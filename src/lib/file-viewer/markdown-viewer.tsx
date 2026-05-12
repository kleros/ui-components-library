import React from "react";
import { type DocRenderer } from "@cyntler/react-doc-viewer";
import ReactMarkdown from "react-markdown";

const decodeBase64Utf8 = (base64: string): string => {
  const binary = atob(base64);
  const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
  return new TextDecoder("utf-8").decode(bytes);
};

const MarkdownDocRenderer: DocRenderer = ({
  mainState: { currentDocument },
}) => {
  if (!currentDocument?.fileData) return null;

  const { fileData } = currentDocument;
  let text: string;

  if (fileData instanceof ArrayBuffer) {
    text = new TextDecoder("utf-8").decode(fileData);
  } else if (fileData.startsWith("data:")) {
    const [, payload = ""] = fileData.split(",", 2);
    try {
      text = decodeBase64Utf8(payload);
    } catch {
      text = decodeURIComponent(payload);
    }
  } else {
    text = fileData;
  }

  return (
    <div
      id="md-renderer"
      className="text-klerosUIComponentsPrimaryText [&_code]:text-klerosUIComponentsSecondaryText p-4 [&_a]:text-base"
    >
      <ReactMarkdown>{text}</ReactMarkdown>
    </div>
  );
};

MarkdownDocRenderer.fileTypes = ["md", "text/plain"];
MarkdownDocRenderer.weight = 1;

export default MarkdownDocRenderer;
