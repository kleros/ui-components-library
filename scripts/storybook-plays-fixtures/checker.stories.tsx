import React from "react";
import type { Meta, StoryObj } from "@storybook/react";

// Each story's name says what the checker must report; see check-storybook-plays.test.mjs.
const meta = {
  title: "Checker Fixtures",
  render: () => <p>fixture</p>,
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

export const Passes: Story = {
  play: async () => {},
};

export const PlayThrows: Story = {
  play: async () => {
    throw new Error("fixture: play throws");
  },
};

export const AfterEachThrowsAfterTimer: Story = {
  experimental_afterEach: async () => {
    await new Promise((resolve) => setTimeout(resolve, 50));
    throw new Error("fixture: afterEach throws after a timer");
  },
};

export const DarkOnlyAtPlayStart: Story = {
  play: async () => {
    if (document.documentElement.classList.contains("dark"))
      throw new Error("fixture: dark at play start");
  },
};

export const DarkOnlyAtFirstRender: Story = {
  render: () => {
    if (document.documentElement.classList.contains("dark"))
      throw new Error("fixture: dark at first render");
    return <p>fixture</p>;
  },
};

export const UnhandledRejectionWhilePlaying: Story = {
  play: async () => {
    void Promise.reject(new Error("fixture: unhandled rejection"));
    await new Promise((resolve) => setTimeout(resolve, 50));
  },
};

export const RenderThrows: Story = {
  render: () => {
    throw new Error("fixture: render throws");
  },
};
