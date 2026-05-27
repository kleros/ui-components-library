import React from "react";
import { type DocRenderer } from "@cyntler/react-doc-viewer";
import ReactMarkdown from "react-markdown";

const decodeBase64Utf8 = (base64: string): string => {
  const binary = atob(base64);
  const bytes = Uint8Array.from(binary, (char) => char.codePointAt(0) ?? 0);
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
    // RFC 2397: `data:[<mediatype>][;base64],<payload>` — the payload is
    // base64 only when `;base64` is the last parameter before the comma;
    // otherwise it's percent-encoded. Dispatching on `atob` success would
    // mis-decode payloads that happen to be valid base64 by coincidence
    // (e.g. the literal string "test" atob's into garbage bytes).
    const commaIdx = fileData.indexOf(",");
    const header =
      commaIdx === -1 ? "" : fileData.slice("data:".length, commaIdx);
    const payload = commaIdx === -1 ? "" : fileData.slice(commaIdx + 1);
    const isBase64 = header.toLowerCase().endsWith(";base64");
    try {
      text = isBase64 ? decodeBase64Utf8(payload) : decodeURIComponent(payload);
    } catch {
      text = "";
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
