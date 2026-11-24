#!/bin/bash
# d.9 CLI gates (run.sh step 9). Each prints one "gate:" line when it holds and nothing
# when it does not. No network and no real install: tsc and eslint are stubbed in each fixture that runs check or
# baseline (npx --no runs the fixture's own node_modules/.bin), so those gates test the CSS and setup steps, and the
# gate on create's install puts a stub npm first in PATH.
# usage: cli-gates.sh <the packed library, extracted> <work folder for fixtures> <scripts/layer/test, which holds gate/ and tools/>
set -uo pipefail
LIB=$1; WORK=$2; P=$3
CLI="node $LIB/bin/kleros-ui.mjs"
CREATE="env -u npm_config_package $CLI create"
TOOLS='{"name":"%s","type":"module","devDependencies":{"tailwindcss":"^4.1.0"}}'
# d.9 review: the library is linked in too, as an install has it, since check now resolves the entry's @source.
stubs() {
  bins "$1"
  mkdir -p "$1/node_modules/@kleros"
  ln -s "$LIB" "$1/node_modules/@kleros/ui-components-library"
}
# The stub tsc and eslint alone, for a fixture with its own copy of the library or none: check then starts no npx lookup.
bins() {
  mkdir -p "$1/node_modules/.bin"
  printf '#!/bin/sh\ncase " $* " in *" -f json "*) echo "[]";; esac\nexit 0\n' > "$1/node_modules/.bin/eslint"
  printf '#!/bin/sh\nexit 0\n' > "$1/node_modules/.bin/tsc"
  chmod +x "$1/node_modules/.bin/eslint" "$1/node_modules/.bin/tsc"
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
# "type": "commonjs" package, which also gets the starter's Vite config as vite.config.mts (R2-F22: Vite loads a .ts
# config there as CommonJS, which cannot require @tailwindcss/vite on a Node without require(esm)); (b) init over a
# CommonJS eslint.config.js in a package with no type, which init leaves as it is (review F2:
# kleros-ui.eslint.config.mjs, which ui:check lints with, imports it); (c) init over a d.8
# create's output in a commonjs package (an ESM eslint.config.js, with styled: true), which did not load before.
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
(cd "$L/cjs" && $CREATE . --no-install >c.txt && [[ ! -e eslint.config.js ]] && [[ ! -e eslint.config.app.js ]] \
  && [[ -f vite.config.mts ]] && [[ ! -e vite.config.ts ]] && grep -q 'and its Vite config as vite.config.mts' c.txt \
  && grep -q '^import app from "./eslint.config.app.mjs";' eslint.config.mjs && grep -q '^import tseslint' eslint.config.app.mjs \
  && [[ "$(node "$P/gate/cli-lint-load.mjs" .)" == "eslint.config.mjs" ]]) \
  && (cd "$L/typeless" && $CLI init >/dev/null && grep -qxF 'module.exports = [{ files: ["src/**/*.ts"] }];' eslint.config.js \
  && [[ ! -e eslint.config.app.cjs ]] && [[ ! -e eslint.config.mjs ]] && grep -q '^import app from "./eslint.config.js";' kleros-ui.eslint.config.mjs \
  && [[ "$(node "$P/gate/cli-lint-load.mjs" .)" == "kleros-ui.eslint.config.mjs" ]]) \
  && (cd "$L/d8" && ! node "$P/gate/cli-lint-load.mjs" . >/dev/null 2>lf.txt && grep -q '^cli-lint-load: eslint.config.js does not load' lf.txt \
  && $CLI init >/dev/null && [[ ! -e eslint.config.js ]] \
  && [[ ! -e eslint.config.app.js ]] && [[ -f eslint.config.app.mjs ]] && ! grep -q styled eslint.config.mjs \
  && [[ "$(node "$P/gate/cli-lint-load.mjs" .)" == "eslint.config.mjs" ]]) \
  && echo "gate: CLI-5: the lint config loads in a commonjs package after create . (eslint.config.mjs, and vite.config.mts), after init over a CommonJS eslint.config.js with no type (kept as it is; kleros-ui.eslint.config.mjs imports it), and after init over d.8's broken ESM .js (styled: true dropped)"
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
  && ! $CLI check >o2.txt 2>&1 && grep -q "AGENTS.md block still says this app has no Tailwind: run npx -p @kleros/ui-components-library kleros-ui sync" o2.txt && ! grep -q "does it too" o2.txt && ! grep -q "no Tailwind: tailwindcss" o2.txt \
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
# writes nothing; init keeps an edited kleros-ui.eslint.config.mjs (the config ui:check lints with in an existing app,
# review F2), and says so when it rewrites a stale managed eslint.config.* (styled: true);
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
  && (cd "$Q/lintcjs" && { $CREATE . --no-install >"$Q/o2.txt" 2>&1; [[ $? -eq 1 ]]; }) && [[ "$(snapshot "$Q/lintcjs")" == "$C2" ]] \
  && grep -q "already has eslint.config.cjs; create writes the starter's own lint config (eslint.config.mjs)" "$Q/o2.txt" \
  && (cd "$Q/latest" && $CREATE . --no-install >/dev/null && [[ -f src/App.tsx ]]) \
  && (cd "$Q/managed" && printf "$TOOLS\n" m > package.json && $CLI init >/dev/null && [[ ! -e eslint.config.js ]] \
    && sed -i 's#^export default \[#export default [{ ignores: ["src/generated/**"] }, #' kleros-ui.eslint.config.mjs && cp kleros-ui.eslint.config.mjs edited.mjs \
    && $CLI init >i2.txt && cmp -s kleros-ui.eslint.config.mjs edited.mjs && ! grep -q "rewrote" i2.txt && ! grep -q "^kleros-ui: wrote kleros-ui.eslint" i2.txt \
    && rm kleros-ui.eslint.config.mjs && printf '%s\nconst app = [];\nimport klerosUI from "@kleros/ui-components-library/eslint";\n\nexport default [{ ignores: ["src/generated/**"] }, ...app, ...klerosUI({ cssEntry: "src/index.css", styled: true })];\n' \
      "// Managed by kleros-ui init: the app's previous config plus the Kleros UI preset." > eslint.config.js \
    && $CLI init >i3.txt && grep -q "rewrote the managed eslint.config.js: dropped styled: true" i3.txt \
    && ! grep -q styled eslint.config.js && grep -q 'src/generated' eslint.config.js && [[ ! -e kleros-ui.eslint.config.mjs ]]) \
  && (cd "$Q/mono/web" && printf "$TOOLS\n" web > package.json && $CLI init >/dev/null && mkdir src \
    && cp "$LIB/templates/poc/src/index.css" src/index.css && ! $CLI check >c1.txt 2>&1 \
    && grep -q '^setup: src/index.css: @source "../node_modules/@kleros/ui-components-library" points at no folder from src/' c1.txt \
    && grep -q 'no @source reaches the library.*Add @source "../../node_modules/@kleros/ui-components-library";' c1.txt \
    && sed -i 's#"\.\./node_modules#"../../node_modules#' src/index.css && $CLI check | grep -qx "ui:check passed") \
  && echo "gate: d.9 review: create refuses a folder with an eslint.config.* of any name and writes nothing; init keeps an edited kleros-ui.eslint.config.mjs and says when it rewrites a stale managed lint config; react \"latest\" is not refused; check names an @source that points at no folder, gives the hoisted path, and passes with it"
rm -rf "$Q"

# PR #127 review (F6, F23, F69, F80, F12, F71): init refuses, and writes nothing, at a workspace root, when AGENTS.md
# is a link to a file outside the app, or when AGENTS.md has a start marker with no end marker; a CLAUDE.md that is a
# link to AGENTS.md gets no @AGENTS.md line in AGENTS.md; create . refuses a folder with a vite.config.js; the CSS scan
# skips a folder the repo root's .gitignore names (the folder holding .git), as git does; a cssDirs that is not a list of folders
# fails check.
W=$(mktemp -d -p "$WORK")
mkdir -p "$W/mono/web" "$W/link" "$W/marker" "$W/claude" "$W/vite" "$W/repo/.git" "$W/repo/web/report" "$W/repo/web/src"
echo '{"name":"mono","workspaces":["web"]}' > "$W/mono/package.json" && echo 'export default [];' > "$W/mono/eslint.config.mjs"
echo '{"name":"web","type":"module","scripts":{}}' > "$W/mono/web/package.json"
for d in link marker claude; do echo '{"name":"x","type":"module","scripts":{}}' > "$W/$d/package.json"; done
echo '# outside' > "$W/outside.md" && ln -s ../outside.md "$W/link/AGENTS.md"
printf '# Guide\n\n<!-- kleros-ui:start 3.10.0 -->\nold block\n\nThe team notes below.\n' > "$W/marker/AGENTS.md"
echo '{}' > "$W/vite/package.json" && echo 'export default {};' > "$W/vite/vite.config.js"
stubs "$W/repo/web" && printf "$TOOLS\n" web > "$W/repo/web/package.json" && echo report > "$W/repo/.gitignore"
printf '.a { color: #fff; }\n' > "$W/repo/web/report/base.css"
S1=$(snapshot "$W/mono"); S2=$(snapshot "$W/link"); S3=$(snapshot "$W/marker"); S4=$(snapshot "$W/vite"); O=$(md5sum < "$W/outside.md")
(cd "$W/mono" && { $CLI init >"$W/o1.txt" 2>&1; [[ $? -eq 1 ]]; }) && [[ "$(snapshot "$W/mono")" == "$S1" ]] \
  && grep -q 'this folder is a workspace root (its package.json has "workspaces"' "$W/o1.txt" && (cd "$W/mono/web" && $CLI init >/dev/null 2>&1) \
  && (cd "$W/link" && { $CLI init >"$W/o2.txt" 2>&1; [[ $? -eq 1 ]]; }) && [[ "$(snapshot "$W/link")" == "$S2" ]] && [[ "$(md5sum < "$W/outside.md")" == "$O" ]] \
  && grep -q "AGENTS.md is a symbolic link" "$W/o2.txt" \
  && (cd "$W/marker" && { $CLI init >"$W/o3.txt" 2>&1; [[ $? -eq 1 ]]; }) && [[ "$(snapshot "$W/marker")" == "$S3" ]] \
  && grep -q "AGENTS.md has <!-- kleros-ui:start 3.10.0 --> on line 3 and no <!-- kleros-ui:end --> after it" "$W/o3.txt" \
  && (cd "$W/claude" && echo '# Guide' > AGENTS.md && ln -s AGENTS.md CLAUDE.md && $CLI init >/dev/null 2>&1 && ! grep -q '^@AGENTS.md' AGENTS.md && [[ -L CLAUDE.md ]]) \
  && (cd "$W/vite" && { $CREATE . --no-install >"$W/o4.txt" 2>&1; [[ $? -eq 1 ]]; }) && [[ "$(snapshot "$W/vite")" == "$S4" ]] \
  && grep -q "already has vite.config.js; create writes the starter's vite.config.ts" "$W/o4.txt" \
  && (cd "$W/repo/web" && $CLI init >/dev/null 2>&1 && $CLI css >c1.txt 2>&1 && ! grep -q report c1.txt \
    && node -e 'const f = "kleros-ui.json", fs = require("fs"); const c = JSON.parse(fs.readFileSync(f)); c.cssDirs = "src"; fs.writeFileSync(f, JSON.stringify(c))' \
    && ! $CLI check >c2.txt 2>&1 && grep -q '"cssDirs" in kleros-ui.json is "src", not a list of folders' c2.txt) \
  && echo "gate: PR #127 review: init refuses a workspace root, an AGENTS.md linked outside the app and an AGENTS.md start marker with no end, and writes nothing; a CLAUDE.md linked to AGENTS.md gets no @AGENTS.md line; create . refuses a folder with a vite.config.js; the CSS scan skips what the repo root's .gitignore names; a cssDirs string fails check"
rm -rf "$W"

# PR #131 review (I1): an orphan start marker above a complete block (the layout #127's earlier init wrote) is refused
# by sync and init, naming both start lines, and the text between them stays; once the orphan line is deleted, sync
# updates the block and keeps that text.
W=$(mktemp -d -p "$WORK")
echo '{"name":"x","type":"module","scripts":{}}' > "$W/package.json"
printf '# Guide\n\n<!-- kleros-ui:start 3.10.0 -->\nold block\n\nkeep me\n\n<!-- kleros-ui:start 3.10.0 -->\nblock\n<!-- kleros-ui:end -->\n' > "$W/AGENTS.md"
S1=$(snapshot "$W")
(cd "$W" && { $CLI sync >"$W/../i1-sync.txt" 2>&1; [[ $? -eq 1 ]]; } && { $CLI init >"$W/../i1-init.txt" 2>&1; [[ $? -eq 1 ]]; }) && [[ "$(snapshot "$W")" == "$S1" ]] \
  && grep -q "AGENTS.md has <!-- kleros-ui:start 3.10.0 --> on line 3 and <!-- kleros-ui:start 3.10.0 --> on line 8 before the first <!-- kleros-ui:end --> (line 10)" "$W/../i1-sync.txt" \
  && grep -q "on line 8 before the first" "$W/../i1-init.txt" \
  && (cd "$W" && sed -i '3d' AGENTS.md && $CLI sync >/dev/null 2>&1 && grep -q "keep me" AGENTS.md && [[ $(grep -c "kleros-ui:start" AGENTS.md) == 1 ]]) \
  && echo "gate: PR #131 review: sync and init refuse a second start marker before the first end marker, naming both lines, and write nothing; with the orphan line gone, sync keeps the text"
rm -rf "$W/../i1-sync.txt" "$W/../i1-init.txt" "$W"

# React 18 only (PR #127 review, before the pilot): init warns and check fails setup when the React the app's copy of
# the library resolves is 19 (a stub package.json is enough: check reads the version) or package.json asks for a range
# without 18; an app on ^18.3.1 gets no React line. Before the app installs the library, a parent folder's React 19 (a
# monorepo root's) is not the app's: init in such a folder, on ^18.3.1, prints no React line.
W=$(mktemp -d -p "$WORK")
mkdir -p "$W/r19/node_modules/react" "$W/r19/node_modules/react-dom" "$W/r19/node_modules/@kleros" "$W/r18" "$W/new18"
cp -R "$LIB" "$W/r19/node_modules/@kleros/ui-components-library"
bins "$W/r19" && bins "$W/r18"
echo '{"name":"x","type":"module","dependencies":{"react":"^18.0.0 || ^19.0.0","react-dom":"^18.0.0 || ^19.0.0"},"scripts":{}}' > "$W/r19/package.json"
for n in react react-dom; do echo "{\"name\":\"$n\",\"version\":\"19.0.0\"}" > "$W/r19/node_modules/$n/package.json"; done
echo '{"name":"x","type":"module","dependencies":{"react":"^18.3.1","react-dom":"^18.3.1"},"scripts":{}}' > "$W/r18/package.json"
(cd "$W/r19" && $CLI init 2>&1 | grep -q "warning: React 18 only: react 19.0.0 is installed, react-dom 19.0.0 is installed\." \
    && { $CLI check >c.txt 2>&1; [[ $? -eq 1 ]]; } && grep -q "^setup: React 18 only: react 19.0.0 is installed" c.txt \
    && sed -i 's/"\^18.0.0 || \^19.0.0"/"^19.0.0"/g' package.json && { $CLI check >c2.txt 2>&1; grep -q "package.json asks for react ^19.0.0" c2.txt; }) \
  && (cd "$W/r18" && $CLI init >i.txt 2>&1 && ! grep -q "React 18 only" i.txt && { $CLI check >c.txt 2>&1; ! grep -q "React 18 only" c.txt; }) \
  && mkdir -p "$W/node_modules" && cp -R "$W/r19/node_modules/react" "$W/r19/node_modules/react-dom" "$W/node_modules/" \
  && echo '{"name":"y","type":"module","dependencies":{"react":"^18.3.1","react-dom":"^18.3.1"},"scripts":{}}' > "$W/new18/package.json" \
  && (cd "$W/new18" && $CLI init >i.txt 2>&1 && ! grep -q "React 18 only" i.txt) \
  && echo "gate: React 18 only: init warns and check fails setup on an installed React 19 or a react range without 18; React 18 gets no React line, nor does an app with no copy of the library yet under a folder with React 19"
rm -rf "$W"

# PR #127 review, before the pilot: an AGENTS.md block from another release of the installed major is a note (a library
# update does not fail CI until someone runs sync); one from another major is a setup problem. A same-major block's text
# is still checked: the old styled-components one (Court's 3.10.1-d.6 block) fails setup.
W=$(mktemp -d -p "$WORK")
echo '{"name":"x","type":"module","dependencies":{"react":"^18.3.1"},"scripts":{}}' > "$W/package.json"
stubs "$W"
MAJ=$(node -p "require('$LIB/package.json').version.split('.')[0]")
(cd "$W" && $CLI init >/dev/null 2>&1 && sed -i "s/kleros-ui:start [^ ]*/kleros-ui:start $MAJ.0.0-old/" AGENTS.md \
    && { $CLI check >same.txt 2>&1; grep -q "^note: AGENTS.md block is for $MAJ.0.0-old, installed " same.txt && ! grep -q "^setup: AGENTS.md block is for" same.txt; } \
    && printf '<!-- kleros-ui:start %s.0.0-old -->\nThis app styles its own code with styled-components.\n<!-- kleros-ui:end -->\n' "$MAJ" > AGENTS.md \
    && { $CLI check >sc.txt 2>&1; grep -q "^setup: AGENTS.md block is the old styled-components one" sc.txt; } \
    && sed -i "s/kleros-ui:start [^ ]*/kleros-ui:start $((MAJ - 1)).99.0/" AGENTS.md \
    && { $CLI check >other.txt 2>&1; [[ $? -eq 1 ]] && grep -q "^setup: AGENTS.md block is for $((MAJ - 1)).99.0, installed " other.txt; }) \
  && echo "gate: an AGENTS.md block from another release of the installed major is a note in check, and its text is still checked (an old styled-components block fails); one from another major fails setup"
rm -rf "$W"

# PR #127 review, before the pilot: with no eslint-plugin-better-tailwindcss where the app's copy of the library finds
# it, the lint preset's class rules are off, so check fails setup and says to add it, baseline records nothing, and init
# says so too. A plugin that throws on import fails setup the same way. The pack is copied beside the fixture, away from
# run.sh's stand-in; with a working plugin there (an empty one), that problem is gone, also under an app NODE_OPTIONS
# whose --require path is relative to the app (the load check runs in the library's folder, without it).
W=$(mktemp -d -p "$WORK")
mkdir -p "$W/lib/node_modules/@kleros" "$W/app/node_modules/.bin" "$W/app/node_modules/@kleros"
cp -R "$LIB" "$W/lib/node_modules/@kleros/ui-components-library"
printf '#!/bin/sh\ncase " $* " in *" -f json "*) echo "[]";; esac\nexit 0\n' > "$W/app/node_modules/.bin/eslint"
printf '#!/bin/sh\nexit 0\n' > "$W/app/node_modules/.bin/tsc"
chmod +x "$W/app/node_modules/.bin/eslint" "$W/app/node_modules/.bin/tsc"
ln -s "$W/lib/node_modules/@kleros/ui-components-library" "$W/app/node_modules/@kleros/ui-components-library"
printf "$TOOLS\n" app > "$W/app/package.json"
(cd "$W/app" && $CLI init >init.txt 2>&1 && grep -q "need eslint-plugin-better-tailwindcss as a devDependency; npm run ui:check fails until it is there" init.txt \
    && { $CLI check >c1.txt 2>&1; [[ $? -eq 1 ]]; } \
    && grep -q "^setup: eslint-plugin-better-tailwindcss does not resolve from the app's copy of @kleros/ui-components-library, so the lint preset's Tailwind class rules .* are off, and kleros-ui check fails until they are on" c1.txt \
    && { $CLI baseline >b1.txt 2>&1; [[ $? -eq 1 ]]; } && [[ ! -e kleros-ui-baseline.json ]] \
    && grep -q "^kleros-ui baseline: eslint-plugin-better-tailwindcss does not resolve .* Nothing was recorded\.$" b1.txt \
    && mkdir -p "$W/lib/node_modules/eslint-plugin-better-tailwindcss" \
    && echo '{"name":"eslint-plugin-better-tailwindcss","type":"module","exports":"./index.js"}' > "$W/lib/node_modules/eslint-plugin-better-tailwindcss/package.json" \
    && echo 'throw new Error("broken plugin");' > "$W/lib/node_modules/eslint-plugin-better-tailwindcss/index.js" \
    && { $CLI check >c3.txt 2>&1; [[ $? -eq 1 ]]; } \
    && grep -q "^setup: eslint-plugin-better-tailwindcss is installed but fails to load from the app's copy of @kleros/ui-components-library (broken plugin)" c3.txt \
    && echo 'export default { rules: {} };' > "$W/lib/node_modules/eslint-plugin-better-tailwindcss/index.js" \
    && { $CLI check >c2.txt 2>&1; ! grep -q "eslint-plugin-better-tailwindcss" c2.txt; } \
    && echo '// the app preload' > preload.cjs && { NODE_OPTIONS="--require ./preload.cjs" $CLI check >c4.txt 2>&1; ! grep -q "eslint-plugin-better-tailwindcss" c4.txt; }) \
  && echo "gate: without eslint-plugin-better-tailwindcss, init says ui:check needs it, check fails setup naming it and baseline records nothing; a plugin that throws on import fails setup with its error; a working one gives no plugin line, also under an app NODE_OPTIONS --require"
rm -rf "$W"

# PR #127 review (F4): init records the app's one Tailwind stylesheet (Escrow's and Curate's src/global.css) as
# cssEntry, in kleros-ui.json and in the lint config, so check reads it: a main.tsx that imports it without style.css
# fails, and passes with style.css first. A cssEntry naming a missing file while src/global.css imports tailwindcss is a
# setup problem, not a silent skip.
E=$(mktemp -d -p "$WORK")
stubs "$E"
(cd "$E" && printf "$TOOLS\n" e > package.json && mkdir src && sed '$d' "$LIB/templates/poc/src/index.css" > src/global.css \
  && $CLI init >i.txt && grep -q 'recorded "cssEntry": "src/global.css"' i.txt && grep -q '"cssEntry": "src/global.css"' kleros-ui.json \
  && grep -q 'klerosUI({ cssEntry: "src/global.css" })' kleros-ui.eslint.config.mjs \
  && printf 'import "./global.css";\n' > src/main.tsx && ! $CLI check >o1.txt 2>&1 \
  && grep -q '^setup: src/main.tsx imports ./global.css (the Tailwind entry) without @kleros/ui-components-library/style.css' o1.txt \
  && printf 'import "@kleros/ui-components-library/style.css";\nimport "./global.css";\n' > src/main.tsx && $CLI check | grep -qx "ui:check passed" \
  && node -e 'const f = "kleros-ui.json", fs = require("fs"); const c = JSON.parse(fs.readFileSync(f)); c.cssEntry = "src/index.css"; fs.writeFileSync(f, JSON.stringify(c))' \
  && ! $CLI check >o2.txt 2>&1 && grep -q '^setup: "cssEntry" in kleros-ui.json is src/index.css, which does not exist, while src/global.css imports it' o2.txt) \
  && echo "gate: PR #127 review (F4): init records src/global.css, the one stylesheet that imports tailwindcss, as cssEntry in kleros-ui.json and the lint config, and check orders style.css against it; a cssEntry naming a missing file while src/global.css imports tailwindcss fails check"
rm -rf "$E"

# PR #127 review (F18): in a baselined app, a tsc error with no file position (TS5083: an "extends" naming a missing
# file) fails check beside the old located error, which tsc still prints; ui:baseline refuses it, says why, and leaves
# the baseline as it was.
U=$(mktemp -d -p "$WORK")
stubs "$U"
(cd "$U" && printf "$TOOLS\n" u > package.json && $CLI init >/dev/null \
  && printf '#!/bin/sh\ncat tsc-out.txt\nexit 2\n' > node_modules/.bin/tsc \
  && echo "src/a.ts(1,7): error TS2322: Type 'number' is not assignable to type 'string'." > tsc-out.txt \
  && $CLI baseline >/dev/null && $CLI check | grep -qx "ui:check passed" && cp kleros-ui-baseline.json b0.json \
  && echo "error TS5083: Cannot read file '$U/tsconfig.base.json'." >> tsc-out.txt \
  && ! $CLI check >o1.txt 2>&1 && grep -q '^tsc: 1 error with no file position' o1.txt && grep -q '^  error TS5083: ' o1.txt \
  && grep -q '^ui:check failed (tsc failed, lint ok, css ok, setup 0 problem(s))' o1.txt \
  && { $CLI baseline >o2.txt 2>&1; [[ $? -eq 1 ]]; } && grep -q '^kleros-ui baseline: tsc failed (above). Nothing was recorded.' o2.txt && cmp -s kleros-ui-baseline.json b0.json) \
  && echo "gate: PR #127 review (F18): in a baselined app, a tsc error with no file position (TS5083) fails check beside the old located error, and ui:baseline refuses it, says why and leaves the baseline as it was"
rm -rf "$U"

# PR #127 review (F4, a nested entry): an entry that reaches tailwindcss through an @import ("./tw.css") is the entry,
# not the file it imports: init records src/index.css in kleros-ui.json and the lint config, and check orders
# style.css against it with no cssEntry problem. PR #131 review (M1): the CSS scan reads it as the entry too, so its
# own lines are no findings, and once theme has added the theme import, deleting that import is a css-theme finding.
# An @import of a stylesheet the scan skips (a dot folder) is still a finding, though that file imports tailwindcss.
# Round 2: a chain of two (index.css, then mid.css, then tw.css) is the entry too, with no finding on mid.css, but a
# stylesheet the entry imports after the theme file that imports the library's theme.css again (undoing the theme) is
# a finding, whether it reaches tailwindcss through ./tw.css or imports it itself, as is a second import of it in the
# entry after the theme file. A tw.css imported before the theme file may import theme.css (the guide's four lines).
Z=$(mktemp -d -p "$WORK")
stubs "$Z"
(cd "$Z" && printf "$TOOLS\n" z > package.json && mkdir src && echo '@import "tailwindcss";' > src/tw.css \
  && { echo '@import "./tw.css";'; sed 1d "$LIB/templates/poc/src/index.css"; } > src/index.css \
  && $CLI init >/dev/null && grep -q '"cssEntry": "src/index.css"' kleros-ui.json && grep -q 'klerosUI({ cssEntry: "src/index.css" })' kleros-ui.eslint.config.mjs \
  && printf 'import "./index.css";\n' > src/main.tsx && ! $CLI check >o1.txt 2>&1 && ! grep -q '"cssEntry" in' o1.txt \
  && grep -q '^setup: src/main.tsx imports ./index.css (the Tailwind entry) without @kleros/ui-components-library/style.css' o1.txt \
  && $CLI css >o2.txt 2>&1 && grep -q '^css: 0 findings' o2.txt \
  && echo '@import "./tw.css";' > src/mid.css && sed -i 's|^@import "\./tw\.css";$|@import "./mid.css";|' src/index.css \
  && grep -qx '@import "./mid.css";' src/index.css && $CLI css >o5.txt 2>&1 && grep -q '^css: 0 findings' o5.txt \
  && $CLI theme >/dev/null && grep -qx '@import "./theme.css";' src/index.css && $CLI css >/dev/null \
  && printf '@import "./tw.css";\n@import "@kleros/ui-components-library/theme.css";\n' > src/late.css && echo '@import "./late.css";' >> src/index.css \
  && ! $CLI css >o6.txt 2>&1 && grep -q '^src/late.css:2:1 @import "@kleros/ui-components-library/theme.css" in src/late.css, a stylesheet the Tailwind entry src/index.css imports' o6.txt \
  && grep -q '^css: 1 finding' o6.txt && printf '@import "tailwindcss";\n@import "@kleros/ui-components-library/theme.css";\n' > src/late.css \
  && ! $CLI css >o7.txt 2>&1 && grep -q '^src/late.css:2:1 @import "@kleros/ui-components-library/theme.css" in src/late.css, which the Tailwind entry src/index.css reaches after the theme file src/theme.css (through its @import "./late.css")' o7.txt \
  && grep -q '^css: 1 finding' o7.txt && sed -i '/^@import "\.\/late\.css";$/d' src/index.css && rm src/late.css && $CLI css >/dev/null \
  && printf '@import "tailwindcss";\n@import "@kleros/ui-components-library/theme.css";\n' > src/tw.css && $CLI css >o8.txt 2>&1 && grep -q '^css: 0 findings' o8.txt \
  && echo '@import "tailwindcss";' > src/tw.css && echo '@import "@kleros/ui-components-library/theme.css";' >> src/index.css \
  && ! $CLI css >o9.txt 2>&1 && grep -q '^src/index.css:[0-9]*:1 @import "@kleros/ui-components-library/theme.css" again after the theme file src/theme.css' o9.txt \
  && sed -i '$d' src/index.css && $CLI css >/dev/null \
  && sed -i '/^@import "\.\/theme\.css";$/d' src/index.css && ! $CLI css >o3.txt 2>&1 \
  && grep -q 'The Tailwind entry does not import the theme file src/theme.css' o3.txt && grep -q '^css: 1 finding' o3.txt \
  && mkdir src/.x && printf '@import "tailwindcss";\n.a { color: red; }\n' > src/.x/more.css && echo '@import "./.x/more.css";' >> src/index.css \
  && ! $CLI css >o4.txt 2>&1 && grep -q '^src/index.css:[0-9]*:1 @import "./.x/more.css" in the Tailwind entry' o4.txt) \
  && echo "gate: an entry that reaches tailwindcss through @import \"./tw.css\" is recorded as cssEntry (src/index.css, not tw.css), check orders style.css against it, and the CSS scan reads it as the entry: no findings on its own lines or a stylesheet on the way, a theme.css import after the theme file's is a finding, a deleted theme import is a css-theme finding, and an @import of a file the scan skips is still one"
rm -rf "$Z"

# PR #127 second review (R2-F8, R2-F12/F13): create's default path, npm install and then init through the app's installed
# copy, with a stub npm first in PATH, so no network. (a) The stub installs the library (a link to the pack): create
# runs init from that copy and exits 0. (b) It exits 0 and installs nothing: create says the library is not installed.
# (c) It exits 1: create gives the install-failed hint. (d) With only node in PATH, create, check and baseline exit 1
# and name npm or npx, with no stack and no hint about the library spec.
K=$(mktemp -d -p "$WORK")
mkdir -p "$K/ok" "$K/none" "$K/fail" "$K/only"
printf '#!/bin/sh\necho "npm $*" > npm-args.txt\nmkdir -p node_modules/@kleros && ln -s "%s" node_modules/@kleros/ui-components-library\n' "$LIB" > "$K/ok/npm"
printf '#!/bin/sh\nexit 0\n' > "$K/none/npm"
printf '#!/bin/sh\necho "npm error: stub" >&2\nexit 1\n' > "$K/fail/npm"
chmod +x "$K/ok/npm" "$K/none/npm" "$K/fail/npm" && ln -s "$(command -v node)" "$K/only/node"
ONLY="env -u npm_config_package PATH=$K/only node $LIB/bin/kleros-ui.mjs"
(cd "$K" && PATH="$K/ok:$PATH" $CREATE a >a.txt 2>&1 && grep -qx 'kleros-ui: npm install in a' a.txt && grep -qx 'npm install --no-fund --no-audit' a/npm-args.txt \
  && ! grep -q 'has no kleros-ui CLI' a.txt && grep -q '"ui:check"' a/package.json \
  && grep -qF 'look it up in node_modules/@kleros/ui-components-library/agent/CATALOG.md' a/AGENTS.md \
  && { PATH="$K/none:$PATH" $CREATE b >b.txt 2>&1; [[ $? -eq 1 ]]; } \
  && grep -q '^kleros-ui create: npm install exited 0, but @kleros/ui-components-library is not installed in b' b.txt \
  && { PATH="$K/fail:$PATH" $CREATE c >c.txt 2>&1; [[ $? -eq 1 ]]; } && grep -q "^kleros-ui create: npm install failed in c; the starter's files are in place" c.txt \
  && { $ONLY create d >d.txt 2>&1; [[ $? -eq 1 ]]; } && grep -q '^kleros-ui create: could not start npm (ENOENT), so nothing was installed in d' d.txt \
  && ! grep -q 'not on the registry' d.txt && [[ -f d/src/App.tsx ]] \
  && (cd a && { $ONLY check >../e.txt 2>&1; [[ $? -eq 1 ]]; } && { $ONLY baseline >../f.txt 2>&1; [[ $? -eq 1 ]]; } && [[ ! -e kleros-ui-baseline.json ]]) \
  && grep -q '^kleros-ui: could not start npx (ENOENT), so tsc did not run' e.txt && grep -q '^kleros-ui: could not start npx (ENOENT), so eslint did not run' e.txt \
  && grep -q '^ui:check failed (tsc failed, lint failed, ' e.txt \
  && grep -q '^kleros-ui: could not start npx (ENOENT), so eslint did not run' f.txt && grep -q '^kleros-ui baseline: ESLint and tsc failed (above). Nothing was recorded.' f.txt \
  && ! grep -qE 'TypeError|^ +at ' a.txt b.txt c.txt d.txt e.txt f.txt) \
  && echo "gate: PR #127 second review (F8, F12/F13): with a stub npm first in PATH, create runs npm install and then init from the app's installed copy; an install that exits 0 without the library, or exits 1, stops create with its own message; with no npm or npx in PATH, create, check and baseline exit 1 naming the command that did not start, with no stack"
rm -rf "$K"

# PR #127 second review (R2-F24): an app with no src/ (a Next.js app/ router) lints its code folders. init passes them
# to klerosUI() as files, so the preset's rules cover app/page.tsx; check names the folders it lints; baseline records
# app/page.tsx, and check fails on a new error there. "lintDirs" in kleros-ui.json sets the folders: one that is not
# there fails check and stops baseline, a string fails check, and a list the lint config's files do not match is a
# setup problem until init rewrites them. A folder name's glob characters are escaped (code/[[]client[]]), so the
# preset's rules reach code/[client]/a.tsx. The stub eslint logs its arguments.
Y=$(mktemp -d -p "$WORK")
stubs "$Y"
printf '#!/bin/sh\necho "$*" >> eslint-args.txt\ncase " $* " in *" -f json "*) if [ -f eslint-out.json ]; then cat eslint-out.json; else echo "[]"; fi;; esac\nexit 0\n' > "$Y/node_modules/.bin/eslint"
ERR='{"ruleId":"no-debugger","severity":2,"line":1,"column":1,"message":"Unexpected debugger statement."}'
lintdirs() { node -e 'const f = "kleros-ui.json", fs = require("fs"); const c = JSON.parse(fs.readFileSync(f)); c.lintDirs = JSON.parse(process.argv[1]); fs.writeFileSync(f, JSON.stringify(c))' "$1"; }
(cd "$Y" && printf "$TOOLS\n" y > package.json && mkdir app && echo 'export default function Page() { return null; }' > app/page.tsx \
  && $CLI init >/dev/null && grep -qF 'klerosUI({ cssEntry: "src/index.css", files: ["app/**/*.{js,jsx,ts,tsx}"] })' kleros-ui.eslint.config.mjs \
  && node "$P/gate/cli-lint-load.mjs" . app/page.tsx | tail -1 | grep -qF '"kleros-ui/no-styled-components":["error"]' \
  && printf '[{"filePath":"%s/app/page.tsx","messages":[%s]}]\n' "$PWD" "$ERR" > eslint-out.json && $CLI baseline >b1.txt \
  && grep -q '^kleros-ui: recorded 1 existing lint errors (ESLint on app/)' b1.txt && grep -q '"app/page.tsx|no-debugger": 1' kleros-ui-baseline.json \
  && grep -qx -- '-c kleros-ui.eslint.config.mjs app -f json' eslint-args.txt && ! grep -q src eslint-args.txt \
  && $CLI check >c1.txt && grep -qx 'ui:check passed' c1.txt && grep -q '^lint: ESLint on app/ (no src/ here' c1.txt \
  && printf '[{"filePath":"%s/app/page.tsx","messages":[%s,%s]}]\n' "$PWD" "$ERR" "$ERR" > eslint-out.json && ! $CLI check >c2.txt \
  && grep -q '^lint: 1 new (baseline 1):' c2.txt && grep -q '^  app/page.tsx:1:1 Unexpected debugger statement. (no-debugger)' c2.txt \
  && echo '[]' > eslint-out.json && lintdirs '["app", "nope"]' && ! $CLI check >c3.txt \
  && grep -q '^lint: nope is not a folder here, so ESLint did not lint it ("lintDirs" in kleros-ui.json)' c3.txt && grep -q 'lint failed' c3.txt \
  && cp kleros-ui-baseline.json b0.json && { $CLI baseline >b2.txt 2>&1; [[ $? -eq 1 ]]; } && cmp -s b0.json kleros-ui-baseline.json \
  && grep -q '^kleros-ui baseline: nope in "lintDirs" of kleros-ui.json is not a folder here' b2.txt \
  && lintdirs '"app"' && { $CLI check >c4.txt 2>&1; [[ $? -eq 1 ]]; } && grep -q "^kleros-ui: \"lintDirs\" in kleros-ui.json is \"app\", not a list of the app's folders" c4.txt \
  && mkdir lib && lintdirs '["app", "lib"]' && ! $CLI check >c5.txt \
  && grep -q '^setup: kleros-ui.eslint.config.mjs passes klerosUI() files for app/, while ui:check lints app/, lib/' c5.txt \
  && $CLI init >i2.txt && grep -q '^kleros-ui: rewrote kleros-ui.eslint.config.mjs: its files now cover app/, lib/, the folders ui:check lints' i2.txt \
  && grep -qF 'files: ["app/**/*.{js,jsx,ts,tsx}", "lib/**/*.{js,jsx,ts,tsx}"]' kleros-ui.eslint.config.mjs && $CLI check | grep -qx 'ui:check passed' \
  && mkdir -p 'code/[client]' && echo 'export const A = 1;' > 'code/[client]/a.tsx' && lintdirs '["app", "code/[client]"]' \
  && $CLI init >i3.txt && grep -q '^kleros-ui: rewrote kleros-ui.eslint.config.mjs: its files now cover app/, code/\[client\]/,' i3.txt \
  && grep -qF '"code/[[]client[]]/**/*.{js,jsx,ts,tsx}"' kleros-ui.eslint.config.mjs \
  && node "$P/gate/cli-lint-load.mjs" . 'code/[client]/a.tsx' | tail -1 | grep -qF '"kleros-ui/no-styled-components":["error"]') \
  && echo "gate: PR #127 second review (F24): an app with no src/ lints app/: init passes it to klerosUI() as files, so the preset's rules cover app/page.tsx, check names the folders it lints, baseline records app/page.tsx and check fails on a new error there; a lintDirs folder that is not there fails check and stops baseline, a lintDirs string fails check, and lint folders the lint config's files do not match are a setup problem until init rewrites them; a folder's glob characters are escaped, so the preset's rules reach code/[client]/a.tsx"
rm -rf "$Y"

# PR #127 second review (R2-F37): the index.html scan reads each "<" once, so 50 KB of unclosed tags ("<a ", "<style ",
# "<script ") is scanned in under 5 s with no finding; a <style> with no </style> is a block to the end of the page, as
# a browser reads it, and one finding.
H=$(mktemp -d -p "$WORK")
CSS0='css: 0 findings (0 token overrides, 0 colour literals, 0 Tailwind-only, 0 !important, 0 library internals) in 1 file scanned'
(cd "$H" && for t in '<a ' '<style ' '<script '; do
    node -e 'process.stdout.write(process.argv[1].repeat(Math.ceil(51200 / process.argv[1].length)))' "$t" > index.html \
      && timeout 5 $CLI css index.html >o.txt && grep -qxF "$CSS0" o.txt || exit 1
  done \
  && printf '<!doctype html>\n<style> body { margin: 0; }\n' > index.html && { $CLI css index.html >o.txt; [[ $? -eq 1 ]]; } \
  && grep -q '^index.html:2:1 <style> block in index.html' o.txt && [[ "$(grep -c '^index.html:' o.txt)" == "1" ]]) \
  && echo "gate: PR #127 second review (F37): 50 KB of unclosed <a, <style or <script tags in index.html is scanned in under 5 s with no finding, and a <style> with no </style> is one <style> block finding"
rm -rf "$H"

# PR #127 second review (R2-F47, R2-F48): new records importPath from src/ when componentsDir is inside it (src/ui gives
# ./ui/VoteBar) and from the app root when it is not (app/ui gives ./app/ui/VoteBar). init run again leaves the Cursor
# rule as it is once it is there: with its front matter edited, or with CRLF line endings, as CLAUDE.md.
D=$(mktemp -d -p "$WORK")
mkdir -p "$D/ui" "$D/root" "$D/rule"
for d in ui root rule; do echo '{"name":"x","type":"module","scripts":{}}' > "$D/$d/package.json"; done
echo '{"componentsDir":"src/ui","components":[]}' > "$D/ui/kleros-ui.json" && echo '{"componentsDir":"app/ui","components":[]}' > "$D/root/kleros-ui.json"
R=.cursor/rules/kleros-ui.mdc
(cd "$D/ui" && $CLI new VoteBar --intent "vote bar" >/dev/null && [[ -f src/ui/VoteBar/VoteBar.tsx ]] && grep -q '"importPath": "./ui/VoteBar"' kleros-ui.json) \
  && (cd "$D/root" && $CLI new VoteBar --intent "vote bar" >/dev/null && [[ -f app/ui/VoteBar/VoteBar.tsx ]] && grep -q '"importPath": "./app/ui/VoteBar"' kleros-ui.json) \
  && (cd "$D/rule" && $CLI init >/dev/null && [[ "$(grep -c alwaysApply "$R")" == "1" ]] \
    && sed -i 's/^alwaysApply: true$/description: Kleros UI rules\nalwaysApply: true/' "$R" && cp "$R" edited.mdc \
    && $CLI init >/dev/null && cmp -s "$R" edited.mdc && [[ "$(grep -c alwaysApply "$R")" == "1" ]] \
    && sed -i 's/$/\r/' "$R" CLAUDE.md && cp "$R" crlf.mdc && cp CLAUDE.md crlf.md && $CLI init >/dev/null && cmp -s "$R" crlf.mdc && cmp -s CLAUDE.md crlf.md) \
  && echo "gate: PR #127 second review (F47, F48): new records importPath from src/ for a componentsDir inside it and from the app root otherwise; init run again leaves a Cursor rule with edited front matter or CRLF line endings, and a CRLF CLAUDE.md, as they are"
rm -rf "$D"

# PR #127 second review (R2-F49): the cssEntry init writes into the lint config follows kleros-ui.json. With two
# Tailwind stylesheets, init says to set "cssEntry" and run init again, naming the lint config; after that hand edit,
# check names the stale copy, and init rewrites it and says so, in kleros-ui.eslint.config.mjs and in the managed
# eslint.config.js of an app create made; a copy changed in the lint config alone is named too.
F=$(mktemp -d -p "$WORK")
mkdir -p "$F/two" "$F/made" && stubs "$F/two"
cssentry() { node -e 'const f = "kleros-ui.json", fs = require("fs"); const c = JSON.parse(fs.readFileSync(f)); c.cssEntry = process.argv[1]; fs.writeFileSync(f, JSON.stringify(c))' "$1"; }
(cd "$F/two" && printf "$TOOLS\n" two > package.json && mkdir src && echo '@import "tailwindcss";' > src/a.css && echo '@import "tailwindcss";' > src/b.css \
  && $CLI init >i1.txt \
  && grep -qF 'kleros-ui: src/a.css, src/b.css all import tailwindcss; set "cssEntry" in kleros-ui.json to the app'"'"'s Tailwind entry (it says src/index.css), then run init again, which sets the same entry in the cssEntry the lint config passes to klerosUI()' i1.txt \
  && grep -qF 'klerosUI({ cssEntry: "src/index.css" })' kleros-ui.eslint.config.mjs && cssentry src/b.css && ! $CLI check >c1.txt \
  && grep -q '^setup: kleros-ui.eslint.config.mjs passes cssEntry "src/index.css" to klerosUI(), while "cssEntry" in kleros-ui.json is "src/b.css"' c1.txt \
  && $CLI init >i2.txt \
  && grep -qx 'kleros-ui: rewrote kleros-ui.eslint.config.mjs: its cssEntry is now "src/b.css", as in kleros-ui.json (it was "src/index.css"); the rest of it is kept as it was' i2.txt \
  && grep -qF 'klerosUI({ cssEntry: "src/b.css" })' kleros-ui.eslint.config.mjs && $CLI check >c2.txt && grep -qx 'ui:check passed' c2.txt \
  && sed -i 's#cssEntry: "src/b.css"#cssEntry: "src/a.css"#' kleros-ui.eslint.config.mjs && ! $CLI check >c3.txt \
  && grep -q '^setup: kleros-ui.eslint.config.mjs passes cssEntry "src/a.css" to klerosUI(), while "cssEntry" in kleros-ui.json is "src/b.css"' c3.txt) \
  && (cd "$F/made" && $CREATE . --no-install >/dev/null && grep -qF 'klerosUI({ cssEntry: "src/index.css" })' eslint.config.js && cssentry src/global.css \
    && $CLI init >i3.txt && grep -q '^kleros-ui: rewrote the managed eslint.config.js: its cssEntry is now "src/global.css", as in kleros-ui.json' i3.txt \
    && grep -qF 'klerosUI({ cssEntry: "src/global.css" })' eslint.config.js) \
  && echo "gate: PR #127 second review (F49): with two Tailwind stylesheets init says to set cssEntry and run init again, naming the lint config; a cssEntry set in kleros-ui.json by hand, or changed in the lint config alone, is a setup problem naming both, and init rewrites the lint config's copy and says so, in kleros-ui.eslint.config.mjs and in a created app's managed eslint.config.js"
rm -rf "$F"

# CodeRabbit #127 (24 Nov, c01): a folder where init writes a file (.cursor/rules/kleros-ui.mdc, or CLAUDE.md, as a
# folder) is refused before init's first write, so AGENTS.md and CLAUDE.md are not written either; with the folder
# gone, init writes the Cursor rule into the .cursor/rules folder that is there.
CR01=$(mktemp -d -p "$WORK")
mkdir -p "$CR01/app/.cursor/rules/kleros-ui.mdc"
echo '{"name":"x","type":"module","scripts":{}}' > "$CR01/app/package.json"
S01=$(snapshot "$CR01/app")
(cd "$CR01/app" && { $CLI init >"$CR01/o1.txt" 2>&1; [[ $? -eq 1 ]]; }) && [[ "$(snapshot "$CR01/app")" == "$S01" ]] \
  && grep -qF 'kleros-ui init: .cursor/rules/kleros-ui.mdc is a folder, not a file, so it cannot be written (move it away).' "$CR01/o1.txt" \
  && grep -q 'Nothing was written\.$' "$CR01/o1.txt" && ! grep -q EISDIR "$CR01/o1.txt" \
  && rmdir "$CR01/app/.cursor/rules/kleros-ui.mdc" && mkdir "$CR01/app/CLAUDE.md" && S01=$(snapshot "$CR01/app") \
  && (cd "$CR01/app" && { $CLI init >"$CR01/o2.txt" 2>&1; [[ $? -eq 1 ]]; }) && [[ "$(snapshot "$CR01/app")" == "$S01" ]] \
  && grep -qF 'kleros-ui init: CLAUDE.md is a folder, not a file, so it cannot be written (move it away).' "$CR01/o2.txt" \
  && rmdir "$CR01/app/CLAUDE.md" && (cd "$CR01/app" && $CLI init >/dev/null) \
  && grep -q 'Follow the kleros-ui block in AGENTS.md' "$CR01/app/.cursor/rules/kleros-ui.mdc" && grep -qx '@AGENTS.md' "$CR01/app/CLAUDE.md" \
  && echo "gate: CodeRabbit #127 (24 Nov) c01: a folder where init writes a file (the Cursor rule, CLAUDE.md) is refused before init's first write, with no EISDIR, and nothing is written; with it gone, init writes the rule into the .cursor/rules folder that is there"
rm -rf "$CR01"

# CodeRabbit #127 (24 Nov, c02): in a package that is not "type": "module", init moves an earlier init's managed
# eslint.config.js to eslint.config.mjs. With an eslint.config.mjs of the app's already there, init refuses before its
# first write and both files stay as they were; with none there, it moves the wrap as before.
CR02=$(mktemp -d -p "$WORK")
mkdir "$CR02/app"
echo '{"name":"x","scripts":{}}' > "$CR02/app/package.json"
printf '%s\nconst app = [];\nimport klerosUI from "@kleros/ui-components-library/eslint";\n\nexport default [...[await app].flat(), ...klerosUI({ cssEntry: "src/index.css" })];\n' \
  "// Managed by kleros-ui init: the app's previous config plus the Kleros UI preset." > "$CR02/app/eslint.config.js"
echo 'export default [{ rules: { "no-console": "error" } }];' > "$CR02/app/eslint.config.mjs"
S02=$(snapshot "$CR02/app")
(cd "$CR02/app" && { $CLI init >"$CR02/o1.txt" 2>&1; [[ $? -eq 1 ]]; }) && [[ "$(snapshot "$CR02/app")" == "$S02" ]] \
  && grep -qF 'kleros-ui: eslint.config.mjs is already there, and init would move the managed eslint.config.js there' "$CR02/o1.txt" \
  && rm "$CR02/app/eslint.config.mjs" && (cd "$CR02/app" && $CLI init >"$CR02/o2.txt") \
  && grep -q '^kleros-ui: rewrote the managed eslint.config.js: moved it to eslint.config.mjs' "$CR02/o2.txt" \
  && [[ ! -e "$CR02/app/eslint.config.js" ]] && head -1 "$CR02/app/eslint.config.mjs" | grep -qF '// Managed by kleros-ui init' \
  && echo "gate: CodeRabbit #127 (24 Nov) c02: init refuses, before its first write, to move a managed eslint.config.js onto an eslint.config.mjs that is there (a package that is not \"type\": \"module\"), and moves it as before when there is none"
rm -rf "$CR02"

# CodeRabbit #127 (24 Nov, c03): a <script> or <style> block in index.html ends where a browser ends it, at </script or
# </style and then whitespace, "/" or ">" (any case), so a <style> block after `</script >` and a style attribute after
# `</STYLE\n>` are findings; `</scripts>` does not end a script, so a <style> inside it is script text, not a finding.
H=$(mktemp -d -p "$WORK")
(cd "$H" && printf '%s\n' '<!doctype html>' '<script>var a = 1;</script >' '<style> body { margin: 0; } </style>' \
    '<script>b</scripts></script/>' '<style>p{}</STYLE' '>' '<div style="color: red">x</div>' \
    '<script>c</scripts><style>q{}</style></script>' > index.html \
  && { $CLI css index.html >o.txt; [[ $? -eq 1 ]]; } \
  && grep -q '^index.html:3:1 <style> block in index.html' o.txt && grep -q '^index.html:5:1 <style> block in index.html' o.txt \
  && grep -q '^index.html:7:6 style attribute on <div> in index.html' o.txt && [[ "$(grep -c '^index.html:' o.txt)" == "3" ]]) \
  && echo "gate: CodeRabbit #127 (24 Nov): a <script> or <style> block in index.html ends at </script or </style and then whitespace, \"/\" or \">\", as a browser ends it, so a <style> block after </script > and a style attribute after </STYLE + newline + > are findings, and a <style> after </scripts> inside a script is not"
rm -rf "$H"

# CodeRabbit #127 (24 Nov, c06): the whole-app CSS scan (css, check, baseline) reads the configured Tailwind entry
# wherever cssDirs points, as it reads the theme file: with cssDirs ["app"], an entry src/index.css that leaves out the
# theme file's import and holds a style rule is two findings, and check's css step fails on them; css app still scans
# app/ alone.
E=$(mktemp -d -p "$WORK")
mkdir -p "$E/app" "$E/src" && stubs "$E"
(cd "$E" && printf "$TOOLS\n" dirs > package.json \
  && echo '{"cssDirs":["app"],"cssEntry":"src/index.css","theme":"src/theme.css","components":[]}' > kleros-ui.json \
  && printf '@import "tailwindcss";\n@import "@kleros/ui-components-library/theme.css";\n.page { margin: 0; }\n' > src/index.css \
  && printf '@layer base {\n  :root {\n    --klerosUIComponentsPrimaryBlue: #123456;\n  }\n}\n' > src/theme.css \
  && { $CLI css >o.txt 2>&1; [[ $? -eq 1 ]]; } \
  && grep -q '^src/index.css:2:1 The Tailwind entry does not import the theme file src/theme.css (kleros-ui.json "theme")' o.txt \
  && grep -q '^src/index.css:3:1 Style rule ".page" in the Tailwind entry' o.txt \
  && grep -qx 'css: 2 findings (0 token overrides, 0 colour literals, 1 Tailwind-only, 0 !important, 0 library internals, 1 theme) in 2 files scanned' o.txt \
  && $CLI css app >a.txt && grep -q ' in 0 files scanned$' a.txt \
  && $CLI init >/dev/null && ! $CLI check >c.txt 2>&1 && grep -q '^  src/index.css:2:1 The Tailwind entry does not import the theme file' c.txt \
  && grep -q '^ui:check failed (tsc ok, lint ok, css failed' c.txt) \
  && echo "gate: CodeRabbit #127 (24 Nov): the whole-app CSS scan reads the configured Tailwind entry when cssDirs leaves out its folder, so with cssDirs [\"app\"] an entry src/index.css with no theme import and a style rule is two findings and check's css step fails; css app still scans app/ alone"
rm -rf "$E"

# CodeRabbit #127 (24 Nov): a .gitignore line ending in "/" names folders only, as in git. theme.css/ and /src/main.tsx/
# skip no file, so the CSS scan reads src/theme.css and check orders style.css in src/main.tsx; gen.css/ still skips the
# folder src/gen.css, in both walks.
I=$(mktemp -d -p "$WORK")
stubs "$I"
(cd "$I" && printf "$TOOLS\n" i > package.json && mkdir -p src/gen.css && sed '$d' "$LIB/templates/poc/src/index.css" > src/index.css \
  && $CLI init >/dev/null && printf 'theme.css/\n/src/main.tsx/\ngen.css/\n' > .gitignore \
  && printf '.a { margin: 0; }\n' > src/theme.css && printf 'import "./index.css";\n' > src/main.tsx \
  && printf '.b { margin: 0; }\n' > src/gen.css/x.css && printf 'import "../index.css";\n' > src/gen.css/y.tsx \
  && ! $CLI check >o1.txt 2>&1 && grep -q 'src/theme.css:1:1 Style rule ".a"' o1.txt \
  && grep -q '^setup: src/main.tsx imports ./index.css (the Tailwind entry) without @kleros/ui-components-library/style.css' o1.txt \
  && ! grep -q 'gen\.css' o1.txt) \
  && echo "gate: CodeRabbit #127 (24 Nov): a .gitignore line ending in / names folders only, as in git: theme.css/ and /src/main.tsx/ skip no file, so the CSS scan reads src/theme.css and check orders style.css in src/main.tsx; gen.css/ still skips the folder src/gen.css"
rm -rf "$I"

# CodeRabbit #127 (24 Nov, c07): in a Next.js route file that ends with `export default Page`, the library-name rule
# skips the Page declared at the file's top level only (const or function, exported by name or not), and still reports
# a Page declared inside another function there. The route block's selectors run in a real ESLint, this repo's own (a
# devDependency, found from the real path of $P/tools, which is in the repo; the fixtures still have none), under the
# core no-restricted-syntax id, which the preset falls back to here.
CR07=$(mktemp -d -p "$WORK")
cat > "$CR07/route-page.mjs" <<'EOF'
import { createRequire } from "node:module";
import { pathToFileURL } from "node:url";
const [preset, from] = process.argv.slice(2);
const { Linter } = createRequire(from + "/")("eslint");
const { default: klerosUI } = await import(pathToFileURL(preset).href);
const route = klerosUI({}).at(-1);
const id = Object.keys(route.rules ?? {}).find((k) => k.endsWith("no-restricted-syntax"));
const config = [{ files: route.files, rules: { "no-restricted-syntax": route.rules[id] } }];
const linter = new Linter({ configType: "flat", cwd: "/app" });
// [a route file, the lines the library-name rule reports in it]
const cases = [
  ["function Outer() {\n  function Page() { return null; }\n  return Page;\n}\nconst Page = () => Outer;\nexport default Page;\n", [2]],
  ["const Outer = () => {\n  const Page = () => null;\n  return Page;\n};\nfunction Page() { return Outer; }\nexport default Page;\n", [2]],
  ["const Page = () => null;\nexport default Page;\n", []],
  ["export function Page() { return null; }\nexport default Page;\n", []],
  ["export default function Page() { return null; }\n", []],
  ["function Page() { return null; }\nexport default function Other() { return Page; }\n", [1]],
];
let bad = 0;
for (const [code, want] of cases) {
  const got = linter.verify(code, config, { filename: "/app/src/app/case/page.js" })
    .filter((m) => !m.ruleId || m.message.startsWith("Local component with a library name"))
    .map((m) => (m.ruleId ? m.line : m.message));
  if (JSON.stringify(got) !== JSON.stringify(want)) {
    bad++;
    console.log(`reported ${JSON.stringify(got)}, expected ${JSON.stringify(want)}, in:\n${code}`);
  }
}
process.exit(bad ? 1 : 0);
EOF
node "$CR07/route-page.mjs" "$LIB/eslint/index.mjs" "$(cd "$P/tools" && pwd -P)" >"$CR07/out.txt" 2>"$CR07/err.txt" \
  && echo "gate: CodeRabbit #127 (24 Nov) c07: in a Next.js route file that ends with export default Page, the library-name rule skips the Page declared at the top level only (const or function, exported by name or not) and reports a Page declared inside another function there (run in this repo's ESLint)"
rm -rf "$CR07"

# Review of the pilot-ready branch (F4, F5): a kleros-ui marker is one only at the start of a line and outside a fenced
# code block, where init and sync write it. Above a 3.10.0 block (the old styled-components one), AGENTS.md quotes a
# start marker alone in a ~~~ fence, first, so the second-start refusal sees it, then a start/end pair in inline code and
# in a ``` fence: check reads the real block's release and text (a note for 3.10.0, the styled-components problem), sync
# exits 0 and writes this release's block in place of the real one, the quoted lines and the text after the block stay
# byte for byte, check then has no block line, and a second sync changes nothing. With CRLF line endings, sync does the
# same.
W=$(mktemp -d -p "$WORK")
stubs "$W"
V=$(node -p "require('$LIB/package.json').version")
printf '# Guide\n\n~~~\n<!-- kleros-ui:start %s -->\n~~~\n\nkleros-ui owns the text between `<!-- kleros-ui:start %s -->` and `<!-- kleros-ui:end -->`; edit around it.\n\n```md\n<!-- kleros-ui:start %s -->\nexample\n<!-- kleros-ui:end -->\n```\n\n' "$V" "$V" "$V" > "$W/quoted.md"
printf '<!-- kleros-ui:start 3.10.0 -->\nold block: this app styles its own code with styled-components.\n<!-- kleros-ui:end -->\n\nTeam notes.\n' > "$W/real.md"
Q=$(wc -l < "$W/quoted.md")
(cd "$W" && printf "$TOOLS\n" m > package.json && $CLI init >/dev/null 2>&1 && cat quoted.md real.md > AGENTS.md \
    && { $CLI check >c1.txt 2>&1; grep -q "^note: AGENTS.md block is for 3.10.0, installed $V" c1.txt && grep -q "AGENTS.md block is the old styled-components one" c1.txt; } \
    && $CLI sync >s.txt 2>&1 && grep -qx "kleros-ui: block updated to $V" s.txt \
    && head -n "$Q" AGENTS.md | cmp -s - quoted.md && sed -n "$((Q + 1))p" AGENTS.md | grep -qx "<!-- kleros-ui:start $V -->" \
    && ! grep -q "old block" AGENTS.md && tail -n 2 AGENTS.md | cmp -s - <(tail -n 2 real.md) \
    && { $CLI check >c2.txt 2>&1; ! grep -q "AGENTS.md block\|has no kleros-ui block" c2.txt; } \
    && cp AGENTS.md once.md && $CLI sync >/dev/null && cmp -s AGENTS.md once.md \
    && sed 's/$/\r/' quoted.md > crlf.md && sed 's/$/\r/' real.md | cat crlf.md - > AGENTS.md \
    && $CLI sync >/dev/null && head -n "$Q" AGENTS.md | cmp -s - crlf.md \
    && sed -n "$((Q + 1))p" AGENTS.md | grep -qx "<!-- kleros-ui:start $V -->" && ! grep -q "old block" AGENTS.md) \
  && echo "gate: pilot-ready review (F4, F5): a kleros-ui marker counts only at the start of a line and outside a code fence: above a 3.10.0 block, with a start/end pair quoted inline and in a fence and a start marker alone in a ~~~ fence, check reads 3.10.0 and the real block's text, sync exits 0 and rewrites the real block, the quoted lines and the text after the block stay byte for byte (CRLF too), check then has no block line and a second sync changes nothing"
rm -rf "$W"

# Round 3 (markers): what still counts as a marker, so the fix adds no new refusal or second block. An end marker
# indented by two spaces (still an HTML comment in Markdown) and a file with CR-only line endings end the block as they
# did before the fix, so sync rewrites it in place and adds no second block. With two complete blocks, the second start
# comes after the first end, so it is not the refused orphan: sync rewrites the first block and keeps the second. A fence
# opened on a list item's line ("- ```sh") above the block, closed or ended by its item, with a fenced example below it,
# hides no block: check reads it and sync rewrites it in place. A "    ```" line inside a top-level fence is its text,
# not its closer, so the fence neither hides the block below it nor exposes the quoted block inside it.
MK=$(mktemp -d -p "$WORK")
stubs "$MK"
V=$(node -p "require('$LIB/package.json').version")
(cd "$MK" && printf "$TOOLS\n" mk > package.json && $CLI init >/dev/null 2>&1 \
    && printf '# Guide\n\n<!-- kleros-ui:start 3.10.0 -->\nold block\n  <!-- kleros-ui:end -->\n\nTeam notes.\n' > AGENTS.md \
    && $CLI sync >s1.txt 2>&1 && grep -qx "kleros-ui: block updated to $V" s1.txt && [[ "$(grep -c 'kleros-ui:start' AGENTS.md)" == 1 ]] \
    && ! grep -q 'old block' AGENTS.md && tail -n 1 AGENTS.md | grep -qx 'Team notes.' \
    && printf '# Guide\r\r<!-- kleros-ui:start 3.10.0 -->\rold block\r<!-- kleros-ui:end -->\r\rTeam notes.\r' > AGENTS.md \
    && $CLI sync >s2.txt 2>&1 && grep -qx "kleros-ui: block updated to $V" s2.txt \
    && [[ "$(grep -o 'kleros-ui:start' AGENTS.md | wc -l)" == 1 ]] && ! grep -q 'old block' AGENTS.md && grep -q 'Team notes' AGENTS.md \
    && printf '<!-- kleros-ui:start 3.10.0 -->\nfirst\n<!-- kleros-ui:end -->\n\n<!-- kleros-ui:start 3.10.0 -->\nsecond\n<!-- kleros-ui:end -->\n' > AGENTS.md \
    && $CLI sync >s3.txt 2>&1 && grep -qx "kleros-ui: block updated to $V" s3.txt && head -n 1 AGENTS.md | grep -qx "<!-- kleros-ui:start $V -->" \
    && ! grep -qx 'first' AGENTS.md && grep -qx 'second' AGENTS.md \
    && printf '# Guide\n\n- ```sh\n  yarn install\n  ```\n\n<!-- kleros-ui:start 3.10.0 -->\nold block\n<!-- kleros-ui:end -->\n\n```sh\nyarn dev\n```\n' > AGENTS.md \
    && { $CLI check >c4.txt 2>&1; grep -q "^note: AGENTS.md block is for 3.10.0, installed $V" c4.txt && ! grep -q 'has no kleros-ui block' c4.txt; } \
    && $CLI sync >s4.txt 2>&1 && grep -qx "kleros-ui: block updated to $V" s4.txt && [[ "$(grep -c 'kleros-ui:start' AGENTS.md)" == 1 ]] \
    && ! grep -q 'old block' AGENTS.md && tail -n 1 AGENTS.md | grep -qx '```' \
    && printf '# Guide\n\n- Install:\n- ```sh\n  yarn install\n\n<!-- kleros-ui:start 3.10.0 -->\nold block\n<!-- kleros-ui:end -->\n\n```sh\nyarn dev\n```\n' > AGENTS.md \
    && $CLI sync >s5.txt 2>&1 && grep -qx "kleros-ui: block updated to $V" s5.txt && [[ "$(grep -c 'kleros-ui:start' AGENTS.md)" == 1 ]] && ! grep -q 'old block' AGENTS.md \
    && printf '# Guide\n\n```md\n- a\n  - b\n    ```sh\n    yarn\n    ```\n```\n\n<!-- kleros-ui:start 3.10.0 -->\nold block\n<!-- kleros-ui:end -->\n\n```sh\nyarn dev\n```\n' > AGENTS.md \
    && $CLI sync >s6.txt 2>&1 && grep -qx "kleros-ui: block updated to $V" s6.txt && [[ "$(grep -c 'kleros-ui:start' AGENTS.md)" == 1 ]] && ! grep -q 'old block' AGENTS.md \
    && printf '# Guide\n\n```md\n1. Step\n    ```\n    code\n    ```\n<!-- kleros-ui:start 3.10.0 -->\nquoted example\n<!-- kleros-ui:end -->\n```\n\n<!-- kleros-ui:start 3.10.0 -->\nold block\n<!-- kleros-ui:end -->\n' > AGENTS.md \
    && $CLI sync >s7.txt 2>&1 && grep -qx "kleros-ui: block updated to $V" s7.txt && sed -n 8p AGENTS.md | grep -qx '<!-- kleros-ui:start 3.10.0 -->' \
    && grep -qx 'quoted example' AGENTS.md && ! grep -q 'old block' AGENTS.md) \
  && echo "gate: round 3 (markers): an end marker indented by two spaces and a file with CR-only line endings still end the block, so sync rewrites it in place with no second block; with two complete blocks sync rewrites the first and keeps the second; a fence opened on a list item's line, closed or ended by its item, hides no block, and an indented fence line inside a top-level fence neither hides the block below nor exposes the quoted block inside"
rm -rf "$MK"

# Round 3 (theme-layer): an @import of the library's theme.css under a condition is a css-theme finding, in the entry
# and in a stylesheet that imports tailwindcss itself. layer(components), an anonymous layer or an @layer components
# block puts the library's values in a later layer than the theme file's @layer base, where they beat the theme's, so
# the theme was undone with 0 findings. The plain import, as the starter, the README and AGENTS.md write it, is no
# finding, in the entry and in a tw.css that the entry reaches before the theme file (the nested-entry gate's o8).
TL=$(mktemp -d -p "$WORK")
stubs "$TL"
LT=@kleros/ui-components-library/theme.css
# The README's Setup b block and AGENTS.md's block for an app with no Tailwind, as written there, with the line theme adds.
block() { awk -v from="$2" 'index($0, from) == 1 {f = 1} f && /^   ```css$/ {g = 1; next} g && /^   ```$/ {exit} g {sub(/^   /, ""); print}' "$1" | sed "\\#^@import \"$LT\";\$#a @import \"./theme.css\";"; }
# One layout with the condition: its finding at $1 with the condition $2, the only one, and check's css step fails on it.
cond() { ! $CLI css >o.txt 2>&1 && grep -qF "$1 @import \"$LT\" $2: import the library's theme.css at the top level, plainly, without a layer, media or supports condition, as the guide writes it" o.txt \
  && grep -qx 'css: 1 finding (0 token overrides, 0 colour literals, 0 Tailwind-only, 0 !important, 0 library internals, 1 theme) in 4 files scanned' o.txt \
  && ! $CLI check >c.txt 2>&1 && grep -qF "  $1 @import \"$LT\" $2: import" c.txt && grep -q '^ui:check failed (tsc ok, lint ok, css failed' c.txt; }
(cd "$TL" && printf "$TOOLS\n" tl > package.json && mkdir src && cp "$LIB/templates/poc/src/index.css" src/index.css \
  && printf 'import "@kleros/ui-components-library/style.css";\nimport "./index.css";\n' > src/main.tsx \
  && $CLI init >/dev/null && $CLI theme >/dev/null && grep -qx '@import "./theme.css";' src/index.css \
  && $CLI css >o1.txt 2>&1 && grep -q '^css: 0 findings' o1.txt && $CLI check >c1.txt 2>&1 && grep -qx 'ui:check passed' c1.txt \
  && block "$LIB/README.md" '   b. Your Tailwind entry' > src/index.css && [[ "$(grep -c '^@import' src/index.css)" == "3" ]] \
  && $CLI css >o2.txt 2>&1 && grep -q '^css: 0 findings' o2.txt \
  && block "$LIB/agent/AGENTS.md" '3. Create `src/index.css` with the starter' > src/index.css && [[ "$(grep -c '^@import' src/index.css)" == "3" ]] \
  && $CLI css >o3.txt 2>&1 && grep -q '^css: 0 findings' o3.txt \
  && cp "$LIB/templates/poc/src/index.css" src/index.css && sed -i "\\#^@import \"$LT\";\$#a @import \"./theme.css\";" src/index.css \
  && sed -i 's|^@import "tailwindcss";$|@import "./mid.css";|' src/index.css && echo '@import "./tw.css";' > src/mid.css \
  && printf '@import "tailwindcss";\n@import "%s";\n' "$LT" > src/tw.css && $CLI css >o4.txt 2>&1 && grep -q '^css: 0 findings' o4.txt \
  && printf '@import "tailwindcss";\n@import "%s" theme(static);\n' "$LT" > src/tw.css && $CLI css >o5.txt 2>&1 && grep -q '^css: 0 findings' o5.txt \
  && printf '@import "tailwindcss";\n@import "%s" layer(components);\n' "$LT" > src/tw.css && cond src/tw.css:2:1 'layer(components)' \
  && printf '@import "tailwindcss";\n@import "%s" layer;\n' "$LT" > src/tw.css && cond src/tw.css:2:1 layer \
  && printf '@import "tailwindcss";\n@layer components {\n  @import "%s";\n}\n' "$LT" > src/tw.css && cond src/tw.css:3:3 'inside @layer components' \
  && printf '@import "tailwindcss";\n@import "%s" supports(display: grid);\n' "$LT" > src/tw.css && cond src/tw.css:2:1 'supports(display: grid)' \
  && echo '@import "tailwindcss";' > src/tw.css && sed -i "s|^@import \"$LT\";\$|@import \"$LT\" layer(components);|" src/index.css \
  && cond src/index.css:2:1 'layer(components)') \
  && echo "gate: round 3 (theme-layer): an @import of the library's theme.css under layer(components), an anonymous layer or an @layer components block, in a tw.css that imports tailwindcss or in the entry itself, is a css-theme finding and check fails, so the theme is no longer undone with 0 findings; the plain import of the starter, the README and AGENTS.md, the guide's nested tw.css, and Tailwind's theme(static) option give none"
rm -rf "$TL"

# Round 3 (app-config-preflight): in a package that is not "type": "module", init moves the app config a managed wrap
# imports, eslint.config.app.js, to eslint.config.app.mjs (ESM syntax) or .cjs (CommonJS). With a file already there,
# init refuses before its first write, with the message it gave after writing AGENTS.md, the pointers, kleros-ui.json
# and package.json, whether the wrap moves too (eslint.config.js) or stays (eslint.config.mjs), and nothing is
# written; with none there, it moves the app config as before.
ACP=$(mktemp -d -p "$WORK")
mkdir "$ACP/js" "$ACP/mjs"
for d in js mjs; do echo '{"name":"x","scripts":{}}' > "$ACP/$d/package.json"; done
printf '%s\nimport app from "./eslint.config.app.js";\nimport klerosUI from "@kleros/ui-components-library/eslint";\n\nexport default [...[await app].flat(), ...klerosUI({ cssEntry: "src/index.css" })];\n' \
  "// Managed by kleros-ui init: the app's previous config plus the Kleros UI preset." | tee "$ACP/js/eslint.config.js" > "$ACP/mjs/eslint.config.mjs"
echo 'export default [];' > "$ACP/js/eslint.config.app.js"
echo 'export default [{ rules: { "no-console": "error" } }];' > "$ACP/js/eslint.config.app.mjs"
echo 'module.exports = [];' > "$ACP/mjs/eslint.config.app.js"
echo 'module.exports = [{ rules: { "no-console": "error" } }];' > "$ACP/mjs/eslint.config.app.cjs"
SJS=$(snapshot "$ACP/js"); SMJS=$(snapshot "$ACP/mjs")
(cd "$ACP/js" && { $CLI init >"$ACP/o1.txt" 2>&1; [[ $? -eq 1 ]]; }) && [[ "$(snapshot "$ACP/js")" == "$SJS" ]] \
  && grep -qF 'kleros-ui: eslint.config.app.mjs is already there, and init would move eslint.config.app.js there (this package is not "type": "module", so ESLint reads .js here as CommonJS), which would write over it.' "$ACP/o1.txt" \
  && (cd "$ACP/mjs" && { $CLI init >"$ACP/o2.txt" 2>&1; [[ $? -eq 1 ]]; }) && [[ "$(snapshot "$ACP/mjs")" == "$SMJS" ]] \
  && grep -qF 'kleros-ui: eslint.config.app.cjs is already there, and init would move eslint.config.app.js there' "$ACP/o2.txt" \
  && rm "$ACP/js/eslint.config.app.mjs" && ln -s gone.mjs "$ACP/js/eslint.config.app.mjs" && SJS=$(snapshot "$ACP/js") \
  && (cd "$ACP/js" && { $CLI init >"$ACP/o5.txt" 2>&1; [[ $? -eq 1 ]]; }) && [[ "$(snapshot "$ACP/js")" == "$SJS" ]] \
  && grep -qF 'kleros-ui: eslint.config.app.mjs is already there, and init would move eslint.config.app.js there' "$ACP/o5.txt" \
  && rm "$ACP/js/eslint.config.app.mjs" "$ACP/mjs/eslint.config.app.cjs" \
  && (cd "$ACP/js" && $CLI init >"$ACP/o3.txt") \
  && grep -q '^kleros-ui: rewrote the managed eslint.config.js: moved it to eslint.config.mjs, moved eslint.config.app.js to eslint.config.app.mjs' "$ACP/o3.txt" \
  && [[ ! -e "$ACP/js/eslint.config.js" ]] && [[ ! -e "$ACP/js/eslint.config.app.js" ]] && grep -qx 'export default \[\];' "$ACP/js/eslint.config.app.mjs" \
  && grep -q '^import app from "./eslint.config.app.mjs";' "$ACP/js/eslint.config.mjs" \
  && (cd "$ACP/mjs" && $CLI init >"$ACP/o4.txt") \
  && grep -q '^kleros-ui: rewrote the managed eslint.config.mjs: moved eslint.config.app.js to eslint.config.app.cjs' "$ACP/o4.txt" \
  && [[ ! -e "$ACP/mjs/eslint.config.app.js" ]] && grep -qx 'module.exports = \[\];' "$ACP/mjs/eslint.config.app.cjs" \
  && grep -q '^import app from "./eslint.config.app.cjs";' "$ACP/mjs/eslint.config.mjs" \
  && echo "gate: round 3 app-config-preflight: init refuses, before its first write, to move a managed wrap's eslint.config.app.js onto an eslint.config.app.mjs or .cjs that is there (a package that is not \"type\": \"module\"; the wrap eslint.config.js or .mjs), and moves it as before when there is none"
rm -rf "$ACP"

# Round 3 (html-comments): an HTML comment in index.html ends where a browser (and parse5) ends it, at the next --> or
# --!>, or at once in `<!-->` and `<!--->`, so a <style> block after `<!-->`, `<!--->` or `<!-- x --!>`, and a style
# attribute after `<!-- y --!>`, are findings (a "-->" line after each ends what the old reading took for the comment);
# a <style> inside `<!-- ... -->` is still not one, nor is one after `<!--!>`, which does not end a comment, and a <style>
# after `<!-- a -- b -->` still is.
HC=$(mktemp -d -p "$WORK")
(cd "$HC" && printf '%s\n' '<!doctype html>' '<!--><style>a { margin: 0; }</style>' '-->' '<!---><style>b { margin: 0; }</style>' '-->' \
    '<!-- x --!><style>c { margin: 0; }</style>' '-->' '<!-- y --!><p style="color: red">x</p>' '-->' \
    '<!-- <style>d { margin: 0; }</style> -->' '<!-- a -- b --><style>e { margin: 0; }</style>' '<!--!><style>f { margin: 0; }</style>' '-->' > index.html \
  && { $CLI css index.html >o.txt; [[ $? -eq 1 ]]; } \
  && grep -q '^index.html:2:6 <style> block in index.html' o.txt && grep -q '^index.html:4:7 <style> block in index.html' o.txt \
  && grep -q '^index.html:6:12 <style> block in index.html' o.txt && grep -q '^index.html:8:15 style attribute on <p> in index.html' o.txt \
  && grep -q '^index.html:11:16 <style> block in index.html' o.txt && [[ "$(grep -c '^index.html:' o.txt)" == "5" ]]) \
  && echo "gate: round 3 html-comments: an HTML comment in index.html ends where a browser ends it (at --> or --!>, or at once in <!--> and <!--->), so a <style> block after <!-->, <!---> or <!-- x --!> and a style attribute after --!> are findings; a <style> inside <!-- ... --> is still not one, and one after <!-- a -- b --> still is"
rm -rf "$HC"

# F29 (team review, What to change 3.5): LIB_NAMES, the core names the lint preset's library-name rule reports, is a
# hand-typed copy of the package's exports. Both sides are read from the pack, as an app gets them: the components are
# the root entry's runtime exports with a PascalCase name (types are gone at runtime, and cn is a helper), and the names
# are the rule's, as the preset builds it (gate/kit-names.mjs reads KIT_NAMES the same way). Every exported component is
# in the rule, and the rule names nothing that is neither a core export nor a kit component in the catalogue. Run in
# this repo's ESLint, the rule reports a local component with such a name, and not a lazy() or dynamic() wrapper that
# loads one (Escrow V2 and Curate V2 load the library's own FileViewer so) or a declaration with no value. As the smoke
# render notes, the root entry imports its CSS and touches document and window at import time, so the CSS is stubbed and
# happy-dom gives it a DOM.
LN=$(mktemp -d -p "$WORK")
cat > "$LN/lib-names.mjs" <<'EOF'
import { readFileSync } from "node:fs";
import { createRequire, register } from "node:module";
import { pathToFileURL } from "node:url";
const [lib, p, from] = process.argv.slice(2);
register(pathToFileURL(`${p}/gate/css-stub-loader.mjs`));
const { GlobalRegistrator } = await import("@happy-dom/global-registrator");
GlobalRegistrator.register({ url: "http://localhost/" });
const entry = JSON.parse(readFileSync(`${lib}/package.json`, "utf8")).exports["."].import;
const core = Object.keys(await import(pathToFileURL(`${lib}/${entry}`).href)).filter((n) => /^[A-Z]/.test(n));
const kit = JSON.parse(readFileSync(`${lib}/agent/catalog.json`, "utf8")).components
  .filter((c) => c.importPath.endsWith("/kit") && /^[A-Z]/.test(c.name)).map((c) => c.name);
const { default: klerosUI } = await import(pathToFileURL(`${lib}/eslint/index.mjs`).href);
const rule = klerosUI({}).flatMap((c) => Object.entries(c.rules ?? {})).filter(([id]) => id.endsWith("no-restricted-syntax"))
  .flatMap(([, options]) => options.slice(1)).find((r) => r.message?.startsWith("Local component with a library name"));
const names = new Set(rule?.selector.match(/\[id\.name=\/\^\(([^)]*)\)\$\/\]/)?.[1].split("|") ?? []);
const missing = core.filter((n) => !names.has(n));
const extra = [...names].filter((n) => !core.includes(n) && !kit.includes(n));
if (missing.length) console.log(`exported, not in LIB_NAMES: ${missing.join(", ")}`);
if (extra.length) console.log(`in the rule, neither a core export nor a kit component: ${extra.join(", ")}`);
console.log(`${core.length} core components, ${kit.length} kit components, ${names.size} names in the rule`);
// [code, the lines the rule reports in it]
const cases = [
  ["function Form() { return null; }\nconst Slider = () => null;\nconst DraggableList = memo(() => null);\n", [1, 2, 3]],
  ['const FileViewer = lazy(() => import("@kleros/ui-components-library").then((m) => ({ default: m.FileViewer })));\n', []],
  ['const Slider = React.lazy(() => import("./Slider"));\nconst Form = dynamic(() => import("./Form"));\nlet BigNumberField;\n', []],
];
const { Linter } = createRequire(from + "/")("eslint");
const linter = new Linter({ configType: "flat", cwd: "/app" });
const config = [{ files: ["**/*.js"], rules: { "no-restricted-syntax": ["error", rule] } }];
let bad = 0;
for (const [code, want] of cases) {
  const got = linter.verify(code, config, { filename: "/app/src/x.js" }).map((m) => (m.ruleId ? m.line : m.message));
  if (JSON.stringify(got) !== JSON.stringify(want)) {
    bad++;
    console.log(`reported ${JSON.stringify(got)}, expected ${JSON.stringify(want)}, in:\n${code}`);
  }
}
process.exit(!core.length || !kit.length || missing.length || extra.length || bad ? 1 : 0);
EOF
node "$LN/lib-names.mjs" "$LIB" "$P" "$(cd "$P/tools" && pwd -P)" >"$LN/out.txt" 2>"$LN/err.txt" \
  && echo "gate: F29 (team review 3.5): the lint preset's LIB_NAMES names every component the packed root entry exports, the library-name rule names nothing that is neither a core export nor a kit component in the catalogue, and in this repo's ESLint it reports a local component with such a name but not a lazy() or dynamic() wrapper or a declaration with no value"
