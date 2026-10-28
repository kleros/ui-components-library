import React, { useState } from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { expect, test, vi } from "vitest";
import { userEvent } from "@vitest/browser/context";

import Modal from "../lib/container/modal";
import DropdownSelect from "../lib/dropdown/select";

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

// The bundled react-aria is patched (.yarn/patches) to behave as
// react-aria-components 1.7.1 did with overlays that apps add above a Modal, such
// as a wallet modal that a button inside it opens. Unpatched, it makes them
// inert, and a dismissable Modal swallows the click that closes it.
test.each([false, true])(
  "an overlay the app opens over the modal stays usable (dismissable: %s)",
  async (isDismissable) => {
    let picked = false;
    const openWallet = () => {
      const wallet = document.createElement("div");
      wallet.style.cssText =
        "position: fixed; right: 0; bottom: 0; z-index: 100";
      const button = document.createElement("button");
      button.textContent = "Wallet";
      button.onclick = () => (picked = true);
      wallet.append(button);
      document.body.append(wallet);
    };
    const onOpenChange = vi.fn();
    render(
      <Modal isOpen isDismissable={isDismissable} onOpenChange={onOpenChange}>
        <button onClick={openWallet}>Connect</button>
      </Modal>,
    );
    await userEvent.click(
      await screen.findByRole("button", { name: "Connect" }),
    );
    const wallet = await screen.findByText("Wallet");
    expect(wallet.closest("[inert]")).toBeNull();
    expect(wallet.closest("[aria-hidden='true']")).not.toBeNull();

    await userEvent.click(wallet);
    expect(picked).toBe(true);
    // a click outside a dismissable modal also asks it to close
    expect(onOpenChange).toHaveBeenCalledTimes(isDismissable ? 1 : 0);
    wallet.parentElement!.remove();
  },
);

// The patched react-aria hides the page with aria-hidden only, so on close it
// must leave alone an inert the app set itself, such as on its root while its
// own drawer is open. react-aria-components 1.7.1 never touched inert.
test.each(["Modal", "DropdownSelect"])(
  "closing a %s keeps an inert the app set on the page",
  async (overlay) => {
    const appRoot = document.createElement("div");
    appRoot.textContent = "app";
    document.body.prepend(appRoot);
    appRoot.inert = true;
    function Drawer() {
      const [isOpen, setOpen] = useState(false);
      return overlay === "Modal" ? (
        <>
          <button onClick={() => setOpen(true)}>Open</button>
          <Modal isOpen={isOpen} onOpenChange={setOpen}>
            <button onClick={() => setOpen(false)}>Close</button>
          </Modal>
        </>
      ) : (
        <DropdownSelect
          aria-label="Open"
          items={[{ id: 1, text: "one" }]}
          callback={() => {}}
        />
      );
    }
    render(<Drawer />);

    await userEvent.click(screen.getByRole("button", { name: /Open/ }));
    const role = overlay === "Modal" ? "dialog" : "listbox";
    await screen.findByRole(role);
    expect(appRoot.getAttribute("aria-hidden")).toBe("true");
    if (overlay === "Modal")
      await userEvent.click(screen.getByRole("button", { name: "Close" }));
    else await userEvent.keyboard("{Escape}");
    await waitFor(() => expect(screen.queryByRole(role)).toBeNull());

    expect(appRoot.hasAttribute("aria-hidden")).toBe(false);
    expect(appRoot.inert).toBe(true);
    appRoot.remove();
  },
);
