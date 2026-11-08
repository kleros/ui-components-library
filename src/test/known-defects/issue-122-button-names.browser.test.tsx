import React from "react";
import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { userEvent } from "@vitest/browser/context";
import axe from "axe-core";

import Button from "../../lib/button";
import DraggableList from "../../lib/draggable-list";
import FileUploader from "../../lib/form/file-uploader";
import Push from "../../lib/messages/push";
import CompactPagination from "../../lib/pagination/compact";
import StandardPagination from "../../lib/pagination/standard";

/**
 * Every button the library renders must have an accessible name, in every
 * state (WCAG 4.1.2). These buttons used to hold only an SVG.
 *
 * See https://github.com/kleros/ui-components-library/issues/122.
 */

const noop = () => {};

/** The targets axe's `button-name` rule reports under `root`. */
const unnamedButtons = async (root: HTMLElement) => {
  const { violations } = await axe.run(root, { runOnly: ["button-name"] });
  return violations.flatMap(({ nodes }) =>
    nodes.map(({ target }) => target.join(" ")),
  );
};

const cases = [
  {
    name: "StandardPagination",
    element: (
      <StandardPagination currentPage={2} numPages={5} callback={noop} />
    ),
    names: ["Previous page", "Next page"],
  },
  {
    name: "CompactPagination",
    element: <CompactPagination currentPage={1} numPages={3} callback={noop} />,
    names: ["Previous page", "Next page"],
  },
  {
    name: "CompactPagination on its last page, with a close button",
    element: (
      <CompactPagination
        currentPage={3}
        numPages={3}
        callback={noop}
        onCloseOnLastPage={noop}
      />
    ),
    names: ["Previous page", "Close"],
  },
  {
    name: "PushMessage",
    element: (
      <Push variant="sync" title="Transaction" msg="Pending" callback={noop} />
    ),
    names: ["Close"],
  },
  {
    name: "FileUploader with no file selected",
    element: <FileUploader callback={noop} />,
    names: ["Choose a file"],
  },
  {
    name: "Button while loading",
    element: <Button text="Save" isLoading isDisabled />,
    names: ["Save"],
  },
];

describe.each(cases)("$name", ({ element, names }) => {
  it("names every button", async () => {
    const { container } = render(element);

    for (const name of names) screen.getByRole("button", { name });
    expect(await unnamedButtons(container)).toEqual([]);
  });
});

describe("Button while loading", () => {
  it("keeps its label in the accessibility tree", () => {
    render(<Button text="Save" isLoading />);

    const button = screen.getByRole("button", { name: "Save" });
    expect(within(button).getByText("Save").classList).toContain("opacity-0");
  });

  // react-aria-components 1.7.1 filters `aria-busy` out of Button (it only
  // forwards an allow-list of attributes); newer releases forward every global
  // attribute. Drop `.fails` once the dependency is bumped.
  it.fails("is marked busy", () => {
    render(<Button text="Save" isLoading />);

    expect(screen.getByRole("button").getAttribute("aria-busy")).toBe("true");
  });

  it("is not marked busy otherwise", () => {
    render(<Button text="Save" />);

    expect(screen.getByRole("button").hasAttribute("aria-busy")).toBe(false);
  });
});

describe("FileUploader with a file selected", () => {
  it("is named after the file", () => {
    const file = new File(["png"], "picture.png", { type: "image/png" });
    render(<FileUploader callback={noop} selectedFile={file} />);

    screen.getByRole("button", { name: "picture.png" });
  });
});

describe("DraggableList", () => {
  const items = [
    { id: 1, name: "Illustrator", value: "" },
    { id: 2, name: "Premiere", value: "" },
  ];

  it("names the delete button after its item", async () => {
    const { container } = render(<DraggableList items={items} />);
    const premiere = await screen.findByRole("option", { name: "Premiere" });

    await userEvent.hover(premiere);
    await expect
      .poll(() =>
        within(premiere).queryByRole("button", { name: "Remove Premiere" }),
      )
      .not.toBeNull();
    expect(await unnamedButtons(container)).toEqual([]);

    await userEvent.unhover(premiere);
  });
});
