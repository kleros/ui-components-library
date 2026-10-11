import React from "react";
import { render, screen } from "@testing-library/react";
import { expect, test, vi } from "vitest";
import { userEvent } from "@vitest/browser/context";

import FileUploader from "../lib/form/file-uploader";

// Goes through Playwright's setInputFiles; the OS file dialog and OS-level
// file drags cannot be driven from the page.
test("selecting a file reports it and shows its name", async () => {
  const callback = vi.fn();
  const { container } = render(<FileUploader callback={callback} />);
  const input = container.querySelector<HTMLInputElement>('input[type="file"]');

  await userEvent.upload(
    input!,
    new File(["png"], "picture.png", { type: "image/png" }),
  );

  await expect.poll(() => callback.mock.calls.length).toBe(1);
  expect(callback).toHaveBeenLastCalledWith(
    expect.objectContaining({ name: "picture.png", type: "image/png" }),
  );
  await expect
    .poll(() => screen.queryByRole("button", { name: "picture.png" }))
    .not.toBeNull();
});
