import React, { useRef, useState } from "react";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { expect, test } from "vitest";
import { userEvent } from "@vitest/browser/context";
import { Form } from "react-aria-components";

import DropdownSelect from "../lib/dropdown/select";
import DropdownCascader from "../lib/dropdown/cascader";

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
const items = [
  { id: 1, text: "one" },
  { id: 2, text: "two" },
];

// react-aria leaves validation alone on a programmatic reset outside a user
// event, such as one after an awaited submit, so the dropdowns must not commit
// it when the reset sets their value.
test.each([
  [
    "DropdownSelect",
    (props: Record<string, unknown>) => (
      <DropdownSelect items={items} callback={() => {}} {...props} />
    ),
  ],
  [
    "DropdownSelect multiple",
    (props: Record<string, unknown>) => (
      <DropdownSelect
        selectionMode="multiple"
        items={items}
        callback={() => {}}
        {...props}
      />
    ),
  ],
  [
    "DropdownCascader",
    (props: Record<string, unknown>) => (
      <DropdownCascader
        items={[{ id: "a", label: "one", itemValue: 1 }]}
        callback={() => {}}
        {...props}
      />
    ),
  ],
])(
  "a required %s shows no error after a reset that follows an awaited submit",
  async (name, Field) => {
    function App() {
      const formRef = useRef<HTMLFormElement>(null);
      const [status, setStatus] = useState("");
      return (
        <Form
          ref={formRef}
          onSubmit={async (e) => {
            e.preventDefault();
            await sleep(20);
            formRef.current?.reset();
            setStatus("sent");
          }}
        >
          <Field placeholder="Pick" aria-label="Pick" isRequired />
          <button type="submit">Submit</button>
          <output>{status}</output>
        </Form>
      );
    }
    render(<App />);
    const trigger = screen.getByRole("button", { name: /Pick/ });
    await userEvent.click(trigger);
    if (name === "DropdownCascader") {
      await userEvent.click(
        await screen.findByRole("row", {
          name: (text: string) => text.startsWith("one"),
        }),
      );
      await userEvent.click(
        await screen.findByRole("button", { name: /Select\s+one/ }),
      );
    } else {
      await userEvent.click(await screen.findByRole("option", { name: "one" }));
      if (screen.queryByRole("listbox")) await userEvent.keyboard("{Escape}");
    }
    await waitFor(() => expect(screen.queryByRole("listbox")).toBeNull());
    await waitFor(() => expect(trigger.textContent).toContain("one"));

    await userEvent.click(screen.getByRole("button", { name: "Submit" }));
    await waitFor(() => expect(screen.getByText("sent")).toBeTruthy());
    await sleep(100);
    expect(trigger.textContent).toContain("Pick");
    expect(trigger.closest("[data-invalid]")).toBeNull();
  },
);

const longText = "0x7fbd8b2a1c9e4d3f6a5b0c8e2d1f4a7b9c3e6d5f long token name";
const circle = (
  <svg className="size-4" viewBox="0 0 16 16">
    <circle cx="8" cy="8" r="8" />
  </svg>
);

test("an icon passed as an element keeps its size beside long text", async () => {
  render(
    <DropdownSelect
      aria-label="Token"
      items={[{ id: 1, text: longText, icon: circle }]}
      defaultSelectedKey={1}
      callback={() => {}}
    />,
  );
  const trigger = screen.getByRole("button", { name: /Token/ });
  expect(trigger.querySelector("svg")!.getBoundingClientRect().width).toBe(16);

  await userEvent.click(trigger);
  const option = await screen.findByRole("option");
  expect(option.querySelector("svg")!.getBoundingClientRect().width).toBe(16);
  await userEvent.keyboard("{Escape}");
  cleanup();
});

test("the simple button's arrow keeps its size beside long text", () => {
  render(
    <div style={{ width: 160 }}>
      <DropdownSelect
        simpleButton
        aria-label="Sort"
        items={[{ id: 1, text: "A long option label that wraps in a column" }]}
        defaultSelectedKey={1}
        callback={() => {}}
      />
    </div>,
  );
  const trigger = screen.getByRole("button", { name: /Sort/ });

  expect(trigger.querySelector("svg")!.getBoundingClientRect().width).toBe(16);
  cleanup();
});

// curate-v2's chain field passes defaultValue and writes its form value only
// from callback. react-aria 1.7.1 ignored defaultValue, so the field showed its
// placeholder until a pick; honouring it would show an item that picking again
// can't report, since react-aria calls nothing when the selection is unchanged.
test("a single selection ignores defaultValue, so picking any item reports it", async () => {
  const picked: unknown[] = [];
  render(
    <DropdownSelect
      aria-label="Chain"
      placeholder="Select"
      items={items}
      defaultValue={1}
      callback={(item) => picked.push(item.id)}
    />,
  );
  const trigger = screen.getByRole("button", { name: /Chain/ });
  expect(trigger.textContent).toContain("Select");

  await userEvent.click(trigger);
  await userEvent.click(await screen.findByRole("option", { name: "one" }));
  expect(picked).toEqual([1]);
  cleanup();
});

test("a multiple selection passes callback the items in the order they were picked", async () => {
  const picked: unknown[][] = [];
  render(
    <DropdownSelect
      aria-label="Chains"
      selectionMode="multiple"
      items={[...items, { id: 3, text: "three" }]}
      callback={(selected) => picked.push(selected.map((item) => item.id))}
    />,
  );
  await userEvent.click(screen.getByRole("button", { name: /Chains/ }));
  for (const name of ["three", "one", "two"])
    await userEvent.click(await screen.findByRole("option", { name }));

  expect(picked).toEqual([[3], [3, 1], [3, 1, 2]]);
  await userEvent.keyboard("{Escape}");
  cleanup();
});

// Selected rows look alike, so only an outline tells which one has keyboard
// focus. A single selection has one selected row and keeps its look.
test.each([
  ["multiple", "solid"],
  ["single", "none"],
])(
  "a keyboard-focused selected option in a %s selection has outline %s",
  async (selectionMode, outline) => {
    render(
      selectionMode === "multiple" ? (
        <DropdownSelect
          aria-label="Chains"
          selectionMode="multiple"
          defaultValue={[1, 2]}
          items={items}
          callback={() => {}}
        />
      ) : (
        <DropdownSelect
          aria-label="Chains"
          defaultSelectedKey={1}
          items={items}
          callback={() => {}}
        />
      ),
    );
    screen.getByRole("button", { name: /Chains/ }).focus();
    await userEvent.keyboard("{ArrowDown}");
    const focused = await screen.findByRole("option", { name: "one" });
    await waitFor(() => expect(focused).toHaveFocus());
    const other = screen.getByRole("option", { name: "two" });

    expect(getComputedStyle(focused).outlineStyle).toBe(outline);
    expect(getComputedStyle(other).outlineStyle).toBe("none");
    await userEvent.keyboard("{Escape}");
    cleanup();
  },
);

test("a multiple selection starts from defaultValue", () => {
  render(
    <DropdownSelect
      aria-label="Chains"
      selectionMode="multiple"
      items={items}
      defaultValue={[2]}
      callback={() => {}}
    />,
  );
  expect(screen.getByRole("button", { name: /Chains/ }).textContent).toContain(
    "two",
  );
  cleanup();
});
