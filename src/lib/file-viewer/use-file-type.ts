import { useEffect, useState } from "react";
import type { FileKind } from "./types";

const EXTENSION_KINDS: Record<string, FileKind> = {
  pdf: "pdf",
  png: "image",
  jpg: "image",
  jpeg: "image",
  gif: "image",
  bmp: "image",
  webp: "image",
  tiff: "image",
  tif: "image",
  avif: "image",
  ico: "image",
  svg: "svg",
  md: "markdown",
  markdown: "markdown",
  txt: "text",
  text: "text",
  log: "text",
  csv: "csv",
  mp4: "video",
  webm: "video",
  mov: "video",
  avi: "video",
  mkv: "video",
  m4v: "video",
  ogv: "video",
};

/**
 * Maps a MIME type to a renderer kind. Order matters: the more specific
 * `image/svg+xml`, `text/markdown`, and `text/csv` are checked before the
 * `image/*` and `text/*` catch-alls.
 */
const kindFromMime = (raw: string): FileKind => {
  const mime = raw.split(";")[0].trim().toLowerCase();
  if (mime === "application/pdf") return "pdf";
  if (mime === "image/svg+xml") return "svg";
  if (mime === "text/markdown" || mime === "text/x-markdown") return "markdown";
  if (mime === "text/csv") return "csv";
  if (mime.startsWith("video/")) return "video";
  if (mime.startsWith("image/")) return "image";
  if (mime === "text/plain" || mime.startsWith("text/")) return "text";
  return "unsupported";
};

/** Extracts a lowercased extension from a URL/path, ignoring query and hash. */
const extensionOf = (uri: string): string | undefined => {
  const path = uri.split(/[?#]/)[0];
  const lastSlash = path.lastIndexOf("/");
  const name = path.slice(lastSlash + 1);
  const dot = name.lastIndexOf(".");
  if (dot <= 0) return undefined;
  return name.slice(dot + 1).toLowerCase();
};

/**
 * Resolves a kind without a network round-trip when possible:
 * `data:` URLs carry their MIME inline, and most URLs have a telling extension.
 * Returns `null` when neither is conclusive, so the caller can sniff the
 * `Content-Type` header.
 */
const detectSync = (uri: string): FileKind | null => {
  if (uri.startsWith("data:")) {
    const header = uri.slice("data:".length, uri.indexOf(","));
    // `data:,foo` (no mediatype) defaults to text/plain per RFC 2397.
    return kindFromMime(header || "text/plain");
  }
  const ext = extensionOf(uri);
  if (ext && ext in EXTENSION_KINDS) return EXTENSION_KINDS[ext];
  return null;
};

/**
 * Determines how to render the file at `uri`. Synchronous for `data:` URLs and
 * anything with a recognized extension; otherwise issues a `HEAD` request (a
 * `blob:` URL is read via its `Blob.type`) to read the `Content-Type`. Returns
 * `null` while an async sniff is in flight.
 */
export const useFileType = (
  uri: string,
  enabled = true,
): { kind: FileKind | null; loading: boolean } => {
  const [kind, setKind] = useState<FileKind | null>(() =>
    enabled ? detectSync(uri) : null,
  );

  useEffect(() => {
    // Never touch the network for a URL the caller rejected (defense in depth:
    // `fetch` won't execute a `javascript:`/`file:` URL, but we shouldn't
    // request something the safety gate already refused).
    if (!enabled) {
      setKind(null);
      return;
    }

    const sync = detectSync(uri);
    if (sync !== null) {
      setKind(sync);
      return;
    }

    setKind(null);
    const controller = new AbortController();

    const sniff = async () => {
      try {
        let contentType: string | null = null;
        if (uri.startsWith("blob:")) {
          const blob = await (
            await fetch(uri, { signal: controller.signal })
          ).blob();
          contentType = blob.type || null;
        } else {
          const res = await fetch(uri, {
            method: "HEAD",
            signal: controller.signal,
          });
          contentType = res.headers.get("content-type");
        }
        if (!controller.signal.aborted) {
          setKind(contentType ? kindFromMime(contentType) : "unsupported");
        }
      } catch {
        if (!controller.signal.aborted) setKind("unsupported");
      }
    };
    void sniff();

    return () => controller.abort();
  }, [uri, enabled]);

  return { kind, loading: enabled && kind === null };
};
