#!/bin/bash
# d.9 CLI gates (run.sh step 9). Each prints one "gate:" line when it holds and nothing
# when it does not. No network and no real install: tsc and eslint are stubbed in each fixture that runs check or
# baseline (npx --no runs the fixture's own node_modules/.bin), so those gates test the CSS and setup steps.
# usage: cli-gates.sh <the packed library, extracted> <work folder for fixtures> <scripts/layer/test, which holds gate/ and tools/>
set -uo pipefail
LIB=$1; WORK=$2; P=$3
CLI="node $LIB/bin/kleros-ui.mjs"
CREATE="env -u npm_config_package $CLI create"
TOOLS='{"name":"%s","type":"module","devDependencies":{"tailwindcss":"^4.1.0"}}'
# d.9 review: the library is linked in too, as an install has it, since check now resolves the entry's @source.
stubs() {
  mkdir -p "$1/node_modules/.bin" "$1/node_modules/@kleros"
  printf '#!/bin/sh\ncase " $* " in *" -f json "*) echo "[]";; esac\nexit 0\n' > "$1/node_modules/.bin/eslint"
  printf '#!/bin/sh\nexit 0\n' > "$1/node_modules/.bin/tsc"
  chmod +x "$1/node_modules/.bin/eslint" "$1/node_modules/.bin/tsc"
  ln -s "$LIB" "$1/node_modules/@kleros/ui-components-library"
}
# Every file's path and md5 under a folder, and every folder's path: equal before and after means nothing was written.
snapshot() { (cd "$1" && find . -type f -print0 | sort -z | xargs -0 -r md5sum && find . | sort); }

# CLI-4 (D15): create . and create <dir> into a package.json whose react or react-dom leaves out 18 exit 1 before
# writing anything, naming the conflict and React 18; a range that includes 18 is not refused.
R=$(mktemp -d -p "$WORK")
mkdir -p "$R/cell/vendor" "$R/new19" "$R/ok"
echo '{"dependencies":{"@kleros/ui-components-library":"file:vendor/x.tgz","react":"^19.0.0","react-dom":"^19.0.0"}}' > "$R/cell/package.json"
touch "$R/cell/vendor/x.tgz" "$R/cell/.prompt.txt"
echo '{"name":"n","devDependencies":{"react-dom":"19.1.0"}}' > "$R/new19/package.json"
echo '{"dependencies":{"react":"^18.2.0 || ^19.0.0"}}' > "$R/ok/package.json"
B1=$(snapshot "$R/cell"); B2=$(snapshot "$R/new19")
(cd "$R/cell" && { $CREATE . --no-install >"$R/o1.txt" 2>&1; [[ $? -eq 1 ]]; }) \
  && (cd "$R" && { $CREATE new19 --no-install >"$R/o2.txt" 2>&1; [[ $? -eq 1 ]]; }) \
  && [[ "$(snapshot "$R/cell")" == "$B1" ]] && [[ "$(snapshot "$R/new19")" == "$B2" ]] \
  && grep -q "package.json asks for react ^19.0.0 and react-dom ^19.0.0, which leaves out React 18" "$R/o1.txt" \
  && grep -q "new19/package.json asks for react-dom 19.1.0" "$R/o2.txt" && grep -q "react-dom to ^18.3.1" "$R/o2.txt" \
  && (cd "$R/ok" && $CREATE . --no-install >/dev/null && [[ -f src/App.tsx ]]) \
  && echo "gate: CLI-4: create . and create <dir> refuse a React 19 package.json (exit 1, naming React 18) and write nothing; a range with 18 in it is not refused"
rm -rf "$R"

# CLI-5 (D16): the lint config loads, by ESLint 9's own file order and import(), in (a) create . into a
# "type": "commonjs" package; (b) init over a CommonJS eslint.config.js in a package with no type; (c) init over a
# d.8 create's output in a commonjs package (an ESM eslint.config.js, with styled: true), which did not load before.
L=$(mktemp -d -p "$WORK")
mkdir -p "$L/cjs" "$L/typeless" "$L/d8"
for d in cjs typeless d8; do
  mkdir -p "$L/$d/node_modules/@kleros" "$L/$d/node_modules/typescript-eslint"
  ln -s "$LIB" "$L/$d/node_modules/@kleros/ui-components-library"
  # A stand-in for typescript-eslint, which the starter's config imports for its parser.
  echo '{"name":"typescript-eslint","type":"module","exports":"./index.js"}' > "$L/$d/node_modules/typescript-eslint/package.json"
  echo 'export default { parser: {} };' > "$L/$d/node_modules/typescript-eslint/index.js"
