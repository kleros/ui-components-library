import React from "react";
import { act, fireEvent, render, screen } from "@testing-library/react";
import BigNumber from "bignumber.js";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { BigNumberFieldProps, useBigNumberField } from "./useBigNumberField";

const Field = (props: BigNumberFieldProps) => (
  <input {...useBigNumberField(props).inputProps} />
);

// The documented controlled pattern: keep `v.toFixed()` and pass it back as `value`. `held` records each value kept.
const Controlled = ({
  held,
  ...props
}: BigNumberFieldProps & { held: string[] }) => {
  const [value, setValue] = React.useState("");
  return (
    <Field
      {...props}
      value={value}
      onChange={(v) => {
        held.push(v.toFixed());
        setValue(v.toFixed());
      }}
    />
  );
};

// Types text at the end of the field, one key at a time, as a user does.
const type = (input: HTMLElement, text: string) => {
  for (const key of text) {
    fireEvent.change(input, {
      target: { value: (input as HTMLInputElement).value + key },
    });
  }
};

// The idle-format timer runs 3s after the numeric value changes.
const passIdleFormatDelay = () =>
  act(() => {
    vi.advanceTimersByTime(3500);
  });

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

describe("useBigNumberField lone minus sign", () => {
  it("refuses a lone '-' when the field cannot go negative", () => {
    const onChange = vi.fn();
    render(<Field defaultValue="5" minValue="0" onChange={onChange} />);
    const input = screen.getByRole("spinbutton");
    input.focus();
    fireEvent.change(input, { target: { value: "5" } });
    onChange.mockClear();

    fireEvent.change(input, { target: { value: "-" } });

    // The field keeps showing the amount the parent still holds.
    expect(input).toHaveProperty("value", "5");
    expect(onChange).not.toHaveBeenCalled();
  });

  it.each(["-.", "-0", "-0.", "-0.00"])(
    "refuses a pasted negative zero '%s' at a minimum of 0",
    (text) => {
      const onChange = vi.fn();
      render(<Field defaultValue="5" minValue="0" onChange={onChange} />);
      const input = screen.getByRole("spinbutton");
      input.focus();
      fireEvent.change(input, { target: { value: "5" } });
      onChange.mockClear();

      fireEvent.change(input, { target: { value: text } });

      expect(input).toHaveProperty("value", "5");
      expect(onChange).not.toHaveBeenCalled();
    },
  );

  it("treats a pasted negative zero above a minimum of 0 like any other negative", () => {
    const paste = (text: string) => {
      const onChange = vi.fn();
      const { unmount } = render(
        <Field defaultValue="5" minValue="1" onChange={onChange} />,
      );
      const input = screen.getByRole("spinbutton");
      input.focus();
      fireEvent.change(input, { target: { value: "5" } });
      onChange.mockClear();
      fireEvent.change(input, { target: { value: text } });
      const seen = {
        value: (input as HTMLInputElement).value,
        calls: onChange.mock.calls.map((c) => String(c[0])),
      };
      unmount();
      return seen;
    };

    expect(paste("-0")).toEqual(paste("-5"));
    expect(paste("-0").calls).not.toEqual([]);
  });

  it("accepts a negative zero with no minimum", () => {
    render(<Field />);
    const input = screen.getByRole("spinbutton");
    input.focus();

    fireEvent.change(input, { target: { value: "-." } });

    expect(input).toHaveProperty("value", "-0.");
  });

  it.each([
    ["no minimum", undefined],
    ["a negative minimum", "-10"],
    // BigNumber reads "" as NaN, and the clamp ignores a NaN minimum, so a pasted "-5" passes too
    ["an unparsable minimum", ""],
  ])("accepts a lone '-' with %s", (_, minValue) => {
    render(<Field minValue={minValue} />);
    const input = screen.getByRole("spinbutton");
    input.focus();

    fireEvent.change(input, { target: { value: "-" } });

    expect(input).toHaveProperty("value", "-");
  });

  describe("over formatted text", () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });
    afterEach(() => {
      vi.useRealTimers();
    });

    it("keeps the field editable after a refused '-'", () => {
      render(<Field minValue="0" />);
      const input = screen.getByRole("spinbutton");
      input.focus();
      type(input, "1000");
      passIdleFormatDelay();
      expect(input).toHaveProperty("value", "1,000");

      // Select all and type "-": refused, as the field cannot go negative.
      fireEvent.change(input, { target: { value: "-" } });
      expect(input).toHaveProperty("value", "1,000");

      // Backspace, then a digit: both still edit the amount.
      fireEvent.change(input, { target: { value: "1,00" } });
      expect(input).toHaveProperty("value", "100");
      type(input, "2");
      expect(input).toHaveProperty("value", "1002");
    });
  });
});

