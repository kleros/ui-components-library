import React from "react";
import { render } from "@testing-library/react";
import { page } from "@vitest/browser/context";
import { expect, it } from "vitest";

import { Card, Timeline } from "../lib";

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

// A word wider than the half (a full address, a tx hash, a long compound word)
// wraps inside it too: the title and party shrink below their longest word.
const ADDRESS = "0x7a16fF8270133F063aAb6C9977183D9e72835428";
it.each([false, true])(
  "Timeline in a 360 px box wraps long words inside the box (rightSided: %s)",
  (rightSided) => {
    const box = render(
      <div style={{ width: 360 }}>
        <Timeline
          items={[
            {
              title: "Deal created",
              party: ADDRESS,
              subtitle: "20 Sept 2026, 10:00 UTC",
              rightSided,
            },
            {
              title: "Schiedsgerichtsverfahrenseröffnung",
              party: "Seller",
              subtitle: "8 Oct 2026",
              rightSided,
            },
            {
              title: "Payment locked",
              party: "Buyer",
              subtitle: `Tx ${ADDRESS}`,
              rightSided,
            },
          ]}
        />
      </div>,
    ).container.firstElementChild as HTMLElement;
    expect(outside(box)).toEqual([]);
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

// The shifted rows reach half the box past its edge. A rightSided Timeline in
// a card at the right of a phone screen must not make the page scroll sideways.
it("rightSided Timeline on a 390 px phone does not widen the page", async () => {
  const before = { width: window.innerWidth, height: window.innerHeight };
  await page.viewport(390, 844);
  try {
    const { container } = render(
      <div style={{ padding: 16 }}>
        <Card fluid className="p-4">
          <Timeline
            items={[
              {
                title: "Deal created",
                party: "Buyer (you)",
                subtitle: "20 Sept 2026, 10:00 UTC",
                rightSided: true,
              },
              {
                title: "Marked delivered",
                party: "Seller",
                subtitle: "8 Oct 2026, 18:20 UTC",
                rightSided: true,
              },
            ]}
          />
        </Card>
      </div>,
    );
    const list = container.querySelector("ol") as HTMLElement;
    expect(document.documentElement.scrollWidth).toBe(
      document.documentElement.clientWidth,
    );
    // clip, not hidden: hidden would make the list a scroll container.
    expect(getComputedStyle(list).overflowX).toBe("clip");
    expect(outside(list)).toEqual([]);
  } finally {
    await page.viewport(before.width, before.height);
  }
});
