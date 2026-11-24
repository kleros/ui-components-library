import React from "react";
import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

// The unit project does not transform SVG imports.
vi.mock("../assets/svgs/copiable/copy.svg", () => ({ default: () => null }));
vi.mock("../assets/svgs/copiable/copied.svg", () => ({ default: () => null }));

import Copiable from "../lib/copiable";

afterEach(() => {
  vi.useRealTimers();
});

// A second failed copy while "Copy failed" still shows must change the live region (so it can be announced
// again) and restart the timer that clears it.
describe("Copiable repeated failure", () => {
  it("re-announces a second failure and clears 2 s after the latest one", async () => {
    vi.useFakeTimers();
    vi.stubGlobal("navigator", {
      ...navigator,
      clipboard: { writeText: vi.fn().mockRejectedValue(new Error("denied")) },
    });
    render(
      <Copiable copiableContent="0xabc" info="Copy address">
        0xabc
      </Copiable>,
    );
    const status = screen.getByRole("status");
    const button = screen.getByRole("button", { name: "Copy address" });

    await act(async () => {
      fireEvent.click(button);
    });
    expect(status.textContent).toBe("Copy failed");

    const records: MutationRecord[] = [];
    const observer = new MutationObserver((r) => records.push(...r));
    observer.observe(status, {
      childList: true,
      subtree: true,
      characterData: true,
    });

    await act(async () => {
      vi.advanceTimersByTime(1000);
    });
    await act(async () => {
      fireEvent.click(button);
    });
    await act(async () => {
      await Promise.resolve();
    });
    expect(records.length).toBeGreaterThan(0);
    observer.disconnect();

    // 1.5 s after the second failure (2.5 s after the first) the message is still there
    await act(async () => {
      vi.advanceTimersByTime(1500);
    });
    expect(status.textContent).toBe("Copy failed");

    await act(async () => {
      vi.advanceTimersByTime(600);
    });
    expect(status.textContent).toBe("");
  });
});
