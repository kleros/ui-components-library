import React from "react";
import { render } from "@testing-library/react";
import { expect, it } from "vitest";

import { Timeline } from "../lib";

/** Text (title, party, date) that reaches outside `box`, with how far, in px. */
const outside = (box: HTMLElement) => {
  const b = box.getBoundingClientRect();
  return Array.from(box.querySelectorAll("h2, p, small")).flatMap((el) => {
    const r = el.getBoundingClientRect();
    const left = Math.round(b.left - r.left);
    const right = Math.round(r.right - b.right);
    if (left <= 0 && right <= 0) return [];
    const side =
      left > 0 ? `${left}px past the left` : `${right}px past the right`;
    return [`${el.tagName.toLowerCase()} "${el.textContent}": ${side}`];
  });
};

const renderTimeline = (width: number, rightSided: boolean) =>
  render(
    <div style={{ width }}>
      <Timeline
        items={[
          {
            title: "Deal created",
            party: "Buyer (you)",
            subtitle: "20 Sept 2026, 10:00 UTC · Terms agreed by both parties",
            rightSided,
          },
          {
            title: "Payment locked",
            party: "Buyer (you)",
            subtitle: "20 Sept 2026, 10:01 UTC · 2,400 USDC sent to escrow",
            rightSided,
          },
          {
            title: "Marked delivered",
            party: "Seller",
            subtitle: "8 Oct 2026, 18:20 UTC · Translated files shared",
            rightSided,
          },
        ]}
      />
    </div>,
  ).container.firstElementChild as HTMLElement;

// The text column is capped to the half of the row beside the spine, so it
// wraps instead of running out of the box.
it.each([false, true])(
  "Timeline in a 360 px box keeps its text inside the box (rightSided: %s)",
  (rightSided) => {
    expect(outside(renderTimeline(360, rightSided))).toEqual([]);
  },
);

// The spine stays on the box's centre line, and text that fits its half is not
// wrapped, so wide layouts look as they did before the cap.
it.each([
  [360, false],
  [360, true],
  [800, false],
  [800, true],
])(
  "Timeline in a %i px box keeps its spine centred (rightSided: %s)",
  (width, rightSided) => {
    const box = renderTimeline(width, rightSided);
    const centre = box.getBoundingClientRect().left + width / 2;
    for (const item of Array.from(box.querySelectorAll("li"))) {
      const spine = item.firstElementChild as HTMLElement;
      const bullet = Array.from(spine.children).find(
        (child) => child.getBoundingClientRect().width > 1,
      ) as HTMLElement;
      const { left, width: size } = bullet.getBoundingClientRect();
      expect(Math.abs(left + size / 2 - centre)).toBeLessThanOrEqual(0.5);
    }
    if (width === 800) {
      for (const date of Array.from(box.querySelectorAll("small"))) {
        expect(date.getBoundingClientRect().height).toBe(
          Number.parseFloat(getComputedStyle(date).lineHeight),
        );
      }
    }
  },
);
