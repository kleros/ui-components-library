#!/bin/bash
# d.11 gates (build.sh step 10; decision.md §20 AC1): the theme file (T1-T5), the lint preset's ids and the baseline
# (B1), new --intent (B2), types under "moduleResolution": "node" and new's React import (B4), the library as the app
# sees it (B7) and the JS entry's style.css order (B8). Each prints one "gate: d.11 ..." line when it holds and nothing
# when it does not. No network and no real install: eslint and tsc are stubbed in each fixture that runs check or
# baseline, as in cli-gates.sh; B4 type-checks with run.sh's tsc, so its fixture sits in run.sh's work folder.
# d.11 r3 (R3-1): the B7 fixtures link the real Tailwind from tools/ (installed there once, at pinned versions); the
# others have none, so check notes that it did not run Tailwind there (the L2 gate counts its eslint-disable notes).
# usage: d11-gates.sh <the packed library, extracted> <work folder for fixtures, inside run.sh's work folder> <scripts/layer/test, which holds gate/ and tools/> <tsc>
set -uo pipefail
LIB=$1; WORK=$2; P=$3; TSC=$4
CLI="node $LIB/bin/kleros-ui.mjs"
TOOLS='{"name":"%s","type":"module","devDependencies":{"tailwindcss":"^4.1.0"}}'
# The stub eslint prints eslint-out.json for -f json when the fixture has one (the B1 baseline gate), else no errors.
# d.11 (CL-B1-1): its plain run (check with no baseline) fails when the fixture has a file eslint-fail.
stubs() {
  mkdir -p "$1/node_modules/.bin" "$1/node_modules/@kleros"
  printf '#!/bin/sh\ncase " $* " in *" -f json "*) if [ -f eslint-out.json ]; then cat eslint-out.json; else echo "[]"; fi;; *) if [ -f eslint-fail ]; then exit 1; fi;; esac\nexit 0\n' > "$1/node_modules/.bin/eslint"
  printf '#!/bin/sh\nexit 0\n' > "$1/node_modules/.bin/tsc"
  chmod +x "$1/node_modules/.bin/eslint" "$1/node_modules/.bin/tsc"
  ln -s "$LIB" "$1/node_modules/@kleros/ui-components-library"
}
snapshot() { (cd "$1" && find . -type f -print0 | sort -z | xargs -0 -r md5sum && find . | sort); }
# An app as create leaves it, without the network: tools stubbed, the library linked, init run, and the starter's
# src/index.css and src/main.tsx.
app() {
  mkdir -p "$1" && stubs "$1" \
    && (cd "$1" && printf "$TOOLS\n" "$(basename "$1")" > package.json && $CLI init >/dev/null && mkdir -p src \
      && cp "$LIB/templates/poc/src/index.css" "$LIB/templates/poc/src/main.tsx" src/)
}
# The probe's theme (decision.md §20): PrimaryText in light only, PrimaryBlue in light and dark, inside @layer base.
probe() { printf '@layer base {\n  :root {\n    --klerosUIComponentsPrimaryText: #101010;\n    --klerosUIComponentsPrimaryBlue: #05a;\n  }\n  :root.dark {\n    --klerosUIComponentsPrimaryBlue: #6bf;\n  }\n}\n' > "$1"; }
CSS0='css: 0 findings (0 token overrides, 0 colour literals, 0 Tailwind-only, 0 !important, 0 library internals, 0 theme) in 2 files scanned'

