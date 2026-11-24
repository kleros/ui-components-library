// Gate (d.9, guide): the lint preset as it ships, read from the config it builds (no ESLint needed).
// - Tailwind only for all: the old `styled` option still loads and changes nothing (Court's d.6 config passes it).
// - Every styled-components use is its own report (kleros-ui/no-styled-components is on), so the per-file baseline
//   counts uses; imports of CSS-in-JS libraries are restricted.
// - D6: Card round is flagged in every app; inline style that sets colour, spacing or type is flagged.
// - Its rule code was exercised on a fixture with the app's ESLint when it was written; these gates have no ESLint.
// usage: node guide-preset.mjs <eslint/index.mjs>
// d.11 (B1): the preset sets kleros-ui/no-restricted-syntax and -imports only when ESLint's rules load; see the helper.
import "./eslint-stand-in.mjs";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";

const { default: klerosUI } = await import(pathToFileURL(resolve(process.argv[2])).href);
const fails = [];
const show = (v) => JSON.stringify(v, (k, x) => (typeof x === "function" ? `fn:${x.name}` : x));
const plain = klerosUI({});
if (show(klerosUI({ styled: true })) !== show(plain)) fails.push("klerosUI({ styled: true }) differs from klerosUI({})");
if (show(klerosUI({ cssEntry: "src/index.css", styled: true })) !== show(klerosUI({ cssEntry: "src/index.css" }))) fails.push("styled: true changes the config with a cssEntry");

const main = plain.find((c) => c.rules?.["kleros-ui/no-restricted-syntax"]);
if (!main) fails.push("no config block with kleros-ui/no-restricted-syntax");
const rules = main?.rules ?? {};
const rule = main?.plugins?.["kleros-ui"]?.rules?.["no-styled-components"];
if (rules["kleros-ui/no-styled-components"] !== "error" || typeof rule?.create !== "function") fails.push("kleros-ui/no-styled-components is not on");
const syntax = (rules["kleros-ui/no-restricted-syntax"] ?? []).slice(1);
const has = (pred, what) => syntax.some(pred) || fails.push(`kleros-ui/no-restricted-syntax lacks ${what}`);
has((r) => r.selector.includes("JSXAttribute[name.name='round']") && r.selector.includes("Card"), "the Card round rule");
has((r) => r.selector.startsWith("JSXAttribute[name.name='style']") && /color/.test(r.selector) && /padding/.test(r.selector) && !/width|height/.test(r.selector), "the inline style rule (colour, spacing, type; not sizes)");
has((r) => r.selector === 'JSXOpeningElement[name.name="style"]', "the <style> block rule");
has((r) => r.message?.startsWith("Local component with a library name"), "the library-name rule (gate/kit-names.mjs reads it)");
if (syntax.some((r) => /radius|margin\|padding/.test(r.selector) && r.selector.startsWith("TemplateElement")))
  fails.push("the styled-components px rules are still there (every styled use is reported instead)");

const imports = (rules["kleros-ui/no-restricted-imports"] ?? [])[1] ?? {};
const names = new Set((imports.paths ?? []).map((p) => p.name));
const groups = new Set((imports.patterns ?? []).flatMap((p) => p.group));
for (const n of ["styled-components", "goober", "styled-jsx"]) if (!names.has(n)) fails.push(`kleros-ui/no-restricted-imports lacks ${n}`);
for (const g of ["@emotion/*", "@stitches/*", "@vanilla-extract/*", "styled-components/*"]) if (!groups.has(g)) fails.push(`kleros-ui/no-restricted-imports lacks ${g}`);
if (!(imports.paths ?? []).every((p) => /Tailwind/.test(p.message))) fails.push("a CSS-in-JS import message does not name the Tailwind way");

if (fails.length) {
  for (const f of fails) console.error(`guide-preset: ${f}`);
  process.exit(1);
}
console.log("guide-preset: styled option ignored; styled-components uses, CSS-in-JS imports, Card round, visual inline style and <style> flagged");