done
echo '{"name":"cjs","type":"commonjs","dependencies":{"@kleros/ui-components-library":"file:vendor/x.tgz","react":"^18.3.1"}}' > "$L/cjs/package.json"
echo '{"name":"typeless","scripts":{}}' > "$L/typeless/package.json"
echo 'module.exports = [{ files: ["src/**/*.ts"] }];' > "$L/typeless/eslint.config.js"
echo '{"name":"d8","type":"commonjs","scripts":{}}' > "$L/d8/package.json"
printf '%s\nimport app from "./eslint.config.app.js";\nimport klerosUI from "@kleros/ui-components-library/eslint";\n\nexport default [...app, ...klerosUI({ cssEntry: "src/index.css", styled: true })];\n' \
  "// Managed by kleros-ui init: the app's previous config plus the Kleros UI preset." > "$L/d8/eslint.config.js"
echo 'export default [];' > "$L/d8/eslint.config.app.js"
(cd "$L/cjs" && $CREATE . --no-install >/dev/null && [[ ! -e eslint.config.js ]] && [[ ! -e eslint.config.app.js ]] \
  && grep -q '^import app from "./eslint.config.app.mjs";' eslint.config.mjs && grep -q '^import tseslint' eslint.config.app.mjs \
  && [[ "$(node "$P/gate/cli-lint-load.mjs" .)" == "eslint.config.mjs" ]]) \
  && (cd "$L/typeless" && $CLI init >/dev/null && [[ ! -e eslint.config.js ]] && grep -q module.exports eslint.config.app.cjs \
  && [[ "$(node "$P/gate/cli-lint-load.mjs" .)" == "eslint.config.mjs" ]]) \
  && (cd "$L/d8" && ! node "$P/gate/cli-lint-load.mjs" . >/dev/null 2>&1 && $CLI init >/dev/null && [[ ! -e eslint.config.js ]] \
  && [[ ! -e eslint.config.app.js ]] && [[ -f eslint.config.app.mjs ]] && ! grep -q styled eslint.config.mjs \
  && [[ "$(node "$P/gate/cli-lint-load.mjs" .)" == "eslint.config.mjs" ]]) \
  && echo "gate: CLI-5: the lint config loads in a commonjs package after create . (eslint.config.mjs), after init over a CommonJS eslint.config.js with no type, and after init over d.8's broken ESM .js (styled: true dropped)"
rm -rf "$L"

# D25 (a), (b), (c): a style rule, a rule inside @layer or @media and an @utility in the entry, one finding each, named;
# another .css file; a <style> block in index.html (not a commented-out one). 0 on the starter.
T=$(mktemp -d -p "$WORK")
mkdir -p "$T/src"
cp "$P/gate/cli-tw-fixture.css" "$T/src/index.css"
printf '.extra { margin: 0; }\n' > "$T/src/extra.css"
printf '<!doctype html>\n<!-- <style> .old { margin: 0; } </style> -->\n<style> body { margin: 0; } </style>\n' > "$T/index.html"
(cd "$T" && { $CLI css >out.txt 2>&1; [[ $? -eq 1 ]]; } \
  && grep -qx "css: 7 findings (0 token overrides, 0 colour literals, 7 Tailwind-only, 0 !important, 0 library internals) in 3 files scanned" out.txt \
  && grep -q '^src/index.css:7:1 Style rule "body" in the Tailwind entry, which keeps only @import' out.txt \
  && grep -q '^src/index.css:9:3 Style rule ".card" (in @layer components) in the Tailwind entry' out.txt \
  && grep -q '^src/index.css:12:1 @utility tab-4 in the Tailwind entry' out.txt \
  && grep -q '^src/index.css:13:29 Style rule ".wide" (in @media (min-width: 640px))' out.txt \
  && grep -q '^src/extra.css:1:1 Style rule ".extra" in a .css file outside the Tailwind entry' out.txt \
  && grep -q '^index.html:3:1 <style> block in index.html' out.txt && grep -q 'classes on <html> and <body>, as the starter does' out.txt \
  && [[ "$(grep -c '^index.html' out.txt)" == "1" ]] \
  && cd "$LIB/templates/poc" && $CLI css | grep -qx "css: 0 findings (0 token overrides, 0 colour literals, 0 Tailwind-only, 0 !important, 0 library internals) in 2 files scanned") \
  && echo "gate: Tailwind only (D25): the scan names each style rule, @layer and @media rule and @utility in the entry, another .css file and a <style> block in index.html, and finds 0 in the starter"
