// Gate (d.9, guide): the starter as it ships.
// - D18: src/main.tsx imports the library's compiled CSS before the app's Tailwind entry, so the app's responsive
//   classes win over the library's plain ones (proven on pilot 5 Claude's app). Not as
//   an @import in index.css, which would add a second copy.
// - D8: main.tsx calls the kit's applyInitialTheme() before createRoot(...).render.
// - Tailwind only: src/index.css is exactly the four directives, and the page is themed by classes on <html> and
//   <body> in index.html (background, text colour, colour scheme per theme), with no <style> block.
// usage: node guide-starter.mjs <templates/poc>
// Exit 0 when all hold; otherwise it lists what failed on stderr and exits 1. Exits 2 when the argument is not the
// templates/poc folder of a copy of @kleros/ui-components-library.
import { readFileSync, realpathSync } from "node:fs";
import { basename, dirname, isAbsolute, join, relative, sep } from "node:path";

// The path comes from the command line, so it must resolve (links followed) to a package's templates/poc folder, and
// each file read must resolve inside that folder.
const starterDir = (arg) => {
  try {
    const dir = realpathSync(arg);
    const ok = basename(dir) === "poc" && basename(dirname(dir)) === "templates"
      && JSON.parse(readFileSync(join(dirname(dirname(dir)), "package.json"), "utf8")).name === "@kleros/ui-components-library";
    return ok ? dir : null;
  } catch {
    return null;
  }
};
const dir = process.argv[2] ? starterDir(process.argv[2]) : null;
if (!dir) {
  console.error(`guide-starter: ${process.argv[2] ?? "no path given"}: not the templates/poc folder of @kleros/ui-components-library`);
  process.exit(2);
}
const read = (f) => {
  const file = realpathSync(join(dir, f));
  const rel = relative(dir, file);
  if (!rel || rel === ".." || rel.startsWith(`..${sep}`) || isAbsolute(rel)) throw new Error(`${f} resolves outside ${dir}`);
  return readFileSync(file, "utf8");
};
const fails = [];
const main = read("src/main.tsx");
const css = read("src/index.css");
const html = read("index.html");

const at = (re) => main.search(re);
const libCss = at(/^import\s+["']@kleros\/ui-components-library\/style\.css["'];?\s*$/m);
const appCss = at(/^import\s+["']\.\/index\.css["'];?\s*$/m);
const kitImport = at(/^import\s*\{[^}]*\bapplyInitialTheme\b[^}]*\}\s*from\s*["']@kleros\/ui-components-library\/kit["'];?\s*$/m);
const call = at(/^applyInitialTheme\(\);?\s*$/m);
const render = at(/createRoot\(/);
if (libCss < 0) fails.push('main.tsx: no import "@kleros/ui-components-library/style.css"');
if (appCss < 0) fails.push('main.tsx: no import "./index.css"');
if (libCss >= 0 && appCss >= 0 && libCss > appCss) fails.push("main.tsx: the library's style.css is imported after ./index.css");
const firstLibImport = at(/^import\s[^;]*["']@kleros\/ui-components-library(\/kit)?["']/m);
if (firstLibImport >= 0 && libCss >= 0 && firstLibImport < libCss)
  fails.push("main.tsx: a library import comes before style.css, so the library's CSS would load from its JS first");
if (kitImport < 0) fails.push("main.tsx: applyInitialTheme is not imported from @kleros/ui-components-library/kit");
if (call < 0) fails.push("main.tsx: applyInitialTheme() is not called");
if (call >= 0 && (render < 0 || call > render)) fails.push("main.tsx: applyInitialTheme() is not called before createRoot(...).render");

const starterCss = [
  '@import "tailwindcss";',
  '@import "@kleros/ui-components-library/theme.css";',
  '@source "../node_modules/@kleros/ui-components-library";',
  "@custom-variant dark (&:where(.dark, .dark *));",
];
const cssLines = css.split("\n").map((l) => l.trim()).filter(Boolean);
if (cssLines.join("\n") !== starterCss.join("\n")) fails.push(`index.css is not exactly the four directives: ${JSON.stringify(cssLines)}`);
if (/style\.css/.test(css)) fails.push("index.css imports style.css (a second copy; it belongs in main.tsx)");

const classes = (tag) => (html.match(new RegExp(`<${tag}\\b[^>]*\\bclass="([^"]*)"`)) || [])[1]?.split(/\s+/) ?? [];
const need = { html: ["scheme-light", "dark:scheme-dark"], body: ["bg-klerosUIComponentsLightBackground", "text-klerosUIComponentsPrimaryText"] };
for (const [tag, list] of Object.entries(need))
  for (const c of list) if (!classes(tag).includes(c)) fails.push(`index.html: <${tag}> lacks class ${c}`);
if (/<style\b/i.test(html.replace(/<!--[\s\S]*?-->/g, ""))) fails.push("index.html has a <style> block");

if (fails.length) {
  for (const f of fails) console.error(`guide-starter: ${f}`);
  process.exit(1);
}
console.log("guide-starter: style.css before index.css, applyInitialTheme() before render, index.css = 4 directives, <html>/<body> themed by classes");
