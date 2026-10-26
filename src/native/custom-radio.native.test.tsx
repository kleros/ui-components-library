import React, { useState } from "react";
import { render, screen } from "@testing-library/react";
import { expect, test } from "vitest";
import { userEvent } from "@vitest/browser/context";

import CustomRadio, { CustomRadioItem } from "../lib/form/custom-radio";
import DropdownSelect from "../lib/dropdown/select";
import BigNumberField from "../lib/form/bignumber-field";

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Controls nested in the group, rendered while "b" is selected as the docs
// recommend, keep their arrow keys: the group must not move the selection.
function Group() {
  const [value, setValue] = useState("b");
  return (
    <CustomRadio aria-label="Mode" value={value} onChange={setValue}>
      <CustomRadioItem value="a">Option A</CustomRadioItem>
      <CustomRadioItem value="b">Option B</CustomRadioItem>
      {value === "b" && (
        <>
          <DropdownSelect
            aria-label="Token"
            items={[
              { id: 1, text: "one" },
              { id: 2, text: "two" },
            ]}
            callback={() => {}}
          />
          <BigNumberField defaultValue="5" />
          <select aria-label="Network" defaultValue="x">
            <option value="x">x</option>
            <option value="y">y</option>
          </select>
          <textarea aria-label="Note" defaultValue="ab" />
        </>
      )}
      <CustomRadioItem value="c">Option C</CustomRadioItem>
    </CustomRadio>
  );
}

// While a dropdown's list is open, the rest of the page is aria-hidden.
const selected = () =>
  (screen.getAllByRole("radio", { hidden: true }) as HTMLInputElement[]).find(
    (radio) => radio.checked,
  )?.value;

test("ArrowDown on a nested dropdown opens its list", async () => {
  render(<Group />);
  screen.getByRole("button", { name: /Token/ }).focus();
  await userEvent.keyboard("{ArrowDown}");
  expect(await screen.findByRole("listbox")).toBeTruthy();
  expect(selected()).toBe("b");
  await userEvent.keyboard("{Escape}");
  await sleep(300);
});

test("arrow keys in a nested BigNumberField step its value", async () => {
  render(<Group />);
  const field = screen.getByRole("spinbutton");
  await userEvent.click(field);
  await userEvent.keyboard("{ArrowUp}");
  expect(field).toHaveValue("6");
  await userEvent.keyboard("{ArrowRight}{ArrowLeft}");
  expect(selected()).toBe("b");
  expect(field).toHaveFocus();
});

test("arrow keys in a nested select and textarea stay there", async () => {
  render(<Group />);
  const select = screen.getByRole("combobox", { name: "Network" });
  select.focus();
  await userEvent.keyboard("{ArrowLeft}{ArrowRight}");
  expect(selected()).toBe("b");
  expect(select).toHaveFocus();

  const note = screen.getByRole("textbox", { name: "Note" });
  await userEvent.click(note);
  await userEvent.keyboard("{ArrowLeft}{ArrowDown}");
  expect(selected()).toBe("b");
  expect(note).toHaveFocus();
});

test("arrow keys on the radios still move the selection", async () => {
  render(<Group />);
  const radioB = screen.getByRole("radio", { name: "Option B" });
  radioB.focus();
  await userEvent.keyboard("{ArrowDown}");
  expect(selected()).toBe("c");
});
