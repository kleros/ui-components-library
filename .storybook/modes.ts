/**
 * Chromatic modes: every story is snapshotted once per mode.
 * Each mode sets the `theme` Storybook global (see `globalTypes` in
 * preview.tsx), which the global decorator maps to the `dark` class on <html>.
 * https://www.chromatic.com/docs/modes/
 */
export const allModes = {
  light: { theme: "light" },
  dark: { theme: "dark" },
} as const;
