# Agent guide: @kleros/ui-components-library

This file ships inside the package (`agent/AGENTS.md`), so it matches the code in `node_modules`. Trust it over memory: most
public code is the old v2 API. Setup: `create` writes it for a new app; an existing app follows "Existing apps" below.

## Start
- New app: `npx -p @kleros/ui-components-library kleros-ui create my-app`. From a tarball, in the new folder:
  `echo '{}' > package.json`, `npm install ./x.tgz`, then `npx kleros-ui create .`. The empty package.json keeps npm
  in this folder: without one, npm installs into the nearest folder above that has one and changes that project.
  `create` copies the starter (Vite, React 18, Tailwind 4, ESLint), installs it and runs `init`. Don't write the setup
  by hand.
- Existing app: `npx kleros-ui init` once, then the steps in "Existing apps" below, then `npm run ui:baseline`.
- React 18 only: React 19 is not supported yet and renders a blank page.

## Workflow (every UI task)
1. Look the piece up in `agent/CATALOG.md` (core, kit and known gaps) and in your app's `kleros-ui.json`. Import
   what is there, build from the listed parts, or add it (step 2).
2. MISSING, or a piece you show in two or more places (a COMPOSE included): make it one named component with
   `npx kleros-ui new <Name> --kind ui|data|form --intent "words"`, and use that component in each place. Don't copy
   the markup. `--intent` takes what someone would search for, comma-separated
   (`--intent "period badge, status chip"`), and puts it in the component's `kleros-ui.json` entry; `ui:check` notes
   an entry with no intent words. `new` writes `src/components/<Name>/` with an exported `<Name>Props`, an `index.ts`
   and that entry, plus stories (Default, Dark, states) only when the app has Storybook. Without Storybook, write no
   stories. Without the CLI, `agent/NEW-COMPONENT.md` lists the same steps by hand. Build it from library parts and
   tokens (`agent/LOOK.md`).
3. Done = `npm run ui:check` (tsc, lint, the app's CSS, setup checks; a stories file only in an app with Storybook).
   Lint messages name the token or component to use. In an app `create` made, the build runs `kleros-ui check --build`
   first: the same checks with no baseline, where a needed `sync` or a missing agent block is only a note. When the
   app had its own build and prebuild, `create` kept both and printed whether they run it; Yarn 2+ and
   `--ignore-scripts` skip a prebuild. Done is still `npm run ui:check`.
4. Never invent tokens, a palette or a spacing value. Redefine a library token only in the app's theme file, which
   `npx kleros-ui theme` sets up ("Themes" below). If the scale lacks what you need, say so in your summary.

## Styling: Tailwind only
This holds for every app, new or existing, Court included.
- Style with Tailwind utility classes in `className`, the kit's layout parts and the library's components.
- The app's CSS is its Tailwind entry, `src/index.css`, as `create` writes it (the Tailwind import, the library
  theme, `@source`, the `dark` variant), and at most one theme file, which `npx kleros-ui theme` writes and imports
  ("Themes" below). Add no rules, other imports or local plugins to the entry. Write no other stylesheet
  (`.css`, `.scss`, `.pcss` or any other, in `src/`, `public/` or elsewhere), no `<style>` block, stylesheet link or
  `style` attribute in `index.html`, no CSS modules, and no styled-components or other CSS-in-JS (emotion, goober,
  stitches, vanilla-extract, styled-jsx).
- The page's background, text colour and colour scheme are classes on `<html>` and `<body>` in `index.html`, as the
  starter has them. Not CSS.
