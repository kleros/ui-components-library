// Minimal CSF3 types so app stories type-check without Storybook installed.
// import type { Meta, StoryObj } from "@kleros/ui-components-library/story-types";
import type { ComponentProps, ComponentType, ReactElement } from "react";
export interface Meta<C extends ComponentType<any> = ComponentType<any>> {
  title?: string;
  component?: C;
  args?: Partial<ComponentProps<C>>;
  parameters?: Record<string, unknown>;
  tags?: string[];
}
export interface StoryObj<M extends Meta = Meta> {
  name?: string;
  args?: M extends Meta<infer C> ? Partial<ComponentProps<C>> : Record<string, unknown>;
  parameters?: Record<string, unknown>;
  render?: (args: any) => ReactElement;
}
