import React, { useEffect, useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { expect, fn, userEvent, waitFor, within } from "@storybook/test";

import { IPreviewArgs } from "./utils";

import DraggableList from "../lib/draggable-list";
import { Button } from "../lib";
import { ListItem, useList } from "../lib/draggable-list/useList";
import { a11yExceptions } from "./a11y";
import { WHITE_ON_BLUE_LIGHT } from "./a11y-defects";

const meta = {
  component: DraggableList,
  title: "Draggable List",
  tags: ["autodocs"],
  args: {
    updateCallback: fn(),
    selectionCallback: fn(),
  },
  argTypes: {
    dragDisabled: {
      control: "boolean",
    },
    deletionDisabled: {
      control: "boolean",
    },
  },
} satisfies Meta<typeof DraggableList>;

export default meta;

type Story = StoryObj<typeof meta> & IPreviewArgs;

const getOptions = (canvasElement: HTMLElement) =>
  within(
    within(canvasElement).getByRole("listbox", { name: "Reorderable list" }),
  ).getAllByRole("option");

const DELETE_BUTTON_A11Y = a11yExceptions(
  {
    rule: "button-name",
    selector: '[role="option"] button',
    reason:
      "Library defect: the delete button is icon-only and has no accessible name.",
    source: "src/lib/draggable-list/index.tsx:122",
  },
  {
    rule: "nested-interactive",
    selector: '[role="option"]',
    reason:
      "Library defect: the delete button is rendered inside the focusable option.",
    source: "src/lib/draggable-list/index.tsx:98",
  },
);

/** react-aria renders collection items after the list itself mounts (in the
 * production Storybook build that Chromatic runs, a tick later than in dev),
 * so plays must wait for the items before querying them synchronously. */
const findOptions = (canvasElement: HTMLElement) =>
  within(
    within(canvasElement).getByRole("listbox", { name: "Reorderable list" }),
  ).findAllByRole("option");

const names = (options: HTMLElement[]) =>
  options.map((option) => option.textContent);

export const Default: Story = {
  args: {
    themeUI: "light",
    backgroundUI: "light",
    items: [
      { id: 1, name: "Illustrator", value: "" },
      { id: 2, name: "Premiere", value: "" },
      { id: 3, name: "Acrobat", value: "" },
    ],
  },
  parameters: a11yExceptions(WHITE_ON_BLUE_LIGHT),
  render: function Render(args) {
    const [items, setItems] = useState<ListItem[]>([
      { id: 1, name: "Illustrator", value: "" },
      { id: 2, name: "Premiere", value: "" },
      { id: 3, name: "Acrobat", value: "" },
    ]);

    const addItem = () => {
      setItems([
        ...items,
        // ids must stay unique after deletions
        {
          id: Math.max(0, ...items.map((item) => Number(item.id))) + 1,
          name: "New Item",
          value: "",
        },
      ]);
    };
    return (
      <div>
        <DraggableList
          {...args}
          items={items}
          updateCallback={(items) => {
            setItems(items);
            args.updateCallback?.(items);
          }}
        />
        <Button onPress={addItem} text="Add Item" className="mt-4" />
      </div>
    );
  },
  play: async ({ canvasElement, args, step }) => {
    const canvas = within(canvasElement);
    await expect(names(await findOptions(canvasElement))).toEqual([
      "Illustrator",
      "Premiere",
      "Acrobat",
    ]);

    await step(
      "selecting an item reports it and shows its delete button",
      async () => {
        const premiere = canvas.getByRole("option", { name: "Premiere" });
        await expect(within(premiere).queryByRole("button")).toBeNull();
        await userEvent.click(premiere);
        await expect(premiere).toHaveAttribute("aria-selected", "true");
        await expect(args.selectionCallback).toHaveBeenLastCalledWith({
          id: 2,
          name: "Premiere",
          value: "",
        });
        await expect(
          await within(premiere).findByRole("button"),
        ).toBeInTheDocument();
      },
    );

    await step("arrow keys move focus between items", async () => {
      await userEvent.keyboard("{ArrowDown}");
      await expect(
        canvas.getByRole("option", { name: "Acrobat" }),
      ).toHaveFocus();
      await userEvent.keyboard("{ArrowUp}{ArrowUp}");
      await expect(
        canvas.getByRole("option", { name: "Illustrator" }),
      ).toHaveFocus();
    });

    await step("the delete button removes the item", async () => {
      const premiere = canvas.getByRole("option", { name: "Premiere" });
      await userEvent.click(within(premiere).getByRole("button"));
      await waitFor(() =>
        expect(names(getOptions(canvasElement))).toEqual([
          "Illustrator",
          "Acrobat",
        ]),
      );
      await expect(args.updateCallback).toHaveBeenLastCalledWith([
        { id: 1, name: "Illustrator", value: "" },
        { id: 3, name: "Acrobat", value: "" },
      ]);
    });

    await step("items added by the parent are rendered", async () => {
      await userEvent.click(canvas.getByRole("button", { name: "Add Item" }));
      await expect(names(getOptions(canvasElement))).toEqual([
        "Illustrator",
        "Acrobat",
        "New Item",
      ]);
    });

    // move the pointer away so the a11y check runs on the resting state
    await userEvent.unhover(canvas.getByRole("button", { name: "Add Item" }));
  },
};

/** Drag operations can be disabled with `dragDisabled ` */
export const DragDisabled: Story = {
  parameters: DELETE_BUTTON_A11Y,
  args: {
    ...Default.args,
    dragDisabled: true,
  },
  play: async ({ canvasElement }) => {
    const options = await findOptions(canvasElement);
    // no drag handle icon is rendered
    for (const option of options)
      await expect(option.querySelector(".cursor-grab")).toBeNull();
    // items are still selectable and deletable
    await userEvent.click(options[0]);
    await expect(options[0]).toHaveAttribute("aria-selected", "true");
    await expect(
      await within(options[0]).findByRole("button"),
    ).toBeInTheDocument();
  },
};

/** Delete operation can be disabled with `deletionDisabled ` */
export const DeletionDisabled: Story = {
  args: {
    ...Default.args,
    deletionDisabled: true,
  },
  play: async ({ canvasElement, args }) => {
    const options = await findOptions(canvasElement);
    await expect(options[0].querySelector(".cursor-grab")).toBeInTheDocument();
    await userEvent.click(options[1]);
    await expect(options[1]).toHaveAttribute("aria-selected", "true");
    await expect(args.selectionCallback).toHaveBeenCalledWith(
      expect.objectContaining({ name: "Premiere" }),
    );
    // no delete button, even when selected or hovered
    await userEvent.hover(options[1]);
    await expect(within(options[1]).queryByRole("button")).toBeNull();
    await userEvent.unhover(options[1]);
  },
};

export const CustomDragPreview: Story = {
  parameters: DELETE_BUTTON_A11Y,
  args: {
    themeUI: "light",
    backgroundUI: "light",
    items: [
      { id: 1, name: "Illustrator", value: "" },
      { id: 2, name: "Premiere", value: "" },
      { id: 3, name: "Acrobat", value: "" },
    ],
    renderDragPreview: (items) => (
      <div className="rounded-base bg-klerosUIComponentsPrimaryBlue px-4 py-2">
        <span className="text-klerosUIComponentsPrimaryText text-base">
          {items[0]["text/plain"]}
        </span>
      </div>
    ),
  },
  render: (args) => {
    return <DraggableList {...args} />;
  },
  play: async ({ canvasElement, args }) => {
    const options = await findOptions(canvasElement);
    await expect(names(options)).toEqual([
      "Illustrator",
      "Premiere",
      "Acrobat",
    ]);
    // single selection: selecting another item deselects the previous one
    await userEvent.click(options[0]);
    await userEvent.click(options[2]);
    await expect(options[0]).toHaveAttribute("aria-selected", "false");
    await expect(options[2]).toHaveAttribute("aria-selected", "true");
    await expect(args.selectionCallback).toHaveBeenLastCalledWith(
      expect.objectContaining({ id: 3 }),
    );
  },
};

/** Items can be reordered with the keyboard (Enter to drag, arrows, Enter to drop). */
export const KeyboardReorder: Story = {
  ...Default,
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const acrobat = await canvas.findByRole("option", { name: "Acrobat" });
    acrobat.focus();
    await userEvent.keyboard("{Enter}");
    // drop targets are announced as options between the items
    await waitFor(() =>
      expect(
        within(document.body).getAllByRole("option", { name: /Insert/ }).length,
      ).toBeGreaterThan(0),
    );
    // move the drop indicator until it sits between Illustrator and Premiere
    for (let i = 0; i < 6; i++) {
      const label = document.activeElement?.getAttribute("aria-label") ?? "";
      if (/between Illustrator and Premiere/.test(label)) break;
      await userEvent.keyboard("{ArrowUp}");
    }
    await expect(document.activeElement).toHaveAccessibleName(
      /between Illustrator and Premiere/,
    );
    await userEvent.keyboard("{Enter}");
    await waitFor(() =>
      expect(names(getOptions(canvasElement))).toEqual([
        "Illustrator",
        "Acrobat",
        "Premiere",
      ]),
    );
    await expect(args.updateCallback).toHaveBeenCalledTimes(1);
    await expect(args.updateCallback).toHaveBeenLastCalledWith([
      { id: 1, name: "Illustrator", value: "" },
      { id: 3, name: "Acrobat", value: "" },
      { id: 2, name: "Premiere", value: "" },
    ]);
  },
};

