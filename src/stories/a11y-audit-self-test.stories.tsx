/// <reference types="vite/client" />
import React from "react";
import type { Meta, StoryContext, StoryObj } from "@storybook/react";
import { expect } from "@storybook/test";

import {
  type A11yException,
  a11yExceptions,
  auditA11y,
  resetA11yAudit,
  runAxe,
  staleA11yExceptions,
} from "./a11y";

/** Self-tests of the a11y audit's failure paths and of its wiring into every story. */
const meta = {
  title: "Internal/A11y Audit Self Test",
  // Story tests only: hidden from the sidebar and docs, never snapshotted.
  tags: ["!dev", "!autodocs"],
  parameters: { chromatic: { disableSnapshot: true } },
  render: () => <></>,
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

// `auditA11y` only runs axe under the Vitest story runner.
const isStoryTest = import.meta.env.VITEST_STORYBOOK !== undefined;

type Hook = (context: StoryContext) => unknown;

// What `setProjectAnnotations` in .storybook/vitest.setup.ts registered; the
// Storybook Vitest plugin runs every story with these.
const projectHooks =
  (name: "beforeEach" | "experimental_afterEach") =>
  async (context: StoryContext) => {
    const { globalProjectAnnotations } = globalThis as {
      globalProjectAnnotations?: Record<typeof name, Hook[] | undefined>;
    };
    for (const hook of globalProjectAnnotations?.[name] ?? [])
      await hook(context);
  };
const projectBeforeEach = projectHooks("beforeEach");
const projectAfterEach = projectHooks("experimental_afterEach");

const PRESENT = "a11y-audit-self-test-present";
const ABSENT = "a11y-audit-self-test-absent";

const unnamedButton = () => {
  const button = document.createElement("button");
  button.className = PRESENT;
  document.body.append(button);
  return button;
};

const exceptionOn = (
  className: string,
  overrides: Partial<A11yException> = {},
): A11yException => ({
  rule: "button-name",
  selector: `.${className}`,
  reason: "Self-test fixture.",
  ...overrides,
});

// `toThrow` and `rejects` break under the Storybook instrumenter.
const errorOf = async (run: () => unknown) => {
  try {
    await run();
  } catch (error) {
    return (error as Error).message;
  }
  return "no error";
};

export const ProjectEndAuditFailsOnViolation: Story = {
  play: async (context) => {
    if (!isStoryTest) return;
    const fixture = unnamedButton();
    try {
      await expect(await errorOf(() => projectAfterEach(context))).toContain(
        'a11y violations at "end" in the light theme',
      );
    } finally {
      fixture.remove();
    }
  },
};

export const ProjectEndAuditFailsOnStaleException: Story = {
  play: async (storyContext) => {
    if (!isStoryTest) return;
    const context = {
      ...storyContext,
      parameters: a11yExceptions(exceptionOn(ABSENT)),
    };
    try {
      await expect(await errorOf(() => projectAfterEach(context))).toContain(
        "stale a11y exceptions",
      );
    } finally {
      resetA11yAudit();
    }
  },
};

export const DarkOnlyViolationFailsAudit: Story = {
  play: async () => {
    if (!isStoryTest) return;
    const context = {
      parameters: a11yExceptions(exceptionOn(PRESENT, { themes: ["light"] })),
    };
    const fixture = unnamedButton();
    try {
      await expect(
        await errorOf(() => auditA11y(context, "dark only")),
      ).toContain('a11y violations at "dark only" in the dark theme');
    } finally {
      fixture.remove();
      resetA11yAudit();
    }
  },
};

export const ExceptionMatchesOnlyOnItsSelector: Story = {
  play: async () => {
    const present = exceptionOn(PRESENT);
    const absent = exceptionOn(ABSENT);
    const fixture = unnamedButton();
    try {
      await expect(await runAxe([present, absent], "light")).toEqual({
        violations: [],
        matched: [present],
      });
    } finally {
      fixture.remove();
    }
  },
};

export const ProjectBeforeEachForgetsEarlierMatches: Story = {
  play: async (storyContext) => {
    if (!isStoryTest) return;
    const exception = exceptionOn(PRESENT);
    const context = { parameters: a11yExceptions(exception) };
    try {
      const fixture = unnamedButton();
      try {
        await auditA11y(context, "with fixture");
      } finally {
        fixture.remove();
      }
      await expect(staleA11yExceptions(context)).toEqual([]);
      await projectBeforeEach(storyContext);
      await auditA11y(context, "without fixture");
      await expect(staleA11yExceptions(context)).toEqual([exception]);
    } finally {
      resetA11yAudit();
    }
  },
};

export const ExceptionMatchedInOneThemeIsStale: Story = {
  play: async () => {
    if (!isStoryTest) return;
    const exception = exceptionOn(PRESENT);
    const context = { parameters: a11yExceptions(exception) };
    // axe skips hidden elements, so the button violates in light only.
    const hiddenInDark = document.createElement("style");
    hiddenInDark.textContent = `.dark .${PRESENT} { display: none; }`;
    document.head.append(hiddenInDark);
    const fixture = unnamedButton();
    try {
      await auditA11y(context, "light only");
      await expect(staleA11yExceptions(context)).toEqual([exception]);
    } finally {
      fixture.remove();
      hiddenInDark.remove();
      resetA11yAudit();
    }
  },
};
