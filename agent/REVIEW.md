# Reviewing a pull request in an app on @kleros/ui-components-library

Nothing stops a setup written by hand: there is no install gate, so the review does it. Go through this list on every
pull request that touches UI. Each "no" is a change to request; the fix is under each part. The commands compare the
branch with `main`: use the pull request's base branch if it is another.

## 1. The setup was made by `create` or `init`, not by hand
- `package.json` has `"ui:check": "kleros-ui check"` and `"ui:baseline": "kleros-ui baseline"`. In an app `create`
  made, the build runs the check first: `"build": "kleros-ui check --build && vite build"`, or a `prebuild` of
  `kleros-ui check --build` when the app kept its own build.
- `kleros-ui.json` is at the app root, with `cssEntry` and `components` (and `theme` when the app has a theme).
- The lint config is the managed one: the `eslint.config.*` ESLint loads (`.js` or `.mjs`, or the `.ts` or `.mts`
  name a TypeScript config had) starts with `// Managed by kleros-ui init:` and adds `klerosUI(...)` from
  `@kleros/ui-components-library/eslint` after the app's own config. The app's own rules live in the file it imports,
  not in this one. A `.cts` config is wired by hand, as init prints.
- The JS entry (`src/main.tsx` in the starter; in an existing app, the file that imports its CSS, such as Court's
  `src/app.tsx`) imports `@kleros/ui-components-library/style.css` first, then the Tailwind entry (`./index.css`).
- The Tailwind entry (`src/index.css`) is the starter's four lines: the `tailwindcss` import, the library's
  `theme.css` import, `@source` and the `dark` variant. `create` writes them in a new app; an existing app writes the
  same four by hand (`agent/AGENTS.md`, "Existing apps": "It has Tailwind" step 1, or step 3 without Tailwind), where `@source` is the library's folder as seen from
  the entry: `../../node_modules/@kleros/ui-components-library` in a workspace that hoists it, as Court's does. Plus
  `@import "./theme.css";` right after the library's `theme.css` import when the app has a theme. Nothing else.

Fix: a new app is made with `npx kleros-ui create`. An existing app runs `npx kleros-ui init` once, follows the
`agent/AGENTS.md` "Existing apps" steps, then runs `npm run ui:baseline`.

## 2. `ui:check` passes
- Run `npm run ui:check` on the branch. It ends with `ui:check passed`.
- In an existing app, `kleros-ui-baseline.json` does not grow. A re-recorded baseline hides new findings: ask why.

Fix: what each message names. Lint and CSS messages name the token or component to use.

## 3. Tokens are redefined only in the theme file
- No `--klerosUIComponents*` or `--color-klerosUIComponents*` value is set outside the file that `kleros-ui.json`
  names under `"theme"` (default `src/theme.css`). `ui:check` finds one in a stylesheet; one set from code (a `style`
  object or `style.setProperty`) or by a class (`[--klerosUIComponentsPrimaryBlue:...]`) only the review finds.
- Run this in the app's folder (where `kleros-ui.json` is; the path after `:!` is from there, so put your theme path
  in it). It lists every added line that names a token other than inside `var()` or Tailwind's `bg-(--...)` form, as a
  line that sets one does. It also lists a comment or a `getPropertyValue` read that names one: those are fine. A name
  built in code (`"--" + name`) it cannot see:
  ```sh
  git diff main...HEAD -- . ':!src/theme.css' | awk '/^\+/ { s = $0; gsub(/(var\([[:space:]]*|-\()--(color-)?klerosUIComponents[A-Za-z]+/, "", s); if (s ~ /--(color-)?klerosUIComponents/) print }'
  ```
- A change to the theme file says its contrast was checked, in light and in dark (4.5:1 for text).

Fix: move the value into the theme file, and run `npx kleros-ui theme` first if the app has none (`agent/AGENTS.md`,
"Themes").

## 4. New components are registered with intent words
- Each new folder or `.tsx` file under `src/components/` has an entry in `kleros-ui.json` `components`, with
  `"intent"` words that someone would search for. `ui:check` fails on a missing entry but only notes empty intent
  words, so this part is the review's.
- A piece shown in two or more places is one named component, used in each place, not copied markup.

Fix: `npx kleros-ui new <Name> --kind ui|data|form --intent "words"`, or fill the entry's `intent` array.

## 5. No raw controls
- New code uses the library's parts, not `<button>`, `<input>`, `<select>`, `<textarea>`, `<dialog>`, `<progress>` or
  `<table>`: `Button`; `TextField`, `Searchbar`, `Checkbox` or `Radio`; `DropdownSelect`; `TextArea`; `Modal`;
  `LinearProgress`; kit `DataTable`. The lint reports each one (`kleros-ui/no-restricted-syntax`), so look for an
  `eslint-disable` comment that switches it off. This lists the added lines with one:
  ```sh
  git diff main...HEAD -- '*.tsx' '*.jsx' | grep -E '^\+.*<(button|input|select|textarea|dialog|progress|table)([[:space:]/>]|$)'
  ```

Fix: the component the lint message names (`agent/CATALOG.md` lists them all).