type ListApi = ReturnType<typeof useList>;

const FOUR_ITEMS: ListItem[] = [1, 2, 3, 4].map((id) => ({
  id,
  name: `Item ${id}`,
  value: "",
}));

/** The `onChange` payload for the items with these ids, in this order. */
const payload = (...ids: number[]): ListItem[] =>
  ids.map((id) => FOUR_ITEMS.find((item) => item.id === id)!);

let listApi: ListApi | undefined;

/** Renders `useList` directly so `moveBefore` / `moveAfter` receive exact keys
 * instead of react-aria drop positions. */
function ListHarness({
  onChange,
}: Readonly<{ onChange: (items: ListItem[]) => void }>) {
  const api = useList({ initialItems: FOUR_ITEMS, onChange });
  useEffect(() => {
    listApi = api;
  });
  return (
    <ul
      aria-label="useList harness"
      className="text-klerosUIComponentsPrimaryText"
    >
      {api.items.map((item) => (
        <li key={item.id}>{item.name}</li>
      ))}
    </ul>
  );
}

const hookItemNames = () =>
  within(document.body)
    .getAllByRole("listitem")
    .map((item) => item.textContent);

const namesOf = (...ids: number[]) => ids.map((id) => `Item ${id}`);

const hookStory = (play: NonNullable<Story["play"]>): Story => ({
  args: { ...Default.args },
  parameters: a11yExceptions(WHITE_ON_BLUE_LIGHT),
  render: function Render(args) {
    const [mount, setMount] = useState(0);
    return (
      <>
        <ListHarness
          key={mount}
          onChange={(items) => args.updateCallback?.(items)}
        />
        <Button
          text="Reset"
          onPress={() => {
            listApi = undefined;
            setMount(mount + 1);
          }}
        />
      </>
    );
  },
  play,
});

