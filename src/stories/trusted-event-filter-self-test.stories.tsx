/// <reference types="vite/client" />
import React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { expect, waitFor } from "@storybook/test";

/** Self-test of .storybook/trusted-event-filter.js as loaded by the Vitest story project. */
const meta = {
  title: "Internal/Trusted Event Filter Self Test",
  // Story tests only: hidden from the sidebar and docs, never snapshotted.
  tags: ["!dev", "!autodocs"],
  parameters: { chromatic: { disableSnapshot: true } },
  render: () => (
    <div data-testid="hover-target" style={{ width: 200, height: 100 }} />
  ),
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

// Set by the Storybook Vitest plugin; the real browser input exists only there.
const isStoryTest = import.meta.env.VITEST_STORYBOOK !== undefined;

export const RealCursorEventsAreDropped: Story = {
  play: async ({ canvasElement }) => {
    if (!isStoryTest) return;
    await expect(
      (window as { __trustedEventFilter?: boolean }).__trustedEventFilter,
    ).toBe(true);
    // Imported here: outside Vitest the module throws on import.
    const { userEvent } = await import("@vitest/browser/context");
    const target = canvasElement.querySelector<HTMLElement>(
      '[data-testid="hover-target"]',
    )!;
    const seen: boolean[] = [];
    const record = (event: PointerEvent) => seen.push(event.isTrusted);
    target.addEventListener("pointerover", record);
    // Parks the cursor in the top-left corner afterwards, away from later stories.
    const corner = document.createElement("div");
    corner.style.cssText =
      "position: fixed; left: 0; top: 0; width: 8px; height: 8px;";
    document.body.append(corner);
    try {
      await userEvent.hover(target);
      await waitFor(() => expect(target.matches(":hover")).toBe(true));
      target.dispatchEvent(new PointerEvent("pointerover"));
      await expect(seen).toEqual([false]);
    } finally {
      await userEvent.hover(corner);
      corner.remove();
      target.removeEventListener("pointerover", record);
    }
  },
};
