import React from "react";
import { render } from "@testing-library/react";
import { expect, it } from "vitest";

import { Steps } from "../lib";

/** Step titles that reach outside `box`, with how far, in px. */
const outside = (box: HTMLElement) => {
  const b = box.getBoundingClientRect();
  return Array.from(box.querySelectorAll("h2")).flatMap((el) => {
    const r = el.getBoundingClientRect();
    const left = Math.round(b.left - r.left);
    const right = Math.round(r.right - b.right);
    if (left <= 0 && right <= 0) return [];
    const side =
      left > 0 ? `${left}px past the left` : `${right}px past the right`;
    return [`"${el.textContent}": ${side}`];
  });
};

const items = [{ title: "Terms" }, { title: "Payment" }, { title: "Review" }];

/** Each step's bullet and title boxes. */
const steps = (box: HTMLElement) =>
  Array.from(box.querySelectorAll("li")).map((li) => ({
    bullet: li.querySelector('[aria-hidden="true"]')!.getBoundingClientRect(),
    title: li.querySelector("h2")!.getBoundingClientRect(),
  }));

// Full width, as a multi-step form uses it, so the last step sits at the right edge.
it("full-width horizontal Steps in a 360 px box keeps its titles inside the box, below the lg breakpoint", () => {
  const { container } = render(
    <div style={{ width: 360 }}>
      <Steps horizontal className="w-full" currentItemIndex={0} items={items} />
    </div>,
  );

  expect({
    belowLg: window.innerWidth < 1024,
    outside: outside(container.firstElementChild as HTMLElement),
  }).toEqual({ belowLg: true, outside: [] });
});

it("horizontal Steps at its default width keeps its titles inside the list, below the lg breakpoint", () => {
  const { container } = render(
    <Steps horizontal currentItemIndex={0} items={items} />,
  );

  expect({
    belowLg: window.innerWidth < 1024,
    outside: outside(container.firstElementChild as HTMLElement),
  }).toEqual({ belowLg: true, outside: [] });
});

// Below lg: the first title starts at its bullet's left edge, the last ends at
// its bullet's right edge, and the titles between stay centred on their bullets.
it("horizontal Steps aligns the end titles to their bullets' outer edges, below the lg breakpoint", () => {
  const { container } = render(
    <div style={{ width: 360 }}>
      <Steps
        horizontal
        className="w-full"
        currentItemIndex={0}
        items={[...items.slice(0, 2), { title: "Fees" }, items[2]]}
      />
    </div>,
  );
  const [first, ...rest] = steps(container.firstElementChild as HTMLElement);
  const last = rest.pop()!;

  expect(window.innerWidth).toBeLessThan(1024);
  expect(Math.abs(first.title.left - first.bullet.left)).toBeLessThanOrEqual(
    0.5,
  );
  expect(Math.abs(last.title.right - last.bullet.right)).toBeLessThanOrEqual(
    0.5,
  );
  for (const { bullet, title } of rest) {
    const offset =
      title.left + title.width / 2 - (bullet.left + bullet.width / 2);
    expect(Math.abs(offset)).toBeLessThanOrEqual(0.5);
  }
});

// A lone step is both first and last; the list centres its bullet, so its title
// stays centred under it.
it("horizontal Steps with a single step centres its title under the bullet", () => {
  const { container } = render(
    <div style={{ width: 360 }}>
      <Steps
        horizontal
        className="w-full"
        currentItemIndex={0}
        items={[{ title: "Review" }]}
      />
    </div>,
  );
  const box = container.firstElementChild as HTMLElement;
  const [{ bullet, title }] = steps(box);

  expect(outside(box)).toEqual([]);
  const offset =
    title.left + title.width / 2 - (bullet.left + bullet.width / 2);
  expect(Math.abs(offset)).toBeLessThanOrEqual(0.5);
});
