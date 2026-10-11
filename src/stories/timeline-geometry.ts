import { expect, within } from "@storybook/test";

const centreY = (el: Element) => {
  const { top, height } = el.getBoundingClientRect();
  return top + height / 2;
};

const parts = (item: HTMLElement) => {
  const spine = item.firstElementChild as HTMLElement;
  const children = Array.from(spine.children) as HTMLElement[];
  // connector lines are 1px borders; the bullet is the only wide child
  const bulletIndex = children.findIndex(
    (c) => c.getBoundingClientRect().width > 1,
  );
  return {
    spine,
    spacer: children[bulletIndex - 1] as HTMLElement | undefined,
    bullet: children[bulletIndex],
  };
};

export const expectBulletsCentredOnTitles = async (items: HTMLElement[]) => {
  for (const item of items) {
    const title = within(item).getByRole("heading");
    const { bullet } = parts(item);
    await expect(
      Math.abs(centreY(bullet) - centreY(title)),
    ).toBeLessThanOrEqual(1);
  }
};

/** Spacer above a bullet is a connector for non-first items and blank for the first. */
export const expectConnectorsMeetBullets = async (items: HTMLElement[]) => {
  for (const [i, item] of items.entries()) {
    const { spacer, bullet } = parts(item);
    await expect(spacer).toBeDefined();
    const spacerRect = (spacer as HTMLElement).getBoundingClientRect();
    await expect(spacerRect.bottom).toBeCloseTo(
      bullet.getBoundingClientRect().top,
      1,
    );
    await expect(spacerRect.top).toBeCloseTo(
      item.getBoundingClientRect().top,
      1,
    );
    const drawn =
      parseFloat(getComputedStyle(spacer as HTMLElement).borderLeftWidth) > 0;
    await expect(drawn).toBe(i > 0);
    if (i > 0) {
      const prev = parts(items[i - 1]);
      const prevLine = prev.spine.lastElementChild as HTMLElement;
      const lineRect = prevLine.getBoundingClientRect();
      await expect(
        parseFloat(getComputedStyle(prevLine).borderLeftWidth),
      ).toBeGreaterThan(0);
      await expect(lineRect.top).toBeCloseTo(
        prev.bullet.getBoundingClientRect().bottom,
        1,
      );
      await expect(lineRect.bottom).toBeCloseTo(spacerRect.top, 1);
    }
  }
};
