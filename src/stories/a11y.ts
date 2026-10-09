/// <reference types="vite/client" />
import axe from "axe-core";
import { expect, waitFor } from "@storybook/test";

const THEMES = ["light", "dark"] as const;
export type Theme = (typeof THEMES)[number];

/**
 * A known axe violation a story accepts: `rule` is skipped only on elements
 * matching `selector` (in `themes`, default both), so the same rule still
 * fails on any other element.
 */
export type A11yException = {
  rule: string;
  /** axe's selector engine: tags, classes, ids, attributes, descendant and
   * child combinators, `:not()` and `:is()`. It must match the reported node. */
  selector: string;
  reason: string;
  /** Where the defect lives, as `path:line`. */
  source?: string;
  themes?: readonly Theme[];
};

type AuditContext = {
  parameters: {
    a11y?: {
      disable?: boolean;
      exceptions?: Record<string, A11yException>;
    };
  };
  globals: { a11y?: { manual?: boolean } };
};

/**
 * Story `parameters` recording accessibility exceptions. Keyed by rule and
 * selector, so exceptions set on `meta` and on a story are merged.
 */
export const a11yExceptions = (...exceptions: A11yException[]) => ({
  a11y: {
    exceptions: Object.fromEntries(
      exceptions.map((exception) => [
        `${exception.rule} ${exception.selector}`,
        exception,
      ]),
    ),
  },
});

const ruleSelector = (id: string) => {
  const { rules } = (
    axe as unknown as { _audit: { rules: { id: string; selector: string }[] } }
  )._audit;
  const rule = rules.find((candidate) => candidate.id === id);
  if (!rule) throw new Error(`Unknown axe rule "${id}"`);
  return rule.selector;
};

/** axe rule config skipping each exception's elements; call after `axe.reset()`. */
const exceptionRules = (exceptions: A11yException[], theme: Theme) => {
  const applicable = exceptions.filter(
    (exception) => exception.themes?.includes(theme) ?? true,
  );
  const ids = [...new Set(applicable.map((exception) => exception.rule))];
  return ids.map((id) => {
    const excluded = applicable
      .filter((exception) => exception.rule === id)
      .map((exception) => exception.selector);
    return {
      id,
      selector: `*:is(${ruleSelector(id)}):not(${excluded.join(", ")})`,
    };
  });
};

// Set by the Storybook Vitest plugin; absent in the Storybook UI and Chromatic.
const isStoryTest = () => import.meta.env.VITEST_STORYBOOK !== undefined;

const setTheme = (theme: Theme) => {
  document.documentElement.classList.toggle("dark", theme === "dark");
  // Forces a style recalc, so the theme applies before axe or cleanup runs.
  void getComputedStyle(document.body).color;
};

/**
 * Runs axe on the current state in the light and dark themes, minus the
 * story's `a11yExceptions`, and fails on any violation. The theme in use
 * before the audit is restored afterwards.
 */
export const auditA11y = async (context: AuditContext, checkpoint: string) => {
  const { parameters, globals } = context;
  if (!isStoryTest() || parameters.a11y?.disable || globals.a11y?.manual)
    return;
  const exceptions = Object.values(parameters.a11y?.exceptions ?? {});
  const html = document.documentElement;
  const initialTheme = html.classList.contains("dark") ? "dark" : "light";
  // Enter/exit animations change opacity, which axe reads as contrast.
  await waitFor(
    () =>
      expect(
        document
          .getAnimations()
          .filter(
            (animation) =>
              animation.playState === "running" &&
              animation.effect?.getComputedTiming().iterations !== Infinity,
          ),
      ).toHaveLength(0),
    // Longer than the 1s progress fill (src/styles/theme.css:193).
    { timeout: 3000 },
  );
  // Theme colours otherwise fade in through the components' CSS transitions.
  const noTransitions = document.createElement("style");
  noTransitions.textContent = "* { transition: none !important; }";
  document.head.append(noTransitions);
  try {
    for (const theme of THEMES) {
      setTheme(theme);
      axe.reset();
      axe.configure({
        rules: [
          // Same baseline as the Storybook a11y addon.
          { id: "region", enabled: false },
          ...exceptionRules(exceptions, theme),
        ],
      });
      const { violations } = await axe.run(document.body, {
        resultTypes: ["violations"],
      });
      if (import.meta.env.A11Y_AUDIT_LOG)
        console.info(`a11y audit: ${checkpoint} / ${theme}`);
      await expect(
        violations.map(({ id, nodes }) => ({
          rule: id,
          targets: nodes.map((node) => node.target.join(" ")),
        })),
        `a11y violations at "${checkpoint}" in the ${theme} theme`,
      ).toEqual([]);
    }
  } finally {
    setTheme(initialTheme);
    noTransitions.remove();
  }
};
