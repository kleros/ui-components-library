// Gate (3.11 second review, R2-F2/F10 and R2-F57): the lint preset's Tailwind plugin load and its Next.js route files.
// run.sh has no ESLint, so, as review-preset.mjs does, the preset is copied next to stand-ins for
// eslint-plugin-better-tailwindcss, one folder each, and imported in a Node child (under gate/eslint-stand-in.mjs):
// - absent: no plugin. The preset says nothing about it (an optional peer; ui:check fails setup on it).
// - throws, missingdep (imports a package that is not there), nodefault (no default export): the preset warns once,
//   naming the plugin, the first line of the error and the reinstall hint, and never `npm install` (check's output
//   must not hold it).
// - working: no warning, and the Tailwind class block is there.
// The preset tells absent from broken by Node's message, "Cannot find package '<name>' imported from ...", where a
// missing dependency of the plugin gives the same code with its own name. Both messages are pinned here on this Node.
// Route files: a later block, whose files pair each preset pattern with each Next.js route pattern (nested arrays, all
// must match), sets the same kleros-ui/no-restricted-syntax with the library-name selector skipping the file's
// default-exported Page; the preset's own block still reports every Page. The selectors ran with ESLint 8.57.1,
// 9.21.0 and 10.11.0 on JS and TS route files when the fix was made; this gate has no ESLint.
// usage: node preset-load-routes.mjs <eslint/index.mjs> <empty work folder>
import "./eslint-stand-in.mjs";
import { spawnSync } from "node:child_process";
import { copyFileSync, mkdirSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const [preset, work] = process.argv.slice(2).map((p) => resolve(p));
const PLUGIN = "eslint-plugin-better-tailwindcss";
const STAND_IN = pathToFileURL(join(dirname(fileURLToPath(import.meta.url)), "eslint-stand-in.mjs")).href;
const fails = [];

// [folder, plugin index.js or null for absent, the error's first line in the warning, or null for no warning]
const cases = [
  ["absent", null, null],
  ["throws", 'throw new Error("boom: needs a newer Node");\n', "boom: needs a newer Node"],
  ["missingdep", 'import "tailwind-csstree";\nexport default { rules: {} };\n', "Cannot find package 'tailwind-csstree' "],
  ["nodefault", "export const rules = {};\n", "it has no default export"],
  ["working", "export default { rules: {} };\n", null],
];
for (const [name, code, why] of cases) {
  const dir = join(work, name);
  mkdirSync(join(dir, "eslint"), { recursive: true });
  copyFileSync(preset, join(dir, "eslint/index.mjs"));
  if (code !== null) {
    const stand = join(dir, "node_modules", PLUGIN);
    mkdirSync(stand, { recursive: true });
    writeFileSync(join(stand, "package.json"), JSON.stringify({ name: PLUGIN, type: "module", exports: "./index.js" }));
    writeFileSync(join(stand, "index.js"), code);
  }
  // Node's own message for the import the preset makes, from the preset's folder.
  const probe = `import(${JSON.stringify(PLUGIN)}).then(() => console.log("loaded"), (e) => console.log(JSON.stringify({ code: e?.code, line: String(e?.message ?? e).split("\\n")[0] })))`;
  const node = spawnSync(process.execPath, ["--input-type=module", "-e", probe], { cwd: join(dir, "eslint"), encoding: "utf8" });
  const got = node.stdout.trim();
  if (name === "absent" && !(got.includes('"code":"ERR_MODULE_NOT_FOUND"') && got.includes(`"line":"Cannot find package '${PLUGIN}' imported from `)))
    fails.push(`absent: Node's message is not "Cannot find package '${PLUGIN}' imported from ..." (ERR_MODULE_NOT_FOUND): ${got}`);
  if (name === "missingdep" && !(got.includes('"code":"ERR_MODULE_NOT_FOUND"') && got.includes(`"line":"Cannot find package 'tailwind-csstree' imported from `)))
    fails.push(`missingdep: Node's message is not "Cannot find package 'tailwind-csstree' imported from ...": ${got}`);
  // The preset as ESLint loads it.
  const load = `const { default: k } = await import(${JSON.stringify(pathToFileURL(join(dir, "eslint/index.mjs")).href)}); console.log(k({}).some((c) => c.plugins?.["better-tailwindcss"]) ? "tailwind" : "none");`;
  const r = spawnSync(process.execPath, ["--import", STAND_IN, "--input-type=module", "-e", load], { cwd: dir, encoding: "utf8" });
  const warnings = r.stderr.split("\n").filter((l) => l.includes(PLUGIN));
  const block = r.stdout.trim();
  if (r.status !== 0) fails.push(`${name}: the preset does not load: ${r.stderr.trim().split("\n")[0]}`);
  if (block !== (name === "working" ? "tailwind" : "none")) fails.push(`${name}: Tailwind class block ${block}`);
  if (why === null && warnings.length) fails.push(`${name}: warns: ${warnings[0]}`);
  if (why !== null) {
    const [w] = warnings;
    if (warnings.length !== 1) fails.push(`${name}: ${warnings.length} warnings about ${PLUGIN}, expected 1`);
    else if (!w.startsWith(`@kleros/ui-components-library/eslint: ${PLUGIN} did not load (${why}`)) fails.push(`${name}: the warning does not give the error: ${w}`);
    else if (!/Tailwind class rules .* are off\. Reinstall it with the app's package manager/.test(w)) fails.push(`${name}: the warning lacks the rules being off or the reinstall hint: ${w}`);
    else if (/npm install/.test(w)) fails.push(`${name}: the warning names npm install: ${w}`);
  }
}

// Route files, read from the config the preset builds (the plugin absent, as in run.sh).
const { default: klerosUI } = await import(pathToFileURL(join(work, "absent/eslint/index.mjs")).href);
const LIBNAME = "Local component with a library name";
const EXEMPT = ':not(ExportDefaultDeclaration > FunctionDeclaration[id.name="Page"])';
const ROUTES = ["app/**/page.{js,jsx,ts,tsx}", "src/app/**/page.{js,jsx,ts,tsx}", "pages/**/*.{js,jsx,ts,tsx}", "src/pages/**/*.{js,jsx,ts,tsx}"];
// The default files, two plain globs, and a nested AND group (all its patterns must match) beside a plain glob: a
// group's patterns join each route pattern in one group, which ESLint takes (a group inside a group it refuses).
for (const files of [undefined, ["web/src/**/*.tsx", "web/app/**/*.tsx"], [["web/**", "**/*.tsx"], "lib/**/*.ts"]]) {
  const config = klerosUI(files ? { files } : {});
  const own = files ?? ["src/**/*.{js,jsx,ts,tsx}"];
  const syntax = (c) => (c?.rules?.["kleros-ui/no-restricted-syntax"] ?? []).slice(1);
  const mainAt = config.findIndex((c) => c.rules?.["kleros-ui/no-styled-components"]);
  const main = config[mainAt];
  const route = config.find((c, i) => i > mainAt && c.rules?.["kleros-ui/no-restricted-syntax"]);
  const want = own.flatMap((f) => ROUTES.map((r) => [...[f].flat(), r]));
  const lib = syntax(main).find((r) => r.message?.startsWith(LIBNAME));
  const routeLib = syntax(route).find((r) => r.message?.startsWith(LIBNAME));
  const at = files ? ` (files ${JSON.stringify(files)})` : "";
  if (!lib || lib.selector.includes("ExportDefaultDeclaration") || !/\|Page\|/.test(lib.selector))
    fails.push(`the preset's own block does not report every Page${at}: ${lib?.selector}`);
  if (!route) fails.push(`no route-file block after the preset's own${at}`);
  else {
    if (JSON.stringify(route.files) !== JSON.stringify(want)) fails.push(`route block files${at}: ${JSON.stringify(route.files)}`);
    if (!routeLib?.selector.startsWith(lib?.selector) || !routeLib.selector.includes(EXEMPT))
      fails.push(`the route block's library-name rule does not skip the default-exported Page${at}: ${routeLib?.selector}`);
    const others = (list) => JSON.stringify(list.filter((r) => !r.message?.startsWith(LIBNAME)));
    if (others(syntax(route)) !== others(syntax(main)) || syntax(route).length !== syntax(main).length)
      fails.push(`the route block's other restrictions differ from the preset's own${at}`);
  }
}

if (fails.length) {
  for (const f of fails) console.error(`preset-load-routes: ${f}`);
  process.exit(1);
}
console.log("preset-load-routes: plugin absent is silent; throws, missing dependency and no default export each warn once; Next.js route files skip their default-exported Page only");
