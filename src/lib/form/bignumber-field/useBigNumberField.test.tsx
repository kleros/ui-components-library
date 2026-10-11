import React from "react";
import { act, fireEvent, render, screen } from "@testing-library/react";
import BigNumber from "bignumber.js";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { BigNumberFieldProps, useBigNumberField } from "./useBigNumberField";

const Field = (props: BigNumberFieldProps) => (
  <input {...useBigNumberField(props).inputProps} />
);

describe("useBigNumberField controlled mount", () => {
  it.each([
    ["string", "1000"],
    ["BigNumber", new BigNumber("1000")],
  ])("shows a %s value unformatted", (_, value) => {
    render(<Field value={value} />);

    expect(screen.getByRole("spinbutton")).toHaveProperty("value", "1000");
  });

  it("formats an uncontrolled default value", () => {
    render(<Field defaultValue="1000" />);

    expect(screen.getByRole("spinbutton")).toHaveProperty("value", "1,000");
  });
});

describe("useBigNumberField controlled value change", () => {
  it.each([
    ["string", "1", "7"],
    ["BigNumber", new BigNumber("1"), new BigNumber("7")],
  ])(
    "replaces focused in-progress text with a new %s value",
    (_, echo, next) => {
      const { rerender } = render(<Field value="5" />);
      const input = screen.getByRole("spinbutton");
      input.focus();
      fireEvent.change(input, { target: { value: "1." } });
      rerender(<Field value={echo} />);
      expect(input).toHaveProperty("value", "1.");

      // No blur: the in-progress "1." is still in the input when the value changes.
      rerender(<Field value={next} />);

      expect(document.activeElement).toBe(input);
      expect(input).toHaveProperty("value", "7");
    },
  );
});

describe("useBigNumberField controlled value precision", () => {
  it.each([
    ["a fractional step", "1.5", "1.7"],
    ["a difference past 2^53", "9007199254740992", "9007199254740993"],
    ["a difference past double precision", "0.1", "0.10000000000000001"],
  ])("replaces the text on %s", (_, from, to) => {
    const { rerender } = render(<Field value={from} />);
    const input = screen.getByRole("spinbutton");

    rerender(<Field value={to} />);
    expect(input).toHaveProperty("value", to);

    rerender(<Field value={new BigNumber(from)} />);
    expect(input).toHaveProperty("value", from);
  });
});

describe("useBigNumberField empty string value", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  // The idle-format timer runs 3s after the numeric value changes.
  const passIdleFormatDelay = () =>
    act(() => {
      vi.advanceTimersByTime(3500);
    });

  it('mounts empty with value=""', () => {
    render(<Field value="" />);
    const input = screen.getByRole("spinbutton");

    passIdleFormatDelay();

    expect(input).toHaveProperty("value", "");
    expect(input.getAttribute("aria-valuetext")).not.toMatch(/NaN/);
  });

  it('mounts empty with defaultValue=""', () => {
    render(<Field defaultValue="" />);
    const input = screen.getByRole("spinbutton");

    passIdleFormatDelay();

    expect(input).toHaveProperty("value", "");
  });

  it('empties when the controlled value changes to ""', () => {
    const { rerender } = render(<Field value="5" />);
    const input = screen.getByRole("spinbutton");

    rerender(<Field value="" />);
    passIdleFormatDelay();
    fireEvent.blur(input);

    expect(input).toHaveProperty("value", "");
    expect(input.getAttribute("aria-valuetext")).not.toMatch(/NaN/);
  });
});
