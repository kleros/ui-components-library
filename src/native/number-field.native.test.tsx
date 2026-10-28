import React from "react";
import { render, screen } from "@testing-library/react";
import { expect, test } from "vitest";
import { userEvent } from "@vitest/browser/context";

import NumberField from "../lib/form/number-field";

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
const background = (element: Element) =>
  getComputedStyle(element).backgroundColor;

// Only a real pointer applies :hover, which the story plays' synthetic events
// don't. A field that can't be edited doesn't react to it, as in BigNumberField.
test.each([
  ["an editable", "fills", {}],
  ["a read-only", "keeps", { isReadOnly: true }],
  ["a disabled", "keeps", { isDisabled: true }],
])("hovering %s NumberField %s its background", async (_, effect, props) => {
  render(<NumberField aria-label="Age" defaultValue={30} {...props} />);
  const input = screen.getByRole("textbox", { name: "Age" });
  const atRest = background(input);

  await userEvent.hover(input);
  // past the 0.1s background transition
  await sleep(300);

  if (effect === "fills") expect(background(input)).not.toBe(atRest);
  else expect(background(input)).toBe(atRest);
});
