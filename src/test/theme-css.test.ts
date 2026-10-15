import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { resolve } from "node:path";
import { beforeAll, describe, expect, it } from "vitest";

type CssNode =
  | { kind: "decl"; name: string; value: string }
  | { kind: "block"; prelude: string; children: CssNode[] };

type TailwindCompile = (
  css: string,
) => Promise<{ build: (candidates: string[]) => string }>;

// tailwindcss publishes its entry only through package.json "exports", which
// the repo's `moduleResolution: node` cannot type-resolve.
const { compile } = createRequire(import.meta.url)("tailwindcss") as {
  compile: TailwindCompile;
};

const collapse = (text: string): string => text.trim().replace(/\s+/g, " ");

// Whitespace inside a value separates tokens, so a run of it becomes one space.
const normaliseValue = (value: string): string =>
  collapse(value).replace(/\(\s/g, "(").replace(/\s\)/g, ")");

const parseDeclaration = (text: string): CssNode => {
  const colon = text.indexOf(":");
  if (colon <= 0) throw new Error(`not a declaration: "${collapse(text)}"`);
  return {
    kind: "decl",
    name: text.slice(0, colon).trim(),
    value: normaliseValue(text.slice(colon + 1)),
  };
};

// Covers the CSS subset theme.css uses: nested blocks and declarations.
const parseCss = (source: string): CssNode[] => {
  if (/["'\\]/.test(source)) throw new Error("strings are not supported");
  const css = source.replace(/\/\*[\s\S]*?\*\//g, " ");
  if (css.includes("/*") || css.includes("*/"))
    throw new Error("unclosed comment");
  let pos = 0;
  const parseNodes = (): CssNode[] => {
    const nodes: CssNode[] = [];
    let start = pos;
    while (pos < css.length && css[pos] !== "}") {
      if (css[pos] === "{") {
        const prelude = collapse(css.slice(start, pos));
        pos++;
        const children = parseNodes();
        if (css[pos] !== "}") throw new Error(`"${prelude}" is not closed`);
        nodes.push({ kind: "block", prelude, children });
        start = ++pos;
      } else if (css[pos] === ";") {
        nodes.push(parseDeclaration(css.slice(start, pos)));
        start = ++pos;
      } else pos++;
    }
    if (css.slice(start, pos).trim())
      nodes.push(parseDeclaration(css.slice(start, pos)));
    return nodes;
  };
  const nodes = parseNodes();
  if (pos !== css.length) throw new Error("unmatched }");
  return nodes;
};

const serialise = (node: CssNode): string =>
  node.kind === "decl"
    ? `${node.name}: ${node.value};`
    : `${node.prelude} { ${node.children.map(serialise).join(" ")} }`;

const childBlock = (nodes: CssNode[], prelude: string): CssNode[] => {
  const matches = nodes.filter(
    (node): node is Extract<CssNode, { kind: "block" }> =>
      node.kind === "block" && node.prelude === prelude,
  );
  if (matches.length !== 1)
    throw new Error(`expected one "${prelude}" block, found ${matches.length}`);
  return matches[0].children;
};

const sortedLines = (nodes: CssNode[]): string[] => nodes.map(serialise).sort();

const declLines = (decls: [string, string][]): string[] =>
  decls.map(([name, value]) => `${name}: ${value};`).sort();

const themeCss = readFileSync(resolve("src/styles/theme.css"), "utf8");
const tree = parseCss(themeCss);
const baseLayer = childBlock(tree, "@layer base");
const themeBlock = childBlock(tree, "@theme");

// kleros-v2 web/src/styles/themes.ts: name, light, dark.
const added: [string, string, string][] = [
  ["DarkPurple", "#220050", "#220050"],
  ["VioletPurple", "#6a1dcd", "#6a1dcd"],
  ["LavenderPurple", "#bb72ff", "#bb72ff"],
  ["WhiteLowOpacitySubtle", "#ffffff0d", "#ffffff0f"],
  ["WhiteLowOpacityStrong", "#ffffff26", "#ffffff24"],
  ["BlackLowOpacity", "#00000080", "#00000080"],
  ["SkeletonBackground", "#ebebeb", "#3a2270"],
  ["SkeletonHighlight", "#f5f5f5", "#3e307c"],
  ["PaleCyan", "#acffff", "#acffff"],
  ["LimeGreen", "#f3ffd9", "#f3ffd9"],
];

const existingLight: [string, string][] = [
  ["PrimaryPurple", "#4d00b4"],
  ["SecondaryPurple", "#9013fe"],
  ["MediumPurple", "#f8f1ff"],
  ["LightPurple", "#fbf9fe"],
  ["PrimaryBlue", "#009aff"],
  ["SecondaryBlue", "#7bcbff"],
  ["MediumBlue", "#f0f9ff"],
  ["LightBlue", "#fcfeff"],
  ["PrimaryText", "#333333"],
  ["SecondaryText", "#999999"],
  ["Stroke", "#e5e5e5"],
  ["LightGrey", "#fafafa"],
  ["WhiteBackground", "#ffffff"],
  ["LightBackground", "#fafbfc"],
  ["ImageCheckerColor", "#e0e0e0"],
  ["DefaultShadow", "#00000002"],
  ["HoveredShadow", "#00000002"],
  ["Success", "#00c42b"],
  ["SuccessLight", "#f0fbf2"],
  ["Warning", "#ff9900"],
  ["WarningLight", "#fff9f0"],
  ["Error", "#f60c36"],
  ["ErrorLight", "#fef0f3"],
  ["Tint", "#d14eff"],
  ["TintMedium", "#fcf4ff"],
  ["TintPurple", "#f4f0fa"],
  ["TransitionSpeed", "0.25s"],
  ["BaseRadius", "3px"],
];

const existingDark: [string, string][] = [
  ["Name", "dark"],
  ["PrimaryPurple", "#7e1bd4"],
  ["SecondaryPurple", "#b45fff"],
  ["MediumPurple", "#390f6c"],
  ["LightPurple", "#fcfbff"],
  ["PrimaryBlue", "#6cc5ff"],
  ["SecondaryBlue", "#a5dbff"],
  ["MediumBlue", "#2e206c"],
  ["LightBlue", "#2a1260"],
  ["PrimaryText", "#daf0ff"],
  ["SecondaryText", "#becce5"],
  ["Stroke", "#392c74"],
  ["LightGrey", "#2d1865"],
  ["WhiteBackground", "#220050"],
  ["LightBackground", "#1b003f"],
  ["ImageCheckerColor", "#2c0d63"],
  ["DefaultShadow", "#00000000"],
  ["HoveredShadow", "#42498f80"],
  ["Success", "#65dc7f"],
  ["SuccessLight", "#32355b"],
  ["Warning", "#ffc46b"],
  ["WarningLight", "#451f54"],
  ["Error", "#ff5a78"],
  ["ErrorLight", "#360652"],
  ["Tint", "#ddb6ff"],
  ["TintMedium", "#401d6c"],
  ["TintPurple", "#2f0960"],
  ["TransitionSpeed", "0.25s"],
];

const existingThemeColours = [
  "PrimaryPurple",
  "SecondaryPurple",
  "MediumPurple",
  "LightPurple",
  "PrimaryBlue",
  "SecondaryBlue",
  "MediumBlue",
  "LightBlue",
  "PrimaryText",
  "SecondaryText",
  "Stroke",
  "LightGrey",
  "WhiteBackground",
  "LightBackground",
  "DefaultShadow",
  "HoveredShadow",
  "Success",
  "SuccessLight",
  "Warning",
  "WarningLight",
  "Error",
  "ErrorLight",
  "Tint",
  "TintMedium",
  "TintPurple",
  "TransitionSpeed",
];

const existingThemeOther: [string, string][] = [
  ["--breakpoint-lg", "56.25rem"],
  ["--radius-base", "var(--klerosUIComponentsBaseRadius)"],
  ["--default-transition-duration", "var(--klerosUIComponentsTransitionSpeed)"],
  ["--animate-fade-in", "fadeIn 0.3s ease-in-out"],
  ["--animate-fade-out", "fadeOut 0.3s ease-in-out"],
  ["--animate-bounce-in", "bounceIn 0.2s ease-out"],
  [
    "--animate-scale-in",
    "scaleIn var(--klerosUIComponentsTransitionSpeed) ease",
  ],
  [
    "--animate-scale-out",
    "slideOut var(--klerosUIComponentsTransitionSpeed) ease",
  ],
  ["--animate-progress-fill", "progressFill 1s ease-out forwards"],
  ["--animate-breathing", "breathe 2s ease-out infinite normal"],
  ["--animate-loading", "loading 2s ease-in-out infinite normal"],
  ["--ease-ease", "cubic-bezier(0.25, 0.1, 0.25, 1)"],
  ["--shadow-default", "0px 2px 3px var(--klerosUIComponentsDefaultShadow)"],
  ["--shadow-input", "0px 0px 6px var(--klerosUIComponentsPrimaryBlue)"],
];

const keyframes = (name: string, ...steps: string[]): string =>
  `@keyframes ${name} { ${steps.join(" ")} }`;

const existingKeyframes = [
  keyframes(
    "fadeIn",
    "0% { opacity: 0; }",
    "50% { opacity: 0.5; }",
    "100% { opacity: 1; }",
  ),
  keyframes(
    "fadeOut",
    "0% { opacity: 1; }",
    "50% { opacity: 0.5; }",
    "100% { opacity: 0; }",
  ),
  keyframes(
    "bounceIn",
    "0% { transform: translateY(100%); }",
    "50% { transform: translateY(-5px); }",
    "100% { transform: translateY(0); }",
  ),
  keyframes(
    "scaleIn",
    "0% { transform: scaleY(0); }",
    "100% { transform: scaleY(1); }",
  ),
  keyframes(
    "scaleOut",
    "0% { transform: scaleY(1); }",
    "100% { transform: scaleY(0); }",
  ),
  keyframes("progressFill", "0% { stroke-dasharray: 0 200%; }"),
  keyframes(
    "breathe",
    "0% { transform: scale(1); }",
    "50% { transform: scale(1.3); }",
    "100% { transform: scale(1); }",
  ),
  keyframes(
    "loading",
    "0% { opacity: 1; }",
    "50% { opacity: 0.5; }",
    "100% { opacity: 1; }",
  ),
];

const prefixed = (decls: [string, string][]): [string, string][] =>
  decls.map(([name, value]) => [`--klerosUIComponents${name}`, value]);

const themeColour = (name: string): [string, string] => [
  `--color-klerosUIComponents${name}`,
  `var(--klerosUIComponents${name})`,
];

describe("theme CSS parser regressions", () => {
  it("ignores commented-out colour declarations and Tailwind mappings", () => {
    expect(
      parseCss(`:root { /* --klerosUIComponentsPaleCyan: #acffff; */ }
        @theme { /* --color-klerosUIComponentsPaleCyan: var(--klerosUIComponentsPaleCyan); */ }`),
    ).toEqual([
      { kind: "block", prelude: ":root", children: [] },
      { kind: "block", prelude: "@theme", children: [] },
    ]);
  });

  it.each([
    ["#acffff", "#acff ff"],
    ["fadeIn 0.3s ease-in-out", "fadeIn 0.3sease-in-out"],
    ["#acffff", "#acff/**/ff"],
  ])("distinguishes %s from the broken token sequence %s", (valid, broken) => {
    expect(parseCss(`--value: ${broken};`)).not.toEqual(
      parseCss(`--value: ${valid};`),
    );
  });

  it("retains unlayered overrides after the base layer", () => {
    const override =
      ":root { --klerosUIComponentsSkeletonBackground: #ff0000; }";
    const nodes = parseCss(`@layer base { :root {} } ${override}`);
    expect(nodes).toHaveLength(2);
    expect(serialise(nodes[1])).toBe(override);
  });
});

describe("theme.css structure", () => {
  it("has only the base layer and the @theme block at top level", () => {
    expect(
      tree.map((node) =>
        node.kind === "block" ? node.prelude : serialise(node),
      ),
    ).toEqual(["@layer base", "@theme"]);
  });

  it("has only the light and dark rules in the base layer", () => {
    expect(
      baseLayer.map((node) =>
        node.kind === "block" ? node.prelude : serialise(node),
      ),
    ).toEqual([":root", ":root.dark"]);
  });
});

describe("theme.css declarations", () => {
  it("declares exactly the existing and added light variables", () => {
    expect(sortedLines(childBlock(baseLayer, ":root"))).toEqual(
      declLines([
        ...prefixed(existingLight),
        ...prefixed(added.map(([name, light]) => [name, light])),
      ]),
    );
  });

  it("declares exactly the existing and added dark variables", () => {
    expect(sortedLines(childBlock(baseLayer, ":root.dark"))).toEqual(
      declLines([
        ...prefixed(existingDark),
        ...prefixed(added.map(([name, , dark]) => [name, dark])),
      ]),
    );
  });

  it("declares exactly the existing and added @theme entries and keyframes", () => {
    expect(sortedLines(themeBlock)).toEqual(
      [
        ...declLines([
          ...existingThemeColours.map(themeColour),
          ...added.map(([name]) => themeColour(name)),
          ...existingThemeOther,
        ]),
        ...existingKeyframes,
      ].sort(),
    );
  });
});

describe("Tailwind utilities for the added colours", () => {
  let compiler: Awaited<ReturnType<TailwindCompile>>;
  beforeAll(async () => {
    compiler = await compile(`@tailwind utilities;\n${themeCss}`);
  });

  it.each(added)("generates bg-klerosUIComponents%s", (name) => {
    const utility = `bg-klerosUIComponents${name}`;
    const output = parseCss(compiler.build([utility]));
    const [themeVar, themeValue] = themeColour(name);

    expect(sortedLines(childBlock(output, `.${utility}`))).toEqual([
      `background-color: var(${themeVar});`,
    ]);
    expect(sortedLines(childBlock(output, ":root, :host"))).toContain(
      `${themeVar}: ${themeValue};`,
    );
  });
});
