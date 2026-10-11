import type { Meta, StoryObj } from "@storybook/react";

// Indexed at build time, but the module throws when the preview loads it.
if (typeof window !== "undefined")
  throw new Error("fixture: stories module throws on import");

const meta = { title: "Checker Fixtures Import" } satisfies Meta;

export default meta;

export const ModuleThrows: StoryObj<typeof meta> = {};