- Inline `style` only for a size computed at runtime (a bar's width from data), never for colour, spacing or type.
- A library component that will not take the look you need through `className` (or its `inputProps`): leave it, and
  say so in your summary. Don't override it from CSS (no `!important`, no selectors into its parts).
- An existing app's styled-components code and CSS stay until a ticket is about that file. `npm run ui:baseline`
  records each styled-components use and each CSS rule per file, so `ui:check` fails only new ones, a new styled
  component or CSS rule in an old file included.

## Themes
An app with colours of its own sets new values for the library's tokens in one theme file. The app's code keeps the
same `klerosUIComponents*` classes, and the library's components follow the new values too. Light and dark mode are
still the `dark` class on `<html>`.

Set it up once, in the app root, with `npx kleros-ui theme` (after `create` or `init`). It writes `src/theme.css`, with
each library token and its value as a commented line (light in `:root`, dark in `:root.dark`), sets `"theme"` in
`kleros-ui.json`, imports the file in the Tailwind entry, and prints what it did. Don't write these by hand. When the
file already exists, it refuses and writes nothing: edit that file (and add the key and the import its message names,
when `kleros-ui.json` does not name the file yet). To change a token, uncomment its line and set the value. Any value
works here, a hex included:
```css
@layer base {
  :root {
    --klerosUIComponentsPrimaryBlue: #0055aa;
  }
  :root.dark {
    --klerosUIComponentsPrimaryBlue: #66bbff;
  }
}
```
- A token set only on `:root` keeps the library's dark value in dark mode. Set it on `:root.dark` too when dark
  should change.
- Contrast is the app's to check, in light and in dark: text needs 4.5:1 against its background (WCAG AA). The
  library's own light theme already fails that in places (kleros/ui-components-library#120: SecondaryText,
  PrimaryBlue text, white on PrimaryBlue, Success, Warning), and a theme can fix or worsen it.
- One theme per app, for the whole page. No theme for one section: the token classes read Tailwind's
  `--color-klerosUIComponents*` alias, which is computed once at `:root`, so a token set on another selector does not
  reach the app's classes.

In the theme file, `ui:check` and the build fail on each of these:
- a token name that the library's `theme.css` does not define (the file's comments list every name);
- `--color-klerosUIComponents*`, Tailwind's alias: set the base token (`--klerosUIComponentsPrimaryBlue`) instead;
- a plain CSS property (`color`, `font-family`, ...), `!important`, or any other at-rule (`@media`, `@import`, ...);
- a selector other than `:root` and `:root.dark`: a bare `.dark` loses to the library's `:root.dark`;
- a rule outside `@layer base`: there it beats the library's dark values, so the light value leaks into dark mode.

Anywhere else (`src/index.css`, any other stylesheet), redefining a token fails, and the message names the theme file
and `npx kleros-ui theme`. A theme file that `kleros-ui.json` does not name under `"theme"` is just another
stylesheet, and fails as one. Don't set a token from code either (a `style` object or `style.setProperty`), or from a
class (`[--klerosUIComponentsPrimaryBlue:var(--klerosUIComponentsSecondaryBlue)]`): no check sees these, and the
reviewer's checklist (`agent/REVIEW.md`) looks for them.

