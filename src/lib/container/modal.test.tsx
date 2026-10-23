import React from "react";
import { render, screen } from "@testing-library/react";
import { expect, it, vi } from "vitest";

import Modal from "./modal";

it("keeps the overlay's open state off the nested modal", () => {
  const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
  const onOpenChange = vi.fn();
  render(
    <Modal isOpen onOpenChange={onOpenChange} isDismissable>
      <p>Content</p>
    </Modal>,
  );

  expect(screen.getByRole("dialog").textContent).toBe("Content");
  // react-aria warns on every render when a Modal inside a ModalOverlay
  // also gets isOpen or onOpenChange
  expect(warn).not.toHaveBeenCalled();
});
