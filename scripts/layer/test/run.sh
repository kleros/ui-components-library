#!/bin/bash
# yarn test:layer [pack.tgz]: the agent layer's gates (kit, CLI, agent guide, lint preset, starter), run on a packed
# package. Without an argument it packs this repo first with yarn pack, whose prepack runs the build. These are the
# gates the d.11 build ran on its pack (its build.sh steps 5 to 10, gate/cli-gates.sh and gate/d11-gates.sh). Each
# prints one "gate: ..." line when it holds and nothing when it does not, so the run fails unless all EXPECTED lines
# print and the kit's smoke render passes.
#
# Where the gates run: a new folder from mktemp in $TMPDIR (default /tmp), outside this repo and outside any git repo.
# Node and TypeScript look for a package in every folder above a file, and several gates test an app with no Tailwind
# or ESLint, so nothing from this repo's node_modules may sit above the fixtures or the gate helpers.
# - check/node_modules/@kleros/ui-components-library is the pack, extracted. The fixtures are folders beside check/.
# - layer/ holds a copy of gate/ (the helpers import packages, which must resolve as they did in the d.11 build) and a
#   link to tools/.
# - node_modules holds what an app that installs the package has: its dependencies, @types/react and @types/react-dom,
#   linked from this repo's install, and React 18.3 and happy-dom from tools/. No Tailwind, ESLint or library copy.
# - tools/ (package.json and lockfile) pins the real Tailwind 4.3.5 that the @source gates link into their fixtures
#   (the repo builds with Tailwind 4.0, and check needs 4.1 or later), React 18.3 (the smoke render uses its act; the
#   repo's own React is 18.2) and happy-dom. run.sh runs npm ci there when tools/node_modules is missing or was
#   installed from another lockfile.
# Needs Node 22.15 or later (see the check below; the repo's volta pin, Node 20, is too old) and, on the first run,
# network for the npm ci in tools/. KEEP=1 keeps the work folder. Heavy without a pack path: the build runs first.
set -uo pipefail
HERE=$(cd "$(dirname "$0")" && pwd -P)
REPO=$(cd "$HERE/../../.." && pwd -P)
EXPECTED=44
TSC=$REPO/node_modules/.bin/tsc
die() { echo "test:layer: $*" >&2; exit 1; }
test -x "$TSC" || die "$TSC is missing: run yarn install first"
# The gates that read the lint preset's config load gate/eslint-stand-in.mjs, which uses registerHooks from node:module
# (added in Node 22.15 and 23.5). On an older Node those gates print nothing, so stop here and say why.
node -e 'process.exit(typeof require("node:module").registerHooks === "function" ? 0 : 1)' \
  || die "needs Node 22.15 or later (gate/eslint-stand-in.mjs uses registerHooks from node:module); this is Node $(node -v)"

