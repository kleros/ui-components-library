import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

// Vitest runs from the repo root.
const css = readFileSync(resolve("src/styles/theme.css"), "utf8");

// Returns the body of the first `<selector> {` block, matched by brace depth.
const blockBody = (selector: string): string => {
  const open = css.indexOf(`${selector} {`);
  if (open === -1) throw new Error(`block "${selector}" not found`);
  let depth = 0;
  for (let i = css.indexOf("{", open); i < css.length; i++) {
    if (css[i] === "{") depth++;
    if (css[i] === "}" && --depth === 0) return css.slice(open, i);
  }
  throw new Error(`block "${selector}" is not closed`);
};

const declarations = (body: string): Map<string, string> => {
  const map = new Map<string, string>();
  for (const [, name, value] of body.matchAll(/(--[\w-]+)\s*:\s*([^;{}]+);/g))
    map.set(name, value.replace(/\s+/g, ""));
  return map;
};

const light = declarations(blockBody(":root"));
const dark = declarations(blockBody(":root.dark"));
const theme = declarations(blockBody("@theme"));

// Values from kleros-v2 web/src/styles/themes.ts, light / dark.
const added: [string, string, string][] = [
  ["DarkPurple", "#220050", "#220050"],
  ["VioletPurple", "#6A1DCD", "#6A1DCD"],
  ["LavenderPurple", "#BB72FF", "#BB72FF"],
  ["WhiteLowOpacitySubtle", "#FFFFFF0D", "#FFFFFF0F"],
  ["WhiteLowOpacityStrong", "#FFFFFF26", "#FFFFFF24"],
  ["BlackLowOpacity", "#00000080", "#00000080"],
  ["SkeletonBackground", "#EBEBEB", "#3A2270"],
  ["SkeletonHighlight", "#F5F5F5", "#3E307C"],
  ["PaleCyan", "#ACFFFF", "#ACFFFF"],
  ["LimeGreen", "#F3FFD9", "#F3FFD9"],
];

const existing: [string, string, string][] = [
  ["PrimaryPurple", "#4d00b4", "#7e1bd4"],
  ["TintPurple", "#f4f0fa", "#2f0960"],
  ["WhiteBackground", "#ffffff", "#220050"],
  ["Stroke", "#e5e5e5", "#392c74"],
];

describe("theme.css kleros-v2 colours", () => {
  it.each(added)("defines %s as %s in light and %s in dark", (name, l, d) => {
    expect(light.get(`--klerosUIComponents${name}`)?.toLowerCase()).toBe(
      l.toLowerCase(),
    );
    expect(dark.get(`--klerosUIComponents${name}`)?.toLowerCase()).toBe(
      d.toLowerCase(),
    );
  });

  it.each(added)("exposes %s as a Tailwind colour in @theme", (name) => {
    expect(theme.get(`--color-klerosUIComponents${name}`)).toBe(
      `var(--klerosUIComponents${name})`,
    );
  });
});

describe("theme.css existing colours", () => {
  it.each(existing)("keeps %s at %s light and %s dark", (name, l, d) => {
    expect(light.get(`--klerosUIComponents${name}`)).toBe(l);
    expect(dark.get(`--klerosUIComponents${name}`)).toBe(d);
    expect(theme.get(`--color-klerosUIComponents${name}`)).toBe(
      `var(--klerosUIComponents${name})`,
    );
  });
});
