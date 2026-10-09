import React from "react";
import { render, screen } from "@testing-library/react";
import { expect, test } from "vitest";
import { userEvent } from "@vitest/browser/context";

import Modal from "../lib/container/modal";

const focused = () => document.activeElement?.textContent;

test("Tab and Shift+Tab keep focus inside the open modal", async () => {
  render(
    <>
      <button>Outside</button>
      <Modal isOpen>
        <button>First</button>
        <button>Second</button>
      </Modal>
    </>,
  );
  const dialog = await screen.findByRole("dialog");
  await expect.poll(() => document.activeElement).toBe(dialog);

  await userEvent.keyboard("{Tab}");
  expect(focused()).toBe("First");
  await userEvent.keyboard("{Tab}");
  expect(focused()).toBe("Second");
  await userEvent.keyboard("{Tab}");
  expect(focused()).toBe("First");
  await userEvent.keyboard("{Shift>}{Tab}{/Shift}");
  expect(focused()).toBe("Second");
  await userEvent.keyboard("{Shift>}{Tab}{/Shift}");
  expect(focused()).toBe("First");
});