type MoveCase = {
  move: (api: ListApi) => void;
  /** Ids in the order the list should hold afterwards. */
  expected: number[];
  /** Expected `onChange` calls; 0 for a rejected move. */
  calls: number;
};

/** Runs every case against a freshly mounted `[1, 2, 3, 4]` list, asserting
 * the rendered order and the exact `onChange` call count and payload. */
const runMoveCases = async (
  canvasElement: HTMLElement,
  onChange: ReturnType<typeof fn>,
  cases: Record<string, MoveCase>,
) => {
  const canvas = within(canvasElement);
  let first = true;
  for (const [label, { move, expected, calls }] of Object.entries(cases)) {
    if (!first)
      await userEvent.click(canvas.getByRole("button", { name: "Reset" }));
    first = false;
    await waitFor(() => expect(listApi).toBeDefined());
    await waitFor(() => expect(hookItemNames()).toEqual(namesOf(1, 2, 3, 4)));
    onChange.mockClear();

    move(listApi!);

    await waitFor(
      () => expect(hookItemNames(), label).toEqual(namesOf(...expected)),
      { timeout: 1000 },
    );
    await expect(onChange, label).toHaveBeenCalledTimes(calls);
    if (calls > 0)
      await expect(onChange, label).toHaveBeenLastCalledWith(
        payload(...expected),
      );
  }
};

const rejected = (move: MoveCase["move"]): MoveCase => ({
  move,
  expected: [1, 2, 3, 4],
  calls: 0,
});

