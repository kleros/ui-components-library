import React from "react";
import { render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import FileViewer from "../../lib/file-viewer";
import {
  observed,
  remoteRequests,
  startObservers,
} from "../../stories/network-observer";

// Chromium refuses port 9 (ERR_UNSAFE_PORT), so the image never leaves the browser.
const REMOTE_IMAGE = "http://127.0.0.1:9/pixel.png";

let stopObservers: () => void;

beforeEach(() => {
  stopObservers = startObservers();
});

afterEach(() => {
  stopObservers();
});

/** Serves `body` with `status` for any request whose URL ends in `file`. */
const serve = (file: string, body: string, status = 200) => {
  observed.stubs.set(file, async () => new Response(body, { status }));
  return `./${file}`;
};

/** Waits until the viewer has left its loading state and shows text. */
const viewerText = (container: HTMLElement) =>
  expect
    .poll(
      () =>
        !container.querySelector("#loading-renderer") &&
        Boolean(container.textContent?.trim()),
      { timeout: 5000 },
    )
    .toBe(true);

const failedResponses = [
  { file: "broken.pdf", status: 500, body: "boom" },
  { file: "missing.png", status: 404, body: "not found" },
];

describe.each(failedResponses)(
  "FileViewer, $status response",
  ({ file, status, body }) => {
    const renderFailed = async () => {
      const { container } = render(
        <FileViewer url={serve(file, body, status)} />,
      );
      await viewerText(container);
      return container;
    };

    it("requests the file and settles", async () => {
      await renderFailed();

      expect(observed.requests.some((url) => url.endsWith(file))).toBe(true);
    });

    // Tracked by 2026-10-09-ui-components-library-file-viewer-http-error-body; drop `.fails` when fixed.
    it.fails("does not render the error body", async () => {
      await renderFailed();

      expect(screen.queryByText(body)).toBeNull();
    });
  },
);

describe("FileViewer, markdown with an off-origin image", () => {
  const renderMarkdown = async () => {
    const url = serve(
      "remote-image.md",
      `# Remote image fixture\n\n![pixel](${REMOTE_IMAGE})\n`,
    );
    render(<FileViewer url={url} />);
    await screen.findByText("Remote image fixture", {}, { timeout: 5000 });
  };

  it("renders the document", async () => {
    await renderMarkdown();

    expect(screen.getByRole("heading").textContent).toBe(
      "Remote image fixture",
    );
  });

  // Tracked by 2026-10-09-ui-components-library-markdown-offorigin-images; drop `.fails` when fixed.
  it.fails("does not request the image", async () => {
    await renderMarkdown();

    expect(remoteRequests()).not.toContain(REMOTE_IMAGE);
  });
});
