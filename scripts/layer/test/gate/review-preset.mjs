// Gate (d.9 review): the lint preset's fixes, read from the config it builds. run.sh has no ESLint, so the preset is
// copied next to a stand-in for eslint-plugin-better-tailwindcss (an empty plugin), which makes it emit its Tailwind
// class rules, and each class is tested against their patterns the way that plugin tests them (as a RegExp). The same
// classes and the Card selector ran with ESLint 9 and the real plugin when the fixes were made.
// - .js and .jsx files are linted, with JSX parsing on (cli F7).
// - Card round: the library's Card only, so an app's RoundCard round={2} passes (guide F3).
// - Spacing and radius are allow-lists, and dark: colour classes are caught after other variants (guide F6).
// - stroke-[1.5] and border-[1.5px] are widths, not arbitrary colours (guide F7).
// usage: node review-preset.mjs <eslint/index.mjs> <empty work folder>
// d.11 (B1): the preset sets kleros-ui/no-restricted-syntax and -imports only when ESLint's rules load; see the helper.
import "./eslint-stand-in.mjs";
import { copyFileSync, mkdirSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { pathToFileURL } from "node:url";

const [preset, work] = process.argv.slice(2).map((p) => resolve(p));
const stand = join(work, "node_modules/eslint-plugin-better-tailwindcss");
mkdirSync(join(work, "eslint"), { recursive: true });
mkdirSync(stand, { recursive: true });
copyFileSync(preset, join(work, "eslint/index.mjs"));
writeFileSync(join(stand, "package.json"), JSON.stringify({ name: "eslint-plugin-better-tailwindcss", type: "module", exports: "./index.js" }));
writeFileSync(join(stand, "index.js"), "export default { rules: {} };\n");
const { default: klerosUI } = await import(pathToFileURL(join(work, "eslint/index.mjs")).href);

const fails = [];
const config = klerosUI({});
const restrict = config.flatMap((c) => c.rules?.["better-tailwindcss/no-restricted-classes"]?.[1]?.restrict ?? []);
if (!restrict.length) fails.push("no Tailwind class patterns: the stand-in plugin did not load");
const hits = (cls) => restrict.filter((r) => new RegExp(r.pattern).test(cls)).map((r) => r.message.split(":")[0]);

// Each must be flagged, with this message.
const flagged = {
  "p-13": "Off-scale spacing", "gap-18": "Off-scale spacing", "mt-4.5": "Off-scale spacing", "pt-15": "Off-scale spacing",
  "gap-x-5": "Off-scale spacing", "-m-7": "Off-scale spacing", "md:space-y-10": "Off-scale spacing",
  "p-[13px]": "Arbitrary spacing", "p-(--gap)": "Arbitrary spacing",
  "rounded-4xl": "Off-scale radius", "rounded-lg": "Off-scale radius", "rounded-t-lg": "Off-scale radius", rounded: "Off-scale radius",
  "rounded-[7px]": "Off-scale radius",
  "dark:bg-klerosUIComponentsPrimaryBlue": "dark", "md:dark:bg-klerosUIComponentsPrimaryBlue": "dark",
  "hover:dark:text-klerosUIComponentsPrimaryText": "dark", "dark:hover:text-klerosUIComponentsPrimaryText": "dark",
  "bg-[#123456]": "Arbitrary colour", "stroke-[var(--x)]": "Arbitrary colour", "border-[rgb(0_0_0)]": "Arbitrary colour",
};
for (const [cls, want] of Object.entries(flagged)) if (!hits(cls).includes(want)) fails.push(`${cls} is not flagged as ${want} (got ${JSON.stringify(hits(cls))})`);
// Each must pass.
const clean = [
  "p-4", "gap-x-4", "gap-0.5", "p-0", "mx-auto", "m-auto", "-mt-2", "-mt-px", "gap-px", "space-x-reverse", "space-y-2", "lg:px-8",
  "rounded-base", "rounded-t-base", "rounded-full", "rounded-none", "stroke-[1.5]", "border-[1.5px]", "ring-[3px]", "w-[300px]",
  "bg-klerosUIComponentsPrimaryBlue", "text-sm", "dark:scheme-dark", "max-sm:*:grow",
];
for (const cls of clean) if (hits(cls).length) fails.push(`${cls} is flagged (${hits(cls).join(", ")})`);

const main = config.find((c) => c.rules?.["kleros-ui/no-styled-components"]);
const files = main?.files ?? [];
// A {...} group in a glob whose words include js, jsx, ts and tsx in that order (word by word, not one regex with five
// [^}]* runs, which backtracks super-linearly on a long glob).
const EXTS = ["js", "jsx", "ts", "tsx"];
const coversExts = (glob) => [...glob.matchAll(/\{([^}]*)\}/g)].some(([, group]) => {
  let next = 0;
  for (const word of group.match(/\w+/g) ?? []) if (word === EXTS[next]) next++;
  return next === EXTS.length;
});
if (!files.some(coversExts)) fails.push(`files does not cover .js, .jsx, .ts and .tsx: ${JSON.stringify(files)}`);
if (!config.some((c) => c.languageOptions?.parserOptions?.ecmaFeatures?.jsx === true && JSON.stringify(c.files) === JSON.stringify(files)))
  fails.push("no JSX parsing for the preset's files");
const round = (main?.rules?.["kleros-ui/no-restricted-syntax"] ?? []).slice(1).find((r) => r.selector?.includes("JSXAttribute[name.name='round']"));
if (!round) fails.push("no Card round rule");
else if (!round.selector.includes("[name.name='Card']") || /\/Card\$\//.test(round.selector)) fails.push(`Card round matches more than the library's Card: ${round.selector}`);

if (fails.length) {
  for (const f of fails) console.error(`review-preset: ${f}`);
  process.exit(1);
}
console.log(`review-preset: ${Object.keys(flagged).length} classes flagged and ${clean.length} passed as expected; .js/.jsx linted with JSX; Card round on the library's Card only`);
