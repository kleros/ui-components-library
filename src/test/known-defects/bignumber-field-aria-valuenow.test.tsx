import React from "react";
import { render, screen } from "@testing-library/react";
import BigNumber from "bignumber.js";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import {
  BigNumberFieldProps,
  useBigNumberField,
} from "../../lib/form/bignumber-field/useBigNumberField";

const LARGE = "123456789012345678901234567890";

const Field = (props: BigNumberFieldProps) => (
  <input {...useBigNumberField(props).inputProps} />
);

// EXPONENTIAL_AT is global; the hook raises it only after its first render.
let exponentialAt: BigNumber.Config["EXPONENTIAL_AT"];

beforeEach(() => {
  exponentialAt = BigNumber.config({}).EXPONENTIAL_AT;
  BigNumber.config({ EXPONENTIAL_AT: [-7, 20] });
});

afterEach(() => {
  BigNumber.config({ EXPONENTIAL_AT: exponentialAt });
});

const renderLarge = () => {
  render(<Field defaultValue={LARGE} />);
  return screen.getByRole("spinbutton");
};

describe("BigNumberField aria-valuenow", () => {
  it("renders a large value exactly on the first render", () => {
    const input = renderLarge();

    expect(input).toHaveProperty(
      "value",
      "123,456,789,012,345,678,901,234,567,890",
    );
    const valueNow = input.getAttribute("aria-valuenow") ?? "";
    expect(new BigNumber(valueNow).isEqualTo(LARGE)).toBe(true);
  });

  // Tracked by 2026-10-09-ui-components-library-a11y-library-defects (F5); drop `.fails` when fixed.
  it.fails("is in plain decimal notation for a large value", () => {
    const input = renderLarge();

    expect(input.getAttribute("aria-valuenow")).toBe(LARGE);
  });
});
