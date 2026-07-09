import { useEffect, useState } from "react";

interface FileTextState {
  text: string | null;
  loading: boolean;
  error: boolean;
}

/**
 * Fetches the text body of `uri`. Works for `http(s):`, `blob:`, and `data:`
 * URLs — `fetch` decodes `data:` payloads (base64 or percent-encoded) for us,
 * so text/markdown/csv renderers don't need their own decoding. The URL is
 * assumed to have already passed the viewer's safety gate.
 */
export const useFileText = (uri: string): FileTextState => {
  const [state, setState] = useState<FileTextState>({
    text: null,
    loading: true,
    error: false,
  });

  useEffect(() => {
    const controller = new AbortController();
    setState({ text: null, loading: true, error: false });

    fetch(uri, { signal: controller.signal })
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.text();
      })
      .then((text) => {
        if (!controller.signal.aborted) {
          setState({ text, loading: false, error: false });
        }
      })
      .catch(() => {
        if (!controller.signal.aborted) {
          setState({ text: null, loading: false, error: true });
        }
      });

    return () => controller.abort();
  }, [uri]);

  return state;
};
