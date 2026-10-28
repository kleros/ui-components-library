// @vitest-environment node
import React from "react";
import { renderToString } from "react-dom/server";
import { expect, it, vi } from "vitest";

vi.mock("../assets/svgs/dropdown/arrow.svg", () => ({ default: () => null }));

import DropdownCascader from "../lib/dropdown/cascader";
import DropdownSelect from "../lib/dropdown/select";
import Slider from "../lib/form/slider";

// React 18's server renderer logs an error for each useLayoutEffect it meets.
it.each([
  [
    "DropdownSelect",
    <DropdownSelect
      key="select"
      items={[{ id: 1, text: "one" }]}
      callback={() => {}}
    />,
  ],
  [
    "DropdownCascader",
    <DropdownCascader
      key="cascader"
      items={[{ id: 1, label: "one", itemValue: 1 }]}
      callback={() => {}}
    />,
  ],
  [
    "Slider",
    <Slider
      key="slider"
      aria-label="Volume"
      leftLabel="0"
      rightLabel="100"
      callback={() => {}}
    />,
  ],
])("%s renders on the server without errors", (_, element) => {
  const error = vi.spyOn(console, "error").mockImplementation(() => {});
  expect(renderToString(element)).not.toBe("");
  expect(error).not.toHaveBeenCalled();
});
