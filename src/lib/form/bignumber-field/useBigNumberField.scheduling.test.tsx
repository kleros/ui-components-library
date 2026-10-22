import React, {
  startTransition,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { createRoot, Root } from "react-dom/client";
import { fireEvent } from "@testing-library/dom";
import BigNumber from "bignumber.js";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { BigNumberFieldProps, useBigNumberField } from "./useBigNumberField";

// These tests let React schedule work as it does in a browser. act() would run every pending
// effect at once, and hide the order in which React runs them.

const Field = (props: BigNumberFieldProps) => (
  <input {...useBigNumberField(props).inputProps} />
);

type Wiring = "onChange" | "onValueChange";

let typeDuringNextCommit: ((input: HTMLInputElement) => void) | null = null;
let passiveEffectsPendingAtKeystroke: boolean | null = null;
let renderInTransition: () => void = () => {};

/** A parent that echoes the field's report as string state, and can re-render in a transition. */
const Parent = ({ wiring }: { wiring: Wiring }) => {
  const [amount, setAmount] = useState("12");
  const [renders, setRenders] = useState(0);
  renderInTransition = () => startTransition(() => setRenders((n) => n + 1));
  // The render whose passive effects ran last
  const effectsRun = useRef(0);

  useLayoutEffect(() => {
    const type = typeDuringNextCommit;
    if (renders === 0 || !type) return;
    typeDuringNextCommit = null;
    // A commit long enough that React's scheduler yields to the browser before it runs this
    // commit's passive effects. A keystroke handled in that gap finds them pending.
    const end = performance.now() + 20;
    while (performance.now() < end);
    queueMicrotask(() => {
      passiveEffectsPendingAtKeystroke = effectsRun.current !== renders;
      type(document.querySelector("input")!);
    });
  });
  useEffect(() => {
    effectsRun.current = renders;
  });

  return (
    <>
      <Field
        value={amount}
        {...(wiring === "onChange"
          ? { onChange: (v: BigNumber) => setAmount(v.toString()) }
          : {
              onValueChange: (v: BigNumber | null) =>
                setAmount(v?.toString() ?? ""),
            })}
      />
      <output>{amount}</output>
    </>
  );
};

describe("useBigNumberField echo after a transition render", () => {
  let host: HTMLDivElement;
  let root: Root;
  let actEnvironment: unknown;

  beforeEach(() => {
    actEnvironment = (globalThis as Record<string, unknown>)
      .IS_REACT_ACT_ENVIRONMENT;
    (globalThis as Record<string, unknown>).IS_REACT_ACT_ENVIRONMENT = false;
    host = document.createElement("div");
    document.body.appendChild(host);
    root = createRoot(host);
    passiveEffectsPendingAtKeystroke = null;
  });

  afterEach(() => {
    root.unmount();
    host.remove();
    (globalThis as Record<string, unknown>).IS_REACT_ACT_ENVIRONMENT =
      actEnvironment;
  });

  it.each([
    ['"."', "onChange", ".", "5", "0.5"],
    ['"-"', "onValueChange", "-", "5", "-5"],
  ])(
    "keeps %s echoed to %s when the keystroke comes before the transition's effects run",
    async (_, wiring, first, second, number) => {
      root.render(<Parent wiring={wiring as Wiring} />);
      const input = await vi.waitFor(() => {
        const mounted = host.querySelector("input");
        if (!mounted) throw new Error("The field has not mounted yet");
        return mounted;
      });
      const output = host.querySelector("output")!;

      typeDuringNextCommit = (target) =>
        fireEvent.change(target, { target: { value: first } });
      renderInTransition();
      await vi.waitFor(() =>
        expect(passiveEffectsPendingAtKeystroke).not.toBeNull(),
      );

      expect(
        passiveEffectsPendingAtKeystroke,
        "the keystroke came while the transition's passive effects were pending",
      ).toBe(true);
      expect(input.value).toBe(first);

      fireEvent.change(input, { target: { value: first + second } });

      await vi.waitFor(() => expect(output.textContent).toBe(number));
      expect(input.value).toBe(first + second);
    },
  );
});
