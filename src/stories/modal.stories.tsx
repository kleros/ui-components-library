import type { Meta, StoryObj } from "@storybook/react";
import { expect, fn, userEvent, waitFor, within } from "@storybook/test";
import React, { useState } from "react";
import { IPreviewArgs, waitForAnimations } from "./utils";

import ModalComponent from "../lib/container/modal";
import { Button } from "../lib";
import { a11yExceptions, auditA11y } from "./a11y";
import { WHITE_ON_BLUE_LIGHT } from "./a11y-defects";

const meta = {
  component: ModalComponent,
  title: "Containers/Modal",
  parameters: a11yExceptions(WHITE_ON_BLUE_LIGHT),
  tags: ["autodocs"],
  args: {
    onOpenChange: fn(),
  },
  argTypes: {
    isOpen: {
      control: "boolean",
    },
    isDismissable: {
      control: "boolean",
    },
  },
} satisfies Meta<typeof ModalComponent>;

export default meta;

type Story = StoryObj<typeof meta> & IPreviewArgs;

const body = within(document.body);

const waitForClose = () =>
  waitFor(() => expect(body.queryByRole("dialog")).not.toBeInTheDocument());

export const Modal: Story = {
  args: {
    themeUI: "dark",
    backgroundUI: "light",
    className: "w-[500px]",
    isDismissable: true,
  },
  render: function Render(args) {
    const [isOpen, setOpen] = useState(false);
    return (
      <div>
        <Button text="Press me!" onPress={() => setOpen(true)} />
        <ModalComponent
          {...args}
          isOpen={isOpen}
          onOpenChange={(open) => {
            setOpen(open);
            args.onOpenChange?.(open);
          }}
        >
          <div className="flex size-full items-center justify-center">
            <p className="text-klerosUIComponentsPrimaryText font-semibold">
              I am a Modal.
            </p>
          </div>
        </ModalComponent>
      </div>
    );
  },
  play: async ({ canvasElement, args, step, ...context }) => {
    const trigger = within(canvasElement).getByRole("button", {
      name: "Press me!",
    });
    await expect(body.queryByRole("dialog")).not.toBeInTheDocument();
    await auditA11y(context, "resting");

    await step("opens in a portal and traps focus", async () => {
      await userEvent.click(trigger);
      const dialog = await body.findByRole("dialog", { name: "Modal" });
      await waitFor(() =>
        expect(within(dialog).getByText("I am a Modal.")).toBeVisible(),
      );
      await waitFor(() => expect(dialog).toHaveFocus());
      // the rest of the page is hidden from assistive technology
      await expect(trigger.closest("[aria-hidden='true']")).not.toBeNull();
      await auditA11y(context, "open");
    });

    await step("Escape closes the modal", async () => {
      await userEvent.keyboard("{Escape}");
      await waitForClose();
      await expect(args.onOpenChange).toHaveBeenLastCalledWith(false);
    });

    await step("clicking outside closes a dismissable modal", async () => {
      await userEvent.click(trigger);
      await body.findByRole("dialog");
      await userEvent.click(document.body);
      await waitForClose();
      await expect(args.onOpenChange).toHaveBeenCalledTimes(2);
      // focus is restored to the trigger
      await expect(trigger).toHaveFocus();
    });
  },
};

/** Non dismissable modals ignore outside clicks but still close with Escape. */
export const NonDismissable: Story = {
  ...Modal,
  args: {
    ...Modal.args,
    isDismissable: false,
    ariaLabel: "Confirmation",
  },
  play: async ({ canvasElement, args }) => {
    await userEvent.click(
      within(canvasElement).getByRole("button", { name: "Press me!" }),
    );
    const dialog = await body.findByRole("dialog", { name: "Confirmation" });
    await userEvent.click(document.body);
    await expect(dialog).toBeInTheDocument();
    await expect(args.onOpenChange).not.toHaveBeenCalled();
    dialog.focus();
    await userEvent.keyboard("{Escape}");
    await waitForClose();
    await expect(args.onOpenChange).toHaveBeenCalledWith(false);
  },
};

/** Tab and Shift+Tab wrap inside the dialog instead of reaching the page behind it. */
export const FocusContainment: Story = {
  args: {
    ...Modal.args,
    isOpen: true,
    ariaLabel: "Containment",
    children: (
      <div className="flex size-full items-center justify-center gap-4">
        <Button text="First" />
        <Button text="Last" />
      </div>
    ),
  },
  render: (args) => (
    <div>
      <Button text="Outside" />
      <ModalComponent {...args} />
    </div>
  ),
  play: async () => {
    const dialog = await body.findByRole("dialog", { name: "Containment" });
    await waitForAnimations(document.body);
    const first = within(dialog).getByRole("button", { name: "First" });
    const last = within(dialog).getByRole("button", { name: "Last" });

    first.focus();
    await userEvent.tab({ shift: true });
    await expect(dialog).toContainElement(
      document.activeElement as HTMLElement,
    );
    await expect(last).toHaveFocus();

    await userEvent.tab();
    await expect(dialog).toContainElement(
      document.activeElement as HTMLElement,
    );
    await expect(first).toHaveFocus();
  },
};

/** A modal left open, so its (portaled) content is covered by the a11y check. */
export const OpenModal: Story = {
  args: {
    ...Modal.args,
    isOpen: true,
    ariaLabel: "Open modal",
    children: (
      <div className="flex size-full items-center justify-center">
        <p className="text-klerosUIComponentsPrimaryText font-semibold">
          I am an open Modal.
        </p>
      </div>
    ),
  },
  render: (args) => <ModalComponent {...args} />,
  play: async ({ args }) => {
    const dialog = await body.findByRole("dialog", { name: "Open modal" });
    await waitForAnimations(document.body);
    await expect(within(dialog).getByText("I am an open Modal.")).toBeVisible();
    await waitFor(() => expect(dialog).toHaveFocus());
    await expect(args.onOpenChange).not.toHaveBeenCalled();
  },
};
