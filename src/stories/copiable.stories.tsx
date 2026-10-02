import type { Meta, StoryObj } from "@storybook/react";
import { expect, spyOn, userEvent, waitFor, within } from "@storybook/test";

import { IPreviewArgs, disableA11yRules, mouseHover } from "./utils";

import CopiableComponent from "../lib/copiable";

const meta = {
  component: CopiableComponent,
  title: "Copiable",
  tags: ["autodocs"],
  // Pre-existing component issues: the copy button is icon-only without an
  // accessible name, and it is wrapped by the Tooltip trigger, which renders a
  // focusable `role="button"` div around it (nested interactive controls).
  parameters: disableA11yRules(
    "button-name",
    "nested-interactive",
    "aria-command-name",
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
    children: "I can be copied!",
    info: "Copy this text.",
  },
  play: async ({ canvasElement, step }) => {
    const body = within(document.body);
    const button = getCopyButton(canvasElement);
    await expect(getWrapper(button)).toHaveClass("flex-row");
    await expect(button.querySelector(".copy-icon")).toBeInTheDocument();

    await step("hovering shows the info tooltip", async () => {
      await mouseHover(userEvent, button);
      const tooltip = await body.findByRole("tooltip");
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
      // pressing closes the tooltip; hovering again shows the new text
      await userEvent.unhover(button);
      await userEvent.hover(button);
      await expect(await body.findByRole("tooltip")).toHaveTextContent(
        "Copied!",
      );
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
  },
};

export const LeftAlignedCopiable: Story = {
  args: {
    themeUI: "light",
    backgroundUI: "light",
    iconPlacement: "left",
    copiableContent: "I can be copied!",
    children: "I can be copied!",
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
  },
};

/** Without `info`, the tooltip falls back to "Copy". */
export const DefaultInfo: Story = {
  args: {
    themeUI: "light",
    backgroundUI: "light",
    copiableContent: "0xdeadbeef",
    children: "0xdead…beef",
  },
  play: async ({ canvasElement }) => {
    const button = getCopyButton(canvasElement);
    await mouseHover(userEvent, button);
    await expect(
      await within(document.body).findByRole("tooltip"),
    ).toHaveTextContent(/^Copy$/);
    await userEvent.click(button);
    await expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
      "0xdeadbeef",
    );
    await userEvent.unhover(button);
  },
};