rm -rf "$T"

# D22: pilot 5 Argon's index.css: 2 rules in the entry, 7 !important, 2 selectors on [data-rac]. A library class inside
# :not() keeps a rule off the library, so it is not an internals finding.
# d.9 review: the scan reads the whole app folder now, so the :not() fixture is a sibling app, not a folder inside it.
I=$(mktemp -d -p "$WORK")
mkdir -p "$I/argon/src" "$I/not/src"
cp "$P/gate/cli-argon-index.css" "$I/argon/src/index.css"
printf 'h1:not([class*="klerosUIComponents"]) { margin: 0; }\n' > "$I/not/src/base.css"
(cd "$I/argon" && { $CLI css >out.txt 2>&1; [[ $? -eq 1 ]]; } \
  && grep -qx "css: 11 findings (0 token overrides, 0 colour literals, 2 Tailwind-only, 7 !important, 2 library internals) in 1 file scanned" out.txt \
  && grep -q '^src/index.css:7:1 Selector "label\[data-rac\] > span:has(> input\[type="checkbox"\]), .*reaches into the library (\[data-rac\])' out.txt \
  && grep -q '^src/index.css:9:12 !important in inset' out.txt \
  && cd ../not && { $CLI css >not.txt 2>&1; [[ $? -eq 1 ]]; } \
  && grep -qx "css: 1 finding (0 token overrides, 0 colour literals, 1 Tailwind-only, 0 !important, 0 library internals) in 1 file scanned" not.txt) \
  && echo "gate: !important and library internals (D22): Argon's pilot 5 index.css gives 2 Tailwind-only, 7 !important and 2 [data-rac] findings; a library class inside :not() is not one"
rm -rf "$I"

# Baseline: the new findings are counted per file and rule like the rest of the CSS scan. With no baseline they fail;
# ui:baseline records them and check passes; one more rule in the entry, one more rule in an old CSS file (d.9 review:
# a file outside the entry counts each rule), or one more CSS file, fails again.
B=$(mktemp -d -p "$WORK")
stubs "$B"
(cd "$B" && printf "$TOOLS\n" b > package.json && $CLI init >/dev/null && mkdir src \
  && { head -5 "$P/gate/cli-tw-fixture.css" | tail -4; echo 'body { margin: 0; }'; } > src/index.css && printf '.old { margin: 0; }\n' > src/old.css \
  && ! $CLI check >o1.txt 2>&1 && grep -q "css: 1 new (baseline 0)" o1.txt \
  && $CLI baseline >/dev/null && $CLI check >o2.txt 2>&1 && grep -qx "ui:check passed" o2.txt \
  && echo '.new { margin: 0; }' >> src/index.css && ! $CLI check >o3.txt 2>&1 && grep -q "css: 1 new (baseline 1):" o3.txt \
  && grep -q 'src/index.css:6:1 Style rule ".new"' o3.txt && grep -q "css failed" o3.txt \
  && sed -i '$d' src/index.css && $CLI check >/dev/null 2>&1 \
  && echo '.newer { margin: 0; }' >> src/old.css && ! $CLI check >o5.txt 2>&1 && grep -q "css: 1 new (baseline 1):" o5.txt \
  && grep -q 'src/old.css:2:1 Style rule ".newer" in a .css file outside the Tailwind entry' o5.txt && sed -i '$d' src/old.css && $CLI check >/dev/null 2>&1 \
  && printf '.more { margin: 0; }\n' > src/more.css && ! $CLI check >o4.txt 2>&1 && grep -q 'src/more.css:1:1 Style rule ".more" in a .css file outside the Tailwind entry' o4.txt) \
  && echo "gate: ui:baseline records the Tailwind-only findings per file, check then passes, and one new rule in the entry, one new rule in an old CSS file or one new CSS file fails it"
rm -rf "$B"