rm -rf "$LN"

# Review of the whole PR (CodeRabbit c06 follow-up): the whole-app scan reads the configured entry wherever cssDirs
# points, and with it the local stylesheets the entry reaches tailwindcss through. So a nested entry (src/index.css
# importing ./tw.css, which imports tailwindcss) gives no finding with cssDirs ["app"] (an empty folder here: any other
# stylesheet is a Tailwind-only finding of its own), as it gives none with src in the scan, and check passes. A
# stylesheet on the way in a folder a .gitignore line names stays unread, so the entry's import of it is still the one
# finding.
NE=$(mktemp -d -p "$WORK")
stubs "$NE"
(cd "$NE" && printf "$TOOLS\n" ne > package.json && mkdir src app && cp "$LIB/templates/poc/src/index.css" src/index.css \
  && printf 'import "@kleros/ui-components-library/style.css";\nimport "./index.css";\n' > src/main.tsx && $CLI init >/dev/null \
  && sed -i 's|^@import "tailwindcss";$|@import "./tw.css";|' src/index.css && grep -qx '@import "./tw.css";' src/index.css \
  && echo '@import "tailwindcss";' > src/tw.css \
  && $CLI css >o1.txt 2>&1 && grep -q '^css: 0 findings' o1.txt \
  && node -e 'const fs = require("fs"); const j = JSON.parse(fs.readFileSync("kleros-ui.json", "utf8")); j.cssDirs = ["app"]; fs.writeFileSync("kleros-ui.json", JSON.stringify(j, null, 2))' \
  && $CLI css >o2.txt 2>&1 && grep -q '^css: 0 findings' o2.txt && $CLI check >c.txt 2>&1 && grep -qx 'ui:check passed' c.txt \
  && mkdir src/gen && printf '@import "tailwindcss";\n.generated { color: red; }\n' > src/gen/tw.css && echo gen/ > .gitignore \
  && sed -i 's|^@import "./tw.css";$|@import "./gen/tw.css";|' src/index.css && { $CLI css >o3.txt 2>&1; [[ $? -eq 1 ]]; } \
  && grep -q '^src/index.css:[0-9]*:[0-9]* @import "./gen/tw.css" in the Tailwind entry' o3.txt && grep -q '^css: 1 finding' o3.txt) \
  && echo "gate: review of the whole PR (c06): with cssDirs [\"app\"], the scan reads the entry src/index.css and the ./tw.css it reaches tailwindcss through, so that nested entry gives 0 findings and check passes"
rm -rf "$NE"
