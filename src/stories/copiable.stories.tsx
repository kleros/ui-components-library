import React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import {
  expect,
  mocked,
  spyOn,
  userEvent,
  waitFor,
  within,
} from "@storybook/test";

import {
  IPreviewArgs,
  hoverForTooltip,
  hoverToReveal,
  waitForAnimations,
  waitForTooltipHidden,
} from "./utils";

import CopiableComponent from "../lib/copiable";
import { a11yExceptions } from "./a11y";
import {
  TOOLTIP_TRIGGER_NESTED,
  TOOLTIP_TRIGGER_UNNAMED,
} from "./a11y-defects";

const meta = {
  component: CopiableComponent,
  title: "Copiable",
  tags: ["autodocs"],
  parameters: a11yExceptions(
    {
      rule: "button-name",
      selector: 'div[role="button"] > button',
      reason:
        "Library defect: the copy button is icon-only and has no accessible name.",
      source: "src/lib/copiable/index.tsx:66",
    },
    TOOLTIP_TRIGGER_NESTED,
    TOOLTIP_TRIGGER_UNNAMED,
  ),
  // The clipboard API needs a user permission in headless browsers, so it is
  // stubbed for every story and restored afterwards.
  beforeEach: () => {
    const writeText = spyOn(navigator.clipboard, "writeText").mockResolvedValue(
      undefined,
    );
    return () => writeText.mockRestore();
  },
  argTypes: {
    iconPlacement: {
      options: ["left", "right"],
      control: "radio",
    },
  },
} satisfies Meta<typeof CopiableComponent>;

export default meta;

type Story = StoryObj<typeof meta> & IPreviewArgs;

/** The real copy button (the inner one, wrapped by the tooltip trigger). */
const getCopyButton = (canvasElement: HTMLElement) =>
  canvasElement.querySelector("button") as HTMLButtonElement;

/** The Copiable root, which positions the icon left or right of the content. */
const getWrapper = (button: HTMLElement) => button.closest(".inline-flex");

export const Copiable: Story = {
  args: {
    themeUI: "light",
    backgroundUI: "light",
    iconPlacement: "right",
    copiableContent: "I can be copied!",
    children: (
      <span className="text-klerosUIComponentsPrimaryText">
        I can be copied!
      </span>
    ),
    info: "Copy this text.",
  },
  play: async ({ canvasElement, step }) => {
    const body = within(document.body);
    const button = getCopyButton(canvasElement);
    await expect(getWrapper(button)).toHaveClass("flex-row");
    await expect(button.querySelector(".copy-icon")).toBeInTheDocument();

    await step("hovering shows the info tooltip", async () => {
      const tooltip = await hoverForTooltip(userEvent, button);
      await expect(tooltip).toHaveTextContent("Copy this text.");
    });

    await step("clicking copies the content to the clipboard", async () => {
      await userEvent.click(button);
      await expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
        "I can be copied!",
      );
      await waitFor(() =>
        expect(button.querySelector(".copied-icon")).toBeInTheDocument(),
      );
      // pressing closes the tooltip; leaving and hovering again shows the
      // new text
      await userEvent.unhover(button);
      await expect(
        await hoverToReveal(userEvent, button, () => body.getByRole("tooltip")),
      ).toHaveTextContent("Copied!");
    });

    await step("clicking again while 'Copied!' does nothing", async () => {
      await userEvent.click(button);
      await expect(navigator.clipboard.writeText).toHaveBeenCalledTimes(1);
    });

    await step("the copied state resets after 2 seconds", async () => {
      await waitFor(
        () => expect(button.querySelector(".copy-icon")).toBeInTheDocument(),
        { timeout: 3000 },
      );
    });
    await userEvent.unhover(button);
    // let the tooltip finish fading out before the axe check runs
    await waitForTooltipHidden();
  },
};

