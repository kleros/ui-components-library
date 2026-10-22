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

  const onChange = () => {};
  const onValueChange = () => {};

  // An echo comes in the same update as the field's report. These parents do not echo, so an
  // empty value in a later update is their own reset.
  it.each([
    ['"." reported as NaN to an onChange that ignores it', ".", { onChange }],
    [
      '"-" reported to an onValueChange that only observes',
      "-",
      { onChange, onValueChange },
    ],
    ['"-", which onChange is not told about', "-", { onChange }],
  ])(
    "empties %s when the value changes to empty in a later update",
    (_, text, handlers: BigNumberFieldProps) => {
      const { rerender } = render(<Field value="5" {...handlers} />);
      const input = screen.getByRole("spinbutton");
      fireEvent.change(input, { target: { value: text } });

      rerender(<Field value="" {...handlers} />);

      expect(input).toHaveProperty("value", "");
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

describe("useBigNumberField null value", () => {
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

  it("mounts empty with value={null}", () => {
    render(<Field value={null} />);
    const input = screen.getByRole("spinbutton");

    passIdleFormatDelay();
    fireEvent.blur(input);

    expect(input).toHaveProperty("value", "");
    expect(input.getAttribute("aria-valuenow")).toBe("");
  });

  it.each([
    ["string", "5"],
    ["BigNumber", new BigNumber("5")],
  ])("empties when a %s value changes to null", (_, from) => {
    const { rerender } = render(<Field value={from} />);
    const input = screen.getByRole("spinbutton");

    rerender(<Field value={null} />);
    passIdleFormatDelay();
    fireEvent.blur(input);

    expect(input).toHaveProperty("value", "");
    expect(input.getAttribute("aria-valuenow")).toBe("");
  });

  it("shows a value set after null", () => {
    const { rerender } = render(<Field value={null} />);
    const input = screen.getByRole("spinbutton");

    rerender(<Field value="7" />);

    expect(input).toHaveProperty("value", "7");
    expect(input.getAttribute("aria-valuenow")).toBe("7");
  });
});

describe("useBigNumberField onValueChange", () => {
  /** The values passed to a change handler, as strings, with null kept as null. */
  const reported = (handler: ReturnType<typeof vi.fn>) =>
    handler.mock.calls.map(([value]) =>
      value === null ? null : String(value),
    );

  it.each([
    ["while editing", false],
    ["after blur formats it", true],
  ])(
    "reports an input emptied %s as null while onChange gets 0",
    (_, formatFirst) => {
      const onChange = vi.fn();
      const onValueChange = vi.fn();
      render(
        <Field
          defaultValue="1234"
          onChange={onChange}
          onValueChange={onValueChange}
        />,
      );
      const input = screen.getByRole("spinbutton");
      // Blur formats the text, so the next edit goes through the unformatting path.
      if (formatFirst) fireEvent.blur(input);

      fireEvent.change(input, { target: { value: "" } });

      expect(input).toHaveProperty("value", "");
      expect(reported(onValueChange)).toEqual([null]);
      expect(reported(onChange)).toEqual(["0"]);
    },
  );

  it("reports typed, stepped and clamped values like onChange", () => {
    const onChange = vi.fn();
    const onValueChange = vi.fn();
    render(
      <Field
        minValue="0"
        maxValue="10"
        onChange={onChange}
        onValueChange={onValueChange}
      />,
    );
    const input = screen.getByRole("spinbutton");

    fireEvent.change(input, { target: { value: "7" } });
    fireEvent.keyDown(input, { key: "ArrowUp" });
    // Blur formats the text, so "50" goes through the unformatting path.
    fireEvent.blur(input);
    fireEvent.change(input, { target: { value: "50" } });
    fireEvent.keyDown(input, { key: "Home" });
    fireEvent.keyDown(input, { key: "End" });
    fireEvent.keyDown(input, { key: "ArrowDown" });

    expect(reported(onValueChange)).toEqual(["7", "8", "10", "0", "10", "9"]);
    expect(reported(onChange)).toEqual(reported(onValueChange));
  });

  it.each([
    [".", "while editing", false],
    [".", "after blur formats it", true],
    ["-.", "while editing", false],
  ])(
    'keeps "%s" typed %s, and reports it as null while onChange gets NaN',
    (text, _, formatFirst) => {
      const onChange = vi.fn();
      const onValueChange = vi.fn();
      render(
        <Field
          defaultValue="1234"
          onChange={onChange}
          onValueChange={onValueChange}
        />,
      );
      const input = screen.getByRole("spinbutton");
      if (formatFirst) fireEvent.blur(input);

      fireEvent.change(input, { target: { value: text } });

      expect(input).toHaveProperty("value", text);
      expect(input.getAttribute("aria-valuenow")).toBe("");
      expect(reported(onValueChange)).toEqual([null]);
      // onChange gets NaN for this text, as it always has
      expect(reported(onChange)).toEqual(["NaN"]);
    },
  );

  it.each([
    ["while editing", false],
    ["after blur formats it", true],
  ])(
    "reports a lone minus sign typed %s as null, where onChange is not called",
    (_, formatFirst) => {
      const onChange = vi.fn();
      const onValueChange = vi.fn();
      render(
        <Field
          defaultValue="5"
          onChange={onChange}
          onValueChange={onValueChange}
        />,
      );
      const input = screen.getByRole("spinbutton");
      if (formatFirst) fireEvent.blur(input);

      fireEvent.change(input, { target: { value: "-" } });

      expect(input).toHaveProperty("value", "-");
      expect(reported(onValueChange)).toEqual([null]);
      expect(onChange).not.toHaveBeenCalled();
    },
  );
});

describe("useBigNumberField required on blur", () => {
  it.each([".", "-."])(
    'flags a required field whose "%s" blur empties',
    (text) => {
      render(<Field isRequired />);
      const input = screen.getByRole("spinbutton");

      fireEvent.change(input, { target: { value: text } });
      fireEvent.blur(input);

      expect(input).toHaveProperty("value", "");
      expect(input.getAttribute("aria-invalid")).toBe("true");
    },
  );
});

describe("useBigNumberField decimal point key", () => {
  it.each([
    ["the whole text", 0, 3, true],
    ["the decimal point", 1, 2, true],
    ["digits only", 0, 1, false],
    ["nothing", 3, 3, false],
  ])(
    'accepts "." over "1.5" with %s selected only if the point is selected',
    (_, start, end, accepted) => {
      render(<Field defaultValue="1.5" />);
      const input = screen.getByRole("spinbutton") as HTMLInputElement;
      input.setSelectionRange(start, end);

      // fireEvent returns false when the handler prevented the keystroke
      expect(fireEvent.keyDown(input, { key: "." })).toBe(accepted);
    },
  );

  it.each([
    [
      "the default format, where it is the decimal point",
      {},
      "1,234.5",
      5,
      true,
    ],
    [
      "a decimal comma, where it is a group separator",
      { decimalSeparator: ",", groupSeparator: "." },
      "1.234,5",
      1,
      false,
    ],
  ])(
    'accepts "." over a selected "." in formatted text with %s',
    (_, formatOptions, formatted, point, accepted) => {
      render(<Field defaultValue="1234.5" formatOptions={formatOptions} />);
      const input = screen.getByRole("spinbutton") as HTMLInputElement;
      // Blur formats the text
      fireEvent.blur(input);
      expect(input).toHaveProperty("value", formatted);
      input.setSelectionRange(point, point + 1);

      expect(fireEvent.keyDown(input, { key: "." })).toBe(accepted);
    },
  );
});

describe("useBigNumberField controlled through onValueChange", () => {
  const BigNumberState = () => {
    const [value, setValue] = React.useState<BigNumber | null>(
      new BigNumber("12"),
    );
    return (
      <>
        <Field value={value} onValueChange={setValue} />
        <output>{value === null ? "empty" : value.toString()}</output>
      </>
    );
  };

  const StringState = () => {
    const [amount, setAmount] = React.useState("12");
    return (
      <>
        <Field
          value={amount}
          onValueChange={(value) => setAmount(value?.toString() ?? "")}
        />
        <output>{amount === "" ? "empty" : amount}</output>
      </>
    );
  };

  it.each([
    ["a BigNumber | null", BigNumberState],
    ["a string", StringState],
  ])(
    "keeps a cleared field empty and a typed 0 as 0 with %s state",
    (_, Harness) => {
      render(<Harness />);
      const input = screen.getByRole("spinbutton");
      const state = screen.getByRole("status");

      fireEvent.change(input, { target: { value: "" } });
      expect(state.textContent).toBe("empty");
      expect(input).toHaveProperty("value", "");
      expect(input.getAttribute("aria-valuenow")).toBe("");

      fireEvent.change(input, { target: { value: "0" } });
      expect(state.textContent).toBe("0");
      expect(input).toHaveProperty("value", "0");

      fireEvent.change(input, { target: { value: "0." } });
      expect(state.textContent).toBe("0");
      expect(input).toHaveProperty("value", "0.");
    },
  );

  it.each([
    ["a BigNumber | null", BigNumberState],
    ["a string", StringState],
  ])(
    "keeps text that holds no number yet over a number with %s state",
    (_, Harness) => {
      render(<Harness />);
      const input = screen.getByRole("spinbutton");
      const state = screen.getByRole("status");

      // The parent held 12, and now holds empty: the "." stays, so ".5" is 0.5 and not 5.
      fireEvent.change(input, { target: { value: "." } });
      expect(input).toHaveProperty("value", ".");
      expect(state.textContent).toBe("empty");
      fireEvent.change(input, { target: { value: ".5" } });
      expect(state.textContent).toBe("0.5");

      fireEvent.change(input, { target: { value: "-" } });
      expect(input).toHaveProperty("value", "-");
      expect(state.textContent).toBe("empty");
      fireEvent.change(input, { target: { value: "-5" } });
      expect(state.textContent).toBe("-5");
    },
  );
});

describe("useBigNumberField text that holds no number yet, controlled through onChange", () => {
  const StringEcho = () => {
    const [amount, setAmount] = React.useState("12");
    return (
      <>
        <Field value={amount} onChange={(v) => setAmount(v.toString())} />
        <output>{amount}</output>
        <button onClick={() => setAmount("")}>Reset</button>
      </>
    );
  };

  // A new BigNumber on every render, so each echo runs the value sync.
  const FreshBigNumber = () => {
    const [amount, setAmount] = React.useState("12");
    return (
      <>
        <Field
          value={new BigNumber(amount)}
          onChange={(v) => setAmount(v.toString())}
        />
        <output>{amount}</output>
      </>
    );
  };

  it.each([
    ["string", StringEcho],
    ["fresh BigNumber", FreshBigNumber],
  ])(
    "keeps a leading decimal point when NaN echoes back as the %s value",
    (_, Harness) => {
      render(<Harness />);
      const input = screen.getByRole("spinbutton");
      const state = screen.getByRole("status");

      fireEvent.change(input, { target: { value: "." } });
      expect(state.textContent).toBe("NaN");
      expect(input).toHaveProperty("value", ".");

      fireEvent.change(input, { target: { value: ".5" } });
      expect(state.textContent).toBe("0.5");
      expect(input).toHaveProperty("value", ".5");
    },
  );

  it("empties the text on a parent reset after a NaN that left the parent unchanged", () => {
    render(<StringEcho />);
    const input = screen.getByRole("spinbutton");
    fireEvent.change(input, { target: { value: "." } });
    // "-." is NaN too, so the parent keeps "NaN" and nothing echoes
    fireEvent.change(input, { target: { value: "-." } });
    expect(input).toHaveProperty("value", "-.");

    fireEvent.click(screen.getByRole("button", { name: "Reset" }));

    expect(input).toHaveProperty("value", "");
  });
});