# Tailwind only for all: an app with styled-components and no Tailwind gets the one block with step 0 pointing
# to "Existing apps"; sync rewrites an old styled-components block; init drops styled: true from a managed config;
# check names the missing Tailwind; once tailwindcss is declared, check asks for sync, and after ui:baseline (the last
# step of "Existing apps", which rewrites the stale block) it passes.
N=$(mktemp -d -p "$WORK")
stubs "$N"
(cd "$N" && echo '{"name":"court-like","type":"module","scripts":{},"dependencies":{"react":"^18.3.1","styled-components":"^5.3.3"}}' > package.json \
  && printf '# Agent guide\n\n<!-- kleros-ui:start 3.10.1-d.6 -->\n## UI: @kleros/ui-components-library 3.10.1-d.6 (react-aria; its compiled style.css and theme.css). This app styles its own code with styled-components and has no Tailwind.\n<!-- kleros-ui:end -->\n' > AGENTS.md \
  && printf '%s\nimport app from "./eslint.config.app.mjs";\nimport klerosUI from "@kleros/ui-components-library/eslint";\n\nexport default [...app, ...klerosUI({ cssEntry: "src/index.css", styled: true })];\n' \
    "// Managed by kleros-ui init: the app's previous config plus the Kleros UI preset." > eslint.config.mjs && echo 'export default [];' > eslint.config.app.mjs \
  && $CLI sync >/dev/null && ! grep -q "styles its own code with styled-components" AGENTS.md && grep -q "^0. This app has no Tailwind yet" AGENTS.md \
  && $CLI init >init.txt && grep -c "kleros-ui:start" AGENTS.md | grep -qx 1 && grep -q '"Existing apps"' AGENTS.md \
  && grep -q "^3. Tailwind only" AGENTS.md && ! grep -q styled eslint.config.mjs && grep -q 'eslint.config.app.mjs' eslint.config.mjs \
  && grep -q "this app has no Tailwind" init.txt && ! grep -q '"tailwindcss"' package.json \
  && ! $CLI check >o1.txt 2>&1 && grep -q '^setup: no Tailwind: tailwindcss is not in package.json. Add it with the steps in .*"Existing apps"' o1.txt \
  && node -e 'const f = process.argv[1], fs = require("fs"); const p = JSON.parse(fs.readFileSync(f)); p.devDependencies = { tailwindcss: "^4.1.0" }; fs.writeFileSync(f, JSON.stringify(p))' "$N/package.json" \
  && ! $CLI check >o2.txt 2>&1 && grep -q "AGENTS.md block still says this app has no Tailwind: run npx kleros-ui sync" o2.txt && ! grep -q "no Tailwind: tailwindcss" o2.txt \
  && $CLI baseline >b.txt && grep -q "rewrote the AGENTS.md block" b.txt && ! grep -q "^0. " AGENTS.md && $CLI check | grep -qx "ui:check passed") \
  && echo "gate: an app with no Tailwind gets the one block with step 0 naming \"Existing apps\", sync rewrites an old styled block, init drops styled: true, check names the missing Tailwind, and passes once Tailwind is declared and ui:baseline has refreshed the block"
rm -rf "$N"

# D13: new writes <Name>.stories.tsx only when the app has Storybook (a storybook or @storybook/* package, or a
# .storybook folder), and check asks for it only then; index.ts and the registry entry for every app.
# d.11 (B2, X1-C1): the components are made with --intent, the entry holds the words, and
# check passes with no intent note (an entry without words is a note, gated in d11-gates.sh).
S=$(mktemp -d -p "$WORK")
stubs "$S"
(cd "$S" && printf "$TOOLS\n" s > package.json && $CLI init >/dev/null && $CLI new NoStory --kind ui --intent "plain card" >/dev/null \
  && [[ -f src/components/NoStory/NoStory.tsx ]] && [[ -f src/components/NoStory/index.ts ]] && [[ ! -e src/components/NoStory/NoStory.stories.tsx ]] \
  && node -e 'const c = require(process.argv[1]).components.find((x) => x.name === "NoStory"); process.exit(c && !("stories" in c) && JSON.stringify(c.intent) === "[\"plain card\"]" ? 0 : 1)' "$S/kleros-ui.json" \
  && $CLI check >c0.txt && grep -qx "ui:check passed" c0.txt && ! grep -q "intent" c0.txt \
  && mv src/components/NoStory/index.ts index.ts.kept && ! $CLI check >o0.txt 2>&1 && grep -q "src/components/NoStory: no index.ts" o0.txt \
  && mv index.ts.kept src/components/NoStory/index.ts \
  && mkdir .storybook && ! $CLI check >o1.txt 2>&1 && grep -q "src/components/NoStory: no NoStory.stories.tsx" o1.txt && rmdir .storybook \
  && node -e 'const f = process.argv[1], fs = require("fs"); const p = JSON.parse(fs.readFileSync(f)); p.devDependencies["@storybook/react-vite"] = "^8.6.0"; fs.writeFileSync(f, JSON.stringify(p))' "$S/package.json" \
  && $CLI new WithStory --kind form --intent "story form" >/dev/null && [[ -f src/components/WithStory/WithStory.stories.tsx ]] \
  && grep -q '"stories": "src/components/WithStory/WithStory.stories.tsx"' kleros-ui.json \
  && ! $CLI check >o2.txt 2>&1 && grep -q "src/components/NoStory: no NoStory.stories.tsx" o2.txt && ! grep -q "WithStory: no" o2.txt && ! grep -q "intent" o2.txt) \
  && echo "gate: D13: new writes stories only when the app has Storybook (package or .storybook folder) and check asks for them only then; index.ts and the registry entry, with its --intent words, for every app"
