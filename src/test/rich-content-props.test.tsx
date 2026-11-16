import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

// The unit project does not transform SVG imports.
vi.mock("../assets/svgs/kleros.svg", () => ({ default: () => null }));
vi.mock("../assets/svgs/arrows/field-arrow-up.svg", () => ({
  default: () => null,
}));
vi.mock("../assets/svgs/arrows/field-arrow-down.svg", () => ({
  default: () => null,
}));
vi.mock("../assets/svgs/status-icons/error.svg", () => ({
  default: () => null,
}));
vi.mock("../assets/svgs/status-icons/info.svg", () => ({
  default: () => null,
}));
vi.mock("../assets/svgs/status-icons/success.svg", () => ({
  default: () => null,
}));
vi.mock("../assets/svgs/status-icons/warning.svg", () => ({
  default: () => null,
}));

import Button from "../lib/button";
import Tag from "../lib/tag";
import TextField from "../lib/form/text-field";
import TextArea from "../lib/form/text-area";
import NumberField from "../lib/form/number-field";
import { hasContent } from "../utils/has-content";

// `cond && <X />` gives false when cond is false: the rich-content props then fall back to the plain ones,
// as React renders nothing for false, null, undefined, "" or an empty array.
describe("rich-content props that render nothing", () => {
  it.each([false, null, undefined])(
    "Button keeps its text label with children %s",
    (empty) => {
      render(<Button text="Save">{empty as never}</Button>);
      expect(screen.getByRole("button", { name: "Save" }).textContent).toBe(
        "Save",
      );
    },
  );

  it.each([false, null, undefined])(
    "Tag keeps its text label with children %s",
    (empty) => {
      render(<Tag text="Open">{empty as never}</Tag>);
      expect(screen.getByRole("button", { name: "Open" }).textContent).toBe(
        "Open",
      );
    },
  );

  it.each([
    ["TextField", TextField],
    ["TextArea", TextArea],
    ["NumberField", NumberField],
  ])(
    "%s keeps message and label with description and labelContent false",
    (_, Field) => {
      const F = Field as React.ComponentType<Record<string, unknown>>;
      render(
        <F
          label="Amount"
          labelContent={false}
          message="Help text"
          description={false}
        />,
      );
      expect(screen.getByText("Help text")).toBeTruthy();
      expect(screen.getByText("Amount")).toBeTruthy();
    },
  );

  it("Button and Tag still show rich children", () => {
    render(
      <>
        <Button text="Close">
          <b>X</b>
        </Button>
        <Tag text="Filter">
          <b>F</b>
        </Tag>
      </>,
    );
    expect(screen.getByRole("button", { name: "Close" }).textContent).toBe("X");
    expect(screen.getByRole("button", { name: "Filter" }).textContent).toBe(
      "F",
    );
  });
});

const fields = [
  ["TextField", TextField],
  ["TextArea", TextArea],
  ["NumberField", NumberField],
] as const;
const asField = (Field: unknown) =>
  Field as React.ComponentType<Record<string, unknown>>;

describe("rich-content props that are empty, an array or 0", () => {
  it.each([
    ["undefined", undefined],
    ["null", null],
    ['""', ""],
    ["true", true],
    ["false", false],
    ["[]", []],
    ['[null, false, ""]', [null, false, ""]],
    ["[[]]", [[]]],
  ])("hasContent(%s) is false", (_, node) => {
    expect(hasContent(node)).toBe(false);
  });

  it.each([
    ["0", 0],
    ['"x"', "x"],
    ['["", "x"]', ["", "x"]],
    ["[0]", [0]],
    ["<b />", <b key="b">B</b>],
    ["a render function", () => null],
  ])("hasContent(%s) is true", (_, node) => {
    expect(hasContent(node)).toBe(true);
  });

  describe.each(fields)("%s", (_, Field) => {
    const F = asField(Field);

    it.each([
      ['""', ""],
      ["null", null],
      ["[]", []],
      ["[false, null]", [false, null]],
    ])("keeps the error message with description %s", (_, description) => {
      render(
        <F
          label="Amount"
          variant="error"
          message="Too high"
          description={description}
        />,
      );
      expect(screen.getByText("Too high")).toBeTruthy();
    });

    it.each([
      ['""', ""],
      ["[]", []],
    ])(
      "keeps the label and the input's name with labelContent %s",
      (_, labelContent) => {
        const { container } = render(
          <F label="Amount" labelContent={labelContent} />,
        );
        const label = screen.getByText("Amount");
        expect(label.tagName).toBe("LABEL");
        // NumberField's stepper buttons are named by the label too
        const input = container.querySelector("input, textarea");
        expect(input).not.toBeNull();
        expect(screen.getAllByLabelText("Amount")).toContain(input);
      },
    );

    // Pinned as intended: 0 is content and renders as "0", as React does. Callers write `cond ? x : undefined`.
    it("renders description={0} as 0 instead of the message", () => {
      render(<F label="Amount" message="Help text" description={0} />);
      expect(screen.getByText("0")).toBeTruthy();
      expect(screen.queryByText("Help text")).toBeNull();
    });
  });

  it.each([
    ["Button", Button],
    ["Tag", Tag],
  ])("%s keeps its text label with children []", (_, Component) => {
    const C = Component as React.ComponentType<Record<string, unknown>>;
    render(<C text="Save">{[]}</C>);
    expect(screen.getByRole("button", { name: "Save" }).textContent).toBe(
      "Save",
    );
  });
});
