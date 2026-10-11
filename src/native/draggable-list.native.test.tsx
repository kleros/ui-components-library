import React from "react";
import { render, screen, within } from "@testing-library/react";
import { expect, test, vi } from "vitest";
import { userEvent } from "@vitest/browser/context";

import DraggableList from "../lib/draggable-list";

const items = [
  { id: 1, name: "Illustrator", value: "" },
  { id: 2, name: "Premiere", value: "" },
  { id: 3, name: "Acrobat", value: "" },
];

const optionNames = () =>
  screen.getAllByRole("option").map((option) => option.textContent);

test("real hover reveals the delete button and leaving hides it", async () => {
  render(<DraggableList items={items} />);
  const premiere = await screen.findByRole("option", { name: "Premiere" });
  expect(within(premiere).queryByRole("button")).toBeNull();

  await userEvent.hover(premiere);
  await expect
    .poll(() => within(premiere).queryByRole("button"))
    .not.toBeNull();

  await userEvent.unhover(premiere);
  await expect.poll(() => within(premiere).queryByRole("button")).toBeNull();
});

test("a real mouse drag reorders the list", async () => {
  const updateCallback = vi.fn();
  render(<DraggableList items={items} updateCallback={updateCallback} />);
  const illustrator = await screen.findByRole("option", {
    name: "Illustrator",
  });
  const acrobat = screen.getByRole("option", { name: "Acrobat" });
  const { width, height } = acrobat.getBoundingClientRect();

  await userEvent.dragAndDrop(illustrator, acrobat, {
    // react-aria treats a press at the exact centre of a draggable as a
    // TalkBack virtual press and cancels the native drag.
    sourcePosition: { x: 20, y: 10 },
    // The lower edge of an item is its "after" drop position.
    targetPosition: { x: width / 2, y: height - 2 },
  });

  await expect
    .poll(optionNames)
    .toEqual(["Premiere", "Acrobat", "Illustrator"]);
  expect(updateCallback).toHaveBeenLastCalledWith([
    items[1],
    items[2],
    items[0],
  ]);
});