rm -rf "$S"

# d.9 review (cli F1, F2): the scan reads every stylesheet Vite compiles anywhere in the app (a .pcss file in src/, a
# .css file in styles/ next to src/ and in public/), a <link rel="stylesheet"> to a local file and a style attribute in
# index.html, and an @import other than tailwindcss and theme.css and an @plugin or @config of a local file in the
# entry; not dist/, a folder the app's .gitignore names, a stylesheet from another site or a package's @plugin. A file
# outside the entry counts each rule, so after ui:baseline one new rule in an old file fails.
V=$(mktemp -d -p "$WORK")
stubs "$V"
(cd "$V" && printf "$TOOLS\n" v > package.json && $CLI init >/dev/null && mkdir -p src styles public dist build \
  && cp "$LIB/templates/poc/index.html" index.html && cp "$LIB/templates/poc/src/index.css" src/index.css \
  && $CLI css | grep -qx "css: 0 findings (0 token overrides, 0 colour literals, 0 Tailwind-only, 0 !important, 0 library internals) in 2 files scanned" \
  && printf 'body { margin: 0; }\n' > src/theme.pcss && printf '.a { margin: 0; }\n' > styles/global.css && printf '.b { margin: 0; }\n' > public/extra.css \
  && printf '.c { margin: 0; }\n' > dist/x.css && printf '.d { margin: 0; }\n' > build/x.css && echo build > .gitignore \
  && sed -i 's#</head>#<link rel="stylesheet" href="/extra.css" /><link rel="stylesheet" href="https://fonts.example/x.css" /></head>#; s#<body #<body style="margin: 0" #' index.html \
  && printf '@plugin "./p.js";\n@config "./c.js";\n@import "../styles/global.css";\n@plugin "@tailwindcss/typography";\n' >> src/index.css \
  && { $CLI css >o1.txt; [[ $? -eq 1 ]]; } \
  && grep -qx "css: 8 findings (0 token overrides, 0 colour literals, 8 Tailwind-only, 0 !important, 0 library internals) in 5 files scanned" o1.txt \
  && grep -q '^src/theme.pcss:1:1 Style rule "body" in a .pcss file outside the Tailwind entry' o1.txt \
  && grep -q '^styles/global.css:1:1 Style rule ".a"' o1.txt && grep -q '^public/extra.css:1:1 Style rule ".b"' o1.txt \
  && grep -q '^index.html:[0-9]*:[0-9]* <link rel="stylesheet" href="/extra.css"> in index.html' o1.txt && grep -q '^index.html:[0-9]*:[0-9]* style attribute on <body>' o1.txt \
  && grep -q '^src/index.css:5:1 @plugin "./p.js" in the Tailwind entry' o1.txt && grep -q '^src/index.css:6:1 @config "./c.js" in the Tailwind entry' o1.txt \
  && grep -q '^src/index.css:7:1 @import "../styles/global.css" in the Tailwind entry' o1.txt \
  && ! grep -q '@plugin "@tailwindcss/typography"\|fonts.example\|^dist/\|^build/' o1.txt \
  && $CLI baseline >/dev/null && $CLI check | grep -qx "ui:check passed" \
  && printf '.e { padding: 0; }\n' >> styles/global.css && ! $CLI check >o2.txt 2>&1 && grep -q "css: 1 new (baseline 1):" o2.txt \
  && grep -q 'styles/global.css:2:1 Style rule ".e"' o2.txt) \
  && echo "gate: d.9 review: the CSS scan reads every stylesheet Vite compiles anywhere in the app (.pcss, styles/, public/; not dist/ or a folder .gitignore names), a local stylesheet link and a style attribute in index.html, and a local @import, @plugin or @config in the entry; a file outside the entry counts each rule, so a new rule in a baselined file fails"
