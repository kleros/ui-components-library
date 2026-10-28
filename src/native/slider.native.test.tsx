import React from "react";
import { render, screen } from "@testing-library/react";
import { expect, test } from "vitest";
import { userEvent } from "@vitest/browser/context";

import Slider from "../lib/form/slider";

const shadow = (element: Element) => getComputedStyle(element).boxShadow;

// react-aria marks keyboard focus on the thumb; real Tab presses set it.
test("the thumb glows while it has keyboard focus", async () => {
  render(
    <>
      <button>Before</button>
      <Slider
        aria-label="Amount"
        leftLabel="0"
        rightLabel="100"
        callback={() => {}}
      />
    </>,
  );
  const thumb = document.querySelector("[data-slot=slider-thumb]")!;
  expect(shadow(thumb)).toBe("none");

  await userEvent.click(screen.getByRole("button", { name: "Before" }));
  await userEvent.tab();

  expect(screen.getByRole("slider")).toHaveFocus();
  // the input glow, past the thumb's transition
  await expect.poll(() => shadow(thumb)).toMatch(/ 0px 0px 6px /);
});
