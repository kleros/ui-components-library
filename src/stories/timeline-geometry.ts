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
      const prevLine = parts(items[i - 1]).spine.lastElementChild as Element;
      await expect(prevLine.getBoundingClientRect().bottom).toBeCloseTo(
        items[i - 1].getBoundingClientRect().bottom,
        1,
      );
    }
  }
};
