import React from "react";
import { render, screen } from "@testing-library/react";
import { expect, test, vi } from "vitest";
import { userEvent } from "@vitest/browser/context";

import Checkbox from "../lib/form/checkbox";
import Switch from "../lib/form/switch";

// react-aria toggles these from presses on their label. It reads the 0×0
// pointer events of synthetic clicks (the story plays' userEvent) as screen
// reader clicks and ignores them there, so only real input covers the label.

const track = (toggle: HTMLElement) =>
  toggle.closest("label")!.querySelector<HTMLElement>("span.absolute")!;

test("a real click on the checkbox label toggles it", async () => {
  const onChange = vi.fn();
  render(<Checkbox label="Checkbox" onChange={onChange} />);
  const checkbox = screen.getByRole("checkbox", { name: "Checkbox" });

  await userEvent.click(screen.getByText("Checkbox"));
  expect(checkbox).toBeChecked();
  expect(onChange).toHaveBeenLastCalledWith(true);
  await userEvent.click(screen.getByText("Checkbox"));
  expect(checkbox).not.toBeChecked();
  expect(onChange).toHaveBeenLastCalledWith(false);
});

test("a real click on a disabled checkbox label does nothing", async () => {
  const onChange = vi.fn();
  render(<Checkbox label="Checkbox" isDisabled onChange={onChange} />);

  await userEvent.click(screen.getByText("Checkbox"), { force: true });
  expect(screen.getByRole("checkbox")).not.toBeChecked();
  expect(onChange).not.toHaveBeenCalled();
});

test("a real click on the switch track toggles it", async () => {
  const onChange = vi.fn();
  render(<Switch aria-label="Enable" onChange={onChange} />);
  const toggle = screen.getByRole("switch", { name: "Enable" });

  await userEvent.click(track(toggle));
  expect(toggle).toBeChecked();
  expect(onChange).toHaveBeenLastCalledWith(true);
  await userEvent.click(track(toggle));
  expect(toggle).not.toBeChecked();
  expect(onChange).toHaveBeenLastCalledWith(false);
});

test("a real click on a disabled switch track does nothing", async () => {
  const onChange = vi.fn();
  render(<Switch aria-label="Enable" isDisabled onChange={onChange} />);
  const toggle = screen.getByRole("switch", { name: "Enable" });

  await userEvent.click(track(toggle), { force: true });
  expect(toggle).not.toBeChecked();
  expect(onChange).not.toHaveBeenCalled();
});