export const LeftAlignedCopiable: Story = {
  args: {
    themeUI: "light",
    backgroundUI: "light",
    iconPlacement: "left",
    copiableContent: "I can be copied!",
    children: (
      <span className="text-klerosUIComponentsPrimaryText">
        I can be copied!
      </span>
    ),
    info: "Copy this text",
  },
  play: async ({ canvasElement }) => {
    const button = getCopyButton(canvasElement);
    await expect(getWrapper(button)).toHaveClass("flex-row-reverse");
    // keyboard: focus the copy button and press Enter
    button.focus();
    await userEvent.keyboard("{Enter}");
    await expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
      "I can be copied!",
    );
    await waitFor(() =>
      expect(button.querySelector(".copied-icon")).toBeInTheDocument(),
    );
    await waitFor(
      () => expect(button.querySelector(".copy-icon")).toBeInTheDocument(),
      { timeout: 3000 },
    );
    // keyboard focus keeps the tooltip open: let its fade-in finish so the
    // axe check sees the final, opaque tooltip
    await waitForAnimations(document.body);
  },
};

/** Without `info`, the tooltip falls back to "Copy". */
export const DefaultInfo: Story = {
  args: {
    themeUI: "light",
    backgroundUI: "light",
    copiableContent: "0xdeadbeef",
    children: (
      <span className="text-klerosUIComponentsPrimaryText">0xdead…beef</span>
    ),
  },
  play: async ({ canvasElement }) => {
    const button = getCopyButton(canvasElement);
    await expect(await hoverForTooltip(userEvent, button)).toHaveTextContent(
      /^Copy$/,
    );
    await userEvent.click(button);
    await expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
      "0xdeadbeef",
    );
    await waitFor(() =>
      expect(button.querySelector(".copied-icon")).toBeInTheDocument(),
    );
    await waitFor(
      () => expect(button.querySelector(".copy-icon")).toBeInTheDocument(),
      { timeout: 3000 },
    );
    await userEvent.unhover(button);
    // let the tooltip finish fading out before the axe check runs
    await waitForTooltipHidden();
  },
};

/** A rejected clipboard write shows no success state; a retry then copies. */
export const RejectedWriteRetry: Story = {
  args: {
    themeUI: "light",
    backgroundUI: "light",
    copiableContent: "retry me",
    children: (
      <span className="text-klerosUIComponentsPrimaryText">retry me</span>
    ),
    info: "Copy this text.",
  },
  beforeEach: () => {
    mocked(navigator.clipboard.writeText).mockRejectedValueOnce(
      new DOMException("denied", "NotAllowedError"),
    );
  },
  play: async ({ canvasElement, step }) => {
    const button = getCopyButton(canvasElement);
    const writeText = mocked(navigator.clipboard.writeText);

    await step("a rejected write keeps the normal icon", async () => {
      await userEvent.click(button);
      // Each direct userEvent call has its own pointer state, so leaving the
      // button must be explicit or the next hover is ignored as a re-enter.
      await userEvent.unhover(button);
      await waitFor(() => expect(writeText).toHaveBeenCalledTimes(1));
      // the rejection handler runs on a microtask after the call
      await new Promise((resolve) => setTimeout(resolve, 100));
      await expect(
        button.querySelector(".copied-icon"),
      ).not.toBeInTheDocument();
      await expect(button.querySelector(".copy-icon")).toBeInTheDocument();
      await expect(await hoverForTooltip(userEvent, button)).toHaveTextContent(
        "Copy this text.",
      );
      await userEvent.unhover(button);
    });

    await step("a retry copies the payload and shows success", async () => {
      await userEvent.click(button);
      await waitFor(() => expect(writeText).toHaveBeenCalledTimes(2));
      await expect(writeText).toHaveBeenNthCalledWith(2, "retry me");
      await waitFor(() =>
        expect(button.querySelector(".copied-icon")).toBeInTheDocument(),
      );
    });

    await step("the copied state resets after 2 seconds", async () => {
      await waitFor(
        () => expect(button.querySelector(".copy-icon")).toBeInTheDocument(),
        { timeout: 3000 },
      );
    });
    await userEvent.unhover(button);
    // let the tooltip finish fading out before the axe check runs
    await waitForTooltipHidden();
  },
};
