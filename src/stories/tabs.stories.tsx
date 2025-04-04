import type { Meta, StoryObj } from "@storybook/react";
import React from "react";
import { IPreviewArgs } from "./utils";

import TabsComponent from "../lib/pagination/tabs";
import Telegram from "../assets/svgs/telegram.svg";

const meta = {
  component: TabsComponent,
  title: "Pagination/Tabs",
  tags: ["autodocs"],
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
};
