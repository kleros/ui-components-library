import { expect, waitFor, within } from "@storybook/test";

export type IPreviewArgs = {
  args: {
    themeUI: "light" | "dark";
    backgroundUI: "white" | "light";
  };
};

/**
 * Story `parameters` that disable specific axe rules for a story (or a whole
 * file when used in `meta`). Only use this for genuine, pre-existing component
 * a11y issues that cannot be fixed from the story itself, and always leave a
 * comment explaining why.
 */
export const disableA11yRules = (...ids: string[]) => ({
  a11y: {
    config: {
      rules: ids.map((id) => ({ id, enabled: false })),
    },
  },
});

/**
 * Hovers `element` as a mouse user would. react-aria only opens hover
 * tooltips when the current interaction modality is "pointer", so a neutral
 * pointer press on the document body is made first.
 */
export const mouseHover = async (
  user: {
    click: (el: Element) => Promise<void>;
    hover: (el: Element) => Promise<void>;
  },
  element: Element,
) => {
  await user.click(document.body);
  await user.hover(element);
};

/**
 * Waits until no CSS animation/transition is running inside `element` (e.g. a
 * popover's enter animation), so assertions and the axe scan see the final,
 * fully opaque state.
 */
export const waitForAnimations = async (element: Element) => {
  await waitFor(() =>
    expect(
      element
        .getAnimations({ subtree: true })
        .filter((animation) => animation.playState === "running"),
    ).toHaveLength(0),
  );
};

/**
 * Hovers `target` and waits for `query()` to find the element revealed by the
 * hover (e.g. stepper buttons only rendered while a field is hovered). If the
 * hover was missed (possible under heavy CPU load) it is re-dispatched. The
 * element may still be fading in; it is returned as soon as it is rendered.
 */
export const hoverToReveal = async <T extends HTMLElement>(
  user: {
    hover: (el: Element) => Promise<void>;
    unhover: (el: Element) => Promise<void>;
  },
  target: Element,
  query: () => T,
  attempts = 4,
): Promise<T> => {
  for (let attempt = 1; ; attempt++) {
    await user.hover(target);
    try {
      return await waitFor(query, { timeout: 1500 });
    } catch (error) {
      if (attempt >= attempts) throw error;
      await user.unhover(target);
    }
  }
};

/**
 * Hovers `trigger` as a mouse user and returns the tooltip it opens (portaled
 * into document.body). Retries the hover like `hoverToReveal`.
 */
export const hoverForTooltip = async (
  user: {
    click: (el: Element) => Promise<void>;
    hover: (el: Element) => Promise<void>;
    unhover: (el: Element) => Promise<void>;
  },
  trigger: Element,
) => {
  // react-aria only opens hover tooltips in "pointer" interaction modality
  await user.click(document.body);
  return hoverToReveal(user, trigger, () =>
    within(document.body).getByRole("tooltip"),
  );
};
