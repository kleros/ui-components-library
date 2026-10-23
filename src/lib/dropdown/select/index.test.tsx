import React from "react";
import { expect, it } from "vitest";

import DropdownSelect from ".";

const items = [{ id: 1, text: "a" }];

// Checked by `yarn check-types`; the elements are never rendered.
const typeChecks = () => [
  <DropdownSelect key="single" items={items} callback={(item) => item.text} />,
  <DropdownSelect
    key="multiple"
    selectionMode="multiple"
    items={items}
    callback={(picked) => picked.map((item) => item.text)}
  />,
  // @ts-expect-error a single selection passes one item to callback
  <DropdownSelect
    key="single-array"
    items={items}
    callback={(picked: typeof items) => picked}
  />,
  // @ts-expect-error react-aria ignores defaultSelectedKey in multiple selection
  <DropdownSelect
    key="multiple-default"
    selectionMode="multiple"
    items={items}
    callback={() => {}}
    defaultSelectedKey={1}
  />,
  // @ts-expect-error react-aria never calls onSelectionChange in multiple selection
  <DropdownSelect
    key="multiple-on-selection-change"
    selectionMode="multiple"
    items={items}
    callback={() => {}}
    onSelectionChange={() => {}}
  />,
];

it("types callback by selection mode and rejects single-selection props in multiple selection", () => {
  expect(typeChecks).toBeTypeOf("function");
});
