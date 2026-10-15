import type { Meta, StoryObj } from "@storybook/react";
import React, { useState } from "react";
import { expect, fn, userEvent, waitFor, within } from "@storybook/test";
import type { Key } from "react-aria-components";
import { IPreviewArgs } from "./utils";

import TabsComponent from "../lib/pagination/tabs";
import { Button } from "../lib";
import Telegram from "../assets/svgs/telegram.svg";
import Kleros from "../assets/svgs/kleros.svg";
import { a11yExceptions } from "./a11y";
import { PRIMARY_BLUE_TEXT_LIGHT } from "./a11y-defects";

const meta = {
  component: TabsComponent,
  title: "Pagination/Tabs",
  tags: ["autodocs"],
  parameters: a11yExceptions(PRIMARY_BLUE_TEXT_LIGHT),
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

const iconItems = [
  {
    text: "Discord",
    value: 0,
    Icon: Kleros,
    id: "discord",
    content: <p>Discord</p>,
  },
  {
    text: "Telegram",
    value: 1,
    Icon: Telegram,
    id: "telegram",
    content: <p>Telegram</p>,
  },
];

/** Asserts the border, label colour and Icon fill of a tab all match `active`. */
const expectActiveStyling = async (tab: HTMLElement, active: boolean) => {
  const label = tab.querySelector("span");
  const icon = tab.querySelector("svg");
  const check = (el: Element | null, className: string) =>
    active
      ? expect(el).toHaveClass(className)
      : expect(el).not.toHaveClass(className);
  await check(tab, "border-b-klerosUIComponentsPrimaryBlue");
  await check(label, "text-klerosUIComponentsPrimaryBlue");
  await check(icon, "fill-klerosUIComponentsPrimaryBlue");
};

const findTabs = async (canvasElement: HTMLElement) => {
  const tablist = within(canvasElement).getByRole("tablist");
  const discord = await within(tablist).findByRole("tab", { name: "Discord" });
  const telegram = within(tablist).getByRole("tab", { name: "Telegram" });
  return { discord, telegram };
};

/** Uncontrolled Tabs whose defaultSelectedKey is not the first tab. */
export const NonFirstDefault: Story = {
  args: {
    themeUI: "light",
    backgroundUI: "light",
    className: "w-[500px]",
    defaultSelectedKey: "telegram",
    onSelectionChange: fn(),
    items: iconItems,
  },
  play: async ({ canvasElement, args, step }) => {
    const canvas = within(canvasElement);
    const { discord, telegram } = await findTabs(canvasElement);

    await step("the default tab is selected, shown and styled", async () => {
      await waitFor(() =>
        expect(telegram).toHaveAttribute("aria-selected", "true"),
      );
      await expect(discord).toHaveAttribute("aria-selected", "false");
      await expect(canvas.getByRole("tabpanel")).toHaveTextContent("Telegram");
      await expectActiveStyling(telegram, true);
      await expectActiveStyling(discord, false);
    });

    await step(
      "clicking a tab calls callback and the caller's onSelectionChange",
      async () => {
        await userEvent.click(discord);
        await expect(discord).toHaveAttribute("aria-selected", "true");
        await expect(canvas.getByRole("tabpanel")).toHaveTextContent("Discord");
        await expect(args.callback).toHaveBeenLastCalledWith("discord", 0);
        await expect(args.onSelectionChange).toHaveBeenLastCalledWith(
          "discord",
        );
        await expectActiveStyling(discord, true);
        await expectActiveStyling(telegram, false);
      },
    );
  },
};

/** Controlled Tabs: the parent owns selectedKey and can change it from outside. */
export const ControlledSelectedKey: Story = {
  args: {
    themeUI: "light",
    backgroundUI: "light",
    className: "w-[500px]",
    items: iconItems,
  },
  render: function Render(args) {
    const [selectedKey, setSelectedKey] = useState<Key>("discord");
    return (
      <div className="flex flex-col gap-4">
        <TabsComponent
          {...args}
          selectedKey={selectedKey}
          onSelectionChange={setSelectedKey}
        />
        <Button
          small
          variant="secondary"
          text="Show Telegram"
          onPress={() => setSelectedKey("telegram")}
        />
      </div>
    );
  },
  play: async ({ canvasElement, args, step }) => {
    const canvas = within(canvasElement);
    const { discord, telegram } = await findTabs(canvasElement);

    await step("the controlled key is selected and styled", async () => {
      await waitFor(() =>
        expect(discord).toHaveAttribute("aria-selected", "true"),
      );
      await expect(canvas.getByRole("tabpanel")).toHaveTextContent("Discord");
      await expectActiveStyling(discord, true);
      await expectActiveStyling(telegram, false);
    });

    await step("an external change moves selection and styling", async () => {
      await userEvent.click(
        canvas.getByRole("button", { name: "Show Telegram" }),
      );
      await waitFor(() =>
        expect(telegram).toHaveAttribute("aria-selected", "true"),
      );
      await expect(discord).toHaveAttribute("aria-selected", "false");
      await expect(canvas.getByRole("tabpanel")).toHaveTextContent("Telegram");
      await expectActiveStyling(telegram, true);
      await expectActiveStyling(discord, false);
    });

    await step("clicking a tab updates the parent's key", async () => {
      await userEvent.click(discord);
      await waitFor(() =>
        expect(discord).toHaveAttribute("aria-selected", "true"),
      );
      await expect(canvas.getByRole("tabpanel")).toHaveTextContent("Discord");
      await expect(args.callback).toHaveBeenLastCalledWith("discord", 0);
      await expectActiveStyling(discord, true);
      await expectActiveStyling(telegram, false);
    });
  },
};
