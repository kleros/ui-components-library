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
 * Upper bound for hover-revealed UI to appear. The library's hover feedback
 * (stepper buttons, tooltips with the default `delay` of 0) is immediate, so
 * anything slower than this is treated as a regression. The bound only leaves
 * slack for rendering on a loaded CI machine; keep it below any delay that
 * should fail the tests.
 */
export const HOVER_REVEAL_TIMEOUT_MS = 1000;

/**
 * Hovers `target` once and waits for `query()` to find the element revealed by
 * the hover (e.g. stepper buttons only rendered while a field is hovered). The
 * element may still be fading in; it is returned as soon as it is rendered.
 */
export const hoverToReveal = async <T extends HTMLElement>(
  user: { hover: (el: Element) => Promise<void> },
  target: Element,
  query: () => T,
): Promise<T> => {
  await user.hover(target);
  return waitFor(query, { timeout: HOVER_REVEAL_TIMEOUT_MS });
};

/**
 * Hovers `trigger` as a mouse user and returns the tooltip it opens (portaled
 * into document.body) within `HOVER_REVEAL_TIMEOUT_MS`.
 */
export const hoverForTooltip = async (
  user: {
    click: (el: Element) => Promise<void>;
    hover: (el: Element) => Promise<void>;
  },
  trigger: Element,
) => {
  // react-aria only opens hover tooltips in "pointer" interaction modality
  await user.click(document.body);
  return hoverToReveal(user, trigger, () =>
    within(document.body).getByRole("tooltip"),
  );
};

/**
 * Hovers `target` and asserts that hover-only UI stays hidden: after giving
 * React a moment to render a (wrong) hover state, `query()` must find nothing.
 */
export const expectHoverRevealsNothing = async (
  user: {
    hover: (el: Element) => Promise<void>;
    unhover: (el: Element) => Promise<void>;
  },
  target: Element,
  query: () => HTMLElement | null,
) => {
  await user.hover(target);
  await new Promise((resolve) => setTimeout(resolve, 150));
  await expect(query()).toBeNull();
  await user.unhover(target);
};

/**
 * Asserts hover-only UI follows the pointer: leaving `target` hides what
 * `query()` finds, and a fresh hover reveals it again. Repeating the cycle
 * also catches hover state that only works every other time.
 */
export const expectRevealedOnEachHover = async (
  user: {
    hover: (el: Element) => Promise<void>;
    unhover: (el: Element) => Promise<void>;
  },
  target: Element,
  query: () => HTMLElement,
  times = 2,
) => {
  for (let i = 0; i < times; i++) {
    await user.unhover(target);
    await waitFor(
      () => {
        let revealed = true;
        try {
          query();
        } catch {
          revealed = false;
        }
        if (revealed) throw new Error("still revealed after unhover");
      },
      { timeout: HOVER_REVEAL_TIMEOUT_MS },
    );
    await hoverToReveal(user, target, query);
  }
};

/**
 * Timeout for waiting until a tooltip has closed. Closing involves the
 * tooltip's close delay (500ms by default) plus its fade-out animation, so the
 * default 1s `waitFor` timeout leaves little slack on a loaded machine. Hide
 * timing is not under test, hence the generous bound.
 */
export const TOOLTIP_HIDE_TIMEOUT_MS = 2500;

/** Waits until no tooltip is rendered anymore (closed and faded out). */
export const waitForTooltipHidden = () =>
  waitFor(
    () =>
      expect(
        within(document.body).queryByRole("tooltip"),
      ).not.toBeInTheDocument(),
    { timeout: TOOLTIP_HIDE_TIMEOUT_MS },
  );