rm -rf "$V"

# d.9 review (cli F3, F4, F5; guide F1): create . refuses a folder that already has an eslint.config.* of any name and
# writes nothing; init keeps an edited managed lint config, and says so when it rewrites a stale one (styled: true);
# react "latest" is not refused (npm installs a dist-tag as it installs "*"); check names an @source that points at no
# folder and gives the hoisted path, and passes with it (a monorepo whose root node_modules holds the library).
# d.11 r3 (R3-1): check asks the app's own Tailwind whether it scans the kit, so the monorepo's root node_modules links
# the real tailwindcss, @tailwindcss/node and @tailwindcss/oxide from tools/, as a hoisting install has them.
Q=$(mktemp -d -p "$WORK")
mkdir -p "$Q/lintjs" "$Q/lintcjs" "$Q/latest" "$Q/managed" "$Q/mono/node_modules/@kleros"
echo '{"name":"lintjs","type":"commonjs"}' > "$Q/lintjs/package.json" && echo 'module.exports = [];' > "$Q/lintjs/eslint.config.js"
echo '{"name":"lintcjs","type":"commonjs"}' > "$Q/lintcjs/package.json" && echo 'module.exports = [];' > "$Q/lintcjs/eslint.config.cjs"
echo '{"dependencies":{"react":"latest","react-dom":"latest"}}' > "$Q/latest/package.json"
ln -s "$LIB" "$Q/mono/node_modules/@kleros/ui-components-library"
mkdir -p "$Q/mono/node_modules/@tailwindcss" && for t in tailwindcss @tailwindcss/node @tailwindcss/oxide; do ln -s "$P/tools/node_modules/$t" "$Q/mono/node_modules/$t"; done
stubs "$Q/mono/web" && rm -rf "$Q/mono/web/node_modules/@kleros"
C1=$(snapshot "$Q/lintjs"); C2=$(snapshot "$Q/lintcjs")
(cd "$Q/lintjs" && { $CREATE . --no-install >"$Q/o1.txt" 2>&1; [[ $? -eq 1 ]]; }) && [[ "$(snapshot "$Q/lintjs")" == "$C1" ]] \
  && grep -q "already has eslint.config.js; create writes the starter's own lint config (eslint.config.mjs) and ESLint reads only one, so eslint.config.js would be dropped" "$Q/o1.txt" \
  && (cd "$Q/lintcjs" && { $CREATE . --no-install >/dev/null 2>&1; [[ $? -eq 1 ]]; }) && [[ "$(snapshot "$Q/lintcjs")" == "$C2" ]] \
  && (cd "$Q/latest" && $CREATE . --no-install >/dev/null && [[ -f src/App.tsx ]]) \
  && (cd "$Q/managed" && printf "$TOOLS\n" m > package.json && $CLI init >/dev/null \
    && sed -i 's#^export default \[#export default [{ ignores: ["src/generated/**"] }, #' eslint.config.js && cp eslint.config.js edited.js \
    && $CLI init >i2.txt && cmp -s eslint.config.js edited.js && ! grep -q "rewrote" i2.txt \
    && sed -i 's#klerosUI({ cssEntry: "src/index.css" })#klerosUI({ cssEntry: "src/index.css", styled: true })#' eslint.config.js \
    && $CLI init >i3.txt && grep -q "rewrote the managed eslint.config.js: dropped styled: true" i3.txt \
    && ! grep -q styled eslint.config.js && grep -q 'src/generated' eslint.config.js) \
  && (cd "$Q/mono/web" && printf "$TOOLS\n" web > package.json && $CLI init >/dev/null && mkdir src \
    && cp "$LIB/templates/poc/src/index.css" src/index.css && ! $CLI check >c1.txt 2>&1 \
    && grep -q '^setup: src/index.css: @source "../node_modules/@kleros/ui-components-library" points at no folder from src/' c1.txt \
    && grep -q 'no @source reaches the library.*Add @source "../../node_modules/@kleros/ui-components-library";' c1.txt \
    && sed -i 's#"\.\./node_modules#"../../node_modules#' src/index.css && $CLI check | grep -qx "ui:check passed") \
  && echo "gate: d.9 review: create refuses a folder with an eslint.config.* of any name and writes nothing; init keeps an edited managed lint config and says when it rewrites a stale one; react \"latest\" is not refused; check names an @source that points at no folder, gives the hoisted path, and passes with it"
rm -rf "$Q"
