import type { Meta, StoryObj } from "@storybook/react";
import React from "react";
import { expect, fn, userEvent, waitFor, within } from "@storybook/test";
import { IPreviewArgs, disableA11yRules } from "./utils";

import TabsComponent from "../lib/pagination/tabs";
import Telegram from "../assets/svgs/telegram.svg";

const meta = {
  component: TabsComponent,
  title: "Pagination/Tabs",
  tags: ["autodocs"],
  // Pre-existing design issue: the disabled tab's text uses the stroke color,
  // below the WCAG AA contrast ratio.
  parameters: disableA11yRules("color-contrast"),
  args: {
    callback: fn(),
  },
  argTypes: {},
} satisfies Meta<typeof TabsComponent>;

export default meta;

type Story = StoryObj<typeof meta> & IPreviewArgs;

export const Tabs: Story = {
  args: {
    themeUI: "light",
    backgroundUI: "light",
    className: "w-[500px]",
    defaultSelectedKey: "discord",
    panelClassName: "bg-klerosUIComponentsLightBlue p-4",
    items: [
      { text: "Discord", value: 0, id: "discord", content: <p>Discord</p> },
      {
        text: "Telegram",
        value: 1,
        Icon: Telegram,
        id: "telegram",
        content: <p>Telegram</p>,
      },
      {
        text: "Disabled",
        value: 2,
        disabled: true,
        id: "disabled",
        content: <p>Disabled</p>,
      },
    ],
  },
  play: async ({ canvasElement, args, step }) => {
    const canvas = within(canvasElement);
    const tablist = canvas.getByRole("tablist");
    // Tabs are rendered after the tablist mounts (a tick later in the
    // production build Chromatic runs), so wait for the first one.
    const discord = await within(tablist).findByRole("tab", {
      name: "Discord",
    });
    const telegram = within(tablist).getByRole("tab", { name: "Telegram" });
    const disabled = within(tablist).getByRole("tab", { name: "Disabled" });

    await step("defaultSelectedKey selects the first panel", async () => {
      // the initial selection is also applied a tick after mount
      await waitFor(() =>
        expect(discord).toHaveAttribute("aria-selected", "true"),
      );
      await expect(canvas.getByRole("tabpanel")).toHaveTextContent("Discord");
      await expect(discord).toHaveClass(
        "border-b-klerosUIComponentsPrimaryBlue",
      );
      await expect(disabled).toHaveAttribute("aria-disabled", "true");
    });

    await step("clicking a tab selects it and reports its value", async () => {
      await userEvent.click(telegram);
      await expect(telegram).toHaveAttribute("aria-selected", "true");
      await expect(discord).toHaveAttribute("aria-selected", "false");
      const panel = canvas.getByRole("tabpanel");
      await expect(panel).toHaveTextContent("Telegram");
      await expect(panel).toHaveAttribute(
        "aria-labelledby",
        telegram.getAttribute("id"),
      );
      await expect(args.callback).toHaveBeenLastCalledWith("telegram", 1);
      await expect(telegram).toHaveClass(
        "border-b-klerosUIComponentsPrimaryBlue",
      );
      await expect(discord).not.toHaveClass(
        "border-b-klerosUIComponentsPrimaryBlue",
      );
    });

    await step("disabled tabs cannot be selected", async () => {
      const calls = (args.callback as ReturnType<typeof fn>).mock.calls.length;
      await userEvent.click(disabled);
      await expect(disabled).toHaveAttribute("aria-selected", "false");
      await expect(args.callback).toHaveBeenCalledTimes(calls);
      await expect(args.callback).toHaveBeenLastCalledWith("telegram", 1);
    });

    await step("arrow keys move between enabled tabs", async () => {
      telegram.focus();
      // skips the disabled tab and wraps around
      await userEvent.keyboard("{ArrowRight}");
      await expect(discord).toHaveFocus();
      await expect(discord).toHaveAttribute("aria-selected", "true");
      await expect(args.callback).toHaveBeenLastCalledWith("discord", 0);
      await userEvent.keyboard("{ArrowLeft}");
      await expect(telegram).toHaveAttribute("aria-selected", "true");
    });
  },
};