// Issue log #53: new BigNumber(".") is NaN, so a "." typed first showed "NaN" and reported NaN. The "." case was
// src/test/known-defects/bignumber-field-lone-dot.test.tsx.
describe("useBigNumberField leading decimal point", () => {
  it.each([
    [".", "0.", "0"],
    ["-.", "-0.", "-10"],
  ])(
    "reads a lone '%s' as '%s' and reports no NaN",
    (text, shown, minValue) => {
      const onChange = vi.fn();
      render(<Field minValue={minValue} onChange={onChange} />);
      const input = screen.getByRole("spinbutton");
      input.focus();

      fireEvent.change(input, { target: { value: text } });

      expect(input).toHaveProperty("value", shown);
      expect(onChange.mock.calls.map(([v]) => v.toFixed())).toEqual(["0"]);
    },
  );

  it("holds 0.5 when '.5' is typed into a controlled field", () => {
    const held: string[] = [];
    render(<Controlled held={held} minValue="0" />);
    const input = screen.getByRole("spinbutton");
    input.focus();

    type(input, ".5");

    expect(input).toHaveProperty("value", "0.5");
    expect(held[held.length - 1]).toBe("0.5");
  });

  it("holds the amount it shows after '.' replaces a typed 5 and the field is left", () => {
    const held: string[] = [];
    render(<Controlled held={held} minValue="0" />);
    const input = screen.getByRole("spinbutton");
    input.focus();
    type(input, "5");

    // Select all, type ".", leave the field.
    fireEvent.change(input, { target: { value: "." } });
    fireEvent.blur(input);

    expect(input).toHaveProperty("value", "0");
    expect(held).toEqual(["5", "0"]);
  });

  // Replaces the selection with `text`, as a key, Delete or Backspace does, and leaves the caret after it. Text the
  // field then changes is set anew, which moves the caret to the end, as in a browser.
  const editAtCaret = (input: HTMLInputElement, text: string) => {
    const { selectionStart: start, selectionEnd: end, value } = input;
    const setValue = Object.getOwnPropertyDescriptor(
      HTMLInputElement.prototype,
      "value",
    )?.set;
    setValue?.call(
      input,
      value.slice(0, start ?? 0) + text + value.slice(end ?? 0),
    );
    const caret = (start ?? 0) + text.length;
    input.setSelectionRange(caret, caret);
    fireEvent.input(input);
  };

  it.each([false, true])(
    "keeps '.5' and its caret when '12' is deleted from '12.5', so a 3 typed next gives 3.5 (controlled: %s)",
    (controlled) => {
      const held: string[] = [];
      render(
        controlled ? (
          <Controlled held={held} />
        ) : (
          <Field onChange={(v) => held.push(v.toFixed())} />
        ),
      );
      const input = screen.getByRole("spinbutton") as HTMLInputElement;
      input.focus();
      type(input, "12.5");

      // Select "12", press Delete, then type 3.
      input.setSelectionRange(0, 2);
      editAtCaret(input, "");
      expect(input).toHaveProperty("value", ".5");
      expect(input.selectionStart).toBe(0);
      editAtCaret(input, "3");

      expect(input).toHaveProperty("value", "3.5");
      expect(held.slice(-2)).toEqual(["0.5", "3.5"]);
    },
  );
});

// Issue log #54: the idle format, 3s after typing, turned "1." and "1.0" into "1", so a 5 typed next gave 15. It keeps
// the text as typed and only adds grouping.
describe("useBigNumberField idle format", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it.each([
    ["1.", "5", "1.5", "1.5", "0"],
    [".", "5", "0.5", "0.5", "0"],
    ["1.0", "5", "1.05", "1.05", "0"],
    ["2.50", "3", "2.503", "2.503", "0"],
    ["-0.0", "5", "-0.05", "-0.05", "-10"],
    ["-0", "5", "-05", "-5", "-10"],
  ])(
    "keeps '%s' as typed, so a %s typed after the pause gives %s",
    (text, next, after, expected, minValue) => {
      const held: string[] = [];
      render(<Controlled held={held} minValue={minValue} />);
      const input = screen.getByRole("spinbutton");
      input.focus();
      const shown: string[] = [];

      type(input, text);
      shown.push((input as HTMLInputElement).value);
      passIdleFormatDelay();
      shown.push((input as HTMLInputElement).value);
      type(input, next);
      shown.push((input as HTMLInputElement).value);

      const typed = text.replace(/^\./, "0.");
      expect({ shown, held: held[held.length - 1] }).toEqual({
        shown: [typed, typed, after],
        held: expected,
      });
    },
  );

  it.each([
    ["1000", "1,000"],
    ["1000.5", "1,000.5"],
    ["1000.50", "1,000.50"],
    // Leading zeros go: a digit typed next means the same either way
    ["0012.50", "12.50"],
  ])("only adds grouping to '%s': %s", (text, formatted) => {
    render(<Field />);
    const input = screen.getByRole("spinbutton");
    input.focus();

    type(input, text);
    passIdleFormatDelay();

    expect(input).toHaveProperty("value", formatted);
  });

  it("formats a value in exponential notation in full", () => {
    render(<Field value="1e3" />);
    const input = screen.getByRole("spinbutton");
    expect(input).toHaveProperty("value", "1e3");

    passIdleFormatDelay();

    expect(input).toHaveProperty("value", "1,000");
  });

  it("keeps typed zeros with custom separators, and reads them back", () => {
    const onChange = vi.fn();
    render(
      <Field
        formatOptions={{
          prefix: "€",
          decimalSeparator: ",",
          groupSeparator: " ",
        }}
        onChange={onChange}
      />,
    );
    const input = screen.getByRole("spinbutton");
    input.focus();

    type(input, "1000.50");
    passIdleFormatDelay();
    expect(input).toHaveProperty("value", "€1 000,50");

    type(input, "3");
    expect(input).toHaveProperty("value", "1000.503");
    expect(onChange.mock.lastCall?.[0].toFixed()).toBe("1000.503");
  });
});