/** `moveBefore` with the source above the target is not affected by the removal shift. */
export const MoveBeforeUpward: Story = hookStory(
  async ({ canvasElement, args }) => {
    await runMoveCases(
      canvasElement,
      args.updateCallback as ReturnType<typeof fn>,
      {
        "nonadjacent: 4 before 2": {
          move: (api) => api.moveBefore(2, [4]),
          expected: [1, 4, 2, 3],
          calls: 1,
        },
        "adjacent: 3 before 2": {
          move: (api) => api.moveBefore(2, [3]),
          expected: [1, 3, 2, 4],
          calls: 1,
        },
        "only the first key moves: 4 before 2 with keys [4, 3]": {
          move: (api) => api.moveBefore(2, [4, 3]),
          expected: [1, 4, 2, 3],
          calls: 1,
        },
        "to the front: 4 before 1": {
          move: (api) => api.moveBefore(1, [4]),
          expected: [4, 1, 2, 3],
          calls: 1,
        },
      },
    );
  },
);

/** `moveAfter` with the source above the target (a downward move) must account for the removed item. */
export const MoveAfterDownward: Story = hookStory(
  async ({ canvasElement, args }) => {
    await runMoveCases(
      canvasElement,
      args.updateCallback as ReturnType<typeof fn>,
      {
        "nonadjacent: 1 after 3": {
          move: (api) => api.moveAfter(3, [1]),
          expected: [2, 3, 1, 4],
          calls: 1,
        },
        "adjacent: 1 after 2": {
          move: (api) => api.moveAfter(2, [1]),
          expected: [2, 1, 3, 4],
          calls: 1,
        },
        "to the end: 1 after 4": {
          move: (api) => api.moveAfter(4, [1]),
          expected: [2, 3, 4, 1],
          calls: 1,
        },
      },
    );
  },
);

/** `moveAfter` with the source below the target inserts directly after it. */
export const MoveAfterUpward: Story = hookStory(
  async ({ canvasElement, args }) => {
    await runMoveCases(
      canvasElement,
      args.updateCallback as ReturnType<typeof fn>,
      {
        "nonadjacent: 4 after 1": {
          move: (api) => api.moveAfter(1, [4]),
          expected: [1, 4, 2, 3],
          calls: 1,
        },
        "only the first key moves: 4 after 1 with keys [4, 3]": {
          move: (api) => api.moveAfter(1, [4, 3]),
          expected: [1, 4, 2, 3],
          calls: 1,
        },
        "4 after 2": {
          move: (api) => api.moveAfter(2, [4]),
          expected: [1, 2, 4, 3],
          calls: 1,
        },
      },
    );
  },
);

/** Moves that must leave the list untouched and not call `onChange`. */
export const MoveRejected: Story = hookStory(
  async ({ canvasElement, args }) => {
    await runMoveCases(
      canvasElement,
      args.updateCallback as ReturnType<typeof fn>,
      {
        "moveBefore onto itself": rejected((api) => api.moveBefore(2, [2])),
        "moveAfter onto itself": rejected((api) => api.moveAfter(2, [2])),
        "moveBefore with a missing source": rejected((api) =>
          api.moveBefore(2, [99]),
        ),
        "moveAfter with a missing source": rejected((api) =>
          api.moveAfter(2, [99]),
        ),
        "moveBefore with a missing target": rejected((api) =>
          api.moveBefore(99, [2]),
        ),
        "moveAfter with a missing target": rejected((api) =>
          api.moveAfter(99, [2]),
        ),
      },
    );
  },
);

/** Dropping below the last item reaches `moveAfter` through the component. */
export const KeyboardReorderAfter: Story = {
  ...Default,
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const illustrator = await canvas.findByRole("option", {
      name: "Illustrator",
    });
    illustrator.focus();
    await userEvent.keyboard("{Enter}");
    await waitFor(() =>
      expect(
        within(document.body).getAllByRole("option", { name: /Insert/ }).length,
      ).toBeGreaterThan(0),
    );
    for (let i = 0; i < 8; i++) {
      const label = document.activeElement?.getAttribute("aria-label") ?? "";
      if (/after Acrobat/.test(label)) break;
      await userEvent.keyboard("{ArrowDown}");
    }
    await expect(document.activeElement).toHaveAccessibleName(/after Acrobat/);
    await userEvent.keyboard("{Enter}");
    await waitFor(() =>
      expect(names(getOptions(canvasElement))).toEqual([
        "Premiere",
        "Acrobat",
        "Illustrator",
      ]),
    );
    await expect(args.updateCallback).toHaveBeenCalledTimes(1);
    await expect(args.updateCallback).toHaveBeenLastCalledWith([
      { id: 2, name: "Premiere", value: "" },
      { id: 3, name: "Acrobat", value: "" },
      { id: 1, name: "Illustrator", value: "" },
    ]);
  },
};
