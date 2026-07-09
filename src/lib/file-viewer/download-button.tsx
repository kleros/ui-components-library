import React, { useMemo, useState } from "react";
import { cn } from "../../utils";

/** IPFS path- and subdomain-style gateway URLs honor `?download=true&filename=`
 * and reply with `Content-Disposition: attachment` (IPFS path-gateway spec).
 * That's the most cross-browser-robust download — no fetch, no CORS read, no
 * in-memory buffering, and it works on Safari/iOS where blob downloads are
 * historically flaky. */
const isIpfsGatewayUrl = (u: URL): boolean =>
  /\/(ipfs|ipns)\//.test(u.pathname) || /(^|\.)(ipfs|ipns)\./.test(u.hostname);

/** Derives a filename from a URL path, falling back to a generic name for
 * extensionless URLs (e.g. a bare IPFS CID). */
const fileNameFromUrl = (url: string, fallback = "download"): string => {
  const path = url.split(/[?#]/)[0];
  const seg = path.slice(path.lastIndexOf("/") + 1);
  if (!seg) return fallback;
  try {
    return decodeURIComponent(seg);
  } catch {
    return seg;
  }
};

/**
 * Floating download control, shown on every previewable file. Renders only for
 * URLs that already passed the viewer's safety gate. It picks the safest
 * download mechanism per URL:
 *
 * - **same-origin / `blob:` / `data:`** — the native `download` attribute saves
 *   directly, streamed to disk (no memory cost).
 * - **IPFS gateway** — the `href` carries `?download=true&filename=`, so the
 *   gateway forces the download via `Content-Disposition` (most robust).
 * - **other cross-origin** — the `download` attribute is ignored cross-origin,
 *   so we `fetch` the bytes and save a same-origin object URL. Security: the
 *   Blob is re-typed `application/octet-stream` so the object URL can only be
 *   downloaded, never rendered/executed (a `text/html` blob URL inherits *our*
 *   origin if navigated); `fetch` uses `credentials: "omit"` so cookies never
 *   reach the third-party host; a CORS/network failure falls back to opening
 *   the file in a new tab (`noopener,noreferrer`).
 */
const DownloadButton = ({
  url,
  fileName,
}: {
  url: string;
  fileName?: string;
}) => {
  const [busy, setBusy] = useState(false);

  const href = useMemo(() => {
    try {
      const u = new URL(url, window.location.href);
      if (isIpfsGatewayUrl(u)) {
        // The gateway only emits `Content-Disposition: attachment` when BOTH
        // `download=true` AND `filename` are present — `download=true` alone is
        // ignored, so the response stays inline and `target="_blank"` opens the
        // file in a new tab instead of downloading. Always send a filename,
        // falling back to one derived from the URL when no prop was given.
        u.searchParams.set("download", "true");
        u.searchParams.set("filename", fileName || fileNameFromUrl(url));
        return u.toString();
      }
    } catch {
      // Relative URL — same-origin, the native `download` attribute handles it.
    }
    return url;
  }, [url, fileName]);

  const handleClick = async (e: React.MouseEvent<HTMLAnchorElement>) => {
    // Let the browser own: modified/middle clicks; IPFS gateways (params are in
    // the href); and same-origin/blob/data (the `download` attribute works).
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0)
      return;
    if (href !== url) return;
    if (url.startsWith("blob:") || url.startsWith("data:")) return;
    let sameOrigin = true;
    try {
      sameOrigin =
        new URL(url, window.location.href).origin === window.location.origin;
    } catch {
      return; // relative URL → same-origin
    }
    if (sameOrigin) return;

    // Other cross-origin: fetch the bytes and save a same-origin object URL.
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    let objectUrl: string | undefined;
    try {
      const res = await fetch(url, { credentials: "omit" });
      if (!res.ok) throw new Error(String(res.status));
      const bytes = await res.blob();
      objectUrl = URL.createObjectURL(
        new Blob([bytes], { type: "application/octet-stream" }),
      );
      const a = document.createElement("a");
      a.href = objectUrl;
      a.download = fileName || fileNameFromUrl(url);
      a.rel = "noopener";
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch {
      // CORS-blocked, offline, or too large to buffer → open in a new tab.
      window.open(url, "_blank", "noopener,noreferrer");
    } finally {
      // Defer revoke: a synchronous revoke after click() can abort the download.
      if (objectUrl) {
        const toRevoke = objectUrl;
        window.setTimeout(() => URL.revokeObjectURL(toRevoke), 40_000);
      }
      setBusy(false);
    }
  };

  return (
    <a
      href={href}
      // Keep `download` present even without a `fileName`: React drops the
      // attribute when the value is `undefined`, and without it the
      // same-origin/blob/data branches (which rely on the native attribute)
      // fall through to `target="_blank"` and open the file inline instead of
      // downloading it. `download=""` lets the browser derive the name.
      download={fileName ?? ""}
      target="_blank"
      rel="noopener noreferrer"
      onClick={handleClick}
      aria-label="Download file"
      aria-busy={busy}
      title="Download"
      className={cn(
        "absolute top-2 right-2 z-[4] flex h-8 w-8 items-center justify-center",
        "rounded-base text-klerosUIComponentsPrimaryText",
        "bg-klerosUIComponentsPrimaryPurple/15 backdrop-saturate-150",
        "hover:bg-klerosUIComponentsPrimaryPurple/25",
        "dark:bg-klerosUIComponentsLightBackground/50",
      )}
    >
      {busy ? (
        <span
          className={cn(
            "border-klerosUIComponentsStroke h-4 w-4 animate-spin rounded-full",
            "border-t-klerosUIComponentsPrimaryText border-2",
          )}
          aria-hidden="true"
        />
      ) : (
        <svg
          viewBox="0 0 24 24"
          width="16"
          height="16"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="7 10 12 15 17 10" />
          <line x1="12" y1="15" x2="12" y2="3" />
        </svg>
      )}
    </a>
  );
};

export default DownloadButton;
