import React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { expect } from "@storybook/test";

import {
  type A11yException,
  a11yExceptions,
  auditA11y,
  resetA11yAudit,
  runAxe,
  staleA11yExceptions,
} from "./a11y";

// Set by the Storybook Vitest plugin, where `auditA11y` runs axe.
const IN_STORY_RUNNER = import.meta.env.VITEST_STORYBOOK !== undefined;

/** Self-tests of the a11y exception mechanism in `./a11y`. */
const meta = {
  title: "Internal/A11y Self Test",
  // Story tests only: hidden from the sidebar and docs, never snapshotted.
  tags: ["!dev", "!autodocs"],
  parameters: { chromatic: { disableSnapshot: true } },
  render: () =>
    IN_STORY_RUNNER ? (
      <></>
    ) : (
      <p data-testid="a11y-self-test-skipped">
        Skipped: these self-tests run only under the Vitest story runner (yarn
        test:stories).
      </p>
    ),
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

const EXCEPTED = "a11y-self-test-excepted";
const OTHER = "a11y-self-test-other";

const unnamedButtons = (...classNames: string[]) => {
  const fixture = document.createElement("div");
  for (const className of classNames) {
    const button = document.createElement("button");
    button.className = className;
    fixture.append(button);
  }
  document.body.append(fixture);
  return fixture;
};

const unnamedButtonException = (
  overrides: Partial<A11yException> = {},
): A11yException => ({
  rule: "button-name",
  selector: `.${EXCEPTED}`,
  reason: "Self-test fixture.",
  ...overrides,
});

const storyRunnerOnly =
  (play: () => Promise<void>): Story["play"] =>
  async () => {
    if (IN_STORY_RUNNER) await play();
    else if (import.meta.env.MODE === "test")
      throw new Error("VITEST_STORYBOOK is unset under Vitest");
  };

// `toThrow` and `rejects` break under the Storybook instrumenter.
const errorOf = async (run: () => unknown) => {
  try {
    await run();
  } catch (error) {
    return (error as Error).message;
  }
  return "no error";
};

export const ExceptionIsScopedToItsSelector: Story = {
  play: storyRunnerOnly(async () => {
    const fixture = unnamedButtons(EXCEPTED, OTHER);
    try {
      const exception = unnamedButtonException();
      const { violations, matched } = await runAxe([exception], "light");
      await expect(violations).toEqual([
        { rule: "button-name", targets: [`.${OTHER}`] },
      ]);
      await expect(matched).toEqual([exception]);
    } finally {
      fixture.remove();
    }
  }),
};

export const LightOnlyExceptionStillFailsInDark: Story = {
  play: storyRunnerOnly(async () => {
    const fixture = unnamedButtons(EXCEPTED);
    try {
      const exception = unnamedButtonException({ themes: ["light"] });
      const light = await runAxe([exception], "light");
      await expect(light).toEqual({ violations: [], matched: [exception] });
      const dark = await runAxe([exception], "dark");
      await expect(dark).toEqual({
        violations: [{ rule: "button-name", targets: [`.${EXCEPTED}`] }],
        matched: [],
      });
    } finally {
      fixture.remove();
    }
  }),
};

export const UnknownRuleThrows: Story = {
  play: storyRunnerOnly(async () => {
    const unknown = unnamedButtonException({ rule: "not-an-axe-rule" });
    await expect(await errorOf(() => a11yExceptions(unknown))).toBe(
      'Unknown axe rule "not-an-axe-rule"',
    );
    await expect(await errorOf(() => runAxe([unknown], "light"))).toBe(
      'Unknown axe rule "not-an-axe-rule"',
    );
  }),
};

export const ExceptionNeedsSelectorAndReason: Story = {
  play: storyRunnerOnly(async () => {
    await expect(
      await errorOf(() =>
        a11yExceptions(unnamedButtonException({ reason: " " })),
      ),
    ).toContain("needs a selector and a reason");
    await expect(
      await errorOf(() =>
        a11yExceptions(unnamedButtonException({ selector: "" })),
      ),
    ).toContain("needs a selector and a reason");
  }),
};

export const UnmatchedExceptionIsStale: Story = {
  play: storyRunnerOnly(async () => {
    const context = { parameters: a11yExceptions(unnamedButtonException()) };
    try {
      resetA11yAudit();
      await auditA11y(context, "no fixture");
      await expect(staleA11yExceptions(context)).toEqual([
        unnamedButtonException(),
      ]);
      const fixture = unnamedButtons(EXCEPTED);
      try {
        await auditA11y(context, "fixture");
      } finally {
        fixture.remove();
      }
      await expect(staleA11yExceptions(context)).toEqual([]);
    } finally {
      resetA11yAudit();
    }
  }),
};

export const DisableIsRejected: Story = {
  play: storyRunnerOnly(async () => {
    await expect(
      await errorOf(() =>
        auditA11y({ parameters: { a11y: { disable: true } } }, "disabled"),
      ),
    ).toContain("parameters.a11y.disable is not supported");
  }),
};