# T1, T2: npx kleros-ui theme writes src/theme.css as @layer base { :root { } :root.dark { } } holding every library
# token as a commented line with the library's own value (light in :root, dark in :root.dark, read from the theme.css
# the app resolves), sets "theme", and imports it on the line right after the library's theme.css import; the app then
# passes. Run again, it refuses, names the file and writes nothing; with the file deleted it writes the file alone,
# so the key and the import stay single. A "theme" key that names another path is where it writes and what it imports.
A=$(mktemp -d -p "$WORK")
app "$A/app" && app "$A/brand" \
  && (cd "$A/app" && $CLI theme >o1.txt \
    && grep -qx "kleros-ui: wrote src/theme.css (the library's [0-9]* light and [0-9]* dark tokens, as comments); set \"theme\": \"src/theme.css\" in kleros-ui.json; added @import \"./theme.css\"; to src/index.css, right after the library's theme.css" o1.txt \
    && node -e '
const fs = require("fs");
const lib = fs.readFileSync(require.resolve("@kleros/ui-components-library/theme.css", { paths: [process.cwd()] }), "utf8");
const decls = (body) => [...body.matchAll(/(--klerosUIComponents\w+)\s*:\s*([^;}]+)/g)].map((m) => `${m[1]}: ${m[2].trim()}`);
const block = (text, sel) => text.match(new RegExp(`(?:^|[{};\\s])${sel}\\s*\\{([^{}]*)\\}`))?.[1] ?? "";
const theme = fs.readFileSync("src/theme.css", "utf8");
const shape = theme.replace(/\/\*[\s\S]*?\*\//g, "").replace(/\s+/g, " ").trim();
const open = theme.replace(/\/\* (--klerosUIComponents\w+: [^*]*;) \*\//g, "$1");
const same = (sel) => decls(block(lib, sel)).length > 0 && JSON.stringify(decls(block(lib, sel))) === JSON.stringify(decls(block(open, sel)));
const c = JSON.parse(fs.readFileSync("kleros-ui.json", "utf8"));
process.exit(shape === "@layer base { :root { } :root.dark { } }" && same(":root") && same(":root\\.dark") && c.theme === "src/theme.css" ? 0 : 1);
' \
    && test "$(grep -n '' src/index.css | grep -F '@import "./theme.css";' | cut -d: -f1)" = "$(( $(grep -n '' src/index.css | grep -F '@import "@kleros/ui-components-library/theme.css";' | cut -d: -f1) + 1 ))" \
    && test "$(wc -l < src/index.css)" = 5 \
    && $CLI css | grep -qxF "$CSS0" && $CLI check | grep -qx "ui:check passed" \
    && B=$(snapshot .) && { $CLI theme >"$A/o2.txt" 2>&1; test $? -eq 1; } && test "$(snapshot .)" = "$B" \
    && grep -q "src/theme.css already exists, and theme writes a new file only" "$A/o2.txt" && grep -q "Nothing was written" "$A/o2.txt" \
    && rm src/theme.css && $CLI theme >o3.txt && grep -q 'kept "theme" in kleros-ui.json; src/index.css already imports it' o3.txt \
    && test -f src/theme.css && test "$(grep -c '"theme"' kleros-ui.json)" = 1 && test "$(grep -cF '@import "./theme.css";' src/index.css)" = 1) \
  && (cd "$A/brand" && node -e 'const f = "kleros-ui.json", fs = require("fs"); const c = JSON.parse(fs.readFileSync(f)); c.theme = "src/styles/brand.css"; fs.writeFileSync(f, JSON.stringify(c))' \
    && $CLI theme >/dev/null && test -f src/styles/brand.css && grep -qxF '@import "./styles/brand.css";' src/index.css && $CLI check | grep -qx "ui:check passed") \
  && echo "gate: d.11 (T1, T2): npx kleros-ui theme writes src/theme.css as @layer base { :root { } :root.dark { } } with every library token and its light or dark value as a comment, sets \"theme\" and imports it on the line after the library's theme.css, and the app passes; run again it refuses, names the file and writes nothing; the key and the import are written once; a \"theme\" key's own path is used"
rm -rf "$A"

# T3: in the declared theme file each case §20 lists is one css-theme finding, named at its line
# (gate/cli-theme-fixture.css, one case each: an unknown token, the --color- alias, another property, !important, a
# .dark selector, a rule outside @layer base, another at-rule); the valid lines around them are not findings, and
# nothing inside a wrong rule or at-rule counts again. The probe's theme has 0 findings and ui:check passes. ui:baseline
# records css-theme findings per file like the rest of the scan: one more fails check, and check --build ignores it.
A=$(mktemp -d -p "$WORK")
app "$A/app" \
  && (cd "$A/app" && $CLI theme >/dev/null && cp "$P/gate/cli-theme-fixture.css" src/theme.css && { $CLI css >o1.txt; test $? -eq 1; } \
    && grep -qx "css: 7 findings (0 token overrides, 0 colour literals, 0 Tailwind-only, 0 !important, 0 library internals, 7 theme) in 2 files scanned" o1.txt \
    && test "$(grep -c '(kleros-ui/css-theme)$' o1.txt)" = 7 \
    && grep -q '^src/theme.css:4:5 --klerosUIComponentsPrimaryBlu is not a library token' o1.txt \
    && grep -q "^src/theme.css:5:5 --color-klerosUIComponentsPrimaryBlue is Tailwind's alias of the token --klerosUIComponentsPrimaryBlue in the theme file src/theme.css: redefine --klerosUIComponentsPrimaryBlue itself" o1.txt \
    && grep -q '^src/theme.css:6:5 color in the theme file src/theme.css' o1.txt \
    && grep -q '^src/theme.css:7:45 !important in --klerosUIComponentsSecondaryText in the theme file src/theme.css' o1.txt \
    && grep -q '^src/theme.css:12:3 Selector ".dark" in the theme file src/theme.css: only :root (light) and :root.dark (dark)' o1.txt \
    && grep -q '^src/theme.css:17:3 --klerosUIComponentsStroke is outside @layer base in the theme file src/theme.css' o1.txt \
    && grep -q '^src/theme.css:19:1 @media (prefers-contrast: more) in the theme file src/theme.css: .*no other at-rule' o1.txt \
    && $CLI baseline >/dev/null && $CLI check | grep -qx "ui:check passed" \
    && printf '@layer base {\n  :root {\n    --klerosUIComponentsNope: #000;\n  }\n}\n' >> src/theme.css \
    && ! $CLI check >o2.txt && grep -q '^css: 1 new (baseline 7):' o2.txt && grep -q 'src/theme.css:26:5 --klerosUIComponentsNope is not a library token' o2.txt \
    && ! $CLI check --build >/dev/null \
    && probe src/theme.css && $CLI css | grep -qxF "$CSS0" && $CLI check | grep -qx "ui:check passed") \
  && echo "gate: d.11 (T3): in the theme file an unknown token, the --color- alias, another property, !important, a selector other than :root or :root.dark, a rule outside @layer base and another at-rule are one css-theme finding each, named at their line; the probe's theme passes; css-theme findings are baselined per file, one more fails, and check --build ignores the baseline"
rm -rf "$A"

# d.11 (TH-2, TH-3, TH-4): CSS reads an escape as the plain letter, so c\olor (a property) and !\important passed the
# theme checks and the build emitted them: each backslash outside a string is a css-theme finding at its place. The
# list `:root, :root.dark` sets a token in both modes and passes; a list with another selector is a finding. Tailwind
# inlines the theme file as plain CSS whatever its extension, so a "theme" path ending in .scss is read with // as no
# comment (`// } .x { color: red; }` is a rule on .x), and one with another extension is read at all.
A=$(mktemp -d -p "$WORK")
app "$A/app" \
  && (cd "$A/app" && $CLI theme >/dev/null \
    && printf '@layer base {\n  :root {\n    c\\olor: red;\n    --klerosUIComponentsPrimaryBlue: #05a !\\important;\n  }\n}\n' > src/theme.css && { $CLI css >o1.txt; test $? -eq 1; } \
    && grep -qx "css: 2 findings (0 token overrides, 0 colour literals, 0 Tailwind-only, 0 !important, 0 library internals, 2 theme) in 2 files scanned" o1.txt \
    && grep -q '^src/theme.css:3:6 A backslash (a CSS escape) in the theme file src/theme.css: CSS reads it as the plain letter' o1.txt \
    && grep -q '^src/theme.css:4:44 A backslash (a CSS escape) in the theme file src/theme.css' o1.txt \
    && printf '@layer base {\n  :root, :root.dark {\n    --klerosUIComponentsPrimaryBlue: #05a;\n  }\n}\n' > src/theme.css && $CLI css | grep -qxF "$CSS0" \
    && sed -i 's#^  :root, :root.dark {#  :root, .dark {#' src/theme.css && { $CLI css >o2.txt; test $? -eq 1; } \
    && grep -q '^src/theme.css:2:3 Selector ":root, .dark" in the theme file src/theme.css: only :root (light) and :root.dark (dark)' o2.txt \
    && rm src/theme.css && node -e 'const f = "kleros-ui.json", fs = require("fs"); const c = JSON.parse(fs.readFileSync(f)); c.theme = "src/theme.scss"; fs.writeFileSync(f, JSON.stringify(c))' \
    && sed -i 's#^@import "./theme.css";#@import "./theme.scss";#' src/index.css \
    && printf '@layer base {\n  :root {\n    // } .x { color: red; }\n    --klerosUIComponentsPrimaryBlue: #05a;\n  }\n}\n' > src/theme.scss && { $CLI css >o3.txt; test $? -eq 1; } \
    && grep -q '^src/theme.scss:3:10 Selector ".x" in the theme file src/theme.scss' o3.txt \
    && mv src/theme.scss src/brand.theme && node -e 'const f = "kleros-ui.json", fs = require("fs"); const c = JSON.parse(fs.readFileSync(f)); c.theme = "src/brand.theme"; fs.writeFileSync(f, JSON.stringify(c))' \
    && sed -i 's#^@import "./theme.scss";#@import "./brand.theme";#' src/index.css && { $CLI css >o4.txt; test $? -eq 1; } \
    && grep -q '^src/brand.theme:3:10 Selector ".x" in the theme file src/brand.theme' o4.txt) \
  && echo "gate: d.11 (TH-2, TH-3, TH-4): a backslash outside a string in the theme file (c\\olor, !\\important) is a css-theme finding at its place; :root, :root.dark passes and a list with another selector does not; a theme file named .scss is read as plain CSS, where // starts no comment, and one with another extension is read too"
rm -rf "$A"

# T4: the Tailwind entry holds the four lines plus one plain import of the theme file after the library's theme.css
# (as theme writes it: 0 findings, above). Each other form is one finding, named: the import before the library's,
# twice, with layer(), or missing (css-theme); another @import and a style rule are still Tailwind-only findings, as
# in d.10, and the @import message names the theme file.
A=$(mktemp -d -p "$WORK")
entry() { # <sed script for src/index.css> <the finding's line, from its start> <its count, as the summary shows it>
  cp "$A/good.css" src/index.css && sed -i "$1" src/index.css && { $CLI css >o.txt; test $? -eq 1; } && grep -q "^$2" o.txt \
    && grep -qx "css: 1 finding (0 token overrides, 0 colour literals, $3) in 2 files scanned" o.txt
}
app "$A/app" \
  && (cd "$A/app" && $CLI theme >/dev/null && probe src/theme.css && cp src/index.css "$A/good.css" && $CLI css | grep -qxF "$CSS0" \
    && entry '3d; 1a @import "./theme.css";' 'src/index.css:2:1 @import "./theme.css" comes before @import "@kleros/ui-components-library/theme.css"' "0 Tailwind-only, 0 !important, 0 library internals, 1 theme" \
    && entry '3a @import "./theme.css";' 'src/index.css:4:1 @import "./theme.css" again: the Tailwind entry imports the theme file src/theme.css once' "0 Tailwind-only, 0 !important, 0 library internals, 1 theme" \
    && entry 's#^@import "./theme.css";#@import "./theme.css" layer(components);#' 'src/index.css:3:1 @import "./theme.css" layer(components): import the theme file plainly' "0 Tailwind-only, 0 !important, 0 library internals, 1 theme" \
    && entry '3d' 'src/index.css:2:1 The Tailwind entry does not import the theme file src/theme.css (kleros-ui.json "theme")' "0 Tailwind-only, 0 !important, 0 library internals, 1 theme" \
    && ! grep -q "npx kleros-ui theme" o.txt \
    && entry 's#^@import "./theme.css";#@layer components {\n  @import "./theme.css";\n}#' 'src/index.css:4:3 @import "./theme.css" inside @layer components: import the theme file at the top level of the entry, right after @import "@kleros/ui-components-library/theme.css";' "0 Tailwind-only, 0 !important, 0 library internals, 1 theme" \
    && entry 's#^@import "./theme.css";#@media print { @import "./theme.css"; }#' 'src/index.css:3:16 @import "./theme.css" inside @media print: import the theme file at the top level' "0 Tailwind-only, 0 !important, 0 library internals, 1 theme" \
    && entry '3a @import "./brand.css";' 'src/index.css:4:1 @import "./brand.css" in the Tailwind entry, which imports only tailwindcss, @kleros/ui-components-library/theme.css and the theme file src/theme.css' "1 Tailwind-only, 0 !important, 0 library internals, 0 theme" \
    && entry '$a body { margin: 0; }' 'src/index.css:6:1 Style rule "body" in the Tailwind entry' "1 Tailwind-only, 0 !important, 0 library internals, 0 theme") \
  && echo "gate: d.11 (T4, TH-1, DO-2): the Tailwind entry with the four lines and one plain theme import after the library's theme.css passes; the import before it, twice, with layer(), inside @layer components or @media print, or missing is a css-theme finding (missing, with the file there, it names the line to add, not npx kleros-ui theme), and another @import or a style rule is still a Tailwind-only one, its message naming the theme file"
rm -rf "$A"

# T5: with a theme declared, a token redefined in the entry and the --color- alias in another stylesheet are css-token
# findings that name the theme file and npx kleros-ui theme (with d.10's Tailwind-only findings besides; d.10's
# "redefines a library token" start is kept). With no theme declared, a src/theme.css that kleros-ui.json does not
# name is a stylesheet outside the entry, as in d.10: d.10's findings and summary line, and the token message says to
# run npx kleros-ui theme.
# d.11 (DO-2, DO-3): theme refuses to write over that undeclared src/theme.css, so its token message names the key and
# the import to add instead, and says to run npx kleros-ui theme only when no such file is there; the colour finding
# on a token's line sends the value to the theme file rather than to "a token", and "no stylesheet besides the entry"
# names the theme file too.
A=$(mktemp -d -p "$WORK")
app "$A/app" && app "$A/plain" \
  && (cd "$A/app" && $CLI theme >/dev/null && probe src/theme.css \
    && printf ':root {\n  --klerosUIComponentsPrimaryText: var(--klerosUIComponentsTint);\n}\n' >> src/index.css \
    && printf ':root {\n  --color-klerosUIComponentsPrimaryBlue: var(--klerosUIComponentsTint);\n}\n' > src/alias.css \
    && { $CLI css >o.txt; test $? -eq 1; } \
    && grep -qx "css: 4 findings (2 token overrides, 0 colour literals, 2 Tailwind-only, 0 !important, 0 library internals, 0 theme) in 3 files scanned" o.txt \
    && grep -qF 'src/index.css:7:3 --klerosUIComponentsPrimaryText redefines a library token outside the theme file: set tokens only in src/theme.css (kleros-ui.json "theme", the file npx kleros-ui theme sets up)' o.txt \
    && grep -qF "src/alias.css:2:3 --color-klerosUIComponentsPrimaryBlue redefines a library token through Tailwind's alias of --klerosUIComponentsPrimaryBlue outside the theme file: set --klerosUIComponentsPrimaryBlue itself, never the alias, only in src/theme.css (kleros-ui.json \"theme\", the file npx kleros-ui theme sets up)" o.txt \
    && grep -q '^src/index.css:6:1 Style rule ":root" in the Tailwind entry' o.txt \
    && grep -qF 'src/alias.css:1:1 Style rule ":root" in a .css file outside the Tailwind entry: Tailwind only, so no stylesheet besides the one entry that imports tailwindcss (src/index.css as create writes it) and the theme file src/theme.css (kleros-ui.json "theme").' o.txt) \
  && (cd "$A/plain" && probe src/theme.css && { $CLI css >o.txt; test $? -eq 1; } \
    && grep -qx "css: 8 findings (3 token overrides, 3 colour literals, 2 Tailwind-only, 0 !important, 0 library internals) in 2 files scanned" o.txt \
    && grep -qF 'src/theme.css:2:3 Style rule ":root" (in @layer base) in a .css file outside the Tailwind entry: Tailwind only, so no stylesheet besides the one entry that imports tailwindcss (src/index.css as create writes it) and one theme file for new token values, which npx kleros-ui theme sets up.' o.txt \
    && grep -qF 'src/theme.css:3:5 --klerosUIComponentsPrimaryText redefines a library token, and kleros-ui.json declares no theme file. src/theme.css is there, so npx kleros-ui theme would refuse to write it: declare it with "theme": "src/theme.css" in kleros-ui.json, add @import "./theme.css"; to src/index.css right after @import "@kleros/ui-components-library/theme.css";, then set tokens only there.' o.txt \
    && grep -qF 'src/theme.css:3:38 Colour literal #101010 in --klerosUIComponentsPrimaryText: a token'"'"'s new value, a hex included, goes only in the theme file that npx kleros-ui theme sets up (src/theme.css); the css-token finding on this line says how.' o.txt \
    && mv src/theme.css src/brand.css && { $CLI css >o2.txt; test $? -eq 1; } \
    && grep -qF 'src/brand.css:3:5 --klerosUIComponentsPrimaryText redefines a library token, and this app has no theme file: run npx kleros-ui theme (it writes src/theme.css and imports it), then set tokens only there.' o2.txt) \
  && echo "gate: d.11 (T5, DO-2, DO-3): a token redefined outside the declared theme file, the --color- alias included, is still a css-token finding, and its message names the theme file and npx kleros-ui theme; a theme-like src/theme.css kleros-ui.json does not declare gets d.10's findings and summary, and the message names the key and the import to add (theme would refuse that file); with no such file it says to run npx kleros-ui theme; a colour on a token's line points to the theme file, and the outside-the-entry message names it"
rm -rf "$A"

# B1 (D37): the lint preset's restrictions are kleros-ui/no-restricted-syntax and kleros-ui/no-restricted-imports,
# ESLint's own rules registered again in its plugin (from eslint/use-at-your-own-risk; build.sh has no ESLint, so
# cli-lint-load.mjs gives the preset gate/eslint-stand-in.mjs). After init wraps an app config that sets its own
# no-restricted-imports and no-restricted-syntax, the rules ESLint applies to src/App.tsx keep the app's options under
# the core ids and the preset's (styled-components, raw <button>) under the kleros-ui ids. A baseline from before d.11
# (no "version") counts the preset's errors under the core ids, read as the new ones: check passes on the same count
# and fails on one more; an app's own core-id error is reported, not failed; ui:baseline writes "version", and then
# one more fails.
A=$(mktemp -d -p "$WORK")
mkdir -p "$A/lint/node_modules/@kleros" && ln -s "$LIB" "$A/lint/node_modules/@kleros/ui-components-library"
echo '{"name":"lint","type":"module","scripts":{}}' > "$A/lint/package.json"
cat > "$A/lint/eslint.config.mjs" <<'EOF'
export default [
  {
    files: ["src/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": ["error", { patterns: [{ group: ["lodash", "lodash/*"], message: "APP RULE: no lodash." }] }],
      "no-restricted-syntax": ["error", { selector: "CallExpression[callee.name='alert']", message: "APP RULE: no alert()." }],
    },
  },
];
EOF
# eslint -f json as the stub prints it: one file, src/App.tsx, with an error under each rule id given.
lintout() { node -e 'const [dir, ...ids] = process.argv.slice(1); console.log(JSON.stringify([{ filePath: dir + "/src/App.tsx", messages: ids.map((ruleId, i) => ({ severity: 2, ruleId, line: i + 1, column: 1, message: "stub error under " + ruleId })) }]))' "$PWD" "$@" > eslint-out.json; }
(cd "$A/lint" && $CLI init >/dev/null && grep -q '^import app from "./eslint.config.app.mjs";' eslint.config.mjs \
  && node "$P/gate/cli-lint-load.mjs" . src/App.tsx >rules.txt && test "$(head -1 rules.txt)" = eslint.config.mjs \
  && tail -1 rules.txt | node -e '
const m = JSON.parse(require("fs").readFileSync(0, "utf8")); const r = m.rules;
const ok = r["no-restricted-imports"]?.[1]?.patterns?.[0]?.message === "APP RULE: no lodash." && r["no-restricted-imports"].length === 2
  && r["no-restricted-syntax"]?.[1]?.message === "APP RULE: no alert()." && r["no-restricted-syntax"].length === 2
  && (r["kleros-ui/no-restricted-imports"]?.[1]?.paths ?? []).some((p) => p.name === "styled-components")
  && (r["kleros-ui/no-restricted-syntax"] ?? []).slice(1).some((x) => /^Raw <button>/.test(x.message))
  && m.pluginRules["kleros-ui"]?.["no-restricted-syntax"] === "builtin" && m.pluginRules["kleros-ui"]?.["no-restricted-imports"] === "builtin";
process.exit(ok ? 0 : 1);') \
  && app "$A/base" \
  && (cd "$A/base" && lintout kleros-ui/no-restricted-syntax && echo '{"lint":{"src/App.tsx|no-restricted-syntax":1},"tsc":{},"css":{}}' > kleros-ui-baseline.json \
    && $CLI check | grep -qx "ui:check passed" \
    && lintout kleros-ui/no-restricted-syntax kleros-ui/no-restricted-syntax && ! $CLI check >o1.txt && grep -q '^lint: 1 new (baseline 1):' o1.txt \
    && lintout kleros-ui/no-restricted-syntax no-restricted-imports && $CLI check >o2.txt && grep -qx "ui:check passed" o2.txt \
    && grep -q '^lint: 1 error under no-restricted-syntax or no-restricted-imports in 1 file, not failing: kleros-ui-baseline.json predates d.11' o2.txt \
    && $CLI baseline >/dev/null && node -e 'const b = require(process.argv[1]); process.exit(b.version === process.argv[2] && b.lint["src/App.tsx|kleros-ui/no-restricted-syntax"] === 1 && b.lint["src/App.tsx|no-restricted-imports"] === 1 ? 0 : 1)' "$PWD/kleros-ui-baseline.json" "$(node -p 'require(process.argv[1]).version' "$LIB/package.json")" \
    && lintout kleros-ui/no-restricted-syntax no-restricted-imports no-restricted-imports && ! $CLI check >o3.txt && grep -q '^lint: 1 new (baseline 1):' o3.txt) \
  && echo "gate: d.11 (B1, D37): the lint preset sets kleros-ui/no-restricted-syntax and kleros-ui/no-restricted-imports, ESLint's own rules in its plugin, so after init an app's own no-restricted-imports and no-restricted-syntax options still apply; a baseline from before d.11 is read under the new ids (same count passes, one more fails, an app's own core-id error is reported, not failed), and ui:baseline writes \"version\""
rm -rf "$A"

# d.11 (CL-B1-1): an eslint-disable comment written for the d.10 preset names no-restricted-syntax, which no longer
# silences the preset's error (now kleros-ui/no-restricted-syntax); ESLint reports the comment as unused and the error
# as new. check names the comment, the error's line and the id to write: under a baseline from before d.11 the error is
# reported, not failed; under a d.11 baseline it is new; with no baseline the failed ESLint run gets the same note. The
# stub prints what ESLint 9 prints for src/Legacy.tsx (an unused directive at the comment, the error on the next line).
A=$(mktemp -d -p "$WORK")
VER=$(node -p 'require(process.argv[1]).version' "$LIB/package.json")
NOTE='^note: src/Legacy.tsx:3 eslint-disable-next-line names no-restricted-syntax, which no longer silences the lint preset: since d.11 it reports src/Legacy.tsx:4 as kleros-ui/no-restricted-syntax. Write kleros-ui/no-restricted-syntax in that comment instead'
app "$A/app" \
  && (cd "$A/app" && printf '%s\n' 'export const Legacy = () => (' '  <div>' '    {/* eslint-disable-next-line no-restricted-syntax */}' '    <button type="button">Go</button>' '  </div>' ');' > src/Legacy.tsx \
    && node -e 'console.log(JSON.stringify([{ filePath: process.argv[1] + "/src/Legacy.tsx", messages: [
  { ruleId: null, severity: 1, line: 3, column: 6, message: "Unused eslint-disable directive (no problems were reported from '"'"'no-restricted-syntax'"'"')." },
  { ruleId: "kleros-ui/no-restricted-syntax", severity: 2, line: 4, column: 5, message: "Raw <button>: use Button from @kleros/ui-components-library (see agent/CATALOG.md)." },
] }]))' "$PWD" > eslint-out.json \
    && echo '{"lint":{},"tsc":{},"css":{}}' > kleros-ui-baseline.json && $CLI check >o1.txt && grep -qx "ui:check passed" o1.txt && grep -q "$NOTE" o1.txt \
    && grep -q '^lint: 1 error under an eslint-disable comment that names the old rule id (the notes above), not failing: kleros-ui-baseline.json predates d.11' o1.txt \
    && echo "{\"version\":\"$VER\",\"lint\":{},\"tsc\":{},\"css\":{}}" > kleros-ui-baseline.json && ! $CLI check >o2.txt && grep -q "$NOTE" o2.txt && grep -q '^lint: 1 new (baseline 0):' o2.txt \
    && rm kleros-ui-baseline.json && touch eslint-fail && ! $CLI check >o3.txt && grep -q "$NOTE" o3.txt && grep -q '^ui:check failed (tsc ok, lint failed' o3.txt) \
  && echo "gate: d.11 (CL-B1-1): an eslint-disable comment that names no-restricted-syntax over a preset error is a note naming the comment, the error's line and kleros-ui/no-restricted-syntax, in check with an old baseline (reported, not failed), a d.11 one (failed) and none (failed)"
rm -rf "$A"

# B2 (X1-C1): new --intent "a, b" writes the trimmed words, once each, to the registry entry; an entry with no intent
# words is a note in check and check --build, never a failure; words left unquoted are refused (exit 1) and nothing
# is written.
A=$(mktemp -d -p "$WORK")
app "$A/app" \
  && (cd "$A/app" && $CLI new PeriodBadge --kind ui --intent " period badge, status chip,period badge ," >o1.txt \
    && grep -q 'and a kleros-ui.json entry with the intent words "period badge", "status chip"\.' o1.txt \
    && node -e 'const c = require(process.argv[1]).components.find((x) => x.name === "PeriodBadge"); process.exit(JSON.stringify(c?.intent) === JSON.stringify(["period badge", "status chip"]) ? 0 : 1)' "$PWD/kleros-ui.json" \
    && $CLI check >o2.txt && grep -qx "ui:check passed" o2.txt && ! grep -q "intent" o2.txt \
    && $CLI new Bare --kind data >/dev/null \
    && $CLI check >o3.txt && grep -qx "ui:check passed" o3.txt && grep -q '^note: kleros-ui.json: Bare has no intent words' o3.txt && ! grep -q 'PeriodBadge has no' o3.txt \
    && $CLI check --build >o4.txt && grep -qx "kleros-ui check --build passed" o4.txt && grep -q '^note: kleros-ui.json: Bare has no intent words' o4.txt \
    && B=$(snapshot .) && { $CLI new Loose --intent period badge >"$A/o5.txt" 2>&1; test $? -eq 1; } && test "$(snapshot .)" = "$B" \
    && grep -q 'unexpected badge; quote the intent words as one argument: --intent "period badge, status chip"' "$A/o5.txt") \
  && app "$A/gap" && GAP=$(grep -o '`npx kleros-ui new TxLink [^`]*`' "$LIB/agent/CATALOG.md" | tr -d '`') \
  && test "$(grep -c 'npx kleros-ui new ' "$LIB/agent/CATALOG.md")" = "$(grep -c 'npx kleros-ui new [A-Za-z]* --kind [a-z]* --intent "' "$LIB/agent/CATALOG.md")" \
  && (cd "$A/gap" && eval "$CLI ${GAP#npx kleros-ui }" >/dev/null \
    && node -e 'const c = require(process.argv[1]).components.find((x) => x.name === "TxLink"); process.exit(c?.intent?.includes("tx hash") ? 0 : 1)' "$PWD/kleros-ui.json" \
    && $CLI check >o.txt && grep -qx "ui:check passed" o.txt && ! grep -q "no intent words" o.txt) \
  && echo "gate: d.11 (B2, X1-C1, DO-4): new --intent writes the comma-separated words, trimmed and once each, to the registry entry; an entry with no intent words is a note in check and check --build, never a failure; unquoted words are refused and nothing is written; every scaffold command in CATALOG.md passes the gap's intent words, and the TxLink one, run as written, leaves no note"
rm -rf "$A"

# B4 (D26, D27): the manifest maps /kit and /story-types in typesVersions. In a fixture whose tsconfig.json extends a
# config with "moduleResolution": "node", "jsx": "react" and esModuleInterop, new writes import React on line 1 of
# <Name>.tsx (the form's joins its useState import), and tsc compiles those components with noUnusedLocals, plus an
# import from /kit whose types are the real ones (a @ts-expect-error on a prop Stack does not have). With "jsx":
# "react-jsx" (the starter's), new writes no React import.
# d.11 (AC6 rerun): the same without esModuleInterop, as AC6's plain fixture has it; the kit's types imported React as a
# default, which @types/react has only under interop, so Stack lost children and className there and tsc failed.
A=$(mktemp -d -p "$WORK")
mkdir -p "$A/classic/node_modules/@kleros" "$A/auto/src" && ln -s "$LIB" "$A/classic/node_modules/@kleros/ui-components-library"
echo '{"name":"classic","type":"module"}' > "$A/classic/package.json"
printf '{\n  // Court-like: classic JSX and interop, from the config it extends.\n  "compilerOptions": { "jsx": "react", "esModuleInterop": true, "moduleResolution": "node", "module": "esnext", "target": "es2020", "lib": ["dom", "es2020"], "strict": true, "noUnusedLocals": true, "skipLibCheck": true, "noEmit": true, },\n}\n' > "$A/classic/tsconfig.base.json"
echo '{ "extends": "./tsconfig.base.json", "include": ["src"] }' > "$A/classic/tsconfig.json"
echo '{"name":"auto","type":"module"}' > "$A/auto/package.json"
echo '{ "compilerOptions": { "jsx": "react-jsx" } }' > "$A/auto/tsconfig.json"
node -e 'const t = require(process.argv[1]).typesVersions?.["*"]; process.exit(JSON.stringify(t) === JSON.stringify({ kit: ["dist/kit/index.d.ts"], "story-types": ["story-types.d.ts"] }) ? 0 : 1)' "$LIB/package.json" \
  && (cd "$A/classic" && $CLI new ClassicForm --kind form --intent "classic form" >o1.txt && $CLI new ClassicCard --kind ui --intent "classic card" >/dev/null \
    && test "$(head -1 src/components/ClassicForm/ClassicForm.tsx)" = 'import React, { useState } from "react";' \
    && test "$(head -1 src/components/ClassicCard/ClassicCard.tsx)" = 'import React from "react";' \
    && grep -q 'ClassicForm.tsx starts with import React from "react";, since tsconfig.json (or a config it extends) sets "jsx": "react"' o1.txt \
    && printf '%s\n' 'import React from "react";' 'import { Stack } from "@kleros/ui-components-library/kit";' 'import type { Meta } from "@kleros/ui-components-library/story-types";' \
      'import { ClassicCard } from "./components/ClassicCard";' 'import { ClassicForm } from "./components/ClassicForm";' '' \
      'export const meta: Meta<typeof ClassicCard> = { title: "App/ClassicCard", component: ClassicCard };' \
      'export const Uses = () => (' '  <Stack gap={2} className="p-4">' '    <ClassicCard />' '    <ClassicForm onSubmit={() => undefined} />' \
      '    {/* @ts-expect-error: Stack has no prop nope, so /kit resolved to its real types, not any */}' '    <Stack nope />' '  </Stack>' ');' > src/uses.tsx \
    && nice "$TSC" -p tsconfig.json) \
  && (cd "$A/auto" && $CLI new AutoCard --kind ui --intent "auto card" >o1.txt && test "$(head -1 src/components/AutoCard/AutoCard.tsx)" = 'import { Stack } from "@kleros/ui-components-library/kit";' \
    && ! grep -q 'import React' src/components/AutoCard/AutoCard.tsx o1.txt) \
  && mkdir -p "$A/bom" "$A/field/node_modules/@acme/tsconfig" "$A/sub/node_modules/@acme/tsconfig" \
  && for d in bom field sub; do echo "{\"name\":\"$d\",\"type\":\"module\"}" > "$A/$d/package.json"; done \
  && printf '\357\273\277{\n  // saved with a byte-order mark, as Windows editors do\n  "compilerOptions": { "jsx": "react", "esModuleInterop": true },\n}\n' > "$A/bom/tsconfig.json" \
  && echo '{"name":"@acme/tsconfig","main":"index.js","tsconfig":"react.json"}' > "$A/field/node_modules/@acme/tsconfig/package.json" \
  && echo '{"name":"@acme/tsconfig","main":"index.js"}' > "$A/sub/node_modules/@acme/tsconfig/package.json" \
  && for d in field sub; do echo 'module.exports = {};' > "$A/$d/node_modules/@acme/tsconfig/index.js" \
    && echo '{ "compilerOptions": { "jsx": "react", "esModuleInterop": true } }' > "$A/$d/node_modules/@acme/tsconfig/react.json"; done \
  && echo '{ "extends": "@acme/tsconfig" }' > "$A/field/tsconfig.json" && echo '{ "extends": "@acme/tsconfig/react" }' > "$A/sub/tsconfig.json" \
  && ( for d in bom field sub; do (cd "$A/$d" && $CLI new PlainCard --kind ui --intent "plain card" >/dev/null && test "$(head -1 src/components/PlainCard/PlainCard.tsx)" = 'import React from "react";') || exit 1; done ) \
  && mkdir -p "$A/nointerop/node_modules/@kleros" && ln -s "$LIB" "$A/nointerop/node_modules/@kleros/ui-components-library" \
  && echo '{"name":"nointerop","type":"module"}' > "$A/nointerop/package.json" \
  && echo '{ "compilerOptions": { "jsx": "react", "moduleResolution": "node", "module": "esnext", "target": "es2020", "lib": ["dom", "es2020"], "strict": true, "noUnusedLocals": true, "skipLibCheck": true, "noEmit": true }, "include": ["src"] }' > "$A/nointerop/tsconfig.json" \
  && (cd "$A/nointerop" && $CLI new PlainBar --kind ui --intent "plain bar" >/dev/null && test "$(head -1 src/components/PlainBar/PlainBar.tsx)" = 'import * as React from "react";' \
    && printf '%s\n' 'import * as React from "react";' 'import { Stack } from "@kleros/ui-components-library/kit";' 'import { PlainBar } from "./components/PlainBar";' '' \
      'export const Uses = () => (' '  <Stack gap={2} className="p-4">' '    <PlainBar />' '    {/* @ts-expect-error: Stack has no prop nope, so /kit resolved to its real types, not any */}' '    <Stack nope />' '  </Stack>' ');' > src/uses.tsx \
    && ! grep -q '^import React\b' "$LIB"/dist/kit/*.d.ts && nice "$TSC" -p tsconfig.json) \
  && echo "gate: d.11 (B4, D26, D27, CL-B4-1): typesVersions maps /kit and /story-types, and under \"moduleResolution\": \"node\" and \"jsx\": \"react\" (from an extended config) new writes import React first, and tsc compiles its components and real /kit and /story-types types; with react-jsx new writes no React import; \"jsx\": \"react\" is read from a tsconfig.json saved with a byte-order mark and from a package's config (its \"tsconfig\" field, or a subpath such as @acme/tsconfig/react), not its JS main; without esModuleInterop (AC6's plain fixture) new writes import * as React and tsc compiles it with /kit, whose types import React as a namespace"
rm -rf "$A"

# d.11 r3 (R3-1, decision.md §20.2; B7, D28): check no longer models how Tailwind walks files; it asks the app's own
# Tailwind. It compiles the entry with @tailwindcss/node, runs @tailwindcss/oxide's Scanner on the sources
# @tailwindcss/postcss builds, and fails when a dist/kit/*.js file of the library the app resolves is not among the
# files listed. These fixtures link the real tailwindcss, @tailwindcss/node and @tailwindcss/oxide 4.3.5 (the try app's
# versions, pinned in tools/package.json). The library is the app's own copy, and check runs from another copy, as
# npx -p <tgz> runs it:
# - the starter's entry passes in a fixture that is in no git repo and in one that is (git init, the starter's
#   .gitignore). In both, the entry without its @source fails and names all 12 kit files and the starter's @source
#   line: Tailwind's own detection skips node_modules with and without git;
# - @source ".." fails (the same detection), and @source on dist/kit/*.js passes;
# - with no copy of the library in the app's folder or above, check says so.
TW=$P/tools/node_modules
twlink() { mkdir -p "$1/node_modules/@tailwindcss" && for t in tailwindcss @tailwindcss/node @tailwindcss/oxide; do ln -s "$TW/$t" "$1/node_modules/$t" || return 1; done; }
own() { app "$1" && rm "$1/node_modules/@kleros/ui-components-library" && cp -r "$LIB" "$1/node_modules/@kleros/ui-components-library" && twlink "$1" && cp "$LIB/templates/poc/gitignore" "$1/.gitignore"; }
L=../node_modules/@kleros/ui-components-library
KIT="app.js, chart.js, cn.js, data.js, feedback.js, form.js, index.js, layout.js, state.js, status.js, time.js, tokens.js"
MISS="setup: src/index.css: no @source reaches the library, so Tailwind leaves out the kit's classes (layout, rows, gutters): the app's own Tailwind, run on this entry, does not scan"
ALL12="$MISS any of the kit's 12 files in node_modules/@kleros/ui-components-library/dist/kit/ ($KIT). Add @source \"$L\"; (the starter's line, with the path from src/ to the library"
starter() {
  (cd "$1" && cp src/index.css index.kept && $CLI check >o0.txt && grep -qx "ui:check passed" o0.txt && ! grep -q '^note: src/index.css' o0.txt \
    && sed -i '/^@source/d' src/index.css && ! $CLI check >o1.txt && grep -qF "$ALL12" o1.txt && cp index.kept src/index.css)
}
A=$(mktemp -d -p "$WORK")
own "$A/nogit" && own "$A/git" && app "$A/none" && rm "$A/none/node_modules/@kleros/ui-components-library" && twlink "$A/none" \
  && (cd "$A/git" && git init -q . && git rev-parse --git-dir >/dev/null) && ! (cd "$A/nogit" && git rev-parse --git-dir >/dev/null 2>&1) \
  && starter "$A/nogit" && starter "$A/git" \
  && (cd "$A/nogit" && sed -i 's#^@source .*#@source "..";#' src/index.css && ! $CLI check >o2.txt && grep -qF "$ALL12" o2.txt \
    && sed -i "s#^@source .*#@source \"$L/dist/kit/*.js\";#" src/index.css && $CLI check | grep -qx "ui:check passed") \
  && (cd "$A/none" && ! $CLI check >o.txt && grep -q '^setup: src/index.css: @kleros/ui-components-library is not installed in this folder or a folder above it' o.txt) \
  && echo "gate: d.11 r3 (R3-1, B7, D28): check asks the app's own Tailwind 4.3.5 which files it scans, from the app's own copy of the library while the CLI runs from another: the starter's entry passes in a fixture with git and in one without, and without its @source fails in both, naming all 12 kit files and the starter's @source line; @source \"..\" fails and dist/kit/*.js passes; a missing install is named"
rm -rf "$A"

# B8: in an app with Tailwind, the script that imports the Tailwind entry must import the library's style.css before
# it: the starter's src/main.tsx passes; style.css after ./index.css, or missing, is a setup problem that names the
# file and the fix (in check and check --build); with no script that imports the entry, check notes it and passes.
A=$(mktemp -d -p "$WORK")
app "$A/app" \
  && (cd "$A/app" && cp src/main.tsx "$A/main.tsx" && $CLI check >o0.txt && grep -qx "ui:check passed" o0.txt && ! grep -q "style.css" o0.txt \
    && sed -i '/ui-components-library\/style.css/d; s#^import "./index.css";#import "./index.css";\nimport "@kleros/ui-components-library/style.css";#' src/main.tsx \
    && ! $CLI check >o1.txt && grep -q '^setup: src/main.tsx imports ./index.css (the Tailwind entry) before @kleros/ui-components-library/style.css, .*Move import "@kleros/ui-components-library/style.css"; to the line before import "./index.css";' o1.txt \
    && ! $CLI check --build >o2.txt && grep -q '^setup: src/main.tsx imports ./index.css (the Tailwind entry) before' o2.txt \
    && sed -i '/ui-components-library\/style.css/d' src/main.tsx && ! $CLI check >o3.txt \
    && grep -q '^setup: src/main.tsx imports ./index.css (the Tailwind entry) without @kleros/ui-components-library/style.css, .*Add import "@kleros/ui-components-library/style.css"; on the line before import "./index.css";' o3.txt \
    && rm src/main.tsx && $CLI check >o4.txt && grep -qx "ui:check passed" o4.txt && grep -q '^note: no script imports src/index.css (the Tailwind entry)' o4.txt \
    && cp "$A/main.tsx" src/main.tsx && $CLI check --build | grep -qx "kleros-ui check --build passed" \
    && cp "$LIB/templates/poc/src/App.tsx" src/App.tsx && sed -i '/^import ".\/index.css";/d' src/main.tsx && sed -i '1i import "./index.css";' src/App.tsx \
    && $CLI check >o5.txt && grep -qx "ui:check passed" o5.txt && ! grep -q "style.css" o5.txt \
    && sed -i '/^import App from/d; s#^import "@kleros/ui-components-library/style.css";#import App from "./App";\nimport "@kleros/ui-components-library/style.css";#' src/main.tsx && ! $CLI check >o6.txt \
    && grep -q '^setup: src/App.tsx imports ./index.css (the Tailwind entry) without @kleros/ui-components-library/style.css (src/main.tsx reaches it before any import of @kleros/ui-components-library/style.css)' o6.txt) \
  && echo "gate: d.11 (B8, CL-B8-1): the starter's main.tsx (style.css, then index.css) passes; a script that imports the Tailwind entry before style.css or without it is a setup problem in check and check --build, naming the fix; no script importing the entry is a note; the walk follows imports in order from the JS entry, so index.css imported first in App.tsx passes when main.tsx imports style.css before App, and fails, naming main.tsx, when App comes first"
rm -rf "$A"

# d.11 (CL-CSS-1): a kleros-ui.json with a trailing comma stops check (and the whole-app css) with one line that names
# the file and the fix, no stack; css with paths still scans them, without a theme, and says why on stderr.
A=$(mktemp -d -p "$WORK")
app "$A/app" \
  && (cd "$A/app" && sed -i 's#"components": \[\]#"components": [],#' kleros-ui.json && ! node -e 'JSON.parse(require("fs").readFileSync("kleros-ui.json", "utf8"))' 2>/dev/null \
    && printf '.x {\n  color: red;\n}\n' > x.css && { $CLI css x.css >o1.txt 2>e1.txt; test $? -eq 1; } \
    && grep -q '^css: 2 findings (0 token overrides, 1 colour literal, 1 Tailwind-only' o1.txt && test "$(wc -l < e1.txt)" = 1 \
    && grep -q '^kleros-ui: kleros-ui.json is not valid JSON (.*). Fix it (no comments, no trailing commas), then run the command again. This scan of the files named reads no theme from it.$' e1.txt \
    && { $CLI check >o2.txt 2>&1; test $? -eq 1; } && test "$(wc -l < o2.txt)" = 1 \
    && grep -q '^kleros-ui: kleros-ui.json is not valid JSON (.*). Fix it (no comments, no trailing commas), then run the command again.$' o2.txt) \
  && echo "gate: d.11 (CL-CSS-1): a kleros-ui.json that is not valid JSON stops check with one line naming the file and the fix, no stack; css with paths still scans them and says on one line that it reads no theme"
rm -rf "$A"

# d.11 r3 (R3-1; the r2 cases S2-1 and S2-4): with the real Tailwind (twlink, above), the failure names the kit files
# Tailwind does not scan:
# - @source not "../node_modules" after the starter's @source takes all 12 back out;
# - source(none) on the tailwindcss import, with an @source on one kit file (layout.js), scans that file only, so the
#   other 11 are named;
# - @SOURCE is not read (Tailwind reads @source in lower case only), and the failure says so;
# - an app that resolves no @tailwindcss/node or @tailwindcss/oxide (none linked here) gets one note and passes.
# d.11 r3 fix (D3-1): with the starter's line there, the message names the @source not line and does not say to add the
# line that is already there (an agent looped on it); with some kit files scanned it says "only part", not "no @source".
# r3 fix (S3-3): the note says to reinstall with the app's package manager, not "run npm install" (pnpm, Yarn).
A=$(mktemp -d -p "$WORK")
TH='@import "@kleros/ui-components-library/theme.css";'
entry() { printf '%s\n' "$@" '@custom-variant dark (&:where(.dark, .dark *));' > src/index.css; }
PART="setup: src/index.css: the @source lines reach only part of the library's kit, so Tailwind leaves out the kit's classes (layout, rows, gutters): the app's own Tailwind, run on this entry, does not scan"
NOT="@source not takes the files it names out of that scan"
own "$A/own" && app "$A/notw" \
  && (cd "$A/own" && entry '@import "tailwindcss";' "$TH" "@source \"$L\";" '@source not "../node_modules";' && ! $CLI check >o1.txt \
    && grep -qF "setup: src/index.css: the @source lines reach none of the library's kit, so Tailwind leaves out the kit's classes (layout, rows, gutters): the app's own Tailwind, run on this entry, does not scan any of the kit's 12 files in node_modules/@kleros/ui-components-library/dist/kit/ ($KIT). $NOT (@source not \"../node_modules\"): delete or narrow any that covers the library" o1.txt \
    && ! grep -q "Add @source" o1.txt \
    && entry '@import "tailwindcss";' "$TH" "@source \"$L\";" "@source not \"$L/dist/kit/time.js\";" && ! $CLI check >o5.txt \
    && grep -qF "$PART 1 of the kit's 12 files in node_modules/@kleros/ui-components-library/dist/kit/ (time.js). $NOT (@source not \"$L/dist/kit/time.js\")" o5.txt && ! grep -q "Add @source" o5.txt \
    && entry '@import "tailwindcss" source(none);' "$TH" "@source \"$L/dist/kit/layout.js\";" && ! $CLI check >o2.txt \
    && grep -qF "$PART 11 of the kit's 12 files in node_modules/@kleros/ui-components-library/dist/kit/ (app.js, chart.js, cn.js, data.js, feedback.js, form.js, index.js, state.js, status.js, time.js, tokens.js). Add @source \"$L\";" o2.txt \
    && entry '@import "tailwindcss";' "$TH" "@SOURCE \"$L\";" && ! $CLI check >o3.txt && grep -qF "$ALL12" o3.txt \
    && grep -q '@SOURCE is not read by Tailwind, which reads @source in lower case only$' o3.txt) \
  && (cd "$A/notw" && $CLI check >o4.txt && grep -qx "ui:check passed" o4.txt && ! grep -q '^setup:' o4.txt && test "$(grep -c '^note: src/index.css' o4.txt)" = 1 \
    && grep -qF "note: src/index.css: check could not load this app's @tailwindcss/node and @tailwindcss/oxide (Cannot find module '@tailwindcss/node'), so it did not check that Tailwind scans the kit's files." o4.txt \
    && grep -q "reinstall with the app's package manager$" o4.txt && ! grep -q "npm install" o4.txt) \
  && echo "gate: d.11 r3 (R3-1, D3-1): with the real Tailwind, @source not \"../node_modules\" after the starter's line fails naming all 12 kit files and that @source not line, not the line already there; one on time.js names it and time.js; source(none) with an @source on one kit file fails saying only part is reached and naming the other 11; @SOURCE fails saying Tailwind reads lower case only; an app whose @tailwindcss/node and @tailwindcss/oxide do not resolve gets one note, which says to reinstall with the app's package manager, and passes"
rm -rf "$A"

# d.11 r3 fix (S3-3): pnpm keeps @tailwindcss/node and @tailwindcss/oxide beside @tailwindcss/vite, not in the app's
# node_modules (measured: pnpm 12.8.1 on the starter, where check only noted it); check now loads them as
# @tailwindcss/vite does. The fixture puts them in @tailwindcss/vite's own node_modules: the starter's entry passes,
# with no Tailwind note, and the entry without its @source fails naming all 12 kit files.
# r3 fix (S3-1): Tailwind 4.0's compile() returns no sources (measured on a real 4.0.17 install, where check noted "did
# not compile it here ... Vite aliases"), and its folder @source into node_modules scans nothing. A stand-in with that
# shape (no sources; tailwindcss 4.0.17) gets one note naming 4.0.17, 4.1 and the 4.1.17 floor, and check passes.
A=$(mktemp -d -p "$WORK")
VITE=node_modules/@tailwindcss/vite
own "$A/pnpm" && app "$A/tw40" \
  && (cd "$A/pnpm" && rm node_modules/@tailwindcss/node node_modules/@tailwindcss/oxide && mkdir -p "$VITE/node_modules/@tailwindcss" \
    && echo '{"name":"@tailwindcss/vite","version":"4.3.5","main":"index.js"}' > "$VITE/package.json" && echo 'module.exports = {};' > "$VITE/index.js" \
    && ln -s "$TW/@tailwindcss/node" "$VITE/node_modules/@tailwindcss/node" && ln -s "$TW/@tailwindcss/oxide" "$VITE/node_modules/@tailwindcss/oxide" \
    && $CLI check >o1.txt && grep -qx "ui:check passed" o1.txt && ! grep -q '^note: src/index.css' o1.txt \
    && sed -i '/^@source/d' src/index.css && ! $CLI check >o2.txt && grep -qF "$ALL12" o2.txt) \
  && (cd "$A/tw40" && mkdir -p node_modules/tailwindcss node_modules/@tailwindcss/node node_modules/@tailwindcss/oxide \
    && echo '{"name":"tailwindcss","version":"4.0.17","exports":{"./package.json":"./package.json"}}' > node_modules/tailwindcss/package.json \
    && echo '{"name":"@tailwindcss/node","version":"4.0.17","main":"index.js"}' > node_modules/@tailwindcss/node/package.json \
    && echo 'exports.compile = async () => ({ globs: [], root: null, features: 0, build: () => "" });' > node_modules/@tailwindcss/node/index.js \
    && echo '{"name":"@tailwindcss/oxide","version":"4.0.17","main":"index.js"}' > node_modules/@tailwindcss/oxide/package.json \
    && echo 'exports.Scanner = class { constructor() { throw new Error("4.0 scanner"); } };' > node_modules/@tailwindcss/oxide/index.js \
    && $CLI check >o1.txt && grep -qx "ui:check passed" o1.txt && test "$(grep -c '^note: src/index.css' o1.txt)" = 1 \
    && grep -qF "note: src/index.css: this app's Tailwind is 4.0.17, and check needs 4.1 or later to ask it which files it scans, so it did not check the kit's. Before 4.1, an @source on a folder in node_modules (the starter's line) scans none of it" o1.txt \
    && grep -qF "tailwindcss@^4.1.17 and @tailwindcss/vite@^4.1.17" o1.txt && ! grep -q "Vite aliases" o1.txt) \
  && echo "gate: d.11 r3 fix (S3-1, S3-3): with @tailwindcss/node and @tailwindcss/oxide only beside @tailwindcss/vite, as pnpm installs them, check runs the app's Tailwind from there (the starter passes, and without its @source fails naming all 12 kit files); a Tailwind 4.0 whose compile() gives no sources gets one note naming its version and 4.1.17, not a Vite alias, and passes"
rm -rf "$A"

# d.11 r2 (S2-5, S2-6): an import by alias ("@/App"), which check does not resolve, stops the walk with a note when it
# comes before style.css, and what a later walk finds is a note, not a problem (vite build: main.tsx with style.css
# then "@/App", whose App.tsx imports index.css first, puts the library's CSS first; check failed it). The control with
# "./App" still fails. A byte-order mark before main.tsx's first import no longer hides it: the right order passes and
# the wrong one fails.
A=$(mktemp -d -p "$WORK")
app "$A/app" \
  && (cd "$A/app" && cp "$LIB/templates/poc/src/App.tsx" src/App.tsx \
    && sed -i '/^import ".\/index.css";/d; s#^import App from "./App";#import App from "@/App";#' src/main.tsx && sed -i '1i import "./index.css";' src/App.tsx \
    && $CLI check >o1.txt && grep -qx "ui:check passed" o1.txt && ! grep -q '^setup:' o1.txt \
    && grep -q '^note: src/App.tsx imports ./index.css (the Tailwind entry) without .*Not failing: src/main.tsx imports "@/App", which check cannot follow' o1.txt \
    && printf '%s\n' 'import App from "@/App";' 'import "@kleros/ui-components-library/style.css";' 'import "./routes";' 'export default App;' > src/main.tsx \
    && printf '%s\n' 'import App from "./App";' 'export default App;' > src/routes.tsx \
    && $CLI check >o2.txt && grep -q '^note: src/main.tsx imports "@/App" before @kleros/ui-components-library/style.css, and check cannot follow it' o2.txt \
    && sed -i 's#"@/App"#"./App"#' src/main.tsx && ! $CLI check >o3.txt && grep -q '^setup: src/App.tsx imports ./index.css (the Tailwind entry) without' o3.txt \
    && rm src/routes.tsx && cp "$LIB/templates/poc/src/App.tsx" src/App.tsx && { printf '\xef\xbb\xbf'; cat "$LIB/templates/poc/src/main.tsx"; } > src/main.tsx \
    && $CLI check >o4.txt && grep -qx "ui:check passed" o4.txt && ! grep -q "style.css" o4.txt \
    && { printf '\xef\xbb\xbf'; printf '%s\n' 'import "./index.css";' 'import "@kleros/ui-components-library/style.css";' 'import App from "./App";' 'export default App;'; } > src/main.tsx \
    && ! $CLI check >o5.txt && grep -q '^setup: src/main.tsx imports ./index.css (the Tailwind entry) before @kleros/ui-components-library/style.css' o5.txt \
    && cp "$LIB/templates/poc/src/main.tsx" src/main.tsx && sed -i '/^import ".\/index.css";/d; s#^import App from "./App";#import App from "@app/App";#' src/main.tsx \
    && sed -i '1i import "./index.css";' src/App.tsx && $CLI check >o6.txt && grep -qx "ui:check passed" o6.txt && ! grep -q '^setup:' o6.txt \
    && grep -q '^note: src/App.tsx imports ./index.css (the Tailwind entry) without .*Not failing: src/main.tsx imports "@app/App", which check cannot follow' o6.txt) \
  && echo "gate: d.11 r2 (S2-5, S2-6) and r3 fix (L3-1): an alias import (@/App, or a scoped @app/App no node_modules has) is a note, not a false failure, and one before style.css stops the walk with a note instead of a false pass; the ./App control still fails; a byte-order mark no longer hides main.tsx's first import"
rm -rf "$A"

# d.11 r2 (L2-1..L2-5): the stale-disable notes, on what ESLint 9.39.5 prints for these files (measured with the d.11
# preset in a scratch copy of d10-try/new-app; the stub replays it), under a baseline from before d.11:
# - a block disable's note also names its eslint-enable, whose old id would no longer end the renamed disable (L2-1);
# - a comment naming two unused rules ("... from 'no-restricted-syntax' or 'no-restricted-imports'") gets its note (L2-2);
# - a next-line comment on line 1 after a byte-order mark covers the next line only, so new errors below fail (L2-3);
# - an eslint-enable of another rule does not end a block disable (L2-4);
# - an unused old comment that silenced nothing does not excuse the file's new unused-directive error (L2-5).
A=$(mktemp -d -p "$WORK")
app "$A/app" \
  && (cd "$A/app" && printf '%s\n' '/* eslint-disable no-restricted-syntax */' 'export const C = () => <button>old</button>;' '/* eslint-enable no-restricted-syntax */' 'export const E = () => <button>after</button>;' > src/Blk.tsx \
    && printf '%s\n' '// eslint-disable-next-line no-restricted-syntax, no-restricted-imports' 'export const F = () => <button>combo-both</button>;' '// eslint-disable-next-line no-restricted-syntax, no-console' 'export const G = () => <button>combo-other</button>;' > src/Combo.tsx \
    && { printf '\xef\xbb\xbf'; printf '%s\n' '// eslint-disable-next-line no-restricted-syntax' 'export const A = () => <button>old</button>;' '' '// code added after the upgrade:' 'export const N1 = () => <button>new-1</button>;' 'export const N2 = () => <input />;'; } > src/Bom.tsx \
    && printf '%s\n' '/* eslint-disable no-restricted-syntax */' 'export const A = () => <button>old-1</button>;' '/* eslint-disable no-console */' 'console.log("x");' '/* eslint-enable no-console */' 'export const B = () => <button>old-2</button>;' > src/Inner.tsx \
    && printf '%s\n' '// eslint-disable-next-line no-restricted-syntax' 'export const ok = 1;' '// added after the upgrade:' '// eslint-disable-next-line no-console' 'export const x = 2;' > src/F.tsx \
    && node -e '
const u = (ids, line, severity = 1) => ({ ruleId: null, severity, line, column: 1, message: `Unused eslint-disable directive (no problems were reported from ${ids.map((i) => `'"'"'${i}'"'"'`).join(" or ")}).` });
const raw = (line, column) => ({ ruleId: "kleros-ui/no-restricted-syntax", severity: 2, line, column, message: "Raw <button>: use Button from @kleros/ui-components-library (see agent/CATALOG.md)." });
const f = (name, messages) => ({ filePath: `${process.argv[1]}/src/${name}`, messages });
console.log(JSON.stringify([
  f("Blk.tsx", [u(["no-restricted-syntax"], 1), raw(2, 24), raw(4, 24)]),
  f("Bom.tsx", [u(["no-restricted-syntax"], 1), raw(2, 24), raw(5, 25), raw(6, 25)]),
  f("Combo.tsx", [u(["no-restricted-syntax", "no-restricted-imports"], 1), raw(2, 24), u(["no-restricted-syntax", "no-console"], 3), raw(4, 24)]),
  f("Inner.tsx", [u(["no-restricted-syntax"], 1), raw(2, 24), u(["no-console"], 3), raw(6, 24)]),
  f("F.tsx", [u(["no-restricted-syntax"], 1, 2), u(["no-console"], 4, 2)]),
]));' "$PWD" > eslint-out.json \
    && echo '{"lint":{"src/Blk.tsx|no-restricted-syntax":1,"src/F.tsx|fatal":1},"tsc":{},"css":{}}' > kleros-ui-baseline.json && ! $CLI check >o1.txt \
    && grep -q '^note: src/Blk.tsx:1 eslint-disable names no-restricted-syntax, .* reports src/Blk.tsx:2 as kleros-ui/no-restricted-syntax. Write kleros-ui/no-restricted-syntax in that comment and in the eslint-enable at src/Blk.tsx:3 instead' o1.txt \
    && grep -q '^note: src/Combo.tsx:1 eslint-disable-next-line names no-restricted-syntax, .* reports src/Combo.tsx:2 as' o1.txt \
    && grep -q '^note: src/Combo.tsx:3 eslint-disable-next-line names no-restricted-syntax, .* reports src/Combo.tsx:4 as' o1.txt \
    && grep -q '^note: src/Bom.tsx:1 eslint-disable-next-line names no-restricted-syntax, .* reports src/Bom.tsx:2 as' o1.txt \
    && grep -q '^note: src/Inner.tsx:1 eslint-disable names no-restricted-syntax, .* reports src/Inner.tsx:2, src/Inner.tsx:6 as' o1.txt \
    && test "$(grep -c '^note: .*eslint-disable' o1.txt)" = 5 && grep -q '^lint: 6 errors under an eslint-disable comment that names the old rule id' o1.txt \
    && grep -q '^lint: 2 new (baseline 0):' o1.txt && grep -q '^lint: 1 new (baseline 1):' o1.txt && test "$(grep -c '^lint: [0-9]* new' o1.txt)" = 2) \
  && echo "gate: d.11 r2 (L2-1, L2-2, L2-3, L2-4, L2-5): under a baseline from before d.11, a block disable's note names its eslint-enable too; a comment naming two unused rules gets its note; a byte-order mark no longer turns a line-1 next-line comment into a file-wide one; another rule's eslint-enable does not end a block disable; an unused old comment that silenced nothing excuses no error"
rm -rf "$A"

# d.11 r3 fix (L3-2, L3-3): what ESLint 9.39.5 printed for these files with the d.11 preset (a scratch copy of a
# create-made app, real install), under the baseline the d.10 CLI and preset wrote for them before the two new buttons:
# - ESLint ignores a `// eslint-enable` (line comments take only -line and -next-line), so the block disable runs to the
#   end, as under d.10, and both buttons are excused (check failed LineEnable.tsx on code d.10 had passed);
# - an enable whose " -- " description runs onto the next line, or that names the id in quotes, ends the block, as in
#   ESLint: the note names that enable and lists only the line before it (it named neither, so renaming the disable
#   alone silenced the rest of the file);
# - Dup.tsx:6 sits under two old disables and is excused once, so the new button after the block fails like Lf.tsx's.
A=$(mktemp -d -p "$WORK")
app "$A/app" \
  && (cd "$A/app" && printf '%s\n' '/* eslint-disable no-restricted-syntax */' 'export const A = () => <button>old</button>;' '// eslint-enable no-restricted-syntax' 'export const B = () => <button>after</button>;' > src/LineEnable.tsx \
    && printf '%s\n' 'export const C = () => (' '  <div>' '    {/* eslint-disable no-restricted-syntax */}' '    <button>old</button>' '    {/* eslint-enable no-restricted-syntax --' '        end of the legacy block */}' '    <button>after</button>' '  </div>' ');' > src/Desc.tsx \
    && printf '%s\n' 'export const C = () => (' '  <div>' '    {/* eslint-disable no-restricted-syntax */}' '    <button>old</button>' '    {/* eslint-enable "no-restricted-syntax" */}' '    <button>after</button>' '  </div>' ');' > src/Quoted.tsx \
    && printf '%s\n' 'export const C = () => (' '  <div>' '    {/* eslint-disable no-restricted-syntax */}' '    <button>a</button>' '    {/* eslint-disable no-restricted-syntax */}' '    <button>b</button>' '    {/* eslint-enable no-restricted-syntax */}' '    <button>after</button>' '    <button>new-after-upgrade</button>' '  </div>' ');' > src/Dup.tsx \
    && printf '%s\n' 'export const C = () => (' '  <div>' '    {/* eslint-disable no-restricted-syntax */}' '    <button>a</button>' '    {/* eslint-enable no-restricted-syntax */}' '    <button>after</button>' '    <button>new-after-upgrade</button>' '  </div>' ');' > src/Lf.tsx \
    && node -e '
const u = (line, column) => ({ ruleId: null, severity: 1, line, column, message: "Unused eslint-disable directive (no problems were reported from '"'"'no-restricted-syntax'"'"')." });
const raw = (line, column) => ({ ruleId: "kleros-ui/no-restricted-syntax", severity: 2, line, column, message: "Raw <button>: use Button from @kleros/ui-components-library (see agent/CATALOG.md)." });
const f = (name, messages) => ({ filePath: `${process.argv[1]}/src/${name}`, messages });
console.log(JSON.stringify([
  f("Dup.tsx", [u(3, 6), raw(4, 5), u(5, 6), raw(6, 5), raw(8, 5), raw(9, 5)]),
  f("Lf.tsx", [u(3, 6), raw(4, 5), raw(6, 5), raw(7, 5)]),
  f("Desc.tsx", [u(3, 6), raw(4, 5), raw(7, 5)]),
  f("Quoted.tsx", [u(3, 6), raw(4, 5), raw(6, 5)]),
  f("LineEnable.tsx", [u(1, 1), raw(2, 24), raw(4, 24)]),
]));' "$PWD" > eslint-out.json \
    && echo '{"lint":{"src/Dup.tsx|no-restricted-syntax":1,"src/Lf.tsx|no-restricted-syntax":1,"src/Desc.tsx|no-restricted-syntax":1,"src/Quoted.tsx|no-restricted-syntax":1},"tsc":{},"css":{}}' > kleros-ui-baseline.json \
    && ! $CLI check >o1.txt \
    && grep -q '^note: src/LineEnable.tsx:1 eslint-disable names no-restricted-syntax, .* reports src/LineEnable.tsx:2, src/LineEnable.tsx:4 as kleros-ui/no-restricted-syntax. Write kleros-ui/no-restricted-syntax in that comment instead' o1.txt \
    && grep -q '^note: src/Desc.tsx:3 eslint-disable names no-restricted-syntax, .* reports src/Desc.tsx:4 as kleros-ui/no-restricted-syntax. Write kleros-ui/no-restricted-syntax in that comment and in the eslint-enable at src/Desc.tsx:5 instead' o1.txt \
    && grep -q '^note: src/Quoted.tsx:3 eslint-disable names no-restricted-syntax, .* reports src/Quoted.tsx:4 as kleros-ui/no-restricted-syntax. Write kleros-ui/no-restricted-syntax in that comment and in the eslint-enable at src/Quoted.tsx:5 instead' o1.txt \
    && grep -q '^lint: 7 errors under an eslint-disable comment that names the old rule id' o1.txt \
    && test "$(grep -c '^lint: 1 new (baseline 1):$' o1.txt)" = 2 && test "$(grep -c '^lint: [0-9]* new' o1.txt)" = 2 \
    && grep -q '^  src/Dup.tsx:9:5 ' o1.txt && grep -q '^  src/Lf.tsx:7:5 ' o1.txt && ! grep -q '^  src/LineEnable.tsx' o1.txt) \
  && echo "gate: d.11 r3 fix (L3-2, L3-3): under a baseline from before d.11, a // eslint-enable, which ESLint ignores, does not end a block disable, so the code d.10 passed still passes; an enable whose -- description runs onto the next line, or that quotes the id, ends it, and the note names that enable; an error under two old disables is excused once, so a new raw control after them fails"
rm -rf "$A"

# d.11 r2 (L2-6, L2-7, L2-8): css <path> with a kleros-ui.json that is not JSON scans on when src/theme.css exists
# (3 findings and the summary, not a second error line); a /* inside an unquoted url() starts no comment, so a rule
# after it in the theme file is a finding (vite build ships it); css <theme path> reads the declared theme file whatever
# its extension, as the whole-app scan does.
A=$(mktemp -d -p "$WORK")
app "$A/broken" && app "$A/url" && app "$A/txt" \
  && (cd "$A/broken" && printf '{ "cssEntry": "src/index.css", }\n' > kleros-ui.json && touch src/theme.css \
    && printf '.x { --klerosUIComponentsPrimaryBlue: #123456; }\n' > src/other.css && { $CLI css src/other.css >o1.txt 2>e1.txt; test $? -eq 1; } \
    && grep -q '^css: 3 findings (1 token override, 1 colour literal, 1 Tailwind-only' o1.txt && test "$(wc -l < e1.txt)" = 1 \
    && echo null > kleros-ui.json && { $CLI css src/other.css >o2.txt 2>e2.txt; test $? -eq 1; } \
    && grep -q '^css: 3 findings (1 token override, 1 colour literal, 1 Tailwind-only' o2.txt && test "$(wc -l < e2.txt)" = 1 \
    && grep -q '^kleros-ui: kleros-ui.json is not valid JSON (null is not an object)' e2.txt \
    && { $CLI check >o3.txt 2>&1; test $? -eq 1; } && test "$(wc -l < o3.txt)" = 1 && grep -q '^kleros-ui: kleros-ui.json is not valid JSON (null is not an object)' o3.txt) \
  && (cd "$A/url" && $CLI theme >/dev/null \
    && printf '@layer base { :root { --klerosUIComponentsPrimaryBlue: url(/*); } } .hidden-a { color: rgb(1, 2, 3) !important; } @layer base { :root { --klerosUIComponentsPrimaryBlue: url(*/); } }\n' > src/theme.css \
    && ! $CLI css >o1.txt && grep -q '^src/theme.css:1:.* Selector ".hidden-a" in the theme file src/theme.css' o1.txt) \
  && (cd "$A/txt" && node -e 'const fs = require("fs"); const c = JSON.parse(fs.readFileSync("kleros-ui.json", "utf8")); c.theme = "./src/theme.txt"; fs.writeFileSync("kleros-ui.json", JSON.stringify(c, null, 2))' \
    && sed -i 's#^@import "@kleros/ui-components-library/theme.css";#&\n@import "./theme.txt";#' src/index.css \
    && printf '@layer base { :root { --klerosUIComponentsPrimaryBlue: #05a; // } .x { color: red; }\n } }\n' > src/theme.txt \
    && ! $CLI css src/theme.txt >o1.txt && grep -q 'Selector ".x" in the theme file src/theme.txt' o1.txt && grep -q ' in 1 file scanned$' o1.txt) \
  && echo "gate: d.11 r2 (L2-6, L2-7, L2-8) and r3 fix (L3-4): css <path> with a broken kleros-ui.json, or one that is the JSON null, scans on with one line on stderr when src/theme.css exists, and check stops with one line; a /* in an unquoted url() hides no rule from the theme scan; css <theme path> reads a declared theme file of any extension"
rm -rf "$A"