# Yarn runs this script in the repo's folder, so a relative pack path is read from the folder yarn was started in.
TGZ=
if [ $# -gt 0 ]; then
  case $1 in /*) TGZ=$1 ;; *) TGZ=${INIT_CWD:-$PWD}/$1 ;; esac
  test -f "$TGZ" || die "no pack at $TGZ"
fi

WORK=$(mktemp -d "${TMPDIR:-/tmp}/kleros-ui-test-layer.XXXXXX") || die "mktemp failed in ${TMPDIR:-/tmp}"
WORK=$(cd "$WORK" && pwd -P)
if [ "${KEEP:-0}" = 1 ]; then echo "test:layer: KEEP=1, so the work folder stays: $WORK"; else trap 'rm -rf "$WORK"' EXIT; fi
case $WORK/ in "$REPO"/*) die "the work folder $WORK is inside the repo: set TMPDIR to a folder outside it" ;; esac
git -C "$WORK" rev-parse --git-dir >/dev/null 2>&1 \
  && die "the work folder $WORK is inside a git repo, and one gate needs a fixture outside git: set TMPDIR elsewhere"
# Nothing above the work folder may give the fixtures a Tailwind, an ESLint or a copy of the library. A .gitignore that
# ignores the work folder, outside git, makes Tailwind 4.3.5 scan node_modules there, which fails the @source gates.
d=$(dirname "$WORK")
while :; do
  for m in tailwindcss @tailwindcss/node @tailwindcss/oxide eslint @kleros/ui-components-library; do
    test -e "$d/node_modules/$m" && die "$d/node_modules/$m is above the work folder, so the fixtures would find it: set TMPDIR elsewhere"
  done
  test -e "$d/.gitignore" && echo "test:layer: note: $d/.gitignore is above the work folder; if it ignores that folder, the @source gates fail" >&2
  [ "$d" = / ] && break
  d=$(dirname "$d")
done

if [ -z "$TGZ" ]; then
  echo "test:layer: packing the repo (yarn pack, which builds first)"
  (cd "$REPO" && yarn pack --out "$WORK/package.tgz") >"$WORK/pack.log" 2>&1 || { tail -30 "$WORK/pack.log" >&2; die "yarn pack failed"; }
  TGZ=$WORK/package.tgz
fi
echo "pack: $TGZ ($(wc -c <"$TGZ") bytes, md5 $(md5sum <"$TGZ" | cut -c1-32))"

# Under yarn test:layer, Yarn puts a folder of this repo's own bins (eslint, tsc, vite, kleros-ui) first on PATH and sets
# npm_* variables. The gates stand for an app's own shell, so both go.
if [ -n "${BERRY_BIN_FOLDER:-}" ]; then PATH=$(printf '%s\n' "$PATH" | tr ':' '\n' | grep -vxF "$BERRY_BIN_FOLDER" | paste -sd: -); fi
unset BERRY_BIN_FOLDER INIT_CWD PROJECT_CWD npm_execpath npm_node_execpath npm_config_user_agent npm_package_name \
  npm_package_version npm_package_json npm_lifecycle_event npm_lifecycle_script

TOOLS=$HERE/tools
LOCKSUM=$(md5sum <"$TOOLS/package-lock.json" | cut -c1-32)
if [ "$(cat "$TOOLS/node_modules/.lock-md5" 2>/dev/null)" != "$LOCKSUM" ]; then
  echo "test:layer: installing tools/ from its lockfile (npm ci: Tailwind 4.3.5, React 18.3, happy-dom)"
  (cd "$TOOLS" && npm ci --no-audit --no-fund) >"$WORK/tools.log" 2>&1 && echo "$LOCKSUM" >"$TOOLS/node_modules/.lock-md5" \
    || { tail -20 "$WORK/tools.log" >&2; die "npm ci in $TOOLS failed"; }
fi

CHECK=$WORK/check
mkdir -p "$CHECK/node_modules/@kleros" "$CHECK/src"
tar -xzf "$TGZ" -C "$CHECK/node_modules/@kleros" && mv "$CHECK/node_modules/@kleros/package" "$CHECK/node_modules/@kleros/ui-components-library" \
  || die "could not extract $TGZ"
LIB=$CHECK/node_modules/@kleros/ui-components-library
VERSION=$(node -p 'require(process.argv[1]).version' "$LIB/package.json") || die "the pack has no readable package.json"
link() { # <package> <the node_modules folder it comes from>
  test -e "$2/$1" || die "$1 is not in $2: run yarn install, or delete $TOOLS/node_modules"
  mkdir -p "$WORK/node_modules/$(dirname "$1")" && ln -s "$2/$1" "$WORK/node_modules/$1"
}
for m in $(node -p 'Object.keys(require(process.argv[1]).dependencies || {}).join("\n")' "$LIB/package.json") @types/react @types/react-dom; do
  link "$m" "$REPO/node_modules"
done
for m in react react-dom react-is @happy-dom/global-registrator; do link "$m" "$TOOLS/node_modules"; done
P=$WORK/layer
mkdir -p "$P" && cp -R "$HERE/gate" "$P/gate" && ln -s "$TOOLS" "$P/tools" || die "could not copy the gates to $P"
# d.10 built a second, test-only pack with an install gate (GATE=1). This repo packs none, so the d.10 line checks that
# the pack has no install or prepare script.
GATE=0

gates() {
# 5. Gate: the packed tarball, extracted into a check project (above): compile what ships, templates included.
cp "$LIB"/recipes/*.tsx "$CHECK/src/"
cp "$LIB/templates/poc/src/App.tsx" "$CHECK/src/template-App.tsx"
# d.9 (D8, D18): the starter's main.tsx imports applyInitialTheme from /kit, so it is compiled too (its CSS imports are side effects tsc does not resolve).
sed 's#from "./App"#from "./template-App"#' "$LIB/templates/poc/src/main.tsx" > "$CHECK/src/template-main.tsx"
cp "$P/gate/fixture.tsx" "$CHECK/src/"
for kind in ui data form; do
  mkdir -p "$CHECK/src/t-$kind"
  for t in "$LIB/agent/templates/$kind"/*.tmpl; do
    b=$(basename "$t" .tmpl); sed "s/__NAME__/Gate${kind^}/g" "$t" > "$CHECK/src/t-$kind/${b/__NAME__/Gate${kind^}}"
  done
done
(cd "$CHECK" && nice "$TSC" --noEmit --strict --jsx react-jsx --skipLibCheck --target es2020 --module esnext \
  --moduleResolution bundler --esModuleInterop --lib dom,es2020 --typeRoots ../node_modules/@types \
  src/*.tsx src/t-*/*.ts src/t-*/*.tsx) \
  && echo "gate: recipes, template, kit fixture and new-component templates compile against the packed tarball"

# 6. Smoke: server-render every kit component through the packed package.
cp "$P"/gate/smoke.mjs "$P"/gate/css-stub-loader.mjs "$CHECK"/
(cd "$CHECK" && node smoke.mjs 2>/dev/null | tail -1)

# 7. CLI: init is idempotent, there is no find, new scaffolds and refuses library names.
T=$(mktemp -d -p "$WORK"); CLI="node $LIB/bin/kleros-ui.mjs"
# d.11 r3 fix (D3-5): every agent/*.md the block names is a path from the app (rules 2 and 7 named bare agent/... paths).
(cd "$T" && echo '{"name":"t","type":"module","scripts":{}}' > package.json && $CLI init >/dev/null && $CLI init >/dev/null \
  && grep -c "kleros-ui:start" AGENTS.md | grep -qx 1 && grep -q '"ui:check"' package.json && test -f eslint.config.js \
  && grep -o '[^ ()`]*agent/[A-Z-]*\.md' AGENTS.md | sort -u > agent-paths.txt && test "$(wc -l < agent-paths.txt)" = 4 \
  && while read -r f; do test -f "$f" || exit 1; done < agent-paths.txt) \
  && echo "gate: init writes one managed block, ui:check and the lint config; each agent/*.md the block names (AGENTS.md, CATALOG.md, NEW-COMPONENT.md, LOOK.md) is a path that exists from the app (d.11 r3 fix, D3-5)"
# An existing app (d.3, from the Court pilot): its eslint.config.mjs is wrapped, not shadowed by a new .js, and its
# component folders are recorded as existing, so check holds only new ones to the rules.
E=$(mktemp -d -p "$WORK")
(cd "$E" && echo '{"name":"e","type":"module","scripts":{}}' > package.json && echo 'export default [];' > eslint.config.mjs \
  && mkdir -p src/components/OldCard && echo 'export default () => null;' > src/components/OldBadge.tsx && $CLI init >/dev/null \
  && test ! -e eslint.config.js && grep -q 'eslint.config.app.mjs' eslint.config.mjs && test -f eslint.config.app.mjs \
  && grep -q '"status": "existing"' kleros-ui.json && grep -q '"file": "src/components/OldBadge.tsx"' kleros-ui.json \
  && grep -q '"ui:baseline"' package.json) \
  && echo "gate: init in an existing app wraps eslint.config.mjs and records existing component folders and files"
rm -rf "$E"
grep -q "kleros-ui create" "$LIB/README.md" && grep -q "npx kleros-ui init" "$LIB/README.md" && grep -q "templates/poc" "$LIB/README.md" \
  && ! grep -q "node_modules/@kleros/ui-components-library/templates" "$LIB/README.md" && grep -q "agent/AGENTS.md" "$LIB/README.md" \
  && grep -q "React 19 is not supported" "$LIB/README.md" \
  && node -e 'const p = require(process.argv[1]); if (["react", "react-dom", "react-is"].some((k) => k in (p.dependencies || {}) || !(k in p.peerDependencies)) || "prepare" in (p.scripts || {})) process.exit(1)' "$LIB/package.json" \
  && echo "gate: README leads with create and names the starter, init, the agent guide and React 18; React is a peer only; no prepare script"
# d.10: D33, D31, the starter's prebuild, and the install gate only in the GATE=1 pack.
# d.11 (T6): D34's text is now the theme file: Theme usage sets token values only there, in @layer base, through
# npx kleros-ui theme (still no bare "Override them like this"), and Setup 1b's entry is the four lines plus the theme
# import when the app has a theme. d.11 builds no GATE pack (§20), so its line ends "install scripts: none".
! grep -q "Apps without Tailwind" "$LIB/README.md" && ! grep -q "Override them like this" "$LIB/README.md" \
  && grep -q "^1. New app: let the package.s CLI write this setup; do not write it by hand" "$LIB/README.md" \
  && grep -qx "   @custom-variant dark (&:where(.dark, .dark \*));" "$LIB/README.md" \
  && grep -q "^   b. Your Tailwind entry (.src/index.css.): these four lines, plus your theme import when the app has a theme" "$LIB/README.md" \
  && grep -qF 'With a theme, `npx kleros-ui theme` adds one line' "$LIB/README.md" && grep -qF '`@import "./theme.css";`' "$LIB/README.md" \
  && grep -q "^An app with colours of its own sets new token values in one theme file, and nowhere else" "$LIB/README.md" \
  && grep -qx "@layer base {" "$LIB/README.md" && grep -q "issues/120" "$LIB/README.md" \
  && ( for f in "$LIB/dist/ui-components-library.d.ts" "$LIB/dist/lib/index.d.ts" "$LIB"/dist/kit/*.d.ts; do head -1 "$f" | grep -q "kleros-ui create.*agent/AGENTS.md" || exit 1; done ) \
  && grep -q "kleros-ui create" <(node -p 'require(process.argv[1]).description' "$LIB/package.json") \
  && node -e 'const s = require(process.argv[1]).scripts; process.exit(s.build === "kleros-ui check --build && vite build" && !("prebuild" in s) ? 0 : 1)' "$LIB/templates/poc/package.json" \
  && node -e 'const s = require(process.argv[1]).scripts || {}; const want = process.argv[2] === "1"; process.exit(want ? (s.postinstall === "node bin/kleros-ui.mjs postinstall" && Object.keys(s).filter((k) => /install|prepare/.test(k)).length === 1 ? 0 : 1) : (Object.keys(s).some((k) => /install|prepare/.test(k)) ? 1 : 0))' "$LIB/package.json" "$GATE" \
  && echo "gate: d.10: README Setup step 1 points to create, with the four-line Tailwind entry plus the theme import when the app has a theme, no Apps without Tailwind (D33), and Theme usage sets token values only in the theme file npx kleros-ui theme writes, inside @layer base, with no bare override (D34, T6); the description and every type entry name create and the guide (D31); the starter build runs kleros-ui check --build first; install scripts: $([ "$GATE" = 1 ] && echo 'only the gate postinstall' || echo none)"
# d.11 (T6, R1, B5): the guide's Themes section and LOOK.md say where a theme goes; agent/REVIEW.md, the PR reviewers'
# checklist, ships with its five parts and is named by the README and AGENTS.md; the README no longer says Button
# takes no children.
test "$(grep -c '^## [1-5]\. ' "$LIB/agent/REVIEW.md" 2>/dev/null)" = 5 && grep -q "agent/REVIEW.md" "$LIB/README.md" && grep -q "agent/REVIEW.md" "$LIB/agent/AGENTS.md" \
  && awk '/^## Themes$/ { on = 1; next } /^## / { on = 0 } on' "$LIB/agent/AGENTS.md" > "$WORK/themes.md" \
  && grep -q "npx kleros-ui theme" "$WORK/themes.md" && grep -q "keeps the library.s dark value" "$WORK/themes.md" \
  && grep -q "#120" "$WORK/themes.md" && grep -q "One theme per app" "$WORK/themes.md" \
  && grep -q "theme file" "$LIB/agent/LOOK.md" && ! grep -q "no children" "$LIB/README.md" \
  && echo "gate: d.11 (T6, R1): AGENTS.md has a Themes section (npx kleros-ui theme, a light-only value keeps the library's dark one, contrast is the app's with #120, one theme per app), LOOK.md names the theme file, and agent/REVIEW.md, the reviewers' five-part checklist, ships and is named by the README and AGENTS.md"
rm -f "$WORK/themes.md"
# d.11 (DO-1, DO-5, CL-B1-1): a token set from code (a style object or style.setProperty) is named in AGENTS.md, the
# README and REVIEW.md part 3, whose command, run as printed on a sample diff, lists those added lines and skips a var()
# use, a class name and a context line; REVIEW.md part 1 gives the hoisted @source an existing app writes by hand; the
# README and AGENTS.md tell an app whose eslint-disable comments name the core ids that they do not silence the preset.
REVIEW_AWK=$(awk '/^## 3\./ { on = 1 } on && /git diff main\.\.\.HEAD/ { print; exit }' "$LIB/agent/REVIEW.md" | sed 's/^ *//; s/^git diff [^|]*| //')
# d.11 r2 (D2-2): it skips Tailwind's bg-(--token) read too, lists a class that sets a token, and the class route is
# named in AGENTS.md, the README and part 3, which also says to run the command in the app's folder.
printf '%s\n' '+  el.style.setProperty("--klerosUIComponentsPrimaryBlue", "#05a");' '+  <div style={{ "--color-klerosUIComponentsPrimaryText": "#000" }} />' \
  '+  <p className="text-klerosUIComponentsPrimaryText" style={{ color: "var(--klerosUIComponentsPrimaryText)" }} />' ' const old = "--klerosUIComponentsStroke";' \
  '+  <p className="bg-(--klerosUIComponentsPrimaryBlue) text-(--color-klerosUIComponentsPrimaryText)" />' \
  '+  <p className="[--klerosUIComponentsPrimaryBlue:var(--klerosUIComponentsSecondaryBlue)]" />' > "$WORK/diff.txt"
test "$(sh -c "$REVIEW_AWK" < "$WORK/diff.txt" | grep -c 'setProperty\|--color-klerosUIComponentsPrimaryText\|\[--klerosUIComponentsPrimaryBlue:')" = 3 && test "$(sh -c "$REVIEW_AWK" < "$WORK/diff.txt" | wc -l)" = 3 \
  && grep -q "style.setProperty" "$LIB/agent/REVIEW.md" && grep -q "style.setProperty" "$LIB/agent/AGENTS.md" && grep -q "style.setProperty" "$LIB/README.md" \
  && grep -qF '[--klerosUIComponentsPrimaryBlue:' "$LIB/agent/REVIEW.md" && grep -qF '[--klerosUIComponentsPrimaryBlue:' "$LIB/agent/AGENTS.md" && grep -qF '[--klerosUIComponentsPrimaryBlue:' "$LIB/README.md" \
  && grep -q "Run this in the app.s folder (where .kleros-ui.json. is" "$LIB/agent/REVIEW.md" \
  && awk '/^## 1\./ { on = 1; next } /^## / { on = 0 } on' "$LIB/agent/REVIEW.md" | grep -q '\.\./\.\./node_modules/@kleros/ui-components-library' \
  && grep -qF 'Apps whose `eslint-disable` comments name `no-restricted-syntax` or `no-restricted-imports`' "$LIB/agent/AGENTS.md" \
  && grep -qF 'Apps whose `eslint-disable` comments name `no-restricted-syntax` or `no-restricted-imports`' "$LIB/README.md" \
  && UPGRADE_GREP=$(grep -o "grep -rnE '[^']*' src" "$LIB/agent/AGENTS.md") && mkdir -p "$WORK/upgrade/src" \
  && printf '%s\n' '/* eslint-disable no-restricted-syntax */' 'x' '/* eslint-enable no-restricted-syntax */' '/* eslint-disable kleros-ui/no-restricted-syntax */' '/* eslint-enable kleros-ui/no-restricted-syntax */' '// eslint-disable-next-line kleros-ui/no-restricted-syntax, no-restricted-imports' > "$WORK/upgrade/src/Old.tsx" \
  && test "$(cd "$WORK/upgrade" && sh -c "$UPGRADE_GREP" | cut -d: -f2 | tr '\n' ' ')" = "1 3 6 " \
  && awk '/^## 1\./ { on = 1; next } /^## / { on = 0 } on' "$LIB/agent/REVIEW.md" | grep -q 'eslint.config.\*.*`\.mts`' \
  && awk '/^## Existing apps$/ { on = 1; next } /^## / { on = 0 } on' "$LIB/agent/AGENTS.md" | grep -q "Tailwind 3 or 4.0: move to 4.1.17 or later" \
  && echo "gate: d.11 (DO-1, DO-5, CL-B1-1, D2-2; r3 fix D3-2, D3-4, S3-1): AGENTS.md, the README and REVIEW.md part 3 name a token set from code (style.setProperty) or by a class ([--token:...]), and part 3's command, run as printed in the app's folder, lists those added lines and skips var() and bg-(--token) uses; part 1 gives the hoisted @source an existing app writes and names the .ts and .mts lint configs init manages; the README and AGENTS.md tell an app whose eslint-disable comments name the core ids about them, and AGENTS.md's grep, run as printed, lists the old-id disable, its eslint-enable and a mixed line, and skips rewritten ones; Existing apps sets Tailwind 4.1.17 as the floor"
rm -rf "$WORK/diff.txt" "$WORK/upgrade"
(cd "$T" && ! $CLI find progress bar >/dev/null 2>&1 && grep -q "^| LinearProgress" "$LIB/agent/CATALOG.md" \
  && grep -q "^| CircularProgress.*tone" "$LIB/agent/CATALOG.md") && echo "gate: no find command; CATALOG.md lists LinearProgress and CircularProgress with tone"
# d.8 review: a kit component missing from AGENTS.md or from the lint's KIT_NAMES is one agents re-declare unnoticed.
node "$P/gate/kit-names.mjs" "$LIB/agent/catalog.json" "$LIB/agent/AGENTS.md" "$LIB/eslint/index.mjs" >/dev/null \
  && echo "gate: every kit component in the catalogue is named in agent/AGENTS.md and in the lint preset's KIT_NAMES"
# d.9 (guide): the starter as it ships (D18 import order, applyInitialTheme, Tailwind only), and the lint preset with no
# styled mode (each styled-components use, CSS-in-JS imports, Card round, visual inline style, <style>).
node "$P/gate/guide-starter.mjs" "$LIB/templates/poc" >/dev/null \
  && echo "gate: the starter imports style.css before index.css, calls applyInitialTheme before the first render, keeps index.css to the four directives and themes <html> and <body> with classes"
node "$P/gate/guide-preset.mjs" "$LIB/eslint/index.mjs" >/dev/null \
  && echo "gate: the lint preset ignores styled: true and flags each styled-components use, CSS-in-JS imports, Card round, inline style that sets colour, spacing or type, and <style>, under kleros-ui/no-restricted-syntax and kleros-ui/no-restricted-imports (d.11, B1)"
# d.9 review: the preset's fixes, its class patterns tested with a stand-in for the Tailwind plugin (no ESLint here).
RP=$(mktemp -d -p "$WORK")
node "$P/gate/review-preset.mjs" "$LIB/eslint/index.mjs" "$RP" >/dev/null \
  && echo "gate: d.9 review: the lint preset lints .js and .jsx with JSX on, flags Card round on the library's Card only, every padding, margin, gap and radius off the steps and dark: colour classes after other variants, and reads stroke-[1.5] and border-[1.5px] as widths, not colours"
rm -rf "$RP"
# d.9 (D13): this app has no Storybook, so new writes no stories file; stories with Storybook are gated in step 9.
# d.11 (B2): new takes --intent, and the entry holds its words (an entry without them is gated in step 10).
(cd "$T" && $CLI new VoteTallyBar --kind data --intent "vote tally, vote count bar" >/dev/null && test -f src/components/VoteTallyBar/VoteTallyBar.tsx \
  && test -f src/components/VoteTallyBar/index.ts && test ! -e src/components/VoteTallyBar/VoteTallyBar.stories.tsx \
  && ! $CLI new Button >/dev/null 2>&1 && grep -q '"name": "VoteTallyBar"' kleros-ui.json \
  && node -e 'const c = require(process.argv[1]).components.find((x) => x.name === "VoteTallyBar"); process.exit(JSON.stringify(c.intent) === JSON.stringify(["vote tally", "vote count bar"]) ? 0 : 1)' "$T/kleros-ui.json") \
  && echo "gate: new scaffolds files and a registry entry with its --intent words (no stories without Storybook), and refuses library names"
rm -rf "$T"

# 8. create (d.8, new-project pilot). --no-install, so no network; npm_config_package unset, so the default spec applies.
CREATE="env -u npm_config_package $CLI create"
# (a) A new folder that already holds a file (a pilot cell's .prompt.txt): the starter is written, the package is named
# after the folder, the library spec is ^VERSION (or --lib, as file: from the app), init runs; a second create refuses.
C=$(mktemp -d -p "$WORK")
(cd "$C" && mkdir "My App" && touch "My App/.prompt.txt" && $CREATE "My App" --no-install >/dev/null \
  && for f in package.json index.html vite.config.ts tsconfig.json eslint.config.js src/main.tsx src/index.css src/App.tsx .gitignore; do test -f "My App/$f" || exit 1; done \
  && grep -c "kleros-ui:start" "My App/AGENTS.md" | grep -qx 1 \
  && node -e 'const p = require(process.argv[1]); process.exit(p.name === "my-app" && p.dependencies["@kleros/ui-components-library"] === "^" + process.argv[2] && p.scripts["ui:check"] ? 0 : 1)' "$C/My App/package.json" "$VERSION" \
  && $CREATE lib-app --lib ./vendor/x.tgz --no-install >/dev/null && grep -q '"@kleros/ui-components-library": "file:../vendor/x.tgz"' lib-app/package.json \
  && $CREATE abs-app --lib "$C/vendor/x.tgz" --no-install >/dev/null && grep -qF "\"@kleros/ui-components-library\": \"file:$C/vendor/x.tgz\"" abs-app/package.json \
  && $CREATE url-app --lib https://example.com/x.tgz --no-install >/dev/null && grep -qF '"@kleros/ui-components-library": "https://example.com/x.tgz"' url-app/package.json \
  && $CREATE name-app --lib @kleros/ui-components-library@3.10.1 --no-install >/dev/null && grep -qF '"@kleros/ui-components-library": "3.10.1"' name-app/package.json \
  && ! $CREATE "My App" --no-install >refused.txt 2>&1 && grep -q "src/App.tsx" refused.txt \
  && mkdir src-file && touch src-file/src && ! $CREATE src-file --no-install >/dev/null 2>&1 && test "$(ls -A src-file)" = "src") \
  && echo "gate: create writes the starter into a non-empty folder, names it, sets ^$VERSION (or --lib: a relative path as file: from the app, an absolute path or a URL as given, name@version as the version), runs init, and refuses to overwrite, a file where a folder goes included"
rm -rf "$C"
# (b) After `npm install ./vendor/x.tgz` in an empty folder (all three pilot-4 agents did that): create . merges the
# starter into that package.json, keeps its library spec and its React, and adds the rest.
M=$(mktemp -d -p "$WORK")
mkdir "$M/cell"
(cd "$M/cell" && echo '{"dependencies":{"@kleros/ui-components-library":"file:vendor/x.tgz","react":"^18.2.0"}}' > package.json \
  && $CREATE . --no-install >/dev/null && test -f src/App.tsx && grep -c "kleros-ui:start" AGENTS.md | grep -qx 1 \
  && node -e 'const p = require(process.argv[1]); const d = p.dependencies, v = p.devDependencies; process.exit(p.name === "cell" && p.type === "module" && d["@kleros/ui-components-library"] === "file:vendor/x.tgz" && d.react === "^18.2.0" && d["react-dom"] && v.vite && v.eslint && p.scripts.build && p.scripts["ui:check"] ? 0 : 1)' "$M/cell/package.json") \
  && echo "gate: create . merges into an existing package.json, keeps its library spec and React, adds the rest and runs init"
rm -rf "$M"
# (c) The CSS scan in ui:check: a redefined token and colour literals in declaration values, never #ids in selectors or
# anything in comments (fixture lines 1-3); 0 on the starter's CSS. d.9: the fixture is also a CSS file outside the
# Tailwind entry, and the summary counts the new kinds; d.9 review: each of its 9 rules is a Tailwind-only finding, so
# the colour and token findings are checked on the other lines.
S=$(mktemp -d -p "$WORK")
mkdir "$S/src" && cp "$P/gate/cli-css-fixture.css" "$S/src/fixture.css"
(cd "$S" && ! $CLI css >out.txt \
  && grep -qx "css: 14 findings (1 token override, 4 colour literals, 9 Tailwind-only, 0 !important, 0 library internals) in 1 file scanned" out.txt \
  && grep -q "^src/fixture.css:5:3 --klerosUIComponentsPrimaryBlue redefines a library token" out.txt \
  && test "$(grep -v 'css-tailwind-only)$' out.txt | grep -o '^src/fixture.css:[0-9]*' | cut -d: -f2 | tr '\n' ' ')" = "5 5 6 12 15 " \
  && test "$(grep 'css-tailwind-only)$' out.txt | grep -o '^src/fixture.css:[0-9]*' | cut -d: -f2 | tr '\n' ' ')" = "2 3 4 9 11 12 13 14 15 " \
  && cd "$LIB/templates/poc" && $CLI css | grep -qx "css: 0 findings (0 token overrides, 0 colour literals, 0 Tailwind-only, 0 !important, 0 library internals) in 2 files scanned") \
  && echo "gate: the CSS scan flags a redefined token and 4 colour literals, not #ids in selectors or comments, and finds 0 in the starter's CSS"
rm -rf "$S"
# (d) The scan's edges (d.8 review): Tailwind's --color- alias of a token is an override too; a <style> block inside an
# HTML comment is not scanned; a broken link or a link back up the tree does not stop the scan; a path named on the
# command line that does not exist exits 2, not 0. d.9: alias.css is a CSS file outside the Tailwind entry and the live
# <style> block is a finding, so 3 findings, and still none from the commented-out block.
X=$(mktemp -d -p "$WORK")
mkdir "$X/src" && ln -s ../missing "$X/src/broken" && ln -s .. "$X/src/up"
printf ':root {\n  --color-klerosUIComponentsPrimaryBlue: var(--klerosUIComponentsTint);\n}\n' > "$X/src/alias.css"
printf '<!doctype html>\n<!-- <style> .old { color: #101010; } </style> -->\n<style> .ok { color: var(--klerosUIComponentsPrimaryText); } </style>\n' > "$X/index.html"
(cd "$X" && ! $CLI css >out.txt 2>&1 \
  && grep -qx "css: 3 findings (1 token override, 0 colour literals, 2 Tailwind-only, 0 !important, 0 library internals) in 2 files scanned" out.txt \
  && test "$(grep -c '^index.html:' out.txt)" = 1 && grep -q '^index.html:3:1 <style> block' out.txt \
  && grep -q "^src/alias.css:2:3 --color-klerosUIComponentsPrimaryBlue redefines a library token" out.txt \
  && { $CLI css nope.css >/dev/null 2>&1; test $? -eq 2; }) \
  && echo "gate: the CSS scan flags the --color- alias of a token, skips a commented-out <style> block and broken or looping links, and exits 2 on a missing path"
rm -rf "$X"

# 9. d.9 CLI gates (decision.md §16 and §16a): CLI-4, CLI-5, Tailwind only (D25), !important and library internals (D22),
# the baseline, the one block for an app without Tailwind, and D13. One line each, from gate/cli-gates.sh.
G9=$(mktemp -d -p "$WORK")
bash "$P/gate/cli-gates.sh" "$LIB" "$G9" "$P"
rm -rf "$G9"

# 10. d.11 gates (decision.md §20 AC1): the theme file (T1-T5), the lint ids and the baseline (B1), new --intent (B2),
# typesVersions and new's React import (B4), the library as the app sees it (B7) and style.css first (B8). One line
# each, from gate/d11-gates.sh. Its fixtures sit in the work folder, so B4's tsc finds the work folder's
# node_modules/@types.
# d.11 r3 (R3-1): B7's fixtures (and the d.9 monorepo gate in step 9) link the real Tailwind from tools/, which holds
# tailwindcss, @tailwindcss/node and @tailwindcss/oxide at pinned versions (tools/package.json and its lockfile; run.sh
# installs them above). It is not the work folder's node_modules, which sits above every fixture, so a fixture without
# links finds no Tailwind, as the no-Tailwind gate needs.
G10=$(mktemp -d -p "$WORK")
bash "$P/gate/d11-gates.sh" "$LIB" "$G10" "$P" "$TSC"
rm -rf "$G10"
}

gates | tee "$WORK/gates.log"
N=$(grep -c '^gate:' "$WORK/gates.log")
SMOKE=FAILED; grep -q '^ok   ChainGuard gates on chain' "$WORK/gates.log" && SMOKE=ok
echo "test:layer: $N of $EXPECTED gate lines, kit smoke render $SMOKE, on $VERSION"
[ "$N" = "$EXPECTED" ] && [ "$SMOKE" = ok ]