## Existing apps
Run `npx kleros-ui init` once, follow the part below that fits the app, then run `npm run ui:baseline` and
`npm run ui:check`. The app "has Tailwind" when `tailwindcss` is in its `dependencies` or `devDependencies`.
Tailwind 3 or 4.0: move to 4.1.17 or later first (`tailwindcss` and `@tailwindcss/vite`): the library's `theme.css` is
Tailwind 4, and before 4.1 an `@source` on the library's folder scans none of it. TypeScript: with
`"moduleResolution": "node"`, set `"esModuleInterop": true`, or the core's types lose their React props (`<Card>`
takes no `children`); `node16` and `nodenext` are not supported (the core's types use paths without extensions). The
starter uses `bundler`.

**It has Tailwind.** One change, in the JS entry (`src/main.tsx`): import the library's compiled CSS before the app's own.
```ts
import "@kleros/ui-components-library/style.css"; // first
import "./index.css"; // then the app's Tailwind
```
- The library's JS imports this same file. Without the line above, it lands after the app's Tailwind, and its plain
  classes (`flex-col`, `hidden`, `px-4`) beat the app's `sm:`, `lg:` and `@sm:` ones: kit `KeyValueList` never shows
  two columns, and `Page` keeps its phone gutters on a desktop.
- Not as an `@import` in `index.css`: that inlines one copy into your CSS, and the library's own JS import still
  appends another after yours, which wins.

**It has no Tailwind yet (Court's web app).** Add Tailwind 4, then write new UI with Tailwind only.
1. `npm install -D tailwindcss@^4.1.17 @tailwindcss/vite@^4.1.17 eslint-plugin-better-tailwindcss@^4.10.0` (in a Yarn
   workspace, `yarn add -D` the same). These are the starter's versions. The last one runs the lint's class rules.
2. In the Vite config, `import tailwindcss from "@tailwindcss/vite";` and add `tailwindcss()` to `plugins`.
3. Create `src/index.css` with the starter's four lines. `@source` is the library's folder as seen from this file.
   Court's Yarn workspace hoists the library to the repo root (`web/node_modules/@kleros` has no
   `ui-components-library`), so from `web/src` it is `../../node_modules/...`, as below. In a single package, where
   the library is in the app's own `node_modules`, it is `../node_modules/...`, as the starter has it. A wrong path
   builds with no error and leaves out every kit layout class. `npm run ui:check` runs the app's own Tailwind on this
   file and names each kit file it does not scan (only a note when it cannot run that Tailwind, or it is before 4.1).
   ```css
   @import "tailwindcss";
   @import "@kleros/ui-components-library/theme.css";
   @source "../../node_modules/@kleros/ui-components-library";
   @custom-variant dark (&:where(.dark, .dark *));
   ```
4. Where the app imports the library's CSS (Court: `src/app.tsx`), keep `style.css` first and import `./index.css`
   right after it, then the app's own CSS. Drop the separate `theme.css` import: `index.css` brings it in through
   Tailwind, which also reads its `@theme` block.
   ```ts
   import "@kleros/ui-components-library/style.css";
   import "./index.css";
   import "./styles/base-elements.css"; // the app's own CSS, after
   ```
5. Dark mode: keep the app's own switch. The `dark` variant and the library tokens key on the `dark` class on
   `<html>`, which Court already sets (in `index.html` before first paint, and in its theme provider). Don't add
   `applyInitialTheme()` to an app that has its own switch.

Existing pages keep their look. The library's `style.css` already carries Tailwind's reset (its `@layer base`), so
adding Tailwind adds no new one, and the app's layered CSS keeps its place.

**Apps whose `eslint-disable` comments name `no-restricted-syntax` or `no-restricted-imports`.** The lint preset
reports its restrictions as `kleros-ui/no-restricted-syntax` and `kleros-ui/no-restricted-imports`, and the core
`no-restricted-syntax` and `no-restricted-imports` stay the app's own rules. So an `eslint-disable` comment that names
`no-restricted-syntax` does not silence the preset (ESLint calls it unused, and `--fix` deletes it). `ui:check` prints
a note for each one, with the id to write instead (`kleros-ui/no-restricted-syntax`); a baseline with no `"version"`
(recorded before the preset used these ids) keeps such errors from failing until `npm run ui:baseline` runs again. For
a block comment (`/* eslint-disable no-restricted-syntax */`), write the `kleros-ui/` id in its `eslint-enable` too
(the note names that line): an enable that still names the core id does not end the disable, which then runs to the
end of the file. The notes come from ESLint's report of unused `eslint-disable` comments, so an app whose lint config
sets `reportUnusedDisableDirectives` to `"off"` gets none, and those errors fail: find the comments, their
`eslint-enable` lines included, with `grep -rnE 'eslint-(disable|enable).*[^/]no-restricted-' src`.

## One package, three layers
| Layer | Import from | Contents |
|---|---|---|
| Core primitives | `@kleros/ui-components-library` | 43 components, plus `<Name>Props` and item types (`TabsItem`, `DropdownSelectItem`, `TimelineItem`) |
| App kit (shared by Kleros apps) | `@kleros/ui-components-library/kit` | Layout: `Page`, `Section`, `Stack`, `Inline`, `Grid`, `FormStack`. State: `QueryState`, `Skeleton`, `Spinner`, `EmptyState`, `ErrorState`, `InfoCard`. Status: `StatusBadge` (tones). Data: `StatCard`, `AddressDisplay`, `TokenAmount`, `DataTable`, `KeyValueList`, `Countdown`/`useCountdown`. Charts: `Sparkline`. Forms: `FormField`, `WizardShell`. App: `ExternalLink`, `HelpTooltip`, `ThemeToggle`, `applyInitialTheme`, `ChainGuard`. Helpers: `parseUnits`, `formatUnits`, `shortenAddress`, `useDarkMode`, `readToken`, `toneClasses`, `cn` |
| Recipes (copy, then edit) | `recipes/*.tsx` in this package | `evidence-list.tsx`: search, paginated list, loading and empty states, submit modal. `vote-form.tsx`: radio group, 18-decimal amount, async submit, result. `case-page.tsx`: stat row, tabs, timeline, address, dark mode |

Recipes compile against this exact version. Copy one into your app and change it; never import from `recipes/`.
Project-specific components stay in your app. When a second app needs one, propose it for the kit.

## Layout, state and status (use these instead of divs with classes)
- Page shell: `<Page title=... actions=...>`; blocks: `<Section title=... actions=...>`; vertical: `<Stack gap={4}>`;
  rows of buttons or tags: `<Inline gap={2}>`; card grids and stat rows: `<Grid minItemWidth={240} gap={4}>`;
  forms: `<FormStack actions={<><Button variant="secondary" .../><Button .../></>}>` (the buttons, secondary first; in
  one wrapper such as `<Inline>` they still fill a phone's width). `gap` only takes the steps 0 0.5 1 2 3 4 6 8 12 16.
- Every data view (a list, table or detail fed by data, real or mock) renders through
  `<QueryState isLoading isError data onRetry empty={{ title }}>{(data) => ...}</QueryState>`, which shows Skeleton
  rows, ErrorState or EmptyState for you. A real query passes its own flags and `refetch` as `onRetry`. Mock data
  passes its array with `isLoading={false}`: no fake delay and no fake error. The empty state shows whenever the
  array is empty, a filter with no match included.
- Coloured status or period: `<StatusBadge tone="success|warning|error|info|neutral|accent">`. Court periods:
  evidence info, commit neutral, vote accent, appeal warning, execution success. Never pick a colour per screen.
- Votes, tallies, rulings and appeals: list ruling 0, "Refuse to arbitrate", with its count and share, even at 0
  votes. Court's data already has it: Court's SDK (`populateTemplate` in `@kleros/kleros-sdk`) puts it first in a
  dispute's `answers` (`id` `0x0`, `reserved: true`). Add it yourself only when no answer has id 0 (a raw template, or
  mock data).
- Time left: `<Countdown deadline={date} />` (live, absolute UTC in its title) or `useCountdown(deadline)`. Under a
  fixed clock (mocks, stories, tests, screenshots), pass `now`: `<Countdown deadline={date} now={NOW} />` or
  `useCountdown(deadline, NOW)`. Both compute the time left from that moment and start no timer.
- Charts: kit `Sparkline` for a small trend line. On your own SVG chart, colour with `stroke-`/`fill-klerosUIComponents*`
  token classes (they follow dark mode with no JavaScript). `readToken("SecondaryText")` only for canvas and chart
  libraries that need a colour string; re-read it on theme change.

## Before you write UI by hand
- Stat tile: kit `StatCard`. Loading: kit `Skeleton` (lists, cards), kit `Spinner` (inline), `Button isLoading` (buttons).
- Facts as label and value rows (deal details, a review step): kit `KeyValueList`.
- Small trend chart of one series: kit `Sparkline`.
- Multi-step form (steps bar, Back/Next, a check per step, Submit): kit `WizardShell`. Its steps hold fields, not a form: the shell is the form.
- No results: kit `EmptyState`. Table: kit `DataTable`, with core `StandardPagination` under it.
- Address: kit `AddressDisplay` (short form, copy, full address in a tooltip). Token amount: kit `TokenAmount`, which
  takes the amount in the token's smallest unit (see "Shapes and traps").
- Notice: core `AlertMessage` (`variant`, `title`, `msg`), or kit `InfoCard` for free content.
- Label with help icon: kit `HelpTooltip`. Wallet or chain gate: kit `ChainGuard`. Dark mode switch: kit `ThemeToggle`.
  First theme (`?theme=light|dark`, else the system setting): kit `applyInitialTheme()` before the first render, as
  the starter's `main.tsx` does.
- Modal: core `Modal`. Step indicator only: core `Steps`. Select: core `DropdownSelect` (under a fixed clock, core
  `Radio` for a short list; see "Shapes and traps"). Radio group: core `Radio`.
  Date: core `Datepicker`. Progress: core `LinearProgress` or `CircularProgress`. Copy button: core `Copiable`.

## Shapes and traps
- `Button`: `text` is required. It is the label, or, when you pass children (an icon, a rich label), they show instead
  and `text` is the accessible name, so keep it plain words. Click with `onPress`, disable with `isDisabled`, busy
  with `isLoading`.
- `Card` and `Modal` are fixed at 328x200 px unless you pass `fluid`, which sizes them to their content and container.
  `Box` is fixed too: pass `className="h-auto w-full p-6"` (kit `StatCard` already does). Padding steps: 4 or 6 inside cards.
  Use a plain `Card` (3 px radius): `round` draws 18 px, and the lint flags it.
- `Tabs`: `items: {id, text, value, content}[]`, where `content` is the panel. `callback(key, value)`.
- `DropdownSelect`: `items: {id, text, itemValue}[]`, and `callback(item)` receives the whole item.
  `DropdownCascader` items use `label` (not `text`) and nest `children`.
- `DropdownSelect`'s option list scrolls with SimpleBar, which calls `Date.now()`. An app that must not read the clock
  (a fixed-clock mock, test or screenshot) uses core `Radio` for a short list instead.
- `Radio` is the group: `options: {label, value}[]`, `groupLabel`, `onChange(value: string)`.
- `Steps`: `items: {title, subitems?}[]` and `currentItemIndex`. `Timeline`: non-empty `items: {title, party, subtitle, variant?}[]`.
- A plain horizontal `Steps` is 250 px wide and centred: with four steps its titles overlap on a phone, and the first
  spills out of its card on a desktop. Pass `className="w-full"` (kit `WizardShell` already does).
- `StandardPagination` and `CompactPagination`: `currentPage` (from 1), `numPages`, `callback(page)`.
- `TextField`, `TextArea`, `Searchbar`: `onChange(value: string)`, not an event. Errors: `variant="error"` and `message`.
- `TextArea`'s textarea is 400 px wide, and `className` reaches only its wrapper. To fit the column, pass
  `className="w-full"` and `inputProps={{ className: "w-full" }}`.
- `Searchbar` and `TextField` are 278 px wide. To fit the column, pass `className="w-full"`: it reaches the wrapper
  that sets the width. Without it, a long placeholder is cut.
- The `DropdownSelect` trigger is 240 px wide, and no prop widens it: `className` reaches only its wrapper. Leave it at
  240 px; don't reach into it from CSS.
- `Tag` is a pill of fixed height that wraps a long label out of its box. Keep its labels to a word or two; show a file
  name or an address with another part. Like `Button`, `text` is required, and children (a dot next to a label) show
  instead of it, with `text` as the accessible name. `toggle` announces `active` as pressed.
- `BigNumberField`: `onChange(v)` gives a bignumber.js `BigNumber` in display units (ETH, not wei).
  Use `parseUnits(v.toFixed())` from the kit to get wei as a `bigint`. Show wei with kit `TokenAmount`.
- Kit `TokenAmount`: `value` is the amount in the token's smallest unit (wei for ETH), as a `bigint` or an integer
  string; a decimal string such as `"1.5"` throws. Put a decimal ETH amount through kit `parseUnits` first:
  `<TokenAmount value={parseUnits("1.5")} symbol="ETH" />`. A token with other decimals passes them to both:
  `parseUnits("12.5", 6)` and `decimals={6}`.
- `FileUploader`: `callback(file: File)`, plus `msg` and `variant`. `AlertMessage` takes no children.
- `LinearProgress` needs `value`; leave `width` (px) out to fill the container. `CircularProgress` needs `value`;
  `tone` sets its fill colour (default blue, green at 100%) and `aria-label` names it.
- `Modal` is controlled with `isOpen` and `onOpenChange(open)`. There is no `onClose` and no title prop.
- Names that do not exist: `Alert` (use `AlertMessage`), `RadioGroup` (`Radio`), `DatePicker` (`Datepicker`),
  `Pagination` (`StandardPagination`), `Field` (`TextField`), `Textarea` (`TextArea`).
  Nor do `ThemeProvider`, `lightTheme`, `darkTheme` or styled-components: those were v2.

## Check your work
Run `npm run ui:check`. On a type error, open the component's `.d.ts` under `dist/lib/` (or `dist/kit/`): its JSDoc
has the defaults and an example. On a lint error, the message names the token or component to use.

A pull request's reviewer goes through `agent/REVIEW.md`: the setup, `ui:check`, tokens only in the theme file, new
components with intent words, no raw controls. Go through it yourself before you open one.

## Wire this guide into an app
`npx kleros-ui init` (`create` runs it for you) writes a short block into the app's `AGENTS.md` (between `kleros-ui`
markers), `@AGENTS.md` in `CLAUDE.md`, a Cursor rule, `kleros-ui.json`, the lint preset and the `ui:check` script.
