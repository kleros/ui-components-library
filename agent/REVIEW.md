# Reviewing a pull request in an app on @kleros/ui-components-library

Nothing stops a setup written by hand: there is no install gate, so the review does it. Go through this list on every
pull request that touches UI. Each "no" is a change to request; the fix is under each part. The commands compare the
branch with `main`: use the pull request's base branch if it is another.

## 1. The setup was made by `create` or `init`, not by hand
- `package.json` has `"ui:check": "kleros-ui check"` and `"ui:baseline": "kleros-ui baseline"`. In an app `create`
  made, the build runs the check first: `"build": "kleros-ui check --build && vite build"`, or a `prebuild` of
  `kleros-ui check --build` when the app kept its own build.
- `kleros-ui.json` is at the app root, with `cssEntry` and `components` (and `theme` when the app has a theme, `lintDirs` when it lints folders other than `src/`).
- The lint config. An existing app keeps its own `eslint.config.*`; init writes `kleros-ui.eslint.config.mjs` (`.mts`
  for a `.ts` or `.mts` config). It starts with `// Written by kleros-ui init:`, imports the app's config as `app` and
  adds `klerosUI(...)` from `@kleros/ui-components-library/eslint`. `ui:check` and `ui:baseline` lint with it
  (`eslint -c`), and the app's own lint does not, so the app's existing code passes there as before. In an app `create`
  made, the `eslint.config.*` ESLint loads (`.js` or `.mjs`) starts with `// Managed by kleros-ui init:` and imports
  the starter's config from `eslint.config.app.*`. A `.cts` config is wired by hand, as init prints.
- The JS entry (`src/main.tsx` in the starter; in an existing app, the file that imports its CSS, such as Court's
  `src/app.tsx`) imports `@kleros/ui-components-library/style.css` first, then the Tailwind entry (`./index.css`).
- The Tailwind entry (`"cssEntry"` in `kleros-ui.json`; `src/index.css` in a new app) is the starter's four lines: the `tailwindcss` import, the library's
  `theme.css` import, `@source` and the `dark` variant. `create` writes them in a new app; an existing app writes the
  same four by hand (`agent/AGENTS.md`, "Existing apps": "It has Tailwind" step 1, or step 3 without Tailwind), where `@source` is the library's folder as seen from
  the entry: `../../node_modules/@kleros/ui-components-library` in a workspace that hoists it, as Court's does. Plus
  `@import "./theme.css";` right after the library's `theme.css` import when the app has a theme. Nothing else in a
  new app. In an existing app, the CSS the entry had before `init` stays (`agent/AGENTS.md`, "Styling: Tailwind
  only"): ask only about CSS the pull request adds to it.

Fix: a new app is made with `npx -p @kleros/ui-components-library kleros-ui create`. An existing app runs `npx -p @kleros/ui-components-library kleros-ui init` once, follows the
`agent/AGENTS.md` "Existing apps" steps, then runs `npm run ui:baseline`.

## 2. `ui:check` passes
- `ui:check` runs the branch's own code, which part 1 does not read: its `package.json` scripts (a `preui:check` hook
  runs first), the package manager's files (`.npmrc`, and `.yarnrc.yml` with the Yarn release it names), its ESLint
  configs and every file they import, and the files its Tailwind entry's `@plugin` and `@config` lines name. On a pull
  request from outside the team, run the check in a CI job that has no secrets (on GitHub, a `pull_request` job, not
  `pull_request_target`) or in a throwaway container. To run it on your own machine, first read every changed file
  outside the app's `src` (`git diff --name-only main...HEAD`), the Tailwind entry's diff, and each file a changed
  config or `@plugin` line imports: no one diff command shows them all.
- Run `npm run ui:check` on the branch. It ends with `ui:check passed`.
- The app's CI runs `npm run ui:check` after the install on every pull request, so this part does not rest on the
  review alone: `kleros-ui check` exits 1 when it fails.
- In an existing app, `kleros-ui-baseline.json` does not grow. A re-recorded baseline hides new findings: ask why.

Fix: what each message names. Lint and CSS messages name the token or component to use.

## 3. Tokens are redefined only in the theme file
- No `--klerosUIComponents*` or `--color-klerosUIComponents*` value is set outside the file that `kleros-ui.json`
  names under `"theme"` (default `src/theme.css`). `ui:check` finds one in a stylesheet; one set from code (a `style`
  object or `style.setProperty`) or by a class (`[--klerosUIComponentsPrimaryBlue:...]`) only the review finds.
- Run this in the app's folder (where `kleros-ui.json` is). It reads the theme path from `kleros-ui.json` and leaves
  that one file out, taking the path literally, so a pattern such as `src/**` there hides nothing; a value that is not
  a file in the repository (a folder, or a path outside it) falls back to `src/theme.css`. It lists every added
  line that names a token other than inside `var()` or Tailwind's `bg-(--...)` form, as a line that sets one does. It
  also lists a comment or a `getPropertyValue` read that names one: those are fine. A name built in code
  (`"--" + name`) it cannot see:
  ```sh
  theme=$(node -p 'require("./kleros-ui.json").theme || ""')
  [ -f "$theme" ] && git ls-files --error-unmatch -- ":(literal)$theme" >/dev/null 2>&1 || theme=src/theme.css
  git diff main...HEAD -- . ":(exclude,literal)$theme" | awk '/^\+/ { s = $0; gsub(/(var\([[:space:]]*|-\()--(color-)?klerosUIComponents[A-Za-z]+/, "", s); if (s ~ /--(color-)?klerosUIComponents/) print }'
  ```
- A change to the theme file says its contrast was checked, in light and in dark (4.5:1 for text).

Fix: move the value into the theme file, and run `npx -p @kleros/ui-components-library kleros-ui theme` first if the app has none (`agent/AGENTS.md`,
"Themes").

## 4. New components are registered with intent words
- Each new folder or `.tsx` file under `src/components/` has an entry in `kleros-ui.json` `components`, with
  `"intent"` words that someone would search for. `ui:check` fails on a missing entry but only notes empty intent
  words, so this part is the review's.
- A piece shown in two or more places is one named component, used in each place, not copied markup.

Fix: `npx -p @kleros/ui-components-library kleros-ui new <Name> --kind ui|data|form --intent "words"`, or fill the entry's `intent` array.

## 5. No raw controls
- New code uses the library's parts, not `<button>`, `<input>`, `<select>`, `<textarea>`, `<dialog>`, `<progress>` or
  `<table>`: `Button`; `TextField`, `Searchbar`, `Checkbox` or `Radio`; `DropdownSelect`; `TextArea`; `Modal`;
  `LinearProgress`; kit `DataTable`. The lint reports each one (`kleros-ui/no-restricted-syntax`), so look for an
  `eslint-disable` comment that switches it off. This lists the added lines with one:
  ```sh
  git diff main...HEAD -- '*.tsx' '*.jsx' | grep -E '^\+.*<(button|input|select|textarea|dialog|progress|table)([[:space:]/>]|$)'
  ```
- An added `eslint-disable` comment, or a `/* eslint <rule>: "off" */` one, can switch off any rule, not only these,
  and `ui:check` passes with it. This lists every one the branch adds; ask why for each:
  ```sh
  git diff main...HEAD -- src | grep -E '^\+.*(eslint-(disable|enable)|/\*[[:space:]]*eslint([[:space:]]|$))'
  ```

Fix: the component the lint message names (`agent/CATALOG.md` lists them all).
