#!/usr/bin/env node
// kleros-ui: the library's own CLI, shipped inside @kleros/ui-components-library so it matches the installed version.
//   npx -p @kleros/ui-components-library kleros-ui create <dir> [--lib <spec>] [--no-install]
//                                      a new app: copy the starter, set the library spec, npm install, then init
//   npx -p @kleros/ui-components-library kleros-ui init                 wire the app: agent block + pointers, kleros-ui.json, lint preset, ui:check
//   npx -p @kleros/ui-components-library kleros-ui new <Name> [--kind ui|data|form] [--intent "words, more words"]   scaffold an app component with props,
//                                      index.ts and a registry entry, and stories when the app has Storybook;
//                                      --intent fills the entry's intent words
//   npx -p @kleros/ui-components-library kleros-ui check [--build]      tsc + lint + app CSS + setup checks (the definition of done); --build is what
//                                      the starter's build runs first: a stale or missing agent block is a
//                                      note, and no baseline applies
//   npx -p @kleros/ui-components-library kleros-ui css [path ...]       the app CSS scan alone: redefined library tokens and colour literals; Tailwind
//                                      only, !important and library internals; the theme file's
//                                      shape and its import in the entry
//   npx -p @kleros/ui-components-library kleros-ui theme                set up the app's one theme file: writes src/theme.css (or the path
//                                      kleros-ui.json's "theme" names) with the library's token names as comments, sets
//                                      "theme", and imports it in the Tailwind entry right after the library's theme.css
//   npx -p @kleros/ui-components-library kleros-ui baseline             record an existing app's lint, type and CSS findings, so check fails only on new ones
//   npx -p @kleros/ui-components-library kleros-ui sync                 rewrite the agent block for the installed version
// Node built-ins only. check also loads the app's own @tailwindcss/node and @tailwindcss/oxide, from the app.
import { copyFileSync, existsSync, lstatSync, mkdirSync, readFileSync, readdirSync, readlinkSync, realpathSync, rmSync, statSync, writeFileSync } from "node:fs";
import { basename, dirname, isAbsolute, join, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";
import { builtinModules, createRequire } from "node:module";

const PKG_DIR = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const pkg = JSON.parse(readFileSync(join(PKG_DIR, "package.json"), "utf8"));
const CATALOG = JSON.parse(readFileSync(join(PKG_DIR, "agent/catalog.json"), "utf8"));
const LIB = "@kleros/ui-components-library";
const START = /<!-- kleros-ui:start[^>]*-->/;
// The start marker with the release that wrote the block, which check reads.
const START_VERSION = /<!-- kleros-ui:start ([^ ]+) -->/;
const END = "<!-- kleros-ui:end -->";
const CONFIG = "kleros-ui.json";
const STEPS = "0.5 1 2 3 4 6 8 12 16";

const readJson = (f, d) => (existsSync(f) ? JSON.parse(readFileSync(f, "utf8")) : d);
const readOr = (f, d = "") => {
  try {
    return readFileSync(f, "utf8");
  } catch {
    return d;
  }
};
// Writes stay inside the app: no file is written through a symbolic link that points outside the app's folder, into
// its node_modules or at nothing, and none in a folder that resolves outside the app's folder or into its node_modules
// (a linked folder, or a path such as "../x" in kleros-ui.json). A link that resolves inside the app is fine (AGENTS.md -> CLAUDE.md, a
// linked .cursor). A file where a folder goes (.cursor/rules as a file) is refused too, so mkdir does not fail midway,
// and so is a folder where a file goes (.cursor/rules/kleros-ui.mdc as a folder), so the write does not.
// The app's folder is the one the command runs in; create sets it
// to the new app's folder. Why `p` may not be written, or null.
let APP_ROOT = null;
function writeProblem(p, { folder = false, root = APP_ROOT ?? realOrNull(".") } = {}) {
  const abs = resolve(p);
  const name = (x) => toPosix(relative(process.cwd(), x)) || ".";
  const inside = (real) => real === root || real.startsWith(root.endsWith(sep) ? root : root + sep);
  for (let d = abs; ; d = dirname(d)) {
    let link;
    try {
      link = lstatSync(d).isSymbolicLink();
    } catch {
      if (dirname(d) === d) return null;
      continue;
    }
    // The nearest entry that exists; what the write makes below it is new.
    const real = realOrNull(d);
    if (!real) return `${name(d)} ${link ? "is a symbolic link that points at nothing" : "cannot be resolved"}`;
    const modules = inside(real) && relative(root, real).split(sep).includes("node_modules");
    if (link && d === abs && !folder && (!inside(real) || modules))
      return `${name(d)} is a symbolic link (to ${real}), outside the app's own files`;
    const where = d === abs ? name(d) : `${name(d)}, where ${name(abs)} goes,`;
    if (!inside(real)) return `${where} resolves to ${real}, outside the app's folder (${root})`;
    if (modules) return `${where} resolves to ${real}, in node_modules, which the next install replaces`;
    const dir = statSync(real).isDirectory();
    if ((folder || d !== abs) && !dir) return `${name(d)} is a file, not a folder, so ${d === abs ? "it" : name(abs)} cannot be made there (move it away)`;
    if (!folder && d === abs && dir) return `${name(d)} is a folder, not a file, so it cannot be written (move it away)`;
    return null;
  }
}
const WRITES_ONLY = "kleros-ui writes no file through a symbolic link that leads out of the app's own files, or outside the app's folder: replace the link with the file or folder itself, or make the change by hand";
const guard = (p, opts) => {
  const why = writeProblem(p, opts);
  if (why) throw new Error(`kleros-ui: ${why}, so it was not written. ${WRITES_ONLY}.`);
};
const write = (f, text) => {
  guard(f);
  writeFileSync(f, text);
};
const mkdir = (d) => {
  guard(d, { folder: true });
  mkdirSync(d, { recursive: true });
};
const writeJson = (f, v) => write(f, JSON.stringify(v, null, 2) + "\n");
const sameFile = (a, b) => {
  const r = realOrNull(a);
  return r !== null && r === realOrNull(b);
};
// CLAUDE.md that is AGENTS.md: the same file, or a link to AGENTS.md before init writes it (a dangling link now).
const isAgents = (claude, agents) => {
  if (sameFile(claude, agents)) return true;
  try {
    return lstatSync(claude).isSymbolicLink() && resolve(dirname(claude), readlinkSync(claude)) === resolve(agents);
  } catch {
    return false;
  }
};
// A kleros-ui.json that is not strict JSON (a trailing comma), or not an object, is one line that names the file, not
// a stack. `css <path>` reads it too, for the theme.
const config = () => {
  try {
    const c = readJson(CONFIG, { componentsDir: "src/components", components: [] });
    if (c?.constructor === Object) return c;
    throw new Error(`${JSON.stringify(c)} is not an object`);
  } catch (e) {
    throw new Error(`kleros-ui: ${CONFIG} is not valid JSON (${e.message}). Fix it (no comments, no trailing commas), then run the command again.`);
  }
};
const declared = (pj, name) => Boolean(pj.dependencies?.[name] || pj.devDependencies?.[name]);
const toPosix = (p) => p.split(sep).join("/");

// Tailwind only for all: every app styles with Tailwind, Court included, so there is one block and one
// set of checks. An app without Tailwind yet (Court styles with styled-components) is told to add it first, and
// ui:check reports it until it is there; its existing styled-components code and CSS pass through the baseline.
// "Has Tailwind": tailwindcss in dependencies or devDependencies. "Has Storybook": storybook or any @storybook/*
// package there, or a .storybook folder at the app root.
const deps = (pj) => ({ ...pj?.dependencies, ...pj?.devDependencies });
const hasTailwind = (pj = readJson("package.json", {})) => Boolean(deps(pj).tailwindcss);
const hasStorybook = (pj = readJson("package.json", {})) =>
  Object.keys(deps(pj)).some((n) => n === "storybook" || n.startsWith("@storybook/")) ||
  (existsSync(".storybook") && statSync(".storybook").isDirectory());
const EXISTING_APPS = '"Existing apps"';

// Where the block says the library is. create --no-install from the npx cache sets it to the path the library will
// have once the app installs it, instead of the cache's own path.
let LIB_PATH = null;

// Step 0 of the block, only while the app has no Tailwind; check and baseline look for its first words.
const NO_TAILWIND_STEP = "0. This app has no Tailwind yet";
// The first `marker` (START, START_VERSION or END) at or after `from` that is one: at the start of a line (up to three
// spaces in, where it is still an HTML comment, as in CommonMark; four make it code) and outside a fenced code block
// (``` or ~~~), where init, sync and every earlier release wrote the block's markers. A marker quoted
// in the app's own text around the block (in inline code, or an example in a code fence) is that text: before, sync
// wrote the new block between a quoted start/end pair above the block, the real block kept the old release, and check
// read the quoted pair's release. Every reader and writer of the block finds its markers here, so they cannot disagree.
// A fence that never closes is not one, so a stray ``` above the block does not hide it. CRLF and CR-only lines count
// as LF ones, and a byte order mark does not move the first line's start. The match ([0] the marker, [1] the release for
// START_VERSION, index), or null.
function findMarker(text, marker, from = 0) {
  const re = new RegExp(marker.source ?? marker.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "y");
  const lines = [];
  const nl = /\r\n?|\n/g;
  for (let i = text.startsWith("\uFEFF") ? 1 : 0; ; ) {
    nl.lastIndex = i;
    const eol = nl.exec(text);
    lines.push({ index: i, line: text.slice(i, eol ? eol.index : text.length) });
    if (!eol) break;
    i = eol.index + eol[0].length;
  }
  for (let n = 0; n < lines.length; n++) {
    // A fence opens with three or more ` or ~, up to three spaces in or after a list item's marker ("- ```sh",
    // "1. ```sh"), as in CommonMark (a ` fence's info string has no `), and closes at a line of at least as many of the
    // same character and nothing else, up to three spaces past its column (the item's content column in a list, else
    // 0), so a line indented further is the fence's text. A list item's fence also ends with its item, at the first line
    // indented less than that column.
    const open = /^( {0,3}(?:(?:[-*+]|\d{1,9}[.)])[ \t]+)*)(`{3,}|~{3,})(.*)$/.exec(lines[n].line);
    if (open && !(open[2][0] === "`" && open[3].includes("`"))) {
      const col = /[-*+.)]/.test(open[1]) ? open[1].length : 0;
      const close = new RegExp(`^ {0,${col + 3}}${open[2][0]}{${open[2].length},}[ \\t]*$`);
      let end = -1;
      for (let k = n + 1; k < lines.length; k++) {
        if (close.test(lines[k].line)) {
          end = k;
          break;
        }
        if (col && lines[k].line.trim() && /^ */.exec(lines[k].line)[0].length < col) {
          end = k - 1;
          break;
        }
      }
      if (end > n || (end === n && col)) {
        n = end;
        continue;
      }
    }
    if (lines[n].index < from) continue;
    re.lastIndex = lines[n].index + /^ {0,3}/.exec(lines[n].line)[0].length;
    const m = re.exec(text);
    if (m) return m;
  }
  return null;
}
// The block's text, whatever release wrote it (a block from an earlier release of this major is only a note in check,
// so its text is checked as this release's is, and baseline rewrites it as it does this release's); null with none.
function currentBlock() {
  const agents = existsSync("AGENTS.md") ? readFileSync("AGENTS.md", "utf8") : "";
  const m = findMarker(agents, START_VERSION);
  if (!m) return null;
  const end = findMarker(agents, END, m.index);
  return agents.slice(m.index, end ? end.index : agents.length);
}
// True when the block says "no Tailwind yet" and the app has it, or the other way round.
function staleTailwindStep() {
  const text = currentBlock();
  return text !== null && !text.includes("styles its own code with styled-components") && text.includes(NO_TAILWIND_STEP) === hasTailwind();
}

// Where this package sits as seen from the app: the first node_modules/@kleros/ui-components-library from the app's
// folder up that links to this copy. So ../node_modules/... when a monorepo hoists it (as Court's does), and
// node_modules/... under pnpm too, not the store folder it links to (node_modules/.pnpm/<name>@<version>_<hash>),
// whose name changes with any peer's version. This copy's own folder only when none links to it.
const libPath = () => {
  if (LIB_PATH) return LIB_PATH;
  const real = realOrNull(PKG_DIR);
  for (let d = process.cwd(); ; d = dirname(d)) {
    const p = join(d, "node_modules", LIB);
    if (realOrNull(p) === real) return toPosix(relative(process.cwd(), p));
    if (dirname(d) === d) break;
  }
  return toPosix(relative(process.cwd(), PKG_DIR)) || ".";
};

function block() {
  const lib = libPath();
  return [
    `<!-- kleros-ui:start ${pkg.version} -->`,
    // The package name and @layer stay in code spans: Claude Code reads a bare @word in an imported AGENTS.md as a file
    // to load (CLAUDE.md imports this file), so a file planted at kleros/ui-components-library or layer would load.
    `## UI: \`@kleros/ui-components-library\` ${pkg.version} (Tailwind 4 + react-aria). Not v2: no styled-components, ThemeProvider, Field.`,
    ...(hasTailwind()
      ? []
      : [
          `${NO_TAILWIND_STEP} (tailwindcss is not in package.json): add it first, with the steps in ${lib}/agent/AGENTS.md ${EXISTING_APPS}. \`npm run ui:check\` fails until it is there. The app's existing styled-components code and CSS stay as they are; new UI is Tailwind only.`,
        ]),
    `1. Before writing any UI piece, look it up in ${lib}/agent/CATALOG.md and in kleros-ui.json. Use or compose what is there; never hand-roll a near-copy.`,
    // The guide's whole reuse rule (AGENTS.md "Workflow", step 2), not only "Not there: new".
    `2. Not there, or a piece you show in two or more places (a COMPOSE included): make it one named component with \`npx -p @kleros/ui-components-library kleros-ui new <Name> --kind ui|data|form --intent "words"\` (or the steps in ${lib}/agent/NEW-COMPONENT.md), fill it in, and use that component in each place. Don't copy the markup. --intent takes what someone would search for, comma-separated.`,
    // The theme file is the one stylesheet besides the entry, and the theme import the one line the entry
    // gains (rule 4).
    `3. Tailwind only: utility classes in className, and Stack/Inline/Grid/Section/Page/FormStack from /kit for layout. No CSS of your own: the Tailwind entry (kleros-ui.json "cssEntry"; src/index.css in a new app) stays as create (or AGENTS.md ${EXISTING_APPS}) wrote it, plus the theme import of rule 4, and no other .css (the theme file aside), <style> or CSS-in-JS; inline style only for a computed size. Spacing steps ${STEPS} only; no arbitrary values.`,
    // Apps bring their own themes, so a token is redefined in one supported place: the theme file.
    '4. Colour: klerosUIComponents* tokens or a StatusBadge tone. No palette classes, no hex (in .css files too), no dark: overrides (.dark flips tokens). A new look is a theme: `npx -p @kleros/ui-components-library kleros-ui theme` writes the app\'s one theme file (src/theme.css; kleros-ui.json "theme" names it) and imports it. It is the only place to redefine a --klerosUIComponents* token, hex values included: inside its `@layer base`, on :root (light) and :root.dark (dark), with the library\'s own token names only. Nowhere else.',
    "5. Every data view, real or mock: QueryState (a mock passes isLoading={false}; no fake delay or error). Forms: core fields' label/variant/message, Button isLoading, AlertMessage for the result.",
    "6. Don't invent tokens or a palette. If the scale lacks a value, say so in your summary.",
    `7. API, shapes, traps: ${lib}/agent/AGENTS.md. Look: ${lib}/agent/LOOK.md. Catalogue: ${lib}/agent/CATALOG.md.`,
    "8. Done = `npm run ui:check` passes (tsc, lint, the app's CSS, setup). Lint messages name the token or component to use.",
    END,
  ].join("\n");
}

// A start marker with no end marker after it is refused before anything is written: the block would be added below it,
// and the next run would replace everything from that marker to the new block's end, the text between included.
// So is a second start marker before the first end marker (an orphan start above a complete block, as an older init
// wrote it): the block runs from the first start to that end, and its rewrite would replace the text between them.
// Markers are the ones findMarker finds: one quoted in inline code or a code fence is the app's text, not refused.
function checkMarkers(file) {
  const text = readOr(file);
  const start = findMarker(text, START);
  const line = (i) => text.slice(0, i).split(/\r\n?|\n/).length;
  if (!start) return;
  const end = findMarker(text, END, start.index);
  if (!end)
    throw new Error(
      `kleros-ui: ${file} has ${start[0]} on line ${line(start.index)} and no ${END} after it, so kleros-ui cannot tell where its block ends, and left ${file} as it was. Put ${END} after the block's last line, or delete the start marker, then run the command again.`,
    );
  const second = findMarker(text, START, start.index + start[0].length);
  if (second && second.index < end.index)
    throw new Error(
      `kleros-ui: ${file} has ${start[0]} on line ${line(start.index)} and ${second[0]} on line ${line(second.index)} before the first ${END} (line ${line(end.index)}), so kleros-ui cannot tell which start marker begins its block, and left ${file} as it was. Delete the start marker that has no block of its own (keep the text after it), then run the command again.`,
    );
}
// The block runs from the first start marker to the first end marker after it (checkMarkers made sure there is one).
function writeBlock(file) {
  checkMarkers(file);
  const text = existsSync(file) ? readFileSync(file, "utf8") : "# Agent guide\n";
  const start = findMarker(text, START);
  const end = start && findMarker(text, END, start.index);
  write(file, end ? text.slice(0, start.index) + block() + text.slice(end.index + END.length) : `${text.trimEnd()}\n\n${block()}\n`);
}

// [file, what init adds, the line that shows it is there]. A pointer is added once: a file that holds its marker line
// is left alone, so a Cursor rule whose front matter was edited, or saved with CRLF line endings, gets no second copy.
const POINTERS = [
  ["CLAUDE.md", "@AGENTS.md", "@AGENTS.md"],
  [".cursor/rules/kleros-ui.mdc", "---\nalwaysApply: true\n---\nFollow the kleros-ui block in AGENTS.md for all UI work.", "Follow the kleros-ui block in AGENTS.md"],
];
function pointer([file, line, marker]) {
  const text = readOr(file);
  if (text.includes(marker)) return;
  mkdir(dirname(file));
  write(file, `${text.trimEnd()}${text ? "\n\n" : ""}${line}\n`);
}
// What init writes in `dir`, checked before its first write (and by create before its own), so a refusal writes
// nothing: AGENTS.md, the pointers that lack their line (none in a CLAUDE.md that is AGENTS.md through a link, which
// would import itself), kleros-ui.json when there is none, and package.json.
function initWrites(dir = ".") {
  const at = (f) => join(dir, f);
  checkMarkers(at("AGENTS.md"));
  const pointers = POINTERS.filter(([f, , marker]) => !(f === "CLAUDE.md" && isAgents(at(f), at("AGENTS.md"))) && !readOr(at(f)).includes(marker));
  return ["AGENTS.md", ...pointers.map(([f]) => f), ...(existsSync(at(CONFIG)) ? [] : [CONFIG]), "package.json"].map(at);
}

// Vite loads the first of these it finds.
const VITE_CONFIGS = ["vite.config.js", "vite.config.mjs", "vite.config.ts", "vite.config.cjs", "vite.config.mts", "vite.config.cts"];
// ESLint 9 loads the first of these it finds: the app's own config.
const LINT_CONFIGS = ["eslint.config.js", "eslint.config.mjs", "eslint.config.cjs", "eslint.config.ts", "eslint.config.mts", "eslint.config.cts"];
const MANAGED = "// Managed by kleros-ui init: the app's previous config plus the Kleros UI preset.";
// What ui:check and ui:baseline lint with in an existing app: init writes it and leaves the app's own eslint.config.*
// as it was, so the app's own lint (its editor, its lint script, a pre-commit hook) does not report the preset's rules
// on the code ui:baseline records. check and baseline pass it to ESLint with -c. .mts when the app's config is
// TypeScript, which ESLint loads with jiti as it loads the app's own.
const CHECK_LINTS = ["kleros-ui.eslint.config.mjs", "kleros-ui.eslint.config.mts"];
const CHECK_LINT_HEAD =
  "// Written by kleros-ui init: what ui:check and ui:baseline lint with (eslint -c this file), the app's own lint config\n" +
  "// plus the Kleros UI preset. The app's own lint does not read this file, so its existing code passes there as before.";
// ESLint reads eslint.config.js as its package's type says: as an ES module only under "type": "module", as CommonJS
// anywhere else (an ESM eslint.config.js in a "type": "commonjs" package fails to load).
const looksEsm = (text) => /^\s*(?:import\s*[\w{*"']|export\s)/m.test(text);
// A package as Node finds it from `from` up (its folder, whatever its exports map says), or null.
function packageDir(name, from = ".") {
  for (let d = resolve(from); ; d = dirname(d)) {
    const p = join(d, "node_modules", name);
    if (existsSync(join(p, "package.json"))) return p;
    if (dirname(d) === d) return null;
  }
}

const isDir = (p) => {
  try {
    return statSync(p).isDirectory();
  } catch {
    return false;
  }
};
// The folders ui:check and ui:baseline lint, as paths from the app root: kleros-ui.json's "lintDirs" when it is set;
// else src/; else, in an app with no src/ (a Next.js app/ router), each of CODE_DIRS that is there; else src/, as
// before. `missing` holds the lintDirs entries that are not a folder here: check fails on them and baseline refuses.
// `why` says where the list comes from, for the line check prints. init passes the same folders to klerosUI() as files.
const CODE_DIRS = ["app", "pages", "components", "lib", "hooks", "utils"];
function lintTargets() {
  const { lintDirs } = config();
  if (lintDirs === undefined) {
    if (isDir("src")) return { dirs: ["src"], missing: [], why: `the default; "lintDirs" in ${CONFIG} names other folders` };
    const found = CODE_DIRS.filter(isDir);
    if (found.length) return { dirs: found, missing: [], why: `no src/ here, so those of ${dirNames(CODE_DIRS)} that are there; "lintDirs" in ${CONFIG} names others` };
    return { dirs: ["src"], missing: [], why: `the default, though there is no src/ here; set "lintDirs" in ${CONFIG} to the app's code folders` };
  }
  const own = (d) => typeof d === "string" && d.trim() && !/^\.\.(?:[\\/]|$)/.test(relative(".", resolve(d))) && !isAbsolute(relative(".", resolve(d)));
  // A lintDirs that is not a list of the app's folders would lint nothing, or the letters of a string.
  if (!(Array.isArray(lintDirs) && lintDirs.length && lintDirs.every(own)))
    throw new Error(
      `kleros-ui: "lintDirs" in ${CONFIG} is ${JSON.stringify(lintDirs)}, not a list of the app's folders: set it to the folders ui:check lints, from the app root, such as ["app", "lib"], or remove it to lint src/ (or, with no src/, those of ${dirNames(CODE_DIRS)} that are there).`,
    );
  const dirs = [...new Set(lintDirs.map((d) => toPosix(relative(".", resolve(d))) || "."))];
  return { dirs, missing: dirs.filter((d) => !isDir(d)), why: `"lintDirs" in ${CONFIG}` };
}
const dirNames = (dirs) => dirs.map((d) => (d === "." ? "the whole app folder" : `${d}/`)).join(", ");

// The klerosUI() options init writes in a lint config: kleros-ui.json's cssEntry, and files for the folders ui:check
// lints, unless that is src/ alone (the preset's own default, so an app with src/ keeps the call it had).
const PRESET_FILES = ["src/**/*.{js,jsx,ts,tsx}"];
// A folder name is a literal path: each glob character goes in a class of its own (app/[[]client[]]), so the pattern
// matches that folder only, not app/c or app/l. A class, not a backslash, which ESLint 8 on Windows reads as a path
// separator. ! @ + start a glob only before "(", which is escaped. globDirs undoes it for the names messages show.
const globEscape = (d) => d.replace(/[*?[\](){}#]/g, "[$&]");
const dirGlob = (d) => (d === "." ? "**/*.{js,jsx,ts,tsx}" : `${globEscape(d)}/**/*.{js,jsx,ts,tsx}`);
function presetOptions() {
  const { dirs } = lintTargets();
  return { cssEntry: config().cssEntry || "src/index.css", files: dirs.length === 1 && dirs[0] === "src" ? null : dirs.map(dirGlob) };
}
const presetCall = (o) => `klerosUI({ cssEntry: ${JSON.stringify(o.cssEntry)}${o.files ? `, files: [${o.files.map((g) => JSON.stringify(g)).join(", ")}]` : ""} })`;
// The klerosUI({ ... }) call in a lint config init wrote, read back whatever quotes, line breaks and trailing commas a
// formatter left: { call (its text), cssEntry, files (null for none) }. null when there is none, or when it passes
// anything but cssEntry and files as plain strings: then init leaves it, and check does not compare it.
const STR = String.raw`"(?:[^"\\\n]|\\.)*"|'(?:[^'\\\n]|\\.)*'`;
const PRESET_CALL = new RegExp(String.raw`klerosUI\(\s*\{((?:[\s\w:,[\]]|${STR})*)\}\s*\)`);
const PRESET_OPTION = new RegExp(String.raw`\b(cssEntry|files)\s*:\s*(${STR}|\[\s*(?:(?:${STR})\s*,\s*)*(?:${STR})?\s*\])\s*,?`, "g");
function readPresetCall(text) {
  const m = text.match(PRESET_CALL);
  if (!m) return null;
  const unquote = (s) => JSON.parse(s[0] === '"' ? s : `"${s.slice(1, -1).replace(/\\'/g, "'").replace(/"/g, '\\"')}"`);
  const o = { call: m[0], cssEntry: "src/index.css", files: null };
  let bad = false;
  const rest = m[1].replace(PRESET_OPTION, (all, key, value) => {
    try {
      o[key] = key === "files" ? [...value.matchAll(new RegExp(STR, "g"))].map((x) => unquote(x[0])) : unquote(value);
    } catch {
      bad = true;
    }
    return "";
  });
  return bad || rest.trim() ? null : o;
}
// How an init-written lint config's klerosUI() options differ from kleros-ui.json's cssEntry and the folders ui:check
// lints: { have, want, cssEntry, files } (true for each that differs), or null when they agree or cannot be read.
function presetDrift(text, want = presetOptions()) {
  const have = readPresetCall(text);
  if (!have) return null;
  const cssEntry = have.cssEntry !== want.cssEntry;
  const files = JSON.stringify(have.files ?? PRESET_FILES) !== JSON.stringify(want.files ?? PRESET_FILES);
  return cssEntry || files ? { have, want, cssEntry, files } : null;
}
// The folders a files list covers, for messages: a pattern init wrote for a folder shows as that folder, any other as
// the pattern itself, quoted.
const globDirs = (files) =>
  (files ?? PRESET_FILES)
    .map((g) => {
      if (g === dirGlob(".")) return dirNames(["."]);
      const d = g.endsWith("/**/*.{js,jsx,ts,tsx}") ? g.slice(0, -"/**/*.{js,jsx,ts,tsx}".length).replace(/\[(.)\]/g, "$1") : null;
      return d !== null && dirGlob(d) === g ? dirNames([d]) : JSON.stringify(g);
    })
    .join(", ");
// What init says it changed, and what check reports.
const presetDone = (d) =>
  [
    d.cssEntry && `its cssEntry is now ${JSON.stringify(d.want.cssEntry)}, as in ${CONFIG} (it was ${JSON.stringify(d.have.cssEntry)})`,
    d.files && `its files now cover ${globDirs(d.want.files)}, the folders ui:check lints (they covered ${globDirs(d.have.files)})`,
  ].filter(Boolean);
const presetProblems = (file, d) =>
  [
    d.cssEntry &&
      `${file} passes cssEntry ${JSON.stringify(d.have.cssEntry)} to klerosUI(), while "cssEntry" in ${CONFIG} is ${JSON.stringify(d.want.cssEntry)}, so the lint preset reads the Tailwind classes of another stylesheet`,
    d.files && `${file} passes klerosUI() files for ${globDirs(d.have.files)}, while ui:check lints ${globDirs(d.want.files)}, so the preset's rules skip what is outside its files`,
  ]
    .filter(Boolean)
    .map((p) => `${p}. Run npx -p @kleros/ui-components-library kleros-ui init, which rewrites it, or change it there by hand`);

// The app's config may export an array, one config object or a Promise of either, as ESLint allows: `[await app].flat()`
// takes each. With no config of the app's, `app` sets the TypeScript parser the app has (typescript-eslint, as the
// starter's config does, or @typescript-eslint/parser), so ESLint can read .ts and .tsx; with neither, it is empty.
function managedConfig(appFile, { head = MANAGED, parser = null } = {}) {
  const ts = parser === "typescript-eslint" ? ["tseslint", "tseslint.parser"] : ["tsParser", "tsParser"];
  return [
    head,
    ...(appFile ? [`import app from "./${appFile}";`] : parser ? [`import ${ts[0]} from "${parser}";`] : ["const app = [];"]),
    'import klerosUI from "@kleros/ui-components-library/eslint";',
    "",
    ...(!appFile && parser
      ? [
          `// No eslint.config.* of the app's here: the TypeScript parser from ${parser}, so ESLint can read .ts and .tsx.`,
          `const app = [{ files: ["**/*.{ts,tsx}"], languageOptions: { parser: ${ts[1]}, parserOptions: { ecmaFeatures: { jsx: true } } } }];`,
        ]
      : []),
    `export default [...[await app].flat(), ...${presetCall(presetOptions())}];`,
    "",
  ].join("\n");
}
// An app's file init would write over: refused, so its rules are not lost.
const keepAppFile = (file, why) => {
  if (taken(file)) throw new Error(`kleros-ui: ${file} is already there, and init ${why}, which would write over it. Move it away (or merge it into your own config), then run init again.`);
};

// The existing lint config wireLint will rewrite in place, or null, so init's preflight can refuse a link there before
// its first write. It makes wireLint's choices: the managed wrap an earlier init wrote, when it is stale (styled: true,
// the old spread, drifted klerosUI() options, or its app config moving to .mjs or .cjs) and stays where it is, or, in an
// existing app with no config wired to the preset, kleros-ui.eslint.config.* when its klerosUI() options drifted. A
// move to a new file writes no existing path, so a file already at the managed wrap's new path (an eslint.config.mjs
// beside a managed eslint.config.js outside a module package) is refused here, and so is one at its app config's new
// path (eslint.config.app.js moving to .mjs or .cjs, as wireLint's appName picks by its syntax), with the message that
// wireLint would give only after init's first writes. `entry()` gives the cssEntry init will record when kleros-ui.json
// is missing (null when it is there); it runs only when a config init wrote is found.
function lintRewrite(pj, { fromCreate = false, entry = () => null } = {}) {
  const want = () => {
    const cssEntry = entry();
    return cssEntry ? { ...presetOptions(), cssEntry } : presetOptions();
  };
  const current = LINT_CONFIGS.find((f) => existsSync(f));
  const text = current ? readFileSync(current, "utf8") : "";
  if (current && text.includes("ui-components-library/eslint")) {
    if (!text.startsWith(MANAGED)) return null;
    if (current === "eslint.config.js" && pj.type !== "module")
      keepAppFile("eslint.config.mjs", `would move the managed ${current} there (this package is not "type": "module", so ESLint reads .js here as CommonJS)`);
    const from = text.match(/^import app from "\.\/(eslint\.config\.app\.[cm]?[jt]s)";$/m)?.[1];
    const moves = Boolean(from && existsSync(from) && pj.type !== "module" && from.endsWith(".js"));
    if (moves) keepAppFile(`eslint.config.app.${looksEsm(readFileSync(from, "utf8")) ? "mjs" : "cjs"}`, `would move ${from} there (this package is not "type": "module", so ESLint reads .js here as CommonJS)`);
    // The managed eslint.config.js moves to eslint.config.mjs, a new file, so nothing is rewritten in place.
    if (current === "eslint.config.js" && pj.type !== "module") return null;
    const styled = /\bstyled\s*:\s*true/.test(text);
    const body = styled ? text.replace(/,\s*styled\s*:\s*true\b/g, "").replace(/\bstyled\s*:\s*true\s*,?\s*/g, "") : text;
    return styled || /\[\.\.\.app,/.test(text) || moves || presetDrift(body, want()) ? current : null;
  }
  if (fromCreate || current === "eslint.config.cts") return null;
  const own = CHECK_LINTS.find((f) => existsSync(f));
  const ownText = own ? readFileSync(own, "utf8") : "";
  return own && ownText.startsWith(CHECK_LINT_HEAD) && presetDrift(ownText, want()) ? own : null;
}

// From create (or over a config an earlier init wrapped): the app's config is eslint.config.js in a "type": "module"
// package and eslint.config.mjs anywhere else, and imports the starter's own config, which keeps its syntax (a .js one
// the package's type cannot load becomes .mjs or .cjs). A leftover eslint.config.js is removed, since ESLint would
// load it first. A config init wrote is kept, edits included, and rewritten only when stale, with a line that says
// so: `styled: true` is dropped, an ESM .js outside a module package moves to .mjs, and the cssEntry and files it passes
// to klerosUI() are set to kleros-ui.json's cssEntry and the folders ui:check lints. A config the app wired to the
// preset by hand is left alone.
// An existing app's own config is left as it is, and init writes kleros-ui.eslint.config.mjs (CHECK_LINTS) once; one
// already there is kept, edits included, its klerosUI() options brought up to date as above.
function wireLint(pj, { fromCreate = false } = {}) {
  const current = LINT_CONFIGS.find((f) => existsSync(f));
  const text = current ? readFileSync(current, "utf8") : "";
  const esm = pj.type === "module";
  const plain = esm ? "eslint.config.js" : "eslint.config.mjs";
  const appName = (file, body) => (!esm && file.endsWith(".js") ? `eslint.config.app.${looksEsm(body) ? "mjs" : "cjs"}` : file);
  const why = ` (this package is not "type": "module", so ESLint reads .js here as CommonJS)`;
  let app = null; // [where the app's own config is now, where it goes]
  let target;
  if (current && text.includes("ui-components-library/eslint")) {
    if (!text.startsWith(MANAGED)) {
      if (/\bstyled\s*:\s*true/.test(text)) console.log(`kleros-ui: ${current} passes styled: true to the preset, which ignores it now (Tailwind only for all); you can remove it`);
      return current;
    }
    const from = text.match(/^import app from "\.\/(eslint\.config\.app\.[cm]?[jt]s)";$/m)?.[1];
    const appTo = from && existsSync(from) ? appName(from, readFileSync(from, "utf8")) : from;
    const to = current === "eslint.config.js" ? plain : current;
    const styled = /\bstyled\s*:\s*true/.test(text);
    // An earlier init's wrapper spread app as an array, which an object or Promise export crashes.
    const spread = /\[\.\.\.app,/.test(text);
    // An existing app an earlier 3.11.0 init wrapped (a baseline, or components recorded as existing): its own lint
    // runs the preset too. Said, not changed, since the wrapper may hold the app's edits.
    let existing = existsSync(BASELINE);
    try {
      existing ||= config().components.some((x) => x?.status === "existing");
    } catch {
      // a broken kleros-ui.json: check names it
    }
    if (!fromCreate && from && existing)
      console.log(
        `kleros-ui: ${current} is the managed wrap an earlier init wrote, so the app's own lint (editor, lint script, pre-commit hook) reports the preset's rules on the code ui:baseline records. To keep them in ui:check only, move ${from} back to ${from.replace(/^eslint\.config\.app/, "eslint.config")}${from.replace(/^eslint\.config\.app/, "eslint.config") === current ? "" : ` and delete ${current}`}, then run init again: it leaves that config as it is and writes ${CHECK_LINTS[0]} for ui:check`,
      );
    let body = styled ? text.replace(/,\s*styled\s*:\s*true\b/g, "").replace(/\bstyled\s*:\s*true\s*,?\s*/g, "") : text;
    // klerosUI()'s cssEntry and files, stale once kleros-ui.json's cssEntry or the folders ui:check lints change.
    const drift = presetDrift(body);
    if (!styled && !spread && !drift && to === current && appTo === from) return current;
    if (appTo !== from) keepAppFile(appTo, `would move ${from} there${why}`);
    if (spread) body = body.replace(/\[\.\.\.app,/g, "[...[await app].flat(),");
    if (drift) body = body.replace(drift.have.call, () => presetCall(drift.want));
    if (appTo !== from) {
      write(appTo, readFileSync(from, "utf8"));
      body = body.replace(`"./${from}"`, `"./${appTo}"`);
    }
    write(to, body);
    if (appTo !== from) rmSync(from);
    if (to !== current) rmSync(current);
    const done = [
      styled && "dropped styled: true (the preset ignores it)",
      spread && "it now takes an app config that exports one object or a Promise",
      ...(drift ? presetDone(drift) : []),
      to !== current && `moved it to ${to}`,
      appTo !== from && `moved ${from} to ${appTo}`,
    ].filter(Boolean);
    console.log(`kleros-ui: rewrote the managed ${current}: ${done.join(", ")}${to !== current || appTo !== from ? why : ""}; the rest of it is kept as it was`);
    return to;
  } else if (current === "eslint.config.cts") {
    console.log(`kleros-ui: ${current} is CommonJS TypeScript; add the preset by hand: (await import("@kleros/ui-components-library/eslint")).default()`);
    return current;
  } else if (!fromCreate) {
    const own = CHECK_LINTS.find((f) => existsSync(f));
    if (own) {
      const ownText = readFileSync(own, "utf8");
      if (current && !ownText.includes(`"./${current}"`))
        console.log(`kleros-ui: kept ${own}, which ui:check lints with; it does not import ${current}, so ui:check runs the preset without your config's rules. Import ${current} as app there, or delete ${own} and run init again`);
      // Kept, edits included, but its klerosUI() cssEntry and files follow kleros-ui.json and the folders ui:check lints.
      const drift = ownText.startsWith(CHECK_LINT_HEAD) ? presetDrift(ownText) : null;
      if (drift) {
        write(own, ownText.replace(drift.have.call, () => presetCall(drift.want)));
        console.log(`kleros-ui: rewrote ${own}: ${presetDone(drift).join(", ")}; the rest of it is kept as it was`);
      }
      return own;
    }
    const file = current && /\.[cm]?ts$/.test(current) ? CHECK_LINTS[1] : CHECK_LINTS[0];
    const parser = current ? null : ["typescript-eslint", "@typescript-eslint/parser"].find((n) => packageDir(n));
    write(file, managedConfig(current, { head: CHECK_LINT_HEAD, parser }));
    console.log(
      current
        ? `kleros-ui: left your ${current} as it is and wrote ${file}, which imports it and adds the Kleros UI preset. ui:check and ui:baseline lint with ${file}; the app's own lint (${current}) does not report the preset's rules`
        : `kleros-ui: wrote ${file}, which ui:check and ui:baseline lint with: the Kleros UI preset${parser ? `, with the TypeScript parser from ${parser}` : ""}. There is no eslint.config.* here, so the app's own lint (a .eslintrc* or a config in a folder above) stays as it was, and its rules are not part of ui:check unless ${file} imports them as app (agent/AGENTS.md ${EXISTING_APPS})`,
    );
    return file;
  } else if (current) {
    const ext = current.slice("eslint.config".length);
    if (ext === ".js" || ext === ".mjs" || ext === ".cjs") {
      app = [current, ext === ".cjs" ? "eslint.config.app.cjs" : appName(`eslint.config.app${ext}`, text)];
      target = ext === ".mjs" ? current : plain;
    } else {
      app = [current, `eslint.config.app${ext}`]; // .ts or .mts: the app's keeps its extension
      target = current;
    }
  } else target = plain;
  if (app && app[0] !== app[1]) {
    keepAppFile(app[1], `would keep ${app[0]} there`);
    write(app[1], readFileSync(app[0], "utf8"));
  }
  const body = managedConfig(app?.[1]);
  if (!existsSync(target) || readFileSync(target, "utf8") !== body) write(target, body);
  if (current && current !== target) rmSync(current);
  // `app` is set exactly when there is a `current`, and always as [current, ...].
  if (app)
    console.log(
      `kleros-ui: kept ${fromCreate ? "the starter's" : "your"} ${current} as ${app[1]}${!esm && current.endsWith(".js") ? why : ""}; ${target} imports it with the preset${current !== target ? `, and ${current} is gone${current === "eslint.config.js" ? ", as ESLint would load it first" : ""}` : ""}`,
    );
  return target;
}

// The stylesheets a stylesheet @imports by a relative path ("./tw.css", url(../base.css)), as absolute paths with their
// offsets in it; a bare name is a package to Tailwind's own resolver, which check and the lint preset use. A quoted
// name is read in full, spaces and parentheses included, as the scan's atTarget reads it. `reference` marks Tailwind's
// @import "./x.css" reference, which loads no CSS (like @reference).
const cssImportsAt = (f) =>
  [...stripComments(readOr(f), SLASH_COMMENTS.test(f)).matchAll(/@import\s+(?:url\(\s*)?(?:"(\.{1,2}\/[^"]*)"|'(\.{1,2}\/[^']*)'|(\.{1,2}\/[^\s"');]+))\s*\)?([^;{}]*)/gi)].map(
    (m) => ({ path: resolve(dirname(f), m[1] ?? m[2] ?? m[3]), at: m.index, spec: m[1] ?? m[2] ?? m[3], reference: /(?:^|\s)reference(?:\s|$)/i.test(m[4]) }),
  );
const cssImports = (f) => cssImportsAt(f).map((i) => i.path);
// Whether a stylesheet imports tailwindcss (or uses @tailwind), itself or through the stylesheets it @imports.
function reachesTailwind(f, seen = new Set()) {
  const abs = resolve(f);
  if (seen.has(abs)) return false;
  seen.add(abs);
  return TW_ENTRY.test(stripComments(readOr(abs), SLASH_COMMENTS.test(abs))) || cssImports(abs).some((g) => reachesTailwind(g, seen));
}
// The app's Tailwind entries, among the stylesheets the CSS scan finds: each one that reaches tailwindcss and that no
// other one @imports. An app whose src/index.css starts with @import "./tw.css" (tw.css holding the tailwindcss import)
// has src/index.css: the lint preset reads the entry alone, so tw.css would lack the library's theme.css.
const tailwindEntries = () => {
  const files = cssFiles(["."]).files.filter((f) => STYLESHEET.test(f));
  const imported = new Set(files.flatMap((f) => cssImports(f).filter((g) => g !== resolve(f))));
  return files.filter((f) => !imported.has(resolve(f)) && reachesTailwind(f)).map((f) => toPosix(relative(".", f)));
};
// The kleros-ui.json init writes (and new, when it runs first, so init does not then skip the app's components). An
// existing app's components predate the rules: they are recorded as existing, so check holds only new ones to them.
// Folders and single files alike (Court keeps most of its components as one .tsx file each). cssEntry is the app's
// one stylesheet that imports tailwindcss (Escrow's src/global.css), else src/index.css, the starter's.
// The cssEntry init records: the app's one Tailwind entry, else src/index.css, the starter's.
const detectedEntry = () => {
  const entries = tailwindEntries();
  return { entries, cssEntry: entries.length === 1 ? entries[0] : "src/index.css" };
};
function initialConfig() {
  const dir = "src/components";
  const existing = existsSync(dir)
    ? readdirSync(dir, { withFileTypes: true }).flatMap((d) =>
        d.isDirectory()
          ? [{ name: d.name, status: "existing" }]
          : COMPONENT_FILE.test(d.name)
            ? [{ name: d.name.replace(/\.tsx$/, ""), status: "existing", file: join(dir, d.name) }]
            : [],
      )
    : [];
  const { entries, cssEntry } = detectedEntry();
  if (cssEntry !== "src/index.css") console.log(`kleros-ui: recorded "cssEntry": "${cssEntry}" in ${CONFIG}, the stylesheet that imports tailwindcss (or @imports the one that does)`);
  else if (entries.length > 1 && !entries.includes(cssEntry))
    console.log(
      `kleros-ui: ${entries.join(", ")} all import tailwindcss; set "cssEntry" in ${CONFIG} to the app's Tailwind entry (it says src/index.css), then run init again, which sets the same entry in the cssEntry the lint config passes to klerosUI()`,
    );
  return { componentsDir: dir, cssEntry, components: existing };
}
const recorded = (c) => c.components.length && console.log(`kleros-ui: recorded ${c.components.length} existing components in ${CONFIG}; check skips them`);

// A workspace root lists other packages: a non-empty "workspaces" in package.json (an array, or the { packages: [...] }
// of Yarn 1 and Bun), or a top-level packages: list in pnpm-workspace.yaml. "workspaces": [] lists none, and pnpm keeps
// a single app's own settings in pnpm-workspace.yaml (pnpm config set --location project writes them there) with no
// packages: key; both are apps. Why this folder is a workspace root, or null.
function workspaceRoot(pj) {
  const list = Array.isArray(pj.workspaces) ? pj.workspaces : pj.workspaces?.packages;
  if (Array.isArray(list) && list.length) return `its package.json has "workspaces": ${JSON.stringify(pj.workspaces)}`;
  const yaml = readOr("pnpm-workspace.yaml").replace(/\r\n?/g, "\n");
  const key = yaml.match(/^["']?packages["']?[ \t]*:(.*)$/m);
  if (!key) return null;
  // packages: [a, b] on the key's line, or a "- a" item on the first line below it that is not blank or a comment.
  const value = key[1].replace(/(^|\s)#.*$/, "").trim();
  const below = yaml.slice(key.index + key[0].length).split("\n").slice(1).find((l) => l.trim() && !/^\s*#/.test(l));
  const listed = value ? !/^(\[\s*\]|~|null)$/.test(value) : below !== undefined && /^\s*-(\s|$)/.test(below);
  return listed ? "its pnpm-workspace.yaml has a packages: list" : null;
}

function init({ fromCreate = false } = {}) {
  const pj = readJson("package.json", null);
  if (!pj) throw new Error("kleros-ui: run init in the app root (no package.json here)");
  // A workspace root holds no app: init there would wire the root's lint config and scripts, not the app's.
  const root = fromCreate ? null : workspaceRoot(pj);
  if (root)
    throw new Error(
      `kleros-ui init: this folder is a workspace root (${root}), not an app. Run init in the app's own folder, the one with the app's package.json and src/ (web/ in a monorepo). Nothing was written.`,
    );
  // Plus a kleros-ui.eslint.config.* that is a dangling link, which wireLint would write through, and the lint config
  // wireLint rewrites in place (lintRewrite): a link there to a file outside the app stops init here, before its first
  // write, not after it.
  const dangling = fromCreate ? [] : CHECK_LINTS.filter((f) => taken(f) && !existsSync(f));
  const rewrite = lintRewrite(pj, { fromCreate, entry: () => (existsSync(CONFIG) ? null : detectedEntry().cssEntry) });
  const problems = [...initWrites(), ...dangling, ...(rewrite ? [rewrite] : [])].map((f) => writeProblem(f)).filter(Boolean);
  if (problems.length) throw new Error(`kleros-ui init: ${problems.join("; ")}. ${WRITES_ONLY}. Nothing was written.`);
  // The lint config's klerosUI() options come from kleros-ui.json: one that is not valid JSON, or a "lintDirs" that is
  // not a list of folders, stops init here, before its first write.
  if (existsSync(CONFIG)) lintTargets();
  writeBlock("AGENTS.md");
  const claude = !sameFile("CLAUDE.md", "AGENTS.md");
  if (claude) pointer(POINTERS[0]);
  pointer(POINTERS[1]);
  if (!existsSync(CONFIG)) {
    const c = initialConfig();
    writeJson(CONFIG, c);
    recorded(c);
  }
  pj.scripts = { ...pj.scripts, "ui:check": "kleros-ui check", "ui:baseline": "kleros-ui baseline" };
  writeJson("package.json", pj);
  const lint = wireLint(pj, { fromCreate });
  console.log(`kleros-ui ${pkg.version}: wrote AGENTS.md block, ${claude ? "CLAUDE.md and Cursor pointers" : "the Cursor pointer (CLAUDE.md is AGENTS.md)"}, ${CONFIG}, ${lint}, ui:check`);
  // A lint config with no config of the app's own and no TypeScript parser to set cannot parse a .ts or .tsx file;
  // check fails on each one, and baseline refuses (parseErrors).
  const lintText = readFileSync(lint, "utf8");
  if ((lintText.startsWith(MANAGED) || lintText.startsWith(CHECK_LINT_HEAD)) && /^const app = \[\];$/m.test(lintText))
    console.log(
      `kleros-ui: warning: ${lint} has the Kleros UI preset only (const app = []; there is no eslint.config.* here to import, and neither typescript-eslint nor @typescript-eslint/parser is installed), so it sets no TypeScript parser: ESLint cannot parse a .ts or .tsx file, ui:check fails on each one and ui:baseline refuses. Add typescript-eslint as a devDependency, then delete ${lint} and run init again, or set app in ${lint} to a config with the parser: [{ files: ["**/*.{ts,tsx}"], languageOptions: { parser: tseslint.parser } }]. Then run npm run ui:baseline.`,
    );
  // init adds no packages and leaves the build config alone; the block's step 0 and ui:check say what
  // is missing.
  if (!hasTailwind(pj))
    console.log(`kleros-ui: this app has no Tailwind (tailwindcss is not in package.json). Add it first: ${libPath()}/agent/AGENTS.md ${EXISTING_APPS}. npm run ui:check fails until it is there.`);
  const react = reactProblems();
  if (react.length) console.log(`kleros-ui: warning: ${reactProblem(react)}. npm run ui:check fails until the app is on React 18.`);
  // As check finds it: from the app's copy of the library, so a plugin a workspace root declares counts. Before the app
  // installs the library there is no copy to look from, and the app's package.json decides.
  const libDir = appLibraryDir();
  if (libDir ? pluginProblem(realOrNull(libDir) ?? libDir) : !declared(pj, TW_PLUGIN))
    console.log(`kleros-ui: the lint preset's Tailwind rules need ${TW_PLUGIN} as a devDependency; npm run ui:check fails until it is there`);
  if (!fromCreate) console.log("kleros-ui: in an existing app, run `npm run ui:baseline` once, so check holds only new code to the look");
}

// ---- create: a new app's setup in one command, so no one writes it by hand or skips init ----
const STARTER = join(PKG_DIR, "templates/poc");
const PLACEHOLDER_NAME = "kleros-poc";
// npm leaves .gitignore out of a package, so the starter ships it as gitignore.
const RENAMED = { gitignore: ".gitignore" };
// Written only when absent, and never a reason to refuse.
const OPTIONAL = new Set([".gitignore"]);

function listFiles(root, rel = "") {
  return readdirSync(join(root, rel), { withFileTypes: true }).flatMap((d) => {
    const r = rel ? `${rel}/${d.name}` : d.name;
    return d.isDirectory() ? listFiles(root, r) : [r];
  });
}

// npm names are lower case, with no spaces.
const npmName = (dir) =>
  basename(dir).toLowerCase().replace(/[^a-z0-9._~-]+/g, "-").replace(/^[._-]+/, "").replace(/-+$/, "") || "kleros-app";

// A URL or another scheme (https:, git+ssh:, github:, npm:) is npm's to resolve, never a local path, even when it ends
// in .tgz. Two letters at least, so a Windows drive (C:\x.tgz) still counts as a path.
const hasScheme = (s) => /^[a-z][a-z0-9+.-]+:/i.test(s) && !/^file:/i.test(s);
const isLocalSpec = (s) => !hasScheme(s) && (/^(file:|\.{1,2}[\\/])/.test(s) || isAbsolute(s) || /\.(tgz|tar\.gz)$/.test(s));

// The library spec for the app's package.json. A relative tarball or folder path becomes file:<path from the app>, as
// npm itself writes it; an absolute one stays absolute, so the app still finds it after a move. A URL is
// written as given.
function libSpec(given, dir) {
  if (given) {
    // The npm install form, `--lib @kleros/ui-components-library@3.11.0`: npm reads a dependency value with a slash as
    // a folder, so keep only the version or range.
    if (given === LIB) return "latest";
    if (given.startsWith(`${LIB}@`)) given = given.slice(LIB.length + 1);
    if (!isLocalSpec(given)) return given;
    const path = given.replace(/^file:/, "");
    return isAbsolute(path) ? `file:${path}` : `file:${toPosix(relative(dir, resolve(path))) || "."}`;
  }
  // `npx -p ./vendor/x.tgz kleros-ui create my-app`: npm passes the -p spec in npm_config_package, relative to the folder
  // npx ran in. Used when it is one URL, or one local path that exists; a registry spec gets ^version below.
  const fromNpx = process.env.npm_config_package || "";
  if (fromNpx && !fromNpx.includes("\n")) {
    if (hasScheme(fromNpx)) return fromNpx;
    if (isLocalSpec(fromNpx) && existsSync(resolve(fromNpx.replace(/^file:/, "")))) return libSpec(fromNpx, dir);
  }
  return `^${pkg.version}`;
}

function parseCreate(args) {
  const o = { dir: undefined, lib: undefined, install: true };
  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if (a === "--no-install") o.install = false;
    else if (a === "--lib" || a.startsWith("--lib=")) {
      o.lib = a === "--lib" ? args[++i] : a.slice("--lib=".length);
      if (!o.lib) throw new Error("kleros-ui create: --lib needs a spec, e.g. --lib ./vendor/x.tgz or --lib 3.11.0");
    } else if (a.startsWith("-")) throw new Error(`kleros-ui create: unknown option ${a}`);
    else if (o.dir === undefined) o.dir = a;
    else throw new Error(`kleros-ui create: one folder only (got ${o.dir} and ${a})`);
  }
  if (!o.dir) throw new Error("kleros-ui create: name the folder: kleros-ui create my-app (or . for this one)");
  return o;
}

// ---- React 18 only (`create .` into a React 19 package.json would write the starter, then npm install would
// fail with ERESOLVE). A small semver reader, Node built-ins only: || alternatives, hyphen ranges, ^ ~ >= > <= < =,
// x-ranges and npm: aliases. It answers only whether a range leaves out every 18.x release; a spec it cannot read
// (file:, a URL, git, workspace:, a dist-tag) is not judged, so a valid create is never refused by a guess.
// Dist-tags (latest, next, ...) are not judged either. npm installs a tag next to the library's React 18
// peer range as it installs "*": `latest` locks react 18.3.1, even with a lockfile already on 19.
// [major, minor, patch, 1 for a release or 0 for a prerelease, which sorts before it]
const cmpVersion = (a, b) => a[0] - b[0] || a[1] - b[1] || a[2] - b[2] || a[3] - b[3];
const SEMVER = /^v?(\d+|[xX*])(?:\.(\d+|[xX*]))?(?:\.(\d+|[xX*]))?(-[0-9A-Za-z.-]+)?(?:\+[0-9A-Za-z.-]+)?$/;
// One comparator as an interval { lo, loIn, hi, hiIn } (null = unbounded), or "none" when nothing matches, or
// undefined when it cannot be read.
function comparator(c) {
  const m = c.match(/^(>=|<=|>|<|=|\^|~>?|)(.*)$/);
  const v = m[2].match(SEMVER);
  if (!v) return undefined;
  const op = m[1] === "~>" ? "~" : m[1];
  const n = [v[1], v[2], v[3]].map((x) => (x === undefined || /^[xX*]$/.test(x) ? null : Number(x)));
  for (let i = 1; i < 3; i++) if (n[i - 1] === null) n[i] = null;
  const [M, mi, p] = n;
  const any = { lo: null, hi: null };
  if (M === null) return op === ">" || op === "<" ? "none" : any;
  const floor = [M, mi ?? 0, p ?? 0, v[4] ? 0 : 1];
  const bottom = (x) => [...x, 0]; // the lowest version of a major.minor.patch, its first prerelease
  const above = mi === null ? bottom([M + 1, 0, 0]) : p === null ? bottom([M, mi + 1, 0]) : null; // past a partial
  switch (op) {
    case "":
    case "=":
      return above ? { lo: bottom([M, mi ?? 0, 0]), loIn: true, hi: above, hiIn: false } : { lo: floor, loIn: true, hi: floor, hiIn: true };
    case "^": {
      const hi = M > 0 || mi === null ? [M + 1, 0, 0] : mi > 0 || p === null ? [0, mi + 1, 0] : [0, 0, p + 1];
      return { lo: floor, loIn: true, hi: bottom(hi), hiIn: false };
    }
    case "~":
      return { lo: floor, loIn: true, hi: bottom(mi === null ? [M + 1, 0, 0] : [M, mi + 1, 0]), hiIn: false };
    case ">=":
      return { lo: floor, loIn: true, hi: null };
    case ">":
      return above ? { lo: above, loIn: true, hi: null } : { lo: floor, loIn: false, hi: null };
    case "<":
      return { lo: null, hi: above ? bottom([M, mi ?? 0, 0]) : floor, hiIn: false };
    case "<=":
      return above ? { lo: null, hi: above, hiIn: false } : { lo: null, hi: floor, hiIn: true };
  }
  return undefined;
}
// true when the range leaves out every 18.x release, false when it allows one, null when it cannot be read.
function excludesReact18(spec) {
  let s = String(spec).trim();
  const alias = s.match(/^npm:(?:@[^/@]+\/)?[^@]+@(.*)$/);
  if (alias) s = alias[1].trim();
  if (/^[a-z][\w+.-]*:|[/\\]/i.test(s)) return null; // file:, link:, workspace:, git, a URL or a path
  const window = { lo: [18, 0, 0, 1], loIn: true, hi: [19, 0, 0, 0], hiIn: false };
  let readable = true;
  const meets = (alt) => {
    const hyphen = alt.match(/^(\S+)\s+-\s+(\S+)$/);
    const parts = hyphen ? [`>=${hyphen[1]}`, `<=${hyphen[2]}`] : alt.replace(/(>=|<=|>|<|=|\^|~>?)\s+/g, "$1").split(/\s+/).filter(Boolean);
    let r = { ...window };
    for (const part of parts) {
      const c = comparator(part);
      if (c === undefined) return (readable = false);
      if (c === "none") return false;
      if (c.lo && (!r.lo || cmpVersion(c.lo, r.lo) > 0 || (cmpVersion(c.lo, r.lo) === 0 && !c.loIn))) r = { ...r, lo: c.lo, loIn: c.loIn };
      if (c.hi && (!r.hi || cmpVersion(c.hi, r.hi) < 0 || (cmpVersion(c.hi, r.hi) === 0 && !c.hiIn))) r = { ...r, hi: c.hi, hiIn: c.hiIn };
    }
    const d = cmpVersion(r.lo, r.hi);
    return d < 0 || (d === 0 && r.loIn && r.hiIn);
  };
  const alts = s.split("||").map((a) => a.trim());
  const any = alts.map(meets).some(Boolean);
  return readable ? !any : any ? false : null;
}
// The react and react-dom specs in a package.json that leave out React 18, as "react ^19.0.0".
const reactConflicts = (pj) =>
  ["dependencies", "devDependencies"].flatMap((field) =>
    ["react", "react-dom"].filter((n) => pj?.[field]?.[n] !== undefined && excludesReact18(pj[field][n]) === true).map((n) => `${n} ${pj[field][n]}`),
  );
// What init warns about and check fails on in an existing app that is not on React 18: the react and react-dom copies
// the library resolves (from the app's copy of it, through a pnpm link, else from the app) when their version leaves
// out 18, and the package.json specs reactConflicts finds. npm stops a React 19 install with ERESOLVE; Yarn 4 and
// pnpm only warn and install it, so init and check are where the app learns. [] when React is 18, or not there.
// A setup problem, not a note: the peer range is ^18, and nothing beyond a render smoke has run under React 19.
function reactProblems() {
  const lib = appLibraryDir();
  // Before the app installs the library (create --no-install, init through npx first), what resolves from here can be a
  // parent folder's React (a monorepo root), not the app's: only its package.json is read then.
  const from = lib && (realOrNull(lib) ?? lib);
  const installed = ["react", "react-dom"].flatMap((n) => {
    const d = from && packageDir(n, from);
    const v = d && readOr(join(d, "package.json")).match(/"version"\s*:\s*"([^"]+)"/)?.[1];
    return v && excludesReact18(v) === true ? [`${n} ${v} is installed`] : [];
  });
  return [...installed, ...reactConflicts(readJson("package.json", {})).map((c) => `package.json asks for ${c}`)];
}
const reactProblem = (found) =>
  `React 18 only: ${found.join(", ")}. ${LIB} ${pkg.version} supports React 18 (its peer range is react ${pkg.peerDependencies?.react ?? "^18.0.0"})${found.some((f) => /(?:^|[^\d.])(?:19|[2-9]\d)(?:\.|\b)/.test(f)) ? "; React 19 is not supported yet and is not tested in apps" : ""}. Set react and react-dom to ^18.3.1 in package.json and reinstall`;

const taken = (p) => {
  try {
    lstatSync(p);
    return true;
  } catch {
    return false;
  }
};
// What create writes into dir and what there would stop it (starterPlan, below).
// What a build or prebuild script runs: the build check (no baseline), or ui:check / plain `kleros-ui check` (baseline).
const BUILD_CHECK = /\bkleros-ui check --build\b/;
const UI_CHECK = /\bkleros-ui check\b|\bui:check\b/;
const scriptText = (s) => (typeof s === "string" ? s : "");
const validScripts = (s) =>
  Object.fromEntries(Object.entries(s && typeof s === "object" && !Array.isArray(s) ? s : {}).filter(([, v]) => typeof v === "string" && v.trim()));

function starterPlan(dir, old) {
  // The starter's eslint.config.js is an ES module, which ESLint loads as one only in a "type": "module"
  // package (a merge adds "type": "module" when the package.json has no type). Elsewhere it is written as .mjs. So is
  // vite.config.ts as .mts: Vite bundles a .ts config as CommonJS there, and its require() of @tailwindcss/vite (an ES
  // module only) fails on a Node without require(esm) (before 20.19, and 22.0 to 22.11). The starter's tsconfig
  // includes src only, so the name changes nothing else.
  const renamed = old?.type && old.type !== "module" ? { ...RENAMED, "eslint.config.js": "eslint.config.mjs", "vite.config.ts": "vite.config.mts" } : RENAMED;
  const files = listFiles(STARTER)
    .filter((f) => f !== "package.json")
    .map((f) => ({ from: f, to: f.split("/").map((p) => renamed[p] || p).join("/") }));
  // Refuse only what would be overwritten: a new app's folder may already hold .git, vendor/ or notes, and an
  // `npm install ./vendor/x.tgz` leaves a package.json, which is merged below. A file (or a broken link) where the
  // starter needs a folder, such as a file named src, counts too, so a refused create still writes nothing.
  const notFolder = (p) => taken(p) && !(existsSync(p) && statSync(p).isDirectory());
  const folders = [...new Set(files.flatMap((f) => f.to.split("/").slice(0, -1).map((_, i, a) => a.slice(0, i + 1).join("/"))))];
  const clash = [
    ...folders.filter((d) => notFolder(join(dir, d))).map((d) => `${d} (not a folder)`),
    ...files.filter((f) => !OPTIONAL.has(f.to) && taken(join(dir, f.to))).map((f) => f.to),
  ];
  // The starter brings its own lint config, and ESLint loads only the first eslint.config.* it finds. The starter's
  // is written as .mjs outside a module package, so an app's eslint.config.js or .cjs does not have the same name:
  // init would wrap the app's file and write over the starter's (its TypeScript parser lost), or the app's would stay
  // on disk unread. So an app's lint config of any name is refused, not only one of the same name.
  const starterLint = files.find((f) => f.from === "eslint.config.js")?.to;
  const lintClash = LINT_CONFIGS.filter((f) => f !== starterLint && taken(join(dir, f)));
  // init, which create runs, keeps the starter's lint config as eslint.config.app.js (.mjs): one already there would
  // be written over.
  const starterApp = starterLint?.replace(/^eslint\.config/, "eslint.config.app");
  if (starterApp && taken(join(dir, starterApp))) clash.push(starterApp);
  // Vite too loads only the first vite.config.* it finds, .js and .mjs before the starter's .ts (and .ts and .cjs
  // before its .mts), so an app's config of any other name would leave the starter's plugins (Tailwind, React)
  // unloaded, or itself go unread.
  const starterVite = files.find((f) => /^vite\.config\./.test(f.to))?.to;
  const viteClash = VITE_CONFIGS.filter((f) => f !== starterVite && taken(join(dir, f)));
  // ui:check and ui:baseline lint with a kleros-ui.eslint.config.* when there is one, and init (which create runs)
  // keeps one that is there, so a leftover would stand in for the starter's lint config and its Kleros preset.
  const checkClash = CHECK_LINTS.filter((f) => taken(join(dir, f)));
  return { files, folders, clash, lintClash, starterLint, viteClash, starterVite, checkClash };
}

function create({ dir: target, lib, install }) {
  const here = process.cwd();
  const dir = resolve(target);
  if (existsSync(dir) && !statSync(dir).isDirectory()) throw new Error(`kleros-ui create: ${target} is a file`);
  if (!existsSync(STARTER)) throw new Error(`kleros-ui create: this package has no starter (${STARTER})`);
  const pjFile = join(dir, "package.json");
  let old;
  try {
    old = readJson(pjFile, null);
  } catch (e) {
    throw new Error(`kleros-ui create: ${toPosix(relative(here, pjFile))} is not valid JSON (${e.message}); fix it, then run create again`);
  }
  // React 18 only: refused before anything is written, so the folder stays as it was.
  const conflicts = reactConflicts(old);
  if (conflicts.length) {
    console.error(
      `kleros-ui create: ${toPosix(relative(here, pjFile))} asks for ${conflicts.join(" and ")}, which leaves out React 18. ${LIB} needs React 18 (its peer range is ^18; React 19 is not supported yet). Set react and react-dom to ^18.3.1 (the starter's) in that package.json, then run create again. Nothing was written.`,
    );
    process.exit(1);
  }
  const { files, folders, clash, lintClash, starterLint, viteClash, starterVite, checkClash } = starterPlan(dir, old);
  if (clash.length || lintClash.length || viteClash.length || checkClash.length) {
    const all = [...clash, ...lintClash, ...viteClash, ...checkClash];
    const them = all.length > 1 ? "them" : "it";
    const why = [
      clash.length && `create would overwrite ${clash.length > 1 ? "them" : "it"}`,
      lintClash.length &&
        `create writes the starter's own lint config (${starterLint}) and ESLint reads only one, so ${lintClash.join(" and ")} would be dropped`,
      viteClash.length &&
        `create writes the starter's ${starterVite} and Vite reads only the first vite.config.* it finds, so ${viteClash.join(" and ")} or the starter's (with its Tailwind and React plugins) would go unread`,
      checkClash.length &&
        `ui:check and ui:baseline would lint with ${checkClash.join(" and ")} instead of the starter's ${starterLint} and its Kleros preset`,
    ].filter(Boolean);
    console.error(`kleros-ui create: ${target} already has ${all.join(", ")}; ${why.join("; ")}. Move ${them} away, or create in a new folder.`);
    process.exit(1);
  }
  // Nothing goes through a link or outside the new app's folder: create's files and init's are checked before the
  // first write, so a refused create writes nothing. A folder that is not there yet holds no link.
  const root = realOrNull(dir);
  if (root) {
    const dests = [
      ...folders.map((d) => [join(dir, d), true]),
      ...files.filter((f) => !(OPTIONAL.has(f.to) && existsSync(join(dir, f.to)))).map((f) => [join(dir, f.to), false]),
      ...initWrites(dir).map((f) => [f, false]),
    ];
    const links = [...new Set(dests.map(([p, folder]) => writeProblem(p, { folder, root })).filter(Boolean))];
    if (links.length) throw new Error(`kleros-ui create: ${links.join("; ")}. ${WRITES_ONLY}. Nothing was written.`);
  }
  warnAncestorInstall(dir, target, lib);
  mkdirSync(dir, { recursive: true });
  APP_ROOT = realpathSync(dir);
  const starter = JSON.parse(readFileSync(join(STARTER, "package.json"), "utf8"));
  const kept = [];
  const keptScripts = [];
  let buildNote = null;
  let pj;
  if (old) {
    // Merge: add what is missing, never change a spec that is there (so never a downgrade). --lib, when given, wins.
    pj = { ...old };
    for (const [k, v] of Object.entries(starter))
      if (!["name", "scripts", "dependencies", "devDependencies"].includes(k) && !(k in pj)) pj[k] = v;
    // A script that is not a non-empty string is no script (npm drops it too), so the starter's fills its place.
    const ownScripts = validScripts(old.scripts);
    pj.scripts = { ...starter.scripts, ...ownScripts };
    for (const [name, cmd] of Object.entries(starter.scripts || {}))
      if (ownScripts[name] !== undefined && ownScripts[name] !== cmd) keptScripts.push(`${name} (the starter's is ${cmd})`);
    // The starter's build runs `kleros-ui check --build` first. An app's own build is kept, so the check goes in a
    // prebuild, which npm, pnpm, Yarn 1 and bun run before `build` (Yarn 2+ and --ignore-scripts do not). An app's own
    // prebuild is kept too, and then nothing runs the check at build time: create says so. Only the --build check
    // counts (plain `kleros-ui check` or ui:check honours the baseline), and a script that is not a string is no
    // script.
    if (ownScripts.build !== undefined) {
      const [b, p] = [ownScripts.build, ownScripts.prebuild].map(scriptText);
      if (!BUILD_CHECK.test(b) && !BUILD_CHECK.test(p)) {
        if (ownScripts.prebuild === undefined) {
          pj.scripts.prebuild = "kleros-ui check --build";
          buildNote = "kleros-ui: kept your build script and added \"prebuild\": \"kleros-ui check --build\", so npm run build runs the checks first (npm, pnpm and Yarn 1 run a prebuild; Yarn 2+ and --ignore-scripts skip it)";
        } else if (UI_CHECK.test(b) || UI_CHECK.test(p))
          buildNote = `kleros-ui: kept your build and prebuild scripts. They run ui:check, which skips what kleros-ui-baseline.json lists; for the checks with no baseline, put "kleros-ui check --build && " in front of your prebuild (${p})`;
        else
          buildNote = `kleros-ui: kept your build and prebuild scripts, so npm run build does not run the checks. Put "kleros-ui check --build && " in front of your prebuild (${p}), or run npm run ui:check before each build`;
      }
    }
    const has = (name) => old.dependencies?.[name] ?? old.devDependencies?.[name];
    for (const field of ["dependencies", "devDependencies"]) {
      pj[field] = { ...old[field] };
      for (const [name, spec] of Object.entries(starter[field] || {})) {
        if (has(name) === undefined) pj[field][name] = name === LIB ? libSpec(lib, dir) : spec;
        else if (name !== LIB && has(name) !== spec) kept.push(`${name} ${has(name)} (the starter has ${spec})`);
      }
    }
    if (lib && has(LIB) !== undefined) pj[old.dependencies?.[LIB] !== undefined ? "dependencies" : "devDependencies"][LIB] = libSpec(lib, dir);
    if (old.type && old.type !== "module")
      console.log(
        `kleros-ui: package.json says "type": "${old.type}", so the starter's lint config is written as eslint.config.mjs and its Vite config as vite.config.mts (ESLint reads .js as CommonJS here, and Vite loads a .ts config as CommonJS, which cannot load @tailwindcss/vite on a Node without require(esm))`,
      );
  } else {
    pj = { ...starter, dependencies: { ...starter.dependencies, [LIB]: libSpec(lib, dir) } };
  }
  if (!pj.name || pj.name === PLACEHOLDER_NAME) {
    pj = { name: "", ...pj }; // first, as npm init puts it
    pj.name = npmName(dir);
  }
  for (const f of files) {
    const to = join(dir, f.to);
    if (OPTIONAL.has(f.to) && existsSync(to)) continue;
    mkdir(dirname(to));
    guard(to);
    copyFileSync(join(STARTER, f.from), to);
  }
  writeJson(pjFile, pj);
  const spec = pj.dependencies?.[LIB] ?? pj.devDependencies?.[LIB];
  console.log(`kleros-ui: ${old ? "merged the starter into" : "copied the starter to"} ${target} (${pj.name}; ${LIB} ${spec})`);
  if (kept.length) console.log(`kleros-ui: kept your ${kept.join(", ")}`);
  if (keptScripts.length) console.log(`kleros-ui: kept your scripts ${keptScripts.join(", ")}`);
  if (buildNote) console.log(buildNote);

  if (install) {
    console.log(`kleros-ui: npm install in ${target}`);
    const r = spawnSync("npm", ["install", "--no-fund", "--no-audit"], { cwd: dir, stdio: "inherit" });
    // npm did not start (none in PATH): nothing to do with the library spec.
    if (r.error) {
      console.error(
        `kleros-ui create: ${spawnFailed("npm", r.error)}, so nothing was installed in ${target}; the starter's files are in place. Install there with your package manager, then run npx -p @kleros/ui-components-library kleros-ui init --from-create there.`,
      );
      process.exit(1);
    }
    if (r.status !== 0) {
      console.error(
        `kleros-ui create: npm install failed in ${target}; the starter's files are in place. Fix the cause (a version not on the registry: set ${LIB} in its package.json to the tarball, as file:<path from the app>), then run npm install and npx -p @kleros/ui-components-library kleros-ui init --from-create there.`,
      );
      process.exit(1);
    }
    // npm can exit 0 and still not install the library: it reads a spec it cannot use as a folder path and links a
    // folder that does not exist. A library hoisted to a parent's node_modules (a workspace) is fine.
    const own = join(dir, "node_modules", LIB);
    if (!existsSync(join(own, "package.json")) && (taken(own) || !installedAbove(dir))) {
      console.error(
        `kleros-ui create: npm install exited 0, but ${LIB} is not installed in ${target}: npm could not use the spec ${spec}. Set ${LIB} in its package.json to a version (e.g. ^${pkg.version}) or to the tarball as file:<path>, then run npm install and npx -p @kleros/ui-components-library kleros-ui init --from-create there.`,
      );
      process.exit(1);
    }
  }
  // init through the app's own copy, so the agent block names the installed version and its path in node_modules.
  const installed = join(dir, "node_modules", LIB, "bin/kleros-ui.mjs");
  if (existsSync(installed)) {
    const r = spawnSync(process.execPath, [installed, "init", "--from-create"], { cwd: dir, stdio: "inherit" });
    if (r.error) console.error(`kleros-ui create: ${spawnFailed(process.execPath, r.error)}, so init did not run in ${target}`);
    if (r.status !== 0) process.exit(r.status ?? 1);
  } else {
    if (install) console.log(`kleros-ui: the installed ${LIB} has no kleros-ui CLI; ran init from ${pkg.version}`);
    process.chdir(dir);
    LIB_PATH = `node_modules/${LIB}`;
    init({ fromCreate: true });
  }
  const cd = relative(here, dir);
  console.log("\nNext steps:");
  if (cd) console.log(`  cd ${shellQuote(cd)}`);
  if (!install) console.log("  npm install");
  console.log("  npm run ui:check   tsc, the look lint, the app's CSS and the component registry: the definition of done");
  const [sb, sp] = [pj.scripts.build, pj.scripts.prebuild].map(scriptText);
  const how = BUILD_CHECK.test(sb)
    ? ", which runs kleros-ui check --build"
    : BUILD_CHECK.test(sp)
      ? ", with kleros-ui check --build in its prebuild"
      : UI_CHECK.test(sb) || UI_CHECK.test(sp)
        ? ", which runs ui:check (the baseline applies)"
        : ", which does not run the checks";
  console.log(
    pj.scripts.build === starter.scripts.build
      ? "  npm run build      runs kleros-ui check --build first"
      : `  npm run build      your own build script${how}; the starter's is ${starter.scripts.build}`,
  );
  console.log("Coding agents: read the kleros-ui block in AGENTS.md before writing UI.");
}

// A path as it can be pasted into a shell: quoted when it has a space or any other special character.
const shellQuote = (p) => (/^[\w@%+=:,./-]+$/.test(p) ? p : `'${p.replace(/'/g, `'\\''`)}'`);

// True when a folder above `dir` has the library in its node_modules (a workspace root that hoists it).
function installedAbove(dir) {
  for (let d = dirname(dir); d !== dirname(d); d = dirname(d)) if (existsSync(join(d, "node_modules", LIB, "package.json"))) return true;
  return false;
}

// `npm install ./x.tgz` in a folder with no package.json installs into the nearest folder above it that has one (or a
// node_modules): it changes that project's package.json, lockfile and node_modules, and `npx -p @kleros/ui-components-library kleros-ui` then runs
// that copy. Said before anything is written, so the user knows what to undo.
function warnAncestorInstall(dir, target, lib) {
  if (lib || existsSync(join(dir, "package.json")) || libSpec(undefined, dir) !== `^${pkg.version}`) return;
  const at = PKG_DIR.lastIndexOf(`${sep}node_modules${sep}`);
  if (at < 0 || PKG_DIR.includes(`${sep}_npx${sep}`)) return;
  const root = PKG_DIR.slice(0, at);
  let here = dir;
  try {
    here = realpathSync(dir);
  } catch {
    // not created yet: compare the path as given
  }
  if (!here.startsWith(root + sep)) return;
  const rootPj = readJson(join(root, "package.json"), {});
  const spec = rootPj.dependencies?.[LIB] ?? rootPj.devDependencies?.[LIB];
  if (!spec?.startsWith("file:")) return;
  console.error(
    `kleros-ui: warning: ${target} has no package.json, and this kleros-ui is the copy installed in ${root} (its package.json has ${LIB} ${spec}). npm installs into the nearest folder that has a package.json, so if you ran \`npm install <tarball>\` in ${target}, it changed ${root}'s package.json, lockfile and node_modules instead: undo that there. Next time, run \`echo '{}' > package.json\` in the new folder before \`npm install <tarball>\`.`,
  );
}

// ---- new ----
// `new <Name> [--kind ui|data|form] [--intent "words, more words"]`. --intent is comma-separated,
// as the guide shows it; each part, trimmed, is one intent word (a phrase is one word: "period badge"). Words left
// unquoted (`--intent period badge`) would be read as extra arguments, so anything new does not take is refused.
function parseNew(args) {
  const o = { name: args[0], kind: "ui", intent: null };
  if (o.name.startsWith("-")) throw new Error('kleros-ui new: the name comes first: kleros-ui new <Name> --kind ui|data|form --intent "words"');
  for (let i = 1; i < args.length; i++) {
    const a = args[i];
    const [opt, inline] = a.startsWith("--") && a.includes("=") ? [a.slice(0, a.indexOf("=")), a.slice(a.indexOf("=") + 1)] : [a, undefined];
    const value = () => (inline !== undefined ? inline : args[++i]);
    if (opt === "--kind") o.kind = value();
    else if (opt === "--intent") {
      const v = value();
      if (v === undefined || v.startsWith("--")) throw new Error('kleros-ui new: --intent needs words, quoted, comma-separated: --intent "period badge, status chip"');
      o.intent = [...new Set(v.split(",").map((w) => w.trim()).filter(Boolean))];
      if (!o.intent.length) throw new Error('kleros-ui new: --intent has no words; give what someone would search for: --intent "period badge, status chip"');
    } else if (a.startsWith("-")) throw new Error(`kleros-ui new: unknown option ${a}; new takes --kind ui|data|form and --intent "words"`);
    else throw new Error(`kleros-ui new: unexpected ${a}; quote the intent words as one argument: --intent "period badge, status chip"`);
  }
  return o;
}

// tsconfig files are JSON with comments and trailing commas. The text with both removed, parsed; null
// when it cannot be read.
function readJsonc(file) {
  let src;
  try {
    // A leading byte-order mark (a file saved on Windows) would make JSON.parse fail, and jsx go unread.
    src = readFileSync(file, "utf8").replace(/^﻿/, "");
  } catch {
    return null;
  }
  let out = "";
  let quote = false;
  for (let i = 0; i < src.length; i++) {
    const c = src[i];
    if (quote) {
      out += c;
      if (c === "\\") out += src[++i] ?? "";
      else if (c === '"') quote = false;
    } else if (c === '"') (quote = true), (out += c);
    else if (c === "/" && src[i + 1] === "/") i = (src.indexOf("\n", i) < 0 ? src.length : src.indexOf("\n", i)) - 1;
    else if (c === "/" && src[i + 1] === "*") i = (src.indexOf("*/", i + 2) < 0 ? src.length : src.indexOf("*/", i + 2) + 2) - 1;
    else if (c === ",") {
      // a trailing comma: the next character that is not a space closes the object or array
      const next = src.slice(i + 1).match(/^(?:\s|\/\/[^\n]*|\/\*[\s\S]*?\*\/)*/)[0].length + i + 1;
      if (src[next] !== "}" && src[next] !== "]") out += c;
    } else out += c;
  }
  try {
    return JSON.parse(out);
  } catch {
    return null;
  }
}
// The files an `extends` of a package name can mean, in TypeScript's order: the package's own folder
// (found up the tree from the config) with its package.json "tsconfig" field, then its tsconfig.json; for a subpath,
// <sub> itself, <sub>.json, then <sub>/tsconfig.json; last, what the package's exports map gives (Node's resolution).
// tsOptions keeps only .json files, so a package's JS main is never read as a config.
function extendsCandidates(from, spec) {
  const parts = spec.split("/");
  const name = spec.startsWith("@") ? parts.slice(0, 2).join("/") : parts[0];
  const sub = parts.slice(spec.startsWith("@") ? 2 : 1).join("/");
  const out = [];
  for (let d = from; ; d = dirname(d)) {
    const dir = join(d, "node_modules", name);
    if (existsSync(join(dir, "package.json"))) {
      if (!sub) {
        const field = readJsonc(join(dir, "package.json"))?.tsconfig;
        if (typeof field === "string") out.push(join(dir, field), join(dir, `${field}.json`));
        out.push(join(dir, "tsconfig.json"));
      } else out.push(join(dir, sub), join(dir, `${sub}.json`), join(dir, sub, "tsconfig.json"));
      break;
    }
    if (dirname(d) === d) break;
  }
  const req = createRequire(join(from, "tsconfig.json"));
  for (const s of [spec, `${spec}.json`, `${spec}/tsconfig.json`])
    try {
      out.push(req.resolve(s));
    } catch {
      // not this form
    }
  return out;
}
// A tsconfig's compilerOptions with those of the configs it extends (a path, or a package's file as Court's
// "@kleros/kleros-v2-tsconfig/react-library.json"; TypeScript 5's array form too), the file's own winning.
function tsOptions(file, seen = new Set()) {
  if (seen.has(file)) return {};
  seen.add(file);
  const cfg = readJsonc(file);
  if (!cfg || typeof cfg !== "object") return {};
  let options = {};
  for (const spec of [cfg.extends].flat().filter((s) => typeof s === "string")) {
    const from = dirname(file);
    const relativeSpec = /^\.{1,2}[\\/]|^[\\/]/.test(spec) || isAbsolute(spec);
    const tries = relativeSpec ? [resolve(from, spec), resolve(from, `${spec}.json`)] : extendsCandidates(from, spec);
    // A package's config is a .json file; require.resolve(spec) gives the package's JS main, which does not parse as
    // one, so "jsx" would go unread.
    const parent = tries.find((p) => (relativeSpec || p.endsWith(".json")) && existsSync(p) && statSync(p).isFile());
    if (parent) options = { ...options, ...tsOptions(parent, seen) };
  }
  return { ...options, ...(cfg.compilerOptions && typeof cfg.compilerOptions === "object" ? cfg.compilerOptions : {}) };
}
// How `new` imports React for the app's JSX: null for the automatic runtime ("react-jsx", the starter's), or the import
// line when the app's tsconfig sets "jsx": "react" (classic JSX, which needs React in scope; Court's, through the config
// it extends). The config check runs (tsconfig.app.json, else tsconfig.json), or, when that one sets no jsx, the first
// config it references that does. The default import when the config allows it (esModuleInterop,
// allowSyntheticDefaultImports, or a module setting that implies them); else `import * as React`, which TypeScript
// accepts without them.
function reactImport() {
  const file = resolve(tsProject());
  let options = tsOptions(file);
  if (options.jsx === undefined)
    for (const ref of readJsonc(file)?.references ?? []) {
      if (typeof ref?.path !== "string") continue;
      const p = resolve(dirname(file), ref.path);
      const o = tsOptions(existsSync(p) && statSync(p).isDirectory() ? join(p, "tsconfig.json") : p);
      if (o.jsx !== undefined) {
        options = o;
        break;
      }
    }
  if (String(options.jsx).toLowerCase() !== "react") return null;
  const lower = (k) => String(options[k] ?? "").toLowerCase();
  const synthetic =
    typeof options.allowSyntheticDefaultImports === "boolean"
      ? options.allowSyntheticDefaultImports
      : options.esModuleInterop === true || lower("module") === "system" || lower("moduleResolution") === "bundler" || ["node16", "node18", "nodenext", "preserve"].includes(lower("module"));
  return synthetic ? 'import React from "react";' : 'import * as React from "react";';
}
// The component file with React in scope: the default import joins a named import from "react" (the form template's
// useState), and otherwise goes on the first line.
function withReact(text, line) {
  const named = /^import \{([^}]*)\} from "react";$/m;
  if (line.startsWith("import React ") && named.test(text)) return text.replace(named, (_, names) => `import React, {${names}} from "react";`);
  return `${line}\n${text}`;
}

function newComponent({ name, kind, intent }) {
  if (!/^[A-Z][A-Za-z0-9]+$/.test(name)) throw new Error("kleros-ui new: the name must be PascalCase, e.g. VoteTallyBar");
  const clash = CATALOG.components.find((c) => c.name === name);
  if (clash) {
    console.error(`kleros-ui new: ${name} already exists in the library — import { ${name} } from "${clash.importPath}"`);
    process.exit(1);
  }
  const fresh = !existsSync(CONFIG);
  let c = config();
  const dir = join(c.componentsDir || "src/components", name);
  if (existsSync(dir)) throw new Error(`kleros-ui new: ${dir} already exists`);
  if (!["ui", "data", "form"].includes(kind)) throw new Error("kleros-ui new: --kind is ui, data or form");
  // new before init: kleros-ui.json gets what init records (the app's components as existing, its Tailwind entry), as
  // init keeps a kleros-ui.json that is there and would leave them out.
  if (fresh) c = initialConfig();
  // The folder and kleros-ui.json are checked before the first write.
  guard(dir, { folder: true });
  guard(CONFIG);
  mkdir(dir);
  const tdir = join(PKG_DIR, "agent/templates", kind);
  // Stories only when the app has Storybook; one written for an app without it is never run.
  const stories = hasStorybook();
  // The component file only, the one template file with JSX (a stories file has none, and an unused React
  // import fails an app with noUnusedLocals, as Court has).
  const react = reactImport();
  const written = [];
  for (const f of readdirSync(tdir)) {
    const out = f.replace("__NAME__", name).replace(/\.tmpl$/, "");
    if (out.endsWith(".stories.tsx") && !stories) continue;
    const text = readFileSync(join(tdir, f), "utf8").replaceAll("__NAME__", name);
    write(join(dir, out), react && out === `${name}.tsx` ? withReact(text, react) : text);
    written.push(out);
  }
  // importPath: the folder's path from src/ when it is inside src/ (./components/<Name> by default, ./ui/<Name> for
  // src/ui), else its path from the app root (./app/ui/<Name>).
  const fromSrc = toPosix(relative("src", resolve(dir)));
  const importPath = `./${/^\.\.(?:\/|$)/.test(fromSrc) || isAbsolute(fromSrc) ? toPosix(relative(".", resolve(dir))) : fromSrc}`;
  c.components = [
    ...(c.components || []).filter((x) => x.name !== name),
    { name, status: "local", kind, intent: intent ?? [], importPath, ...(stories ? { stories: `${dir}/${name}.stories.tsx` } : {}), createdWith: pkg.version },
  ];
  writeJson(CONFIG, c);
  if (fresh) recorded({ components: c.components.filter((x) => x.status === "existing") });
  const order = (f) => (f === `${name}.tsx` ? 0 : f.endsWith(".stories.tsx") ? 1 : 2);
  const words = intent ? ` with the intent words ${intent.map((w) => JSON.stringify(w)).join(", ")}` : "";
  console.log(`kleros-ui: created ${dir}/ (${written.sort((a, b) => order(a) - order(b)).join(", ")}) and a ${CONFIG} entry${words}.${stories ? "" : " No stories: this app has no Storybook."}`);
  if (react) console.log(`kleros-ui: ${name}.tsx starts with ${react}, since ${tsProject()} (or a config it extends) sets "jsx": "react", which needs React in scope.`);
  if (!hasTailwind()) console.log(`kleros-ui: this app has no Tailwind yet, and the scaffold's classes need it: ${libPath()}/agent/AGENTS.md ${EXISTING_APPS}.`);
  console.log(
    intent
      ? `Next: fill in ${name}.tsx${stories ? ` and ${name}.stories.tsx` : ""}, use ${name} in each place it shows, then npm run ui:check.`
      : `Next: fill in ${name}.tsx${stories ? ` and ${name}.stories.tsx` : ""}, add intent words (what someone would search for) to its "intent" array in ${CONFIG}, then npm run ui:check. ui:check notes an entry with none.`,
  );
}

// A component file in componentsDir: Name.tsx, not a story or a test.
const COMPONENT_FILE = /^[A-Z][A-Za-z0-9]*\.tsx$/;

// ---- app CSS (an app's CSS can redefine --klerosUIComponents* tokens or bring its own palette, which the TS/TSX lint
// cannot see). Declaration values only: never selectors (#root) or comments.
const CSS_TOKEN = "kleros-ui/css-token";
const CSS_COLOUR = "kleros-ui/css-colour";
const NAMED = new Set(
  ("aliceblue antiquewhite aqua aquamarine azure beige bisque black blanchedalmond blue blueviolet brown burlywood " +
    "cadetblue chartreuse chocolate coral cornflowerblue cornsilk crimson cyan darkblue darkcyan darkgoldenrod darkgray " +
    "darkgreen darkgrey darkkhaki darkmagenta darkolivegreen darkorange darkorchid darkred darksalmon darkseagreen " +
    "darkslateblue darkslategray darkslategrey darkturquoise darkviolet deeppink deepskyblue dimgray dimgrey dodgerblue " +
    "firebrick floralwhite forestgreen fuchsia gainsboro ghostwhite gold goldenrod gray green greenyellow grey honeydew " +
    "hotpink indianred indigo ivory khaki lavender lavenderblush lawngreen lemonchiffon lightblue lightcoral lightcyan " +
    "lightgoldenrodyellow lightgray lightgreen lightgrey lightpink lightsalmon lightseagreen lightskyblue lightslategray " +
    "lightslategrey lightsteelblue lightyellow lime limegreen linen magenta maroon mediumaquamarine mediumblue " +
    "mediumorchid mediumpurple mediumseagreen mediumslateblue mediumspringgreen mediumturquoise mediumvioletred " +
    "midnightblue mintcream mistyrose moccasin navajowhite navy oldlace olive olivedrab orange orangered orchid " +
    "palegoldenrod palegreen paleturquoise palevioletred papayawhip peachpuff peru pink plum powderblue purple " +
    "rebeccapurple red rosybrown royalblue saddlebrown salmon sandybrown seagreen seashell sienna silver skyblue " +
    "slateblue slategray slategrey snow springgreen steelblue tan teal thistle tomato turquoise violet wheat white " +
    "whitesmoke yellow yellowgreen").split(" "),
);
// Where a named colour counts: properties that take a colour (and custom properties), and inside color-mix() anywhere.
// Not, say, an animation or grid-area name. transparent, currentColor, inherit, initial, unset and none are not named
// colours, so they always pass.
const COLOUR_PROP = /^(--|\$)|color$|^(background|border|outline|text-decoration|column-rule)|^(fill|stroke)$|shadow$/i;
const HEX = /(?<![\w#&$-])#(?:[0-9a-f]{8}|[0-9a-f]{6}|[0-9a-f]{3,4})(?![\w-])/gi;
const COLOUR_FN = /(?<![\w-])(?:rgba?|hsla?|hwb|lab|lch|oklab|oklch|color)\(/gi;
const COLOR_MIX = /(?<![\w-])color-mix\(/gi;
const IDENT = /(?<![\w$@#.%!-])[a-z]+(?![\w(-])/gi;

// Index of the ")" that closes the "(" just before `open` (or the end).
function closeParen(s, open) {
  let depth = 1;
  for (let i = open; i < s.length; i++) {
    if (s[i] === "(") depth++;
    else if (s[i] === ")" && --depth === 0) return i;
  }
  return s.length;
}

// The text with /* */ comments (and in SCSS, // comments outside parentheses) turned to spaces, newlines kept, so
// every offset keeps its line and column.
function stripComments(src, scss) {
  let out = "";
  let quote = null;
  let depth = 0;
  for (let i = 0; i < src.length; i++) {
    const c = src[i];
    if (quote) {
      out += c;
      if (c === "\\" && i + 1 < src.length) out += src[++i];
      else if (c === quote || c === "\n") quote = null;
      continue;
    }
    // An unquoted url(...) is one token in CSS, so a /* in it starts no comment (Tailwind and Vite read url(/*) as a
    // URL; read as a comment here, it would hide a rule from the theme scan).
    if ((c === "u" || c === "U") && !/[\w-]/.test(src[i - 1] ?? "") && /^url\(\s*[^\s"')]/i.test(src.slice(i, i + 64))) {
      const end = src.indexOf(")", i);
      const stop = end < 0 ? src.length : end + 1;
      out += src.slice(i, stop);
      i = stop - 1;
      continue;
    }
    const line = scss && c === "/" && src[i + 1] === "/" && depth === 0;
    if ((c === "/" && src[i + 1] === "*") || line) {
      const end = line ? src.indexOf("\n", i) : src.indexOf("*/", i + 2);
      const stop = end < 0 ? src.length : line ? end : end + 2;
      out += src.slice(i, stop).replace(/[^\n]/g, " ");
      i = stop - 1;
      continue;
    }
    if (c === '"' || c === "'") quote = c;
    else if (c === "(") depth++;
    else if (c === ")") depth = Math.max(0, depth - 1);
    out += c;
  }
  return out;
}

// Every `property: value` in comment-free CSS. Only text that ends in ";" or "}" is a declaration: a selector or an
// @media prelude ends in "{", so #root, a:hover and (max-width: 540px) never reach the value test.
function declarations(text) {
  const out = [];
  let start = 0;
  let quote = null;
  let depth = 0;
  const flush = (end) => {
    const seg = text.slice(start, end);
    const body = seg.trim();
    const colon = body.indexOf(":");
    if (!body || body[0] === "@" || colon < 1) return;
    const prop = body.slice(0, colon).trim();
    const at = start + seg.length - seg.trimStart().length;
    if (/^(--|\$)?[A-Za-z_-][\w-]*$/.test(prop)) out.push({ prop, at, value: body.slice(colon + 1), valueAt: at + colon + 1 });
  };
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (quote) {
      if (c === "\\") i++;
      else if (c === quote || c === "\n") quote = null;
      continue;
    }
    if (c === '"' || c === "'") quote = c;
    else if (c === "(") depth++;
    else if (c === ")") depth = Math.max(0, depth - 1);
    else if (c === "#" && text[i + 1] === "{") {
      const e = text.indexOf("}", i); // SCSS interpolation
      i = e < 0 ? text.length : e;
    } else if (depth === 0 && (c === ";" || c === "{" || c === "}")) {
      if (c !== "{") flush(i);
      start = i + 1;
    }
  }
  flush(text.length);
  return out;
}

// The value with strings and the insides of url(), var() and env() blanked: a token reference, a data URI or an SVG
// fragment (#shape) is not a colour.
function blankValue(v) {
  let s = v.replace(/(["'])(?:\\.|(?!\1)[^\\\n])*\1?/g, (m) => " ".repeat(m.length));
  const re = /(?<![\w-])(?:url|var|env)\(/gi;
  for (let m = re.exec(s); m; m = re.exec(s)) {
    const open = m.index + m[0].length;
    const close = closeParen(s, open);
    s = s.slice(0, open) + " ".repeat(close - open) + s.slice(close);
    re.lastIndex = close;
  }
  return s;
}

// [offset in value, literal] for each colour literal in one declaration's value.
function colourLiterals(prop, value) {
  const v = blankValue(value);
  const found = [];
  for (const m of v.matchAll(HEX)) found.push([m.index, m[0]]);
  for (const m of v.matchAll(COLOUR_FN)) {
    const open = m.index + m[0].length;
    const close = closeParen(v, open);
    // rgb(var(--x) / 0.5) or rgb(from var(--x) r g b / 50%) is built from a token, not a literal.
    if (/^\s*(from\s+)?(var|env)\(|^\s*from\s+currentcolor\b/i.test(v.slice(open, close))) continue;
    found.push([m.index, value.slice(m.index, Math.min(close + 1, m.index + 48))]);
  }
  const ranges = COLOUR_PROP.test(prop)
    ? [[0, v.length]]
    : [...v.matchAll(COLOR_MIX)].map((m) => [m.index, closeParen(v, m.index + m[0].length)]);
  for (const [a, b] of ranges)
    for (const m of v.slice(a, b).matchAll(IDENT)) if (NAMED.has(m[0].toLowerCase())) found.push([a + m.index, m[0]]);
  return found.sort((x, y) => x[0] - y[0]);
}

// index.html with everything outside its <style> blocks blanked (newlines kept), so the scan reports index.html lines,
// and the offset of each <style> tag. A <style> block inside an HTML comment is not CSS the page uses, so it is
// blanked too and not counted. Also the offset of each <link rel="stylesheet"> to a local
// file (public/extra.css, /src/x.css; a stylesheet from another site, such as a font's, is not one) and of each
// style="" attribute, outside comments and <script> blocks.
function htmlStyles(html) {
  let css = html.replace(/[^\n]/g, " ");
  const tags = [];
  const links = [];
  const attrs = [];
  // No part of a tag runs past the next unquoted "<", so each "<" is read once: with [^>] in its place, a page of
  // unclosed tags ("<a " over and over) made every one scan to the end of the file. A quoted attribute may hold "<" or
  // ">" (`<style data-x="a < b">` is still a style block); a quote opens a value only right after "=", as in HTML, so
  // a stray one in an unquoted value (`<style data-x=a'b>`) is a literal. A <style> with no </style> is a block to the end of the page,
  // as a browser reads it. A block ends where a browser ends it, at </script or </style and then whitespace, "/" or ">",
  // so `</script >` and `</style\n>` end one too (the " >" left over is not a tag). A comment ends where a browser ends it
  // too: at the next --> or --!>, or at once in `<!-->` and `<!--->`, so a <style> after one of those is scanned.
  const tag = /<!--(?:-?>|[\s\S]*?(?:--!?>|$))|<script\b(?:[^<>=]|=\s*"[^"]*"|=\s*'[^']*'|=(?!\s*["']))*>[\s\S]*?(?:<\/script(?=[\t\n\f\r />])|$)|(<style\b(?:[^<>=]|=\s*"[^"]*"|=\s*'[^']*'|=(?!\s*["']))*>)([\s\S]*?)(?:<\/style(?=[\t\n\f\r />])|$)|<([a-z][\w-]*)((?:[^<>"']|"[^"]*"|'[^']*')*)>/gi;
  const attr = (list, name) => list.match(new RegExp(`(?:^|\\s)${name}\\s*=\\s*(?:"([^"]*)"|'([^']*)'|([^\\s"'>]+))`, "i"));
  for (const m of html.matchAll(tag)) {
    if (m[1]) {
      tags.push(m.index);
      const a = m.index + m[1].length;
      css = css.slice(0, a) + m[2] + css.slice(a + m[2].length);
    } else if (m[3]) {
      const list = m[4] ?? "";
      const style = attr(list, "style");
      if (style) attrs.push({ at: m.index + 1 + m[3].length + style.index + (style[0].match(/^\s*/)[0].length), el: m[3].toLowerCase() });
      const rel = attr(list, "rel");
      const href = attr(list, "href");
      const url = href && (href[1] ?? href[2] ?? href[3]);
      if (m[3].toLowerCase() === "link" && rel && /(?:^|\s)stylesheet(?:\s|$)/i.test(rel[1] ?? rel[2] ?? rel[3]) && url && !/^(?:[a-z][a-z0-9+.-]*:)?\/\//i.test(url))
        links.push({ at: m.index, href: url });
    }
  }
  return { css, tags, links, attrs };
}

// ---- Tailwind only (agent/AGENTS.md, "Styling: Tailwind only"). An app's CSS is one entry file
// that imports tailwindcss and holds only Tailwind's directives. A style rule or another at-rule in the entry, any other
// stylesheet, a <style> block, a local stylesheet link or a style attribute in index.html, an !important and a
// selector that reaches into the library are findings, counted per file and rule like the rest of the scan, so
// ui:baseline records an existing app's CSS (Court's) and check fails only on new ones. A stylesheet
// outside the entry counts each of its rules too, so a new rule in an old file (Court's base-elements.css) fails.
const CSS_TW = "kleros-ui/css-tailwind-only";
const CSS_IMPORTANT = "kleros-ui/css-important";
const CSS_INTERNALS = "kleros-ui/css-internals";
// What the entry may hold, besides comments: Tailwind 4's directives, and v3's @tailwind; @import only of
// tailwindcss and the library's theme.css, and @plugin and @config only of a package: a local file brings CSS of its own.
const TW_DIRECTIVES = new Set(["import", "source", "custom-variant", "plugin", "config", "reference", "tailwind"]);
const TW_ENTRY = /@import\s+(?:url\(\s*)?["']?tailwindcss(?:\/[^"'\s);]*)?["']?|@tailwind\s/i;
const ENTRY_IMPORTS = /^(?:tailwindcss(?:\/.*)?|@kleros\/ui-components-library\/theme\.css)$/;
// The first argument of an @import, @plugin or @config: "x", 'x' or url(x).
// Tailwind's @import "./x.css" reference: the file's theme and utilities become known, and none of its CSS loads.
const REFERENCE_IMPORT = /^@import\s+(?:url\(\s*)?(?:"[^"]*"|'[^']*'|[^\s"');]+)\s*\)?(?:\s+[^;{}]*?)?\s+reference(?:\s|$)/i;
const atTarget = (prelude) => prelude.match(/^@[\w-]+\s+(?:url\(\s*)?(?:"([^"]*)"|'([^']*)'|([^\s"');]+))/i)?.slice(1).find((x) => x !== undefined) ?? "";
const isPackage = (spec) => /^(?:@[\w.-]+\/)?[\w.-]+(?:\/.*)?$/.test(spec) && !/^\.{1,2}(?:\/|$)/.test(spec);
// Every stylesheet Vite compiles: CSS, PostCSS's own extensions and the preprocessors (a .pcss file compiles with no
// extra package, so it is read too). The indented syntaxes have no braces, so each line at column 0 is a rule.
const STYLESHEET = /\.(?:css|scss|sass|less|styl|stylus|pcss|postcss|sss)$/i;
const SLASH_COMMENTS = /\.(?:scss|sass|less|styl|stylus)$/i;
const INDENTED = /\.(?:sass|styl|stylus)$/i;
// At-rules that only group style rules. Each rule inside one is its own finding, so a rule added inside an existing
// @layer or @media is a new finding; an empty one counts once.
const GROUPING = new Set(["media", "supports", "layer", "container", "scope", "starting-style", "document"]);
const USE_CLASSES = "Use Tailwind classes instead; for page-level setup, classes on <html> and <body>, as the starter does.";
// The theme file is the one stylesheet allowed besides the entry, so the reason names it when the app has one.
const outsideWhy = (theme) =>
  `Tailwind only, so no stylesheet besides the one entry that imports tailwindcss (src/index.css as create writes it) and ${theme?.file ? `the theme file ${theme.file} (kleros-ui.json "theme")` : "one theme file for new token values, which npx -p @kleros/ui-components-library kleros-ui theme sets up"}.`;
const ENTRY_HOLDS = "which keeps only @import, @source, @custom-variant, @plugin, @config and @reference (Tailwind only).";
// The library's internals, as a selector reaches them (such as an app's label[data-rac] overrides): react-aria's
// data attributes (data-rac, and the states the library's CSS keys on) and class names, and the library's own
// klerosUIComponents* classes. Inside :not() they keep a rule off the library instead, so they do not count there.
const INTERNALS = new RegExp(
  "\\[\\s*data-(?:rac|react-aria-[\\w-]*|hovered|focused|focus-visible|focus-within|pressed|selected|disabled|invalid|readonly|required|indeterminate|open|expanded|entering|exiting|placement|orientation|dragging|drop-target|outside-month|outside-visible-range|unavailable|selection-start|selection-end)(?![\\w-])" +
    "|\\.react-aria-[\\w-]+|klerosUIComponents\\w*",
);
const atName = (prelude) => prelude.match(/^@([\w-]+)/)?.[1].toLowerCase() ?? null;
const quoted = (s) => `"${shortSel(s)}"`;
const shortSel = (s) => {
  const one = s.replace(/\s+/g, " ").trim();
  return one.length > 80 ? `${one.slice(0, 77)}...` : one;
};
// A selector with the insides of every :not() blanked.
function withoutNot(sel) {
  let s = sel;
  const re = /:not\(/gi;
  for (let m = re.exec(s); m; m = re.exec(s)) {
    const open = m.index + m[0].length;
    const close = closeParen(s, open);
    s = s.slice(0, open) + " ".repeat(close - open) + s.slice(close);
    re.lastIndex = close;
  }
  return s;
}

// The blocks and @-statements of comment-free CSS, in order: { prelude, at, parent, block, end }. prelude is the text
// before "{" (a selector or an at-rule) or before ";" (an @-statement such as @import); at is its offset. end is the
// offset of a block's "}" or a statement's ";" (the text's length when it has none), so the theme scan can tell which
// rule a declaration is in, and `theme` can add its import right after the library's.
function cssBlocks(text) {
  const out = [];
  const stack = [];
  let start = 0;
  let quote = null;
  let depth = 0;
  const item = (end, block) => {
    const seg = text.slice(start, end);
    return { prelude: seg.trim(), at: start + seg.length - seg.trimStart().length, parent: stack.at(-1) ?? null, block, end: block ? text.length : end };
  };
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (quote) {
      if (c === "\\") i++;
      else if (c === quote || c === "\n") quote = null;
      continue;
    }
    if (c === '"' || c === "'") quote = c;
    else if (c === "(") depth++;
    else if (c === ")") depth = Math.max(0, depth - 1);
    else if (c === "#" && text[i + 1] === "{") {
      const e = text.indexOf("}", i); // SCSS interpolation
      i = e < 0 ? text.length : e;
    } else if (depth === 0 && (c === "{" || c === ";" || c === "}")) {
      if (c === "{") {
        const b = item(i, true);
        out.push(b);
        stack.push(b);
      } else {
        const s = item(i, false);
        if (s.prelude.startsWith("@")) out.push(s);
        if (c === "}") {
          const b = stack.pop();
          if (b) b.end = i;
        }
      }
      start = i + 1;
    }
  }
  const last = item(text.length, false);
  if (last.prelude.startsWith("@")) out.push(last);
  return out;
}

// The Tailwind-only findings of a stylesheet: each style rule, at any depth, and each at-rule. The insides of a
// non-grouping at-rule (@utility, @theme, @font-face, @keyframes, @custom-variant's block) are not counted again, nor
// is an at-rule nested in a style rule. In the entry, Tailwind's directives are allowed: an @import only of
// tailwindcss or the library's theme.css, and an @plugin or @config only of a package (a local file brings CSS of its
// own). In any other stylesheet (`outside` names it) nothing is allowed, and each rule counts, so a rule added to an
// old file is a new finding; a file with no rule (empty, or only comments) counts once.
// When kleros-ui.json declares a theme (`theme` is themeInfo()), the entry may also import that file, once,
// plainly, and after the library's theme.css (the import order decides which values win in @layer base); the entry
// kleros-ui.json names must import it. `file` is the entry's path from the app root. With no theme declared, only the
// two imports above pass.
// `link` is the configured entry when this file is a stylesheet on its way to tailwindcss (middle.css in index.css ->
// middle.css -> tw.css): the library's theme.css and the theme file are imported from the entry alone, where their
// order is checked, so a second import further on cannot undo the theme. `late` is the entry when it @imports this
// file (at any depth) after the theme file: the library's theme.css imported here would load again over the theme and
// undo it, as would a second import of it in the entry after the theme file.
function entryFindings(blocks, { outside = null, theme = null, file = "", scanned = null, link = null, late = null } = {}) {
  const findings = [];
  const themed = Boolean(!outside && theme?.file);
  const libThemeAt = blocks.find((b) => !b.block && !b.parent && atName(b.prelude) === "import" && atTarget(b.prelude) === LIB_THEME)?.at;
  let themeImports = 0;
  let themeSeen = false; // the theme file's import came before, in this file (the first theme.css import before it is
  // themeImport's order finding; a second one after it is this file's own)
  // What follows an @import's target: its layer(), supports() or media condition, or "" for a plain import.
  const condition = (b) => b.prelude.replace(/^@import\s+(?:url\(\s*)?(?:"[^"]*"|'[^']*'|[^\s"');]+)\s*\)?/i, "").trim();
  // Why an @import of the theme file is a finding, or null when it is the one the entry should have.
  const themeImport = (b, target) => {
    const rest = condition(b);
    if (++themeImports > 1) return `@import "${target}" again: the Tailwind entry imports the theme file ${theme.file} once.`;
    // The block walk treats a grouping at-rule as transparent, so an import inside @layer components { } would pass.
    // Tailwind builds that as @layer components.base, which beats the library's :root.dark, so a light-only value leaks
    // into dark mode; inside @media print or @supports the theme applies only where that condition holds.
    if (b.parent) {
      const outer = [];
      for (let p = b.parent; p; p = p.parent) outer.unshift(shortSel(p.prelude));
      return `@import "${target}" inside ${outer.join(" > ")}: import the theme file at the top level of the entry, right after @import "${LIB_THEME}";. Inside another layer it beats the library's dark values, so a light value leaks into dark mode, and inside @media or @supports it applies only where that condition holds.`;
    }
    if (libThemeAt === undefined)
      return `@import "${target}" in a Tailwind entry that does not import ${LIB_THEME}: add @import "${LIB_THEME}"; after the tailwindcss import, and the theme file's import right after it.`;
    if (b.at < libThemeAt) return `@import "${target}" comes before @import "${LIB_THEME}", so the library's values win over the theme's: move it to the line right after that import.`;
    if (rest)
      return `@import "${target}" ${shortSel(rest)}: import the theme file plainly, with no layer(), supports() or media condition, so it stays in the base layer, where a light-only value keeps the library's dark one.`;
    return null;
  };
  // Why an @import of the library's theme.css, in the entry or a stylesheet that imports tailwindcss itself, is a
  // finding after all, or null when it is plain and at the top level, as the guide and the starter write it. The
  // block walk treats a grouping at-rule as transparent, and the import passes as an entry directive, so a condition
  // would go unseen: layer() (named or not) or an @layer block around it moves the library's values out of @layer
  // base, where the import order lets the theme win, and in layer(components) they beat the theme file's values, so
  // the theme is undone with no other sign. Under a media or supports() condition, or inside @media or @supports,
  // they load only where that condition holds.
  const libThemeImport = (b) => {
    const plain = `import the library's theme.css at the top level, plainly, without a layer, media or supports condition, as the guide writes it: @import "${LIB_THEME}";. In another layer its values leave @layer base, so the theme no longer works as written: in a later layer they beat the theme file's, and in one nested in @layer base the theme's light-only values beat the library's dark ones. Under @media or @supports they load only where that condition holds.`;
    if (b.parent) {
      const outer = [];
      for (let p = b.parent; p; p = p.parent) outer.unshift(shortSel(p.prelude));
      return `@import "${LIB_THEME}" inside ${outer.join(" > ")}: ${plain}`;
    }
    // Tailwind's theme(static) or theme(inline) option changes how @theme variables are emitted, not their layer.
    const rest = condition(b).replace(/(?:^|\s)theme\([^)]*\)(?=\s|$)/gi, " ").trim();
    return rest ? `@import "${LIB_THEME}" ${shortSel(rest)}: ${plain}` : null;
  };
  const covered = (b) => {
    for (let p = b.parent; p; p = p.parent) {
      const n = atName(p.prelude);
      if ((n && !GROUPING.has(n)) || (!n && atName(b.prelude))) return true;
    }
    return false;
  };
  const inside = (b) => {
    const names = [];
    for (let p = b.parent; p; p = p.parent) if (atName(p.prelude)) names.unshift(shortSel(p.prelude));
    return names.length ? ` (in ${names.join(" > ")})` : "";
  };
  const viaLink = (target) =>
    `@import "${target}" in ${file}, a stylesheet the Tailwind entry ${link} imports on its way to tailwindcss: import it from ${link} itself, where its order against the theme is checked.`;
  // Why a directive in the entry is a finding after all, or null when it is allowed.
  const directive = (b, n) => {
    const target = atTarget(b.prelude);
    // A local stylesheet that reaches tailwindcss ("./tw.css") is how a nested entry imports it, when this scan reads
    // that file too (as an entry itself); one the scan skips (a dot folder, an ignored or outside file) stays a finding.
    const at = /^\.{1,2}\//.test(target) ? resolve(dirname(file), target) : null;
    const nested = Boolean(at && scanned?.has(at) && reachesTailwind(at));
    if (n === "import" && link && !nested) return viaLink(target);
    if (n === "import" && !ENTRY_IMPORTS.test(target) && !nested)
      return themed
        ? `@import "${target}" in the Tailwind entry, which imports only tailwindcss, ${LIB_THEME} and the theme file ${theme.file} (the library's style.css is imported from src/main.tsx, before it).`
        : `@import "${target}" in the Tailwind entry, which imports only tailwindcss and ${LIB}/theme.css (the library's style.css is imported from src/main.tsx, before it).`;
    if ((n === "plugin" || n === "config") && !isPackage(target))
      return `@${n} "${target}" in the Tailwind entry: a local ${n} file adds CSS of its own; only a package's ${n} is allowed${n === "plugin" ? " (such as @tailwindcss/typography)" : ""}.`;
    return null;
  };
  for (const b of blocks) {
    if (covered(b)) continue;
    const n = atName(b.prelude);
    if (n && GROUPING.has(n) && b.block && blocks.some((x) => x.parent === b)) continue;
    if (themed && n === "import" && !b.block && importsFile(file, atTarget(b.prelude), theme.file)) {
      themeSeen = true;
      const why = link ? viaLink(atTarget(b.prelude)) : themeImport(b, atTarget(b.prelude));
      if (why) findings.push({ rule: CSS_THEME, at: b.at, message: why });
      continue;
    }
    // The library's theme.css loading again after the theme file undoes the theme: imported here when the entry reaches
    // this file after the theme file (`late`), or a second time in this file after it. An import of it under a layer,
    // media or supports condition is a finding too (libThemeImport). A stylesheet on the way (`link`) imports neither,
    // as viaLink says; a reference import loads nothing.
    if (themed && !link && n === "import" && !b.block && atTarget(b.prelude) === LIB_THEME && !REFERENCE_IMPORT.test(b.prelude)) {
      const why = late
        ? `@import "${LIB_THEME}" in ${file}, which the Tailwind entry ${late.entry} reaches after the theme file ${theme.file} (through its @import "${late.via}"): it loads the library's values again, over the theme's. Import it once, from ${late.entry}, before the theme file.`
        : themeSeen && b.at !== libThemeAt
          ? `@import "${LIB_THEME}" again after the theme file ${theme.file}: it loads the library's values over the theme's. Import it once, before the theme file.`
          : libThemeImport(b);
      if (why) {
        findings.push({ rule: CSS_THEME, at: b.at, message: why });
        continue;
      }
    }
    if (!outside && n && TW_DIRECTIVES.has(n)) {
      const why = directive(b, n);
      if (why) findings.push({ rule: CSS_TW, at: b.at, message: `${why} ${USE_CLASSES}` });
      continue;
    }
    const what = n ? `${shortSel(b.prelude)}${inside(b)}` : `Style rule ${quoted(b.prelude)}${inside(b)}`;
    findings.push({ rule: CSS_TW, at: b.at, message: outside ? `${what} in ${outside}: ${outsideWhy(theme)} ${USE_CLASSES}` : `${what} in the Tailwind entry, ${ENTRY_HOLDS} ${USE_CLASSES}` });
  }
  if (outside && !findings.length) findings.push({ rule: CSS_TW, at: 0, message: `${outside[0].toUpperCase()}${outside.slice(1)}: ${outsideWhy(theme)} ${USE_CLASSES}` });
  // theme writes a new file only, so "npx -p @kleros/ui-components-library kleros-ui theme adds it" holds only while the file is missing.
  if (themed && !themeImports && file === theme.entry)
    findings.push({
      rule: CSS_THEME,
      at: libThemeAt ?? 0,
      message: `The Tailwind entry does not import the theme file ${theme.file} (kleros-ui.json "theme"), so its tokens change nothing: add @import "${importPath(file, theme.file)}"; right after @import "${LIB_THEME}";${taken(theme.file) ? "" : " (npx -p @kleros/ui-components-library kleros-ui theme writes the file and adds this line)"}.`,
    });
  return findings;
}

// ---- themes. kleros-ui.json "theme" names the one theme file, which the Tailwind entry imports right after the
// library's theme.css. In it the scan allows only @layer base rules on :root and :root.dark that declare names the
// library's theme.css defines, with any value (unlayered, a light value leaks into dark mode; on a subtree, it misses
// the app's classes). Elsewhere a token redefinition is a css-token finding, and its message names the theme file.
const CSS_THEME = "kleros-ui/css-theme";
const DEFAULT_THEME = "src/theme.css";
const LIB_THEME = `${LIB}/theme.css`;
const THEME_ROOTS = new Set([":root", ":root.dark"]);
const THEME_SHAPE = "a theme file holds only @layer base { :root { } :root.dark { } }";
const appPath = (p) => toPosix(relative(process.cwd(), resolve(p)));
// True when an @import target in `from` (a path from the app root) is the file `to`: a relative path only, as the
// starter writes it ("./theme.css"); a bare name is a package to Tailwind.
const importsFile = (from, target, to) => /^\.{1,2}\//.test(target) && appPath(join(dirname(from), target)) === to;
// The @import path of `to` from the stylesheet `from`, both paths from the app root: "./theme.css" next to it.
const importPath = (from, to) => {
  const rel = toPosix(relative(dirname(from), to));
  return rel.startsWith("../") ? rel : `./${rel}`;
};

// The library's theme.css as the app resolves it (its "./theme.css" export, so a copy hoisted to a monorepo root
// counts), or null when the app has no library installed. Not this CLI's own copy: an npx run from the cache can be
// another version than the app's.
function libraryThemeFile() {
  try {
    return createRequire(resolve("package.json")).resolve(LIB_THEME);
  } catch {
    return null;
  }
}
// The library's tokens, from the :root and :root.dark rules of its theme.css: [name, value] pairs for light and dark,
// and every name either one declares.
function libraryTokens(file) {
  const text = stripComments(readFileSync(file, "utf8"), false);
  const out = { light: [], dark: [], names: new Set() };
  for (const m of text.matchAll(/(?<=^|[{};\s]):root(\.dark)?\s*\{([^{}]*)\}/g))
    for (const d of declarations(m[2]))
      if (/^--klerosUIComponents/.test(d.prop)) {
        (m[1] ? out.dark : out.light).push([d.prop, d.value.trim()]);
        out.names.add(d.prop);
      }
  return out;
}
// What the scan needs to know about the app's theme, or null when kleros-ui.json declares none.
// { file: its path from the app root (null when "theme" is not a path or names a folder), folder, given, entry: the
// Tailwind entry's path, names: the library's token names (null when they cannot be read), why: the reason they cannot }.
function themeInfo() {
  const c = config();
  if (c.theme === undefined) return null;
  const entry = appPath(c.cssEntry || "src/index.css");
  if (typeof c.theme !== "string" || !c.theme.trim()) return { file: null, given: c.theme, entry, names: null };
  // A folder is no theme file either: the scan then treats the app as one with no theme, plus that finding.
  if (existsSync(c.theme) && !statSync(c.theme).isFile()) return { file: null, folder: appPath(c.theme), given: c.theme, entry, names: null };
  const lib = libraryThemeFile();
  let names = null;
  let why = `${LIB_THEME} does not resolve from this folder`;
  if (lib) {
    try {
      names = libraryTokens(lib).names;
      if (!names.size) (names = null), (why = `${toPosix(lib)} declares no --klerosUIComponents* token on :root`);
    } catch (e) {
      why = `${toPosix(lib)} could not be read (${e.code || e.message})`;
    }
  }
  return { file: appPath(c.theme), given: c.theme, entry, names, why };
}

// Every finding in the declared theme file, one rule id (css-theme), counted per file like the rest of the scan.
// A rule or at-rule that is wrong as a whole is one finding, and what is inside it is not counted again; in a :root or
// :root.dark rule each declaration counts, so a new token line in a baselined theme is a new finding.
function themeFindings(clean, blocks, theme) {
  const findings = [];
  const add = (at, message) => findings.push({ rule: CSS_THEME, at, message });
  const file = theme.file;
  const isBase = (b) => b.block && !b.parent && /^@layer\s+base$/.test(b.prelude);
  const done = new Set(); // rules and at-rules with a finding, and everything inside them
  const ok = new Set(); // :root and :root.dark rules whose declarations are checked
  const unlayered = new Set();
  if (!theme.names) add(0, `The token names in ${file} were not checked: ${theme.why}. Install the library (npm install), then run the check again.`);
  for (const b of blocks) {
    if (b.parent && done.has(b.parent)) {
      done.add(b);
      continue;
    }
    const n = atName(b.prelude);
    if (n) {
      if (isBase(b)) continue;
      done.add(b);
      add(b.at, `${shortSel(b.prelude)}${b.parent ? ` (in ${quoted(b.parent.prelude)})` : ""} in the theme file ${file}: ${THEME_SHAPE}, so no other at-rule${n === "layer" ? " (only the base layer, as one block)" : ""}.`);
      continue;
    }
    // A selector list counts when each selector in it is one of the two (`:root, :root.dark` sets a token in both
    // modes); matching the whole prelude would make that list a false finding.
    if (!b.prelude.split(",").every((s) => THEME_ROOTS.has(s.trim())) || (b.parent && !atName(b.parent.prelude))) {
      done.add(b);
      add(
        b.at,
        `Selector ${quoted(b.prelude)}${b.parent && !atName(b.parent.prelude) ? ` (nested in ${quoted(b.parent.prelude)})` : ""} in the theme file ${file}: only :root (light) and :root.dark (dark). A bare .dark loses to the library's :root.dark, and a rule on a part of the page does not reach the app's klerosUIComponents* classes, which read the tokens at :root.`,
      );
      continue;
    }
    ok.add(b);
    if (!b.parent) unlayered.add(b);
  }
  const decls = declarations(clean);
  // The innermost block a declaration is in: the last one in document order that holds its offset.
  const owner = (at) => blocks.filter((b) => b.block && b.at < at && at < b.end).at(-1) ?? null;
  const leaks = (prop) =>
    `${prop} is outside @layer base in the theme file ${file}: unlayered, it beats the library's :root.dark too, so a light value leaks into dark mode. Put the rule inside @layer base { }.`;
  for (const b of unlayered) if (!decls.some((d) => owner(d.at) === b)) add(b.at, leaks(`Rule ${quoted(b.prelude)}`));
  for (const d of decls) {
    const o = owner(d.at);
    if (o && done.has(o)) continue;
    if (!o || !ok.has(o)) {
      add(d.at, `${d.prop} ${o ? "directly in @layer base" : "outside any rule"} in the theme file ${file}: put it in :root (light) or :root.dark (dark), inside @layer base.`);
      continue;
    }
    const base = d.prop.match(/^--color-(klerosUIComponents\w*)$/)?.[1];
    if (base)
      add(d.at, `${d.prop} is Tailwind's alias of the token --${base} in the theme file ${file}: redefine --${base} itself, never the alias.`);
    else if (!/^--klerosUIComponents/.test(d.prop))
      add(d.at, `${d.prop} in the theme file ${file}: ${THEME_SHAPE}, and its rules set only the library's --klerosUIComponents* tokens, no other property or variable.`);
    else if (theme.names && !theme.names.has(d.prop))
      add(d.at, `${d.prop} is not a library token: the library's theme.css defines no such name. A theme sets only the library's own tokens (the list is in ${file}'s comments when npx -p @kleros/ui-components-library kleros-ui theme wrote it); check the spelling.`);
    if (unlayered.has(o)) add(d.at, leaks(d.prop));
    const bang = blankValue(d.value).search(/!\s*important\b/i);
    if (bang >= 0) add(d.valueAt + bang, `!important in ${d.prop} in the theme file ${file}: the theme wins by its import order after the library's theme.css; !important would also beat :root.dark, so a light value leaks into dark mode.`);
  }
  // CSS reads an escape as the plain letter (c\olor is color, !\important is !important), so one would hide a
  // property or an !important from the checks above, and the build would emit it. Token names and values need none, so
  // each backslash outside a string is a finding (none counted again inside a rule that already has one).
  const strings = clean.replace(/(["'])(?:\\.|(?!\1)[^\\\n])*\1?/g, (m) => " ".repeat(m.length));
  for (const m of strings.matchAll(/\\/g)) {
    const o = owner(m.index);
    if (!o || !done.has(o))
      add(m.index, `A backslash (a CSS escape) in the theme file ${file}: CSS reads it as the plain letter, so it can hide a property or !important from this check. Token names and values need none: write them out plainly.`);
  }
  return findings;
}

// The message for a token redefined outside the theme file (css-token). AGENTS.md "Themes" says it names the theme
// file and npx -p @kleros/ui-components-library kleros-ui theme, so it names the command that sets the file up even when a theme is declared.
function tokenMessage(prop, theme) {
  const alias = prop.match(/^--color-(klerosUIComponents\w*)$/)?.[1];
  const what = alias ? `${prop} redefines a library token through Tailwind's alias of --${alias}` : `${prop} redefines a library token`;
  const set = alias ? `--${alias} itself, never the alias,` : "tokens";
  if (theme?.file)
    return `${what} outside the theme file: set ${set} only in ${theme.file} (kleros-ui.json "theme", the file npx -p @kleros/ui-components-library kleros-ui theme sets up), on :root or :root.dark inside its @layer base.`;
  // theme writes a new file only, so with an undeclared src/theme.css already there "run npx -p @kleros/ui-components-library kleros-ui theme" would
  // lead to its refusal; the message names the two lines to add instead.
  if (taken(DEFAULT_THEME)) {
    // `css <path>` scans on with a kleros-ui.json that is not JSON, so this read must not throw.
    let cssEntry;
    try {
      cssEntry = config().cssEntry;
    } catch {
      // cssCounts has said why on stderr
    }
    const entry = appPath(cssEntry || "src/index.css");
    return `${what}, and ${CONFIG} declares no theme file. ${DEFAULT_THEME} is there, so npx -p @kleros/ui-components-library kleros-ui theme would refuse to write it: declare it with "theme": "${DEFAULT_THEME}" in ${CONFIG}, add @import "${importPath(entry, DEFAULT_THEME)}"; to ${entry} right after @import "${LIB_THEME}";, then set ${set} only there.`;
  }
  return `${what}, and this app has no theme file: run npx -p @kleros/ui-components-library kleros-ui theme (it writes ${DEFAULT_THEME} and imports it), then set ${set} only there.`;
}

// Every finding in one stylesheet, or in index.html's <style> blocks, local stylesheet links and style attributes.
// `theme` is themeInfo(); the declared theme file gets only its own findings, and every other file's token messages
// name it. With no theme declared, every file gets the same findings.
function scanCss(text, { file = "", theme = null, entry = null, scanned = null, chain = null, late = null } = {}) {
  const html = /\.html?$/i.test(file);
  const page = html ? htmlStyles(text) : null;
  // Tailwind inlines the theme file as plain CSS whatever its extension, where // starts no comment, so it is read
  // that way here too (a "theme" path ending in .scss would hide `// } .x { color: red; }` from the scan).
  const isTheme = Boolean(!page && theme?.file && file === theme.file);
  const clean = stripComments(page ? page.css : text, SLASH_COMMENTS.test(file) && !isTheme);
  const starts = [0];
  for (let i = 0; i < clean.length; i++) if (clean[i] === "\n") starts.push(i + 1);
  const where = (at) => {
    let lo = 0;
    let hi = starts.length - 1;
    while (lo < hi) {
      const mid = (lo + hi + 1) >> 1;
      if (starts[mid] <= at) lo = mid;
      else hi = mid - 1;
    }
    return [lo + 1, at - starts[lo] + 1];
  };
  const findings = [];
  // .sass and indented .styl: each line at column 0 is a rule (or an at-rule).
  const blocks =
    INDENTED.test(file) && !clean.includes("{") && !isTheme
      ? [...clean.matchAll(/^[^\s].*$/gm)].map((m) => ({ prelude: m[0].trim(), at: m.index, parent: null, block: !m[0].startsWith("@") }))
      : cssBlocks(clean);
  const name = file || "index.html";
  const placed = (list) => list.sort((a, b) => a.at - b.at).map((f) => ({ ...f, pos: where(f.at) }));
  // The declared theme file is not a stylesheet outside the entry, and its colour literals are its values.
  if (isTheme) return placed(themeFindings(clean, blocks, theme));
  if (page) {
    for (const at of page.tags) findings.push({ rule: CSS_TW, at, message: `<style> block in ${name}: Tailwind only, so no <style>. ${USE_CLASSES}` });
    for (const l of page.links)
      findings.push({ rule: CSS_TW, at: l.at, message: `<link rel="stylesheet" href="${l.href}"> in ${name} loads CSS of the app's own: Tailwind only, so no stylesheet besides the Tailwind entry, which src/main.tsx imports. ${USE_CLASSES}` });
    for (const a of page.attrs)
      findings.push({ rule: CSS_TW, at: a.at, message: `style attribute on <${a.el}> in ${name}: Tailwind only, so classes, not inline CSS. ${USE_CLASSES}` });
  } else if (TW_ENTRY.test(clean) || ((file === entry || chain?.has(resolve(file))) && reachesTailwind(file)))
    // The configured entry may reach tailwindcss through a stylesheet it @imports (src/global.css with @import "./tw.css"),
    // or through several (src/index.css, then middle.css, then tw.css): each one on the way is part of the entry.
    findings.push(...entryFindings(blocks, { theme, file, scanned, link: TW_ENTRY.test(clean) || file === entry ? null : entry, late }));
  else findings.push(...entryFindings(blocks, { outside: `a .${file.match(/\.(\w+)$/)?.[1] ?? "css"} file outside the Tailwind entry`, theme }));
  for (const b of blocks) {
    if (!b.block || atName(b.prelude)) continue;
    const hit = withoutNot(b.prelude).match(INTERNALS);
    if (hit)
      findings.push({
        rule: CSS_INTERNALS,
        at: b.at,
        message: `Selector ${quoted(b.prelude)} reaches into the library (${hit[0].startsWith("[") ? `${hit[0].replace(/\s+/g, "")}]` : hit[0]}): never restyle a library component from CSS. Use its className or inputProps, or leave it as it is and name it in your summary.`,
      });
  }
  for (const d of declarations(clean)) {
    // Tailwind's alias (--color-klerosUIComponentsPrimaryBlue) feeds every klerosUIComponents* utility, so redefining it
    // overrides the token too. It is a finding everywhere but the theme file; the message names
    // the theme file, or npx -p @kleros/ui-components-library kleros-ui theme when the app has none.
    const token = /^--(color-)?klerosUIComponents/.test(d.prop);
    if (token) findings.push({ rule: CSS_TOKEN, at: d.at, message: tokenMessage(d.prop, theme) });
    // On a token's own line "use a token, not a new colour" would send the agent to set the token to itself; a new
    // value is fine in the theme file, so the message points there (still counted as a colour literal).
    for (const [i, lit] of colourLiterals(d.prop, d.value))
      findings.push({
        rule: CSS_COLOUR,
        at: d.valueAt + i,
        message: token
          ? `Colour literal ${lit.trim()} in ${d.prop}: a token's new value, a hex included, goes only in ${theme?.file ? `the theme file ${theme.file}` : `the theme file that npx -p @kleros/ui-components-library kleros-ui theme sets up (${DEFAULT_THEME})`}; the css-token finding on this line says how.`
          : `Colour literal ${lit.trim()} in ${d.prop}: use a klerosUIComponents* token (var(--klerosUIComponentsPrimaryBlue) and so on), not a new colour.`,
      });
    const bang = blankValue(d.value).search(/!\s*important\b/i);
    if (bang >= 0)
      findings.push({
        rule: CSS_IMPORTANT,
        at: d.valueAt + bang,
        message: `!important in ${d.prop}: it forces a style over the library's own. Tailwind only: classes on your own elements, or the component's className or inputProps; a component that will not take a look that way is left as it is and named in your summary.`,
      });
  }
  return placed(findings);
}

// What the scan reads: every stylesheet Vite compiles (STYLESHEET) under kleros-ui.json's cssDirs, by
// default the app root, skipping node_modules, dist, dot folders and the folders .gitignore names; plus index.html at
// the app root or in src/ (Court's Vite root). `named` are the paths someone chose (the css command's arguments, or
// cssDirs): one that does not exist is reported.
// The declared theme file (`keep`) is always read, whatever its folder or extension, named
// or not, since Tailwind inlines any file an @import names.
function cssTargets(args = []) {
  if (args.length) {
    let theme;
    try {
      theme = config().theme;
    } catch {
      // cssCounts says why on stderr
    }
    const keep = typeof theme === "string" && theme.trim() ? args.filter((a) => appPath(a) === appPath(theme)) : [];
    return { paths: args, named: args, why: "named on the command line", keep };
  }
  const { cssDirs: dirs, theme, cssEntry } = config();
  // A cssDirs that is not a list of folders would scan nothing, or the letters of a string, and pass.
  if (dirs !== undefined && !(Array.isArray(dirs) && dirs.length && dirs.every((d) => typeof d === "string" && d.trim())))
    throw new Error(`kleros-ui: "cssDirs" in ${CONFIG} is ${JSON.stringify(dirs)}, not a list of folders: set it to the folders the CSS scan reads, from the app root, such as ["src"], or remove it to scan the whole app folder.`);
  const own = typeof theme === "string" && theme.trim() ? [theme] : [];
  // The Tailwind entry is read wherever cssDirs points, as the theme file is: the app loads it, so its own rules and its
  // import of the theme file are checked. One that is not there is skipped quietly; only a cssDirs folder is reported.
  const entry = typeof cssEntry === "string" && cssEntry.trim() ? cssEntry : "src/index.css";
  // So are the local stylesheets it reaches tailwindcss through (a nested entry's ./tw.css): its @import of one is the
  // nested entry's only when this scan reads that file too. One the walk skips (outside the app folder, in a dot folder,
  // node_modules, dist or a folder a .gitignore line names) stays unread, and its import a finding, as directive() says.
  const via = [];
  const skip = gitIgnored();
  const follow = (f, seen) => {
    for (const g of cssImports(f)) {
      const rel = toPosix(relative(".", g));
      const parts = rel.split("/");
      const skipped = parts.some((d, i) => d.startsWith(".") || skip(d, parts.slice(0, i + 1).join("/"), () => i < parts.length - 1));
      if (seen.has(g) || isAbsolute(rel) || skipped || !reachesTailwind(g)) continue;
      seen.add(g);
      via.push(rel);
      follow(g, seen);
    }
  };
  if (existsSync(entry)) follow(entry, new Set([resolve(entry)]));
  return { paths: [...(dirs || ["."]), "index.html", "src/index.html", entry, ...via, ...own], named: dirs || [], why: `in cssDirs of ${CONFIG}`, all: true, keep: own };
}
// The plain names and paths (no globs) in each .gitignore from the app folder up to its repo's root, the
// folder that holds .git (in a monorepo, generated folders such as coverage are often ignored there only; outside a
// repo, the app's own alone, as git reads them): a name is skipped at any depth, a path with a slash from the folder of
// the .gitignore that names it. As in git, the last line that matches decides, reading from the repo root's .gitignore
// down to the app's, so a "!" line takes back a folder an earlier line skips (styles, then !web/src/styles); a folder
// that is skipped is not walked, so nothing under it comes back, as git does not re-include it either. Always skipped:
// node_modules, dist and the app root's coverage/, where test runners write their report's CSS. As in git, a line
// ending in "/" names folders only: theme.css/ skips no file named theme.css, and no link (git does not follow one).
// skip(name, rel, isDir): whether the walk skips the entry `name` at `rel`, its path from the app folder; isDir() says
// whether that entry is a folder, and is called only for a line ending in "/".
function gitIgnored() {
  const here = resolve(".");
  const dirs = [here];
  for (let d = here; !existsSync(join(d, ".git")) && dirname(d) !== d; ) dirs.push((d = dirname(d)));
  if (!existsSync(join(dirs.at(-1), ".git"))) dirs.length = 1;
  const rules = [];
  for (const dir of dirs.reverse())
    for (const raw of readOr(join(dir, ".gitignore")).split("\n")) {
      let line = raw.trim();
      const folder = line.endsWith("/");
      line = line.replace(/\/+$/, "");
      if (line.startsWith("#")) continue;
      const keep = line.startsWith("!");
      if (keep) line = line.slice(1);
      if (!line || /[*?[\]\\]/.test(line)) continue;
      const path = line.replace(/^\/+/, "");
      rules.push(path.includes("/") || line.startsWith("/") ? { keep, folder, path: toPosix(relative(here, join(dir, path))) } : { keep, folder, name: line });
    }
  return (name, rel, isDir) => {
    if (name === "node_modules" || name === "dist" || rel === "coverage") return true;
    let skip = false;
    for (const r of rules) if ((r.name ? r.name === name : r.path === rel) && (!r.folder || isDir())) skip = !r.keep;
    return skip;
  };
}
// Links are followed, once per real folder, so a link back up the tree ends; a broken link or an entry that cannot be
// read is skipped instead of stopping the whole check.
function cssFiles(paths, keep = []) {
  const out = [];
  const missing = [];
  const seen = new Set();
  const skip = gitIgnored();
  const walk = (p, top) => {
    let st;
    let real;
    try {
      st = statSync(p);
      real = realpathSync(p);
    } catch {
      if (top) missing.push(p);
      return;
    }
    if (st.isDirectory()) {
      if (seen.has(real)) return;
      seen.add(real);
      let names = [];
      try {
        names = readdirSync(p).sort();
      } catch {
        return;
      }
      for (const d of names) {
        const rel = toPosix(relative(".", join(p, d)));
        const isDir = () => {
          try {
            return lstatSync(join(p, d)).isDirectory();
          } catch {
            return false;
          }
        };
        if (!d.startsWith(".") && !skip(d, rel, isDir)) walk(join(p, d), false);
      }
    } else if ((STYLESHEET.test(p) || (top && (/\.html?$/i.test(p) || keep.includes(p)))) && !seen.has(real)) {
      seen.add(real);
      out.push(p);
    }
  };
  for (const p of paths) walk(p, true);
  return { files: out, missing };
}
function cssCounts(targets = cssTargets()) {
  const counts = {};
  const messages = {};
  const lines = [];
  const { files, missing } = cssFiles(targets.paths, targets.keep);
  const lost = missing.filter((p) => targets.named.includes(p));
  for (const p of lost) console.error(`kleros-ui: ${p} does not exist, so the CSS scan skipped it (${targets.why})`);
  // `css <path>` scans the named files whatever kleros-ui.json holds; with a broken one it scans them without a theme
  // and says why in one line. The whole-app scan (check, baseline, css) stops on it.
  let theme = null;
  try {
    theme = themeInfo();
  } catch (e) {
    if (targets.all || !String(e?.message).startsWith("kleros-ui")) throw e;
    console.error(`${e.message} This scan of the files named reads no theme from it.`);
  }
  // The configured Tailwind entry: scanned as the entry even when it reaches tailwindcss only through an @import of a
  // stylesheet this scan also reads.
  const scanned = new Set(files.map((f) => resolve(f)));
  let entry = theme?.entry ?? null;
  if (!entry)
    try {
      entry = appPath(config().cssEntry || "src/index.css");
    } catch {
      // a broken kleros-ui.json: said above for the files named, and the whole-app scan stopped on it
    }
  // The scanned stylesheets the entry reaches through its relative @imports, at any depth (through files this scan
  // skips too), each with the last of the entry's own @imports that leads there (its offset and its path), and the
  // offset of the entry's import of the theme file: a stylesheet reached after that import loads after the theme.
  // A reference import loads no CSS, so it leads nowhere here.
  const chain = new Map();
  let themeAt = null;
  if (entry) {
    const top = resolve(entry);
    for (const { path, at, spec, reference } of cssImportsAt(top)) {
      if (reference) continue;
      if (theme?.file && themeAt === null && path === resolve(theme.file)) themeAt = at;
      const seen = new Set([top]);
      const walk = (g) => {
        if (seen.has(g)) return;
        seen.add(g);
        if (scanned.has(g) && at > (chain.get(g)?.at ?? -1)) chain.set(g, { at, via: spec });
        for (const h of cssImportsAt(g)) if (!h.reference) walk(h.path);
      };
      walk(path);
    }
  }
  const count = (rel, x) => {
    const key = `${rel}|${x.rule}`;
    const line = `${rel}:${x.pos[0]}:${x.pos[1]} ${x.message} (${x.rule})`;
    counts[key] = (counts[key] || 0) + 1;
    (messages[key] ||= []).push(line);
    lines.push(line);
  };
  for (const f of files) {
    const text = readFileSync(f, "utf8");
    const rel = toPosix(relative(process.cwd(), f)) || f;
    const reach = chain.get(resolve(f));
    const late = themeAt !== null && reach && reach.at > themeAt ? { entry, via: reach.via } : null;
    for (const x of scanCss(text, { file: rel, theme, entry, scanned, chain, late })) count(rel, x);
  }
  // A "theme" key that is not a path, or names no file, is a finding on the whole-app scan, not a silent pass.
  if (theme && targets.all) {
    if (theme.folder)
      count(theme.folder, { rule: CSS_THEME, pos: [1, 1], message: `${theme.folder} is a folder, and "theme" in ${CONFIG} names it: set the key to the theme file's path, such as "${DEFAULT_THEME}".` });
    else if (!theme.file)
      count(CONFIG, { rule: CSS_THEME, pos: [1, 1], message: `"theme" in ${CONFIG} is ${JSON.stringify(theme.given)}, not a path: set it to the theme file's path from the app root, such as "${DEFAULT_THEME}", or remove it.` });
    else if (!existsSync(theme.file))
      count(theme.file, { rule: CSS_THEME, pos: [1, 1], message: `${theme.file} does not exist, and "theme" in ${CONFIG} names it: run npx -p @kleros/ui-components-library kleros-ui theme to write it, or remove the key.` });
  }
  return { counts, messages, lines, files: files.length, lost: lost.length, theme: Boolean(theme) };
}
const plural = (n, word) => `${n} ${word}${n === 1 ? "" : "s"}`;
// An app that declares a theme gets one more count, "N theme", for its css-theme findings; with no theme declared,
// the line has no such count.
function cssSummary(r) {
  const n = total(r.counts);
  const of = (rule) => Object.entries(r.counts).reduce((a, [k, v]) => a + (k.endsWith(`|${rule}`) ? v : 0), 0);
  return `css: ${plural(n, "finding")} (${plural(of(CSS_TOKEN), "token override")}, ${plural(of(CSS_COLOUR), "colour literal")}, ${of(CSS_TW)} Tailwind-only, ${of(CSS_IMPORTANT)} !important, ${of(CSS_INTERNALS)} library internals${r.theme ? `, ${of(CSS_THEME)} theme` : ""}) in ${plural(r.files, "file")} scanned`;
}
// Exit 1 on a finding, 2 when a path named on the command line does not exist (a typo is not a clean scan).
// exitCode, not exit(), so a report written to a pipe is not cut off before Node has flushed it.
function cssCommand(paths) {
  const r = cssCounts(cssTargets(paths));
  for (const line of r.lines) console.log(line);
  console.log(cssSummary(r));
  process.exitCode = paths.length && r.lost ? 2 : total(r.counts) ? 1 : 0;
}

// ---- theme ----
// Sets up the app's one theme file: the scaffold (the library's token names and values from the theme.css the app
// resolves, as comments in @layer base { :root { } :root.dark { } }), kleros-ui.json's "theme" key, and the import in
// the Tailwind entry right after the library's theme.css. The path is the key's when it is set, else src/theme.css.
// Everything is checked before anything is written; an existing theme file is refused and named. The key and the
// import are written only when missing, so running it again after deleting the file writes the file alone.
function themeScaffold(entry, tokens) {
  const list = (pairs) => pairs.map(([n, v]) => `    /* ${n}: ${v}; */`).join("\n");
  return [
    `/* The app's theme. kleros-ui.json "theme" names this file, and ${entry} imports it right after the library's`,
    "   theme.css, so a value set here replaces the library's, for its components and the app's classes alike.",
    "   Each commented line is a library token with the library's own value. To change one, uncomment it and set the",
    "   value: in :root for light, in :root.dark for dark. A token set in :root only keeps the library's dark value.",
    "   npm run ui:check holds this file to this shape: @layer base, rules on :root and :root.dark only, the library's",
    "   own token names only, no !important. One theme per app, and no themes on a part of the page. The theme's",
    "   contrast is the app's to check: the library's own light theme has known AA contrast gaps. */",
    "@layer base {",
    "  :root {",
    list(tokens.light),
    "  }",
    "",
    "  :root.dark {",
    list(tokens.dark),
    "  }",
    "}",
    "",
  ].join("\n");
}

function themeCommand(args) {
  if (args.length) throw new Error(`kleros-ui theme: it takes no arguments (got ${args.join(" ")}); the file is the one kleros-ui.json's "theme" names, else ${DEFAULT_THEME}`);
  if (!existsSync("package.json")) throw new Error("kleros-ui theme: run it in the app root (no package.json here)");
  if (!existsSync(CONFIG)) throw new Error(`kleros-ui theme: no ${CONFIG} here; set the app up with npx -p @kleros/ui-components-library kleros-ui init (create runs it), then run theme`);
  const c = config();
  if (c.theme !== undefined && (typeof c.theme !== "string" || !c.theme.trim()))
    throw new Error(`kleros-ui theme: "theme" in ${CONFIG} is ${JSON.stringify(c.theme)}, not a path; set it to the theme file's path from the app root, such as "${DEFAULT_THEME}", or remove it`);
  const file = appPath(c.theme ?? DEFAULT_THEME);
  const entry = appPath(c.cssEntry || "src/index.css");
  const fail = (why) => {
    throw new Error(`kleros-ui theme: ${why} Nothing was written.`);
  };
  let text = null;
  try {
    text = readFileSync(entry, "utf8");
  } catch {
    // reported below, after the theme file itself
  }
  const clean = text === null ? "" : stripComments(text, false);
  const blocks = cssBlocks(clean);
  const libImport = blocks.find((b) => !b.block && !b.parent && atName(b.prelude) === "import" && atTarget(b.prelude) === LIB_THEME);
  const imported = blocks.some((b) => !b.block && atName(b.prelude) === "import" && importsFile(entry, atTarget(b.prelude), file));
  const line = `@import "${importPath(entry, file)}";`;
  if (taken(file)) {
    const todo = [
      c.theme === undefined && `set "theme": "${file}" in ${CONFIG}`,
      text !== null && !imported && `add ${line} to ${entry}, on the line after the library's theme.css import`,
    ].filter(Boolean);
    return fail(`${file} already exists, and theme writes a new file only. Edit that file as it is${todo.length ? `, and ${todo.join(" and ")}` : ""}. Or move it away and run npx -p @kleros/ui-components-library kleros-ui theme again.`);
  }
  if (text === null) return fail(`no Tailwind entry at ${entry} (kleros-ui.json "cssEntry"), so there is nowhere to import the theme.`);
  if (!libImport && !imported)
    return fail(`${entry} does not import ${LIB_THEME}, and the theme's import goes right after that one. Add @import "${LIB_THEME}"; after the tailwindcss import (as the starter's entry has it), then run npx -p @kleros/ui-components-library kleros-ui theme again.`);
  const lib = libraryThemeFile();
  if (!lib) return fail(`${LIB_THEME} does not resolve from this folder, so there are no token names to list. Install the library (npm install), then run npx -p @kleros/ui-components-library kleros-ui theme again.`);
  let tokens;
  try {
    tokens = libraryTokens(lib);
  } catch (e) {
    return fail(`${toPosix(lib)} could not be read (${e.code || e.message}).`);
  }
  if (!tokens.names.size) return fail(`${toPosix(lib)} declares no --klerosUIComponents* token on :root or :root.dark.`);

  // What theme writes, checked before the first write: no link and nothing outside the app (a "theme" of "../x.css").
  const dests = [[dirname(file), true], [file, false], ...(c.theme === undefined ? [[CONFIG, false]] : []), ...(imported ? [] : [[entry, false]])];
  const links = dests.map(([p, folder]) => writeProblem(p, { folder })).filter(Boolean);
  if (links.length) return fail(`${links.join("; ")}. ${WRITES_ONLY}.`);
  mkdir(dirname(file));
  write(file, themeScaffold(entry, tokens));
  const done = [`wrote ${file} (the library's ${tokens.light.length} light and ${tokens.dark.length} dark tokens, as comments)`];
  if (c.theme === undefined) {
    // After cssEntry, where a reader of kleros-ui.json looks for the CSS settings.
    const next = {};
    for (const [k, v] of Object.entries(c)) {
      next[k] = v;
      if (k === "cssEntry") next.theme = file;
    }
    writeJson(CONFIG, { ...next, theme: file });
    done.push(`set "theme": "${file}" in ${CONFIG}`);
  } else done.push(`kept "theme" in ${CONFIG}`);
  if (!imported) {
    // On the line after the library's import, past a comment that ends on that line; right after its ";" when another
    // statement or an open comment follows on it. A last import with no ";" gets one, or the two would run together.
    const semi = clean[libImport.end] === ";";
    let at = semi ? libImport.end + 1 : libImport.at + libImport.prelude.length;
    const nl = text.includes("\r\n") ? "\r\n" : "\n";
    const eol = text.indexOf(nl, at) < 0 ? text.length : text.indexOf(nl, at);
    const rest = text.slice(at, eol);
    const open = rest.lastIndexOf("/*");
    if (semi && !clean.slice(at, eol).trim() && (open < 0 || rest.indexOf("*/", open + 2) >= 0)) at = eol;
    write(entry, `${text.slice(0, at)}${semi ? "" : ";"}${nl}${line}${text.slice(at)}`);
    done.push(`added ${line} to ${entry}, right after the library's theme.css`);
  } else done.push(`${entry} already imports it`);
  console.log(`kleros-ui: ${done.join("; ")}`);
  console.log(
    `Next: uncomment the tokens to change in ${file} and set their values (:root for light, :root.dark for dark), then npm run ui:check. A theme's contrast is the app's to check.`,
  );
}

// ---- check ----
// A command that did not start (spawnSync's error, such as ENOENT with no npm or npx in PATH) is one line that names
// it, not a crash or a misleading hint.
const spawnFailed = (cmd, e) => `could not start ${cmd} (${e.code || e.message})`;
const npxFailed = (e, tool) => `kleros-ui: ${spawnFailed("npx", e)}, so ${tool} did not run. npx comes with npm: put the folder that holds them in PATH`;
// `tool` names what npx runs, for that line.
function run(cmd, args, env, tool) {
  const r = spawnSync(cmd, args, { stdio: "inherit", shell: false, env });
  if (r.error) console.error(npxFailed(r.error, tool));
  return r.status === 0;
}
// The folders to lint as ESLint operands: a folder named like an option (`--help`) gets "./" so ESLint lints it.
const lintOperands = (dirs) => dirs.map((d) => (d.startsWith("-") ? `./${d}` : d));
// ESLint as check and baseline run it: on kleros-ui.eslint.config.* (-c) when init wrote one, else on the app's own
// config. ESLINT_USE_FLAT_CONFIG makes ESLint 8 read -c as a flat config, as ESLint 9 does.
function eslintRun(args) {
  const own = CHECK_LINTS.find((f) => existsSync(f));
  return own
    ? { args: ["--no", "--", "eslint", "-c", own, ...args], env: { ...process.env, ESLINT_USE_FLAT_CONFIG: "true" } }
    : { args: ["--no", "--", "eslint", ...args], env: undefined };
}

// Lint baseline: error counts per file and rule, so an existing app's code (Court's, say) passes as it is
// and check fails only where a file gains errors. Works on any ESLint 9 (bulk suppressions need 9.24).
const BASELINE = "kleros-ui-baseline.json";
// The file is { version, lint, tsc, css }; an older one may lack css or tsc, or be the lint counts alone.
// The preset's two restrictions report as kleros-ui/no-restricted-syntax and kleros-ui/no-restricted-imports, so an
// app's own no-restricted-* options are not replaced. ui:baseline writes "version"; a baseline without it was recorded
// before the preset took these ids, and its counts under the core ids were the preset's, so they are read under the
// new ids (`legacyLintIds` marks it for check).
const RENAMED_LINT_IDS = { "no-restricted-syntax": "kleros-ui/no-restricted-syntax", "no-restricted-imports": "kleros-ui/no-restricted-imports" };
const readBaseline = () => {
  const raw = readJson(BASELINE, null);
  const b = raw && (raw.lint || raw.tsc || raw.css) ? raw : raw ? { lint: raw } : null;
  if (!b || b.version) return b;
  const lint = {};
  for (const [key, n] of Object.entries(b.lint || {})) {
    const cut = key.lastIndexOf("|");
    const id = RENAMED_LINT_IDS[key.slice(cut + 1)];
    const to = id ? `${key.slice(0, cut)}|${id}` : key;
    lint[to] = (lint[to] || 0) + n;
  }
  return { ...b, lint: b.lint && lint, legacyLintIds: true };
};
// With a baseline from before the rename, errors under the core no-restricted-syntax and no-restricted-imports come
// from the app's own config (the preset under the core ids replaced its options, so they were never counted) or from a
// preset that fell back to the core ids. They are reported, not failed, until ui:baseline records them, as cssCheck
// does for a baseline from before the CSS scan, so an upgrade does not stop an existing app on its existing code.
function lintCheck(base, dirs) {
  const current = lintCounts({ dirs });
  if (!current) return false;
  const parsed = parsedAll(current);
  const stale = staleDisables(current);
  for (const s of stale.notes) console.log(`note: ${s}`);
  if (!base.legacyLintIds) return newAgainst("lint", base.lint, current) && parsed;
  const own = Object.keys(current.counts).filter((k) => /\|no-restricted-(?:syntax|imports)$/.test(k));
  const n = own.reduce((a, k) => a + current.counts[k], 0);
  if (n)
    console.log(
      `lint: ${plural(n, "error")} under no-restricted-syntax or no-restricted-imports in ${plural(own.length, "file")}, not failing: ${BASELINE} predates the lint preset's own rule ids (it has no "version"): the preset reports its errors as kleros-ui/no-restricted-syntax and kleros-ui/no-restricted-imports and keeps the app's own options for the core rules. Run npm run ui:baseline once; check then fails on new ones.`,
    );
  const counts = { ...current.counts };
  for (const k of own) delete counts[k];
  // A preset error that an old comment no longer silences is the rename's doing too, so with a baseline from before
  // the rename it is reported (the notes above name each comment), not failed.
  let m = 0;
  for (const [k, c] of stale.covered) {
    const cut = Math.min(c, counts[k] || 0);
    counts[k] = (counts[k] || 0) - cut;
    m += cut;
  }
  if (m)
    console.log(
      `lint: ${plural(m, "error")} under an eslint-disable comment that names the old rule id (the notes above), not failing: ${BASELINE} predates the lint preset's own rule ids (it has no "version"). Change those comments, then run npm run ui:baseline once.`,
    );
  return newAgainst("lint", base.lint, { counts, messages: current.messages }) && parsed;
}
// An eslint-disable comment that names no-restricted-syntax or -imports (as one written for the preset under the core
// ids does) names the app's own rules, so it does not silence the preset (kleros-ui/...) and ESLint calls it unused.
// such comment over a preset error: a note naming the comment, the error and the id to write, and `covered`, the count
// per error key (and per unused-directive error, when the app makes those errors) that the comment meant to hide.
// The rule ids an eslint-enable comment that starts on lines[i] names ([] for a bare one), or null when none starts
// there, as ESLint 9 reads it: a block comment only (it ignores `// eslint-enable`), read to its
// */ across lines, the " -- " description cut from the whole comment, and quotes around an id dropped.
const enableIds = (lines, i) => {
  const at = lines[i].search(/\/\*\s*eslint-enable(?![\w-])/);
  if (at < 0) return null;
  const ids = lines.slice(i).join("\n").slice(at).split("*/")[0].replace(/^\/\*\s*eslint-enable/, "").split(/\s-{2,}\s/)[0];
  return ids.split(",").map((x) => x.trim().replace(/^(["']?)(.*)\1$/s, "$2")).filter(Boolean);
};
function staleDisables(current) {
  const covered = new Map();
  const notes = [];
  const fatal = new Set();
  // An error under two old comments is excused once.
  const seen = new Set();
  for (const s of current?.stale ?? []) {
    const id = RENAMED_LINT_IDS[s.id];
    let lines;
    try {
      lines = readFileSync(s.file, "utf8").split("\n");
    } catch {
      continue;
    }
    // From the comment's start to the end of the file, so a /* */ comment that spans lines reads whole.
    // ESLint's column does not count a byte-order mark on line 1, and a comment this cannot read covers nothing here
    // (it was read as a block disable, to the end of the file).
    const text = lines.slice(s.line - 1).join("\n").replace(/^\uFEFF/, "").slice(s.column - 1);
    const directive = text.match(/^(?:\/\/|\/\*)\s*eslint-disable(-next-line|-line)?(?![\w-])/);
    if (!directive) continue;
    const form = directive[1] ?? "";
    let from = s.line;
    let to = s.line;
    let enable = null;
    if (form === "-next-line") {
      // The line after the comment ends.
      const close = text.startsWith("/*") ? text.indexOf("*/") : 0;
      from = to = s.line + 1 + (text.slice(0, Math.max(close, 0)).match(/\n/g)?.length ?? 0);
    } else if (form === "") {
      // Only an eslint-enable that names this id, or no rule at all, ends it, as in ESLint.
      let ids = null;
      const on = lines.findIndex((l, i) => i >= s.line && (ids = enableIds(lines, i)) && (!ids.length || ids.includes(s.id)));
      to = on < 0 ? Infinity : on + 1;
      if (on >= 0 && ids.length) enable = `${s.file}:${on + 1}`;
    }
    const hits = current.errors.filter((e) => e.file === s.file && e.ruleId === id && e.line >= from && e.line <= to);
    if (!hits.length) continue;
    // The unused directive's own error (the app's reportUnusedDisableDirectives "error") is the rename's doing only
    // when the comment covers a preset error; one per comment, whichever ids it names.
    const at = `${s.file}:${s.line}:${s.column}`;
    if (s.severity === 2 && !fatal.has(at)) {
      fatal.add(at);
      covered.set(`${s.file}|fatal`, (covered.get(`${s.file}|fatal`) || 0) + 1);
    }
    for (const e of hits) if (!seen.has(e)) seen.add(e) && covered.set(e.key, (covered.get(e.key) || 0) + 1);
    // Renaming the disable alone leaves its eslint-enable naming the old id, so the new disable then runs
    // to the end of the file.
    const write = enable ? `Write ${id} in that comment and in the eslint-enable at ${enable} instead` : `Write ${id} in that comment instead`;
    notes.push(
      `${s.file}:${s.line} eslint-disable${form} names ${s.id}, which does not silence the lint preset: it reports ${hits.map((e) => `${s.file}:${e.line}`).join(", ")} as ${id}. ${write}, or better, use what the lint message names (a reviewer asks about every eslint-disable on a raw control: agent/REVIEW.md, part 5).`,
    );
  }
  return { covered, notes };
}
// npx --no -- : never download a missing eslint or tsc, and keep their flags away from npm.
// Also each error's place (`errors`) and each unused eslint-disable directive that names a renamed id
// (`stale`, a warning by ESLint 9's default, an error when the app sets reportUnusedDisableDirectives to "error").
// `dirs` are the folders to lint (lintTargets).
function lintCounts({ quiet = false, dirs } = {}) {
  const lint = eslintRun([...lintOperands(dirs), "-f", "json"]);
  const r = spawnSync("npx", lint.args, { encoding: "utf8", maxBuffer: 256 * 1024 * 1024, env: lint.env });
  if (r.error) {
    if (!quiet) console.error(npxFailed(r.error, "eslint"));
    return null;
  }
  let results;
  try {
    results = JSON.parse(r.stdout);
    if (!Array.isArray(results)) throw new Error("not a list of results");
  } catch {
    if (!quiet) process.stderr.write(r.stderr || r.stdout || "eslint printed no JSON report\n");
    return null;
  }
  const counts = {};
  const messages = {};
  const errors = [];
  const stale = [];
  const parse = [];
  for (const f of results) {
    const file = f.filePath.slice(process.cwd().length + 1);
    for (const m of f.messages) {
      // A comment naming several unused rules is one message, "... from 'a' or 'b')." (or "'a', 'b', or 'c'").
      const unused = m.ruleId ? null : String(m.message).match(/^Unused eslint-disable directive \(no problems were reported from ('.*')\)/)?.[1];
      for (const old of unused ? [...unused.matchAll(/'([^']+)'/g)].map((x) => x[1]) : [])
        if (RENAMED_LINT_IDS[old]) stale.push({ file, line: m.line, column: m.column, id: old, severity: m.severity });
      if (m.severity !== 2) continue;
      // A parse error is never counted: see parseErrors.
      if (m.fatal) {
        parse.push(`${file}:${m.line}:${m.column} ${m.message}`);
        continue;
      }
      const key = `${file}|${m.ruleId ?? "fatal"}`;
      counts[key] = (counts[key] || 0) + 1;
      (messages[key] ||= []).push(`${file}:${m.line}:${m.column} ${m.message} (${m.ruleId ?? "fatal"})`);
      errors.push({ file, key, line: m.line, ruleId: m.ruleId });
    }
  }
  return { counts, messages, errors, stale, parse };
}
// ESLint reports nothing else in a file it cannot parse, so a baseline that counted the parse error would pass any
// look violation in that file. So a parse error is never baselined: baseline refuses, and check fails on it, with a
// baseline or without. Most often the lint config has no TypeScript parser (init's, in an app with no config of its own).
const parseErrors = (parse) =>
  [
    `ESLint cannot parse ${plural(parse.length, "file")}, so it checks nothing else in ${parse.length === 1 ? "it" : "them"}:`,
    ...parse.map((p) => `  ${p}`),
    `The lint config needs a TypeScript parser, e.g. typescript-eslint's, as the starter's eslint.config.js sets it: { files: ["**/*.{ts,tsx}"], languageOptions: { parser: tseslint.parser } }. Or, if it has one, fix the syntax error.`,
  ].join("\n");
// Prints the parse errors; true when there are none.
const parsedAll = (current) => {
  if (current.parse.length) console.log(`lint: ${parseErrors(current.parse)}`);
  return !current.parse.length;
};
// Type-check baseline (Court had 243 errors, from code it generates at build). Counted per file,
// error code and message, without line numbers, so editing a file with old errors does not make them new.
const tsProject = () => (existsSync("tsconfig.app.json") ? "tsconfig.app.json" : "tsconfig.json");
// A key holds the message, and tsc writes some types as import("/abs/path/..."): the key has that path from the app
// folder, so a baseline recorded on one machine (or worktree, or CI runner) holds on another. Printed lines keep it.
const tscKey = (key) => key.replace(/import\("([^"]+)"\)/g, (all, p) => (isAbsolute(p) ? `import("${toPosix(relative(process.cwd(), p))}")` : all));
const tscKeys = (counts) => {
  const out = {};
  for (const [k, n] of Object.entries(counts || {})) out[tscKey(k)] = (out[tscKey(k)] || 0) + n;
  return out;
};
function tscCounts() {
  const r = spawnSync("npx", ["--no", "--", "tsc", "--noEmit", "--pretty", "false", "-p", tsProject()], { encoding: "utf8", maxBuffer: 256 * 1024 * 1024 });
  if (r.error) {
    console.error(npxFailed(r.error, "tsc"));
    return null;
  }
  const counts = {};
  const messages = {};
  const unlocated = [];
  for (const line of (r.stdout || "").split("\n")) {
    if (/^error TS\d+: /.test(line)) unlocated.push(line);
    const m = line.match(/^(.+?)\(\d+,\d+\): error (TS\d+): (.*)$/);
    if (!m) continue;
    const key = tscKey(`${m[1]}|${m[2]}|${m[3]}`);
    counts[key] = (counts[key] || 0) + 1;
    (messages[key] ||= []).push(line);
  }
  // An error with no file position (TS5083, a missing file in "extends"; TS2688; TS6059) is the tsconfig's, with no
  // file to count it under: never baselined, so check fails on it and baseline refuses, beside located errors too.
  if (unlocated.length) {
    console.log(`tsc: ${plural(unlocated.length, "error")} with no file position, which a baseline cannot hold; fix the tsconfig (or what it names):`);
    for (const line of unlocated) console.log(`  ${line}`);
    return null;
  }
  if (r.status !== 0 && !Object.keys(counts).length) {
    process.stderr.write(r.stderr || r.stdout || "tsc failed\n");
    return null;
  }
  return { counts, messages };
}
const total = (counts) => Object.values(counts).reduce((a, b) => a + b, 0);
function baseline() {
  // check fails on a lintDirs folder that is not there, so a baseline without it would hold too little.
  const targets = lintTargets();
  if (targets.missing.length) {
    console.error(
      `kleros-ui baseline: ${targets.missing.join(", ")} in "lintDirs" of ${CONFIG} ${targets.missing.length > 1 ? "are not folders" : "is not a folder"} here, so ESLint would not lint ${targets.missing.length > 1 ? "them" : "it"}. Fix "lintDirs" (the folders ui:check lints, from the app root). Nothing was recorded.`,
    );
    process.exit(1);
  }
  // check fails while the preset's Tailwind class rules are off, so a baseline taken then would hold none of their
  // findings, and the app's existing classes would fail check as new once the plugin is in.
  const libDir = appLibraryDir();
  const off = hasTailwind() && libDir && pluginProblem(realOrNull(libDir) ?? libDir);
  if (off) {
    console.error(
      `kleros-ui baseline: ${TW_PLUGIN} ${off}, so the lint preset's Tailwind class rules are off and the baseline would leave out their findings. Add it as a devDependency with the app's package manager (or reinstall it), then run npm run ui:baseline again. Nothing was recorded.`,
    );
    process.exit(1);
  }
  const lint = lintCounts({ dirs: targets.dirs });
  if (lint?.parse.length)
    throw new Error(`kleros-ui baseline: ${parseErrors(lint.parse)}\nNothing was recorded. Fix that, then run npm run ui:baseline again.`);
  const tsc = tscCounts();
  if (!lint || !tsc) {
    console.error(`kleros-ui baseline: ${[!lint && "ESLint", !tsc && "tsc"].filter(Boolean).join(" and ")} failed (above). Nothing was recorded.`);
    process.exit(1);
  }
  const css = cssCounts();
  // check fails on a cssDirs folder that does not exist (cssCheck), so a baseline without it would hold too little.
  if (css.lost) {
    console.error(`kleros-ui baseline: a folder in "cssDirs" of ${CONFIG} does not exist (above). Nothing was recorded.`);
    process.exit(1);
  }
  // "version" says the lint counts use the kleros-ui/ rule ids (readBaseline).
  writeJson(BASELINE, { version: pkg.version, lint: lint.counts, tsc: tsc.counts, css: css.counts });
  console.log(
    `kleros-ui: recorded ${total(lint.counts)} existing lint errors (ESLint on ${dirNames(targets.dirs)}), ${total(tsc.counts)} type errors and ${total(css.counts)} CSS findings in ${BASELINE}; check now fails only on new ones`,
  );
  // AGENTS.md "Existing apps" ends with ui:baseline after adding Tailwind: the block's step 0 goes with it.
  if (staleTailwindStep()) {
    writeBlock("AGENTS.md");
    console.log(`kleros-ui: rewrote the AGENTS.md block, which ${hasTailwind() ? "still said this app has no Tailwind" : "lacked the step that says this app has no Tailwind"}`);
  }
}
// Prints each file|rule (or file|code|message) whose count grew, with its current messages; true when none grew.
function newAgainst(label, base, current) {
  if (!current) return false;
  let ok = true;
  for (const [key, n] of Object.entries(current.counts)) {
    if (n <= (base[key] || 0)) continue;
    ok = false;
    console.log(`${label}: ${n - (base[key] || 0)} new (baseline ${base[key] || 0}):`);
    for (const line of current.messages[key]) console.log(`  ${line}`);
  }
  return ok;
}
// The app's CSS: with no baseline (a new app) every finding fails; with a baseline that has css counts, only new ones
// do. A baseline from before the CSS scan has no css counts: report, don't fail, so an existing app such as Court is
// not blocked by an upgrade; `ui:baseline` records them.
// `check --build` (the starter's build runs it first) ignores the baseline, here and for lint and tsc (check()),
// so a new app's findings cannot be baselined away before its build. init does not add it, so Court is unchanged.
// A cssDirs path that does not exist (cssCounts names it) fails too: the stylesheets meant there went unscanned.
function cssCheck(base, { build = false } = {}) {
  const css = cssCounts();
  const found = !css.lost;
  if (build) return newAgainst("css", {}, css) && found;
  if (base && !base.css) {
    const n = total(css.counts);
    if (n) console.log(`css: ${plural(n, "finding")} in the app's CSS, not failing: ${BASELINE} predates the CSS scan. Run npm run ui:baseline once; check then fails on new ones.`);
    return found;
  }
  return newAgainst("css", base?.css || {}, css) && found;
}
// An @source that points at no folder makes Tailwind scan nothing there, with no error, so the kit's
// layout classes are left out of the CSS (Court hoists the library: ../../node_modules/..., not ../node_modules/...).
// Each @source path (up to its first glob) must exist from the entry's folder.
// The library is the app's own copy (appLibraryDir), not this CLI's folder (npx -p <tgz> runs another).
// Whether Tailwind scans the kit is asked of the app's own Tailwind; a model of its walk written by hand kept missing
// cases. check loads @tailwindcss/node and @tailwindcss/oxide as the app resolves them (or as its @tailwindcss/vite or
// @tailwindcss/postcss does, where pnpm puts them), compiles the entry, builds the scanner's sources as
// @tailwindcss/postcss and @tailwindcss/vite do, and fails when a dist/kit/*.js file of the library is not among the
// files the scanner lists (by real path).
// - Base: with no source(...) on the tailwindcss import (root null), Tailwind's own detection starts at Vite's root,
//   taken to be the app folder. An app whose Vite config sets another root (Court's sets "src") is a known limit.
// - Trust: compile() runs the code the entry's @plugin and @config lines name, as the build does; ui:check already runs
//   the app's ESLint config and tsc.
// - The app's Tailwind not loading, older than 4.1 (its compile() gives no sources), or the entry not
//   compiling here (an @import through a Vite alias): a note, never a failure.
// - No timeout; a compile and scan over 3 s gets one note. On an npm ci of a starter app's lockfile (no git), the starter's
//   entry lists 296 files in 0.2 s, an entry with no @source 13 (Tailwind's detection skips node_modules without git
//   too), and @source "../node_modules" 25,651 (2.8 s).
const SLOW_SCAN_MS = 3000;
const firstLine = (e) => String(e?.message ?? e).split("\n")[0];
async function sourceProblems(notes = []) {
  const entry = config().cssEntry || "src/index.css";
  let css;
  try {
    css = readFileSync(entry, "utf8");
  } catch {
    return [];
  }
  const text = stripComments(css, false);
  if (!reachesTailwind(entry)) return [];
  const from = dirname(entry);
  const problems = [];
  const given = [...text.matchAll(/@source\s+(?!not\s|inline\s*\()(?:"([^"]*)"|'([^']*)')/g)].map((m) => m[1] ?? m[2]);
  for (const g of given) {
    const fixed = g.split("/").findIndex((s) => /[*?{}[\]]/.test(s));
    const path = fixed < 0 ? g : g.split("/").slice(0, fixed).join("/") || ".";
    if (!realOrNull(resolve(from, path))) problems.push(`${entry}: @source "${g}" points at no folder from ${from}/, so Tailwind scans nothing there`);
  }
  const lib = appLibraryDir();
  if (!lib) {
    problems.push(`${entry}: ${LIB} is not installed in this folder or a folder above it (no node_modules/${LIB}), so check cannot tell whether Tailwind scans it. Run npm install, then npm run ui:check again`);
    return problems;
  }
  const kitDir = join(lib, "dist", "kit");
  const kit = existsSync(kitDir) ? readdirSync(kitDir).filter((f) => f.endsWith(".js")).sort() : [];
  if (!kit.length) return problems;
  const app = resolve(".");
  const req = createRequire(join(app, "package.json"));
  let r, tailwind, Scanner, error;
  for (const via of [null, "@tailwindcss/vite", "@tailwindcss/postcss"]) {
    try {
      r = via ? createRequire(req.resolve(via)) : req;
      tailwind = r("@tailwindcss/node");
      ({ Scanner } = r("@tailwindcss/oxide"));
      break;
    } catch (e) {
      error ??= e;
      tailwind = null;
    }
  }
  if (!tailwind) {
    notes.push(`${entry}: check could not load this app's @tailwindcss/node and @tailwindcss/oxide (${firstLine(error)}), so it did not check that Tailwind scans the kit's files. @tailwindcss/vite and @tailwindcss/postcss install both; reinstall with the app's package manager`);
    return problems;
  }
  const t0 = Date.now();
  let listed;
  try {
    const compiler = await tailwind.compile(css, { base: resolve(from), from: resolve(entry), onDependency() {} });
    if (!Array.isArray(compiler.sources)) {
      notes.push(
        `${entry}: this app's Tailwind is ${r("tailwindcss/package.json").version}, and check needs 4.1 or later to ask it which files it scans, so it did not check the kit's. Before 4.1, an @source on a folder in node_modules (the starter's line) scans none of it, and the build leaves out the kit's classes. Move to tailwindcss@^4.1.17 and @tailwindcss/vite@^4.1.17 (the lint plugin's floor; AGENTS.md ${EXISTING_APPS})`,
      );
      return problems;
    }
    const root = compiler.root;
    const sources = (root === "none" ? [] : root === null ? [{ base: app, pattern: "**/*", negated: false }] : [{ ...root, negated: false }]).concat(compiler.sources);
    const scanner = new Scanner({ sources });
    scanner.scan();
    listed = scanner.files;
  } catch (e) {
    notes.push(`${entry}: the app's Tailwind did not compile it here (${firstLine(e)}), so check did not check that Tailwind scans the kit's files. check resolves @import as Node does, not through Vite aliases; the build shows the error if it is real`);
    return problems;
  }
  const ms = Date.now() - t0;
  // A listed file counts when its real path is a kit file's (pnpm and npm link list the path through the link). The
  // native realpath, stopping once every kit file is found: 25,651 listed files took 0.6 s with it, 1.3 s without.
  const unseen = new Map(kit.map((f) => [realOrNull(join(kitDir, f)), f]));
  for (const f of listed) {
    if (!unseen.size) break;
    try {
      unseen.delete(realpathSync.native(f));
    } catch {
      // listed, then gone
    }
  }
  const missed = [...unseen.values()];
  if (missed.length) {
    // With the library's folder named and an @source not taking the files back out, the fix is that line.
    const all = missed.length === kit.length;
    const named = given.some((g) => resolve(from, g) === lib);
    const nots = [...text.matchAll(/@source\s+not\s+("[^"]*"|'[^']*')/g)].map((m) => `@source not ${m[1]}`);
    const not = nots.length && `@source not takes the files it names out of that scan (${nots.join(", ")}): delete or narrow any that covers the library`;
    const add = `Add @source "${toPosix(relative(resolve(from), lib))}"; (the starter's line, with the path from ${from}/ to the library; AGENTS.md ${EXISTING_APPS})`;
    const upper = [...new Set([...text.matchAll(/@source\b/gi)].map((m) => m[0]).filter((s) => s !== "@source"))];
    problems.push(
      `${entry}: ${all && !named ? "no @source reaches the library" : `the @source lines reach ${all ? "none" : "only part"} of the library's kit`}, so Tailwind leaves out the kit's classes (layout, rows, gutters): the app's own Tailwind, run on this entry, does not scan ${all ? "any" : `${missed.length}`} of the kit's ${kit.length} files in ${toPosix(relative(".", kitDir))}/ (${missed.join(", ")}). ${named && not ? not : [add, not].filter(Boolean).join(". ")}${upper.length ? `. ${upper.join(", ")} is not read by Tailwind, which reads @source in lower case only` : ""}`,
    );
  }
  if (ms > SLOW_SCAN_MS) {
    const libs = [lib, realOrNull(lib)].map((d) => d + sep);
    const nm = listed.filter((f) => f.split(sep).includes("node_modules") && !libs.some((d) => f.startsWith(d))).length;
    notes.push(
      `${entry}: the app's Tailwind took ${(ms / 1000).toFixed(1)} s to compile it and list the ${listed.length} files it scans${nm ? `, ${nm} of them in node_modules outside the library` : ""}; the build and the dev server spend that too.${nm ? ' An @source that names a folder holding node_modules (such as "../node_modules") makes Tailwind read every file in it; the starter\'s names the library\'s folder only.' : ""}`,
    );
  }
  return problems;
}
const realOrNull = (p) => {
  try {
    return realpathSync(p);
  } catch {
    return null;
  }
};
// The library as the app resolves it: node_modules/@kleros/ui-components-library in the app's folder or
// the nearest folder above it that has one (a workspace that hoists it, as Court's does), as the path through any link
// (pnpm links it from its store); null when the app has none.
function appLibraryDir() {
  for (let d = resolve("."); ; d = dirname(d)) {
    const p = join(d, "node_modules", LIB);
    if (existsSync(join(p, "package.json"))) return p;
    if (dirname(d) === d) return null;
  }
}
// Why the lint preset in the library at `lib` runs without its Tailwind class rules, or null. The preset imports the
// plugin and takes its default export, and turns the rules off when that throws or gives nothing; a Node child does the
// same from `lib`, so the plugin resolves as it does for the preset and its code does not run in check.
const TW_PLUGIN = "eslint-plugin-better-tailwindcss";
function pluginProblem(lib) {
  if (!packageDir(TW_PLUGIN, lib)) return `does not resolve from the app's copy of ${LIB}`;
  // NODE_OPTIONS is the app's: a --require or --import path in it is relative to the app, not to `lib`, and the probe
  // needs none of it. The error is read from its own marked line, not from whatever else Node printed.
  const probe = `try { const m = await import(${JSON.stringify(TW_PLUGIN)}); if (!m.default) throw new Error("it has no default export"); process.exit(0); } catch (e) { console.error("kleros-ui-probe: " + String(e?.message ?? e).split("\\n")[0]); process.exit(1); }`;
  const load = spawnSync(process.execPath, ["--input-type=module", "-e", probe], { cwd: lib, encoding: "utf8", timeout: 60000, env: { ...process.env, NODE_OPTIONS: "" } });
  if (load.status === 0) return null;
  const marked = (load.stderr || "").split("\n").find((l) => l.startsWith("kleros-ui-probe: "));
  const why = marked?.slice("kleros-ui-probe: ".length) || firstLine(load.error ?? `exit ${load.status ?? load.signal}`);
  return `is installed but fails to load from the app's copy of ${LIB} (${why})`;
}

// The library's style.css must load before the Tailwind entry: the library's JS imports it too, so
// without that line it lands after the app's Tailwind, and its plain classes (flex-col, px-4) beat the app's sm:, lg:
// ones. Scripts: the app's .js/.ts/.jsx/.tsx files (not node_modules, dist, dot folders or what .gitignore names); an
// import of the entry by a relative path, or "/src/index.css" as Vite allows. A note when none imports it.
// ES modules run their imports in order, depth first, and Vite emits the CSS in that order, so check
// walks the static imports in order from the JS entry (index.html's module script, else main.* or index.*, then any
// script nothing imports) and reports a script that reaches the entry before style.css along that walk.
const SCRIPT_FILE = /\.(?:[cm]?[jt]sx?)$/;
const SCRIPT_EXT = [".tsx", ".ts", ".jsx", ".js", ".mts", ".cts", ".mjs", ".cjs"];
const LIB_STYLE = `${LIB}/style.css`;
function styleOrder(entry, notes) {
  const target = resolve(entry);
  const skip = gitIgnored();
  const known = new Set();
  const walk = (dir) => {
    let list = [];
    try {
      list = readdirSync(dir, { withFileTypes: true });
    } catch {
      return;
    }
    for (const d of list) {
      const p = join(dir, d.name);
      const rel = toPosix(relative(".", p));
      if (d.name.startsWith(".") || skip(d.name, rel, () => d.isDirectory())) continue;
      if (d.isDirectory()) walk(p);
      else if (SCRIPT_FILE.test(d.name) && !/\.d\.[cm]?ts$/.test(d.name)) known.add(resolve(p));
    }
  };
  walk(".");
  // A script's static imports and re-exports, in order (`import type` is erased, so it is not followed).
  const specsOf = new Map();
  const specs = (file) => {
    if (!specsOf.has(file)) {
      let text = "";
      try {
        // A byte-order mark would hide the first import from the line-start match; Vite ignores it.
        text = readFileSync(file, "utf8").replace(/^\uFEFF/, "");
      } catch {
        // unreadable: no imports
      }
      specsOf.set(file, [...stripComments(text, true).matchAll(/^[ \t]*(?:import|export)\s+(?!type\s)(?:[\w$*{}\s,]+?\s+from\s*)?(["'])([^"'\n]+)\1/gm)].map((m) => m[2]));
    }
    return specsOf.get(file);
  };
  const isEntry = (file, spec) =>
    !/[?#]/.test(spec) &&
    (/^\.{1,2}\//.test(spec) ? resolve(dirname(file), spec) === target : spec.startsWith("/") && [resolve(`.${spec}`), resolve("src", `.${spec}`)].includes(target));
  // The app script a relative (or /src/...) import names, with the extensions Vite tries; a .js name may be a .ts file.
  const script = (file, spec) => {
    if (/[?#]/.test(spec)) return null;
    const bases = /^\.{1,2}\//.test(spec) ? [resolve(dirname(file), spec)] : spec.startsWith("/") ? [resolve(`.${spec}`), resolve("src", `.${spec}`)] : [];
    for (const b of bases) {
      const ts = /\.[cm]?jsx?$/.test(b) ? [b.replace(/\.js$/, ".ts"), b.replace(/\.jsx?$/, ".tsx"), b.replace(/\.mjs$/, ".mts"), b.replace(/\.cjs$/, ".cts")] : [];
      const hit = [b, ...ts, ...SCRIPT_EXT.map((e) => b + e), ...SCRIPT_EXT.map((e) => join(b, `index${e}`))].find((c) => known.has(c));
      if (hit) return hit;
    }
    return null;
  };
  const importers = [...known].filter((f) => specs(f).some((s) => isEntry(f, s))).sort();
  if (!importers.length) {
    notes.push(
      `no script imports ${entry} (the Tailwind entry) by a relative path, so check could not tell whether ${LIB_STYLE} comes before it. The JS entry (src/main.tsx in the starter) imports "${LIB_STYLE}" first, then the Tailwind entry (AGENTS.md ${EXISTING_APPS})`,
    );
    return [];
  }
  // Where the walks start: index.html's module scripts, then main.* and index.*, then the other scripts nothing imports.
  const html = [];
  for (const page of ["index.html", join("src", "index.html")]) {
    let text = "";
    try {
      text = readFileSync(page, "utf8");
    } catch {
      continue;
    }
    for (const m of text.matchAll(/<script\b[^>]*\btype\s*=\s*["']?module["']?[^>]*\bsrc\s*=\s*["']([^"']+)["']|<script\b[^>]*\bsrc\s*=\s*["']([^"']+)["'][^>]*\btype\s*=\s*["']?module/gi)) {
      const src = m[1] ?? m[2];
      if (/^(?:[a-z][a-z0-9+.-]*:)?\/\//i.test(src)) continue;
      const p = resolve(dirname(page), src.startsWith("/") ? `.${src}` : src);
      if (known.has(p)) html.push(p);
    }
  }
  const imported = new Set([...known].flatMap((f) => specs(f).map((s) => script(f, s)).filter((r) => r && r !== f)));
  const loose = [...known].filter((f) => !imported.has(f)).sort();
  const main = (f) => /^(?:main|index)\.[cm]?[jt]sx?$/.test(basename(f));
  // With no module script in index.html, the JS entry's walk still comes first, so it gets the one alias note:
  // src/main.* or src/index.*, then the shallowest (src/components/Button/index.ts sorts before src/main.tsx).
  const rank = (f) => (dirname(f) === resolve("src") ? 0 : toPosix(relative(".", f)).split("/").length);
  const mains = loose.filter(main).sort((a, b) => rank(a) - rank(b) || (a < b ? -1 : 1));
  const starts = [...new Set([...html, ...mains, ...loose, ...importers])];
  const problems = [];
  const visited = new Set();
  const why = `so the library's CSS lands after the app's Tailwind and its plain classes (flex-col, hidden, px-4) beat the app's sm:, lg: and @sm: ones`;
  // An alias ("@/App", "~/App" or "#app" through resolve.alias, vite-tsconfig-paths or package.json
  // imports; Court's "components/...", a name in src/ or the app root that is no installed package; "@app/App",
  // a scoped name no node_modules up the tree has) is not resolved here, though its target runs at that point.
  // Before style.css, the walk stops there with a note. And once any walk has met one, what a later walk reports is a
  // note: the file it starts from may run through the alias, after style.css or before it (vite build gave both a
  // false failure and a false pass).
  const alias = (spec) => {
    if (/^(?:@\/|~|#)/.test(spec)) return true;
    const scoped = spec.startsWith("@");
    const name = spec.split("/", scoped ? 2 : 1).join("/");
    if (/^[./]/.test(spec) || /^[a-z][\w+.-]*:/i.test(spec) || builtinModules.includes(name)) return false;
    if (!scoped && !["src", "."].some((d) => taken(join(d, name)) || SCRIPT_EXT.some((e) => taken(join(d, name + e))))) return false;
    for (let d = resolve("."); ; d = dirname(d)) {
      if (taken(join(d, "node_modules", name))) return false;
      if (dirname(d) === d) return true;
    }
  };
  let unknown = null;
  const report = (p) =>
    unknown
      ? notes.push(`${p}. Not failing: ${unknown.at} imports "${unknown.spec}", which check cannot follow (an alias; it reads relative imports only), so this script may run through it, in another order`)
      : problems.push(p);
  for (const start of starts) {
    if (visited.has(start)) continue;
    let style = false;
    // True when the walk stopped at an alias.
    const visit = (file) => {
      if (visited.has(file)) return false;
      visited.add(file);
      const list = specs(file);
      for (const spec of list) {
        if (spec === LIB_STYLE) style = true;
        else if (isEntry(file, spec)) {
          if (style) continue;
          const rel = toPosix(relative(".", file));
          const via = file === start ? "" : ` (${toPosix(relative(".", start))} reaches it before any import of ${LIB_STYLE})`;
          if (list.indexOf(LIB_STYLE) > list.indexOf(spec))
            report(`${rel} imports ${spec} (the Tailwind entry) before ${LIB_STYLE}${via}, ${why}. Move import "${LIB_STYLE}"; to the line before import "${spec}"; (AGENTS.md ${EXISTING_APPS})`);
          else report(`${rel} imports ${spec} (the Tailwind entry) without ${LIB_STYLE}${via}, ${why}. Add import "${LIB_STYLE}"; on the line before import "${spec}"; (AGENTS.md ${EXISTING_APPS})`);
        } else if (alias(spec)) {
          // One note, for the first alias any walk meets (the JS entry's walk comes first): past it, the scripts a walk
          // starts from (hooks, utils) are mostly ones the app imports through aliases, so a note on each is noise.
          const first = !unknown;
          unknown ??= { at: toPosix(relative(".", file)), spec };
          if (style) continue;
          if (first)
            notes.push(
              `${toPosix(relative(".", file))} imports "${spec}" before ${LIB_STYLE}, and check cannot follow it (an alias; it reads relative imports only), so it cannot tell whether that import loads ${entry} first. Import "${LIB_STYLE}" before it (AGENTS.md ${EXISTING_APPS})`,
            );
          return true;
        } else {
          const next = script(file, spec);
          if (next && visit(next)) return true;
        }
      }
      return false;
    };
    visit(start);
  }
  return problems;
}

// `notes` collects what check prints as a note and never fails on: a registry entry with no intent words and, from
// styleOrder, no script found that imports the Tailwind entry.
// Async only because sourceProblems awaits the app's Tailwind compile(); sourceProblems adds its notes.
async function setupProblems(notes = []) {
  const c = config();
  const problems = [];
  const agents = existsSync("AGENTS.md") ? readFileSync("AGENTS.md", "utf8") : "";
  const m = findMarker(agents, START_VERSION);
  const tailwind = hasTailwind();
  // Tailwind only for all: an app without Tailwind fails setup until it adds it; init does not add it.
  if (!tailwind)
    problems.push(`no Tailwind: tailwindcss is not in package.json. Add it with the steps in ${libPath()}/agent/AGENTS.md ${EXISTING_APPS}; new UI is Tailwind only, and the app's existing styled-components code and CSS stay, through ui:baseline`);
  else {
    // The @source, theme import and style.css order checks read the entry kleros-ui.json names, and skip an app with
    // none (no stylesheet yet). One that is missing, or does not import tailwindcss, while another stylesheet does
    // would skip them silently: a problem.
    const entry = c.cssEntry || "src/index.css";
    let css = null;
    try {
      css = stripComments(readFileSync(entry, "utf8"), false);
    } catch {
      // no entry: nothing to order
    }
    // Through a stylesheet it @imports too, as init's tailwindEntries counts it (src/index.css with @import "./tw.css").
    const tw = css !== null && reachesTailwind(entry);
    if (!tw) {
      const others = tailwindEntries().filter((f) => f !== appPath(entry));
      if (others.length)
        problems.push(
          `"cssEntry" in ${CONFIG} is ${entry}, which ${css === null ? "does not exist" : "does not import tailwindcss"}, while ${others.join(", ")} ${others.length > 1 ? "import" : "imports"} it, so check skipped the Tailwind entry's @source, theme import and import order. Set "cssEntry" in ${CONFIG} to the app's Tailwind entry, then run npx -p @kleros/ui-components-library kleros-ui init again, which sets it in the cssEntry the lint config passes to klerosUI() too`,
        );
    }
    problems.push(...(await sourceProblems(notes)));
    // style.css order only with a Tailwind entry to import (an app without Tailwind, Court today, is told to add it).
    if (tw) problems.push(...styleOrder(entry, notes));
    // The preset's class rules load eslint-plugin-better-tailwindcss from the app's copy of the library and are off
    // without it, so ui:check would pass any class: a setup problem (PR #127 review, before the pilot), though the
    // plugin stays an optional peer, as an app that only renders the components needs no lint. The preset turns the
    // rules off on any import error too (a broken install, a missing dependency of the plugin, a Node it does not
    // support), so a plugin that is there is loaded as the preset loads it, from the app's copy of the library.
    const lib = appLibraryDir();
    const off = lib && pluginProblem(realOrNull(lib) ?? lib);
    if (off)
      problems.push(
        `${TW_PLUGIN} ${off}, so the lint preset's Tailwind class rules (palette colours, spacing steps, radius, type size and weight, dark: overrides) are off, and kleros-ui check fails until they are on. ${off.startsWith("does not resolve") ? `Add it as a devDependency with the app's package manager (AGENTS.md ${EXISTING_APPS} does, before ui:baseline)` : "Reinstall it with the app's package manager, or install a version that supports this Node"}`,
      );
  }
  // The lint config init wrote (the one check lints with) passes kleros-ui.json's cssEntry and the folders ui:check
  // lints to klerosUI(). A copy that differs (cssEntry set by hand in kleros-ui.json, a folder added) reads another
  // stylesheet's classes, or leaves folders without the preset's rules.
  const lintFile = CHECK_LINTS.find((f) => existsSync(f)) ?? LINT_CONFIGS.find((f) => existsSync(f));
  const lintText = lintFile ? readOr(lintFile) : "";
  const drift = lintText.startsWith(MANAGED) || lintText.startsWith(CHECK_LINT_HEAD) ? presetDrift(lintText) : null;
  if (drift) problems.push(...presetProblems(lintFile, drift));
  const react = reactProblems();
  if (react.length) problems.push(reactProblem(react));
  if (!m) problems.push("AGENTS.md has no kleros-ui block: run npx -p @kleros/ui-components-library kleros-ui init");
  // A block from another release of the same major only needs sync, so a library update warns and does not fail CI;
  // one from another major fails, as its rules can name what the installed major does not have. A same-major block's
  // text is still held to this release's: the old styled-components one and a stale step 0 fail as they do here.
  else {
    const sameMajor = m[1].split(".")[0] === pkg.version.split(".")[0];
    if (m[1] !== pkg.version)
      (sameMajor ? notes : problems).push(`AGENTS.md block is for ${m[1]}, installed ${pkg.version}: run npx -p @kleros/ui-components-library kleros-ui sync`);
    if (!sameMajor);
    else if (currentBlock().includes("styles its own code with styled-components"))
      problems.push("AGENTS.md block is the old styled-components one: run npx -p @kleros/ui-components-library kleros-ui sync (Tailwind only for all)");
    else if (tailwind && staleTailwindStep()) problems.push("AGENTS.md block still says this app has no Tailwind: run npx -p @kleros/ui-components-library kleros-ui sync");
  }
  const dir = c.componentsDir || "src/components";
  const existing = new Set((c.components || []).filter((x) => x.status === "existing").map((x) => x.name));
  // Stories only when the app has Storybook; index.ts and the registry entry for every app.
  const stories = hasStorybook();
  if (existsSync(dir))
    for (const name of readdirSync(dir, { withFileTypes: true }).filter((d) => d.isDirectory() && !existing.has(d.name)).map((d) => d.name)) {
      const base = join(dir, name);
      const files = readdirSync(base);
      if (stories && !files.some((f) => f.endsWith(".stories.tsx"))) problems.push(`${base}: no ${name}.stories.tsx (Default, Dark and its states; this app has Storybook)`);
      if (!files.includes("index.ts")) problems.push(`${base}: no index.ts`);
      const main = join(base, `${name}.tsx`);
      // The folder name as text: a hand-made "Foo(" is no regular expression.
      if (existsSync(main) && !new RegExp(`export (interface|type) ${name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}Props`).test(readFileSync(main, "utf8")))
        problems.push(`${main}: export a ${name}Props type with JSDoc on each prop`);
      if (!(c.components || []).some((x) => x.name === name)) problems.push(`${base}: not in ${CONFIG}; add {name, status: "local", intent, importPath}`);
    }
  // A new single-file component needs its registry entry too.
  if (existsSync(dir))
    for (const f of readdirSync(dir).filter((f) => COMPONENT_FILE.test(f))) {
      const name = f.replace(/\.tsx$/, "");
      if (!existing.has(name) && !(c.components || []).some((x) => x.name === name))
        problems.push(`${join(dir, f)}: not in ${CONFIG}; add {name, status: "local", intent, importPath}`);
    }
  // An entry with no intent words is one the next lookup in kleros-ui.json cannot find by what it does.
  // A note, never a failure, under --build too. Entries init recorded as "existing" (Court's) have none and are skipped.
  const hasWords = (v) => (Array.isArray(v) ? v : [v]).some((w) => typeof w === "string" && w.trim());
  for (const x of c.components || [])
    if (x?.status !== "existing" && x?.name && !hasWords(x.intent))
      notes.push(`${CONFIG}: ${x.name} has no intent words, so the next lookup cannot find it by what it does. Add what someone would search for to its "intent" array, e.g. ["period badge", "status chip"] (npx -p @kleros/ui-components-library kleros-ui new <Name> --intent "words" writes them)`);
  return problems;
}
// `--build` is what the starter's build runs first (`kleros-ui check --build && vite build`; create adds it as a
// prebuild when it keeps an app's own build). The same checks, with two differences:
// - an agent block that only needs `sync` (a library upgrade), or no agent block at all (a build context without
//   AGENTS.md, such as a Docker image that leaves out *.md), is a note, not a failure;
// - no baseline applies: lint, tsc and CSS findings all stop the build, so `ui:baseline` cannot switch
//   the build check off in a new app.
// exitCode, not exit(), so a piped report is complete.
const BUILD_NOTES = /run npx -p @kleros\/ui-components-library kleros-ui sync|has no kleros-ui block/;
// Async for setupProblems alone. tsc, lint and css still run first and in order, and the output order
// and exit code are as before.
async function check({ build = false } = {}) {
  const base = build ? null : readBaseline();
  const okTsc = base?.tsc ? newAgainst("tsc", tscKeys(base.tsc), tscCounts()) : run("npx", ["--no", "--", "tsc", "--noEmit", "-p", tsProject()], undefined, "tsc");
  // With no baseline ESLint prints its own report; when it fails, a second run in JSON finds the eslint-disable
  // comments that name the old ids and the files ESLint cannot parse, so an app with no baseline learns why too.
  const lintWhy = (current) => {
    for (const s of staleDisables(current).notes) console.log(`note: ${s}`);
    if (current) parsedAll(current);
    return false;
  };
  // The folders ESLint lints, named; a lintDirs folder that is not there fails, as a missing cssDirs one does.
  const targets = lintTargets();
  const dirs = targets.dirs.filter((d) => !targets.missing.includes(d));
  console.log(`lint: ESLint on ${dirNames(targets.dirs)} (${targets.why})`);
  for (const d of targets.missing) console.log(`lint: ${d} is not a folder here, so ESLint did not lint it ("lintDirs" in ${CONFIG})`);
  const plain = eslintRun(lintOperands(dirs));
  const lintRan = !dirs.length ? false : base?.lint ? lintCheck(base, dirs) : run("npx", plain.args, plain.env, "eslint") || lintWhy(lintCounts({ quiet: true, dirs }));
  const okLint = lintRan && !targets.missing.length;
  const okCss = cssCheck(base, { build });
  // setupProblems' own notes in both modes, after the --build ones.
  const own = [];
  const all = await setupProblems(own);
  const notes = build ? all.filter((p) => BUILD_NOTES.test(p)) : [];
  const problems = all.filter((p) => !notes.includes(p));
  notes.push(...own);
  for (const p of notes) console.log(`note: ${p}`);
  for (const p of problems) console.log(`setup: ${p}`);
  const ok = okTsc && okLint && okCss && !problems.length;
  const state = (x) => (x ? "ok" : "failed");
  const name = build ? "kleros-ui check --build" : "ui:check";
  console.log(ok ? `${name} passed` : `${name} failed (tsc ${state(okTsc)}, lint ${state(okLint)}, css ${state(okCss)}, setup ${problems.length} problem(s))`);
  if (!ok && build) console.log("kleros-ui: the build stops here, before vite. Fix what is listed above; agent/AGENTS.md in the package says how.");
  process.exitCode = ok ? 0 : 1;
}

const [cmd, ...rest] = process.argv.slice(2);
try {
  if (cmd === "create") create(parseCreate(rest));
  else if (cmd === "init") init({ fromCreate: rest.includes("--from-create") });
  else if (cmd === "sync") (writeBlock("AGENTS.md"), console.log(`kleros-ui: block updated to ${pkg.version}`));
  else if (cmd === "new" && rest[0]) newComponent(parseNew(rest));
  else if (cmd === "check") await check({ build: rest.includes("--build") });
  else if (cmd === "css") cssCommand(rest);
  else if (cmd === "theme") themeCommand(rest);
  else if (cmd === "baseline") baseline();
  else {
    console.log('usage: kleros-ui create <dir> [--lib <spec>] [--no-install] | init | new <Name> [--kind ui|data|form] [--intent "words"] | check [--build] | css [path ...] | theme | baseline | sync');
    process.exit(cmd ? 1 : 0);
  }
} catch (e) {
  // Usage errors print one line; anything else keeps its stack.
  if (!String(e?.message).startsWith("kleros-ui")) throw e;
  console.error(e.message);
  process.exit(1);
}
