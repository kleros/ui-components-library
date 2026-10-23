import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { expect, it, vi } from "vitest";

import Modal from "./modal";

it("gives the consumer's props to the overlay only", () => {
  const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
  const onOpenChange = vi.fn();
  const onClick = vi.fn();
  render(
    <Modal isOpen onOpenChange={onOpenChange} isDismissable onClick={onClick}>
      <p>Content</p>
    </Modal>,
  );

  expect(screen.getByRole("dialog").textContent).toBe("Content");
  // react-aria warns on every render when a Modal inside a ModalOverlay
  // also gets isOpen or onOpenChange
  expect(warn).not.toHaveBeenCalled();
  fireEvent.click(screen.getByText("Content"));
  expect(onClick).toHaveBeenCalledTimes(1);
});
