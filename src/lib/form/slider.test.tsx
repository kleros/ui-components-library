import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { expect, it, vi } from "vitest";

import Slider from "./slider";

const money = (value: number) => `${value} $M`;

const renderPair = () =>
  render(
    <>
      <Slider
        aria-label="A"
        value={400}
        minValue={0}
        maxValue={1000}
        leftLabel="0"
        rightLabel="1000"
        formatter={money}
        callback={() => {}}
      />
      <Slider
        aria-label="B"
        value={200}
        minValue={0}
        maxValue={1000}
        leftLabel="0"
        rightLabel="1000"
        formatter={money}
        callback={() => {}}
      />
    </>,
  );

it("names each slider's input after its own aria-label", () => {
  renderPair();

  const [a, b] = screen.getAllByRole("slider");
  expect(screen.getByRole("slider", { name: "A" })).toBe(a);
  expect(screen.getByRole("slider", { name: "B" })).toBe(b);
  // the value label, the captions and the other slider's parts stay out of it
  const [groupA, groupB] = screen.getAllByRole("group");
  expect(a.getAttribute("aria-labelledby")).toBe(groupA.id);
  expect(b.getAttribute("aria-labelledby")).toBe(groupB.id);
  expect(document.querySelectorAll("label[for]")).toHaveLength(0);
  // the captions read as their own text
  document
    .querySelectorAll(
      '[data-slot="slider-left-label"], [data-slot="slider-right-label"]',
    )
    .forEach((caption) => {
      expect(caption.hasAttribute("aria-label")).toBe(false);
      expect(caption.hasAttribute("aria-hidden")).toBe(false);
    });
});

it("names the input after the elements in aria-labelledby", () => {
  render(
    <>
      <h2 id="deposit-heading">Item deposit</h2>
      <Slider
        aria-labelledby="deposit-heading"
        defaultValue={40}
        leftLabel="0"
        rightLabel="100"
        formatter={(value) => `${value}%`}
        callback={() => {}}
      />
    </>,
  );

  expect(screen.getByRole("slider", { name: "Item deposit" })).toBeTruthy();
  expect(screen.getByRole("group", { name: "Item deposit" })).toBeTruthy();
});

it("names the input like its group when it has aria-label and aria-labelledby", () => {
  render(
    <>
      <h2 id="deposit-heading">Item deposit</h2>
      <Slider
        aria-label="Amount"
        aria-labelledby="deposit-heading"
        defaultValue={40}
        leftLabel="0"
        rightLabel="100"
        callback={() => {}}
      />
      <Slider
        aria-label="Fee"
        aria-labelledby="missing-heading"
        defaultValue={40}
        leftLabel="0"
        rightLabel="100"
        callback={() => {}}
      />
    </>,
  );

  expect(
    screen.getByRole("group", { name: "Amount Item deposit" }),
  ).toBeTruthy();
  expect(
    screen.getByRole("slider", { name: "Amount Item deposit" }),
  ).toBeTruthy();
  // an id that matches no element leaves the aria-label
  expect(screen.getByRole("group", { name: "Fee" })).toBeTruthy();
  expect(screen.getByRole("slider", { name: "Fee" })).toBeTruthy();
});

it("announces the formatted value", () => {
  const callback = vi.fn();
  render(
    <Slider
      aria-label="Deposit"
      defaultValue={400}
      minValue={0}
      maxValue={1000}
      leftLabel="0"
      rightLabel="1000"
      formatter={money}
      callback={callback}
    />,
  );

  const input = screen.getByRole("slider");
  expect(input.getAttribute("aria-valuetext")).toBe("400 $M");
  fireEvent.change(input, { target: { value: "401" } });
  expect(callback).toHaveBeenLastCalledWith(401);
  expect(input.getAttribute("aria-valuetext")).toBe("401 $M");
  // the value label shows the same text, hidden from screen readers
  const valueLabel = document.querySelector('[data-slot="slider-label"]');
  expect(valueLabel?.textContent).toBe("401 $M");
  expect(valueLabel?.getAttribute("aria-hidden")).toBe("true");
});

it("keeps the announced value in step with the value label", () => {
  const props = {
    "aria-label": "Deposit",
    minValue: 0,
    maxValue: 2000,
    leftLabel: "0",
    rightLabel: "2000",
    callback: () => {},
  };
  const { rerender } = render(
    <Slider {...props} value={1500} formatter={money} />,
  );
  const input = screen.getByRole("slider");
  const valueLabel = () =>
    document.querySelector('[data-slot="slider-label"]')?.textContent;
  expect(input.getAttribute("aria-valuetext")).toBe("1500 $M");

  // a new formatter for the same value
  rerender(
    <Slider {...props} value={1500} formatter={(value) => `${value} units`} />,
  );
  expect(valueLabel()).toBe("1500 units");
  expect(input.getAttribute("aria-valuetext")).toBe("1500 units");

  // without a formatter, react-aria's number
  rerender(<Slider {...props} value={1500} />);
  expect(valueLabel()).toBe("1,500");
  expect(input.getAttribute("aria-valuetext")).toBe("1,500");

  // a new value with the same text
  const level = (value: number) => (value < 1000 ? "low" : "high");
  rerender(<Slider {...props} value={1500} formatter={level} />);
  expect(input.getAttribute("aria-valuetext")).toBe("high");
  rerender(<Slider {...props} value={1600} formatter={level} />);
  expect(input.getAttribute("aria-valuetext")).toBe("high");
  rerender(<Slider {...props} value={250} formatter={level} />);
  expect(input.getAttribute("aria-valuetext")).toBe("low");
});

it("announces react-aria's number when the formatter gives no text", () => {
  render(
    <Slider
      aria-label="Deposit"
      defaultValue={1500}
      maxValue={2000}
      leftLabel="0"
      rightLabel="2000"
      formatter={() => ""}
      callback={() => {}}
    />,
  );

  expect(
    document.querySelector('[data-slot="slider-label"]')?.textContent,
  ).toBe("");
  expect(screen.getByRole("slider").getAttribute("aria-valuetext")).toBe(
    "1,500",
  );
});

it("keeps the parts' ids and adds data-slot hooks", () => {
  renderPair();

  for (const slot of [
    "slider-track",
    "slider-fill",
    "slider-label",
    "slider-left-label",
    "slider-right-label",
  ]) {
    const parts = document.querySelectorAll(`[data-slot="${slot}"]`);
    expect(parts).toHaveLength(2);
    parts.forEach((part) => expect(part.id).toBe(slot));
  }
  expect(document.querySelectorAll('[data-slot="slider-thumb"]')).toHaveLength(
    2,
  );
  screen
    .getAllByRole("slider")
    .forEach((input) =>
      expect(input.closest('[data-slot="slider-thumb"]')).not.toBeNull(),
    );
});
