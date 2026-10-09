/// <reference types="vite/client" />
import axe from "axe-core";
import { expect, waitFor } from "@storybook/test";

const THEMES = ["light", "dark"] as const;
export type Theme = (typeof THEMES)[number];

/**
 * A known axe violation a story accepts: `rule` is skipped only on elements
 * matching `selector` (in `themes`, default both), so the same rule still
 * fails on any other element. An exception that suppresses no violation in
 * any of the story's checkpoints and themes fails the story as stale.
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

type A11yViolation = { rule: string; targets: string[] };

type AuditContext = {
  parameters: {
    a11y?: {
      disable?: unknown;
      exceptions?: Record<string, A11yException>;
    };
  };
};

const appliesIn = (exception: A11yException) =>
  THEMES.filter((theme) => exception.themes?.includes(theme) ?? true);

const exceptionKey = (exception: A11yException) =>
  `${exception.rule} ${exception.selector} ${appliesIn(exception).join(",")}`;

const ruleSelector = (id: string) => {
  const { rules } = (
    axe as unknown as { _audit: { rules: { id: string; selector: string }[] } }
  )._audit;
  const rule = rules.find((candidate) => candidate.id === id);
  if (!rule) throw new Error(`Unknown axe rule "${id}"`);
  return rule.selector;
};

/**
 * Story `parameters` recording accessibility exceptions. Keyed by rule, selector
 * and themes, so exceptions set on `meta` and on a story are merged.
 */
export const a11yExceptions = (...exceptions: A11yException[]) => {
  for (const exception of exceptions) {
    ruleSelector(exception.rule);
    if (!exception.selector.trim() || !exception.reason.trim())
      throw new Error(
        `a11y exception "${exception.rule}" needs a selector and a reason`,
      );
  }
  return {
    a11y: {
      exceptions: Object.fromEntries(
        exceptions.map((exception) => [exceptionKey(exception), exception]),
      ),
    },
  };
};

const applicableIn = (exceptions: A11yException[], theme: Theme) =>
  exceptions.filter((exception) => exception.themes?.includes(theme) ?? true);

/** axe rule config skipping each exception's elements; call after `axe.reset()`. */
const exceptionRules = (applicable: A11yException[]) => {
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

// Same baseline as the Storybook a11y addon.
const BASELINE_RULES = [{ id: "region", enabled: false }];

// Set by the Storybook Vitest plugin; absent in the Storybook UI and Chromatic.
const isStoryTest = () => import.meta.env.VITEST_STORYBOOK !== undefined;

const currentTheme = (): Theme =>
  document.documentElement.classList.contains("dark") ? "dark" : "light";

const setTheme = (theme: Theme) => {
  document.documentElement.classList.toggle("dark", theme === "dark");
  // Forces a style recalc, so the theme applies before axe or cleanup runs.
  void getComputedStyle(document.body).color;
};

/**
 * Runs axe on the document in `theme` with `exceptions` applied, then restores
 * the theme. Returns the violations left and the exceptions that suppressed
 * at least one violation.
 */
export const runAxe = async (exceptions: A11yException[], theme: Theme) => {
  const initialTheme = currentTheme();
  setTheme(theme);
  try {
    const applicable = applicableIn(exceptions, theme);
    axe.reset();
    axe.configure({
      rules: [...BASELINE_RULES, ...exceptionRules(applicable)],
    });
    const { violations } = await axe.run(document.body, {
      resultTypes: ["violations"],
    });
    let matched: A11yException[] = [];
    if (applicable.length > 0) {
      axe.reset();
      const unscoped = await axe.run(document.body, {
        runOnly: {
          type: "rule",
          values: [...new Set(applicable.map(({ rule }) => rule))],
        },
        resultTypes: ["violations"],
        elementRef: true,
      });
      matched = applicable.filter((exception) =>
        unscoped.violations.some(
          ({ id, nodes }) =>
            id === exception.rule &&
            nodes.some(({ element }) => element?.matches(exception.selector)),
        ),
      );
    }
    return {
      violations: violations.map(
        ({ id, nodes }): A11yViolation => ({
          rule: id,
          targets: nodes.map((node) => node.target.join(" ")),
        }),
      ),
      matched,
    };
  } finally {
    setTheme(initialTheme);
  }
};

// `<exception key>@<theme>` for each exception that suppressed a violation in
// the current story.
const matchedKeys = new Set<string>();

/** Clears the matched exceptions; preview's `beforeEach` runs it per story. */
export const resetA11yAudit = () => matchedKeys.clear();

/** The story's exceptions that, since `resetA11yAudit`, matched no violation in
 * one of the themes they apply to. */
export const staleA11yExceptions = ({ parameters }: AuditContext) =>
  Object.entries(parameters.a11y?.exceptions ?? {})
    .filter(([key, exception]) =>
      appliesIn(exception).some((theme) => !matchedKeys.has(`${key}@${theme}`)),
    )
    .map(([, exception]) => exception);

/**
 * Runs axe on the current state in the light and dark themes, minus the
 * story's `a11yExceptions`, and fails on any violation.
 */
export const auditA11y = async (context: AuditContext, checkpoint: string) => {
  const { parameters } = context;
  if (parameters.a11y?.disable !== undefined)
    throw new Error(
      "parameters.a11y.disable is not supported: declare a11yExceptions with a reason",
    );
  if (!isStoryTest()) return;
  const exceptions = Object.values(parameters.a11y?.exceptions ?? {});
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
      const { violations, matched } = await runAxe(exceptions, theme);
      for (const exception of matched)
        matchedKeys.add(`${exceptionKey(exception)}@${theme}`);
      if (import.meta.env.A11Y_AUDIT_LOG)
        console.info(`a11y audit: ${checkpoint} / ${theme}`);
      await expect(
        violations,
        `a11y violations at "${checkpoint}" in the ${theme} theme`,
      ).toEqual([]);
    }
  } finally {
    noTransitions.remove();
  }
};

/** Fails when one of the story's exceptions matched no violation in any audit. */
export const expectNoStaleA11yExceptions = async (context: AuditContext) => {
  if (!isStoryTest()) return;
  const stale = staleA11yExceptions(context).map(
    ({ rule, selector, themes }) =>
      `${rule} on ${selector}${themes ? ` (${themes.join(", ")})` : ""}`,
  );
  await expect(
    stale,
    `stale a11y exceptions, no violation matched in a theme they apply to: ${stale.join("; ")}`,
  ).toEqual([]);
};
